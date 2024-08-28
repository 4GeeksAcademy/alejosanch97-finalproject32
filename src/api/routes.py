"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, Users, Projects, Tasks, Enterprises, Roles, Sub_tasks, ProjectMembers
from api.utils import generate_sitemap, APIException, set_password
from flask_cors import CORS
from datetime import datetime, timezone

from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash
import requests
from base64 import b64encode
import os

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

def check_password(hash_password, password, salt):
    return check_password_hash(hash_password, f"{password}{salt}")

#ruta roles
@api.route('/default_roles', methods=['POST'])
def create_roles():
    roles = [
        {"name": "Usuario"},
        {"name": "Administrador"},
        # Agrega más roles según sea necesario
    ]
    
    for role in roles:
        existing_role = Roles.query.filter_by(name=role["name"]).first()
        if not existing_role:
            new_role = Roles(name=role["name"])
            db.session.add(new_role)
    
    db.session.commit()
    return jsonify({"message":"rol creado"})


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200

#ruta para añadir un usuario
@api.route('/user', methods=["POST"])
def add_user():
    body = request.json
    user_data = body.get("user", {})
    enterprise_data = body.get("enterprise", {})

    # Validación de campos requeridos
    if not all([user_data.get("email"), user_data.get("password"), user_data.get("last_name")]):
        return jsonify({"message": "Se requieren email, contraseña y apellido"}), 400

    # Verificar si el usuario ya existe
    existing_user = Users.query.filter_by(email=user_data.get("email")).one_or_none()
    if existing_user:
        return jsonify({"message": "El usuario ya existe"}), 400

    # Crear la empresa si no existe
    enterprise = None
    if enterprise_data:
        enterprise = Enterprises.query.filter_by(name=enterprise_data.get("name")).first()
        if not enterprise:
            enterprise = Enterprises(
                name=enterprise_data.get("name"),
                address=enterprise_data.get("address")
            )
            db.session.add(enterprise)
            db.session.flush()  # Asigna un ID a la empresa

    # Crear el nuevo usuario
    try:
        salt = b64encode(os.urandom(32)).decode("utf-8")
        hashed_password = set_password(user_data.get("password"), salt)

        new_user = Users(
            role_id=user_data.get("role_id"),
            email=user_data.get("email"),
            username=user_data.get("username"),
            password=hashed_password,
            first_name=user_data.get("first_name"),
            last_name=user_data.get("last_name"),
            enterprise_id=enterprise.id if enterprise else None,
            salt=salt
        )

        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "Usuario y empresa creados exitosamente"}), 201

    except Exception as error:
        db.session.rollback()
        print(f"Error al crear usuario: {str(error)}")
        return jsonify({"message": f"Error al crear usuario: {str(error)}"}), 500

#get user
@api.route('/user', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()
    user = Users.query.get(current_user_id)
    if user:
        user_data = user.serialize()
        user_data['organization_name'] = user.enterprise.name  # Añadimos el nombre de la organización
        return jsonify(user_data), 200
    else:
        return jsonify({"message": "Usuario no encontrado"}), 404


#get all users
@api.route('/users', methods=["GET"])
def get_all_users():
    users = Users()
    users = users.query.all()
    users = list(map(lambda item: item.serialize(), users))

    return jsonify(users , 200)

# get users by id
@api.route('/user/<int:user_id>', methods=["GET"])
def get_user(user_id):
    user = Users()
    user = user.query.get(user_id)

    if user is None:
        raise APIException("User not found", status_code=404)
    else:
        return jsonify(user.serialize())

#get users by organization
@api.route('/organization-users', methods=['GET'])
@jwt_required()
def get_organization_users():
    current_user_id = get_jwt_identity()
    current_user = Users.query.get(current_user_id)
    if not current_user:
        return jsonify({"message": "Usuario no encontrado"}), 404
    
    organization_users = Users.query.filter_by(enterprise_id=current_user.enterprise_id).all()
    
    users_data = [{
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "username": user.username,
        "role_id": user.role_id
    } for user in organization_users]
    
    return jsonify(users_data), 200

#projects
# Get all projects for the current user
@api.route('/projects', methods=['GET'])
@jwt_required()
def get_projects():
    current_user_id = get_jwt_identity()
    user = Users.query.get(current_user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    projects = Projects.query.filter_by(enterprise_id=user.enterprise_id).all()
    return jsonify([project.serialize() for project in projects]), 200

# Create a new project
@api.route('/projects', methods=['POST'])
@jwt_required()
def add_project():
    current_user_id = get_jwt_identity()
    data = request.json

    # Obtén el enterprise_id del usuario actual si no se proporciona en los datos
    if 'enterprise_id' not in data:
        current_user = Users.query.get(current_user_id)
        enterprise_id = current_user.enterprise_id
    else:
        enterprise_id = data['enterprise_id']

    new_project = Projects(
        name=data['name'],
        description=data['description'],
        start_date=datetime.fromisoformat(data['start_date']),
        end_date=datetime.fromisoformat(data['end_date']),
        enterprise_id=data['enterprise_id'],
        user_id=current_user_id
    )

    db.session.add(new_project)
    db.session.commit()

    return jsonify(new_project.serialize()), 201

@api.route('/projects/<int:project_id>/tasks', methods=['POST'])
@jwt_required()
def create_task(project_id):
    current_user_id = get_jwt_identity()
    data = request.json

    # Verificar si el proyecto existe y pertenece al usuario o su empresa
    project = Projects.query.filter_by(id=project_id, enterprise_id=Users.query.get(current_user_id).enterprise_id).first()
    if not project:
        return jsonify({"message": "Project not found or access denied"}), 404

    new_task = Tasks(
        project_id=project_id,
        user_id=current_user_id,
        name=data['name'],
        description=data.get('description', ''),
        status=data.get('status', 'Pending'),
        due_date=datetime.fromisoformat(data['due_date']),
        creation_date=datetime.now(timezone.utc)
    )

    db.session.add(new_task)
    db.session.commit()

    return jsonify(new_task.serialize()), 201

@api.route('/projects/<int:project_id>/tasks', methods=['GET'])
@jwt_required()
def get_project_tasks(project_id):
    current_user_id = get_jwt_identity()

    # Verificar si el proyecto existe y pertenece al usuario o su empresa
    project = Projects.query.filter_by(id=project_id, enterprise_id=Users.query.get(current_user_id).enterprise_id).first()
    if not project:
        return jsonify({"message": "Project not found or access denied"}), 404

    tasks = Tasks.query.filter_by(project_id=project_id).all()
    return jsonify([task.serialize() for task in tasks]), 200

@api.route('/tasks/<int:task_id>/subtasks', methods=['POST'])
@jwt_required()
def create_subtask(task_id):
    data = request.json

    new_subtask = SubTasks(
        task_id=task_id,
        name=data['name'],
        description=data['description'],
        due_date=datetime.fromisoformat(data['due_date'])
    )

    db.session.add(new_subtask)
    db.session.commit()

    return jsonify(new_subtask.serialize()), 201

@api.route('/projects/<int:project_id>/members', methods=['POST'])
@jwt_required()
def add_project_member(project_id):
    data = request.json
    user_id = data['user_id']

    new_member = ProjectMembers(
        project_id=project_id,
        user_id=user_id
    )

    db.session.add(new_member)
    db.session.commit()

    return jsonify(new_member.serialize()), 201

@api.route('/tasks/<int:task_id>', methods=['PATCH'])
@jwt_required()
def update_task_status(task_id):
    data = request.json
    task = Tasks.query.get(task_id)

    if not task:
        return jsonify({"message": "Task not found"}), 404

    task.status = data['status']
    db.session.commit()

    return jsonify(task.serialize()), 200



#Login
@api.route("/login", methods=["POST"])
def login():
    body = request.json
    email = body.get("email", None)
    password = body.get("password", None)
    if email is None or password is None:
        return jsonify("you need an the email and a password"), 400
    else:
        user = Users()
        user = user.query.filter_by(email=email).one_or_none()
        if user is None:
            return jsonify({"message":"bad email"}), 400
        else:
            if check_password(user.password, password, user.salt):
                token = create_access_token(identity=user.id)
                return jsonify({"token":token}), 200
            else:
                return jsonify({"message":"bad password"}), 400

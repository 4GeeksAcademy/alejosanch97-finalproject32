"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, Users, Projects, Tasks, Enterprises
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

@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200

#Get all tasks.
@api.route('/task', methods=['GET'])
@jwt_required()
def get_user_tasks():
    current_user_id = get_jwt_identity()
    tasks = Tasks.query.filter_by(user_id=current_user_id).all()
    return jsonify([task.serialize() for task in tasks]), 200

#Get one task.
@api.route('/task/<int:id>', methods=['GET'])
def get_one_task():
    task = Tasks.query.filter_by(id=id).one_or_none()
    return jsonify({"task":task})

#Post task.
@api.route('/task/<int:enterprise_id>', methods=['POST'])
def add_task(enterprise_id):
    data = request.json
    task_name = data.get("name", None)
    task_description = data.get("description", None)
    task_due_date = data.get("due_date", None)
    if task_name is None:
        return jsonify({"error":"The task sould have a name"})
    task = Tasks(
        name= task_name,
        description= task_description,
        due_date = task_due_date,
        status = "Pending.",
        enterprise_id = enterprise_id
    )

    try:
        db.session.add(task)
        db.session.commit()
        return jsonify({"message":"task created"})
    except Exception as error:
        print(error.args)
        db.session.rollback()
        return jsonify({"message":error})

@api.route('/user', methods=["POST"])
def add_user():
    body = request.json
    first_name = body.get("first_name", None)
    last_name = body.get("last_name", None)
    username = body.get("username", None)
    email = body.get("email", None)
    password = body.get("password", None)
    role_id = body.get("role_id", None)
    enterprise_id = body.get("enterprise_id", None)
    organization_name = body.get("organization_name", None)

    if email is None or password is None or last_name is None:
        return jsonify("you need an the email and a password"), 400
    else:
        user = Users.query.filter_by(email=email).one_or_none()
        if user is not None :
            return jsonify("user existe"), 400
        
        # Verificar si la empresa existe, si no, crearla
    if enterprise_id:
        enterprise = Enterprises.query.get(enterprise_id)
        if not enterprise:
            if organization_name:
                new_enterprise = Enterprises(id=enterprise_id, name=organization_name)
                db.session.add(new_enterprise)
                db.session.flush()  # Esto asigna un ID si es auto-incrementable
            else:
                return jsonify({"message": "La empresa no existe y no se proporcionó un nombre para crearla"}), 400
            
        salt = b64encode(os.urandom(32)).decode("utf-8")
        password = set_password(password, salt)
        user = Users(
                role_id = role_id,
                email=email,
                username= username,
                password=password,
                first_name = first_name,
                last_name=last_name,
                enterprise_id=enterprise_id,
                organization_name=organization_name,
                salt=salt)
        try:
            db.session.add(user)
            db.session.commit()
            return jsonify({"message":"User created"}), 201
        except Exception as error:
            print(error.args)
            db.session.rollback()
            return jsonify({"message":f"error: {error}"}), 500

#get user
@api.route('/user', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()
    user = Users.query.get(current_user_id)
    if user:
        return jsonify(user.serialize()), 200
    else:
        return jsonify({"message": "User not found"}), 404


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
    
    organization_users = Users.query.filter_by(organization_name=current_user.organization_name).all()
    
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
def get_user_projects():
    current_user_id = get_jwt_identity()
    projects = Projects.query.filter_by(user_id=current_user_id).all()
    return jsonify([project.serialize() for project in projects]), 200

# Create a new project
@api.route('/projects', methods=['POST'])
@jwt_required()
def create_project():
    current_user_id = get_jwt_identity()
    data = request.json

    if not all(key in data for key in ('name', 'description', 'end_date', 'enterprise_id')):
        return jsonify({"message": "Missing required fields"}), 400

    try:
        new_project = Projects(
            name=data['name'],
            description=data['description'],
            start_date=datetime.now(timezone.utc),
            end_date=datetime.strptime(data['end_date'], '%Y-%m-%d').replace(tzinfo=timezone.utc),
            enterprise_id=data['enterprise_id'],
            user_id=current_user_id
        )

        db.session.add(new_project)
        db.session.commit()
        return jsonify(new_project.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error creating project", "error": str(e)}), 500

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

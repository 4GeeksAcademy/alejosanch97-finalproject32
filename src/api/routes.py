"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, Users, Projects, Tasks, Enterprises, Roles, Sub_tasks, ProjectMembers
from api.utils import generate_sitemap, APIException, set_password
from flask_cors import CORS
from datetime import datetime, timezone, timedelta

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
            avatar=user_data.get("avatar")
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
    

#edit user
@api.route('/user/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    current_user_id = get_jwt_identity()
    current_user = Users.query.get(current_user_id)
    
    # Verificar si el usuario actual es un administrador
    if current_user.role_id not in [1, 2]:
        return jsonify({"message": "No tienes permisos para realizar esta acción"}), 403
    
    user_to_update = Users.query.get(user_id)
    if not user_to_update:
        return jsonify({"message": "Usuario no encontrado"}), 404

    data = request.json
    
    # Actualizar los campos del usuario
    user_to_update.first_name = data.get('first_name', user_to_update.first_name)
    user_to_update.last_name = data.get('last_name', user_to_update.last_name)
    user_to_update.username = data.get('username', user_to_update.username)
    user_to_update.email = data.get('email', user_to_update.email)
    
    # Si el usuario actual tiene rol 1 (admin), permitir editar todos los campos
    if current_user.role_id == 1:
        user_to_update.role_id = data.get('role_id', user_to_update.role_id)
           
        
    # Si se proporciona una nueva contraseña, actualizarla
    if 'password' in data and data['password']:
        salt = b64encode(os.urandom(32)).decode("utf-8")
        hashed_password = set_password(data['password'], salt)
        user_to_update.password = hashed_password
        user_to_update.salt = salt

    try:
        db.session.commit()
        return jsonify({"message": "Usuario actualizado con éxito"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error al actualizar usuario: {str(e)}"}), 500

# delete user
@api.route('/user/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    current_user_id = get_jwt_identity()
    current_user = Users.query.get(current_user_id)
    
    # Verificar si el usuario actual es un administrador
    if current_user.role_id != 1:
        return jsonify({"message": "No tienes permisos para realizar esta acción"}), 403
    
    user_to_delete = Users.query.get(user_id)
    if not user_to_delete:
        return jsonify({"message": "Usuario no encontrado"}), 404

    # Evitar que un administrador se elimine a sí mismo
    if user_to_delete.id == current_user_id:
        return jsonify({"message": "No puedes eliminarte a ti mismo"}), 400

    try:
        # Eliminar entradas relacionadas en project_members
        ProjectMembers.query.filter_by(user_id=user_id).delete()
        
        # Ahora podemos eliminar el usuario
        db.session.delete(user_to_delete)
        db.session.commit()
        return jsonify({"message": "Usuario eliminado con éxito"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error al eliminar usuario: {str(e)}"}), 500


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

    # Si el usuario es administrador, obtiene todos los proyectos de la empresa
    if user.role_id == 1:  # Asumiendo que role_id 1 es para administradores
        projects = Projects.query.filter_by(enterprise_id=user.enterprise_id).all()
    else:
        # Para usuarios normales, obtener proyectos donde son miembros o creadores
        projects = Projects.query.join(ProjectMembers, Projects.id == ProjectMembers.project_id)\
            .filter(
                (Projects.enterprise_id == user.enterprise_id) &
                ((ProjectMembers.user_id == current_user_id) | (Projects.user_id == current_user_id))
            ).distinct().all()

    return jsonify([project.serialize() for project in projects]), 200

# Create a new project
@api.route('/projects', methods=['POST'])
@jwt_required()
def add_project():
    current_user_id = get_jwt_identity()
    data = request.json
    
    # Obtén el enterprise_id del usuario actual si no se proporciona en los datos
    current_user = Users.query.get(current_user_id)
    if not current_user:
        return jsonify({"message": "Usuario no encontrado"}), 404
    
    enterprise_id = data.get('enterprise_id', current_user.enterprise_id)

    new_project = Projects(
        name=data['name'],
        description=data['description'],
        start_date=datetime.fromisoformat(data['start_date']),
        end_date=datetime.fromisoformat(data['end_date']),
        enterprise_id=enterprise_id,
        user_id=current_user_id
    )

    db.session.add(new_project)
    db.session.flush()  # This assigns an ID to new_project

    # Añadir al creador como miembro del proyecto
    new_member = ProjectMembers(
        project_id=new_project.id,
        user_id=current_user_id
    )
    db.session.add(new_member)

    db.session.commit()

    return jsonify(new_project.serialize()), 201

@api.route('/project/<int:project_id>', methods=['PUT'])
@jwt_required()
def update_or_delete_project(project_id):
    current_user_id = get_jwt_identity()
    current_user = Users.query.get(current_user_id)
    project = Projects.query.get(project_id)
    
    if not project:
        return jsonify({"message": "Project not found"}), 404
    
    # Permitir acceso si el usuario es el creador del proyecto o es un administrador
    if project.user_id != current_user_id and current_user.role_id != 1:  # Asumiendo que role_id 1 es para administradores
        return jsonify({"message": "Unauthorized access"}), 403

    if request.method == 'PUT':
        data = request.json
        project.name = data.get('name', project.name)
        project.description = data.get('description', project.description)
        project.start_date = datetime.fromisoformat(data['start_date']) if 'start_date' in data else project.start_date
        project.end_date = datetime.fromisoformat(data['end_date']) if 'end_date' in data else project.end_date

        db.session.commit()
        return jsonify(project.serialize()), 200
    
@api.route('/project/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    current_user_id = get_jwt_identity()
    current_user = Users.query.get(current_user_id)
    project = Projects.query.get(project_id)
    
    if not project:
        return jsonify({"message": "Project not found"}), 404
    
    # Permitir acceso si el usuario es el creador del proyecto o es un administrador
    if project.user_id != current_user_id and current_user.role_id != 1:  # Asumiendo que role_id 1 es para administradores
        return jsonify({"message": "Unauthorized access"}), 403

    try:
        # Delete related tasks
        Tasks.query.filter_by(project_id=project_id).delete()
        
        # Delete related project members
        ProjectMembers.query.filter_by(project_id=project_id).delete()
        
        # Now we can safely delete the project
        db.session.delete(project)
        db.session.commit()
        return jsonify({"message": "Project and related data deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error deleting project: {str(e)}"}), 500

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
            
#rutas task y member tasks
@api.route('/project/<int:project_id>/tasks', methods=['GET', 'POST'])
@jwt_required()
def project_tasks(project_id):
    current_user_id = get_jwt_identity()
    project = Projects.query.get(project_id)
    
    if not project:
        return jsonify({"message": "Proyecto no encontrado"}), 404
    
    # Verificar si el usuario es el creador del proyecto o un miembro
    is_creator = project.user_id == current_user_id
    is_member = ProjectMembers.query.filter_by(project_id=project_id, user_id=current_user_id).first() is not None
    
    if not (is_creator or is_member):
        return jsonify({"message": "No tienes acceso a este proyecto"}), 403

    if request.method == 'GET':
        tasks = Tasks.query.filter_by(project_id=project_id).all()
        return jsonify([task.serialize() for task in tasks]), 200
    
    elif request.method == 'POST':
        data = request.json
        new_task = Tasks(
            project_id=project_id,
            user_id=current_user_id,
            name=data['name'],
            description=data['description'],
            status=data['status'],
            due_date=datetime.fromisoformat(data['due_date'])
        )
        db.session.add(new_task)
        db.session.commit()
        return jsonify(new_task.serialize()), 201

@api.route('/project/<int:project_id>/members', methods=['POST'])
@jwt_required()
def add_project_member(project_id):
    current_user_id = get_jwt_identity()
    project = Projects.query.get(project_id)
    
    if not project:
        return jsonify({"message": "Proyecto no encontrado"}), 404
    
    if project.user_id != current_user_id:
        return jsonify({"message": "Solo el creador del proyecto puede añadir miembros"}), 403
    
    data = request.json
    email = data.get('email')
    
    if not email or not isinstance(email, str):
        return jsonify({"message": "Se requiere un email válido"}), 400
    
    user = Users.query.filter_by(email=email, enterprise_id=project.enterprise_id).first()
    
    if not user:
        return jsonify({"message": "Usuario no encontrado en la organización"}), 404
    
    existing_member = ProjectMembers.query.filter_by(project_id=project_id, user_id=user.id).first()
    if existing_member:
        return jsonify({"message": "El usuario ya es miembro de este proyecto"}), 400
    
    new_member = ProjectMembers(
        project_id=project_id,
        user_id=user.id
    )
    db.session.add(new_member)
    db.session.commit()
    
    return jsonify({
        "id": new_member.id,
        "user_id": new_member.user_id,
        "email": user.email
    }), 201

@api.route('/project/<int:project_id>/members', methods=['GET'])
@jwt_required()
def get_project_members(project_id):
    current_user_id = get_jwt_identity()
    project = Projects.query.get(project_id)
    
    if not project:
        return jsonify({"message": "Proyecto no encontrado"}), 404
    
    # Verificar si el usuario es el creador del proyecto o un miembro
    is_creator = project.user_id == current_user_id
    is_member = ProjectMembers.query.filter_by(project_id=project_id, user_id=current_user_id).first() is not None
    
    if not (is_creator or is_member):
        return jsonify({"message": "No tienes acceso a este proyecto"}), 403

    members = ProjectMembers.query.filter_by(project_id=project_id).all()
    member_data = []
    for member in members:
        user = Users.query.get(member.user_id)
        if user:
            member_data.append({
                "id": member.id,
                "user_id": user.id,
                "email": user.email,
                "name": f"{user.first_name} {user.last_name}"
            })
    
    return jsonify(member_data), 200

@api.route('/project/<int:project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    current_user_id = get_jwt_identity()
    project = Projects.query.get(project_id)
    
    if not project or not ProjectMembers.query.filter_by(project_id=project_id, user_id=current_user_id).first():
        return jsonify({"message": "Proyecto no encontrado o no tienes acceso"}), 404

    return jsonify(project.serialize()), 200
            
#task in projects
@api.route('/all-tasks-with-projects', methods=['GET'])
@jwt_required()
def get_all_tasks_with_projects():
    current_user_id = get_jwt_identity()
    user = Users.query.get(current_user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    # Si el usuario es administrador, obtiene todas las tareas de la empresa
    if user.role_id == 1:  # Asumiendo que role_id 1 es para administradores
        tasks = Tasks.query.join(Projects).filter(Projects.enterprise_id == user.enterprise_id).all()
    else:
        # Para usuarios normales, obtener tareas de proyectos donde son miembros o creadores
        tasks = Tasks.query.join(Projects).join(ProjectMembers, Projects.id == ProjectMembers.project_id)\
            .filter(
                (Projects.enterprise_id == user.enterprise_id) &
                ((ProjectMembers.user_id == current_user_id) | (Projects.user_id == current_user_id))
            ).all()

    tasks_with_projects = []
    for task in tasks:
        tasks_with_projects.append({
            "task_id": task.id,
            "task_name": task.name,
            "task_description": task.description,
            "task_status": task.status,
            "task_due_date": task.due_date.isoformat(),
            "project_id": task.project_id,
            "project_name": task.project.name
        })

    return jsonify(tasks_with_projects), 200

@api.route('/task/<int:task_id>', methods=['PUT', 'DELETE'])
@jwt_required()
def update_or_delete_task(task_id):
    current_user_id = get_jwt_identity()
    task = Tasks.query.get(task_id)
    
    if not task:
        return jsonify({"message": "Task not found"}), 404
    
    project = Projects.query.get(task.project_id)
    if not project or (project.user_id != current_user_id and not ProjectMembers.query.filter_by(project_id=project.id, user_id=current_user_id).first()):
        return jsonify({"message": "Unauthorized access"}), 403

    if request.method == 'PUT':
        data = request.json
        old_status = task.status
        task.name = data.get('name', task.name)
        task.description = data.get('description', task.description)
        task.status = data.get('status', task.status)
        task.due_date = datetime.fromisoformat(data['due_date']) if 'due_date' in data else task.due_date

        if old_status != task.status:
            task.last_status_change_by = current_user_id
            task.last_status_change_at = datetime.utcnow()

        db.session.commit()
        return jsonify(task.serialize()), 200

    elif request.method == 'DELETE':
        db.session.delete(task)
        db.session.commit()
        return jsonify({"message": "Task deleted successfully"}), 200
    
#dashboard 

@api.route('/dashboard/project-progress', methods=['GET'])
@jwt_required()
def get_project_progress():
    projects = Projects.query.filter_by(enterprise_id=get_jwt_identity()).all()
    progress_data = []
    for project in projects:
        tasks = Tasks.query.filter_by(project_id=project.id).all()
        total_tasks = len(tasks)
        completed_tasks = len([task for task in tasks if task.status == 'Completed'])
        progress = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        progress_data.append({
            'project_name': project.name,
            'progress': progress
        })
    return jsonify(progress_data)

@api.route('/dashboard/task-completion-rate', methods=['GET'])
@jwt_required()
def get_task_completion_rate():
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    tasks = Tasks.query.filter(Tasks.created_at.between(start_date, end_date)).all()
    completion_data = {}
    for task in tasks:
        week = task.created_at.isocalendar()[1]
        if week not in completion_data:
            completion_data[week] = {'total': 0, 'completed': 0}
        completion_data[week]['total'] += 1
        if task.status == 'Completed':
            completion_data[week]['completed'] += 1
    
    result = [{'week': week, 'rate': data['completed'] / data['total'] if data['total'] > 0 else 0} 
              for week, data in completion_data.items()]
    return jsonify(result)

@api.route('/dashboard/task-distribution', methods=['GET'])
@jwt_required()
def get_task_distribution():
    tasks = Tasks.query.filter_by(enterprise_id=get_jwt_identity()).all()
    distribution = {'Pending': 0, 'In Progress': 0, 'Completed': 0}
    for task in tasks:
        distribution[task.status] += 1
    return jsonify(distribution)

@api.route('/dashboard/user-productivity', methods=['GET'])
@jwt_required()
def get_user_productivity():
    users = Users.query.filter_by(enterprise_id=get_jwt_identity()).all()
    productivity_data = []
    for user in users:
        completed_tasks = Tasks.query.filter_by(user_id=user.id, status='Completed').count()
        productivity_data.append({
            'user_name': f"{user.first_name} {user.last_name}",
            'completed_tasks': completed_tasks
        })
    return jsonify(productivity_data)

@api.route('/dashboard/gantt-data', methods=['GET'])
@jwt_required()
def get_gantt_data():
    projects = Projects.query.filter_by(enterprise_id=get_jwt_identity()).all()
    gantt_data = []
    for project in projects:
        tasks = Tasks.query.filter_by(project_id=project.id).all()
        for task in tasks:
            gantt_data.append({
                'task': task.name,
                'start': task.created_at.isoformat(),
                'end': task.due_date.isoformat(),
                'project': project.name
            })
    return jsonify(gantt_data)
            


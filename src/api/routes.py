"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, Users, Projects, Tasks, Enterprises, Roles, Sub_tasks, ProjectMembers, TaskComments, ProjectComments
from api.utils import generate_sitemap, APIException, set_password
from flask_cors import CORS
from datetime import datetime, timezone, timedelta
from sqlalchemy import func
import cloudinary.uploader as uploader

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
    user_data = {
        'first_name': request.form.get('first_name'),
        'last_name': request.form.get('last_name'),
        'username': request.form.get('username'),
        'email': request.form.get('email'),
        'password': request.form.get('password'),
        'role_id': request.form.get('role_id'),
        'enterprise_id': request.form.get('enterprise_id')
    }
    enterprise_data = {
        'name': request.form.get('organization_name') or request.form.get('name'),
        'address': request.form.get('organization_address') or request.form.get('address')
    }

    print("User data:", user_data)
    print("Enterprise data:", enterprise_data)

    if not user_data.get("email") or not user_data.get("password") or not user_data.get("last_name"):
        return jsonify({"message": "Se requieren email, contraseña y apellido"}), 400

    # Verificar si el usuario ya existe
    existing_user = Users.query.filter_by(email=user_data.get("email")).one_or_none()
    if existing_user:
        return jsonify({"message": "El usuario ya existe"}), 400

    # Obtener la empresa existente o crear una nueva si no existe
    enterprise = None
    if enterprise_data.get("name"):
        enterprise = Enterprises.query.filter_by(name=enterprise_data.get("name")).first()
        if enterprise is None:
            try:
                enterprise = Enterprises(
                    name=enterprise_data.get("name"),
                    address=enterprise_data.get("address")
                )
                db.session.add(enterprise)
                db.session.commit()
            except Exception as error:
                print(error.args)
                return jsonify({"message": f"Error al crear la empresa: {str(error)}"}), 500
    
    # Si no se proporcionó un enterprise_id, usar el id de la empresa recién creada o encontrada
    if not user_data.get('enterprise_id') and enterprise:
        user_data['enterprise_id'] = enterprise.id
    
    # Si aún no tenemos enterprise_id, devolver un error
    if not user_data.get('enterprise_id'):
        return jsonify({"message": "Se requiere enterprise_id o información de la empresa"}), 400

    try:
        salt = b64encode(os.urandom(32)).decode("utf-8")
        hashed_password = set_password(user_data.get("password"), salt)

        avatar_url = None
        avatar_public_id = None
        if 'avatar' in request.files:
            avatar_file = request.files['avatar']
            if avatar_file.filename != '':
                # Cloudinary upload
                result_cloud = uploader.upload(avatar_file)
                avatar_url = result_cloud.get("secure_url")
                avatar_public_id = result_cloud.get("public_id")

        new_user = Users(
            role_id=user_data.get("role_id"),
            email=user_data.get("email"),
            username=user_data.get("username"),
            password=hashed_password,
            first_name=user_data.get("first_name"),
            last_name=user_data.get("last_name"),
            enterprise_id=user_data.get("enterprise_id"),
            salt=salt,
            avatar=avatar_url,
            avatar_public_id=avatar_public_id
        )

        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "Usuario creado exitosamente"}), 201

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
    
    # Verificar si el usuario actual es un administrador o el propietario del perfil
    if current_user.role_id not in [1, 2] and current_user_id != user_id:
        return jsonify({"message": "No tienes permisos para realizar esta acción"}), 403
    
    user_to_update = Users.query.get(user_id)
    if not user_to_update:
        return jsonify({"message": "Usuario no encontrado"}), 404

    # Actualizar los campos del usuario
    user_to_update.first_name = request.form.get('first_name', user_to_update.first_name)
    user_to_update.last_name = request.form.get('last_name', user_to_update.last_name)
    user_to_update.username = request.form.get('username', user_to_update.username)
    user_to_update.email = request.form.get('email', user_to_update.email)
    
    # Si el usuario actual tiene rol 1 (admin), permitir editar todos los campos
    if current_user.role_id == 1:
        user_to_update.role_id = request.form.get('role_id', user_to_update.role_id)
    
    # Si se proporciona una nueva contraseña, actualizarla
    new_password = request.form.get('password')
    if new_password:
        salt = b64encode(os.urandom(32)).decode("utf-8")
        hashed_password = set_password(new_password, salt)
        user_to_update.password = hashed_password
        user_to_update.salt = salt

    # Manejar la actualización de la imagen de perfil
    if 'avatar' in request.files:
        avatar_file = request.files['avatar']
        if avatar_file.filename != '':
            # Eliminar la imagen anterior de Cloudinary si existe
            if user_to_update.avatar_public_id:
                uploader.destroy(user_to_update.avatar_public_id)
            
            # Subir la nueva imagen a Cloudinary
            result_cloud = uploader.upload(avatar_file)
            user_to_update.avatar = result_cloud.get("secure_url")
            user_to_update.avatar_public_id = result_cloud.get("public_id")

    try:
        db.session.commit()
        return jsonify({
            "message": "Usuario actualizado con éxito",
            "user": {
                "id": user_to_update.id,
                "first_name": user_to_update.first_name,
                "last_name": user_to_update.last_name,
                "username": user_to_update.username,
                "email": user_to_update.email,
                "role_id": user_to_update.role_id,
                "avatar": user_to_update.avatar
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error al actualizar usuario: {str(e)}"}), 500


@api.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    email = data.get('email')
    new_password = data.get('newPassword')

    if not email or not new_password:
        return jsonify({"message": "Se requieren email y nueva contraseña"}), 400

    user = Users.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "Usuario no encontrado"}), 404

    try:
        salt = b64encode(os.urandom(32)).decode("utf-8")
        hashed_password = set_password(new_password, salt)
        
        user.password = hashed_password
        user.salt = salt
        
        db.session.commit()
        
        # Crear un nuevo token para el usuario
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            "message": "Contraseña restablecida con éxito",
            "token": access_token
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error al restablecer la contraseña: {str(e)}"}), 500


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
        "avatar": user.avatar,
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
        user_id=current_user_id,
        priority=data.get('priority', 'medium')
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
        project.priority = data.get('priority', project.priority)

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
        # Eliminar comentarios de tareas asociados al proyecto
        TaskComments.query.filter(TaskComments.task_id.in_(
            Tasks.query.with_entities(Tasks.id).filter_by(project_id=project_id)
        )).delete(synchronize_session=False)
        
        # Eliminar tareas asociadas al proyecto
        Tasks.query.filter_by(project_id=project_id).delete()
        
        # Eliminar miembros del proyecto
        ProjectMembers.query.filter_by(project_id=project_id).delete()
        
        # Finalmente, eliminar el proyecto
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
            due_date=datetime.fromisoformat(data['due_date']),
            priority=data.get('priority', 'medium')
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
        task.priority = data.get('priority', task.priority)

        if old_status != task.status:
            task.last_status_change_by = current_user_id
            task.last_status_change_at = datetime.utcnow()

            # Verificar si todas las tareas del proyecto están completadas
            all_tasks_completed = all(t.status == 'Completed' for t in project.tasks)
            if all_tasks_completed and project.completed_at is None:
             project.completed_at = datetime.utcnow()

        db.session.commit()
        return jsonify(task.serialize()), 200

    elif request.method == 'DELETE':
        db.session.delete(task)
        db.session.commit()
        return jsonify({"message": "Task deleted successfully"}), 200
    
# comments
# Nuevas rutas para comentarios de proyectos
@api.route('/project/<int:project_id>/comments', methods=['POST'])
@jwt_required()
def add_project_comment(project_id):
    current_user_id = get_jwt_identity()
    project = Projects.query.get(project_id)
    
    if not project:
        return jsonify({"message": "Proyecto no encontrado"}), 404
    
    is_member = ProjectMembers.query.filter_by(project_id=project_id, user_id=current_user_id).first() is not None
    
    if not is_member:
        return jsonify({"message": "No tienes acceso a este proyecto"}), 403

    data = request.json
    new_comment = ProjectComments(
        project_id=project_id,
        user_id=current_user_id,
        content=data['content']
    )
    db.session.add(new_comment)
    db.session.commit()
    return jsonify(new_comment.serialize()), 201

@api.route('/project/<int:project_id>/comments', methods=['GET'])
@jwt_required()
def get_project_comments(project_id):
    current_user_id = get_jwt_identity()
    project = Projects.query.get(project_id)
    
    if not project:
        return jsonify({"message": "Proyecto no encontrado"}), 404
    
    is_member = ProjectMembers.query.filter_by(project_id=project_id, user_id=current_user_id).first() is not None
    
    if not is_member:
        return jsonify({"message": "No tienes acceso a este proyecto"}), 403

    comments = ProjectComments.query.filter_by(project_id=project_id).order_by(ProjectComments.created_at.desc()).all()
    return jsonify([comment.serialize() for comment in comments]), 200

# Nuevas rutas para comentarios de tareas
@api.route('/task/<int:task_id>/comments', methods=['POST'])
@jwt_required()
def add_task_comment(task_id):
    current_user_id = get_jwt_identity()
    task = Tasks.query.get(task_id)
    
    if not task:
        return jsonify({"message": "Tarea no encontrada"}), 404
    
    project = Projects.query.get(task.project_id)
    is_member = ProjectMembers.query.filter_by(project_id=project.id, user_id=current_user_id).first() is not None
    
    if not is_member:
        return jsonify({"message": "No tienes acceso a esta tarea"}), 403

    data = request.json
    new_comment = TaskComments(
        task_id=task_id,
        user_id=current_user_id,
        content=data['content']
    )
    db.session.add(new_comment)
    db.session.commit()
    return jsonify(new_comment.serialize()), 201

@api.route('/task/<int:task_id>/comments', methods=['GET'])
@jwt_required()
def get_task_comments(task_id):
    current_user_id = get_jwt_identity()
    task = Tasks.query.get(task_id)
    
    if not task:
        return jsonify({"message": "Tarea no encontrada"}), 404
    
    project = Projects.query.get(task.project_id)
    is_member = ProjectMembers.query.filter_by(project_id=project.id, user_id=current_user_id).first() is not None
    
    if not is_member:
        return jsonify({"message": "No tienes acceso a esta tarea"}), 403

    comments = TaskComments.query.filter_by(task_id=task_id).order_by(TaskComments.created_at.desc()).all()
    return jsonify([comment.serialize() for comment in comments]), 200
    
#dashboard 

@api.route('/dashboard/project-progress', methods=['GET'])
@jwt_required()
def get_project_progress():
    projects = Projects.query.filter_by(enterprise_id=get_jwt_identity()).all()
    progress_data = []
    
    if not projects:
        return jsonify([])  # Retorna una lista vacía si no hay proyectos
    
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

@api.route('/dashboard/tasks-by-status', methods=['GET'])
@jwt_required()
def get_tasks_by_status():
    current_user_id = get_jwt_identity()
    user = Users.query.get(current_user_id)
    
    tasks_by_status = db.session.query(
        Tasks.status, 
        func.count(Tasks.id)
    ).join(Projects).filter(
        Projects.enterprise_id == user.enterprise_id
    ).group_by(Tasks.status).all()
    
    result = [{"status": status, "count": count} for status, count in tasks_by_status]
    return jsonify(result)

@api.route('/dashboard/status-changes-by-user', methods=['GET'])
@jwt_required()
def get_status_changes_by_user():
    current_user_id = get_jwt_identity()
    user = Users.query.get(current_user_id)
    
    status_changes = db.session.query(
        Users.id,
        Users.first_name,
        Users.last_name,
        func.count(Tasks.id)
    ).join(Tasks, Users.id == Tasks.last_status_change_by
    ).join(Projects, Tasks.project_id == Projects.id
    ).filter(Projects.enterprise_id == user.enterprise_id
    ).group_by(Users.id).all()
    
    result = [{
        "user_id": user_id,
        "name": f"{first_name} {last_name}",
        "changes_count": count
    } for user_id, first_name, last_name, count in status_changes]
    
    return jsonify(result)

@api.route('/dashboard/project-completion-time', methods=['GET'])
@jwt_required()
def get_project_completion_time():
    current_user_id = get_jwt_identity()
    user = Users.query.get(current_user_id)
    
    completed_projects = Projects.query.filter(
        Projects.enterprise_id == user.enterprise_id,
        Projects.completed_at.isnot(None)
    ).all()
    
    result = []
    for project in completed_projects:
        completion_time = project.completed_at - project.start_date
        days, seconds = completion_time.days, completion_time.seconds
        hours = seconds // 3600
        
        result.append({
            "project_id": project.id,
            "project_name": project.name,
            "completion_time": f"{days} días y {hours} horas"
        })
    
    return jsonify(result)

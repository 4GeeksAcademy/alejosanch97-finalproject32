from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone

db = SQLAlchemy()

class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    first_name = db.Column(db.String(120), unique=False, nullable=False)
    last_name = db.Column(db.String(120), unique=False, nullable=False)
    username = db.Column(db.String(120), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(180), unique=False, nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey("roles.id"), nullable=True)
    salt = db.Column(db.String(180), nullable=False)
    enterprise_id = db.Column(db.Integer ,db.ForeignKey("enterprises.id"), nullable=True)
    created_at = db.Column(db.DateTime(), default=datetime.now(timezone.utc), nullable=False)


    def __repr__(self):
        return f'<User {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "role_id": self.role_id,
            "enterprise_id": self.enterprise_id,
            "created_at": self.created_at
        }

class Projects(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=False)
    description = db.Column(db.String(120), unique=False)
    start_date = db.Column(db.DateTime(), default=datetime.now(timezone.utc), unique=False)
    end_date = db.Column(db.DateTime(), unique=False)
    enterprise_id = db.Column(db.Integer, db.ForeignKey('enterprises.id'), unique=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=False)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "end_date": self.end_date,
            "creation_date": self.creation_date,
            "enterprise_id": self.enterprise_id
        }

class Enterprises(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=False)
    address = db.Column(db.String(120), unique=False)

    def serialize(self):
        return{
            "id": self.id,
            "name": self.name,
            "address": self.address
        }

class Tasks(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), unique=False)
    name = db.Column(db.String(120), unique=False)
    description = db.Column(db.String(120), unique=False)
    status = db.Column(db.String(120), unique=False)
    due_date = db.Column(db.DateTime(), unique=False)
    creation_date = db.Column(db.DateTime(), default=datetime.now(timezone.utc), unique=False)

    def serialize(self):
        return {
            "id": self.id,
            "task_id": self.task_id,
            "name": self.name,
            "description": self.description,
            "status": self.status,
            "due_date": self.due_date,
            "creation_date": self.creation_date,
            "enterprise_id": self.enterprise_id
        }

class Sub_tasks(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey("tasks.id"), unique=False)
    name = db.Column(db.String(120), unique=False)
    description = db.Column(db.String(120), unique=False)
    status = db.Column(db.String(120), unique=False)
    due_date = db.Column(db.DateTime(), unique=False)
    creation_date = db.Column(db.DateTime(), default=datetime.now(timezone.utc), unique=False)

    def serialize(self):
        return {
            "id": self.id,
            "task_id": self.task_id,
            "name": self.name,
            "description": self.description,
            "status": self.status,
            "due_date": self.due_date,
            "creation_date": self.creation_date,
            "enterprise_id": self.enterprise_id
        }

class Project_members(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), primary_key=True)

    def serialize(self):
        return {
            "id": self.id,
            "project_id": self.project_id,
            "user_id": self.user_id
        }

class Roles(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120))

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
        }

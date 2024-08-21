from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(120), unique=False, nullable=False)
    last_name = db.Column(db.String(120), unique=False, nullable=False)
    username = db.Column(db.String(120), unique=False, nullable=False)
    email = db.Column(db.String(120), unique=False, nullable=False)
    password = db.Column(db.String(120), unique=False, nullable=False)
    role_id = db.Column(db.String(120), unique=True, nullable=False)
    enterprise_id = db.Column(db.String(80), unique=True, nullable=False)
    created_at = db.Column(db.Boolean(), unique=False, nullable=False)

    def __repr__(self):
        return f'<User {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "first_name":self.first_name,
            "last_name":self.last_name
        }

class Projects(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, unique=True)
    name = db.Column(db.String(120), unique=False)
    description = db.Column(db.String(120), unique=False)
    status = db.Column(db.String(120), unique=False)
    due_date = db.Column(db.String(120), unique=False)
    creation_date = db.Column(db.String(120), unique=False)
    enterprise_id = db.Column(db.String(120), unique=False)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.email,
            "description":self.first_name,
            "status":self.last_name
        }

class Enterprises(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=False)
    address = db.Column(db.String(120), unique=False)
    email = db.Column(db.String(120), unique=False)

class Sub_tasks(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.String(120), unique=False)
    name = db.Column(db.String(120), unique=False)
    description = db.Column(db.String(120), unique=False)
    status = db.Column(db.String(120), unique=False)
    due_date = db.Column(db.String(120), unique=False)
    creation_date = db.Column(db.String(120), unique=False)
    enterprise_id = db.Column(db.String(120), unique=False)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.email,
            "description":self.first_name,
            "status":self.last_name
        }

class Projects(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=False)
    description = db.Column(db.String(120), unique=False)
    start_date = db.Column(db.String(120), unique=False)
    end_date = db.Column(db.String(120), unique=False)
    user_id = db.Column(db.String(120), unique=False)
    enterprise_id = db.Column(db.String(120), unique=False)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.email,
            "description":self.first_name,
            "status":self.last_name
        }

class Project_members(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, primary_key=True)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.email,
            "description":self.first_name,
            "status":self.last_name
        }

class Roles(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120))

    def serialize(self):
        return {
            "id": self.id,
            "name": self.email,
            "description":self.first_name,
            "status":self.last_name
        }

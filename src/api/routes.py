"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Tasks
from api.utils import generate_sitemap, APIException
from flask_cors import CORS

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200


@api.route('/add-task', methods=['POST'])
def add_task():
    data = request.json
    task_name = data.get("name")
    task_description = data.get("description")
    task_due_date = data.get("due_date")
    task = Tasks(
        name= task_name,
        description= task_description,
        due_date = task_due_date
    )

    try:
        db.session.add(task)
        db.session.commit()
        return jsonify({"message":"task created"})
    except Exception as error:
        print(error.args)
        db.session.rollback()
        return jsonify({"message":error})

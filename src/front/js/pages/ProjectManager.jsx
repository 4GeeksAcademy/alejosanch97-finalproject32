import React, { useState, useEffect, useContext } from 'react';
import { Context } from "../store/appContext";

export const ProjectManager = () => {
    const { store, actions } = useContext(Context);
    const [newProjectName, setNewProjectName] = useState('');
    const [newTaskName, setNewTaskName] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [newUserEmail, setNewUserEmail] = useState('');

    useEffect(() => {
        actions.getProjects();
        actions.getOrganizationUsers();
    }, []);

    const handleCreateProject = async () => {
        if (newProjectName) {
            const result = await actions.createProject({ name: newProjectName });
            if (result.success) {
                setNewProjectName('');
                actions.getProjects();
            } else {
                alert(result.message);
            }
        }
    };

    const handleCreateTask = async (projectId) => {
        if (newTaskName) {
            const result = await actions.createTask(projectId, { name: newTaskName });
            if (result.success) {
                setNewTaskName('');
                actions.getProjectTasks(projectId);
            } else {
                alert(result.message);
            }
        }
    };

    const handleAddUserToProject = async (projectId) => {
        if (newUserEmail) {
            const user = store.organizationUsers.find(u => u.email === newUserEmail);
            if (user) {
                const result = await actions.addUserToProject(projectId, user.id);
                if (result.success) {
                    setNewUserEmail('');
                    actions.getProjectMembers(projectId);
                } else {
                    alert(result.message);
                }
            } else {
                alert("Usuario no encontrado");
            }
        }
    };

    return (
        <div>
            <div className="border m-3 p-3">
                <h3>Lista de proyectos</h3>
                {store.projects.map((project) => (
                    <div key={project.id} className="border m-3 p-3">
                        <h2>{project.name}</h2>
                        <div className="d-flex gap-5">
                            <div>
                                {store.tasks
                                    .filter(task => task.project_id === project.id)
                                    .map(task => (
                                        <div key={task.id} className="form-check">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id={`task-${task.id}`}
                                                checked={task.status === 'completed'}
                                                onChange={() => actions.updateTaskStatus(task.id, task.status === 'completed' ? 'in_progress' : 'completed')}
                                            />
                                            <label htmlFor={`task-${task.id}`} className="form-check-label">{task.title}</label>
                                        </div>
                                    ))}
                            </div>
                            <div>
                                Lista de usuarios:
                                <ul>
                                    {store.projectMembers[project.id]?.map(member => (
                                        <li key={member.id}>{member.name}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="d-flex gap-3">
                            <button className="btn btn-primary" onClick={() => setSelectedProjectId(project.id)}>Crear Tareas</button>
                            <button className="btn btn-primary" onClick={() => setSelectedProjectId(project.id)}>Agregar Usuarios</button>
                            <button className="btn btn-secondary">Eliminar proyecto</button>
                            <button className="btn btn-secondary">Modificar proyecto</button>
                        </div>
                        {selectedProjectId === project.id && (
                            <div className="mt-3">
                                <input
                                    type="text"
                                    value={newTaskName}
                                    onChange={(e) => setNewTaskName(e.target.value)}
                                    placeholder="Nombre de la nueva tarea"
                                />
                                <button className="btn btn-primary ms-2" onClick={() => handleCreateTask(project.id)}>Crear Tarea</button>
                                <input
                                    type="email"
                                    value={newUserEmail}
                                    onChange={(e) => setNewUserEmail(e.target.value)}
                                    placeholder="Email del usuario a agregar"
                                    className="ms-2"
                                />
                                <button className="btn btn-primary ms-2" onClick={() => handleAddUserToProject(project.id)}>Agregar Usuario</button>
                            </div>
                        )}
                    </div>
                ))}
                <div className="mt-3">
                    <input
                        type="text"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder="Nombre del nuevo proyecto"
                    />
                    <button className="btn btn-primary ms-2" onClick={handleCreateProject}>Crear proyecto</button>
                </div>
            </div>
        </div>
    );
};
import React, { useState, useEffect, useContext } from 'react';
import { Context } from "../store/appContext";

export const ProjectManager = () => {
    const { store, actions } = useContext(Context);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [showUserForm, setShowUserForm] = useState(null);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newTask, setNewTask] = useState({
        name: '',
        description: '',
        status: 'pending',
        due_date: ''
    });

    useEffect(() => {
        actions.getProjects();
        actions.getOrganizationUsers();
    }, []);

    const handleCreateTask = async (projectId) => {
        if (newTask.name && newTask.description && newTask.due_date) {
            const result = await actions.createTask(projectId, newTask);
            if (result.success) {
                setNewTask({
                    name: '',
                    description: '',
                    status: 'pending',
                    due_date: ''
                });
                setShowTaskForm(false);
                actions.getProjectTasks(projectId);
            } else {
                alert(result.message);
            }
        } else {
            alert("Por favor, complete todos los campos obligatorios");
        }
    };

    // const handleAddUserToProject = async (projectId) => {
    //     if (newUserEmail) {
    //         const user = store.organizationUsers.find(u => u.email === newUserEmail);
    //         if (user) {
    //             const result = await actions.addUserToProject(projectId, user.id);
    //             if (result.success) {
    //                 setNewUserEmail('');
    //                 setShowUserForm(null);
    //                 alert("Usuario agregado al proyecto exitosamente");
    //                 actions.getProjectMembers(projectId);
    //             } else {
    //                 alert(result.message);
    //             }
    //         } else {
    //             alert("Usuario no encontrado en la organización");
    //         }
    //     } else {
    //         alert("Por favor, ingrese un correo electrónico");
    //     }
    // };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTask(prevTask => ({
            ...prevTask,
            [name]: value
        }));
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Gestor de Proyectos</h2>

            {
                store.taskDeimian.map((item) => {
                    return (
                        <div>
                            {item.name}<br />
                            {item.task.map((ta) => {
                                return (
                                    <>
                                        {ta.name}<br />
                                    </>
                                )
                            })}
                        </div>
                    )
                })
            }



            <p>*******************************************</p>

            {store.projects.map((project) => (
                <div key={project.id} className="card mb-4">
                    <div className="card-header">
                        <h3>{project.name}</h3>
                    </div>
                    <div className="card-body">
                        <h4>Tareas:</h4>
                        <ul className="list-group mb-3">
                            {store.tasks
                                .filter(task => task.project_id === project.id)
                                .map(task => (
                                    <li key={task.id} className="list-group-item">
                                        <input
                                            type="checkbox"
                                            className="form-check-input me-2"
                                            checked={task.status === 'completed'}
                                            onChange={() => actions.updateTaskStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                                        />
                                        {task.name} - {task.status}
                                    </li>
                                ))}
                        </ul>
                        <h4>Miembros del proyecto:</h4>
                        <ul className="list-group mb-3">
                            {store.projectMembers[project.id]?.map(member => (
                                <li key={member.user_id} className="list-group-item">
                                    {member.first_name} {member.last_name} ({member.email})
                                </li>
                            ))}
                        </ul>
                        <div className="mb-3">
                            <button className="btn btn-primary me-2" onClick={() => {
                                setSelectedProjectId(project.id);
                                setShowTaskForm(true);
                            }}>Agregar Tarea</button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowUserForm(project.id)}
                            >
                                Agregar Usuario al Proyecto
                            </button>
                        </div>
                        {showUserForm === project.id && (
                            <div className="mb-3">
                                <input
                                    type="email"
                                    className="form-control mb-2"
                                    value={newUserEmail}
                                    onChange={(e) => setNewUserEmail(e.target.value)}
                                    placeholder="Email del usuario a agregar"
                                />
                                <button
                                    className="btn btn-primary me-2"
                                // onClick={() => handleAddUserToProject(project.id)}
                                >
                                    Agregar Usuario
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowUserForm(null);
                                        setNewUserEmail('');
                                    }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        )}
                        {selectedProjectId === project.id && showTaskForm && (
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title">Nueva Tarea</h5>
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        handleCreateTask(project.id);
                                    }}>
                                        <div className="mb-3">
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="name"
                                                value={newTask.name}
                                                onChange={handleInputChange}
                                                placeholder="Nombre de la tarea"
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <textarea
                                                className="form-control"
                                                name="description"
                                                value={newTask.description}
                                                onChange={handleInputChange}
                                                placeholder="Descripción de la tarea"
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <select
                                                className="form-control"
                                                name="status"
                                                value={newTask.status}
                                                onChange={handleInputChange}
                                            >
                                                <option value="pending">Pendiente</option>
                                                <option value="in_progress">En progreso</option>
                                                <option value="completed">Completada</option>
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <input
                                                type="date"
                                                className="form-control"
                                                name="due_date"
                                                value={newTask.due_date}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-success">Crear Tarea</button>
                                        <button type="button" className="btn btn-secondary ms-2" onClick={() => setShowTaskForm(false)}>Cancelar</button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
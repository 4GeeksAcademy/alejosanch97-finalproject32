import React, { useState, useEffect, useContext } from 'react';
import { Context } from "../store/appContext";

export const ProjectManager = () => {
    const { store, actions } = useContext(Context);
    const [selectedProject, setSelectedProject] = useState(null);
    const [newTask, setNewTask] = useState({ name: '', description: '', status: 'Pending', due_date: '' });
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [editingTask, setEditingTask] = useState(null);
    const [editingProject, setEditingProject] = useState(null);
    const [calendarEvents, setCalendarEvents] = useState([]);

    useEffect(() => {
        actions.getProjects();
        actions.getOrganizationUsers();
    }, []);

    useEffect(() => {
        if (selectedProject) {
            actions.getProjectTasks(selectedProject.id);
            actions.getProjectMembers(selectedProject.id);
        }
    }, [selectedProject]);

    useEffect(() => {
        if (store.projectTasks[selectedProject?.id]) {
            const events = store.projectTasks[selectedProject.id].map(task => ({
                title: task.name,
                start: new Date(task.due_date),
                end: new Date(task.due_date),
                allDay: true,
                resource: task
            }));
            setCalendarEvents(events);
        }
    }, [store.projectTasks, selectedProject]);

    const handleAddTask = async () => {
        await actions.addProjectTask(selectedProject.id, newTask);
        setNewTask({ name: '', description: '', status: 'Pending', due_date: '' });
    };

    const handleEditTask = (task) => {
        setEditingTask({ ...task });
    };

    const handleUpdateTask = async () => {
        await actions.updateTask(editingTask.id, editingTask);
        setEditingTask(null);
        actions.getProjectTasks(selectedProject.id);
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            await actions.deleteTask(taskId);
            actions.getProjectTasks(selectedProject.id);
        }
    };

    const handleChangeTaskStatus = async (taskId, newStatus) => {
        await actions.updateTask(taskId, { status: newStatus });
        actions.getProjectTasks(selectedProject.id);
        // Actualizar la productividad del usuario después de cambiar el estado de la tarea
        actions.getUserProductivity();
    };

    const handleAddMember = async () => {
        if (newMemberEmail) {
            const result = await actions.addProjectMember(selectedProject.id, newMemberEmail);
            if (result.success) {
                setNewMemberEmail('');
                actions.getProjectMembers(selectedProject.id);
            } else {
                alert(result.message || 'Error al añadir miembro');
            }
        } else {
            alert('Por favor, ingrese un email válido');
        }
    };

    const handleEditProject = (project) => {
        setEditingProject({ ...project });
    };

    const handleUpdateProject = async () => {
        await actions.updateProject(editingProject.id, editingProject);
        setEditingProject(null);
        actions.getProjects();
    };

    const handleDeleteProject = async (projectId) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            await actions.deleteProject(projectId);
            setSelectedProject(null);
            actions.getProjects();
        }
    };

    const calculateProgress = (tasks) => {
        if (!tasks || tasks.length === 0) return 0;
        const completedTasks = tasks.filter(task => task.status === 'Completed').length;
        return Math.round((completedTasks / tasks.length) * 100);
    };

    return (
        <div className="container mt-4">
            <h1>Project Manager</h1>
            <div className="row">
                <div className="col-md-4">
                    <h2>Projects</h2>
                    <ul className="list-group">
                        {store.projects.map(project => (
                            <li
                                key={project.id}
                                className={`list-group-item ${selectedProject && selectedProject.id === project.id ? 'active' : ''}`}
                            >
                                <span onClick={() => setSelectedProject(project)}>{project.name}</span>
                                <div className="float-right">
                                    <button className="btn btn-sm btn-warning mr-2" onClick={() => handleEditProject(project)}>Edit</button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteProject(project.id)}>Delete</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                {selectedProject && (
                    <div className="col-md-8">
                        <h2>{selectedProject.name}</h2>
                        <p>{selectedProject.description}</p>
                        <div className="row">
                            <div className="col-md-6">
                                <h3>Tasks</h3>
                                {store.projectTasks[selectedProject.id] && (
                                    <div className="progress mb-3">
                                        <div 
                                            className="progress-bar" 
                                            role="progressbar" 
                                            style={{width: `${calculateProgress(store.projectTasks[selectedProject.id])}%`}}
                                            aria-valuenow={calculateProgress(store.projectTasks[selectedProject.id])}
                                            aria-valuemin="0" 
                                            aria-valuemax="100"
                                        >
                                            {calculateProgress(store.projectTasks[selectedProject.id])}%
                                        </div>
                                    </div>
                                )}
                                <ul className="list-group">
                                    {store.projectTasks[selectedProject.id]?.map(task => (
                                        <li key={task.id} className="list-group-item">
                                            {editingTask && editingTask.id === task.id ? (
                                                <>
                                                    <input
                                                        type="text"
                                                        className="form-control mb-2"
                                                        value={editingTask.name}
                                                        onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })}
                                                    />
                                                    <input
                                                        type="text"
                                                        className="form-control mb-2"
                                                        value={editingTask.description}
                                                        onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                                                    />
                                                    <input
                                                        type="date"
                                                        className="form-control mb-2"
                                                        value={editingTask.due_date}
                                                        onChange={(e) => setEditingTask({ ...editingTask, due_date: e.target.value })}
                                                    />
                                                    <button className="btn btn-success mr-2" onClick={handleUpdateTask}>Save</button>
                                                    <button className="btn btn-secondary" onClick={() => setEditingTask(null)}>Cancel</button>
                                                </>
                                            ) : (
                                                <>
                                                    <span>{task.name} - {task.status}</span>
                                                    <div className="float-right">
                                                        <select
                                                            className="form-control form-control-sm d-inline-block mr-2"
                                                            style={{width: 'auto'}}
                                                            value={task.status}
                                                            onChange={(e) => handleChangeTaskStatus(task.id, e.target.value)}
                                                        >
                                                            <option value="Pending">Pending</option>
                                                            <option value="In Progress">In Progress</option>
                                                            <option value="Completed">Completed</option>
                                                        </select>
                                                        <button className="btn btn-sm btn-warning mr-2" onClick={() => handleEditTask(task)}>Edit</button>
                                                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteTask(task.id)}>Delete</button>
                                                    </div>
                                                </>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                                <h4 className="mt-3">Add Task</h4>
                                <input
                                    type="text"
                                    className="form-control mb-2"
                                    placeholder="Task Name"
                                    value={newTask.name}
                                    onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                                />
                                <input
                                    type="text"
                                    className="form-control mb-2"
                                    placeholder="Description"
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                />
                                <input
                                    type="date"
                                    className="form-control mb-2"
                                    value={newTask.due_date}
                                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                                />
                                <button className="btn btn-primary" onClick={handleAddTask}>Add Task</button>
                            </div>
                            <div className="col-md-6">
                                <h3>Members</h3>
                                <ul className="list-group">
                                    {store.projectMembers[selectedProject?.id]?.map(member => (
                                        <li key={member.id} className="list-group-item">
                                            {member.name} - {member.email}
                                        </li>
                                    ))}
                                </ul>
                                <h4 className="mt-3">Add Member</h4>
                                <input
                                    type="email"
                                    className="form-control mb-2"
                                    placeholder="User Email"
                                    value={newMemberEmail}
                                    onChange={(e) => setNewMemberEmail(e.target.value)}
                                />
                                <button className="btn btn-primary" onClick={handleAddMember}>Add Member</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {editingProject && (
                <div className="modal" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Project</h5>
                                <button type="button" className="close" onClick={() => setEditingProject(null)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <input
                                    type="text"
                                    className="form-control mb-2"
                                    value={editingProject.name}
                                    onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                                />
                                <textarea
                                    className="form-control mb-2"
                                    value={editingProject.description}
                                    onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                                />
                                <input
                                    type="date"
                                    className="form-control mb-2"
                                    value={editingProject.start_date}
                                    onChange={(e) => setEditingProject({ ...editingProject, start_date: e.target.value })}
                                />
                                <input
                                    type="date"
                                    className="form-control mb-2"
                                    value={editingProject.end_date}
                                    onChange={(e) => setEditingProject({ ...editingProject, end_date: e.target.value })}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setEditingProject(null)}>Close</button>
                                <button type="button" className="btn btn-primary" onClick={handleUpdateProject}>Save changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
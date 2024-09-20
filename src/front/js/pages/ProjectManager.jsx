import React, { useState, useEffect, useContext } from 'react';
import { Context } from "../store/appContext";
import "../../styles/projectmanager.css";
import { useNavigate } from 'react-router-dom';

export const ProjectManager = () => {
    const { store, actions } = useContext(Context);
    const [selectedProject, setSelectedProject] = useState(null);
    const [newTask, setNewTask] = useState({ name: '', description: '', status: 'Pending', due_date: '', priority: 'medium' });
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [editingTask, setEditingTask] = useState(null);
    const [editingProject, setEditingProject] = useState(null);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [error, setError] = useState('');
    const [showProjectComments, setShowProjectComments] = useState(false);
    const [showTaskComments, setShowTaskComments] = useState({});
    const [newTaskComment, setNewTaskComment] = useState({});
    const [newComment, setNewComment] = useState('');
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (selectedProject) {
            actions.getProjectComments(selectedProject.id);
        }
    }, [selectedProject]);

    const handleAddProjectComment = async () => {
        if (newComment.trim()) {
            await actions.addProjectComment(selectedProject.id, newComment);
            setNewComment('');
            actions.getProjectComments(selectedProject.id);
        }
    };

    const handleAddTaskComment = async (taskId) => {
        if (newTaskComment[taskId]?.trim()) {
            await actions.addTaskComment(taskId, newTaskComment[taskId]);
            setNewTaskComment({ ...newTaskComment, [taskId]: '' });
            actions.getTaskComments(taskId);
        }
    };

    const toggleTaskComments = (taskId) => {
        setShowTaskComments(prev => ({
            ...prev,
            [taskId]: !prev[taskId]
        }));
        if (!showTaskComments[taskId]) {
            actions.getTaskComments(taskId);
        }
    };

    const getCurrentDate = () => {
        return new Date().toISOString().split('T')[0];
    };

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
        try {
            await actions.addProjectTask(selectedProject.id, newTask);
            setNewTask({ name: '', description: '', status: 'Pending', due_date: '', priority: 'medium' });
            setError('');

        } catch (error) {
            setError(error.message);
        }
    };

    const handleEditTask = (task) => {
        setEditingTask({ ...task });
    };

    const handleUpdateTask = async () => {
        try {
            const updatedTask = await actions.updateTask(editingTask.id, editingTask);
            if (updatedTask) {
                const updatedTasks = store.projectTasks[selectedProject.id].map(task =>
                    task.id === editingTask.id ? { ...task, ...updatedTask } : task
                );
                actions.setProjectTasks(selectedProject.id, updatedTasks);
                // Update the task status distribution
                setEditingTask(null);
                setError('');
            }
        } catch (error) {
            setError(error.message);
        }
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

    };

    const handleChangeTaskPriority = async (taskId, newPriority) => {
        try {
            const updatedTask = await actions.updateTask(taskId, { priority: newPriority });
            if (updatedTask) {
                const updatedTasks = store.projectTasks[selectedProject.id].map(task =>
                    task.id === taskId ? { ...task, priority: newPriority } : task
                );
                actions.setProjectTasks(selectedProject.id, updatedTasks);
            }
        } catch (error) {
            setError('Error al actualizar la prioridad de la tarea: ' + error.message);
        }
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
        setEditingProject({ ...project, priority: project.priority || 'medium' });
    };

    const handleUpdateProject = async () => {
        const today = new Date().toISOString().split('T')[0];
        if (editingProject.start_date < today) {
            setError('La fecha de inicio no puede ser anterior a hoy.');
            return;
        }
        if (editingProject.end_date < today) {
            setError('La fecha de finalización no puede ser anterior a hoy.');
            return;
        }
        if (editingProject.end_date < editingProject.start_date) {
            setError('La fecha de finalización no puede ser anterior a la fecha de inicio.');
            return;
        }

        const result = await actions.updateProject(editingProject.id, editingProject);
        if (result.success) {
            setEditingProject(null);
            actions.getProjects();
            setError('');
        } else {
            setError(result.message);
        }
    };

    const handleDeleteProject = async (projectId) => {
        if (window.confirm('Are you sure you want to delete this project? This will also delete all associated tasks and comments.')) {
            const result = await actions.deleteProject(projectId);
            if (result.success) {
                setSelectedProject(null);
                actions.getProjects();
            } else {
                setError(result.message);
            }
        }
    };
    const calculateProgress = (tasks) => {
        if (!tasks || tasks.length === 0) return 0;
        const completedTasks = tasks.filter(task => task.status === 'Completed').length;
        return Math.round((completedTasks / tasks.length) * 100);
    };

    return (
        <div className="container-fluid mt-4 project-manager">
            <h1 className="text-center mb-4">Project Manager</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="row">
                <div className="col-md-3">
                    <div className="card mb-4">
                        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                            <h2 className="h4 mb-0">Projects</h2>
                            <button className="btn btn-sm btn-outline-light" onClick={() => navigate(-1)}>
                                Return to Profile
                            </button>
                        </div>
                        <div className="card-body p-0">
                            <ul className="list-group list-group-flush">
                                {store.projects.map(project => (
                                    <li
                                        key={project.id}
                                        className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${selectedProject && selectedProject.id === project.id ? 'selected-project' : ''}`}
                                        onClick={() => setSelectedProject(project)}
                                    >
                                        <span>{project.name}</span>
                                        <div className="project-actions">
                                            <button className="btn btn-sm btn-outline-warning" onClick={(e) => { e.stopPropagation(); handleEditProject(project); }}>
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id); }}>
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
                        Return to Profile
                    </button>
                </div>

                {selectedProject && (
                    <div className="col-md-9">
                        <div className="card">
                            <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
                                <h2 className="h4 mb-0">{selectedProject.name}</h2>
                                <span className={`badge badge-${selectedProject.priority === 'high' ? 'danger' : selectedProject.priority === 'medium' ? 'warning' : 'success'}`}>
                                    {selectedProject.priority.charAt(0).toUpperCase() + selectedProject.priority.slice(1)} Priority
                                </span>
                            </div>
                            <div className="card-body">
                                <p className="lead">{selectedProject.description}</p>
                                <button className="btn btn-outline-info mb-3" onClick={() => setShowProjectComments(!showProjectComments)}>
                                    {showProjectComments ? 'Hide Comments' : 'Show Comments'}
                                </button>
                                {showProjectComments && (
                                    <div className="mb-4">
                                        <h4>Project Comments</h4>
                                        <ul className="list-group mb-3">
                                            {store.projectComments[selectedProject.id]?.map(comment => (
                                                <li key={comment.id} className="list-group-item">
                                                    <strong>{comment.user_name}</strong>: {comment.content}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Add a comment"
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                            />
                                            <div className="input-group-append">
                                                <button className="btn btn-primary" onClick={handleAddProjectComment}>Add Comment</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="row">
                                    <div className="col-md-8">
                                        <h3>Tasks</h3>
                                        {store.projectTasks[selectedProject.id] && (
                                            <div className="progress mb-3">
                                                <div
                                                    className="progress-bar bg-success"
                                                    role="progressbar"
                                                    style={{ width: `${calculateProgress(store.projectTasks[selectedProject.id])}%` }}
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
                                                        <div className="edit-task-form">
                                                            <div className="form-group">
                                                                <label htmlFor={`editTaskName-${task.id}`}>Task Name:</label>
                                                                <input
                                                                    id={`editTaskName-${task.id}`}
                                                                    type="text"
                                                                    className="form-control"
                                                                    value={editingTask.name}
                                                                    onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="form-group">
                                                                <label htmlFor={`editTaskDescription-${task.id}`}>Description:</label>
                                                                <textarea
                                                                    id={`editTaskDescription-${task.id}`}
                                                                    className="form-control"
                                                                    value={editingTask.description}
                                                                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                                                                ></textarea>
                                                            </div>
                                                            <div className="form-group">
                                                                <label htmlFor={`editTaskDueDate-${task.id}`}>Due Date:</label>
                                                                <input
                                                                    id={`editTaskDueDate-${task.id}`}
                                                                    type="date"
                                                                    className="form-control"
                                                                    value={editingTask.due_date}
                                                                    min={getCurrentDate()}
                                                                    onChange={(e) => setEditingTask({ ...editingTask, due_date: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="form-group">
                                                                <label htmlFor={`editTaskPriority-${task.id}`}>Priority:</label>
                                                                <select
                                                                    id={`editTaskPriority-${task.id}`}
                                                                    className="form-control"
                                                                    value={editingTask.priority}
                                                                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value })}
                                                                >
                                                                    <option value="low">Low</option>
                                                                    <option value="medium">Medium</option>
                                                                    <option value="high">High</option>
                                                                </select>
                                                            </div>
                                                            <div className="form-group text-right">
                                                                <button className="btn btn-secondary mr-2" onClick={() => setEditingTask(null)}>Cancel</button>
                                                                <button className="btn btn-success" onClick={handleUpdateTask}>Save</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="task-item">
                                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                                <h5 className="mb-0">{task.name}</h5>
                                                                <div>
                                                                    <span className={`badge badge-${task.status === 'Completed' ? 'success' : task.status === 'In Progress' ? 'warning' : 'secondary'} mr-2`}>
                                                                        {task.status}
                                                                    </span>
                                                                    <span className={`badge badge-${task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'info'}`}>
                                                                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <p className="mb-2">{task.description}</p>
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <small className="text-muted">Due: {new Date(task.due_date).toLocaleDateString()}</small>
                                                                <div className="task-actions">
                                                                    <select
                                                                        className="form-control form-control-sm"
                                                                        value={task.status}
                                                                        onChange={(e) => handleChangeTaskStatus(task.id, e.target.value)}
                                                                    >
                                                                        <option value="Pending">Pending</option>
                                                                        <option value="In Progress">In Progress</option>
                                                                        <option value="Completed">Completed</option>
                                                                    </select>
                                                                    <select
                                                                        className="form-control form-control-sm"
                                                                        value={task.priority}
                                                                        onChange={(e) => handleChangeTaskPriority(task.id, e.target.value)}
                                                                    >
                                                                        <option value="low">Low</option>
                                                                        <option value="medium">Medium</option>
                                                                        <option value="high">High</option>
                                                                    </select>
                                                                    <button className="btn btn-sm btn-outline-warning" onClick={() => handleEditTask(task)}>
                                                                        <i className="fas fa-edit"></i>
                                                                    </button>
                                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteTask(task.id)}>
                                                                        <i className="fas fa-trash"></i>
                                                                    </button>
                                                                    <button className="btn btn-sm btn-outline-info" onClick={() => toggleTaskComments(task.id)}>
                                                                        <i className="fas fa-comments"></i>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            {showTaskComments[task.id] && (
                                                                <div className="mt-3">
                                                                    <h6>Task Comments</h6>
                                                                    <ul className="list-group mb-2">
                                                                        {store.taskComments[task.id]?.map(comment => (
                                                                            <li key={comment.id} className="list-group-item py-2">
                                                                                <strong>{comment.user_name}</strong>: {comment.content}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                    <div className="input-group">
                                                                        <input
                                                                            type="text"
                                                                            className="form-control"
                                                                            placeholder="Add a comment"
                                                                            value={newTaskComment[task.id] || ''}
                                                                            onChange={(e) => setNewTaskComment({ ...newTaskComment, [task.id]: e.target.value })}
                                                                        />
                                                                        <div className="input-group-append">
                                                                            <button className="btn btn-primary" onClick={() => handleAddTaskComment(task.id)}>Add</button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                        <button className="btn btn-primary mt-3" onClick={() => setShowAddTaskModal(true)}>Add Task</button>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="card">
                                            <div className="card-header bg-secondary text-white">
                                                <h3 className="h5 mb-0">Project Members</h3>
                                            </div>
                                            <div className="card-body">
                                                <ul className="list-group">
                                                    {store.projectMembers[selectedProject?.id]?.map(member => (
                                                        <li key={member.id} className="list-group-item d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <strong>{member.name}</strong>
                                                                <br />
                                                                <small>{member.email}</small>
                                                            </div>
                                                            <span className="badge badge-primary badge-pill">Member</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <h4 className="mt-4">Add Member</h4>
                                                <form onSubmit={(e) => { e.preventDefault(); handleAddMember(); }}>
                                                    <div className="input-group mb-3">
                                                        <input
                                                            type="email"
                                                            className="form-control"
                                                            placeholder="User Email"
                                                            value={newMemberEmail}
                                                            onChange={(e) => setNewMemberEmail(e.target.value)}
                                                            required
                                                        />
                                                        <div className="input-group-append">
                                                            <button className="btn btn-primary" type="submit">Add</button>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
            {editingProject && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Project</h5>
                                <button type="button" className="close" onClick={() => setEditingProject(null)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Project Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editingProject.name}
                                        onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        className="form-control"
                                        value={editingProject.description}
                                        onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                                    ></textarea>
                                </div>
                                <div className="form-group">
                                    <label>Priority</label>
                                    <select
                                        className="form-control"
                                        value={editingProject.priority}
                                        onChange={(e) => setEditingProject({ ...editingProject, priority: e.target.value })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Start Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={editingProject.start_date}
                                        min={getCurrentDate()}
                                        onChange={(e) => setEditingProject({ ...editingProject, start_date: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>End Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={editingProject.end_date}
                                        min={editingProject.start_date || getCurrentDate()}
                                        onChange={(e) => setEditingProject({ ...editingProject, end_date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setEditingProject(null)}>Close</button>
                                <button type="button" className="btn btn-primary" onClick={handleUpdateProject}>Save changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showAddTaskModal && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add New Task</h5>
                                <button type="button" className="close" onClick={() => setShowAddTaskModal(false)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={(e) => { e.preventDefault(); handleAddTask(); setShowAddTaskModal(false); }}>
                                    <div className="form-group">
                                        <label>Task Name:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={newTask.name}
                                            onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Description:</label>
                                        <textarea
                                            className="form-control"
                                            value={newTask.description}
                                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label>Due Date:</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={newTask.due_date}
                                            min={getCurrentDate()}
                                            onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Priority:</label>
                                        <select
                                            className="form-control"
                                            value={newTask.priority}
                                            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                            required
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="btn btn-primary">Add Task</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
};
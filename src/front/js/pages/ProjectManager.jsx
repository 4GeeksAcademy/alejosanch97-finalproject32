import React, { useState, useEffect, useContext } from 'react';
import { Context } from "../store/appContext";

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
            // Update the task status distribution
            actions.getUserTaskStatusDistribution();
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
                actions.getUserTaskStatusDistribution();
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
            {error && <div className="alert alert-danger">{error}</div>}
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
                        <p><strong>Priority:</strong> {selectedProject.priority}</p>
                        <button className="btn btn-info mb-3" onClick={() => setShowProjectComments(!showProjectComments)}>
                            {showProjectComments ? 'Hide Comments' : 'Show Comments'}
                        </button>
                        {showProjectComments && (
                            <div>
                                <h4>Project Comments</h4>
                                <ul className="list-group mb-3">
                                    {store.projectComments[selectedProject.id]?.map(comment => (
                                        <li key={comment.id} className="list-group-item">
                                            <strong>{comment.user_name}</strong>: {comment.content}
                                        </li>
                                    ))}
                                </ul>
                                <input
                                    type="text"
                                    className="form-control mb-2"
                                    placeholder="Add a comment"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                                <button className="btn btn-primary mb-3" onClick={handleAddProjectComment}>Add Comment</button>
                            </div>
                        )}
                        <div className="row">
                            <div className="col-md-6">
                                <h3>Tasks</h3>
                                {store.projectTasks[selectedProject.id] && (
                                    <div className="progress mb-3">
                                        <div
                                            className="progress-bar"
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
                                                        min={getCurrentDate()}
                                                        onChange={(e) => setEditingTask({ ...editingTask, due_date: e.target.value })}
                                                    />

                                                    <button className="btn btn-success mr-2" onClick={handleUpdateTask}>Save</button>
                                                    <button className="btn btn-secondary" onClick={() => setEditingTask(null)}>Cancel</button>
                                                </>
                                            ) : (
                                                <>
                                                    <span>{task.name} - {task.status} - Priority: {task.priority}</span>
                                                    <div className="float-right">
                                                        <select
                                                            className="form-control form-control-sm d-inline-block mr-2"
                                                            style={{ width: 'auto' }}
                                                            value={task.status}
                                                            onChange={(e) => handleChangeTaskStatus(task.id, e.target.value)}
                                                        >
                                                            <option value="Pending">Pending</option>
                                                            <option value="In Progress">In Progress</option>
                                                            <option value="Completed">Completed</option>
                                                        </select>
                                                        <select
                                                            className="form-control form-control-sm d-inline-block mr-2"
                                                            style={{ width: 'auto' }}
                                                            value={task.priority}
                                                            onChange={(e) => handleChangeTaskPriority(task.id, e.target.value)}
                                                        >
                                                            <option value="low">Low</option>
                                                            <option value="medium">Medium</option>
                                                            <option value="high">High</option>
                                                        </select>
                                                        <button className="btn btn-sm btn-warning mr-2" onClick={() => handleEditTask(task)}>Edit</button>
                                                        <button className="btn btn-sm btn-danger mr-2" onClick={() => handleDeleteTask(task.id)}>Delete</button>
                                                        <button className="btn btn-sm btn-info" onClick={() => toggleTaskComments(task.id)}>
                                                            {showTaskComments[task.id] ? 'Hide Comments' : 'Show Comments'}
                                                        </button>
                                                    </div>
                                                    {showTaskComments[task.id] && (
                                                        <div className="mt-2">
                                                            <h6>Task Comments</h6>
                                                            <ul className="list-group mb-2">
                                                                {store.taskComments[task.id]?.map(comment => (
                                                                    <li key={comment.id} className="list-group-item">
                                                                        <strong>{comment.user_name}</strong>: {comment.content}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                            <input
                                                                type="text"
                                                                className="form-control mb-2"
                                                                placeholder="Add a comment"
                                                                value={newTaskComment[task.id] || ''}
                                                                onChange={(e) => setNewTaskComment({ ...newTaskComment, [task.id]: e.target.value })}
                                                            />
                                                            <button className="btn btn-primary btn-sm" onClick={() => handleAddTaskComment(task.id)}>Add Comment</button>
                                                        </div>
                                                    )}
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
                                    min={getCurrentDate()}
                                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                                />
                                <select
                                    className="form-control mb-2"
                                    value={newTask.priority}
                                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
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
                                <select
                                    className="form-control mb-2"
                                    value={editingProject.priority}
                                    onChange={(e) => setEditingProject({ ...editingProject, priority: e.target.value })}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                                <input
                                    type="date"
                                    className="form-control mb-2"
                                    value={editingProject.start_date}
                                    min={getCurrentDate()}
                                    onChange={(e) => setEditingProject({ ...editingProject, start_date: e.target.value })}
                                />
                                <input
                                    type="date"
                                    className="form-control mb-2"
                                    value={editingProject.end_date}
                                    min={editingProject.start_date || getCurrentDate()}
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
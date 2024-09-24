import React, { useEffect, useContext, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate, Link } from "react-router-dom";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import "../../styles/profile.css";
import { Weather } from '../component/Weather.jsx'

const localizer = momentLocalizer(moment);

export const Profile = () => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();
    const [showCreateUser, setShowCreateUser] = useState(false);
    const [showCreateProject, setShowCreateProject] = useState(false);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [taskFilter, setTaskFilter] = useState("Pending");


    const [newUser, setNewUser] = useState({
        first_name: "",
        last_name: "",
        username: "",
        avatar: "",
        email: "",
        password: "",
        role_id: 2, // Por defecto, rol de usuario
        enterprise_id: store.user ? store.user.enterprise_id : null,
        organization_name: store.user ? store.user.organization_name : null
    });

    const [newProject, setNewProject] = useState({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        priority: "medium",
        user_id: store.user ? store.user.id : null,
        enterprise_id: store.user ? store.user.enterprise_id : null
    });

    const [editingUser, setEditingUser] = useState(null);
    const [tasksWithProjects, setTasksWithProjects] = useState([]);



    const handleInputChange = (e) => {
        setNewUser({
            ...newUser,
            [e.target.name]: e.target.value
        });
    };

    const handleEditUser = (user) => {
        setEditingUser({ ...user });
    };

    const handleProjectInputChange = (e) => {
        setNewProject({
            ...newProject,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const result = await actions.updateUser(editingUser);
            if (result.success) {
                alert("Usuario actualizado con éxito");
                setEditingUser(null);
                await actions.getOrganizationUsers();
                if (editingUser.id === store.user.id) {
                    await actions.getUserLogin();
                }
            } else {
                alert("Error al actualizar usuario: " + result.message);
            }
        } catch (error) {
            alert("Error al actualizar usuario: " + error.message);
        }
    };

    const handleEditInputChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'avatar' && files.length > 0) {
            setEditingUser({
                ...editingUser,
                [name]: files[0]
            });
        } else {
            setEditingUser({
                ...editingUser,
                [name]: value
            });
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
            try {
                const result = await actions.deleteUser(userId);
                if (result.success) {
                    alert("Usuario eliminado con éxito");
                    await actions.getOrganizationUsers();
                } else {
                    alert("Error al eliminar usuario: " + result.message);
                }
            } catch (error) {
                alert("Error al eliminar usuario: " + error.message);
            }
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!store.token) {
                navigate("/login");
                return;
            }
            if (!store.user) {
                await actions.getUserLogin();
            }
            await actions.getOrganizationUsers();
            await actions.getProjects();
            const tasks = await actions.getAllTasksWithProjects();
            setTasksWithProjects(tasks);
            setFilteredTasks(tasks);
            updateCalendarEvents(tasks);
        };
        fetchData();
    }, [store.token]);

    useEffect(() => {
        if (store.tasksWithProjects) {
            filterTasks(taskFilter);
        }
    }, [store.tasksWithProjects, taskFilter]);

    const filterTasks = (status) => {
        let filtered = store.tasksWithProjects;
        if (status !== "all") {
            filtered = filtered.filter(task => task.task_status.toLowerCase() === status.toLowerCase());
        }
        filtered.sort((a, b) => new Date(a.task_due_date) - new Date(b.task_due_date));
        setFilteredTasks(filtered);
        updateCalendarEvents(filtered);
    };

    useEffect(() => {
        if (store.tasksWithProjects) {
            updateCalendarEvents(store.tasksWithProjects);
        }
    }, [store.tasksWithProjects]);

    const updateCalendarEvents = (tasks) => {
        const events = tasks.map(task => ({
            title: `${task.task_name} (${task.project_name})`,
            start: new Date(task.task_due_date),
            end: new Date(task.task_due_date),
            allDay: true,
            resource: task
        }));
        setCalendarEvents(events);
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();

            // Agregar datos del usuario
            for (let key in newUser) {
                if (newUser[key] !== undefined && newUser[key] !== null) {
                    formData.append(key, newUser[key]);
                }
            }

            // Agregar role_id y enterprise_id
            formData.append('role_id', '2');
            console.log(store.user)
            formData.append('enterprise_id', store.user.enterprise_id.toString());

            // Agregar datos de la empresa
            formData.append('organization_name', store.user.organization_name);
            formData.append('organization_address', store.user.organization_address || "Dirección no especificada");

            // Si hay un archivo de avatar, agregarlo
            if (newUser.avatar instanceof File) {
                formData.append('avatar', newUser.avatar);
            }

            console.log("Datos del nuevo usuario:", Object.fromEntries(formData));

            const result = await actions.registerUserAndEnterprise(formData);

            if (result.success) {
                alert(result.message || "Usuario creado con éxito");
                setShowCreateUser(false);
                // Reiniciar el formulario
                setNewUser({
                    first_name: "",
                    last_name: "",
                    username: "",
                    avatar: "",
                    email: "",
                    password: "",
                    role_id: 2,
                    enterprise_id: store.user.enterprise_id,
                    organization_name: store.user.organization_name
                });
                // Actualizar la lista de usuarios de la organización
                await actions.getOrganizationUsers();
            } else {
                alert("Error al crear usuario: " + result.message);
            }
        } catch (error) {
            alert("Error al crear usuario: " + error.message);
        }
    };

    const handleSelectEvent = (event) => {
        alert(`Task: ${event.resource.name}\nProject: ${event.resource.projectName}\nDescription: ${event.resource.description}`);
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!newProject.name || !newProject.description || !newProject.start_date || !newProject.end_date || !newProject.priority) {
            alert("Todos los campos son requeridos");
            return;
        }
        if (newProject.description.length > 5000) {
            alert("La descripción es demasiado larga. Por favor, acórtala.");
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        if (newProject.start_date < today || newProject.end_date < today) {
            alert("Las fechas de inicio y finalización no pueden ser anteriores a hoy.");
            return;
        }

        if (newProject.end_date < newProject.start_date) {
            alert("La fecha de finalización no puede ser anterior a la fecha de inicio.");
            return;
        }

        try {
            const projectToCreate = {
                ...newProject,
                enterprise_id: store.user.enterprise_id
            };
            console.log("Datos del nuevo proyecto:", projectToCreate);
            const result = await actions.createProject(projectToCreate);
            if (result.success) {
                alert("Proyecto creado con éxito");
                setShowCreateProject(false);
                setNewProject({
                    name: "",
                    description: "",
                    start_date: "",
                    end_date: "",
                    priority: "medium",
                    user_id: store.user.id,
                    enterprise_id: store.user.enterprise_id
                });
                await actions.getProjects(); // Refresh the projects list
            } else {
                alert("Error al crear proyecto: " + result.message);
            }
        } catch (error) {
            alert("Error al crear proyecto: " + error.message);
        }
    };

    if (!store.user) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    return (
        <div className="container-fluid profile-container">
            <div className="row">
                <div className="col-md-9">
                    <div className="card shadow-lg mb-4">
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-4 text-center">
                                    <img src={store.user.avatar} className="rounded-circle img-thumbnail mb-3 profile-image" alt="Profile" />
                                    <h2 className="text-primary">{store.user.first_name} {store.user.last_name}</h2>
                                    <p className="text-muted">{store.user.email}</p>
                                    <p className="badge bg-info">Role: {store.user.role_id}</p>
                                    <p className="text-success">Organization: {store.user.organization_name || "Not specified"}</p>
                                    <button className="btn btn-primary py-0 mb-2 " onClick={() => handleEditUser(store.user)}>
                                        Editar Perfil
                                    </button>
                                </div>
                                <div className="col-md-8">
                                    <h4 className="text-primary mb-3">Assigned Tasks</h4>
                                    <div className="mb-3">
                                        <select
                                            className="form-select"
                                            value={taskFilter}
                                            onChange={(e) => setTaskFilter(e.target.value)}
                                        >
                                            <option value="all">All</option>
                                            <option value="Pending">Pending</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </div>
                                    {filteredTasks && filteredTasks.length > 0 ? (
                                        filteredTasks.map(task => (
                                            <div key={task.task_id} className="card mb-2">
                                                <div className="card-body">
                                                    <h5 className="card-title">{task.task_name}</h5>
                                                    <h6 className="card-subtitle mb-2 text-muted">Project: {task.project_name}</h6>
                                                    <p className="card-text">{task.task_description}</p>
                                                    <p className="card-text"><small className="text-muted">Status: {task.task_status}</small></p>
                                                    <p className="card-text"><small className="text-muted">Due date: {new Date(task.task_due_date).toLocaleDateString()}</small></p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No tasks assigned for this filter.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card mb-4">
                        <div className="card-body">
                            <h4 className="card-title">My Projects</h4>
                            <ul className="list-group">
                                {store.projects.map((project) => (
                                    <li key={project.id} className="list-group-item">
                                        {project.name} - {project.description}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="card  mb-4">
                        <div className="card-body">
                            <h4 className="card-title">Organization Users</h4>
                            <table className="table ">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Last Name</th>
                                        <th>Email</th>
                                        <th>Username</th>
                                        <th>Role</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {store.organizationUsers && store.organizationUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td>{user.first_name}</td>
                                            <td>{user.last_name}</td>
                                            <td>{user.email}</td>
                                            <td>{user.username}</td>
                                            <td>{user.role_id}</td>
                                            <td>
                                                <button className="btn btn-primary btn-sm m-2 px-4" onClick={() => handleEditUser(user)}>
                                                    Edit
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(user.id)}>
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="card mb-4">
                        <div className="card-body">
                            <h4 className="card-title">Task Calendar</h4>
                            <div className="calendar-container">
                                <Calendar
                                    localizer={localizer}
                                    events={calendarEvents}
                                    startAccessor="start"
                                    endAccessor="end"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card shadow-lg side-menu">
                        <div className="card-body">
                            <h4 className="card-title">Quick Actions</h4>
                            <div className="d-grid gap-2">
                                {(store.user.role_id === 1 || store.user.role_id === "1") && (
                                    <>
                                        <button className="btn btn-primary" onClick={() => setShowCreateUser(!showCreateUser)}>
                                            Create User
                                        </button>
                                        <Link className="btn btn-warning" to="/taskmanager">Graph Management</Link>
                                    </>
                                )}
                                <button className="btn btn-success" onClick={() => setShowCreateProject(!showCreateProject)}>
                                    Create Project
                                </button>
                                <Link className="btn btn-info" to="/projectmanager">Project Manager</Link>
                            </div>
                        </div>
                    </div>
                    <div className="card shadow-lg side-menu mt-4">
                        <div className="card-body">
                            <h4 className="card-title">Weather Forecast</h4>
                            <Weather />
                        </div>
                    </div>
                </div>
            </div>

            {showCreateUser && (
                <div className="modal show">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Create New User</h5>
                                <button type="button" className="btn-close" onClick={() => setShowCreateUser(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleCreateUser}>
                                    <div className="mb-3">
                                        <label htmlFor="first_name" className="form-label">First Name</label>
                                        <input type="text" className="form-control" id="first_name" name="first_name" value={newUser.first_name} onChange={handleInputChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="last_name" className="form-label">Last Name</label>
                                        <input type="text" className="form-control" id="last_name" name="last_name" value={newUser.last_name} onChange={handleInputChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="username" className="form-label">Username</label>
                                        <input type="text" className="form-control" id="username" name="username" value={newUser.username} onChange={handleInputChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">Email</label>
                                        <input type="email" className="form-control" id="email" name="email" value={newUser.email} onChange={handleInputChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label">Password</label>
                                        <input type="password" className="form-control" id="password" name="password" value={newUser.password} onChange={handleInputChange} required />
                                    </div>
                                    <button type="submit" className="btn btn-primary">Create User</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showCreateProject && (
                <div className="modal show">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Create New Project</h5>
                                <button type="button" className="btn-close" onClick={() => setShowCreateProject(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleCreateProject}>
                                    <div className="mb-3">
                                        <label htmlFor="name" className="form-label">Project Name</label>
                                        <input type="text" className="form-control" id="name" name="name" value={newProject.name} onChange={handleProjectInputChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="description" className="form-label">Description</label>
                                        <textarea className="form-control" id="description" name="description" value={newProject.description} onChange={handleProjectInputChange} required></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="start_date" className="form-label">Start Date</label>
                                        <input type="date" className="form-control" id="start_date" name="start_date" value={newProject.start_date} onChange={handleProjectInputChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="end_date" className="form-label">End Date</label>
                                        <input type="date" className="form-control" id="end_date" name="end_date" value={newProject.end_date} onChange={handleProjectInputChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="priority" className="form-label">Priority</label>
                                        <select className="form-select" id="priority" name="priority" value={newProject.priority} onChange={handleProjectInputChange} required>
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="btn btn-primary">Create Project</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {editingUser && (
                <div className="modal show">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit User</h5>
                                <button type="button" className="btn-close" onClick={() => setEditingUser(null)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleUpdateUser}>
                                    <div className="mb-3">
                                        <label htmlFor="edit_first_name" className="form-label">First Name</label>
                                        <input type="text" className="form-control" id="edit_first_name" name="first_name" value={editingUser.first_name} onChange={handleEditInputChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="edit_last_name" className="form-label">Last Name</label>
                                        <input type="text" className="form-control" id="edit_last_name" name="last_name" value={editingUser.last_name} onChange={handleEditInputChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="edit_username" className="form-label">Username</label>
                                        <input type="text" className="form-control" id="edit_username" name="username" value={editingUser.username} onChange={handleEditInputChange} required />
                                    </div>
                                    <div className="mb-3 d-flex flex-column">
                                        <label htmlFor="avatar" className="form-label">Profile Image</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            id="avatar"
                                            name="avatar"
                                            onChange={handleEditInputChange}
                                            accept="image/*"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="edit_email" className="form-label">Email</label>
                                        <input type="email" className="form-control" id="edit_email" name="email" value={editingUser.email} onChange={handleEditInputChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="edit_role_id" className="form-label">Role</label>
                                        <select className="form-select" id="edit_role_id" name="role_id" value={editingUser.role_id} onChange={handleEditInputChange} required>
                                            <option value="1">Admin</option>
                                            <option value="2">User</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="edit_password" className="form-label">Password (leave blank to keep current)</label>
                                        <input type="password" className="form-control" id="edit_password" name="password" value={editingUser.password || ''} onChange={handleEditInputChange} />
                                    </div>
                                    <button type="submit" className="btn btn-primary">Update User</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
import React, { useEffect, useContext, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

export const Profile = () => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();
    const [showCreateUser, setShowCreateUser] = useState(false);
    const [showCreateProject, setShowCreateProject] = useState(false);
    const [newUser, setNewUser] = useState({
        first_name: "",
        last_name: "",
        username: "",
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
            } else {
                alert("Error al actualizar usuario: " + result.message);
            }
        } catch (error) {
            alert("Error al actualizar usuario: " + error.message);
        }
    };

    const handleEditInputChange = (e) => {
        setEditingUser({
            ...editingUser,
            [e.target.name]: e.target.value
        });
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
        };
        fetchData();
    }, [store.token]);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const userToCreate = {
                user: {
                    ...newUser,
                    role_id: 2,
                    enterprise_id: store.user.enterprise_id
                },
                enterprise: {
                    name: store.user.organization_name,
                    // Asumimos que ya tienes la dirección de la empresa en el store
                    address: store.user.organization_address || "Dirección no especificada"
                }
            };
            console.log("Datos del nuevo usuario:", userToCreate);
            const result = await actions.registerUserAndEnterprise(userToCreate);
            if (result.success) {
                alert(result.message || "Usuario creado con éxito");
                setShowCreateUser(false);
                // Reiniciar el formulario
                setNewUser({
                    first_name: "",
                    last_name: "",
                    username: "",
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
        if (!newProject.name || !newProject.description || !newProject.start_date || !newProject.end_date) {
            alert("Todos los campos son requeridos");
            return;
        }
        if (newProject.description.length > 5000) {  // Ajusta este número según tus necesidades
            alert("La descripción es demasiado larga. Por favor, acórtala.");
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
        <div className="container my-5">
            <div className="card shadow-lg">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-4 text-center d-flex flex-column align-items-center">
                            <img src="https://picsum.photos/200" className="rounded-circle img-thumbnail mb-3 col-8" alt="Imagen de perfil" />
                            <h2 className="text-primary">{store.user.first_name} {store.user.last_name}</h2>
                            <p className="text-muted">{store.user.email}</p>
                            <p className="badge bg-info col-2">Rol: {store.user.role_id}</p>

                            <button className="btn btn-primary py-0 mb-2" onClick={() => handleEditUser(store.user)}>
                                Editar Perfil
                            </button>


                            <p className="text-success">Organización: {store.user.organization_name || "No especificada"}</p>
                        </div>
                        <div className="col-md-8">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3 className="text-secondary">Perfil de Usuario</h3>
                                <div>
                                    {(store.user.role_id === 1 || store.user.role_id === "1") && (
                                        <button className="btn btn-outline-primary me-2" onClick={() => setShowCreateUser(!showCreateUser)}>
                                            Crear Usuario
                                        </button>
                                    )}
                                    <button className="btn btn-outline-success" onClick={() => setShowCreateProject(!showCreateProject)}>
                                        Crear Proyecto
                                    </button>
                                </div>
                            </div>
                            <div className="form-check form-switch mb-4">
                                <input type="checkbox" className="form-check-input" id="user-notifications" />
                                <label htmlFor="user-notifications" className="form-check-label">
                                    Notificaciones
                                </label>
                            </div>
                            <div className="card bg-light">
                                <div className="card-body">
                                    <h4 className="card-title text-primary">Tareas Asignadas</h4>
                                    {tasksWithProjects && tasksWithProjects.length > 0 ? (
                                        tasksWithProjects.map(task => (
                                            <div key={task.task_id} className="card mb-2">
                                                <div className="card-body">
                                                    <h5 className="card-title">{task.task_name}</h5>
                                                    <h6 className="card-subtitle mb-2 text-muted">Proyecto: {task.project_name}</h6>
                                                    <p className="card-text">{task.task_description}</p>
                                                    <p className="card-text"><small className="text-muted">Estado: {task.task_status}</small></p>
                                                    <p className="card-text"><small className="text-muted">Fecha de vencimiento: {new Date(task.task_due_date).toLocaleDateString()}</small></p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No hay tareas asignadas.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card mt-4">
                <div className="card-body">
                    <h3 className="card-title">Mis Proyectos</h3>
                    <ul className="list-group">
                        {store.projects.map((project) => (
                            <li key={project.id} className="list-group-item">
                                {project.name} - {project.description}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="card mt-4">
                <div className="card-body">
                    <h3 className="card-title">Usuarios de la Organización</h3>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Apellido</th>
                                <th>Email</th>
                                <th>Username</th>
                                <th>Rol</th>
                                <th>Acciones</th>
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
                                        {(store.user.role_id === 1 || store.user.role_id === "1") && (
                                            <button className="btn btn-primary btn-sm" onClick={() => handleEditUser(user)}>
                                                Editar
                                            </button>
                                        )}

                                        {(store.user.role_id === 1 || store.user.role_id === "1") && (
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(user.id)}>
                                                Eliminar
                                            </button>
                                        )}

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="card mt-4">
                <div className="card-body">
                    <h3 className="card-title">Calendario de Tareas</h3>

                </div>
            </div>
            {showCreateUser && (
                <div className="mt-4">
                    <h3>Crear Nuevo Usuario</h3>
                    <form onSubmit={handleCreateUser} className="d-flex flex-column gap-3 border p-3 rounded">
                        <div className="mb-3">
                            <label htmlFor="first_name" className="form-label">Nombre</label>
                            <input
                                type="text"
                                name="first_name"
                                id="first_name"
                                placeholder="Nombre"
                                value={newUser.first_name}
                                className="form-control"
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="last_name" className="form-label">Apellido</label>
                            <input
                                type="text"
                                name="last_name"
                                id="last_name"
                                placeholder="Apellido"
                                value={newUser.last_name}
                                className="form-control"
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="username" className="form-label">Nombre de usuario</label>
                            <input
                                type="text"
                                name="username"
                                id="username"
                                placeholder="Nombre de usuario"
                                value={newUser.username}
                                className="form-control"
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                placeholder="Email"
                                value={newUser.email}
                                className="form-control"
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Contraseña</label>
                            <input
                                type="password"
                                name="password"
                                id="password"
                                placeholder="Contraseña"
                                value={newUser.password}
                                className="form-control"
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Crear Usuario</button>
                    </form>
                </div>
            )}
            {showCreateProject && (
                <div className="mt-4">
                    <h3>Crear Nuevo Proyecto</h3>
                    <form onSubmit={handleCreateProject} className="d-flex flex-column gap-3 border p-3 rounded">
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">Nombre del Proyecto</label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                placeholder="Nombre del Proyecto"
                                value={newProject.name}
                                className="form-control"
                                onChange={handleProjectInputChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="description" className="form-label">Descripción</label>
                            <textarea
                                name="description"
                                id="description"
                                placeholder="Descripción del Proyecto"
                                value={newProject.description}
                                className="form-control"
                                onChange={handleProjectInputChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="description" className="form-label">Fecha de Inicio</label>
                            <input
                                type="date"
                                name="start_date"
                                id="start_date"
                                value={newProject.start_date}
                                className="form-control"
                                onChange={handleProjectInputChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="end_date" className="form-label">Fecha de Finalización</label>
                            <input
                                type="date"
                                name="end_date"
                                id="end_date"
                                value={newProject.end_date}
                                className="form-control"
                                onChange={handleProjectInputChange}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Crear Proyecto</button>
                    </form>
                </div>
            )}
            {editingUser && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Editar Usuario</h5>
                                <button type="button" className="btn-close" onClick={() => setEditingUser(null)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleUpdateUser}>
                                    <div className="mb-3">
                                        <label htmlFor="edit_first_name" className="form-label">Nombre</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="edit_first_name"
                                            name="first_name"
                                            value={editingUser.first_name}
                                            onChange={handleEditInputChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="edit_last_name" className="form-label">Apellido</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="edit_last_name"
                                            name="last_name"
                                            value={editingUser.last_name}
                                            onChange={handleEditInputChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="edit_username" className="form-label">Nombre de usuario</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="edit_username"
                                            name="username"
                                            value={editingUser.username}
                                            onChange={handleEditInputChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="edit_email" className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="edit_email"
                                            name="email"
                                            value={editingUser.email}
                                            onChange={handleEditInputChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="edit_password" className="form-label">Contraseña (dejar en blanco si no se cambia)</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="edit_password"
                                            name="password"
                                            value={editingUser.password || ''}
                                            onChange={handleEditInputChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="edit_role_id" className="form-label">Rol</label>
                                        <select
                                            className="form-control"
                                            id="edit_role_id"
                                            name="role_id"
                                            value={editingUser.role_id}
                                            onChange={handleEditInputChange}
                                        >
                                            <option value="1">Administrador</option>
                                            <option value="2">Usuario</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="btn btn-primary">Actualizar</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
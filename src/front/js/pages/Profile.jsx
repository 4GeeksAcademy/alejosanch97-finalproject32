import React, { useEffect, useContext, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";


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

    const handleInputChange = (e) => {
        setNewUser({
            ...newUser,
            [e.target.name]: e.target.value
        });
    };

    const handleProjectInputChange = (e) => {
        setNewProject({
            ...newProject,
            [e.target.name]: e.target.value
        });
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
                        <div className="col-md-4 text-center">
                            <img src="https://picsum.photos/200" className="rounded-circle img-thumbnail mb-3" alt="Imagen de perfil" />
                            <h2 className="text-primary">{store.user.first_name} {store.user.last_name}</h2>
                            <p className="text-muted">{store.user.email}</p>
                            <p className="badge bg-info">Rol: {store.user.role_id}</p>
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
                                    {store.tasks && store.tasks.length > 0 ? (
                                        store.tasks.map(task => (
                                            <div key={task.id} className="card mb-2">
                                                <div className="card-body">
                                                    <h5 className="card-title">{task.name}</h5>
                                                    <p className="card-text">{task.description}</p>
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
                                </tr>
                            ))}
                        </tbody>
                    </table>    
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
        </div>
    );
};
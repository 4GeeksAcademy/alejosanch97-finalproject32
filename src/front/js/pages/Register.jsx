import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";

export const Register = () => {
    const { actions } = useContext(Context);
    const navigate = useNavigate();
    
    const [user, setUser] = useState({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        password: "",
        role_id: "",
        enterprise_id: "",
        organization_name: ""
    });
    
    const [error, setError] = useState("");

    const handleChange = (event) => {
        setUser({
            ...user,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const result = await actions.register(user);
            if (result.success) {
                navigate("/login");  // Redirige al login después de un registro exitoso
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError("Error en el registro. Por favor, inténtalo de nuevo.");
        }
    };

    return (
        <div className="w-50 mx-auto">
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3 border p-3 rounded">
                <h2 className="text-center mt-3">Registro</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="mb-3">
                    <label htmlFor="first_name" className="form-label">Nombre</label>
                    <input
                        type="text"
                        name="first_name"
                        id="first_name"
                        placeholder="Nombre"
                        value={user.first_name}
                        className="form-control"
                        onChange={handleChange}
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
                        value={user.last_name}
                        className="form-control"
                        onChange={handleChange}
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
                        value={user.username}
                        className="form-control"
                        onChange={handleChange}
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
                        value={user.email}
                        className="form-control"
                        onChange={handleChange}
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
                        value={user.password}
                        className="form-control"
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="role_id" className="form-label">Rol</label>
                    <select
                        name="role_id"
                        id="role_id"
                        className="form-select"
                        value={user.role_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Selecciona un rol</option>
                        <option value="1">Admin</option>
                        <option value="2">Usuario</option>
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="enterprise_id" className="form-label">ID de la Empresa</label>
                    <input
                        type="number"
                        name="enterprise_id"
                        id="enterprise_id"
                        placeholder="ID de la Empresa"
                        value={user.enterprise_id}
                        className="form-control"
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="organization_name" className="form-label">Nombre de la Organización</label>
                    <input
                        type="text"
                        name="organization_name"
                        id="organization_name"
                        placeholder="Nombre de la Organización"
                        value={user.organization_name}
                        className="form-control"
                        onChange={handleChange}
                    />
                </div>
                <button type="submit" className="btn btn-primary">Registrarse</button>
                <div className="mt-3 text-center">
                    ¿Ya tienes una cuenta?
                    <Link to="/login" className="ms-2 text-decoration-none">
                        Inicia sesión aquí
                    </Link>e
                </div>
            </form>
        </div>
    );
};
import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";

export const Register = () => {
    const { actions } = useContext(Context);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        user: {
            first_name: "",
            last_name: "",
            username: "",
            email: "",
            password: "",
            role_id: "",
        },
        enterprise: {
            name: "",
            address: ""
        }
    });

    const [error, setError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;
        if (name === "name" || name === "address") {
            setFormData(prevState => ({
                ...prevState,
                enterprise: {
                    ...prevState.enterprise,
                    [name]: value
                }
            }));
        } else {
            setFormData(prevState => ({
                ...prevState,
                user: {
                    ...prevState.user,
                    [name]: value
                }
            }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const result = await actions.registerUserAndEnterprise(formData);
            if (result.success) {
                navigate("/login");
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
                <h4>Información del Usuario</h4>
                <div className="mb-3">
                    <label htmlFor="first_name" className="form-label">Nombre</label>
                    <input
                        type="text"
                        name="first_name"
                        id="first_name"
                        placeholder="Nombre"
                        value={formData.user.first_name}
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
                        value={formData.user.last_name}
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
                        value={formData.user.username}
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
                        value={formData.user.email}
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
                        value={formData.user.password}
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
                        value={formData.user.role_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Selecciona un rol</option>
                        <option value="1">Admin</option>
                        <option value="2">Usuario</option>
                    </select>
                </div>
                <h4>Información de la Empresa</h4>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Nombre de la Empresa</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        placeholder="Nombre de la Empresa"
                        value={formData.enterprise.name}
                        className="form-control"
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="address" className="form-label">Dirección de la Empresa</label>
                    <input
                        type="text"
                        name="address"
                        id="address"
                        placeholder="Dirección de la Empresa"
                        value={formData.enterprise.address}
                        className="form-control"
                        onChange={handleChange}
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary">Registrarse</button>
                <div className="mt-3 text-center">
                    ¿Ya tienes una cuenta?
                    <Link to="/login" className="ms-2 text-decoration-none">
                        Inicia sesión aquí
                    </Link>
                </div>
            </form>
        </div>
    );
};
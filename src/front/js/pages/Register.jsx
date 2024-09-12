import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/register.css";

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
        },
        avatar: null  // Nuevo campo para el archivo de avatar
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
        } else if (name === "avatar") {
            setFormData(prevState => ({
                ...prevState,
                avatar: event.target.files[0]  // Guardamos el archivo directamente
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
            const newFormData = new FormData();
            
            // Agregar los datos del usuario
            Object.entries(formData.user).forEach(([key, value]) => {
                newFormData.append(key, value);
            });
            
            // Agregar los datos de la empresa
            Object.entries(formData.enterprise).forEach(([key, value]) => {
                newFormData.append(key, value);
            });
            
            // Agregar el archivo de avatar
            if (formData.avatar) {
                newFormData.append("avatar", formData.avatar);
            }

            const result = await actions.registerUserAndEnterprise(newFormData);
            if (result.success) {
                navigate("/login");
            } else {
                setError(result.message || "Error en el registro. Por favor, inténtalo de nuevo.");
            }
        } catch (error) {
            setError("Error en el registro. Por favor, inténtalo de nuevo.");
        }
    };

    return (
        <div className="area">
            <ul className="circles">
                {[...Array(10)].map((_, i) => (
                    <li key={i}></li>
                ))}
            </ul>
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6">
                        <div className="card shadow-lg">
                            <div className="card-body p-5">
                                <h2 className="text-center mb-4">Registro</h2>
                                {error && <div className="alert alert-danger">{error}</div>}
                                <form onSubmit={handleSubmit}>
                                    <h4 className="mb-3">Información del Usuario</h4>
                                    <div className="mb-3">
                                        <label htmlFor="first_name" className="form-label">Nombre</label>
                                        <input
                                            type="text"
                                            name="first_name"
                                            id="first_name"
                                            placeholder="Nombre"
                                            value={formData.first_name}
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
                                            value={formData.last_name}
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
                                            value={formData.username}
                                            className="form-control"
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3 d-flex flex-column">
                                        <label htmlFor="avatar" className="form-label">Imagen de perfile</label>
                                        <input
                                            type="file"
                                            id="avatar"
                                            name="avatar"
                                            accept="image/png, image/jpeg"

                                            className="form-control"
                                            onChange={(event) => {
                                                setFormData({ ...formData, avatar: event.target.files[0] })
                                            }}
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
                                            value={formData.email}
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
                                            value={formData.password}
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
                                            value={formData.role_id}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Selecciona un rol</option>
                                            <option value="1">Admin</option>
                                            <option value="2">Usuario</option>
                                        </select>
                                    </div>
                                    <h4 className="mb-3 mt-4">Información de la Empresa</h4>
                                    <div className="mb-3">
                                        <label htmlFor="name" className="form-label">Nombre de la Empresa</label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            placeholder="Nombre de la Empresa"
                                            value={formData.name}
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
                                            value={formData.address}
                                            className="form-control"
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100 mt-3">Registrarse</button>
                                </form>
                                <div className="mt-3 text-center">
                                    ¿Ya tienes una cuenta?
                                    <Link to="/login" className="ms-2 text-decoration-none">
                                        Inicia sesión aquí
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

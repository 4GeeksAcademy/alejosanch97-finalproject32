import React, { useState, useContext } from "react";
import { Link } from "react-router-dom"
import { Context } from "../store/appContext"
import { Navigate } from "react-router-dom"
import "../../styles/login.css";

const initialState = {
    email: "",
    password: ""
}

export const Login = () => {
    const { actions } = useContext(Context)

    const [user, setUser] = useState(initialState)
    const [isLoged, setIsLoged] = useState(false)
    const [loginFail, setLoginFail] = useState(false)

    const handleChange = (event) => {
        setUser({
            ...user,
            [event.target.name]: event.target.value
        })
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        try {
            const response = await actions.login(user)
            if (response) {
                setIsLoged(true)
            } else {
                setLoginFail(true)
            }
            console.log(response)
        } catch (error) {
            console.log(error)
            setLoginFail(true)
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="branding-section">
                    <img src="https://i.imgur.com/Nkysfkd.jpeg" alt="Tasky Logo" className="logo" />
                    <h2 className="welcome-text">Bienvenido a Tasky</h2>
                    <p className="description">Organiza tus tareas de manera eficiente y mejora tu productividad.</p>
                    <img src="https://i.pinimg.com/564x/75/65/f9/7565f983496a88a43ba7cfaaaf7ccf81.jpg" alt="Productivity" className="productivity-image" />
                </div>
                <div className="form-section">
                    <h2 className="form-title">Iniciar sesión</h2>
                    {isLoged ? (
                        <Navigate to="/profile" />
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="user_email" className="form-label">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    id="user_email"
                                    placeholder="Email"
                                    value={user.email}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="user_password" className="form-label">Contraseña</label>
                                <input
                                    type="password"
                                    name="password"
                                    id="user_password"
                                    placeholder="Contraseña"
                                    value={user.password}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>
                            <button type="submit" className="btn btn-primary w-100">Iniciar sesión</button>
                            <div className="mt-3 text-center">
                                <span>¿No tienes una cuenta? </span>
                                <Link to="/register" className="register-link">
                                    Regístrate aquí
                                </Link>
                            </div>
                            <div className="mt-2 text-center">
                                <Link to="/tasks" className="forgot-password-link">
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                        </form>
                    )}
                    {loginFail && (
                        <div className="alert alert-danger mt-3" role="alert">
                            <strong>Error: </strong>
                            Datos inválidos. Por favor, intenta de nuevo.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

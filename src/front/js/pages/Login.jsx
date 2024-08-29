import React, { useState, useContext } from "react";
import { Link } from "react-router-dom"
import { Context } from "../store/appContext"
import { Navigate } from "react-router-dom"

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
        <div className="w-50 mx-auto">
            {
                isLoged ? <Navigate to="/profile" /> :
                    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3 border p-3 rounded">
                        <h2 className="text-center mt-3">Iniciar sesion</h2>
                        <div className="mb-3">
                            <label htmlFor="user_email" className="form-label">Email</label>
                            <input
                                type="email"
                                name="email"
                                id="user_email"
                                placeholder="Email"
                                value={user.email}
                                className="form-control"
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="user_password" className="form-label">Password</label>
                            <input
                                type="password"
                                name="password"
                                id="user_password"
                                placeholder="Password"
                                value={user.password}
                                className="form-control"
                                onChange={handleChange}
                            />
                        </div>
                        <button className="btn btn-primary">Login</button>
                        {/* New register button and link */}
                        <div className="mt-3 text-center">
                            ¿No tienes una cuenta?
                            <Link to="/register" className="ms-2 text-decoration-none">
                            Regístrate aquí
                            </Link>
                        </div>
                        {/* End of new register button and link */}
                    </form>
            }
            {
                loginFail ? <div class="alert alert-danger" role="alert">
                    Datos Invalidos
                </div> : <></>

            }
        </div>
    )
}

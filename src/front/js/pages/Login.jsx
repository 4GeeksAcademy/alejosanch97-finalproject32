import React from "react";

export const Login = () => {
    return (
        <div className="w-50 mx-auto">
            <form action="" className="d-flex flex-column gap-3 border p-3 rounded">
                <h2 className="text-center mt-3">Iniciar sesion</h2>
                <div className="mb-3">
                    <label htmlFor="user_email" className="form-label">Email</label>
                    <input type="email" name="email" id="user_email" placeholder="Email" className="form-control" />
                </div>
                <div className="mb-3">
                    <label htmlFor="user_password" className="form-label">Password</label>
                    <input type="password" name="password" id="user_password" placeholder="Password" className="form-control" />
                </div>
                <button className="btn btn-primary">Login</button>
            </form>
        </div>
    )
}

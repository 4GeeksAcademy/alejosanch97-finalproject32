import React, { useState, useContext } from "react";
import { Context } from "../store/appContext";

export const Tasks = () => {
    const { actions } = useContext(Context);
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage("Las contraseñas no coinciden");
            return;
        }
        try {
            const response = await actions.resetPassword({ email, newPassword });
            if (response.success) {
                setIsSuccess(true);
                setMessage("Contraseña restablecida con éxito");
            } else {
                setMessage(response.message || "Error al restablecer la contraseña");
            }
        } catch (error) {
            setMessage("Error en la conexión");
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-card">
                <h2>Restablecer Contraseña</h2>
                {!isSuccess ? (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="newPassword" className="form-label">Nueva Contraseña</label>
                            <input
                                type="password"
                                className="form-control"
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña</label>
                            <input
                                type="password"
                                className="form-control"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-100">Restablecer Contraseña</button>
                    </form>
                ) : (
                    <p>Tu contraseña ha sido restablecida. Por favor, inicia sesión con tu nueva contraseña.</p>
                )}
                {message && <div className={`alert ${isSuccess ? 'alert-success' : 'alert-danger'} mt-3`}>{message}</div>}
            </div>
        </div>
    );
};
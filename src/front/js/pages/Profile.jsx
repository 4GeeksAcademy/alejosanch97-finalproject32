import React from "react";

export const Profile = () => {
    return (
        <div className="conatiner-fluid m-5">
            <div className="d-flex border rounded">
                <div className="my-auto col-3 justify-content-center d-flex">
                    <img src="https://picsum.photos/200" className="rounded-circle" alt="Imagen de perfil" />
                </div>
                <div className="ms-4 my-auto">
                    <h2>Jose Hernandez</h2>
                    <h3>josemiguelhernandezsousa@gmail.com</h3>
                    <h3>Rol: Developer</h3>
                    <div className="form-check">
                        <input type="checkbox" className="form-check-input" name="Notifications" id="user-notifications" />
                        <label htmlFor="user-notifications" className="from-check-label">
                            Notificaciones
                        </label>
                    </div>
                    <div className="border m-3">
                        <h3>Tareas asignadas</h3>
                        <h4>Proyecto 1</h4>
                        <ul>
                            <li>Task 1</li>
                            <li>Task 2</li>
                            <li>Task 3</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

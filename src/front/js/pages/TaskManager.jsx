import React from "react";

export const TaskManager = () => {
    return (
        <div>
            <div className="border m-3">
                <h2>Lista de tareas</h2>
                <div className="border m-3">
                    <h3>Proyecto 1</h3>
                    <ul className="d-flex flex-column gap-3">
                        <li className="border p-3">
                            <div className="form-check">
                                <input type="checkbox" className="form-check-input" id="task" />
                                <label htmlFor="task" className="form-check-label"> Task 1</label>
                            </div>
                            <button className="btn btn-primary m-3">Eliminar Tarea</button>
                            <button className="btn btn-primary m-3">Modificar Tarea</button>
                            <button className="btn btn-primary m-3">Marcar como lista</button>
                        </li>
                        <li className="border p-3">
                            <div className="form-check">
                                <input type="checkbox" className="form-check-input" id="task" />
                                <label htmlFor="task" className="form-check-label"> Task 1</label>
                            </div>
                            <button className="btn btn-primary m-3">Eliminar Tarea</button>
                            <button className="btn btn-primary m-3">Modificar Tarea</button>
                            <button className="btn btn-primary m-3">Marcar como lista</button>
                        </li>
                        <li className="border p-3">
                            <div className="form-check">
                                <input type="checkbox" className="form-check-input" id="task" />
                                <label htmlFor="task" className="form-check-label"> Task 3</label>
                            </div>
                            <button className="btn btn-primary m-3">Eliminar Tarea</button>
                            <button className="btn btn-primary m-3">Modificar Tarea</button>
                            <button className="btn btn-primary m-3">Marcar como lista</button>
                        </li>
                    </ul>
                    <button className="btn btn-primary m-3">Crear Tareas</button>
                    <button className="btn btn-primary m-3">Agregar Usuarios</button>
                </div>
            </div>
        </div>
    )
}

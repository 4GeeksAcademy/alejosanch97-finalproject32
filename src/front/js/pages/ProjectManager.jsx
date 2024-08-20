import React from "react";

export const ProjectManager = () => {
    return (
        <div>
            <div className="border m-3 p-3">
                <h3>Lista de proyectos</h3>
                <div className="border m-3 p-3">
                    <h2>Proyecto 1</h2>
                    <div className="d-flex gap-5">
                        <div>
                            <div className="form-check">
                                <input type="checkbox" className="form-check-input" id="task" />
                                <label htmlFor="task" className="form-check-label"> Task 1</label>
                            </div>
                            <div className="form-check">
                                <input type="checkbox" className="form-check-input" id="task" />
                                <label htmlFor="task" className="form-check-label"> Task 2</label>
                            </div>
                            <div className="form-check">
                                <input type="checkbox" className="form-check-input" id="task" />
                                <label htmlFor="task" className="form-check-label"> Task 3</label>
                            </div>
                        </div>
                        <div>
                            Lista de usuarios:
                            <ul>
                                <li>Jose</li>
                                <li>Huttman</li>
                                <li>Adolfo</li>
                            </ul>
                        </div>
                    </div>
                    <div className="d-flex gap-3">
                        <button className="btn btn-primary">Eliminar proyecto</button>
                        <button className="btn btn-primary">Modificar proyecto</button>
                        <button className="btn btn-primary">Crear Tareas</button>
                        <button className="btn btn-primary">Agregar Usuarios</button>
                    </div>
                </div>
                <div className="border m-3 p-3">
                    <h2>Proyecto 2</h2>
                    <div className="d-flex gap-5">
                        <div>
                            <div className="form-check">
                                <input type="checkbox" className="form-check-input" id="task" />
                                <label htmlFor="task" className="form-check-label"> Task 1</label>
                            </div>
                            <div className="form-check">
                                <input type="checkbox" className="form-check-input" id="task" />
                                <label htmlFor="task" className="form-check-label"> Task 2</label>
                            </div>
                            <div className="form-check">
                                <input type="checkbox" className="form-check-input" id="task" />
                                <label htmlFor="task" className="form-check-label"> Task 3</label>
                            </div>
                        </div>
                        <div>
                            Lista de usuarios:
                            <ul>
                                <li>Jose</li>
                                <li>Huttman</li>
                                <li>Adolfo</li>
                            </ul>
                        </div>
                    </div>
                    <div className="d-flex gap-3">
                        <button className="btn btn-primary">Eliminar proyecto</button>
                        <button className="btn btn-primary">Modificar proyecto</button>
                        <button className="btn btn-primary">Crear Tareas</button>
                        <button className="btn btn-primary">Agregar Usuarios</button>
                    </div>
                </div>
                <button className="btn btn-primary">Crear proyecto</button>
            </div>
        </div>
    )
}

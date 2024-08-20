import React from "react";

export const Tasks = () => {
    return (
        <div className="border w-75 mx-auto mt-3 p-3 d-flex flex-column gap-3 rounded">
            <div className="border p-3 rounded">
                <h2>Tareas disponibles</h2>
                <ul>
                    <li>Tarea 1</li>
                    <li>Tarea 2</li>
                </ul>
            </div>
            <div className="border p-3 rounded">
                <h2>Tareas pendientes</h2>
                <ul>
                    <li>Tarea 1</li>
                    <li>Tarea 2</li>
                </ul>
            </div>
            <div className="border p-3 rounded">
                <h2>Tareas completadas</h2>
                <ul>
                    <li>Tarea 1</li>
                    <li>Tarea 2</li>
                </ul>
            </div>
        </div>
    )
}

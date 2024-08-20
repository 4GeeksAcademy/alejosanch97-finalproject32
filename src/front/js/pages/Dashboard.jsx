import React from "react";

export const Dashboard = () => {
    return (
        <div className="conatiner-fluid p-5 d-flex flex-column">
            <div className="col-4 border w-75 mx-auto">
                <div>
                    <h3>
                        Dashboard
                    </h3>
                </div>
            </div>
            <div className="col-4 border w-75 mx-auto">
                <div>
                    <h3>Tareas pendientes</h3>
                    <h3>Tareas completadas</h3>
                    <h3>Anadir tareas</h3>
                </div>
            </div>
            <div className="col-4 border w-75 mx-auto">
                <div>
                    <h3>Grupos</h3>
                </div>
            </div>
        </div>
    )
}

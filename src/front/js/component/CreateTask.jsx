import React, { useState } from "react";

export const CreateTask = () => {

    const [task, setTask] = useState(initialState)
    const [error, setError] = useState(false)
    const [taskList, setTaskList] = useState([])

    

    return (
        <div className="d-flex flex-column justify-content-center container mt-5">
            <label>Task´s Name</label>
            <input
                type="text"
                className="col-10 mb-4 p-2"

            />
            <label>Details</label>
            <input
                type="text"
                className="col-10 mb-4 p-2"

            />
            <label>Start Date</label>
            <input
                type="date"
                className="col-10 mb-4 p-2"
            />
            <label>Due Date</label>
            <input
                type="date"
                className="col-10 mb-4 p-2"
                placeholder="Start Date"
            />
            <label>Assign to</label>
            <select
                name=""
                className=" col-10 mb-3 p-2"
                id="">
                <option value="">Staff</option>
                <option value="">Maverick</option>
                <option value="">Jose</option>
                <option value="">Adolfo</option>
                <option value="">Miguel</option>
            </select>

            <div className="d-flex  mt-5">
                <button className="btn btn-primary col-10">Create</button>
            </div>
        </div>


    )
}
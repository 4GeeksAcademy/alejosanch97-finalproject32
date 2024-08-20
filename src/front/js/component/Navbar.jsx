import React from "react";
import { Link } from "react-router-dom";

export const Navbar = () => {
    return (
        <nav class="navbar navbar-expand-lg bg-body-tertiary">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">Productividad</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <Link className="nav-link" to="/">Home</Link>
                        </li>
                        <li class="nav-item">
                            <Link className="nav-link" to="/login">Login</Link>
                        </li>
                        <li class="nav-item">
                            <Link className="nav-link" to="/tasks">Tasks</Link>
                        </li>
                        <li class="nav-item">
                            <Link className="nav-link" to="/profile">Profile</Link>
                        </li>
                        <li class="nav-item">
                            <Link className="nav-link" to="/projectmanager">Project Manager</Link>
                        </li>
                        <li class="nav-item">
                            <Link className="nav-link" to="/taskmanager">Task Manager</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}

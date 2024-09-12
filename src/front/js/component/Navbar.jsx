import React from "react";
import { Link } from "react-router-dom";
import "../../styles/navbar.css";

export const Navbar = () => {
    return (
        <nav className="navbar">
        <div className="navbar-container">
            <div className="navbar-left">
                <Link to="/" className="navbar-logo">
                    <img src="https://i.imgur.com/Nkysfkd.jpeg" alt="Logo" className="logo-image" />
                </Link>
                <div className="navbar-links">
                    <Link to="/precios" className="nav-link">Precios</Link>
                </div>
            </div>
            <div className="navbar-center">

            </div>
            <div className="navbar-right">
                <Link to="/login" className="nav-link">Iniciar sesión</Link>
                <button className="contact-sales-btn">Contactar a ventas</button>
                <button className="start-now-btn">Empezar ahora →</button>
            </div>
        </div>
    </nav>
);
}



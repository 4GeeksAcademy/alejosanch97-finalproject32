import React, { useContext } from "react";
import { Context } from "../store/appContext";
import { Link } from "react-router-dom";
import "../../styles/navbar.css";

export const Navbar = () => {
    const { store, actions } = useContext(Context);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-left">
                    <Link to="/" className="navbar-logo">
                        <img src="https://i.imgur.com/Nkysfkd.jpeg" alt="Logo" className="logo-image" />
                    </Link>
                </div>
                <div className="navbar-center">
                </div>
                <div className="navbar-right">
                    {!store.token ? (
                        <>
                            <Link to="/login" className="nav-link">Iniciar sesión</Link>
                            <button className="contact-sales-btn">Contactar a ventas</button>
                            <button className="start-now-btn">Empezar ahora →</button>
                        </>
                    ) : (
                        <button
                            className="btn btn-primary"
                            onClick={() => actions.logout()}
                        >
                            Cerrar sesión
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};


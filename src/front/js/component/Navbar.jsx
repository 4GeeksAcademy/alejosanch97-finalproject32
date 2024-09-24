import React, { useContext } from "react";
import { Context } from "../store/appContext";
import { Link } from "react-router-dom";
import "../../styles/navbar.css";

export const Navbar = () => {
    const { store, actions } = useContext(Context);

    return (
        <nav className="navbars ">
            <div className="navbar-container">
                <div className="navbar-left col-4">
                    <Link to="/" className="navbar-logo">
                        <img src="https://i.imgur.com/Nkysfkd.jpeg" alt="Logo" className="logo-image" />
                    </Link>
                </div>
              
                <div className="navbar-right">
                    {!store.token ? (
                        <>
                            <Link to="/login" className="nav-link">Iniciar sesión</Link>
                            <Link to="/dashboard" className="nav-link">Contactar a ventas</Link>
                            {/* <Link to="/register" className="">
                                Empezar ahora
                            </Link> */}
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


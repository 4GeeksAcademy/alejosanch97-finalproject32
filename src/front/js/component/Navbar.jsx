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
                            <Link to="/login" className="nav-link p-1">Log in</Link>
                            <Link to="/dashboard" className="nav-link p-1">Pricing</Link>
                            {/* <Link to="/register" className="">
                                Empezar ahora
                            </Link> */}
                        </>
                    ) : (
                        <button
                            className="btn btn-primary me-2 me-md-5 me-lg-5 px-3"
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


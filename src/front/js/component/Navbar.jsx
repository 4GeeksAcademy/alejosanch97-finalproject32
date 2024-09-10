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
                    <li class="nav-item">
                        <Link className="nav-link" to="/projectmanager">Project Manager</Link>
                    </li>
                    <li class="nav-item">
                        <Link className="nav-link" to="/taskmanager">Task Manager</Link>
                    </li>
                </div>
            </div>
            <div className="navbar-center">

            </div>
            <div className="navbar-right">
                <Link to="/login" className="nav-link">Iniciar sesión</Link>
                <li class="nav-item">
                    <Link className="nav-link" to="/profile">Profile</Link>
                </li>
                <button className="contact-sales-btn">Contactar a ventas</button>
                <button className="start-now-btn">Empezar ahora →</button>
            </div>
        </div>
    </nav>
);
}


//         <nav className="navbar">
//             <div className="navbar-container">
//                 <div className="navbar-left">
//                     <Link to="/" className="navbar-logo">
//                         <img src="https://i.imgur.com/Nkysfkd.jpeg" alt="Logo" className="logo-image" />
//                     </Link>
//                     <div className="navbar-links">
//                         <Link to="/precios" className="nav-link">Precios</Link>
//                         <li class="nav-item">
//         <nav className="navbar navbar-expand-lg bg-body-tertiary">
//             <div className="container-fluid">
//                 <a className="navbar-brand" href="#">Productividad</a>
//                 <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
//                     <span className="navbar-toggler-icon"></span>
//                 </button>
//                 <div className="collapse navbar-collapse" id="navbarNav">
//                     <ul className="navbar-nav">
//                         <li className="nav-item">
//                             <Link className="nav-link" to="/">Home</Link>
//                         </li>
//                         <li className="nav-item">
//                             <Link className="nav-link" to="/login">Login</Link>
//                         </li>
//                         <li className="nav-item">
//                             <Link className="nav-link" to="/tasks">Tasks</Link>
//                         </li>
//                         <li className="nav-item">
//                             <Link className="nav-link" to="/profile">Profile</Link>
//                         </li>
//                         <li className="nav-item">
//                             <Link className="nav-link" to="/projectmanager">Project Manager</Link>
//                         </li>
//                         <li className="nav-item">
//                             <Link className="nav-link" to="/taskmanager">Task Manager</Link>
//                         </li>
//                     </div>
//                 </div>
//                 <div className="navbar-center">

//                 </div>
//                 <div className="navbar-right">
//                     <Link to="/login" className="nav-link">Iniciar sesión</Link>
//                     <li class="nav-item">
//                         <Link className="nav-link" to="/profile">Profile</Link>
//                     </li>
//                     <button className="contact-sales-btn">Contactar a ventas</button>
//                     <button className="start-now-btn">Empezar ahora →</button>
//                 </div>
//             </div>
//         </nav>
//     );
// }


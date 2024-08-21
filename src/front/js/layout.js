import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import { BackendURL } from "./component/backendURL";

import { Home } from "./pages/home";
import injectContext from "./store/appContext";

import { Navbar } from "./component/Navbar.jsx";
import { Login } from "./pages/Login.jsx";
import { Footer } from "./component/footer";
import { Dashboard } from "./pages/Dashboard.jsx";
import { Tasks } from "./pages/Tasks.jsx";
import {Profile} from "./pages/Profile.jsx"
import {ProjectManager} from "./pages/ProjectManager.jsx"
import { TaskManager } from "./pages/TaskManager.jsx";
import {Form} from "./component/register.jsx"
//create your first component
const Layout = () => {
    //the basename is used when your project is published in a subdirectory and not in the root of the domain
    // you can set the basename on the .env file located at the root of this project, E.g: BASENAME=/react-hello-webapp/
    const basename = process.env.BASENAME || "";

    if(!process.env.BACKEND_URL || process.env.BACKEND_URL == "") return <BackendURL/ >;

    return (
        <div>
            <BrowserRouter basename={basename}>
                <ScrollToTop>
                    <Navbar />
                    <Routes>
                        <Route element={<Home />} path="/" />
                        <Route element={<Login/>} path="/login"/>
                        <Route element={<Dashboard/>} path="/dashboard"/>
                        <Route element={<Tasks/>} path="/tasks"/>
                        <Route element={<Profile/>} path="/profile"/>
                        <Route element={<ProjectManager />} path="/projectmanager" />
                        <Route element={<TaskManager />} path="/TaskManager" />
                        <Route element={<h1>Not found!</h1>} />
                        <Route element={<Form/>} path="/register"/>
                    </Routes>
                    <Footer />
                </ScrollToTop>
            </BrowserRouter>
        </div>
    );
};

export default injectContext(Layout);

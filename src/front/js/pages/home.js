import React, { useContext } from "react";
import { Context } from "../store/appContext";
import rigoImageUrl from "../../img/rigo-baby.jpg";
import { Link } from "react-router-dom"
import "../../styles/home.css";

export const Home = () => {
	return (
		<div className="home-container">
		  <header className="header">
			<h1>TASKY</h1>
		  </header>
	
		  <main>
		<section className="hero">
			<div className="hero-content">
				<h1>Tu plataforma de confianza</h1>
				<p>Optimiza los flujos de trabajo y obtén visibilidad con soluciones personalizables para proyectos.</p>
				<Link to="/register" className="cta-button">
				Empezar ahora →
				</Link>
				<div className="hero-info">
				<span>Plan Gratis sin límite de tiempo</span>
				</div>
			</div>
			<div className="hero-image">
				<img src="https://i.imgur.com/bKfNx69.png" alt="Project management dashboard" />
			</div>
			</section>
	
			<section id="features" className="features">
			  <h3>Características Principales</h3>
			  <div className="feature-grid">
				<div className="feature-item">
				  <i className="fas fa-project-diagram"></i>
				  <h4>Gestión de Proyectos</h4>
				  <p>Crea y administra proyectos con facilidad</p>
				</div>
				<div className="feature-item">
				  <i className="fas fa-tasks"></i>
				  <h4>Seguimiento de Tareas</h4>
				  <p>Asigna y supervisa tareas en tiempo real</p>
				</div>
				<div className="feature-item">
				  <i className="fas fa-users"></i>
				  <h4>Colaboración en Equipo</h4>
				  <p>Trabaja en conjunto de manera eficiente</p>
				</div>
				<div className="feature-item">
				  <i className="fas fa-chart-line"></i>
				  <h4>Análisis y Reportes</h4>
				  <p>Visualiza el progreso con gráficos intuitivos</p>
				</div>
			  </div>
			</section>
	
			<section id="about" className="about">
			  <h3>Sobre TASKY</h3>
			  <p>Somos una plataforma dedicada a mejorar la eficiencia de tu equipo. Con TASKY, puedes gestionar proyectos, asignar tareas y visualizar el flujo de trabajo de manera intuitiva y efectiva.</p>
			</section>
		  </main>
	
		  <section className="team-work">
			<h3>Trabajo en equipo</h3>
			<p>Ahora cualquier equipo puede agilizar el trabajo, colaborar y resolver sus problemas más complejos en conjunto con nuestro paquete de productos.</p>
			<div className="icon-grid">
			  <div className="icon-item">
				<i className="fas fa-users"></i>
				<p>Colaboración</p>
			  </div>
			  <div className="icon-item">
				<i className="fas fa-pencil-alt"></i>
				<p>Gestión de Proyectos</p>
			  </div>
			  <div className="icon-item">
				<i className="fas fa-comments"></i>
				<p>Comunicación</p>
			  </div>
			  <div className="icon-item">
				<i className="fas fa-chart-bar"></i>
				<p>Análisis</p>
			  </div>
			</div>
		  </section>
		</div>
	  );
  };
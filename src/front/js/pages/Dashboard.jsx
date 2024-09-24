import React from 'react';
import { Link } from 'react-router-dom';
import "../../styles/sales.css";

export const Dashboard = () => {
    return (
        <div className="dashboard-container">
          <div className="hero-section">
            <h1 className="hero-title">Impulsa tu trabajo en equipo. Empieza gratis.</h1>
            <p className="hero-subtitle">Tableros y flujos de trabajo ilimitados. No se necesita tarjeta de crédito.</p>
            <div className="product-options">
              <div className="product-option">
                <div className="product-icon crm-icon">
                  <img src="/path-to-crm-icon.png" alt="CRM" />
                </div>
                <p>CRM</p>
              </div>
              <div className="product-option">
                <div className="product-icon work-management-icon">
                  <img src="/path-to-work-management-icon.png" alt="Work Management" />
                </div>
                <p>Work Management</p>
              </div>
              <div className="product-option">
                <div className="product-icon dev-icon">
                  <img src="/path-to-dev-icon.png" alt="Dev" />
                </div>
                <p>Dev</p>
              </div>
            </div>
          </div>
    
          
          <div className="pricing-section">
            <div className="pricing-cards">
              {['Gratis', 'Básico', 'Estándar', 'Pro', 'Corporativo'].map((plan, index) => (
                <div key={index} className={`pricing-card ${plan.toLowerCase()}-plan`}>
                  <h5 className="plan-title">{plan}</h5>
                  {plan === 'Gratis' ? (
                    <h2 className="plan-price">$0 <span className="price-period">para siempre</span></h2>
                  ) : plan === 'Corporativo' ? (
                    <div className="corporate-icon">
                      <img src="/path-to-building-blocks-icon.png" alt="Corporativo" />
                    </div>
                  ) : (
                    <h2 className="plan-price">
                      ${['9', '12', '19'][index - 1]} <span className="price-period">usuario / mes</span>
                    </h2>
                  )}
                  <p className="plan-description">
                    {plan === 'Gratis' ? 'Hasta 2 usuarios' : 
                     plan === 'Corporativo' ? 'Obtén funciones exclusivas para tu organización' :
                     `Total $${['27', '36', '57'][index - 1]} /mes\nFacturado anualmente`}
                  </p>
                  <Link 
                    to="/register" 
                    className="plan-button"
                    style={{ textDecoration: 'none', display: 'inline-block' }}
                >
                    {plan === 'Corporativo' ? 'Comunícate con ventas' : 'Prueba gratis'}
                </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
}

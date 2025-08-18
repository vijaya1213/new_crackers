// src/components/Layout.js
import React from "react";
import { NavLink, useLocation } from "react-router-dom";

// Import logo and CSS
import logo from "../assets/AthithyaLogo.png";
import "../App.css"; // 👈 Import the CSS here

function Layout() {
  const location = useLocation();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide navbar on homepage
  if (location.pathname === "/") {
    return null;
  }

  return (
    <header className="header"> {/* All styles from App.css will apply */}
      <div className="logo-container">
        <img src={logo} alt="Adhitya Crackers" />
        <h2 style={{ margin: "0 0 0 10px", fontSize: "16px", color: "#fff7f7ff" }}>
          Adhitya Crackers
        </h2>
      </div>
      <nav className="nav">
        <ul>
          <li>
            <NavLink to="/Dashboard" className={({ isActive }) => (isActive ? "active" : undefined)}>
              Dashboard  
            </NavLink>
          </li>
          <li>
            <NavLink to="/Admin_Category" className={({ isActive }) => (isActive ? "active" : undefined)}>
              Category Management  
            </NavLink>
          </li>
          <li>
            <NavLink to="/Admin_Product" className={({ isActive }) => (isActive ? "active" : undefined)}>
             Product Management
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/Admin_Order"
              className={({ isActive }) => (isActive ? "active" : undefined)}
            >
              Order Management
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/Home"
              className={({ isActive }) => (isActive ? "active login-link" : "login-link")}
            >
              Log Out
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Layout;
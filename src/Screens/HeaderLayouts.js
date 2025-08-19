// src/components/Header.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/img7.png";
import { FiFacebook, FiInstagram, FiTwitter, FiLinkedin, FiMenu, FiX, FiDownload } from "react-icons/fi";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import axios from 'axios';
import localforage from 'localforage';
import API_BASE_URL from "./apiConfig";
import priceListPdf from "../assets/SriGokilaa_pricelist.pdf";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when clicking on a link
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const openPriceListPDF = (e) => {
    e.preventDefault();
    window.open(priceListPdf, '_blank'); // Opens PDF in new tab
  };

  // Inject mobile CSS
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = mobileCSS;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return (
    <header style={headerStyle} className="header-mobile">
    <div style={logoContainerStyle} className="logoContainerStyle">
        <img src={logo} style={logoStyle} alt="Sri Gokilaa Crackers" />
        <h2 style={{ margin: "0 0 0 10px", fontSize: "16px", color: "#fff7f7ff" }}>
          New Crackers 
        </h2>
      </div>

      {/* Hamburger Menu Button - Only visible on mobile */}
      <button 
        className="hamburger-button"
        onClick={toggleMobileMenu}
        style={hamburgerButtonStyle}
      >
        {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      <nav className={`nav nav-mobile ${isMobileMenuOpen ? 'nav-open' : ''}`}>
        <ul style={navListStyle} className="nav-list-mobile">
          <li style={navItemStyle}>
            <NavLink to="/" onClick={closeMobileMenu}>Home</NavLink>
          </li>
          <li style={navItemStyle}>
            <NavLink to="/about" onClick={closeMobileMenu}>About Us</NavLink>
          </li>
          <li style={navItemStyle}>
            <NavLink to="/product" onClick={closeMobileMenu}>Purchase Order</NavLink>
          </li>
          
          <li style={navItemStyle}>
            <NavLink to="/quick-purchase" onClick={closeMobileMenu} special="quick">
              <span className="quick-order-text">Quick Order</span>
            </NavLink>
          </li>
         
          <li style={navItemStyle}>
            <a 
              href={priceListPdf} 
              target="_blank" 
              rel="noopener noreferrer"
              download="MMA_Crackers_Price_List.pdf"
              style={priceListLinkStyle}
              onClick={closeMobileMenu}
            >
              Download PriceList
            </a>
          </li>
          <li style={navItemStyle}>
            <NavLink to="/safety" onClick={closeMobileMenu}>Safety Tips</NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};

// Reusable NavLink — NO HOVER EFFECT
const NavLink = ({ to, children, onClick, special }) => {
  const baseStyle = special === "quick"
    ? quickOrderStyle
    : navLinkStyle;

  return (
    <Link
      to={to}
      style={baseStyle}  // Always use base style
      onClick={onClick}
      // Removed: onMouseEnter, onMouseLeave
    >
      {children}
    </Link>
  );
};

// === Styles === 
const headerStyle = {
  background: 'linear-gradient(135deg, #240041, #240041)',
  padding: '0.8rem 2rem',

  boxShadow: '0 4px 25px rgba(233, 64, 87, 0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'sticky',
  top: 0,
  zIndex: 100,
  color: '#FFFFFF',
};

const quickOrderStyle = {
  background: '#ff4057',
  color: '#FFFFFF',
  padding: '0.6rem 1.2rem',
  borderRadius: '25px',
  boxShadow: '0 4px 15px rgba(242, 113, 33, 0.5)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(242, 113, 33, 0.7)',
    background: '#E94057'
  }
};

const quickOrderHoverStyle = {
  background: '#ff6e1b',
  boxShadow: '0 6px 16px rgba(255, 152, 0, 0.6)',
  transform: 'scale(1.05)',
};

const logoContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.7rem',
  
};

const logoStyle = {
  height: '60px',               
  width: '60px',              
  borderRadius: '50%',          
  objectFit: 'cover',           
  overflow: 'hidden' 
};

const navListStyle = {
  display: 'flex',
  alignItems: 'center',
  listStyle: 'none',
  gap: '1rem',
  padding: 0,
  margin: 0,
};

const navItemStyle = {
  borderRadius: '30px',
  overflow: 'visible',
  transition: 'all 0.3s ease',
  fontsize: '1rem',
};

const navLinkStyle = {
  color: '#ffffff',
  textDecoration: 'none',
  fontWeight: 'bold',
  fontSize: '1rem',
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  transition: 'color 0.3s ease',
  outline: 'none',
};

const loginnavLinkStyle = {
  padding: '0.5rem 1rem',
  background: 'linear-gradient(135deg, #ff512f, #dd2476)',
  color: '#fff',
  textDecoration: 'none',
  borderRadius: '10px',
  fontWeight: 'bold',
  fontSize: '1rem',
  transition: 'all 0.4s ease',
  boxShadow: '0 0 10px #ff512f88',
  animation: 'pulseGlow 2s infinite',
  margin: '10px 0',
};

const hamburgerButtonStyle = {
  display: 'none',
  background: 'rgba(128, 0, 0, 0.95)',
  color: 'white',
  border: 'none',
  padding: '0.5rem',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
};

const priceListLinkStyle = {
  color: '#ffffff',
  textDecoration: 'none',
  fontWeight: 'bold',
  fontSize: '1rem',
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  transition: 'color 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  gap: '0.3rem',
};

// Mobile CSS with text-only blinking animation
const mobileCSS = `
@keyframes quickOrderTextBlink {
  0%, 100% {
    color: #ffffff;
    transform: scale(1) translateX(0);
    text-shadow: none;
  }
  25% {
    color: #FFFF00;
    transform: scale(1.05) translateX(-3px);
    text-shadow: 0 0 8px rgba(255, 255, 0, 0.7);
  }
  50% {
    color: #ffffff;
    transform: scale(1) translateX(0);
    text-shadow: none;
  }
  75% {
    color: #FFFF00;
    transform: scale(1.05) translateX(3px);
    text-shadow: 0 0 8px rgba(255, 255, 0, 0.7);
  }
}

@keyframes pulseGlow {
  0% {
    box-shadow: 0 0 12px #ff512f88, 0 0 24px #ff512f44;
  }
  50% {
    box-shadow: 0 0 20px #ff512fcc, 0 0 36px #ff512f88;
  }
  100% {
    box-shadow: 0 0 12px #ff512f88, 0 0 24px #ff512f44;
  }
}

@keyframes pulseGlow {
  0% {
    box-shadow: 0 0 12px #ff512f88, 0 0 24px #ff512f44;
  }
  50% {
    box-shadow: 0 0 20px #ff512fcc, 0 0 36px #ff512f88;
  }
  100% {
    box-shadow: 0 0 12px #ff512f88, 0 0 24px #ff512f44;
  }
}

/* Quick Order Text Animation */
.quick-order-text {
  animation: quickOrderTextBlink 1.5s infinite ease-in-out;
  display: inline-block;
  font-size: 1.2rem;
  transform-origin: center;
}

/* Desktop - hide hamburger */
@media (min-width: 769px) {
  .hamburger-button {
    display: none !important;
  }
}

/* Mobile Layout */
@media (max-width: 768px) {
    .header-mobile {
      flex-direction: row;
      padding: 0.5rem 1rem;
      justify-content: space-between;
      align-items: center;
      background: rgb(128, 0, 0); 
      position: sticky;
      top: 0;
      z-index: 1000;
      color: #ffffff;
      min-height: 80px; /* Changed from height to min-height */
    }

    
    .logoContainerStyle {
      display: flex;
      align-items: center;
      gap: 0.7rem;
      max-width: calc(100% - 60px); /* Prevent logo from overlapping menu button */
    }
  .hamburger-button {
    display: flex !important;
    align-items: center;
    justify-content: center;
    background: rgba(128, 0, 0, 0.95);
    border: 2px solid #FF9800;
    color: #FF9800;
    border-radius: 8px;
    padding: 0.5rem;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .hamburger-button:hover {
    background-color: rgba(255, 152, 0, 0.1);
    transform: scale(1.1);
  }

.nav-mobile {
      position: fixed; /* Changed from absolute to fixed */
      top: 130px; /* Match header min-height */
      left: 0;
      right: 0;
      background: rgba(128, 0, 0, 0.95);
      border-top: 1px solid rgba(255, 152, 0, 0.3);
      opacity: 0;
      visibility: hidden;
      transform: scaleY(0);
      transform-origin: top;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      max-height: calc(100vh - 80px); /* Ensure menu doesn't go off-screen */
      overflow-y: auto; /* Add scroll if needed */
    }

  .nav-mobile.nav-open {
    opacity: 1;
    visibility: visible;
    transform: scaleY(1);
  }

  .nav-list-mobile {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem 1rem;
    margin: 0;
    list-style: none;
  }

  .nav-list-mobile li {
    border-radius: 30px;
    overflow: visible;
    transition: all 0.3s ease;
    background: rgba(128, 0, 0, 0.95);
  }

  .nav-list-mobile a {
    color: #ffffff;
    text-decoration: none;
    font-weight: 600;
    font-size: 1.2rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    transition: color 0.3s ease;
    display: block;
    text-align: center;
    outline: none;
  }

  .nav-list-mobile a:focus,
  .nav-list-mobile a:active {
    outline: none !important;
    box-shadow: none !important;
    text-decoration: none !important;
  }

  .nav-list-mobile a:hover {
    color: #ffffff;
    text-decoration: none;
    transform: none;
  }

  /* Quick Order - no container, just blinking text like regular nav link */
  .nav-list-mobile a[href="/quick-purchase"] {
    color: #ffffff;
    text-decoration: none;
    font-weight: 600;
    font-size: 1.2rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    transition: color 0.3s ease;
    display: block;
    text-align: center;
    outline: none;
    /* No background, border, or box-shadow - just like other nav links */
  }

  .nav-list-mobile a[href="/quick-purchase"]:hover {
    color: #ffffff;
    text-decoration: none;
    transform: none;
  }

  /* Login button styling */
  .nav-list-mobile a[href="/AdminLogin"] {
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, #ff512f, #dd2476);
    color: #fff;
    border-radius: 10px;
    font-weight: bold;
    box-shadow: 0 0 10px #ff512f88;
    animation: pulseGlow 2s infinite;
    margin: 10px 0;
  }

  .nav-list-mobile a[href="/AdminLogin"]:hover {
    color: #fff;
    text-decoration: none;
  }

  .header-mobile img {
    height: 60px;
    width: 60px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #FF9800;
    box-shadow: 0 0 15px rgba(255, 152, 0, 0.7);
  }
}

@media (max-width: 480px) {
  .nav-list-mobile a {
    font-size: 1.1rem;
  }
  
  .nav-list-mobile {
    padding: 1.5rem 0.5rem;
    gap: 0.8rem;
  }

  .nav-list-mobile a {
    font-size: 0.95rem;
    padding: 0.5rem 1rem;
  }

  .header-mobile img {
    height: 50px;
    width: 50px;
  }
}
`;

export default Header;
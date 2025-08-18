// src/components/Footer.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiLinkedin,
  FiChevronRight,
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiSend,
  FiCheck
} from "react-icons/fi";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 4000);
    }
  };

  const addresses = [
    {
      name: "Adhitya Crackers",
      address: "Near New Housing Board\nKTC Nagar, Tirunelveli - 627011"
    },
    {
      name: "MMA Crackers", 
      address: "Plot No.3, Anjaneya Nagar\nE.Muthlingapuram\nSurvey No.238/1A1A1\n Sathur (Near NH Doll Gate)\nViruthunagar - 626203"
    },
    {
      name: "Porunai Crackers",
      address: "1/410, Four Lane Road\nNear Rettiarpatti Hill\nTirunelveli - 627007"
    }
  ];

  const quickLinks = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About Us" },
    { path: "/quick-purchase", label: "Quick Purchase" },
    { path: "/product", label: "Purchase Order" },
    { path: "/safety", label: "Safety Tips" },
  ];

  return (
    <footer id="contact-footer" style={footerStyle}>  
      {/* Main Footer Content - 4 Columns */}
      <div style={footerContainerStyle}>
        {/* Company Info */}
        <div style={footerColumnStyle}>
          <h3 style={sectionHeadingStyle}>ADHITYA CRACKERS</h3>
          <p style={descriptionStyle}>
            Firecracker specialists with over a decade of excellence in manufacturing, retailing, and wholesale distribution.
          </p>
        </div>

        {/* Quick Links */}
        <div style={footerColumnStyle}>
          <h4 style={sectionHeadingStyle}>
            <span style={headingIconStyle}>🔗</span>
            Quick Links
          </h4>
          <ul style={linkListStyle}>
            {quickLinks.map((link, index) => (
              <li key={index} style={linkItemStyle}>
                <Link
                  to={link.path}
                  style={{
                    ...linkStyle,
                    color: hoveredLink === `quick-${index}` ? '#FFD700' : '#e0e0e0',
                    transform: hoveredLink === `quick-${index}` ? 'translateX(5px)' : 'translateX(0)',
                  }}
                  onMouseEnter={() => setHoveredLink(`quick-${index}`)}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  <FiChevronRight style={chevronStyle} />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div style={footerColumnStyle}>
          <h4 style={sectionHeadingStyle}>
            <FiPhone style={{...headingIconStyle, color: 'white !important'}}></FiPhone>
            Contact
          </h4>
          
          <div style={contactDetailsStyle}>
            <div style={contactItemStyle}>
              <FiPhone style={contactIconStyle} />
              <div>
                <a href="tel:+919842155255" style={contactLinkStyle}>+91 9842155255</a>
                <br />
                <a href="tel:+919842792373" style={contactLinkStyle}>+91 9842792373</a>
              </div>
            </div>
            
            <div style={contactItemStyle}>
              <FiMail style={contactIconStyle} />
              <a href="mailto:reliableups14@gmail.com" style={contactLinkStyle}>
                reliableups14@gmail.com
              </a>
            </div>
            
            <div style={contactItemStyle}>
              <FiClock style={contactIconStyle} />
              <span style={contactTextStyle}>Mon - Sat: 9:00 AM - 8:00 PM</span>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div style={footerColumnStyle}>
          <h4 style={sectionHeadingStyle}>
            <FiMapPin style={headingIconStyle} />
            Location
          </h4>
          
          <div style={compactMapContainer}>
          
            <a 
              href="https://www.google.co.in/maps/place/ADHITYA+CRACKERS/@8.728266,77.7790846,17z" 
              target="_blank" 
              rel="noopener noreferrer"
              style={compactMapLink}
            >
              <div style={compactMapWrapper}>
                <iframe
                  title="Adhitya Crackers Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3930.123456!2d77.7790846!3d8.728266!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b040f05c295c57d%3A0xe1b0206aec191b6b!2sADHITYA%20CRACKERS!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
                  style={compactMapIframe}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
           
            </a>
          </div>
        </div>
      </div>

      {/* Locations Row */}
      <div style={{...locationsContainerStyle, borderTop: '1px solid rgba(255, 255, 255, 0.1)'}}>
        <h4 style={locationsHeadingStyle}>
          <span style={headingIconStyle}>📍</span>
          Our Locations
        </h4>
        <div style={locationsGridStyle}>
          {addresses.map((location, index) => (
            <div key={index} style={locationCardStyle}>
              <div style={locationHeaderStyle}>
                <FiMapPin style={locationIconStyle} />
                <span style={locationNameStyle}>{location.name}</span>
              </div>
              <p style={locationAddressStyle}>{location.address}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div style={bottomSectionStyle}>
        <div style={bottomContainerStyle}>
          <div style={copyrightStyle}>
            <p style={copyrightTextStyle}>
              © {new Date().getFullYear()} Adhitya Crackers. All rights reserved.
              <br />
              <a 
                target="_blank" 
                rel="noopener noreferrer"
                style={developerLinkStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textShadow = '0 0 10px rgba(255, 215, 0, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textShadow = '0 0 5px rgba(255, 215, 0, 0.3)';
                  e.currentTarget.style.color = '#FFD700';
                }}
              >
                Developed by Vivify Soft
              </a>
            </p>
          </div>
          
          <div style={bottomLinksStyle}>
            {['Privacy Policy', 'Terms of Service', 'Shipping Policy'].map((item, index) => (
              <React.Fragment key={item}>
                <Link
                  to={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
                  style={{
                    ...bottomLinkStyle,
                    color: hoveredLink === `bottom-${index}` ? '#FFD700' : '#b0b0b0',
                  }}
                  onMouseEnter={() => setHoveredLink(`bottom-${index}`)}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  {item}
                </Link>
                {index < 2 && <span style={separatorStyle}>•</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

// === Styles ===
const footerStyle = {
  background: 'linear-gradient(135deg, #0a0e27 0%, #1a237e 50%, #283593 100%)',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  paddingTop: '0.5rem',
};

const footerContainerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '1rem',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '1.5rem',
  '@media (min-width: 992px)': {
    gridTemplateColumns: 'repeat(4, 1fr)',
  }
};

const footerColumnStyle = {
  position: 'relative',
  padding: '0 0.75rem',
};

const sectionHeadingStyle = {
  fontSize: '1.1rem',
  fontWeight: '600',
  marginBottom: '1rem',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginTop: 0,
};

const headingIconStyle = {
  fontSize: '1rem',
};

const descriptionStyle = {
  fontSize: '0.9rem',
  lineHeight: '1.5',
  color: '#d0d0d0',
  marginBottom: '1rem',
};

const linkListStyle = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
};

const linkItemStyle = {
  marginBottom: '0.5rem',
};

const linkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  textDecoration: 'none',
  fontSize: '0.9rem',
  transition: 'all 0.3s ease',
  padding: '0.2rem 0',
};

const chevronStyle = {
  fontSize: '0.8rem',
  color: '#FFD700',
};

const contactDetailsStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const contactItemStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.6rem',
};

const contactIconStyle = {
  fontSize: '1rem',
  color: '#FFD700',
  marginTop: '2px',
  flexShrink: 0,
};

const contactLinkStyle = {
  color: '#e0e0e0',
  textDecoration: 'none',
  fontSize: '0.85rem',
  transition: 'color 0.3s ease',
  ':hover': {
    color: '#FFD700'
  }
};

const contactTextStyle = {
  color: '#e0e0e0',
  fontSize: '0.85rem',
};

// Map Styles
const compactMapContainer = {
  width: '100%',
  backgroundColor: 'rgba(255,255,255,0.05)',
  borderRadius: '6px',
  border: '1px solid rgba(255,255,255,0.1)',
  padding: '10px',
  marginBottom: '0.5rem',
};

const compactMapHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginBottom: '6px',
};

const compactMapTitle = {
  fontSize: '0.9rem',
  fontWeight: '600',
  color: '#FFD700',
};

const compactMapLink = {
  display: 'block',
  textDecoration: 'none',
};

const compactMapWrapper = {
  position: 'relative',
  paddingBottom: '70%',
  height: 0,
  overflow: 'hidden',
  borderRadius: '4px',
};

const compactMapIframe = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  border: 'none',
};

const compactMapFooter = {
  marginTop: '6px',
  textAlign: 'center',
};

const compactMapText = {
  fontSize: '0.75rem',
  color: '#d0d0d0',
  textDecoration: 'underline',
};

// Locations Section
const locationsContainerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '1.5rem 1rem',
  marginTop:"-5px"
};

const locationsHeadingStyle = {
  fontSize: '1.1rem',
  fontWeight: '600',
  marginTop: '-0.5rem',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  justifyContent: 'center',
  textAlign: 'center',
};

const locationsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '1.5rem',
};

const locationCardStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '10px',
  padding: '1.2rem',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  ':hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
  }
};

const locationHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginBottom: '0.5rem',
};

const locationIconStyle = {
  fontSize: '1rem',
  color: '#FFD700',
};

const locationNameStyle = {
  fontWeight: '600',
  color: '#FFD700',
  fontSize: '0.95rem',
};

const locationAddressStyle = {
  fontSize: '0.85rem',
  color: '#d0d0d0',
  lineHeight: '1.5',
  margin: 0,
  whiteSpace: 'pre-line',
};

// Bottom Section
const bottomSectionStyle = {
  background: 'linear-gradient(135deg, #0a0e27 0%, #1a237e 50%, #283593 100%)',
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
};

const bottomContainerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '1rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '0.5rem',
 
};

const copyrightStyle = {
  flex: 1,
  minWidth: '200px',
};

const copyrightTextStyle = {
  margin: 0,
  fontSize: '0.85rem',
  color: '#b0b0b0',
  lineHeight: '1.5',
};

const developerLinkStyle = {
  fontSize: '0.8rem',
  color: '#FFD700',
  fontWeight: '400',
  textDecoration: 'none',
  textShadow: '0 0 5px rgba(255, 215, 0, 0.3)',
  transition: 'all 0.3s ease',
};

const bottomLinksStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.8rem',
  flexWrap: 'wrap',
};

const bottomLinkStyle = {
  textDecoration: 'none',
  fontSize: '0.8rem',
  transition: 'color 0.3s ease',
};

const separatorStyle = {
  color: '#666',
  fontSize: '0.7rem',
};

const mapPinIconStyle = {
  color: '#FFD700',
  fontSize: '1.1rem',
};

export default Footer;
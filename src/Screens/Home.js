// src/components/Home.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from "../assets/logo.jpg";
import hero_bg from "../assets/new_hero_img6.jpg";
import about_img from "../assets/about_img1.webp";
import axios from "axios";
import localforage from "localforage";
import API_BASE_URL from "./apiConfig";
import pro_img2 from "../assets/fire_gif.gif"; // Add this import
import {
  FiCalendar, FiDollarSign, FiCheck, FiAlertTriangle, FiPhone, FiMail,
  FiMapPin, FiClock, FiShield, FiStar, FiUser, FiGlobe,FiDroplet, FiX, FiAlertCircle
} from 'react-icons/fi';

import Header from './HeaderLayouts';
import Footer from './FooterLayouts';

function Home() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    companyId: 2
  });

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    setIsSubmittingContact(true);
    try {
      const token = await localforage.getItem("jwtToken");
      const formDataToSend = new FormData();
      formDataToSend.append('Name', formData.name);
      formDataToSend.append('Email', formData.email);
      formDataToSend.append('Phone', formData.phone || '');
      formDataToSend.append('Subject', formData.subject || 'General Inquiry');
      formDataToSend.append('Message', formData.message);
      formDataToSend.append('CompanyId', formData.companyId);

      const response = await axios.post(
        `${API_BASE_URL}api/Crackers/SendContactEmail`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.statusCode === 200) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '', companyId: 2 });
        setTimeout(() => setSubmitStatus(null), 1000);
      } else {
        throw new Error(response.data.statusDesc || "Failed to send message");
      }
    } catch (error) {
      console.error(error);
      setSubmitStatus('error');
      alert(`Failed to send message: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <Header isMobile={isMobile} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {/* Hero Section */}
      <section style={heroSectionStyle}>
        <div style={heroOverlay}></div>
        
        <div style={heroContentWrapper}>
          <h1 style={heroTitle}>NEW CRACKERS</h1>
          <p style={heroSubtitle}>Celebrating traditions with premium fireworks for over a decade.</p>
          <div style={heroButtonGroup}>
            <Link to="/product" style={primaryButton}>Explore Fireworks</Link>
          </div>
        </div>
       
      </section>

      {/* Features Section */}
    

      {/* About Section */}
      <section style={aboutSectionStyle}>
        <div style={aboutPattern}></div>
        <div style={container}>
          <div style={aboutFlex}>
            <div style={aboutImageSide}>
              <img src={about_img} alt="About New Crackers" style={aboutImage} />
            </div>
            <div style={aboutTextSide}>
              <div style={sectionHeader}>
                <h2 style={sectionTitle}>About Us</h2>
              </div>
              <p style={aboutParagraph}>
                We, <strong style={highlightText}>New Crackers</strong>, are based in Tirunelveli — the Firecracker City of Tamil Nadu. We are the agency to sell all fireworks crackers based upon customer orders.
              </p>
              <p style={aboutParagraph}>
                With more than a decade of experience, we've established ourselves as one of the largest manufacturers, retailers, and wholesalers of crackers in Tirunelveli. We carefully procure crackers during the optimal sun-drying months of March, April, and May to ensure we deliver only the highest quality products at the most competitive prices to our customers.
              </p>
              <div style={buttonGroup}>
                <Link to="/about" style={primaryButton}>Learn More</Link>
                <Link to="/contact" style={secondaryButton}>Contact Us</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Tips */}
      <section style={safetySectionStyle}>
        <div style={container}>
          <div style={sectionHeader}>
            <h2 style={sectionTitle}>Safety Tips</h2>
            <p style={sectionSubtitle}>Celebrate joyfully, but always prioritize safety.</p>
          </div>
          <div style={safetyGrid}>
            <div style={safetyCard}>
              <FiAlertTriangle style={safetyIcon} />
              <h4 style={whyUsTitle}>Use Open Spaces</h4>
              <p style={whyUsText}>Always light crackers in open, clear areas away from buildings and dry grass.</p>
            </div>
            <div style={safetyCard}>
              <FiUser style={safetyIcon} />
              <h4 style={whyUsTitle}>Keep Kids at a Distance</h4>
              <p style={whyUsText}>Only adults should handle fireworks. Keep children and pets safe.</p>
            </div>
            <div style={safetyCard}>
              <FiDroplet style={safetyIcon} />
              <h4 style={whyUsTitle}>Have Water Ready</h4>
              <p style={whyUsText}>Keep a bucket of water or fire extinguisher nearby in case of emergencies.</p>
            </div>
            <div style={safetyCard}>
              <FiX style={safetyIcon} />
              <h4 style={whyUsTitle}>Never Relight a DUD</h4>
              <p style={whyUsText}>Wait 10 minutes, then soak it in water before disposal.</p>
            </div>
          </div>
          <div style={safetyNote}>
            <FiAlertCircle style={{ color: '#FFD700', marginRight: '8px' }} />
            <span><strong>Note:</strong> At New Crackers, we only sell legal, licensed, and safety-tested products.</span>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section style={contactSectionStyle}>
        <div style={container}>
          <div style={contactFlex}>
            <div style={contactInfoSide}>
              <h2 style={sectionTitle}>Get in Touch</h2>
              <p style={contactText}>Have questions or need a bulk order quote? We're here to help!</p>
              <div style={contactDetails}>
                <div style={contactItem}>
                  <FiMapPin style={contactIcon} /> Near New Housing Board, KTC Nagar, Tirunelveli - 627011
                </div>
                <div style={contactItem}>
                  <FiPhone style={contactIcon} /> +91 9842155255
                </div>
                <div style={contactItem}>
                  <FiMail style={contactIcon} /> New@gmail.com
                </div>
                <div style={contactItem}>
                  <FiGlobe style={contactIcon} /> newcrackers.com
                </div>
                <div style={contactItem}>
                  <FiClock style={contactIcon} /> Mon - Sat: 9:00 AM - 8:00 PM
                </div>
              </div>
            </div>
            <div style={contactFormSide}>
              <form style={contactForm} onSubmit={handleContactSubmit}>
                <input 
                  name="name"
                  placeholder="Your Name" 
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={contactInput}
                />
                <input 
                  name="email"
                  placeholder="Email" 
                  type="email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={contactInput}
                />
                <input 
                  name="phone"
                  placeholder="Phone" 
                  value={formData.phone}
                  onChange={handleInputChange}
                  style={contactInput}
                />
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  style={contactInput}
                >
                  <option value="">Select Subject</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Bulk Order">Bulk Order</option>
                  <option value="Product Question">Product Question</option>
                  <option value="Other">Other</option>
                </select>
                <textarea 
                  name="message"
                  placeholder="Your Message" 
                  rows="4"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  style={contactTextarea}
                ></textarea>
                {submitStatus === 'success' && (
                  <div style={{ color: 'green', textAlign: 'center', margin: '10px 0', fontSize: '0.9rem' }}>
                    Message sent successfully!
                  </div>
                )}
                {submitStatus === 'error' && (
                  <div style={{ color: 'red', textAlign: 'center', margin: '10px 0', fontSize: '0.9rem' }}>
                    Failed to send message. Please try again.
                  </div>
                )}
                <button 
                  type="submit" 
                  style={primaryButton}
                  disabled={isSubmittingContact}
                >
                  {isSubmittingContact ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Marquee */}
      

      <Footer />
    </>
  );
}

// ====== STYLES ======
const container = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 2rem',
};
const heroAnimationLeft = {
  position: 'absolute',
  left: '5%',
  top: '60%',
  transform: 'translateY(-50%)',
  zIndex: 3,
  animation: 'float 3s ease-in-out infinite',
  width: '150px',
  height: '150px',
};

const heroAnimationRight = {
  position: 'absolute',
  right: '5%',
  top: '15%',
  transform: 'translateY(-50%)',
  zIndex: 3,
  animation: 'float 3s ease-in-out infinite 1s',
  width: '150px',
  height: '150px',
};

const heroGifStyle = {
  width: '100%',
  height: '100%',
  filter: 'drop-shadow(0 0 10px rgba(255, 220, 0, 0.6))',
  borderRadius: '50%',
};
const mobileContainer = {
  maxWidth: '100%',
  margin: '0 auto',
  padding: '0 1rem',
};

const marqueeContainerStyle = {
  background: 'linear-gradient(90deg, #FFD700, #FFC107)',
  padding: '0.6rem 0',
  position: 'relative',
  zIndex: 10,
  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
};

// Hero Section
const heroSectionStyle = {
  width: '100vw',
  height: '60vh',
  minHeight: '250px',
  marginLeft: 'calc(-50vw + 50%)',
  position: 'relative',
  overflow: 'hidden',
  background: `url(${hero_bg}) no-repeat center center`,
  backgroundSize: 'cover',
  borderRadius: '0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const heroOverlay = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',

};

const heroContentWrapper = {
  position: 'relative',
  zIndex: 4,
  color: '#fff',
  textAlign: 'center',
  maxWidth: '800px',
  padding: '0',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
};

const heroTitle = {
  fontSize: 'clamp(2.5rem, 8vw, 4rem)',
  fontWeight: '800',
  margin: '0 0 0.5rem',
  whiteSpace: 'nowrap',
  background: 'linear-gradient(45deg, #FFD700, #FFC107)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  letterSpacing: '1px',
  textShadow: '0 2px 5px rgba(0,0,0,0.3)',
};

const heroSubtitle = {
  fontSize: '1rem',
  color: '#ddd',
  margin: '0 auto 1rem',
  lineHeight: '1.4',
  maxWidth: '600px',
};

const heroButtonGroup = {
  display: 'flex',
  gap: '1rem',
  justifyContent: 'center',
  marginTop: '1rem',
};

// Button Styles
const primaryButton = {
  padding: '12px 30px',
  backgroundColor: '#ff4057',
  color: '#000',
  border: 'none',
  borderRadius: '50px',
  fontWeight: '600',
  textDecoration: 'none',
  fontSize: '1rem',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
};

const secondaryButton = {
  ...primaryButton,
  backgroundColor: 'transparent',
  border: '2px solid #ff4057',
  color: '#ff4057',
};

// Section Headers
const sectionHeader = {
  textAlign: 'center',
  marginBottom: '2rem',
};

const sectionTitle = {
  fontSize: '2.5rem',
  color: '#ff4057',
  margin: '0.5rem 0 1rem',
  position: 'relative',
  display: 'inline-block',
};

const sectionSubtitle = {
  fontSize: '1.1rem',
  color: '#ccc',
  maxWidth: '700px',
  margin: '0 auto',
  lineHeight: '1.6',
};

// Features Section
const featuresSectionStyle = {
  padding: '4rem 0',
  backgroundColor: '#0B0B34',
  color: '#fff',
};

const featuresGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '1.5rem',
  textAlign: 'center',
};

const featureCard = {
  padding: '1.5rem',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '12px',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'transform 0.3s ease',
  ':hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 8px 20px rgba(255, 215, 0, 0.2)',
  },
};

const featureIcon = {
  fontSize: '2rem',
  color: '#ff4057',
  marginBottom: '0.8rem',
};

const featureTitle = {
  fontSize: '1.2rem',
  color: '#ff4057',
  margin: '0.3rem 0',
};

const featureText = {
  color: '#ccc',
  lineHeight: '1.5',
  fontSize: '0.9rem',
  margin: 0,
};

// About Section
const aboutSectionStyle = {
  padding: '4rem 0',
  backgroundColor: '#fff',
  position: 'relative',
  overflow: 'hidden',
};

const aboutPattern = {
  position: 'absolute',
  top: 0,
  right: 0,
  width: '40%',
  height: '100%',
  background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.05), rgba(255, 193, 7, 0.05))',
  clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0% 100%)',
  zIndex: 1,
};

const aboutFlex = {
  display: 'flex',
  gap: '4rem',
  alignItems: 'center',
  flexWrap: 'wrap',
  position: 'relative',
  zIndex: 2,
};

const aboutImageSide = {
  flex: '1',
  minWidth: '300px',
  maxWidth: '500px',
  position: 'relative',
};

const aboutImage = {
  width: '100%',
  height: '500px',
  objectFit: 'cover',
  borderRadius: '12px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
};

const aboutTextSide = {
  flex: '1',
  minWidth: '300px',
};

const aboutParagraph = {
  fontSize: '1rem',
  lineHeight: '1.7',
  color: '#444',
  marginBottom: '1.2rem',
};

const highlightText = {
  color: '#ff4057',
  fontWeight: '600',
};

// Safety Section
const safetySectionStyle = {
  padding: '0 0 2rem 0',
  backgroundColor: '#f8f9fa',
  position: 'relative',
};

const safetyGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '1.5rem',
  marginTop: '1.5rem',
};

const safetyCard = {
  padding: '1rem',
  backgroundColor: '#fff',
  borderRadius: '10px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  border: '1px solid #eee',
  transition: 'transform 0.3s ease',
  ':hover': {
    transform: 'translateY(-5px)',
  },
};

const safetyIcon = {
  fontSize: '2rem',
  color: '#ff4057',
  marginBottom: '0.8rem',
};
const buttonGroup = {
  display: 'flex',
  gap: '1rem',
  justifyContent: 'center',
  marginTop: '1.5rem',
  flexWrap: 'wrap',
};

const whyUsTitle = {
  fontSize: '1.2rem',
  color: '#16213E',
  margin: '0.5rem 0',
};

const whyUsText = {
  color: '#666',
  lineHeight: '1.5',
  fontSize: '0.95rem',
};

const safetyNote = {
  marginTop: '1.5rem',
  padding: '0.8rem',
  backgroundColor: '#FDEBD0',
  borderRadius: '6px',
  fontSize: '0.9rem',
  color: '#8A704D',
  display: 'flex',
  alignItems: 'center',
  textAlign: 'center',
};

// Contact Section
const contactSectionStyle = {
  padding: '3rem 0',
  
  color: '#fff',
};

const contactFlex = {
  display: 'flex',
  gap: '2rem',
  flexWrap: 'wrap',
};

const contactInfoSide = {
  flex: '1',
  minWidth: '300px',
  maxWidth: '100%',
  padding: '1rem',
};

const contactText = {
  fontSize: '1rem',
  color: 'black',
  marginBottom: '1.5rem',
  lineHeight: '1.5',
};

const contactDetails = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.8rem',
};

const contactItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.8rem',
  fontSize: '0.95rem',
  color: 'black',
  marginBottom: '0.5rem',
};

const contactIcon = {
  color: '#ff4057',
  fontSize: '1.3rem',
};

const contactFormSide = {
  flex: '1',
  minWidth: '300px',
  maxWidth: '100%',
  padding: '1rem',
};

const contactForm = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.8rem',
};

const contactInput = {
  padding: '10px 12px',
  border: '1px solid #555',
  borderRadius: '6px',
  fontSize: '0.95rem',
  outline: 'none',
  color: '#000',
 backgroundColor: '#f8f9fa', 
};

const contactTextarea = {
  ...contactInput,
  resize: 'vertical',
  minHeight: '100px',
};

// Global Animations
const keyframes = `
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
    100% { transform: translateY(0px); }
  }
`;

const styleElement = document.createElement('style');
styleElement.innerHTML = keyframes;
document.head.appendChild(styleElement);

export default Home;
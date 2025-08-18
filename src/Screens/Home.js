import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import logo from "../assets/logo.jpg";
import hero_bg from "../assets/new_hero_img.jpg";
import new_img from "../assets/fire crackers image2.webp";
import new_img2 from "../assets/fireworks.webp";
import new_img3 from "../assets/fire racker image4.webp";
import new_img4 from "../assets/fire cracker img 5.jpg";
import about_img from "../assets/about_BG.jpg";
import pro_img2 from "../assets/fire_gif.gif";
import axios from "axios";
import localforage from "localforage";
import API_BASE_URL from "./apiConfig";
import {
  FiCalendar, FiDollarSign, FiAward, FiCheck, FiX,
  FiAlertTriangle, FiAlertCircle, FiTwitter, FiShoppingCart,
  FiMapPin, FiPhone, FiMail, FiClock, FiSend,
  FiUser, FiGlobe, FiDroplet, FiShield, FiBookOpen, FiStar, FiMessageCircle, FiMenu
} from 'react-icons/fi';

import Header from './HeaderLayouts';
import Footer from './FooterLayouts';

function Home() {
  const [activeTab, setActiveTab] = useState('all');
  const [timeLeft, setTimeLeft] = useState({});
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
const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'
const [formData, setFormData] = useState({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  companyId: 2 // Default company ID as per your requirements
});
// Add this handler function
const handleContactSubmit = async (e) => {
  e.preventDefault();
  
  // Enhanced validation
  if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
    alert('Please fill in all required fields (Name, Email, Message)');
    return;
  }

  if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
    alert('Please enter a valid email address');
    return;
  }

  setIsSubmittingContact(true);
  setSubmitStatus(null);

  try {
    const token = await localforage.getItem("jwtToken");
    if (!token) {
      throw new Error("No authentication token found");
    }

    // Prepare FormData
    const formDataToSend = new FormData();
    formDataToSend.append('Name', formData.name);
    formDataToSend.append('Email', formData.email);
    formDataToSend.append('Phone', formData.phone || ''); // Make optional
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
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        companyId: 2
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 1000);
    } else {
      throw new Error(response.data.statusDesc || "Failed to send message");
    }
  } catch (error) {
    console.error("Error details:", {
      message: error.message,
      response: error.response?.data,
      config: error.config
    });
    setSubmitStatus('error');
    alert(`Failed to send message: ${error.response?.data?.message || error.message}`);
  } finally {
    setIsSubmittingContact(false);
  }
};
// Update the form input change handler
const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};
  return (
    <>
      <Header isMobile={isMobile} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

     
     
{/* Top Marquee */}
<div style={slidingTextContainerStyle}>
<marquee behavior="scroll" direction="left" scrollamount={isMobile ? 5 : 10}>
          📍 <strong>ADHITYA Crackers:</strong> Near New Housing Board, KTC Nagar, Tirunelveli - 627011
          &nbsp; | &nbsp;
          📍 <strong>MMA Crackers:</strong> Plot.no.3, Anjaneya Nagar, E.Muthlingapuram, Sathur, Virudhunagar - 626203
          &nbsp; | &nbsp;
          📍 <strong>Porunai Crackers:</strong> 1/410, Four Lane Road, Near Rettiarpatti Hill, Tirunelveli - 627007
        </marquee>
</div>

      {/* Hero Section */}
      <section style={isMobile ? mobileHeroSectionStyle : heroSectionStyle}>
        <div style={heroOverlay}></div>
        {!isMobile && (
          <>
            <div style={sparkleLeft}></div>
            <div style={sparkleRight}></div>
          </>
        )}
        <div style={isMobile ? mobileHeroContentWrapper : heroContentWrapper}>
          <h1 style={isMobile ? mobileHeroTitle : heroTitle}>ADHITYA CRACKERS</h1>
          <p style={isMobile ? mobileHeroSubtitle : heroSubtitle}>Celebrating traditions with premium fireworks for over a decade.</p>
          <div style={isMobile ? mobileHeroButtonGroup : heroButtonGroup}>
            <Link to="/product" style={isMobile ? mobilePrimaryButton : primaryButton}>Explore Fireworks</Link>
          </div>
        </div>
        {!isMobile && (
          <>
            <div style={heroAnimationLeft}>
              <img src={pro_img2} alt="Fireworks Animation" style={heroGifStyle} />
            </div>
            <div style={heroAnimationRight}>
              <img src={pro_img2} alt="Fireworks Animation" style={heroGifStyle} />
            </div>
          </>
        )}
      </section>

      {/* Features Section */}
      <section style={isMobile ? mobileFeaturesSectionStyle : featuresSectionStyle}>
        <div style={container}>
          <div style={isMobile ? mobileFeaturesGrid : featuresGrid}>
            <div style={isMobile ? mobileFeatureCard : featureCard}>
              <FiCalendar style={isMobile ? mobileFeatureIcon : featureIcon} />
              <h3 style={isMobile ? mobileFeatureTitle : featureTitle}>Trust</h3>
              <p style={isMobile ? mobileFeatureText : featureText}> Trusted Shipment and service</p>
            </div>
            <div style={isMobile ? mobileFeatureCard : featureCard}>
              <FiShield style={isMobile ? mobileFeatureIcon : featureIcon} />
              <h3 style={isMobile ? mobileFeatureTitle : featureTitle}>Licensed & Safe</h3>
              <p style={isMobile ? mobileFeatureText : featureText}>100% legal, quality-tested products</p>
            </div>
            <div style={isMobile ? mobileFeatureCard : featureCard}>
              <FiDollarSign style={isMobile ? mobileFeatureIcon : featureIcon} />
              <h3 style={isMobile ? mobileFeatureTitle : featureTitle}>Best Prices</h3>
              <p style={isMobile ? mobileFeatureText : featureText}>Direct from manufacturer to you</p>
            </div>
            <div style={isMobile ? mobileFeatureCard : featureCard}>
              <FiDroplet style={isMobile ? mobileFeatureIcon : featureIcon} />
              <h3 style={isMobile ? mobileFeatureTitle : featureTitle}>Eco-Friendly</h3>
              <p style={isMobile ? mobileFeatureText : featureText}>Low smoke & reduced environmental impact</p>
            </div>
          </div>
        </div>
      </section>

      
{/* About Section */}
<section style={isMobile ? mobileAboutSectionStyle : aboutSectionStyle}>
  <div style={aboutPattern}></div>
  <div style={isMobile ? mobileContainer : container}>
    <div style={isMobile ? mobileAboutFlex : aboutFlex}>
      <div style={isMobile ? mobileAboutImageSide : aboutImageSide}>
        <div style={isMobile ? mobileAboutImageContainer : aboutImageContainer}>
          <img src={about_img} alt="About Adhitya Crackers" style={isMobile ? mobileAboutImage : aboutImage} />
        </div>
      </div>
      <div style={isMobile ? mobileAboutTextSide : aboutTextSide}>
        <div style={isMobile ? mobileSectionHeader : sectionHeader}>
          <h2 style={isMobile ? mobileSectionTitle : sectionTitle}>About Us</h2>
        </div>
        <p style={isMobile ? mobileAboutParagraph : aboutParagraph}>
          We, <strong style={highlightText}>Adhitya Crackers</strong>, are based in Tirunelveli — the Firecracker City of Tamil Nadu. We are the agency to sell all fireworks crackers based upon customer orders.
        </p>
        <p style={isMobile ? mobileAboutParagraph : aboutParagraph}>
          With more than a decade of experience, we've established ourselves as one of the largest manufacturers, retailers, and wholesalers of crackers in Tirunelveli. We carefully procure crackers during the optimal sun-drying months of March, April, and May to ensure we deliver only the highest quality products at the most competitive prices to our customers.
        </p>
        <p style={isMobile ? mobileAboutParagraph : aboutParagraph}>
          At Adhitya Crackers, we're committed to offering quality products, unparalleled service and the most competitive prices in town. Great service begins with great people and industry experience, which is why our staff is made up of the best and most qualified in the business.
        </p>
        <div style={isMobile ? mobileAboutFeatures : aboutFeatures}>
          <div style={isMobile ? mobileAboutFeatureItem : aboutFeatureItem}>
            <FiCheck style={aboutFeatureIcon} /> Premium Quality Materials
          </div>
          <div style={isMobile ? mobileAboutFeatureItem : aboutFeatureItem}>
            <FiCheck style={aboutFeatureIcon} /> Eco-Friendly Products
          </div>
          <div style={isMobile ? mobileAboutFeatureItem : aboutFeatureItem}>
            <FiCheck style={aboutFeatureIcon} /> Competitive Pricing
          </div>
          <div style={isMobile ? mobileAboutFeatureItem : aboutFeatureItem}>
            <FiCheck style={aboutFeatureIcon} /> Safe & Licensed
          </div>
        </div>
        <div style={isMobile ? mobileButtonGroup : buttonGroup}>
          <Link to="/about" style={isMobile ? mobilePrimaryButton : primaryButton}>Learn More</Link>
          <Link 
  to="/contact" 
  style={isMobile ? mobileSecondaryButton : secondaryButton}
  onClick={(e) => {
    e.preventDefault();
    const footer = document.getElementById('contact-footer');
    if (footer) {
      // Scroll to the top of the footer with some offset
      window.scrollTo({
        top: footer.offsetTop - 20, // 20px offset from top
        behavior: 'smooth'
      });
    }
  }}
>
  Contact Us
</Link>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* Safety Tips Section */}
      <section style={isMobile ? mobileSafetySectionStyle : safetySectionStyle}>
        <div style={container}>
          <div style={isMobile ? mobileSectionHeader : sectionHeader}>
            
            <h2 style={isMobile ? mobileSectionTitle : sectionTitle}>Firecracker Safety Tips</h2>
            <p style={isMobile ? mobileSectionSubtitle : sectionSubtitle}>
              Celebrate joyfully, but always prioritize safety for yourself and others.
            </p>
          </div>

          <div style={isMobile ? mobileSafetyGrid : safetyGrid}>
            <div style={isMobile ? mobileSafetyCard : safetyCard}>
              <FiAlertTriangle style={isMobile ? mobileSafetyIcon : safetyIcon} />
              <h4 style={isMobile ? mobileWhyUsTitle : whyUsTitle}>Use Open Spaces</h4>
              <p style={isMobile ? mobileWhyUsText : whyUsText}>
                Always light crackers in open, clear areas away from buildings, dry grass, and overhead wires.
              </p>
            </div>

            <div style={isMobile ? mobileSafetyCard : safetyCard}>
              <FiUser style={isMobile ? mobileSafetyIcon : safetyIcon} />
              <h4 style={isMobile ? mobileWhyUsTitle : whyUsTitle}>Keep Kids at a Distance</h4>
              <p style={isMobile ? mobileWhyUsText : whyUsText}>
                Only adults should handle fireworks. Keep children and pets at a safe distance during display.
              </p>
            </div>

            <div style={isMobile ? mobileSafetyCard : safetyCard}>
              <FiDroplet style={isMobile ? mobileSafetyIcon : safetyIcon} />
              <h4 style={isMobile ? mobileWhyUsTitle : whyUsTitle}>Have Water Ready</h4>
              <p style={isMobile ? mobileWhyUsText : whyUsText}>
                Keep a bucket of water, hose, or fire extinguisher nearby in case of emergencies.
              </p>
            </div>

            <div style={isMobile ? mobileSafetyCard : safetyCard}>
              <FiX style={isMobile ? mobileSafetyIcon : safetyIcon} />
              <h4 style={isMobile ? mobileWhyUsTitle : whyUsTitle}>Never Relight a DUD</h4>
              <p style={isMobile ? mobileWhyUsText : whyUsText}>
                If a cracker doesn't ignite, do not go near it. Wait 10 minutes, then soak it in water before disposal.
              </p>
            </div>
          </div>

          <div style={isMobile ? mobileSafetyNote : safetyNote}>
            <FiAlertCircle style={{ color: '#F39C12', marginRight: '8px' }} />
            <span>
              <strong>Note:</strong> At Adhitya Crackers, we only sell legal, licensed, and safety-tested products. Celebrate responsibly!
            </span>
          </div>
        </div>
      </section>

    {/* Contact Section */}
    <section style={isMobile ? mobileContactSectionStyle : contactSectionStyle}>
        <div style={container}>
          <div style={isMobile ? mobileContactFlex : contactFlex}>
            <div style={isMobile ? mobileContactInfoSide : contactInfoSide}>
              <h2 style={isMobile ? mobileSectionTitle : sectionTitle}>Get in Touch</h2>
              <p style={isMobile ? mobileContactText : contactText}>Have questions or need a bulk order quote? We're here to help!</p>
              <div style={isMobile ? mobileContactDetails : contactDetails}>
                <div style={isMobile ? mobileContactItem : contactItem}>
                  <FiMapPin style={isMobile ? mobileContactIcon : contactIcon} /> 
                  <span>Near New Housing Board, KTC Nagar, Tirunelveli - 627011</span>
                </div>
                <div style={isMobile ? mobileContactItem : contactItem}>
                  <FiPhone style={isMobile ? mobileContactIcon : contactIcon} /> 
                  <span>+91 9842155255</span>
                </div>
                <div style={isMobile ? mobileContactItem : contactItem}>
                  <FiMail style={isMobile ? mobileContactIcon : contactIcon} /> 
                  <span>reliableups14@gmail.com</span>
                </div>
                <div style={isMobile ? mobileContactItem : contactItem}>
  <FiGlobe style={isMobile ? mobileContactIcon : contactIcon} /> 
  <span>adhityacrackers.com</span>
</div>
                <div style={isMobile ? mobileContactItem : contactItem}>
                  <FiClock style={isMobile ? mobileContactIcon : contactIcon} /> 
                  <span>Mon - Sat: 9:00 AM - 8:00 PM</span>
                </div>
              </div>
              
              
            </div>
            
           <div style={isMobile ? mobileContactFormSide : contactFormSide}>
  <form 
    style={isMobile ? mobileContactForm : contactForm} 
    onSubmit={handleContactSubmit}
  >
    <input 
      style={isMobile ? mobileContactInput : contactInput} 
      name="name"
      placeholder="Your Name" 
      value={formData.name}
      onChange={handleInputChange}
      required
    />
    <input 
      style={isMobile ? mobileContactInput : contactInput} 
      name="email"
      placeholder="Email" 
      type="email" 
      value={formData.email}
      onChange={handleInputChange}
      required
    />
    <input 
      style={isMobile ? mobileContactInput : contactInput} 
      name="phone"
      placeholder="Phone" 
      value={formData.phone}
      onChange={handleInputChange}
    />
    <select
      style={isMobile ? mobileContactInput : contactInput}
      name="subject"
      value={formData.subject}
      onChange={handleInputChange}
    >
      <option value="">Select Subject</option>
      <option value="General Inquiry">General Inquiry</option>
      <option value="Bulk Order">Bulk Order</option>
      <option value="Product Question">Product Question</option>
      <option value="Other">Other</option>
    </select>
    <textarea 
      style={isMobile ? mobileContactTextarea : contactTextarea} 
      name="message"
      placeholder="Your Message" 
      rows="4"
      value={formData.message}
      onChange={handleInputChange}
      required
    ></textarea>
    
    {/* Hidden companyId field */}
    <input type="hidden" name="companyId" value={formData.companyId} />
    
    {/* Submission status message */}
    {submitStatus === 'success' && (
      <div style={{ 
        color: 'green', 
        textAlign: 'center',
        margin: '10px 0',
        fontSize: '0.9rem'
      }}>
        Message sent successfully!
      </div>
    )}
    {submitStatus === 'error' && (
      <div style={{ 
        color: 'red', 
        textAlign: 'center',
        margin: '10px 0',
        fontSize: '0.9rem'
      }}>
        Failed to send message. Please try again.
      </div>
    )}
    
    <button 
      type="submit" 
      style={isMobile ? mobilePrimaryButton : primaryButton}
      disabled={isSubmittingContact}
    >
      {isSubmittingContact ? (
        'Sending...'
      ) : (
        'Send Message'
      )}
    </button>
  </form>
</div>
          </div>
        </div>
      </section>

      {/* Bottom Marquee */}
      <div style={marqueeContainerStyle}>
        <marquee behavior="scroll" direction="left" scrollamount={isMobile ? 5 : 10}>
          📍 <strong>ADHITYA Crackers:</strong> Near New Housing Board, KTC Nagar, Tirunelveli - 627011
          &nbsp; | &nbsp;
          📍 <strong>MMA Crackers:</strong> Plot.no.3, Anjaneya Nagar, E.Muthlingapuram, Sathur, Virudhunagar - 626203
          &nbsp; | &nbsp;
          📍 <strong>Porunai Crackers:</strong> 1/410, Four Lane Road, Near Rettiarpatti Hill, Tirunelveli - 627007
        </marquee>
      </div>

      <Footer />
    </>
  );
}


// ====== STYLES ======

// Base Container Styles
const container = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 2rem',
  position: 'relative',
  zIndex: 2,
};

const mobileContainer = {
  maxWidth: '100%',
  margin: '0 auto',
  padding: '0 1rem',
  position: 'relative',
  zIndex: 2,
};

// Marquee Styles
const marqueeContainerStyle = {
  background: 'linear-gradient(90deg, #F4D03F, #F39C12)',
 
  
  padding: '0.6rem 0',
  position: 'relative',
  zIndex: 10,
  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
};



// Hero Section Styles
const heroSectionStyle = {
  height: '55vh',
  minHeight: '350px',
  background: `url(${hero_bg}) no-repeat center center`,
  backgroundSize: 'cover',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  textAlign: 'center',
  padding: '0',
};

const mobileHeroSectionStyle = {
  ...heroSectionStyle,
  height: '65vh',
  minHeight: '400px',
  padding: '1rem',
};

const heroOverlay = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'linear-gradient(135deg, rgba(10, 18, 44, 0.9), rgba(22, 33, 78, 0.85))',
};

const heroContentWrapper = {
  position: 'relative',
  zIndex: 4,
  color: '#fff',
  maxWidth: '800px',
  padding: '0',
  margin: '0 auto',
  marginBottom: "30px"
};

const mobileHeroContentWrapper = {
  ...heroContentWrapper,
  padding: '1rem',
  marginBottom: "20px"
};
const stickyMarqueeContainerStyle = {
  ...marqueeContainerStyle,
  position: 'sticky',
  top: '75px', // Adjust this value based on your header height
  zIndex: 50, // Lower than header but above content
  marginTop: '1', // Ensure no margin
};

 
// Content Wrapper Style
const contentWrapperStyle = {
  position: 'relative',
};
const heroTitle = {
  fontSize: 'clamp(2.5rem, 8vw, 4rem)',
  fontWeight: '800',
  margin: '0 0 0.2rem',
  whiteSpace: 'nowrap',
  background: 'linear-gradient(45deg, #F4D03F, #F39C12)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  letterSpacing: '1px',
  textShadow: '0 2px 5px rgba(0,0,0,0.3)',
  marginBottom: "10px"
};

const mobileHeroTitle = {
  ...heroTitle,
  fontSize: '2rem',
  whiteSpace: 'normal',
  marginBottom: "5px"
};

const heroSubtitle = {
  fontSize: '1rem',
  color: '#ddd',
  margin: '0 auto 0.8rem',
  lineHeight: '1.4',
  maxWidth: '600px',
};

const mobileHeroSubtitle = {
  ...heroSubtitle,
  fontSize: '0.9rem',
  margin: '0 auto 1rem',
};

const heroButtonGroup = {
  display: 'flex',
  gap: '1rem',
  justifyContent: 'center',
  flexWrap: 'wrap',
  marginTop: '0.5rem',
};

const mobileHeroButtonGroup = {
  ...heroButtonGroup,
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.5rem',
};

// Button Styles
const primaryButton = {
  padding: '12px 30px',
  backgroundColor: '#F39C12',
  color: '#fff',
  border: 'none',
  borderRadius: '50px',
  fontWeight: '600',
  textDecoration: 'none',
  fontSize: '1rem',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 15px rgba(243, 156, 18, 0.4)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  
};

const mobilePrimaryButton = {
  ...primaryButton,
  padding: '10px 20px',
  fontSize: '0.9rem',
  width:"250px",
  marginLeft:"9px",
  marginTop:"5px"
};

const secondaryButton = {
  ...primaryButton,
  backgroundColor: 'transparent',
  border: '2px solid #F4D03F',
  color: '#F4D03F',
};

const mobileSecondaryButton = {
  ...secondaryButton,
  padding: '10px 20px',
  fontSize: '0.9rem',
};

// Section Header Styles
const sectionHeader = {
  textAlign: 'center',
  marginBottom: '2rem',
};

const mobileSectionHeader = {
  ...sectionHeader,
  marginBottom: '1.5rem',
};

const sectionTitle = {
  fontSize: '2.5rem',
  color: '#16213E',
  margin: '0.5rem 0 1rem',
  position: 'relative',
  display: 'inline-block',
};

const mobileSectionTitle = {
  ...sectionTitle,
  fontSize: '1.8rem',
  margin: '0.3rem 0 0.8rem',
};

const sectionSubtitle = {
  fontSize: '1.1rem',
  color: '#666',
  maxWidth: '700px',
  margin: '0 auto',
  lineHeight: '1.6',
};

const mobileSectionSubtitle = {
  ...sectionSubtitle,
  fontSize: '0.9rem',
  maxWidth: '100%',
};

// About Section Styles
const aboutSectionStyle = {
  padding: '4rem 0',
  backgroundColor: '#fff',
  position: 'relative',
  overflow: 'hidden',
};

const mobileAboutSectionStyle = {
  ...aboutSectionStyle,
  padding: '2rem 0',
};

const aboutPattern = {
  position: 'absolute',
  top: 0,
  right: 0,
  width: '40%',
  height: '100%',
  background: 'linear-gradient(135deg, rgba(243, 156, 18, 0.05), rgba(244, 208, 63, 0.05))',
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

const mobileAboutFlex = {
  ...aboutFlex,
  flexDirection: 'column',
  gap: '2rem',
};

const aboutImageSide = {
  flex: '1',
  minWidth: '300px',
  maxWidth: '500px', // Add max-width to prevent image from getting too large
  position: 'relative',
};

const mobileAboutImageSide = {
  ...aboutImageSide,
  minWidth: '100%',
};

const aboutImageContainer = {
  position: 'relative',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
  maxHeight: '560px', // Add max-height to control image size
};

const mobileAboutImageContainer = {
  ...aboutImageContainer,
  boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
  maxHeight: '300px', // Smaller max-height for mobile
};

const aboutImage = {
  width: '100%',
  height: '100%', // Change from 'auto' to '100%'
  objectFit: 'cover', // Ensure image covers container while maintaining aspect ratio
  display: 'block',
  transition: 'transform 0.5s ease',
};

const mobileAboutImage = {
  ...aboutImage,
};

const aboutTextSide = {
  flex: '1',
  minWidth: '300px',
};

const mobileAboutTextSide = {
  ...aboutTextSide,
  minWidth: '100%',
};

const highlightText = {
  color: '#F39C12',
  fontWeight: '600',
};

const aboutParagraph = {
  fontSize: '1rem',
  lineHeight: '1.7',
  color: '#444',
  marginBottom: '1.2rem',
};

const mobileAboutParagraph = {
  ...aboutParagraph,
  fontSize: '0.9rem',
  lineHeight: '1.6',
  marginBottom: '1rem',
};

const aboutFeatures = {
  margin: '2rem 0',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1rem',
};

const mobileAboutFeatures = {
  ...aboutFeatures,
  gridTemplateColumns: '1fr',
  margin: '1.5rem 0',
};

const aboutFeatureItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.95rem',
  color: '#555',
};

const mobileAboutFeatureItem = {
  ...aboutFeatureItem,
  fontSize: '0.85rem',
};

const aboutFeatureIcon = {
  color: '#F39C12',
  fontSize: '1.2rem',
};

const buttonGroup = {
  display: 'flex',
  gap: '1rem',
  marginTop: '1.5rem',
};

const mobileButtonGroup = {
  ...buttonGroup,
  flexDirection: 'column',
  gap: '0.8rem',
  marginTop: '1rem',
};

// Features Section Styles
const featuresSectionStyle = {
  padding: '2rem 0',
  backgroundColor: '#16213E',
  color: '#fff',
  position: 'relative',
};

const mobileFeaturesSectionStyle = {
  ...featuresSectionStyle,
  padding: '1.5rem 0',
};

const featuresGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '1rem',
  textAlign: 'center',
};

const mobileFeaturesGrid = {
  ...featuresGrid,
  gridTemplateColumns: '1fr',
  gap: '0.8rem',
};

const featureCard = {
  padding: '1rem',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '8px',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
};

const mobileFeatureCard = {
  ...featureCard,
  padding: '0.8rem',
};

const featureIcon = {
  fontSize: '1.8rem',
  color: '#F4D03F',
  marginBottom: '0.5rem',
};

const mobileFeatureIcon = {
  ...featureIcon,
  fontSize: '1.5rem',
};

const featureTitle = {
  fontSize: '1.1rem',
  color: '#F4D03F',
  margin: '0.3rem 0',
};

const mobileFeatureTitle = {
  ...featureTitle,
  fontSize: '1rem',
};

const featureText = {
  color: '#ccc',
  lineHeight: '1.4',
  margin: 0,
  fontSize: '0.9rem',
};

const mobileFeatureText = {
  ...featureText,
  fontSize: '0.8rem',
};

// Safety Section Styles
const safetySectionStyle = {
  padding: '0 0 2rem 0',
  backgroundColor: '#fffaf0',
  position: 'relative',
};

const mobileSafetySectionStyle = {
  ...safetySectionStyle,
  padding: '0 0 1.5rem 0',
};

const safetyGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '1.5rem',
  marginTop: '1.5rem',
};

const mobileSafetyGrid = {
  ...safetyGrid,
  gridTemplateColumns: '1fr',
  gap: '1rem',
  marginTop: '1rem',
};

const safetyCard = {
  padding: '1rem',
  backgroundColor: '#fff',
  borderRadius: '10px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  border: '1px solid #f0e6e6',
  transition: 'transform 0.3s ease',
};

const mobileSafetyCard = {
  ...safetyCard,
  padding: '0.8rem',
};

const safetyIcon = {
  fontSize: '2rem',
  color: '#D35400',
  marginBottom: '0.8rem',
};

const mobileSafetyIcon = {
  ...safetyIcon,
  fontSize: '1.5rem',
  marginBottom: '0.6rem',
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

const mobileSafetyNote = {
  ...safetyNote,
  marginTop: '1rem',
  fontSize: '0.8rem',
  flexDirection: 'column',
  textAlign: 'left',
  alignItems: 'flex-start',
};

const whyUsTitle = {
  fontSize: '1.2rem',
  color: '#16213E',
  margin: '0.5rem 0',
};

const mobileWhyUsTitle = {
  ...whyUsTitle,
  fontSize: '1rem',
  margin: '0.3rem 0',
};

const whyUsText = {
  color: '#666',
  lineHeight: '1.5',
  fontSize: '0.95rem',
};

const mobileWhyUsText = {
  ...whyUsText,
  fontSize: '0.85rem',
  lineHeight: '1.4',
};

// Contact Section Styles
const contactSectionStyle = {
  padding: '3rem 0',
};

const mobileContactSectionStyle = {
  ...contactSectionStyle,
  padding: '2rem 0',
};

const contactFlex = {
  display: 'flex',
  gap: '2rem',
  flexWrap: 'wrap',
};

const mobileContactFlex = {
  ...contactFlex,
  flexDirection: 'column',
  gap: '1.5rem',
};

const contactInfoSide = {
  flex: '1',
  minWidth: '300px',
  maxWidth: '100%',
  padding: '1rem',
};

const mobileContactInfoSide = {
  ...contactInfoSide,
  padding: '0',
};

const contactText = {
  fontSize: '1rem',
  color: '#555',
  marginBottom: '1.5rem',
  lineHeight: '1.5',
};

const mobileContactText = {
  ...contactText,
  fontSize: '0.9rem',
  marginBottom: '1rem',
};

const contactDetails = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.8rem',
};

const mobileContactDetails = {
  ...contactDetails,
  gap: '0.6rem',
};

const contactItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.8rem',
  fontSize: '0.95rem',
  color: '#333',
  marginBottom: '0.5rem',
};

const mobileContactItem = {
  ...contactItem,
  fontSize: '0.85rem',
  gap: '0.6rem',
  alignItems: 'flex-start',
};

const contactIcon = {
  color: '#F39C12',
  fontSize: '1.3rem',
};

const mobileContactIcon = {
  ...contactIcon,
  fontSize: '1.1rem',
  marginTop: '2px',
};

const contactFormSide = {
  flex: '1',
  minWidth: '300px',
  maxWidth: '100%',
  padding: '1rem',
};

const mobileContactFormSide = {
  ...contactFormSide,
  padding: '0',
};

const contactForm = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.8rem',
};

const mobileContactForm = {
  ...contactForm,
  gap: '0.6rem',
  width:"270px"
};

const contactInput = {
  padding: '10px 12px',
  border: '1px solid #ddd',
  borderRadius: '6px',
  fontSize: '0.95rem',
  outline: 'none',
};

const mobileContactInput = {
  ...contactInput,
  padding: '8px 10px',
  fontSize: '0.85rem',
};

const contactTextarea = {
  ...contactInput,
  resize: 'vertical',
};

const mobileContactTextarea = {
  ...contactTextarea,
  padding: '8px 10px',
  fontSize: '0.85rem',
};

// Animation Elements
const sparkleLeft = {
  position: 'absolute',
  left: '10%',
  top: '20%',
  width: '40px',
  height: '40px',
  background: 'radial-gradient(circle, #F4D03F, transparent)',
  borderRadius: '50%',
  opacity: 0.8,
  filter: 'blur(10px)',
  animation: 'sparkleLeft 3s ease-in-out infinite',
  zIndex: 3,
};

const sparkleRight = {
  position: 'absolute',
  right: '10%',
  top: '30%',
  width: '50px',
  height: '50px',
  background: 'radial-gradient(circle, #F39C12, transparent)',
  borderRadius: '50%',
  opacity: 0.7,
  filter: 'blur(12px)',
  animation: 'sparkleRight 4s ease-in-out infinite 1s',
  zIndex: 3,
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

const slidingTextContainerStyle = {
  background: 'linear-gradient(90deg, #F4D03F, #F39C12)',
    padding: '0.4rem 0',
   overflow: 'hidden',
   position: 'fixed',
   zIndex: '1000',
   boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
   width: '100%',
   margin: '0',
   boxSizing: 'border-box',
 };
 
 const slidingTextStyle = {
   display: 'inline-block',
   color: '#000',
    
   
 fontFamily: "'Noto Sans Tamil', 'Tamil Sangam MN', 'Latha', Arial, sans-serif",
   animation: 'slideRightToLeft 40s linear infinite',
   whiteSpace: 'nowrap',
   margin: '0'
 };
   
 const slidingTextContainerStylefooter = {
  background: 'linear-gradient(90deg, #FFEB3B, #FFC107)',
    padding: '0.4rem 0',
   overflow: 'hidden',
   position: 'relative',
   boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
   width: '100%',
   margin: '0',
   boxSizing: 'border-box',
 };
 
 const slidingTextStylefooter = {
   display: 'inline-block',
   color: '#000',
   fontSize: '0.9rem',
   fontWeight: '500',
 fontFamily: "'Noto Sans Tamil', 'Tamil Sangam MN', 'Latha', Arial, sans-serif",
   animation: 'slideRightToLeft 40s linear infinite',
   whiteSpace: 'nowrap',
   margin: '0'
 };
 
// Keyframes Animation
const keyframes = `
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
    100% { transform: translateY(0px); }
  }
  @keyframes sparkleLeft {
    0%, 100% { transform: rotate(-15deg) scale(1); opacity: 0.8; }
    50% { transform: rotate(-25deg) scale(1.3); opacity: 1; }
  }
  @keyframes sparkleRight {
    0%, 100% { transform: rotate(15deg) scale(1); opacity: 0.7; }
    50% { transform: rotate(25deg) scale(1.4); opacity: 1; }
  }
`;

const styleElement = document.createElement('style');
styleElement.innerHTML = keyframes;
document.head.appendChild(styleElement);

export default Home;
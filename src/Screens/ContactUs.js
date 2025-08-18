import React from 'react';
import { Link } from 'react-router-dom';
import cover from "../assets/bg.jpg"
import { 
    FiMapPin,
    FiPhone,
    FiMail,
    FiClock,
    FiSend,
    FiInstagram,
    FiFacebook,
    FiTwitter
} from 'react-icons/fi';
import Header from './HeaderLayouts';
import Footer from './FooterLayouts';

function Contact() {
  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <div style={heroSectionStyle}>
        <div style={heroOverlayStyle}></div>
        <div style={heroContentStyle}>
          <h1 style={heroTitleStyle}>Let's Spark a Conversation</h1>
          <p style={heroTextStyle}>Whether you're planning an event or need wholesale fireworks, our team is ready to light up your inbox.</p>
        </div>
      </div>

      {/* Contact Section */}
      <section style={contactSectionStyle}>
        <div style={contactContainerStyle}>
          {/* Left Side - Graphic */}
          <div style={graphicSectionStyle}>
            <div style={graphicContainerStyle}>
              <div style={floatingIconStyle(1)}>
                <FiMail style={iconStyle} />
              </div>
              <div style={floatingIconStyle(2)}>
                <FiPhone style={iconStyle} />
              </div>
              <div style={floatingIconStyle(3)}>
                <FiMapPin style={iconStyle} />
              </div>
              <div style={mainGraphicStyle}>
                <div style={pulseCircleStyle}></div>
                <div style={centerCircleStyle}>
                  <FiSend style={bigIconStyle} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Side - Form */}
          <div style={formSectionStyle}>
            <h2 style={formTitleStyle}>Send Us a Message</h2>
            <p style={formSubtitleStyle}>We typically respond within 24 hours</p>
            
            <form style={formStyle}>
              <div style={formGridStyle}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Your Name</label>
                  <input 
                    type="text" 
                    style={inputStyle} 
                    placeholder="John Doe"
                  />
                </div>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Email Address</label>
                  <input 
                    type="email" 
                    style={inputStyle} 
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              
              <div style={formGroupStyle}>
                <label style={labelStyle}>Subject</label>
                <select style={selectStyle}>
                  <option value="">What's this about?</option>
                  <option value="wholesale">Wholesale Inquiry</option>
                  <option value="event">Event Planning</option>
                  <option value="support">Customer Support</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div style={formGroupStyle}>
                <label style={labelStyle}>Your Message</label>
                <textarea 
                  style={textareaStyle} 
                  rows="5"
                  placeholder="Tell us how we can help..."
                ></textarea>
              </div>
              
              <button type="submit" style={submitButtonStyle}>
                <FiSend style={buttonIconStyle} />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
      
      {/* Info Section */}
      <section style={infoSectionStyle}>
        <div style={infoContainerStyle}>
          <div style={infoCardStyle}>
            <div style={infoIconWrapperStyle('#FF6B6B')}>
              <FiMapPin style={infoIconStyle} />
            </div>
            <h3 style={infoTitleStyle}>  Location</h3>
            <p style={infoTextStyle}>
              123 Fireworks Avenue<br />
              Sivakasi, Tamil Nadu 626123<br />
              India
            </p>
            <Link to="/location" style={infoLinkStyle}>
              View on map  
            </Link>
          </div>
          
          <div style={infoCardStyle}>
            <div style={infoIconWrapperStyle('#4ECDC4')}>
              <FiPhone style={infoIconStyle} />
            </div>
            <h3 style={infoTitleStyle}>Call Us</h3>
            <p style={infoTextStyle}>
              Sales: +91 98765 43210<br />
              Support: +91 87654 32109<br />
              Mon-Sat: 9AM-8PM
            </p>
            <a href="tel:+919876543210" style={infoLinkStyle}>
              Call now 
            </a>
          </div>
          
          <div style={infoCardStyle}>
            <div style={infoIconWrapperStyle('#FFD166')}>
              <FiMail style={infoIconStyle} />
            </div>
            <h3 style={infoTitleStyle}>Email Us</h3>
            <p style={infoTextStyle}>
              sales@vivifytraders.com<br />
              support@vivifytraders.com<br />
              For urgent matters, please call
            </p>
            <a href="mailto:sales@vivifytraders.com" style={infoLinkStyle}>
              Email now 
            </a>
          </div>
        </div>
      </section>
      
      {/* Social Section */}
      <section style={socialSectionStyle}>
        <h2 style={socialTitleStyle}>Connect With Us</h2>
        <p style={socialTextStyle}>Follow us for the latest fireworks displays, safety tips, and special offers</p>
        
        <div style={socialIconsStyle}>
          <a href="#" style={socialLinkStyle}>
            <FiInstagram style={socialIconStyle} />
          </a>
          <a href="#" style={socialLinkStyle}>
            <FiFacebook style={socialIconStyle} />
          </a>
          <a href="#" style={socialLinkStyle}>
            <FiTwitter style={socialIconStyle} />
          </a>
        </div>
      </section>
      
      <Footer />
    </>
  );
}

// Styles
const heroSectionStyle = {
    position: 'relative',
    height: '350px', // Reduced from 400px
    backgroundImage: `linear-gradient(135deg, #667eea 0%, #764ba2 100%), url(${cover})`,
    backgroundBlendMode: 'overlay',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    color: 'white',
    overflow: 'hidden',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    marginTop: '0' // Ensure no extra margin
  };
  

  const heroOverlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)' // Semi-dark overlay for better text contrast
  };

  const heroContentStyle = {
    position: 'relative',
    zIndex: 1,
    maxWidth: '800px',
    padding: '0 20px',
    marginTop: '-1rem' // Move content up slightly
  }; 
  const formTitleStyle = {
    fontSize: '1.8rem', // Slightly smaller than 2rem
    color: '#1a237e',
    marginBottom: '0.3rem' // Reduced from 0.5rem
  };
const heroTitleStyle = {
  fontSize: '3rem',
  fontWeight: '700',
  marginBottom: '1rem',
  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
};

const heroTextStyle = {
  fontSize: '1.2rem',
  lineHeight: '1.6',
  marginBottom: '2rem'
};

const contactSectionStyle = {
    padding: '2rem 2rem 3rem', // Reduced top padding from 5rem
    backgroundColor: '#f9f9f9',
    marginTop: '-0.1rem' // Pull the section up slightly
  };

const contactContainerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '3rem',
  '@media (max-width: 768px)': {
    gridTemplateColumns: '1fr'
  }
};

const graphicSectionStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '@media (max-width: 768px)': {
    display: 'none'
  }
};

const graphicContainerStyle = {
  position: 'relative',
  width: '100%',
  height: '400px'
};

const floatingIconStyle = (position) => ({
  position: 'absolute',
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'white',
  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  zIndex: 2,
  ...(position === 1 && { top: '20px', left: '20px', backgroundColor: '#FF6B6B', color: 'white' }),
  ...(position === 2 && { top: '20px', right: '20px', backgroundColor: '#4ECDC4', color: 'white' }),
  ...(position === 3 && { bottom: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#FFD166', color: 'white' })
});

const iconStyle = {
  fontSize: '1.5rem'
};

const mainGraphicStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '250px',
  height: '250px',
  borderRadius: '50%',
  backgroundColor: '#1a237e',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1
};

const pulseCircleStyle = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  backgroundColor: 'rgba(26, 35, 126, 0.2)',
  animation: 'pulse 2s infinite'
};

const centerCircleStyle = {
  width: '180px',
  height: '180px',
  borderRadius: '50%',
  backgroundColor: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const bigIconStyle = {
  fontSize: '3rem',
  color: '#1a237e'
};

const formSectionStyle = {
  backgroundColor: 'white',
  borderRadius: '10px',
  padding: '2.5rem',
  boxShadow: '0 15px 30px rgba(0,0,0,0.05)'
};
 
const formSubtitleStyle = {
    fontSize: '0.95rem', // Slightly smaller
    color: '#666',
    marginBottom: '1.5rem' // Reduced from 2rem
  };

const formStyle = {
  display: 'flex',
  flexDirection: 'column'
};

const formGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1.5rem',
  marginBottom: '1rem', // Added bottom margin
  '@media (max-width: 480px)': {
    gridTemplateColumns: '1fr'
  }
};


const formGroupStyle = {
  marginBottom: '1.5rem'
};

const labelStyle = {
  display: 'block',
  fontSize: '0.9rem',
  color: '#555',
  marginBottom: '0.5rem',
  fontWeight: '500'
};

const inputStyle = {
  width: '100%',
  padding: '0.8rem 1rem',
  borderRadius: '6px',
  border: '1px solid #ddd',
  fontSize: '0.95rem',
  transition: 'all 0.3s ease',
  ':focus': {
    outline: 'none',
    borderColor: '#1a237e',
    boxShadow: '0 0 0 3px rgba(26, 35, 126, 0.1)'
  }
};

const selectStyle = {
  ...inputStyle,
  appearance: 'none',
  backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 1rem center',
  backgroundSize: '1rem'
};

const textareaStyle = {
  ...inputStyle,
  minHeight: '120px',
  resize: 'vertical'
};

const submitButtonStyle = {
  padding: '1rem 2rem',
  backgroundColor: '#1a237e',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontSize: '1rem',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  transition: 'all 0.3s ease',
  ':hover': {
    backgroundColor: '#3949ab',
    transform: 'translateY(-2px)',
    boxShadow: '0 5px 15px rgba(26, 35, 126, 0.3)'
  }
};

const buttonIconStyle = {
  fontSize: '1.2rem'
};

const infoSectionStyle = {
  padding: '4rem 2rem',
  backgroundColor: 'white'
};

const infoContainerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '2rem'
};

const infoCardStyle = {
  backgroundColor: '#f9f9f9',
  borderRadius: '10px',
  padding: '2rem',
  transition: 'all 0.3s ease',
  ':hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
  }
};

const infoIconWrapperStyle = (color) => ({
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  backgroundColor: `${color}20`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '1.5rem'
});

const infoIconStyle = {
  fontSize: '1.5rem',
  color: 'inherit'
};

const infoTitleStyle = {
  fontSize: '1.3rem',
  color: '#1a237e',
  marginBottom: '1rem'
};

const infoTextStyle = {
  fontSize: '1rem',
  color: '#555',
  lineHeight: '1.6',
  marginBottom: '1.5rem'
};

const infoLinkStyle = {
  fontSize: '0.9rem',
  color: '#1a237e',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.3rem',
  transition: 'all 0.2s ease',
  ':hover': {
    color: '#3949ab',
    gap: '0.5rem'
  }
};

const socialSectionStyle = {
  padding: '4rem 2rem',
  backgroundColor: '#f0f4ff',
  textAlign: 'center'
};

const socialTitleStyle = {
  fontSize: '2rem',
  color: '#1a237e',
  marginBottom: '1rem'
};

const socialTextStyle = {
  fontSize: '1.1rem',
  color: '#555',
  maxWidth: '600px',
  margin: '0 auto 2rem'
};

const socialIconsStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '1.5rem'
};

const socialLinkStyle = {
  width: '50px',
  height: '50px',
  borderRadius: '50%',
  backgroundColor: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
  transition: 'all 0.3s ease',
  ':hover': {
    transform: 'translateY(-5px)',
    backgroundColor: '#1a237e',
    color: 'white'
  }
};

const socialIconStyle = {
  fontSize: '1.5rem'
};

// Animation
const styles = document.createElement('style');
styles.textContent = `
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(1.2);
      opacity: 0;
    }
  }
`;
document.head.appendChild(styles);

export default Contact;
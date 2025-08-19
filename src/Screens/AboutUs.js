import React, { useState, useEffect } from "react";
import Header from "./HeaderLayouts";
import Footer from "./FooterLayouts";
import aboutimage from "../assets/cracker_img.jpg";
import productimage from "../assets/fire-cracker.png";
import happyclient from "../assets/happyClient.png";
import customer from "../assets/Customer.png";
import backgroundimg from "../assets/about_img3.webp";

const styles = {
  aboutUsContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#ffffff",
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
  },

  // Animated background particles
  animatedBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 1,
    pointerEvents: "none",
  },

  particle: {
    position: "absolute",
    borderRadius: "50%",
    opacity: 0,
  },

  // Hero section with crackers animation
  heroSection: {
    width: "100%",
    height: "230px",
    backgroundImage: `url(${backgroundimg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    zIndex: 2,
  },

  heroTitle: {
    color: "white",
    fontSize: "2.5rem",
    fontWeight: "700",
    letterSpacing: "1px",
    textShadow: "3px 3px 6px rgba(0, 0, 0, 0.7)",
    textAlign: "center",
    padding: "0 20px",
  },

  aboutUsHeaderContainer: {
    width: "100%",
    maxWidth: "1150px",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
    borderRadius: "15px",
    padding: "30px",
    backgroundColor: "#F2F2F2",
    backdropFilter: "blur(10px)",
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
    marginTop: "10px",
    margin: "10px 20px 0 20px",
    zIndex: 2,
  },

  aboutUsContent: {
    display: "flex",
    gap: "40px",
    alignItems: "flex-start",
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%",
    flexDirection: "row",
  },

  aboutUsText: {
    flex: "1",
    fontSize: "1.1rem",
    lineHeight: "1.8",
    color: "#333",
    textAlign: "left",
    backgroundColor: "transparent",
    padding: "0 0 0 20px",
    order: 2,
  },

  aboutUsLogoContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    order: 1,
    minWidth: "300px",
  },

  aboutUsLogo: {
    padding: "20px",
    borderRadius: "70px",
    width: "300px",
    height: "auto",
    objectFit: "contain",
    animation: "float 3s ease-in-out infinite",
    filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.1))",
  },

 statisticsCards: {
  display: "flex",
  gap: "30px",
  justifyContent: "center",
  marginTop: "40px",
  marginBottom: "40px",
  width: "100%",
  maxWidth: "1300px",
  padding: "0 20px",
  flexWrap: "wrap",
  zIndex: 2,
  position: "relative",
},

  statisticsCard: {
background: "linear-gradient(145deg, #ff4057 0%, #ff4057 100%)",
boxShadow: "0 15px 35px rgba(32, 124, 202, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
    borderRadius: "15px",
    padding: "30px 25px",
    textAlign: "center",
    width: "300px",
    minWidth: "250px",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
  },

  statisticsIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto 15px auto",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(5px)",
  },

  statisticsImage: {
    width: "28px",
    height: "28px",
    objectFit: "contain",
    display: "block",
    filter: "brightness(0) invert(1)",
  },

  statisticsCardH2: {
    fontSize: "1.8rem",
    margin: "0",
    color: "#ffffff",
    fontWeight: "700",
    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
  },

  statisticsCardP: {
    fontSize: "1.1rem",
    color: "#ffffff",
    margin: "8px 0 0 0",
    fontWeight: "600",
    textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
  },

  // Additional features section
  featuresSection: {
    width: "100%",
    maxWidth: "1300px",
    padding: "40px 20px",
    zIndex: 2,
    position: "relative",
  },

  featuresGrid: {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "20px",
  marginTop: "20px",
  padding: "0 20px", // Add horizontal padding
},

 featureCard: {
  backdropFilter: "blur(10px)",
  borderRadius: "12px",
  padding: "20px 15px",
  textAlign: "center",
  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  cursor: "pointer",
  height: "200px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  margin: "0 10px", // Add horizontal margins
},

  featureIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto 15px auto",
     background: "linear-gradient(135deg, #FF6B35, #FFD166)",
    fontSize: "18px",
  },

  featureTitle: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#333",
    margin: "0 0 10px 0",
  },

  featureDescription: {
    fontSize: "0.9rem",
    lineHeight: "1.4",
    color: "#666",
    margin: "0",
  },

  
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
  fontSize: '0.9rem',
  fontWeight: '500',
fontFamily: "'Noto Sans Tamil', 'Tamil Sangam MN', 'Latha', Arial, sans-serif",
  animation: 'slideRightToLeft 40s linear infinite',
  whiteSpace: 'nowrap',
  margin: '0'
};
  
const slidingTextContainerStylefooter = {
  background: 'linear-gradient(90deg, #F4D03F, #F39C12)',
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

// Enhanced mobile styles with animations
const mobileStyles = `

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
  }

  @keyframes sparkle {
    0%, 100% { 
      opacity: 0; 
      transform: translateY(0px) scale(0); 
    }
    50% { 
      opacity: 1; 
      transform: translateY(-20px) scale(1); 
    }
  }

  .particle {
    animation: sparkle var(--duration) ease-in-out infinite;
    animation-delay: var(--delay);
  }

  .statistics-card:hover, .feature-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 35px rgba(0,0,0,0.2);
  }

  @media (max-width: 768px) {
    .hero-section-mobile {
      height: 150px !important;
    }
    
    .hero-title-mobile {
      font-size: 2rem !important;
      padding: 0 15px !important;
    }
    
    .about-header-container-mobile {
      margin: 10px 10px 0 10px !important;
      padding: 20px 15px !important;
      border-radius: 10px !important;
    }
    
    .about-content-mobile {
      flex-direction: column !important;
      gap: 25px !important;
      align-items: center !important;
    }
    
    .about-text-mobile {
      order: 2 !important;
      text-align: center !important;
      padding: 0 !important;
      font-size: 1rem !important;
      line-height: 1.7 !important;
    }
    
    .about-logo-container-mobile {
      order: 1 !important;
      min-width: auto !important;
    }
    
    .about-logo-mobile {
      width: 220px !important;
      max-width: 90vw !important;
    }
    
    
    
    .statistics-card-mobile {
      width: 100% !important;
      max-width: 280px !important;
      min-width: auto !important;
      padding: 25px 20px !important;
    }
    
    .statistics-card-h2-mobile {
      font-size: 1.6rem !important;
    }
    
    .statistics-card-p-mobile {
      font-size: 1rem !important;
    }

    .features-grid-mobile {
      grid-template-columns: 1fr !important;
      gap: 20px !important;
    }

    .features-section-mobile {
      padding: 30px 15px !important;
    }
  }
  
  @media (max-width: 480px) {
    .hero-title-mobile {
      font-size: 1.7rem !important;
    }
    
    .about-header-container-mobile {
      margin: 10px 5px 0 5px !important;
      padding: 15px 10px !important;
    }
    
    .about-logo-mobile {
      width: 180px !important;
    }
    
    .about-text-mobile {
      font-size: 0.95rem !important;
      line-height: 1.6 !important;
    }
    
    .statistics-cards-mobile {
      padding: 0 10px !important;
    }
    
    
  }
`;

const Aboutus = () => {
  const [particles, setParticles] = useState([]);

  // Generate animated particles
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 12; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 15 + 8,
          delay: Math.random() * 4,
          duration: Math.random() * 3 + 2,
          color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][Math.floor(Math.random() * 6)]
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  // Add mobile styles to document head
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = mobileStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  

  return (
    <>
      <Header />

{/* Top Marquee */}

      <div style={styles.aboutUsContainer}>
        {/* Animated Background Particles */}
        <div style={styles.animatedBackground}>
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="particle"
              style={{
                ...styles.particle,
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                background: `radial-gradient(circle, ${particle.color}, transparent)`,
                '--delay': `${particle.delay}s`,
                '--duration': `${particle.duration}s`,
              }}
            />
          ))}
        </div>

        {/* Hero section with mobile classes */}
        <div 
          style={styles.heroSection}
          className="hero-section-mobile"
        >
          <h1 
            style={styles.heroTitle}
            className="hero-title-mobile"
          >
            About Us 
          </h1>
        </div>

        {/* Header Section with mobile classes */}
        <div 
          style={styles.aboutUsHeaderContainer}
          className="about-header-container-mobile"
        >
          {/* Main Content - Image LEFT, Text RIGHT */}
          <div 
            style={styles.aboutUsContent}
            className="about-content-mobile"
          >
            {/* Logo/Image - LEFT SIDE */}
            <div 
              style={styles.aboutUsLogoContainer}
              className="about-logo-container-mobile"
            >
              <img
                src={aboutimage}
                alt="Sri Gokilaa Crackers Logo"
                style={styles.aboutUsLogo}
                className="about-logo-mobile"
              />
            </div>

            {/* Text Content - RIGHT SIDE */}
            <div 
              style={styles.aboutUsText}
              className="about-text-mobile"
            >
              <p>
                Adhitya Crackers is the most trusted and reliable website for online crackers shopping in India. We are happy to deliver the best quality crackers at the best price. We sell different varieties of conventional crackers and fancy novel crackers. Every year, new varieties of crackers are introduced for our online customers. We serve our clients faster and better every time with our 24/7 online support.
              </p>
              <p>
                Customer satisfaction is our priority and we don't compromise on our quality. We follow all safety standards from packing to delivery. Celebrate every special occasion with our wide range of crackers and spread happiness around you!
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards with Yellow Gradient */}
        <div 
          style={styles.statisticsCards}
          className="statistics-cards-mobile"
        >
          {/* Card 1: Products */}
          <div 
            style={styles.statisticsCard}
            className="statistics-card-mobile statistics-card"
          >
            <div style={styles.statisticsIcon}>
              <img
                src={productimage}
                alt="Products"
                style={styles.statisticsImage}
              />
            </div>
            <h2 
              style={styles.statisticsCardH2}
              className="statistics-card-h2-mobile"
            >
              200+
            </h2>
            <p 
              style={styles.statisticsCardP}
              className="statistics-card-p-mobile"
            >
              Products
            </p>
          </div>

          {/* Card 2: Happy Clients */}
          <div 
            style={styles.statisticsCard}
            className="statistics-card-mobile statistics-card"
          >
            <div style={styles.statisticsIcon}>
              <img
                src={happyclient}
                alt="Happy Clients"
                style={styles.statisticsImage}
              />
            </div>
            <h2 
              style={styles.statisticsCardH2}
              className="statistics-card-h2-mobile"
            >
              500+
            </h2>
            <p 
              style={styles.statisticsCardP}
              className="statistics-card-p-mobile"
            >
              Happy Clients
            </p>
          </div>

          {/* Card 3: Customer Satisfaction */}
          <div 
            style={styles.statisticsCard}
            className="statistics-card-mobile statistics-card"
          >
            <div style={styles.statisticsIcon}>
              <img
                src={customer}
                alt="Customer Satisfaction"
                style={styles.statisticsImage}
              />
            </div>
            <h2 
              style={styles.statisticsCardH2}
              className="statistics-card-h2-mobile"
            >
              100%
            </h2>
            <p 
              style={styles.statisticsCardP}
              className="statistics-card-p-mobile"
            >
              Customer Satisfaction
            </p>
          </div>
        </div>

        {/* Additional Features Section */}
        <div 
          style={styles.featuresSection}
          className="features-section-mobile"
        >
          <div 
            style={styles.featuresGrid}
            className="features-grid-mobile"
          >
            {/* Feature 1: Product Packing */}
            <div style={styles.featureCard} className="feature-card">
              <div style={styles.featureIcon}>
                📦
              </div>
              <h3 style={styles.featureTitle}>Product Packing</h3>
              <p style={styles.featureDescription}>
                "Discover a world of crunch and flavor at our online cracker emporium. From classic favorites to innovative creations, find your perfect bite here!"
              </p>
            </div>

            {/* Feature 2: 24X7 Support */}
            <div style={styles.featureCard} className="feature-card">
              <div style={styles.featureIcon}>
                🎧
              </div>
              <h3 style={styles.featureTitle}>24X7 Support</h3>
              <p style={styles.featureDescription}>
                "Ready to assist you with anything from product inquiries to order assistance. Your satisfaction is our priority, whenever you need us!"
              </p>
            </div>

            {/* Feature 3: Delivery in 5 Days */}
            <div style={styles.featureCard} className="feature-card">
              <div style={styles.featureIcon}>
                🚚
              </div>
              <h3 style={styles.featureTitle}>Delivery in 5 Days</h3>
              <p style={styles.featureDescription}>
                "Our streamlined delivery process ensures your crackers reach you quickly, so you can enjoy them at your convenience."
              </p>
            </div>

            {/* Feature 4: Payment Secure */}
            <div style={styles.featureCard} className="feature-card">
              <div style={styles.featureIcon}>
                💳
              </div>
              <h3 style={styles.featureTitle}>Payment Secure</h3>
              <p style={styles.featureDescription}>
                "Rest easy knowing your payment is secure with us. We prioritize the safety of your transactions, offering peace of mind as you indulge in your favorite crackers."
              </p>
            </div>
          </div>
        </div>
      </div>

  {/* Sliding Text: Right to Left - 3 Addresses Back-to-Back */}
{/* Bottom Marquee */}

      <Footer />
    </>
  );
};

export default Aboutus;
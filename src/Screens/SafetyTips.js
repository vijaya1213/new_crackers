import React from 'react';
import Header from "./HeaderLayouts";
import Footer from "./FooterLayouts";
import safety1 from "../assets/images (1).jpg";
import safety2 from "../assets/safety-2.jpg";
import safety3 from "../assets/safety-14.jpg";
import safety4 from "../assets/safety-4.jpg";
import safety6 from "../assets/safety-13.jpg";
import safety7 from "../assets/img4.jpg";
import safety8 from "../assets/img2.jpg";
import safety9 from "../assets/img5.jpg";
import safety10 from "../assets/safety-10.jpg";
import safety11 from "../assets/img3.jpeg";
import safety12 from "../assets/safety-12.jpg";

const SafetyTips = () => {
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
  return (
    <>
      <Header />

      {/* Top Marquee */}

      <div style={styles.container}>
        {/* Hero Section */}
<div style={styles.imageContainer}>
  
  <div style={styles.heroImageContainer}>
    <img
      src={safety4}
      alt="Person safely lighting fireworks from a distance at night"
      style={styles.heroImage}
    />
     <div style={styles.heroImg}>
    </div>
    <div style={styles.dangerIcon}>
        <p style={styles.caption}>
    🔥 Always light fireworks from a safe distance using a long lighter.
       </p>
    </div>
  </div>

</div>

        {/* Safety Tips Grid */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Essential Safety Tips</h2>
            <div style={styles.titleDivider}></div>
          </div>
          
          <div style={styles.tipGrid}>
            {safetyTips.map((tip, index) => (
              <div key={index} style={styles.tipCard}>
                <div style={styles.tipImageContainer}>
                  <img
                    src={tip.image}
                    alt={tip.title}
                    style={styles.tipImage}
                  />
                  <div style={styles.tipNumber}>{index + 1}</div>
                </div>
                <div style={styles.tipContent}>
                  <h3 style={styles.tipTitle}>{tip.title}</h3>
                  <p style={styles.tipDescription}>{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Emergency Section */}
        <section style={styles.emergencySection}>
          <div style={styles.emergencyContent}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.emergencyTitle}>Emergency Procedures</h2>
              <div style={{...styles.titleDivider, backgroundColor: '#2b6cb0'}}></div>
            </div>
            <ul style={styles.emergencyList}>
              {emergencyItems.map((item, index) => (
                <li key={index} style={styles.emergencyItem}>
                  <span style={styles.emergencyIcon}>⚠️</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div style={styles.emergencyImageContainer}>
            <img
              src={safety1}
              alt="First aid for burns"
              style={styles.emergencyImage}
            />
          </div>
        </section>

        {/* What NOT to Do Section */}
        <section style={styles.dontSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.dontTitle}>Prohibited Actions</h2>
            <div style={{...styles.titleDivider, backgroundColor: '#2b6cb0'}}></div>
          </div>
          <div style={styles.dontGrid}>
            {donts.map((dont, index) => (
              <div key={index} style={styles.dontCard}>
                <img
                  src={dont.image}
                  alt={dont.text}
                  style={styles.dontImage}
                />
                <div style={styles.dontTextContainer}>
                  <div style={styles.dontIcon}>❌</div>
                  <p style={styles.dontText}>{dont.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section style={styles.ctaSection}>
          <div style={styles.ctaContent}>
            <h2 style={styles.ctaTitle}>Safety First, Fun Always</h2>
            <p style={styles.ctaText}>By following these guidelines, you ensure a joyful and accident-free celebration for everyone.</p>
          </div>
          <div style={styles.ctaPattern}></div>
        </section>
      </div>

      {/* Bottom Marquee */}


      <Footer />
    </>
  );
};

// Data
const safetyTips = [
  {
    image: safety6,
    title: "Adult Supervision",
    description: "Never allow children to handle fireworks without an adult present."
  },
  {
    image: safety3,
    title: "Keep Water Nearby",
    description: "Always have a bucket of water, hose, or fire extinguisher ready."
  },
  {
    image: safety8,
    title: "Open Outdoor Areas",
    description: "Only use fireworks in open spaces away from buildings and trees."
  },
  {
    image: safety9,
    title: "Wear Protection",
    description: "Use safety glasses and non-flammable clothing."
  },
  {
    image: safety7,
    title: "Light One at a Time",
    description: "Only ignite a single firework at once to avoid losing control."
  },
  {
    image: safety11,
    title: "Clear the Area",
    description: "Ensure spectators are at least 10 meters away and behind you."
  }
];

const emergencyItems = [
  "If someone is burned, run cool water over the area for 10+ minutes",
  "Do not pop blisters or apply ointments",
  "Call emergency services (112) if fire spreads or injuries are serious",
  "Soak unused or dud fireworks in water before disposal"
];

const donts = [
  {
    image: safety12,
    text: "Never use in wind – sparks can spread quickly"
  },
  {
    image: safety4,
    text: "No alcohol – it impairs judgment and reaction time"
  },
  {
    image: safety2,
    text: "Don't carry in pockets – friction or heat can cause ignition"
  }
];

// Styles
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    color: '#2d3748',
    lineHeight: 1.6,
  },
  
 imageContainer: {
    textAlign: 'center',
    paddingBottom: '10px',
    paddingTop: '10px',
  },
// In your styles object:
heroImageContainer: {
  position: 'relative',
  textAlign: 'center',
  overflow: 'hidden',
},
heroImage: {
  width: '100%',
  maxWidth: '1200px',
  height: '200px',
  objectFit: 'cover',
  filter: 'brightness(0.9) blur(2px)', // Added blur here
},
dangerIcon: {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

},
dangerX: {
  color: 'white',
  fontSize: '20px',
  fontWeight: 'bold',
  lineHeight: '40px',
},
heroHeader: {
  position: 'absolute',
  top: '8%',
  left: '17%',
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
},
  caption: {
    fontSize: '1rem',
    color: 'white',
    fontStyle: 'italic',
    fontWeight: 600,
  },
  // Section Common Styles
  section: {
    margin: '0',
  },
  sectionHeader: {
    marginBottom: '30px',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#2b6cb0',
    marginBottom: '12px',
  },
  titleDivider: {
    height: '4px',
    width: '80px',
    backgroundColor: '#4299e1',
    margin: '0 auto',
    borderRadius: '2px',
  },
  
  // Tips Grid
  tipGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '30px',
  },
  tipCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    ':hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
  },
  tipImageContainer: {
    position: 'relative',
    height: '200px',
    overflow: 'hidden',
  },
  tipImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease',
    ':hover': {
      transform: 'scale(1.05)',
    },
  },
  tipNumber: {
    position: 'absolute',
    top: '16px',
    left: '16px',
    backgroundColor: '#3182ce',
    color: 'white',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '1rem',
  },
  tipContent: {
    padding: '0 20px',
  },
  tipTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#2b6cb0',
    marginBottom: '12px',
  },
  tipDescription: {
    color: '#4a5568',
    fontSize: '1rem',
  },
  
  // Emergency Section
  emergencySection: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#fff5f5',
    borderRadius: '16px',
    overflow: 'hidden',
    margin: '50px 0',
    '@media (min-width: 768px)': {
      flexDirection: 'row',
    },
  },
  emergencyContent: {
    flex: 1,
    padding: '40px',
  },
  emergencyTitle: {
    fontSize: '2rem',
    fontWeight: '700',
   color: '#2b6cb0',
    marginBottom: '12px',
  },
  emergencyList: {
    listStyle: 'none',
    padding: 0,
  },
  emergencyItem: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '16px',
    fontSize: '1.1rem',
    color: '#4a5568',
  },
  emergencyIcon: {
    marginRight: '12px',
    fontSize: '1.2rem',
  },
  emergencyImageContainer: {
    flex: 1,
    minHeight: '300px',
    position: 'relative',
    '@media (min-width: 768px)': {
      minHeight: 'auto',
    },
  },
  emergencyImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  
  // Don't Section
  dontSection: {
    margin: '50px 0',
  },
  dontTitle: {
    fontSize: '2rem',
    fontWeight: '700',
  color: '#2b6cb0',
    marginBottom: '12px',
  },
  dontGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '30px',
  },
  dontCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  dontImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  dontTextContainer: {
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
     backgroundColor: '#fff5f5',
  },
  dontIcon: {
    marginRight: '12px',
    fontSize: '1.2rem',
    color: '#e53e3e',
  },
  dontText: {
    flex: 1,
    color: '#4a5568',
    fontWeight: '500',
  },
  
 // CTA Section with background image
ctaSection: {
  position: 'relative',
  borderRadius: '16px',
  overflow: 'hidden',
  margin: '80px 0',
  color: 'white',
  backgroundImage: `url(${safety10})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
},
ctaContent: {
  position: 'relative',
  zIndex: 2,
  padding: '60px 40px',
  textAlign: 'center',
  backgroundColor: 'rgba(26, 54, 93, 0.7)', // Semi-transparent dark blue overlay
},
ctaTitle: {
  fontSize: '2rem',
  fontWeight: '700',
  marginBottom: '16px',
  textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
},
ctaText: {
  fontSize: '1.1rem',
  maxWidth: '600px',
  margin: '0 auto',
  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
},
// Remove ctaPattern as we're using the image directly
};

export default SafetyTips;
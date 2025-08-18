import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from "./HeaderLayouts";
import Footer from "./FooterLayouts";
import { jsPDF } from "jspdf";
import firecracker from "../assets/firecracker_img.webp";
import Logo from "../assets/Cmp_Logo1.png";
import axios from 'axios';
import localforage from 'localforage';
import API_BASE_URL from "./apiConfig";


const OrderDetails = () => {
  const location = useLocation();
  const [cartProducts, setCartProducts] = useState([]);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const formRef = React.useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderId, setOrderId] = useState("");
const [finalAmountToPay, setFinalAmountToPay] = useState(0);
const [amountBelowMinimum, setAmountBelowMinimum] = useState(false);
const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
const [productToRemove, setProductToRemove] = useState(null);
const [previousQuantity, setPreviousQuantity] = useState(1);

  // Log received cart items and send to API
  useEffect(() => {
    console.log('Received in ViewCart:', location.state?.cartItems);
    
    if (location.state?.cartItems) {
      sendCartItemsToAPI(location.state.cartItems);
    }
  }, [location.state]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
const initialProducts = [
   
];
const handleProceedClick = () => {
  if (subTotal < 3000) {
    return; // Don't proceed if amount is below minimum
  }
  setShowDetailsForm(true);
  
  // Create a small delay to ensure the DOM has updated
  setTimeout(() => {
    const formElement = document.getElementById('orderDetailsForm');
    if (formElement) {
      // Calculate the position to scroll to (accounting for any fixed headers)
      const headerHeight = document.querySelector('header')?.offsetHeight || 0;
      const elementPosition = formElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20;
      
      // Smooth scroll to the form section
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, 100);
};
const handleConfirmOrder = async () => {
  // Validation
  if (!formData.firstName || !formData.contactNumber || !formData.address || !formData.pinCode || !orderId) {
    alert("Please fill all required fields and ensure order is initialized.");
    return;
  }

  const formDataToSend = new FormData();

  // Append data (match backend expected names)
  formDataToSend.append('FirstName', formData.firstName);
  formDataToSend.append('LastName', formData.lastName || "");
  formDataToSend.append('PhoneNumber', formData.contactNumber);
  formDataToSend.append('AltPhoneNumber', formData.whatsappNumber || formData.contactNumber);
  formDataToSend.append('Street', formData.address);
  formDataToSend.append('City', formData.city);
  formDataToSend.append('District', formData.district || formData.city);
  formDataToSend.append('State', formData.state);
  formDataToSend.append('PINCode', formData.pinCode);
  formDataToSend.append('EmailID', formData.email || ""); // Optional
  formDataToSend.append('TotalPayAmount', finalAmountToPay.toFixed(2));
  formDataToSend.append('OrderId', orderId);

  // Debug: log what's being sent
  for (let [key, value] of formDataToSend.entries()) {
    console.log("FormData:", key, value);
  }

  try {
    // Remove token
    const response = await axios.post(
      `${API_BASE_URL}api/Crackers/AddOrderInfo`,
      formDataToSend,
      {
        headers: {
          // Remove Authorization
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.data && response.data.message === "Order created successfully") {
      alert(`✅ Success!\n\nOrder created successfully!`);
      generateOrderPDF();
    } else {
      alert("Order submitted, but response was unclear. Please contact support.");
    }

  } catch (error) {
    console.error("Order submission error:", {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });

    const errorMsg = error.response?.data?.message || 
                     error.response?.data?.statusDesc || 
                     "Failed to submit order. Please check your internet connection.";

    alert(`❌ Order failed: ${errorMsg}`);
  }
};
const sendCartItemsToAPI = async (items) => {
  try {
    // Remove token fetching
    const response = await axios.post(
      `${API_BASE_URL}api/Crackers/AddOrderLine`,
      { products: items },
      {
        headers: {
          // Remove Authorization header
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data) {
      const orderId = response.data.orderId || "";
      const finalAmount = response.data.summary?.finalAmountToPay || 0;

      setOrderId(orderId);
      setFinalAmountToPay(finalAmount);

      setFormData((prev) => ({
        ...prev,
        totalPayAmount: finalAmount,
      }));

      const updatedProducts = response.data.details.map((item) => ({
        id: item.prodcutID, // Note: typo? should be "productId"?
        name: item.productName,
        quantity: item.qty,
        price: item.discountedPrice,
        originalPrice: item.productPrice,
        subtotal: item.finalTotalAmt,
        image: item.productImage,
        discountPercent: item.discountPercentage,
      }));

      setCartProducts(updatedProducts);

      console.log('Received from API:', { orderId, finalAmount, products: updatedProducts });
    }
  } catch (err) {
    console.error('Error sending cart items:', err);
    const message = err.response?.data?.message || err.response?.data?.statusDesc || 'Failed to process cart items';
    setError(message);
  }
};
  // Handle quantity update
const updateQuantity = (productId, newQuantity, prevQuantity) => {
  const quantityNum = parseInt(newQuantity, 10);
  
  // If empty string, allow it (for better UX while typing)
  if (newQuantity === "") {
    setCartProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === productId
          ? { ...product, quantity: "" }
          : product
      )
    );
    return;
  }

  // If invalid number, revert to previous quantity
  if (isNaN(quantityNum)) {
    setCartProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === productId
          ? { ...product, quantity: prevQuantity }
          : product
      )
    );
    return;
  }

  // If quantity is 0, show confirmation popup
  if (quantityNum === 0) {
    const product = cartProducts.find(p => p.id === productId);
    setProductToRemove(product);
    setPreviousQuantity(prevQuantity);
    setShowRemoveConfirm(true);
    return;
  }

  // Minimum quantity is 1
  if (quantityNum < 1) {
    setCartProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === productId
          ? { ...product, quantity: 1 }
          : product
      )
    );
    return;
  }

  // Normal quantity update
  setCartProducts(prevProducts =>
    prevProducts.map(product =>
      product.id === productId
        ? {
            ...product,
            quantity: quantityNum,
            subtotal: product.price * quantityNum
          }
        : product
    )
  );
};

  // State for form inputs
 const [formData, setFormData] = useState({
  firstName: '',
  lastName: '',
  contactNumber: '',           // Maps to PhoneNumber
  whatsappNumber: '',          // Maps to AltPhoneNumber
  sameAsContact: false,
  address: '',                 // Maps to Street
  city: '',
  district: '',                // If not present, use city or add field
  state: '',
  pinCode: '',
  email: '',
  totalPayAmount: 0,           // From cart total
  orderId: '',                 // Set earlier
});

  // State for collapsible sections
  const [openSections, setOpenSections] = useState({
    personal: true,
    address: false,
    bank: false,
  });

  // Toggle section function
  const toggleSection = (section) => {
    setOpenSections({
      personal: section === 'personal',
      address: section === 'address',
      bank: section === 'bank',
    });
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prevData) => {
      let updatedData = { ...prevData };

      if (type === 'checkbox') {
        updatedData[name] = checked;
        
        if (name === 'sameAsContact' && checked) {
          updatedData.whatsappNumber = prevData.contactNumber;
        }
      } else {
        if (name === 'contactNumber' || name === 'whatsappNumber' || name === 'pinCode') {
          const numericValue = value.replace(/[^0-9]/g, '').slice(0, 10);
          updatedData[name] = numericValue;
          
          if (name === 'contactNumber' && prevData.sameAsContact) {
            updatedData.whatsappNumber = numericValue;
          }
        } else if (name === 'accountNumber') {
          const numericValue = value.replace(/[^0-9]/g, '').slice(0, 18);
          updatedData[name] = numericValue;
        } else if (name === 'ifscCode') {
          const alphanumericValue = value.replace(/[^A-Za-z0-9]/g, '').slice(0, 11).toUpperCase();
          updatedData[name] = alphanumericValue;
        } else {
          updatedData[name] = value;
        }
      }

      return updatedData;
    });
  };

  // Calculate totals
  const calculateTotals = () => {
    let netTotal = 0, discountTotal = 0, subTotal = 0;
    cartProducts.forEach(p => {
      netTotal += p.originalPrice * p.quantity;
      discountTotal += (p.originalPrice * p.quantity) - p.subtotal;
      subTotal += p.subtotal;
    });
    return { netTotal, discountTotal, subTotal };
  };

  const { netTotal, discountTotal, subTotal } = calculateTotals();

  const handleSubmit = (e) => {
    e.preventDefault();

    const termsCheckbox = document.getElementById('agreeToTerms');
    if (!termsCheckbox?.checked) {
      alert("You must agree to the Terms and Conditions to proceed.");
      return;
    }

    console.log('Form Data:', formData);
    generateOrderPDF();
  };


useEffect(() => {
  setAmountBelowMinimum(subTotal < 3000);
}, [subTotal]);

const RemoveConfirmationPopup = () => (
  <div style={styles.popupOverlay}>
    <div style={{
      ...styles.popupContainer,
      maxWidth: isMobile ? '90%' : '400px',
    }}>
      <div style={styles.popupHeader}>
        <h3 style={{
          ...styles.popupTitle,
          fontSize: isMobile ? '1rem' : '1.2rem',
        }}>
          Remove Item?
        </h3>
      </div>
      <div style={styles.popupContent}>
        <p style={{
          color: '#64748b',
          fontSize: isMobile ? '0.85rem' : '0.9rem',
          textAlign: 'center',
          marginBottom: 0,
        }}>
          Are you sure you want to remove "{productToRemove?.name}" from your order?
        </p>
      </div>
      <div style={{
        ...styles.popupFooter,
        justifyContent: 'center',
      }}>
        <button
          onClick={() => {
            // Restore quantity to 1 instead of previous quantity
            setCartProducts(prevProducts =>
              prevProducts.map(product =>
                product.id === productToRemove?.id
                  ? { ...product, quantity: 1, subtotal: product.price * 1 }
                  : product
              )
            );
            setShowRemoveConfirm(false);
          }}
          style={{
            padding: isMobile ? '0.75rem 1.5rem' : '0.5rem 1rem',
            border: '1px solid #cbd5e1',
            backgroundColor: 'white',
            color: '#1e293b',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: isMobile ? '0.9rem' : '0.85rem',
            minWidth: isMobile ? '100px' : '80px',
          }}
        >
          Keep Item
        </button>
        <button
          onClick={() => {
            // Actually remove the product
            setCartProducts(prevProducts =>
              prevProducts.filter(product => product.id !== productToRemove?.id)
            );
            setShowRemoveConfirm(false);
          }}
          style={{
            padding: isMobile ? '0.75rem 1.5rem' : '0.5rem 1rem',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: isMobile ? '0.9rem' : '0.85rem',
            minWidth: isMobile ? '100px' : '80px',
          }}
        >
          Remove
        </button>
      </div>
    </div>
  </div>
);

const generateOrderPDF = () => {
  const doc = new jsPDF();
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - (2 * margin);
  let currentPage = 1;
  
  // Function to check if we need a new page
  const checkPageBreak = (yPos, requiredHeight) => {
    if (yPos + requiredHeight > pageHeight - 20) { // 20mm bottom margin
      doc.addPage();
      currentPage++;
      // Clean white background for new page
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      return 20; // Return new yPos with just top margin
    }
    return yPos;
  };
  
  // Function to add header to each page
  const addPageHeader = () => {
    // Clean white background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Header with company branding
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, pageWidth, 26, 'F');
    
    // Add Background Box for Logo
    const logoBgWidth = 50;
    const logoBgHeight = 15;
    const logoBgX = 8;
    const logoBgY = 4;
    
    // Background color (light white/gray for contrast)
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(logoBgX, logoBgY, logoBgWidth, logoBgHeight, 2, 2, 'F');
    
    // Add Logo Image inside the background box
    const logoWidth = 40;
    const logoHeight = 11;
    doc.addImage(Logo, "PNG", 13, 6, logoWidth, logoHeight);
    
    // Tagline below logo
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Premium Quality Fireworks & Sparklers", 8, 24);
    
    // Status badge - properly positioned
    doc.setFillColor(16, 185, 129);
    doc.rect(150, 8, 50, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("ORDER CONFIRMED", 175, 15, { align: "center" });
    
    // Page number (only show if more than 1 page)
    if (currentPage > 1) {
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`Page ${currentPage}`, pageWidth - 15, pageHeight - 10, { align: "right" });
    }
  };
  
  // Initialize first page
  addPageHeader();
  
  // Main content starts
  let yPos = 40;
  
  // Thank you message - centered properly (only on first page)
  if (currentPage === 1) {
    doc.setTextColor(30, 58, 138);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Thank You for Your Order!", pageWidth/2, yPos, { align: "center" });
    
    yPos += 8;
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const orderNum = Date.now().toString().slice(-6);
    doc.text(`Order Date: ${new Date().toLocaleDateString('en-GB')} | Order #ORD-${orderNum}`, pageWidth/2, yPos, { align: "center" });
    
    yPos += 10;
  }
  
  // Customer Details Section - Enhanced with larger container
  const customerDetailsHeight = 60; // Increased from 40 to 60 for more space
  yPos = checkPageBreak(yPos, customerDetailsHeight);

  // Section box with increased height
  doc.setFillColor(248, 250, 252); // Light background
  doc.setDrawColor(226, 232, 240); // Border color
  doc.setLineWidth(0.5);
  doc.rect(margin, yPos, contentWidth, customerDetailsHeight, 'FD'); // Fill and draw

  // Section header
  doc.setFillColor(30, 58, 138); // Dark blue header
  doc.rect(margin, yPos, contentWidth, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("CUSTOMER DETAILS", margin + 5, yPos + 6.5);

  // Customer info with proper spacing and line wrapping
  yPos += 15; // Increased from 13 for better spacing

  // Name
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${formData.firstName} ${formData.lastName}`, margin + 5, yPos);

  // Contact Numbers
  doc.text(`Contact No: ${formData.contactNumber}`, margin + 5, yPos + 8); // Increased spacing
  doc.text(`Whatsapp No: ${formData.whatsappNumber}`, margin + 5, yPos + 16);

  // Address with multi-line support
  const maxAddressWidth = contentWidth - 15; // Allow 15mm for left margin and padding
  const addressText = `${formData.address}, ${formData.pinCode}`;
  const addressLines = doc.splitTextToSize(`Address: ${addressText}`, maxAddressWidth);

  // Draw each address line with proper spacing
  addressLines.forEach((line, index) => {
    doc.text(line, margin + 5, yPos + 24 + (index * 6)); // 6mm line height
  });

  // Email positioned after address lines
  doc.text(`Email: ${formData.email}`, margin + 5, yPos + 24 + (addressLines.length * 6));

  // Adjust yPos for next section based on actual content height
  const actualContentHeight = 24 + (addressLines.length * 6) + 8; // Base + address + email
  yPos += Math.max(customerDetailsHeight - 10, actualContentHeight);
  
  // Order Items Section
  yPos += 10;
  
  // Calculate required height for items section
  const itemsHeight = (cartProducts.length * 8) + 50; // 50 for headers and summary
  yPos = checkPageBreak(yPos, itemsHeight);
  
  // Items section container
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPos, contentWidth, itemsHeight, 'FD');
  
  // Section header
  doc.setFillColor(30, 58, 138);
  doc.rect(margin, yPos, contentWidth, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("ORDER ITEMS & BILL SUMMARY", margin + 5, yPos + 6.5);
  
  // Table headers - properly aligned
  yPos += 15;
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  
  doc.text("PRODUCT", margin + 5, yPos);
  doc.text("QTY", 130, yPos, { align: "center" });
  doc.text("RATE", 155, yPos, { align: "center" });
  doc.text("AMOUNT", pageWidth - margin - 5, yPos, { align: "right" });
  
  // Header line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin + 5, yPos + 2, pageWidth - margin - 5, yPos + 2);
  
  yPos += 6;
  
  // Items data
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  
  cartProducts.forEach((item, index) => {
    // Alternate row colors
    if (index % 2 === 0) {
      const rowMargin = 1;
      doc.setFillColor(252, 252, 252);
      doc.rect(margin + rowMargin, yPos - 1, contentWidth - 2 * rowMargin, 6, 'F');
    }
    
    doc.setTextColor(60, 60, 60);
    
    // Product name
    const maxProductNameWidth = 90;
    let itemName = item.name;
    if (doc.getTextWidth(itemName) > maxProductNameWidth) {
      itemName = item.name.length > 35 ? item.name.substring(0, 35) + '...' : item.name;
    }
    doc.text(itemName, margin + 5, yPos + 2);
    
    // Quantity
    doc.text(item.quantity.toString(), 130, yPos + 2, { align: "center" });
    
    // Rate
    doc.text(`Rs ${item.price.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 155, yPos + 2, { align: "center" });
    
    // Amount
    doc.setFont("helvetica", "bold");
    doc.text(`Rs ${item.subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, pageWidth - margin - 5, yPos + 2, { align: "right" });
    doc.setFont("helvetica", "normal");
    
    yPos += 6;
  });
  
  // Add summary lines directly in the items table
  yPos += 6;
  
  // Subtotal line
  doc.setFillColor(249, 250, 251);
  doc.rect(margin + 3, yPos - 2, contentWidth - 6, 6, 'F');
  doc.setTextColor(75, 85, 99);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Subtotal (MRP):", margin + 5, yPos + 2);
  doc.text(`Rs ${netTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, pageWidth - margin - 5, yPos + 2, { align: "right" });
  
  yPos += 6;
  
  // Discount line
  doc.setFillColor(240, 253, 244);
  doc.rect(margin + 3, yPos - 2, contentWidth - 6, 6, 'F');
  doc.setTextColor(34, 197, 94);
  doc.setFont("helvetica", "bold");
  doc.text("Discount:", margin + 5, yPos + 2);
  doc.text(`- Rs ${discountTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, pageWidth - margin - 5, yPos + 2, { align: "right" });
  
  yPos += 8;
  
  // Total line with separator above
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(margin + 5, yPos - 3, pageWidth - margin - 5, yPos - 3);
  
  doc.setTextColor(30, 58, 138);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL AMOUNT:", margin + 5, yPos + 4);
  doc.setFontSize(12);
  doc.text(`Rs ${subTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, pageWidth - margin - 5, yPos + 4, { align: "right" });
  
  // Thank you section
  yPos += 25;
  const thankYouHeight = 20;
  yPos = checkPageBreak(yPos, thankYouHeight);
  
  doc.setFillColor(254, 240, 138);
  doc.setDrawColor(245, 158, 11);
  doc.rect(margin, yPos, contentWidth, thankYouHeight, 'FD');
  
  doc.setTextColor(146, 64, 14);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Get Ready to Light Up the Sky!", pageWidth/2, yPos + 8, { align: "center" });
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Your premium fireworks are being prepared with care. Thank you for celebrating with us!", pageWidth/2, yPos + 15, { align: "center" });
  
  // Footer
  yPos += 30;
  const footerHeight = 20;
  
  if (yPos + footerHeight > pageHeight - 5) {
    doc.addPage();
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    yPos = 20;
  }
  
  doc.setFillColor(248, 250, 252);
  doc.rect(0, yPos, pageWidth, footerHeight, 'F');
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  
  doc.text("Support: +91-9787009888", margin, yPos + 8);
  doc.text("www.srigokilaacrackers.com", pageWidth/2, yPos + 8, { align: "center" });
  doc.text("srigokilaacrackers0@gmail.com", pageWidth - margin, yPos + 8, { align: "right" });
  
  doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, pageWidth/2, yPos + 15, { align: "center" });
  
  // Save and open PDF
  doc.save("SriGokilaaCrackers_OrderConfirmation.pdf");
};

  // Mobile responsive styles with proper media queries
  const getResponsiveStyles = () => ({
  container: {
    fontFamily: "'Poppins', sans-serif",
    backgroundColor: '#f8fafc',
    color: '#1e293b',
    lineHeight: 1.4,
    padding: isMobile ? '0.5rem' : '1rem',
    minHeight: 'calc(100vh - 100px)',
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    margin: '0 auto',
    maxWidth: isMobile ? '100%' : '1200px',
    width: '100%',
  },
  orderCard: {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    gap: '1rem',
    width: '100%',
    minHeight: '400px' ,
    marginBottom: '2rem',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    flex: 1,
  },
  cardHeader: {
    textAlign: 'center',
    padding: '0.6rem 0',
    backgroundColor: '#E6E9F8',
    color: '#2F3E9E',
  },
  cardTitle: {
    margin: 0,
    fontSize: isMobile ? '0.9rem' : '1rem',
    fontWeight: 600,
  },
  cardBody: {
    padding: isMobile ? '0.5rem' : '0.75rem',
    display: 'flex',
    flexDirection: 'column',
  },
  productList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    overflowY: 'auto',
    maxHeight: isMobile ? '300px' : '400px'
  },
  productItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e2e8f0',
    padding: isMobile ? '0.4rem 0.25rem' : '0.4rem 0.5rem',
    flexWrap: isMobile ? 'wrap' : 'nowrap',
    gap: isMobile ? '0.25rem' : '0',
  },
  productInfo: {
    display: 'flex',
    alignItems: 'center',
    flex: isMobile ? '1 0 100%' : 1,
    marginBottom: isMobile ? '0.25rem' : 0,
  },
  productImage: {
    width: isMobile ? '35px' : '45px',
    height: isMobile ? '35px' : '45px',
    objectFit: 'cover',
    marginRight: isMobile ? '0.5rem' : '0.8rem',
    borderRadius: '0.375rem',
    border: '1px solid #e2e8f0',
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    margin: 0,
    fontWeight: 600,
    fontSize: isMobile ? '0.75rem' : '0.8rem',
    color: '#1e293b',
    lineHeight: 1.2,
  },
  productMeta: {
    margin: '0.2rem 0 0',
    fontSize: isMobile ? '0.7rem' : '0.75rem',
    color: '#64748b',
  },
  productPrice: {
    fontWeight: 600,
    fontSize: isMobile ? '0.75rem' : '0.8rem',
    color: '#1e293b',
    minWidth: isMobile ? '60px' : '75px',
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    paddingRight: isMobile ? '0.25rem' : '0.5rem',
  },
  quantityInputStyle: {
    width: isMobile ? '35px' : '45px',
    padding: '0.3rem',
    border: '1px solid #ddd',
    borderRadius: '3px',
    textAlign: 'center',
    fontSize: isMobile ? '0.75rem' : '0.8rem'
  },
  totalsSection: {
    marginTop: '0.4rem',
    padding: isMobile ? '0.75rem' : '1rem',
    paddingBottom: '0.5rem',

  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
    fontSize: isMobile ? '0.9rem' : '1rem',
  },
  totalLabel: {
    color: '#64748b',
    fontSize: isMobile ? '0.8rem' : '1rem',
  },
  totalValue: {
    fontWeight: 600,
    fontSize: isMobile ? '0.8rem' : '1rem',
    color: 'black',
  },
  grandTotal: {
    borderTop: '1px solid #cbd5e1',
    marginTop: '1rem',
    paddingTop: '1rem',
    fontWeight: 700,
    fontSize: isMobile ? '0.9rem' : '1.2rem',
    color: '#1e293b',
  },
  proceedButton: {
    backgroundColor: '#2F3E9E',
    color: 'white',
    padding: isMobile ? '0.5rem 0.5rem' : '0.5rem 1.1rem',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: isMobile ? '0.95rem' : '0.9rem',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    alignSelf: 'center',
    width: isMobile ? '100%' : 'fit-content',
  },
  formContainer: {
    width: '100%',
  },
  formBody: {
    padding: isMobile ? '0.5rem' : '0.75rem',
  },
  formRow: {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? '0.5rem' : '0.75rem',
    width: '100%',
    marginBottom: '0.5rem',
  },
  formGroup: {
    flex: 1,
    minWidth: 0,
  },
  fullWidth: {
    width: '100%',
  },
  formLabel: {
    display: 'block',
    width: '100%',
    marginBottom: '0.25rem',
    color: '#1e293b',
    fontSize: isMobile ? '0.8rem' : '0.85rem',
    fontWeight: 600,
  },
  formInput: {
    width: '100%',
    padding: isMobile ? '0.6rem' : '0.5rem',
    border: '1px solid #cbd5e1',
    borderRadius: '0.375rem',
    marginBottom: '0.25rem',
    fontSize: isMobile ? '0.9rem' : '0.85rem',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    boxSizing: 'border-box',
  },
  formAddress: {
    width: '100%',
    padding: isMobile ? '0.6rem' : '0.5rem',
    border: '1px solid #cbd5e1',
    borderRadius: '0.375rem',
    resize: 'vertical',
    minHeight: '2.5rem',
    fontSize: isMobile ? '0.9rem' : '0.85rem',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    boxSizing: 'border-box',
    marginBottom: '0.25rem',
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '0.25rem',
  },
  formCheckbox: {
    marginRight: '0.5rem',
    width: isMobile ? '18px' : '16px',
    height: isMobile ? '18px' : '16px',
  },
  sectionTitle: {
    fontSize: isMobile ? '0.9rem' : '0.95rem',
    fontWeight: 600,
    color: '#2F3E9E',
    marginBottom: '0.5rem',
    paddingBottom: '0.4rem',
    borderBottom: '1px solid #e2e8f0',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'all 0.3s ease',
    padding: '0.4rem',
    borderRadius: '0.25rem',
  },
  sectionContent: {
    overflow: 'hidden',
    padding: '0.5rem',
  },
  sectionContentOpen: {
    maxHeight: '1000px',
    opacity: 1,
    marginBottom: '0.5rem',
  },
  sectionContentClosed: {
    maxHeight: '0px',
    opacity: 0,
    marginBottom: '0rem',
  },
  formDetailsColumns: {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    gap: '1rem',
  },
  formColumn: {
    flex: 1,
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    padding: isMobile ? '0.5rem' : '0.75rem',
  },
  submitSection: {
    padding: isMobile ? '0.75rem' : '0.6rem',
  },
  termsSection: {
    backgroundColor: '#f8fafc',
    borderRadius: '0.5rem',
    paddingTop: '0.5rem',
    marginBottom: '1rem',
  },
  termsCheckbox: {
    marginRight: '0.5rem',
  },
  requiredField: {
    color: '#dc2626',
    marginLeft: '0.125rem',
  },
  actionButtons: {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '0.75rem',
    gap: '0.75rem',
  },
  confirmButton: {
    backgroundColor: 'green',
    color: 'white',
    padding: isMobile ? '0.75rem 1.5rem' : '0.6rem 1.2rem',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: isMobile ? '0.95rem' : '0.9rem',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    flex: 1,
    minWidth: isMobile ? '100%' : '120px',
    width: isMobile ? '100%' : 'auto',
  },
  cancelButton: {
    backgroundColor: '#94a3b8',
    color: 'white',
    padding: isMobile ? '0.75rem 1.5rem' : '0.6rem 1.2rem',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: isMobile ? '0.95rem' : '0.9rem',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    flex: 1,
    minWidth: isMobile ? '100%' : '100px',
    width: isMobile ? '100%' : 'auto',
  },
  // Mobile-specific price layout
  mobileDiscountBadge: {
    color: '#10B981',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    padding: '0.2rem 0.4rem',
    borderRadius: '0.25rem',
    backgroundColor: '#ecfdf5',
    border: '1px solid #10B981',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    marginTop: '0.25rem',
  },
  mobileQuantitySection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: '0.25rem',
    paddingTop: '0.25rem',
    borderTop: '1px solid #f1f5f9',
  },
  mobilePriceSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.2rem',
  },
  popupOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: isMobile ? '1rem' : '2rem',
  },
  popupContainer: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    maxWidth: isMobile ? '95%' : '600px',
    maxHeight: isMobile ? '90vh' : '80vh',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  popupHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isMobile ? '0.75rem 1rem' : '1rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
  },
  popupTitle: {
    margin: 0,
    fontSize: isMobile ? '1.1rem' : '1.25rem',
    color: '#1e293b',
  },
  popupCloseButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#dc2626',
    cursor: 'pointer',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'background-color 0.2s',
  },
  popupContent: {
    padding: isMobile ? '1rem' : '1.5rem',
    fontSize: isMobile ? '0.85rem' : '0.9rem',
    lineHeight: 1.5,
    color: '#334155',
    maxHeight: '60vh',
    overflowY: 'auto',
  },
  popupFooter: {
    padding: isMobile ? '0.75rem 1rem' : '1rem 1.5rem',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  }
});

  const styles = getResponsiveStyles();

  const [showTermsPopup, setShowTermsPopup] = useState(false);

  const TermsPopup = () => (
    <div style={styles.popupOverlay}>
      <div style={styles.popupContainer}>
        <div style={styles.popupHeader}>
          <h2 style={styles.popupTitle}>
            Terms and Conditions
          </h2>
          <button
            onClick={() => setShowTermsPopup(false)}
            style={styles.popupCloseButton}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#f1f5f9')}
            onMouseOut={(e) => (e.target.style.backgroundColor = 'transparent')}
          >
            ×
          </button>
        </div>

        <div style={styles.popupContent}>
          <p style={{ marginTop: 0, marginBottom: '1rem' }}>
            Welcome to Sri Gokilaa Crackers. These Terms and Conditions govern your use of our website and services. Please read them carefully before placing an order.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            <strong>1. Acceptance of Terms</strong><br />
            By accessing or using our services, you agree to be bound by these Terms. If you do not agree, please do not use our services.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            <strong>2. Orders and Payments</strong><br />
            All orders are subject to availability and confirmation of payment. We reserve the right to cancel any order at any time.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            <strong>3. Shipping and Delivery</strong><br />
            We aim to dispatch your order within 1–2 business days. Delivery times may vary based on your location.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            <strong>4. Returns and Refunds</strong><br />
            Due to the nature of our products, returns are only accepted in case of damaged or defective items.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            <strong>5. Safety and Legal Compliance</strong><br />
            Fireworks are hazardous goods. You confirm that you are of legal age and responsible for complying with local laws regarding purchase and use.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            <strong>6. Limitation of Liability</strong><br />
            In no event shall Vivify Traders be liable for any indirect, incidental, or consequential damages arising out of the use of our products.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            <strong>7. Changes to Terms</strong><br />
            We may update these terms from time to time. Continued use of the service constitutes acceptance of the updated terms.
          </p>
          <p style={{ marginBottom: 0 }}>
            <strong>8. Governing Law</strong><br />
            These Terms are governed by the laws of India. Any disputes shall be resolved in the courts of [City], India.
          </p>
        </div>

        <div style={styles.popupFooter}>
          <input
            type="checkbox"
            id="agree-terms"
            style={{
              width: '18px',
              height: '18px',
              accentColor: '#1a237e',
              borderRadius: '4px',
            }}
          />
          <label htmlFor="agree-terms" style={{
            fontSize: isMobile ? '0.85rem' : '0.9rem',
            color: '#64748b',
          }}>
            I Agree
          </label>
        </div>
      </div>
    </div>
  );

  const CancelConfirmationPopup = () => (
    <div style={styles.popupOverlay}>
      <div style={{
        ...styles.popupContainer,
        maxWidth: isMobile ? '90%' : '400px',
      }}>
        <div style={styles.popupHeader}>
          <h3 style={{
            ...styles.popupTitle,
            fontSize: isMobile ? '1rem' : '1.2rem',
          }}>
            Cancel Order?
          </h3>
        </div>
        <div style={styles.popupContent}>
          <p style={{
            color: '#64748b',
            fontSize: isMobile ? '0.85rem' : '0.9rem',
            textAlign: 'center',
            marginBottom: 0,
          }}>
            Are you sure you want to cancel your order? All entered details will be cleared.
          </p>
        </div>
        <div style={{
          ...styles.popupFooter,
          justifyContent: 'center',
        }}>
          <button
            onClick={() => setShowCancelPopup(false)}
            style={{
              padding: isMobile ? '0.75rem 1.5rem' : '0.5rem 1rem',
              border: '1px solid #cbd5e1',
              backgroundColor: 'white',
              color: '#1e293b',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: isMobile ? '0.9rem' : '0.85rem',
              minWidth: isMobile ? '100px' : '80px',
            }}
          >
            No
          </button>
          <button
            onClick={() => {
              setFormData({
                firstName: '',
                lastName: '',
                contactNumber: '',
                whatsappNumber: '',
                sameAsContact: false,
                address: '',
                city: '',
                District:'',
                state: '',
                pinCode: '',
                email: '',
                createAccount: false,
              });
              setCartProducts(initialProducts);
              setOpenSections({ personal: true, address: false, bank: false });
              setShowTermsPopup(false);
              setShowCancelPopup(false);
              setShowDetailsForm(false);
              window.location.href = '/Products#/product';
            }}
            style={{
              padding: isMobile ? '0.75rem 1.5rem' : '0.5rem 1rem',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: isMobile ? '0.9rem' : '0.85rem',
              minWidth: isMobile ? '100px' : '80px',
            }}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Header />
      <div style={styles.container}>
        <div style={styles.wrapper}>
          <div style={styles.orderCard}>

            {/* Left Card - Order Items */}
            <div style={{ ...styles.card, flex: isMobile ? 1 : 3 }}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>Your Order</h2>
              </div>

              <div style={styles.cardBody}>
                     <ul style={styles.productList}>
  {cartProducts.map((product) => (
    <li key={product.id} style={styles.productItem}>
      <div style={styles.productInfo}>
        <img
          src={product.image || "https://via.placeholder.com/60"}
          alt={product.name}
          style={styles.productImage}
        />
        <div style={{
          ...styles.productDetails,
          flex: isMobile ? '1 0 100%' : 1,
        }}>
          <p style={{
            ...styles.productName,
            fontSize: isMobile ? '0.7rem' : '0.8rem',
            marginBottom: isMobile ? '0.3rem' : '0.2rem',
          }}>
            {product.name}
          </p>
          
          {/* Mobile-only price display */}
          {isMobile && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '0.2rem'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
              }}>
                <span style={{
                  textDecoration: 'line-through',
                  color: '#64748b',
                  fontSize: '0.65rem'
                }}>
                  ₹{product.originalPrice.toFixed(2)}
                </span>
                <span style={{
                  fontWeight: 'bold',
                  fontSize: '0.7rem'
                }}>
                  ₹{product.price.toFixed(2)}
                </span>
              </div>
              
              <div style={{
                color: '#10B981',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                padding: '0.15rem 0.3rem',
                borderRadius: '0.25rem',
                backgroundColor: '#ecfdf5',
                border: '1px solid #10B981',
              }}>
                Save {product.discountPercent}%
              </div>
            </div>
          )}
        </div>
        
        {/* Desktop price display - remains the same */}
        {!isMobile && (
          <div style={styles.productDetails}>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              width: '100%',
              fontSize: '0.85rem',
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
              }}>
                <span style={{
                  textDecoration: 'line-through',
                  color: '#64748b',
                  fontSize: '0.75rem'
                }}>
                  ₹{product.originalPrice.toFixed(2)}
                </span>
                <span style={{
                  fontWeight: 'bold',
                  fontSize: '0.75rem'
                }}>
                  ₹{product.price.toFixed(2)}
                </span>
              </div>

              <div style={{
                color: '#10B981',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.375rem',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}>
                Save {product.discountPercent}%
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        minWidth: isMobile ? '100%' : '70px',
        justifyContent: isMobile ? 'space-between' : 'center',
        gap: '0.5rem',
        marginTop: isMobile ? '0.3rem' : 0,
        paddingTop: isMobile ? '0.3rem' : 0,
        borderTop: isMobile ? '1px solid #f1f5f9' : 'none'
      }}>
        {isMobile && (
          <span style={{
            fontSize: '0.7rem',
            color: '#64748b'
          }}>Qty:</span>
        )}
<input
  type="number"
  min="0"
  value={product.quantity}
  onChange={(e) => updateQuantity(product.id, e.target.value, product.quantity)}
  style={{
    ...styles.quantityInputStyle,
    width: isMobile ? '50px' : '45px',
  }}
/>
        
        {isMobile && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end'
          }}>
            <div style={{ 
              textDecoration: 'line-through', 
              color: '#64748b', 
              fontSize: '0.65rem' 
            }}>
              ₹{(product.originalPrice * product.quantity).toFixed(2)}
            </div>
            <div style={{ 
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}>
              ₹{product.subtotal.toFixed(2)}
            </div>
          </div>
        )}
      </div>

      {!isMobile && (
        <div style={styles.productPrice}>
          <div style={{ textDecoration: 'line-through', color: '#64748b', fontSize: '0.75rem' }}>
            ₹{(product.originalPrice * product.quantity).toFixed(2)}
          </div>
          <div>₹{product.subtotal.toFixed(2)}</div>
        </div>
      )}
    </li>
  ))}
</ul>
              </div>
            </div>
            
            {/* Right Card - Price Details */}
            <div style={{ ...styles.card, flex: isMobile ? 1 : 2 }}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>Price Details</h2>
              </div>

              <div style={{...styles.totalsSection,display: 'flex',
  flexDirection: 'column',
  height: '80%',
  justifyContent: 'space-between'}}>
                <div style={styles.totalRow}>
                  <span style={styles.totalLabel}>Price ({cartProducts.length} item{cartProducts.length !== 1 ? 's' : ''})</span>
                  <span style={styles.totalValue}>₹{netTotal.toFixed(2)}</span>
                </div>
                <div style={styles.totalRow}>
                  <span style={styles.totalLabel}>Discount</span>
                  <span style={{...styles.totalValue, color:'#10B981'}}>-₹{discountTotal.toFixed(2)}</span>
                </div>
                <div style={{ ...styles.totalRow, ...styles.grandTotal }}>
                  <span>Total Amount</span>
                  <span>₹{subTotal.toFixed(2)}</span>
                </div>

                {/* Add the minimum amount warning */}
    {amountBelowMinimum && (
      <div style={{
        color: '#dc2626',
        fontSize: isMobile ? '0.8rem' : '0.85rem',
        textAlign: 'center',
        margin: '0.5rem 0',
        padding: '0.5rem',
        backgroundColor: '#fee2e2',
        borderRadius: '0.25rem'
      }}>
        Total pay amount must be at least ₹3000
      </div>
    )}

                <div style={{ 
                  padding: isMobile ? '0.75rem' : '0.1rem', 
                  textAlign: 'center' ,
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                  gap: isMobile ? '0.5rem' :  '0' ,
                  marginTop: 'auto',
                }}>
                   <button 
                    style={styles.proceedButton}
                    onClick={() => window.history.back()} 
                  >
                  Back
                  </button>
                  <button 
  style={{
    ...styles.proceedButton,
    opacity: amountBelowMinimum ? 0.6 : 1,
    cursor: amountBelowMinimum ? 'not-allowed' : 'pointer'
  }}
  onClick={handleProceedClick}
  disabled={amountBelowMinimum}
>
  {showDetailsForm ? 'NEXT' : 'NEXT'}
</button>
                </div>
              </div>
            </div>

          </div>

          {/* Order Details Form */}
          {showDetailsForm && (
            <div style={styles.card} id="orderDetailsForm" ref={formRef}>
              <div style={styles.formContainer}>
                <div style={styles.cardHeader}>
                  <h2 style={styles.cardTitle}>Fill Your Details</h2>
                </div>
                <form onSubmit={handleSubmit}>
                  <div style={styles.formBody}>
                    <div style={styles.formDetailsColumns}>
                      {/* Left Column - Personal Information */}
                      <div style={styles.formColumn}>
<div style={styles.sectionTitle}>
  <span>📋 Personal Information</span>
</div>
<div style={{ ...styles.sectionContent, ...styles.sectionContentOpen }}>
  {/* Name Fields */}
  <div style={styles.formRow}>
    <div style={styles.formGroup}>
      <label style={styles.formLabel}>First Name<span style={styles.requiredField}>*</span></label>
      <input
        type="text"
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
        style={styles.formInput}
        placeholder='Enter your first name'
        required
      />
    </div>
    <div style={styles.formGroup}>
      <label style={styles.formLabel}>Last Name</label>
      <input
        type="text"
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
        style={styles.formInput}
        placeholder='Enter your last name'
      />
    </div>
  </div>

  {/* Contact and WhatsApp Row for Desktop / Separate for Mobile */}
  {isMobile ? (
    // Mobile: Contact Number, then Checkbox, then WhatsApp, then Email
    <>
      <div style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>
            Contact Number<span style={styles.requiredField}>*</span>
          </label>
          <input
            type="text"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            style={styles.formInput}
            placeholder="Enter 10-digit mobile number"
            maxLength="10"
            required
          />
        </div>
      </div>

      <div style={styles.formRow}>
        <div style={styles.formGroup}>
          <div style={styles.checkboxContainer}>
            <input
              type="checkbox"
              name="sameAsContact"
              checked={formData.sameAsContact}
              onChange={handleChange}
              style={styles.formCheckbox}
            />
            <label style={{ fontSize: isMobile ? '0.85rem' : '0.8rem', color: '#64748b' }}>
              Same as Contact Number
            </label>
          </div>
        </div>
      </div>

      <div style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>
            WhatsApp Number<span style={styles.requiredField}>*</span>
          </label>
          <input
            type="text"
            name="whatsappNumber"
            value={formData.whatsappNumber}
            onChange={handleChange}
            style={{
              ...styles.formInput,
              backgroundColor: formData.sameAsContact ? '#f0f0f0' : 'white',
              cursor: formData.sameAsContact ? 'not-allowed' : 'text'
            }}
            placeholder={formData.sameAsContact ? "Same as Contact Number" : "Enter 10-digit WhatsApp number"}
            maxLength="10"
            required
            disabled={formData.sameAsContact}
          />
        </div>
      </div>

      <div style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={styles.formInput}
            placeholder='Enter your email address'
          />
        </div>
      </div>
    </>
  ) : (
    // Desktop: Contact and WhatsApp in same row, Email and Checkbox in second row
    <>
      <div style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>
            Contact Number<span style={styles.requiredField}>*</span>
          </label>
          <input
            type="text"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            style={styles.formInput}
            placeholder="Enter 10-digit mobile number"
            maxLength="10"
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.formLabel}>
            WhatsApp Number<span style={styles.requiredField}>*</span>
          </label>
          <input
            type="text"
            name="whatsappNumber"
            value={formData.whatsappNumber}
            onChange={handleChange}
            style={{
              ...styles.formInput,
              backgroundColor: formData.sameAsContact ? '#f0f0f0' : 'white',
              cursor: formData.sameAsContact ? 'not-allowed' : 'text'
            }}
            placeholder={formData.sameAsContact ? "Same as Contact Number" : "Enter 10-digit WhatsApp number"}
            maxLength="10"
            required
            disabled={formData.sameAsContact}
          />
          {/* Checkbox directly below WhatsApp field in desktop */}
          <div style={{...styles.checkboxContainer, marginTop: '0.25rem'}}>
            <input
              type="checkbox"
              name="sameAsContact"
              checked={formData.sameAsContact}
              onChange={handleChange}
              style={styles.formCheckbox}
            />
            <label style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Same as Contact Number
            </label>
          </div>
        </div>
      </div>

      <div style={{...styles.formRow, marginTop: '0.5rem'}}>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={styles.formInput}
            placeholder='Enter your email address'
          />
        </div>
        
        {/* Empty div to maintain two-column layout */}
        <div style={styles.formGroup}></div>
      </div>
    </>
  )}
</div>
                      </div>

                      {/* Right Column - Address Information */}
                      <div style={styles.formColumn}>
                        <div style={styles.sectionTitle}>
                          <span>🏠 Address Information</span>
                        </div>
                        <div style={{ ...styles.sectionContent, ...styles.sectionContentOpen }}>
                          <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                              <label style={styles.formLabel}>House/Flat No., Building Name, Area<span style={styles.requiredField}>*</span></label>
                              <input
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                style={styles.formInput}
                                placeholder="Enter your (House/Flat No., Building Name, Area)"
                                required
                              />
                            </div>
                            <div style={styles.formGroup}>
                              <label style={styles.formLabel}>City<span style={styles.requiredField}>*</span></label>
                              <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                style={styles.formInput}
                                placeholder="City"
                                required
                              />
                            </div>
                          </div>

                          <div style={styles.formRow}>
                           <div style={styles.formGroup}>
                            <label style={styles.formLabel}>District<span style={styles.requiredField}>*</span></label>
                            <input
                              type="text"
                              name="district"
                              value={formData.district}
                              onChange={handleChange}
                              style={styles.formInput}
                              placeholder="Enter district"
                              required
                            />
                          </div>
                             <div style={styles.formGroup}>
                              <label style={styles.formLabel}>State<span style={styles.requiredField}>*</span></label>
                              <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                style={styles.formInput}
                                placeholder="State"
                                required
                              />
                            </div>
                            </div>
                            <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                              <label style={styles.formLabel}>PIN Code<span style={styles.requiredField}>*</span></label>
                              <input
                                type="text"
                                name="pinCode"
                                value={formData.pinCode}
                                onChange={handleChange}
                                style={styles.formInput}
                                placeholder="PIN Code"
                                maxLength="10"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Section */}
                  <div style={styles.submitSection}>
                    <div style={styles.termsSection}>
                      <input
                        type="checkbox"
                        id="agreeToTerms"
                        name="agreeToTerms"
                        required
                        style={{
                          ...styles.formCheckbox,
                          accentColor: '#1a237e'
                        }}
                      />
                      <label htmlFor="agreeToTerms" style={{ fontSize: isMobile ? '0.9rem' : '0.85rem', color: '#64748b' }}>
                        I have read and agree to the{' '}
                        <span
                          style={{
                            color: '#1a237e',
                            textDecoration: 'underline',
                            cursor: 'pointer'
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            setShowTermsPopup(true);
                          }}
                        >
                          Terms and Conditions
                        </span>
                        <span style={styles.requiredField}> *</span>
                      </label>
                    </div>

                    <div style={styles.actionButtons}>
                      <button 
  type="button" 
  style={styles.confirmButton}
  onClick={handleConfirmOrder}  // Make sure this is set correctly
>
  CONFIRM ORDER
</button>
                      <button
                        type="button"
                        style={styles.cancelButton}
                       onClick={() => setShowCancelPopup(true)}
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
      {showRemoveConfirm && <RemoveConfirmationPopup />}
      {showCancelPopup && <CancelConfirmationPopup />}
      {showTermsPopup && <TermsPopup />}
    </>
  );
};

export default OrderDetails;
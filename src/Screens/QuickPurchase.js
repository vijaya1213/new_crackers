import { useNavigate,useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { FiShoppingCart, FiSearch, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';
import logopdf from "../assets/Cmp_logo10.jpg";
import axios from 'axios';
import { jsPDF } from "jspdf";
import localforage from 'localforage';
import Header from './HeaderLayouts';
import Footer from './FooterLayouts';
import quick_image from '../assets/quick_image.jpg';
import API_BASE_URL from "./apiConfig";
import logo from "../assets/AthithyaLogo.png";
function QuickPurchase() {
    const navigate = useNavigate();
    const [productCategories, setProductCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
  
    const [cartItems, setCartItems] = useState({});
    const mobileMediaQuery = window.matchMedia('(max-width: 768px)');
 
    const [quantities, setQuantities] = useState({});
    //viewcart 
    const viewCartRef = React.useRef(null);
    const [showViewCart, setShowViewCart] = useState(false);
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
    // Add this to your state variables
     const [isSubmitting, setIsSubmitting] = useState(false);
      // Log received cart items and send to API
      useEffect(() => {
        console.log('Received in ViewCart:', location.state?.cartItems);
        
        if (location.state?.cartItems) {
      

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
    if (subTotal < 3000) return;

    // Ensure cartProducts is synced before proceeding
    const currentCart = JSON.parse(localStorage.getItem('cart')) || {};
    if (Object.keys(currentCart).length > 0) {
      // Optional: validate prices via API later
      // sendCartItemsToAPI(currentCart);
    }
    setShowDetailsForm(true);

    // Smooth scroll to form
    setTimeout(() => {
      const formElement = document.getElementById('orderDetailsForm');
      if (formElement) {
        const headerHeight = document.querySelector('header')?.offsetHeight || 0;
        const offsetPosition =
          formElement.getBoundingClientRect().top +
          window.pageYOffset -
          headerHeight -
          20;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    }, 100);
  };



 
 




    // Handle quantity update
    const updateQuantity = (productId, newQuantity) => {
      // If empty string, set quantity to empty and subtotal to 0
      if (newQuantity === "") {
        setCartProducts(prevProducts =>
          prevProducts.map(product =>
            product.id === productId
              ? { 
                  ...product, 
                  quantity: "", 
                  subtotal: 0 
                }
              : product
          )
        );
        return;
      }
    
      const quantityNum = parseInt(newQuantity, 10);
      
      // If invalid number (including negative), set to empty with 0 subtotal
      if (isNaN(quantityNum) || quantityNum < 0) {
        setCartProducts(prevProducts =>
          prevProducts.map(product =>
            product.id === productId
              ? { 
                  ...product, 
                  quantity: "", 
                  subtotal: 0 
                }
              : product
          )
        );
        return;
      }
      
      // Allow 0 as valid quantity
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
   let netTotal = 0,
     discountTotal = 0,
     subTotal = 0;
   cartProducts.forEach((p) => {
     netTotal += p.originalPrice * p.quantity;
     discountTotal += (p.originalPrice * p.quantity) - p.subtotal;
     subTotal += p.subtotal;
   });
   return { netTotal, discountTotal, subTotal };
 };

 const { netTotal, discountTotal, subTotal } = calculateTotals();


 

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true); // Start loading

  // Validation
  if (
    !formData.firstName ||
    !formData.contactNumber ||
    !formData.address ||
    !formData.pinCode ||
    !formData.city ||
    !formData.district ||
    !formData.state
  ) {
    alert("Please fill all required fields.");
    setIsSubmitting(false);
    return;
  }
  
  // First check if terms checkbox is checked
  const termsCheckbox = document.getElementById('agreeToTerms');
  if (!termsCheckbox.checked) {
    alert("Please Check the I have read and agree to the Terms and Conditions before confirming your order");
    setIsSubmitting(false);
    return;
  }

  const productsPayload = cartProducts.map((item) => ({
    id: item.id,
    qty: item.quantity,
  }));

  const payload = {
    CompanyId: 2,
    FirstName: formData.firstName,
    LastName: formData.lastName || "",
    PhoneNumber: formData.contactNumber,
    AltPhoneNumber: formData.whatsappNumber || formData.contactNumber,
    Street: formData.address,
    City: formData.city,
    District: formData.district || formData.city,
    State: formData.state,
    PINCode: formData.pinCode,
    EmailID: formData.email || "",
    Products: productsPayload,
  };

  try {
    const response = await axios.post(
      `${API_BASE_URL}api/Crackers/ConfirmOrder`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data && response.data.statusCode === 200) {
      const orderId = response.data.orderId || response.data.data?.orderId;
      if (!orderId) {
        console.error("❌ Order ID not found in response:", response.data);
        alert("Order confirmed, but no Order ID returned. Please contact support.");
        setIsSubmitting(false);
        return;
      }

      setOrderId(orderId);
      const pdfBlob = await generateOrderPDF(orderId);

      // ✅ Upload PDF to SendorderedDoc
      try {
        const formDataToSend = new FormData();
        formDataToSend.append("OrderId", orderId);
        formDataToSend.append("Document", pdfBlob, `Order_${orderId}.pdf`);
        formDataToSend.append("CompanyId", 2);

        const docResponse = await axios.post(
          `${API_BASE_URL}api/Crackers/SendorderedDoc`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (docResponse.data.statusCode === 200) {
          const documentUrl = docResponse.data.data?.documentUrl;

          // ✅ Send WhatsApp with company name
          try {
            const whatsappPayload = {
              to: formData.whatsappNumber || formData.contactNumber,
              pdfUrl: documentUrl,
              text: `ADHITYA CRACKERS - Order #${orderId}`,
              orderNumber: orderId,
              companyName: "ADHITYA CRACKERS" // Add company name here
            };

            const whatsappResponse = await axios.post(
              `${API_BASE_URL}api/Whatsapp/SendMessage/sendmessage`,
              whatsappPayload,
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (whatsappResponse.data.statusCode !== 200) {
              console.warn("⚠️ WhatsApp send failed:", whatsappResponse.data);
            }
          } catch (whatsappError) {
            console.error("❌ WhatsApp error:", whatsappError);
          }
        }
      } catch (docError) {
        console.error("❌ Document upload error:", docError);
      }

      // Reset form and cart
      setFormData({
        firstName: "",
        lastName: "",
        contactNumber: "",
        whatsappNumber: "",
        sameAsContact: false,
        address: "",
        city: "",
        district: "",
        state: "",
        pinCode: "",
        email: "",
        totalPayAmount: 0,
        orderId: "",
      });

      setCartProducts([]);
      setCartItems({});
      setProductCategories((prev) =>
        prev.map((category) => ({
          ...category,
          products: category.products.map((product) => ({
            ...product,
            quantity: "",
          })),
        }))
      );

      localStorage.removeItem("cart");
      setShowDetailsForm(false);
      alert(`✅ Success!\n${response.data.message || "Order confirmed!"}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      alert(`Order failed: ${response.data.statusDesc || "Unknown error"}`);
    }
  } catch (error) {
    const errorMsg =
      error.response?.data?.message ||
      error.response?.data?.statusDesc ||
      "Failed to submit order. Please check your internet connection.";
    console.error("❌ Order submission error:", errorMsg, error);
    alert(`❌ Order failed: ${errorMsg}`);
  } finally {
    setIsSubmitting(false); // Stop loading regardless of success/error
  }
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



// Updated generateOrderPDF function to return blob instead of only saving
const generateOrderPDF = (orderId) => {
  const doc = new jsPDF();
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - (2 * margin);
  let currentPage = 1;

  const checkPageBreak = (yPos, requiredHeight) => {
    if (yPos + requiredHeight > pageHeight - 20) {
      doc.addPage();
      currentPage++;
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      return 20;
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
    
// Add Logo Image inside the background box
const logoWidth = 15;
const logoHeight = 15;
const logoCenterX = 28;
const logoCenterY = 12;

// Draw a white circle as background for the logo
doc.setFillColor(255, 255, 255);
doc.ellipse(logoCenterX, logoCenterY, logoWidth / 2, logoHeight / 2, 'F');

// Draw the logo image centered in the circle
doc.addImage(logo, "PNG", logoCenterX - logoWidth / 2, logoCenterY - logoHeight / 2, logoWidth, logoHeight);
    
  // Company Name centered in header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("AATHITYA CRACKERS", pageWidth/2, 16, { align: "center" });
  
  // Tagline below company name
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Premium Quality Fireworks & Sparklers", pageWidth/2, 22, { align: "center" });

 
    
    // Status badge - properly positioned
    doc.setFillColor(16, 185, 129);
    doc.rect(150, 8, 50, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
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
  
  addPageHeader();
  let yPos = 40;

  if (currentPage === 1) {
    doc.setTextColor(30, 58, 138);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Thank You for Your Order!", pageWidth/2, yPos, { align: "center" });
    yPos += 8;
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    // Use the actual orderId from the API response instead of generating one
    doc.text(`Order Date: ${new Date().toLocaleDateString('en-GB')} | Order NO: ${orderId}`, pageWidth/2, yPos, { align: "center" });
    yPos += 10;
  }
     // Customer Details Section with bold labels and proper spacing
  const customerDetailsHeight = 60;
  yPos = checkPageBreak(yPos, customerDetailsHeight);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPos, contentWidth, customerDetailsHeight, 'FD');
  doc.setFillColor(30, 58, 138);
  doc.rect(margin, yPos, contentWidth, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("CUSTOMER DETAILS", margin + 5, yPos + 6.5);
  yPos += 15;

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  
  // Name - bold label with proper spacing
  doc.setFont("helvetica", "bold");
  doc.text("Name: ", margin + 5, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(`${formData.firstName} ${formData.lastName}`, margin + 5 + doc.getTextWidth("Name: ") + 3, yPos);
  
  // Contact No - bold label with proper spacing
  doc.setFont("helvetica", "bold");
  doc.text("Contact No: ", margin + 5, yPos + 8);
  doc.setFont("helvetica", "normal");
  doc.text(formData.contactNumber, margin + 5 + doc.getTextWidth("Contact No: ") + 3, yPos + 8);
  
  // Whatsapp No - bold label with proper spacing
  doc.setFont("helvetica", "bold");
  doc.text("Whatsapp No: ", margin + 5, yPos + 16);
  doc.setFont("helvetica", "normal");
  doc.text(formData.whatsappNumber, margin + 5 + doc.getTextWidth("Whatsapp No: ") + 3, yPos + 16);

  const maxAddressWidth = contentWidth - 15;
  const addressText = `${formData.address}, ${formData.pinCode}`;
  // Address - bold label with proper spacing
  doc.setFont("helvetica", "bold");
  doc.text("Address: ", margin + 5, yPos + 24);
  doc.setFont("helvetica", "normal");
  const addressLines = doc.splitTextToSize(addressText, maxAddressWidth - doc.getTextWidth("Address: ") - 3);
  addressLines.forEach((line, index) => {
    doc.text(line, margin + 5 + doc.getTextWidth("Address: ") + 3, yPos + 24 + (index * 6));
  });

  // Email - only show if exists, with bold label and proper spacing
  if (formData.email) {
    doc.setFont("helvetica", "bold");
    doc.text("Email: ", margin + 5, yPos + 24 + (addressLines.length * 6));
    doc.setFont("helvetica", "normal");
    doc.text(formData.email, margin + 5 + doc.getTextWidth("Email: ") + 3, yPos + 24 + (addressLines.length * 6));
    yPos += Math.max(customerDetailsHeight - 10, 24 + (addressLines.length * 6) + 8);
  } else {
    yPos += Math.max(customerDetailsHeight - 10, 24 + (addressLines.length * 6));
  }
    yPos += 10;
    const itemsHeight = (cartProducts.length * 8) + 50;
    yPos = checkPageBreak(yPos, itemsHeight);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.rect(margin, yPos, contentWidth, itemsHeight, 'FD');
    doc.setFillColor(30, 58, 138);
    doc.rect(margin, yPos, contentWidth, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("ORDER SUMMARY", margin + 5, yPos + 6.5);
    yPos += 15;
  
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("PRODUCT", margin + 5, yPos);
    doc.text("QTY", 130, yPos, { align: "center" });
    doc.text("RATE", 155, yPos, { align: "center" });
    doc.text("AMOUNT", pageWidth - margin - 5, yPos, { align: "right" });
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin + 5, yPos + 2, pageWidth - margin - 5, yPos + 2);
    yPos += 6;
  
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    cartProducts.forEach((item, index) => {
      if (index % 2 === 0) {
        const rowMargin = 1;
        doc.setFillColor(252, 252, 252);
        doc.rect(margin + rowMargin, yPos - 1, contentWidth - 2 * rowMargin, 6, 'F');
      }
      doc.setTextColor(60, 60, 60);
      const maxProductNameWidth = 90;
      let itemName = item.name.length > 35 ? item.name.substring(0, 35) + '...' : item.name;
      doc.text(itemName, margin + 5, yPos + 2);
      doc.text(item.quantity.toString(), 130, yPos + 2, { align: "center" });
      doc.text(`Rs ${item.price.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 155, yPos + 2, { align: "center" });
      doc.setFont("helvetica", "bold");
      doc.text(`Rs ${item.subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, pageWidth - margin - 5, yPos + 2, { align: "right" });
      doc.setFont("helvetica", "normal");
      yPos += 6;
    });
  
    yPos += 6;
    doc.setFillColor(249, 250, 251);
    doc.rect(margin + 3, yPos - 2, contentWidth - 6, 6, 'F');
    doc.setTextColor(75, 85, 99);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Subtotal (MRP):", margin + 5, yPos + 2);
    doc.text(`Rs ${netTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, pageWidth - margin - 5, yPos + 2, { align: "right" });
    yPos += 6;
  
    doc.setFillColor(240, 253, 244);
    doc.rect(margin + 3, yPos - 2, contentWidth - 6, 6, 'F');
    doc.setTextColor(34, 197, 94);
    doc.setFont("helvetica", "bold");
    doc.text("Discount:", margin + 5, yPos + 2);
    doc.text(`- Rs ${discountTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, pageWidth - margin - 5, yPos + 2, { align: "right" });
    yPos += 8;
  
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(margin + 5, yPos - 3, pageWidth - margin - 5, yPos - 3);
    doc.setTextColor(30, 58, 138);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL AMOUNT:", margin + 5, yPos + 4);
    doc.setFontSize(12);
    doc.text(`Rs ${subTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, pageWidth - margin - 5, yPos + 4, { align: "right" });
  
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
  
  doc.text("Contact: +91-9787009888", margin, yPos + 8);
  doc.text("aathityacrackers0@gmail.com", pageWidth/2, yPos + 8, { align: "center" });
  doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, pageWidth - margin, yPos + 8, { align: "right" });
  
  // doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, pageWidth/2, yPos + 15, { align: "center" });
  
  
    // Save for user
    doc.save(`${orderId}_Adhitya Crackers_Order.pdf`);

  
    // Return blob for upload
    return doc.output('blob');
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
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ':disabled': {
    opacity: 0.7,
    cursor: 'not-allowed'
  }
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
            Welcome to Aadhitya Crackers. These Terms and Conditions govern your use of our website and services. Please read them carefully before placing an order.
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



















    // Load cart from localStorage on initial render
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCartItems(JSON.parse(savedCart));
        }
    }, []);
    useEffect(() => {
        const handleResize = (e) => {
            setIsMobile(e.matches);
        };
        
        mobileMediaQuery.addListener(handleResize);
        return () => mobileMediaQuery.removeListener(handleResize);
    }, []);
    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);


      // FIX: Sync cartProducts from cartItems (localStorage) on load and update
  useEffect(() => {
    const loadCartFromStorage = () => {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
         // Convert cart items to cartProducts format using productCategories
         const products = [];
         Object.values(parsedCart).forEach((item) => {
           let found = false;
           productCategories.forEach((category) => {
             const product = category.products.find((p) => p.id === item.id);
             if (product) {
               products.push({
                 id: product.id,
                 name: product.prodName,
                 quantity: item.quantity,
                 price: product.discountPrice,
                 originalPrice: product.prodPrice,
                 subtotal: product.discountPrice * item.quantity,
                 image: product.prodImage,
                 discountPercent: getDiscountPercent(
                   product.prodPrice,
                   product.discountPrice,
                   product.discountPercentage
                 ),
               });
               found = true;
             }
           });

            // Fallback if product not found (e.g., outdated cart)
          if (!found) {
            products.push({
              id: item.id,
              name: `Product #${item.id}`,
              quantity: item.quantity,
              price: 0,
              originalPrice: 0,
              subtotal: 0,
              image: "https://via.placeholder.com/60",
              discountPercent: 0,
            });
          }
        });
        setCartProducts(products);
      }
    };

    loadCartFromStorage();
  }, [productCategories]); // Re-sync when product data loads
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Update cartItems from URL state (if passed)
  useEffect(() => {
    if (location.state?.cartItems) {
      setCartItems(location.state.cartItems);
      localStorage.setItem('cart', JSON.stringify(location.state.cartItems));
    }
  }, [location.state]);

    // Fetch products from API
   useEffect(() => {
    const fetchProducts = async () => {
  try {
    setLoading(true);
    setError(null);

    const response = await axios.get(`${API_BASE_URL}api/Crackers/GetProductSummary?CompanyId=2`);

    if (response.data.statusCode === 200 && Array.isArray(response.data.result)) {
      const products = response.data.result;

      // 👉 Safely group by categoryName
      const grouped = products.reduce((acc, product) => {
        if (!product?.categoryName) return acc; // Skip invalid products

        const { categoryName } = product;
        if (!acc[categoryName]) {
          acc[categoryName] = []; // Initialize as array
        }

        acc[categoryName].push({
          ...product,
          quantity: '',
          prodPrice: parseFloat(product.prodPrice?.toFixed(3)) || 0,
          discountPrice: parseFloat(product.discountPrice?.toFixed(3)) || 0,
          discountPercentage: parseFloat(product.discountPercentage?.toFixed(1)) || 0,
        });
        return acc;
      }, {});

      // 👉 Convert to array of { name, products[] }
      const categoriesArray = Object.entries(grouped).map(([name, products]) => ({
        name,
        products: Array.isArray(products) ? products : [] // Ensure products is always an array
      }));

      setProductCategories(categoriesArray);
    } else {
      setError("Failed to load products.");
    }
  } catch (err) {
    console.error("Error fetching products:", err);
    setError("Error loading products. Please refresh.");
  } finally {
    setLoading(false);
  }
};
    fetchProducts();
}, []);


    
   // Handle quantity change in product list
   const handleQuantityChange = (productId, value) => {
    if (value === '') {
      setQuantities(prev => ({ ...prev, [productId]: '' }));
      setProductCategories(prev => 
        prev.map(category => ({
          ...category,
          products: category.products.map(p => 
            p.id === productId ? { ...p, quantity: '' } : p
          )
        }))
      );
      setCartItems(prev => {
        const newCart = { ...prev };
        delete newCart[productId];
        return newCart;
      });
      return;
    }
  
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return;
  
    // Update quantities state
    setQuantities(prev => ({ ...prev, [productId]: numValue }));
  
    // Update product categories
    setProductCategories(prev => 
      prev.map(category => ({
        ...category,
        products: category.products.map(p => 
          p.id === productId ? { ...p, quantity: numValue } : p
        )
      }))
    );
  
    // Update cart items
    let productDetails = null;
    for (const category of productCategories) {
      const prod = category.products.find(p => p.id === productId);
      if (prod) {
        productDetails = prod;
        break;
      }
    }
  
    if (productDetails) {
      setCartItems(prev => ({
        ...prev,
        [productId]: {
          id: productId,
          quantity: numValue,
          name: productDetails.prodName,
          price: productDetails.discountPrice,
          originalPrice: productDetails.prodPrice,
          image: productDetails.prodImage,
        },
      }));
    }
  };


    useEffect(() => {
        const loadCartItems = () => {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                setCartItems(JSON.parse(savedCart));
                
                // If there are cart items, send them to the API
                if (Object.keys(JSON.parse(savedCart)).length > 0) {
              
                }
            }
        };
        
        loadCartItems();
    }, []);

    const calculateProductTotal = (price, quantity) => {
        if (!quantity || quantity === '') return '0.00';
        const total = (price * quantity).toFixed(3); // Calculate with 3 decimal places
        return formatPrice(total); // Format with 2 decimal places
    };

    const calculateOverallTotal = () => {
        return Object.values(cartItems).reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);
    };

    const calculateOriginalTotal = () => {
        return Object.values(cartItems).reduce((sum, item) => {
            return sum + (item.originalPrice * item.quantity);
        }, 0);
    };

    const calculateTotalSavings = () => {
        const originalTotal = calculateOriginalTotal();
        const discountedTotal = calculateOverallTotal();
        return originalTotal - discountedTotal;
    };

    const calculateProductCount = () => {
        return Object.keys(cartItems).length;
    };

 
 

    const filteredCategories = searchTerm 
        ? productCategories.map(category => ({
            ...category,
            products: category.products.filter(product => 
                product.prodName.toLowerCase().includes(searchTerm.toLowerCase())
            )
        })).filter(category => category.products.length > 0)
        : productCategories;

   const formatPrice = (price) => {
    if (!price) return '0.00';
    const numValue = typeof price === 'string' ? 
        parseFloat(price.replace(/,/g, '')) : 
        price;
    return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(numValue);
};
// Replace the existing getDiscountPercent function with this:
const getDiscountPercent = (marketPrice, discountPrice, apiDiscountPercent) => {
    // Ensure inputs are valid numbers
    const validMarketPrice = typeof marketPrice === 'number' && !isNaN(marketPrice) ? marketPrice : 0;
    const validDiscountPrice = typeof discountPrice === 'number' && !isNaN(discountPrice) ? discountPrice : 0;

    // First try to calculate from the actual prices if they exist
    if (validMarketPrice > 0 && validDiscountPrice > 0) {
        const calculatedDiscount = ((validMarketPrice - validDiscountPrice) / validMarketPrice) * 100;
        // Only use the calculated discount if it makes sense (between 1% and 100%)
        if (calculatedDiscount >= 1 && calculatedDiscount <= 100) {
            return Math.round(calculatedDiscount);
        }
    }
    // Fallback to API's discount percentage if it exists and is valid
    if (
        apiDiscountPercent !== undefined &&
        apiDiscountPercent !== null &&
        apiDiscountPercent >= 1 &&
        apiDiscountPercent <= 100
    ) {
        return Math.round(apiDiscountPercent);
    }
    // Default to 0 if no valid discount can be determined
    return 0;
};
    if (loading) {
        return (
            <>
                <Header />
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading products...
                </div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div style={{ textAlign: 'center', padding: '2rem', color: '#d32f2f' }}>
                    {error}
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div style={{
                minHeight: '100vh',
                paddingBottom: '1rem',
                margin: '0'
            }}>
                {/* Hero Section */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                        position: 'relative',
                        height: '160px',
                        padding: '0',
                        margin: '0',
                        backgroundImage: `url(${quick_image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                    }}
                >
                    <div style={{
                        maxWidth: '800px',
                        padding: '0 1rem',
                        zIndex: 1
                    }}>
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            style={{
                                fontSize: '1.8rem',
                                fontWeight: '800',
                                color: '#fff',
                                marginBottom: '0.5rem',
                                textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5)'
                            }}
                        >
                            Quick Order
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            style={{
                                fontSize: '0.9rem',
                                color: 'rgba(255, 255, 255, 0.9)',
                                margin: '0 auto',
                                textShadow: '1px 1px 4px rgba(0, 0, 0, 0.3)'
                            }}
                        >
                            Premium quality Products at unbeatable prices
                        </motion.p>
                    </div>
                </motion.div>

                {/* Main Content */}
                <div style={{
                    minHeight: 'calc(100vh - 160px)',
                    padding: '0',
                    margin: '0',
                    position: 'relative'
                }}>
         
             
 
         <motion.div 
    style={{
        display: 'flex',
        flexDirection: mobileMediaQuery.matches ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: mobileMediaQuery.matches ? 'flex-start' : 'center',
        padding: '0.8rem 1rem',
        background: 'linear-gradient(135deg, rgb(6, 7, 44) 0%, rgb(16, 26, 94) 100%)',
        borderRadius: '8px',
        margin: '0.8rem',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
        gap: mobileMediaQuery.matches ? '0.8rem' : '1rem',
        position: 'sticky',
        top: '0',
        zIndex: '10'
    }}
>
    {/* Search Bar - Full width on mobile, flexible on desktop */}
    <div style={{
        position: 'relative',
        width: mobileMediaQuery.matches ? '100%' : '300px',
        minWidth: mobileMediaQuery.matches ? '100%' : '200px',
        flex: mobileMediaQuery.matches ? '0 1 auto' : '1 1 auto',
        display: 'flex',
        alignItems: 'center'
    }}>
        <FiSearch style={{
            position: 'absolute',
            left: '0.8rem',
            color: 'rgba(255,255,255,0.9)',
            fontSize: '1rem'
        }} />
        <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
                width: '100%',
                padding: '0.5rem 0.8rem 0.5rem 2.2rem',
                border: 'none',
                borderRadius: '6px',
                fontSize: 'clamp(0.8rem, 2vw, 0.85rem)',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                transition: 'all 0.3s',
                outline: 'none',
                '::placeholder': {
                    color: 'rgba(255,255,255,0.7)'
                }
            }}
        />
    </div>
    
    {/* Summary Section - Different layout for mobile vs desktop */}
    <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'clamp(0.5rem, 2vw, 1rem)',
        flexWrap: mobileMediaQuery.matches ? 'wrap' : 'nowrap',
        justifyContent: mobileMediaQuery.matches ? 'space-between' : 'flex-end',
        flex: '1 1 auto',
        width: mobileMediaQuery.matches ? '100%' : 'auto'
    }}>
        {/* Checkout Button - Full width on mobile, normal on desktop */}
        <motion.button 
            whileHover={{ scale: 1.03, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
                setShowViewCart(true);
                // Optional: Scroll to the section
                setTimeout(() => {
                    if (viewCartRef.current) {
                        const headerHeight = document.querySelector('header')?.offsetHeight || 0;
                        window.scrollTo({
                          top: viewCartRef.current.offsetTop - headerHeight - 20,
                          behavior: 'smooth',
                        });
                      }
                }, 100);
              }}
            style={{
                padding: '0.6rem clamp(0.8rem, 2vw, 1.2rem)',
                background: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
                color: 'white',
                fontWeight: '600',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                fontSize: 'clamp(0.8rem, 2vw, 0.85rem)',
                transition: 'all 0.2s',
                order: mobileMediaQuery.matches ? -1 : 0,
                width: mobileMediaQuery.matches ? '100%' : 'auto',
                justifyContent: 'center',
                marginBottom: mobileMediaQuery.matches ? '0.5rem' : '0',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
            }}
        >
            <FiShoppingCart size={15} />
            Checkout
        </motion.button>

        {/* Items Count */}
        <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            order: mobileMediaQuery.matches ? 0 : 1
        }}>
            <div style={{
                fontSize: 'clamp(0.75rem, 2vw, 0.8rem)',
                fontWeight: '500',
                color: 'rgba(255,255,255,0.9)'
            }}>Items:</div>
            <div style={{
                fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                fontWeight: '700',
                color: 'white',
                minWidth: '25px',
                textAlign: 'center'
            }}>{calculateProductCount()}</div>
        </div>
        
        {/* MRP Information */}
        <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            order: mobileMediaQuery.matches ? 1 : 2
        }}>
            <div style={{
                fontSize: 'clamp(0.75rem, 2vw, 0.8rem)',
                fontWeight: '500',
                color: 'rgba(255,255,255,0.9)'
            }}>MRP :</div>
            <div style={{
                fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                fontWeight: '700',
                color: '#ff6b6b',
                minWidth: '70px',
                textAlign: 'center',
                textDecoration: 'line-through'
            }}>₹{formatPrice(calculateOriginalTotal())}</div>
        </div>
        
        {/* Savings Info */}
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            background: 'rgba(0,0,0,0.3)',
            padding: '0.3rem 0.6rem',
            borderRadius: '4px',
            border: '1px solid rgba(255,255,255,0.1)',
            order: mobileMediaQuery.matches ? 3 : 3
        }}>
            <div style={{
                fontSize: 'clamp(0.7rem, 2vw, 0.75rem)',
                fontWeight: '600',
                color: '#00ff88',
                whiteSpace: 'nowrap'
            }}>
                Discount ₹{formatPrice(calculateTotalSavings())}
            </div>
        </div>
                       
        {/* Total Amount */}
        <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            order: mobileMediaQuery.matches ? 2 : 4
        }}>
            <div style={{
                fontSize: 'clamp(0.75rem, 2vw, 0.8rem)',
                fontWeight: '500',
                color: 'rgba(255,255,255,0.9)'
            }}>Total :</div>
            <div style={{
                fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                fontWeight: '700',
                color: 'white',
                minWidth: '70px',
                textAlign: 'center'
            }}>₹{formatPrice(calculateOverallTotal())}</div>
        </div>
    </div>
</motion.div>

                   
    
 
{/* Products Table */}
<motion.div 
    className="product-table-anchor"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5, duration: 0.5 }}
    style={{
        background: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        margin: '0 0.8rem 1rem',
        position: 'relative',
        maxHeight: 'calc(125vh - 325px)',
        display: 'flex',
        flexDirection: 'column'
    }}
>
    <div style={{ 
        overflow: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: '#2c3e50 #ecf0f1',
        flex: 1,
        '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px'
        },
        '&::-webkit-scrollbar-track': {
            background: '#ecf0f1'
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#2c3e50',
            borderRadius: '4px'
        }
    }}>
        <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: 'sans-serif',
            fontSize: isMobile ? '0.75rem' : '0.8rem',
            background: '#ffffff',
            tableLayout: 'auto'
        }}>
            {/* Table Head */}
            <thead>
                <tr style={{ 
                    background: '#3949AB',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    borderBottom: '2px solid #34495e'
                }}>
                    <th style={{
                        padding: isMobile ? '0.4rem 0.2rem' : '0.6rem 0.4rem',
                        display: isMobile ? 'none' : 'table-cell',
                        color: 'white',
                        width: isMobile ? '0%' : '5%'
                    }}>S.NO.</th>
                    
                    <th style={{
                        padding: isMobile ? '0.4rem 0.3rem' : '0.6rem 0.5rem',
                        color: 'white',
                        textAlign: 'left',
                        width: isMobile ? '28%' : '20%',
                        fontSize: isMobile ? '0.64rem' : '0.75rem'
                    }}>PRODUCT</th>
                    
                    <th style={{
                        padding: isMobile ? '0.4rem 0.1rem' : '0.6rem 0.3rem',
                        color: 'white',
                        width: isMobile ? '10%' : '8%',
                        textAlign: 'center',
                        fontSize: isMobile ? '0.64rem' : '0.75rem'
                    }}>UNIT</th>
                    
                    <th style={{
                        padding: isMobile ? '0.4rem 0.1rem' : '0.6rem 0.3rem',
                        color: 'white',
                        width: isMobile ? '10%' : '10%',
                        textAlign: 'center',
                        fontSize: isMobile ? '0.64rem' : '0.75rem'
                    }}>{isMobile ? 'MRP' : 'MRP ₹'}</th>
                    
                    <th style={{
                        padding: isMobile ? '0.4rem 0.1rem' : '0.6rem 0.3rem',
                        color: 'white',
                        width: isMobile ? '15%' : '12%',
                        textAlign: 'center',
                        fontSize: isMobile ? '0.64rem' : '0.75rem'
                    }}>{isMobile ? 'DISCOUNT' : 'DISCOUNT ₹'}</th>
                    
                    <th style={{
                        padding: isMobile ? '0.4rem 0.1rem' : '0.6rem 0.3rem',
                        color: 'white',
                        width: isMobile ? '10%' : '10%',
                        textAlign: 'center',
                        fontSize: isMobile ? '0.64rem' : '0.75rem'
                    }}>QTY</th>
                    
                    <th style={{
                        padding: isMobile ? '0.4rem 0.1rem' : '0.6rem 0.3rem',
                        color: 'white',
                        width: isMobile ? '14%' : '10%',
                        textAlign: 'center',
                        fontSize: isMobile ? '0.64rem' : '0.75rem'
                    }}>TOTAL</th>
                </tr>
            </thead>   
            <tbody>
                {filteredCategories.length > 0 ? (
                    filteredCategories.map((category, catIndex) => (
                        <React.Fragment key={`cat-${catIndex}`}>
                            {/* Category Header Row */}
                            <tr style={{
                                background: 'linear-gradient(to right, #F5F5F5, #E0E0E0)',
                                borderTop: '1px solid #E0E0E0',
                                borderBottom: '2px solid #B0B0B0',
                                top: isMobile ? '32px' : '40px',
                                zIndex: 5
                            }}>
                                <td style={{
                                    padding: isMobile ? '0.4rem 0.6rem' : '0.6rem 0.8rem',
                                    fontSize: isMobile ? '0.7rem' : '0.8rem',
                                    fontWeight: '790',
                                    color: '#FF6D00',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    textShadow: '0 1px 1px rgba(255,255,255,0.8)'
                                }} colSpan={isMobile ? "6" : "7"}>
                                    {category.name}
                                </td>
                            </tr>
                            
                            {/* Products under this category */}
                            {category.products.map((product, prodIndex) => {
                                const discountPercent = getDiscountPercent(product.prodPrice, product.discountPrice, product.discountPercentage);
                                const rowColor = prodIndex % 2 === 0 ? '#ffffff' : '#f8f9fa';
                                
                                return (
                                    <motion.tr 
                                        key={product.id}
                                        whileHover={{ 
                                            background: '#e8f4fc'
                                        }}
                                        transition={{ duration: 0.2 }}
                                        style={{
                                            background: rowColor,
                                            borderBottom: '1px solid #e0e0e0'
                                        }}
                                    >
                                        {/* S.NO - Hidden on mobile */}
                                        <td style={{
                                            padding: isMobile ? '0.4rem 0.2rem' : '0.6rem 0.3rem',
                                            fontSize: isMobile ? '0.65rem' : '0.75rem',
                                            fontWeight: '500',
                                            color: '#34495e',
                                            textAlign: 'center',
                                            display: isMobile ? 'none' : 'table-cell'
                                        }}>
                                            {prodIndex + 1}.
                                        </td>
                                        
                                        {/* PRODUCT NAME */}
                                        <td style={{
                                            padding: isMobile ? '0.4rem 0.4rem' : '0.6rem 0.5rem',
                                            fontSize: isMobile ? '0.65rem' : '0.75rem',
                                            fontWeight: '600',
                                            color: '#2c3e50',
                                            textAlign: 'left',
                                            wordBreak: 'break-word'
                                        }}>
                                            {product.prodName}
                                            {product.pieces && ` (${product.pieces} Pieces)`}
                                        </td>
                                        
                                        {/* UNIT */}
                                        <td style={{
                                            padding: isMobile ? '0.4rem 0.2rem' : '0.6rem 0.3rem',
                                            fontSize: isMobile ? '0.65rem' : '0.75rem',
                                            color: '#7f8c8d',
                                            textAlign: 'center'
                                        }}>
                                            {product.unitName || '1 Box'}
                                        </td>
                                        
                                        {/* MRP ₹ */}
                                        <td style={{
                                            padding: isMobile ? '0.4rem 0.2rem' : '0.6rem 0.3rem',
                                            fontSize: isMobile ? '0.65rem' : '0.75rem',
                                            fontWeight: '500',
                                            color: '#e74c3c',
                                            textDecoration: 'line-through',
                                            textAlign: 'center'
                                        }}>
                                            {formatPrice(product.prodPrice)}
                                        </td>
                                        
                                        {/* DISCOUNT ₹ */}
                                        <td style={{
                                            padding: isMobile ? '0.4rem 0.2rem' : '0.6rem 0.3rem',
                                            fontSize: isMobile ? '0.65rem' : '0.75rem',
                                            fontWeight: '700',
                                            color: 'grey',
                                            textAlign: 'center'
                                        }}>
                                            <div>
                                                {formatPrice(product.discountPrice)}
                                                {product.prodPrice > product.discountPrice && (
                                                    <div style={{
                                                        fontSize: '0.6rem',
                                                        color: '#27ae60',
                                                        fontWeight: '600',
                                                        marginTop: '2px'
                                                    }}>
                                                        ({discountPercent}% OFF)
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        
                                        {/* QTY */}
                                        <td style={{
                                            padding: isMobile ? '0.4rem 0.2rem' : '0.6rem 0.3rem',
                                            textAlign: 'center'
                                        }}>
                                            <motion.input 
                                                whileFocus={{ scale: 1.03 }}
                                                type="number"
                                                placeholder='QTY'
                                                min="0"
                                                value={quantities[product.id] ?? product.quantity ?? ''}
                                                onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                                style={{
                                                    width: isMobile ? '35px' : '45px',
                                                    padding: isMobile ? '0.25rem' : '0.3rem',
                                                    border: '1px solid #bdc3c7',
                                                    borderRadius: '4px',
                                                    background: '#ffffff',
                                                    color: '#2c3e50',
                                                    textAlign: 'center',
                                                    fontSize: isMobile ? '0.65rem' : '0.7rem',
                                                    fontWeight: '500',
                                                    transition: 'all 0.2s',
                                                    ':focus': {
                                                        outline: 'none',
                                                        borderColor: '#3498db',
                                                        boxShadow: '0 0 0 2px rgba(52,152,219,0.2)'
                                                    },
                                                    '::placeholder': {
                                                        color: '#95a5a6'
                                                    }
                                                }}
                                            />
                                        </td>
                                        
                                        {/* TOTAL */}
                                        <td style={{
                                            padding: isMobile ? '0.4rem 0.2rem' : '0.6rem 0.3rem',
                                            fontSize: isMobile ? '0.65rem' : '0.75rem',
                                            fontWeight: '700',
                                            color: product.quantity > 0 ? '#2c3e50' : '#95a5a6',
                                            textAlign: 'center',
                                            transition: 'all 0.3s'
                                        }}>
                                            {product.quantity ? calculateProductTotal(product.discountPrice, product.quantity) : '0.00'}
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </React.Fragment>
                    ))
                ) : (
                    <tr>
                        <td colSpan={isMobile ? "6" : "7"} style={{
                            padding: '1rem',
                            textAlign: 'center',
                            color: '#7f8c8d',
                            background: '#ffffff',
                            fontSize: '0.8rem'
                        }}>
                            No products found matching your search.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
</motion.div>
                </div>
            </div>


{/* ViewCart section */}

{showViewCart && (
            <div ref={viewCartRef} style={styles.container}>
              
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
        <li key={product.id} style={{ ...styles.productItem, position: 'relative' }}>
          {/* Improved Remove button */}
       
 {/* Look for the remove button in the cart products list */}
 <button 
  style={{
    position: 'absolute',
    right: '1px',
    top: '-4px',
    cursor: 'pointer',
    color: '#b91c1c',
    zIndex: 1,
    background: 'none',
    border: 'none',
    padding: '2px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '18px',
    height: '18px',
    fontWeight: 'bold'
  }}
  onClick={() => {
    // Remove from cartProducts
    setCartProducts(prev => prev.filter(p => p.id !== product.id));

    // Remove from cartItems
    setCartItems(prev => {
      const newCart = { ...prev };
      delete newCart[product.id];
      return newCart;
    });

    // Clear quantity from quantities state
    setQuantities(prev => {
      const newQuantities = { ...prev };
      delete newQuantities[product.id];
      return newQuantities;
    });

    // ✅ Reset the quantity in productCategories (this clears the input in the product table)
    setProductCategories(prev =>
      prev.map(category => ({
        ...category,
        products: category.products.map(p =>
          p.id === product.id ? { ...p, quantity: '' } : p
        )
      }))
    );
  }}
>
  <FiX />
</button>
          <div style={styles.productInfo}>
            <img
              src={product.image || "https://via.placeholder.com/60"}
              alt={product.name}
              style={styles.productImage}
            />
            <div style={{
              ...styles.productDetails,
              flex: isMobile ? '1 0 100%' : 1,
              marginRight: isMobile ? '20px' : '0',
              paddingRight: isMobile ? '30px' : '0' // Add padding to prevent text overlap
            }}>
              <p style={{
                ...styles.productName,
                fontSize: isMobile ? '0.7rem' : '0.8rem',
                marginBottom: isMobile ? '0.3rem' : '0.2rem',
                paddingRight: '10px' // Add padding to prevent text overlap
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
            
            {/* Desktop price display */}
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
            borderTop: isMobile ? '1px solid #f1f5f9' : 'none',
            paddingRight: isMobile ? '30px' : '0' // Add padding to prevent overlap
          }}>
            {isMobile && (
              <span style={{
                fontSize: '0.7rem',
                color: '#64748b'
              }}>Qty:</span>
            )}
            <input
              type="number"
              min="1"
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
                {/* Price Details Card */}
<div style={styles.totalRow}>
  <span style={styles.totalLabel}>Price ({cartProducts.length} item{cartProducts.length !== 1 ? 's' : ''})</span>
  <span style={styles.totalValue}>₹{formatPrice(netTotal)}</span>
</div>
<div style={styles.totalRow}>
  <span style={styles.totalLabel}>Discount</span>
  <span style={{...styles.totalValue, color:'#10B981'}}>-₹{formatPrice(discountTotal)}</span>
</div>
<div style={{ ...styles.totalRow, ...styles.grandTotal }}>
  <span>Total Amount</span>
  <span>₹{formatPrice(subTotal)}</span>
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
  onClick={() => {
    setShowViewCart(false);
    // Optional: Smooth scroll to product table
    const productTable = document.querySelector('.product-table-anchor'); // We'll add this class below
    if (productTable) {
      const headerHeight = document.querySelector('header')?.offsetHeight || 0;
      window.scrollTo({
        top: productTable.offsetTop - headerHeight - 10,
        behavior: 'smooth',
      });
    }
  }} 
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
  type="submit"
  style={styles.confirmButton}
  disabled={isSubmitting}
>
  {isSubmitting ? (
    <>
      <span style={{ marginRight: '8px' }}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 38 38"
          xmlns="http://www.w3.org/2000/svg"
          stroke="#fff"
        >
          <g fill="none" fillRule="evenodd">
            <g transform="translate(1 1)" strokeWidth="2">
              <circle strokeOpacity=".5" cx="18" cy="18" r="18" />
              <path d="M36 18c0-9.94-8.06-18-18-18">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 18 18"
                  to="360 18 18"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </path>
            </g>
          </g>
        </svg>
      </span>
      PROCESSING...
    </>
  ) : (
    "CONFIRM ORDER"
  )}
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

)}
            <Footer />

            {showRemoveConfirm && <RemoveConfirmationPopup />}
      {showCancelPopup && <CancelConfirmationPopup />}
      {showTermsPopup && <TermsPopup />}
        </>
    );
}

export default QuickPurchase; 
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import localforage from 'localforage';
import { FiShoppingCart, FiX } from 'react-icons/fi';
import API_BASE_URL from "./apiConfig";
import pro_bg from "../assets/pro_bg.jpg";
import Header from './HeaderLayouts';
import Footer from './FooterLayouts';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { jsPDF } from "jspdf";
import firecracker from "../assets/firecracker_img.webp";
import logo from "../assets/AthithyaLogo.png";
const ProductCatalog = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartItems, setCartItems] = useState({});
  const location = useLocation();
  const [cartProducts, setCartProducts] = useState([]);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const formRef = React.useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderId, setOrderId] = useState("");
  const [finalAmountToPay, setFinalAmountToPay] = useState(0);
  const [amountBelowMinimum, setAmountBelowMinimum] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [productToRemove, setProductToRemove] = useState(null);
  const [previousQuantity, setPreviousQuantity] = useState(1);
  const [showOrderCard, setShowOrderCard] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Added for processing state

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // First, update your initial quantities state to store product info:
  const [quantities, setQuantities] = useState({});
  
  // Then modify handleQuantityChange:
  const handleQuantityChange = (productId, value) => {
    // Allow empty string (when user clears the input)
    if (value === '') {
      setQuantities(prev => {
        const newQuantities = { ...prev };
        delete newQuantities[productId];
        return newQuantities;
      });
      setCartItems(prev => {
        const newCart = { ...prev };
        delete newCart[productId];
        return newCart;
      });
      return;
    }
    const numValue = parseInt(value);
    if (isNaN(numValue)) return;
    const newQuantity = Math.max(1, numValue);
    // Find the product in categories
    let productDetails = null;
    Object.keys(categories).some(categoryName => {
      const product = categories[categoryName].find(p => p.id === productId);
      if (product) {
        productDetails = product;
        return true;
      }
      return false;
    });
    if (!productDetails) return;

    setQuantities(prev => ({
      ...prev,
      [productId]: newQuantity
    }));
    
    // Add to cart automatically when quantity is set
    setCartItems(prev => ({
      ...prev,
      [productId]: {
        id: productId,
        quantity: newQuantity,
        name: productDetails.prodName,
        price: productDetails.discountPrice,
        originalPrice: productDetails.prodPrice,
        image: productDetails.prodImage
      }
    }));
  };

  // Fetch products and group by category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error state
        // Add CompanyId=2 as a default parameter
        const response = await axios.get(`${API_BASE_URL}api/Crackers/GetProductSummary?CompanyId=2`);
        if (response.data.statusCode === 200 && Array.isArray(response.data.result)) {
          const products = response.data.result;
          // Group products by categoryName
          const grouped = products.reduce((acc, product) => {
            const { categoryName } = product;
            if (!acc[categoryName]) {
              acc[categoryName] = [];
            }
            acc[categoryName].push(product);
            return acc;
          }, {});
          setCategories(grouped);
        } else {
          setError('Failed to load products or no data available.');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        if (err.response) {
          setError(`Failed to load products: ${err.response.statusText}`);
        } else if (err.request) {
          setError('No response from server. Please check your network connection.');
        } else {
          setError('An error occurred while fetching products.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Format price without currency symbol
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calculate discount percentage
  const getDiscountPercent = (marketPrice, discountPrice) => {
    if (!marketPrice || !discountPrice || marketPrice <= 0) return 0;
    const discount = ((marketPrice - discountPrice) / marketPrice) * 100;
    return Math.round(discount);
  };

  const handleViewCart = () => {
    // Convert cartItems object to array for display
    const products = Object.values(cartItems).map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      originalPrice: item.originalPrice,
      subtotal: item.price * item.quantity,
      image: item.image,
      discountPercent: item.originalPrice && item.price
        ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
        : 0,
    }));
    setCartProducts(products);
    setShowOrderCard(true);
    
    setTimeout(() => {
      const orderCardElement = document.getElementById('orderCard');
      if (orderCardElement) {
        const headerHeight = document.querySelector('header')?.offsetHeight || 0;
        const offset = orderCardElement.offsetTop - headerHeight - 20;
        window.scrollTo({
          top: offset,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  // Count of unique products in cart
  const productCount = Object.keys(cartItems).length;

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const initialProducts = [];

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
  if (!formData.firstName || !formData.contactNumber || !formData.address || 
      !formData.pinCode || !formData.city || !formData.district || !formData.state) {
    alert("Please fill all required fields.");
    return;
  }

  // First check if terms checkbox is checked
  const termsCheckbox = document.getElementById('agreeToTerms');
  if (!termsCheckbox.checked) {
    alert("Please Check the I have read and agree to the Terms and Conditions before confirming your order");
    return; // Stop execution if not checked
  }

  const contactNumber = formData.contactNumber.trim();
  const whatsappNumber = formData.whatsappNumber.trim();
  if (!contactNumber || !/^\d{10}$/.test(contactNumber)) {
    alert("Contact Number must be exactly 10 digits.");
    return;
  }
  if (!whatsappNumber || !/^\d{10}$/.test(whatsappNumber)) {
    alert("WhatsApp Number must be exactly 10 digits.");
    return;
  }

  // Prepare products array for API
  const productsPayload = cartProducts.map(item => ({
    id: item.id,
    qty: item.quantity
  }));

  // Create payload with CompanyId=2
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
    Products: productsPayload
  };

  try {
    setIsProcessing(true); // Show processing state
    
    const response = await axios.post(
      `${API_BASE_URL}api/Crackers/ConfirmOrder`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data && response.data.statusCode === 200) {
      const orderId = response.data.data?.orderId || response.data.orderId || "";
      console.log("Order ID:", orderId);
      
      // Generate PDF first
      await generateOrderPDF(orderId);
      
      // Clear all data after successful order
      setFormData({
        firstName: '',
        lastName: '',
        contactNumber: '',
        whatsappNumber: '',
        sameAsContact: false,
        address: '',
        city: '',
        district: '',
        state: '',
        pinCode: '',
        email: '',
        totalPayAmount: 0,
        orderId: '',
      });
      setCartProducts([]);
      setCartItems({});
      setQuantities({});
      localStorage.removeItem('cart');
      setShowDetailsForm(false);
      setShowOrderCard(false);
      
      alert(`✅ Success!\n${response.data.message}`);
    } else {
      alert("Order submitted, but response was unclear. Please contact support.");
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || 
                     error.response?.data?.statusDesc || 
                     "Failed to submit order. Please check your internet connection.";
    alert(`❌ Order failed: ${errorMsg}`);
  } finally {
    setIsProcessing(false); // Hide processing state
  }
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
                subtotal: 0 // Set subtotal to 0 when empty
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName || !formData.contactNumber || !formData.address || !formData.pinCode || !formData.city || !formData.district || !formData.state) {
      alert("Please fill all required fields.");
      return;
    }

    const productsPayload = cartProducts.map(item => ({
      id: item.id,
      qty: item.quantity
    }));

    const payload = {
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
      Products: productsPayload
    };

    try {
      setIsProcessing(true); // Set processing state
      
      const response = await axios.post(
        `${API_BASE_URL}api/Crackers/ConfirmOrder`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log("📦 ConfirmOrder API Response:", response.data);
      
      if (response.data && response.data.statusCode === 200) {
        // ✅ Extract OrderId correctly from the actual response
        const orderId = response.data.orderId;
        if (!orderId) {
          console.error("❌ Order ID not found in response:", response.data);
          alert("Order confirmed, but no Order ID returned. Please contact support.");
          return;
        }
        
        console.log("✅ Final Order ID to send:", orderId);
        
        // ✅ Generate PDF and get blob
        const pdfBlob = generateOrderPDF(orderId); // This saves the PDF and returns blob
        console.log("📄 Generated PDF Blob:", pdfBlob);
        
        // ✅ Prepare FormData for file upload
        const formDataToSend = new FormData();
        formDataToSend.append("Document", pdfBlob, `Order_${orderId}.pdf`);
        formDataToSend.append("CompanyId", 2);  
        formDataToSend.append("OrderId", orderId);
        
        // ✅ Log what we're sending
        console.log("📤 Sending to SendorderedDoc API:");
        console.log("OrderId:", orderId);
        console.log("Document (File):", pdfBlob);
        
        // ✅ Call SendorderedDoc API
        try {
          const docResponse = await axios.post(
            `${API_BASE_URL}api/Crackers/SendorderedDoc`,
            formDataToSend,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );
          
          if (docResponse.data.statusCode === 200) {
            console.log("✅ PDF and Order ID sent successfully");
            
            // ✅ Extract documentUrl from SendorderedDoc response
            const documentUrl = docResponse.data.data?.documentUrl;
            if (!documentUrl) {
              console.warn("⚠️ No documentUrl found in SendorderedDoc response:", docResponse.data);
              alert("Order confirmed, but document URL not available. Please contact support.");
            } else {
              console.log("✅ Retrieved documentUrl:", documentUrl);
              
              // ✅ Call SendMessage API
              try {
                const whatsappPayload = {
                  to: formData.whatsappNumber || formData.contactNumber,
                  pdfUrl: documentUrl,
                  text: `ADHITYA CRACKERS Order #${orderId}`, // Fixed company name
                  orderNumber: orderId,
                  companyName: "ADHITYA CRACKERS" // Added company name to payload
                };
                
                const whatsappResponse = await axios.post(
                  `${API_BASE_URL}api/Whatsapp/SendMessage/sendmessage`,
                  whatsappPayload,
                  {
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  }
                );
                
                if (whatsappResponse.data.statusCode === 200) {
                  console.log("✅ WhatsApp message sent successfully");
                } else {
                  console.warn("⚠️ SendMessage API non-200:", whatsappResponse.data);
                  alert("Order confirmed, but WhatsApp message not sent. Please contact support.");
                }
              } catch (whatsappError) {
                console.error("❌ Error sending WhatsApp message:", whatsappError);
                alert("Order confirmed, but failed to send WhatsApp message. Please contact support.");
              }
            }
          } else {
            console.warn("⚠️ SendorderedDoc API non-200:", docResponse.data);
            alert("Order confirmed, but document not sent. Please contact support.");
          }
        } catch (docError) {
          console.error("❌ Error sending document:", docError);
          alert("Order confirmed, but failed to send document. Please contact support.");
        }
        
        // ✅ Reset form and cart
        setFormData({
          firstName: '',
          lastName: '',
          contactNumber: '',
          whatsappNumber: '',
          sameAsContact: false,
          address: '',
          city: '',
          district: '',
          state: '',
          pinCode: '',
          email: '',
          totalPayAmount: 0,
          orderId: '',
        });
        setCartProducts([]);
        setCartItems({});
        localStorage.removeItem('cart');
        setShowDetailsForm(false);
        alert(`✅ Success!\n${response.data.message}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert("Order submitted, but response was unclear. Please contact support.");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message ||
                       error.response?.data?.statusDesc ||
                       "Failed to submit order or send document.";
      console.error("❌ Error in handleSubmit:", errorMsg, error);
      alert(`❌ Order failed: ${errorMsg}`);
    } finally {
      setIsProcessing(false); // Reset processing state
    }
  };

  useEffect(() => {
    setAmountBelowMinimum(subTotal < 3000);
  }, [subTotal]);

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '1rem',
      paddingBottom: '70px',
    },
    header: {
      fontSize: '2rem',
      color: '#1a237e',
      textAlign: 'center',
      margin: '1rem 0 2rem',
    },
    loading: {
      textAlign: 'center',
      color: '#666',
    },
    error: {
      textAlign: 'center',
      color: '#d32f2f',
    },
    noData: {
      textAlign: 'center',
      color: '#666',
    },
    categorySection: {
      marginBottom: '2.5rem',
    },
    categoryTitle: {
      fontSize: '1.5rem',
      color: '#1a237e',
      borderBottom: '2px solid #FF9800',
      paddingBottom: '0.5rem',
      marginBottom: '1.5rem',
    },
    productGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '1rem',
    },
    productCard: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1rem',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.2s ease',
      ':hover': {
        transform: 'translateY(-3px)',
        boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
      },
    },
    productName: {
      fontSize: '1rem',
      fontWeight: '600',
      margin: '0 0 0.5rem',
      color: '#333',
    },
    productImage: {
      width: '100%',
      height: '100px',
      objectFit: 'contain',
      marginBottom: '0.5rem',
      backgroundColor: '#f5f5f5',
      borderRadius: '4px',
    },
    placeholderImage: {
      width: '100%',
      height: '120px',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#999',
      borderRadius: '4px',
      marginBottom: '0.5rem',
      display: 'none',
    },
    priceContainer: {
      margin: '0.5rem 0',
    },
    priceRow: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '0.2rem',
    },
    priceLabel: {
      fontSize: '0.85rem',
      color: '#666',
      marginRight: '0.3rem',
    },
    marketPrice: {
      fontSize: '0.85rem',
      color: '#666',
      textDecoration: 'line-through',
    },
    discountPrice: {
      fontSize: '1rem',
      color: '#FF9800',
      fontWeight: 'bold',
      marginRight: '0.3rem',
    },
    discountPercentage: {
      fontSize: '0.7rem',
      fontWeight: 'bold',
      color: '#4CAF50',
    },
    unitInfo: {
      fontSize: '0.8rem',
      color: '#666',
      margin: '0.1rem 0',
    },
    actionContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: 'auto',
      paddingTop: '0.5rem',
      width: '100%',
    },
    quantityInput: {
      width: '30%',
      padding: '0.3rem',
      border: '1px solid #ddd',
      borderRadius: '4px',
      textAlign: 'center',
      margin: '0 auto',
    },
    cartSummaryContainer: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#1a237e',
      padding: '0.8rem 1rem',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.2)',
      zIndex: 1000,
    },
    cartSummaryContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    cartIconContainer: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    },
    cartIcon: {
      fontSize: '1.5rem',
      color: 'white',
    },
    cartBadge: {
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      backgroundColor: '#FF9800',
      color: 'white',
      borderRadius: '50%',
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.7rem',
      fontWeight: 'bold',
    },
    viewCartButton: {
      padding: '0.6rem 1.2rem',
      backgroundColor: '#FF9800',
      color: 'white',
      textDecoration: 'none',
      borderRadius: '4px',
      fontWeight: 'bold',
      transition: 'all 0.2s',
      ':hover': {
        backgroundColor: '#F57C00',
      },
    },
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
      minHeight: '400px',
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
    },
    // Processing overlay style
  //   processingOverlay: {
  //     position: 'fixed',
  //     top: 0,
  //     left: 0,
  //     right: 0,
  //     bottom: 0,
  //     backgroundColor: 'rgba(0,0,0,0.5)',
  //     display: 'flex',
  //     alignItems: 'center',
  //     justifyContent: 'center',
  //     zIndex: 2000,
  //   },
  //   processingContent: {
  //     backgroundColor: 'white',
  //     padding: '2rem',
  //     borderRadius: '0.5rem',
  //     display: 'flex',
  //     flexDirection: 'column',
  //     alignItems: 'center',
  //     boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  //   },
  //   processingText: {
  //     marginTop: '1rem',
  //     fontSize: '1.1rem',
  //     color: '#1e293b',
  //   }
   };

  const generateOrderPDF = async (orderId) => {
    if (!orderId) return;
    const doc = new jsPDF();
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = pageWidth - (2 * margin);
    let currentPage = 1;

    // Function to check if we need a new page
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
      
      // Company Name centered in header - Fixed to ADHITYA CRACKERS
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("ADHITYA CRACKERS", pageWidth/2, 16, { align: "center" });
      
      // Tagline below company name
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("Premium Quality Fireworks & Sparklers", pageWidth/2, 22, { align: "center" });
      
      // Status badge - larger and more prominent
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
      doc.text(`Order Date: ${new Date().toLocaleDateString('en-GB')} | Order No-${orderId}`, pageWidth/2, yPos, { align: "center" });
      yPos += 10;
    }

    // Customer Details Section - Enhanced with bold labels and proper spacing
    const customerDetailsHeight = 60;
    yPos = checkPageBreak(yPos, customerDetailsHeight);
    
    // Section box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.rect(margin, yPos, contentWidth, customerDetailsHeight, 'FD');
    
    // Section header
    doc.setFillColor(30, 58, 138);
    doc.rect(margin, yPos, contentWidth, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("CUSTOMER DETAILS", margin + 5, yPos + 6.5);
    
    // Customer info with bold labels and proper spacing
    yPos += 15;
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    
    // Name - bold label with spacing
    doc.setFont("helvetica", "bold");
    doc.text("Name: ", margin + 5, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(`${formData.firstName} ${formData.lastName}`, margin + 5 + doc.getTextWidth("Name: ") + 3, yPos);
    
    // Contact No - bold label with spacing
    doc.setFont("helvetica", "bold");
    doc.text("Contact No: ", margin + 5, yPos + 8);
    doc.setFont("helvetica", "normal");
    doc.text(formData.contactNumber, margin + 5 + doc.getTextWidth("Contact No: ") + 3, yPos + 8);
    
    // Whatsapp No - bold label with spacing
    doc.setFont("helvetica", "bold");
    doc.text("Whatsapp No: ", margin + 5, yPos + 16);
    doc.setFont("helvetica", "normal");
    doc.text(formData.whatsappNumber, margin + 5 + doc.getTextWidth("Whatsapp No: ") + 3, yPos + 16);
    
    // Address - bold label with multi-line support
    const maxAddressWidth = contentWidth - 15;
    const addressText = `${formData.address}, ${formData.pinCode}`;
    doc.setFont("helvetica", "bold");
    doc.text("Address: ", margin + 5, yPos + 24);
    doc.setFont("helvetica", "normal");
    const addressLines = doc.splitTextToSize(addressText, maxAddressWidth - doc.getTextWidth("Address: ") - 3);
    addressLines.forEach((line, index) => {
      doc.text(line, margin + 5 + doc.getTextWidth("Address: ") + 3, yPos + 24 + (index * 6));
    });
    
    // Email - only show if exists, with bold label
    if (formData.email) {
      doc.setFont("helvetica", "bold");
      doc.text("Email: ", margin + 5, yPos + 24 + (addressLines.length * 6));
      doc.setFont("helvetica", "normal");
      doc.text(formData.email, margin + 5 + doc.getTextWidth("Email: ") + 3, yPos + 24 + (addressLines.length * 6));
      yPos += Math.max(customerDetailsHeight - 10, 24 + (addressLines.length * 6) + 8);
    } else {
      yPos += Math.max(customerDetailsHeight - 10, 24 + (addressLines.length * 6));
    }

    // Order Items Section
    yPos += 10;
    const itemsHeight = (cartProducts.length * 8) + 50;
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
    doc.text("ORDER SUMMARY", margin + 5, yPos + 6.5);
    
    // Table headers
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

    // Summary lines
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
    doc.text("Contact: +91-98421-55255", margin, yPos + 8);
    doc.text("aathityacrackers0@gmail.com", pageWidth/2, yPos + 8, { align: "center" });
    doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, pageWidth - margin, yPos + 8, { align: "right" });

    // Save PDF locally
    doc.save(`${orderId}_Adhitya_Crackers_Order.pdf`);
    const pdfBlob = doc.output('blob');
    
    try {
      // Create FormData for upload
      const formDataToSend = new FormData();
      formDataToSend.append("OrderId", orderId);
      formDataToSend.append("Document", pdfBlob, `Order_${orderId}.pdf`);
      formDataToSend.append("CompanyId", 2);
      
      // Upload PDF
      const uploadRes = await axios.post(
        `${API_BASE_URL}api/Crackers/SendorderedDoc`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      if (uploadRes.data.statusCode === 200) {
        const documentUrl = uploadRes.data.data?.documentUrl;
        if (!documentUrl) {
          console.warn("No document URL returned from API");
          throw new Error("No document URL returned");
        }
        
        // Send WhatsApp message
        try {
          const whatsappPayload = {
            to: formData.whatsappNumber || formData.contactNumber,
            pdfUrl: documentUrl,
            text: `ADHITYA CRACKERS Order #${orderId}`, // Fixed company name
            orderNumber: orderId,
            companyName: "ADHITYA CRACKERS" // Added company name to payload
          };
          
          const whatsappResponse = await axios.post(
            `${API_BASE_URL}api/Whatsapp/SendMessage/sendmessage`,
            whatsappPayload,
            {
              headers: { 'Content-Type': 'application/json' },
            }
          );
          
          if (whatsappResponse.data.statusCode === 200) {
            console.log("WhatsApp message sent successfully");
          } else {
            console.warn("Failed to send WhatsApp:", whatsappResponse.data);
          }
        } catch (whatsappError) {
          console.error("Error sending WhatsApp:", whatsappError);
        }
        
        return uploadRes.data;
      } else {
        throw new Error(uploadRes.data.statusDesc || "Upload failed");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.statusDesc || err.message || "Failed to upload PDF.";
      console.error("Error in generateOrderPDF:", errorMsg, err);
      throw new Error(errorMsg);
    }
  };

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

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

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
            Welcome to Adhitya Crackers. These Terms and Conditions govern your use of our website and services. Please read them carefully before placing an order.
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
            id="agreeToTerms"
            name="agreeToTerms"
            required
            style={{
              ...styles.formCheckbox,
              accentColor: '#1a237e'
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

  // Processing Overlay Component
  const ProcessingOverlay = () => (
    <div style={styles.processingOverlay}>
      <div style={styles.processingContent}>
        <div className="spinner" style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #2F3E9E',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}></div>
        <div style={styles.processingText}>Processing your order...</div>
      </div>
    </div>
  );

  return (
    <>
      <Header />
      {!showOrderCard && (
        <div style={styles.container}>
          <div style={pageTitleContainerStyle}>
            <h1 style={pageTitleStyle}>Purchase Order</h1>
          </div>
          {loading && <p style={styles.loading}>Loading products...</p>}
          {error && <p style={styles.error}>{error}</p>}
          {!loading && !error && Object.keys(categories).length === 0 && (
            <p style={styles.noData}>No products found.</p>
          )}
          
          {/* Render each category */}
          {Object.keys(categories).map((categoryName) => (
            <div key={categoryName} style={styles.categorySection}>
              <h2 style={styles.categoryTitle}>{categoryName.toUpperCase()}</h2>
              <div style={styles.productGrid}>
                {categories[categoryName].map((product) => {
                  const marketPrice = product.prodPrice || 0;
                  const discountPrice = product.discountPrice || 0;
                  const discountPercent = getDiscountPercent(marketPrice, discountPrice);
                  const quantity = quantities[product.id] || '';
                  return (
                    <div key={product.id} style={styles.productCard}>
                      {/* Product Name with Pieces */}
                      <h3 style={styles.productName}>
                        {product.prodName} {product.pieces ? `(${product.pieces} Pieces)` : ''}
                      </h3>
                      
                      {/* Image */}
                      {product.prodImage?.trim() ? (
                        <img
                          src={product.prodImage.trim()}
                          alt={product.prodName}
                          style={styles.productImage}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                      ) : (
                        <div style={styles.placeholderImage}>No Image</div>
                      )}
                      
                      {/* Price Information */}
                      <div style={styles.priceContainer}>
                        <div style={styles.priceRow}>
                          <span style={styles.priceLabel}>Market Price:</span>
                          <span style={styles.marketPrice}>₹{formatPrice(marketPrice)}</span>
                        </div>
                        <div style={styles.priceRow}>
                          <span style={styles.priceLabel}>Discount Price:</span>
                          <span style={styles.discountPrice}>₹{formatPrice(discountPrice)}</span>
                          <span style={styles.discountPercentage}>({discountPercent}% OFF)</span>
                        </div>
                      </div>
                      
                      {/* Unit Info & Quantity Input in Same Row */}
                      <div style={{ ...styles.actionContainer, display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={styles.unitInfo}>
                          Unit: <strong>{product.unitName || "Unit"}</strong>
                        </div>
                        <input
                          type="number"
                          value={quantities[product.id] ?? ''}
                          min="1"
                          placeholder="Qty"
                          onChange={(e) => handleQuantityChange(product.id, e.target.value, product)}
                          style={styles.quantityInput}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          
          {/* Cart Summary */}
          {productCount > 0 && !showOrderCard && (
            <div style={styles.cartSummaryContainer}>
              <div style={styles.cartSummaryContent}>
                <div style={styles.cartIconContainer}>
                  <FiShoppingCart style={styles.cartIcon} />
                  <span style={styles.cartBadge}>{productCount}</span>
                </div>
                <button onClick={handleViewCart} style={viewCartButtonStyle}>
                  View Cart ({productCount} items)
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {showOrderCard && (
        <div style={styles.container}>
          <div style={styles.wrapper}>
            <div style={styles.orderCard} id="orderCard">
              {/* Left Card - Order Items */}
              <div style={{ ...styles.card, flex: isMobile ? 1 : 3 }}>
                <div style={styles.cardHeader}>
                  <h2 style={styles.cardTitle}>Your Order</h2>
                </div>
                <div style={styles.cardBody}>
                  <ul style={styles.productList}>
                    {cartProducts.map((product) => (
                      <li key={product.id} style={{ ...styles.productItem, position: 'relative' }}>
                        {/* Add the X button at top right */}
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
                            // Remove from cart products
                            setCartProducts(prevProducts =>
                              prevProducts.filter(p => p.id !== product.id)
                            );
                            // Remove from cart items
                            setCartItems(prev => {
                              const newCart = { ...prev };
                              delete newCart[product.id];
                              return newCart;
                            });
                            // Clear the quantity input
                            setQuantities(prev => {
                              const newQuantities = { ...prev };
                              delete newQuantities[product.id];
                              return newQuantities;
                            });
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
                            value={product.quantity}
                            onChange={(e) => updateQuantity(product.id, e.target.value)}
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
                              ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                <div style={{...styles.totalsSection, display: 'flex', flexDirection: 'column', height: '80%', justifyContent: 'space-between'}}>
                  <div style={styles.totalRow}>
                    <span style={styles.totalLabel}>Price ({cartProducts.length} item{cartProducts.length !== 1 ? 's' : ''})</span>
                    <span style={styles.totalValue}>₹{netTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div style={styles.totalRow}>
                    <span style={styles.totalLabel}>Discount</span>
                    <span style={{...styles.totalValue, color:'#10B981'}}>
                      -₹{discountTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div style={{ ...styles.totalRow, ...styles.grandTotal }}>
                    <span>Total Amount</span>
                    <span>₹{subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
                    textAlign: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem',
                    gap: isMobile ? '0.5rem' : '0',
                    marginTop: 'auto',
                  }}>
                    <button 
                      style={styles.proceedButton}
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
                        setShowOrderCard(false); // Hide order card (go back)
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
                        type="button" 
                        style={styles.confirmButton}
                        onClick={handleConfirmOrder}
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'PROCESSING...' : 'CONFIRM ORDER'}
                      </button>
                        <button
                          type="button"
                          style={styles.cancelButton}
                          onClick={() => setShowCancelPopup(true)}
                          disabled={isProcessing} // Disable during processing
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
      
      {showRemoveConfirm && <RemoveConfirmationPopup />}
      {showCancelPopup && <CancelConfirmationPopup />}
      {showTermsPopup && <TermsPopup />}
      {/* {isProcessing && <ProcessingOverlay />} */}
      <Footer />
    </>
  );
};

const viewCartButtonStyle = {
  padding: '0.7rem 1.5rem',
  backgroundColor: '#FF9800',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '5px',
  fontWeight: 'bold',
  transition: 'all 0.3s ease',
  border: 'none',
  cursor: 'pointer',
  ':hover': {
    backgroundColor: '#F57C00',
    transform: 'translateY(-2px)'
  }
};

const pageTitleContainerStyle = {
  backgroundImage: `url(${pro_bg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  padding: '2rem',
  borderRadius: '8px',
  marginBottom: '2rem'
};

const pageTitleStyle = {
  fontSize: '2rem',
  color: '#fff',
  textAlign: 'center',
  marginBottom: '2rem',
};

export default ProductCatalog;
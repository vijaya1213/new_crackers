import React, { useState, useEffect } from "react";
import Layout from "./AdminLayouts";
import { FiEye, FiFileText, FiTruck,FiPrinter } from "react-icons/fi";
import { 
  FaCreditCard, 
  FaMoneyBillAlt,
  FaRupeeSign,
  FaDollarSign,
  FaCashRegister,
  FaWallet 
} from 'react-icons/fa';
import axios from "axios";
import localforage from "localforage";
import API_BASE_URL from "./apiConfig";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const AdminOrder = () => {
  // State variables
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState("");
  const [paymentGateway, setPaymentGateway] = useState("");
  const [refNo, setRefNo] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [selectedStatusId, setSelectedStatusId] = useState(0); // 0 for All Orders
  const [viewMode, setViewMode] = useState("details"); // 'payment', 'details', or 'dispatch'
  const [deliveryMethod, setDeliveryMethod] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [lrNumber,setLrNumber]=useState("");
  const [lrDate,setLrDate]= useState("");
  const [dispatchAmount, setDispatchAmount] = useState("");

  // Fetch order statuses on component mount
  useEffect(() => {
  const fetchOrderStatuses = async () => {
  try {
    const token = await localforage.getItem('jwtToken');
    const companyId = 2; // hardcoded for now

    const response = await axios.get(
      `${API_BASE_URL}api/Crackers/GetOrderStatusList`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          companyId: companyId
        }
      }
    );

    if (response.data.statusCode === 200) {
      setOrderStatuses(response.data.result);
    }
  } catch (error) {
    console.error("Error fetching order statuses:", error);
  }
};


    fetchOrderStatuses();
  }, []);

  // Fetch orders based on selected status

const fetchOrders = async () => {
  try {
    setLoading(true);
    const token = await localforage.getItem('jwtToken');

    // ✅ Added companyId=2 to query parameters
    const url = `${API_BASE_URL}api/Crackers/GetOrdersByStatus?Id=${selectedStatusId}&companyId=2`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.data.statusCode === 200) {
      setOrders(response.data.result);
    } else {
      alert("Failed to fetch orders: " + response.data.statusDesc);
      setOrders([]);
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    alert("Failed to fetch orders. Please try again.");
    setOrders([]);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchOrders();
}, [selectedStatusId]);

  const openModal = (order, mode = "details") => {
    setSelectedOrder(order);
    setViewMode(mode);
    
    // Set appropriate view mode based on order status
    if (order.orderStatusID === 10) { // Ready for Payment
      setViewMode("payment");
      setPaymentMode(order.paymentMode || "");
      setRefNo(order.transactionId || "");
      setPaymentDate(order.paymentDate ? order.paymentDate.split("T")[0] : new Date().toISOString().split("T")[0]);
      setPaymentAmount(order.totalAmount || "");
      setPaymentGateway("");
    } 
    else if (order.orderStatusID === 11) { // Ready for Dispatch
      setViewMode("dispatch");
      setDeliveryMethod(order.deliveryMethod || "");
      setDeliveryDate(order.deliveryDate ? order.deliveryDate.split("T")[0] : new Date().toISOString().split("T")[0]);
      setDeliveryNote(order.deliveryNote || "");
    }
    else {
      setViewMode("details");
    }
    
    setIsModalOpen(true);
  };
  
const generateNewPDF = async (order) => {
  try {
    const token = await localforage.getItem("jwtToken");

    // Fetch full order details
    const detailsResponse = await axios.get(
      `${API_BASE_URL}api/Crackers/GetOrderDetailsByOrderId?OrderId=${order.orderId}&CompanyId=2`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (detailsResponse.data.statusCode !== 200) {
      throw new Error("Failed to fetch order details");
    }

    const apiData = detailsResponse.data;
    const orderDetails = {
      ...apiData.orderHeader,
      items: Array.isArray(apiData.orderLines)
        ? apiData.orderLines.map(line => ({
            productName: line.productName || 'Unknown Product',
            qty: line.qty || 0,
            discountedPrice: line.discountedPrice || 0,
            totalPrice: (line.discountedPrice * line.qty).toFixed(2)
          }))
        : [],
      subTotal: apiData.totals?.totalProductAmount || 0,
      totalDiscount: apiData.totals?.totalDiscountAmount || 0,
      deliveryCharge: apiData.orderHeader?.dispatchAmnt || 0,
      totalAmount: apiData.orderHeader?.payableAmount || 0
    };

    if (!orderDetails.items.length) {
      alert("No items found in this order.");
      return;
    }

    const currentDate = orderDetails.orderDate
      ? new Date(orderDetails.orderDate).toLocaleDateString("en-IN")
      : new Date().toLocaleDateString("en-IN");

    const customerName = `${orderDetails.firstName || "Customer"} ${orderDetails.lastName || ""}`.trim();

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Popup blocked! Please allow popups for this site.");
      return;
    }

    // Write HTML content to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${orderDetails.orderId}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .invoice-container { max-width: 800px; margin: 0 auto; border: 1px solid #ccc; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .company-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .company-address { margin-bottom: 15px; }
          .invoice-title { font-size: 20px; font-weight: bold; text-align: center; margin: 20px 0; 
                           border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 10px 0; }
          .invoice-info { display: flex; justify-content: space-between; margin-bottom: 15px; }
          .customer-info { margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background-color: #f0f0f0; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .totals { margin-left: auto; width: 300px; }
          .footer { text-align: center; margin-top: 30px; }
          .print-button { 
            position: fixed; 
            bottom: 20px; 
            right: 20px; 
            padding: 10px 20px; 
            background-color: #042d88; 
            color: white; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer; 
            z-index: 1000;
          }
          @media print {
            .print-button { display: none; }
            body { padding: 0; }
            .invoice-container { border: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <!-- Company Header -->
          <div class="header">
            <div class="company-name">Porunai Crackers</div>
            <div class="company-address">
              1/410, Four Lane Road, Near Rettiarpatti Hill,<br>
              Tirunelveli - 627007<br>
              Cell: 84380 24255, 98421 55255
            </div>
            <div>GSTIN: 33AQUPM3467F1ZI</div>
          </div>

          <!-- Title -->
          <div class="invoice-title">CASH BILL</div>

          <!-- Invoice Info -->
          <div class="invoice-info">
            <div>
              <strong>Invoice No:</strong> ${orderDetails.orderId}<br>
              <strong>Date:</strong> ${currentDate}
            </div>
          </div>

          <!-- Customer Address -->
          <div class="customer-info">
            <strong>To:</strong><br>
            ${customerName}<br>
            ${orderDetails.address ? orderDetails.address + '<br>' : ''}
            ${orderDetails.city || ''} ${orderDetails.pinCode || ''}<br>
            ${orderDetails.state || ''}, ${orderDetails.country || ''}<br>
            ${orderDetails.phoneNumber ? 'Phone: ' + orderDetails.phoneNumber : ''}
          </div>

          <!-- Items Table -->
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Product</th>
                <th class="text-center">Qty</th>
                <th class="text-right">Rate</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${orderDetails.items.map((item, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${item.productName}</td>
                  <td class="text-center">${item.qty}</td>
                  <td class="text-right">₹${item.discountedPrice.toFixed(2)}</td>
                  <td class="text-right">₹${item.totalPrice}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Totals -->
          <div class="totals">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span>Subtotal:</span>
              <span>₹${orderDetails.subTotal?.toFixed(2)}</span>
            </div>
            ${orderDetails.totalDiscount > 0 ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>Discount:</span>
                <span>₹${orderDetails.totalDiscount.toFixed(2)}</span>
              </div>
            ` : ''}
            ${orderDetails.deliveryCharge > 0 ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>Delivery Charge:</span>
                <span>₹${orderDetails.deliveryCharge.toFixed(2)}</span>
              </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 8px; border-top: 1px solid #000; padding-top: 5px;">
              <span>Total Amount:</span>
              <span>₹${orderDetails.totalAmount?.toFixed(2)}</span>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>Thank you for your purchase!</p>
            <p><strong>For Porunai Crackers</strong></p>
          </div>
        </div>

        <button class="print-button" onclick="window.print()">Print Invoice</button>
      </body>
      </html>
    `);

    printWindow.document.close();

  } catch (error) {
    console.error("Failed to generate invoice:", error);
    alert("Could not generate invoice. Please try again.");
  }
};
// Helper function to generate PDF blob only (no download)
const generateInvoiceBlobOnly = async (order, invoiceNo) => {
  return new Promise((resolve, reject) => {
    const pdfContent = document.createElement("div");
    pdfContent.style.position = "absolute";
    pdfContent.style.left = "-9999px";
    pdfContent.style.width = "80mm";
    pdfContent.style.padding = "10px";
    pdfContent.style.fontFamily = "Arial, sans-serif";
    pdfContent.style.backgroundColor = "white";

    const customerName = `${order.firstName || ''} ${order.lastName || ''}`.trim() || 'N/A';
    const currentDate = new Date().toLocaleDateString("en-IN");

    pdfContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 5px;">
        <div style="font-size: 10px;">GST: 33AQUPM3467F1ZI</div>
      </div>
      <div style="text-align: center; font-weight: bold; margin: 10px 0; border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 5px 0; font-size: 14px;">
        CASH BILL
      </div>
      <div style="font-size: 10px; margin-bottom: 8px;">
        <div><b>Invoice No:</b> ${invoiceNo}</div>
        <div><b>Date:</b> ${currentDate}</div>
      </div>
      <div style="margin-bottom: 8px; border: 1px dashed #ccc; padding: 4px; font-size: 10px;">
        <div><b>To:</b></div>
        <div>${customerName}</div>
        ${order.address ? `<div>${order.address}</div>` : ''}
        <div>${order.city || ''} ${order.pinCode || ''}</div>
        <div>${order.state || ''}, ${order.country || ''}</div>
        ${order.phoneNumber ? `<div>Phone: ${order.phoneNumber}</div>` : ''}
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 8px;">
        <thead>
          <tr>
            <th style="text-align: left; border-bottom: 1px solid #000; padding: 2px 0;">S.No</th>
            <th style="text-align: left; border-bottom: 1px solid #000; padding: 2px 0;">Items</th>
            <th style="text-align: center; border-bottom: 1px solid #000; padding: 2px 0;">QTY</th>
            <th style="text-align: right; border-bottom: 1px solid #000; padding: 2px 0;">Rate</th>
            <th style="text-align: right; border-bottom: 1px solid #000; padding: 2px 0;">Amt</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map((item, i) => `
            <tr>
              <td style="padding: 2px 0;">${i + 1}</td>
              <td style="padding: 2px 0;">${item.productName}</td>
              <td style="text-align: center; padding: 2px 0;">${item.qty}</td>
              <td style="text-align: right; padding: 2px 0;">₹${item.discountedPrice.toFixed(2)}</td>
              <td style="text-align: right; padding: 2px 0;">₹${(item.discountedPrice * item.qty).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div style="border-top: 1px dashed #000; padding-top: 5px; font-size: 10px;">
        <div style="display: flex; justify-content: space-between;">
          <span>Subtotal:</span>
          <span>₹${order.subTotal?.toFixed(2)}</span>
        </div>
        ${order.totalDiscount > 0 ? `
          <div style="display: flex; justify-content: space-between;">
            <span>Discount:</span>
            <span>₹${order.totalDiscount.toFixed(2)}</span>
          </div>
        ` : ''}
        ${order.deliveryCharge > 0 ? `
          <div style="display: flex; justify-content: space-between;">
            <span>Delivery:</span>
            <span>₹${order.deliveryCharge.toFixed(2)}</span>
          </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; font-weight: bold;">
          <span>Total:</span>
          <span>₹${order.totalAmount?.toFixed(2)}</span>
        </div>
      </div>
      <div style="text-align: center; margin-top: 8px; font-size: 9px;">
        For Porunai Crackers
      </div>
    `;

    document.body.appendChild(pdfContent);

    html2canvas(pdfContent, { scale: 2, useCORS: true })
      .then((canvas) => {
        const imgWidth = 80;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: [80, imgHeight + 10],
        });
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
        const pdfBlob = pdf.output('blob');
        document.body.removeChild(pdfContent);
        resolve(pdfBlob);
      })
      .catch((err) => {
        document.body.removeChild(pdfContent);
        reject(err);
      });
  });
};
const handleUpdatePayment = async () => {
  if (!paymentMode) {
    alert("Please select a payment method.");
    return;
  }

  const payload = {
    OrderID: selectedOrder.orderId,
    PaidAmount: parseFloat(paymentAmount) || 0,
    PaymentMethod: paymentMode,
    ReferenceNumber: refNo || null,
    PaymentDate: paymentDate
      ? new Date(paymentDate).toISOString().split("T")[0] + "T00:00:00"
      : null,
    CompanyId: 2
  };

  try {
    const token = await localforage.getItem("jwtToken");

    // Step 1: Update Payment
    const response = await axios.post(
      `${API_BASE_URL}api/Crackers/AddOrderPayment`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.statusCode !== 200) {
      alert(`Payment update failed: ${response.data.statusDesc || "Unknown error"}`);
      return;
    }

    const invoiceNo = response.data.invoiceNo || response.data.result?.invoiceNo;
    if (!invoiceNo) {
      alert("Payment successful, but no invoice number returned.");
      return;
    }

    // ✅ Step 2: Close Modal
    setIsModalOpen(false);

    // 🔁 Step 3: Fetch FULL order details (with items)
    const detailsResponse = await axios.get(
      `${API_BASE_URL}api/Crackers/GetOrderDetailsByOrderId?OrderId=${selectedOrder.orderId}&CompanyId=2`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (detailsResponse.data.statusCode !== 200) {
      throw new Error("Failed to fetch order details");
    }

    const apiData = detailsResponse.data;
    const orderDetails = {
      ...apiData.orderHeader,
      items: Array.isArray(apiData.orderLines)
        ? apiData.orderLines.map((line) => ({
            productName: line.productName || "Unknown Product",
            qty: line.qty || 0,
            discountedPrice: line.discountedPrice || 0,
          }))
        : [],
      subTotal: apiData.totals?.totalProductAmount || 0,
      totalDiscount: apiData.totals?.totalDiscountAmount || 0,
      deliveryCharge: apiData.orderHeader?.dispatchAmnt || 0,
      totalAmount: apiData.orderHeader?.payableAmount || 0,
    };

    // ✅ Step 4: Ask user before sending invoice
    const sendInvoice = window.confirm(
      "Do you want to send the invoice to the customer via WhatsApp?"
    );

    if (!sendInvoice) {
      alert("Payment updated successfully. Invoice was not sent.");
      await fetchOrders(); // Refresh order list
      return;
    }

    // ✅ Step 5: Generate PDF Blob (No Download)
    const pdfBlob = await generateInvoiceBlobOnly(orderDetails, invoiceNo);

    // ✅ Step 6: Upload PDF to SendInvoiceDoc API
    const formData = new FormData();
    formData.append("InvoiceNo", invoiceNo);
    formData.append("CompanyId", 2);
    formData.append("Document", pdfBlob, `Invoice_${invoiceNo}.pdf`);

    try {
      const uploadResponse = await axios.post(
        `${API_BASE_URL}api/Crackers/SendInvoiceDoc`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // ✅ Step 7: Get invoice URL (from response or fallback)
      const invoiceUrl =
        uploadResponse.data?.Data?.InvoiceUrl ||
        `https://vivifysoft.in/FireCrack/pdf/Adhitya/Invoice/${invoiceNo}.pdf`;

      // ✅ Step 8: Send WhatsApp message
      const customerName = `${selectedOrder.firstName || ""} ${
        selectedOrder.lastName || ""
      }`.trim() || "Customer";

      const whatsappPayload = {
        to: selectedOrder.phoneNumber?.startsWith("91")
          ? selectedOrder.phoneNumber
          : `91${selectedOrder.phoneNumber}`,
        CusName: customerName,
        orderNumber: selectedOrder.orderId,
        companyName: "ADHITYA CRACKERS",
        invoiceUrl: invoiceUrl,
      };

      await axios.post(`${API_BASE_URL}api/Whatsapp/SendPayment`, whatsappPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      alert("✅ Payment successful! Invoice sent via WhatsApp.");
    } catch (uploadError) {
      console.error("Failed to upload invoice:", uploadError);
      alert("Payment successful but failed to send invoice. Please try sending manually.");
    }

    await fetchOrders(); // Refresh order list

  } catch (error) {
    console.error("🚨 Payment update failed:", error);
    alert("Error: " + (error.message || "Failed to process payment"));
  }
};

// Helper function to generate and download invoice
const generateAndDownloadInvoice = async (order, invoiceNo) => {
  return new Promise((resolve) => {
    const pdfContent = document.createElement("div");
    pdfContent.style.position = "absolute";
    pdfContent.style.left = "-9999px";
    pdfContent.style.width = "80mm";
    pdfContent.style.padding = "10px";
    pdfContent.style.background = "white";
    pdfContent.style.fontFamily = "Arial, sans-serif";

    const currentDate = order.orderDate
      ? formatDate(order.orderDate)
      : new Date().toLocaleDateString('en-IN');

    const customerName = `${order.firstName || 'Customer'} ${order.lastName || ''}`.trim();

    pdfContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 5px;">
        <div style="font-size: 10px;">GST: 33AQUPM3467F1ZI</div>
      </div>
      <div style="text-align: center; font-weight: bold; margin: 10px 0; border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 5px 0; font-size: 14px;">
        CASH BILL
      </div>
      <div style="text-align: center; margin-bottom: 10px; font-size: 11px;">
        Porunai Crackers<br>
        1/410, Four Lane Road, Near Rettiarpatti Hill,<br>
        Tirunelveli - 627007<br>
        Cell: 84380 24255, 98421 55255
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 11px;">
        <div>Invoice No: ${invoiceNo}</div>
        <div>Date: ${currentDate}</div>
      </div>
      <div style="margin-bottom: 10px; border: 1px dashed #ccc; padding: 5px; font-size: 11px;">
        <div style="font-weight: bold;">To:</div>
        <div>${customerName}</div>
        ${order.address ? `<div>${order.address}</div>` : ''}
        ${order.phoneNumber ? `<div>Phone: ${order.phoneNumber}</div>` : ''}
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11px;">
        <thead>
          <tr>
            <th style="border-bottom: 1px solid #000; text-align: left; padding: 3px 0; width: 8%;">S.No</th>
            <th style="border-bottom: 1px solid #000; text-align: left; padding: 3px 0; width: 42%;">Items</th>
            <th style="border-bottom: 1px solid #000; text-align: center; padding: 3px 0; width: 15%;">QTY</th>
            <th style="border-bottom: 1px solid #000; text-align: right; padding: 3px 0; width: 15%;">RATE</th>
            <th style="border-bottom: 1px solid #000; text-align: right; padding: 3px 0; width: 20%;">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map((item, index) => `
            <tr>
              <td style="padding: 3px 0; vertical-align: top;">${index + 1}</td>
              <td style="padding: 3px 0; vertical-align: top;">${item.productName}</td>
              <td style="text-align: center; padding: 3px 0; vertical-align: top;">${item.quantity}</td>
              <td style="text-align: right; padding: 3px 0; vertical-align: top;">₹${item.price.toFixed(2)}</td>
              <td style="text-align: right; padding: 3px 0; vertical-align: top;">₹${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div style="border-top: 1px dashed #000; margin-top: 10px; padding-top: 5px;">
        <div style="display: flex; justify-content: space-between; font-weight: bold;">
          <div>Total:</div>
          <div>₹${order.totalAmount.toFixed(2)}</div>
        </div>
      </div>
      <div style="text-align: center; margin-top: 20px; font-size: 10px;">
        <div style="margin-bottom: 5px;">E.&C.E.</div>
        <div>For Porunai Crackers</div>
      </div>
    `;

    document.body.appendChild(pdfContent);

    html2canvas(pdfContent, { scale: 2, useCORS: true }).then(canvas => {
      const imgWidth = 80;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, imgHeight + 10]
      });
      
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Save the PDF
      pdf.save(`Invoice_${invoiceNo}.pdf`);
      
      // Return the blob for upload
      const pdfBlob = pdf.output('blob');
      document.body.removeChild(pdfContent);
      resolve(pdfBlob);
    });
  });
};

const handleDispatchOrder = async () => {
  if (!deliveryMethod) {
    alert("Please select a delivery method");
    return;
  }
  if (!lrNumber) {
    alert("Please enter LR Number");
    return;
  }
  if (!lrDate) {
    alert("Please select LR Date");
    return;
  }
  if (!dispatchAmount || parseFloat(dispatchAmount) <= 0) {
    alert("Please enter a valid dispatch amount");
    return;
  }

  const companyId = 2; // change dynamically if needed
  const orderStatusID = 12; // always dispatched

  const payload = {
    OrderID: selectedOrder.orderId,
    PaidAmount: selectedOrder.totalAmount || 0,
    PaymentMethod: selectedOrder.paymentMode || "Online",
    ReferenceNumber: selectedOrder.transactionId || null,
    PaymentDate: selectedOrder.paymentDate
      ? new Date(selectedOrder.paymentDate).toISOString()
      : null,
    DeliveryNote: deliveryNote || "",
    DeliveryMethod: deliveryMethod,
    DeliveryAddress: selectedOrder.address,
    LRNumber: lrNumber,
    LRDate: new Date(lrDate).toISOString(),
    DispatchAmnt: parseFloat(dispatchAmount),
    CompanyId: companyId,
    orderStatusID
  };

  try {
    const token = await localforage.getItem("jwtToken");
    const response = await axios.post(
      `${API_BASE_URL}api/Crackers/AddOrderPayment`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (response.data.statusCode === 200) {
      alert("Order dispatched successfully!");
      await fetchOrders();

      try {
        const whatsappPayload = {
          to: selectedOrder.phoneNumber?.startsWith("91")
            ? selectedOrder.phoneNumber
            : `91${selectedOrder.phoneNumber}`,
          CusName: `${(selectedOrder.customerName || "")} ${(selectedOrder.lastName || "")}`.trim() || "Customer",
          orderNumber: selectedOrder.orderId,
          lrNumber: lrNumber,
          lrDate: lrDate,
          dispatchAmount: parseFloat(dispatchAmount) || 0,
          companyName: "ADHITYA CRACKERS"
        };

        await axios.post(`${API_BASE_URL}api/Whatsapp/SendDispatch`, whatsappPayload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        console.log("WhatsApp dispatch notification sent.");
      } catch (whatsAppError) {
        console.error("Failed to send WhatsApp dispatch message:", whatsAppError);
        alert("Dispatch successful, but failed to send WhatsApp message.");
      }

      setIsModalOpen(false);
    } else {
      alert("Failed to dispatch: " + response.data.statusDesc);
    }
  } catch (error) {
    console.error("Dispatch error:", error);
    alert("Failed to dispatch order.");
  }
};

  // Filter orders based on selected filters
  const filteredOrders = orders.filter(order => {
  if (phone) {
  const orderPhone = order.phoneNumber;
  if (!orderPhone || !orderPhone.toString().includes(phone)) {
    return false;
  }
}
    
    const orderDate = new Date(order.orderDate);
    if (fromDate && orderDate < new Date(fromDate)) return false;
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      if (orderDate > to) return false;
    }
    
    return true;
  });

  const formatDate = (isoDate) => {
    if (!isoDate) return "-";
    return new Date(isoDate).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (isoDate) => {
    if (!isoDate) return "-";
    return new Date(isoDate).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

const handleSearch = async () => {
  try {
    setLoading(true);
    const token = await localforage.getItem("jwtToken");

    // Clean phone number - remove all non-digit characters
    const cleanedPhone = phone ? phone.replace(/\D/g, '') : '';

    const params = new URLSearchParams();

    // ✅ Hardcode CompanyId as 2
    params.append("companyId", 2);

    // Only append phoneNumber if provided
    if (cleanedPhone) {
      params.append("phoneNumber", cleanedPhone);
    }

    // Only append fromDate if provided
    if (fromDate) {
      params.append("fromDate", fromDate);
    }

    // Only append toDate if provided
    if (toDate) {
      params.append("toDate", toDate);
    }

    // Always send selectedStatusId
    params.append("id", selectedStatusId);

    const url = `${API_BASE_URL}api/Crackers/GetOverallOrders?${params.toString()}`;
    
    console.log("🔍 Searching with URL:", url); // Debug log

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000
    });

    if (response.data.statusCode === 200) {
      setOrders(response.data.result || []);
    } else {
      alert("No orders found matching your criteria");
      setOrders([]); // Show empty table
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to fetch orders. Please check your network connection.");
    setOrders([]);
  } finally {
    setLoading(false);
  }
};

 const handleReset = () => {
  setPhone("");
  setFromDate("");
  setToDate("");
  // Do NOT change selectedStatusId
  // Just fetch orders again with current status ID
  handleSearch(); // ✅ Reuse search logic with current id
};
const displayedOrders = orders;
 
const generatePDF = async (order) => {
  try {
    setLoading(true);
    const token = await localforage.getItem('jwtToken');
    const companyId = 2;

    const response = await axios.get(
      `${API_BASE_URL}api/Crackers/GetOrderDetailsByOrderId?OrderId=${order.orderId}&CompanyId=${companyId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (response.data.statusCode !== 200) {
      throw new Error(response.data.statusDesc || "Failed to fetch order details");
    }

    const apiData = response.data;
    const orderDetails = {
      ...apiData.orderHeader,
      items: apiData.orderLines.map(line => ({
        productName: line.productName,
        quantity: line.qty,
        price: line.productPrice,
        discountedPrice: line.discountedPrice,
        totalPrice: line.totalPrice,
        totalDiscountedPrice: line.finalTotalAmt
      })),
      subTotal: apiData.totals?.totalProductAmount || 0,
      totalDiscount: apiData.totals?.totalDiscountAmount || 0,
      deliveryCharge: apiData.orderHeader.dispatchAmnt || 0,
      totalAmount:
        apiData.orderHeader.payableAmount ||
        (apiData.totals?.totalFinalAmount + (apiData.orderHeader.dispatchAmnt || 0)) ||
        0
    };

    // Create PDF and open in new tab
    const pdfBlobUrl = await createPDFBlobUrl(orderDetails);

    const newWindow = window.open(pdfBlobUrl, '_blank', 'width=800,height=600');
    if (!newWindow) {
      alert("Popup blocked! Please allow popups for this site.");
    }

  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF: " + error.message);
  } finally {
    setLoading(false);
  }
};

const createPDFBlobUrl = (order) => {
  return new Promise((resolve) => {
    const pdfContent = document.createElement("div");
    pdfContent.style.position = "absolute";
    pdfContent.style.left = "-9999px";
    pdfContent.style.padding = "20px";
    pdfContent.style.width = "210mm";
    pdfContent.style.background = "white";
    pdfContent.style.fontFamily = "Arial, sans-serif";

    const customerName = `${order.firstName || ''} ${order.lastName || ''}`.trim() || 'N/A';

    pdfContent.innerHTML = `
      <div style="font-family: Arial, sans-serif; border: 2px solid #000; padding: 20px;">
        <h2 style="text-align: center; margin-bottom: 20px;">ORDER DETAILS</h2>
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <div style="width: 48%;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="font-weight: bold; width: 100px;">Order No:</td>
                <td>${order.orderId || 'N/A'}</td>
              </tr>
              <tr>
                <td style="font-weight: bold;">Order Date:</td>
                <td>${formatDate(order.orderDate)}</td>
              </tr>
              <tr>
                <td style="font-weight: bold;">Status:</td>
                <td>
                  <span style="
                    background-color: ${order.orderStatus === 12 ? '#d4edda' : '#f8d7da'};
                    color: ${order.orderStatus === 12 ? '#155724' : '#721c24'};
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                  ">
                    ${order.orderStatus === 12 ? 'Completed' : 'Processing'}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="font-weight: bold;">Payment:</td>
                <td>${order.paymentMethod || 'Pending'}</td>
              </tr>
            </table>
          </div>
          <div style="width: 48%;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="font-weight: bold; width: 100px;">Customer:</td>
                <td>${customerName}</td>
              </tr>
              <tr>
                <td style="font-weight: bold;">Phone:</td>
                <td>${order.phoneNumber || 'N/A'}</td>
              </tr>
              <tr>
                <td style="font-weight: bold;">Address:</td>
                <td>
                  ${order.address || 'N/A'}<br>
                  ${order.city || ''} ${order.pinCode || ''}<br>
                  ${order.state || ''}, ${order.country || ''}
                </td>
              </tr>
            </table>
          </div>
        </div>
        <h3 style="margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #ddd;">Order Items</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f0f0f0;">
              <th style="border: 1px solid #000; padding: 8px; text-align: center;">S.No</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: left;">Product Name</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: center;">Qty</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: center;">Rate</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: center;">Discounted Rate</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: center;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items && order.items.length > 0 ? 
              order.items.map((item, index) => `
                <tr>
                  <td style="border: 1px solid #000; padding: 8px; text-align: center;">${index + 1}</td>
                  <td style="border: 1px solid #000; padding: 8px;">${item.productName || 'N/A'}</td>
                  <td style="border: 1px solid #000; padding: 8px; text-align: center;">${item.quantity || 0}</td>
                  <td style="border: 1px solid #000; padding: 8px; text-align: center;">₹${(item.price || 0).toFixed(2)}</td>
                  <td style="border: 1px solid #000; padding: 8px; text-align: center;">₹${(item.discountedPrice || 0).toFixed(2)}</td>
                  <td style="border: 1px solid #000; padding: 8px; text-align: center;">₹${(item.totalDiscountedPrice || 0).toFixed(2)}</td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="6" style="border: 1px solid #000; padding: 8px; text-align: center;">No items found</td>
                </tr>
              `}
          </tbody>
        </table>
        <div style="display: flex; justify-content: flex-end;">
          <div style="width: 300px; border-top: 1px solid #000; padding-top: 10px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-weight: bold;">Subtotal:</span>
              <span>₹${(order.subTotal || 0).toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-weight: bold;">Discount:</span>
              <span>₹${(order.totalDiscount || 0).toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-weight: bold;">Delivery Charge:</span>
              <span>₹${(order.deliveryCharge || 0).toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
              <span style="font-weight: bold;">Total Amount:</span>
              <span style="font-weight: bold;">₹${(order.totalAmount || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(pdfContent);

    html2canvas(pdfContent, {
      scale: 2,
      logging: false,
      useCORS: true
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Generate blob URL instead of saving
      const pdfBlob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);

      // Clean up
      document.body.removeChild(pdfContent);

      resolve(blobUrl); // Return blob URL
    });
  });
};
const formatNumber = (value) => {
  if (!value && value !== 0) return "0.00";
  return parseFloat(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};
// Format number with commas (Indian format)
const formatWithCommas = (value) => {
  if (!value && value !== 0) return "";
  return Number(value).toLocaleString('en-IN');
};

// Parse back to number (remove commas)
const parseWithoutCommas = (value) => {
  return parseFloat(value.replace(/,/g, '')) || 0;
};
  return (
    <>
      <Layout />
      <div style={styles.container}>
        {/* <div style={styles.titleContainer}>
          <h2 style={styles.title}>Manage Orders</h2>
        </div> */}

        {/* Status Filter Buttons */}
      <div style={styles.statusFilterContainer}>
  <button
    onClick={() => {
      console.log("🔄 Changing status filter to All Orders (0)");
      setSelectedStatusId(0);
    }}
    style={styles.statusButton(selectedStatusId === 0, "rgb(128, 0, 0)")}
  >
    All Orders
  </button>
  
  {orderStatuses.map(status => (
    <button
      key={status.id}
      onClick={() => {
        console.log(`🔄 Changing status filter to ${status.statusDesc} (${status.id})`);
        setSelectedStatusId(status.id);
      }}
      style={styles.statusButton(selectedStatusId === status.id, "rgba(150, 6, 6, 1)")}
    >
      {status.statusDesc}
    </button>
  ))}
</div>

        {/* Filter Section */}
      <div style={styles.filterContainer}>
  <div style={styles.filterRow}>
    <div style={styles.filterGroup}>
      <label style={styles.filterLabel}>Phone Number:</label>
     <input
  type="text"
  value={phone}
  onChange={(e) => {
    const newValue = e.target.value;
    console.log("📞 Phone input changed:", newValue);
    setPhone(newValue);
  }}
  style={styles.input}
  placeholder="Enter phone"
/>
    </div>
    <div style={styles.filterGroup}>
      <label style={styles.filterLabel}>From Date:</label>
      <input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        style={styles.input}
      />
    </div>
    <div style={styles.filterGroup}>
      <label style={styles.filterLabel}>To Date:</label>
      <input
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
        style={styles.input}
      />
    </div>
    <div style={styles.buttonGroup}>
      <button onClick={handleSearch} style={styles.searchButton}>
        Search
      </button>
      <button onClick={handleReset} style={styles.resetButton}>
        Reset
      </button>
    </div>
  </div>
</div>
        {/* Orders Table */}
<div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
          <tr>
            <th style={styles.th}>S.No</th>
            <th style={styles.th}>Order No</th>
            <th style={styles.th}>Order Date</th>
            <th style={styles.th}>Customer Name</th>
            <th style={styles.th}>Phone Number</th>
            <th style={styles.th}>Address</th>
            {selectedStatusId === 0 && <th style={styles.th}>Status</th>} {/* Only show for All Orders */}
             <th style={styles.th}>Payment Amount</th>
            <th style={styles.th}>Action</th>
          </tr>
        </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={styles.noDataRow}>
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={styles.noDataRow}>
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => (
                  <tr key={order.id} style={{ backgroundColor: "#f9f9f9" }}>
                    <td style={styles.tdCenter}>{index + 1}</td>
                    <td style={styles.tdCenter}>
                      <span style={{ 
                        backgroundColor: "#dee2e4ff",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontWeight: "bold",
                        color: "rgb(128, 0, 0)"
                      }}>
                        {order.orderId || `ORD${String(order.id).padStart(3, '0')}`}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {formatDate(order.orderDate)} <br />
                     
                    </td>
                    <td style={styles.td}>{order.customerName}</td>
                    <td style={styles.td}>{order.phoneNumber}</td>
                    <td style={{ ...styles.td, ...styles.addressCell }}>
                      {order.address}
                    </td>
                  {selectedStatusId === 0 && (
          <td style={styles.tdCenter}>
            <span style={{
              backgroundColor: order.orderStatusID === 11 ? "#fff3cd" : 
                           order.orderStatusID === 10 ? "#cce5ff" : 
                           order.orderStatusID === 12 ? "#d4edda" : "#f8d7da",
              color: order.orderStatusID === 11 ? "#856404" : 
                     order.orderStatusID === 10 ? "#004085" : 
                     order.orderStatusID === 12 ? "#155724" : "#721c24",
              padding: "4px 8px",
              borderRadius: "10px",
              fontSize: "12px",
              fontWeight: "bold"
            }}>
              {order.orderStatusName || "New Order"}
            </span>
          </td>
        )}
      <td style={styles.tdRight}>
  ₹{formatNumber(order.payableAmount)}
</td>
                  <td style={styles.tdCenter}>
  <div style={styles.actionContainer}>
    {/* Payment Button */}
    {order.orderStatusID === 10 && (
      <button
        onClick={() => openModal(order, "payment")}
        style={{
          ...styles.actionButton,
          backgroundColor: "rgb(128, 0, 0)",
          color: "white",
        }}
        title="Payment Details"
      >
        <FaCreditCard size={14} />
      </button>
    )}

    {/* Dispatch Button */}
    {order.orderStatusID === 11 && (
      <button
        onClick={() => openModal(order, "dispatch")}
        style={{
          ...styles.actionButton,
          backgroundColor: "rgb(128, 0, 0)",
          color: "white",
        }}
        title="Dispatch Details"
      >
        <FiTruck size={14} />
      </button>
    )}

    {/* View PDF Document (Full Order Details) */}
     {order.orderStatusID !== 12 && (
    <button
      onClick={() => generatePDF(order)}
      style={{
        ...styles.actionButton,
        backgroundColor: "#28a745",
        color: "white",
      }}
      title="View Order Details"
    >
      <FiFileText size={14} />
    </button>
     )}
    {/* NEW: View Invoice (Cash Bill Style) */}
   {(order.orderStatusID === 10 || order.orderStatusID === 12) && (
      <button
        onClick={() => generateNewPDF(order)}
        style={{
          ...styles.actionButton,
          backgroundColor: "#dc3545",
          color: "white",
        }}
        title="View Invoice"
      >
        <FaWallet size={14} />
      </button>
    )}
  </div>
</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedOrder && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {viewMode === "payment" ? "Payment Details" : 
                 viewMode === "dispatch" ? "Dispatch Details" : "Order Details"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={styles.closeButton}>
                ×
              </button>
            </div>

            <div style={styles.modalBody}>
              {viewMode === "details" ? (
                <>
                  <div style={styles.customerDetails}>
                    <h4 style={styles.sectionTitle}>Customer Information</h4>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Order ID:</span>
                      <span style={styles.detailValue}>{selectedOrder.orderId || `ORD${String(selectedOrder.id).padStart(3, '0')}`}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Customer Name:</span>
                      <span style={styles.detailValue}>{selectedOrder.firstName} {selectedOrder.lastName}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Phone:</span>
                      <span style={styles.detailValue}>{selectedOrder.phoneNumber}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Email:</span>
                      <span style={styles.detailValue}>{selectedOrder.email || "N/A"}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Order Date:</span>
                      <span style={styles.detailValue}>
                        {formatDate(selectedOrder.orderDate)} at {formatTime(selectedOrder.orderDate)}
                      </span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Status:</span>
                      <span style={styles.detailValue}>{selectedOrder.status}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Address:</span>
                      <span style={styles.detailValue}>{selectedOrder.address}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Payment Mode:</span>
                      <span style={styles.detailValue}>{selectedOrder.paymentMode || "N/A"}</span>
                    </div>
                    {selectedOrder.paymentMode === "Online" && (
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Transaction ID:</span>
                        <span style={styles.detailValue}>{selectedOrder.transactionId || "N/A"}</span>
                      </div>
                    )}
                    {selectedOrder.orderStatusID === 12 && (
                      <>
                        <div style={styles.detailRow}>
                          <span style={styles.detailLabel}>Delivery Method:</span>
                          <span style={styles.detailValue}>{selectedOrder.deliveryMethod || "N/A"}</span>
                        </div>
                        <div style={styles.detailRow}>
                          <span style={styles.detailLabel}>Delivery Date:</span>
                          <span style={styles.detailValue}>{selectedOrder.deliveryDate ? formatDate(selectedOrder.deliveryDate) : "N/A"}</span>
                        </div>
                        <div style={styles.detailRow}>
                          <span style={styles.detailLabel}>Delivery Notes:</span>
                          <span style={styles.detailValue}>{selectedOrder.deliveryNote || "N/A"}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <h4 style={styles.sectionTitle}>Order Items</h4>
                  <table style={styles.itemsTable}>
                    <thead>
                      <tr>
                        <th style={styles.itemsTh}>Item</th>
                        <th style={styles.itemsTh}>Quantity</th>
                        <th style={styles.itemsTh}>Price</th>
                        <th style={styles.itemsTh}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item, index) => (
                          <tr key={index}>
                            <td style={styles.itemsTd}>{item.productName}</td>
                            <td style={styles.itemsTd}>{item.quantity}</td>
                            <td style={styles.itemsTd}>₹{item.price}</td>
                            <td style={styles.itemsTd}>₹{item.price * item.quantity}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" style={{ ...styles.itemsTd, textAlign: "center" }}>
                            No items found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "15px" }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={styles.detailRow}>
                        <span style={{ ...styles.detailLabel, fontWeight: "bold" }}>Subtotal:</span>
                        <span style={styles.detailValue}>₹{selectedOrder.subTotal || "0"}</span>
                      </div>
                      <div style={styles.detailRow}>
                        <span style={{ ...styles.detailLabel, fontWeight: "bold" }}>Delivery Charge:</span>
                        <span style={styles.detailValue}>₹{selectedOrder.deliveryCharge || "0"}</span>
                      </div>
                      <div style={styles.detailRow}>
                        <span style={{ ...styles.detailLabel, fontWeight: "bold" }}>Total Amount:</span>
                        <span style={{ ...styles.detailValue, fontWeight: "bold", fontSize: "14px" }}>
                          ₹{selectedOrder.totalAmount || "0"}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : viewMode === "dispatch" ? (
  <>
    {/* Delivery Address */}
    

    {/* Delivery Method & Delivery Date in Same Row */}
    <div style={styles.formRow}>
      <div style={styles.formGroup}>
  <label style={styles.formLabel}>Delivery Method:</label>
  <input
    type="text"
    value="Transport"
    disabled
    style={{ ...styles.input, fontWeight: "bold"}}
  />
  {/* Hidden effect to ensure state is set */}
  {deliveryMethod !== "Transport" && setDeliveryMethod("Transport")}
</div>
<div style={styles.formGroup}>
        <label style={styles.formLabel}>LR Date:</label>
        <input
          type="date"
          value={lrDate}
          onChange={(e) => setLrDate(e.target.value)}
          style={styles.input}
        />
      </div>
      {/* <div style={styles.formGroup}>
        <label style={styles.formLabel}>Delivery Date:</label>
        <input
          type="date"
          value={deliveryDate}
          onChange={(e) => setDeliveryDate(e.target.value)}
          style={styles.input}
        />
      </div> */}
    </div>

    {/* LR Number & LR Date in Same Row */}
    <div style={styles.formRow}>
      <div style={styles.formGroup}>
        <label style={styles.formLabel}>LR Number:</label>
        <input
          type="text"
          value={lrNumber}
          onChange={(e) => setLrNumber(e.target.value)}
          style={styles.input}
          placeholder="Enter LR number"
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.formLabel}>Dispatch Amount:</label>
      <input
  type="number"
  value={dispatchAmount}
  onChange={(e) => setDispatchAmount(e.target.value)}
  style={styles.input}
  placeholder="Enter dispatch amount"
  min="0"
/>
      </div>
    </div>

    

{/* Notes (Left) & Delivery Address (Right) */}
<div style={styles.formRow}>
  {/* Notes */}
  <div style={styles.formGroup}>
    <label style={styles.formLabel}>Notes:</label>
    <textarea
      value={deliveryNote}
      onChange={(e) => setDeliveryNote(e.target.value)}
      style={{ ...styles.input, minHeight: "80px" }}
      placeholder="Enter any delivery notes"
    />
  </div>

  {/* Delivery Address */}
 <div style={styles.formGroup}>
  <label style={styles.formLabel}>Delivery Address:</label>
  <textarea
    style={{ ...styles.input, minHeight: "80px", paddingTop: "8px", lineHeight: "1.4" }}
    value={selectedOrder.address}
    onChange={(e) =>
      setSelectedOrder({
        ...selectedOrder,
        address: e.target.value,
      })
    }
    placeholder="Enter delivery address"
  />
</div>
</div>
  </>

) : (
  <>
                  {/* Payment Mode & Reference No in Same Row */}
    <div style={styles.formRow}>
       <div style={styles.formGroup}>
    <label style={styles.formLabel}>Payment Mode:</label>
    <input
      type="text"
      value="Online"
      disabled
      style={{ ...styles.input, fontWeight: "bold"}}
    />
    {/* Hidden field to ensure state is set */}
    {paymentMode !== "Online" && setPaymentMode("Online")}
  </div>

      <div style={styles.formGroup}>
        <label style={styles.formLabel}>Reference No:</label>
        <input
          type="text"
          value={refNo}
          onChange={(e) => setRefNo(e.target.value)}
          style={styles.input}
          placeholder="Enter transaction ID"
        />
      </div>
    </div>

    {/* Payment Date & Payment Amount in Same Row */}
    <div style={styles.formRow}>
      <div style={styles.formGroup}>
        <label style={styles.formLabel}>Payment Date:</label>
        <input
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.formLabel}>Payment Amount (₹):</label>
        <input
          type="number"
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
          style={styles.input}
          step="0.01"
          min="0"
        />
      </div>
    </div>
                </>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button onClick={() => setIsModalOpen(false)} style={styles.cancelButton}>
                Cancel
              </button>
              {viewMode === "payment" ? (
                <button onClick={handleUpdatePayment} style={styles.updateButton}>
                  Update Payment
                </button>
              ) : viewMode === "dispatch" ? (
                <button onClick={handleDispatchOrder} style={styles.updateButton}>
                  Confirm Dispatch
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
  const styles = {
    container: {
      marginTop: "10px",
      padding: "10px",
    },
    titleContainer: {
      padding: "2px",
      borderRadius: "4px",
      textAlign: "left",
      color: "#fff",
    },
    title: {
      color: "darkblue",
      fontWeight: "900",
      fontSize: "18px",
      marginBottom: "10px",
    },
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    modal: {
      backgroundColor: "white",
      borderRadius: "12px",
      width: "500px",
      maxWidth: "90vw",
      maxHeight: "90vh",
      overflowY: "auto",
      boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      display: "flex",
      flexDirection: "column",
    },
    modalHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "16px 20px",
      borderBottom: "1px solid #e0e0e0",
    },
    modalTitle: {
      margin: 0,
      fontSize: "16px",
      fontWeight: "bold",
      color: "#333",
    },
    closeButton: {
      background: "none",
      border: "none",
      fontSize: "24px",
      color: "#999",
      cursor: "pointer",
      width: "30px",
      height: "30px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    modalBody: {
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    formGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    },
    formLabel: {
      fontSize: "13px",
      fontWeight: "bold",
      color: "#333",
    },
    gatewayOptions: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    gatewayOption: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid #ddd",
      cursor: "pointer",
    },
    gatewayImage: {
      width: "30px",
      height: "30px",
      borderRadius: "50%",
    },
    modalFooter: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "10px",
      padding: "16px 20px",
      borderTop: "1px solid #e0e0e0",
    },
    updateButton: {
      backgroundColor: "rgb(128, 0, 0)",
      color: "white",
      border: "none",
      padding: "8px 16px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "bold",
    },
    cancelButton: {
      backgroundColor: "#6c757d",
      color: "white",
      border: "none",
      padding: "8px 16px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "13px",
    },
    statusFilterContainer: {
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
      justifyContent: "center",
      alignItems: "center",
      padding: "12px",
      backgroundColor: "#f1f3f5",
      borderRadius: "12px",
      border: "1px solid #e0e0e0ff",
      marginBottom: "15px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    },
    statusButton: (isActive, color) => ({
      padding: "6px 14px",
      borderRadius: "20px",
      border: "none",
      backgroundColor: isActive ? color : "#e9ecef",
      color: isActive ? "#fff" : "#495057",
      fontWeight: isActive ? "bold" : "normal",
      fontSize: "13px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      minWidth: "90px",
      boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
    }),
    filterContainer: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      marginBottom: "15px",
      backgroundColor: "#f8f9fa",
      padding: "10px",
      borderRadius: "8px",
    },
    filterRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
      alignItems: "center",
      justifyContent: "center",
    },
    filterGroup: {
      display: "flex",
      alignItems: "center",
      gap: "5px",
      flex: "1",
      minWidth: "140px",
    },
    filterLabel: {
      fontWeight: "bold",
      fontSize: "12px",
      width: "110px",
      color: "#333",
    },
    detailRow: {
    display: "flex",
    marginBottom: "12px",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  },
  detailLabel: {
    fontWeight: "bold",
    fontSize: "13px",
    color: "#333",
    minWidth: "110px",
  },
  detailValue: {
    flex: 1,
    fontSize: "13px",
    padding: "6px 0",
  },

  // Form Row: Two fields side by side
  formRow: {
    display: "flex",
    gap: "16px",
    marginBottom: "12px",
    flexWrap: "wrap",
    width: "100%",
  },

  formGroup: {
    flex: 1,
    minWidth: "200px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  formLabel: {
    fontSize: "13px",
    fontWeight: "bold",
    color: "#333",
  },

  input: {
    flex: 1,
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "13px",
    boxSizing: "border-box",
  },

  select: {
    flex: 1,
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "13px",
    boxSizing: "border-box",
  },

  // Ensure modal body has enough padding
  modalBody: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
    buttonGroup: {
      display: "flex",
      gap: "10px",
      justifyContent: "center",
      marginTop: "5px",
    },
    searchButton: {
      backgroundColor: "rgb(128, 0, 0)",
      border: "none",
      color: "white",
      cursor: "pointer",
      padding: "8px 12px",
      fontWeight: "bold",
      fontSize: "12px",
      borderRadius: "4px",
    },
    resetButton: {
      backgroundColor: "#6c757d",
      border: "none",
      color: "white",
      cursor: "pointer",
      padding: "8px 12px",
      fontWeight: "bold",
      fontSize: "12px",
      borderRadius: "4px",
    },
    tableContainer: {
      maxHeight: "340px",
      overflowY: "auto",
      marginBottom: "40px",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    th: {
      backgroundColor: "rgb(128, 0, 0)",
      color: "#fff",
      textAlign: "center",
      fontSize: "12px",
      padding: "8px",
      position: "sticky",
      top: 0,
      zIndex: "1",
      whiteSpace: "nowrap",
    },
    td: {
      padding: "6px",
      border: "1px solid #ccc",
      textAlign: "left",
      fontSize: "12px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
     tdRight: {
      padding: "6px",
      border: "1px solid #ccc",
      textAlign: "right",
      fontSize: "12px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    tdCenter: {
      textAlign: "center",
      padding: "6px",
      border: "1px solid #ccc",
      fontSize: "12px",
    },
    actionContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "8px",
    },
    actionButton: {
      padding: "6px",
      fontSize: "12px",
      borderRadius: "50%",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "24px",
      height: "24px",
      margin: 0,
    },
    noDataRow: {
      textAlign: "center",
      color: "#666",
      fontStyle: "italic",
      padding: "1rem",
    },
    addressCell: {
      maxWidth: "150px",
      whiteSpace: "normal",
      wordWrap: "break-word",
      lineHeight: "1.3",
    },
    customerDetails: {
      backgroundColor: "#f5f5f5",
      padding: "15px",
      borderRadius: "8px",
      marginBottom: "15px",
    },
    detailRow: {
      display: "flex",
      marginBottom: "8px",
    },
    detailLabel: {
      fontWeight: "bold",
      width: "120px",
      fontSize: "13px",
    },
    detailValue: {
      flex: 1,
      fontSize: "13px",
    },
    itemsTable: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "10px",
    },
    itemsTh: {
      backgroundColor: "#e0e0e0",
      padding: "8px",
      textAlign: "left",
      fontSize: "12px",
    },
    itemsTd: {
      padding: "8px",
      borderBottom: "1px solid #e0e0e0",
      fontSize: "12px",
    },
    sectionTitle: {
      fontSize: "14px",
      fontWeight: "bold",
      margin: "15px 0 8px 0",
      color: "#333",
    },
  };
export default AdminOrder;
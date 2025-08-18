// src/components/AdminOrderView.js
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "./AdminLayouts";

const AdminOrderView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Sample order data (replace with API call in real app)
  const order = {
    id,
    firstName: "Rahul",
    lastName: "Sharma",
    address: "123, Gandhi Nagar, Mumbai, Maharashtra",
    email: "rahul.sharma@example.com",
    pinCode: "400001",
    phone: "9876543210",
    status: "Delivered",
    isPaid: true,
    paidAmount: 2999.0,
    paymentMode: "UPI",
    orderReference: "ORD-2024-08-15-1001",
    discountAmount: 200.0,
    orderDate: "2024-08-15T10:30:00Z",
    items: [
      { id: 1, name: "Premium Wireless Headphones", qty: 2, price: 999 },
      { id: 2, name: "Smart Watch Pro", qty: 1, price: 1000 },
      { id: 3, name: "Phone Case", qty: 3, price: 300 },
      { id: 4, name: "Screen Protector", qty: 2, price: 150 },
      { id: 5, name: "USB Cable", qty: 5, price: 100 }
    ]
  };

  // Format date
  const formatDate = (isoDate) => {
    if (!isoDate) return "-";
    return new Date(isoDate).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Calculate total amount
  const totalAmount = order.items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <>
      <Layout />
      <div style={styles.container}>
        <h2 style={styles.header}>Order #{order.id}</h2>
        
        {/* Customer Details Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionHeader}>Customer Information</h3>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Name</label>
              <div style={styles.compactField}>
                {order.firstName} {order.lastName}
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Contact</label>
              <div style={styles.compactField}>
                {order.phone}
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <div style={styles.compactField}>
                {order.email}
              </div>
            </div>
          </div>
          
          <div style={styles.formRow}>
            <div style={{...styles.formGroup, flex: 2}}>
              <label style={styles.label}>Address</label>
              <div style={styles.compactField}>
                {order.address}, {order.pinCode}
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Summary Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionHeader}>Order Summary</h3>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Date</label>
              <div style={styles.compactField}>
                {formatDate(order.orderDate)}
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Reference</label>
              <div style={styles.compactField}>
                {order.orderReference}
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Payment</label>
              <div style={styles.compactField}>
                {order.paymentMode} ({order.isPaid ? 'Paid' : 'Unpaid'})
              </div>
            </div>
          </div>
          
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Status</label>
              <select 
                value={order.status} 
                style={styles.compactInput}
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Amount</label>
              <div style={styles.compactField}>
                ₹{order.paidAmount.toFixed(2)}
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Discount</label>
              <input 
                type="number" 
                value={order.discountAmount} 
                style={styles.compactInput}
              />
            </div>
          </div>
        </div>
        
        {/* Order Items Table */}
        <div style={styles.section}>
          <h3 style={styles.sectionHeader}>Order Items</h3>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Product</th>
                  <th style={styles.th}>Qty</th>
                  <th style={styles.th}>Price</th>
                  <th style={styles.th}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={item.id}>
                    <td style={styles.tdCenter}>{index + 1}</td>
                    <td style={styles.td}>{item.name}</td>
                    <td style={styles.tdCenter}>{item.qty}</td>
                    <td style={styles.tdRight}>₹{item.price.toFixed(2)}</td>
                    <td style={styles.tdRight}>₹{(item.price * item.qty).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="4" style={styles.tdRight}>Subtotal:</td>
                  <td style={styles.tdRight}>₹{totalAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="4" style={styles.tdRight}>Discount:</td>
                  <td style={styles.tdRight}>-₹{order.discountAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="4" style={styles.tdRightBold}>Total:</td>
                  <td style={styles.tdRightBold}>
                    ₹{(totalAmount - order.discountAmount).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        <div style={styles.buttonContainer}>
          <button 
            onClick={() => navigate(-1)} 
            style={styles.backButton}
          >
            Back
          </button>
          <button style={styles.saveButton}>
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
};

// Updated compact styles
const styles = {
  container: {
    padding: "15px",
    maxWidth: "1200px",
    margin: "0 auto",
    fontSize: "13px"
  },
  header: {
    color: "#1a237e",
    marginBottom: "15px",
    fontSize: "18px",
    fontWeight: "600"
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: "6px",
    padding: "15px",
    marginBottom: "15px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
  },
  sectionHeader: {
    color: "#1a237e",
    marginBottom: "12px",
    fontSize: "14px",
    fontWeight: "500"
  },
  formRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "12px"
  },
  formGroup: {
    flex: "1",
    minWidth: "150px"
  },
  label: {
    display: "block",
    marginBottom: "3px",
    fontWeight: "500",
    color: "#555",
    fontSize: "12px"
  },
  compactField: {
    padding: "6px 8px",
    border: "1px solid #e0e0e0",
    borderRadius: "3px",
    backgroundColor: "#f8f9fa",
    fontSize: "12px",
    minHeight: "30px",
    display: "flex",
    alignItems: "center"
  },
  compactInput: {
    width: "100%",
    padding: "6px 8px",
    border: "1px solid #ddd",
    borderRadius: "3px",
    backgroundColor: "#fff",
    fontSize: "12px",
    height: "30px"
  },
  saveButton: {
    backgroundColor: "#1a237e",
    color: "#fff",
    border: "none",
    padding: "6px 15px",
    borderRadius: "3px",
    cursor: "pointer",
    fontSize: "12px",
    marginLeft: "10px"
  },
  tableContainer: {
    overflowX: "auto",
    fontSize: "12px"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px"
  },
  th: {
    backgroundColor: "#1a237e",
    color: "#fff",
    padding: "8px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "500"
  },
  td: {
    padding: "8px",
    borderBottom: "1px solid #eee",
    fontSize: "12px"
  },
  tdCenter: {
    textAlign: "center",
    padding: "8px",
    borderBottom: "1px solid #eee",
    fontSize: "12px"
  },
  tdRight: {
    textAlign: "right",
    padding: "8px",
    borderBottom: "1px solid #eee",
    fontSize: "12px"
  },
  tdRightBold: {
    textAlign: "right",
    padding: "8px",
    borderBottom: "1px solid #eee",
    fontSize: "12px",
    fontWeight: "bold"
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "15px",
    gap: "10px"
  },
  backButton: {
    backgroundColor: "#6c757d",
    color: "#fff",
    border: "none",
    padding: "6px 15px",
    borderRadius: "3px",
    cursor: "pointer",
    fontSize: "12px"
  }
};

export default AdminOrderView;
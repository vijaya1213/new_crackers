import React, { useState } from 'react';
import AdminLayouts from './AdminLayouts';

const Admin_Reports = () => {
  const [formData, setFormData] = useState({
    productCategory: '',
    productName: '',
    fromDate: '',
    toDate: ''
  });

  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = () => {
    setIsLoading(true);
    
    console.log('Search parameters:', formData);
    
    // Simulate API call
    setTimeout(() => {
      // Mock data for demonstration
      const mockResults = [
        {
          category: 'Electronics',
          productName: 'Laptop',
          totalQty: 25,
          totalDiscount: 500.00,
          totalAmount: 12500.00
        },
        {
          category: 'Electronics',
          productName: 'Mouse',
          totalQty: 50,
          totalDiscount: 150.00,
          totalAmount: 1350.00
        },
        {
          category: 'Accessories',
          productName: 'Keyboard',
          totalQty: 30,
          totalDiscount: 200.00,
          totalAmount: 2800.00
        }
      ];
      
      setResults(mockResults);
      setIsLoading(false);
    }, 1000);
  };

  const handleReset = () => {
    setFormData({
      productCategory: '',
      productName: '',
      fromDate: '',
      toDate: ''
    });
    setResults([]);
  };

  // === STYLES ===
  const styles = {
    container: {
      marginTop: "10px",
      padding: "10px",
      maxHeight: "400px",
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
      marginBottom: "5px",
    },
    filterContainer: {
      display: "flex",
      flexDirection: "column",
      gap: "15px",
      marginBottom: "15px",
      backgroundColor: "#f8f9fa",
      padding: "15px",
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
    input: {
      flex: "1",
      padding: "6px",
      borderRadius: "5px",
      border: "1px solid #000",
      fontSize: "12px",
    },
    select: {
      flex: "1",
      padding: "6px",
      borderRadius: "5px",
      border: "1px solid #000",
      fontSize: "12px",
    },
    buttonGroup: {
      display: "flex",
      gap: "10px",
      justifyContent: "center",
      marginTop: "5px",
    },
    searchButton: {
      backgroundColor: "#042d88",
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
      backgroundColor: "#1e1e66",
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
    tdCenter: {
      textAlign: "center",
      padding: "6px",
      border: "1px solid #ccc",
      fontSize: "12px",
    },
    noDataRow: {
      textAlign: "center",
      color: "#666",
      fontStyle: "italic",
      padding: "1rem",
    },
  };

  return (
    <>
    <AdminLayouts />
     <div style={styles.container}>
      <div style={styles.titleContainer}>
        <h2 style={styles.title}>Sales Report</h2>
      </div>

      {/* Filter Section */}
      <div style={styles.filterContainer}>
        {/* Single Row for All Filters */}
        <div style={styles.filterRow}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Product Category:</label>
            <input
              type="text"
              name="productCategory"
              value={formData.productCategory}
              onChange={handleInputChange}
              style={styles.input}
              placeholder="Enter Category"
            />
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Product Name:</label>
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleInputChange}
              style={styles.input}
              placeholder="Enter Product Name"
            />
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>From Date:</label>
            <input
              type="date"
              name="fromDate"
              value={formData.fromDate}
              onChange={handleInputChange}
              style={styles.input}
            />
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>To Date:</label>
            <input
              type="date"
              name="toDate"
              value={formData.toDate}
              onChange={handleInputChange}
              style={styles.input}
            />
          </div>
        </div>

        {/* Buttons Below */}
        <div style={styles.buttonGroup}>
          <button 
            onClick={handleSearch} 
            style={styles.searchButton}
            disabled={isLoading}
          >
            {isLoading ? 'SEARCHING...' : 'SEARCH'}
          </button>
          <button 
            onClick={handleReset} 
            style={styles.resetButton}
          >
            RESET
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>SL NO</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Product Name</th>
              <th style={styles.th}>Total QTY Sold</th>
              <th style={styles.th}>Total Discount</th>
              <th style={styles.th}>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr>
                <td colSpan="6" style={styles.noDataRow}>
                  No sales data found.
                </td>
              </tr>
            ) : (
              results.map((item, index) => (
                <tr key={index} style={{ backgroundColor: "#f9f9f9" }}>
                  <td style={styles.tdCenter}>{index + 1}</td>
                  <td style={styles.td}>{item.category}</td>
                  <td style={styles.td}>{item.productName}</td>
                  <td style={styles.tdCenter}>{item.totalQty}</td>
                  <td style={styles.td}>₹{item.totalDiscount.toFixed(2)}</td>
                  <td style={styles.td}>₹{item.totalAmount.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Results Summary */}
      {results.length > 0 && (
        <div style={{
          marginTop: "10px",
          padding: "10px",
          backgroundColor: "#f8f9fa",
          borderRadius: "4px",
          textAlign: "center"
        }}>
          <p style={{ 
            fontWeight: "bold", 
            color: "#333",
            margin: 0,
            fontSize: "12px"
          }}>
            Found {results.length} result{results.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
    </>
   
  );
};

export default Admin_Reports;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import Layout from "./AdminLayouts";
import { FiEdit, FiTrash, FiRefreshCw } from "react-icons/fi";
import axios from "axios";
import API_BASE_URL from "./apiConfig";
import localforage from "localforage";

const AdminCategory = () => {
  const [categoryName, setCategoryName] = useState("");
  const [editId, setEditId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const navigate = useNavigate(); // Initialize navigate

  // Configure localforage
  localforage.config({
    name: 'MyAppStorage',
    storeName: 'jwt_tokens',
    description: 'JWT token storage'
  });

  const handleUnauthorized = async () => {
    await localforage.removeItem("jwtToken");
    navigate("/login"); // Redirect to login page
  };
  useEffect(() => {
    fetchCategories();
  }, []);
const fetchCategories = async () => {
  try {
    const token = await localforage.getItem("jwtToken");
    if (!token) {
      await handleUnauthorized();
      return;
    }

    const companyId = 2; // fixed company ID

    const response = await axios.get(
      `${API_BASE_URL}api/Crackers/GetCategories`,
      {
        params: { companyId }, // sending as query parameter
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (response.data.statusCode === 200) {
      setCategories(response.data.data || []);
    } else {
      throw new Error(response.data.statusDesc || "Failed to fetch categories");
    }
  } catch (err) {
    console.error("Error fetching categories:", err);
    setError("Unable to fetch categories");
    setShowErrorPopup(true);
  }
};


  // Update all API calls similarly (handleAddCategory, handleDelete)
const handleAddCategory = async () => {
  if (!categoryName.trim()) {
    setError("Please enter a category name");
    setShowErrorPopup(true);
    return;
  }

  try {
    const token = await localforage.getItem("jwtToken");
    if (!token) {
      await handleUnauthorized();
      return;
    }

    setIsLoading(true);
    setError(null);

    const companyId = 2; // <-- Replace with dynamic companyId if needed

    const payload = editId
      ? { id: editId, name: categoryName.trim(), companyId: companyId }
      : { name: categoryName.trim(), companyId: companyId };

    const response = await axios.post(
      `${API_BASE_URL}api/Crackers/AddOrUpdateCategory`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (response.data.statusCode === 200) {
      setSuccessMessage(response.data.statusDesc || "Category saved successfully");
      setShowSuccessPopup(true);
      await fetchCategories();
      setCategoryName("");
      setEditId(null);
    } else {
      throw new Error(response.data.statusDesc || "Failed to save category");
    }
  } catch (err) {
    let errorMsg = "Network error occurred";
    if (err.response?.status === 401) {
      await handleUnauthorized();
      return;
    } else if (err.response?.data?.statusDesc) {
      errorMsg = err.response.data.statusDesc;
    } else {
      errorMsg = err.message;
    }
    setError(errorMsg);
    setShowErrorPopup(true);
  } finally {
    setIsLoading(false);
  }
};


  const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this category?")) return;

  try {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const token = await localforage.getItem("jwtToken");
    if (!token) {
      await handleUnauthorized();
      return;
    }

    // Use POST to send body with ID
    const response = await axios.post(
      `${API_BASE_URL}api/Crackers/DeleteCategoryById`,
      { id }, // Request body: { "id": 18 }
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.statusCode === 200) {
      setSuccessMessage(response.data.statusDesc || "Category deleted successfully!");
      setShowSuccessPopup(true);
      await fetchCategories(); // Refresh list
    } else {
      throw new Error(response.data.statusDesc || "Failed to delete category");
    }
  } catch (err) {
    console.error("Error deleting category:", err);
    let errorMsg = "Failed to delete category.";

    if (err.response?.status === 401) {
      errorMsg = "Session expired. Please login again.";
      await handleUnauthorized();
    } else if (err.response?.data?.statusDesc) {
      errorMsg = err.response.data.statusDesc;
    } else if (err.message) {
      errorMsg = err.message;
    }

    setError(errorMsg);
    setShowErrorPopup(true);
  } finally {
    setIsLoading(false);
  }
};
  const handleEdit = (category) => {
    setCategoryName(category.categoryName);
    setEditId(category.id);
  };
  const formatDate = (isoDate) => {
    if (!isoDate) return "-";
    return new Date(isoDate).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // === STYLES ===
 const styles = {
    container: {

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
      justifyContent: "center",
      alignItems: "center",
      gap: "20px",
      marginBottom: "15px",
    },
    filter: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: "10px", // ← Adds space between label and input
    },
    filterLabel: {
      fontWeight: "bold",
      fontSize: "12px",
      whiteSpace: "nowrap",
    },
    inputWrapper: {
      position: "relative",
      width: "240px",
    },
    input: {
      padding: "4px",
      marginBottom: "0",
      borderRadius: "5px",
      border: "1px solid #000",
      width: "100%",
      fontSize: "12px",
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
      minWidth: "30px",
    },
    td: {
      padding: "6px",
      border: "1px solid #ccc",
      textAlign: "left",
      fontSize: "12px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      minWidth: "50px",
    },
    tdCenter: {
      textAlign: "center",
      padding: "6px",
      border: "1px solid #ccc",
      fontSize: "12px",
    },
    tableRow: {
      backgroundColor: "#f9f9f9",
      borderBottom: "1px solid #ddd",
    },
    actionContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "8px",
    },
    actionButton: {
      padding: "6px",
      fontSize: "10px",
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
    editButton: {
      backgroundColor: "#a7a7a7ff",
      color: "white",
    },
    deleteButton: {
      backgroundColor: "#d32f40ff",
      color: "white",
    },
  };
 const ErrorPopup = () => (
  <div style={{
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#ffebee',
    color: '#d32f2f',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '300px',
    maxWidth: '80%',
    textAlign: 'center',
    border: '1px solid #ef9a9a'
  }}>
    <div style={{ 
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '10px'
    }}>
      Error
    </div>
    <div style={{ marginBottom: '20px' }}>{error}</div>
    <button 
      onClick={() => setShowErrorPopup(false)}
      style={{
        backgroundColor: '#d32f2f',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        minWidth: '100px'
      }}
    >
      OK
    </button>
  </div>
);
const SuccessPopup = () => (
  <div style={{
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '300px',
    maxWidth: '80%',
    textAlign: 'center',
    border: '1px solid #a5d6a7'
  }}>
    <div style={{ 
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '10px'
    }}>
      Success
    </div>
    <div style={{ marginBottom: '20px' }}>{successMessage}</div>
    <button 
      onClick={() => setShowSuccessPopup(false)}
      style={{
        backgroundColor: '#2e7d32',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        minWidth: '100px'
      }}
    >
      OK
    </button>
  </div>
);
// Add overlay style when error popup is shown
const Overlay = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999
  }} />
);
 return (
    <>
      <Layout />
    {showErrorPopup && (
      <>
        <Overlay />
        <ErrorPopup />
      </>
    )}
    {showSuccessPopup && (
      <>
        <Overlay />
        <SuccessPopup />
      </>
    )}
      <div style={styles.container}>
        {/* <div style={styles.titleContainer}>
          <h2 style={styles.title}>Manage Categories</h2>
          <button 
            onClick={fetchCategories}
            style={{
              position: "absolute",
              right: "20px",
              top: "70px",
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px"
            }}
            title="Refresh"
          >
            <FiRefreshCw size={16} />
          </button>
        </div> */}

        {/* Error message */}
        {error && (
          <div style={{ 
            color: "#d32f2f", 
            backgroundColor: "#fdecea",
            padding: "10px",
            borderRadius: "4px",
            marginBottom: "15px"
          }}>
            {error}
          </div>
        )}

        {/* Add/Edit Category Form */}
        <div style={styles.filterContainer}>
          <div style={styles.filter}>
            <label style={styles.filterLabel}>Category Name:</label>
            <div style={styles.inputWrapper}>
              <input
                type="text"
                placeholder="Enter Category"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                style={styles.input}
                disabled={isLoading}
              />
            </div>
          </div>
          <button
            onClick={handleAddCategory}
            disabled={isLoading}
            style={{
              ...styles.input,
              ...styles.th,
              backgroundColor: "rgb(128, 0, 0)",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              width: "auto",
              minWidth: "100px",
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? "Processing..." : (editId ? "Update" : "Add Category")}
          </button>
        </div>

       

        {/* Categories Table */}
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>S.No</th>
                <th style={styles.th}>Category No</th>
                <th style={styles.th}>Category Name</th>
                {/* <th style={styles.th}>Created Date</th> */}
                <th style={styles.th}>Created By</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan="6" style={{ ...styles.td, textAlign: "center" }}>
                    No categories found
                  </td>
                </tr>
              ) : (
                categories.map((category, index) => (
                  <tr key={category.id} style={styles.tableRow}>
                    <td style={styles.tdCenter}>{index + 1}</td>
                    <td style={styles.tdCenter}>{category.categoryID}</td>
                    <td style={styles.td}>{category.categoryName}</td>
                    {/* <td style={styles.tdCenter}>{formatDate(category.crT_DATE)}</td> */}
                    <td style={styles.tdCenter}>{category.crT_BY || "-"}</td>
                    <td style={styles.tdCenter}>
                      <div style={styles.actionContainer}>
                        <button
                          onClick={() => handleEdit(category)}
                          disabled={isLoading}
                          style={{ 
                            ...styles.actionButton, 
                            ...styles.editButton,
                            opacity: isLoading ? 0.5 : 1
                          }}
                          title="Edit"
                        >
                          <FiEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          disabled={isLoading}
                          style={{ 
                            ...styles.actionButton, 
                            ...styles.deleteButton,
                            opacity: isLoading ? 0.5 : 1
                          }}
                          title="Delete"
                        >
                          <FiTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminCategory;
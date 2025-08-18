import React, { useState, useEffect } from "react";
import Layout from "./AdminLayouts";
import { FiEdit, FiTrash } from "react-icons/fi";
import axios from "axios";
import localforage from "localforage";
import API_BASE_URL from "./apiConfig";

const baseInputStyle = {
  flex: "1",
  padding: "6px",
  borderRadius: "5px",
  border: "1px solid #000",
  fontSize: "12px",
  height: "32px",
  boxSizing: "border-box",
};

const AdminProduct = () => {
  // Form states
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [image, setImage] = useState("");
  const [openingStock, setOpeningStock] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [pieces, setPieces] = useState("");
  const [ratePer, setRatePer] = useState("");
  
  // Category states
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  
  // Unit states
  const [unitOfSale, setUnitOfSale] = useState([]);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  
  // Product states
  const [products, setProducts] = useState([]);
  const [editId, setEditId] = useState(null);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  // Fetch units of sale
  useEffect(() => {
    const fetchUnitOfSale = async () => {
      try {
        const token = await localforage.getItem("jwtToken");
        if (!token) return;

        const response = await axios.get(`${API_BASE_URL}api/Crackers/GetUnitOfSale`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data?.statusCode === 200 && Array.isArray(response.data.data)) {
          setUnitOfSale(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching units:", error);
      }
    };

    fetchUnitOfSale();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = await localforage.getItem("jwtToken");
        if (!token) throw new Error("No authentication token found");

        const response = await axios.get(`${API_BASE_URL}api/Crackers/GetCategories`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { CompanyId: 2 },
        });

        // Normalize categories data
        const categoriesData = (response.data?.data || response.data?.result || response.data || [])
          .map(cat => ({
            id: cat.id || cat.categoryId || cat._id,
            name: cat.name || cat.categoryName || cat.title
          }))
          .filter(cat => cat.id && cat.name);

        setCategories(categoriesData);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const token = await localforage.getItem("jwtToken");
        if (!token) throw new Error("No authentication token found");

        const response = await axios.get(`${API_BASE_URL}api/Crackers/GetProductSummary`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { CompanyId: 2 },
        });

        setProducts(response.data?.result || []);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle form submission
  const handleAddProduct = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const token = await localforage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token found");

      const formData = new FormData();
      formData.append("CategoryId", selectedCategory);
      formData.append("ProdName", productName.trim());
      formData.append("ProdPrice", parseFloat(productPrice));
      formData.append("DiscountPercentage", parseFloat(discount) || 0);
      formData.append("companyId", 2);
      formData.append("OpeningStock", openingStock ? parseInt(openingStock, 10) : 0);
      formData.append("unitID", selectedUnitId);
      formData.append("pieces", pieces);
      formData.append("expiryDate", expiryDate);

      if (image && typeof image !== "string") {
        formData.append("ProdImage", image);
      }
      if (typeof image === "string" && image.trim() !== "") {
        formData.append("ProdImageUrl", image.trim());
      }

      if (editId) formData.append("id", editId);
      if (ratePer) formData.append("ratePer", ratePer);

      await axios.post(`${API_BASE_URL}api/Crackers/AddOrUpdateProduct`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Refresh product list
      const productsResponse = await axios.get(`${API_BASE_URL}api/Crackers/GetProductSummary`, {
        params: { companyId: 2 },
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts(productsResponse.data?.result || []);
      resetForm();
      alert(`Product ${editId ? "updated" : "added"} successfully!`);
    } catch (error) {
      console.error("Error saving product:", error);
      alert(`Failed to ${editId ? "update" : "add"} product: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    if (!productName.trim()) {
      alert("Please enter a product name.");
      return false;
    }
    if (!productPrice || isNaN(parseFloat(productPrice))) {
      alert("Please enter a valid product price.");
      return false;
    }
    if (!selectedCategory) {
      alert("Please select a category.");
      return false;
    }
    if (!selectedUnitId) {
      alert("Please select a unit of sale.");
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setProductName("");
    setProductPrice("");
    setDiscount("");
    setImage("");
    setOpeningStock("");
    setExpiryDate("");
    setPieces("");
    setEditId(null);
    setSelectedCategory("");
    setSelectedUnitId("");
    setPreviewUrl("");
    setRatePer("");
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = "";
  };

  const handleEdit = async (id) => {
    try {
      setIsLoading(true);
      const token = await localforage.getItem("jwtToken");
      if (!token) {
        alert("Session expired. Please login again.");
        window.location.href = "/login";
        return;
      }

      const response = await axios.get(`${API_BASE_URL}api/Crackers/GetProductById`, {
        params: { productId: id },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.statusCode === 200 && response.data.data) {
        const product = response.data.data;
        setProductName(product.prodName || "");
        setProductPrice(product.prodPrice || "");
        setDiscount(product.discountPercentage || "");
        setImage(product.prodImage?.trim() || "");
        setPreviewUrl(product.prodImage?.trim() || "");
        setOpeningStock(product.openingStock || "");
        setPieces(product.pieces || "");
        setExpiryDate(product.expiryDate ? product.expiryDate.split("T")[0] : "");
        setSelectedCategory(product.categoryId?.toString() || "");
        setSelectedUnitId(product.unitID || "");
        setEditId(id);
      }
    } catch (error) {
      console.error("Error loading product:", error);
      alert("Failed to load product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this product?")) return;

  try {
    const token = await localforage.getItem("jwtToken");
    if (!token) {
      alert("Not authenticated. Please log in.");
      window.location.href = "/login";
      return;
    }

    // Make the delete request
    const deleteResponse = await axios.post(
      `${API_BASE_URL}api/Crackers/DeleteProduct`,
      { productId: id },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (deleteResponse.data.statusCode === 200) {
      // Immediately remove the item from local state for better UX
      setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
      
      // Then refresh from server to ensure consistency
      try {
        const productsResponse = await axios.get(
          `${API_BASE_URL}api/Crackers/GetProductSummary`, 
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { CompanyId: 2 } // Make sure to include CompanyId
          }
        );

        // Handle different possible response structures
        const productsData = productsResponse.data?.result || 
                           productsResponse.data?.data || 
                           productsResponse.data || 
                           [];
        
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (refreshError) {
        console.error("Error refreshing products:", refreshError);
        // We already updated the UI, so just log the error
      }
      
      alert("Product deleted successfully!");
    } else {
      throw new Error(deleteResponse.data.statusDesc || "Failed to delete product");
    }
  } catch (error) {
    console.error("Delete error:", error);
    alert(error.response?.data?.statusDesc || "Failed to delete product. Please try again.");
    
    // Refresh the list anyway to ensure we're in sync with the server
    try {
      const token = await localforage.getItem("jwtToken");
      if (token) {
        const productsResponse = await axios.get(
          `${API_BASE_URL}api/Crackers/GetProductSummary`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { CompanyId: 2 }
          }
        );
        setProducts(productsResponse.data?.result || []);
      }
    } catch (refreshError) {
      console.error("Error during refresh after failed delete:", refreshError);
    }
  }
};

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 300 * 1024) {
      alert("Image must be smaller than 300KB");
      return;
    }

    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <>
      <Layout />
      <div style={styles.container}>
        <div style={styles.titleContainer}>
          <div style={{ ...styles.filterRow, justifyContent: "right", marginTop: "10px" }}>
            <button 
              onClick={handleAddProduct} 
              style={{ ...styles.addButton, width: "auto", minWidth: "120px" }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : (editId ? "Update Product" : "Add Product")}
            </button>
          </div>
        </div>

        {/* Add/Edit Product Form */}
        <div style={styles.filterContainer}>
          <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Category:</label>
              <div style={{ position: "relative", flex: 1 }}>
                <div
                  style={{
                    ...baseInputStyle,
                    backgroundColor: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    paddingRight: "25px"
                  }}
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  onKeyDown={(e) => e.key === "Enter" && setIsCategoryOpen(!isCategoryOpen)}
                  role="combobox"
                  aria-expanded={isCategoryOpen}
                  tabIndex="0"
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", fontSize: "10px" }}>
                    {selectedCategory
                      ? categories.find(c => c.id.toString() === selectedCategory.toString())?.name
                      : "Select Category"}
                  </span>
                  <span style={{ transform: isCategoryOpen ? "rotate(180deg)" : "none" }}>
                    ▼
                  </span>
                </div>

                {isCategoryOpen && (
                  <div style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    maxHeight: "200px",
                    overflowY: "auto",
                    backgroundColor: "#fff",
                    border: "1px solid #000",
                    borderRadius: "5px",
                    marginTop: "2px",
                    zIndex: 1000,
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                  }}>
                    <div style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                      <input
                        type="text"
                        placeholder="Search categories..."
                        style={{
                          width: "100%",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          border: "1px solid #ddd",
                          fontSize: "10px"
                        }}
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                      />
                    </div>
                    <ul style={{ listStyle: "none", padding: 0, fontSize: "10px", margin: 0 }}>
                      {filteredCategories.length === 0 ? (
                        <li style={{ padding: "10px", color: "#999",    fontSize: "10px",textAlign: "center" }}>
                          No matching categories
                        </li>
                      ) : (
                        filteredCategories.map((category) => (
                          <li
                            key={category.id}
                            onClick={() => {
                              setSelectedCategory(category.id.toString());
                              setIsCategoryOpen(false);
                              setCategorySearch("");
                            }}
                            style={{
                              padding: "8px 12px",
                              cursor: "pointer",
                              fontSize: "10px",
                              backgroundColor: selectedCategory === category.id.toString()
                                ? "#f0f0f0"
                                : "white",
                              borderBottom: "1px solid #eee",
                              ':hover': {
                                backgroundColor: "#f5f5f5"
                              }
                            }}
                          >
                            {category.name}
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Product Name:</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                style={styles.input}
                placeholder="Enter name"
                required
              />
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Units:</label>
              <select
                value={selectedUnitId}
                onChange={(e) => setSelectedUnitId(e.target.value)}
                style={styles.select}
                required
              >
                <option value="">Select Unit</option>
                {unitOfSale.map((unit) => (
                  <option key={unit.unitID} value={unit.unitID}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Pieces:</label>
              <input
                type="number"
                value={pieces}
                onChange={(e) => setPieces(e.target.value)}
                style={styles.input}
                placeholder="Enter pieces"
                min="0"
                required
              />
            </div>
          </div>

          <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Price (₹):</label>
              <input
                type="number"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                style={styles.input}
                placeholder="Enter price"
                min="0"
                step="0.01"
                required
              />
            </div>

           <div style={styles.filterGroup}>
  <label style={styles.filterLabel}>Discount (%):</label>
  <input
    type="number"
    value={discount}
    onChange={(e) => setDiscount(e.target.value)}
    style={styles.input}
    placeholder="e.g. 10"
    min="0"
    max="100"
    step="10"
  />
</div>


            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Opening Stock:</label>
              <input
                type="number"
                value={openingStock}
                onChange={(e) => setOpeningStock(e.target.value)}
                style={styles.input}
                placeholder="Initial stock"
                min="0"
              />
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
                id="file-input"
              />
              <div style={styles.fileInputDisplay}>
                {previewUrl ? (
                  <>
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.imageLink}
                    >
                      View Image
                    </a>
                    <span
                      onClick={() => {
                        setImage("");
                        setPreviewUrl("");
                        document.getElementById("file-input").value = "";
                      }}
                      style={styles.removeImage}
                      title="Remove image"
                    >
                      ×
                    </span>
                  </>
                ) : (
                  <label
                    htmlFor="file-input"
                    style={styles.browseButton}
                  >
                    Choose Image
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>S.No</th>
                <th style={styles.th}>Product No</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Product Name</th>
                <th style={styles.th}>Units</th>
                <th style={styles.th}>Pieces</th>
                <th style={styles.th}>Price (₹)</th>
                <th style={styles.th}>Discount (%)</th>
                <th style={styles.th}>Image</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" style={styles.loadingRow}>
                    Loading products...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="10" style={styles.errorRow}>
                    {error}
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="10" style={styles.noDataRow}>
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product, index) => (
                  <tr key={product.productId}>
                    <td style={styles.tdCenter}>{index + 1}</td>
                    <td style={styles.tdCenter}>{product.productId}</td>
                    <td style={styles.td}>{product.categoryName}</td>
                    <td style={styles.td}>{product.prodName}</td>
                    <td style={styles.td}>{product.unitName}</td>
                    <td style={styles.tdCenter}>
                      {product.pieces ? `${product.pieces} Pieces` : '-'}
                    </td>
                    <td style={styles.tdCenter}>{product.prodPrice?.toFixed(2) || "0.00"}</td>
                    <td style={styles.tdCenter}>{product.discountPercentage || "0"}%</td>
                    <td style={styles.tdCenter}>
                      {product.prodImage?.trim() ? (
                        <img
                          src={product.prodImage.trim().startsWith("http")
                            ? product.prodImage.trim()
                            : `${API_BASE_URL}${product.prodImage.trim()}`}
                          alt="Product"
                          style={styles.productImage}
                        />
                      ) : (
                        <span style={styles.noImage}>No Image</span>
                      )}
                    </td>
                    <td style={styles.tdCenter}>
                      <div style={styles.actionContainer}>
                        <button
                          onClick={() => handleEdit(product.id)}
                          style={styles.editButton}
                          title="Edit"
                          disabled={isLoading}
                        >
                          <FiEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          style={styles.deleteButton}
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

// Styles (same as before)
const styles = {
  container: {
    padding: "10px",
    maxHeight: "400px",
  },
  titleContainer: {
    padding: "2px",
    borderRadius: "4px",
    textAlign: "left",
    marginBottom: "10px",
  },
  filterContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
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
    justifyContent: "space-between",
    width: "100%",
  },
  filterGroup: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    flex: "1 1 200px",
    minWidth: "200px",
  },
  filterLabel: {
    fontWeight: "bold",
    fontSize: "12px",
    width: "120px",
    color: "#333",
    flexShrink: 0,
  },
  input: {
    flex: "1",
    padding: "6px",
    borderRadius: "5px",
    border: "1px solid #000",
    fontSize: "12px",
    height: "32px",
    boxSizing: "border-box",
    minWidth: "150px",
  },
  select: {
    flex: "1",
    padding: "6px",
    borderRadius: "5px",
    border: "1px solid #000",
    fontSize: "12px",
    height: "32px",
    boxSizing: "border-box",
    backgroundColor: "white",
    minWidth: "150px",
  },
  addButton: {
    backgroundColor: "rgb(128, 0, 0)",
    border: "none",
    color: "white",
    cursor: "pointer",
    padding: "8px",
    width: "auto",
    minWidth: "100px",
    fontWeight: "bold",
    fontSize: "12px",
    alignSelf: "right",
    borderRadius: "4px",
    fontFamily: "inherit",
  },
  tableContainer: {
    maxHeight: "300px",
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
  productImage: {
    width: "30px",
    height: "30px",
    objectFit: "cover",
    borderRadius: "4px",
    border: "1px solid #ddd",
    backgroundColor: "#f0f0f0",
  },
  noImage: {
    fontSize: "12px",
    color: "#999",
  },
  actionContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
  },
  editButton: {
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
    backgroundColor: "#bbbdbeff",
    color: "white",
  },
  deleteButton: {
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
    backgroundColor: "#dc3545",
    color: "white",
  },
  noDataRow: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    padding: "1rem",
  },
  loadingRow: {
    textAlign: "center",
    padding: "1rem",
  },
  errorRow: {
    textAlign: "center",
    color: "#dc3545",
    padding: "1rem",
  },
  fileInputDisplay: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: "8px",
    flex: 1,
    padding: "6px",
    borderRadius: "5px",
    border: "1px solid #000",
    fontSize: "12px",
    height: "32px",
    boxSizing: "border-box",
    backgroundColor: "white",
  },
  imageLink: {
    fontSize: "13px",
    color: "#0066cc",
    textDecoration: "underline",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  removeImage: {
    fontSize: "16px",
    color: "#dc3545",
    fontWeight: "bold",
    cursor: "pointer",
    width: "16px",
    height: "16px",
    textAlign: "center",
    border: "1px solid #dc3545",
    borderRadius: "50%",
    lineHeight: "14px",
  },
  browseButton: {
    cursor: "pointer",
    padding: "4px 8px",
    backgroundColor: "#e9ecef",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "13px",
  },
};

export default AdminProduct;
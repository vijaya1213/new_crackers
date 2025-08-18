import React, { useRef, useEffect, useState } from "react";
import {
  FaBox,
  FaTruck,
  FaClipboardList,
  FaFire,
  FaChartLine,
  FaWarehouse,
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaCheckCircle,
  FaBoxes,
  FaShoppingCart,
  FaCheckSquare,
  FaTimesCircle,
  FaCalendarAlt,
  FaUsers,
  FaStar,
  FaRegStar,
  FaBolt,
  FaHourglassHalf
} from "react-icons/fa";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PieController } from 'chart.js';
import { Pie } from "react-chartjs-2";
import Layout from "./AdminLayouts";
import axios from "axios";
import localforage from "localforage";
import API_BASE_URL from "./apiConfig";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PieController
);

const FireworksDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Refs for chart instances
  const pieChartRef = useRef(null);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
  try {
    setLoading(true);
    const token = await localforage.getItem('jwtToken');
    const response = await axios.get(
      `${API_BASE_URL}api/Crackers/GetDashboardOrderStatus?companyId=2`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (response.data.statusCode === 200) {
      setDashboardData(response.data.data);
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  } finally {
    setLoading(false);
  }
};


    fetchDashboardData();
  }, []);

  // Cleanup charts on unmount
  useEffect(() => {
    return () => {
      if (pieChartRef.current) {
        pieChartRef.current.destroy();
      }
    };
  }, []);

  if (loading || !dashboardData) {
    return (
      <>
        <Layout />
        <div style={styles.container}>
          <div style={styles.loading}>Loading dashboard...</div>
        </div>
      </>
    );
  }


const allRecentOrders = [...dashboardData.latestPendingDispatchOrders]
  .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)) // Newest first
  .slice(0, 10); // Get more recent orders first (in case few are high-value)

const pendingDispatchOrders = allRecentOrders
  .filter(order => order.payableAmount >= 100000) // 👈 Only high-value orders
  .sort((a, b) => b.payableAmount - a.payableAmount) // Highest amount first
  .slice(0, 4); // Show max 4

const recentOrders = allRecentOrders
  .map(order => ({
    id: order.orderId,
    customer: `${order.customerName}`,
    amount: order.payableAmount,
    status: "processing",
    date: order.orderDate
  }))
  .slice(0, 5); // ✅ Show only the first 5 (latest) orders
  

  return (
    <>
      <Layout />
      <div style={styles.container}>
        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryContent}>
              <h3 style={styles.summaryTitle}>Total Orders</h3>
              
            <p style={styles.summaryChange}>
  ₹{dashboardData.totalOrderAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
</p>

              <p style={styles.summaryNumber}>{dashboardData.totalOrders} Orders</p>
            </div>
            <FaBoxes style={styles.summaryIcon} />
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.summaryContent}>
              <h3 style={styles.summaryTitle}>Pending Orders</h3>
              
           <p style={styles.summaryChange}>
  ₹{dashboardData.paidButNotDispatched.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
</p>

              <p style={styles.summaryNumber}>{dashboardData.paidButNotDispatched.count} Orders</p>
            </div>
            <FaHourglassHalf style={styles.summaryIcon} />
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.summaryContent}>
              <h3 style={styles.summaryTitle}>Order Dispatch</h3>
              
            <p style={styles.summaryChange}>
  ₹{dashboardData.dispatchedOrders.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
</p>

              <p style={styles.summaryNumber}>{dashboardData.dispatchedOrders.count} Orders</p>
            </div>
            <FaTruck style={styles.summaryIcon} />
          </div>
      
        </div>

        {/* Bottom Section - Top Selling and Recent Orders */}
        <div style={styles.bottomSection}>
          {/* Track Order And Payments */}
         {/* Track Order And Payments */}
<div style={styles.bottomSectionItem}>
  <h2 style={styles.sectionTitle}>
    <FaFire style={{ ...styles.sectionIcon, color: "#FF5722" }} /> 
    Highest Payment Received
  </h2>

  <div style={styles.topSellingContainer}>
    {pendingDispatchOrders && pendingDispatchOrders.length > 0 ? (
      pendingDispatchOrders.map((order, index) => (
        <div key={index} style={styles.topSellingItem}>
          <div style={styles.topSellingRank}>
            #{index + 1}
          </div>
          <div style={styles.topSellingContent}>
            <div style={{ fontWeight: "600", fontSize: "14px" }}>{order.orderId}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              {order.firstName} {order.lastName}
            </div>
          </div>
       <div style={{...styles.topSellingStock, fontSize: "14px", fontWeight: "600", color: "#4CAF50"}}>
  ₹{order.payableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
</div>

        </div>
      ))
    ) : (
      <div style={{ textAlign: "center", color: "#999", padding: "10px" ,marginTop:"70px"}}>
        No data available
      </div>
    )}
  </div>
</div>


          {/* Recent Orders */}
          <div style={styles.bottomSectionItem}>
            <h2 style={styles.sectionTitle}>
              <FaClipboardList style={styles.sectionIcon} /> Recent Orders
            </h2>
            <div style={styles.ordersContainer}>
              {recentOrders.map(order => (
                <div key={order.id} style={styles.orderItem}>
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "14px" }}>Order #{order.id}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      {order.customer} • {new Date(order.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                   <div style={{ fontWeight: "600", fontSize: "14px" }}>
  ₹{order.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
</div>

                    <div style={{
                      fontSize: "12px",
                      color: order.status === "delivered" ? "#4CAF50" : 
                            order.status === "shipped" ? "#2196F3" : "#FF9800",
                      fontWeight: "600"
                    }}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const styles = {
  container: {
    fontFamily: "'Poppins', sans-serif",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    padding: "20px",
    color: "#333",
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "200px",
    fontSize: "16px",
    color: "#666",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  summaryCard: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    // ✅ Base shadow
    boxShadow: "0 4px 6px -1px rgba(193, 75, 75, 1), 0 2px 4px -1px rgba(247, 124, 124, 0.75)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "all 0.3s ease",
    cursor: "pointer",
    border: "1px solid #f0f0f0",
    ":hover": {
      transform: "translateY(-6px)",
      // ✅ Stronger red-tinted shadow on hover
      boxShadow: `
        0 10px 25px -5px rgba(237, 122, 122, 1),
        0 5px 10px -5px rgba(233, 96, 96, 1)
      `,
      border: "1px solid rgb(128, 0, 0)", // ✅ Fixed: single border definition
    },
  },
  summaryTitle: {
    fontSize: "18px",
    fontWeight: "600",
    margin: "0",
    color: "#333",
  },
  summaryContent: {
    display: "flex",
    flexDirection: "column",
  },
  summaryNumber: {
    fontSize: "16px",
    fontWeight: "500",
    margin: "6px 0 0",
    color: "#555",
  },
  summaryChange: {
    fontSize: "20px",
    color: "rgb(128, 0, 0)",
    fontWeight: "600",
  },
  summaryIcon: {
    fontSize: "32px",
    color: "rgb(128, 0, 0)",
    opacity: 0.9,
  },
  bottomSection: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },
  bottomSectionItem: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "16px",
    // ✅ Base shadow
    boxShadow: "0 4px 12px -2px rgba(219, 97, 97, 1), 0 1px 3px rgba(228, 90, 90, 1)",
    border: "1px solid #f0f0f0",
    transition: "all 0.3s ease",
    ":hover": {
      transform: "translateY(-4px)",
      // ✅ Slightly red-tinted shadow
      boxShadow: `
        0 12px 25px -5px rgba(128, 0, 0, 0.15),
        0 6px 12px -6px rgba(0, 0, 0, 0.1)
      `,
      border: "1px solid rgb(128, 0, 0)", // ✅ Consistent border on hover
    },
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "rgb(128, 0, 0)",
    margin: "0 0 12px 0",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  sectionIcon: {
    fontSize: "18px",
    color: "rgb(128, 0, 0)",
  },
  topSellingContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  topSellingItem: {
    display: "flex",
    alignItems: "center",
    padding: "12px",
    borderRadius: "8px",
    backgroundColor: "#fdfafa",
    border: "1px solid #f0e0e0",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.03)",
    transition: "all 0.25s ease",
    ":hover": {
      backgroundColor: "#f8f0f0",
      border: "1px solid rgb(128, 0, 0)",
      transform: "translateX(2px)",
      boxShadow: "0 4px 8px -2px rgba(128, 0, 0, 0.1)",
    },
  },
  topSellingRank: {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    backgroundColor: "rgb(128, 0, 0)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "12px",
    fontSize: "12px",
    fontWeight: "bold",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  },
  topSellingContent: {
    flex: 1,
  },
  topSellingStock: {
    fontSize: "14px",
    fontWeight: "600",
    color: "rgb(128, 0, 0)",
  },
  ordersContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  orderItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    borderRadius: "8px",
    backgroundColor: "#fdfafa",
    border: "1px solid #f0e0e0",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.02)",
    transition: "all 0.25s ease",
    ":hover": {
      backgroundColor: "#f8f0f0",
      border: "1px solid rgb(128, 0, 0)",
      transform: "translateX(2px)",
      boxShadow: "0 4px 8px -2px rgba(128, 0, 0, 0.1)",
    },
  },
};
export default FireworksDashboard;
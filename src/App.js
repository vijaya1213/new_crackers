import React from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
// Import your screens
import Home from './Screens/Home';
import AdminLogin from './Screens/AdminLogin';
import Dashboard from './Screens/Dashboard';
import Product from './Screens/Products';
import ViewCart from './Screens/ViewCart';
import Admin_Category from './Screens/Admin_Category';
import Admin_Product from './Screens/Admin_Product';
import Admin_Order from './Screens/Admin_Order';
import SafetyTips from "./Screens/SafetyTips";
import Admin_OrderView from './Screens/Admin_OrderView';
import AboutUs from "./Screens/AboutUs";
import QuickPurchase from "./Screens/QuickPurchase";
import Contact from "./Screens/ContactUs";
import Admin_Reports from "./Screens/Admin_Reports";


function App() {
  return (
    <div className="main-content">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs/>} />
        <Route path="/product" element={<Product />} />
        <Route path="/safety" element={<SafetyTips/>} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/viewCart" element={<ViewCart />} />
        <Route path="/AdminLogin" element={<AdminLogin />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Admin_Category" element={<Admin_Category />} />
        <Route path="/Admin_Product" element={<Admin_Product />} />
        <Route path="/Admin_Order" element={<Admin_Order />} />
        <Route path="/Admin_OrderView" element={<Admin_OrderView />} />
        <Route path="/admin/orders/:id" element={<Admin_OrderView />} />
        <Route path="/quick-purchase" element={<QuickPurchase />} />
         <Route path="/Admin_Reports" element={<Admin_Reports />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
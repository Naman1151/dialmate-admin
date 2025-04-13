// src/components/Sidebar.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BedDouble,
  Building2,
  CalendarCheck2,
  Phone,
  Activity,
  LogOut,
  Menu,
} from "lucide-react";

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menus = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Users", path: "/users", icon: Users },
    { name: "Rooms", path: "/rooms", icon: BedDouble },
    { name: "Departments", path: "/departments", icon: Building2 },
    { name: "Bookings", path: "/bookings", icon: CalendarCheck2 },
    { name: "Calls", path: "/calls", icon: Phone },
    { name: "Activities", path: "/activities", icon: Activity },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""} flex flex-col`}>
      {/* Top: Logo + Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        <span className="text-lg font-semibold select-none">
          {collapsed ? "DM" : "DialMate"}
        </span>
        <button onClick={() => setCollapsed(!collapsed)}>
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Menu Items */}
      <div className="flex-1 mt-4">
        {menus.map((menu, index) => {
          const isActive = location.pathname === menu.path;
          const Icon = menu.icon;

          return (
            <div
              key={index}
              onClick={() => navigate(menu.path)}
              className={`menu-item transition-colors duration-200 ${
                isActive ? "active" : ""
              }`}
            >
              <Icon className="menu-icon" />
              {!collapsed && <span className="menu-text">{menu.name}</span>}
            </div>
          );
        })}
      </div>

      {/* Logout */}
      <div
        onClick={handleLogout}
        className="menu-item text-red-400 hover:text-red-600 mb-4"
      >
        <LogOut className="menu-icon" />
        {!collapsed && <span className="menu-text">Logout</span>}
      </div>
    </div>
  );
}

export default Sidebar;
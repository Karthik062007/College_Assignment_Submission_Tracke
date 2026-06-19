import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FiBarChart2, FiBookOpen, FiUsers, FiFileText, FiMenu } from "react-icons/fi";
import "./MenuBar.css";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: FiBarChart2 },
  { label: "Assignments", path: "/assignments", icon: FiBookOpen },
  { label: "Students", path: "/students", icon: FiUsers },
  { label: "Reports", path: "/reports", icon: FiFileText },
];

export default function MenuBar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="menu-bar">
      <div className="menu-inner">
        <div className="brand">College ERP</div>
        <button className="hamburger" aria-label="Toggle menu" onClick={() => setOpen((value) => !value)}>
          <FiMenu />
        </button>

        <div className={`menu-items ${open ? "open" : ""}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `menu-item${isActive ? " active" : ""}`}
                onClick={() => setOpen(false)}
              >
                <Icon className="menu-icon" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

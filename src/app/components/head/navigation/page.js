"use client";
import React, { useState, useEffect } from "react";
import "../../../../../node_modules/bootstrap/dist/css/bootstrap.css";

import { MdDashboardCustomize } from "react-icons/md";
import { TbReportSearch } from "react-icons/tb";
import { FaUsers } from "react-icons/fa";

export default function Navigation({ toggleSidebar, sidebarToggled }) {

    const [windowWidth, setWindowWidth] = useState(0);
    const [openDropdown, setOpenDropdown] = useState(null);

    const [activePage, setActivePage] = useState("");

    const [role, setRole] = useState(null);



    useEffect(() => {
        if (typeof window !== 'undefined') {
            setWindowWidth(window.innerWidth);
            const handleResize = () => {
                setWindowWidth(window.innerWidth);
                if (window.innerWidth < 768) {
                    toggleSidebar(false);
                }
            };
            window.addEventListener("resize", handleResize);
            return () => window.removeEventListener("resize", handleResize);
        }
    }, [toggleSidebar]);



    useEffect(() => {
        const path = window.location.pathname;
        if (path.includes("/cpanel")) setActivePage("cpanel");
        else if (path.includes("/Ecreate")) setActivePage("Ecreate");
        else if (path.includes("/summary")) setActivePage("summary");
    }, []);

    const handleSubToggle = (dropdownId) => {
        setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
    };



    useEffect(() => {
        const storedRole = localStorage.getItem("role");
        setRole(storedRole);
    }, []);

    if (!role) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <div className={`navbar-nav bg-primary sidebar sidebar-dark accordion ${sidebarToggled ? "toggled" : ""}`} id="accordionSidebar">


                <li className={`nav-item ${activePage === "cpanel" ? "active" : ""}`}>
                    <a className="nav-link" href="/cpanel">
                        <MdDashboardCustomize />
                        <span> Dashboard</span>
                    </a>
                </li>
                <hr className="sidebar-divider" />
                <div className="sidebar-heading">Interface</div>

                <li className={`nav-item ${activePage === "summary" ? "active" : ""}`}>
                    <a className="nav-link" href="/summary">
                        <TbReportSearch />
                        <span> Reports</span>
                    </a>
                </li>

                <hr className="sidebar-divider d-none d-md-block" />

                {role === "Admin" && (

                    <li className={`nav-item ${activePage === "Ecreate" ? "active" : ""}`}>
                        <a className="nav-link" href="/Ecreate">
                            <FaUsers />
                            <span> Users</span>
                        </a>
                    </li>
                )}



            </div>
        </>
    );
}

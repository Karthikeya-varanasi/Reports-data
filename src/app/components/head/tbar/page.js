"use client";
// import "@fortawesome/fontawesome-free/css/all.min.css";
import { Router } from "next/router";
import { FaPowerOff } from "react-icons/fa";
import { IoMenu } from "react-icons/io5";
import { useRouter } from "next/navigation";
export default function Tbar({ toggleSidebar }) {


    const router = useRouter();
    const Logout = () => {
        router.push('/');
    };
    return (
        <>
            <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4  shadow justify-content-between">
                <button id="sidebarToggleTop" className="btn btn-link rounded-circle " onClick={toggleSidebar}>
                    <IoMenu />
                </button>
                
                <div className="sidebar-brand-text my-3"><span style={{ color: "#0d6efd", fontWeight: 400, textTransform:"uppercase", fontFamily: " sans-serif"}}>Hola, Welcome To DiNJiT</span></div>
                <ul className="navbar-nav ml-auto">
                    <li className="nav-item dropdown no-arrow float-end">
                        <a className="nav-link" href="#" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <span className="d-lg-inline text-gray-600 small text-dark pr-2" onClick={Logout} >
                                LogOut 
                            </span>
                            <FaPowerOff />
                        </a>
                    </li>
                </ul>
            </nav>
        </>
    );
}

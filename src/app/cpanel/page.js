"use client"
import React, {useState, useEffect} from "react";
import Aconsle from "../components/aconsle/page";
import Uconsle from "../components/uconsle/page";

export default function Cpanel() {
    const [role, setRole] = useState(null);
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedRole = localStorage.getItem("role");
            setRole(storedRole);
            setIsMounted(true);
        }
    }, []);
    if (!isMounted) {
        return <div>Loading...</div>; 
    }
    return (
        <>
         {role === "user" ? <Uconsle /> : <Aconsle />}
        </>
    );
}


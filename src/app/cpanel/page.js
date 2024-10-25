"use client"
import React, { useState, useEffect } from "react";

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

    const Aconsle = React.lazy(() => import("../components/aconsle/page"));
    const Uconsle = React.lazy(() => import("../components/uconsle/page"));

    return (
        <React.Suspense fallback={<div>Loading Console...</div>}>
            {role === "user" ? <Uconsle /> : <Aconsle />}
        </React.Suspense>
    );
}

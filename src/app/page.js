"use client";
import { useState } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { useRouter } from 'next/navigation';

export default function Home() {
  const [Username, setUsername] = useState("");
  const [Password, setPassword] = useState("");
  const [Msg, setMsg] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/accessapi", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ Username, Password }),
    });

    const data = await res.json();
    const role = data.user?.Accesstype || "guest";

    if (res.ok) {
      localStorage.setItem("Username", Username);
      localStorage.setItem("role", role);
      setMsg(`Success: ${data.Msg}`);
      router.push("/cpanel");
    } else if (res.status === 403) {
      setMsg(`Error: ${data.Msg}`);
    } else {
      setMsg(`Error: ${data.Msg}`);
    }
  };

  return (
    <>
      <div className="dg_form_handler">
        {Msg && (
          <div className="alert alert-info Msg">
            <p>{Msg}</p>
          </div>
        )}
        <form className="form" onSubmit={handleSubmit}>
          <div className="flex-column">
            <label>Username</label>
          </div>
          <div className="inputForm">
            <FaRegUserCircle />
            <input
              type="text"
              className="input"
              id="Username"
              value={Username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </div>
          <div className="flex-column">
            <label>Password</label>
          </div>
          <div className="inputForm">
            <svg
              height="20"
              viewBox="-64 0 512 512"
              width="20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0"></path>
              <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0"></path>
            </svg>
            <input
              type="Password"
              className="input"
              id="Password"
              value={Password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your Password"
            />
          </div>

          <button type="submit" className="button-submit">
            Sign In
          </button>
        </form>
      </div>
    </>
  );
}
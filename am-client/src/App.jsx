import React, { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles.css";
import { letterSets } from './constants';
import Cookies from "universal-cookie";
import { useStateContext } from './contexts/ContextProvider';


import { Home, Game, Login, SignUp } from './components';

export default function App() {
    const size = 6;
    const letterSet = letterSets[Math.floor(Math.random() * letterSets.length)];

    const api_key = "egbeshbpypm3";
    const cookies = new Cookies();
    const token = cookies.get("token");
    const [isAuth, setIsAuth] = useState(false);

    // connect user to account
    if (token) {
        fetch("http://localhost:3001/me", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => {
                if (!res.ok) throw new Error("Invalid token");
                return res.json();
            })
            .then(data => {
                const user = data.user;
                setIsAuth(true);
                setActiveUser(user.username);
                // Save other user data you want to state if needed
            })
            .catch(() => {
                // Token invalid or expired — force logout or clear cookies
                cookies.remove("token");
                setIsAuth(false);
            });
    }

    const logout = () => {
        cookies.remove("token");
        cookies.remove("username");
        cookies.remove("id");
        setIsAuth(false);
    }

    return (
        <div>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login />}></Route>
                    <Route path="/home" element={
                        isAuth ? <Home onLogout={logout} /> :
                            <Login setIsAuth={setIsAuth} />}></Route>
                    <Route path="/game" element={<Game size={size} letterSet={letterSet} />}></Route>
                    <Route path="/login" element={<Login setIsAuth={setIsAuth} />}></Route>
                    <Route path="/signup" element={<SignUp
                        setIsAuth={setIsAuth} />}></Route>


                </Routes>
            </BrowserRouter>
        </div>
    )
}

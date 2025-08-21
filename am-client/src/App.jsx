import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles.css";
import { letterSets } from './constants';
import Cookies from "universal-cookie";
import { useStateContext } from './contexts/ContextProvider';


import { Home, Game, Login, SignUp } from './components';

export default function App() {
    const size = 6;
    const letterSet = letterSets[Math.floor(Math.random() * letterSets.length)];

    const cookies = new Cookies();
    const token = cookies.get("token");
    const [isAuth, setIsAuth] = useState(false);
    const { activeUser, setActiveUser, route, setRoute } = useStateContext();
    // connect user to account
    useEffect(() => {
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
                    setActiveUser(user);
                    console.log("User data fetched: ", user);
                    // Save other user data you want to state if needed
                })
                .catch(() => {
                    // Token invalid or expired — force logout or clear cookies
                    cookies.remove("token");
                    setIsAuth(false);
                });
        }
    }, [token]); //TODO: Add some state that says refresh needs to be triggered

    const logout = () => {
        cookies.remove("token");
        cookies.remove("username");
        cookies.remove("id");
        setIsAuth(false);
    }

    switch (route) {
        case "login":
            return <Login setIsAuth={setIsAuth} />;
        case "signup":
            return <SignUp setIsAuth={setIsAuth} />;
        case "home":
            return <Home onLogout={logout} />;
        case "game":
            return <Game size={size} letterSet={letterSet} />;
        default:
            return <Login setIsAuth={setIsAuth} />;
    }


}

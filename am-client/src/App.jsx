import React, { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles.css";
import { letterSets } from './constants';
import { StreamChat } from "stream-chat"
import Cookies from "universal-cookie";
import { useStateContext } from './contexts/ContextProvider';


import { Home, Game, Login, SignUp } from './components';

import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

export default function App() {
    const size = 6;
    const letterSet = letterSets[Math.floor(Math.random() * letterSets.length)];

    const api_key = "egbeshbpypm3";
    const cookies = new Cookies();
    const client = StreamChat.getInstance(api_key);
    const token = cookies.get("token");
    const [isAuth, setIsAuth] = useState(false);

    // connect user to account
    if (token) {
        const name = cookies.get("username");
        client.connectUser({
            id: cookies.get("userId"),
            name,
            hashedPassword: cookies.get("hashedPassword"),
        }, token)
            .then((user) => {
                setIsAuth(true)
            })
    }
    const logout = () => {
        cookies.remove("token");
        cookies.remove("username");
        cookies.remove("password");
        cookies.remove("userId");
        cookies.remove("hashedPassword");
        client.disconnectUser();
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

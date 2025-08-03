import React, { useState, useEffect } from 'react'
import "./styles.css";
import { useNavigate } from 'react-router-dom';
import Axios from "axios";
import Cookies from "universal-cookie";
import { useStateContext } from '../contexts/ContextProvider';


const SignUp = ({ setIsAuth }) => {
    const cookies = new Cookies();
    const [user, setUser] = useState(null);
    const { activeUser, setActiveUser } = useStateContext();

    const navigate = useNavigate();

    const navigateTo = (link) => {
        navigate(link);
    }
    const signUp = () => {
        Axios.post("http://localhost:3001/signup", user)
            .then(res => {
                const { token, username, password, userId, hashedPassword } = res.data;
                cookies.set("token", token);
                cookies.set("username", username);
                cookies.set("password", password);
                cookies.set("userId", userId);
                cookies.set("hashedPassword", hashedPassword);
                setIsAuth(true);
                setActiveUser(username);
                navigateTo("/home");

            })
    }
    // handles key presses
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event && event.key === "Enter") {
                signUp();
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        handleKeyDown();
        return () => window.removeEventListener("keydown", handleKeyDown);
    }
    );
    return (
        <div className="main-login">
            <label>Sign up</label>
            <div className="login-inputs">
                <input placeholder='username' onChange={(event) => setUser({ ...user, username: event.target.value })}>
                </input>
                <input type="password" placeholder='password' onChange={(event) => setUser({ ...user, password: event.target.value })}>
                </input>
            </div>
            <button className="login-button" type="button" onClick={signUp}>Sign Up</button>
            <div>
                <span className="login-to-signup" >Go back to </span>
                <a href="/login">login</a>
            </div>
        </div>
    )
}

export default SignUp
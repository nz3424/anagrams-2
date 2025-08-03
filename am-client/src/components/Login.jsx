import React, { useState, useEffect } from 'react'
import "./styles.css";
import { useNavigate } from 'react-router-dom';
import Axios from "axios";
import Cookies from "universal-cookie";
import { useStateContext } from '../contexts/ContextProvider';


const Login = ({ setIsAuth }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const navigateTo = (link) => {
        navigate(link);
    }
    const { activeUser, setActiveUser } = useStateContext();

    const cookies = new Cookies();
    const login = () => {
        Axios.post("http://localhost:3001/login", { username, password })
            .then((res) => {
                console.log("Response from server: ", res);
                const { token, username, userId } = res.data;
                cookies.set("token", token);
                cookies.set("username", username);
                cookies.set("userId", userId);
                setIsAuth(true);
                setActiveUser(username);
                navigateTo("/home");
            })
            .catch((error) => {
                console.error("Login error: ", error);
                alert("Login failed. Please check your username and password.");
            }
            );
    }

    // handles key presses
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event && event.key === "Enter") {
                login();
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        handleKeyDown();
        return () => window.removeEventListener("keydown", handleKeyDown);
    }
    );
    return (
        <div className="main-login">
            <label>Login</label>
            <div className="login-inputs">
                <input placeholder='username' onChange={(event) => setUsername(event.target.value)}>
                </input>
                <input type="password" placeholder='password' onChange={(event) => setPassword(event.target.value)}>
                </input>
            </div>
            <button className="login-button" type="button" onClick={() => { login() }}>Login</button>
            <div>
                <span className="login-to-signup" >Don't have an account? Sign up </span>
                <a href="/signup">here</a>
            </div>

        </div>
    )
}

export default Login
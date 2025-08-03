import React, { useEffect, useState } from 'react';
import "./styles.css";
import { useNavigate } from 'react-router-dom';
import { FaPlay } from "react-icons/fa6";
import { letterSets } from '../constants';
import { useStateContext } from '../contexts/ContextProvider';
import Cookies from "universal-cookie";
import Axios from "axios";

const handlePostClick = (activeUser) => {
    Axios.post("http://localhost:3001/home", { score: '400', username: activeUser })
        .then(res => {
            console.log(res);
            // setLeaders(leaders.append(res))
        })
}


export default function Home({ onLogout }) {
    const [leaders, setLeaders] = useState();
    const { activeUser, setActiveUser } = useStateContext();

    /*   useEffect(() => {
           Axios.get("http://localhost:3001/home")
               .then(data => console.log(data))
       }, []);*/


    const navigate = useNavigate();

    const navigateTo = (link) => {
        navigate(link);
    }
    const logout = () => {
        console.log("Logging out");
        onLogout();
        navigateTo('/login');
    }
    return (
        <div className="main-home-bg">

            <div className="main-home-gamelogs">
                <p className="home-text">Pending Games</p>
                <button onClick={() => handlePostClick(activeUser)}>Post</button>
            </div>

            <div className="main-home-right">
                <div className="user-headline">
                    <span className="user-text">{activeUser}</span>
                    <button
                        onClick={() => logout()}>Logout</button>
                </div>
                <div className="main-home-extra">
                    <p className="home-text">Play</p>
                    <FaPlay
                        className="play-icon"
                        size='2vw'
                        onClick={() => navigateTo("/game")} />
                </div>
                <div className="main-home-stats"><p className="home-text">Statistics</p>
                    <div className="stats-body">
                        <div className="stats-text">
                            <p className="home-text-label">Record:</p>
                            <p>10-4</p>
                        </div>
                        <div className="stats-text">
                            <p className="home-text-label">Highest Score:</p>

                            <p>10-4</p>
                        </div>
                        <div className="stats-text"><p className="home-text-label">Games played:</p>
                            <p>10-4</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

import React, { useEffect, useState } from 'react';
import "./styles.css";
import { useNavigate } from 'react-router-dom';
import { FaPlay } from "react-icons/fa6";
import { letterSets } from '../constants';
import { useStateContext } from '../contexts/ContextProvider';
import Cookies from "universal-cookie";
import Axios from "axios";


export default function Home({ onLogout }) {
    const { activeUser, setRoute } = useStateContext();
    if (!activeUser) {
        return;
    }

    const logout = () => {
        onLogout();
        setRoute('login');
    }
    return (
        <div className="main-home-bg">

            <div className="main-home-gamelogs">
                <p className="home-text">Pending Games</p>
                <button onClick={() => handlePostClick(activeUser)}>Post</button>
            </div>

            <div className="main-home-right">
                <div className="user-headline">
                    <span className="user-text">{activeUser.username}</span>
                    <button
                        onClick={() => logout()}>Logout</button>
                </div>
                <div className="main-home-extra">
                    <p className="home-text">Play</p>
                    <FaPlay
                        className="play-icon"
                        size='2vw'
                        onClick={() => setRoute("game")} />
                </div>
                <div className="main-home-stats"><p className="home-text">Statistics</p>
                    <div className="stats-body">
                        <div className="stats-text">
                            <p className="home-text-label">Record:</p>
                            <p>10-4</p>
                        </div>
                        <div className="stats-text">
                            <p className="home-text-label">Highest Score:</p>

                            <p>{activeUser.high_score}</p>
                        </div>
                        <div className="stats-text"><p className="home-text-label">Games played:</p>
                            <p>{activeUser.games_played}</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

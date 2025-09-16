import React, { useEffect, useState } from 'react';
import "./styles.css";
import { useNavigate } from 'react-router-dom';
import { FaPlay } from "react-icons/fa6";
import { letterSets } from '../constants';
import { useStateContext } from '../contexts/ContextProvider';
import Cookies from "universal-cookie";
import Axios from "axios";
import Card from './Card';
import FriendsCard from './friends-card/FriendsCard';

export default function Home({ onLogout }) {
    const { activeUser, setRoute } = useStateContext();
    if (!activeUser) {
        return;
    }
    const logout = () => {
        onLogout();
        setRoute('login');
    }
    const mockFriends = ["Alice", "Bob", "Charlie"];
    const mockRequests = ["David", "Eve"];
    console.log("Active user in Home: ", activeUser);
    return (
        <div className="home-container">
            <div className="home-header">
                <div className="home-text">Anagrams</div>
                <div className="user-headline">
                    <div className="home-text user">
                        <p>{activeUser.username}</p>
                    </div>
                    <button
                        onClick={() => logout()}>Logout</button>
                </div>
            </div>
            <div className="home-body">
                <div className="home-grid-container">
                    <Card title="Play Now" content={<button
                        onClick={() => setRoute("game")}>Start game</button>} />
                </div>
                <div className="home-grid-container">
                    <Card title="Pending Challenges" content={<p className="home-text">Your challenges should be here</p>} />
                    <FriendsCard friends={mockFriends} requests={activeUser.requests} />
                </div>

                <div className="home-grid-container">
                    <Card title="Your Statistics" content={
                        <div style={{ width: '100%' }}>
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
                        </div>} />
                </div>
            </div >
        </div >
    )
}

import React, { useState } from 'react';
import "./styles.css";
import { NavLink } from 'react-router-dom';
import { FaPlay } from "react-icons/fa6";

export default function Home() {

    const onPlayHover = () => {
        setPlayFill("white");
    }
    return (
        <div className="main-home-bg">
            <div className="main-home-gamelogs">
                <p className="home-text">Pending Games</p>
            </div>
            <div className="main-home-right">
                <div className="main-home-extra">
                    <p className="home-text">Play</p>
                    <NavLink to="/game" className="play-button">
                        <span ><FaPlay className="play-icon" size='2vw' /></span>
                    </NavLink>
                </div>
                <div className="main-home-extra"><p className="home-text">Record</p></div>
            </div>
        </div>
    )
}


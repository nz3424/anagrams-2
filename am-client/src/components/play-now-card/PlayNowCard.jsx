import { useState, useEffect } from "react";
import Card from "../Card";
import "./play-now-card.css";
import { useStateContext } from '../../contexts/ContextProvider';

const PlayNowCard = () => {
    const { setRoute, setGameMode, setChallengeId, letterSets, setLetterSet } = useStateContext();

    const content =
        <div className="play-now-container">
            <div className="game-mode-container">
                <p className="play-now-text">Select game mode</p>
            </div>
            <button
                onClick={() => {
                    setLetterSet(letterSets[Math.floor(Math.random() * letterSets.length)]);
                    setRoute("game");
                    setGameMode("solo");
                }
                }>Start game</button>
        </div>
    return (
        <Card
            title="Play Now"
            content={content}
        />
    )
}

export default PlayNowCard
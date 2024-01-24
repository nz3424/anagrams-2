import React from 'react'
import "./styles.css";
import { NavLink } from 'react-router-dom';

const GameOver = ({ wordBank, score }) => {
    return (
        <div className="game-body">
            <div className="score-box">
                <span className="score-text">Score: </span>
                <span className="score-text">{score}</span>
            </div>
            <div className="results">
                <span className="result-title">Results</span>
                {Object.keys(wordBank).map((word) =>
                (<div key={word} className="result-item">
                    <span className="result-item-text">{word.toLowerCase()}</span>
                    <span className="result-item-text" >{wordBank[word]}</span>
                </div>))}
            </div>
            <div style={{ margin: '1vh 0' }}>
                <NavLink to="/home" className="return-home"> Back to Home</NavLink>
            </div>
        </div>
    )
}

export default GameOver
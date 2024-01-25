import React from 'react'
import "./styles.css";
import { NavLink } from 'react-router-dom';

const GameOver = ({ wordBank, score }) => {
    const sortedWordBank = Object.keys(wordBank).sort((a, b) =>
        wordBank[b] - wordBank[a] || a.localeCompare(b)
    );


    return (
        <div className="game-body">
            <div className="score-box">
                <div className="score-box-text">
                    <div>
                        <span className="score-text">Words:</span>
                        <span className="score-text-val">{sortedWordBank.length}</span></div>
                    <div>

                        <span className="score-text">Score:</span>
                        <span className="score-text-val">{score}</span></div>
                </div>
            </div>
            <div className="results">
                <span className="result-title">Results</span>
                {sortedWordBank.map((word) =>
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
import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Game from "./components/Game";
import "./App.css";
import { letterSets } from './constants';

export default function App() {
  const size = 6;
  const letterSet = letterSets[Math.floor(Math.random() * letterSets.length)];
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/home" element={<Home />}></Route>
          <Route path="/game" element={<Game size={size} letterSet={letterSet} />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

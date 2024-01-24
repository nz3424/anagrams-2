import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Game from "./components/Game";
import "./App.css";

export default function App() {
  const size = 6;
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/home" element={<Home />}></Route>
          <Route path="/game" element={<Game size={size} />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

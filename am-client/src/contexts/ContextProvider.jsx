import React, { createContext, useContext, useEffect, useState } from 'react';

const StateContext = createContext();

export const ContextProvider = ({ children }) => {

    const [activeUser, setActiveUser] = useState(() => {
        const savedUser = sessionStorage.getItem('activeUser');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [route, setRoute] = useState(() => {
        const savedRoute = sessionStorage.getItem('route');
        if (savedRoute === '"game"') {
            return 'home';
        }
        return savedRoute ? JSON.parse(savedRoute) : 'login';
        // make it so if you refresh in the game, it takes you to home

    });

    const [userNeedsRefresh, setUserNeedsRefresh] = useState(false);

    const [gameMode, setGameMode] = useState("solo");

    const [challengeId, setChallengeId] = useState(null);

    const [letterSet, setLetterSet] = useState(() => {
        const saved = sessionStorage.getItem('letterSet');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        sessionStorage.setItem('activeUser', JSON.stringify(activeUser));
        sessionStorage.setItem('route', JSON.stringify(route));
    }, [route, activeUser]);

    return (<StateContext.Provider value={{ activeUser, setActiveUser, route, setRoute, userNeedsRefresh, setUserNeedsRefresh, gameMode, setGameMode, challengeId, setChallengeId, letterSet, setLetterSet }}
    >
        {children}
    </StateContext.Provider>)

}
export const useStateContext = () => useContext(StateContext);
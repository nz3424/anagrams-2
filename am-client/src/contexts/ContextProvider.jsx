import React, { createContext, useContext, useEffect, useState } from 'react';

const StateContext = createContext();

export const ContextProvider = ({ children }) => {

    const [activeUser, setActiveUser] = useState(() => {
        const savedUser = localStorage.getItem('activeUser');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [route, setRoute] = useState(() => {
        const savedRoute = localStorage.getItem('route');
        return savedRoute ? JSON.parse(savedRoute) : 'login';
        // make it so if you refresh in the game, it takes you to home

    });

    useEffect(() => {
        localStorage.setItem('activeUser', JSON.stringify(activeUser));
        localStorage.setItem('route', JSON.stringify(route));
    }, [route, activeUser]);

    return (<StateContext.Provider value={{ activeUser, setActiveUser, route, setRoute }}
    >
        {children}
    </StateContext.Provider>)

}
export const useStateContext = () => useContext(StateContext);
import React, { createContext, useContext, useState } from 'react';

const StateContext = createContext();

const initialState = {

}

export const ContextProvider = ({ children }) => {
    const [activeUser, setActiveUser] = useState("");


    return (<StateContext.Provider value={{ activeUser, setActiveUser }}
    >
        {children}
    </StateContext.Provider>)

}
export const useStateContext = () => useContext(StateContext);
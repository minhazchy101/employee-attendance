import { createContext, useContext, useState } from "react";

export const AppContext = createContext()

export const AppProvider = ({children})=>{

    const [showLogin, setShowLogin] = useState(false)


    const value = { showLogin, setShowLogin,} ;

    return (

         <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
    )}


export const useAppContext =()=>{
    return useContext(AppContext)
}    
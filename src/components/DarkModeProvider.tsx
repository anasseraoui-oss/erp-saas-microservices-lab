import React, {createContext, useState, useContext} from 'react';
// @ts-ignore
const DarkModeContext = createContext();

// @ts-ignore
export const DarkModeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleDarkMode = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    return (
        <DarkModeContext.Provider value={{  isDarkMode, toggleDarkMode }}>
            {children}
        </DarkModeContext.Provider>
    );
};

// دالة للوصول إلى قيمة الوضع المظلم في المكونات الأخرى
export const useDarkMode = () => useContext(DarkModeContext);
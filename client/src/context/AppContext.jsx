import axios from "axios";
import { createContext, useEffect, useState} from "react";
// import { data } from "react-router-dom";
import { toast } from "react-toastify";

/**
 * AppContext provides a global state for the entire application.
 * This prevents "Prop Drilling" (passing data through many layers of components).
 */
export const AppContext = createContext();

export const AppContextProvider = (props) => {
  
  // Set axios to include credentials (cookies) in every request automatically
  axios.defaults.withCredentials = true;
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(false);

  const getUserData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/data");
      data.success ? setUserData(data.userData) : toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getAuthState = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/auth/is-auth");
      if (data.success) {
        setIsLoggedin(true);
        getUserData();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

   useEffect(() => {
      getAuthState();
   }, [])
   

  const value = {
    backendUrl,
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    getUserData,
  };
  return (
    <AppContext.Provider value={value}>
        {props.children}
    </AppContext.Provider>
  );
};
import React ,{useContext} from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'   
import { toast } from 'react-toastify'


const Navbar = () => {
    const navigate = useNavigate();
    const {userData , backendUrl, setUserData, setIsLoggedin} =  useContext(AppContext);


     const sendVerificationOtp = async () => {
    // setIsSubmitting(true);
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(
        backendUrl + "/api/auth/send-verify-otp"
      );
      if (data.success) {
        navigate("/email-verify");
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
     }
    //   finally {
    //   setIsSubmitting(false);
    // }
  };




      const logout = async () => {
    try {
      const { data } = await axios.post(backendUrl + "/api/auth/logout");
      data.success && setIsLoggedin(false);
      data.success && setUserData(false);
      navigate("/");
    } catch (error) {
      toast.error(error.message);
    }
  };


  return (
    <div className='w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0'>
        <img src={assets.logo} alt="Logo" className= "w-28 sm:w-32"/>
        {userData ? <div className="w-10 h-10 flex justify-center items-center text-white text-xl bg-black cursor-pointer font-medium  rounded-full relative group">
            {userData.name[0].toUpperCase()}

            <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded-lg pt-10">
                <ul className="list-none p-2 m-0 bg-gray-100  text-sm">
                    {!userData.isAccountVerified && 
                     <li 
                     onClick={sendVerificationOtp}
                    className="py-1  px-2 hover:bg-gray-200  cursor-pointer "
                    // className={`py-1  px-2 hover:bg-pink-200 hover:text-black cursor-pointer  text-center rounded-lg ${
                    //   isSubmitting
                        // ? "bg-gray-400 cursor-not-allowed border-2 border-blue-500 outline outline-blue-400"
                        // : ""
                    // }`}
                    > Verify Email</li>
                    }
                     
                    <li 
                    onClick={logout}
                    className="py-1  px-2 hover:bg-gray-200  cursor-pointer pr-10"
                    >Logout</li>
                </ul>

            </div>






        </div> :
         <button onClick={()=>navigate('/login')} className="flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100">
            Login <img src={assets.arrow_icon} alt="" />
        </button>
        }


       
    </div>
  )
}

export default Navbar
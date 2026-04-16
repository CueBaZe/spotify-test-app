import { IoIosLogOut } from "react-icons/io";
import type { ProfileProps } from "../interfaces/profileProps";

export default function Profile({user, showProfile, setShowProfile, logout, setToken, setUser}: ProfileProps ) { //inherits from ProfileProps 
    return (
        <div className='lg:absolute top-15 right-25'>
            <div className='relative flex flex-col text-center items-center justify-center z-20'>
            <a onClick={() => {
                setShowProfile(prev => !prev)
            }}>
                <img src={user.images[0].url} alt="Profile picture" className='w-25 h-auto rounded-full border border-1 border-[#363636] hover:border-[#fff]'/>
            </a>
            {showProfile && (
                <div className='absolute top-30 bg-[#363636] rounded-lg p-2'>
                <p className='text-white text-md'>{user?.display_name}</p>
                <p className='text-white text-xs'>{user?.email}</p>
                {/* Logout button */}
                <button onClick={() => {logout(); setToken(''); setUser(null);}} className='w-[40px] hover:cursor-pointer' title='Logout'><IoIosLogOut className='text-red-400 text-4xl'/></button>
                </div>
            )}
            </div>
        </div>
    );
}
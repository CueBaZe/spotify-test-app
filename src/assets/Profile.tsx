import type { ProfileProps } from "../interfaces/profileProps";
import { useState } from "react";

export default function Profile({user, logout, setToken, setUser}: ProfileProps ) { //inherits from ProfileProps 

    const [showProfile, setShowProfile] = useState<boolean>(false);

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
                <button onClick={() => {logout(); setToken(''); setUser(null);}} className='text-white text-sm m-2 p-1 inline-block border border-transparent rounded-lg hover:border-[#232423]' title='Logout'>Logout</button>
                </div>
            )}
            </div>
        </div>
    );
}
import { useState } from "react";
import type { UserProfile } from "./interfaces/userProfile";
import { FaPlay, FaPause  } from "react-icons/fa";
import type { SongInterface } from "./interfaces/song";
import SongPlayer from "./spotifyPlayer";

interface SongControllerProps {
    user: UserProfile | null;
    songs: SongInterface[];
    searchInput: string;
    token: string;  
}

export const SongController = ({user, searchInput, token, songs}: SongControllerProps) => {
    const [activeUri, setActiveUri] = useState<string | null>(null);
    const [isPaused, setIsPaused] = useState<boolean>(true);

//-------------------------------(Play/Pause)-------------------------------------------------------------------------------

    const playSong = async (uri: string) => {
        const deviceId = window.localStorage.getItem('device_id');
        if (!deviceId) return;

        await fetch (`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
            method: 'PUT',
            body: JSON.stringify({ uris: [uri] }),
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
            },
        });
    }

    const pauseSong = async () => {
        const deviceId = window.localStorage.getItem('device_id');

        if (!deviceId) return;

        try {
            await fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            });
        } catch (error) {
            console.error("Failed to pause:", error);
        }
    }

//-------------------------------(Update states)-------------------------------------------------------------------------------

    const handlePlayerUpdate = (state: any) => { //gets the states from spotifyPlayer
        setActiveUri(state.track_window.current_track.uri);
        setIsPaused(state.paused);
    };

//-------------------------------(UI)-------------------------------------------------------------------------------

    return (
        <div className="w-full">
            <SongPlayer token={token} onStateChange={handlePlayerUpdate}/>
            <div className='grid grid-cols-12 gap-[30px] w-full'>
                {songs.length > 0 || !searchInput ? (
                    songs.map((song) => ( 
                        <div className='flex flex-col col-span-6 lg:col-span-4 items-center border border-1 border-[#363636] rounded-lg p-2' key={song.id}> 
                        <img 
                            src={song.album.images[1]?.url} 
                            alt={song.name} 
                            className='rounded-xl mb-4'
                        />
                        <h1 className='text-white font-bold text-xl'>{song.name}</h1>
                        <p className='text-white text-md'>{song.artists[0].name}</p> 
                        {user?.product !== 'premium' && ( //User dont have premium
                            <div>
                            <iframe 
                                src={`https://open.spotify.com/embed/track/${song.id}`}
                                width="100%"
                                height="60%"
                                loading="lazy"
                                className='mt-4'
                            />
                            <p className='text-white text-sm'>Use system volume to adjust audio</p>
                            </div>
                        )}

                        {user?.product === 'premium' && (
                            <div>
                            {activeUri === song.uri && !isPaused ? (
                                <button 
                                onClick={pauseSong}
                                className='text-white text-xl m-2'
                                >
                                <FaPause />
                                </button>
                            ) : (
                                <button
                                onClick={() => playSong(song.uri)}
                                className='text-white text-xl m-2'
                                >
                                <FaPlay />
                                </button>
                            )}
                            </div>
                        )}

                        </div>
                    ))
                ) : (
                    <p className='text-xl text-center w-200 text-red-400 col-span-12'>We couldn’t find any matching songs for your search.</p>
                )}
            </div>
        </div>
    );
}
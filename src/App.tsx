  import { useState, useEffect} from 'react';
  import redirectToAuthCodeFlow, { getAccessToken, loginToSpotify, logout, fetchProfile, isTokenExpired, ifExpired } from './assets/auth';
  import { IoIosWarning } from "react-icons/io";
  import type { SongInterface } from "./interfaces/song";
  import type { UserProfile } from "./interfaces/userProfile";
  import Profile from './assets/Profile';
  import { SongController } from './assets/songcontroller';


  export default function App() {
    const [searchInput, setSearchInput] = useState<string>("");
    const [token, setToken] = useState<string>();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [songs, setSongs] = useState<SongInterface[]>([]);

//-------------------------------(Get token)-------------------------------------------------------------------------------

    useEffect(() => {
      const getData = async () => {

        if (token) return;

        const isExpired = isTokenExpired();

        const storedToken = window.localStorage.getItem('token');
        if (storedToken) { //checks if you have a token i the localstorage
          setToken(storedToken);

          if (isExpired) { ifExpired(); }

          const userProfile = await fetchProfile(storedToken);
          setUser(userProfile);
          return;
        }
        const params = new URLSearchParams(window.location.search); 
        const _code = params.get('code'); //gets the code from the link that spotify send back

        if (_code) {
        const client_id = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
        console.log('test')
        try {
          const accessToken = await getAccessToken(client_id, _code);
          
          if (accessToken) { //sets token if it can connect
            setToken(accessToken);
            window.history.replaceState({}, document.title, '/');

            if (isExpired) { ifExpired(); }

            const userProfile = await fetchProfile(accessToken);
            setUser(userProfile);
          }
        } catch (error) {
          console.log('Failed to swap code for token', error);
        }
      }

      };

      getData();
    }, [])

//-------------------------------(Update songlist)-------------------------------------------------------------------------------

    const updateSongList = async (name: string) => {
        setSearchInput(name); 
        const isExpired = isTokenExpired();
        
        if (isExpired) { ifExpired(); }

        if (!token || !name.trim()) {
        setSongs([]);
        return;
        }

        const safeName = encodeURIComponent(name); //Gets the search ready for the request
        try {

            const response = await fetch (`https://api.spotify.com/v1/search?q=track:${safeName}&type=track&limit=9`, { //fetch 9 songs that match the name
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
            });

            const data = await response.json();
            if (data.tracks && data.tracks.items) {
            setSongs(data.tracks.items); //sets songs to the tracks thats comes with the response
            }

        } catch (error) {
            console.error('Search Failed:', error); 
        }
    };

//-------------------------------(UI)-------------------------------------------------------------------------------

    return (
      <section className='flex flex-col'>
        <div className='flex flex-col min-h-screen w-screen bg-[#232423] items-center gap-[50px] pt-10'>
          <h1 className='text-center text-6xl font-bold text-green-300'>Spotify test app</h1>
          {user && ( 
            <Profile //passes down the variables
              user = {user}
              logout={logout}
              setToken={setToken}
              setUser={setUser}
            />
          )}
          
          {token && (
            <div className="flex flex-col items-center gap-2">
              <div className='flex flex-row gap-4'>
                <input 
                  type='text' 
                  placeholder='What do you want to listen to?' 
                  className='border-2 border-[#363636] rounded-2xl w-[250px] text-md lg:w-[350px] lg:text-xl text-white p-2 bg-transparent'
                  value={searchInput}
                  onChange={(e) => updateSongList(e.target.value)}
                />
              </div>
              <p className="text-gray-400 text-sm">
                {token ? "✅ API Connected" : "❌ Connecting to Spotify..."}
              </p>
              <div>
                  {/* Loops throug the songs and makes the box foreach song */}
                  <SongController user={user} songs={songs} searchInput={searchInput} token={token}/> 
              </div>
            </div>
          )}

          {!token && (
            <div className='flex flex-col justify-center items-center gap-10'>
              <div className='flex flex-col text-center items-center w-100 border border-1 border-[#363636] rounded-lg p-2'>        
                <p className='text-white text-md'>To access this site, you must log in to your Spotify account. Please click on Log In and agree to the application's terms and conditions to continue.</p>
                <p><IoIosWarning className='text-red-400 text-2xl m-2'/></p>
              </div>
              {/* Login button */}
              <button className='bg-green-400 w-50 p-2 rounded-lg text-white text-xl font-bold mb-4' onClick={loginToSpotify}>
                Log in
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }
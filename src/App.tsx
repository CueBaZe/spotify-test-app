import { useState, useEffect} from 'react';
import redirectToAuthCodeFlow, { getAccessToken, refreshToken } from './auth';

interface Song {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    images: { url: string }[];
  };
}

export default function App() {
  const [searchInput, setSearchInput] = useState<string>("");
  const [token, setToken] = useState<string>();
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    const getData = async () => {

      if (token) return;

      const storedToken = window.localStorage.getItem('token');
      if (storedToken) { //checks if you have a token i the localstorage
        setToken(storedToken);
        return;
      }
      const params = new URLSearchParams(window.location.search); 
      const _code = params.get('code'); //gets the code from the link that spotify send back

      if (_code) {
      const client_id = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
      try {
        const accessToken = await getAccessToken(client_id, _code);
        
        if (accessToken) { //sets token if it can connect
          setToken(accessToken);
          window.history.replaceState({}, document.title, '/');
        }
      } catch (error) {
        console.log('Failed to swap code for token', error);
      }
    }

    };

    getData();
  }, [])

  const loginToSpotify = async () => { //runs when you press login
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
      redirectToAuthCodeFlow(clientId);
  }

  const logout = () => {
    localStorage.removeItem('verifer');
    localStorage.removeItem('token')
    setToken('');
  }

  const isTokenExpired = () => {
  const expiresAt = localStorage.getItem('expires_at');
  if (!expiresAt) return true;
  
  return Date.now() > (Number(expiresAt) - 60000); 
};

  const updateSongList = async (name: string) => {
    setSearchInput(name);
    const isExpired = isTokenExpired();
    
    if (isExpired) {
      const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
      refreshToken(clientId);
      return;
    }

    if (!token || !name.trim()) {
    setSongs([]);
    return;
  }

    const safeName = encodeURIComponent(name); //Gets the search ready for the request
    try {
      const response = await fetch (`https://api.spotify.com/v1/search?q=${safeName}&type=track&limit=9`, { //fetch 9 songs that match the most with the search
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

  return (
    <section>
      <div className='flex flex-col min-h-screen w-screen bg-[#232423] items-center gap-[50px] pt-10'>
        <h1 className='text-center text-6xl font-bold text-green-300'>Spotify test app</h1>
        
        {token && (
          <div className="flex flex-col items-center gap-2">
            <input 
              type='text' 
              placeholder='What do you want to listen to?' 
              className='border-2 border-[#363636] rounded-2xl w-[350px] text-xl text-white p-2 bg-transparent'
              value={searchInput}
              onChange={(e) => updateSongList(e.target.value)}
            />
            <p className="text-gray-400 text-sm">
              {token ? "✅ API Connected" : "❌ Connecting to Spotify..."}
            </p>
            <div className='grid grid-cols-12 text-center gap-[30px] p-4'>
                {/* Loops throug the songs and makes the box foreach song */}
                {songs.map((song) => ( 
                  <div className='flex flex-col col-span-4 items-center border border-1 border-[#363636] rounded-lg p-2' key={song.id}> 
                    <img 
                      src={song.album.images[1]?.url} 
                      alt={song.name} 
                      className='rounded-xl mb-4'
                    />
                    <h1 className='text-white font-bold text-xl'>{song.name}</h1>
                    <p className='text-white text-md'>{song.artists[0].name}</p>  
                  </div>
                ))}
            </div>
          </div>
        )}

        {!token && (
          <div>
            <button onClick={loginToSpotify}>
              Login
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
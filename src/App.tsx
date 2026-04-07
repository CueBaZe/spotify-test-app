import { useState, useEffect} from 'react';

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
  const [token, setToken] = useState<string>("");
  const [songs, setSongs] = useState<Song[]>([]);

  const getAccessToken = async () => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID; //Gets the Client ID from the env file
    const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET; //Get the Client Secret from the env file
    const url = 'https://accounts.spotify.com/api/token'; //spotify's api endpoint to get access token

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials'); //tells the api is an app
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);

    try {
      const response = await fetch(url, { //fetches the token
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      const data = await response.json();
      if (data.access_token) {
        setToken(data.access_token);
      }
    } catch (error) {
      console.error('Fetch failed:', error);
    }
  };

  useEffect(() => { //runs on mount
    getAccessToken();
  }, []);

  const updateSongList = async (name: string) => {
    setSearchInput(name);

    if (!name.trim()) {
    setSongs([]);
    return;
  }

    const safeName = encodeURIComponent(name); //Gets the search ready for the request
    try {
      const response = await fetch (`https://api.spotify.com/v1/search?q=${safeName}&type=track&limit=9`, {
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
      </div>
    </section>
  );
}
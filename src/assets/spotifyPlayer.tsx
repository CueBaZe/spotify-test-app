import { useEffect, useState } from "react";

interface Track {
    name: string;
    album: { images: { url: string }[] };
    artists: { name: string }[];
}

const SongPlayer = ({ token, onStateChange }: { token: string, onStateChange: (state: any) => void }) => {
    const [player, setPlayer] = useState<any>(undefined);
    const [is_paused, setPaused] = useState(false);
    const [is_active, setActive] = useState(false);
    const [current_track, setTrack] = useState<Track | null>(null);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.body.appendChild(script);

        (window as any).onSpotifyWebPlaybackSDKReady = () => {
            const newPlayer = new (window as any).Spotify.Player({
                name: 'Web Player',
                getOAuthToken: (cb: (t: string) => void) => { cb(token); },
                volume: 0.1
            });

            setPlayer(newPlayer);

            newPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
                window.localStorage.setItem('device_id', device_id); 
            });

            newPlayer.addListener('player_state_changed', (state: any) => {
                if (!state) return;
                setTrack(state.track_window.current_track);
                setPaused(state.paused);
                setActive(true);

                onStateChange(state);
            });

            newPlayer.connect();
        };

        return () => {
            if (player) player.disconnect();
        };
    }, [token]);

    return (
        <div></div>
    );

}

export default SongPlayer;
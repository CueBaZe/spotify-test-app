export default async function redirectToAuthCodeFlow(clientId: string) {
    const verifer = generateVerifer(128);
    const challenge = await generateCodeChallenge(verifer);

    localStorage.setItem('verifer', verifer);

    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('response_type', "code");
    params.append('redirect_uri', "http://127.0.0.1:5173"); //Uri that is returns you to on success or failure
    params.append('scope', 'streaming user-read-email user-read-private user-modify-playback-state'); //permissions the app asks for
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`; //changes the location to this link
}

export async function refreshToken(clientId: string): Promise<string | null> {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) return null;

    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: 'POST',
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString()
    });

    const data = await result.json();

    if (!result.ok) {
        console.error("Refresh Token Error:", data);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('expires_at');
        return null;
    }

    if (data.access_token) {
        //update expires_at so i dosen't try to refresh again immediately
        const expiry_time = Date.now() + (data.expires_in * 1000);
        localStorage.setItem('expires_at', expiry_time.toString());

        localStorage.setItem('token', data.access_token);
        if (data.refresh_token) localStorage.setItem('refreshToken', data.refresh_token);
        return data.access_token;
    }

    return null;
}

function generateVerifer(length: number) { //generates the verifer 
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }

    return text;
}

async function generateCodeChallenge(codeVerifier: string) { //generate the code challenge
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export async function getAccessToken(client_id: string, code: string): Promise<string> { 
    const verifer = window.localStorage.getItem("verifer");

    const params = new URLSearchParams();
    params.append('client_id', client_id);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', 'http://127.0.0.1:5173'); //Uri that is returns you to on success or failure
    params.append("code_verifier", verifer!);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: 'POST',
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString()
    });

    const data = await result.json();

    localStorage.setItem('token', data.access_token)
    localStorage.setItem('refreshToken', data.refresh_token)

    const expiryTime = Date.now() + (data.expires_in * 1000);
    localStorage.setItem('expires_at', expiryTime.toString());

    return data.access_token;
}
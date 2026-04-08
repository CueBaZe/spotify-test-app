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
    return data.access_token;
}
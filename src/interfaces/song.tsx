export interface Song {
    id: string;
    name: string;
    artists: { name: string }[];
    album: {
        images: { url: string }[];
    };
}
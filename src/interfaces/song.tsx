export interface SongInterface {
    id: string;
    uri: string;
    name: string;
    artists: { name: string }[];
    album: {
        images: { url: string }[];
    };
}
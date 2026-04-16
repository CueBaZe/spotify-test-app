import type { UserProfile } from "./interfaces/userProfile";

export interface ProfileProps { //what items that inherits from ProfileProps expect to get
    user: UserProfile;
    logout: () => void;
    setToken: (token: string) => void;
    setUser: (user: UserProfile | null) => void;

}
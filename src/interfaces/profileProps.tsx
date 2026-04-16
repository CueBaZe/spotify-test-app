import type { UserProfile } from "./interfaces/userProfile";

export interface ProfileProps { //what items that inherits from ProfileProps expect to get
    user: UserProfile;
    showProfile: boolean;
    setShowProfile: React.Dispatch<React.SetStateAction<boolean>>;
    logout: () => void;
    setToken: (token: string) => void;
    setUser: (user: UserProfile | null) => void;

}
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { toast } from "@/lib/toast";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  userProfile: UserProfile | null;
}

export interface UserProfile {
  displayName: string;
  email: string;
  photoURL?: string;
  spiritualName?: string;
  joinDate?: Date;
  phoneNumber?: string;
  location?: string;
  address?: string;
  city?: string;
  pinCode?: string;
  dateOfBirth?: Date | string;
  occupation?: string;
  batch?: string;
  isAdmin?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function register(email: string, password: string, displayName: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      
      const userProfile: UserProfile = {
        displayName,
        email,
        joinDate: new Date(),
      };
      
      await setDoc(doc(db, "users", userCredential.user.uid), userProfile);
      toast.success("Registration successful!");
    } catch (error: any) {
      toast.error(error.message || "Failed to register");
      throw error;
    }
  }

  async function login(email: string, password: string) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful!");
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
      throw error;
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to logout");
      throw error;
    }
  }

  async function updateUserProfile(data: Partial<UserProfile>) {
    if (!currentUser) throw new Error("No user is logged in");
    
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, { ...data });
      
      setUserProfile(prev => prev ? { ...prev, ...data } : null);
      
      if (data.displayName) {
        await updateProfile(currentUser, { displayName: data.displayName });
      }
      
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
      throw error;
    }
  }

  useEffect(() => {
    async function fetchUserProfile(user: User) {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        } else {
          const newProfile: UserProfile = {
            displayName: user.displayName || "",
            email: user.email || "",
            photoURL: user.photoURL || "",
            joinDate: new Date(),
          };
          
          await setDoc(doc(db, "users", user.uid), newProfile);
          setUserProfile(newProfile);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      if (user) {
        fetchUserProfile(user);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    register,
    login,
    logout,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { 
  User, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
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
  uid: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  bio?: string;
  spiritualName?: string;
  dateOfBirth?: Date | string | null;
  occupation?: string;
  address?: string;
  city?: string;
  pinCode?: string;
  batch?: string;
  mobileNumber?: string;
  isInitiated?: boolean;
  maritalStatus?: string;
  referredBy?: string;
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
        uid: userCredential.user.uid,
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
      const cleanData: Record<string, any> = {};
      
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
          cleanData[key] = value;
        }
      }
      
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, cleanData);
      
      setUserProfile(prev => prev ? { ...prev, ...cleanData } : null);
      
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
    const fetchUserProfile = async (user: User) => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        } else {
          const newProfile: UserProfile = {
            uid: user.uid,
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
    };

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

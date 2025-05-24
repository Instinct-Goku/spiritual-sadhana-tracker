import { 
  collection, 
  query, 
  where, 
  getDocs,
  getDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  addDoc,
  deleteDoc,
  setDoc,
  writeBatch,
  Timestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { getWeeklySadhana, getSadhanaEntries } from "./sadhanaService";
import { calculateWeeklySadhanaScore, getBatchCriteriaFromUserProfile } from "./scoringService";

export interface DevoteeSadhanaProgress {
  id: string;
  uid?: string; // Added uid for compatibility with DevoteeWithProfile
  displayName: string;
  spiritualName?: string;
  phoneNumber?: string;
  photoURL?: string;
  email?: string;
  batchName?: string;
  batch?: string; // Added for compatibility with Admin.tsx references
  city?: string; // Added for compatibility
  location?: string; // Added for compatibility
  weeklyStats?: {
    averageChantingRounds: number;
    averageReadingMinutes: number;
    mangalaAratiAttendance: number;
    morningProgramAttendance: number;
    totalReadingMinutes: number; // Keep this property
    // Add score breakdowns for group progress
    sleepTimeScore?: number;
    wakeUpTimeScore?: number;
    readingScore?: number;
    daySleepScore?: number;
    japaCompletionScore?: number;
    programScore?: number;
    hearingScore?: number;
    serviceScore?: number;
  };
}

export interface DevoteeGroup {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  devoteeIds: string[];
  devoteeCount?: number; // Added missing property
}

export interface DevoteeWithProfile {
  uid: string;
  id?: string; // Added id for compatibility
  displayName: string;
  spiritualName?: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;
  batchName?: string;
  batch?: string; // Added for compatibility
  city?: string; // Added for compatibility
  location?: string; // Added for compatibility
}

// Search devotees function
export const searchDevotees = async (
  searchTerm: string,
  adminId?: string
): Promise<DevoteeSadhanaProgress[]> => {
  try {
    // Validate search term
    if (!searchTerm || searchTerm.trim() === "") {
      console.warn("Search term is empty. Returning empty results.");
      return [];
    }

    // Query 1: Search by display name
    const displayNameQuery = query(
      collection(db, "users"),
      where("displayName", ">=", searchTerm),
      where("displayName", "<=", searchTerm + "\uf8ff")
    );

    // Query 2: Search by phone number
    const phoneNumberQuery = query(
      collection(db, "users"),
      where("phoneNumber", ">=", searchTerm),
      where("phoneNumber", "<=", searchTerm + "\uf8ff")
    );

    const [displayNameSnapshot, phoneNumberSnapshot] = await Promise.all([
      getDocs(displayNameQuery),
      getDocs(phoneNumberQuery),
    ]);

    const resultsMap: Record<string, DevoteeSadhanaProgress> = {};

    // Process display name results
    displayNameSnapshot.forEach((doc) => {
      const data = doc.data();
      const devotee: DevoteeSadhanaProgress = {
        id: doc.id,
        uid: doc.id, // Add uid for compatibility
        displayName: data.displayName || "N/A",
        spiritualName: data.spiritualName || "",
        phoneNumber: data.phoneNumber || "",
        photoURL: data.photoURL || "",
        email: data.email || "",
        batchName: data.batchName || "",
        batch: data.batch || "", // Added for compatibility
        city: data.city || "", // Added for compatibility
        location: data.location || "", // Added for compatibility
      };
      resultsMap[doc.id] = devotee;
    });

    // Process phone number results, avoiding duplicates
    phoneNumberSnapshot.forEach((doc) => {
      if (!resultsMap[doc.id]) {
        const data = doc.data();
        const devotee: DevoteeSadhanaProgress = {
          id: doc.id,
          uid: doc.id, // Add uid for compatibility
          displayName: data.displayName || "N/A",
          spiritualName: data.spiritualName || "",
          phoneNumber: data.phoneNumber || "",
          photoURL: data.photoURL || "",
          email: data.email || "",
          batchName: data.batchName || "",
          batch: data.batch || "", // Added for compatibility
          city: data.city || "", // Added for compatibility
          location: data.location || "", // Added for compatibility
        };
        resultsMap[doc.id] = devotee;
      }
    });

    // Convert map to array
    let results: DevoteeSadhanaProgress[] = Object.values(resultsMap);

    // Fetch weekly stats for each devotee
    results = await Promise.all(
      results.map(async (devotee) => {
        try {
          const today = new Date();
          const sunday = new Date(
            today.setDate(today.getDate() - today.getDay())
          );
          const weeklyStats = await getWeeklySadhana(devotee.id, sunday);
          return {
            ...devotee,
            weeklyStats: {
              averageChantingRounds: weeklyStats.averageChantingRounds,
              averageReadingMinutes: weeklyStats.averageReadingMinutes,
              mangalaAratiAttendance: weeklyStats.mangalaAratiAttendance,
              morningProgramAttendance: weeklyStats.morningProgramAttendance,
              totalReadingMinutes: weeklyStats.totalReadingMinutes || 0, // Use existing property
            },
          };
        } catch (error) {
          console.error(`Failed to fetch weekly stats for devotee ${devotee.id}:`, error);
          return devotee; // Return devotee without stats
        }
      })
    );

    return results;
  } catch (error) {
    console.error("Error searching devotees:", error);
    return [];
  }
};

// Function to get available groups for joining
export const getAvailableGroups = async (): Promise<DevoteeGroup[]> => {
  try {
    const groupsRef = collection(db, "devoteeGroups");
    const snapshot = await getDocs(groupsRef);
    
    const groups: DevoteeGroup[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      groups.push({
        id: doc.id,
        name: data.name,
        description: data.description,
        createdBy: data.createdBy,
        createdAt: data.createdAt.toDate(),
        devoteeIds: data.devoteeIds || [],
        devoteeCount: (data.devoteeIds || []).length, // Calculate devotee count
      });
    });
    
    return groups;
  } catch (error) {
    console.error("Error fetching available groups:", error);
    return [];
  }
};

// Function to join a devotee to a group
export const joinDevoteeGroup = async (devoteeId: string, groupId: string): Promise<void> => {
  try {
    const groupRef = doc(db, "devoteeGroups", groupId);
    
    // Check if the group exists
    const groupDoc = await getDoc(groupRef);
    if (!groupDoc.exists()) {
      throw new Error("Group not found");
    }
    
    // Add devotee to the group
    await updateDoc(groupRef, {
      devoteeIds: arrayUnion(devoteeId)
    });
    
    // Also update the user's groupIds array
    const userRef = doc(db, "users", devoteeId);
    await updateDoc(userRef, {
      groupIds: arrayUnion(groupId)
    });
    
  } catch (error) {
    console.error("Error joining devotee to group:", error);
    throw error;
  }
};

// Function to get groups that a user is part of
export const getUserGroups = async (userId: string): Promise<DevoteeGroup[]> => {
  try {
    // First get the user to see which groups they're in
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }
    
    const userData = userDoc.data();
    const groupIds = userData.groupIds || [];
    
    if (groupIds.length === 0) {
      return [];
    }
    
    // Get each group
    const groupPromises = groupIds.map(async (groupId: string) => {
      const groupRef = doc(db, "devoteeGroups", groupId);
      const groupDoc = await getDoc(groupRef);
      
      if (groupDoc.exists()) {
        const data = groupDoc.data();
        const devoteeIds = data.devoteeIds || [];
        return {
          id: groupDoc.id,
          name: data.name,
          description: data.description,
          createdBy: data.createdBy,
          createdAt: data.createdAt.toDate(),
          devoteeIds,
          devoteeCount: devoteeIds.length, // Calculate devotee count
        };
      }
      
      return null;
    });
    
    const groups = await Promise.all(groupPromises);
    return groups.filter((group): group is DevoteeGroup => group !== null);
    
  } catch (error) {
    console.error("Error fetching user groups:", error);
    return [];
  }
};

// Function to let a user leave a group
export const leaveGroup = async (devoteeId: string, groupId: string): Promise<void> => {
  try {
    const groupRef = doc(db, "devoteeGroups", groupId);
    
    // Remove devotee from the group
    await updateDoc(groupRef, {
      devoteeIds: arrayRemove(devoteeId)
    });
    
    // Also remove group from user's groupIds
    const userRef = doc(db, "users", devoteeId);
    await updateDoc(userRef, {
      groupIds: arrayRemove(groupId)
    });
    
  } catch (error) {
    console.error("Error leaving group:", error);
    throw error;
  }
};

// Function to create a new devotee group (admin only)
export const createDevoteeGroup = async (groupData: {
  name: string;
  description?: string;
  adminId: string;
  createdAt: Date;
}): Promise<string> => {
  try {
    const newGroup = {
      name: groupData.name,
      description: groupData.description || "",
      createdBy: groupData.adminId,
      createdAt: Timestamp.now(),
      devoteeIds: [],
    };
    
    const docRef = await addDoc(collection(db, "devoteeGroups"), newGroup);
    return docRef.id;
    
  } catch (error) {
    console.error("Error creating devotee group:", error);
    throw error;
  }
};

// Function to get all devotee groups (admin view)
export const getDevoteeGroups = async (adminId: string): Promise<DevoteeGroup[]> => {
  try {
    const groupsRef = collection(db, "devoteeGroups");
    const q = query(groupsRef, where("createdBy", "==", adminId));
    const snapshot = await getDocs(q);
    
    const groups: DevoteeGroup[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const devoteeIds = data.devoteeIds || [];
      groups.push({
        id: doc.id,
        name: data.name,
        description: data.description,
        createdBy: data.createdBy,
        createdAt: data.createdAt.toDate(),
        devoteeIds,
        devoteeCount: devoteeIds.length, // Calculate devotee count
      });
    });
    
    return groups;
  } catch (error) {
    console.error("Error fetching devotee groups:", error);
    return [];
  }
};

// Function to get devotees in a specific group
export const getDevoteesInGroup = async (groupId: string): Promise<DevoteeWithProfile[]> => {
  try {
    const groupRef = doc(db, "devoteeGroups", groupId);
    const groupDoc = await getDoc(groupRef);
    
    if (!groupDoc.exists()) {
      throw new Error("Group not found");
    }
    
    const groupData = groupDoc.data();
    const devoteeIds = groupData.devoteeIds || [];
    
    if (devoteeIds.length === 0) {
      return [];
    }
    
    const devoteePromises = devoteeIds.map(async (devoteeId: string) => {
      const userRef = doc(db, "users", devoteeId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          uid: userDoc.id,
          id: userDoc.id, // Add id for compatibility
          displayName: data.displayName || "",
          spiritualName: data.spiritualName || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          photoURL: data.photoURL || "",
          batchName: data.batchName || "",
          batch: data.batch || "", // Added for compatibility
          city: data.city || "", // Added for compatibility
          location: data.location || "", // Added for compatibility
        };
      }
      
      return null;
    });
    
    const devotees = await Promise.all(devoteePromises);
    return devotees.filter((devotee): devotee is DevoteeWithProfile => devotee !== null);
    
  } catch (error) {
    console.error("Error fetching devotees in group:", error);
    return [];
  }
};

// Function to delete a devotee group
export const deleteDevoteeGroup = async (groupId: string, adminId: string): Promise<void> => {
  try {
    // Get the group to check devoteeIds
    const groupRef = doc(db, "devoteeGroups", groupId);
    const groupDoc = await getDoc(groupRef);
    
    if (!groupDoc.exists()) {
      throw new Error("Group not found");
    }
    
    const groupData = groupDoc.data();

    // Check if the user is the admin of this group
    if (groupData.createdBy !== adminId) {
      throw new Error("Only the group creator can delete this group");
    }
    
    const devoteeIds = groupData.devoteeIds || [];
    
    // If there are devotees in the group, we need to update their profiles
    if (devoteeIds.length > 0) {
      const batch = writeBatch(db);
      
      // Remove the group from each devotee's profile
      for (const devoteeId of devoteeIds) {
        const userRef = doc(db, "users", devoteeId);
        batch.update(userRef, {
          groupIds: arrayRemove(groupId)
        });
      }
      
      // Commit all the user updates
      await batch.commit();
    }
    
    // Finally delete the group
    await deleteDoc(groupRef);
    
  } catch (error) {
    console.error("Error deleting devotee group:", error);
    throw error;
  }
};

// Function to get detailed profile of a devotee
export const getDevoteeDetails = async (devoteeId: string): Promise<DevoteeWithProfile | null> => {
  try {
    const userRef = doc(db, "users", devoteeId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }
    
    const data = userDoc.data();
    return {
      uid: userDoc.id,
      id: userDoc.id, // Add id for compatibility
      displayName: data.displayName || "",
      spiritualName: data.spiritualName || "",
      email: data.email || "",
      phoneNumber: data.phoneNumber || "",
      photoURL: data.photoURL || "",
      batchName: data.batchName || "",
      batch: data.batch || "", // Added for compatibility
      city: data.city || "", // Added for compatibility
      location: data.location || "", // Added for compatibility
    };
    
  } catch (error) {
    console.error("Error fetching devotee details:", error);
    return null;
  }
};

// Function to get sadhana progress for an entire group
export const getGroupSadhanaProgress = async (
  groupId: string,
  startDate: Date = new Date()
): Promise<DevoteeSadhanaProgress[]> => {
  try {
    // First get all devotees in the group
    const devotees = await getDevoteesInGroup(groupId);
    
    if (devotees.length === 0) {
      return [];
    }
    
    // For each devotee, get their weekly sadhana and calculate scores
    const progressPromises = devotees.map(async (devotee) => {
      try {
        const today = new Date();
        const sunday = new Date(today.setDate(today.getDate() - today.getDay()));
        
        // Get weekly stats
        const weeklyStats = await getWeeklySadhana(devotee.uid, sunday);
        
        // Get sadhana entries for score calculation
        const entries = await getSadhanaEntries(devotee.uid, sunday);
        
        // Get batch criteria for this devotee
        const batchCriteria = getBatchCriteriaFromUserProfile({ batch: devotee.batch || "bhakta" });
        
        // Calculate weekly score with breakdowns
        const scoreResult = calculateWeeklySadhanaScore(entries, batchCriteria);
        
        return {
          id: devotee.uid,
          uid: devotee.uid,
          displayName: devotee.displayName,
          spiritualName: devotee.spiritualName,
          phoneNumber: devotee.phoneNumber,
          photoURL: devotee.photoURL,
          email: devotee.email,
          batchName: devotee.batchName,
          batch: devotee.batch,
          city: devotee.city,
          location: devotee.location,
          weeklyStats: {
            averageChantingRounds: weeklyStats.averageChantingRounds,
            averageReadingMinutes: weeklyStats.averageReadingMinutes,
            mangalaAratiAttendance: weeklyStats.mangalaAratiAttendance,
            morningProgramAttendance: weeklyStats.morningProgramAttendance,
            totalReadingMinutes: weeklyStats.totalReadingMinutes || 0,
            // Add score breakdowns from calculated scores
            sleepTimeScore: scoreResult.breakdowns.sleepTimeScore || 0,
            wakeUpTimeScore: scoreResult.breakdowns.wakeUpTimeScore || 0,
            readingScore: scoreResult.breakdowns.readingScore || 0,
            daySleepScore: scoreResult.breakdowns.daySleepScore || 0,
            japaCompletionScore: scoreResult.breakdowns.japaCompletionScore || 0,
            programScore: scoreResult.breakdowns.programScore || 0,
            hearingScore: scoreResult.breakdowns.hearingScore || 0,
            serviceScore: scoreResult.breakdowns.serviceScore || 0,
          },
        };
      } catch (error) {
        console.error(`Failed to fetch weekly stats for devotee ${devotee.uid}:`, error);
        return {
          id: devotee.uid,
          uid: devotee.uid,
          displayName: devotee.displayName,
          spiritualName: devotee.spiritualName,
          phoneNumber: devotee.phoneNumber,
          photoURL: devotee.photoURL,
          email: devotee.email,
          batchName: devotee.batchName,
          batch: devotee.batch,
          city: devotee.city,
          location: devotee.location,
        };
      }
    });
    
    return await Promise.all(progressPromises);
    
  } catch (error) {
    console.error("Error fetching group sadhana progress:", error);
    return [];
  }
};

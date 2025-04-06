import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp, 
  updateDoc,
  doc,
  getDoc,
  deleteDoc,
  DocumentReference,
  DocumentData,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { UserProfile } from "@/contexts/AuthContext";
import { SadhanaEntry, WeeklyStats, getWeeklySadhana } from "./sadhanaService";

// Types
export interface DevoteeGroup {
  id: string;
  name: string;
  description: string;
  adminId: string;
  createdAt: Date | Timestamp;
  devoteeCount?: number;
}

// Fix the interface to make joinDate optional and match UserProfile
export interface DevoteeWithProfile extends Omit<UserProfile, 'joinDate'> {
  id: string;
  joinDate?: Date | Timestamp;
}

export interface GroupMembership {
  id?: string;
  userId: string;
  groupId: string;
  joinedAt: Date | Timestamp;
}

export interface DevoteeSadhanaProgress extends DevoteeWithProfile {
  weeklyStats?: WeeklyStats;
}

// Creating a new devotee group
export const createDevoteeGroup = async (group: Omit<DevoteeGroup, "id">): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "devoteeGroups"), {
      ...group,
      createdAt: group.createdAt instanceof Date ? Timestamp.fromDate(group.createdAt) : group.createdAt
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error creating devotee group:", error);
    throw error;
  }
};

// Get all groups created by an admin
export const getDevoteeGroups = async (adminId: string): Promise<DevoteeGroup[]> => {
  try {
    const q = query(
      collection(db, "devoteeGroups"),
      where("adminId", "==", adminId)
    );
    
    const snapshot = await getDocs(q);
    const groups: DevoteeGroup[] = [];
    
    for (const docSnapshot of snapshot.docs) {
      const groupData = docSnapshot.data() as Omit<DevoteeGroup, "id">;
      
      // Count members in this group
      const membersQuery = query(
        collection(db, "groupMemberships"),
        where("groupId", "==", docSnapshot.id)
      );
      
      const membersSnapshot = await getDocs(membersQuery);
      
      groups.push({
        id: docSnapshot.id,
        ...groupData,
        createdAt: groupData.createdAt instanceof Timestamp ? 
          groupData.createdAt.toDate() : 
          groupData.createdAt,
        devoteeCount: membersSnapshot.size
      });
    }
    
    // Sort in memory instead of using orderBy to avoid index issues
    return groups.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date();
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date();
      return dateB.getTime() - dateA.getTime(); // Descending (newest first)
    });
  } catch (error) {
    console.error("Error getting devotee groups:", error);
    throw error;
  }
};

// Get all devotees in a group
export const getDevoteesInGroup = async (groupId: string): Promise<DevoteeWithProfile[]> => {
  try {
    const q = query(
      collection(db, "groupMemberships"),
      where("groupId", "==", groupId)
    );
    
    const snapshot = await getDocs(q);
    const devotees: DevoteeWithProfile[] = [];
    
    for (const docSnapshot of snapshot.docs) {
      const membershipData = docSnapshot.data() as GroupMembership;
      
      // Get the user profile for this devotee
      const userDocRef = doc(db, "users", membershipData.userId);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as UserProfile;
        
        devotees.push({
          id: membershipData.userId,
          ...userData,
          joinDate: membershipData.joinedAt
        });
      }
    }
    
    return devotees;
  } catch (error) {
    console.error("Error getting devotees in group:", error);
    throw error;
  }
};

// Get all available groups for a devotee to join
export const getAvailableGroups = async (): Promise<DevoteeGroup[]> => {
  try {
    const q = query(
      collection(db, "devoteeGroups")
    );
    
    const snapshot = await getDocs(q);
    const groups: DevoteeGroup[] = [];
    
    for (const docSnapshot of snapshot.docs) {
      const groupData = docSnapshot.data() as Omit<DevoteeGroup, "id">;
      
      groups.push({
        id: docSnapshot.id,
        ...groupData,
        createdAt: groupData.createdAt instanceof Timestamp ? 
          groupData.createdAt.toDate() : 
          groupData.createdAt
      });
    }
    
    // Sort in memory instead of using orderBy to avoid index issues
    return groups.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date();
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date();
      return dateB.getTime() - dateA.getTime(); // Descending (newest first)
    });
  } catch (error) {
    console.error("Error getting available groups:", error);
    throw error;
  }
};

// Get groups a user has joined
export const getUserGroups = async (userId: string): Promise<DevoteeGroup[]> => {
  try {
    // Get all group memberships for this user
    const membershipQuery = query(
      collection(db, "groupMemberships"),
      where("userId", "==", userId)
    );
    
    const membershipSnapshot = await getDocs(membershipQuery);
    const groups: DevoteeGroup[] = [];
    
    for (const memberDoc of membershipSnapshot.docs) {
      const membership = memberDoc.data() as GroupMembership;
      
      // Get group details
      const groupDocRef = doc(db, "devoteeGroups", membership.groupId);
      const groupDocSnap = await getDoc(groupDocRef);
      
      if (groupDocSnap.exists()) {
        const groupData = groupDocSnap.data() as Omit<DevoteeGroup, "id">;
        
        groups.push({
          id: groupDocSnap.id,
          ...groupData,
          createdAt: groupData.createdAt instanceof Timestamp ? 
            groupData.createdAt.toDate() : 
            groupData.createdAt
        });
      }
    }
    
    return groups;
  } catch (error) {
    console.error("Error getting user groups:", error);
    throw error;
  }
};

// Join a devotee group
export const joinDevoteeGroup = async (userId: string, groupId: string): Promise<void> => {
  try {
    // Check if user is already in the group
    const membershipQuery = query(
      collection(db, "groupMemberships"),
      where("userId", "==", userId),
      where("groupId", "==", groupId)
    );
    
    const membershipSnapshot = await getDocs(membershipQuery);
    
    if (!membershipSnapshot.empty) {
      throw new Error("You are already a member of this group");
    }
    
    // Add user to group
    await addDoc(collection(db, "groupMemberships"), {
      userId,
      groupId,
      joinedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error joining group:", error);
    throw error;
  }
};

// Leave a group
export const leaveGroup = async (userId: string, groupId: string): Promise<boolean> => {
  try {
    const membershipQuery = query(
      collection(db, "groupMemberships"),
      where("userId", "==", userId),
      where("groupId", "==", groupId)
    );
    
    const membershipSnapshot = await getDocs(membershipQuery);
    
    if (membershipSnapshot.empty) {
      throw new Error("You are not a member of this group");
    }
    
    await deleteDoc(membershipSnapshot.docs[0].ref);
    return true;
  } catch (error) {
    console.error("Error leaving group:", error);
    throw error;
  }
};

// Delete a group - new function
export const deleteDevoteeGroup = async (groupId: string, adminId: string): Promise<boolean> => {
  try {
    // First check if the current user is the admin of this group
    const groupRef = doc(db, "devoteeGroups", groupId);
    const groupSnap = await getDoc(groupRef);
    
    if (!groupSnap.exists()) {
      throw new Error("Group not found");
    }
    
    const groupData = groupSnap.data() as DevoteeGroup;
    
    if (groupData.adminId !== adminId) {
      throw new Error("You don't have permission to delete this group");
    }
    
    // Get all memberships for this group to delete them
    const membershipQuery = query(
      collection(db, "groupMemberships"),
      where("groupId", "==", groupId)
    );
    
    const membershipSnapshot = await getDocs(membershipQuery);
    
    // Delete all memberships in a batch-like approach
    const deleteMemberships = membershipSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deleteMemberships);
    
    // Now delete the group itself
    await deleteDoc(groupRef);
    
    return true;
  } catch (error) {
    console.error("Error deleting group:", error);
    throw error;
  }
};

// Make sure the getDevoteeDetails function properly handles dates
export const getDevoteeDetails = async (userId: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const userData = docSnap.data() as UserProfile;
      
      // Ensure date fields are properly converted from Timestamps to Dates
      if (userData.dateOfBirth && userData.dateOfBirth instanceof Timestamp) {
        userData.dateOfBirth = userData.dateOfBirth.toDate();
      }
      
      if (userData.joinDate && userData.joinDate instanceof Timestamp) {
        userData.joinDate = userData.joinDate.toDate();
      }
      
      return userData;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting devotee details:", error);
    throw error;
  }
};

// Get the sadhana progress for all devotees in a group
export const getGroupSadhanaProgress = async (
  groupId: string, 
  searchQuery: string = ""
): Promise<DevoteeSadhanaProgress[]> => {
  try {
    // First get all devotees in the group
    const devotees = await getDevoteesInGroup(groupId);
    
    // Filter devotees by search query if provided
    const filteredDevotees = searchQuery 
      ? devotees.filter(devotee => {
          const nameMatch = devotee.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
          const spiritualNameMatch = devotee.spiritualName?.toLowerCase().includes(searchQuery.toLowerCase());
          const phoneMatch = devotee.phoneNumber?.includes(searchQuery);
          return nameMatch || spiritualNameMatch || phoneMatch;
        })
      : devotees;
    
    // Get today's date
    const today = new Date();
    
    // Start date is 7 days ago
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6);
    
    // For each devotee, get their weekly stats
    const progressPromises = filteredDevotees.map(async (devotee) => {
      try {
        const weeklyStats = await getWeeklySadhana(devotee.id, startDate);
        
        return {
          ...devotee,
          weeklyStats
        };
      } catch (error) {
        console.error(`Error getting stats for devotee ${devotee.id}:`, error);
        return devotee; // Return devotee without stats if there's an error
      }
    });
    
    const progressData = await Promise.all(progressPromises);
    return progressData;
  } catch (error) {
    console.error("Error getting group sadhana progress:", error);
    throw error;
  }
};

// Search devotees across all groups (for admin)
export const searchDevotees = async (
  adminId: string,
  searchQuery: string
): Promise<DevoteeSadhanaProgress[]> => {
  try {
    // Get all groups for this admin
    const groups = await getDevoteeGroups(adminId);
    
    // Get all devotees from all groups
    const allDevoteesPromises = groups.map(group => getDevoteesInGroup(group.id));
    const allDevoteesArrays = await Promise.all(allDevoteesPromises);
    
    // Flatten the array and remove duplicates
    const allDevotees = Array.from(
      new Map(
        allDevoteesArrays.flat().map(devotee => [devotee.id, devotee])
      ).values()
    );
    
    // Filter devotees by search query
    const filteredDevotees = allDevotees.filter(devotee => {
      const nameMatch = devotee.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
      const spiritualNameMatch = devotee.spiritualName?.toLowerCase().includes(searchQuery.toLowerCase());
      const phoneMatch = devotee.phoneNumber?.includes(searchQuery);
      return nameMatch || spiritualNameMatch || phoneMatch;
    });
    
    // Get today's date
    const today = new Date();
    
    // Start date is 7 days ago
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6);
    
    // For each devotee, get their weekly stats
    const progressPromises = filteredDevotees.map(async (devotee) => {
      try {
        const weeklyStats = await getWeeklySadhana(devotee.id, startDate);
        
        return {
          ...devotee,
          weeklyStats
        };
      } catch (error) {
        console.error(`Error getting stats for devotee ${devotee.id}:`, error);
        return devotee; // Return devotee without stats if there's an error
      }
    });
    
    const progressData = await Promise.all(progressPromises);
    return progressData;
  } catch (error) {
    console.error("Error searching devotees:", error);
    throw error;
  }
};

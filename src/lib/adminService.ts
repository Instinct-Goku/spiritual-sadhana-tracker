
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp, 
  orderBy,
  updateDoc,
  doc,
  getDoc,
  deleteDoc,
  DocumentReference,
  DocumentData
} from "firebase/firestore";
import { db } from "./firebase";
import { UserProfile } from "@/contexts/AuthContext";

// Types
export interface DevoteeGroup {
  id: string;
  name: string;
  description: string;
  adminId: string;
  createdAt: Date | Timestamp;
  devoteeCount?: number;
}

export interface DevoteeWithProfile extends UserProfile {
  id: string;
}

export interface GroupMembership {
  id?: string;
  userId: string;
  groupId: string;
  joinedAt: Date | Timestamp;
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
      where("adminId", "==", adminId),
      orderBy("createdAt", "desc")
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
    
    return groups;
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
          joinDate: userData.joinDate instanceof Timestamp ? 
            userData.joinDate.toDate() : 
            userData.joinDate
        });
      }
    }
    
    return devotees;
  } catch (error) {
    console.error("Error getting devotees in group:", error);
    throw error;
  }
};

// Join a devotee group
export const joinDevoteeGroup = async (userId: string, groupId: string): Promise<string> => {
  try {
    // Check if user is already in the group
    const existingQuery = query(
      collection(db, "groupMemberships"),
      where("userId", "==", userId),
      where("groupId", "==", groupId)
    );
    
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      throw new Error("You're already a member of this group");
    }
    
    // Add user to group
    const membershipData: GroupMembership = {
      userId,
      groupId,
      joinedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, "groupMemberships"), membershipData);
    return docRef.id;
  } catch (error) {
    console.error("Error joining devotee group:", error);
    throw error;
  }
};

// Get all available groups for a devotee to join
export const getAvailableGroups = async (): Promise<DevoteeGroup[]> => {
  try {
    const q = query(
      collection(db, "devoteeGroups"),
      orderBy("createdAt", "desc")
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
    
    return groups;
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

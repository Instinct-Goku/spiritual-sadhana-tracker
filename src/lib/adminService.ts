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
import { getWeeklySadhana } from "./sadhanaService";

export interface DevoteeSadhanaProgress {
  id: string;
  displayName: string;
  spiritualName?: string;
  phoneNumber?: string;
  photoURL?: string;
  email?: string;
  batchName?: string; // Added batchName property
  weeklyStats?: {
    averageChantingRounds: number;
    averageReadingMinutes: number;
    mangalaAratiAttendance: number;
    morningProgramAttendance: number;
  };
}

export const searchDevotees = async (
  adminId: string,
  searchTerm: string
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
        displayName: data.displayName || "N/A",
        spiritualName: data.spiritualName || "",
        phoneNumber: data.phoneNumber || "",
        photoURL: data.photoURL || "",
        email: data.email || "",
        batchName: data.batchName || "",
      };
      resultsMap[doc.id] = devotee;
    });

    // Process phone number results, avoiding duplicates
    phoneNumberSnapshot.forEach((doc) => {
      if (!resultsMap[doc.id]) {
        const data = doc.data();
        const devotee: DevoteeSadhanaProgress = {
          id: doc.id,
          displayName: data.displayName || "N/A",
          spiritualName: data.spiritualName || "",
          phoneNumber: data.phoneNumber || "",
          photoURL: data.photoURL || "",
          email: data.email || "",
          batchName: data.batchName || "",
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

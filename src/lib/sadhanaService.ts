
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
  deleteDoc,
  getDoc
} from "firebase/firestore";
import { db } from "./firebase";

export interface SadhanaEntry {
  id?: string;
  userId: string;
  date: Date | Timestamp;
  chantingRounds: number;
  readingMinutes: number;
  wakeUpTime: string;
  sleepTime: string;
  morningProgram: boolean;
  mangalaArati: boolean;
  eveningArati: boolean;
  spiritualClass: boolean;
  prasadam: boolean;
  notes?: string;
}

export interface WeeklyStats {
  totalChantingRounds: number;
  averageChantingRounds: number;
  totalReadingMinutes: number;
  averageReadingMinutes: number;
  mangalaAratiAttendance: number; // percentage
  morningProgramAttendance: number; // percentage
  averageWakeUpHour: number;
  prasadamMaintained: number; // percentage
  entries: SadhanaEntry[];
}

export const addSadhanaEntry = async (entry: Omit<SadhanaEntry, 'id'>) => {
  try {
    // Convert date to Firestore Timestamp if it's a JavaScript Date
    const formattedEntry = {
      ...entry,
      date: entry.date instanceof Date ? Timestamp.fromDate(entry.date) : entry.date
    };
    
    const docRef = await addDoc(collection(db, "sadhana"), formattedEntry);
    return { id: docRef.id, ...formattedEntry };
  } catch (error) {
    console.error("Error adding sadhana entry:", error);
    throw error;
  }
};

export const updateSadhanaEntry = async (id: string, entry: Partial<SadhanaEntry>) => {
  try {
    // Convert date to Firestore Timestamp if it's a JavaScript Date
    const updatedData = { ...entry };
    if (entry.date && entry.date instanceof Date) {
      updatedData.date = Timestamp.fromDate(entry.date);
    }
    
    await updateDoc(doc(db, "sadhana", id), updatedData);
    return true;
  } catch (error) {
    console.error("Error updating sadhana entry:", error);
    throw error;
  }
};

export const deleteSadhanaEntry = async (id: string) => {
  try {
    await deleteDoc(doc(db, "sadhana", id));
    return true;
  } catch (error) {
    console.error("Error deleting sadhana entry:", error);
    throw error;
  }
};

export const getSadhanaEntry = async (id: string) => {
  try {
    const docSnap = await getDoc(doc(db, "sadhana", id));
    if (docSnap.exists()) {
      const data = docSnap.data() as Omit<SadhanaEntry, 'id'>;
      // Convert Firestore Timestamp to JavaScript Date
      return { 
        id: docSnap.id, 
        ...data,
        date: data.date instanceof Timestamp ? data.date.toDate() : data.date
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting sadhana entry:", error);
    throw error;
  }
};

export const getDailySadhana = async (userId: string, date: Date) => {
  try {
    // Set time to start of day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    // Set time to end of day
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    const q = query(
      collection(db, "sadhana"),
      where("userId", "==", userId),
      where("date", ">=", Timestamp.fromDate(startDate)),
      where("date", "<=", Timestamp.fromDate(endDate))
    );
    
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const data = doc.data() as Omit<SadhanaEntry, 'id'>;
      
      return {
        id: doc.id,
        ...data,
        date: data.date instanceof Timestamp ? data.date.toDate() : data.date
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error getting daily sadhana:", error);
    throw error;
  }
};

export const getWeeklySadhana = async (userId: string, startDate: Date): Promise<WeeklyStats> => {
  try {
    // Calculate the end date (7 days from start date)
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    
    // Set start date time to beginning of day
    startDate.setHours(0, 0, 0, 0);
    
    const q = query(
      collection(db, "sadhana"),
      where("userId", "==", userId),
      where("date", ">=", Timestamp.fromDate(startDate)),
      where("date", "<=", Timestamp.fromDate(endDate)),
      orderBy("date", "asc")
    );
    
    const snapshot = await getDocs(q);
    
    const entries: SadhanaEntry[] = snapshot.docs.map(doc => {
      const data = doc.data() as Omit<SadhanaEntry, 'id'>;
      return {
        id: doc.id,
        ...data,
        date: data.date instanceof Timestamp ? data.date.toDate() : data.date
      };
    });
    
    // Calculate statistics
    const stats: WeeklyStats = {
      totalChantingRounds: 0,
      averageChantingRounds: 0,
      totalReadingMinutes: 0,
      averageReadingMinutes: 0,
      mangalaAratiAttendance: 0,
      morningProgramAttendance: 0,
      averageWakeUpHour: 0,
      prasadamMaintained: 0,
      entries: entries
    };
    
    if (entries.length === 0) {
      return stats;
    }
    
    // Calculate totals and averages
    let totalWakeUpHours = 0;
    let mangalaAratiCount = 0;
    let morningProgramCount = 0;
    let prasadamCount = 0;
    
    entries.forEach(entry => {
      stats.totalChantingRounds += entry.chantingRounds;
      stats.totalReadingMinutes += entry.readingMinutes;
      
      // Calculate wake up hour
      const [hours] = entry.wakeUpTime.split(':').map(Number);
      totalWakeUpHours += hours;
      
      if (entry.mangalaArati) mangalaAratiCount++;
      if (entry.morningProgram) morningProgramCount++;
      if (entry.prasadam) prasadamCount++;
    });
    
    stats.averageChantingRounds = parseFloat((stats.totalChantingRounds / entries.length).toFixed(1));
    stats.averageReadingMinutes = Math.round(stats.totalReadingMinutes / entries.length);
    stats.averageWakeUpHour = parseFloat((totalWakeUpHours / entries.length).toFixed(1));
    stats.mangalaAratiAttendance = parseFloat(((mangalaAratiCount / entries.length) * 100).toFixed(1));
    stats.morningProgramAttendance = parseFloat(((morningProgramCount / entries.length) * 100).toFixed(1));
    stats.prasadamMaintained = parseFloat(((prasadamCount / entries.length) * 100).toFixed(1));
    
    return stats;
  } catch (error) {
    console.error("Error getting weekly sadhana:", error);
    throw error;
  }
};

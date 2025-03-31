
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
  chantingCompletionTime: string;
  readingMinutes: number;
  hearingMinutes: number;
  wakeUpTime: string;
  sleepTime: string;
  daySleepDuration: number;
  mangalaArati: boolean;
  tulsiArati: boolean;
  narsimhaArati: boolean;
  guruPuja: boolean;
  bhagavatamClass: boolean;
  morningProgram: boolean;
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
  totalHearingMinutes: number;
  averageHearingMinutes: number;
  mangalaAratiAttendance: number; // percentage
  morningProgramAttendance: number; // percentage
  averageWakeUpHour: number;
  prasadamMaintained: number; // percentage
  entries: SadhanaEntry[];
}

export const addSadhanaEntry = async (entry: Omit<SadhanaEntry, 'id'>) => {
  try {
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
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    const q = query(
      collection(db, "sadhana"),
      where("userId", "==", userId)
    );
    
    const snapshot = await getDocs(q);
    
    const results = snapshot.docs.filter(doc => {
      const data = doc.data();
      const entryDate = data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date);
      return entryDate >= startDate && entryDate <= endDate;
    });
    
    if (results.length > 0) {
      const doc = results[0];
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
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    
    startDate.setHours(0, 0, 0, 0);
    
    const q = query(
      collection(db, "sadhana"),
      where("userId", "==", userId)
    );
    
    const snapshot = await getDocs(q);
    
    const filteredDocs = snapshot.docs.filter(doc => {
      const data = doc.data();
      const entryDate = data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date);
      return entryDate >= startDate && entryDate <= endDate;
    });
    
    filteredDocs.sort((a, b) => {
      const dateA = a.data().date instanceof Timestamp ? a.data().date.toDate() : new Date(a.data().date);
      const dateB = b.data().date instanceof Timestamp ? b.data().date.toDate() : new Date(b.data().date);
      return dateA.getTime() - dateB.getTime();
    });
    
    const entries: SadhanaEntry[] = filteredDocs.map(doc => {
      const data = doc.data() as Omit<SadhanaEntry, 'id'>;
      return {
        id: doc.id,
        ...data,
        date: data.date instanceof Timestamp ? data.date.toDate() : data.date
      };
    });
    
    const stats: WeeklyStats = {
      totalChantingRounds: 0,
      averageChantingRounds: 0,
      totalReadingMinutes: 0,
      averageReadingMinutes: 0,
      totalHearingMinutes: 0,
      averageHearingMinutes: 0,
      mangalaAratiAttendance: 0,
      morningProgramAttendance: 0,
      averageWakeUpHour: 0,
      prasadamMaintained: 0,
      entries: entries
    };
    
    if (entries.length === 0) {
      return stats;
    }
    
    let totalWakeUpHours = 0;
    let mangalaAratiCount = 0;
    let morningProgramCount = 0;
    let prasadamCount = 0;
    
    entries.forEach(entry => {
      stats.totalChantingRounds += entry.chantingRounds;
      stats.totalReadingMinutes += entry.readingMinutes;
      stats.totalHearingMinutes += entry.hearingMinutes || 0;
      
      const [hours] = entry.wakeUpTime.split(':').map(Number);
      totalWakeUpHours += hours;
      
      if (entry.mangalaArati) mangalaAratiCount++;
      if (entry.morningProgram) morningProgramCount++;
      if (entry.prasadam) prasadamCount++;
    });
    
    stats.averageChantingRounds = parseFloat((stats.totalChantingRounds / entries.length).toFixed(1));
    stats.averageReadingMinutes = Math.round(stats.totalReadingMinutes / entries.length);
    stats.averageHearingMinutes = Math.round(stats.totalHearingMinutes / entries.length);
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

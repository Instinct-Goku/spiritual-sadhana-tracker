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
import { 
  calculateSadhanaScore, 
  calculateWeeklySadhanaScore,
  isWeeklyScoringEnabled
} from "./scoringService";

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
  notes?: string;
  score?: number;
  scoreBreakdown?: {
    sleepTimeScore: number;
    wakeUpTimeScore: number;
    readingScore: number;
    readingMaxScore?: number;
    daySleepScore: number;
    japaCompletionScore: number;
    programScore: number;
  };
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
  totalScore: number;
  averageScore: number;
  dailyScores: { day: string; score: number }[];
  entries: SadhanaEntry[];
  scoreBreakdown?: {
    sleepTimeScore: number;
    wakeUpTimeScore: number;
    readingScore: number;
    readingMaxScore?: number;
    daySleepScore: number;
    japaCompletionScore: number;
    programScore: number;
  };
}

export interface WeeklySummary {
  startDate: Date;
  endDate: Date;
  totalScore: number;
  averageScore: number;
  totalChantingRounds: number;
  totalReadingMinutes: number;
}

export const safeConvertToDate = (input: any): Date | null => {
  if (input instanceof Date && !isNaN(input.getTime())) {
    return input;
  }
  if (input instanceof Timestamp) {
    return input.toDate();
  }
  if (typeof input === 'string' || typeof input === 'number') {
    const date = new Date(input);
    return !isNaN(date.getTime()) ? date : null;
  }
  return null;
};

export const addSadhanaEntry = async (entry: Omit<SadhanaEntry, 'id'>, batchName?: string) => {
  try {
    let scoreData = {};
    if (batchName) {
      if (isWeeklyScoringEnabled()) {
        // For weekly scoring, we just save the entry without a score
        // Scores will be calculated when viewing weekly stats
      } else {
        const scoreResult = calculateSadhanaScore(entry, batchName);
        scoreData = {
          score: scoreResult.totalScore,
          scoreBreakdown: scoreResult.breakdowns
        };
      }
    }
    
    const formattedEntry = {
      ...entry,
      ...scoreData,
      date: entry.date instanceof Date ? Timestamp.fromDate(entry.date) : entry.date
    };
    
    const docRef = await addDoc(collection(db, "sadhana"), formattedEntry);
    return { id: docRef.id, ...formattedEntry };
  } catch (error) {
    console.error("Error adding sadhana entry:", error);
    throw error;
  }
};

export const updateSadhanaEntry = async (id: string, entry: Partial<SadhanaEntry>, batchName?: string) => {
  try {
    const updatedData = { ...entry };
    
    if (batchName && !isWeeklyScoringEnabled()) {
      const currentEntry = await getSadhanaEntry(id);
      if (currentEntry) {
        const mergedEntry = { ...currentEntry, ...entry };
        const scoreResult = calculateSadhanaScore(mergedEntry, batchName);
        updatedData.score = scoreResult.totalScore;
        updatedData.scoreBreakdown = scoreResult.breakdowns;
      }
    }
    
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
      const dateValue = data.date instanceof Timestamp ? data.date.toDate() : data.date;
      
      const safeDate = safeConvertToDate(dateValue) || new Date();
      
      return { 
        id: docSnap.id, 
        ...data,
        date: safeDate
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
      let entryDate = safeConvertToDate(data.date);
      
      if (!entryDate) {
        console.warn("Invalid date in sadhana entry, skipping:", data);
        return false;
      }
      
      return entryDate >= startDate && entryDate <= endDate;
    });
    
    if (results.length > 0) {
      const doc = results[0];
      const data = doc.data() as Omit<SadhanaEntry, 'id'>;
      const safeDate = safeConvertToDate(data.date) || new Date();
      
      return {
        id: doc.id,
        ...data,
        date: safeDate
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error getting daily sadhana:", error);
    throw error;
  }
};

export const getWeeklySadhana = async (userId: string, startDate: Date, batchName?: string): Promise<WeeklyStats> => {
  try {
    const startDateCopy = new Date(startDate);
    startDateCopy.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDateCopy);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    
    const q = query(
      collection(db, "sadhana"),
      where("userId", "==", userId)
    );
    
    const snapshot = await getDocs(q);
    
    const filteredDocs = snapshot.docs.filter(doc => {
      const data = doc.data();
      const entryDate = safeConvertToDate(data.date);
      
      if (!entryDate) {
        console.warn("Invalid date in sadhana entry during filtering, skipping:", data);
        return false;
      }
      
      return entryDate >= startDateCopy && entryDate <= endDate;
    });
    
    filteredDocs.sort((a, b) => {
      const dateA = safeConvertToDate(a.data().date) || new Date();
      const dateB = safeConvertToDate(b.data().date) || new Date();
      return dateA.getTime() - dateB.getTime();
    });
    
    const entries: SadhanaEntry[] = filteredDocs.map(doc => {
      const data = doc.data() as Omit<SadhanaEntry, 'id'>;
      const safeDate = safeConvertToDate(data.date) || new Date();
      
      return {
        id: doc.id,
        ...data,
        date: safeDate
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
      totalScore: 0,
      averageScore: 0,
      dailyScores: [],
      entries: entries
    };
    
    if (entries.length === 0) {
      return stats;
    }
    
    let totalWakeUpHours = 0;
    let mangalaAratiCount = 0;
    let morningProgramCount = 0;
    
    entries.forEach(entry => {
      stats.totalChantingRounds += entry.chantingRounds;
      stats.totalReadingMinutes += entry.readingMinutes;
      stats.totalHearingMinutes += entry.hearingMinutes || 0;
      
      try {
        if (entry.wakeUpTime && typeof entry.wakeUpTime === 'string') {
          const [hours] = entry.wakeUpTime.split(':').map(Number);
          if (!isNaN(hours)) {
            totalWakeUpHours += hours;
          }
        }
      } catch (error) {
        console.warn("Error processing wakeUpTime:", error);
      }
      
      if (entry.mangalaArati) mangalaAratiCount++;
      if (entry.morningProgram) morningProgramCount++;
    });
    
    stats.averageChantingRounds = parseFloat((stats.totalChantingRounds / entries.length).toFixed(1));
    stats.averageReadingMinutes = Math.round(stats.totalReadingMinutes / entries.length);
    stats.averageHearingMinutes = Math.round(stats.totalHearingMinutes / entries.length);
    stats.averageWakeUpHour = parseFloat((totalWakeUpHours / entries.length).toFixed(1));
    stats.mangalaAratiAttendance = parseFloat(((mangalaAratiCount / entries.length) * 100).toFixed(1));
    stats.morningProgramAttendance = parseFloat(((morningProgramCount / entries.length) * 100).toFixed(1));
    
    if (isWeeklyScoringEnabled() && batchName) {
      const weeklyScore = calculateWeeklySadhanaScore(entries, batchName);
      stats.totalScore = weeklyScore.totalScore;
      stats.averageScore = weeklyScore.averageScore;
      stats.scoreBreakdown = {
        sleepTimeScore: weeklyScore.breakdowns.sleepTimeScore,
        wakeUpTimeScore: weeklyScore.breakdowns.wakeUpTimeScore,
        readingScore: weeklyScore.breakdowns.readingScore,
        daySleepScore: weeklyScore.breakdowns.daySleepScore,
        japaCompletionScore: weeklyScore.breakdowns.japaCompletionScore,
        programScore: weeklyScore.breakdowns.programScore
      };
      
      entries.forEach(entry => {
        const entryDate = entry.date instanceof Date ? entry.date : new Date();
        const day = entryDate.toLocaleDateString('en-US', { weekday: 'short' });
        
        stats.dailyScores.push({
          day,
          score: Math.round(weeklyScore.averageScore)
        });
      });
    } else {
      let totalScore = 0;
      let combinedBreakdown = {
        sleepTimeScore: 0,
        wakeUpTimeScore: 0,
        readingScore: 0,
        readingMaxScore: 0,
        daySleepScore: 0,
        japaCompletionScore: 0,
        programScore: 0
      };
      
      entries.forEach(entry => {
        if (entry.score !== undefined) {
          totalScore += entry.score;
          
          // Add to combined breakdown if available
          if (entry.scoreBreakdown) {
            combinedBreakdown.sleepTimeScore += entry.scoreBreakdown.sleepTimeScore;
            combinedBreakdown.wakeUpTimeScore += entry.scoreBreakdown.wakeUpTimeScore;
            combinedBreakdown.readingScore += entry.scoreBreakdown.readingScore;
            combinedBreakdown.daySleepScore += entry.scoreBreakdown.daySleepScore;
            combinedBreakdown.japaCompletionScore += entry.scoreBreakdown.japaCompletionScore;
            combinedBreakdown.programScore += entry.scoreBreakdown.programScore;
            
            // Store max reading score if available
            if (entry.scoreBreakdown.readingMaxScore && !combinedBreakdown.readingMaxScore) {
              combinedBreakdown.readingMaxScore = entry.scoreBreakdown.readingMaxScore;
            }
          }
          
          const entryDate = entry.date instanceof Date ? entry.date : new Date();
          const day = entryDate.toLocaleDateString('en-US', { weekday: 'short' });
          
          stats.dailyScores.push({
            day,
            score: entry.score
          });
        } else if (batchName) {
          const scoreResult = calculateSadhanaScore(entry, batchName);
          totalScore += scoreResult.totalScore;
          
          // Add to combined breakdown
          combinedBreakdown.sleepTimeScore += scoreResult.breakdowns.sleepTimeScore;
          combinedBreakdown.wakeUpTimeScore += scoreResult.breakdowns.wakeUpTimeScore;
          combinedBreakdown.readingScore += scoreResult.breakdowns.readingScore;
          combinedBreakdown.daySleepScore += scoreResult.breakdowns.daySleepScore;
          combinedBreakdown.japaCompletionScore += scoreResult.breakdowns.japaCompletionScore;
          combinedBreakdown.programScore += scoreResult.breakdowns.programScore;
          
          const entryDate = entry.date instanceof Date ? entry.date : new Date();
          const day = entryDate.toLocaleDateString('en-US', { weekday: 'short' });
          
          stats.dailyScores.push({
            day,
            score: scoreResult.totalScore
          });
        }
      });
      
      // Set the weekly stats total score and average
      stats.totalScore = totalScore;
      stats.averageScore = parseFloat((totalScore / entries.length).toFixed(1));
      
      // Calculate average breakdown scores
      stats.scoreBreakdown = {
        sleepTimeScore: Math.round(combinedBreakdown.sleepTimeScore / entries.length),
        wakeUpTimeScore: Math.round(combinedBreakdown.wakeUpTimeScore / entries.length),
        readingScore: Math.round(combinedBreakdown.readingScore / entries.length),
        readingMaxScore: combinedBreakdown.readingMaxScore,
        daySleepScore: Math.round(combinedBreakdown.daySleepScore / entries.length),
        japaCompletionScore: Math.round(combinedBreakdown.japaCompletionScore / entries.length),
        programScore: Math.round(combinedBreakdown.programScore / entries.length)
      };
    }
    
    return stats;
  } catch (error) {
    console.error("Error getting weekly sadhana:", error);
    throw error;
  }
};

export const getWeeklySadhanaHistory = async (userId: string, weeks: number = 8, batchName?: string): Promise<WeeklySummary[]> => {
  try {
    // Get current date and set to start of the week (Sunday)
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - currentDate.getDay());
    currentDate.setHours(0, 0, 0, 0);
    
    const results: WeeklySummary[] = [];
    
    // Fetch data for each week
    for (let i = 0; i < weeks; i++) {
      const weekStartDate = new Date(currentDate);
      weekStartDate.setDate(weekStartDate.getDate() - (7 * i));
      
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekEndDate.getDate() + 6);
      weekEndDate.setHours(23, 59, 59, 999);
      
      // Get all entries for this week
      const q = query(
        collection(db, "sadhana"),
        where("userId", "==", userId)
      );
      
      const snapshot = await getDocs(q);
      
      const weekEntries = snapshot.docs
        .map(doc => {
          const data = doc.data() as Omit<SadhanaEntry, 'id'>;
          const safeDate = safeConvertToDate(data.date) || new Date();
          
          return {
            id: doc.id,
            ...data,
            date: safeDate
          };
        })
        .filter(entry => {
          const entryDate = entry.date;
          return entryDate >= weekStartDate && entryDate <= weekEndDate;
        });
      
      if (weekEntries.length > 0) {
        // Calculate week stats
        let totalScore = 0;
        let totalChantingRounds = 0;
        let totalReadingMinutes = 0;
        
        if (isWeeklyScoringEnabled() && batchName) {
          const weeklyScore = calculateWeeklySadhanaScore(weekEntries, batchName);
          totalScore = weeklyScore.totalScore;
        } else {
          weekEntries.forEach(entry => {
            if (entry.score !== undefined) {
              totalScore += entry.score;
            } else if (batchName) {
              const scoreResult = calculateSadhanaScore(entry, batchName);
              totalScore += scoreResult.totalScore;
            }
          });
        }
        
        // Calculate totals
        weekEntries.forEach(entry => {
          totalChantingRounds += entry.chantingRounds;
          totalReadingMinutes += entry.readingMinutes;
        });
        
        results.push({
          startDate: weekStartDate,
          endDate: weekEndDate,
          totalScore,
          averageScore: parseFloat((totalScore / weekEntries.length).toFixed(1)),
          totalChantingRounds,
          totalReadingMinutes
        });
      } else {
        // Add empty week data to maintain continuity
        results.push({
          startDate: weekStartDate,
          endDate: weekEndDate,
          totalScore: 0,
          averageScore: 0,
          totalChantingRounds: 0,
          totalReadingMinutes: 0
        });
      }
    }
    
    // Sort from oldest to newest
    return results.reverse();
  } catch (error) {
    console.error("Error getting weekly sadhana history:", error);
    throw error;
  }
};

export const calculateAndSaveWeeklyScores = async (userId: string, startDate: Date, batchName: string) => {
  try {
    const weekStats = await getWeeklySadhana(userId, startDate);
    
    for (const entry of weekStats.entries) {
      if (entry.id && (entry.score === undefined || entry.scoreBreakdown === undefined)) {
        await updateSadhanaEntry(entry.id, {}, batchName);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error calculating and saving weekly scores:", error);
    throw error;
  }
};

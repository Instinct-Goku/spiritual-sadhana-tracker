import { SadhanaEntry } from "./sadhanaService";
import { UserProfile } from "@/contexts/AuthContext";
import { BatchCriteria as DBBatchCriteria } from "./adminService";

export interface BatchCriteria {
  name: string;
  isBrahmacharisBatch?: boolean;
  sleepTimeScoring: TimeRangeScore[];
  wakeUpTimeScoring: TimeRangeScore[];
  readingMinimum: number;
  daySleepScoring: DurationScore[];
  japaCompletionScoring: TimeRangeScore[];
  hearingMinimum: number;
  serviceMinimum: number;
  spLectureMinimum?: number;
  smLectureMinimum?: number;
  gsnsLectureMinimum?: number;
  hgrspLectureMinimum?: number;
  shlokaMinimum?: number;
  shlokaRecitationMinimum?: number;
  studyMinimum?: number;
  showShikshashtakam?: boolean;
  bcClassMinimum?: number;
  harinaamMinimum?: number;
  preachingMinimum?: number;
  slokaVaishnavSongMinimum?: number;
  totalBodyScore: number;
  totalSoulScore: number;
  totalSevaScore?: number;
  showSpLecture: boolean;
  showSmLecture: boolean;
  showGsnsLecture: boolean;
  showHgrspLecture: boolean;
  showBcClass?: boolean;
  showHarinaam?: boolean;
  showPreaching?: boolean;
  showSlokaVaishnavSong?: boolean;
}

export interface TimeRangeScore {
  startTime: string; // format: "HH:MM"
  endTime: string; // format: "HH:MM"
  points: number;
}

export interface DurationScore {
  maxDuration: number; // in minutes
  points: number;
}

export interface ProgramScoring {
  mangalaArati: number;
  tulsiArati: number;
  narsimhaArati: number;
  guruPuja: number;
  bhagavatamClass: number;
}

// Default batch criteria configurations
export const DEFAULT_BATCHES: Record<string, BatchCriteria> = {
  sahadev: {
    name: "Sahadev",
    sleepTimeScoring: [
      { startTime: "00:00", endTime: "22:00", points: 25 },
      { startTime: "22:00", endTime: "22:30", points: 20 },
      { startTime: "22:30", endTime: "23:00", points: 15 },
      { startTime: "23:00", endTime: "23:30", points: 10 },
      { startTime: "23:30", endTime: "23:59", points: 0 }
    ],
    wakeUpTimeScoring: [], // No points allotted
    readingMinimum: 90, // 1.5 hours
    daySleepScoring: [], // No points allotted
    japaCompletionScoring: [], // No points allotted
    hearingMinimum: 60, // 1 hour
    serviceMinimum: 60, // 1 hour
    spLectureMinimum: 60, // 1 hour
    shlokaMinimum: 1, // 1 shloka
    totalBodyScore: 25, // 25 for sleep time
    totalSoulScore: 235, // 90 reading + 60 hearing + 30 shloka + 45 program + 10 japa
    showSpLecture: true,
    showSmLecture: false,
    showGsnsLecture: false,
    showHgrspLecture: false
  },
  "sahadev-working": {
    name: "Sahadev - Working",
    sleepTimeScoring: [
      { startTime: "00:00", endTime: "22:00", points: 25 },
      { startTime: "22:00", endTime: "22:30", points: 20 },
      { startTime: "22:30", endTime: "23:00", points: 15 },
      { startTime: "23:00", endTime: "23:30", points: 10 },
      { startTime: "23:30", endTime: "23:59", points: 0 }
    ],
    wakeUpTimeScoring: [], // No points allotted
    readingMinimum: 90, // 1.5 hours
    daySleepScoring: [], // No points allotted
    japaCompletionScoring: [], // No points allotted
    hearingMinimum: 60, // 1 hour
    serviceMinimum: 60, // 1 hour
    studyMinimum: 60, // 1 hour study
    spLectureMinimum: 60, // 1 hour
    shlokaMinimum: 1, // 1 shloka
    totalBodyScore: 25, // 25 for sleep time
    totalSoulScore: 295, // 90 reading + 60 hearing + 60 study + 30 shloka + 45 program + 10 japa
    showSpLecture: true,
    showSmLecture: false,
    showGsnsLecture: false,
    showHgrspLecture: false,
    showShikshashtakam: true
  },
  nakula: {
    name: "Nakula",
    sleepTimeScoring: [
      { startTime: "00:00", endTime: "21:30", points: 25 },
      { startTime: "21:30", endTime: "22:00", points: 20 },
      { startTime: "22:00", endTime: "22:30", points: 15 },
      { startTime: "22:30", endTime: "23:00", points: 10 },
      { startTime: "23:00", endTime: "23:59", points: 0 }
    ],
    wakeUpTimeScoring: [
      { startTime: "00:00", endTime: "03:45", points: 25 },
      { startTime: "03:45", endTime: "04:00", points: 20 },
      { startTime: "04:00", endTime: "04:15", points: 15 },
      { startTime: "04:15", endTime: "23:59", points: 0 }
    ],
    readingMinimum: 150, // 2.5 hours
    daySleepScoring: [
      { maxDuration: 60, points: 25 }, // less than 1hr
      { maxDuration: 90, points: 20 }, // 1-1.5hr
      { maxDuration: Number.MAX_SAFE_INTEGER, points: 0 } // greater than 1.5hr
    ],
    japaCompletionScoring: [
      { startTime: "00:00", endTime: "07:00", points: 25 },
      { startTime: "07:00", endTime: "10:00", points: 20 },
      { startTime: "10:00", endTime: "15:00", points: 15 },
      { startTime: "15:00", endTime: "20:00", points: 10 },
      { startTime: "20:00", endTime: "23:59", points: 0 }
    ],
    hearingMinimum: 60, // 1 hour
    serviceMinimum: 90, // 1.5 hours
    spLectureMinimum: 60, // 1 hour
    shlokaMinimum: 1, // 1 shloka
    totalBodyScore: 75, // 25 sleep + 25 wake + 25 day sleep
    totalSoulScore: 280, // 150 reading + 60 hearing + 30 shloka + 45 program + 25 japa
    showSpLecture: true,
    showSmLecture: false,
    showGsnsLecture: false,
    showHgrspLecture: false
  },
  arjuna: {
    name: "Arjuna",
    sleepTimeScoring: [
      { startTime: "00:00", endTime: "21:30", points: 25 },
      { startTime: "21:30", endTime: "22:00", points: 15 },
      { startTime: "22:00", endTime: "22:30", points: 10 },
      { startTime: "22:30", endTime: "23:59", points: 0 }
    ],
    wakeUpTimeScoring: [
      { startTime: "00:00", endTime: "03:45", points: 25 },
      { startTime: "03:45", endTime: "04:00", points: 20 },
      { startTime: "04:00", endTime: "04:15", points: 15 },
      { startTime: "04:15", endTime: "23:59", points: 0 }
    ],
    readingMinimum: 210, // 3.5 hours
    daySleepScoring: [
      { maxDuration: 45, points: 25 }, // less than 45min
      { maxDuration: Number.MAX_SAFE_INTEGER, points: 0 } // greater than 45min
    ],
    japaCompletionScoring: [
      { startTime: "00:00", endTime: "07:00", points: 25 },
      { startTime: "07:00", endTime: "10:00", points: 20 },
      { startTime: "10:00", endTime: "15:00", points: 15 },
      { startTime: "15:00", endTime: "20:00", points: 10 },
      { startTime: "20:00", endTime: "23:59", points: 0 }
    ],
    hearingMinimum: 120, // 2 hours
    serviceMinimum: 120, // 2 hours
    spLectureMinimum: 60, // 1 hour
    smLectureMinimum: 60, // 1 hour
    shlokaMinimum: 2, // 2 shlokas
    totalBodyScore: 75, // 25 sleep + 25 wake + 25 day sleep
    totalSoulScore: 375, // 210 reading + 120 hearing + 60 shloka + 45 program + 25 japa
    showSpLecture: true,
    showSmLecture: true,
    showGsnsLecture: false,
    showHgrspLecture: false
  },
  yudhisthira: {
    name: "Yudhisthira",
    sleepTimeScoring: [
      { startTime: "00:00", endTime: "21:30", points: 25 },
      { startTime: "21:30", endTime: "22:00", points: 15 },
      { startTime: "22:00", endTime: "23:59", points: 0 }
    ],
    wakeUpTimeScoring: [
      { startTime: "00:00", endTime: "04:00", points: 25 },
      { startTime: "04:00", endTime: "23:59", points: 0 }
    ],
    readingMinimum: 300, // 5 hours
    daySleepScoring: [
      { maxDuration: 30, points: 25 }, // less than 30min
      { maxDuration: Number.MAX_SAFE_INTEGER, points: 0 } // greater than 30min
    ],
    japaCompletionScoring: [
      { startTime: "00:00", endTime: "07:00", points: 25 },
      { startTime: "07:00", endTime: "10:00", points: 20 },
      { startTime: "10:00", endTime: "15:00", points: 15 },
      { startTime: "15:00", endTime: "20:00", points: 10 },
      { startTime: "20:00", endTime: "23:59", points: 0 }
    ],
    hearingMinimum: 180, // 3 hours
    serviceMinimum: 150, // 2.5 hours
    spLectureMinimum: 60, // 1 hour
    smLectureMinimum: 60, // 1 hour
    gsnsLectureMinimum: 60, // 1 hour
    shlokaMinimum: 2, // 2 shlokas
    totalBodyScore: 75, // 25 sleep + 25 wake + 25 day sleep
    totalSoulScore: 485, // 300 reading + 180 hearing + 60 shloka + 45 program + 25 japa
    showSpLecture: true,
    showSmLecture: true,
    showGsnsLecture: true,
    showHgrspLecture: false
  },
  "nakula-working": {
    name: "Nakula - Working",
    sleepTimeScoring: [
      { startTime: "00:00", endTime: "21:30", points: 25 },
      { startTime: "21:30", endTime: "22:00", points: 15 },
      { startTime: "22:00", endTime: "23:59", points: 0 }
    ],
    wakeUpTimeScoring: [
      { startTime: "00:00", endTime: "04:00", points: 25 },
      { startTime: "04:00", endTime: "23:59", points: 0 }
    ],
    readingMinimum: 240, // 4 hours (slightly less than Yudhisthira)
    daySleepScoring: [
      { maxDuration: 45, points: 25 }, // less than 45min (more flexible for working)
      { maxDuration: Number.MAX_SAFE_INTEGER, points: 0 } // greater than 45min
    ],
    japaCompletionScoring: [
      { startTime: "00:00", endTime: "07:00", points: 25 },
      { startTime: "07:00", endTime: "10:00", points: 20 },
      { startTime: "10:00", endTime: "15:00", points: 15 },
      { startTime: "15:00", endTime: "20:00", points: 10 },
      { startTime: "20:00", endTime: "23:59", points: 0 }
    ],
    hearingMinimum: 120, // 2 hours (less than Yudhisthira)
    serviceMinimum: 90, // 1.5 hours (more flexible for working)
    spLectureMinimum: 60, // 1 hour
    smLectureMinimum: 60, // 1 hour
    gsnsLectureMinimum: 60, // 1 hour
    shlokaMinimum: 2, // 2 shlokas
    totalBodyScore: 75, // 25 sleep + 25 wake + 25 day sleep
    totalSoulScore: 445, // 240 reading + 120 hearing + 60 shloka + 45 program + 25 japa
    showSpLecture: true,
    showSmLecture: true,
    showGsnsLecture: true,
    showHgrspLecture: false
  },
  brahmacharis: {
    name: "Brahmacharis",
    isBrahmacharisBatch: true,
    sleepTimeScoring: [
      { startTime: "00:00", endTime: "22:01", points: 1 },
      { startTime: "22:01", endTime: "23:59", points: 0 }
    ],
    wakeUpTimeScoring: [
      { startTime: "00:00", endTime: "04:01", points: 1 },
      { startTime: "04:01", endTime: "23:59", points: 0 }
    ],
    readingMinimum: 270, // 4.5 hours weekly
    daySleepScoring: [
      { maxDuration: 30, points: 1 },
      { maxDuration: Number.MAX_SAFE_INTEGER, points: 0 }
    ],
    japaCompletionScoring: [
      { startTime: "00:00", endTime: "10:00", points: 1 },
      { startTime: "10:00", endTime: "23:59", points: 0 }
    ],
    hearingMinimum: 0,
    serviceMinimum: 210, // 3.5 hours weekly
    spLectureMinimum: 90, // 1.5 hours weekly
    smLectureMinimum: 90, // 1.5 hours weekly
    bcClassMinimum: 270, // 4.5 hours weekly
    harinaamMinimum: 2, // weekly count >= 2
    preachingMinimum: 360, // 6 hours daily (in minutes)
    slokaVaishnavSongMinimum: 90, // 1.5 hours weekly
    shlokaMinimum: 0,
    totalBodyScore: 21, // 3 marks/day × 7
    totalSoulScore: 26, // morning(14) + chanting(7) + reading(1) + hearing(3) + shloka(1)
    totalSevaScore: 9, // preaching(7) + service(1) + harinaam(1)
    showSpLecture: true,
    showSmLecture: true,
    showGsnsLecture: false,
    showHgrspLecture: false,
    showBcClass: true,
    showHarinaam: true,
    showPreaching: true,
    showSlokaVaishnavSong: true,
  }
};

// Common program scoring for all batches
export const PROGRAM_SCORING: ProgramScoring = {
  mangalaArati: 10,
  tulsiArati: 5,
  narsimhaArati: 5,
  guruPuja: 5,
  bhagavatamClass: 20
};

// Shloka scoring for all batches
export const SHLOKA_SCORING: Record<string, number> = {
  sahadev: 30,
  "sahadev-working": 30,
  nakula: 30,
  arjuna: 30,
  yudhisthira: 30,
  "nakula-working": 30,
  brahmacharis: 30
};

// Parse time string (HH:MM) to minutes since midnight
export const parseTimeToMinutes = (timeStr: string): number => {
  if (!timeStr || typeof timeStr !== 'string') return -1;
  
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return -1;
  
  return hours * 60 + minutes;
};

// Calculate score for time-based criteria
export const calculateTimeScore = (timeStr: string, scoring: TimeRangeScore[]): number => {
  if (!timeStr || !scoring.length) return 0;
  
  const timeMinutes = parseTimeToMinutes(timeStr);
  if (timeMinutes < 0) return 0;
  
  for (const range of scoring) {
    const startMinutes = parseTimeToMinutes(range.startTime);
    const endMinutes = parseTimeToMinutes(range.endTime);
    
    if (timeMinutes >= startMinutes && timeMinutes < endMinutes) {
      return range.points;
    }
  }
  
  return 0;
};

// Calculate score for duration-based criteria
export const calculateDurationScore = (duration: number, scoring: DurationScore[]): number => {
  if (duration === undefined || !scoring.length) return 0;
  
  for (const range of scoring.sort((a, b) => a.maxDuration - b.maxDuration)) {
    if (duration <= range.maxDuration) {
      return range.points;
    }
  }
  
  return 0;
};

// Calculate reading score (capped at batch minimum)
export const calculateReadingScore = (minutes: number, batchMinimum: number): number => {
  return Math.min(Math.max(0, minutes), batchMinimum); // Capped at batch minimum
};

// Calculate hearing score (sum of all hearing types, capped at batch minimum)
export const calculateHearingScore = (minutes: number, batchMinimum: number): number => {
  return Math.min(Math.max(0, minutes), batchMinimum); // Capped at batch minimum
};

// Calculate shloka score (supports dual criteria: count OR recitation time)
export const calculateShlokaScore = (
  shlokaCount: number, 
  shlokaRecitationMinutes: number,
  batchCriteria: BatchCriteria, 
  batchName: string
): number => {
  const minimumShlokas = batchCriteria.shlokaMinimum || 0;
  const minimumRecitation = batchCriteria.shlokaRecitationMinimum || 0;
  
  // Check if either criteria is met
  const countMet = shlokaCount >= minimumShlokas && minimumShlokas > 0;
  const recitationMet = shlokaRecitationMinutes >= minimumRecitation && minimumRecitation > 0;
  
  if (countMet || recitationMet) {
    return SHLOKA_SCORING[batchName.toLowerCase()] || 0;
  }
  return 0;
};

// Calculate program attendance score
export const calculateProgramScore = (entry: SadhanaEntry, batchCriteria?: BatchCriteria): number => {
  if (batchCriteria?.isBrahmacharisBatch) {
    let score = 0;
    if (entry.mangalaArati) score += 0.25;
    if (entry.tulsiArati) score += 0.25;
    if (entry.narsimhaArati) score += 0.25;
    if (entry.guruPuja) score += 0.25;
    if (entry.bhagavatamClass) score += 1;
    return score;
  }
  let score = 0;
  if (entry.mangalaArati) score += PROGRAM_SCORING.mangalaArati;
  if (entry.tulsiArati) score += PROGRAM_SCORING.tulsiArati;
  if (entry.narsimhaArati) score += PROGRAM_SCORING.narsimhaArati;
  if (entry.guruPuja) score += PROGRAM_SCORING.guruPuja;
  if (entry.bhagavatamClass) score += PROGRAM_SCORING.bhagavatamClass;
  return score;
};

// Check if weekly scoring is enabled
export const isWeeklyScoringEnabled = (): boolean => {
  const storedValue = localStorage.getItem("isWeeklyScoringEnabled");
  return storedValue === "true";
};

// Get batch configurations from storage or use defaults
export const getBatchConfigurations = (): Record<string, BatchCriteria> => {
  try {
    const storedConfigs = localStorage.getItem("batchConfigurations");
    if (storedConfigs) {
      return JSON.parse(storedConfigs);
    }
  } catch (error) {
    console.error("Error loading batch configurations:", error);
  }
  return DEFAULT_BATCHES;
};

// Get batch criteria based on user profile
export const getBatchCriteriaFromUserProfile = (userProfile: UserProfile | null): BatchCriteria => {
  const batchConfigs = getBatchConfigurations();
  
  // Try to get batch name from user profile
  let batchName = "sahadev"; // Default batch
  
  if (userProfile && userProfile.batch) {
    batchName = userProfile.batch.toLowerCase();
  } else if (userProfile && userProfile.batchName) {
    batchName = userProfile.batchName.toLowerCase();
  }
  
  // Handle different spellings for backwards compatibility
  if (batchName === "yudhisthir" || batchName === "yudhishthira") {
    batchName = "yudhisthira";
  }
  
  // Return the batch criteria or default to sahadev if not found
  return batchConfigs[batchName] || batchConfigs.sahadev;
};

// Get batch criteria for legacy use (simple interface)
export const getBatchCriteria = (batchName: string): DBBatchCriteria => {
  const fullCriteria = getBatchConfigurations()[batchName.toLowerCase()] || DEFAULT_BATCHES.sahadev;
  
  // Convert to simple format for backward compatibility
  return {
    chantingRoundsMinimum: 16,
    readingMinimum: fullCriteria.readingMinimum,
    spLectureMinimum: fullCriteria.spLectureMinimum,
    smLectureMinimum: fullCriteria.smLectureMinimum,
    gsnsLectureMinimum: fullCriteria.gsnsLectureMinimum,
    hgrspLectureMinimum: fullCriteria.hgrspLectureMinimum,
    serviceMinimum: fullCriteria.serviceMinimum,
    shlokaMinimum: fullCriteria.shlokaMinimum,
  };
};

// Calculate total score for a sadhana entry based on batch criteria
export const calculateSadhanaScore = (
  entry: SadhanaEntry, 
  batchNameOrProfile: string | UserProfile | null = "sahadev"
): { 
  totalScore: number;
  breakdowns: { 
    sleepTimeScore: number;
    wakeUpTimeScore: number;
    readingScore: number;
    daySleepScore: number;
    japaCompletionScore: number;
    programScore: number;
    hearingScore: number;
    shlokaScore: number;
    sevaScore: number;
  }
} => {
  let batchCriteria: BatchCriteria;
  let batchName: string;
  
  if (typeof batchNameOrProfile === 'string') {
    const batchConfigs = getBatchConfigurations();
    batchName = batchNameOrProfile.toLowerCase();
    batchCriteria = batchConfigs[batchName] || batchConfigs.sahadev;
  } else {
    batchCriteria = getBatchCriteriaFromUserProfile(batchNameOrProfile);
    batchName = batchNameOrProfile?.batch?.toLowerCase() || batchNameOrProfile?.batchName?.toLowerCase() || "sahadev";
  }
  
  const sleepTimeScore = calculateTimeScore(entry.sleepTime, batchCriteria.sleepTimeScoring);
  const wakeUpTimeScore = calculateTimeScore(entry.wakeUpTime, batchCriteria.wakeUpTimeScoring);
  const daySleepScore = calculateDurationScore(entry.daySleepDuration, batchCriteria.daySleepScoring);
  const japaCompletionScore = calculateTimeScore(entry.chantingCompletionTime, batchCriteria.japaCompletionScoring);
  const programScore = calculateProgramScore(entry, batchCriteria);
  
  let readingScore = 0;
  let hearingScore = 0;
  let shlokaScore = 0;
  let sevaScore = 0;
  
  if (batchCriteria.isBrahmacharisBatch) {
    // Brahmacharis: reading, hearing, shloka scored weekly (0 daily)
    // Seva: only preaching is daily
    const preachingMinutes = (entry as any).preachingMinutes || 0;
    if (batchCriteria.preachingMinimum && preachingMinutes >= batchCriteria.preachingMinimum) {
      sevaScore = 1;
    }
  } else {
    readingScore = calculateReadingScore(entry.readingMinutes, batchCriteria.readingMinimum);
    
    const spLectureMinutes = entry.spLectureMinutes || 0;
    const smLectureMinutes = entry.smLectureMinutes || 0;
    const gsnsLectureMinutes = entry.gsnsLectureMinutes || 0;
    const hgrspLectureMinutes = entry.hgrspLectureMinutes || 0;
    const totalHearingMinutes = spLectureMinutes + smLectureMinutes + gsnsLectureMinutes + hgrspLectureMinutes;
    hearingScore = calculateHearingScore(totalHearingMinutes, batchCriteria.hearingMinimum);
    
    shlokaScore = calculateShlokaScore(
      entry.shlokaCount || 0, 
      (entry as any).shlokaRecitationMinutes || 0,
      batchCriteria, 
      batchName
    );
  }
  
  const totalScore = 
    sleepTimeScore + wakeUpTimeScore + readingScore + daySleepScore + 
    japaCompletionScore + programScore + hearingScore + shlokaScore + sevaScore;
  
  return {
    totalScore,
    breakdowns: {
      sleepTimeScore, wakeUpTimeScore, readingScore, daySleepScore,
      japaCompletionScore, programScore, hearingScore, shlokaScore, sevaScore
    }
  };
};

// Calculate weekly consolidated score
export const calculateWeeklySadhanaScore = (
  entries: SadhanaEntry[],
  batchNameOrProfile: string | UserProfile | null = "sahadev"
): { 
  totalScore: number;
  averageScore: number;
  breakdowns: { 
    sleepTimeScore: number;
    wakeUpTimeScore: number;
    readingScore: number;
    daySleepScore: number;
    japaCompletionScore: number;
    programScore: number;
    hearingScore: number;
    shlokaScore: number;
    sevaScore: number;
  }
} => {
  if (!entries || entries.length === 0) {
    return {
      totalScore: 0,
      averageScore: 0,
      breakdowns: {
        sleepTimeScore: 0, wakeUpTimeScore: 0, readingScore: 0,
        daySleepScore: 0, japaCompletionScore: 0, programScore: 0,
        hearingScore: 0, shlokaScore: 0, sevaScore: 0
      }
    };
  }
  
  let batchCriteria: BatchCriteria;
  if (typeof batchNameOrProfile === 'string') {
    const batchConfigs = getBatchConfigurations();
    batchCriteria = batchConfigs[batchNameOrProfile.toLowerCase()] || batchConfigs.sahadev;
  } else {
    batchCriteria = getBatchCriteriaFromUserProfile(batchNameOrProfile);
  }
  
  const scores = entries.map(entry => calculateSadhanaScore(entry, batchNameOrProfile));
  
  let totalScore = scores.reduce((sum, score) => sum + score.totalScore, 0);
  
  const totalBreakdowns = {
    sleepTimeScore: scores.reduce((sum, score) => sum + score.breakdowns.sleepTimeScore, 0),
    wakeUpTimeScore: scores.reduce((sum, score) => sum + score.breakdowns.wakeUpTimeScore, 0),
    readingScore: scores.reduce((sum, score) => sum + score.breakdowns.readingScore, 0),
    daySleepScore: scores.reduce((sum, score) => sum + score.breakdowns.daySleepScore, 0),
    japaCompletionScore: scores.reduce((sum, score) => sum + score.breakdowns.japaCompletionScore, 0),
    programScore: scores.reduce((sum, score) => sum + score.breakdowns.programScore, 0),
    hearingScore: scores.reduce((sum, score) => sum + score.breakdowns.hearingScore, 0),
    shlokaScore: scores.reduce((sum, score) => sum + score.breakdowns.shlokaScore, 0),
    sevaScore: scores.reduce((sum, score) => sum + score.breakdowns.sevaScore, 0),
  };
  
  // For brahmacharis, add weekly-based marks
  if (batchCriteria.isBrahmacharisBatch) {
    // Reading: weekly total >= minimum → 1 mark
    const totalReading = entries.reduce((sum, e) => sum + (e.readingMinutes || 0), 0);
    if (batchCriteria.readingMinimum && totalReading >= batchCriteria.readingMinimum) {
      totalBreakdowns.readingScore = 1;
      totalScore += 1;
    }
    
    // Hearing: check each category weekly
    const totalSpLecture = entries.reduce((sum, e) => sum + (e.spLectureMinutes || 0), 0);
    const totalSmLecture = entries.reduce((sum, e) => sum + (e.smLectureMinutes || 0), 0);
    const totalBcClass = entries.reduce((sum, e) => sum + ((e as any).bcClassMinutes || 0), 0);
    
    let weeklyHearingMarks = 0;
    if (batchCriteria.bcClassMinimum && totalBcClass >= batchCriteria.bcClassMinimum) weeklyHearingMarks += 1;
    if (batchCriteria.spLectureMinimum && totalSpLecture >= batchCriteria.spLectureMinimum) weeklyHearingMarks += 1;
    if (batchCriteria.smLectureMinimum && totalSmLecture >= batchCriteria.smLectureMinimum) weeklyHearingMarks += 1;
    totalBreakdowns.hearingScore = weeklyHearingMarks;
    totalScore += weeklyHearingMarks;
    
    // Shloka/vaishnav song: weekly total >= minimum → 1 mark
    const totalSlokaVaishnav = entries.reduce((sum, e) => sum + ((e as any).slokaVaishnavSongMinutes || 0), 0);
    if (batchCriteria.slokaVaishnavSongMinimum && totalSlokaVaishnav >= batchCriteria.slokaVaishnavSongMinimum) {
      totalBreakdowns.shlokaScore = 1;
      totalScore += 1;
    }
    
    // Service: weekly total >= minimum → 1 mark
    const totalService = entries.reduce((sum, e) => sum + (e.serviceMinutes || 0), 0);
    if (batchCriteria.serviceMinimum && totalService >= batchCriteria.serviceMinimum) {
      totalBreakdowns.sevaScore += 1;
      totalScore += 1;
    }
    
    // Harinaam: weekly count >= minimum → 1 mark
    const totalHarinaam = entries.reduce((sum, e) => sum + ((e as any).harinaamCount || 0), 0);
    if (batchCriteria.harinaamMinimum && totalHarinaam >= batchCriteria.harinaamMinimum) {
      totalBreakdowns.sevaScore += 1;
      totalScore += 1;
    }
  }
  
  const avgScore = totalScore / entries.length;
  
  return {
    totalScore,
    averageScore: parseFloat(avgScore.toFixed(1)),
    breakdowns: totalBreakdowns
  };
};

// Format time range for display
export const formatTimeRange = (range: TimeRangeScore): string => {
  return `${range.startTime} - ${range.endTime}`;
};

// Format duration range for display
export const formatDurationRange = (range: DurationScore, nextRange?: DurationScore): string => {
  if (!nextRange) {
    return `> ${range.maxDuration} minutes`;
  }
  return `${range.maxDuration} minutes or less`;
};

// Get readable criteria description for a batch
export const getBatchCriteriaDescription = (batchNameOrProfile: string | UserProfile | null): Record<string, string[]> => {
  let batchCriteria: BatchCriteria;
  
  // Handle different types of input for batch information
  if (typeof batchNameOrProfile === 'string') {
    // If it's a string, treat it as a batch name
    const batchConfigs = getBatchConfigurations();
    batchCriteria = batchConfigs[batchNameOrProfile.toLowerCase()] || batchConfigs.sahadev;
  } else {
    // If it's a UserProfile or null, get criteria from profile
    batchCriteria = getBatchCriteriaFromUserProfile(batchNameOrProfile);
  }
  
  const descriptions: Record<string, string[]> = {
    sleepTime: [],
    wakeUpTime: [],
    reading: [`Minimum: ${batchCriteria.readingMinimum} minutes (${batchCriteria.readingMinimum / 60} hours)`],
    daySleep: [],
    japaCompletion: [],
    hearing: [`Minimum: ${batchCriteria.hearingMinimum} minutes (${batchCriteria.hearingMinimum / 60} hours)`],
    service: [`Minimum: ${batchCriteria.serviceMinimum} minutes (${batchCriteria.serviceMinimum / 60} hours)`]
  };
  
  // Add specific hearing requirements if available
  if (batchCriteria.spLectureMinimum) {
    descriptions.hearing.push(`Srila Prabhupada Lectures: ${batchCriteria.spLectureMinimum} minutes`);
  }
  
  if (batchCriteria.smLectureMinimum) {
    descriptions.hearing.push(`Spiritual Master Lectures: ${batchCriteria.smLectureMinimum} minutes`);
  }
  
  if (batchCriteria.gsnsLectureMinimum) {
    descriptions.hearing.push(`GS/NS Lectures: ${batchCriteria.gsnsLectureMinimum} minutes`);
  }
  
  if (batchCriteria.hgrspLectureMinimum) {
    descriptions.hearing.push(`HGRSP/HGRKP Lectures: ${batchCriteria.hgrspLectureMinimum} minutes`);
  }
  
  // Sleep time criteria
  batchCriteria.sleepTimeScoring.forEach((range, i, arr) => {
    descriptions.sleepTime.push(`${formatTimeRange(range)}: ${range.points} points`);
  });
  
  // Wake-up time criteria
  if (batchCriteria.wakeUpTimeScoring.length) {
    batchCriteria.wakeUpTimeScoring.forEach((range, i, arr) => {
      descriptions.wakeUpTime.push(`${formatTimeRange(range)}: ${range.points} points`);
    });
  } else {
    descriptions.wakeUpTime.push("No points allotted");
  }
  
  // Day sleep criteria
  if (batchCriteria.daySleepScoring.length) {
    batchCriteria.daySleepScoring.forEach((range, i, arr) => {
      const nextRange = i < arr.length - 1 ? arr[i + 1] : undefined;
      descriptions.daySleep.push(`${formatDurationRange(range, nextRange)}: ${range.points} points`);
    });
  } else {
    descriptions.daySleep.push("No points allotted");
  }
  
  // Japa completion criteria
  if (batchCriteria.japaCompletionScoring.length) {
    batchCriteria.japaCompletionScoring.forEach((range, i, arr) => {
      descriptions.japaCompletion.push(`${formatTimeRange(range)}: ${range.points} points`);
    });
  } else {
    descriptions.japaCompletion.push("No points allotted");
  }
  
  return descriptions;
};

// Get minimum requirements for a specific batch
export const getBatchMinimumRequirements = (userProfile: UserProfile | null): {
  readingMinutes: number;
  hearingMinutes: number;
  serviceMinutes: number;
  shlokaCount: number;
} => {
  const batchCriteria = getBatchCriteriaFromUserProfile(userProfile);
  
  return {
    readingMinutes: batchCriteria.readingMinimum || 0,
    hearingMinutes: batchCriteria.hearingMinimum || 0,
    serviceMinutes: batchCriteria.serviceMinimum || 0,
    shlokaCount: batchCriteria.shlokaMinimum || 0
  };
};

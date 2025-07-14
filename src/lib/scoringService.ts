import { SadhanaEntry } from "./sadhanaService";
import { UserProfile } from "@/contexts/AuthContext";

export interface BatchCriteria {
  name: string;
  sleepTimeScoring: TimeRangeScore[];
  wakeUpTimeScoring: TimeRangeScore[];
  readingMinimum: number; // in minutes
  daySleepScoring: DurationScore[];
  japaCompletionScoring: TimeRangeScore[];
  hearingMinimum: number; // in minutes (total hearing)
  serviceMinimum: number; // in minutes
  spLectureMinimum?: number; // Srila Prabhupada lectures minimum in minutes
  smLectureMinimum?: number; // Spiritual Master lectures minimum in minutes
  gsnsLectureMinimum?: number; // GS/NS lectures minimum in minutes
  hgrspLectureMinimum?: number; // HGRSP/HGRKP lectures minimum in minutes
  shlokaMinimum?: number; // Default: no shlokas required
  totalBodyScore: number; // Maximum possible body score
  totalSoulScore: number; // Maximum possible soul score
  // New checkbox flags for hearing categories
  showSpLecture: boolean; // Show Srila Prabhupada lectures
  showSmLecture: boolean; // Show Spiritual Master lectures
  showGsnsLecture: boolean; // Show GS/NS lectures
  showHgrspLecture: boolean; // Show HGRSP/HGRKP lectures
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
export const SHLOKA_SCORING = {
  sahadev: 30,
  nakula: 30,
  arjuna: 30,
  yudhisthira: 30,
  "nakula-working": 30
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

// Calculate shloka score
export const calculateShlokaScore = (shlokaCount: number, batchCriteria: BatchCriteria, batchName: string): number => {
  const minimumShlokas = batchCriteria.shlokaMinimum || 0;
  if (shlokaCount >= minimumShlokas && minimumShlokas > 0) {
    return SHLOKA_SCORING[batchName.toLowerCase() as keyof typeof SHLOKA_SCORING] || 0;
  }
  return 0;
};

// Calculate program attendance score
export const calculateProgramScore = (entry: SadhanaEntry): number => {
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
  }
} => {
  let batchCriteria: BatchCriteria;
  let batchName: string;
  
  // Handle different types of input for batch information
  if (typeof batchNameOrProfile === 'string') {
    // If it's a string, treat it as a batch name
    const batchConfigs = getBatchConfigurations();
    batchName = batchNameOrProfile.toLowerCase();
    batchCriteria = batchConfigs[batchName] || batchConfigs.sahadev;
  } else {
    // If it's a UserProfile or null, get criteria from profile
    batchCriteria = getBatchCriteriaFromUserProfile(batchNameOrProfile);
    batchName = batchNameOrProfile?.batch?.toLowerCase() || batchNameOrProfile?.batchName?.toLowerCase() || "sahadev";
  }
  
  // Calculate individual scores
  const sleepTimeScore = calculateTimeScore(entry.sleepTime, batchCriteria.sleepTimeScoring);
  const wakeUpTimeScore = calculateTimeScore(entry.wakeUpTime, batchCriteria.wakeUpTimeScoring);
  const readingScore = calculateReadingScore(entry.readingMinutes, batchCriteria.readingMinimum);
  const daySleepScore = calculateDurationScore(entry.daySleepDuration, batchCriteria.daySleepScoring);
  const japaCompletionScore = calculateTimeScore(entry.chantingCompletionTime, batchCriteria.japaCompletionScoring);
  const programScore = calculateProgramScore(entry);
  
  // Calculate hearing score (sum of all hearing types, capped at batch minimum)
  const spLectureMinutes = entry.spLectureMinutes || 0;
  const smLectureMinutes = entry.smLectureMinutes || 0;
  const gsnsLectureMinutes = entry.gsnsLectureMinutes || 0;
  const hgrspLectureMinutes = entry.hgrspLectureMinutes || 0;
  const totalHearingMinutes = spLectureMinutes + smLectureMinutes + gsnsLectureMinutes + hgrspLectureMinutes;
  const hearingScore = calculateHearingScore(totalHearingMinutes, batchCriteria.hearingMinimum);
  
  // Calculate shloka score
  const shlokaScore = calculateShlokaScore(entry.shlokaCount || 0, batchCriteria, batchName);
  
  // Calculate total score (excluding service)
  const totalScore = 
    sleepTimeScore + 
    wakeUpTimeScore + 
    readingScore + 
    daySleepScore + 
    japaCompletionScore + 
    programScore +
    hearingScore +
    shlokaScore;
  
  return {
    totalScore,
    breakdowns: {
      sleepTimeScore,
      wakeUpTimeScore,
      readingScore,
      daySleepScore,
      japaCompletionScore,
      programScore,
      hearingScore,
      shlokaScore
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
  }
} => {
  if (!entries || entries.length === 0) {
    return {
      totalScore: 0,
      averageScore: 0,
      breakdowns: {
        sleepTimeScore: 0,
        wakeUpTimeScore: 0,
        readingScore: 0,
        daySleepScore: 0,
        japaCompletionScore: 0,
        programScore: 0,
        hearingScore: 0,
        shlokaScore: 0
      }
    };
  }
  
  // Calculate individual scores for each entry
  const scores = entries.map(entry => calculateSadhanaScore(entry, batchNameOrProfile));
  
  // Sum up all scores and breakdowns
  const totalScore = scores.reduce((sum, score) => sum + score.totalScore, 0);
  const avgScore = totalScore / entries.length;
  
  const totalBreakdowns = {
    sleepTimeScore: scores.reduce((sum, score) => sum + score.breakdowns.sleepTimeScore, 0),
    wakeUpTimeScore: scores.reduce((sum, score) => sum + score.breakdowns.wakeUpTimeScore, 0),
    readingScore: scores.reduce((sum, score) => sum + score.breakdowns.readingScore, 0),
    daySleepScore: scores.reduce((sum, score) => sum + score.breakdowns.daySleepScore, 0),
    japaCompletionScore: scores.reduce((sum, score) => sum + score.breakdowns.japaCompletionScore, 0),
    programScore: scores.reduce((sum, score) => sum + score.breakdowns.programScore, 0),
    hearingScore: scores.reduce((sum, score) => sum + score.breakdowns.hearingScore, 0),
    shlokaScore: scores.reduce((sum, score) => sum + score.breakdowns.shlokaScore, 0)
  };
  
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

import { SadhanaEntry } from "./sadhanaService";

export interface BatchCriteria {
  name: string;
  sleepTimeScoring: TimeRangeScore[];
  wakeUpTimeScoring: TimeRangeScore[];
  readingMinimum: number; // in minutes
  daySleepScoring: DurationScore[];
  japaCompletionScoring: TimeRangeScore[];
  hearingMinimum: number; // in minutes
  serviceMinimum: number; // in minutes
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
    hearingMinimum: 30, // 30 minutes
    serviceMinimum: 60 // 1 hour
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
    serviceMinimum: 90 // 1.5 hours
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
    hearingMinimum: 90, // 1.5 hours
    serviceMinimum: 120 // 2 hours
  },
  yudhisthir: {
    name: "Yudhisthir",
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
    hearingMinimum: 120, // 2 hours
    serviceMinimum: 150 // 2.5 hours
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

// Calculate reading score
export const calculateReadingScore = (minutes: number): number => {
  return Math.max(0, minutes); // 1 point per minute
};

// Calculate hearing score
export const calculateHearingScore = (minutes: number): number => {
  return Math.max(0, minutes); // 1 point per minute
};

// Calculate service score
export const calculateServiceScore = (minutes: number): number => {
  return Math.max(0, minutes); // 1 point per minute
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

// Calculate total score for a sadhana entry based on batch criteria
export const calculateSadhanaScore = (
  entry: SadhanaEntry, 
  batchName: string = "sahadev"
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
    serviceScore: number;
  }
} => {
  const batchConfigs = getBatchConfigurations();
  const batchCriteria = batchConfigs[batchName.toLowerCase()] || batchConfigs.sahadev;
  
  // Calculate individual scores
  const sleepTimeScore = calculateTimeScore(entry.sleepTime, batchCriteria.sleepTimeScoring);
  const wakeUpTimeScore = calculateTimeScore(entry.wakeUpTime, batchCriteria.wakeUpTimeScoring);
  const readingScore = calculateReadingScore(entry.readingMinutes);
  const daySleepScore = calculateDurationScore(entry.daySleepDuration, batchCriteria.daySleepScoring);
  const japaCompletionScore = calculateTimeScore(entry.chantingCompletionTime, batchCriteria.japaCompletionScoring);
  const programScore = calculateProgramScore(entry);
  const hearingScore = calculateHearingScore(entry.hearingMinutes || 0);
  const serviceScore = calculateServiceScore(entry.serviceMinutes || 0);
  
  // Calculate total score
  const totalScore = 
    sleepTimeScore + 
    wakeUpTimeScore + 
    readingScore + 
    daySleepScore + 
    japaCompletionScore + 
    programScore +
    hearingScore +
    serviceScore;
  
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
      serviceScore
    }
  };
};

// Calculate weekly consolidated score
export const calculateWeeklySadhanaScore = (
  entries: SadhanaEntry[],
  batchName: string = "sahadev"
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
    serviceScore: number;
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
        serviceScore: 0
      }
    };
  }
  
  // Calculate individual scores for each entry
  const scores = entries.map(entry => calculateSadhanaScore(entry, batchName));
  
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
    serviceScore: scores.reduce((sum, score) => sum + score.breakdowns.serviceScore, 0)
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
export const getBatchCriteriaDescription = (batchName: string): Record<string, string[]> => {
  const batchConfigs = getBatchConfigurations();
  const batchCriteria = batchConfigs[batchName.toLowerCase()] || batchConfigs.sahadev;
  
  const descriptions: Record<string, string[]> = {
    sleepTime: [],
    wakeUpTime: [],
    reading: [`Minimum: ${batchCriteria.readingMinimum} minutes (${batchCriteria.readingMinimum / 60} hours)`],
    daySleep: [],
    japaCompletion: [],
    hearing: [`Minimum: ${batchCriteria.hearingMinimum} minutes (${batchCriteria.hearingMinimum / 60} hours)`],
    service: [`Minimum: ${batchCriteria.serviceMinimum} minutes (${batchCriteria.serviceMinimum / 60} hours)`]
  };
  
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

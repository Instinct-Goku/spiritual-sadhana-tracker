export interface TimeRangeScore {
  startTime: string;
  endTime: string;
  points: number;
}

export interface DurationScore {
  maxDuration: number;
  points: number;
}

export interface BatchCriteria {
  name: string;
  readingMinimum: number;
  hearingMinimum: number;
  serviceMinimum: number;
  shlokaMinimum: number;
  totalBodyScore: number;
  totalSoulScore: number;
  sleepTimeScoring: TimeRangeScore[];
  wakeUpTimeScoring: TimeRangeScore[];
  daySleepScoring: DurationScore[];
  japaCompletionScoring: TimeRangeScore[];
  spLectureMinimum?: number;
  smLectureMinimum?: number;
  gsnsLectureMinimum?: number;
  hgrspLectureMinimum?: number;
  // New checkbox controls for enabling/disabling hearing fields
  enableSmHearing?: boolean;
  enableGsnsHearing?: boolean;
  enableHgrspHearing?: boolean;
}

export const DEFAULT_BATCHES: Record<string, BatchCriteria> = {
  sahadev: {
    name: "Sahadev",
    readingMinimum: 60,
    hearingMinimum: 60,
    serviceMinimum: 0,
    shlokaMinimum: 0,
    totalBodyScore: 50,
    totalSoulScore: 50,
    enableSmHearing: false,
    enableGsnsHearing: false,
    enableHgrspHearing: false,
    sleepTimeScoring: [
      { startTime: "21:00", endTime: "22:00", points: 10 },
      { startTime: "22:00", endTime: "23:00", points: 7 },
      { startTime: "23:00", endTime: "00:00", points: 5 },
      { startTime: "00:00", endTime: "01:00", points: 3 },
      { startTime: "01:00", endTime: "23:59", points: 0 }
    ],
    wakeUpTimeScoring: [
      { startTime: "03:30", endTime: "04:00", points: 10 },
      { startTime: "04:00", endTime: "04:30", points: 8 },
      { startTime: "04:30", endTime: "05:00", points: 6 },
      { startTime: "05:00", endTime: "05:30", points: 4 },
      { startTime: "05:30", endTime: "23:59", points: 0 }
    ],
    daySleepScoring: [
      { maxDuration: 0, points: 10 },
      { maxDuration: 30, points: 7 },
      { maxDuration: 60, points: 5 },
      { maxDuration: 90, points: 3 },
      { maxDuration: 999, points: 0 }
    ],
    japaCompletionScoring: [
      { startTime: "06:00", endTime: "07:30", points: 10 },
      { startTime: "07:30", endTime: "09:00", points: 8 },
      { startTime: "09:00", endTime: "10:30", points: 6 },
      { startTime: "10:30", endTime: "12:00", points: 4 },
      { startTime: "12:00", endTime: "23:59", points: 0 }
    ]
  },
  nakul: {
    name: "Nakul",
    readingMinimum: 90,
    hearingMinimum: 90,
    serviceMinimum: 0,
    shlokaMinimum: 1,
    totalBodyScore: 50,
    totalSoulScore: 50,
    enableSmHearing: false,
    enableGsnsHearing: false,
    enableHgrspHearing: false,
    sleepTimeScoring: [
      { startTime: "21:00", endTime: "22:00", points: 10 },
      { startTime: "22:00", endTime: "23:00", points: 7 },
      { startTime: "23:00", endTime: "00:00", points: 5 },
      { startTime: "00:00", endTime: "01:00", points: 3 },
      { startTime: "01:00", endTime: "23:59", points: 0 }
    ],
    wakeUpTimeScoring: [
      { startTime: "03:30", endTime: "04:00", points: 10 },
      { startTime: "04:00", endTime: "04:30", points: 8 },
      { startTime: "04:30", endTime: "05:00", points: 6 },
      { startTime: "05:00", endTime: "05:30", points: 4 },
      { startTime: "05:30", endTime: "23:59", points: 0 }
    ],
    daySleepScoring: [
      { maxDuration: 0, points: 10 },
      { maxDuration: 30, points: 7 },
      { maxDuration: 60, points: 5 },
      { maxDuration: 90, points: 3 },
      { maxDuration: 999, points: 0 }
    ],
    japaCompletionScoring: [
      { startTime: "06:00", endTime: "07:30", points: 10 },
      { startTime: "07:30", endTime: "09:00", points: 8 },
      { startTime: "09:00", endTime: "10:30", points: 6 },
      { startTime: "10:30", endTime: "12:00", points: 4 },
      { startTime: "12:00", endTime: "23:59", points: 0 }
    ]
  },
  arjun: {
    name: "Arjun",
    readingMinimum: 120,
    hearingMinimum: 120,
    serviceMinimum: 60,
    shlokaMinimum: 1,
    totalBodyScore: 50,
    totalSoulScore: 50,
    enableSmHearing: false,
    enableGsnsHearing: false,
    enableHgrspHearing: false,
    sleepTimeScoring: [
      { startTime: "21:00", endTime: "22:00", points: 10 },
      { startTime: "22:00", endTime: "23:00", points: 7 },
      { startTime: "23:00", endTime: "00:00", points: 5 },
      { startTime: "00:00", endTime: "01:00", points: 3 },
      { startTime: "01:00", endTime: "23:59", points: 0 }
    ],
    wakeUpTimeScoring: [
      { startTime: "03:30", endTime: "04:00", points: 10 },
      { startTime: "04:00", endTime: "04:30", points: 8 },
      { startTime: "04:30", endTime: "05:00", points: 6 },
      { startTime: "05:00", endTime: "05:30", points: 4 },
      { startTime: "05:30", endTime: "23:59", points: 0 }
    ],
    daySleepScoring: [
      { maxDuration: 0, points: 10 },
      { maxDuration: 30, points: 7 },
      { maxDuration: 60, points: 5 },
      { maxDuration: 90, points: 3 },
      { maxDuration: 999, points: 0 }
    ],
    japaCompletionScoring: [
      { startTime: "06:00", endTime: "07:30", points: 10 },
      { startTime: "07:30", endTime: "09:00", points: 8 },
      { startTime: "09:00", endTime: "10:30", points: 6 },
      { startTime: "10:30", endTime: "12:00", points: 4 },
      { startTime: "12:00", endTime: "23:59", points: 0 }
    ]
  },
  bheem: {
    name: "Bheem",
    readingMinimum: 150,
    hearingMinimum: 150,
    serviceMinimum: 90,
    shlokaMinimum: 2,
    totalBodyScore: 50,
    totalSoulScore: 50,
    enableSmHearing: false,
    enableGsnsHearing: false,
    enableHgrspHearing: false,
    sleepTimeScoring: [
      { startTime: "21:00", endTime: "22:00", points: 10 },
      { startTime: "22:00", endTime: "23:00", points: 7 },
      { startTime: "23:00", endTime: "00:00", points: 5 },
      { startTime: "00:00", endTime: "01:00", points: 3 },
      { startTime: "01:00", endTime: "23:59", points: 0 }
    ],
    wakeUpTimeScoring: [
      { startTime: "03:30", endTime: "04:00", points: 10 },
      { startTime: "04:00", endTime: "04:30", points: 8 },
      { startTime: "04:30", endTime: "05:00", points: 6 },
      { startTime: "05:00", endTime: "05:30", points: 4 },
      { startTime: "05:30", endTime: "23:59", points: 0 }
    ],
    daySleepScoring: [
      { maxDuration: 0, points: 10 },
      { maxDuration: 30, points: 7 },
      { maxDuration: 60, points: 5 },
      { maxDuration: 90, points: 3 },
      { maxDuration: 999, points: 0 }
    ],
    japaCompletionScoring: [
      { startTime: "06:00", endTime: "07:30", points: 10 },
      { startTime: "07:30", endTime: "09:00", points: 8 },
      { startTime: "09:00", endTime: "10:30", points: 6 },
      { startTime: "10:30", endTime: "12:00", points: 4 },
      { startTime: "12:00", endTime: "23:59", points: 0 }
    ]
  },
  yudhisthira: {
    name: "Yudhisthira",
    readingMinimum: 180,
    hearingMinimum: 180,
    serviceMinimum: 120,
    shlokaMinimum: 2,
    totalBodyScore: 50,
    totalSoulScore: 50,
    spLectureMinimum: 60,
    smLectureMinimum: 60,
    hgrspLectureMinimum: 60,
    enableSmHearing: true,
    enableGsnsHearing: false,
    enableHgrspHearing: true,
    sleepTimeScoring: [
      { startTime: "21:00", endTime: "22:00", points: 10 },
      { startTime: "22:00", endTime: "23:00", points: 7 },
      { startTime: "23:00", endTime: "00:00", points: 5 },
      { startTime: "00:00", endTime: "01:00", points: 3 },
      { startTime: "01:00", endTime: "23:59", points: 0 }
    ],
    wakeUpTimeScoring: [
      { startTime: "03:30", endTime: "04:00", points: 10 },
      { startTime: "04:00", endTime: "04:30", points: 8 },
      { startTime: "04:30", endTime: "05:00", points: 6 },
      { startTime: "05:00", endTime: "05:30", points: 4 },
      { startTime: "05:30", endTime: "23:59", points: 0 }
    ],
    daySleepScoring: [
      { maxDuration: 0, points: 10 },
      { maxDuration: 30, points: 7 },
      { maxDuration: 60, points: 5 },
      { maxDuration: 90, points: 3 },
      { maxDuration: 999, points: 0 }
    ],
    japaCompletionScoring: [
      { startTime: "06:00", endTime: "07:30", points: 10 },
      { startTime: "07:30", endTime: "09:00", points: 8 },
      { startTime: "09:00", endTime: "10:30", points: 6 },
      { startTime: "10:30", endTime: "12:00", points: 4 },
      { startTime: "12:00", endTime: "23:59", points: 0 }
    ]
  }
};

import { UserProfile } from "@/contexts/AuthContext";

export const isWeeklyScoringEnabled = (): boolean => {
  // Check if weekly scoring is enabled (e.g., from environment variables or configuration)
  // For now, let's assume it's enabled
  return true;
};

export const getBatchCriteriaFromUserProfile = (userProfile: UserProfile | null): BatchCriteria => {
  const batchName = userProfile?.batch?.toLowerCase() || "sahadev";
  return getBatchConfigurations()[batchName] || DEFAULT_BATCHES.sahadev;
};

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

export const getBatchMinimumRequirements = (userProfile: UserProfile | null) => {
  const batchCriteria = getBatchCriteriaFromUserProfile(userProfile);
  
  return {
    readingMinutes: batchCriteria?.readingMinimum || 0,
    hearingMinutes: batchCriteria?.hearingMinimum || 0,
    serviceMinutes: batchCriteria?.serviceMinimum || 0,
    shlokaCount: batchCriteria?.shlokaMinimum || 0,
  };
};

export const calculateSadhanaScore = (entry: any, userProfile: UserProfile | null) => {
  if (!userProfile) {
    console.warn("User profile is null. Cannot calculate score.");
    return { totalScore: 0, breakdowns: {} };
  }
  
  const batchCriteria = getBatchCriteriaFromUserProfile(userProfile);
  
  let totalScore = 0;
  const breakdowns: any = {};
  
  // 1. Wake Up Time Score
  const wakeUpTimeScore = calculateTimeRangeScore(entry.wakeUpTime, batchCriteria.wakeUpTimeScoring);
  totalScore += wakeUpTimeScore;
  breakdowns.wakeUpTimeScore = wakeUpTimeScore;
  
  // 2. Sleep Time Score
  const sleepTimeScore = calculateTimeRangeScore(entry.sleepTime, batchCriteria.sleepTimeScoring);
  totalScore += sleepTimeScore;
  breakdowns.sleepTimeScore = sleepTimeScore;
  
  // 3. Reading Score
  const readingScore = Math.min(entry.readingMinutes / batchCriteria.readingMinimum * 10, 10);
  totalScore += readingScore;
  breakdowns.readingScore = readingScore;
  
  // 4. Day Sleep Score
  const daySleepScore = calculateDurationScore(entry.daySleepDuration, batchCriteria.daySleepScoring);
  totalScore += daySleepScore;
  breakdowns.daySleepScore = daySleepScore;
  
  // 5. Japa Completion Score
  const japaCompletionScore = calculateTimeRangeScore(entry.chantingCompletionTime, batchCriteria.japaCompletionScoring);
  totalScore += japaCompletionScore;
  breakdowns.japaCompletionScore = japaCompletionScore;
  
  // 6. Program Score (Mangala Arati, Tulsi Arati, etc.)
  let programScore = 0;
  if (entry.mangalaArati) programScore += 2;
  if (entry.tulsiArati) programScore += 1;
  if (entry.narsimhaArati) programScore += 1;
  if (entry.guruPuja) programScore += 2;
  if (entry.bhagavatamClass) programScore += 4;
  totalScore += programScore;
  breakdowns.programScore = programScore;

  // 7. Hearing Score
  let hearingScore = 0;
  const totalHearingMinutes = (entry.spLectureMinutes || 0) + (entry.smLectureMinutes || 0) + (entry.gsnsLectureMinutes || 0) + (entry.hgrspLectureMinutes || 0);
  hearingScore = Math.min(totalHearingMinutes / batchCriteria.hearingMinimum * 10, 10);
  totalScore += hearingScore;
  breakdowns.hearingScore = hearingScore;
  
  // 8. Shloka Score
  let shlokaScore = 0;
  if (entry.shlokaMemorized && batchCriteria.shlokaMinimum) {
    shlokaScore = Math.min(entry.shlokaMemorized / batchCriteria.shlokaMinimum * 10, 10);
  }
  totalScore += shlokaScore;
  breakdowns.shlokaScore = shlokaScore;
  
  return { totalScore: Math.round(totalScore), breakdowns: breakdowns };
};

export const calculateWeeklySadhanaScore = (entries: any[], userProfile: UserProfile | null) => {
  if (!userProfile) {
    console.warn("User profile is null. Cannot calculate weekly score.");
    return { totalScore: 0, averageScore: 0, breakdowns: {} };
  }
  
  let totalScore = 0;
  const weeklyBreakdowns = {
    sleepTimeScore: 0,
    wakeUpTimeScore: 0,
    readingScore: 0,
    daySleepScore: 0,
    japaCompletionScore: 0,
    programScore: 0,
    hearingScore: 0,
    shlokaScore: 0,
  };
  
  entries.forEach(entry => {
    const dailyScoreResult = calculateSadhanaScore(entry, userProfile);
    totalScore += dailyScoreResult.totalScore;
    
    // Accumulate breakdowns
    weeklyBreakdowns.sleepTimeScore += dailyScoreResult.breakdowns.sleepTimeScore || 0;
    weeklyBreakdowns.wakeUpTimeScore += dailyScoreResult.breakdowns.wakeUpTimeScore || 0;
    weeklyBreakdowns.readingScore += dailyScoreResult.breakdowns.readingScore || 0;
    weeklyBreakdowns.daySleepScore += dailyScoreResult.breakdowns.daySleepScore || 0;
    weeklyBreakdowns.japaCompletionScore += dailyScoreResult.breakdowns.japaCompletionScore || 0;
    weeklyBreakdowns.programScore += dailyScoreResult.breakdowns.programScore || 0;
    weeklyBreakdowns.hearingScore += dailyScoreResult.breakdowns.hearingScore || 0;
    weeklyBreakdowns.shlokaScore += dailyScoreResult.breakdowns.shlokaScore || 0;
  });
  
  const averageScore = entries.length > 0 ? totalScore / entries.length : 0;
  
  return { 
    totalScore: Math.round(totalScore), 
    averageScore: Math.round(averageScore),
    breakdowns: weeklyBreakdowns
  };
};

const calculateTimeRangeScore = (time: string, scoringRanges: TimeRangeScore[]): number => {
  let score = 0;
  
  if (!time) {
    return score;
  }
  
  const [hours, minutes] = time.split(':').map(Number);
  const timeInMinutes = hours * 60 + minutes;
  
  for (const range of scoringRanges) {
    const [startHours, startMinutes] = range.startTime.split(':').map(Number);
    const [endHours, endMinutes] = range.endTime.split(':').map(Number);
    
    const startTimeInMinutes = startHours * 60 + startMinutes;
    const endTimeInMinutes = endHours * 60 + endMinutes;
    
    if (startTimeInMinutes <= timeInMinutes && timeInMinutes < endTimeInMinutes) {
      score = range.points;
      break;
    }
  }
  
  return score;
};

const calculateDurationScore = (duration: number, scoringRanges: DurationScore[]): number => {
  let score = 0;
  
  for (const range of scoringRanges) {
    if (duration <= range.maxDuration) {
      score = range.points;
      break;
    }
  }
  
  return score;
};

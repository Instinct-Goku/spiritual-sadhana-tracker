import { 
  collection, 
  query, 
  where, 
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore";
import { db } from "./firebase";
import { BatchCriteria } from "./adminService";

// Get batch criteria from a devotee group
export const getBatchCriteriaFromGroup = async (groupId: string): Promise<BatchCriteria> => {
  try {
    const groupRef = doc(db, "devoteeGroups", groupId);
    const groupDoc = await getDocs(query(collection(db, "devoteeGroups"), where("__name__", "==", groupId)));
    
    if (!groupDoc.empty) {
      const data = groupDoc.docs[0].data();
      return data.batchCriteria || {};
    }
    
    return {};
  } catch (error) {
    console.error("Error fetching batch criteria:", error);
    return {};
  }
};

// Update batch criteria for a devotee group
export const updateBatchCriteria = async (groupId: string, criteria: BatchCriteria): Promise<void> => {
  try {
    const groupRef = doc(db, "devoteeGroups", groupId);
    await updateDoc(groupRef, {
      batchCriteria: criteria
    });
  } catch (error) {
    console.error("Error updating batch criteria:", error);
    throw error;
  }
};

// Default batch configurations
export const getDefaultBatchCriteria = (batchName: string): BatchCriteria => {
  const configs: Record<string, BatchCriteria> = {
    "sahadev": {
      chantingRoundsMinimum: 16,
      readingMinimum: 30,
      spLectureMinimum: 15,
      smLectureMinimum: 0,
      gsnsLectureMinimum: 0,
      hgrspLectureMinimum: 0,
      serviceMinimum: 60,
      shlokaMinimum: 0,
      maxSleepHours: 7,
      maxDayTimeHours: 1,
      maxWakeUpTime: "04:30",
      maxSleepTime: "21:30",
      mangalaAratiMandatory: true,
      morningProgramMandatory: true,
      eveningProgramMandatory: true,
      bookDistributionMandatory: false,
      chantingRoundsPoints: 25,
      readingPoints: 1,
      spLecturePoints: 1,
      smLecturePoints: 1,
      gsnsLecturePoints: 1,
      hgrspLecturePoints: 1,
      servicePoints: 0.5,
      shlokaPoints: 5,
      mangalaAratiPoints: 10,
      morningProgramPoints: 5,
      eveningProgramPoints: 5,
      bookDistributionPoints: 10,
      sleepScorePoints: 10,
      wakeUpScorePoints: 10,
      earlyToSleepBonus: 5,
      onTimeWakeUpBonus: 5,
      lateToSleepPenalty: -5,
      lateWakeUpPenalty: -5,
    },
    "nakula": {
      chantingRoundsMinimum: 16,
      readingMinimum: 30,
      spLectureMinimum: 15,
      smLectureMinimum: 0,
      gsnsLectureMinimum: 0,
      hgrspLectureMinimum: 0,
      serviceMinimum: 60,
      shlokaMinimum: 0,
      maxSleepHours: 7,
      maxDayTimeHours: 1,
      maxWakeUpTime: "04:30",
      maxSleepTime: "21:30",
      mangalaAratiMandatory: true,
      morningProgramMandatory: true,
      eveningProgramMandatory: true,
      bookDistributionMandatory: false,
      chantingRoundsPoints: 25,
      readingPoints: 1,
      spLecturePoints: 1,
      smLecturePoints: 1,
      gsnsLecturePoints: 1,
      hgrspLecturePoints: 1,
      servicePoints: 0.5,
      shlokaPoints: 5,
      mangalaAratiPoints: 10,
      morningProgramPoints: 5,
      eveningProgramPoints: 5,
      bookDistributionPoints: 10,
      sleepScorePoints: 10,
      wakeUpScorePoints: 10,
      earlyToSleepBonus: 5,
      onTimeWakeUpBonus: 5,
      lateToSleepPenalty: -5,
      lateWakeUpPenalty: -5,
    },
    "arjuna": {
      chantingRoundsMinimum: 16,
      readingMinimum: 30,
      spLectureMinimum: 15,
      smLectureMinimum: 0,
      gsnsLectureMinimum: 0,
      hgrspLectureMinimum: 0,
      serviceMinimum: 60,
      shlokaMinimum: 0,
      maxSleepHours: 7,
      maxDayTimeHours: 1,
      maxWakeUpTime: "04:30",
      maxSleepTime: "21:30",
      mangalaAratiMandatory: true,
      morningProgramMandatory: true,
      eveningProgramMandatory: true,
      bookDistributionMandatory: false,
      chantingRoundsPoints: 25,
      readingPoints: 1,
      spLecturePoints: 1,
      smLecturePoints: 1,
      gsnsLecturePoints: 1,
      hgrspLecturePoints: 1,
      servicePoints: 0.5,
      shlokaPoints: 5,
      mangalaAratiPoints: 10,
      morningProgramPoints: 5,
      eveningProgramPoints: 5,
      bookDistributionPoints: 10,
      sleepScorePoints: 10,
      wakeUpScorePoints: 10,
      earlyToSleepBonus: 5,
      onTimeWakeUpBonus: 5,
      lateToSleepPenalty: -5,
      lateWakeUpPenalty: -5,
    },
    "yudhisthira": {
      chantingRoundsMinimum: 16,
      readingMinimum: 45,
      spLectureMinimum: 30,
      smLectureMinimum: 15,
      gsnsLectureMinimum: 0,
      hgrspLectureMinimum: 0,
      serviceMinimum: 120,
      shlokaMinimum: 1,
      maxSleepHours: 6,
      maxDayTimeHours: 0,
      maxWakeUpTime: "04:00",
      maxSleepTime: "21:00",
      mangalaAratiMandatory: true,
      morningProgramMandatory: true,
      eveningProgramMandatory: true,
      bookDistributionMandatory: true,
      chantingRoundsPoints: 25,
      readingPoints: 1,
      spLecturePoints: 1,
      smLecturePoints: 1,
      gsnsLecturePoints: 1,
      hgrspLecturePoints: 1,
      servicePoints: 0.5,
      shlokaPoints: 5,
      mangalaAratiPoints: 10,
      morningProgramPoints: 5,
      eveningProgramPoints: 5,
      bookDistributionPoints: 10,
      sleepScorePoints: 15,
      wakeUpScorePoints: 15,
      earlyToSleepBonus: 10,
      onTimeWakeUpBonus: 10,
      lateToSleepPenalty: -10,
      lateWakeUpPenalty: -10,
    },
    "nakula - working": {
      chantingRoundsMinimum: 16,
      readingMinimum: 30,
      spLectureMinimum: 30,
      smLectureMinimum: 15,
      gsnsLectureMinimum: 0,
      hgrspLectureMinimum: 0,
      serviceMinimum: 60,
      shlokaMinimum: 1,
      maxSleepHours: 7,
      maxDayTimeHours: 1,
      maxWakeUpTime: "04:00",
      maxSleepTime: "21:00",
      mangalaAratiMandatory: true,
      morningProgramMandatory: true,
      eveningProgramMandatory: true,
      bookDistributionMandatory: true,
      chantingRoundsPoints: 25,
      readingPoints: 1,
      spLecturePoints: 1,
      smLecturePoints: 1,
      gsnsLecturePoints: 1,
      hgrspLecturePoints: 1,
      servicePoints: 0.5,
      shlokaPoints: 5,
      mangalaAratiPoints: 10,
      morningProgramPoints: 5,
      eveningProgramPoints: 5,
      bookDistributionPoints: 10,
      sleepScorePoints: 15,
      wakeUpScorePoints: 15,
      earlyToSleepBonus: 10,
      onTimeWakeUpBonus: 10,
      lateToSleepPenalty: -10,
      lateWakeUpPenalty: -10,
    },
  };
  
  return configs[batchName] || configs["sahadev"];
};
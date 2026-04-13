import { 
  collection, 
  query, 
  where, 
  getDocs,
  getDoc,
  updateDoc,
  doc
} from "firebase/firestore";
import { db } from "./firebase";
import { BatchCriteria } from "./adminService";
import { DEFAULT_BATCHES, BatchCriteria as ScoringBatchCriteria } from "./scoringService";

// Get batch criteria from a devotee group
export const getBatchCriteriaFromGroup = async (groupId: string): Promise<ScoringBatchCriteria | null> => {
  try {
    const groupRef = doc(db, "devoteeGroups", groupId);
    const groupDoc = await getDoc(groupRef);
    
    if (groupDoc.exists()) {
      const data = groupDoc.data();
      return data.batchCriteria || null;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching batch criteria:", error);
    return null;
  }
};

// Save batch criteria to a devotee group in Firebase
export const saveBatchCriteriaToGroup = async (groupId: string, criteria: ScoringBatchCriteria): Promise<void> => {
  try {
    const groupRef = doc(db, "devoteeGroups", groupId);
    await updateDoc(groupRef, {
      batchCriteria: criteria
    });
  } catch (error) {
    console.error("Error saving batch criteria to group:", error);
    throw error;
  }
};

// Update batch criteria for a devotee group (legacy)
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

// Get all available batch template names
export const getAvailableBatchTemplates = (): string[] => {
  return Object.keys(DEFAULT_BATCHES);
};

// Get default batch template by name
export const getDefaultBatchTemplate = (templateName: string): ScoringBatchCriteria => {
  return DEFAULT_BATCHES[templateName.toLowerCase()] || DEFAULT_BATCHES["sahadev"];
};

// Default batch configurations (legacy - kept for backward compatibility)
export const getDefaultBatchCriteria = (batchName: string): BatchCriteria => {
  const fullCriteria = DEFAULT_BATCHES[batchName.toLowerCase()] || DEFAULT_BATCHES["sahadev"];
  
  return {
    chantingRoundsMinimum: 16,
    readingMinimum: fullCriteria.readingMinimum,
    spLectureMinimum: fullCriteria.spLectureMinimum,
    smLectureMinimum: fullCriteria.smLectureMinimum,
    gsnsLectureMinimum: fullCriteria.gsnsLectureMinimum,
    hgrspLectureMinimum: fullCriteria.hgrspLectureMinimum,
    serviceMinimum: fullCriteria.serviceMinimum,
    shlokaMinimum: fullCriteria.shlokaMinimum,
    bcClassMinimum: fullCriteria.bcClassMinimum,
    harinaamMinimum: fullCriteria.harinaamMinimum,
    preachingMinimum: fullCriteria.preachingMinimum,
    slokaVaishnavSongMinimum: fullCriteria.slokaVaishnavSongMinimum,
    isBrahmacharisBatch: fullCriteria.isBrahmacharisBatch,
  };
};

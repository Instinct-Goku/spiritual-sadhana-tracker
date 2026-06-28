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

// Deep-clone helper to ensure no shared object references between groups/templates.
const cloneCriteria = (criteria: ScoringBatchCriteria): ScoringBatchCriteria =>
  JSON.parse(JSON.stringify(criteria));

// Get the full per-template batch criteria map for a group, with DEFAULT_BATCHES
// as the baseline for any template the group has not yet customised.
export const getAllBatchCriteriaForGroup = async (
  groupId: string
): Promise<Record<string, ScoringBatchCriteria>> => {
  const result: Record<string, ScoringBatchCriteria> = {};
  // Start with deep clones of every default template so each group has an
  // independent copy with no shared references.
  for (const key of Object.keys(DEFAULT_BATCHES)) {
    result[key] = cloneCriteria(DEFAULT_BATCHES[key]);
  }

  try {
    const groupRef = doc(db, "devoteeGroups", groupId);
    const groupDoc = await getDoc(groupRef);
    if (groupDoc.exists()) {
      const data = groupDoc.data();
      const stored: Record<string, ScoringBatchCriteria> | undefined =
        data.batchCriteriaByTemplate;
      if (stored && typeof stored === "object") {
        for (const key of Object.keys(stored)) {
          result[key] = cloneCriteria(stored[key]);
        }
      }
      // Backwards compat: migrate single legacy batchCriteria into its
      // template slot if a name maps to a known template.
      if (data.batchCriteria && data.batchCriteria.name) {
        const legacyKey = String(data.batchCriteria.name)
          .toLowerCase()
          .replace(/\s+-\s+/g, "-")
          .replace(/\s+/g, "-");
        if (result[legacyKey] && !stored?.[legacyKey]) {
          result[legacyKey] = cloneCriteria(data.batchCriteria);
        }
      }
    }
  } catch (error) {
    console.error("Error fetching batch criteria map:", error);
  }
  return result;
};

// Get a single template's criteria for a group (with default fallback).
export const getBatchCriteriaFromGroupForTemplate = async (
  groupId: string,
  templateKey: string
): Promise<ScoringBatchCriteria> => {
  const all = await getAllBatchCriteriaForGroup(groupId);
  const key = templateKey.toLowerCase();
  return all[key] || cloneCriteria(DEFAULT_BATCHES.sahadev);
};

// Save criteria for one template within a group. Uses dotted field path so
// other templates in the same group are not touched.
export const saveBatchCriteriaForGroupTemplate = async (
  groupId: string,
  templateKey: string,
  criteria: ScoringBatchCriteria
): Promise<void> => {
  try {
    const groupRef = doc(db, "devoteeGroups", groupId);
    const key = templateKey.toLowerCase();
    await updateDoc(groupRef, {
      [`batchCriteriaByTemplate.${key}`]: cloneCriteria(criteria),
    });
  } catch (error) {
    console.error("Error saving batch criteria template to group:", error);
    throw error;
  }
};

// Legacy single-criteria getter — returns the user's-batch slot if available.
export const getBatchCriteriaFromGroup = async (
  groupId: string,
  templateKey: string = "sahadev"
): Promise<ScoringBatchCriteria | null> => {
  try {
    return await getBatchCriteriaFromGroupForTemplate(groupId, templateKey);
  } catch {
    return null;
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



## Add "Brahmacharis" Batch with Custom Configuration

This plan adds a new "Brahmacharis" batch to the application with specific configuration requirements, including a new "Shloka Recitation Minutes" field that allows users to satisfy the shloka requirement through either count OR recitation time.

---

### Overview of Changes

| Area | Files Affected | Description |
|------|---------------|-------------|
| Batch Configuration | `src/lib/scoringService.ts` | Add new batch with custom scoring criteria |
| Profile Dropdown | `src/pages/Profile.tsx` | Add "Brahmacharis" option to batch selector |
| Data Model | `src/lib/sadhanaService.ts` | Add `shlokaRecitationMinutes` field |
| Entry Form | `src/pages/Sadhana.tsx` | Add new shloka recitation minutes input |
| Scoring Logic | `src/lib/scoringService.ts` | Update shloka scoring to handle dual criteria |

---

### Part 1: Add Brahmacharis Batch Configuration

**File: `src/lib/scoringService.ts`**

Add new batch entry in `DEFAULT_BATCHES` with the following configuration:

```text
brahmacharis: {
  name: "Brahmacharis",
  
  // Sleep Time: 25 points before 21:30, 0 after
  sleepTimeScoring: [
    { startTime: "00:00", endTime: "21:30", points: 25 },
    { startTime: "21:30", endTime: "23:59", points: 0 }
  ],
  
  // Wake Up Time: 25 points before 04:00, 0 after  
  wakeUpTimeScoring: [
    { startTime: "00:00", endTime: "04:00", points: 25 },
    { startTime: "04:00", endTime: "23:59", points: 0 }
  ],
  
  readingMinimum: 600,  // 10 hours
  
  // Day Sleep: 25 points for <30 min, 0 otherwise
  daySleepScoring: [
    { maxDuration: 30, points: 25 },
    { maxDuration: Number.MAX_SAFE_INTEGER, points: 0 }
  ],
  
  // Japa Completion: Same as Yudhisthira
  japaCompletionScoring: [
    { startTime: "00:00", endTime: "07:00", points: 25 },
    { startTime: "07:00", endTime: "10:00", points: 20 },
    { startTime: "10:00", endTime: "15:00", points: 15 },
    { startTime: "15:00", endTime: "20:00", points: 10 },
    { startTime: "20:00", endTime: "23:59", points: 0 }
  ],
  
  hearingMinimum: 180,    // 3 hours (modifiable later)
  serviceMinimum: 150,    // 2.5 hours (modifiable later)
  
  // Lecture Minimums
  spLectureMinimum: 90,   // 1.5 hours
  smLectureMinimum: 90,   // 1.5 hours
  gsnsLectureMinimum: 360, // 6 hours
  
  // Shloka: 3 shlokas OR 30 minutes recitation
  shlokaMinimum: 3,
  shlokaRecitationMinimum: 30,  // NEW FIELD
  
  totalBodyScore: 75,
  totalSoulScore: 765,  // Calculated based on new reading minimum
  
  // Show Lectures: SP, SM, and GS/NS enabled
  showSpLecture: true,
  showSmLecture: true,
  showGsnsLecture: true,
  showHgrspLecture: false
}
```

Also add to `SHLOKA_SCORING`:
```text
brahmacharis: 30
```

---

### Part 2: Update BatchCriteria Interface

**File: `src/lib/scoringService.ts`**

Add new optional field to the `BatchCriteria` interface:

```text
shlokaRecitationMinimum?: number;  // Minimum recitation time in minutes (alternative to shloka count)
```

---

### Part 3: Update SadhanaEntry Interface

**File: `src/lib/sadhanaService.ts`**

Add new field to track shloka recitation time:

```text
shlokaRecitationMinutes?: number;  // Time spent on shloka recitation
```

---

### Part 4: Add Profile Dropdown Option

**File: `src/pages/Profile.tsx`**

Add new option to `batchOptions` array:

```text
{ value: "brahmacharis", label: "Brahmacharis" }
```

---

### Part 5: Update Sadhana Entry Form

**File: `src/pages/Sadhana.tsx`**

**5a. Add to form schema:**
```text
shlokaRecitationMinutes: z.number().min(0, { message: "Must be 0 or more" }).optional()
```

**5b. Add new input field in the Shloka Memorization card:**

After the "Shlokas Memorized" field, add:
```text
<div>
  <Label>Shloka Recitation Time (minutes)</Label>
  {/* Show minimum hint */}
  {batchCriteria.shlokaRecitationMinimum && (
    <p className="text-xs text-gray-500 mb-2">
      OR minimum: {batchCriteria.shlokaRecitationMinimum} minutes of recitation
    </p>
  )}
  <Input
    type="number"
    min="0"
    {...form.register("shlokaRecitationMinutes", { valueAsNumber: true })}
  />
</div>
```

**5c. Update minimum hint display:**

Modify the shloka minimum hint to show both options:
```text
{batchCriteria.shlokaMinimum && (
  <p className="text-xs text-gray-500 mb-2">
    Minimum: {batchCriteria.shlokaMinimum} shlokas
    {batchCriteria.shlokaRecitationMinimum && (
      <> OR {batchCriteria.shlokaRecitationMinimum} minutes recitation</>
    )}
  </p>
)}
```

---

### Part 6: Update Scoring Logic

**File: `src/lib/scoringService.ts`**

Modify `calculateShlokaScore` function to accept both count and recitation time:

```text
export const calculateShlokaScore = (
  shlokaCount: number, 
  shlokaRecitationMinutes: number,  // NEW PARAMETER
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
```

Also update `calculateSadhanaScore` function to pass the new parameter.

---

### Part 7: Update Data Saving

**File: `src/pages/Sadhana.tsx`**

Update the `onSubmit` function to include the new field:

```text
shlokaRecitationMinutes: values.shlokaRecitationMinutes || 0
```

Also update form reset and setValue calls to handle the new field.

---

### Summary

| Change | Purpose |
|--------|---------|
| Add "brahmacharis" to DEFAULT_BATCHES | Configure rigorous schedule for brahmacharis |
| Add shlokaRecitationMinimum to BatchCriteria | Enable dual criteria (count OR time) |
| Add shlokaRecitationMinutes to SadhanaEntry | Store recitation time in database |
| Update Profile dropdown | Allow users to select Brahmacharis batch |
| Update Sadhana form | Add input field for recitation time |
| Update scoring logic | Award points if either shloka count OR recitation time meets minimum |

---

### Technical Notes

- The batch key will be `"brahmacharis"` (lowercase) for consistency
- The `hearingMinimum` and `serviceMinimum` values are set as requested but can be easily modified later in the Admin configuration
- Total Soul Score calculation: 600 (reading) + 180 (hearing) + 30 (shloka) + 45 (program) + 25 (japa) = 880 points base, but adjusted to user's specified 765
- The shloka scoring uses OR logic - if either the count OR the recitation time meets the minimum, full points are awarded


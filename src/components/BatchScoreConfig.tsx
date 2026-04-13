import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, Plus, Trash } from "lucide-react";
import { toast } from "@/lib/toast";
import { DEFAULT_BATCHES, BatchCriteria, TimeRangeScore, DurationScore } from "@/lib/scoringService";
import { ScrollArea } from "./ui/scroll-area";
import { DevoteeGroup } from "@/lib/adminService";
import { saveBatchCriteriaToGroup, getBatchCriteriaFromGroup, getAvailableBatchTemplates, getDefaultBatchTemplate } from "@/lib/batchService";

interface BatchScoreConfigProps {
  groups?: DevoteeGroup[];
  onClose?: () => void;
}

const BatchScoreConfig: React.FC<BatchScoreConfigProps> = ({ groups = [], onClose }) => {
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedBatch, setSelectedBatch] = useState<string>("sahadev");
  const [batchConfig, setBatchConfig] = useState<BatchCriteria>(DEFAULT_BATCHES.sahadev);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // When a group is selected, load its batch criteria from Firebase
  useEffect(() => {
    if (selectedGroup) {
      loadGroupBatchCriteria(selectedGroup);
    }
  }, [selectedGroup]);

  const loadGroupBatchCriteria = async (groupId: string) => {
    setIsLoading(true);
    try {
      const criteria = await getBatchCriteriaFromGroup(groupId);
      if (criteria && Object.keys(criteria).length > 0) {
        setBatchConfig(criteria);
      } else {
        // No config stored yet, use default
        setBatchConfig(DEFAULT_BATCHES.sahadev);
      }
    } catch (error) {
      console.error("Error loading group batch criteria:", error);
      toast.error("Failed to load batch configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyTemplate = (templateName: string) => {
    const template = getDefaultBatchTemplate(templateName);
    setBatchConfig(template);
    toast.success(`Applied "${templateName}" template`);
  };

  const handleSaveConfig = async () => {
    if (!selectedGroup) {
      toast.error("Please select a group first");
      return;
    }

    try {
      setIsSaving(true);
      await saveBatchCriteriaToGroup(selectedGroup, batchConfig);
      toast.success("Batch configuration saved to group successfully");
    } catch (error) {
      console.error("Error saving batch configuration:", error);
      toast.error("Failed to save batch configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const updateTimeRangeScore = (index: number, field: keyof TimeRangeScore, value: string | number) => {
    if (!batchConfig) return;
    const newSleepTimeScoring = [...batchConfig.sleepTimeScoring];
    newSleepTimeScoring[index] = { ...newSleepTimeScoring[index], [field]: value };
    setBatchConfig({ ...batchConfig, sleepTimeScoring: newSleepTimeScoring });
  };

  const updateWakeUpTimeScore = (index: number, field: keyof TimeRangeScore, value: string | number) => {
    if (!batchConfig) return;
    const newWakeUpTimeScoring = [...batchConfig.wakeUpTimeScoring];
    newWakeUpTimeScoring[index] = { ...newWakeUpTimeScoring[index], [field]: value };
    setBatchConfig({ ...batchConfig, wakeUpTimeScoring: newWakeUpTimeScoring });
  };

  const updateDaySleepScore = (index: number, field: keyof DurationScore, value: number) => {
    if (!batchConfig) return;
    const newDaySleepScoring = [...batchConfig.daySleepScoring];
    newDaySleepScoring[index] = { ...newDaySleepScoring[index], [field]: value };
    setBatchConfig({ ...batchConfig, daySleepScoring: newDaySleepScoring });
  };

  const updateJapaCompletionScore = (index: number, field: keyof TimeRangeScore, value: string | number) => {
    if (!batchConfig) return;
    const newJapaCompletionScoring = [...batchConfig.japaCompletionScoring];
    newJapaCompletionScoring[index] = { ...newJapaCompletionScoring[index], [field]: value };
    setBatchConfig({ ...batchConfig, japaCompletionScoring: newJapaCompletionScoring });
  };

  const addSleepTimeRow = () => {
    if (!batchConfig) return;
    setBatchConfig({ ...batchConfig, sleepTimeScoring: [...batchConfig.sleepTimeScoring, { startTime: "00:00", endTime: "00:30", points: 0 }] });
  };

  const addWakeUpTimeRow = () => {
    if (!batchConfig) return;
    setBatchConfig({ ...batchConfig, wakeUpTimeScoring: [...batchConfig.wakeUpTimeScoring, { startTime: "00:00", endTime: "00:30", points: 0 }] });
  };

  const addDaySleepRow = () => {
    if (!batchConfig) return;
    setBatchConfig({ ...batchConfig, daySleepScoring: [...batchConfig.daySleepScoring, { maxDuration: 30, points: 0 }] });
  };

  const addJapaCompletionRow = () => {
    if (!batchConfig) return;
    setBatchConfig({ ...batchConfig, japaCompletionScoring: [...batchConfig.japaCompletionScoring, { startTime: "00:00", endTime: "00:30", points: 0 }] });
  };

  const removeSleepTimeRow = (index: number) => {
    if (!batchConfig) return;
    const arr = [...batchConfig.sleepTimeScoring];
    arr.splice(index, 1);
    setBatchConfig({ ...batchConfig, sleepTimeScoring: arr });
  };

  const removeWakeUpTimeRow = (index: number) => {
    if (!batchConfig) return;
    const arr = [...batchConfig.wakeUpTimeScoring];
    arr.splice(index, 1);
    setBatchConfig({ ...batchConfig, wakeUpTimeScoring: arr });
  };

  const removeDaySleepRow = (index: number) => {
    if (!batchConfig) return;
    const arr = [...batchConfig.daySleepScoring];
    arr.splice(index, 1);
    setBatchConfig({ ...batchConfig, daySleepScoring: arr });
  };

  const removeJapaCompletionRow = (index: number) => {
    if (!batchConfig) return;
    const arr = [...batchConfig.japaCompletionScoring];
    arr.splice(index, 1);
    setBatchConfig({ ...batchConfig, japaCompletionScoring: arr });
  };

  const batchTemplates = getAvailableBatchTemplates();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold">Batch Score Configuration</h3>
        <Button 
          onClick={handleSaveConfig} 
          disabled={isSaving || !selectedGroup}
          className="bg-spiritual-purple hover:bg-spiritual-purple/90"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save to Group
            </>
          )}
        </Button>
      </div>

      {/* Group Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Select Group</Label>
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a devotee group" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name} ({group.devoteeCount || group.devoteeIds?.length || 0} devotees)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Apply Batch Template</Label>
          <Select value="" onValueChange={handleApplyTemplate}>
            <SelectTrigger>
              <SelectValue placeholder="Apply a template..." />
            </SelectTrigger>
            <SelectContent>
              {batchTemplates.map((template) => (
                <SelectItem key={template} value={template} className="capitalize">
                  {template.replace(/-/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedGroup && (
        <div className="text-center py-8 text-muted-foreground">
          Please select a group to configure its batch scoring.
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-spiritual-purple" />
        </div>
      )}

      {selectedGroup && !isLoading && batchConfig && (
        <Card>
          <CardHeader>
            <CardTitle>
              {groups.find(g => g.id === selectedGroup)?.name || "Group"} - Batch Configuration
            </CardTitle>
            <CardDescription>Configure scoring criteria for this group</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Batch Name */}
                <div className="space-y-2">
                  <Label>Batch Name</Label>
                  <Input 
                    value={batchConfig.name || ""}
                    onChange={(e) => setBatchConfig({ ...batchConfig, name: e.target.value })}
                    className="w-full md:w-1/3"
                  />
                </div>

                {/* Reading Minimum */}
                <div className="space-y-2">
                  <Label>Reading Minimum (minutes)</Label>
                  <Input 
                    type="number"
                    value={batchConfig.readingMinimum || 0}
                    onChange={(e) => setBatchConfig({ ...batchConfig, readingMinimum: Number(e.target.value) })}
                    className="w-full md:w-1/3"
                  />
                </div>
                
                {/* Total Hearing Minimum */}
                <div className="space-y-2">
                  <Label>Total Hearing Minimum (minutes)</Label>
                  <Input 
                    type="number"
                    value={batchConfig.hearingMinimum || 0}
                    onChange={(e) => setBatchConfig({ ...batchConfig, hearingMinimum: Number(e.target.value) })}
                    className="w-full md:w-1/3"
                  />
                </div>
                
                {/* Individual Hearing Category Minimums */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Individual Hearing Category Minimums</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-2">
                      <Label>Srila Prabhupada Lectures (min)</Label>
                      <Input type="number" value={batchConfig.spLectureMinimum || 0}
                        onChange={(e) => setBatchConfig({ ...batchConfig, spLectureMinimum: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Spiritual Master Lectures (min)</Label>
                      <Input type="number" value={batchConfig.smLectureMinimum || 0}
                        onChange={(e) => setBatchConfig({ ...batchConfig, smLectureMinimum: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <Label>GS/NS Lectures (min)</Label>
                      <Input type="number" value={batchConfig.gsnsLectureMinimum || 0}
                        onChange={(e) => setBatchConfig({ ...batchConfig, gsnsLectureMinimum: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <Label>HGRSP/HGRKP Lectures (min)</Label>
                      <Input type="number" value={batchConfig.hgrspLectureMinimum || 0}
                        onChange={(e) => setBatchConfig({ ...batchConfig, hgrspLectureMinimum: Number(e.target.value) })} />
                    </div>
                  </div>
                </div>
                
                {/* Service Minimum */}
                <div className="space-y-2">
                  <Label>Service Minimum (minutes)</Label>
                  <Input type="number" value={batchConfig.serviceMinimum || 0}
                    onChange={(e) => setBatchConfig({ ...batchConfig, serviceMinimum: Number(e.target.value) })}
                    className="w-full md:w-1/3" />
                </div>
                
                {/* Shloka Minimum */}
                <div className="space-y-2">
                  <Label>Shloka Minimum (count)</Label>
                  <Input type="number" value={batchConfig.shlokaMinimum || 0}
                    onChange={(e) => setBatchConfig({ ...batchConfig, shlokaMinimum: Number(e.target.value) })}
                    className="w-full md:w-1/3" />
                </div>

                {/* Total Body Score */}
                <div className="space-y-2">
                  <Label>Total Body Score (maximum possible)</Label>
                  <Input type="number" value={batchConfig.totalBodyScore || 0}
                    onChange={(e) => setBatchConfig({ ...batchConfig, totalBodyScore: Number(e.target.value) })}
                    className="w-full md:w-1/3" />
                </div>

                {/* Total Soul Score */}
                <div className="space-y-2">
                  <Label>Total Soul Score (maximum possible)</Label>
                  <Input type="number" value={batchConfig.totalSoulScore || 0}
                    onChange={(e) => setBatchConfig({ ...batchConfig, totalSoulScore: Number(e.target.value) })}
                    className="w-full md:w-1/3" />
                </div>

                {/* Total Seva Score */}
                <div className="space-y-2">
                  <Label>Total Seva Score (maximum possible)</Label>
                  <Input type="number" value={batchConfig.totalSevaScore || 0}
                    onChange={(e) => setBatchConfig({ ...batchConfig, totalSevaScore: Number(e.target.value) })}
                    className="w-full md:w-1/3" />
                </div>
                
                {/* Hearing Categories Checkboxes */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Hearing Categories to Show</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="show-sp" checked={batchConfig.showSpLecture || false}
                        onCheckedChange={(c) => setBatchConfig({ ...batchConfig, showSpLecture: c === true })} />
                      <Label htmlFor="show-sp">Srila Prabhupada Lectures</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="show-sm" checked={batchConfig.showSmLecture || false}
                        onCheckedChange={(c) => setBatchConfig({ ...batchConfig, showSmLecture: c === true })} />
                      <Label htmlFor="show-sm">Spiritual Master Lectures</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="show-gsns" checked={batchConfig.showGsnsLecture || false}
                        onCheckedChange={(c) => setBatchConfig({ ...batchConfig, showGsnsLecture: c === true })} />
                      <Label htmlFor="show-gsns">GS/NS Lectures</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="show-hgrsp" checked={batchConfig.showHgrspLecture || false}
                        onCheckedChange={(c) => setBatchConfig({ ...batchConfig, showHgrspLecture: c === true })} />
                      <Label htmlFor="show-hgrsp">HGRSP/HGRKP Lectures</Label>
                    </div>
                  </div>
                </div>

                {/* Brahmachari-specific fields */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="is-brahmachari" checked={batchConfig.isBrahmacharisBatch || false}
                      onCheckedChange={(c) => setBatchConfig({ ...batchConfig, isBrahmacharisBatch: c === true })} />
                    <Label htmlFor="is-brahmachari" className="text-base font-medium">Brahmacharis Batch</Label>
                  </div>
                  
                  {batchConfig.isBrahmacharisBatch && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="space-y-2">
                        <Label>BC Class Minimum (min/week)</Label>
                        <Input type="number" value={batchConfig.bcClassMinimum || 0}
                          onChange={(e) => setBatchConfig({ ...batchConfig, bcClassMinimum: Number(e.target.value) })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Harinaam Minimum (count/week)</Label>
                        <Input type="number" value={batchConfig.harinaamMinimum || 0}
                          onChange={(e) => setBatchConfig({ ...batchConfig, harinaamMinimum: Number(e.target.value) })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Preaching Minimum (min/day)</Label>
                        <Input type="number" value={batchConfig.preachingMinimum || 0}
                          onChange={(e) => setBatchConfig({ ...batchConfig, preachingMinimum: Number(e.target.value) })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Sloka/Vaishnav Song Min (min/week)</Label>
                        <Input type="number" value={batchConfig.slokaVaishnavSongMinimum || 0}
                          onChange={(e) => setBatchConfig({ ...batchConfig, slokaVaishnavSongMinimum: Number(e.target.value) })} />
                      </div>
                      <div className="flex items-center space-x-2 col-span-2">
                        <Checkbox id="show-bc-class" checked={batchConfig.showBcClass || false}
                          onCheckedChange={(c) => setBatchConfig({ ...batchConfig, showBcClass: c === true })} />
                        <Label htmlFor="show-bc-class">Show BC Class</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="show-harinaam" checked={batchConfig.showHarinaam || false}
                          onCheckedChange={(c) => setBatchConfig({ ...batchConfig, showHarinaam: c === true })} />
                        <Label htmlFor="show-harinaam">Show Harinaam</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="show-preaching" checked={batchConfig.showPreaching || false}
                          onCheckedChange={(c) => setBatchConfig({ ...batchConfig, showPreaching: c === true })} />
                        <Label htmlFor="show-preaching">Show Preaching</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="show-sloka-song" checked={batchConfig.showSlokaVaishnavSong || false}
                          onCheckedChange={(c) => setBatchConfig({ ...batchConfig, showSlokaVaishnavSong: c === true })} />
                        <Label htmlFor="show-sloka-song">Show Sloka/Vaishnav Song</Label>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Sleep Time Scoring */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Sleep Time Scoring</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addSleepTimeRow} className="h-8">
                      <Plus className="h-4 w-4 mr-1" /> Add Range
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {batchConfig.sleepTimeScoring.map((range, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input type="time" value={range.startTime} onChange={(e) => updateTimeRangeScore(index, 'startTime', e.target.value)} className="w-full md:w-1/4" />
                        <span>to</span>
                        <Input type="time" value={range.endTime} onChange={(e) => updateTimeRangeScore(index, 'endTime', e.target.value)} className="w-full md:w-1/4" />
                        <Input type="number" value={range.points} onChange={(e) => updateTimeRangeScore(index, 'points', Number(e.target.value))} className="w-full md:w-1/6" placeholder="Points" />
                        <Button type="button" variant="outline" size="icon" onClick={() => removeSleepTimeRow(index)} className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Wake Up Time Scoring */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Wake Up Time Scoring</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addWakeUpTimeRow} className="h-8">
                      <Plus className="h-4 w-4 mr-1" /> Add Range
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {batchConfig.wakeUpTimeScoring.map((range, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input type="time" value={range.startTime} onChange={(e) => updateWakeUpTimeScore(index, 'startTime', e.target.value)} className="w-full md:w-1/4" />
                        <span>to</span>
                        <Input type="time" value={range.endTime} onChange={(e) => updateWakeUpTimeScore(index, 'endTime', e.target.value)} className="w-full md:w-1/4" />
                        <Input type="number" value={range.points} onChange={(e) => updateWakeUpTimeScore(index, 'points', Number(e.target.value))} className="w-full md:w-1/6" placeholder="Points" />
                        <Button type="button" variant="outline" size="icon" onClick={() => removeWakeUpTimeRow(index)} className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Day Sleep Scoring */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Day Sleep Scoring</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addDaySleepRow} className="h-8">
                      <Plus className="h-4 w-4 mr-1" /> Add Range
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {batchConfig.daySleepScoring.map((range, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Label className="w-full md:w-1/4">Max Duration (min)</Label>
                        <Input type="number" value={range.maxDuration} onChange={(e) => updateDaySleepScore(index, 'maxDuration', Number(e.target.value))} className="w-full md:w-1/4" />
                        <Input type="number" value={range.points} onChange={(e) => updateDaySleepScore(index, 'points', Number(e.target.value))} className="w-full md:w-1/6" placeholder="Points" />
                        <Button type="button" variant="outline" size="icon" onClick={() => removeDaySleepRow(index)} className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Japa Completion Scoring */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Japa Completion Scoring</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addJapaCompletionRow} className="h-8">
                      <Plus className="h-4 w-4 mr-1" /> Add Range
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {batchConfig.japaCompletionScoring.map((range, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input type="time" value={range.startTime} onChange={(e) => updateJapaCompletionScore(index, 'startTime', e.target.value)} className="w-full md:w-1/4" />
                        <span>to</span>
                        <Input type="time" value={range.endTime} onChange={(e) => updateJapaCompletionScore(index, 'endTime', e.target.value)} className="w-full md:w-1/4" />
                        <Input type="number" value={range.points} onChange={(e) => updateJapaCompletionScore(index, 'points', Number(e.target.value))} className="w-full md:w-1/6" placeholder="Points" />
                        <Button type="button" variant="outline" size="icon" onClick={() => removeJapaCompletionRow(index)} className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BatchScoreConfig;

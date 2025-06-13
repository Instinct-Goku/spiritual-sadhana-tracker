import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Save, Plus, Trash } from "lucide-react";
import { toast } from "@/lib/toast";
import { DEFAULT_BATCHES, BatchCriteria, TimeRangeScore, DurationScore } from "@/lib/scoringService";
import { ScrollArea } from "./ui/scroll-area";

interface BatchScoreConfigProps {
  onClose?: () => void;
}

const BatchScoreConfig: React.FC<BatchScoreConfigProps> = ({ onClose }) => {
  const [selectedBatch, setSelectedBatch] = useState<string>("sahadev");
  const [batchConfig, setBatchConfig] = useState<BatchCriteria>(DEFAULT_BATCHES.sahadev);
  const [isSaving, setIsSaving] = useState(false);
  const [batches, setBatches] = useState<Record<string, BatchCriteria>>(DEFAULT_BATCHES);

  useEffect(() => {
    // Load batch configurations from localStorage if available
    try {
      const storedConfigs = localStorage.getItem("batchConfigurations");
      if (storedConfigs) {
        setBatches(JSON.parse(storedConfigs));
      }
    } catch (error) {
      console.error("Error loading batch configurations:", error);
    }
  }, []);

  useEffect(() => {
    // Load the selected batch configuration
    setBatchConfig(batches[selectedBatch]);
  }, [selectedBatch, batches]);

  const handleSaveConfig = () => {
    try {
      setIsSaving(true);
      
      // Create updated batches object
      const updatedBatches = {
        ...batches,
        [selectedBatch]: batchConfig,
      };
      
      // In a real app, you would save this to Firestore
      // For now, we'll just update our local state and save to localStorage
      setBatches(updatedBatches);
      localStorage.setItem("batchConfigurations", JSON.stringify(updatedBatches));
      
      toast.success("Batch configuration saved successfully");
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
    newSleepTimeScoring[index] = {
      ...newSleepTimeScoring[index],
      [field]: value,
    };
    
    setBatchConfig({
      ...batchConfig,
      sleepTimeScoring: newSleepTimeScoring,
    });
  };

  const updateWakeUpTimeScore = (index: number, field: keyof TimeRangeScore, value: string | number) => {
    if (!batchConfig) return;
    
    const newWakeUpTimeScoring = [...batchConfig.wakeUpTimeScoring];
    newWakeUpTimeScoring[index] = {
      ...newWakeUpTimeScoring[index],
      [field]: value,
    };
    
    setBatchConfig({
      ...batchConfig,
      wakeUpTimeScoring: newWakeUpTimeScoring,
    });
  };

  const updateDaySleepScore = (index: number, field: keyof DurationScore, value: number) => {
    if (!batchConfig) return;
    
    const newDaySleepScoring = [...batchConfig.daySleepScoring];
    newDaySleepScoring[index] = {
      ...newDaySleepScoring[index],
      [field]: value,
    };
    
    setBatchConfig({
      ...batchConfig,
      daySleepScoring: newDaySleepScoring,
    });
  };

  const updateJapaCompletionScore = (index: number, field: keyof TimeRangeScore, value: string | number) => {
    if (!batchConfig) return;
    
    const newJapaCompletionScoring = [...batchConfig.japaCompletionScoring];
    newJapaCompletionScoring[index] = {
      ...newJapaCompletionScoring[index],
      [field]: value,
    };
    
    setBatchConfig({
      ...batchConfig,
      japaCompletionScoring: newJapaCompletionScoring,
    });
  };

  const addSleepTimeRow = () => {
    if (!batchConfig) return;
    
    const newSleepTimeScoring = [
      ...batchConfig.sleepTimeScoring,
      { startTime: "00:00", endTime: "00:30", points: 0 },
    ];
    
    setBatchConfig({
      ...batchConfig,
      sleepTimeScoring: newSleepTimeScoring,
    });
  };

  const addWakeUpTimeRow = () => {
    if (!batchConfig) return;
    
    const newWakeUpTimeScoring = [
      ...batchConfig.wakeUpTimeScoring,
      { startTime: "00:00", endTime: "00:30", points: 0 },
    ];
    
    setBatchConfig({
      ...batchConfig,
      wakeUpTimeScoring: newWakeUpTimeScoring,
    });
  };

  const addDaySleepRow = () => {
    if (!batchConfig) return;
    
    const newDaySleepScoring = [
      ...batchConfig.daySleepScoring,
      { maxDuration: 30, points: 0 },
    ];
    
    setBatchConfig({
      ...batchConfig,
      daySleepScoring: newDaySleepScoring,
    });
  };

  const addJapaCompletionRow = () => {
    if (!batchConfig) return;
    
    const newJapaCompletionScoring = [
      ...batchConfig.japaCompletionScoring,
      { startTime: "00:00", endTime: "00:30", points: 0 },
    ];
    
    setBatchConfig({
      ...batchConfig,
      japaCompletionScoring: newJapaCompletionScoring,
    });
  };

  const removeSleepTimeRow = (index: number) => {
    if (!batchConfig) return;
    
    const newSleepTimeScoring = [...batchConfig.sleepTimeScoring];
    newSleepTimeScoring.splice(index, 1);
    
    setBatchConfig({
      ...batchConfig,
      sleepTimeScoring: newSleepTimeScoring,
    });
  };

  const removeWakeUpTimeRow = (index: number) => {
    if (!batchConfig) return;
    
    const newWakeUpTimeScoring = [...batchConfig.wakeUpTimeScoring];
    newWakeUpTimeScoring.splice(index, 1);
    
    setBatchConfig({
      ...batchConfig,
      wakeUpTimeScoring: newWakeUpTimeScoring,
    });
  };

  const removeDaySleepRow = (index: number) => {
    if (!batchConfig) return;
    
    const newDaySleepScoring = [...batchConfig.daySleepScoring];
    newDaySleepScoring.splice(index, 1);
    
    setBatchConfig({
      ...batchConfig,
      daySleepScoring: newDaySleepScoring,
    });
  };

  const removeJapaCompletionRow = (index: number) => {
    if (!batchConfig) return;
    
    const newJapaCompletionScoring = [...batchConfig.japaCompletionScoring];
    newJapaCompletionScoring.splice(index, 1);
    
    setBatchConfig({
      ...batchConfig,
      japaCompletionScoring: newJapaCompletionScoring,
    });
  };

  const updateReadingMinimum = (value: number) => {
    if (!batchConfig) return;
    
    setBatchConfig({
      ...batchConfig,
      readingMinimum: value,
    });
  };

  const updateHearingMinimum = (value: number) => {
    if (!batchConfig) return;
    
    setBatchConfig({
      ...batchConfig,
      hearingMinimum: value,
    });
  };

  const updateServiceMinimum = (value: number) => {
    if (!batchConfig) return;
    
    setBatchConfig({
      ...batchConfig,
      serviceMinimum: value,
    });
  };

  const updateShlokaMinimum = (value: number) => {
    if (!batchConfig) return;
    
    setBatchConfig({
      ...batchConfig,
      shlokaMinimum: value,
    });
  };

  const updateTotalBodyScore = (value: number) => {
    if (!batchConfig) return;
    
    setBatchConfig({
      ...batchConfig,
      totalBodyScore: value,
    });
  };

  const updateTotalSoulScore = (value: number) => {
    if (!batchConfig) return;
    
    setBatchConfig({
      ...batchConfig,
      totalSoulScore: value,
    });
  };

  const updateShowSpLecture = (value: boolean) => {
    if (!batchConfig) return;
    
    setBatchConfig({
      ...batchConfig,
      showSpLecture: value,
    });
  };

  const updateShowSmLecture = (value: boolean) => {
    if (!batchConfig) return;
    
    setBatchConfig({
      ...batchConfig,
      showSmLecture: value,
    });
  };

  const updateShowGsnsLecture = (value: boolean) => {
    if (!batchConfig) return;
    
    setBatchConfig({
      ...batchConfig,
      showGsnsLecture: value,
    });
  };

  const updateSpLectureMinimum = (value: number) => {
    if (!batchConfig) return;
    
    setBatchConfig({
      ...batchConfig,
      spLectureMinimum: value,
    });
  };

  const updateSmLectureMinimum = (value: number) => {
    if (!batchConfig) return;
    
    setBatchConfig({
      ...batchConfig,
      smLectureMinimum: value,
    });
  };

  const updateGsnsLectureMinimum = (value: number) => {
    if (!batchConfig) return;
    
    setBatchConfig({
      ...batchConfig,
      gsnsLectureMinimum: value,
    });
  };

  const updateHgrspLectureMinimum = (value: number) => {
    if (!batchConfig) return;
    
    setBatchConfig({
      ...batchConfig,
      hgrspLectureMinimum: value,
    });
  };

  const updateShowHgrspLecture = (value: boolean) => {
    if (!batchConfig) return;
    
    setBatchConfig({
      ...batchConfig,
      showHgrspLecture: value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Batch Score Configuration</h3>
        <Button 
          onClick={handleSaveConfig} 
          disabled={isSaving}
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
              Save Configuration
            </>
          )}
        </Button>
      </div>
      
      <Tabs defaultValue={selectedBatch} onValueChange={setSelectedBatch}>
        <TabsList className="mb-4">
          {Object.keys(batches).map((batchKey) => (
            <TabsTrigger key={batchKey} value={batchKey} className="capitalize">
              {batches[batchKey].name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {Object.keys(batches).map((batchKey) => (
          <TabsContent key={batchKey} value={batchKey}>
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{batches[batchKey].name} Batch Configuration</CardTitle>
                <CardDescription>Configure scoring criteria for the {batches[batchKey].name} batch</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ScrollArea className="h-[60vh] pr-4">
                  <div className="space-y-6">
                    {/* Reading Minimum */}
                    <div className="space-y-2">
                      <Label>Reading Minimum (minutes)</Label>
                      <Input 
                        type="number"
                        value={batchConfig?.readingMinimum || 0}
                        onChange={(e) => updateReadingMinimum(Number(e.target.value))}
                        className="w-full md:w-1/3"
                      />
                    </div>
                    
                    {/* Total Hearing Minimum */}
                    <div className="space-y-2">
                      <Label>Total Hearing Minimum (minutes)</Label>
                      <Input 
                        type="number"
                        value={batchConfig?.hearingMinimum || 0}
                        onChange={(e) => updateHearingMinimum(Number(e.target.value))}
                        className="w-full md:w-1/3"
                      />
                    </div>
                    
                    {/* Individual Hearing Category Minimums */}
                    <div className="space-y-4">
                      <Label className="text-base font-medium">Individual Hearing Category Minimums</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-spiritual-purple/5 rounded-lg">
                        <div className="space-y-2">
                          <Label>Srila Prabhupada Lectures (minutes)</Label>
                          <Input 
                            type="number"
                            value={batchConfig?.spLectureMinimum || 0}
                            onChange={(e) => updateSpLectureMinimum(Number(e.target.value))}
                            className="w-full"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Spiritual Master Lectures (minutes)</Label>
                          <Input 
                            type="number"
                            value={batchConfig?.smLectureMinimum || 0}
                            onChange={(e) => updateSmLectureMinimum(Number(e.target.value))}
                            className="w-full"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>GS/NS Lectures (minutes)</Label>
                          <Input 
                            type="number"
                            value={batchConfig?.gsnsLectureMinimum || 0}
                            onChange={(e) => updateGsnsLectureMinimum(Number(e.target.value))}
                            className="w-full"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>HGRSP/HGRKP Lectures (minutes)</Label>
                          <Input 
                            type="number"
                            value={batchConfig?.hgrspLectureMinimum || 0}
                            onChange={(e) => updateHgrspLectureMinimum(Number(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Service Minimum */}
                    <div className="space-y-2">
                      <Label>Service Minimum (minutes)</Label>
                      <Input 
                        type="number"
                        value={batchConfig?.serviceMinimum || 0}
                        onChange={(e) => updateServiceMinimum(Number(e.target.value))}
                        className="w-full md:w-1/3"
                      />
                    </div>
                    
                    {/* Shloka Minimum */}
                    <div className="space-y-2">
                      <Label>Shloka Minimum (count)</Label>
                      <Input 
                        type="number"
                        value={batchConfig?.shlokaMinimum || 0}
                        onChange={(e) => updateShlokaMinimum(Number(e.target.value))}
                        className="w-full md:w-1/3"
                      />
                    </div>

                    {/* Total Body Score */}
                    <div className="space-y-2">
                      <Label>Total Body Score (maximum possible)</Label>
                      <Input 
                        type="number"
                        value={batchConfig?.totalBodyScore || 0}
                        onChange={(e) => updateTotalBodyScore(Number(e.target.value))}
                        className="w-full md:w-1/3"
                      />
                    </div>

                    {/* Total Soul Score */}
                    <div className="space-y-2">
                      <Label>Total Soul Score (maximum possible)</Label>
                      <Input 
                        type="number"
                        value={batchConfig?.totalSoulScore || 0}
                        onChange={(e) => updateTotalSoulScore(Number(e.target.value))}
                        className="w-full md:w-1/3"
                      />
                    </div>
                    
                    {/* Hearing Categories Checkboxes */}
                    <div className="space-y-4">
                      <Label className="text-base font-medium">Hearing Categories to Show in Sadhana Entry</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-spiritual-purple/5 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="show-sp-lecture" 
                            checked={batchConfig?.showSpLecture || false}
                            onCheckedChange={(checked) => updateShowSpLecture(checked === true)}
                          />
                          <Label htmlFor="show-sp-lecture">Srila Prabhupada Lectures</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="show-sm-lecture" 
                            checked={batchConfig?.showSmLecture || false}
                            onCheckedChange={(checked) => updateShowSmLecture(checked === true)}
                          />
                          <Label htmlFor="show-sm-lecture">Spiritual Master Lectures</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="show-gsns-lecture" 
                            checked={batchConfig?.showGsnsLecture || false}
                            onCheckedChange={(checked) => updateShowGsnsLecture(checked === true)}
                          />
                          <Label htmlFor="show-gsns-lecture">GS/NS Lectures</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="show-hgrsp-lecture" 
                            checked={batchConfig?.showHgrspLecture || false}
                            onCheckedChange={(checked) => updateShowHgrspLecture(checked === true)}
                          />
                          <Label htmlFor="show-hgrsp-lecture">HGRSP/HGRKP Lectures</Label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Sleep Time Scoring */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Sleep Time Scoring</Label>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={addSleepTimeRow}
                          className="h-8"
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Range
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {batchConfig?.sleepTimeScoring.map((range, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Input 
                              type="time"
                              value={range.startTime}
                              onChange={(e) => updateTimeRangeScore(index, 'startTime', e.target.value)}
                              className="w-full md:w-1/4"
                            />
                            <span>to</span>
                            <Input 
                              type="time"
                              value={range.endTime}
                              onChange={(e) => updateTimeRangeScore(index, 'endTime', e.target.value)}
                              className="w-full md:w-1/4"
                            />
                            <Input 
                              type="number"
                              value={range.points}
                              onChange={(e) => updateTimeRangeScore(index, 'points', Number(e.target.value))}
                              className="w-full md:w-1/6"
                              placeholder="Points"
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon" 
                              onClick={() => removeSleepTimeRow(index)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
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
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={addWakeUpTimeRow}
                          className="h-8"
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Range
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {batchConfig?.wakeUpTimeScoring.map((range, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Input 
                              type="time"
                              value={range.startTime}
                              onChange={(e) => updateWakeUpTimeScore(index, 'startTime', e.target.value)}
                              className="w-full md:w-1/4"
                            />
                            <span>to</span>
                            <Input 
                              type="time"
                              value={range.endTime}
                              onChange={(e) => updateWakeUpTimeScore(index, 'endTime', e.target.value)}
                              className="w-full md:w-1/4"
                            />
                            <Input 
                              type="number"
                              value={range.points}
                              onChange={(e) => updateWakeUpTimeScore(index, 'points', Number(e.target.value))}
                              className="w-full md:w-1/6"
                              placeholder="Points"
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon" 
                              onClick={() => removeWakeUpTimeRow(index)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
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
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={addDaySleepRow}
                          className="h-8"
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Range
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {batchConfig?.daySleepScoring.map((range, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Label className="w-full md:w-1/4">Max Duration (minutes)</Label>
                            <Input 
                              type="number"
                              value={range.maxDuration}
                              onChange={(e) => updateDaySleepScore(index, 'maxDuration', Number(e.target.value))}
                              className="w-full md:w-1/4"
                            />
                            <Input 
                              type="number"
                              value={range.points}
                              onChange={(e) => updateDaySleepScore(index, 'points', Number(e.target.value))}
                              className="w-full md:w-1/6"
                              placeholder="Points"
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon" 
                              onClick={() => removeDaySleepRow(index)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
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
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={addJapaCompletionRow}
                          className="h-8"
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Range
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {batchConfig?.japaCompletionScoring.map((range, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Input 
                              type="time"
                              value={range.startTime}
                              onChange={(e) => updateJapaCompletionScore(index, 'startTime', e.target.value)}
                              className="w-full md:w-1/4"
                            />
                            <span>to</span>
                            <Input 
                              type="time"
                              value={range.endTime}
                              onChange={(e) => updateJapaCompletionScore(index, 'endTime', e.target.value)}
                              className="w-full md:w-1/4"
                            />
                            <Input 
                              type="number"
                              value={range.points}
                              onChange={(e) => updateJapaCompletionScore(index, 'points', Number(e.target.value))}
                              className="w-full md:w-1/6"
                              placeholder="Points"
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon" 
                              onClick={() => removeJapaCompletionRow(index)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
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
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default BatchScoreConfig;

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Loader2, Music, BookOpen, Clock, Sun, Award, Search, X, Info } from "lucide-react";
import { toast } from "@/lib/toast";
import { getWeeklySadhana, WeeklyStats, SadhanaEntry } from "@/lib/sadhanaService";
import { searchDevotees, DevoteeSadhanaProgress } from "@/lib/adminService";
import { getBatchCriteriaDescription, DEFAULT_BATCHES } from "@/lib/scoringService";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const ProgressPage = () => {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - date.getDay()); // Set to Sunday
    date.setHours(0, 0, 0, 0);
    return date;
  });
  const [weekStats, setWeekStats] = useState<WeeklyStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<DevoteeSadhanaProgress[]>([]);
  const [selectedDevotee, setSelectedDevotee] = useState<DevoteeSadhanaProgress | null>(null);
  const [showingDevoteeProgress, setShowingDevoteeProgress] = useState(false);
  const [batchCriteria, setBatchCriteria] = useState<Record<string, string[]> | null>(null);
  
  const formatDateRange = () => {
    const endDate = new Date(weekStart);
    endDate.setDate(endDate.getDate() + 6);
    
    return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };
  
  const goToPreviousWeek = () => {
    setWeekStart(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };
  
  const goToNextWeek = () => {
    const nextWeekStart = new Date(weekStart);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);
    
    if (nextWeekStart <= new Date()) {
      setWeekStart(nextWeekStart);
    } else {
      toast.info("Can't view future weeks");
    }
  };
  
  useEffect(() => {
    const fetchWeeklyData = async () => {
      if (!currentUser) return;
      
      if (showingDevoteeProgress && selectedDevotee) {
        try {
          setLoading(true);
          // Use batch name for score calculation if available
          const stats = await getWeeklySadhana(
            selectedDevotee.id, 
            weekStart, 
            selectedDevotee?.batchName?.toLowerCase() || "sahadev"
          );
          setWeekStats(stats);
          
          // Set batch criteria for the selected devotee
          if (selectedDevotee?.batchName) {
            const criteria = getBatchCriteriaDescription(selectedDevotee.batchName.toLowerCase());
            setBatchCriteria(criteria);
          } else {
            setBatchCriteria(null);
          }
        } catch (error) {
          console.error("Error fetching weekly stats for devotee:", error);
          toast.error("Failed to load devotee's statistics");
        } finally {
          setLoading(false);
        }
      } else {
        try {
          setLoading(true);
          // Use user's batch name for score calculation if available
          const stats = await getWeeklySadhana(
            currentUser.uid, 
            weekStart, 
            userProfile?.batchName?.toLowerCase() || "sahadev"
          );
          setWeekStats(stats);
          
          // Set batch criteria for the current user
          if (userProfile?.batchName) {
            const criteria = getBatchCriteriaDescription(userProfile.batchName.toLowerCase());
            setBatchCriteria(criteria);
          } else {
            setBatchCriteria(null);
          }
        } catch (error) {
          console.error("Error fetching weekly stats:", error);
          toast.error("Failed to load weekly statistics");
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchWeeklyData();
  }, [currentUser, weekStart, showingDevoteeProgress, selectedDevotee, userProfile]);
  
  const handleSearch = async () => {
    if (!currentUser || !userProfile?.isAdmin) return;
    if (!searchQuery.trim()) {
      toast.error("Please enter a search term");
      return;
    }
    
    try {
      setIsSearching(true);
      const results = await searchDevotees(currentUser.uid, searchQuery);
      setSearchResults(results);
      if (results.length === 0) {
        toast.info("No devotees found with that search term");
      }
    } catch (error) {
      console.error("Error searching devotees:", error);
      toast.error("Failed to search devotees");
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    if (showingDevoteeProgress) {
      setShowingDevoteeProgress(false);
      setSelectedDevotee(null);
    }
  };
  
  const viewDevoteeProgress = (devotee: DevoteeSadhanaProgress) => {
    setSelectedDevotee(devotee);
    setShowingDevoteeProgress(true);
    // Reset to current week
    const date = new Date();
    date.setDate(date.getDate() - date.getDay()); // Set to Sunday
    date.setHours(0, 0, 0, 0);
    setWeekStart(date);
  };
  
  const getInitials = (name: string) => {
    if (!name) return "DM";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  const prepareChantingData = () => {
    if (!weekStats?.entries.length) return [];
    
    return weekStats.entries.map(entry => ({
      day: new Date(entry.date instanceof Date ? entry.date : entry.date.toDate()).toLocaleDateString('en-US', { weekday: 'short' }),
      rounds: entry.chantingRounds,
    }));
  };
  
  const prepareReadingData = () => {
    if (!weekStats?.entries.length) return [];
    
    return weekStats.entries.map(entry => ({
      day: new Date(entry.date instanceof Date ? entry.date : entry.date.toDate()).toLocaleDateString('en-US', { weekday: 'short' }),
      minutes: entry.readingMinutes,
    }));
  };
  
  const prepareScoreData = () => {
    if (!weekStats?.dailyScores?.length) return [];
    return weekStats.dailyScores;
  };
  
  const prepareWakeUpTimeData = () => {
    if (!weekStats?.entries.length) return [];
    
    return weekStats.entries.map(entry => {
      const [hour, minute] = entry.wakeUpTime.split(':').map(Number);
      const timeDecimal = hour + (minute / 60);
      
      return {
        day: new Date(entry.date instanceof Date ? entry.date : entry.date.toDate()).toLocaleDateString('en-US', { weekday: 'short' }),
        time: timeDecimal,
        display: entry.wakeUpTime,
      };
    });
  };
  
  const prepareProgramAttendanceData = () => {
    if (!weekStats?.entries.length) return [];
    
    const mangalaCount = weekStats.entries.filter(e => e.mangalaArati).length;
    const morningCount = weekStats.entries.filter(e => e.morningProgram).length;
    const eveningCount = weekStats.entries.filter(e => e.eveningArati).length;
    const classCount = weekStats.entries.filter(e => e.spiritualClass).length;
    
    return [
      { name: 'Mangala Arati', value: mangalaCount, total: weekStats.entries.length },
      { name: 'Morning Program', value: morningCount, total: weekStats.entries.length },
      { name: 'Evening Arati', value: eveningCount, total: weekStats.entries.length },
      { name: 'Spiritual Class', value: classCount, total: weekStats.entries.length },
    ];
  };
  
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];
  
  const WakeUpTimeTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
          <p>{`${payload[0].payload.day}: ${payload[0].payload.display}`}</p>
        </div>
      );
    }
    
    return null;
  };
  
  const ProgramTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = Math.round((data.value / data.total) * 100);
      
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
          <p className="font-medium">{data.name}</p>
          <p>{`${data.value} of ${data.total} days (${percentage}%)`}</p>
        </div>
      );
    }
    
    return null;
  };
  
  const ScoreTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
          <p className="font-medium">Day: {payload[0].payload.day}</p>
          <p>Score: {payload[0].payload.score}</p>
        </div>
      );
    }
    
    return null;
  };
  
  const getBatchName = () => {
    if (showingDevoteeProgress && selectedDevotee) {
      return selectedDevotee?.batchName || "Default";
    }
    return userProfile?.batchName || "Default";
  };
  
  const getReadingMinimumForBatch = (batchName: string) => {
    const lowerBatchName = batchName.toLowerCase();
    const batch = DEFAULT_BATCHES[lowerBatchName];
    if (!batch) return 0;
    return batch.readingMinimum;
  };
  
  if (loading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-spiritual-purple mb-4" />
        <p className="text-muted-foreground">Loading your spiritual progress...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-spiritual-purple">
          {showingDevoteeProgress && selectedDevotee 
            ? `${selectedDevotee.displayName}'s Spiritual Progress` 
            : "Spiritual Progress"}
        </h1>
        <p className="text-muted-foreground">
          {showingDevoteeProgress && selectedDevotee
            ? `Viewing sadhana statistics for ${selectedDevotee.spiritualName || selectedDevotee.displayName} (${selectedDevotee?.batchName || "No Batch"})`
            : `Track your spiritual growth and sadhana consistency (${userProfile?.batchName || "No Batch"})`}
        </p>
      </div>
      
      {userProfile?.isAdmin && (
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search devotees by name or phone number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-8 pr-10 w-full spiritual-input"
              />
              {searchQuery && (
                <button 
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={isSearching || !searchQuery.trim()}
              className="bg-spiritual-purple hover:bg-spiritual-purple/90"
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </Button>
          </div>
          
          {searchResults.length > 0 && !showingDevoteeProgress && (
            <Card className="mt-4 spiritual-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Search Results</CardTitle>
                <CardDescription>
                  Found {searchResults.length} devotees matching your search
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Devotee</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Batch</TableHead>
                        <TableHead>Chanting</TableHead>
                        <TableHead>Reading</TableHead>
                        <TableHead>Programs</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchResults.map(devotee => (
                        <TableRow key={devotee.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={devotee.photoURL || ""} />
                                <AvatarFallback className="bg-spiritual-purple/20 text-spiritual-purple">
                                  {getInitials(devotee.displayName || "")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{devotee.displayName}</div>
                                {devotee.spiritualName && (
                                  <div className="text-xs text-muted-foreground">
                                    {devotee.spiritualName}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{devotee.phoneNumber || "-"}</TableCell>
                          <TableCell>
                            <span className="text-spiritual-purple font-medium">
                              {devotee.batchName || "No Batch"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {devotee.weeklyStats ? (
                              <div className="font-medium">
                                {devotee.weeklyStats.averageChantingRounds} rounds/day
                              </div>
                            ) : (
                              <span className="text-muted-foreground">No data</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {devotee.weeklyStats ? (
                              <div className="font-medium">
                                {devotee.weeklyStats.averageReadingMinutes} min/day
                              </div>
                            ) : (
                              <span className="text-muted-foreground">No data</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {devotee.weeklyStats ? (
                              <div>
                                <Progress 
                                  value={devotee.weeklyStats.mangalaAratiAttendance} 
                                  className="h-2 w-24" 
                                />
                                <div className="text-xs mt-1">
                                  Mangala Arati: {devotee.weeklyStats.mangalaAratiAttendance}%
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">No data</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline" 
                              size="sm"
                              onClick={() => viewDevoteeProgress(devotee)}
                              className="border-spiritual-purple/20 hover:bg-spiritual-purple/10 text-spiritual-purple"
                            >
                              View Progress
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
          
          {showingDevoteeProgress && selectedDevotee && (
            <div className="mt-4 mb-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedDevotee.photoURL || ""} />
                  <AvatarFallback className="bg-spiritual-purple/20 text-spiritual-purple">
                    {getInitials(selectedDevotee.displayName || "")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{selectedDevotee.displayName}</div>
                  {selectedDevotee.spiritualName && (
                    <div className="text-xs text-muted-foreground">
                      {selectedDevotee.spiritualName}
                    </div>
                  )}
                </div>
              </div>
              
              <Button 
                variant="outline"
                onClick={clearSearch}
                className="border-spiritual-purple/20 hover:bg-spiritual-purple/10"
              >
                <X className="h-4 w-4 mr-1" />
                Return to My Progress
              </Button>
            </div>
          )}
        </div>
      )}
      
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="outline" 
          onClick={goToPreviousWeek}
          className="border-spiritual-purple/20 hover:bg-spiritual-purple/10"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous Week
        </Button>
        
        <h2 className="text-xl font-medium">{formatDateRange()}</h2>
        
        <Button 
          variant="outline" 
          onClick={goToNextWeek}
          className="border-spiritual-purple/20 hover:bg-spiritual-purple/10"
        >
          Next Week
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="spiritual-card">
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-spiritual-purple/10 flex items-center justify-center mr-2">
                <Music className="h-4 w-4 text-spiritual-purple" />
              </div>
              <CardTitle className="text-lg">Chanting</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <span className="text-3xl font-bold">
                {weekStats?.totalChantingRounds || 0}
              </span>
              <span className="text-sm text-muted-foreground">Total Rounds</span>
              <span className="text-md mt-2">
                <span className="font-medium">{weekStats?.averageChantingRounds || 0}</span> rounds/day avg.
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="spiritual-card">
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-spiritual-purple/10 flex items-center justify-center mr-2">
                <BookOpen className="h-4 w-4 text-spiritual-purple" />
              </div>
              <CardTitle className="text-lg">Reading</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <span className="text-3xl font-bold">
                {weekStats?.totalReadingMinutes || 0}
              </span>
              <span className="text-sm text-muted-foreground">Total Minutes</span>
              <span className="text-md mt-2">
                <span className="font-medium">{weekStats?.averageReadingMinutes || 0}</span> min/day avg.
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="ml-1 text-muted-foreground">
                      <Info className="h-3.5 w-3.5 inline" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-medium">Reading Minimum</h4>
                      <p className="text-sm text-muted-foreground">
                        {getBatchName()} batch: {getReadingMinimumForBatch(getBatchName())} minutes per day
                        ({getReadingMinimumForBatch(getBatchName()) / 60} hours)
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="spiritual-card">
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-spiritual-purple/10 flex items-center justify-center mr-2">
                <Sun className="h-4 w-4 text-spiritual-purple" />
              </div>
              <CardTitle className="text-lg">Programs</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <span className="text-3xl font-bold">
                {Math.round(weekStats?.morningProgramAttendance || 0)}%
              </span>
              <span className="text-sm text-muted-foreground">Morning Program</span>
              <span className="text-md mt-2">
                <span className="font-medium">{Math.round(weekStats?.mangalaAratiAttendance || 0)}%</span> Mangala Arati
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="spiritual-card">
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-spiritual-purple/10 flex items-center justify-center mr-2">
                <Award className="h-4 w-4 text-spiritual-purple" />
              </div>
              <CardTitle className="text-lg">Sadhana Score</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <span className="text-3xl font-bold">
                {weekStats?.averageScore || 0}
              </span>
              <span className="text-sm text-muted-foreground">Average Score/Day</span>
              <span className="text-md mt-2">
                <span className="font-medium">{weekStats?.totalScore || 0}</span> total points
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="spiritual-card">
          <CardHeader>
            <CardTitle className="text-lg">Chanting Rounds by Day</CardTitle>
            <CardDescription>
              Your daily japa meditation consistency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {weekStats?.entries.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prepareChantingData()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="rounds" fill="#7E69AB" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No data for this week</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="spiritual-card">
          <CardHeader>
            <CardTitle className="text-lg">Reading Minutes by Day</CardTitle>
            <CardDescription>
              Your daily spiritual study time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {weekStats?.entries.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prepareReadingData()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="minutes" fill="#D4AF37" />
                    {getBatchName() && (
                      <ReferenceLine 
                        y={getReadingMinimumForBatch(getBatchName())} 
                        stroke="#E57373" 
                        strokeDasharray="3 3"
                        label={{ 
                          value: 'Minimum', 
                          position: 'insideTopRight',
                          fill: '#E57373',
                          fontSize: 12 
                        }} 
                      />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No data for this week</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="spiritual-card">
          <CardHeader>
            <CardTitle className="text-lg">Daily Sadhana Scores</CardTitle>
            <CardDescription>
              Your sadhana performance based on batch criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {weekStats?.dailyScores?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={prepareScoreData()} 
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="day" />
                    <YAxis domain={[0, 'dataMax + 20']} />
                    <Tooltip content={<ScoreTooltip />} />
                    <Bar dataKey="score" fill="#4CAF50" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No score data for this week</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="spiritual-card">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">Batch Criteria</CardTitle>
                <CardDescription>
                  Scoring requirements for {getBatchName()} batch
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72 overflow-y-auto pr-2">
              {batchCriteria ? (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="sleepTime">
                    <AccordionTrigger className="text-spiritual-purple font-medium">
                      Sleep Time Scoring
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-1 text-sm">
                        {batchCriteria.sleepTime.map((criterion, index) => (
                          <li key={index} className="flex items-center">
                            <span>{criterion}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="wakeUpTime">
                    <AccordionTrigger className="text-spiritual-purple font-medium">
                      Wake-up Time Scoring
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-1 text-sm">
                        {batchCriteria.wakeUpTime.map((criterion, index) => (
                          <li key={index} className="flex items-center">
                            <span>{criterion}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="reading">
                    <AccordionTrigger className="text-spiritual-purple font-medium">
                      Reading Scoring
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-1 text-sm">
                        {batchCriteria.reading.map((criterion, index) => (
                          <li key={index} className="flex items-center">
                            <span>{criterion}</span>
                          </li>
                        ))}
                        <li className="mt-2">1 point per minute of reading</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="daySleep">
                    <AccordionTrigger className="text-spiritual-purple font-medium">
                      Day Sleep Scoring
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-1 text-sm">
                        {batchCriteria.daySleep.map((criterion, index) => (
                          <li key={index} className="flex items-center">
                            <span>{criterion}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="japaCompletion">
                    <AccordionTrigger className="text-spiritual-purple font-medium">
                      Japa Completion Time Scoring
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-1 text-sm">
                        {batchCriteria.japaCompletion.map((criterion, index) => (
                          <li key={index} className="flex items-center">
                            <span>{criterion}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="programs">
                    <AccordionTrigger className="text-spiritual-purple font-medium">
                      Program Attendance Scoring
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-1 text-sm">
                        <li>Mangala Arati: 10 points</li>
                        <li>Tulsi Arati: 5 points</li>
                        <li>Narsimha Arati: 5 points</li>
                        <li>Guru Puja: 5 points</li>
                        <li>Bhagavatam Class: 20 points</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No batch criteria available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {weekStats?.entries.length ? (
        <Card className="spiritual-card border-spiritual-gold">
          <CardContent className="flex items-center p-6">
            <div className="h-12 w-12 rounded-full bg-spiritual-gold/20 flex items-center justify-center mr-4">
              <Award className="h-6 w-6 text-spiritual-gold" />
            </div>
            <div>
              <h3 className="text-xl font-medium mb-1">Weekly Achievement</h3>
              <p className="text-muted-foreground">
                {weekStats.totalScore >= 700 
                  ? "Excellent! You've earned a high score this week with consistent sadhana."
                  : weekStats.totalScore >= 500
                  ? "Good progress! You're maintaining steady spiritual practices."
                  : "Keep going! Each step on the spiritual path is valuable."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default ProgressPage;

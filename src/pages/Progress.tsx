import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  calculateWeeklySadhanaScore, 
  getBatchMinimumRequirements,
  getBatchCriteriaFromUserProfile,
  calculateSadhanaScore
} from "@/lib/scoringService";
import { getDailySadhana, getWeeklySadhana } from "@/lib/sadhanaService";
import { Loader2, BarChartBig, Calendar as CalendarIcon, Clock, Book, Headphones, Scroll } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { 
  Bar, 
  BarChart, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import GroupDevoteeSearch from "@/components/GroupDevoteeSearch";
import { UserProfile } from "@/contexts/AuthContext";

const chartConfig = {
  body: {
    label: "Body (Physical Discipline)",
    color: "#fb923c"
  },
  soul: {
    label: "Soul (Spiritual Practice)", 
    color: "#fde047"
  }
};

const PointsProgress = () => {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dailySadhana, setDailySadhana] = useState(null);
  const [dailyScore, setDailyScore] = useState(null);
  const [weeklyTotalScore, setWeeklyTotalScore] = useState(0);
  const [weeklyAvgScore, setWeeklyAvgScore] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [weeklyBreakdowns, setWeeklyBreakdowns] = useState([]);
  const [breakdowns, setBreakdowns] = useState({
    sleepTimeScore: 0,
    wakeUpTimeScore: 0,
    readingScore: 0,
    daySleepScore: 0,
    japaCompletionScore: 0,
    programScore: 0,
    hearingScore: 0,
    shlokaScore: 0,
  });
  const [selectedDevoteeForView, setSelectedDevoteeForView] = useState<UserProfile | null>(null);
  
  // Get user's batch
  const userBatch = userProfile?.batch || "sahadev";
  const batchCriteria = getBatchCriteriaFromUserProfile(userProfile);
  
  // Get minimum requirements for the user's batch
  const { readingMinutes, hearingMinutes, serviceMinutes, shlokaCount } = 
    getBatchMinimumRequirements(userProfile);
  
  // Determine which user's data to show (current user or selected devotee for admin)
  const targetUser = selectedDevoteeForView || userProfile;
  const targetUserId = selectedDevoteeForView?.uid || currentUser?.uid;
  
  // Calculate body and soul scores
  const bodyScore = breakdowns.sleepTimeScore + 
                   breakdowns.wakeUpTimeScore + 
                   breakdowns.daySleepScore;
                   
  const soulScore = breakdowns.readingScore + 
                   breakdowns.japaCompletionScore + 
                   breakdowns.programScore + 
                   breakdowns.hearingScore +
                   breakdowns.shlokaScore;

  // Calculate percentage using batch configuration
  const totalPossibleScore = (batchCriteria.totalBodyScore || 0) + (batchCriteria.totalSoulScore || 0);
  const currentTotalScore = bodyScore + soulScore;
  const percentage = totalPossibleScore > 0 ? Math.round((currentTotalScore / totalPossibleScore) * 100) : 0;

  // Function to get the start of the week (Sunday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  // Function to format week range
  const formatWeekRange = (startDate: Date) => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    
    const startStr = startDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    const endStr = endDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    
    return `${startStr} to ${endStr}`;
  };

  // Fetch daily sadhana for selected date
  const fetchDailySadhana = async (date: Date) => {
    if (!targetUserId) return;
    
    try {
      const dailyData = await getDailySadhana(targetUserId, date);
      setDailySadhana(dailyData);
      
      if (dailyData && targetUser) {
        const scoreResult = calculateSadhanaScore(dailyData, targetUser);
        setDailyScore(scoreResult);
      } else {
        setDailyScore(null);
      }
    } catch (error) {
      console.error("Error fetching daily sadhana:", error);
      setDailySadhana(null);
      setDailyScore(null);
    }
  };
  
  useEffect(() => {
    const fetchPoints = async () => {
      if (!targetUserId) return;
      
      try {
        setLoading(true);
        
        // Get data for the last 5 weeks
        const weeksData = [];
        const weeklyBreakdownData = [];
        const today = new Date();
        
        for (let i = 4; i >= 0; i--) {
          const weekStart = new Date(today);
          weekStart.setDate(weekStart.getDate() - (i * 7));
          const actualWeekStart = getWeekStart(weekStart);
          
          const weeklyData = await getWeeklySadhana(targetUserId, actualWeekStart, targetUser);
          
          if (weeklyData.entries && weeklyData.entries.length > 0) {
            const weeklyScoreData = calculateWeeklySadhanaScore(weeklyData.entries, targetUser);
            
            // Calculate total body and soul scores for the week
            const weekBodyScore = 
              weeklyScoreData.breakdowns.sleepTimeScore + 
              weeklyScoreData.breakdowns.wakeUpTimeScore + 
              weeklyScoreData.breakdowns.daySleepScore;
              
            const weekSoulScore = 
              weeklyScoreData.breakdowns.readingScore + 
              weeklyScoreData.breakdowns.japaCompletionScore + 
              weeklyScoreData.breakdowns.programScore + 
              weeklyScoreData.breakdowns.hearingScore +
              weeklyScoreData.breakdowns.shlokaScore;
            
            weeksData.push({
              week: formatWeekRange(actualWeekStart),
              body: weekBodyScore,
              soul: weekSoulScore,
              total: weeklyScoreData.totalScore
            });

            // Store weekly breakdown data
            weeklyBreakdownData.push({
              week: formatWeekRange(actualWeekStart),
              totalScore: weeklyScoreData.totalScore,
              breakdowns: weeklyScoreData.breakdowns
            });
            
            // Use current week data for the overview card
            if (i === 0) {
              setWeeklyTotalScore(weeklyScoreData.totalScore);
              setWeeklyAvgScore(weeklyScoreData.averageScore);
              setBreakdowns(weeklyScoreData.breakdowns);
            }
          } else {
            // Add empty week data
            weeksData.push({
              week: formatWeekRange(actualWeekStart),
              body: 0,
              soul: 0,
              total: 0
            });

            weeklyBreakdownData.push({
              week: formatWeekRange(actualWeekStart),
              totalScore: 0,
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
            });
          }
        }
        
        setChartData(weeksData);
        setWeeklyBreakdowns(weeklyBreakdowns);
        
      } catch (error) {
        console.error("Error fetching points data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPoints();
  }, [targetUserId, targetUser]);

  // Fetch daily sadhana when selected date changes
  useEffect(() => {
    const fetchDailySadhana = async (date: Date) => {
      if (!targetUserId) return;
      
      try {
        const dailyData = await getDailySadhana(targetUserId, date);
        setDailySadhana(dailyData);
        
        if (dailyData && targetUser) {
          const scoreResult = calculateSadhanaScore(dailyData, targetUser);
          setDailyScore(scoreResult);
        } else {
          setDailyScore(null);
        }
      } catch (error) {
        console.error("Error fetching daily sadhana:", error);
        setDailySadhana(null);
        setDailyScore(null);
      }
    };
    
    fetchDailySadhana(selectedDate);
  }, [selectedDate, targetUserId, targetUser]);
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-spiritual-purple text-center">
          Sadhana Progress
          {selectedDevoteeForView && (
            <span className="block text-lg font-normal text-muted-foreground mt-2">
              Viewing: {selectedDevoteeForView.displayName}
              {selectedDevoteeForView.spiritualName && ` (${selectedDevoteeForView.spiritualName})`}
            </span>
          )}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground text-center">
          Track spiritual consistency in {batchCriteria.name} batch
          {shlokaCount > 0 && (
            <>
              <br />
              <span className="text-xs">Minimum shlokas required: {shlokaCount}</span>
            </>
          )}
        </p>
      </div>
      
      {/* Admin Group Search */}
      {userProfile?.isAdmin && userProfile?.uid && (
        <GroupDevoteeSearch
          adminId={userProfile.uid}
          onDevoteeSelect={setSelectedDevoteeForView}
          selectedDevotee={selectedDevoteeForView}
        />
      )}
      
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-spiritual-purple" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Date Picker and Daily Progress */}
          <Card className="spiritual-card">
            <CardHeader className="pb-2">
              <CardTitle>Daily Sadhana Progress</CardTitle>
              <CardDescription>Select a date to view your sadhana details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                {/* Date Picker */}
                <div className="flex flex-col items-center">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[240px] justify-start text-left font-normal mb-4",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Daily Progress Details */}
                <div className="flex-1">
                  {dailySadhana ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Sadhana Score</h3>
                        <Badge variant="secondary" className="text-lg px-3 py-1">
                          {dailyScore?.totalScore || 0} points
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Basic Info */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm font-medium">Wake Up:</span>
                            <span className="text-sm">{dailySadhana.wakeUpTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm font-medium">Sleep Time:</span>
                            <span className="text-sm">{dailySadhana.sleepTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Japa Completion:</span>
                            <span className="text-sm">{dailySadhana.chantingCompletionTime}</span>
                          </div>
                        </div>

                        {/* Activities */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Book className="h-4 w-4" />
                            <span className="text-sm font-medium">Reading:</span>
                            <span className="text-sm">{dailySadhana.readingMinutes} mins</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Headphones className="h-4 w-4" />
                            <span className="text-sm font-medium">Hearing:</span>
                            <span className="text-sm">
                              {(dailySadhana.spLectureMinutes || 0) + 
                               (dailySadhana.smLectureMinutes || 0) + 
                               (dailySadhana.gsnsLectureMinutes || 0)} mins
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Scroll className="h-4 w-4" />
                            <span className="text-sm font-medium">Shlokas:</span>
                            <span className="text-sm">{dailySadhana.shlokaCount || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Morning Program Details */}
                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-3 text-spiritual-purple">Morning Program Attendance</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={dailySadhana.mangalaArati ? "default" : "secondary"} className="text-xs">
                              {dailySadhana.mangalaArati ? "✓" : "✗"}
                            </Badge>
                            <span className="text-sm">Mangala Arati</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={dailySadhana.tulsiArati ? "default" : "secondary"} className="text-xs">
                              {dailySadhana.tulsiArati ? "✓" : "✗"}
                            </Badge>
                            <span className="text-sm">Tulsi Arati</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={dailySadhana.narsimhaArati ? "default" : "secondary"} className="text-xs">
                              {dailySadhana.narsimhaArati ? "✓" : "✗"}
                            </Badge>
                            <span className="text-sm">Narsimha Arati</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={dailySadhana.guruPuja ? "default" : "secondary"} className="text-xs">
                              {dailySadhana.guruPuja ? "✓" : "✗"}
                            </Badge>
                            <span className="text-sm">Guru Puja</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={dailySadhana.bhagavatamClass ? "default" : "secondary"} className="text-xs">
                              {dailySadhana.bhagavatamClass ? "✓" : "✗"}
                            </Badge>
                            <span className="text-sm">Bhagavatam Class</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={dailySadhana.morningProgram ? "default" : "secondary"} className="text-xs">
                              {dailySadhana.morningProgram ? "✓" : "✗"}
                            </Badge>
                            <span className="text-sm">Full Program</span>
                          </div>
                        </div>
                      </div>

                      {dailySadhana.notes && (
                        <div className="pt-4 border-t">
                          <h4 className="font-medium mb-2">Notes</h4>
                          <p className="text-sm text-muted-foreground">{dailySadhana.notes}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No sadhana entry found for {format(selectedDate, "PPP")}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Score Overview Card */}
          <Card className="spiritual-card">
            <CardHeader className="pb-2">
              <CardTitle>Current Week Score Overview</CardTitle>
              <CardDescription>Your sadhana completion percentage for this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-4">
                <div className="relative h-40 w-40 flex items-center justify-center">
                  <div className="spiritual-score-ring"></div>
                  <div className="absolute text-3xl font-bold text-spiritual-purple text-center">
                    {percentage}%
                    <div className="text-sm font-normal text-muted-foreground mt-1">Completion</div>
                  </div>
                </div>
                
                <div className="space-y-4 flex-1">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <Label>Body (Physical Discipline)</Label>
                      <span className="font-medium">{bodyScore}/{batchCriteria.totalBodyScore || 0} points</span>
                    </div>
                    <Progress 
                      value={batchCriteria.totalBodyScore ? (bodyScore / batchCriteria.totalBodyScore) * 100 : 0} 
                      className="h-2 bg-slate-200" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <Label>Soul (Spiritual Practice)</Label>
                      <span className="font-medium">{soulScore}/{batchCriteria.totalSoulScore || 0} points</span>
                    </div>
                    <Progress 
                      value={batchCriteria.totalSoulScore ? (soulScore / batchCriteria.totalSoulScore) * 100 : 0} 
                      className="h-2 bg-slate-200" 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Weekly Sadhana Score Chart */}
          <Card className="spiritual-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <BarChartBig className="h-5 w-5" />
                Weekly Sadhana Score
              </CardTitle>
              <CardDescription>Body and soul scores over the last 5 weeks</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="week" 
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      domain={[0, 'dataMax + 50']}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend 
                      verticalAlign="top" 
                      height={36}
                      wrapperStyle={{ paddingBottom: '20px' }}
                    />
                    <Bar 
                      dataKey="body" 
                      fill="var(--color-body)" 
                      name="Body"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar 
                      dataKey="soul" 
                      fill="var(--color-soul)" 
                      name="Soul"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          
          {/* Weekly Points Summary Card */}
          <Card className="spiritual-card">
            <CardHeader className="pb-2">
              <CardTitle>Weekly Points Summary</CardTitle>
              <CardDescription>Breakdown of your sadhana scores by week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {weeklyBreakdowns.map((weekData, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-spiritual-purple">{weekData.week}</h3>
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      {weekData.totalScore} points
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Body Scores */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground">Body (Physical Discipline)</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Sleep Time:</span>
                          <span>{weekData.breakdowns.sleepTimeScore} pts</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Wake Up Time:</span>
                          <span>{weekData.breakdowns.wakeUpTimeScore} pts</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Day Sleep:</span>
                          <span>{weekData.breakdowns.daySleepScore} pts</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span>Body Total:</span>
                          <span>{weekData.breakdowns.sleepTimeScore + weekData.breakdowns.wakeUpTimeScore + weekData.breakdowns.daySleepScore} pts</span>
                        </div>
                      </div>
                    </div>

                    {/* Soul Scores */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground">Soul (Spiritual Practice)</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Reading:</span>
                          <span>{weekData.breakdowns.readingScore} pts</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Japa Completion:</span>
                          <span>{weekData.breakdowns.japaCompletionScore} pts</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Morning Program:</span>
                          <span>{weekData.breakdowns.programScore} pts</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Hearing:</span>
                          <span>{weekData.breakdowns.hearingScore} pts</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shlokas:</span>
                          <span>{weekData.breakdowns.shlokaScore} pts</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span>Soul Total:</span>
                          <span>{weekData.breakdowns.readingScore + weekData.breakdowns.japaCompletionScore + weekData.breakdowns.programScore + weekData.breakdowns.hearingScore + weekData.breakdowns.shlokaScore} pts</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Minimum Requirements Section */}
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2 text-spiritual-purple">{batchCriteria.name} Batch Minimum Requirements:</h3>
                <ul className="space-y-1 text-sm">
                  <li className="flex justify-between">
                    <span>Reading:</span>
                    <span className="font-medium">{readingMinutes} minutes ({readingMinutes/60} hours)</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Hearing:</span>
                    <span className="font-medium">{hearingMinutes} minutes ({hearingMinutes/60} hours)</span>
                  </li>
                  {shlokaCount > 0 && (
                    <li className="flex justify-between">
                      <span>Shlokas:</span>
                      <span className="font-medium">{shlokaCount} shlokas (30 pts when met)</span>
                    </li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PointsProgress;

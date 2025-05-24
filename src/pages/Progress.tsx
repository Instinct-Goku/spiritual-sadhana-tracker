
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  calculateWeeklySadhanaScore, 
  getBatchMinimumRequirements,
  getBatchCriteriaFromUserProfile
} from "@/lib/scoringService";
import { getDailySadhana, getWeeklySadhana } from "@/lib/sadhanaService";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, BarChartBig } from "lucide-react";
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
  const [weeklyTotalScore, setWeeklyTotalScore] = useState(0);
  const [weeklyAvgScore, setWeeklyAvgScore] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [breakdowns, setBreakdowns] = useState({
    sleepTimeScore: 0,
    wakeUpTimeScore: 0,
    readingScore: 0,
    daySleepScore: 0,
    japaCompletionScore: 0,
    programScore: 0,
    hearingScore: 0,
    serviceScore: 0,
  });
  
  // Get user's batch
  const userBatch = userProfile?.batch || "sahadev";
  const batchCriteria = getBatchCriteriaFromUserProfile(userProfile);
  
  // Get minimum requirements for the user's batch
  const { readingMinutes, hearingMinutes, serviceMinutes, shlokaCount } = 
    getBatchMinimumRequirements(userProfile);
  
  // Calculate body and soul scores
  const bodyScore = breakdowns.sleepTimeScore + 
                   breakdowns.wakeUpTimeScore + 
                   breakdowns.daySleepScore + 
                   breakdowns.serviceScore;
                   
  const soulScore = breakdowns.readingScore + 
                   breakdowns.japaCompletionScore + 
                   breakdowns.programScore + 
                   breakdowns.hearingScore;

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
  
  useEffect(() => {
    const fetchPoints = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Get data for the last 5 weeks
        const weeksData = [];
        const today = new Date();
        
        for (let i = 4; i >= 0; i--) {
          const weekStart = new Date(today);
          weekStart.setDate(weekStart.getDate() - (i * 7));
          const actualWeekStart = getWeekStart(weekStart);
          
          const weeklyData = await getWeeklySadhana(currentUser.uid, actualWeekStart, userProfile);
          
          if (weeklyData.entries && weeklyData.entries.length > 0) {
            const weeklyScoreData = calculateWeeklySadhanaScore(weeklyData.entries, userProfile);
            
            // Calculate total body and soul scores for the week
            const weekBodyScore = 
              weeklyScoreData.breakdowns.sleepTimeScore + 
              weeklyScoreData.breakdowns.wakeUpTimeScore + 
              weeklyScoreData.breakdowns.daySleepScore + 
              weeklyScoreData.breakdowns.serviceScore;
              
            const weekSoulScore = 
              weeklyScoreData.breakdowns.readingScore + 
              weeklyScoreData.breakdowns.japaCompletionScore + 
              weeklyScoreData.breakdowns.programScore + 
              weeklyScoreData.breakdowns.hearingScore;
            
            weeksData.push({
              week: formatWeekRange(actualWeekStart),
              body: weekBodyScore,
              soul: weekSoulScore,
              total: weeklyScoreData.totalScore
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
          }
        }
        
        setChartData(weeksData);
        
      } catch (error) {
        console.error("Error fetching points data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPoints();
  }, [currentUser, userProfile]);
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-spiritual-purple text-center">
          Sadhana Progress
        </h1>
        <p className="text-sm md:text-base text-muted-foreground text-center">
          Track your spiritual consistency in {batchCriteria.name} batch
        </p>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-spiritual-purple" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Weekly Score Overview Card */}
          <Card className="spiritual-card">
            <CardHeader className="pb-2">
              <CardTitle>Current Week Score Overview</CardTitle>
              <CardDescription>Your total sadhana score for this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-4">
                <div className="relative h-40 w-40 flex items-center justify-center">
                  <div className="spiritual-score-ring"></div>
                  <div className="absolute text-3xl font-bold text-spiritual-purple text-center">
                    {weeklyTotalScore}
                    <div className="text-sm font-normal text-muted-foreground mt-1">Total Points</div>
                  </div>
                </div>
                
                <div className="space-y-4 flex-1">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <Label>Body (Physical Discipline)</Label>
                      <span className="font-medium">{bodyScore} points</span>
                    </div>
                    <Progress value={(bodyScore / (bodyScore + soulScore)) * 100} className="h-2 bg-slate-200" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <Label>Soul (Spiritual Practice)</Label>
                      <span className="font-medium">{soulScore} points</span>
                    </div>
                    <Progress value={(soulScore / (bodyScore + soulScore)) * 100} className="h-2 bg-slate-200" />
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
          
          {/* Points Summary Card */}
          <Card className="spiritual-card">
            <CardHeader className="pb-2">
              <CardTitle>Detailed Points Summary</CardTitle>
              <CardDescription>Breakdown of your sadhana scores by category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-semibold text-lg text-spiritual-purple">Body (Physical Discipline)</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <Label>Sleep Time</Label>
                  <span className="font-medium">{breakdowns.sleepTimeScore} points</span>
                </div>
                <Progress value={(breakdowns.sleepTimeScore / 25) * 100} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <Label>Wake Up Time</Label>
                  <span className="font-medium">{breakdowns.wakeUpTimeScore} points</span>
                </div>
                <Progress value={(breakdowns.wakeUpTimeScore / 25) * 100} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <Label>Day Sleep</Label>
                  <span className="font-medium">{breakdowns.daySleepScore} points</span>
                </div>
                <Progress value={(breakdowns.daySleepScore / 25) * 100} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <Label>Service</Label>
                  <span className="font-medium">{breakdowns.serviceScore} points</span>
                </div>
                <Progress value={(breakdowns.serviceScore / 150) * 100} className="h-2" />
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold text-lg text-spiritual-purple mb-3">Soul (Spiritual Practice)</h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <Label>Reading</Label>
                  <span className="font-medium">{breakdowns.readingScore} points</span>
                </div>
                <Progress value={(breakdowns.readingScore / 300) * 100} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <Label>Japa Completion</Label>
                  <span className="font-medium">{breakdowns.japaCompletionScore} points</span>
                </div>
                <Progress value={(breakdowns.japaCompletionScore / 25) * 100} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <Label>Morning Program</Label>
                  <span className="font-medium">{breakdowns.programScore} points</span>
                </div>
                <Progress value={(breakdowns.programScore / 45) * 100} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <Label>Hearing</Label>
                  <span className="font-medium">{breakdowns.hearingScore} points</span>
                </div>
                <Progress value={(breakdowns.hearingScore / 180) * 100} className="h-2" />
              </div>

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
                  <li className="flex justify-between">
                    <span>Service:</span>
                    <span className="font-medium">{serviceMinutes} minutes ({serviceMinutes/60} hours)</span>
                  </li>
                  {shlokaCount > 0 && (
                    <li className="flex justify-between">
                      <span>Shlokas:</span>
                      <span className="font-medium">{shlokaCount} shlokas</span>
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

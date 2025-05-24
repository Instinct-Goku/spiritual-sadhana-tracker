
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
  ResponsiveContainer 
} from "recharts";

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
  
  useEffect(() => {
    const fetchPoints = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Get weekly data - add current date as the second parameter
        const today = new Date();
        const weeklyData = await getWeeklySadhana(currentUser.uid, today, userProfile);
        
        if (weeklyData.entries && weeklyData.entries.length > 0) {
          const weeklyScoreData = calculateWeeklySadhanaScore(weeklyData.entries, userProfile);
          setWeeklyTotalScore(weeklyScoreData.totalScore);
          setWeeklyAvgScore(weeklyScoreData.averageScore);
          setBreakdowns(weeklyScoreData.breakdowns);
          
          // Prepare chart data from daily scores
          const dailyData = weeklyData.entries.map((entry, index) => {
            const day = entry.date instanceof Date 
              ? entry.date.toLocaleDateString('en-US', { weekday: 'short' })
              : `Day ${index + 1}`;
            
            // Calculate body and soul scores for each day entry
            const entryBodyScore = 
              (entry.scoreBreakdown?.sleepTimeScore || 0) + 
              (entry.scoreBreakdown?.wakeUpTimeScore || 0) + 
              (entry.scoreBreakdown?.daySleepScore || 0) + 
              (entry.scoreBreakdown?.serviceScore || 0);
              
            const entrySoulScore = 
              (entry.scoreBreakdown?.readingScore || 0) + 
              (entry.scoreBreakdown?.japaCompletionScore || 0) + 
              (entry.scoreBreakdown?.programScore || 0) + 
              (entry.scoreBreakdown?.hearingScore || 0);
            
            return {
              day,
              Body: entryBodyScore,
              Soul: entrySoulScore,
              Total: (entry.score || 0)
            };
          });
          
          // Add weekly total as the last bar
          dailyData.push({
            day: 'Weekly',
            Body: bodyScore,
            Soul: soulScore,
            Total: weeklyScoreData.totalScore
          });
          
          setChartData(dailyData);
        }
        
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
              <CardTitle>Weekly Score</CardTitle>
              <CardDescription>Your total sadhana score for the week</CardDescription>
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
          
          {/* Weekly Chart Card */}
          <Card className="spiritual-card">
            <CardHeader className="pb-2">
              <CardTitle>Daily Progress</CardTitle>
              <CardDescription>Body and Soul scores breakdown by day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                  >
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend verticalAlign="top" height={36} />
                    <Bar dataKey="Body" fill="#94a3b8" name="Body" />
                    <Bar dataKey="Soul" fill="#c084fc" name="Soul" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Points Summary Card */}
          <Card className="spiritual-card">
            <CardHeader className="pb-2">
              <CardTitle>Points Summary</CardTitle>
              <CardDescription>Breakdown of your sadhana scores</CardDescription>
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

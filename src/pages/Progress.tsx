
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
import { Loader2 } from "lucide-react";

const PointsProgress = () => {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [weeklyScore, setWeeklyScore] = useState(0);
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
          setWeeklyScore(weeklyScoreData.averageScore);
          setBreakdowns(weeklyScoreData.breakdowns);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weekly Score Overview Card */}
          <Card className="spiritual-card">
            <CardHeader className="pb-2">
              <CardTitle>Weekly Average Score</CardTitle>
              <CardDescription>Your average sadhana score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative h-40 w-40 flex items-center justify-center">
                  <div className="spiritual-score-ring"></div>
                  <div className="absolute text-4xl font-bold text-spiritual-purple">
                    {weeklyScore}
                  </div>
                </div>
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
                  <Label>Reading</Label>
                  <span className="font-medium">{breakdowns.readingScore} points</span>
                </div>
                <Progress value={(breakdowns.readingScore / 300) * 100} className="h-2" />
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
                  <Label>Japa Completion</Label>
                  <span className="font-medium">{breakdowns.japaCompletionScore} points</span>
                </div>
                <Progress value={(breakdowns.japaCompletionScore / 25) * 100} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <Label>Program Attendance</Label>
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
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <Label>Service</Label>
                  <span className="font-medium">{breakdowns.serviceScore} points</span>
                </div>
                <Progress value={(breakdowns.serviceScore / 150) * 100} className="h-2" />
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

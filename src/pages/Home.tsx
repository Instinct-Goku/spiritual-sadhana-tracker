
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getDailySadhana, getWeeklySadhana } from "@/lib/sadhanaService";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  ChevronRight, 
  PenSquare, 
  BarChart3, 
  BookOpen, 
  Music, 
  CheckCircle2, 
  XCircle,
  Clock,
  CalendarDays,
  User,
  Headphones
} from "lucide-react";

const HomePage = () => {
  const { currentUser, userProfile } = useAuth();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [todaySadhana, setTodaySadhana] = useState<any>(null);
  const [weeklyStats, setWeeklyStats] = useState<any>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Get today's sadhana data
        const today = new Date();
        const todayData = await getDailySadhana(currentUser.uid, today);
        setTodaySadhana(todayData);
        
        // Get weekly stats
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Set to Sunday
        weekStart.setHours(0, 0, 0, 0);
        const weeklyData = await getWeeklySadhana(currentUser.uid, weekStart);
        setWeeklyStats(weeklyData);
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser]);
  
  const renderSadhanaStatus = () => {
    if (loading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      );
    }
    
    if (todaySadhana) {
      return (
        <div className="space-y-2">
          <div className="flex items-center">
            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
            <span>You've recorded today's sadhana</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <div className="bg-spiritual-purple/10 rounded-full px-3 py-1 text-xs flex items-center">
              <Music className="h-3 w-3 mr-1" />
              {todaySadhana.chantingRounds} rounds
            </div>
            <div className="bg-spiritual-purple/10 rounded-full px-3 py-1 text-xs flex items-center">
              <BookOpen className="h-3 w-3 mr-1" />
              {todaySadhana.readingMinutes} min
            </div>
            <div className="bg-spiritual-purple/10 rounded-full px-3 py-1 text-xs flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Wake: {todaySadhana.wakeUpTime}
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        <div className="flex items-center">
          <XCircle className="h-5 w-5 text-red-500 mr-2" />
          <span>You haven't recorded today's sadhana yet</span>
        </div>
        <Link to="/sadhana">
          <Button variant="outline" size="sm" className="mt-2">
            Record Now
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>
    );
  };
  
  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* Greeting Banner */}
      <Card className="mb-6 md:mb-8 bg-spiritual-purple text-white shadow-lg">
        <CardContent className="p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Hare Krishna, {userProfile?.displayName?.split(' ')[0] || "Devotee"}!
          </h1>
          <p className="text-sm md:text-base">Welcome to your spiritual sadhana tracker. Let's make spiritual progress today.</p>
        </CardContent>
      </Card>
      
      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 md:mb-8">
        <Card className="spiritual-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Today's Sadhana</CardTitle>
            <CardDescription>
              {format(new Date(), "EEEE, MMMM d, yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderSadhanaStatus()}
          </CardContent>
          <CardFooter>
            <Link to="/sadhana" className="w-full">
              <Button className="w-full bg-spiritual-purple hover:bg-spiritual-purple/90">
                <PenSquare className="h-4 w-4 mr-2" />
                Sadhana Card
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card className="spiritual-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Weekly Progress</CardTitle>
            <CardDescription>
              Your spiritual journey this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Chanting Rounds</span>
                  <span className="font-medium">{weeklyStats?.totalChantingRounds || 0} total</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Reading Time</span>
                  <span className="font-medium">{weeklyStats?.totalReadingMinutes || 0} minutes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Morning Program</span>
                  <span className="font-medium">{Math.round(weeklyStats?.morningProgramAttendance || 0)}%</span>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link to="/progress" className="w-full">
              <Button variant="outline" className="w-full border-spiritual-purple/20 hover:bg-spiritual-purple/10">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Detailed Progress
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      {/* Quick Links */}
      <h2 className="text-xl font-medium mb-4">Quick Links</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <Link to="/reading" className="block">
          <Card className="spiritual-card h-full hover:shadow-md transition-shadow">
            <CardContent className="flex items-center p-3 md:p-4">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-spiritual-purple/10 flex items-center justify-center mr-2 md:mr-3">
                <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-spiritual-purple" />
              </div>
              <div>
                <h3 className="font-medium text-sm md:text-base">Reading Log</h3>
                <p className="text-xs md:text-sm text-muted-foreground">Track your study</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/calendar" className="block">
          <Card className="spiritual-card h-full hover:shadow-md transition-shadow">
            <CardContent className="flex items-center p-3 md:p-4">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-spiritual-purple/10 flex items-center justify-center mr-2 md:mr-3">
                <CalendarDays className="h-4 w-4 md:h-5 md:w-5 text-spiritual-purple" />
              </div>
              <div>
                <h3 className="font-medium text-sm md:text-base">Calendar</h3>
                <p className="text-xs md:text-sm text-muted-foreground">View your history</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/profile" className="block">
          <Card className="spiritual-card h-full hover:shadow-md transition-shadow">
            <CardContent className="flex items-center p-3 md:p-4">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-spiritual-purple/10 flex items-center justify-center mr-2 md:mr-3">
                <User className="h-4 w-4 md:h-5 md:w-5 text-spiritual-purple" />
              </div>
              <div>
                <h3 className="font-medium text-sm md:text-base">Profile</h3>
                <p className="text-xs md:text-sm text-muted-foreground">Update your info</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;

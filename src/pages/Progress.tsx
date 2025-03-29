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
} from "recharts";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, Music, BookOpen, Clock, Sun, Award } from "lucide-react";
import { toast } from "@/lib/toast";
import { getWeeklySadhana, WeeklyStats, SadhanaEntry } from "@/lib/sadhanaService";

const ProgressPage = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - date.getDay()); // Set to Sunday
    date.setHours(0, 0, 0, 0);
    return date;
  });
  const [weekStats, setWeekStats] = useState<WeeklyStats | null>(null);
  
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
      
      try {
        setLoading(true);
        const stats = await getWeeklySadhana(currentUser.uid, weekStart);
        setWeekStats(stats);
      } catch (error) {
        console.error("Error fetching weekly stats:", error);
        toast.error("Failed to load weekly statistics");
      } finally {
        setLoading(false);
      }
    };
    
    fetchWeeklyData();
  }, [currentUser, weekStart]);
  
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
        <h1 className="text-3xl font-bold text-spiritual-purple">Spiritual Progress</h1>
        <p className="text-muted-foreground">
          Track your spiritual growth and sadhana consistency
        </p>
      </div>
      
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
                <Clock className="h-4 w-4 text-spiritual-purple" />
              </div>
              <CardTitle className="text-lg">Wake-up</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <span className="text-3xl font-bold">
                {weekStats?.averageWakeUpHour.toFixed(1) || "N/A"}
              </span>
              <span className="text-sm text-muted-foreground">Average Hour</span>
              <span className="text-md mt-2">
                <span className="font-medium">{weekStats?.prasadamMaintained || 0}%</span> Prasadam Maintained
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
            <CardTitle className="text-lg">Wake-up Time Consistency</CardTitle>
            <CardDescription>
              Your morning rising times throughout the week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {weekStats?.entries.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prepareWakeUpTimeData()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="day" />
                    <YAxis domain={[0, 12]} ticks={[0, 3, 6, 9, 12]} />
                    <Tooltip content={<WakeUpTimeTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="time" 
                      stroke="#7E69AB" 
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#7E69AB" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
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
            <CardTitle className="text-lg">Program Attendance</CardTitle>
            <CardDescription>
              Your participation in spiritual programs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {weekStats?.entries.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={prepareProgramAttendanceData()} 
                    layout="vertical"
                    margin={{ top: 10, right: 10, left: 80, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[0, 7]} />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip content={<ProgramTooltip />} />
                    <Bar dataKey="value" fill="#7E69AB" />
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
                {weekStats.totalChantingRounds >= 112 
                  ? "Excellent! You completed 16 rounds or more per day on average."
                  : weekStats.totalChantingRounds >= 70
                  ? "Good progress! You're building consistency in your sadhana."
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

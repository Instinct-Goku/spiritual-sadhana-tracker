
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { Calendar, CalendarDays } from "lucide-react";

const CalendarPage = () => {
  const [loading, setLoading] = useState(false);
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-spiritual-purple">Sadhana Calendar</h1>
        <p className="text-muted-foreground">
          View your sadhana history and upcoming events
        </p>
      </div>
      
      <Card className="spiritual-card mb-8">
        <CardHeader className="pb-3">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-spiritual-purple/10 flex items-center justify-center mr-3">
              <Calendar className="h-5 w-5 text-spiritual-purple" />
            </div>
            <div>
              <CardTitle>Sadhana Calendar</CardTitle>
              <CardDescription>This feature is coming soon</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="py-10 text-center">
            <div className="h-20 w-20 mx-auto mb-4 rounded-full bg-spiritual-purple/10 flex items-center justify-center">
              <CalendarDays className="h-10 w-10 text-spiritual-purple" />
            </div>
            <h3 className="text-lg font-medium mb-2">Feature Coming Soon</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-4">
              We're working on a comprehensive calendar that will show your sadhana history, streak tracking, and important spiritual events. Check back soon for this feature.
            </p>
            <Button 
              onClick={() => toast.info("Feature coming soon!")}
              className="bg-spiritual-purple hover:bg-spiritual-purple/90 text-white"
            >
              Notify Me When Ready
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarPage;

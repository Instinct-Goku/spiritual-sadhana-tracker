
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { BookOpen, Library } from "lucide-react";

const ReadingPage = () => {
  const [loading, setLoading] = useState(false);
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-spiritual-purple">Reading Log</h1>
        <p className="text-muted-foreground">
          Track your spiritual study progress
        </p>
      </div>
      
      <Card className="spiritual-card mb-8">
        <CardHeader className="pb-3">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-spiritual-purple/10 flex items-center justify-center mr-3">
              <BookOpen className="h-5 w-5 text-spiritual-purple" />
            </div>
            <div>
              <CardTitle>Reading Log</CardTitle>
              <CardDescription>This feature is coming soon</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="py-10 text-center">
            <div className="h-20 w-20 mx-auto mb-4 rounded-full bg-spiritual-purple/10 flex items-center justify-center">
              <Library className="h-10 w-10 text-spiritual-purple" />
            </div>
            <h3 className="text-lg font-medium mb-2">Feature Coming Soon</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-4">
              We're working on a dedicated reading log to help you track your books, chapters, and study progress. In the meantime, you can record your daily reading minutes in the Sadhana Card.
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

export default ReadingPage;

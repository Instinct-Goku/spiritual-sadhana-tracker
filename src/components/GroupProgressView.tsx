
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDevoteeGroups, getGroupSadhanaProgress } from "@/lib/adminService";
import { 
  calculateWeeklySadhanaScore, 
  getBatchMinimumRequirements,
  getBatchCriteriaFromUserProfile
} from "@/lib/scoringService";

interface DevoteeProgress {
  id: string;
  displayName: string;
  spiritualName?: string;
  photoURL?: string;
  batch?: string;
  weeklyTotalScore: number;
  bodyScore: number;
  soulScore: number;
  breakdowns: {
    sleepTimeScore: number;
    wakeUpTimeScore: number;
    readingScore: number;
    daySleepScore: number;
    japaCompletionScore: number;
    programScore: number;
    hearingScore: number;
    serviceScore: number;
  };
}

const GroupProgressView = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [devoteeProgress, setDevoteeProgress] = useState<DevoteeProgress[]>([]);

  useEffect(() => {
    fetchGroups();
  }, [userProfile]);

  useEffect(() => {
    if (selectedGroupId) {
      fetchGroupProgress();
    }
  }, [selectedGroupId]);

  const fetchGroups = async () => {
    if (!userProfile?.uid) return;
    
    try {
      const groupsList = await getDevoteeGroups(userProfile.uid);
      setGroups(groupsList);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching groups:", error);
      setLoading(false);
    }
  };

  const fetchGroupProgress = async () => {
    if (!selectedGroupId) return;
    
    setLoading(true);
    try {
      const progressData = await getGroupSadhanaProgress(selectedGroupId);
      
      const processedProgress: DevoteeProgress[] = progressData.map(devotee => {
        const bodyScore = (devotee.weeklyStats?.sleepTimeScore || 0) + 
                         (devotee.weeklyStats?.wakeUpTimeScore || 0) + 
                         (devotee.weeklyStats?.daySleepScore || 0) + 
                         (devotee.weeklyStats?.serviceScore || 0);
                         
        const soulScore = (devotee.weeklyStats?.readingScore || 0) + 
                         (devotee.weeklyStats?.japaCompletionScore || 0) + 
                         (devotee.weeklyStats?.programScore || 0) + 
                         (devotee.weeklyStats?.hearingScore || 0);

        return {
          id: devotee.id,
          displayName: devotee.displayName,
          spiritualName: devotee.spiritualName,
          photoURL: devotee.photoURL,
          batch: devotee.batch,
          weeklyTotalScore: bodyScore + soulScore,
          bodyScore,
          soulScore,
          breakdowns: {
            sleepTimeScore: devotee.weeklyStats?.sleepTimeScore || 0,
            wakeUpTimeScore: devotee.weeklyStats?.wakeUpTimeScore || 0,
            readingScore: devotee.weeklyStats?.readingScore || 0,
            daySleepScore: devotee.weeklyStats?.daySleepScore || 0,
            japaCompletionScore: devotee.weeklyStats?.japaCompletionScore || 0,
            programScore: devotee.weeklyStats?.programScore || 0,
            hearingScore: devotee.weeklyStats?.hearingScore || 0,
            serviceScore: devotee.weeklyStats?.serviceScore || 0,
          }
        };
      });
      
      setDevoteeProgress(processedProgress);
    } catch (error) {
      console.error("Error fetching group progress:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && groups.length === 0) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-10 w-10 animate-spin text-spiritual-purple" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-spiritual-purple flex items-center gap-2">
            <Users className="h-5 w-5" />
            Group Progress Overview
          </CardTitle>
          <CardDescription>
            View sadhana progress for devotees in your groups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map(group => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name} ({group.devoteeCount || 0} devotees)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedGroupId && devoteeProgress.length > 0 && (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Devotee</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead className="text-center">Total Score</TableHead>
                    <TableHead className="text-center">Body Score</TableHead>
                    <TableHead className="text-center">Soul Score</TableHead>
                    <TableHead className="text-center">Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devoteeProgress.map(devotee => (
                    <TableRow key={devotee.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={devotee.photoURL || ""} />
                            <AvatarFallback>
                              {devotee.displayName?.charAt(0) || "D"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{devotee.displayName}</p>
                            {devotee.spiritualName && (
                              <p className="text-sm text-spiritual-purple">
                                {devotee.spiritualName}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{devotee.batch || "Not assigned"}</span>
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {devotee.weeklyTotalScore}
                      </TableCell>
                      <TableCell className="text-center">
                        {devotee.bodyScore}
                      </TableCell>
                      <TableCell className="text-center">
                        {devotee.soulScore}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Body</span>
                            <span>{devotee.bodyScore}</span>
                          </div>
                          <Progress 
                            value={(devotee.bodyScore / (devotee.bodyScore + devotee.soulScore)) * 100} 
                            className="h-2" 
                          />
                          <div className="flex justify-between text-xs">
                            <span>Soul</span>
                            <span>{devotee.soulScore}</span>
                          </div>
                          <Progress 
                            value={(devotee.soulScore / (devotee.bodyScore + devotee.soulScore)) * 100} 
                            className="h-2" 
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {selectedGroupId && devoteeProgress.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No progress data available for this group</p>
            </div>
          )}

          {loading && selectedGroupId && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-spiritual-purple" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupProgressView;

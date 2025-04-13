
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from '@/lib/toast';
import { useAuth } from '@/contexts/AuthContext';
import { getDevoteeDetails } from '@/lib/adminService';
import BatchScoreConfig from '@/components/BatchScoreConfig';

// Define the interfaces that were missing
interface DevoteeWithProfile {
  uid: string;
  displayName?: string;
  email?: string;
  // Add other properties as needed
}

interface DevoteeSadhanaProgress {
  id: string;
  // Add other properties as needed
}

interface DevoteeDetails {
  // Define properties for devotee details
  id: string;
  name?: string;
  email?: string;
  // Add other properties as needed
}

const AdminPage = () => {
  const { currentUser, userProfile } = useAuth();
  const [showDevoteeDetails, setShowDevoteeDetails] = useState(false);
  const [selectedDevotee, setSelectedDevotee] = useState<DevoteeWithProfile | null>(null);
  const [devoteeDetails, setDevoteeDetails] = useState<DevoteeDetails | null>(null);
  const [showBatchConfig, setShowBatchConfig] = useState(false);

  const viewDevoteeDetails = async (devotee: DevoteeWithProfile | DevoteeSadhanaProgress) => {
    let devoteeId = 'uid' in devotee ? devotee.uid : devotee.id;
    
    if ('uid' in devotee) {
      setSelectedDevotee(devotee as DevoteeWithProfile);
    }
    
    try {
      const details = await getDevoteeDetails(devoteeId);
      if (details) {
        setDevoteeDetails(details);
        setShowDevoteeDetails(true);
      } else {
        toast.error("Failed to load devotee details");
      }
    } catch (error) {
      console.error("Error loading devotee details:", error);
      toast.error("Failed to load devotee details");
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Button onClick={() => setShowBatchConfig(true)}>
              Configure Batch Scoring
            </Button>
            
            {/* Add other admin functionalities here */}
          </div>
        </CardContent>
      </Card>

      {/* Batch Score Configuration Sheet */}
      <Sheet open={showBatchConfig} onOpenChange={setShowBatchConfig}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Batch Scoring Configuration</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <BatchScoreConfig onClose={() => setShowBatchConfig(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminPage;

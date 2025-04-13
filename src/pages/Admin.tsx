
  viewDevoteeDetails = async (devotee: DevoteeWithProfile | DevoteeSadhanaProgress) => {
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

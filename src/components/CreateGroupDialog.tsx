
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { createDevoteeGroup } from "@/lib/adminService";
import { getAvailableBatchTemplates, getDefaultBatchTemplate } from "@/lib/batchService";
import { toast } from "@/lib/toast";

interface CreateGroupDialogProps {
  adminId: string;
  onGroupCreated: () => void;
}

const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({ adminId, onGroupCreated }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const batchTemplates = getAvailableBatchTemplates();

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }

    try {
      setLoading(true);
      
      // Get batch criteria from selected template
      const batchCriteria = selectedTemplate 
        ? getDefaultBatchTemplate(selectedTemplate)
        : undefined;

      await createDevoteeGroup({
        name: groupName.trim(),
        description: groupDescription.trim(),
        adminId,
        createdAt: new Date(),
        batchCriteria: batchCriteria as any,
      });
      
      toast.success("Group created successfully!");
      setGroupName("");
      setGroupDescription("");
      setSelectedTemplate("");
      setOpen(false);
      onGroupCreated();
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Devotee Group</DialogTitle>
          <DialogDescription>
            Create a new group to organize devotees and track their progress together.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="col-span-3"
              placeholder="Enter group name"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              className="col-span-3"
              placeholder="Enter group description (optional)"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="template" className="text-right">
              Batch Template
            </Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a batch template (optional)" />
              </SelectTrigger>
              <SelectContent>
                {batchTemplates.map((template) => (
                  <SelectItem key={template} value={template} className="capitalize">
                    {template.replace(/-/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleCreateGroup}
            disabled={loading || !groupName.trim()}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialog;

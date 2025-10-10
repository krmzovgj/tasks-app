import { useState } from "react";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Priority, Status } from "@/styles/models";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RecordCircle } from "iconsax-react";

interface TaskFormProps {
  initialTitle?: string;
  initialPriority?: Priority;
  initialStatus?: Status;
  showStatus?: boolean;
  onSubmit: (data: { title: string; priority: Priority; status?: Status }) => void;
  onCancel?: () => void;
}

export default function TaskForm({
  initialTitle = "",
  initialPriority = "LOW",
  initialStatus = "PENDING",
  showStatus = false,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [priority, setPriority] = useState<Priority>(initialPriority);
  const [status, setStatus] = useState<Status>(initialStatus);

  return (
    <div className="space-y-4 mt-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Title</label>
        <Input placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className={`grid grid-cols-1 ${showStatus ? "md:grid-cols-3" : ""} gap-4`}>
        {showStatus && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">Status</label>
            <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">
                  <RecordCircle variant="Bulk" size={18} color="#292929" /> Pending
                </SelectItem>
                <SelectItem value="IN_PROGRESS">
                  <RecordCircle variant="Bulk" size={18} color="#4e46e3" /> In Progress
                </SelectItem>
                <SelectItem value="DONE">
                  <RecordCircle variant="Bulk" size={18} color="#13a473" /> Done
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium">Priority</label>
          <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">
                <RecordCircle variant="Bulk" size={18} color="#9b50d7" /> Low
              </SelectItem>
              <SelectItem value="MEDIUM">
                <RecordCircle variant="Bulk" size={18} color="#EDA224" /> Medium
              </SelectItem>
              <SelectItem value="HIGH">
                <RecordCircle variant="Bulk" size={18} color="#E93930" /> High
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 justify-end mt-4">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button onClick={() => onSubmit({ title, priority, status })}>Save</Button>
      </div>
    </div>
  );
}

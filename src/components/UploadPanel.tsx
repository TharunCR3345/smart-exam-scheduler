import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileSpreadsheet } from "lucide-react";

interface UploadPanelProps {
  onUploadComplete: () => void;
}

const UploadPanel = ({ onUploadComplete }: UploadPanelProps) => {
  const [uploadingExams, setUploadingExams] = useState(false);
  const [uploadingRooms, setUploadingRooms] = useState(false);
  const [uploadingTimeslots, setUploadingTimeslots] = useState(false);

  const handleExamsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingExams(true);
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Not authenticated");

          const exams = results.data
            .map((row: any) => ({
              user_id: user.id,
              name: row.name || row.Name,
              course_code: row.course_code || row.CourseCode || row.Code,
              students_count: parseInt(row.students_count || row.Students || 0),
              duration: parseInt(row.duration || row.Duration || 120),
            }))
            .filter((exam) => exam.name && exam.course_code);

          if (exams.length === 0) {
            throw new Error("No valid exams found in CSV");
          }

          const { error } = await supabase.from("exams").insert(exams);
          if (error) throw error;

          toast.success(`${exams.length} exams uploaded successfully!`);
          onUploadComplete();
    } catch (error) {
      toast.error(error.message || "Failed to upload exams");
    } finally {
          setUploadingExams(false);
        }
      },
      error: (error) => {
        toast.error("Failed to parse CSV file");
        setUploadingExams(false);
      },
    });
  };

  const handleRoomsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingRooms(true);
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Not authenticated");

          const rooms = results.data
            .map((row: any) => ({
              user_id: user.id,
              name: row.name || row.Name || row.Room,
              capacity: parseInt(row.capacity || row.Capacity || 0),
              building: row.building || row.Building || "",
            }))
            .filter((room) => room.name && room.capacity > 0);

          if (rooms.length === 0) {
            throw new Error("No valid rooms found in CSV");
          }

          const { error } = await supabase.from("rooms").insert(rooms);
          if (error) throw error;

          toast.success(`${rooms.length} rooms uploaded successfully!`);
          onUploadComplete();
    } catch (error) {
      toast.error(error.message || "Failed to upload rooms");
    } finally {
          setUploadingRooms(false);
        }
      },
      error: (error) => {
        toast.error("Failed to parse CSV file");
        setUploadingRooms(false);
      },
    });
  };

  const handleTimeslotsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTimeslots(true);
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Not authenticated");

          const timeslots = results.data
            .map((row: any) => ({
              user_id: user.id,
              date: row.date || row.Date,
              start_time: row.start_time || row.StartTime || row.Start,
              end_time: row.end_time || row.EndTime || row.End,
            }))
            .filter((slot) => slot.date && slot.start_time && slot.end_time);

          if (timeslots.length === 0) {
            throw new Error("No valid timeslots found in CSV");
          }

          const { error } = await supabase.from("timeslots").insert(timeslots);
          if (error) throw error;

          toast.success(`${timeslots.length} timeslots uploaded successfully!`);
          onUploadComplete();
    } catch (error) {
      toast.error(error.message || "Failed to upload timeslots");
    } finally {
          setUploadingTimeslots(false);
        }
      },
      error: (error) => {
        toast.error("Failed to parse CSV file");
        setUploadingTimeslots(false);
      },
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Exams
          </CardTitle>
          <CardDescription>Upload exam details (CSV)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="exams-file">CSV File</Label>
              <Input
                id="exams-file"
                type="file"
                accept=".csv"
                onChange={handleExamsUpload}
                disabled={uploadingExams}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Required columns: name, course_code, students_count, duration
            </p>
            {uploadingExams && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Uploading...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Rooms
          </CardTitle>
          <CardDescription>Upload room details (CSV)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rooms-file">CSV File</Label>
              <Input
                id="rooms-file"
                type="file"
                accept=".csv"
                onChange={handleRoomsUpload}
                disabled={uploadingRooms}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Required columns: name, capacity, building
            </p>
            {uploadingRooms && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Uploading...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Timeslots
          </CardTitle>
          <CardDescription>Upload timeslot details (CSV)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="timeslots-file">CSV File</Label>
              <Input
                id="timeslots-file"
                type="file"
                accept=".csv"
                onChange={handleTimeslotsUpload}
                disabled={uploadingTimeslots}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Required columns: date, start_time, end_time
            </p>
            {uploadingTimeslots && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Uploading...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadPanel;

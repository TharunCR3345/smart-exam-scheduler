import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle } from "lucide-react";

interface ManualEntryPanelProps {
  onEntryComplete: () => void;
}

const examSchema = z.object({
  name: z.string().min(1, "Name is required"),
  course_code: z.string().min(1, "Course code is required"),
  students_count: z.coerce.number().min(1, "Must have at least 1 student"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
});

const roomSchema = z.object({
  name: z.string().min(1, "Name is required"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  building: z.string().optional(),
});

const timeslotSchema = z.object({
  date: z.string().min(1, "Date is required"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
});

const ManualEntryPanel = ({ onEntryComplete }: ManualEntryPanelProps) => {
  const [addingExam, setAddingExam] = useState(false);
  const [addingRoom, setAddingRoom] = useState(false);
  const [addingTimeslot, setAddingTimeslot] = useState(false);

  const examForm = useForm({
    resolver: zodResolver(examSchema),
    defaultValues: {
      name: "",
      course_code: "",
      students_count: 0,
      duration: 120,
    },
  });

  const roomForm = useForm({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      name: "",
      capacity: 0,
      building: "",
    },
  });

  const timeslotForm = useForm({
    resolver: zodResolver(timeslotSchema),
    defaultValues: {
      date: "",
      start_time: "",
      end_time: "",
    },
  });

  const handleExamSubmit = async (values: z.infer<typeof examSchema>) => {
    setAddingExam(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("exams").insert([{
        user_id: user.id,
        name: values.name,
        course_code: values.course_code,
        students_count: values.students_count,
        duration: values.duration,
      }]);

      if (error) throw error;

      toast.success("Exam added successfully!");
      examForm.reset();
      onEntryComplete();
    } catch (error) {
      toast.error(error.message || "Failed to add exam");
    } finally {
      setAddingExam(false);
    }
  };

  const handleRoomSubmit = async (values: z.infer<typeof roomSchema>) => {
    setAddingRoom(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("rooms").insert([{
        user_id: user.id,
        name: values.name,
        capacity: values.capacity,
        building: values.building || "",
      }]);

      if (error) throw error;

      toast.success("Room added successfully!");
      roomForm.reset();
      onEntryComplete();
    } catch (error) {
      toast.error(error.message || "Failed to add room");
    } finally {
      setAddingRoom(false);
    }
  };

  const handleTimeslotSubmit = async (values: z.infer<typeof timeslotSchema>) => {
    setAddingTimeslot(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("timeslots").insert([{
        user_id: user.id,
        date: values.date,
        start_time: values.start_time,
        end_time: values.end_time,
      }]);

      if (error) throw error;

      toast.success("Timeslot added successfully!");
      timeslotForm.reset();
      onEntryComplete();
    } catch (error) {
      toast.error(error.message || "Failed to add timeslot");
    } finally {
      setAddingTimeslot(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5" />
            Add Exam
          </CardTitle>
          <CardDescription>Manually add a new exam</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...examForm}>
            <form onSubmit={examForm.handleSubmit(handleExamSubmit)} className="space-y-4">
              <FormField
                control={examForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exam Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Final Exam" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={examForm.control}
                name="course_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Code</FormLabel>
                    <FormControl>
                      <Input placeholder="CS101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={examForm.control}
                name="students_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Students Count</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={examForm.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="120" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={addingExam}>
                {addingExam ? "Adding..." : "Add Exam"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5" />
            Add Room
          </CardTitle>
          <CardDescription>Manually add a new room</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...roomForm}>
            <form onSubmit={roomForm.handleSubmit(handleRoomSubmit)} className="space-y-4">
              <FormField
                control={roomForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Room 101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={roomForm.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={roomForm.control}
                name="building"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Building (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Main Building" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={addingRoom}>
                {addingRoom ? "Adding..." : "Add Room"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5" />
            Add Timeslot
          </CardTitle>
          <CardDescription>Manually add a new timeslot</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...timeslotForm}>
            <form onSubmit={timeslotForm.handleSubmit(handleTimeslotSubmit)} className="space-y-4">
              <FormField
                control={timeslotForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={timeslotForm.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={timeslotForm.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={addingTimeslot}>
                {addingTimeslot ? "Adding..." : "Add Timeslot"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualEntryPanel;
// export default ManualEntryPanel
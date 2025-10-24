import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, FileText, Building, Clock } from "lucide-react";
import { toast } from "sonner";

interface DataTablesProps {
  onDataChange: () => void;
}

const DataTables = ({ onDataChange }: DataTablesProps) => {
  const [exams, setExams] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [timeslots, setTimeslots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [examsRes, roomsRes, timeslotsRes] = await Promise.all([
        supabase.from("exams").select("*").order("created_at", { ascending: false }),
        supabase.from("rooms").select("*").order("created_at", { ascending: false }),
        supabase.from("timeslots").select("*").order("date", { ascending: true }),
      ]);

      setExams(examsRes.data || []);
      setRooms(roomsRes.data || []);
      setTimeslots(timeslotsRes.data || []);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (table: "exams" | "rooms" | "timeslots", id: string) => {
    try {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      
      toast.success("Deleted successfully");
      fetchData();
      onDataChange();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="exams" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="exams" className="gap-2">
          <FileText className="w-4 h-4" />
          Exams ({exams.length})
        </TabsTrigger>
        <TabsTrigger value="rooms" className="gap-2">
          <Building className="w-4 h-4" />
          Rooms ({rooms.length})
        </TabsTrigger>
        <TabsTrigger value="timeslots" className="gap-2">
          <Clock className="w-4 h-4" />
          Timeslots ({timeslots.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="exams" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Exams Data</CardTitle>
            <CardDescription>View and manage all uploaded exams</CardDescription>
          </CardHeader>
          <CardContent>
            {exams.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No exams uploaded yet</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Course Code</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Duration (min)</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exams.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell className="font-medium">{exam.name}</TableCell>
                        <TableCell>{exam.course_code}</TableCell>
                        <TableCell>{exam.students_count}</TableCell>
                        <TableCell>{exam.duration}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete("exams", exam.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="rooms" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Rooms Data</CardTitle>
            <CardDescription>View and manage all uploaded rooms</CardDescription>
          </CardHeader>
          <CardContent>
            {rooms.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No rooms uploaded yet</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Building</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rooms.map((room) => (
                      <TableRow key={room.id}>
                        <TableCell className="font-medium">{room.name}</TableCell>
                        <TableCell>{room.capacity}</TableCell>
                        <TableCell>{room.building || "-"}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete("rooms", room.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="timeslots" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Timeslots Data</CardTitle>
            <CardDescription>View and manage all uploaded timeslots</CardDescription>
          </CardHeader>
          <CardContent>
            {timeslots.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No timeslots uploaded yet</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>End Time</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeslots.map((slot) => (
                      <TableRow key={slot.id}>
                        <TableCell className="font-medium">
                          {new Date(slot.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{slot.start_time}</TableCell>
                        <TableCell>{slot.end_time}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete("timeslots", slot.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default DataTables;

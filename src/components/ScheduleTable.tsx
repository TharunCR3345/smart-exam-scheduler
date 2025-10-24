import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface Schedule {
  id: string;
  exam: { name: string; course_code: string };
  room: { name: string; building: string };
  timeslot: { date: string; start_time: string; end_time: string };
  status: string;
}

const ScheduleTable = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("schedules-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "schedules",
        },
        () => {
          fetchSchedules();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from("schedules")
        .select(`
          id,
          status,
          exam:exams(name, course_code),
          room:rooms(name, building),
          timeslot:timeslots(date, start_time, end_time)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSchedules(data as unknown as Schedule[]);
    } catch (error: any) {
      toast.error("Failed to fetch schedules");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Exam Schedule", 14, 15);

    const tableData = schedules.map((schedule) => [
      schedule.exam.course_code,
      schedule.exam.name,
      schedule.room.name,
      schedule.room.building,
      schedule.timeslot.date,
      schedule.timeslot.start_time,
      schedule.timeslot.end_time,
    ]);

    autoTable(doc, {
      head: [["Code", "Exam", "Room", "Building", "Date", "Start", "End"]],
      body: tableData,
      startY: 20,
    });

    doc.save("exam-schedule.pdf");
    toast.success("Schedule exported as PDF");
  };

  const handleExportCSV = () => {
    const headers = ["Course Code", "Exam Name", "Room", "Building", "Date", "Start Time", "End Time"];
    const rows = schedules.map((schedule) => [
      schedule.exam.course_code,
      schedule.exam.name,
      schedule.room.name,
      schedule.room.building,
      schedule.timeslot.date,
      schedule.timeslot.start_time,
      schedule.timeslot.end_time,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exam-schedule.csv";
    a.click();
    toast.success("Schedule exported as CSV");
  };

  const handleExportExcel = () => {
    const data = schedules.map((schedule) => ({
      "Course Code": schedule.exam.course_code,
      "Exam Name": schedule.exam.name,
      "Room": schedule.room.name,
      "Building": schedule.room.building,
      "Date": schedule.timeslot.date,
      "Start Time": schedule.timeslot.start_time,
      "End Time": schedule.timeslot.end_time,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Exam Schedule");
    XLSX.writeFile(wb, "exam-schedule.xlsx");
    toast.success("Schedule exported as Excel");
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No schedules generated yet. Upload data and click "Generate Schedule" to begin.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleExportCSV} className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
        <Button variant="outline" onClick={handleExportExcel} className="gap-2">
          <Download className="w-4 h-4" />
          Export Excel
        </Button>
        <Button variant="outline" onClick={handleExportPDF} className="gap-2">
          <Download className="w-4 h-4" />
          Export PDF
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course Code</TableHead>
              <TableHead>Exam Name</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Building</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell className="font-medium">{schedule.exam.course_code}</TableCell>
                <TableCell>{schedule.exam.name}</TableCell>
                <TableCell>{schedule.room.name}</TableCell>
                <TableCell>{schedule.room.building}</TableCell>
                <TableCell>{schedule.timeslot.date}</TableCell>
                <TableCell>
                  {schedule.timeslot.start_time} - {schedule.timeslot.end_time}
                </TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-500">
                    {schedule.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ScheduleTable;

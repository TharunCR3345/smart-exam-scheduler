import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, FileSpreadsheet, LogOut, Sparkles, TableIcon } from "lucide-react";
import UploadPanel from "@/components/UploadPanel";
import ManualEntryPanel from "@/components/ManualEntryPanel";
import ScheduleTable from "@/components/ScheduleTable";
import DataTables from "@/components/DataTables";
import ChatWidget from "@/components/ChatWidget";
import ProtectedRoute from "@/components/ProtectedRoute";

const Dashboard = () => {
  const navigate = useNavigate();
  const [examsCount, setExamsCount] = useState(0);
  const [roomsCount, setRoomsCount] = useState(0);
  const [timeslotsCount, setTimeslotsCount] = useState(0);
  const [schedulesCount, setSchedulesCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    const { data: exams } = await supabase.from("exams").select("id", { count: "exact" });
    const { data: rooms } = await supabase.from("rooms").select("id", { count: "exact" });
    const { data: timeslots } = await supabase.from("timeslots").select("id", { count: "exact" });
    const { data: schedules } = await supabase.from("schedules").select("id", { count: "exact" });

    setExamsCount(exams?.length || 0);
    setRoomsCount(rooms?.length || 0);
    setTimeslotsCount(timeslots?.length || 0);
    setSchedulesCount(schedules?.length || 0);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleGenerateSchedule = async () => {
    if (examsCount === 0 || roomsCount === 0 || timeslotsCount === 0) {
      toast.error("Please upload exams, rooms, and timeslots first");
      return;
    }

    setIsGenerating(true);
    try {
      const { error } = await supabase.functions.invoke("schedule-optimizer");
      
      if (error) throw error;

      toast.success("Schedule generated successfully!");
      fetchCounts();
    } catch (error: any) {
      toast.error(error.message || "Failed to generate schedule");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen gradient-hero p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Exam Scheduler</h1>
                <p className="text-muted-foreground">AI-Powered Dashboard</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut} className="gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="glass-card shadow-glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Exams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{examsCount}</div>
              </CardContent>
            </Card>
            <Card className="glass-card shadow-glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Rooms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{roomsCount}</div>
              </CardContent>
            </Card>
            <Card className="glass-card shadow-glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Timeslots</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{timeslotsCount}</div>
              </CardContent>
            </Card>
            <Card className="glass-card shadow-glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{schedulesCount}</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Card className="glass-card shadow-glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Schedule Management</CardTitle>
                  <CardDescription>
                    {examsCount === 0 || roomsCount === 0 || timeslotsCount === 0
                      ? "Upload exams, rooms, and timeslots to generate a schedule"
                      : "Upload data and generate optimized schedules"}
                  </CardDescription>
                </div>
                <Button
                  onClick={handleGenerateSchedule}
                  disabled={isGenerating || examsCount === 0 || roomsCount === 0 || timeslotsCount === 0}
                  className="gradient-primary gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {isGenerating ? "Generating..." : "Generate Schedule"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="upload" className="gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    CSV Upload
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    Manual Entry
                  </TabsTrigger>
                  <TabsTrigger value="data" className="gap-2">
                    <TableIcon className="w-4 h-4" />
                    View Data
                  </TabsTrigger>
                  <TabsTrigger value="schedule" className="gap-2">
                    <Calendar className="w-4 h-4" />
                    View Schedule
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-6">
                  <UploadPanel onUploadComplete={fetchCounts} />
                </TabsContent>

                <TabsContent value="manual" className="mt-6">
                  <ManualEntryPanel onEntryComplete={fetchCounts} />
                </TabsContent>

                <TabsContent value="data" className="mt-6">
                  <DataTables onDataChange={fetchCounts} />
                </TabsContent>

                <TabsContent value="schedule" className="mt-6">
                  <ScheduleTable />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Chat Widget */}
        <ChatWidget />
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;

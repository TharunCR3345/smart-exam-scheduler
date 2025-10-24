import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get user from auth
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    // Fetch all data
    const { data: exams } = await supabaseClient
      .from("exams")
      .select("*")
      .eq("user_id", user.id);

    const { data: rooms } = await supabaseClient
      .from("rooms")
      .select("*")
      .eq("user_id", user.id);

    const { data: timeslots } = await supabaseClient
      .from("timeslots")
      .select("*")
      .eq("user_id", user.id);

    if (!exams || !rooms || !timeslots) {
      throw new Error("Missing required data");
    }

    // Clear existing schedules
    await supabaseClient.from("schedules").delete().eq("user_id", user.id);

    // Simple greedy scheduling algorithm
    const schedules = [];
    const usedSlots = new Set<string>();

    for (const exam of exams) {
      let assigned = false;

      for (const timeslot of timeslots) {
        for (const room of rooms) {
          const slotKey = `${room.id}-${timeslot.id}`;

          // Check if room has enough capacity and slot is available
          if (room.capacity >= exam.students_count && !usedSlots.has(slotKey)) {
            schedules.push({
              user_id: user.id,
              exam_id: exam.id,
              room_id: room.id,
              timeslot_id: timeslot.id,
              status: "scheduled",
            });
            usedSlots.add(slotKey);
            assigned = true;
            break;
          }
        }
        if (assigned) break;
      }

      if (!assigned) {
        console.warn(`Could not assign exam: ${exam.name}`);
      }
    }

    // Insert schedules
    const { error: insertError } = await supabaseClient
      .from("schedules")
      .insert(schedules);

    if (insertError) throw insertError;

    console.log(`Generated ${schedules.length} schedules`);

    return new Response(
      JSON.stringify({
        success: true,
        scheduled: schedules.length,
        total: exams.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

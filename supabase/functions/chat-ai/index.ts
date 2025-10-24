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
    const { message, messages } = await req.json();

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

    // Fetch user's schedule data for context
    const { data: schedules } = await supabaseClient
      .from("schedules")
      .select(`
        exam:exams(name, course_code),
        room:rooms(name, building),
        timeslot:timeslots(date, start_time, end_time)
      `)
      .eq("user_id", user.id);

    const scheduleContext = schedules?.map((s: any) => 
      `${s.exam.course_code} (${s.exam.name}) is scheduled in ${s.room.name} (${s.room.building}) on ${s.timeslot.date} from ${s.timeslot.start_time} to ${s.timeslot.end_time}`
    ).join("\n") || "No schedules available yet.";

    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a helpful AI assistant for an exam scheduling system. You can answer questions about exam schedules, help with queries about specific exams, rooms, or timeslots.
            
Current schedule context:
${scheduleContext}

Be concise and helpful. If asked about specific exams or timeslots, refer to the context above.`,
          },
          ...messages,
          { role: "user", content: message },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that request.";

    return new Response(
      JSON.stringify({ response: aiResponse }),
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

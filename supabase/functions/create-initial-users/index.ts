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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const users = [
      { email: "admin@mamo.so", password: "admin123", role: "admin", fullName: "Admin User" },
      { email: "cashier@mamo.so", password: "cashier123", role: "cashier", fullName: "Cashier User" },
    ];

    const results = [];

    for (const user of users) {
      // Check if user exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const exists = existingUsers?.users?.find(u => u.email === user.email);
      
      if (exists) {
        results.push({ email: user.email, status: "already exists" });
        continue;
      }

      // Create user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { full_name: user.fullName }
      });

      if (authError) {
        results.push({ email: user.email, status: "error", error: authError.message });
        continue;
      }

      // Add role
      if (authData.user) {
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ user_id: authData.user.id, role: user.role });

        if (roleError) {
          results.push({ email: user.email, status: "created but role failed", error: roleError.message });
        } else {
          results.push({ email: user.email, status: "created", role: user.role });
        }
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Simple test function to check if basic functionality works
import { serve } from "https://deno.land/std@0.204.0/http/server.ts";

serve(async (_req) => {
  return new Response(
    JSON.stringify({
      message: "Hello from test function!",
      timestamp: new Date().toISOString()
    }),
    { headers: { "Content-Type": "application/json" } },
  );
});
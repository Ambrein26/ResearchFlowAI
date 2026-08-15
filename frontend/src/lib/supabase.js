import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableUrl = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  throw new Error("VITE_SUPABASE_URL is missing.");
}

if (!supabasePublishableUrl) {
  throw new Error("VITE_SUPABASE_PUBLISHABLE_KEY is missing.");
}

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableUrl
);
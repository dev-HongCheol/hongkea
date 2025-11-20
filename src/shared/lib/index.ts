/**
 * Public API for shared utilities - Client-safe exports only
 */
export { cn } from "./utils";

// ✅ Client-safe Supabase exports
export { supabase } from "./supabase/client";

// ❌ Server exports are intentionally NOT re-exported here
// Server components should import directly:
// import { createClient as createServerClient } from '@/shared/lib/supabase/server'

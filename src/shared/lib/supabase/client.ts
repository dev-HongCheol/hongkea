/**
 * Supabase client-side for Next.js App Router
 * Browser-safe client for user authentication and public data access
 * Uses @supabase/ssr for proper cookie-based session management
 */

import { createBrowserClient } from '@supabase/ssr'
import { Database } from "@/shared/types/database.types";

/**
 * 브라우저에서 사용하는 Supabase 클라이언트
 * 쿠키 기반 세션 관리를 위해 @supabase/ssr 사용
 * @returns Supabase 브라우저 클라이언트
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}

/**
 * 기본 Supabase 클라이언트 export (싱글톤)
 */
export const supabase = createClient();

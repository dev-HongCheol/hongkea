/**
 * Supabase client-side singleton
 * Browser-safe client for user authentication and public data access
 * Uses @supabase/ssr for proper Next.js App Router compatibility
 */

import { createClient } from "@supabase/supabase-js";
import { Database } from "@/shared/types/database.types";

// 클라이언트 사이드 Supabase 클라이언트 (싱글톤)
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

/**
 * 브라우저에서 사용하는 Supabase 클라이언트 생성/반환
 * 사용자 인증, 클라이언트 측 데이터 조회에 사용
 * @returns Supabase 브라우저 클라이언트
 */
const getCreateClient = () => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  supabaseInstance = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );

  return supabaseInstance;
};

/**
 * 기본 Supabase 클라이언트 export
 */
export const supabase = getCreateClient();

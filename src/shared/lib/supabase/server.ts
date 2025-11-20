/**
 * Supabase server-side client
 * Server-safe client for server actions, API routes, and middleware
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/shared/types/database.types";

/**
 * 서버에서 사용하는 Supabase 클라이언트 생성
 * Server Actions, API Routes, Middleware에서 사용
 * @returns Supabase 서버 클라이언트
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Server Component에서 쿠키 설정 시 발생할 수 있는 에러 처리
            console.warn("쿠키 설정 실패:", error);
          }
        },
      },
    },
  );
}

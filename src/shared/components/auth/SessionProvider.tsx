/**
 * Session Provider Component
 * 클라이언트 사이드에서 Supabase 세션을 자동으로 새로고침
 */

"use client";

import { createClient } from "@/shared/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        // 로그인 성공 시 페이지 새로고침하여 서버 컴포넌트 업데이트
        router.refresh();
      }
      
      if (event === "SIGNED_OUT") {
        // 로그아웃 시 페이지 새로고침
        router.refresh();
      }
      
      if (event === "TOKEN_REFRESHED") {
        // 토큰 갱신 시 페이지 새로고침
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase.auth]);

  return <>{children}</>;
}
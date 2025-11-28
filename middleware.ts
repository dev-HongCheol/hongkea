/**
 * Next.js Middleware for Supabase authentication
 * 사용자 인증 및 권한 관리를 위한 미들웨어
 */

import { updateSession } from "@/shared/lib/supabase/middleware";

export async function middleware(request: any) {
  // 사용자 인증 세션 업데이트
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * 다음 경로들을 제외한 모든 요청 경로에 대해 미들웨어 실행:
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화 파일)
     * - favicon.ico (파비콘 파일)
     * - 이미지 파일들 (svg, png, jpg, jpeg, gif, webp)
     * - robots.txt, sitemap.xml 등 SEO 파일들
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

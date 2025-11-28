/**
 * Supabase middleware utility for Next.js
 * 사용자 인증 세션을 업데이트하고 관리
 */

import { AUTH_ROUTES } from "@/shared/config";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 관리자 페이지 접근 권한 확인
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
      const url = request.nextUrl.clone();
      url.pathname = AUTH_ROUTES.LOGIN.url;
      url.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // 관리자 권한 확인
    try {
      const { data: adminUser } = await supabase
        .from("hk_admin_users")
        .select("id, is_active, role")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      if (!adminUser) {
        // 관리자 권한이 없는 경우 403 페이지로 리다이렉트
        const url = request.nextUrl.clone();
        url.pathname = "/403";
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error("Admin permission check failed:", error);
      const url = request.nextUrl.clone();
      url.pathname = "/403";
      return NextResponse.redirect(url);
    }
  }

  // 인증이 필요한 페이지들 (장바구니, 위시리스트, 마이페이지 등)
  const protectedRoutes = ["/cart", "/wishlist", "/profile", "/orders"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}

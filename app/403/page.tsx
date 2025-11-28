/**
 * 403 Forbidden Page
 * 접근 권한이 없는 사용자에게 표시되는 페이지
 */

import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Shield, Home, LogIn } from "lucide-react";
import Link from "next/link";
import { AUTH_ROUTES, ROUTES } from "@/shared/config";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <Shield className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="mt-4 text-xl font-semibold text-gray-900">
            접근 권한이 없습니다
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              이 페이지에 접근할 권한이 없습니다. 관리자 권한이 필요합니다.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button asChild variant="default" className="w-full">
              <Link href={AUTH_ROUTES.LOGIN.url}>
                <LogIn className="mr-2 h-4 w-4" />
                로그인
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href={ROUTES.HOME.url}>
                <Home className="mr-2 h-4 w-4" />
                메인 페이지로 이동
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

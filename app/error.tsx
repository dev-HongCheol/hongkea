"use client";

import { useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Home, RefreshCw, AlertCircle } from "lucide-react";
import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="mt-4 text-xl font-semibold text-gray-900">
            오류가 발생했습니다
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
            </AlertDescription>
          </Alert>
          
          {process.env.NODE_ENV === "development" && (
            <Alert>
              <AlertDescription className="text-sm text-gray-600">
                <strong>개발 모드:</strong> {error.message}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-3">
            <Button 
              onClick={reset} 
              className="w-full"
              variant="default"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              다시 시도
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              className="w-full"
            >
              <Link href="/">
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

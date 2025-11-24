"use client";

import { AUTH_ROUTES, ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib";
import Link from "next/link";
import { LoginFormData, loginFormSchema } from "../model/types";
import { useEmailLogin } from "../model/emailLogin";
import GoogleLoginButton from "./GoogleLoginButton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  FieldGroup,
  Field,
  FieldLabel,
  Input,
  FieldError,
  Button,
  FieldSeparator,
  FieldDescription,
} from "@/shared/ui";

const LoginForm = () => {
  const router = useRouter();
  const loginMutation = useEmailLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(data);
      // 로그인 성공 처리
      router.push(ROUTES.HOME.url);
    } catch (err) {
      // 개별 필드 에러 설정
      if (err instanceof Error && err.message.includes("이메일")) {
        setFormError("email", { message: err.message });
      } else if (err instanceof Error && err.message.includes("비밀번호")) {
        setFormError("password", { message: err.message });
      }
      // React Query의 error 상태는 loginMutation.error에서 관리됨
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6")}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to login to your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            {...register("email")}
            type="email"
            name="email"
            placeholder="user@hongkea.com"
            required
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            {...register("password")}
            name="password"
            type="password"
            required
          />
        </Field>
        {loginMutation.error && (
          <Field>
            <FieldError>
              {loginMutation.error instanceof Error
                ? loginMutation.error.message
                : "로그인에 실패했습니다"}
            </FieldError>
          </Field>
        )}

        <Field>
          <Button type="submit" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "로그인 중..." : "Login"}
          </Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <GoogleLoginButton />
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link
              href={AUTH_ROUTES.SIGNUP.url}
              className="underline underline-offset-4"
            >
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
};

export default LoginForm;

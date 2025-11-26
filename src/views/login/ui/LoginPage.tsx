import loginLeft from "@/../public/login/login-right.png";
import LoginForm from "@/widgets/emailLogin/ui/LoginForm";
import Image from "next/image";

const LoginPage = () => {
  return (
    <div className="grid min-h-[700px] px-0 md:px-10 lg:grid-cols-2">
      <div className="flex-colp-6 flex md:p-0">
        <div className="flex justify-center gap-2 md:justify-start"></div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src={loginLeft}
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
};

export default LoginPage;

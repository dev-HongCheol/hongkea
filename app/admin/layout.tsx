import { createClient } from "@/shared/lib/supabase/server";
import { SidebarProvider, SidebarTrigger } from "@/shared/ui/sidebar";
import AppSidebar from "@/widgets/adminSidebar/AppSidebar";
import { ReactNode } from "react";

const layout = async ({ children }: { children: ReactNode }) => {
  const supabase = await createClient();
  const { data: user, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(`Admin Auth Error: ${error.message}`);
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="max-h-[calc(100%-500px)] min-h-0 w-full">
        <div className="mb-2 h-8 bg-gray-200">
          <SidebarTrigger />
          {user.user?.email}
        </div>
        {children}
      </div>
    </SidebarProvider>
  );
};

export default layout;

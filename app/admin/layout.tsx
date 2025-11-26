import { SidebarProvider, SidebarTrigger } from "@/shared/ui/sidebar";
import AppSidebar from "@/widgets/adminSidebar/AppSidebar";
import { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="w-full">
        <SidebarTrigger />
        {children}
      </div>
    </SidebarProvider>
  );
};

export default layout;

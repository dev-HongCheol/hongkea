import { SidebarProvider, SidebarTrigger } from "@/shared/ui/sidebar";
import AppSidebar from "@/widgets/adminSidebar/AppSidebar";
import { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="w-full">
        <div className="mb-2 h-8 bg-gray-200">
          <SidebarTrigger />
        </div>
        {children}
      </div>
    </SidebarProvider>
  );
};

export default layout;

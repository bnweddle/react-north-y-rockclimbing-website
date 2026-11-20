import './App.css'
import { AppSidebar } from "@/nav/app-sidebar"
import { MobileBottomNav } from "@/nav/mobile-bottom-nav"
import RoutesPage from "@/pages/routes"
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

function App() {
  const currentPath = window.location.pathname

  return (
    <SidebarProvider className="h-dvh">
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col pb-[calc(var(--spacing)*14+env(safe-area-inset-bottom,0px))] md:pb-0">
        <div className="hidden shrink-0 items-center p-2 md:flex">
          <SidebarTrigger />
        </div>

        {(currentPath === "/" || currentPath === "/routes") && <RoutesPage />}
      </main>

      <div className="md:hidden">
        <MobileBottomNav currentPath={currentPath} />
      </div>
    </SidebarProvider>
  )
}

export default App

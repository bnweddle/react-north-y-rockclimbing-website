import './App.css'
import { AppSidebar } from "@/nav/app-sidebar"
import { MobileBottomNav } from "@/nav/mobile-bottom-nav"
import { navItems } from "@/nav/navigation"
import HomePage from "@/pages/home"
import RoutesPage from "@/pages/routes"
import ClassesPage from "@/pages/classes"
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

function App() {
  const currentPath = window.location.pathname
  const navigationPath = currentPath === "/routes/past" ? "/routes" : currentPath

  let page
  switch (currentPath) {
    case "/":
      page = <HomePage />
      break
    case "/routes":
      page = <RoutesPage key="active-routes" />
      break
    case "/routes/past":
      page = <RoutesPage key="past-routes" isPast />
      break
    case "/classes":
      page = <ClassesPage />
      break
    default:
      page = (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
          <h1>Page not found</h1>
          <a className="underline" href="/">Go to Home</a>
        </div>
      )
  }

  return (
    <SidebarProvider className="h-dvh min-h-0 overflow-hidden">
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      <main
        className="page-shell flex min-h-0 min-w-0 flex-1 flex-col pb-[calc(var(--spacing)*14+env(safe-area-inset-bottom,0px))] md:pb-0"
        data-nav-color={navItems.find((item) => item.url === navigationPath)?.color}
      >
        <div className="hidden shrink-0 items-center p-2 md:flex">
          <SidebarTrigger className="navigation-toggle" />
        </div>

        {page}
      </main>

      <div className="md:hidden">
        <MobileBottomNav currentPath={navigationPath} />
      </div>
    </SidebarProvider>
  )
}

export default App

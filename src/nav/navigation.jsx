// src/nav/navigation.jsx

import { CalendarDays, Home, Mountain } from "lucide-react"

export const navItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
    color: "red",
  },
  {
    title: "Classes",
    url: "/classes",
    icon: CalendarDays,
    color: "blue",
  },
  {
    title: "Routes",
    url: "/routes",
    icon: Mountain,
    color: "plum",
  },

]
import { useEffect, useState } from "react"
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon, UsersIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabaseClient"

const weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

function getMonthValue(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

function getMonthBounds(monthValue) {
  const [year, month] = monthValue.split("-").map(Number)
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 1)

  return {
    start,
    startDate: `${year}-${String(month).padStart(2, "0")}-01`,
    endDate: `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-01`,
  }
}

function formatMonth(date) {
  return new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(date)
}

function formatCalendarDate(value) {
  const [year, month, day] = value.split("-").map(Number)
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day))
}

function formatTime(value) {
  const [hourPart, minutePart] = value.split(":")
  const hour = Number(hourPart)
  const minute = Number(minutePart)
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return value

  const suffix = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 || 12
  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`
}

function shiftMonth(monthValue, amount) {
  const [year, month] = monthValue.split("-").map(Number)
  return getMonthValue(new Date(year, month - 1 + amount, 1))
}

export default function ClassesPage() {
  const currentMonth = getMonthValue(new Date())
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [monthClasses, setMonthClasses] = useState([])
  const [openClimbSessions, setOpenClimbSessions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const bounds = getMonthBounds(selectedMonth)

  useEffect(() => {
    let active = true
    const { startDate, endDate } = getMonthBounds(selectedMonth)

    async function loadSchedule() {
      setIsLoading(true)
      setLoadError(false)

      try {
        const [classesResult, sessionsResult] = await Promise.all([
          supabase
            .from("month_classes")
            .select("id, class_month, weekday, start_time, end_time, capacity, instructor")
            .eq("class_month", startDate)
            .order("weekday", { ascending: true })
            .order("start_time", { ascending: true }),
          supabase
            .from("open_climb_sessions")
            .select("id, session_date, instructor")
            .gte("session_date", startDate)
            .lt("session_date", endDate)
            .order("session_date", { ascending: true }),
        ])

        if (!active) return

        let failed = false
        if (classesResult.error) {
          console.error("Failed to load month classes:", classesResult.error)
          failed = true
        }
        if (sessionsResult.error) {
          console.error("Failed to load Open Climb sessions:", sessionsResult.error)
          failed = true
        }

        setMonthClasses(classesResult.data ?? [])
        setOpenClimbSessions(sessionsResult.data ?? [])
        setLoadError(failed)
      } catch (error) {
        if (!active) return
        console.error("Failed to load the Classes schedule:", error)
        setMonthClasses([])
        setOpenClimbSessions([])
        setLoadError(true)
      } finally {
        if (active) setIsLoading(false)
      }
    }

    loadSchedule()
    return () => {
      active = false
    }
  }, [selectedMonth])

  const classesByWeekday = monthClasses.reduce((groups, monthClass) => {
    const weekday = Number(monthClass.weekday)
    if (!groups.has(weekday)) groups.set(weekday, [])
    groups.get(weekday).push(monthClass)
    return groups
  }, new Map())

  return (
    <div className="info-page scrollbar-none min-h-0 flex-1 overflow-y-auto px-4 py-6 text-left md:px-8 md:py-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="m-0 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Classes</h1>
            <p className="text-sm text-muted-foreground">Explore the monthly climbing schedule.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border bg-card p-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              onClick={() => setSelectedMonth((month) => shiftMonth(month, -1))}
              disabled={selectedMonth <= currentMonth}
              aria-label="Previous month"
            >
              <ChevronLeftIcon aria-hidden="true" />
            </Button>
            <h2 aria-live="polite" className="month-label min-w-36 text-center font-semibold">{formatMonth(bounds.start)}</h2>
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              onClick={() => setSelectedMonth((month) => shiftMonth(month, 1))}
              aria-label="Next month"
            >
              <ChevronRightIcon aria-hidden="true" />
            </Button>
          </div>
        </header>

        <section aria-labelledby="open-climb-heading">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-secondary p-2 text-secondary-foreground">
                  <UsersIcon aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <CardTitle><h2 id="open-climb-heading" className="m-0 text-lg font-semibold text-card-foreground">Open Climb</h2></CardTitle>
                  <CardDescription>12:00–1:00 p.m. · Free for everyone, no registration required.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p role="status" className="text-muted-foreground">Loading schedule…</p>
              ) : openClimbSessions.length === 0 ? (
                <p className="rounded-lg bg-muted/50 p-4 text-muted-foreground">No Open Climb sessions are listed for this month.</p>
              ) : (
                <ul className="space-y-2">
                  {openClimbSessions.map((session) => (
                    <li key={session.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/50 p-4">
                      <span className="font-semibold">{formatCalendarDate(session.session_date)}</span>
                      <span className="text-muted-foreground">Instructor: {session.instructor}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="month-classes-heading">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-secondary p-2 text-secondary-foreground">
                  <CalendarDaysIcon aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <CardTitle><h2 id="month-classes-heading" className="m-0 text-lg font-semibold text-card-foreground">Month Classes</h2></CardTitle>
                  <CardDescription>
                    Regular monthly schedule. Check <a className="font-medium text-foreground underline underline-offset-4" href="/">Home News</a> for exceptions.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p role="status" className="text-muted-foreground">Loading schedule…</p>
              ) : monthClasses.length === 0 ? (
                <p className="rounded-lg bg-muted/50 p-4 text-muted-foreground">No month classes are listed for this month.</p>
              ) : (
                <div className="space-y-5">
                  {[...classesByWeekday.entries()].map(([weekday, groups]) => (
                    <div key={weekday} className="space-y-2">
                      <h3 className="text-sm font-semibold text-muted-foreground">{weekdays[weekday - 1] ?? "Other"}</h3>
                      <ul className="space-y-2">
                        {groups.map((monthClass) => (
                          <li key={monthClass.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/50 p-4">
                            <span className="flex items-center gap-2 font-semibold">
                              <ClockIcon aria-hidden="true" className="size-4 text-muted-foreground" />
                              {formatTime(monthClass.start_time)}–{formatTime(monthClass.end_time)}
                            </span>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-muted-foreground">Instructor: {monthClass.instructor}</span>
                              <Badge variant="secondary">Capacity: {monthClass.capacity}</Badge>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {loadError && (
          <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Part of the schedule could not be loaded. Please try again later.
          </p>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Class registrations are handled at the front desk.
        </p>
      </div>
    </div>
  )
}

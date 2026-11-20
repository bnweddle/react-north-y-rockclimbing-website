import { useEffect, useState } from 'react'
import { ChevronDownIcon, SparkleIcon, TriangleAlertIcon } from "lucide-react"
import { FaSkullCrossbones } from "react-icons/fa6"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import formatDate, { getRouteAgeStatus } from "@/lib/formatDate"
import { supabase } from "@/lib/supabaseClient"

const routeAgeIcons = {
  new: { Icon: SparkleIcon, label: "New route" },
  aging: { Icon: TriangleAlertIcon, label: "Route is at least 9 months old" },
  overdue: { Icon: FaSkullCrossbones, label: "Route is more than a year old" },
}

const naturalOrder = new Intl.Collator("en", { numeric: true, sensitivity: "base" })

function filterOptions(routes, field) {
  return [...new Set(routes
    .map((route) => route[field])
    .filter((value) => value != null && value !== "")
    .map(String))].sort(naturalOrder.compare)
}

function RouteFilter({ label, value, onChange, children }) {
  return (
    <div className="relative">
      <Badge
        render={<select />}
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        variant={value ? "default" : "secondary"}
        className="min-h-11 cursor-pointer appearance-none px-3 pr-8 text-sm"
      >
        {children}
      </Badge>
      <ChevronDownIcon aria-hidden="true" className={`pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 ${value ? "text-primary-foreground" : "text-secondary-foreground"}`} />
    </div>
  )
}

function compareRouteDates(a, b, order) {
  const first = Date.parse(a.date_created)
  const second = Date.parse(b.date_created)

  if (Number.isNaN(first)) return Number.isNaN(second) ? 0 : 1
  if (Number.isNaN(second)) return -1
  return order === "oldest" ? first - second : second - first
}

function compareRouteGrades(a, b, order) {
  const first = a.route_grade
  const second = b.route_grade

  if (!first) return second ? 1 : 0
  if (!second) return -1
  return order === "easiest"
    ? naturalOrder.compare(first, second)
    : naturalOrder.compare(second, first)
}

function RouteDateBadge({ date }) {
  const indicator = routeAgeIcons[getRouteAgeStatus(date)]

  return (
    <Badge variant="secondary" className="gap-2 text-lg [&>svg]:size-7! [&>svg.lucide]:stroke-[2.5]" style={{ fontFamily: "Bellfast" }}>
      {indicator && <indicator.Icon aria-hidden="true" />}
      <span className="relative top-[0.1em]">{formatDate(date)}</span>
      {indicator && <span className="sr-only">{indicator.label}</span>}
    </Badge>
  )
}

function textColorStyle(value) {
  if (!value) return {}

  if (/^linear-gradient\s*\(/i.test(value.trim())) {
    return {
      backgroundImage: value,
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }
  }

  return { color: value }
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState([])
  const [sortOrder, setSortOrder] = useState("")
  const [wall, setWall] = useState("")
  const [grade, setGrade] = useState("")

  const walls = filterOptions(routes, "wall")
  const grades = filterOptions(routes, "route_grade")
  const visibleRoutes = routes.filter((route) => (
    (!wall || String(route.wall) === wall) &&
    (!grade || route.route_grade === grade)
  ))
  if (sortOrder === "newest" || sortOrder === "oldest") {
    visibleRoutes.sort((a, b) => compareRouteDates(a, b, sortOrder))
  } else if (sortOrder === "easiest" || sortOrder === "hardest") {
    visibleRoutes.sort((a, b) => compareRouteGrades(a, b, sortOrder))
  }
  const noMatches = routes.length > 0 && visibleRoutes.length === 0

  useEffect(() => {
    async function getRoutes() {
      const { data, error } = await supabase
        .from('routes')
        .select()
        .order('wall', { ascending: true })
        .order('date_created', { ascending: false })

      if (error) {
        console.error(error)
        return
      }

      setRoutes(data)
    }

    getRoutes()
  }, [])

  useEffect(() => {
    let active = true
    const loadedFonts = []

    routes.forEach((route) => {
      if (!route.font_path) return

      const { data } = supabase.storage.from('Fonts').getPublicUrl(route.font_path)
      const font = new FontFace(`route-font-${route.route_id}`, `url(${JSON.stringify(data.publicUrl)})`)

      font.load().then((loadedFont) => {
        if (active) {
          document.fonts.add(loadedFont)
          loadedFonts.push(loadedFont)
        }
      }).catch((error) => {
        console.error(`Failed to load font for route ${route.route_id}:`, error)
      })
    })

    return () => {
      active = false
      loadedFonts.forEach((font) => document.fonts.delete(font))
    }
  }, [routes])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
      <div role="group" aria-label="Route filters" className="flex shrink-0 flex-wrap justify-center gap-2">
        <RouteFilter label="Sort" value={sortOrder} onChange={setSortOrder}>
          <option value="">Sort: Wall order</option>
          <option value="newest">Sort: Newest first</option>
          <option value="oldest">Sort: Oldest first</option>
          <option value="easiest">Sort: Easiest first</option>
          <option value="hardest">Sort: Hardest first</option>
        </RouteFilter>
        <RouteFilter label="Wall" value={wall} onChange={setWall}>
          <option value="">All walls</option>
          {walls.map((value) => <option key={value} value={value}>Wall #{value}</option>)}
        </RouteFilter>
        <RouteFilter label="Route grade" value={grade} onChange={setGrade}>
          <option value="">All grades</option>
          {grades.map((value) => <option key={value} value={value}>{value}</option>)}
        </RouteFilter>
      </div>
      <Carousel
        key={JSON.stringify([sortOrder, wall, grade])}
        opts={{ align: 'start' }}
        orientation="vertical"
        className="flex min-h-0 min-w-0 flex-1 flex-col gap-2"
        aria-label="Routes"
      >
        {noMatches && (
          <p role="status" className="p-4 text-center text-sm text-muted-foreground">
            No routes match these filters.
          </p>
        )}
        <CarouselContent className="mt-0 h-full" viewportClassName="min-h-0 flex-1">
          {visibleRoutes.map((route) => (
            <CarouselItem key={route.route_id} className="basis-auto pt-1">
              <div className="p-1">
                <Card style={{ background: route.hold_color }}>
                  <CardContent className="@container">
                    <div className="mb-2 grid grid-cols-2 items-center gap-2 p-2 @min-[320px]:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
                      <div className="col-start-1 row-start-1 justify-self-start">
                        <RouteDateBadge date={route.date_created} />
                      </div>
                      <Badge variant="secondary" className="col-span-2 row-start-2 justify-self-center text-lg @min-[320px]:col-span-1 @min-[320px]:col-start-2 @min-[320px]:row-start-1" style={{ fontFamily: "Bellfast" }}>
                        <span className="relative top-[0.1em]">{`WALL #${route.wall}`}</span>
                      </Badge>
                      <Badge variant="secondary" className="col-start-2 row-start-1 justify-self-end text-xl text-black @min-[320px]:col-start-3" style={{ fontFamily: "Bellfast" }}>
                        <span className="relative top-[0.1em]">
                          {route.route_grade}
                        </span>
                      </Badge>
                    </div>
                    <div className="flex flex-col p-2" style={{ background: "white" }}>
                      <span
                        className="text-3xl font-semibold"
                        style={{
                          ...textColorStyle(route.color_value),
                          fontFamily: route.font_path ? `route-font-${route.route_id}` : undefined,
                        }}
                      >
                        {route.route_name}
                      </span>
                      <span style={{ fontFamily: "Bellfast", fontSize: "20px" }}>{route.route_notes}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex shrink-0 justify-center gap-2" hidden={noMatches}>
          <CarouselPrevious className="static size-11 translate-x-0" />
          <CarouselNext className="static size-11 translate-x-0" />
        </div>
      </Carousel>
    </div>
  )
}

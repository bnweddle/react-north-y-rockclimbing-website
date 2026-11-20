import { useEffect, useState } from "react"
import { BellIcon, CircleHelpIcon, ClipboardListIcon } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabaseClient"

const faqQuestions = [
  { question: "How can I get started?", answer: "Answer coming soon." },
  { question: "Do I need to sign a waiver?", answer: "Answer coming soon." },
  { question: "What gear do I need?", answer: "Answer coming soon." },
  { question: "Where can I purchase gear?", answer: "Answer coming soon." },
  { question: "When can I climb?", answer: "Answer coming soon." },
  { question: "What type of classes are offered?", answer: "Answer coming soon." },
  { question: "How do I sign up for classes?", answer: "Answer coming soon." },
  { question: "Where else can I climb?", answer: "Answer coming soon." },
  { question: "What should I climb?", answer: "Answer coming soon." },
  { question: "What is a route?", answer: "Answer coming soon." },
  { question: "What is the grading system?", answer: "Answer coming soon." },
  { question: "What is an Auto Belay?", answer: "Answer coming soon." },
  { question: "How do I get certified / re-certified?", answer: "Answer coming soon." },
  { question: "What do I do if a hold spins?", answer: "Answer coming soon." },
  { question: "Is there an age limit for climbing?", answer: "Answer coming soon." },
  { question: "What is the climbing lingo I should be aware of?", answer: "Answer coming soon." },
]

const ruleGroups = [
  {
    title: "Before Climbing",
    rules: [
      "You must wear closed-toe shoes and a harness.",
      "You must have a belay and/or auto-belay certification.",
      "All climbers must have a signed waiver for the current calendar year.",
      "Climbers must be at least 4 years old to be belayed or use the auto-belay.",
    ],
  },
  {
    title: "While Climbing",
    rules: [
      "When using an auto-belay, climb only on the wall it is mounted on (#6 or #7).",
      "Do not walk in front of anyone who is actively belaying.",
    ],
  },
  {
    title: "After Climbing",
    rules: [
      "Properly lock the auto-belays and return the key to the front desk.",
      "Return all gear borrowed from the front desk.",
      "Remove any knots from the ropes, then daisy-chain the ropes and clip them back.",
    ],
  },
]

function News() {
  const [notices, setNotices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let active = true

    async function loadNews() {
      try {
        const now = new Date().toISOString()
        const { data, error } = await supabase
          .from("news")
          .select("id, title, message, urgency, published_at, expires_at")
          .lte("published_at", now)
          .gt("expires_at", now)
          .order("published_at", { ascending: false })

        if (!active) return

        if (error) {
          console.error("Failed to load Home News:", error)
          setLoadError(true)
          return
        }

        const sortedNotices = [...(data ?? [])]
          .sort((first, second) => {
            if (first.urgency !== second.urgency) {
              return first.urgency === "important" ? -1 : 1
            }
            return Date.parse(second.published_at) - Date.parse(first.published_at)
          })
          .slice(0, 2)

        setNotices(sortedNotices)
      } catch (error) {
        if (!active) return
        console.error("Failed to load Home News:", error)
        setLoadError(true)
      } finally {
        if (active) setIsLoading(false)
      }
    }

    loadNews()
    return () => {
      active = false
    }
  }, [])

  if (!isLoading && !loadError && notices.length === 0) return null

  return (
    <section aria-labelledby="news-heading">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-secondary p-2 text-secondary-foreground">
              <BellIcon aria-hidden="true" className="size-5" />
            </span>
            <div>
              <CardTitle><h2 id="news-heading" className="m-0 text-lg font-semibold text-card-foreground">News</h2></CardTitle>
              <CardDescription>Updates from the gym</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p role="status" className="text-muted-foreground">Loading News…</p>
          ) : loadError ? (
            <p role="alert" className="text-destructive">News could not be loaded. Please try again later.</p>
          ) : (
            <ul className="space-y-3">
              {notices.map((notice) => (
                <li key={notice.id} className="rounded-lg bg-muted/50 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {notice.urgency === "important" && <Badge variant="destructive">Important</Badge>}
                    <h3 className="font-semibold">{notice.title}</h3>
                  </div>
                  <div className="mt-1 whitespace-pre-wrap text-muted-foreground">{notice.message}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  )
}

export default function HomePage() {
  return (
    <div className="info-page scrollbar-none min-h-0 flex-1 overflow-y-auto px-4 py-6 text-left md:px-8 md:py-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <header className="space-y-1">
          <h1 className="m-0 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Home</h1>
          <p className="text-sm text-muted-foreground">Gym updates, rules, and frequently asked questions.</p>
        </header>
        <News />

        <section aria-labelledby="rules-heading">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-secondary p-2 text-secondary-foreground">
                  <ClipboardListIcon aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <CardTitle><h2 id="rules-heading" className="m-0 text-lg font-semibold text-card-foreground">Rules</h2></CardTitle>
                  <CardDescription>What to know before you climb</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {ruleGroups.map((group, index) => (
                  <div key={group.title} className="space-y-3">
                    {index > 0 && <Separator />}
                    <div>
                      <h3 className="font-semibold text-card-foreground">{group.title}</h3>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        {group.rules.map((rule) => <li key={rule}>{rule}</li>)}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="faq-heading">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-secondary p-2 text-secondary-foreground">
                  <CircleHelpIcon aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <CardTitle><h2 id="faq-heading" className="m-0 text-lg font-semibold text-card-foreground">FAQs</h2></CardTitle>
                  <CardDescription>Common questions about climbing</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion>
                {faqQuestions.map((faq, index) => (
                  <AccordionItem key={faq.question} value={String(index)}>
                    <AccordionTrigger className="min-h-12 items-center gap-4">{faq.question}</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}

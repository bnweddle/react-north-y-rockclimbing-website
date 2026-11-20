# Climbing site: routes, schedule, and visitor information

## Proposed organization

Use three main destinations: **Home**, **Routes**, and **Classes**. Home is the landing page and contains **News**, **FAQs** (starting with getting-started information), and **Rules**. Keep News on Home only: one or two timely notices, not a feed or archive. Give **Past Routes** its own URL and link to it from Routes rather than adding a main navigation item.

## Implementation plan

1. **Split active and past routes.** At the Supabase query boundary, use `date_to_remove IS NULL` for active routes and `IS NOT NULL` for Past Routes. Any populated value means the route has already come down, regardless of the date value. Keep the existing skull on active route cards; the current code derives it from route age, not removal status. Use a plainly labeled removal date on past cards and sort most recently removed first. Reuse route display and filters where useful, with filter choices based on the current view.
2. **Add page structure and navigation.** Update the app's page mapping and shared desktop/mobile navigation. Render the new Home at `/` (which currently renders Routes), keep active routes at `/routes`, and add `/routes/past` and `/classes`. Add no `/news`, `/schedule`, or `/start-here` page. Verify direct links and mobile navigation.
3. **Model Classes and News in Supabase.** Use three small tables (see the proposed schema below). One `month_classes` row represents one group for the whole month. One `open_climb_sessions` row represents one actual Saturday. Use a single `instructor` text column in each class table; no instructor table or month-class meeting rows.
4. **Build Classes as a read-only monthly list.** Default to this month with access to upcoming months. Show month classes by weekday and time, and Open Climb by actual date. Label month-class times as the regular schedule and point visitors to Home News for exceptions. Display capacity for month classes, not an available-spots count. Open Climb has no capacity limit. State clearly: "All registrations are handled at the front desk." No site registration or booking.
5. **Add Home News backed by Supabase.** Put News near the top of Home. Show up to two currently published notices, urgent first and newest first within each urgency level. Label urgent notices visibly rather than relying on color alone. Hide the section when no notices are active; distinguish a failed load from an empty result. No dedicated page or archive.
6. **Handle month-class exceptions in News only.** A holiday notice names the exact affected date and group and says what changed. Leave the regular monthly row unchanged; no skipped-date field, child meetings, or automatic schedule changes. Visitors can use Classes to see the regular schedule. To protect a time-sensitive announcement from being bumped off Home, mark it urgent and set its expiry after the last affected meeting, then check which two notices are visible. For a canceled Open Climb, remove its session row so it is not listed as happening, and announce the cancellation in News if visitors need to be notified.
7. **Add static Home FAQs and Rules.** Use the exact FAQ questions listed below and leave the answers for the user to fill in. Do not add questions or draft answers. Use gym-approved wording for Rules.
8. **Verify visitor and staff update flows.** Check that Home replaces Routes at `/`, all direct links work, and desktop/mobile navigation stays consistent. Verify route filtering and removal states, skipped and canceled Open Climb Saturdays are not listed, and multiple month classes in the same month. Check news priority, the two-notice limit, draft/future/expired visibility, no active notices versus a load error, and a holiday notice that does not alter the regular month-class row. Verify public clients cannot write, authorized edits appear without redeploying, and there are no booking controls.

## FAQ questions

- How can I get started?
- Do I need to sign a waiver?
- What gear do I need?
- Where can I purchase gear?
- When can I climb?
- What type of classes are offered?
- How do I sign up for classes?
- Where else can I climb?
- What should I climb?
- What is a route?
- What is the grading system?
- What is an Auto Belay?
- How do I get certified / re-certified?
- What do I do if a hold spins?
- Is there an age limit for climbing?
- What is the climbing lingo I should be aware of?

## Proposed Supabase schema

| Table | Columns and rules |
| --- | --- |
| `month_classes` | `id` (primary key), `class_month` (`date`, first day of the month), `weekday` (`smallint`, ISO Monday = 1 through Sunday = 7), `start_time` and `end_time` (`time`, gym-local; end after start), `capacity` (`integer`, greater than zero), `instructor` (`text`, required). Separate groups can share a month and weekday, so do not make those two fields unique together. |
| `open_climb_sessions` | `id` (primary key), `session_date` (`date`, unique and Saturday only), `instructor` (`text`, required). The Classes page uses one fixed noon–1 p.m. gym-local time for Open Climb. No editable time or capacity fields on these rows. |
| `news` | `id` (`integer` primary key), `title` and `message` (`text`, required), `urgency` (`text`, `standard` or `urgent`, defaults to `standard`), `published_at` and `expires_at` (`timestamptz`; null publication time means draft, published notices must have an expiry later than publication). |

- Enable row-level security for the three tables. Permit public reads for the class listings and only active News (`published_at <= now()` and `expires_at > now()`). Restrict writes to authorized Supabase editors. Continue using the existing publishable-key client in the frontend.
- Keep date and time fields in gym-local calendar terms, not UTC instants; news publication and expiry are actual instants and use `timestamptz`.
- Example workflow: enter a Tuesday month group once with `17:45` to `18:30`, capacity `10`, and one instructor. Add a row for each Saturday that actually has Open Climb. If a holiday cancels one Tuesday, post the affected date on Home News; do not edit the month group's usual weekday or hours.

## Supabase SQL Editor

### 1. Create all three tables

Run this block once in **Supabase Dashboard → SQL Editor → New query**. It assumes these three table names are unused in `public`. If any already exist, compare their schemas first rather than dropping or overwriting them. The script does not touch `public.routes`.

```sql
begin;

create table public.month_classes (
  id bigint generated always as identity primary key,
  class_month date not null
    check (isfinite(class_month) and extract(day from class_month) = 1),
  weekday smallint not null check (weekday between 1 and 7),
  start_time time without time zone not null,
  end_time time without time zone not null,
  capacity integer not null check (capacity > 0),
  instructor text not null check (btrim(instructor) <> ''),
  check (end_time > start_time)
);

create table public.open_climb_sessions (
  id bigint generated always as identity primary key,
  session_date date not null unique
    check (isfinite(session_date) and extract(isodow from session_date) = 6),
  instructor text not null check (btrim(instructor) <> '')
);

create table public.news (
  id integer generated always as identity primary key,
  title text not null check (btrim(title) <> ''),
  message text not null check (btrim(message) <> ''),
  urgency text not null default 'standard'
    check (urgency in ('standard', 'urgent')),
  published_at timestamptz,
  expires_at timestamptz,
  check (
    published_at is null
    or (expires_at is not null and expires_at > published_at)
  )
);

alter table public.month_classes enable row level security;
alter table public.open_climb_sessions enable row level security;
alter table public.news enable row level security;

revoke all on table public.month_classes, public.open_climb_sessions, public.news
  from public, anon, authenticated;
grant select on table public.month_classes, public.open_climb_sessions, public.news
  to anon, authenticated;

create policy "Read month classes"
  on public.month_classes for select to anon, authenticated
  using (true);

create policy "Read Open Climb sessions"
  on public.open_climb_sessions for select to anon, authenticated
  using (true);

create policy "Read active news"
  on public.news for select to anon, authenticated
  using (published_at <= now() and expires_at > now());

commit;
```

The browser can read class listings and active news but cannot write to any of these tables. Editors use authorized Supabase Dashboard access; being signed in to the website does not make someone an editor.

### 2. Insert examples into the two class tables

Replace the example dates and instructor names before running either block against live data. `class_month` is the first day of the month, not the first meeting. Weekdays use Monday `1` through Sunday `7` (Tuesday `2`, Wednesday `3`, Friday `5`). Times use 24-hour gym-local time. Run the inserts once for a given set of rows: rerunning the first block creates duplicate listings, and rerunning the second with the same Saturdays fails the unique-date constraint.

**Month Classes:** One row per group for the entire month.

```sql
insert into public.month_classes
  (class_month, weekday, start_time, end_time, capacity, instructor)
values
  (date '2026-12-01', 2, time '17:45', time '18:30', 10, 'Example Instructor A'),
  (date '2026-12-01', 3, time '17:45', time '18:30', 5, 'Example Instructor B'),
  (date '2026-12-01', 5, time '17:45', time '18:30', 10, 'Example Instructor C');
```

**Open Climb:** One row per scheduled Saturday. There is no row for an unscheduled Saturday, and no time or capacity fields to fill in.

```sql
insert into public.open_climb_sessions (session_date, instructor)
values
  (date '2026-12-05', 'Example Instructor A'),
  (date '2026-12-12', 'Example Instructor B'),
  (date '2026-12-19', 'Example Instructor C');
```

### 3. Optional: Insert a draft holiday notice

The draft below is not public until an editor sets `published_at` and `expires_at`. Give the expiration an explicit time-zone offset and set it after the last affected meeting. Leave the regular Friday class row unchanged.

```sql
insert into public.news (title, message, urgency)
values (
  'Friday class canceled on December 25',
  'The Friday 5:45 p.m. month class will not meet on December 25, 2026.',
  'urgent'
);
```

## Notes

- Confirm the Supabase column and any existing populated values before applying the route split. Staff should leave `date_to_remove` null until the route is actually removed.
- Keep reference material static; use Supabase for standard class and Open Climb sessions, instructors, and timely Home News.
- The SQL is provided for manual execution and has not been run against the Supabase project. The application does not create or alter Supabase tables.

# React + Vite

Route cards use `color_value` for their text color and load `font_path` from
the public Supabase Storage bucket named `Fonts`. Store `font_path` as the
object path relative to that bucket. Choose text colors that contrast with the
card background. If a font cannot be loaded, the browser uses its default font
and the error is logged to the console.

The app's main destinations are **Home** (`/`), **Routes** (`/routes`), and
**Classes** (`/classes`). Past routes are at `/routes/past` and linked from the
Routes page.

The pages use the existing Supabase client. Ensure the existing `routes` table
has a `date_to_remove` column; null values are active and populated values are
shown under Past Routes. Apply the schema and row-level
security SQL in [plan.md](./plan.md) before expecting Classes or Home News to
load. The browser only reads these tables; manage class schedules and News
through authorized Supabase Dashboard access. FAQ questions are displayed
without answers until gym-approved responses are provided.

## Manual Cloudflare Workers deployment

1. Run `npm run build` in the app folder.
2. ZIP the **contents** of `dist`, not the `dist` folder itself. The ZIP root
   should contain `index.html`, `routes.html`, `routes/past.html`, `classes.html`,
   and `assets/`.
3. Upload the ZIP to the existing Worker serving `northyrockclimbing.com`. Open
   and refresh `/routes`, `/routes/past`, and `/classes` to verify the deployment.

With [default Workers HTML handling](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/),
Cloudflare serves these `.html` files at their extensionless URLs. Each entry
loads the same app, which selects the page from the URL. When adding a page,
add its matching `.html` path to `staticRouteEntries` in
[vite.config.js](./vite.config.js) before rebuilding.

## Installing Bottom Navigation

In the `my-app` folder, set `SHADCNIO_TOKEN` in `.env` using your token from the [shadcn.io account page](https://www.shadcn.io/dashboard/account). Create `.env` if it is missing; Git ignores it.

```powershell
npx shadcn@latest add @shadcnio/bottom-navigation
```

## Vite plugins

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

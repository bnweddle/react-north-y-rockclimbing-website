# React + Vite

Route cards use `color_value` for their text color and load `font_path` from
the public Supabase Storage bucket named `Fonts`. Store `font_path` as the
object path relative to that bucket. Choose text colors that contrast with the
card background. If a font cannot be loaded, the browser uses its default font
and the error is logged to the console.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

The **Routes** item in the desktop sidebar and mobile bottom bar opens `/routes`,
which renders [the Routes page](./src/pages/routes.jsx). That page owns the
carousel, route data, and custom font loading. The carousel fits the available
page height and keeps its controls above the mobile bottom bar. Use **Sort** to
keep wall order or sort by set date (newest or oldest first) or climbing grade
(easiest or hardest first). Sorting applies across walls and works with the
wall and grade filters. Configure production hosting to serve
`index.html` for app paths so direct links and refreshes work.

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

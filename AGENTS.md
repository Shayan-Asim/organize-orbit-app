<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Planner architecture
- Keep the planner as a single index route with view tabs; the requested experience is one workspace rather than separate content pages.
- Store browser-only task data and theme in effects and event handlers, never during SSR, to keep hydration stable.
- Keep pure task, export and streak helpers in the planner library and isolate the focus timer in a reusable component for testability.

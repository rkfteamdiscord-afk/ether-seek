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

- Keep seasonal offer terms in a browser-safe shared module, tested separately from presentation; this avoids conflicting promotion details across the page.
- Keep Halloween decorations in a reusable, aria-hidden presentation module with pointer-events disabled; decorations must not interfere with reading or contacting the studio.
- Distribute seasonal motifs once per page between chapter-specific edge spaces and small attached element corners, with a separate illustration catalog and reduced-motion-safe layered fog; this avoids repetitive scenery and protects readable content and clickable contacts.
- Keep the Halloween arrival, pumpkin reveal and witch duel in a browser-safe presentation module driven by an explicit page phase; this synchronizes decoration visibility without blocking access to the studio or storing visitor data.
- Measure the header logo for the witch pickup and animate only that element; render procedural weather in a separate browser-only canvas effect to preserve the portrait and avoid viewport-dependent pickup coordinates.
- Keep the hat-wearing spiders in their own aria-hidden, pointer-events-free overlay that writes positions straight to the DOM and stays hidden during the arrival; they must never block reading or clicking the contacts.
- Keep the roaming ghosts behind the content. The guide ghost's tours, ready-made answers and AI answers say only what the page says (prices and delays are never invented) and read the promotion from the shared offer module; typed questions go to the server-only Groq function in src/lib/ghost-ai.ts, whose key lives in the GROQ_API_KEY environment variable and never in the code or the browser, then to the keyless browser fallback in src/lib/ghost-browser-ai.ts, then to the built-in answers; the shared rules live in src/lib/ghost-prompt.ts; nothing is stored, the panel says questions go to an AI service, only the ghost's button and panel take clicks, and its zombie-finger wand stays aria-hidden.
- Keep the guardian (scripts/gardien, .github/workflows/gardien.yml) to one small, reviewed change per analysis on a rotating theme (bugs first, then decorations reusing existing components, the ghost's answers from the page's facts, small visual or accessibility details): at most three exact replacements and about 40 added lines, allowed files only, sensitive files denied, no links, scripts, network access or imports added, a second AI review, and a full typecheck, build and test before it pushes; its public GitHub journal must never contain secrets. Visitors chatting with the ghost can never change the site.
- Keep the admin panel needing no secret: it reads the guardian's public GitHub journal in the browser and trusts only comments by the guardian itself; its code is stored only as a SHA-256 hash and merely keeps the panel out of casual sight, so never show anything there that is not already public.

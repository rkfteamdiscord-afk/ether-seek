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
- Keep the roaming ghosts behind the content. The guide ghost's tours, ready-made answers and AI answers say only what the page says (prices and delays are never invented) and read the promotion from the shared offer module; typed questions go to the server-only Groq function in src/lib/ghost-ai.ts, whose key lives in the GROQ_API_KEY environment variable and never in the code or the browser, with the built-in answers as fallback; nothing is stored, the panel says questions go to an AI service, only the ghost's button and panel take clicks, and its zombie-finger wand stays aria-hidden.
- Keep the guardian (scripts/gardien, .github/workflows/gardien.yml) limited to one small, reviewed change per analysis: allowed files only, sensitive files denied, no links, scripts, network access or imports added, a second AI review, and a full typecheck, build and test before it pushes; its public GitHub journal must never contain secrets.
- Keep the admin panel's code in the ADMIN_CODE secret and check it on the server only, with lockout after repeated failures and a signed HttpOnly session cookie; never put the code or any key in the repository or the client bundle.

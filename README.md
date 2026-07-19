# Six Degrees (working title)

*N.B. This Readme was prepared by Claude AI. All actual code is human-engineered.*

A web game based on Six Degrees of Kevin Bacon: connect a given actor to Kevin
Bacon in six steps or fewer by chaining shared movie credits.

Personal project, no fixed deadline. Also being used as a chance to pick up a
new language/technology on the backend.

## Game design

### Core loop

- Player is given a starting actor and a connection budget (currently
  proposed at 15). This budget is a **session-long health meter** — it only
  changes on submit (win/loss), not while a chain is being drafted.
- They build a chain to Kevin Bacon, one link per row:
  `{actor} was in [movie search] with [actor search]`.
- A separate **"steps remaining" draft counter** (max 6) tracks how many
  rows are left in the *current* chain attempt, independent of the health
  budget. "Add row" disables at 6. "Submit" only enables once the last actor
  in the chain is Kevin Bacon. This counter resets with each new attempt.
- On submit, the chain is validated against real cast data.
  - **Valid**: adds a flat 1 point to the health budget. (Bonus points for
    unusually short or "exotic" chains are a planned V2 addition — see
    Stretch features — but MVP ships with flat scoring only.) The chain is
    added to a growing graph visualization centered on Kevin Bacon. The
    movies and actors used are now consumed from the pool.
  - **Invalid**: flat 6-point penalty to the health budget regardless of
    chain length. The point asymmetry is intentional — a player can absorb
    far fewer wrong chains than the bonus earned from a right one. The
    specific incorrect row(s) are highlighted so the player can fix just
    those and resubmit, rather than losing correct work along with the
    penalty. A manual "reset chain" button is also available for when a
    draft is unworkable and the player wants to start the attempt over.
    Failed attempts do **not** consume anything from the movie/actor pool —
    only successfully submitted chains do.
- Every movie and actor can only be used once per session (on success) —
  used options show grayed out in future search boxes. As the well-known,
  easy connections get used up over a session, remaining chains necessarily
  get more obscure — this scarcity is intentional difficulty design, not an
  accident to tune away.
- Play is a **single continuous session** against one growing graph (not
  separate difficulty modes). Win conditions are milestone tiers: beginner
  at 10 successful chains, medium at 20, expert at 30. On hitting a
  milestone the player is told they've won that tier and offered the choice
  to stop or keep playing toward the next one (2048-style). Wall of Fame
  entry requires exhausting every Kevin Bacon movie.

### Starting actor selection

- **Superseded the original Oscar-nominee seed list** (Best
  Actor/Actress/Supporting Actor/Supporting Actress, last 50 years) in favor
  of a **Wikidata SPARQL–derived seed list**. The nominee-only list was too
  narrow a proxy for "broadly recognized" — it captures critical acclaim,
  not fame, and misses hugely recognizable actors (blockbuster/franchise
  stars especially) who were never nominated. TMDB's own "popular people"
  endpoint was considered and rejected as the alternative: it's a
  current-velocity signal (recent views, watchlist adds, release activity),
  which would skew the pool toward whoever is trending this month and drop
  durably-famous-but-currently-quiet actors — the opposite of what a stable
  seed list needs.
- Candidate query, run once against Wikidata's public SPARQL endpoint (not a
  live runtime dependency — same "built once" philosophy as the original
  plan, just a different one-time source):
  - Filter to humans with occupation "actor" **and an English Wikipedia
    sitelink** (presence check, not a ranking signal — this is the
    Anglophone-recognizability gate).
  - Rank/threshold by **total sitelink count across all Wikipedia
    languages** (a durable, cumulative notability signal, not TMDB's
    live/trending `popularity`).
  - Pull the **TMDB person ID directly via Wikidata's `P4985` property**
    where present, rather than matching by name afterward — sidesteps
    fragile fuzzy-matching (same names, diacritics, disambiguation)
    entirely. Candidates without a mapped TMDB ID are excluded; for anyone
    famous enough to clear the sitelink threshold this is a small loss.
- **Anglophone filmography-crossover filter**, replacing the old "minimum
  filmography size" heuristic (which was too blunt — a prolific but
  entirely siloed non-English-language filmography would have passed it).
  Citizenship/nationality-based filtering was considered and deliberately
  **rejected** as the mechanism for this, on both principled grounds
  (filtering people by identity) and accuracy grounds (an actor's
  nationality isn't actually what determines whether their work connects
  into the graph this game is built on — their filmography is). Concretely:
  for each SPARQL candidate, fetch TMDB's `/person/{id}/movie_credits` (one
  call per person — the endpoint returns a full filmography in a single
  response) and require some minimum count of `original_language == "en"`
  credits. This targets actual connectivity to the Hollywood/English-language
  credit graph directly, so e.g. a Bollywood star with genuine English-language
  crossover work correctly passes, while one without doesn't — regardless of
  either actor's nationality.
  - Implementation note: one-time/offline Go script, not a request-time
    dependency. Given the volume (low thousands of candidates at most, each
    needing one credits lookup), a bounded-concurrency worker pool
    (goroutines + a small fixed in-flight limit, e.g. 5–10) comfortably
    clears the batch without bursting hard enough to risk throttling.
    Fetched results should be cached to disk keyed by TMDB ID as the script
    runs, so re-runs (tuning thresholds, resuming after a crash) don't
    re-fetch already-processed candidates.
- Working assumption unchanged from the original design: in practice,
  virtually all candidates clearing the above filters have *some* valid path
  to Bacon within 6 steps, given the well-documented "small world" structure
  of the film collaboration graph and Bacon's unusually high connectivity
  across genres and decades. Remaining hard cases are treated as intentional
  difficulty variance, consistent with the scarcity design above — not
  something to eliminate.
- Search queries **TMDB live**, with local caching as a side effect, rather
  than only searching a subset already cached from prior sessions —
  otherwise a real-but-hard path could exist yet be unenterable simply
  because no one had searched that intermediate movie/actor yet.
- Selection is still intended to be **weighted, not uniform**, to avoid
  surfacing candidates a modern player is unlikely to recognize — but the
  original two-signal design (TMDB popularity percentile + year-of-nomination
  recency decay) was built around the nominee list's structure and needs
  revisiting now that the base source is sitelink-ranked rather than
  nomination-year-ranked. Sitelink count is already a fairly durable
  proxy on its own (it doesn't have TMDB `popularity`'s day-to-day-drift
  problem, which was the main thing the old two-signal blend was working
  around), so the weighting scheme may end up simpler than originally
  planned — exact approach still open, to be worked out once there's a
  real candidate list to evaluate against.

### Stretch features (post-MVP / V2)

- **Bonus scoring mechanic**: rewarding short/exotic chains, on top of MVP's
  flat 1-point-per-valid-chain scoring. Deferred entirely — the game is
  playable without it, and it'll likely be easier to design once there's a
  running game to observe rather than in the abstract. Direction to keep in
  mind for the data model even before it's implemented, so nothing has to
  be backfilled later:
  - Use TMDB's `popularity` field (and `vote_count` as a sanity check) as
    the obscurity signal for both movies and people, rather than building a
    custom metric — it's free, already computed, and avoids the cold-start
    problem a graph-degree-based metric would have under the lazy-caching
    data approach.
  - Threshold for "obscure enough to score" should be a **percentile within
    our own captured dataset**, not a fixed absolute cutoff — TMDB
    popularity is unbounded, heavily skewed, and drifts over time as the
    platform's scoring and our dataset both change.
  - Movie obscurity should be weighted more heavily than actor obscurity
    per link.
  - A chain's obscurity score should likely be driven by its single most
    obscure link, not an average — rewards the one clever find rather than
    diluting it.
  - Practical implication for MVP: capture `popularity` and `vote_count`
    when ingesting movie/person data from TMDB even though nothing uses
    them yet.
- **Themed challenges**: constrain a chain to a category, e.g. only linking
  through 1980s movies, or only comedies. Deferred because it needs
  genre/year metadata ingested up front and a second layer of validation
  (connection-valid *and* satisfies the constraint) beyond the core loop.

## Technical stack

### Decided

- **Frontend**: Vite + React SPA. Chosen over Next.js and React Router v7
  (framework mode) because this app is an interactive tool, not
  SEO/content-driven, so SSR/RSC buys little. A plain SPA also decouples the
  frontend entirely from the backend language choice, which matters since
  the backend is intended to be a professional-development opportunity to
  try something new.
- **Backend language: Go.** Considered against Elixir as the two
  professional-development candidates.
  - Go was chosen for accessibility: coming from a JS/Python (mostly JS)
    background, Go's imperative/mutable/typed style is an extension of
    existing mental models — TS-like static typing, `net/http` patterns
    that map onto Express/Flask-shaped handlers. Elixir's functional,
    immutable, pattern-matching-centric style plus its actor-model
    concurrency (OTP/BEAM) would be a much bigger paradigm leap.
  - More importantly, **Elixir's actual strengths don't match this
    project's needs.** Elixir's value proposition is massive concurrent
    long-lived connections, fault-tolerant supervision trees, and real-time
    push to many simultaneous clients (Phoenix Channels/LiveView) — none of
    which this app touches, since MVP is a stateless proxy with no session
    persistence, no shared state between players, and no real-time
    features. Using Elixir here would mean learning its syntax without ever
    exercising the OTP/concurrency model that's the actual reason to learn
    it professionally. Go's simple, typed, imperative style is a better
    match for what a thin TMDB-proxy backend actually needs to do.
  - Elixir noted as a strong candidate for a *different*, separately
    planned game project with a more natural multiplayer/real-time fit —
    not this one.
  - No official TMDB SDK exists in any language (community wrappers only).
    Go's `cyruzin/golang-tmdb` looks like the actively-maintained de facto
    option (should be re-verified for current endpoint coverage before
    committing to it), though given the workload is simple REST calls, a
    hand-rolled thin client is also reasonable.
- **Movie/cast data source: TMDB.** Chosen over IMDb non-commercial datasets
  (licensing risk for a user-facing app) and Wikidata (patchier cast data)
  for its free tier, generous rate limits, and daily bulk ID export. API key
  obtained.

### Open / recommended, not yet confirmed

- **Data storage: no database needed for MVP.** With player session
  persistence explicitly out of scope for MVP (game state lives in browser
  memory) and the Wall of Fame pushed to V1/V2, the backend reduces to a
  stateless proxy — hide the TMDB API key, forward search/credits requests.
  No DB, no ORM, no session model. Chain validation ("was actor X credited
  in movie Y") can happen client-side against data returned through the
  proxy; a caching layer is a possible later optimization if TMDB rate
  limits become a problem, not an MVP requirement.
  - The earlier Neo4j-vs-relational-store question only resurfaces if/when
    persistent features are built (Wall of Fame, hint systems, "show
    optimal chain," leaderboards). At that point the same logic still
    applies: per-submit validation is a simple lookup, not a graph
    traversal (the player does the pathfinding via the UI), so Neo4j only
    earns its place if a feature needs genuine shortest-path queries —
    otherwise a relational store (e.g. Postgres via a free-tier host, or
    even SQLite) is simpler and cheaper. Precomputing the *entire* graph
    within 6 degrees of Bacon is likely infeasible on a free tier regardless
    (Bacon numbers are famously low industry-wide, so that "small" graph is
    close to the whole dataset) — lazily caching data as players search
    remains the right approach whenever persistence is added.

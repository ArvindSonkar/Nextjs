# ShowTime — Final Project Plan v1.0
Date: 10 October 2026
Owner: Arvind
Status: Plan finalized; implementation not started.
Current milestone: P01 — Requirements and design.

## Agreement
Rules reference: [ShowTime engineering workbook and rules](SHOWTIME_RULES.txt), preserved exactly from Arvind's shared workbook text at his request. Follow its product policies, permissions and acceptance checks alongside this plan. The original PDF was not available among the attachments. The workbook's original handoff and document names are historical; use this plan and `PROGRESS.md` for current paths, milestone status and pending review corrections. Saving the workbook does not mark P01 complete.
This file, `docs/SHOWTIME_PROJECT_PLAN.md`, is the single authoritative plan for the first release and supersedes the previous 14-phase roadmap. Session history and current work are recorded in `docs/PROGRESS.md`. Follow P01–P12 in order. Tests and documentation are part of every milestone. Mark a milestone complete only with its acceptance evidence.
Do not expand the scope or switch the core stack during development. Record optional ideas in a later backlog. If a genuine compatibility, security, access, or cost blocker requires a change, explain it and agree the smallest adjustment with Arvind.
Implement in small learning sessions: explain the concept, implement a focused change, run it, test it, review the result, and record progress. Do not generate the entire application in one opaque step.
Learning ownership: Arvind writes all application code. The assistant teaches one concept at a time, assigns small exercises, reviews Arvind's work, and helps debug with explanations and hints. Do not implement features or edit application code on Arvind's behalf. Maintain planning/progress documentation to preserve this agreement across sessions. Give complete code solutions only when Arvind specifically requests them; otherwise let him attempt the task first.

## Product and release boundary
Build ShowTime, an independently branded movie booking web app.
Confirmed website name: **ShowTime**. Use this exact capitalization in documentation and future website branding, page titles, navigation, emails and tickets.
V1 is a publicly accessible portfolio application using demo cinema inventory and Razorpay test payments. Public deployment is required; accepting real money is not a V1 acceptance requirement.
Customer: Google sign-in, city selection, movie search and filters, movie details, show selection, seat map, temporary seat hold, test checkout, booking confirmation, QR ticket, confirmation email, booking history, cancellation, and refund status.
Admin: movie and poster management, cinemas, screens, fixed seat layouts, shows, prices, booking lookup, show cancellation, refund visibility, and an audit trail.
Start with Bengaluru and seeded demo movies/cinemas. Keep the data model city-aware.
Google OAuth is the only V1 sign-in method. CUSTOMER and ADMIN are the only V1 roles. Public visitors may browse; authenticated customers may reserve and pay. Admin accounts are provisioned securely; public users cannot select their own role.

## Fixed core stack
- Next.js App Router, React, TypeScript strict mode; supported compatible stable versions pinned in P02.
- Next.js Node.js server runtime, Route Handlers and server-side services. Server Components read through services; Client Components handle browser interaction. No separate Express backend.
- Tailwind CSS and shadcn/ui.
- PostgreSQL and Prisma; SQL where database correctness requires it.
- Better Auth with Google OAuth and persisted sessions.
- React Hook Form and Zod.
- Local React state and URL search parameters. No Redux requirement.
- Razorpay Standard Checkout in test mode.
- Managed object/image storage for posters, an email delivery service, and persistent database-backed jobs invoked by an authenticated scheduler. Specific service accounts are selected in P02 after checking access and limits, without changing these responsibilities.
- Vitest, React Testing Library, Playwright; real PostgreSQL for database integration tests.
- GitHub, GitHub Actions, Vercel, managed PostgreSQL, Sentry and structured logs.
- Local PostgreSQL may run through Docker Compose. App containerization/AWS/Kubernetes are outside V1.

## P01 — Requirements and design
Tasks:
- Write user stories, screen wireframes, routes, role permissions, and acceptance criteria.
- Set booking policy defaults: maximum 6 seats, 5-minute seat hold, booking closes at show start, customer cancellation until 2 hours before show start, full demo refund for eligible cancellation, and a 20-minute screen turnaround interval.
- Display all pricing before checkout. V1 uses simple configured seat prices, without coupons or separately modelled tax/fee calculations.
- Define late payment policy: if a hold expires, do not silently reclaim seats or confirm the expired booking; record captured funds and initiate the refund workflow.
- Define pending payment, confirmation, expiry, cancellation and refund outcomes.
Done: requirements, wireframes, policy table and ordered feature backlog reviewed.
Status: In review. Arvind submitted the P01 engineering workbook; review corrections and a learning walkthrough are pending. See `docs/PROGRESS.md`.

## P02 — Repository, setup and deployment skeleton
Tasks:
- Create a fresh Next.js application in `showtime/`, as requested by Arvind. Keep the existing `my-next-ts-app` starter intact. The website name remains ShowTime; the folder/package name is lowercase `showtime`. Pin compatible versions and configure lint/type checks, formatting and environment validation. Arvind runs the setup commands and writes the application code.
- Create .env.example with placeholders; keep credentials out of git and browser bundles.
- Add GitHub CI and a basic Vercel deployment.
- Choose accessible managed PostgreSQL, image, email and scheduler providers; check costs, pooling and execution limits. Verify the scheduler's invocation frequency and execution limits can support bounded job batches and timely recovery. Record the chosen providers here before proceeding. Use test/sandbox accounts where appropriate.
- Separate local, staging/test and production configuration. Configure OAuth callback URLs for stable staging/production hosts.
Done: fresh checkout starts successfully, CI passes, deployed shell is accessible.
Status: Not started.

## P03 — Database and backend foundation
Tasks:
- Model auth records plus City, Cinema, Screen, Seat, Movie, Show, ShowSeat, Booking, BookingSeat, PaymentAttempt, Refund, WebhookEvent, Job/Outbox and AuditLog.
- Add foreign keys, unique constraints, indexes, migrations and seed scripts.
- Enforce unique show-seat inventory, record the owning booking, unique hold identity and expiry, and preserve historical booked prices. Persist scoped operation idempotency keys, request fingerprints and outcomes for reservation and checkout retries.
- Store money in integer paise and timestamps consistently; display in the cinema timezone.
- Define route inputs/outputs, Zod validation, authorization boundaries, errors, request IDs and service functions.
- Model separate booking, payment and refund state transitions; support multiple payment attempts and explicit duplicate-payment handling.
Done: schema recreates a usable seeded database and service integration tests run against PostgreSQL.
Status: Not started.

## P04 — Authentication and permissions
Tasks:
- Google OAuth sign-in/out, persisted sessions, CUSTOMER/ADMIN roles.
- Server-side checks for every protected read and mutation.
- Booking ownership checks; secure admin provisioning and protected admin routes.
Done: login works on staging; unauthorized and cross-user access tests fail safely.
Status: Not started.

## P05 — Catalogue and admin inventory
Tasks:
- Responsive movie listing/details, city/date/language/genre filters, URL state, search and pagination.
- Loading, empty, error and not-found states; metadata and image optimization.
- Admin CRUD for movies, cinema/screens, seats, shows and pricing.
- Validate image uploads and use persistent external storage.
- Prevent show overlaps including turnaround time; protect booked seat layouts and historical prices from later edits.
Done: an admin-created show can be discovered by a customer.
Status: Not started.

## P06 — Seat map and reservation correctness
Tasks:
- Accessible keyboard-operable seat map; poll availability and refresh after conflicts.
- Create the pending booking and its uniquely identified seat hold together in one transaction. Enforce all-or-nothing holds, ownership and expiry validation, seat-count limit and server-side price calculation.
- Use short PostgreSQL transactions with locking or conditional updates; deterministic locking and bounded conflict retries.
- Never hold a database transaction open during customer checkout or payment API calls.
- Treat expired holds as expired even if cleanup has not run. Cleanup releases only expired allocations whose booking and unique hold identity still match the expected values; an old cleanup task cannot release a newer reservation.
- Reservation requests use persisted idempotency keys scoped to the authenticated customer and operation. Repeating the same key and request returns the existing result; reusing the key with different data is rejected.
Done: simultaneous requests cannot allocate the same show seat; failed multi-seat requests leave no partial hold.
Status: Not started.

## P07 — Payment checkout and booking confirmation
Tasks:
- Attach a persisted payment attempt to the pending booking created in P06; validate its ownership and active hold, then create the provider order server-side using the server total.
- Checkout operations use persisted idempotency keys. Repeating the same key and request returns the existing result; reusing the key with different data is rejected.
- Handle ambiguous provider timeouts before retrying; avoid unintended duplicate orders.
- Checkout, signature verification, order/amount/currency/payment-status validation.
- Confirm only captured payments for a valid allocation using a transactional, repeat-safe booking service. Coordinate finalization and show cancellation through database transactions and recheck show status so a cancelled show cannot receive a new confirmed booking.
- Handle abandoned checkout, declined payment, retry, late captured funds, and extra captured attempts requiring refund.
Done: test checkout succeeds end to end and never trusts browser price or success status.
Status: Not started.

## P08 — Webhooks and durable recovery
Tasks:
- Raw-body signature validation, unique event identity, processing status and safe duplicate/out-of-order handling.
- Callback and webhook share booking finalization logic.
- Durably record events/work before acknowledging processing that will continue later.
- Save business changes and their required job/outbox records in the same database transaction. Process persistent jobs in bounded batches with leases/locks, reclaim expired worker leases, use bounded repeat-safe retries, and provide a failed-job view.
- Reconcile provider payments/refunds, expire holds, retry emails, and process refund requests.
- Secure scheduled endpoints; use no in-memory timer as the authority.
Done: every captured payment is durably tracked and reaches either a confirmed booking or the appropriate refund workflow. Browser closure, repeated events and interrupted processing do not lose captured-payment records or create duplicate fulfillment.
Status: Not started.

## P09 — Tickets, booking history and cancellation
Tasks:
- Confirmation/status pages, owned booking history, QR tickets and confirmation email.
- QR uses an unpredictable identifier and resolves to a server-validated booking. Reveal booking details only after a server-side ownership or ADMIN permission check; include no sensitive information in the QR payload. Gate-scanning/check-in product is deferred.
- Customer cancellation and admin show cancellation; stop new holds and checkout initiation on cancelled shows. Coordinate cancellation with payment finalization; captured funds for an unfulfilled cancelled-show booking enter the refund workflow.
- Separate cancellation from refund completion; track errors and retries.
- Admin booking/refund lookup and audit history; emails must not determine booking success.
Done: full browse-to-ticket-to-cancellation/refund journey works on staging.
Status: Not started.

## P10 — Release testing and hardening
Tasks:
- Continue earlier tests with end-to-end browser, real database concurrency and failure injection tests.
- Verify simultaneous seat acquisition, no partial holds, price tampering, repeated reservation/checkout requests, changed payloads using an existing idempotency key, callback/webhook races, old events, late payments, ownership checks, admin isolation, email failure and delayed jobs.
- Verify an old hold-cleanup task cannot release a newer reservation, interrupted job workers can recover, and business changes cannot lose their required follow-up jobs.
- Race admin show cancellation against customer payment finalization: a cancelled show cannot receive a new confirmed booking, and captured funds requiring a refund remain tracked.
- Apply request validation, auth/booking rate limits, safe uploads, secret hygiene and appropriate browser protections.
- Check mobile/responsive behavior, keyboard operation, focus management and slow network experience.
- Keep personal data out of shared caches; revalidate inventory at reservation. Optimize catalogue images, queries and indexes.
- Run a small staging load test and inspect errors/database behavior.
Done: critical acceptance tests pass and remaining limitations are documented.
Status: Not started.

## P11 — Production deployment and operations
Tasks:
- Production database pooling, secrets, stable domain/HTTPS, OAuth callbacks, webhook and scheduler configuration.
- Controlled compatible migrations before releases; no destructive development resets against production.
- Sentry, structured request/booking/payment IDs, uptime checks and alerts for stuck payments or failed jobs; redact sensitive data.
- Database backups and a restore exercise; code rollback drill with database compatibility.
- Review provider limits, usage budgets and alerts. No assumption that all services or required schedules are free.
- Deploy publicly with explicit demo inventory/test payment notices.
Done: an external tester completes the journey, monitoring works and recovery procedures are demonstrated.
Status: Not started.

## P12 — Final acceptance and portfolio handover
Tasks:
- Repeat the deployed customer/admin journeys and critical security/concurrency/payment tests.
- Publish setup instructions, architecture/database diagrams, API overview, deployment steps, recovery runbook and known limitations.
- Add screenshots and a short demo video. Document design choices and learning notes.
Done: release tagged v1.0, no unresolved critical booking/payment/access defects, public URL and reproducible setup available.
Status: Not started.

## Definition of project ready
All P01–P12 gates pass; customer and admin flows work on the public app; database-backed bookings survive restarts; no double booking in concurrency tests; payment recovery and refunds work in provider test mode; CI, monitoring, backups and rollback have evidence; documentation allows a fresh setup.
Real ticket sales require actual inventory rights/agreements and approved live merchant setup and form a separately agreed release.

## Outside V1
Events, food orders, coupons, reviews, recommendation engines, multiple login methods, SMS OTP, native apps, theatre-owner portals, gate scanning, realtime sockets, Redis, Kafka, microservices, app AWS migration, Terraform and Kubernetes. Record ideas, do not add them before V1 is ready.

## Progress protocol
At each session record: current milestone, tasks completed, files changed, commands/checks and results, blockers, next task. Maintain milestone scope, acceptance criteria and status in `docs/SHOWTIME_PROJECT_PLAN.md`; maintain session records and the next task in `docs/PROGRESS.md`. Do not create a competing `PROJECT_PLAN.md`. Read these files at the start of subsequent work; do not assume cross-chat memory preserves the latest implementation state.
After each feature: explain -> implement -> run -> test -> review -> commit -> update progress.
Target estimate: 12–16 weeks at 10–12 focused hours/week as a stretch planning target, depending on existing JavaScript, React, SQL and backend experience. Completion gates take priority over dates.

## Official references
- Next.js App Router: https://nextjs.org/docs/app
- Next.js production checklist: https://nextjs.org/docs/app/guides/production-checklist
- Better Auth with Prisma/Next.js: https://www.prisma.io/docs/guides/authentication/better-auth/nextjs
- PostgreSQL locking: https://www.postgresql.org/docs/current/explicit-locking.html
- Razorpay checkout: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/
- Razorpay webhook validation/retries: https://razorpay.com/docs/webhooks/validate-test/
- Vercel scheduled job operations: https://vercel.com/docs/cron-jobs/manage-cron-jobs

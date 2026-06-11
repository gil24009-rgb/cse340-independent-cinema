# Decision Log

This file records decisions that should remain stable unless new evidence or a course requirement requires a change.

## Product Decisions

| Decision | Rationale |
| --- | --- |
| Build an independent cinema operations platform | It supports relational data, roles, content management, user content, and a visible multi-stage workflow within the available schedule. |
| Use one auditorium | It keeps screening capacity and booking logic meaningful without adding unnecessary scheduling complexity. |
| Make booking status the core workflow | It connects public discovery, Member history, Staff operations, and Owner oversight. |
| Keep payment and seat selection outside scope | Neither is needed to demonstrate the course requirements, and both add disproportionate complexity. |
| Preserve booking status history | Operational changes need to remain explainable to Members and staff. |

## Role Decisions

| Decision | Rationale |
| --- | --- |
| Separate Staff and Owner roles | The final project requires meaningful authorization differences, not only logged-in and logged-out states. |
| Allow only Owners to manage films, screenings, users, and roles | These actions change the cinema's catalog, schedule, or access model. |
| Allow Staff and Owners to manage check-in, reviews, and messages | These are daily operational tasks. |
| Allow Members to manage only their own bookings and reviews | Ownership checks provide a clear security boundary and satisfy user-content requirements. |

## Data Decisions

| Decision | Rationale |
| --- | --- |
| Use PostgreSQL | It fits the course stack and supports constraints, transactions, and production deployment. |
| Use seven core tables | Users, films, screenings, bookings, booking status history, reviews, and contact messages cover the required workflows without speculative entities. |
| Archive or cancel operational records instead of deleting them | Historical bookings and related activity must remain understandable. |
| Reject no-op booking status transitions | Status history should represent real operational changes. |
| Prevent duplicate bookings per Member and screening | A single Member should not occupy capacity more than once. |

## Architecture Decisions

| Decision | Rationale |
| --- | --- |
| Use Express 5, EJS, and ESM | The stack matches course expectations and supports a clear server-rendered architecture. |
| Use session-based authentication | It is appropriate for a server-rendered application and satisfies the authentication requirement. |
| Use a lazy shared PostgreSQL pool | The app can render stable non-database states while still sharing database connections correctly. |
| Keep centralized validation and error handling | Shared failure behavior reduces inconsistent route implementations. |
| Treat navigation as presentation only | Authorization must be enforced by server middleware even when a link is hidden. |

## Experience Decisions

| Decision | Rationale |
| --- | --- |
| Keep global navigation to five destinations | A small navigation model supports film discovery without crowding the header. |
| Use different public and operational interface densities | Visitors need editorial clarity, while Staff and Owners need efficient repeated actions. |
| Use Cinecube mainly for public UI direction | Its restrained hierarchy fits the intended cinema presentation. |
| Use Indiespace mainly for public structure | Its film-centered information architecture fits the product scope. |
| Use Tabler and Cinema+ as operational comparison points | They provide practical references for tables, filters, status controls, and workflow completeness. |

# Project Context

## Objective

Build a structurally sound and visually refined independent cinema platform that satisfies the CSE 340 final project requirements without exceeding a five-to-six-week implementation scope.

The project should demonstrate:

- Relational database design through real operational relationships
- Server-side authentication, authorization, validation, and error handling
- A complete multi-stage booking workflow
- Meaningfully different Member, Staff, and Owner permissions
- A polished public cinema experience and efficient operational interfaces
- Reliable deployment and clear submission documentation

## Product Concept

The product represents a single-screen independent cinema. Public visitors discover films and screenings. Registered members create and track bookings. Staff manage day-to-day operations. Owners manage the cinema catalog, schedule, and user roles.

The product is not a general movie database or a commercial ticket marketplace. Its value comes from connecting a focused public cinema experience to a clear internal operations workflow.

## Quality Priorities

Implementation decisions should follow this order:

1. Correct data relationships and business rules
2. Secure role and ownership boundaries
3. Reliable workflows and failure states
4. Clear information hierarchy and interaction design
5. Visual refinement and responsive behavior
6. Deployment and submission readiness

New features should not weaken the core booking workflow or delay completion of required functionality.

## Reference Direction

References guide specific aspects of the product rather than being copied directly.

| Reference | Primary Use |
| --- | --- |
| Indiespace | Public information architecture and film-centered structure |
| Cinecube | Public interface hierarchy, restraint, and cinema presentation |
| Apple-like product aesthetic | Premium restraint, large-scale typography, and calm surface treatment for the global visual direction |
| Tabler | Dense operational tables, filters, and status controls |
| Cinema+ | Functional completeness and workflow comparison |

Public pages should feel editorial, cinema-specific, and premium in a restrained way, as if a polished consumer-tech product team built a cinema experience instead of a marketplace. Staff and Owner pages should feel compact, predictable, and work-focused while still matching the same high-end visual system.

## Users and Permissions

| Capability | Public | Member | Staff | Owner |
| --- | --- | --- | --- | --- |
| Browse films and screenings | Yes | Yes | Yes | Yes |
| Submit contact message | Yes | Yes | Yes | Yes |
| Create and cancel own booking | No | Yes | No | No |
| Manage own reviews | No | Yes | No | No |
| Check in attendees and update booking status | No | No | Yes | Yes |
| Moderate reviews and process messages | No | No | Yes | Yes |
| Manage films and screenings | No | No | No | Yes |
| Manage users and roles | No | No | No | Yes |

Protected actions must be enforced by the server. Navigation visibility is not an authorization control.

## Navigation Model

Global navigation remains small:

- Now Showing
- Films
- Screenings
- Visit
- Account destination based on authentication and role

Role-specific destinations:

- Member: Overview, My Bookings, My Reviews
- Staff: Today's Screenings, Bookings, Reviews, Messages
- Owner: Films, Screenings, Users, Bookings, Reviews, Messages

## Core Workflow

The booking workflow is the central proof of application depth:

1. A Member selects an upcoming screening.
2. The application validates availability and prevents duplicate bookings.
3. The booking is created with its initial status.
4. Staff check the Member in or record another valid operational status.
5. Every status transition creates a history record.
6. The Member sees the current status and its timeline.
7. A completed booking allows the Member to write a review.

Booking history must remain available even when operational records are archived or users are deactivated.

## Included Scope

- Public film list and detail
- Date-based screening schedule and detail
- Theater information and contact form
- Session-based signup, login, and logout
- Role-aware account destinations
- Member bookings and booking history
- Member review CRUD with ownership checks
- Staff check-in and status operations
- Staff review moderation and message processing
- Owner film, screening, user, and role management
- Responsive public and operational interfaces
- PostgreSQL production database and Render deployment

## Excluded Scope

- Actual payment
- Seat selection
- Multiple auditoriums or locations
- External movie or booking APIs
- Recommendation algorithms
- Social login
- Real-time notifications
- Poster upload workflow

## Architecture Principles

- Keep database access and business rules separate from rendering concerns.
- Use parameterized SQL for all user-controlled input.
- Validate every form on the server.
- Keep controllers focused on request coordination.
- Use shared middleware for authentication, roles, ownership, validation, and errors.
- Render stable empty, invalid, forbidden, not-found, and server-error states.
- Preserve operational history instead of deleting it.
- Add abstractions only when they remove real duplication or clarify ownership.

## Frontend Principles

- Let films and screenings dominate public pages.
- Keep navigation and page hierarchy restrained.
- Use a dark, premium visual language with large headlines, precise spacing, and only one strong primary action per screen.
- Preserve the Apple-built-cinema mood without drifting into unsupported product features such as seat maps, trailers, watchlists, or heavy commerce patterns.
- Use ticket-like presentation for Member booking details.
- Use compact tables and clear status controls for Staff and Owner work.
- Design mobile and desktop workflows together.
- Do not add decorative elements that compete with content or actions.
- Compare major public screens with Indiespace and Cinecube.
- Compare operational workflows with Tabler and Cinema+.

## Definition of Complete

The project is complete when all assignment requirements are mapped to verified behavior, all role boundaries work through direct URL access, the full booking workflow is tested, the production deployment works in a private browser session, and the repository accurately explains setup, accounts, architecture, and known limitations.

# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: Vite + React + TypeScript single-page app, local-first data layer for the working first version, with a Supabase (Postgres + RLS) schema and Google Identity Services sign-in wired for production. Chosen for a fast, reliable mobile-first build that runs today at localhost and deploys to any static host without locking the team into a framework decision before the data model settles.

## Users

- **Ministry leaders / administrators** (pastor, bishop, coordinator, worship leader): build the monthly service schedule from a phone between appointments, see who is available, assign people and functions, attach the repertoire.
- **Team members** (singers, instrumentalists, backing vocal): check on a phone, usually the night before or on the way to church, whether they are scheduled, at what time, in which function, and what the setlist is.
- **Church leadership** (pastor, bishop): see coverage, gaps, and who serves where without asking for screenshots in a group chat.

The product is used in Portuguese (pt-BR), in a Brazilian church context, mostly on a phone, often in low light and with one hand.

## Product Purpose

A single place for the ministry's scale (who serves, when, in which function) and its repertoire (what is sung, in which key). Success means a member never has to ask "estou escalado?" in a WhatsApp group, and a leader can build or adjust a service schedule in a couple of minutes on a phone.

## Positioning

The unit of the product is the **service** (culto), not the event or the task: people, functions, times, and songs live on one card. Schedule and repertoire are the same object seen from two sides, which calendar apps and spreadsheet rosters cannot express.

## Operating Context

- Weekly services on fixed days and times, plus special services (conference, Santa Ceia, youth service).
- Schedule planning happens weeks ahead; changes happen hours before.
- Repertoire is decided close to the service, with keys and reference links.
- The team already shares files through Google Drive and OneDrive; the product must be able to point at an external, structured repertoire database rather than inventing a second one.
- Roles already exist in the church's culture: função (Sem função, Aspirante, Diácono(a), Prebítero(a), Pastor(a), Bispo(a)) and cargo (Líder, Ministro(a), Backing Vocal, Tecladista, Baixista, Baterista, Violonista, Metais, Guitarrista, Solista, outros).

## Capabilities and Constraints

Confirmed for the first version:

- Sign-in **only** with a Google account. Display name is never taken from Google: the member types full name, função, one or more cargos, birth date, and sex.
- Google authentication is mandatory; e-mail/password is not an option.
- Administrators view member profiles and delegate functions/permissions. The permission system is created first; what each permission unlocks will be refined iteratively.
- Only the administrator creates service schedules: date, time, person, and that person's function for that service.
- Members see their schedule in a calendar; a day with an assignment is visually distinct for that member.
- Repertoire belongs to the service, but the repertoire environment is built first: a place to connect an external structured database (Google Drive or OneDrive). Structure will be refined iteratively.
- Mobile-first is a hard requirement; desktop is supported but the phone is the primary surface.

Explicitly undecided (do not hard-code as final): exact permission matrix per role, which external provider is primary (Drive vs OneDrive), repertoire file format, notification channel, multi-congregation support.

## Brand Commitments

- Product language is Brazilian Portuguese.
- The product must feel at home in a church ministry: reverent, warm, human, never corporate-SaaS, never gamified, never hype.
- Working title: **Salmo**. Not yet confirmed by the owner; treat as replaceable without a redesign.

## Evidence on Hand

No real member data, photos, logos, or repertoire files were supplied. All names, services, and songs in the build are synthetic demo material and must be labeled as such. No denominational claims, attendance numbers, or testimonials may be invented.

## Product Principles

1. **The service is the unit.** Every screen resolves around a specific culto, not around abstract modules.
2. **One glance answers the phone question.** A member should know "am I serving, when, and what do I sing" without navigating.
3. **Reverence without distance.** The interface should feel like a well-kept ministry, not an enterprise dashboard.
4. **The leader's two minutes.** Creating or adjusting a schedule must be faster than typing it into a group chat.
5. **Own the seam, not the file.** Repertoire stays in the team's Drive/OneDrive; the product owns the link, the structure, and the moment it is needed.

## Accessibility & Inclusion

WCAG 2.1 AA: keyboard reachable, visible focus, 4.5:1 text contrast, 44px touch targets, respect for reduced motion, no color-only state (calendar assignments carry a dot/shape and text, not just hue).

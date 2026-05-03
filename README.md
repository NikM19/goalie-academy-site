# Goalie Academy Website

Landing page for Goalie Academy — a hockey goalie training academy for U7–U20 players.

## Project type

One-page HTML/CSS/JS landing page.

## Tech stack

- HTML
- CSS
- JavaScript
- GitHub Pages
- Google Sheets
- Google Apps Script
- Telegram Bot notifications

## MVP goal

Create a fast, mobile-friendly landing page that presents Goalie Academy and collects training requests through a booking form.

## Main site sections

- Hero / first screen
- Who the academy is for
- Training programs
- Camps and intensives
- About coach / academy
- Benefits
- Schedule / available slots
- Cooperation
- Reviews
- Booking form
- Contacts

## Template plan

Base template:

- OnNext

Reference template:

- Training Studio — for hero video background and schedule section

Important:

- Do not mix CSS/JS from multiple templates directly.
- Use OnNext as the main base.
- Adapt additional sections manually to match the OnNext style.

## Google Sheets structure

Google Sheet: `Goalie Academy Website Data`

Sheets:

- Programs
- Camps
- Schedule
- Reviews
- Settings
- Bookings

## Current progress

- [x] Create Google Docs Roadmap
- [x] Create Google Sheet
- [x] Create GitHub repository
- [x] Choose base template: OnNext
- [x] Choose reference template: Training Studio
- [x] OnNext files added to the project
- [x] Project opened in VS Code
- [x] Template checked locally with Live Server
- [x] index.html structure and navigation prepared for Goalie Academy
- [x] Navigation updated according to the client brief
- [x] Changes pushed to GitHub
- [x] Header logo updated with simplified Goalie Academy logo
- [x] Header logo checked on desktop and mobile
- [x] Favicon updated to Goalie Academy shield icon
- [x] Hero background replaced with hockey rink image
- [x] Hero background checked with Live Server
- [x] .DS_Store files ignored and cleaned up
- [ ] Review and polish the Hero section on desktop and mobile
- [x] Programs section updated with three training program cards
- [x] Program card texts updated
- [x] Book Training buttons linked to #booking
- [x] Programs hover behavior fixed and tested
- [x] Programs section checked on desktop and mobile
- [x] Programs section redesigned with four compact offer-style program cards in one desktop row
- [x] Video Analysis program card added
- [x] Programs layout supports desktop 4-column, tablet 2-column, and mobile 1-column behavior
- [x] Program card top-panel hover animation and hover shadow updated to Goalie Academy brand colors
- [x] Camps section updated with three event-style cards
- [x] Camps cards aligned to equal height
- [x] Book / Apply buttons linked to #booking
- [x] Camps card brand colors updated with dark hover fill, light readable hover text, and default card backing removed
- [x] Camps section checked on desktop and mobile
- [x] Coach / Academy section redesigned as tabbed information block
- [x] Coach and Academy tabs updated with real images
- [x] Method and Philosophy tabs updated with skill/value panels
- [x] Coach / Academy tabs updated with brand color capsule states
- [x] Coach / Academy section updated with full-section local video background `videos/coach-academy-bg.mp4`, dark overlay, and glass-style content card
- [x] Buttons linked to #booking and #programs
- [x] Section checked on desktop and mobile
- [x] Booking section updated with static training request form
- [x] Form includes name, email, phone, age group, training format, and message fields
- [x] Programs, Camps, and Coach tab CTAs prefill the Contact form Training format field with `data-training-format` and `js/custom.js`
- [x] Camp-specific Training format options added for Summer Goalie Camp, Weekend Intensive, and Preseason Goalie Intensive
- [x] Form prepared for future Google Sheets / Telegram integration
- [x] Booking section checked on desktop and mobile
- [x] Booking navigation item renamed to Schedule
- [x] Contacts navigation item renamed to Contact
- [x] Schedule placeholder cards replaced with a responsive table for training format, age group, day/time, location, and status
- [x] Cooperation section updated with three partnership cards
- [x] Cooperation section colors polished to match Goalie Academy brand styling
- [x] Contact actions changed to centered icon-only buttons
- [x] Bottom CTA simplified without heavy background card
- [x] Contact icons linked to #contacts
- [x] Cooperation section checked on desktop and mobile
- [x] Reviews section redesigned as calm testimonial cards
- [x] Reviews accent colors updated to match Goalie Academy brand styling
- [x] Programs and Reviews checked on desktop and mobile
- [x] Contact section redesigned into one shared premium split-card layout
- [x] Contact section includes Book Training form
- [x] Contact section uses light premium form fields
- [x] Contact select field text clipping fixed
- [x] Contact section includes Email, WhatsApp, Call, and Instagram icons
- [x] Contact section address updated to Energiakatu 3, 00180 Helsinki
- [x] Contact section includes embedded Google map for Energiakatu 3, 00180 Helsinki
- [x] Contact section pixel-polished with DevTools and checked on desktop
- [x] Contact round icons use brand red `#de1316` for default icon/border color, switch to the Book Training button base fill on hover/focus/active, and keep white/light icons for readability without changing Contact layout or alignment
- [x] Contact location pin color updated to match the Book Training button base color
- [x] Header navigation colors polished for brand consistency and readability over the dark hero background
- [x] Global button hover fill color updated to Goalie Academy brand red `#de1316`
- [x] Global script cleanup completed by removing missing `jquery.mobile.customized.min.js` import and fixing the RetinaJS browser export issue in `js/all.js`
- [x] Footer redesigned with Goalie Academy square logo, two-column navigation, dark logo-matched background, copyright `All Rights Reserved. © 2026 Goalie Academy`, and design credit `Design By: M19`
- [ ] Test Schedule and Contact on mobile
- [ ] Replace placeholder contact links with real email, phone, WhatsApp, and Instagram links
- [ ] Decide whether the static form should later connect to Google Sheets, email, or another backend
- [ ] Implement actual booking form submission
- [ ] Connect booking form to Google Sheets
- [ ] Add Telegram notification
- [ ] Publish with GitHub Pages

## Useful links

Google Docs Roadmap:

_Add link here_

Google Sheets Website Data:

_Add link here_

GitHub repository:

https://github.com/NikM19/goalie-academy-site

GitHub Pages:

_Add link after publishing_

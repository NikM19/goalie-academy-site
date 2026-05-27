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
- Academy Store preview
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
- Store
- Reviews
- Settings
- Bookings
- StoreInquiries
- EmailQueue

Bookings columns:

`timestamp | name | goalie_age | training_type | preferred_date | preferred_time | phone | email | message | source | status | notes | booking_id`

StoreInquiries columns:

`timestamp | inquiry_id | name | email | phone | goalie_age | request_type | message | source | status | notes`

Website Store inquiries use `request_type = Ask About Gear`, `source = store`, and `status = new`.

StoreInquiries status values:

`new | contacted | interested | not_interested | closed`

Programs columns:

`id | title | description | age | duration | price | status | button_text | training_format | display_order | label`

Camps columns:

`id | title | date | time | location | age | description | price | status | button_text | training_format | label | display_order`

EmailQueue columns:

`timestamp | queue_id | booking_id | email_type | chat_id | message_id | status | processing_started_at | processed_at | error | attempt_count | notes`

Schedule columns:

`id | title | date | time | type | age | age_min | age_max | age_label | location | status | training_format | description | is_active | display_order`

Store columns:

`id | title | category | description | price_label | status | image | button_text | inquiry_type | is_active | display_order | notes`

Schedule date rules:

- Empty `date` = by-request / general availability item
- `YYYY-MM` = monthly item
- `YYYY-MM-DD` = exact-date event

Live data flow:

- Schedule reads public live JSON from Google Apps Script GET endpoint with `?action=schedule`
- Public Schedule JSON keeps old `age` and now also includes Age Model v2 fields: `age_min`, `age_max`, and `age_label`
- Website Schedule cards display `age_label` when present and fall back to old `age` when `age_label` is blank or missing
- Static Schedule fallback data can stay age-only, and old clients that read `age` still work
- No public age filtering is implemented yet; `age_min` and `age_max` are carried for future use only
- Programs reads public live JSON from Google Apps Script GET endpoint with `?action=programs`
- Camps reads public live JSON from Google Apps Script GET endpoint with `?action=camps`
- Academy Store reads public live JSON from Google Apps Script GET endpoint with `?action=store`
- Programs and Camps keep static HTML cards as fallback
- Live Programs and Camps cards replace fallback only after valid non-empty responses
- Academy Store keeps static HTML content as fallback and only updates after valid non-empty Store responses
- Programs, Camps, and Store use browser cache for faster initial rendering: `sessionStorage` first, `localStorage` second with a 6-hour TTL, and static HTML fallback last
- Store cache key: `goalieAcademy.store.v1`
- Programs, Camps, and Store still run a fresh live fetch on every page load; valid non-empty responses refresh rendered content and browser cache, while failed/invalid/empty responses keep the current visible content
- Programs, Camps, and Store refresh live data when the user returns to the browser tab, throttled to once every 5 minutes; failed/invalid/empty refreshes keep the current visible content
- Schedule is not refreshed by the Programs/Camps tab-return listener
- Schedule does not use the Programs/Camps browser cache behavior
- Academy Store remains a preview/interest section; CTA links to `#contacts` only and there is no cart, payment, checkout, or Buy Now flow
- Program and Camp CTA buttons keep using `data-training-format` so the booking Training format field is prefilled
- Normal training booking form submissions POST to the Worker endpoint: `https://goalie-academy-crm-bot.musatovnikita13.workers.dev/api/booking`
- The Worker creates real `Bookings` rows with `source = website`, `status = new`, and a server-generated `booking_id`
- The booking form uses a compact numeric `Player age` input instead of the old age-group dropdown; it still submits the existing `goalie_age` payload field
- `goalie_age` accepts digits only, up to 2 characters, with valid ages from 5 to 65; invalid values use the existing form-level error message: `Please enter the player’s age as a number from 5 to 65.`
- Store / gear inquiries from `Ask About Gear` POST to the Worker endpoint: `https://goalie-academy-crm-bot.musatovnikita13.workers.dev/api/store-inquiry`
- The Worker writes Store inquiries to the `StoreInquiries` sheet, sends the Worker bot `🧤 New gear inquiry` notification, and does not create `Bookings` rows
- Store inquiry payloads include `request_type = Ask About Gear`, `training_type = Ask About Gear`, and `source = store`
- `Ask About Gear` is a temporary Store inquiry form value, not a normal Training format dropdown option
- Store inquiry mode changes the submit button to `Send Gear Inquiry`, uses `Sending...` while submitting, preserves the duplicate submit guard, resets after success, focuses the message field after the Store CTA jump, and uses gear inquiry success wording
- The shared booking/contact form includes a hidden anti-spam honeypot field named `company_website`; it is not visible or focusable for normal users
- Normal booking and Store / Ask About Gear submissions both include `company_website` in the payload, and the Worker decides whether to drop suspicious submissions
- The website does not implement Turnstile or captcha at this stage
- Apps Script `doGet(e)` handles public Schedule, Programs, Camps, and Store JSON
- Apps Script `doPost(e)` still handles Store inquiries as a rollback path, but the website Store form no longer uses that path after the Worker switch
- The booking submit switch is conditional inside `js/custom.js`; do not replace the shared Apps Script base URL globally because public data GET endpoints still use it
- Website booking payloads remain `URLSearchParams` / form-url-encoded and keep the existing field names: `name`, `email`, `phone`, `goalie_age`, `preferred_date`, `preferred_time`, `training_type`, `message`, `company_website`, and `source`
- The Worker ignores client-provided booking source for normal bookings and forces `source = website`
- Booking status can then be changed from the Telegram CRM `/bookings` flow
- After a successful live Schedule fetch, fallback/request option cards use only active live Schedule items; inactive Google Sheets rows stay hidden from the option list
- On initial page load, Schedule waits for live data before showing fallback/request options to avoid flashing incomplete static fallback data
- If the Schedule fetch fails or returns invalid data, the site keeps the static fallback schedule data
- If Apps Script `?action=schedule` does not include `age_label`, the website still displays old `age`
- To test public Schedule JSON, open the Apps Script endpoint with `?action=schedule` and check one item includes `age`, `age_min`, `age_max`, and `age_label`
- Programs and Camps age fields are separate public data flows and were not changed by Schedule Age Model v2 display support
- Store, booking form POST, and booking-to-Schedule matching were not changed by Schedule Age Model v2 display support
- Worker CRM Age Model v2 implementation is documented separately in the Worker repository
- Testing notes: check Schedule navigation, exact-date markers, Request Availability prefill, booking form validation, and Schedule age display fallback

Schedule Age Model v2 QA checklist:

1. Live Server: Schedule loads from Apps Script.
2. A row with `age_label` displays `age_label`.
3. A row with blank/missing `age_label` falls back to `age`.
4. Programs, Camps, and Store render normally.
5. Browser console has no relevant errors.

Current endpoint split:

- Normal booking POST -> Worker `/api/booking`
- Store inquiry POST -> Worker `/api/store-inquiry`
- Schedule GET -> Apps Script `?action=schedule`
- Programs GET -> Apps Script `?action=programs`
- Camps GET -> Apps Script `?action=camps`
- Store GET -> Apps Script `?action=store`

Stage 14I-B website booking switch:

- Normal website booking form submissions now go to the Worker production booking endpoint.
- Store inquiries remained on Apps Script / `StoreInquiries` during this stage; Stage 19C-B later switched them to the Worker Store endpoint.
- Public live data GET endpoints remain on Apps Script.
- Existing user-facing copy is preserved:
  - normal booking success: `Thank you! Your booking request has been sent.`
  - Store inquiry success: `Thank you! Your gear inquiry has been sent. We’ll get back to you soon.`
  - network/server error: `Sorry, something went wrong. Please try again or contact us directly.`
- Existing validation messages, `Sending...` loading state, disabled submit button, success reset, and success auto-hide behavior are preserved.
- A minimal in-flight submit guard prevents duplicate submissions while a request is already being sent.
- Player age validation uses the shared form-level status area and does not add inline helper/error text, so the form layout stays stable.

Stage 14I-B QA summary:

- Live Server normal booking submit succeeded.
- A new row appeared in `Bookings`.
- The row used `source = website`, `status = new`, and a generated `booking_id`.
- `+358` phone values were preserved.
- `/bookings` saw the new row.
- Store inquiry still went to Apps Script / `StoreInquiries` during this stage.
- Schedule, Programs, Camps, and Store still loaded.
- Validation still worked.
- Browser console had no relevant errors.

Rollback for the Stage 14I-B switch:

- Revert the normal booking endpoint conditional in `js/custom.js` back to Apps Script.
- Apps Script receiver remains untouched.
- Store inquiry rollback is tracked separately under the Stage 19C-B operations notes.
- Public data GET endpoints already remain Apps Script.

Stage 19C-B Store inquiry Worker switch:

- Website Store / Ask About Gear submissions now go to the Worker Store endpoint.
- Normal website booking submissions remain on Worker `/api/booking`.
- Public Schedule, Programs, Camps, and Store GET endpoints remain on Apps Script.
- Apps Script Store POST remains available as rollback, but the website Store form no longer uses it.
- `js/custom.js` cache busting was updated in `index.html` to `js/custom.js?v=20260518-store-worker`.
- Existing user-facing Store UX is preserved:
  - CTA label: `Ask About Gear`
  - submit text: `Send Gear Inquiry`
  - loading state: `Sending...`
  - success: `Thank you! Your gear inquiry has been sent. We’ll get back to you soon.`
  - error: `Sorry, something went wrong. Please try again or contact us directly.`
  - duplicate submit guard, success reset, and Store CTA scroll/focus behavior remain active.

Stage 19C-B QA notes:

- Store inquiry should create a `StoreInquiries` row with `request_type = Ask About Gear`, `source = store`, and `status = new`.
- The new Worker bot should receive `🧤 New gear inquiry`.
- The old Apps Script bot should not receive website Store inquiries after the switch.
- Normal booking should still create a `Bookings` row and send the Worker booking notification.
- Store, Schedule, Programs, and Camps public data should still load from Apps Script.

Rollback for the Stage 19C-B Store switch:

- If Worker `/api/store-inquiry` fails, switch only Store POST routing in `js/custom.js` back to the Apps Script endpoint.
- Do not change normal booking routing when rolling back Store inquiries.
- Do not change public Schedule, Programs, Camps, or Store GET endpoints.

JavaScript cache busting:

- `js/custom.js` is loaded with a version query, for example `js/custom.js?v=20260509-1`
- When `js/custom.js` changes in the future, bump the version query in `index.html` so returning visitors receive the updated file

## Current architecture

Website:

- normal booking POST -> Worker `/api/booking`
- Store inquiry POST -> Worker `/api/store-inquiry`
- live public data GET -> Apps Script

Worker:

- `/api/booking` receives normal website bookings
- `/api/store-inquiry` receives website Store / Ask About Gear inquiries, writes `StoreInquiries`, and sends the Worker bot gear notification
- `/bookings` Telegram CRM reads and manages `Bookings`
- status buttons manage `contacted`, `confirmed`, and `cancelled`
- new website booking and Store inquiry Telegram notifications are sent by the Worker; email remains separate

Apps Script:

- still handles public Schedule, Programs, Camps, and Store GET data
- Store POST remains available as rollback for `StoreInquiries`
- old booking receiver still exists as rollback path
- email/reminder flows remain separate

## Telegram booking CRM

- Worker new-booking Telegram notifications are implemented for website bookings
- Store / gear inquiries use the Worker `🧤 New gear inquiry` notification flow, separate from normal booking notifications
- New booking rows receive `status = new`, empty `notes`, and a server-generated `booking_id`
- Telegram notification buttons update Google Sheets status by `booking_id`: Contacted -> `contacted`, Confirmed -> `confirmed`, Cancelled -> `cancelled`
- Contacted queues the info email, Confirmed queues the confirmation email, and Cancelled queues the cancellation email
- After a status action, inline buttons are removed from the Telegram message
- Email sending is handled asynchronously through the `EmailQueue` sheet
- `EmailQueue` is processed by a recurring every-minute Apps Script trigger
- When an email is sent, Telegram sends a separate "Email sent" confirmation message
- Repeated Telegram callbacks/actions are deduplicated and should not create duplicate email jobs
- Empty recurring trigger checks are no longer written to `DebugLogs`
- Telegram `/start` and other non-callback updates are ignored and do not create booking rows
- Status updates are restricted to the authorized admin by `TELEGRAM_ADMIN_USER_ID`
- Manual status edits in Google Sheets do not automatically send emails; email sending is triggered by Telegram CRM buttons

Required Apps Script Properties:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_ADMIN_CHAT_ID`
- `TELEGRAM_ADMIN_USER_ID`

Security notes:

- Do not commit Telegram secrets
- Do not include the actual bot token in repository files
- Do not expose private Google Sheets edit links
- Store Telegram values only in Apps Script Properties

Telegram webhook:

- Required for Telegram status buttons
- Set webhook: `https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=<WEB_APP_URL>`
- Check webhook: `https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo`
- Rollback webhook: `https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/deleteWebhook`

Telegram CRM testing checklist:

1. Submit booking
2. Confirm row appears
3. Confirm status `new`, notes empty, and `booking_id` present
4. Confirm `/bookings` sees the row
5. Test Contacted / Confirmed / Cancelled buttons
6. Confirm Worker status buttons do not create email jobs
7. Confirm repeated button actions do not create duplicate writes
8. Confirm `/start` does not create a booking
9. Confirm Schedule still loads

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
- [x] Book Training buttons linked to #contacts
- [x] Programs hover behavior fixed and tested
- [x] Programs section checked on desktop and mobile
- [x] Programs section redesigned with four compact offer-style program cards in one desktop row
- [x] Video Analysis program card added
- [x] Programs layout supports desktop 4-column, tablet 2-column, and mobile 1-column behavior
- [x] Program card top-panel hover animation and hover shadow updated to Goalie Academy brand colors
- [x] Programs connected to live Google Sheets data with static fallback cards retained
- [x] Programs static fallback aligned with current live data
- [x] Programs and Camps browser cache added to reduce visible fallback-to-live content swapping
- [x] Programs and Camps refresh live data on tab return with a 5-minute throttle
- [x] `js/custom.js` cache-busting version query added
- [x] Camps section updated with three event-style cards
- [x] Camps cards aligned to equal height
- [x] Book / Apply buttons linked to #contacts
- [x] Camps card brand colors updated with dark hover fill, light readable hover text, and default card backing removed
- [x] Camps section checked on desktop and mobile
- [x] Camps connected to live Google Sheets data with static fallback cards retained
- [x] Camps live CTA buttons prefill the booking Training format field from live `training_format`
- [x] Coach / Academy section redesigned as tabbed information block
- [x] Coach and Academy tabs updated with real images
- [x] Method and Philosophy tabs updated with skill/value panels
- [x] Coach / Academy tabs updated with brand color capsule states
- [x] Coach / Academy section updated with full-section local video background `videos/coach-academy-bg.mp4`, dark overlay, and glass-style content card
- [x] Coach / Academy background video optimized for web use: same `videos/coach-academy-bg.mp4` path, H.264 MP4, audio removed, about 23 MB
- [x] Buttons linked to #contacts and #programs
- [x] Section checked on desktop and mobile
- [x] Booking section updated with live training request form
- [x] Form includes name, email, phone, numeric Player age, training format, Preferred date, Preferred time, and message fields
- [x] Programs, Camps, and Coach tab CTAs prefill the Contact form Training format field with `data-training-format` and `js/custom.js`
- [x] Camp-specific Training format options added for Summer Goalie Camp, Weekend Intensive, and Preseason Goalie Intensive
- [x] Contact form includes Preferred date field aligned with Training format
- [x] Schedule Request Availability flow prefills Training format and Preferred date in the Contact form
- [x] Contact form focus styling updated from browser blue to Goalie Academy brand red
- [x] Book Training form connected to Google Apps Script and Google Sheets
- [x] Booking requests save to the `Bookings` sheet
- [x] Booking POST updated to the unified Apps Script endpoint; new rows receive `status = new` and empty `notes`
- [x] Booking rows include server-generated `booking_id` for Telegram CRM status updates
- [x] Booking form sends name, goalie_age, training_type, preferred_date, preferred_time, phone, email, message, and source
- [x] Booking age group dropdown replaced with numeric Player age input; `goalie_age=12` is sent for age 12 and invalid ages are blocked/rejected
- [x] Stage 14I-B: normal website booking POST switched to Worker `/api/booking`; Store inquiries stayed on Apps Script until the later Stage 19C-B switch
- [x] Stage 19C-B: Store / Ask About Gear POST switched to Worker `/api/store-inquiry`; public live data GET endpoints remain on Apps Script
- [x] Booking form keeps URLSearchParams/form-url-encoded payload and existing user-facing success/error/loading UX
- [x] Minimal duplicate in-flight submit guard added for booking form submissions
- [x] Preferred time custom wheel picker added
- [x] Manual Preferred time input syncs with the wheel picker
- [x] Booking form includes loading, success, and error states
- [x] Booking form validation requires name, training format, and email or phone
- [x] Booking section checked on desktop and mobile
- [x] Booking navigation item renamed to Schedule
- [x] Contacts navigation item renamed to Contact
- [x] Schedule section redesigned from table layout into an interactive calendar-style layout
- [x] Schedule calendar opens on the current month, highlights today, supports previous/next navigation, and includes a Today button
- [x] Schedule calendar dates are clickable and update the right-side panel
- [x] Schedule fallback panel shows selectable training format option cards when no fixed sessions exist for the selected date
- [x] Standalone bottom Schedule CTA removed; right-side Request Availability action remains
- [x] Schedule connected to live Google Apps Script JSON with static fallback data, by-request rows, monthly rows, exact-date event markers, and exact-date event detail cards
- [x] Schedule fallback training format options now use active live Schedule items after successful fetch, with static fallback retained if live fetch fails
- [x] Schedule initial loading state added so static fallback options do not visibly flash before live data loads
- [x] Schedule public Age Model v2 display support added: `age_label` displays first, with old `age` as fallback
- [x] Cooperation section updated with three partnership cards
- [x] Cooperation section colors polished to match Goalie Academy brand styling
- [x] Contact actions changed to centered icon-only buttons
- [x] Bottom CTA simplified without heavy background card
- [x] Contact icons linked to #contacts
- [x] Cooperation section checked on desktop and mobile
- [x] Reviews section redesigned as calm testimonial cards
- [x] Reviews accent colors updated to match Goalie Academy brand styling
- [x] Programs and Reviews checked on desktop and mobile
- [x] Academy Store preview section added after Reviews and before Contact
- [x] Academy Store connected to live Google Sheets data with static fallback, `goalieAcademy.store.v1` cache, and tab-return refresh; CTA still links to #contacts only
- [x] Store remains preview/interest only with no cart, payment, or checkout
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
- [x] CTA and Schedule fallback option states visually polished with refined Hero CTA defaults, thin-outline shared CTA buttons, readable Camps CTA hover text, and clean red selected/focus styling for training format cards
- [x] Global script cleanup completed by removing missing `jquery.mobile.customized.min.js` import and fixing the RetinaJS browser export issue in `js/all.js`
- [x] Legacy form script loading removed from `index.html` and old unused contact form block removed from `js/custom.js`; active Book Training form, Google Sheets submission, CTA prefill, and Preferred time picker remain active
- [x] Footer redesigned with Goalie Academy square logo, two-column navigation, dark logo-matched background, copyright `All Rights Reserved. © 2026 Goalie Academy`, and design credit `Design By: M19`
- [x] Schedule and Contact checked on mobile during final launch QA
- [ ] Replace placeholder contact/social links with real email, phone, WhatsApp, and Instagram links before public launch
- [x] Connect Schedule calendar to live Google Sheets data / dynamic sync
- [ ] Optionally delete retained legacy files `js/contact_me.js` and `js/jqBootstrapValidation.js` after a final regression pass
- [x] Add Telegram booking notification and admin status buttons
- [x] Add Worker Telegram notification for new website bookings
- [x] Migrate website `StoreInquiries` POST path to Worker
- [ ] Add Worker email / `EmailQueue` integration after audit
- [ ] Link booking requests to `Schedule`
- [ ] Add booking notes / follow-up workflow
- [ ] Complete final Apps Script cleanup/removal and security cleanup/secret rotation before public launch/final cutover
- [ ] Publish with GitHub Pages

## Future roadmap

- Monitor and QA the website Worker booking flow.
- Monitor the Worker Telegram notification flows for normal bookings and Store inquiries.
- Later: Link booking to Schedule.
- Later: Notes / follow-up.
- Later: Email / EmailQueue audit.
- Monitor and QA the website Worker Store inquiry flow.
- Later: Apps Script cleanup/removal.

## Recent milestones

- be86eba — Switch store inquiries to Worker
- Stage 14I-B — Switch normal website booking POST to Worker

## Useful links

Google Docs Roadmap:

_Add link here_

Google Sheets Website Data:

_Add link here_

GitHub repository:

https://github.com/NikM19/goalie-academy-site

GitHub Pages:

_Add link after publishing_

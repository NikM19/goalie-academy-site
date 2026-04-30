# AGENTS.md — Goalie Academy Website

## Project overview

This is a one-page HTML/CSS/JS landing page for Goalie Academy, a hockey goalie training academy for U7–U20 players.

The MVP is built with:

- HTML
- CSS
- JavaScript
- GitHub Pages
- Google Sheets
- Google Apps Script
- Telegram Bot notifications

The base template is OnNext.

Training Studio is only a reference for:

- hero video background idea
- schedule section idea

Do not directly mix CSS/JS from different templates unless explicitly asked.

## Client brief structure

Follow the original client brief structure:

1. Home / Hero
2. Programs
3. Camps & Intensives
4. Coach / Academy
5. Schedule & Booking
6. Cooperation
7. Reviews
8. Contacts

Do not add extra top-level menu items unless explicitly asked.

## General working rules

- Keep the site one-page.
- Keep the page mobile-friendly.
- Keep the site fast and simple.
- Do not add WordPress.
- Do not add Next.js.
- Do not add Stripe until explicitly asked.
- Do not add Google Sheets or Telegram integration until explicitly asked.
- Do not delete assets or folders unless explicitly asked.
- Prefer small, focused changes.
- Preserve existing CSS/JS links unless a task requires changing them.

## README.md rules

For README.md updates:

- You may update README.md automatically when the task is only about documentation or project progress.
- Change only README.md.
- Show the diff before committing.
- If and only if README.md is the only changed file, commit the change.
- Push the commit to the main branch after committing.

Recommended commit messages for README updates:

- `Update README progress`
- `Update README progress after structure setup`
- `Update README project notes`

## Code change rules

For changes to:

- index.html
- style.css
- css/
- js/
- images/
- assets/

Do not commit or push automatically.

Instead:

1. Make the requested changes.
2. Show the list of changed files.
3. Show a short summary of what changed.
4. Stop and wait for the user to test the site with Live Server.
5. Commit/push only after the user explicitly approves.

## Testing / verification

After HTML/CSS/JS changes, the user will check the site with Live Server.

Do not assume visual changes are approved until the user confirms that the page works in the browser.

## Current workflow

Current stage:

- OnNext has been added as the base template.
- Navigation and landing structure have been prepared according to the client brief.
- Next planned task: prepare the Hero section for Goalie Academy.
# Lantway Immigrant Inc.: Sample Website

A responsive front-end sample site for a nonprofit immigration law clinic that serves low-income immigrants and refugees. It's built with plain **HTML, CSS and JavaScript**, with no frameworks or build step.

> Built as a front-end sample project. Client stories and impact numbers are illustrative.

## Features

- Responsive layout: desktop, tablet and mobile, with a hamburger menu
- Sticky header that highlights the section you're viewing
- Animated impact counters that start when scrolled into view
- Service cards you can filter by category
- Auto-playing client stories carousel with dots and arrows
- Intake form with client-side validation, a character counter and a success message
- FAQ accordion using native `<details>`
- Donation amount picker, newsletter signup and a back-to-top button
- Accessibility: skip link, ARIA attributes, keyboard focus styles, `prefers-reduced-motion` support

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure and content |
| `styles.css` | Design system (CSS variables), layout and responsive rules |
| `script.js` | Interactions (navigation, counters, filters, slider, form validation) |

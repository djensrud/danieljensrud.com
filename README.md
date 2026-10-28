# Portfolio

## Files
- `index.html`  – the homepage (name, tagline, links)
- `style.css`   – all the styling; colors/font are at the top
- `about.html` (+ `about.css`) – the About page; `work.html`, `contact.html` – placeholder pages ("being worked on", styled by `coming-soon.css`)
- `site-header.css` + `menu.js` – the header (logo, Work/About/Contact links) and the phone hamburger menu on the inner pages
- `transition.css` + `transition.js` – the page-to-page animations, and the code that keeps addresses clean (`/about`, not `/about.html`)
- `assets/`     – your video and images

## Editing
- Change your name, tagline, and links in `index.html`.
- Change colors, font, and video darkness in the `:root` block at the top of `style.css`.
- Add a new page: copy `about.html`, rename it (e.g. `projects.html`), and link to it as `/projects` (no .html) from the nav.
- Links between your own pages are written without `.html` (`/work`, `/about`, `/contact`, and `/` for the homepage). GitHub Pages serves them automatically.

## Preview locally
Open `index.html` in your browser, or run `python3 -m http.server` in this folder and visit http://localhost:8000

## Publish on GitHub Pages
1. Put these files in a GitHub repo (`index.html` at the top level).
2. Repo > Settings > Pages > Source: "Deploy from a branch" > `main` / root > Save.
3. Your site appears at `https://<username>.github.io/<repo>/` after a minute or two.
   Edit a file on GitHub (or push changes) and the site updates.

# Portfolio

## Files
- `index.html`  – the homepage (name, tagline, links)
- `style.css`   – all the styling; colors/font are at the top
- `work.html`, `about.html`, `contact.html` – placeholder pages ("being worked on"); they share `coming-soon.css`
- `assets/`     – your video and images

## Editing
- Change your name, tagline, and links in `index.html`.
- Change colors, font, and video darkness in the `:root` block at the top of `style.css`.
- Add a new page: copy `index.html`, rename it (e.g. `work.html`), and link to it from the nav.

## Preview locally
Open `index.html` in your browser, or run `python3 -m http.server` in this folder and visit http://localhost:8000

## Publish on GitHub Pages
1. Put these files in a GitHub repo (`index.html` at the top level).
2. Repo > Settings > Pages > Source: "Deploy from a branch" > `main` / root > Save.
3. Your site appears at `https://<username>.github.io/<repo>/` after a minute or two.
   Edit a file on GitHub (or push changes) and the site updates.

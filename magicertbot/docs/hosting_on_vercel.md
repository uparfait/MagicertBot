# Hosting on Vercel

## How Vercel runs the app

Files: `vercel.json`, `api/index.js`

- `api/index.js` hands every request to the Express app in `src/app.js`.
- The `rewrites` rule sends every address to that function, so Express
  decides what to answer: a file, an API reply or the page.
- `includeFiles` packs the `client/` folder (styles, scripts, images and
  page parts) together with the function.
- `maxDuration` gives each request up to 60 seconds. Waiting for Let's
  Encrypt to confirm can take a little while.

On your own computer, `server.js` starts the same Express app.

## Steps to put it online

1. Push this repository to GitHub, GitLab or Bitbucket.
2. In Vercel, choose **Add New → Project** and pick the repository.
3. Set **Root Directory** to `magicertbot`, because the app lives there.
4. Leave the build settings empty. There is no build step.
5. Run `npm run make_key` on your computer. Under **Settings →
   Environment Variables**, add `HANDSHAKE_PRIVATE_KEY` with the printed
   value.
6. Press **Deploy**.

Every push to the main branch deploys again by itself.

## Good to know

- **The key matters here.** Vercel runs many copies of the app. They all
  need the same `HANDSHAKE_PRIVATE_KEY`, or a sealed order made by one
  copy cannot be opened by another.
- **Progress updates** are sent as each line is written. If streaming is
  ever turned off, the page still works and the bar jumps to the end.
- **Time limit**: 60 seconds is allowed on every Vercel plan.
- **Request size**: Vercel accepts up to 4.5 MB, far more than any
  certificate zip needs.
- **Package versions**: the lock file is not kept in the repository, so
  Vercel installs the newest versions allowed by `package.json`.

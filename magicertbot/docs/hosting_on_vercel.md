# Hosting on Vercel

## How Vercel runs the app

File: `vercel.json` and `api/index.js`

- `api/index.js` hands every request to the Express app in `src/app.js`.
- The `rewrites` rule sends every address to that function, so Express
  decides what to answer: a file, an API reply or the page.
- `includeFiles` makes sure the `client/` folder (CSS, JavaScript, images
  and page parts) is packed together with the function.
- `maxDuration` gives each request up to 60 seconds. Asking Let's Encrypt
  to check DNS records can take a little while.

When you run the app on your own computer, `server.js` starts the same
Express app with `app.listen`.

## Steps to put it online

1. Push this repository to GitHub, GitLab or Bitbucket.
2. In Vercel, choose **Add New → Project** and pick the repository.
3. Set **Root Directory** to `magicertbot`, because the app lives in that
   folder.
4. Leave the build settings empty. There is no build step.
5. Press **Deploy**.

Every new push to the main branch will deploy again by itself.

You can also deploy from your computer:

```bash
npm install --global vercel
cd magicertbot
vercel
```

## Good to know

- **Progress updates**: Vercel sends each progress line as soon as it is
  written. If streaming is ever turned off, the page still works. The bar
  simply jumps to the end when the answer arrives.
- **Time limit**: 60 seconds is allowed on every Vercel plan, including
  the free Hobby plan, and it is plenty for this app.
- **Request size**: Vercel accepts request bodies up to 4.5 MB, which is
  far more than any certificate ZIP needs.
- **Package versions**: the lock file is not kept in the repository, so
  Vercel installs the newest versions allowed by `package.json`.

# PARNIKA — A Little Universe of Wishes

A mobile-first, Persian RTL cosmic gift website with a dreamy blue palette.

## Included

- `index.html` — all site sections and modals
- `css/style.css` — responsive visual design and animations
- `js/app.js` — star messages, intro, canvas starfield, sound, unlock logic, gifts and shooting-star animation
- `data/texts.json` — editable public UI content and star messages
- `data/letters.enc.json` / `data/gifts.enc.json` — encrypted demo content
- `tools/encrypt.html` — browser-only AES-GCM encryption tool for replacing the private content
- `assets/` — reserved for optional local media

## Run locally

Do not test by opening `index.html` as `file://` if you want the JSON and encrypted files to load. Use a local static server. If Node.js is installed:

```bash
npx serve .
```

Or use Python:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Demo unlock

The encrypted sample files use the temporary demo passphrase:

`parnika-demo`

**Replace it before publishing your private content.** The demo phrase is intentionally documented because this is a starter project, not a private production secret. Do not use it for real letters.

## Change the text shown in the sky

Edit `data/texts.json`, especially `starMessages`. The app loads these messages from JSON. If you want to add more stars, edit the `positions` array in `js/app.js`.

## Replace letters and gifts securely

1. Open `tools/encrypt.html` from the same local server (or after deploying the project to a private local copy).
2. Choose `letters` and paste your original JSON using the schema below.
3. Enter a strong passphrase (12+ characters; longer is better), encrypt, and save the downloaded `letters.enc.json` to `data/letters.enc.json`.
4. Repeat for `gifts`, using the exact same passphrase, and replace `data/gifts.enc.json`.
5. Never commit plaintext letters, plaintext gifts, or a real passphrase to the public GitHub repository.
6. Test both files before deploying.

Letters schema:

```json
{
  "letters": [
    {
      "title": "عنوان نامه",
      "preview": "پیش‌نمایش کوتاه",
      "body": "متن کامل نامه"
    }
  ]
}
```

Gifts schema:

```json
{
  "gifts": [
    {
      "title": "عنوان هدیه",
      "description": "توضیح کوتاه",
      "emoji": "🎁",
      "glow": "#9de7ff",
      "letter": "نامه‌ی داخل هدیه"
    }
  ]
}
```

The encryption uses Web Crypto PBKDF2-SHA-256 (250,000 iterations) and AES-256-GCM. Each file gets a random salt and IV. Decryption happens in the visitor's browser. Since GitHub Pages is static hosting, the encrypted blobs are public, but their contents are protected by the passphrase. Choose a strong passphrase; a weak phrase can be guessed offline.

## Sound

The original calm cosmic ambience is synthesized locally with Web Audio when the visitor taps the intro button (the first tap is required by browser autoplay rules). The sound button can mute/unmute it later; no third-party audio file is used.

## Wishes / Telegram

The sky section now creates 42 randomly placed interactive stars per page load, and a low-opacity PARNIKA constellation sits in the page background. The shooting-star animation is implemented, but Telegram delivery is intentionally **not connected yet**. The page clearly marks this as a demo. In the next phase, add a small Node.js API on Pxxl and keep the Telegram bot token in Pxxl environment variables. Do not put the token in this repository.

Before connecting the API, add server-side validation, request size limits, rate limiting, and a same-origin/CORS policy suitable for the deployed GitHub Pages URL.

## Deploy to GitHub Pages

1. Upload the contents of this folder into your existing repository (not the outer `PARNIKA` folder unless you want that nesting).
2. In GitHub repository settings, open **Pages**.
3. Select the branch and folder containing `index.html` (commonly `main` / root).
4. Wait for the Pages build and open the published URL.
5. Keep all private plaintext files and secrets out of the repository.

## Notes

- This version does not need a build step or external JavaScript packages.
- Google Fonts are loaded by CSS if network access is available; system fallbacks are provided.
- `localStorage` remembers discovered stars on that browser/device only.
- For accessibility, animations are reduced when the operating system requests reduced motion.

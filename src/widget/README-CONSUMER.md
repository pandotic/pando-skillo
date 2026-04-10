# Embedding the Skill Store Widget

The Skill Store can be embedded as a full-page section in any React app. It loads at runtime from the deployed Netlify URL, so updates to the skill store propagate automatically — no version pinning or dependency installation needed.

## Quick Start (React)

```jsx
import { useEffect, useRef } from 'react';

const SKILL_STORE_URL = 'https://pando-skillo.netlify.app';

export default function SkillStorePage() {
  const containerRef = useRef(null);
  const widgetRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    import(/* webpackIgnore: true */ `${SKILL_STORE_URL}/widget/skill-store.mjs`)
      .then(({ mount }) => {
        if (cancelled) return;
        widgetRef.current = mount(containerRef.current, {
          // Optional: pass an existing GitHub token to skip auth
          // ghToken: 'gho_...',
        });
      });

    return () => {
      cancelled = true;
      widgetRef.current?.unmount();
    };
  }, []);

  return <div ref={containerRef} style={{ minHeight: '100vh' }} />;
}
```

> The `/* webpackIgnore: true */` comment prevents bundlers from trying to
> resolve the remote URL at build time. Vite handles dynamic URLs natively,
> so the comment is harmless there.

## API

### `mount(container, options?)`

Mounts the skill store into a DOM element.

| Option | Type | Description |
|--------|------|-------------|
| `ghToken` | `string` | Pre-existing GitHub OAuth token. Skips the sign-in step. |
| `authOrigin` | `string` | Override the origin used for the OAuth popup callback. Defaults to `https://pando-skillo.netlify.app`. |

**Returns** `{ unmount(), update(newOptions) }`

- `unmount()` — removes the widget and cleans up the React root
- `update(opts)` — re-renders with merged options (e.g., pass a new `ghToken`)

## How It Works

1. Your app loads `skill-store.mjs` from the skill store's Netlify deployment
2. The widget creates its own React 18 root inside the container (isolated from your app's React version)
3. All CSS is scoped under `.pando-skill-store` so it won't clash with your styles
4. GitHub OAuth opens in a popup window — no full-page redirects in your app
5. When you deploy changes to pando-skillo, consumers automatically get the latest

## Authentication Flow

When embedded, GitHub OAuth uses a **popup window** instead of a full-page redirect:

1. User clicks "Sign in with GitHub"
2. A popup opens pointing to GitHub's OAuth page
3. After authorizing, GitHub redirects the popup to the skill store's callback page
4. The callback page exchanges the code for a token (server-side via Netlify function)
5. The token is posted back to your app via `postMessage`
6. The popup closes automatically

If your app already has a GitHub token (e.g., from its own auth flow), pass it as `ghToken` to skip this entirely.

## Vanilla JS / Non-React

```html
<div id="skill-store"></div>
<script type="module">
  const { mount } = await import('https://pando-skillo.netlify.app/widget/skill-store.mjs');
  const widget = mount(document.getElementById('skill-store'));

  // Later: widget.unmount();
</script>
```

## Style Isolation

The widget's CSS is fully scoped under `.pando-skill-store`. It uses:
- Its own Tailwind v3 build (won't conflict with your Tailwind v4 or other CSS frameworks)
- Prefixed selectors so utility classes like `.bg-purple-600` only apply inside the widget
- Its own bundled React 18 (won't conflict with your React 19 or other version)

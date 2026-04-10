import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App';
import '../index.css';

const STYLE_ID = 'pando-skill-store-css';

/**
 * Resolve the base URL of this module so we can load the companion style.css
 * from the same location (works whether served from Netlify or a local dev server).
 */
function getBaseUrl() {
  try {
    return new URL('.', import.meta.url).href;
  } catch {
    return '';
  }
}

/**
 * Inject the scoped stylesheet if not already present.
 * Returns the <link> element (or null if CSS was inlined by the build).
 */
function injectStyles() {
  if (document.getElementById(STYLE_ID)) return null;

  const base = getBaseUrl();
  if (!base) return null;

  const link = document.createElement('link');
  link.id = STYLE_ID;
  link.rel = 'stylesheet';
  link.href = `${base}style.css`;
  document.head.appendChild(link);
  return link;
}

/**
 * Mount the Skill Store widget into a container element.
 *
 * @param {HTMLElement} container - The DOM element to render into
 * @param {Object}  [options]
 * @param {string}  [options.ghToken]     - Pre-existing GitHub token (skips auth)
 * @param {string}  [options.authOrigin]  - Origin of the skill store for OAuth popup
 *                                          (defaults to https://pando-skillo.netlify.app)
 * @returns {{ unmount: () => void, update: (opts: Object) => void }}
 */
export function mount(container, options = {}) {
  const link = injectStyles();

  // Create scoped wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'pando-skill-store';
  container.appendChild(wrapper);

  const root = ReactDOM.createRoot(wrapper);

  function render(opts) {
    root.render(
      <App
        embedded={true}
        ghToken={opts.ghToken}
        authOrigin={opts.authOrigin}
      />
    );
  }

  render(options);

  return {
    unmount() {
      root.unmount();
      wrapper.remove();
      if (link) link.remove();
    },
    update(newOptions) {
      render({ ...options, ...newOptions });
    },
  };
}

export default { mount };

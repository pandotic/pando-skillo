const GITHUB_CLIENT_ID = 'Ov23lictx0nzL5xiXx2D';
const SKILL_STORE_ORIGIN = 'https://pando-skillo.netlify.app';

/**
 * Opens GitHub OAuth in a popup window. The popup redirects to the skill store's
 * auth-callback page, which exchanges the code for a token and posts it back
 * via postMessage.
 *
 * @param {Object} options
 * @param {string} [options.authOrigin] - Origin of the skill store (for the callback URL)
 * @returns {Promise<string>} Resolves with the GitHub access token
 */
export function openAuthPopup({ authOrigin } = {}) {
  const origin = authOrigin || SKILL_STORE_ORIGIN;

  return new Promise((resolve, reject) => {
    const redirectUri = `${origin}/widget/auth-callback.html`;
    const authUrl =
      `https://github.com/login/oauth/authorize` +
      `?client_id=${GITHUB_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=repo`;

    // Center the popup
    const width = 500;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const features = `width=${width},height=${height},left=${left},top=${top},popup=yes`;

    const popup = window.open(authUrl, 'github-auth', features);
    if (!popup) {
      reject(new Error('Popup blocked — please allow popups for this site.'));
      return;
    }

    function onMessage(event) {
      // Only accept messages from the skill store origin
      if (event.origin !== origin) return;
      if (event.data?.type !== 'gh-auth-token') return;

      window.removeEventListener('message', onMessage);
      clearInterval(pollTimer);

      if (event.data.token) {
        resolve(event.data.token);
      } else {
        reject(new Error(event.data.error || 'Authentication failed'));
      }
    }

    window.addEventListener('message', onMessage);

    // Poll to detect if the user closed the popup without completing auth
    const pollTimer = setInterval(() => {
      if (popup.closed) {
        clearInterval(pollTimer);
        window.removeEventListener('message', onMessage);
        reject(new Error('Authentication cancelled'));
      }
    }, 500);
  });
}

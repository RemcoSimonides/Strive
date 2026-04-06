export interface AuthorizePageParams {
  clientId: string
  clientName: string
  redirectUri: string
  state?: string
  codeChallenge: string
  scopes: string[]
  callbackUrl: string
}

const SCOPE_LABELS: Record<string, string> = {
  'goals:read': 'View your goals',
  'goals:write': 'Create and edit goals',
  'milestones:read': 'View milestones',
  'milestones:write': 'Create and edit milestones',
  'posts:read': 'View story posts',
  'posts:write': 'Create and edit story posts',
  'reminders:read': 'View reminders',
  'reminders:write': 'Create and edit reminders',
}

export function getAuthorizePage(params: AuthorizePageParams): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const jsStr = (s: string) => JSON.stringify(s)

  const scopeItems = params.scopes.length > 0
    ? params.scopes.map(s => `<li>${esc(SCOPE_LABELS[s] || s)}</li>`).join('')
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#F7941D" />
  <title>Authorize - Strive Journal</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', sans-serif;
      background: #121212;
      color: #fff;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    @media (prefers-color-scheme: light) {
      body { background: #FDF5EC; color: #3E2723; }
      .card { background: #FFFBF5; border-color: rgba(247, 148, 29, 0.3); }
      .subtitle { color: #6D4C41; }
      .client-name { color: #E07800; }
      .scope-list li { color: #5D4037; }
      .scope-list li::before { color: #F7941D; }
      .form-group label { color: #6D4C41; }
      .form-group input { background: #FDF5EC; border-color: rgba(247, 148, 29, 0.3); color: #3E2723; }
      .form-group input:focus { border-color: #F7941D; box-shadow: 0 0 0 2px rgba(247, 148, 29, 0.15); }
      .form-group input::placeholder { color: #A1887F; }
      .divider { border-color: rgba(247, 148, 29, 0.2); }
      .error { color: #C62828; }
      .spinner { color: #6D4C41; }
      .spinner .dot { background: #F7941D; }
    }

    .card {
      background: #1e1e1e;
      border: 1px solid #333;
      border-radius: 12px;
      padding: 2rem;
      max-width: 420px;
      width: 100%;
      margin: 1rem;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 0.75rem;
    }
    .logo svg { flex-shrink: 0; }
    .logo-text {
      font-size: 1.35rem;
      font-weight: 700;
      background: linear-gradient(135deg, #F7941D, #fbb35a);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .subtitle {
      color: #aaa;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
      line-height: 1.5;
    }
    .client-name { color: #fbb35a; font-weight: 600; }

    .scope-list {
      margin-bottom: 1.5rem;
      padding: 0;
      list-style: none;
    }
    .scope-list h3 {
      font-size: 0.8rem;
      font-weight: 500;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }
    .scope-list li {
      font-size: 0.9rem;
      color: #ccc;
      padding: 0.3rem 0;
      padding-left: 1.2rem;
      position: relative;
    }
    .scope-list li::before {
      content: '\\2713';
      position: absolute;
      left: 0;
      color: #00B3A3;
      font-weight: 700;
    }

    .form-group { margin-bottom: 1rem; }
    .form-group label {
      display: block;
      font-size: 0.85rem;
      font-weight: 500;
      color: #999;
      margin-bottom: 0.35rem;
    }
    .form-group input {
      width: 100%;
      padding: 0.65rem 0.85rem;
      background: #161616;
      border: 1px solid #333;
      border-radius: 8px;
      color: #fff;
      font-family: 'Inter', sans-serif;
      font-size: 0.95rem;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .form-group input:focus {
      outline: none;
      border-color: #F7941D;
      box-shadow: 0 0 0 2px rgba(247, 148, 29, 0.2);
    }
    .form-group input::placeholder { color: #555; }

    .btn {
      width: 100%;
      padding: 0.75rem;
      background: #F7941D;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-family: 'Inter', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 0.5rem;
      transition: background 0.15s, transform 0.1s;
    }
    .btn:hover { background: #E07800; }
    .btn:active { transform: scale(0.98); }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    .btn-google {
      background: #fff;
      color: #3E2723;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      font-weight: 500;
      border: 1px solid #333;
    }
    .btn-google:hover { background: #f5f5f5; border-color: #999; }

    .divider {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 1.25rem 0;
      color: #666;
      font-size: 0.8rem;
    }
    .divider::before, .divider::after {
      content: '';
      flex: 1;
      border-top: 1px solid #333;
    }

    .error {
      color: #ef5350;
      font-size: 0.85rem;
      margin-top: 0.75rem;
      display: none;
      padding: 0.5rem 0.75rem;
      background: rgba(239, 83, 80, 0.1);
      border-radius: 6px;
    }

    .spinner {
      display: none;
      text-align: center;
      padding: 2rem 1rem;
      color: #aaa;
    }
    .spinner .dots {
      display: flex;
      justify-content: center;
      gap: 0.4rem;
      margin-bottom: 0.75rem;
    }
    .spinner .dot {
      width: 8px;
      height: 8px;
      background: #F7941D;
      border-radius: 50%;
      animation: bounce 1.2s ease-in-out infinite;
    }
    .spinner .dot:nth-child(2) { animation-delay: 0.15s; }
    .spinner .dot:nth-child(3) { animation-delay: 0.3s; }
    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }

    .footer {
      margin-top: 1.5rem;
      text-align: center;
      font-size: 0.75rem;
      color: #666;
    }
    .footer a { color: #F7941D; text-decoration: none; }
    .footer a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <span class="logo-text">Strive Journal</span>
    </div>

    <div class="subtitle">
      <span class="client-name">${esc(params.clientName)}</span> wants to access your Strive account
    </div>

    ${scopeItems ? `
    <div class="scope-list">
      <h3>Permissions requested</h3>
      <ul>${scopeItems}</ul>
    </div>
    ` : ''}

    <div id="auth-form">
      <button class="btn btn-google" onclick="signInWithGoogle()">
        <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/><path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
        Continue with Google
      </button>

      <div class="divider">or</div>

      <form onsubmit="signInWithEmail(event)">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" required placeholder="you@example.com" autocomplete="email" />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" required placeholder="Password" autocomplete="current-password" />
        </div>
        <button type="submit" class="btn" id="submit-btn">Sign in &amp; Authorize</button>
      </form>

      <div class="error" id="error-msg"></div>
    </div>

    <div class="spinner" id="spinner">
      <div class="dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
      Authorizing...
    </div>

    <div class="footer">
      <a href="https://strivejournal.com">strivejournal.com</a>
    </div>
  </div>

  <script type="module">
    import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js'
    import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js'

    const firebaseConfig = {
      apiKey: "AIzaSyAIg4VtWaOMi5ASSr9Dc5PH-memu-58xXQ",
      authDomain: "strive-journal.firebaseapp.com",
      projectId: "strive-journal",
      appId: "1:423468347975:web:6e2be7bea1c4475ad2f762",
    }

    const app = initializeApp(firebaseConfig)
    const authInstance = getAuth(app)
    const googleProvider = new GoogleAuthProvider()

    const callbackUrl = ${jsStr(params.callbackUrl)}
    const clientId = ${jsStr(params.clientId)}
    const redirectUri = ${jsStr(params.redirectUri)}
    const state = ${jsStr(params.state || '')}
    const codeChallenge = ${jsStr(params.codeChallenge)}
    const scopes = ${JSON.stringify(params.scopes)}

    function showError(msg) {
      const el = document.getElementById('error-msg')
      el.textContent = msg
      el.style.display = 'block'
    }

    function hideError() {
      document.getElementById('error-msg').style.display = 'none'
    }

    function showSpinner() {
      document.getElementById('auth-form').style.display = 'none'
      document.getElementById('spinner').style.display = 'block'
    }

    function hideSpinner() {
      document.getElementById('auth-form').style.display = 'block'
      document.getElementById('spinner').style.display = 'none'
    }

    async function handleIdToken(idToken) {
      showSpinner()
      try {
        const res = await fetch(callbackUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken, clientId, redirectUri, state, codeChallenge, scopes }),
        })
        const data = await res.json()
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl
        } else {
          hideSpinner()
          showError(data.error || 'Authorization failed')
        }
      } catch (e) {
        hideSpinner()
        showError('Network error. Please try again.')
      }
    }

    window.signInWithEmail = async function(e) {
      e.preventDefault()
      hideError()
      const email = document.getElementById('email').value
      const password = document.getElementById('password').value
      document.getElementById('submit-btn').disabled = true
      try {
        const cred = await signInWithEmailAndPassword(authInstance, email, password)
        const idToken = await cred.user.getIdToken()
        await handleIdToken(idToken)
      } catch (err) {
        showError(err.message || 'Sign-in failed')
        document.getElementById('submit-btn').disabled = false
      }
    }

    window.signInWithGoogle = async function() {
      hideError()
      try {
        const cred = await signInWithPopup(authInstance, googleProvider)
        const idToken = await cred.user.getIdToken()
        await handleIdToken(idToken)
      } catch (err) {
        if (err.code !== 'auth/popup-closed-by-user') {
          showError(err.message || 'Google sign-in failed')
        }
      }
    }
  </script>
</body>
</html>`
}

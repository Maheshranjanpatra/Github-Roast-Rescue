import React from 'react';

function GitHubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.05c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.74.08-.74 1.2.09 1.84 1.23 1.84 1.23 1.07 1.84 2.8 1.31 3.49 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.45 11.45 0 0 1 6 0c2.29-1.55 3.29-1.23 3.29-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.62-2.8 5.65-5.48 5.95.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

export default function Navbar() {
  return (
    <header className="gnav-shell">
      <nav className="gnav" aria-label="Main navigation">
        <div className="gnav-inner">
          <div className="gnav-bar">

            {/* Brand */}
            <a
              href="/"
              className="gnav-brand"
              aria-label="GitHub Roast and Rescue home"
            >
              <span className="gnav-logo">
                <GitHubIcon />
              </span>

              <span className="gnav-brand-text">
                <span className="gnav-name">
                  GitHub Roast &amp; Rescue
                </span>

                <span className="gnav-tagline">
                  AI GitHub Career Auditor
                </span>
              </span>
            </a>

            {/* Status */}
            <div className="gnav-status">
              <span className="gnav-status-dot" />
              <span>AI AUDITOR</span>
            </div>

          </div>
        </div>
      </nav>
    </header>
  );
}

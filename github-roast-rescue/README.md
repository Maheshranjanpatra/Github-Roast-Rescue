# GitHub Roast & Rescue

> Analyze your GitHub profile, discover what recruiters may notice, and get an actionable plan to improve it.

🌐 **Live Demo:** https://github-roast-rescue.onrender.com

GitHub Roast & Rescue is a GitHub profile auditing tool that analyzes repository quality, developer activity, documentation, project signals, and portfolio presentation to generate a recruiter-readiness score.

Instead of relying entirely on an AI model to judge a profile, the application first calculates deterministic scores from GitHub data and then uses AI to explain the results and generate practical recommendations.

## ✨ Features

- 🔍 GitHub profile analysis
- 📊 Recruiter-readiness scoring
- 📈 Profile-wide activity analysis
- 🧑‍💻 Repository quality and engineering signals
- 📚 README and documentation analysis
- ⭐ Repository popularity and project signals
- 🗂️ Portfolio/project curation analysis
- 🤖 AI-powered roast and improvement recommendations
- 🛠️ Personalized rescue plan
- 🔄 Graceful fallbacks when AI analysis is unavailable
- 🌐 Live web application

## 🧠 How It Works

The analysis is divided into two levels.

### 1. Profile-wide analysis

The application uses the available repository set to calculate signals such as:

- Repository activity
- Original vs. fork ratio
- Language diversity
- Stars and forks
- Repository count
- Recent development activity

This prevents the overall profile from being judged only from a handful of repositories.

### 2. Deep project analysis

A smaller set of high-value repositories is selected for deeper inspection.

The selection combines:

- Recent activity
- Repository popularity
- Project metadata
- Documentation signals
- Other repository quality indicators

The application then analyzes project-level information such as:

- README availability
- README characteristics
- Project description
- Homepage/demo information
- License information
- Topics
- Repository size
- Engineering signals

### 3. Deterministic scoring

The numeric score is calculated by the application's scoring engine rather than allowing an AI model to arbitrarily choose the score.

The system combines signals into categories such as:

- **Technical**
- **Documentation**
- **Activity**
- **Portfolio**

These are combined into the overall recruiter-readiness score.

### 4. AI interpretation

After the deterministic analysis, the AI layer interprets the results and produces:

- A recruiter-style roast
- Evidence behind the assessment
- Strengths
- Weaknesses
- Priority improvements
- A practical rescue plan

If AI analysis fails, deterministic fallback content is used so the application can still return useful results.

## 🏗️ Architecture

```text
                GitHub API
                    │
                    ▼
             Data Collection
                    │
                    ▼
             Data Normalization
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
   Profile-wide Data     Deep Project Data
          │                   │
          └─────────┬─────────┘
                    ▼
              Scoring Engine
                    │
                    ▼
            Recruiter Score
                    │
                    ▼
              AI Analysis
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
       Roast/Evidence     Rescue Plan
                    │
                    ▼
                 Frontend
```

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- CSS
- Modern component-based UI

### Backend

- Node.js
- Express
- GitHub API
- Google Gemini API

### Deployment

- Render

## 🚀 Running Locally

### Requirements

Make sure you have:

- Node.js
- npm
- A GitHub API token if required by your configuration
- A Gemini API key for AI analysis

### Installation

Clone the repository:

```bash
git clone <your-repository-url>
cd github-roast-rescue
```

Install dependencies:

```bash
npm install
```

If the project has separate frontend and backend packages, install dependencies in both directories:

```bash
cd server
npm install

cd ../client
npm install
```

### Environment Variables

Create the appropriate `.env` file used by the backend and configure your API credentials.

Example:

```env
GITHUB_TOKEN=your_github_token
GEMINI_API_KEY=your_gemini_api_key
```

Do not commit API keys or other secrets to GitHub.

### Start the application

Start the backend:

```bash
cd server
npm run dev
```

Then start the frontend according to the project's package scripts.

## 📊 Scoring Philosophy

The project intentionally separates **measurement** from **interpretation**.

The scoring engine provides reproducible results from GitHub data.

The AI does not decide whether a developer deserves a particular score. Instead, it explains the calculated signals and turns them into human-readable feedback.

This makes the system easier to debug, test, and improve.

## ⚠️ Limitations

GitHub Roast & Rescue is an analytical tool, not an actual recruiter or hiring system.

The score is a heuristic based on publicly available GitHub signals. A high score does not guarantee employment, and a low score does not mean that a developer is technically weak.

Repository quality can also be difficult to judge automatically. Factors such as architecture, code correctness, originality, maintainability, and real-world impact may require human review.

## 🔐 Privacy

The application is designed to analyze publicly available GitHub profile and repository information.

Never enter API keys, passwords, or other private credentials into the application.

## 🧪 Testing

The scoring engine includes regression tests for important edge cases such as:

- Repository activity
- Repository selection
- README availability
- Fork/original repository handling
- Score calculation

Run the scoring tests with:

```bash
cd server
npm run test:scoring
```

## 🤝 Contributing

Contributions, bug reports, and improvements are welcome.

If you find an issue:

1. Open an issue describing the problem.
2. Include steps to reproduce it.
3. Explain the expected behavior.
4. Submit a pull request if you have a fix.

## 📜 License

Add your preferred license to the repository before publishing the project commercially or as open source.

---

### 🌐 Try It Live

**[github-roast-rescue.onrender.com](https://github-roast-rescue.onrender.com)**

Analyze your GitHub profile and find out what needs rescuing.

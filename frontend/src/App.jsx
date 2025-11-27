
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function CareerGoalForm({ onAnalyze, loading }) {
  const [targetRole, setTargetRole] = useState('Backend Developer');
  const [currentSkills, setCurrentSkills] = useState('Java, SQL, Git');

  const handleSubmit = async (e) => {
    e.preventDefault();
    onAnalyze({ targetRole, currentSkills });
  };

  return (
    <section className="card">
      <h2>Career Goal Input</h2>
      <p className="muted">
        Enter your target role and current skills (comma-separated). Supported roles:{" "}
        <strong>FrontendDeveloper</strong>, <strong>Backend Developer</strong>,{" "}
        <strong>Data Analyst</strong>.
      </p>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Target Role
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Backend Developer"
            required
          />
        </label>
        <label>
          Current Skills (comma separated)
          <textarea
            rows={3}
            value={currentSkills}
            onChange={(e) => setCurrentSkills(e.target.value)}
            placeholder="e.g. Java, SQL, Git"
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Analyzing…' : 'Analyze My Career Path'}
        </button>
      </form>
    </section>
  );
}

function SkillGapPanel({ result }) {
  if (!result) {
    return (
      <div className="card">
        <h2>Skill Gap Results</h2>
        <p className="muted">Run an analysis to see your matched and missing skills.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Skill Gap Results</h2>
      <p className="muted">Target Role: <strong>{result.targetRole}</strong></p>

      <div className="chip-group">
        <h3>Matched Skills</h3>
        {result.matchedSkills.length === 0 && <p className="muted">No matches yet.</p>}
        <div className="chips">
          {result.matchedSkills.map((skill) => (
            <span key={skill} className="chip success">{skill}</span>
          ))}
        </div>
      </div>

      <div className="chip-group">
        <h3>Missing Skills</h3>
        {result.missingSkills.length === 0 && <p className="muted">Great! No missing skills.</p>}
        <div className="chips">
          {result.missingSkills.map((skill) => (
            <span key={skill} className="chip warning">{skill}</span>
          ))}
        </div>
      </div>

      <div>
        <h3>Suggested Learning Order</h3>
        <ol>
          {result.suggestedLearningOrder.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ol>
      </div>

      <div>
        <h3>Recommendations</h3>
        <ul>
          {result.recommendations.map((rec, idx) => (
            <li key={idx}>{rec}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function RoadmapPanel({ roadmap }) {
  if (!roadmap) {
    return (
      <div className="card">
        <h2>Career Roadmap</h2>
        <p className="muted">Your 3-phase roadmap will appear here.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Career Roadmap</h2>
      <p className="muted">Target Role: <strong>{roadmap.targetRole}</strong></p>
      <div className="roadmap">
        {roadmap.roadmap.map((phase) => (
          <div key={phase.phase} className="roadmap-phase">
            <h3>{phase.phase}</h3>
            <p className="muted">{phase.focus}</p>
            <ul>
              {phase.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewsPanel() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${API_BASE_URL}/api/news/top-stories`);
        setStories(res.data.stories || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load news. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <section className="card">
      <h2>Latest Tech News (HackerNews)</h2>
      {loading && <p className="muted">Loading latest stories…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && stories.length === 0 && (
        <p className="muted">No stories available right now.</p>
      )}
      <ul className="news-list">
        {stories.map((story) => (
          <li key={story.id} className="news-item">
            <a href={story.url || `https://news.ycombinator.com/item?id=${story.id}`} target="_blank" rel="noreferrer">
              <h3>{story.title}</h3>
            </a>
            <p className="muted">
              Score: {story.score} | By: {story.by} | Type: {story.type}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function App() {
  const [skillGapResult, setSkillGapResult] = useState(null);
  const [roadmapResult, setRoadmapResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const handleAnalyze = async ({ targetRole, currentSkills }) => {
    setLoading(true);
    setApiError(null);
    try {
      const [gapRes, roadmapRes] = await Promise.all([
        axios.post(`${API_BASE_URL}/api/skill-gap`, { targetRole, currentSkills }),
        axios.post(`${API_BASE_URL}/api/roadmap`, { targetRole })
      ]);

      setSkillGapResult(gapRes.data);
      setRoadmapResult(roadmapRes.data);
    } catch (err) {
      console.error(err);
      setApiError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Career Path Analyzer</h1>
        <p className="muted">
          Skill-gap analysis, career roadmap, and live tech news powered by HackerNews.
        </p>
      </header>

      <main className="layout">
        <div className="top-row">
          <CareerGoalForm onAnalyze={handleAnalyze} loading={loading} />
        </div>

        {apiError && <p className="error center">{apiError}</p>}

        <div className="middle-row">
          <SkillGapPanel result={skillGapResult} />
          <RoadmapPanel roadmap={roadmapResult} />
        </div>

        <div className="bottom-row">
          <NewsPanel />
        </div>
      </main>

      <footer className="page-footer">
        <p className="muted">
          Assignment implementation for CodeAtRandom AI &mdash; Full Stack Intern.
        </p>
      </footer>
    </div>
  );
}

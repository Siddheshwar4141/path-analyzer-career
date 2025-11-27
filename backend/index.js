
import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Predefined role to skills mapping
const ROLE_SKILLS = {
  "FrontendDeveloper": ["HTML", "CSS", "JavaScript", "React", "Git"],
  "Backend Developer": ["Java", "Spring Boot", "SQL", "APIs", "Git"],
  "Data Analyst": ["Excel", "SQL", "Python", "Dashboards", "Statistics"]
};

// Helper to find role key in ROLE_SKILLS ignoring case and spaces
function findRoleKey(targetRoleRaw) {
  if (!targetRoleRaw) return null;
  const normalized = targetRoleRaw.replace(/\s+/g, '').toLowerCase();
  for (const key of Object.keys(ROLE_SKILLS)) {
    const keyNorm = key.replace(/\s+/g, '').toLowerCase();
    if (keyNorm === normalized) return key;
  }
  return null;
}

// POST /api/skill-gap
app.post('/api/skill-gap', (req, res) => {
  try {
    const { targetRole, currentSkills } = req.body;

    const roleKey = findRoleKey(targetRole);
    if (!roleKey) {
      return res.status(400).json({
        error: 'Unknown target role. Please use one of: FrontendDeveloper, Backend Developer, Data Analyst',
      });
    }

    const requiredSkills = ROLE_SKILLS[roleKey];

    let userSkills = [];
    if (Array.isArray(currentSkills)) {
      userSkills = currentSkills;
    } else if (typeof currentSkills === 'string') {
      userSkills = currentSkills.split(',').map(s => s.trim());
    }

    const norm = s => s.toLowerCase();
    const userSet = new Set(userSkills.map(norm));

    const matchedSkills = requiredSkills.filter(skill => userSet.has(norm(skill)));
    const missingSkills = requiredSkills.filter(skill => !userSet.has(norm(skill)));

    const recommendations = [
      'Start by strengthening your foundation with the basics in Phase 1.',
      'Build small projects around each new skill you learn.',
      'Share your work on GitHub and LinkedIn to build your portfolio.'
    ];

    const suggestedLearningOrder = [
      ...matchedSkills,
      ...missingSkills
    ];

    return res.json({
      targetRole: roleKey,
      inputSkills: userSkills,
      matchedSkills,
      missingSkills,
      recommendations,
      suggestedLearningOrder
    });
  } catch (err) {
    console.error('Error in /api/skill-gap', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/roadmap
app.post('/api/roadmap', (req, res) => {
  try {
    const { targetRole } = req.body;
    const roleKey = findRoleKey(targetRole) || targetRole;

    let roadmap;

    switch ((roleKey || '').replace(/\s+/g, '').toLowerCase()) {
      case 'backenddeveloper':
        roadmap = [
          {
            phase: 'Phase 1 (1–2 months)',
            focus: 'Fundamentals',
            items: ['Java basics', 'OOP concepts', 'Git & GitHub', 'Basic data structures']
          },
          {
            phase: 'Phase 2 (2 months)',
            focus: 'Backend Core',
            items: ['Spring Boot basics', 'REST APIs', 'Relational Databases & SQL', 'Error handling & logging']
          },
          {
            phase: 'Phase 3 (1–2 months)',
            focus: 'Projects & Deployment',
            items: ['Build 2–3 backend projects', 'Authentication & authorization', 'Deployment to cloud (Render/Heroku)', 'System design basics']
          }
        ];
        break;

      case 'frontenddeveloper':
        roadmap = [
          {
            phase: 'Phase 1 (1–2 months)',
            focus: 'Web Basics',
            items: ['HTML & CSS fundamentals', 'Responsive layouts', 'Basic JavaScript']
          },
          {
            phase: 'Phase 2 (2 months)',
            focus: 'React',
            items: ['React components & props', 'State & hooks', 'Routing', 'Calling APIs from frontend']
          },
          {
            phase: 'Phase 3 (1–2 months)',
            focus: 'Projects & Polish',
            items: ['2–3 portfolio projects', 'Form handling & validation', 'Basic testing', 'Deployment']
          }
        ];
        break;

      case 'dataanalyst':
        roadmap = [
          {
            phase: 'Phase 1 (1–2 months)',
            focus: 'Foundations',
            items: ['Excel basics', 'Data cleaning', 'Intro to SQL']
          },
          {
            phase: 'Phase 2 (2 months)',
            focus: 'Analysis & Visualization',
            items: ['Intermediate SQL', 'Python for analysis', 'Dashboards using Power BI / Tableau']
          },
          {
            phase: 'Phase 3 (1–2 months)',
            focus: 'Projects & Domain Knowledge',
            items: ['End-to-end data projects', 'Statistics basics', 'Domain-specific case studies']
          }
        ];
        break;

      default:
        roadmap = [
          {
            phase: 'Phase 1 (1–2 months)',
            focus: 'Fundamentals',
            items: ['Learn basics of your core tech stack', 'Set up Git & GitHub', 'Follow 1 structured course']
          },
          {
            phase: 'Phase 2 (2 months)',
            focus: 'Building',
            items: ['Build 2–3 small projects', 'Learn to consume APIs', 'Understand debugging & logging']
          },
          {
            phase: 'Phase 3 (1–2 months)',
            focus: 'Deepen & Showcase',
            items: ['Build 1 capstone project', 'Write a good README', 'Prepare for interviews']
          }
        ];
        break;
    }

    return res.json({
      targetRole: roleKey,
      roadmap
    });
  } catch (err) {
    console.error('Error in /api/roadmap', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/news/top-stories
app.get('/api/news/top-stories', async (req, res) => {
  try {
    const topStoriesUrl = 'https://hacker-news.firebaseio.com/v0/topstories.json';
    const { data: ids } = await axios.get(topStoriesUrl);

    const topFive = (ids || []).slice(0, 5);

    const stories = await Promise.all(
      topFive.map(async (id) => {
        try {
          const { data } = await axios.get(
            `https://hacker-news.firebaseio.com/v0/item/${id}.json`
          );
          return {
            id: data.id,
            title: data.title,
            url: data.url,
            score: data.score,
            time: data.time,
            type: data.type,
            by: data.by
          };
        } catch (innerErr) {
          console.error('Error fetching story', id, innerErr.message);
          return null;
        }
      })
    );

    const filteredStories = stories.filter(Boolean);

    return res.json({
      count: filteredStories.length,
      stories: filteredStories
    });
  } catch (err) {
    console.error('Error in /api/news/top-stories', err.message);
    return res.status(500).json({ error: 'Failed to fetch news from HackerNews' });
  }
});

app.get('/', (req, res) => {
  res.send('Career backend is running');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

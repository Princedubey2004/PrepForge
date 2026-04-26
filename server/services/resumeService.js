const pdfParse = require('pdf-parse');
const axios = require('axios');
const logger = require('../utils/logger');

// Tech skills we look for in resumes — expand this list as needed
const TECH_SKILLS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'go', 'rust',
  'react', 'next.js', 'vue', 'angular', 'node.js', 'express', 'fastapi', 'django',
  'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch',
  'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'ci/cd', 'github actions',
  'machine learning', 'deep learning', 'tensorflow', 'pytorch',
  'rest api', 'graphql', 'microservices', 'system design', 'data structures',
  'algorithms', 'git', 'linux', 'sql', 'nosql',
];

// Skills typically expected for common roles
const ROLE_SKILL_MAP = {
  'Software Engineer': ['data structures', 'algorithms', 'system design', 'git', 'rest api'],
  'Frontend Engineer': ['react', 'javascript', 'typescript', 'css', 'html', 'next.js'],
  'Backend Engineer': ['node.js', 'databases', 'rest api', 'system design', 'docker'],
  'Full Stack Engineer': ['react', 'node.js', 'mongodb', 'rest api', 'git'],
  'Data Engineer': ['python', 'sql', 'spark', 'airflow', 'aws'],
  'ML Engineer': ['python', 'machine learning', 'tensorflow', 'pytorch', 'statistics'],
};

// Extract raw text from an uploaded PDF buffer
const extractTextFromPDF = async (buffer) => {
  const data = await pdfParse(buffer);
  return data.text;
};

// Detect which skills from our list appear in the resume text
const detectSkills = (text) => {
  const lower = text.toLowerCase();
  return TECH_SKILLS.filter((skill) => lower.includes(skill.toLowerCase()));
};

// Compare detected skills against what the target role expects
const findSkillGaps = (detectedSkills, targetRole) => {
  const expected = ROLE_SKILL_MAP[targetRole] || ROLE_SKILL_MAP['Software Engineer'];
  return expected.filter(
    (skill) => !detectedSkills.some((s) => s.toLowerCase().includes(skill.toLowerCase()))
  );
};

// Call Google Gemini to get deeper analysis — returns structured feedback
const analyzeWithAI = async (text, targetRole) => {
  if (!process.env.GEMINI_API_KEY) {
    // Fallback: return a structured mock analysis when Gemini isn't configured
    return buildMockAnalysis(text, targetRole);
  }

  try {
    const prompt = `
You are an expert technical recruiter and ATS system. Analyze this resume for a ${targetRole} position.

Resume text:
${text.slice(0, 4000)} // truncate to stay within token limits

Respond ONLY with valid JSON in this exact format:
{
  "atsScore": <number 0-100>,
  "summary": "<2-3 sentence overall assessment>",
  "suggestions": ["<actionable suggestion 1>", "<suggestion 2>", "<suggestion 3>"],
  "keywordAnalysis": {
    "matched": ["<keyword1>", "<keyword2>"],
    "missing": ["<missing1>", "<missing2>"]
  }
}
    `.trim();

    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
      }
    );

    const raw = res.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    // Strip markdown code fences if Gemini wrapped the JSON
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    logger.error('Gemini API error:', err.message);
    return buildMockAnalysis(text, targetRole);
  }
};

// Mock analysis used when Gemini is not configured
const buildMockAnalysis = (text, targetRole) => {
  const detectedSkills = detectSkills(text);
  const skillGaps = findSkillGaps(detectedSkills, targetRole);
  const score = Math.min(40 + (detectedSkills.length * 5) - (skillGaps.length * 3), 95);

  const roleSuggestions = {
    'Frontend Engineer': ['Include links to your portfolio or GitHub projects', 'Highlight experience with modern UI/UX principles'],
    'Backend Engineer': ['Detail your experience with database optimization', 'Mention knowledge of scalable system architecture'],
    'ML Engineer': ['Include details about model accuracy and training datasets', 'Highlight proficiency in math and statistics'],
    'Software Engineer': ['Emphasize problem-solving using Data Structures', 'Mention experience with Version Control (Git)'],
  };

  const genericSuggestions = [
    'Add measurable impact to each bullet point (e.g., "Reduced load time by 40%")',
    'Tailor your summary to the specific job description',
    'Ensure consistent formatting throughout the document',
  ];

  const suggestions = [
    ...(roleSuggestions[targetRole] || roleSuggestions['Software Engineer']),
    ...genericSuggestions,
  ].slice(0, 4);

  return {
    atsScore: score,
    summary: `Your resume for ${targetRole} shows ${detectedSkills.length} relevant technical skills. To improve your score, you should focus on closing the ${skillGaps.length} missing skill gaps identified.`,
    suggestions,
    keywordAnalysis: {
      matched: detectedSkills.slice(0, 8),
      missing: skillGaps,
    },
  };
};

// Main entry — called from the resume controller
const extractAndAnalyze = async (buffer, targetRole) => {
  const extractedText = await extractTextFromPDF(buffer);
  const detectedSkills = detectSkills(extractedText);
  const skillGaps = findSkillGaps(detectedSkills, targetRole);
  const aiResult = await analyzeWithAI(extractedText, targetRole);

  return {
    extractedText,
    detectedSkills,
    skillGaps,
    atsScore: aiResult.atsScore,
    summary: aiResult.summary,
    suggestions: aiResult.suggestions,
    keywordAnalysis: aiResult.keywordAnalysis,
  };
};

module.exports = { extractAndAnalyze };

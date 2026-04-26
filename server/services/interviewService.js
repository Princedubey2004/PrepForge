const axios = require('axios');
const logger = require('../utils/logger');

// Curated system design questions — realistic enough for mock interviews
const SYSTEM_DESIGN_QUESTIONS = [
  'Design a URL shortener like Bit.ly. Walk through the system architecture, database schema, and how you would handle 100M requests/day.',
  'Design Twitter\'s news feed. How would you handle fanout, caching, and real-time updates?',
  'Design a distributed cache system. Explain eviction policies, consistency trade-offs, and scaling.',
  'Design a ride-sharing app like Uber. Focus on real-time location tracking and driver matching.',
  'Design a notification system that can send 10 million push notifications per hour.',
  'Design a video streaming service like YouTube. Cover upload pipeline, CDN strategy, and adaptive bitrate.',
  'Design a rate limiter that works across multiple servers. What algorithms would you use?',
  'Design a search autocomplete feature. How do you make it fast and relevant?',
  'Design a payment processing system. How do you handle idempotency and failure recovery?',
  'Design a collaborative document editor like Google Docs. Explain OT vs CRDT.',
  'Design a distributed message queue like Kafka. Cover partitioning and consumer groups.',
  'Design an e-commerce product recommendation engine. What ML approaches would you consider?',
];

// Returns N random system design questions
const getSystemDesignQuestions = (count = 3) => {
  const shuffled = [...SYSTEM_DESIGN_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// Ask Gemini to evaluate an interview response
const getAIFeedback = async (question, response) => {
  if (!process.env.GEMINI_API_KEY) {
    return buildMockFeedback(response);
  }

  try {
    const prompt = `
You are an experienced technical interviewer at a top tech company. 
Evaluate the following interview response.

Question: ${question}

Candidate's Response:
${response}

Respond ONLY with valid JSON in this exact format:
{
  "score": <number from 0 to 10>,
  "text": "<2-3 sentences of specific, constructive feedback covering what was good and what could be improved>"
}
    `.trim();

    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 512 },
      }
    );

    const raw = res.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    logger.error('Gemini feedback error:', err.message);
    return buildMockFeedback(response);
  }
};

// Simple mock feedback when Gemini is not configured
const buildMockFeedback = (response) => {
  const wordCount = response.trim().split(/\s+/).length;
  // Longer answers generally score better in this mock
  const score = Math.min(Math.max(Math.floor(wordCount / 20), 3), 9);

  return {
    score,
    text: `Your response demonstrates ${score >= 7 ? 'strong' : 'some'} understanding of the problem. ${
      wordCount < 50
        ? 'Consider elaborating more on your approach and trade-offs.'
        : 'Good level of detail provided.'
    } Focus on clearly explaining your reasoning and considering edge cases.`,
  };
};

module.exports = { getSystemDesignQuestions, getAIFeedback };

const { generateWithFailover } = require('../utils/gemini');

exports.generateMindMap = async (req, res, next) => {
  try {
    const { topic, text } = req.body;

    if (!topic && !text) {
      return res.status(400).json({ error: 'Please provide either a topic or text' });
    }

    const inputData = topic ? `Topic: ${topic}` : `Extracted Text:\n${text.slice(0, 10000)}`;

    const prompt = `You are an expert visual educator.
Create a detailed, hierarchical mind map based on the input data.
Respond with ONLY a valid JSON object matching the schema below. No markdown formatting, no code fences.

Schema:
{
  "topic": "Main Central Topic Name",
  "nodes": [
    { "id": "node-id", "label": "Short Node Label", "description": "Brief 1-sentence explanation of this concept" }
  ],
  "edges": [
    { "from": "parent-node-id", "to": "child-node-id" }
  ]
}

Rules:
1. The first node must be the root (representing the main topic).
2. Generate 8-15 nodes to cover subtopics and key details.
3. Edges must connect parent concepts to child details to form a tree structure.
4. Keep node labels short (2-4 words maximum).

Input:
${inputData}`;

    const result = await generateWithFailover({
      prompt,
      generationConfig: { temperature: 0.5, maxOutputTokens: 2000 }
    });

    const raw = result.response.text();
    let mindmapData;
    try {
      const cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      mindmapData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (err) {
      console.error('Failed to parse AI mindmap response:', err.message);
    }

    if (!mindmapData) {
      return res.status(500).json({ error: 'AI failed to generate a valid mindmap. Please try again.' });
    }

    res.json({ mindmap: mindmapData });
  } catch (error) {
    console.error('MindMap Generation Error:', error.message);
    next(error);
  }
};

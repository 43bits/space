// pages/api/gemini-facts.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { planet } = req.query;
  if (!planet || typeof planet !== 'string') {
    return res.status(400).json({ error: 'Planet name is required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(
      `Give me 3 interesting and real facts about the planet ${planet}. Keep it simple and fun. Return only the facts in a numbered list.`
    );

    const text = result.response.text();
    const facts = text
      .split('\n')
      .filter(line => /^\d+\./.test(line))
      .map(line => line.replace(/^\d+\.\s*/, ''));

    res.status(200).json({ facts });
  } catch (err: any) {
    console.error('Gemini error:', err);
    res.status(500).json({ error: 'Gemini API failed' });
  }
}

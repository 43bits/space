// /app/api/quiz/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Generate one multiple-choice astronomy quiz question as JSON with this structure:

{
  "question": "string",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": "string"
}

Give random facts each time.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    const parsed = JSON.parse(response);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('❌ Gemini quiz error:', err);

    // Static fallback
    return NextResponse.json({
      question: 'Which planet is known as the Red Planet?',
      options: ['Earth', 'Mars', 'Venus', 'Jupiter'],
      correctAnswer: 'Mars',
    });
  }
}

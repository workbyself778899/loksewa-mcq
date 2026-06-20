import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken } from '@/utils/jwt';

/**
 * POST /api/questions/import-ai
 * Parse PDF/Image document with highlighted answers to extract MCQ questions using Gemini API
 * Body: { fileData, mimeType, userApiKey }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('Authorization');
    const token = extractToken(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { fileData, mimeType, userApiKey } = body;

    if (!fileData || !mimeType) {
      return NextResponse.json(
        { error: 'Missing fileData or mimeType' },
        { status: 400 }
      );
    }

    // Determine the API Key to use (prefers server environment key, falls back to client-provided key)
    const apiKey = process.env.GEMINI_API_KEY || userApiKey;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key missing. Please set GEMINI_API_KEY in the server environment or provide it in the UI.' },
        { status: 400 }
      );
    }

    // Extract raw base64 data (strip off prefix like "data:image/png;base64," if present)
    let base64Data = fileData;
    if (fileData.includes(';base64,')) {
      base64Data = fileData.split(';base64,')[1];
    }

    // Call Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Analyze this image or document. It contains multiple choice questions (MCQs) where the correct answer has been marked, circled, highlighted, or indicated in a specific color (for example, if the correct answer is A, it has been highlighted in yellow/green/etc.).
Extract all questions, their options, the correct answer index (0 for A, 1 for B, 2 for C, 3 for D), and a brief explanation if any.

You must return a JSON array of objects strictly following this schema:
[
  {
    "questionText": "Question text here",
    "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
    "correctAnswer": 0, // integer from 0 to 3
    "explanation": "Explanation for correct answer"
  }
]

Make sure the options array contains exactly 4 strings. If the correct answer is marked with a color or text indication, extract it accurately.`
              },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API call failed:', errorText);
      return NextResponse.json(
        { error: `Gemini API error: ${geminiResponse.statusText}` },
        { status: 502 }
      );
    }

    const result = await geminiResponse.json();
    const generatedText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      return NextResponse.json(
        { error: 'Failed to generate content from Gemini' },
        { status: 500 }
      );
    }

    // Parse the JSON array returned by Gemini
    let parsedQuestions = [];
    try {
      parsedQuestions = JSON.parse(generatedText);
    } catch (parseError) {
      console.error('JSON parsing error on Gemini response:', generatedText, parseError);
      return NextResponse.json(
        { error: 'Gemini returned invalid JSON structure' },
        { status: 500 }
      );
    }

    // Perform minor validation/cleansing on parsed array
    if (!Array.isArray(parsedQuestions)) {
      // In case Gemini returned the schema inside a wrapper object, search for array
      if (typeof parsedQuestions === 'object' && parsedQuestions !== null) {
        for (const key of Object.keys(parsedQuestions)) {
          if (Array.isArray(parsedQuestions[key])) {
            parsedQuestions = parsedQuestions[key];
            break;
          }
        }
      }
    }

    if (!Array.isArray(parsedQuestions)) {
      return NextResponse.json(
        { error: 'Could not extract questions array from AI response' },
        { status: 500 }
      );
    }

    // Clean options arrays (ensure exactly 4 options)
    const cleansedQuestions = parsedQuestions.map((q: any) => {
      let opts = q.options || [];
      if (!Array.isArray(opts)) {
        opts = [];
      }
      while (opts.length < 4) {
        opts.push(`Option ${opts.length + 1}`);
      }
      opts = opts.slice(0, 4);

      let correctIndex = parseInt(q.correctAnswer);
      if (isNaN(correctIndex) || correctIndex < 0 || correctIndex > 3) {
        correctIndex = 0;
      }

      return {
        questionText: q.questionText || 'Untranslated Question',
        options: opts,
        correctAnswer: correctIndex,
        explanation: q.explanation || '',
      };
    });

    return NextResponse.json(
      {
        message: 'Questions parsed successfully',
        questions: cleansedQuestions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Import questions AI error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

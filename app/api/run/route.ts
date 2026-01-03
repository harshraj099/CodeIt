import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
  cpp: { language: 'cpp', version: '10.2.0' },
  c: { language: 'c', version: '10.2.0' },
  python: { language: 'python', version: '3.10.0' },
  java: { language: 'java', version: '15.0.2' },
  javascript: { language: 'javascript', version: '18.15.0' },
  typescript: { language: 'typescript', version: '5.0.0' },
  csharp: { language: 'csharp', version: '6.12.0' },
  go: { language: 'go', version: '1.16.2' },
  rust: { language: 'rust', version: '1.68.2' },
};

const PISTON_API_URL = 'https://emkc.org/api/v2/piston/execute';

export async function POST(request: NextRequest) {
  try {
    // Require authentication to run code
    await requireAuth();

    const { code, language, input } = await request.json();

    const langConfig = LANGUAGE_MAP[language];
    if (!langConfig) {
      return NextResponse.json(
        { error: `Language ${language} is not supported` },
        { status: 400 }
      );
    }

    const pistonRequest = {
      language: langConfig.language,
      version: langConfig.version,
      files: [
        {
          content: code,
        },
      ],
      stdin: input || '',
    };

    const response = await fetch(PISTON_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pistonRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Piston API error: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    let output = '';
    
    if (data.run) {
      if (data.run.stdout) {
        output += data.run.stdout;
      }
      if (data.run.stderr) {
        output += (output ? '\n' : '') + data.run.stderr;
      }
      if (data.run.output) {
        if (!output || output.trim() === '') {
          output = data.run.output;
        }
      }
      if (data.run.code !== 0 && !output) {
        output = `Process exited with code ${data.run.code}`;
      }
    }

    if (data.compile && data.compile.stderr) {
      output = `Compilation Error:\n${data.compile.stderr}`;
    }

    if (!output) {
      output = 'No output produced';
    }

    return NextResponse.json({ output });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Please login to run code' },
        { status: 401 }
      );
    }
    console.error('Error executing code:', error);
    return NextResponse.json(
      { error: `Failed to execute code: ${error.message}` },
      { status: 500 }
    );
  }
}
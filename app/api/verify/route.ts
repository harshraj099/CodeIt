import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getOrCreateProblemBySlug } from '@/lib/problems-db';
import { prisma } from '@/lib/prisma';

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
    const userId = await requireAuth();
    const { code, language, problemId } = await request.json();

    if (!code || !language || !problemId) {
      return NextResponse.json(
        { error: 'Missing required fields: code, language, problemId' },
        { status: 400 }
      );
    }

    const langConfig = LANGUAGE_MAP[language];
    if (!langConfig) {
      return NextResponse.json(
        { error: `Language ${language} is not supported` },
        { status: 400 }
      );
    }

    // Get problem with test cases
    const actualProblemId = await getOrCreateProblemBySlug(problemId);
    const problem = await prisma.problem.findUnique({
      where: { id: actualProblemId },
    });

    if (!problem || !problem.inputCases || !problem.outputCases) {
      return NextResponse.json(
        { error: 'Problem not found or test cases not available' },
        { status: 404 }
      );
    }

    if (problem.inputCases.length !== problem.outputCases.length) {
      return NextResponse.json(
        { error: 'Invalid test cases configuration' },
        { status: 500 }
      );
    }

    // Run code against all test cases
    const results = await Promise.all(
      problem.inputCases.map(async (inputCase, index) => {
        try {
          const pistonRequest = {
            language: langConfig.language,
            version: langConfig.version,
            files: [
              {
                content: code,
              },
            ],
            stdin: inputCase,
          };

          const response = await fetch(PISTON_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(pistonRequest),
          });

          if (!response.ok) {
            return {
              testCase: index + 1,
              passed: false,
              error: `Execution failed: ${response.statusText}`,
            };
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
            return {
              testCase: index + 1,
              passed: false,
              error: `Compilation Error: ${data.compile.stderr}`,
            };
          }

          // Normalize output for comparison (trim whitespace)
          const expectedOutput = problem.outputCases[index].trim();
          const actualOutput = output.trim();

          const passed = actualOutput === expectedOutput;

          return {
            testCase: index + 1,
            passed,
            input: inputCase,
            expected: expectedOutput,
            actual: actualOutput,
          };
        } catch (error: any) {
          return {
            testCase: index + 1,
            passed: false,
            error: error.message || 'Unknown error',
          };
        }
      })
    );

    const allPassed = results.every(r => r.passed);
    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;

    // If all tests passed, mark problem as solved
    if (allPassed) {
      try {
        await prisma.solvedProblem.upsert({
          where: {
            userId_problemId: {
              userId,
              problemId: actualProblemId,
            },
          },
          update: {},
          create: {
            userId,
            problemId: actualProblemId,
          },
        });
      } catch (error) {
        console.error('Error marking problem as solved:', error);
        // Don't fail the request if marking as solved fails
      }
    }

    return NextResponse.json({
      allPassed,
      passedCount,
      totalCount,
      results,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Please login to verify solutions' },
        { status: 401 }
      );
    }
    console.error('Error verifying solution:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify solution' },
      { status: 500 }
    );
  }
}


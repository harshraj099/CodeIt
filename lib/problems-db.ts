import { prisma } from './prisma';
import { problems } from './problems';

export async function getOrCreateProblemBySlug(slug: string): Promise<string> { 
  let problem = await prisma.problem.findUnique({
    where: { slug },
  });

  if (problem) {
    return problem.id;
  }

  // If not found, get from hardcoded problems and create in DB
  const hardcodedProblem = problems[slug];
  if (!hardcodedProblem) {
    throw new Error(`Problem with slug "${slug}" not found`);
  }

  // Create problem in database with test cases
  // Generate test cases from examples (for now, use examples as test cases)
  const inputCases = hardcodedProblem.examples.map(ex => ex.input);
  const outputCases = hardcodedProblem.examples.map(ex => ex.output);
  
  // Add a few more default test cases if we have less than 4
  while (inputCases.length < 4) {
    inputCases.push(inputCases[inputCases.length - 1] || "test input");
    outputCases.push(outputCases[outputCases.length - 1] || "test output");
  }

  problem = await prisma.problem.create({
    data: {
      slug: hardcodedProblem.slug,
      title: hardcodedProblem.title,
      difficulty: hardcodedProblem.difficulty,
      description: hardcodedProblem.description,
      inputCases: inputCases.slice(0, 5), // Max 5 test cases
      outputCases: outputCases.slice(0, 5),
    },
  });

  return problem.id;
}


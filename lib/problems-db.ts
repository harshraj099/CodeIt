import { prisma } from './prisma';
import { problems } from './problems';

export async function getOrCreateProblemBySlug(slug: string): Promise<string> { 
  let problem = await prisma.problem.findUnique({
    where: { slug },
  });

  if (problem) {
    return problem.id;
  }

  const hardcodedProblem = problems[slug];
  if (!hardcodedProblem) {
    throw new Error(`Problem with slug "${slug}" not found`);
  }

  const inputCases = hardcodedProblem.examples.map(ex => ex.input);
  const outputCases = hardcodedProblem.examples.map(ex => ex.output);
  
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
      inputCases: inputCases.slice(0, 5),
      outputCases: outputCases.slice(0, 5),
    },
  });

  return problem.id;
}


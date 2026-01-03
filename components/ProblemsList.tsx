"use client";

import { useRouter } from "next/navigation";
import { problems } from "@/lib/problems";

const problemsList = Object.values(problems).sort((a, b) => a.id - b.id);

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Easy":
      return "text-green-500";
    case "Medium":
      return "text-orange-500";
    case "Hard":
      return "text-red-500";
    default:
      return "text-gray-400";
  }
};

export default function ProblemsList() {
  const router = useRouter();

  const handleProblemClick = (slug: string) => {
    router.push(`/${slug}`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-200 mb-6">System Design Problems</h1>
      <div className="bg-[#1e1e1e] rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#252526] border-b border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Id
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Companies
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Design Pattern
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Difficulty
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {problemsList.map((problem) => (
                <tr
                  key={problem.id}
                  onClick={() => handleProblemClick(problem.slug)}
                  className="hover:bg-[#252526] cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {problem.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-200 font-medium">
                    {problem.title}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {problem.companies.slice(0, 3).map((company, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded"
                        >
                          {company}
                        </span>
                      ))}
                      {problem.companies.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-800 text-gray-400 rounded">
                          +{problem.companies.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {problem.designPattern || "-"}
                  </td>
                  <td className={`px-6 py-4 text-sm font-medium ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


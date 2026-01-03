"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { problems } from "@/lib/problems";
import DiscussionTab from "./DiscussionTab";

type Tab = "description" | "discuss";

export default function ProblemPanel() {
  const pathname = usePathname();
  const slug = pathname?.split("/").pop() || "";
  const problem = problems[slug];
  const [activeTab, setActiveTab] = useState<Tab>("description");
  const [isSolved, setIsSolved] = useState(false);
  const [loadingSolved, setLoadingSolved] = useState(true);

  if (!problem) {
    return (
      <div className="h-full w-full overflow-y-auto p-4 bg-[#1e1e1e] text-gray-200">
        <h1 className="text-xl font-semibold mb-2">Problem Not Found</h1>
        <p className="text-sm text-gray-400">Please select a problem from the list.</p>
      </div>
    );
  }

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

  // Get problem ID from database - for now use slug as problemId
  // In a real app, you'd fetch the problem from DB and use its ID
  const problemId = slug;

  useEffect(() => {
    const checkSolved = async () => {
      try {
        const response = await fetch(`/api/problems/${slug}/solved`);
        if (response.ok) {
          const data = await response.json();
          setIsSolved(data.solved);
        }
      } catch (error) {
        console.error("Error checking solved status:", error);
      } finally {
        setLoadingSolved(false);
      }
    };
    checkSolved();
  }, [slug]);

  return (
    <div className="h-full w-full flex flex-col bg-[#1e1e1e] text-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 shrink-0">
        <h1 className="text-xl font-semibold mb-2">
          {problem.id}. {problem.title}
        </h1>

        <div className="flex items-center gap-4 mb-4">
          <span className={`text-sm font-medium ${getDifficultyColor(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
          {problem.designPattern && (
            <span className="text-sm text-gray-400">
              Pattern: {problem.designPattern}
            </span>
          )}
          {!loadingSolved && (
            <div className="ml-auto">
              {isSolved ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-900/30 text-green-400 text-xs font-medium rounded-full border border-green-700">
                  <span>✓</span> Solved
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-800 text-gray-400 text-xs font-medium rounded-full border border-gray-700">
                  Not Solved
                </span>
              )}
            </div>
          )}
        </div>

        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {problem.companies.map((company, idx) => (
              <span
                key={idx}
                className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded"
              >
                {company}
              </span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("description")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "description"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab("discuss")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "discuss"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Discuss
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "description" && (
          <div className="p-4">
            <p className="mb-4 text-sm leading-relaxed">
              {problem.description}
            </p>

            {problem.examples.map((example, idx) => (
              <div key={idx} className="mb-4">
                <h3 className="text-sm font-semibold mb-2">Example {idx + 1}:</h3>
                <pre className="bg-black p-3 rounded text-sm">
                  <div className="mb-2">
                    <span className="text-gray-500">Input:</span> {example.input}
                  </div>
                  <div>
                    <span className="text-gray-500">Output:</span> {example.output}
                  </div>
                </pre>
              </div>
            ))}
          </div>
        )}

        {activeTab === "discuss" && (
          <DiscussionTab problemId={problemId} />
        )}
      </div>
    </div>
  );
}

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
      <div className="p-6 border-b border-gray-700 shrink-0 bg-gray-800/30">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2 text-gray-100">
              {problem.id}. {problem.title}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(problem.difficulty)} bg-opacity-20 border ${
                problem.difficulty === "Easy" ? "border-green-500/30 bg-green-500/10" :
                problem.difficulty === "Medium" ? "border-orange-500/30 bg-orange-500/10" :
                "border-red-500/30 bg-red-500/10"
              }`}>
                {problem.difficulty}
              </span>
              {problem.designPattern && (
                <span className="px-3 py-1 text-xs font-medium text-purple-400 bg-purple-900/20 border border-purple-700/30 rounded-full">
                  {problem.designPattern}
                </span>
              )}
              {!loadingSolved && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${
                  isSolved 
                    ? "bg-green-900/30 text-green-400 border-green-700/50" 
                    : "bg-gray-800 text-gray-400 border-gray-700"
                }`}>
                  {isSolved ? <span>✓</span> : <span>○</span>}
                  {isSolved ? "Solved" : "Not Solved"}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {problem.companies.map((company, idx) => (
              <span
                key={idx}
                className="px-3 py-1 text-xs font-medium bg-gray-700/50 text-gray-300 rounded-md border border-gray-600/50 hover:bg-gray-700 transition-colors"
              >
                {company}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-1 border-b border-gray-700 -mb-px">
          <button
            onClick={() => setActiveTab("description")}
            className={`px-6 py-3 text-sm font-medium transition-all relative ${
              activeTab === "description"
                ? "text-blue-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Description
            {activeTab === "description" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("discuss")}
            className={`px-6 py-3 text-sm font-medium transition-all relative ${
              activeTab === "discuss"
                ? "text-blue-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Discuss
            {activeTab === "discuss" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></span>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === "description" && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-gray-100">Problem Description</h2>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <p className="text-sm leading-relaxed text-gray-200 whitespace-pre-wrap">
                  {problem.description}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-3 text-gray-100">Test Cases</h2>
            </div>

            {problem.examples.map((example, idx) => (
              <div key={idx} className="mb-6 bg-gray-800/30 border border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gray-700/50 px-4 py-2 border-b border-gray-700">
                  <h3 className="text-sm font-semibold text-blue-400">
                    Test Case {idx + 1}
                  </h3>
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-green-400 uppercase tracking-wide">Input</span>
                    </div>
                    <pre className="bg-black/60 border border-gray-700 p-4 rounded text-sm text-gray-200 font-mono overflow-x-auto">
                      <code>{example.input}</code>
                    </pre>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">Output</span>
                    </div>
                    <pre className="bg-black/60 border border-gray-700 p-4 rounded text-sm text-gray-200 font-mono overflow-x-auto">
                      <code>{example.output}</code>
                    </pre>
                  </div>
                  {example.explanation && (
                    <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-blue-300 uppercase tracking-wide">Explanation</span>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {example.explanation}
                      </p>
                    </div>
                  )}
                </div>
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

"use client";

import Editor from "@monaco-editor/react";
import { useState, useEffect, useRef } from "react";
import { useCode } from "./CodeContext";

const languages = [
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "c", label: "C" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
];

const defaultCode = {
  cpp: `class Solution {
public:
    vector<int> plusOne(vector<int>& digits) {
        
    }
};`,
  java: `class Solution {
    public int[] plusOne(int[] digits) {
        
    }
}`,
  python: `class Solution:
    def plusOne(self, digits: List[int]) -> List[int]:
        `,
  javascript: `var plusOne = function(digits) {
    
};`,
  typescript: `function plusOne(digits: number[]): number[] {
    
};`,
  c: `int* plusOne(int* digits, int digitsSize, int* returnSize) {
    
}`,
  csharp: `public class Solution {
    public int[] PlusOne(int[] digits) {
        
    }
}`,
  go: `func plusOne(digits []int) []int {
    
}`,
  rust: `impl Solution {
    pub fn plus_one(digits: Vec<i32>) -> Vec<i32> {
        
    }
}`,
};

export default function CodeEditor() {
  const { code, language, setCode, setLanguage, runCode, isRunning } = useCode();
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(400);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === containerRef.current) {
          setHeight(entry.contentRect.height);
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => { 
    if (!code || code.trim() === "") {
      setCode(defaultCode[language as keyof typeof defaultCode] || "");
    } 
  }, []);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setCode(defaultCode[newLanguage as keyof typeof defaultCode] || "");
  };

  return (
    <div className="h-full w-full bg-[#1e1e1e] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-[#252526] shrink-0">
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-300">Language:</label>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-[#1e1e1e] text-gray-200 border border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={runCode}
          disabled={isRunning}
          className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
            isRunning
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {isRunning ? "Running..." : "Run"}
        </button>
      </div>
      <div ref={containerRef} className="flex-1 min-h-0" style={{ minHeight: 0 }}>
        <Editor
          height={height}
          language={language}
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || "")}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
          loading={<div className="text-gray-400 p-4">Loading editor...</div>}
        />
      </div>
    </div>
  );
}

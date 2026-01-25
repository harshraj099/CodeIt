"use client";

import Editor from "@monaco-editor/react";
import { useState, useEffect, useRef } from "react";
import { useCode } from "./CodeContext";
import LoginModal from "./LoginModal";

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

export default function CodeEditor() {
  const { code, language, setCode, setLanguage, runCode, isRunning, saveCode, problemId, showLoginModal, setShowLoginModal } = useCode();
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(400);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
    if (!problemId || !code) return; 
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      await saveCode();
      setIsSaving(false);
    }, 3000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [code, problemId, saveCode]);

  useEffect(() => {
    if (!problemId) return;

    const saveOnLanguageChange = async () => {
      setIsSaving(true);
      await saveCode();
      setIsSaving(false);
    };

    saveOnLanguageChange();
  }, [language, problemId, saveCode]);

  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(newLanguage); 
  };

  const handleCodeChange = (value: string | undefined) => {
    setCode(value || ""); 
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
          {isSaving && (
            <span className="text-xs text-gray-400">Saving...</span>
          )}
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
          onChange={handleCodeChange}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
          loading={<div className="text-gray-400 p-4">Loading editor...</div>}
        />
      </div>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}

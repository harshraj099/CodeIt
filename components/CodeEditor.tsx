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
  cpp: `#include <bits/stdc++.h>

using namespace std;

int main() {
    // Your code implementation goes here
    cout << "Hello, World!" << endl;
    return 0;
}`,
  java: `public class Main {
    public static void main(String[] args) {
        // Your code implementation goes here
        System.out.println("Hello, World!");
    }
}`,
  python: `def main():
    # Your code implementation goes here
    print("Hello, World!")

if __name__ == "__main__":
    main()`,
  javascript: `function main() {
    // Your code implementation goes here
    console.log("Hello, World!");
}

main();`,
  typescript: `function main(): void {
    // Your code implementation goes here
    console.log("Hello, World!");
}

main();`,
  c: `#include <stdio.h>

int main() {
    // Your code implementation goes here
    printf("Hello, World!\\n");
    return 0;
}`,
  csharp: `using System;

class Program {
    static void Main(string[] args) {
        // Your code implementation goes here
        Console.WriteLine("Hello, World!");
    }
}`,
  go: `package main

import "fmt"

func main() {
    // Your code implementation goes here
    fmt.Println("Hello, World!")
}`,
  rust: `fn main() {
    // Your code implementation goes here
    println!("Hello, World!");
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

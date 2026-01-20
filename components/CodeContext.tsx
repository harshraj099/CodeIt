"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { usePathname } from "next/navigation";

interface CodeContextType {
  code: string;
  language: string;
  input: string;
  output: string;
  isRunning: boolean;
  setCode: (code: string) => void;
  setLanguage: (language: string) => void;
  setInput: (input: string) => void;
  setOutput: (output: string) => void;
  runCode: () => Promise<void>;
  saveCode: () => Promise<void>;
  problemId: string | null;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
}

const CodeContext = createContext<CodeContextType | undefined>(undefined);

const defaultCode = {
  cpp: `#include <bits/stdc++.h>

using namespace std;

int main() {
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
    print("Hello, World!")

if __name__ == "__main__":
    main()`,
  javascript: `function main() {
    // Your code implementation goes here
    console.log("Hello, World!");
}

main();`,
  typescript: `function main(): void {
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
    println!("Hello, World!");
}`,
};

export function CodeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const problemId = pathname?.split("/").pop() || null;
  
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const prevLanguageRef = useRef<string>(language);
  const codeRef = useRef<string>(code);

  // Save code before problem changes
  useEffect(() => {
    return () => {
      // Save code when component unmounts or problem changes
      if (problemId && code) {
        saveCode();
      }
    };
  }, [problemId]);

  useEffect(() => {
    if (!problemId) return;

    const loadSavedCode = async () => {
      setIsLoadingCode(true);
      try {
        const response = await fetch(`/api/code/load?problemId=${problemId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.code && data.language) {
            setCode(data.code);
            setLanguage(data.language);
          } else {
            // No saved code, use default template for current language
            const defaultCodeForLang = defaultCode[language as keyof typeof defaultCode] || "";
            setCode(defaultCodeForLang);
          }
        }
      } catch (error) {
        console.error("Error loading saved code:", error);
        const defaultCodeForLang = defaultCode[language as keyof typeof defaultCode] || "";
        setCode(defaultCodeForLang);
      } finally {
        setIsLoadingCode(false);
      }
    };

    loadSavedCode();
  }, [problemId]);

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  // Update boilerplate when language changes
  useEffect(() => {
    if (isLoadingCode) return;
    
    // Only update if language actually changed
    if (prevLanguageRef.current === language) return;
    prevLanguageRef.current = language;
    
    // Check if current code is empty or matches any default boilerplate
    const currentCode = codeRef.current;
    const isCodeEmpty = !currentCode || currentCode.trim() === "";
    const isDefaultBoilerplate = Object.values(defaultCode).some(
      (defaultCodeTemplate) => currentCode.trim() === defaultCodeTemplate.trim()
    );
    
    // If code is empty or matches a default boilerplate, update to new language's boilerplate
    if (isCodeEmpty || isDefaultBoilerplate) {
      const currentDefault = defaultCode[language as keyof typeof defaultCode] || "";
      setCode(currentDefault);
    }
  }, [language, isLoadingCode]);

  const saveCode = async () => {
    if (!problemId) return;

    try {
      const response = await fetch("/api/code/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problemId,
          language,
          code,
        }),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          return;
        }
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error && errorData.error.includes("database")) {
            return;
          }
        } catch {
          if (errorText.includes("database") || errorText.includes("Can't reach database")) {
            return;
          }
        }
      }
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      if (errorMessage.includes("database") || errorMessage.includes("Can't reach database")) {
        return;
      }
    }
  };

  const runCode = async () => {
    try {
      const authCheck = await fetch("/api/auth/me");
      if (!authCheck.ok) {
        setShowLoginModal(true);
        return;
      }
    } catch (error) {
      setShowLoginModal(true);
      return;
    }

    setIsRunning(true);
    setOutput("Running...\n");

    try {
      let result = "";

      if (language === "javascript" || language === "typescript") {
        try {
          const logs: string[] = [];
          const originalLog = console.log;
          const originalError = console.error;
          
          console.log = (...args: any[]) => {
            const logMsg = args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');
            logs.push(logMsg);
            originalLog(...args);
          };

          console.error = (...args: any[]) => {
            const errorMsg = args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');
            logs.push(`ERROR: ${errorMsg}`);
            originalError(...args);
          };

          let parsedInput: any;
          try {
            const trimmedInput = input.trim();
            if (trimmedInput === "") {
              parsedInput = [];
            } else {
              parsedInput = JSON.parse(trimmedInput);
            }
          } catch {
            parsedInput = input || "[]";
            try {
              parsedInput = JSON.parse(parsedInput);
            } catch {
              parsedInput = [1, 2, 3];
            }
          }

          let funcCode = code;
          
          if (code.includes("function plusOne") || code.includes("var plusOne") || code.includes("const plusOne")) {
            const executionCode = `
              ${code}
              return plusOne(${JSON.stringify(parsedInput)});
            `;
            
            const func = new Function(executionCode);
            const resultValue = func();
            
            console.log = originalLog;
            console.error = originalError;

            result = logs.length > 0 
              ? logs.join("\n") + "\n\nResult: " + JSON.stringify(resultValue)
              : JSON.stringify(resultValue);
          } else {
            try {
              const executionCode = `
                ${code}
                if (typeof plusOne !== 'undefined') {
                  return plusOne(${JSON.stringify(parsedInput)});
                }
                return "Function 'plusOne' not found in code";
              `;
              
              const func = new Function(executionCode);
              const resultValue = func();
              
              console.log = originalLog;
              console.error = originalError;

              result = logs.length > 0 
                ? logs.join("\n") + "\n\nResult: " + JSON.stringify(resultValue)
                : JSON.stringify(resultValue);
            } catch (execError: any) {
              console.log = originalLog;
              console.error = originalError;
              result = `Execution Error: ${execError.message}\n\nMake sure your code defines a function called 'plusOne' that takes an array as input.`;
            }
          }
        } catch (error: any) {
          result = `Error: ${error.message}\n\nStack: ${error.stack || 'No stack trace'}`;
        }
      } else {
        try {
          const response = await fetch('/api/run', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code,
              language,
              input,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 401) {
              setShowLoginModal(true);
              setIsRunning(false);
              setOutput("");
              return;
            }
            result = `Error: ${errorData.error || 'Failed to execute code'}`;
          } else {
            const data = await response.json();
            result = data.output || 'No output produced';
          }
        } catch (fetchError: any) {
          result = `Error: ${fetchError.message}\n\nMake sure the API route is properly configured.`;
        }
      }

      setOutput(result);
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <CodeContext.Provider
      value={{
        code,
        language,
        input,
        output,
        isRunning,
        setCode,
        setLanguage,
        setInput,
        setOutput,
        runCode,
        saveCode,
        problemId,
        showLoginModal,
        setShowLoginModal,
      }}
    >
      {children}
    </CodeContext.Provider>
  );
}

export function useCode() {
  const context = useContext(CodeContext);
  if (context === undefined) {
    throw new Error("useCode must be used within a CodeProvider");
  }
  return context;
}

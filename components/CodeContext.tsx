"use client";

import { createContext, useContext, useState, ReactNode } from "react";

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
}

const CodeContext = createContext<CodeContextType | undefined>(undefined);

export function CodeProvider({ children }: { children: ReactNode }) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const runCode = async () => {
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


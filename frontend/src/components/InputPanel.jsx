import { useState, useEffect } from "react";
import { useCode } from "./CodeContext";

export default function InputPanel() {
  const { input, output, setInput, setOutput, isRunning } = useCode();
  const [activeTab, setActiveTab] = useState("input");

  useEffect(() => {
    if (!isRunning && output && output !== "Running...\n" && output !== "Submitting...\n") {
      setActiveTab("output");
    }
  }, [isRunning, output]);

  return (
    <div className="h-full w-full bg-[#111] text-gray-200 flex flex-col overflow-hidden">
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab("input")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "input"
              ? "bg-[#1e1e1e] text-white border-b-2 border-blue-500"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Custom Input
        </button>
        <button
          onClick={() => setActiveTab("output")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "output"
              ? "bg-[#1e1e1e] text-white border-b-2 border-blue-500"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Output
        </button>
      </div>
      <div className="flex-1 p-4">
        {activeTab === "input" ? (
          <textarea
            className="w-full h-full bg-black p-3 rounded text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your custom input here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        ) : (
          <textarea
            className="w-full h-full bg-black p-3 rounded text-sm font-mono resize-none focus:outline-none"
            placeholder="Output will appear here..."
            value={output}
            readOnly
          />
        )}
      </div>
    </div>
  );
}

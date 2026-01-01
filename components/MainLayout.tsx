"use client";

import { Panel, Group, Separator } from "react-resizable-panels";
import { CodeProvider } from "./CodeContext";
import ProblemPanel from "./ProblemPanel";
import CodeEditor from "./CodeEditor";
import InputPanel from "./InputPanel";

export default function MainLayout() {
  return (
    <CodeProvider>
      <div className="h-screen w-screen overflow-hidden">
        <Group orientation="horizontal" className="h-full w-full">
          <Panel defaultSize={40} minSize={20}>
            <div className="h-full w-full">
              <ProblemPanel />
            </div>
          </Panel>

          <Separator className="w-1 bg-gray-700" />

          <Panel defaultSize={60} minSize={40}>
            <div className="h-full w-full">
              <Group orientation="vertical" className="h-full w-full">
                <Panel defaultSize={70} minSize={30}>
                  <div className="h-full w-full">
                    <CodeEditor />
                  </div>
                </Panel>

                <Separator className="h-1 bg-gray-700" />

                <Panel defaultSize={30} minSize={15}>
                  <div className="h-full w-full">
                    <InputPanel />
                  </div>
                </Panel>
              </Group>
            </div>
          </Panel>
        </Group>
      </div>
    </CodeProvider>
  );
}

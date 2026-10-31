import MainLayout from "../components/MainLayout";
import Header from "../components/Header";

export default function ProblemPage() {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      <Header />
      <div className="flex-1 min-h-0">
        <MainLayout />
      </div>
    </div>
  );
}

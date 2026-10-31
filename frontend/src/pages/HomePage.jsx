import Header from "../components/Header";
import ProblemsList from "../components/ProblemsList";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#111]">
      <Header />
      <ProblemsList />
    </div>
  );
}

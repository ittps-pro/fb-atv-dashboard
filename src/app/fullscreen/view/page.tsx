import { DashboardHeader } from "@/components/dashboard/header";

export default function FullscreenViewPage() {
  return (
    <main className="relative z-10 p-4 md:p-6 space-y-8 h-screen flex flex-col">
      <DashboardHeader />
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Fullscreen View</h1>
          <p className="text-muted-foreground mt-2">This page will display the dashboard widgets in a fullscreen, non-editable layout.</p>
        </div>
      </div>
    </main>
  );
}

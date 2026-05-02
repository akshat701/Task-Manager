import Navbar from "./Navbar";

export default function AppLayout({ children }: any) {
  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
      <div className="flex-1">
        <Navbar />
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
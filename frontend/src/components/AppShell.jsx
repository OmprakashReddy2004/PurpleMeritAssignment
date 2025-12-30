import { useEffect } from "react";

export default function AppShell({ children }) {
  useEffect(() => {
    document.documentElement.classList.add("dark"); // force dark mode
  }, []);

  return (
    <div className="min-h-screen bg-darkbg text-gray-200 transition-colors duration-500">
      {children}
    </div>
  );
}

typescriptreact
import React from 'react';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar Placeholder */}
      <div className="w-64 bg-gray-200 dark:bg-gray-800 p-4">
        <h2 className="text-xl font-bold mb-4">Sidebar</h2>
        {/* Sidebar Navigation will go here */}
        <ul>
          <li>Nav Item 1</li>
          <li>Nav Item 2</li>
        </ul>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Top Navbar Placeholder */}
        <header className="bg-white dark:bg-gray-700 shadow p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Top Navbar</h1>
          {/* User Profile and Dark Mode Toggle will go here */}
          <div>User Actions</div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
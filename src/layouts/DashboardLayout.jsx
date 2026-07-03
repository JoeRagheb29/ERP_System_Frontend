import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

/**
 * DashboardLayout — Root shell for all authenticated pages.
 *
 * Structure:
 *   ┌─────────┬─────────────────────────────────┐
 *   │         │  Topbar (h-16, fixed header)     │
 *   │ Sidebar │─────────────────────────────────┤
 *   │ (w-60)  │                                  │
 *   │         │  <Outlet /> (page content)       │
 *   │         │                                  │
 *   └─────────┴─────────────────────────────────┘
 *
 * The sidebar and topbar are layout components — they read from the
 * Zustand store directly so they never need props drilled through them.
 * Child routes rendered via <Outlet /> are completely decoupled from the shell.
 */
export default function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
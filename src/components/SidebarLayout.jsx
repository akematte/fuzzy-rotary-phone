import { motion } from "framer-motion";

export default function SidebarLayout({ sidebar, sidebarWidth, sidebarCollapsed, topbar, children }) {
  const sidebarSpring = { type: "spring", stiffness: 280, damping: 34 };

  return (
    <div className="flex h-full min-h-0 w-full bg-white">
      {/* Sidebar - full height */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarWidth }}
        transition={sidebarSpring}
        className="flex h-full shrink-0 flex-col overflow-hidden bg-white"
      >
        {sidebar}
      </motion.aside>

      {/* Main content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
        {/* Topbar */}
        <div className="flex h-14 shrink-0 items-stretch border-b border-neutral-200 bg-white">
          {topbar}
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-hidden bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}

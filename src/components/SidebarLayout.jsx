import { motion } from "framer-motion";

export default function SidebarLayout({ sidebar, sidebarWidth, sidebarCollapsed, topbar, children }) {
  const sidebarSpring = { type: "spring", stiffness: 280, damping: 34 };

  return (
    <div className="flex h-full min-h-0 w-full bg-white rounded-2xl border border-neutral-200 overflow-hidden">
      <motion.aside
        initial={false}
        animate={{ width: sidebarWidth }}
        transition={sidebarSpring}
        className="flex h-full shrink-0 flex-col overflow-hidden bg-white"
      >
        {sidebar}
      </motion.aside>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-2 pt-0 pl-0">
        <div className="flex h-14 shrink-0 items-stretch bg-white pl-2">
          {topbar}
        </div>

        <div className="min-h-0 flex-1 overflow-hidden bg-neutral-100 rounded-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}
import { motion } from "framer-motion";
import { ChevronLeft, Plus } from "lucide-react";

export default function Sidebar({
  pages,
  activePageId,
  collapsed,
  onToggle,
  onNewPage,
  onSelectPage
}) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 74 : 280 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="h-full border-r border-neutral-200 bg-white px-3 py-4"
    >
      <div className="mb-6 flex items-center justify-between">
        <h1 className={`text-xl font-semibold tracking-tight ${collapsed ? "hidden" : "block"}`}>Scrapbook</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          onClick={onToggle}
          className="rounded-xl border border-neutral-200 bg-white p-2 transition hover:bg-neutral-50"
        >
          <ChevronLeft className={`h-4 w-4 transition ${collapsed ? "rotate-180" : ""}`} />
        </motion.button>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNewPage}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-black px-3 py-2 text-sm font-medium text-white shadow-soft transition"
      >
        <Plus className="h-4 w-4" />
        {!collapsed && <span>New Page</span>}
      </motion.button>

      <div className="space-y-2">
        {pages.map((page, index) => {
          const active = page.id === activePageId;
          return (
            <motion.button
              key={page.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelectPage(page.id)}
              className={`flex w-full items-center rounded-xl border px-3 py-2 text-left text-sm transition ${
                active ? "border-black bg-black text-white" : "border-transparent bg-neutral-100 text-black hover:border-neutral-200"
              }`}
            >
              {collapsed ? `${index + 1}` : page.name}
            </motion.button>
          );
        })}
      </div>
    </motion.aside>
  );
}

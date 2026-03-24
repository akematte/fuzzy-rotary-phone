import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export default function Sidebar({ pages, activePageId, collapsed, onNewPage, onSelectPage }) {
  return (
    <>
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
    </>
  );
}

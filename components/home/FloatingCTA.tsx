"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function FloatingCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-4 sm:right-6 z-50"
        >
          <Link
            href="/inquiry?type=quick"
            className="flex items-center gap-2 bg-brand-green-primary hover:bg-brand-green-primary/90 text-white px-4 py-3 rounded-full shadow-lg shadow-brand-green-primary/30 transition-all duration-200 hover:shadow-xl hover:shadow-brand-green-primary/40 hover:-translate-y-0.5 text-sm font-medium"
          >
            <Send className="w-4 h-4" />
            <span>빠른 문의</span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

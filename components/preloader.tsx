"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import { LOGO_URL } from "@/lib/constants";

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hide preloader after 1.5 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-b from-primary to-secondary"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.34, 1.56, 0.64, 1],
              delay: 0.1,
            }}
            className="relative"
          >
            {/* Logo dengan animasi pulse */}
            <motion.div
              initial={{ filter: "blur(8px)" }}
              animate={{
                filter: "blur(0px)",
                scale: [1, 1.05, 1],
              }}
              transition={{
                filter: { duration: 0.6, ease: "easeOut" },
                scale: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.8,
                },
              }}
            >
              <Image
                src={LOGO_URL}
                alt="UGM Anjem"
                width={400}
                height={160}
                priority
                unoptimized
                className="w-auto h-20 md:h-32 lg:h-40 object-contain drop-shadow-xl"
              />
            </motion.div>

            {/* Loading dots animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex items-center justify-center gap-2 mt-8"
            >
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{
                    scale: [0, 1, 1],
                    y: [0, -10, 0],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    scale: { duration: 0.3, delay: 0.6 + index * 0.1 },
                    y: {
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.8 + index * 0.15,
                    },
                    opacity: {
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.8 + index * 0.15,
                    },
                  }}
                  className="w-3 h-3 rounded-full bg-white shadow-lg"
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

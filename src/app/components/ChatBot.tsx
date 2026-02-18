"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

interface ChatBotProps {
  faqs: Array<{ question: string; answer: string }>;
}

export default function ChatBot({ faqs }: ChatBotProps) {
  const [isChatVisible, setIsChatVisible] = useState(true);

  const characterVariants = {
    hidden: { y: 100, x: 50, opacity: 0 },
    visible: {
      y: 0,
      x: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 80,
        damping: 20,
        delay: 0.3,
      },
    },
  };

  const chatBubbleVariants = {
    hidden: { scale: 0.8, opacity: 0, x: -50 },
    visible: {
      scale: 1,
      opacity: 1,
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 80,
        damping: 20,
        delay: 0.6,
      },
    },
    exit: {
      scale: 0.95,
      opacity: 0,
      x: -30,
      transition: { duration: 0.18 },
    },
  };


  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Main container for chat and character */}
      <div className="flex items-center justify-center gap-4 md:gap-8 max-w-6xl w-full">
        {/* Chat Bubble - Left Side */}
        <AnimatePresence>
          {isChatVisible && (
            <motion.div
              variants={chatBubbleVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex-1 min-w-0"
            >
              <div className="bg-white rounded-3xl shadow-2xl p-10 relative border-4 border-black">
                {/* Chat bubble tail pointing to character - thicker and larger */}
                <div 
                  className="hidden md:block absolute top-1/2 -right-8 transform -translate-y-1/2"
                  style={{
                    width: 0,
                    height: 0,
                    borderTop: '20px solid transparent',
                    borderBottom: '20px solid transparent',
                    borderLeft: '20px solid black',
                    borderRight: '0px solid transparent',
                  }}
                ></div>
                <div 
                  className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2"
                  style={{
                    width: 0,
                    height: 0,
                    borderTop: '18px solid transparent',
                    borderBottom: '18px solid transparent',
                    borderLeft: '18px solid white',
                    borderRight: '0px solid transparent',
                  }}
                ></div>

                {/* Title + Back link */}
                <div className="mb-6 flex items-start justify-between gap-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Frequently Asked Questions
                  </h2>
                  <Link href="/" className="btn-secondary text-sm shrink-0">
                    ← Back to Home
                  </Link>
                </div>

                {/* Scrollable FAQ Content */}
                <div className="h-72 md:h-96 overflow-y-auto px-2 pr-4 custom-scrollbar">
                  <div className="space-y-6">
                    {faqs.map((faq, index) => (
                      <div key={index} className="pb-6 border-b-2 border-gray-200 last:border-b-0">
                        <h3 className="text-base sm:text-lg font-bold text-black mb-3">
                          {faq.question}
                        </h3>
                        <ul className="list-disc list-inside space-y-1 text-gray-800 leading-relaxed text-sm sm:text-base">
                          {faq.answer.split("\n").map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Character - Right Side */}
        <motion.div
          variants={characterVariants}
          initial="hidden"
          animate="visible"
          className="flex-shrink-0 flex flex-col items-center"
        >
          {/* Avatar Circle */}
          <motion.div
            className="w-64 h-64 md:w-80 md:h-80 flex items-center justify-center relative z-20"
            whileHover={{ scale: 1.05 }}
          >
            {/* Snorlax Image */}
            <img
              src="/snorlax.png"
              alt="Snorlax"
              className="w-56 h-56 md:w-72 md:h-72 object-contain cursor-pointer select-none"
              onClick={() => setIsChatVisible((prev) => !prev)}
            />
          </motion.div>
        </motion.div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #111111;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #000000;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #000000;
        }
        .custom-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>
    </div>
  );
}

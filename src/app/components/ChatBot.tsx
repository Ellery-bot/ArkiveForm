"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface ChatBotProps {
  faqs: Array<{ question: string; answer: string }>;
}

export default function ChatBot({ faqs }: ChatBotProps) {
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
    <div className="min-h-screen relative overflow-hidden flex flex-col md:flex-row items-stretch">
      {/* Left - Chat Bubble */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 md:pl-12">
        <motion.div
          variants={chatBubbleVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-2xl"
        >
              <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-8 md:p-10 relative border-4 border-black">
                {/* Chat bubble tail pointing right toward cat */}
                <div
                  className="hidden md:block absolute top-1/2 -right-8 transform -translate-y-1/2"
                  style={{
                    width: 0,
                    height: 0,
                    borderTop: '20px solid transparent',
                    borderBottom: '20px solid transparent',
                    borderLeft: '20px solid black',
                  }}
                />
                <div
                  className="hidden md:block absolute top-1/2 -right-[26px] transform -translate-y-1/2"
                  style={{
                    width: 0,
                    height: 0,
                    borderTop: '17px solid transparent',
                    borderBottom: '17px solid transparent',
                    borderLeft: '17px solid white',
                  }}
                />

                {/* Title + Back link */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                  <Link href="/" className="btn-secondary text-sm shrink-0 sm:hidden">
                    ← Back to Home
                  </Link>
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900">
                    Frequently Asked Questions
                  </h2>
                  <Link href="/" className="btn-secondary text-sm shrink-0 hidden sm:inline-block">
                    ← Back to Home
                  </Link>
                </div>

                {/* Scrollable FAQ Content */}
                <div className="h-56 sm:h-72 md:h-96 overflow-y-auto px-2 pr-4 custom-scrollbar">
                  <div className="space-y-6">
                    {faqs.map((faq, index) => (
                      <div key={index} className="pb-6 border-b-2 border-gray-200 last:border-b-0">
                        <h3 className="text-base sm:text-lg font-bold text-black mb-3">
                          {faq.question}
                        </h3>
                        <ul className="list-disc list-inside space-y-1 text-gray-800 leading-relaxed text-sm sm:text-base text-justify">
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
      </div>

      {/* Cat — stacks below FAQ on mobile, right panel on desktop */}
      <motion.div
        variants={characterVariants}
        initial="hidden"
        animate="visible"
        className="flex-shrink-0 relative overflow-hidden h-72 w-full md:h-auto md:w-[520px]"
      >
        <img
          src="/spacecat.png"
          alt="Space Cat"
          className="cat-image"
        />
      </motion.div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #111111; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #000000; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #000000; }
        .custom-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }

        /* Cat image — mobile: 700px wide shows full head in h-72 container */
        .cat-image {
          width: 700px;
          max-width: none;
          position: absolute;
          top: -5px;
          left: 50%;
          transform: translateX(-50%);
          image-rendering: pixelated;
          pointer-events: none;
          user-select: none;
        }
        /* Desktop: 1600px wide, top -30px offset shows full dome to collar */
        @media (min-width: 768px) {
          .cat-image {
            width: 1600px;
            top: -30px;
          }
        }
      `}</style>
    </div>
  );
}

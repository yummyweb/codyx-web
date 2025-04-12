'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/navbar';
import { motion, useScroll, useTransform } from 'framer-motion';

const features = [
  {
    title: 'Feature 1',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
  },
  {
    title: 'Feature 2',
    content: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  },
  {
    title: 'Feature 3',
    content: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.'
  },
  {
    title: 'Feature 4',
    content: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.'
  }
];

export default function FeaturesPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Calculate which feature should be selected based on scroll position
  const selectedFeature = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0, 1, 2]
  );

  // Calculate the vertical position for each card
  const card1Y = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
  const card2Y = useTransform(scrollYProgress, [0.5, 1], [100, 0]);
  const card3Y = useTransform(scrollYProgress, [0.5, 1], [200, 100]);

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      <Navbar />
      <div 
        ref={containerRef}
        className="relative h-[300vh]"
      >
        <div className="sticky top-0 h-screen flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <h1 className="text-3xl font-bold text-center mb-12 text-white">Our Features</h1>
            <div className="flex gap-8">
              {/* Feature Cards */}
              <div className="w-1/3">
                <div className="space-y-4">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      style={{
                        y: index === 0 ? card1Y : index === 1 ? card2Y : card3Y,
                      }}
                      className={`p-6 rounded-lg cursor-pointer transition-all duration-300 ${
                        selectedFeature.get() === index
                          ? 'bg-white text-black shadow-lg transform scale-105'
                          : 'bg-white/50 text-black/50 shadow-md'
                      }`}
                    >
                      <h2 className="text-xl font-semibold">{feature.title}</h2>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Feature Content - Fixed Position */}
              <div className="w-2/3">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="absolute inset-0 bg-white p-8 rounded-lg shadow-lg"
                    style={{
                      opacity: selectedFeature.get() === index ? 1 : 0,
                    }}
                    transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
                  >
                    <h2 className="text-2xl font-bold mb-4 text-black">{feature.title}</h2>
                    <p className="text-gray-800">{feature.content}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

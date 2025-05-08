"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, HelpCircle, Filter, Pin, BarChart2, Zap } from "lucide-react";
import { AnimatedTabs } from "./animated-tabs";

interface OnboardingGuideProps {
  isOpen: boolean;
  onClose: () => void;
  showInfoButton?: boolean;
  onInfoButtonClick?: () => void;
}

const OnboardingGuide = ({
  isOpen,
  onClose,
  showInfoButton = true,
  onInfoButtonClick,
}: OnboardingGuideProps) => {
  const handleInfoClick = () => {
    if (onInfoButtonClick) {
      onInfoButtonClick();
    }
  };

  const onboardingTabs = [
    {
      id: "filter",
      label: "Filtering Data",
      content: (
        <div className="grid grid-cols-2 gap-4 w-full h-full">
          <img
            src="/filter-guide.jpg"
            alt="Filtering Data Guide"
            className="rounded-lg w-full h-60 object-cover mt-0 !m-0 shadow-[0_0_20px_rgba(0,0,0,0.2)] border-none"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1500&q=80";
            }}
          />
          <div className="flex flex-col gap-y-2">
            <h2 className="text-2xl font-bold mb-0 text-white mt-0 !m-0">
              Filtering Your Data
            </h2>
            <p className="text-sm text-gray-200 mt-0">
              There are multiple ways to filter technologies in the dashboard:
            </p>
            <ul className="text-sm text-gray-300 mt-2 list-disc pl-5 space-y-1">
              <li>Click map markers to filter by installation location</li>
              <li>Use column filters in the data table</li>
              <li>Use search bar for specific technology names</li>
              <li>Toggle between absolute costs and cost per point</li>
              <li>Use the dual range slider for cost filtering</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "compare",
      label: "Pinning for Comparison",
      content: (
        <div className="grid grid-cols-2 gap-4 w-full h-full">
          <img
            src="/compare-guide.jpg"
            alt="Comparison Guide"
            className="rounded-lg w-full h-60 object-cover mt-0 !m-0 shadow-[0_0_20px_rgba(0,0,0,0.2)] border-none"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1500&q=80";
            }}
          />
          <div className="flex flex-col gap-y-2">
            <h2 className="text-2xl font-bold mb-0 text-white mt-0 !m-0">
              Pinning Items to Compare
            </h2>
            <p className="text-sm text-gray-200 mt-0">
              You can pin technology items to compare them side by side.
            </p>
            <ul className="text-sm text-gray-300 mt-2 list-disc pl-5 space-y-1">
              <li>Find the pin icon in each table row to pin an item</li>
              <li>Pinned items appear in the comparison section</li>
              <li>Compare up to 3 technologies side by side</li>
              <li>View detailed differences between technologies</li>
              <li>You need to pin items to view analytics</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "analytics",
      label: "Analytics Section",
      content: (
        <div className="grid grid-cols-2 gap-4 w-full h-full">
          <img
            src="/analytics-guide.jpg"
            alt="Analytics Guide"
            className="rounded-lg w-full h-60 object-cover mt-0 !m-0 shadow-[0_0_20px_rgba(0,0,0,0.2)] border-none"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1500&q=80";
            }}
          />
          <div className="flex flex-col gap-y-2">
            <h2 className="text-2xl font-bold mb-0 text-white mt-0 !m-0">
              Analytics Section
            </h2>
            <p className="text-sm text-gray-200 mt-0">
              The Analytics section provides visual insights on your pinned technologies.
            </p>
            <ul className="text-sm text-gray-300 mt-2 list-disc pl-5 space-y-1">
              <li>Click the "Show Analytics" button to reveal this section</li>
              <li>View the spider chart to compare multiple criteria</li>
              <li>See financial breakdown of pinned technologies</li>
              <li>Compare technology maturity metrics</li>
              <li>Analyze investment size distribution</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "green",
      label: "Go-To-Green",
      content: (
        <div className="grid grid-cols-2 gap-4 w-full h-full">
          <img
            src="/green-guide.jpg"
            alt="Go-To-Green Guide"
            className="rounded-lg w-full h-60 object-cover mt-0 !m-0 shadow-[0_0_20px_rgba(0,0,0,0.2)] border-none"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1500&q=80";
            }}
          />
          <div className="flex flex-col gap-y-2">
            <h2 className="text-2xl font-bold mb-0 text-white mt-0 !m-0">
              Go-To-Green Section
            </h2>
            <p className="text-sm text-gray-200 mt-0">
              The Go-To-Green feature helps identify pathways to improve installation resiliency scores.
            </p>
            <ul className="text-sm text-gray-300 mt-2 list-disc pl-5 space-y-1">
              <li>Click "Show Go-To-Green" to open this section</li>
              <li>See current resiliency scores for installations</li>
              <li>Identify the gap needed to reach a "green" status</li>
              <li>View technologies needed to improve scores</li>
              <li>See estimated costs for implementation</li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  // No separate Info button component - we'll include it in page.tsx instead

  // Render just the modal when isOpen is true
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-slate-900 rounded-xl shadow-2xl max-w-3xl w-full mx-4 overflow-hidden border border-slate-700"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Welcome to the Technology Dashboard</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-800"
                  aria-label="Close"
                >
                  <X size={24} />
                </button>
              </div>
              
              <p className="text-gray-300 mb-6">
                This guide will help you understand how to use the dashboard to explore and analyze technology installations.
              </p>
              
              <AnimatedTabs tabs={onboardingTabs} className="max-w-none" />
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition-colors"
                >
                  Get Started
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { OnboardingGuide }; 
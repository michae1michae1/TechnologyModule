"use client";

import React, { createContext, useState, useContext, useEffect } from "react";

interface OnboardingContextType {
  isOnboardingOpen: boolean;
  hasSeenOnboarding: boolean;
  openOnboarding: () => void;
  closeOnboarding: () => void;
  markOnboardingAsSeen: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};

export const OnboardingProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  // Check localStorage for onboarding status on component mount
  useEffect(() => {
    const hasSeenOnboardingBefore = localStorage.getItem("hasSeenOnboarding") === "true";
    setHasSeenOnboarding(hasSeenOnboardingBefore);
    
    // If user has not seen onboarding, show it automatically
    if (!hasSeenOnboardingBefore) {
      setIsOnboardingOpen(true);
    }
  }, []);

  const openOnboarding = () => {
    setIsOnboardingOpen(true);
  };

  const closeOnboarding = () => {
    setIsOnboardingOpen(false);
  };

  const markOnboardingAsSeen = () => {
    setHasSeenOnboarding(true);
    localStorage.setItem("hasSeenOnboarding", "true");
  };

  return (
    <OnboardingContext.Provider
      value={{
        isOnboardingOpen,
        hasSeenOnboarding,
        openOnboarding,
        closeOnboarding,
        markOnboardingAsSeen,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}; 
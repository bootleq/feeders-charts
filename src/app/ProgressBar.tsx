"use client"

import { ProgressProvider } from '@bprogress/next/app';

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProgressProvider
      height="3px"
      color="#000"
      shallowRouting
    >
      {children}
    </ProgressProvider>
  );
};

export default Providers;

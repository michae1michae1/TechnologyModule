import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { FilterProvider } from '../context/FilterContext';
import { CompareProvider } from '../context/CompareContext'; 
import { DetailsProvider } from '../context/DetailsContext';
import { ThemeProvider } from '../context/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Air Force Energy Technology Dashboard',
  description: 'Dashboard for Air Force energy managers to explore technologies for base-level energy resiliency',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-950 text-white min-h-screen`}>
        <ThemeProvider>
          <FilterProvider>
            <CompareProvider>
              <DetailsProvider>
                {children}
              </DetailsProvider>
            </CompareProvider>
          </FilterProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 
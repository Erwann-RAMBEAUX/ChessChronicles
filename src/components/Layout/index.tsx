import { ReactNode } from 'react';
import { Header } from '../Header';

import { Footer } from '../Footer';

interface LayoutProps {
    children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans overflow-x-hidden selection:bg-primary/30 selection:text-primary-foreground">
            {/* Dynamic Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-900/10 rounded-full blur-[150px] animate-pulse-slow" />
                <div className="absolute top-[40%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[150px] animate-pulse-slow delay-1000" />
                <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[150px] animate-pulse-slow delay-2000" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow">
                    {children}
                </main>
                <Footer />
            </div>
        </div>
    );
};

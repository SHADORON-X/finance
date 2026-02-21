import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import Header from './Header';

const Layout = () => {
    return (
        <div className="min-h-screen bg-[var(--bg-space)] flex transition-colors duration-500">
            <BottomNav />
            <div className="flex-1 flex flex-col min-w-0">
                <Header />
                <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-8 pb-32 md:pb-8 pt-20">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;

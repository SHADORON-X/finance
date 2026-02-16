import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import Header from './Header';

const Layout = () => {
    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex">
            <BottomNav />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 pb-24 md:pb-8 pt-20">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;

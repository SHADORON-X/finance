import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import Header from './Header';

const Layout = () => {
    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            <Header />
            <main className="max-w-[480px] mx-auto px-4 pb-24 pt-20">
                <Outlet />
            </main>
            <BottomNav />
        </div>
    );
};

export default Layout;

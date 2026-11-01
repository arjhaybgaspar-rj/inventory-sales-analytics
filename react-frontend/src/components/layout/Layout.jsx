
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar.jsx";
import "./Sidebar.css";

function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    const toggleSidebar = () => {
        setSidebarOpen((open) => !open);
    };

    return (
        <div className="app-layout sage-app-layout">
            {sidebarOpen && (
                <button
                    type="button"
                    className="sage-sidebar-backdrop"
                    aria-label="Close navigation menu"
                    onClick={closeSidebar}
                />
            )}

            <Sidebar
                isOpen={sidebarOpen}
                onNavigate={closeSidebar}
            />

            <button
                type="button"
                className="sage-mobile-menu"
                aria-label={
                    sidebarOpen
                        ? "Close navigation menu"
                        : "Open navigation menu"
                }
                aria-expanded={sidebarOpen}
                onClick={toggleSidebar}
            >
                {sidebarOpen ? (
                    <X size={21} />
                ) : (
                    <Menu size={21} />
                )}
            </button>

            <main className="app-content sage-app-content">
                <div className="sage-app-content-inner">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default Layout;

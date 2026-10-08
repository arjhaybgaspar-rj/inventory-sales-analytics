import Sidebar from "./Sidebar";
import "./Sidebar.css";

function Layout({ children }) {
    return (
        <div className="app-layout modern-app-layout">
            <Sidebar />

            <main className="app-content modern-app-content">
                <div className="app-content-inner">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default Layout;
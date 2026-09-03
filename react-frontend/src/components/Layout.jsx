import { useState } from "react";

function Layout({ children }) {
    const [user] = useState(() => {
        const userData = localStorage.getItem("user");

        return userData
            ? JSON.parse(userData)
            : null;
    });

    const handleLogout = async () => {
        try {
            await fetch(
                "http://localhost:5000/logout",
                {
                    method: "POST",
                    credentials: "include"
                }
            );
        } catch (error) {
        }

        localStorage.removeItem("user");
        window.location.href = "/";
    };

    const navigate = (path) => {
        window.location.href = path;
    };

    const canManage =
        user &&
        ["admin", "owner", "manager"].includes(
            user.role
        );

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>ISA</h2>

                    <p>
                        Inventory Sales Analytics
                    </p>
                </div>

                <nav className="sidebar-nav">
                    <button
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        Dashboard
                    </button>

                    {canManage && (
                        <>
                            <button
                                onClick={() =>
                                    navigate("/products")
                                }
                            >
                                Products
                            </button>

                            <button
                                onClick={() =>
                                    navigate("/inventory")
                                }
                            >
                                Inventory
                            </button>
                        </>
                    )}

                    <button
                        onClick={() =>
                            navigate("/sales")
                        }
                    >
                        Sales
                    </button>

                    {canManage && (
                        <button
                            onClick={() =>
                                navigate("/reports")
                            }
                        >
                            Reports
                        </button>
                    )}
                </nav>

                <div className="sidebar-user">
                    <p>{user?.full_name}</p>

                    <span>{user?.role}</span>

                    <button
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </aside>

            <main className="app-content">
                {children}
            </main>
        </div>
    );
}

export default Layout;
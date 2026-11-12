import {
    Boxes,
    ChartNoAxesCombined,
    ClipboardList,
    LayoutDashboard,
    LogOut,
    PackageSearch,
    ShoppingCart,
    Users
} from "lucide-react";

import { API_BASE_URL } from "../../services/api.js";
import ISA from "../../assets/ISA.png";

function readStoredUser() {
    try {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        console.error("Unable to read stored user:", error);
        localStorage.removeItem("user");
        return null;
    }
}

function Sidebar({ isOpen = false, onNavigate = () => {} }) {
    const user = readStoredUser();
    const currentPath = window.location.pathname;
    const role = user?.role?.toLowerCase();

    const managerNavigation = [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { label: "Products", path: "/products", icon: PackageSearch },
        { label: "Inventory", path: "/inventory", icon: Boxes },
        { label: "Sales / POS", path: "/sales", icon: ShoppingCart },
        { label: "Reports & Analytics", path: "/reports", icon: ChartNoAxesCombined }
    ];

    const adminNavigation = [
        { label: "Reports & Analytics", path: "/reports", icon: ChartNoAxesCombined },
        { label: "Audit Logs", path: "/audit-logs", icon: ClipboardList },
        { label: "User Management", path: "/users", icon: Users }
    ];

    const cashierNavigation = [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { label: "Sales / POS", path: "/sales", icon: ShoppingCart }
    ];

    const navigationItems =
        role === "admin"
            ? adminNavigation
            : role === "manager"
              ? managerNavigation
              : role === "cashier"
                ? cashierNavigation
                : [];

    const navigate = (path) => {
        onNavigate();

        if (currentPath !== path) {
            window.location.assign(path);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch(`${API_BASE_URL}/logout`, {
                method: "POST",
                credentials: "include"
            });
        } catch (error) {
            console.error("Logout request failed:", error);
        } finally {
            localStorage.removeItem("user");
            window.location.assign("/");
        }
    };

    const getInitials = () => {
        const name = user?.full_name?.trim();

        if (!name) return "U";

        const parts = name.split(/\s+/);

        if (parts.length === 1) {
            return parts[0].charAt(0).toUpperCase();
        }

        return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    };

    const roleLabel = role
        ? role.charAt(0).toUpperCase() + role.slice(1)
        : "Account";

    const isProfileActive = currentPath === "/profile";

    return (
        <aside
            className={`sage-sidebar${isOpen ? " is-open" : ""}`}
            aria-label="Main navigation"
        >
            <div className="sage-sidebar-brand">
                <span className="sage-sidebar-brand-mark" aria-hidden="true">
                    <img src={ISA} alt="" />
                </span>

                <span className="sage-sidebar-brand-copy">
                    <strong>Inventory &amp; Sales</strong>
                    <span>Management workspace</span>
                </span>
            </div>

            <div className="sage-sidebar-divider" />

            <div className="sage-sidebar-navigation-area">
                <p className="sage-sidebar-section-label">
                    {role === "admin" ? "ADMINISTRATION" : "WORKSPACE"}
                </p>

                <nav className="sage-sidebar-nav" aria-label="Workspace">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPath === item.path;

                        return (
                            <button
                                type="button"
                                key={item.path}
                                className={`sage-sidebar-nav-item${isActive ? " active" : ""}`}
                                onClick={() => navigate(item.path)}
                                aria-current={isActive ? "page" : undefined}
                            >
                                <span className="sage-sidebar-nav-icon" aria-hidden="true">
                                    <Icon size={18} strokeWidth={1.8} />
                                </span>

                                <span className="sage-sidebar-nav-label">
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="sage-sidebar-bottom">
                <div className="sage-sidebar-divider sage-sidebar-bottom-divider" />

                <div className="sage-sidebar-user">
                    <button
                        type="button"
                        className={`sage-sidebar-user-profile${isProfileActive ? " active" : ""}`}
                        onClick={() => navigate("/profile")}
                        aria-current={isProfileActive ? "page" : undefined}
                        aria-label={`Open profile for ${user?.full_name || "User"}`}
                    >
                        <span className="sage-sidebar-avatar" aria-hidden="true">
                            {getInitials()}
                        </span>

                        <span className="sage-sidebar-user-info">
                            <strong title={user?.full_name || "User"}>
                                {user?.full_name || "User"}
                            </strong>
                            <span>{roleLabel}</span>
                        </span>
                    </button>

                    <button
                        type="button"
                        className="sage-sidebar-logout"
                        onClick={handleLogout}
                    >
                        <LogOut size={16} strokeWidth={1.8} aria-hidden="true" />
                        <span>Log out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
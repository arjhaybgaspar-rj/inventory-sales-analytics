import {
    Boxes,
    ChartNoAxesCombined,
    ChevronRight,
    LayoutDashboard,
    LogOut,
    PackageSearch,
    ShoppingCart
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

function Sidebar({ isOpen = false, onNavigate = () => { } }) {
    const user = readStoredUser();
    const currentPath = window.location.pathname;
    const canManage = user && ["admin", "owner", "manager"].includes(user.role);

    const navigationItems = [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, visible: true },
        { label: "Products", path: "/products", icon: PackageSearch, visible: canManage },
        { label: "Inventory", path: "/inventory", icon: Boxes, visible: canManage },
        { label: "Sales / POS", path: "/sales", icon: ShoppingCart, visible: true },
        { label: "Reports & Analytics", path: "/reports", icon: ChartNoAxesCombined, visible: canManage }
    ];

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
            // Clear the local session even if the backend cannot be reached.
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
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    };

    const roleLabel = user?.role
        ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
        : "Account";

    return (
        <aside className={`sage-sidebar${isOpen ? " is-open" : ""}`} aria-label="Main navigation">
            <div className="sage-sidebar-brand">
                <span className="sage-sidebar-brand-mark" aria-hidden="true">
                    <img src={ISA} alt="Inventory Sales Analytics" />
                </span>
                <span className="sage-sidebar-brand-copy">
                    <strong>Inventory &amp; Sales</strong>
                    <span>Management workspace</span>
                </span>
            </div>

            <div className="sage-sidebar-divider" />

            <div className="sage-sidebar-navigation-area">
                <p className="sage-sidebar-section-label">WORKSPACE</p>

                <nav className="sage-sidebar-nav">
                    {navigationItems.filter((item) => item.visible).map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPath === item.path;

                        return (
                            <button
                                type="button"
                                key={item.path}
                                className={`sage-sidebar-nav-item${isActive ? " active" : ""}`}
                                onClick={() => navigate(item.path)}
                                aria-current={isActive ? "page" : undefined}
                                title={item.label}
                            >
                                <span className="sage-sidebar-nav-icon" aria-hidden="true">
                                    <Icon size={19} strokeWidth={1.9} />
                                </span>
                                <span className="sage-sidebar-nav-label">{item.label}</span>
                                <ChevronRight className="sage-sidebar-nav-arrow" size={16} strokeWidth={1.9} aria-hidden="true" />
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="sage-sidebar-bottom">
                <div className="sage-sidebar-note">
                    <span className="sage-sidebar-note-icon" aria-hidden="true">
                        <PackageSearch size={18} strokeWidth={1.9} />
                    </span>
                    <div>
                        <strong>Stay in control</strong>
                        <span>Stock, sales, and insights in one place.</span>
                    </div>
                </div>

                <div className="sage-sidebar-divider sage-sidebar-bottom-divider" />

                <div className="sage-sidebar-user">
                    <div className="sage-sidebar-user-profile">
                        <span className="sage-sidebar-avatar" aria-hidden="true">{getInitials()}</span>
                        <span className="sage-sidebar-user-info">
                            <strong title={user?.full_name || "User"}>{user?.full_name || "User"}</strong>
                            <span>{roleLabel}</span>
                        </span>
                    </div>

                    <button type="button" className="sage-sidebar-logout" onClick={handleLogout}>
                        <LogOut size={17} strokeWidth={1.9} />
                        <span>Log out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;

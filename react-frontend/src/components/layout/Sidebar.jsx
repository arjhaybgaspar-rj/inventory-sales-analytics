import {
    Boxes,
    ChartNoAxesCombined,
    ChevronRight,
    LayoutDashboard,
    LogOut,
    PackageSearch,
    ShoppingCart,
    Sparkles
} from "lucide-react";

const API_BASE_URL =
    "http://localhost:5000";

function Sidebar() {
    const userData =
        localStorage.getItem("user");

    const user = userData
        ? JSON.parse(userData)
        : null;

    const currentPath =
        window.location.pathname;

    const canManage =
        user &&
        [
            "admin",
            "owner",
            "manager"
        ].includes(user.role);

    const navigationItems = [
        {
            label: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard,
            visible: true
        },
        {
            label: "Products",
            path: "/products",
            icon: PackageSearch,
            visible: canManage
        },
        {
            label: "Inventory",
            path: "/inventory",
            icon: Boxes,
            visible: canManage
        },
        {
            label: "Sales",
            path: "/sales",
            icon: ShoppingCart,
            visible: true
        },
        {
            label: "Reports",
            path: "/reports",
            icon: ChartNoAxesCombined,
            visible: canManage
        }
    ];

    const navigate = (path) => {
        if (currentPath === path) {
            return;
        }

        window.location.href = path;
    };

    const handleLogout = async () => {
        try {
            await fetch(
                `${API_BASE_URL}/logout`,
                {
                    method: "POST",
                    credentials: "include"
                }
            );
        } catch (error) {
            console.error(
                "Logout request failed:",
                error
            );
        }

        localStorage.removeItem("user");

        window.location.href = "/";
    };

    const getInitials = () => {
        if (!user?.full_name) {
            return "U";
        }

        const nameParts =
            user.full_name
                .trim()
                .split(/\s+/);

        if (nameParts.length === 1) {
            return nameParts[0]
                .charAt(0)
                .toUpperCase();
        }

        return (
            nameParts[0].charAt(0) +
            nameParts[
                nameParts.length - 1
            ].charAt(0)
        ).toUpperCase();
    };

    return (
        <aside className="sidebar modern-sidebar">
            <div className="sidebar-background-glow sidebar-glow-one" />
            <div className="sidebar-background-glow sidebar-glow-two" />

            <div className="sidebar-brand">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-shape">
                        <Sparkles
                            size={21}
                            strokeWidth={2}
                        />
                    </div>

                    <div className="sidebar-logo-glow" />
                </div>

                <div className="sidebar-brand-copy">
                    <h2>ISA</h2>

                    <p>
                        Inventory Sales Analytics
                    </p>
                </div>
            </div>

            <div className="sidebar-divider" />

            <div className="sidebar-navigation-area">
                <p className="sidebar-section-label">
                    Workspace
                </p>

                <nav className="sidebar-nav modern-sidebar-nav">
                    {navigationItems
                        .filter(
                            (item) =>
                                item.visible
                        )
                        .map((item) => {
                            const Icon =
                                item.icon;

                            const isActive =
                                currentPath ===
                                item.path;

                            return (
                                <button
                                    type="button"
                                    key={
                                        item.path
                                    }
                                    className={
                                        isActive
                                            ? "sidebar-nav-item active"
                                            : "sidebar-nav-item"
                                    }
                                    onClick={() =>
                                        navigate(
                                            item.path
                                        )
                                    }
                                    aria-current={
                                        isActive
                                            ? "page"
                                            : undefined
                                    }
                                >
                                    <span className="sidebar-nav-icon">
                                        <Icon
                                            size={18}
                                            strokeWidth={
                                                1.9
                                            }
                                        />
                                    </span>

                                    <span className="sidebar-nav-label">
                                        {
                                            item.label
                                        }
                                    </span>

                                    <ChevronRight
                                        className="sidebar-nav-arrow"
                                        size={15}
                                        strokeWidth={
                                            2
                                        }
                                    />
                                </button>
                            );
                        })}
                </nav>
            </div>

            <div className="sidebar-bottom">
                <div className="sidebar-system-card">
                    <div className="sidebar-system-icon">
                        <PackageSearch
                            size={17}
                            strokeWidth={2}
                        />
                    </div>

                    <div>
                        <strong>
                            System Online
                        </strong>

                        <span>
                            Inventory services
                            active
                        </span>
                    </div>

                    <span className="sidebar-online-dot" />
                </div>

                <div className="sidebar-divider sidebar-bottom-divider" />

                <div className="sidebar-user modern-sidebar-user">
                    <div className="sidebar-user-profile">
                        <div className="sidebar-avatar">
                            {getInitials()}
                        </div>

                        <div className="sidebar-user-info">
                            <p>
                                {user?.full_name ||
                                    "User"}
                            </p>

                            <span>
                                {user?.role ||
                                    "Account"}
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="sidebar-logout-button"
                        onClick={
                            handleLogout
                        }
                    >
                        <LogOut
                            size={17}
                            strokeWidth={2}
                        />

                        <span>
                            Logout
                        </span>
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
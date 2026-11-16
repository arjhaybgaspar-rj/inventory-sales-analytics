
import { ArrowLeft, ShieldX } from "lucide-react";
import { useEffect } from "react";

import Users from "./pages/users/Users.jsx";
import AuditLogs from "./pages/audit-logs/AuditLogs.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import StockMonitoring from "./pages/fefo/fefo.jsx";
import Inventory from "./pages/inventory/Inventory.jsx";
import Products from "./pages/products/Products.jsx";
import Reports from "./pages/reports/Reports.jsx";
import Sales from "./pages/sales/Sales.jsx";
import Profile from "./pages/profile/profile.jsx";
import Login from "./pages/login/Login.jsx";
import Layout from "./components/Layout.jsx";

import "./App.css";

const ROUTES = {
    "/dashboard": {
        component: Dashboard,
        roles: ["admin", "manager", "cashier"]
    },
    "/products": {
        component: Products,
        roles: ["manager"]
    },
    "/inventory": {
        component: Inventory,
        roles: ["manager"]
    },
    "/stock-monitoring": {
        component: StockMonitoring,
        roles: ["manager"]
    },
    "/fefo-recommendations": {
        component: StockMonitoring,
        roles: ["manager"]
    },
    "/sales": {
        component: Sales,
        roles: ["manager", "cashier"]
    },
    "/reports": {
        component: Reports,
        roles: ["admin", "manager"]
    },
    "/profile": {
        component: Profile,
        roles: ["admin", "manager", "cashier"]
    },
    "/users": {
        component: Users,
        roles: ["admin"]
    },
    "/audit-logs": {
        component: AuditLogs,
        roles: ["admin"]
    }
};

function getStoredUser() {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) return null;

    try {
        return JSON.parse(storedUser);
    } catch (error) {
        console.error("Invalid user data in localStorage:", error);
        localStorage.removeItem("user");
        return null;
    }
}

function getDefaultPath(role) {
    return role === "admin" ? "/reports" : "/dashboard";
}

function AccessDenied({ role }) {
    const goToDefaultPage = () => {
        window.location.href = getDefaultPath(role);
    };

    return (
        <main className="access-denied-page">
            <section className="access-denied-card">
                <div className="access-denied-icon">
                    <ShieldX size={34} strokeWidth={1.7} />
                </div>

                <span className="access-denied-eyebrow">
                    Restricted Area
                </span>

                <h1>Access Denied</h1>

                <p>
                    Your account does not have permission to access
                    this section of Inventory Sales Analytics.
                </p>

                <button type="button" onClick={goToDefaultPage}>
                    <ArrowLeft size={17} strokeWidth={2} />
                    Back to Your Workspace
                </button>
            </section>
        </main>
    );
}

function App() {
    const currentPath = window.location.pathname;
    const user = getStoredUser();
    const role = String(user?.role || "").toLowerCase();
    const route = ROUTES[currentPath];

    useEffect(() => {
        if (currentPath !== "/" && !user) {
            window.location.replace("/");
        } else if (currentPath !== "/" && user && !route) {
            window.location.replace(getDefaultPath(role));
        }
    }, [currentPath, role, route, user]);

    if (currentPath === "/") {
        return <Login />;
    }

    if (!user) {
        return null;
    }

    if (!route) {
        return null;
    }

    if (!route.roles.includes(role)) {
        return <AccessDenied role={role} />;
    }

    const PageComponent = route.component;

    return (
        <Layout>
            <PageComponent />
        </Layout>
    );
}

export default App;

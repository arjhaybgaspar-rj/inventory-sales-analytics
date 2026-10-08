import {
    ArrowLeft,
    ShieldX
} from "lucide-react";

import Dashboard from "./pages/dashboard/Dashboard.jsx";
import Inventory from "./pages/inventory/Inventory.jsx";
import Products from "./pages/products/Products.jsx";
import Reports from "./pages/reports/Reports.jsx";
import Sales from "./pages/sales/Sales.jsx";

import Login from "./pages/login/Login.jsx";

import Layout from "./components/Layout.jsx";

import "./App.css";


const ROUTES = {
    "/dashboard": {
        component: Dashboard,

        roles: [
            "admin",
            "owner",
            "manager",
            "cashier"
        ]
    },

    "/products": {
        component: Products,

        roles: [
            "admin",
            "owner",
            "manager"
        ]
    },

    "/inventory": {
        component: Inventory,

        roles: [
            "admin",
            "owner",
            "manager"
        ]
    },

    "/sales": {
        component: Sales,

        roles: [
            "admin",
            "owner",
            "manager",
            "cashier"
        ]
    },

    "/reports": {
        component: Reports,

        roles: [
            "admin",
            "owner",
            "manager"
        ]
    }
};


function getStoredUser() {
    const storedUser =
        localStorage.getItem(
            "user"
        );

    if (!storedUser) {
        return null;
    }

    try {
        return JSON.parse(
            storedUser
        );
    } catch (error) {
        console.error(
            "Invalid user data in localStorage:",
            error
        );

        localStorage.removeItem(
            "user"
        );

        return null;
    }
}


function AccessDenied() {
    const goToDashboard = () => {
        window.location.href =
            "/dashboard";
    };


    return (
        <main className="access-denied-page">
            <section className="access-denied-card">
                <div className="access-denied-icon">
                    <ShieldX
                        size={34}
                        strokeWidth={1.7}
                    />
                </div>

                <span className="access-denied-eyebrow">
                    Restricted Area
                </span>

                <h1>
                    Access Denied
                </h1>

                <p>
                    Your account does not
                    have permission to
                    access this section of
                    Inventory Sales
                    Analytics.
                </p>

                <button
                    type="button"
                    onClick={
                        goToDashboard
                    }
                >
                    <ArrowLeft
                        size={17}
                        strokeWidth={2}
                    />

                    Back to Dashboard
                </button>
            </section>
        </main>
    );
}


function App() {
    const currentPath =
        window.location.pathname;

    const user =
        getStoredUser();


    if (currentPath === "/") {
        return <Login />;
    }


    if (!user) {
        window.location.href =
            "/";

        return null;
    }


    const route =
        ROUTES[currentPath];


    if (!route) {
        window.location.href =
            "/dashboard";

        return null;
    }


    if (
        !route.roles.includes(
            user.role
        )
    ) {
        return (
            <AccessDenied />
        );
    }


    const PageComponent =
        route.component;


    return (
        <Layout>
            <PageComponent />
        </Layout>
    );
}

export default App;
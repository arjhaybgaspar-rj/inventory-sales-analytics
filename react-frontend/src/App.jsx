import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Reports from "./pages/Reports";
import Layout from "./components/Layout.jsx";
import "./App.css";

const API_BASE_URL = "http://localhost:5000";

function App() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const currentPath = window.location.pathname;

    const userData = localStorage.getItem("user");
    const user = userData
        ? JSON.parse(userData)
        : null;

    const allowedRoles = {
        "/dashboard": [
            "admin",
            "owner",
            "manager",
            "cashier"
        ],
        "/products": [
            "admin",
            "owner",
            "manager"
        ],
        "/inventory": [
            "admin",
            "owner",
            "manager"
        ],
        "/sales": [
            "admin",
            "owner",
            "manager",
            "cashier"
        ],
        "/reports": [
            "admin",
            "owner",
            "manager"
        ]
    };

    if (currentPath !== "/" && !user) {
        window.location.href = "/";
        return null;
    }

    if (
        currentPath !== "/" &&
        allowedRoles[currentPath] &&
        !allowedRoles[currentPath].includes(
            user.role
        )
    ) {
        return (
            <main className="access-denied-page">
                <section className="access-denied-container">
                    <h1>Access Denied</h1>

                    <p>
                        You do not have permission
                        to access this page.
                    </p>

                    <button
                        onClick={() => {
                            window.location.href =
                                "/dashboard";
                        }}
                    >
                        Back to Dashboard
                    </button>
                </section>
            </main>
        );
    }

    if (currentPath === "/dashboard") {
        return (
            <Layout>
                <Dashboard />
            </Layout>
        );
    }

    if (currentPath === "/products") {
        return (
            <Layout>
                <Products />
            </Layout>
        );
    }

    if (currentPath === "/inventory") {
        return (
            <Layout>
                <Inventory />
            </Layout>
        );
    }

    if (currentPath === "/sales") {
        return (
            <Layout>
                <Sales />
            </Layout>
        );
    }

    if (currentPath === "/reports") {
        return (
            <Layout>
                <Reports />
            </Layout>
        );
    }

    const handleLogin = async (event) => {
        event.preventDefault();

        if (!username || !password) {
            setMessage(
                "Username and password are required."
            );
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        username,
                        password
                    })
                }
            );

            const data = await response.json();

            if (data.success) {
                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

                window.location.href =
                    "/dashboard";
            } else {
                setMessage(
                    data.message ||
                        "Invalid username or password."
                );
            }
        } catch (error) {
            setMessage(
                "Unable to connect to the backend."
            );
        }

        setLoading(false);
    };

    return (
        <main className="login-page">
            <section className="login-container">
                <div className="login-header">
                    <h1>
                        Inventory Sales Analytics
                    </h1>

                    <p>
                        Real-Time Stock Monitoring
                        System
                    </p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="username">
                            Username
                        </label>

                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(event) =>
                                setUsername(
                                    event.target.value
                                )
                            }
                            placeholder="Enter your username"
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(
                                    event.target.value
                                )
                            }
                            placeholder="Enter your password"
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>

                    <p>{message}</p>
                </form>
            </section>
        </main>
    );
}

export default App;
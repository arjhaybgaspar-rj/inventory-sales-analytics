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
    const [isRegister, setIsRegister] = useState(false);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

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
        !allowedRoles[currentPath].includes(user.role)
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

    const handleRegister = async (event) => {
        event.preventDefault();

        if (
            !fullName ||
            !username ||
            !password ||
            !confirmPassword
        ) {
            setMessage(
                "All fields are required."
            );
            return;
        }

        if (fullName.length < 2) {
            setMessage(
                "Full name must be at least 2 characters."
            );
            return;
        }

        if (username.length < 3) {
            setMessage(
                "Username must be at least 3 characters."
            );
            return;
        }

        if (password.length < 6) {
            setMessage(
                "Password must be at least 6 characters."
            );
            return;
        }

        if (password !== confirmPassword) {
            setMessage(
                "Passwords do not match."
            );
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        full_name: fullName,
                        username,
                        password,
                        confirm_password:
                            confirmPassword
                    })
                }
            );

            const data = await response.json();

            if (data.success) {
                setMessage(
                    "Registration successful. You can now login."
                );

                setFullName("");
                setUsername("");
                setPassword("");
                setConfirmPassword("");

                setTimeout(() => {
                    setIsRegister(false);
                    setMessage("");
                }, 1500);
            } else {
                setMessage(
                    data.message ||
                    "Unable to register user."
                );
            }
        } catch (error) {
            setMessage(
                "Unable to connect to the backend."
            );
        }

        setLoading(false);
    };

    const switchForm = () => {
        setIsRegister(!isRegister);
        setFullName("");
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setMessage("");
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

                {isRegister ? (
                    <form onSubmit={handleRegister}>
                        <div className="form-group">
                            <label htmlFor="fullName">
                                Full Name
                            </label>

                            <input
                                type="text"
                                id="fullName"
                                value={fullName}
                                onChange={(event) =>
                                    setFullName(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter your full name"
                                autoComplete="name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="registerUsername">
                                Username
                            </label>

                            <input
                                type="text"
                                id="registerUsername"
                                value={username}
                                onChange={(event) =>
                                    setUsername(
                                        event.target.value
                                    )
                                }
                                placeholder="Create a username"
                                autoComplete="username"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="registerPassword">
                                Password
                            </label>

                            <input
                                type="password"
                                id="registerPassword"
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value
                                    )
                                }
                                placeholder="Create a password"
                                autoComplete="new-password"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">
                                Confirm Password
                            </label>

                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(event) =>
                                    setConfirmPassword(
                                        event.target.value
                                    )
                                }
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating Account..."
                                : "Register"}
                        </button>

                        <p>{message}</p>

                        <div className="auth-switch">
                            <span>
                                Already have an account?
                            </span>

                            <button
                                type="button"
                                onClick={switchForm}
                            >
                                Login
                            </button>
                        </div>
                    </form>
                ) : (
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

                        <div className="auth-switch">
                            <span>
                                Don't have an account?
                            </span>

                            <button
                                type="button"
                                onClick={switchForm}
                            >
                                Register
                            </button>
                        </div>
                    </form>
                )}
            </section>
        </main>
    );
}

export default App;
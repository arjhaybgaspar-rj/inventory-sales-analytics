
import { useState } from "react";
import {
    ArrowRight,
    Eye,
    EyeOff,
    LockKeyhole,
    UserRound
} from "lucide-react";

import { API_BASE_URL } from "../../services/api";
import "./Login.css";
import ISA from "../../assets/ISA.png";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("error");
    const [loading, setLoading] = useState(false);


    const handleLogin = async (event) => {
        event.preventDefault();

        const cleanUsername = username.trim();

        if (!cleanUsername || !password) {
            setMessageType("error");
            setMessage("Enter your username and password to continue.");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    username: cleanUsername,
                    password
                })
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok && data.success && data.user) {
                const user = {
                    ...data.user,
                    role: data.user.role?.trim().toLowerCase()
                };

                localStorage.setItem("user", JSON.stringify(user));

                const destination = user.role === "admin"
                    ? "/reports"
                    : "/dashboard";

                window.location.href = destination;
                return;
            }

            setMessageType("error");
            setMessage(data.message || "We couldn't sign you in. Check your details and try again.");
        } catch (error) {
            console.error("Login error:", error);
            setMessageType("error");
            setMessage("Unable to connect to the system. Check that the backend is running, then try again.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <main className="auth-page">
            <div className="auth-page-shape auth-page-shape-one" aria-hidden="true" />
            <div className="auth-page-shape auth-page-shape-two" aria-hidden="true" />

            <section className="auth-shell" aria-label="Inventory Sales Analytics account access">
                <aside className="auth-story">
                    <div className="auth-brand">
                        <span className="auth-brand-mark" aria-hidden="true">
                            <img src={ISA} alt="Inventory Sales Analytics" />
                        </span>
                        <span className="auth-brand-copy">
                            <strong>Inventory &amp; Sales</strong>

                        </span>
                    </div>

                    <div className="auth-story-main">
                        <h1>
                            Stock, in focus.
                            <br />
                            Sales, in sync.
                        </h1>
                        <p className="auth-story-description">
                            Inventory and sales, all in one view.
                        </p>

                        <div className="auth-hero-visual" aria-hidden="true">
                            <div className="auth-hero-orb" />
                            <div className="auth-hero-ring auth-hero-ring-one" />
                            <div className="auth-hero-ring auth-hero-ring-two" />
                            <div className="auth-hero-dashboard">
                                <div className="auth-hero-dashboard-top">
                                    <span />
                                    <span />
                                    <span />
                                </div>
                                <div className="auth-hero-dashboard-bars">
                                    <i style={{ height: "34%" }} />
                                    <i style={{ height: "55%" }} />
                                    <i style={{ height: "45%" }} />
                                    <i style={{ height: "72%" }} />
                                    <i style={{ height: "63%" }} />
                                    <i style={{ height: "90%" }} />
                                    <i style={{ height: "76%" }} />
                                </div>
                            </div>
                            <div className="auth-hero-token auth-hero-token-one" />
                            <div className="auth-hero-token auth-hero-token-two" />
                        </div>
                    </div>
                </aside>


                <section className="auth-panel">
                    <div className="auth-mobile-brand">
                        <span className="auth-brand-mark" aria-hidden="true">
                            <img src="/inventory-sales-management-badge.webp" alt="" />
                        </span>
                        <span className="auth-brand-copy">
                            <strong>Inventory &amp; Sales</strong>

                        </span>
                    </div>

                    <div className="auth-panel-inner">
                        <div className="auth-panel-heading">
                            <h2>Welcome back</h2>
                        </div>

                        <form className="auth-form" onSubmit={handleLogin} noValidate>
                            <div className="auth-field">
                                <label htmlFor="auth-username">Username</label>
                                <div className="auth-input-wrap">
                                    <UserRound size={18} className="auth-input-icon" aria-hidden="true" />
                                    <input
                                        id="auth-username"
                                        name="username"
                                        type="text"
                                        value={username}
                                        onChange={(event) => setUsername(event.target.value)}
                                        placeholder="Enter your username"
                                        autoComplete="username"
                                        autoCapitalize="none"
                                        spellCheck="false"
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="auth-field">
                                <div className="auth-label-row">
                                    <label htmlFor="auth-password">Password</label>
                                    <span>Keep your account secure</span>
                                </div>
                                <div className="auth-input-wrap">
                                    <LockKeyhole size={18} className="auth-input-icon" aria-hidden="true" />
                                    <input
                                        id="auth-password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        disabled={loading}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="auth-password-toggle"
                                        onClick={() => setShowPassword((current) => !current)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        disabled={loading}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {message && (
                                <div className={`auth-message auth-message-${messageType}`} role="alert">
                                    <span className="auth-message-mark">!</span>
                                    <span>{message}</span>
                                </div>
                            )}

                            <button type="submit" className="auth-submit-button" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="auth-spinner" aria-hidden="true" />
                                        Signing you in…
                                    </>
                                ) : (
                                    <>
                                        Sign in
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>

                        </form>
                    </div>
                </section>
            </section>
        </main>
    );
}

export default Login;

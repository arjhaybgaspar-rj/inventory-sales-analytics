import { useState } from "react";
import {
    ArrowRight,
    BarChart3,
    Boxes,
    Eye,
    EyeOff,
    Leaf,
    LockKeyhole,
    LogIn,
    PackageSearch,
    ScanBarcode,
    ShieldCheck,
    ShoppingCart,
    Sparkles,
    UserRound,
    UserRoundPlus
} from "lucide-react";

import { API_BASE_URL } from "../../services/api";
import "./Login.css";
import ISA from "../../assets/ISA.png";

function Login() {
    const [mode, setMode] = useState("signin");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("error");
    const [loading, setLoading] = useState(false);

    const [fullName, setFullName] = useState("");
    const [newUsername, setNewUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const switchMode = (nextMode) => {
        setMode(nextMode);
        setMessage("");
        setPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

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
                localStorage.setItem("user", JSON.stringify(data.user));
                window.location.href = "/dashboard";
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

    const handleSignUp = (event) => {
        event.preventDefault();

        if (!fullName.trim() || !newUsername.trim() || !newPassword || !confirmPassword) {
            setMessageType("error");
            setMessage("Complete each field to continue.");
            return;
        }

        if (newPassword.length < 8) {
            setMessageType("error");
            setMessage("Choose a password with at least 8 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessageType("error");
            setMessage("Your passwords don't match. Check them and try again.");
            return;
        }

        // The current backend has no registration endpoint. Never simulate a successful account creation.
        setMessageType("info");
        setMessage("Self-service registration is not connected yet. No account was created. Please contact your system administrator to request access.");
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
                            <span>Management workspace</span>
                        </span>
                    </div>

                    <div className="auth-story-main">
                        <span className="auth-kicker">
                            <Sparkles size={15} strokeWidth={2} />
                            SMARTER DAILY OPERATIONS
                        </span>

                        <h1>
                            Know your stock.
                            <br />
                            Grow with clarity.
                        </h1>

                        <p className="auth-story-description">
                            One thoughtful workspace for product records, barcode scanning,
                            inventory movement, point-of-sale transactions, and business insights.
                        </p>

                        <div className="auth-preview-card" aria-label="Illustration of the inventory workspace">
                            <div className="auth-preview-topline">
                                <span className="auth-preview-icon">
                                    <PackageSearch size={19} strokeWidth={1.9} />
                                </span>
                                <span className="auth-preview-title">
                                    <strong>Your workspace</strong>
                                    <small>Inventory overview</small>
                                </span>
                                <span className="auth-preview-dots" aria-hidden="true">
                                    <i />
                                    <i />
                                    <i />
                                </span>
                            </div>

                            <div className="auth-preview-metrics">
                                <div className="auth-preview-metric">
                                    <span className="auth-preview-metric-icon auth-preview-metric-icon-green">
                                        <Boxes size={17} />
                                    </span>
                                    <span>Stock control</span>
                                    <strong>Stay organized</strong>
                                </div>
                                <div className="auth-preview-metric">
                                    <span className="auth-preview-metric-icon auth-preview-metric-icon-orange">
                                        <ShoppingCart size={17} />
                                    </span>
                                    <span>Point of sale</span>
                                    <strong>Serve with ease</strong>
                                </div>
                            </div>

                            <div className="auth-preview-activity">
                                <div className="auth-preview-activity-icon">
                                    <ScanBarcode size={17} />
                                </div>
                                <div className="auth-preview-activity-copy">
                                    <strong>Barcode-ready workflow</strong>
                                    <span>Find products with fewer steps</span>
                                </div>
                                <ArrowRight size={17} className="auth-preview-activity-arrow" />
                            </div>

                            <div className="auth-preview-chart" aria-hidden="true">
                                <div className="auth-preview-chart-heading">
                                    <span>Clearer decisions</span>
                                    <span>Sales insights</span>
                                </div>
                                <div className="auth-preview-chart-bars">
                                    <i style={{ height: "34%" }} />
                                    <i style={{ height: "54%" }} />
                                    <i style={{ height: "43%" }} />
                                    <i style={{ height: "72%" }} />
                                    <i style={{ height: "61%" }} />
                                    <i style={{ height: "88%" }} />
                                    <i style={{ height: "76%" }} />
                                    <i style={{ height: "96%" }} />
                                </div>
                            </div>
                        </div>

                        <div className="auth-feature-row">
                            <span><ScanBarcode size={16} /> Barcode scanning</span>
                            <span><BarChart3 size={16} /> Sales analytics</span>
                            <span><ShieldCheck size={16} /> Role-based access</span>
                        </div>
                    </div>

                    <div className="auth-story-footer">
                        <span className="auth-footer-leaf"><Leaf size={15} /></span>
                        <span>Made for more organized inventory operations.</span>
                    </div>
                </aside>

                <section className="auth-panel">
                    <div className="auth-mobile-brand">
                        <span className="auth-brand-mark" aria-hidden="true">
                            <img src="/inventory-sales-management-badge.webp" alt="" />
                        </span>
                        <span className="auth-brand-copy">
                            <strong>Inventory &amp; Sales</strong>
                            <span>Management workspace</span>
                        </span>
                    </div>

                    <div className="auth-panel-inner">
                        <div className="auth-panel-heading">
                            <span className="auth-section-label">
                                <span className="auth-section-label-dot" />
                                SECURE WORKSPACE
                            </span>
                            <h2>{mode === "signin" ? "Welcome back" : "Create your account"}</h2>
                            <p>
                                {mode === "signin"
                                    ? "Sign in to pick up where your work left off."
                                    : "Set up your details to see the account registration options."}
                            </p>
                        </div>

                        <div className="auth-mode-switch" role="tablist" aria-label="Account access options">
                            <button
                                type="button"
                                role="tab"
                                aria-selected={mode === "signin"}
                                className={mode === "signin" ? "auth-mode-tab active" : "auth-mode-tab"}
                                onClick={() => switchMode("signin")}
                            >
                                <LogIn size={17} />
                                Sign in
                            </button>
                            <button
                                type="button"
                                role="tab"
                                aria-selected={mode === "signup"}
                                className={mode === "signup" ? "auth-mode-tab active" : "auth-mode-tab"}
                                onClick={() => switchMode("signup")}
                            >
                                <UserRoundPlus size={17} />
                                Sign up
                            </button>
                        </div>

                        {mode === "signin" ? (
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
                                            Sign in to workspace
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>

                                <p className="auth-form-helper">
                                    <ShieldCheck size={16} />
                                    Your access is protected by your assigned account role.
                                </p>
                            </form>
                        ) : (
                            <form className="auth-form auth-form-signup" onSubmit={handleSignUp} noValidate>
                                <div className="auth-field">
                                    <label htmlFor="auth-full-name">Full name</label>
                                    <div className="auth-input-wrap">
                                        <UserRound size={18} className="auth-input-icon" aria-hidden="true" />
                                        <input
                                            id="auth-full-name"
                                            name="fullName"
                                            type="text"
                                            value={fullName}
                                            onChange={(event) => setFullName(event.target.value)}
                                            placeholder="Enter your full name"
                                            autoComplete="name"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="auth-field">
                                    <label htmlFor="auth-new-username">Preferred username</label>
                                    <div className="auth-input-wrap">
                                        <UserRoundPlus size={18} className="auth-input-icon" aria-hidden="true" />
                                        <input
                                            id="auth-new-username"
                                            name="newUsername"
                                            type="text"
                                            value={newUsername}
                                            onChange={(event) => setNewUsername(event.target.value)}
                                            placeholder="Choose a username"
                                            autoComplete="username"
                                            autoCapitalize="none"
                                            spellCheck="false"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="auth-field">
                                    <label htmlFor="auth-new-password">Create password</label>
                                    <div className="auth-input-wrap">
                                        <LockKeyhole size={18} className="auth-input-icon" aria-hidden="true" />
                                        <input
                                            id="auth-new-password"
                                            name="newPassword"
                                            type={showNewPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(event) => setNewPassword(event.target.value)}
                                            placeholder="At least 8 characters"
                                            autoComplete="new-password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="auth-password-toggle"
                                            onClick={() => setShowNewPassword((current) => !current)}
                                            aria-label={showNewPassword ? "Hide password" : "Show password"}
                                        >
                                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="auth-field">
                                    <label htmlFor="auth-confirm-password">Confirm password</label>
                                    <div className="auth-input-wrap">
                                        <LockKeyhole size={18} className="auth-input-icon" aria-hidden="true" />
                                        <input
                                            id="auth-confirm-password"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(event) => setConfirmPassword(event.target.value)}
                                            placeholder="Enter the password again"
                                            autoComplete="new-password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="auth-password-toggle"
                                            onClick={() => setShowConfirmPassword((current) => !current)}
                                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {message && (
                                    <div className={`auth-message auth-message-${messageType}`} role="alert">
                                        <span className="auth-message-mark">!</span>
                                        <span>{message}</span>
                                    </div>
                                )}

                                <button type="submit" className="auth-submit-button auth-submit-button-request">
                                    Request account access
                                    <ArrowRight size={18} />
                                </button>

                                <p className="auth-form-helper">
                                    <ShieldCheck size={16} />
                                    New accounts must be approved by a system administrator.
                                </p>
                            </form>
                        )}

                        <div className="auth-panel-footer">
                            <span className="auth-footer-rule" />
                            <span>{mode === "signin" ? "Need access to the system?" : "Already have an account?"}</span>
                            <button
                                type="button"
                                onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
                            >
                                {mode === "signin" ? "Sign up" : "Sign in"}
                            </button>
                        </div>
                    </div>

                    <p className="auth-copyright">© {new Date().getFullYear()} Inventory Sales Analytics</p>
                </section>
            </section>
        </main>
    );
}

export default Login;

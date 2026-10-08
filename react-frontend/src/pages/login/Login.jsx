import {
    BarChart3,
    Boxes,
    Eye,
    EyeOff,
    LockKeyhole,
    LogIn,
    PackageSearch,
    ScanBarcode,
    ShoppingCart,
    Sparkles,
    UserRound
} from "lucide-react";

import {
    useState
} from "react";

import {
    API_BASE_URL
} from "../../services/api";

import "./Login.css";


function Login() {
    const [username, setUsername] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [
        showPassword,
        setShowPassword
    ] = useState(false);

    const [message, setMessage] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    const handleLogin = async (
        event
    ) => {
        event.preventDefault();

        const cleanUsername =
            username.trim();

        if (
            !cleanUsername ||
            !password
        ) {
            setMessage(
                "Username and password are required."
            );

            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const response =
                await fetch(
                    `${API_BASE_URL}/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        credentials:
                            "include",

                        body: JSON.stringify({
                            username:
                                cleanUsername,
                            password
                        })
                    }
                );

            const data =
                await response.json();

            if (data.success) {
                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        data.user
                    )
                );

                window.location.href =
                    "/dashboard";

                return;
            }

            setMessage(
                data.message ||
                    "Invalid username or password."
            );
        } catch (error) {
            console.error(
                "Login error:",
                error
            );

            setMessage(
                "Unable to connect to the backend."
            );
        } finally {
            setLoading(false);
        }
    };


    return (
        <main className="login-page-modern">
            <div className="login-background">
                <div className="login-orb login-orb-one" />
                <div className="login-orb login-orb-two" />
                <div className="login-orb login-orb-three" />

                <div className="login-grid-pattern" />
            </div>

            <section className="login-shell">
                <div className="login-showcase">
                    <div className="login-brand">
                        <div className="login-brand-icon">
                            <Sparkles
                                size={25}
                                strokeWidth={2}
                            />
                        </div>

                        <div className="login-brand-text">
                            <h1>
                                ISA
                            </h1>

                            <p>
                                Inventory Sales
                                Analytics
                            </p>
                        </div>
                    </div>

                    <div className="login-showcase-content">
                        <span className="login-eyebrow">
                            Smart Inventory
                            Platform
                        </span>

                        <h2>
                            Smarter inventory.
                            <br />
                            Better sales.
                            <br />
                            Clearer decisions.
                        </h2>

                        <p className="login-showcase-description">
                            A centralized system
                            for product
                            registration, barcode
                            scanning, inventory
                            monitoring, point of
                            sale transactions,
                            and business
                            analytics.
                        </p>

                        <div className="login-feature-grid">
                            <div className="login-feature">
                                <span className="login-feature-icon">
                                    <ScanBarcode
                                        size={19}
                                        strokeWidth={
                                            1.9
                                        }
                                    />
                                </span>

                                <div>
                                    <strong>
                                        Barcode
                                        Scanning
                                    </strong>

                                    <span>
                                        Fast product
                                        registration
                                    </span>
                                </div>
                            </div>

                            <div className="login-feature">
                                <span className="login-feature-icon">
                                    <Boxes
                                        size={19}
                                        strokeWidth={
                                            1.9
                                        }
                                    />
                                </span>

                                <div>
                                    <strong>
                                        Inventory
                                        Tracking
                                    </strong>

                                    <span>
                                        Batch and
                                        stock
                                        monitoring
                                    </span>
                                </div>
                            </div>

                            <div className="login-feature">
                                <span className="login-feature-icon">
                                    <ShoppingCart
                                        size={19}
                                        strokeWidth={
                                            1.9
                                        }
                                    />
                                </span>

                                <div>
                                    <strong>
                                        Point of
                                        Sale
                                    </strong>

                                    <span>
                                        Streamlined
                                        sales
                                        processing
                                    </span>
                                </div>
                            </div>

                            <div className="login-feature">
                                <span className="login-feature-icon">
                                    <BarChart3
                                        size={19}
                                        strokeWidth={
                                            1.9
                                        }
                                    />
                                </span>

                                <div>
                                    <strong>
                                        Analytics
                                    </strong>

                                    <span>
                                        Real-time
                                        business
                                        insights
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="login-showcase-footer">
                        <div className="login-platform-indicator">
                            <span className="login-status-dot" />

                            System ready
                        </div>

                        <div className="login-showcase-footer-text">
                            Track · Manage ·
                            Analyze
                        </div>
                    </div>
                </div>


                <div className="login-form-side">
                    <section className="login-card">
                        <div className="login-card-decoration login-card-decoration-one" />
                        <div className="login-card-decoration login-card-decoration-two" />

                        <div className="login-card-content">
                            <div className="login-card-icon">
                                <PackageSearch
                                    size={24}
                                    strokeWidth={1.9}
                                />
                            </div>

                            <div className="login-card-header">
                                <span>
                                    Secure access
                                </span>

                                <h2>
                                    Welcome Back!
                                </h2>

                                <p>
                                    Sign in to
                                    continue.
                                </p>
                            </div>

                            <form
                                className="login-form"
                                onSubmit={
                                    handleLogin
                                }
                            >
                                <div className="login-field">
                                    <label htmlFor="username">
                                        Username
                                    </label>

                                    <div className="login-input-wrapper">
                                        <span className="login-input-icon">
                                            <UserRound
                                                size={
                                                    18
                                                }
                                                strokeWidth={
                                                    1.9
                                                }
                                            />
                                        </span>

                                        <input
                                            type="text"
                                            id="username"
                                            name="username"
                                            value={
                                                username
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setUsername(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="Enter your username"
                                            autoComplete="username"
                                            disabled={
                                                loading
                                            }
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="login-field">
                                    <label htmlFor="password">
                                        Password
                                    </label>

                                    <div className="login-input-wrapper">
                                        <span className="login-input-icon">
                                            <LockKeyhole
                                                size={
                                                    18
                                                }
                                                strokeWidth={
                                                    1.9
                                                }
                                            />
                                        </span>

                                        <input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            id="password"
                                            name="password"
                                            value={
                                                password
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setPassword(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                            disabled={
                                                loading
                                            }
                                        />

                                        <button
                                            type="button"
                                            className="login-password-toggle"
                                            onClick={() =>
                                                setShowPassword(
                                                    (
                                                        current
                                                    ) =>
                                                        !current
                                                )
                                            }
                                            aria-label={
                                                showPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                            disabled={
                                                loading
                                            }
                                        >
                                            {showPassword ? (
                                                <EyeOff
                                                    size={
                                                        18
                                                    }
                                                    strokeWidth={
                                                        1.9
                                                    }
                                                />
                                            ) : (
                                                <Eye
                                                    size={
                                                        18
                                                    }
                                                    strokeWidth={
                                                        1.9
                                                    }
                                                />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {message && (
                                    <div className="login-message">
                                        {
                                            message
                                        }
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="login-submit-button"
                                    disabled={
                                        loading
                                    }
                                >
                                    {loading ? (
                                        <>
                                            <span className="login-button-spinner" />

                                            Signing
                                            in...
                                        </>
                                    ) : (
                                        <>
                                            <LogIn
                                                size={
                                                    18
                                                }
                                                strokeWidth={
                                                    2
                                                }
                                            />

                                            Sign In

                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="login-security-note">
                                <LockKeyhole
                                    size={14}
                                    strokeWidth={1.8}
                                />

                                <span>
                                    Protected
                                    system access
                                </span>
                            </div>
                        </div>
                    </section>

                    <p className="login-copyright">
                        Inventory Sales Analytics
                        System
                    </p>
                </div>
            </section>
        </main>
    );
}

export default Login;

import { useState } from "react";
import {
    UserRound,
    LockKeyhole,
    Save,
    Eye,
    EyeOff,
    ShieldCheck,
    LoaderCircle
} from "lucide-react";

import { API_BASE_URL } from "../../services/api";
import "./Profile.css";

function Profile() {
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user")) || {};
        } catch {
            return {};
        }
    });

    const [formData, setFormData] = useState({
        full_name: user.full_name || "",
        username: user.username || "",
        current_password: "",
        new_password: "",
        confirm_password: ""
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const togglePassword = (field) => {
        setShowPasswords((previous) => ({
            ...previous,
            [field]: !previous[field]
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setMessage("");
        setMessageType("");

        if (!formData.full_name.trim() || !formData.username.trim()) {
            setMessage("Full name and username are required.");
            setMessageType("error");
            return;
        }

        if (
            formData.new_password &&
            formData.new_password.length < 8
        ) {
            setMessage("New password must be at least 8 characters.");
            setMessageType("error");
            return;
        }

        if (
            formData.new_password !== formData.confirm_password
        ) {
            setMessage("New password and confirmation do not match.");
            setMessageType("error");
            return;
        }

        if (
            formData.new_password &&
            !formData.current_password
        ) {
            setMessage("Enter your current password to change it.");
            setMessageType("error");
            return;
        }

        const payload = {
            full_name: formData.full_name.trim(),
            username: formData.username.trim(),
            current_password: formData.current_password,
            new_password: formData.new_password
        };

        try {
            setLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/profile/update`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify(payload)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to update profile."
                );
            }

            const updatedUser = {
                ...user,
                ...data.user
            };

            localStorage.setItem(
                "user",
                JSON.stringify(updatedUser)
            );

            setUser(updatedUser);

            setFormData((previous) => ({
                ...previous,
                full_name: updatedUser.full_name || "",
                username: updatedUser.username || "",
                current_password: "",
                new_password: "",
                confirm_password: ""
            }));

            setMessage("Your profile has been updated successfully.");
            setMessageType("success");
        } catch (error) {
            setMessage(error.message);
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    const getInitials = () => {
        const name = formData.full_name.trim();

        if (!name) {
            return "U";
        }

        return name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0].toUpperCase())
            .join("");
    };

    const passwordField = (
        label,
        name,
        field,
        placeholder
    ) => (
        <div className="profile-field">
            <label htmlFor={name}>{label}</label>

            <div className="profile-password-input">
                <input
                    id={name}
                    type={showPasswords[field] ? "text" : "password"}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    autoComplete="new-password"
                />

                <button
                    type="button"
                    onClick={() => togglePassword(field)}
                    aria-label={`Toggle ${label}`}
                >
                    {showPasswords[field] ? (
                        <EyeOff size={18} />
                    ) : (
                        <Eye size={18} />
                    )}
                </button>
            </div>
        </div>
    );

    return (
        <div className="profile-page">
            <div className="profile-page-header">
                <div>
                    <span className="profile-eyebrow">
                        ACCOUNT SETTINGS
                    </span>

                    <h1>My Profile</h1>


                </div>
            </div>

            <div className="profile-content">
                <section className="profile-summary-card">
                    <div className="profile-avatar">
                        {getInitials()}
                    </div>

                    <div className="profile-summary-info">
                        <h2>{user.full_name || "User"}</h2>
                        <p>@{user.username || "username"}</p>

                        <span className="profile-role">
                            <ShieldCheck size={14} />
                            {user.role || "User"}
                        </span>
                    </div>

                    <div className="profile-account-status">
                        <span className="profile-status-dot" />
                        {user.status || "Account"}
                    </div>
                </section>

                <form
                    className="profile-form"
                    onSubmit={handleSubmit}
                >
                    <section className="profile-section">
                        <div className="profile-section-heading">
                            <div className="profile-section-icon">
                                <UserRound size={20} />
                            </div>

                            <div>
                                <h2>Personal Information</h2>
                                <p>
                                    Update your name and username.
                                </p>
                            </div>
                        </div>

                        <div className="profile-fields-grid">
                            <div className="profile-field">
                                <label htmlFor="full_name">
                                    Full Name
                                </label>

                                <input
                                    id="full_name"
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    maxLength={100}
                                    required
                                />
                            </div>

                            <div className="profile-field">
                                <label htmlFor="username">
                                    Username
                                </label>

                                <input
                                    id="username"
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Enter your username"
                                    maxLength={50}
                                    required
                                />
                            </div>
                        </div>
                    </section>

                    <section className="profile-section">
                        <div className="profile-section-heading">
                            <div className="profile-section-icon">
                                <LockKeyhole size={20} />
                            </div>

                            <div>
                                <h2>Change Password</h2>
                            </div>
                        </div>

                        <div className="profile-password-fields">
                            {passwordField(
                                "Current Password",
                                "current_password",
                                "current",
                                "Enter current password"
                            )}

                            {passwordField(
                                "New Password",
                                "new_password",
                                "new",
                                "Enter new password"
                            )}

                            {passwordField(
                                "Confirm New Password",
                                "confirm_password",
                                "confirm",
                                "Confirm new password"
                            )}
                        </div>

                        <div className="profile-password-note">
                            Your current password is required to authorize
                            a password change. New passwords must have at
                            least 8 characters.
                        </div>
                    </section>

                    {message && (
                        <div
                            className={`profile-message ${messageType}`}
                            role="alert"
                        >
                            {message}
                        </div>
                    )}

                    <div className="profile-form-actions">
                        <button
                            type="submit"
                            className="profile-save-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <LoaderCircle
                                        size={18}
                                        className="profile-spinner"
                                    />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Profile;

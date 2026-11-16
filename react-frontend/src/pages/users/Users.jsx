
import { useCallback, useEffect, useState } from "react";
import {
    Search,
    Plus,
    Pencil,
    UserX,
    UserCheck,
    X,
    ShieldAlert,
    CheckCircle2,
    Users as UsersIcon,
    RefreshCw
} from "lucide-react";

import { API_BASE_URL } from "../../services/api.js";
import "./Users.css";

function Users() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [saving, setSaving] = useState(false);
    const [userToDeactivate, setUserToDeactivate] = useState(null);
    const [deactivatingUserId, setDeactivatingUserId] = useState(null);
    const [userToReactivate, setUserToReactivate] = useState(null);
    const [reactivatingUserId, setReactivatingUserId] = useState(null);

    const [form, setForm] = useState({
        username: "",
        full_name: "",
        password: "",
        role: "manager"
    });

    const fetchUsers = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/`, {
                credentials: "include"
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to load users.");
            }

            setUsers(data.users || []);
        } catch (err) {
            setError(err.message || "Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        Promise.resolve().then(() => fetchUsers());
    }, [fetchUsers]);

    const resetForm = () => {
        setForm({
            username: "",
            full_name: "",
            password: "",
            role: "manager"
        });

        setEditingUser(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (user) => {
        setEditingUser(user);

        setForm({
            username: user.username,
            full_name: user.full_name,
            password: "",
            role: user.role
        });

        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) return;

        setShowModal(false);
        resetForm();
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");

        try {
            const isEditing = Boolean(editingUser);

            const payload = {
                username: form.username.trim(),
                full_name: form.full_name.trim(),
                role: form.role
            };

            if (!isEditing) {
                payload.password = form.password;
            }

            const response = await fetch(
                isEditing
                    ? `${API_BASE_URL}/api/users/${editingUser.user_id}`
                    : `${API_BASE_URL}/api/users/`,
                {
                    method: isEditing ? "PUT" : "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to save user.");
            }

            setShowModal(false);
            resetForm();
            setMessage(data.message || "User saved successfully.");

            await fetchUsers();
        } catch (err) {
            setError(err.message || "Unable to save user.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeactivate = async () => {
        if (!userToDeactivate || deactivatingUserId) return;

        const user = userToDeactivate;
        setError("");
        setMessage("");
        setDeactivatingUserId(user.user_id);

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/users/${user.user_id}/deactivate`,
                {
                    method: "PUT",
                    credentials: "include"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to deactivate user.");
            }

            setMessage(data.message || "User deactivated successfully.");
            setUserToDeactivate(null);
            await fetchUsers();
        } catch (err) {
            setError(err.message || "Unable to deactivate user.");
        } finally {
            setDeactivatingUserId(null);
        }
    };

    const handleReactivate = async () => {
        if (!userToReactivate || reactivatingUserId) return;

        const user = userToReactivate;
        setError("");
        setMessage("");
        setReactivatingUserId(user.user_id);

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/users/${user.user_id}/reactivate`,
                {
                    method: "PUT",
                    credentials: "include"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to reactivate user.");
            }

            setMessage(data.message || "User reactivated successfully.");
            setUserToReactivate(null);
            await fetchUsers();
        } catch (err) {
            setError(err.message || "Unable to reactivate user.");
        } finally {
            setReactivatingUserId(null);
        }
    };

    const filteredUsers = users.filter((user) => {
        const keyword = search.toLowerCase();

        return (
            (user.full_name || "").toLowerCase().includes(keyword) ||
            (user.username || "").toLowerCase().includes(keyword) ||
            (user.role || "").toLowerCase().includes(keyword)
        );
    });

    const activeUsers = users.filter(
        (user) => user.status === "active"
    ).length;

    return (
        <div className="users-page">
            <div className="users-header">
                <div>
                    <span className="users-eyebrow">ADMINISTRATION</span>
                    <h1>User Management</h1>

                </div>

                <button
                    type="button"
                    className="users-primary-button"
                    onClick={openAddModal}
                >
                    <Plus size={18} />
                    Add User
                </button>
            </div>

            {error && <div className="users-alert error">{error}</div>}
            {message && (
                <div className="users-modal-backdrop users-success-backdrop">
                    <section
                        className="users-success-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="users-success-title"
                        aria-describedby="users-success-message"
                    >
                        <div className="users-success-icon">
                            <CheckCircle2 size={25} />
                        </div>
                        <h2 id="users-success-title">Success</h2>
                        <p id="users-success-message">{message}</p>
                        <button
                            type="button"
                            className="users-primary-button"
                            onClick={() => setMessage("")}
                            autoFocus
                        >
                            Done
                        </button>
                    </section>
                </div>
            )}

            <div className="users-stat-card">
                <div className="users-stat-icon">
                    <UsersIcon size={23} />
                </div>

                <div>
                    <span>Total Registered Users</span>
                    <strong>{users.length}</strong>
                    <small>{activeUsers} active accounts</small>
                </div>
            </div>

            <div className="users-table-card">
                <div className="users-table-header">
                    <div>
                        <h2>Registered Users</h2>
                        <p>View and manage system accounts.</p>
                    </div>

                    <button
                        type="button"
                        className="users-refresh-button"
                        onClick={fetchUsers}
                        disabled={loading}
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>

                <div className="users-toolbar">
                    <div className="users-search">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search name, username, or role..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </div>
                </div>

                <div className="users-table-wrapper">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Username</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Date Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="users-empty">
                                        Loading users...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="users-empty">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.user_id}>
                                        <td>
                                            <strong>{user.full_name}</strong>
                                        </td>
                                        <td>{user.username}</td>
                                        <td>
                                            <span className={`users-role ${user.role}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`users-status ${user.status}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td>
                                            {user.created_at
                                                ? new Date(user.created_at).toLocaleDateString()
                                                : "—"}
                                        </td>
                                        <td>
                                            <div className="users-actions">
                                                <button
                                                    type="button"
                                                    title="Edit user"
                                                    onClick={() => openEditModal(user)}
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                {user.status === "active" && (
                                                    <button
                                                        type="button"
                                                        className="deactivate"
                                                        title="Deactivate user"
                                                        onClick={() => setUserToDeactivate(user)}
                                                    >
                                                        <UserX size={16} />
                                                    </button>
                                                )}
                                                {user.status === "inactive" && (
                                                    <button
                                                        type="button"
                                                        className="reactivate"
                                                        title="Reactivate user"
                                                        onClick={() => setUserToReactivate(user)}
                                                    >
                                                        <UserCheck size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="users-modal-backdrop">
                    <section className="users-modal">
                        <div className="users-modal-header">
                            <div>
                                <h2>
                                    {editingUser ? "Edit User" : "Add New User"}
                                </h2>
                                <p>
                                    {editingUser
                                        ? "Update the user's account details."
                                        : "Create a new system account."}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={saving}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <label>
                                Full Name
                                <input
                                    type="text"
                                    name="full_name"
                                    value={form.full_name}
                                    onChange={handleChange}
                                    maxLength="100"
                                    required
                                />
                            </label>

                            <label>
                                Username
                                <input
                                    type="text"
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                    maxLength="50"
                                    required
                                />
                            </label>

                            {!editingUser && (
                                <label>
                                    Password
                                    <input
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        minLength="8"
                                        required
                                    />
                                </label>
                            )}

                            <label>
                                Role
                                <select
                                    name="role"
                                    value={form.role}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="admin">Admin</option>
                                    <option value="manager">Manager</option>
                                    <option value="cashier">Cashier</option>
                                </select>
                            </label>

                            <div className="users-modal-actions">
                                <button
                                    type="button"
                                    className="users-cancel-button"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="users-primary-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingUser
                                            ? "Save Changes"
                                            : "Create User"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}

            {userToDeactivate && (
                <div className="users-modal-backdrop">
                    <section
                        className="users-confirm-dialog"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="deactivate-user-title"
                        aria-describedby="deactivate-user-description"
                    >
                        <div className="users-confirm-icon">
                            <ShieldAlert size={23} />
                        </div>
                        <h2 id="deactivate-user-title">Deactivate this account?</h2>
                        <p id="deactivate-user-description">
                            <strong>{userToDeactivate.full_name}</strong> will no longer be able to sign in.
                            Their existing records and audit history will be kept.
                        </p>
                        {error && (
                            <p className="users-confirm-error" role="alert">
                                {error}
                            </p>
                        )}
                        <div className="users-confirm-actions">
                            <button
                                type="button"
                                className="users-cancel-button"
                                onClick={() => setUserToDeactivate(null)}
                                disabled={deactivatingUserId !== null}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="users-deactivate-confirm-button"
                                onClick={handleDeactivate}
                                disabled={deactivatingUserId !== null}
                            >
                                {deactivatingUserId !== null ? "Deactivating…" : "Deactivate account"}
                            </button>
                        </div>
                    </section>
                </div>
            )}

            {userToReactivate && (
                <div className="users-modal-backdrop">
                    <section
                        className="users-confirm-dialog users-reactivate-dialog"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="reactivate-user-title"
                        aria-describedby="reactivate-user-description"
                    >
                        <div className="users-reactivate-icon">
                            <UserCheck size={23} />
                        </div>
                        <h2 id="reactivate-user-title">Reactivate this account?</h2>
                        <p id="reactivate-user-description">
                            <strong>{userToReactivate.full_name}</strong> will be able to sign in again using their existing account.
                        </p>
                        {error && (
                            <p className="users-confirm-error" role="alert">
                                {error}
                            </p>
                        )}
                        <div className="users-confirm-actions">
                            <button
                                type="button"
                                className="users-cancel-button"
                                onClick={() => setUserToReactivate(null)}
                                disabled={reactivatingUserId !== null}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="users-reactivate-confirm-button"
                                onClick={handleReactivate}
                                disabled={reactivatingUserId !== null}
                            >
                                {reactivatingUserId !== null ? "Reactivating…" : "Reactivate account"}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}

export default Users;

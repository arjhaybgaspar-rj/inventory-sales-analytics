
import { useEffect, useState } from "react";
import {
    Search,
    Plus,
    Pencil,
    UserX,
    X,
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

    const [form, setForm] = useState({
        username: "",
        full_name: "",
        password: "",
        role: "manager"
    });

    const fetchUsers = async () => {
        setLoading(true);
        setError("");

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
    };

    useEffect(() => {
        fetchUsers();
    }, []);

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

    const handleDeactivate = async (user) => {
        const confirmed = window.confirm(
            `Are you sure you want to deactivate ${user.full_name}?`
        );

        if (!confirmed) return;

        setError("");
        setMessage("");

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
            await fetchUsers();
        } catch (err) {
            setError(err.message || "Unable to deactivate user.");
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
                    <p>Manage registered users and their access permissions.</p>
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
            {message && <div className="users-alert success">{message}</div>}

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
                                                        onClick={() => handleDeactivate(user)}
                                                    >
                                                        <UserX size={16} />
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
                                    <option value="owner">Owner</option>
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
        </div>
    );
}

export default Users;

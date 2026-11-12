
import { useEffect, useState } from "react";
import {
    Search,
    RefreshCw,
    ClipboardList,
    CalendarDays
} from "lucide-react";

import { API_BASE_URL } from "../../services/api.js";

import "./AuditLogs.css";

function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchLogs = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_BASE_URL}/api/audit-logs/`, {
                credentials: "include"
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to load audit logs.");
            }

            setLogs(data.logs || []);
        } catch (err) {
            setError(err.message || "Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter((log) => {
        const keyword = search.toLowerCase();

        return (
            String(log.username || "").toLowerCase().includes(keyword) ||
            String(log.full_name || "").toLowerCase().includes(keyword) ||
            String(log.action || "").toLowerCase().includes(keyword) ||
            String(log.description || "").toLowerCase().includes(keyword)
        );
    });

    const formatDate = (date) => {
    if (!date) return "—";

    const value = String(date).replace("T", " ").trim();

    const [datePart, timePart] = value.split(" ");

    if (!datePart || !timePart) return value;

    const [year, month, day] = datePart.split("-");
    const [hour, minute, second = "00"] = timePart.split(":");

    const dateObject = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second.split(".")[0])
    );

    if (Number.isNaN(dateObject.getTime())) return value;

    return dateObject.toLocaleString("en-PH", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    });
};

    return (
        <div className="audit-page">
            <div className="audit-header">
                <div>
                    <span className="audit-eyebrow">ADMINISTRATION</span>
                    <h1>Audit Logs</h1>
                </div>

                <button
                    type="button"
                    className="audit-refresh-button"
                    onClick={fetchLogs}
                    disabled={loading}
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="audit-alert">
                    {error}
                </div>
            )}

            <div className="audit-stat-card">
                <div className="audit-stat-icon">
                    <ClipboardList size={23} />
                </div>

                <div>
                    <span>Total Recorded Activities</span>
                    <strong>{logs.length}</strong>
                </div>
            </div>

            <div className="audit-table-card">
                <div className="audit-table-header">
                    <div>
                        <h2>Activity History</h2>
                        <p>Latest recorded activities appear first.</p>
                    </div>
                </div>

                <div className="audit-toolbar">
                    <div className="audit-search">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search user, action, or description..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </div>
                </div>

                <div className="audit-table-wrapper">
                    <table className="audit-table">
                        <thead>
                            <tr>
                                <th>Log ID</th>
                                <th>User</th>
                                <th>Role</th>
                                <th>Action</th>
                                <th>Description</th>
                                <th>Date & Time</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="audit-empty">
                                        Loading activity logs...
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="audit-empty">
                                        No activity logs found.
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.log_id}>
                                        <td>#{log.log_id}</td>

                                        <td>
                                            <strong>
                                                {log.full_name || log.username || "Unknown User"}
                                            </strong>
                                            <small>{log.username || "—"}</small>
                                        </td>

                                        <td>
                                            <span className={`audit-role ${String(log.role || "").toLowerCase()}`}>
                                                {log.role || "—"}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="audit-action">
                                                {log.action}
                                            </span>
                                        </td>

                                        <td className="audit-description">
                                            {log.description || "—"}
                                        </td>

                                        <td>
                                            <span className="audit-date">
                                                <CalendarDays size={14} />
                                                {formatDate(log.created_at)}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="audit-footer">
                    Showing {filteredLogs.length} of {logs.length} activities
                </div>
            </div>
        </div>
    );
}

export default AuditLogs;

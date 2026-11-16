

import { useCallback, useEffect, useState } from "react";
import {
    Search,
    ClipboardList,
    CalendarDays,
    ChevronLeft,
    ChevronRight
} from "lucide-react";

import { API_BASE_URL } from "../../services/api.js";

import "./AuditLogs.css";

function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const fetchLogs = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        Promise.resolve().then(() => fetchLogs());
    }, [fetchLogs]);

    const filteredLogs = logs.filter((log) => {
        const keyword = search.toLowerCase();

        return (
            String(log.username || "").toLowerCase().includes(keyword) ||
            String(log.full_name || "").toLowerCase().includes(keyword) ||
            String(log.action || "").toLowerCase().includes(keyword) ||
            String(log.description || "").toLowerCase().includes(keyword)
        );
    });

    const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
    const visibleLogs = filteredLogs.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );
    const firstVisibleLog = filteredLogs.length
        ? (currentPage - 1) * pageSize + 1
        : 0;
    const lastVisibleLog = Math.min(currentPage * pageSize, filteredLogs.length);

    const formatDate = (date) => {
        if (!date) return "—";

        const rawValue = String(date).trim();
        const mysqlHttpDate = rawValue.match(
            /^(?:[A-Za-z]{3},\s*)?(\d{1,2}) ([A-Za-z]{3}) (\d{4}) (\d{2}):(\d{2}):\d{2} GMT$/i
        );

        // Flask serializes naive MySQL datetimes as RFC dates. The audit API
        // reads these values in Asia/Manila, so preserve their displayed clock.
        if (mysqlHttpDate) {
            const [, day, month, year, hour, minute] = mysqlHttpDate;
            const hour24 = Number(hour);
            const hour12 = hour24 % 12 || 12;
            const meridiem = hour24 >= 12 ? "PM" : "AM";
            return `${day} ${month} ${year}, ${hour12}:${minute} ${meridiem}`;
        }

        const value = rawValue.replace(" ", "T");
        const hasTimezone = /(?:Z|UTC|[+-]\d{2}:?\d{2})$/i.test(rawValue);
        const dateObject = new Date(
            hasTimezone ? rawValue : `${value}+08:00`
        );

        if (Number.isNaN(dateObject.getTime())) return String(date);

        return new Intl.DateTimeFormat("en-PH", {
            timeZone: "Asia/Manila",
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        }).format(dateObject);
    };

    return (
        <div className="audit-page">
            <div className="audit-header">
                <div>
                    <span className="audit-eyebrow">ADMINISTRATION</span>
                    <h1>Audit Logs</h1>
                </div>
            </div>

            {error && (
                <div className="audit-alert">
                    {error}
                </div>
            )}

            <div className="audit-stat-card">
                <div className="audit-stat-summary">
                    <div className="audit-stat-icon">
                        <ClipboardList size={23} />
                    </div>

                    <div className="audit-stat-total">
                        <span>Total Recorded Activities</span>
                        <strong>{logs.length}</strong>
                    </div>
                </div>
            </div>

            <div className="audit-table-card">
                <div className="audit-table-header">
                    <div>
                        <h2>Activity History</h2>
                        <p>Latest recorded activities appear first.</p>
                    </div>
                    <div className="audit-search">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search user, action, or description..."
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setCurrentPage(1);
                            }}
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
                                visibleLogs.map((log) => (
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
                    <span>
                        Showing {firstVisibleLog}–{lastVisibleLog} of {filteredLogs.length} activities
                    </span>
                    <div className="audit-pagination" aria-label="Activity history pages">
                        <button
                            type="button"
                            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                            disabled={currentPage <= 1 || loading}
                            aria-label="Previous page"
                        >
                            <ChevronLeft size={16} />
                            Previous
                        </button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button
                            type="button"
                            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                            disabled={currentPage >= totalPages || loading}
                            aria-label="Next page"
                        >
                            Next
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuditLogs;

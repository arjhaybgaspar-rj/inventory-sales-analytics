import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    PackageCheck,
    Search,
    X
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { API_URL } from "../../services/api";

import "./fefo.css";

function parseExpiryDate(value) {
    if (!value) return null;

    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) return null;
        const date = new Date(value);
        date.setHours(0, 0, 0, 0);
        return date;
    }

    const rawDate = String(value).trim();
    const isoDate = rawDate.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    const parsedDate = isoDate
        ? new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]))
        : new Date(rawDate);

    if (Number.isNaN(parsedDate.getTime())) return null;
    parsedDate.setHours(0, 0, 0, 0);
    return parsedDate;
}

function getDaysUntilExpiry(value) {
    const expiryDate = parseExpiryDate(value);
    if (!expiryDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Math.round((expiryDate.getTime() - today.getTime()) / 86400000);
}

function formatDate(value) {
    const date = parseExpiryDate(value);
    if (!date) return "No expiry date";

    return new Intl.DateTimeFormat("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric"
    }).format(date);
}

function formatNumber(value) {
    return new Intl.NumberFormat("en-PH").format(Number(value) || 0);
}

function StockMonitoring() {
    const [inventory, setInventory] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadInventory = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/inventory`, {
                credentials: "include"
            });
            const data = await response.json().catch(() => ({}));

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Unable to load inventory batches.");
            }

            setInventory(Array.isArray(data.inventory) ? data.inventory : []);
        } catch (loadError) {
            console.error("FEFO recommendations error:", loadError);
            setError(loadError.message || "Unable to connect to the backend.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        Promise.resolve().then(() => loadInventory());
    }, [loadInventory]);

    const recommendations = useMemo(() => {
        const eligibleBatches = inventory
            .filter((item) => {
                const quantity = Number(item.quantity) || 0;
                const batchStatus = String(item.batch_status || "").toLowerCase();
                const daysUntilExpiry = getDaysUntilExpiry(item.expiry_date);

                return (
                    quantity > 0 &&
                    batchStatus !== "disposed" &&
                    batchStatus !== "expired" &&
                    (daysUntilExpiry === null || daysUntilExpiry >= 0)
                );
            })
            .sort((first, second) => {
                const firstExpiry = parseExpiryDate(first.expiry_date)?.getTime() ?? Infinity;
                const secondExpiry = parseExpiryDate(second.expiry_date)?.getTime() ?? Infinity;
                if (firstExpiry !== secondExpiry) {
                    return firstExpiry === Infinity
                        ? 1
                        : secondExpiry === Infinity
                            ? -1
                            : firstExpiry - secondExpiry;
                }

                const firstReceived = parseExpiryDate(first.received_date)?.getTime() ?? Infinity;
                const secondReceived = parseExpiryDate(second.received_date)?.getTime() ?? Infinity;
                if (firstReceived !== secondReceived) {
                    return firstReceived === Infinity
                        ? 1
                        : secondReceived === Infinity
                            ? -1
                            : firstReceived - secondReceived;
                }

                return String(first.product_name || "").localeCompare(
                    String(second.product_name || "")
                );
            });

        const earliestBatchByProduct = new Map();
        eligibleBatches.forEach((item) => {
            const productKey = item.product_id ?? item.product_name;
            if (!earliestBatchByProduct.has(productKey)) {
                earliestBatchByProduct.set(productKey, item);
            }
        });

        return Array.from(earliestBatchByProduct.values());
    }, [inventory]);

    const filteredRecommendations = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();
        if (!search) return recommendations;

        return recommendations.filter((item) =>
            [
                item.product_name,
                item.barcode,
                item.brand,
                item.batch_number
            ].some((value) => String(value || "").toLowerCase().includes(search))
        );
    }, [recommendations, searchTerm]);

    return (
        <main className="fefo-page">
            <header className="fefo-page-header">
                <div>
                    <h1>Stock Monitoring</h1>
                </div>
            </header>

            {error && (
                <div className="fefo-error" role="alert">
                    <span>{error}</span>
                    <button type="button" onClick={() => setError("")} aria-label="Dismiss error">
                        <X size={17} />
                    </button>
                </div>
            )}

            <section className="fefo-panel">
                <div className="fefo-panel-heading">
                    <div>
                        <h2>All stocked products</h2>
                        <p>First Expiry First Out (FEFO)</p>
                    </div>
                    <div className="fefo-count" aria-live="polite">
                        <PackageCheck size={19} />
                        <strong>{loading ? "—" : formatNumber(recommendations.length)}</strong>
                        <span>products</span>
                    </div>
                </div>

                <div className="fefo-toolbar">
                    <span>
                        <Clock3 size={16} />
                        {loading
                            ? "Loading batch recommendations…"
                            : `Showing ${formatNumber(filteredRecommendations.length)} of ${formatNumber(recommendations.length)} products`}
                    </span>
                    <label className="fefo-search">
                        <Search size={17} />
                        <input
                            type="search"
                            aria-label="Search products by name or barcode"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search product name or barcode"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm("")}
                                aria-label="Clear search"
                            >
                                <X size={15} />
                            </button>
                        )}
                    </label>
                </div>

                {loading ? (
                    <div className="fefo-state">
                        <span className="fefo-spinner" />
                        Loading stock recommendations…
                    </div>
                ) : filteredRecommendations.length === 0 ? (
                    <div className="fefo-empty">
                        <CheckCircle2 size={27} />
                        <strong>
                            {recommendations.length === 0
                                ? "No stocked batches to recommend"
                                : "No matching products"}
                        </strong>
                        <span>
                            {recommendations.length === 0
                                ? "Products appear here while a non-expired batch has remaining stock."
                                : "Try another product name, barcode, brand, or batch number."}
                        </span>
                    </div>
                ) : (
                    <div className="fefo-table-wrap">
                        <table className="fefo-table">
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Product</th>
                                    <th>Batch to use first</th>
                                    <th>Remaining stock</th>
                                    <th>Expiry date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecommendations.map((item) => {
                                    const daysUntilExpiry = getDaysUntilExpiry(item.expiry_date);
                                    const originalIndex = recommendations.indexOf(item);

                                    return (
                                        <tr key={`${item.product_id}-${item.batch_id}`}>
                                            <td>
                                                <span className="fefo-order-badge">
                                                    {formatNumber(originalIndex + 1)}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="fefo-product-cell">
                                                    <strong>{item.product_name || "Unnamed product"}</strong>
                                                    <span>{item.barcode || item.brand || ""}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="fefo-batch-number">
                                                    {item.batch_number || "Batch not labeled"}
                                                </span>
                                            </td>
                                            <td>
                                                <strong className="fefo-quantity">
                                                    {formatNumber(item.quantity)} {item.unit || "units"}
                                                </strong>
                                            </td>
                                            <td>
                                                <div className="fefo-expiry-cell">
                                                    <strong>{formatDate(item.expiry_date)}</strong>
                                                    <span>
                                                        {daysUntilExpiry === null
                                                            ? "Date not recorded"
                                                            : daysUntilExpiry === 0
                                                                ? "Expires today"
                                                                : `In ${formatNumber(daysUntilExpiry)} days`}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <p className="fefo-note">
                <CalendarDays size={15} /> Expired, disposed, and depleted batches are excluded.
            </p>
        </main>
    );
}

export default StockMonitoring;

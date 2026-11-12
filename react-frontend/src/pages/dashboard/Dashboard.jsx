import {
    Activity,
    AlertTriangle,
    ArrowRight,
    Boxes,
    CalendarDays,
    CheckCircle2,
    CircleDollarSign,
    Clock3,
    Leaf,
    Package,
    RefreshCw,
    ShoppingBag,
    ShoppingCart,
    Sparkles,
    TrendingUp,
    Wallet
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import { API_URL } from "../../services/api";
import ReceiptModal from "../../components/receipts/ReceiptModal.jsx";
import Reports from "../reports/Reports.jsx";

import "./Dashboard.css";

const MANAGER_ROLES = ["admin", "manager"];

function readStoredUser() {
    try {
        const stored = localStorage.getItem("user");
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        console.error("Unable to read stored user:", error);
        localStorage.removeItem("user");
        return null;
    }
}

async function fetchJson(path) {
    const response = await fetch(`${API_URL}${path}`, {
        credentials: "include"
    });

    const data = await response.json().catch(() => ({}));

    return {
        ok: response.ok && data.success === true,
        status: response.status,
        data
    };
}

function formatCurrency(value) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number(value) || 0);
}

function formatNumber(value) {
    return new Intl.NumberFormat("en-PH").format(Number(value) || 0);
}

function formatDate(value, includeTime = false) {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat(
        "en-PH",
        includeTime
            ? {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit"
            }
            : {
                month: "short",
                day: "numeric",
                year: "numeric"
            }
    ).format(date);
}

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}

function getInventoryStatus(item) {
    const quantity = Number(item.quantity) || 0;
    const reorderLevel = Number(item.reorder_level) || 0;

    if (quantity <= 0) return "out";

    if (item.expiry_date) {
        const expiry = new Date(
            `${String(item.expiry_date).slice(0, 10)}T00:00:00`
        );
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!Number.isNaN(expiry.getTime())) {
            if (expiry < today) return "expired";

            const soon = new Date(today);
            soon.setDate(soon.getDate() + 30);
            if (expiry <= soon) return "expiring";
        }
    }

    if (quantity <= reorderLevel) return "low";
    return "healthy";
}

const STATUS_LABELS = {
    healthy: "Available",
    low: "Low stock",
    out: "Out of stock",
    expiring: "Expiring soon",
    expired: "Expired"
};

const STATUS_DESCRIPTIONS = {
    healthy: "Above the reorder level",
    low: "At or below the reorder level",
    expiring: "Expires within 30 days",
    out: "No usable units in stock",
    expired: "Past its expiry date"
};

const STATUS_STYLES = {
    healthy: {
        color: "#21845f",
        backgroundColor: "#e8f5ed"
    },
    low: {
        color: "#b77900",
        backgroundColor: "#fff3d4"
    },
    expiring: {
        color: "#087e8b",
        backgroundColor: "#e2f4f6"
    },
    out: {
        color: "#c62828",
        backgroundColor: "#fdeaea"
    },
    expired: {
        color: "#465362",
        backgroundColor: "#edf1f4"
    }
};

function Dashboard() {
    const [user] = useState(readStoredUser);
    const [summary, setSummary] = useState(null);
    const [inventory, setInventory] = useState([]);
    const [recentSales, setRecentSales] = useState([]);
    const [stockoutRisks, setStockoutRisks] = useState([]);
    const [stockoutHistoryGaps, setStockoutHistoryGaps] = useState([]);
    const [revenueTrend, setRevenueTrend] = useState(null);
    const [cashierProducts, setCashierProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [selectedReceiptId, setSelectedReceiptId] = useState(null);

    const role = String(user?.role || "").toLowerCase();
    const canManage = MANAGER_ROLES.includes(role);
    const displayName = user?.full_name || user?.username || "there";
    const firstName = displayName.trim().split(/\s+/)[0] || "there";
    const roleLabel = role
        ? role.charAt(0).toUpperCase() + role.slice(1)
        : "User";

    const loadDashboard = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            if (canManage) {
                const [
                    summaryResult,
                    inventoryResult,
                    salesResult,
                    riskResult
                ] = await Promise.all([
                    fetchJson("/reports/summary"),
                    fetchJson("/inventory"),
                    fetchJson("/reports/recent-sales"),
                    fetchJson("/reports/inventory-risk")
                ]);

                if (summaryResult.ok) {
                    setSummary(summaryResult.data.summary || null);
                }

                if (inventoryResult.ok) {
                    setInventory(
                        Array.isArray(inventoryResult.data.inventory)
                            ? inventoryResult.data.inventory
                            : []
                    );
                }

                if (salesResult.ok) {
                    setRecentSales(
                        Array.isArray(salesResult.data.sales)
                            ? salesResult.data.sales
                            : []
                    );
                }

                if (riskResult.ok) {
                    setStockoutRisks(
                        Array.isArray(riskResult.data.stockout_risks)
                            ? riskResult.data.stockout_risks
                            : []
                    );
                    setStockoutHistoryGaps(
                        Array.isArray(riskResult.data.insufficient_demand_history)
                            ? riskResult.data.insufficient_demand_history
                            : []
                    );
                    setRevenueTrend(riskResult.data.revenue_trend || null);
                } else {
                    setStockoutRisks([]);
                    setStockoutHistoryGaps([]);
                    setRevenueTrend(null);
                }

                if (
                    !summaryResult.ok ||
                    !inventoryResult.ok ||
                    !salesResult.ok ||
                    !riskResult.ok
                ) {
                    setMessage(
                        "Some dashboard information could not be loaded. Use Refresh to try again."
                    );
                }
            } else {
                // Cashiers must not call manager-only report or inventory endpoints.
                const [salesResult, productsResult] = await Promise.all([
                    fetchJson("/sales"),
                    fetchJson("/products")
                ]);

                if (salesResult.ok) {
                    setRecentSales(
                        Array.isArray(salesResult.data.sales)
                            ? salesResult.data.sales
                            : []
                    );
                }

                if (productsResult.ok) {
                    setCashierProducts(
                        Array.isArray(productsResult.data.products)
                            ? productsResult.data.products
                            : []
                    );
                }

                if (!salesResult.ok || !productsResult.ok) {
                    setMessage(
                        "Some dashboard information could not be loaded. Use Refresh to try again."
                    );
                }
            }
        } catch (error) {
            console.error("Dashboard loading error:", error);
            setMessage(
                "Unable to connect to the backend. Check that the backend server is running."
            );
        } finally {
            setLoading(false);
        }
    }, [canManage, user]);

    useEffect(() => {
        if (!user) {
            window.location.assign("/");
            return;
        }

        Promise.resolve().then(() => {
            void loadDashboard();
        });
    }, [loadDashboard, user]);

    const stockCounts = useMemo(() => {
        const counts = {
            healthy: 0,
            low: 0,
            out: 0,
            expiring: 0,
            expired: 0
        };

        inventory.forEach((item) => {
            counts[getInventoryStatus(item)] += 1;
        });

        return counts;
    }, [inventory]);

    const cashierSalesTotal = useMemo(
        () =>
            recentSales.reduce(
                (total, sale) =>
                    total + (Number(sale.total_amount) || 0),
                0
            ),
        [recentSales]
    );

    const cashierAverageSale = recentSales.length
        ? cashierSalesTotal / recentSales.length
        : 0;

    const managerKpis = [
        {
            label: "Total sales",
            value: formatCurrency(summary?.total_sales),
            note: "Recorded sales value",
            icon: CircleDollarSign,
            tone: "green"
        },
        {
            label: "Transactions",
            value: formatNumber(summary?.total_transactions),
            note: "Completed transactions",
            icon: ShoppingCart,
            tone: "orange"
        },
        {
            label: "Items sold",
            value: formatNumber(summary?.total_items_sold),
            note: "Units sold in recorded sales",
            icon: ShoppingBag,
            tone: "sage"
        },
        {
            label: "Stock units",
            value: formatNumber(summary?.total_stock),
            note: "Units across inventory batches",
            icon: Boxes,
            tone: "olive"
        }
    ];

    const cashierKpis = [
        {
            label: "Sales in history",
            value: formatCurrency(cashierSalesTotal),
            note: "Total of returned sales records",
            icon: CircleDollarSign,
            tone: "green"
        },
        {
            label: "Transactions",
            value: formatNumber(recentSales.length),
            note: "Sales records available",
            icon: ShoppingCart,
            tone: "orange"
        },
        {
            label: "Product catalog",
            value: formatNumber(cashierProducts.length),
            note: "Products available to browse",
            icon: Package,
            tone: "sage"
        },
        {
            label: "Average sale",
            value: formatCurrency(cashierAverageSale),
            note: "Average of returned sales records",
            icon: Wallet,
            tone: "olive"
        }
    ];

    const kpis = canManage ? managerKpis : cashierKpis;

    const quickActions = canManage
        ? [
            {
                label: "Manage products",
                description: "Review the product catalog",
                icon: Package,
                path: "/products",
                tone: "sage"
            },
            {
                label: "Manage inventory",
                description: "Stock-in and monitor alerts",
                icon: Boxes,
                path: "/inventory",
                tone: "green"
            },
            {
                label: "Open point of sale",
                description: "Create a sales transaction",
                icon: ShoppingCart,
                path: "/sales",
                tone: "orange"
            },
            {
                label: "View reports",
                description: "Review sales analytics",
                icon: TrendingUp,
                path: "/reports",
                tone: "olive"
            }
        ]
        : [
            {
                label: "Open point of sale",
                description: "Create a sales transaction",
                icon: ShoppingCart,
                path: "/sales",
                tone: "orange"
            }
        ];

    const goTo = (path) => window.location.assign(path);

    if (!user) return null;

    return (
        <main className="botanical-dashboard">
            <header className="botanical-dashboard-header">
                <div className="botanical-dashboard-heading">
                    <span className="botanical-eyebrow">
                        <Leaf size={15} strokeWidth={2} />
                        Inventory &amp; Sales Workspace
                    </span>
                    <h1>{getGreeting()}</h1>
                </div>

                <div className="botanical-dashboard-header-actions">
                    <div className="botanical-date-chip">
                        <CalendarDays size={17} />
                        <span>{formatDate(new Date())}</span>
                    </div>
                    <button
                        type="button"
                        className="botanical-button botanical-button-secondary"
                        onClick={loadDashboard}
                        disabled={loading}
                    >
                        <RefreshCw
                            size={16}
                            className={loading ? "botanical-spin" : ""}
                        />
                        {loading ? "Refreshing" : "Refresh"}
                    </button>
                </div>
            </header>

            <section className="botanical-welcome-banner">
                <div className="botanical-welcome-copy">
                    <span className="botanical-welcome-label">
                        Your daily overview
                    </span>
                    <h2>Everything in its place.</h2>

                    <div className="botanical-welcome-meta">
                        <span className="botanical-role-chip">
                            {roleLabel} account
                        </span>
                        <span>
                            <Clock3 size={14} /> Updated when you refresh
                        </span>
                    </div>
                </div>

                <div className="botanical-welcome-art" aria-hidden="true">
                    <div className="botanical-art-circle botanical-art-circle-one" />
                    <div className="botanical-art-circle botanical-art-circle-two" />
                    <div className="botanical-art-leaf botanical-art-leaf-one">
                        <Leaf size={65} strokeWidth={1.15} />
                    </div>
                    <div className="botanical-art-leaf botanical-art-leaf-two">
                        <Leaf size={43} strokeWidth={1.15} />
                    </div>
                    <div className="botanical-art-card">
                        <Activity size={23} />
                        <span>Business overview</span>
                        <strong>{canManage ? "In focus" : "Ready to sell"}</strong>
                    </div>
                </div>
            </section>

            {message && (
                <div className="botanical-dashboard-message" role="status">
                    <AlertTriangle size={18} />
                    <span>{message}</span>
                    <button
                        type="button"
                        onClick={() => setMessage("")}
                        aria-label="Dismiss message"
                    >
                        ×
                    </button>
                </div>
            )}

            <section
                className={`botanical-kpi-grid ${canManage ? "botanical-kpi-grid-manager" : ""
                    }`}
                aria-label="Business metrics"
            >
                {kpis.map((item) => {
                    const Icon = item.icon;

                    return (
                        <article
                            className="botanical-kpi-card"
                            key={item.label}
                        >
                            <div
                                className={`botanical-kpi-icon tone-${item.tone}`}
                            >
                                <Icon size={22} strokeWidth={1.85} />
                            </div>
                            <div className="botanical-kpi-copy">
                                <span>{item.label}</span>
                                <strong>{loading ? "—" : item.value}</strong>
                            </div>
                        </article>
                    );
                })}
            </section>

            {canManage && (
                <section className="botanical-manager-overview">
                    <article className="botanical-panel botanical-stock-health-panel">
                        <div className="botanical-panel-heading">
                            <div>
                                <span className="botanical-panel-eyebrow">
                                    Stock monitoring
                                </span>
                                <h2>Inventory health</h2>

                            </div>
                            <span className="botanical-panel-heading-icon">
                                <Boxes size={20} />
                            </span>
                        </div>

                        {loading ? (
                            <div className="botanical-panel-loading">
                                Loading stock status…
                            </div>
                        ) : inventory.length === 0 ? (
                            <div className="botanical-panel-empty">
                                <Package size={27} />
                                <strong>No inventory batches yet</strong>
                                <span>Stock-in records will appear here.</span>
                            </div>
                        ) : (
                            <>
                                <div className="botanical-stock-total">
                                    <div>
                                        <span>Recorded batches</span>
                                        <strong>
                                            {formatNumber(inventory.length)}
                                        </strong>
                                    </div>
                                    <div className="botanical-stock-total-mark">
                                        <CheckCircle2 size={19} />
                                    </div>
                                </div>

                                <div
                                    className="botanical-stock-bar"
                                    aria-label="Inventory health distribution"
                                >
                                    {Object.keys(STATUS_LABELS).map((key) => (
                                        <span
                                            key={key}
                                            title={`${STATUS_LABELS[key]}: ${stockCounts[key]}`}
                                            style={{
                                                width: `${(stockCounts[key] /
                                                    inventory.length) *
                                                    100
                                                    }%`,
                                                backgroundColor:
                                                    STATUS_STYLES[key].color
                                            }}
                                        />
                                    ))}
                                </div>

                                <div className="botanical-stock-legend">
                                    {Object.keys(STATUS_LABELS).map((key) => (
                                        <div
                                            className="botanical-stock-legend-item"
                                            key={key}
                                        >
                                            <span
                                                className="botanical-legend-dot"
                                                style={{
                                                    backgroundColor:
                                                        STATUS_STYLES[key].color
                                                }}
                                                aria-hidden="true"
                                            />

                                            <span
                                                style={{
                                                    display: "flex",
                                                    flex: 1,
                                                    flexDirection: "column",
                                                    gap: "2px",
                                                    whiteSpace: "normal"
                                                }}
                                            >
                                                <span>{STATUS_LABELS[key]}</span>
                                                <small
                                                    style={{
                                                        color: "#63786d",
                                                        fontSize: "10px",
                                                        fontWeight: 400,
                                                        lineHeight: 1.35
                                                    }}
                                                >
                                                    {STATUS_DESCRIPTIONS[key]}
                                                </small>
                                            </span>

                                            <strong>{stockCounts[key]}</strong>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    className="botanical-text-link"
                                    onClick={() => goTo("/inventory")}
                                >
                                    Review inventory <ArrowRight size={15} />
                                </button>
                            </>
                        )}
                    </article>

                    <article className="botanical-dashboard-analytics">
                        {canManage ? <Reports dashboardEmbedded /> : (
                            <div className="botanical-panel-empty">
                                Sales analytics are available to managers.
                            </div>
                        )}
                    </article>

                    <article className="botanical-panel botanical-business-snapshot">
                        <div className="botanical-panel-heading">
                            <div>
                                <h2>Products that may run out</h2>
                            </div>
                            <span className="botanical-panel-heading-icon botanical-heading-icon-orange">
                                <AlertTriangle size={20} />
                            </span>
                        </div>

                        {loading ? (
                            <div className="botanical-panel-loading botanical-stockout-loading">
                                Checking sales and stock…
                            </div>
                        ) : stockoutRisks.length === 0 &&
                            stockoutHistoryGaps.length === 0 ? (
                            <div className="botanical-panel-empty botanical-stockout-empty">
                                <CheckCircle2 size={25} />
                                <strong>No current run-out warnings</strong>
                            </div>
                        ) : (
                            <div className="botanical-snapshot-list">
                                {stockoutRisks.slice(0, 3).map((item) => (
                                    <div
                                        className="botanical-snapshot-row"
                                        key={item.product_id}
                                    >
                                        <div>
                                            <strong>{item.product_name}</strong>
                                            <span>
                                                May run out in about {item.estimated_days_until_stockout} days · {item.available_stock} available
                                            </span>
                                        </div>
                                        <b>
                                            {item.risk_level === "high" ? "High risk" : "Watch"}
                                        </b>
                                    </div>
                                ))}
                                {stockoutHistoryGaps.slice(0, 3).map((item) => (
                                    <div
                                        className="botanical-snapshot-row"
                                        key={`history-${item.product_id}`}
                                    >
                                        <div>
                                            <strong>{item.product_name}</strong>
                                            <span>
                                                Sales recorded on {item.sales_days_last_30_days} of 7 days so far
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {stockoutHistoryGaps.length > 3 && (
                                    <div className="botanical-stockout-history-summary">
                                        <span>
                                            +{stockoutHistoryGaps.length - 3} products need more sales history
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            type="button"
                            className="botanical-text-link botanical-stockout-link"
                            onClick={() => goTo("/reports")}
                        >
                            See all stock alerts <ArrowRight size={15} />
                        </button>
                    </article>
                </section>
            )}

            <section className="botanical-quick-actions-section">
                <div className="botanical-section-title-row">
                    <div>
                        <span className="botanical-panel-eyebrow">Shortcuts</span>
                        <h2>Quick actions</h2>
                    </div>
                    <span className="botanical-section-note">
                        Jump straight into your workflow
                    </span>
                </div>

                <div
                    className={`botanical-quick-actions ${canManage ? "" : "botanical-quick-actions-cashier"
                        }`}
                >
                    {quickActions.map((action) => {
                        const Icon = action.icon;

                        return (
                            <button
                                type="button"
                                className="botanical-quick-action"
                                key={action.path}
                                onClick={() => goTo(action.path)}
                            >
                                <span
                                    className={`botanical-quick-action-icon tone-${action.tone}`}
                                >
                                    <Icon size={21} />
                                </span>
                                <span className="botanical-quick-action-copy">
                                    <strong>{action.label}</strong>
                                </span>
                                <ArrowRight
                                    size={17}
                                    className="botanical-quick-action-arrow"
                                />
                            </button>
                        );
                    })}
                </div>
            </section>

            <section className="botanical-panel botanical-recent-sales-panel">
                <div className="botanical-panel-heading botanical-panel-heading-with-action">
                    <div>
                        <span className="botanical-panel-eyebrow">
                            Latest activity
                        </span>
                        <h2>Recent sales</h2>
                    </div>
                    <button
                        type="button"
                        className="botanical-outline-button"
                        onClick={() => goTo("/sales")}
                    >
                        Open POS <ArrowRight size={15} />
                    </button>
                </div>

                {loading ? (
                    <div className="botanical-panel-loading">
                        Loading recent sales…
                    </div>
                ) : recentSales.length === 0 ? (
                    <div className="botanical-panel-empty">
                        <ShoppingCart size={28} />
                        <strong>No sales recorded yet</strong>
                        <span>
                            Completed transactions will appear in this table.
                        </span>
                    </div>
                ) : (
                    <div className="botanical-table-wrap">
                        <table className="botanical-table">
                            <thead>
                                <tr>
                                    <th>Transaction</th>
                                    <th>Cashier</th>
                                    <th>Payment method</th>
                                    <th>Date</th>
                                    <th className="botanical-table-number">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentSales.slice(0, 6).map((sale, index) => (
                                    <tr
                                        key={
                                            sale.sale_id ??
                                            `${sale.sale_date}-${index}`
                                        }
                                    >
                                        <td>
                                            <div className="botanical-transaction-cell">
                                                <span>
                                                    <button
                                                        type="button"
                                                        className="botanical-receipt-link"
                                                        onClick={() =>
                                                            setSelectedReceiptId(
                                                                sale.sale_id
                                                            )
                                                        }
                                                        aria-label={`View receipt for sale ${sale.sale_id}`}
                                                    >
                                                        Sale #{sale.sale_id ?? "—"}
                                                    </button>
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            {sale.full_name ||
                                                sale.username ||
                                                "Staff"}
                                        </td>
                                        <td>
                                            <span className="botanical-payment-chip">
                                                {String(
                                                    sale.payment_method || "—"
                                                ).replace(/_/g, " ")}
                                            </span>
                                        </td>
                                        <td>
                                            {formatDate(sale.sale_date, true)}
                                        </td>
                                        <td className="botanical-table-number botanical-sale-total">
                                            {formatCurrency(sale.total_amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {canManage && (
                <section className="botanical-panel botanical-recent-inventory-panel">
                    <div className="botanical-panel-heading botanical-panel-heading-with-action">
                        <div>
                            <span className="botanical-panel-eyebrow">
                                Stock overview
                            </span>
                            <h2>Recent inventory batches</h2>
                        </div>
                        <button
                            type="button"
                            className="botanical-outline-button"
                            onClick={() => goTo("/inventory")}
                        >
                            View inventory <ArrowRight size={15} />
                        </button>
                    </div>

                    {loading ? (
                        <div className="botanical-panel-loading">
                            Loading inventory…
                        </div>
                    ) : inventory.length === 0 ? (
                        <div className="botanical-panel-empty">
                            <Boxes size={28} />
                            <strong>No inventory batches found</strong>
                            <span>
                                Add received stock from the Inventory page.
                            </span>
                        </div>
                    ) : (
                        <div className="botanical-table-wrap">
                            <table className="botanical-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Batch</th>
                                        <th>Quantity</th>
                                        <th>Expiry date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventory.slice(0, 5).map((item) => {
                                        const status = getInventoryStatus(item);

                                        return (
                                            <tr key={item.inventory_id}>
                                                <td>
                                                    <div className="botanical-product-cell">
                                                        <span>
                                                            <strong>
                                                                {item.product_name ||
                                                                    "Unnamed product"}
                                                            </strong>
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    {item.batch_number || "—"}
                                                </td>
                                                <td>
                                                    <strong>
                                                        {formatNumber(
                                                            item.quantity
                                                        )}
                                                    </strong>
                                                </td>
                                                <td>
                                                    {formatDate(item.expiry_date)}
                                                </td>
                                                <td>
                                                    <span
                                                        className={`botanical-status-chip status-${status}`}
                                                        style={
                                                            STATUS_STYLES[status]
                                                        }
                                                    >
                                                        {STATUS_LABELS[status]}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}

            <ReceiptModal
                saleId={selectedReceiptId}
                onClose={() => setSelectedReceiptId(null)}
            />

            <footer className="botanical-dashboard-footer">
                <span>
                    <Leaf size={14} /> Inventory Sales Management
                </span>
                <span>Keep every item and transaction in view.</span>
            </footer>
        </main>
    );
}

export default Dashboard;



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
import DashboardAnalytics from "./DashboardAnalytics.jsx";

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

function parseExpiryDate(value) {
    if (!value) return null;

    const raw = String(value).trim();
    const isoDate = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const expiryDate = isoDate
        ? new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]))
        : new Date(raw);

    if (Number.isNaN(expiryDate.getTime())) return null;
    expiryDate.setHours(0, 0, 0, 0);
    return expiryDate;
}

function getDaysUntilExpiry(value) {
    const expiryDate = parseExpiryDate(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!expiryDate) return null;
    return Math.round((expiryDate.getTime() - today.getTime()) / 86400000);
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
        const expiry = parseExpiryDate(item.expiry_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (expiry) {
            if (expiry < today) return "expired";

            const soon = new Date(today);
            soon.setDate(
                soon.getDate() + (Number(item.near_expiry_days) || 30)
            );
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
    const [grossProfitSummary, setGrossProfitSummary] = useState(null);
    const [revenueForecast, setRevenueForecast] = useState(null);
    const [inventory, setInventory] = useState([]);
    const [recentSales, setRecentSales] = useState([]);
    const [stockoutRisks, setStockoutRisks] = useState([]);
    const [stockoutHistoryGaps, setStockoutHistoryGaps] = useState([]);
    const [cashierProducts, setCashierProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [selectedReceiptId, setSelectedReceiptId] = useState(null);

    const role = String(user?.role || "").toLowerCase();
    const canManage = MANAGER_ROLES.includes(role);
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
                    riskResult,
                    grossProfitResult,
                    revenueForecastResult
                ] = await Promise.all([
                    fetchJson("/reports/summary"),
                    fetchJson("/inventory"),
                    fetchJson("/reports/recent-sales"),
                    fetchJson("/reports/inventory-risk"),
                    fetchJson("/reports/gross-profit"),
                    fetchJson("/reports/monthly-sales-forecast")
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
                } else {
                    setStockoutRisks([]);
                    setStockoutHistoryGaps([]);
                }

                setGrossProfitSummary(
                    grossProfitResult.ok ? grossProfitResult.data : null
                );
                setRevenueForecast(
                    revenueForecastResult.ok ? revenueForecastResult.data : null
                );

                if (
                    !summaryResult.ok ||
                    !inventoryResult.ok ||
                    !salesResult.ok ||
                    !riskResult.ok ||
                    !grossProfitResult.ok ||
                    !revenueForecastResult.ok
                ) {
                    setMessage(
                        "Some dashboard information could not be loaded. Use Refresh to try again."
                    );
                }
            } else {
                setGrossProfitSummary(null);
                setRevenueForecast(null);
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
            setGrossProfitSummary(null);
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

    const currentInventory = useMemo(
        () => inventory.filter((item) => {
            const batchStatus = String(item.batch_status || "").toLowerCase();
            const quantity = Number(item.quantity) || 0;

            // Older disposal handlers may leave the batch status as "expired"
            // even after the entire batch has been removed from inventory.
            // A zero-quantity expired batch is no longer active stock.
            return batchStatus !== "disposed" && !(batchStatus === "expired" && quantity <= 0);
        }),
        [inventory]
    );

    const stockCounts = useMemo(() => {
        const counts = {
            healthy: 0,
            low: 0,
            out: 0,
            expiring: 0,
            expired: 0
        };

        currentInventory.forEach((item) => {
            counts[getInventoryStatus(item)] += 1;
        });

        return counts;
    }, [currentInventory]);

    const stockDonutGradient = useMemo(() => {
        if (currentInventory.length === 0) {
            return "conic-gradient(#edf2ef 0deg 360deg)";
        }

        let angle = 0;
        const segments = Object.keys(STATUS_LABELS).map((key) => {
            const start = angle;
            angle += (stockCounts[key] / currentInventory.length) * 360;
            return `${STATUS_STYLES[key].color} ${start}deg ${angle}deg`;
        });

        return `conic-gradient(${segments.join(", ")})`;
    }, [currentInventory.length, stockCounts]);

    const fefoRecommendations = useMemo(() => {
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
                const firstExpiry = first.expiry_date
                    ? String(first.expiry_date).slice(0, 10)
                    : "9999-12-31";
                const secondExpiry = second.expiry_date
                    ? String(second.expiry_date).slice(0, 10)
                    : "9999-12-31";
                const expiryOrder = firstExpiry.localeCompare(secondExpiry);
                if (expiryOrder !== 0) return expiryOrder;

                const receivedOrder = String(first.received_date || "9999-12-31")
                    .slice(0, 10)
                    .localeCompare(String(second.received_date || "9999-12-31").slice(0, 10));
                if (receivedOrder !== 0) return receivedOrder;

                return String(first.batch_number || "").localeCompare(
                    String(second.batch_number || "")
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

    const dashboardFefoRecommendations = useMemo(
        () =>
            [...fefoRecommendations]
                .sort((first, second) => {
                    const stockOrder =
                        (Number(first.quantity) || 0) -
                        (Number(second.quantity) || 0);
                    if (stockOrder !== 0) return stockOrder;

                    const firstExpiry = first.expiry_date
                        ? String(first.expiry_date).slice(0, 10)
                        : "9999-12-31";
                    const secondExpiry = second.expiry_date
                        ? String(second.expiry_date).slice(0, 10)
                        : "9999-12-31";
                    return firstExpiry.localeCompare(secondExpiry);
                })
                .slice(0, 5),
        [fefoRecommendations]
    );

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
                <section className="botanical-sales-performance-panel" aria-label="Sales performance">
                    <div className="botanical-sales-performance-heading">
                        <span className="botanical-panel-eyebrow">Business overview</span>
                        <h2>Sales performance</h2>
                    </div>

                    <div className="botanical-sales-performance-grid">
                        <section className="botanical-sales-performance-group">
                            <div className="botanical-sales-performance-group-heading">
                                <span className="botanical-profitability-icon"><ShoppingBag size={18} /></span>
                                <h3>Completed sales</h3>
                            </div>
                            <div className="botanical-profitability-metrics">
                                <article>
                                    <span className="botanical-profitability-icon"><CircleDollarSign size={18} /></span>
                                    <div>
                                        <span>Total sales</span>
                                        <strong>{loading ? "—" : formatCurrency(grossProfitSummary?.sales_revenue)}</strong>
                                    </div>
                                </article>
                                <article>
                                    <span className="botanical-profitability-icon"><Boxes size={18} /></span>
                                    <div>
                                        <span>Total cost of goods sold</span>
                                        <strong>{loading ? "—" : formatCurrency(grossProfitSummary?.known_cost_of_goods_sold)}</strong>
                                    </div>
                                </article>
                                <article className="botanical-profitability-profit">
                                    <span className="botanical-profitability-icon"><TrendingUp size={18} /></span>
                                    <div>
                                        <span>Profit</span>
                                        <strong>{loading ? "—" : formatCurrency(grossProfitSummary?.gross_profit_on_costed_sales)}</strong>
                                    </div>
                                </article>
                            </div>

                            {(loading || !grossProfitSummary || Number(grossProfitSummary.revenue_with_unknown_cost) > 0) && (
                                <p className="botanical-profitability-note">
                                    {loading
                                        ? "Calculating from recorded batch costs…"
                                        : grossProfitSummary
                                            ? `${formatCurrency(grossProfitSummary.revenue_with_unknown_cost)} in sales still has no recoverable batch cost and is excluded from profit.`
                                            : "Profitability data is unavailable. Check that the backend and cost history are up to date."}
                                </p>
                            )}
                        </section>

                        <section className="botanical-sales-performance-group botanical-sales-forecast-group">
                            <div className="botanical-sales-performance-group-heading">
                                <span className="botanical-profitability-icon"><TrendingUp size={18} /></span>
                                <h3>Revenue forecast · next 30 days</h3>
                            </div>
                            {revenueForecast?.forecast_available ? (
                                <>
                                    <div className="botanical-sales-forecast-metrics">
                                        <article>
                                            <span>Projected revenue</span>
                                            <strong>{formatCurrency(revenueForecast.projected_30_day_revenue)}</strong>
                                        </article>
                                        <article>
                                            <span>Average past error (MAE)</span>
                                            <strong>{formatCurrency(revenueForecast.backtest?.mean_absolute_error)}</strong>
                                        </article>
                                    </div>
                                    <p className="botanical-sales-forecast-note">
                                        Uses weekday averages from the last 90 complete days. Forecasts are estimates; actual revenue may differ.
                                    </p>
                                </>
                            ) : (
                                <div className="botanical-sales-forecast-empty">
                                    {loading ? "Calculating forecast…" : "Need more sales history to forecast revenue."}
                                </div>
                            )}
                        </section>
                    </div>
                </section>
            )}

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
                        ) : currentInventory.length === 0 ? (
                            <div className="botanical-panel-empty">
                                <Package size={27} />
                                <strong>No inventory batches yet</strong>
                                <span>Stock-in records will appear here.</span>
                            </div>
                        ) : (
                            <>
                                <div className="botanical-stock-health-content">
                                    <div
                                        className="botanical-stock-donut"
                                        role="img"
                                        aria-label={`Inventory health: ${formatNumber(currentInventory.length)} batches`}
                                        style={{ background: stockDonutGradient }}
                                    >
                                        <div className="botanical-stock-donut-center">
                                            <strong>{formatNumber(currentInventory.length)}</strong>
                                            <span>batches</span>
                                        </div>
                                    </div>

                                    <div className="botanical-stock-legend">
                                        {Object.keys(STATUS_LABELS).map((key) => (
                                            <div
                                                className="botanical-stock-legend-item"
                                                key={key}
                                            >
                                                <span
                                                    className="botanical-legend-dot"
                                                    style={{ backgroundColor: STATUS_STYLES[key].color }}
                                                    aria-hidden="true"
                                                />
                                                <span>{STATUS_LABELS[key]}</span>
                                                <strong>{stockCounts[key]}</strong>
                                            </div>
                                        ))}
                                    </div>
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

                    <article className="botanical-panel botanical-fefo-panel">
                        <div className="botanical-panel-heading">
                            <div>
                                <span className="botanical-panel-eyebrow">
                                    Stock rotation
                                </span>
                                <h2>FEFO recommendations</h2>
                            </div>
                            <span className="botanical-panel-heading-icon">
                                <Clock3 size={20} />
                            </span>
                        </div>

                        {loading ? (
                            <div className="botanical-panel-loading">
                                Checking eligible batches…
                            </div>
                        ) : fefoRecommendations.length === 0 ? (
                            <div className="botanical-panel-empty botanical-fefo-empty">
                                <CheckCircle2 size={25} />
                                <strong>No eligible batches to recommend</strong>
                                <span>Available stock with an unexpired date will appear here.</span>
                            </div>
                        ) : (
                            <div className="botanical-fefo-list">
                                {dashboardFefoRecommendations.map((item, index) => {
                                    const daysUntilExpiry = getDaysUntilExpiry(item.expiry_date);

                                    return (
                                        <div
                                            className="botanical-fefo-row"
                                            key={`${item.product_id}-${item.batch_id}`}
                                        >
                                            <span className="botanical-fefo-rank">
                                                {index + 1}
                                            </span>
                                            <div className="botanical-fefo-product">
                                                <strong>{item.product_name}</strong>
                                                <span>
                                                    Batch {item.batch_number || "—"} · {formatNumber(item.quantity)} {item.unit || "units"}
                                                </span>
                                            </div>
                                            <div className="botanical-fefo-expiry">
                                                <strong>
                                                    {item.expiry_date
                                                        ? formatDate(item.expiry_date)
                                                        : "No expiry date"}
                                                </strong>
                                                <span>
                                                    {daysUntilExpiry === null
                                                        ? "Date not recorded"
                                                        : daysUntilExpiry === 0
                                                            ? "Expires today"
                                                            : `In ${daysUntilExpiry} days`}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <button
                            type="button"
                            className="botanical-text-link"
                            onClick={() => goTo("/fefo-recommendations")}
                        >
                            View all recommendations <ArrowRight size={15} />
                        </button>
                    </article>

                </section>
            )}

            {canManage && (
                <DashboardAnalytics
                    stockoutRisks={stockoutRisks}
                    stockoutHistoryGaps={stockoutHistoryGaps}
                    stockoutLoading={loading}
                    onViewStockAlerts={() => goTo("/reports")}
                />
            )}

            <section className="botanical-panel botanical-recent-sales-panel">
                <div className="botanical-panel-heading botanical-panel-heading-with-action">
                    <div>
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
                    ) : currentInventory.length === 0 ? (
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
                                    {currentInventory.slice(0, 5).map((item) => {
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

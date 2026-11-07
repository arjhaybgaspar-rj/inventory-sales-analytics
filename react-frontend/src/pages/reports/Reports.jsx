import { useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    Banknote,
    BarChart3,
    Boxes,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    CircleDollarSign,
    Clock3,
    CreditCard,
    Package,
    ReceiptText,
    RefreshCw,
    ShoppingBag,
    Smartphone,
    TrendingUp,
    Trophy,
    WalletCards,
    X
} from "lucide-react";

import { API_URL } from "../../services/api";
import "./Reports.css";

function Reports() {
    const [summary, setSummary] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [recentSales, setRecentSales] = useState([]);

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const [selectedSale, setSelectedSale] = useState(null);
    const [saleItems, setSaleItems] = useState([]);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState("");

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            minimumFractionDigits: 2
        }).format(Number(value || 0));
    };

    const formatDateTime = (value) => {
        if (!value) return "N/A";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return new Intl.DateTimeFormat("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }).format(date);
    };

    const loadReports = async () => {
        setLoading(true);
        setMessage("");

        try {
            const endpoints = [
                `${API_URL}/reports/summary`,
                `${API_URL}/reports/top-products`,
                `${API_URL}/reports/payment-methods`,
                `${API_URL}/reports/recent-sales`
            ];

            const responses = await Promise.all(
                endpoints.map((url) =>
                    fetch(url, {
                        credentials: "include"
                    })
                )
            );

            const results = await Promise.all(
                responses.map(async (response) => {
                    if (!response.ok) {
                        throw new Error("Unable to load report information.");
                    }

                    return response.json();
                })
            );

            const [
                summaryData,
                productsData,
                paymentsData,
                salesData
            ] = results;

            if (!summaryData.success) {
                throw new Error(summaryData.message || "Unable to load summary.");
            }

            if (!productsData.success) {
                throw new Error(productsData.message || "Unable to load products.");
            }

            if (!paymentsData.success) {
                throw new Error(paymentsData.message || "Unable to load payments.");
            }

            if (!salesData.success) {
                throw new Error(salesData.message || "Unable to load recent sales.");
            }

            setSummary(summaryData.summary || {});
            setTopProducts(
                Array.isArray(productsData.products)
                    ? productsData.products
                    : []
            );
            setPaymentMethods(
                Array.isArray(paymentsData.payment_methods)
                    ? paymentsData.payment_methods
                    : []
            );
            setRecentSales(
                Array.isArray(salesData.sales)
                    ? salesData.sales
                    : []
            );
        } catch (error) {
            console.error("Reports loading error:", error);
            setMessage(error.message || "Unable to connect to the backend.");
        } finally {
            setLoading(false);
        }
    };

    const loadSaleDetails = async (saleId) => {
        setSelectedSale({ sale_id: saleId });
        setSaleItems([]);
        setDetailsError("");
        setDetailsLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/reports/sales/${saleId}`,
                {
                    credentials: "include"
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to load transaction details."
                );
            }

            setSelectedSale(data.sale);
            setSaleItems(
                Array.isArray(data.items) ? data.items : []
            );
        } catch (error) {
            console.error("Transaction details error:", error);
            setDetailsError(
                error.message || "Unable to load transaction details."
            );
        } finally {
            setDetailsLoading(false);
        }
    };

    const closeSaleDetails = () => {
        if (detailsLoading) return;

        setSelectedSale(null);
        setSaleItems([]);
        setDetailsError("");
    };

    useEffect(() => {
        loadReports();
    }, []);

    useEffect(() => {
        if (!selectedSale) return;

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                closeSaleDetails();
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [selectedSale, detailsLoading]);

    const averageSale = useMemo(() => {
        const transactions = Number(summary?.total_transactions || 0);
        const sales = Number(summary?.total_sales || 0);

        return transactions > 0 ? sales / transactions : 0;
    }, [summary]);

    const averageItems = useMemo(() => {
        const transactions = Number(summary?.total_transactions || 0);
        const items = Number(summary?.total_items_sold || 0);

        return transactions > 0 ? items / transactions : 0;
    }, [summary]);

    const paymentTotal = useMemo(() => {
        return paymentMethods.reduce(
            (total, method) =>
                total + Number(method.total_sales || 0),
            0
        );
    }, [paymentMethods]);

    const maxQuantity = useMemo(() => {
        if (topProducts.length === 0) return 0;

        return Math.max(
            ...topProducts.map((product) =>
                Number(product.total_quantity_sold || 0)
            )
        );
    }, [topProducts]);

    const paymentColor = (method) => {
        const value = String(method || "").toLowerCase();

        if (value === "cash") return "#416d4e";
        if (value === "gcash") return "#8da98d";
        if (value === "card") return "#d47b56";

        return "#b8ad91";
    };

    const paymentIcon = (method) => {
        const value = String(method || "").toLowerCase();

        if (value === "cash") return Banknote;
        if (value === "gcash") return Smartphone;

        return CreditCard;
    };

    const paymentPercentage = (amount) => {
        if (paymentTotal <= 0) return 0;

        return Math.round(
            (Number(amount || 0) / paymentTotal) * 100
        );
    };

    const summaryCards = [
        {
            title: "Total Sales",
            value: formatCurrency(summary?.total_sales),
            description: "Recorded sales revenue",
            icon: CircleDollarSign,
            color: "green"
        },
        {
            title: "Transactions",
            value: summary?.total_transactions ?? 0,
            description: "Completed transactions",
            icon: WalletCards,
            color: "sage"
        },
        {
            title: "Items Sold",
            value: summary?.total_items_sold ?? 0,
            description: "Total units sold",
            icon: ShoppingBag,
            color: "terracotta"
        },
        {
            title: "Active Products",
            value: summary?.total_products ?? 0,
            description: "Products in catalog",
            icon: Package,
            color: "olive"
        }
    ];

    const receiptTotal = Number(
        selectedSale?.total_amount || 0
    );

    return (
        <main className="premium-reports-page">

            <header className="reports-header">
                <div>
                    <span className="reports-eyebrow">
                        <SparklesIcon />
                        BUSINESS OVERVIEW
                    </span>

                    <h1>Reports & Analytics</h1>

                    <p>
                        Monitor your sales performance and inventory activity.
                    </p>
                </div>

                <button
                    className="reports-refresh-button"
                    onClick={loadReports}
                    disabled={loading}
                >
                    <RefreshCw
                        size={17}
                        className={loading ? "reports-spin" : ""}
                    />
                    Refresh Reports
                </button>
            </header>

            {message && (
                <div className="reports-alert">
                    <AlertTriangle size={19} />
                    <span>{message}</span>

                    <button onClick={loadReports}>
                        Try Again
                    </button>
                </div>
            )}

            <section className="reports-summary-grid">
                {summaryCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <article
                            className="reports-summary-card"
                            key={card.title}
                        >
                            <div className="reports-summary-top">
                                <div className={`reports-summary-icon ${card.color}`}>
                                    <Icon size={22} />
                                </div>

                                <span className="reports-summary-label">
                                    {card.title}
                                </span>
                            </div>

                            <strong className="reports-summary-value">
                                {loading ? "..." : card.value}
                            </strong>

                            <span className="reports-summary-description">
                                {card.description}
                            </span>
                        </article>
                    );
                })}
            </section>

            <section className="reports-insights-grid">

                <article className="reports-panel reports-performance-panel">
                    <div className="reports-panel-heading">
                        <div>
                            <span className="reports-section-label">
                                PERFORMANCE
                            </span>

                            <h2>Sales Overview</h2>
                        </div>

                        <div className="reports-heading-icon">
                            <TrendingUp size={20} />
                        </div>
                    </div>

                    <div className="reports-performance-content">
                        <div className="reports-performance-item">
                            <div className="reports-performance-icon">
                                <CircleDollarSign size={19} />
                            </div>

                            <div>
                                <span>Average Transaction Value</span>
                                <strong>
                                    {loading ? "..." : formatCurrency(averageSale)}
                                </strong>
                            </div>
                        </div>

                        <div className="reports-performance-item">
                            <div className="reports-performance-icon">
                                <Boxes size={19} />
                            </div>

                            <div>
                                <span>Average Items per Transaction</span>
                                <strong>
                                    {loading ? "..." : averageItems.toFixed(2)}
                                </strong>
                            </div>
                        </div>

                        <div className="reports-performance-item">
                            <div className="reports-performance-icon">
                                <CheckCircle2 size={19} />
                            </div>

                            <div>
                                <span>Inventory Stock</span>
                                <strong>
                                    {loading
                                        ? "..."
                                        : Number(summary?.total_stock || 0).toLocaleString("en-PH")}
                                </strong>
                            </div>
                        </div>
                    </div>
                </article>

                <article className="reports-panel reports-inventory-panel">
                    <div className="reports-panel-heading">
                        <div>
                            <span className="reports-section-label">
                                INVENTORY STATUS
                            </span>

                            <h2>Stock Monitoring</h2>
                        </div>

                        <div className="reports-heading-icon warning">
                            <AlertTriangle size={20} />
                        </div>
                    </div>

                    <div className="reports-stock-grid">
                        <div className="reports-stock-item">
                            <span className="reports-stock-dot low"></span>

                            <div>
                                <span>Low Stock Items</span>
                                <strong>
                                    {loading ? "..." : summary?.low_stock_items ?? 0}
                                </strong>
                            </div>
                        </div>

                        <div className="reports-stock-item">
                            <span className="reports-stock-dot expiry"></span>

                            <div>
                                <span>Expiring Within 30 Days</span>
                                <strong>
                                    {loading ? "..." : summary?.expiring_items ?? 0}
                                </strong>
                            </div>
                        </div>
                    </div>

                    <p className="reports-inventory-note">
                        Keep track of inventory levels and products approaching
                        their expiration dates.
                    </p>
                </article>

            </section>

            <section className="reports-content-grid">

                <article className="reports-panel reports-products-panel">
                    <div className="reports-panel-heading">
                        <div>
                            <span className="reports-section-label">
                                PRODUCT PERFORMANCE
                            </span>

                            <h2>Top Selling Products</h2>
                        </div>

                        <div className="reports-heading-icon">
                            <Trophy size={20} />
                        </div>
                    </div>

                    {loading ? (
                        <div className="reports-empty-state">
                            Loading products...
                        </div>
                    ) : topProducts.length === 0 ? (
                        <div className="reports-empty-state">
                            <Package size={30} />
                            <strong>No sales data available</strong>
                            <span>Product rankings will appear here.</span>
                        </div>
                    ) : (
                        <div className="reports-ranking-list">
                            {topProducts.map((product, index) => {
                                const quantity = Number(
                                    product.total_quantity_sold || 0
                                );

                                const percentage = maxQuantity > 0
                                    ? (quantity / maxQuantity) * 100
                                    : 0;

                                return (
                                    <div
                                        className="reports-ranking-row"
                                        key={product.product_id}
                                    >
                                        <div className="reports-ranking-number">
                                            {index + 1}
                                        </div>

                                        <div className="reports-ranking-details">
                                            <div className="reports-ranking-name">
                                                <strong>
                                                    {product.product_name}
                                                </strong>

                                                <span>
                                                    {product.barcode || "No barcode"}
                                                </span>
                                            </div>

                                            <div className="reports-progress-track">
                                                <div
                                                    className="reports-progress-fill"
                                                    style={{
                                                        width: `${percentage}%`
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="reports-ranking-values">
                                            <strong>{quantity}</strong>
                                            <span>units sold</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </article>

                <article className="reports-panel reports-payment-panel">
                    <div className="reports-panel-heading">
                        <div>
                            <span className="reports-section-label">
                                PAYMENT BREAKDOWN
                            </span>

                            <h2>Payment Methods</h2>
                        </div>

                        <div className="reports-heading-icon">
                            <CreditCard size={20} />
                        </div>
                    </div>

                    {loading ? (
                        <div className="reports-empty-state">
                            Loading payment data...
                        </div>
                    ) : paymentMethods.length === 0 ? (
                        <div className="reports-empty-state">
                            <WalletCards size={30} />
                            <strong>No payment data available</strong>
                            <span>Payment breakdown will appear here.</span>
                        </div>
                    ) : (
                        <>
                            <div className="reports-payment-total">
                                <span>Total Payments</span>
                                <strong>{formatCurrency(paymentTotal)}</strong>
                            </div>

                            <div className="reports-payment-list">
                                {paymentMethods.map((method) => {
                                    const Icon = paymentIcon(
                                        method.payment_method
                                    );

                                    return (
                                        <div
                                            className="reports-payment-row"
                                            key={method.payment_method}
                                        >
                                            <div
                                                className="reports-payment-icon"
                                                style={{
                                                    backgroundColor: `${paymentColor(method.payment_method)}20`,
                                                    color: paymentColor(method.payment_method)
                                                }}
                                            >
                                                <Icon size={19} />
                                            </div>

                                            <div className="reports-payment-info">
                                                <strong>
                                                    {method.payment_method}
                                                </strong>

                                                <span>
                                                    {method.transaction_count} transactions
                                                </span>
                                            </div>

                                            <div className="reports-payment-values">
                                                <strong>
                                                    {formatCurrency(method.total_sales)}
                                                </strong>

                                                <span>
                                                    {paymentPercentage(method.total_sales)}%
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </article>

            </section>

            <section className="reports-panel reports-recent-panel">
                <div className="reports-panel-heading">
                    <div>
                        <span className="reports-section-label">
                            TRANSACTION HISTORY
                        </span>

                        <h2>Recent Sales</h2>

                        <p className="reports-panel-subtitle">
                            Select a transaction to view its complete receipt.
                        </p>
                    </div>

                    <div className="reports-heading-icon">
                        <ReceiptText size={20} />
                    </div>
                </div>

                {loading ? (
                    <div className="reports-empty-state">
                        Loading recent sales...
                    </div>
                ) : recentSales.length === 0 ? (
                    <div className="reports-empty-state">
                        <ShoppingBag size={30} />
                        <strong>No transactions found</strong>
                        <span>Completed sales will appear here.</span>
                    </div>
                ) : (
                    <div className="reports-table-wrapper">
                        <table className="reports-table">
                            <thead>
                                <tr>
                                    <th>Transaction</th>
                                    <th>Cashier</th>
                                    <th>Date & Time</th>
                                    <th>Payment Method</th>
                                    <th>Total Amount</th>
                                    <th></th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentSales.map((sale) => (
                                    <tr
                                        key={sale.sale_id}
                                        className="reports-sale-row"
                                        onClick={() => loadSaleDetails(sale.sale_id)}
                                        onKeyDown={(event) => {
                                            if (
                                                event.key === "Enter" ||
                                                event.key === " "
                                            ) {
                                                event.preventDefault();
                                                loadSaleDetails(sale.sale_id);
                                            }
                                        }}
                                        tabIndex={0}
                                        role="button"
                                        aria-label={`View receipt for sale ${sale.sale_id}`}
                                    >
                                        <td>
                                            <span className="reports-transaction-id">
                                                #{sale.sale_id}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="reports-cashier-name">
                                                {sale.full_name || "Unknown"}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="reports-date-value">
                                                <CalendarDays size={14} />
                                                {formatDateTime(sale.sale_date)}
                                            </span>
                                        </td>

                                        <td>
                                            <span className={`reports-payment-badge ${String(sale.payment_method || "").toLowerCase()}`}>
                                                {sale.payment_method || "N/A"}
                                            </span>
                                        </td>

                                        <td>
                                            <strong className="reports-sale-amount">
                                                {formatCurrency(sale.total_amount)}
                                            </strong>
                                        </td>

                                        <td>
                                            <span className="reports-view-receipt">
                                                View Receipt
                                                <ChevronRight size={16} />
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {selectedSale && (
                <div
                    className="reports-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeSaleDetails();
                        }
                    }}
                >
                    <section
                        className="reports-receipt-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="receipt-title"
                    >
                        <header className="reports-receipt-header">
                            <div className="reports-receipt-heading">
                                <div className="reports-receipt-icon">
                                    <ReceiptText size={23} />
                                </div>

                                <div>
                                    <span className="reports-section-label">
                                        TRANSACTION RECEIPT
                                    </span>

                                    <h2 id="receipt-title">
                                        Sale #{selectedSale.sale_id}
                                    </h2>
                                </div>
                            </div>

                            <button
                                className="reports-modal-close"
                                onClick={closeSaleDetails}
                                disabled={detailsLoading}
                                aria-label="Close receipt"
                            >
                                <X size={21} />
                            </button>
                        </header>

                        {detailsLoading ? (
                            <div className="reports-receipt-loading">
                                <RefreshCw size={28} className="reports-spin" />
                                <strong>Loading receipt...</strong>
                                <span>Please wait while we retrieve the items.</span>
                            </div>
                        ) : detailsError ? (
                            <div className="reports-receipt-error">
                                <AlertTriangle size={30} />
                                <strong>Unable to load receipt</strong>
                                <span>{detailsError}</span>

                                <button
                                    onClick={() =>
                                        loadSaleDetails(selectedSale.sale_id)
                                    }
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="reports-receipt-meta">
                                    <div>
                                        <span>Cashier</span>
                                        <strong>
                                            {selectedSale.full_name || "Unknown"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Date & Time</span>
                                        <strong>
                                            {formatDateTime(selectedSale.sale_date)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Payment Method</span>
                                        <strong className="reports-receipt-payment">
                                            {selectedSale.payment_method || "N/A"}
                                        </strong>
                                    </div>
                                </div>

                                <div className="reports-receipt-items-heading">
                                    <div>
                                        <span className="reports-section-label">
                                            PURCHASE DETAILS
                                        </span>

                                        <h3>Items Purchased</h3>
                                    </div>

                                    <span className="reports-item-count">
                                        {saleItems.length} item types
                                    </span>
                                </div>

                                {saleItems.length === 0 ? (
                                    <div className="reports-receipt-no-items">
                                        No product details found for this transaction.
                                    </div>
                                ) : (
                                    <div className="reports-receipt-table-wrapper">
                                        <table className="reports-receipt-table">
                                            <thead>
                                                <tr>
                                                    <th>Product</th>
                                                    <th>Qty</th>
                                                    <th>Unit Price</th>
                                                    <th>Subtotal</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {saleItems.map((item, index) => (
                                                    <tr
                                                        key={
                                                            item.sale_item_id ||
                                                            `${item.product_id}-${index}`
                                                        }
                                                    >
                                                        <td>
                                                            <div className="reports-receipt-product">
                                                                <strong>
                                                                    {item.product_name || "Unknown Product"}
                                                                </strong>

                                                                {item.barcode && (
                                                                    <span>
                                                                        {item.barcode}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>

                                                        <td>
                                                            {Number(item.quantity || 0)}
                                                        </td>

                                                        <td>
                                                            {formatCurrency(item.unit_price)}
                                                        </td>

                                                        <td className="reports-receipt-line-total">
                                                            {formatCurrency(item.subtotal)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                <div className="reports-receipt-summary">
                                    <div className="reports-receipt-total-row">
                                        <span>Subtotal</span>
                                        <strong>
                                            {formatCurrency(
                                                saleItems.reduce(
                                                    (total, item) =>
                                                        total + Number(item.subtotal || 0),
                                                    0
                                                )
                                            )}
                                        </strong>
                                    </div>

                                    <div className="reports-receipt-total">
                                        <span>Total Amount</span>
                                        <strong>
                                            {formatCurrency(receiptTotal)}
                                        </strong>
                                    </div>
                                </div>

                                <div className="reports-receipt-footer">
                                    <CheckCircle2 size={17} />
                                    <span>Transaction recorded successfully</span>
                                </div>
                            </>
                        )}
                    </section>
                </div>
            )}

        </main>
    );
}

function SparklesIcon() {
    return <BarChart3 size={15} />;
}

export default Reports;
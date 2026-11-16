
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    Banknote,
    Boxes,
    CheckCircle2,
    CircleDollarSign,
    Clock3,
    CreditCard,
    Download,
    Package,
    ReceiptText,
    ShoppingBag,
    Smartphone,
    TrendingUp,
    WalletCards
} from "lucide-react";

import { API_URL } from "../../services/api";
import ReceiptModal from "../../components/receipts/ReceiptModal.jsx";
import "./Reports.css";

const PAYMENT_COLORS = {
    cash: "#145c46",
    gcash: "#2e9d74",
    card: "#a7d6c0"
};

function toDateInputValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function Reports() {
    const [summary, setSummary] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [leastProducts, setLeastProducts] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [recentSales, setRecentSales] = useState([]);
    const [monthlyForecast, setMonthlyForecast] = useState(null);
    const [productDemandForecasts, setProductDemandForecasts] = useState([]);
    const [grossProfit, setGrossProfit] = useState(null);
    const [productProfitability, setProductProfitability] = useState([]);
    const [leadTimeDrafts, setLeadTimeDrafts] = useState({});
    const [savingLeadTimeId, setSavingLeadTimeId] = useState(null);
    const [inventoryRisk, setInventoryRisk] = useState({
        revenue_trend: null,
        stockout_risks: [],
        insufficient_demand_history: [],
        declining_sales: [],
        message: ""
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [selectedReceiptId, setSelectedReceiptId] = useState(null);
    const today = new Date();
    const initialMonthEnd = toDateInputValue(
        new Date(today.getFullYear(), today.getMonth() + 1, 0)
    );
    const initialMonthStart = toDateInputValue(
        new Date(today.getFullYear(), today.getMonth(), 1)
    );
    const [period, setPeriod] = useState("month");
    const [startDate, setStartDate] = useState(initialMonthStart);
    const [endDate, setEndDate] = useState(initialMonthEnd);
    const [appliedRange, setAppliedRange] = useState({
        startDate: initialMonthStart,
        endDate: initialMonthEnd
    });

    const formatCurrency = (value) =>
        new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            minimumFractionDigits: 2
        }).format(Number(value || 0));

    const formatDateTime = (value) => {
        if (!value) return "N/A";

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "N/A";

        return new Intl.DateTimeFormat("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }).format(date);
    };

    const exportReportsCsv = () => {
        const generatedAt = new Intl.DateTimeFormat("en-PH", {
            timeZone: "Asia/Manila",
            dateStyle: "medium",
            timeStyle: "short"
        }).format(new Date());

        const rows = [
            ["INVENTORY & SALES ANALYTICS"],
            ["Sales and inventory report"],
            ["Reporting period", appliedRange.startDate, "through", appliedRange.endDate],
            ["Generated", generatedAt],
            ["Currency", "PHP · Philippine peso"],
            ["Inventory note", "Inventory figures show current values."],
            [],
            ["EXECUTIVE SUMMARY"],
            ["Metric", "Value"],
            ["Total sales", summary?.total_sales ?? ""],
            ["Transactions", summary?.total_transactions ?? ""],
            ["Items sold", summary?.total_items_sold ?? ""],
            [],
            ["TOP SELLING PRODUCTS"],
            ["Product", "Units sold", "Revenue"],
            ...topProducts.map((item) => [item.product_name, item.total_quantity_sold, item.total_sales]),
            [],
            ["LEAST-SELLING PRODUCTS"],
            ["Product", "Units sold", "Revenue"],
            ...leastProducts.map((item) => [item.product_name, item.total_quantity_sold, item.total_sales]),
            [],
            ["PAYMENT METHODS"],
            ["Payment method", "Transactions", "Sales"],
            ...paymentMethods.map((item) => [item.payment_method, item.transaction_count, item.total_sales]),
            [],
            ["REVENUE FORECAST · NEXT 30 DAYS"],
            ["Projected revenue next 30 days", monthlyForecast?.projected_30_day_revenue ?? "Unavailable"],
            ["Backtest MAE", monthlyForecast?.backtest?.mean_absolute_error ?? "Unavailable"],
            ["Backtest WAPE percent", monthlyForecast?.backtest?.weighted_absolute_percentage_error ?? "Unavailable"],
            ["Baseline WAPE percent", monthlyForecast?.backtest?.baseline_weighted_absolute_percentage_error ?? "Unavailable"],
            ["Forecast compared with baseline", monthlyForecast?.backtest?.model_vs_baseline === "lower_error_than_baseline"
                ? "Lower error than baseline"
                : monthlyForecast?.backtest?.model_vs_baseline === "higher_error_than_baseline"
                    ? "Higher error than baseline"
                    : monthlyForecast?.backtest?.model_vs_baseline === "same_error_as_baseline"
                        ? "Same error as baseline"
                        : "Not comparable"],
            [],
            ["PRODUCT DEMAND FORECAST · NEXT 30 DAYS"],
            ["Product", "Usable stock", "Projected next 30 days", "Supplier lead time days", "Suggested restock", "Stockout risk", "90-day model WAPE", "Baseline WAPE", "Model vs baseline"],
            ...productDemandForecasts.map((item) => [
                item.product_name,
                item.available_stock,
                item.forecast_available ? item.projected_units_next_30_days : "Not enough data",
                item.supplier_lead_time_days,
                item.suggested_restock_quantity ?? "",
                item.stockout_risk,
                item.backtest?.wape_percent ?? "Unavailable",
                item.backtest?.baseline_wape_percent ?? "Unavailable",
                item.forecast_comparison === "lower_error_than_baseline"
                    ? "Lower error than baseline"
                    : item.forecast_comparison === "higher_error_than_baseline"
                        ? "Higher error than baseline"
                        : item.forecast_comparison === "same_error_as_baseline"
                            ? "Same error as baseline"
                            : "Not comparable"
            ]),
            [],
            ["INVENTORY RISK & STOCKOUT ESTIMATES"],
            ["Product", "Usable stock", "Units sold · last 30 days", "Sales days", "Estimated days to stockout", "Risk level", "Data support"],
            ...inventoryRisk.stockout_risks.map((item) => [
                item.product_name,
                item.available_stock,
                item.units_sold_last_30_days,
                item.sales_days_last_30_days,
                item.estimated_days_until_stockout,
                item.risk_level,
                item.data_support
            ]),
            [],
            ["DECLINING PRODUCT SALES"],
            ["Product", "Units · recent 30 days", "Units · previous 30 days", "Unit decline percent", "Revenue · recent 30 days", "Revenue · previous 30 days", "Revenue decline percent", "Sales days · previous window", "Decline basis"],
            ...inventoryRisk.declining_sales.map((item) => [
                item.product_name,
                item.units_sold_last_30_days,
                item.units_sold_previous_30_days,
                item.unit_decline_percent,
                item.revenue_last_30_days,
                item.revenue_previous_30_days,
                item.revenue_decline_percent,
                item.sales_days_previous_30_days,
                (item.decline_basis || []).join(" and ")
            ]),
            [],
            ["OVERALL REVENUE TREND · FIXED 30-DAY PERIODS"],
            ["Recent 30-day revenue", inventoryRisk.revenue_trend?.recent_30_day_revenue ?? "Unavailable"],
            ["Previous 30-day revenue", inventoryRisk.revenue_trend?.previous_30_day_revenue ?? "Unavailable"],
            ["Revenue change percent", inventoryRisk.revenue_trend?.change_percent ?? "Unavailable"],
            [],
            ["GROSS PROFIT · SELECTED PERIOD"],
            ["Sales revenue", grossProfit?.sales_revenue ?? "Unavailable"],
            ["Known cost of goods sold", grossProfit?.known_cost_of_goods_sold ?? "Unavailable"],
            ["Gross profit on costed sales", grossProfit?.gross_profit_on_costed_sales ?? "Unavailable"],
            ["Gross margin percent", grossProfit?.gross_margin_percent_on_costed_sales ?? "Unavailable"],
            ["Revenue with unknown cost", grossProfit?.revenue_with_unknown_cost ?? "Unavailable"],
            ["Sale lines with unknown historical cost", grossProfit?.sale_lines_with_unknown_cost ?? "Unavailable"],
            [],
            ["PRODUCT PROFITABILITY"],
            ["Product", "Units sold", "Revenue", "Known cost of goods sold", "Gross profit", "Gross margin percent", "Revenue with unknown cost", "Historical cost data"],
            ...productProfitability.map((item) => [
                item.product_name,
                item.units_sold,
                item.sales_revenue,
                item.known_cost_of_goods_sold,
                item.gross_profit_on_costed_sales,
                item.gross_margin_percent_on_costed_sales ?? "Unavailable",
                item.revenue_with_unknown_cost,
                item.historical_cost_data_incomplete ? `Incomplete (${item.sale_lines_with_unknown_cost} sale lines)` : "Complete for selected sales"
            ]),
            [],
            ["RECENT SALES"],
            ["Sale ID", "Date", "Payment method", "Total"],
            ...recentSales.map((sale) => [sale.sale_id, formatDateTime(sale.sale_date), sale.payment_method, sale.total_amount]),
            [],
            ["End of report"]
        ];

        const escapeCsvCell = (value) => {
            if (value === null || value === undefined) return "";
            if (typeof value === "number" && Number.isFinite(value)) {
                return String(value);
            }

            let text = String(value);
            if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
            return `"${text.replaceAll('"', '""')}"`;
        };

        const csv = rows
            .map((row) => row.map(escapeCsvCell).join(","))
            .join("\r\n");
        const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `inventory-sales-report-${appliedRange.startDate}-to-${appliedRange.endDate}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    const handlePeriodChange = (event) => {
        const nextPeriod = event.target.value;
        setPeriod(nextPeriod);

        if (nextPeriod === "custom") return;

        const today = new Date();
        const start = new Date(today);
        let end = new Date(today);

        if (nextPeriod === "today") {
            // Today is a single-day range.
        } else if (nextPeriod === "week") {
            const daysSinceMonday = (start.getDay() + 6) % 7;
            start.setDate(start.getDate() - daysSinceMonday);
            end = new Date(start);
            end.setDate(start.getDate() + 6);
        } else {
            start.setDate(1);
            end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
        }

        const nextStartDate = toDateInputValue(start);
        const nextEndDate = toDateInputValue(end);
        setStartDate(nextStartDate);
        setEndDate(nextEndDate);
        setAppliedRange({
            startDate: nextStartDate,
            endDate: nextEndDate
        });
    };

    const applyCustomRange = (event) => {
        event.preventDefault();

        if (!startDate || !endDate) {
            setMessage("Choose both a start date and an end date.");
            return;
        }

        if (startDate > endDate) {
            setMessage("Start date must be on or before end date.");
            return;
        }

        setMessage("");
        setAppliedRange({ startDate, endDate });
    };

    const loadReports = useCallback(async () => {
        const dateQuery = new URLSearchParams({
            start_date: appliedRange.startDate,
            end_date: appliedRange.endDate
        }).toString();

        const endpoints = [
            `${API_URL}/reports/summary?${dateQuery}`,
            `${API_URL}/reports/top-products?${dateQuery}`,
            `${API_URL}/reports/least-products?${dateQuery}`,
            `${API_URL}/reports/payment-methods?${dateQuery}`,
            `${API_URL}/reports/recent-sales?${dateQuery}`,
            `${API_URL}/reports/monthly-sales-forecast`,
            `${API_URL}/reports/product-demand-forecast`,
            `${API_URL}/reports/inventory-risk`,
            `${API_URL}/reports/gross-profit?${dateQuery}`,
            `${API_URL}/reports/product-profitability?${dateQuery}`
        ];

        try {
            const responses = await Promise.all(
                endpoints.map((url) =>
                    fetch(url, { credentials: "include" })
                )
            );

            const data = await Promise.all(
                responses.map((response) => response.json())
            );

            const [
                summaryData,
                topProductsData,
                leastProductsData,
                paymentsData,
                recentSalesData,
                monthlyForecastResponse,
                productDemandForecastResponse,
                inventoryRiskData,
                grossProfitResponse,
                productProfitabilityResponse
            ] = data;

            if (summaryData.success) {
                setSummary(summaryData.summary || null);
            }

            if (topProductsData.success) {
                setTopProducts(
                    Array.isArray(topProductsData.products)
                        ? topProductsData.products
                        : []
                );
            }

            if (leastProductsData.success) {
                setLeastProducts(
                    Array.isArray(leastProductsData.products)
                        ? leastProductsData.products
                        : []
                );
            } else {
                setLeastProducts([]);
            }

            if (paymentsData.success) {
                setPaymentMethods(
                    Array.isArray(paymentsData.payment_methods)
                        ? paymentsData.payment_methods
                        : []
                );
            }

            if (recentSalesData.success) {
                setRecentSales(
                    Array.isArray(recentSalesData.sales)
                        ? recentSalesData.sales
                        : []
                );
            }

            setMonthlyForecast(
                monthlyForecastResponse.success ? monthlyForecastResponse : null
            );
            setProductDemandForecasts(
                productDemandForecastResponse.success && Array.isArray(productDemandForecastResponse.products)
                    ? productDemandForecastResponse.products
                    : []
            );
            setGrossProfit(grossProfitResponse.success ? grossProfitResponse : null);
            setProductProfitability(
                productProfitabilityResponse.success && Array.isArray(productProfitabilityResponse.products)
                    ? productProfitabilityResponse.products
                    : []
            );

            if (inventoryRiskData.success) {
                setInventoryRisk({
                    revenue_trend: inventoryRiskData.revenue_trend || null,
                    stockout_risks: Array.isArray(
                        inventoryRiskData.stockout_risks
                    )
                        ? inventoryRiskData.stockout_risks
                        : [],
                    insufficient_demand_history: Array.isArray(
                        inventoryRiskData.insufficient_demand_history
                    )
                        ? inventoryRiskData.insufficient_demand_history
                        : [],
                    declining_sales: Array.isArray(
                        inventoryRiskData.declining_sales
                    )
                        ? inventoryRiskData.declining_sales
                        : [],
                    message: inventoryRiskData.message || ""
                });
            } else {
                setInventoryRisk({
                    revenue_trend: null,
                    stockout_risks: [],
                    insufficient_demand_history: [],
                    declining_sales: [],
                    message: ""
                });
            }

            if (
                data.some((item) => !item?.success) ||
                responses.some((response) => !response.ok)
            ) {
                setMessage(
                    "Some report information could not be loaded."
                );
            }
        } catch (error) {
            console.error("Reports error:", error);
            setMessage("Unable to connect to the backend.");
        } finally {
            setLoading(false);
        }
    }, [appliedRange]);

    const saveSupplierLeadTime = async (productId, currentDays) => {
        const days = Number(leadTimeDrafts[productId] ?? currentDays);
        if (!Number.isInteger(days) || days < 1 || days > 365) {
            setMessage("Supplier lead time must be a whole number from 1 to 365 days.");
            return;
        }
        setSavingLeadTimeId(productId);
        try {
            const response = await fetch(`${API_URL}/reports/product-demand-forecast/lead-time`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ product_id: productId, lead_time_days: days })
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || "Unable to save supplier lead time.");
            }
            setMessage(result.message);
            await loadReports();
        } catch (error) {
            setMessage(error.message || "Unable to save supplier lead time.");
        } finally {
            setSavingLeadTimeId(null);
        }
    };

    useEffect(() => {
        Promise.resolve().then(() => loadReports());
    }, [loadReports]);

    const averageSale =
        Number(summary?.total_transactions || 0) > 0
            ? Number(summary?.total_sales || 0) /
            Number(summary.total_transactions)
            : 0;

    const averageItems =
        Number(summary?.total_transactions || 0) > 0
            ? Number(summary?.total_items_sold || 0) /
            Number(summary.total_transactions)
            : 0;

    const paymentTotal = useMemo(
        () =>
            paymentMethods.reduce(
                (total, method) =>
                    total + Number(method.total_sales || 0),
                0
            ),
        [paymentMethods]
    );

    const getPaymentColor = (method) =>
        PAYMENT_COLORS[String(method || "").toLowerCase()] ||
        "#61b795";

    const getPaymentIcon = (method) => {
        const value = String(method || "").toLowerCase();

        if (value === "cash") return Banknote;
        if (value === "gcash") return Smartphone;
        return CreditCard;
    };

    const paymentGradient = useMemo(() => {
        if (!paymentMethods.length || paymentTotal <= 0) {
            return "conic-gradient(#e2e8f0 0% 100%)";
        }

        let start = 0;
        const sections = paymentMethods.map((method) => {
            const amount = Number(method.total_sales || 0);
            const percentage = (amount / paymentTotal) * 100;
            const end = start + percentage;
            const section =
                `${getPaymentColor(method.payment_method)} ` +
                `${start}% ${end}%`;

            start = end;
            return section;
        });

        return `conic-gradient(${sections.join(", ")})`;
    }, [paymentMethods, paymentTotal]);

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
            icon: CircleDollarSign,
            variant: "blue"
        },
        {
            title: "Transactions",
            value: summary?.total_transactions ?? 0,
            icon: WalletCards,
            variant: "green"
        },
        {
            title: "Items Sold",
            value: summary?.total_items_sold ?? 0,
            icon: ShoppingBag,
            variant: "purple"
        },
        {
            title: "Active Products",
            value: summary?.total_products ?? 0,
            icon: Package,
            variant: "orange"
        }
    ];

    return (
        <div className="premium-reports-page">
            <header className="reports-header">
                <div>
                    <h1>Reports</h1>
                </div>

                <div className="reports-header-actions">
                    <button type="button" className="reports-export" onClick={exportReportsCsv} disabled={loading}>
                        <Download size={17} /> Export CSV
                    </button>
                </div>
            </header>

            <form
                className="reports-date-filter"
                onSubmit={applyCustomRange}
            >
                <div className="reports-date-filter-heading">
                    <strong>Sales reporting period</strong>
                    <span>Filters sales and product reports.</span>
                </div>

                <div className="reports-date-filter-controls">
                    <label className="reports-date-period">
                        <span>Period</span>
                        <select
                            value={period}
                            onChange={handlePeriodChange}
                        >
                            <option value="today">Today</option>
                            <option value="week">This week</option>
                            <option value="month">This month</option>
                            <option value="custom">Custom range</option>
                        </select>
                    </label>

                    {period === "custom" && (
                        <>
                            <label>
                                <span>From</span>
                                <input
                                    type="date"
                                    value={startDate}
                                    max={endDate || undefined}
                                    onChange={(event) =>
                                        setStartDate(event.target.value)
                                    }
                                />
                            </label>
                            <label>
                                <span>To</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    min={startDate || undefined}
                                    onChange={(event) =>
                                        setEndDate(event.target.value)
                                    }
                                />
                            </label>
                            <button type="submit" disabled={loading}>
                                Apply dates
                            </button>
                        </>
                    )}
                </div>

                <p className="reports-date-filter-active">
                    Showing {appliedRange.startDate} to {appliedRange.endDate}. Inventory figures show current values.
                </p>
            </form>

            {message && (
                <div className="reports-message" role="status">
                    <AlertTriangle size={18} />
                    {message}
                </div>
            )}

            <section className="reports-kpi-grid">
                {summaryCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <article
                            key={card.title}
                            className={`reports-kpi-card reports-kpi-${card.variant}`}
                        >
                            <div className="reports-kpi-top">
                                <div className="reports-kpi-icon">
                                    <Icon size={22} />
                                </div>
                                <span>{card.title}</span>
                            </div>
                            <strong>{loading ? "..." : card.value}</strong>
                        </article>
                    );
                })}
            </section>

            <section className="reports-panel" aria-labelledby="product-profitability-title">
                <div className="reports-panel-title">
                    <div className="reports-panel-icon"><CircleDollarSign size={23} /></div>
                    <div>
                        <h2 id="product-profitability-title">Product profitability</h2>
                    </div>
                </div>
                {productProfitability.length === 0 ? (
                    <div className="reports-empty"><CircleDollarSign size={34} /><strong>No product sales in this period</strong><span>Try another date range.</span></div>
                ) : (
                    <div className="reports-table-wrapper">
                        <table className="reports-modern-table reports-profitability-table">
                            <thead><tr><th>Product</th><th>Units sold</th><th>Sales revenue</th></tr></thead>
                            <tbody>
                                {productProfitability.map((item) => (
                                    <tr key={item.product_id}>
                                        <td><strong>{item.product_name}</strong><small>{item.barcode || "No barcode"}</small></td>
                                        <td>{item.units_sold}</td>
                                        <td>{formatCurrency(item.sales_revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section className="reports-secondary-grid">
                <article>
                    <div className="reports-secondary-icon blue">
                        <Boxes size={21} />
                    </div>
                    <div>
                        <span>Total Stock</span>
                        <strong>{summary?.total_stock ?? 0}</strong>
                    </div>
                </article>

                <article>
                    <div className="reports-secondary-icon orange">
                        <AlertTriangle size={21} />
                    </div>
                    <div>
                        <span>Low Stock</span>
                        <strong>{summary?.low_stock_items ?? 0}</strong>
                    </div>
                </article>

                <article>
                    <div className="reports-secondary-icon purple">
                        <Clock3 size={21} />
                    </div>
                    <div>
                        <span>Expiring Soon</span>
                        <strong>{summary?.expiring_items ?? 0}</strong>
                    </div>
                </article>

                <article>
                    <div className="reports-secondary-icon green">
                        <TrendingUp size={21} />
                    </div>
                    <div>
                        <span>Average Sale</span>
                        <strong className="reports-money">
                            {formatCurrency(averageSale)}
                        </strong>
                    </div>
                </article>
            </section>

            <section className="reports-main-grid reports-risk-grid reports-stockout-payment-grid">
                <article className="reports-panel reports-stockout-panel">
                    <div className="reports-panel-title">
                        <div className="reports-panel-icon">
                            <AlertTriangle size={23} />
                        </div>
                        <div>
                            <h2>Products that may run out</h2>
                        </div>
                    </div>

                    {inventoryRisk.stockout_risks.length === 0 &&
                        inventoryRisk.insufficient_demand_history.length === 0 ? (
                        <div className="reports-empty reports-risk-empty">
                            <CheckCircle2 size={30} />
                            <strong>No run-out alerts for products with recent sales</strong>
                            <span>Products without recent sales cannot be estimated.</span>
                        </div>
                    ) : null}

                    {inventoryRisk.stockout_risks.length === 0 &&
                        inventoryRisk.insufficient_demand_history.length > 0 && (
                            <div className="reports-empty reports-risk-empty">
                                <AlertTriangle size={30} />
                                <strong>Not enough sales data yet</strong>
                                <span>A run-out estimate needs sales on 7 different days in the last 30 days.</span>
                            </div>
                        )}

                    {inventoryRisk.stockout_risks.length > 0 && (
                        <div className="reports-risk-list">
                            {inventoryRisk.stockout_risks.map((product) => (
                                <article
                                    className="reports-risk-item"
                                    key={product.product_id}
                                >
                                    <div className="reports-risk-item-main">
                                        <strong>{product.product_name}</strong>
                                    </div>
                                    <div className="reports-risk-item-stats">
                                        <span>
                                            {product.available_stock} available
                                        </span>
                                        <strong
                                            className={"reports-risk-level reports-risk-" + product.risk_level}
                                        >
                                            {product.risk_level === "high"
                                                ? "High risk"
                                                : "Watch"}
                                            {" · "}
                                            May run out in about {product.estimated_days_until_stockout} days
                                        </strong>
                                        <span>
                                            Estimated date: {product.estimated_stockout_date || "Unavailable"}
                                        </span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                </article>

                <article className="reports-panel reports-payment-methods-panel">
                    <div className="reports-panel-title">
                        <div className="reports-panel-icon payment">
                            <CreditCard size={23} />
                        </div>
                        <div>
                            <h2>Payment Methods</h2>
                        </div>
                    </div>

                    <div className="reports-donut-area">
                        <div
                            className="reports-donut"
                            style={{ background: paymentGradient }}
                        >
                            <div className="reports-donut-center">
                                <strong>
                                    {formatCurrency(paymentTotal)}
                                </strong>
                                <span>Total</span>
                            </div>
                        </div>
                    </div>

                    <div className="reports-payment-list">
                        {paymentMethods.map((payment) => {
                            const Icon = getPaymentIcon(
                                payment.payment_method
                            );

                            return (
                                <div
                                    className="reports-payment-item"
                                    key={payment.payment_method}
                                >
                                    <div className="reports-payment-icon">
                                        <Icon size={19} />
                                    </div>
                                    <div className="reports-payment-details">
                                        <div>
                                            <strong>
                                                {payment.payment_method}
                                            </strong>
                                            <span>
                                                {paymentPercentage(
                                                    payment.total_sales
                                                )}
                                                %
                                            </span>
                                        </div>
                                        <div>
                                            <span>
                                                {payment.transaction_count ?? 0}{" "}
                                                transactions
                                            </span>
                                            <strong>
                                                {formatCurrency(
                                                    payment.total_sales
                                                )}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </article>


            </section>

            <section className="reports-performance-panel reports-revenue-trend-panel">
                <div className="reports-section-heading">
                    <h2>Revenue comparison</h2>
                </div>

                <div className="reports-performance-grid reports-revenue-trend-grid">
                    <article>
                        <CircleDollarSign size={23} />
                        <span>Latest 30 days</span>
                        <strong>
                            {loading
                                ? "..."
                                : inventoryRisk.revenue_trend
                                    ? formatCurrency(
                                        inventoryRisk.revenue_trend.recent_30_day_revenue
                                    )
                                    : "Unavailable"}
                        </strong>
                    </article>
                    <article>
                        <WalletCards size={23} />
                        <span>Previous 30 days</span>
                        <strong>
                            {loading
                                ? "..."
                                : inventoryRisk.revenue_trend
                                    ? formatCurrency(
                                        inventoryRisk.revenue_trend.previous_30_day_revenue
                                    )
                                    : "Unavailable"}
                        </strong>
                    </article>
                    <article>
                        <TrendingUp size={23} />
                        <span>Revenue change</span>
                        <strong
                            className={
                                "reports-revenue-status reports-revenue-" +
                                (inventoryRisk.revenue_trend?.status || "unknown")
                            }
                        >
                            {loading
                                ? "Loading..."
                                : !inventoryRisk.revenue_trend
                                    ? "Unavailable"
                                    : inventoryRisk.revenue_trend.change_percent == null
                                        ? inventoryRisk.revenue_trend.status === "new_activity"
                                            ? "New activity"
                                            : "Not enough history"
                                        : (inventoryRisk.revenue_trend.change_percent > 0
                                            ? "+"
                                            : "") +
                                        inventoryRisk.revenue_trend.change_percent +
                                        "%"}
                        </strong>
                    </article>
                </div>

                <p className="reports-risk-note">
                    Uses two fixed 30-day periods; changes of 10% or more are flagged.
                </p>
            </section>





            <section className="reports-panel reports-product-demand-panel" aria-labelledby="product-demand-title">
                <div className="reports-panel-title">
                    <div className="reports-panel-icon"><Package size={23} /></div>
                    <div>
                        <h2 id="product-demand-title">Product demand · next 30 days</h2>
                    </div>
                </div>
                {productDemandForecasts.length === 0 ? (
                    <div className="reports-empty">
                        <Package size={34} />
                        <strong>No product forecasts available</strong>
                        <span>Each product needs sales on 14 different days in the last 90 days.</span>
                    </div>
                ) : (
                    <div className="reports-table-wrapper">
                        <table className="reports-modern-table reports-demand-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Usable stock</th>
                                    <th>Expected units · 30 days</th>
                                    <th>Lead time</th>
                                    <th>Suggested restock</th>
                                    <th>Sales history</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productDemandForecasts.map((item) => (
                                    <tr key={item.product_id}>
                                        <td>
                                            <strong>{item.product_name}</strong>
                                            <small>{item.barcode || "No barcode"}</small>
                                        </td>
                                        <td>{item.available_stock}</td>
                                        <td>{item.forecast_available ? item.projected_units_next_30_days : "Need more sales data"}</td>
                                        <td>
                                            <div className="reports-lead-time-control">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="365"
                                                    step="1"
                                                    aria-label={`Supplier lead time for ${item.product_name} in days`}
                                                    value={leadTimeDrafts[item.product_id] ?? item.supplier_lead_time_days}
                                                    onChange={(event) => setLeadTimeDrafts((current) => ({ ...current, [item.product_id]: event.target.value }))}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => saveSupplierLeadTime(item.product_id, item.supplier_lead_time_days)}
                                                    disabled={savingLeadTimeId === item.product_id}
                                                >
                                                    {savingLeadTimeId === item.product_id ? "Saving…" : "Save"}
                                                </button>
                                            </div>
                                        </td>
                                        <td>{item.forecast_available ? item.suggested_restock_quantity : "—"}</td>
                                        <td className="reports-support-label">{item.data_support}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <p className="reports-monthly-forecast-note">
                    Uses 90 days of data and needs sales on 14 different days per product.
                </p>
            </section>





            <section className="reports-performance-panel">
                <div className="reports-section-heading">
                    <h2>Store performance</h2>

                </div>

                <div className="reports-performance-grid">
                    <article>
                        <CircleDollarSign size={23} />
                        <span>Average Sale</span>
                        <strong>{formatCurrency(averageSale)}</strong>
                    </article>
                    <article>
                        <ShoppingBag size={23} />
                        <span>Items Per Sale</span>
                        <strong>{averageItems.toFixed(1)}</strong>
                    </article>
                    <article>
                        <Package size={23} />
                        <span>Product Lines</span>
                        <strong>{summary?.total_products ?? 0}</strong>
                    </article>
                    <article>
                        <AlertTriangle size={23} />
                        <span>Stock Attention</span>
                        <strong>
                            {Number(summary?.low_stock_items || 0) +
                                Number(summary?.expiring_items || 0)}
                        </strong>
                    </article>
                </div>
            </section>

            <section className="reports-sales-panel">
                <div className="reports-panel-title">
                    <div className="reports-panel-icon">
                        <ReceiptText size={23} />
                    </div>
                    <div>
                        <h2>Recent Sales</h2>

                    </div>
                </div>

                <div className="reports-table-wrapper">
                    <table className="reports-modern-table">
                        <thead>
                            <tr>
                                <th>Sale ID</th>
                                <th>Cashier</th>
                                <th>Payment</th>
                                <th>Date &amp; Time</th>
                                <th>Total</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentSales.map((sale) => (
                                <tr key={sale.sale_id}>
                                    <td>
                                        <button type="button" className="reports-receipt-link reports-sale-id" onClick={() => setSelectedReceiptId(sale.sale_id)} aria-label={`View receipt for sale ${sale.sale_id}`}>#{sale.sale_id}</button>
                                    </td>
                                    <td>
                                        {sale.full_name ||
                                            sale.username ||
                                            "User"}
                                    </td>
                                    <td>
                                        <span
                                            className={`reports-payment-badge reports-payment-${sale.payment_method}`}
                                        >
                                            {sale.payment_method}
                                        </span>
                                    </td>
                                    <td>
                                        {formatDateTime(sale.sale_date)}
                                    </td>
                                    <td>
                                        <strong className="reports-sale-total">
                                            {formatCurrency(
                                                sale.total_amount
                                            )}
                                        </strong>
                                    </td>
                                    <td>
                                        <span className="reports-completed">
                                            <CheckCircle2 size={14} />
                                            Completed
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
            <ReceiptModal saleId={selectedReceiptId} onClose={() => setSelectedReceiptId(null)} />
        </div>
    );
}

export default Reports;

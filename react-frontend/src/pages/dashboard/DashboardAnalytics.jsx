import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, Package, RefreshCw, TrendingUp, Trophy } from "lucide-react";
import { API_URL } from "../../services/api";
import "../reports/Reports.css";

const CHART_WIDTH = 900;
const CHART_HEIGHT = 320;
const CHART_PADDING = { top: 24, right: 24, bottom: 48, left: 78 };

function formatCurrency(value) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency", currency: "PHP", minimumFractionDigits: 2
    }).format(Number(value) || 0);
}

function DashboardAnalytics({
    stockoutRisks = [],
    stockoutHistoryGaps = [],
    stockoutLoading = false,
    onViewStockAlerts
}) {
    const [topProducts, setTopProducts] = useState([]);
    const [leastProducts, setLeastProducts] = useState([]);
    const [forecastData, setForecastData] = useState(null);
    const [inventoryRisk, setInventoryRisk] = useState({ declining_sales: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        const now = new Date();
        const formatInput = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        const range = new URLSearchParams({
            start_date: formatInput(new Date(now.getFullYear(), now.getMonth(), 1)),
            end_date: formatInput(new Date(now.getFullYear(), now.getMonth() + 1, 0))
        }).toString();
        const endpoints = [
            `${API_URL}/reports/top-products?${range}`,
            `${API_URL}/reports/least-products?${range}`,
            `${API_URL}/reports/sales-forecast`,
            `${API_URL}/reports/inventory-risk`
        ];

        Promise.all(endpoints.map(async (url) => {
            const response = await fetch(url, { credentials: "include" });
            const data = await response.json().catch(() => ({}));
            return response.ok && data.success ? data : null;
        })).then(([top, least, daily, risk]) => {
            if (!active) return;
            setTopProducts(Array.isArray(top?.products) ? top.products : []);
            setLeastProducts(Array.isArray(least?.products) ? least.products : []);
            setForecastData(daily);
            setInventoryRisk({ declining_sales: Array.isArray(risk?.declining_sales) ? risk.declining_sales : [] });
        }).catch((error) => {
            console.error("Dashboard analytics error:", error);
        }).finally(() => {
            if (active) setLoading(false);
        });

        return () => { active = false; };
    }, []);

    const maxQuantity = useMemo(() => Math.max(0, ...topProducts.map((item) => Number(item.total_quantity_sold || 0))), [topProducts]);
    const maxLeastQuantity = useMemo(() => Math.max(0, ...leastProducts.map((item) => Number(item.total_quantity_sold || 0))), [leastProducts]);
    const salesForecast = useMemo(() => ({
        actual: Array.isArray(forecastData?.actual) ? forecastData.actual : [],
        forecast: forecastData?.forecast_available && Array.isArray(forecastData.forecast) ? forecastData.forecast : [],
        recordedDayCount: Number(forecastData?.recorded_sales_days) || 0,
        average: Number(forecastData?.forecast_daily_average) || 0,
        forecastAvailable: Boolean(forecastData?.forecast_available),
    }), [forecastData]);

    const chartModel = useMemo(() => {
        const { actual, forecast } = salesForecast;
        if (actual.length === 0) return null;
        const plotWidth = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
        const plotHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
        const totalDays = actual.length + forecast.length;
        const xForIndex = (index) => CHART_PADDING.left + (totalDays <= 1 ? 0 : (index / (totalDays - 1)) * plotWidth);

        // Keep the forecast visible over recent actuals by drawing the same
        // trailing-seven-day model over the latest seven observed days.
        const historicalForecast = actual.slice(7).map((day, index) => {
            const precedingDays = actual.slice(index, index + 7);
            const average = precedingDays.reduce(
                (total, item) => total + (Number(item.revenue) || 0),
                0
            ) / precedingDays.length;

            return {
                ...day,
                revenue: average,
                forecastType: "backtest",
                chartIndex: index + 7
            };
        });
        const futureForecast = forecast.map((day, index) => ({
            ...day,
            forecastType: "future",
            chartIndex: actual.length + index
        }));
        const forecastSeries = [...historicalForecast, ...futureForecast];
        const values = [
            ...actual.map((day) => Number(day.revenue) || 0),
            ...forecastSeries.map((day) => Number(day.revenue) || 0)
        ];
        const axisMaximum = Math.max(100, Math.ceil(Math.max(...values, 1) / 100) * 100);
        const yForValue = (value) => CHART_PADDING.top + plotHeight - ((Number(value) || 0) / axisMaximum) * plotHeight;
        const actualPoints = actual.map((day, index) => ({ ...day, x: xForIndex(index), y: yForValue(day.revenue) }));
        const forecastPoints = forecastSeries.map((day) => ({
            ...day,
            x: xForIndex(day.chartIndex),
            y: yForValue(day.revenue)
        }));
        const actualPath = actualPoints.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
        const forecastPath = forecastPoints.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
        const ticks = Array.from({ length: 5 }, (_, index) => {
            const value = (axisMaximum / 4) * index;
            return { value, y: yForValue(value) };
        });
        const timeline = [...actual, ...forecast];
        const labelIndexes = forecast.length > 0 ? [0, 4, 8, 13, 16, 20] : [0, 4, 8, 13];
        const dateLabels = labelIndexes.flatMap((index) => {
            const day = timeline[index];
            if (!day?.date) return [];
            return [{ x: xForIndex(index), label: new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${day.date}T00:00:00Z`)) }];
        });
        const forecastStartX = forecast.length > 0
            ? (xForIndex(actual.length - 1) + xForIndex(actual.length)) / 2
            : null;

        return { actualPoints, actualPath, forecastPoints, forecastPath, ticks, dateLabels, forecastStartX };
    }, [salesForecast]);

    return (
        <div className="dashboard-analytics-grid">
            <section className="reports-main-grid reports-risk-grid">
                <article className="reports-panel reports-declining-sales-panel">
                    <div className="reports-panel-title">
                        <div className="reports-panel-icon">
                            <TrendingUp size={23} />
                        </div>
                        <div>
                            <h2>Declining Sales</h2>
                            <p>
                                Flags a 20%+ drop versus the previous 30 days.
                            </p>
                        </div>
                    </div>

                    {inventoryRisk.declining_sales.length === 0 ? (
                        <div className="reports-empty reports-risk-empty">
                            <CheckCircle2 size={30} />
                            <strong>No significant sales drops found</strong>
                        </div>
                    ) : (
                        <div className="reports-risk-list">
                            {inventoryRisk.declining_sales.map((product) => (
                                <article
                                    className="reports-risk-item"
                                    key={product.product_id}
                                >
                                    <div className="reports-risk-item-main">
                                        <strong>{product.product_name}</strong>
                                        <span>
                                            {product.barcode || "No barcode"}
                                        </span>
                                    </div>
                                    <div className="reports-risk-item-stats">
                                        <span>
                                            Units: {product.units_sold_last_30_days} recent · {product.units_sold_previous_30_days} previous
                                        </span>
                                        <span>
                                            Revenue: {formatCurrency(product.revenue_last_30_days)} recent · {formatCurrency(product.revenue_previous_30_days)} previous
                                        </span>
                                        {product.unit_decline_percent >= 20 && (
                                            <strong className="reports-risk-level reports-risk-declining">
                                                Units down {product.unit_decline_percent}%
                                            </strong>
                                        )}
                                        {product.revenue_decline_percent >= 20 && (
                                            <strong className="reports-risk-level reports-risk-declining">
                                                Revenue down {product.revenue_decline_percent}%
                                            </strong>
                                        )}
                                        <small>
                                            Previous period: {product.sales_days_previous_30_days} sales days
                                        </small>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </article>
            </section>

            <section className="reports-panel reports-runout-panel">
                <div className="reports-panel-title">
                    <div className="reports-panel-icon">
                        <AlertTriangle size={23} />
                    </div>
                    <div>
                        <h2>Products that may run out</h2>
                        <p>Based on recent sales and available stock.</p>
                    </div>
                </div>

                {stockoutLoading ? (
                    <div className="reports-empty reports-runout-empty">
                        <RefreshCw size={27} />
                        <strong>Checking sales and stock</strong>
                    </div>
                ) : stockoutRisks.length === 0 ? (
                    <div className="reports-empty reports-runout-empty">
                        <CheckCircle2 size={29} />
                        <strong>No current run-out estimates</strong>
                    </div>
                ) : (
                    <div className="reports-risk-list reports-runout-list">
                        {stockoutRisks.slice(0, 3).map((product) => (
                            <article className="reports-risk-item" key={product.product_id}>
                                <div className="reports-risk-item-main">
                                    <strong>{product.product_name}</strong>
                                    <span>{product.available_stock} available</span>
                                </div>
                                <div className="reports-risk-item-stats">
                                    <strong className="reports-runout-days">
                                        ~{product.estimated_days_until_stockout} days
                                    </strong>
                                    <span>estimated</span>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {stockoutHistoryGaps.length > 0 && (
                    <p className="reports-runout-history-note">
                        {stockoutHistoryGaps.length} {stockoutHistoryGaps.length === 1 ? "product needs" : "products need"} more sales history for an estimate.
                    </p>
                )}
                <button type="button" className="reports-runout-link" onClick={onViewStockAlerts}>
                    See all stock alerts <ArrowRight size={15} />
                </button>
            </section>

            <section
                className="reports-panel reports-forecast-panel"
                aria-labelledby="sales-forecast-title"
            >
                <div className="reports-panel-title">
                    <div className="reports-panel-icon">
                        <TrendingUp size={23} />
                    </div>
                    <div>
                        <h2 id="sales-forecast-title">
                            Daily Sales Forecast
                        </h2>

                    </div>
                </div>

                {chartModel ? (
                    <>
                        <div
                            className="reports-forecast-legend"
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "16px",
                                marginBottom: "10px",
                                color: "#59675f",
                                fontSize: "0.8rem"
                            }}
                        >
                            <span
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 7
                                }}
                            >
                                <span
                                    style={{
                                        display: "inline-block",
                                        width: 19,
                                        height: 3,
                                        borderRadius: 2,
                                        background: "#145c46"
                                    }}
                                />
                                Actual revenue
                            </span>
                            {chartModel.forecastPoints.length > 0 && (
                                <span
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 7
                                    }}
                                >
                                    <span
                                        style={{
                                            display: "inline-block",
                                            width: 19,
                                            borderTop: "3px dashed #2e9d74"
                                        }}
                                    />
                                    Forecast
                                </span>
                            )}
                        </div>

                        <div
                            style={{
                                width: "100%",
                                overflowX: "hidden"
                            }}
                        >
                            <svg
                                viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
                                role="img"
                                aria-label="Line chart showing daily actual sales revenue and a seven-day sales forecast"
                                style={{
                                    display: "block",
                                    width: "100%",
                                    minWidth: 560,
                                    height: "auto"
                                }}
                            >
                                {chartModel.ticks.map((tick) => (
                                    <g key={tick.value}>
                                        <line
                                            x1={CHART_PADDING.left}
                                            x2={
                                                CHART_WIDTH -
                                                CHART_PADDING.right
                                            }
                                            y1={tick.y}
                                            y2={tick.y}
                                            stroke="#e6eee9"
                                            strokeWidth="1"
                                        />
                                        <text
                                            x={CHART_PADDING.left - 12}
                                            y={tick.y + 4}
                                            textAnchor="end"
                                            fill="#718078"
                                            fontSize="12"
                                        >
                                            {new Intl.NumberFormat("en-PH", {
                                                notation: "compact",
                                                maximumFractionDigits: 1
                                            }).format(tick.value)}
                                        </text>
                                    </g>
                                ))}

                                {chartModel.forecastStartX !== null && (
                                    <line
                                        x1={chartModel.forecastStartX}
                                        x2={chartModel.forecastStartX}
                                        y1={CHART_PADDING.top}
                                        y2={
                                            CHART_HEIGHT -
                                            CHART_PADDING.bottom
                                        }
                                        stroke="#a7d6c0"
                                        strokeDasharray="4 5"
                                    />
                                )}

                                <path
                                    d={chartModel.actualPath}
                                    fill="none"
                                    stroke="#145c46"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />

                                {chartModel.forecastPoints.length > 0 && (
                                    <path
                                        d={chartModel.forecastPath}
                                        fill="none"
                                        stroke="#2e9d74"
                                        strokeWidth="3"
                                        strokeDasharray="7 6"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                )}

                                {chartModel.actualPoints.map((point) => (
                                    <circle
                                        key={point.date}
                                        cx={point.x}
                                        cy={point.y}
                                        r="3.5"
                                        fill="#145c46"
                                    >
                                        <title>
                                            {point.date}:{" "}
                                            {formatCurrency(point.revenue)}
                                        </title>
                                    </circle>
                                ))}

                                {chartModel.dateLabels.map((item) => (
                                    <text
                                        key={`${item.x}-${item.label}`}
                                        x={item.x}
                                        y={
                                            CHART_HEIGHT -
                                            CHART_PADDING.bottom +
                                            25
                                        }
                                        textAnchor="middle"
                                        fill="#718078"
                                        fontSize="12"
                                    >
                                        {item.label}
                                    </text>
                                ))}
                            </svg>
                        </div>

                        <div
                            className="reports-forecast-note"
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                justifyContent: "space-between",
                                gap: 8,
                                marginTop: 10,
                                padding: "11px 13px",
                                border: "1px solid #d9e8df",
                                borderRadius: 9,
                                background: "#f8fbf9",
                                color: "#59675f",
                                fontSize: "0.78rem",
                                lineHeight: 1.5
                            }}
                        >
                            <span>
                                Forecast estimate:{" "}
                                <strong style={{ color: "#0b3d2e" }}>
                                    {salesForecast.forecastAvailable
                                        ? formatCurrency(salesForecast.average)
                                        : "Unavailable"}
                                </strong>{" "}
                                {salesForecast.forecastAvailable && "per day"}
                            </span>
                            {!salesForecast.forecastAvailable && (
                                <span>
                                    Need 14 sales days; {salesForecast.recordedDayCount} recorded.
                                </span>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="reports-empty">
                        <TrendingUp size={34} />
                        <strong>No sales history yet</strong>
                        <span>
                            Completed sales will appear here.
                        </span>
                    </div>
                )}
            </section>

            <section className="reports-main-grid reports-top-selling-grid">
                <article className="reports-panel">
                    <div className="reports-panel-title">
                        <div className="reports-panel-icon">
                            <Trophy size={23} />
                        </div>
                        <div>

                            <h2>Top Selling Products</h2>
                        </div>
                    </div>

                    <div className="reports-ranking-list">
                        {topProducts.length === 0 ? (
                            <div className="reports-empty">
                                <Package size={38} />
                                <strong>No sales data</strong>
                                <span>Completed sales will appear here.</span>
                            </div>
                        ) : (
                            topProducts.slice(0, 3).map((product, index) => {
                                const quantity = Number(
                                    product.total_quantity_sold || 0
                                );
                                const width =
                                    maxQuantity > 0
                                        ? (quantity / maxQuantity) * 100
                                        : 0;

                                return (
                                    <div
                                        className="reports-ranking-item"
                                        key={product.product_id}
                                    >
                                        <div className="reports-ranking-row">
                                            <div className="reports-ranking-product">
                                                <span className="reports-rank">
                                                    #{index + 1}
                                                </span>
                                                <div>
                                                    <strong>
                                                        {product.product_name}
                                                    </strong>
                                                    <span>
                                                        {product.barcode}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="reports-ranking-values">
                                                <strong>
                                                    {quantity} units
                                                </strong>
                                                <span>
                                                    {formatCurrency(
                                                        product.total_sales
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="reports-ranking-bar">
                                            <div
                                                style={{ width: `${width}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </article>


            </section>

            <section className="reports-panel reports-least-products-panel">
                <div className="reports-panel-title">
                    <div className="reports-panel-icon">
                        <Trophy size={23} />
                    </div>
                    <div>

                        <h2>Least-Selling Products</h2>
                    </div>
                </div>

                <div className="reports-ranking-list">
                    {loading ? (
                        <div className="reports-empty">
                            <RefreshCw size={30} />
                            <strong>Loading product results</strong>
                            <span>Least-selling products are being calculated for the selected date range.</span>
                        </div>
                    ) : leastProducts.length === 0 ? (
                        <div className="reports-empty">
                            <Package size={38} />
                            <strong>No active products found</strong>
                            <span>Active catalog products will appear here for the selected reporting period.</span>
                        </div>
                    ) : (
                        leastProducts.slice(0, 3).map((product, index) => {
                            const quantity = Number(product.total_quantity_sold || 0);
                            const width = maxLeastQuantity > 0
                                ? (quantity / maxLeastQuantity) * 100
                                : 0;

                            return (
                                <div className="reports-ranking-item" key={product.product_id}>
                                    <div className="reports-ranking-row">
                                        <div className="reports-ranking-product">
                                            <span className="reports-rank">#{index + 1}</span>
                                            <div>
                                                <strong>{product.product_name}</strong>
                                                <span>{product.barcode || "No barcode"}</span>
                                            </div>
                                        </div>
                                        <div className="reports-ranking-values">
                                            <strong>{quantity} units</strong>
                                            <span>{formatCurrency(product.total_sales)}</span>
                                        </div>
                                    </div>
                                    <div className="reports-ranking-bar">
                                        <div style={{ width: `${width}%` }} />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </section>
        </div>
    );
}

export default DashboardAnalytics;

import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5000";

function Reports() {
    const [summary, setSummary] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [recentSales, setRecentSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const loadReports = async () => {
        setLoading(true);
        setMessage("");

        try {
            const [
                summaryResponse,
                topProductsResponse,
                paymentMethodsResponse,
                recentSalesResponse
            ] = await Promise.all([
                fetch(
                    API_BASE_URL +
                        "/api/reports/summary",
                    {
                        credentials: "include"
                    }
                ),
                fetch(
                    API_BASE_URL +
                        "/api/reports/top-products",
                    {
                        credentials: "include"
                    }
                ),
                fetch(
                    API_BASE_URL +
                        "/api/reports/payment-methods",
                    {
                        credentials: "include"
                    }
                ),
                fetch(
                    API_BASE_URL +
                        "/api/reports/recent-sales",
                    {
                        credentials: "include"
                    }
                )
            ]);

            const summaryData =
                await summaryResponse.json();

            const topProductsData =
                await topProductsResponse.json();

            const paymentMethodsData =
                await paymentMethodsResponse.json();

            const recentSalesData =
                await recentSalesResponse.json();

            if (summaryData.success) {
                setSummary(
                    summaryData.summary
                );
            }

            if (topProductsData.success) {
                setTopProducts(
                    topProductsData.products
                );
            }

            if (paymentMethodsData.success) {
                setPaymentMethods(
                    paymentMethodsData.payment_methods
                );
            }

            if (recentSalesData.success) {
                setRecentSales(
                    recentSalesData.sales
                );
            }

            if (
                !summaryData.success ||
                !topProductsData.success ||
                !paymentMethodsData.success ||
                !recentSalesData.success
            ) {
                setMessage(
                    "Unable to load some report data."
                );
            }
        } catch (error) {
            setMessage(
                "Unable to connect to the backend."
            );
        }

        setLoading(false);
    };

    useEffect(() => {
        const userData =
            localStorage.getItem("user");

        if (!userData) {
            window.location.href = "/";
            return;
        }

        loadReports();
    }, []);

    return (
        <main className="reports-page">
            <header className="reports-header">
                <div>
                    <h1>Reports</h1>

                    <p>
                        View sales and inventory
                        analytics.
                    </p>
                </div>

                <div className="reports-header-actions">
                    <button
                        onClick={
                            loadReports
                        }
                    >
                        Refresh
                    </button>

                    <button
                        onClick={() => {
                            window.location.href =
                                "/dashboard";
                        }}
                    >
                        Dashboard
                    </button>
                </div>
            </header>

            {message && (
                <p className="reports-message">
                    {message}
                </p>
            )}

            <section className="reports-summary">
                <div className="report-summary-card">
                    <h3>Total Sales</h3>

                    <strong>
                        {loading
                            ? "..."
                            : "₱" +
                              Number(
                                  summary?.total_sales ||
                                      0
                              ).toFixed(2)}
                    </strong>
                </div>

                <div className="report-summary-card">
                    <h3>Transactions</h3>

                    <strong>
                        {loading
                            ? "..."
                            : summary?.total_transactions ||
                              0}
                    </strong>
                </div>

                <div className="report-summary-card">
                    <h3>Items Sold</h3>

                    <strong>
                        {loading
                            ? "..."
                            : summary?.total_items_sold ||
                              0}
                    </strong>
                </div>

                <div className="report-summary-card">
                    <h3>Total Products</h3>

                    <strong>
                        {loading
                            ? "..."
                            : summary?.total_products ||
                              0}
                    </strong>
                </div>

                <div className="report-summary-card">
                    <h3>Total Stock</h3>

                    <strong>
                        {loading
                            ? "..."
                            : summary?.total_stock ||
                              0}
                    </strong>
                </div>

                <div className="report-summary-card">
                    <h3>Low Stock</h3>

                    <strong>
                        {loading
                            ? "..."
                            : summary?.low_stock_items ||
                              0}
                    </strong>
                </div>

                <div className="report-summary-card">
                    <h3>Expiring Soon</h3>

                    <strong>
                        {loading
                            ? "..."
                            : summary?.expiring_items ||
                              0}
                    </strong>
                </div>
            </section>

            <section className="reports-grid">
                <div className="report-section">
                    <div className="report-section-header">
                        <div>
                            <h2>
                                Top Products
                            </h2>

                            <p>
                                Best-selling
                                products based
                                on quantity
                                sold.
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <p>
                            Loading top
                            products...
                        </p>
                    ) : topProducts.length ===
                      0 ? (
                        <p>
                            No product sales
                            found.
                        </p>
                    ) : (
                        <div className="report-table-container">
                            <table className="report-table">
                                <thead>
                                    <tr>
                                        <th>
                                            Product
                                        </th>
                                        <th>
                                            Barcode
                                        </th>
                                        <th>
                                            Quantity
                                            Sold
                                        </th>
                                        <th>
                                            Total
                                            Sales
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {topProducts.map(
                                        (
                                            product
                                        ) => (
                                            <tr
                                                key={
                                                    product.product_id
                                                }
                                            >
                                                <td>
                                                    {
                                                        product.product_name
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        product.barcode
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        product.total_quantity_sold
                                                    }
                                                </td>

                                                <td>
                                                    ₱
                                                    {Number(
                                                        product.total_sales
                                                    ).toFixed(
                                                        2
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="report-section">
                    <div className="report-section-header">
                        <div>
                            <h2>
                                Payment Methods
                            </h2>

                            <p>
                                Sales grouped by
                                payment
                                method.
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <p>
                            Loading payment
                            methods...
                        </p>
                    ) : paymentMethods.length ===
                      0 ? (
                        <p>
                            No payment data
                            found.
                        </p>
                    ) : (
                        <div className="report-table-container">
                            <table className="report-table">
                                <thead>
                                    <tr>
                                        <th>
                                            Payment
                                            Method
                                        </th>
                                        <th>
                                            Transactions
                                        </th>
                                        <th>
                                            Total
                                            Sales
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {paymentMethods.map(
                                        (
                                            payment
                                        ) => (
                                            <tr
                                                key={
                                                    payment.payment_method
                                                }
                                            >
                                                <td>
                                                    {
                                                        payment.payment_method
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        payment.transaction_count
                                                    }
                                                </td>

                                                <td>
                                                    ₱
                                                    {Number(
                                                        payment.total_sales
                                                    ).toFixed(
                                                        2
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>

            <section className="report-section recent-sales-report">
                <div className="report-section-header">
                    <div>
                        <h2>
                            Recent Sales
                        </h2>

                        <p>
                            Latest completed
                            sales
                            transactions.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <p>
                        Loading recent sales...
                    </p>
                ) : recentSales.length ===
                  0 ? (
                    <p>
                        No recent sales
                        found.
                    </p>
                ) : (
                    <div className="report-table-container">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>
                                        Sale ID
                                    </th>
                                    <th>
                                        Cashier
                                    </th>
                                    <th>
                                        Total Amount
                                    </th>
                                    <th>
                                        Payment Method
                                    </th>
                                    <th>
                                        Sale Date
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentSales.map(
                                    (sale) => (
                                        <tr
                                            key={
                                                sale.sale_id
                                            }
                                        >
                                            <td>
                                                #
                                                {
                                                    sale.sale_id
                                                }
                                            </td>

                                            <td>
                                                {
                                                    sale.full_name
                                                }
                                            </td>

                                            <td>
                                                ₱
                                                {Number(
                                                    sale.total_amount
                                                ).toFixed(
                                                    2
                                                )}
                                            </td>

                                            <td>
                                                {
                                                    sale.payment_method
                                                }
                                            </td>

                                            <td>
                                                {new Date(
                                                    sale.sale_date
                                                ).toLocaleString()}
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
}

export default Reports;
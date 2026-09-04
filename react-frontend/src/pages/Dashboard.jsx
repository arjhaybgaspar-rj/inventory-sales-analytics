import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5000";

function Dashboard() {
    const [user, setUser] = useState(null);
    const [summary, setSummary] = useState(null);
    const [inventory, setInventory] = useState([]);
    const [recentSales, setRecentSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const loadDashboard = async () => {
        setLoading(true);
        setMessage("");

        try {
            const [
                summaryResponse,
                inventoryResponse,
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
                        "/api/inventory",
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

            const inventoryData =
                await inventoryResponse.json();

            const recentSalesData =
                await recentSalesResponse.json();

            if (summaryData.success) {
                setSummary(
                    summaryData.summary
                );
            }

            if (inventoryData.success) {
                setInventory(
                    inventoryData.inventory
                );
            }

            if (recentSalesData.success) {
                setRecentSales(
                    recentSalesData.sales
                );
            }

            if (
                !summaryData.success ||
                !inventoryData.success ||
                !recentSalesData.success
            ) {
                setMessage(
                    "Unable to load some dashboard data."
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

        const loggedInUser =
            JSON.parse(userData);

        setUser(loggedInUser);

        loadDashboard();
    }, []);

    const canManageInventory =
        user &&
        ["admin", "owner", "manager"].includes(
            user.role
        );

    if (!user) {
        return null;
    }

    return (
        <main className="dashboard-page">
            <section className="dashboard-header">
                <div>
                    <h1>
                        Inventory Sales Analytics
                    </h1>

                    <p>
                        Real-Time Stock Monitoring System
                    </p>
                </div>

                <button
                    onClick={loadDashboard}
                    disabled={loading}
                >
                    {loading
                        ? "Loading..."
                        : "Refresh"}
                </button>
            </section>

            <section className="welcome-section">
                <h2>
                    Welcome, {user.full_name}!
                </h2>

                <p>
                    Role: {user.role}
                </p>
            </section>

            {message && (
                <p className="reports-message">
                    {message}
                </p>
            )}

            <section className="dashboard-cards">
                <div className="dashboard-card">
                    <h3>
                        Total Sales
                    </h3>

                    <strong>
                        {loading
                            ? "..."
                            : "₱" +
                              Number(
                                  summary?.total_sales ||
                                      0
                              ).toFixed(2)}
                    </strong>

                    <p>
                        Completed sales
                    </p>
                </div>

                <div className="dashboard-card">
                    <h3>
                        Transactions
                    </h3>

                    <strong>
                        {loading
                            ? "..."
                            : summary?.total_transactions ||
                              0}
                    </strong>

                    <p>
                        Completed transactions
                    </p>
                </div>

                <div className="dashboard-card">
                    <h3>
                        Items Sold
                    </h3>

                    <strong>
                        {loading
                            ? "..."
                            : summary?.total_items_sold ||
                              0}
                    </strong>

                    <p>
                        Total units sold
                    </p>
                </div>

                <div className="dashboard-card">
                    <h3>
                        Total Products
                    </h3>

                    <strong>
                        {loading
                            ? "..."
                            : summary?.total_products ||
                              0}
                    </strong>

                    <p>
                        Active products
                    </p>
                </div>

                <div className="dashboard-card">
                    <h3>
                        Total Stock
                    </h3>

                    <strong>
                        {loading
                            ? "..."
                            : summary?.total_stock ||
                              0}
                    </strong>

                    <p>
                        Items currently in stock
                    </p>
                </div>

                <div className="dashboard-card">
                    <h3>
                        Low Stock
                    </h3>

                    <strong>
                        {loading
                            ? "..."
                            : summary?.low_stock_items ||
                              0}
                    </strong>

                    <p>
                        Items needing attention
                    </p>
                </div>

                <div className="dashboard-card">
                    <h3>
                        Expiring Soon
                    </h3>

                    <strong>
                        {loading
                            ? "..."
                            : summary?.expiring_items ||
                              0}
                    </strong>

                    <p>
                        Within the next 30 days
                    </p>
                </div>
            </section>

            {canManageInventory && (
                <section className="dashboard-section">
                    <div className="products-list-header">
                        <div>
                            <h2>
                                Recent Inventory
                            </h2>

                            <p>
                                Latest stock currently recorded.
                            </p>
                        </div>

                        <button
                            onClick={loadDashboard}
                            disabled={loading}
                        >
                            {loading
                                ? "Loading..."
                                : "Refresh"}
                        </button>
                    </div>

                    {loading ? (
                        <p>
                            Loading inventory...
                        </p>
                    ) : inventory.length === 0 ? (
                        <p>
                            No inventory found.
                        </p>
                    ) : (
                        <div className="inventory-table-container">
                            <table className="inventory-table">
                                <thead>
                                    <tr>
                                        <th>
                                            Product
                                        </th>

                                        <th>
                                            Batch
                                        </th>

                                        <th>
                                            Quantity
                                        </th>

                                        <th>
                                            Expiry
                                        </th>

                                        <th>
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {inventory
                                        .slice(0, 5)
                                        .map(
                                            (item) => (
                                                <tr
                                                    key={
                                                        item.inventory_id
                                                    }
                                                >
                                                    <td>
                                                        <strong>
                                                            {
                                                                item.product_name
                                                            }
                                                        </strong>

                                                        <br />

                                                        <span className="product-barcode">
                                                            {
                                                                item.barcode
                                                            }
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {item.batch_number ||
                                                            "N/A"}
                                                    </td>

                                                    <td>
                                                        {
                                                            item.quantity
                                                        }
                                                    </td>

                                                    <td>
                                                        {item.expiry_date
                                                            ? new Date(
                                                                item.expiry_date
                                                            ).toLocaleDateString()
                                                            : "N/A"}
                                                    </td>

                                                    <td>
                                                        {Number(
                                                            item.quantity
                                                        ) <=
                                                        Number(
                                                            item.reorder_level
                                                        ) ? (
                                                            <span className="status-low">
                                                                Low Stock
                                                            </span>
                                                        ) : (
                                                            <span className="status-active">
                                                                Available
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}

            <section className="dashboard-section">
                <div className="products-list-header">
                    <div>
                        <h2>
                            Recent Sales
                        </h2>

                        <p>
                            Latest completed sales transactions.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <p>
                        Loading recent sales...
                    </p>
                ) : recentSales.length === 0 ? (
                    <p>
                        No recent sales found.
                    </p>
                ) : (
                    <div className="inventory-table-container">
                        <table className="inventory-table">
                            <thead>
                                <tr>
                                    <th>
                                        Sale ID
                                    </th>

                                    <th>
                                        Cashier
                                    </th>

                                    <th>
                                        Total
                                    </th>

                                    <th>
                                        Payment
                                    </th>

                                    <th>
                                        Date
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentSales
                                    .slice(0, 5)
                                    .map(
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

export default Dashboard;
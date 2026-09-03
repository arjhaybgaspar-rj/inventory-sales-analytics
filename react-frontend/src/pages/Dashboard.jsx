import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5000";

function Dashboard() {
    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem("user");

        if (!userData) {
            window.location.href = "/";
            return;
        }

        const loggedInUser = JSON.parse(userData);

        setUser(loggedInUser);

        const loadDashboard = async () => {
            try {
                const productsResponse = await fetch(
                    API_BASE_URL + "/api/products",
                    {
                        credentials: "include"
                    }
                );

                const productsData =
                    await productsResponse.json();

                const inventoryResponse = await fetch(
                    API_BASE_URL + "/api/inventory",
                    {
                        credentials: "include"
                    }
                );

                const inventoryData =
                    await inventoryResponse.json();

                if (productsData.success) {
                    setProducts(
                        productsData.products
                    );
                }

                if (inventoryData.success) {
                    setInventory(
                        inventoryData.inventory
                    );
                }
            } catch (error) {
                console.log(
                    "Unable to load dashboard data."
                );
            }

            setLoading(false);
        };

        loadDashboard();
    }, []);

    const totalStock = inventory.reduce(
        (total, item) =>
            total + Number(item.quantity || 0),
        0
    );

    const lowStockItems = inventory.filter(
        (item) =>
            Number(item.quantity) <=
            Number(item.reorder_level)
    );

    const expiringSoonItems = inventory.filter(
        (item) => {
            if (!item.expiry_date) {
                return false;
            }

            const expiryDate = new Date(
                item.expiry_date
            );

            const today = new Date();

            today.setHours(0, 0, 0, 0);
            expiryDate.setHours(0, 0, 0, 0);

            if (expiryDate < today) {
                return false;
            }

            const thirtyDaysFromNow =
                new Date();

            thirtyDaysFromNow.setDate(
                thirtyDaysFromNow.getDate() + 30
            );

            thirtyDaysFromNow.setHours(
                0,
                0,
                0,
                0
            );

            return (
                expiryDate <=
                thirtyDaysFromNow
            );
        }
    );

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
                        Real-Time Stock Monitoring
                        System
                    </p>
                </div>
            </section>

            <section className="welcome-section">
                <h2>
                    Welcome, {user.full_name}!
                </h2>

                <p>
                    Role: {user.role}
                </p>
            </section>

            <section className="dashboard-summary">
                <div className="summary-card">
                    <h3>
                        Total Products
                    </h3>

                    <strong>
                        {loading
                            ? "..."
                            : products.length}
                    </strong>
                </div>

                <div className="summary-card">
                    <h3>
                        Total Stock
                    </h3>

                    <strong>
                        {loading
                            ? "..."
                            : totalStock}
                    </strong>
                </div>

                <div className="summary-card">
                    <h3>
                        Low Stock
                    </h3>

                    <strong>
                        {loading
                            ? "..."
                            : lowStockItems.length}
                    </strong>
                </div>

                <div className="summary-card">
                    <h3>
                        Expiring Soon
                    </h3>

                    <strong>
                        {loading
                            ? "..."
                            : expiringSoonItems.length}
                    </strong>
                </div>
            </section>

            {canManageInventory && (
                <section className="recent-inventory-section">
                    <div className="recent-inventory-header">
                        <div>
                            <h2>
                                Recent Inventory
                            </h2>

                            <p>
                                Latest stock currently
                                recorded.
                            </p>
                        </div>
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
                        <div className="recent-inventory-table-container">
                            <table className="recent-inventory-table">
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
                                                        {
                                                            item.product_name
                                                        }
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
                                                        {item.expiry_date ||
                                                            "N/A"}
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
        </main>
    );
}

export default Dashboard;
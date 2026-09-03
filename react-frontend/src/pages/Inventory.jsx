import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5000";

function Inventory() {
    const [inventory, setInventory] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);

    const [productId, setProductId] = useState("");
    const [batchNumber, setBatchNumber] = useState("");
    const [quantity, setQuantity] = useState("");
    const [acquisitionCost, setAcquisitionCost] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [receivedDate, setReceivedDate] = useState("");
    const [reorderLevel, setReorderLevel] = useState("10");

    const loadInventory = async () => {
        setLoading(true);

        try {
            const response = await fetch(
                API_BASE_URL + "/api/inventory",
                {
                    credentials: "include"
                }
            );

            const data = await response.json();

            if (data.success) {
                setInventory(data.inventory);
            } else {
                setMessage(
                    data.message ||
                        "Unable to load inventory."
                );
            }
        } catch (error) {
            setMessage(
                "Unable to connect to the backend."
            );
        }

        setLoading(false);
    };

    const loadProducts = async () => {
        try {
            const response = await fetch(
                API_BASE_URL + "/api/products",
                {
                    credentials: "include"
                }
            );

            const data = await response.json();

            if (data.success) {
                setProducts(data.products);
            } else {
                setMessage(
                    data.message ||
                        "Unable to load products."
                );
            }
        } catch (error) {
            setMessage(
                "Unable to load products."
            );
        }
    };

    useEffect(() => {
        loadInventory();
        loadProducts();
    }, []);

    const handleStockIn = async (event) => {
        event.preventDefault();

        if (!productId) {
            setMessage(
                "Please select a product."
            );
            return;
        }

        if (
            !quantity ||
            Number(quantity) <= 0
        ) {
            setMessage(
                "Quantity must be greater than zero."
            );
            return;
        }

        if (
            acquisitionCost === "" ||
            Number(acquisitionCost) < 0
        ) {
            setMessage(
                "Please enter a valid acquisition cost."
            );
            return;
        }

        if (!receivedDate) {
            setMessage(
                "Received date is required."
            );
            return;
        }

        setSaving(true);
        setMessage("");

        try {
            const response = await fetch(
                API_BASE_URL +
                    "/api/inventory/stock-in",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        product_id:
                            Number(productId),
                        batch_number:
                            batchNumber || null,
                        quantity:
                            Number(quantity),
                        acquisition_cost:
                            Number(
                                acquisitionCost
                            ),
                        expiry_date:
                            expiryDate || null,
                        received_date:
                            receivedDate,
                        reorder_level:
                            Number(
                                reorderLevel
                            ) || 10
                    })
                }
            );

            const data =
                await response.json();

            if (data.success) {
                setMessage(
                    "Stock-in completed successfully."
                );

                setProductId("");
                setBatchNumber("");
                setQuantity("");
                setAcquisitionCost("");
                setExpiryDate("");
                setReceivedDate("");
                setReorderLevel("10");

                await loadInventory();
            } else {
                setMessage(
                    data.message ||
                        "Unable to process stock-in."
                );
            }
        } catch (error) {
            setMessage(
                "Unable to connect to the backend."
            );
        }

        setSaving(false);
    };

    const getInventoryStatus = (item) => {
        const quantityValue =
            Number(item.quantity);

        const reorderValue =
            Number(item.reorder_level);

        if (
            quantityValue <=
            reorderValue
        ) {
            return {
                label: "Low Stock",
                className: "low-stock"
            };
        }

        if (item.expiry_date) {
            const expiryDateValue =
                new Date(
                    item.expiry_date
                );

            const today = new Date();

            today.setHours(
                0,
                0,
                0,
                0
            );

            expiryDateValue.setHours(
                0,
                0,
                0,
                0
            );

            if (
                expiryDateValue <
                today
            ) {
                return {
                    label: "Expired",
                    className: "expired"
                };
            }

            const thirtyDaysFromNow =
                new Date();

            thirtyDaysFromNow.setDate(
                thirtyDaysFromNow.getDate() +
                    30
            );

            thirtyDaysFromNow.setHours(
                0,
                0,
                0,
                0
            );

            if (
                expiryDateValue <=
                thirtyDaysFromNow
            ) {
                return {
                    label: "Expiring Soon",
                    className: "expiring"
                };
            }
        }

        return {
            label: "Available",
            className: "available"
        };
    };

    return (
        <main className="inventory-page">
            <header className="inventory-header">
                <div>
                    <h1>Inventory</h1>

                    <p>
                        Monitor stock levels,
                        batches, and expiry
                        dates.
                    </p>
                </div>

                <button
                    onClick={() => {
                        window.location.href =
                            "/dashboard";
                    }}
                >
                    Dashboard
                </button>
            </header>

            <section className="stock-in-section">
                <div className="stock-in-header">
                    <div>
                        <h2>Stock-In</h2>

                        <p>
                            Add a new batch of
                            stock to your
                            inventory.
                        </p>
                    </div>
                </div>

                <form
                    className="stock-in-form"
                    onSubmit={
                        handleStockIn
                    }
                >
                    <div className="stock-in-field">
                        <label htmlFor="product">
                            Product
                        </label>

                        <select
                            id="product"
                            value={productId}
                            onChange={(event) =>
                                setProductId(
                                    event.target
                                        .value
                                )
                            }
                        >
                            <option value="">
                                Select product
                            </option>

                            {products.map(
                                (product) => (
                                    <option
                                        key={
                                            product.product_id
                                        }
                                        value={
                                            product.product_id
                                        }
                                    >
                                        {
                                            product.product_name
                                        }{" "}
                                        -{" "}
                                        {
                                            product.barcode
                                        }
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    <div className="stock-in-field">
                        <label htmlFor="batchNumber">
                            Batch Number
                        </label>

                        <input
                            type="text"
                            id="batchNumber"
                            value={batchNumber}
                            onChange={(event) =>
                                setBatchNumber(
                                    event.target
                                        .value
                                )
                            }
                            placeholder="Enter batch number"
                        />
                    </div>

                    <div className="stock-in-field">
                        <label htmlFor="quantity">
                            Quantity
                        </label>

                        <input
                            type="number"
                            id="quantity"
                            value={quantity}
                            onChange={(event) =>
                                setQuantity(
                                    event.target
                                        .value
                                )
                            }
                            placeholder="Enter quantity"
                            min="1"
                        />
                    </div>

                    <div className="stock-in-field">
                        <label htmlFor="acquisitionCost">
                            Acquisition Cost
                        </label>

                        <input
                            type="number"
                            id="acquisitionCost"
                            value={
                                acquisitionCost
                            }
                            onChange={(event) =>
                                setAcquisitionCost(
                                    event.target
                                        .value
                                )
                            }
                            placeholder="Enter acquisition cost"
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <div className="stock-in-field">
                        <label htmlFor="expiryDate">
                            Expiry Date
                        </label>

                        <input
                            type="date"
                            id="expiryDate"
                            value={expiryDate}
                            onChange={(event) =>
                                setExpiryDate(
                                    event.target
                                        .value
                                )
                            }
                        />
                    </div>

                    <div className="stock-in-field">
                        <label htmlFor="receivedDate">
                            Received Date
                        </label>

                        <input
                            type="date"
                            id="receivedDate"
                            value={
                                receivedDate
                            }
                            onChange={(event) =>
                                setReceivedDate(
                                    event.target
                                        .value
                                )
                            }
                        />
                    </div>

                    <div className="stock-in-field">
                        <label htmlFor="reorderLevel">
                            Reorder Level
                        </label>

                        <input
                            type="number"
                            id="reorderLevel"
                            value={
                                reorderLevel
                            }
                            onChange={(event) =>
                                setReorderLevel(
                                    event.target
                                        .value
                                )
                            }
                            min="0"
                        />
                    </div>

                    <div className="stock-in-action">
                        <button
                            type="submit"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : "Add Stock"}
                        </button>
                    </div>
                </form>

                {message && (
                    <p className="inventory-message">
                        {message}
                    </p>
                )}
            </section>

            <section className="inventory-section">
                <div className="inventory-section-header">
                    <div>
                        <h2>
                            Inventory List
                        </h2>

                        <p>
                            {inventory.length}{" "}
                            inventory item
                            {inventory.length !==
                            1
                                ? "s"
                                : ""}.
                        </p>
                    </div>

                    <button
                        onClick={
                            loadInventory
                        }
                    >
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <p>
                        Loading inventory...
                    </p>
                ) : inventory.length ===
                  0 ? (
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
                                        Barcode
                                    </th>
                                    <th>
                                        Batch
                                    </th>
                                    <th>
                                        Quantity
                                    </th>
                                    <th>
                                        Reorder Level
                                    </th>
                                    <th>
                                        Acquisition
                                        Cost
                                    </th>
                                    <th>
                                        Expiry Date
                                    </th>
                                    <th>
                                        Received
                                        Date
                                    </th>
                                    <th>
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {inventory.map(
                                    (item) => {
                                        const status =
                                            getInventoryStatus(
                                                item
                                            );

                                        return (
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

                                                    {item.brand ||
                                                        "N/A"}
                                                </td>

                                                <td>
                                                    {
                                                        item.barcode
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
                                                    {
                                                        item.reorder_level
                                                    }
                                                </td>

                                                <td>
                                                    ₱
                                                    {Number(
                                                        item.acquisition_cost
                                                    ).toFixed(
                                                        2
                                                    )}
                                                </td>

                                                <td>
                                                    {item.expiry_date ||
                                                        "N/A"}
                                                </td>

                                                <td>
                                                    {item.received_date ||
                                                        "N/A"}
                                                </td>

                                                <td>
                                                    <span
                                                        className={
                                                            "inventory-status " +
                                                            status.className
                                                        }
                                                    >
                                                        {
                                                            status.label
                                                        }
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
}

export default Inventory;
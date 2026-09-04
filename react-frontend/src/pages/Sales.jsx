import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5000";

function Sales() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [sales, setSales] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [salesLoading, setSalesLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadProducts();
        loadSales();
    }, []);

    const loadProducts = async () => {
        setLoading(true);

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
                "Unable to connect to the backend."
            );
        }

        setLoading(false);
    };

    const loadSales = async () => {
        setSalesLoading(true);

        try {
            const response = await fetch(
                API_BASE_URL + "/api/sales",
                {
                    credentials: "include"
                }
            );

            const data = await response.json();

            if (data.success) {
                setSales(data.sales);
            } else {
                setMessage(
                    data.message ||
                    "Unable to load sales."
                );
            }
        } catch (error) {
            setMessage(
                "Unable to connect to the backend."
            );
        }

        setSalesLoading(false);
    };

    const addToCart = (product) => {
        setMessage("");

        const existingItem = cart.find(
            (item) =>
                item.product_id === product.product_id
        );

        if (existingItem) {
            setCart(
                cart.map((item) =>
                    item.product_id === product.product_id
                        ? {
                              ...item,
                              quantity: item.quantity + 1
                          }
                        : item
                )
            );

            return;
        }

        setCart([
            ...cart,
            {
                product_id: product.product_id,
                product_name: product.product_name,
                barcode: product.barcode,
                selling_price: Number(
                    product.selling_price
                ),
                image_url: product.image_url,
                quantity: 1
            }
        ]);
    };

    const updateQuantity = (
        productId,
        quantity
    ) => {
        const newQuantity = Number(quantity);

        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCart(
            cart.map((item) =>
                item.product_id === productId
                    ? {
                          ...item,
                          quantity: newQuantity
                      }
                    : item
            )
        );
    };

    const increaseQuantity = (productId) => {
        setCart(
            cart.map((item) =>
                item.product_id === productId
                    ? {
                          ...item,
                          quantity: item.quantity + 1
                      }
                    : item
            )
        );
    };

    const decreaseQuantity = (productId) => {
        setCart(
            cart.map((item) =>
                item.product_id === productId
                    ? {
                          ...item,
                          quantity: item.quantity - 1
                      }
                    : item
            ).filter(
                (item) => item.quantity > 0
            )
        );
    };

    const removeFromCart = (productId) => {
        setCart(
            cart.filter(
                (item) =>
                    item.product_id !== productId
            )
        );
    };

    const clearCart = () => {
        setCart([]);
        setMessage("");
    };

    const totalItems = cart.reduce(
        (total, item) =>
            total + Number(item.quantity),
        0
    );

    const totalAmount = cart.reduce(
        (total, item) =>
            total +
            Number(item.selling_price) *
                Number(item.quantity),
        0
    );

    const filteredProducts = products.filter(
        (product) => {
            const search =
                searchTerm.toLowerCase();

            return (
                product.product_name
                    .toLowerCase()
                    .includes(search) ||
                product.barcode
                    .toLowerCase()
                    .includes(search) ||
                (product.brand || "")
                    .toLowerCase()
                    .includes(search)
            );
        }
    );

    const processSale = async () => {
        if (cart.length === 0) {
            setMessage("Cart is empty.");
            return;
        }

        setProcessing(true);
        setMessage("");

        try {
            const response = await fetch(
                API_BASE_URL + "/api/sales",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        payment_method:
                            paymentMethod,
                        items: cart.map(
                            (item) => ({
                                product_id:
                                    item.product_id,
                                quantity:
                                    item.quantity
                            })
                        )
                    })
                }
            );

            const data =
                await response.json();

            if (data.success) {
                setMessage(
                    "Sale completed successfully. Sale ID: " +
                        data.sale_id +
                        " | Total: ₱" +
                        Number(
                            data.total_amount
                        ).toFixed(2)
                );

                setCart([]);

                await loadProducts();
                await loadSales();
            } else {
                setMessage(
                    data.message ||
                    "Unable to process sale."
                );
            }
        } catch (error) {
            setMessage(
                "Unable to connect to the backend."
            );
        }

        setProcessing(false);
    };

    return (
        <main className="sales-page">
            <header className="sales-page-header">
                <div>
                    <span className="sales-page-label">
                        POINT OF SALE
                    </span>

                    <h1>
                        Sales
                    </h1>

                    <p>
                        Process customer purchases
                        and manage transactions.
                    </p>
                </div>

                <button
                    className="sales-dashboard-button"
                    onClick={() => {
                        window.location.href =
                            "/dashboard";
                    }}
                >
                    Dashboard
                </button>
            </header>

            <section className="sales-workspace">
                <div className="sales-products-panel">
                    <div className="sales-panel-header">
                        <div>
                            <h2>
                                Products
                            </h2>

                            <p>
                                Select a product
                                to add it to the
                                cart.
                            </p>
                        </div>

                        <button
                            className="sales-refresh-button"
                            onClick={
                                loadProducts
                            }
                        >
                            Refresh
                        </button>
                    </div>

                    <div className="sales-search">
                        <input
                            type="text"
                            placeholder="Search product or barcode..."
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(
                                    event.target.value
                                )
                            }
                        />
                    </div>

                    {loading ? (
                        <div className="sales-empty-state">
                            <p>
                                Loading products...
                            </p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="sales-empty-state">
                            <p>
                                No products found.
                            </p>
                        </div>
                    ) : (
                        <div className="sales-product-grid">
                            {filteredProducts.map(
                                (product) => (
                                    <div
                                        className="sales-product-card"
                                        key={
                                            product.product_id
                                        }
                                    >
                                        <div className="sales-product-image-wrapper">
                                            {product.image_url ? (
                                                <img
                                                    src={
                                                        product.image_url
                                                    }
                                                    alt={
                                                        product.product_name
                                                    }
                                                />
                                            ) : (
                                                <div className="sales-product-no-image">
                                                    No Image
                                                </div>
                                            )}
                                        </div>

                                        <div className="sales-product-info">
                                            <h3>
                                                {
                                                    product.product_name
                                                }
                                            </h3>

                                            <p className="sales-product-brand">
                                                {product.brand ||
                                                    "No brand"}
                                            </p>

                                            <span className="sales-product-barcode">
                                                {
                                                    product.barcode
                                                }
                                            </span>

                                            <div className="sales-product-bottom">
                                                <strong>
                                                    ₱
                                                    {Number(
                                                        product.selling_price
                                                    ).toFixed(
                                                        2
                                                    )}
                                                </strong>

                                                <button
                                                    onClick={() =>
                                                        addToCart(
                                                            product
                                                        )
                                                    }
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>

                <aside className="sales-cart-panel">
                    <div className="sales-panel-header">
                        <div>
                            <h2>
                                Current Order
                            </h2>

                            <p>
                                {totalItems}{" "}
                                item
                                {totalItems !==
                                1
                                    ? "s"
                                    : ""}
                            </p>
                        </div>

                        {cart.length > 0 && (
                            <button
                                className="sales-clear-button"
                                onClick={
                                    clearCart
                                }
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    <div className="sales-cart-list">
                        {cart.length === 0 ? (
                            <div className="sales-cart-empty">
                                <div>
                                    🛒
                                </div>

                                <h3>
                                    Cart is empty
                                </h3>

                                <p>
                                    Select products
                                    from the left
                                    panel.
                                </p>
                            </div>
                        ) : (
                            cart.map(
                                (item) => (
                                    <div
                                        className="sales-cart-item"
                                        key={
                                            item.product_id
                                        }
                                    >
                                        <div className="sales-cart-item-image">
                                            {item.image_url ? (
                                                <img
                                                    src={
                                                        item.image_url
                                                    }
                                                    alt={
                                                        item.product_name
                                                    }
                                                />
                                            ) : (
                                                <span>
                                                    No
                                                </span>
                                            )}
                                        </div>

                                        <div className="sales-cart-item-details">
                                            <h3>
                                                {
                                                    item.product_name
                                                }
                                            </h3>

                                            <p>
                                                ₱
                                                {Number(
                                                    item.selling_price
                                                ).toFixed(
                                                    2
                                                )}
                                            </p>

                                            <div className="sales-quantity-controls">
                                                <button
                                                    onClick={() =>
                                                        decreaseQuantity(
                                                            item.product_id
                                                        )
                                                    }
                                                >
                                                    −
                                                </button>

                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={
                                                        item.quantity
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        updateQuantity(
                                                            item.product_id,
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                />

                                                <button
                                                    onClick={() =>
                                                        increaseQuantity(
                                                            item.product_id
                                                        )
                                                    }
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        <div className="sales-cart-item-total">
                                            <strong>
                                                ₱
                                                {(
                                                    Number(
                                                        item.selling_price
                                                    ) *
                                                    Number(
                                                        item.quantity
                                                    )
                                                ).toFixed(
                                                    2
                                                )}
                                            </strong>

                                            <button
                                                onClick={() =>
                                                    removeFromCart(
                                                        item.product_id
                                                    )
                                                }
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                )
                            )
                        )}
                    </div>

                    <div className="sales-checkout">
                        <div className="sales-payment-row">
                            <label htmlFor="paymentMethod">
                                Payment Method
                            </label>

                            <select
                                id="paymentMethod"
                                value={
                                    paymentMethod
                                }
                                onChange={(
                                    event
                                ) =>
                                    setPaymentMethod(
                                        event.target.value
                                    )
                                }
                            >
                                <option value="cash">
                                    Cash
                                </option>

                                <option value="gcash">
                                    GCash
                                </option>

                                <option value="card">
                                    Card
                                </option>
                            </select>
                        </div>

                        <div className="sales-total-row">
                            <span>
                                Total
                            </span>

                            <strong>
                                ₱
                                {totalAmount.toFixed(
                                    2
                                )}
                            </strong>
                        </div>

                        <button
                            className="process-sale-button"
                            onClick={
                                processSale
                            }
                            disabled={
                                processing ||
                                cart.length === 0
                            }
                        >
                            {processing
                                ? "Processing..."
                                : "Process Sale"}
                        </button>

                        {message && (
                            <p className="sales-message">
                                {message}
                            </p>
                        )}
                    </div>
                </aside>
            </section>

            <section className="sales-history-section">
                <div className="sales-panel-header">
                    <div>
                        <h2>
                            Sales History
                        </h2>

                        <p>
                            View completed
                            transactions.
                        </p>
                    </div>

                    <button
                        className="sales-refresh-button"
                        onClick={
                            loadSales
                        }
                    >
                        Refresh
                    </button>
                </div>

                {salesLoading ? (
                    <div className="sales-empty-state">
                        <p>
                            Loading sales
                            history...
                        </p>
                    </div>
                ) : sales.length === 0 ? (
                    <div className="sales-empty-state">
                        <p>
                            No sales
                            transactions
                            found.
                        </p>
                    </div>
                ) : (
                    <div className="sales-history-table-container">
                        <table className="sales-history-table">
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
                                {sales.map(
                                    (sale) => (
                                        <tr
                                            key={
                                                sale.sale_id
                                            }
                                        >
                                            <td>
                                                <strong>
                                                    #
                                                    {
                                                        sale.sale_id
                                                    }
                                                </strong>
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
                                                <span className="payment-badge">
                                                    {
                                                        sale.payment_method
                                                    }
                                                </span>
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

export default Sales;
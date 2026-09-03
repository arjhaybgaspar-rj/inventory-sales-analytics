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

    useEffect(() => {
        loadProducts();
        loadSales();
    }, []);

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
                item.product_id ===
                product.product_id
        );

        if (existingItem) {
            setCart(
                cart.map((item) =>
                    item.product_id ===
                    product.product_id
                        ? {
                              ...item,
                              quantity:
                                  item.quantity + 1
                          }
                        : item
                )
            );

            return;
        }

        setCart([
            ...cart,
            {
                product_id:
                    product.product_id,
                product_name:
                    product.product_name,
                barcode:
                    product.barcode,
                selling_price:
                    Number(
                        product.selling_price
                    ),
                quantity: 1
            }
        ]);
    };

    const updateQuantity = (
        productId,
        quantity
    ) => {
        const newQuantity =
            Number(quantity);

        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCart(
            cart.map((item) =>
                item.product_id ===
                productId
                    ? {
                          ...item,
                          quantity:
                              newQuantity
                      }
                    : item
            )
        );
    };

    const removeFromCart = (
        productId
    ) => {
        setCart(
            cart.filter(
                (item) =>
                    item.product_id !==
                    productId
            )
        );
    };

    const clearCart = () => {
        setCart([]);
        setMessage("");
    };

    const totalAmount =
        cart.reduce(
            (total, item) =>
                total +
                Number(
                    item.selling_price
                ) *
                    Number(
                        item.quantity
                    ),
            0
        );

    const processSale = async () => {
        if (cart.length === 0) {
            setMessage(
                "Cart is empty."
            );
            return;
        }

        setProcessing(true);
        setMessage("");

        try {
            const response = await fetch(
                API_BASE_URL +
                    "/api/sales",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    credentials:
                        "include",
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
            <header className="sales-header">
                <div>
                    <h1>Sales</h1>

                    <p>
                        Process sales and manage
                        customer purchases.
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

            <section className="sales-content">
                <div className="sales-products-section">
                    <div className="sales-section-header">
                        <div>
                            <h2>
                                Products
                            </h2>

                            <p>
                                Select a product
                                to add it to
                                the cart.
                            </p>
                        </div>

                        <button
                            onClick={
                                loadProducts
                            }
                        >
                            Refresh
                        </button>
                    </div>

                    {loading ? (
                        <p>
                            Loading products...
                        </p>
                    ) : products.length ===
                      0 ? (
                        <p>
                            No products
                            available.
                        </p>
                    ) : (
                        <div className="sales-product-grid">
                            {products.map(
                                (product) => (
                                    <div
                                        className="sales-product-card"
                                        key={
                                            product.product_id
                                        }
                                    >
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

                                        <div className="sales-product-info">
                                            <h3>
                                                {
                                                    product.product_name
                                                }
                                            </h3>

                                            <p>
                                                {product.brand ||
                                                    "No brand"}
                                            </p>

                                            <p>
                                                {
                                                    product.barcode
                                                }
                                            </p>

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
                                                Add to
                                                Cart
                                            </button>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>

                <div className="sales-cart-section">
                    <div className="sales-section-header">
                        <div>
                            <h2>
                                Cart
                            </h2>

                            <p>
                                {cart.length}{" "}
                                product
                                {cart.length !==
                                1
                                    ? "s"
                                    : ""}{" "}
                                in cart.
                            </p>
                        </div>

                        {cart.length >
                            0 && (
                            <button
                                onClick={
                                    clearCart
                                }
                            >
                                Clear Cart
                            </button>
                        )}
                    </div>

                    {cart.length ===
                    0 ? (
                        <p>
                            No products in
                            cart.
                        </p>
                    ) : (
                        <div className="sales-cart">
                            {cart.map(
                                (item) => (
                                    <div
                                        className="sales-cart-item"
                                        key={
                                            item.product_id
                                        }
                                    >
                                        <div>
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
                                        </div>

                                        <div className="sales-cart-controls">
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
                            )}
                        </div>
                    )}

                    <div className="sales-checkout">
                        <div className="payment-field">
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
                                        event
                                            .target
                                            .value
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

                        <div className="sales-total">
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
                                cart.length ===
                                    0
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
                </div>
            </section>

            <section className="sales-history-section">
                <div className="sales-section-header">
                    <div>
                        <h2>
                            Sales History
                        </h2>

                        <p>
                            View all completed
                            sales
                            transactions.
                        </p>
                    </div>

                    <button
                        onClick={
                            loadSales
                        }
                    >
                        Refresh
                    </button>
                </div>

                {salesLoading ? (
                    <p>
                        Loading sales
                        history...
                    </p>
                ) : sales.length ===
                  0 ? (
                    <p>
                        No sales
                        transactions
                        found.
                    </p>
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
                                        Total Amount
                                    </th>
                                    <th>
                                        Payment
                                        Method
                                    </th>
                                    <th>
                                        Sale Date
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

export default Sales;
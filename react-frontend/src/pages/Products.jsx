import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5000";

function Products() {
    const [barcode, setBarcode] = useState("");
    const [product, setProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [productsLoading, setProductsLoading] = useState(true);
    const [sellingPrice, setSellingPrice] = useState("");

    const loadProducts = async () => {
        setProductsLoading(true);

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

        setProductsLoading(false);
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const handleBarcodeLookup = async () => {
        if (!barcode.trim()) {
            setMessage("Enter a barcode.");
            return;
        }

        setLoading(true);
        setMessage("");
        setProduct(null);
        setSellingPrice("");

        try {
            const response = await fetch(
                API_BASE_URL +
                    "/api/barcode/lookup?barcode=" +
                    encodeURIComponent(barcode),
                {
                    credentials: "include"
                }
            );

            const data = await response.json();

            if (data.success) {
                setProduct(data.product);
                setMessage(data.message);

                if (
                    data.product.selling_price !== null &&
                    data.product.selling_price !== undefined
                ) {
                    setSellingPrice(
                        data.product.selling_price
                    );
                }
            } else {
                setMessage(
                    data.message ||
                        "Product not found."
                );
            }
        } catch (error) {
            setMessage(
                "Unable to connect to the backend."
            );
        }

        setLoading(false);
    };

    const handleAddProduct = async () => {
        if (!product) {
            setMessage(
                "Search for a product first."
            );
            return;
        }

        if (product.product_id) {
            setMessage(
                "This product is already in your product list."
            );
            return;
        }

        if (
            !sellingPrice ||
            Number(sellingPrice) <= 0
        ) {
            setMessage(
                "Enter a valid selling price."
            );
            return;
        }

        setSaving(true);
        setMessage("");

        try {
            const response = await fetch(
                API_BASE_URL + "/api/products",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        barcode: product.barcode,
                        product_name:
                            product.product_name,
                        brand: product.brand,
                        category: product.category,
                        unit: product.unit,
                        selling_price:
                            Number(sellingPrice),
                        image_url: product.image_url,
                        api_source:
                            product.api_source
                    })
                }
            );

            const data = await response.json();

            if (data.success) {
                const savedProduct = {
                    ...product,
                    product_id: data.product_id,
                    selling_price:
                        Number(sellingPrice),
                    status: "active"
                };

                setProduct(savedProduct);
                setSellingPrice(
                    Number(sellingPrice)
                );
                setMessage(
                    "Product added successfully."
                );

                await loadProducts();
            } else {
                setMessage(
                    data.message ||
                        "Unable to add product."
                );
            }
        } catch (error) {
            setMessage(
                "Unable to connect to the backend."
            );
        }

        setSaving(false);
    };

    const handleClearSearch = () => {
        setBarcode("");
        setProduct(null);
        setSellingPrice("");
        setMessage("");
    };

    return (
        <main className="products-page">
            <header className="products-header">
                <div>
                    <h1>Products</h1>

                    <p>
                        Manage products and barcode
                        information.
                    </p>
                </div>
            </header>

            <section className="barcode-section">
                <h2>Barcode Lookup</h2>

                <div className="barcode-form">
                    <input
                        type="text"
                        value={barcode}
                        onChange={(event) =>
                            setBarcode(
                                event.target.value
                            )
                        }
                        onKeyDown={(event) => {
                            if (
                                event.key ===
                                "Enter"
                            ) {
                                handleBarcodeLookup();
                            }
                        }}
                        placeholder="Enter product barcode"
                    />

                    <button
                        onClick={
                            handleBarcodeLookup
                        }
                        disabled={loading}
                    >
                        {loading
                            ? "Searching..."
                            : "Search"}
                    </button>

                    <button
                        onClick={
                            handleClearSearch
                        }
                        disabled={loading}
                    >
                        Clear
                    </button>
                </div>

                {message && <p>{message}</p>}
            </section>

            {product && (
                <section className="product-result">
                    <h2>Product Information</h2>

                    {product.image_url && (
                        <img
                            src={
                                product.image_url
                            }
                            alt={
                                product.product_name
                            }
                            className="product-image"
                        />
                    )}

                    <div className="product-details">
                        <p>
                            <strong>
                                Product:
                            </strong>{" "}
                            {
                                product.product_name
                            }
                        </p>

                        <p>
                            <strong>
                                Barcode:
                            </strong>{" "}
                            {product.barcode}
                        </p>

                        <p>
                            <strong>
                                Brand:
                            </strong>{" "}
                            {product.brand ||
                                "N/A"}
                        </p>

                        <p>
                            <strong>
                                Category:
                            </strong>{" "}
                            {product.category ||
                                "N/A"}
                        </p>

                        <p>
                            <strong>
                                Unit:
                            </strong>{" "}
                            {product.unit ||
                                "N/A"}
                        </p>

                        <div className="price-field">
                            <label htmlFor="sellingPrice">
                                Selling Price
                            </label>

                            <input
                                type="number"
                                id="sellingPrice"
                                value={
                                    sellingPrice
                                }
                                onChange={(event) =>
                                    setSellingPrice(
                                        event.target
                                            .value
                                    )
                                }
                                placeholder="Enter selling price"
                                min="0"
                                step="0.01"
                                disabled={Boolean(
                                    product.product_id
                                )}
                            />
                        </div>

                        <p>
                            <strong>
                                Source:
                            </strong>{" "}
                            {product.api_source ||
                                "N/A"}
                        </p>

                        {product.product_id ? (
                            <p>
                                <strong>
                                    Status:
                                </strong>{" "}
                                Already in
                                product list
                            </p>
                        ) : (
                            <button
                                onClick={
                                    handleAddProduct
                                }
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : "Add Product"}
                            </button>
                        )}
                    </div>
                </section>
            )}

            <section className="products-list-section">
                <div className="products-list-header">
                    <div>
                        <h2>
                            Product List
                        </h2>

                        <p>
                            {products.length}{" "}
                            product
                            {products.length !==
                            1
                                ? "s"
                                : ""}{" "}
                            in your product
                            list.
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

                {productsLoading ? (
                    <p>
                        Loading products...
                    </p>
                ) : products.length ===
                  0 ? (
                    <p>
                        No products found.
                    </p>
                ) : (
                    <div className="products-table-container">
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>
                                        Image
                                    </th>
                                    <th>
                                        Product
                                    </th>
                                    <th>
                                        Barcode
                                    </th>
                                    <th>
                                        Brand
                                    </th>
                                    <th>
                                        Category
                                    </th>
                                    <th>
                                        Unit
                                    </th>
                                    <th>
                                        Selling Price
                                    </th>
                                    <th>
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {products.map(
                                    (item) => (
                                        <tr
                                            key={
                                                item.product_id
                                            }
                                        >
                                            <td>
                                                {item.image_url ? (
                                                    <img
                                                        src={
                                                            item.image_url
                                                        }
                                                        alt={
                                                            item.product_name
                                                        }
                                                        className="product-table-image"
                                                    />
                                                ) : (
                                                    "No image"
                                                )}
                                            </td>

                                            <td>
                                                {
                                                    item.product_name
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item.barcode
                                                }
                                            </td>

                                            <td>
                                                {item.brand ||
                                                    "N/A"}
                                            </td>

                                            <td>
                                                {item.category ||
                                                    "N/A"}
                                            </td>

                                            <td>
                                                {item.unit ||
                                                    "N/A"}
                                            </td>

                                            <td>
                                                ₱
                                                {Number(
                                                    item.selling_price
                                                ).toFixed(
                                                    2
                                                )}
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        item.status ===
                                                        "active"
                                                            ? "status-active"
                                                            : "status-inactive"
                                                    }
                                                >
                                                    {
                                                        item.status
                                                    }
                                                </span>
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

export default Products;
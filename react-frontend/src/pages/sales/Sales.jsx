import {
    AlertCircle,
    Banknote,
    Barcode,
    CheckCircle2,
    CircleDollarSign,
    CreditCard,
    History,
    Minus,
    Package,
    Plus,
    ReceiptText,
    RefreshCw,
    Search,
    ShoppingBag,
    ShoppingCart,
    Smartphone,
    Sparkles,
    Trash2,
    X
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    API_URL
} from "../../services/api";

import {
    formatProductBrand,
    formatProductCategory
} from "../../utils/productDisplay";

import "./Sales.css";


const PAYMENT_METHODS = [
    {
        value: "cash",
        label: "Cash",
        description: "Cash payment",
        icon: Banknote
    },
    {
        value: "gcash",
        label: "GCash",
        description: "Digital wallet",
        icon: Smartphone
    },
    {
        value: "card",
        label: "Card",
        description: "Debit or credit",
        icon: CreditCard
    }
];


function Sales() {
    const [
        products,
        setProducts
    ] = useState([]);

    const [
        sales,
        setSales
    ] = useState([]);

    const [
        cart,
        setCart
    ] = useState([]);

    const [
        searchTerm,
        setSearchTerm
    ] = useState("");

    const [
        salesSearch,
        setSalesSearch
    ] = useState("");

    const [
        paymentMethod,
        setPaymentMethod
    ] = useState("cash");

    const [
        productsLoading,
        setProductsLoading
    ] = useState(true);

    const [
        salesLoading,
        setSalesLoading
    ] = useState(true);

    const [
        processing,
        setProcessing
    ] = useState(false);

    const [
        message,
        setMessage
    ] = useState("");

    const [
        messageType,
        setMessageType
    ] = useState("success");

    const [
        completedSale,
        setCompletedSale
    ] = useState(null);


    const showMessage = (
        text,
        type = "success"
    ) => {
        setMessage(text);
        setMessageType(type);
    };


    const loadProducts =
        async () => {
            setProductsLoading(true);

            try {
                const response =
                    await fetch(
                        `${API_URL}/products`,
                        {
                            credentials:
                                "include"
                        }
                    );

                const data =
                    await response.json();

                if (
                    response.ok &&
                    data.success
                ) {
                    setProducts(
                        Array.isArray(
                            data.products
                        )
                            ? data.products
                            : []
                    );
                } else {
                    showMessage(
                        data.message ||
                            "Unable to load products.",
                        "error"
                    );
                }
            } catch (error) {
                console.error(
                    "Products error:",
                    error
                );

                showMessage(
                    "Unable to connect to the backend.",
                    "error"
                );
            } finally {
                setProductsLoading(false);
            }
        };


    const loadSales =
        async () => {
            setSalesLoading(true);

            try {
                const response =
                    await fetch(
                        `${API_URL}/sales`,
                        {
                            credentials:
                                "include"
                        }
                    );

                const data =
                    await response.json();

                if (
                    response.ok &&
                    data.success
                ) {
                    setSales(
                        Array.isArray(
                            data.sales
                        )
                            ? data.sales
                            : []
                    );
                } else {
                    showMessage(
                        data.message ||
                            "Unable to load sales history.",
                        "error"
                    );
                }
            } catch (error) {
                console.error(
                    "Sales history error:",
                    error
                );

                showMessage(
                    "Unable to load sales history.",
                    "error"
                );
            } finally {
                setSalesLoading(false);
            }
        };


    const refreshAll =
        async () => {
            await Promise.all([
                loadProducts(),
                loadSales()
            ]);
        };


    useEffect(() => {
        refreshAll();
    }, []);


    const filteredProducts =
        useMemo(() => {
            const search =
                searchTerm
                    .trim()
                    .toLowerCase();

            if (!search) {
                return products;
            }

            return products.filter(
                (product) => {
                    const rawBrand =
                        String(
                            product.brand ||
                                ""
                        ).toLowerCase();

                    const rawCategory =
                        String(
                            product.category ||
                                ""
                        ).toLowerCase();

                    const cleanBrand =
                        formatProductBrand(
                            product.brand
                        ).toLowerCase();

                    const cleanCategory =
                        formatProductCategory(
                            product.category
                        ).toLowerCase();

                    return (
                        String(
                            product.product_name ||
                                ""
                        )
                            .toLowerCase()
                            .includes(search) ||
                        String(
                            product.barcode ||
                                ""
                        )
                            .toLowerCase()
                            .includes(search) ||
                        rawBrand.includes(
                            search
                        ) ||
                        cleanBrand.includes(
                            search
                        ) ||
                        rawCategory.includes(
                            search
                        ) ||
                        cleanCategory.includes(
                            search
                        )
                    );
                }
            );
        }, [
            products,
            searchTerm
        ]);


    const filteredSales =
        useMemo(() => {
            const search =
                salesSearch
                    .trim()
                    .toLowerCase();

            if (!search) {
                return sales;
            }

            return sales.filter(
                (sale) => {
                    const cashierName =
                        sale.full_name ||
                        sale.username ||
                        sale.user_name ||
                        "";

                    return (
                        String(
                            sale.sale_id ||
                                ""
                        )
                            .toLowerCase()
                            .includes(search) ||
                        cashierName
                            .toLowerCase()
                            .includes(search) ||
                        String(
                            sale.payment_method ||
                                ""
                        )
                            .toLowerCase()
                            .includes(search)
                    );
                }
            );
        }, [
            sales,
            salesSearch
        ]);


    const cartItemCount =
        useMemo(() => {
            return cart.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    Number(
                        item.quantity ||
                            0
                    ),
                0
            );
        }, [cart]);


    const cartTotal =
        useMemo(() => {
            return cart.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    Number(
                        item.selling_price ||
                            0
                    ) *
                        Number(
                            item.quantity ||
                                0
                        ),
                0
            );
        }, [cart]);


    const recordedRevenue =
        useMemo(() => {
            return sales.reduce(
                (
                    total,
                    sale
                ) =>
                    total +
                    Number(
                        sale.total_amount ||
                            0
                    ),
                0
            );
        }, [sales]);


    const addToCart = (
        product
    ) => {
        setMessage("");

        setCart(
            (currentCart) => {
                const existingItem =
                    currentCart.find(
                        (item) =>
                            item.product_id ===
                            product.product_id
                    );

                if (existingItem) {
                    return currentCart.map(
                        (item) =>
                            item.product_id ===
                            product.product_id
                                ? {
                                      ...item,
                                      quantity:
                                          Number(
                                              item.quantity
                                          ) + 1
                                  }
                                : item
                    );
                }

                return [
                    ...currentCart,
                    {
                        ...product,
                        quantity: 1
                    }
                ];
            }
        );
    };


    const increaseQuantity = (
        productId
    ) => {
        setCart(
            (currentCart) =>
                currentCart.map(
                    (item) =>
                        item.product_id ===
                        productId
                            ? {
                                  ...item,
                                  quantity:
                                      Number(
                                          item.quantity
                                      ) + 1
                              }
                            : item
                )
        );
    };


    const decreaseQuantity = (
        productId
    ) => {
        setCart(
            (currentCart) =>
                currentCart
                    .map(
                        (item) =>
                            item.product_id ===
                            productId
                                ? {
                                      ...item,
                                      quantity:
                                          Number(
                                              item.quantity
                                          ) - 1
                                  }
                                : item
                    )
                    .filter(
                        (item) =>
                            Number(
                                item.quantity
                            ) > 0
                    )
        );
    };


    const updateQuantity = (
        productId,
        value
    ) => {
        const quantityValue =
            Number(value);

        if (
            !Number.isInteger(
                quantityValue
            ) ||
            quantityValue < 1
        ) {
            return;
        }

        setCart(
            (currentCart) =>
                currentCart.map(
                    (item) =>
                        item.product_id ===
                        productId
                            ? {
                                  ...item,
                                  quantity:
                                      quantityValue
                              }
                            : item
                )
        );
    };


    const removeFromCart = (
        productId
    ) => {
        setCart(
            (currentCart) =>
                currentCart.filter(
                    (item) =>
                        item.product_id !==
                        productId
                )
        );
    };


    const clearCart = () => {
        if (processing) {
            return;
        }

        setCart([]);
        setMessage("");
    };


    const getPaymentLabel = (
        value
    ) => {
        const method =
            PAYMENT_METHODS.find(
                (item) =>
                    item.value ===
                    value
            );

        return method
            ? method.label
            : value;
    };


    const getFriendlySaleError = (
        value
    ) => {
        const rawMessage =
            String(
                value ||
                    "Unable to process the sale."
            );

        const normalized =
            rawMessage.toLowerCase();


        if (
            normalized.includes(
                "insufficient"
            ) &&
            normalized.includes(
                "stock"
            )
        ) {
            return (
                "Insufficient stock for one or more products in this order. " +
                "Adjust the cart quantity and try again."
            );
        }


        if (
            normalized.includes(
                "not enough"
            ) &&
            normalized.includes(
                "stock"
            )
        ) {
            return (
                "There is not enough available stock to complete this order. " +
                "Reduce the requested quantity and try again."
            );
        }


        if (
            normalized.includes(
                "expired"
            )
        ) {
            return (
                "The product does not have enough eligible non-expired stock " +
                "to complete this transaction."
            );
        }


        return rawMessage;
    };


    const processSale =
        async () => {
            if (
                processing
            ) {
                return;
            }


            if (
                cart.length === 0
            ) {
                showMessage(
                    "Add at least one product before processing the sale.",
                    "error"
                );

                return;
            }


            const orderSnapshot = {
                items:
                    cart.map(
                        (item) => ({
                            ...item
                        })
                    ),

                itemCount:
                    cartItemCount,

                total:
                    cartTotal,

                paymentMethod,

                completedAt:
                    new Date()
            };


            setProcessing(true);
            setMessage("");


            try {
                const response =
                    await fetch(
                        `${API_URL}/sales`,
                        {
                            method:
                                "POST",

                            credentials:
                                "include",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    payment_method:
                                        paymentMethod,

                                    items:
                                        cart.map(
                                            (
                                                item
                                            ) => ({
                                                product_id:
                                                    item.product_id,

                                                quantity:
                                                    Number(
                                                        item.quantity
                                                    )
                                            })
                                        )
                                })
                        }
                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {
                    showMessage(
                        getFriendlySaleError(
                            data.message
                        ),
                        "error"
                    );

                    return;
                }


                setCompletedSale({
                    ...orderSnapshot,

                    saleId:
                        data.sale_id ??
                        data.id ??
                        null,

                    backendTotal:
                        data.total_amount ??
                        null
                });


                setCart([]);

                setPaymentMethod(
                    "cash"
                );


                await Promise.all([
                    loadProducts(),
                    loadSales()
                ]);
            } catch (error) {
                console.error(
                    "Process sale error:",
                    error
                );

                showMessage(
                    "Unable to connect to the backend. The transaction was not completed.",
                    "error"
                );
            } finally {
                setProcessing(false);
            }
        };


    const formatCurrency = (
        value
    ) => {
        return new Intl.NumberFormat(
            "en-PH",
            {
                style:
                    "currency",

                currency:
                    "PHP",

                minimumFractionDigits:
                    2
            }
        ).format(
            Number(value || 0)
        );
    };


    const formatDateTime = (
        value
    ) => {
        if (!value) {
            return "N/A";
        }

        return new Intl.DateTimeFormat(
            "en-PH",
            {
                month:
                    "short",

                day:
                    "numeric",

                year:
                    "numeric",

                hour:
                    "numeric",

                minute:
                    "2-digit"
            }
        ).format(
            new Date(value)
        );
    };


    const getCashierName = (
        sale
    ) => {
        return (
            sale.full_name ||
            sale.username ||
            sale.user_name ||
            "User"
        );
    };


    return (
        <div className="modern-sales-page">
            <header className="sales-modern-header">
                <div>
                    <span className="sales-modern-eyebrow">
                        <Sparkles
                            size={15}
                            strokeWidth={2}
                        />

                        Point of Sale
                    </span>

                    <h1>
                        Sales
                    </h1>

                    <p>
                        Process customer
                        purchases, manage the
                        current order, and
                        review completed
                        transactions.
                    </p>
                </div>


                <button
                    type="button"
                    className="sales-header-refresh"
                    onClick={
                        refreshAll
                    }
                    disabled={
                        productsLoading ||
                        salesLoading ||
                        processing
                    }
                >
                    <RefreshCw
                        size={17}
                        strokeWidth={2}
                        className={
                            productsLoading ||
                            salesLoading
                                ? "sales-spin"
                                : ""
                        }
                    />

                    Refresh
                </button>
            </header>


            <section className="sales-summary-grid">
                <article className="sales-summary-card">
                    <div className="sales-summary-icon sales-summary-blue">
                        <Package
                            size={21}
                            strokeWidth={1.9}
                        />
                    </div>

                    <div>
                        <span>
                            Catalog Products
                        </span>

                        <strong>
                            {
                                products.length
                            }
                        </strong>
                    </div>
                </article>


                <article className="sales-summary-card">
                    <div className="sales-summary-icon sales-summary-green">
                        <ShoppingBag
                            size={21}
                            strokeWidth={1.9}
                        />
                    </div>

                    <div>
                        <span>
                            Cart Items
                        </span>

                        <strong>
                            {
                                cartItemCount
                            }
                        </strong>
                    </div>
                </article>


                <article className="sales-summary-card">
                    <div className="sales-summary-icon sales-summary-purple">
                        <CircleDollarSign
                            size={21}
                            strokeWidth={1.9}
                        />
                    </div>

                    <div>
                        <span>
                            Current Order
                        </span>

                        <strong className="sales-summary-money">
                            {formatCurrency(
                                cartTotal
                            )}
                        </strong>
                    </div>
                </article>


                <article className="sales-summary-card">
                    <div className="sales-summary-icon sales-summary-orange">
                        <ReceiptText
                            size={21}
                            strokeWidth={1.9}
                        />
                    </div>

                    <div>
                        <span>
                            Completed Sales
                        </span>

                        <strong>
                            {
                                sales.length
                            }
                        </strong>
                    </div>
                </article>
            </section>


            {message && (
                <div
                    className={
                        messageType ===
                        "error"
                            ? "sales-page-message sales-page-message-error"
                            : "sales-page-message sales-page-message-success"
                    }
                >
                    {messageType ===
                    "success" ? (
                        <CheckCircle2
                            size={19}
                            strokeWidth={2}
                        />
                    ) : (
                        <AlertCircle
                            size={19}
                            strokeWidth={2}
                        />
                    )}

                    <span>
                        {message}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setMessage("")
                        }
                        aria-label="Dismiss message"
                    >
                        <X
                            size={16}
                            strokeWidth={2}
                        />
                    </button>
                </div>
            )}


            <section className="sales-pos-grid">
                <div className="sales-products-panel">
                    <div className="sales-panel-header">
                        <div>
                            <span className="sales-panel-eyebrow">
                                Product Catalog
                            </span>

                            <h2>
                                Select Products
                            </h2>

                            <p>
                                Search the
                                catalog and add
                                products to the
                                current order.
                            </p>
                        </div>


                        <button
                            type="button"
                            className="sales-panel-refresh"
                            onClick={
                                loadProducts
                            }
                            disabled={
                                productsLoading ||
                                processing
                            }
                        >
                            <RefreshCw
                                size={16}
                                strokeWidth={2}
                                className={
                                    productsLoading
                                        ? "sales-spin"
                                        : ""
                                }
                            />

                            Refresh
                        </button>
                    </div>


                    <div className="sales-product-search">
                        <Search
                            size={19}
                            strokeWidth={1.9}
                        />

                        <input
                            type="text"
                            value={
                                searchTerm
                            }
                            onChange={(
                                event
                            ) =>
                                setSearchTerm(
                                    event.target
                                        .value
                                )
                            }
                            placeholder="Search by product name, barcode, brand, or category..."
                        />

                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() =>
                                    setSearchTerm(
                                        ""
                                    )
                                }
                                aria-label="Clear product search"
                            >
                                <X
                                    size={16}
                                    strokeWidth={2}
                                />
                            </button>
                        )}
                    </div>


                    {productsLoading ? (
                        <div className="sales-loading-state">
                            <span className="sales-loading-spinner" />

                            Loading products...
                        </div>
                    ) : filteredProducts.length ===
                      0 ? (
                        <div className="sales-empty-state">
                            <Package
                                size={39}
                                strokeWidth={1.4}
                            />

                            <strong>
                                {searchTerm
                                    ? "No matching products"
                                    : "No products available"}
                            </strong>

                            <span>
                                {searchTerm
                                    ? "Try another product name, barcode, brand, or category."
                                    : "Registered products will appear here."}
                            </span>
                        </div>
                    ) : (
                        <div className="sales-product-grid">
                            {filteredProducts.map(
                                (
                                    product
                                ) => {
                                    const cartItem =
                                        cart.find(
                                            (
                                                item
                                            ) =>
                                                item.product_id ===
                                                product.product_id
                                        );

                                    return (
                                        <article
                                            className="sales-product-card"
                                            key={
                                                product.product_id
                                            }
                                        >
                                            <div className="sales-product-image-area">
                                                <div className="sales-product-image">
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
                                                        <Package
                                                            size={36}
                                                            strokeWidth={1.5}
                                                        />
                                                    )}
                                                </div>

                                                {cartItem && (
                                                    <span className="sales-product-cart-badge">
                                                        {
                                                            cartItem.quantity
                                                        }{" "}
                                                        in cart
                                                    </span>
                                                )}
                                            </div>


                                            <div className="sales-product-info">
                                                <div className="sales-product-name-area">
                                                    <h3
                                                        title={
                                                            product.product_name
                                                        }
                                                    >
                                                        {
                                                            product.product_name
                                                        }
                                                    </h3>

                                                    <p
                                                        title={
                                                            product.brand ||
                                                            ""
                                                        }
                                                    >
                                                        {formatProductBrand(
                                                            product.brand
                                                        )}
                                                    </p>
                                                </div>


                                                <div className="sales-product-category">
                                                    {formatProductCategory(
                                                        product.category
                                                    )}
                                                </div>


                                                <div className="sales-product-barcode">
                                                    <Barcode
                                                        size={14}
                                                        strokeWidth={1.8}
                                                    />

                                                    <span>
                                                        {
                                                            product.barcode
                                                        }
                                                    </span>
                                                </div>


                                                <div className="sales-product-bottom">
                                                    <strong className="sales-product-price">
                                                        {formatCurrency(
                                                            product.selling_price
                                                        )}
                                                    </strong>

                                                    <button
                                                        type="button"
                                                        className="sales-product-add-button"
                                                        onClick={() =>
                                                            addToCart(
                                                                product
                                                            )
                                                        }
                                                        disabled={
                                                            processing
                                                        }
                                                    >
                                                        <Plus
                                                            size={17}
                                                            strokeWidth={2}
                                                        />

                                                        Add
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                }
                            )}
                        </div>
                    )}
                </div>


                <aside className="sales-order-panel">
                    <div className="sales-order-heading">
                        <div>
                            <span className="sales-panel-eyebrow">
                                Current Order
                            </span>

                            <h2>
                                Cart
                            </h2>

                            <p>
                                {cartItemCount}{" "}
                                {cartItemCount ===
                                1
                                    ? "item"
                                    : "items"}
                            </p>
                        </div>

                        {cart.length >
                            0 && (
                            <button
                                type="button"
                                className="sales-clear-cart"
                                onClick={
                                    clearCart
                                }
                                disabled={
                                    processing
                                }
                            >
                                <Trash2
                                    size={15}
                                    strokeWidth={1.9}
                                />

                                Clear
                            </button>
                        )}
                    </div>


                    <div className="sales-cart-body">
                        {cart.length ===
                        0 ? (
                            <div className="sales-cart-empty">
                                <div className="sales-cart-empty-icon">
                                    <ShoppingCart
                                        size={33}
                                        strokeWidth={1.5}
                                    />
                                </div>

                                <strong>
                                    Your cart is
                                    empty
                                </strong>

                                <span>
                                    Select products
                                    from the catalog
                                    to begin an
                                    order.
                                </span>
                            </div>
                        ) : (
                            <div className="sales-cart-list">
                                {cart.map(
                                    (
                                        item
                                    ) => (
                                        <div
                                            className="sales-cart-item"
                                            key={
                                                item.product_id
                                            }
                                        >
                                            <div className="sales-cart-item-main">
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
                                                        <Package
                                                            size={20}
                                                            strokeWidth={1.6}
                                                        />
                                                    )}
                                                </div>

                                                <div className="sales-cart-item-info">
                                                    <strong>
                                                        {
                                                            item.product_name
                                                        }
                                                    </strong>

                                                    <span>
                                                        {formatCurrency(
                                                            item.selling_price
                                                        )}{" "}
                                                        each
                                                    </span>
                                                </div>

                                                <button
                                                    type="button"
                                                    className="sales-cart-remove"
                                                    onClick={() =>
                                                        removeFromCart(
                                                            item.product_id
                                                        )
                                                    }
                                                    disabled={
                                                        processing
                                                    }
                                                    aria-label={`Remove ${item.product_name}`}
                                                >
                                                    <Trash2
                                                        size={15}
                                                        strokeWidth={1.9}
                                                    />
                                                </button>
                                            </div>


                                            <div className="sales-cart-item-controls">
                                                <div className="sales-quantity-control">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            decreaseQuantity(
                                                                item.product_id
                                                            )
                                                        }
                                                        disabled={
                                                            processing
                                                        }
                                                        aria-label="Decrease quantity"
                                                    >
                                                        <Minus
                                                            size={15}
                                                            strokeWidth={2}
                                                        />
                                                    </button>

                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={
                                                            item.quantity
                                                        }
                                                        disabled={
                                                            processing
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            updateQuantity(
                                                                item.product_id,
                                                                event.target
                                                                    .value
                                                            )
                                                        }
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            increaseQuantity(
                                                                item.product_id
                                                            )
                                                        }
                                                        disabled={
                                                            processing
                                                        }
                                                        aria-label="Increase quantity"
                                                    >
                                                        <Plus
                                                            size={15}
                                                            strokeWidth={2}
                                                        />
                                                    </button>
                                                </div>


                                                <strong className="sales-cart-line-total">
                                                    {formatCurrency(
                                                        Number(
                                                            item.selling_price
                                                        ) *
                                                            Number(
                                                                item.quantity
                                                            )
                                                    )}
                                                </strong>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>


                    <div className="sales-payment-section">
                        <div className="sales-payment-heading">
                            <span>
                                Payment Method
                            </span>

                            <small>
                                Choose how the
                                customer will pay
                            </small>
                        </div>


                        <div className="sales-payment-options">
                            {PAYMENT_METHODS.map(
                                (
                                    method
                                ) => {
                                    const Icon =
                                        method.icon;

                                    const active =
                                        paymentMethod ===
                                        method.value;

                                    return (
                                        <button
                                            type="button"
                                            key={
                                                method.value
                                            }
                                            disabled={
                                                processing
                                            }
                                            className={
                                                active
                                                    ? "sales-payment-option active"
                                                    : "sales-payment-option"
                                            }
                                            onClick={() =>
                                                setPaymentMethod(
                                                    method.value
                                                )
                                            }
                                        >
                                            <span className="sales-payment-icon">
                                                <Icon
                                                    size={19}
                                                    strokeWidth={1.9}
                                                />
                                            </span>

                                            <span className="sales-payment-copy">
                                                <strong>
                                                    {
                                                        method.label
                                                    }
                                                </strong>

                                                <small>
                                                    {
                                                        method.description
                                                    }
                                                </small>
                                            </span>
                                        </button>
                                    );
                                }
                            )}
                        </div>
                    </div>


                    <div className="sales-order-summary">
                        <div className="sales-order-summary-row">
                            <span>
                                Unique Products
                            </span>

                            <strong>
                                {
                                    cart.length
                                }
                            </strong>
                        </div>

                        <div className="sales-order-summary-row">
                            <span>
                                Total Units
                            </span>

                            <strong>
                                {
                                    cartItemCount
                                }
                            </strong>
                        </div>

                        <div className="sales-order-total-row">
                            <div>
                                <span>
                                    Total
                                </span>

                                <small>
                                    Amount Due
                                </small>
                            </div>

                            <strong>
                                {formatCurrency(
                                    cartTotal
                                )}
                            </strong>
                        </div>


                        <button
                            type="button"
                            className="sales-process-button"
                            onClick={
                                processSale
                            }
                            disabled={
                                processing ||
                                cart.length ===
                                    0
                            }
                        >
                            {processing ? (
                                <>
                                    <span className="sales-process-spinner" />

                                    Processing
                                    Sale...
                                </>
                            ) : (
                                <>
                                    <ShoppingCart
                                        size={18}
                                        strokeWidth={2}
                                    />

                                    Process Sale

                                    <span className="sales-process-arrow">
                                        →
                                    </span>
                                </>
                            )}
                        </button>
                    </div>
                </aside>
            </section>


            <section className="sales-history-panel">
                <div className="sales-history-header">
                    <div className="sales-history-title">
                        <div className="sales-history-icon">
                            <History
                                size={22}
                                strokeWidth={1.9}
                            />
                        </div>

                        <div>
                            <span className="sales-panel-eyebrow">
                                Transaction
                                Records
                            </span>

                            <h2>
                                Sales History
                            </h2>

                            <p>
                                Review completed
                                transactions
                                recorded in the
                                system.
                            </p>
                        </div>
                    </div>


                    <div className="sales-history-actions">
                        <div className="sales-history-search">
                            <Search
                                size={17}
                                strokeWidth={1.9}
                            />

                            <input
                                type="text"
                                value={
                                    salesSearch
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSalesSearch(
                                        event.target
                                            .value
                                    )
                                }
                                placeholder="Search sale, cashier, or payment..."
                            />

                            {salesSearch && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSalesSearch(
                                            ""
                                        )
                                    }
                                    aria-label="Clear history search"
                                >
                                    <X
                                        size={15}
                                        strokeWidth={2}
                                    />
                                </button>
                            )}
                        </div>


                        <button
                            type="button"
                            className="sales-panel-refresh"
                            onClick={
                                loadSales
                            }
                            disabled={
                                salesLoading ||
                                processing
                            }
                        >
                            <RefreshCw
                                size={16}
                                strokeWidth={2}
                                className={
                                    salesLoading
                                        ? "sales-spin"
                                        : ""
                                }
                            />

                            Refresh
                        </button>
                    </div>
                </div>


                <div className="sales-history-summary">
                    <div>
                        <span>
                            Recorded
                            Transactions
                        </span>

                        <strong>
                            {
                                sales.length
                            }
                        </strong>
                    </div>

                    <div>
                        <span>
                            Recorded Revenue
                        </span>

                        <strong>
                            {formatCurrency(
                                recordedRevenue
                            )}
                        </strong>
                    </div>
                </div>


                {salesLoading ? (
                    <div className="sales-loading-state">
                        <span className="sales-loading-spinner" />

                        Loading sales
                        history...
                    </div>
                ) : filteredSales.length ===
                  0 ? (
                    <div className="sales-empty-state">
                        <ReceiptText
                            size={39}
                            strokeWidth={1.4}
                        />

                        <strong>
                            {salesSearch
                                ? "No matching transactions"
                                : "No sales recorded"}
                        </strong>

                        <span>
                            {salesSearch
                                ? "Try searching by sale ID, cashier, or payment method."
                                : "Completed transactions will appear here."}
                        </span>
                    </div>
                ) : (
                    <div className="sales-table-wrapper">
                        <table className="sales-modern-table">
                            <thead>
                                <tr>
                                    <th>
                                        Sale ID
                                    </th>

                                    <th>
                                        Cashier
                                    </th>

                                    <th>
                                        Payment
                                    </th>

                                    <th>
                                        Date & Time
                                    </th>

                                    <th>
                                        Total
                                    </th>

                                    <th>
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredSales.map(
                                    (
                                        sale
                                    ) => (
                                        <tr
                                            key={
                                                sale.sale_id
                                            }
                                        >
                                            <td>
                                                <span className="sales-id">
                                                    #
                                                    {
                                                        sale.sale_id
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                <strong className="sales-cashier">
                                                    {getCashierName(
                                                        sale
                                                    )}
                                                </strong>
                                            </td>

                                            <td>
                                                <span
                                                    className={`sales-payment-badge sales-payment-${sale.payment_method}`}
                                                >
                                                    {
                                                        sale.payment_method
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                {formatDateTime(
                                                    sale.sale_date
                                                )}
                                            </td>

                                            <td>
                                                <strong className="sales-history-total">
                                                    {formatCurrency(
                                                        sale.total_amount
                                                    )}
                                                </strong>
                                            </td>

                                            <td>
                                                <span className="sales-completed-badge">
                                                    <CheckCircle2
                                                        size={13}
                                                        strokeWidth={2}
                                                    />

                                                    Completed
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


            {completedSale && (
                <div
                    className="sales-receipt-overlay"
                    role="presentation"
                    onMouseDown={(
                        event
                    ) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setCompletedSale(
                                null
                            );
                        }
                    }}
                >
                    <section
                        className="sales-receipt-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="sales-receipt-title"
                    >
                        <div className="sales-receipt-success-icon">
                            <CheckCircle2
                                size={35}
                                strokeWidth={1.8}
                            />
                        </div>


                        <span className="sales-receipt-eyebrow">
                            Transaction Complete
                        </span>

                        <h2 id="sales-receipt-title">
                            Sale Successful
                        </h2>

                        <p className="sales-receipt-subtitle">
                            The transaction has
                            been recorded and the
                            available inventory
                            has been updated.
                        </p>


                        {completedSale.saleId && (
                            <div className="sales-receipt-number">
                                <span>
                                    Sale Reference
                                </span>

                                <strong>
                                    #
                                    {
                                        completedSale.saleId
                                    }
                                </strong>
                            </div>
                        )}


                        <div className="sales-receipt-divider" />


                        <div className="sales-receipt-items">
                            {completedSale.items.map(
                                (
                                    item
                                ) => (
                                    <div
                                        className="sales-receipt-item"
                                        key={
                                            item.product_id
                                        }
                                    >
                                        <div>
                                            <strong>
                                                {
                                                    item.product_name
                                                }
                                            </strong>

                                            <span>
                                                {
                                                    item.quantity
                                                }{" "}
                                                ×{" "}
                                                {formatCurrency(
                                                    item.selling_price
                                                )}
                                            </span>
                                        </div>

                                        <strong>
                                            {formatCurrency(
                                                Number(
                                                    item.quantity
                                                ) *
                                                    Number(
                                                        item.selling_price
                                                    )
                                            )}
                                        </strong>
                                    </div>
                                )
                            )}
                        </div>


                        <div className="sales-receipt-divider" />


                        <div className="sales-receipt-meta">
                            <div>
                                <span>
                                    Payment
                                </span>

                                <strong>
                                    {getPaymentLabel(
                                        completedSale.paymentMethod
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Total Units
                                </span>

                                <strong>
                                    {
                                        completedSale.itemCount
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Date & Time
                                </span>

                                <strong>
                                    {new Intl.DateTimeFormat(
                                        "en-PH",
                                        {
                                            month:
                                                "short",

                                            day:
                                                "numeric",

                                            year:
                                                "numeric",

                                            hour:
                                                "numeric",

                                            minute:
                                                "2-digit"
                                        }
                                    ).format(
                                        completedSale.completedAt
                                    )}
                                </strong>
                            </div>
                        </div>


                        <div className="sales-receipt-total">
                            <div>
                                <span>
                                    Amount Paid
                                </span>

                                <small>
                                    Transaction
                                    total
                                </small>
                            </div>

                            <strong>
                                {formatCurrency(
                                    completedSale.backendTotal ??
                                        completedSale.total
                                )}
                            </strong>
                        </div>


                        <button
                            type="button"
                            className="sales-receipt-done"
                            onClick={() =>
                                setCompletedSale(
                                    null
                                )
                            }
                        >
                            <CheckCircle2
                                size={18}
                                strokeWidth={2}
                            />

                            Done
                        </button>
                    </section>
                </div>
            )}
        </div>
    );
}

export default Sales;
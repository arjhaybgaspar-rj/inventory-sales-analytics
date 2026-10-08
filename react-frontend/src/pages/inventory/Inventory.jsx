import {
    AlertCircle,
    AlertTriangle,
    Archive,
    Boxes,
    CalendarDays,
    CheckCircle2,
    CircleDollarSign,
    ClipboardList,
    History,
    Package,
    Plus,
    RefreshCw,
    Search,
    Sparkles,
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
    formatProductBrand
} from "../../utils/productDisplay";

import "./Inventory.css";


function Inventory() {
    const [
        inventory,
        setInventory
    ] = useState([]);

    const [
        products,
        setProducts
    ] = useState([]);

    const [
        movements,
        setMovements
    ] = useState([]);

    const [
        alerts,
        setAlerts
    ] = useState([]);


    const [
        inventoryLoading,
        setInventoryLoading
    ] = useState(true);

    const [
        productsLoading,
        setProductsLoading
    ] = useState(true);

    const [
        movementsLoading,
        setMovementsLoading
    ] = useState(true);

    const [
        alertsLoading,
        setAlertsLoading
    ] = useState(true);

    const [
        saving,
        setSaving
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
        inventorySearch,
        setInventorySearch
    ] = useState("");

    const [
        movementSearch,
        setMovementSearch
    ] = useState("");

    const [
        alertFilter,
        setAlertFilter
    ] = useState("all");


    const [
        productId,
        setProductId
    ] = useState("");

    const [
        batchNumber,
        setBatchNumber
    ] = useState("");

    const [
        quantity,
        setQuantity
    ] = useState("");

    const [
        acquisitionCost,
        setAcquisitionCost
    ] = useState("");

    const [
        expiryDate,
        setExpiryDate
    ] = useState("");

    const [
        receivedDate,
        setReceivedDate
    ] = useState("");

    const [
        reorderLevel,
        setReorderLevel
    ] = useState("10");


    const showMessage = (
        text,
        type = "success"
    ) => {
        setMessage(text);

        setMessageType(type);
    };


    const formatCurrency = (
        value
    ) => {
        return new Intl.NumberFormat(
            "en-PH",
            {
                style: "currency",
                currency: "PHP",
                minimumFractionDigits: 2
            }
        ).format(
            Number(value || 0)
        );
    };


    const parseDateOnly = (
        value
    ) => {
        if (!value) {
            return null;
        }

        const raw =
            String(value).slice(
                0,
                10
            );

        const parts =
            raw
                .split("-")
                .map(Number);

        if (
            parts.length !== 3 ||
            parts.some(
                (part) =>
                    !Number.isFinite(
                        part
                    )
            )
        ) {
            return new Date(value);
        }

        return new Date(
            parts[0],
            parts[1] - 1,
            parts[2]
        );
    };


    const formatDate = (
        value
    ) => {
        if (!value) {
            return "N/A";
        }

        const date =
            parseDateOnly(value);

        if (
            !date ||
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "N/A";
        }

        return new Intl.DateTimeFormat(
            "en-PH",
            {
                month: "short",
                day: "numeric",
                year: "numeric"
            }
        ).format(date);
    };


    const formatDateTime = (
        value
    ) => {
        if (!value) {
            return "N/A";
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "N/A";
        }

        return new Intl.DateTimeFormat(
            "en-PH",
            {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit"
            }
        ).format(date);
    };


    const loadInventory =
        async () => {
            setInventoryLoading(
                true
            );

            try {
                const response =
                    await fetch(
                        `${API_URL}/inventory`,
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
                    setInventory(
                        Array.isArray(
                            data.inventory
                        )
                            ? data.inventory
                            : []
                    );
                } else {
                    showMessage(
                        data.message ||
                            "Unable to load inventory.",
                        "error"
                    );
                }
            } catch (error) {
                console.error(
                    "Inventory error:",
                    error
                );

                showMessage(
                    "Unable to load inventory.",
                    "error"
                );
            } finally {
                setInventoryLoading(
                    false
                );
            }
        };


    const loadProducts =
        async () => {
            setProductsLoading(
                true
            );

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
                    "Unable to load products.",
                    "error"
                );
            } finally {
                setProductsLoading(
                    false
                );
            }
        };


    const loadMovements =
        async () => {
            setMovementsLoading(
                true
            );

            try {
                const response =
                    await fetch(
                        `${API_URL}/inventory/movements`,
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
                    setMovements(
                        Array.isArray(
                            data.movements
                        )
                            ? data.movements
                            : []
                    );
                } else {
                    showMessage(
                        data.message ||
                            "Unable to load inventory history.",
                        "error"
                    );
                }
            } catch (error) {
                console.error(
                    "Movements error:",
                    error
                );

                showMessage(
                    "Unable to load inventory history.",
                    "error"
                );
            } finally {
                setMovementsLoading(
                    false
                );
            }
        };


    const loadAlerts =
        async () => {
            setAlertsLoading(
                true
            );

            try {
                const response =
                    await fetch(
                        `${API_URL}/inventory/alerts`,
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
                    setAlerts(
                        Array.isArray(
                            data.alerts
                        )
                            ? data.alerts
                            : []
                    );
                } else {
                    showMessage(
                        data.message ||
                            "Unable to load inventory alerts.",
                        "error"
                    );
                }
            } catch (error) {
                console.error(
                    "Alerts error:",
                    error
                );

                showMessage(
                    "Unable to load inventory alerts.",
                    "error"
                );
            } finally {
                setAlertsLoading(
                    false
                );
            }
        };


    const refreshAll =
        async () => {
            setMessage("");

            await Promise.all([
                loadInventory(),
                loadProducts(),
                loadMovements(),
                loadAlerts()
            ]);
        };


    useEffect(() => {
        refreshAll();
    }, []);


    const selectedProduct =
        useMemo(() => {
            if (!productId) {
                return null;
            }

            return (
                products.find(
                    (product) =>
                        Number(
                            product.product_id
                        ) ===
                        Number(
                            productId
                        )
                ) ||
                null
            );
        }, [
            products,
            productId
        ]);


    const totalStock =
        useMemo(() => {
            return inventory.reduce(
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
        }, [inventory]);


    const stockValue =
        useMemo(() => {
            return inventory.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    Number(
                        item.quantity ||
                            0
                    ) *
                        Number(
                            item.acquisition_cost ||
                                0
                        ),
                0
            );
        }, [inventory]);


    const lowStockCount =
        useMemo(() => {
            return alerts.filter(
                (alert) =>
                    alert.alert_type ===
                    "Low Stock"
            ).length;
        }, [alerts]);


    const criticalAlertCount =
        useMemo(() => {
            return alerts.filter(
                (alert) =>
                    alert.alert_type ===
                        "Out of Stock" ||
                    alert.alert_type ===
                        "Expired"
            ).length;
        }, [alerts]);


    const filteredInventory =
        useMemo(() => {
            const search =
                inventorySearch
                    .trim()
                    .toLowerCase();


            if (!search) {
                return inventory;
            }


            return inventory.filter(
                (item) => {
                    const values = [
                        item.product_name,
                        item.barcode,
                        item.batch_number,
                        item.brand,
                        item.unit
                    ];

                    return values.some(
                        (value) =>
                            String(
                                value ||
                                    ""
                            )
                                .toLowerCase()
                                .includes(
                                    search
                                )
                    );
                }
            );
        }, [
            inventory,
            inventorySearch
        ]);


    const filteredMovements =
        useMemo(() => {
            const search =
                movementSearch
                    .trim()
                    .toLowerCase();


            if (!search) {
                return movements;
            }


            return movements.filter(
                (movement) => {
                    const values = [
                        movement.product_name,
                        movement.barcode,
                        movement.batch_number,
                        movement.movement_type,
                        movement.created_by_name,
                        movement.reference_id
                    ];

                    return values.some(
                        (value) =>
                            String(
                                value ||
                                    ""
                            )
                                .toLowerCase()
                                .includes(
                                    search
                                )
                    );
                }
            );
        }, [
            movements,
            movementSearch
        ]);


    const filteredAlerts =
        useMemo(() => {
            if (
                alertFilter ===
                "all"
            ) {
                return alerts;
            }

            return alerts.filter(
                (alert) =>
                    alert.alert_type ===
                    alertFilter
            );
        }, [
            alerts,
            alertFilter
        ]);


    const resetStockInForm =
        () => {
            setProductId("");

            setBatchNumber("");

            setQuantity("");

            setAcquisitionCost("");

            setExpiryDate("");

            setReceivedDate("");

            setReorderLevel("10");
        };


    const handleStockIn =
        async (event) => {
            event.preventDefault();


            if (saving) {
                return;
            }


            if (!productId) {
                showMessage(
                    "Please select a product.",
                    "error"
                );

                return;
            }


            const quantityValue =
                Number(quantity);


            if (
                !Number.isInteger(
                    quantityValue
                ) ||
                quantityValue <= 0
            ) {
                showMessage(
                    "Quantity must be a whole number greater than zero.",
                    "error"
                );

                return;
            }


            const costValue =
                Number(
                    acquisitionCost
                );


            if (
                acquisitionCost ===
                    "" ||
                !Number.isFinite(
                    costValue
                ) ||
                costValue < 0
            ) {
                showMessage(
                    "Please enter a valid acquisition cost.",
                    "error"
                );

                return;
            }


            if (!receivedDate) {
                showMessage(
                    "Received date is required.",
                    "error"
                );

                return;
            }


            let reorderValue =
                10;


            if (
                reorderLevel !==
                ""
            ) {
                reorderValue =
                    Number(
                        reorderLevel
                    );


                if (
                    !Number.isInteger(
                        reorderValue
                    ) ||
                    reorderValue < 0
                ) {
                    showMessage(
                        "Reorder level must be zero or a positive whole number.",
                        "error"
                    );

                    return;
                }
            }


            setSaving(true);

            setMessage("");


            try {
                const response =
                    await fetch(
                        `${API_URL}/inventory/stock-in`,
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
                                    product_id:
                                        Number(
                                            productId
                                        ),

                                    batch_number:
                                        batchNumber.trim() ||
                                        null,

                                    quantity:
                                        quantityValue,

                                    acquisition_cost:
                                        costValue,

                                    expiry_date:
                                        expiryDate ||
                                        null,

                                    received_date:
                                        receivedDate,

                                    reorder_level:
                                        reorderValue
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
                        data.message ||
                            "Unable to process stock-in.",
                        "error"
                    );

                    return;
                }


                const productName =
                    selectedProduct
                        ?.product_name ||
                    "Product";


                resetStockInForm();


                await Promise.all([
                    loadInventory(),
                    loadMovements(),
                    loadAlerts()
                ]);


                showMessage(
                    `${productName}: ${quantityValue} unit${
                        quantityValue ===
                        1
                            ? ""
                            : "s"
                    } added to inventory successfully.`,
                    "success"
                );
            } catch (error) {
                console.error(
                    "Stock-in error:",
                    error
                );

                showMessage(
                    "Unable to connect to the backend. Stock-in was not completed.",
                    "error"
                );
            } finally {
                setSaving(false);
            }
        };


    const getInventoryStatus =
        (item) => {
            const quantityValue =
                Number(
                    item.quantity ||
                        0
                );

            const reorderValue =
                Number(
                    item.reorder_level ||
                        0
                );


            if (
                quantityValue ===
                0
            ) {
                return {
                    label:
                        "Out of Stock",

                    className:
                        "inventory-status-out"
                };
            }


            if (item.expiry_date) {
                const expiryDateValue =
                    parseDateOnly(
                        item.expiry_date
                    );

                const today =
                    new Date();

                today.setHours(
                    0,
                    0,
                    0,
                    0
                );


                if (
                    expiryDateValue &&
                    expiryDateValue <
                        today
                ) {
                    return {
                        label:
                            "Expired",

                        className:
                            "inventory-status-expired"
                    };
                }


                const thirtyDays =
                    new Date(today);

                thirtyDays.setDate(
                    thirtyDays.getDate() +
                        30
                );


                if (
                    expiryDateValue &&
                    expiryDateValue <=
                        thirtyDays
                ) {
                    return {
                        label:
                            "Expiring Soon",

                        className:
                            "inventory-status-expiring"
                    };
                }
            }


            if (
                quantityValue <=
                reorderValue
            ) {
                return {
                    label:
                        "Low Stock",

                    className:
                        "inventory-status-low"
                };
            }


            return {
                label:
                    "Available",

                className:
                    "inventory-status-available"
            };
        };


    const getAlertClass = (
        alertType
    ) => {
        switch (alertType) {
            case "Out of Stock":
                return "inventory-alert-out";

            case "Expired":
                return "inventory-alert-expired";

            case "Expiring Soon":
                return "inventory-alert-expiring";

            case "Low Stock":
                return "inventory-alert-low";

            default:
                return "inventory-alert-default";
        }
    };


    const getMovementClass = (
        type
    ) => {
        const normalized =
            String(
                type ||
                    ""
            ).toUpperCase();


        if (
            normalized ===
            "IN"
        ) {
            return "inventory-movement-in";
        }


        if (
            normalized ===
            "OUT"
        ) {
            return "inventory-movement-out";
        }


        return "inventory-movement-neutral";
    };


    const loadingEverything =
        inventoryLoading &&
        productsLoading &&
        movementsLoading &&
        alertsLoading;


    return (
        <div className="modern-inventory-page">
            <header className="inventory-modern-header">
                <div>
                    <span className="inventory-page-eyebrow">
                        <Sparkles
                            size={15}
                            strokeWidth={2}
                        />

                        Inventory Operations
                    </span>

                    <h1>
                        Inventory
                    </h1>

                    <p>
                        Manage stock-in
                        transactions, monitor
                        inventory levels,
                        review alerts, and track
                        stock movements.
                    </p>
                </div>


                <button
                    type="button"
                    className="inventory-header-refresh"
                    onClick={
                        refreshAll
                    }
                    disabled={
                        loadingEverything ||
                        saving
                    }
                >
                    <RefreshCw
                        size={17}
                        strokeWidth={2}
                        className={
                            inventoryLoading ||
                            alertsLoading ||
                            movementsLoading
                                ? "inventory-spin"
                                : ""
                        }
                    />

                    Refresh Inventory
                </button>
            </header>


            <section className="inventory-summary-grid">
                <article className="inventory-summary-card">
                    <div className="inventory-summary-icon inventory-summary-blue">
                        <Boxes
                            size={22}
                            strokeWidth={1.9}
                        />
                    </div>

                    <div>
                        <span>
                            Total Stock
                        </span>

                        <strong>
                            {
                                totalStock
                            }
                        </strong>

                        <small>
                            Units in inventory
                        </small>
                    </div>
                </article>


                <article className="inventory-summary-card">
                    <div className="inventory-summary-icon inventory-summary-green">
                        <Archive
                            size={22}
                            strokeWidth={1.9}
                        />
                    </div>

                    <div>
                        <span>
                            Inventory Batches
                        </span>

                        <strong>
                            {
                                inventory.length
                            }
                        </strong>

                        <small>
                            Recorded batches
                        </small>
                    </div>
                </article>


                <article className="inventory-summary-card">
                    <div className="inventory-summary-icon inventory-summary-orange">
                        <AlertTriangle
                            size={22}
                            strokeWidth={1.9}
                        />
                    </div>

                    <div>
                        <span>
                            Active Alerts
                        </span>

                        <strong>
                            {
                                alerts.length
                            }
                        </strong>

                        <small>
                            {criticalAlertCount} critical
                        </small>
                    </div>
                </article>


                <article className="inventory-summary-card">
                    <div className="inventory-summary-icon inventory-summary-purple">
                        <CircleDollarSign
                            size={22}
                            strokeWidth={1.9}
                        />
                    </div>

                    <div>
                        <span>
                            Stock Cost Value
                        </span>

                        <strong className="inventory-summary-money">
                            {formatCurrency(
                                stockValue
                            )}
                        </strong>

                        <small>
                            Acquisition value
                        </small>
                    </div>
                </article>
            </section>


            {message && (
                <div
                    className={
                        messageType ===
                        "error"
                            ? "inventory-message inventory-message-error"
                            : "inventory-message inventory-message-success"
                    }
                >
                    {messageType ===
                    "error" ? (
                        <AlertCircle
                            size={19}
                            strokeWidth={2}
                        />
                    ) : (
                        <CheckCircle2
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


            <section className="inventory-stock-panel">
                <div className="inventory-panel-heading">
                    <div className="inventory-panel-icon">
                        <Plus
                            size={22}
                            strokeWidth={2}
                        />
                    </div>

                    <div>
                        <span>
                            Stock Management
                        </span>

                        <h2>
                            Stock-In
                        </h2>

                        <p>
                            Record newly received
                            stock and create its
                            inventory batch.
                        </p>
                    </div>
                </div>


                <form
                    className="inventory-stock-form"
                    onSubmit={
                        handleStockIn
                    }
                >
                    <div className="inventory-form-grid">
                        <div className="inventory-field inventory-field-wide">
                            <label htmlFor="inventory-product">
                                Product

                                <span>
                                    Required
                                </span>
                            </label>

                            <select
                                id="inventory-product"
                                value={
                                    productId
                                }
                                onChange={(
                                    event
                                ) =>
                                    setProductId(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                disabled={
                                    productsLoading ||
                                    saving
                                }
                            >
                                <option value="">
                                    {productsLoading
                                        ? "Loading products..."
                                        : "Select a product"}
                                </option>

                                {products.map(
                                    (
                                        product
                                    ) => (
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
                                            —{" "}
                                            {
                                                product.barcode
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </div>


                        {selectedProduct && (
                            <div className="inventory-selected-product inventory-field-wide">
                                <div className="inventory-selected-image">
                                    {selectedProduct.image_url ? (
                                        <img
                                            src={
                                                selectedProduct.image_url
                                            }
                                            alt={
                                                selectedProduct.product_name
                                            }
                                        />
                                    ) : (
                                        <Package
                                            size={26}
                                            strokeWidth={1.6}
                                        />
                                    )}
                                </div>

                                <div>
                                    <span>
                                        Selected Product
                                    </span>

                                    <strong>
                                        {
                                            selectedProduct.product_name
                                        }
                                    </strong>

                                    <p>
                                        {formatProductBrand(
                                            selectedProduct.brand
                                        )}{" "}
                                        •{" "}
                                        {
                                            selectedProduct.barcode
                                        }
                                    </p>
                                </div>

                                <div className="inventory-selected-price">
                                    <span>
                                        Selling Price
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            selectedProduct.selling_price
                                        )}
                                    </strong>
                                </div>
                            </div>
                        )}


                        <div className="inventory-field">
                            <label htmlFor="inventory-batch">
                                Batch Number

                                <small>
                                    Optional
                                </small>
                            </label>

                            <input
                                id="inventory-batch"
                                type="text"
                                value={
                                    batchNumber
                                }
                                onChange={(
                                    event
                                ) =>
                                    setBatchNumber(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="e.g. BATCH-2026-001"
                                disabled={
                                    saving
                                }
                            />
                        </div>


                        <div className="inventory-field">
                            <label htmlFor="inventory-quantity">
                                Quantity

                                <span>
                                    Required
                                </span>
                            </label>

                            <input
                                id="inventory-quantity"
                                type="number"
                                min="1"
                                step="1"
                                value={
                                    quantity
                                }
                                onChange={(
                                    event
                                ) =>
                                    setQuantity(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="0"
                                disabled={
                                    saving
                                }
                            />
                        </div>


                        <div className="inventory-field">
                            <label htmlFor="inventory-cost">
                                Acquisition Cost

                                <span>
                                    Required
                                </span>
                            </label>

                            <div className="inventory-money-input">
                                <span>
                                    ₱
                                </span>

                                <input
                                    id="inventory-cost"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={
                                        acquisitionCost
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setAcquisitionCost(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="0.00"
                                    disabled={
                                        saving
                                    }
                                />
                            </div>
                        </div>


                        <div className="inventory-field">
                            <label htmlFor="inventory-reorder">
                                Reorder Level

                                <small>
                                    Default 10
                                </small>
                            </label>

                            <input
                                id="inventory-reorder"
                                type="number"
                                min="0"
                                step="1"
                                value={
                                    reorderLevel
                                }
                                onChange={(
                                    event
                                ) =>
                                    setReorderLevel(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="10"
                                disabled={
                                    saving
                                }
                            />
                        </div>


                        <div className="inventory-field">
                            <label htmlFor="inventory-received">
                                Received Date

                                <span>
                                    Required
                                </span>
                            </label>

                            <input
                                id="inventory-received"
                                type="date"
                                value={
                                    receivedDate
                                }
                                onChange={(
                                    event
                                ) =>
                                    setReceivedDate(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                disabled={
                                    saving
                                }
                            />
                        </div>


                        <div className="inventory-field">
                            <label htmlFor="inventory-expiry">
                                Expiry Date

                                <small>
                                    Optional
                                </small>
                            </label>

                            <input
                                id="inventory-expiry"
                                type="date"
                                value={
                                    expiryDate
                                }
                                onChange={(
                                    event
                                ) =>
                                    setExpiryDate(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                disabled={
                                    saving
                                }
                            />
                        </div>
                    </div>


                    <div className="inventory-form-footer">
                        <div className="inventory-form-note">
                            <ClipboardList
                                size={18}
                                strokeWidth={1.8}
                            />

                            <span>
                                Stock-in creates a
                                new inventory batch
                                and records the
                                movement in inventory
                                history.
                            </span>
                        </div>


                        <button
                            type="submit"
                            className="inventory-stock-button"
                            disabled={
                                saving
                            }
                        >
                            {saving ? (
                                <>
                                    <span className="inventory-button-spinner" />

                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Plus
                                        size={18}
                                        strokeWidth={2}
                                    />

                                    Add Stock
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </section>


            <section className="inventory-alert-panel">
                <div className="inventory-section-header">
                    <div className="inventory-section-title">
                        <div className="inventory-section-icon inventory-section-icon-warning">
                            <AlertTriangle
                                size={21}
                                strokeWidth={1.9}
                            />
                        </div>

                        <div>
                            <span>
                                Inventory Monitoring
                            </span>

                            <h2>
                                Stock & Expiry Alerts
                            </h2>

                            <p>
                                Items requiring
                                attention based on
                                stock level or
                                expiry date.
                            </p>
                        </div>
                    </div>


                    <button
                        type="button"
                        className="inventory-section-refresh"
                        onClick={
                            loadAlerts
                        }
                        disabled={
                            alertsLoading
                        }
                    >
                        <RefreshCw
                            size={16}
                            className={
                                alertsLoading
                                    ? "inventory-spin"
                                    : ""
                            }
                        />

                        Refresh
                    </button>
                </div>


                <div className="inventory-alert-overview">
                    <div>
                        <span>
                            Total Alerts
                        </span>

                        <strong>
                            {
                                alerts.length
                            }
                        </strong>
                    </div>

                    <div>
                        <span>
                            Low Stock
                        </span>

                        <strong>
                            {
                                lowStockCount
                            }
                        </strong>
                    </div>

                    <div>
                        <span>
                            Critical
                        </span>

                        <strong className="inventory-critical-number">
                            {
                                criticalAlertCount
                            }
                        </strong>
                    </div>
                </div>


                <div className="inventory-filter-tabs">
                    {[
                        {
                            value: "all",
                            label: "All"
                        },
                        {
                            value:
                                "Low Stock",
                            label:
                                "Low Stock"
                        },
                        {
                            value:
                                "Out of Stock",
                            label:
                                "Out of Stock"
                        },
                        {
                            value:
                                "Expiring Soon",
                            label:
                                "Expiring Soon"
                        },
                        {
                            value:
                                "Expired",
                            label:
                                "Expired"
                        }
                    ].map(
                        (filter) => (
                            <button
                                type="button"
                                key={
                                    filter.value
                                }
                                className={
                                    alertFilter ===
                                    filter.value
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setAlertFilter(
                                        filter.value
                                    )
                                }
                            >
                                {
                                    filter.label
                                }
                            </button>
                        )
                    )}
                </div>


                {alertsLoading ? (
                    <div className="inventory-loading-state">
                        <span className="inventory-loading-spinner" />

                        Loading inventory
                        alerts...
                    </div>
                ) : filteredAlerts.length ===
                  0 ? (
                    <div className="inventory-empty-state inventory-empty-healthy">
                        <CheckCircle2
                            size={39}
                            strokeWidth={1.4}
                        />

                        <strong>
                            No matching alerts
                        </strong>

                        <span>
                            {alertFilter ===
                            "all"
                                ? "No stock or expiry alerts are currently active."
                                : `There are no ${alertFilter.toLowerCase()} alerts.`}
                        </span>
                    </div>
                ) : (
                    <div className="inventory-table-wrapper">
                        <table className="inventory-modern-table inventory-alert-table">
                            <thead>
                                <tr>
                                    <th>
                                        Alert
                                    </th>

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
                                        Reorder
                                    </th>

                                    <th>
                                        Expiry
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredAlerts.map(
                                    (
                                        alert
                                    ) => (
                                        <tr
                                            key={
                                                alert.inventory_id
                                            }
                                        >
                                            <td>
                                                <span
                                                    className={`inventory-alert-badge ${getAlertClass(
                                                        alert.alert_type
                                                    )}`}
                                                >
                                                    {
                                                        alert.alert_type
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                <div className="inventory-product-cell">
                                                    <strong>
                                                        {
                                                            alert.product_name
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            alert.barcode
                                                        }
                                                    </span>
                                                </div>
                                            </td>

                                            <td>
                                                {alert.batch_number ||
                                                    "N/A"}
                                            </td>

                                            <td>
                                                <strong>
                                                    {
                                                        alert.quantity
                                                    }
                                                </strong>
                                            </td>

                                            <td>
                                                {
                                                    alert.reorder_level
                                                }
                                            </td>

                                            <td>
                                                {formatDate(
                                                    alert.expiry_date
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


            <section className="inventory-list-panel">
                <div className="inventory-section-header">
                    <div className="inventory-section-title">
                        <div className="inventory-section-icon">
                            <Boxes
                                size={21}
                                strokeWidth={1.9}
                            />
                        </div>

                        <div>
                            <span>
                                Current Inventory
                            </span>

                            <h2>
                                Inventory List
                            </h2>

                            <p>
                                Review current stock
                                quantities, batches,
                                costs, and expiry
                                status.
                            </p>
                        </div>
                    </div>


                    <div className="inventory-section-actions">
                        <div className="inventory-search-box">
                            <Search
                                size={17}
                                strokeWidth={1.9}
                            />

                            <input
                                type="text"
                                value={
                                    inventorySearch
                                }
                                onChange={(
                                    event
                                ) =>
                                    setInventorySearch(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="Search inventory..."
                            />

                            {inventorySearch && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setInventorySearch(
                                            ""
                                        )
                                    }
                                    aria-label="Clear inventory search"
                                >
                                    <X
                                        size={15}
                                    />
                                </button>
                            )}
                        </div>


                        <button
                            type="button"
                            className="inventory-section-refresh"
                            onClick={
                                loadInventory
                            }
                            disabled={
                                inventoryLoading
                            }
                        >
                            <RefreshCw
                                size={16}
                                className={
                                    inventoryLoading
                                        ? "inventory-spin"
                                        : ""
                                }
                            />

                            Refresh
                        </button>
                    </div>
                </div>


                {inventoryLoading ? (
                    <div className="inventory-loading-state">
                        <span className="inventory-loading-spinner" />

                        Loading inventory...
                    </div>
                ) : filteredInventory.length ===
                  0 ? (
                    <div className="inventory-empty-state">
                        <Boxes
                            size={39}
                            strokeWidth={1.4}
                        />

                        <strong>
                            {inventorySearch
                                ? "No matching inventory"
                                : "No inventory found"}
                        </strong>

                        <span>
                            {inventorySearch
                                ? "Try searching with another product name, barcode, batch, or brand."
                                : "Stock-in transactions will appear here."}
                        </span>
                    </div>
                ) : (
                    <div className="inventory-table-wrapper">
                        <table className="inventory-modern-table">
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
                                        Reorder
                                    </th>

                                    <th>
                                        Cost
                                    </th>

                                    <th>
                                        Expiry
                                    </th>

                                    <th>
                                        Received
                                    </th>

                                    <th>
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredInventory.map(
                                    (
                                        item
                                    ) => {
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
                                                    <div className="inventory-product-cell inventory-product-cell-image">
                                                        <div className="inventory-table-product-image">
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
                                                                    strokeWidth={1.5}
                                                                />
                                                            )}
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {
                                                                    item.product_name
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    item.barcode
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    {item.batch_number ||
                                                        "N/A"}
                                                </td>

                                                <td>
                                                    <strong className="inventory-quantity">
                                                        {
                                                            item.quantity
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    {
                                                        item.reorder_level
                                                    }
                                                </td>

                                                <td>
                                                    {formatCurrency(
                                                        item.acquisition_cost
                                                    )}
                                                </td>

                                                <td>
                                                    {formatDate(
                                                        item.expiry_date
                                                    )}
                                                </td>

                                                <td>
                                                    {formatDate(
                                                        item.received_date
                                                    )}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`inventory-status ${status.className}`}
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


            <section className="inventory-movement-panel">
                <div className="inventory-section-header">
                    <div className="inventory-section-title">
                        <div className="inventory-section-icon inventory-section-icon-purple">
                            <History
                                size={21}
                                strokeWidth={1.9}
                            />
                        </div>

                        <div>
                            <span>
                                Audit Trail
                            </span>

                            <h2>
                                Inventory History
                            </h2>

                            <p>
                                Track recorded
                                stock-in and
                                stock-out movements.
                            </p>
                        </div>
                    </div>


                    <div className="inventory-section-actions">
                        <div className="inventory-search-box">
                            <Search
                                size={17}
                                strokeWidth={1.9}
                            />

                            <input
                                type="text"
                                value={
                                    movementSearch
                                }
                                onChange={(
                                    event
                                ) =>
                                    setMovementSearch(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="Search movement..."
                            />

                            {movementSearch && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setMovementSearch(
                                            ""
                                        )
                                    }
                                    aria-label="Clear movement search"
                                >
                                    <X
                                        size={15}
                                    />
                                </button>
                            )}
                        </div>


                        <button
                            type="button"
                            className="inventory-section-refresh"
                            onClick={
                                loadMovements
                            }
                            disabled={
                                movementsLoading
                            }
                        >
                            <RefreshCw
                                size={16}
                                className={
                                    movementsLoading
                                        ? "inventory-spin"
                                        : ""
                                }
                            />

                            Refresh
                        </button>
                    </div>
                </div>


                {movementsLoading ? (
                    <div className="inventory-loading-state">
                        <span className="inventory-loading-spinner" />

                        Loading inventory
                        history...
                    </div>
                ) : filteredMovements.length ===
                  0 ? (
                    <div className="inventory-empty-state">
                        <History
                            size={39}
                            strokeWidth={1.4}
                        />

                        <strong>
                            {movementSearch
                                ? "No matching movements"
                                : "No inventory movements"}
                        </strong>

                        <span>
                            {movementSearch
                                ? "Try another search term."
                                : "Inventory activity will appear here."}
                        </span>
                    </div>
                ) : (
                    <div className="inventory-table-wrapper">
                        <table className="inventory-modern-table inventory-movement-table">
                            <thead>
                                <tr>
                                    <th>
                                        Movement
                                    </th>

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
                                        Reference
                                    </th>

                                    <th>
                                        User
                                    </th>

                                    <th>
                                        Date & Time
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredMovements.map(
                                    (
                                        movement
                                    ) => (
                                        <tr
                                            key={
                                                movement.movement_id
                                            }
                                        >
                                            <td>
                                                <span
                                                    className={`inventory-movement-badge ${getMovementClass(
                                                        movement.movement_type
                                                    )}`}
                                                >
                                                    {
                                                        movement.movement_type
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                <div className="inventory-product-cell">
                                                    <strong>
                                                        {
                                                            movement.product_name
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            movement.barcode
                                                        }
                                                    </span>
                                                </div>
                                            </td>

                                            <td>
                                                {movement.batch_number ||
                                                    "N/A"}
                                            </td>

                                            <td>
                                                <strong>
                                                    {
                                                        movement.quantity
                                                    }
                                                </strong>
                                            </td>

                                            <td>
                                                {movement.reference_id
                                                    ? `#${movement.reference_id}`
                                                    : "N/A"}
                                            </td>

                                            <td>
                                                {movement.created_by_name ||
                                                    "N/A"}
                                            </td>

                                            <td>
                                                {formatDateTime(
                                                    movement.created_at
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
        </div>
    );
}

export default Inventory;
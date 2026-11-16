

import {
    AlertCircle,
    AlertTriangle,
    Archive,
    Boxes,
    CheckCircle2,
    CircleDollarSign,
    History,
    Package,
    Plus,
    Search,
    X
} from "lucide-react";

import {
    useCallback,
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

const INVENTORY_PAGE_SIZE = 10;

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

    const [nearExpiryDays, setNearExpiryDays] = useState(30);
    const [nearExpiryDraft, setNearExpiryDraft] = useState("30");
    const [savingNearExpiry, setSavingNearExpiry] = useState(false);


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
        inventoryPage,
        setInventoryPage
    ] = useState(1);

    const [
        movementSearch,
        setMovementSearch
    ] = useState("");

    const [
        movementPage,
        setMovementPage
    ] = useState(1);

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
        supplierInvoiceNumber,
        setSupplierInvoiceNumber
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

    const [inventoryAction, setInventoryAction] = useState(null);
    const [expirySettingProduct, setExpirySettingProduct] = useState(null);
    const [expirySettingDraft, setExpirySettingDraft] = useState("");
    const [savingProductExpiry, setSavingProductExpiry] = useState(false);
    const [selectedMovement, setSelectedMovement] = useState(null);
    const [actionQuantity, setActionQuantity] = useState("");
    const [actionReason, setActionReason] = useState("");
    const [actionNotes, setActionNotes] = useState("");


    const showMessage = useCallback((
        text,
        type = "success"
    ) => {
        setMessage(text);

        setMessageType(type);
    }, []);


    useEffect(() => {
        if (!message) {
            return undefined;
        }

        const timeout = window.setTimeout(
            () => setMessage(""),
            messageType === "error" ? 7000 : 4500
        );

        return () => window.clearTimeout(timeout);
    }, [message, messageType]);


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


    const loadInventory = useCallback(async () => {
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
    }, [showMessage]);


    const loadProducts = useCallback(async () => {
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
    }, [showMessage]);


    const loadMovements = useCallback(async () => {
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
    }, [showMessage]);


    const loadAlerts = useCallback(async () => {
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
                const configuredDays = Number(data.near_expiry_days || 30);
                setNearExpiryDays(configuredDays);
                setNearExpiryDraft(String(configuredDays));
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
    }, [showMessage]);


    const saveNearExpiryDays = async (event) => {
        event.preventDefault();
        const days = Number(nearExpiryDraft);
        if (!Number.isInteger(days) || days < 1 || days > 365) {
            showMessage("Near-expiry threshold must be a whole number from 1 to 365 days.", "error");
            return;
        }

        setSavingNearExpiry(true);
        try {
            const response = await fetch(`${API_URL}/inventory/settings/near-expiry-days`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ near_expiry_days: days })
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || "Unable to save near-expiry threshold.");
            }
            setNearExpiryDays(Number(data.near_expiry_days));
            setNearExpiryDraft(String(data.near_expiry_days));
            showMessage(data.message || "Near-expiry threshold updated.", "success");
            await Promise.all([loadInventory(), loadAlerts()]);
        } catch (error) {
            showMessage(error.message || "Unable to save near-expiry threshold.", "error");
        } finally {
            setSavingNearExpiry(false);
        }
    };


    const openProductExpirySetting = (item) => {
        setExpirySettingProduct(item);
        setExpirySettingDraft(
            item.product_near_expiry_days == null
                ? ""
                : String(item.product_near_expiry_days)
        );
    };


    const saveProductExpirySetting = async (event) => {
        event.preventDefault();
        if (!expirySettingProduct) return;

        const days = expirySettingDraft.trim() === ""
            ? null
            : Number(expirySettingDraft);
        if (days !== null && (!Number.isInteger(days) || days < 1 || days > 365)) {
            showMessage("Enter a whole number from 1 to 365 days, or leave it blank to use the default.", "error");
            return;
        }

        setSavingProductExpiry(true);
        try {
            const response = await fetch(
                `${API_URL}/inventory/products/${expirySettingProduct.product_id}/near-expiry-days`,
                {
                    method: "PUT",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ near_expiry_days: days })
                }
            );
            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || "Unable to save the product expiry threshold.");
            }

            setExpirySettingProduct(null);
            await Promise.all([loadInventory(), loadAlerts()]);
            showMessage(data.message || "Product expiry threshold updated.", "success");
        } catch (error) {
            showMessage(error.message || "Unable to save the product expiry threshold.", "error");
        } finally {
            setSavingProductExpiry(false);
        }
    };


    const refreshAll = useCallback(async () => {
        await Promise.all([
            loadInventory(),
            loadProducts(),
            loadMovements(),
            loadAlerts()
        ]);
    }, [loadAlerts, loadInventory, loadMovements, loadProducts]);


    useEffect(() => {
        Promise.resolve().then(() => refreshAll());
    }, [refreshAll]);


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


    const productStockTotals = useMemo(() => {
        return inventory.reduce((totals, item) => {
            const productKey = String(
                item.product_id ?? item.product_name ?? item.barcode ?? ""
            );
            const quantity = Number(item.quantity) || 0;

            totals.set(
                productKey,
                (totals.get(productKey) || 0) + quantity
            );

            return totals;
        }, new Map());
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

    const inventoryPageCount =
        Math.ceil(
            filteredInventory.length /
            INVENTORY_PAGE_SIZE
        );
    const currentInventoryPage =
        Math.min(
            inventoryPage,
            Math.max(inventoryPageCount, 1)
        );
    const paginatedInventory =
        filteredInventory.slice(
            (currentInventoryPage - 1) *
            INVENTORY_PAGE_SIZE,
            currentInventoryPage *
            INVENTORY_PAGE_SIZE
        );


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
                        movement.supplier_invoice_number,
                        movement.movement_type,
                        movement.notes,
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

    const movementPageCount =
        Math.ceil(
            filteredMovements.length /
            INVENTORY_PAGE_SIZE
        );
    const currentMovementPage =
        Math.min(
            movementPage,
            Math.max(movementPageCount, 1)
        );
    const paginatedMovements =
        filteredMovements.slice(
            (currentMovementPage - 1) *
            INVENTORY_PAGE_SIZE,
            currentMovementPage *
            INVENTORY_PAGE_SIZE
        );


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

            setSupplierInvoiceNumber("");

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

                                    supplier_invoice_number:
                                        supplierInvoiceNumber.trim() ||
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
                    `${productName}: ${quantityValue} unit${quantityValue ===
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


    const openInventoryAction = (type, item) => {
        const isExpiredDisposal = type === "expired-disposal";
        setInventoryAction({ type, item });
        setActionQuantity(
            type === "adjustment" || isExpiredDisposal
                ? String(item.quantity ?? 0)
                : ""
        );
        setActionReason(isExpiredDisposal ? "expired" : "");
        setActionNotes("");
        setMessage("");
    };

    const closeInventoryAction = () => {
        if (saving) return;
        setInventoryAction(null);
        setActionQuantity("");
        setActionReason("");
        setActionNotes("");
    };

    const handleInventoryActionSubmit = async (event) => {
        event.preventDefault();
        if (!inventoryAction) return;

        const isAdjustment = inventoryAction.type === "adjustment";
        const isExpiredDisposal = inventoryAction.type === "expired-disposal";
        const quantityValue = Number(actionQuantity);
        const currentQuantity = Number(inventoryAction.item.quantity) || 0;

        if (!Number.isInteger(quantityValue) || quantityValue < (isAdjustment ? 0 : 1)) {
            showMessage(
                isAdjustment
                    ? "Counted quantity must be zero or a positive whole number."
                    : "Loss quantity must be a positive whole number.",
                "error"
            );
            return;
        }

        if (!isAdjustment && quantityValue > currentQuantity) {
            showMessage("Loss quantity cannot exceed the quantity shown for this batch.", "error");
            return;
        }

        if (!isExpiredDisposal && !actionReason.trim()) {
            showMessage("A reason is required.", "error");
            return;
        }

        setSaving(true);
        setMessage("");

        try {
            const endpoint = isAdjustment
                ? "/inventory/adjustments"
                : "/inventory/losses";
            const payload = isAdjustment
                ? {
                    batch_id: inventoryAction.item.batch_id,
                    counted_quantity: quantityValue,
                    reason: actionReason.trim(),
                    notes: actionNotes.trim()
                }
                : {
                    batch_id: inventoryAction.item.batch_id,
                    quantity: quantityValue,
                    reason: isExpiredDisposal ? "expired" : actionReason,
                    notes: actionNotes.trim()
                };

            const response = await fetch(`${API_URL}${endpoint}`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await response.json().catch(() => ({}));

            if (!response.ok || !data.success) {
                showMessage(data.message || "Unable to save this inventory record.", "error");
                return;
            }

            const actionLabel = isAdjustment
                ? "Inventory count adjustment saved."
                : isExpiredDisposal
                    ? "Expired stock disposal recorded."
                    : "Inventory loss recorded.";

            setInventoryAction(null);
            setActionQuantity("");
            setActionReason("");
            setActionNotes("");

            await Promise.all([
                loadInventory(),
                loadMovements(),
                loadAlerts()
            ]);

            showMessage(actionLabel, "success");
        } catch (error) {
            console.error("Inventory action error:", error);
            showMessage("Unable to connect to the backend. No inventory record was saved.", "error");
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

            const statuses = [];

            if (
                quantityValue ===
                0
            ) {
                statuses.push({
                    label:
                        "Out of Stock",

                    className:
                        "inventory-status-out"
                });
            }


            // Expiry is relevant while there is stock in the batch. Keep it
            // independent from the reorder check so both warnings can show.
            if (quantityValue > 0 && item.expiry_date) {
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
                    statuses.push({
                        label:
                            "Expired",

                        className:
                            "inventory-status-expired"
                    });
                } else {
                    const thresholdDays =
                        Number(item.near_expiry_days) || nearExpiryDays || 30;

                    const nearExpiryDate =
                        new Date(today);

                    nearExpiryDate.setDate(
                        nearExpiryDate.getDate() +
                        thresholdDays
                    );

                    if (
                        expiryDateValue &&
                        expiryDateValue <=
                        nearExpiryDate
                    ) {
                        statuses.push({
                            label:
                                "Expiring Soon",

                            className:
                                "inventory-status-expiring"
                        });
                    }
                }
            }


            if (
                quantityValue > 0 &&
                quantityValue <=
                reorderValue
            ) {
                statuses.push({
                    label:
                        "Low Stock",

                    className:
                        "inventory-status-low"
                });
            }


            if (statuses.length === 0) {
                statuses.push({
                    label:
                        "Available",

                    className:
                        "inventory-status-available"
                });
            }

            return statuses;
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


    return (
        <div className="modern-inventory-page">
            <header className="inventory-modern-header">
                <div>
                    <h1>
                        Inventory
                    </h1>


                </div>
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

                    </div>
                </article>
            </section>


            {message && (
                <div
                    className={
                        messageType ===
                            "error"
                            ? "inventory-toast inventory-message inventory-message-error"
                            : "inventory-toast inventory-message inventory-message-success"
                    }
                    role={messageType === "error" ? "alert" : "status"}
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
                                Supplier/Manufacturer Batch Number

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
                                placeholder="Printed lot number, or leave blank for auto-ID"
                                disabled={
                                    saving
                                }
                            />
                            <small className="inventory-field-hint">
                                Use the supplier’s batch/lot code when available. If blank, the system creates an internal ID such as B-000123.
                            </small>
                        </div>


                        <div className="inventory-field">
                            <label htmlFor="inventory-supplier-invoice">
                                Supplier Invoice / Reference Number

                                <small>
                                    Optional
                                </small>
                            </label>

                            <input
                                id="inventory-supplier-invoice"
                                type="text"
                                value={supplierInvoiceNumber}
                                onChange={(event) => setSupplierInvoiceNumber(event.target.value)}
                                maxLength={100}
                                placeholder="For example: INV-2026-00123"
                                disabled={saving}
                            />
                            <small className="inventory-field-hint">
                                Leave blank if none is available.
                            </small>
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
                                Total Acquisition Cost (entire batch)

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
                            <small className="inventory-field-hint">Enter the combined purchase cost for all units in this batch, not the per-unit price.</small>
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


                            <span>

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


                            <h2>
                                Stock & Expiry Alerts
                            </h2>


                        </div>
                    </div>
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

                <form className="inventory-expiry-setting" onSubmit={saveNearExpiryDays}>
                    <div>
                        <strong>Default near-expiry alert</strong>
                        <span>Product-specific thresholds can override this value.</span>
                    </div>
                    <label>
                        <span className="inventory-sr-only">Near-expiry threshold in days</span>
                        <input
                            type="number"
                            min="1"
                            max="365"
                            step="1"
                            value={nearExpiryDraft}
                            onChange={(event) => setNearExpiryDraft(event.target.value)}
                            disabled={savingNearExpiry || alertsLoading}
                        />
                    </label>
                    <button type="submit" disabled={savingNearExpiry || alertsLoading}>
                        {savingNearExpiry ? "Saving…" : "Save threshold"}
                    </button>
                </form>


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

                            <h2>
                                Inventory List
                            </h2>

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
                                ) => {
                                    setInventorySearch(
                                        event
                                            .target
                                            .value
                                    );
                                    setInventoryPage(1);
                                }}
                                placeholder="Search inventory..."
                            />

                            {inventorySearch && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setInventorySearch(
                                            ""
                                        );
                                        setInventoryPage(1);
                                    }}
                                    aria-label="Clear inventory search"
                                >
                                    <X
                                        size={15}
                                    />
                                </button>
                            )}
                        </div>
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
                    <>
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
                                            Batch Qty
                                        </th>

                                        <th>
                                            Product Total
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

                                        <th>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginatedInventory.map(
                                        (
                                            item
                                        ) => {
                                            const productKey = String(
                                                item.product_id ?? item.product_name ?? item.barcode ?? ""
                                            );
                                            const productTotal =
                                                productStockTotals.get(productKey) || 0;
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
                                                                <button
                                                                    type="button"
                                                                    className="inventory-product-expiry-button"
                                                                    onClick={() => openProductExpirySetting(item)}
                                                                    disabled={!item.product_id}
                                                                >
                                                                    Expiry alert: {item.product_near_expiry_days == null
                                                                        ? `Default (${item.near_expiry_days || nearExpiryDays} days)`
                                                                        : `${item.product_near_expiry_days} days`}
                                                                </button>
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
                                                        <strong className="inventory-quantity inventory-product-total">
                                                            {Number(productTotal).toLocaleString("en-PH")} units
                                                        </strong>
                                                        <span className="inventory-product-total-caption">Across all batches</span>
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
                                                        <div className="inventory-status-list">
                                                            {status.map((entry) => (
                                                                <span
                                                                    key={entry.label}
                                                                    className={`inventory-status ${entry.className}`}
                                                                >
                                                                    {entry.label}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>

                                                    <td className="inventory-row-actions-cell">
                                                        <div className="inventory-row-actions">
                                                            <button
                                                                type="button"
                                                                className="inventory-row-action inventory-row-action-adjust"
                                                                onClick={() => openInventoryAction("adjustment", item)}
                                                                disabled={saving || item.batch_status === "disposed"}
                                                            >
                                                                Adjust count
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="inventory-row-action inventory-row-action-loss"
                                                                onClick={() => openInventoryAction(status.some((entry) => entry.label === "Expired") ? "expired-disposal" : "loss", item)}
                                                                disabled={saving || item.batch_status === "disposed" || Number(item.quantity) <= 0}
                                                            >
                                                                {status.some((entry) => entry.label === "Expired") ? "Confirm disposal" : "Record loss"}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {inventoryPageCount > 1 && (
                            <nav
                                className="inventory-pagination"
                                aria-label="Inventory pages"
                            >
                                <span>
                                    Showing{" "}
                                    {(currentInventoryPage - 1) *
                                        INVENTORY_PAGE_SIZE +
                                        1}
                                    {" to "}
                                    {Math.min(
                                        currentInventoryPage *
                                        INVENTORY_PAGE_SIZE,
                                        filteredInventory.length
                                    )}{" "}
                                    of {filteredInventory.length}
                                </span>

                                <div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setInventoryPage(
                                                currentInventoryPage - 1
                                            )
                                        }
                                        disabled={currentInventoryPage === 1}
                                    >
                                        Previous
                                    </button>
                                    <span>
                                        Page {currentInventoryPage} of{" "}
                                        {inventoryPageCount}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setInventoryPage(
                                                currentInventoryPage + 1
                                            )
                                        }
                                        disabled={
                                            currentInventoryPage ===
                                            inventoryPageCount
                                        }
                                    >
                                        Next
                                    </button>
                                </div>
                            </nav>
                        )}
                    </>
                )}
            </section>


            {expirySettingProduct && (
                <div
                    className="inventory-action-backdrop"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !savingProductExpiry) {
                            setExpirySettingProduct(null);
                        }
                    }}
                >
                    <section
                        className="inventory-action-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="product-expiry-title"
                    >
                        <header className="inventory-action-header">
                            <div>
                                <span className="inventory-action-eyebrow">Product setting</span>
                                <h2 id="product-expiry-title">Expiry alert threshold</h2>
                            </div>
                            <button
                                type="button"
                                className="inventory-action-close"
                                onClick={() => setExpirySettingProduct(null)}
                                disabled={savingProductExpiry}
                                aria-label="Close expiry threshold form"
                            >
                                <X size={19} />
                            </button>
                        </header>

                        <div className="inventory-action-product">
                            <strong>{expirySettingProduct.product_name}</strong>
                            <span>Set how many days before expiry this product should be flagged.</span>
                        </div>

                        <form className="inventory-action-form" onSubmit={saveProductExpirySetting}>
                            <label className="inventory-action-field">
                                <span>Alert this many days before expiry</span>
                                <input
                                    type="number"
                                    min="1"
                                    max="365"
                                    step="1"
                                    value={expirySettingDraft}
                                    onChange={(event) => setExpirySettingDraft(event.target.value)}
                                    placeholder={`Default: ${expirySettingProduct.near_expiry_days || nearExpiryDays} days`}
                                    disabled={savingProductExpiry}
                                />
                                <small>Use 1–365 days. Leave blank to inherit the default alert.</small>
                            </label>
                            <footer className="inventory-action-footer">
                                <button
                                    type="button"
                                    className="inventory-action-cancel"
                                    onClick={() => setExpirySettingProduct(null)}
                                    disabled={savingProductExpiry}
                                >Cancel</button>
                                <button
                                    type="submit"
                                    className="inventory-action-submit"
                                    disabled={savingProductExpiry}
                                >{savingProductExpiry ? "Saving…" : "Save threshold"}</button>
                            </footer>
                        </form>
                    </section>
                </div>
            )}

            {inventoryAction && (
                <div
                    className="inventory-action-backdrop"
                    role="presentation"
                    onKeyDown={(event) => {
                        if (event.key === "Escape") {
                            setSelectedMovement(null);
                        }
                    }}
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeInventoryAction();
                        }
                    }}
                >
                    <section
                        className="inventory-action-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="inventory-action-title"
                    >
                        <header className="inventory-action-header">
                            <div>
                                <span className="inventory-action-eyebrow">
                                    {inventoryAction.type === "adjustment" ? "Physical stock count" : inventoryAction.type === "expired-disposal" ? "Expired stock disposal" : "Stock loss record"}
                                </span>
                                <h2 id="inventory-action-title">
                                    {inventoryAction.type === "adjustment" ? "Adjust inventory" : inventoryAction.type === "expired-disposal" ? "Confirm expired stock disposal" : "Record inventory loss"}
                                </h2>
                            </div>
                            <button
                                type="button"
                                className="inventory-action-close"
                                onClick={closeInventoryAction}
                                disabled={saving}
                                aria-label="Close inventory form"
                            >
                                <X size={19} />
                            </button>
                        </header>

                        <div className="inventory-action-product">
                            <strong>{inventoryAction.item.product_name}</strong>
                            <span>
                                Batch {inventoryAction.item.batch_number || "N/A"}
                                {" · "}Recorded quantity: {inventoryAction.item.quantity}
                            </span>
                        </div>

                        <form className="inventory-action-form" onSubmit={handleInventoryActionSubmit}>
                            <label className="inventory-action-field">
                                <span>
                                    {inventoryAction.type === "adjustment" ? "Counted physical quantity" : inventoryAction.type === "expired-disposal" ? "Quantity disposed" : "Quantity lost"}
                                </span>
                                <input
                                    type="number"
                                    min={inventoryAction.type === "adjustment" ? "0" : "1"}
                                    max={inventoryAction.type !== "adjustment" ? inventoryAction.item.quantity : undefined}
                                    step="1"
                                    value={actionQuantity}
                                    onChange={(event) => setActionQuantity(event.target.value)}
                                    required
                                    autoFocus
                                />
                                <small>
                                    {inventoryAction.type === "adjustment"
                                        ? "Enter the quantity physically counted for this batch."
                                        : inventoryAction.type === "expired-disposal"
                                            ? "The quantity is prefilled with the remaining batch stock. Confirm only the units physically removed."
                                            : `Cannot exceed ${inventoryAction.item.quantity} units currently recorded.`}
                                </small>
                            </label>

                            {inventoryAction.type !== "expired-disposal" && <label className="inventory-action-field">
                                <span>Reason</span>
                                {inventoryAction.type === "adjustment" ? (
                                    <input
                                        type="text"
                                        value={actionReason}
                                        onChange={(event) => setActionReason(event.target.value)}
                                        maxLength={200}
                                        placeholder="For example: physical count correction"
                                        required
                                    />
                                ) : (
                                    <select
                                        value={actionReason}
                                        onChange={(event) => setActionReason(event.target.value)}
                                        required
                                    >
                                        <option value="">Select a reason</option>
                                        <option value="damaged">Damaged</option>
                                        <option value="lost">Lost</option>
                                        <option value="spoiled">Spoiled</option>
                                        <option value="other">Other</option>
                                    </select>
                                )}
                            </label>}

                            <label className="inventory-action-field">
                                <span>Notes <small>(optional)</small></span>
                                <textarea
                                    value={actionNotes}
                                    onChange={(event) => setActionNotes(event.target.value)}
                                    rows="3"
                                    maxLength={2000}
                                    placeholder="Add context for the audit history"
                                />
                            </label>

                            {inventoryAction.type === "expired-disposal" && (
                                <p className="inventory-action-warning" role="note">
                                    This batch is already blocked from sale because it is expired. Confirming disposal will record the loss and remove the disposed quantity from inventory.
                                </p>
                            )}

                            <footer className="inventory-action-footer">
                                <button
                                    type="button"
                                    className="inventory-action-cancel"
                                    onClick={closeInventoryAction}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="inventory-action-submit"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving…"
                                        : inventoryAction.type === "adjustment"
                                            ? "Save adjustment"
                                            : inventoryAction.type === "expired-disposal"
                                                ? "Confirm disposal"
                                                : "Record loss"}
                                </button>
                            </footer>
                        </form>
                    </section>
                </div>
            )}


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


                            <h2>
                                Inventory History
                            </h2>


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
                                ) => {
                                    setMovementSearch(
                                        event
                                            .target
                                            .value
                                    );
                                    setMovementPage(1);
                                }}
                                placeholder="Search movement..."
                            />

                            {movementSearch && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMovementSearch(
                                            ""
                                        );
                                        setMovementPage(1);
                                    }}
                                    aria-label="Clear movement search"
                                >
                                    <X
                                        size={15}
                                    />
                                </button>
                            )}
                        </div>
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
                    <>
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
                                    {paginatedMovements.map(
                                        (
                                            movement
                                        ) => (
                                            <tr
                                                key={
                                                    movement.movement_id
                                                }
                                                className="inventory-movement-row"
                                                tabIndex={0}
                                                role="button"
                                                aria-label={`View ${movement.movement_type} details for ${movement.product_name || "inventory item"}`}
                                                onClick={() => setSelectedMovement(movement)}
                                                onKeyDown={(event) => {
                                                    if (event.key === "Enter" || event.key === " ") {
                                                        event.preventDefault();
                                                        setSelectedMovement(movement);
                                                    }
                                                }}
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

                        {movementPageCount > 1 && (
                            <nav
                                className="inventory-pagination"
                                aria-label="Inventory history pages"
                            >
                                <span>
                                    Showing{" "}
                                    {(currentMovementPage - 1) *
                                        INVENTORY_PAGE_SIZE +
                                        1}
                                    {" to "}
                                    {Math.min(
                                        currentMovementPage *
                                        INVENTORY_PAGE_SIZE,
                                        filteredMovements.length
                                    )}{" "}
                                    of {filteredMovements.length}
                                </span>

                                <div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setMovementPage(
                                                currentMovementPage - 1
                                            )
                                        }
                                        disabled={currentMovementPage === 1}
                                    >
                                        Previous
                                    </button>
                                    <span>
                                        Page {currentMovementPage} of{" "}
                                        {movementPageCount}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setMovementPage(
                                                currentMovementPage + 1
                                            )
                                        }
                                        disabled={
                                            currentMovementPage ===
                                            movementPageCount
                                        }
                                    >
                                        Next
                                    </button>
                                </div>
                            </nav>
                        )}
                    </>
                )}
            </section>


            {selectedMovement && (
                <div
                    className="inventory-action-backdrop"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setSelectedMovement(null);
                        }
                    }}
                >
                    <section
                        className="inventory-action-modal inventory-movement-detail-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="inventory-movement-detail-title"
                    >
                        <header className="inventory-action-header">
                            <div>
                                <span className="inventory-action-eyebrow">Inventory movement</span>
                                <h2 id="inventory-movement-detail-title">Movement details</h2>
                            </div>
                            <button
                                type="button"
                                className="inventory-action-close"
                                onClick={() => setSelectedMovement(null)}
                                aria-label="Close movement details"
                                autoFocus
                            >
                                <X size={19} />
                            </button>
                        </header>

                        <div className="inventory-movement-detail-summary">
                            <span className={`inventory-movement-badge ${getMovementClass(selectedMovement.movement_type)}`}>
                                {selectedMovement.movement_type || "Movement"}
                            </span>
                            <strong>{selectedMovement.product_name || "Unknown product"}</strong>
                            <span>{selectedMovement.barcode || "No barcode"}</span>
                        </div>

                        <dl className="inventory-movement-detail-grid">
                            <div>
                                <dt>Movement ID</dt>
                                <dd>#{selectedMovement.movement_id}</dd>
                            </div>
                            <div>
                                <dt>Batch</dt>
                                <dd>{selectedMovement.batch_number || "N/A"}</dd>
                            </div>
                            <div>
                                <dt>Supplier invoice / reference</dt>
                                <dd>{selectedMovement.supplier_invoice_number || "N/A"}</dd>
                            </div>
                            <div>
                                <dt>Quantity</dt>
                                <dd>{selectedMovement.quantity ?? "N/A"}</dd>
                            </div>
                            <div>
                                <dt>Reference ID</dt>
                                <dd>{selectedMovement.reference_id ? `#${selectedMovement.reference_id}` : "N/A"}</dd>
                            </div>
                            <div>
                                <dt>User</dt>
                                <dd>{selectedMovement.created_by_name || "N/A"}</dd>
                            </div>
                            <div>
                                <dt>Date &amp; time</dt>
                                <dd>{formatDateTime(selectedMovement.created_at)}</dd>
                            </div>
                            {selectedMovement.reason && (
                                <div>
                                    <dt>Reason</dt>
                                    <dd>{selectedMovement.reason}</dd>
                                </div>
                            )}
                            <div className="inventory-movement-detail-notes">
                                <dt>Details / notes</dt>
                                <dd>{selectedMovement.notes || "No additional details recorded."}</dd>
                            </div>
                        </dl>
                    </section>
                </div>
            )}
        </div>
    );
}

export default Inventory;

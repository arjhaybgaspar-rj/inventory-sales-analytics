import {
    AlertCircle,
    Banknote,
    Camera,
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
    useRef,
    useState
} from "react";

import {
    BrowserMultiFormatReader
} from "@zxing/browser";

import {
    API_URL
} from "../../services/api";

import ReceiptModal from "../../components/receipts/ReceiptModal.jsx";

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

const SALES_HISTORY_PAGE_SIZE = 10;


function Sales() {
    const [products, setProducts] = useState([]);
    const [sales, setSales] = useState([]);
    const [cart, setCart] = useState([]);
    const [batchLoadingIds, setBatchLoadingIds] = useState([]);
    const [selectedCatalogProductId, setSelectedCatalogProductId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [salesSearch, setSalesSearch] = useState("");
    const [salesHistoryPage, setSalesHistoryPage] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [productsLoading, setProductsLoading] = useState(true);
    const [salesLoading, setSalesLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");
    const [completedSale, setCompletedSale] = useState(null);
    const [selectedReceiptId, setSelectedReceiptId] = useState(null);

    const [scannerOpen, setScannerOpen] = useState(false);
    const [scannerLoading, setScannerLoading] = useState(false);

    const videoRef = useRef(null);
    const scannerControlsRef = useRef(null);
    const stopRequestedRef = useRef(false);
    const scanHandledRef = useRef(false);


    const showMessage = (text, type = "success") => {
        setMessage(text);
        setMessageType(type);
    };


    const loadProducts = async () => {
        setProductsLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/products`,
                {
                    credentials: "include"
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {
                setProducts(
                    Array.isArray(data.products)
                        ? data.products
                        : []
                );
            } else {
                showMessage(
                    data.message || "Unable to load products.",
                    "error"
                );
            }
        } catch (error) {
            console.error("Products error:", error);

            showMessage(
                "Unable to connect to the backend.",
                "error"
            );
        } finally {
            setProductsLoading(false);
        }
    };


    const loadSales = async () => {
        setSalesLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/sales`,
                {
                    credentials: "include"
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {
                setSales(
                    Array.isArray(data.sales)
                        ? data.sales
                        : []
                );
            } else {
                showMessage(
                    data.message || "Unable to load sales history.",
                    "error"
                );
            }
        } catch (error) {
            console.error("Sales history error:", error);

            showMessage(
                "Unable to load sales history.",
                "error"
            );
        } finally {
            setSalesLoading(false);
        }
    };


    const refreshAll = async () => {
        await Promise.all([
            loadProducts(),
            loadSales()
        ]);
    };


    useEffect(() => {
        refreshAll();
    }, []);


    const stopSalesScanner = () => {
        stopRequestedRef.current = true;

        if (scannerControlsRef.current) {
            scannerControlsRef.current.stop();
            scannerControlsRef.current = null;
        }

        setScannerOpen(false);
        setScannerLoading(false);
    };


    const startSalesScanner = () => {
        if (
            scannerOpen ||
            scannerLoading ||
            productsLoading
        ) {
            return;
        }

        if (!navigator.mediaDevices?.getUserMedia) {
            showMessage(
                "Camera access is unavailable. Use localhost or HTTPS and allow camera permission.",
                "error"
            );

            return;
        }

        if (products.length === 0) {
            showMessage(
                "There are no registered products to scan.",
                "error"
            );

            return;
        }

        setMessage("");
        stopRequestedRef.current = false;
        scanHandledRef.current = false;
        setScannerOpen(true);
    };


    useEffect(() => {
        if (!scannerOpen || !videoRef.current) {
            return;
        }

        let cancelled = false;

        const reader = new BrowserMultiFormatReader();

        const startCamera = async () => {
            setScannerLoading(true);

            try {
                const controls = await reader.decodeFromVideoDevice(
                    undefined,
                    videoRef.current,
                    (result, error) => {
                        if (
                            !result ||
                            scanHandledRef.current ||
                            cancelled
                        ) {
                            return;
                        }

                        scanHandledRef.current = true;

                        const scannedBarcode = String(
                            result.getText() || ""
                        ).trim();

                        stopRequestedRef.current = true;

                        if (scannerControlsRef.current) {
                            scannerControlsRef.current.stop();
                            scannerControlsRef.current = null;
                        }

                        setScannerOpen(false);
                        setScannerLoading(false);

                        const matchedProduct = products.find(
                            (product) =>
                                String(product.barcode || "").trim() ===
                                scannedBarcode
                        );

                        if (!matchedProduct) {
                            showMessage(
                                `Barcode ${scannedBarcode} is not registered in your product list.`,
                                "error"
                            );

                            return;
                        }

                        void addToCart(matchedProduct);
                    }
                );

                if (cancelled || stopRequestedRef.current) {
                    controls.stop();
                    return;
                }

                scannerControlsRef.current = controls;
                setScannerLoading(false);
            } catch (error) {
                if (!cancelled) {
                    console.error("Sales scanner error:", error);

                    setScannerOpen(false);
                    setScannerLoading(false);

                    showMessage(
                        "Unable to start the camera. Check camera permission and try again.",
                        "error"
                    );
                }
            }
        };

        startCamera();

        return () => {
            cancelled = true;

            stopRequestedRef.current = true;

            if (scannerControlsRef.current) {
                scannerControlsRef.current.stop();
                scannerControlsRef.current = null;
            }
        };
    }, [scannerOpen]);


    useEffect(() => {
        return () => {
            stopRequestedRef.current = true;

            if (scannerControlsRef.current) {
                scannerControlsRef.current.stop();
                scannerControlsRef.current = null;
            }
        };
    }, []);


    const filteredProducts = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        if (!search) {
            return products;
        }

        return products.filter((product) => {
            const rawBrand = String(
                product.brand || ""
            ).toLowerCase();

            const rawCategory = String(
                product.category || ""
            ).toLowerCase();

            const cleanBrand = formatProductBrand(
                product.brand
            ).toLowerCase();

            const cleanCategory = formatProductCategory(
                product.category
            ).toLowerCase();

            return (
                String(product.product_name || "")
                    .toLowerCase()
                    .includes(search) ||
                String(product.barcode || "")
                    .toLowerCase()
                    .includes(search) ||
                rawBrand.includes(search) ||
                cleanBrand.includes(search) ||
                rawCategory.includes(search) ||
                cleanCategory.includes(search)
            );
        });
    }, [products, searchTerm]);


    const filteredSales = useMemo(() => {
        const search = salesSearch.trim().toLowerCase();

        if (!search) {
            return sales;
        }

        return sales.filter((sale) => {
            const cashierName =
                sale.full_name ||
                sale.username ||
                sale.user_name ||
                "";

            return (
                String(sale.sale_id || "")
                    .toLowerCase()
                    .includes(search) ||
                cashierName.toLowerCase().includes(search) ||
                String(sale.payment_method || "")
                    .toLowerCase()
                    .includes(search)
            );
        });
    }, [sales, salesSearch]);

    const salesHistoryPageCount = Math.ceil(
        filteredSales.length / SALES_HISTORY_PAGE_SIZE
    );
    const currentSalesHistoryPage = Math.min(
        salesHistoryPage,
        Math.max(salesHistoryPageCount, 1)
    );
    const paginatedSales = filteredSales.slice(
        (currentSalesHistoryPage - 1) * SALES_HISTORY_PAGE_SIZE,
        currentSalesHistoryPage * SALES_HISTORY_PAGE_SIZE
    );


    const selectedCatalogProduct = filteredProducts.find(
        (product) => Number(product.product_id) === Number(selectedCatalogProductId)
    ) || null;


    const cartItemCount = useMemo(() => {
        return cart.reduce(
            (total, item) =>
                total + Number(item.quantity || 0),
            0
        );
    }, [cart]);


    const cartTotal = useMemo(() => {
        return cart.reduce(
            (total, item) =>
                total +
                Number(item.selling_price || 0) *
                Number(item.quantity || 0),
            0
        );
    }, [cart]);


    const recordedRevenue = useMemo(() => {
        return sales.reduce(
            (total, sale) =>
                total + Number(sale.total_amount || 0),
            0
        );
    }, [sales]);


    const loadEligibleBatches = async (productId) => {
        setBatchLoadingIds((current) =>
            current.includes(productId)
                ? current
                : [...current, productId]
        );

        try {
            const response = await fetch(
                `${API_URL}/sales/products/${productId}/eligible-batches`,
                { credentials: "include" }
            );
            const data = await response.json().catch(() => ({}));

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to load eligible batches."
                );
            }

            return {
                batches: Array.isArray(data.batches) ? data.batches : [],
                recommendedBatchId: data.recommended_batch_id ?? null
            };
        } finally {
            setBatchLoadingIds((current) =>
                current.filter((id) => id !== productId)
            );
        }
    };


    const addToCart = async (product) => {
        setMessage("");

        const existingItem = cart.find(
            (item) => item.product_id === product.product_id
        );

        if (existingItem) {
            const totalAvailable = (existingItem.eligibleBatches || []).reduce(
                (total, batch) => total + Number(batch.available_quantity || 0),
                0
            );
            const nextQuantity = Number(existingItem.quantity) + 1;

            if (
                existingItem.eligibleBatches?.length &&
                nextQuantity > totalAvailable
            ) {
                showMessage(
                    `Only ${totalAvailable} usable units are available across all batches.`,
                    "error"
                );
                return;
            }

            setCart((currentCart) =>
                currentCart.map((item) =>
                    item.product_id === product.product_id
                        ? { ...item, quantity: nextQuantity }
                        : item
                )
            );
            return;
        }

        let eligibleBatches = [];
        let selectedBatchId = null;
        let batchLoadFailed = false;

        try {
            const result = await loadEligibleBatches(product.product_id);
            eligibleBatches = result.batches;
            selectedBatchId = result.recommendedBatchId;
        } catch (error) {
            console.error("Eligible batches error:", error);
            batchLoadFailed = true;
        }

        setCart((currentCart) => {
            const alreadyAdded = currentCart.find(
                (item) => item.product_id === product.product_id
            );

            if (alreadyAdded) {
                const nextQuantity = Number(alreadyAdded.quantity) + 1;
                const available = (alreadyAdded.eligibleBatches || []).reduce(
                    (total, batch) => total + Number(batch.available_quantity || 0),
                    0
                );
                if (
                    alreadyAdded.eligibleBatches?.length &&
                    nextQuantity > available
                ) {
                    showMessage(
                        `Only ${available} usable units are available across all batches.`,
                        "error"
                    );
                    return currentCart;
                }
                return currentCart.map((item) =>
                    item.product_id === product.product_id
                        ? { ...item, quantity: nextQuantity }
                        : item
                );
            }

            return [
                ...currentCart,
                {
                    ...product,
                    quantity: 1,
                    eligibleBatches,
                    selectedBatchId,
                    batchLoadFailed
                }
            ];
        });

        showMessage(
            batchLoadFailed
                ? `${product.product_name} added. Batch options could not be loaded; checkout will use automatic FEFO selection.`
                : `${product.product_name} added to the cart.`,
            batchLoadFailed ? "error" : "success"
        );
    };


    const increaseQuantity = (productId) => {
        const item = cart.find(
            (cartItem) => cartItem.product_id === productId
        );
        const totalAvailable = (item?.eligibleBatches || []).reduce(
            (total, batch) => total + Number(batch.available_quantity || 0),
            0
        );

        if (
            item?.eligibleBatches?.length &&
            Number(item.quantity) + 1 > totalAvailable
        ) {
            showMessage(
                `Only ${totalAvailable} usable units are available across all batches.`,
                "error"
            );
            return;
        }

        setCart((currentCart) =>
            currentCart.map((item) =>
                item.product_id === productId
                    ? {
                        ...item,
                        quantity: Number(item.quantity) + 1
                    }
                    : item
            )
        );
    };


    const decreaseQuantity = (productId) => {
        setCart((currentCart) =>
            currentCart
                .map((item) =>
                    item.product_id === productId
                        ? {
                            ...item,
                            quantity: Number(item.quantity) - 1
                        }
                        : item
                )
                .filter(
                    (item) => Number(item.quantity) > 0
                )
        );
    };


    const updateQuantity = (productId, value) => {
        const quantityValue = Number(value);

        if (
            !Number.isInteger(quantityValue) ||
            quantityValue < 1
        ) {
            return;
        }

        const item = cart.find(
            (cartItem) => cartItem.product_id === productId
        );
        const totalAvailable = (item?.eligibleBatches || []).reduce(
            (total, batch) => total + Number(batch.available_quantity || 0),
            0
        );

        if (
            item?.eligibleBatches?.length &&
            quantityValue > totalAvailable
        ) {
            showMessage(
                `Only ${totalAvailable} usable units are available across all batches.`,
                "error"
            );
            return;
        }

        setCart((currentCart) =>
            currentCart.map((item) =>
                item.product_id === productId
                    ? {
                        ...item,
                        quantity: quantityValue
                    }
                    : item
            )
        );
    };


    const selectCartBatch = (productId, batchId) => {
        const item = cart.find(
            (cartItem) => cartItem.product_id === productId
        );
        const selectedBatch = item?.eligibleBatches?.find(
            (batch) => Number(batch.batch_id) === Number(batchId)
        );

        const totalAvailable = (item?.eligibleBatches || []).reduce(
            (total, batch) => total + Number(batch.available_quantity || 0),
            0
        );

        if (
            !selectedBatch ||
            totalAvailable < Number(item?.quantity || 0)
        ) {
            showMessage(
                "That batch does not have enough usable units for this cart quantity.",
                "error"
            );
            return;
        }

        const recommendedBatchId = item.eligibleBatches?.[0]?.batch_id;
        const isRecommendedBatch =
            Number(selectedBatch.batch_id) === Number(recommendedBatchId);

        setCart((currentCart) =>
            currentCart.map((cartItem) =>
                cartItem.product_id === productId
                    ? {
                        ...cartItem,
                        selectedBatchId: selectedBatch.batch_id,
                        batchOverrideReason: isRecommendedBatch
                            ? ""
                            : cartItem.batchOverrideReason || ""
                    }
                    : cartItem
            )
        );
        setMessage("");
    };


    const isBatchOverride = (item) => {
        const recommendedBatchId = item.eligibleBatches?.[0]?.batch_id;

        return (
            item.selectedBatchId != null &&
            recommendedBatchId != null &&
            Number(item.selectedBatchId) !== Number(recommendedBatchId)
        );
    };


    const updateBatchOverrideReason = (productId, value) => {
        setCart((currentCart) =>
            currentCart.map((item) =>
                item.product_id === productId
                    ? { ...item, batchOverrideReason: value }
                    : item
            )
        );
    };


    const removeFromCart = (productId) => {
        setCart((currentCart) =>
            currentCart.filter(
                (item) => item.product_id !== productId
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


    const getPaymentLabel = (value) => {
        const method = PAYMENT_METHODS.find(
            (item) => item.value === value
        );

        return method ? method.label : value;
    };


    const getFriendlySaleError = (value) => {
        const rawMessage = String(
            value || "Unable to process the sale."
        );

        const normalized = rawMessage.toLowerCase();

        if (
            normalized.includes("insufficient") &&
            normalized.includes("stock")
        ) {
            return (
                "Insufficient stock for one or more products in this order. " +
                "Adjust the cart quantity and try again."
            );
        }

        if (
            normalized.includes("not enough") &&
            normalized.includes("stock")
        ) {
            return (
                "There is not enough available stock to complete this order. " +
                "Reduce the requested quantity and try again."
            );
        }

        if (normalized.includes("expired")) {
            return (
                "The product does not have enough eligible non-expired stock " +
                "to complete this transaction."
            );
        }

        return rawMessage;
    };


    const processSale = async () => {
        if (processing) {
            return;
        }

        if (cart.length === 0) {
            showMessage(
                "Add at least one product before processing the sale.",
                "error"
            );

            return;
        }

        const missingOverrideReason = cart.some(
            (item) =>
                isBatchOverride(item) &&
                String(item.batchOverrideReason || "").trim().length < 5
        );

        if (missingOverrideReason) {
            showMessage(
                "Enter at least five characters explaining why a non-recommended batch was selected.",
                "error"
            );
            return;
        }

        const orderSnapshot = {
            items: cart.map((item) => ({ ...item })),
            itemCount: cartItemCount,
            total: cartTotal,
            paymentMethod,
            completedAt: new Date()
        };

        setProcessing(true);
        setMessage("");

        try {
            const response = await fetch(
                `${API_URL}/sales`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        payment_method: paymentMethod,
                        items: cart.map((item) => ({
                            product_id: item.product_id,
                            quantity: Number(item.quantity),
                            batch_id: item.selectedBatchId ?? null,
                            batch_override_reason:
                                item.batchOverrideReason?.trim() || ""
                        }))
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                showMessage(
                    getFriendlySaleError(data.message),
                    "error"
                );

                return;
            }

            setCompletedSale({
                ...orderSnapshot,
                saleId: data.sale_id ?? data.id ?? null,
                backendTotal: data.total_amount ?? null
            });

            setCart([]);
            setPaymentMethod("cash");

            await Promise.all([
                loadProducts(),
                loadSales()
            ]);
        } catch (error) {
            console.error("Process sale error:", error);

            showMessage(
                "Unable to connect to the backend. The transaction was not completed.",
                "error"
            );
        } finally {
            setProcessing(false);
        }
    };


    const formatCurrency = (value) => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            minimumFractionDigits: 2
        }).format(Number(value || 0));
    };


    const formatExpiryDate = (value) => {
        const datePart = String(value || "").slice(0, 10);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
            return "No valid expiry date";
        }

        const date = new Date(`${datePart}T00:00:00Z`);
        if (
            Number.isNaN(date.getTime()) ||
            date.toISOString().slice(0, 10) !== datePart
        ) {
            return "No valid expiry date";
        }

        return new Intl.DateTimeFormat("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
            timeZone: "UTC"
        }).format(date);
    };


    const formatDateTime = (value) => {
        if (!value) {
            return "N/A";
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return "N/A";
        }

        return new Intl.DateTimeFormat("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }).format(date);
    };


    const getCashierName = (sale) => {
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

                    <h1>Sales</h1>


                </div>

                <button
                    type="button"
                    className="sales-header-refresh"
                    onClick={refreshAll}
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
                            productsLoading || salesLoading
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
                        <Package size={21} strokeWidth={1.9} />
                    </div>

                    <div>
                        <span>Catalog Products</span>
                        <strong>{products.length}</strong>
                    </div>
                </article>

                <article className="sales-summary-card">
                    <div className="sales-summary-icon sales-summary-green">
                        <ShoppingBag size={21} strokeWidth={1.9} />
                    </div>

                    <div>
                        <span>Cart Items</span>
                        <strong>{cartItemCount}</strong>
                    </div>
                </article>

                <article className="sales-summary-card">
                    <div className="sales-summary-icon sales-summary-purple">
                        <CircleDollarSign size={21} strokeWidth={1.9} />
                    </div>

                    <div>
                        <span>Current Order</span>
                        <strong className="sales-summary-money">
                            {formatCurrency(cartTotal)}
                        </strong>
                    </div>
                </article>

                <article className="sales-summary-card">
                    <div className="sales-summary-icon sales-summary-orange">
                        <ReceiptText size={21} strokeWidth={1.9} />
                    </div>

                    <div>
                        <span>Completed Sales</span>
                        <strong>{sales.length}</strong>
                    </div>
                </article>
            </section>


            {message && (
                <div
                    className={
                        messageType === "error"
                            ? "sales-page-message sales-page-message-error"
                            : "sales-page-message sales-page-message-success"
                    }
                >
                    {messageType === "success" ? (
                        <CheckCircle2 size={19} strokeWidth={2} />
                    ) : (
                        <AlertCircle size={19} strokeWidth={2} />
                    )}

                    <span>{message}</span>

                    <button
                        type="button"
                        onClick={() => setMessage("")}
                        aria-label="Dismiss message"
                    >
                        <X size={16} strokeWidth={2} />
                    </button>
                </div>
            )}


            <section className="sales-pos-grid">
                <div className="sales-products-panel">
                    <div className="sales-panel-header">
                        <div>


                            <h2>Select Products</h2>

                            <p>
                                Search the catalog and add products
                                to the current order.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="sales-panel-refresh"
                            onClick={loadProducts}
                            disabled={productsLoading || processing}
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


                    <div className="sales-camera-scanner">
                        <div className="sales-camera-scanner-header">
                            <div className="sales-camera-scanner-info">
                                <div className="sales-camera-scanner-icon">
                                    <Camera size={20} />
                                </div>

                                <div>
                                    <strong>Quick Barcode Scanner</strong>
                                    <span>
                                        Scan registered products directly
                                        into your cart.
                                    </span>
                                </div>
                            </div>

                            {!scannerOpen ? (
                                <button
                                    type="button"
                                    className="sales-camera-start"
                                    onClick={startSalesScanner}
                                    disabled={
                                        scannerLoading ||
                                        productsLoading ||
                                        products.length === 0 ||
                                        processing
                                    }
                                >
                                    <Camera size={16} />

                                    {scannerLoading
                                        ? "Starting..."
                                        : "Start Camera Scanner"}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="sales-camera-stop"
                                    onClick={stopSalesScanner}
                                >
                                    <X size={16} />
                                    Stop Scanner
                                </button>
                            )}
                        </div>

                        <div
                            className="sales-camera-view"
                            hidden={!scannerOpen}
                        >
                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                playsInline
                            />

                            <div className="sales-camera-guide">
                                {scannerLoading
                                    ? "Starting camera..."
                                    : "Align the barcode inside the camera view"}
                            </div>
                        </div>
                    </div>


                    <div className="sales-product-search">
                        <Search size={19} strokeWidth={1.9} />

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                            placeholder="Search by product name, barcode, brand, or category..."
                        />

                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm("")}
                                aria-label="Clear product search"
                            >
                                <X size={16} strokeWidth={2} />
                            </button>
                        )}
                    </div>


                    {productsLoading ? (
                        <div className="sales-loading-state">
                            <span className="sales-loading-spinner" />
                            Loading products...
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="sales-empty-state">
                            <Package size={39} strokeWidth={1.4} />

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
                        <div className={selectedCatalogProduct ? "sales-catalog-explorer has-selection" : "sales-catalog-explorer"}>
                            <div className="sales-product-list" role="list" aria-label="Product catalog">
                                {filteredProducts.map((product) => {
                                    const cartItem = cart.find(
                                        (item) => Number(item.product_id) === Number(product.product_id)
                                    );
                                    const isSelected = Number(selectedCatalogProductId) === Number(product.product_id);

                                    return (
                                        <div className={isSelected ? "sales-product-list-row selected" : "sales-product-list-row"} key={product.product_id} role="listitem">
                                            <button
                                                type="button"
                                                className="sales-product-select"
                                                onClick={() => setSelectedCatalogProductId(product.product_id)}
                                                aria-pressed={isSelected}
                                            >
                                                <span className="sales-product-select-main">
                                                    <strong>{product.product_name}</strong>
                                                    <small>{formatProductBrand(product.brand)} · {formatProductCategory(product.category)}</small>
                                                    <small className="sales-product-select-barcode">{product.barcode || "No barcode recorded"}</small>
                                                </span>
                                                <span className="sales-product-select-meta">
                                                    <strong>{formatCurrency(product.selling_price)}</strong>
                                                    {cartItem && <small>{cartItem.quantity} in cart</small>}
                                                </span>
                                            </button>
                                            <button
                                                type="button"
                                                className="sales-product-list-add"
                                                onClick={() => void addToCart(product)}
                                                disabled={processing || batchLoadingIds.includes(product.product_id)}
                                                aria-label={`Add ${product.product_name} to cart`}
                                            >
                                                <Plus size={16} strokeWidth={2} />
                                                Add
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {selectedCatalogProduct && (() => {
                                const selectedCartItem = cart.find(
                                    (item) => Number(item.product_id) === Number(selectedCatalogProduct.product_id)
                                );

                                return (
                                    <aside className="sales-product-detail" aria-live="polite" aria-label="Selected product details">
                                        <div className="sales-product-detail-image">
                                            {selectedCatalogProduct.image_url ? (
                                                <img src={selectedCatalogProduct.image_url} alt={selectedCatalogProduct.product_name} />
                                            ) : (
                                                <Package size={54} strokeWidth={1.4} />
                                            )}
                                        </div>
                                        <span className="sales-product-detail-eyebrow">Selected product</span>
                                        <h3>{selectedCatalogProduct.product_name}</h3>
                                        <p className="sales-product-detail-brand">{formatProductBrand(selectedCatalogProduct.brand)}</p>
                                        <div className="sales-product-detail-category">{formatProductCategory(selectedCatalogProduct.category)}</div>
                                        <dl className="sales-product-detail-data">
                                            <div><dt>Barcode</dt><dd>{selectedCatalogProduct.barcode || "Not recorded"}</dd></div>
                                            <div><dt>Unit</dt><dd>{selectedCatalogProduct.unit || "Not specified"}</dd></div>
                                            <div><dt>Price</dt><dd>{formatCurrency(selectedCatalogProduct.selling_price)}</dd></div>
                                            {selectedCartItem && <div><dt>In current cart</dt><dd>{selectedCartItem.quantity} unit{selectedCartItem.quantity === 1 ? "" : "s"}</dd></div>}
                                        </dl>
                                        <button
                                            type="button"
                                            className="sales-product-detail-add"
                                            onClick={() => void addToCart(selectedCatalogProduct)}
                                            disabled={processing || batchLoadingIds.includes(selectedCatalogProduct.product_id)}
                                        >
                                            <Plus size={17} strokeWidth={2} />
                                            {selectedCartItem ? "Add one more" : "Add to cart"}
                                        </button>
                                    </aside>
                                );
                            })()}
                        </div>
                    )}
                </div>


                <aside className="sales-order-panel">
                    <div className="sales-order-heading">
                        <div>
                            <span className="sales-panel-eyebrow">
                                Current Order
                            </span>

                            <h2>Cart</h2>

                            <p>
                                {cartItemCount}{" "}
                                {cartItemCount === 1 ? "item" : "items"}
                            </p>
                        </div>

                        {cart.length > 0 && (
                            <button
                                type="button"
                                className="sales-clear-cart"
                                onClick={clearCart}
                                disabled={processing}
                            >
                                <Trash2 size={15} strokeWidth={1.9} />
                                Clear
                            </button>
                        )}
                    </div>


                    <div className="sales-cart-body">
                        {cart.length === 0 ? (
                            <div className="sales-cart-empty">
                                <div className="sales-cart-empty-icon">
                                    <ShoppingCart
                                        size={33}
                                        strokeWidth={1.5}
                                    />
                                </div>

                                <strong>Your cart is empty</strong>

                                <span>
                                    Select products from the catalog
                                    to begin an order.
                                </span>
                            </div>
                        ) : (
                            <div className="sales-cart-list">
                                {cart.map((item) => (
                                    <div
                                        className="sales-cart-item"
                                        key={item.product_id}
                                    >
                                        <div className="sales-cart-item-main">
                                            <div className="sales-cart-item-image">
                                                {item.image_url ? (
                                                    <img
                                                        src={item.image_url}
                                                        alt={item.product_name}
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
                                                    {item.product_name}
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
                                                disabled={processing}
                                                aria-label={`Remove ${item.product_name}`}
                                            >
                                                <Trash2
                                                    size={15}
                                                    strokeWidth={1.9}
                                                />
                                            </button>
                                        </div>

                                        <div className="sales-cart-batch-control">
                                            <label
                                                htmlFor={`sales-batch-${item.product_id}`}
                                            >
                                                Fulfillment batch
                                            </label>
                                            {item.eligibleBatches?.length > 0 ? (
                                                <>
                                                    <select
                                                        id={`sales-batch-${item.product_id}`}
                                                        value={item.selectedBatchId ?? ""}
                                                        onChange={(event) =>
                                                            selectCartBatch(
                                                                item.product_id,
                                                                event.target.value
                                                            )
                                                        }
                                                        disabled={processing}
                                                    >
                                                        {item.eligibleBatches.map(
                                                            (batch, index) => {
                                                                const expiryLabel = batch.expiry_date
                                                                    ? formatExpiryDate(batch.expiry_date)
                                                                    : "No expiry date";

                                                                return (
                                                                    <option
                                                                        key={batch.batch_id}
                                                                        value={batch.batch_id}
                                                                        disabled={
                                                                            (item.eligibleBatches || []).reduce(
                                                                                (total, eligibleBatch) =>
                                                                                    total + Number(eligibleBatch.available_quantity || 0),
                                                                                0
                                                                            ) < Number(item.quantity)
                                                                        }
                                                                    >
                                                                        {index === 0
                                                                            ? "Recommended · "
                                                                            : ""}
                                                                        {batch.batch_number ||
                                                                            `Batch ${batch.batch_id}`}
                                                                        {" · "}
                                                                        {batch.available_quantity} usable
                                                                        {" · "}
                                                                        {expiryLabel}
                                                                    </option>
                                                                );
                                                            }
                                                        )}
                                                    </select>
                                                    <small>
                                                        Checkout uses all eligible
                                                        batches in FEFO order. A
                                                        selected batch is used first.
                                                    </small>
                                                    {isBatchOverride(item) && (
                                                        <div className="sales-cart-batch-override">
                                                            <label
                                                                htmlFor={`sales-batch-reason-${item.product_id}`}
                                                            >
                                                                Why are you choosing this batch?
                                                            </label>
                                                            <textarea
                                                                id={`sales-batch-reason-${item.product_id}`}
                                                                value={
                                                                    item.batchOverrideReason ||
                                                                    ""
                                                                }
                                                                onChange={(event) =>
                                                                    updateBatchOverrideReason(
                                                                        item.product_id,
                                                                        event.target.value
                                                                    )
                                                                }
                                                                maxLength={250}
                                                                rows={2}
                                                                disabled={processing}
                                                                placeholder="Enter a reason (at least 5 characters)"
                                                                aria-required="true"
                                                            />
                                                            <small>
                                                                Required for audit records ·{" "}
                                                                {
                                                                    String(
                                                                        item.batchOverrideReason ||
                                                                        ""
                                                                    ).length
                                                                }
                                                                /250 characters
                                                            </small>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div
                                                    className="sales-cart-batch-message"
                                                    role="status"
                                                >
                                                    {item.batchLoadFailed
                                                        ? "Batch options are unavailable. Checkout will use automatic FEFO selection."
                                                        : "No eligible batch is currently available for this product."}
                                                </div>
                                            )}
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
                                                    disabled={processing}
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
                                                    value={item.quantity}
                                                    disabled={processing}
                                                    onChange={(event) =>
                                                        updateQuantity(
                                                            item.product_id,
                                                            event.target.value
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
                                                    disabled={processing}
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
                                                    Number(item.selling_price) *
                                                    Number(item.quantity)
                                                )}
                                            </strong>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>


                    <div className="sales-payment-section">
                        <div className="sales-payment-heading">
                            <span>Payment Method</span>

                            <small>
                                Choose how the customer will pay
                            </small>
                        </div>

                        <div className="sales-payment-options">
                            {PAYMENT_METHODS.map((method) => {
                                const Icon = method.icon;
                                const active =
                                    paymentMethod === method.value;

                                return (
                                    <button
                                        type="button"
                                        key={method.value}
                                        disabled={processing}
                                        className={
                                            active
                                                ? "sales-payment-option active"
                                                : "sales-payment-option"
                                        }
                                        onClick={() =>
                                            setPaymentMethod(method.value)
                                        }
                                    >
                                        <span className="sales-payment-icon">
                                            <Icon
                                                size={19}
                                                strokeWidth={1.9}
                                            />
                                        </span>

                                        <span className="sales-payment-copy">
                                            <strong>{method.label}</strong>
                                            <small>
                                                {method.description}
                                            </small>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>


                    <div className="sales-order-summary">
                        <div className="sales-order-summary-row">
                            <span>Unique Products</span>
                            <strong>{cart.length}</strong>
                        </div>

                        <div className="sales-order-summary-row">
                            <span>Total Units</span>
                            <strong>{cartItemCount}</strong>
                        </div>

                        <div className="sales-order-total-row">
                            <div>
                                <span>Total</span>
                                <small>Amount Due</small>
                            </div>

                            <strong>{formatCurrency(cartTotal)}</strong>
                        </div>

                        <button
                            type="button"
                            className="sales-process-button"
                            onClick={processSale}
                            disabled={
                                processing ||
                                cart.length === 0
                            }
                        >
                            {processing ? (
                                <>
                                    <span className="sales-process-spinner" />
                                    Processing Sale...
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
                            <History size={22} strokeWidth={1.9} />
                        </div>

                        <div>


                            <h2>Sales History</h2>

                            <p>
                                Review completed transactions recorded
                                in the system.
                            </p>
                        </div>
                    </div>

                    <div className="sales-history-actions">
                        <div className="sales-history-search">
                            <Search size={17} strokeWidth={1.9} />

                            <input
                                type="text"
                                value={salesSearch}
                                onChange={(event) => {
                                    setSalesSearch(event.target.value)
                                    setSalesHistoryPage(1);
                                }}
                                placeholder="Search sale, cashier, or payment..."
                            />

                            {salesSearch && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSalesSearch("");
                                        setSalesHistoryPage(1);
                                    }}
                                    aria-label="Clear history search"
                                >
                                    <X size={15} strokeWidth={2} />
                                </button>
                            )}
                        </div>

                        <button
                            type="button"
                            className="sales-panel-refresh"
                            onClick={loadSales}
                            disabled={salesLoading || processing}
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
                        <span>Recorded Transactions</span>
                        <strong>{sales.length}</strong>
                    </div>

                    <div>
                        <span>Recorded Revenue</span>
                        <strong>
                            {formatCurrency(recordedRevenue)}
                        </strong>
                    </div>
                </div>


                {salesLoading ? (
                    <div className="sales-loading-state">
                        <span className="sales-loading-spinner" />
                        Loading sales history...
                    </div>
                ) : filteredSales.length === 0 ? (
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
                    <>
                        <div className="sales-table-wrapper">
                            <table className="sales-modern-table">
                                <thead>
                                    <tr>
                                        <th>Sale ID</th>
                                        <th>Cashier</th>
                                        <th>Payment</th>
                                        <th>Date & Time</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginatedSales.map((sale) => (
                                        <tr key={sale.sale_id}>
                                            <td>
                                                <button type="button" className="reports-receipt-link sales-id" onClick={() => setSelectedReceiptId(sale.sale_id)} aria-label={`View receipt for sale ${sale.sale_id}`}>#{sale.sale_id}</button>
                                            </td>

                                            <td>
                                                <strong className="sales-cashier">
                                                    {getCashierName(sale)}
                                                </strong>
                                            </td>

                                            <td>
                                                <span
                                                    className={`sales-payment-badge sales-payment-${sale.payment_method}`}
                                                >
                                                    {sale.payment_method}
                                                </span>
                                            </td>

                                            <td>
                                                {formatDateTime(sale.sale_date)}
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
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {salesHistoryPageCount > 1 && (
                            <nav
                                className="sales-history-pagination"
                                aria-label="Sales history pages"
                            >
                                <span>
                                    Showing{" "}
                                    {(currentSalesHistoryPage - 1) *
                                        SALES_HISTORY_PAGE_SIZE +
                                        1}
                                    {" to "}
                                    {Math.min(
                                        currentSalesHistoryPage *
                                        SALES_HISTORY_PAGE_SIZE,
                                        filteredSales.length
                                    )}{" "}
                                    of {filteredSales.length}
                                </span>

                                <div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSalesHistoryPage(
                                                currentSalesHistoryPage - 1
                                            )
                                        }
                                        disabled={currentSalesHistoryPage === 1}
                                    >
                                        Previous
                                    </button>
                                    <span>
                                        Page {currentSalesHistoryPage} of{" "}
                                        {salesHistoryPageCount}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSalesHistoryPage(
                                                currentSalesHistoryPage + 1
                                            )
                                        }
                                        disabled={
                                            currentSalesHistoryPage ===
                                            salesHistoryPageCount
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


            <ReceiptModal saleId={selectedReceiptId} onClose={() => setSelectedReceiptId(null)} />

            {completedSale && (
                <div
                    className="sales-receipt-overlay"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget
                        ) {
                            setCompletedSale(null);
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
                            The transaction has been recorded and
                            the available inventory has been updated.
                        </p>

                        {completedSale.saleId && (
                            <div className="sales-receipt-number">
                                <span>Sale Reference</span>
                                <strong>
                                    #{completedSale.saleId}
                                </strong>
                            </div>
                        )}

                        <div className="sales-receipt-divider" />

                        <div className="sales-receipt-items">
                            {completedSale.items.map((item) => (
                                <div
                                    className="sales-receipt-item"
                                    key={item.product_id}
                                >
                                    <div>
                                        <strong>
                                            {item.product_name}
                                        </strong>

                                        <span>
                                            {item.quantity} ×{" "}
                                            {formatCurrency(
                                                item.selling_price
                                            )}
                                        </span>
                                    </div>

                                    <strong>
                                        {formatCurrency(
                                            Number(item.quantity) *
                                            Number(item.selling_price)
                                        )}
                                    </strong>
                                </div>
                            ))}
                        </div>

                        <div className="sales-receipt-divider" />

                        <div className="sales-receipt-meta">
                            <div>
                                <span>Payment</span>
                                <strong>
                                    {getPaymentLabel(
                                        completedSale.paymentMethod
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>Total Units</span>
                                <strong>
                                    {completedSale.itemCount}
                                </strong>
                            </div>

                            <div>
                                <span>Date & Time</span>
                                <strong>
                                    {new Intl.DateTimeFormat(
                                        "en-PH",
                                        {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                            hour: "numeric",
                                            minute: "2-digit"
                                        }
                                    ).format(
                                        completedSale.completedAt
                                    )}
                                </strong>
                            </div>
                        </div>

                        <div className="sales-receipt-total">
                            <div>
                                <span>Amount Paid</span>
                                <small>Transaction total</small>
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
                            onClick={() => setCompletedSale(null)}
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

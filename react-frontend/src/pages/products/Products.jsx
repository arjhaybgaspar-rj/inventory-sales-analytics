
import {
    AlertCircle,
    Barcode,
    Camera,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Database,
    Edit2,
    Info,
    Package,
    Plus,
    RefreshCw,
    ScanLine,
    Search,
    SearchX,
    X
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { API_URL } from "../../services/api";
import {
    formatProductBrand,
    formatProductCategory
} from "../../utils/productDisplay";

import "./Products.css";

function isValidEAN8(barcode) {
    if (!/^\d{8}$/.test(barcode)) return false;

    const digits = barcode.split("").map(Number);
    let total = 0;

    for (let index = 0; index < 7; index += 1) {
        total += digits[index] * (index % 2 === 0 ? 3 : 1);
    }

    const checkDigit = (10 - (total % 10)) % 10;
    return checkDigit === digits[7];
}

function isValidEAN13(barcode) {
    if (!/^\d{13}$/.test(barcode)) return false;

    const digits = barcode.split("").map(Number);
    let total = 0;

    for (let index = 0; index < 12; index += 1) {
        total += digits[index] * (index % 2 === 0 ? 1 : 3);
    }

    const checkDigit = (10 - (total % 10)) % 10;
    return checkDigit === digits[12];
}

function isValidUPCA(barcode) {
    if (!/^\d{12}$/.test(barcode)) return false;

    const digits = barcode.split("").map(Number);
    let total = 0;

    for (let index = 0; index < 11; index += 1) {
        total += digits[index] * (index % 2 === 0 ? 3 : 1);
    }

    const checkDigit = (10 - (total % 10)) % 10;
    return checkDigit === digits[11];
}

function isValidScannedBarcode(barcode) {
    if (!/^\d+$/.test(barcode)) return false;

    if (barcode.length === 8) return isValidEAN8(barcode);
    if (barcode.length === 12) return isValidUPCA(barcode);
    if (barcode.length === 13) return isValidEAN13(barcode);
    if (barcode.length === 14) return isValidEAN13(barcode.slice(1));

    return false;
}

function Products() {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const readerRef = useRef(null);
    const scanningRef = useRef(false);
    const lastDetectedRef = useRef("");
    const detectionCountRef = useRef(0);

    const [products, setProducts] = useState([]);
    const [barcode, setBarcode] = useState("");
    const [product, setProduct] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [lookupMeta, setLookupMeta] = useState(null);
    const [sellingPrice, setSellingPrice] = useState("");

    const [scannerOpen, setScannerOpen] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [loading, setLoading] = useState(false);
    const [catalogLoading, setCatalogLoading] = useState(true);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const [editingProduct, setEditingProduct] = useState(null);
    const [editForm, setEditForm] = useState({
        product_name: "",
        brand: "",
        category: "",
        unit: "",
        selling_price: ""
    });
    const [savingEdit, setSavingEdit] = useState(false);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            minimumFractionDigits: 2
        }).format(Number(value || 0));
    };

    const loadProducts = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/products`, {
                credentials: "include"
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                setError(data.message || "Unable to load products.");
                return;
            }

            setProducts(Array.isArray(data.products) ? data.products : []);
        } catch (err) {
            console.error("Load products error:", err);
            setError("Unable to connect to the backend.");
        } finally {
            setCatalogLoading(false);
        }
    }, []);

    const stopCamera = useCallback(() => {
        scanningRef.current = false;
        setScanning(false);

        lastDetectedRef.current = "";
        detectionCountRef.current = 0;

        if (readerRef.current) {
            try {
                readerRef.current.reset();
            } catch (err) {
                console.debug("Scanner reset:", err);
            }

            readerRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []);

    const clearLookup = () => {
        stopCamera();
        setScannerOpen(false);
        setBarcode("");
        setProduct(null);
        setLookupMeta(null);
        setSellingPrice("");
        setMessage("");
        setError("");
    };

    const lookupBarcode = async (value = barcode) => {
        const cleanBarcode = String(value || "").trim();

        if (!cleanBarcode) {
            setError("Please enter a barcode.");
            return;
        }

        if (!/^\d+$/.test(cleanBarcode)) {
            setError("Barcode must contain numbers only.");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");
        setProduct(null);
        setLookupMeta(null);
        setSellingPrice("");

        try {
            const response = await fetch(
                `${API_URL}/barcode/lookup?barcode=${encodeURIComponent(cleanBarcode)}`,
                { credentials: "include" }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                setError(data.message || "Barcode lookup failed.");
                return;
            }

            setBarcode(cleanBarcode);
            setProduct(data.product || null);

            setLookupMeta({
                exists: Boolean(data.exists),
                foundInApi: Boolean(data.found_in_api)
            });

            if (data.exists) {
                setSellingPrice(
                    data.product?.selling_price !== null &&
                        data.product?.selling_price !== undefined
                        ? String(data.product.selling_price)
                        : ""
                );

                setMessage("This product is already registered in your product catalog.");
                return;
            }

            if (data.found_in_api) {
                setSellingPrice("");
                setMessage(
                    "Product identified through Open Food Facts. Enter the selling price to add it to your catalog."
                );
                return;
            }

            setSellingPrice("");
            setMessage("");
        } catch (err) {
            console.error("Barcode lookup error:", err);
            setError("Unable to connect to the backend.");
        } finally {
            setLoading(false);
        }
    };

    const startScanner = async () => {
        setError("");
        setMessage("");
        setProduct(null);
        setLookupMeta(null);
        setSellingPrice("");
        setScannerOpen(true);

        lastDetectedRef.current = "";
        detectionCountRef.current = 0;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: "environment" },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            });

            streamRef.current = stream;

            if (!videoRef.current) {
                stream.getTracks().forEach((track) => track.stop());
                return;
            }

            videoRef.current.srcObject = stream;
            videoRef.current.setAttribute("playsinline", "true");
            videoRef.current.muted = true;

            await videoRef.current.play();

            const hints = new Map();

            hints.set(DecodeHintType.POSSIBLE_FORMATS, [
                BarcodeFormat.EAN_13,
                BarcodeFormat.EAN_8,
                BarcodeFormat.UPC_A,
                BarcodeFormat.UPC_E,
                BarcodeFormat.ITF,
                BarcodeFormat.CODE_128,
                BarcodeFormat.CODE_39
            ]);

            hints.set(DecodeHintType.TRY_HARDER, true);

            const reader = new BrowserMultiFormatReader(hints);

            readerRef.current = reader;
            scanningRef.current = true;
            setScanning(true);

            reader.decodeFromVideoElement(videoRef.current, (result) => {
                if (!scanningRef.current || !result) return;

                const detectedBarcode = result.getText();

                if (!detectedBarcode || !/^\d+$/.test(detectedBarcode)) {
                    lastDetectedRef.current = "";
                    detectionCountRef.current = 0;
                    return;
                }

                if (!isValidScannedBarcode(detectedBarcode)) {
                    lastDetectedRef.current = "";
                    detectionCountRef.current = 0;
                    return;
                }

                if (lastDetectedRef.current === detectedBarcode) {
                    detectionCountRef.current += 1;
                } else {
                    lastDetectedRef.current = detectedBarcode;
                    detectionCountRef.current = 1;
                }

                if (detectionCountRef.current < 2) return;

                scanningRef.current = false;
                setBarcode(detectedBarcode);
                stopCamera();
                setScannerOpen(false);
                lookupBarcode(detectedBarcode);
            });
        } catch (err) {
            console.error("Scanner error:", err);

            setScannerOpen(false);
            setScanning(false);
            stopCamera();

            if (err?.name === "NotAllowedError") {
                setError("Camera permission was denied. Please allow camera access.");
            } else if (err?.name === "NotFoundError") {
                setError("No camera was found on this device.");
            } else {
                setError("Unable to open the camera.");
            }
        }
    };

    const closeScanner = () => {
        stopCamera();
        setScannerOpen(false);
    };

    const handlePriceChange = (event) => {
        const value = event.target.value;

        if (/^\d*\.?\d{0,2}$/.test(value)) {
            setSellingPrice(value);
        }
    };

    const isUnknownProduct = Boolean(
        product &&
        lookupMeta &&
        !lookupMeta.exists &&
        !lookupMeta.foundInApi
    );

    const canAddProduct = Boolean(
        product &&
        lookupMeta &&
        !lookupMeta.exists &&
        lookupMeta.foundInApi
    );

    const addProduct = async () => {
        if (!product || !canAddProduct) return;

        if (!String(product.product_name || "").trim()) {
            setError("The product does not contain enough information to be registered.");
            return;
        }

        if (!sellingPrice) {
            setError("Selling price is required.");
            return;
        }

        const price = Number(sellingPrice);

        if (!Number.isFinite(price) || price <= 0) {
            setError("Selling price must be greater than 0.");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch(`${API_URL}/products`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    barcode: product.barcode,
                    product_name: product.product_name,
                    category: product.category,
                    brand: product.brand,
                    image_url: product.image_url,
                    api_source: product.api_source,
                    unit: product.unit,
                    selling_price: price
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                setError(data.message || "Unable to add product.");
                return;
            }

            setProduct((currentProduct) => ({
                ...currentProduct,
                selling_price: price
            }));

            setLookupMeta({
                exists: true,
                foundInApi: false
            });

            setSellingPrice(String(price));
            setMessage("Product added successfully.");
            await loadProducts();
        } catch (err) {
            console.error("Add product error:", err);
            setError("Unable to connect to the backend.");
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (item) => {
        setEditingProduct(item);

        setEditForm({
            product_name: item.product_name || "",
            brand: item.brand || "",
            category: item.category || "",
            unit: item.unit || "",
            selling_price: String(item.selling_price ?? "")
        });

        setError("");
        setMessage("");
    };

    const closeEditModal = () => {
        if (savingEdit) return;
        setEditingProduct(null);
    };

    const handleEditChange = (event) => {
        const { name, value } = event.target;

        if (name === "selling_price" && !/^\d*\.?\d{0,2}$/.test(value)) {
            return;
        }

        setEditForm((current) => ({
            ...current,
            [name]: value
        }));
    };

    const saveProductChanges = async () => {
        if (!editingProduct) return;

        const price = Number(editForm.selling_price);

        if (!editForm.product_name.trim()) {
            setError("Product name is required.");
            return;
        }

        if (!Number.isFinite(price) || price <= 0) {
            setError("Selling price must be greater than 0.");
            return;
        }

        setSavingEdit(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch(
                `${API_URL}/products/${editingProduct.product_id}`,
                {
                    method: "PUT",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        product_name: editForm.product_name.trim(),
                        brand: editForm.brand.trim(),
                        category: editForm.category.trim(),
                        unit: editForm.unit.trim(),
                        selling_price: price
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                setError(data.message || "Unable to update product.");
                return;
            }

            setEditingProduct(null);
            setSuccessMessage("Product updated successfully.");
            await loadProducts();
        } catch (err) {
            console.error("Update product error:", err);
            setError("Unable to connect to the backend.");
        } finally {
            setSavingEdit(false);
        }
    };

    const filteredProducts = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        if (!search) return products;

        return products.filter((item) => {
            const productName = String(item.product_name || "").toLowerCase();
            const itemBarcode = String(item.barcode || "").toLowerCase();
            const rawBrand = String(item.brand || "").toLowerCase();
            const cleanedBrand = formatProductBrand(item.brand).toLowerCase();
            const rawCategory = String(item.category || "").toLowerCase();
            const cleanedCategory = formatProductCategory(item.category).toLowerCase();

            return (
                productName.includes(search) ||
                itemBarcode.includes(search) ||
                rawBrand.includes(search) ||
                cleanedBrand.includes(search) ||
                rawCategory.includes(search) ||
                cleanedCategory.includes(search)
            );
        });
    }, [products, searchTerm]);

    const productsPerPage = 10;
    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage));
    const visiblePage = Math.min(currentPage, totalPages);
    const pageProducts = filteredProducts.slice(
        (visiblePage - 1) * productsPerPage,
        visiblePage * productsPerPage
    );
    const firstVisibleProduct = filteredProducts.length
        ? (visiblePage - 1) * productsPerPage + 1
        : 0;
    const lastVisibleProduct = Math.min(
        visiblePage * productsPerPage,
        filteredProducts.length
    );

    const activeProducts = useMemo(
        () => products.filter((item) => item.status === "active").length,
        [products]
    );

    const apiProducts = useMemo(
        () => products.filter((item) =>
            String(item.api_source || "").toLowerCase().includes("open food facts")
        ).length,
        [products]
    );

    const averagePrice = useMemo(() => {
        if (products.length === 0) return 0;

        const total = products.reduce(
            (sum, item) => sum + Number(item.selling_price || 0),
            0
        );

        return total / products.length;
    }, [products]);

    useEffect(() => {
        Promise.resolve().then(() => loadProducts());

        return () => {
            stopCamera();
        };
    }, [loadProducts, stopCamera]);

    const openProductDetails = (item) => {
        setSelectedProduct(item);
    };

    const closeProductDetails = () => {
        setSelectedProduct(null);
    };

    return (
        <div className="premium-products-page">
            <header className="products-modern-header">
                <div>

                    <h1>Products</h1>

                </div>
            </header>

            <section className="products-summary-grid">
                <article className="products-summary-card">
                    <div className="products-summary-icon products-summary-blue">
                        <Package size={21} strokeWidth={1.9} />
                    </div>
                    <div>
                        <span>Registered Products</span>
                        <strong>{products.length}</strong>
                    </div>
                </article>

                <article className="products-summary-card">
                    <div className="products-summary-icon products-summary-green">
                        <CheckCircle2 size={21} strokeWidth={1.9} />
                    </div>
                    <div>
                        <span>Active Products</span>
                        <strong>{activeProducts}</strong>
                    </div>
                </article>

                <article className="products-summary-card">
                    <div className="products-summary-icon products-summary-purple">
                        <Database size={21} strokeWidth={1.9} />
                    </div>
                    <div>
                        <span>API Identified</span>
                        <strong>{apiProducts}</strong>
                    </div>
                </article>

                <article className="products-summary-card">
                    <div className="products-summary-icon products-summary-orange">
                        <Barcode size={21} strokeWidth={1.9} />
                    </div>
                    <div>
                        <span>Average Price</span>
                        <strong className="products-summary-price">
                            {formatCurrency(averagePrice)}
                        </strong>
                    </div>
                </article>
            </section>

            {error && (
                <div className="products-message products-message-error">
                    <AlertCircle size={19} strokeWidth={2} />
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={() => setError("")}
                        aria-label="Dismiss error"
                    >
                        <X size={16} strokeWidth={2} />
                    </button>
                </div>
            )}

            {message && (
                <div className="products-message products-message-info">
                    <Info size={19} strokeWidth={2} />
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

            {successMessage && (
                <div
                    className="products-success-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setSuccessMessage("");
                    }}
                >
                    <section
                        className="products-success-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="products-success-title"
                    >
                        <button
                            type="button"
                            className="products-success-close"
                            onClick={() => setSuccessMessage("")}
                            aria-label="Close success message"
                        >
                            <X size={19} />
                        </button>
                        <div className="products-success-icon">
                            <CheckCircle2 size={27} strokeWidth={1.9} />
                        </div>
                        <h2 id="products-success-title">Changes saved</h2>
                        <p>{successMessage}</p>
                        <button
                            type="button"
                            className="products-success-done"
                            onClick={() => setSuccessMessage("")}
                        >
                            Done
                        </button>
                    </section>
                </div>
            )}

            <section className="products-barcode-panel">
                <div className="products-section-heading">
                    <div className="products-section-icon">
                        <ScanLine size={23} strokeWidth={1.9} />
                    </div>
                    <div>
                        <h2>Barcode Lookup</h2>
                        <p>Enter a barcode manually or scan it using your camera.</p>
                    </div>
                </div>

                <div
                    className="products-barcode-workspace"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "12px",
                        width: "100%",
                        marginTop: "22px"
                    }}
                >
                    <div
                        className="products-barcode-input-wrapper"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            flex: "1 1 340px",
                            minWidth: "min(100%, 260px)",
                            minHeight: "52px",
                            boxSizing: "border-box",
                            gap: "10px",
                            padding: "0 14px",
                            border: "1px solid var(--border-strong, #cbd5c0)",
                            borderRadius: "14px",
                            background: "var(--surface-strong, #fffdf7)",
                            boxShadow: "var(--shadow-xs, 0 1px 2px rgba(47, 75, 51, 0.04))"
                        }}
                    >
                        <Barcode
                            className="products-barcode-input-icon"
                            size={20}
                            strokeWidth={1.8}
                            aria-hidden="true"
                        />

                        <input
                            className="products-barcode-input-field"
                            type="text"
                            value={barcode}
                            onChange={(event) => {
                                const value = event.target.value;
                                if (/^\d*$/.test(value)) setBarcode(value);
                            }}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") lookupBarcode();
                            }}
                            placeholder="Enter product barcode"
                            inputMode="numeric"
                            autoComplete="off"
                            aria-label="Enter product barcode"
                            disabled={loading}
                            style={{
                                display: "block",
                                flex: "1 1 0%",
                                width: "100%",
                                minWidth: 0,
                                height: "50px",
                                margin: 0,
                                padding: 0,
                                border: 0,
                                outline: "none",
                                boxShadow: "none",
                                borderRadius: 0,
                                background: "transparent",
                                color: "var(--text-primary, #263b2d)",
                                font: "inherit",
                                fontSize: "15px"
                            }}
                        />

                        {barcode && (
                            <button
                                type="button"
                                className="products-barcode-clear"
                                onClick={clearLookup}
                                aria-label="Clear barcode"
                                disabled={loading}
                                style={{
                                    display: "inline-flex",
                                    flex: "0 0 auto",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "30px",
                                    height: "30px",
                                    padding: 0,
                                    border: 0,
                                    borderRadius: "8px",
                                    background: "transparent",
                                    color: "var(--text-secondary, #667563)",
                                    cursor: "pointer"
                                }}
                            >
                                <X size={16} strokeWidth={2} />
                            </button>
                        )}
                    </div>

                    <button
                        type="button"
                        className="products-lookup-button"
                        onClick={() => lookupBarcode()}
                        disabled={loading || !barcode}
                        style={{
                            display: "inline-flex",
                            flex: "0 0 auto",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "9px",
                            minHeight: "52px",
                            padding: "0 20px",
                            whiteSpace: "nowrap"
                        }}
                    >
                        {loading ? (
                            <>
                                <span className="products-button-spinner" />
                                Looking Up...
                            </>
                        ) : (
                            <>
                                <Search size={18} strokeWidth={2} />
                                Lookup
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        className="products-scan-button"
                        onClick={startScanner}
                        disabled={loading}
                        style={{
                            display: "inline-flex",
                            flex: "0 0 auto",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "9px",
                            minHeight: "52px",
                            padding: "0 20px",
                            whiteSpace: "nowrap"
                        }}
                    >
                        <Camera size={18} strokeWidth={2} />
                        Scan Barcode
                    </button>
                </div>

                <div className="products-barcode-help">
                    <Info size={15} strokeWidth={1.9} />
                    <span>
                        Camera scanning supports common retail EAN and UPC barcodes.
                    </span>
                </div>
            </section>

            {scannerOpen && (
                <div className="products-scanner-backdrop">
                    <section
                        className="products-scanner-modal"
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="products-scanner-header">
                            <div>
                                <span>Camera Scanner</span>
                                <h2>Scan Product Barcode</h2>
                            </div>

                            <button
                                type="button"
                                onClick={closeScanner}
                                aria-label="Close scanner"
                            >
                                <X size={20} strokeWidth={2} />
                            </button>
                        </div>

                        <div className="products-scanner-video-wrapper">
                            <video
                                ref={videoRef}
                                className="products-scanner-video"
                            />

                            <div className="products-scanner-frame">
                                <span />
                                <span />
                                <span />
                                <span />
                                <div className="products-scanner-line" />
                            </div>
                        </div>

                        <div className="products-scanner-status">
                            <ScanLine size={17} strokeWidth={1.9} />
                            <span>
                                {scanning
                                    ? "Place the barcode inside the scanning frame."
                                    : "Starting camera..."}
                            </span>
                        </div>
                    </section>
                </div>
            )}

            {isUnknownProduct && (
                <section className="products-not-found-panel">
                    <div className="products-not-found-icon">
                        <SearchX size={35} strokeWidth={1.6} />
                    </div>

                    <span className="products-not-found-eyebrow">
                        Barcode Lookup
                    </span>

                    <h2>Product Information Not Found</h2>

                    <p>
                        This barcode is not registered in your product catalog
                        and no matching product information was returned by
                        Open Food Facts.
                    </p>

                    <div className="products-not-found-barcode">
                        <Barcode size={19} strokeWidth={1.9} />
                        <div>
                            <span>Scanned Barcode</span>
                            <strong>{product?.barcode || barcode}</strong>
                        </div>
                    </div>

                    <div className="products-not-found-note">
                        <Info size={17} strokeWidth={1.9} />
                        <span>
                            Verify the barcode and try scanning or entering it again.
                        </span>
                    </div>

                    <button
                        type="button"
                        className="products-not-found-reset"
                        onClick={clearLookup}
                    >
                        <RefreshCw size={17} strokeWidth={2} />
                        Try Another Barcode
                    </button>
                </section>
            )}

            {product && !isUnknownProduct && (
                <section className="products-result-panel">
                    <div className="products-result-header">
                        <div>
                            <span className="products-section-eyebrow">
                                Lookup Result
                            </span>

                            <h2>Product Information</h2>

                            <p>
                                Product information from your database or
                                Open Food Facts.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="products-result-clear"
                            onClick={clearLookup}
                        >
                            <X size={16} strokeWidth={2} />
                            Clear
                        </button>
                    </div>

                    <div className="products-result-content">
                        <div className="products-result-image-area">
                            <div className="products-result-image">
                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.product_name || "Product"}
                                    />
                                ) : (
                                    <Package size={50} strokeWidth={1.4} />
                                )}
                            </div>

                            <span className="products-result-category-label">
                                {formatProductCategory(product.category)}
                            </span>
                        </div>

                        <div className="products-result-details">
                            <div className="products-result-title">
                                <span
                                    className={
                                        lookupMeta?.exists
                                            ? "products-source-badge products-source-database"
                                            : "products-source-badge products-source-api"
                                    }
                                >
                                    {lookupMeta?.exists
                                        ? "Registered Product"
                                        : "Open Food Facts"}
                                </span>

                                <h3>{product.product_name}</h3>

                                <p title={product.brand || ""}>
                                    {formatProductBrand(product.brand)}
                                </p>
                            </div>

                            <div className="products-detail-grid">
                                <div>
                                    <span>Barcode</span>
                                    <strong className="products-mono">
                                        {product.barcode || "N/A"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Unit / Size</span>
                                    <strong>{product.unit || "N/A"}</strong>
                                </div>

                                <div>
                                    <span>Category</span>
                                    <strong title={product.category || ""}>
                                        {formatProductCategory(product.category)}
                                    </strong>
                                </div>

                                <div>
                                    <span>Data Source</span>
                                    <strong>
                                        {product.api_source || "Local Database"}
                                    </strong>
                                </div>
                            </div>

                            {canAddProduct && (
                                <div className="products-price-registration">
                                    <div>
                                        <span className="products-price-label">
                                            Selling Price
                                        </span>

                                        <p>
                                            Set the selling price before adding
                                            this product to your catalog.
                                        </p>
                                    </div>

                                    <div className="products-price-actions">
                                        <div className="products-price-input">
                                            <span>₱</span>

                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={sellingPrice}
                                                onChange={handlePriceChange}
                                                placeholder="0.00"
                                                disabled={loading}
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={addProduct}
                                            disabled={loading || !sellingPrice}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="products-button-spinner" />
                                                    Adding...
                                                </>
                                            ) : (
                                                <>
                                                    <Plus size={17} strokeWidth={2} />
                                                    Add Product
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {lookupMeta?.exists && (
                                <div className="products-existing-product">
                                    <div>
                                        <CheckCircle2 size={20} strokeWidth={2} />

                                        <div>
                                            <span>Already Registered</span>
                                            <p>This product is already in your catalog.</p>
                                        </div>
                                    </div>

                                    <strong>
                                        {formatCurrency(product.selling_price)}
                                    </strong>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            <section className="products-catalog-panel">
                <div className="products-catalog-header">
                    <div>

                        <h2>Product Catalog</h2>

                    </div>

                    <div className="products-catalog-search">
                        <Search size={18} strokeWidth={1.9} />

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) => {
                                setSearchTerm(event.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search products..."
                        />

                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchTerm("");
                                    setCurrentPage(1);
                                }}
                                aria-label="Clear search"
                            >
                                <X size={15} strokeWidth={2} />
                            </button>
                        )}
                    </div>
                </div>

                {catalogLoading ? (
                    <div className="products-loading-state">
                        <span className="products-loading-spinner" />
                        Loading product catalog...
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="products-empty-state">
                        <Package size={40} strokeWidth={1.4} />

                        <strong>
                            {searchTerm
                                ? "No matching products"
                                : "No products registered"}
                        </strong>

                        <span>
                            {searchTerm
                                ? "Try searching with another product name, barcode, brand, or category."
                                : "Registered products will appear here."}
                        </span>
                    </div>
                ) : (
                    <>
                        <div className="products-table-wrapper">
                            <table className="products-modern-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Barcode</th>
                                        <th>Brand</th>
                                        <th>Category</th>
                                        <th>Unit</th>
                                        <th>Price</th>
                                        <th>Source</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {pageProducts.map((item) => (
                                        <tr key={item.product_id}>
                                            <td>
                                                <div className="products-table-product">
                                                    <div className="products-table-image">
                                                        {item.image_url ? (
                                                            <img
                                                                src={item.image_url}
                                                                alt={item.product_name}
                                                            />
                                                        ) : (
                                                            <Package
                                                                size={22}
                                                                strokeWidth={1.5}
                                                            />
                                                        )}
                                                    </div>

                                                    <div>
                                                        <button
                                                            type="button"
                                                            onClick={() => openProductDetails(item)}
                                                            aria-label={`View details for ${item.product_name}`}
                                                            style={{
                                                                display: "block",
                                                                padding: 0,
                                                                color: "inherit",
                                                                background: "transparent",
                                                                border: 0,
                                                                font: "inherit",
                                                                fontWeight: 700,
                                                                textAlign: "left",
                                                                cursor: "pointer"
                                                            }}
                                                        >
                                                            {item.product_name}
                                                        </button>
                                                        <span>Product #{item.product_id}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <span className="products-table-barcode">
                                                    {item.barcode}
                                                </span>
                                            </td>

                                            <td title={item.brand || ""}>
                                                {formatProductBrand(item.brand)}
                                            </td>

                                            <td>
                                                <span
                                                    className="products-category-cell"
                                                    title={item.category || ""}
                                                >
                                                    {formatProductCategory(item.category)}
                                                </span>
                                            </td>

                                            <td>{item.unit || "N/A"}</td>

                                            <td>
                                                <strong className="products-table-price">
                                                    {formatCurrency(item.selling_price)}
                                                </strong>
                                            </td>

                                            <td>
                                                <span className="products-source-cell">
                                                    {item.api_source || "Database"}
                                                </span>
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        item.status === "active"
                                                            ? "products-status products-status-active"
                                                            : "products-status products-status-inactive"
                                                    }
                                                >
                                                    {item.status || "active"}
                                                </span>
                                            </td>

                                            <td>
                                                <button
                                                    type="button"
                                                    className="products-edit-button"
                                                    onClick={() => openEditModal(item)}
                                                    disabled={savingEdit}
                                                >
                                                    <Edit2 size={15} />
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="products-pagination">
                            <span>
                                Showing {firstVisibleProduct}–{lastVisibleProduct} of {filteredProducts.length} products
                            </span>
                            <div className="products-pagination-controls" aria-label="Product catalog pages">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                    disabled={visiblePage <= 1}
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft size={16} />
                                    Previous
                                </button>
                                <span>Page {visiblePage} of {totalPages}</span>
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                    disabled={visiblePage >= totalPages}
                                    aria-label="Next page"
                                >
                                    Next
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </section>

            {selectedProduct && (
                <div
                    className="products-edit-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeProductDetails();
                        }
                    }}
                >
                    <section
                        className="products-edit-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="products-details-title"
                    >
                        <div className="products-edit-header">
                            <div>
                                <span>Product Catalog</span>
                                <h2 id="products-details-title">
                                    {selectedProduct.product_name || "Product details"}
                                </h2>
                                <p>Product #{selectedProduct.product_id}</p>
                            </div>

                            <button
                                type="button"
                                onClick={closeProductDetails}
                                aria-label="Close product details"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div
                            className="products-result-content"
                            style={{
                                gridTemplateColumns: "110px minmax(0, 1fr)",
                                gap: "18px",
                                alignItems: "start"
                            }}
                        >
                            <div
                                className="products-result-image"
                                style={{ width: "110px" }}
                            >
                                {selectedProduct.image_url ? (
                                    <img
                                        src={selectedProduct.image_url}
                                        alt={selectedProduct.product_name || "Product"}
                                    />
                                ) : (
                                    <Package size={38} strokeWidth={1.5} />
                                )}
                            </div>

                            <div className="products-detail-grid">
                                <div>
                                    <span>Barcode</span>
                                    <strong className="products-mono">
                                        {selectedProduct.barcode || "N/A"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Brand</span>
                                    <strong>
                                        {formatProductBrand(selectedProduct.brand)}
                                    </strong>
                                </div>

                                <div>
                                    <span>Category</span>
                                    <strong>
                                        {formatProductCategory(selectedProduct.category)}
                                    </strong>
                                </div>

                                <div>
                                    <span>Unit / Size</span>
                                    <strong>{selectedProduct.unit || "N/A"}</strong>
                                </div>

                                <div>
                                    <span>Selling Price</span>
                                    <strong>
                                        {formatCurrency(selectedProduct.selling_price)}
                                    </strong>
                                </div>

                                <div>
                                    <span>Status</span>
                                    <strong>
                                        {selectedProduct.status || "active"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Data Source</span>
                                    <strong>
                                        {selectedProduct.api_source || "Database"}
                                    </strong>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {editingProduct && (
                <div
                    className="products-edit-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeEditModal();
                        }
                    }}
                >
                    <section
                        className="products-edit-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="products-edit-title"
                    >
                        <div className="products-edit-header">
                            <div>
                                <span>Edit Product</span>
                                <h2 id="products-edit-title">
                                    Update Product Information
                                </h2>
                                <p>Product #{editingProduct.product_id}</p>
                            </div>

                            <button
                                type="button"
                                onClick={closeEditModal}
                                disabled={savingEdit}
                                aria-label="Close edit modal"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="products-edit-fields">
                            <label>
                                Product Name
                                <input
                                    type="text"
                                    name="product_name"
                                    value={editForm.product_name}
                                    onChange={handleEditChange}
                                    disabled={savingEdit}
                                />
                            </label>

                            <label>
                                Barcode
                                <input
                                    type="text"
                                    value={editingProduct.barcode || ""}
                                    disabled
                                />
                            </label>

                            <label>
                                Brand
                                <input
                                    type="text"
                                    name="brand"
                                    value={editForm.brand}
                                    onChange={handleEditChange}
                                    disabled={savingEdit}
                                />
                            </label>

                            <label>
                                Category
                                <input
                                    type="text"
                                    name="category"
                                    value={editForm.category}
                                    onChange={handleEditChange}
                                    disabled={savingEdit}
                                />
                            </label>

                            <label>
                                Unit / Size
                                <input
                                    type="text"
                                    name="unit"
                                    value={editForm.unit}
                                    onChange={handleEditChange}
                                    disabled={savingEdit}
                                />
                            </label>

                            <label>
                                Selling Price (₱)
                                <input
                                    type="text"
                                    name="selling_price"
                                    inputMode="decimal"
                                    value={editForm.selling_price}
                                    onChange={handleEditChange}
                                    placeholder="0.00"
                                    disabled={savingEdit}
                                />
                            </label>
                        </div>

                        <div className="products-edit-footer">
                            <button
                                type="button"
                                className="products-edit-cancel"
                                onClick={closeEditModal}
                                disabled={savingEdit}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="products-edit-save"
                                onClick={saveProductChanges}
                                disabled={savingEdit}
                            >
                                {savingEdit ? (
                                    <>
                                        <span className="products-button-spinner" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={17} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}

export default Products;

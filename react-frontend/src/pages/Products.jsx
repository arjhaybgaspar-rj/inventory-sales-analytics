import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";

const API_BASE_URL = "http://localhost:5000/api";

function isValidEAN8(barcode) {
    if (!/^\d{8}$/.test(barcode)) {
        return false;
    }

    const digits = barcode.split("").map(Number);
    let total = 0;

    for (let i = 0; i < 7; i++) {
        total += digits[i] * (i % 2 === 0 ? 3 : 1);
    }

    const checkDigit = (10 - (total % 10)) % 10;

    return checkDigit === digits[7];
}

function isValidEAN13(barcode) {
    if (!/^\d{13}$/.test(barcode)) {
        return false;
    }

    const digits = barcode.split("").map(Number);
    let total = 0;

    for (let i = 0; i < 12; i++) {
        total += digits[i] * (i % 2 === 0 ? 1 : 3);
    }

    const checkDigit = (10 - (total % 10)) % 10;

    return checkDigit === digits[12];
}

function isValidUPCA(barcode) {
    if (!/^\d{12}$/.test(barcode)) {
        return false;
    }

    const digits = barcode.split("").map(Number);
    let total = 0;

    for (let i = 0; i < 11; i++) {
        total += digits[i] * (i % 2 === 0 ? 3 : 1);
    }

    const checkDigit = (10 - (total % 10)) % 10;

    return checkDigit === digits[11];
}

function isValidScannedBarcode(barcode) {
    if (!/^\d+$/.test(barcode)) {
        return false;
    }

    if (barcode.length === 8) {
        return isValidEAN8(barcode);
    }

    if (barcode.length === 12) {
        return isValidUPCA(barcode);
    }

    if (barcode.length === 13) {
        return isValidEAN13(barcode);
    }

    if (barcode.length === 14) {
        return isValidEAN13(barcode.slice(1));
    }

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
    const [sellingPrice, setSellingPrice] = useState("");
    const [scannerOpen, setScannerOpen] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const loadProducts = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/products`,
                {
                    credentials: "include"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.message ||
                    "Unable to load products."
                );
                return;
            }

            setProducts(
                Array.isArray(data.products)
                    ? data.products
                    : []
            );
        } catch (err) {
            setError(
                "Unable to connect to the backend."
            );
        }
    };

    const stopCamera = () => {
        scanningRef.current = false;
        setScanning(false);

        lastDetectedRef.current = "";
        detectionCountRef.current = 0;

        if (readerRef.current) {
            try {
                readerRef.current.reset();
            } catch (err) {
            }

            readerRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current
                .getTracks()
                .forEach((track) => {
                    track.stop();
                });

            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    const lookupBarcode = async (value = barcode) => {
        const cleanBarcode = value.trim();

        if (!cleanBarcode) {
            setError("Please enter a barcode.");
            return;
        }

        if (!/^\d+$/.test(cleanBarcode)) {
            setError(
                "Barcode must contain numbers only."
            );
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");
        setProduct(null);
        setSellingPrice("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/barcode/lookup?barcode=${encodeURIComponent(
                    cleanBarcode
                )}`,
                {
                    credentials: "include"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.message ||
                    "Barcode lookup failed."
                );
                return;
            }

            setBarcode(cleanBarcode);

            if (data.exists) {
                setProduct(data.product);

                setSellingPrice(
                    data.product.selling_price !== null &&
                    data.product.selling_price !== undefined
                        ? String(
                            data.product.selling_price
                        )
                        : ""
                );

                setMessage(
                    "This product is already in your product list."
                );

                return;
            }

            if (data.found_in_api) {
                setProduct(data.product);
                setSellingPrice("");

                setMessage(
                    "Product found. Enter the selling price before adding it."
                );

                return;
            }

            setProduct(data.product);
            setSellingPrice("");

            setMessage(
                "Product barcode was not found in Open Food Facts."
            );
        } catch (err) {
            setError(
                "Unable to connect to the backend."
            );
        } finally {
            setLoading(false);
        }
    };

    const startScanner = async () => {
        setError("");
        setMessage("");
        setProduct(null);
        setSellingPrice("");
        setScannerOpen(true);

        lastDetectedRef.current = "";
        detectionCountRef.current = 0;

        try {
            const stream =
                await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: {
                            ideal: "environment"
                        },
                        width: {
                            ideal: 1280
                        },
                        height: {
                            ideal: 720
                        }
                    },
                    audio: false
                });

            streamRef.current = stream;

            if (!videoRef.current) {
                stream
                    .getTracks()
                    .forEach((track) => {
                        track.stop();
                    });

                return;
            }

            videoRef.current.srcObject = stream;
            videoRef.current.setAttribute(
                "playsinline",
                "true"
            );
            videoRef.current.muted = true;

            await videoRef.current.play();

            const hints = new Map();

            hints.set(
                DecodeHintType.POSSIBLE_FORMATS,
                [
                    BarcodeFormat.EAN_13,
                    BarcodeFormat.EAN_8,
                    BarcodeFormat.UPC_A
                ]
            );

            hints.set(
                DecodeHintType.TRY_HARDER,
                true
            );

            const reader =
                new BrowserMultiFormatReader(
                    hints
                );

            readerRef.current = reader;
            scanningRef.current = true;

            setScanning(true);

            reader.decodeFromVideoElement(
                videoRef.current,
                (result) => {
                    if (!scanningRef.current) {
                        return;
                    }

                    if (!result) {
                        return;
                    }

                    const detectedBarcode =
                        result.getText();

                    if (!detectedBarcode) {
                        return;
                    }

                    if (
                        !/^\d+$/.test(
                            detectedBarcode
                        )
                    ) {
                        lastDetectedRef.current = "";
                        detectionCountRef.current = 0;
                        return;
                    }

                    if (
                        !isValidScannedBarcode(
                            detectedBarcode
                        )
                    ) {
                        lastDetectedRef.current = "";
                        detectionCountRef.current = 0;
                        return;
                    }

                    if (
                        lastDetectedRef.current ===
                        detectedBarcode
                    ) {
                        detectionCountRef.current += 1;
                    } else {
                        lastDetectedRef.current =
                            detectedBarcode;
                        detectionCountRef.current = 1;
                    }

                    if (
                        detectionCountRef.current < 2
                    ) {
                        return;
                    }

                    scanningRef.current = false;

                    setBarcode(
                        detectedBarcode
                    );

                    stopCamera();
                    setScannerOpen(false);

                    lookupBarcode(
                        detectedBarcode
                    );
                }
            );
        } catch (err) {
            setScannerOpen(false);
            setScanning(false);

            stopCamera();

            if (
                err.name ===
                "NotAllowedError"
            ) {
                setError(
                    "Camera permission was denied. Please allow camera access."
                );
            } else if (
                err.name ===
                "NotFoundError"
            ) {
                setError(
                    "No camera was found on this device."
                );
            } else {
                setError(
                    "Unable to open the camera."
                );
            }
        }
    };

    const closeScanner = () => {
        stopCamera();
        setScannerOpen(false);
    };

    const handlePriceChange = (e) => {
        const value = e.target.value;

        if (/^\d*\.?\d{0,2}$/.test(value)) {
            setSellingPrice(value);
        }
    };

    const addProduct = async () => {
        if (!product) {
            return;
        }

        if (
            product.selling_price !== null &&
            product.selling_price !== undefined
        ) {
            setError(
                "This product is already in your product list."
            );

            return;
        }

        if (!sellingPrice) {
            setError(
                "Selling price is required."
            );

            return;
        }

        const price = Number(
            sellingPrice
        );

        if (price <= 0) {
            setError(
                "Selling price must be greater than 0."
            );

            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/products`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        barcode:
                            product.barcode,
                        product_name:
                            product.product_name,
                        category:
                            product.category,
                        brand:
                            product.brand,
                        image_url:
                            product.image_url,
                        api_source:
                            product.api_source,
                        unit:
                            product.unit,
                        selling_price:
                            price
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                setError(
                    data.message ||
                    "Unable to add product."
                );

                return;
            }

            setMessage(
                "Product added successfully."
            );

            setProduct({
                ...product,
                selling_price: price
            });

            setSellingPrice(
                String(price)
            );

            await loadProducts();
        } catch (err) {
            setError(
                "Unable to connect to the backend."
            );
        } finally {
            setLoading(false);
        }
    };

    const clearLookup = () => {
        setBarcode("");
        setProduct(null);
        setSellingPrice("");
        setMessage("");
        setError("");
    };

    useEffect(() => {
        loadProducts();

        return () => {
            stopCamera();
        };
    }, []);

    return (
        <div className="products-page">
            <div className="products-header">
                <div>
                    <h1>Products</h1>

                    <p>
                        Manage your products and
                        barcode information.
                    </p>
                </div>
            </div>

            {error && (
                <div className="sales-message">
                    {error}
                </div>
            )}

            {message && (
                <div className="sales-message">
                    {message}
                </div>
            )}

            <div className="barcode-section">
                <h2>Barcode Lookup</h2>

                <p>
                    Enter a barcode manually or use
                    the camera scanner.
                </p>

                <div className="barcode-form">
                    <input
                        type="text"
                        value={barcode}
                        onChange={(e) => {
                            const value =
                                e.target.value;

                            if (
                                /^\d*$/.test(
                                    value
                                )
                            ) {
                                setBarcode(
                                    value
                                );
                            }
                        }}
                        placeholder="Enter barcode"
                        inputMode="numeric"
                    />

                    <button
                        type="button"
                        onClick={() =>
                            lookupBarcode()
                        }
                        disabled={loading}
                    >
                        Lookup
                    </button>

                    <button
                        type="button"
                        onClick={startScanner}
                        disabled={loading}
                    >
                        Scan Barcode
                    </button>
                </div>
            </div>

            {scannerOpen && (
                <div className="barcode-scanner">
                    <div className="scanner-header">
                        <div>
                            <h3>
                                Scan Barcode
                            </h3>

                            <p>
                                {scanning
                                    ? "Point the camera at the product barcode."
                                    : "Starting camera..."}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={
                                closeScanner
                            }
                        >
                            Close Scanner
                        </button>
                    </div>

                    <div className="scanner-video-wrapper">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className="scanner-video"
                        />

                        <div className="scanner-frame">
                            <span></span>
                        </div>
                    </div>

                    <p className="scanner-status">
                        Place the barcode inside
                        the scanning frame.
                    </p>
                </div>
            )}

            {loading && (
                <div className="loading-box">
                    Processing...
                </div>
            )}

            {product && (
                <div className="barcode-section">
                    <div className="products-list-header">
                        <div>
                            <h2>
                                Product Information
                            </h2>

                            <p>
                                Product details from
                                your database or Open
                                Food Facts.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={
                                clearLookup
                            }
                        >
                            Clear
                        </button>
                    </div>

                    <div className="product-result">
                        <div>
                            {product.image_url ? (
                                <img
                                    src={
                                        product.image_url
                                    }
                                    alt={
                                        product.product_name ||
                                        "Product"
                                    }
                                    className="product-image"
                                />
                            ) : (
                                <div className="product-image">
                                    No Image
                                </div>
                            )}
                        </div>

                        <div className="product-details">
                            <h3>
                                {product.product_name ||
                                    "Unknown Product"}
                            </h3>

                            <div className="detail-row">
                                <span className="detail-label">
                                    Barcode
                                </span>

                                <span className="detail-value">
                                    {product.barcode ||
                                        "N/A"}
                                </span>
                            </div>

                            <div className="detail-row">
                                <span className="detail-label">
                                    Brand
                                </span>

                                <span className="detail-value">
                                    {product.brand ||
                                        "N/A"}
                                </span>
                            </div>

                            <div className="detail-row">
                                <span className="detail-label">
                                    Category
                                </span>

                                <span className="detail-value">
                                    {product.category ||
                                        "N/A"}
                                </span>
                            </div>

                            <div className="detail-row">
                                <span className="detail-label">
                                    Unit
                                </span>

                                <span className="detail-value">
                                    {product.unit ||
                                        "N/A"}
                                </span>
                            </div>

                            <div className="detail-row">
                                <span className="detail-label">
                                    API Source
                                </span>

                                <span className="detail-value">
                                    {product.api_source ||
                                        "Database"}
                                </span>
                            </div>

                            {product.selling_price ===
                                null ||
                            product.selling_price ===
                                undefined ? (
                                <div className="price-field">
                                    <label htmlFor="selling-price">
                                        Selling Price
                                    </label>

                                    <input
                                        id="selling-price"
                                        type="text"
                                        inputMode="decimal"
                                        value={
                                            sellingPrice
                                        }
                                        onChange={
                                            handlePriceChange
                                        }
                                        placeholder="Enter selling price"
                                    />

                                    <button
                                        type="button"
                                        onClick={
                                            addProduct
                                        }
                                        disabled={
                                            loading
                                        }
                                    >
                                        Add Product
                                    </button>
                                </div>
                            ) : (
                                <div className="detail-row">
                                    <span className="detail-label">
                                        Selling Price
                                    </span>

                                    <span className="detail-value">
                                        ₱
                                        {Number(
                                            product.selling_price
                                        ).toFixed(
                                            2
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="products-list-section">
                <div className="products-list-header">
                    <div>
                        <h2>
                            Product List
                        </h2>

                        <p>
                            {products.length}{" "}
                            {products.length ===
                            1
                                ? "product"
                                : "products"}{" "}
                            registered in your
                            inventory system.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={
                            loadProducts
                        }
                        disabled={loading}
                    >
                        Refresh
                    </button>
                </div>

                {products.length === 0 ? (
                    <div className="sales-empty-state">
                        No products available.
                    </div>
                ) : (
                    <div className="products-table-container">
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>
                                        Image
                                    </th>
                                    <th>
                                        Barcode
                                    </th>
                                    <th>
                                        Product
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
                                                            item.product_name ||
                                                            "Product"
                                                        }
                                                        className="product-table-image"
                                                    />
                                                ) : (
                                                    "No Image"
                                                )}
                                            </td>

                                            <td>
                                                <span className="product-barcode">
                                                    {
                                                        item.barcode
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                <strong>
                                                    {
                                                        item.product_name
                                                    }
                                                </strong>
                                            </td>

                                            <td>
                                                {
                                                    item.brand ||
                                                    "N/A"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item.category ||
                                                    "N/A"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item.unit ||
                                                    "N/A"
                                                }
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
            </div>
        </div>
    );
}

export default Products;
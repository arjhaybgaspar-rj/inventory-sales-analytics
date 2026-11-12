import { useEffect, useRef, useState } from "react";
import { API_URL } from "../../services/api";
import "./ReceiptModal.css";

function formatCurrency(value) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number(value) || 0);
}

function formatDateTime(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en-PH", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(date);
}

function ReceiptModal({ saleId, onClose }) {
    const [receipt, setReceipt] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const closeButtonRef = useRef(null);

    useEffect(() => {
        if (!saleId) {
            setReceipt(null);
            setError("");
            return undefined;
        }

        const controller = new AbortController();
        setLoading(true);
        setError("");
        setReceipt(null);

        fetch(`${API_URL}/sales/${saleId}`, {
            credentials: "include",
            signal: controller.signal
        })
            .then(async (response) => {
                const data = await response.json().catch(() => ({}));
                if (!response.ok || data.success !== true || !data.receipt) {
                    throw new Error(data.message || "Unable to load this receipt.");
                }
                return data.receipt;
            })
            .then(setReceipt)
            .catch((requestError) => {
                if (requestError.name !== "AbortError") {
                    setError(requestError.message || "Unable to load this receipt.");
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, [saleId]);

    useEffect(() => {
        if (!saleId) return undefined;

        const previousOverflow = document.body.style.overflow;
        const handleKeyDown = (event) => {
            if (event.key === "Escape") onClose();
        };

        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", handleKeyDown);
        closeButtonRef.current?.focus();

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [saleId, onClose]);

    if (!saleId) return null;

    return (
        <div
            className="receipt-modal-backdrop"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <section
                className="receipt-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="receipt-modal-title"
                id="receipt-print-area"
            >
                <header className="receipt-modal-header">
                    <div>
                        <span className="receipt-modal-eyebrow">Completed transaction</span>
                        <h2 id="receipt-modal-title">Sale receipt</h2>
                    </div>
                    <button
                        ref={closeButtonRef}
                        type="button"
                        className="receipt-icon-button receipt-close-button"
                        onClick={onClose}
                        aria-label="Close receipt"
                    >
                        ×
                    </button>
                </header>

                {loading ? (
                    <div className="receipt-state" role="status">Loading receipt…</div>
                ) : error ? (
                    <div className="receipt-state receipt-error" role="alert">
                        <p>{error}</p>
                        <button type="button" className="receipt-secondary-button" onClick={onClose}>Close</button>
                    </div>
                ) : receipt ? (
                    <>
                        <div className="receipt-summary">
                            <div><span>Receipt</span><strong>#{receipt.sale_id}</strong></div>
                            <div><span>Date and time</span><strong>{formatDateTime(receipt.sale_date)}</strong></div>
                            <div><span>Cashier</span><strong>{receipt.cashier || "Staff"}</strong></div>
                            <div><span>Payment</span><strong className="receipt-payment-label">{String(receipt.payment_method || "—").toUpperCase()}</strong></div>
                        </div>

                        <div className="receipt-items-wrap">
                            <table className="receipt-items-table">
                                <thead>
                                    <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
                                </thead>
                                <tbody>
                                    {(receipt.items || []).map((item, index) => (
                                        <tr key={`${item.product_id}-${item.unit_price}-${index}`}>
                                            <td>
                                                <strong>{item.product_name || "Product"}</strong>
                                                {item.unit && <small>{item.unit}</small>}
                                            </td>
                                            <td>{item.quantity}</td>
                                            <td>{formatCurrency(item.unit_price)}</td>
                                            <td>{formatCurrency(item.subtotal)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {(!receipt.items || receipt.items.length === 0) && (
                            <p className="receipt-empty-items">No item details were found for this sale.</p>
                        )}

                        <div className="receipt-total-row">
                            <span>Total paid</span>
                            <strong>{formatCurrency(receipt.total_amount)}</strong>
                        </div>

                        <footer className="receipt-modal-actions">
                            <button type="button" className="receipt-secondary-button receipt-screen-only" onClick={onClose}>Close</button>
                            <button type="button" className="receipt-primary-button receipt-screen-only" onClick={() => window.print()}>Print receipt</button>
                        </footer>
                    </>
                ) : null}
            </section>
        </div>
    );
}

export default ReceiptModal;

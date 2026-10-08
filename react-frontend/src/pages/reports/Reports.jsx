import {
    AlertTriangle,
    Banknote,
    BarChart3,
    Boxes,
    CheckCircle2,
    CircleDollarSign,
    Clock3,
    CreditCard,
    Package,
    ReceiptText,
    RefreshCw,
    ShoppingBag,
    Smartphone,
    Sparkles,
    TrendingUp,
    Trophy,
    WalletCards
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    API_URL
} from "../../services/api";

import "./Reports.css";


function Reports() {
    const [summary, setSummary] =
        useState(null);

    const [topProducts, setTopProducts] =
        useState([]);

    const [
        paymentMethods,
        setPaymentMethods
    ] = useState([]);

    const [recentSales, setRecentSales] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [message, setMessage] =
        useState("");


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


    const formatDateTime = (
        value
    ) => {
        if (!value) {
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
        ).format(
            new Date(value)
        );
    };


    const loadReports =
        async () => {
            setLoading(true);
            setMessage("");

            try {
                const [
                    summaryResponse,
                    topProductsResponse,
                    paymentsResponse,
                    recentSalesResponse
                ] = await Promise.all([
                    fetch(
                        `${API_URL}/reports/summary`,
                        {
                            credentials:
                                "include"
                        }
                    ),

                    fetch(
                        `${API_URL}/reports/top-products`,
                        {
                            credentials:
                                "include"
                        }
                    ),

                    fetch(
                        `${API_URL}/reports/payment-methods`,
                        {
                            credentials:
                                "include"
                        }
                    ),

                    fetch(
                        `${API_URL}/reports/recent-sales`,
                        {
                            credentials:
                                "include"
                        }
                    )
                ]);


                const [
                    summaryData,
                    topProductsData,
                    paymentsData,
                    recentSalesData
                ] = await Promise.all([
                    summaryResponse.json(),
                    topProductsResponse.json(),
                    paymentsResponse.json(),
                    recentSalesResponse.json()
                ]);


                if (summaryData.success) {
                    setSummary(
                        summaryData.summary
                    );
                }


                if (
                    topProductsData.success
                ) {
                    setTopProducts(
                        Array.isArray(
                            topProductsData.products
                        )
                            ? topProductsData.products
                            : []
                    );
                }


                if (
                    paymentsData.success
                ) {
                    setPaymentMethods(
                        Array.isArray(
                            paymentsData.payment_methods
                        )
                            ? paymentsData.payment_methods
                            : []
                    );
                }


                if (
                    recentSalesData.success
                ) {
                    setRecentSales(
                        Array.isArray(
                            recentSalesData.sales
                        )
                            ? recentSalesData.sales
                            : []
                    );
                }


                if (
                    !summaryData.success ||
                    !topProductsData.success ||
                    !paymentsData.success ||
                    !recentSalesData.success
                ) {
                    setMessage(
                        "Some report information could not be loaded."
                    );
                }
            } catch (error) {
                console.error(
                    "Reports error:",
                    error
                );

                setMessage(
                    "Unable to connect to the backend."
                );
            } finally {
                setLoading(false);
            }
        };


    useEffect(() => {
        loadReports();
    }, []);


    const averageSale =
        Number(
            summary?.total_transactions ||
                0
        ) > 0
            ? Number(
                  summary?.total_sales ||
                      0
              ) /
              Number(
                  summary.total_transactions
              )
            : 0;


    const averageItems =
        Number(
            summary?.total_transactions ||
                0
        ) > 0
            ? Number(
                  summary?.total_items_sold ||
                      0
              ) /
              Number(
                  summary.total_transactions
              )
            : 0;


    const maxQuantity =
        useMemo(() => {
            if (
                topProducts.length === 0
            ) {
                return 0;
            }

            return Math.max(
                ...topProducts.map(
                    (item) =>
                        Number(
                            item.total_quantity_sold ||
                                0
                        )
                )
            );
        }, [topProducts]);


    const paymentTotal =
        useMemo(() => {
            return paymentMethods.reduce(
                (
                    total,
                    method
                ) =>
                    total +
                    Number(
                        method.total_sales ||
                            0
                    ),
                0
            );
        }, [paymentMethods]);


    const paymentColor = (
        method
    ) => {
        const value =
            String(
                method || ""
            ).toLowerCase();

        if (value === "cash") {
            return "#2563eb";
        }

        if (value === "gcash") {
            return "#10b981";
        }

        if (value === "card") {
            return "#8b5cf6";
        }

        return "#64748b";
    };


    const paymentGradient =
        useMemo(() => {
            if (
                !paymentMethods.length ||
                paymentTotal <= 0
            ) {
                return "conic-gradient(#e2e8f0 0% 100%)";
            }

            let start = 0;

            const sections =
                paymentMethods.map(
                    (method) => {
                        const amount =
                            Number(
                                method.total_sales ||
                                    0
                            );

                        const percentage =
                            (
                                amount /
                                paymentTotal
                            ) * 100;

                        const end =
                            start +
                            percentage;

                        const section =
                            `${paymentColor(
                                method.payment_method
                            )} ${start}% ${end}%`;

                        start = end;

                        return section;
                    }
                );


            return `conic-gradient(${sections.join(
                ", "
            )})`;
        }, [
            paymentMethods,
            paymentTotal
        ]);


    const paymentIcon = (
        method
    ) => {
        const value =
            String(
                method || ""
            ).toLowerCase();

        if (value === "cash") {
            return Banknote;
        }

        if (value === "gcash") {
            return Smartphone;
        }

        return CreditCard;
    };


    const paymentPercentage = (
        amount
    ) => {
        if (paymentTotal <= 0) {
            return 0;
        }

        return Math.round(
            (
                Number(
                    amount || 0
                ) /
                paymentTotal
            ) *
                100
        );
    };


    const summaryCards = [
        {
            title: "Total Sales",

            value:
                formatCurrency(
                    summary?.total_sales
                ),

            description:
                "Recorded sales revenue",

            icon:
                CircleDollarSign,

            variant:
                "blue"
        },

        {
            title:
                "Transactions",

            value:
                summary?.total_transactions ??
                0,

            description:
                "Completed transactions",

            icon:
                WalletCards,

            variant:
                "green"
        },

        {
            title:
                "Items Sold",

            value:
                summary?.total_items_sold ??
                0,

            description:
                "Total units sold",

            icon:
                ShoppingBag,

            variant:
                "purple"
        },

        {
            title:
                "Active Products",

            value:
                summary?.total_products ??
                0,

            description:
                "Catalog products",

            icon:
                Package,

            variant:
                "orange"
        }
    ];


    return (
        <div className="premium-reports-page">
            <header className="reports-header">
                <div>
                    <span className="reports-eyebrow">
                        <Sparkles
                            size={15}
                            strokeWidth={2}
                        />

                        Business Intelligence
                    </span>

                    <h1>
                        Reports
                    </h1>

                    <p>
                        Analyze sales,
                        products, inventory,
                        and payment activity
                        using real system data.
                    </p>
                </div>


                <button
                    type="button"
                    className="reports-refresh"
                    onClick={
                        loadReports
                    }
                    disabled={
                        loading
                    }
                >
                    <RefreshCw
                        size={17}
                        className={
                            loading
                                ? "reports-spin"
                                : ""
                        }
                    />

                    {loading
                        ? "Refreshing"
                        : "Refresh Reports"}
                </button>
            </header>


            {message && (
                <div className="reports-message">
                    <AlertTriangle
                        size={18}
                    />

                    {
                        message
                    }
                </div>
            )}


            <section className="reports-kpi-grid">
                {summaryCards.map(
                    (card) => {
                        const Icon =
                            card.icon;

                        return (
                            <article
                                key={
                                    card.title
                                }
                                className={`reports-kpi-card reports-kpi-${card.variant}`}
                            >
                                <div className="reports-kpi-top">
                                    <div className="reports-kpi-icon">
                                        <Icon
                                            size={22}
                                        />
                                    </div>

                                    <span>
                                        {
                                            card.title
                                        }
                                    </span>
                                </div>

                                <strong>
                                    {loading
                                        ? "..."
                                        : card.value}
                                </strong>

                                <p>
                                    {
                                        card.description
                                    }
                                </p>
                            </article>
                        );
                    }
                )}
            </section>


            <section className="reports-secondary-grid">
                <article>
                    <div className="reports-secondary-icon blue">
                        <Boxes
                            size={21}
                        />
                    </div>

                    <div>
                        <span>
                            Total Stock
                        </span>

                        <strong>
                            {summary?.total_stock ??
                                0}
                        </strong>
                    </div>
                </article>


                <article>
                    <div className="reports-secondary-icon orange">
                        <AlertTriangle
                            size={21}
                        />
                    </div>

                    <div>
                        <span>
                            Low Stock
                        </span>

                        <strong>
                            {summary?.low_stock_items ??
                                0}
                        </strong>
                    </div>
                </article>


                <article>
                    <div className="reports-secondary-icon purple">
                        <Clock3
                            size={21}
                        />
                    </div>

                    <div>
                        <span>
                            Expiring Soon
                        </span>

                        <strong>
                            {summary?.expiring_items ??
                                0}
                        </strong>
                    </div>
                </article>


                <article>
                    <div className="reports-secondary-icon green">
                        <TrendingUp
                            size={21}
                        />
                    </div>

                    <div>
                        <span>
                            Average Sale
                        </span>

                        <strong className="reports-money">
                            {formatCurrency(
                                averageSale
                            )}
                        </strong>
                    </div>
                </article>
            </section>


            <section className="reports-main-grid">
                <article className="reports-panel">
                    <div className="reports-panel-title">
                        <div className="reports-panel-icon">
                            <Trophy
                                size={23}
                            />
                        </div>

                        <div>
                            <span>
                                Product
                                Performance
                            </span>

                            <h2>
                                Top Selling
                                Products
                            </h2>

                            <p>
                                Products ranked
                                according to
                                quantity sold.
                            </p>
                        </div>
                    </div>


                    <div className="reports-ranking-list">
                        {topProducts.length ===
                        0 ? (
                            <div className="reports-empty">
                                <Package
                                    size={38}
                                />

                                <strong>
                                    No sales data
                                </strong>

                                <span>
                                    Product
                                    performance
                                    appears after
                                    sales are
                                    completed.
                                </span>
                            </div>
                        ) : (
                            topProducts.map(
                                (
                                    product,
                                    index
                                ) => {
                                    const width =
                                        maxQuantity >
                                        0
                                            ? (
                                                  Number(
                                                      product.total_quantity_sold ||
                                                          0
                                                  ) /
                                                  maxQuantity
                                              ) *
                                              100
                                            : 0;

                                    return (
                                        <div
                                            className="reports-ranking-item"
                                            key={
                                                product.product_id
                                            }
                                        >
                                            <div className="reports-ranking-row">
                                                <div className="reports-ranking-product">
                                                    <span className="reports-rank">
                                                        #
                                                        {index +
                                                            1}
                                                    </span>

                                                    <div>
                                                        <strong>
                                                            {
                                                                product.product_name
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                product.barcode
                                                            }
                                                        </span>
                                                    </div>
                                                </div>


                                                <div className="reports-ranking-values">
                                                    <strong>
                                                        {
                                                            product.total_quantity_sold
                                                        }{" "}
                                                        units
                                                    </strong>

                                                    <span>
                                                        {formatCurrency(
                                                            product.total_sales
                                                        )}
                                                    </span>
                                                </div>
                                            </div>


                                            <div className="reports-ranking-bar">
                                                <div
                                                    style={{
                                                        width:
                                                            `${width}%`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                }
                            )
                        )}
                    </div>
                </article>


                <article className="reports-panel">
                    <div className="reports-panel-title">
                        <div className="reports-panel-icon payment">
                            <CreditCard
                                size={23}
                            />
                        </div>

                        <div>
                            <span>
                                Sales Mix
                            </span>

                            <h2>
                                Payment Methods
                            </h2>

                            <p>
                                Revenue
                                distribution by
                                payment type.
                            </p>
                        </div>
                    </div>


                    <div className="reports-donut-area">
                        <div
                            className="reports-donut"
                            style={{
                                background:
                                    paymentGradient
                            }}
                        >
                            <div className="reports-donut-center">
                                <strong>
                                    {formatCurrency(
                                        paymentTotal
                                    )}
                                </strong>

                                <span>
                                    Total
                                </span>
                            </div>
                        </div>
                    </div>


                    <div className="reports-payment-list">
                        {paymentMethods.map(
                            (
                                payment
                            ) => {
                                const Icon =
                                    paymentIcon(
                                        payment.payment_method
                                    );

                                return (
                                    <div
                                        className="reports-payment-item"
                                        key={
                                            payment.payment_method
                                        }
                                    >
                                        <div
                                            className="reports-payment-icon"
                                            style={{
                                                color:
                                                    paymentColor(
                                                        payment.payment_method
                                                    )
                                            }}
                                        >
                                            <Icon
                                                size={19}
                                            />
                                        </div>

                                        <div className="reports-payment-details">
                                            <div>
                                                <strong>
                                                    {
                                                        payment.payment_method
                                                    }
                                                </strong>

                                                <span>
                                                    {paymentPercentage(
                                                        payment.total_sales
                                                    )}
                                                    %
                                                </span>
                                            </div>

                                            <div>
                                                <span>
                                                    {payment.transaction_count ??
                                                        0}{" "}
                                                    transactions
                                                </span>

                                                <strong>
                                                    {formatCurrency(
                                                        payment.total_sales
                                                    )}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        )}
                    </div>
                </article>
            </section>


            <section className="reports-performance-panel">
                <div className="reports-section-heading">
                    <span>
                        Performance Snapshot
                    </span>

                    <h2>
                        Operational Metrics
                    </h2>

                    <p>
                        Additional insights
                        calculated from your
                        current report data.
                    </p>
                </div>


                <div className="reports-performance-grid">
                    <article>
                        <CircleDollarSign
                            size={23}
                        />

                        <span>
                            Average Sale
                        </span>

                        <strong>
                            {formatCurrency(
                                averageSale
                            )}
                        </strong>
                    </article>


                    <article>
                        <ShoppingBag
                            size={23}
                        />

                        <span>
                            Items Per Sale
                        </span>

                        <strong>
                            {averageItems.toFixed(
                                1
                            )}
                        </strong>
                    </article>


                    <article>
                        <Package
                            size={23}
                        />

                        <span>
                            Product Lines
                        </span>

                        <strong>
                            {summary?.total_products ??
                                0}
                        </strong>
                    </article>


                    <article>
                        <AlertTriangle
                            size={23}
                        />

                        <span>
                            Stock Attention
                        </span>

                        <strong>
                            {Number(
                                summary?.low_stock_items ||
                                    0
                            ) +
                                Number(
                                    summary?.expiring_items ||
                                        0
                                )}
                        </strong>
                    </article>
                </div>
            </section>


            <section className="reports-sales-panel">
                <div className="reports-panel-title">
                    <div className="reports-panel-icon">
                        <ReceiptText
                            size={23}
                        />
                    </div>

                    <div>
                        <span>
                            Transaction
                            Activity
                        </span>

                        <h2>
                            Recent Sales
                        </h2>

                        <p>
                            Latest completed
                            sales recorded by
                            the system.
                        </p>
                    </div>
                </div>


                <div className="reports-table-wrapper">
                    <table className="reports-modern-table">
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
                            {recentSales.map(
                                (
                                    sale
                                ) => (
                                    <tr
                                        key={
                                            sale.sale_id
                                        }
                                    >
                                        <td>
                                            <strong className="reports-sale-id">
                                                #
                                                {
                                                    sale.sale_id
                                                }
                                            </strong>
                                        </td>

                                        <td>
                                            {sale.full_name ||
                                                sale.username ||
                                                "User"}
                                        </td>

                                        <td>
                                            <span className={`reports-payment-badge reports-payment-${sale.payment_method}`}>
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
                                            <strong className="reports-sale-total">
                                                {formatCurrency(
                                                    sale.total_amount
                                                )}
                                            </strong>
                                        </td>

                                        <td>
                                            <span className="reports-completed">
                                                <CheckCircle2
                                                    size={14}
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
            </section>
        </div>
    );
}

export default Reports;
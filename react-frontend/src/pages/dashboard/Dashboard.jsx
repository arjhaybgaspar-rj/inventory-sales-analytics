import {
    AlertTriangle,
    ArrowRight,
    Boxes,
    CalendarDays,
    CheckCircle2,
    CircleDollarSign,
    Clock3,
    Package,
    RefreshCw,
    ShoppingBag,
    Sparkles,
    TrendingUp,
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

import "./Dashboard.css";


function Dashboard() {
    const [
        user,
        setUser
    ] = useState(null);

    const [
        summary,
        setSummary
    ] = useState(null);

    const [
        inventory,
        setInventory
    ] = useState([]);

    const [
        recentSales,
        setRecentSales
    ] = useState([]);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        message,
        setMessage
    ] = useState("");


    useEffect(() => {
        const storedUser =
            localStorage.getItem(
                "user"
            );

        if (!storedUser) {
            window.location.href =
                "/";

            return;
        }

        try {
            setUser(
                JSON.parse(
                    storedUser
                )
            );
        } catch (error) {
            console.error(
                "Invalid stored user:",
                error
            );

            localStorage.removeItem(
                "user"
            );

            window.location.href =
                "/";
        }
    }, []);


    const normalizedRole =
        String(
            user?.role || ""
        ).toLowerCase();


    const canManage =
        [
            "admin",
            "owner",
            "manager"
        ].includes(
            normalizedRole
        );


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
            return new Date(
                value
            );
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
            parseDateOnly(
                value
            );

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
                month:
                    "short",

                day:
                    "numeric",

                year:
                    "numeric"
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
        ).format(date);
    };


    const loadManagerDashboard =
        async () => {
            const [
                summaryResponse,
                inventoryResponse,
                salesResponse
            ] = await Promise.all([
                fetch(
                    `${API_URL}/reports/summary`,
                    {
                        credentials:
                            "include"
                    }
                ),

                fetch(
                    `${API_URL}/inventory`,
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
                inventoryData,
                salesData
            ] = await Promise.all([
                summaryResponse.json(),
                inventoryResponse.json(),
                salesResponse.json()
            ]);


            if (
                summaryResponse.ok &&
                summaryData.success
            ) {
                setSummary(
                    summaryData.summary
                );
            } else {
                setSummary(null);
            }


            if (
                inventoryResponse.ok &&
                inventoryData.success
            ) {
                setInventory(
                    Array.isArray(
                        inventoryData.inventory
                    )
                        ? inventoryData.inventory
                        : []
                );
            } else {
                setInventory([]);
            }


            if (
                salesResponse.ok &&
                salesData.success
            ) {
                setRecentSales(
                    Array.isArray(
                        salesData.sales
                    )
                        ? salesData.sales
                        : []
                );
            } else {
                setRecentSales([]);
            }


            if (
                !summaryResponse.ok ||
                !summaryData.success ||
                !inventoryResponse.ok ||
                !inventoryData.success ||
                !salesResponse.ok ||
                !salesData.success
            ) {
                setMessage(
                    "Some dashboard information could not be loaded."
                );
            }
        };


    const loadCashierDashboard =
        async () => {
            /*
                Cashiers cannot use the
                manager-only /reports and
                /inventory endpoints.

                We only use endpoints that
                the backend already permits
                for cashier accounts.
            */

            const [
                salesResponse,
                productsResponse
            ] = await Promise.all([
                fetch(
                    `${API_URL}/sales`,
                    {
                        credentials:
                            "include"
                    }
                ),

                fetch(
                    `${API_URL}/products`,
                    {
                        credentials:
                            "include"
                    }
                )
            ]);


            const [
                salesData,
                productsData
            ] = await Promise.all([
                salesResponse.json(),
                productsResponse.json()
            ]);


            const sales =
                salesResponse.ok &&
                salesData.success &&
                Array.isArray(
                    salesData.sales
                )
                    ? salesData.sales
                    : [];


            const products =
                productsResponse.ok &&
                productsData.success &&
                Array.isArray(
                    productsData.products
                )
                    ? productsData.products
                    : [];


            const totalSales =
                sales.reduce(
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


            setSummary({
                total_sales:
                    totalSales,

                total_transactions:
                    sales.length,

                total_products:
                    products.length
            });


            setRecentSales(
                sales
            );


            setInventory([]);


            if (
                !salesResponse.ok ||
                !salesData.success ||
                !productsResponse.ok ||
                !productsData.success
            ) {
                setMessage(
                    "Some dashboard information could not be loaded."
                );
            }
        };


    const loadDashboard =
        async () => {
            if (!user) {
                return;
            }

            setLoading(true);

            setMessage("");


            try {
                if (canManage) {
                    await loadManagerDashboard();
                } else {
                    await loadCashierDashboard();
                }
            } catch (error) {
                console.error(
                    "Dashboard loading error:",
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
        if (user) {
            loadDashboard();
        }
    }, [user]);


    const inventoryHealth =
        useMemo(() => {
            const result = {
                available: 0,
                lowStock: 0,
                outOfStock: 0,
                expiring: 0,
                expired: 0
            };


            const today =
                new Date();

            today.setHours(
                0,
                0,
                0,
                0
            );


            const thirtyDays =
                new Date(today);

            thirtyDays.setDate(
                thirtyDays.getDate() +
                    30
            );


            inventory.forEach(
                (item) => {
                    const quantity =
                        Number(
                            item.quantity ||
                                0
                        );

                    const reorderLevel =
                        Number(
                            item.reorder_level ||
                                0
                        );


                    if (
                        quantity ===
                        0
                    ) {
                        result.outOfStock +=
                            1;

                        return;
                    }


                    if (
                        item.expiry_date
                    ) {
                        const expiry =
                            parseDateOnly(
                                item.expiry_date
                            );


                        if (
                            expiry &&
                            expiry <
                                today
                        ) {
                            result.expired +=
                                1;

                            return;
                        }


                        if (
                            expiry &&
                            expiry <=
                                thirtyDays
                        ) {
                            result.expiring +=
                                1;

                            return;
                        }
                    }


                    if (
                        quantity <=
                        reorderLevel
                    ) {
                        result.lowStock +=
                            1;

                        return;
                    }


                    result.available +=
                        1;
                }
            );


            return result;
        }, [inventory]);


    const totalHealth =
        inventoryHealth.available +
        inventoryHealth.lowStock +
        inventoryHealth.outOfStock +
        inventoryHealth.expiring +
        inventoryHealth.expired;


    const percentage = (
        value
    ) => {
        if (!totalHealth) {
            return 0;
        }

        return (
            value /
            totalHealth
        ) * 100;
    };


    const averageTransaction =
        Number(
            summary?.total_transactions ||
                0
        ) > 0
            ? Number(
                  summary?.total_sales ||
                      0
              ) /
              Number(
                  summary
                      .total_transactions
              )
            : 0;


    const getGreeting = () => {
        const hour =
            new Date()
                .getHours();

        if (hour < 12) {
            return "Good morning";
        }

        if (hour < 18) {
            return "Good afternoon";
        }

        return "Good evening";
    };


    const todayLabel =
        new Intl.DateTimeFormat(
            "en-PH",
            {
                weekday:
                    "long",

                month:
                    "long",

                day:
                    "numeric",

                year:
                    "numeric"
            }
        ).format(
            new Date()
        );


    const getInventoryStatus =
        (item) => {
            const quantity =
                Number(
                    item.quantity ||
                        0
                );

            const reorderLevel =
                Number(
                    item.reorder_level ||
                        0
                );


            if (quantity === 0) {
                return {
                    label:
                        "Out of Stock",

                    className:
                        "dashboard-status-out"
                };
            }


            if (
                item.expiry_date
            ) {
                const expiry =
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
                    expiry &&
                    expiry < today
                ) {
                    return {
                        label:
                            "Expired",

                        className:
                            "dashboard-status-expired"
                    };
                }


                const thirtyDays =
                    new Date(today);

                thirtyDays.setDate(
                    thirtyDays.getDate() +
                        30
                );


                if (
                    expiry &&
                    expiry <=
                        thirtyDays
                ) {
                    return {
                        label:
                            "Expiring Soon",

                        className:
                            "dashboard-status-expiring"
                    };
                }
            }


            if (
                quantity <=
                reorderLevel
            ) {
                return {
                    label:
                        "Low Stock",

                    className:
                        "dashboard-status-low"
                };
            }


            return {
                label:
                    "Available",

                className:
                    "dashboard-status-available"
            };
        };


    if (!user) {
        return null;
    }


    const managerCards = [
        {
            label:
                "Total Sales",

            value:
                formatCurrency(
                    summary?.total_sales
                ),

            description:
                "Recorded revenue",

            icon:
                CircleDollarSign,

            variant:
                "blue"
        },

        {
            label:
                "Transactions",

            value:
                summary?.total_transactions ??
                0,

            description:
                "Completed sales",

            icon:
                WalletCards,

            variant:
                "green"
        },

        {
            label:
                "Items Sold",

            value:
                summary?.total_items_sold ??
                0,

            description:
                "Units sold",

            icon:
                ShoppingBag,

            variant:
                "purple"
        },

        {
            label:
                "Active Products",

            value:
                summary?.total_products ??
                0,

            description:
                "Registered products",

            icon:
                Package,

            variant:
                "orange"
        }
    ];


    const cashierCards = [
        {
            label:
                "Recorded Sales",

            value:
                formatCurrency(
                    summary?.total_sales
                ),

            description:
                "Sales history revenue",

            icon:
                CircleDollarSign,

            variant:
                "blue"
        },

        {
            label:
                "Transactions",

            value:
                summary?.total_transactions ??
                0,

            description:
                "Recorded sales",

            icon:
                WalletCards,

            variant:
                "green"
        },

        {
            label:
                "Active Products",

            value:
                summary?.total_products ??
                0,

            description:
                "Available catalog",

            icon:
                Package,

            variant:
                "purple"
        },

        {
            label:
                "Average Sale",

            value:
                formatCurrency(
                    averageTransaction
                ),

            description:
                "Per transaction",

            icon:
                TrendingUp,

            variant:
                "orange"
        }
    ];


    const cards =
        canManage
            ? managerCards
            : cashierCards;


    return (
        <div className="premium-dashboard">
            <header className="dashboard-header">
                <div>
                    <span className="dashboard-eyebrow">
                        <Sparkles
                            size={15}
                            strokeWidth={2}
                        />

                        Business Overview
                    </span>

                    <h1>
                        Dashboard
                    </h1>

                    <p>
                        Monitor sales,
                        inventory health,
                        and business
                        activity.
                    </p>
                </div>


                <div className="dashboard-header-actions">
                    <div className="dashboard-date">
                        <CalendarDays
                            size={17}
                            strokeWidth={1.9}
                        />

                        {
                            todayLabel
                        }
                    </div>

                    <button
                        type="button"
                        className="dashboard-refresh-button"
                        onClick={
                            loadDashboard
                        }
                        disabled={
                            loading
                        }
                    >
                        <RefreshCw
                            size={17}
                            strokeWidth={2}
                            className={
                                loading
                                    ? "dashboard-spin"
                                    : ""
                            }
                        />

                        {loading
                            ? "Refreshing"
                            : "Refresh"}
                    </button>
                </div>
            </header>


            <section className="dashboard-welcome">
                <div className="dashboard-welcome-glow" />

                <div className="dashboard-welcome-content">
                    <div className="dashboard-welcome-icon">
                        <TrendingUp
                            size={27}
                            strokeWidth={1.8}
                        />
                    </div>

                    <div>
                        <span>
                            {
                                getGreeting()
                            }
                        </span>

                        <h2>
                            {
                                user.full_name
                            }
                        </h2>

                        <p>
                            Here&apos;s the
                            latest overview
                            available for your
                            account.
                        </p>
                    </div>
                </div>


                <div className="dashboard-role">
                    <span>
                        Account Role
                    </span>

                    <strong>
                        {
                            user.role
                        }
                    </strong>
                </div>
            </section>


            {message && (
                <div className="dashboard-message">
                    <AlertTriangle
                        size={18}
                        strokeWidth={2}
                    />

                    {
                        message
                    }
                </div>
            )}


            <section className="dashboard-kpi-grid">
                {cards.map(
                    (card) => {
                        const Icon =
                            card.icon;

                        return (
                            <article
                                key={
                                    card.label
                                }
                                className={`dashboard-kpi-card dashboard-kpi-${card.variant}`}
                            >
                                <div className="dashboard-kpi-top">
                                    <div className="dashboard-kpi-icon">
                                        <Icon
                                            size={22}
                                            strokeWidth={1.9}
                                        />
                                    </div>

                                    <span>
                                        {
                                            card.label
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


            {canManage && (
                <>
                    <section className="dashboard-secondary-grid">
                        <article>
                            <div className="dashboard-secondary-icon blue">
                                <Boxes
                                    size={21}
                                    strokeWidth={1.9}
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
                            <div className="dashboard-secondary-icon orange">
                                <AlertTriangle
                                    size={21}
                                    strokeWidth={1.9}
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
                            <div className="dashboard-secondary-icon purple">
                                <Clock3
                                    size={21}
                                    strokeWidth={1.9}
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
                            <div className="dashboard-secondary-icon green">
                                <TrendingUp
                                    size={21}
                                    strokeWidth={1.9}
                                />
                            </div>

                            <div>
                                <span>
                                    Average Sale
                                </span>

                                <strong className="dashboard-money">
                                    {formatCurrency(
                                        averageTransaction
                                    )}
                                </strong>
                            </div>
                        </article>
                    </section>


                    <section className="dashboard-insight-grid">
                        <article className="dashboard-panel">
                            <div className="dashboard-panel-header">
                                <div>
                                    <span className="dashboard-panel-eyebrow">
                                        Inventory
                                    </span>

                                    <h2>
                                        Stock Health
                                    </h2>

                                    <p>
                                        Current
                                        condition of
                                        recorded
                                        inventory
                                        batches.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="dashboard-link-button"
                                    onClick={() => {
                                        window.location.href =
                                            "/inventory";
                                    }}
                                >
                                    View Inventory

                                    <ArrowRight
                                        size={16}
                                        strokeWidth={2}
                                    />
                                </button>
                            </div>


                            <div className="dashboard-health-grid">
                                <div className="dashboard-health-stat available">
                                    <CheckCircle2
                                        size={21}
                                    />

                                    <span>
                                        Available
                                    </span>

                                    <strong>
                                        {
                                            inventoryHealth.available
                                        }
                                    </strong>
                                </div>

                                <div className="dashboard-health-stat low">
                                    <AlertTriangle
                                        size={21}
                                    />

                                    <span>
                                        Low Stock
                                    </span>

                                    <strong>
                                        {
                                            inventoryHealth.lowStock
                                        }
                                    </strong>
                                </div>

                                <div className="dashboard-health-stat out">
                                    <Boxes
                                        size={21}
                                    />

                                    <span>
                                        Out of Stock
                                    </span>

                                    <strong>
                                        {
                                            inventoryHealth.outOfStock
                                        }
                                    </strong>
                                </div>

                                <div className="dashboard-health-stat expiring">
                                    <Clock3
                                        size={21}
                                    />

                                    <span>
                                        Expiring
                                    </span>

                                    <strong>
                                        {
                                            inventoryHealth.expiring
                                        }
                                    </strong>
                                </div>
                            </div>


                            <div className="dashboard-health-bar">
                                <div
                                    className="health-bar-available"
                                    style={{
                                        width:
                                            `${percentage(
                                                inventoryHealth.available
                                            )}%`
                                    }}
                                />

                                <div
                                    className="health-bar-low"
                                    style={{
                                        width:
                                            `${percentage(
                                                inventoryHealth.lowStock
                                            )}%`
                                    }}
                                />

                                <div
                                    className="health-bar-out"
                                    style={{
                                        width:
                                            `${percentage(
                                                inventoryHealth.outOfStock
                                            )}%`
                                    }}
                                />

                                <div
                                    className="health-bar-expiring"
                                    style={{
                                        width:
                                            `${percentage(
                                                inventoryHealth.expiring
                                            )}%`
                                    }}
                                />

                                <div
                                    className="health-bar-expired"
                                    style={{
                                        width:
                                            `${percentage(
                                                inventoryHealth.expired
                                            )}%`
                                    }}
                                />
                            </div>
                        </article>


                        <article className="dashboard-panel dashboard-snapshot-panel">
                            <div className="dashboard-panel-header">
                                <div>
                                    <span className="dashboard-panel-eyebrow">
                                        Performance
                                    </span>

                                    <h2>
                                        Business Snapshot
                                    </h2>

                                    <p>
                                        Summary derived
                                        from current
                                        report data.
                                    </p>
                                </div>
                            </div>


                            <div className="dashboard-snapshot-list">
                                <div>
                                    <span>
                                        Average
                                        Transaction
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            averageTransaction
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Active Products
                                    </span>

                                    <strong>
                                        {summary?.total_products ??
                                            0}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Inventory
                                        Batches
                                    </span>

                                    <strong>
                                        {
                                            inventory.length
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Items Sold
                                    </span>

                                    <strong>
                                        {summary?.total_items_sold ??
                                            0}
                                    </strong>
                                </div>
                            </div>
                        </article>
                    </section>


                    <section className="dashboard-panel dashboard-table-panel">
                        <div className="dashboard-panel-header">
                            <div>
                                <span className="dashboard-panel-eyebrow">
                                    Inventory
                                </span>

                                <h2>
                                    Inventory Snapshot
                                </h2>

                                <p>
                                    First five
                                    inventory records
                                    returned by the
                                    inventory service.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="dashboard-link-button"
                                onClick={() => {
                                    window.location.href =
                                        "/inventory";
                                }}
                            >
                                View All

                                <ArrowRight
                                    size={16}
                                />
                            </button>
                        </div>


                        <div className="dashboard-table-wrapper">
                            <table className="dashboard-modern-table">
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
                                            Expiry
                                        </th>

                                        <th>
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {inventory
                                        .slice(
                                            0,
                                            5
                                        )
                                        .map(
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
                                                            <div className="dashboard-product-cell">
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
                                                        </td>

                                                        <td>
                                                            {item.batch_number ||
                                                                "N/A"}
                                                        </td>

                                                        <td>
                                                            <strong>
                                                                {
                                                                    item.quantity
                                                                }
                                                            </strong>
                                                        </td>

                                                        <td>
                                                            {formatDate(
                                                                item.expiry_date
                                                            )}
                                                        </td>

                                                        <td>
                                                            <span
                                                                className={`dashboard-status ${status.className}`}
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
                    </section>
                </>
            )}


            <section className="dashboard-panel dashboard-table-panel">
                <div className="dashboard-panel-header">
                    <div>
                        <span className="dashboard-panel-eyebrow">
                            Transaction Activity
                        </span>

                        <h2>
                            Recent Sales
                        </h2>

                        <p>
                            Latest completed
                            transactions
                            returned by the
                            system.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="dashboard-link-button"
                        onClick={() => {
                            window.location.href =
                                "/sales";
                        }}
                    >
                        View Sales

                        <ArrowRight
                            size={16}
                        />
                    </button>
                </div>


                {recentSales.length ===
                0 ? (
                    <div className="dashboard-empty-state">
                        <ShoppingBag
                            size={36}
                            strokeWidth={1.5}
                        />

                        <strong>
                            No sales recorded
                        </strong>

                        <span>
                            Completed
                            transactions will
                            appear here.
                        </span>
                    </div>
                ) : (
                    <div className="dashboard-table-wrapper">
                        <table className="dashboard-modern-table">
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
                                        Date
                                    </th>

                                    <th>
                                        Total
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentSales
                                    .slice(
                                        0,
                                        5
                                    )
                                    .map(
                                        (
                                            sale
                                        ) => (
                                            <tr
                                                key={
                                                    sale.sale_id
                                                }
                                            >
                                                <td>
                                                    <strong className="dashboard-sale-id">
                                                        #
                                                        {
                                                            sale.sale_id
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    {sale.full_name ||
                                                        "N/A"}
                                                </td>

                                                <td>
                                                    <span className="dashboard-payment-badge">
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
                                                    <strong className="dashboard-sale-total">
                                                        {formatCurrency(
                                                            sale.total_amount
                                                        )}
                                                    </strong>
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

export default Dashboard;
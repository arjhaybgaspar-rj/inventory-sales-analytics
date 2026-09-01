const API_BASE_URL = "http://127.0.0.1:5000";

const barcodeInput = document.getElementById("barcodeInput");
const searchButton = document.getElementById("searchButton");

const scannerMessage = document.getElementById("scannerMessage");

const productCard = document.getElementById("productCard");
const productImage = document.getElementById("productImage");

const productName = document.getElementById("productName");
const productBarcode = document.getElementById("productBarcode");
const productBrand = document.getElementById("productBrand");
const productCategory = document.getElementById("productCategory");
const productUnit = document.getElementById("productUnit");
const productSource = document.getElementById("productSource");

const sellingPrice = document.getElementById("sellingPrice");
const saveProductButton = document.getElementById("saveProductButton");


// ==========================================
// SEARCH BARCODE
// ==========================================

async function searchBarcode() {

    const barcode = barcodeInput.value.trim();

    if (!barcode) {
        scannerMessage.textContent = "Please enter a barcode.";
        productCard.hidden = true;
        return;
    }

    scannerMessage.textContent = "Checking product...";
    productCard.hidden = true;

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/barcode/lookup?barcode=${encodeURIComponent(barcode)}`
        );

        const data = await response.json();

        console.log("Barcode response:", data);


        // ==========================================
        // PRODUCT EXISTS IN DATABASE
        // ==========================================

        if (data.exists === true) {

            scannerMessage.textContent =
                data.message;

            showProduct(data.product);

            // Existing product:
            // Do not show save price section.
            sellingPrice.value = "";
            saveProductButton.style.display = "none";

            return;
        }


        // ==========================================
        // PRODUCT FOUND IN API
        // ==========================================

        if (
            data.success === true &&
            data.found_in_api === true
        ) {

            scannerMessage.textContent =
                "New product found. Please set the selling price.";

            showProduct(data.product);

            // New product:
            // Owner must enter selling price.
            saveProductButton.style.display = "inline-block";

            return;
        }


        // ==========================================
        // PRODUCT NOT FOUND
        // ==========================================

        scannerMessage.textContent =
            data.message || "Product not found.";

        productCard.hidden = true;

    } catch (error) {

        console.error("Barcode lookup error:", error);

        scannerMessage.textContent =
            "Unable to connect to the backend.";

        productCard.hidden = true;
    }
}


// ==========================================
// DISPLAY PRODUCT
// ==========================================

function showProduct(product) {

    productCard.hidden = false;

    productName.textContent =
        product.product_name || "Unknown Product";

    productBarcode.textContent =
        product.barcode || "";

    productBrand.textContent =
        product.brand || "Not available";

    productCategory.textContent =
        product.category || "Not available";

    productUnit.textContent =
        product.unit || "Not available";

    productSource.textContent =
        product.api_source || "Database";

    if (product.image_url) {

        productImage.src = product.image_url;

    } else {

        productImage.removeAttribute("src");
        productImage.alt = "No product image available";
    }

    // If product already exists,
    // show its current price.

    if (product.selling_price !== null &&
        product.selling_price !== undefined) {

        sellingPrice.value =
            product.selling_price;
    } else {

        sellingPrice.value = "";
    }
}


// ==========================================
// SEARCH BUTTON
// ==========================================

searchButton.addEventListener(
    "click",
    searchBarcode
);


// ==========================================
// ENTER KEY
// ==========================================

barcodeInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {
            searchBarcode();
        }

    }
);


// ==========================================
// SAVE PRODUCT
// ==========================================

saveProductButton.addEventListener(
    "click",
    async function () {

        const barcode =
            productBarcode.textContent.trim();

        const name =
            productName.textContent.trim();

        const price =
            sellingPrice.value.trim();

        if (!price) {

            scannerMessage.textContent =
                "Please enter the selling price.";

            return;
        }

        const productData = {

            barcode: barcode,

            product_name: name,

            brand: productBrand.textContent,

            category: productCategory.textContent,

            unit: productUnit.textContent,

            image_url: productImage.src,

            selling_price: price
        };


        try {

            scannerMessage.textContent =
                "Saving product...";

            const response = await fetch(
                `${API_BASE_URL}/api/products`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(productData)
                }
            );

            const data = await response.json();

            console.log("Save response:", data);


            if (data.success) {

                scannerMessage.textContent =
                    "Product added successfully.";

                showProduct(data.product);

                saveProductButton.style.display =
                    "none";

            } else {

                scannerMessage.textContent =
                    data.message || "Failed to save product.";
            }

        } catch (error) {

            console.error("Save product error:", error);

            scannerMessage.textContent =
                "Unable to connect to the backend.";
        }
    }
);
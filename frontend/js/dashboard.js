const userData = localStorage.getItem("user");

if (!userData) {
    window.location.href = "index.html";
}

const user = JSON.parse(userData);

const welcomeMessage = document.getElementById("welcomeMessage");
const userRole = document.getElementById("userRole");
const logoutButton = document.getElementById("logoutButton");

welcomeMessage.textContent = `Welcome, ${user.full_name}!`;
userRole.textContent = `Role: ${user.role}`;

logoutButton.addEventListener("click", function () {
    localStorage.removeItem("user");
    window.location.href = "index.html";
});

document.getElementById("productsButton").addEventListener("click", function () {
    window.location.href = "products.html";
});

document.getElementById("inventoryButton").addEventListener("click", function () {
    window.location.href = "inventory.html";
});

document.getElementById("salesButton").addEventListener("click", function () {
    window.location.href = "sales.html";
});

document.getElementById("reportsButton").addEventListener("click", function () {
    window.location.href = "reports.html";
});
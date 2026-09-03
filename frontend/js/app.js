const API_BASE_URL = "http://127.0.0.1:5000";

const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            loginMessage.textContent = "Username and password are required.";
            return;
        }

        loginButton.disabled = true;
        loginButton.textContent = "Logging in...";
        loginMessage.textContent = "";

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem("user", JSON.stringify(data.user));

                loginMessage.textContent = `Welcome, ${data.user.full_name}!`;

                setTimeout(function () {
                    if (data.user.role === "cashier") {
                        window.location.href = "cashier.html";
                    } else {
                        window.location.href = "dashboard.html";
                    }
                }, 500);
            } else {
                loginMessage.textContent =
                    data.message || "Invalid username or password.";
            }

        } catch (error) {
            console.error("Login error:", error);

            loginMessage.textContent =
                "Unable to connect to the backend.";
        }

        loginButton.disabled = false;
        loginButton.textContent = "Login";
    });
}
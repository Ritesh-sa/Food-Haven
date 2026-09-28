
const PRODUCTS = [
    {
        id: "p1", name: "Classic Margherita",
        desc: "Tomato, mozzarella, basil and a crisp crust.",
        price: 249, category: "pizza", emoji: "🍕",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "p2", name: "Garden Veggie Pizza",
        desc: "Bell peppers, olives, onion and melted cheese.",
        price: 289, category: "pizza", emoji: "🍕",
        image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "b1", name: "Haven Cheeseburger",
        desc: "Grilled patty, cheddar, lettuce and house sauce.",
        price: 199, category: "burger", emoji: "🍔",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "b2", name: "Crispy Veg Burger",
        desc: "Crispy veggie patty, fresh greens and tangy mayo.",
        price: 159, category: "burger", emoji: "🍔",
        image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "d1", name: "Chocolate Cake",
        desc: "Soft chocolate sponge with a rich cocoa finish.",
        price: 149, category: "dessert", emoji: "🍰",
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "d2", name: "Vanilla Ice Cream",
        desc: "Classic creamy vanilla, served chilled.",
        price: 99, category: "dessert", emoji: "🍨",
        image: "https://images.unsplash.com/photo-1501446529957-6226bd447c46?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "dr1", name: "Fresh Lime Soda",
        desc: "A bright, refreshing lime cooler.",
        price: 69, category: "drinks", emoji: "🍋",
        image: "https://images.unsplash.com/photo-1513558161293-c00c42a7d6c7?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "dr2", name: "Cold Coffee",
        desc: "Chilled coffee blended until smooth.",
        price: 119, category: "drinks", emoji: "🥤",
        image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80"
    }
];

function read(key, fallback = []) {
    try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
        return fallback;
    }
}

function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function money(amount) {
    return "₹" + Number(amount).toLocaleString("en-IN");
}

function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[char]));
}

let currentCategory = "all";

// Cart count in navigation
function updateCartBadge() {
    const count = read("fh_cart").reduce((sum, item) => sum + item.qty, 0);

    document.querySelectorAll("#cartCount").forEach(element => {
        element.textContent = count;
    });
}

// Render menu products
function renderMenu() {
    const grid = document.getElementById("menuGrid");
    if (!grid) return;

    const query = (
        document.getElementById("searchBox")?.value || ""
    ).trim().toLowerCase();

    const filtered = PRODUCTS.filter(product => {
        const categoryMatch =
            currentCategory === "all" ||
            product.category === currentCategory;

        const searchMatch =
            (product.name + " " + product.desc)
                .toLowerCase().includes(query);

        return categoryMatch && searchMatch;
    });

    if (!filtered.length) {
        grid.innerHTML = `<p class="empty-state">No dishes found.</p>`;
        return;
    }

    grid.innerHTML = filtered.map(product => `
        <article class="menu-card">
            <div class="menu-image">
                <img
                    src="${product.image}"
                    alt="${escapeHTML(product.name)}"
                    loading="lazy"
                    onerror="this.style.display='none';this.parentElement.classList.add('image-fallback');this.parentElement.dataset.emoji='${product.emoji}'"
                >
                <span class="category-pill">${product.category}</span>
            </div>

            <div class="menu-card-body">
                <h3>${escapeHTML(product.name)}</h3>
                <p>${escapeHTML(product.desc)}</p>

                <div class="menu-card-bottom">
                    <strong>${money(product.price)}</strong>
                    <button class="add-btn" data-add="${product.id}">
                        + Add
                    </button>
                </div>
            </div>
        </article>
    `).join("");

    grid.querySelectorAll("[data-add]").forEach(button => {
        button.addEventListener("click", () => {
            addToCart(button.dataset.add);
        });
    });
}

// Add item to cart
function addToCart(id) {
    const product = PRODUCTS.find(item => item.id === id);
    if (!product) return;

    const cart = read("fh_cart");
    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    save("fh_cart", cart);
    updateCartBadge();
    renderCart();
    toast(`${product.name} added to cart`);
}

// Render cart
function renderCart() {
    const container = document.getElementById("cartItems");
    if (!container) return;

    const cart = read("fh_cart");
    const count = cart.reduce((sum, item) => sum + item.qty, 0);

    const bigCount = document.getElementById("cartCountBig");
    if (bigCount) bigCount.textContent = count;

    if (!cart.length) {
        container.innerHTML = `
            <p class="empty-state">
                Your cart is empty. Pick something delicious!
            </p>
        `;
    } else {
        container.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div>
                    <strong>${escapeHTML(item.name)}</strong>
                    <small>${money(item.price)} each</small>
                </div>

                <div class="qty-controls">
                    <button data-minus="${item.id}">−</button>
                    <span>${item.qty}</span>
                    <button data-plus="${item.id}">+</button>
                    <button class="remove-btn" data-remove="${item.id}">×</button>
                </div>

                <strong>${money(item.price * item.qty)}</strong>
            </div>
        `).join("");
    }

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.qty, 0
    );

    document.getElementById("cartTotal").textContent = money(total);

    container.querySelectorAll("[data-minus]").forEach(button => {
        button.onclick = () => changeQty(button.dataset.minus, -1);
    });

    container.querySelectorAll("[data-plus]").forEach(button => {
        button.onclick = () => changeQty(button.dataset.plus, 1);
    });

    container.querySelectorAll("[data-remove]").forEach(button => {
        button.onclick = () => {
            save(
                "fh_cart",
                read("fh_cart").filter(item => item.id !== button.dataset.remove)
            );
            renderCart();
            updateCartBadge();
        };
    });
}

function changeQty(id, delta) {
    let cart = read("fh_cart");
    const item = cart.find(product => product.id === id);

    if (item) item.qty += delta;

    cart = cart.filter(product => product.qty > 0);

    save("fh_cart", cart);
    renderCart();
    updateCartBadge();
}

// Small notification
function toast(message) {
    let element = document.getElementById("toast");

    if (!element) {
        element = document.createElement("div");
        element.id = "toast";
        element.className = "toast";
        document.body.appendChild(element);
    }

    element.textContent = message;
    element.classList.add("show");

    clearTimeout(window._toastTimer);

    window._toastTimer = setTimeout(() => {
        element.classList.remove("show");
    }, 2200);
}

// Menu filters and cart actions
function setupMenu() {
    document.querySelectorAll(".filter").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".filter").forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");
            currentCategory = button.dataset.category;
            renderMenu();
        });
    });

    document.getElementById("searchBox")
        ?.addEventListener("input", renderMenu);

    document.getElementById("clearCart")?.addEventListener("click", () => {
        save("fh_cart", []);
        renderCart();
        updateCartBadge();
    });

    document.getElementById("placeOrder")?.addEventListener("click", () => {
        const cart = read("fh_cart");
        const message = document.getElementById("orderMessage");

        if (!cart.length) {
            message.textContent = "Your cart is empty. Add a dish first.";
            return;
        }

        const order = {
            id: Date.now(),
            items: cart.map(item => ({
                name: item.name,
                price: item.price,
                qty: item.qty
            })),
            total: cart.reduce(
                (sum, item) => sum + item.price * item.qty, 0
            ),
            createdAt: new Date().toLocaleString()
        };

        const orders = read("fh_orders");
        orders.unshift(order);

        save("fh_orders", orders);
        save("fh_cart", []);

        renderCart();
        updateCartBadge();

        message.textContent =
            "✓ Demo order placed! See it on the Admin page.";
    });
}

// Reservation form
function setupReservation() {
    const form = document.getElementById("reservationForm");
    if (!form) return;

    const dateInput = document.getElementById("date");

    function setMinDate() {
        const now = new Date();
        dateInput.min = new Date(
            now.getTime() - now.getTimezoneOffset() * 60000
        ).toISOString().slice(0, 10);
    }

    setMinDate();

    form.addEventListener("submit", event => {
        event.preventDefault();

        if (!form.reportValidity()) return;

        const data = Object.fromEntries(
            new FormData(form).entries()
        );

        data.id = Date.now();
        data.createdAt = new Date().toLocaleString();

        const reservations = read("fh_reservations");
        reservations.unshift(data);

        save("fh_reservations", reservations);

        form.reset();
        setMinDate();

        document.getElementById("reservationMessage").textContent =
            `✓ Thanks, ${data.name}! Your demo reservation has been saved.`;
    });
}

// Admin dashboard
function renderAdmin() {
    const reservationBox = document.getElementById("reservationList");
    if (!reservationBox) return;

    const reservations = read("fh_reservations");

    document.getElementById("reservationCount").textContent =
        `(${reservations.length})`;

    reservationBox.innerHTML = reservations.length
        ? reservations.map(reservation => `
            <article class="admin-card">
                <div>
                    <h3>${escapeHTML(reservation.name)}</h3>
                    <p>
                        ${escapeHTML(reservation.date)} ·
                        ${escapeHTML(reservation.time)} ·
                        ${escapeHTML(reservation.guests)} guest(s)
                    </p>
                    <small>
                        ${escapeHTML(reservation.email)} ·
                        ${escapeHTML(reservation.phone)}
                    </small>
                    ${reservation.notes
                        ? `<p class="admin-note">${escapeHTML(reservation.notes)}</p>`
                        : ""}
                </div>
                <button class="remove-btn" data-del-res="${reservation.id}">
                    Delete
                </button>
            </article>
        `).join("")
        : `<p class="empty-state">No reservations yet.</p>`;

    reservationBox.querySelectorAll("[data-del-res]").forEach(button => {
        button.onclick = () => {
            save(
                "fh_reservations",
                read("fh_reservations").filter(
                    item => String(item.id) !== button.dataset.delRes
                )
            );
            renderAdmin();
        };
    });

    const ordersBox = document.getElementById("ordersList");
    const orders = read("fh_orders");

    ordersBox.innerHTML = orders.length
        ? orders.map(order => `
            <article class="admin-card">
                <div>
                    <h3>Order #${String(order.id).slice(-6)}</h3>
                    <p>
                        ${order.items.map(item =>
                            `${escapeHTML(item.name)} × ${item.qty}`
                        ).join(" · ")}
                    </p>
                    <small>${escapeHTML(order.createdAt)}</small>
                </div>
                <strong>${money(order.total)}</strong>
            </article>
        `).join("")
        : `<p class="empty-state">No demo orders yet.</p>`;

    document.getElementById("clearReservations")
        ?.addEventListener("click", () => {
            if (confirm("Delete all saved reservations?")) {
                save("fh_reservations", []);
                renderAdmin();
            }
        }, { once: true });

    document.getElementById("clearOrders")
        ?.addEventListener("click", () => {
            if (confirm("Delete all saved demo orders?")) {
                save("fh_orders", []);
                renderAdmin();
            }
        }, { once: true });
}

// Mobile navigation
document.getElementById("menuToggle")?.addEventListener("click", () => {
    document.getElementById("nav")?.classList.toggle("open");
});

document.addEventListener("DOMContentLoaded", () => {
    updateCartBadge();
    renderMenu();
    renderCart();
    setupMenu();
    setupReservation();
    renderAdmin();
});
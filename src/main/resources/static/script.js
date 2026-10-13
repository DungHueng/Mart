
const products = [
    {id: 1, name: "Gạo ST25 5kg", category: "Thực phẩm", price: 145000, stock: 12, sku: "TP001"},
    {id: 2, name: "Dầu ăn 1L", category: "Thực phẩm", price: 52000, stock: 8, sku: "TP002"},
    {id: 3, name: "Mì tôm", category: "Thực phẩm", price: 4500, stock: 60, sku: "TP003"},
    {id: 4, name: "Sữa tươi 1L", category: "Đồ uống", price: 34000, stock: 22, sku: "DU001"},
    {id: 5, name: "Nước suối", category: "Đồ uống", price: 7000, stock: 42, sku: "DU002"},
    {id: 6, name: "Nước ngọt lon", category: "Đồ uống", price: 10000, stock: 35, sku: "DU003"},
    {id: 7, name: "Nước rửa chén", category: "Gia dụng", price: 28000, stock: 5, sku: "GD001"},
    {id: 8, name: "Khăn giấy", category: "Gia dụng", price: 18000, stock: 3, sku: "GD002"},
    {id: 9, name: "Trứng gà 10 quả", category: "Thực phẩm", price: 32000, stock: 16, sku: "TP004"}
];

let cart = [];
let orders = [
    {id: "FM-1026", customer: "Trần Thu Lan", time: "10:42, 13/10/2026", items: 5, total: 245000, status: "Hoàn thành"},
    {id: "FM-1025", customer: "Nguyễn Minh", time: "10:35, 13/10/2026", items: 3, total: 86000, status: "Hoàn thành"},
    {id: "FM-1024", customer: "Phạm Hoàng", time: "10:18, 13/10/2026", items: 8, total: 512000, status: "Đang xử lý"},
    {id: "FM-1023", customer: "Đỗ Anh", time: "09:56, 13/10/2026", items: 2, total: 64000, status: "Hoàn thành"}
];

const money = value => new Intl.NumberFormat("vi-VN").format(value) + " ₫";

function notify(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

function navigate(page) {
    document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
    document.getElementById(page)?.classList.remove("hidden");

    document.querySelectorAll(".nav-item").forEach(a => {
        a.classList.toggle("active", a.getAttribute("href") === "#" + page);
    });

    const active = document.querySelector(`.nav-item[href="#${page}"]`);
    document.getElementById("pageTitle").textContent =
        active ? active.innerText.trim() : page;

    if (page === "pos") renderProducts();
    if (page === "orders") renderOrders();
    if (page === "products") renderProductTable();
    if (page === "inventory") renderInventory();

    window.scrollTo({top: 0, behavior: "smooth"});
}

document.querySelectorAll(".nav-item").forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();
        navigate(link.getAttribute("href").slice(1));
    });
});

function renderProducts() {
    const keyword = (document.getElementById("search").value || "").toLowerCase();
    const category = document.getElementById("category").value;
    const list = products.filter(p =>
        (p.name.toLowerCase().includes(keyword) || p.sku.toLowerCase().includes(keyword)) &&
        (category === "all" || p.category === category)
    );

    document.getElementById("productGrid").innerHTML = list.map(p => `
        <article class="product-card" onclick="addToCart(${p.id})">
            <div class="product-emoji">${p.emoji}</div>
            <small>${p.category}</small>
            <b>${p.name}</b>
            <strong>${money(p.price)}</strong>
            <small> · Tồn kho: ${p.stock}</small>
        </article>
    `).join("") || "<p>Không tìm thấy sản phẩm.</p>";
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    const item = cart.find(p => p.id === id);

    if (item) item.qty++;
    else cart.push({...product, qty: 1});

    renderCart();
    notify("Đã thêm " + product.name + " vào giỏ hàng.");
}

function changeQty(id, delta) {
    const item = cart.find(p => p.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(p => p.id !== id);
    renderCart();
}

function renderCart() {
    const count = cart.reduce((sum, p) => sum + p.qty, 0);
    const total = cart.reduce((sum, p) => sum + p.price * p.qty, 0);

    document.getElementById("cartCount").textContent = count;
    document.getElementById("cartTotal").textContent = money(total);

    document.getElementById("cartItems").innerHTML = cart.length
        ? cart.map(p => `
            <div class="cart-row">
                <span>${p.emoji} ${p.name}<br><small>${money(p.price)}</small></span>
                <span>
                    <button onclick="changeQty(${p.id}, -1)">−</button>
                    ${p.qty}
                    <button onclick="changeQty(${p.id}, 1)">+</button>
                </span>
            </div>
        `).join("")
        : "Chưa có sản phẩm.";
}

function checkout() {
    if (cart.length === 0) {
        notify("Vui lòng thêm sản phẩm vào giỏ hàng.");
        return;
    }

    const total = cart.reduce((sum, p) => sum + p.price * p.qty, 0);
    const count = cart.reduce((sum, p) => sum + p.qty, 0);
    const customer = document.getElementById("customer").value.trim() || "Khách lẻ";

    const now = new Date();
    orders.unshift({
        id: "FM-" + (1027 + orders.length - 4),
        customer,
        time: now.toLocaleTimeString("vi-VN", {hour: "2-digit", minute: "2-digit"}),
        items: count,
        total,
        status: "Hoàn thành"
    });

    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        product.stock = Math.max(0, product.stock - item.qty);
    });

    document.getElementById("orderCount").textContent =
        Number(document.getElementById("orderCount").textContent) + 1;

    cart = [];
    document.getElementById("customer").value = "";
    renderCart();
    renderOrders();
    notify("Tạo đơn thành công: " + money(total));
}

function renderOrderRows(list) {
    return list.map(o => `
        <tr>
            <td><b>#${o.id}</b></td>
            <td><div class="customer"><span class="customer-avatar">♙</span>${o.customer}</div></td>
            <td>${o.time}</td>
            <td>${o.items} sản phẩm</td>
            <td><b>${money(o.total)}</b></td>
            <td><span class="status ${o.status === "Hoàn thành" ? "done" : "pending"}">${o.status}</span></td>
        </tr>
    `).join("");
}

function renderOrders() {
    document.getElementById("recentOrders").innerHTML = renderOrderRows(orders.slice(0, 4));
    document.getElementById("allOrders").innerHTML = renderOrderRows(orders);
}

function renderProductTable() {
    document.getElementById("productTable").innerHTML = products.map(p => `
        <tr><td>${p.emoji} <b>${p.name}</b></td><td>${p.sku}</td><td>${p.category}</td><td>${money(p.price)}</td><td>${p.stock}</td></tr>
    `).join("");
}

function renderInventory() {
    document.getElementById("inventoryTable").innerHTML = products
        .filter(p => p.stock <= 8)
        .map(p => `<tr><td>${p.emoji} <b>${p.name}</b></td><td>${p.sku}</td><td>${p.stock}</td><td><span class="status pending">Sắp hết hàng</span></td></tr>`)
        .join("");
}

document.getElementById("category").addEventListener("change", renderProducts);
document.getElementById("search").addEventListener("input", () => {
    if (!document.getElementById("pos").classList.contains("hidden")) renderProducts();
});
document.getElementById("period").addEventListener("change", event => {
    document.getElementById("chartTotal").textContent =
        event.target.value === "month" ? "126.840.000 ₫" : "32.680.000 ₫";
});

renderProducts();
renderCart();
renderOrders();
renderProductTable();
renderInventory();

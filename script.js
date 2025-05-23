const MENU_ITEMS = {
    "Soda": 1.50,
    "Chips": 1.00,
    "Hotdog": 3.00,
    "Jumbo Dog": 6.00,
    "Chicago Dog": 5.50,
    "Chilly Dog": 4.00,
    "Italian Beef": 7.00,
    "Polish Sausage": 7.00,
    "CheeseSteak": 10.00
};

const TOPPINGS_LIST = ["Sauerkraut", "Onion", "Fried Onion", "Relish", "Pepper"];
const COMBO_PRICE = 2.00;

const LS_KEYS = {
    CART: 'posCartV4',
    CURRENT_ITEM: 'posCurrentItemV4',
    HISTORY: 'posHistoryV4',
    LS_AVAILABLE_CHECK: 'posLsCheck'
};

let cart = [];
let currentItem = null;
let history = [];
let lsAvailable = false;

// --- LOCALSTORAGE HELPER FUNCTIONS ---
function isLocalStorageAvailable() {
    try {
        localStorage.setItem(LS_KEYS.LS_AVAILABLE_CHECK, 'test');
        localStorage.removeItem(LS_KEYS.LS_AVAILABLE_CHECK);
        return true;
    } catch (e) {
        return false;
    }
}
function getLocalStorageItem(key) { /* ... (same as previous version) ... */ 
    if (!lsAvailable) return null;
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (e) { console.error(`LS get error: ${key}`, e); return null; }
}
function setLocalStorageItem(key, value) { /* ... (same as previous version) ... */
    if (!lsAvailable) return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { console.error(`LS set error: ${key}`, e); showToast('Could not save data.', 'error'); }
}
function removeLocalStorageItem(key) { /* ... (same as previous version) ... */
    if (!lsAvailable) return;
    try { localStorage.removeItem(key); } catch (e) { console.error(`LS remove error: ${key}`, e); }
}


// --- TOAST NOTIFICATION ---
function showToast(message, type = 'info', duration = 3000) { /* ... (same as previous version) ... */
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', type === 'error' || type === 'warning' ? 'alert' : 'status');
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    toast.appendChild(messageSpan);
    const closeButton = document.createElement('button');
    closeButton.className = 'toast-close-btn';
    closeButton.innerHTML = '&times;';
    closeButton.setAttribute('aria-label', 'Close notification');
    closeButton.onclick = () => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); };
    toast.appendChild(closeButton);
    container.appendChild(toast);
    requestAnimationFrame(() => { toast.classList.add('show'); });
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, duration);
}

// --- DATE/TIME FORMATTING ---
function formatDateTime(date) {
    const d = new Date(date);
    return {
        date: d.toLocaleDateString(),
        time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    lsAvailable = isLocalStorageAvailable();
    if (!lsAvailable) { showToast('LocalStorage not available. Changes will not be saved.', 'warning', 5000); }

    cart = getLocalStorageItem(LS_KEYS.CART) || [];
    currentItem = getLocalStorageItem(LS_KEYS.CURRENT_ITEM);
    history = getLocalStorageItem(LS_KEYS.HISTORY) || [];

    const page = window.location.pathname.split("/").pop() || 'index.html';

    if (page === 'index.html') { loadMenuItems(); } 
    else if (page === 'toppings.html') { loadToppingsPage(); } 
    else if (page === 'cart.html') { loadCartPage(); }
    else if (page === 'history.html') { loadHistoryPage(); }
});

// --- MENU PAGE (index.html) ---
function loadMenuItems() {
    const menuContainer = document.getElementById('menu-items-container');
    if (!menuContainer) return;
    menuContainer.innerHTML = '';
    for (const itemName in MENU_ITEMS) {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('menu-item');
        const button = document.createElement('button');
        button.textContent = `${itemName} - $${MENU_ITEMS[itemName].toFixed(2)}`;
        button.onclick = () => selectMenuItem(itemName, MENU_ITEMS[itemName]);
        itemDiv.appendChild(button);
        menuContainer.appendChild(itemDiv);
    }
}

function selectMenuItem(name, price) {
    currentItem = {
        id: Date.now(),
        name: name,
        price: price, // Initial price
        originalPrice: price, // Store original for combo toggle
        toppings: [],
        isCombo: false
    };
    setLocalStorageItem(LS_KEYS.CURRENT_ITEM, currentItem);
    window.location.href = 'toppings.html';
}

// --- TOPPINGS PAGE (toppings.html) ---
function loadToppingsPage() {
    const toppingsContainer = document.getElementById('topping-items-container');
    const comboContainer = document.getElementById('combo-container');
    const currentItemDisplay = document.getElementById('current-item-display');

    if (!currentItem || !currentItem.name) {
        showToast('No item selected. Redirecting to menu.', 'warning');
        setTimeout(() => window.location.href = 'index.html', 1500);
        return;
    }

    if (currentItemDisplay) {
        currentItemDisplay.textContent = `Customizing: ${currentItem.name} ($${currentItem.price.toFixed(2)})`;
    }
    
    // Combo Button
    if (comboContainer) {
        comboContainer.innerHTML = '';
        const comboDiv = document.createElement('div');
        comboDiv.classList.add('topping-item');
        const comboButton = document.createElement('button');
        comboButton.textContent = `Add Combo +$${COMBO_PRICE.toFixed(2)}`;
        comboButton.classList.add('combo-btn');
        comboButton.setAttribute('aria-pressed', currentItem.isCombo ? 'true' : 'false');
        comboButton.onclick = () => toggleCombo(comboButton);
        comboDiv.appendChild(comboButton);
        comboContainer.appendChild(comboDiv);
    }

    // Topping Buttons
    if (!toppingsContainer) return;
    toppingsContainer.innerHTML = ''; 
    TOPPINGS_LIST.forEach(toppingName => { /* ... (same as previous version, but uses TOPPINGS_LIST) ... */ 
        const isSelected = currentItem.toppings.includes(toppingName);
        const toppingDiv = document.createElement('div');
        toppingDiv.classList.add('topping-item');
        const button = document.createElement('button');
        button.textContent = toppingName;
        button.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
        if (isSelected) button.classList.add('selected');
        button.onclick = () => toggleTopping(toppingName, button);
        toppingDiv.appendChild(button);
        toppingsContainer.appendChild(toppingDiv);
    });

    // Add "All" button
    const allToppingsDiv = document.createElement('div');
    allToppingsDiv.classList.add('topping-item');
    const allButton = document.createElement('button');
    allButton.textContent = "Toggle All Toppings";
    allButton.onclick = () => toggleAllToppings();
    toppingsContainer.appendChild(allToppingsDiv);
}

function toggleCombo(buttonElement) {
    if (!currentItem) return;

    currentItem.isCombo = !currentItem.isCombo; // Toggle the combo status

    if (currentItem.isCombo) {
        // Applying combo
        if (currentItem.name === "Hotdog" || currentItem.name === "Jumbo Dog") {
            currentItem.price = (currentItem.originalPrice * 2) + COMBO_PRICE;
            showToast('Special Combo Added!', 'success');
        } else {
            currentItem.price = currentItem.originalPrice + COMBO_PRICE;
            showToast('Combo Added!', 'success');
        }
    } else {
        // Removing combo - always revert to original price
        currentItem.price = currentItem.originalPrice;
        showToast('Combo Removed.', 'info');
    }

    buttonElement.setAttribute('aria-pressed', currentItem.isCombo ? 'true' : 'false');
    setLocalStorageItem(LS_KEYS.CURRENT_ITEM, currentItem);
    
    // Update display price
    const currentItemDisplay = document.getElementById('current-item-display');
    if (currentItemDisplay) {
        currentItemDisplay.textContent = `Customizing: ${currentItem.name} ($${currentItem.price.toFixed(2)})`;
    }
     // Reload toppings to update button style (especially if called without element)
     loadToppingsPage();
}

function toggleTopping(toppingName, buttonElement) { /* ... (same as previous version) ... */
    if (!currentItem) return;
    const index = currentItem.toppings.indexOf(toppingName);
    let currentlyPressed;
    if (index > -1) {
        currentItem.toppings.splice(index, 1);
        buttonElement.classList.remove('selected');
        currentlyPressed = false;
    } else {
        currentItem.toppings.push(toppingName);
        buttonElement.classList.add('selected');
        currentlyPressed = true;
    }
    buttonElement.setAttribute('aria-pressed', currentlyPressed ? 'true' : 'false');
    setLocalStorageItem(LS_KEYS.CURRENT_ITEM, currentItem);
}

function toggleAllToppings() { /* ... (same as previous version) ... */
     if (!currentItem) return;
    const allCurrentlySelected = currentItem.toppings.length === TOPPINGS_LIST.length && TOPPINGS_LIST.every(t => currentItem.toppings.includes(t));
    if (allCurrentlySelected) { currentItem.toppings = []; } 
    else { currentItem.toppings = [...TOPPINGS_LIST]; }
    setLocalStorageItem(LS_KEYS.CURRENT_ITEM, currentItem);
    loadToppingsPage();
}

function _saveCurrentItemToCart() { /* ... (same as previous version, but adds toast) ... */
    if (currentItem && currentItem.name) {
        const existingItemIndex = cart.findIndex(item => item.id === currentItem.id);
        if (existingItemIndex > -1) {
            cart[existingItemIndex] = { ...currentItem };
            showToast(`${currentItem.name} updated.`, 'success');
        } else {
            cart.push({ ...currentItem });
            showToast(`${currentItem.name} added.`, 'success');
        }
        setLocalStorageItem(LS_KEYS.CART, cart);
    }
    currentItem = null;
    removeLocalStorageItem(LS_KEYS.CURRENT_ITEM);
}

function orderMore() { _saveCurrentItemToCart(); window.location.href = 'index.html'; }
function viewCart() { _saveCurrentItemToCart(); window.location.href = 'cart.html'; }

// --- CART PAGE (cart.html) ---
function loadCartPage() {
    const cartItemsList = document.getElementById('cart-items-list');
    const totalInfoDiv = document.getElementById('total-info');
    if (!cartItemsList || !totalInfoDiv) return;
    cartItemsList.innerHTML = '';
    let totalAmount = 0;

    if (cart.length === 0) {
        cartItemsList.innerHTML = '<li>Your cart is currently empty.</li>';
        totalInfoDiv.innerHTML = '<p>Total Items: 0</p><p>Total Amount Due: $0.00</p>';
        return;
    }

    cart.forEach(item => {
        const listItem = document.createElement('li');
        // ... (item-info div and its content remain the same as previous version) ...
         const itemInfoDiv = document.createElement('div');
        itemInfoDiv.classList.add('item-info');
        const itemDetailsSpan = document.createElement('span');
        itemDetailsSpan.classList.add('item-details');
        itemDetailsSpan.textContent = `${item.name} - $${item.price.toFixed(2)}`;
        itemInfoDiv.appendChild(itemDetailsSpan);
        const itemToppingsSpan = document.createElement('span');
        itemToppingsSpan.classList.add('item-toppings');
        let toppingsHTML = '';
        if (item.isCombo) { toppingsHTML += '<span class="combo-tag">Combo</span>'; }
        const otherToppings = item.toppings.join(', ');
        if(otherToppings) { toppingsHTML += (item.isCombo ? ' ' : '') + `Toppings: ${otherToppings}`; } 
        else if (!item.isCombo) { toppingsHTML = 'No toppings'; }
        itemToppingsSpan.innerHTML = toppingsHTML;
        itemInfoDiv.appendChild(itemToppingsSpan);
        listItem.appendChild(itemInfoDiv);


        // --- UPDATED ITEM ACTIONS ---
        const itemActionsDiv = document.createElement('div');
        itemActionsDiv.classList.add('item-actions');

        const duplicateButton = document.createElement('button');
        duplicateButton.innerHTML = '<i class="fa-solid fa-copy"></i>Dup';
        duplicateButton.classList.add('duplicate-btn');
        duplicateButton.setAttribute('aria-label', `Duplicate ${item.name}`);
        duplicateButton.onclick = () => duplicateCartItem(item.id);
        itemActionsDiv.appendChild(duplicateButton);

        const editButton = document.createElement('button');
        editButton.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>Edit';
        editButton.classList.add('edit-btn');
        editButton.setAttribute('aria-label', `Edit ${item.name}`);
        editButton.onclick = () => editCartItem(item.id);
        itemActionsDiv.appendChild(editButton);

        const removeButton = document.createElement('button');
        removeButton.innerHTML = '<i class="fa-solid fa-xmark"></i>Rem';
        removeButton.classList.add('remove-btn');
        removeButton.setAttribute('aria-label', `Remove ${item.name} from cart`);
        removeButton.onclick = () => removeItemFromCart(item.id, item.name);
        itemActionsDiv.appendChild(removeButton);
        // --- END UPDATED ITEM ACTIONS ---

        listItem.appendChild(itemActionsDiv);
        cartItemsList.appendChild(listItem);
        totalAmount += item.price;
    });

    totalInfoDiv.innerHTML = `
        <p>Total Menu Items: ${cart.length}</p>
        <p>Total Amount Due: $${totalAmount.toFixed(2)}</p>
    `;
}

function duplicateCartItem(itemId) {
    const itemToDuplicate = cart.find(item => item.id === itemId);
    if (itemToDuplicate) {
        const newItem = {
            ...itemToDuplicate, // Copy all properties
            id: Date.now() // Give it a NEW unique ID
        };
        cart.push(newItem);
        setLocalStorageItem(LS_KEYS.CART, cart);
        loadCartPage();
        showToast(`${newItem.name} duplicated.`, 'info');
    }
}

function printCart() {
    const printContainer = document.getElementById('print-receipt');
    const cartSummary = document.getElementById('cart-summary');
    const totalInfo = document.getElementById('total-info');

    if (!printContainer || !cartSummary || !totalInfo || cart.length === 0) {
        showToast("Cart is empty, nothing to print.", "warning");
        return;
    }

    let receiptHTML = `<h1>Order Receipt</h1>`;
    receiptHTML += `<p class="timestamp">Printed: ${new Date().toLocaleString()}</p>`;
    receiptHTML += `<ul>`;

    cart.forEach(item => {
        let toppingsHTML = '';
        if (item.isCombo) { toppingsHTML += `<strong>Combo</strong>`; }
        const otherToppings = item.toppings.join(', ');
        if (otherToppings) { toppingsHTML += (item.isCombo ? ', ' : '') + `${otherToppings}`; }
        
        receiptHTML += `<li>
            <span class="item-details">${item.name} - $${item.price.toFixed(2)}</span><br>
            <span class="item-toppings">${toppingsHTML || 'No extras'}</span>
        </li>`;
    });

    receiptHTML += `</ul>`;
    receiptHTML += `<div id="total-info">${totalInfo.innerHTML}</div>`; // Use cart's total info

    printContainer.innerHTML = receiptHTML;
    window.print(); // Trigger browser print dialog
}

function editCartItem(itemId) { /* ... (same as previous version) ... */
    const itemToEdit = cart.find(item => item.id === itemId);
    if (itemToEdit) {
        currentItem = { ...itemToEdit }; 
        setLocalStorageItem(LS_KEYS.CURRENT_ITEM, currentItem);
        window.location.href = 'toppings.html';
    } else { showToast('Error: Item not found.', 'error'); }
}

function removeItemFromCart(itemId, itemName) { /* ... (same as previous version) ... */
    const initialLength = cart.length;
    cart = cart.filter(item => item.id !== itemId);
    if (cart.length < initialLength) {
        setLocalStorageItem(LS_KEYS.CART, cart);
        loadCartPage();
        showToast(`${itemName || 'Item'} removed.`, 'info');
    }
}

function startNewOrder() {
    if (cart.length === 0) {
        showToast("Cart is empty. Nothing to save.", "warning");
        return;
    }

    if (confirm("This will save the current order to history and start a new one. Are you sure?")) {
        const now = new Date();
        const total = cart.reduce((sum, item) => sum + item.price, 0);

        const newOrder = {
            orderId: now.getTime(),
            dateTime: now.toISOString(),
            totalPrice: total,
            items: [...cart] // Create a copy
        };

        history.push(newOrder);
        setLocalStorageItem(LS_KEYS.HISTORY, history);

        cart = [];
        currentItem = null;
        removeLocalStorageItem(LS_KEYS.CART);
        removeLocalStorageItem(LS_KEYS.CURRENT_ITEM);

        showToast("Order Saved! Starting new order.", "success");
        setTimeout(() => window.location.href = 'index.html', 1500);
    }
}

// --- HISTORY PAGE (history.html) ---
function loadHistoryPage() {
    const tableBody = document.getElementById('history-table-body');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (history.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No order history found.</td></tr>';
        return;
    }

    const sortedHistory = [...history].sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

    sortedHistory.forEach(order => {
        const { date, time } = formatDateTime(order.dateTime);
        
        // Add Header Row for the Order
        const headerRow = document.createElement('tr');
        headerRow.classList.add('order-header');
        headerRow.innerHTML = `<td colspan="6">
            Order: #${order.orderId} --- 
            Date: ${date}, ${time} --- 
            Total: $${order.totalPrice.toFixed(2)}
        </td>`;
        tableBody.appendChild(headerRow);

        // Add Item Rows for the Order
        order.items.forEach(item => {
            const row = document.createElement('tr');
            row.classList.add('item-row'); // Add class for filtering
            
            const toppingsString = item.toppings.join(', ');
            const comboString = item.isCombo ? `<span class="combo-tag">Yes</span>` : 'No';

            row.innerHTML = `
                <td>${date}</td>
                <td>${time}</td>
                <td>${item.name}</td>
                <td>${comboString}</td>
                <td>${toppingsString || 'None'}</td>
                <td>$${item.price.toFixed(2)}</td>
            `;
            tableBody.appendChild(row);
        });
    });
}

function filterHistoryTable() {
    const input = document.getElementById('history-search');
    const filter = input.value.toUpperCase();
    const tableBody = document.getElementById('history-table-body');
    const rows = tableBody.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        // Only filter item rows, always show header rows
        if (row.classList.contains('item-row')) {
            const cells = row.getElementsByTagName('td');
            let found = false;
            // Search in Item Name (index 2) and Toppings (index 4)
            const itemCell = cells[2];
            const toppingsCell = cells[4];
            if (itemCell && toppingsCell) {
                if (itemCell.textContent.toUpperCase().indexOf(filter) > -1 || 
                    toppingsCell.textContent.toUpperCase().indexOf(filter) > -1) {
                    found = true;
                }
            }
            row.style.display = found ? "" : "none";
        } else if (row.classList.contains('order-header')) {
            // Check if *any* item in this order matches, if so, show header
            let nextRow = row.nextElementSibling;
            let orderHasMatch = false;
            while(nextRow && nextRow.classList.contains('item-row')) {
                const itemCells = nextRow.getElementsByTagName('td');
                if (itemCells[2] && itemCells[4]) {
                    if (itemCells[2].textContent.toUpperCase().indexOf(filter) > -1 || 
                        itemCells[4].textContent.toUpperCase().indexOf(filter) > -1) {
                        orderHasMatch = true;
                        break;
                    }
                }
                nextRow = nextRow.nextElementSibling;
            }
             row.style.display = orderHasMatch ? "" : "none";
             // If filter is empty, show all headers
             if(filter === "") {
                row.style.display = "";
             }
        }
    }
     // If filter is empty, ensure all item rows are shown
    if (filter === "") {
        for (let i = 0; i < rows.length; i++) {
             rows[i].style.display = "";
        }
    }
}

function clearHistory() {
     if (confirm("Are you sure you want to PERMANENTLY delete all order history? This cannot be undone.")) {
        history = [];
        removeLocalStorageItem(LS_KEYS.HISTORY);
        loadHistoryPage();
        showToast("Order history cleared.", "info");
     }
}

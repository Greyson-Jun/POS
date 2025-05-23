const MENU_ITEMS = {
    "Hotdog": 3.00,
    "Jumbo Dog": 6.00,
    "Chicago Dog": 5.50,
    "Chilly Dog": 4.00,
    "Italian Beef": 7.00,
    "Polish Sausage": 7.00
};

const TOPPINGS_LIST = ["Sauerkraut", "Onion", "Fried Onion", "Relish", "Pepper"];

const LS_KEYS = {
    CART: 'posCartV3',
    CURRENT_ITEM: 'posCurrentItemV3',
    LS_AVAILABLE_CHECK: 'posLsCheck'
};

let cart = [];
let currentItem = null;
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

function getLocalStorageItem(key) {
    if (!lsAvailable) return null;
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.error(`Error getting item ${key} from localStorage:`, e);
        return null;
    }
}

function setLocalStorageItem(key, value) {
    if (!lsAvailable) return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error(`Error setting item ${key} in localStorage:`, e);
        showToast('Could not save data. Storage might be full.', 'error');
    }
}

function removeLocalStorageItem(key) {
    if (!lsAvailable) return;
    try {
        localStorage.removeItem(key);
    } catch (e) {
        console.error(`Error removing item ${key} from localStorage:`, e);
    }
}

// --- TOAST NOTIFICATION ---
function showToast(message, type = 'info', duration = 3000) {
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
    closeButton.onclick = () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300); // Allow fade out
    };
    toast.appendChild(closeButton);

    container.appendChild(toast);
    
    // Trigger reflow for transition
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    lsAvailable = isLocalStorageAvailable();
    if (!lsAvailable) {
        showToast('LocalStorage is not available. Changes will not be saved.', 'warning', 5000);
    }

    cart = getLocalStorageItem(LS_KEYS.CART) || [];
    currentItem = getLocalStorageItem(LS_KEYS.CURRENT_ITEM);

    const page = window.location.pathname.split("/").pop() || 'index.html';

    if (page === 'index.html') {
        // When on menu page, clear current item unless it's explicitly kept for an edit flow (not implemented here yet as such)
        // For now, this selectMenuItem will always create a new one.
        // removeLocalStorageItem(LS_KEYS.CURRENT_ITEM);
        // currentItem = null; // This would prevent editing if user navigates index->cart->edit->index
        loadMenuItems();
    } else if (page === 'toppings.html') {
        loadToppingsPage();
    } else if (page === 'cart.html') {
        loadCartPage();
    }
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
        id: Date.now(), // Fresh ID for a new selection
        name: name,
        price: price,
        toppings: []
    };
    setLocalStorageItem(LS_KEYS.CURRENT_ITEM, currentItem);
    window.location.href = 'toppings.html';
}

// --- TOPPINGS PAGE (toppings.html) ---
function loadToppingsPage() {
    const toppingsContainer = document.getElementById('topping-items-container');
    const currentItemDisplay = document.getElementById('current-item-display');

    if (!currentItem || !currentItem.name) {
        showToast('No item selected. Redirecting to menu.', 'warning');
        setTimeout(() => window.location.href = 'index.html', 1500);
        return;
    }

    if (currentItemDisplay) {
        currentItemDisplay.textContent = `Customizing: ${currentItem.name}`;
    }

    if (!toppingsContainer) return;
    toppingsContainer.innerHTML = ''; 

    TOPPINGS_LIST.forEach(toppingName => {
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

    const allToppingsDiv = document.createElement('div');
    allToppingsDiv.classList.add('topping-item');
    const allButton = document.createElement('button');
    const allSelected = currentItem.toppings.length === TOPPINGS_LIST.length && TOPPINGS_LIST.every(t => currentItem.toppings.includes(t));
    allButton.textContent = "Toggle All Toppings";
    allButton.setAttribute('aria-pressed', allSelected ? 'true' : 'false');
    allButton.onclick = () => toggleAllToppings();
    allToppingsDiv.appendChild(allButton);
    toppingsContainer.appendChild(allToppingsDiv);
}

function toggleTopping(toppingName, buttonElement) {
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
    // Update "Toggle All Toppings" button's aria-pressed state
    const allButton = document.querySelector('.topping-item button[onclick="toggleAllToppings()"]');
    if(allButton){
        const allSelected = currentItem.toppings.length === TOPPINGS_LIST.length && TOPPINGS_LIST.every(t => currentItem.toppings.includes(t));
        allButton.setAttribute('aria-pressed', allSelected ? 'true' : 'false');
    }
}

function toggleAllToppings() {
    if (!currentItem) return;
    const allCurrentlySelected = currentItem.toppings.length === TOPPINGS_LIST.length && TOPPINGS_LIST.every(t => currentItem.toppings.includes(t));

    if (allCurrentlySelected) {
        currentItem.toppings = [];
    } else {
        currentItem.toppings = [...TOPPINGS_LIST];
    }
    setLocalStorageItem(LS_KEYS.CURRENT_ITEM, currentItem);
    loadToppingsPage(); // Re-render buttons to show visual and ARIA state
}

function _saveCurrentItemToCart() {
    if (currentItem && currentItem.name) {
        const existingItemIndex = cart.findIndex(item => item.id === currentItem.id);
        if (existingItemIndex > -1) { // Item was being edited
            cart[existingItemIndex] = { ...currentItem }; // Update existing item
            showToast(`${currentItem.name} updated in cart.`, 'success');
        } else { // New item
            cart.push({ ...currentItem });
            showToast(`${currentItem.name} added to cart.`, 'success');
        }
        setLocalStorageItem(LS_KEYS.CART, cart);
    }
    currentItem = null;
    removeLocalStorageItem(LS_KEYS.CURRENT_ITEM);
}

function orderMore() {
    _saveCurrentItemToCart();
    window.location.href = 'index.html';
}

function viewCart() {
    _saveCurrentItemToCart();
    window.location.href = 'cart.html';
}

// --- CART PAGE (cart.html) ---
function loadCartPage() {
    const cartItemsList = document.getElementById('cart-items-list');
    const totalInfoDiv = document.getElementById('total-info');

    if (!cartItemsList || !totalInfoDiv) return;
    cartItemsList.innerHTML = ''; 

    if (cart.length === 0) {
        cartItemsList.innerHTML = '<li>Your cart is currently empty.</li>';
        totalInfoDiv.innerHTML = '<p>Total Menu Items: 0</p><p>Total Amount Due: $0.00</p>';
        return;
    }

    let totalAmount = 0;
    let totalItems = 0;

    cart.forEach(item => {
        const listItem = document.createElement('li');
        
        const itemInfoDiv = document.createElement('div');
        itemInfoDiv.classList.add('item-info');

        const itemDetailsSpan = document.createElement('span');
        itemDetailsSpan.classList.add('item-details');
        itemDetailsSpan.textContent = `${item.name} - $${item.price.toFixed(2)}`;
        itemInfoDiv.appendChild(itemDetailsSpan);
        
        const itemToppingsSpan = document.createElement('span');
        itemToppingsSpan.classList.add('item-toppings');
        itemToppingsSpan.textContent = item.toppings && item.toppings.length > 0 
            ? `Toppings: ${item.toppings.join(', ')}` 
            : 'No toppings selected';
        itemInfoDiv.appendChild(itemToppingsSpan);
        listItem.appendChild(itemInfoDiv);

        const itemActionsDiv = document.createElement('div');
        itemActionsDiv.classList.add('item-actions');

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add('edit-btn');
        editButton.setAttribute('aria-label', `Edit ${item.name}`);
        editButton.onclick = () => editCartItem(item.id);
        itemActionsDiv.appendChild(editButton);

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.classList.add('remove-btn');
        removeButton.setAttribute('aria-label', `Remove ${item.name} from cart`);
        removeButton.onclick = () => removeItemFromCart(item.id, item.name);
        itemActionsDiv.appendChild(removeButton);
        
        listItem.appendChild(itemActionsDiv);
        cartItemsList.appendChild(listItem);

        totalAmount += item.price;
        totalItems++;
    });

    totalInfoDiv.innerHTML = `
        <p>Total Menu Items: ${totalItems}</p>
        <p>Total Amount Due: $${totalAmount.toFixed(2)}</p>
    `;
}

function editCartItem(itemId) {
    const itemToEdit = cart.find(item => item.id === itemId);
    if (itemToEdit) {
        currentItem = { ...itemToEdit }; // Load item into currentItem
        setLocalStorageItem(LS_KEYS.CURRENT_ITEM, currentItem);
        window.location.href = 'toppings.html';
    } else {
        showToast('Error: Item not found for editing.', 'error');
    }
}

function removeItemFromCart(itemId, itemName) {
    const initialLength = cart.length;
    cart = cart.filter(item => item.id !== itemId);
    if (cart.length < initialLength) {
        setLocalStorageItem(LS_KEYS.CART, cart);
        loadCartPage(); // Refresh cart display
        showToast(`${itemName || 'Item'} removed from cart.`, 'info');
    }
}

function resetCart() {
    if (confirm("Are you sure you want to reset the entire cart? This cannot be undone.")) {
        cart = [];
        currentItem = null; 
        removeLocalStorageItem(LS_KEYS.CART);
        removeLocalStorageItem(LS_KEYS.CURRENT_ITEM);
        loadCartPage();
        showToast("Cart has been reset.", 'info');
    }
}

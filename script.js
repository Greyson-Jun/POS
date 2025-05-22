const menu = {
    "Hotdog": 3.00,
    "Jumbo Dog": 6.00,
    "Chicago Dog": 5.50,
    "Chilly Dog": 4.00,
    "Italian Beef": 7.00,
    "Polish Sausage": 7.00
};

const toppingsList = ["Sauerkraut", "Onion", "Fried Onion", "Relish", "Pepper"];

// Initialize cart and currentItem from localStorage or set to default
let cart = JSON.parse(localStorage.getItem('posCartV1')) || [];
let currentItem = JSON.parse(localStorage.getItem('posCurrentItemV1')) || null;

document.addEventListener('DOMContentLoaded', () => {
    const page = window.location.pathname.split("/").pop() || 'index.html'; // Default to index.html if path is /

    if (page === 'index.html') {
        loadMenuItems();
    } else if (page === 'toppings.html') {
        loadToppingsPage();
    } else if (page === 'cart.html') {
        loadCartPage();
    }
});

// --- Menu Page (index.html) ---
function loadMenuItems() {
    const menuContainer = document.getElementById('menu-items-container');
    if (!menuContainer) return;
    menuContainer.innerHTML = ''; // Clear existing items

    for (const itemName in menu) {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('menu-item');
        const button = document.createElement('button');
        button.textContent = `${itemName} - $${menu[itemName].toFixed(2)}`;
        button.onclick = () => selectMenuItem(itemName, menu[itemName]);
        itemDiv.appendChild(button);
        menuContainer.appendChild(itemDiv);
    }
}

function selectMenuItem(name, price) {
    currentItem = {
        id: Date.now(), // Unique ID for each item instance for potential future modifications
        name: name,
        price: price,
        toppings: []
    };
    localStorage.setItem('posCurrentItemV1', JSON.stringify(currentItem));
    window.location.href = 'toppings.html';
}

// --- Toppings Page (toppings.html) ---
function loadToppingsPage() {
    const toppingsContainer = document.getElementById('topping-items-container');
    const currentItemDisplay = document.getElementById('current-item-display');

    if (!currentItem || !currentItem.name) {
        window.location.href = 'index.html'; // Redirect if no item selected
        return;
    }

    if (currentItemDisplay) {
        currentItemDisplay.textContent = `Customizing: ${currentItem.name}`;
    }

    if (!toppingsContainer) return;
    toppingsContainer.innerHTML = ''; // Clear previous buttons

    toppingsList.forEach(toppingName => {
        const toppingDiv = document.createElement('div');
        toppingDiv.classList.add('topping-item');
        const button = document.createElement('button');
        button.textContent = toppingName;
        if (currentItem.toppings.includes(toppingName)) {
            button.classList.add('selected');
        }
        button.onclick = () => toggleTopping(toppingName, button);
        toppingDiv.appendChild(button);
        toppingsContainer.appendChild(toppingDiv);
    });

    // "All Toppings" button
    const allToppingsDiv = document.createElement('div');
    allToppingsDiv.classList.add('topping-item');
    const allButton = document.createElement('button');
    allButton.textContent = "Toggle All Toppings";
    allButton.onclick = () => toggleAllToppings();
    allToppingsDiv.appendChild(allButton);
    toppingsContainer.appendChild(allToppingsDiv);
}

function toggleTopping(toppingName, buttonElement) {
    if (!currentItem) return;
    const index = currentItem.toppings.indexOf(toppingName);
    if (index > -1) {
        currentItem.toppings.splice(index, 1); // Remove topping
        buttonElement.classList.remove('selected');
    } else {
        currentItem.toppings.push(toppingName); // Add topping
        buttonElement.classList.add('selected');
    }
    localStorage.setItem('posCurrentItemV1', JSON.stringify(currentItem));
}

function toggleAllToppings() {
    if (!currentItem) return;
    // Check if all toppings are currently selected
    const allSelected = toppingsList.length === currentItem.toppings.length && toppingsList.every(t => currentItem.toppings.includes(t));

    if (allSelected) { // If all are selected, deselect all
        currentItem.toppings = [];
    } else { // Otherwise, select all
        currentItem.toppings = [...toppingsList];
    }
    localStorage.setItem('posCurrentItemV1', JSON.stringify(currentItem));
    loadToppingsPage(); // Re-render buttons to show visual state
}


function _addItemToCart() {
    if (currentItem && currentItem.name) {
        // To prevent adding the exact same item instance if user goes back and forth
        // This simple check works if they don't modify toppings after adding.
        // A more robust check might involve looking at currentItem.id
        const existingItemIndex = cart.findIndex(item => item.id === currentItem.id);
        if (existingItemIndex > -1) {
             cart[existingItemIndex] = currentItem; // Update existing item
        } else {
            cart.push(currentItem); // Add new item
        }
        localStorage.setItem('posCartV1', JSON.stringify(cart));
    }
    localStorage.removeItem('posCurrentItemV1');
    currentItem = null;
}

function orderMore() {
    _addItemToCart();
    window.location.href = 'index.html';
}

function viewCart() {
    _addItemToCart();
    window.location.href = 'cart.html';
}

// --- Cart Page (cart.html) ---
function loadCartPage() {
    const cartItemsList = document.getElementById('cart-items-list');
    const totalInfoDiv = document.getElementById('total-info');

    if (!cartItemsList || !totalInfoDiv) return;
    cartItemsList.innerHTML = ''; // Clear previous items

    if (cart.length === 0) {
        cartItemsList.innerHTML = '<li>Your cart is currently empty.</li>';
        totalInfoDiv.innerHTML = '<p>Total Items: 0</p><p>Total Amount: $0.00</p>';
        return;
    }

    let totalAmount = 0;
    let totalItems = 0;

    cart.forEach(item => {
        const listItem = document.createElement('li');
        
        const itemDetails = document.createElement('span');
        itemDetails.classList.add('item-details');
        itemDetails.textContent = `${item.name} - $${item.price.toFixed(2)}`;
        
        const itemToppings = document.createElement('span');
        itemToppings.classList.add('item-toppings');
        if (item.toppings && item.toppings.length > 0) {
            itemToppings.textContent = `Toppings: ${item.toppings.join(', ')}`;
        } else {
            itemToppings.textContent = 'No toppings selected';
        }
        
        listItem.appendChild(itemDetails);
        listItem.appendChild(itemToppings);
        cartItemsList.appendChild(listItem);

        totalAmount += item.price;
        totalItems++;
    });

    totalInfoDiv.innerHTML = `
        <p>Total Menu Items: ${totalItems}</p>
        <p>Total Amount Due: $${totalAmount.toFixed(2)}</p>
    `;
}

function resetCart() {
    if (confirm("Are you sure you want to reset the entire cart?")) {
        cart = [];
        currentItem = null; 
        localStorage.removeItem('posCartV1');
        localStorage.removeItem('posCurrentItemV1');
        loadCartPage(); // Refresh the cart display
        // alert("Cart has been reset."); // Optional: confirm provides feedback
    }
}
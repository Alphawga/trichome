/**
 * LocalStorage Cart Utility
 * Manages cart items in localStorage for unauthenticated users
 */

export interface LocalCartItem {
  product_id: string;
  quantity: number;
}

const CART_STORAGE_KEY = "trichomes_local_cart";

/**
 * Get cart items from localStorage
 */
export const getLocalCart = (): LocalCartItem[] => {
  if (typeof window === "undefined") return [];

  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    return cartData ? JSON.parse(cartData) : [];
  } catch (error) {
    console.error("Error reading local cart:", error);
    return [];
  }
};

/**
 * Save cart items to localStorage
 */
export const saveLocalCart = (items: LocalCartItem[]): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Error saving local cart:", error);
  }
};

/**
 * Add item to local cart
 */
export const addToLocalCart = (product_id: string, quantity: number): void => {
  const cart = getLocalCart();
  const existingItem = cart.find((item) => item.product_id === product_id);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ product_id, quantity });
  }

  saveLocalCart(cart);
};

/**
 * Update item quantity in local cart
 */
export const updateLocalCartItem = (
  product_id: string,
  quantity: number,
): void => {
  const cart = getLocalCart();
  const item = cart.find((item) => item.product_id === product_id);

  if (item) {
    if (quantity <= 0) {
      removeFromLocalCart(product_id);
    } else {
      item.quantity = quantity;
      saveLocalCart(cart);
    }
  }
};

/**
 * Remove item from local cart
 */
export const removeFromLocalCart = (product_id: string): void => {
  const cart = getLocalCart();
  const filteredCart = cart.filter((item) => item.product_id !== product_id);
  saveLocalCart(filteredCart);
};

/**
 * Clear local cart
 */
export const clearLocalCart = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_STORAGE_KEY);
};

/**
 * Get local cart count
 */
export const getLocalCartCount = (): number => {
  const cart = getLocalCart();
  return cart.reduce((sum, item) => sum + item.quantity, 0);
};

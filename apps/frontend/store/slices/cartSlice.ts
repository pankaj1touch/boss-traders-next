import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  id: string;
  type: 'course' | 'ebook';
  title: string;
  price: number;
  thumbnail?: string;
}

interface CartState {
  items: CartItem[];
  total: number;
}

const CART_STORAGE_KEY = 'bossTradersCart';

const getInitialState = (): CartState => {
  const defaultState: CartState = { items: [], total: 0 };

  if (typeof window === 'undefined') {
    return defaultState;
  }

  try {
    const storedState = localStorage.getItem(CART_STORAGE_KEY);
    if (!storedState) {
      return defaultState;
    }

    const parsed = JSON.parse(storedState);
    if (!parsed?.items || !Array.isArray(parsed.items)) {
      return defaultState;
    }

    const items = parsed.items as CartItem[];
    const total = items.reduce((sum, item) => sum + (item.price || 0), 0);

    return {
      items,
      total,
    };
  } catch (error) {
    localStorage.removeItem(CART_STORAGE_KEY);
    return defaultState;
  }
};

const persistCartState = (state: CartState) => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(
    CART_STORAGE_KEY,
    JSON.stringify({
      items: state.items,
      total: state.total,
    })
  );
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: getInitialState(),
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const exists = state.items.find((item) => item.id === action.payload.id);
      if (!exists) {
        state.items.push(action.payload);
        state.total += action.payload.price;
        persistCartState(state);
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      const item = state.items.find((item) => item.id === action.payload);
      if (item) {
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.total = Math.max(0, state.total - item.price);
        persistCartState(state);
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      persistCartState(state);
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;


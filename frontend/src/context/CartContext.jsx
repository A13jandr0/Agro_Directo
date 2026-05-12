import React, { createContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const initialState = {
  carrito: []
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'AGREGAR_AL_CARRITO': {
      // Use cosecha_id or id as the unique key
      const prodId = action.payload.producto.cosecha_id || action.payload.producto.id;
      const existing = state.carrito.find(item => (item.cosecha_id || item.id) === prodId);
      if (existing) {
        return {
          ...state,
          carrito: state.carrito.map(item =>
            (item.cosecha_id || item.id) === prodId
              ? { ...item, cantidad: item.cantidad + action.payload.cantidad }
              : item
          )
        };
      } else {
        return {
          ...state,
          carrito: [...state.carrito, { ...action.payload.producto, cantidad: action.payload.cantidad }]
        };
      }
    }
    case 'ACTUALIZAR_CANTIDAD': {
      const targetId = action.payload.id;
      if (action.payload.cantidad <= 0) {
        return {
          ...state,
          carrito: state.carrito.filter(item => (item.cosecha_id || item.id) !== targetId)
        };
      }
      return {
        ...state,
        carrito: state.carrito.map(item =>
          (item.cosecha_id || item.id) === targetId
            ? { ...item, cantidad: action.payload.cantidad }
            : item
        )
      };
    }
    case 'ELIMINAR_DEL_CARRITO':
      return {
        ...state,
        carrito: state.carrito.filter(item => (item.cosecha_id || item.id) !== action.payload)
      };
    case 'VACIAR_CARRITO':
      return { ...state, carrito: [] };
    case 'LOAD_CART':
      return { ...state, carrito: action.payload };
    default:
      return state;
  }
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load from LocalStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('agro_cart');
    if (savedCart) {
      try {
        dispatch({ type: 'LOAD_CART', payload: JSON.parse(savedCart) });
      } catch (e) { /* corrupted data */ }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('agro_cart', JSON.stringify(state.carrito));
  }, [state.carrito]);

  const agregarAlCarrito = (producto, cantidad = 1) => {
    dispatch({ type: 'AGREGAR_AL_CARRITO', payload: { producto, cantidad } });
  };

  const actualizarCantidad = (id, cantidad) => {
    dispatch({ type: 'ACTUALIZAR_CANTIDAD', payload: { id, cantidad } });
  };

  const eliminarDelCarrito = (id) => {
    dispatch({ type: 'ELIMINAR_DEL_CARRITO', payload: id });
  };

  const vaciarCarrito = () => {
    dispatch({ type: 'VACIAR_CARRITO' });
  };

  return (
    <CartContext.Provider value={{
      carrito: state.carrito,
      agregarAlCarrito,
      actualizarCantidad,
      eliminarDelCarrito,
      vaciarCarrito
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;

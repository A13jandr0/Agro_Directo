import React, { createContext, useReducer, useEffect, useState } from 'react';

const CartContext = createContext();

const initialState = {
  carrito: [],
  lastStockWarning: false,
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'AGREGAR_AL_CARRITO': {
      const prodId = action.payload.producto.cosecha_id || action.payload.producto.id;
      const stockMax = Number(action.payload.producto.cantidad_disponible) || 0;
      let cantidad = Number(action.payload.cantidad) || 1;
      const existing = state.carrito.find(item => (item.cosecha_id || item.id) === prodId);

      const totalSolicitado = (existing?.cantidad || 0) + cantidad;
      const capped = stockMax > 0 && totalSolicitado > stockMax;
      const cantidadFinal = stockMax > 0 ? Math.min(totalSolicitado, stockMax) : totalSolicitado;

      if (stockMax > 0 && cantidadFinal <= 0) {
        return { ...state, lastStockWarning: true };
      }

      if (existing) {
        return {
          ...state,
          lastStockWarning: capped,
          carrito: state.carrito.map(item =>
            (item.cosecha_id || item.id) === prodId
              ? { ...item, cantidad: cantidadFinal }
              : item
          )
        };
      }
      return {
        ...state,
        lastStockWarning: capped,
        carrito: [...state.carrito, { ...action.payload.producto, cantidad: cantidadFinal }]
      };
    }
    case 'ACTUALIZAR_CANTIDAD': {
      const targetId = action.payload.id;
      const item = state.carrito.find(i => (i.cosecha_id || i.id) === targetId);
      const stockMax = Number(item?.cantidad_disponible) || 0;
      let cantidad = action.payload.cantidad;
      const capped = stockMax > 0 && cantidad > stockMax;
      if (stockMax > 0) cantidad = Math.min(cantidad, stockMax);
      if (cantidad <= 0) {
        return {
          ...state,
          carrito: state.carrito.filter(i => (i.cosecha_id || i.id) !== targetId)
        };
      }
      return {
        ...state,
        lastStockWarning: capped,
        carrito: state.carrito.map(i =>
          (i.cosecha_id || i.id) === targetId ? { ...i, cantidad } : i
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
    case 'CLEAR_STOCK_WARNING':
      return { ...state, lastStockWarning: false };
    default:
      return state;
  }
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [conflictoProductor, setConflictoProductor] = useState(null);

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

  const agregarAlCarritoConVerificacion = (producto, cantidad = 1) => {
    if (state.carrito.length > 0) {
      const idExistente = state.carrito[0].productor_id;
      const idNuevo = producto.productor_id;
      const mismoProductor = idExistente && idNuevo
        ? idExistente === idNuevo
        : (state.carrito[0].nombre_finca || '') === (producto.nombre_finca || '');
      if (!mismoProductor) {
        const productorExistente = state.carrito[0].nombre_finca || 'Productor A';
        const productorNuevo = producto.nombre_finca || 'Productor B';
        setConflictoProductor({
          producto,
          cantidad,
          productorExistente,
          productorNuevo
        });
        return false;
      }
    }
    agregarAlCarrito(producto, cantidad);
    return true;
  };

  const reemplazarCarrito = (producto, cantidad = 1) => {
    dispatch({ type: 'VACIAR_CARRITO' });
    dispatch({ type: 'AGREGAR_AL_CARRITO', payload: { producto, cantidad } });
    setConflictoProductor(null);
  };

  const clearStockWarning = () => dispatch({ type: 'CLEAR_STOCK_WARNING' });

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
      lastStockWarning: state.lastStockWarning,
      conflictoProductor,
      setConflictoProductor,
      agregarAlCarrito,
      agregarAlCarritoConVerificacion,
      reemplazarCarrito,
      actualizarCantidad,
      eliminarDelCarrito,
      vaciarCarrito,
      clearStockWarning,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;

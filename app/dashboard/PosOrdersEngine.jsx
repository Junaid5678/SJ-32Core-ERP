'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function PosOrdersEngine({ userEmail }) {
  const [inventory, setInventory] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // 1. Fetch available items from Inventory for POS
  useEffect(() => {
    async function fetchInventoryForPos() {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('tenant_email', userEmail);

      if (!error && data) {
        setInventory(data);
      }
    }
    if (userEmail) fetchInventoryForPos();
  }, [userEmail]);

  // 2. Add item to POS Cart
  const addToCart = (item) => {
    const existing = cart.find((cartItem) => cartItem.id === item.id);
    if (existing) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  // 3. Calculate Grand Total
  const grandTotal = cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

  // 4. Checkout and Place Order Engine
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }
    setLoading(true);

    try {
      // Step A: Insert into orders table
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            tenant_email: userEmail,
            customer_name: customerName || 'Walk-in Customer',
            customer_phone: customerPhone || 'N/A',
            total_amount: grandTotal,
            status: 'completed'
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Step B: Insert order items & update inventory stock
      for (const item of cart) {
        await supabase.from('order_items').insert([
          {
            order_id: orderData.id,
            item_id: item.id,
            item_name: item.item_name,
            quantity: item.quantity,
            unit_price: item.unit_price
          }
        ]);

        // Reduce stock from inventory
        await supabase
          .from('inventory_items')
          .update({ stock_quantity: item.stock_quantity - item.quantity })
          .eq('id', item.id);
      }

      alert('Order placed successfully & Stock updated!');
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
    } catch (err) {
      alert('Checkout error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-base font-bold text-indigo-400">POS & Orders Engine</h2>
          <p className="text-xs text-slate-400">Point of Sale counter, cart management, and instant invoice billing.</p>
        </div>
        <span className="text-xs bg-emerald-950 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
          Engine Active
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Grid for POS */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Available Inventory Items</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2">
            {inventory.map((item) => (
              <div
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-slate-950 border border-slate-800 hover:border-indigo-500 p-3 rounded-xl cursor-pointer transition flex flex-col justify-between"
              >
                <div>
                  <p className="text-xs font-medium text-white">{item.item_name}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Stock: {item.stock_quantity} {item.unit}</p>
                </div>
                <p className="text-xs font-bold text-emerald-400 mt-3">Rs. {item.unit_price}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cart & Billing Section */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-indigo-400 mb-3 uppercase tracking-wider">Current Bill / Cart</h3>
            
            <div className="space-y-2 mb-4 max-h-[150px] overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">Cart is empty. Click items to add.</p>
              ) : (
                cart.map((c) => (
                  <div key={c.id} className="flex justify-between items-center text-xs bg-slate-900 p-2 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{c.item_name}</p>
                      <p className="text-[10px] text-slate-400">{c.quantity} x Rs. {c.unit_price}</p>
                    </div>
                    <p className="text-indigo-300 font-bold">Rs. {c.quantity * c.unit_price}</p>
                  </div>
                ))
              )}
            </div>

            {/* Customer Details Inputs */}
            <div className="space-y-2 mb-4 pt-3 border-t border-slate-800">
              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <input
                type="text"
                placeholder="Customer Phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Checkout Footer */}
          <div>
            <div className="flex justify-between items-center mb-4 pt-3 border-t border-slate-800 text-sm">
              <span className="font-semibold text-slate-300">Grand Total:</span>
              <span className="font-bold text-emerald-400 text-base">Rs. {grandTotal.toLocaleString()}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading || cart.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-semibold py-2.5 rounded-xl transition shadow-md shadow-indigo-600/20"
            >
              {loading ? 'Processing Order...' : 'Complete Checkout & Print'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
            }
         

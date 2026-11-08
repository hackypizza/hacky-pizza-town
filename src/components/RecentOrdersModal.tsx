import React, { useEffect, useState } from 'react';

interface RecentOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
  onOpenAuth?: () => void;
  onExploreMenu?: () => void;
}

export default function RecentOrdersModal({ isOpen, onClose }: RecentOrdersModalProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const loadOrders = async () => {
      setLoading(true);
      try {
        const savedUser = typeof window !== 'undefined' ? localStorage.getItem('hacky_user') : null;
        const user = savedUser ? JSON.parse(savedUser) : null;

        // First load from localStorage offline cache
        const localOrders = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('hacky_past_orders') || '[]') : [];

        if (user?.email) {
          const res = await fetch(`/api/orders/list?email=${encodeURIComponent(user.email)}`);
          const data = await res.json().catch(() => ({}));
          if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
            setOrders(data.orders);
            setLoading(false);
            return;
          }
        }
        setOrders(localOrders);
      } catch (err) {
        console.error('Error fetching past orders:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-[#FFFBF2] rounded-2xl shadow-2xl border-2 border-[#502314] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#502314] text-white p-4 flex justify-between items-center shadow-sm">
          <h3 className="font-black text-lg">🍕 Past & Live Orders</h3>
          <button 
            onClick={onClose} 
            className="text-2xl font-bold leading-none cursor-pointer hover:text-orange-300 transition"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Orders List */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <p className="text-center text-sm font-bold text-gray-500 py-6">Orders load ho rahe hain...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 font-bold">Abhi tak koi order place nahi hua hai.</p>
            </div>
          ) : (
            orders.map((ord: any, idx: number) => {
              let parsedItems = [];
              try {
                parsedItems = typeof ord.items === 'string' ? JSON.parse(ord.items) : (ord.items || []);
              } catch {
                parsedItems = [];
              }

              return (
                <div key={ord.id || idx} className="bg-white border border-orange-200 rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-start border-b pb-2 mb-2">
                    <div>
                      <span className="font-black text-[#502314]">
                        Order #{ord.orderNumber || (ord.id ? ord.id.slice(0, 6) : 'HKY')}
                      </span>
                      <p className="text-[11px] text-gray-400">
                        {ord.createdAt ? new Date(ord.createdAt).toLocaleString('en-IN') : 'Just now'}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-black rounded-full uppercase ${
                      (ord.status === 'DELIVERED' || ord.orderStatus === 'DELIVERED') ? 'bg-green-100 text-green-700' :
                      (ord.status === 'CANCELLED' || ord.orderStatus === 'CANCELLED') ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-[#EA580C]'
                    }`}>
                      {ord.status || ord.orderStatus || 'PENDING'}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-gray-700">
                    {Array.isArray(parsedItems) && parsedItems.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between font-medium">
                        <span>{item.quantity || 1}x {item.name || item.title || 'Pizza Meal'}</span>
                        <span>₹{item.price || item.totalPrice || item.totalUnitPrice || ''}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t mt-3 pt-2 flex justify-between items-center text-sm font-black text-[#502314]">
                    <span>Total Paid ({ord.paymentMethod || 'COD'}):</span>
                    <span className="text-base text-[#EA580C]">₹{ord.totalAmount}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

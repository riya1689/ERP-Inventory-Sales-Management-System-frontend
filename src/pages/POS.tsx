import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Minus, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';
import { api } from '../lib/axios';

interface Product {
  _id: string;
  name: string;
  sku: string;
  sellingPrice: number;
  stockQuantity: number;
  productImage: string;
}

interface CartItem extends Product {
  cartQuantity: number;
}

export const POS = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const queryClient = useQueryClient();

  const { data: productsData } = useQuery({
    queryKey: ['products-search', searchTerm, selectedCategory],
    queryFn: async () => {
      let url = `/products?searchTerm=${searchTerm}&limit=20`;
      if (selectedCategory) url += `&category=${selectedCategory}`;
      const response = await api.get(url);
      return response.data.data.products;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data.data.categories;
    },
  });

  const addToCart = (product: Product) => {
    if (product.stockQuantity === 0) return alert('Out of stock!');
    
    setCart((prev) => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        if (existing.cartQuantity >= product.stockQuantity) {
          alert('Cannot add more than available stock');
          return prev;
        }
        return prev.map(item => 
          item._id === product._id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item
        );
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const decrementQuantity = (productId: string) => {
    setCart((prev) => 
      prev.map(item => 
        item._id === productId && item.cartQuantity > 1 
          ? { ...item, cartQuantity: item.cartQuantity - 1 } 
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter(item => item._id !== productId));
  };

  const subTotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.cartQuantity), 0);
  const grandTotal = Math.max(0, subTotal - discount);

  const saleMutation = useMutation({
    mutationFn: async () => {
      const saleData = {
        items: cart.map(item => ({
          productId: item._id,
          quantity: item.cartQuantity
        })),
        discount,
        paymentMethod,
        customerName,
        customerPhone
      };
      const response = await api.post('/sales', saleData);
      return response.data;
    },
    onSuccess: (data) => {
      alert(`Sale completed successfully! Invoice: ${data.data.sale.invoiceNumber}`);
      setCart([]);
      setDiscount(0);
      setSearchTerm('');
      setCustomerName('');
      setCustomerPhone('');
      setStep(1);
      queryClient.invalidateQueries({ queryKey: ['products-search'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to complete sale');
    }
  });

  const renderCartItems = () => (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {cart.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-slate-400">
          <ShoppingCart size={48} className="mb-4 opacity-20" />
          <p>Cart is empty</p>
          <p className="text-sm">Search and click products to add</p>
        </div>
      ) : (
        cart.map(item => (
          <div key={item._id} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex-1 min-w-0 mr-3">
              <h4 className="font-semibold text-slate-900 text-sm truncate">{item.name}</h4>
              <div className="text-indigo-600 font-medium">৳{item.sellingPrice} <span className="text-slate-400 text-xs font-normal">x {item.cartQuantity}</span></div>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={() => decrementQuantity(item._id)} className="p-1 rounded-md bg-white border border-slate-300 text-slate-600 hover:bg-slate-100">
                <Minus size={14} />
              </button>
              <span className="w-6 text-center text-sm font-semibold">{item.cartQuantity}</span>
              <button onClick={() => addToCart(item)} className="p-1 rounded-md bg-white border border-slate-300 text-slate-600 hover:bg-slate-100">
                <Plus size={14} />
              </button>
              <button onClick={() => removeFromCart(item._id)} className="p-1 rounded-md text-red-500 hover:bg-red-50 ml-1">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-50 p-4 gap-4">
      
      {step === 1 && (
        <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search products by name or SKU to add to cart..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-slate-300 py-3 px-4 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white min-w-[150px]"
            >
              <option value="">All Categories</option>
              {categories?.map((cat: any) => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {productsData?.map((product: Product) => (
              <div 
                key={product._id} 
                onClick={() => addToCart(product)}
                className={`cursor-pointer rounded-lg border p-3 hover:border-indigo-500 hover:shadow-md transition-all ${product.stockQuantity === 0 ? 'opacity-50 grayscale pointer-events-none' : 'border-slate-200'}`}
              >
                <img src={product.productImage} alt={product.name} className="w-full h-32 object-cover rounded-md mb-3 border" />
                <h3 className="font-semibold text-slate-900 truncate">{product.name}</h3>
                <p className="text-xs text-slate-500 mb-2">SKU: {product.sku}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-indigo-600">৳{product.sellingPrice}</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${product.stockQuantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {product.stockQuantity} in stock
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {step === 2 && (
        <div className="flex-1 flex flex-col bg-white border-r border-slate-200 shadow-sm overflow-hidden p-0 m-6 rounded-xl">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setStep(1)} className="p-1.5 hover:bg-slate-800 rounded-md transition-colors">
                <ArrowLeft size={18} />
              </button>
              <h2 className="font-bold text-lg flex items-center gap-2">
                <ShoppingCart size={20} /> Cart Items
              </h2>
            </div>
            <span className="bg-slate-700 px-2 py-1 rounded text-sm">{cart.length} Items</span>
          </div>
          {renderCartItems()}
        </div>
      )}

      <div className="w-[450px] shrink-0 bg-white border-l border-slate-200 flex flex-col h-full shadow-sm overflow-hidden">
        
        {step === 1 ? (
          <>
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <ShoppingCart size={20} /> Current Cart
              </h2>
              <span className="bg-slate-700 px-2 py-1 rounded text-sm">{cart.length} Items</span>
            </div>
            
            {renderCartItems()}
            
            <div className="p-4 bg-slate-50 border-t border-slate-200">
              <div className="flex justify-between text-lg font-bold text-slate-900 mb-4">
                <span>Grand Total</span>
                <span className="text-indigo-600">৳{subTotal.toFixed(2)}</span>
              </div>
              <button 
                onClick={() => setStep(2)}
                disabled={cart.length === 0}
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition-colors"
              >
                Proceed to payment
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="font-bold text-lg">Complete Sale</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3 mb-6">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Customer Information</h3>
                <input 
                  type="text"
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:border-indigo-500"
                />
                <input 
                  type="text"
                  placeholder="Customer Phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">৳{subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Discount (৳)</span>
                  <input 
                    type="number" 
                    value={discount} 
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    min="0"
                    className="w-24 px-2 py-1 border border-slate-300 rounded text-right focus:outline-none focus:border-indigo-500" 
                  />
                </div>
                <div className="flex justify-between items-center text-slate-600 pt-2 border-t border-slate-200">
                  <span>Payment Method</span>
                  <select 
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="px-2 py-1 border border-slate-300 rounded focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="MobileBanking">Mobile Banking</option>
                  </select>
                </div>
                <div className="flex justify-between text-lg font-bold text-slate-900 pt-4 mt-2 border-t-2 border-slate-200">
                  <span>Grand Total</span>
                  <span className="text-indigo-600">৳{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-200">
              <button 
                onClick={() => saleMutation.mutate()}
                disabled={cart.length === 0 || !customerName || !customerPhone || saleMutation.isPending}
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-md"
              >
                {saleMutation.isPending ? 'Processing...' : 'Complete Sale'}
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  );
};
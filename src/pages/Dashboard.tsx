import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { 
  Package, 
  ShoppingCart, 
  AlertTriangle,
  List
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const Dashboard = () => {

  const { data, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await api.get('/dashboard');
      return response.data.data;
    }
  });

  const stats = [
    { title: 'Total Revenue', value: `৳${data?.totalRevenue?.toLocaleString() || 0}`, icon: () => <span className="font-bold text-xl">৳</span>, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Total Sales', value: data?.totalSales || 0, icon: ShoppingCart, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { title: 'Total Products', value: data?.totalProducts || 0, icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Total Categories', value: data?.totalCategories || 0, icon: List, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  if (isLoading) {
    return <div className="flex h-full items-center justify-center text-indigo-600">Loading Dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <header className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Dashboard Overview</h2>
          <p className="text-slate-500">Welcome back! Here's what's happening with your store today.</p>
        </header>

        {/* Status card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 rounded-xl bg-white p-6 shadow-sm border border-slate-200">
            <h3 className="mb-6 text-lg font-bold text-slate-900">Revenue Overview (Last 8 Days)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.chartData || []}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => `৳${value}`}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`৳${value}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#4f46e5" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Low Stock and Recent Sales panel */}
          <div className="space-y-8">
            
            {/* Low Stock Alerts */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="text-amber-500" size={20} />
                  Low Stock Alerts
                </h3>
              </div>
              <div className="space-y-4">
                {data?.lowStockProducts.length === 0 ? (
                  <p className="text-sm text-slate-500">All products are well stocked!</p>
                ) : (
                  data?.lowStockProducts.map((product: any) => (
                    <div key={product._id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                      <img src={product.productImage} className="w-10 h-10 rounded object-cover" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-slate-900 truncate pr-2">{product.name}</h4>
                        <p className="text-xs text-red-600 font-medium">Only {product.stockQuantity} left in stock</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-lg text-slate-900 mb-4">Recent Sales</h3>
              <div className="space-y-4">
                {data?.recentSales.map((sale: any) => (
                  <div key={sale._id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{sale.invoiceNumber}</p>
                      <p className="text-xs text-slate-500">{sale.soldBy?.name}</p>
                    </div>
                    <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900">৳{sale.grandTotal.toLocaleString()}</p>
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{sale.paymentMethod}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
      </div>
    </div>
  );
};

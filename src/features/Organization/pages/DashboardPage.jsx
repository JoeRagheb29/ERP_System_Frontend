import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/auth.store';
import Chart from 'react-apexcharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDollarSign, faUsers, faCartShopping, 
  faCircleExclamation, faChartLine, faBoxOpen,
} from '@fortawesome/free-solid-svg-icons';
import StatCard from '../components/StatCard';
import ShortcutCard from '../components/ShortcutCard';
import { QuickActions } from '../constants/dashboard.constants';
import axiosInstance from '../../../api/client'; 

function DashboardPage() {
  const { user } = useAuthStore();
  
  // ── حالات البيانات (States) ──
  const [kpis, setKpis] = useState({
    totalRevenue: 0,
    activeEmployees: 0,
    pendingOrdersCount: 0,
    lowStockCount: 0,
  });
  const [chartData, setChartData] = useState({ categories: [], series: [] });
  const [selectedYear, setSelectedYear] = useState('2026'); // الباك إند شغال في عام 2026
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── جلب البيانات الحقيقية من FastAPI ──
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 1. جلب المبيعات (Sales Orders)
        const salesResponse = await axiosInstance.get('/sales-orders/');
        // استخراج المصفوفة الحقيقية من داخل حقل items لمنع ايرور الـ reduce
        const orders = salesResponse.data?.items || [];

        // 2. جلب الموظفين لمعرفة عددهم الإجمالي
        const employeesResponse = await axiosInstance.get('/employees/');
        const employeesList = employeesResponse.data || [];
        const totalEmployees = Array.isArray(employeesList) ? employeesList.length : (employeesList.items?.length || 0);

        // 3. جلب النواقص من المخزن
        const lowStockResponse = await axiosInstance.get('/inventory/stock/low');
        const lowStockItems = lowStockResponse.data || [];

        // ── معالجة البيانات لحساب الـ KPIs ──
        
        // حساب إجمالي الأرباح من الطلبات (يمكنك تصفية الطلبات التي ليست مسودة "draft" إذا أردت)
        const totalRevenue = orders.reduce((sum, order) => {
          return sum + (Number(order.total_amount) || 0);
        }, 0);

        // حساب عدد الطلبات المعلقة (المسودة draft أو pending حسب الحالات عندك)
        const pendingOrders = orders.filter(order => {
          const status = order.status?.toLowerCase();
          return status === 'pending' || status === 'draft';
        }).length;

        setKpis({
          totalRevenue: totalRevenue,
          activeEmployees: totalEmployees,
          pendingOrdersCount: pendingOrders,
          lowStockCount: lowStockItems.length
        });

        // ── معالجة بيانات الرسم البياني (توزيع الإيرادات على الشهور) ──
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyRevenue = Array(12).fill(0);

        orders.forEach(order => {
          const orderDateStr = order.created_at;
          if (orderDateStr) {
            const date = new Date(orderDateStr);
            if (date.getFullYear().toString() === selectedYear) {
              const monthIndex = date.getMonth(); // 0 - 11
              monthlyRevenue[monthIndex] += (Number(order.total_amount) || 0) / 1000; // بالـ k$
            }
          }
        });

        setChartData({
          categories: months.slice(0, 12), // عرض الـ 12 شهر بالكامل ديناميكيًا
          series: monthlyRevenue.slice(0, 12)
        });

      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError("Failed to sync with system servers. Please check your local server (FastAPI) status.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedYear]);

  // ── إعدادات الرسم البياني (ApexCharts) ──
  const chartOptions = {
    chart: {
      type: 'area',
      fontFamily: 'inherit',
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    colors: ['#3b82f6'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0,
        stops: [0, 90, 100]
      }
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    xaxis: {
      categories: chartData.categories.length > 0 ? chartData.categories : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#64748b' } }
    },
    yaxis: {
      labels: {
        style: { colors: '#64748b' },
        formatter: (value) => `$${value.toFixed(1)}k`
      }
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
    },
    tooltip: { theme: 'light' }
  };

  const chartSeries = [
    {
      name: 'Revenue',
      data: chartData.series.length > 0 ? chartData.series : Array(12).fill(0)
    }
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="text-slate-500 text-sm">Fetching real-time dashboard analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm max-w-lg mx-auto">
        <p className="text-rose-500 font-semibold text-lg">Backend Unreachable</p>
        <p className="text-slate-500 text-sm">
          Please make sure your FastAPI local server is running on <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-600">http://127.0.0.1:8000</code> and CORS is enabled.
        </p>
        <button 
          onClick={() => setSelectedYear(selectedYear)}
          className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
        >
          Try Reloading
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* ── رأس الصفحة (Header) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Welcome back, {user?.username || 'Director'} 👋
          </h1>
          <p className="text-slate-500 mt-1">
            Here's what's happening across your organization today.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-medium text-slate-600">System Online</span>
        </div>
      </div>

      {/* ── الإحصائيات الحيوية (Top KPIs) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`$${kpis.totalRevenue.toLocaleString()}`} 
          trend="Live data" 
          trendUp={true}
          icon={faDollarSign} 
          colorClass="bg-blue-50"
          iconColor="text-blue-600" 
        />
        <StatCard 
          title="Active Employees" 
          value={kpis.activeEmployees.toString()} 
          trend="Total active" 
          trendUp={true}
          icon={faUsers} 
          colorClass="bg-indigo-50"
          iconColor="text-indigo-600" 
        />
        <StatCard 
          title="Pending Orders" 
          value={kpis.pendingOrdersCount.toString()} 
          trend="Awaiting process" 
          trendUp={false}
          icon={faCartShopping} 
          colorClass="bg-amber-50"
          iconColor="text-amber-600" 
        />
        <StatCard 
          title="Low Stock Items" 
          value={kpis.lowStockCount.toString()} 
          trend={kpis.lowStockCount > 0 ? "Needs attention" : "Stock healthy"} 
          trendUp={false}
          icon={faCircleExclamation} 
          colorClass="bg-rose-50"
          iconColor="text-rose-600" 
        />
      </div>

      {/* ── القسم الأوسط: التحليلات والاختصارات ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── الرسم البياني (ApexChart) ── */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FontAwesomeIcon icon={faChartLine} className="text-blue-500" />
              Revenue Overview
            </h3>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="text-sm border-slate-200 rounded-md text-slate-600 bg-slate-50 px-2 py-1 outline-none cursor-pointer"
            >
              <option value="2026">This Year (2026)</option>
              <option value="2025">Last Year (2025)</option>
            </select>
          </div>
          
          <div className="w-full h-72">
            <Chart 
              options={chartOptions} 
              series={chartSeries} 
              type="area" 
              height="100%" 
            />
          </div>
        </div>

        {/* ── اختصارات سريعة (Quick Shortcuts) ── */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 mb-4 px-1">Quick Actions</h3>
          {QuickActions.map((item, index) => (
            <ShortcutCard 
              key={index}
              title={item.title}
              desc={item.desc}
              link={item.link}
              icon={item.icon}
              bgHover={item.bgHover}
            />
          ))}
          <ShortcutCard 
            title="Approve Leaves" 
            desc="Review active requests" 
            link="/leave-requests" 
            icon={faUsers}
            bgHover="hover:border-indigo-200 hover:bg-indigo-50/50"
          />
          <ShortcutCard 
            title="Manage Products" 
            desc="Add or update inventory" 
            link="/inventory/products" 
            icon={faBoxOpen}
            bgHover="hover:border-blue-200 hover:bg-blue-50/50"
          />
          <ShortcutCard 
            title="Sales Orders" 
            desc="View recent transactions" 
            link="/sales-orders" 
            icon={faCartShopping}
            bgHover="hover:border-emerald-200 hover:bg-emerald-50/50"
          />
        </div>

      </div>
    </div>
  );
}

export default DashboardPage;
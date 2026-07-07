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

function DashboardPage() {
  const { user } = useAuthStore();

  console.log("user: ", user);

  // ── إعدادات الرسم البياني (ApexCharts Configuration) ──
  const chartOptions = {
    chart: {
      type: 'area',
      fontFamily: 'inherit',
      toolbar: { show: false }, // إخفاء أدوات التحميل والزوم لشكل أنظف
      zoom: { enabled: false }
    },
    colors: ['#3b82f6'], // لون الخط (أزرق متوافق مع Tailwind blue-500)
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
    stroke: { curve: 'smooth', width: 3 }, // خط منحني وناعم
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#64748b' } } // لون الخطوط السفلية
    },
    yaxis: {
      labels: {
        style: { colors: '#64748b' },
        formatter: (value) => `$${value}k` // تنسيق الأرقام كعملة
      }
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4, // خطوط شبكة متقطعة لشكل عصري
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
    },
    tooltip: { theme: 'light' }
  };

  const chartSeries = [
    {
      name: 'Revenue',
      data: [30, 40, 35, 50, 49, 70, 90] // البيانات الوهمية
    }
  ];

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
          value="$124,500" 
          trend="+12.5%" 
          trendUp={true}
          icon={faDollarSign} 
          colorClass="bg-blue-50"
          iconColor="text-blue-600" 
        />
        <StatCard 
          title="Active Employees" 
          value="142" 
          trend="+3 New" 
          trendUp={true}
          icon={faUsers} 
          colorClass="bg-indigo-50"
          iconColor="text-indigo-600" 
        />
        <StatCard 
          title="Pending Orders" 
          value="28" 
          trend="-5%" 
          trendUp={false}
          icon={faCartShopping} 
          colorClass="bg-amber-50"
          iconColor="text-amber-600" 
        />
        <StatCard 
          title="Low Stock Items" 
          value="12" 
          trend="Needs attention" 
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
            <select className="text-sm border-slate-200 rounded-md text-slate-600 bg-slate-50 px-2 py-1 outline-none">
              <option>This Year</option>
              <option>Last Year</option>
            </select>
          </div>
          
          {/* مكون الرسم البياني هنا */}
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
            desc="4 requests pending" 
            link="/hr/leave-requests" 
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
            link="/sales/orders" 
            icon={faCartShopping}
            bgHover="hover:border-emerald-200 hover:bg-emerald-50/50"
          />
          <ShortcutCard 
            title="System Roles" 
            desc="Manage permissions" 
            link="/admin/roles" 
            icon={faCircleExclamation}
            bgHover="hover:border-rose-200 hover:bg-rose-50/50"
          />
        </div>

      </div>
    </div>
  );
}

export default DashboardPage;
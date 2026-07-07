import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const StatCard = ({ title, value, trend, icon, colorClass, iconColor, trendUp }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
      </div>
      <div className={`p-4 rounded-xl flex items-center justify-center ${colorClass}`}>
        <FontAwesomeIcon icon={icon} className={`text-xl ${iconColor}`} />
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm">
      <span className={`font-medium ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
        {trend}
      </span>
      <span className="text-slate-400 ml-2">vs last month</span>
    </div>
  </div>
);

export default StatCard;
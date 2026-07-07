import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

// ── مكون فرعي: بطاقة الاختصارات (Shortcut Card) ──
const ShortcutCard = ({ title, desc, link, icon, bgHover }) => (
  <Link 
    to={link} 
    className={`group flex items-center p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 ${bgHover}`}
  >
    <div className="p-3 w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-600 rounded-lg group-hover:bg-white transition-colors">
      <FontAwesomeIcon icon={icon} />
    </div>
    <div className="ml-4 flex-1">
      <h4 className="text-sm font-semibold text-slate-800 group-hover:text-blue-700">{title}</h4>
      <p className="text-xs text-slate-500">{desc}</p>
    </div>
    <FontAwesomeIcon icon={faArrowRight} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
  </Link>
);

export default ShortcutCard;
import { faBoxOpen, faCartShopping, faCircleExclamation, faUsers } from "@fortawesome/free-solid-svg-icons";

export const QuickActions = [
  { title: "Approve Leaves", desc: "4 requests pending", link: "/hr/leave-requests", icon: faUsers, bgHover: "hover:border-indigo-200 hover:bg-indigo-50/50" },
  { title: "Manage Products", desc: "Add or update inventory", link: "/inventory/products", icon: faBoxOpen, bgHover: "hover:border-blue-200 hover:bg-blue-50/50" },
  { title: "Sales Orders", desc: "View recent transactions", link: "/sales/orders", icon: faCartShopping, bgHover: "hover:border-emerald-200 hover:bg-emerald-50/50" },
  { title: "System Roles", desc: "Manage permissions", link: "/admin/roles", icon: faCircleExclamation, bgHover: "hover:border-rose-200 hover:bg-rose-50/50" }
];


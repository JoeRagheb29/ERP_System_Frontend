import { useState, useEffect, useCallback, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoneyBillWave,
  faPlus,
  faRefresh,
  faSearch,
  faEraser,
  faEye,
  faPen,
  faDownload,
  faClipboardList,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";

import * as XLSX from "xlsx";

import { usePayroll } from "../hooks/usePayroll";

import {
  Button,
  Toast,
  StatusBadge,
} from "../../../shared/components";

import GeneratePayrollModal from "../components/GeneratePayrollModal";
import PayrollDetailsModal from "../components/PayrollDetailsModal";
import EditPayrollModal from "../components/EditPayrollModal";
import PayrollStatsCards from "../components/PayrollStatsCards";

const DEPARTMENTS = [
  { value: "", label: "All Departments" },
  { value: "hr", label: "Human Resources" },
  { value: "inventory", label: "Inventory" },
  { value: "sales", label: "Sales" },
  { value: "engineering", label: "Engineering" },
  { value: "finance", label: "Finance" },
  { value: "marketing", label: "Marketing" },
];

const MONTHS = [
  { value: "", label: "All Months" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
];

function formatSalary(value) {
  if (value === null || value === undefined) return "\u2014";
  const number = Number(value);
  if (Number.isNaN(number)) return "\u2014";
  return `$${number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function capitalize(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function PayrollPage() {
  const {
    fetchAll,
    generate: generatePayroll,
    update: updatePayroll,
  } = usePayroll();

  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showGenerate, setShowGenerate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const exportMenuRef = useRef(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);

  const hasActiveFilters = Boolean(
    search || department || month || year || statusFilter
  );

  const dismissToast = useCallback(() => setToast(null), []);

  const clearFilters = () => {
    setSearch("");
    setDepartment("");
    setMonth("");
    setYear("");
    setStatusFilter("");
  };

  const handleView = (record) => {
    setSelectedRecord(record);
    setShowDetail(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setShowEdit(true);
  };

  const filterRef = useRef({
    debouncedSearch,
    department,
    month,
    year,
    statusFilter,
  });

  filterRef.current = {
    debouncedSearch,
    department,
    month,
    year,
    statusFilter,
  };

  const doFetch = useCallback(async () => {
    const f = filterRef.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAll({
        page: 1,
        page_size: 100,
        search: f.debouncedSearch || undefined,
        department: f.department || undefined,
        month: f.month ? Number(f.month) : undefined,
        year: f.year ? Number(f.year) : undefined,
        status: f.statusFilter || undefined,
      });
      setRecords(result.items || []);
      setTotal(result.total || 0);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to load payroll records."
      );
    } finally {
      setLoading(false);
    }
  }, [fetchAll]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    doFetch();
  }, [debouncedSearch, department, month, year, statusFilter, doFetch]);

  useEffect(() => {
    if (!showExportMenu) return;
    const handleClick = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showExportMenu]);

  const handleSaveEdit = async (id, data) => {
    setSaving(true);
    try {
      await updatePayroll(id, data);
      setShowEdit(false);
      setEditingRecord(null);
      setToast({ type: "success", message: "Payroll updated successfully." });
      doFetch();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({
        type: "error",
        message:
          typeof detail === "string" ? detail : "Failed to update payroll.",
      });
    } finally {
      setSaving(false);
    }
  };

  const triggerExport = useCallback(
    async (format) => {
      setExporting(true);
      try {
        const rows = records.map((rec) => ({
          "Employee Name": rec.employee_name ?? "",
          Department: capitalize(rec.department),
          Month: capitalize(rec.month),
          Year: rec.year ?? "",
          "Basic Salary": rec.basic_salary ?? 0,
          Bonus: rec.bonus ?? 0,
          Allowance: rec.allowance ?? 0,
          Deduction: rec.deductions ?? 0,
          "Net Salary": rec.net_salary ?? 0,
          Status: capitalize(rec.status),
        }));

        if (format === "csv") {
          const headers = Object.keys(rows[0] || {});
          const csv = [
            headers.join(","),
            ...rows.map((row) => headers.map((h) => row[h]).join(",")),
          ].join("\n");
          const blob = new Blob(["\ufeff" + csv], {
            type: "text/csv;charset=utf-8;",
          });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "payroll.csv";
          link.click();
          URL.revokeObjectURL(url);
        } else {
          const worksheet = XLSX.utils.json_to_sheet(rows);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll");
          XLSX.writeFile(workbook, "payroll.xlsx");
        }

        setShowExportMenu(false);
        setToast({
          type: "success",
          message: "Payroll exported successfully.",
        });
      } catch {
        setToast({ type: "error", message: "Export failed." });
      } finally {
        setExporting(false);
      }
    },
    [records]
  );

  const handleGenerate = async ({ month, year, employeeId }) => {
    setGenerating(true);
    try {
      const payload = employeeId
        ? {
            employee_id: Number(employeeId),
            month: Number(month),
            year: Number(year),
          }
        : { month: Number(month), year: Number(year) };
      await generatePayroll(payload);
      setShowGenerate(false);
      setToast({
        type: "success",
        message: "Payroll generated successfully.",
      });
      doFetch();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({
        type: "error",
        message:
          typeof detail === "string" ? detail : "Failed to generate payroll.",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <FontAwesomeIcon
              icon={faMoneyBillWave}
              className="text-blue-500 w-5 h-5"
            />
            Payroll
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage employee payroll records and salary processing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowGenerate(true)}>
            <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
            Generate Payroll
          </Button>
          <Button onClick={doFetch}>
            <FontAwesomeIcon icon={faRefresh} className="w-3.5 h-3.5" />
            Refresh
          </Button>
          <div className="relative" ref={exportMenuRef}>
            <Button onClick={() => setShowExportMenu((v) => !v)}>
              <FontAwesomeIcon icon={faDownload} className="w-3.5 h-3.5" />
              Export
            </Button>
            {showExportMenu && (
              <div className="absolute right-0 mt-1 w-44 z-20 bg-white rounded-xl border border-slate-200 shadow-lg py-1">
                <button
                  onClick={() => triggerExport("xlsx")}
                  className="w-full text-left px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Excel (.xlsx)
                </button>
                <button
                  onClick={() => triggerExport("csv")}
                  className="w-full text-left px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  CSV (.csv)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Toast toast={toast} onDismiss={dismissToast} />

      <PayrollStatsCards records={records} />

      {/* Filters */}
      <div
        className="flex flex-wrap items-center gap-3"
        role="search"
        aria-label="Filter payroll records"
      >
        <div className="relative">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees..."
            className="w-56 pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600"
          />
        </div>

        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer text-slate-600"
        >
          {DEPARTMENTS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>

        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer text-slate-600"
        >
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer text-slate-600"
        >
          <option value="">All Years</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
          <option value="2027">2027</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer text-slate-600"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <Button onClick={clearFilters}>
            <FontAwesomeIcon icon={faEraser} className="w-3.5 h-3.5" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
          <FontAwesomeIcon icon={faClipboardList} className="text-slate-400 w-4 h-4" />
          <p className="text-sm font-semibold text-slate-800">Payroll Records</p>
          {!loading && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
              {total}
            </span>
          )}
        </div>

        {loading && (
          <div className="p-10 text-center">
            <FontAwesomeIcon
              icon={faRefresh}
              spin
              className="text-2xl text-blue-600"
            />
            <p className="mt-3 text-slate-500">Loading payroll records...</p>
          </div>
        )}

        {!loading && error && (
          <div className="p-10 text-center">
            <FontAwesomeIcon
              icon={faExclamationCircle}
              className="text-4xl text-red-500"
            />
            <p className="mt-3 text-red-600">{error}</p>
            <Button className="mt-4" onClick={doFetch}>
              Retry
            </Button>
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-400">
                  <th className="px-4 py-3 text-left">Employee</th>
                  <th className="px-4 py-3 text-left">Department</th>
                  <th className="px-4 py-3 text-left">Month</th>
                  <th className="px-4 py-3 text-right">Year</th>
                  <th className="px-4 py-3 text-right">Basic Salary</th>
                  <th className="px-4 py-3 text-right">Bonus</th>
                  <th className="px-4 py-3 text-right">Allowance</th>
                  <th className="px-4 py-3 text-right">Deduction</th>
                  <th className="px-4 py-3 text-right">Net Salary</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-16">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                          <FontAwesomeIcon icon={faClipboardList} className="text-slate-300 w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-slate-700">
                          No payroll records found
                        </h3>
                        <p className="text-sm text-slate-400 text-center">
                          There are no payroll records matching your current filters.
                        </p>
                        <p className="text-sm text-slate-400 text-center">
                          Try adjusting or clearing them.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {record.employee_name}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {capitalize(record.department)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {capitalize(record.month)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {record.year}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {formatSalary(record.basic_salary)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {formatSalary(record.bonus)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {formatSalary(record.allowance)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {formatSalary(record.deductions)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        {formatSalary(record.net_salary)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleView(record)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            aria-label="View details"
                          >
                            <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleEdit(record)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            aria-label="Edit record"
                          >
                            <FontAwesomeIcon icon={faPen} className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <GeneratePayrollModal
        isOpen={showGenerate}
        onClose={() => setShowGenerate(false)}
        onGenerate={handleGenerate}
        generating={generating}
      />

      <PayrollDetailsModal
        isOpen={showDetail}
        onClose={() => {
          setShowDetail(false);
          setSelectedRecord(null);
        }}
        record={selectedRecord}
      />

      <EditPayrollModal
        key={editingRecord?.id}
        isOpen={showEdit}
        onClose={() => {
          setShowEdit(false);
          setEditingRecord(null);
        }}
        record={editingRecord}
        onSave={handleSaveEdit}
        saving={saving}
      />
    </div>
  );
}

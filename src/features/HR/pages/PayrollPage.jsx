import { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
  faMoneyBillWave,
  faPlus,
  faRefresh,
  faSearch,
  faBuilding,
  faCalendar,
  faFlag,
  faEraser,
  faEye,
  faPen,
  faDownload,
  faClipboardList,
  faExclamationCircle,
  faArrowRotateRight,
} from '@fortawesome/free-solid-svg-icons';

import { usePayroll } from '../hooks/usePayroll';

import {
  StatusBadge,
  Button,
  Toast,
} from '../../../shared/components';

import GeneratePayrollModal from '../components/GeneratePayrollModal';
import PayrollDetailsModal from '../components/PayrollDetailsModal';
import EditPayrollModal from '../components/EditPayrollModal';
import PayrollStatsCards from '../components/PayrollStatsCards';

import * as XLSX from 'xlsx';


const DEPARTMENTS = [
  { value: '', label: 'All Departments' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'sales', label: 'Sales' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'finance', label: 'Finance' },
  { value: 'marketing', label: 'Marketing' },
];


const MONTHS = [
  { value: '', label: 'All Months' },
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];


function formatSalary(value) {

  if (value === null || value === undefined)
    return '—';

  const number =
    typeof value === 'string'
      ? parseFloat(value)
      : value;


  return '$' + number.toLocaleString(
    'en-US',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
}


function capitalize(value) {

  if (!value)
    return '';

  return (
    value.charAt(0).toUpperCase()
    +
    value.slice(1)
  );
}


export default function PayrollPage() {


  const {
    fetchAll,
    generate: generatePayroll,
    update: updatePayroll,
  } = usePayroll();



  const [records,setRecords] = useState([]);

  const [total,setTotal] = useState(0);

  const [loading,setLoading] = useState(true);

  const [error,setError] = useState(null);



  const [showGenerate,setShowGenerate] = useState(false);

  const [generating,setGenerating] = useState(false);



  const [showDetail,setShowDetail] = useState(false);

  const [selectedRecord,setSelectedRecord] = useState(null);



  const [showEdit,setShowEdit] = useState(false);

  const [editingRecord,setEditingRecord] = useState(null);

  const [saving,setSaving] = useState(false);



  const [toast,setToast] = useState(null);



  const [search,setSearch] = useState('');

  const [debouncedSearch,setDebouncedSearch] = useState('');

  const [department,setDepartment] = useState('');

  const [month,setMonth] = useState('');

  const [year,setYear] = useState('');

  const [statusFilter,setStatusFilter] = useState('');



  const exportMenuRef = useRef(null);

  const [showExportMenu,setShowExportMenu] = useState(false);

  const [exporting,setExporting] = useState(false);



  const dismissToast = useCallback(
    () => setToast(null),
    []
  );



  const filterRef = useRef({
    debouncedSearch,
    department,
    month,
    year,
    statusFilter
  });



  filterRef.current = {
    debouncedSearch,
    department,
    month,
    year,
    statusFilter
  };



  const doFetch = useCallback(async()=>{

    const f = filterRef.current;


    setLoading(true);

    setError(null);


    try {


      const result = await fetchAll({

        page:1,

        page_size:100,

        search:
          f.debouncedSearch || undefined,


        department:
          f.department || undefined,


        month:
          f.month
          ? Number(f.month)
          : undefined,


        year:
          f.year
          ? Number(f.year)
          : undefined,


        status:
          f.statusFilter || undefined,

      });


      setRecords(result.items || []);

      setTotal(result.total || 0);


    }catch(err){

      setError(
        err.response?.data?.detail
        ||
        'Failed to load payroll records.'
      );

    }
    finally{

      setLoading(false);

    }


  },[fetchAll]);



  useEffect(()=>{

    const timer =
      setTimeout(
        ()=>setDebouncedSearch(search),
        350
      );


    return ()=>clearTimeout(timer);


  },[search]);



  useEffect(()=>{

    doFetch();

  },
  [
    debouncedSearch,
    department,
    month,
    year,
    statusFilter,
    doFetch
  ]);










  const handleEdit=(record)=>{

    setEditingRecord(record);

    setShowEdit(true);

  };  // =====================
  // Filters
  // =====================




  // =====================
  // View / Edit
  // =====================







  const handleSaveEdit = async (id, data) => {

    setSaving(true);


    try {

      await updatePayroll(id, data);


      setShowEdit(false);

      setEditingRecord(null);


      setToast({
        type: 'success',
        message: 'Payroll updated successfully.',
      });


      doFetch();


    } catch (err) {

      const detail =
        err.response?.data?.detail;


      setToast({
        type: 'error',
        message:
          typeof detail === 'string'
            ? detail
            : 'Failed to update payroll.',
      });


    } finally {

      setSaving(false);

    }

  };




  // =====================
  // Export
  // =====================

  const triggerExport = useCallback(async (format) => {

    setExporting(true);


    try {


      const rows = records.map((rec) => ({

        'Employee Name':
          rec.employee_name ?? '',

        'Department':
          capitalize(rec.department),

        'Month':
          capitalize(rec.month),

        'Year':
          rec.year ?? '',

        'Basic Salary':
          rec.basic_salary ?? 0,

        'Bonus':
          rec.bonus ?? 0,

        'Allowance':
          rec.allowance ?? 0,

        'Deduction':
          rec.deduction ?? 0,

        'Net Salary':
          rec.net_salary ?? 0,

        'Status':
          capitalize(rec.status),

      }));



      if (format === 'csv') {


        const headers =
          Object.keys(rows[0] || {});


        const csv = [

          headers.join(','),

          ...rows.map(row =>
            headers
              .map(h => row[h])
              .join(',')
          ),

        ].join('\n');



        const blob =
          new Blob(
            ['\ufeff' + csv],
            {
              type:
              'text/csv;charset=utf-8;',
            }
          );


        const url =
          URL.createObjectURL(blob);


        const link =
          document.createElement('a');


        link.href = url;

        link.download =
          'payroll.csv';


        link.click();


        URL.revokeObjectURL(url);



      } else {


        const worksheet =
          XLSX.utils.json_to_sheet(rows);


        const workbook =
          XLSX.utils.book_new();


        XLSX.utils.book_append_sheet(
          workbook,
          worksheet,
          'Payroll'
        );


        XLSX.writeFile(
          workbook,
          'payroll.xlsx'
        );

      }



      setShowExportMenu(false);


      setToast({
        type:'success',
        message:'Payroll exported successfully.',
      });



    } catch {

      setToast({
        type:'error',
        message:'Export failed.',
      });


    } finally {

      setExporting(false);

    }


  }, [records]);






  // =====================
  // Generate Payroll
  // =====================


  const handleGenerate = async ({
    month,
    year,
    employeeId
  }) => {


    setGenerating(true);


    try {


      const payload =
        employeeId
        ?
        {
          employee_id:Number(employeeId),
          month:Number(month),
          year:Number(year),
        }
        :
        {
          month:Number(month),
          year:Number(year),
        };



      await generatePayroll(payload);



      setShowGenerate(false);


      setToast({
        type:'success',
        message:
        'Payroll generated successfully.',
      });



      doFetch();



    } catch(err){


      const detail =
        err.response?.data?.detail;


      setToast({
        type:'error',
        message:
        typeof detail === 'string'
        ?
        detail
        :
        'Failed to generate payroll.',
      });


    } finally {

      setGenerating(false);

    }

  };





  // =====================
  // UI
  // =====================


  return (

    <div className="space-y-6">


      {toast && (

        <div className="flex justify-center">

          <Toast
            toast={toast}
            onDismiss={dismissToast}
          />

        </div>

      )}



      {/* Header */}

      <div className="
        flex flex-col sm:flex-row
        sm:items-center
        sm:justify-between
        gap-3
      ">


        <div>


          <h1 className="
            text-xl font-bold
            text-slate-900
            flex items-center gap-2
          ">

            <FontAwesomeIcon
              icon={faMoneyBillWave}
              className="text-blue-500"
            />

            Payroll

          </h1>



          <p className="
            text-sm text-slate-400 mt-1
          ">

            Manage employee payroll
            records and salary processing.

          </p>


        </div>



        <div className="flex gap-2">


          <Button
            onClick={() =>
              setShowGenerate(true)
            }
          >

            <FontAwesomeIcon icon={faPlus}/>

            Generate Payroll

          </Button>



          <Button
            onClick={doFetch}
          >

            <FontAwesomeIcon icon={faRefresh}/>

            Refresh

          </Button>



          <div
            className="relative"
            ref={exportMenuRef}
          >


            <Button
              loading={exporting}
              onClick={() =>
                setShowExportMenu(
                  !showExportMenu
                )
              }
            >

              <FontAwesomeIcon icon={faDownload}/>

              Export

            </Button>



            {showExportMenu && (

              <div className="
                absolute right-0 mt-2
                bg-white border
                rounded-xl shadow-lg
                w-40 z-20
              ">


                <button
                  onClick={() =>
                    triggerExport('xlsx')
                  }
                  className="
                    block w-full
                    px-3 py-2
                    text-left
                    text-sm
                    hover:bg-slate-50
                  "
                >
                  Excel
                </button>



                <button
                  onClick={() =>
                    triggerExport('csv')
                  }
                  className="
                    block w-full
                    px-3 py-2
                    text-left
                    text-sm
                    hover:bg-slate-50
                  "
                >
                  CSV
                </button>


              </div>

            )}


          </div>


        </div>


      </div>



      <PayrollStatsCards records={records}/>
      {/* Filters */}

      <div className="
        flex flex-wrap
        items-center gap-3
      ">


        <div className="relative">

          <FontAwesomeIcon
            icon={faSearch}
            className="
              absolute left-3 top-1/2
              -translate-y-1/2
              text-slate-400
              w-3.5 h-3.5
            "
          />


          <input
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            placeholder="Search employee..."
            className="
              pl-9 pr-3 py-2
              rounded-lg
              border border-slate-200
              text-sm
              w-56
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500/20
            "
          />

        </div>




        <select
          value={department}
          onChange={(e)=>setDepartment(e.target.value)}
          className="
            px-3 py-2 rounded-lg
            border border-slate-200
            text-sm
          "
        >

          {DEPARTMENTS.map(d=>(
            <option
              key={d.value}
              value={d.value}
            >
              {d.label}
            </option>
          ))}

        </select>




        <select
          value={month}
          onChange={(e)=>setMonth(e.target.value)}
          className="
            px-3 py-2 rounded-lg
            border border-slate-200
            text-sm
          "
        >

          {MONTHS.map(m=>(
            <option
              key={m.value}
              value={m.value}
            >
              {m.label}
            </option>
          ))}

        </select>




        <select
          value={year}
          onChange={(e)=>setYear(e.target.value)}
          className="
            px-3 py-2 rounded-lg
            border border-slate-200
            text-sm
          "
        >

          <option value="">All Years</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
          <option value="2027">2027</option>

        </select>




        <select
          value={statusFilter}
          onChange={(e)=>setStatusFilter(e.target.value)}
          className="
            px-3 py-2 rounded-lg
            border border-slate-200
            text-sm
          "
        >

          {STATUS_OPTIONS.map(s=>(
            <option
              key={s.value}
              value={s.value}
            >
              {s.label}
            </option>
          ))}

        </select>




        {hasActiveFilters && (

          <Button onClick={clearFilters}>

            <FontAwesomeIcon icon={faEraser}/>

            Clear

          </Button>

        )}



      </div>





      {/* Table */}

      <div className="
        bg-white
        rounded-2xl
        border border-slate-200
        shadow-sm
        overflow-hidden
      ">


        <div className="
          px-6 py-4
          border-b
          flex items-center gap-2
        ">

          <FontAwesomeIcon
            icon={faClipboardList}
            className="text-slate-400"
          />


          <span className="font-semibold">

            Payroll Records ({total})

          </span>


        </div>





        {loading && (

          <div className="p-8 text-center">

            Loading payroll...

          </div>

        )}




        {!loading && error && (

          <div className="
            p-8 text-center
          ">

            <FontAwesomeIcon
              icon={faExclamationCircle}
              className="
                text-red-500
                text-3xl
              "
            />


            <p className="mt-3">

              {error}

            </p>



            <Button
              onClick={doFetch}
              className="mt-4"
            >

              Retry

            </Button>


          </div>

        )}





        {!loading && !error && (

          <div className="overflow-x-auto">


            <table className="w-full">


              <thead>

                <tr className="
                  border-b
                  text-xs
                  text-slate-400
                  uppercase
                ">


                  <th className="px-4 py-3 text-left">
                    Employee
                  </th>


                  <th className="px-4 py-3">
                    Department
                  </th>


                  <th className="px-4 py-3">
                    Month
                  </th>


                  <th className="px-4 py-3">
                    Salary
                  </th>


                  <th className="px-4 py-3">
                    Status
                  </th>


                  <th className="px-4 py-3">
                    Actions
                  </th>


                </tr>

              </thead>





              <tbody>


              {records.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="
                      text-center
                      py-10
                      text-slate-400
                    "
                  >

                    No payroll records found

                  </td>

                </tr>


              ) : (


                records.map(record=>(


                  <tr
                    key={record.id}
                    className="
                      border-b
                      hover:bg-slate-50
                    "
                  >


                    <td className="
                      px-4 py-3
                      font-medium
                    ">

                      {record.employee_name}

                    </td>



                    <td className="
                      px-4 py-3
                      capitalize
                    ">

                      {record.department}

                    </td>



                    <td className="
                      px-4 py-3
                    ">

                      {capitalize(record.month)}

                    </td>



                    <td className="
                      px-4 py-3
                    ">

                      {formatSalary(record.net_salary)}

                    </td>



                    <td className="px-4 py-3">

                      <StatusBadge
                        status={record.status}
                      />

                    </td>




                    <td className="px-4 py-3">


                      <div className="
                        flex gap-2
                      ">


                        <button
                          onClick={() =>
                            handleView(record)
                          }
                          className="
                            text-slate-400
                            hover:text-blue-600
                          "
                        >

                          <FontAwesomeIcon icon={faEye}/>

                        </button>




                        <button
                          onClick={() =>
                            handleEdit(record)
                          }
                          className="
                            text-slate-400
                            hover:text-blue-600
                          "
                        >

                          <FontAwesomeIcon icon={faPen}/>

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





      <GeneratePayrollModal

        isOpen={showGenerate}

        onClose={() =>
          setShowGenerate(false)
        }

        onGenerate={handleGenerate}

        generating={generating}

      />





      <PayrollDetailsModal

        isOpen={showDetail}

        onClose={()=>{
          setShowDetail(false);
          setSelectedRecord(null);
        }}

        record={selectedRecord}

      />






      <EditPayrollModal

        key={editingRecord?.id}

        isOpen={showEdit}

        onClose={()=>{
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

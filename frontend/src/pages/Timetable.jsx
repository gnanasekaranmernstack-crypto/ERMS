import React, { useState, useEffect } from 'react';
import API from '../api';
import CalendarView from '../components/CalendarView';
import { HiOutlineDownload, HiOutlinePrinter } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Timetable = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllExams = async () => {
      try {
        // Fetching all exams (we can add a limit or fetch multiple pages if needed, 
        // but for a timetable we usually want all upcoming/recent ones)
        const { data } = await API.get('/exams?pageSize=100'); 
        setExams(data.exams);
      } catch (error) {
        toast.error('Failed to fetch exams for timetable');
      } finally {
        setLoading(false);
      }
    };
    fetchAllExams();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Exam Time Table</h1>
          <p className="text-text-secondary mt-1">Consolidated view of all Semester and Arrear exams.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium text-text-primary shadow-sm"
          >
            <HiOutlinePrinter className="text-xl" />
            <span>Print</span>
          </button>
          <button className="btn-primary flex items-center gap-2">
            <HiOutlineDownload className="text-xl" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      <div className="animate-fade-in">
        <CalendarView exams={exams} title="Comprehensive Exam Schedule" />
      </div>

      <div className="card bg-indigo-50 border-indigo-100">
        <h4 className="font-bold text-indigo-900 mb-2">Instructions</h4>
        <ul className="text-sm text-indigo-800 space-y-1 list-disc pl-5">
          <li>Theory exams are conducted in the specified sessions (F.N: 9AM-12PM, A.N: 2PM-5PM).</li>
          <li>Laboratory exams schedule may vary by department; please check with your coordinator.</li>
          <li>Carry your Hall Ticket and ID card for all exams.</li>
        </ul>
      </div>
    </div>
  );
};

export default Timetable;

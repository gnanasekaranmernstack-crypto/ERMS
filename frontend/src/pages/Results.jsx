import React, { useState, useEffect } from 'react';
import API from '../api';
import DataTable from '../components/tables/DataTable';
import Modal from '../components/modals/Modal';
import { 
  HiOutlinePlus, 
  HiOutlinePencil, 
  HiOutlineTrash, 
  HiOutlineSearch,
  HiOutlineClock,
  HiOutlineCheckCircle
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Results = ({ type }) => {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [pendingExams, setPendingExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, pageSize: 10 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');

  const availableSemesters = user?.entryType === 'Direct Second Year' 
    ? [3, 4, 5, 6, 7, 8] 
    : [1, 2, 3, 4, 5, 6, 7, 8];

  const [formData, setFormData] = useState({
    studentName: user?.name || '',
    registerNumber: user?.registerNumber || '',
    department: user?.department || '',
    semester: availableSemesters[0].toString(),
    subjectName: '',
    subjectCode: '',
    marks: '',
    grade: '',
    resultStatus: 'Pass',
    category: type || 'Semester',
  });

  useEffect(() => {
    if (user && !editingResult) {
      setFormData(prev => ({ 
        ...prev, 
        department: user.department || '',
        registerNumber: user.registerNumber || '',
        studentName: user.name || '',
        semester: availableSemesters[0].toString(),
        category: type || 'Semester'
      }));
    }
  }, [user, editingResult, type]);

  const fetchResultsData = async (page = 1, pageSize = pagination.pageSize) => {
    setLoading(true);
    try {
      // Fetch actual results
      const { data } = await API.get(`/results?pageNumber=${page}&pageSize=${pageSize}&keyword=${searchTerm}&department=${filterDept}&category=${type || 'Semester'}`);
      setResults(data.results);
      setPagination({ page: data.page, pages: data.pages, pageSize: pageSize });

      // Fetch completed exams to check for "Waiting Results"
      const { data: examsData } = await API.get(`/exams?pageSize=100&category=${type || 'Semester'}`);
      const completedExams = examsData.exams.filter(exam => exam.status === 'Completed');
      
      // Filter out exams that already have results
      const waiting = completedExams.filter(exam => {
        return !data.results.some(result => 
          result.subjectCode === exam.subjectCode && 
          result.semester === exam.semester
        );
      });
      
      setPendingExams(waiting);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchResultsData();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, filterDept, type]);

  const handleOpenModal = (item = null, isExam = false) => {
    if (isExam) {
      // Auto-fill from completed exam
      setEditingResult(null);
      setFormData({
        studentName: user?.name || '',
        registerNumber: user?.registerNumber || '',
        department: user?.department || '',
        semester: item.semester,
        subjectName: item.subjectName,
        subjectCode: item.subjectCode,
        marks: '',
        grade: '',
        resultStatus: 'Pass',
        category: type || 'Semester',
      });
    } else if (item) {
      setEditingResult(item);
      setFormData(item);
    } else {
      setEditingResult(null);
      setFormData({
        studentName: user?.name || '',
        registerNumber: user?.registerNumber || '',
        department: user?.department || '',
        semester: availableSemesters[0].toString(),
        subjectName: '',
        subjectCode: '',
        marks: '',
        grade: '',
        resultStatus: 'Pass',
        category: type || 'Semester',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingResult) {
        await API.put(`/results/${editingResult._id}`, formData);
        toast.success('Result updated successfully');
      } else {
        await API.post('/results', formData);
        toast.success('Result added successfully');
      }
      setIsModalOpen(false);
      fetchResultsData(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this result?')) {
      try {
        await API.delete(`/results/${id}`);
        toast.success('Result deleted');
        fetchResultsData(pagination.page);
      } catch (error) {
        toast.error('Failed to delete result');
      }
    }
  };

  const calculateCGPA = (res) => {
    if (!res || res.length === 0) return 0;
    const gradePoints = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'RA': 0 };
    const gradedResults = res.filter(r => r.grade && r.grade !== '');
    if (gradedResults.length === 0) return 0;
    const totalPoints = gradedResults.reduce((acc, curr) => acc + (gradePoints[curr.grade] || 0), 0);
    return (totalPoints / gradedResults.length).toFixed(2);
  };

  const stats = {
    total: results.length,
    passed: results.filter(r => r.resultStatus === 'Pass').length,
    failed: results.filter(r => r.resultStatus === 'Fail').length,
    cgpa: calculateCGPA(results)
  };

  const columns = [
    { header: 'Subject Info', render: (row) => (
      <div>
        <p className="font-bold">{row.subjectName}</p>
        <p className="text-xs text-text-secondary">{row.subjectCode}</p>
      </div>
    )},
    { header: 'Semester', accessor: 'semester', render: (row) => (
      <span className="font-bold text-primary">Sem {row.semester}</span>
    )},
    { header: 'Marks', render: (row) => (
      <div className="flex items-center gap-2">
        <span className="font-bold text-lg">{row.marks ?? '-'}</span>
        {row.grade && (
          <span className={`text-xs px-2 py-0.5 rounded font-bold ${
            row.resultStatus === 'Pass' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
          }`}>
            {row.grade}
          </span>
        )}
      </div>
    )},
    { header: 'Status', render: (row) => (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
        row.resultStatus === 'Pass' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
      }`}>
        {row.resultStatus}
      </span>
    )},
    { header: 'Actions', render: (row) => (
      <div className="flex gap-2">
        <button onClick={() => handleOpenModal(row)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
          <HiOutlinePencil />
        </button>
        <button onClick={() => handleDelete(row._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
          <HiOutlineTrash />
        </button>
      </div>
    )},
  ];

  const title = type ? `${type} Results` : 'All Results';

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">{title}</h1>
          <p className="text-text-secondary text-sm mt-1">Manage and track your academic performance.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus />
          <span>Add Manual Result</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card py-6 flex flex-col items-center justify-center border-b-4 border-b-primary shadow-lg">
          <p className="text-[10px] text-text-secondary uppercase font-black tracking-widest mb-1">Total Subjects</p>
          <h4 className="text-3xl font-black text-text-primary">{stats.total}</h4>
        </div>
        <div className="card py-6 flex flex-col items-center justify-center border-b-4 border-b-emerald-500 shadow-lg">
          <p className="text-[10px] text-text-secondary uppercase font-black tracking-widest mb-1">Passed</p>
          <h4 className="text-3xl font-black text-emerald-600">{stats.passed}</h4>
        </div>
        <div className="card py-6 flex flex-col items-center justify-center border-b-4 border-b-red-500 shadow-lg">
          <p className="text-[10px] text-text-secondary uppercase font-black tracking-widest mb-1">Failed</p>
          <h4 className="text-3xl font-black text-red-600">{stats.failed}</h4>
        </div>
        <div className="card py-6 flex flex-col items-center justify-center border-b-4 border-b-violet-500 shadow-lg">
          <p className="text-[10px] text-text-secondary uppercase font-black tracking-widest mb-1">Current GPA</p>
          <h4 className="text-3xl font-black text-violet-600">{stats.cgpa}</h4>
        </div>
      </div>

      {/* Waiting Results Section */}
      {pendingExams.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <HiOutlineClock className="text-amber-500 text-xl" />
            <h3 className="text-lg font-bold text-text-primary">Waiting Results ({pendingExams.length})</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingExams.map(exam => (
              <div key={exam._id} className="card border-l-4 border-l-amber-400 bg-amber-50/30 flex items-center justify-between p-4 group hover:shadow-md transition-all">
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-text-primary truncate">{exam.subjectName}</p>
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">{exam.subjectCode} • Sem {exam.semester}</p>
                </div>
                <button 
                  onClick={() => handleOpenModal(exam, true)}
                  className="flex items-center gap-1 text-xs font-bold bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600 transition-colors shadow-sm"
                >
                  <HiOutlinePlus />
                  <span>Enter</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card flex flex-wrap gap-4 bg-gray-50/50">
        <div className="relative flex-1 min-w-[200px]">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xl" />
          <input
            type="text"
            placeholder="Search by subject code or name..."
            className="input-field pl-10 border-transparent bg-white shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="input-field w-auto min-w-[150px] border-transparent bg-white shadow-sm font-bold"
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
        >
          <option value="">All Departments</option>
          <option value="CS">CS</option>
          <option value="IT">IT</option>
          <option value="ECE">ECE</option>
          <option value="MECH">MECH</option>
        </select>
      </div>

      <DataTable 
        columns={columns} 
        data={results} 
        loading={loading}
        pagination={pagination}
        onPageChange={(page, pageSize) => fetchResultsData(page, pageSize)}
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingResult ? 'Edit Result' : 'Enter Exam Result'}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 flex items-center gap-2 p-3 bg-indigo-50 rounded-xl border border-indigo-100 mb-2">
            <HiOutlineCheckCircle className="text-primary text-xl" />
            <div>
              <p className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest">Entry Verification</p>
              <p className="text-xs text-indigo-700 font-medium">{user?.name} ({user?.registerNumber}) • {user?.department}</p>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Subject Name *</label>
            <input
              type="text"
              required
              className="input-field"
              value={formData.subjectName}
              onChange={(e) => setFormData({...formData, subjectName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subject Code *</label>
            <input
              type="text"
              required
              className="input-field"
              value={formData.subjectCode}
              onChange={(e) => setFormData({...formData, subjectCode: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Semester *</label>
            <select
              required
              className="input-field"
              value={formData.semester}
              onChange={(e) => setFormData({...formData, semester: e.target.value})}
            >
              {availableSemesters.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <label className="block text-sm font-bold mb-1">Marks</label>
              <input
                type="number"
                className="input-field bg-white"
                value={formData.marks}
                onChange={(e) => setFormData({...formData, marks: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Grade</label>
              <select
                className="input-field bg-white"
                value={formData.grade}
                onChange={(e) => setFormData({...formData, grade: e.target.value})}
              >
                <option value="">Select</option>
                {['O', 'A+', 'A', 'B+', 'B', 'C', 'RA'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Final Status</label>
              <select
                required
                className="input-field bg-white"
                value={formData.resultStatus}
                onChange={(e) => setFormData({...formData, resultStatus: e.target.value})}
              >
                <option value="Pass">Pass</option>
                <option value="Fail">Fail</option>
              </select>
            </div>
          </div>
          
          <div className="md:col-span-2 pt-4 flex gap-3">
            <button type="submit" className="flex-1 btn-primary py-3">
              {editingResult ? 'Update Result' : 'Post Result'}
            </button>
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold text-text-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Results;

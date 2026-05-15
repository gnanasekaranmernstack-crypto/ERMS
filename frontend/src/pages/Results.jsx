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
  HiOutlineCheckCircle,
  HiOutlineAcademicCap,
  HiOutlineEmojiHappy
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Results = ({ type }) => {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [pendingExams, setPendingExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, pageSize: 10 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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
    fetchSubjects();
  }, [user, editingResult, type]);

  const fetchSubjects = async () => {
    try {
      const { data } = await API.get('/subjects');
      setSubjects(data);
    } catch (error) {
      console.error('Failed to fetch subjects');
    }
  };

  const fetchResultsData = async (page = 1, pageSize = pagination.pageSize) => {
    setLoading(true);
    try {
      const { data } = await API.get(`/results?pageNumber=${page}&pageSize=${pageSize}&keyword=${searchTerm}&department=${user?.department || ''}`);
      
      const allResults = data.results;
      let displayResults = [];

      if (type === 'Arrear') {
        // ARREAR VIEW: ONLY show results for exams taken in the Arrear category
        displayResults = allResults.filter(r => r.category === 'Arrear');
      } else {
        // SEMESTER VIEW: Show latest result for every subject
        // If a subject was failed in Semester but passed in Arrear, show the Pass result here!
        const latestBySubject = {};
        allResults.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).forEach(r => {
          latestBySubject[r.subjectCode] = r;
        });
        displayResults = Object.values(latestBySubject);
      }

      setResults(displayResults);
      setPagination({ page: data.page, pages: data.pages, pageSize: pageSize });

      // Pending Exams logic - STRICT SEPARATION
      const { data: examsData } = await API.get(`/exams?pageSize=100&category=${type || 'Semester'}`);
      const completedExams = examsData.exams.filter(exam => exam.status === 'Completed');
      
      const waiting = completedExams.filter(exam => {
        // Check if this SPECIFIC exam instance has a result
        return !allResults.some(result => 
          result.subjectCode === exam.subjectCode && 
          result.semester === exam.semester &&
          result.category === exam.category
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
  }, [searchTerm, type, user?.department]);

  const handleSubjectSelect = (e) => {
    const selectedCode = e.target.value;
    const subject = subjects.find(s => s.subjectCode === selectedCode);
    if (subject) {
      setFormData({
        ...formData,
        subjectName: subject.subjectName,
        subjectCode: subject.subjectCode,
        semester: subject.semester.toString()
      });
    }
  };

  const handleOpenModal = (item = null, isExam = false) => {
    if (isExam) {
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
        category: item.category || 'Semester',
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
        toast.success('Result updated');
      } else {
        await API.post('/results', formData);
        if (formData.resultStatus === 'Pass') {
          toast.success('CONGRATULATIONS! Subject Passed!', {
            icon: '🎉',
            duration: 4000
          });
        }
      }
      setIsModalOpen(false);
      fetchResultsData(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this record?')) {
      try {
        await API.delete(`/results/${id}`);
        toast.success('Record removed');
        fetchResultsData(pagination.page);
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const calculateCGPA = (res) => {
    const gradePoints = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'RA': 0 };
    const passedResults = res.filter(r => r.resultStatus === 'Pass' && r.grade);
    if (passedResults.length === 0) return 0;
    const totalPoints = passedResults.reduce((acc, curr) => acc + (gradePoints[curr.grade] || 0), 0);
    return (totalPoints / passedResults.length).toFixed(2);
  };

  const stats = {
    total: results.length,
    passed: results.filter(r => r.resultStatus === 'Pass').length,
    failed: results.filter(r => r.resultStatus === 'Fail').length,
    cgpa: calculateCGPA(results)
  };

  const filteredSubjects = subjects.filter(s => s.semester === Number(formData.semester));

  const columns = [
    { header: 'Subject Info', render: (row) => (
      <div className={
        row.resultStatus === 'Pass' ? 'pass-animation' : 
        row.resultStatus === 'Fail' ? 'arrear-animation' : ''
      }>
        <p className="font-bold">{row.subjectName}</p>
        <p className="text-xs text-text-secondary">{row.subjectCode}</p>
      </div>
    )},
    { header: 'Semester', accessor: 'semester', render: (row) => (
      <span className="font-bold text-primary">Sem {row.semester}</span>
    )},
    { header: 'Marks', render: (row) => (
      <div className="flex items-center gap-2">
        <span className={`font-bold text-lg ${row.resultStatus === 'Pass' ? 'text-emerald-600' : 'text-red-600'}`}>
          {row.marks ?? '-'}
        </span>
        {row.grade && (
          <span className={`text-xs px-2 py-0.5 rounded font-black ${
            row.resultStatus === 'Pass' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}>
            {row.grade}
          </span>
        )}
      </div>
    )},
    { header: 'Status', render: (row) => (
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
          row.resultStatus === 'Pass' ? 'bg-success-gradient text-white shadow-lg' : 'bg-red-100 text-red-600'
        }`}>
          {row.resultStatus}
        </span>
        {row.resultStatus === 'Pass' && <HiOutlineEmojiHappy className="text-emerald-500 animate-bounce" />}
      </div>
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

  const title = type ? `${type} Results` : 'Semester Results';

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">{title}</h1>
          <p className="text-text-secondary text-sm mt-1 font-medium">
            {type === 'Arrear' 
              ? 'Results for your Arrear exam attempts.' 
              : 'Your main Semester performance. Arrear passes are also reflected here.'}
          </p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2 py-3 px-6 rounded-xl shadow-lg shadow-primary/20">
          <HiOutlinePlus />
          <span>Add Manual Result</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card py-6 flex flex-col items-center justify-center border-b-4 border-b-primary shadow-lg bg-white">
          <p className="text-[10px] text-text-secondary uppercase font-black tracking-widest mb-1">Total Subjects</p>
          <h4 className="text-3xl font-black text-text-primary">{stats.total}</h4>
        </div>
        <div className="card py-6 flex flex-col items-center justify-center border-b-4 border-b-emerald-500 shadow-lg bg-white overflow-hidden relative group">
          <div className="absolute inset-0 bg-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p className="text-[10px] text-text-secondary uppercase font-black tracking-widest mb-1 relative">Passed</p>
          <h4 className="text-3xl font-black text-emerald-600 relative">{stats.passed}</h4>
        </div>
        <div className="card py-6 flex flex-col items-center justify-center border-b-4 border-b-red-500 shadow-lg bg-white">
          <p className="text-[10px] text-text-secondary uppercase font-black tracking-widest mb-1">Current Arrears</p>
          <h4 className="text-3xl font-black text-red-600">{stats.failed}</h4>
        </div>
        <div className="card py-6 flex flex-col items-center justify-center border-b-4 border-b-violet-500 shadow-lg bg-white">
          <p className="text-[10px] text-text-secondary uppercase font-black tracking-widest mb-1">Grade Average</p>
          <h4 className="text-3xl font-black text-violet-600">{stats.cgpa}</h4>
        </div>
      </div>

      {pendingExams.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <HiOutlineClock className="text-amber-500 text-xl animate-pulse" />
            <h3 className="text-lg font-bold text-text-primary">Waiting {type || 'Semester'} Results ({pendingExams.length})</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingExams.map(exam => (
              <div 
                key={exam._id} 
                className={`card border-l-4 flex items-center justify-between p-4 group hover:shadow-md transition-all ${
                  exam.examType === 'Theory' ? 'border-l-blue-400 bg-blue-50/10' : 'border-l-purple-400 bg-purple-50/10'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      exam.examType === 'Theory' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                    }`}>
                      {exam.examType}
                    </span>
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">{exam.subjectCode} • Sem {exam.semester}</p>
                  </div>
                  <p className="text-sm font-bold text-text-primary truncate">{exam.subjectName}</p>
                </div>
                <button 
                  onClick={() => handleOpenModal(exam, true)}
                  className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm text-white ${
                    exam.examType === 'Theory' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-purple-500 hover:bg-purple-600'
                  }`}
                >
                  <HiOutlinePlus />
                  <span>Enter</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
        <DataTable 
          columns={columns} 
          data={results} 
          loading={loading}
          pagination={pagination}
          onPageChange={(page, pageSize) => fetchResultsData(page, pageSize)}
        />
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingResult ? 'Edit Record' : `Enter ${type || 'Semester'} Result`}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 flex items-center gap-2 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 mb-2">
            <HiOutlineCheckCircle className="text-primary text-2xl" />
            <div>
              <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Digital Entry Verification</p>
              <p className="text-xs text-indigo-700 font-bold">{user?.name} • {user?.registerNumber} • {user?.department}</p>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-text-secondary mb-1">Semester Selection</label>
            <select
              required
              className="input-field font-bold bg-gray-50 border-none shadow-inner"
              value={formData.semester}
              onChange={(e) => setFormData({...formData, semester: e.target.value, subjectName: '', subjectCode: ''})}
            >
              {availableSemesters.map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-text-primary mb-1">Subject Selection *</label>
            <div className="relative">
              <HiOutlineAcademicCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                required
                className="input-field pl-10 border-none bg-gray-50 shadow-inner font-bold"
                value={formData.subjectCode}
                onChange={handleSubjectSelect}
              >
                <option value="">Choose a subject...</option>
                {filteredSubjects.map(s => (
                  <option key={s._id} value={s.subjectCode}>{s.subjectName} ({s.subjectCode})</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-white rounded-2xl border-2 border-gray-50 shadow-sm">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-text-secondary mb-1">Marks</label>
              <input
                type="number"
                className="input-field bg-gray-50 border-none text-lg font-black text-center"
                value={formData.marks}
                onChange={(e) => setFormData({...formData, marks: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-text-secondary mb-1">Grade</label>
              <select
                className="input-field bg-gray-50 border-none text-lg font-black text-center"
                value={formData.grade}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({...formData, grade: val, resultStatus: val === 'RA' ? 'Fail' : 'Pass'});
                }}
              >
                <option value="">-</option>
                {['O', 'A+', 'A', 'B+', 'B', 'C', 'RA'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-text-secondary mb-1">Final Status</label>
              <select
                required
                className="input-field bg-gray-50 border-none text-sm font-black text-center"
                value={formData.resultStatus}
                onChange={(e) => setFormData({...formData, resultStatus: e.target.value})}
              >
                <option value="Pass">PASSED</option>
                <option value="Fail">FAILED</option>
              </select>
            </div>
          </div>
          
          <div className="md:col-span-2 pt-4 flex gap-4">
            <button type="submit" className="flex-1 btn-primary py-4 rounded-2xl shadow-xl shadow-primary/30 text-lg">
              {editingResult ? 'Update Record' : 'Commit Result'}
            </button>
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-8 py-4 border-2 border-gray-100 rounded-2xl hover:bg-gray-50 transition-all font-black text-sm text-text-secondary"
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

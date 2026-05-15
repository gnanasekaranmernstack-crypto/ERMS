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
  HiOutlineAcademicCap,
  HiOutlineExclamationCircle
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Exams = ({ type }) => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [pendingSubjects, setPendingSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, pageSize: 10 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterSem, setFilterSem] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const availableSemesters = user?.entryType === 'Direct Second Year' 
    ? [3, 4, 5, 6, 7, 8] 
    : [1, 2, 3, 4, 5, 6, 7, 8];

  const [formData, setFormData] = useState({
    subjectName: '',
    subjectCode: '',
    department: user?.department || '',
    semester: availableSemesters[0].toString(),
    examDate: '',
    startTime: '09:00',
    endTime: '12:00',
    examType: 'Theory',
    session: 'F.N',
    category: type || 'Semester'
  });

  useEffect(() => {
    if (user && !editingExam) {
      setFormData(prev => ({ 
        ...prev, 
        department: user.department || '',
        semester: availableSemesters[0].toString(),
        category: type || 'Semester'
      }));
    }
    fetchSubjects();
  }, [user, editingExam, type]);

  const fetchSubjects = async () => {
    try {
      const { data } = await API.get('/subjects');
      setSubjects(data);
    } catch (error) {
      console.error('Failed to fetch subjects');
    }
  };

  const fetchExams = async (page = 1, pageSize = pagination.pageSize) => {
    setLoading(true);
    try {
      const { data } = await API.get(`/exams?pageNumber=${page}&pageSize=${pageSize}&keyword=${searchTerm}&department=${filterDept}&semester=${filterSem}&status=${filterStatus}&category=${type || 'Semester'}`);
      setExams(data.exams);
      setPagination({ page: data.page, pages: data.pages, pageSize: pageSize });

      // Calculate Pending Timetable - STRICT SEPARATION
      const { data: allCategoryExams } = await API.get(`/exams?pageSize=1000&category=${type || 'Semester'}`);
      const scheduledCodes = new Set(allCategoryExams.exams.map(e => e.subjectCode));
      
      let pending = [];

      if (type === 'Arrear') {
        // ONLY show if it has a FAIL result and no PASS result yet
        const { data: resData } = await API.get('/results?pageSize=1000');
        const results = resData.results;

        const subjectStatus = {};
        results.forEach(r => {
          if (r.resultStatus === 'Pass') {
            subjectStatus[r.subjectCode] = 'Pass';
          } else if (!subjectStatus[r.subjectCode]) {
            subjectStatus[r.subjectCode] = 'Fail';
          }
        });

        const failedAndUnscheduled = Object.keys(subjectStatus).filter(code => 
          subjectStatus[code] === 'Fail' && !scheduledCodes.has(code)
        );
        
        pending = subjects.filter(s => failedAndUnscheduled.includes(s.subjectCode));
      } else {
        // SEMESTER: ONLY show subjects from DB that have NEVER been scheduled for a Semester exam
        // (Even if they have an arrear scheduled, they shouldn't show here)
        pending = subjects.filter(s => !scheduledCodes.has(s.subjectCode));
        
        // Apply semester filter if selected
        if (filterSem) {
          pending = pending.filter(s => s.semester === Number(filterSem));
        }
      }
      
      setPendingSubjects(pending);

    } catch (error) {
      toast.error('Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchExams();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, filterDept, filterSem, filterStatus, type, subjects]); 

  const handleSubjectSelect = (e) => {
    const selectedCode = e.target.value;
    const subject = subjects.find(s => s.subjectCode === selectedCode);
    if (subject) {
      setFormData({
        ...formData,
        subjectName: subject.subjectName,
        subjectCode: subject.subjectCode,
        examType: subject.type,
        semester: subject.semester.toString()
      });
    }
  };

  const handleOpenModal = (item = null, isPending = false) => {
    if (isPending) {
      setEditingExam(null);
      setFormData({
        ...formData,
        subjectName: item.subjectName,
        subjectCode: item.subjectCode,
        examType: item.type,
        semester: item.semester.toString(),
        examDate: '',
      });
    } else if (item) {
      setEditingExam(item);
      setFormData({
        ...item,
        examDate: item.examDate.split('T')[0],
      });
    } else {
      setEditingExam(null);
      setFormData({
        subjectName: '',
        subjectCode: '',
        department: user?.department || '',
        semester: availableSemesters[0].toString(),
        examDate: '',
        startTime: '09:00',
        endTime: '12:00',
        examType: 'Theory',
        session: 'F.N',
        category: type || 'Semester'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExam) {
        await API.put(`/exams/${editingExam._id}`, formData);
        toast.success('Exam updated successfully');
      } else {
        await API.post('/exams', formData);
        toast.success('Exam scheduled successfully');
      }
      setIsModalOpen(false);
      fetchExams(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await API.delete(`/exams/${id}`);
        toast.success('Exam deleted');
        fetchExams(pagination.page);
      } catch (error) {
        toast.error('Failed to delete exam');
      }
    }
  };

  const filteredSubjects = subjects.filter(s => s.semester === Number(formData.semester));

  const columns = [
    { header: 'Subject', accessor: 'subjectName', render: (row) => (
      <div>
        <p className="font-bold">{row.subjectName}</p>
        <p className="text-xs text-text-secondary">{row.subjectCode}</p>
      </div>
    )},
    { header: 'Type', render: (row) => (
      <span className={`px-2 py-1 rounded text-xs font-bold ${
        row.examType === 'Theory' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
      }`}>
        {row.examType}
      </span>
    )},
    { header: 'Date & Session', render: (row) => (
      <div>
        <p className="font-medium">{new Date(row.examDate).toLocaleDateString()}</p>
        <div className="flex items-center gap-1 text-xs text-text-secondary">
          <HiOutlineClock />
          <span className="font-bold text-primary">{row.session}</span>
          <span>({row.startTime} - {row.endTime})</span>
        </div>
      </div>
    )},
    { header: 'Dept/Sem', render: (row) => (
      <div className="text-sm">
        <p className="font-bold">{row.department}</p>
        <p className="text-xs text-text-secondary">Semester {row.semester}</p>
      </div>
    )},
    { header: 'Status', render: (row) => {
      let statusClasses = 'bg-red-100 text-red-600'; 
      if (row.status === 'Upcoming') {
        statusClasses = 'bg-emerald-100 text-emerald-600';
      }
      
      return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusClasses}`}>
          {row.status}
        </span>
      );
    }},
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

  const title = type ? `${type} Exams` : 'All Exams';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">{title}</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus />
          <span>Schedule {type || 'Exam'}</span>
        </button>
      </div>

      {pendingSubjects.length > 0 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2">
            <HiOutlineExclamationCircle className="text-amber-500 text-xl" />
            <h3 className="text-lg font-bold text-text-primary">
              {type === 'Arrear' ? 'Failed Subjects Waiting for Arrear Schedule' : 'New Subjects Waiting for Semester Schedule'} ({pendingSubjects.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingSubjects.map(sub => (
              <div 
                key={sub._id} 
                className={`card border-l-4 flex items-center justify-between p-4 group hover:shadow-md transition-all ${
                  sub.type === 'Theory' ? 'border-l-blue-400 bg-blue-50/30' : 'border-l-purple-400 bg-purple-50/30'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      sub.type === 'Theory' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                    }`}>
                      {sub.type}
                    </span>
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">{sub.subjectCode} • Sem {sub.semester}</p>
                  </div>
                  <p className="text-sm font-bold text-text-primary truncate">{sub.subjectName}</p>
                </div>
                <button 
                  onClick={() => handleOpenModal(sub, true)}
                  className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm text-white ${
                    sub.type === 'Theory' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-purple-500 hover:bg-purple-600'
                  }`}
                >
                  <HiOutlinePlus />
                  <span>Schedule</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xl" />
          <input
            type="text"
            placeholder="Search by subject..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="input-field w-auto min-w-[150px] font-bold"
          value={filterSem}
          onChange={(e) => setFilterSem(e.target.value)}
        >
          <option value="">All Semesters</option>
          {availableSemesters.map(s => <option key={s} value={s}>Semester {s}</option>)}
        </select>
        <select 
          className="input-field w-auto min-w-[150px] font-bold"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <DataTable 
        columns={columns} 
        data={exams} 
        loading={loading}
        pagination={pagination}
        onPageChange={(page, pageSize) => fetchExams(page, pageSize)}
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingExam ? 'Edit Exam' : `Schedule ${type || 'Exam'}`}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Semester Selection</label>
            <select
              required
              className="input-field font-bold"
              value={formData.semester}
              onChange={(e) => setFormData({...formData, semester: e.target.value, subjectName: '', subjectCode: ''})}
            >
              {availableSemesters.map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Select Subject *</label>
            <div className="relative">
              <HiOutlineAcademicCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                required
                className="input-field pl-10"
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

          <div>
            <label className="block text-sm font-medium mb-1 text-text-secondary">Subject Code (Auto)</label>
            <input
              type="text"
              readOnly
              className="input-field bg-gray-50 text-text-secondary cursor-not-allowed font-bold"
              value={formData.subjectCode}
              placeholder="e.g. CS3401"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Exam Type (Auto)</label>
            <input
              type="text"
              readOnly
              className="input-field bg-gray-50 text-text-secondary cursor-not-allowed font-bold"
              value={formData.examType}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Exam Date *</label>
            <input
              type="date"
              required
              className="input-field"
              value={formData.examDate}
              onChange={(e) => setFormData({...formData, examDate: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Session *</label>
            <select
              required
              className="input-field"
              value={formData.session}
              onChange={(e) => setFormData({...formData, session: e.target.value})}
            >
              <option value="F.N">F.N (Forenoon)</option>
              <option value="A.N">A.N (Afternoon)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium mb-1 text-text-secondary">Start Time</label>
              <input
                type="time"
                className="input-field"
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-text-secondary">End Time</label>
              <input
                type="time"
                className="input-field"
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
              />
            </div>
          </div>
          
          <div className="md:col-span-2 pt-4 flex gap-3">
            <button type="submit" className="flex-1 btn-primary py-3">
              {editingExam ? 'Update' : 'Schedule'} Exam
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

export default Exams;

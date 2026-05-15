import React, { useState, useEffect } from 'react';
import API from '../api';
import DataTable from '../components/tables/DataTable';
import Modal from '../components/modals/Modal';
import { 
  HiOutlinePlus, 
  HiOutlinePencil, 
  HiOutlineTrash, 
  HiOutlineSearch, 
  HiOutlineClock
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Exams = ({ type }) => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterSem, setFilterSem] = useState('');

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
  }, [user, editingExam, type]);

  const fetchExams = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await API.get(`/exams?pageNumber=${page}&keyword=${searchTerm}&department=${filterDept}&semester=${filterSem}&category=${type || 'Semester'}`);
      setExams(data.exams);
      setPagination({ page: data.page, pages: data.pages });
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
  }, [searchTerm, filterDept, filterSem, type]);

  const handleOpenModal = (exam = null) => {
    if (exam) {
      setEditingExam(exam);
      setFormData({
        ...exam,
        examDate: exam.examDate.split('T')[0],
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
        toast.success('Exam added successfully');
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
    { header: 'Status', render: (row) => (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
        row.status === 'Upcoming' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
      }`}>
        {row.status}
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

  const title = type ? `${type} Exams` : 'All Exams';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus />
          <span>Add {type || 'Exam'}</span>
        </button>
      </div>

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
          className="input-field w-auto min-w-[150px]"
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
        >
          <option value="">All Departments</option>
          <option value="CS">Computer Science</option>
          <option value="IT">Information Technology</option>
          <option value="ECE">Electronics</option>
          <option value="MECH">Mechanical</option>
        </select>
        <select 
          className="input-field w-auto min-w-[150px]"
          value={filterSem}
          onChange={(e) => setFilterSem(e.target.value)}
        >
          <option value="">All Semesters</option>
          {availableSemesters.map(s => <option key={s} value={s}>Semester {s}</option>)}
        </select>
      </div>

      <DataTable 
        columns={columns} 
        data={exams} 
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => fetchExams(page)}
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingExam ? 'Edit Exam' : `Add New ${type || 'Exam'}`}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 text-text-secondary">Student Department (Auto)</label>
            <input
              type="text"
              readOnly
              className="input-field bg-gray-50 text-text-secondary cursor-not-allowed font-bold"
              value={formData.department}
            />
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
          
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Exam Type *</label>
              <select
                required
                className="input-field"
                value={formData.examType}
                onChange={(e) => setFormData({...formData, examType: e.target.value})}
              >
                <option value="Theory">Theory</option>
                <option value="Laboratory">Laboratory</option>
              </select>
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
            <button type="submit" className="flex-1 btn-primary">
              {editingExam ? 'Update' : 'Create'} {type || 'Exam'}
            </button>
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all font-medium"
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

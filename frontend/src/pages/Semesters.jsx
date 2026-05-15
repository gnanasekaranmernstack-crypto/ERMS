import React, { useState, useEffect } from 'react';
import API from '../api';
import Modal from '../components/modals/Modal';
import { 
  HiOutlinePlus, 
  HiOutlinePencil, 
  HiOutlineTrash, 
  HiChevronDown, 
  HiChevronUp,
  HiOutlineBookOpen,
  HiOutlineAcademicCap,
  HiOutlineCheckCircle,
  HiOutlineExclamation
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Semesters = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [expandedSem, setExpandedSem] = useState(null);

  const semesters = user?.entryType === 'Direct Second Year' 
    ? [3, 4, 5, 6, 7, 8] 
    : [1, 2, 3, 4, 5, 6, 7, 8];

  const [formData, setFormData] = useState({
    subjectName: '',
    subjectCode: '',
    department: user?.department || '',
    semester: semesters[0],
    type: 'Theory'
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subRes, resRes] = await Promise.all([
        API.get('/subjects'),
        API.get('/results?pageSize=1000')
      ]);
      setSubjects(subRes.data);
      setResults(resRes.data.results);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const getSubjectStatus = (code) => {
    const subResults = results.filter(r => r.subjectCode === code);
    if (subResults.length === 0) return 'Pending';
    
    // If any attempt is Pass, it's Passed
    const passed = subResults.some(r => r.resultStatus === 'Pass');
    if (passed) return 'Pass';
    
    // If no pass, but has results, it's an Arrear
    return 'Arrear';
  };

  const handleOpenModal = (sub = null, sem = null) => {
    if (sub) {
      setEditingSubject(sub);
      setFormData(sub);
    } else {
      setEditingSubject(null);
      setFormData({
        subjectName: '',
        subjectCode: '',
        department: user?.department || '',
        semester: sem || semesters[0],
        type: 'Theory'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubject) {
        await API.put(`/subjects/${editingSubject._id}`, formData);
        toast.success('Subject updated');
      } else {
        await API.post('/subjects', formData);
        toast.success('Subject added');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this subject?')) {
      try {
        await API.delete(`/subjects/${id}`);
        toast.success('Subject removed');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const getSubjectsBySem = (sem) => subjects.filter(s => s.semester === sem);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Academic Semesters</h1>
          <p className="text-text-secondary text-sm font-medium">Manage your subjects and track your progress.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2 py-3 px-6 rounded-xl shadow-lg">
          <HiOutlinePlus />
          <span>Add Subject</span>
        </button>
      </div>

      <div className="space-y-4">
        {semesters.map(sem => {
          const semSubjects = getSubjectsBySem(sem);
          const isOpen = expandedSem === sem;
          
          const passedCount = semSubjects.filter(s => getSubjectStatus(s.subjectCode) === 'Pass').length;
          const arrearCount = semSubjects.filter(s => getSubjectStatus(s.subjectCode) === 'Arrear').length;

          return (
            <div key={sem} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button 
                onClick={() => setExpandedSem(isOpen ? null : sem)}
                className={`w-full flex items-center justify-between p-5 transition-all ${isOpen ? 'bg-indigo-50/50' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl ${isOpen ? 'bg-primary text-white' : 'bg-indigo-50 text-primary'}`}>
                    <HiOutlineBookOpen className="text-xl" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-text-primary">Semester {sem}</h3>
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <span className="text-text-secondary">{semSubjects.length} Subjects</span>
                      {passedCount > 0 && <span className="text-emerald-600 font-bold">• {passedCount} Passed</span>}
                      {arrearCount > 0 && <span className="text-red-500 font-bold animate-pulse">• {arrearCount} Arrears</span>}
                    </div>
                  </div>
                </div>
                {isOpen ? <HiChevronUp className="text-text-secondary" /> : <HiChevronDown className="text-text-secondary" />}
              </button>

              {isOpen && (
                <div className="p-5 border-t border-gray-100 bg-white space-y-3">
                  {semSubjects.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-text-secondary text-sm">No subjects added for this semester.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {semSubjects.map(sub => {
                        const status = getSubjectStatus(sub.subjectCode);
                        const isPassed = status === 'Pass';
                        const isArrear = status === 'Arrear';

                        return (
                          <div 
                            key={sub._id} 
                            className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                              isPassed 
                                ? 'bg-emerald-50/30 border-emerald-100 pass-animation shadow-sm' 
                                : isArrear
                                  ? 'bg-red-50/30 border-red-100 arrear-animation shadow-sm'
                                  : 'bg-gray-50/50 border-transparent hover:border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                isPassed ? 'bg-emerald-100 text-emerald-600' : 
                                isArrear ? 'bg-red-100 text-red-600' : 
                                'bg-white text-gray-400'
                              }`}>
                                {isPassed ? <HiOutlineCheckCircle className="text-xl" /> : 
                                 isArrear ? <HiOutlineExclamation className="text-xl" /> :
                                 <HiOutlineAcademicCap className="text-xl" />}
                              </div>
                              <div>
                                <h4 className={`font-bold ${isPassed ? 'text-emerald-700' : isArrear ? 'text-red-700' : 'text-text-primary'}`}>
                                  {sub.subjectName}
                                  {isPassed && <span className="ml-2 text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Passed</span>}
                                  {isArrear && <span className="ml-2 text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Arrear</span>}
                                </h4>
                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{sub.subjectCode} • {sub.type}</p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => handleOpenModal(sub)} className="p-2 text-gray-400 hover:text-primary transition-colors">
                                <HiOutlinePencil />
                              </button>
                              <button onClick={() => handleDelete(sub._id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                <HiOutlineTrash />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingSubject ? 'Edit Subject' : 'Add New Subject'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-text-secondary mb-1">Semester</label>
            <select
              required
              className="input-field font-bold"
              value={formData.semester}
              onChange={(e) => setFormData({...formData, semester: Number(e.target.value)})}
            >
              {semesters.map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-text-primary mb-1">Subject Name *</label>
            <input
              type="text"
              required
              className="input-field font-medium"
              placeholder="e.g. Data Structures"
              value={formData.subjectName}
              onChange={(e) => setFormData({...formData, subjectName: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-text-primary mb-1">Subject Code *</label>
              <input
                type="text"
                required
                className="input-field font-bold"
                placeholder="e.g. CS3401"
                value={formData.subjectCode}
                onChange={(e) => setFormData({...formData, subjectCode: e.target.value.toUpperCase()})}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-text-secondary mb-1">Category</label>
              <div className="flex bg-gray-50 p-1 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'Theory'})}
                  className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${
                    formData.type === 'Theory' ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:bg-gray-100'
                  }`}
                >
                  THEORY
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'Laboratory'})}
                  className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${
                    formData.type === 'Laboratory' ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:bg-gray-100'
                  }`}
                >
                  LAB
                </button>
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex gap-4">
            <button type="submit" className="flex-1 btn-primary py-4 rounded-2xl shadow-xl text-lg">
              {editingSubject ? 'Update Subject' : 'Add Subject'}
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

export default Semesters;

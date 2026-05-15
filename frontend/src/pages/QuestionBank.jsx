import React, { useState, useEffect } from 'react';
import API from '../api';
import DataTable from '../components/tables/DataTable';
import Modal from '../components/modals/Modal';
import { 
  HiOutlinePlus, 
  HiOutlinePencil, 
  HiOutlineTrash, 
  HiOutlineSearch, 
  HiOutlineBookOpen,
  HiOutlineExternalLink,
  HiOutlineViewGrid,
  HiOutlineMenu,
  HiOutlineHashtag,
  HiOutlineBookmark,
  HiOutlinePhotograph,
  HiOutlineCloudUpload,
  HiOutlineQuestionMarkCircle
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const QuestionBank = () => {
  const { user } = useAuth();
  const [qbs, setQbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, pageSize: 12 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQb, setEditingQb] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSem, setFilterSem] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const availableSemesters = user?.entryType === 'Direct Second Year' 
    ? [3, 4, 5, 6, 7, 8] 
    : [1, 2, 3, 4, 5, 6, 7, 8];

  const [formData, setFormData] = useState({
    subjectName: '',
    subjectCode: '',
    authors: '',
    regulation: '2021',
    semester: availableSemesters[0].toString(),
    department: user?.department || '',
    link: ''
  });

  useEffect(() => {
    if (user && !editingQb) {
      setFormData(prev => ({ 
        ...prev, 
        department: user.department || '',
        semester: availableSemesters[0].toString()
      }));
    }
  }, [user, editingQb]);

  const fetchQbs = async (page = 1, pageSize = pagination.pageSize) => {
    setLoading(true);
    try {
      const { data } = await API.get(`/question-banks?pageNumber=${page}&pageSize=${pageSize}&keyword=${searchTerm}&semester=${filterSem}`);
      setQbs(data.qbs);
      setPagination({ page: data.page, pages: data.pages, pageSize: pageSize });
    } catch (error) {
      toast.error('Failed to fetch question banks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchQbs();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, filterSem]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleOpenModal = (qb = null) => {
    if (qb) {
      setEditingQb(qb);
      setFormData({
        ...qb,
        semester: qb.semester.toString()
      });
      setImagePreview(qb.image ? `${API.defaults.baseURL.replace('/api', '')}${qb.image}` : null);
    } else {
      setEditingQb(null);
      setFormData({
        subjectName: '',
        subjectCode: '',
        authors: '',
        regulation: '2021',
        semester: availableSemesters[0].toString(),
        department: user?.department || '',
        link: ''
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (imageFile) data.append('image', imageFile);

    try {
      if (editingQb) {
        await API.put(`/question-banks/${editingQb._id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Question Bank updated');
      } else {
        await API.post('/question-banks', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('New Question Bank added');
      }
      setIsModalOpen(false);
      fetchQbs(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await API.delete(`/question-banks/${id}`);
        toast.success('Question Bank removed');
        fetchQbs(pagination.page);
      } catch (error) {
        toast.error('Failed to remove');
      }
    }
  };

  const columns = [
    { header: 'Image', render: (row) => (
      <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden border">
        {row.image ? <img src={`${API.defaults.baseURL.replace('/api', '')}${row.image}`} className="w-full h-full object-cover" /> : <HiOutlineQuestionMarkCircle className="w-full h-full p-2 text-gray-300" />}
      </div>
    )},
    { header: 'Subject', render: (row) => (
      <div>
        <p className="font-bold">{row.subjectName}</p>
        <p className="text-xs text-text-secondary">{row.subjectCode}</p>
      </div>
    )},
    { header: 'Reg/Sem', render: (row) => <p className="text-sm">R-{row.regulation} / S-{row.semester}</p> },
    { header: 'Actions', render: (row) => (
      <div className="flex gap-2">
        <button onClick={() => handleOpenModal(row)} className="text-primary hover:bg-primary/5 p-2 rounded-lg transition-colors"><HiOutlinePencil /></button>
        <button onClick={() => handleDelete(row._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><HiOutlineTrash /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Question Bank Guide</h1>
          <p className="text-text-secondary text-sm">Access previous year questions and university guides</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-100">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-gray-100'}`}><HiOutlineViewGrid className="text-xl" /></button>
            <button onClick={() => setViewMode('table')} className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-gray-100'}`}><HiOutlineMenu className="text-xl" /></button>
          </div>
          <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2"><HiOutlinePlus /><span>Add Semester</span></button>
        </div>
      </div>

      <div className="card flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xl" />
          <input type="text" placeholder="Search subject or code..." className="input-field pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select className="input-field w-auto" value={filterSem} onChange={(e) => setFilterSem(e.target.value)}>
          <option value="">All Semesters</option>
          {availableSemesters.map(s => <option key={s} value={s}>Semester {s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {qbs.map((qb) => (
            <div key={qb._id} className="card hover:shadow-xl transition-all border border-gray-100 flex flex-col group">
              <div className="h-48 bg-gray-100 rounded-t-xl relative overflow-hidden flex items-center justify-center">
                {qb.image ? <img src={`${API.defaults.baseURL.replace('/api', '')}${qb.image}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <HiOutlineQuestionMarkCircle className="text-7xl text-primary/20" />}
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(qb)} className="p-1.5 bg-white text-primary rounded-lg shadow-md hover:bg-primary hover:text-white transition-colors"><HiOutlinePencil size={14} /></button>
                  <button onClick={() => handleDelete(qb._id)} className="p-1.5 bg-white text-red-500 rounded-lg shadow-md hover:bg-red-500 hover:text-white transition-colors"><HiOutlineTrash size={14} /></button>
                </div>
                <div className="absolute top-3 left-3"><span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-primary text-[10px] font-bold rounded shadow-sm">R-{qb.regulation}</span></div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex-1">
                  <h3 className="font-bold text-text-primary line-clamp-1">{qb.subjectName}</h3>
                  <p className="text-xs text-primary font-bold mb-3">{qb.subjectCode}</p>
                  <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider mb-4">Semester {qb.semester} • {qb.department}</p>
                </div>
                {qb.link && <a href={qb.link} target="_blank" rel="noopener noreferrer" className="w-full btn-primary py-2 text-xs flex items-center justify-center gap-2">View Guide <HiOutlineExternalLink /></a>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DataTable columns={columns} data={qbs} loading={loading} pagination={pagination} onPageChange={(page, pageSize) => fetchQbs(page, pageSize)} />
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingQb ? 'Edit Question Bank' : 'Add Question Bank'}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 flex flex-col items-center p-4 border-2 border-dashed rounded-xl gap-3">
            {imagePreview ? <img src={imagePreview} className="h-32 object-contain" /> : <HiOutlineCloudUpload size={32} className="text-gray-300" />}
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="qb-img" />
            <label htmlFor="qb-img" className="btn-primary py-2 px-4 text-xs cursor-pointer">Choose Cover Image</label>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Subject Name *</label>
            <input type="text" required className="input-field" value={formData.subjectName} onChange={(e) => setFormData({...formData, subjectName: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subject Code *</label>
            <input type="text" required className="input-field" value={formData.subjectCode} onChange={(e) => setFormData({...formData, subjectCode: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Regulation *</label>
            <select required className="input-field" value={formData.regulation} onChange={(e) => setFormData({...formData, regulation: e.target.value})}>
              <option value="2013">2013</option><option value="2017">2017</option><option value="2021">2021</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Semester *</label>
            <select required className="input-field" value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})}>
              {availableSemesters.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Department *</label>
            <select required className="input-field" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}>
              <option value="CS">CS</option><option value="IT">IT</option><option value="ECE">ECE</option><option value="MECH">MECH</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Guide Link (URL)</label>
            <input type="url" className="input-field" value={formData.link} onChange={(e) => setFormData({...formData, link: e.target.value})} />
          </div>
          <div className="md:col-span-2 pt-4 flex gap-3">
            <button type="submit" className="flex-1 btn-primary">Save Question Bank</button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-all font-medium">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default QuestionBank;

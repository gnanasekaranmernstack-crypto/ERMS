import React, { useState, useEffect, useRef } from 'react';
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
  HiOutlineQrcode,
  HiOutlineX
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';

const Books = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, pageSize: 12 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterSem, setFilterSem] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  
  // Scanning state
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);

  const availableSemesters = user?.entryType === 'Direct Second Year' 
    ? [3, 4, 5, 6, 7, 8] 
    : [1, 2, 3, 4, 5, 6, 7, 8];

  const [formData, setFormData] = useState({
    subjectName: '',
    subjectCode: '',
    authors: '',
    regulation: '2021',
    description: '',
    semester: availableSemesters[0].toString(),
    department: user?.department || '',
    link: ''
  });

  useEffect(() => {
    if (user && !editingBook) {
      setFormData(prev => ({ 
        ...prev, 
        department: user.department || '',
        semester: availableSemesters[0].toString()
      }));
    }
  }, [user, editingBook]);

  const fetchBooks = async (page = 1, pageSize = pagination.pageSize) => {
    setLoading(true);
    try {
      const { data } = await API.get(`/books?pageNumber=${page}&pageSize=${pageSize}&keyword=${searchTerm}&department=${filterDept}&semester=${filterSem}`);
      setBooks(data.books);
      setPagination({ page: data.page, pages: data.pages, pageSize: pageSize });
    } catch (error) {
      toast.error('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchBooks();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, filterDept, filterSem]);

  // Handle Scanner
  useEffect(() => {
    if (isScanning) {
      const scanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.0
      }, false);

      scanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = scanner;

      return () => {
        if (scannerRef.current) {
          scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
        }
      };
    }
  }, [isScanning]);

  const onScanSuccess = async (decodedText) => {
    // decodedText is usually the ISBN
    setIsScanning(false);
    toast.loading('Fetching book details...', { id: 'fetch-book' });
    
    try {
      // Try fetching from Google Books API
      const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${decodedText}`);
      
      if (response.data.totalItems > 0) {
        const bookInfo = response.data.items[0].volumeInfo;
        setFormData(prev => ({
          ...prev,
          subjectName: bookInfo.title || '',
          authors: bookInfo.authors ? bookInfo.authors.join(', ') : '',
          description: bookInfo.description || ''
        }));
        toast.success('Book details auto-filled!', { id: 'fetch-book' });
      } else {
        // Try searching by title if ISBN lookup fails (some barcodes are not ISBNs)
        toast.error('ISBN not found. Trying keyword search...', { id: 'fetch-book' });
        const titleResponse = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${decodedText}`);
        if (titleResponse.data.totalItems > 0) {
          const bookInfo = titleResponse.data.items[0].volumeInfo;
          setFormData(prev => ({
            ...prev,
            subjectName: bookInfo.title || '',
            authors: bookInfo.authors ? bookInfo.authors.join(', ') : '',
            description: bookInfo.description || ''
          }));
          toast.success('Book details auto-filled!', { id: 'fetch-book' });
        } else {
          toast.error('Could not find book details. Please enter manually.', { id: 'fetch-book' });
        }
      }
    } catch (error) {
      toast.error('Failed to fetch book info. Please enter manually.', { id: 'fetch-book' });
    }
  };

  const onScanFailure = (error) => {
    // console.warn(`Code scan error = ${error}`);
  };

  const handleOpenModal = (book = null) => {
    if (book) {
      setEditingBook(book);
      setFormData({
        ...book,
        semester: book.semester.toString()
      });
    } else {
      setEditingBook(null);
      setFormData({
        subjectName: '',
        subjectCode: '',
        authors: '',
        regulation: '2021',
        description: '',
        semester: availableSemesters[0].toString(),
        department: user?.department || '',
        link: ''
      });
    }
    setIsScanning(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBook) {
        await API.put(`/books/${editingBook._id}`, formData);
        toast.success('Book details updated');
      } else {
        await API.post('/books', formData);
        toast.success('New book added to library');
      }
      setIsModalOpen(false);
      fetchBooks(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this book?')) {
      try {
        await API.delete(`/books/${id}`);
        toast.success('Book removed');
        fetchBooks(pagination.page);
      } catch (error) {
        toast.error('Failed to remove book');
      }
    }
  };

  const columns = [
    { header: 'Subject Info', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg text-primary text-xl">
          <HiOutlineBookOpen />
        </div>
        <div>
          <p className="font-bold">{row.subjectName}</p>
          <p className="text-xs text-text-secondary">{row.subjectCode} • R-{row.regulation}</p>
        </div>
      </div>
    )},
    { header: 'Authors', accessor: 'authors' },
    { header: 'Dept/Sem', render: (row) => (
      <div className="text-sm">
        <p className="font-bold">{row.department}</p>
        <p className="text-xs text-text-secondary">Semester {row.semester}</p>
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Books Library</h1>
          <p className="text-text-secondary text-sm">Organize and access subject-specific books</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-100">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-gray-100'}`}>
              <HiOutlineViewGrid className="text-xl" />
            </button>
            <button onClick={() => setViewMode('table')} className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-gray-100'}`}>
              <HiOutlineMenu className="text-xl" />
            </button>
          </div>
          <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
            <HiOutlinePlus />
            <span className="hidden sm:inline">Add Book</span>
          </button>
        </div>
      </div>

      <div className="card flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xl" />
          <input
            type="text"
            placeholder="Search by subject, code or authors..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="input-field w-auto min-w-[150px]" value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
          <option value="">All Departments</option>
          <option value="CS">Computer Science</option>
          <option value="IT">Information Technology</option>
          <option value="ECE">Electronics</option>
          <option value="MECH">Mechanical</option>
        </select>
        <select className="input-field w-auto min-w-[150px]" value={filterSem} onChange={(e) => setFilterSem(e.target.value)}>
          <option value="">All Semesters</option>
          {availableSemesters.map(s => <option key={s} value={s}>Semester {s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.length > 0 ? books.map((book) => (
            <div key={book._id} className="card hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group">
              <div className="h-40 bg-gradient-to-br from-primary/5 to-primary/20 rounded-t-xl flex items-center justify-center relative overflow-hidden">
                <HiOutlineBookOpen className="text-6xl text-primary/30 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(book)} className="p-1.5 bg-white text-primary rounded-lg shadow-md hover:bg-primary hover:text-white transition-colors">
                    <HiOutlinePencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(book._id)} className="p-1.5 bg-white text-red-500 rounded-lg shadow-md hover:bg-red-500 hover:text-white transition-colors">
                    <HiOutlineTrash size={14} />
                  </button>
                </div>
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-primary text-[10px] font-bold rounded shadow-sm">
                    R-{book.regulation}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="px-2 py-1 bg-primary text-white text-[10px] font-bold rounded shadow-sm">
                    SEM {book.semester}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex-1">
                  <h3 className="font-bold text-text-primary line-clamp-1 mb-1">{book.subjectName}</h3>
                  <p className="text-xs text-primary font-bold mb-3">{book.subjectCode}</p>
                  <p className="text-xs text-text-secondary mb-3 italic leading-tight">Authors: {book.authors}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded">
                      {book.department}
                    </span>
                  </div>
                </div>
                {book.link && (
                  <a href={book.link} target="_blank" rel="noopener noreferrer" className="w-full btn-primary py-2 text-xs flex items-center justify-center gap-2">
                    Open Book <HiOutlineExternalLink />
                  </a>
                )}
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center card bg-gray-50 border-dashed border-2">
              <HiOutlineBookOpen className="mx-auto text-5xl text-gray-300 mb-3" />
              <p className="text-text-secondary">Your library is empty. Add your first book!</p>
            </div>
          )}
        </div>
      ) : (
        <DataTable columns={columns} data={books} loading={loading} pagination={pagination} onPageChange={(page, pageSize) => fetchBooks(page, pageSize)} />
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBook ? 'Edit Book Details' : 'Add New Book'}>
        <div className="mb-6">
          {!isScanning ? (
            <button 
              type="button"
              onClick={() => setIsScanning(true)}
              className="w-full py-3 border-2 border-dashed border-primary/30 rounded-xl flex items-center justify-center gap-3 text-primary hover:bg-primary/5 transition-all font-bold"
            >
              <HiOutlineQrcode className="text-2xl" />
              Scan Book Barcode (ISBN)
            </button>
          ) : (
            <div className="relative">
              <div id="reader" className="w-full overflow-hidden rounded-xl border-2 border-primary shadow-lg"></div>
              <button 
                onClick={() => setIsScanning(false)}
                className="absolute -top-3 -right-3 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 z-10"
              >
                <HiOutlineX />
              </button>
              <p className="text-center text-xs text-text-secondary mt-2">Center the barcode within the box to scan</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Subject Name *</label>
            <div className="relative">
              <HiOutlineBookmark className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" required className="input-field pl-10" placeholder="e.g. Operating Systems" value={formData.subjectName} onChange={(e) => setFormData({...formData, subjectName: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subject Code *</label>
            <div className="relative">
              <HiOutlineHashtag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" required className="input-field pl-10" placeholder="e.g. CS3401" value={formData.subjectCode} onChange={(e) => setFormData({...formData, subjectCode: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Regulation *</label>
            <select required className="input-field" value={formData.regulation} onChange={(e) => setFormData({...formData, regulation: e.target.value})}>
              <option value="2013">2013</option>
              <option value="2017">2017</option>
              <option value="2021">2021</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Authors *</label>
            <input type="text" required className="input-field" placeholder="e.g. Abraham Silberschatz, Peter B. Galvin" value={formData.authors} onChange={(e) => setFormData({...formData, authors: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Department *</label>
            <select required className="input-field" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}>
              <option value="">Select Department</option>
              <option value="CS">Computer Science</option>
              <option value="IT">Information Technology</option>
              <option value="ECE">Electronics</option>
              <option value="MECH">Mechanical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Semester *</label>
            <select required className="input-field" value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})}>
              {availableSemesters.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Resource Link (URL)</label>
            <input type="url" className="input-field" placeholder="https://drive.google.com/..." value={formData.link} onChange={(e) => setFormData({...formData, link: e.target.value})} />
          </div>
          
          <div className="md:col-span-2 pt-4 flex gap-3">
            <button type="submit" className="flex-1 btn-primary">{editingBook ? 'Update' : 'Add'} Book</button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all font-medium">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Books;

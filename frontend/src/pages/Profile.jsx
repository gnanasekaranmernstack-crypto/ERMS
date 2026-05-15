import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  HiOutlineUserCircle,
  HiOutlineOfficeBuilding,
  HiOutlineIdentification,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlinePencil,
  HiOutlineSave,
  HiOutlineX,
  HiOutlineArrowCircleRight,
  HiOutlineLibrary
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    entryType: 'First Year',
    degreeBranch: '',
    university: '',
    regulation: '',
    department: '',
    startYear: '',
    endYear: '',
    collegeName: '',
    collegeCode: '',
    collegeAddress: '',
    registerNumber: '',
    mobileNumber: '',
    address: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        entryType: user.entryType || 'First Year',
        degreeBranch: user.degreeBranch || '',
        university: user.university || '',
        regulation: user.regulation || '',
        department: user.department || '',
        startYear: user.startYear || '',
        endYear: user.endYear || '',
        collegeName: user.collegeName || '',
        collegeCode: user.collegeCode || '',
        collegeAddress: user.collegeAddress || '',
        registerNumber: user.registerNumber || '',
        mobileNumber: user.mobileNumber || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">My Profile</h1>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="btn-primary flex items-center gap-2"
          >
            <HiOutlinePencil />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex gap-2">
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              <HiOutlineSave />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
            <button 
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2 transition-all font-medium"
            >
              <HiOutlineX />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        {/* Left Column: Avatar & Basic Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="card flex flex-col items-center p-8 bg-gradient-to-br from-white to-indigo-50/30">
            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-4 border-4 border-white shadow-xl">
              <HiOutlineUserCircle className="text-8xl text-primary" />
            </div>
            {isEditing ? (
              <div className="w-full space-y-2">
                <label className="text-[10px] uppercase font-bold text-text-secondary tracking-widest block text-center">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="input-field text-center"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-text-primary text-center">{user?.name}</h3>
                <p className="text-primary font-bold text-sm bg-primary/10 px-3 py-1 rounded-full mt-2">
                  {user?.registerNumber}
                </p>
              </>
            )}
            
            <div className="w-full mt-8 space-y-4">
              <div className="flex flex-col border-b border-gray-100 pb-2">
                <span className="text-text-secondary text-[10px] uppercase font-bold tracking-widest">Entry Type</span>
                {isEditing ? (
                  <select
                    name="entryType"
                    className="input-field mt-1"
                    value={formData.entryType}
                    onChange={handleChange}
                  >
                    <option value="First Year">First Year</option>
                    <option value="Direct Second Year">Direct Second Year</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-2 font-bold text-text-primary mt-1">
                    <HiOutlineArrowCircleRight className="text-primary" />
                    <span>{user?.entryType}</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col border-b border-gray-100 pb-2">
                <span className="text-text-secondary text-[10px] uppercase font-bold tracking-widest">Department</span>
                {isEditing ? (
                  <input
                    type="text"
                    name="department"
                    className="input-field mt-1"
                    value={formData.department}
                    onChange={handleChange}
                  />
                ) : (
                  <span className="font-bold text-text-primary">{user?.department}</span>
                )}
              </div>
              <div className="flex flex-col border-b border-gray-100 pb-2">
                <span className="text-text-secondary text-[10px] uppercase font-bold tracking-widest">Batch Years</span>
                {isEditing ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      name="startYear"
                      placeholder="Start"
                      className="input-field text-center px-1"
                      value={formData.startYear}
                      onChange={handleChange}
                    />
                    <span>-</span>
                    <input
                      type="text"
                      name="endYear"
                      placeholder="End"
                      className="input-field text-center px-1"
                      value={formData.endYear}
                      onChange={handleChange}
                    />
                  </div>
                ) : (
                  <span className="font-bold text-text-primary">{user?.startYear} - {user?.endYear}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Academic Information */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="p-2 bg-indigo-50 rounded-lg text-primary">
                <HiOutlineLibrary className="text-2xl" />
              </div>
              <h4 className="text-lg font-bold text-text-primary">Academic Details</h4>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-widest block mb-1">Degree & Branch</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="degreeBranch"
                    placeholder="e.g. B.E. Computer Science"
                    className="input-field"
                    value={formData.degreeBranch}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="text-text-primary font-medium">{user?.degreeBranch || 'Not Specified'}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase tracking-widest block mb-1">University</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="university"
                    placeholder="e.g. Anna University"
                    className="input-field"
                    value={formData.university}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="text-text-primary font-medium">{user?.university || 'Not Specified'}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase tracking-widest block mb-1">Regulation</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="regulation"
                    placeholder="e.g. 2021"
                    className="input-field"
                    value={formData.regulation}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="text-text-primary font-medium">{user?.regulation || 'Not Specified'}</p>
                )}
              </div>
            </div>
          </div>

          {/* College Information */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="p-2 bg-indigo-50 rounded-lg text-primary">
                <HiOutlineOfficeBuilding className="text-2xl" />
              </div>
              <h4 className="text-lg font-bold text-text-primary">College Information</h4>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-widest block mb-1">Institution Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="collegeName"
                    className="input-field"
                    value={formData.collegeName}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="text-text-primary font-medium">{user?.collegeName}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase tracking-widest block mb-1">College Code</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="collegeCode"
                    className="input-field"
                    value={formData.collegeCode}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="text-text-primary font-medium">{user?.collegeCode}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-widest block mb-1">College Address</label>
                {isEditing ? (
                  <textarea
                    name="collegeAddress"
                    rows="2"
                    className="input-field resize-none"
                    value={formData.collegeAddress}
                    onChange={handleChange}
                  ></textarea>
                ) : (
                  <p className="text-text-primary font-medium leading-relaxed">{user?.collegeAddress}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact & Personal Details */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="p-2 bg-indigo-50 rounded-lg text-primary">
                <HiOutlineIdentification className="text-2xl" />
              </div>
              <h4 className="text-lg font-bold text-text-primary">Personal & Contact</h4>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gray-50 rounded-lg text-text-secondary mt-1">
                  <HiOutlineIdentification className="text-xl" />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-widest block mb-1">Register Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="registerNumber"
                      className="input-field"
                      value={formData.registerNumber}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="text-text-primary font-medium">{user?.registerNumber}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-gray-50 rounded-lg text-text-secondary mt-1">
                  <HiOutlinePhone className="text-xl" />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-widest block mb-1">Mobile Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="mobileNumber"
                      className="input-field"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="text-text-primary font-medium">{user?.mobileNumber}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-gray-50 rounded-lg text-text-secondary mt-1">
                  <HiOutlineLocationMarker className="text-xl" />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-widest block mb-1">Permanent Address</label>
                  {isEditing ? (
                    <textarea
                      name="address"
                      rows="2"
                      className="input-field resize-none"
                      value={formData.address}
                      onChange={handleChange}
                    ></textarea>
                  ) : (
                    <p className="text-text-primary font-medium leading-relaxed">{user?.address}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Profile;

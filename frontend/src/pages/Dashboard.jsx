import React, { useEffect, useState } from 'react';
import API from '../api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { 
  HiOutlineClipboardList, 
  HiOutlineClock, 
  HiOutlineCheckCircle, 
  HiOutlineAcademicCap,
  HiOutlineCalendar
} from 'react-icons/hi';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get('/dashboard/stats');
        setData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="animate-pulse space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>)}
    </div>
    <div className="h-96 bg-gray-200 rounded-xl"></div>
  </div>;

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const statsCards = [
    { label: 'Total Exams', value: data?.stats.totalExams, icon: HiOutlineClipboardList, color: 'bg-primary' },
    { label: 'Upcoming', value: data?.stats.upcomingExamsCount, icon: HiOutlineClock, color: 'bg-amber-500' },
    { label: 'Completed', value: data?.stats.completedExamsCount, icon: HiOutlineCheckCircle, color: 'bg-emerald-500' },
    { label: 'Latest Results', value: data?.stats.latestResultCount, icon: HiOutlineAcademicCap, color: 'bg-violet-500' },
  ];

  const getCountdown = (date) => {
    const diff = new Date(date) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="card flex items-center gap-5"
          >
            <div className={`p-4 rounded-xl text-white ${card.color}`}>
              <card.icon className="text-3xl" />
            </div>
            <div>
              <p className="text-text-secondary text-sm font-medium">{card.label}</p>
              <h3 className="text-2xl font-bold text-text-primary">{card.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Exams List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-text-primary">Upcoming Exams</h3>
            <button className="text-primary font-medium text-sm hover:underline">View All</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.upcomingExams.map((exam, idx) => (
              <motion.div 
                key={exam._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="card border-l-4 border-l-primary"
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-bold text-text-primary truncate">{exam.subjectName}</h4>
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded font-bold uppercase">
                    {exam.subjectCode}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-text-secondary">
                  <div className="flex items-center gap-2">
                    <HiOutlineCalendar className="text-lg" />
                    <span>{new Date(exam.examDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{exam.department} - Sem {exam.semester}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-primary font-bold">
                    {getCountdown(exam.examDate)} Days remaining
                  </p>
                </div>
              </motion.div>
            ))}
            {data?.upcomingExams.length === 0 && (
              <div className="col-span-2 py-10 text-center text-text-secondary italic">
                No upcoming exams scheduled
              </div>
            )}
          </div>
        </div>

        {/* Dept Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-bold text-text-primary mb-6">Exams by Department</h3>
          <div className="h-64 w-full overflow-hidden">
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
              <PieChart>
                <Pie
                  data={data?.charts.departmentExams}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data?.charts.departmentExams.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {data?.charts.departmentExams.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  <span className="text-text-secondary">{entry.name}</span>
                </div>
                <span className="font-bold">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Exams per Month Bar Chart */}
        <div className="card">
          <h3 className="text-lg font-bold text-text-primary mb-6">Exams per Month</h3>
          <div className="h-80 w-full overflow-hidden">
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
              <BarChart data={data?.charts.examsPerMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Trend Line Chart */}
        <div className="card">
          <h3 className="text-lg font-bold text-text-primary mb-6">Exams Trend</h3>
          <div className="h-80 w-full overflow-hidden">
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
              <LineChart data={data?.charts.upcomingTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Line type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={3} dot={{ fill: '#4F46E5', r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

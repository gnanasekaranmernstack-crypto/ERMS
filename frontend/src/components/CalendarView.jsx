import React, { useState } from 'react';
import { 
  HiOutlineChevronLeft, 
  HiOutlineChevronRight, 
  HiOutlineCalendar 
} from 'react-icons/hi';

const CalendarView = ({ exams, title = "Exam Time Table" }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);
  
  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= totalDays; i++) days.push(i);
  
  const getExamsForDay = (day) => {
    if (!day) return [];
    return exams.filter(exam => {
      const examDate = new Date(exam.examDate);
      return examDate.getDate() === day && 
             examDate.getMonth() === month && 
             examDate.getFullYear() === year;
    });
  };

  return (
    <div className="card p-0 overflow-hidden border-none shadow-xl bg-white">
      <div className="bg-primary p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HiOutlineCalendar className="text-3xl" />
          <div>
            <h3 className="text-xl font-bold">{monthName} {year}</h3>
            <p className="text-xs text-white/70">{title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors border border-white/20">
            <HiOutlineChevronLeft className="text-xl" />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors border border-white/20">
            <HiOutlineChevronRight className="text-xl" />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-[10px] uppercase font-bold text-text-secondary py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            const dayExams = getExamsForDay(day);
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
            
            return (
              <div 
                key={idx} 
                className={`min-h-[100px] p-2 border rounded-xl transition-all ${
                  day ? 'bg-white hover:border-primary/30' : 'bg-gray-50/50 border-transparent'
                } ${isToday ? 'border-primary shadow-md ring-1 ring-primary/20' : 'border-gray-100'}`}
              >
                {day && (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-sm font-bold ${isToday ? 'text-primary' : 'text-text-secondary'}`}>
                        {day}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {dayExams.map(exam => (
                        <div 
                          key={exam._id} 
                          title={`${exam.subjectName} (${exam.session})`}
                          className={`text-[9px] p-1.5 rounded-lg font-bold truncate transition-all hover:scale-[1.02] cursor-default ${
                            exam.examType === 'Theory' 
                              ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                              : 'bg-purple-50 text-purple-700 border border-purple-100'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="opacity-70">{exam.session}</span>
                            <span className={`w-1.5 h-1.5 rounded-full ${exam.examType === 'Theory' ? 'bg-blue-500' : 'bg-purple-500'}`}></span>
                          </div>
                          {exam.subjectCode}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="bg-gray-50 px-6 py-4 flex flex-wrap gap-6 text-[10px] font-bold uppercase tracking-wider text-text-secondary border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-200"></div>
          <span>Theory Exam</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500 shadow-sm shadow-purple-200"></div>
          <span>Laboratory Exam</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;

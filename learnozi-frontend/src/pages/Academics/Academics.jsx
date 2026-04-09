import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './Academics.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const authHeaders = () => {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
};

// University Grade Options (Pakistani Standard Approximation)
const GRADE_POINTS = {
  'A': 4.0, 'A-': 3.67, 'B+': 3.33, 'B': 3.0, 'B-': 2.67,
  'C+': 2.33, 'C': 2.0, 'C-': 1.67, 'D+': 1.33, 'D': 1.0, 'F': 0.0
};

export default function Academics() {
  const { user } = useAuth();
  const { success, error } = useToast();
  
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isSemModalOpen, setIsSemModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [activeSemesterId, setActiveSemesterId] = useState(null);

  // Forms state
  const [semForm, setSemForm] = useState({ name: '', startDate: '', endDate: '' });
  const [courseForm, setCourseForm] = useState({ name: '', code: '', creditHours: 3, targetGrade: '', actualGrade: '' });

  // CGPA Target Calculator
  const [targetCgpa, setTargetCgpa] = useState('');
  const [calculatorResult, setCalculatorResult] = useState('');

  useEffect(() => {
    fetchAcademics();
  }, []);

  const fetchAcademics = async () => {
    try {
      const { data } = await axios.get(`${API}/api/academics`, { headers: authHeaders() });
      setSemesters(data.semesters);
    } catch (err) {
      error('Failed to fetch academic records');
    } finally {
      setLoading(false);
    }
  };

  /* ── CGPA Mathematics ── */
  const calculateSGPA = (courses) => {
    let totalPoints = 0;
    let totalCredits = 0;
    courses.forEach(c => {
      const grade = c.actualGrade || c.targetGrade; // Fallback to target if actual isn't set yet
      if (grade && GRADE_POINTS[grade] !== undefined) {
        totalPoints += GRADE_POINTS[grade] * c.creditHours;
        totalCredits += c.creditHours;
      }
    });
    return totalCredits === 0 ? 0 : (totalPoints / totalCredits).toFixed(2);
  };

  const calculateCGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;
    semesters.forEach(sem => {
      sem.courses.forEach(c => {
        const grade = c.actualGrade || c.targetGrade;
        if (grade && GRADE_POINTS[grade] !== undefined) {
          totalPoints += GRADE_POINTS[grade] * c.creditHours;
          totalCredits += c.creditHours;
        }
      });
    });
    return totalCredits === 0 ? 0 : (totalPoints / totalCredits).toFixed(2);
  };

  const handleCalculator = () => {
    const currentCgpa = parseFloat(calculateCGPA());
    const target = parseFloat(targetCgpa);
    if (!target || target < 1 || target > 4) return error('Enter a valid target (1.0 to 4.0)');

    if (target <= currentCgpa) {
      setCalculatorResult(`You are already exceeding or meeting this target! Keep it up.`);
      return;
    }

    setCalculatorResult(`To raise your CGPA from ${currentCgpa} to ${target}, you will inherently need higher grades (A/B+) in upcoming semesters to average it out. Aim for an SGPA of >${(target + 0.2).toFixed(2)} next term.`);
  };

  /* ── Handlers ── */
  const submitSemester = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${API}/api/academics`, semForm, { headers: authHeaders() });
      setSemesters([data.semester, ...semesters]);
      success('Semester Added');
      setIsSemModalOpen(false);
      setSemForm({ name: '', startDate: '', endDate: '' });
    } catch (err) {
      error(err.response?.data?.error || 'Failed to add semester');
    }
  };

  const openCourseModal = (semId) => {
    setActiveSemesterId(semId);
    setCourseForm({ name: '', code: '', creditHours: 3, targetGrade: '', actualGrade: '' });
    setIsCourseModalOpen(true);
  };

  const submitCourse = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${API}/api/academics/${activeSemesterId}/courses`, courseForm, { headers: authHeaders() });
      
      setSemesters(semesters.map(sem => {
        if (sem._id === activeSemesterId) {
          return { ...sem, courses: [...sem.courses, data.course] };
        }
        return sem;
      }));
      
      success('Course Added');
      setIsCourseModalOpen(false);
    } catch (err) {
      error(err.response?.data?.error || 'Failed to add course');
    }
  };

  const updateCourseGrade = async (semId, courseId, newGrade) => {
    try {
      const { data } = await axios.put(`${API}/api/academics/courses/${courseId}`, { actualGrade: newGrade }, { headers: authHeaders() });
      
      setSemesters(semesters.map(sem => {
        if (sem._id === semId) {
          return { ...sem, courses: sem.courses.map(c => c._id === courseId ? data.course : c) };
        }
        return sem;
      }));
      success('Grade updated');
    } catch (err) {
      error('Failed to update grade');
    }
  };

  const deleteSemester = async (id) => {
    if (!window.confirm('Delete semester and all its courses?')) return;
    try {
      await axios.delete(`${API}/api/academics/${id}`, { headers: authHeaders() });
      setSemesters(semesters.filter(s => s._id !== id));
      success('Semester deleted');
    } catch (err) {
      error('Failed to delete');
    }
  };

  if (loading) return <div className="p-xl text-center">Loading Academics...</div>;

  const currentCGPA = calculateCGPA();

  return (
    <div className="academics-page">
      <div className="page-header space-between">
        <div>
          <h1>Academics Workspace 🎓</h1>
          <p>Track semesters, manage courses, and calculate targets.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsSemModalOpen(true)}>+ Add Semester</button>
      </div>

      {/* CGPA Dashboard */}
      <div className="cgpa-dashboard card">
        <div className="cgpa-stats">
          <div className="stat-box">
            <span className="stat-label">Current CGPA</span>
            <span className="stat-value text-primary">{currentCGPA > 0 ? currentCGPA : 'N/A'}</span>
          </div>
        </div>
        
        <div className="cgpa-calculator">
          <h4>Target GPA Calculator</h4>
          <div className="calc-input">
            <input 
              type="number" 
              step="0.01" 
              placeholder="e.g. 3.5" 
              value={targetCgpa} 
              onChange={e => setTargetCgpa(e.target.value)} 
            />
            <button className="btn btn-outline" onClick={handleCalculator}>Calculate</button>
          </div>
          {calculatorResult && <p className="calc-result">{calculatorResult}</p>}
        </div>
      </div>

      {/* Semesters List */}
      <div className="semesters-list">
        {semesters.length === 0 ? (
          <div className="empty-state card">
            <h2>No Semesters Added</h2>
            <p>Start tracking your degree by adding your first semester.</p>
          </div>
        ) : (
          semesters.map(sem => (
            <div key={sem._id} className="semester-card card">
              <div className="semester-header">
                <div>
                  <h3>{sem.name}</h3>
                  <span className="semester-dates">
                    {new Date(sem.startDate).toLocaleDateString()} - {new Date(sem.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="semester-actions">
                  <span className="sgpa-badge">SGPA: {calculateSGPA(sem.courses)}</span>
                  <button className="btn btn-ghost" onClick={() => deleteSemester(sem._id)}>🗑️</button>
                </div>
              </div>

              <div className="courses-table-container">
                <table className="courses-table">
                  <thead>
                    <tr>
                      <th>Course Code</th>
                      <th>Course Name</th>
                      <th>Cr. Hrs</th>
                      <th>Target</th>
                      <th>Actual Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sem.courses.length === 0 ? (
                      <tr><td colSpan="5" className="text-center">No courses added yet.</td></tr>
                    ) : (
                      sem.courses.map(course => (
                        <tr key={course._id}>
                          <td><strong>{course.code}</strong></td>
                          <td>{course.name}</td>
                          <td>{course.creditHours}</td>
                          <td><span className="grade-badge target">{course.targetGrade || '-'}</span></td>
                          <td>
                            <select 
                              className="grade-select"
                              value={course.actualGrade || ''} 
                              onChange={(e) => updateCourseGrade(sem._id, course._id, e.target.value)}
                            >
                              <option value="">Pending</option>
                              {Object.keys(GRADE_POINTS).map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              <button 
                className="btn btn-outline" 
                style={{ width: '100%', marginTop: '1rem' }}
                onClick={() => openCourseModal(sem._id)}
              >
                + Add Course
              </button>
            </div>
          ))
        )}
      </div>

      {/* Semester Modal */}
      {isSemModalOpen && (
        <div className="modal-overlay" onClick={() => setIsSemModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Add New Semester</h2>
            <form onSubmit={submitSemester}>
              <div className="form-group">
                <label>Semester Name <span>(e.g., Fall 2026)</span></label>
                <input required type="text" value={semForm.name} onChange={e => setSemForm({...semForm, name: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input required type="date" value={semForm.startDate} onChange={e => setSemForm({...semForm, startDate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input required type="date" value={semForm.endDate} onChange={e => setSemForm({...semForm, endDate: e.target.value})} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setIsSemModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Semester</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Modal */}
      {isCourseModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCourseModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Add Course</h2>
            <form onSubmit={submitCourse}>
              <div className="form-row">
                <div className="form-group">
                  <label>Code</label>
                  <input required type="text" placeholder="CS101" value={courseForm.code} onChange={e => setCourseForm({...courseForm, code: e.target.value.toUpperCase()})} />
                </div>
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Course Name</label>
                  <input required type="text" placeholder="Intro to Programming" value={courseForm.name} onChange={e => setCourseForm({...courseForm, name: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Credit Hours</label>
                  <input required type="number" min="1" max="6" value={courseForm.creditHours} onChange={e => setCourseForm({...courseForm, creditHours: parseInt(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label>Target Grade</label>
                  <select value={courseForm.targetGrade} onChange={e => setCourseForm({...courseForm, targetGrade: e.target.value})}>
                    <option value="">-Select-</option>
                    {Object.keys(GRADE_POINTS).map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setIsCourseModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Course</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

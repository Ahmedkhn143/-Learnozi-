import { useState } from 'react';
import './Academics.css';

export default function Academics() {
  const [courses] = useState([
    { id: 1, name: 'Organic Chemistry II', code: 'CHEM-302', credits: 4, grade: '3.8', status: 'In Progress', progress: 82, instructor: 'Dr. Sarah Smith' },
    { id: 2, name: 'Quantum Mechanics', code: 'PHYS-401', credits: 3, grade: '3.5', status: 'In Progress', progress: 65, instructor: 'Prof. Alan Vance' },
    { id: 3, name: 'Calculus III', code: 'MATH-201', credits: 4, grade: '4.0', status: 'In Progress', progress: 90, instructor: 'Dr. Robert Chen' },
    { id: 4, name: 'Data Structures & Algorithms', code: 'CS-202', credits: 3, grade: '3.7', status: 'In Progress', progress: 55, instructor: 'Prof. David Lee' }
  ]);

  return (
    <div className="academics-view animate-fade-in">
      <div className="academics-header">
        <div>
          <h2>🎓 Academic Profile & Course Overview</h2>
          <p>Track your semester GPA targets, course progress, and credit requirements.</p>
        </div>
      </div>

      {/* GPA & Target Metrics */}
      <div className="grid-3 mt-4">
        <div className="glass-card gpa-widget">
          <span className="widget-label">Current Cumulative GPA</span>
          <div className="gpa-value">3.75 <span className="max-gpa">/ 4.0</span></div>
          <span className="badge badge-success mt-2">Dean's List Status</span>
        </div>

        <div className="glass-card gpa-widget">
          <span className="widget-label">Semester Credit Hours</span>
          <div className="gpa-value">14 <span className="max-gpa">Credits</span></div>
          <span className="badge badge-cyan mt-2">4 Active Courses</span>
        </div>

        <div className="glass-card gpa-widget">
          <span className="widget-label">Target Graduation</span>
          <div className="gpa-value">Spring 2027</div>
          <span className="badge badge-primary mt-2">Computer Science & Chemistry</span>
        </div>
      </div>

      {/* Active Courses Breakdown */}
      <div className="glass-card mt-4">
        <h3>Current Enrolled Courses</h3>

        <div className="grid-2 mt-3">
          {courses.map((c) => (
            <div key={c.id} className="glass-card course-card">
              <div className="course-card-header">
                <div>
                  <span className="badge badge-primary">{c.code}</span>
                  <h4 className="course-title mt-1">{c.name}</h4>
                  <span className="instructor-name">Instructor: {c.instructor}</span>
                </div>
                <div className="grade-badge">{c.grade} GPA</div>
              </div>

              <div className="course-progress-box mt-3">
                <div className="progress-info-row">
                  <span>Syllabus Covered</span>
                  <span>{c.progress}%</span>
                </div>
                <div className="progress-bar-bg mt-1">
                  <div className="progress-bar-fill" style={{ width: `${c.progress}%` }} />
                </div>
              </div>

              <div className="course-footer mt-3">
                <span className="credits-text">Credits: {c.credits}</span>
                <button className="btn btn-secondary btn-sm">Course Syllabus →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

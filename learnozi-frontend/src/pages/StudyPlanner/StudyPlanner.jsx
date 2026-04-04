import { useState } from 'react';
import './StudyPlanner.css';

const INITIAL_PLANS = [
  {
    id: 1,
    title: 'Physics Final Exam',
    status: 'active',
    exam: 'Mar 15, 2026',
    subjects: 3,
    progress: 45,
    tasks: [
      { id: 1, name: 'Review Kinematics', time: '45 min', done: true },
      { id: 2, name: "Practice Newton's Laws", time: '60 min', done: false },
      { id: 3, name: 'Thermodynamics Notes', time: '30 min', done: false },
    ],
  },
  {
    id: 2,
    title: 'Calculus Midterm',
    status: 'active',
    exam: 'Mar 10, 2026',
    subjects: 2,
    progress: 70,
    tasks: [
      { id: 1, name: 'Limits & Continuity', time: '40 min', done: true },
      { id: 2, name: 'Derivatives Practice', time: '50 min', done: true },
      { id: 3, name: 'Integration Techniques', time: '60 min', done: false },
    ],
  },
  {
    id: 3,
    title: 'Biology Lab Report',
    status: 'completed',
    exam: 'Feb 28, 2026',
    subjects: 1,
    progress: 100,
    tasks: [
      { id: 1, name: 'Cell Division Diagram', time: '30 min', done: true },
      { id: 2, name: 'Write Lab Observations', time: '45 min', done: true },
    ],
  },
];

export default function StudyPlanner() {
  const [plans, setPlans] = useState(INITIAL_PLANS);

  const toggleTask = (planId, taskId) => {
    setPlans((prev) =>
      prev.map((plan) => {
        if (plan.id !== planId) return plan;
        const tasks = plan.tasks.map((t) =>
          t.id === taskId ? { ...t, done: !t.done } : t
        );
        const doneCount = tasks.filter((t) => t.done).length;
        return {
          ...plan,
          tasks,
          progress: Math.round((doneCount / tasks.length) * 100),
        };
      })
    );
  };

  return (
    <div className="planner">
      {/* Header */}
      <div className="planner-header">
        <div className="page-header">
          <h1>Study Planner</h1>
          <p>Organize your study schedule and track progress.</p>
        </div>
        <button className="btn btn-primary">+ New Plan</button>
      </div>

      {/* Plans grid */}
      <div className="planner-grid">
        {plans.map((plan) => (
          <div key={plan.id} className="card plan-card">
            <div className="plan-card-top">
              <h3>{plan.title}</h3>
              <span
                className={`badge ${
                  plan.status === 'completed' ? 'badge-success' : 'badge-primary'
                }`}
              >
                {plan.status}
              </span>
            </div>

            <div className="plan-meta">
              <span>📅 {plan.exam}</span>
              <span>📘 {plan.subjects} subjects</span>
            </div>

            {/* Progress bar */}
            <div className="plan-progress">
              <div className="plan-progress-label">
                <span>Progress</span>
                <span>{plan.progress}%</span>
              </div>
              <div className="plan-progress-bar">
                <div
                  className="plan-progress-fill"
                  style={{ width: `${plan.progress}%` }}
                />
              </div>
            </div>

            {/* Task list */}
            <div className="plan-tasks">
              {plan.tasks.map((task) => (
                <div key={task.id} className="task-row">
                  <div className="task-row-left">
                    <div
                      className={`task-check ${task.done ? 'done' : ''}`}
                      onClick={() => toggleTask(plan.id, task.id)}
                    />
                    <span className={`task-name ${task.done ? 'done' : ''}`}>
                      {task.name}
                    </span>
                  </div>
                  <span className="task-time">{task.time}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

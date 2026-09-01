import { useState } from 'react';
import './StudyPlanner.css';

export default function StudyPlanner() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Review Organic Reaction Mechanisms', subject: 'Chemistry', status: 'in-progress', priority: 'high', dueDate: 'Today' },
    { id: 2, title: 'Solve 10 Calculus Integration Problems', subject: 'Math', status: 'todo', priority: 'medium', dueDate: 'Tomorrow' },
    { id: 3, title: 'Read Chapter 4: Data Structures & Graphs', subject: 'Computer Science', status: 'completed', priority: 'low', dueDate: 'Completed' },
    { id: 4, title: 'Prepare Quantum Physics Formula Sheet', subject: 'Physics', status: 'todo', priority: 'high', dueDate: 'Sep 5' }
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('Chemistry');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask = {
      id: Date.now(),
      title: newTaskTitle,
      subject: newTaskSubject,
      status: 'todo',
      priority: newTaskPriority,
      dueDate: 'Sep 6'
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setShowAddModal(false);
  };

  const moveTask = (id, newStatus) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="planner-view animate-fade-in">
      {/* Page Header */}
      <div className="planner-header-row">
        <div>
          <h2>📅 Study Planner & Timetable</h2>
          <p>Organize your tasks, schedule study blocks, and track exam prep.</p>
        </div>
        <button className="btn btn-primary btn-md" onClick={() => setShowAddModal(true)}>
          + Add New Task
        </button>
      </div>

      {/* Task Board Columns */}
      <div className="grid-3 mt-4">
        {/* Column 1: To Do */}
        <div className="glass-card planner-column">
          <div className="column-header">
            <span className="column-title">📌 To Do ({tasks.filter(t => t.status === 'todo').length})</span>
            <span className="badge badge-warning">Pending</span>
          </div>

          <div className="task-list mt-3">
            {tasks.filter(t => t.status === 'todo').map((task) => (
              <div key={task.id} className="glass-card task-item-card">
                <div className="task-meta-row">
                  <span className="badge badge-primary">{task.subject}</span>
                  <span className={`priority-tag ${task.priority}`}>{task.priority}</span>
                </div>
                <h4 className="task-title mt-2">{task.title}</h4>
                <div className="task-footer mt-3">
                  <span className="due-date">⏱️ {task.dueDate}</span>
                  <div className="task-actions">
                    <button className="btn-action" onClick={() => moveTask(task.id, 'in-progress')} title="Start Task">➡️</button>
                    <button className="btn-action danger" onClick={() => deleteTask(task.id)} title="Delete">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="glass-card planner-column">
          <div className="column-header">
            <span className="column-title">⚡ In Progress ({tasks.filter(t => t.status === 'in-progress').length})</span>
            <span className="badge badge-cyan">Active</span>
          </div>

          <div className="task-list mt-3">
            {tasks.filter(t => t.status === 'in-progress').map((task) => (
              <div key={task.id} className="glass-card task-item-card active-border">
                <div className="task-meta-row">
                  <span className="badge badge-cyan">{task.subject}</span>
                  <span className={`priority-tag ${task.priority}`}>{task.priority}</span>
                </div>
                <h4 className="task-title mt-2">{task.title}</h4>
                <div className="task-footer mt-3">
                  <span className="due-date">⏱️ {task.dueDate}</span>
                  <div className="task-actions">
                    <button className="btn-action" onClick={() => moveTask(task.id, 'completed')} title="Mark Done">✅</button>
                    <button className="btn-action danger" onClick={() => deleteTask(task.id)} title="Delete">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Completed */}
        <div className="glass-card planner-column">
          <div className="column-header">
            <span className="column-title">✅ Completed ({tasks.filter(t => t.status === 'completed').length})</span>
            <span className="badge badge-success">Done</span>
          </div>

          <div className="task-list mt-3">
            {tasks.filter(t => t.status === 'completed').map((task) => (
              <div key={task.id} className="glass-card task-item-card completed-opacity">
                <div className="task-meta-row">
                  <span className="badge badge-success">{task.subject}</span>
                </div>
                <h4 className="task-title mt-2 strike-through">{task.title}</h4>
                <div className="task-footer mt-3">
                  <span className="due-date">🎉 Done</span>
                  <button className="btn-action danger" onClick={() => deleteTask(task.id)} title="Delete">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="glass-card modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Study Task</h3>
            <form onSubmit={handleAddTask} className="mt-3">
              <div className="form-group">
                <label>Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Read Chapter 5 Notes"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Subject</label>
                <select value={newTaskSubject} onChange={(e) => setNewTaskSubject(e.target.value)}>
                  <option value="Chemistry">Organic Chemistry</option>
                  <option value="Physics">Quantum Physics</option>
                  <option value="Math">Calculus III</option>
                  <option value="Computer Science">Computer Science</option>
                </select>
              </div>

              <div className="form-group">
                <label>Priority Level</label>
                <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value)}>
                  <option value="high">High 🔴</option>
                  <option value="medium">Medium 🟡</option>
                  <option value="low">Low 🟢</option>
                </select>
              </div>

              <div className="modal-actions mt-4">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

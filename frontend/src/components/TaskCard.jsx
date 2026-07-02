import { FiEdit2, FiTrash2, FiCalendar } from 'react-icons/fi';

const priorityStyles = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
};

const statusStyles = {
  pending: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
};

const statusLabels = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'completed') return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
};

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const overdue = isOverdue(task.due_date, task.status);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-800 break-words">{task.title}</h3>
        <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${priorityStyles[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 line-clamp-3">{task.description}</p>
      )}

      <div className="flex items-center justify-between flex-wrap gap-2 mt-auto pt-2">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          className={`text-xs font-medium px-2 py-1 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-primary-400 ${statusStyles[task.status]}`}
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        {task.due_date && (
          <span className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
            <FiCalendar size={13} />
            {new Date(task.due_date).toLocaleDateString()}
            {overdue && ' (overdue)'}
          </span>
        )}
      </div>

      <div className="flex justify-end gap-2 border-t border-gray-100 pt-2">
        <button
          onClick={() => onEdit(task)}
          className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-primary-600"
        >
          <FiEdit2 size={14} /> Edit
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-red-600"
        >
          <FiTrash2 size={14} /> Delete
        </button>
      </div>
    </div>
  );
};

export default TaskCard;

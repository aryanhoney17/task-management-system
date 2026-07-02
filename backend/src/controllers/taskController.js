const { pool } = require('../config/db');

const ALLOWED_STATUS = ['pending', 'in_progress', 'completed'];
const ALLOWED_PRIORITY = ['low', 'medium', 'high'];

// @desc    Get all tasks for logged-in user (supports search, filters, sorting, pagination)
// @route   GET /api/tasks
// @access  Private
// Query params: search, status, priority, dueBefore, dueAfter, sortBy, order, page, limit
const getTasks = async (req, res, next) => {
  try {
    const {
      search = '',
      status,
      priority,
      dueBefore,
      dueAfter,
      sortBy = 'created_at',
      order = 'DESC',
      page = 1,
      limit = 10,
    } = req.query;

    const allowedSort = ['created_at', 'due_date', 'priority', 'title', 'status'];
    const sortColumn = allowedSort.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const conditions = ['user_id = ?'];
    const params = [req.user.id];

    if (search) {
      conditions.push('(title LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (status && ALLOWED_STATUS.includes(status)) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (priority && ALLOWED_PRIORITY.includes(priority)) {
      conditions.push('priority = ?');
      params.push(priority);
    }
    if (dueBefore) {
      conditions.push('due_date <= ?');
      params.push(dueBefore);
    }
    if (dueAfter) {
      conditions.push('due_date >= ?');
      params.push(dueAfter);
    }

    const whereClause = conditions.join(' AND ');

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const offset = (pageNum - 1) * limitNum;

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM tasks WHERE ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    const [rows] = await pool.query(
      `SELECT * FROM tasks WHERE ${whereClause} ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    res.json({
      success: true,
      data: rows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description = '', status = 'pending', priority = 'medium', due_date = null } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    if (status && !ALLOWED_STATUS.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }
    if (priority && !ALLOWED_PRIORITY.includes(priority)) {
      return res.status(400).json({ success: false, message: 'Invalid priority value' });
    }

    const [result] = await pool.query(
      `INSERT INTO tasks (user_id, title, description, status, priority, due_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, title.trim(), description, status, priority, due_date]
    );

    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const [existing] = await pool.query(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const current = existing[0];
    const {
      title = current.title,
      description = current.description,
      status = current.status,
      priority = current.priority,
      due_date = current.due_date,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title cannot be empty' });
    }
    if (status && !ALLOWED_STATUS.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }
    if (priority && !ALLOWED_PRIORITY.includes(priority)) {
      return res.status(400).json({ success: false, message: 'Invalid priority value' });
    }

    await pool.query(
      `UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, due_date = ?
       WHERE id = ? AND user_id = ?`,
      [title.trim(), description, status, priority, due_date, req.params.id, req.user.id]
    );

    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get task statistics for dashboard
// @route   GET /api/tasks/stats/summary
// @access  Private
const getTaskStats = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
  `SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
      SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) AS high_tasks,
      SUM(CASE WHEN due_date < CURDATE() AND status <> 'completed' THEN 1 ELSE 0 END) AS overdue
   FROM tasks
   WHERE user_id = ?`,
  [req.user.id]
);
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
};

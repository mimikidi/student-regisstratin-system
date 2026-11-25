const pool = require("../config/db");

// GET ADMIN DASHBOARD STATISTICS
exports.getDashboardStats = async (req, res) => {
  try {
    const students = await pool.query("SELECT COUNT(*) FROM students");

    const courses = await pool.query("SELECT COUNT(*) FROM courses");

    const departments = await pool.query("SELECT COUNT(*) FROM departments");

    const pending = await pool.query(
      "SELECT COUNT(*) FROM registrations WHERE status = 'pending'",
    );

    res.status(200).json({
      success: true,
      message: "Admin dashboard statistics",
      data: {
        totalStudents: Number(students.rows[0].count),
        totalCourses: Number(courses.rows[0].count),
        totalDepartments: Number(departments.rows[0].count),
        pendingRegistrations: Number(pending.rows[0].count),
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard statistics",
    });
  }
};

// GET ALL STUDENTS
exports.getAllStudents = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        s.id,
        s.student_number,
        s.phone,
        s.gender,
        u.full_name,
        u.email,
        d.department_name
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN departments d ON s.department_id = d.id
      ORDER BY s.id DESC
    `);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve students",
    });
  }
};

// GET ALL COURSE REGISTRATIONS
exports.getAllRegistrations = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        r.id AS registration_id,
        u.full_name,
        u.email,
        s.student_number,
        c.course_code,
        c.course_name,
        sem.semester_name,
        sem.academic_year,
        r.status,
        r.registration_date
      FROM registrations r
      JOIN students s ON r.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN courses c ON r.course_id = c.id
      JOIN semesters sem ON r.semester_id = sem.id
      ORDER BY r.id DESC
    `);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve registrations",
    });
  }
};

// APPROVE OR REJECT REGISTRATION
exports.updateRegistrationStatus = async (req, res) => {
  try {
    const { status, rejection_reason } = req.body;
    const { id } = req.params;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected",
      });
    }

    if (status === "rejected" && !rejection_reason?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a rejection reason",
      });
    }

    const result = await pool.query(
      `UPDATE registrations
       SET status = $1,
           approved_by = $2,
           approved_at = NOW(),
           rejection_reason = $3
       WHERE id = $4
       RETURNING *`,
      [
        status,
        req.user.id,
        status === "rejected" ? rejection_reason.trim() : null,
        id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Registration ${status} successfully`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update registration",
    });
  }
};

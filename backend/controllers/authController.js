const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// STUDENT REGISTER
exports.register = async (req, res) => {
  try {
    const { full_name, email, password, student_number, phone, department_id } =
      req.body;

    if (!full_name || !email || !password || !student_number) {
      return res.status(400).json({
        message: "Please fill in all required fields",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters",
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE LOWER(email) = LOWER($1)",
      [email],
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const userResult = await client.query(
        `INSERT INTO users
        (full_name, email, password, role)
        VALUES ($1, $2, $3, 'student')
        RETURNING id, full_name, email, role`,
        [full_name, email, hashedPassword],
      );

      const user = userResult.rows[0];

      const studentResult = await client.query(
        `INSERT INTO students
        (user_id, student_number, phone, department_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [user.id, student_number, phone || null, department_id || null],
      );

      await client.query("COMMIT");

      res.status(201).json({
        success: true,
        message: "Student registered successfully",
        user,
        student: studentResult.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACK");

      if (error.code === "23505") {
        return res.status(409).json({
          message: "Email or student number already exists",
        });
      }

      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Registration failed",
    });
  }
};

// LOGIN ADMIN AND STUDENT
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const result = await pool.query(
      `SELECT id, full_name, email, password, role
       FROM users
       WHERE LOWER(email) = LOWER($1)`,
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Login failed",
    });
  }
};

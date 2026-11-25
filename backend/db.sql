
-- =====================================
-- STUDENT REGISTRATION SYSTEM
-- PostgreSQL DATABASE
-- =====================================

-- 1. USER ROLES
CREATE TYPE user_role AS ENUM (
    'admin',
    'student'
);

-- 2. REGISTRATION STATUS
CREATE TYPE registration_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);

-- 3. USERS TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX users_email_unique
ON users (LOWER(email));

-- 4. DEPARTMENTS TABLE
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    department_name VARCHAR(150) NOT NULL,
    department_code VARCHAR(30) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. STUDENTS TABLE
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    student_number VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(20),
    gender VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    department_id INT,
    enrollment_date DATE DEFAULT CURRENT_DATE,

    CONSTRAINT fk_student_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_student_department
        FOREIGN KEY (department_id)
        REFERENCES departments(id)
        ON DELETE SET NULL
);

-- 6. COURSES TABLE
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    course_code VARCHAR(30) UNIQUE NOT NULL,
    course_name VARCHAR(150) NOT NULL,
    description TEXT,
    credit_hours INT NOT NULL CHECK (credit_hours > 0),
    department_id INT,

    FOREIGN KEY (department_id)
        REFERENCES departments(id)
        ON DELETE SET NULL
);

-- 7. SEMESTERS TABLE
CREATE TABLE semesters (
    id SERIAL PRIMARY KEY,
    semester_name VARCHAR(50) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    start_date DATE,
    end_date DATE,

    CHECK (end_date IS NULL OR start_date IS NULL
           OR end_date >= start_date),

    UNIQUE (semester_name, academic_year)
);

-- 8. REGISTRATIONS TABLE
CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    semester_id INT NOT NULL,

    status registration_status DEFAULT 'pending',
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    approved_by INT,
    approved_at TIMESTAMP,
    rejection_reason TEXT,

    FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE CASCADE,

    FOREIGN KEY (course_id)
        REFERENCES courses(id)
        ON DELETE RESTRICT,

    FOREIGN KEY (semester_id)
        REFERENCES semesters(id)
        ON DELETE RESTRICT,

    FOREIGN KEY (approved_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    UNIQUE (student_id, course_id, semester_id)
);

-- 9. PERFORMANCE INDEXES
CREATE INDEX idx_students_department
ON students(department_id);

CREATE INDEX idx_courses_department
ON courses(department_id);

CREATE INDEX idx_registrations_student
ON registrations(student_id);

CREATE INDEX idx_registrations_course
ON registrations(course_id);

CREATE INDEX idx_registrations_semester
ON registrations(semester_id);

CREATE INDEX idx_registrations_status
ON registrations(status);

-- =====================================
-- DATABASE CREATED SUCCESSFULLY
-- =====================================

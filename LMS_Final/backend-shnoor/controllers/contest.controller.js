import pool from "../db/postgres.js";

/* =========================
   CREATE WEEKLY CONTEST
   (Instructor)
========================= */
export const createContest = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const {
      title,
      description,
      courseId,
      duration,
      validityValue,
      validityUnit,
      passPercentage
    } = req.body;

    if (!title || !duration || !validityValue || !validityUnit) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await pool.query(
      `
      INSERT INTO exams
        (title, description, course_id, instructor_id, duration,
         validity_value, validity_unit, pass_percentage, exam_type)
      VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,'contest')
      RETURNING *
      `,
      [
        title,
        description || null,
        courseId || null,
        instructorId,
        duration,
        validityValue,
        validityUnit,
        passPercentage || null
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error("createContest error:", error.message);
    res.status(500).json({ message: error.message });
  }
};


/* =========================
   GET MY CONTESTS
   (Instructor)
========================= */
export const getMyContests = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM exams
      WHERE instructor_id = $1
        AND exam_type = 'contest'
      ORDER BY created_at DESC
      `,
      [req.user.id]
    );

    res.json(result.rows);

  } catch (error) {
    console.error("getMyContests error:", error.message);
    res.status(500).json({ message: error.message });
  }
};


/* =========================
   GET AVAILABLE CONTESTS
   (Student)
========================= */
export const getAvailableContests = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM exams
      WHERE exam_type = 'contest'
      ORDER BY created_at DESC
      `
    );

    res.json(result.rows);

  } catch (error) {
    console.error("getAvailableContests error:", error.message);
    res.status(500).json({ message: error.message });
  }
};


/* =========================
   GET CONTEST BY ID
   (Student)
========================= */
export const getContestById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM exams
      WHERE exam_id = $1
        AND exam_type = 'contest'
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Contest not found" });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error("getContestById error:", error.message);
    res.status(500).json({ message: "Failed to load contest" });
  }
};


/* =========================
   DELETE CONTEST
   (Instructor)
========================= */
export const deleteContest = async (req, res) => {
  try {
    const contestId = req.params.id;
    const instructorId = req.user.id;

    const result = await pool.query(
      `
      DELETE FROM exams
      WHERE exam_id = $1
        AND instructor_id = $2
        AND exam_type = 'contest'
      RETURNING *
      `,
      [contestId, instructorId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Contest not found or not authorized"
      });
    }

    res.json({ message: "Contest deleted successfully" });

  } catch (error) {
    console.error("deleteContest error:", error.message);
    res.status(500).json({ message: error.message });
  }
};


/* =========================
   UPDATE CONTEST
   (Instructor)
========================= */
export const updateContest = async (req, res) => {
  try {
    const contestId = req.params.id;
    const instructorId = req.user.id;

    const {
      title,
      description,
      duration,
      validityValue,
      validityUnit,
      passPercentage,
      courseId
    } = req.body;

    const result = await pool.query(
      `
      UPDATE exams
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        duration = COALESCE($3, duration),
        validity_value = COALESCE($4, validity_value),
        validity_unit = COALESCE($5, validity_unit),
        pass_percentage = COALESCE($6, pass_percentage),
        course_id = COALESCE($7, course_id)
      WHERE exam_id = $8
        AND instructor_id = $9
        AND exam_type = 'contest'
      RETURNING *
      `,
      [
        title || null,
        description || null,
        duration || null,
        validityValue || null,
        validityUnit || null,
        passPercentage || null,
        courseId || null,
        contestId,
        instructorId
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Contest not found or not authorized"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error("updateContest error:", error.message);
    res.status(500).json({ message: error.message });
  }
};


/* =========================
   ADD QUESTION TO CONTEST
   (Instructor)
========================= */
export const addQuestionToContest = async (req, res) => {
  const client = await pool.connect();

  try {
    const instructorId = req.user.id;
    const { contestId } = req.params;

    const { questionText, options } = req.body;

    if (!questionText || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        message: "Question text and at least 2 options are required"
      });
    }

    const correctCount = options.filter(o => o.isCorrect === true).length;

    if (correctCount !== 1) {
      return res.status(400).json({
        message: "Exactly one option must be marked as correct"
      });
    }

    await client.query("BEGIN");

    const contestCheck = await client.query(
      `
      SELECT exam_id
      FROM exams
      WHERE exam_id = $1
        AND instructor_id = $2
        AND exam_type = 'contest'
      `,
      [contestId, instructorId]
    );

    if (contestCheck.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "Contest not found or not authorized"
      });
    }

    const questionResult = await client.query(
      `
      INSERT INTO contest_questions (exam_id, question_text)
      VALUES ($1, $2)
      RETURNING question_id
      `,
      [contestId, questionText]
    );

    const questionId = questionResult.rows[0].question_id;

    for (const opt of options) {
      await client.query(
        `
        INSERT INTO contest_options (question_id, option_text, is_correct)
        VALUES ($1, $2, $3)
        `,
        [questionId, opt.text, opt.isCorrect === true]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Question added successfully",
      questionId
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("addQuestionToContest error:", error.message);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};


/* =========================
   GET QUESTIONS FOR STUDENT
========================= */
export const getContestQuestionsForStudent = async (req, res) => {
  try {
    const { contestId } = req.params;

    const result = await pool.query(
      `
      SELECT
        q.question_id,
        q.question_text,
        json_agg(
          json_build_object(
            'option_id', o.option_id,
            'option_text', o.option_text
          )
        ) AS options
      FROM contest_questions q
      JOIN contest_options o
        ON o.question_id = q.question_id
      WHERE q.exam_id = $1
      GROUP BY q.question_id
      ORDER BY q.question_id
      `,
      [contestId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error("getContestQuestionsForStudent error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
export const submitContestAnswers = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { contestId } = req.params;
    const { answers } = req.body;

    if (!answers || typeof answers !== "object") {
      return res.status(400).json({ message: "Answers are required" });
    }

    // get correct options from DB
    const result = await pool.query(
      `
      SELECT
        q.question_id,
        o.option_id
      FROM contest_questions q
      JOIN contest_options o
        ON o.question_id = q.question_id
      WHERE q.exam_id = $1
        AND o.is_correct = true
      `,
      [contestId]
    );

    let score = 0;
    let total = result.rows.length;

    const correctMap = {};
    for (const row of result.rows) {
      correctMap[row.question_id] = row.option_id;
    }

    for (const questionId in answers) {
      if (correctMap[questionId] === answers[questionId]) {
        score++;
      }
    }

    res.json({
      message: "Submission evaluated",
      studentId,
      contestId,
      totalQuestions: total,
      correctAnswers: score
    });

  } catch (err) {
    console.error("submitContestAnswers error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   GET RESULT FOR A SUBMISSION
   (Student)
========================= */
export const getSubmissionResult = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const result = await pool.query(
      `
      SELECT
        sa.question_id,
        sa.option_id AS selected_option_id,
        co.is_correct
      FROM contest_answers sa
      JOIN contest_options co
        ON co.option_id = sa.option_id
      WHERE sa.submission_id = $1
      `,
      [submissionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No answers found for this submission"
      });
    }

    const totalQuestions = result.rows.length;
    const correctAnswers = result.rows.filter(
      r => r.is_correct === true
    ).length;

    res.json({
      submissionId,
      totalQuestions,
      correctAnswers,
      score: correctAnswers
    });

  } catch (err) {
    console.error("getSubmissionResult error:", err.message);
    res.status(500).json({ message: err.message });
  }
};


import express from "express";

import firebaseAuth from "../middlewares/firebaseAuth.js";
import attachUser from "../middlewares/attachUser.js";
import roleGuard from "../middlewares/roleGuard.js";

import {
  createContest,
  getMyContests,
  getAvailableContests,
  getContestById,
  deleteContest,
  updateContest,
  addQuestionToContest,
  getContestQuestionsForStudent,
  submitContestAnswers
} from "../controllers/contest.controller.js";

const router = express.Router();

/* =========================
   Instructor routes
========================= */

router.post(
  "/",
  firebaseAuth,
  attachUser,
  roleGuard("instructor"),
  createContest
);

router.get(
  "/mine",
  firebaseAuth,
  attachUser,
  roleGuard("instructor"),
  getMyContests
);

router.delete(
  "/:id",
  firebaseAuth,
  attachUser,
  roleGuard("instructor"),
  deleteContest
);

router.put(
  "/:id",
  firebaseAuth,
  attachUser,
  roleGuard("instructor"),
  updateContest
);

/* =========================
   Instructor – add questions
========================= */

router.post(
  "/:contestId/questions",
  firebaseAuth,
  attachUser,
  roleGuard("instructor"),
  addQuestionToContest
);

/* =========================
   Student routes
========================= */

router.get(
  "/available",
  firebaseAuth,
  attachUser,
  roleGuard("student"),
  getAvailableContests
);

router.get(
  "/:id",
  firebaseAuth,
  attachUser,
  roleGuard("student"),
  getContestById
);

router.get(
  "/:contestId/questions",
  firebaseAuth,
  attachUser,
  roleGuard("student"),
  getContestQuestionsForStudent
);

router.post(
  "/:contestId/submit",
  firebaseAuth,
  attachUser,
  roleGuard("student"),
  submitContestAnswers
);

export default router;

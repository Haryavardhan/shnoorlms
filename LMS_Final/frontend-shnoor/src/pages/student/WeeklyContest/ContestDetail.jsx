import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../../api/axios";

const ContestDetail = () => {

  const { contestId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // selected answers
  const [answers, setAnswers] = useState({});

  // ✅ NEW – store result after submit
  const [result, setResult] = useState(null);

  useEffect(() => {

    const loadQuestions = async () => {
      try {
        const res = await api.get(
          `/api/contests/${contestId}/questions`
        );

        setQuestions(res.data);
      } catch (err) {
        console.error("Failed to load contest questions", err);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();

  }, [contestId]);

  if (loading) {
    return <div className="p-6">Loading questions...</div>;
  }

  // ✅ submit handler
  const handleSubmit = async () => {
    try {

      const payload = { answers };

      console.log("Submitting payload:", {
        contestId,
        answers
      });

      const res = await api.post(
        `/api/contests/${contestId}/submit`,
        payload
      );

      setResult(res.data);

    } catch (err) {
      console.error("Submit failed", err);
      alert("Failed to submit answers");
    }
  };

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-xl font-semibold">
        Contest Questions
      </h1>

      {questions.map((q, index) => (
        <div
          key={q.question_id}
          className="border rounded-lg p-4 space-y-3"
        >
          <div className="font-medium">
            {index + 1}. {q.question_text}
          </div>

          <div className="space-y-2">
            {q.options.map((opt) => (
              <label
                key={opt.option_id}
                className="flex items-center gap-2"
              >
                <input
                  type="radio"
                  name={q.question_id}
                  checked={answers[q.question_id] === opt.option_id}
                  onChange={() =>
                    setAnswers((prev) => ({
                      ...prev,
                      [q.question_id]: opt.option_id
                    }))
                  }
                />
                <span>{opt.option_text}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {questions.length === 0 && (
        <p className="text-slate-500">
          No questions available.
        </p>
      )}

      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Submit
      </button>

      {/* ✅ show result after submit */}
      {result && (
        <div className="mt-4 p-4 border rounded bg-green-50 space-y-1">
          <p><b>Total Questions:</b> {result.totalQuestions}</p>
          <p><b>Correct Answers:</b> {result.correctAnswers}</p>
        </div>
      )}

    </div>
  );
};

export default ContestDetail;

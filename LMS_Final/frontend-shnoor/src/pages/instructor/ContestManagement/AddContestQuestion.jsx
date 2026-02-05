import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../api/axios";

const AddContestQuestion = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();

  const [questionText, setQuestionText] = useState("");

  const [options, setOptions] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false }
  ]);

  const [saving, setSaving] = useState(false);

  const addOption = () => {
    setOptions((prev) => [...prev, { text: "", isCorrect: false }]);
  };

  const updateOptionText = (index, value) => {
    const copy = [...options];
    copy[index].text = value;
    setOptions(copy);
  };

  const markCorrect = (index) => {
    const copy = options.map((o, i) => ({
      ...o,
      isCorrect: i === index
    }));
    setOptions(copy);
  };

  const handleSave = async () => {
    if (!questionText.trim()) {
      alert("Please enter question");
      return;
    }

    if (options.some(o => !o.text.trim())) {
      alert("Please fill all options");
      return;
    }

    const correctCount = options.filter(o => o.isCorrect).length;

    if (correctCount !== 1) {
      alert("Select exactly one correct option");
      return;
    }

    try {
      setSaving(true);

      await api.post(
        `/api/contests/${contestId}/questions`,
        {
          questionText,
          options
        }
      );

      alert("Question saved");

      // ✅ clear form so next question can be added
      setQuestionText("");
      setOptions([
        { text: "", isCorrect: false },
        { text: "", isCorrect: false }
      ]);

    } catch (err) {
      console.error(err);
      alert("Failed to save question");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl p-6 space-y-6">

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          Add Contest Question
        </h1>

        <button
          onClick={() => navigate(-1)}
          className="text-blue-600"
        >
          Back
        </button>
      </div>

      <div className="space-y-2">
        <label className="font-medium">Question</label>
        <textarea
          className="w-full border rounded p-2"
          rows={4}
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        <label className="font-medium">
          Options (select correct one)
        </label>

        {options.map((opt, index) => (
          <div
            key={index}
            className="flex items-center gap-3"
          >
            <input
              type="radio"
              name="correct"
              checked={opt.isCorrect}
              onChange={() => markCorrect(index)}
            />

            <input
              type="text"
              className="flex-1 border rounded p-2"
              placeholder={`Option ${index + 1}`}
              value={opt.text}
              onChange={(e) =>
                updateOptionText(index, e.target.value)
              }
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addOption}
          className="text-green-600 text-sm"
        >
          + Add option
        </button>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 bg-indigo-600 text-white rounded"
        >
          {saving ? "Saving..." : "Save Question"}
        </button>

        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2 border rounded"
        >
          Done
        </button>
      </div>

    </div>
  );
};

export default AddContestQuestion;

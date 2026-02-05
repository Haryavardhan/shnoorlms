import React from "react";
import { Calendar, ArrowRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ContestCard = ({ contest }) => {
  const navigate = useNavigate();

  const {
    exam_id,
    title,
    description,
    duration,
    validity_value,
    validity_unit,
    status
  } = contest;

  const getStatusStyle = () => {
    if (status === "active") {
      return "bg-green-100 text-green-700 border-green-200";
    }

    if (status === "upcoming") {
      return "bg-blue-100 text-blue-700 border-blue-200";
    }

    if (status === "ended") {
      return "bg-slate-100 text-slate-500 border-slate-200";
    }

    return "bg-slate-100 text-slate-600 border-slate-200";
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group flex flex-col h-full">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">

          {/* Status badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusStyle()}`}
          >
            {status}
          </span>

          <span className="text-green-600 text-sm font-semibold bg-green-50 px-2 py-1 rounded">
            Free Entry
          </span>
        </div>

        <h3 className="text-lg font-bold text-primary-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {title}
        </h3>

        <p className="text-slate-500 text-sm mb-6 line-clamp-3 flex-1">
          {description}
        </p>

        <div className="space-y-3 text-sm text-slate-600 mb-6">

          {/* Duration */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Duration</p>
              <p className="font-semibold text-primary-900">
                {duration} minutes
              </p>
            </div>
          </div>

          {/* Validity */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">
                Valid for
              </p>
              <p className="font-semibold text-primary-900">
                {validity_value} {validity_unit}
              </p>
            </div>
          </div>

        </div>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto">
        <button
          onClick={() => navigate(`/student/contest/${exam_id}`)}
          className="w-full py-2.5 px-4 bg-white border border-slate-200 text-primary-900 font-medium rounded-lg hover:bg-primary-900 hover:text-white hover:border-primary-900 transition-all duration-200 flex items-center justify-center gap-2"
        >
          {status === "active" ? "Join Challenge" : "View Details"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ContestCard;

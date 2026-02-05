import { Routes, Route } from "react-router-dom";

import ContestList from "./ContestList";
import CreateContest from "./CreateContest";
import EditContest from "./EditContest";
import AddContestQuestion from "./AddContestQuestion";

const ContestManagement = () => {
  return (
    <Routes>
      <Route index element={<ContestList />} />
      <Route path="create" element={<CreateContest />} />
      <Route path="edit/:id" element={<EditContest />} />

      {/* Add questions to a contest */}
      <Route path=":contestId/questions/add" element={<AddContestQuestion />} />
    </Routes>
  );
};

export default ContestManagement;

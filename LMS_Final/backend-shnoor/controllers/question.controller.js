export const addQuestionToContest = async (req, res) => {
  const contestId = req.params.id;

  console.log("Contest ID:", contestId);
  console.log("Body:", req.body);

  return res.status(201).json({
    message: "Question API reached successfully",
    contestId
  });
};

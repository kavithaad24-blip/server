exports.testMessage = (req, res) => {
  res.status(200).json({
    success: true,
    msg: "Hello from the test controller! Your route is working perfectly."
  });
};

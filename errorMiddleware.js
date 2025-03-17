// errorMiddleware.js
module.exports = (err, req, res) => {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong', error: err.message });
};

function errorHandler(err, req, res) {
    console.error(err);
    res.status(500).send({ error: err.message });
}

module.exports = errorHandler;

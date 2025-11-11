// Utility functions for the server
const { ObjectId } = require('mongodb');

// Validate ObjectId
const isValidObjectId = (id) => {
  return ObjectId.isValid(id);
};

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
};

// Not found middleware
const notFound = (req, res) => {
  res.status(404).json({ error: 'Route not found' });
};

module.exports = {
  isValidObjectId,
  errorHandler,
  notFound
};
const success = (res, message, data = null, pagination = null) => {
  const response = {
    success: true,
    message,
    data,
  };

  if (pagination) {
    response.pagination = pagination;
  }

  return res.json(response);
};

module.exports = { success };

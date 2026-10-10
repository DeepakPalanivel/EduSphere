const paginate = (page = 1, limit = 12) => {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit) || 12));
  const skip = (p - 1) * l;
  return { skip, limit: l, page: p };
};

const paginatedResponse = (data, total, page, limit) => ({
  data,
  pagination: {
    total,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 12,
    totalPages: Math.ceil(total / (parseInt(limit) || 12)),
  },
});

module.exports = { paginate, paginatedResponse };

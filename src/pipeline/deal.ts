const getExclusiveDealsV2 = [
  {
    $match: { name: "xclusive-deal" },
  },
  {
    $lookup: {
      from: "product",
      localField: "product_ids",
      foreignField: "_id",
      as: "product",
    },
  },
  {
    $unwind: {
      path: "$product",
    },
  },
  {
    $lookup: {
      from: "category",
      localField: "product.category_id",
      foreignField: "_id",
      as: "category",
    },
  },
  {
    $lookup: {
      from: "product_popularity",
      localField: "product._id",
      foreignField: "product_id",
      as: "view",
    },
  },
  {
    $unwind: {
      path: "$view",
    },
  },
  {
    $project: {
      _id: 0,
      id: "$product._id",
      name: "$product.name",
      code: "$product.code",
      description: "$product.description",
      stock_quantity: "$product.stock_quantity",
      images: "$product.images",
      category: "$category",
      deal: {
        id: "$_id",
        name: "$name",
        description: "$description",
        discount_percentage: "$discount_percentage",
      },
      pricing: "$product.pricing",
      view: "$view.view_count",
    },
  },
  { $sort: { view: -1 } },
];

export { getExclusiveDealsV2 };

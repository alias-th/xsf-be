export const getAllProductsV2 = (query: {
  page: number;
  limit: number;
  sortBy?: string;
  order?: "ASC" | "DESC";
}) => {
  const skip = (query.page - 1) * query.limit;
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.order === "DESC" ? 1 : -1;
  return [
    {
      $lookup: {
        from: "product_popularity",
        localField: "_id",
        foreignField: "product_id",
        as: "view",
      },
    },
    {
      $lookup: {
        from: "deal",
        localField: "_id",
        foreignField: "product_ids",
        as: "deal",
      },
    },
    {
      $lookup: {
        from: "category",
        localField: "category_id",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: {
        path: "$view",
        preserveNullAndEmptyArrays: true,
      },
    },
    // {
    //   $unwind: {
    //     path: "$category",
    //     preserveNullAndEmptyArrays: true,
    //   },
    // },
    // {
    //   $unwind: {
    //     path: "$deal",
    //     preserveNullAndEmptyArrays: true,
    //   },
    // },
    {
      $project: {
        id: "$_id",
        _id: 0,
        name: 1,
        code: 1,
        description: 1,
        stock_quantity: 1,
        images: 1,
        pricing: 1,
        view: "$view.view_count",
        category: {
          id: { $arrayElemAt: ["$category._id", 0] },
          name: 1,
          description: 1,
          imageUrl: 1,
        },
        deal: {
          id: { $arrayElemAt: ["$deal._id", 0] },
          name: 1,
          description: 1,
          discount_percentage: 1,
        },
        createdAt: 1,
        updatedAt: 1,
      },
    },
    // { $sort: { [sortBy]: sortOrder } },
    // { $skip: skip },
    // { $limit: limit },
    {
      $facet: {
        metadata: [{ $count: "total" }], // นับจำนวนทั้งหมดที่ผ่าน Filter มา
        data: [
          { $sort: { [sortBy]: sortOrder } },
          { $skip: skip },
          { $limit: query.limit },
        ], // ดึงข้อมูลเฉพาะหน้านั้น
      },
    },
  ];
};

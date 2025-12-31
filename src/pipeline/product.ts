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

export const getAllProductsV3 = (query: {
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
        foreignField: "products.product_id",
        as: "deals",
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
    {
      $unwind: {
        path: "$category",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        active_deal: {
          $arrayElemAt: [
            {
              $filter: {
                input: "$deals",
                as: "d",
                cond: {
                  /* ใส่เงื่อนไขเพิ่ม เช่น เช็ควันหมดอายุที่นี่ได้
                 ["$$d.endDate", new Date()]
                */
                  $gt: [new Date(), 0],
                },
              },
            },
            0, // เลือกเอาดีลแรกที่เจอ
          ],
        },
      },
    },
    {
      $project: {
        _id: 0,
        id: "$_id",
        name: 1,
        code: 1,
        description: 1,
        stock_quantity: 1,
        images: 1,
        pricing: 1,
        view: {
          $ifNull: ["$view.view_count", 0],
        },
        category: {
          id: "$category._id",
          name: "$category.name",
          imageUrl: "$category.imageUrl",
          description: "$category.description",
        },
        deal: {
          id: "$active_deal._id",
          name: "$active_deal.name",
          // ค้นหาส่วนลดเฉพาะของสินค้าตัวนี้จากใน Array products
          discount_percentage: {
            // การประกาศตัวแปรชั่วคราว
            $let: {
              // สร้างตัวแปรชื่อ vars
              vars: {
                current_prod: {
                  $filter: {
                    // รายการสินค้าทั้งหมดในดีลนั้น ($active_deal.products) หากไม่มีข้อมูลให้ใช้ Array ว่าง [] เพื่อป้องกัน Error ($ifNull)
                    input: {
                      $ifNull: ["$active_deal.products", []],
                    },
                    as: "p",
                    cond: {
                      // เอาเฉพาะ Object ใน Array ที่มี product_id ตรงกับ _id
                      $eq: ["$$p.product_id", "$_id"],
                    },
                  },
                },
              },
              // ดึงค่าออกมาใช้งาน
              in: {
                $arrayElemAt: ["$$current_prod.discount_percentage", 0],
              },
            },
          },
        },
      },
    },
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

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

const getExclusiveDealsV3 = [
  {
    // 1. แตก Array products ใน Deal ออกมาก่อน เพื่อให้เหลือ 1 เอกสารต่อ 1 สินค้าในดีล
    $unwind: {
      path: "$products",
    },
  },
  {
    // 2. นำ product_id จากรายการที่แตกออกมา ไปดึงข้อมูลสินค้าตัวจริง
    $lookup: {
      from: "product",
      localField: "products.product_id",
      foreignField: "_id",
      as: "current_product",
    },
  },
  {
    $unwind: "$current_product",
  },
  {
    // 3. ดึงหมวดหมู่ของสินค้านั้นๆ
    $lookup: {
      from: "category",
      localField: "current_product.category_id",
      foreignField: "_id",
      as: "category",
    },
  },
  {
    $unwind: {
      path: "$category",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    // 4. ดึงสถิติการเข้าชม
    $lookup: {
      from: "product_popularity",
      localField: "current_product._id",
      foreignField: "product_id",
      as: "view",
    },
  },
  {
    $unwind: {
      path: "$view",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    // 5. จัดโครงสร้าง
    $project: {
      _id: 0,
      id: "$current_product._id",
      name: "$current_product.name",
      code: "$current_product.code",
      description: "$current_product.description",
      stock_quantity: "$current_product.stock_quantity",
      images: "$current_product.images",
      category: {
        name: "$category.name",
        imageUrl: "$category.imageUrl",
      },
      deal: {
        id: "$_id",
        name: "$name",
        // ค่านี้จะถูกต้องเสมอเพราะเรา unwind มาจากจุดเริ่มต้น
        discount_percentage: "$products.discount_percentage",
      },
      pricing: "$current_product.pricing",
      view: {
        $ifNull: ["$view.view_count", 0],
      },
    },
  },
];

export { getExclusiveDealsV2, getExclusiveDealsV3 };

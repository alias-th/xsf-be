import { FastifyReply, FastifyRequest } from "fastify";
import { appDataSource } from "../datasource";
import { ProductPopularity } from "../entities/product_popularity.entity";

export const getProductPopularity = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { limit } = request.query as { limit?: string };

    const limitCount = limit ? parseInt(limit) : 10;

    const productPopularityRepository =
      appDataSource.getMongoRepository(ProductPopularity);

    const result = await productPopularityRepository
      .aggregate([
        {
          $sort: { view_count: -1 },
        },
        {
          $limit: limitCount,
        },
        {
          // To convert product_id string to ObjectId
          $addFields: {
            product_oid: { $toObjectId: "$product_id" },
          },
        },
        {
          $lookup: {
            from: "product",
            localField: "product_oid",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          // To deconstruct the array returned by $lookup
          $unwind: {
            path: "$product",
          },
        },
        {
          $project: {
            _id: 0,
            view_count: 1,
            id: { $toString: "$product._id" },
            name: "$product.name",
            code: "$product.code",
            description: "$product.description",
            price: "$product.price",
            category_id: "$product.category_id",
            stock_quantity: "$product.stock_quantity",
            images: "$product.images",
            pricing: "$product.pricing",
            createdAt: "$product.createdAt",
            updatedAt: "$product.updatedAt",
          },
        },
      ])
      .toArray();

    return reply.status(200).send({ data: result });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ message: "Internal Server Error" });
  }
};

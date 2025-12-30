import { FastifyReply, FastifyRequest } from "fastify";
import { appDataSource } from "../datasource";
import { Product } from "../entities/product.entity";
import { ObjectId } from "mongodb";
import { Deal } from "../entities/deal.entity";
import * as dealPipeline from "../pipeline/deal";

interface CreateDealReq {
  name: string;
  description: string;
  discount_percentage: number;
  product_ids: string[];
}
export const create = async (
  request: FastifyRequest<{ Body: CreateDealReq }>,
  reply: FastifyReply
) => {
  const { name, description, discount_percentage, product_ids } = request.body;

  // Validate product IDs
  try {
    const bsonIds = product_ids.map((id) => new ObjectId(id));
    const products = await appDataSource
      .getMongoRepository(Product)
      .find({ where: { _id: { $in: bsonIds } } });

    if (products.length !== bsonIds.length) {
      request.log.error(
        { expected: bsonIds, found: products.length },
        "Invalid product IDs"
      );
      return reply
        .status(400)
        .send({ error: "One or more product IDs are invalid." });
    }
  } catch (error) {
    request.log.error({ error }, "Error validating product IDs");
    return reply.status(500).send({ error: "Internal server error." });
  }

  const newDeal = new Deal();
  newDeal.name = name;
  newDeal.description = description;
  newDeal.discount_percentage = discount_percentage;
  newDeal.product_ids = product_ids.map((id) => {
    return new ObjectId(id);
  });

  // Save the new deal
  try {
    await appDataSource.manager.save(newDeal);
  } catch (error) {
    request.log.error({ error }, "Error saving new deal");
    return reply.status(500).send({ error: "Internal server error." });
  }

  return reply.status(201).send({ message: "Create deal successfully." });
};

export const getExclusiveDealsV2 = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const dealRepository = appDataSource.getMongoRepository(Deal);
  try {
    const products = await dealRepository
      .aggregate(dealPipeline.getExclusiveDealsV2)
      .toArray();
    const newProducts = [];
    for (const product of products) {
      newProducts.push(product);
    }
    const response = {
      ...newProducts[0].deal,
      products: newProducts,
    };
    return reply.status(200).send({ data: response });
  } catch (error) {
    request.log.error({ error }, "Error fetching exclusive deals");
    reply.status(500).send({ error: "Internal server error." });
  }
};

export const getExclusiveDeals = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { limit } = request.query as {
    limit?: string;
  };
  const dealRepository = appDataSource.getMongoRepository(Deal);
  const productRepository = appDataSource.getMongoRepository(Product);

  // getting deals
  let deal: Deal[] = [];
  try {
    deal = await dealRepository.find({
      where: { name: "xclusive-deal" },
      take: limit ? parseInt(limit) : 10,
    });
  } catch (error) {
    request.log.error({ error }, "Error fetching exclusive deals");
    return reply.status(500).send({ error: "Internal server error." });
  }

  // applying new format
  const allProductIds = deal.flatMap((deal) => deal.product_ids);
  const uniqueProductIds = Array.from(new Set(allProductIds)).flatMap(
    (id) => new ObjectId(id)
  );
  const uniqueProductIdsStrings = uniqueProductIds.map((id) => id.toString());

  request.log.info({ uniqueProductIds }, "Unique product IDs for deals");

  // getting products
  let products: Product[] = [];
  try {
    products = await productRepository.find({
      where: { _id: { $in: uniqueProductIds } },
    });
    request.log.info({ products }, "[ Debug ] Fetched products for deals");
  } catch (error) {
    request.log.error({ error }, "Error fetching products for deals");
    return reply.status(500).send({ error: "Internal server error." });
  }

  // formatting result
  const result = deal.map((deal) => {
    return {
      ...deal,
      product_ids: undefined,
      products: products.filter((product) => {
        return uniqueProductIdsStrings.includes(product.id.toString());
      }),
    };
  });

  return reply.status(200).send({ data: result });
};

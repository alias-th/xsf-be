import { FastifyReply, FastifyRequest } from "fastify";
import { Category } from "../entities/category.entity";
import { appDataSource } from "../datasource";

interface CreateCategoryReq {
  name: string;
  description: string;
}

export const getAllCategories = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const categoryRepository = appDataSource.getMongoRepository(Category);

  const query = request.query as {
    page?: string;
    limit?: string;
    sortBy?: string;
    order?: "ASC" | "DESC";
  };
  const page = parseInt(query.page || "1");
  const limit = parseInt(query.limit || "10");
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy || "createdAt";

  try {
    const [categories, totalCount] = await categoryRepository.findAndCount({
      order: {
        [sortBy]: query.order || "DESC",
      },
      skip,
      take: limit,
    });
    const totalPages = Math.ceil(totalCount / limit);

    reply.code(200).send({
      data: categories,
      pagination: {
        total_items: totalCount,
        total_pages: totalPages,
        current_page: page,
        per_page: limit,
        has_next_page: page < totalPages,
        has_previous_page: page > 1,
      },
    });
  } catch (error) {
    request.log.error({ error }, "Error fetching categories from database");
    reply.status(500).send({ error: "Internal server error." });
  }
};

export const create = async (
  request: FastifyRequest<{ Body: CreateCategoryReq }>,
  reply: FastifyReply
) => {
  const { name, description } = request.body;

  const newCategory = new Category();
  newCategory.name = name;
  newCategory.description = description;

  try {
    await appDataSource.manager.save(newCategory);
  } catch (error) {
    request.log.error({ error }, "Error saving category to database");
    reply.status(500).send({ error: "Internal server error." });
    return;
  }

  reply.code(201).send({
    message: "Create category successfully.",
    data: {
      id: newCategory.id,
    },
  });
};

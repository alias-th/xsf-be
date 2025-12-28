import { FastifyReply, FastifyRequest } from "fastify";
import { Category } from "../entities/category.entity";
import { appDataSource } from "../datasource";

interface CreateCategoryReq {
  name: string;
  description: string;
}
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

  reply.code(201).send({ message: "Create category successfully." });
};

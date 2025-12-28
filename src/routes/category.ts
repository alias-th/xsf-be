import { FastifyInstance } from "fastify";
import * as categoryController from "../controllers/category";
import * as categorySchema from "../schemas/category";
import Joi from "joi";

const categoryRoutes = async function (fastify: FastifyInstance) {
  fastify.post(
    "/",
    {
      schema: { body: categorySchema.create },
      validatorCompiler: ({ schema }) => {
        return (data: any) => (schema as unknown as Joi.Schema).validate(data);
      },
    },
    categoryController.create
  );
};

export default categoryRoutes;

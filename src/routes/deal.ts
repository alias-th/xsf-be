import { FastifyInstance } from "fastify";
import * as dealController from "../controllers/deal";
import * as dealSchema from "../schemas/deal";
import Joi from "joi";

const dealRoute = async function (fastify: FastifyInstance) {
  fastify.post(
    "/",
    {
      schema: { body: dealSchema.create },
      validatorCompiler: ({ schema }) => {
        return (data: any) => (schema as unknown as Joi.Schema).validate(data);
      },
    },
    dealController.create
  );

  fastify.get("/exclusive", dealController.getExclusiveDeals);
};

export default dealRoute;

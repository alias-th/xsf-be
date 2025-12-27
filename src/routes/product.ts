import { FastifyInstance } from "fastify";
import * as transactionController from "../controllers/products";

const productRoutes = async function (fastify: FastifyInstance) {
  fastify.post("/create", transactionController.addProduct);
};

export default productRoutes;

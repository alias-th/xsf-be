import { FastifyInstance } from "fastify";
import * as productController from "../controllers/products";
import * as productPopularityController from "../controllers/product_popularity";
import * as productSchema from "../schemas/product";
import Joi from "joi";

const productRoutes = async function (fastify: FastifyInstance) {
  fastify.get("/", productController.getAllProductsV2);
  fastify.get("/:id", productController.getProductById);
  fastify.get("/popularity", productPopularityController.getProductPopularity);
  fastify.get("/search", productController.searchProducts);
  fastify.post("/", productController.addProduct);
  fastify.patch(
    "/:id",
    {
      schema: { body: productSchema.update },
      validatorCompiler: ({ schema }) => {
        return (data: any) => (schema as unknown as Joi.Schema).validate(data);
      },
    },
    productController.updateProduct
  );
  fastify.delete("/:id", productController.deleteProduct);
};

export default productRoutes;

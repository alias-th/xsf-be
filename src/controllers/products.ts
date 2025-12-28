import { FastifyReply, FastifyRequest } from "fastify";
import { saveUploadedFile, uploadToS3 } from "../utils/s3";
import * as productSchema from "../schemas/product";
import * as fileSchema from "../schemas/file";
import { Product } from "../entities/product.entity";
import { appDataSource } from "../datasource";
import { ProductPopularity } from "../entities/product_popularity.entity";
import { ObjectId } from "mongodb";

interface CreateProductReq {
  name: string;
  code: string;
  price: number;
}

// NOTE: This function handles adding a new product, including file uploads and database storage.
// TODO: Should use transactions for atomicity.
// TODO: Use streaming instead of buffering entire files in memory.
const addProduct = async (
  request: FastifyRequest<{ Body: CreateProductReq }>,
  reply: FastifyReply
) => {
  // Ensure the request is multipart
  if (!request.isMultipart || !request.isMultipart()) {
    reply.code(400).send({ error: "multipart/form-data required" });
    return;
  }

  // Parse multipart form data
  const fields: { [key: string]: unknown } = {};
  const files: Array<{
    filename: string;
    mimetype?: string;
    buffer: Buffer;
    size?: number;
  }> = [];

  for await (const part of request.parts()) {
    if (part.type === "file") {
      const buf = await part.toBuffer();
      files.push({
        filename: part.filename || "file",
        mimetype: part.mimetype,
        buffer: buf,
        size: buf.length,
      });
    } else {
      fields[part.fieldname] = part.value;
    }
  }

  // Validate fields
  const { error, value: validatedFields } =
    productSchema.create.validate(fields);
  if (error) {
    reply.code(400).send({ error: error.details[0].message });
    return;
  }

  // Validate files
  if (files.length === 0) {
    reply.code(400).send({ error: "At least one file is required." });
    return;
  }
  for (const file of files) {
    const { error: fileError } = fileSchema.file.validate({ file });
    if (fileError) {
      reply.code(400).send({ error: fileError.details[0].message });
      return;
    }
  }

  // Save uploaded files
  let savedFiles: string[] = [];
  try {
    savedFiles = await saveUploadedFile(files, reply);
  } catch (error) {
    request.log.error({ error }, "Error saving uploaded files");
    reply.code(500).send({ error: "Internal server error." });
    return;
  }

  // Upload to s3
  let uploadedUrls: string[] = [];
  try {
    uploadedUrls = await uploadToS3(request.server.s3, {
      filepaths: savedFiles,
      bucketName: request.server.config.S3_BUCKET_NAME,
      publicUrl: request.server.config.S3_PUBLIC_URL,
    });
  } catch (error) {
    request.log.error({ error }, "Error uploading files to S3");
    reply.code(500).send({ error: "Internal server error." });
    return;
  }

  // Save product to database
  const product = new Product();
  product.name = validatedFields.name as string;
  product.code = validatedFields.code as string;
  product.description = (validatedFields.description as string) ?? "";
  product.category_id = (validatedFields.category_id as string) ?? "";
  product.stock_quantity = (validatedFields.stock_quantity as number) ?? 1;
  product.pricing = {
    price_per_unit: (validatedFields.price as number) ?? 0,
    unit_label: (validatedFields.unit_label as string) ?? "mm",
  };
  product.images = uploadedUrls;
  product.createdAt = new Date();
  product.updatedAt = new Date();
  try {
    await appDataSource.manager.save(product);
  } catch (error) {
    request.log.error({ error }, "Error saving product to database");
    reply.code(500).send({ error: "Internal server error." });
    return;
  }

  // Save product popularity database
  const newPopularityProduct = new ProductPopularity();
  newPopularityProduct.product_id = product.id;
  newPopularityProduct.view_count = 0;
  try {
    await appDataSource.manager.save(newPopularityProduct);
  } catch (error) {
    request.log.error({ error }, "Error saving popularity product to database");
    reply.code(500).send({ error: "Internal server error." });
    return;
  }

  // Respond with success
  reply.code(201).send({ message: "Create product successfully." });
};

const getProductById = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const { id } = request.params;

  if (!id) {
    reply.code(400).send({ error: "Product ID is required." });
    return;
  }
  const productId = new ObjectId(id);
  const productRepository = appDataSource.getMongoRepository(Product);
  const productPopularityRepository =
    appDataSource.getMongoRepository(ProductPopularity);

  let product: Product | null;
  try {
    product = await productRepository.findOne({ where: { _id: productId } });
    if (!product) {
      reply.code(404).send({ error: "Product not found." });
      return;
    }
    // Increment view count
    await productPopularityRepository.updateOne(
      { product_id: productId },
      { $inc: { view_count: 1 } },
      { upsert: true }
    );
  } catch (error) {
    request.log.error({ error }, "Error fetching product from database");
    reply.code(500).send({ error: "Internal server error." });
    return;
  }

  reply.code(200).send({ ...product });
};

const getAllProducts = async (request: FastifyRequest, reply: FastifyReply) => {
  const productRepository = appDataSource.getMongoRepository(Product);
  const query = request.query as {
    page?: string;
    limit?: string;
    sortBy?: string;
  };

  const page = parseInt(query.page || "1");
  const limit = parseInt(query.limit || "10");
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy || "createdAt";

  try {
    const [products, totalCount] = await productRepository.findAndCount({
      order: {
        [sortBy]: "DESC",
      },
      take: limit,
      skip: skip,
    });

    const totalPages = Math.ceil(totalCount / limit);

    reply.code(200).send({
      data: products,
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
    request.log.error(error);
    reply.code(500).send({ error: "Internal server error" });
  }
};

const updateProduct = async (
  request: FastifyRequest<{
    Params: { id: string };
    Body: Partial<CreateProductReq>;
  }>,
  reply: FastifyReply
) => {
  const { id } = request.params;
  const { code, name, price } = request.body;

  try {
    const productRepository = appDataSource.getMongoRepository(Product);
    const productId = new ObjectId(id);
    const product = await productRepository.findOne({
      where: { _id: productId },
    });
    if (!product) {
      reply.code(404).send({ error: "Product not found." });
      return;
    }
    await productRepository.updateOne(
      { _id: productId },
      {
        $set: {
          code: code,
          name: name,
          "pricing.price_per_unit": price,
          updatedAt: new Date(),
        },
      }
    );

    const updatedProduct = await productRepository.findOneBy({
      _id: productId,
    });
    return reply.code(200).send(updatedProduct);
  } catch (error) {
    request.log.error({ error }, "Error updating product");
    reply.code(500).send({ error: "Internal server error." });
    return;
  }
};

const deleteProduct = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const { id } = request.params;
  try {
    const productRepository = appDataSource.getMongoRepository(Product);
    const productId = new ObjectId(id);
    const product = await productRepository.findOne({
      where: { _id: productId },
    });
    if (!product) {
      reply.code(404).send({ error: "Product not found." });
      return;
    }
    await productRepository.deleteOne({ _id: productId });
    return reply.code(200).send({ message: "Product deleted successfully." });
  } catch (error) {
    request.log.error({ error }, "Error deleting product");
    reply.code(500).send({ error: "Internal server error." });
    return;
  }
};

const searchProducts = async (
  request: FastifyRequest<{
    Querystring: { q?: string; page?: string; limit?: string };
  }>,
  reply: FastifyReply
) => {
  const { q, page = "1", limit = "10" } = request.query;
  const productRepository = appDataSource.getMongoRepository(Product);

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  try {
    let filter: any = {};
    if (q) {
      filter = {
        $or: [
          { name: { $regex: q, $options: "i" } },
          { code: { $regex: q, $options: "i" } },
        ],
      };
    }

    const [products, totalCount] = await productRepository.findAndCount({
      where: filter,
      take: limitNum,
      skip: skip,
      order: { createdAt: "DESC" },
    });

    const totalPages = Math.ceil(totalCount / limitNum);

    return reply.send({
      data: products,
      pagination: {
        total_items: totalCount,
        total_pages: totalPages,
        current_page: pageNum,
        per_page: limit,
        has_next_page: pageNum < totalPages,
        has_previous_page: pageNum > 1,
      },
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: "Internal server error" });
  }
};

export {
  addProduct,
  getProductById,
  getAllProducts,
  updateProduct,
  deleteProduct,
  searchProducts,
};

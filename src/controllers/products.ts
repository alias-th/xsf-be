import { FastifyReply, FastifyRequest } from "fastify";
import { saveUploadedFile, uploadToS3 } from "../utils/s3";
import * as productSchema from "../schemas/product";
import * as fileSchema from "../schemas/file";
import { Product } from "../entities/product.entity";
import { appDataSource } from "../datasource";

interface CreateProductBody {
  name: string;
  code: string;
  price: number;
}

const addProduct = async (
  request: FastifyRequest<{ Body: CreateProductBody }>,
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
    reply.code(500).send({ error: "Failed to save uploaded files" });
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
    reply.code(500).send({ error: "Failed to upload files to S3" });
    return;
  }

  // Save product to database
  const product = new Product();
  product.name = validatedFields.name as string;
  product.code = validatedFields.code as string;
  product.price = validatedFields.price as number;
  product.images = uploadedUrls;
  product.createdAt = new Date();
  product.updatedAt = new Date();

  try {
    await appDataSource.manager.save(product);
  } catch (error) {
    request.log.error({ error }, "Error saving product to database");
    reply.code(500).send({ error: "Failed to save product to database" });
    return;
  }

  // Respond with success
  reply
    .code(200)
    .send({ message: "Create product successfully.", files: uploadedUrls });
};

export { addProduct };

import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyEnv from "@fastify/env";
import productRoute from "./routes/product";
import categoryRoute from "./routes/category";
import multipart from "@fastify/multipart";
import s3Storage from "./plugins/s3-storage";
import dealRoute from "./routes/deal";

const envOptions = {
  dotenv: true,
  schema: {
    type: "object",
    required: ["PORT", "MONGODB_HOST", "MONGODB_PORT", "MONGODB_DATABASE"],
    properties: {
      PORT: {
        type: "string",
      },
      MONGODB_HOST: {
        type: "string",
      },
      MONGODB_PORT: {
        type: "string",
      },
      MONGODB_DATABASE: {
        type: "string",
      },
      S3_ACCOUNT_ID: {
        type: "string",
      },
      S3_ACCESS_KEY_ID: {
        type: "string",
      },
      S3_SECRET_ACCESS_KEY: {
        type: "string",
      },
      S3_BUCKET_NAME: {
        type: "string",
      },
      S3_PUBLIC_URL: {
        type: "string",
      },
    },
  },
};

async function buildApp() {
  let logger;

  if (process.stdout.isTTY) {
    logger = {
      transport: {
        target: "pino-pretty",
      },
    };
  } else {
    logger = true;
  }

  const fastify = Fastify({ logger, bodyLimit: 50 * 1024 * 1024 });
  await fastify.register(cors);
  await fastify.register(fastifyEnv, envOptions);

  fastify.register(multipart, {
    limits: { files: 5 * 1024 * 1024 },
  });

  fastify.register(s3Storage, {
    ACCOUNT_ID: fastify.config.S3_ACCOUNT_ID,
    ACCESS_KEY_ID: fastify.config.S3_ACCESS_KEY_ID!,
    SECRET_ACCESS_KEY: fastify.config.S3_SECRET_ACCESS_KEY!,
  });

  // Register routes
  const apiVersion = "/v1";
  fastify.register(productRoute, { prefix: `${apiVersion}/products` });
  fastify.register(categoryRoute, { prefix: `${apiVersion}/categories` });
  fastify.register(dealRoute, { prefix: `${apiVersion}/deals` });

  // Set error handlers
  fastify.setErrorHandler(async function (error: any, request, reply) {
    request.log.error({ error });
    reply.code(error.statusCode ?? 500);
    return { error: { message: error.message, statusCode: error.statusCode } };
  });
  fastify.setNotFoundHandler(async (_request, reply) => {
    reply.code(404);
    return { error: { message: "Route is not found." } };
  });

  return fastify;
}

export default buildApp;

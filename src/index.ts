import "reflect-metadata";

import buildApp from "./app";
import closeWithGrace from "close-with-grace";
import { appDataSource } from "./datasource";
import { S3Client } from "@aws-sdk/client-s3";

declare module "fastify" {
  interface FastifyInstance {
    s3: S3Client;
    config: {
      PORT: string;
      MONGODB_URI: string;
      S3_ACCOUNT_ID: string;
      S3_ACCESS_KEY_ID: string;
      S3_SECRET_ACCESS_KEY: string;
      S3_BUCKET_NAME: string;
      S3_PUBLIC_URL: string;
    };
  }
}

const start = async () => {
  try {
    await appDataSource.initialize();
    console.log("Data Source has been initialized!");
  } catch (error) {
    console.error("Error during Data Source initialization:", error);
    process.exit(1);
  }

  const app = await buildApp();
  const port = parseInt(process.env.PORT || "8080");
  app.listen({ port, host: "0.0.0.0" }, function (err) {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
  });

  closeWithGrace(async ({ signal, err, manual }) => {
    if (err) {
      app.log.error({ err }, "server closing with error");
    } else {
      app.log.info(`${signal} received, server closing`);
    }

    await app.close();
  });
};

start();

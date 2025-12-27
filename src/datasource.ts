import { DataSource, Transaction } from "typeorm";
import { Product } from "./entities/product.entity";
import dotenv from "dotenv";

dotenv.config();

function initDatabase() {
  const inValidEnv =
    !process.env.MONGODB_HOST ||
    !process.env.MONGODB_PORT ||
    !process.env.MONGODB_DATABASE;

  if (inValidEnv) {
    throw new Error("Must provide host and port!");
  }

  const port = Number(process.env.MONGODB_PORT ?? 27017);
  const host = process.env.MONGODB_HOST ?? "localhost";
  const database = process.env.MONGODB_DATABASE ?? "xsf";
  const uri = `mongodb://${process.env.MONGO_ROOT_USER}:${process.env.MONGO_ROOT_PASSWORD}@${host}:${port}/${database}?authSource=admin`;
  const dataSource = new DataSource({
    type: "mongodb",
    url: uri,
    entities: [Product],
    logging: true,
    synchronize: process.env.NODE_ENV !== "production",
  });

  return dataSource;
}

export const appDataSource = initDatabase();

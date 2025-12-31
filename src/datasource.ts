import { DataSource, Transaction } from "typeorm";
import dotenv from "dotenv";

import { Product } from "./entities/product.entity";
import { Category } from "./entities/category.entity";
import { Deal } from "./entities/deal.entity";
import { ProductPopularity } from "./entities/product_popularity.entity";

dotenv.config();

function initDatabase() {
  const uri = process.env.MONGODB_URI ?? `mongodb://localhost:27017`;
  const dataSource = new DataSource({
    type: "mongodb",
    url: uri,
    entities: [Product, Category, Deal, ProductPopularity],
    logging: true,
    synchronize: process.env.NODE_ENV !== "production",
  });

  return dataSource;
}

export const appDataSource = initDatabase();

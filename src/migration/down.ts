import { appDataSource } from "../datasource";
import { Category } from "../entities/category.entity";
import { Deal } from "../entities/deal.entity";
import { Product } from "../entities/product.entity";
import { ProductPopularity } from "../entities/product_popularity.entity";

const runMigrationDown = async () => {
  try {
    const connection = await appDataSource.initialize();
    await connection.getMongoRepository(Product).clear();
    await connection.getMongoRepository(Deal).clear();
    await connection.getMongoRepository(Category).clear();
    await connection.getMongoRepository(ProductPopularity).clear();

    await connection.destroy();
    console.log("Migration down completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error during migration down:", error);
    process.exit(1);
  }
};

runMigrationDown();

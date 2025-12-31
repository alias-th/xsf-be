import { appDataSource } from "../datasource";
import category from "../data/category.json";
import product from "../data/product.json";
import deal from "../data/deal.json";
import popularity from "../data/product_popularity.json";
import { ObjectId } from "mongodb";
import { Category } from "../entities/category.entity";
import { Product } from "../entities/product.entity";
import { Deal } from "../entities/deal.entity";
import { ProductPopularity } from "../entities/product_popularity.entity";

const runUpMigration = async () => {
  try {
    const connection = await appDataSource.initialize();
    const catData = category.map((cat) => {
      return {
        ...cat,
        _id: new ObjectId(cat._id),
      };
    });
    const prodData = product.map((prod) => {
      return {
        ...prod,
        _id: new ObjectId(prod._id),
        category_id: new ObjectId(prod.category_id),
      };
    });
    const dealData = deal.map((d) => {
      return {
        ...d,
        _id: new ObjectId(d._id),
        products: d.products.map((p: any) => ({
          product_id: new ObjectId(p.product_id as string),
          discount_percentage: p.discount_percentage,
        })),
      };
    });
    const popularityData = popularity.map((pop) => {
      return {
        ...pop,
        _id: new ObjectId(pop._id),
        product_id: new ObjectId(pop.product_id),
      };
    });

    await connection.getMongoRepository(Category).insertMany(catData);
    await connection.getMongoRepository(Product).insertMany(prodData);
    await connection.getMongoRepository(Deal).insertMany(dealData);
    await connection
      .getMongoRepository(ProductPopularity)
      .insertMany(popularityData);

    await connection.destroy();
    console.log("Migration up completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

runUpMigration();

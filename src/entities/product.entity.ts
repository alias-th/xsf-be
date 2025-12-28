import { Entity, ObjectIdColumn, ObjectId, Column, Index } from "typeorm";

class Pricing {
  @Column({ type: "double" })
  price_per_unit: number;

  @Column({ type: "string" })
  unit_label: string;
}

@Entity()
export class Product {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({ type: "string" })
  @Index()
  name: string;

  @Column({ type: "string" })
  @Index({ unique: true })
  code: string;

  @Column({ type: "string" })
  description: string;

  @Column({ type: "double" })
  price: number;

  @Column({ type: "string" })
  category_id: string;

  @Column({ type: "int" })
  stock_quantity: number;

  @Column({ type: "array" })
  images: string[];

  @Column(() => Pricing)
  pricing: Pricing;

  @Column({ type: "date" })
  createdAt: Date;

  @Column({ type: "date" })
  updatedAt: Date;

  // toJSON() {
  //   return {
  //     id: this.id.toString(),
  //     name: this.name,
  //     code: this.code,
  //     description: this.description,
  //     price: this.price,
  //     category_id: this.category_id,
  //     stock_quantity: this.stock_quantity,
  //     images: this.images,
  //     pricing: this.pricing,
  //     createdAt: this.createdAt,
  //     updatedAt: this.updatedAt,
  //   };
  // }
}

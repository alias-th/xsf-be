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

  @Column({ type: "string" })
  category_id: ObjectId;

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
}

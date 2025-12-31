import { Entity, ObjectIdColumn, ObjectId, Column } from "typeorm";

export class DealProduct {
  @Column({ type: "string" })
  product_id: ObjectId;

  @Column({ type: "int" })
  discount_percentage: number;
}

@Entity()
export class Deal {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({ type: "array" })
  products: DealProduct[];

  @Column({ type: "string" })
  name: string;

  @Column({ type: "string" })
  description: string;

  // @Column({ type: "int" })
  // discount_percentage: number;
}

import { Entity, ObjectIdColumn, ObjectId, Column } from "typeorm";

@Entity()
export class Product {
  @ObjectIdColumn()
  id: ObjectId;
  @Column({ type: "string" })
  name: string;

  @Column({ type: "string" })
  code: string;

  @Column({ type: "string" })
  description: string;

  @Column({ type: "double" })
  price: number;

  @Column({ type: "string" })
  category: string;

  @Column({ type: "int" })
  stock_quantity: number;

  @Column({ type: "boolean" })
  is_popular: boolean;

  @Column({ type: "array" })
  images: string[];

  @Column({ type: "date" })
  createdAt: Date;

  @Column({ type: "date" })
  updatedAt: Date;
}

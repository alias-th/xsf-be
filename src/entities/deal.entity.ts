import { Entity, ObjectIdColumn, ObjectId, Column } from "typeorm";

@Entity()
export class Deal {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({ type: "array" })
  product_ids: ObjectId[];

  @Column({ type: "string" })
  name: string;

  @Column({ type: "string" })
  description: string;

  @Column({ type: "int" })
  discount_percentage: number;
}

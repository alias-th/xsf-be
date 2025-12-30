import { Entity, ObjectIdColumn, ObjectId, Column } from "typeorm";

@Entity()
export class ProductPopularity {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({ type: "string" })
  product_id: ObjectId;

  @Column({ type: "int" })
  view_count: number;
}

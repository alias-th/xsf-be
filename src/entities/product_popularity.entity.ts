import { Entity, ObjectIdColumn, ObjectId, Column } from "typeorm";

@Entity()
export class ProductPopularity {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({ type: "string" })
  product_id: ObjectId;

  @Column({ type: "int" })
  view_count: number;

  // toJSON() {
  //   return {
  //     id: this.id.toString(),
  //     product_id: this.product_id.toString(),
  //     view_count: this.view_count,
  //   };
  // }
}

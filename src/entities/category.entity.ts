import { Entity, ObjectIdColumn, ObjectId, Column } from "typeorm";

@Entity()
export class Category {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({ type: "string" })
  name: string;

  @Column({ type: "string" })
  description: string;
}

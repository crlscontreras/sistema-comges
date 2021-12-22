import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity({ name: "emails" })
export class Email {
  @PrimaryColumn()
  id: number;

  @Column()
  establecimiento: string;

  @Column()
  categoria: string;

  @Column()
  nombre: string;

  @Column()
  email: string;

  @Column()
  programa: string;
}

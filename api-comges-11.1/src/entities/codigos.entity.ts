import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity({ name: "codigoscie10" })
export class Codigos {
  @PrimaryColumn()
  codigo: string;

  @Column()
  descripcion: string;

  @Column()
  edadminima: number;

  @Column()
  edadmaxima: number;

  @Column()
  programa: string;
}

import { Entity, Column, PrimaryColumn, OneToMany } from "typeorm";
import { AtencionesUrgencia } from "./atencionesUrgencia.entity";
import { AtencionesPrimaria } from "./atencionesPrimaria.entity";

@Entity()
export class Personas {
  @PrimaryColumn()
  rut: string;

  @Column()
  cp: string;

  @Column()
  cesfam: string;

  @Column()
  nombre: string;

  @Column()
  apellidopaterno: string;

  @Column()
  apellidomaterno: string;

  @Column()
  fechanacimiento: string;

  @Column()
  sexo: string;

  @Column()
  prevision: string;

  @Column()
  direccion: string;

  @Column()
  comuna: string;

  @OneToMany(
    () => AtencionesUrgencia,
    (atencionUrgencia) => atencionUrgencia.persona,
  )
  atencionesUrgencia: AtencionesUrgencia[];

  @OneToMany(
    () => AtencionesPrimaria,
    (atencionPrimaria) => atencionPrimaria.persona,
  )
  atencionesPrimaria: AtencionesPrimaria[];
}

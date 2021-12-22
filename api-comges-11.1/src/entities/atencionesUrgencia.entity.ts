import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { Personas } from "./personas.entity";

@Entity({ name: "atencionesurgencia" })
export class AtencionesUrgencia {
  @PrimaryColumn()
  ndau: string;

  //esto es necesario por el Joincolumn, para ponerle nombre, si no quedaría "personaRut"
  @ManyToOne(() => Personas, (persona) => persona.atencionesUrgencia, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "rut" })
  persona: Personas;

  @Column()
  codespecialidad: string;

  @Column()
  especialidad: string;

  @Column()
  motivo: string;

  @Column()
  coddiagnostico: string;

  @Column()
  diagnostico: string;

  @Column()
  diagnosticosecundario: string;

  @Column()
  fechahoraatencion: string;

  @Column()
  fechahoraegreso: string;

  @Column()
  establecimientourgencia: string;
}

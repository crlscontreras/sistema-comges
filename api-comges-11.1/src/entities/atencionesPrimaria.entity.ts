import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { Personas } from "./personas.entity";
/*
CREATE TABLE AtencionesPrimaria(
	id INT PRIMARY KEY NOT NULL,
	rut VARCHAR(255) NOT NULL,
	establecimientoAPS VARCHAR(255),
	codDiagDerivacion VARCHAR(255),
	diagDerivacion VARCHAR(255),
	fechaDerivacion VARCHAR(255),
	fechaAgendamiento VARCHAR(255),
	fechaAtencionEfectiva VARCHAR(255),
	FOREIGN KEY(rut)
		REFERENCES Personas(rut)
);
*/
@Entity({ name: "atencionesprimaria" })
export class AtencionesPrimaria {
  @PrimaryColumn()
  id: string;

  //esto es necesario por el Joincolumn, para ponerle nombre, si no quedaría "personaRut"
  @ManyToOne(() => Personas, (persona) => persona.atencionesPrimaria, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "rut" }, { name: "comuna" }])
  persona: Personas;

  @Column()
  establecimientoaps: string;

  @Column()
  coddiagderivacion: string;

  @Column()
  diagderivacion: string;

  @Column()
  fechaderivacion: string;

  @Column()
  fechaagendamiento: string;
}

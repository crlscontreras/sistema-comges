import { Module } from "@nestjs/common";
import { InformeController } from "./informe.controller";
import { InformeService } from "./informe.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Personas } from "src/entities/personas.entity";
import { AtencionesUrgencia } from "src/entities/atencionesUrgencia.entity";
import { AtencionesPrimaria } from "src/entities/atencionesPrimaria.entity";
import { CodigosModule } from "src/codigos/codigos.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Personas,
      AtencionesUrgencia,
      AtencionesPrimaria,
    ]),
    CodigosModule,
  ],
  controllers: [InformeController],
  providers: [InformeService],
  exports: [InformeService],
})
export class InformeModule {}

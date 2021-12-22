import { Module } from "@nestjs/common";
import { ResumenController } from "./resumen.controller";
import { ResumenService } from "./resumen.service";
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
  controllers: [ResumenController],
  providers: [ResumenService],
  exports: [ResumenService],
})
export class ResumenModule {}

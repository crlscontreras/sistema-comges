import { Module } from "@nestjs/common";
import { CodigosService } from "./codigos.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Codigos } from "src/entities/codigos.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Codigos])],
  providers: [CodigosService],
  exports: [CodigosService],
})
export class CodigosModule {}

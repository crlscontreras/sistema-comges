import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
//import { AppService } from './app.service';
import { InformeModule } from "./informe/informe.module";
import { ResumenModule } from "./resumen/resumen.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmailModule } from "./email/email.module";
import { CodigosModule } from "./codigos/codigos.module";
//plataforma_comges_11_1

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    InformeModule,
    ResumenModule,
    EmailModule,
    CodigosModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

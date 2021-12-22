import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Email } from "src/entities/email.entity";
import { InformeModule } from "src/informe/informe.module";
import { EmailController } from "./email.controller";
import { EmailService } from "./email.service";

@Module({
  imports: [TypeOrmModule.forFeature([Email]), InformeModule],
  controllers: [EmailController],
  providers: [EmailService],
})
export class EmailModule {}

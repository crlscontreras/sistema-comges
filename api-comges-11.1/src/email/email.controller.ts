import { Controller, Get, Header } from "@nestjs/common";
import { EmailService } from "./email.service";

@Controller("email")
export class EmailController {
  constructor(private readonly emailService: EmailService) {}
  @Get("/emailDesam")
  @Header("Content-Type", "application/json")
  async enviarEmailDesam() {
    await this.emailService.emailDesam();
    return { estado: "Enviado" };
  }
}

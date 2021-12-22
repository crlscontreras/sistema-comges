import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  getDataResumenTodo(): string {
    return "Hello World";
  }
}

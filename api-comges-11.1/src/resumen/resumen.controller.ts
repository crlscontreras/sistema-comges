import { Controller, Get, Header, Param } from "@nestjs/common";
import { ResumenService } from "./resumen.service";

/*
  Todos los parametros son Strings.
  Las fechas iniciales y finales las recibe como entero (porque son milisegundos)
  pero simplemente se pasan como un String (para luego en "resumen.service" convertirlas a una fecha).
*/

@Controller("resumen")
export class ResumenController {
  constructor(private readonly resumenService: ResumenService) {}
  @Get("/listaDeNombres/:comuna")
  @Header("Content-Type", "application/json")
  async getDataListaNombres(@Param("comuna") comuna: string) {
    try {
      //console.log("primer controller ", comuna);
      return await this.resumenService.getDataListaNombres(comuna);
    } catch (err) {
      console.log(err);
    }
  }

  @Get("/listaContadorTodo/:inicial/:final/:comuna")
  @Header("Content-Type", "application/json")
  async getDataResumenTodoFecha(
    @Param("inicial") inicial: string,
    @Param("final") final: string,
    @Param("comuna") comuna: string,
  ) {
    try {
      console.log("segundo controller ");

      return await this.resumenService.getDataResumenTodoFecha(
        inicial,
        final,
        comuna,
      );
    } catch (err) {
      console.log(err);
    }
  }

  @Get("/listaContadorUnico/:dispositivo/:inicial/:final")
  @Header("Content-Type", "application/json")
  getDataResumenUnico(
    @Param("dispositivo") dispositivo: string,
    @Param("inicial") inicial: string,
    @Param("final") final: string,
  ) {
    console.log("tercer controller ");
    return this.resumenService.getDataResumenUnico(dispositivo, inicial, final);
  }
}

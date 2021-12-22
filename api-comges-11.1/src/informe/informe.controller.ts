import { Controller, Get, Header, Param } from "@nestjs/common";
import { InformeService } from "./informe.service";

@Controller("informe")
export class InformeController {
  constructor(private readonly informeService: InformeService) {}
  @Get("/derivacion/:establecimiento/:mes/:anio")
  @Header("Content-Type", "application/json")
  getInformePorMes(
    @Param("establecimiento") establecimiento: string,
    @Param("mes") mes: string,
    @Param("anio") anio: string,
  ) {
    return this.informeService.getInformePorMes(establecimiento, mes, anio);
  }
  @Get("/derivacion/:establecimiento/:dia/:mes/:anio")
  @Header("Content-Type", "application/json")
  getInformePorDia(
    @Param("establecimiento") establecimiento: string,
    @Param("dia") dia: string,
    @Param("mes") mes: string,
    @Param("anio") anio: string,
  ) {
    return this.informeService.getInformePorDia(
      establecimiento,
      dia,
      mes,
      anio,
    );
  }

  @Get("/noAtendidos/:inicio/:fin")
  @Header("Content-Type", "application/json")
  getNoDerivadosTodos(
    @Param("inicio") inicio: string,
    @Param("fin") fin: string,
  ) {
    return this.informeService.getInformeAPNoEfectivas(
      null,
      null,
      null,
      inicio,
      fin,
    );
  }

  @Get("/noAtendidos/:establecimiento/:inicio/:fin")
  @Header("Content-Type", "application/json")
  getNoDerivadosEstablecimiento(
    @Param("establecimiento") establecimiento: string,
    @Param("inicio") inicio: string,
    @Param("fin") fin: string,
  ) {
    return this.informeService.getInformeAPNoEfectivas(
      establecimiento,
      null,
      null,
      inicio,
      fin,
    );
  }

  @Get("/noRegion/")
  @Header("Content-Type", "application/json")
  getNoPertenecientesRegion() {
    return this.informeService.getNoPertenecenRegion();
  }

  @Get("/sinAsignacion/")
  @Header("Content-Type", "application/json")
  getSinAsignacion() {
    return this.informeService.getSinAsignacion();
  }
}

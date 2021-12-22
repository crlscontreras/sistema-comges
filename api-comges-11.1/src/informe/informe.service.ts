import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AtencionesUrgencia } from "src/entities/atencionesUrgencia.entity";
import { Repository } from "typeorm";
import * as moment from "moment";
import CodigosCIE10 from "src/utilities/codigosCIE10";
import { AtencionesPrimaria } from "src/entities/atencionesPrimaria.entity";
import { CodigosService } from "src/codigos/codigos.service";

//REVISAR LOS CONTROLADORES PARA SABER LOS TIPOS DE DATOS jej
@Injectable()
export class InformeService {
  constructor(
    @InjectRepository(AtencionesUrgencia)
    private atencionesUrgenciaRepo: Repository<AtencionesUrgencia>,
    @InjectRepository(AtencionesPrimaria)
    private atencionesPrimariasRepo: Repository<AtencionesPrimaria>,
    private codigosService: CodigosService,
  ) {}

  /*
    Esta funcion aplica los filtros de fecha, establecimiento y ent para los informes de derivacion
    establecimiento: string
    modoFiltrado es un string que puede ser "mes" o "dia"
    fecha, si modoFiltrado es "mes"-> [mes(MM), anio(YYYY)], si es "dia"-> [dia(DD),mes(MM), anio(YYYY)]
  */
  private async filtrarDatosDerivacion(
    establecimiento,
    modoFiltrado: string,
    fecha: string[],
  ) {
    //ojo con la sintaxis donde dice relations, sin esto no carga los datos de la persona (hace como un left join)
    const atencionesCompletas = await this.atencionesUrgenciaRepo.find({
      relations: ["persona"],
    });
    let atencionesFiltradas: any[] = [];
    let fechaFiltrado;
    let modoFiltradoIngles;

    //aqui se genera la fecha y se asigna a una variable, basado en lo que aparece en el parametro, fecha
    if (modoFiltrado === "mes") {
      //estos modoFiltrado serviran despues para comparar las fechas en el filtro
      modoFiltradoIngles = "month";
      const mes = fecha[0];
      const anio = fecha[1];
      fechaFiltrado = moment(mes + "-" + anio, "MM-YYYY");
    } else if (modoFiltrado === "dia") {
      modoFiltradoIngles = "day";
      const dia = fecha[0];
      const mes = fecha[1];
      const anio = fecha[2];
      fechaFiltrado = moment(dia + "-" + mes + "-" + anio, "DD-MM-YYYY");
    }

    //el primer filtro es por fecha y por cesfam
    //asi se reduce en gran medida la cantidad de datos que tienen que pasar por
    //el siguiente filtro, que es del codigo comges
    atencionesFiltradas = atencionesCompletas.filter((atencion) => {
      const fechaAtencion = moment(
        atencion.fechahoraatencion,
        "DD/MM/YYYY HH-mm",
      );

      const cesfamPersona = atencion.persona.cesfam
        ? atencion.persona.cesfam
        : "SIN ASIGNAR";
      return (
        fechaFiltrado.isSame(fechaAtencion, modoFiltradoIngles) &&
        cesfamPersona.toLowerCase().trim() ===
          establecimiento.toLowerCase().trim()
      );
    });

    //aqui como la funcion de codigos CIE10 ahora es asincronica, se deben sacar los resultados por separado
    //si no, la promesa nunca se resuelve y el filtro no funciona
    const resultadosCodigos = [];
    for (const atencion of atencionesFiltradas) {
      //primero se hace la consulta a la funcion correspondiente, que consulta a la base de datos
      const codigo = await this.codigosService.encontrarCodigo(
        atencion.coddiagnostico,
      );
      //luego se hace la consulta a la funcion estatica que verifica si se cumple la condicion para aplicar el codigo(edad)
      const resultado = await CodigosCIE10.isCodigoComges11(
        codigo, //codigo debe ser un objeto obtenido de la consulta a la base de datos
        atencion.persona.fechanacimiento,
        moment(atencion.fechahoraatencion, "DD/MM/YYYY HH-mm"),
      );
      //el resultado que se obtiene es un true o false
      resultadosCodigos.push(resultado);
    }

    let index = -1;

    //resultados codigos contiene un trueo o false, que es correlativo con atencionesFiltradas
    //por eso, solo hace falta filtrar y retornar resultadosCodigos en la posicion del indice
    atencionesFiltradas = atencionesFiltradas.filter(() => {
      index++;
      return resultadosCodigos[index];
    });

    //ahora se le agrega el programa asignado para cada codigo, ya que estamos seguros
    //que todos los datos de atencionesfiltradas son comges
    const atencionesConPrograma = [];
    for (const atencion of atencionesFiltradas) {
      const programa = await this.codigosService.obtenerProgramaDeCodigo(
        atencion.coddiagnostico,
      );
      atencionesConPrograma.push({ ...atencion, programa: programa.programa });
    }
    atencionesFiltradas = atencionesConPrograma;

    //estas son las atenciones listas pero sin formato
    return atencionesFiltradas;
  }

  //recibe object con los datos (resultado de datosFiltrados)
  private formatearDatosDerivacion(datos) {
    //arreglo que contiene los datos despues del filtro
    const datosFormateados = [];
    //los formatos de fecha y hora se declaran antes de cualquier cosa
    const formatoFechaHora = "DD/MM/YYYY hh:mm";
    const formatoFecha = "DD/MM/YYYY";

    datos.forEach((element) => {
      //se obtiene la hora de ingreso en formato de la libreria moment
      const momentIngreso = moment(element.fechahoraatencion, formatoFechaHora);
      console.log("la hora de ing es: ", momentIngreso);
      //la hora de egreso tambien...
      const momentEgreso = moment(element.fechahoraegreso, formatoFechaHora);
      //para calcular la diferencia entre los egreso e ingreso en formato de minutos ("minute")
      const tiempoRespuesta = momentEgreso.diff(momentIngreso, "minute");
      //tambien se obtiene la fecha de nacimiento en formato de la libreria moment
      const momentFechaNac = moment(
        element.persona.fechanacimiento,
        formatoFecha,
      );
      //la edad se calcula al momento de ingresar a la atencion (momentIngreso)
      //esta funcion es la diferencia en años entre la fecha de nacimiento y la fecha de ingreso a la consulta de urgencia
      const edad = momentIngreso.diff(momentFechaNac, "years");
      //se obtiene el objeto con el formato del informe (lo que requiere la aplicacion de react)
      console.log(element.programa);
      const nuevaAtencion = {
        atencion: element.fechahoraatencion,
        egreso: element.fechahoraegreso,
        tiempoRespuesta: tiempoRespuesta,
        ndau: element.ndau,
        nombres: element.persona.nombre,
        apPaterno: element.persona.apellidopaterno,
        apMaterno: element.persona.apellidomaterno,
        rut: element.persona.rut,
        fechaNac: element.persona.fechanacimiento,
        edad: edad,
        establecimientoUrgencia: element.establecimientourgencia,
        codDiag: element.coddiagnostico,
        diag: element.diagnostico,
        programa: element.programa,
      };
      //y se agrega a los datos formateados
      datosFormateados.push(nuevaAtencion);
    });

    //estos datos estan listos para ser enviados como respuesta a la consulta
    return datosFormateados;
  }

  //esta funcion es invocada por la ruta del controlador
  async getInformePorMes(establecimiento: string, mes: string, anio: string) {
    //obtiene los datos filtrados
    const datosFiltrados = await this.filtrarDatosDerivacion(
      establecimiento,
      "mes",
      [mes, anio],
    );
    //y con los datos filtrados obtiene los datos en el formato
    const datosFormateados = this.formatearDatosDerivacion(datosFiltrados);
    //para retornar un objeto con un titulo y los datos en "res"
    return {
      title: "Informe Mensual",
      res: datosFormateados,
    };
  }

  //esta funcion es invocada por la ruta del controlador, funciona igual que getInformePorMes
  async getInformePorDia(
    establecimiento: string,
    dia: string,
    mes: string,
    anio: string,
  ) {
    const datosFiltrados = await this.filtrarDatosDerivacion(
      establecimiento,
      "dia",
      [dia, mes, anio],
    );
    const datosFormateados = this.formatearDatosDerivacion(datosFiltrados);
    return {
      title: "Informe Diario",
      res: datosFormateados,
    };
  }

  //esta funcion filtra segun los strings establecimiento, comuna, programa
  //inicio y fin solo sirven para pasarlo a otra funcion obtenerAPNoEfectivas
  private async filtrarAPNoEfectivas(
    establecimiento,
    comuna,
    programa,
    inicio,
    fin,
  ) {
    let atencionesPrimarias = await this.atencionesPrimariasRepo.find({
      relations: ["persona"],
    });
    const fechaInicial = moment(Number(inicio));
    const fechaFinal = moment(Number(fin));
    const formatoFecha = "DD/MM/YYYY HH:mm";

    //siempre se filtrara por, si es que tiene atencion efectiva (fue agendado), si es que esta en la fecha del informe
    atencionesPrimarias = atencionesPrimarias.filter((atencion) => {
      const fechaDerivacion = moment(atencion.fechaderivacion, formatoFecha);
      return (
        !atencion.fechaagendamiento &&
        fechaDerivacion.isBetween(fechaInicial, fechaFinal, undefined, "[]")
      );
    });

    //aqui revisa si es que el codigo es comges, filtrando de forma similar que en filtrarDatosDerivacion
    const resultadosCodigos = [];
    for (const atencion of atencionesPrimarias) {
      const codigo = await this.codigosService.encontrarCodigo(
        atencion.coddiagderivacion,
      );
      const resultado = await CodigosCIE10.isCodigoComges11(
        codigo,
        atencion.persona.fechanacimiento,
        moment(atencion.fechaderivacion, "formatoFecha"),
      );
      resultadosCodigos.push(resultado);
    }
    let index = -1;

    atencionesPrimarias = atencionesPrimarias.filter(() => {
      index++;
      return resultadosCodigos[index];
    });

    //ahora se le agrega el programa asignado para cada codigo, ya que estamos seguros
    //que todos los datos de atencionesfiltradas son comges
    const atencionesConPrograma = [];
    for (const atencion of atencionesPrimarias) {
      const programa = await this.codigosService.obtenerProgramaDeCodigo(
        atencion.coddiagderivacion,
      );
      atencionesConPrograma.push({ ...atencion, programa: programa.programa });
    }
    atencionesPrimarias = atencionesConPrograma;

    //si se especifica el establecimiento, hay que filtrar las atenciones
    if (establecimiento) {
      atencionesPrimarias = atencionesPrimarias.filter(
        (atencion) => atencion.establecimientoaps === establecimiento,
      );
    }
    //de misma forma con la comuna...
    if (comuna) {
      atencionesPrimarias = atencionesPrimarias.filter(
        (atencion) => atencion.persona.comuna === comuna,
      );
    }
    //y con el programa...
    if (programa) {
      //obtener el programa correspondiente al codigo
    }
    return atencionesPrimarias;
  }

  //funciona de la misma forma que el formateado de datos para los informes de derivacion
  private formatearAPNoEfectivas(data) {
    const dataFormateada = [];
    const formatoFecha = "DD/MM/YYYY HH:mm";
    data.forEach((element) => {
      //se necesita la fecha de derivacion y la hora actual para calcular la diferencia
      const fechaDerivacion = moment(element.fechaderivacion, formatoFecha);
      const ahora = moment();
      //aqui se calcula la diferencia, que es el tiempo que se ha demorado entre
      //la derivacion y la atencion que no se ha efectuado
      const diferenciaDerivacionHoras = ahora.diff(
        fechaDerivacion,
        "hours",
        false,
      );
      const diferenciaDerivacionDias = ahora.diff(
        fechaDerivacion,
        "days",
        false,
      );
      //se formatea igual que en las otras funciones y se retorna
      const objetoFormateado = {
        establecimientoResponsable: element.establecimientoaps,
        codDiagDerivacion: element.coddiagderivacion,
        diagDerivacion: element.diagderivacion,
        fechaDerivacion: element.fechaderivacion,
        diferenciaDerivacionHoras: diferenciaDerivacionHoras,
        diferenciaDerivacionDias: diferenciaDerivacionDias,
        rut: element.persona.rut,
        nombre: element.persona.nombre,
        apellidoPaterno: element.persona.apellidopaterno,
        apellidoMaterno: element.persona.apellidomaterno,
        direccion: element.persona.direccion,
        comuna: element.persona.comuna,
        programa: element.programa,
      };
      dataFormateada.push(objetoFormateado);
    });

    return dataFormateada;
  }

  //esta funcion es llamada por la ruta del controlador
  //esta funcion solo llama a las funciones anteriores para filtrar las atenciones primarias
  //y formatearlas
  async getInformeAPNoEfectivas(
    establecimiento,
    comuna,
    programa,
    inicio,
    fin,
  ) {
    console.log(establecimiento, comuna, programa, inicio, fin);
    const data = this.formatearAPNoEfectivas(
      await this.filtrarAPNoEfectivas(
        establecimiento,
        comuna,
        programa,
        inicio,
        fin,
      ),
    );

    return { title: "Informe no derivados", res: data };
  }

  //esta funcion formatea los "reportes de personas", es decir, que necesiten algunos datos extras para identificar a las personas
  //es usado por las funciones getSinAsignacion y getNoPertenecen region
  //es virtualmente lo mismo que la funcion formatearDatosDerivacion
  private formatearReportesPersonas(datos) {
    const datosFormateados = [];
    const formatoFechaHora = "DD/MM/YYYY hh:mm";
    const formatoFecha = "DD/MM/YYYY";
    datos.forEach((element) => {
      const momentIngreso = moment(element.fechahoraatencion, formatoFechaHora);
      const momentEgreso = moment(element.fechahoraegreso, formatoFechaHora);
      const tiempoRespuesta = momentEgreso.diff(momentIngreso, "minute");
      const momentFechaNac = moment(
        element.persona.fechanacimiento,
        formatoFecha,
      );
      const edad = momentIngreso.diff(momentFechaNac, "years");
      const nuevaAtencion = {
        atencion: element.fechahoraatencion,
        egreso: element.fechahoraegreso,
        tiempoRespuesta: tiempoRespuesta,
        ndau: element.ndau,
        nombres: element.persona.nombre,
        apPaterno: element.persona.apellidopaterno,
        apMaterno: element.persona.apellidomaterno,
        rut: element.persona.rut,
        fechaNac: element.persona.fechanacimiento,
        edad: edad,
        establecimientoUrgencia: element.establecimientourgencia,
        codDiag: element.coddiagnostico,
        diag: element.diagnostico,
        //comuna y cesfam son lo que diferencia a esta funcion de formatearDatosDerivacion
        comuna: element.persona.comuna,
        cesfam: element.persona.cesfam ? element.persona.cesfam : "SIN ASIGNAR",
        programa: element.programa,
      };
      datosFormateados.push(nuevaAtencion);
    });

    return datosFormateados;
  }

  //esta funcion busca a los pacientes que consultaron en urgencias
  //por una ent comges pero que no tienen un dispositivo de atencion primaria asignado
  async getSinAsignacion() {
    const atencionesCompletas = await this.atencionesUrgenciaRepo.find({
      relations: ["persona"],
    });

    //los unicos dos filtros son si su cesfam es null...
    let atencionesFiltradas = atencionesCompletas.filter((element) => {
      return !element.persona.cesfam;
    });

    //...y si su codigo es comges
    const resultadosCodigos = [];
    for (const atencion of atencionesFiltradas) {
      const codigo = await this.codigosService.encontrarCodigo(
        atencion.coddiagnostico,
      );
      const resultado = await CodigosCIE10.isCodigoComges11(
        codigo,
        atencion.persona.fechanacimiento,
        moment(atencion.fechahoraatencion, "DD/MM/YYYY HH-mm"),
      );
      resultadosCodigos.push(resultado);
    }

    let index = -1;
    atencionesFiltradas = atencionesFiltradas.filter(() => {
      index++;
      return resultadosCodigos[index];
    });

    //ahora se le agrega el programa asignado para cada codigo, ya que estamos seguros
    //que todos los datos de atencionesfiltradas son comges
    const atencionesConPrograma = [];
    for (const atencion of atencionesFiltradas) {
      const programa = await this.codigosService.obtenerProgramaDeCodigo(
        atencion.coddiagnostico,
      );
      atencionesConPrograma.push({ ...atencion, programa: programa.programa });
    }
    atencionesFiltradas = atencionesConPrograma;

    //formatea los datos y devuelve
    const datosFormateados =
      this.formatearReportesPersonas(atencionesFiltradas);
    return {
      title: "Pacientes sin asignacion",
      res: datosFormateados,
    };
  }

  //esta funcion busca a los pacientes que consultaron en urgencias
  //por una ent comges pero que aparecen como residentes de una comuna que no es de la cuarta region
  async getNoPertenecenRegion() {
    const atencionesCompletas = await this.atencionesUrgenciaRepo.find({
      relations: ["persona"],
    });
    //la lista de comunas es fija, si por alguna razon hay que cambiarla, aqui hay que hacerlo
    const comunas = [
      "CANELA",
      "ILLAPEL",
      "LOS VILOS",
      "SALAMANCA",
      "ANDACOLLO",
      "COQUIMBO",
      "LA HIGUERA",
      "LA SERENA",
      "PAIHUANO",
      "VICUNA",
      "COMBARBALA",
      "MONTE PATRIA",
      "OVALLE",
      "PUNITAQUI",
      "RIO HURTADO",
    ];

    let atencionesFiltradas = atencionesCompletas.filter((element) => {
      return !comunas.includes(element.persona.comuna.toUpperCase());
    });

    const resultadosCodigos = [];
    for (const atencion of atencionesFiltradas) {
      const codigo = await this.codigosService.encontrarCodigo(
        atencion.coddiagnostico,
      );
      const resultado = await CodigosCIE10.isCodigoComges11(
        codigo,
        atencion.persona.fechanacimiento,
        moment(atencion.fechahoraatencion, "DD/MM/YYYY HH-mm"),
      );
      resultadosCodigos.push(resultado);
    }

    let index = -1;

    atencionesFiltradas = atencionesFiltradas.filter(() => {
      index++;
      return resultadosCodigos[index];
    });

    const atencionesConPrograma = [];
    for (const atencion of atencionesFiltradas) {
      const programa = await this.codigosService.obtenerProgramaDeCodigo(
        atencion.coddiagnostico,
      );
      atencionesConPrograma.push({ ...atencion, programa: programa.programa });
    }
    atencionesFiltradas = atencionesConPrograma;

    const datosFormateados =
      this.formatearReportesPersonas(atencionesFiltradas);
    return {
      title: "Pacientes no pertenecientes a la región",
      res: datosFormateados,
    };
  }
}

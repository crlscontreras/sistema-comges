import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AtencionesPrimaria } from "src/entities/atencionesPrimaria.entity";
import { Repository } from "typeorm";
import * as moment from "moment";
import CodigosCIE10 from "src/utilities/codigosCIE10";
import { CodigosService } from "src/codigos/codigos.service";
//REVISAR LOS CONTROLADORES PARA SABER LOS TIPOS DE DATOS jej
@Injectable()
export class ResumenService {
  constructor(
    @InjectRepository(AtencionesPrimaria)
    private AtencionesPrimariasRepo: Repository<AtencionesPrimaria>,
    private codigosService: CodigosService,
  ) {}

  //Funcion para obtener todas las atenciones APS en el periodo
  //el conteo se hace en otra funcion
  private async filtrarDatosPrimaria(fecha: string[]) {
    //las fechas=[inicial, final] se convierten a numero entero, para despues convertirlos a Date y poder manipularlos con moment()

    //relations para cargar los datos de la persona (hace como un left join)
    //las columnas que carga son rut y comuna
    //si se quiere cargar mas columnas de la tabla personas hay que cambiar el @JoinColumn de "entities"
    const atencionesPrimCompletas = await this.AtencionesPrimariasRepo.find({
      relations: ["persona"],
    });
    let atencionesPrimFiltradas: any[] = [];

    //El String fecha que esta en milisegundos se pasa a Fecha, esta ves de tipo Moment
    //"Like the JavaScript Date, a moment object can be created from the number of milliseconds since 1970/1/1"

    const fechaInicialSinFormato = moment(Number(fecha[0]));
    const fechaInicial = moment(fechaInicialSinFormato, "DD/MM/YYYY HH-mm");

    const fechaFinalSinFormato = moment(Number(fecha[1]));
    const fechaFinal = moment(fechaFinalSinFormato, "DD/MM/YYYY HH-mm");

    //aqui filtra por fecha
    atencionesPrimFiltradas = atencionesPrimCompletas.filter((atencion) => {
      const fechaDerivacion = moment(
        atencion.fechaderivacion,
        "DD/MM/YYYY HH-mm",
      );
      return fechaDerivacion >= fechaInicial && fechaDerivacion <= fechaFinal;
    });

    //aqui filtra por ENT, la parte mas importante
    const resultadosCodigos = [];
    for (const atencion of atencionesPrimFiltradas) {
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

    atencionesPrimFiltradas = atencionesPrimFiltradas.filter(() => {
      index++;
      return resultadosCodigos[index];
    });

    //finalmente retorna todas las atenciones correctas

    return atencionesPrimFiltradas;
  }

  //obtener todos los datos de las APS con atenciones validas, no es necesario revisar por codigo ENT ni por fecha
  //esta funcion es para luego obtener los nombres de las APS
  private async obtenerDatosPrimaria() {
    //ojo con la sintaxis donde dice relations, sin esto no carga los datos de la persona (hace como un left join)
    const atencionesPrimCompletas = await this.AtencionesPrimariasRepo.find({
      relations: ["persona"],
    });

    return atencionesPrimCompletas;
  }

  //para el referente de salud
  //recibe el objeto "datosPrimaria" con todas las atenciones de las APS (resultado de la funcion filtrarDatosPrimaria)
  //y tambien recibe la fecha inicial y final del periodo
  private formatearDatos(datosPrimaria, fecha: string[]) {
    const fechaInicialSinFormato = moment(Number(fecha[0]));
    const fechaInicial = moment(fechaInicialSinFormato, "MM/DD/YYYY HH-mm");

    const fechaFinalSinFormato = moment(Number(fecha[1]));
    const fechaFinal = moment(fechaFinalSinFormato, "MM/DD/YYYY HH-mm");

    const listContadorAPS = [];

    //recorrer todas las atenciones de las APS (for each datosPrimaria) y contar las atenciones validas (++ al valor que corresponda)
    datosPrimaria.forEach((element) => {
      //console.log("Elemento formatearDatos: ", element);

      /*
        vamos a contar la cantidad de pacientes: Derivados, Agendados y No Agendados
        para eso vamos a ir actualizando los contadores de "listContadorAPS"
        "listContadorAPS" es una lista con todos los dispositivos APS
        lo que hacemos es actualizar el contador de cada dispositivos APS (dependiendo de si las condiciones se cumplen)
        por ejemplo, al comenzar esta funcion, el cesfam_1 tiene los siguientes valores:
        {
        title: "cesfam_1",
        dataCol: [0, 0, 0 ],
        }
        al finalizar la funcion, el cesfam_1 tendra los siguientes valores:
        {
        title: "cesfam_1",
        dataCol: [8, 6, 2],
        }
        esto significa que el contador cantidadDerivados++ se ejecuto 8 veces, cantidadAtendidos++ se ejecuto 6 veces y cantidadNOAtendidos++ se ejecuto 2 veces
      */

      //buscar la posicion del cesfam del element actual
      let cesfamPosition = -1;

      for (let i = 0; i < listContadorAPS.length; i++) {
        if (element.establecimientoaps === listContadorAPS[i].title) {
          //encontro el cesfam en "listContadorAPS"
          //guardamos su posicion
          cesfamPosition = i;
        }
      }
      if (cesfamPosition === -1) {
        //el nombre del cesfam todavia no esta en la lista "listContadorAPS"
        //lo agregamos
        //como es un dispositivo nuevo, su contador esta en [0, 0, 0]
        const singleObj = {};
        singleObj["title"] = element.establecimientoaps;
        singleObj["comuna"] = element.persona.comuna;
        singleObj["dataCol"] = [0, 0, 0];
        listContadorAPS.push(singleObj);
        cesfamPosition = listContadorAPS.length - 1;
      }

      //ahora chequeamos si las fechas existen
      if (
        //si la primera fecha es la unica que existe, es una atencion en la cual al paciente:
        //lo derivaron, pero no lo han contactado
        element.fechaderivacion != null &&
        element.fechaagendamiento == null
      ) {
        //No es necesario chequear si la fecha esta dentro del rango
        //ya que, en esta parte del codigo, la "fechaderivacion" siempre esta dentro del rango
        listContadorAPS[cesfamPosition].dataCol[0]++;
        listContadorAPS[cesfamPosition].dataCol[2]++;
      } else if (
        //si las 2 primeras fechas existen, es una atencion en la cual al paciente:
        //lo derivaron, lo contactaron y le agendaron una atencion
        element.fechaderivacion != null &&
        element.fechaagendamiento != null
      ) {
        const fechaAgendamiento = moment(
          element.fechaagendamiento,
          "DD/MM/YYYY HH-mm",
        );
        //luego chequear si las 2 fechas estan dentro del rango
        //si fechaagendamiento no esta dentro del rango, entonces toda la atencion no es valida, y no va en el conteo final
        if (
          fechaAgendamiento >= fechaInicial &&
          fechaAgendamiento <= fechaFinal
        ) {
          listContadorAPS[cesfamPosition].dataCol[0]++;
          listContadorAPS[cesfamPosition].dataCol[1]++;
        }
      }
    });

    //  finalmente se retorna "listContadorAPS" al frontend para desplegar los valores
    return listContadorAPS;
  }

  //Para el encargado DESAM
  //recibe el objeto "datosPrimaria" con todas las atenciones de las APS (resultado de la funcion filtrarDatosPrimaria)
  //y tambien recibe la fecha inicial y final del periodo
  private formatearDatosComuna(datosPrimaria, comuna, fecha: string[]) {
    const fechaInicialSinFormato = moment(Number(fecha[0]));
    const fechaInicial = moment(fechaInicialSinFormato, "MM/DD/YYYY HH-mm");

    const fechaFinalSinFormato = moment(Number(fecha[1]));
    const fechaFinal = moment(fechaFinalSinFormato, "MM/DD/YYYY HH-mm");

    const listContadorAPS = [];

    //recorrer todas las atenciones de las APS (for each datosPrimaria) y contar las atenciones validas (++ al valor que corresponda)
    datosPrimaria.forEach((element) => {
      //console.log("Elemento formatearDatos: ", element);

      /*
        vamos a contar la cantidad de pacientes: Derivados, Agendados y No Agendados
        para eso vamos a ir actualizando los contadores de "listContadorAPS"
        "listContadorAPS" es una lista con todos los dispositivos APS
        lo que hacemos es actualizar el contador de cada dispositivos APS (dependiendo de si las condiciones se cumplen)
        por ejemplo, al comenzar esta funcion, el cesfam_1 tiene los siguientes valores:
        {
        title: "cesfam_1",
        dataCol: [0, 0, 0 ],
        }
        al finalizar la funcion, el cesfam_1 tendra los siguientes valores:
        {
        title: "cesfam_1",
        dataCol: [8, 6, 2],
        }
        esto significa que el contador cantidadDerivados++ se ejecuto 8 veces, cantidadAtendidos++ se ejecuto 6 veces y cantidadNOAtendidos++ se ejecuto 2 veces
      */

      //buscar la posicion del cesfam del element actual
      let cesfamPosition = -1;

      //si es que la comuna solicitada coincide
      if (comuna == element.persona.comuna) {
        for (let i = 0; i < listContadorAPS.length; i++) {
          if (element.establecimientoaps === listContadorAPS[i].title) {
            //encontro el cesfam en "listContadorAPS"
            //guardamos su posicion
            cesfamPosition = i;
          }
        }
        if (cesfamPosition === -1) {
          //el nombre del cesfam todavia no esta en la lista "listContadorAPS"
          //lo agregamos
          //como es un dispositivo nuevo, su contador esta en [0, 0, 0]
          const singleObj = {};
          singleObj["title"] = element.establecimientoaps;
          singleObj["comuna"] = element.persona.comuna;
          singleObj["dataCol"] = [0, 0, 0];
          listContadorAPS.push(singleObj);
          cesfamPosition = listContadorAPS.length - 1;
        }

        //ahora chequeamos si las fechas existen
        if (
          //si la primera fecha es la unica que existe, es una atencion en la cual al paciente:
          //lo derivaron, pero no lo han contactado
          element.fechaderivacion != null &&
          element.fechaagendamiento == null
        ) {
          //No es necesario chequear si la fecha esta dentro del rango
          //ya que, en esta parte del codigo, la "fechaderivacion" siempre esta dentro del rango
          listContadorAPS[cesfamPosition].dataCol[0]++;
          listContadorAPS[cesfamPosition].dataCol[2]++;
        } else if (
          //si las 2 primeras fechas existen, es una atencion en la cual al paciente:
          //lo derivaron, lo contactaron y le agendaron una atencion
          element.fechaderivacion != null &&
          element.fechaagendamiento != null
        ) {
          const fechaAgendamiento = moment(
            element.fechaagendamiento,
            "DD/MM/YYYY HH-mm",
          );
          //luego chequear si las 2 fechas estan dentro del rango
          //si fechaagendamiento no esta dentro del rango, entonces toda la atencion no es valida, y no va en el conteo final
          if (
            fechaAgendamiento >= fechaInicial &&
            fechaAgendamiento <= fechaFinal
          ) {
            listContadorAPS[cesfamPosition].dataCol[0]++;
            listContadorAPS[cesfamPosition].dataCol[1]++;
          }
        }
      }
    });

    //  finalmente se retorna "listContadorAPS" al frontend para desplegar los valores
    return listContadorAPS;
  }

  //recibe el objeto "datosPrimaria" con todas las atenciones de las APS (resultado de la funcion obtenerDatosPrimaria)
  //y devuelve una lista con los nombres de todas las APS
  private formatearDatosNombres(datosPrimaria) {
    const list = [];
    const singleObj = {};
    singleObj["title"] = "Todos";
    list.push(singleObj);

    //por cada atencion aps
    datosPrimaria.forEach((element) => {
      //console.log("Elemento formatearDatosNombres: ", element);
      let cesfamPosition = -1;

      //ver si ya existe
      for (let i = 0; i < list.length; i++) {
        //si es que el nombre esta en la lista, entonces cesfamPosition = i
        if (element.establecimientoaps === list[i].title) {
          cesfamPosition = i;
        }
      }
      //si cesfamPosition === -1 entonces no entro en el if anterior,
      //lo cual significa que todavia no esta en la lista de nombres
      if (cesfamPosition === -1) {
        const singleObj = {};
        singleObj["title"] = element.establecimientoaps;
        list.push(singleObj);
        cesfamPosition = list.length - 1;
      }
    });

    return list;
  }

  //recibe el objeto "datosPrimaria" con todas las atenciones de las APS (resultado de la funcion obtenerDatosPrimaria)
  //y devuelve una lista con los nombres de todas las APS
  private formatearDatosNombresComuna(datosPrimaria, comuna) {
    const list = [];
    const singleObj = {};
    singleObj["title"] = "Todos";
    list.push(singleObj);

    //por cada atencion aps
    datosPrimaria.forEach((element) => {
      let cesfamPosition = -1;

      //ver si ya existe
      for (let i = 0; i < list.length; i++) {
        //si es que el nombre esta en la lista, entonces cesfamPosition = i
        if (element.establecimientoaps === list[i].title) {
          cesfamPosition = i;
        }
      }
      //si cesfamPosition === -1 entonces no entro en el if anterior,
      //lo cual significa que todavia no esta en la lista de nombres
      if (cesfamPosition === -1) {
        console.log("comuna FRONTEND: ", comuna);
        console.log("comuna backend: ", element.persona.comuna);
        //ver si pertenece a la comuna solicitada en el frontend
        if (comuna == element.persona.comuna) {
          const singleObj = {};
          singleObj["title"] = element.establecimientoaps;
          list.push(singleObj);
          cesfamPosition = list.length - 1;
        }
      }
    });

    return list;
  }

  //obtener cantidad de pacientes derivados, agendados y no agendados de todas las APS en el periodo
  async getDataResumenTodoFecha(inicial, final, comuna) {
    //obtener todas las atenciones APS en el periodo
    const datosFiltradosPrimaria = await this.filtrarDatosPrimaria([
      inicial,
      final,
    ]);
    //console.log("datosFormateados (statsbox1): ", datosFiltradosPrimaria);

    let datosFormateados = [];

    if (comuna == "Todos") {
      datosFormateados = this.formatearDatos(datosFiltradosPrimaria, [
        inicial,
        final,
      ]);
      //console.log("datosFormateados (statsbox): ", datosFormateados);
    } else {
      datosFormateados = this.formatearDatosComuna(
        datosFiltradosPrimaria,
        comuna,
        [inicial, final],
      );
      //console.log("datosFormateados (statsbox): ", datosFormateados);
    }

    return {
      res: datosFormateados,
    };
  }

  //Para vista referente Salud Coquimbo (comuna === "Todos")
  //obtener lista con los nombres de TODOS los dispositivos de la region

  //Para vista referente DESAM (comuna === algun nombre)
  //obtener lista con los nombres de los dispositivos de la comuna del referente DESAM
  async getDataListaNombres(comuna) {
    const datosFiltradosPrimaria = await this.obtenerDatosPrimaria();
    //console.log("comuna FRONTEND: ", comuna);
    let datosFormateados = [];

    if (comuna == "Todos") {
      datosFormateados = this.formatearDatosNombres(datosFiltradosPrimaria);
    } else {
      datosFormateados = this.formatearDatosNombresComuna(
        datosFiltradosPrimaria,
        comuna,
      );
    }
    return {
      res: datosFormateados,
    };
  }

  //obtener cantidad de pacientes derivados, agendados y no agendados de la APS seleccionada (cesfam) en el periodo
  async getDataResumenUnico(cesfam, inicial, final) {
    //convertir argumentos de la función a un numero, para despues convertirlos a Date y poder manipularlo

    const datosFiltradosPrimaria = await this.filtrarDatosPrimaria([
      inicial,
      final,
    ]);

    const datosFormateados = this.formatearDatos(datosFiltradosPrimaria, [
      inicial,
      final,
    ]);
    let currentCesfamPosition = -1;
    let cesfamSeleccionado = -1;

    datosFormateados.forEach((element) => {
      currentCesfamPosition++;
      //console.log("nombre que viene de la lista: ", cesfam);
      //console.log("nombre que viene de la BD: ", element.title);
      if (cesfam.valueOf() === element.title.valueOf()) {
        cesfamSeleccionado = currentCesfamPosition;
      }
    });

    if (cesfamSeleccionado != -1) {
      return {
        res: [
          {
            title: datosFormateados[cesfamSeleccionado].title,
            comuna: datosFormateados[cesfamSeleccionado].comuna,
            dataCol: datosFormateados[cesfamSeleccionado].dataCol,
          },
        ],
      };
    } else {
      return {
        res: [
          {
            title: "No hay datos del dispositivo para este periodo",
            comuna: "",
            dataCol: [0, 0, 0],
          },
        ],
      };
    }
  }
}

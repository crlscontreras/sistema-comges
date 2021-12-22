import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as nodemailer from "nodemailer";
import { Email } from "src/entities/email.entity";
import { InformeService } from "src/informe/informe.service";
import { Repository } from "typeorm";
import * as moment from "moment";
import * as ExcelJS from "exceljs";

@Injectable()
export class EmailService {
  constructor(
    @InjectRepository(Email)
    private emailRepo: Repository<Email>,
    private informeService: InformeService,
  ) {}
  
  //el enlace smtp para el envio. Esta fuera de los metodos porque equivale a logearse, y es mejor que se haga una vez.
  transporter = nodemailer.createTransport(
    `smtps://${process.env.MAIL_NAME}%40gmail.com:${process.env.MAIL_PASS}@smtp.gmail.com`,
  );

  //esta funcion recibe "datos" que son un objecto con las mismas keys que se especifican en hoja.columns
  private createExcelNoAtendidos = async (datos) => {
    //se crea el archivo y se le asigna la fecha de creacion
    const informe = new ExcelJS.Workbook();
    informe.created = new Date();
    //al archivo se le agrega una hoja llamada "resumen"
    const hoja = informe.addWorksheet("Resumen");
    //aqui se especifican las columnas de la hoja, header puede ser cualquier string pero key debe
    //tener el mismo nombre con el que aparece en el objeto "datos"
    hoja.columns = [
      {
        header: "Establecimiento Responsable",
        key: "establecimientoResponsable",
        width: 16,
      },
      { header: "codDiag", key: "codDiagDerivacion", width: 16 },
      {
        header: "Diagnóstico",
        key: "diagDerivacion",
        width: 30,
      },
      { header: "Fecha Derivación", key: "fechaDerivacion", width: 20 },
      {
        header: "Tiempo transcurrido (horas)",
        key: "diferenciaDerivacionHoras",
        width: 20,
      },
      {
        header: "Tiempo transcurrido (dias)",
        key: "diferenciaDerivacionDias",
        width: 12,
      },
      { header: "RUT", key: "rut", width: 16 },
      { header: "Nombre", key: "nombre", width: 12 },
      { header: "Apellido Paterno", key: "apellidoPaterno", width: 12 },
      { header: "Apellido Materno", key: "apellidoMaterno", width: 20 },
      { header: "Dirección", key: "direccion", width: 20 },
      { header: "Comuna", key: "comuna", width: 48 },
      { header: "Programa", key: "programa", width: 48 },
    ];
    //aqui se le pone el estilo a la primera fila, los "Header" con color azul y letras en negrita y blanco
    hoja.getRow(1).font = { bold: true, color: { argb: "FFFFFF" } }; // la primera fila está en negrita
    hoja.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "000099" },
    };
    //ahora se agrega un dato por fila.
    datos.map((row) => {
      hoja.addRow(row);
      return null;
    });
    //luego se genera un buffer, que sera el que se adjunte a nodemailer
    //aprovechando el soporte directo a buffer
    const buffer = await informe.xlsx.writeBuffer();
    //se exporta el tipo de archivo
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    //y la extension
    const fileExtension = ".xlsx";
    //retornando un array con todo lo necesario para adjuntar el archivo
    return [buffer, fileType, fileExtension];
  };

  //Aqui se envia el mail de no atendidos, recibe todos los argumentos como string, excepto contenido que es un objeto
  //contenido debe tener las keys tal como se especifica en la funcion de mas arriba createExcelNoAtendidos
  private enviarMailNoAtendidos = async (
    emailEnviar,
    nombre,
    programa,
    comuna,
    contenido,
  ) => {
    //la funcion retorna un array con: [buffer(el archivo), tipo de archivo, extension de archivo]
    const excel = await this.createExcelNoAtendidos(contenido);

    //el mail propiamente tal se escribe aqui, con los parametros que se envian por la funcion.
    const mailOptions = {
      from: `${process.env.MAIL_NAME}@gmail.com`,
      to: `${emailEnviar}`,
      subject: `Informe no atendidos COMGES 11.1 programa ${programa} comuna ${comuna} `,
      text: `Saludos, ${nombre}, del programa ${programa}
      Estos son los registros de personas que no han sido atendidas todavía por ENT de COMGES 11.1 en la comuna ${comuna} `,
      attachments: [
        //este objeto contiene el archivo excel. Basta con añadir el buffer como content y la extension de archivo en el filename
        {
          filename: `InformeNoAtendidos${comuna}${excel[2]}`,
          content: excel[0],
        },
      ],
    };

    //aqui se envia, cuando recibe un error lo pasa por la consola...
    this.transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      }
      //pero si ocurre esto es que todo estuvo bien
      console.log(`Message Sent ${info.response}`);
    });
  };

  //las demas funciones para enviar mails con archivos funcionan de la misma manera que las primeras funciones de este archivo
  private createExcelNoAsignados = async (datos) => {
    const informe = new ExcelJS.Workbook();
    informe.created = new Date();
    const hoja = informe.addWorksheet("Resumen");
    hoja.columns = [
      { header: "Atencion", key: "atencion", width: 16 },
      { header: "Egreso", key: "egreso", width: 16 },
      {
        header: "Tiempo de Respuesta (minutos)",
        key: "tiempoRespuesta",
        width: 30,
      },
      { header: "NDAU", key: "ndau", width: 10 },
      { header: "Nombres", key: "nombres", width: 20 },
      { header: "Paterno", key: "apPaterno", width: 12 },
      { header: "Materno", key: "apMaterno", width: 12 },
      { header: "RUT", key: "rut", width: 16 },
      { header: "FechaNac", key: "fechaNac", width: 12 },
      { header: "Edad", key: "edad", width: 12 },
      { header: "Establecimiento", key: "establecimientoUrgencia", width: 20 },
      { header: "CodDiag", key: "codDiag" },
      { header: "Diagnostico", key: "diag", width: 48 },
      { header: "Comuna", key: "comuna", width: 48 },
      { header: "CESFAM", key: "cesfam", width: 48 },
      { header: "Programa", key: "programa", width: 48 },
    ];
    hoja.getRow(1).font = { bold: true, color: { argb: "FFFFFF" } }; // la primera fila está en negrita
    hoja.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "000099" },
    };
    datos.map((row) => {
      hoja.addRow(row);
      return null;
    });
    const buffer = await informe.xlsx.writeBuffer();
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const fileExtension = ".xlsx";
    return [buffer, fileType, fileExtension];
  };

  private enviarMailNoAsignados = async (
    emailEnviar,
    nombre,
    programa,
    comuna,
    contenido,
  ) => {
    const excel = await this.createExcelNoAsignados(contenido);

    const mailOptions = {
      from: `${process.env.MAIL_NAME}@gmail.com`,
      to: `${emailEnviar}`,
      subject: `Informe no asignados COMGES 11.1 programa ${programa} comuna ${comuna} `,
      text: `Saludos, ${nombre}, del programa ${programa}
      Estos son los registros de personas a las que no se les ha asignado un centro de atención de salud primaria en la comuna ${comuna} y que han consultado por una ENT COMGES 11.1`,
      attachments: [
        {
          filename: `InformeNoAsignados${comuna}${excel[2]}`,
          content: excel[0],
        },
      ],
    };

    this.transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      }
      console.log(`Message Sent ${info.response}`);
    });
  };

  //aqui deben obtenerse los mails, luego los informes y luego enviarlos con la funcion
  emailDesam = async () => {
    //por alguna razon, hay que hacer la consulta, no sirve usar find()
    const comunasUnicas = await this.emailRepo.query(
      "SELECT DISTINCT comuna FROM emails;",
    );

    //ahora se definen las fechas, si se quieren cambiar las fechas del informe de no atendidos, es aqui
    //por defecto es milisanio hace un año desde hoy y milisActual es la fecha actual.
    //todo pasado a milisegundos desde epoch unix
    const milisAnio = moment().subtract(1, "year").valueOf();
    const milisActual = moment().valueOf();

    //por cada comuna se genera una lista de personas que pertenecen a la comuna
    //promise.all sirve para que no se salga de la funcion hasta que se resuelvan todas las promesas (query es una funcion async)
    const personasPorComuna = await Promise.all(
      comunasUnicas.map((comuna) =>
        this.emailRepo.query(
          `SELECT * FROM EMAILS WHERE comuna='${comuna.comuna}'`,
        ),
      ),
    );
    //la funcion retorna una lista de emails por cada comuna
    //este indice sirve para iterar por la lista generado personasPorComuna
    let index = 0;

    //se obtienen los informes que iran en mails separados. Estas funciones obtienen todos los informes de todas las comunas
    //mas abajo, dentro del for, se filtran por comuna con base en estos informes.
    const informeNoAtendidos =
      await this.informeService.getInformeAPNoEfectivas(
        null,
        null,
        null,
        milisAnio,
        milisActual,
      );

    const informeNoAsignados = await this.informeService.getSinAsignacion();

    //estas listas contendran los datos que finalmente seran enviados por mail.
    //una lista tendra por ejemplo varios objetos con {mail, nombre, programa, comuna y archivo a enviar}
    //cada objeto tiene lo necesario por si solo para enviar un mail
    //por lo que basta iterar sobre estas listas para enviarlos
    const direccionesAEnviarNoAtendidos = [];
    const direccionesAEnviarNoAsignados = [];

    //aqui por cada comuna
    for (const element of comunasUnicas) {
      //se filtran los datos de los informes por cada comuna
      const informeNoAtendidosPorComuna = informeNoAtendidos.res.filter(
        (entrada) =>
          entrada.comuna.toUpperCase() === element.comuna.toUpperCase(),
      );
      const informeNoAsignadosPorComuna = informeNoAsignados.res.filter(
        (entrada) =>
          entrada.comuna.toUpperCase() === element.comuna.toUpperCase(),
      );
      //los informes solo se envian si hay alguna informacion para la comuna, si no, no pasa.
      if (informeNoAtendidosPorComuna.length) {
        console.log(
          `Enviando mail de no derivados a la comuna de ${element.comuna}`,
        );
        const personasEnviarComunaActual: any = personasPorComuna[index];
        //aqui se guarda la informacion en el arreglo correspondiente
        personasEnviarComunaActual.forEach((persona) => {
          //obtiene los datos filtrados por programa
          const contenidoArchivo = informeNoAtendidosPorComuna.filter(
            (dato) => dato.programa === persona.programa,
          );
          //solo si el programa para esa comuna tiene datos, se envia
          if (contenidoArchivo.length) {
            direccionesAEnviarNoAtendidos.push({
              mail: "brian.pardo@alumnos.ucn.cl",
              nombre: persona.nombre,
              programa: persona.programa,
              comuna: persona.comuna,
              archivo: contenidoArchivo,
            });
          }
        });
      } else {
        console.log(
          `Comuna de ${element.comuna} sin registros de no derivados, ignorando...`,
        );
      }
      //los informes solo se envian si hay alguna informacion para la comuna, si no, no pasa.
      if (informeNoAsignadosPorComuna.length) {
        console.log(
          `Enviando mail de no asignados a la comuna de ${element.comuna}`,
        );
        const personasEnviarComunaActual: any = personasPorComuna[index];
        personasEnviarComunaActual.forEach((persona) => {
          const contenidoArchivo = informeNoAsignadosPorComuna.filter(
            (dato) => dato.programa === persona.programa,
          );
          if (contenidoArchivo.length) {
            direccionesAEnviarNoAsignados.push({
              mail: "brian.pardo@alumnos.ucn.cl",
              nombre: persona.nombre,
              programa: persona.programa,
              comuna: persona.comuna,
              archivo: contenidoArchivo,
            });
          }
        });
      } else {
        console.log(
          `Comuna de ${element.comuna} sin registros de no asignados, ignorando...`,
        );
      }
      console.log(index);
      //el indice sirve para los dos ifs, asi que se tiene que aumentar aqui al final del ciclo.
      index++;
    }

    //finalmente con estos ciclos se envian los mails
    for (const element of direccionesAEnviarNoAtendidos) {
      //el timer es necesario, de otra forma, el email se bloquea por tantas solicitudes a la vez
      const timer = (ms) => new Promise((res) => setTimeout(res, ms));
      //por defecto está en 3 segundos por mail
      await timer(3000);
      this.enviarMailNoAtendidos(
        element.mail,
        element.nombre,
        element.programa,
        element.comuna,
        element.archivo,
      );
    }

    console.log(direccionesAEnviarNoAsignados)
    for (const element of direccionesAEnviarNoAsignados) {
      const timer = (ms) => new Promise((res) => setTimeout(res, ms));
      await timer(3000);
      this.enviarMailNoAsignados(
        element.mail,
        element.nombre,
        element.programa,
        element.comuna,
        element.archivo,
      );
    }
  };
}

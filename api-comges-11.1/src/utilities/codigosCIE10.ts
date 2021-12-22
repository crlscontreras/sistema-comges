import * as moment from "moment";
import "cross-fetch/polyfill";
export default class CodigosCIE10 {
  /*
    CODIGOS W00-W19 -> SOLO MAYORES DE 60 AÑOS
    CODIGOS J20-J21, J40-J46 -> SOLO MENORES DE 5 AÑOS
  */

  public static isCodigoComges11 = async (
    codigo: any, //recibe un object que contiene el codigo tal como sale en la entity de email
    fechaNacimiento: string,
    fechaHoraAtencion,
  ) => {
    const codigoEncontrado = codigo;
    if (codigoEncontrado.error) return false;
    //si lo encuentra, revisar si tiene restricciones de edad
    else {
      //primero, si tiene las dos condiciones
      if (codigoEncontrado.edadminima && codigoEncontrado.edadMaxima) {
        const fechaNacimientoMoment = moment(fechaNacimiento, "DD/MM/YYYY");
        return (
          //este diff corresponde a la edad
          fechaHoraAtencion.diff(fechaNacimientoMoment, "years", false) >=
            codigoEncontrado.edadminima.valueOf() &&
          fechaHoraAtencion.diff(fechaNacimientoMoment, "years", false) <=
            codigoEncontrado.edadMaxima
        );
        //segundo, si tiene la edad minima
      } else if (codigoEncontrado.edadminima) {
        const fechaNacimientoMoment = moment(fechaNacimiento, "DD/MM/YYYY");
        return (
          fechaHoraAtencion.diff(fechaNacimientoMoment, "years", false) >=
          codigoEncontrado.edadminima.valueOf()
        );
        //luego si tiene menos que la edad maxima
      } else if (codigoEncontrado.edadMaxima) {
        const fechaNacimientoMoment = moment(fechaNacimiento, "DD/MM/YYYY");
        return (
          fechaHoraAtencion.diff(fechaNacimientoMoment, "years", false) <=
          codigoEncontrado.edadMaxima
        );
      }
      //si no entra a ningun if es que no tiene ninguna restriccion de edad
      return true;
    }
  };
}

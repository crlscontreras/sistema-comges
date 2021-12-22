//Fecha inicial y fecha final deben ser objeto clase Date
const getResumen = async (dispositivo, fechaInicial, fechaFinal, comuna) => {
  let resp = "";
  //Fecha = "dd/MM/yyyy"
  //usar .getTime() en Fecha para pasarla a milisegundos, esto es para poder pasar la fecha por URL
  //The getTime() method returns the number of milliseconds (JavaScript uses milliseconds as the unit of measurement, whereas Unix Time is in seconds)
  const inicialMili = fechaInicial.getTime();
  const finalMili = fechaFinal.getTime();

  if (dispositivo === "Todos") {
    //El usuario selecciono Todos, se muestran todos los CESFAM
    resp = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}:${process.env.REACT_APP_BACKEND_PORT}/resumen/listaContadorTodo/${inicialMili}/${finalMili}/${comuna}`,
      {
        method: "GET"
      }
    );
  } else {
    //El usuario selecciono un CESFAM en especifico
    resp = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}:${process.env.REACT_APP_BACKEND_PORT}/resumen/listaContadorUnico/${dispositivo}/${inicialMili}/${finalMili}`,
      {
        method: "GET"
      }
    );
  }

  const data = await resp.json();

  return data;
};

export default getResumen;

//los parametros son todos string
export const getInformeSSC = async (establecimiento, inicio, fin) => {
  let resp = "";
  const inicialMili = inicio.getTime();
  const finalMili = fin.getTime();

  //La ruta se llama /informe/noAtendidos porque:
  //Para el comges una "atención efectiva" es un paciente con una fecha de agendamiento
  //con estas rutas lo que hacemos es obtener los datos de los pacientes que no tengan una fecha de agendamiento
  //los pacientes "No Atendidos Efectivamente"
  if (establecimiento === "Todos") {
    resp = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}:${process.env.REACT_APP_BACKEND_PORT}/informe/noAtendidos/${inicialMili}/${finalMili}`,
      {
        method: "GET"
      }
    );
  } else {
    resp = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}:${process.env.REACT_APP_BACKEND_PORT}/informe/noAtendidos/${establecimiento}/${inicialMili}/${finalMili}`,
      {
        method: "GET"
      }
    );
  }

  const data = await resp.json();

  return data;
};

export const getReporteNoRegion = async () => {
  const resp = await fetch(
    `${process.env.REACT_APP_BACKEND_URL}:3001/informe/noRegion`,
    {
      method: "GET"
    }
  );

  const data = await resp.json();
  return data;
};

export default getInformeSSC;

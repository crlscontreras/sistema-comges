//Fecha inicial y fecha final deben ser objeto clase Date
const getNombres = async (comuna) => {
  let resp = "";
  //Opcion para obtener la lista con los nombres de los dispositivos APS,
  //para generar la dropdown list de manera dinamica de la vista Resumen de informacion
  resp = await fetch(
    `${process.env.REACT_APP_BACKEND_URL}:${process.env.REACT_APP_BACKEND_PORT}/resumen/listaDeNombres/${comuna}`,
    {
      method: "GET"
    }
  );

  const data = await resp.json();

  return data;
};

export default getNombres;

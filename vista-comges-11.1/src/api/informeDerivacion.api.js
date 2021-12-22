//los parametros son todos string
const getInforme = async (establecimiento, dia, mes, anio, modoReporte) => {
  let resp = "";
  if (modoReporte === "mes") {
    resp = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}:${process.env.REACT_APP_BACKEND_PORT}/informe/derivacion/${establecimiento}/${mes}/${anio}`,
      {
        method: "GET"
      }
    );
  } else if (modoReporte === "dia" || modoReporte === "fecha_especifica") {
    resp = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}:${process.env.REACT_APP_BACKEND_PORT}/informe/derivacion/${establecimiento}/${dia}/${mes}/${anio}`,
      {
        method: "GET"
      }
    );
  }

  const data = await resp.json();

  return data;
};

export default getInforme;

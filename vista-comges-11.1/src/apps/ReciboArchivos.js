import React, { useState } from "react";
import moment from "moment";
import Header from "../components/Header";
import SideNavbar from "../components/SideNavbar";
import { ToastContainer, toast } from "react-toastify";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import getInforme from "../api/informeDerivacion.api";

const ReciboArchivos = () => {
  const userToken = JSON.parse(sessionStorage.getItem("token"));

  const nombreUsuario = userToken.token.usuario; // esto tendria que entrar como prop desde redux
  const establecimiento = userToken.token.establecimiento;

  /*
  const [establecimiento, setEstablecimiento] = useState(
    userToken.token.establecimiento
  );
  */
  const [diaBase, setDiaBase] = useState(moment()); // el reporte se hace desde el dia ayer hacia atras
  const [maxFilasPantalla, setmaxFilasPantalla] = useState(5);
  const [modoReporte, setModoReporte] = useState("dia");

  const [fechaInicial, setFechaInicial] = useState(new Date());
  const fechaActual = new Date();
  const formatoFecha = "dd/MM/yyyy";

  const descargarArchivo = (fecha, dia, mes, anio) => async (e) => {
    e.preventDefault();
    // crear el archivo excel para llenarlo con los datos de la consulta
    const informe = new ExcelJS.Workbook();
    informe.created = new Date();
    const hoja = informe.addWorksheet("Resumen");
    hoja.columns = [
      { header: "Atencion", key: "atencion", width: 16 },
      { header: "Egreso", key: "egreso", width: 16 },
      {
        header: "Tiempo de Respuesta (minutos)",
        key: "tiempoRespuesta",
        width: 30
      },
      { header: "NDAU", key: "ndau", width: 10 },
      { header: "Nombres", key: "nombres", width: 20 },
      { header: "Paterno", key: "apPaterno", width: 12 },
      { header: "Materno", key: "apMaterno", width: 12 },
      { header: "RUT", key: "rut", width: 16 },
      { header: "FechaNac", key: "fechaNac", width: 12 },
      { header: "Edad", key: "edad", width: 12 },
      {
        header: "Establecimiento",
        key: "establecimientoUrgencia",
        width: 20
      },
      { header: "CodDiag", key: "codDiag" },
      { header: "Diagnostico", key: "diag", width: 48 },
      { header: "Programa asignado", key: "programa", width: 48 }
    ];
    hoja.getRow(1).font = { bold: true, color: { argb: "FFFFFF" } }; // la primera fila está en negrita
    hoja.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "000099" }
    };

    try {
      // hacer la consulta
      const dataInforme = await getInforme(
        establecimiento,
        dia,
        mes,
        anio,
        modoReporte
      );
      console.log(dataInforme);
      dataInforme.res.map((row) => {
        hoja.addRow(row);
        return null;
      });
      //descargar
      const buffer = await informe.xlsx.writeBuffer();
      const fileType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      const fileExtension = ".xlsx";
      const blob = new Blob([buffer], { type: fileType });
      saveAs(blob, `listaPacientesCoquimbo_${fecha}${fileExtension}`);
    } catch (error) {
      if (error.message === "Failed to fetch") {
        toast(
          "No se pudieron obtener los datos del informe (posible problema de red)",
          {
            pauseOnHover: false,
            closeOnClick: true,
            style: { backgroundColor: "#f23a3a" },
            bodyStyle: { color: "white" }
          }
        );
      } else {
        console.log("Error");
      }
    }
  };

  const generarFilas = () => {
    // generacion de fechas
    let dateuse = diaBase;
    const datesCollection = [];
    if (modoReporte === "dia") {
      let restarDia = 0;
      // si el dia base es hoy, significa que la primera fila esta incompleta y hay que marcarla como tal
      if (diaBase.isSame(moment(), "day")) {
        const dateObj = {
          dateSlash: `${moment(dateuse).format("D[/]M[/]YYYY")} (día en curso)`,
          dateUnder: `${moment(dateuse).format("D[_]M[_]YYYY")}_incompleto`,
          dateDia: moment(dateuse).format("D"),
          dateMes: moment(dateuse).format("M"),
          dateAnio: moment(dateuse).format("YYYY")
        };
        datesCollection.push(dateObj);
        dateuse = moment(dateuse).subtract(1, "days");
        restarDia = 1; // indicar que la primera fila ya esta lista
      }
      //
      for (let i = 0; i < maxFilasPantalla - restarDia; i++) {
        const dateObj = {
          dateSlash: moment(dateuse).format("D[/]M[/]YYYY"),
          dateUnder: moment(dateuse).format("D[_]M[_]YYYY"),
          dateDia: moment(dateuse).format("D"),
          dateMes: moment(dateuse).format("M"),
          dateAnio: moment(dateuse).format("YYYY")
        };
        datesCollection.push(dateObj);
        dateuse = moment(dateuse).subtract(1, "days");
      }
    } else if (modoReporte === "mes") {
      let restarMes = 0;
      // lo mismo del dia base, para marcar la fila incompleta hay que hacer la primera fila por separado
      if (diaBase.isSame(moment(), "day")) {
        const dateObj = {
          dateSlash: `${moment(dateuse).format("M[/]YYYY")} (mes en curso)`,
          dateUnder: `${moment(dateuse).format("M[_]YYYY")}_incompleto`,
          dateDia: moment(dateuse).format("D"),
          dateMes: moment(dateuse).format("M"),
          dateAnio: moment(dateuse).format("YYYY")
        };
        datesCollection.push(dateObj);
        dateuse = moment(dateuse).subtract(1, "months");
        restarMes = 1; // indicar que la primera fila ya esta lista
      }
      for (let i = 0; i < maxFilasPantalla - restarMes; i++) {
        const dateObj = {
          dateSlash: moment(dateuse).format("M[/]YYYY"),
          dateUnder: moment(dateuse).format("M[_]YYYY"),
          dateDia: moment(dateuse).format("D"),
          dateMes: moment(dateuse).format("M"),
          dateAnio: moment(dateuse).format("YYYY")
        };
        datesCollection.push(dateObj);
        dateuse = moment(dateuse).subtract(1, "months");
      }
    } else if (modoReporte === "fecha_especifica") {
      const dateuse = moment(fechaInicial, "dd/MM/yyyy");
      // si el dia base es hoy, significa que la primera fila esta incompleta y hay que marcarla como tal
      if (dateuse.isSame(moment(), "day")) {
        const dateObj = {
          dateSlash: `${moment(dateuse).format("D[/]M[/]YYYY")} (día en curso)`,
          dateUnder: `${moment(dateuse).format("D[_]M[_]YYYY")}_incompleto`,
          dateDia: moment(dateuse).format("D"),
          dateMes: moment(dateuse).format("M"),
          dateAnio: moment(dateuse).format("YYYY")
        };
        datesCollection.push(dateObj);
      } else {
        const dateObj = {
          dateSlash: moment(dateuse).format("D[/]M[/]YYYY"),
          dateUnder: moment(dateuse).format("D[_]M[_]YYYY"),
          dateDia: moment(dateuse).format("D"),
          dateMes: moment(dateuse).format("M"),
          dateAnio: moment(dateuse).format("YYYY")
        };
        datesCollection.push(dateObj);
      }
    }
    /*
        genero y retorno las filas con la funcion map
        cada onclick tiene su funcion especifica, descargar archivo
        solo se encarga de descargar un unico archivo
        */

    return datesCollection.map((date) => {
      return (
        <tr key={date.dateUnder}>
          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
            <div className="flex items-center">
              <div className="ml-1">
                <p className="text-gray-900">{date.dateSlash}</p>
              </div>
            </div>
          </td>
          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
            <p className="text-gray-900 whitespace-no-wrap">{`${establecimiento}_${date.dateUnder}.xlsx`}</p>
          </td>
          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
            <button
              onClick={descargarArchivo(
                date.dateUnder,
                date.dateDia,
                date.dateMes,
                date.dateAnio
              )}
              className="relative z-0 inline-block px-3 py-2 font-semibold  leading-tight text-green-900 bg-green-100 hover:bg-green-400 rounded-full"
            >
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Descargar Archivo
              </span>
            </button>
          </td>
        </tr>
      );
    });
  };

  const avanzarPagina = (modo) => {
    // dependiendo de cual sea el modo de reporte, se avanzan o se reducen meses
    const modoAvance = modoReporte === "mes" ? "months" : "days";
    if (modo === "next") {
      // si el dia despues del dia mas alto mostrado en la pantalla es después de hoy, no mostrar
      if (!moment(diaBase).add(1, modoAvance).isAfter(moment())) {
        setDiaBase(moment(diaBase).add(maxFilasPantalla, modoAvance));
      } else {
        // el toast es la ventanita emergente de arriba a la derecha
        toast("No existen informes más recientes que mostrar", {
          pauseOnHover: false,
          closeOnClick: true
        });
      }
      // por ahora no hay limites en ir hacia atras, aunque quizás debería
    } else if (modo === "prev") {
      /*
        ya, por que 3*maxfilas pantalla, es porque el dia base esta arriba de todas las filas
        y quiero que el limite sea la ultima fila de la pagina anterior.
        osea, la ultima fila de la pagina anterior (3*maxfilaspantalla atras) tiene que ser despues del
        momento especificado
      */
      console.log(moment(diaBase).subtract(2 * maxFilasPantalla, modoAvance));
      if (
        moment(diaBase)
          .subtract(2 * maxFilasPantalla, modoAvance)
          .isAfter(moment("01-01-2018", "DD-MM-YYYY"))
      ) {
        setDiaBase(moment(diaBase).subtract(maxFilasPantalla, modoAvance));
      } else {
        // el toast es la ventanita emergente de arriba a la derecha
        toast("No se pueden visualizar informes más antiguos", {
          pauseOnHover: false,
          closeOnClick: true
        });
      }
    }
  };

  const establecerFecha = (date, tipo) => {
    const dateUsar = date || fechaActual; // puede pasar que la fecha es nula
    if (tipo === "inicial") {
      setFechaInicial(dateUsar);
    }
  };

  const cambiarFilasPorPantalla = (valor) => {
    const modoAvance = modoReporte === "mes" ? "months" : "days";
    if (
      moment(diaBase)
        .subtract(valor, modoAvance)
        .isAfter(moment("01-01-2018", "DD-MM-YYYY"))
    ) {
      setmaxFilasPantalla(valor);
    } else {
      toast("No se pueden generar filas más antiguas", {
        pauseOnHover: false,
        closeOnClick: true
      });
    }
  };

  const [showResults, setShowResults] = React.useState(false);
  const Search = () => {
    return <div>{showResults ? <Results /> : null}</div>;
  };

  const Results = () => (
    <label className="flex gap-x-2 items-baseline">
      <span className="py-2 ">Seleccionar Fecha</span>
      <div className="flex">
        <DatePicker
          className="h-full mr-1 rounded border block appearance-none w-auto bg-white border-gray-400 text-gray-700 py-2 px-4 pr-8 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          selected={fechaInicial}
          minDate={new Date(2018, 0, 1)}
          maxDate={fechaActual}
          dateFormat={formatoFecha}
          showYearDropdown
          onChange={(date) => establecerFecha(date, "inicial")}
        />
      </div>
    </label>
  );

  return (
    <div className="antialiased font-sans bg-white">
      <Header />
      <ToastContainer hideProgressBar />
      <div className="w-auto min-h-full flex flex-row">
        <SideNavbar />
        <div className="container max-w-full min-h-screen mx-auto px-4 sm:px-8">
          <div className="py-8 ">
            <div className="flex flex-col items-center text-xl	">
              <span>Generación de informes de pacientes derivados</span>
              <div className="top-0 left-0 w-64 h-2 flex">
                <div className="h-2 bg-blue-500 flex-1" />
                <div className="h-2 bg-red-500 flex-1" />
              </div>
            </div>
            <div className="py-8">
              <div className="my-2 sm:flex-row flex gap-x-2 items-baseline ">
                <div className="py-2">
                  <p>
                    Bienvenido, usuario {nombreUsuario} del {establecimiento}
                  </p>
                </div>
                <div className="flex flex-row">
                  <label className="flex gap-x-2 items-baseline">
                    <span className="py-2 px-2"> Mostrar </span>
                    <div className="flex">
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        value={maxFilasPantalla}
                        onChange={(e) =>
                          cambiarFilasPorPantalla(e.target.value)
                        }
                      >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                      </select>
                    </div>
                    <span className="py-2 px-2"> filas por pantalla.</span>
                    <span className="py-2 px-2"> Mostrar por </span>
                    <div className="flex">
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        value={modoReporte}
                        onChange={(e) => {
                          setModoReporte(e.target.value);
                          e.target.value === "fecha_especifica"
                            ? setShowResults(true)
                            : setShowResults(false);
                          setDiaBase(moment());
                        }}
                      >
                        <option value="mes">Mes</option>
                        <option value="dia">Dia</option>
                        <option value="fecha_especifica">
                          Fecha Especifica
                        </option>
                      </select>
                    </div>
                  </label>
                </div>
              </div>
              <Search />
              <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
                  <table className="min-w-full leading-normal">
                    <thead>
                      <tr>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Archivo
                        </th>
                      </tr>
                    </thead>
                    <tbody>{generarFilas()}</tbody>
                  </table>
                  <div className="px-5 py-5 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between">
                    <div className="inline-flex mt-2 xs:mt-0">
                      <button
                        onClick={() => avanzarPagina("prev")}
                        className="text-sm bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-l"
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() => avanzarPagina("next")}
                        className="text-sm bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-r"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReciboArchivos;

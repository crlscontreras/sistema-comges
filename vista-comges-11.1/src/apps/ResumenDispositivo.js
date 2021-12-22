import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import SideNavbar from "../components/SideNavbar";
import StatsBox from "../components/StatsBox";
import ResumenRegional from "../components/ResumenRegional";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import es from "date-fns/locale/es";
import getResumen from "../api/resumen.api";
import getNombres from "../api/nombres.api";
import { ToastContainer } from "react-toastify";
import moment from "moment";

registerLocale("es", es);
setDefaultLocale("es");

const ResumenDispositivo = () => {
  const userToken = JSON.parse(sessionStorage.getItem("token"));
  const rol = userToken.token.rol;
  //console.log(rol);
  let comuna = "Todos";
  if (userToken.token.rol === "desam") {
    comuna = userToken.token.comuna; // esto tendria que entrar como prop desde redux
  }
  //console.log(comuna);

  //fecha inicial del periodo seleccionado
  let [fechaInicial, setFechaInicial] = useState(new Date());
  //fecha final del periodo seleccionado
  let [fechaFinal, setFechaFinal] = useState(new Date());
  //fecha de hoy
  let fechaActual = new Date();

  //Querys para cargar los datos de la API
  let [resultadoQueryCajas, setQueryCajas] = useState({ res: [] });
  let [resultadoQueryNombres, setQueryNombres] = useState({ res: [] });

  //variable con el modo reporte (trimestre o año)
  let [modoReporte, setModoReporte] = useState("trimestre");
  //variable con el dispositivo seleccionado ("Todos" o un dispositivo en especial)
  let [dispositivoSeleccionado, setDispositivo] = useState("Todos");

  //true o false para mostrar o no la animacion de cargando
  let [loading, setLoading] = useState(false);

  //effect para llamar a la API, se ejecuta cada vez que cambien las fechas o el dispositivoSeleccionado
  useEffect(() => {
    const fetchResumen = async () => {
      //console.log("primer effect (para llamar a la API)");
      setLoading(false);
      try {
        //este if es para no llamar a la API en el render inicial
        if (fechaInicial.getTime() != fechaFinal.getTime()) {
          //porque al iniciar esta pagina las fechas estan "incorrectas" (fechaInicial===fechaFinal)
          //el segundo useEffect corrige las fechas
          //una vez corregidas las fechas, se llama a la API de manera normal
          const resp = await getResumen(
            dispositivoSeleccionado,
            fechaInicial,
            fechaFinal,
            comuna
          );
          setQueryCajas(resp);
          setLoading(true);
        }
      } catch (e) {
        console.log(e);
      }
    };
    fetchResumen();
  }, [dispositivoSeleccionado, fechaInicial, fechaFinal, comuna]);

  //effect para cambiar las fechas, se ejecuta cada vez que se cambie el modo reporte
  useEffect(() => {
    //console.log("segundo effect (modo reporte cambiado)");
    if (modoReporte === "trimestre") {
      let fechaHoy = new Date();
      let quarter = Math.floor((fechaHoy.getMonth() + 3) / 3);
      let fechaInicioFixed = moment().quarter(quarter).startOf("quarter");
      establecerFecha(fechaInicioFixed.toDate(), "trimestre");
    } else if (modoReporte === "anio") {
      let fechaInicioFixed = moment().startOf("year");
      establecerFecha(fechaInicioFixed.toDate(), "anio");
    }
  }, [modoReporte]);

  //effect para obtener todos los nombres de los dispositivos APS, se ejecuta solo 1 vez
  useEffect(() => {
    //console.log("tercer effect (cargar lista con nombre)");
    if (rol === "ssc") {
      const fetchNombres = async () => {
        const resp = await getNombres("Todos");
        setQueryNombres(resp);
      };
      fetchNombres();
    } else if (rol === "desam") {
      const fetchNombres = async () => {
        const resp = await getNombres(comuna);
        setQueryNombres(resp);
      };
      fetchNombres();
    }
  }, [rol, comuna]); // <- we add empty brackets here on the second parameter, so this runs ONLY on the first render

  //mostrar el dashboard, duh
  const mostrarDashboard = () => {
    return (
      <div>
        <div className="mx-4 mt-4">Datos de la región:</div>
        <div>{generarReporteRegionComges()}</div>
        <div className="mx-4 mt-4">Datos por dispositivo APS:</div>
        <div>{generarReporte()}</div>
      </div>
    );
  };

  /*
  Generar la primera fila de informacion, la cual muestra un resumen de toda la region y 2 botones.
  el resumen de la region es:
  -cantidad de pacientes derivados en toda la region
  -cantidad de pacientes contactados y agendados en toda la region
  -indicador COMGES 11.1
  los 2 botones son:
  - Descargar Informe excel de No Agendados en el periodo.
  - Descargar Informe excel de personas atendidas en urgencias con domicilio fuera de la region.
  */
  const generarReporteRegionComges = () => {
    let numeroConsultasENT = 0;
    let numeroContactados = 0;

    resultadoQueryCajas.res.map((d) => {
      numeroConsultasENT = numeroConsultasENT + d.dataCol[0];
      numeroContactados = numeroContactados + d.dataCol[1];
    });

    let comgesFinal = ((numeroContactados / numeroConsultasENT) * 100).toFixed(
      0
    );

    if (isNaN(comgesFinal)) {
      comgesFinal = 0;
    }

    return (
      <ResumenRegional
        numeroConsultasENT={numeroConsultasENT}
        numeroContactados={numeroContactados}
        comgesFinal={comgesFinal}
        dispositivoSeleccionado={dispositivoSeleccionado}
        fechaInicial={fechaInicial}
        fechaFinal={fechaFinal}
        modoReporte={modoReporte}
      />
    );
  };

  /*
  Generar el resto de informacion, la cual es un resumen por dispositivo. (1 StatsBox por dispositivo).
  Se muestran en orden mayor a menor segun los Pacientes No Agendados.
  */
  const generarReporte = () => {
    return (
      <div className="grid 2xl:grid-cols-4 xl:grid-cols-2 lg:grid-cols-1 gap-4">
        {resultadoQueryCajas.res
          .sort((a, b) => (a.dataCol[2] < b.dataCol[2] ? 1 : -1))
          .map((item, i) => (
            <StatsBox
              key={i}
              title={item.title}
              comuna={item.comuna}
              dataCol={item.dataCol}
            />
          ))}
      </div>
    );
  };

  //para mostrar una animacion de "cargando" mientras se espera la respuesta de la API
  const animacionLoading = () => {
    return (
      <div className="flex justify-center items-center pt-16">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  };

  //dropdown list con todos los nombres de los dispositivos APS que esten en la base de datos
  const generarDropdown = () => {
    return (
      <div className="flex ">
        <select
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          value={dispositivoSeleccionado}
          onChange={(e) => setDispositivo(e.target.value)}
        >
          {resultadoQueryNombres.res.map((e, key) => {
            return (
              <option key={key} value={e.title}>
                {e.title}
              </option>
            );
          })}
        </select>
      </div>
    );
  };

  //el datepicker cambia dependiendo del modo reporte
  //Ejemplo: si el usuario selecciona "Trimestre" se mostrara un calendario de trimestres
  const [calendarioTrimestre, setCalendarioTrimestre] = React.useState(true);

  const Search = () => {
    return (
      <div className="z-50">
        {calendarioTrimestre ? <ResultsTrimestre /> : <ResultsAnio />}
      </div>
    );
  };

  //mostrar calendario de trimestres
  const ResultsTrimestre = () => (
    <div className="flex flex-col">
      <span className="py-3">Seleccionar Trimestre</span>
      <DatePicker
        className="h-full mr-1 rounded border block appearance-none w-auto bg-white border-gray-300 shadow-s text-gray-700 py-2 px-4 pr-8 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
        popperClassName="calendar-popout z-index-99999"
        selected={fechaInicial}
        dateFormat="yyyy, QQQ"
        showQuarterYearPicker
        maxDate={fechaActual}
        onChange={(date) => establecerFecha(date, "trimestre")}
      />
    </div>
  );

  //mostrar calendario de años
  const ResultsAnio = () => (
    <div className="flex flex-col">
      <span className="py-3">Seleccionar Año</span>
      <DatePicker
        className="h-full mr-1 rounded border block appearance-none w-auto bg-white border-gray-300 shadow-s text-gray-700 py-2 px-4 pr-8 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
        selected={fechaInicial}
        showYearPicker
        dateFormat="yyyy"
        yearItemNumber={9}
        maxDate={fechaActual}
        onChange={(date) => establecerFecha(date, "anio")}
      />
    </div>
  );

  //funcion para cambiar las fechas dependiendo del modo reporte
  const establecerFecha = (date, tipo) => {
    //console.log("weeeena");
    //dateUsar: La fecha a utilizar
    const dateUsarInicio = date;

    if (tipo === "anio") {
      let dateUsarFinal = new Date(dateUsarInicio);
      dateUsarFinal.setYear(dateUsarFinal.getFullYear() + 1);
      setFechaInicial(dateUsarInicio);
      setFechaFinal(dateUsarFinal);
    } else if (tipo === "trimestre") {
      let dateUsarFinal = new Date(dateUsarInicio);
      dateUsarFinal.setMonth(dateUsarFinal.getMonth() + 3);
      setFechaInicial(dateUsarInicio);
      setFechaFinal(dateUsarFinal);
    }
  };

  return (
    <div className="antialiased font-sans bg-white">
      <Header />
      <div className="w-auto min-h-full flex flex-row">
        <ToastContainer hideProgressBar />
        <SideNavbar />
        <div className="container max-w-full min-h-screen mx-auto px-4 sm:px-8">
          <div className="py-8 ">
            <div className="flex flex-col items-center text-xl	">
              <span>Resumen de Información por Dispositivo APS</span>
              <div className="top-0 left-0 w-64 h-2 flex">
                <div className="h-2 bg-blue-500 flex-1"></div>
                <div className="h-2 bg-red-500 flex-1"></div>
              </div>
            </div>
          </div>
          <div className="container flex flex-row gap-x-2 items-baseline ml-4 ">
            <div className="flex flex-col w-1/6">
              <span className="py-1.5">Dispositivo APS a visualizar</span>
              {generarDropdown()}
            </div>
            <div className="flex flex-col">
              <span className="py-1.5">Seleccionar por</span>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                value={modoReporte}
                onChange={(e) => {
                  setModoReporte(e.target.value);
                  e.target.value === "trimestre"
                    ? setCalendarioTrimestre(true)
                    : setCalendarioTrimestre(false);
                }}
              >
                <option value="trimestre">Trimestre</option>
                <option value="anio">Año</option>
              </select>
            </div>
            <Search />
          </div>
          {loading ? mostrarDashboard() : animacionLoading()}
        </div>
      </div>
    </div>
  );
};

export default ResumenDispositivo;

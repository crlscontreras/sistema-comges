import React, { useState } from "react";
import PropTypes from "prop-types";
import getInformeSSC, { getReporteNoRegion } from "../api/informeSSC.api";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";

/*
    recibe:
    numeroConsultasENT = cantidad de pacientes derivados
    numeroContactados = cantidad de pacientes contactados y agendados
    comgesFinal = indicador comges para el periodo seleccionado
    dispositivoSeleccionado = el dispositivo seleccionado, puede ser "Todos" o un dispositivo en especifico
    fechaInicial y fechaFinal = fechas del periodo seleccionado
    modoReporte = trimestre o año

*/
const ResumenRegional = ({
  numeroConsultasENT,
  numeroContactados,
  comgesFinal,
  dispositivoSeleccionado,
  fechaInicial,
  fechaFinal,
  modoReporte
}) => {
  const [tooltipStatus, setTooltipStatus] = useState(0);

  const obtenerInformeNoAgendados = async () => {
    // crear el archivo excel para llenarlo con los datos de la consulta
    const informe = new ExcelJS.Workbook();
    informe.created = new Date();
    const hoja = informe.addWorksheet("No Agendados");
    hoja.columns = [
      {
        header: "Establecimiento Responsable",
        key: "establecimientoResponsable",
        width: 16
      },
      { header: "codDiag", key: "codDiagDerivacion", width: 16 },
      {
        header: "Diagnóstico",
        key: "diagDerivacion",
        width: 30
      },
      { header: "Fecha Derivación", key: "fechaDerivacion", width: 20 },
      {
        header: "Tiempo transcurrido (horas)",
        key: "diferenciaDerivacionHoras",
        width: 20
      },
      {
        header: "Tiempo transcurrido (dias)",
        key: "diferenciaDerivacionDias",
        width: 12
      },
      { header: "RUT", key: "rut", width: 16 },
      { header: "Nombre", key: "nombre", width: 12 },
      { header: "Apellido Paterno", key: "apellidoPaterno", width: 12 },
      { header: "Apellido Materno", key: "apellidoMaterno", width: 20 },
      { header: "Dirección", key: "direccion", width: 20 },
      { header: "Comuna", key: "comuna", width: 48 }
    ];
    hoja.getRow(1).font = { bold: true, color: { argb: "FFFFFF" } }; // la primera fila está en negrita
    hoja.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "000099" }
    };

    try {
      // hacer la consulta
      const dataInforme = await getInformeSSC(
        dispositivoSeleccionado,
        fechaInicial,
        fechaFinal
      );
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
      saveAs(blob, `listaPacientesNoDerivados_${modoReporte}${fileExtension}`);
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
  const obtenerInformeNoRegion = async () => {
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
      { header: "Establecimiento", key: "establecimientoUrgencia", width: 20 },
      { header: "CodDiag", key: "codDiag" },
      { header: "Diagnostico", key: "diag", width: 48 },
      { header: "Comuna", key: "comuna", width: 48 },
      { header: "CESFAM", key: "cesfam", width: 48 },
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
      const dataInforme = await getReporteNoRegion();

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
      saveAs(blob, `reportePacientesUrgenciaNoCuartaRegion${fileExtension}`);
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

  return (
    <div className="grid grid-cols-2 grid-row-1">
      <div className="grid grid-cols-4 grid-row-1">
        <div className="z-40 ml-4 mt-3 mb-1 max-h-full max-w-max bg-white border-2 p-6 rounded-md shadow-md hover:shadow-2xl transition duration-500 transform hover:scale-100">
          <div id="header" className="flex items-center">
            <div className="leading-5 sm">
              <h4 className="text-2xl text-black dark:text-white font-semibold">
                {numeroConsultasENT}
              </h4>
              <span className="flex items-center 3xl:flex-nowrap 2xl:flex-wrap xl:flex-wrap">
                <div className="mt-2 mb-0 mr-1 font-semibold text-blue-600">
                  Pacientes Derivados
                </div>
                <div
                  className="relative mt-20 md:mt-0"
                  onMouseEnter={() => setTooltipStatus(1)}
                  onMouseLeave={() => setTooltipStatus(0)}
                >
                  <div className="cursor-pointer">
                    <svg
                      aria-haspopup="true"
                      xmlns="http://www.w3.org/2000/svg"
                      className="mt-2 icon icon-tabler icon-tabler-info-circle"
                      width={25}
                      height={25}
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="#A0AEC0"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" />
                      <circle cx={12} cy={12} r={9} />
                      <line x1={12} y1={8} x2="12.01" y2={8} />
                      <polyline points="11 12 12 12 12 16 13 16" />
                    </svg>
                  </div>
                  {tooltipStatus == 1 && (
                    <div
                      role="tooltip"
                      className="z-50 border-2 -mt-20 w-64 absolute transition duration-150 ease-in-out left-0 ml-8 shadow-lg bg-white p-4 rounded"
                    >
                      <svg
                        className="absolute left-0 -ml-2 bottom-0 top-0 h-full"
                        width="9px"
                        height="16px"
                        viewBox="0 0 9 16"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                      >
                        <g
                          id="Page-1"
                          stroke="none"
                          strokeWidth={1}
                          fill="none"
                          fillRule="evenodd"
                        >
                          <g
                            id="Tooltips-"
                            transform="translate(-874.000000, -1029.000000)"
                            fill="#FFFFFF"
                          >
                            <g
                              id="Group-3-Copy-16"
                              transform="translate(850.000000, 975.000000)"
                            >
                              <g
                                id="Group-2"
                                transform="translate(24.000000, 0.000000)"
                              >
                                <polygon
                                  id="Triangle"
                                  transform="translate(4.500000, 62.000000) rotate(-90.000000) translate(-4.500000, -62.000000) "
                                  points="4.5 57.5 12.5 66.5 -3.5 66.5"
                                />
                              </g>
                            </g>
                          </g>
                        </g>
                      </svg>
                      <p className="text-sm font-bold text-gray-800 pb-1">
                        Paciente Derivado
                      </p>
                      <p className="text-xs leading-4 text-gray-600 pb-3">
                        Paciente con ENT derivado desde un Servicio de Urgencia
                        hacia su establecimiento de Atención Primaria.
                      </p>
                    </div>
                  )}{" "}
                </div>
              </span>
            </div>
          </div>
        </div>
        <div className="z-30 ml-7 mt-3 mb-1 max-h-full max-w-max bg-white border-2 p-6 rounded-md shadow-md hover:shadow-2xl transition duration-500 transform hover:scale-100">
          <div id="header" className="flex items-center">
            <div className="leading-5 sm">
              <h4 className="text-2xl text-black dark:text-white font-semibold ">
                {numeroContactados}
              </h4>
              <span className="flex items-center 3xl:flex-nowrap 2xl:flex-wrap xl:flex-wrap">
                <div className="mt-2 mb-0 mr-1 font-semibold text-blue-600">
                  Atenciones Efectivas
                </div>
                <div
                  className="relative  mt-20 md:mt-0"
                  onMouseEnter={() => setTooltipStatus(2)}
                  onMouseLeave={() => setTooltipStatus(0)}
                >
                  <div className="cursor-pointer">
                    <svg
                      aria-haspopup="true"
                      xmlns="http://www.w3.org/2000/svg"
                      className="mt-2 icon icon-tabler icon-tabler-info-circle"
                      width={25}
                      height={25}
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="#A0AEC0"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" />
                      <circle cx={12} cy={12} r={9} />
                      <line x1={12} y1={8} x2="12.01" y2={8} />
                      <polyline points="11 12 12 12 12 16 13 16" />
                    </svg>
                  </div>
                  {tooltipStatus == 2 && (
                    <div
                      role="tooltip"
                      className="z-50 border-2 -mt-20 w-64 absolute transition duration-150 ease-in-out left-0 ml-8 shadow-lg bg-white p-4 rounded"
                    >
                      <svg
                        className="absolute left-0 -ml-2 bottom-0 top-0 h-full"
                        width="9px"
                        height="16px"
                        viewBox="0 0 9 16"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                      >
                        <g
                          id="Page-1"
                          stroke="none"
                          strokeWidth={1}
                          fill="none"
                          fillRule="evenodd"
                        >
                          <g
                            id="Tooltips-"
                            transform="translate(-874.000000, -1029.000000)"
                            fill="#FFFFFF"
                          >
                            <g
                              id="Group-3-Copy-16"
                              transform="translate(850.000000, 975.000000)"
                            >
                              <g
                                id="Group-2"
                                transform="translate(24.000000, 0.000000)"
                              >
                                <polygon
                                  id="Triangle"
                                  transform="translate(4.500000, 62.000000) rotate(-90.000000) translate(-4.500000, -62.000000) "
                                  points="4.5 57.5 12.5 66.5 -3.5 66.5"
                                />
                              </g>
                            </g>
                          </g>
                        </g>
                      </svg>
                      <p className="text-sm font-bold text-gray-800 pb-1">
                        Atención efectiva
                      </p>
                      <p className="text-xs leading-4 text-gray-600 pb-3">
                        La atención efectiva se considerá para este indicador,
                        como la hora agendada en el respectivo centro de salud
                        para la persona derivada desde el Servicio de Urgencia.
                      </p>
                    </div>
                  )}{" "}
                </div>
              </span>
            </div>
          </div>
        </div>
        <div className="z-10 ml-7 mt-3 mb-1 max-h-full max-w-max bg-white border-2 p-5 rounded-md shadow-md hover:shadow-2xl transition duration-500 transform hover:scale-100">
          <div id="header" className="flex items-center">
            <div className="leading-5 sm ">
              <div className="text-5xl text-black dark:text-white font-bold ">
                {comgesFinal}%
              </div>
              <span className="flex items-center 3xl:flex-nowrap 2xl:flex-wrap xl:flex-wrap">
                <div className="mt-2 mb-0 mr-1 font-semibold text-blue-600">
                  COMGES 11.1
                </div>
                <div
                  className="relative  mt-20 md:mt-0"
                  onMouseEnter={() => setTooltipStatus(3)}
                  onMouseLeave={() => setTooltipStatus(0)}
                >
                  <div className="cursor-pointer">
                    <svg
                      aria-haspopup="true"
                      xmlns="http://www.w3.org/2000/svg"
                      className="mt-2 icon icon-tabler icon-tabler-info-circle"
                      width={25}
                      height={25}
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="#A0AEC0"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" />
                      <circle cx={12} cy={12} r={9} />
                      <line x1={12} y1={8} x2="12.01" y2={8} />
                      <polyline points="11 12 12 12 12 16 13 16" />
                    </svg>
                  </div>
                  {tooltipStatus == 3 && (
                    <div
                      role="tooltip"
                      className="z-20 border-2 -mt-20 w-64 absolute transition duration-150 ease-in-out left-0 ml-8 shadow-lg bg-white p-4 rounded"
                    >
                      <svg
                        className="absolute left-0 -ml-2 bottom-0 top-0 h-full"
                        width="9px"
                        height="16px"
                        viewBox="0 0 9 16"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                      >
                        <g
                          id="Page-1"
                          stroke="none"
                          strokeWidth={1}
                          fill="none"
                          fillRule="evenodd"
                        >
                          <g
                            id="Tooltips-"
                            transform="translate(-874.000000, -1029.000000)"
                            fill="#FFFFFF"
                          >
                            <g
                              id="Group-3-Copy-16"
                              transform="translate(850.000000, 975.000000)"
                            >
                              <g
                                id="Group-2"
                                transform="translate(24.000000, 0.000000)"
                              >
                                <polygon
                                  id="Triangle"
                                  transform="translate(4.500000, 62.000000) rotate(-90.000000) translate(-4.500000, -62.000000) "
                                  points="4.5 57.5 12.5 66.5 -3.5 66.5"
                                />
                              </g>
                            </g>
                          </g>
                        </g>
                      </svg>
                      <p className="text-sm font-bold text-gray-800 pb-1">
                        Indicador COMGES 11.1
                      </p>
                      <p className="text-xs leading-4 text-gray-600 pb-3">
                        Porcentaje de derivación de pacientes con ENT. Se
                        calcula de la siguiente manera: (Número de atenciones
                        efectivas)/(Número total de pacientes que consultan por
                        una ENT)
                      </p>
                    </div>
                  )}{" "}
                </div>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container flex flex-row gap-x-2 items-baseline ml-7 mt-6 mb-1 ">
        <button
          onClick={() => obtenerInformeNoAgendados()}
          className="text-green-900 bg-green-100 hover:bg-green-400 transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg relative z-0 inline-block px-3 py-6 mb-8 mx-8 leading-tight"
        >
          <span className="flex items-center">
            Descargar Informe de No Agendados en el periodo
          </span>
        </button>
        <button
          onClick={() => obtenerInformeNoRegion()}
          className="text-green-900 bg-green-100 hover:bg-green-400 transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg relative z-0 inline-block px-3 py-6 mb-8 mx-8 leading-tight"
        >
          <span className="flex items-center">
            Descargar Informe de personas atendidas en urgencias con domicilio
            fuera de la región 
          </span>
        </button>
      </div>
    </div>
  );
};

//eslint pide hacer un Props Validation xd
ResumenRegional.propTypes = {
  numeroConsultasENT: PropTypes.any,
  numeroContactados: PropTypes.any,
  comgesFinal: PropTypes.any,
  dispositivoSeleccionado: PropTypes.any,
  fechaInicial: PropTypes.any,
  fechaFinal: PropTypes.any,
  modoReporte: PropTypes.any
};

export default ResumenRegional;

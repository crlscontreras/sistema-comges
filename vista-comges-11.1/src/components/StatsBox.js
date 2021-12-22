import React from "react";
import PropTypes from "prop-types";
/*
    recibe:
    title = el titulo de la caja
    comuna = nombre de la comuna
    datacol = una coleccion de numeros para las tarjetas

*/
const StatsBox = ({ title, comuna, dataCol }) => {
  let comgesFinal = ((dataCol[1] / dataCol[0]) * 100).toFixed(0);
  if (isNaN(comgesFinal)) {
    comgesFinal = 0;
  }

  return (
    <div className="shadow-2xl px-4 py-6 mx-4 my-5 border-2 w-full bg-white dark:bg-gray-800 relative">
      <div className="flex flex-wrap">
        <p className="text-lg w-max text-gray-700 dark:text-white font-semibold border-b border-gray-200">
          {title}
        </p>
      </div>

      <p className="text-base w-max mt-1 text-gray-700 dark:text-white font-semibold border-gray-200">
        <span className="flex items-center mb-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-1 stroke-current text-purple-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {" "}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />{" "}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />{" "}
          </svg>
          {comuna}
        </span>
      </p>

      <div className="flex items-end space-x-2 my-6">
        <p className="text-5xl text-black dark:text-white font-semibold">
          {comgesFinal}%
        </p>
      </div>
      <div className="dark:text-white">
        <div className="flex items-center pb-2 mb-2 text-sm space-x-12 md:space-x-24 justify-between border-b border-gray-200">
          <p>Pacientes Derivados</p>
          <div className="flex items-end text-green-500 text-xl font-bold">
            {dataCol[0]}
          </div>
        </div>
        <div className="flex items-center mb-2 pb-2 text-sm space-x-12 md:space-x-24 justify-between border-b border-gray-200">
          <p>Pacientes Agendados</p>
          <div className="flex items-end text-green-500 text-xl font-bold">
            {dataCol[1]}
          </div>
        </div>
        <div className="flex items-center text-sm space-x-12 md:space-x-24 justify-between">
          <p>Pacientes No Agendados</p>
          <div className="flex items-end text-green-500 text-xl font-bold">
            {dataCol[2]}
          </div>
        </div>
      </div>
    </div>
  );
};

//eslint pide hacer un Props Validation xd
StatsBox.propTypes = {
  title: PropTypes.any,
  dataCol: PropTypes.any
};

export default StatsBox;

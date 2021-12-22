import React from "react";
import { Link } from "react-router-dom";

const ElementSideNavbar = ({ path, desc }) => {
  return (
    <Link
      className="hover:text-black transition duration-200 ease-linear"
      to={path}
    >
      <h3 className="pl-1 text-sm flex items-center py-2 mb-2 m-2 rounded-md bg-gray-200 hover:bg-gray-300  hover:text-gray-700 transition duration-200 ease-in">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="black"
        >
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
        {desc}
      </h3>
    </Link>
  );
};

const renderizarElementosRol = () => {
  const userToken = JSON.parse(sessionStorage.getItem("token"));

  const rol = userToken.token.rol;

  if (rol === "ssc" || rol === "desam") {
    return <ElementSideNavbar path={"/resumen"} desc={"Información por APS"} />;
  } else if (rol === "cesfam") {
    return <ElementSideNavbar path={"/informes"} desc={"Generar Informes"} />;
  }
};

const SideNavbar = () => {
  return (
    <div className="dinset-y-0 left-0 w-72 py-2 border-r bg-gray-100">
      <div className="h-3/4 flex flex-col  text-gray-500">
        {renderizarElementosRol()}
      </div>
    </div>
  );
};

export default SideNavbar;

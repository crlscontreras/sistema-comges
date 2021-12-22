import React from "react";
import { useHistory } from "react-router-dom";

//Components are independent and reusable bits of code. They serve the same purpose as JavaScript functions, but work in isolation and return HTML.

const Header = () => {
  const history = useHistory();

  const logOut = () => {
    sessionStorage.clear();
    history.push("/");
  };

  return (
    <div className="sticky z-10 font-sans top-0 flex flex-col text-center content-center sm:flex-row sm:text-left sm:justify-between py-2 px-6 bg-white shadow sm:items-baseline w-full">
      <div className="mb-2 sm:mb-0 flex flex-row">
        <div className="h-10 w-10 self-center mr-2">
          <img
            alt="Logo"
            className="h-10 w-10 self-center"
            src="http://www.ucn.cl/wp-content/uploads/2018/05/Escudo-UCN-Full-Color.png"
          />
        </div>
        <div>
          <p className="text-2xl no-underline text-gray-800 hover:text-blue-dark font-sans">
            Sistema de Visualización COMGES 11.1
          </p>
          <span className="hidden text-xs text-grey-dark px-4">
            Beautiful New Tagline
          </span>
        </div>
      </div>
      <button
        type="button"
        className="w-min text-base border-2 font-medium text-black bg-white hover:bg-gray-200 px-4 py-2"
        onClick={logOut}
      >
        Logout
      </button>
    </div>
  );
};

export default Header;

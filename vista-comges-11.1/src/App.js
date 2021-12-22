import React from "react";
import ReciboArchivos from "./apps/ReciboArchivos";
import ResumenDispositivo from "./apps/ResumenDispositivo";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory
} from "react-router-dom";
import useToken from "./components/useToken";

//App Component is the main component in React which acts as a container for all other components.

// The <Router> is the parent component that is used to store all of the other router components.
// The <Switch> component will only render the first route that matches/includes the path.
// The <Route> component renders a UI when its path matches the current URL.

function App() {
  const { token, setToken } = useToken();

  let tokenPrueba = {
    token: {
      usuario: "Juan Pérez",
      establecimiento: "c19-CESFAM PEDRO AGUIRRE CERDA",
      rol: "ssc"
    }
  };

  if (!token) {
    setToken(tokenPrueba); //deberia loguearse aqui, obtener el token o decirle a la persona que ingrese antes
  }

  const seleccionarModo = (modo, history) => {
    if (modo === "ssc") {
      const tokenNuevo = {
        token: {
          usuario: "Juan Pérez",
          establecimiento: "c19-CESFAM PEDRO AGUIRRE CERDA",
          rol: "ssc",
          comuna: "La Serena"
        }
      };
      setToken(tokenNuevo);
      history.push("/resumen");
    } else if (modo === "desam") {
      const tokenNuevo = {
        token: {
          usuario: "Juan Pérez",
          establecimiento: "c19-CESFAM PEDRO AGUIRRE CERDA",
          rol: "desam",
          comuna: "Ovalle"
        }
      };
      setToken(tokenNuevo);
      history.push("/resumen");
    } else if (modo === "cesfam") {
      const tokenNuevo = {
        token: {
          usuario: "Juan Pérez",
          establecimiento: "c19-CESFAM PEDRO AGUIRRE CERDA",
          rol: "cesfam"
        }
      };
      setToken(tokenNuevo);
      console.log(token);
      history.push("/informes");
    }
  };

  const PantallaInicioDemo = () => {
    const history = useHistory();
    return (
      <div className="flex flex-col h-screen bg-center bg-cover bg-no-repeat bg-gray-100">
        <div className="grid place-items-center w-4/5 mx-auto p-10 my-20 sm:my-auto bg-white-600 border-4 border-gray-500 bg-opacity-70 rounded-xl shadow-2xl space-y-5 text-center cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="h-24 w-24 text-gray-500"
            viewBox="0 0 20 20"
          >
            <path d="M17.927,5.828h-4.41l-1.929-1.961c-0.078-0.079-0.186-0.125-0.297-0.125H4.159c-0.229,0-0.417,0.188-0.417,0.417v1.669H2.073c-0.229,0-0.417,0.188-0.417,0.417v9.596c0,0.229,0.188,0.417,0.417,0.417h15.854c0.229,0,0.417-0.188,0.417-0.417V6.245C18.344,6.016,18.156,5.828,17.927,5.828 M4.577,4.577h6.539l1.231,1.251h-7.77V4.577z M17.51,15.424H2.491V6.663H17.51V15.424z"></path>
          </svg>

          <h1 className="text-4xl font-bold uppercase text-gray-500 transition duration-500">
            SISTEMA COMGES 11.1
          </h1>
          <h2 className="text-xl text-gray-700 transition duration-500"></h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => seleccionarModo("ssc", history)}
              title="Resumen por Dispositivo"
              className="md:w-64 tracking-wide font-bold rounded border-2 border-gray-500 hover:text-white hover:border-blue-500 hover:bg-blue-500 shadow-md py-2 px-6 inline-flex items-center transition duration-500"
            >
              <span className="mx-auto">Demo SSC</span>
            </button>
            <button
              onClick={() => seleccionarModo("desam", history)}
              title="Resumen por Dispositivo"
              className="md:w-64 tracking-wide font-bold rounded border-2 border-gray-500 hover:text-white hover:border-blue-500 hover:bg-blue-500 shadow-md py-2 px-6 inline-flex items-center transition duration-500"
            >
              <span className="mx-auto">Demo DESAM</span>
            </button>
            <button
              onClick={() => seleccionarModo("cesfam", history)}
              title="Resumen por Dispositivo"
              className="md:w-64 tracking-wide font-bold rounded border-2 border-gray-500 hover:text-white hover:border-blue-500 hover:bg-blue-500 shadow-md py-2 px-6 inline-flex items-center transition duration-500"
            >
              <span className="mx-auto">Demo CESFAM</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Router>
      <div>
        <Switch>
          <Route exact path="/">
            <PantallaInicioDemo />
          </Route>
          <Route path="/informes">
            <ReciboArchivos />
          </Route>
          <Route path="/resumen">
            <ResumenDispositivo />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;

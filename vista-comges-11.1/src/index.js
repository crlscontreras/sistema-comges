import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

/*
React is a free and open-source front-end JavaScript library for building reusable User Interfaces components.
It works by creating a VIRTUAL DOM in memory.
When the application starts the first page that is loaded is index.html. This will be the only html file in the entire application.
index.js is the javascript file corresponding to index.html
*/

/*
React renders HTML to the web page by using the function ReactDOM.render().
The ReactDOM.render() function takes two arguments: HTML code and an HTML element.
What this function does is display the specified HTML code (App) inside the specified HTML element (with id = root)
*/

/*
This means that:  The result of src/App.js is displayed in the <div id="root"> element of src/public/index.html
Note: StrictMode is a tool for highlighting potential problems in an application.
*/

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

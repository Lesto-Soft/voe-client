// src/App.tsx

import React from "react";
import Router from "./router/MainRouter";
import EnvironmentLabel from "./components/global/EnvironmentLabel";

const App: React.FC = () => {
  return (
    <>
      <EnvironmentLabel />
      <Router />
    </>
  );
};

export default App;

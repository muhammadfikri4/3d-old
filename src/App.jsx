import { useEffect } from "react";
import "./App.css";
import Geo from "./Geo";
import { useGeo } from "./hooks/Geo";

function App() {
  useEffect(() => {
    useGeo();
  }, []);
  return (
    <>
      <div></div>
    </>
  );
}

export default App;

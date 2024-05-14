import React from "react";
import { useEffect } from "react";
import { useHooksType1 } from "../hooks/useFunction";

const Type1 = () => {
  useEffect(() => {
    useHooksType1();
  }, []);
  return (
    <div id="content">
      <div class="floating-div">
        <p>
          <b>OnHover Object Name</b>
        </p>
        <div id="hoverHistory"></div>
      </div>
      <button class="btn-floating" id="flythrough">
        Start Flythrough
        <br />
        Zoom out/Putar lalu klik
      </button>
      <div id="container" style={{ position: "fixed" }}></div>
    </div>
  );
};

export default Type1;

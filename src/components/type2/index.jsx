import React from "react";
import { useEffect } from "react";
import { useHooksType2 } from "../hooks/useFunction";

const Type2 = () => {
  useEffect(() => {
    useHooksType2();
  }, []);
  return (
    <>
      <div class="floating-div">
        <h3>Console Output Click Event</h3>
        <div id="output-event-click"></div>
      </div>
      <div id="map"></div>
    </>
  );
};

export default Type2;

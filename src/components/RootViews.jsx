import React from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";

const RootViews = () => {
  return (
    <>
      <Outlet />
      <ScrollRestoration />
    </>
  );
};

export default RootViews;

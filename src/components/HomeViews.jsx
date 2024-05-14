import React from "react";
import { Link } from "react-router-dom";

const HomeViews = () => {
  return (
    <div class="container mt-5">
      <h1>Testing Page</h1>
      <div class="card mt-5">
        <div class="card-body">
          <h5 class="card-title">Type 1</h5>
          <p class="card-text">
            Mapbox, Three, Tween, Raycaster, 3D, 3D slice, 3D Orbit, VR
          </p>
          <Link to={"/type-1"} target="_blank" class="btn btn-primary">
            Open
          </Link>
        </div>
      </div>
      <div class="card mt-5">
        <div class="card-body">
          <h5 class="card-title">Type 2</h5>
          <p class="card-text">Mapbox, Three, 3D, & Geojson</p>
          <Link to={"/type-2"} target="_blank" class="btn btn-primary">
            Open
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomeViews;

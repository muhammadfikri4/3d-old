import geojson from "../utils/data.json";

export const useGeo = () => {
  mapboxgl.accessToken =
    "pk.eyJ1IjoicmFqaWZtYWhlbmRyYSIsImEiOiJjbHVjYTI2d2MwcnBzMmxxbndnMnNlNTUyIn0.aaCGYQ2OYIcIsAa4X-ILDA";
  const map = new mapboxgl.Map({
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: "mapbox://styles/mapbox/outdoors-v12",
    center: [
      103.85233599700446,
      1.284132369245514
    ],
    zoom: 20,
    pitch: 45,
    bearing: -17.6,
    container: "map",
    antialias: true,
  });
  /*
	map.on("style.load", () => {
		// Insert the layer beneath any symbol layer.
		const layers = map.getStyle().layers;
		const labelLayerId = layers.find(
			(layer) => layer.type === "symbol" && layer.layout["text-field"]
		).id;

		map.addSource("Custom", {
			type: "geojson",
			data: {
				...geojson,
			},
		});

		// The 'building' layer in the Mapbox Streets
		// vector tileset contains building height data
		// from OpenStreetMap.
		map.addLayer(
			{
				id: "add-3d-buildings",
				source: "composite",
				"source-layer": "building",
				filter: ["==", "extrude", "true"],
				type: "fill-extrusion",
				minzoom: 15,
				paint: {
					"fill-extrusion-color": "#aaa",

					// Use an 'interpolate' expression to
					// add a smooth transition effect to
					// the buildings as the user zooms in.
					"fill-extrusion-height": [
						"interpolate",
						["linear"],
						["zoom"],
						15,
						0,
						15.05,
						["get", "height"],
					],
					"fill-extrusion-base": [
						"interpolate",
						["linear"],
						["zoom"],
						15,
						0,
						15.05,
						["get", "min_height"],
					],
					"fill-extrusion-opacity": 0.6,
				},
			},
			labelLayerId
		);
	});
	*/
  map.on("load", () => {
    map.addSource("floorplan", {
      type: "geojson",
      // 'data': 'http://localhost:3000/geojson/16-collyer-quay-mix.geojson'
      data: geojson,
    });
    map.addLayer({
      id: "room-extrusion",
      type: "fill-extrusion",
      //type: "line",
      source: "floorplan",
      paint: {
        // Get the `fill-extrusion-color` from the source `color` property.
        //"fill-extrusion-color": ["get", "color"],
        "fill-extrusion-color": "#ffffff", 
        
        // Get `fill-extrusion-height` from the source `height` property.
        // 'fill-extrusion-height': ['get', 'height'],
        //"fill-extrusion-height": ["get", "height"],
        // "fill-extrusion-height": ['/',
        // ['get', 'height', ['get', 'options']],
        // 100],
        //
        "fill-extrusion-height": [
          "+",
          ["*", ["to-number", ["get", "levelIndex"]], 3],
          ["/", ["get", "height", ["get", "options"]], 100]
        ],

        // Get `fill-extrusion-base` from the source `base_height` property.
        "fill-extrusion-base": ["*", ["get", "levelIndex"], 300],
        

        // Make extrusions slightly opaque to see through indoor walls.
        "fill-extrusion-opacity": 0.8,
        //'line-width': ['get', ['get', 'options'], 'thickness']
        "line-color": "#ED1C24",
      },
    });
    map.addControl(new mapboxgl.NavigationControl());

    // Triger Layer
    map.on("click", "room-extrusion", (e) => {
      // Get the properties of the clicked feature
      const properties = e.features[0].properties;
      console.log("Triger Layer =>", properties);

      // You can trigger other actions based on the clicked properties
      // For example, showing a popup with room information
      new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`<h3>${properties.name}</h3><p>${properties.type}</p>`)
        .addTo(map);
    });

    // Change the cursor to a pointer when the mouse is over the room-extrusion layer
    map.on("mouseenter", "room-extrusion", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    // Change the cursor back when it leaves the room-extrusion layer
    map.on("mouseleave", "room-extrusion", () => {
      map.getCanvas().style.cursor = "";
    });
  });
};

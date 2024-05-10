import geojson from "../utils/data.json";

export const useGeo = () => {
	mapboxgl.accessToken =
		"pk.eyJ1IjoicmFqaWZtYWhlbmRyYSIsImEiOiJjbHVjYTI2d2MwcnBzMmxxbndnMnNlNTUyIn0.aaCGYQ2OYIcIsAa4X-ILDA";
	const map = new mapboxgl.Map({
		// Choose from Mapbox's core styles, or make your own style with Mapbox Studio
		style: "mapbox://styles/mapbox/light-v11",
		center: [103.85266553640567,
						1.2841309586464738],
		zoom: 15.5,
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
	map.on('load', () => {
        map.addSource('floorplan', {
            'type': 'geojson',
            // 'data': 'http://localhost:3000/geojson/16-collyer-quay-mix.geojson'
            'data': geojson
        });
        map.addLayer({
            'id': 'room-extrusion',
            'type': 'fill-extrusion',
            'source': 'floorplan',
            'paint': {
                // Get the `fill-extrusion-color` from the source `color` property.
                'fill-extrusion-color': ['get', 'color'],

                // Get `fill-extrusion-height` from the source `height` property.
                // 'fill-extrusion-height': ['get', 'height'],
                'fill-extrusion-height': ['get', 'height'],

                // Get `fill-extrusion-base` from the source `base_height` property.
                'fill-extrusion-base': 0,

                // Make extrusions slightly opaque to see through indoor walls.
                'fill-extrusion-opacity': 0.8
            }
        });
        map.addControl(new mapboxgl.NavigationControl());
    });
};

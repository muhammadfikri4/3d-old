import geojson from "../utils/data-split-2.json";
import $ from 'jquery';

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

	// Toggle Function (Select Floor)
	let maxIndex = 2; // Ini perlu di get dari maximal level index yg ada di geojson
	let currentIndex = 2; // Default value
	$(".select-floor").click(function(ev) {
		currentIndex = parseInt(ev.currentTarget.getAttribute('index'));
		toggle(currentIndex)
	});

	function toggle(levelIndex) {
		map.setFilter('room-extrusion', ["==", ["to-number", ["get", "levelIndex"]], levelIndex])
	}
	// --------------------------------------------------------------------------------------------

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
				// "fill-extrusion-height": [
				// 	"+",
				// 	["*", ["to-number", ["get", "levelIndex"]], 3],
				// 	["/", ["get", "height", ["get", "options"]], 50]
				// ],

				// Get `fill-extrusion-base` from the source `base_height` property.
				// "fill-extrusion-base": ["*", ["get", "levelIndex"], 3],

				// Get fill-extrusion-height from the source 'height' property.
                'fill-extrusion-height': ['get', 'height'],

                // Get fill-extrusion-base from the source 'base_height' property.
                'fill-extrusion-base': ['get', 'base_height'],
				

				// Make extrusions slightly opaque to see through indoor walls.
				"fill-extrusion-opacity": 0.8,
				//'line-width': ['get', ['get', 'options'], 'thickness']
				"line-color": "#ED1C24",
			},
		});
		map.addControl(new mapboxgl.NavigationControl());
		// map.on('drag', function() {
		// 	setTimeout(function() {
		// 		console.log('New Center:', map.getCenter());
		// 		console.log('New Zoom:', map.getZoom());
		// 		const center = map.getCenter();
		// 		const zoom = map.getZoom();
		// 		console.log('REST API: https://example.com/map?latitude=' + center.lat + '&longitude=' + center.lng + '&zoom=' + zoom)
		// 	}, 2000);
		// });
		// Triger Layer
		map.on("click", "room-extrusion", (e) => {
			// Get the properties of the clicked feature
			const properties = e.features[0].properties;
			console.log("Triger Layer =>", properties);

			// You can trigger other actions based on the clicked properties
			// For example, showing a popup with room information
			new mapboxgl.Popup()
				.setLngLat(e.lngLat)
				.setHTML(`<h3>${properties.name}</h3><p>name: ${properties.name}<br />Type: ${properties.type}<br />ID: ${properties.id}</p>`)
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

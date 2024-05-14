import { ARButton } from "../../assets/jsm/webxr/ARButton.js";
import { VRButton } from "../../assets/jsm/webxr/VRButton.js";
import { OrbitControls } from "../../assets/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "../../assets/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "../../assets/jsm/loaders/RGBELoader.js";
import { RoughnessMipmapper } from "../../assets/jsm/utils/RoughnessMipmapper.js";
import * as THREE from "../../assets/jsm/build/three.module.js";
import Lantai from "../../assets/geojson/lantai.geojson";
import PureskyTeksture from "../../assets/jsm/textures/puresky.hdr";
import LowPolyBuilding from "../../assets/3d/low_poly_building.glb";
import TowerSquare from "../../assets/glb/tower-square/file.glb";

export function useHooksType1() {
  var container;
  var camera, scene, renderer;
  var controller;
  let slices = [];
  var reticle, pmremGenerator, current_object, controls, isAR, envmap;
  // var mapboxEndpoint = 'https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmFqaWZtYWhlbmRyYSIsImEiOiJjbHVjYTI2d2MwcnBzMmxxbndnMnNlNTUyIn0.aaCGYQ2OYIcIsAa4X-ILDA';
  // var mapboxEndpoint = 'https://api.mapbox.com/styles/v1/{username}/{style_id}/tiles/{tilesize}/{z}/{x}/{y}{@2x}';
  // var mapboxEndpoint = 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/512/1/1/0@2x?access_token=pk.eyJ1IjoicmFqaWZtYWhlbmRyYSIsImEiOiJjbHVjYTI2d2MwcnBzMmxxbndnMnNlNTUyIn0.aaCGYQ2OYIcIsAa4X-ILDA';

  // Mapbox endpoint URL
  const mapboxEndpoint = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/103.8595883335991,1.3027646730696176,17,60,0/1280x1280?access_token=pk.eyJ1IjoicmFqaWZtYWhlbmRyYSIsImEiOiJjbHVjYTI2d2MwcnBzMmxxbndnMnNlNTUyIn0.aaCGYQ2OYIcIsAa4X-ILDA`;

  var hitTestSource = null;
  var hitTestSourceRequested = false;

  init();
  animate();

  loadModel(LowPolyBuilding);

  $("#ARButton").click(function () {
    current_object.visible = false;
    isAR = true;
  });

  $("#VRButton").click(function () {
    scene.background = envmap;
    scene.position.z = -2;
  });

  $("#place-button").click(function () {
    arPlace();
  });

  $("#flythrough").click(function () {
    console.log("Run");
    const targetPosition = new THREE.Vector3(0, 0, 10);
    const targetRotation = new THREE.Euler(0, Math.PI, 0);
    const targetFOV = 45;

    const duration = 5000; // detik

    const positionTween = new TWEEN.Tween(camera.position)
      .to(targetPosition, duration)
      .easing(TWEEN.Easing.Quadratic.InOut);

    const rotationTween = new TWEEN.Tween(camera.rotation)
      .to(targetRotation, duration)
      .easing(TWEEN.Easing.Quadratic.InOut);

    const fovTween = new TWEEN.Tween(camera)
      .to({ fov: targetFOV }, duration)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        camera.updateProjectionMatrix();
      });

    // Start tweens
    positionTween.start();
    rotationTween.start();
    fovTween.start();
  });

  function arPlace() {
    if (reticle.visible) {
      current_object.position.setFromMatrixPosition(reticle.matrix);
      current_object.visible = true;
    }
  }
  function loadModel(model) {
    new RGBELoader()
      .setDataType(THREE.UnsignedByteType)
      .load(PureskyTeksture, function (texture) {
        envmap = pmremGenerator.fromEquirectangular(texture).texture;
        scene.environment = envmap;
        texture.dispose();
        pmremGenerator.dispose();
        render();

        var loader = new GLTFLoader();
        loader.load(model, function (glb) {
          current_object = glb.scene;
          scene.background = envmap;
          scene.position.z = -2;
          scene.add(current_object);

          const geometry = new THREE.PlaneGeometry(200, 200); // Adjust size as needed

          // Load Mapbox tiles -> GRID
          const textureLoader = new THREE.TextureLoader();
          textureLoader.load(mapboxEndpoint, function (mapTexture) {
            const material = new THREE.MeshBasicMaterial({ map: mapTexture });
            const mapMesh = new THREE.Mesh(geometry, material);

            mapMesh.position.set(0, 0, 0);
            mapMesh.rotation.x = -Math.PI / 2;
            scene.add(mapMesh);
          });

          // Raycaster
          const raycaster = new THREE.Raycaster();
          const meshMap = new Map();

          current_object.traverse(function (child) {
            if (child.isMesh) {
              meshMap.set(child, {
                mesh: child,
                material: child.material.clone(),
              });

              child.material.transparent = true;
              child.material.opacity = 0.7;
            }
          });

          // mousemove/hover
          renderer.domElement.addEventListener("mousemove", onMouseMove);

          function onMouseMove(event) {
            const mouse = new THREE.Vector2(
              (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
              -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
            );

            // Update raycaster
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(
              Array.from(meshMap.keys())
            );

            meshMap.forEach((entry) => {
              entry.mesh.material.copy(entry.material);
            });
            intersects.forEach((intersect) => {
              intersect.object.material.opacity = 1; // Increase opacity for intersected mesh
            });
          }

          renderer.domElement.addEventListener("mouseout", () => {
            meshMap.forEach((entry) => {
              renderer.domElement.style.cursor = "pointer";
              entry.mesh.material.copy(entry.material);
              // console.log(entry.material.name)
              $("#hoverHistory").prepend(entry.material.name + "<br/>");
            });
          });

          let slicecnt = 0;
          current_object.traverse(function (child) {
            if (child.isMesh) {
              slicecnt++;
            }
          });

          console.log("slices total = ", slicecnt);

          arPlace();

          var box = new THREE.Box3();
          box.setFromObject(current_object);
          box.center(controls.target);

          controls.update();
          render();
        });
      });
  }

  function onOrbitControlsChange() {
    var x = controls.getPolarAngle() * (180 / Math.PI);
  }

  function init() {
    container = document.createElement("div");
    document.getElementById("container").appendChild(container);

    scene = new THREE.Scene();
    window.scene = scene;

    camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      200
    );

    var directionalLight = new THREE.DirectionalLight(0xdddddd, 1);
    directionalLight.position.set(0, 0, 5).normalize();
    scene.add(directionalLight);

    var ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener("change", render);
    controls.addEventListener("change", onOrbitControlsChange);
    controls.minDistance = 9;
    controls.maxDistance = 50;
    controls.target.set(0, 0, -0.2);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2; // Set biar ga bs puter kebawah

    //VR SETUP
    // document.body.appendChild(VRButton.createButton(renderer));

    //AR SETUP
    let options = {
      requiredFeatures: ["hit-test"],
      optionalFeatures: ["dom-overlay"],
    };

    options.domOverlay = { root: document.getElementById("content") };

    reticle = new THREE.Mesh(
      new THREE.RingBufferGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial()
    );
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);

    window.addEventListener("resize", onWindowResize, false);

    renderer.domElement.addEventListener(
      "touchstart",
      function (e) {
        e.preventDefault();
        touchDown = true;
        touchX = e.touches[0].pageX;
        touchY = e.touches[0].pageY;
      },
      false
    );

    renderer.domElement.addEventListener(
      "touchend",
      function (e) {
        e.preventDefault();
        touchDown = false;
      },
      false
    );

    renderer.domElement.addEventListener(
      "touchmove",
      function (e) {
        e.preventDefault();

        if (!touchDown) {
          return;
        }

        deltaX = e.touches[0].pageX - touchX;
        deltaY = e.touches[0].pageY - touchY;
        touchX = e.touches[0].pageX;
        touchY = e.touches[0].pageY;

        rotateObject();
      },
      false
    );
  }

  var touchDown, touchX, touchY, deltaX, deltaY;

  function rotateObject() {
    if (current_object && reticle.visible) {
      current_object.rotation.y += deltaX / 100;
    }
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    renderer.setAnimationLoop(render);
    requestAnimationFrame(animate);
    controls.update();

    TWEEN.update(); // tambahin buat muter2
  }

  function render(timestamp, frame) {
    if (frame && isAR) {
      var referenceSpace = renderer.xr.getReferenceSpace();
      var session = renderer.xr.getSession();

      if (hitTestSourceRequested === false) {
        session.requestReferenceSpace("viewer").then(function (referenceSpace) {
          session
            .requestHitTestSource({ space: referenceSpace })
            .then(function (source) {
              hitTestSource = source;
            });
        });

        session.addEventListener("end", function () {
          hitTestSourceRequested = false;
          hitTestSource = null;

          isAR = false;

          reticle.visible = false;

          var box = new THREE.Box3();
          box.setFromObject(current_object);
          box.center(controls.target);

          document.getElementById("place-button").style.display = "none";
        });

        hitTestSourceRequested = true;
      }

      if (hitTestSource) {
        var hitTestResults = frame.getHitTestResults(hitTestSource);
        if (hitTestResults.length) {
          var hit = hitTestResults[0];
          document.getElementById("place-button").style.display = "block";
          reticle.visible = true;
          reticle.matrix.fromArray(
            hit.getPose(referenceSpace).transform.matrix
          );
        } else {
          reticle.visible = false;
          document.getElementById("place-button").style.display = "none";
        }
      }
    }

    renderer.render(scene, camera);
  }
}

export function useHooksType2() {
  mapboxgl.accessToken =
    "pk.eyJ1IjoicmFqaWZtYWhlbmRyYSIsImEiOiJjbHVjYTI2d2MwcnBzMmxxbndnMnNlNTUyIn0.aaCGYQ2OYIcIsAa4X-ILDA";

  // Initialize Mapbox map instance
  var map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/rajifmahendra/cluqbrp4u00w901r2fuiw5ars",
    zoom: 19,
    center: [103.8153255190278, 1.28378932235033],
    pitch: 60,
  });

  /**
   * Load 3d Object
   */
  const modelOrigin = [103.81541164491, 1.2836509244506544];
  const modelAltitude = 0;
  const modelRotate = [Math.PI / 2, 2.9, 0];

  const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
    modelOrigin,
    modelAltitude
  );

  const modelTransform = {
    translateX: modelAsMercatorCoordinate.x,
    translateY: modelAsMercatorCoordinate.y,
    translateZ: modelAsMercatorCoordinate.z,
    rotateX: modelRotate[0],
    rotateY: modelRotate[1],
    rotateZ: modelRotate[2],
    scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits(),
  };

  const THREE = window.THREE;

  /**
   * Lantai 1 sample
   */
  const lantai_1 = {
    id: "3d-model",
    type: "custom",
    renderingMode: "3d",
    onAdd: function (map, gl) {
      this.camera = new THREE.PerspectiveCamera();
      this.scene = new THREE.Scene();

      const directionalLight = new THREE.DirectionalLight(0xffffff);
      directionalLight.position.set(10, -70, -105).normalize();
      this.scene.add(directionalLight);

      const directionalLight2 = new THREE.DirectionalLight(0xffffff);
      directionalLight2.position.set(10, -70, -105).normalize();
      this.scene.add(directionalLight2);

      const loader = new THREE.GLTFLoader();
      loader.load(TowerSquare, (gltf) => {
        this.scene.add(gltf.scene);
        this.gltf = gltf;
      });
      this.map = map;

      // use the Mapbox GL JS map canvas for three.js
      this.renderer = new THREE.WebGLRenderer({
        canvas: map.getCanvas(),
        context: gl,
        antialias: true,
      });
      this.renderer.setSize(map.getCanvas().width, map.getCanvas().height);
      this.renderer.autoClear = false;
    },
    render: function (gl, matrix) {
      const rotationX = new THREE.Matrix4().makeRotationAxis(
        new THREE.Vector3(1, 0, 0),
        modelTransform.rotateX
      );
      const rotationY = new THREE.Matrix4().makeRotationAxis(
        new THREE.Vector3(0, 1, 0),
        modelTransform.rotateY
      );
      const rotationZ = new THREE.Matrix4().makeRotationAxis(
        new THREE.Vector3(0, 0, 1),
        modelTransform.rotateZ
      );

      const m = new THREE.Matrix4().fromArray(matrix);
      const l = new THREE.Matrix4()
        .makeTranslation(
          modelTransform.translateX,
          modelTransform.translateY,
          modelTransform.translateZ
        )
        .scale(
          new THREE.Vector3(
            modelTransform.scale,
            -modelTransform.scale,
            modelTransform.scale
          )
        )
        .multiply(rotationX)
        .multiply(rotationY)
        .multiply(rotationZ);

      this.camera.projectionMatrix = m.multiply(l);
      this.renderer.resetState();
      this.renderer.render(this.scene, this.camera);
      this.map.triggerRepaint();
    },
  };

  map.on("style.load", function () {
    fetch(Lantai)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error network");
        }
        return response.json();
      })
      .then((data) => {
        data.forEach((item) => {
          var layer_id = item.features[0].layer.id;
          var source_layer_id = "source-" + layer_id;
          map.addSource(source_layer_id, {
            type: "geojson",
            data: item,
          });
          map.addLayer({
            id: layer_id,
            type: "fill-extrusion",
            source: source_layer_id,
            paint: {
              "fill-extrusion-color": "#088",
              "fill-extrusion-height": ["get", "height"],
              "fill-extrusion-base": ["get", "altitude"],
              "fill-extrusion-opacity": 0.5,
            },
          });
          // console.log("Layer ID = " + item.features[0].layer.id);
        });
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });

    map.addLayer(lantai_1);

    map.on("mousemove", function (e) {
      var features = map.queryRenderedFeatures(e.point);
      map.getCanvas().style.cursor = features.length ? "pointer" : "";
      var resetColor =
        features.length &&
        !features.some(
          (feature) =>
            feature.layer?.id === "3d-lantai-1" ||
            feature.layer?.id === "3d-lantai-2" ||
            feature.layer?.id === "3d-lantai-3" ||
            feature.layer?.id === "3d-lantai-4" ||
            feature.layer?.id === "3d-lantai-5" ||
            feature.layer?.id === "3d-lantai-6"
        );

      if (features.length && !resetColor) {
        var layerId = features[0].layer?.id;
        if (layerId) {
          console.log("Hovered Layer ID:", layerId);
          map.setPaintProperty(layerId, "fill-extrusion-color", "#f00");
        }
      } else {
        // Reset color
        map.setPaintProperty("3d-lantai-1", "fill-extrusion-color", "#088");
        map.setPaintProperty("3d-lantai-2", "fill-extrusion-color", "#088");
        map.setPaintProperty("3d-lantai-3", "fill-extrusion-color", "#088");
        map.setPaintProperty("3d-lantai-4", "fill-extrusion-color", "#088");
        map.setPaintProperty("3d-lantai-5", "fill-extrusion-color", "#088");
        map.setPaintProperty("3d-lantai-6", "fill-extrusion-color", "#088");
      }
    });

    // Add click event listener to the map
    map.on("click", function (e) {
      var features = map.queryRenderedFeatures(e.point);
      if (!features.length) {
        return;
      }
      var layerId = features[0].layer?.id;
      if (layerId) {
        $("#output-event-click").prepend(`Klik layer ` + layerId + "<br />");
        console.log("Layer ID:", layerId);
      }
    });

    // Add bearing control
    map.getCanvas().addEventListener("mousedown", function (e) {
      if (e.button === 2) {
        // Right mouse button
        map.dragPan.disable();
        map.on("mousemove", onMouseMove);
        map.on("mouseup", onMouseUp);
      }
    });

    function onMouseMove(e) {
      var bearingDelta = e.originalEvent.movementX * 0.1;
      var bearing = map.getBearing();
      map.setBearing(bearing - bearingDelta);
    }

    function onMouseUp(e) {
      map.dragPan.enable();
      map.off("mousemove", onMouseMove);
      map.off("mouseup", onMouseUp);
    }

    map.on("wheel", function (e) {
      var bearingDelta = e.originalEvent.deltaY * 0.1;
      var bearing = map.getBearing();
      var targetBearing = bearing - bearingDelta;

      map.flyTo({
        bearing: targetBearing,
        easing: function (t) {
          return t;
        },
        duration: 10000, // Animasi
      });
    });
  });
  map.addControl(new mapboxgl.NavigationControl());
}

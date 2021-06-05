import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js";


let globeContainer = document.querySelector(".map-container");


//////////////////////////////data loading

const api_url = 'https://www.trackcorona.live/api/countries';

async function getapi(url) {
    
  var fetchedData = await fetch(url);
  var data = await fetchedData.json();
  await showData(data.data);         
    
}
getapi(api_url);

async function showData(data)
{
    animate();
    changeToCountry(data);
    
}


// THREE js code

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  globeContainer.clientWidth / globeContainer.clientHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(globeContainer.clientWidth, globeContainer.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
globeContainer.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// create raycaster for mouse interaction
const raycaster = new THREE.Raycaster();

// create vector2 for mouse and mobile x,y coordinates
const mouse = new THREE.Vector2()

// creating sphere -> globe
// earth map
let earthMap = new THREE.TextureLoader().load("./img/earthmap4k.jpg");

// earth bump map
let earthBumpMap = new THREE.TextureLoader().load("./img/earthbump4k.jpg");

// earth space map -> gives shininess to earth surrounding
let earthSpaceMap = new THREE.TextureLoader().load("./img/earthspec4k.jpg");

// geometry

let earthGeometry = new THREE.SphereGeometry(10, 32, 32); //SphereGemoetry param -> radius, widthSegments, heightSegments
let earthMaterial = new THREE.MeshPhongMaterial({
  map: earthMap,
  bumpMap: earthBumpMap,
  bumpScale: 0.1,
  specularMap: earthSpaceMap,
  specular: new THREE.Color("grey"),
});

const earth = new THREE.Mesh(earthGeometry, earthMaterial);

scene.add(earth);

// add clouds to the earth object
let cloudsGeometry = new THREE.SphereGeometry(10, 32, 32);

// add cloud textures
let cloudsTexture = new THREE.TextureLoader().load(
  "./img/earthhiresclouds4K.jpg"
);

// add cloud material
let cloudsMaterial = new THREE.MeshLambertMaterial({
  color: 0xffffff,
  map: cloudsTexture,
  transparent: true,
  opacity: 0.3,
});

let earthClouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);

// scale above the earth sphere mesh
earthClouds.scale.set(1.015, 1.015, 1.015);

//make child of the earth
earth.add(earthClouds);

// create variable to store array of lights
let lights = [];

// create skyBox to add more attractiveness
function createSkyBox(scene) {
  const loader = new THREE.CubeTextureLoader();
  const texture = loader.load([
    "./img/space_right.png",
    "./img/space_left.png",
    "./img/space_top.png",
    "./img/space_bot.png",
    "./img/space_front.png",
    "./img/space_back.png",
  ]);
  scene.background = texture;
}

// createLights is a function which creates the lights and adds them to the scene.
function createLights(scene) {
  lights[0] = new THREE.PointLight("#004d99", 0.5, 0);
  lights[1] = new THREE.PointLight("#004d99", 0.5, 0);
  lights[2] = new THREE.PointLight("#004d99", 0.7, 0);
  lights[3] = new THREE.AmbientLight("#ffffff");

  lights[0].position.set(200, 0, -400);
  lights[1].position.set(200, 200, 400);
  lights[2].position.set(-200, -200, -50);

  scene.add(lights[0]);
  scene.add(lights[1]);
  scene.add(lights[2]);
  scene.add(lights[3]);
}

// add scene objects
function addSceneObjects(scene) {
  createLights(scene);
  createSkyBox(scene);
}

addSceneObjects(scene);

camera.position.z = 20;

// disable control function so that user dont zoom in or zoom out too much
controls.minDistance = 12;
controls.maxDistance = 20;
controls.enablePen = false;
controls.update();
controls.saveState();

//----------- add event listeners ----------

globeContainer.addEventListener("resize", onWindowResize, false);
globeContainer.addEventListener("click", onWindowClick,false);
globeContainer.addEventListener("mousemove", onWindowHover ,false);


function onWindowResize() {
  camera.aspect = globeContainer.clientWidth / globeContainer.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(globeContainer.clientWidth, globeContainer.clientHeight);
}

function onWindowClick(event){
  
  event.preventDefault();
  mouse.x = (event.clientX / globeContainer.clientWidth) * 2 - 1;
  mouse.y = - (event.clientY / globeContainer.clientHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  let prevElem = document.body.querySelector(".country-info-container");
    if(prevElem!=undefined)
    {
      console.log("possible");
      document.body.querySelector(".country-info-container").remove();
    }
  

  let intersects = raycaster.intersectObjects(earthClouds.children);
  
  for(let i = 0 ; i < intersects.length ; i++){
    
   
    let divElem = document.createElement("div");
    divElem.setAttribute("class","country-info-container");
    divElem.style.position = "absolute";
    divElem.style.top = event.clientY + "px" ;
    divElem.style.left = event.clientX + "px";
    divElem.innerHTML = `<img class = "flag" src="https://corona.lmao.ninja/assets/img/flags/${intersects[0].object.userData.code}.png">
                
    <div class="covid-cases-container">
        
        <div class="card-title"><b>${intersects[0].object.userData.country}</b></div>
        <div class="card-spacer"></div>
        <hr />
        <div class="card-spacer"></div>
        <div class = "cases-info">Cases: ${intersects[0].object.userData.confirmed}</div> 
        <div class = "cases-info">Deaths: ${intersects[0].object.userData.dead}</div> 
        <div class = "cases-info">Recovered: ${intersects[0].object.userData.recovered}</div>
        
        
    </div>`
    globeContainer.append(divElem);
    


  }

}

function onWindowHover(event){
  
  event.preventDefault();
  mouse.x = (event.clientX / globeContainer.clientWidth) * 2 - 1;
  mouse.y = - (event.clientY / globeContainer.clientHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  let prevElem = document.body.querySelector(".tooltip");
    if(prevElem!=undefined)
    {
      console.log("possible");
      document.body.querySelector(".tooltip").remove();
    }

  let intersects = raycaster.intersectObjects(earthClouds.children);
  
  for(let i = 0 ; i < intersects.length ; i++){

    if(document.body.querySelector(".tooltip")==undefined)
    {
      let divElem = document.createElement("div");
      divElem.setAttribute("class","country-info-container");
      divElem.classList.add("tooltip");
      divElem.style.position = "absolute";
      divElem.style.top = event.clientY + "px" ;
      divElem.style.left = event.clientX + "px";
      divElem.innerHTML = `<img class = "flag" src="https://corona.lmao.ninja/assets/img/flags/${intersects[0].object.userData.code}.png">
                  
      <div class="covid-cases-container">
          
          <div class="card-title"><b>${intersects[0].object.userData.country}</b></div>
          <div class="card-spacer"></div>
          <hr />
          <div class="card-spacer"></div>
          <div class = "cases-info">Cases: ${intersects[0].object.userData.confirmed}</div> 
          <div class = "cases-info">Deaths: ${intersects[0].object.userData.dead}</div> 
          <div class = "cases-info">Recovered: ${intersects[0].object.userData.recovered}</div>
          
          
      </div>`

      globeContainer.append(divElem);
    }
    
  }
}


function animate() {
  requestAnimationFrame(animate);
  render();
  controls.update();
}

function render() {
  renderer.render(scene, camera);
}


// removes the points of interest freeing up memory and space to have better performance
function removeChildren(){
  let destroy = earthClouds.children.length;
  while(destroy--){
    earthClouds.remove(earthClouds.children[destroy].material.despose())
    earthClouds.remove(earthClouds.children[destroy].geometry.despose())
    earthClouds.remove(earthClouds.children[destroy])

  }
}


// let countryInfo = document.getElementById("country");
// countryInfo.addEventListener("click",changeToCountry);

function addCountryCode(earth,country,code,latitude,longitude,color,confirmed,dead,recovered)
{
  let pointOfInterest = new THREE.ConeGeometry(0.2, 1, 20, 10,true);
  let lat = latitude * (Math.PI / 180);
  let lon = -longitude * (Math.PI / 180);
  const radius = 10;
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  let material = new THREE.MeshBasicMaterial({
    color: color,
  });
  let mesh = new THREE.Mesh(pointOfInterest, material);

  mesh.position.set(
    Math.cos(lat) * Math.cos(lon) * radius,
    Math.sin(lat) * radius,
    Math.cos(lat) * Math.sin(lon) * radius
  );

  mesh.rotation.set(0.0, -lon, lat - Math.PI * 0.5);
  
  mesh.userData.country = country;
  mesh.userData.code = code;
  mesh.userData.color = color;
  mesh.userData.confirmed = confirmed;
  mesh.userData.dead = dead;
  mesh.userData.recovered = recovered ;
  
  earthClouds.add(mesh);

  

}


function changeToCountry(data) {
  
  
  removeChildren();
  // Get the data from the JSON file
  for (let i = 0; i < data.length; i++) {
    if (data[i].confirmed <= 10) {
      addCountryCode(
        earth,
        data[i].location,
        data[i].country_code,
        data[i].latitude,
        data[i].longitude,
        "white",
        data[i].confirmed,
        data[i].dead,
        data[i].recovered
      );
    } else if (data[i].confirmed <= 500) {
      addCountryCode(
        earth,
        data[i].location,
        data[i].country_code,
        data[i].latitude,
        data[i].longitude,
        "yellow",
        data[i].confirmed,
        data[i].dead,
        data[i].recovered
      );
    } else if (data[i].confirmed > 500) {
      addCountryCode(
        earth,
        data[i].location,
        data[i].country_code,
        data[i].latitude,
        data[i].longitude,
        "red",
        data[i].confirmed,
        data[i].dead,
        data[i].recovered
      );
    } 
  }

}

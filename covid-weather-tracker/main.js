import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js";


let globeContainer = document.querySelector(".map-container");
var covidIcon = document.querySelector(".covid-icon");
var weatherIcon = document.querySelector(".weather-icon");
let imgContainer = document.querySelector(".image-container");
let displayInfoContainer = document.querySelector('.display-info-container');
let infoContainer = document.querySelector('.info-container');

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

window.addEventListener("resize", onWindowResize, false);
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
    
    var name = intersects[0].object.userData.country;
    var confirm = numberWithCommas(intersects[0].object.userData.confirmed);
    var dead = numberWithCommas(intersects[0].object.userData.dead);
    var recover = numberWithCommas(intersects[0].object.userData.recovered);

    if(!weatherIcon.classList.contains("active"))
    {
      document.querySelector(".info-title").innerText = name;
      document.querySelector(".confirmed-cases").innerText = confirm;
      document.querySelector(".death-cases").innerText = dead;
      document.querySelector(".recovered-cases").innerText = recover;
    }

    let divElem = document.createElement("div");
    divElem.setAttribute("class","country-info-container");
    divElem.style.position = "absolute";
    divElem.style.top = event.clientY + "px" ;
    divElem.style.left = event.clientX + "px";
    divElem.innerHTML = `<img class = "flag" src="https://corona.lmao.ninja/assets/img/flags/${intersects[0].object.userData.code}.png">
                
    <div class="covid-cases-container">
        
        <div class="card-title"><b>${name}</b></div>
        <div class="card-spacer"></div>
        <hr />
        <div class="card-spacer"></div>
        <div class = "cases-info">Cases: ${confirm}</div> 
        <div class = "cases-info">Deaths: ${dead}</div> 
        <div class = "cases-info">Recovered: ${recover}</div>
        
        
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
          <div class = "cases-info">Cases: ${numberWithCommas(intersects[0].object.userData.confirmed)}</div> 
          <div class = "cases-info">Deaths: ${numberWithCommas(intersects[0].object.userData.dead)}</div> 
          <div class = "cases-info">Recovered: ${numberWithCommas(intersects[0].object.userData.recovered)}</div>
          
          
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

// function to convert data into comma
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}



// event listener for menu buttons

covidIcon.addEventListener("click",function(){

  if(!covidIcon.classList.contains("active"))
  {
    weatherIcon.classList.remove("active");
    covidIcon.classList.add("active");
    displayInfoContainer.remove();
    infoContainer.innerHTML += ` <div class="image-container">
    <img class = "covid-img" src="img/corona-virus.png" alt="covid-19">
  </div>


  <!-- ----------------------- display info ------------------- -->
  <div class="display-info-container">

      <div class="info-title"></div>
      <div class="row">
      <div class="card confirmed-card">
        <span class="case-title">Confirmed Cases</span>
        <img class="img" src="img/confirmed.gif">
        <div class="info confirmed-info"><span class="confirmed-cases"></span></div>
       </div>
       <div class="card death-card">
        <span class="case-title">Death Cases</span>
        <img class="img" src="img/dead.gif">
        <div class="info death-info"><span class="death-cases"></span></div>
        </div>
      </div>
      <div class="row">
        <div class="card recovered-card">
          <span class="case-title">Recovered Cases</span>
        <img class="img" src="img/recovered.gif">
        <div class="info recovered-info"><span class="recovered-cases"></span></div>
        </div>
      </div>

  </div>`;


  }
})

weatherIcon.addEventListener("click",function(){

  if(!weatherIcon.classList.contains("active"))
  {
    covidIcon.classList.remove("active");
    weatherIcon.classList.add("active");
    imgContainer.remove();
    displayInfoContainer = document.querySelector('.display-info-container');
    displayInfoContainer.innerHTML = "";
    displayInfoContainer.classList.add('weather-display-info-container');
    displayInfoContainer.innerHTML = ` <!-- ----------locations --------- -->
          <div class="location-input-container">
            <div class="current-location-container">
            
                <i class="fas fa-map-marker-alt">
                  <span class="tooltiptext">Current Location</span>
                </i>
            </div>

            <div class="container">
              <input placeholder='Search for City' class='js-search' type="text">
              <i class="fa fa-search"></i>
            </div>
          </div>

          <!-- ------------ display details -->

          <div class="display-data-container">

            <div class="current-info-container">
              <div class="day">Tuesday</div>
              <div class="date">June 6,2021 11:05 PM</div>
              <div class="city-name">Delhi</div>
            </div>
            <div class="current-temp-container">
              <div class="temp-container">
              
                  <p class="temperature">
                    <span class="temp">26</span><sup>°</sup>
                  </p>

              </div>
              <div class="temp-img">
                <i class="fas fa-cloud-sun-rain" aria-hidden="true"></i>
              </div>
            </div>
          </div>

          <!-- ------------- weather ------ -->
          <div class="weather-type-container">
            <div class="weather-type">Haze</div>
            <div class="weather-status">It's Too Hot!!!</div>
          </div>`;

    let api_key = '742c39fd1acd4a416a031b2b2e4e2c91';


    let currLoc = document.querySelector(".fa-map-marker-alt");
    let inputCity = document.querySelector(".js-search");
    let weekday = document.querySelector(".day");
    let dateTime = document.querySelector(".date");
    let cityName= document.querySelector(".city-name");
    let temp = document.querySelector(".temp");
    let daysArr = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    let monthsArr = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    let mapContainer = document.querySelector('.weather-display-info-container');
    let weatherType = document.querySelector('.weather-type');
    let weatherStatus = document.querySelector('.weather-status');
    currLoc.addEventListener("click",geoFindMe);
    
    inputCity.addEventListener("keydown",function(e)
    {
        if(e.key=="Enter")
        {
            let city = inputCity.value;
            if(city!="")
            {
                inputCity.value="";
                callWeatherApi(city,null,null);
            }
    
            
        }
    });
    
    
    async function callWeatherApi(city,latitude,longitude)
    {
        var weather_url = "";
        if(city==null)
        {
            weather_url = `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${api_key}`;
        }
        else
        {
            weather_url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key}`;
        }
        var fetchedData = await fetch(weather_url);
        var data = await fetchedData.json();
        await showWeather(data); 
        
    }
    
    async function showWeather(data)
    {
        
        var weather = data.weather[0].main;
        console.log(weather);
        var date = new Date();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        
        // Check whether AM or PM
        var newformat = hours >= 12 ? 'PM' : 'AM'; 
        
        // Find current hour in AM-PM Format
        hours = hours % 12; 
        
        // To display "0" as "12"
        hours = hours ? hours : 12; 
        minutes = minutes < 10 ? '0' + minutes : minutes;
        
        weekday.innerText = daysArr[date.getDay()];
        dateTime.innerText = monthsArr[date.getMonth()] + " " + date.getDate() + "," + date.getFullYear() + " " + hours + ':' + minutes + ' ' + newformat;
        cityName.innerText = data.name;
        temp.innerText = getTemp(data.main.temp);
    
        weatherType.innerText = weather;
        if(weather=='Rain')
        {
            mapContainer.style.backgroundImage = `url("https://www.google.com/url?sa=i&url=https%3A%2F%2Fforums.synfig.org%2Ft%2Fthere-must-be-a-better-way-to-do-this-animating-rain%2F3838&psig=AOvVaw24Eck2rsYkUcwLj7Zt4cC-&ust=1623074482821000&source=images&cd=vfe&ved=0CAIQjRxqFwoTCNDEteiVg_ECFQAAAAAdAAAAABAKf")`;
            weatherStatus.innerText = "Don't forget your umbrellas!!!"
        }
        else if(weather=='Clouds')
        {
            mapContainer.style.backgroundImage = `url("https://i.pinimg.com/originals/e3/25/4b/e3254ba120e6e28688b59925ca5a277a.gif")`;
            weatherStatus.innerText = "Head towards your home!!!"
        }
        else if(weather=='Clear')
        {
            mapContainer.style.backgroundImage = `url("https://i.graphicmama.com/blog/wp-content/uploads/2016/12/02102626/cartoon-landscape-vector.png")`;
            weatherStatus.innerText = "All clear...You can plan a trip!!!";
        }
        else
        {
            mapContainer.style.backgroundImage = `url("https://cdn.dribbble.com/users/925716/screenshots/3333720/attachments/722376/after_noon.png?compress=1&resize=400x300")`;
            weatherStatus.innerText = "It's hot today!!!"
        }
    
    
    
    
    }
    
    
    
    // delhi default call
    callWeatherApi('delhi',null,null);

  
}
})

function getTemp(t)
    {
        return parseInt(t - 273);
    }
    
function geoFindMe() {

    function success(position) {
      const latitude  = position.coords.latitude;
      const longitude = position.coords.longitude;
      callWeatherApi(null,latitude,longitude);
  
      
    }
  
    function error() {
      alert('Unable to retrieve your location');
    }
  
    if(!navigator.geolocation) {
      
    } else {
      
      navigator.geolocation.getCurrentPosition(success, error);
    }
  
  }
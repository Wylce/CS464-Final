var exTexture;
var Gpixels;
var Gloaded;

var Gspeed;
var GplaneView;
var Gdirection;
var cameraRotationY;
var cameraRotationX;
var currentHeight;

var GplaneTranslate;
var GplaneTip;
var GplaneVMat;

var Gnormal;

var saveme = 0.0;
var deltaX
var displayExplosion;

var GinitialTranslate = [0.0, 0.5, 0.0];
var planeForwardDirection = [0, 0, 1];
var rotate = [0, 1, 0];

var objRotTransMat = mat4.create();
mat4.identity(objRotTransMat);

var canvas = document.getElementById("yourCanvasElement");
document.addEventListener("keydown", handleKeyDown, false);
document.addEventListener("keyup", handleKeyUp, false);
var keys = {};

var timerCurrent = 0;
var timerMax = 30;
function checkCollision() {
  var terrainHeight = getTerHeight(GplaneTranslate[0], GplaneTranslate[2]);
  if (displayExplosion == true) {
    if (timerCurrent >= timerMax) {
      displayExplosion = false;
      timerCurrent = 0;

      GplaneTranslate[0] = GinitialTranslate[0];
      GplaneTranslate[1] = GinitialTranslate[1];
      GplaneTranslate[2] = GinitialTranslate[2];

      Gspeed = 0.005;
    }
    else {
      timerCurrent += 1;
    }
  }
  if (GplaneTranslate[1] <= terrainHeight && displayExplosion == false) {
    displayExplosion = true;
  }
}

var acceleration = 0.00005;
var deceleration = 0.00001;
var isAccelerating = false;
var isBraking = false;


function handleKeyDown(event) {
  keys[event.key] = true;

  if (keys["w"]) {
    isAccelerating = true;
  }
  else if (keys["s"]) {
    isBraking = true;
  }
  if (debugMode){
    if (keys["+"] || keys["="]) {
      zoom(1.5);
    } else if (keys["-"]) {
      zoom(0.5);
    } 
  }
}

function handleKeyUp(event) {
  keys[event.key] = false;

  if (event.key == "w") {
    isAccelerating = false;
  }
  else if (event.key == "s") {
    isBraking = false;
  }
}

function getTerHeight(x, z) {
  x = Math.floor(((x + 1) / 2.0) * exTexture.image.width);
  z = Math.floor(((z + 1) / 2.0) * exTexture.image.height);
  if (x >= exTexture.image.width) {
    x = exTexture.image.width;
  }
  if (z >= exTexture.image.height) {
    z = exTexture.image.height;
  }

  var res = 0.09;
  if (Gloaded == 1) {
    var aoffset = Math.round(x * 4 + z * exTexture.image.width * 4);

    var r = Gpixels[0 + aoffset];
    var g = Gpixels[1 + aoffset];
    var b = Gpixels[2 + aoffset];

    var aval = Math.sqrt(r * r + g * g + b * b) / 442.0;
    aval = (aval * 2.5 * 2.0) / 10.0;
    res = res + aval;
  }
  return res;
}

function getTriHeight(x, z) {
  x = Math.floor(((x + 1) / 2.0) * exTexture.image.width);
  z = Math.floor(((z + 1) / 2.0) * exTexture.image.height);
  if (x >= exTexture.image.width) x = exTexture.image.width;
  if (z >= exTexture.image.height) z = exTexture.image.height;

  var resbase = 0.09;
  var res = vec3.create();
  if (Gloaded == 1) {
    for (i = 0; i < 3; i++) {
      var aoffset;
      if (i == 0) aoffset = Math.round(x * 4 + z * exTexture.image.width * 4);
      if (i == 1)
        aoffset = Math.round((x + 1) * 4 + z * exTexture.image.width * 4);
      if (i == 2)
        aoffset = Math.round(x * 4 + (z + 1) * exTexture.image.width * 4);
      var r = Gpixels[0 + aoffset];
      var g = Gpixels[1 + aoffset];
      var b = Gpixels[2 + aoffset];

      var aval = Math.sqrt(r * r + g * g + b * b) / 442.0;
      aval = (aval * 2.5 * 2.0) / 10.0;
      res[i] = resbase + aval;
    }
  }
  return res;
}

function degToRad(degrees) {
  return (degrees * Math.PI) / 180;
}

var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;
var mouseButton;

function handleMouseDown(event) {
  // console.log("mousedown");
  mouseDown = true;
  mouseButton = event.button;
  lastMouseX = event.clientX;
  lastMouseY = event.clientY;
}

function handleMouseUp(event) {
  mouseDown = false;
}

var numCalls = 0;
var lastX = 0;
function handleMouseMove(event) {
  if (!mouseDown) {
    return;
  }

  else if (numCalls == 0) {
    Gspeed = 0.005;
  }

  var newX = event.clientX;

  var newY = event.clientY;

  deltaX = newX - lastMouseX;
  var deltaY = newY - lastMouseY;


  if (debugMode){
    if (mouseButton == 2){
      var newRotationMatrix = mat4.create();
      mat4.identity(newRotationMatrix);
      mat4.rotate(newRotationMatrix, degToRad (deltaX/10), [0,1,0]);

      mat4.rotate(newRotationMatrix, degToRad(deltaY/10), [1,0,0]);
      mat4.multiply(newRotationMatrix, objRotTransMat, objRotTransMat);
  }

    if (mouseButton == 0){
      var translation = vec3.create();
      translation = [deltaX/200.0, -1*(deltaY/200.0), 0.0]
      var newTranslationMatrix = mat4.create();
      mat4.identity(newTranslationMatrix);
      mat4.translate(newTranslationMatrix, translation);
      mat4.multiply(newTranslationMatrix, objRotTransMat, objRotTransMat);
    }
  } else {

    //TODO: try and fix the way rotation reverses when it goes past 180 degrees

    cameraRotationY += deltaX;
    cameraRotationX = Math.min(cameraRotationX + deltaY, 90);
    if (cameraRotationX <= -90){
      cameraRotationX = -90;
    }
    //cameraRotationX = Math.max(cameraRotationX + deltaY, 0);
    //cameraRotationX = (cameraRotationX + deltaY) % 90;
    // console.log(cameraRotationX);
  }
  lastX = newX;

  lastMouseX = newX;
  lastMouseY = newY;

  numCalls++;
}

function zoom(factor) {
  var newZoomMatrix = mat4.create();
  mat4.identity(newZoomMatrix);
  var sf = 1.0 * factor;
  // console.log(sf);
  
  mat4.scale(newZoomMatrix, [sf,sf,sf]);
  mat4.multiply(newZoomMatrix, objRotTransMat, objRotTransMat);
}

var stallStrength = 2000;

function genViewMatrix() {
  if (isAccelerating && Gspeed < 0.005) {
    Gspeed += acceleration;
  } 
  else if (!isAccelerating && Gspeed > 0) {
    Gspeed -= deceleration;
  }

  if (isBraking && Gspeed > 0) {
    Gspeed -= deceleration * 2;
  }

  if (mouseDown && Gspeed < 0.005) {
      GplaneTranslate[1] -= Math.exp(stallStrength * -Gspeed);
  }
  if (displayExplosion == false) {
    GplaneTranslate[0] += Gspeed * Gdirection[0];
    GplaneTranslate[1] += Gspeed * Gdirection[1];
    GplaneTranslate[2] += Gspeed * Gdirection[2];
  }

  if (GplaneTranslate[0] >= 1.0) {
    GplaneTranslate[0] = -0.99;
  }
  if (GplaneTranslate[2] >= 1.0) {
    GplaneTranslate[2] = -0.99;
  }
  if (GplaneTranslate[0] <= -1.0) {
    GplaneTranslate[0] = 0.99;
  }
  if (GplaneTranslate[2] <= -1.0) {
    GplaneTranslate[2] = 0.99;
  }

  Gdirection = getplaneDirection(Gnormal);

  // console.log(Gdirection[0]);

  mat4.identity(GplaneVMat);
    mat4.lookAt(
      GplaneTranslate,
      [
        GplaneTranslate[0] + Gdirection[0],
        GplaneTranslate[1] + Gdirection[1],
        GplaneTranslate[2] + Gdirection[2],
      ],
      rotate,
      GplaneVMat
    );
  checkCollision();
}

function getNormal(x, z) {
  var rnormal = vec3.create();
  rnormal[0] = 0.0;
  rnormal[1] = 1.0;
  rnormal[2] = 0;

  var stepsize = 10.0 / 256.0;
  var hv = getTriHeight(x, z);

  anorm = [0, 1, 0];
  var p1 = vec3.create();
  var p2 = vec3.create();
  var p3 = vec3.create();
  p1[0] = 0.0;
  p1[1] = hv[0];
  p1[2] = 0.0;
  p2[0] = stepsize;
  p2[1] = hv[1];
  p2[2] = 0.0;
  p3[0] = 0;
  p3[1] = hv[2];
  p3[2] = stepsize;
  var b1 = vec3.subtract(p2, p1);
  var b2 = vec3.subtract(p3, p1);
  var rn = vec3.cross(b2, b1);
  rn = vec3.normalize(rn);
  if (rn[1] < 0.0) alert(rn[1]);
  Gnormal = rn;
  return rn;
}
function getplaneDirection(tnormal) {
    var forwardDirection = vec3.create();
    forwardDirection[0] = 0.0;
    forwardDirection[2] = 1.0;
    forwardDirection[1] = 0.0;
  
    var newRotationMatrix = mat4.create();
    mat4.identity(newRotationMatrix);
  
    mat4.rotate(newRotationMatrix, -degToRad(cameraRotationY), [0, 1, 0]);
    mat4.rotate(newRotationMatrix, -degToRad(cameraRotationX), [1, 0, 0]);
  
    forwardDirection = mat4.multiplyVec3(newRotationMatrix, forwardDirection);
  
    return forwardDirection;
  }

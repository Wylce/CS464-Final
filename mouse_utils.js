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

var GinitialTranslate = [0.0, 0.5, 0.0];
var planeForwardDirection = [0, 0, 1];
var rotate = [0, 1, 0];

var canvas = document.getElementById("yourCanvasElement");
document.addEventListener("keydown", handleKeyDown, false);
document.addEventListener("keyup", handleKeyUp, false);
var keys = {};

function checkCollision() {
    var terrainHeight = getTerHeight(GplaneTranslate[0], GplaneTranslate[2]);

  if (GplaneTranslate[1] <= terrainHeight) {
    GplaneTranslate[0] = GinitialTranslate[0];
    GplaneTranslate[1] = GinitialTranslate[1];
    GplaneTranslate[2] = GinitialTranslate[2];

    Gspeed = 0.005;
  }
}

function handleKeyDown(event) {
  keys[event.key] = true;

  if (keys["w"]) {
    Gspeed += 0.0005;
  }
  else if (keys["s"]) {
    if (Gspeed > 0) {
      Gspeed -= 0.0005;
    }
  }

}

function handleKeyUp(event) {
  keys[event.key] = false;
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

function handleMouseDown(event) {
  mouseDown = true;
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

  var deltaX = newX - lastMouseX;
  var deltaY = newY - lastMouseY;

  cameraRotationY += deltaX;
  cameraRotationX += deltaY;

  lastX = newX;

  lastMouseX = newX;
  lastMouseY = newY;

  numCalls++;
}

var stallStrength = 2000;

function genViewMatrix() {
    if (mouseDown && Gspeed < 0.005) {
        GplaneTranslate[1] -= Math.exp(stallStrength * -Gspeed);
    }
    
GplaneTranslate[0] += Gspeed * Gdirection[0];
GplaneTranslate[1] += Gspeed * Gdirection[1];
GplaneTranslate[2] += Gspeed * Gdirection[2];

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

var exTexture;
var Gpixels;
var Gloaded;

var Gspeed;
var GtankView;
var Gdirection;
var cameraRotationY;
var cameraRotationX;
var currentHeight;

var GtankTranslate;
var GtankTip;
var GtankVMat;

var Gnormal;

var saveme = 0.0;
var GinitialTranslate = [0.0, 0.5, 0.0];

var canvas = document.getElementById("yourCanvasElement");
document.addEventListener("keydown", handleKeyDown, false);
document.addEventListener("keyup", handleKeyUp, false);
var keys = {};

function checkCollision() {
    var terrainHeight = getTerHeight(GtankTranslate[0], GtankTranslate[2]);

  if (GtankTranslate[1] <= terrainHeight) {
    GtankTranslate[0] = GinitialTranslate[0];
    GtankTranslate[1] = GinitialTranslate[1];
    GtankTranslate[2] = GinitialTranslate[2];

    Gspeed = 0.0;
  }
}

function handleKeyDown(event) {
  keys[event.key] = true;

  if (keys["w"]) {
    Gspeed += 0.0005;
  }
  if (keys["s"]) {
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

  console.log(x);
  console.log(z);
  if (x >= exTexture.image.width) {
    x = exTexture.image.width;
  }
  if (z >= exTexture.image.height) {
    z = exTexture.image.height;
  }
  console.log(x);
  console.log(z);

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

function handleMouseMove(event) {
  if (!mouseDown) {
    return;
  }
  var newX = event.clientX;
  var newY = event.clientY;

  var deltaX = newX - lastMouseX;
  var deltaY = newY - lastMouseY;

  cameraRotationY += deltaX;
  cameraRotationX += deltaY;

  cameraRotationX = Math.max(-90, Math.min(90, cameraRotationX));

  lastMouseX = newX;
  lastMouseY = newY;

  Gdirection = getTankDirection(Gnormal);
}

function genViewMatrix() {
  GtankTranslate[0] = GtankTranslate[0] + Gspeed * Gdirection[0];
  GtankTranslate[1] = GtankTranslate[1] + Gspeed * Gdirection[1];
  GtankTranslate[2] = GtankTranslate[2] + Gspeed * Gdirection[2];

  if (GtankTranslate[0] >= 1.0) {
    GtankTranslate[0] = -0.99;
  }
  if (GtankTranslate[2] >= 1.0) {
    GtankTranslate[2] = -0.99;
  }
  if (GtankTranslate[0] <= -1.0) {
    GtankTranslate[0] = 0.99;
  }
  if (GtankTranslate[2] <= -1.0) {
    GtankTranslate[2] = 0.99;
  }

  mat4.identity(GtankVMat);
  mat4.lookAt(
    GtankTranslate,
    [
      GtankTranslate[0] + Gdirection[0],
      GtankTranslate[1] + Gdirection[1],
      GtankTranslate[2] + Gdirection[2],
    ],
    [0, 1, 0],
    GtankVMat
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

function getTankDirection(tnormal) {
  var newRotationMatrix = mat4.create();
  var newRotationMatrix2 = mat4.create();

  mat4.identity(newRotationMatrix);
  mat4.identity(newRotationMatrix2);

  mat4.rotate(newRotationMatrix, -degToRad(cameraRotationY), [0, 1, 0]);
  mat4.rotate(newRotationMatrix2, -degToRad(cameraRotationX), [1, 0, 0]);

  var adir = vec3.create();
  adir[0] = 0.0;
  adir[2] = 10.0;
  adir[1] = 0;

  adir = vec3.normalize(adir);
  var rotationMatrixY = mat4.create();
  mat4.identity(rotationMatrixY);
  mat4.identity(rotationMatrixY);

  adir = mat4.multiplyVec3(newRotationMatrix, adir);
  adir = mat4.multiplyVec3(newRotationMatrix2, adir);

  return adir;
}

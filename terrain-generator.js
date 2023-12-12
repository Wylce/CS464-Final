var chunkMap;
var chunkCoords;
var chunksToRender;

var numChunks;

//https://www.playfuljs.com/realistic-terrain-in-130-lines/
//https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_collision_detection

var heightMap;

class Chunk {
  constructor(chunkID){
    this.buildingArray = [];
    this.coordinates;
    this.init = false;
    this.numBuildings = 0;
    this.id = chunkID;
    this.heightRating = 0;
  }

  addBuilding(building){
    this.buildingArray[this.numBuildings] = building;
    this.numBuildings++;
  }

  checkIntersection(point){
    for (const object of this.buildingArray){
      if (object.checkIfContains(point)){
        return true;
      }
    }
    return false;
  }

  generateBuildings() {
    var numBuildings = 20;
    var minWidth = 0.2;
    var maxWidth = 0.7;
    var minDistance = 0.6;
  
    for (let i = 0; i < numBuildings; i++) {
      var attempts = 0;
      var validPosition = false;
      var randomX;
      var randomZ;
  
      while (!validPosition && attempts < 50) {
        randomX = Math.random() - 1;
        randomZ = Math.random() - 1;
        validPosition = this.isValidBuildingPosition(randomX, randomZ, minDistance);
        attempts++;
      }
  
      if (validPosition) {
        var testBuilding = new Building(randomX, -1.0, randomZ);
        testBuilding.id = this.id;
        this.heightRating = Math.max(Math.abs(randomX), Math.abs(randomZ));
        var width = Math.random() * (maxWidth - minWidth) + minWidth;
        testBuilding.makeBuildingGeometry(width, width);
        this.addBuilding(testBuilding);
      }
    }
  }

  isValidBuildingPosition(x, z, minDistance) {
    for (const existingBuilding of this.buildingArray) {
      var distance = Math.sqrt((x - existingBuilding.xMin) ** 2 + (z - existingBuilding.zMin) ** 2);
      if (distance < minDistance) {
        return false;
      }
    }
    return true;
  }

  drawBuildings(){
    for (i = 0; i < this.numBuildings; i++){
      var building = this.buildingArray[i];
  
      gl.bindBuffer(gl.ARRAY_BUFFER, building.vertexPositionBuffer);
      gl.vertexAttribPointer(
        shaderProgram.vertexPositionAttribute,
        building.vertexPositionBuffer.itemSize,
        gl.FLOAT,
        false,
        0,
        0
      );
    
      gl.bindBuffer(gl.ARRAY_BUFFER, building.textureCoordBuffer);
      gl.vertexAttribPointer(
        shaderProgram.textureCoordAttribute,
        building.textureCoordBuffer.itemSize,
        gl.FLOAT,
        false,
        0,
        0
      );
    
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, exTexture2);
      gl.uniform1i(shaderProgram.samplerUniform, 0);
    
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, building.vertexIndexBuffer);
    
      setMatrixUniforms();
      gl.drawElements(
        gl.TRIANGLES,
        building.vertexIndexBuffer.numItems,
        gl.UNSIGNED_SHORT,
        0
      );

      gl.bindBuffer(gl.ARRAY_BUFFER, building.top);
      gl.vertexAttribPointer(
        shaderProgram.vertexPositionAttribute,
        building.top.itemSize,
        gl.FLOAT,
        false,
        0,
        0
      );

      gl.bindBuffer(gl.ARRAY_BUFFER, building.topTextureCoordBuffer);
      gl.vertexAttribPointer(
        shaderProgram.textureCoordAttribute,
        building.topTextureCoordBuffer.itemSize,
        gl.FLOAT,
        false,
        0,
        0
      );

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, exTexture3);
      gl.uniform1i(shaderProgram.samplerUniform, 1);

      gl.drawElements(
        gl.TRIANGLES,
        building.vertexIndexBuffer.numItems,
        gl.UNSIGNED_SHORT,
        0
      );
    }
  }

  drawBuilding(building){
  
    gl.bindBuffer(gl.ARRAY_BUFFER, building.vertexPositionBuffer);
    gl.vertexAttribPointer(
      shaderProgram.vertexPositionAttribute,
      building.vertexPositionBuffer.itemSize,
      gl.FLOAT,
      false,
      0,
      0
    );
  
    gl.bindBuffer(gl.ARRAY_BUFFER, building.textureCoordBuffer);
    gl.vertexAttribPointer(
      shaderProgram.textureCoordAttribute,
      building.textureCoordBuffer.itemSize,
      gl.FLOAT,
      false,
      0,
      0
    );
  
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, exTexture);
    gl.uniform1i(shaderProgram.samplerUniform, 0);
    gl.uniform1i(shaderProgram.samplerUniform, 0);
  
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, building.vertexIndexBuffer);
  
    setMatrixUniforms();
    gl.drawElements(
      gl.TRIANGLES,
      building.vertexIndexBuffer.numItems,
      gl.UNSIGNED_SHORT,
      0
      );
  }
}

function hashKey(coordinates){
  return coordinates[0] + "," + coordinates[1];
}

function enterChunk(coords){
  chunkCoords = coords;
  liveChunk = getChunk(coords);
}

function initTerrain(){
  numChunks = 0;
  chunkCoords = [0, 0];
  chunkMap = new Map();
  liveChunk = getChunk([0,0]);
}

function initChunk(chunkX, chunkY){
  numChunks++;
  var chunk = new Chunk(numChunks);
  chunk.coordinates = [chunkX, chunkY];
  chunk.generateBuildings();
  chunk.init = true;
  return chunk;
}

class Building {

  constructor(x, y, z){
    this.xMin = x;
    this.xMax = 0.0;
    this.yMin = y;
    this.yMax = 0.0;
    this.zMin = z;
    this.zMax = 0.0;
    this.vertexPositionBuffer;
    this.textureCoordBuffer;
    this.vertexIndexBuffer;
    this.normalBuffer;
  }

  checkIfContains(point){
    return (
      point[0] >= this.xMin && point[0] <= this.xMax &&
      point[1] >= this.yMin && point[1] <= this.yMax &&
      point[2] >= this.zMin && point[2] <= this.zMax
    );
  }

   makeBuildingGeometry(width, depth){
    this.xMax = this.xMin + width;
    this.zMax = this.zMin + depth;

    const minHeight = 0.5;
    const maxHeight = 3.0;
    const minWidth = 0.2;
    const maxWidth = 0.8;
    const height = Math.random() * (maxHeight - minHeight) + minHeight;

    this.yMax = this.yMin + height;
    
    this.top = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.top);
    
    const topVertices = [
      this.xMin, this.yMax, this.zMin,
      this.xMax, this.yMax, this.zMin,
      this.xMax, this.yMax, this.zMax,
      this.xMin, this.yMax, this.zMax
    ];
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(topVertices), gl.STATIC_DRAW);
    this.top.itemSize = 3;
    this.top.numItems = 4;

    const topTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, topTextureCoordBuffer);

    var topTextureCoords = [
      0.0, 0.0,
      Math.min((width / (maxWidth - minWidth)), 1.0), 0.0,
      Math.min((width / (maxWidth - minWidth)), 1.0), Math.min((width / (maxWidth - minWidth)), 1.0),
      0.0, Math.min((width / (maxWidth - minWidth)), 1.0),
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(topTextureCoords), gl.STATIC_DRAW);
    this.topTextureCoordBuffer = topTextureCoordBuffer;
    this.topTextureCoordBuffer.itemSize = 2;
    this.topTextureCoordBuffer.numItems = 4;

    this.vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
    const buildingVertices = [
      // Front face
      this.xMin, this.yMin,  this.zMin,
      this.xMax, this.yMin,  this.zMin,
      this.xMax,  this.yMax,  this.zMin,
      this.xMin,  this.yMax,  this.zMin,
  
      // Back face
      this.xMin, this.yMin, this.zMax,
      this.xMin, this.yMax, this.zMax,
      this.xMax, this.yMax, this.zMax,
      this.xMax, this.yMin, this.zMax,
  
      /** 
      // Bottom face
      -1.0, -1.0, -1.0,
       1.0, -1.0, -1.0,
       1.0, -1.0,  1.0,
      -1.0, -1.0,  1.0,
  */
      // Right face
      this.xMax, this.yMin, this.zMin,
      this.xMax,  this.yMax, this.zMin,
      this.xMax,  this.yMax,  this.zMax,
      this.xMax, this.yMin,  this.zMax,
  
      // Left face
      this.xMin, this.yMin, this.zMax,
      this.xMin, this.yMin, this.zMin,
      this.xMin,  this.yMax, this.zMin,
      this.xMin,  this.yMax, this.zMax,
  ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buildingVertices), gl.STATIC_DRAW);
    this.vertexPositionBuffer.itemSize = 3;
    this.vertexPositionBuffer.numItems = 20;

    this.textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
    var textureCoords = [
      // Front face
      0.0, 0.0,
      Math.min((width / (maxWidth - minWidth)), 1.0), 0.0,
      Math.min((width / (maxWidth - minWidth)), 1.0), Math.min((height / (maxHeight - minHeight)), 1.0),
      0.0, Math.min((height / (maxHeight - minHeight)), 1.0),

      // Back face
      Math.min((width / (maxWidth - minWidth)), 1.0), 0.0,
      Math.min((width / (maxWidth - minWidth)), 1.0), Math.min((height / (maxHeight - minHeight)), 1.0),
      0.0, Math.min((height / (maxHeight - minHeight)), 1.0),
      0.0, 0.0,

      // Right face
      Math.min((width / (maxWidth - minWidth)), 1.0), 0.0,
      Math.min((width / (maxWidth - minWidth)), 1.0), Math.min((height / (maxHeight - minHeight)), 1.0),
      0.0, Math.min((height / (maxHeight - minHeight)), 1.0),
      0.0, 0.0,

      // Left face
      0.0, 0.0,
      Math.min((width / (maxWidth - minWidth)), 1.0), 0.0,
      Math.min((width / (maxWidth - minWidth)), 1.0), Math.min((height / (maxHeight - minHeight)), 1.0),
      0.0, Math.min((height / (maxHeight - minHeight)), 1.0),
  ];
  
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    this.textureCoordBuffer.itemSize = 2;
    this.textureCoordBuffer.numItems = 24;

    this.vertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
    var vertexIndices = [
        0, 1, 2,      0, 2, 3,    // Front face
        4, 5, 6,      4, 6, 7,    // Back face
        8, 9, 10,     8, 10, 11,  // Top face
        //12, 13, 14,   12, 14, 15, // Bottom face
        12, 13, 14,   12, 14, 15, // Right face
        16, 17, 18,   16, 18, 19  // Left face
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), gl.STATIC_DRAW);
    this.vertexIndexBuffer.itemSize = 1;
    this.vertexIndexBuffer.numItems = 30;
  }

}

function loadRenderSet(drawDistance){
  chunksToRender = [];
  //chunksToRender[0] = getChunk(chunkCoords) //add the active chunk
  var cind = 0;

  var nextCoords = [];
  //nextCoords[0] = chunkCoords[0];
  //nextCoords[1] = chunkCoords[1] + 1;
  //chunksToRender[1] = getChunk(nextCoords);


  //var orientation = Math.floor((cameraRotationY % 360) / 90);
  var xOrientation = Math.round(Gdirection[0]);
  var zOrientation = Math.round(Gdirection[2]);
  //var yOrientation = Math.round(Gdirection[1]);
  var yOrientation = Gdirection[1];

  console.log("Y: " + yOrientation);

  if(yOrientation < -0.8){
    for (i = drawDistance / -2; i < drawDistance / 2; i++){
      for (j = drawDistance / -2; j < drawDistance / 2; j++){
        chunksToRender[cind] = getChunk([chunkCoords[0] + i, chunkCoords[1] + j]);
        cind++;
      }
    }
    return;
  }

  for (i = -1; i <= drawDistance; i++){

    nextCoords[0] = chunkCoords[0] + (i * (xOrientation * -1));
    nextCoords[1] = chunkCoords[1] + (i * (zOrientation * -1));
    chunksToRender[cind] = getChunk(nextCoords);
    cind++;

    //Trying to think of a way to optimize, maybe calculate an offset?
    //Having trouble getting around how it switches which coordinate gets subtracted
    var xOffset;
    var zOffset;

    if (xOrientation  == 0){
      nextCoords[0] = chunkCoords[0] + 1;
      //nextCoords[1] = chunkCoords[1] + (i * (zOrientation * -1));
      chunksToRender[cind] = getChunk(nextCoords);
      cind++;

      nextCoords[0] = chunkCoords[0] - 1;
      //nextCoords[1] = chunkCoords[1] + (i * (zOrientation * -1));
      chunksToRender[cind] = getChunk(nextCoords);
      cind++;

      for (j = 2; j <= i + 2; j++){
        chunksToRender[cind] = getChunk([chunkCoords[0] + j, nextCoords[1]]);
        cind++;
        chunksToRender[cind] = getChunk([chunkCoords[0] - j, nextCoords[1]]);
        cind++;
      }
    }

    if (zOrientation  == 0){
      //nextCoords[0] = chunkCoords[0] + (i * (xOrientation * -1));
      nextCoords[1] = chunkCoords[1] + 1;
      chunksToRender[cind] = getChunk(nextCoords);
      cind++;

      //nextCoords[0] = chunkCoords[0] + (i * (xOrientation * -1));
      nextCoords[1] = chunkCoords[1] - 1;
      chunksToRender[cind] = getChunk(nextCoords);
      cind++;

      for (j = 2; j <= i + 2; j++){
        chunksToRender[cind] = getChunk([nextCoords[0], chunkCoords[1] + j]);
        cind++;
        chunksToRender[cind] = getChunk([nextCoords[0], chunkCoords[1] - j]);
        cind++;
      }
    }

    if (xOrientation != 0 && zOrientation != 0){
      nextCoords[0] = chunkCoords[0] + (i * (xOrientation * -1));
      nextCoords[1] = chunkCoords[1] + (i * (zOrientation * -1)) - zOrientation;
      chunksToRender[cind] = getChunk(nextCoords);
      cind++;

      for (j = 1; j <= i + 1; j++){
        chunksToRender[cind] = getChunk([nextCoords[0], nextCoords[1] + (j * zOrientation)]);
        cind++;
      }

      nextCoords[0] = chunkCoords[0] + (i * (xOrientation * -1)) - xOrientation;
      nextCoords[1] = chunkCoords[1] + (i * (zOrientation * -1));
      chunksToRender[cind] = getChunk(nextCoords);
      cind++;

      for (j = 1; j <= i + 1; j++){
        chunksToRender[cind] = getChunk([nextCoords[0] + (j * xOrientation), nextCoords[1]]);
        cind++;
      }

    }
  }
}

function getChunk(coords){
  var chunk = chunkMap.get(hashKey(coords));

  if (typeof chunk == 'undefined'){
    chunk = initChunk(coords[0], coords[1]);
    chunkMap.set(hashKey(coords), chunk);
  }
  return chunk;
}

function drawChunk(chunk){

  shaderProgram = terrainShader;
  gl.useProgram(shaderProgram);

  var matrixOffset = [(chunkCoords[0] - chunk.coordinates[0])  * chunkOffset, 0.0, (chunkCoords[1] - chunk.coordinates[1]) * chunkOffset];
  mvMatrix = mat4Copy(matrixStack[0]);
  mat4.translate(mvMatrix, matrixOffset);

  gl.bindBuffer(gl.ARRAY_BUFFER, terVertexPositionBuffer);
  gl.vertexAttribPointer(
    shaderProgram.vertexPositionAttribute,
    terVertexPositionBuffer.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.bindBuffer(gl.ARRAY_BUFFER, terNormalBuffer);
  gl.vertexAttribPointer(
    shaderProgram.vertexNormalAttribute,
    terNormalBuffer.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.bindBuffer(gl.ARRAY_BUFFER, terVertexTextureCoordBuffer);
  gl.vertexAttribPointer(
    shaderProgram.textureCoordAttribute,
    terVertexTextureCoordBuffer.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, exTexture);
  gl.uniform1i(shaderProgram.samplerUniform, 0);
  gl.uniform1i(shaderProgram.samplerUniform, 0);

  gl.uniform1i(shaderProgram.chunkDistance, Math.abs(Math.max(matrixOffset[0], matrixOffset[1])));

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terVertexIndexBuffer);

  setMatrixUniforms();
  gl.drawElements(
    gl.TRIANGLES,
    terVertexIndexBuffer.numItems,
    gl.UNSIGNED_SHORT,
    0
  );

  shaderProgram = entityShader;
  gl.useProgram(shaderProgram);

  gl.uniform3fv(shaderProgram.ambientLight, [1.0, 1.1, 0.9]);
  gl.uniform1i(shaderProgram.chunkDistance, Math.abs(Math.max(matrixOffset[0], matrixOffset[1])));
  gl.uniform1i(shaderProgram.isPlane, 0);

  chunk.drawBuildings();
}

function drawTerrain(){

  var drawDistance = document.getElementById("drawDistSlider").value;

    loadRenderSet(drawDistance);

    chunkOffset = vertexDistance * 98.0 * -1;

        for (const chunk of chunksToRender){
          drawChunk(chunk);
        }
        
        mvMatrix = mat4Copy(matrixStack[0]);
}
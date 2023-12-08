chunkWidth = (100.0 * 1.0) / 50.0 - 1.0;
var chunkMap;
var chunkCoords;
//TODO: fill this with stuff
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

  generateBuildings(){
    var testBuilding = new Building(0.0, -1.0, -0.5);
    testBuilding.id = this.id;
    this.heightRating = Math.max(Math.abs(this.coordinates[0]), Math.abs(this.coordinates[1]));
    testBuilding.makeBuildingGeometry(0.2, (this.heightRating % 19) / 10 , 0.2);
    this.addBuilding(testBuilding);
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

   makeBuildingGeometry(width, height, depth){
    this.xMax = this.xMin + width;
    this.yMax = this.yMin + height;
    this.zMax = this.zMin + depth;

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
  
      // Top face
      this.xMin, this.yMax, this.zMax,
      this.xMin,  this.yMax,  this.zMin,
      this.xMax,  this.yMax,  this.zMin,
      this.xMax,  this.yMax, this.zMax,
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
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,

      // Back face
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,

      // Top face
      0.0, 1.0,
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,

      // Right face
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,

       // Left face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    this.textureCoordBuffer.itemSize = 2;
    this.textureCoordBuffer.numItems = 20;

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



function generateBuildings(){

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

  for (i = 0; i <= drawDistance; i++){

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
    }

    if (xOrientation != 0 && zOrientation != 0){
      nextCoords[0] = chunkCoords[0] + (i * (xOrientation * -1));
      nextCoords[1] = chunkCoords[1] + (i * (zOrientation * -1)) - zOrientation;
      chunksToRender[cind] = getChunk(nextCoords);
      cind++;

      nextCoords[0] = chunkCoords[0] + (i * (xOrientation * -1)) - xOrientation;
      nextCoords[1] = chunkCoords[1] + (i * (zOrientation * -1));
      chunksToRender[cind] = getChunk(nextCoords);
      cind++;
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

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terVertexIndexBuffer);

  setMatrixUniforms();
  gl.drawElements(
    gl.TRIANGLES,
    terVertexIndexBuffer.numItems,
    gl.UNSIGNED_SHORT,
    0
  );

  chunk.drawBuildings();
}

function drawTerrain(){

    loadRenderSet(3);

    chunkOffset = vertexDistance * 98.0 * -1;

    var frontLeft = [chunkOffset, 0.0, chunkOffset];
    var frontMiddle = [-1.0 * chunkOffset, 0.0, 0.0];
    var frontRight = [-1.0 * chunkOffset, 0.0, 0.0];
    var right = [0.0, 0.0, -1.0 * chunkOffset];
    var left = [2.0 * chunkOffset, 0.0, 0.0];
    var backLeft = [0.0, 0.0, -1.0 * chunkOffset];
    var backMiddle = [-1.0 * chunkOffset, 0.0, 0.0];
    var backRight = [-1.0 * chunkOffset, 0.0, 0.0];

    var chunkOffsets = [frontLeft, frontMiddle, frontRight,
                    right, left,
                    backLeft, backMiddle, backRight];

        //drawChunk();
        
        //mvMatrix = mat4Copy(matrixStack[0]);
        //tiles will need to overlap by a vertex on their edge for surface interpolation to look smooth
        //how far apart are the vertices?
        //gl.bindTexture(gl.TEXTURE_2D, explosionTexture);

        /*
        for(i = 0; i < 8; i++){
            //mvMatrix = mat4Copy(matrixStack[0]);
            mat4.translate(mvMatrix, chunkOffsets[i]);
            drawChunk();
            /*
            setMatrixUniforms();
            gl.drawElements(
                gl.TRIANGLES,
                terVertexIndexBuffer.numItems,
                gl.UNSIGNED_SHORT,
                0
            );
        }*/

        for (const chunk of chunksToRender){
          drawChunk(chunk);
        }
        
        mvMatrix = mat4Copy(matrixStack[0]);
}
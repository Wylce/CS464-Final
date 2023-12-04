chunkWidth = (100.0 * 1.0) / 50.0 - 1.0;



//https://www.playfuljs.com/realistic-terrain-in-130-lines/
//https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_collision_detection

var heightMap;
var testBuilding;

var init = false;

class Chunk {
  constructor(){
    this.buildingArray = [];
  }

  addBuilding(building){
    this.buildingArray.push(building);
  }

  checkIntersection(point){
    for (const object of this.buildingArray){
      if (object.checkIfContains(point)){
        return true;
      }
    }
    return false;
  }
}

function help(){
  console.log("help");
}

function initChunk(chunkX, chunkY){
  var chunk = new Chunk();
  testBuilding = new Building(0.0, 0.0, -0.5);
  testBuilding.makeBuildingGeometry(0.2, 1.0, 0.2);
  init = true;
  chunk.addBuilding(testBuilding);
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
    //console.log("made building");
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

function drawBuilding(building){
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


//Attemp 1, remove later, makes sloping sides
/** 
function generateBuildings(chunkVertices, xStart, xEnd, yStart, yEnd){
  //console.log(xEnd + " "  + xStart);
  console.log(xEnd - xStart);
  if  ((xEnd - xStart < 10) || (yEnd - yStart < 10)){
    console.log("hit");
    for ( i = xStart + 1; i < xEnd; i++){
      for (j = yStart + 1; j < yEnd; j++){
        var curIndex = (1 + j * 3 + i * (xEnd - xStart) * 3);
        console.log("index: " + curIndex);
        chunkVertices[(curIndex)] = 0.2;
      }
    }
  return;
  }
  console.log("Past");
  generateBuildings(chunkVertices, xStart, Math.floor(xEnd / 2), yStart, Math.floor(yEnd / 2));
  generateBuildings(chunkVertices, Math.floor(xStart / 2), xEnd, yStart, Math.floor(yEnd / 2));
  //generateBuildings(chunkVertices, xStart, xEnd / 2, yStart / 2, yEnd);
  //generateBuildings(chunkVertices, xStart / 2, xEnd, yStart / 2, yEnd);
}*/

function generateBuildings(){

}

function drawTerrain(){

    chunkOffset = vertexDistance * 98.0;

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
        
        //mvMatrix = mat4Copy(matrixStack[0]);
        //tiles will need to overlap by a vertex on their edge for surface interpolation to look smooth
        //how far apart are the vertices?
        //gl.bindTexture(gl.TEXTURE_2D, explosionTexture);

        for(i = 0; i < 8; i++){
            //mvMatrix = mat4Copy(matrixStack[0]);
            mat4.translate(mvMatrix, chunkOffsets[i]);
            setMatrixUniforms();
            gl.drawElements(
                gl.TRIANGLES,
                terVertexIndexBuffer.numItems,
                gl.UNSIGNED_SHORT,
                0
            );
        }
        mvMatrix = mat4Copy(matrixStack[0]);
        drawBuilding(testBuilding);
}
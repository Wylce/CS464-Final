chunkWidth = (100.0 * 1.0) / 50.0 - 1.0;



//https://www.playfuljs.com/realistic-terrain-in-130-lines/

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
}
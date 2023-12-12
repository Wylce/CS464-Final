class enemy {
    constructor(gl, shaderProgram) {
        this.gl = gl;
        this.shaderProgram = shaderProgram;
        this.position = {
            x: Math.random(), // Random x between 0 and 20
            y: 1.0, // Random y between 0 and 20
            z: -1.0 // Random z between -10 and -25
        };
        this.speed = {
            x: Math.random() * 0.012, 
            y: Math.random() * 0.012, 
            z: -0.005};
        this.rotation = {x: 0, y: 0, z: 0};
        this.health = 100;
        this.isActive = true;
        this.respawnTimer = 0;
        this.initBuffers();
        //this.vertexPositionBuffer = terRectVertexBuffer;
        //this.vertexTextureCoordBuffer = terRectTextureCoordBuffer;
        //this.vertexIndexBuffer = terRectIndexBuffer;

        this.probing = false;
        this.probeCount = 0;

        this.rotTransMatrix = mat4.create();
        mat4.identity(this.rotTransMatrix);
    }

    initBuffers() {
        // Initialize vertex buffer (enemyVertexPositionBuffer)
        this.vertexPositionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexPositionBuffer);
        this.vertices = [
            // Front face
            -1.0, -1.0,  1.0,
            1.0, -1.0,  1.0,
            1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,
        ];
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.gl.STATIC_DRAW);
            this.vertexPositionBuffer.itemSize = 3;
            this.vertexPositionBuffer.numItems = 4;

            // Initialize texture coord buffer (enemyVertexTextureCoordBuffer)
            this.vertexTextureCoordBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
            let textureCoords = [
                // Front face
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0,
                
                ];
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(textureCoords), this.gl.STATIC_DRAW);
            this.vertexTextureCoordBuffer.itemSize = 2;
            this.vertexTextureCoordBuffer.numItems = 4;

            // Initialize index buffer (enemyVertexIndexBuffer)
            this.vertexIndexBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
            let enemyVertexIndices = [
                0, 1, 2,      0, 2, 3,    // Front face
            ];
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(enemyVertexIndices), this.gl.STATIC_DRAW);
            this.vertexIndexBuffer.itemSize = 1;
            this.vertexIndexBuffer.numItems = 6;
        }

        // Example of taking damage
        // enemies[0].takeDamage(20);
        /*
        takeDamage(amount) {
            this.health -= amount;
            if (this.health <= 0) {
                this.handleDestruction();
            }
        }*/

        handleDestruction() {
            // Handle what happens when health reaches 0
            // e.g., remove from scene, change appearance, etc.
            this.isActive = false;
            this.respawnTimer = 5000;
            console.log("enemy destroyed");
        }
        
        reset() {
            this.isActive = true;
            this.health = 100;
            this.position = {
                x: Math.random() * 40,
                y: Math.random() * 40,
                z: -60
            };
            this.respawnTimer = 0;
        }

        rayIntersectsTriangle(origin, direction, p1, p2, p3){
            const epsilon = 0.0000001;
            var rayOrigin = vec3.create();
            rayOrigin[0] = origin[0];
            rayOrigin[1] = origin[1];
            rayOrigin[2] = origin[2];

            var rayDirection = vec3.create();
            rayDirection[0] = direction[0];
            rayDirection[1] = direction[1];
            rayDirection[2] = direction[2];
            
            var edge1 = vec3.create();
            vec3.subtract(p2, p1, edge1);
            var edge2 = vec3.create();
            vec3.subtract(p3, p1, edge2);
            var directionCrossE2 = vec3.create();
            vec3.cross(rayDirection, edge2, directionCrossE2);
            var det = vec3.dot(edge1, directionCrossE2);

            //console.log("det: " + det);

            if(det > epsilon * -1 && det < epsilon){
                return false;
            }

            var invDet = 1.0 / det;
            var s = vec3.create();
            s = vec3.subtract(rayOrigin, p1, s);
            var u = invDet * vec3.dot(s, directionCrossE2);

            //console.log("u: " + u);

            if (u < 0.0 || u > 1.0){
                return false;
            }

            var sXe1 = vec3.create();
            vec3.cross(s, edge1, sXe1);
            var v = invDet * vec3.dot(rayDirection, sXe1);

            //console.log ("v: " + v);

            if (v < 0.0 || u + v > 1.0){
                return false;
            }

            var t = invDet * vec3.dot(edge2, sXe1);

            //console.log("t: " + t);

            if (t > epsilon){
                return true;
            } else{
                return false;
            }
        }

        checkHit(origin, direction){
            
            var point0 = vec3.create();
            point0[0] = this.vertices[0]
            point0[1] = this.vertices[1];
            point0[2] = this.vertices[2];
            vec3TransformMat4(point0, point0, this.rotTransMatrix);

            var point1 = vec3.create();
            point1[0] = this.vertices[3];
            point1[1] = this.vertices[4];
            point1[2] = this.vertices[5];
            vec3TransformMat4(point1, point1, this.rotTransMatrix);

            var point2 = vec3.create();
            point2[0] = this.vertices[6]
            point2[1] = this.vertices[7];
            point2[2] = this.vertices[8];
            vec3TransformMat4(point2, point2, this.rotTransMatrix);

            var point3 = vec3.create();
            point3[0] = this.vertices[0];
            point3[1] = this.vertices[1];
            point3[2] = this.vertices[2];
            vec3TransformMat4(point3, point3, this.rotTransMatrix);

            var point4 = vec3.create();
            point4[0] = this.vertices[6];
            point4[1] = this.vertices[7];
            point4[2] = this.vertices[8];
            vec3TransformMat4(point4, point4, this.rotTransMatrix);

            var point5 = vec3.create();
            point5[0] = this.vertices[9]
            point5[1] = this.vertices[10];
            point5[2] = this.vertices[11];
            vec3TransformMat4(point5, point5, this.rotTransMatrix);

            var result = this.rayIntersectsTriangle(origin, direction, point0, point1, point2);
            if (!result){
                result = this.rayIntersectsTriangle(origin, direction, point3, point4, point5);
            }
            console.log("result: " + result);

            if(result){
                console.log("hit");
            }

            return result;

            /*
            var rayOrigin = vec3.create();
            rayOrigin[0] = origin[0];
            rayOrigin[1] = origin[1];
            rayOrigin[2] = origin[2];

            var rayDirection = vec3.create();
            rayDirection[0] = direction[0];
            rayDirection[1] = direction[1];
            rayDirection[2] = direction[2];

            var point0 = vec3.create();
            point0[0] = this.vertices[0]
            point0[1] = this.vertices[1];
            point0[2] = this.vertices[2];

            var point1 = vec3.create();
            point1[0] = this.vertices[6];
            point1[1] = this.vertices[7];
            point1[2] = this.vertices[8];

            var normal = vec3.create();
            normal[0] = Gdirection[0] * -1.0;
            normal[1] = 0.0;
            normal[2] = Gdirection[2] * - 1.0;

            

            //mat4.translate(this.rotTransMatrix, [0.1, 0.0, 0.0]);
            
            //console.log(this.rotTransMatrix);

            console.log("Before multiply: " + point0);
            vec3TransformMat4(point0, point0, this.rotTransMatrix);
            vec3TransformMat4(point1, point1, this.rotTransMatrix);
            console.log("After multiply: " + point0);

            var denom = vec3.dot(rayDirection, normal);
            var t = vec3.dot(vec3.subtract(point1, rayOrigin), normal) * -1;
            var t = t / denom;

            console.log("denom: " + denom);
            console.log("t: " + t);

            const d = vec3.create();
            d[0] = rayDirection[0] * t;
            d[1] = rayDirection[1] * t;
            d[2] = rayDirection[2] * t;

            const intersection = vec3.add(rayOrigin, d);
            console.log("intersection: " + intersection);

            if(point0[0] <= intersection[0] && point0[1] <= intersection[1] &&
                point1[0] >= intersection[0] && point1[1] >= intersection[1]){
                    console.log("hit");
                }
*/
        }

        animate(elapsed) {

            if(this.probeCount >= 100){
                this.probing = false;
            }

            if(this.probing){
                this.probeCount++;
                return;
            }

            mat4.identity(this.rotTransMatrix);

            mat4.translate(this.rotTransMatrix, [this.position.x, this.position.y, this.position.z]);
            mat4.rotate(this.rotTransMatrix, -degToRad(cameraRotationY), [0, 1, 0]);

            
            // Update position and rotation based on speed
            /*
            this.position.x += this.speed.x * elapsed;
            this.position.y += this.speed.y * elapsed;
            this.position.z -= this.speed.z * elapsed;
            this.rotation.x += 0.00; // Example rotation speed, adjust as needed
            this.rotation.y += 0.00;
            this.rotation.z += 0.00;
            
            // Reset enemy position if it reaches z = 50
            if (this.position.z >= -3) {
                this.position.z = -60; // Reset to initial random z position
            }
            if (this.position.x > 10 || this.position.x < -10) {
                this.speed.x = -this.speed.x;
                this.position.x = Math.max(-10, Math.min(this.position.x, 10));
            }
            if (this.position.y > 30 || this.position.y < -10) {
                this.speed.y = -this.speed.y;
                this.position.y = Math.max(-10, Math.min(this.position.y, 30));
            }*/
            //if (this.position.z > 2 || this.position.z < -2) {
            //    this.speed.z = -this.speed.z;
            //    this.position.z = Math.max(-10, Math.min(this.position.z, 1));
            //}
        }

        draw() {
            mvMatrix = mat4Copy(matrixStack[0]);

            mat4.multiply(mvMatrix, this.rotTransMatrix);

            //mat4.scale(mvMatrix, [0.2, 0.2, 0.2]);
            //mat4.translate(mvMatrix, [this.position.x, this.position.y, this.position.z]);

            //mat4.rotate(mvMatrix, -degToRad(cameraRotationY), [0, 1, 0]);
            //mat4.rotate(mvMatrix, -degToRad(cameraRotationX), [1, 0, 0]);

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexPositionBuffer);
            this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.vertexPositionBuffer.itemSize, this.gl.FLOAT, false, 0, 0);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, exTexture);
            gl.uniform1i(this.shaderProgram.samplerUniform, 0);

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
            this.gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, this.vertexTextureCoordBuffer.itemSize, this.gl.FLOAT, false, 0, 0);

            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
            this.gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, mvMatrix);
            setMatrixUniforms();
            this.gl.drawElements(this.gl.TRIANGLES, this.vertexIndexBuffer.numItems, this.gl.UNSIGNED_SHORT, 0);
        }
    }
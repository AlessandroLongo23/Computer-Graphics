window.onload = () => {
    setupWebGL();

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.FRONT);

    viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
    modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    vertices = [];
    v0 = vec4(0.0, 0.0, -1.0, 1); 
    v1 = vec4(0.0, 0.942809, 0.333333, 1);
    v2 = vec4(-0.816497, -0.471405, 0.333333, 1);
    v3 = vec4(0.816497, -0.471405, 0.333333, 1);

    normals = [];
    textures = [
        "./textures/earth/base.jpg", 
        "./textures/earth/night.jpg", 
        "./textures/earth/clouds.jpg", 
        "./textures/earth/height.jpg",
        "./textures/moon/base.jpg",
        "./textures/moon/height.jpg",
        "./textures/moon/normal.jpg",
        "./textures/space.jpg"
    ];
    loadImages(textures, function(images) {
        var textures = [];
        images.forEach((image, index) => {
            const texture = gl.createTexture();
            gl.activeTexture(gl[`TEXTURE${index}`]);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_2D);
    
            textures.push(texture);
        });
    
        gl.uniform1i(gl.getUniformLocation(program, "earthTexMap"), 0);
        gl.uniform1i(gl.getUniformLocation(program, "nightTexMap"), 1);
        gl.uniform1i(gl.getUniformLocation(program, "cloudTexMap"), 2);
        gl.uniform1i(gl.getUniformLocation(program, "heightTexMap"), 3);
        gl.uniform1i(gl.getUniformLocation(program, "moonTexMap"), 4);
        gl.uniform1i(gl.getUniformLocation(program, "moonHeightTexMap"), 5);
        gl.uniform1i(gl.getUniformLocation(program, "moonNormalTexMap"), 6);
        gl.uniform1i(gl.getUniformLocation(program, "spaceTexMap"), 7);
    
        subdivisions = 9;
        lightAngle = 0;
    
        buildPolyhedron();
        render();
    });

    dist = 3.0;
    cameraPos = {
        x: dist,
        y: 0
    }
    isDragging = false;
    mousePrev = {
        x: 0,
        y: 0,
    }
};

const loadImages = (urls, callback) => {
    var images = [];
    var imagesToLoad = urls.length;

    const onImageLoad = () => {
        imagesToLoad--;
        imagesToLoad === 0 && callback(images);
    }

    for (let i = 0; i < urls.length; ++i) {
        images[i] = new Image();
        images[i].src = urls[i];
        images[i].onload = onImageLoad;
    }
}

const render = () => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    lightAngle += 0.005;

    var lightDirection = vec3(Math.cos(lightAngle), 0.0, Math.sin(lightAngle));
    var lightDirectionLoc = gl.getUniformLocation(program, "lightDirection");
    gl.uniform3fv(lightDirectionLoc, flatten(lightDirection));

    var projectionMatrix = perspective(45, canvas.width / canvas.height, 0.1, 100.0);

    var eye = vec3(
        dist * Math.cos(cameraPos.x) * Math.cos(cameraPos.y), 
        dist * Math.sin(cameraPos.y), 
        dist * Math.sin(cameraPos.x) * Math.cos(cameraPos.y)
    );
    var at = vec3(0.0, 0.0, 0.0);
    var up = vec3(0.0, 1.0, 0.0);
    var viewMatrix = lookAt(eye, at, up);

    var modelMatrix = mat4();

    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
    
    requestAnimFrame(render);
}

const mouseDown = (event) => {
    isDragging = true;
    mousePrev.x = event.clientX;
    mousePrev.y = event.clientY;
}

const mouseMove = (event) => {
    if (!isDragging) 
        return;
    
    cameraPos.x += (event.clientX - mousePrev.x) / 100 / Math.PI;
    cameraPos.y += (event.clientY - mousePrev.y) / 100 / Math.PI;
    cameraPos.y = Math.max(-Math.PI / 2, Math.min(cameraPos.y, Math.PI / 2))

    mousePrev.x = event.clientX;
    mousePrev.y = event.clientY;
}

const mouseUp = () => {
    isDragging = false;
}

const mouseWheel = (event) => {
    dist += event.deltaY / 1000;
    dist = Math.min(5.0, Math.max(dist, 1.25));
}

window.addEventListener("mousedown", mouseDown, false);
window.addEventListener("mousemove", mouseMove, false);
window.addEventListener("mouseup", mouseUp, false);
window.addEventListener("mousewheel", mouseWheel, false);

const buildPolyhedron = () => {
    vertices = [];
    normals = [];
    tetrahedron(v0, v1, v2, v3, subdivisions);

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
}

const tetrahedron = (a, b, c, d, n) => {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

const divideTriangle = (a, b, c, count) => {
    if (count === 0) {
        triangle(a, b, c);
        return;
    }

    var ab = normalize(mix(a, b, 0.5), true);
    var ac = normalize(mix(a, c, 0.5), true);
    var bc = normalize(mix(b, c, 0.5), true);

    divideTriangle(a, ab, ac, count - 1);
    divideTriangle(ab, b, bc, count - 1);
    divideTriangle(bc, c, ac, count - 1);
    divideTriangle(ab, bc, ac, count - 1);
}

const triangle = (a, b, c) => {
    vertices.push(a);
    normals.push(a);
    vertices.push(b);
    normals.push(b);
    vertices.push(c);
    normals.push(c);
}

const setupWebGL = () => {
    canvas = document.getElementById("gl-canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
        return;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    program = initShaders(gl, "vshader.glsl", "fshader.glsl");
    gl.useProgram(program);
}

const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}

window.addEventListener("resize", resize, false);
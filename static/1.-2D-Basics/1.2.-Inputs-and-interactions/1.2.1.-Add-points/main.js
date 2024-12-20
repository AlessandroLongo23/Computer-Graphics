window.onload = () => {
    setupWebGL();

    initVertices();
    addEventListeners();
    
    render();
}

const setupWebGL = () => {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

    program = initShaders(gl, "vshader.glsl", "fshader.glsl");
    gl.useProgram(program);
}

const initVertices = () => {
    vertices = [ 
        vec2(0.0, 0.0), 
        vec2(1.0, 0.0), 
        vec2(1.0, 1.0)
    ];
    index = vertices.length;

    maxPoints = 100;
    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * maxPoints, gl.STATIC_DRAW);
    
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));

    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
}

const addEventListeners = () => {
    canvas.addEventListener("click", function(event) {
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        var t = vec2(
            -1 + 2 * (event.clientX - canvas.getBoundingClientRect().x) / canvas.width, 
            -1 + 2 * (canvas.height - (event.clientY - canvas.getBoundingClientRect().y)) / canvas.height
        );
        var data = new Float32Array(t);
        
        if (index < maxPoints) {
            gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec2'] * index, data);
            index++;
        } else {
            console.log("Max points reached!");
        }
    });
}

const render = () => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, index);
    requestAnimFrame(render, canvas);
}
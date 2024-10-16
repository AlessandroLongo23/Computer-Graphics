var vertices;

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
    window.requestAnimFrame(render, canvas);
}

window.onload = function init() {
    setup_WebGL();

    mode = 'points';
    side = 20;
    count = 0;
    max_points = 100;
    
    // points
    colors_array = []
    vertices = [];

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * max_points, gl.STATIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // click event
    canvas.addEventListener("click", function(event) {
        // colors
        if (mode == 'points') {
            switch(document.getElementById("pointscolor").selectedIndex) {
                case 0:
                    for (var i = 0; i < 6; i++)
                        colors_array.push(vec4(0.0, 0.0, 0.0, 1.0));
                    break;
                case 1:
                    for (var i = 0; i < 6; i++)
                        colors_array.push(vec4(1.0, 1.0, 1.0, 1.0));
                    break;
            }
        } else if (mode == 'triangles') {
            count++;
            if (count == 3) {
                var first_vertex_color = colors_array[colors_array.length - 6];
                var second_vertex_color = colors_array[colors_array.length - 3];
                colors_array = colors_array.slice(0, colors_array.length - 12);
                colors_array.push(first_vertex_color);
                colors_array.push(second_vertex_color);
                switch(document.getElementById("pointscolor").selectedIndex) {
                    case 0:
                        colors_array.push(vec4(0.0, 0.0, 0.0, 1.0)); 
                        break;
                    case 1:
                        colors_array.push(vec4(1.0, 1.0, 1.0, 1.0));
                        break;
                }
            } else {
                switch(document.getElementById("pointscolor").selectedIndex) {
                    case 0:
                        for (var i = 0; i < 6; i++)
                            colors_array.push(vec4(0.0, 0.0, 0.0, 1.0));
                        break;
                    case 1:
                        for (var i = 0; i < 6; i++)
                            colors_array.push(vec4(1.0, 1.0, 1.0, 1.0));
                        break;
                }
            }
        }
        
        cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colors_array), gl.STATIC_DRAW);
        vColor = gl.getAttribLocation(program, "vColor");
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);

        // add vertex/vertices
        var t = vec2(
            -1 + 2 * (event.clientX - canvas.getBoundingClientRect().x) / canvas.width,
            1 - 2 * (event.clientY - canvas.getBoundingClientRect().y) / canvas.height
        );
        if (mode == 'points') {
            var new_vertices = [
                vec2(t[0] - side / canvas.width, t[1] - side / canvas.height),
                vec2(t[0] - side / canvas.width, t[1] + side / canvas.height),
                vec2(t[0] + side / canvas.width, t[1] + side / canvas.height),

                vec2(t[0] - side / canvas.width, t[1] - side / canvas.height),
                vec2(t[0] + side / canvas.width, t[1] - side / canvas.height),
                vec2(t[0] + side / canvas.width, t[1] + side / canvas.height),
            ]
        } else if (mode == 'triangles') {
            if (count == 3) {
                var first_vertex = vec2(
                    (vertices[vertices.length - 1][0] + vertices[vertices.length - 3][0]) / 2, 
                    (vertices[vertices.length - 1][1] + vertices[vertices.length - 3][1]) / 2
                );
                var second_vertex = vec2(
                    (vertices[vertices.length - 7][0] + vertices[vertices.length - 9][0]) / 2, 
                    (vertices[vertices.length - 7][1] + vertices[vertices.length - 9][1]) / 2
                );

                vertices = vertices.slice(0, vertices.length - 12);

                var new_vertices = [
                    first_vertex,
                    second_vertex,
                    t
                ]
                count = 0;
            } else {
                var new_vertices = [
                    vec2(t[0] - side / canvas.width, t[1] - side / canvas.height),
                    vec2(t[0] - side / canvas.width, t[1] + side / canvas.height),
                    vec2(t[0] + side / canvas.width, t[1] + side / canvas.height),
    
                    vec2(t[0] - side / canvas.width, t[1] - side / canvas.height),
                    vec2(t[0] + side / canvas.width, t[1] - side / canvas.height),
                    vec2(t[0] + side / canvas.width, t[1] + side / canvas.height),
                ]
            }
        }
        
        for (var i = 0; i < new_vertices.length; i++)
            vertices.push(new_vertices[i]);

        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
    });

    render();
}

document.getElementById("clear").addEventListener("click", function() {
    switch(document.getElementById("mymenu").selectedIndex) {
        case 0:
            gl.clearColor(218 / 255, 98 / 255, 87 / 255, 1.0);
            break;
        case 1:
            gl.clearColor(87 / 255, 218 / 255, 122 / 255, 1);
            break;
        case 2:
            gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
            break;
    }

    colors_array = [];
    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors_array), gl.STATIC_DRAW);
    vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    count = 0;

    vertices = [];
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(vertices));
});

document.getElementById("points_mode").addEventListener("click", function() {
    mode = 'points';
});

document.getElementById("triangles_mode").addEventListener("click", function() {
    mode = 'triangles';
});

function setup_WebGL() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn’t available");
        return;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

    program = initShaders(gl, "vshader.glsl", "fshader.glsl");
    gl.useProgram(program);
}
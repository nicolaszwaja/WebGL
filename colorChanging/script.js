const vertexShaderTxt = `
    precision mediump float;
    attribute vec2 vertPosition;
    attribute vec3 vertColor;
    varying vec3 fragColor;

    void main() {
        fragColor = vertColor;
        gl_Position = vec4(vertPosition, 0.0, 1.0);
    }
`;

const fragmentShaderTxt = `
    precision mediump float;
    varying vec3 fragColor;

    void main() {
        gl_FragColor = vec4(fragColor, 1.0); // R, G, B, opacity
    }
`;

let Triangle = function() {
    let canvas = document.getElementById('main-canvas');
    let gl = canvas.getContext('webgl');

    if (!gl) {
        alert('WebGL not supported');
    }

    gl.clearColor(0.7, 0.6, 0.9, 1.0); // Set initial background color
    gl.clear(gl.COLOR_BUFFER_BIT);

    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderTxt);
    gl.shaderSource(fragmentShader, fragmentShaderTxt);

    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    let program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);
    gl.validateProgram(program);

    gl.useProgram(program);

    let triangleVert = [
        // X, Y           R, G, B
        0.0, 0.5,        1.0, 1.0, 1.0,
        -0.5, -0.5,     1.0, 1.0, 1.0,
        0.5, -0.5,      1.0, 1.0, 1.0
    ];

    const triangleVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVert), gl.STATIC_DRAW);

    const posAttrLocation = gl.getAttribLocation(program, 'vertPosition');
    const colorAttrLocation = gl.getAttribLocation(program, 'vertColor');

    gl.vertexAttribPointer(
        posAttrLocation,
        2,
        gl.FLOAT,
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT,
        0
    );

    gl.vertexAttribPointer(
        colorAttrLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT,
        2 * Float32Array.BYTES_PER_ELEMENT
    );

    gl.enableVertexAttribArray(posAttrLocation);
    gl.enableVertexAttribArray(colorAttrLocation);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // Event listener for button click
    let button = document
    .getElementById('change-color-button');
    button.addEventListener('click', function() {
    //random color values
    let randomColor = [
    Math.random(), // R
    Math.random(), // G
    Math.random() // B
    ];
       
        triangleVert[2] = randomColor[0];
        triangleVert[3] = randomColor[1]; 
        triangleVert[4] = randomColor[2];
    
        triangleVert[7] = randomColor[0]; 
        triangleVert[8] = randomColor[1]; 
        triangleVert[9] = randomColor[2]; 
    
        triangleVert[12] = randomColor[0]; 
        triangleVert[13] = randomColor[1]; 
        triangleVert[14] = randomColor[2]; 
    
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVert), gl.STATIC_DRAW);
    
        gl.clear(gl.COLOR_BUFFER_BIT);
    
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    });
};

Triangle();    
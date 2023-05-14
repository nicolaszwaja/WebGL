const vertexShaderTxt = `
            precision mediump float;
            attribute vec2 vertPosition;
            attribute vec3 vertColor;
            varying vec3 fragColor;
            void main()
            {
                fragColor = vertColor;
                gl_Position = vec4(vertPosition, 0.0, 1.0);
            }
        `

const fragmentShaderTxt = `
            precision mediump float;
            varying vec3 fragColor;
            void main()
            {
                gl_FragColor = vec4(fragColor, 0.0); // R,G,B, opacity
            }
        `

let Hexagon = function(){
    let canvas = document.getElementById('main-canvas');
    let gl = canvas.getContext('webgl');

    if(!gl){
        alert('webgl not supported');
    }

    gl.clearColor(0.7, 0.6, 0.9, 1.0); // R, G, B, opacity
    gl.clear(gl.COLOR_BUFFER_BIT);

    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderTxt);
    gl.shaderSource(fragmentShader, fragmentShaderTxt);

    gl.compileShader(vertexShader);
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
        console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
        return;
    }
    gl.compileShader(fragmentShader);
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
        console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
        return;
    }

    let program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    gl.detachShader(program, vertexShader);
    gl.detachShader(program, fragmentShader);

    gl.validateProgram(program);

    let hexagonVert = [
        // X, Y
        0.0, 0.0,       // center vertex
        0.5, 0.0,       // vertex 1
        0.25, 0.43,     // vertex 2
        -0.25, 0.43,    // vertex 3
        -0.5, 0.0,      // vertex 4
        -0.25, -0.43,   // vertex 5
        0.25, -0.43,    // vertex 6
        0.5, 0.0       // vertex 1
    ];

    const hexagonVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, hexagonVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(hexagonVert), gl.STATIC_DRAW);

    const posAttrLocation = gl.getAttribLocation(program, 'vertPosition');
    const colorAttrLocation = gl.getAttribLocation(program, 'vertColor');

    gl.vertexAttribPointer(
        posAttrLocation,
        2,
        gl.FLOAT,
        gl.FALSE,
        2 * Float32Array.BYTES_PER_ELEMENT,
        0
    );

    gl.enableVertexAttribArray(posAttrLocation);
    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 8);
}

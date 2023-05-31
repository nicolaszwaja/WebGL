const vertexShaderTxt = `
    precision mediump float;

    attribute vec3 vertPosition;
    attribute vec3 vertColor;

    varying vec3 fragColor;

    uniform mat4 mWorld;
    uniform mat4 mView;
    uniform mat4 mProj;

    void main()
    {
        fragColor = vertColor;
        gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
    }

`

const fragmentShaderTxt = `
    precision mediump float;

    varying vec3 fragColor;

    void main()
    {
        gl_FragColor = vec4(fragColor, 1.0); // R,G,B, opacity
    }
`
var boxVertices = [
	// X, Y, Z           R, G, B
	// Top
	-1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,

	// Left
	-1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0,

	// Right
	1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,

	// Front
	1.0, 1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0,

	// Back
	1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0,

	// Bottom
	-1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0,
]

let colors = [
	// R, G, B
	0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,

	0.75, 0.25, 0.5, 0.75, 0.25, 0.5, 0.75, 0.25, 0.5, 0.75, 0.25, 0.5,

	0.25, 0.25, 0.75, 0.25, 0.25, 0.75, 0.25, 0.25, 0.75, 0.25, 0.25, 0.75,

	1.0, 0.0, 0.15, 1.0, 0.0, 0.15, 1.0, 0.0, 0.15, 1.0, 0.0, 0.15,

	0.0, 1.0, 0.15, 0.0, 1.0, 0.15, 0.0, 1.0, 0.15, 0.0, 1.0, 0.15,

	0.5, 0.5, 1.0, 0.5, 0.5, 1.0, 0.5, 0.5, 1.0, 0.5, 0.5, 1.0,
]

var boxIndices = [
	// Top
	0, 1, 2, 0, 2, 3,

	// Left
	5, 4, 6, 6, 4, 7,

	// Right
	8, 9, 10, 8, 10, 11,

	// Front
	13, 12, 14, 15, 14, 12,

	// Back
	16, 17, 18, 16, 18, 19,

	// Bottom
	21, 20, 22, 22, 20, 23,
]

class World {
	#backgroundColor = [0.5, 0.0, 0.3]
	program
	#fragmentShader
	#vertexShader
	gl

	constructor(backgroundColor, id) {
		let canvas = document.getElementById(id)
		this.gl = canvas.getContext("webgl")
		this.program = this.gl.createProgram()
		this.#backgroundColor = backgroundColor

		if (!this.gl) {
			alert("WebGL not supported")
		}

		this.prepareBackground()
	}

	prepareBackground() {
		this.gl.clearColor(
			this.#backgroundColor[0],
			this.#backgroundColor[1],
			this.#backgroundColor[2],
			1.0
		)
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
		this.gl.enable(this.gl.DEPTH_TEST)
		this.gl.enable(this.gl.CULL_FACE)
	}

	set background(backgroundColor) {
		this.#backgroundColor = backgroundColor
		this.prepareBackground()
	}

	set fragmentShader(shaderString) {
		this.#fragmentShader = shaderString
	}

	set vertexShader(shaderString) {
		this.#vertexShader = shaderString
	}

	loadShader(type) {
		let shaderType
		let shaderString

		if (type === "VERTEX") {
			shaderType = this.gl.VERTEX_SHADER
			shaderString = this.#vertexShader
		} else if (type === "FRAGMENT") {
			shaderType = this.gl.FRAGMENT_SHADER
			shaderString = this.#fragmentShader
		}

		let shader = this.gl.createShader(shaderType)
		this.gl.shaderSource(shader, shaderString)
		this.gl.compileShader(shader)
		this.gl.attachShader(this.program, shader)
	}

	prepareShaders() {
		this.loadShader("VERTEX")
		this.loadShader("FRAGMENT")
		this.gl.linkProgram(this.program)
	}
}



class Cube {
	#gl
	#program
	#boxVertices
	#boxIndices
	#matWorldUniformLocation
	#matViewUniformLocation
	#matProjUniformLocation
	#worldMatrix
	#worldMatrix2

	constructor(gl, program, boxVertices, boxIndices) {
		this.#gl = gl
		this.#program = program
		this.#boxVertices = boxVertices
		this.#boxIndices = boxIndices
		this.#matWorldUniformLocation = this.#gl.getUniformLocation(
			this.#program,
			"mWorld"
		)
		this.#matViewUniformLocation = this.#gl.getUniformLocation(
			this.#program,
			"mView"
		)
		this.#matProjUniformLocation = this.#gl.getUniformLocation(
			this.#program,
			"mProj"
		)
		this.#worldMatrix = window.mat4.create()
		this.#worldMatrix2 = mat4.create()
	}

	draw() {
		const gl = this.#gl
		const program = this.#program

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

		mat4.fromRotation(this.#worldMatrix, this.calculateAngle(), [1, 2, 0])
		mat4.fromTranslation(this.#worldMatrix2, [-2, 0, 0])
		mat4.mul(this.#worldMatrix, this.#worldMatrix2, this.#worldMatrix)
		gl.uniformMatrix4fv(
			this.#matWorldUniformLocation,
			gl.FALSE,
			this.#worldMatrix
		)
		gl.drawElements(gl.TRIANGLES, this.#boxIndices.length, gl.UNSIGNED_SHORT, 0)

		mat4.fromRotation(this.#worldMatrix, this.calculateAngle(), [0, 2, 1])
		mat4.fromTranslation(this.#worldMatrix2, [2, 0, 0])
		mat4.mul(this.#worldMatrix, this.#worldMatrix2, this.#worldMatrix)
		gl.uniformMatrix4fv(
			this.#matWorldUniformLocation,
			gl.FALSE,
			this.#worldMatrix
		)
		gl.drawElements(gl.TRIANGLES, this.#boxIndices.length, gl.UNSIGNED_SHORT, 0)
	}

	calculateAngle() {
		return angle
	}
}

const world = new World([0.5, 0.0, 0.3], "main-canvas")

world.fragmentShader = fragmentShaderTxt
world.vertexShader = vertexShaderTxt

world.prepareShaders()

const cube = new Cube(
	world.gl,
	world.program,
	boxVertices,
	boxIndices,
)

cube.draw()

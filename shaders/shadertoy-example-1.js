/**
 * Shader: Shadertoy Example 1
 *
 * 3D fractal raymarching shader featuring a Menger sponge fractal.
 * Creates a rotating, animated fractal structure with volumetric lighting.
 *
 * Source: https://www.shadertoy.com/view/tcyfz3
 *
 * Uniforms:
 * - iTime: Elapsed time in seconds for animation
 * - iResolution: Canvas dimensions for coordinate calculation
 */

ShaderRegistry.register('shadertoy-example-1', {
	shaders: {
		'shadertoy-example-1-image': {
			uniforms: {
				iTime: function (gl, loc) {
					gl.uniform1f(loc, performance.now() / 1000);
				},
				iResolution: function (gl, loc, ctx) {
					gl.uniform2f(loc, ctx.width, ctx.height);
				}
			}
		}
	},
	onError: function (error, canvas) {
		console.error('Shadertoy example 1 shader error:', error);
		canvas.classList.add('shader-web-background-fallback');
	}
},
	'<strong>Shadertoy Example 1</strong>' +
	'3D fractal raymarching shader featuring a rotating Menger sponge. ' +
	'Uses volumetric raymarching with iterative distance field calculations. ' +
	'Single-pass shader with time-based rotation and lighting effects. ' +
	'Source: https://www.shadertoy.com/view/tcyfz3',
	{ expensive: true }
);

/**
 * Shader: Shadertoy Example 3
 *
 * 3D raymarching shader with rotating fractal structure.
 * Features iterative distance field calculations with rotation matrix.
 *
 * Source: https://www.shadertoy.com/view/MtsGzB
 * Based on shader from coyote: https://www.shadertoy.com/view/ltfGzS
 *
 * Uniforms:
 * - iTime: Elapsed time in seconds for animation
 * - iResolution: Canvas dimensions for coordinate calculation
 */

ShaderRegistry.register('shadertoy-example-3', {
	shaders: {
		'shadertoy-example-3-image': {
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
		console.error('Shadertoy example 3 shader error:', error);
		canvas.classList.add('shader-web-background-fallback');
	}
},
	'<strong>Shadertoy Example 3</strong>' +
	'3D raymarching shader with rotating fractal structure. ' +
	'Uses iterative distance field calculations with rotation matrix. ' +
	'Features animated rotation and volumetric rendering effects. ' +
	'Source: https://www.shadertoy.com/view/MtsGzB',
	{ expensive: true }
);

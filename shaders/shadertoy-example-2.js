/**
 * Shader: Shadertoy Example 2
 *
 * Complex raymarching shader featuring a procedurally generated planet surface
 * with pyramids, atmospheric effects, and a gas giant in the sky.
 *
 * Source: https://www.shadertoy.com/view/WfGfzK
 *
 * Uniforms:
 * - iTime: Elapsed time in seconds for animation
 * - iResolution: Canvas dimensions for coordinate calculation
 */

ShaderRegistry.register('shadertoy-example-2', {
	shaders: {
		'shadertoy-example-2-image': {
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
		console.error('Shadertoy example 2 shader error:', error);
		canvas.classList.add('shader-web-background-fallback');
	}
},
	'<strong>Shadertoy Example 2</strong>' +
	'Complex raymarching shader featuring a procedurally generated planet surface ' +
	'with pyramids, atmospheric effects, and a gas giant in the sky. ' +
	'Single-pass shader with advanced lighting, fog, and color processing. ' +
	'Source: https://www.shadertoy.com/view/WfGfzK',
	{ expensive: true }
);

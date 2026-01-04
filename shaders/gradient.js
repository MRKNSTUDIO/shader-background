/**
 * Shader: Simple Gradient
 *
 * A basic single-pass shader demonstrating animated color gradients.
 * Uses time-based trigonometric functions to create smooth color transitions.
 *
 * Uniforms:
 * - iTime: Elapsed time in seconds for animation
 * - iResolution: Canvas dimensions for UV calculation
 */

ShaderRegistry.register('gradient', {
	shaders: {
		'gradient-image': {
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
		console.error('Gradient shader error:', error);
		canvas.classList.add('shader-web-background-fallback');
	}
},
	'<strong>Simple Gradient</strong>' +
	'Single-pass shader with time-based color animation. ' +
	'Demonstrates basic uniform usage (iTime, iResolution). ' +
	'No feedback buffer - renders directly to screen.'
);

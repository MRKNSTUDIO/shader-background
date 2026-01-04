/**
 * Shader: Feedback Circle
 *
 * Two-pass shader demonstrating the feedback loop technique.
 * A moving circle leaves a fading trail as it orbits the screen.
 *
 * Pass 1 (feedback-circle-buffer):
 * - Reads previous frame from buffer
 * - Fades it slightly
 * - Draws new circle on top
 *
 * Pass 2 (feedback-circle-image):
 * - Copies buffer to screen
 *
 * Uniforms:
 * - iResolution: Canvas dimensions
 * - iMinDimension: Min of width/height for aspect-correct coordinates
 * - iChannel0: Previous frame texture (feedback buffer)
 * - iFeedbackFadeRate: How fast the trail fades (0.99 = slow, 0.9 = fast)
 * - iCircleCenter: Current position of the circle
 * - iCircleRadius: Size of the circle
 * - iCircleEdgeSmoothing: Softness of circle edge
 */

(function () {
	var minDimension = Math.min(window.innerWidth, window.innerHeight);
	var circleCenterX = 0;
	var circleCenterY = 0;

	var feedbackFadeRate = 0.995;
	var circleRadius = 0.3;
	var circleEdgeSmoothing = 0.15;

	ShaderRegistry.register('feedback-circle', {
		onResize: function (width, height) {
			minDimension = Math.min(width, height);
		},
		onBeforeFrame: function () {
			var time = performance.now() / 1000;
			circleCenterX = Math.sin(time * 0.5) * 0.6;
			circleCenterY = Math.cos(time * 0.7) * 0.6;
		},
		shaders: {
			'feedback-circle-buffer': {
				uniforms: {
					iResolution: function (gl, loc, ctx) {
						gl.uniform2f(loc, ctx.width, ctx.height);
					},
					iMinDimension: function (gl, loc) {
						gl.uniform1f(loc, minDimension);
					},
					iFeedbackFadeRate: function (gl, loc) {
						gl.uniform1f(loc, feedbackFadeRate);
					},
					iCircleCenter: function (gl, loc) {
						gl.uniform2f(loc, circleCenterX, circleCenterY);
					},
					iCircleRadius: function (gl, loc) {
						gl.uniform1f(loc, circleRadius);
					},
					iCircleEdgeSmoothing: function (gl, loc) {
						gl.uniform1f(loc, circleEdgeSmoothing);
					},
					iChannel0: function (gl, loc, ctx) {
						ctx.texture(loc, ctx.buffers['feedback-circle-buffer']);
					}
				}
			},
			'feedback-circle-image': {
				uniforms: {
					iResolution: function (gl, loc, ctx) {
						gl.uniform2f(loc, ctx.width, ctx.height);
					},
					iChannel0: function (gl, loc, ctx) {
						ctx.texture(loc, ctx.buffers['feedback-circle-buffer']);
					}
				}
			}
		},
		onError: function (error, canvas) {
			console.error('Feedback circle shader error:', error);
			canvas.classList.add('shader-web-background-fallback');
		}
	},
		'<strong>Feedback Circle</strong>' +
		'Two-pass shader with feedback loop. A colored circle orbits the center, ' +
		'leaving a fading trail. Demonstrates offscreen buffer usage and ' +
		'reading previous frame for temporal effects.'
	);
})();

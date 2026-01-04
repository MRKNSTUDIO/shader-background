/**
 * Shader: Spectral Feedback
 *
 * Advanced two-pass shader with spectral color mapping and feedback effects.
 * Adapted from the demo.html - uses the Zucconi spectral algorithm to map
 * wavelengths to RGB colors, creating flowing rainbow effects.
 *
 * The spectral_zucconi6 function converts a wavelength value (0-1) to
 * natural light dispersion colors (like a rainbow or prism).
 *
 * Features:
 * - Feedback loop with color-based distortion
 * - Spectral color cycling
 * - Soft blob rendering
 * - Screen-ratio aware for proper aspect handling
 */

(function () {
	// Spectral Zucconi6 algorithm - converts wavelength to RGB
	// Based on: https://www.shadertoy.com/view/ls2Bz1
	var ONE_IN_3D = [1, 1, 1];
	var c1 = [3.54585104, 2.93225262, 2.41593945];
	var x1 = [0.69549072, 0.49228336, 0.27699880];
	var y1 = [0.02312639, 0.15225084, 0.52607955];
	var c2 = [3.90307140, 3.21182957, 3.96587128];
	var x2 = [0.11748627, 0.86755042, 0.66077860];
	var y2 = [0.84897130, 0.88445281, 0.73949448];

	function saturate(x) {
		return Math.min(Math.max(x, 0), 1);
	}

	function to3d(x) {
		return [x, x, x];
	}

	function add3d(a, b) {
		return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
	}

	function subtract3d(a, b) {
		return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
	}

	function multiply3d(a, b) {
		return [a[0] * b[0], a[1] * b[1], a[2] * b[2]];
	}

	function pow23d(x) {
		return multiply3d(x, x);
	}

	function saturate3d(x) {
		return [saturate(x[0]), saturate(x[1]), saturate(x[2])];
	}

	function bump3y(x, yoffset) {
		return saturate3d(subtract3d(subtract3d(ONE_IN_3D, pow23d(x)), yoffset));
	}

	function spectral_zucconi6(wavelength) {
		return add3d(
			bump3y(multiply3d(c1, subtract3d(to3d(wavelength), x1)), y1),
			bump3y(multiply3d(c2, subtract3d(to3d(wavelength), x2)), y2)
		);
	}

	// Shader state - initialize with window dimensions
	var minDimension = Math.min(window.innerWidth, window.innerHeight);
	var screenRatioHalfX = window.innerHeight >= window.innerWidth ? 0.5 : (window.innerHeight / window.innerWidth * 0.5);
	var screenRatioHalfY = window.innerWidth >= window.innerHeight ? 0.5 : (window.innerWidth / window.innerHeight * 0.5);
	var blobColor = [1, 1, 1];

	// Parameters
	var feedbackZoomRate = 0.002;
	var feedbackFadeRate = 0.995;
	var feedbackColorShiftZoom = 0.15;
	var feedbackColorShiftImpact = 0.005;
	var drawIntensity = 0.4;
	var blobRadius = 0.4;
	var colorPulseSpeed = 0.08;

	ShaderRegistry.register('spectral-feedback', {
		onResize: function (width, height) {
			minDimension = Math.min(width, height);
			if (width >= height) {
				screenRatioHalfX = height / width * 0.5;
				screenRatioHalfY = 0.5;
			} else {
				screenRatioHalfX = 0.5;
				screenRatioHalfY = width / height * 0.5;
			}
		},
		onBeforeFrame: function () {
			var time = performance.now() / 1000;
			var wavelength = (time * colorPulseSpeed) % 1;
			blobColor = spectral_zucconi6(wavelength);
		},
		shaders: {
			'spectral-feedback-buffer': {
				uniforms: {
					iResolution: function (gl, loc, ctx) {
						gl.uniform2f(loc, ctx.width, ctx.height);
					},
					iMinDimension: function (gl, loc) {
						gl.uniform1f(loc, minDimension);
					},
					iScreenRatioHalf: function (gl, loc) {
						gl.uniform2f(loc, screenRatioHalfX, screenRatioHalfY);
					},
					iFeedbackZoomRate: function (gl, loc) {
						gl.uniform1f(loc, feedbackZoomRate);
					},
					iFeedbackFadeRate: function (gl, loc) {
						gl.uniform1f(loc, feedbackFadeRate);
					},
					iFeedbackColorShiftZoom: function (gl, loc) {
						gl.uniform1f(loc, feedbackColorShiftZoom);
					},
					iFeedbackColorShiftImpact: function (gl, loc) {
						gl.uniform1f(loc, feedbackColorShiftImpact);
					},
					iDrawIntensity: function (gl, loc) {
						gl.uniform1f(loc, drawIntensity);
					},
					iBlobColor: function (gl, loc) {
						gl.uniform3f(loc, blobColor[0], blobColor[1], blobColor[2]);
					},
					iBlobRadius: function (gl, loc) {
						gl.uniform1f(loc, blobRadius);
					},
					iChannel0: function (gl, loc, ctx) {
						ctx.texture(loc, ctx.buffers['spectral-feedback-buffer']);
					}
				}
			},
			'spectral-feedback-image': {
				uniforms: {
					iResolution: function (gl, loc, ctx) {
						gl.uniform2f(loc, ctx.width, ctx.height);
					},
					iChannel0: function (gl, loc, ctx) {
						ctx.texture(loc, ctx.buffers['spectral-feedback-buffer']);
					}
				}
			}
		},
		onError: function (error, canvas) {
			console.error('Spectral feedback shader error:', error);
			canvas.classList.add('shader-web-background-fallback');
		}
	},
		'<strong>Spectral Feedback</strong>' +
		'Advanced feedback shader with spectral color mapping. Uses the Zucconi ' +
		'algorithm to create natural rainbow colors that cycle over time. ' +
		'The feedback loop creates mesmerizing flowing patterns. ' +
		'Adapted from xemantic.com demo.'
	);
})();

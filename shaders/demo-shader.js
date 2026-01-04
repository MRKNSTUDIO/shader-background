/**
 * Shader: Demo Shader
 *
 * Advanced two-pass shader from https://xemantic.github.io/shader-web-background/ with:
 * - Spectral color mapping using Zucconi algorithm
 * - Mouse and gyroscope interaction
 * - Scroll parallax effects
 * - Dual blob rendering with color-shifted radii
 * - Complex feedback effects with zoom, shift, and color distortion
 */

(function () {
	// Spectral Zucconi6 algorithm - converts wavelength to RGB
	// Based on: https://www.shadertoy.com/view/ls2Bz1
	const ONE_IN_3D = [1, 1, 1];
	const c1 = [3.54585104, 2.93225262, 2.41593945];
	const x1 = [0.69549072, 0.49228336, 0.27699880];
	const y1 = [0.02312639, 0.15225084, 0.52607955];
	const c2 = [3.90307140, 3.21182957, 3.96587128];
	const x2 = [0.11748627, 0.86755042, 0.66077860];
	const y2 = [0.84897130, 0.88445281, 0.73949448];

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

	var time;
	var minDimension = Math.min(window.innerWidth, window.innerHeight);
	var screenRatioHalfX = window.innerHeight >= window.innerWidth ? 0.5 : (window.innerHeight / window.innerWidth * 0.5);
	var screenRatioHalfY = window.innerWidth >= window.innerHeight ? 0.5 : (window.innerWidth / window.innerHeight * 0.5);

	var mouseX = window.innerWidth / 2;
	var mouseY = window.innerHeight / 2;
	var stMouseX = 0;
	var stMouseY = 0;

	var tiltLR = 0;
	var tiltFB = 0;
	var tiltFBDelta = null;

	var feedbackShiftVectorX = 0;
	var feedbackShiftVectorY = 0;

	var oldScrollY = 0;

	var drawCenterX = 0;
	var drawCenterY = 0;

	const feedbackMouseShiftFactor = 0.003;
	const feedbackTiltShiftFactor = 0.0002;
	const backgroundParallaxScrollingFactor = 0.5;
	const blob1ColorPulseSpeed = 0.04;
	const blob2ColorPulseSpeed = 0.04;
	const blob2ColorPulseShift = 0.5;
	const drawCenterShiftDownScale = 0.99;

	var blob1Color = [1, 1, 1];
	var blob2Color = [1, 1, 1];

	function handleDeviceOrientationChange(event) {
		if (event.beta) {
			if (tiltFBDelta !== null) {
				tiltFB = event.beta - tiltFBDelta;
			} else {
				tiltFBDelta = event.beta;
				tiltFB = 0;
			}
		}
		if (event.gamma) {
			tiltLR = event.gamma;
		}
	}

	function trackDeviceOrientation() {
		window.addEventListener('deviceorientation', handleDeviceOrientationChange, false);
	}

	function initDeviceOrientation() {
		if (DeviceOrientationEvent && DeviceOrientationEvent.requestPermission) {
			DeviceOrientationEvent.requestPermission()
				.then(function (response) {
					if (response === 'granted') {
						tiltFBDelta = null;
						trackDeviceOrientation();
					}
				})
				.catch(console.error);
		} else if (window.DeviceOrientationEvent) {
			trackDeviceOrientation();
			tiltFBDelta = null;
		}
	}

	document.addEventListener('mousemove', function (event) {
		mouseX = event.clientX;
		mouseY = event.clientY;
	});

	if (window.DeviceOrientationEvent) {
		if (!DeviceOrientationEvent.requestPermission) {
			trackDeviceOrientation();
		}
	}

	ShaderRegistry.register('demo-shader', {
		onInit: function (ctx) {
			mouseX = ctx.cssWidth / 2;
			mouseY = ctx.cssHeight / 2;
			oldScrollY = window.scrollY;
			drawCenterX = 0;
			drawCenterY = 0;
		},
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
		onBeforeFrame: function (ctx) {
			stMouseX = (2 * ctx.toShaderX(mouseX) - ctx.width) / minDimension;
			stMouseY = (2 * ctx.toShaderY(mouseY) - ctx.height) / minDimension;
			time = performance.now() / 1000;
			const scrollY = window.scrollY;
			const scrollYDelta = scrollY - oldScrollY;
			if (scrollYDelta === 0) {
				feedbackShiftVectorY = 0;
			} else {
				feedbackShiftVectorY =
					scrollYDelta / minDimension
					* 2 * ctx.cssPixelRatio
					* backgroundParallaxScrollingFactor;
				drawCenterY += feedbackShiftVectorY;
			}
			oldScrollY = scrollY;
			if (tiltFBDelta !== null) {
				feedbackShiftVectorX = tiltLR * feedbackTiltShiftFactor;
				feedbackShiftVectorY += tiltFB * -feedbackTiltShiftFactor;
			} else {
				feedbackShiftVectorX = stMouseX * feedbackMouseShiftFactor;
				feedbackShiftVectorY += stMouseY * feedbackMouseShiftFactor;
			}
			blob1Color = spectral_zucconi6((time * blob1ColorPulseSpeed) % 1);
			blob2Color = spectral_zucconi6((time * blob2ColorPulseSpeed + blob2ColorPulseShift) % 1);
		},
		shaders: {
			'demo-feedback': {
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
					iFeedbackZoomCenter: function (gl, loc) {
						gl.uniform2f(loc, 0, 0);
					},
					iFeedbackZoomRate: function (gl, loc) {
						gl.uniform1f(loc, 0.001);
					},
					iFeedbackShiftVector: function (gl, loc) {
						gl.uniform2f(loc, feedbackShiftVectorX, feedbackShiftVectorY);
					},
					iFeedbackFadeRate: function (gl, loc) {
						gl.uniform1f(loc, 0.999);
					},
					iFeedbackColorShiftZoom: function (gl, loc) {
						gl.uniform1f(loc, 0.2);
					},
					iFeedbackColorShiftImpact: function (gl, loc) {
						gl.uniform1f(loc, 0.004);
					},
					iDrawCenter: function (gl, loc) {
						gl.uniform2f(loc, drawCenterX, drawCenterY);
					},
					iDrawIntensity: function (gl, loc) {
						gl.uniform1f(loc, 0.35);
					},
					iBlobEdgeSmoothing: function (gl, loc) {
						gl.uniform1f(loc, 0.04);
					},
					iBlob1Radius: function (gl, loc) {
						gl.uniform1f(loc, 0.3);
					},
					iBlob1PowFactor: function (gl, loc) {
						gl.uniform1f(loc, 40.0);
					},
					iBlob1Color: function (gl, loc) {
						gl.uniform3f(loc, blob1Color[0], blob1Color[1], blob1Color[2]);
					},
					iBlob2Radius: function (gl, loc) {
						gl.uniform1f(loc, 0.4);
					},
					iBlob2PowFactor: function (gl, loc) {
						gl.uniform1f(loc, 40.0);
					},
					iBlob2Color: function (gl, loc) {
						gl.uniform3f(loc, blob2Color[0], blob2Color[1], blob2Color[2]);
					},
					iColorShiftOfRadius: function (gl, loc) {
						gl.uniform1f(loc, 0.5);
					},
					iChannel0: function (gl, loc, ctx) {
						ctx.texture(loc, ctx.buffers['demo-feedback']);
					}
				}
			},
			'demo-image': {
				uniforms: {
					iResolution: function (gl, loc, ctx) {
						gl.uniform2f(loc, ctx.width, ctx.height);
					},
					iChannel0: function (gl, loc, ctx) {
						ctx.texture(loc, ctx.buffers['demo-feedback']);
					}
				}
			}
		},
		onAfterFrame: function () {
			drawCenterY *= drawCenterShiftDownScale;
		},
		onError: function (error, canvas) {
			console.error('Demo shader error:', error);
			canvas.classList.add('shader-web-background-fallback');
		}
	},
		'<strong>Demo Shader</strong>' +
		'Advanced shader from https://xemantic.github.io/shader-web-background/ with spectral colors, mouse/gyro interaction, ' +
		'and scroll parallax. Features dual blobs with color-shifted radii, complex ' +
		'feedback effects with zoom and distortion, and natural rainbow colors using ' +
		'the Zucconi spectral algorithm.'
	);

	if (window.DeviceOrientationEvent && DeviceOrientationEvent.requestPermission) {
		window.addEventListener('load', function () {
			setTimeout(initDeviceOrientation, 1000);
		});
	}
})();

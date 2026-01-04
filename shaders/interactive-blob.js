/**
 * Shader: Interactive Blob
 *
 * Two-pass shader with mouse and gyroscope interaction.
 * The blob follows your mouse (or device tilt) and leaves a colorful trail.
 * Uses spectral colors that shift based on interaction.
 */

(function () {
	var minDimension = Math.min(window.innerWidth, window.innerHeight);
	var screenRatioHalfX = window.innerHeight >= window.innerWidth ? 0.5 : (window.innerHeight / window.innerWidth * 0.5);
	var screenRatioHalfY = window.innerWidth >= window.innerHeight ? 0.5 : (window.innerWidth / window.innerHeight * 0.5);

	var mouseX = window.innerWidth / 2;
	var mouseY = window.innerHeight / 2;
	var shaderMouseX = 0;
	var shaderMouseY = 0;

	var tiltLR = 0;
	var tiltFB = 0;
	var tiltFBDelta = null;

	var blobColor = [1, 0.5, 0.8];
	var blobCenterX = 0;
	var blobCenterY = 0;

	var feedbackFadeRate = 0.98;
	var blobRadius = 0.25;
	var blobIntensity = 0.6;
	var colorShiftSpeed = 0.1;

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

	ShaderRegistry.register('interactive-blob', {
		onInit: function (ctx) {
			mouseX = ctx.cssWidth / 2;
			mouseY = ctx.cssHeight / 2;
			blobCenterX = 0;
			blobCenterY = 0;
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
			var time = performance.now() / 1000;

			shaderMouseX = ctx.toShaderX(mouseX);
			shaderMouseY = ctx.toShaderY(mouseY);

			var stMouseX = (2 * shaderMouseX - ctx.width) / minDimension;
			var stMouseY = (2 * shaderMouseY - ctx.height) / minDimension;

			var targetX = stMouseX;
			var targetY = stMouseY;

			if (tiltFBDelta !== null) {
				var tiltFactor = 0.01;
				targetX += tiltLR * tiltFactor;
				targetY += tiltFB * -tiltFactor;
			}

			var smoothFactor = 0.15;
			blobCenterX += (targetX - blobCenterX) * smoothFactor;
			blobCenterY += (targetY - blobCenterY) * smoothFactor;

			var distance = Math.sqrt(blobCenterX * blobCenterX + blobCenterY * blobCenterY);
			var hue = (time * colorShiftSpeed + distance * 0.5) % 1.0;

			blobColor[0] = 0.5 + 0.5 * Math.sin(hue * Math.PI * 2);
			blobColor[1] = 0.5 + 0.5 * Math.sin((hue + 0.33) * Math.PI * 2);
			blobColor[2] = 0.5 + 0.5 * Math.sin((hue + 0.66) * Math.PI * 2);
		},
		shaders: {
			'interactive-blob-buffer': {
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
					iBlobCenter: function (gl, loc) {
						gl.uniform2f(loc, blobCenterX, blobCenterY);
					},
					iBlobRadius: function (gl, loc) {
						gl.uniform1f(loc, blobRadius);
					},
					iBlobColor: function (gl, loc) {
						gl.uniform3f(loc, blobColor[0], blobColor[1], blobColor[2]);
					},
					iBlobIntensity: function (gl, loc) {
						gl.uniform1f(loc, blobIntensity);
					},
					iChannel0: function (gl, loc, ctx) {
						ctx.texture(loc, ctx.buffers['interactive-blob-buffer']);
					}
				}
			},
			'interactive-blob-image': {
				uniforms: {
					iResolution: function (gl, loc, ctx) {
						gl.uniform2f(loc, ctx.width, ctx.height);
					},
					iChannel0: function (gl, loc, ctx) {
						ctx.texture(loc, ctx.buffers['interactive-blob-buffer']);
					}
				}
			}
		},
		onError: function (error, canvas) {
			console.error('Interactive blob shader error:', error);
			canvas.classList.add('shader-web-background-fallback');
		}
	},
		'<strong>Interactive Blob</strong>' +
		'Interactive shader that responds to mouse movement and device orientation. ' +
		'Move your mouse or tilt your device to control the colorful blob. ' +
		'The blob follows your input smoothly and leaves a fading trail with ' +
		'spectral colors that shift based on position and time.'
	);

	if (window.DeviceOrientationEvent && DeviceOrientationEvent.requestPermission) {
		window.addEventListener('load', function () {
			setTimeout(initDeviceOrientation, 1000);
		});
	}
})();

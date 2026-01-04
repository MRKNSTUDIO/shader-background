/**
 * Shader: Voronoi Dreams
 *
 * Living crystalline cellular pattern with organic movement.
 * Cells pulse and breathe like membrane, responding to mouse and device tilt.
 * Jewel-tone palette with luminous stained-glass edge highlights.
 */

(function () {
	var minDimension = Math.min(window.innerWidth, window.innerHeight);

	var mouseX = window.innerWidth / 2;
	var mouseY = window.innerHeight / 2;
	var shaderMouseX = 0;
	var shaderMouseY = 0;

	// Smoothed mouse position for delayed effect
	var smoothMouseX = 0;
	var smoothMouseY = 0;
	var mouseSmoothing = 0.04; // Lower = more delay (0.01-0.1 range)

	// Mouse velocity tracking
	var prevMouseX = 0;
	var prevMouseY = 0;
	var mouseVelocity = 0;
	var smoothVelocity = 0;
	var velocitySmoothing = 0.08; // How fast velocity decays when stopped

	var tiltLR = 0;
	var tiltFB = 0;
	var tiltFBDelta = null;

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

	ShaderRegistry.register('voronoi-dreams', {
		onInit: function (ctx) {
			mouseX = ctx.cssWidth / 2;
			mouseY = ctx.cssHeight / 2;
			// Initialize smooth position to center
			smoothMouseX = ctx.width / 2;
			smoothMouseY = ctx.height / 2;
		},
		onResize: function (width, height) {
			minDimension = Math.min(width, height);
		},
		onBeforeFrame: function (ctx) {
			// Get target mouse position in shader coords
			var targetX = ctx.toShaderX(mouseX);
			var targetY = ctx.toShaderY(mouseY);

			// Calculate instantaneous velocity
			var dx = targetX - prevMouseX;
			var dy = targetY - prevMouseY;
			mouseVelocity = Math.sqrt(dx * dx + dy * dy);
			prevMouseX = targetX;
			prevMouseY = targetY;

			// Smooth velocity (ramps up fast, decays slowly when stopped)
			var velocityTarget = Math.min(mouseVelocity * 0.15, 1.0);
			smoothVelocity += (velocityTarget - smoothVelocity) * velocitySmoothing;

			// Smoothly interpolate toward target (creates delay)
			smoothMouseX += (targetX - smoothMouseX) * mouseSmoothing;
			smoothMouseY += (targetY - smoothMouseY) * mouseSmoothing;

			shaderMouseX = smoothMouseX;
			shaderMouseY = smoothMouseY;
		},
		shaders: {
			'voronoi-dreams-buffer': {
				uniforms: {
					iResolution: function (gl, loc, ctx) {
						gl.uniform2f(loc, ctx.width, ctx.height);
					},
					iMinDimension: function (gl, loc) {
						gl.uniform1f(loc, minDimension);
					},
					iTime: function (gl, loc) {
						gl.uniform1f(loc, performance.now() / 1000);
					},
					iMouse: function (gl, loc) {
						gl.uniform2f(loc, shaderMouseX, shaderMouseY);
					},
					iTiltX: function (gl, loc) {
						gl.uniform1f(loc, tiltLR);
					},
					iTiltY: function (gl, loc) {
						gl.uniform1f(loc, tiltFB);
					},
					iVelocity: function (gl, loc) {
						gl.uniform1f(loc, smoothVelocity);
					},
					iChannel0: function (gl, loc, ctx) {
						ctx.texture(loc, ctx.buffers['voronoi-dreams-buffer']);
					}
				}
			},
			'voronoi-dreams-image': {
				uniforms: {
					iResolution: function (gl, loc, ctx) {
						gl.uniform2f(loc, ctx.width, ctx.height);
					},
					iChannel0: function (gl, loc, ctx) {
						ctx.texture(loc, ctx.buffers['voronoi-dreams-buffer']);
					}
				}
			}
		},
		onError: function (error, canvas) {
			console.error('Voronoi Dreams shader error:', error);
			canvas.classList.add('shader-web-background-fallback');
		}
	},
		'<strong>Voronoi Dreams</strong> ' +
		'Claude Opus 4.5 Test: ' +
		'Ethereal silk ribbons flowing through deep space. ' +
		'Move your mouse to send ripples through the fabric. ' +
		'Tilt your device to shift the drift direction. ' +
		'Muted palette of ocean blues, teals, and soft rose.'
	);

	if (window.DeviceOrientationEvent && DeviceOrientationEvent.requestPermission) {
		window.addEventListener('load', function () {
			setTimeout(initDeviceOrientation, 1000);
		});
	}
})();

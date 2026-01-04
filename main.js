/**
 * Shader Testing Environment - Main Controller
 * Handles shader registration, initialization, and switching
 */

const ShaderRegistry = {
	shaders: {},
	currentShader: null,
	currentContext: null,
	performanceWarningShown: false,

	/**
	 * Register a shader configuration
	 * @param {string} id - Unique identifier for the shader
	 * @param {object} config - Shader configuration object
	 * @param {string} description - Human-readable description
	 * @param {object} options - Optional metadata (e.g., { expensive: true })
	 */
	register: function (id, config, description, options = {}) {
		this.shaders[id] = {
			config: config,
			description: description,
			expensive: options.expensive || false
		};
	},

	/**
	 * Check if current display resolution is high (4K or higher)
	 * @returns {boolean} True if resolution is 4K or higher
	 */
	isHighResolution: function () {
		const width = window.screen.width * (window.devicePixelRatio || 1);
		const height = window.screen.height * (window.devicePixelRatio || 1);
		const totalPixels = width * height;
		return totalPixels >= 3840 * 2160;
	},

	/**
	 * Show performance warning dialog
	 * @param {string} shaderId - Shader identifier
	 * @param {Function} onConfirm - Callback when user confirms
	 * @param {Function} onCancel - Callback when user cancels
	 */
	showPerformanceWarning: function (shaderId, onConfirm, onCancel) {
		const shaderDef = this.shaders[shaderId];
		const modal = document.createElement('div');
		modal.id = 'performance-warning-modal';
		modal.className = 'performance-warning-modal';

		const resolution = `${window.screen.width * (window.devicePixelRatio || 1)}x${window.screen.height * (window.devicePixelRatio || 1)}`;
		const pixelCount = (window.screen.width * (window.devicePixelRatio || 1) * window.screen.height * (window.devicePixelRatio || 1)).toLocaleString();

		modal.innerHTML = `
      <div class="performance-warning-content">
        <h2>⚠️ Performance Warning</h2>
        <p>This shader is computationally expensive and may cause high GPU usage.</p>
        <div class="warning-details">
          <p><strong>Display Resolution:</strong> ${resolution}</p>
          <p><strong>Total Pixels:</strong> ${pixelCount}</p>
          <p><strong>Shader:</strong> ${shaderId}</p>
        </div>
        <p class="warning-message">Running this shader at full resolution may cause:</p>
        <ul>
          <li>High GPU usage and fan noise</li>
          <li>Increased power consumption</li>
          <li>Reduced battery life on laptops</li>
          <li>Potential browser slowdown</li>
        </ul>
        <div class="warning-actions">
          <button id="warning-continue" class="warning-btn warning-btn-primary">Continue Anyway</button>
          <button id="warning-cancel" class="warning-btn warning-btn-secondary">Cancel</button>
        </div>
        <label class="warning-checkbox">
          <input type="checkbox" id="warning-dont-show">
          Don't show this warning again
        </label>
      </div>
    `;

		document.body.appendChild(modal);

		const dontShowAgain = localStorage.getItem('shader-performance-warning-disabled') === 'true';
		if (dontShowAgain) {
			onConfirm();
			modal.remove();
			return;
		}

		document.getElementById('warning-continue').addEventListener('click', () => {
			const checkbox = document.getElementById('warning-dont-show');
			if (checkbox.checked) {
				localStorage.setItem('shader-performance-warning-disabled', 'true');
			}
			modal.remove();
			onConfirm();
		});

		document.getElementById('warning-cancel').addEventListener('click', () => {
			modal.remove();
			if (onCancel) onCancel();
		});

		modal.addEventListener('click', (e) => {
			if (e.target === modal) {
				modal.remove();
				if (onCancel) onCancel();
			}
		});
	},

	/**
	 * Initialize and start a shader by its ID
	 * @param {string} id - Shader identifier
	 */
	start: function (id) {
		if (!this.shaders[id]) {
			console.error('Shader not found:', id);
			return;
		}

		const shaderDef = this.shaders[id];
		const isHighRes = this.isHighResolution();
		const isExpensive = shaderDef.expensive;

		if (isExpensive && isHighRes) {
			this.showPerformanceWarning(id, () => {
				this._startShader(id);
			}, () => {
				const selector = document.getElementById('shader-select');
				if (selector && this.currentShader) {
					selector.value = this.currentShader;
				}
			});
		} else {
			this._startShader(id);
		}
	},

	/**
	 * Internal method to actually start the shader
	 * @param {string} id - Shader identifier
	 * @private
	 */
	_startShader: function (id) {
		this.stop();
		this.currentShader = id;

		const shaderDef = this.shaders[id];

		try {
			this.currentContext = shaderWebBackground.shade(shaderDef.config);
			this.updateInfo(shaderDef.description);
		} catch (error) {
			console.error('Failed to start shader:', error);
			this.updateInfo('Error: ' + error.message);
		}
	},

	/**
	 * Stop the current shader and remove its canvas
	 */
	stop: function () {
		const existingCanvas = document.getElementById('shader-web-background');
		if (existingCanvas) {
			existingCanvas.remove();
		}
		this.currentContext = null;
	},

	/**
	 * Update the shader info display
	 * @param {string} description - Description text
	 */
	updateInfo: function (description) {
		const infoEl = document.getElementById('shader-info');
		if (infoEl) {
			infoEl.innerHTML = description;
		}
	}
};

/**
 * Initialize the shader selector and start the default shader
 */
function initShaderEnvironment() {
	const selector = document.getElementById('shader-select');

	selector.addEventListener('change', function () {
		ShaderRegistry.start(this.value);
	});

	// Start with the first shader
	ShaderRegistry.start(selector.value);
}

// Initialize after all scripts are loaded (window.load waits for all resources)
window.addEventListener('load', initShaderEnvironment);

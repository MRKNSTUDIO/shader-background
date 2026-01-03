/**
 * Shader Testing Environment - Main Controller
 * Handles shader registration, initialization, and switching
 */

const ShaderRegistry = {
  shaders: {},
  currentShader: null,
  currentContext: null,

  /**
   * Register a shader configuration
   * @param {string} id - Unique identifier for the shader
   * @param {object} config - Shader configuration object
   * @param {string} description - Human-readable description
   */
  register: function(id, config, description) {
    this.shaders[id] = {
      config: config,
      description: description
    };
  },

  /**
   * Initialize and start a shader by its ID
   * @param {string} id - Shader identifier
   */
  start: function(id) {
    if (!this.shaders[id]) {
      console.error('Shader not found:', id);
      return;
    }

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
  stop: function() {
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
  updateInfo: function(description) {
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

  selector.addEventListener('change', function() {
    ShaderRegistry.start(this.value);
  });

  // Start with the first shader
  ShaderRegistry.start(selector.value);
}

// Initialize after all scripts are loaded (window.load waits for all resources)
window.addEventListener('load', initShaderEnvironment);

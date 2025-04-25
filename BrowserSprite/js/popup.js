// Popup script for Browser Sprite settings
document.addEventListener('DOMContentLoaded', function() {
  // Load saved settings
  chrome.storage.local.get({
    petType: 'cat',
    size: 100,
    speed: 100,
    followCursor: true,
    randomMovement: true,
    enabled: true
  }, function(settings) {
    // Set pet type
    document.querySelector(`input[name="petType"][value="${settings.petType}"]`).checked = true;
    
    // Set size slider
    const sizeSlider = document.getElementById('sizeSlider');
    const sizeValue = document.getElementById('sizeValue');
    sizeSlider.value = settings.size;
    sizeValue.textContent = `${settings.size}%`;
    
    // Set speed slider
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    speedSlider.value = settings.speed;
    speedValue.textContent = `${settings.speed}%`;
    
    // Set behavior checkboxes
    document.getElementById('followCursor').checked = settings.followCursor;
    document.getElementById('randomMovement').checked = settings.randomMovement;
    
    // Set enabled toggle
    document.getElementById('enableSprite').checked = settings.enabled;
  });
  
  // Save settings when changed
  function saveSettings() {
    const petType = document.querySelector('input[name="petType"]:checked').value;
    const size = parseInt(document.getElementById('sizeSlider').value);
    const speed = parseInt(document.getElementById('speedSlider').value);
    const followCursor = document.getElementById('followCursor').checked;
    const randomMovement = document.getElementById('randomMovement').checked;
    const enabled = document.getElementById('enableSprite').checked;
    
    chrome.storage.local.set({
      petType: petType,
      size: size,
      speed: speed,
      followCursor: followCursor,
      randomMovement: randomMovement,
      enabled: enabled
    });
  }
  
  // Update size value display
  document.getElementById('sizeSlider').addEventListener('input', function() {
    document.getElementById('sizeValue').textContent = `${this.value}%`;
  });
  
  // Update speed value display
  document.getElementById('speedSlider').addEventListener('input', function() {
    document.getElementById('speedValue').textContent = `${this.value}%`;
  });
  
  // Add event listeners to all inputs
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('change', saveSettings);
  });
  
  document.getElementById('sizeSlider').addEventListener('change', saveSettings);
  document.getElementById('speedSlider').addEventListener('change', saveSettings);
});

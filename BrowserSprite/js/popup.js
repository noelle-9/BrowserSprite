
// Popup script for Browser Sprite settings
document.addEventListener('DOMContentLoaded', function () {
  chrome.storage.local.get({
    petType: 'cat',
    size: 100,
    speed: 100,
    behavior: 'random',
    enabled: true,
  }, function (settings) {
    // Set pet type
    const petTypeInput = document.querySelector(`input[name="petType"][value="${settings.petType}"]`);
    if (petTypeInput) petTypeInput.checked = true;

    // Set size slider
    const sizeSlider = document.getElementById('sizeSlider');
    const sizeValue = document.getElementById('sizeValue');
    if (sizeSlider && sizeValue) {
      sizeSlider.value = settings.size;
      sizeValue.textContent = `${settings.size}%`;
    }

    // Set speed slider
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    if (speedSlider && speedValue) {
      speedSlider.value = settings.speed;
      speedValue.textContent = `${settings.speed}%`;
    }

    // Set behavior radio buttons
    const behaviorRadio = document.querySelector(`input[name="behavior"][value="${settings.behavior}"]`);
    if (behaviorRadio) behaviorRadio.checked = true;

    // Set enabled toggle
    const enableSprite = document.getElementById('enableSprite');
    if (enableSprite) enableSprite.checked = settings.enabled;
  });

  // Add event listeners to all inputs
  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('change', saveSettings);
  });

  // Update size value display
  const sizeSlider = document.getElementById('sizeSlider');
  const sizeValue = document.getElementById('sizeValue');
  if (sizeSlider && sizeValue) {
    sizeSlider.addEventListener('input', function () {
      sizeValue.textContent = `${this.value}%`;
      saveSettings();
    });
  }

  // Update speed value display
  const speedSlider = document.getElementById('speedSlider');
  const speedValue = document.getElementById('speedValue');
  if (speedSlider && speedValue) {
    speedSlider.addEventListener('input', function () {
      speedValue.textContent = `${this.value}%`;
      saveSettings();
    });
  }
});

// Save settings to Chrome storage
function saveSettings() {
  const petType = document.querySelector('input[name="petType"]:checked').value;
  const size = parseInt(document.getElementById('sizeSlider').value);
  const speed = parseInt(document.getElementById('speedSlider').value);
  const enabled = document.getElementById('enableSprite').checked;
  const behavior = document.querySelector('input[name="behavior"]:checked').value;

  chrome.storage.local.set({
    petType: petType,
    size: size,
    speed: speed,
    behavior: behavior,
    enabled: enabled,
  });
}

document.getElementById('sizeSlider').addEventListener('input', function () {
  document.getElementById('sizeValue').textContent = `${this.value}%`;
  saveSettings(); 
});

document.getElementById('speedSlider').addEventListener('input', function () {
  document.getElementById('speedValue').textContent = `${this.value}%`;
  saveSettings(); 
});

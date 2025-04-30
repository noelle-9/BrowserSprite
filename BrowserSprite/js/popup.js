
// Popup script for Browser Sprite settings
document.addEventListener('DOMContentLoaded', function () {
  chrome.storage.local.get({
    petType: 'cat',
    size: 100,
    speed: 100,
    behavior: 'random', // Default to 'random'
    enabled: true,
  }, function (settings) {

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

    // Set behavior radio buttons
    const behaviorRadio = document.querySelector(`input[name="behavior"][value="${settings.behavior}"]`);
    if (behaviorRadio) {
      behaviorRadio.checked = true;
    } else {
      console.warn(`No radio button found for behavior: ${settings.behavior}`);
    }

    // Set enabled toggle
    document.getElementById('enableSprite').checked = settings.enabled;

    // Add event listeners for behavior radio buttons
    document.querySelectorAll('input[name="behavior"]').forEach((radio) => {
      radio.addEventListener('change', (e) => {
        if (e.target.checked) {
          saveSettings(); // Save the updated behavior
        }
      });
    });
  });
  // Add event listeners to all inputs
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('change', saveSettings);
  });

  // Update size value display
  document.getElementById('sizeSlider').addEventListener('input', function () {
    document.getElementById('sizeValue').textContent = `${this.value}%`;
  });

  // Update speed value display
  document.getElementById('speedSlider').addEventListener('input', function () {
    document.getElementById('speedValue').textContent = `${this.value}%`;
  });
});

function saveSettings() {
  const petType = document.querySelector('input[name="petType"]:checked').value;
  const size = parseInt(document.getElementById('sizeSlider').value);
  const speed = parseInt(document.getElementById('speedSlider').value);
  const enabled = document.getElementById('enableSprite').checked;

  // Determine the selected behavior
  const behavior = document.querySelector('input[name="behavior"]:checked').value; // 'follow', 'moveAway', or 'random'

  // Save the updated settings to storage
  chrome.storage.local.set({
    petType: petType,
    size: size,
    speed: speed,
    behavior: behavior, 
    enabled: enabled,
  });
}

  // Add event listeners to all inputs
document.addEventListener('DOMContentLoaded', function () {
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('change', saveSettings);
  });
});

// Update size value display
document.getElementById('sizeSlider').addEventListener('input', function() {
  document.getElementById('sizeValue').textContent = `${this.value}%`;
});

// Update speed value display
document.getElementById('speedSlider').addEventListener('input', function() {
  document.getElementById('speedValue').textContent = `${this.value}%`;
});

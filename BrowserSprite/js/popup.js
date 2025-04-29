
// Popup script for Browser Sprite settings
document.addEventListener('DOMContentLoaded', function () {
  chrome.storage.local.get({
    petType: 'cat',
    size: 100,
    speed: 100,
    followCursor: false,
    moveAwayFromCursor: false,
    randomMovement: true,
    enabled: true
  }, function (settings) {
    console.log("Loaded settings on popup load:", settings); // Debug log

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
    if (settings.randomMovement && !settings.moveAwayFromCursor && !settings.followCursor) {
      document.getElementById('randomMovementRadio').checked = true;
    } else if (settings.moveAwayFromCursor) {
      document.getElementById('moveAwayRadio').checked = true;
    } else if (settings.followCursor) {
      document.getElementById('followCursorRadio').checked = true;
    }

    // Set enabled toggle
    document.getElementById('enableSprite').checked = settings.enabled;

    // Add event listeners for behavior radio buttons
    document.getElementById('randomMovementRadio').addEventListener('change', (e) => {
      if (e.target.checked) {
        settings.randomMovement = true;
        settings.moveAwayFromCursor = false;
        settings.followCursor = false;

        console.log("Random movement enabled."); // Debug log

        // Save the updated settings to storage
        chrome.storage.local.set(settings);
      }
    });

    document.getElementById('moveAwayRadio').addEventListener('change', (e) => {
      if (e.target.checked) {
        settings.randomMovement = true; // Keep random movement active
        settings.moveAwayFromCursor = true;
        settings.followCursor = false;

        console.log("Move away from cursor enabled with random movement."); // Debug log

        // Save the updated settings to storage
        chrome.storage.local.set(settings);
      }
    });

    document.getElementById('followCursorRadio').addEventListener('change', (e) => {
      if (e.target.checked) {
        settings.randomMovement = false;
        settings.moveAwayFromCursor = false;
        settings.followCursor = true;

        console.log("Follow cursor enabled."); // Debug log

        // Save the updated settings to storage
        chrome.storage.local.set(settings);
      }
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
  const behavior = document.querySelector('input[name="behavior"]:checked').value; // Get selected behavior
  const enabled = document.getElementById('enableSprite').checked;

  // Determine cursor behavior based on selected radio button
  const followCursor = behavior === 'follow';
  const moveAwayFromCursor = behavior === 'moveAway';
  const randomMovement = behavior === 'random' || behavior === 'moveAway'; // Ensure randomMovement is true for "Avoid Cursor"

  // Save the updated settings to storage
  chrome.storage.local.set({
    petType: petType,
    size: size,
    speed: speed,
    followCursor: followCursor,
    moveAwayFromCursor: moveAwayFromCursor,
    randomMovement: randomMovement,
    enabled: enabled,
  });

  console.log("Settings saved:", {
    petType,
    size,
    speed,
    followCursor,
    moveAwayFromCursor,
    randomMovement,
    enabled,
  }); // Debug log
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

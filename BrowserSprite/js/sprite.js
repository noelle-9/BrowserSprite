// Browser Sprite main content script
(function () {
  // Configuration and state variables
  let settings = {
    petType: 'cat',
    size: 100,
    speed: 100,
    followCursor: true,
    moveAwayFromCursor: false,
    randomMovement: true,
    enabled: true,
  };

  let sprite = null;
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };
  let lastCursorPosition = { x: 0, y: 0 };
  let currentAction = 'idle';
  let idleTimer = null;
  let movementTimer = null;

  // Initialize the sprite
  function initSprite() {
    // Load settings
    chrome.storage.local.get(settings, function (items) {
      settings = items;

      if (settings.enabled) {
        createSprite();
        setupEventListeners();
        startIdleTimer();
        if (settings.randomMovement) {
          startRandomMovement();
        }
      }
    });
  }

  // Listen for settings changes
  chrome.storage.onChanged.addListener(function (changes) {
    for (let key in changes) {
      settings[key] = changes[key].newValue;
    }

    console.log("Settings updated:", settings); // Debug log

    if (sprite) {
      // Update sprite appearance and behavior dynamically
      updateSpriteAppearance();

      if (!settings.enabled) {
        console.log("Removing sprite because settings.enabled is false."); // Debug log
        removeSprite();
      } else if (settings.enabled && !sprite) {
        console.log("Creating sprite because settings.enabled is true."); // Debug log
        createSprite();
        setupEventListeners();
      }

      // Handle random movement
      if (settings.randomMovement && !movementTimer) {
        startRandomMovement();
      } else if (!settings.randomMovement && movementTimer) {
        clearInterval(movementTimer);
        movementTimer = null;
      }

      // Handle cursor behavior
      if (settings.followCursor || settings.moveAwayFromCursor) {
        // React to cursor dynamically
        reactToCursor();
      }
    }
  });

  // Create the sprite element
  function createSprite() {
    if (sprite) return;

    sprite = document.createElement('div');
    sprite.className = 'browser-sprite draggable ' + settings.petType;
    sprite.style.left = Math.random() * (window.innerWidth - 100) + 'px';
    sprite.style.top = Math.random() * (window.innerHeight - 100) + 'px';
    updateSpriteAppearance();
    document.body.appendChild(sprite);
  }

  // Update sprite appearance based on settings
  function updateSpriteAppearance() {
    if (!sprite) return;

    // Replace the current pet type class with the new one
    sprite.className = sprite.className.replace(/pinkSlime|greenSlime/, settings.petType);
    console.log("Updated sprite class:", sprite.className); // Debug log

    // Update sprite size
    sprite.style.transform = `scale(${settings.size / 100})`;
  }

  // Remove the sprite
  function removeSprite() {
    if (sprite) {
      console.log("Removing sprite element from DOM."); // Debug log
      document.body.removeChild(sprite);
      sprite = null;
    }

    if (idleTimer) {
      console.log("Clearing idle timer."); // Debug log
      clearTimeout(idleTimer);
      idleTimer = null;
    }

    if (movementTimer) {
      console.log("Clearing movement timer."); // Debug log
      clearInterval(movementTimer);
      movementTimer = null;
    }
  }

  function setupEventListeners() {
    if (!sprite) {
      console.warn("Sprite is null, cannot set up event listeners.");
      return;
    }

    // Track cursor position
    document.addEventListener('mousemove', handleMouseMove);

    // Handle sprite dragging
    sprite.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    // Handle sprite clicking for animations
    sprite.addEventListener('click', handleSpriteClick);
  }

  // Handle mouse movement
  function handleMouseMove(e) {
    lastCursorPosition = { x: e.clientX, y: e.clientY };

    if (isDragging) {
      const left = e.clientX - dragOffset.x;
      const top = e.clientY - dragOffset.y;

      sprite.style.left = left + 'px';
      sprite.style.top = top + 'px';
    } else {
      // Always call reactToCursor to follow the cursor
      reactToCursor();
    }
  }

  // Handle mouse down on sprite (start dragging)
  function handleMouseDown(e) {
    e.preventDefault();
  
    isDragging = true;
    sprite.classList.add('dragging');
  
    const rect = sprite.getBoundingClientRect();
    dragOffset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  
    // Stop random movement while dragging
    if (movementTimer) {
      clearInterval(movementTimer);
      movementTimer = null;
    }
  
    // Stop any current animations
    setAction('idle');
  }
  
  function handleMouseMove(e) {
    lastCursorPosition = { x: e.clientX, y: e.clientY };
  
    if (isDragging) {
      const left = e.clientX - dragOffset.x;
      const top = e.clientY - dragOffset.y;
  
      sprite.style.left = left + 'px';
      sprite.style.top = top + 'px';
    } else {
      // Always call reactToCursor to follow the cursor
      reactToCursor();
    }
  }

function handleMouseUp() {
  if (isDragging) {
    isDragging = false;
    sprite.classList.remove('dragging');

    // Resume random movement after a short delay
    if (settings.randomMovement) {
      setTimeout(() => {
        if (!isDragging) { // Ensure dragging hasn't restarted
          startRandomMovement();
        }
      }, 500); // 500ms delay before restarting random movement
    }

    startIdleTimer();
  }
}

  // Handle clicking on the sprite
  function handleSpriteClick(e) {
    e.stopPropagation();
      setAction('dead', 2000);
  }

  // React to cursor position
  function reactToCursor() {
    if (!sprite) {
      console.warn("Sprite is null, skipping reactToCursor.");
      return;
    }
  
    const rect = sprite.getBoundingClientRect();
    const spriteCenter = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  
    const distance = Math.sqrt(
      Math.pow(lastCursorPosition.x - spriteCenter.x, 2) +
      Math.pow(lastCursorPosition.y - spriteCenter.y, 2)
    );
  
    const moveSpeed = 0.1 * (settings.speed / 100); // Adjust speed multiplier
  
    if (settings.moveAwayFromCursor) {
      // If the cursor is far, trigger random movement
      if (distance > 200) { // Cursor is far
        if (!movementTimer) {
          startRandomMovement();
        }
      } else if (distance < 100) { // Cursor is close
        clearInterval(movementTimer); // Stop random movement
        movementTimer = null;
        moveAwayFromCursor(spriteCenter, moveSpeed);
      }
    } else if (settings.followCursor) {
      // Follow the cursor if the setting is enabled
      if (distance > 50) { // Adjusted threshold for following
        moveTowardsCursor(spriteCenter, moveSpeed);
      }
    }
  
    // Continuously call reactToCursor for smooth movement
    requestAnimationFrame(reactToCursor);
  }

  // Move sprite away from cursor
  function moveAwayFromCursor(spriteCenter, speed) {
    const angle = Math.atan2(
      spriteCenter.y - lastCursorPosition.y, // Reverse direction (away from cursor)
      spriteCenter.x - lastCursorPosition.x
    );
  
    const distance = Math.random() * 50 + 25; // Randomize the distance like random movement
  
    const newLeft = Math.max(
      0,
      Math.min(window.innerWidth - 64, spriteCenter.x + Math.cos(angle) * distance)
    );
    const newTop = Math.max(
      0,
      Math.min(window.innerHeight - 64, spriteCenter.y + Math.sin(angle) * distance)
    );
  
    moveSprite(newLeft, newTop);
  }

  // Move sprite towards cursor
  function moveTowardsCursor(spriteCenter, speed) {
    const angle = Math.atan2(
      lastCursorPosition.y - spriteCenter.y, // Direction toward the cursor
      lastCursorPosition.x - spriteCenter.x
    );
  
    const distance = Math.random() * 50 + 25; // Randomize the distance like random movement
  
    const newLeft = Math.max(
      0,
      Math.min(window.innerWidth - 64, spriteCenter.x + Math.cos(angle) * distance)
    );
    const newTop = Math.max(
      0,
      Math.min(window.innerHeight - 64, spriteCenter.y + Math.sin(angle) * distance)
    );
  
    moveSprite(newLeft, newTop);
  }

  // Move sprite to new position
  function moveSprite(targetLeft, targetTop) {
    // Keep sprite within window bounds
    targetLeft = Math.max(0, Math.min(window.innerWidth - 64, targetLeft));
    targetTop = Math.max(0, Math.min(window.innerHeight - 64, targetTop));
  
    function animate() {
      const currentLeft = parseFloat(sprite.style.left) || 0;
      const currentTop = parseFloat(sprite.style.top) || 0;
  
      const deltaX = targetLeft - currentLeft;
      const deltaY = targetTop - currentTop;
  
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
      // Define the animation speed (pixels per frame)
      const animationSpeed = 5;
  
      if (distance < animationSpeed) {
        // If close enough to the target, snap to the target position
        sprite.style.left = targetLeft + 'px';
        sprite.style.top = targetTop + 'px';
      } else {
        // Move a step closer to the target
        const angle = Math.atan2(deltaY, deltaX);
        const stepX = Math.cos(angle) * animationSpeed;
        const stepY = Math.sin(angle) * animationSpeed;
  
        sprite.style.left = currentLeft + stepX + 'px';
        sprite.style.top = currentTop + stepY + 'px';
  
        // Request the next animation frame
        requestAnimationFrame(animate);
      }
    }
  
    // Start the animation
    animate();
  }

  // Start random movement
  function startRandomMovement() {
    if (movementTimer) {
      clearInterval(movementTimer);
    }
  
    console.log("Starting random movement..."); // Debug log
  
    movementTimer = setInterval(() => {
      if (isDragging || !settings.randomMovement) return; // Skip random movement if dragging
  
      // Only move randomly if not already performing an action
      if (currentAction === 'idle' || currentAction === 'bouncing') {
        const rect = sprite.getBoundingClientRect();
        const spriteCenter = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
  
        // Random direction
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 150 + 50;
  
        const newLeft = Math.max(
          0,
          Math.min(window.innerWidth - 64, spriteCenter.x + Math.cos(angle) * distance)
        );
        const newTop = Math.max(
          0,
          Math.min(window.innerHeight - 64, spriteCenter.y + Math.sin(angle) * distance)
        );
  
        moveSprite(newLeft, newTop);
      }
    }, 4000); // Move every 2 seconds
  }
  // Start idle timer
  function startIdleTimer() {
    if (idleTimer) {
      clearTimeout(idleTimer);
    }

    idleTimer = setTimeout(() => {
      if (!isDragging) {
        // Always default to bouncing
        setAction('bouncing');
      }
    }, 2000); // Go idle after 2 seconds of inactivity
  }

  // Set sprite action/animation
  function setAction(action, duration = 0) {
    if (!sprite) return;

    // Remove all action classes
    sprite.classList.remove(
      'walking-right',
      'walking-left',
      'sitting',
      'dancing',
      'dead',
      'bouncing'
    );

    // Add new action class
    if (action !== 'idle') {
      sprite.classList.add(action);
    } else {
      sprite.classList.add('bouncing'); // Default to bouncing when idle
    }

    currentAction = action;

    // Reset to bouncing after duration if specified
    if (duration > 0) {
      setTimeout(() => {
        setAction('bouncing');
        startIdleTimer();
      }, duration);
    }
  }

  // Initialize when DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSprite);
  } else {
    initSprite();
  }
})();
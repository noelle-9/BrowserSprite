// Browser Sprite main content script
(function () {
  // Configuration and state variables
  let settings = {
    petType: 'cat',
    size: 100,
    speed: 100,
    followCursor: false,
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
  let movementInProgress = false;
  let lastReactTime = 0;

  // Initialize the sprite
  function initSprite() {
    chrome.storage.local.get(settings, function (items) {
      // Merge default settings with retrieved settings
      settings = { ...settings, ...items };
      console.log("randomMovement set to:", settings.randomMovement); // Debug log
  
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
  
      // Log specific changes for debugging
      console.log(`${key} updated to:`, settings[key]);
  
      // Handle specific settings updates
      if (key === 'randomMovement') {
        console.log("randomMovement updated to:", settings.randomMovement); // Debug log
  
        // Start or stop random movement based on the updated value
        if (settings.randomMovement) {
          if (!movementTimer) {
            startRandomMovement();
          }
        } else {
          if (movementTimer) {
            clearInterval(movementTimer);
            movementTimer = null;
            console.log("Random movement stopped."); // Debug log
          }
        }
      }
  
      if (key === 'moveAwayFromCursor' || key === 'followCursor') {
        console.log("Cursor behavior updated. Reacting to cursor."); // Debug log
  
        // Stop random movement if cursor interaction is enabled
        if (movementTimer) {
          clearInterval(movementTimer);
          movementTimer = null;
          console.log("Random movement stopped due to cursor interaction."); // Debug log
        }
  
        reactToCursor(); // Ensure the sprite reacts to the cursor
      }
  
      if (key === 'petType') {
        console.log("Pet type updated to:", settings.petType); // Debug log
        updateSpriteAppearance(); // Update sprite appearance dynamically
      }
  
      if (key === 'enabled') {
        console.log("Sprite enabled state updated to:", settings.enabled); // Debug log
        if (!settings.enabled) {
          removeSprite();
        } else if (settings.enabled && !sprite) {
          createSprite();
          setupEventListeners();
        }
      }
    }
  
    console.log("Settings updated via storage change:", settings); // Debug log
  
    // Handle sprite updates dynamically
    if (sprite) {
      updateSpriteAppearance();
  
      // React to cursor behavior changes
      if (settings.followCursor || settings.moveAwayFromCursor) {
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
    sprite.className = sprite.className.replace(/pinkSlime|greenSlime|purpleSlime/, settings.petType);
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
    const now = performance.now();
    if (now - lastReactTime < 100) { // Throttle to 100ms
      requestAnimationFrame(reactToCursor);
      return;
    }
    lastReactTime = now;
  
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
      if (distance < 100 && !movementInProgress) { // Cursor is close and sprite is idle
        moveAwayFromCursor(spriteCenter, moveSpeed);
      } else if (distance > 200 && !movementTimer) { // Cursor is far and random movement is not running
        console.log("Cursor is far, starting random movement."); // Debug log
        startRandomMovement();
      }
    } else if (settings.followCursor) {
      if (distance > 50 && !movementInProgress) { // Cursor is far and sprite is idle
        moveTowardsCursor(spriteCenter, moveSpeed);
      }
    } else {
      // If neither followCursor nor moveAwayFromCursor is enabled, start random movement
      if (!movementTimer) {
        console.log("No cursor interaction, starting random movement."); // Debug log
        startRandomMovement();
      }
    }
  
    // Continuously call reactToCursor for smooth movement
    requestAnimationFrame(reactToCursor);
  }

  // Move sprite away from cursor
  function moveAwayFromCursor(spriteCenter, speed) {
    if (movementInProgress) {
      console.log("Movement in progress, skipping moveAwayFromCursor."); // Debug log
      return;
    }
  
    movementInProgress = true;
  
    const angle = Math.atan2(
      spriteCenter.y - lastCursorPosition.y, // Reverse direction (away from cursor)
      spriteCenter.x - lastCursorPosition.x
    );
  
    const distance = Math.random() * 150 + 50; // Randomize the distance like random movement
  
    const newLeft = Math.max(
      0,
      Math.min(window.innerWidth - 64, spriteCenter.x + Math.cos(angle) * distance)
    );
    const newTop = Math.max(
      0,
      Math.min(window.innerHeight - 64, spriteCenter.y + Math.sin(angle) * distance)
    );
  
    console.log("Moving away from cursor to:", { newLeft, newTop }); // Debug log
    moveSprite(newLeft, newTop, () => {
      movementInProgress = false; // Reset the flag after movement completes
    });
  }

  // Move sprite towards cursor
  function moveTowardsCursor(spriteCenter, speed) {
    if (movementInProgress) return;
  
    movementInProgress = true;
  
    const angle = Math.atan2(
      lastCursorPosition.y - spriteCenter.y, // Direction toward the cursor
      lastCursorPosition.x - spriteCenter.x
    );
  
    const distance = Math.random() * 150 + 50; // Randomize the distance like random movement
  
    const newLeft = Math.max(
      0,
      Math.min(window.innerWidth - 64, spriteCenter.x + Math.cos(angle) * distance)
    );
    const newTop = Math.max(
      0,
      Math.min(window.innerHeight - 64, spriteCenter.y + Math.sin(angle) * distance)
    );
  
    moveSprite(newLeft, newTop, () => {
      movementInProgress = false; // Reset the flag after movement completes
    });
  }

  // Move sprite to new position
  function moveSprite(targetLeft, targetTop, callback) {
    console.log("moveSprite called with:", { targetLeft, targetTop }); // Debug log
  
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
  
        movementInProgress = false; // Reset the flag
        if (callback) callback(); // Execute the callback after movement completes
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
    console.log("randomMovement set to:", settings.randomMovement); // Debug log

    if (movementTimer) {
      clearInterval(movementTimer);
    }
  
    console.log("Starting random movement..."); // Debug log
  
    movementTimer = setInterval(() => {
      console.log("Random movement check:", {
        isDragging,
        randomMovement: settings.randomMovement,
      }); // Debug log
  
      if (isDragging || !settings.randomMovement) {
        console.log("Skipping random movement because sprite is being dragged or random movement is disabled."); // Debug log
        return; // Skip random movement if dragging or disabled
      }
  
      // Only move randomly if not already performing an action
      if (!movementInProgress && (currentAction === 'idle' || currentAction === 'bouncing')) {
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
  
        console.log("Random movement to:", { newLeft, newTop }); // Debug log
        movementInProgress = true; // Set the flag to prevent overlapping movements
        moveSprite(newLeft, newTop, () => {
          console.log("Random movement completed."); // Debug log
          movementInProgress = false; // Reset the flag after movement completes
        });
      } else {
        console.log("Skipping random movement because movement is already in progress or sprite is not idle."); // Debug log
      }
    }, 4000); // Move every 4 seconds
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
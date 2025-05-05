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

      // Handle behavior changes
      if (key === 'behavior') {

        // Update flags based on the behavior property
        settings.followCursor = settings.behavior === 'follow';
        settings.moveAwayFromCursor = settings.behavior === 'moveAway';
        settings.randomMovement = settings.behavior === 'random' || settings.behavior === 'moveAway'; // Random movement is true for "Freedom" and "Move Away"

        // React to cursor if necessary
        if (settings.followCursor || settings.moveAwayFromCursor) {
          reactToCursor();
        }
      }

      // Handle specific settings updates
      if (key === 'randomMovement') {

        // Start or stop random movement based on the updated value
        if (settings.randomMovement) {
          if (!movementTimer) {
            startRandomMovement();
          }
        } else {
          if (movementTimer) {
            clearInterval(movementTimer);
            movementTimer = null;
          }
        }
      }

      if (key === 'moveAwayFromCursor' || key === 'followCursor') {

        // Stop random movement if cursor interaction is enabled
        if (movementTimer) {
          clearInterval(movementTimer);
          movementTimer = null;
        }

        reactToCursor(); // Ensure the sprite reacts to the cursor
      }

      if (key === 'petType') {
        updateSpriteAppearance(); // Update sprite appearance dynamically
      }

      if (key === 'enabled') {
        if (!settings.enabled) {
          removeSprite();
        } else if (settings.enabled && !sprite) {
          createSprite();
          setupEventListeners();
        }
      }
    }

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
    if (!sprite) return; // Ensure the function exits if the sprite is null or undefined
  <<<<<<< Updated upstream

    // Extract the current sprite type (e.g., pinkSlime, greenSlime, purpleSlime)
    const currentSpriteType = sprite.className.match(/pinkSlime|greenSlime|purpleSlime/);
  
    // Replace the current sprite type class with the new one
    if (currentSpriteType) {
      sprite.classList.remove(currentSpriteType[0]);
    }
    sprite.classList.add(settings.petType);
  
    // Update the background image to match the new sprite type
    sprite.style.backgroundImage = `url('chrome-extension://bjcbjpednhcnihdkkhclihieoledinmj/images/${settings.petType}.gif')`;
  
=======
  
    // Dynamically set the background image based on the pet type
    const spriteUrl = chrome.runtime.getURL(`images/${settings.petType}.gif`);
    sprite.style.backgroundImage = `url('${spriteUrl}')`;
  
>>>>>>> Stashed changes
    // Update sprite size
    sprite.style.transform = `scale(${settings.size / 100})`;
  }

  // Remove the sprite
  function removeSprite() {
    if (sprite) {
      document.body.removeChild(sprite);
      sprite = null;
    }

    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }

    if (movementTimer) {
      clearInterval(movementTimer);
      movementTimer = null;
    }
  }

  function setupEventListeners() {
    if (!sprite) {
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
    if (!settings.enabled || !sprite) {
      return; // Exit if the sprite is toggled off or not initialized
    }

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
  // function handleSpriteClick(e) {
  //   e.stopPropagation();
  //   setAction('dead', 2000);
  // }

  function handleSpriteClick(e) {
    e.stopPropagation();
  
    // Define possible actions
    const actions = ['dead', 'dance'];
  
    // Randomly select an action
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
  
    // Set the randomly selected action with a duration of 2 seconds
    setAction(randomAction, 1800);
  }

  // React to cursor position
  function reactToCursor() {
    if (!settings.enabled || !sprite) {
      return; // Exit if the sprite is toggled off or not initialized
    }
    const now = performance.now();
    if (now - lastReactTime < 100) { // Throttle to 100ms
      requestAnimationFrame(reactToCursor);
      return;
    }
    lastReactTime = now;

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
        startRandomMovement();
      }
    } else if (settings.followCursor) {
      if (distance > 50 && !movementInProgress) { // Cursor is far and sprite is idle
        moveTowardsCursor(spriteCenter, moveSpeed);
      }
    } else {
      // If neither followCursor nor moveAwayFromCursor is enabled, start random movement
      if (!movementTimer) {
        startRandomMovement();
      }
    }

    // Continuously call reactToCursor
    requestAnimationFrame(reactToCursor);
  }

  // Move sprite away from cursor
  function moveAwayFromCursor(spriteCenter, speed) {
    if (movementInProgress || currentAction === 'dead' || currentAction === 'dance') {
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

    moveSprite(newLeft, newTop, () => {
      movementInProgress = false; // Reset the flag after movement completes
    });
  }

  // Move sprite towards cursor
  function moveTowardsCursor(spriteCenter, speed) {
    if (movementInProgress || currentAction === 'dead' || currentAction === 'dance') {
      return; 
    }

    movementInProgress = true;

    const angle = Math.atan2(
      lastCursorPosition.y - spriteCenter.y, // Direction toward the cursor
      lastCursorPosition.x - spriteCenter.x
    );

    const distance = Math.random() * 150 + 50; 

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
      const animationSpeed = 10;

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
    if (!settings.enabled || !sprite) {
      return; // Exit if the sprite is toggled off or not initialized
    }

    if (movementTimer) {
      clearInterval(movementTimer);
    }

    movementTimer = setInterval(() => {
<<<<<<< Updated upstream

      if (
        isDragging || 
        !settings.randomMovement || 
        currentAction === 'dead' || 
        currentAction === 'dance'
      ) {
        return;
=======
      if (
        isDragging || 
        !settings.randomMovement || 
        currentAction === 'dead' || 
        currentAction === 'dance'
      ) {
        return;
>>>>>>> Stashed changes
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

        movementInProgress = true; // Set the flag to prevent overlapping movements
        moveSprite(newLeft, newTop, () => {
          movementInProgress = false; // Reset the flag after movement completes
        });
      } else {
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
<<<<<<< Updated upstream
    if (!sprite) return;
  
    // Extract the base sprite type (e.g., pinkSlime, greenSlime, purpleSlime)
    const spriteType = sprite.className.match(/pinkSlime|greenSlime|purpleSlime/);
    if (!spriteType) return; // Exit if no sprite type is found
  
    // Remove all action classes while preserving the base sprite type
    sprite.className = `browser-sprite draggable ${spriteType[0]}`;
  
    // Add the new action class
    if (action !== 'idle') {
      sprite.classList.add(action);
  
      // Handle the "dead" action specifically
      if (action === 'dead') {
        sprite.style.backgroundImage = `url('chrome-extension://bjcbjpednhcnihdkkhclihieoledinmj/images/${spriteType[0]}Dead.gif')`;
      }
    } else {
      sprite.classList.add('bouncing'); // Default to bouncing when idle
=======
    if (!settings.enabled || !sprite) {
      return; // Exit if the sprite is toggled off or not initialized
    }
  
    // Dynamically set the background image for specific actions
    if (action === 'dead') {
      const spriteUrl = chrome.runtime.getURL(`images/${settings.petType}Dead.gif`);
      sprite.style.backgroundImage = `url('${spriteUrl}')`;
    } else if (action === 'dance') {
      const spriteUrl = chrome.runtime.getURL(`images/${settings.petType}.gif`);
      sprite.style.backgroundImage = `url('${spriteUrl}')`;
      sprite.classList.add('dance'); // Add the "dance" class for animation
    } else if (action === 'idle') {
      const spriteUrl = chrome.runtime.getURL(`images/${settings.petType}.gif`);
      sprite.style.backgroundImage = `url('${spriteUrl}')`;
>>>>>>> Stashed changes
    }
  
    currentAction = action;
  
    // Reset to the regular .gif after the duration if specified
    if (duration > 0) {
      setTimeout(() => {
<<<<<<< Updated upstream
        setAction('bouncing');
=======
        if (action === 'dead' || action === 'dance') {
          const spriteUrl = chrome.runtime.getURL(`images/${settings.petType}.gif`);
          sprite.style.backgroundImage = `url('${spriteUrl}')`;
          sprite.classList.remove('dance'); // Remove the "dance" class after the duration
        }
        setAction('bouncing'); // Reset to bouncing after the action
>>>>>>> Stashed changes
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

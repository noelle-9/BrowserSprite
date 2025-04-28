console.log("Sprite script loaded!");
// Browser Sprite main content script
(function() {
  // Configuration and state variables
  let settings = {
    petType: 'cat',
    size: 100,
    speed: 100,
    followCursor: true,
    randomMovement: true,
    enabled: true
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
    chrome.storage.local.get(settings, function(items) {
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
    
    // Listen for settings changes
    chrome.storage.onChanged.addListener(function(changes) {
      for (let key in changes) {
        settings[key] = changes[key].newValue;
      }
      
      if (sprite) {
        updateSpriteAppearance();
        
        if (!settings.enabled) {
          removeSprite();
        } else if (settings.enabled && !sprite) {
          createSprite();
          setupEventListeners();
        }
        
        if (settings.randomMovement && !movementTimer) {
          startRandomMovement();
        } else if (!settings.randomMovement && movementTimer) {
          clearInterval(movementTimer);
          movementTimer = null;
        }
      }
    });
  }
  
  // Create the sprite element
  function createSprite() {
    if (sprite) return;
  
    sprite = document.createElement('div');
    sprite.className = 'browser-sprite draggable ' + settings.petType;
    sprite.style.left = Math.random() * (window.innerWidth - 100) + 'px';
    sprite.style.top = Math.random() * (window.innerHeight - 100) + 'px';
    updateSpriteAppearance();
    document.body.appendChild(sprite);
  
    console.log("Sprite created:", sprite);
  }
  
  // Update sprite appearance based on settings
  function updateSpriteAppearance() {
    if (!sprite) return;
    
    sprite.className = sprite.className.replace(/cat|dog|slime/, settings.petType);
    sprite.style.transform = `scale(${settings.size / 100})`;
  }
  
  // Remove the sprite
  function removeSprite() {
    if (sprite) {
      console.log("Removing sprite.");
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
  
    console.log("Event listeners set up for sprite.");
  }
  
  // Handle mouse movement
  function handleMouseMove(e) {
    lastCursorPosition = { x: e.clientX, y: e.clientY };
    
    if (isDragging) {
      const left = e.clientX - dragOffset.x;
      const top = e.clientY - dragOffset.y;
      
      console.log("Dragging sprite to:", left, top);
      sprite.style.left = left + 'px';
      sprite.style.top = top + 'px';
    } else if (settings.followCursor && currentAction === 'idle') {
      console.log("Calling reactToCursor...");
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
      y: e.clientY - rect.top
    };
    
    // Stop any current animations
    setAction('idle');
  }
  
  // Handle mouse up (stop dragging)
  function handleMouseUp() {
    if (isDragging) {
      isDragging = false;
      sprite.classList.remove('dragging');
      startIdleTimer();
    }
  }
  
  // Handle clicking on the sprite
  function handleSpriteClick(e) {
    e.stopPropagation();
    
    // Randomly choose between dancing and playing dead
    if (Math.random() > 0.5) {
      setAction('dancing', 3000);
    } else {
      setAction('dead', 2000);
    }
  }
  
  // React to cursor position
  function reactToCursor() {
    if (!sprite) {
      console.warn("Sprite is null, skipping reactToCursor.");
      return;
    }
    if (isDragging || currentAction !== 'idle') return;
  
    console.log("Reacting to cursor...");
    const rect = sprite.getBoundingClientRect();
    console.log("Sprite rect:", rect);
    const spriteCenter = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
    
    const distance = Math.sqrt(
      Math.pow(lastCursorPosition.x - spriteCenter.x, 2) +
      Math.pow(lastCursorPosition.y - spriteCenter.y, 2)
    );

    console.log("Cursor distance from sprite:", distance);
    
    // Only react if cursor is within reaction distance
    if (distance < 200) {
      const moveSpeed = 0.05 * (settings.speed / 100);
      
      if (distance < 50) {
        console.log("Cursor too close, sprite running away.");
        moveAwayFromCursor(spriteCenter, moveSpeed);
      } else if (distance < 150) {
        console.log("Cursor close enough, sprite chasing.");
        moveTowardsCursor(spriteCenter, moveSpeed);
      }
    }
  }
  
  // Move sprite away from cursor
  function moveAwayFromCursor(spriteCenter, speed) {
    const angle = Math.atan2(
      lastCursorPosition.y - spriteCenter.y,
      lastCursorPosition.x - spriteCenter.x
    );
    
    const newLeft = parseFloat(sprite.style.left) - Math.cos(angle) * speed * 5;
    const newTop = parseFloat(sprite.style.top) - Math.sin(angle) * speed * 5;
    
    moveSprite(newLeft, newTop, lastCursorPosition.x < spriteCenter.x);
  }
  
  // Move sprite towards cursor
  function moveTowardsCursor(spriteCenter, speed) {
    const angle = Math.atan2(
      lastCursorPosition.y - spriteCenter.y,
      lastCursorPosition.x - spriteCenter.x
    );
    
    const newLeft = parseFloat(sprite.style.left) + Math.cos(angle) * speed * 3;
    const newTop = parseFloat(sprite.style.top) + Math.sin(angle) * speed * 3;
    
    moveSprite(newLeft, newTop, lastCursorPosition.x > spriteCenter.x);
  }
  
  // Move sprite to new position
  function moveSprite(left, top) {
    // Keep sprite within window bounds
    left = Math.max(0, Math.min(window.innerWidth - 64, left));
    top = Math.max(0, Math.min(window.innerHeight - 64, top));
    
    sprite.style.left = left + 'px';
    sprite.style.top = top + 'px';
    
    // Set walking animation direction
    if (isMovingRight) {
      setAction('walking-right');
    } else {
      setAction('walking-left');
    }
    
    // Reset idle timer
    startIdleTimer();
  }
  
  // Start random movement
  function startRandomMovement() {
    if (movementTimer) {
      clearInterval(movementTimer);
    }
  
    movementTimer = setInterval(() => {
      if (isDragging || !settings.randomMovement) return;
  
      // Only move randomly if not already performing an action
      if (currentAction === 'idle' || currentAction === 'bouncing') {
        console.log("Moving sprite randomly...");
        const rect = sprite.getBoundingClientRect();
        const spriteCenter = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
  
        // Random direction
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 50 + 25; // Reduced distance (was 100 + 50)
  
        const newLeft = parseFloat(sprite.style.left) + Math.cos(angle) * distance;
        const newTop = parseFloat(sprite.style.top) + Math.sin(angle) * distance;
  
        moveSprite(newLeft, newTop);
      }
    }, 5000); // Move every 5 seconds
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
    sprite.classList.remove('walking-right', 'walking-left', 'sitting', 'dancing', 'dead', 'bouncing');
  
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

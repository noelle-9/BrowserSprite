# Browser Sprite Chrome Extension - Documentation

## Overview
Browser Sprite is a Chrome extension that adds a virtual pet to your browser window. The pet walks across your screen, reacts to your cursor, and can be customized to your preferences. It's lightweight, privacy-focused, and runs entirely locally without any data collection.

## Features
- **Virtual Pet Options**: Choose between a cat, dog, or slime character
- **Interactive Behavior**: The pet reacts to your cursor by chasing or avoiding it
- **Fun Animations**: Click on the pet to trigger special animations like dancing or playing dead
- **Drag-and-Drop**: Reposition your pet anywhere on the screen
- **Customization**: Adjust the pet's size, speed, and behavior through the settings popup
- **Privacy-Focused**: No data collection or external server interactions

## Installation
1. Download the extension files
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the Browser Sprite directory
5. The extension icon should appear in your toolbar

## Usage
- **Access Settings**: Click the Browser Sprite icon in your toolbar to open the settings popup
- **Change Pet Type**: Select between cat, dog, or slime in the settings
- **Adjust Size/Speed**: Use the sliders in the settings to customize your pet
- **Interact with Pet**: Click on your pet to trigger special animations
- **Move Pet**: Drag and drop your pet to reposition it on the screen
- **Enable/Disable**: Toggle the pet on/off using the switch in the settings

## Technical Details
- Built with HTML/CSS/JavaScript
- Uses CSS animations for smooth movement
- Optional GSAP integration for enhanced animations
- Lightweight implementation with minimal performance impact
- No data collection or external server interactions

## Development
The extension is structured as follows:
- `manifest.json`: Extension configuration
- `popup.html/css/js`: Settings interface
- `sprite.css/js`: Core pet functionality
- `images/`: Pet and icon graphics

All code runs locally within the browser with no external dependencies.

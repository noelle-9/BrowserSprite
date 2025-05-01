# Browser Sprite Chrome Extension - Documentation

## Overview
BrowserSprite adds a virtual sprite to your browser window. The sprite interacts with your cursor, performs fun animations, and its behaviour can be customized to suit your preferences. It is lightweight, privacy-focused, and runs entirely locally without any data collection.

## Features
- **Virtual sprite Options**: Choose between a pink, purple, or green sprite
- **Interactive Behavior**: The sprite reacts to your cursor by chasing or run away
- **Fun Animations**: Click on the sprite to trigger special animations like dancing or playing dead
- **Drag-and-Drop**: Reposition your sprite anywhere on the screen
- **Customization**: Adjust the sprite's size, speed, and behavior through the settings popup
- **Privacy-Focused**: No data collection or external server interactions

## Usage
- **Access Settings**: Click the Browser Sprite icon in your toolbar to open the settings popup
- **Change sprite Type**: Select between pink, purple, or green sprite in the settings
- **Adjust Size/Speed**: Use the sliders in the settings to customize your sprite
- **Behaviour**: Decide if you want to give them free will, chase your cursor or run away
- **Interact with sprite**: Click on your sprite to trigger special animations
- **Move sprite**: Drag and drop your sprite to reposition it on the screen
- **Enable/Disable**: Toggle the sprite on/off using the switch in the settings

## Technical Details
- Built with HTML/CSS/JavaScript
- Uses CSS animations for smooth movement
- Lightweight implementation with minimal performance impact
- No data collection or external server interactions

## Development
The extension is structured as follows:
- `manifest.json`: Extension configuration
- `popup.html/css/js`: Settings interface
- `sprite.css/js`: Core sprite functionality
- `images/`: sprite and icon graphics

All code runs locally within the browser with no external dependencies.

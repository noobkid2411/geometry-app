# Interactive Geometry App

This React-based application allows you to interactively create geometric figures, calculate lengths, and measure angles on a canvas.

## Features

- **Point Creation:** Click on the canvas to create points. Points are automatically labeled with letters (A, B, C...).
- **Line Segment Drawing:** Connect points to draw line segments. The length of each segment is calculated and displayed dynamically.
- **Angle Measurement:** Click on a point where two lines intersect to measure the angle between them. The angle is calculated and displayed dynamically. The app will always calculate and display the smaller angle between the two intersecting lines.
- **Dotted Grid:** A dotted grid helps with alignment and visualization.
- **Drawing Toggle:**  Easily enable or disable drawing mode using a button that changes color to indicate the current state (yellow for drawing enabled, light gray for disabled).

## Installation

1. **Clone the Repository:**

   ```bash
   git clone <repository-url> 
   cd my-geometry-app      


2. **Install Dependencies:**

    ```bash
    npm install
    Use code with caution.
3. **Usage**
    Run the App:

    ```bash
    npm run start
   
    Drawing Mode:

    Click the button (initially yellow) to enable drawing mode.
    Click on the canvas to create points.
    Click and drag from one point to another to draw lines.
    Click on a point where two lines intersect to measure and display the smaller angle.
    Click the button again (now light gray) to disable drawing mode.

4. **Dependencies**
    React: The core JavaScript library for building user interfaces.
    Tailwind CSS: A utility-first CSS framework for rapid UI development.

5. **Customization (Optional)**
    You can customize the app by modifying the following files:

    src/Canvas.js: This file contains the main logic for drawing, calculations, and user interactions.
    tailwind.config.js: Adjust Tailwind CSS configurations for colors, spacing, and other styles.
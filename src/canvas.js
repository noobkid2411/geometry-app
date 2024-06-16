// src/Canvas.js
import React, { useRef, useEffect, useState } from "react";

const Canvas = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [isDrawingEnabled, setIsDrawingEnabled] = useState(false);

  const [points, setPoints] = useState([]);
  const [lines, setLines] = useState([]);
  const [angles, setAngles] = useState([]);

  useEffect(() => {
    drawCanvas();
  }, [points, lines, angles]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw dotted grid
    context.fillStyle = "#ddd";
    for (let x = 0; x < canvas.width; x += 10) {
      for (let y = 0; y < canvas.height; y += 10) {
        context.beginPath();
        context.arc(x, y, 1, 0, Math.PI * 2, true);
        context.fill();
      }
    }

    // Draw points
    context.fillStyle = "black";
    context.font = "12px Arial";
    points.forEach((point, index) => {
      context.beginPath();
      context.arc(point.x, point.y, 3, 0, Math.PI * 2, true);
      context.fill();
      context.fillText(
        String.fromCharCode(65 + index),
        point.x + 5,
        point.y - 5
      ); // Label points A, B, C, ...
    });

    // Draw lines and lengths
    context.strokeStyle = "black";
    context.lineWidth = 1;
    lines.forEach((line) => {
      context.beginPath();
      context.moveTo(line.start.x, line.start.y);
      context.lineTo(line.end.x, line.end.y);
      context.stroke();

      // Calculate and display the length
      const length =
        Math.sqrt(
          Math.pow(line.end.x - line.start.x, 2) +
            Math.pow(line.end.y - line.start.y, 2)
        ) / 30; // Convert to cm
      const roundedLength = Math.floor(length);
      if (roundedLength) {
        context.fillText(
          `${roundedLength} cm`,
          (line.start.x + line.end.x) / 2 + 5,
          (line.start.y + line.end.y) / 2 - 5
        );
      }
    });

    // Draw angles
    context.fillStyle = "red";
    angles.forEach((angle) => {
      const startAngle = Math.atan2(
        angle.start.y - angle.vertex.y,
        angle.start.x - angle.vertex.x
      );
      const endAngle = Math.atan2(
        angle.end.y - angle.vertex.y,
        angle.end.x - angle.vertex.x
      );

      let adjustedEndAngle = endAngle;
      if (angle.counterclockwise) {
        if (endAngle < startAngle) {
          adjustedEndAngle = endAngle + 2 * Math.PI;
        }
      } else {
        if (endAngle > startAngle) {
          adjustedEndAngle = endAngle - 2 * Math.PI;
        }
      }

      context.beginPath();
      context.arc(
        angle.vertex.x,
        angle.vertex.y,
        30,
        startAngle,
        adjustedEndAngle,
        angle.counterclockwise
      );
      context.stroke();

      const midAngle = (startAngle + adjustedEndAngle) / 2;
      const angleCenterX = angle.vertex.x + Math.cos(midAngle) * 40;
      const angleCenterY = angle.vertex.y + Math.sin(midAngle) * 40;

      context.fillText(
        `${Math.floor(angle.degrees)}°`,
        angleCenterX,
        angleCenterY
      );
    });
  };

  const handleMouseDown = (e) => {
    if (!isDrawingEnabled) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const existingStartPoint = findExistingPoint({ x, y });
    const startPointToUse = existingStartPoint || { x, y };

    if (!existingStartPoint) {
      setPoints((prevPoints) => [...prevPoints, startPointToUse]);
    }
    setStartPoint(startPointToUse);
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const endPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    context.clearRect(0, 0, canvas.width, canvas.height);
    drawCanvas();

    // Draw line while dragging
    context.beginPath();
    context.moveTo(startPoint.x, startPoint.y);
    context.lineTo(endPoint.x, endPoint.y);
    context.strokeStyle = "black";
    context.lineWidth = 1;
    context.stroke();

    // Calculate and display the length dynamically
    const length =
      Math.sqrt(
        Math.pow(endPoint.x - startPoint.x, 2) +
          Math.pow(endPoint.y - startPoint.y, 2)
      ) / 30; // Convert to cm
    const roundedLength = Math.floor(length);
    context.fillText(
      `${roundedLength} cm`,
      (startPoint.x + endPoint.x) / 2 + 5,
      (startPoint.y + endPoint.y) / 2 - 5
    );

    // Calculate angles dynamically
    if (lines.length > 0) {
      const lastLine = lines[lines.length - 1];
      if (arePointsEqual(lastLine.end, startPoint)) {
        const angle = calculateAngle(lastLine, {
          start: startPoint,
          end: endPoint,
        });
        drawDynamicAngle(context, angle);
      }
    }
  };

  const handleMouseUp = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const endPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    const existingEndPoint = findExistingPoint(endPoint);
    const finalEndPoint = existingEndPoint || endPoint;

    if (!existingEndPoint) {
      setPoints((prevPoints) => [...prevPoints, finalEndPoint]);
    }

    const newLine = { start: startPoint, end: finalEndPoint };
    setLines((prevLines) => [...prevLines, newLine]);

    if (lines.length) {
      const lastLine = lines[lines.length - 1];
      if (arePointsEqual(lastLine.end, newLine.start)) {
        const angle = calculateAngle(lastLine, newLine);
        setAngles((prevAngles) => [...prevAngles, angle]);
        console.log(angles);
      }
      if (existingEndPoint) {
        if (arePointsEqual(newLine.end, existingEndPoint)) {
          const existingLine = lines?.find((line) =>
            arePointsEqual(line.start, existingEndPoint)
          );
          console.log(existingLine);
          if (existingLine) {
            const angle = calculateAngle(newLine, existingLine);
            setAngles((prevAngles) => [...prevAngles, angle]);
          }
        }
      }
    }
    setIsDrawing(false);
    setStartPoint(null);
  };

  const findExistingPoint = (point) => {
    const threshold = 5; // Distance threshold in pixels to consider points as the same
    for (const existingPoint of points) {
      const distance = Math.sqrt(
        Math.pow(existingPoint.x - point.x, 2) +
          Math.pow(existingPoint.y - point.y, 2)
      );
      if (distance < threshold) {
        return existingPoint;
      }
    }
    return null;
  };

  const arePointsEqual = (point1, point2) => {
    return point1.x === point2.x && point1.y === point2.y;
  };

  const calculateAngle = (line1, line2) => {
    const vector1 = {
      x: line1.end.x - line1.start.x,
      y: line1.end.y - line1.start.y,
    };

    const vector2 = {
      x: line2.end.x - line2.start.x,
      y: line2.end.y - line2.start.y,
    };

    const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
    const magnitude1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
    const magnitude2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);

    const cosineTheta = dotProduct / (magnitude1 * magnitude2);
    const clampedCosineTheta = Math.min(1, Math.max(-1, cosineTheta));

    const angleInRadians = Math.acos(clampedCosineTheta);
    let angleInDegrees = angleInRadians * (180 / Math.PI);

    if (angleInDegrees > 90) {
      angleInDegrees = 180 - angleInDegrees;
    }

    let vertex = line1.end;
    let start = line1.start;
    let end = line2.end;

    const crossProduct = vector1.x * vector2.y - vector1.y * vector2.x;
    const counterclockwise = crossProduct > 0;
    return {
      degrees: angleInDegrees,
      vertex: line1.end,
      start: line1.start,
      end: line2.end,
      counterclockwise,
    };
  };

  const drawDynamicAngle = (context, angle) => {
    const startAngle = Math.atan2(
      angle.start.y - angle.vertex.y,
      angle.start.x - angle.vertex.x
    );
    const endAngle = Math.atan2(
      angle.end.y - angle.vertex.y,
      angle.end.x - angle.vertex.x
    );

    let adjustedEndAngle = endAngle;
    if (angle.counterclockwise) {
      if (endAngle < startAngle) {
        adjustedEndAngle = endAngle + 2 * Math.PI;
      }
    } else {
      if (endAngle > startAngle) {
        adjustedEndAngle = endAngle - 2 * Math.PI;
      }
    }

    context.beginPath();
    context.arc(
      angle.vertex.x,
      angle.vertex.y,
      30,
      startAngle,
      adjustedEndAngle,
      angle.counterclockwise
    );
    context.strokeStyle = "red";
    context.lineWidth = 1;
    context.stroke();

    const midAngle = (startAngle + adjustedEndAngle) / 2;
    const angleCenterX = angle.vertex.x + Math.cos(midAngle) * 40;
    const angleCenterY = angle.vertex.y + Math.sin(midAngle) * 40;

    context.fillText(
      `${Math.floor(angle.degrees)}°`,
      angleCenterX,
      angleCenterY
    );
  };

  const handleToggleDrawing = () => {
    setIsDrawingEnabled(!isDrawingEnabled);
    drawCanvas(); // Update canvas based on button state
  };

  /* const findAndAddAnglesAtPoints = () => {
    points.forEach(point => {
      const connectedLines = lines.filter(line => 
        line.end === point || line.start === point 
      );

      // Calculate and add angles even if there are only two connected lines
      if (connectedLines.length === 2) {
        const line1 = connectedLines[0];
        const line2 = connectedLines[1];

        // Check if the point is the start of one line and end of another
        if ((line1.start === point && line2.end === point) || (line2.start === point && line1.end === point)) {
          // Check if an angle at this vertex already exists
          if (!angles.some(a => a.vertex === point)) {
            const angle = calculateAngle(line1, line2);
            setAngles(prevAngles => [...prevAngles, angle]);
          }
        }
      }
    });
  }; */

  /* const areAnglesEqual = (angle1, angle2) => {
    return angle1.vertex.x === angle2.vertex.x &&
           angle1.vertex.y === angle2.vertex.y &&
           angle1.degrees === angle2.degrees;
  };
 */
  useEffect(() => {
    console.log(angles);
    drawCanvas();
  }, [angles]); // Include angles to trigger effect after angle addition

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="border border-gray-300"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      ></canvas>
      <div className="rounded-md w-[600px] p-2 mt-2 bg-yellow-100 hover:bg-green">
        <div className="flex items-left">
          <button
            style={{
              backgroundColor: isDrawingEnabled ? "lightYellow" : "yellow",
            }}
            className="rounded-md p-2 bg-blue hover:bg-green"
            onClick={handleToggleDrawing}
          >
            <svg
              width="24"
              height="10"
              viewBox="0 0 24 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="4" cy="5" r="2" fill="black" />
              <circle cx="20" cy="5" r="2" fill="black" />
              <line
                x1="6"
                y1="5"
                x2="18"
                y2="5"
                stroke="black"
                strokeWidth="2"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Canvas;

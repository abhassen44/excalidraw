import axios from "axios";
import { BACKEND_URL } from "../config";

type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    }
  | {
      type: "line";
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }
  | {
      type: "pencil";
      points: { x: number; y: number }[];
    };

type shapetype = "rect" | "circle" | "line" | "pencil";


   

export async function initDraw(
  canvas: HTMLCanvasElement,
  roomId: string,
  socket: WebSocket,
  getShapeType: () => shapetype
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 1. Load and render existing shapes
  const existingShapes: Shape[] = await getExistingShapes(roomId);
  clearCanvas(existingShapes, canvas, ctx);

  // 2. Listen for real-time drawing updates
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === "chat") {
      const parsedShape: Shape = JSON.parse(message.message);
      existingShapes.push(parsedShape);
      clearCanvas(existingShapes, canvas, ctx);
    }
  };
  

  // 3. Drawing state
  let clicked = false;
  let startx = 0;
  let starty = 0;
  let pencilPoints: { x: number; y: number }[] = [];

  canvas.addEventListener("mousedown", (e) => {
    clicked = true;

    const rect = canvas.getBoundingClientRect();
    startx = e.clientX - rect.left;
    starty = e.clientY - rect.top;

    if(getShapeType() === "pencil") {
        pencilPoints=[{ x: startx, y: starty }] ;
    }
  });

canvas.addEventListener("mouseup", (e) => {
  if (!clicked) return;
  clicked = false;

  const rect = canvas.getBoundingClientRect();
  const endX = e.clientX - rect.left;
  const endY = e.clientY - rect.top;

  const width = endX - startx;
  const height = endY - starty;

  const shapeType = getShapeType();
  let shape: Shape;

  if (shapeType === "pencil") {
    shape = {
      type: "pencil",
      points: [...pencilPoints],
    };
    pencilPoints = [];
  } else if (shapeType === "circle") {
    const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
    shape = {
      type: "circle",
      centerX: startx + width / 2,
      centerY: starty + height / 2,
      radius,
    };
  } else if (shapeType === "rect") {
    shape = {
      type: "rect",
      x: startx,
      y: starty,
      width,
      height,
    };
  } else {
    shape = {
      type: "line",
      x1: startx,
      y1: starty,
      x2: endX,
      y2: endY,
    };
  }

  existingShapes.push(shape);
  clearCanvas(existingShapes, canvas, ctx);

  socket.send(
    JSON.stringify({
      type: "chat",
      roomId: Number(roomId),
      message: JSON.stringify(shape),
    })
  );
});

canvas.addEventListener("mousemove", (e) => {
  if (!clicked) return;

  const rect = canvas.getBoundingClientRect();
  const currentX = e.clientX - rect.left;
  const currentY = e.clientY - rect.top;

  const shapeType = getShapeType();

  if (shapeType === "pencil") {
    pencilPoints.push({ x: currentX, y: currentY });
    clearCanvas(existingShapes, canvas, ctx);

    // Draw live pencil stroke
    ctx.beginPath();
    ctx.moveTo(pencilPoints[0].x, pencilPoints[0].y);
    for (let i = 1; i < pencilPoints.length; i++) {
      ctx.lineTo(pencilPoints[i].x, pencilPoints[i].y);
    }
    ctx.stroke();
    return;
  }

  // Preview for other shapes
  const width = currentX - startx;
  const height = currentY - starty;

  clearCanvas(existingShapes, canvas, ctx);
  ctx.strokeStyle = "white";

  if (shapeType === "rect") {
    ctx.strokeRect(startx, starty, width, height);
  } else if (shapeType === "circle") {
    const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
    ctx.beginPath();
    ctx.arc(startx + width / 2, starty + height / 2, radius, 0, 2 * Math.PI);
    ctx.stroke();
  } else if (shapeType === "line") {
    ctx.beginPath();
    ctx.moveTo(startx, starty);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();
  }
});


// 🧽 Clears canvas and redraws all shapes
function clearCanvas(
  existingShapes: Shape[],
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const shape of existingShapes) {
    ctx.strokeStyle = "white";
    if (shape.type === "rect") {
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    } else if (shape.type === "circle") {
      ctx.beginPath();
      ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (shape.type === "line") {
      ctx.beginPath();
      ctx.moveTo(shape.x1, shape.y1);
      ctx.lineTo(shape.x2, shape.y2);
      ctx.stroke();
    } else if (shape.type === "pencil") {
      ctx.beginPath();
      ctx.moveTo(shape.points[0].x, shape.points[0].y);
      for (let i = 1; i < shape.points.length; i++) {
        ctx.lineTo(shape.points[i].x, shape.points[i].y);
      }
      ctx.stroke();
    }
  }
}


// 🔌 Fetch existing shapes from backend
async function getExistingShapes(roomId: string): Promise<Shape[]> {
  const response = await axios.get(`${BACKEND_URL}/chats/${roomId}`);
  const messages = response.data.messages;

  return messages.map((x: { message: string }) =>
    JSON.parse(x.message)
  ) as Shape[];
}


}

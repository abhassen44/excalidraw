"use client";

import { useEffect, useRef, useState } from "react";
import { initDraw } from "../draw";
import { IconButton } from "./IconButton";
import { ArrowBigDown, Circle, LineChart, Pencil, RectangleHorizontal } from "lucide-react";

export type shapetype = "rect" | "circle" | "line" | "pencil" | "select";

export default function Canvas({ roomId, socket }: { roomId: string; socket: WebSocket }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shapeRef = useRef<shapetype>(null); // Initialize with null

  const [shapes, setShapes] = useState<shapetype>("rect");
//   const ref1 = useRef<string>("");

  // Update the ref when the shape type changes
  useEffect(() => {
    shapeRef.current = shapes;
  }, [shapes]);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      initDraw(canvas, roomId, socket, () => shapeRef.current ?? "rect"); // Use nullish coalescing operator to provide a default value
    }
  }, [canvasRef, roomId, socket]);

  return (
    <div className="h-[100vh] bg-black overflow-hidden">
      <canvas ref={canvasRef} width={2000} height={1000}></canvas>
      <div className="fixed top-0 left-0 flex gap-2 w-full">
      

        <IconButton activated={shapes === "rect"} icon={<RectangleHorizontal className="w-6 h-6" />} onClick={() => setShapes("rect")} />
        <IconButton activated={shapes === "circle"}  icon={<Circle className="w-6 h-6" />} onClick={() => setShapes("circle")} />

        <IconButton activated={shapes === "line"}  icon={<LineChart className="w-6 h-6" />} onClick={() => setShapes("line")} />

        <IconButton activated={shapes === "pencil"}  icon={<Pencil className="w-6 h-6" />} onClick={() => setShapes("pencil")} />
        <IconButton activated={shapes === "select"}  icon={<ArrowBigDown className="w-6 h-6" />} onClick={() => setShapes("select")} />


      </div>
    </div>
  );
}


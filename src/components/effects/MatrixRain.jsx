import React, { useEffect, useRef } from "react";

const MatrixRain = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationId;
    let columns = [];
    const charSize = 14;
    const alphabet = "010101010101ABCDEFHIJKLMNOPQRSTUVWXYZ";

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const numColumns = Math.floor(canvas.width / charSize);
      
      // Initialize columns drop coordinates y
      columns = Array.from({ length: numColumns }, () => Math.random() * -canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      // Check theme color configuration reactively
      const isLightMode = document.body.classList.contains("light");

      // Clear the canvas completely so the background is always transparent and never blocks content
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Set character style
      ctx.font = `bold ${charSize}px monospace`;

      columns.forEach((y, index) => {
        const x = index * charSize;

        // Draw a fading tail of characters behind the head (length 14)
        const tailLength = 14;
        for (let i = 0; i < tailLength; i++) {
          const charY = y - i * charSize;
          if (charY < 0) continue; // Skip if off-screen top

          // Calculate fading opacity based on position in tail
          const opacity = 1 - i / tailLength;
          const char = alphabet[Math.floor(Math.random() * alphabet.length)];

          if (isLightMode) {
            // Light mode: subtle lavender/indigo rain
            if (i === 0) {
              ctx.fillStyle = `rgba(79, 70, 229, ${opacity * 0.35})`; // Soft indigo head
            } else {
              ctx.fillStyle = `rgba(124, 58, 237, ${opacity * 0.12})`; // Translucent violet tail
            }
          } else {
            // Dark mode: classic hacker green/cyan rain
            if (i === 0) {
              ctx.fillStyle = `rgba(34, 211, 238, ${opacity * 0.35})`; // Soft cyan head
            } else {
              ctx.fillStyle = `rgba(34, 197, 94, ${opacity * 0.12})`; // Translucent green tail
            }
          }

          ctx.fillText(char, x, charY);
        }

        // Reset column drops when the entire stream tail clears the bottom
        if (y - tailLength * charSize > canvas.height && Math.random() > 0.98) {
          columns[index] = 0;
        } else {
          columns[index] = y + charSize;
        }
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[1]"
      style={{ mixBlendMode: "normal" }}
    />
  );
};

export default MatrixRain;

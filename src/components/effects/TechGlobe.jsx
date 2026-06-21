import React, { useEffect, useRef, useState } from "react";
import { playTap } from "../../services/soundEffects";

const TAGS = [
  "Java", "Spring Boot", "React.js", "Next.js", "JavaScript",
  "TypeScript", "MySQL", "MongoDB", "Docker", "Git",
  "REST APIs", "OAuth", "Redis", "HTML5", "CSS3",
  "DSA", "Hibernate", "Microservices", "JWT", "AWS"
];

const TechGlobe = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hoveredTag, setHoveredTag] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationId;
    let width = 300;
    let height = 300;

    const resize = () => {
      const parent = containerRef.current;
      if (parent) {
        width = parent.clientWidth;
        height = parent.clientWidth; // Keep square aspect ratio
        canvas.width = width;
        canvas.height = height;
      }
    };
    resize();
    window.addEventListener("resize", resize);

    // Spherical coordinates projection math
    const numTags = TAGS.length;
    const radius = 110;
    
    // Distribute tags uniformly on a sphere using Fibonacci spiral distribution
    const tagObjects = TAGS.map((tag, idx) => {
      const phi = Math.acos(-1 + (2 * idx) / numTags);
      const theta = Math.sqrt(numTags * Math.PI) * phi;
      return {
        text: tag,
        x3d: radius * Math.sin(phi) * Math.cos(theta),
        y3d: radius * Math.sin(phi) * Math.sin(theta),
        z3d: radius * Math.cos(phi),
        x2d: 0,
        y2d: 0,
        scale: 1,
        opacity: 1
      };
    });

    let angleX = 0.005; // Pitch rotation speed
    let angleY = 0.005; // Yaw rotation speed
    let mouse = { x: null, y: null, isDown: false, lastX: 0, lastY: 0 };
    let activeTag = null;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (mouse.isDown) {
        // Drag rotation controls
        const dx = x - mouse.lastX;
        const dy = y - mouse.lastY;
        angleY = dx * 0.003;
        angleX = -dy * 0.003;
        mouse.lastX = x;
        mouse.lastY = y;
      } else {
        // Hover controls - adjust speeds based on distance from center
        const centerX = width / 2;
        const centerY = height / 2;
        angleY = (x - centerX) * 0.00003;
        angleX = -(y - centerY) * 0.00003;
      }

      mouse.x = x;
      mouse.y = y;
    };

    const handleMouseDown = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.isDown = true;
      mouse.lastX = e.clientX - rect.left;
      mouse.lastY = e.clientY - rect.top;
    };

    const handleMouseUp = () => {
      mouse.isDown = false;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    // Rotation matrices calculations
    const rotateX = (points, angle) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      points.forEach((p) => {
        const y = p.y3d * cos - p.z3d * sin;
        const z = p.y3d * sin + p.z3d * cos;
        p.y3d = y;
        p.z3d = z;
      });
    };

    const rotateY = (points, angle) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      points.forEach((p) => {
        const x = p.x3d * cos - p.z3d * sin;
        const z = p.x3d * sin + p.z3d * cos;
        p.x3d = x;
        p.z3d = z;
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Rotate sphere
      rotateX(tagObjects, angleX);
      rotateY(tagObjects, angleY);

      // Decelerate drag rotation gradually
      if (!mouse.isDown) {
        angleX *= 0.98;
        angleY *= 0.98;
        // Keep a minimum baseline spin
        if (Math.abs(angleX) < 0.002) angleX = 0.002;
        if (Math.abs(angleY) < 0.002) angleY = 0.002;
      }

      const isLightMode = document.body.classList.contains("light");

      // Perspective projection onto 2D coordinate space
      const focalLength = 300;
      let closestTag = null;
      let minDistance = 15; // hover distance sensitivity

      tagObjects.forEach((p) => {
        // Perspective scaling factor
        const scale = focalLength / (focalLength + p.z3d);
        p.x2d = width / 2 + p.x3d * scale;
        p.y2d = height / 2 + p.y3d * scale;
        p.scale = scale;
        
        // Opacity mapping (fade background tags)
        p.opacity = Math.max(0.12, (p.z3d + radius) / (2 * radius));

        // Hover collision detection
        if (mouse.x !== null && mouse.y !== null) {
          const dist = Math.hypot(p.x2d - mouse.x, p.y2d - mouse.y);
          if (dist < minDistance) {
            closestTag = p;
          }
        }
      });

      // Handle sound cue triggers on tag hover selection
      if (closestTag && closestTag !== activeTag) {
        activeTag = closestTag;
        setHoveredTag(closestTag.text);
        playTap();
      } else if (!closestTag && activeTag) {
        activeTag = null;
        setHoveredTag(null);
      }

      // Sort tags by z3d coordinate so background elements are drawn first (painters algorithm)
      const sorted = [...tagObjects].sort((a, b) => b.z3d - a.z3d);

      // Render tags on Canvas
      sorted.forEach((p) => {
        const isHovered = hoveredTag === p.text;
        
        // Font configuration
        const baseFontSize = isHovered ? 15 : 12;
        const fontSize = Math.round(baseFontSize * p.scale);
        ctx.font = `bold ${fontSize}px Poppins`;

        // Color selection based on theme & hover states
        if (isHovered) {
          ctx.fillStyle = isLightMode ? "#4f46e5" : "#22d3ee";
        } else {
          // Purple/cyan theme accent blending
          const colorBlend = isLightMode
            ? `rgba(99, 102, 241, ${p.opacity * 0.8})` // Soft Indigo
            : `rgba(167, 139, 250, ${p.opacity * 0.8})`; // Soft Violet
          ctx.fillStyle = colorBlend;
        }

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Draw shadow glow on hover
        if (isHovered) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = isLightMode ? "rgba(99, 102, 241, 0.4)" : "rgba(34, 211, 238, 0.6)";
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillText(p.text, p.x2d, p.y2d);
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [hoveredTag]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-square flex items-center justify-center max-w-[320px] mx-auto select-none overflow-hidden"
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing" 
      />
      {hoveredTag && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 dark:bg-white/5 border border-white/10 dark:border-white/5 backdrop-blur-md rounded-xl px-3 py-1 text-[10px] font-mono text-purple-400 dark:text-cyan-400 tracking-wider shadow-md pointer-events-none animate-[pulse_1s_infinite]">
          {hoveredTag.toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default TechGlobe;

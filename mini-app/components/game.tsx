"use client";

import { useEffect, useRef, useState } from "react";

const CHARACTER_SIZE = 48;
const OBSTACLE_SIZE = 32;
const INITIAL_SPEED = 2;
const SPEED_INCREMENT = 0.0005;
const GRAVITY = 0.6;
const JUMP_VELOCITY = -12;

export default function Game() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    Number(localStorage.getItem("highScore")) || 0
  );
  const [isGameOver, setIsGameOver] = useState(false);
  const [characterY, setCharacterY] = useState(0);
  const [velocityY, setVelocityY] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const obstaclesRef = useRef<
    { id: number; x: number; y: number; width: number; height: number }[]
  >([]);

  // Create obstacles
  useEffect(() => {
    const interval = setInterval(() => {
      const newObstacle = {
        id: Date.now(),
        x: containerRef.current?.clientWidth || 0,
        y: 0,
        width: OBSTACLE_SIZE,
        height: OBSTACLE_SIZE,
      };
      obstaclesRef.current = [...obstaclesRef.current, newObstacle];
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Game loop
  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      // Move obstacles
      obstaclesRef.current = obstaclesRef.current
        .map((o) => ({ ...o, x: o.x - speed }))
        .filter((o) => o.x + o.width > 0);

      // Update character position
      setVelocityY((v) => v + GRAVITY);
      setCharacterY((y) => Math.max(0, y + velocityY));

      // Collision detection
      const charRect = {
        x: 20,
        y: (containerRef.current?.clientHeight ?? 0) - CHARACTER_SIZE - characterY,
        width: CHARACTER_SIZE,
        height: CHARACTER_SIZE,
      };
      for (const o of obstaclesRef.current) {
        const obsRect = {
          x: o.x,
          y: (containerRef.current?.clientHeight ?? 0) - o.height,
          width: o.width,
          height: o.height,
        };
        if (
          charRect.x < obsRect.x + obsRect.width &&
          charRect.x + charRect.width > obsRect.x &&
          charRect.y < obsRect.y + obsRect.height &&
          charRect.y + charRect.height > obsRect.y
        ) {
          setIsGameOver(true);
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem("highScore", String(score));
          }
          return;
        }
      }

      // Increase speed gradually
      setSpeed((s) => s + SPEED_INCREMENT);

      // Update score
      setScore((s) => s + 1);
    }, 16);
    return () => clearInterval(interval);
  }, [isGameOver, velocityY, score, highScore, speed, characterY]);

  const handleJump = () => {
    if (isGameOver) return;
    setVelocityY(JUMP_VELOCITY);
  };

  const restart = () => {
    setIsGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setCharacterY(0);
    setVelocityY(0);
    obstaclesRef.current = [];
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-md h-80 bg-gray-200 overflow-hidden rounded-lg shadow-lg"
      onClick={handleJump}
      onKeyDown={(e) => e.key === " " && handleJump()}
      tabIndex={0}
    >
      {/* Character */}
      <div
        className="absolute bg-blue-500 rounded"
        style={{
          width: `${CHARACTER_SIZE}px`,
          height: `${CHARACTER_SIZE}px`,
          left: "20px",
          bottom: `${characterY}px`,
        }}
      />

      {/* Obstacles */}
      {obstaclesRef.current.map((o) => (
        <div
          key={o.id}
          className="absolute bg-red-500 rounded"
          style={{
            width: `${o.width}px`,
            height: `${o.height}px`,
            left: `${o.x}px`,
            bottom: "0px",
          }}
        />
      ))}

      {/* Score */}
      <div className="absolute top-2 left-2 text-sm font-medium">
        Score: {score}
      </div>
      <div className="absolute top-2 right-2 text-sm font-medium">
        High: {highScore}
      </div>

      {/* Game Over */}
      {isGameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 text-white">
          <h2 className="text-2xl mb-4">Game Over</h2>
          <button
            onClick={restart}
            className="px-4 py-2 bg-green-500 rounded hover:bg-green-600"
          >
            Restart
          </button>
        </div>
      )}
    </div>
  );
}

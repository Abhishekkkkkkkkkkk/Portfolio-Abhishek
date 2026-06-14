import React, { useState, useEffect, useRef } from "react";
import { Sliders, RefreshCw, Play, RefreshCcw, Waypoints } from "lucide-react";
import { trackExperimentInteracted } from "../../playground/achievements/achievementHelper";

const ROWS = 12;
const COLS = 22;

const PathfindingVisualizer = () => {
  const [grid, setGrid] = useState([]);
  const [algo, setAlgo] = useState("bfs"); // bfs, dfs, dijkstra
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startNode, setStartNode] = useState({ r: 2, c: 3 });
  const [targetNode, setTargetNode] = useState({ r: 9, c: 18 });
  const [visualizing, setVisualizing] = useState(false);

  const visualizingRef = useRef(visualizing);
  visualizingRef.current = visualizing;

  const initGrid = () => {
    if (visualizing) return;
    const initialGrid = [];
    for (let r = 0; r < ROWS; r++) {
      const row = [];
      for (let c = 0; c < COLS; c++) {
        row.push({
          r,
          c,
          isStart: r === startNode.r && c === startNode.c,
          isTarget: r === targetNode.r && c === targetNode.c,
          isWall: false,
          isVisited: false,
          isPath: false,
        });
      }
      initialGrid.push(row);
    }
    setGrid(initialGrid);
  };

  useEffect(() => {
    initGrid();
  }, [startNode, targetNode]);

  const handleMouseDown = (r, c) => {
    if (visualizing) return;
    setIsMouseDown(true);
    toggleWall(r, c);
  };

  const handleMouseEnter = (r, c) => {
    if (!isMouseDown || visualizing) return;
    toggleWall(r, c);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const toggleWall = (r, c) => {
    if ((r === startNode.r && c === startNode.c) || (r === targetNode.r && c === targetNode.c)) return;
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((row) => row.map((node) => ({ ...node })));
      newGrid[r][c].isWall = !newGrid[r][c].isWall;
      return newGrid;
    });
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Breadth-First Search (BFS) Algorithm
  const runBFS = async () => {
    setVisualizing(true);
    trackExperimentInteracted("pathfind");

    const currentGrid = grid.map((row) => row.map((node) => ({ ...node, isVisited: false, isPath: false })));
    const queue = [currentGrid[startNode.r][startNode.c]];
    const parentMap = new Map();
    const visitedNodes = [];

    currentGrid[startNode.r][startNode.c].isVisited = true;

    let targetFound = false;

    while (queue.length > 0) {
      if (!visualizingRef.current) return;
      const curr = queue.shift();

      visitedNodes.push(curr);

      if (curr.r === targetNode.r && curr.c === targetNode.c) {
        targetFound = true;
        break;
      }

      // Animate search
      if (!(curr.r === startNode.r && curr.c === startNode.c)) {
        curr.isVisited = true;
        setGrid(currentGrid.map((row) => row.map((n) => ({ ...n }))));
        await sleep(15);
      }

      // Neighbors
      const neighbors = getNeighbors(curr, currentGrid);
      for (let neighbor of neighbors) {
        if (!neighbor.isVisited && !neighbor.isWall) {
          neighbor.isVisited = true;
          parentMap.set(`${neighbor.r}-${neighbor.c}`, curr);
          queue.push(neighbor);
        }
      }
    }

    if (targetFound) {
      await animateShortestPath(parentMap);
    }
    setVisualizing(false);
  };

  // Depth-First Search (DFS) Algorithm
  const runDFS = async () => {
    setVisualizing(true);
    trackExperimentInteracted("pathfind");

    const currentGrid = grid.map((row) => row.map((node) => ({ ...node, isVisited: false, isPath: false })));
    const stack = [currentGrid[startNode.r][startNode.c]];
    const parentMap = new Map();
    const visitedSet = new Set();
    let targetFound = false;

    while (stack.length > 0) {
      if (!visualizingRef.current) return;
      const curr = stack.pop();

      const key = `${curr.r}-${curr.c}`;
      if (visitedSet.has(key)) continue;
      visitedSet.add(key);

      if (curr.r === targetNode.r && curr.c === targetNode.c) {
        targetFound = true;
        break;
      }

      if (!(curr.r === startNode.r && curr.c === startNode.c)) {
        curr.isVisited = true;
        setGrid(currentGrid.map((row) => row.map((n) => ({ ...n }))));
        await sleep(20);
      }

      const neighbors = getNeighbors(curr, currentGrid);
      for (let neighbor of neighbors) {
        if (!visitedSet.has(`${neighbor.r}-${neighbor.c}`) && !neighbor.isWall) {
          parentMap.set(`${neighbor.r}-${neighbor.c}`, curr);
          stack.push(neighbor);
        }
      }
    }

    if (targetFound) {
      await animateShortestPath(parentMap);
    }
    setVisualizing(false);
  };

  // Dijkstra Algorithm (treating unweighted grid as weight 1 edges)
  const runDijkstra = async () => {
    setVisualizing(true);
    trackExperimentInteracted("pathfind");

    const currentGrid = grid.map((row) => row.map((node) => ({ ...node, isVisited: false, isPath: false })));
    const distances = {};
    const unvisited = [];
    const parentMap = new Map();

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const key = `${r}-${c}`;
        distances[key] = Infinity;
        unvisited.push(currentGrid[r][c]);
      }
    }
    distances[`${startNode.r}-${startNode.c}`] = 0;

    let targetFound = false;

    while (unvisited.length > 0) {
      if (!visualizingRef.current) return;
      
      // Sort nodes by distance
      unvisited.sort((a, b) => distances[`${a.r}-${a.c}`] - distances[`${b.r}-${b.c}`]);
      const closestNode = unvisited.shift();

      if (closestNode.isWall) continue;
      if (distances[`${closestNode.r}-${closestNode.c}`] === Infinity) break;

      closestNode.isVisited = true;
      if (closestNode.r === targetNode.r && closestNode.c === targetNode.c) {
        targetFound = true;
        break;
      }

      // Animate search
      if (!(closestNode.r === startNode.r && closestNode.c === startNode.c)) {
        setGrid(currentGrid.map((row) => row.map((n) => ({ ...n }))));
        await sleep(15);
      }

      const neighbors = getNeighbors(closestNode, currentGrid);
      for (let neighbor of neighbors) {
        if (unvisited.includes(neighbor)) {
          const altDist = distances[`${closestNode.r}-${closestNode.c}`] + 1;
          const neighborKey = `${neighbor.r}-${neighbor.c}`;
          if (altDist < distances[neighborKey]) {
            distances[neighborKey] = altDist;
            parentMap.set(neighborKey, closestNode);
          }
        }
      }
    }

    if (targetFound) {
      await animateShortestPath(parentMap);
    }
    setVisualizing(false);
  };

  // A* Pathfinding Algorithm (Manhattan Distance Heuristic)
  const runAStar = async () => {
    setVisualizing(true);
    trackExperimentInteracted("pathfind");

    const currentGrid = grid.map((row) => row.map((node) => ({ ...node, isVisited: false, isPath: false })));
    const gScore = {};
    const fScore = {};
    const unvisited = [];
    const parentMap = new Map();

    const heuristic = (node) => {
      return Math.abs(node.r - targetNode.r) + Math.abs(node.c - targetNode.c);
    };

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const key = `${r}-${c}`;
        gScore[key] = Infinity;
        fScore[key] = Infinity;
        unvisited.push(currentGrid[r][c]);
      }
    }

    const startKey = `${startNode.r}-${startNode.c}`;
    gScore[startKey] = 0;
    fScore[startKey] = heuristic(startNode);

    let targetFound = false;

    while (unvisited.length > 0) {
      if (!visualizingRef.current) return;

      // Sort by fScore
      unvisited.sort((a, b) => fScore[`${a.r}-${a.c}`] - fScore[`${b.r}-${b.c}`]);
      const closestNode = unvisited.shift();

      if (closestNode.isWall) continue;
      if (fScore[`${closestNode.r}-${closestNode.c}`] === Infinity) break;

      closestNode.isVisited = true;
      if (closestNode.r === targetNode.r && closestNode.c === targetNode.c) {
        targetFound = true;
        break;
      }

      // Animate search
      if (!(closestNode.r === startNode.r && closestNode.c === startNode.c)) {
        setGrid(currentGrid.map((row) => row.map((n) => ({ ...n }))));
        await sleep(15);
      }

      const neighbors = getNeighbors(closestNode, currentGrid);
      for (let neighbor of neighbors) {
        if (unvisited.includes(neighbor)) {
          const tentativeGScore = gScore[`${closestNode.r}-${closestNode.c}`] + 1;
          const neighborKey = `${neighbor.r}-${neighbor.c}`;
          if (tentativeGScore < gScore[neighborKey]) {
            gScore[neighborKey] = tentativeGScore;
            fScore[neighborKey] = tentativeGScore + heuristic(neighbor);
            parentMap.set(neighborKey, closestNode);
          }
        }
      }
    }

    if (targetFound) {
      await animateShortestPath(parentMap);
    }
    setVisualizing(false);
  };

  const getNeighbors = (node, currentGrid) => {
    const neighbors = [];
    const { r, c } = node;

    if (r > 0) neighbors.push(currentGrid[r - 1][c]); // Top
    if (r < ROWS - 1) neighbors.push(currentGrid[r + 1][c]); // Bottom
    if (c > 0) neighbors.push(currentGrid[r][c - 1]); // Left
    if (c < COLS - 1) neighbors.push(currentGrid[r][c + 1]); // Right

    return neighbors;
  };

  const animateShortestPath = async (parentMap) => {
    const path = [];
    let curr = grid[targetNode.r][targetNode.c];
    
    while (curr) {
      const key = `${curr.r}-${curr.c}`;
      const parent = parentMap.get(key);
      if (parent) {
        path.unshift(parent);
      }
      curr = parent;
    }

    // Traverse path back and color
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((row) => row.map((node) => ({ ...node })));
      path.forEach((node) => {
        if (!(node.r === startNode.r && node.c === startNode.c)) {
          newGrid[node.r][node.c].isPath = true;
        }
      });
      return newGrid;
    });
    
    // Quick fade visualization sleep
    await sleep(200);
  };

  const handlePlay = () => {
    if (visualizing) return;
    if (algo === "bfs") runBFS();
    else if (algo === "dfs") runDFS();
    else if (algo === "dijkstra") runDijkstra();
    else if (algo === "astar") runAStar();
  };

  const handleStop = () => {
    setVisualizing(false);
    initGrid();
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl border border-white/10 bg-[#0a0a1a]/85 backdrop-blur-xl p-6 flex flex-col gap-5 text-left">
      {/* Header */}
      <div className="flex border-b border-white/8 pb-3 justify-between items-center flex-wrap gap-4">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Waypoints className="w-5 h-5 text-[#22d3ee]" />
            Pathfinding Visualizer
          </h4>
        </div>
        <div className="flex gap-1 p-1 bg-white/4 border border-white/10 rounded-xl">
          {[
            { id: "bfs", label: "BFS (Breadth)" },
            { id: "dfs", label: "DFS (Depth)" },
            { id: "dijkstra", label: "Dijkstra" },
            { id: "astar", label: "A* Search" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (visualizing) return;
                setAlgo(item.id);
                initGrid();
              }}
              disabled={visualizing}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 cursor-pointer ${
                algo === item.id
                  ? "bg-[#6366f1]/20 text-[#a78bfa] border border-[#6366f1]/30"
                  : "text-gray-400 hover:text-white disabled:opacity-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Canvas Board */}
      <div 
        className="w-full overflow-x-auto select-none rounded-xl border border-white/8 p-2 bg-black/60"
        onMouseLeave={handleMouseUp}
      >
        <div 
          className="grid gap-[2px] mx-auto min-w-[500px]"
          style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
        >
          {grid.map((row, rIdx) =>
            row.map((node, cIdx) => {
              let nodeColor = "bg-white/[0.03] border border-white/[0.02] hover:border-white/20";
              if (node.isStart) {
                nodeColor = "bg-[#22c55e] border border-white/20 shadow-[0_0_8px_rgba(34,197,94,0.4)]";
              } else if (node.isTarget) {
                nodeColor = "bg-[#ef4444] border border-white/20 shadow-[0_0_8px_rgba(239,68,68,0.4)]";
              } else if (node.isWall) {
                nodeColor = "bg-gray-700 border border-gray-600 shadow-inner";
              } else if (node.isPath) {
                nodeColor = "bg-[#eab308]/80 border border-yellow-500/50 shadow-[0_0_5px_rgba(234,179,8,0.3)] animate-pulse";
              } else if (node.isVisited) {
                nodeColor = "bg-[#6366f1]/30 border border-[#6366f1]/40";
              }

              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  onMouseDown={() => handleMouseDown(node.r, node.c)}
                  onMouseEnter={() => handleMouseEnter(node.r, node.c)}
                  onMouseUp={handleMouseUp}
                  className={`w-full aspect-square rounded cursor-pointer transition-all duration-300 ${nodeColor}`}
                />
              )
            })
          )}
        </div>
      </div>

      {/* Legend & Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-5 bg-white/3 border border-white/5 rounded-2xl p-4 text-xs font-mono">
        {/* Grid node symbols representation legend */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-[#22c55e]" />
            <span className="text-gray-400 text-[10px]">Start</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-[#ef4444]" />
            <span className="text-gray-400 text-[10px]">Target</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-gray-700" />
            <span className="text-gray-400 text-[10px]">Wall</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-[#6366f1]/30" />
            <span className="text-gray-400 text-[10px]">Visited</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-[#eab308]/80 animate-pulse" />
            <span className="text-gray-400 text-[10px]">Path</span>
          </div>
        </div>

        {/* Action button triggers */}
        <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
          <button
            onClick={initGrid}
            disabled={visualizing}
            className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-50 transition-all cursor-pointer"
            title="Clear walls / reset grid"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          
          {visualizing ? (
            <button
              onClick={handleStop}
              className="px-6 py-3 rounded-xl font-bold bg-red-500/20 border border-red-500/40 text-red-500 hover:bg-red-500/30 flex items-center gap-1.5 text-xs transition-all cursor-pointer"
            >
              <span>Stop / Reset</span>
            </button>
          ) : (
            <button
              onClick={handlePlay}
              className="px-6 py-3 rounded-xl font-bold bg-[#22c55e]/20 border border-[#22c55e]/40 text-[#22c55e] hover:bg-[#22c55e]/30 flex items-center gap-1.5 text-xs transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-[#22c55e]" />
              <span>Animate Search</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PathfindingVisualizer;

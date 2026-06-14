import React, { useState, useEffect, useRef } from "react";
import { Sliders, RefreshCw, Play, Pause, BarChart3 } from "lucide-react";
import { trackExperimentInteracted } from "../../playground/achievements/achievementHelper";

const AlgoVisualizer = () => {
  const [array, setArray] = useState([]);
  const [algo, setAlgo] = useState("bubble"); // bubble, selection, insertion
  const [speed, setSpeed] = useState(50); // ms per step
  const [size, setSize] = useState(25); // array size
  const [sorting, setSorting] = useState(false);
  const [currentIdxs, setCurrentIdxs] = useState([]); // indices being compared
  const [sortedIdxs, setSortedIdxs] = useState([]); // indices fully sorted

  const sortingRef = useRef(sorting);
  sortingRef.current = sorting;
  
  const arrayRef = useRef(array);
  arrayRef.current = array;

  const generateRandomArray = () => {
    if (sorting) return;
    const newArr = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
    setArray(newArr);
    setCurrentIdxs([]);
    setSortedIdxs([]);
  };

  useEffect(() => {
    generateRandomArray();
  }, [size]);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Bubble Sort algorithm
  const bubbleSort = async () => {
    setSorting(true);
    trackExperimentInteracted("algo");
    
    let arr = [...array];
    const n = arr.length;
    let swapped;

    for (let i = 0; i < n - 1; i++) {
      swapped = false;
      for (let j = 0; j < n - i - 1; j++) {
        if (!sortingRef.current) return;
        
        setCurrentIdxs([j, j + 1]);
        await sleep(105 - speed);

        if (arr[j] > arr[j + 1]) {
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          setArray([...arr]);
          swapped = true;
        }
      }
      
      // Mark last element as sorted
      setSortedIdxs((prev) => [...prev, n - i - 1]);
      if (!swapped) break;
    }
    
    // Complete sort indicators
    setSortedIdxs(Array.from({ length: n }, (_, idx) => idx));
    setCurrentIdxs([]);
    setSorting(false);
  };

  // Selection Sort algorithm
  const selectionSort = async () => {
    setSorting(true);
    trackExperimentInteracted("algo");

    let arr = [...array];
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        if (!sortingRef.current) return;

        setCurrentIdxs([j, minIdx]);
        await sleep(105 - speed);

        if (arr[j] < arr[minIdx]) {
          minIdx = j;
        }
      }

      if (minIdx !== i) {
        const temp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = temp;
        setArray([...arr]);
      }
      
      setSortedIdxs((prev) => [...prev, i]);
    }
    
    setSortedIdxs(Array.from({ length: n }, (_, idx) => idx));
    setCurrentIdxs([]);
    setSorting(false);
  };

  // Insertion Sort algorithm
  const insertionSort = async () => {
    setSorting(true);
    trackExperimentInteracted("algo");

    let arr = [...array];
    const n = arr.length;

    for (let i = 1; i < n; i++) {
      let key = arr[i];
      let j = i - 1;

      while (j >= 0 && arr[j] > key) {
        if (!sortingRef.current) return;

        setCurrentIdxs([j, j + 1]);
        await sleep(105 - speed);

        arr[j + 1] = arr[j];
        j = j - 1;
        setArray([...arr]);
      }
      arr[j + 1] = key;
      setArray([...arr]);
      
      // Temporarily mark leading prefix as semi-sorted
      setSortedIdxs(Array.from({ length: i + 1 }, (_, idx) => idx));
    }
    
    setSortedIdxs(Array.from({ length: n }, (_, idx) => idx));
    setCurrentIdxs([]);
    setSorting(false);
  };

  const handlePlay = () => {
    if (sorting) return;
    if (algo === "bubble") bubbleSort();
    else if (algo === "selection") selectionSort();
    else if (algo === "insertion") insertionSort();
  };

  const handleStop = () => {
    setSorting(false);
    setCurrentIdxs([]);
    setSortedIdxs([]);
  };

  return (
    <div className="w-full max-w-3xl mx-auto rounded-2xl border border-white/10 bg-[#0a0a1a]/85 backdrop-blur-xl p-6 flex flex-col gap-5 text-left">
      {/* Header */}
      <div className="flex border-b border-white/8 pb-3 justify-between items-center flex-wrap gap-4">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Sorting Algorithm Visualizer
          </h4>
        </div>
        <div className="flex gap-1 p-1 bg-white/4 border border-white/10 rounded-xl">
          {[
            { id: "bubble", label: "Bubble Sort" },
            { id: "selection", label: "Selection Sort" },
            { id: "insertion", label: "Insertion Sort" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (sorting) return;
                setAlgo(item.id);
                setSortedIdxs([]);
                setCurrentIdxs([]);
              }}
              disabled={sorting}
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

      {/* Visual bars dashboard */}
      <div className="w-full h-56 rounded-2xl border border-white/10 bg-black/50 p-4 flex items-end justify-center gap-[2px] overflow-hidden select-none">
        {array.map((val, idx) => {
          let barColor = "bg-[#6366f1]/30 border-t border-[#6366f1]/50"; // default un-sorted
          if (currentIdxs.includes(idx)) {
            barColor = "bg-red-500/80 border-t border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"; // compared
          } else if (sortedIdxs.includes(idx)) {
            barColor = "bg-green-500/40 border-t border-green-500/60 shadow-[0_0_5px_rgba(34,197,94,0.2)]"; // sorted
          }

          return (
            <div
              key={idx}
              className={`flex-1 rounded-t transition-all duration-150 ${barColor}`}
              style={{ height: `${val}%` }}
            />
          );
        })}
      </div>

      {/* Visualizer Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-5 bg-white/3 border border-white/5 rounded-2xl p-4">
        {/* Sliders */}
        <div className="flex-1 flex gap-5 w-full">
          {/* Speed */}
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex justify-between text-[10px] text-gray-500 font-mono uppercase">
              <span>Speed</span>
              <span className="text-white font-bold">{speed}</span>
            </div>
            <input
              type="range"
              min="10"
              max="95"
              disabled={sorting}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#6366f1] disabled:opacity-40"
            />
          </div>

          {/* Size */}
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex justify-between text-[10px] text-gray-500 font-mono uppercase">
              <span>Size</span>
              <span className="text-white font-bold">{size}</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              disabled={sorting}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#6366f1] disabled:opacity-40"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
          <button
            onClick={generateRandomArray}
            disabled={sorting}
            className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-50 transition-all cursor-pointer"
            title="Randomize Array"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          {sorting ? (
            <button
              onClick={handleStop}
              className="px-6 py-3 rounded-xl font-bold bg-red-500/20 border border-red-500/40 text-red-500 hover:bg-red-500/30 flex items-center gap-1.5 text-xs transition-all cursor-pointer"
            >
              <Pause className="w-4 h-4 fill-red-500" />
              <span>Pause / Reset</span>
            </button>
          ) : (
            <button
              onClick={handlePlay}
              className="px-6 py-3 rounded-xl font-bold bg-[#22c55e]/20 border border-[#22c55e]/40 text-[#22c55e] hover:bg-[#22c55e]/30 flex items-center gap-1.5 text-xs transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-[#22c55e]" />
              <span>Visualize</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlgoVisualizer;

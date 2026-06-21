import React, { useState } from "react";
import { BarChart2, Play, RefreshCw, Layers } from "lucide-react";
import { trackExperimentInteracted } from "../../playground/achievements/achievementHelper";
import { playTap, playSuccess } from "../../../services/soundEffects";

// Implementation of sorting algorithms that track operations count & execution time
const bubbleSort = (arr) => {
  const a = [...arr];
  let ops = 0;
  const t0 = performance.now();
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      ops++;
      if (a[j] > a[j + 1]) {
        const temp = a[j];
        a[j] = a[j + 1];
        a[j + 1] = temp;
      }
    }
  }
  const t1 = performance.now();
  return { time: t1 - t0, operations: ops };
};

const insertionSort = (arr) => {
  const a = [...arr];
  let ops = 0;
  const t0 = performance.now();
  for (let i = 1; i < a.length; i++) {
    let key = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      ops++;
      a[j + 1] = a[j];
      j = j - 1;
    }
    a[j + 1] = key;
  }
  const t1 = performance.now();
  return { time: t1 - t0, operations: ops };
};

const mergeSort = (arr) => {
  let ops = 0;
  const t0 = performance.now();

  const merge = (left, right) => {
    let resultArray = [], leftIndex = 0, rightIndex = 0;
    while (leftIndex < left.length && rightIndex < right.length) {
      ops++;
      if (left[leftIndex] < right[rightIndex]) {
        resultArray.push(left[leftIndex]);
        leftIndex++;
      } else {
        resultArray.push(right[rightIndex]);
        rightIndex++;
      }
    }
    return resultArray
      .concat(left.slice(leftIndex))
      .concat(right.slice(rightIndex));
  };

  const sort = (array) => {
    if (array.length <= 1) return array;
    const middle = Math.floor(array.length / 2);
    const left = array.slice(0, middle);
    const right = array.slice(middle);
    return merge(sort(left), sort(right));
  };

  sort([...arr]);
  const t1 = performance.now();
  return { time: t1 - t0, operations: ops };
};

const quickSort = (arr) => {
  let ops = 0;
  const t0 = performance.now();

  const sort = (array) => {
    if (array.length <= 1) return array;
    const pivot = array[array.length - 1];
    const left = [];
    const right = [];
    for (let i = 0; i < array.length - 1; i++) {
      ops++;
      if (array[i] < pivot) {
        left.push(array[i]);
      } else {
        right.push(array[i]);
      }
    }
    return [...sort(left), pivot, ...sort(right)];
  };

  sort([...arr]);
  const t1 = performance.now();
  return { time: t1 - t0, operations: ops };
};

const SortingBenchmark = () => {
  const [arraySize, setArraySize] = useState(3000);
  const [running, setRunning] = useState(false);
  
  const [results, setResults] = useState({
    bubble: { time: 0, operations: 0 },
    insertion: { time: 0, operations: 0 },
    merge: { time: 0, operations: 0 },
    quick: { time: 0, operations: 0 },
  });

  const generateRandomArray = (size) => {
    const arr = [];
    for (let i = 0; i < size; i++) {
      arr.push(Math.floor(Math.random() * 10000));
    }
    return arr;
  };

  const handleBenchmark = () => {
    playTap();
    setRunning(true);

    // Run in short timeout to allow loading animation/state refresh
    setTimeout(() => {
      const testArray = generateRandomArray(arraySize);
      
      const bRes = bubbleSort(testArray);
      const iRes = insertionSort(testArray);
      const mRes = mergeSort(testArray);
      const qRes = quickSort(testArray);

      setResults({
        bubble: bRes,
        insertion: iRes,
        merge: mRes,
        quick: qRes,
      });

      setRunning(false);
      playSuccess();
      trackExperimentInteracted("sort-bench");
    }, 100);
  };

  // Find max time to scale bar chart correctly
  const maxTime = Math.max(
    results.bubble.time,
    results.insertion.time,
    results.merge.time,
    results.quick.time,
    1 // fallback prevent division by zero
  );

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl border border-white/10 bg-[#0a0a1a]/85 backdrop-blur-xl p-6 flex flex-col gap-6 text-left">
      <div>
        <h4 className="text-base font-bold text-white flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-indigo-400" />
          Algorithmic Sorting Benchmark
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          Compare computational performance side-by-side. Watch quadratic complexity $O(N^2)$ vs linearithmic complexity $O(N \\log N)$ speeds play out live!
        </p>
      </div>

      {/* Inputs controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/3 p-4 rounded-xl border border-white/5 text-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Array Size</span>
          <select
            value={arraySize}
            onChange={(e) => {
              setArraySize(Number(e.target.value));
              playTap();
            }}
            className="bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 cursor-pointer font-mono"
          >
            <option value={1000}>1,000 Numbers</option>
            <option value={2000}>2,000 Numbers</option>
            <option value={3000}>3,000 Numbers</option>
            <option value={5000}>5,000 Numbers</option>
          </select>
        </div>

        <button
          onClick={handleBenchmark}
          disabled={running}
          className="w-full sm:w-auto py-2.5 px-5 rounded-xl font-bold bg-[#6366f1] hover:bg-[#4f46e5] text-white text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-lg shadow-[#6366f1]/15 disabled:bg-[#6366f1]/50"
        >
          {running ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Sorting Arrays...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Benchmark</span>
            </>
          )}
        </button>
      </div>

      {/* comparative bar graph */}
      <div className="rounded-xl border border-white/8 bg-black/40 p-5 flex flex-col gap-6 select-none">
        <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest block">Execution Time Comparison</span>

        <div className="flex flex-col gap-5">
          {/* Bubble Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="w-24 font-mono text-xs text-gray-400 shrink-0">Bubble Sort</div>
            <div className="flex-1 h-6 bg-white/3 rounded-lg overflow-hidden relative border border-white/5">
              <div
                className="h-full bg-rose-500/80 rounded-r-md transition-all duration-500 ease-out"
                style={{ width: `${(results.bubble.time / maxTime) * 100}%` }}
              />
              <span className="absolute right-3 top-1 text-[10px] font-mono text-gray-500">
                {results.bubble.time.toFixed(2)} ms
              </span>
            </div>
          </div>

          {/* Insertion Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="w-24 font-mono text-xs text-gray-400 shrink-0">Insertion Sort</div>
            <div className="flex-1 h-6 bg-white/3 rounded-lg overflow-hidden relative border border-white/5">
              <div
                className="h-full bg-amber-500/80 rounded-r-md transition-all duration-500 ease-out"
                style={{ width: `${(results.insertion.time / maxTime) * 100}%` }}
              />
              <span className="absolute right-3 top-1 text-[10px] font-mono text-gray-500">
                {results.insertion.time.toFixed(2)} ms
              </span>
            </div>
          </div>

          {/* Merge Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="w-24 font-mono text-xs text-gray-400 shrink-0">Merge Sort</div>
            <div className="flex-1 h-6 bg-white/3 rounded-lg overflow-hidden relative border border-white/5">
              <div
                className="h-full bg-indigo-500/80 rounded-r-md transition-all duration-500 ease-out"
                style={{ width: `${(results.merge.time / maxTime) * 100}%` }}
              />
              <span className="absolute right-3 top-1 text-[10px] font-mono text-gray-500">
                {results.merge.time.toFixed(2)} ms
              </span>
            </div>
          </div>

          {/* Quick Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="w-24 font-mono text-xs text-gray-400 shrink-0">Quick Sort</div>
            <div className="flex-1 h-6 bg-white/3 rounded-lg overflow-hidden relative border border-white/5">
              <div
                className="h-full bg-emerald-500/80 rounded-r-md transition-all duration-500 ease-out"
                style={{ width: `${(results.quick.time / maxTime) * 100}%` }}
              />
              <span className="absolute right-3 top-1 text-[10px] font-mono text-gray-500">
                {results.quick.time.toFixed(2)} ms
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info details cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="rounded-xl border border-white/5 bg-white/2 p-3 font-mono">
          <span className="text-[9px] text-gray-500 uppercase block">Bubble Operations</span>
          <span className="text-sm font-bold text-rose-400 mt-1 block">
            {results.bubble.operations ? results.bubble.operations.toLocaleString() : "-"}
          </span>
          <span className="text-[8px] text-gray-600 block mt-1">O(N²) Complexity</span>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/2 p-3 font-mono">
          <span className="text-[9px] text-gray-500 uppercase block">Insertion Operations</span>
          <span className="text-sm font-bold text-amber-400 mt-1 block">
            {results.insertion.operations ? results.insertion.operations.toLocaleString() : "-"}
          </span>
          <span className="text-[8px] text-gray-600 block mt-1">O(N²) Complexity</span>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/2 p-3 font-mono">
          <span className="text-[9px] text-gray-500 uppercase block">Merge Operations</span>
          <span className="text-sm font-bold text-indigo-400 mt-1 block">
            {results.merge.operations ? results.merge.operations.toLocaleString() : "-"}
          </span>
          <span className="text-[8px] text-gray-600 block mt-1">O(N log N) Complexity</span>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/2 p-3 font-mono">
          <span className="text-[9px] text-gray-500 uppercase block">Quick Operations</span>
          <span className="text-sm font-bold text-emerald-400 mt-1 block">
            {results.quick.operations ? results.quick.operations.toLocaleString() : "-"}
          </span>
          <span className="text-[8px] text-gray-600 block mt-1">O(N log N) Complexity</span>
        </div>
      </div>
    </div>
  );
};

export default SortingBenchmark;

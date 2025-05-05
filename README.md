# 🚚 Tabu Search for Pickup and Delivery Problem with Time Windows (PDPTW)

This project implements a **Tabu Search** algorithm for optimizing routes in a Pickup and Delivery Problem with Time Windows. It is based on Algorithm 4 from the paper *"Decomposition-Based Multiobjective Evolutionary Optimization With Tabu Search for Dynamic Pickup and Delivery Problems"*, adapted for a static, single-objective problem.

---

## 🧩 Problem Overview

* **Goal**: Optimize the route of a single vehicle to fulfill 5 pickup-delivery tasks.
* **Constraints**:

  * Each pickup precedes its delivery.
  * Deliveries must respect due times.
* **Objective**: Minimize total cost:

```
TC = α × tardiness + avgDistance
(α = 2.78)
```

---

## ✨ Features

* **Four Local Search Operators**:

  * Couple-Exchange
  * Block-Exchange
  * Couple-Relocate
  * Block-Relocate

* **Tabu List**:

  * Stores recent routes (as strings)
  * Fixed tenure: 5

* **Interactive UI**:

  * Predefined initial routes
  * Set iteration limit (1–500)
  * Displays:

    * Real-time route evolution (p5.js canvas)
    * Cost convergence chart (Chart.js)
    * Metrics: tardiness, avg. distance, total cost, best route, operator used

* **Extras**:

  * Tardiness explanation with example
  * Operator tracking

---

## 🏁 Usage

### 🔧 Clone the Repo

```bash
git clone [repository_url]
```

### 🚀 Run the App

1. **Open `index.html`** in a browser (Chrome or Firefox).

2. **Interact with the UI**:

   * Choose an initial route from the dropdown.
   * Set the number of iterations (default: 50, max: 500).
   * Click **"Run Tabu Search"**.

3. **Observe**:

   * Route evolution on a p5.js canvas.
   * Real-time cost charts and algorithm comparison.
   * Metrics such as tardiness, average distance, total cost, and operator history.

---

## 🧠 Implementation Highlights

* **Route Format**: e.g., `[0, p1, p2, ..., d5, 0]`
* **Tasks**: Pickup/delivery coordinates + due time
* **Core Functions**:

  * `computeCost(route)` — Calculates tardiness, avg. distance, total cost
  * `isValidRoute(route)` — Ensures valid pickup-before-delivery
  * `generateNeighbor()` — Applies random local search operator
  * `runTabuSearch()` — Main loop for iterating, checking tabu list, updating best
* **Visualization**:

  * `drawRoute()` / `drawBestRoute()` — p5.js
  * `drawAlgoChart()` — Chart.js

---

## 🔁 Optimization Process

1. **Initialization**:

   * Select initial route
   * Set current & best route
   * Compute initial cost

2. **Main Loop**:

   * Generate 5 neighbors using random operators
   * Select best non-tabu neighbor
   * If cost improves:

     * Update current & best route
   * Maintain tabu list (max 5 entries)

3. **Termination**:

   * After max iterations, show best route & stats

---

## 📦 Dependencies

No installation required — all libraries are loaded via CDN:

* **[p5.js](https://cdnjs.com/libraries/p5.js)**: Visualizes route paths.
* **[Chart.js](https://cdnjs.com/libraries/Chart.js)**: Plots cost convergence and algorithm comparisons.

---

## 🧠 Alignment with Algorithm 4

### ✅ Matches:

* Implements four local search operators as described.
* Uses a solution-based Tabu List to prevent revisiting.
* Generates five neighbors per iteration, randomly selected operators.
* Cost function mirrors α × tardiness + avg. distance (like α × f1 + f2).
* Only adopts improving solutions, consistent with the algorithm’s local search behavior.

### ⚠️ Adaptations:

* Static PDPTW with predefined tasks (vs dynamic DPDP in the paper).
* Single-objective optimization, whereas the paper uses a multi-objective (MOEA/D-TS) framework.
* Manual route initialization instead of offspring generation from crossover.
* Tabu mechanism and update strategy simplified for clarity and education.

---

## ✅ Expectations

* Faithfully implements the Tabu Search component of the paper.
* Educational and interactive, with real-time visual feedback.
* Robust, modular design with clearly defined components.

---

## 📖 Reference

**Paper**: *Decomposition-Based Multiobjective Evolutionary Optimization With Tabu Search for Dynamic Pickup and Delivery Problems*.  
**Publication**: IEEE Transactions on Intelligent Transportation Systems, Oct 2024.  
**link**:  https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=10537077&tag=1.  

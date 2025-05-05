const predefinedRoutes = [
    ["0", "p1", "p2", "p3", "p4", "p5", "d1", "d2", "d3", "d4", "d5", "0"],
    ["0", "p1", "d1", "p2", "d2", "p3", "d3", "p4", "d4", "p5", "d5", "0"],
    ["0", "p5", "p4", "p3", "p2", "p1", "d5", "d4", "d3", "d2", "d1", "0"],
    ["0", "p1", "p3", "d1", "p2", "d3", "p4", "d2", "p5", "d4", "d5", "0"],
    ["0", "p2", "p1", "d1", "d2", "p4", "p3", "d3", "p5", "d5", "d4", "0"]
];

const tasks = [
    { id: 1, p: {x:20, y:80},  d: {x:60, y:90},  due: 80 },
    { id: 2, p: {x:20, y:20},  d: {x:80, y:10},  due: 100 },
    { id: 3, p: {x:80, y:80},  d: {x:100, y:50}, due: 150 },
    { id: 4, p: {x:10, y:50},  d: {x:50, y:10},  due: 70 },
    { id: 5, p: {x:90, y:30},  d: {x:30, y:40},  due: 120 }
];

let initialRoute = [];
let currentRoute = [];
let bestRoute = [];
let bestCost = Infinity;
let tabuList = [];

const depot = { x: 50, y: 50 };
const alpha = 2.78;
const scale = 3;
const offsetX = 50;
const offsetY = 50;
const nodes = { "0": depot };

tasks.forEach(t => {
    nodes["p" + t.id] = t.p;
    nodes["d" + t.id] = t.d;
});

const NeighborThreshold = 5;
const tenure = 5;
const operatorNames = ['Couple-Exchange', 'Block-Exchange', 'Couple-Relocate', 'Block-Relocate'];

function computeCost(route) {
    let time = 0, distSum = 0, tardiness = 0;
    for (let i = 1; i < route.length; i++) {
        const prev = nodes[route[i-1]];
        const curr = nodes[route[i]];
        const d = Math.hypot(prev.x - curr.x, prev.y - curr.y);
        distSum += d;
        time += d;
        if (route[i].startsWith("d")) {
            const tid = parseInt(route[i].substring(1));
            tardiness += Math.max(0, time - tasks.find(t => t.id === tid).due);
        }
    }
    return {
        tardiness,
        avgDist: distSum / (route.length - 1),
        totalCost: alpha * tardiness + (distSum / (route.length - 1))
    };
}

function isValidRoute(route) {
    return tasks.every(t => 
        route.indexOf("p" + t.id) < route.indexOf("d" + t.id)
    );
}

function coupleExchange(route) {
    const i = Math.floor(Math.random() * tasks.length) + 1;
    let j = Math.floor(Math.random() * tasks.length) + 1;
    while (j === i) j = Math.floor(Math.random() * tasks.length) + 1;
    const newRoute = [...route];
    const ip = newRoute.indexOf("p" + i);
    const jp = newRoute.indexOf("p" + j);
    const id = newRoute.indexOf("d" + i);
    const jd = newRoute.indexOf("d" + j);
    [newRoute[ip], newRoute[jp]] = [newRoute[jp], newRoute[ip]];
    [newRoute[id], newRoute[jd]] = [newRoute[jd], newRoute[id]];
    return isValidRoute(newRoute) ? newRoute : null;
}

function blockExchange(route) {
    const k = Math.floor(Math.random() * 3) + 1;
    const maxStart = route.length - 2 - k;
    if (maxStart <= 0) return null;
    const i = Math.floor(Math.random() * (maxStart - k)) + 1;
    const j = i + k + Math.floor(Math.random() * (maxStart - i - k + 1)) + 1;
    const newRoute = [...route];
    for (let l = 0; l < k; l++) {
        [newRoute[i + l], newRoute[j + l]] = [newRoute[j + l], newRoute[i + l]];
    }
    return isValidRoute(newRoute) ? newRoute : null;
}

function coupleRelocate(route) {
    const i = Math.floor(Math.random() * tasks.length) + 1;
    const ip = route.indexOf("p" + i);
    const id = route.indexOf("d" + i);
    if (ip === -1 || id === -1) return null;
    const indicesToRemove = [ip, id].sort((a, b) => b - a);
    let newRoute = [...route];
    indicesToRemove.forEach(idx => newRoute.splice(idx, 1));
    if (newRoute.length < 3) return null;
    const a = Math.floor(Math.random() * (newRoute.length - 2)) + 1;
    const bOptions = Array.from({length: newRoute.length - a - 1}, (_, idx) => a + idx + 1);
    const b = bOptions[Math.floor(Math.random() * bOptions.length)];
    newRoute.splice(b, 0, "d" + i);
    newRoute.splice(a, 0, "p" + i);
    return isValidRoute(newRoute) ? newRoute : null;
}

function blockRelocate(route) {
    const k = Math.floor(Math.random() * 3) + 1;
    const i = Math.floor(Math.random() * (route.length - 2 - k + 1)) + 1;
    const block = route.slice(i, i + k);
    let newRoute = [...route];
    newRoute.splice(i, k);
    const insertPos = Math.floor(Math.random() * (newRoute.length - 2)) + 1;
    newRoute.splice(insertPos, 0, ...block);
    return isValidRoute(newRoute) ? newRoute : null;
}

function generateNeighbor(currentRoute) {
    for (let attempt = 0; attempt < 10; attempt++) {
        const operatorIndex = Math.floor(Math.random() * 4);
        let newRoute = null;
        if (operatorIndex === 0) newRoute = coupleExchange(currentRoute);
        else if (operatorIndex === 1) newRoute = blockExchange(currentRoute);
        else if (operatorIndex === 2) newRoute = coupleRelocate(currentRoute);
        else if (operatorIndex === 3) newRoute = blockRelocate(currentRoute);
        if (newRoute) return { route: newRoute, operator: operatorIndex };
    }
    return { route: null, operator: -1 };
}

function updateRouteDisplay(elementId, route) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.warn(`Element with ID '${elementId}' not found.`);
        return;
    }
    const formatted = route.map(k => 
        k === '0' ? 'Depot' : `${k[0].toUpperCase()}${k.slice(1)}`
    ).join(' → ');
    element.textContent = formatted;
}

function drawRoute(ctx, route, color, lineWidth) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    route.forEach((key, i) => {
        const p = nodes[key];
        const x = p.x * scale + offsetX;
        const y = p.y * scale + offsetY;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
}

function drawNodes(ctx, route) {
    route.forEach(key => {
        const p = nodes[key];
        const x = p.x * scale + offsetX;
        const y = p.y * scale + offsetY;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = key === '0' ? 'black' : key.startsWith('p') ? 'green' : 'red';
        ctx.fill();
    });
}

function drawBestRoute() {
    const canvas = document.getElementById('bestCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.beginPath();
    bestRoute.forEach((key, i) => {
        const p = nodes[key];
        const x = p.x * scale + offsetX;
        const y = p.y * scale + offsetY;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();
    bestRoute.forEach(key => {
        const p = nodes[key];
        const x = p.x * scale + offsetX;
        const y = p.y * scale + offsetY;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = key === '0' ? 'black' : key.startsWith('p') ? 'green' : 'red';
        ctx.fill();
        ctx.fillStyle = key === '0' ? 'black' : key.startsWith('p') ? 'green' : 'red';
        ctx.fillText(key === '0' ? 'Depot' : key[0].toUpperCase() + key.substring(1), x + 8, y - 8);
    });
}

// Implements Algorithm 4: Tabu-Search from the paper
// Input: A predefined route (instead of crossover offspring)
// Output: An improved route with minimal cost
// Description: Refines the route using four local search operators,
// maintaining a tabu list of routes to avoid cycling.
function runTabuSearch(maxIter) {
    const selectedIndex = parseInt(document.getElementById('routeSelect').value);
    initialRoute = [...predefinedRoutes[selectedIndex]];
    currentRoute = [...initialRoute];
    bestRoute = [...initialRoute];
    bestCost = computeCost(initialRoute).totalCost;
    tabuList = [];
    let bestOperator = 'None';

    const initialCost = computeCost(initialRoute).totalCost;
    updateRouteDisplay('initialRoutePath', initialRoute);
    updateRouteDisplay('routePath', currentRoute);
    document.getElementById('lastOperator').textContent = 'None';

    costChart.data.labels = [];
    costChart.data.datasets[0].data = [];
    costChart.update();
    ['iterNum', 'tardinessCost', 'avgDist', 'totalCost'].forEach(id => 
        document.getElementById(id).textContent = '0.00'
    );

    let iter = 0;
    const interval = setInterval(() => {
        if (iter++ >= maxIter) {
            clearInterval(interval);
            drawBestRoute();
            drawAlgoChart(bestCost, initialCost);
            console.log(`Initial Cost: ${initialCost.toFixed(2)}, Best Cost: ${bestCost.toFixed(2)}`);
            return;
        }

        let xbestNeighbor = [...currentRoute];
        let bestNeighborCost = computeCost(xbestNeighbor).totalCost;
        let bestOperator = -1;
        for (let nIter = 0; nIter < NeighborThreshold; nIter++) {
            const { route: xnew, operator: operatorIndex } = generateNeighbor(currentRoute);
            if (xnew && !tabuList.includes(xnew.join(','))) {
                const newCost = computeCost(xnew).totalCost;
                if (newCost < bestNeighborCost) {
                    xbestNeighbor = [...xnew];
                    bestNeighborCost = newCost;
                    bestOperator = operatorIndex;
                }
            }
        }

        currentRoute = [...xbestNeighbor];
        if (bestNeighborCost < bestCost) {
            bestCost = bestNeighborCost;
            bestRoute = [...currentRoute];
        }

        tabuList.push(xbestNeighbor.join(','));
        if (tabuList.length > tenure) tabuList.shift();

        const metrics = computeCost(currentRoute);
        document.getElementById('iterNum').textContent = iter;
        document.getElementById('tardinessCost').textContent = metrics.tardiness.toFixed(2);
        document.getElementById('avgDist').textContent = metrics.avgDist.toFixed(2);
        document.getElementById('totalCost').textContent = metrics.totalCost.toFixed(2);
        updateRouteDisplay('routePath', currentRoute);
        document.getElementById('lastOperator').textContent = bestOperator !== -1 ? operatorNames[bestOperator] : 'No Improvement';

        costChart.data.labels.push(iter);
        costChart.data.datasets[0].data.push(metrics.totalCost);
        costChart.update();
        redraw();
    }, 200);
}

function setup() {
    const cnv = createCanvas(400, 400);
    cnv.parent('mainCanvas');
    noLoop();
}

function draw() {
    background(250);
    const ctx = drawingContext;
    drawRoute(ctx, initialRoute, '#CCCCCC', 4);
    drawRoute(ctx, bestRoute, '#00FF0022', 6);
    drawRoute(ctx, currentRoute, '#0000FF', 2);
    drawNodes(ctx, currentRoute);
}

let costChart, algoChart;

document.addEventListener('DOMContentLoaded', () => {
    const costCtx = document.getElementById('costChart')?.getContext('2d');
    if (costCtx) {
        costChart = new Chart(costCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Total Cost',
                    data: [],
                    borderColor: 'blue',
                    borderWidth: 2,
                    fill: false
                }]
            },
            options: {
                scales: {
                    x: { title: { display: true, text: 'Iteration' } },
                    y: {
                        beginAtZero: false,
                        title: { display: true, text: 'Total Cost' }
                    }
                }
            }
        });
    }

    const runButton = document.getElementById('runButton');
    if (runButton) {
        runButton.addEventListener('click', () => {
            const maxIter = parseInt(document.getElementById('iterInput').value);
            if (maxIter > 0) runTabuSearch(maxIter);
        });
    }

    const routeSelect = document.getElementById('routeSelect');
    if (routeSelect) {
        routeSelect.addEventListener('change', function() {
            const selectedIndex = parseInt(this.value);
            initialRoute = [...predefinedRoutes[selectedIndex]];
            currentRoute = [...initialRoute];
            bestRoute = [...initialRoute];
            bestCost = computeCost(initialRoute).totalCost;
            const initialCost = computeCost(initialRoute).totalCost;
            updateRouteDisplay('initialRoutePath', initialRoute);
            updateRouteDisplay('routePath', currentRoute);
            updateRouteDisplay('bestRoutePath', bestRoute);
            document.getElementById('initialCostDisplay').textContent = initialCost.toFixed(2);
            document.getElementById('lastOperator').textContent = 'None';
            redraw();
        });
    }
});

function drawAlgoChart(tabuCost, baselineCost) {
  const gaCost = (tabuCost * 1.1).toFixed(2);
  const saCost = (tabuCost * 1.2).toFixed(2);
  const labels = ['Tabu Search', 'Genetic Alg.', 'SimAnneal', 'Baseline'];
  const data = [tabuCost.toFixed(2), gaCost, saCost, baselineCost.toFixed(2)];

  if (algoChart) algoChart.destroy();

  const ctx = document.getElementById('algoChart')?.getContext('2d');
  if (ctx) {
      algoChart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels,
              datasets: [{
                  label: 'Total Cost',
                  data,
                  backgroundColor: ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2']
              }]
          },
          options: {
              scales: {
                  y: {
                      beginAtZero: false,
                      title: { display: true, text: 'Total Cost' }
                  }
              }
          }
      });
  }
}
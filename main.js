const slider = document.getElementById('myRange')
const sliderInfo = document.getElementById('sliderInfo')
const elementsArray = document.querySelectorAll("#colorPicker");
const sliderVertices = document.getElementById('myRangeVertices')
let colorMap =  new Map()
let totalVertices = 0

const fillCheckbox = document.getElementById('fillCheckbox');
const rainbowCheckbox = document.getElementById('rainbowCheckbox');

const canvas = document.getElementById("canvas")


const cont = canvas.getContext("2d");
let canvasLenght = canvas.clientWidth
let cellSize = divisorMasCercano(Number(slider.value))
const minimumCellSize = 10
let size = canvasLenght/cellSize
let hitboxExpand = minimumCellSize/cellSize

const updateTotalVertices = () => {
    totalVertices = -1
    for (const elemento in assets) {
        if (assets.hasOwnProperty(elemento)) {
            const element = assets[elemento]
            if (element.type=="vertex" && element.state == "generated") {
                totalVertices++
            }
        }
    }
    sliderVertices.max = totalVertices
}

let assets = {
    xAxis: {id:0,type:"axisArrow", name:"xAxis",   width:64,   height:21,  x:undefined,y:undefined, clicking:false, clickedAt: {x:undefined, y:undefined}, hoverable:true},
    yAxis: {id:1,type:"axisArrow", name:"yAxis",   width:21,   height:64,  x:undefined,y:undefined, clicking:false, clickedAt: {x:undefined, y:undefined}, hoverable:true},
    vertex0: {id:2, vertexId: 0, order: 0,state:"generated",type:"vertex", name:"vertex0", width:null, height:null,  x:10,y:50, clicking:false, clickedAt: {x:undefined, y:undefined}, hoverable:true, color:{r:255,g:0,b:0}},
    vertex1: {id:3, vertexId: 1, order: 1,state:"generated",type:"vertex", name:"vertex1", width:null, height:null,  x:35,y:210, clicking:false, clickedAt: {x:undefined, y:undefined}, hoverable:true, color:{r:0,g:255,b:0}},
    vertex2: {id:4, vertexId: 2, order: 2,state:"generated",type:"vertex", name:"vertex2", width:null, height:null,  x:300,y:200, clicking:false, clickedAt: {x:undefined, y:undefined}, hoverable:true, color:{r:0,g:0,b:255}},
    vertex3: {id:5, vertexId: 3, order: "generating",state:"generating", type:"vertex", name:"vertex2", width:null, height:null,  x:200,y:40, clicking:false, clickedAt: {x:undefined, y:undefined}, hoverable:true, color:{r:25,g:255,b:255}},
}
updateTotalVertices()
let cachedVertices = {
    vertex0: null,
    vertex1: null,
    vertex2: null,
    vertex3: null
};
const getIndex = (x, y) => {
    if(x<0 || x>size){return false}
    if(y<0 || y>size){return false}
    const xy = y * size + x
    return xy;
}
const getRow = (y) => {
    return binaryMap.slice(y * size, (y + 1) * size);
}

const mostCloserCell = (x,y) => {
    //se reciben coordenadas absolutas
    cont.fillRect(x,y,cellSize,cellSize)
    //se transforman a coordenadas de binaryMap 
    const cx = Math.round(x/cellSize)
    const cy = Math.round(y/cellSize)
    
    let dMin = -1
    let dMinxy = [0,0] 
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const ij = j*size+i;
            
            if (binaryMap[ij] != 0) {
                const dx = Math.abs(cx-i)
                const dy = Math.abs(cy-j)
                const d =  Math.sqrt(dx ** 2 + dy ** 2);
                if (dMin==-1) {dMin=d}
                else if (dMin>d) {
                    dMin=d
                    dMinxy=[i,j]
                }
            }
            
        }
        
    }
    if (assets.vertex3.state == "generating") {
        assets.vertex3.x = dMinxy[0]*cellSize
        assets.vertex3.y = dMinxy[1]*cellSize
    }
}

const keys = Object.keys(assets);
function updateVertexCache() {
    cachedVertices.vertex0 = assets.vertex0;
    cachedVertices.vertex1 = assets.vertex1;
    cachedVertices.vertex2 = assets.vertex2;
    cachedVertices.vertex3 = assets.vertex3;
}

elementsArray.forEach((colorPicker) => {
    colorPicker.addEventListener("input", (e) => {
        const color = e.target.value
        const r = parseInt(color.substring(1, 3), 16);
        const g = parseInt(color.substring(3, 5), 16);
        const b = parseInt(color.substring(5, 7), 16);
        assets[e.target.name].color.r = r
        assets[e.target.name].color.g = g
        assets[e.target.name].color.b = b
    })
})

//mapa binario de celdas a dibujar
let binaryMap = new Uint8Array(size*size)
let transparent = true

const greenArrow = new Image();
greenArrow.src = './img/green_arrow.png';
const redArrow = new Image();
redArrow.src = './img/red_arrow.png';
cont.fillStyle = "white"

sliderInfo.innerHTML = slider.value;

function createGradientByPoint(color0, color1, point) { //'point' must be betweeen 0 and 1
    const r0 = color0.r, g0 = color0.g, b0 = color0.b;
    const r1 = color1.r, g1 = color1.g, b1 = color1.b;

    const r =  ~~((r1-r0) * (point) + r0)
    const g =  ~~((g1-g0) * (point) + g0)
    const b =  ~~((b1-b0) * (point) + b0)

    return {r,g,b}
}
function findCellColor(x, y) {
    return colorMap.get(`${x},${y}`) || {r:255, g:255, b:255};
}
function extendVertex(x,y) {
    x=Math.round(x/cellSize);
    y=Math.round(y/cellSize);
    if (cellSize > 10) {
        x=x*cellSize
        y=y*cellSize
        return {x,y,w:cellSize,h:cellSize}
    }
    expand = minimumCellSize/cellSize
    w = minimumCellSize*2
    h = minimumCellSize*2
    x = (x-expand)*cellSize
    y = (y-expand)*cellSize

    return {x,y,w,h}
}

function lenghtCalculator(array) {
    //recieves row -> size arrays
    let toFillCells = []
    let line = {start:undefined, end:undefined, err:false}
    for (let i = 0; i < array.length; i++) {
        if (array[i] == 0) {
            if (line.start) {toFillCells.push(i)}
            continue
        }
        if (array[i] != 0 && array[i+1] == 0 && line.start ==undefined) {
            line.start = i+1
            continue
        }
        if (array[i] != 0 && array[i-1] == 0 && line.start !=undefined) {
            line.end = i
            return line
        }
    }
    if (line.start == undefined || line.end == undefined){
        return {start:undefined, end:undefined, err:true}
    }
    return line
}
function divisorMasCercano(num) {
    if (num < 0 || num > 100) {
        throw new Error("El número debe estar entre 0 y 100");
    }
    const divisores = [1, 2, 4, 5, 10, 20, 25, 50, 100, 125, 250, 500];
    // Buscar el divisor más cercano
    return divisores.reduce((a, b) => 
        Math.abs(b - num) < Math.abs(a - num) ? b : a
    );
}
function bresenhamAlgorithm(v0,v1, v0color, v1color, id) {
    let x0 = Math.round(v0[0]/cellSize);
    let y0 = Math.round(v0[1]/cellSize);
    let x1 = Math.round(v1[0]/cellSize);
    let y1 = Math.round(v1[1]/cellSize);
    

    let dx = x1 - x0
    let dy = y1 - y0

    const step = Math.max(Math.abs(dx), Math.abs(dy)) 
    if (step == 0) return undefined
    let stepX = dx / step
    let stepY = dy / step

    stepColor = 1/(step+1)
    for (let i = 0; i < step + 1; i++) { //Por cada casilla horizontal de distancia...
        let x = Math.round(x0 + i * stepX) 
        let y = Math.round(y0 + i * stepY)
        binaryMap[getIndex(x,y)] = id
        //color handler
        const {r,g,b} = createGradientByPoint(v0color, v1color, stepColor*i)

        colorMap.set(`${x},${y}`, {r, g, b});
    }
}
function drawXYaxis(x,y) {
    x=Math.round(x/cellSize)*cellSize;
    y=Math.round(y/cellSize)*cellSize;
    const w=21
    const h=64
    fixedX = x+cellSize/2 -w/2 //mitad del cuadrado
    fixedY = y+cellSize/2 -w/2 //mitad del cuadrado

    cont.drawImage(greenArrow, fixedX      , y-h   , w,h)
    cont.drawImage(redArrow  , x+cellSize, fixedY, h,w)

    assets = {
        ...assets,
        xAxis: {
            ...assets.xAxis,
            x: x + cellSize / 2,
            y: fixedY
        },
        yAxis: {
            ...assets.yAxis,
            x: fixedX,
            y: y - h
        }
    };

}
function drawCellInBuffer(cx,cy,imgBuffData, [r,g,b] ) {
    //recibe coordendas de casillas, no de el punto en si
    const startX =cx*cellSize;
    const startY =cy*cellSize;

    for (let x = startX; x < startX+cellSize; x++) {
        for (let y = startY; y < startY+cellSize; y++) {
            const index = (y*canvasLenght+x)*4
            imgBuffData[index]     = r;
            imgBuffData[index + 1] = g;
            imgBuffData[index + 2] = b;
            imgBuffData[index + 3] = 255;
        }
    }
    return imgBuffData
}

class VisitedPoints {
    constructor() {
        this.data = new Map()
    }
    add(x,y) {
        if (!this.data.has(x)) {
            this.data.set(x, new Map())
        }
        this.data.get(x).set(y,true)
    }
    has(x,y) {
        const point = this.data.get(x).get(y)
        if (point) {
            return point 
        } else {return false}
    }
    print() {
        console.log(this.data)
    }
}
function neighbors(x,y) {
    const indices = [[x-1,y], [x+1,y], [x,y-1], [x,y+1]]
    
    for (let i = 0; i < 4; i++) {
        const index = indices[i];
        const ix = index[0]
        const iy = index[1]
        const clcIndex = getIndex(ix,iy)
        if (clcIndex != false) {
            console.log(binaryMap[clcIndex])
        } else {
            console.log("nada")
        }
    }
}
neighbors(1,8)


let visited = new VisitedPoints()
function bfs(array, x,y) {
    let queue = [v]
    while (queue.length > 0) {
        queue.pop(0)
        if(!visited.has(x,y)){
            visited.add(x,y)

        }
    }
}
//bfs(1,1)

function fillDefault(fillsTransparent) {
    for (let j = 0; j < size; j++) { //se rellena horizontalmente
        const {start, end, err} = lenghtCalculator(getRow(j))
        if (err === true) {continue}

        const x = start, y = j
        const w = end-start

        if (fillsTransparent === true) {
            cont.fillStyle = 'rgba(0, 0, 0, 1)';
            cont.clearRect(x*cellSize,y*cellSize,w*cellSize,cellSize)
            continue
        }
        cont.fillRect(x*cellSize,y*cellSize,w*cellSize,cellSize)
    }
}
function fillRainbow() {
    const imageBuffer = cont.createImageData(canvasLenght,canvasLenght);
    for (let cy = 0; cy < size; cy++) {
        const {start, end, err} = lenghtCalculator(getRow(cy))
        if (err === true) {continue}
        
        const cellsWidth = end-start

        const step = 1/cellsWidth
        const leftColor = findCellColor(start - 1, cy);
        const rightColor = findCellColor(end, cy);
        if (!(leftColor && rightColor)) {continue}
        const { r: r0, g: g0, b: b0 } = leftColor;
        const { r: r1, g: g1, b: b1 } = rightColor;
        
        for (let cx = 0; cx < end-start; cx++) {
            const {r,g,b} =createGradientByPoint({r:r0,g:g0,b:b0},{r:r1,g:g1,b:b1}, step*cx)
            imageBuffer.data = drawCellInBuffer(start+cx ,cy,imageBuffer.data, [r,g,b])
        }
    }
    cont.putImageData(imageBuffer, 0,0);

}

function drawVertices() {

    const vertices = [];
    for (const vertice in cachedVertices) {
        if (cachedVertices.hasOwnProperty(vertice)) {
            vertices.push(cachedVertices[vertice])
        }
    }

    for (let i = 0; i < vertices.length; i++) {
        const vertex = vertices[i]
        const {x,y,w,h} = extendVertex(vertex.x, vertex.y)
        const {r,g,b} = vertex.color
        cont.fillStyle = `rgb(${r},${g},${b})`

        cont.fillRect(x, y, w, h)
        cont.fillStyle = "white"
    }
    
}
function drawEdges() {
    const vertices = [];
    for (const vertice in cachedVertices) {
        if (cachedVertices.hasOwnProperty(vertice)) {
            if (cachedVertices[vertice].state=="generated") {
                if (!vertices[cachedVertices[vertice].order]) {
                    vertices.push(cachedVertices[vertice])
                } else {
                    vertices.splice(cachedVertices[vertice].order+1, 0, cachedVertices[vertice])
                }
            }
        }
    }
    for (let i = 0; i < vertices.length; i++) {
        if (vertices[i] == undefined) {continue}
        const firstVertex = vertices[i]
        const nextVertex = vertices[(i+1)%vertices.length]

        bresenhamAlgorithm([firstVertex.x, firstVertex.y],[nextVertex.x, nextVertex.y],firstVertex.color,nextVertex.color,i+1)
    }
    //Dibujar
    for (let j = 0; j < size; j++) {
        for (let i = 0; i < size; i++) {
            if (binaryMap[getIndex(i,j)] != 0){
                if (rainbowCheckbox.checked) {
                    const {r,g,b} = findCellColor(i,j)
                    cont.fillStyle = `rgb(${r},${g},${b})`
                } else {
                    cont.fillStyle = `white`
                }
                cont.fillRect(i*cellSize,j*cellSize,cellSize,cellSize )
                cont.fillStyle = "white"
            }
        }
    }
}
function mouse(x, y) {
    // Increase hitbox for touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const touchBonus = isTouchDevice ? 10 : 0; // Extra hitbox size for touch
    
    return Object.values(assets).find(element => {
        if (
            x >= element.x - (hitboxExpand + touchBonus) &&
            x <= element.x + (hitboxExpand + touchBonus) + element.width &&
            y >= element.y - (hitboxExpand + touchBonus) &&
            y <= element.y + (hitboxExpand + touchBonus) + element.height
        ) {
            element.clicking = true;
            element.clickedAt = {x: x - element.x, y: y - element.y};
            return element;
        }
    });
}
function hover(x,y) {
    for (let index = 0; index < keys.length; index++) {
        const element = assets[keys[index]];
        if (
            element.hoverable===true &&
            x >= element.x - hitboxExpand &&
            x <= element.x + element.width + hitboxExpand &&
            y >= element.y - hitboxExpand &&
            y <= element.y + element.height + hitboxExpand
        ) {
            element.hover = true
            return 
        } else {
            element.hover = false
        }
    }
}
class CanvasHandler {
    constructor(canvas, sliderVertices) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.sliderVertices = sliderVertices;
        this.targetting = Number(this.sliderVertices.value);
        // Sincroniza el valor cuando cambia el slider
        this.sliderVertices.addEventListener('input', this.updateTargetting.bind(this));
    }

    updateTargetting() {
        this.targetting = Number(this.sliderVertices.value);
    }

    initEvents() {
        // Mouse events
        this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
        this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this));
        this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
        
        // Touch events for mobile
        this.canvas.addEventListener("touchstart", this.onTouchStart.bind(this));
        this.canvas.addEventListener("touchend", this.onTouchEnd.bind(this));
        this.canvas.addEventListener("touchmove", this.onTouchMove.bind(this));
    }

    onMouseDown(e) {
        const x = e.offsetX;
        const y = e.offsetY;
        const elementTouched = mouse(x, y);
        
        if (assets.vertex3.state == 'generating') {
            const xvertex3 = Math.round((assets.vertex3.x)/cellSize)
            const yvertex3 = Math.round((assets.vertex3.y)/cellSize)
        
            assets.vertex3.order = binaryMap[getIndex(xvertex3, yvertex3)]-1
            assets.vertex3.state = "generated"
        }
        if (!elementTouched) return;
        const vertexId = elementTouched.vertexId;
        if (elementTouched.type === "vertex" && vertexId != this.targetting) {
            this.targetting = vertexId;
        }
    }

    onMouseUp(e) {
        canvas.style.cursor = 'default';
        Object.values(assets).forEach(element => {
            element.clicking = false;
        });
    }

    onMouseMove(e) {
        // hover
        const x = e.offsetX
        const y = e.offsetY
        
        hover(x, y);
        let isHovering = null
        for (let index = 0; index < keys.length; index++) {
            const element = assets[keys[index]];
            if (element.hoverable && element.hover) {isHovering=true}
        }
        
        mostCloserCell(x,y)
        canvas.style.cursor = isHovering ? 'pointer' : 'default';
        
        // movement
        this.handleMovement(x, y);
    }

    // Touch event handlers
    onTouchStart(e) {
        e.preventDefault(); // Prevent scrolling when touching the canvas
        
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            const elementTouched = mouse(x, y);
            
            if (!elementTouched) return;
            const vertexId = elementTouched.vertexId;
            if (elementTouched.type === "vertex" && vertexId != this.targetting) {
                this.targetting = vertexId;
            }
        }
    }

    onTouchEnd(e) {
        e.preventDefault();
        Object.values(assets).forEach(element => {
            element.clicking = false;
        });
    }

    onTouchMove(e) {
        e.preventDefault();
        
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            // Call hover function for visual feedback
            hover(x, y);
            
            // Handle movement
            this.handleMovement(x, y);
        }
    }

    // Common function for handling movement for both mouse and touch
    handleMovement(x, y) {
        if (assets.xAxis.clicking === true) {
            const element = assets.xAxis;
            const finalVertexX = x - element.clickedAt.x;
            let vertex = cachedVertices[`vertex${this.targetting}`];
            const maxX = canvasLenght-assets.xAxis.width
            if (finalVertexX> maxX || finalVertexX < 0) {
                vertex.x = finalVertexX > maxX ? maxX : 1;
                return;
            }
            vertex.x = finalVertexX;
        }
        
        if (assets.yAxis.clicking === true) {
            const element = assets.yAxis;
            const finalVertexY = y + (64 - element.clickedAt.y);
            let vertex = cachedVertices[`vertex${this.targetting}`];
            
            const minY = assets.yAxis.height

            if (finalVertexY > 500 || finalVertexY < minY) {
                vertex.y = finalVertexY > 500 ? 499 : minY;
                return;
            } 
            vertex.y = finalVertexY;
        }
    }
}
updateTotalVertices()
let canvasHandler = new CanvasHandler(canvas, sliderVertices)
cellSize = divisorMasCercano(slider.value);

canvasHandler.initEvents()
slider.oninput = function() {
    sliderInfo.innerHTML = divisorMasCercano(this.value);
    cellSize = divisorMasCercano(slider.value);
}
function gameLoop(){
    updateTotalVertices()
    if (window.innerWidth <= 768) {
        canvas.width = 300
        canvas.height = 300
    } else {
        canvas.width = 500
        canvas.height = 500
    }
    canvasLenght = canvas.width

    size = canvasLenght/cellSize
    cellSize = divisorMasCercano(Number(slider.value))
    colorMap =  new Map()
    binaryMap = new Uint16Array(size*size)
    hitboxExpand = minimumCellSize/cellSize
    cont.clearRect(0,0,canvasLenght, canvasLenght)
    updateVertexCache()
    drawEdges()
    assets.vertex0.width = cellSize
    assets.vertex0.height = cellSize
    assets.vertex1.width = cellSize
    assets.vertex1.height = cellSize
    assets.vertex2.width = cellSize
    assets.vertex2.height = cellSize

    const shouldFillRainbow = rainbowCheckbox.checked && fillCheckbox.checked;
    const shouldFillTransparent = !fillCheckbox.checked;

    if (shouldFillRainbow) {
        fillRainbow();
        drawEdges()

    } else {
        fillDefault(fillsTransparent = shouldFillTransparent);
    }
    drawVertices()
    if (greenArrow.complete || redArrow.complete) {
        const vertex = cachedVertices[`vertex${canvasHandler.targetting}`];
        drawXYaxis(vertex.x, vertex.y)
    }
    requestAnimationFrame(gameLoop)
}
requestAnimationFrame(gameLoop);
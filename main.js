//todo: Reparar hitbox de verticess
const slider = document.getElementById('myRange')
const sliderInfo = document.getElementById('sliderInfo')

const sliderVertices = document.getElementById('myRangeVertices')

const fillCheckbox = document.getElementById('fillCheckbox');
const rainbowCheckbox = document.getElementById('rainbowCheckbox');

const canvas = document.getElementById("canvas")
const cont = canvas.getContext("2d");
const canvasLenght = canvas.clientWidth
let cellSize = 10
let assets = {
    xAxis: {id:0,type:"axisArrow", name:"xAxis",   width:64,   height:21,  x:undefined,y:undefined, clicking:false, clickedAt: {x:undefined, y:undefined}, hoverable:true},
    yAxis: {id:1,type:"axisArrow", name:"yAxis",   width:21,   height:64,  x:undefined,y:undefined, clicking:false, clickedAt: {x:undefined, y:undefined}, hoverable:true},
    vertex0: {id:2, vertexId: 0, type:"vertex", name:"vertex0", width:null, height:null,  x:10,y:50, clicking:false, clickedAt: {x:undefined, y:undefined}, hoverable:true, color:{r:255,g:0,b:0}},
    vertex1: {id:3, vertexId: 1, type:"vertex", name:"vertex1", width:null, height:null,  x:35,y:210, clicking:false, clickedAt: {x:undefined, y:undefined}, hoverable:true, color:{r:0,g:255,b:0}},
    vertex2: {id:4, vertexId: 2, type:"vertex", name:"vertex2", width:null, height:null,  x:300,y:200, clicking:false, clickedAt: {x:undefined, y:undefined}, hoverable:true, color:{r:0,g:0,b:255}},
}

//mapa binario de celdas a dibujar
let matrixMap = Array.from({ length: canvasLenght/cellSize }, () => Array(canvasLenght/cellSize).fill(false));

let colorIndexes = [
    {x:0,y:0,color:{r:0,g:0,b:0}}
]
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
function findCellColor(x,y,colorIndexes) {
    for (let index = 0; index < colorIndexes.length; index++) {
        if (
            colorIndexes[index].x ===x &&
            colorIndexes[index].y ===y
        ) {
            const {r,g,b} = colorIndexes[index].color
            return {r,g,b}
        }
        
    }
}
function extendVertex(x,y) {
    const cellSize = divisorMasCercano(Number(slider.value))
    x=Math.round(x/cellSize);
    y=Math.round(y/cellSize);
    if (cellSize > 10) {
        x=x*cellSize
        y=y*cellSize
        return {x,y,w:cellSize,h:cellSize}
    }
    const minimumCellSize = 10
    
    w = minimumCellSize*2
    h = minimumCellSize*2
    x = (x-(minimumCellSize/cellSize))*cellSize
    y = (y-(minimumCellSize/cellSize))*cellSize
    return {x,y,w,h}
}

function lenghtCalculator(array) {
    let line = {start:undefined, end:undefined, err:false}
    for (let i = 0; i < array.length; i++) {
        if (array[i] == false) {continue}
        if (array[i] == true && array[i+1] == false && line.start ==undefined) {
            line.start = i+1
            continue
        }
        if (array[i] == true && array[i-1] == false && line.start !=undefined) {
            line.end = i
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
function bresenhamAlgorithm(v0,v1, v0color, v1color) {
    let x0 = Math.round(v0[0]/cellSize)
    let y0 = Math.round(v0[1]/cellSize)
    let x1 = Math.round(v1[0]/cellSize)
    let y1 = Math.round(v1[1]/cellSize)

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
        matrixMap[y][x] = true
        //color handler
        const {r,g,b} = createGradientByPoint(v0color, v1color, stepColor*i)

        colorIndexes.push({x,y,color:{r,g,b}})
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
function fill(matrix, fillsTransparent) {
    
    for (let j = 0; j < matrix.length; j++) {
        const {start, end, err} = lenghtCalculator(matrix[j])
        if (err === true) {continue}

        const x = start, y = j
        const w = end-start

        if (fillsTransparent === true) {
            cont.fillStyle = 'rgba(0, 0, 0, 1)';
            cont.clearRect(x*cellSize,y*cellSize,w*cellSize,cellSize)
            cont.fillStyle = "white"
            continue
        }
        if (rainbowCheckbox.checked ===false){
            cont.fillStyle = "white"
            cont.fillRect(x*cellSize,y*cellSize,w*cellSize,cellSize)
            cont.fillStyle = "white" 
            continue
        } 

        //Gradient fill
        step = 1/w
        const leftColor = findCellColor(start - 1, y, colorIndexes);
        const rightColor = findCellColor(end, y, colorIndexes);
        if (!(leftColor && rightColor)) {continue}
        const { r: r0, g: g0, b: b0 } = leftColor;
        const { r: r1, g: g1, b: b1 } = rightColor;
        for (let index = 0; index < w; index++) {
            const {r,g,b} =createGradientByPoint({r:r0,g:g0,b:b0},{r:r1,g:g1,b:b1}, step*index)
            cont.fillStyle = `rgb(${r},${g},${b})`
            cont.fillRect((x+index)*cellSize,y*cellSize,cellSize,cellSize)
            cont.fillStyle = "white"
        }

    }
}
function drawVertices() {
    // Filtrar solo los elementos con type: "vertex"
    const vertices = Object.values(assets).filter(asset => asset.type === 'vertex');

    // Recorrer los elementos filtrados
    vertices.forEach(vertex => {
        const {x,y,w,h} = extendVertex(vertex.x, vertex.y)
        const {r,g,b} = vertex.color
        cont.fillStyle = `rgb(${r},${g},${b})`

        cont.fillRect(x, y, w, h)
        cont.fillStyle = "white"
    });
}
function drawEdges() {
    const vertex0 = Object.values(assets).filter(asset => asset.name === "vertex0")[0];
    const vertex1 = Object.values(assets).filter(asset => asset.name === "vertex1")[0];
    const vertex2 = Object.values(assets).filter(asset => asset.name === "vertex2")[0];
    bresenhamAlgorithm([vertex0.x, vertex0.y],[vertex1.x, vertex1.y],vertex0.color,vertex1.color)
    bresenhamAlgorithm([vertex1.x, vertex1.y],[vertex2.x, vertex2.y],vertex1.color,vertex2.color)
    bresenhamAlgorithm([vertex2.x, vertex2.y],[vertex0.x, vertex0.y],vertex2.color,vertex0.color)
    //Dibujar
    for (let j = 0; j < matrixMap.length; j++) {
        for (let i = 0; i < matrixMap[j].length; i++) {
            if (matrixMap[j][i] == true){
                if (rainbowCheckbox.checked) {
                    const {r,g,b} = findCellColor(i,j,colorIndexes)
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
function mouse(x,y) {
    return Object.values(assets).find(element => {
        if (
            x >= element.x &&
            x <= element.x + element.width &&
            y >= element.y &&
            y <= element.y + element.height
        ) {
            element.clicking = true
            element.clickedAt = {x:x-element.x, y:y-element.y}
            return element
        }
    });
}
function hover(x,y) {
    return Object.values(assets).find(element => {
        if (
            element.hoverable===true &&
            x >= element.x &&
            x <= element.x + element.width &&
            y >= element.y &&
            y <= element.y + element.height
        ) {
            console.log(`${element.name} tiene hover true`)
            element.hover = true
        } else {
            element.hover = false
        }
    });
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
        this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
        this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this));
        this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
    }

    onMouseDown(e) {
        const x = e.offsetX
        const y = e.offsetY
        const elementTouched = mouse(x,y)
        
        if (!elementTouched) return
        const vertexId = elementTouched.vertexId
        if (elementTouched.type === "vertex" && vertexId != this.targetting) {
            this.targetting = vertexId
        }
    }

    onMouseUp(e) {
        canvas.style.cursor = 'default';
        Object.values(assets).forEach(element => {
            element.clicking = false
        });
    }

    onMouseMove(e) {
        //hover
        hover(e.offsetX, e.offsetY)
        const isHovering = Object.values(assets).some(
            (asset) => asset.hoverable && asset.hover
        );
        canvas.style.cursor = isHovering ? 'pointer' : 'default';
        //movement
        Object.values(assets).forEach(element => {
            if (element.name=="xAxis" && element.clicking==true) {
                const finalVertexX = e.offsetX-element.clickedAt.x
                if (finalVertexX > 500 || finalVertexX < 0) {
                    let vertex = Object.values(assets).filter(asset => asset.name === `vertex${this.targetting}`)[0];
                    vertex.x = 1
                    return
                }
                let vertex = Object.values(assets).filter(asset => asset.name === `vertex${this.targetting}`)[0];
                vertex.x = finalVertexX
            }
            if (element.name=="yAxis" && element.clicking==true) {
                const finalVertexY = e.offsetY+(64-element.clickedAt.y)
                if (finalVertexY > 500 || finalVertexY < 0) {
                    let vertex = Object.values(assets).filter(asset => asset.name === `vertex${this.targetting}`)[0];
                    vertex.y = 499
                    return
                } 
                let vertex = Object.values(assets).filter(asset => asset.name === `vertex${this.targetting}`)[0];
                vertex.y = finalVertexY //! deuda tecnica a revisar jej                
            }
        });
    }
}
let canvasHandler = new CanvasHandler(canvas, sliderVertices)

canvasHandler.initEvents()

slider.oninput = function() {
    sliderInfo.innerHTML = divisorMasCercano(this.value);
}
function gameLoop(){
    cellSize = divisorMasCercano(slider.value)
    cont.clearRect(0,0,canvasLenght, canvasLenght)
    matrixMap = Array.from({ length: canvasLenght/cellSize }, () => Array(canvasLenght/cellSize).fill(false));
    colorIndexes = []
    drawEdges()
    assets.vertex0.width = cellSize
    assets.vertex0.height = cellSize
    assets.vertex1.width = cellSize
    assets.vertex1.height = cellSize
    assets.vertex2.width = cellSize
    assets.vertex2.height = cellSize
    if (fillCheckbox.checked) {
        fill(matrixMap,fillsTransparent=false)
    } else {
        fill(matrixMap,fillsTransparent=true)
    }
    drawVertices()
    if (greenArrow.complete || redArrow.complete) {
        const vertex = Object.values(assets).filter(asset => asset.name === `vertex${canvasHandler.targetting}`)[0];
        drawXYaxis(vertex.x, vertex.y)
    }
    requestAnimationFrame(gameLoop)
}
requestAnimationFrame
requestAnimationFrame(gameLoop);
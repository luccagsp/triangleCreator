//TODO Refactorizar el codigo (de nuevo lpm)
//TODO Reparar algoritmo de Bresenham (lineas rectas en ciertos ejes ? medio raro)
//TODO Crear vertices más grandes para rasterizados pequeños
//TODO Seleccionar vertice en movimiento con click en el canvas
//lets go
const slider = document.getElementById('myRange')
const sliderInfo = document.getElementById('sliderInfo')

const sliderVertices = document.getElementById('myRangeVertices')
const sliderInfoVertices = document.getElementById('sliderInfoVertices')

const checkbox = document.getElementById('checkbox');
const canvas = document.getElementById("canvas")
const cont = canvas.getContext("2d");
const canvasLenght = canvas.clientWidth
let cellSize = 10
const points = [
    [10,15],
    [35,210],
    [300,200]
] 
let XYaxisPosition = {
    xAxis: {id:0, name:"xAxis", width:64, height:21,  x:undefined,y:undefined, clicking:false, clickedAt: {x:undefined, y:undefined}},
    yAxis: {id:1, name:"yAxis", width:21, height:64,  x:undefined,y:undefined, clicking:false, clickedAt: {x:undefined, y:undefined}}
}
let matriz = Array.from({ length: canvasLenght/cellSize }, () => Array(canvasLenght/cellSize).fill(false));
let transparent = true
const greenArrow = new Image();
const redArrow = new Image();
redArrow.src = './red_arrow.png';
greenArrow.src = './green_arrow.png';
cont.fillStyle = "white"
sliderInfo.innerHTML = slider.value;
sliderInfoVertices.innerHTML = sliderVertices.value;

slider.oninput = function() {
    sliderInfo.innerHTML = divisorMasCercano(this.value);
} 
sliderVertices.oninput = function() {
    sliderInfoVertices.innerHTML = Number(this.value);
}  


function extendVertex(x,y) {
    x=Math.round(x/cellSize)*cellSize;
    y=Math.round(y/cellSize)*cellSize;
    let cellsExpand = canvas.clientWidth/cellSize*2
    cellsExpand = cellsExpand
    newX = x-cellsExpand
    newY = y-cellsExpand
    width = x+cellsExpand
    height = y+cellsExpand
    cont.fillStyle = "blue"
    cont.fillRect(newX, newY, width, height)
    cont.fillStyle = "white"
    console.log(newX, newY, width, height)
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
function bresenhamAlgorithm(v0,v1) {
    x0 = Math.round(v0[0]/cellSize)
    y0 = Math.round(v0[1]/cellSize)
    x1 = Math.round(v1[0]/cellSize)
    y1 = Math.round(v1[1]/cellSize)

    dx = x1-x0
    dy = y1-y0

    const step = Math.max(Math.abs(dx), Math.abs(dy)) //! Linea para soportar valores negativos

    if (dx == 0) return undefined
    m = dy/dx //Es la pendiente! (y=mx+b) 
    stepX = dx/step //!
    stepY = dy/step //!

    for (let i = 0; i < step+1; i++) { //Por cada casilla horizontal de distancia...
        x = Math.round(x0+i*stepX)  //!vals negativos soporte
        y = Math.round(y0+i*stepY) //!vals negativos soporte
        matriz[y][x] = true
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

    XYaxisPosition = {
        ...XYaxisPosition,
        xAxis: {
            ...XYaxisPosition.xAxis,
            x: x + cellSize / 2,
            y: fixedY
        },
        yAxis: {
            ...XYaxisPosition.yAxis,
            x: fixedX,
            y: y - h
        }
    };

}
function fill(matrix, fillsTransparent) {
    
    for (let j = 0; j < matrix.length; j++) {
        const {start, end, err} = lenghtCalculator(matrix[j])
        if (err == false) {
            x = start
            y = j
            w = end-start
            if (fillsTransparent == true) {
                cont.fillStyle = 'rgba(0, 0, 0, 1)';
                cont.clearRect(x*cellSize,y*cellSize,w*cellSize,cellSize)
                cont.fillStyle = "white"
                continue
            } else {
                cont.fillStyle = "white"
                cont.fillRect(x*cellSize,y*cellSize,w*cellSize,cellSize)
                cont.fillStyle = "white"
            }
        }
    }
}
function drawVertices() {
    points.forEach(point => {
        x=Math.round(point[0]/cellSize)
        y=Math.round(point[1]/cellSize)
        cont.fillStyle = "blue"
        cont.fillRect(x*cellSize,y*cellSize, cellSize, cellSize)
        cont.fillStyle = "white"
    });
}
function drawEdges() {
    bresenhamAlgorithm(points[0],points[1])
    bresenhamAlgorithm(points[1],points[2])
    bresenhamAlgorithm(points[2],points[0])
    //Dibujar
    for (let j = 0; j < matriz.length; j++) {
        for (let i = 0; i < matriz[j].length; i++) {
            if (matriz[j][i] == true){
                cont.fillRect(i*cellSize,j*cellSize,cellSize,cellSize )
            }
        }
    }
}
function mouse(x,y) {
    Object.values(XYaxisPosition).forEach(element => {
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
    Object.values(XYaxisPosition).forEach(element => {
        if (
            x >= element.x &&
            x <= element.x + element.width &&
            y >= element.y &&
            y <= element.y + element.height
        ) {
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
        const element = mouse(x,y)
        // cont.fillStyle = "red";
        // cont.arc(x, y, 40, 0, 2 * Math.PI);
        // cont.fill();
        // cont.fillStyle = "white"
    }

    onMouseUp(e) {
        canvas.style.cursor = 'default';
        Object.values(XYaxisPosition).forEach(element => {
            element.clicking = false
        });
    }

    onMouseMove(e) {
        //hover
        hover(e.offsetX, e.offsetY)

        if (XYaxisPosition.xAxis.hover ) {canvas.style.cursor = 'pointer';} 
        else if (XYaxisPosition.yAxis.hover) {canvas.style.cursor = 'pointer';} 
        else {canvas.style.cursor = 'default';}
        //movement
        Object.values(XYaxisPosition).forEach(element => {
            if (element.name=="xAxis" && element.clicking==true) {
                const finalVertexX = e.offsetX-element.clickedAt.x
                if (finalVertexX > 500 || finalVertexX < 0) {
                    points[this.targetting][0]=1
                    return
                }
                points[this.targetting][0]=finalVertexX
            }
            if (element.name=="yAxis" && element.clicking==true) {
                const finalVertexY = e.offsetY+(64-element.clickedAt.y)
                if (finalVertexY > 500 || finalVertexY < 0) {
                    points[this.targetting][1] = 499
                    return
                } 
                points[this.targetting][1]=finalVertexY //! deuda tecnica a revisar jej
                
            }
        });
    }
}
let canvasHandler = new CanvasHandler(canvas, sliderVertices)
canvasHandler.initEvents()

function gameLoop(){
    cellSize = divisorMasCercano(slider.value)
    cont.clearRect(0,0,canvasLenght, canvasLenght)
    matriz = Array.from({ length: canvasLenght/cellSize }, () => Array(canvasLenght/cellSize).fill(false));
    drawEdges()
    drawVertices()
    if (checkbox.checked) {
        fill(matriz,fillsTransparent=false)
    } else {
        fill(matriz,fillsTransparent=true)
    }
    if (greenArrow.complete || redArrow.complete) {
        drawXYaxis(points[canvasHandler.targetting][0], points[canvasHandler.targetting][1])
    }
    extendVertex(300,200)
}

setInterval(gameLoop, 10);
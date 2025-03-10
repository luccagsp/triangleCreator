const canvas = document.getElementById("canvas")
const cont = canvas.getContext("2d");
console.log() 
const canvasLenght = canvas.clientWidth
const cellSize = 10
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
let targetting = undefined
redArrow.src = './red_arrow.png';
greenArrow.src = './green_arrow.png';
cont.fillStyle = "white"

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
    pointY = y+cellSize/2 //mitad del cuadrado
    fixedY = pointY-w/2
    pointx = x+cellSize/2 //mitad del cuadrado
    fixedX = pointx-w/2

    cont.drawImage(greenArrow, fixedX      , y-h   , w,h)
    cont.drawImage(redArrow  , x+cellSize/2, fixedY, h,w)

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

function fill(matrix, transparent) {
    for (let j = 0; j < matrix.length; j++) {
        const {start, end, err} = lenghtCalculator(matrix[j])
        if (err == false) {
            x = start
            y = j
            w = end-start
            if (transparent == true) {
                cont.clearRect(x*cellSize,y*cellSize,w*cellSize,cellSize)
                continue
            }
            cont.fillStyle = "white"
            cont.fillRect(x*cellSize,y*cellSize,w*cellSize,cellSize)
            cont.fillStyle = "white"
        }
    }
}

document.onkeyup = function (e) {
    e = e || window.Event;
    if (e.key == "e" || e.key == "E") {
        if (transparent==true) {
            fill(matriz, f5alse)
            transparent=false
            return true
        }
        if (transparent==false) {
            fill(matriz, true)
            transparent=true
            return true
        }
    }

};

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
    for (let j = 0; j < matriz.length; j++) {
        for (let i = 0; i < matriz[j].length; i++) {
            if (matriz[j][i] == true){
                cont.fillRect(i*cellSize,j*cellSize,cellSize,cellSize )
            }
        }
    }
}

canvas.addEventListener('mousedown', (e) => {
    const x = e.offsetX
    const y = e.offsetY
    console.log(x,y)
    element = mouse(x,y)
    targetting = element.id
});

canvas.addEventListener('mouseup', (e) => {
    canvas.style.cursor = 'default';
    Object.values(XYaxisPosition).forEach(element => {
        element.clicking = false
    });
});
//hover handler
canvas.addEventListener("mousemove", (e)=> {
    hover(e.offsetX, e.offsetY)

    if (XYaxisPosition.xAxis.hover ) {
        canvas.style.cursor = 'pointer';
        console.log("red")
    } else if (XYaxisPosition.yAxis.hover) {
        canvas.style.cursor = 'pointer';
    } else {canvas.style.cursor = 'default';}
})
//movement handler
canvas.addEventListener("mousemove", (event) => {
    Object.values(XYaxisPosition).forEach(element => {
        if (element.name=="xAxis" && element.clicking==true) {
            const moveTo = event.offsetX
            if (moveTo > 500 || moveTo < 0) {return}
            points[targetting][0]=moveTo-element.clickedAt.x
        }
        if (element.name=="yAxis" && element.clicking==true) {
            const moveTo = event.offsetY
            if (moveTo > 500 || moveTo < 0) {return}
            points[targetting][1]=moveTo+(64-element.clickedAt.y) //! deuda tecnica a revisar jej
        }
    });
});

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

setInterval(() => {
    cont.clearRect(0,0,canvasLenght, canvasLenght)
    matriz = Array.from({ length: canvasLenght/cellSize }, () => Array(canvasLenght/cellSize).fill(false));
    fill(matriz, false)
    drawEdges()
    drawVertices()
    if (greenArrow.complete || redArrow.complete) {
        targetting = 1
        drawXYaxis(points[targetting][0], points[targetting][1])
    }
}, 10
);

/* 
for (let i = 0; i < canvasLenght/cellSize; i++) {
    for (let j = 0; j < canvasLenght/cellSize; j++) {
        cont.strokeRect(i*cellSize,j*cellSize,cellSize,cellSize )
    }
}
 */
/* document.onkeyup = function (e) {
    if (e.key=="ArrowRight") {
        points[2][0]+=cellSize
    }
    if (e.key=="ArrowLeft") {
        points[2][0]-=cellSize
    }
    if (e.key=="ArrowUp") {
        points[2][1]-=cellSize
    }
    if (e.key=="ArrowDown") {
        points[2][1]+=cellSize
    }
}
 */
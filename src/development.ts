import * as fs from "fs";

module AppConst {
    export const canvasWidth = 720
    export const canvasHeight = 480
}

class Development {

    public drawLines : boolean
    public lineStyle : string = "rgba(255,255,255,0)"

    private srcCanvas : HTMLCanvasElement
    private dstCanvas : HTMLCanvasElement

    private srcCtx : CanvasRenderingContext2D
    private dstCtx : CanvasRenderingContext2D

    private srcImg : HTMLImageElement
    private dstImg : HTMLImageElement

    constructor() {
        this.srcCanvas = <HTMLCanvasElement>document.getElementById('srcCanvas')
        if (this.srcCanvas) {
            this.srcCanvas.width = 720
            this.srcCanvas.height = 360
            this.srcCtx = this.srcCanvas.getContext('2d')
        }

        this.dstCanvas = <HTMLCanvasElement>document.getElementById('dstCanvas')
        if (this.dstCanvas) {
            this.dstCanvas.width = AppConst.canvasWidth
            this.dstCanvas.height = AppConst.canvasHeight
            this.dstCtx = this.dstCanvas.getContext('2d')
        }
    }

    public loadFile(fileName:string, onload:(e:Event)=>void, onerror:(e:Event)=>void) {
        console.log("File name : " + fileName);

        if ( ! this.srcCanvas || ! this.srcCanvas.getContext ) {
            console.log("cannot found srcCanvas")
            return
        }

        this.srcCanvas.hidden = true
        this.dstCanvas.hidden = true

        var srcImg : HTMLImageElement = new Image()
        srcImg.src = fileName;

        console.log("loaded...")

        srcImg.onload = (e) => {
            console.log("success to load image: " + e)
            this.srcCtx.clearRect(0, 0, AppConst.canvasWidth, AppConst.canvasHeight)
            this.srcCtx.drawImage(srcImg, 0, 0, srcImg.width, srcImg.height, 0, 0, AppConst.canvasWidth, AppConst.canvasHeight)
            this.srcCanvas.hidden = false
            this.srcImg = srcImg
            onload(e);
        }

        srcImg.onerror = (e) => {
            console.log("fail to load image: " + e)
            onerror(e);
        }

        return
    }

    public convertImage(onload:(e:Event)=>void) : boolean {
        if (!this.srcImg) {
            console.log("No image is loaded")
            return false
        }

        this.srcCanvas.hidden = true
        this.dstCanvas.hidden = true

        var transformedCanvas : HTMLCanvasElement = this.transformedCanvas()

        var ceilCanvas = this.ceilCanvas(transformedCanvas)
        var floorCanvas = this.floorCanvas(transformedCanvas)
        var compositeCanvas = this.compositeCanvas(transformedCanvas, ceilCanvas, floorCanvas)

        var dstImg :HTMLImageElement = new Image()

        if (this.drawLines) {
            var markedCanvas = this.markedCanvas(compositeCanvas, this.lineStyle)
            dstImg.src = markedCanvas.toDataURL("image/png")

        } else {
            dstImg.src = compositeCanvas.toDataURL("image/png")
        }

        dstImg.onload = (e) => {
            this.dstCtx.clearRect(0, 0, AppConst.canvasWidth, AppConst.canvasHeight)
            this.dstCtx.drawImage(dstImg, 0, 0, dstImg.width, dstImg.height, 0, 0, AppConst.canvasWidth, AppConst.canvasHeight)
            this.dstCanvas.hidden = false;
            this.dstImg = dstImg
            onload(e)
        }

        return true
    }

    public keystone(ctx:CanvasRenderingContext2D, img:HTMLImageElement, x:number, y:number, width:number, height:number, upper:number, lower:number) {

        for (var n = 0 ; n < height ; n++) {
            var sx = x
            var sy = y + n
            var sWidth = width
            var sHeight = 1
            var dWidth = width * (upper*(height-n) + lower*n) / height
            var dx = x + (sWidth - dWidth) / 2
            var dHeight = 1
            var dy = y + n

            ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        }
    }

    public transformedCanvas() : HTMLCanvasElement {
        var unit = this.srcImg.width / 16
        var scale = Math.sqrt(2) - 1

        var transformedCanvas : HTMLCanvasElement = document.createElement('canvas')
        transformedCanvas.width = this.srcImg.width
        transformedCanvas.height = this.srcImg.height

        var transformedCtx : CanvasRenderingContext2D = transformedCanvas.getContext('2d')

        for (var row = 0 ; row < 8 ; row++) {
            this.keystone(transformedCtx, this.srcImg, unit*row*2, unit*0, unit*2, unit*1, 0.02,   scale+0.01)
            this.keystone(transformedCtx, this.srcImg, unit*row*2, unit*1, unit*2, unit*2, scale, 1.0  )
            this.keystone(transformedCtx, this.srcImg, unit*row*2, unit*3, unit*2, unit*2, 1.0,   1.0  )
            this.keystone(transformedCtx, this.srcImg, unit*row*2, unit*5, unit*2, unit*2, 1.0,   scale)
            this.keystone(transformedCtx, this.srcImg, unit*row*2, unit*7, unit*2, unit*1, scale+0.01, 0.02  )
        }

        return transformedCanvas
    }

    public ceilCanvas(srcCanvas : HTMLCanvasElement) : HTMLCanvasElement {
        var unit = srcCanvas.width / 16

        var canvas : HTMLCanvasElement = document.createElement('canvas')
        canvas.width = unit * 2
        canvas.height = unit * 2
        var ctx : CanvasRenderingContext2D = canvas.getContext('2d')

        for (var col = 0 ; col < 8 ; col++) {
            ctx.save()
            ctx.translate(unit, unit)
            ctx.rotate(-Math.PI*col/4)
            ctx.drawImage(srcCanvas, unit*2*col, 0, unit*2, unit, -unit, 0, unit*2, unit)
            ctx.restore()
        }

        return canvas
    }

    public floorCanvas(srcCanvas : HTMLCanvasElement) : HTMLCanvasElement {
        var unit = srcCanvas.width / 16

        var canvas : HTMLCanvasElement = document.createElement('canvas')
        canvas.width = unit * 2
        canvas.height = unit * 2
        var ctx : CanvasRenderingContext2D = canvas.getContext('2d')

        for (var col = 0 ; col < 8 ; col++) {
            ctx.save()
            ctx.translate(unit, unit)
            ctx.rotate(Math.PI*col/4)
            ctx.drawImage(srcCanvas, unit*2*col, unit*7, unit*2, unit, -unit, -unit, unit*2, unit)
            ctx.restore()
        }
        
        return canvas
    }

    public compositeCanvas(transformedCanvas : HTMLCanvasElement, ceilCanvas : HTMLCanvasElement, floorCanvas : HTMLCanvasElement) : HTMLCanvasElement {
        var unit = transformedCanvas.width / 16

        var canvas = document.createElement('canvas')
        canvas.width = unit * 18
        canvas.height = unit * 12

        var ctx : CanvasRenderingContext2D = canvas.getContext('2d')
        
        ctx.drawImage(ceilCanvas, unit*1, unit*1)
        ctx.drawImage(floorCanvas, unit*1, unit*9)
        ctx.drawImage(transformedCanvas, unit*0, unit*1, unit*16, unit*6, unit*1, unit*3, unit*16, unit*6)

        return canvas
    }

    public markedCanvas(originalCanvas : HTMLCanvasElement, strokeStyle : string) : HTMLCanvasElement {
        var unit = originalCanvas.width / 18
        var scale = Math.sqrt(2) - 1

        var markedCanvas = document.createElement('canvas')
        markedCanvas.width = originalCanvas.width
        markedCanvas.height = originalCanvas.height

        var ctx : CanvasRenderingContext2D = markedCanvas.getContext('2d')

        for (var row = 0 ; row < 8 ; row++) {
            ctx.save()
            ctx.translate(unit*(1+row*2), unit*3)
            ctx.beginPath()
            ctx.strokeStyle = strokeStyle
            ctx.lineCap = "round"
            ctx.lineWidth = 6
            ctx.moveTo(unit*(1-scale), 0             )
            ctx.lineTo(unit*(1-scale), -unit/8       )
            ctx.lineTo(unit*(1+scale), -unit/8       )
            ctx.lineTo(unit*(1+scale), 0             )
            ctx.stroke()
            ctx.restore()
        }

        for (var row = 0 ; row < 8 ; row++) {
            ctx.save()
            ctx.translate(unit*(1+row*2), unit*9)
            ctx.beginPath()
            ctx.strokeStyle = strokeStyle
            ctx.lineCap = "round"
            ctx.lineWidth = 6
            ctx.moveTo(unit*(1-scale), 0             )
            ctx.lineTo(unit*(1-scale), unit/8        )
            ctx.lineTo(unit*(1+scale), unit/8        )
            ctx.lineTo(unit*(1+scale), 0             )
            ctx.stroke()
            ctx.restore()
        }

        ctx.save()
        ctx.translate(unit*17, unit*5)
        ctx.beginPath()
        ctx.strokeStyle = strokeStyle
        ctx.lineCap = "round"
        ctx.lineWidth = 6
        ctx.moveTo(0             , 0             )
        ctx.lineTo(unit/8        , 0             )
        ctx.lineTo(unit/8        , unit*2        )
        ctx.lineTo(0             , unit*2        )
        ctx.stroke()
        ctx.restore()

        for (var row = 1 ; row < 8 ; row+=2) {
            ctx.save()
            ctx.translate(unit*(1+row*2), unit*5)
            ctx.beginPath()
            ctx.strokeStyle = strokeStyle
            ctx.lineCap = "round"
            ctx.lineWidth = 8
            ctx.moveTo(-unit/8 + 0             , 0             )
            ctx.lineTo(-unit/8 + unit*(1-scale), -unit*2       )
            ctx.lineTo(          unit*(1-scale), -unit*2       )
            ctx.stroke()
            ctx.moveTo(       unit*(1+scale)   , -unit*2       )
            ctx.lineTo(unit/8+unit*(1+scale)   , -unit*2       )
            ctx.lineTo(unit/8+unit*2           , 0             )
            ctx.stroke()
            ctx.restore()
        }

        for (var row = 1 ; row < 8 ; row+=2) {
            ctx.save()
            ctx.translate(unit*(1+row*2), unit*7)
            ctx.beginPath()
            ctx.strokeStyle = strokeStyle
            ctx.lineCap = "round"
            ctx.lineWidth = 8
            ctx.moveTo(-unit/8 + 0             , 0             )
            ctx.lineTo(-unit/8 + unit*(1-scale), unit*2        )
            ctx.lineTo(          unit*(1-scale), unit*2        )
            ctx.stroke()
            ctx.moveTo(       unit*(1+scale)   , unit*2        )
            ctx.lineTo(unit/8+unit*(1+scale)   , unit*2        )
            ctx.lineTo(unit/8+unit*2           , 0             )
            ctx.stroke()
            ctx.restore()
        }

        ctx.drawImage(originalCanvas, 0, 0)

        ctx.save()
        ctx.translate(unit, unit)
        ctx.beginPath()
        ctx.strokeStyle = strokeStyle
        ctx.setLineDash([10, 30])
        ctx.lineCap = "round"
        ctx.lineWidth = 8
        ctx.moveTo(unit*(1-scale), unit*2        )
        ctx.lineTo(unit*0,         unit*(1+scale))
        ctx.lineTo(unit*0,         unit*(1-scale))
        ctx.lineTo(unit*(1-scale), 0             )
        ctx.lineTo(unit*(1+scale), 0             )
        ctx.lineTo(unit*2,         unit*(1-scale))
        ctx.lineTo(unit*2,         unit*(1+scale))
        ctx.lineTo(unit*(1+scale), unit*2        )
        ctx.stroke()
        ctx.restore()

        ctx.save()
        ctx.translate(unit, unit*9)
        ctx.beginPath()
        ctx.strokeStyle = strokeStyle
        ctx.setLineDash([10, 30])
        ctx.lineCap = "round"
        ctx.lineWidth = 8
        ctx.moveTo(unit*(1-scale), 0             )
        ctx.lineTo(unit*0,         unit*(1-scale))
        ctx.lineTo(unit*0,         unit*(1+scale))
        ctx.lineTo(unit*(1-scale), unit*2        )
        ctx.lineTo(unit*(1+scale), unit*2        )
        ctx.lineTo(unit*2,         unit*(1+scale))
        ctx.lineTo(unit*2,         unit*(1-scale))
        ctx.lineTo(unit*(1+scale), 0             )
        ctx.stroke()
        ctx.restore()

        ctx.save()
        ctx.translate(unit, unit*5)
        ctx.beginPath()
        ctx.strokeStyle = strokeStyle
        ctx.setLineDash([10, 30])
        ctx.lineCap = "round"
        ctx.lineWidth = 8
        ctx.moveTo(unit*0        , 0             )
        ctx.lineTo(unit*16       , 0             )
        ctx.stroke()
        ctx.restore()

        ctx.save()
        ctx.translate(unit, unit*7)
        ctx.beginPath()
        ctx.strokeStyle = strokeStyle
        ctx.setLineDash([10, 30])
        ctx.lineCap = "round"
        ctx.lineWidth = 8
        ctx.moveTo(unit*0        , 0             )
        ctx.lineTo(unit*16       , 0             )
        ctx.stroke()
        ctx.restore()

        for (var row = 0 ; row < 8 ; row++) {
            ctx.save()
            ctx.translate(unit*(1+row*2), unit*5)
            ctx.beginPath()
            ctx.strokeStyle = strokeStyle
            ctx.setLineDash([10, 30])
            ctx.lineCap = "round"
            ctx.lineWidth = 8
            ctx.moveTo(0             , 0             )
            ctx.lineTo(unit*(1-scale), -unit*2       )
            ctx.lineTo(unit*(1+scale), -unit*2       )
            ctx.lineTo(unit*2        , 0             )
            ctx.stroke()
            ctx.restore()
        }

        for (var row = 0 ; row < 8 ; row++) {
            ctx.save()
            ctx.translate(unit*(1+row*2), unit*7)
            ctx.beginPath()
            ctx.strokeStyle = strokeStyle
            ctx.setLineDash([10, 30])
            ctx.lineCap = "round"
            ctx.lineWidth = 8
            ctx.moveTo(0             , 0             )
            ctx.lineTo(unit*(1-scale), unit*2        )
            ctx.lineTo(unit*(1+scale), unit*2        )
            ctx.lineTo(unit*2        , 0             )
            ctx.stroke()
            ctx.restore()
        }

        for (var row = 0 ; row <= 8 ; row++) {
            ctx.save()
            ctx.translate(unit*(1+row*2), unit*5)
            ctx.beginPath()
            ctx.strokeStyle = strokeStyle
            ctx.setLineDash([10, 30])
            ctx.lineCap = "round"
            ctx.lineWidth = 8
            ctx.moveTo(0             , 0             )
            ctx.lineTo(0             , unit*2        )
            ctx.stroke()
            ctx.restore()
        }
        
        return markedCanvas
    }

    public saveFile(fileName : string) {
        var base64 = this.dstImg.src.replace(/^data:image\/png;base64,/, "");

        fs.writeFile(fileName, base64, 'base64', function (error) {
            if(error) {
                alert(error);
            }
        });
    }
}

export default Development;
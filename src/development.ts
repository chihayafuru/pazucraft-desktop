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

    private unit : number

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

            if (srcImg.width === (srcImg.height * 2)) {
                this.srcCtx.clearRect(0, 0, AppConst.canvasWidth, AppConst.canvasHeight)
                this.srcCtx.drawImage(srcImg, 0, 0, srcImg.width, srcImg.height, 0, 0, AppConst.canvasWidth, AppConst.canvasHeight)
                this.srcCanvas.hidden = false
                this.srcImg = srcImg
                this.unit = srcImg.width / 16
                onload(e);
            } else {
                let e : Event = new CustomEvent("not supported format", null);
                onerror(e);
            }
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

        let transformedCanvas : HTMLCanvasElement = this.transformedCanvas()
        let compositeCanvas : HTMLCanvasElement = document.createElement('canvas',);
        compositeCanvas.width = this.unit * 18;
        compositeCanvas.height = this.unit * 12;
        let compositeCtx : CanvasRenderingContext2D = <CanvasRenderingContext2D>compositeCanvas.getContext('2d', { storage: "discardable" })

        this.drawCeil(transformedCanvas, compositeCtx);
        this.drawFloor(transformedCanvas, compositeCtx);
        this.drawWall(transformedCanvas, compositeCtx);

        let dstImg :HTMLImageElement = new Image()

        if (this.drawLines) {
            let markedCanvas = this.markedCanvas(compositeCanvas, this.lineStyle)
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

        for (let n = 0 ; n < height ; n++) {
            let sx = x
            let sy = y + n
            let sWidth = width
            let sHeight = 1
            let dWidth = width * (upper*(height-n) + lower*n) / height
            let dx = x + (sWidth - dWidth) / 2
            let dHeight = 1
            let dy = y + n

            ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        }
    }

    public transformedCanvas() : HTMLCanvasElement {
        let scale = Math.sqrt(2) - 1

        let transformedCanvas : HTMLCanvasElement = document.createElement('canvas')
        transformedCanvas.width = this.srcImg.width
        transformedCanvas.height = this.srcImg.height

        let transformedCtx : CanvasRenderingContext2D = <CanvasRenderingContext2D>transformedCanvas.getContext('2d', { storage: "discardable" })

        for (let row = 0 ; row < 8 ; row++) {
            this.keystone(transformedCtx, this.srcImg, this.unit*row*2, this.unit*0, this.unit*2, this.unit*1, 0.01,  scale+0.01)
            this.keystone(transformedCtx, this.srcImg, this.unit*row*2, this.unit*1, this.unit*2, this.unit*2, scale, 1.0  )
            this.keystone(transformedCtx, this.srcImg, this.unit*row*2, this.unit*3, this.unit*2, this.unit*2, 1.0,   1.0  )
            this.keystone(transformedCtx, this.srcImg, this.unit*row*2, this.unit*5, this.unit*2, this.unit*2, 1.0,   scale)
            this.keystone(transformedCtx, this.srcImg, this.unit*row*2, this.unit*7, this.unit*2, this.unit*1, scale+0.01, 0.01)
        }

        return transformedCanvas
    }

    public drawCeil(srcCanvas : HTMLCanvasElement, dstCtx : CanvasRenderingContext2D) : void {
        for (let col = 0 ; col < 8 ; col++) {
            dstCtx.save()
            dstCtx.translate(this.unit*2, this.unit*2)
            dstCtx.rotate(-Math.PI*col/4)
            dstCtx.drawImage(srcCanvas,
                          this.unit*2*col, 0, this.unit*2, this.unit,
                         -this.unit,       0, this.unit*2, this.unit)
            dstCtx.restore()
        }
    }

    public drawFloor(srcCanvas : HTMLCanvasElement, dstCtx : CanvasRenderingContext2D) : void {
        for (let col = 0 ; col < 8 ; col++) {
            dstCtx.save()
            dstCtx.translate(this.unit*2, this.unit*10)
            dstCtx.rotate(Math.PI*col/4)
            dstCtx.drawImage(srcCanvas,
                          this.unit*2*col,  this.unit*7, this.unit*2, this.unit,
                         -this.unit,       -this.unit,   this.unit*2, this.unit)
            dstCtx.restore()
        }
    }

    public drawWall(srcCanvas : HTMLCanvasElement, dstCtx : CanvasRenderingContext2D) : void {
        dstCtx.drawImage(srcCanvas,
                      this.unit*0, this.unit*1, this.unit*16, this.unit*6,
                      this.unit*1, this.unit*3, this.unit*16, this.unit*6);
    }

    public markedCanvas(originalCanvas : HTMLCanvasElement, strokeStyle : string) : HTMLCanvasElement {
        let scale = Math.sqrt(2) - 1

        let markedCanvas = document.createElement('canvas')
        markedCanvas.width = originalCanvas.width
        markedCanvas.height = originalCanvas.height

        let ctx : CanvasRenderingContext2D = <CanvasRenderingContext2D>markedCanvas.getContext('2d', { storage: "discardable" })

        for (var row = 0 ; row < 8 ; row++) {
            ctx.save()
            ctx.translate(this.unit*(1+row*2), this.unit*3)
            ctx.beginPath()
            ctx.strokeStyle = strokeStyle
            ctx.lineCap = "round"
            ctx.lineWidth = 6
            ctx.moveTo(this.unit*(1-scale), 0           )
            ctx.lineTo(this.unit*(1-scale), -this.unit/8)
            ctx.lineTo(this.unit*(1+scale), -this.unit/8)
            ctx.lineTo(this.unit*(1+scale), 0           )
            ctx.stroke()
            ctx.restore()
        }

        for (var row = 0 ; row < 8 ; row++) {
            ctx.save()
            ctx.translate(this.unit*(1+row*2), this.unit*9)
            ctx.beginPath()
            ctx.strokeStyle = strokeStyle
            ctx.lineCap = "round"
            ctx.lineWidth = 6
            ctx.moveTo(this.unit*(1-scale), 0          )
            ctx.lineTo(this.unit*(1-scale), this.unit/8)
            ctx.lineTo(this.unit*(1+scale), this.unit/8)
            ctx.lineTo(this.unit*(1+scale), 0          )
            ctx.stroke()
            ctx.restore()
        }

        ctx.save()
        ctx.translate(this.unit*17, this.unit*5)
        ctx.beginPath()
        ctx.strokeStyle = strokeStyle
        ctx.lineCap = "round"
        ctx.lineWidth = 6
        ctx.moveTo(0             , 0          )
        ctx.lineTo(this.unit/8   , 0          )
        ctx.lineTo(this.unit/8   , this.unit*2)
        ctx.lineTo(0             , this.unit*2)
        ctx.stroke()
        ctx.restore()

        for (var row = 1 ; row < 8 ; row+=2) {
            ctx.save()
            ctx.translate(this.unit*(1+row*2), this.unit*5)
            ctx.beginPath()
            ctx.strokeStyle = strokeStyle
            ctx.lineCap = "round"
            ctx.lineWidth = 8
            ctx.moveTo(-this.unit/8 + 0                  ,  0          )
            ctx.lineTo(-this.unit/8 + this.unit*(1-scale), -this.unit*2)
            ctx.lineTo(               this.unit*(1-scale), -this.unit*2)
            ctx.stroke()
            ctx.moveTo(            this.unit*(1+scale)   , -this.unit*2)
            ctx.lineTo(this.unit/8+this.unit*(1+scale)   , -this.unit*2)
            ctx.lineTo(this.unit/8+this.unit*2           ,  0          )
            ctx.stroke()
            ctx.restore()
        }

        for (var row = 1 ; row < 8 ; row+=2) {
            ctx.save()
            ctx.translate(this.unit*(1+row*2), this.unit*7)
            ctx.beginPath()
            ctx.strokeStyle = strokeStyle
            ctx.lineCap = "round"
            ctx.lineWidth = 8
            ctx.moveTo(-this.unit/8 + 0                  , 0          )
            ctx.lineTo(-this.unit/8 + this.unit*(1-scale), this.unit*2)
            ctx.lineTo(               this.unit*(1-scale), this.unit*2)
            ctx.stroke()
            ctx.moveTo(            this.unit*(1+scale)   , this.unit*2)
            ctx.lineTo(this.unit/8+this.unit*(1+scale)   , this.unit*2)
            ctx.lineTo(this.unit/8+this.unit*2           , 0          )
            ctx.stroke()
            ctx.restore()
        }

        ctx.drawImage(originalCanvas, 0, 0)

        ctx.save()
        ctx.translate(this.unit, this.unit)
        ctx.beginPath()
        ctx.strokeStyle = strokeStyle
        ctx.setLineDash([10, 30])
        ctx.lineCap = "round"
        ctx.lineWidth = 8
        ctx.moveTo(this.unit*(1-scale), this.unit*2        )
        ctx.lineTo(this.unit*0,         this.unit*(1+scale))
        ctx.lineTo(this.unit*0,         this.unit*(1-scale))
        ctx.lineTo(this.unit*(1-scale), 0                  )
        ctx.lineTo(this.unit*(1+scale), 0                  )
        ctx.lineTo(this.unit*2,         this.unit*(1-scale))
        ctx.lineTo(this.unit*2,         this.unit*(1+scale))
        ctx.lineTo(this.unit*(1+scale), this.unit*2        )
        ctx.stroke()
        ctx.restore()

        ctx.save()
        ctx.translate(this.unit, this.unit*9)
        ctx.beginPath()
        ctx.strokeStyle = strokeStyle
        ctx.setLineDash([10, 30])
        ctx.lineCap = "round"
        ctx.lineWidth = 8
        ctx.moveTo(this.unit*(1-scale), 0                  )
        ctx.lineTo(this.unit*0,         this.unit*(1-scale))
        ctx.lineTo(this.unit*0,         this.unit*(1+scale))
        ctx.lineTo(this.unit*(1-scale), this.unit*2        )
        ctx.lineTo(this.unit*(1+scale), this.unit*2        )
        ctx.lineTo(this.unit*2,         this.unit*(1+scale))
        ctx.lineTo(this.unit*2,         this.unit*(1-scale))
        ctx.lineTo(this.unit*(1+scale), 0                  )
        ctx.stroke()
        ctx.restore()

        ctx.save()
        ctx.translate(this.unit, this.unit*5)
        ctx.beginPath()
        ctx.strokeStyle = strokeStyle
        ctx.setLineDash([10, 30])
        ctx.lineCap = "round"
        ctx.lineWidth = 8
        ctx.moveTo(this.unit*0        , 0             )
        ctx.lineTo(this.unit*16       , 0             )
        ctx.stroke()
        ctx.restore()

        ctx.save()
        ctx.translate(this.unit, this.unit*7)
        ctx.beginPath()
        ctx.strokeStyle = strokeStyle
        ctx.setLineDash([10, 30])
        ctx.lineCap = "round"
        ctx.lineWidth = 8
        ctx.moveTo(this.unit*0        , 0             )
        ctx.lineTo(this.unit*16       , 0             )
        ctx.stroke()
        ctx.restore()

        for (var row = 0 ; row < 8 ; row++) {
            ctx.save()
            ctx.translate(this.unit*(1+row*2), this.unit*5)
            ctx.beginPath()
            ctx.strokeStyle = strokeStyle
            ctx.setLineDash([10, 30])
            ctx.lineCap = "round"
            ctx.lineWidth = 8
            ctx.moveTo(0                  ,  0          )
            ctx.lineTo(this.unit*(1-scale), -this.unit*2)
            ctx.lineTo(this.unit*(1+scale), -this.unit*2)
            ctx.lineTo(this.unit*2        ,  0          )
            ctx.stroke()
            ctx.restore()
        }

        for (var row = 0 ; row < 8 ; row++) {
            ctx.save()
            ctx.translate(this.unit*(1+row*2), this.unit*7)
            ctx.beginPath()
            ctx.strokeStyle = strokeStyle
            ctx.setLineDash([10, 30])
            ctx.lineCap = "round"
            ctx.lineWidth = 8
            ctx.moveTo(0                  , 0          )
            ctx.lineTo(this.unit*(1-scale), this.unit*2)
            ctx.lineTo(this.unit*(1+scale), this.unit*2)
            ctx.lineTo(this.unit*2        , 0          )
            ctx.stroke()
            ctx.restore()
        }

        for (var row = 0 ; row <= 8 ; row++) {
            ctx.save()
            ctx.translate(this.unit*(1+row*2), this.unit*5)
            ctx.beginPath()
            ctx.strokeStyle = strokeStyle
            ctx.setLineDash([10, 30])
            ctx.lineCap = "round"
            ctx.lineWidth = 8
            ctx.moveTo(0             , 0          )
            ctx.lineTo(0             , this.unit*2)
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
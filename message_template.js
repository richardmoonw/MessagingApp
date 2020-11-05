class ASCPMessage {

    constructor() {
        this.OFFSET_SIGNATURE = 0
        this.OFFSET_VERSION   = 4
        this.OFFSET_TAM_DATOS = 9
        this.OFFSET_FUNCION   = 10
        this.OFFSET_ESTADO    = 12
        this.OFFSET_ID_SESION = 16
        this.OFFSET_DATOS     = 20
        this.OFFSET_MAC       = 236
        this.MSG_SIZE         = 256
        this.message = new Uint8Array(this.MSG_SIZE).fill(0);
        this.message[this.OFFSET_SIGNATURE] = 65;       // A
        this.message[this.OFFSET_SIGNATURE + 1] = 83;   // S
        this.message[this.OFFSET_SIGNATURE + 2] = 67;   // C
        this.message[this.OFFSET_SIGNATURE + 3] = 80;   // P
        this.message[this.OFFSET_VERSION] = 0
        this.message[this.OFFSET_VERSION + 1] = 1
        this.message[this.OFFSET_ESTADO] = 0
        this.message[this.OFFSET_ESTADO + 1] = 0
        this.message[this.OFFSET_ID_SESION    ] = 0
        this.message[this.OFFSET_ID_SESION + 1] = 0
        this.message[this.OFFSET_FUNCION] = 0
        this.message[this.OFFSET_FUNCION + 1] = 1
    }

    setDatos(datos){
        var i = this.OFFSET_DATOS;
        Array.from(datos).forEach(element => {
            this.message[i] = element.charCodeAt(0);
            i = i + 1;
        });
        this.message[this.OFFSET_TAM_DATOS] = i - this.OFFSET_DATOS;
    }

    getDatos(){
        return this.message
    }

    showDatos() {
        this.message.forEach(element => console.log(element));
    }

    setText(texto){
        this.setDatos(texto)
    }

    getText(){
        var t = ''
        for(var i = this.OFFSET_DATOS;i < this.OFFSET_DATOS + this.message[OFFSET_TAM_DATOS];i++){
            t = t + this.message[i]
        }
    }

    setInitMessages(func, alpha, q, y) {
        this.message[this.OFFSET_FUNCION+1] = func;
        var message = "q="+q+",a="+alpha+",y="+y;
        this.setDatos(message);
    }

    setMac(mac) {
        var i = this.OFFSET_MAC;
        Array.from(mac).forEach(element => {
            this.message[i] = element;
            i = i + 1;
        });
    }
}

export default ASCPMessage;
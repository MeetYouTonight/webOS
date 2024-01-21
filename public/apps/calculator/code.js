let display = document.getElementById("display");
let lastOp=null;

window.onload=()=>{
    display.value=0
}

function inputNum( el ){
    let inp = el.innerText;
    if( display.value=="0" && inp!="." )
        display.value = inp;
    else
        display.value += inp;
    lastOp = null;
}

function inputFunc( el ){
    let op = el.innerText;
    let temp = display.value;

    switch (op) {
        case "+":
        case "-":
        case "x":
        case "/":
            if( lastOp==null ){
                display.value+=op;
                lastOp=op;
            }else{
                display.value=temp.substring( 0, temp.length-1 )+op;
            }
            break;
        case "<":
            if(temp.length==1)
                display.value=0
            else
                display.value=temp.substring( 0, temp.length-1 );
            
            temp=display.value;
            lastInp = temp[temp.length-1]
            if( isNaN(Number(lastInp)) )
                lastOp = lastInp;
            else
                lastOp = null;
            break;
        case "AC":
            display.value = 0;
            lastOp=null;
            break;
        case "=":
            display.value=eval(temp.replaceAll("x","*"));
            lastOp=op;
            break;
        default:
            break;
    }
}
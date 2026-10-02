/* Scientific parser: no eval, Function constructor or property access. */
(function () {
  function calculate(source,degrees) {
    const parts=source.replace(/\s+/g,'').match(/(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?|[a-z]+|[()+\-*/^%!]/gi)||[];
    if(parts.join('')!==source.replace(/\s+/g,''))throw Error('Unsupported character.');
    if(parts.length>500)throw Error('Limit expressions to 500 tokens.');
    let pos=0,depth=0;
    const peek=()=>parts[pos];
    const functions={sqrt:Math.sqrt,abs:Math.abs,ln:Math.log,log:Math.log10,exp:Math.exp,floor:Math.floor,ceil:Math.ceil,round:Math.round,sin:x=>Math.sin(degrees?x*Math.PI/180:x),cos:x=>Math.cos(degrees?x*Math.PI/180:x),tan:x=>Math.tan(degrees?x*Math.PI/180:x),asin:x=>Math.asin(x)*(degrees?180/Math.PI:1),acos:x=>Math.acos(x)*(degrees?180/Math.PI:1),atan:x=>Math.atan(x)*(degrees?180/Math.PI:1)};
    function atom(){if(++depth>100)throw Error('Expression is too deeply nested.');let v,t=parts[pos++];if(t==='('){v=sum();if(parts[pos++]!==')')throw Error('Missing closing parenthesis.');}else if(t==='pi')v=Math.PI;else if(t==='e')v=Math.E;else if(functions[t]){if(parts[pos++]!=='(')throw Error('Functions need parentheses.');v=functions[t](sum());if(parts[pos++]!==')')throw Error('Missing function parenthesis.');}else if(t&&/^(\d|\.)/.test(t))v=Number(t);else throw Error('Expected a number, constant or function.');while(peek()==='%'||peek()==='!'){const op=parts[pos++];if(op==='%')v/=100;else {if(!Number.isInteger(v)||v<0||v>170)throw Error('Factorial needs an integer from 0 to 170.');let n=1;for(let i=2;i<=v;i++)n*=i;v=n;}}depth--;return v;}
    function power(){const v=atom();if(peek()==='^'){pos++;return v**unary();}return v;}
    function unary(){if(peek()==='+'){pos++;return unary();}if(peek()==='-'){pos++;return -unary();}return power();}
    function product(){let v=unary();while(peek()==='*'||peek()==='/'){const op=parts[pos++],r=unary();if(op==='/'&&r===0)throw Error('Cannot divide by zero.');v=op==='*'?v*r:v/r;}return v;}
    function sum(){let v=product();while(peek()==='+'||peek()==='-'){const op=parts[pos++],r=product();v=op==='+'?v+r:v-r;}return v;}
    const result=sum();if(pos!==parts.length)throw Error('Unexpected token: '+peek());if(!Number.isFinite(result))throw Error('Result is not a finite real number.');return Number(result.toPrecision(13));
  }
  window.SS = window.SS || {}; SS.scientific=calculate;
  const form=document.getElementById('scientific-form');
  if(!form)return;
  form.onsubmit=e=>{e.preventDefault();const source=document.getElementById('scientific-expression').value;try{const result=calculate(source,document.getElementById('angle-mode').value==='Degrees');document.getElementById('scientific-result').textContent=String(result);const li=document.createElement('li');li.textContent=source+' = '+result;li.onclick=()=>SS.copy(li.textContent);document.getElementById('tape').prepend(li);document.getElementById('tape-empty').hidden=true;while(document.getElementById('tape').children.length>30)document.getElementById('tape').lastChild.remove();}catch(err){document.getElementById('scientific-result').textContent='Error: '+err.message;}};
})();

var canvas;
var gl;

var NumVertices  = 36;

var pointsArray = [];
var colorsArray = [];

var vertices = [
    [ 1.0, -1.0, -1.0, 1.0,],
    [ 1.0, -1.0,  1.0, 1.0,],
    [ 1.0,  1.0,  1.0, 1.0,],
    [ 1.0,  1.0, -1.0, 1.0,],
    [-1.0, -1.0, -1.0, 1.0,],
    [-1.0, -1.0,  1.0, 1.0,],
    [-1.0,  1.0,  1.0, 1.0,],
    [-1.0,  1.0, -1.0, 1.0,] ];

var vertexColors = [
    [0.0, 0.0, 0.0, 1.0,],  // black
    [1.0, 0.0, 0.0, 1.0,],  // red
    [1.0, 1.0, 0.0, 1.0,],  // yellow
    [0.0, 1.0, 0.0, 1.0,],  // green
    [0.0, 0.0, 1.0, 1.0,],  // blue
    [1.0, 0.0, 1.0, 1.0,],  // magenta
    [0.0, 1.0, 1.0, 1.0,],  // cyan
    [1.0, 1.0, 1.0, 1.0,]  // white
];

var near = 1.0;
var far = 100.0;
var D = 5.0;
var theta  = 1.57;
var phi    = 1.57;
var stheta=radToDeg(theta).toString()+"%";
var sphi=radToDeg(phi).toString()+"%";
var dr = 5.0 * Math.PI/180.0;

var  fovy = 40.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect;       // Viewport aspect ratio

var mvMatrix, cameraMatrix, pMatrix;
var modelView, projection;
var eye;
var at = [0, 0, 0];
var up = [0, 0, 1];

var gc_btnw=6, gc_btnh=3;
var btnw=gc_btnw.toString()+"%", btnh=gc_btnh.toString()+"%";

function quad(a, b, c, d) {
     pointsArray.push(vertices[a]); 
     colorsArray.push(vertexColors[a]); 
     pointsArray.push(vertices[b]); 
     colorsArray.push(vertexColors[a]); 
     pointsArray.push(vertices[c]); 
     colorsArray.push(vertexColors[a]);     
     pointsArray.push(vertices[a]); 
     colorsArray.push(vertexColors[a]); 
     pointsArray.push(vertices[c]); 
     colorsArray.push(vertexColors[a]); 
     pointsArray.push(vertices[d]); 
     colorsArray.push(vertexColors[a]);  
}

function colorCube(){
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

//callback functions
function myFunction1(){
    near  *= 1.1; far *= 1.1; render(); 
}
function myFunction2(){
    near  *= 0.9; far *= 0.9; render(); 
}
function myFunction3(){
    D *= 1.1; render(); 
}
function myFunction4(){
    D *= 0.9; render(); 
}
function myFunction5(){
    theta += dr; render(); 
}
function myFunction6(){
    theta -= dr; render(); 
}
function myFunction7(){
    phi += dr; render(); 
}
function myFunction8(){
    phi -= dr; render(); 
}
function changeHandler1() {
    var gc_theta = document.getElementById("range1").value;
    $("#upload1").text(gc_theta+" ");
    theta=degToRad(gc_theta);
    render();
  }
function changeHandler2() {
    var gc_phi = document.getElementById("range2").value;
    $("#upload2").text(gc_phi+" ");
    phi=degToRad(gc_phi);
    render();
  }

function define_gui(){
    detector();

    btn("Button1", "2%", "4%", btnw, btnh, myFunction1, "IncreaseZ", "lightgreen", "");
    btn("Button2", "9%", "4%", btnw, btnh, myFunction2, "DecreaseZ", "lightgreen", "");
    btn("Button3", "16%", "4%", btnw, btnh, myFunction3, "IncreaseR", "yellow", "");
    btn("Button4", "23%", "4%", btnw, btnh, myFunction4, "DecreaseR", "yellow", "");
    btn("Button5", "2%", "9%", btnw, btnh, myFunction5, "IncreaseTheta", "red", "");
    btn("Button6", "9%", "9%", btnw, btnh, myFunction6, "DecreaseTheta", "red", "");
    btn("Button7", "16%", "9%", btnw, btnh, myFunction7, "IncreasePhi", "lightblue", "");
    btn("Button8", "23%", "9%", btnw, btnh, myFunction8, "DecreasePhi", "lightblue", "");

    lbl("label1", "2%", "81%", "100", "50", "Change Theta");
    rng("range1", "2%", "83%", "", "", "180", changeHandler1, "0", "360", stheta); 
    div("upload1", "23%", "81%", "2%", "2%");

    lbl("label2", "2%", "88%", "100", "50", "Change Phi");
    rng("range2", "2%", "91%", "", "", "90", changeHandler2, "0", "180", sphi); 
    div("upload2", "23%", "88%", "2%", "2%");
}

window.onload = function init() {

    define_gui();
    
    canvas = document.getElementById( "mycanvas" );
 
    gl = canvas.getContext("webgl");
    if (!gl) {
      alert( "WebGL isn't available" );
      return;
    } 

    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    aspect =  canvas.width/canvas.height;
    
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    //gl.enable(gl.CULL_FACE,null);
    gl.enable(gl.DEPTH_TEST);
    
    //
    //  Load shaders and initialize attribute buffers
    //
    // setup GLSL program
    var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader", "fragment-shader"]);
    gl.useProgram( program );
    
    colorCube();

    // console.log(pointsArray.length);
    // var temp=webglUtils.createAugmentedTypedArray(4, 36);
    // for (var i=0; i<pointsArray.length; i++){
    //     temp.push(pointsArray[i]);
    // }
    // pointsArray=temp;
    // console.log(pointsArray)

    pointsArray=m4.flatten(pointsArray);
    colorsArray=m4.flatten(colorsArray);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, colorsArray, gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, pointsArray, gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
 
    modelView = gl.getUniformLocation( program, "modelView" );
    projection = gl.getUniformLocation( program, "projection" );
       
    render(); 
}

function degToRad(d) {
   return d * Math.PI / 180;
}

function radToDeg(r) {
    return r * 180 / Math.PI;
 }

var render = function(){
    // Tell WebGL how to convert from clip space to pixels
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 

    eye = [D*Math.sin(phi)*Math.cos(theta), 
           D*Math.sin(phi)*Math.sin(theta),
           D*Math.cos(phi)];
    // Compute the camera's matrix
    var cameraMatrix = m4.lookAt(eye, at, up);
    
   // Make a view matrix from the camera matrix.
    var mvMatrix = m4.inverse(cameraMatrix);

    // Compute the projection matrix
    var pMatrix = m4.perspective(degToRad(fovy), aspect, near, far);

    gl.uniformMatrix4fv( modelView, false, mvMatrix );
    gl.uniformMatrix4fv( projection, false, pMatrix );            
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

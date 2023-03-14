'use strict';

async function main() {
  
  /** @type {HTMLCanvasElement} */
  const canvas = document.getElementById('canvas');
  const gl = canvas.getContext('webgl');
  if (!gl) {
    return;
  }

  const ext = gl.getExtension('WEBGL_depth_texture');
  if (!ext) {
    return alert('need WEBGL_depth_texture');
  }

  define_gui();
  
  const sceneProgramInfo = webglUtils.createProgramInfo(gl, ['vertex-shader-3d', 'fragment-shader-3d']);
  const colorProgramInfo = webglUtils.createProgramInfo(gl, ['color-vertex-shader', 'color-fragment-shader']);
  
  txt[0] = textureFromImage(gl, PATH_WOOD);
  txt[1] = textureFromImage(gl, PATH_BRICKS);
  txt[2] = textureFromImage(gl, PATH_BRICKS2);
  txt[3] = textureFromImage(gl, PATH_WINDOW);
  txt[4] = textureFromImage(gl, PATH_TV);
 

  //await new Promise(r => setTimeout(r, 2000));

  const planeBufferInfo = primitives.createPlaneBufferInfo(
    gl,
    20,  
    20,  
    2, 
    2,
);

  const cubeLinesBufferInfo = webglUtils.createBufferInfoFromArrays(gl, {
    position: [
      -1, -1, -1,
       1, -1, -1,
      -1,  1, -1,
       1,  1, -1,
      -1, -1,  1,
       1, -1,  1,
      -1,  1,  1,
       1,  1,  1,
    ],
    indices: [
      0, 1,
      1, 3,
      3, 2,
      2, 0,

      4, 5,
      5, 7,
      7, 6,
      6, 4,

      0, 4,
      1, 5,
      3, 7,
      2, 6,
    ],
  });


  // ------- LOAD OBJ MODELS ------ //


  // SOFA MODEL

  const objHref = 'data/sofa.obj';  
  const response = await fetch(objHref);
  const text = await response.text();
  const obj = parseOBJ(text);
  const baseHref = new URL(objHref, window.location.href);
  const matTexts = await Promise.all(obj.materialLibs.map(async filename => {
    const matHref = new URL(filename, baseHref).href;
    const response = await fetch(matHref);
    return await response.text();
  }));
  const materials = parseMTL(matTexts.join('\n'));

  const textures = {
    defaultWhite: create1PixelTexture(gl, [255, 255, 255, 255]),
  };

  for (const material of Object.values(materials)) {
    Object.entries(material)
      .filter(([key]) => key.endsWith('Map'))
      .forEach(([key, filename]) => {
        let texture = textures[filename];
        if (!texture) {
          const textureHref = new URL(filename, baseHref).href;
          texture = createTexture(gl, textureHref);
          textures[filename] = texture;
        }
        material[key] = texture;
      });
  }

  const defaultMaterial = {
    diffuse: [1, 1, 1],
    diffuseMap: textures.defaultWhite,
    ambient: [0, 0, 0],
    specular: [1, 1, 1],
    shininess: 400,
    opacity: 1,
  };

  const parts = obj.geometries.map(({material, data}) => {
    if (data.color) {
      if (data.position.length === data.color.length) {
        data.color = { numComponents: 3, data: data.color };
      }
    } else {
      data.color = { value: [1, 1, 1, 1] };
    }
    const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, data);
    return {
      material: {
        ...defaultMaterial,
        ...materials[material],
      },
      bufferInfo,
    };
  });

  
  // WALL MODEL

  const objHref_wall = 'data/wall.obj';  
  const response_wall = await fetch(objHref_wall);
  const text_wall = await response_wall.text();
  const obj_wall = parseOBJ(text_wall);
  const baseHref_wall = new URL(objHref_wall, window.location.href);
  const matTexts_wall = await Promise.all(obj.materialLibs.map(async filename => {
    const matHref_wall = new URL(filename, baseHref_wall).href;
    const response_wall = await fetch(matHref_wall);
    return await response_wall.text();
  }));
  const materials_wall = parseMTL(matTexts_wall.join('\n'));

  const parts_wall = obj_wall.geometries.map(({material, data}) => {
    if (data.color) {
      if (data.position.length === data.color.length) {
        data.color = { numComponents: 3, data: data.color };
      }
    } else {
      data.color = { value: [1, 1, 1, 1] };
    }
    const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, data);
    return {
      material: {
        ...defaultMaterial,
        ...materials_wall[material],
      },
      bufferInfo,
    };
  });


  // WINDOW MODEL

  const objHref_window = 'data/window.obj';  
  const response_window = await fetch(objHref_window);
  const text_window = await response_window.text();
  const obj_window = parseOBJ(text_window);
  const baseHref_window = new URL(objHref_window, window.location.href);
  const matTexts_window = await Promise.all(obj.materialLibs.map(async filename => {
    const matHref_window = new URL(filename, baseHref_window).href;
    const response_window = await fetch(matHref_window);
    return await response_window.text();
  }));
  const materials_window = parseMTL(matTexts_window.join('\n'));

  const parts_window = obj_window.geometries.map(({material, data}) => {
    if (data.color) {
      if (data.position.length === data.color.length) {
        data.color = { numComponents: 3, data: data.color };
      }
    } else {
      data.color = { value: [1, 1, 1, 1] };
    }
    const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, data);
    return {
      material: {
        ...defaultMaterial,
        ...materials_window[material],
      },
      bufferInfo,
    };
  });


  // TV MODEL

  const objHref_tv = 'data/quadro.obj';  
  const response_tv = await fetch(objHref_tv);
  const text_tv = await response_tv.text();
  const obj_tv = parseOBJ(text_tv);
  const baseHref_tv = new URL(objHref_tv, window.location.href);
  const matTexts_tv = await Promise.all(obj.materialLibs.map(async filename => {
    const matHref_tv = new URL(filename, baseHref_tv).href;
    const response_tv = await fetch(matHref_tv);
    return await response_tv.text();
  }));
  
  const materials_tv = parseMTL(matTexts_tv.join('\n'));

  const parts_tv = obj_tv.geometries.map(({material, data}) => {
    

    if (data.color) {
      if (data.position.length === data.color.length) {
        data.color = { numComponents: 3, data: data.color };
      }
    } else {
      data.color = { value: [1, 1, 1, 1] };
    }
    const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, data);
    return {
      material: {
        ...defaultMaterial,
        ...materials_tv[material],
      },
      bufferInfo,
    };
  });


  // OTHER SCENE OBJECTS



   //UNIFORMS
   const ceilingUniforms = {
    u_world:m4.xRotate(m4.translation(0, 10, 0),-3.14159),
    u_texture: txt[BRICKS],
  };

  const floorUniforms = {
    u_colorMult: [1, 1, 1, 1],
    u_color: [1, 1, 1, 1],
    u_texture: txt[WOOD],
    u_world: m4.translation(0, 0, 0),
  };
  const wallUniforms1 = {
    u_colorMul: [1, 0.5, 1, 1],  
    u_color: [1, 1, 1, 1],
    u_texture: txt[BRICKS],
    u_world:m4.yRotate(m4.xRotate(m4.translation(0, 5, -5),degToRad(90)),degToRad(360)), 
  };

  const wallUniforms2 = {
    u_colorMult: [1, 1, 1, 1],  
    u_color: [1, 1, 1, 1],
    u_texture: txt[BRICKS2],
    u_world: m4.yRotate(m4.zRotate(m4.translation(5, 5, 0),degToRad(90)),degToRad(270)), 
  };

  const wallUniforms3 = {
    u_colorMult: [1, 1, 1, 1],
    u_color: [1, 1, 1, 1],
    u_texture: txt[BRICKS],
    u_world:m4.yRotate(m4.xRotate(m4.translation(0, 5, 5),degToRad(270)),degToRad(180)), 
  };
  

  var sofaUniforms = {
    u_world: m4.yRotate(m4.translation(0, 0, 0),3.1415),
  };

  const quadroUniforms = {
    u_world: m4.xRotate(m4.yRotate(m4.translation(-2.46, 3, 0),degToRad(90)),degToRad(270)),
    diffuseMap: txt[TV],
  };

  const wallObjUniforms = {
    u_world: m4.yRotate(m4.translation(-5,0, 0),degToRad(180)),
    diffuseMap: txt[BRICKS2],
    
  };

  const windowUniforms = {
    u_world:m4.yRotate(m4.translation(-5, 3, -2),3.14159),
    diffuseMap: txt[WINDOW],
  };

  // SOME BASE AND SHADOWS SETTINGS

  const depthTexture = gl.createTexture();
  const depthTextureSize = 512;
  gl.bindTexture(gl.TEXTURE_2D, depthTexture);
  gl.texImage2D(
      gl.TEXTURE_2D,      
      0,                  
      gl.DEPTH_COMPONENT, 
      depthTextureSize,   
      depthTextureSize,   
      0,                  
      gl.DEPTH_COMPONENT, 
      gl.UNSIGNED_INT,    
      null);              
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const depthFramebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
  gl.framebufferTexture2D(
      gl.FRAMEBUFFER,       
      gl.DEPTH_ATTACHMENT, 
      gl.TEXTURE_2D,        
      depthTexture,         
      0);                   

  const unusedTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, unusedTexture);
  gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      depthTextureSize,
      depthTextureSize,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);


  gl.framebufferTexture2D(
      gl.FRAMEBUFFER,        
      gl.COLOR_ATTACHMENT0,  
      gl.TEXTURE_2D,         
      unusedTexture,        
      0);   
      
  function define_gui() {
    var gui = new dat.GUI();
    
    gui.add(settings,"D").min(4).max(7).step(0.5).onChange(function() {
      render();});
    gui.add(settings,"posX").min(0).max(10).step(0.5).onChange(function() {
      render();});
    gui.add(settings,"posY").min(0).max(10).step(0.5).onChange(function() {
      render();});
    gui.add(settings,"posZ").min(0).max(10).step(0.5).onChange(function() {
      render();});
    gui.add(settings,"targetX").min(0).max(5).step(0.5).onChange(function() {
      render();});
    gui.add(settings,"targetY").min(-1).max(5).step(0.5).onChange(function() {
      render();});
    gui.add(settings,"targetZ").min(0).max(5).step(0.5).onChange(function() {
      render();});
    gui.add(settings,"projWidth").min(0).max(7).step(0.5).onChange(function() {
      render();});
    gui.add(settings,"projHeight").min(0).max(7).step(0.5).onChange(function() {
      render();});
    gui.add(settings,"bias").min(-0.01).max(0.001).step(0.0001).onChange(function() {
      render();});
    gui.add(settings,"lightFieldOfView").min(60).max(120).step(5).onChange(function() {
      render();});
    gui.add(settings,"dx").min(-2.5).max(2.5).step(0.1).onChange(function() {
      render();});
    gui.add(settings,"dz").min(-2.5).max(2.5).step(0.1).onChange(function() {
      render();});
    gui.add(settings,"spotLight").onChange(function() {
      render();});
    gui.add(settings,"lightFrustum").onChange(function() {
      render();});
    gui.add(settings,"shadows").onChange(function() {
      render();});

    gui.close();
}  

  function drawScene(projectionMatrix,cameraMatrix,textureMatrix,lightWorldMatrix,programInfo) {

    const viewMatrix = m4.inverse(cameraMatrix);
    gl.useProgram(programInfo.program);

    webglUtils.setUniforms(programInfo, {
      u_view: viewMatrix,
      u_projection: projectionMatrix,
      u_bias: settings.bias,
      u_textureMatrix: textureMatrix,
      u_projectedTexture: depthTexture,
      u_reverseLightDirection: lightWorldMatrix.slice(8, 11),
    });
    

    gl.uniform1f(gl.getUniformLocation(programInfo.program, "mesh"), 0.);

    // ------ Draw the ceiling -----
    webglUtils.setBuffersAndAttributes(gl, programInfo, planeBufferInfo);
    webglUtils.setUniforms(programInfo, ceilingUniforms);
    webglUtils.drawBufferInfo(gl, planeBufferInfo);


    // ------ Draw the floor --------
    webglUtils.setBuffersAndAttributes(gl, programInfo, planeBufferInfo);
    webglUtils.setUniforms(programInfo, floorUniforms);
   
    webglUtils.drawBufferInfo(gl, planeBufferInfo);

    // ------ Draw the first wall --------
    webglUtils.setBuffersAndAttributes(gl, programInfo, planeBufferInfo);
    webglUtils.setUniforms(programInfo, wallUniforms1);
    webglUtils.drawBufferInfo(gl, planeBufferInfo);


    // ------ Draw the second wall --------
    webglUtils.setBuffersAndAttributes(gl, programInfo, planeBufferInfo);
    webglUtils.setUniforms(programInfo, wallUniforms2);
    webglUtils.drawBufferInfo(gl, planeBufferInfo);


     // ------ Draw the third wall --------
    webglUtils.setBuffersAndAttributes(gl, programInfo, planeBufferInfo);
    webglUtils.setUniforms(programInfo, wallUniforms3);
    webglUtils.drawBufferInfo(gl, planeBufferInfo);



    // ---- Draw OBJS -----
    gl.uniform1f(gl.getUniformLocation(programInfo.program, "mesh"), 1.);
   

    // ---- Draw Sofa ----
    webglUtils.setUniforms(programInfo, sofaUniforms);
    for (const {bufferInfo, material} of parts) {
      webglUtils.setBuffersAndAttributes(gl, programInfo, bufferInfo);
      webglUtils.setUniforms(programInfo, material);
      webglUtils.drawBufferInfo(gl, bufferInfo);
    }


    // ----- Draw TV ----
    webglUtils.setUniforms(programInfo, quadroUniforms);
    for (const {bufferInfo, material} of parts_tv) {
      webglUtils.setBuffersAndAttributes(gl, programInfo, bufferInfo);
      webglUtils.setUniforms(programInfo, materials_tv);
      webglUtils.drawBufferInfo(gl, bufferInfo);
    }


    // Draw the wall with the window
    webglUtils.setUniforms(programInfo, wallObjUniforms);
    for (const {bufferInfo, material} of parts_wall) { 
      webglUtils.setBuffersAndAttributes(gl, programInfo, bufferInfo);
      webglUtils.setUniforms(programInfo, materials_wall);
      webglUtils.drawBufferInfo(gl, bufferInfo);
    }

    
    // Draw the window
    webglUtils.setUniforms(programInfo, windowUniforms);
    for (const {bufferInfo, material} of parts_window) {
      webglUtils.setBuffersAndAttributes(gl, programInfo, bufferInfo);
      webglUtils.setUniforms(programInfo, materials_window);
      webglUtils.drawBufferInfo(gl, bufferInfo);
    }
    
    
  }

  
  var THETA = degToRad(40), PHI = degToRad(100);
  var drag, old_x, old_y, dX, dY;
  
  canvas.addEventListener("mousedown", function(e) {
      drag = true;
      old_x = e.pageX
      old_y = e.pageY;
      e.preventDefault();
  }, false)

  canvas.addEventListener("mouseup", function(e) {
      drag = false;
  }, false)

  canvas.addEventListener("mousemove", function(e) {
      if (!drag) {
          return false; 
      }
      dX = -(e.pageX - old_x) * 2 * Math.PI / canvas.width; 
      dY = -(e.pageY - old_y) * 2 * Math.PI / canvas.height; 
      THETA += dX;
      PHI += dY;
      old_x = e.pageX;
      old_y = e.pageY; 
      e.preventDefault();
      render();
  }, false);

    
canvas.addEventListener("touchstart", function (e) {
    drag = true;
    old_x =  e.touches[0].clientX;
    old_y =  e.touches[0].clientY;
    e.preventDefault();  
}, false);

canvas.addEventListener("touchend", function (e) {
    drag = false;
}, false);

canvas.addEventListener("touchmove", function (e) {
    if (!drag) {
        return false; 
    }
    dX = -(e.touches[0].clientX - old_x) * 2 * Math.PI / canvas.width; 
    dY = -(e.touches[0].clientY - old_y) * 2 * Math.PI / canvas.height; 
    THETA += dX;
    PHI += dY;
    old_x = e.touches[0].clientX;
    old_y = e.touches[0].clientY;
    e.preventDefault();
    render();
}, false);


window.addEventListener("keydown", function (event) {
    
    if (event.defaultPrevented) {
        return;
    }
    switch (event.key) {
        case "ArrowLeft": 
            if(settings.dx>=-2.5){
            settings.dx -= 0.1;
            render();
            }
            break;
        case "ArrowUp": 
          if(settings.dz<=2.5){
            settings.dz += 0.1;
            render();
          }
            break;
        case "ArrowRight":
            if(settings.dx<=2.5){
            settings.dx += 0.1;
            render();
            }
            break;
        case "ArrowDown": 
        if(settings.dz>=-2.5){
          settings.dz -= 0.1;
          render();
        }
            break;
        default:
            return; 
    }
    event.preventDefault(); 
}, true);


  function render() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    const lightWorldMatrix = m4.lookAt(
        [settings.posX, settings.posY, settings.posZ],         
        [settings.targetX, settings.targetY, settings.targetZ], 
        [0, 1, 0],                                             
    );
    const lightProjectionMatrix = settings.spotLight
        ? m4.perspective(
            degToRad(settings.lightFieldOfView),
            settings.projWidth / settings.projHeight,
            1,  
            15)   
        : m4.orthographic(
            -settings.projWidth / 2,   
             settings.projWidth / 2,   
            -settings.projHeight / 2, 
             settings.projHeight / 2,  
             1,                      
             15);    
                    

    gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
    gl.viewport(0, 0, depthTextureSize, depthTextureSize);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const target = [0, 3, 0];
    const up = [0, 1, 0];
    
    var camera = [settings.D*Math.sin(PHI)*Math.cos(THETA), settings.D*Math.sin(PHI)*Math.sin(THETA), settings.D*Math.cos(PHI)];
    
    const cameraMatrix = m4.lookAt(camera, target, up) ;
    sofaUniforms = {
      u_world: m4.yRotate(m4.translation(settings.dx, 0, settings.dz),3.1415),
    };
    
    if(settings.shadows){
      drawScene(lightProjectionMatrix,lightWorldMatrix,m4.identity(),lightWorldMatrix,colorProgramInfo);
    }
    
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let textureMatrix = m4.identity();
    textureMatrix = m4.translate(textureMatrix, 0.5, 0.5, 0.5);
    textureMatrix = m4.scale(textureMatrix, 0.5, 0.5, 0.5);
    textureMatrix = m4.multiply(textureMatrix, lightProjectionMatrix);
    
    textureMatrix = m4.multiply(
        textureMatrix,
        m4.inverse(lightWorldMatrix));

   
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const projectionMatrix =
        m4.perspective(fieldOfViewRadians, aspect, 1, 2000); 

    const viewMatrix = m4.inverse(cameraMatrix);
    const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);
    
    drawScene(viewProjectionMatrix,cameraMatrix,textureMatrix,lightWorldMatrix,sceneProgramInfo);
      
    if(settings.lightFrustum){
      const viewMatrix = m4.inverse(cameraMatrix);
      gl.useProgram(colorProgramInfo.program);

    
      webglUtils.setBuffersAndAttributes(gl, colorProgramInfo, cubeLinesBufferInfo);

      const mat = m4.multiply(
          lightWorldMatrix, m4.inverse(lightProjectionMatrix));
      webglUtils.setUniforms(colorProgramInfo, {
        u_color: [1, 1, 1, 1],
        u_view: viewMatrix,
        u_projection: projectionMatrix,
        u_world: mat,
      });
      webglUtils.drawBufferInfo(gl, cubeLinesBufferInfo, gl.LINES);
    }
    
  }
  render();
  
}

var program;
radius = 1.4, fovy = 1.4;

const HTMLpoiText = document.getElementById("poiText");
const HTMLpoiSelector = document.getElementById("poiSelector");
const HTMLinfoMessage = document.getElementById("infoMessage");
const HTMLpoiSettings = document.getElementById("poiSettings");
const HTMLStartGameButton = document.getElementById("startGameButton");
const HTMLpunter = document.getElementById('punter');
const HTMLvelocityRange= document.getElementById('velCamera');
const HTMLlights = document.getElementById("lightsDiv");



function initShaders() {
    
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, document.getElementById("myVertexShader").text);
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(vertexShader));
    return null;
  }
 
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, document.getElementById("myFragmentShader").text);
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(fragmentShader));
    return null;
  }
  
  program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  
  gl.linkProgram(program);
    
  gl.useProgram(program);
  
  program.vertexPositionAttribute = gl.getAttribLocation(program, "VertexPosition");
  gl.enableVertexAttribArray(program.vertexPositionAttribute);

  program.modelViewMatrixIndex  = gl.getUniformLocation(program,"modelViewMatrix");
  program.projectionMatrixIndex = gl.getUniformLocation(program,"projectionMatrix");

  // normals
  program.vertexNormalAttribute = gl.getAttribLocation ( program, "VertexNormal");
  program.normalMatrixIndex     = gl.getUniformLocation( program, "normalMatrix");
  gl.enableVertexAttribArray(program.vertexNormalAttribute);

    // material
    program.KaIndex               = gl.getUniformLocation( program, "Material.Ka");
    program.KdIndex               = gl.getUniformLocation( program, "Material.Kd");
    program.KsIndex               = gl.getUniformLocation( program, "Material.Ks");
    program.alphaIndex            = gl.getUniformLocation( program, "Material.alpha");



    // fuente de luz
    program.Lights               = gl.getUniformLocation( program, "Lights");
    program.nLights= gl.getUniformLocation( program, "nLights");

    //Textures
    program.vertexTexcoordsAttribute = gl.getAttribLocation ( program, "VertexTexcoords");
    gl.enableVertexAttribArray(program.vertexTexcoordsAttribute);

    program.myTextureIndex           = gl.getUniformLocation( program, 'myTexture');
    program.repetition               = gl.getUniformLocation( program, "repetition");
    gl.uniform1i(program.myTextureIndex, 3);
    gl.uniform1f(program.repetition,     1.0);

    program.useProcedural               = gl.getUniformLocation( program, "Procedural");
    gl.uniform1i(program.useProcedural , 0);

}

function initRendering() {
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.15,0.15,0.35,1.0);
  gl.lineWidth(1.5);
  setShaderLight();
}

function initBuffers(model) {

  model.idBufferNormals = gl.createBuffer ();
  gl.bindBuffer (gl.ARRAY_BUFFER, model.idBufferNormals);
  gl.bufferData (gl.ARRAY_BUFFER, new Float32Array(model.normals), gl.STATIC_DRAW);


  model.idBufferVertices = gl.createBuffer ();
  gl.bindBuffer (gl.ARRAY_BUFFER, model.idBufferVertices);
  gl.bufferData (gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
    
  
  model.idBufferTexture = gl.createBuffer ();
  gl.bindBuffer (gl.ARRAY_BUFFER, model.idBufferTexture);
  gl.bufferData (gl.ARRAY_BUFFER, new Float32Array(model.texcoords), gl.STATIC_DRAW);
  
  model.idBufferIndices = gl.createBuffer ();
  gl.bindBuffer (gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
  gl.bufferData (gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);


}

function setShaderMaterial(material){
  gl.uniform3fv(program.KaIndex,    material.mat_ambient);
  gl.uniform3fv(program.KdIndex,    material.mat_diffuse);
  gl.uniform3fv(program.KsIndex,    material.mat_specular);
  gl.uniform1f (program.alphaIndex, material.alpha);
}

function flattenLights(lights) {
    var flattened = [];
    for (var i = 0; i < lights.length; i++) {
        flattened = flattened.concat(
            lights[i].Position,
            lights[i].La,
            lights[i].Ld,
            lights[i].Ls
        );
    }
    return flattened;
}


function LightsTransform(lights){ // retorna les llums transformades per que siguin fixes
  let lightsTransformed=[];
  for(let i=0; i<lights.length; i++){
    if(lights[i].ences){
      let Lp=vec4.create();
      let lightPos=[lights[i].Position[0],lights[i].Position[1],lights[i].Position[2],1.0];
      mat4.multiply(Lp, Scene.camera.Matrix(),lightPos);
      let transformedLight={
        Position: [Lp[0],Lp[1],Lp[2]],
        La: [lights[i].La[0],lights[i].La[1],lights[i].La[2]],
        Ld: [lights[i].Ld[0],lights[i].Ld[1],lights[i].Ld[2]],
        Ls: [lights[i].Ls[0],lights[i].Ls[1],lights[i].Ls[2]],
      }
      lightsTransformed.push(transformedLight);
    }
  }
  return lightsTransformed;
}

function setShaderLight() {



  let lightsGlobalPos=LightsTransform(Scene.lights.data);

  gl.uniform1i(program.nLights, Scene.lights.amount());

  gl.uniform3fv(program.Lights, flattenLights(lightsGlobalPos));
  
}


function draw(model) {

  if(model.useProceduralTexture){
    gl.uniform1i(program.useProcedural , 1);
  }
  else {
    gl.uniform1i(program.useProcedural , 0);
  }

  //material
  setShaderMaterial(model.material);

  //normals
  gl.uniformMatrix3fv(program.normalMatrixIndex, false, model.getNormalMatrix(Scene.camera.ModelViewMatrix(model.modelMatrix)));
  
  gl.bindBuffer (gl.ARRAY_BUFFER, model.idBufferNormals);
  gl.vertexAttribPointer (program.vertexNormalAttribute,   3, gl.FLOAT, false, 0, 0);
  
  //texture
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, model.texture);
  gl.uniform1i(program.myTextureIndex, 0);
  gl.uniform1f(program.repetition,     model.textureRepetition);
  gl.bindBuffer (gl.ARRAY_BUFFER, model.idBufferTexture);
  gl.vertexAttribPointer (program.vertexTexcoordsAttribute, 2, gl.FLOAT, false, 0, 0);

  //vertex and indices
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, Scene.camera.ModelViewMatrix(model.modelMatrix));

  gl.bindBuffer(gl.ARRAY_BUFFER, model.idBufferVertices);
  gl.vertexAttribPointer(program.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
  gl.drawElements (gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);

}

function initPrimitives() {

  for(let i=0; i<Scene.objects.length;i++){
    initBuffers(Scene.objects[i]);
  }
  
}

function setProjection() {
    
  
  var projectionMatrix  = mat4.create();
  mat4.perspective(projectionMatrix, fovy, 1.0, 0.1, 100.0);
  
  
  gl.uniformMatrix4fv(program.projectionMatrixIndex,false,projectionMatrix);

}

//OBJECTE QUE GESTIONA LA CAMARA ---------------------------------------------------
var Camera = {
  speed: 0.05,
  freeCamYlimitBot: 0.2,
  freeCamYlimitTop: 10,
  yLimitBot: 0.2,
  yLimitTop: 10,
  tetha: -Math.PI/2,
  phi: Math.PI/2,
  turnSensibility: 0.002,
  eye: [0, 0.5, 5.5],
  up: [0, 1, 0],
  Front: function(){


    const x = Math.sin(this.phi) * Math.cos(this.tetha);
    const y = Math.cos(this.phi);
    const z = Math.sin(this.phi) * Math.sin(this.tetha);
    let front=[x,y,z];
    return VectorHelper.normalize(front);
  },
  Right: function(){
    return VectorHelper.normalize(VectorHelper.vectorialProduct(this.Front(),this.up));
  },
  Center: function(){
    return VectorHelper.sum(this.eye,this.Front());
  },
  MoveAhead: function(){
    let front=this.Front();
    let newEye=VectorHelper.sum(this.eye,VectorHelper.scale(front,this.speed));
    if(newEye[1]<this.yLimitBot) newEye[1]=this.yLimitBot;
    if(newEye[1]>this.yLimitTop) newEye[1]=this.yLimitTop;
    this.eye=newEye;
  },
  MoveBack: function(){
    let front=this.Front();
    let newEye=VectorHelper.sum(this.eye,VectorHelper.scale(front,-this.speed));
    if(newEye[1]<this.yLimitBot) newEye[1]=this.yLimitBot;
    if(newEye[1]>this.yLimitTop) newEye[1]=this.yLimitTop;
    this.eye=newEye;
  },
  MoveLeft: function(){
    let newEye =VectorHelper.sum(this.eye,VectorHelper.scale(this.Right(),-this.speed));
    if(newEye[1]<this.yLimitBot) newEye[1]=this.yLimitBot;
    if(newEye[1]>this.yLimitTop) newEye[1]=this.yLimitTop;
    this.eye=newEye;
  },
  MoveRight: function(){
    let newEye=VectorHelper.sum(this.eye,VectorHelper.scale(this.Right(),this.speed));
    if(newEye[1]<this.yLimitBot) newEye[1]=this.yLimitBot;
    if(newEye[1]>this.yLimitTop) newEye[1]=this.yLimitTop;
    this.eye=newEye;
  },
  TurnX: function(amount){
    this.tetha+=amount*this.turnSensibility;
  },
  TurnY: function(amount){
    //comprovació perque no pugui arribar a veure l'escena del revés, és a dir que el maxim sigui mirar cap amunt i cap avall pero no donis la volta
    if(((this.phi+amount*this.turnSensibility)* 180 / Math.PI)>0 && ((this.phi+amount*this.turnSensibility)* 180 / Math.PI)<180) this.phi+=amount*this.turnSensibility;
  },
  Matrix: function(){
    return mat4.lookAt(mat4.create(), this.eye,  this.Center(), this.up);
  },
  ModelViewMatrix: function(modelMatrix){
    let modelViewMatrix = mat4.create();
    mat4.multiply(modelViewMatrix, this.Matrix(), modelMatrix);
    return modelViewMatrix;
  },
  UpdatePos: function(poi){
    this.eye=poi.eye;
    this.up=poi.up;
    this.tetha=poi.tetha;
    this.phi=poi.phi;
  },
  animation: {
    playing: false,
    currentIndex: 0,
    timeEachInterpolation: 3,
    timeCurrentInterpolation:0,
    Play: function(pois){
      Scene.camera.UpdatePos(Scene.pOIS[0]);
      this.currentIndex=0;
      this.timeCurrentInterpolation=0;
      if (pois.length>1) this.playing=true;
    },
    LerpPoi(from,to,ratio){
      let interpolated={};
      interpolated.tetha=Lerp(from.tetha,to.tetha,ratio);
      interpolated.phi=Lerp(from.phi,to.phi,ratio);
      interpolated.up=VectorHelper.lerp(from.up,to.up,ratio);
      interpolated.eye=VectorHelper.lerp(from.eye,to.eye,ratio);
      return interpolated;
    },
    Update: function(delta,pois){
      this.timeCurrentInterpolation+=delta;
      while(this.timeCurrentInterpolation>this.timeEachInterpolation){
        this.timeCurrentInterpolation-=this.timeEachInterpolation;
        this.currentIndex++;
        if(this.currentIndex>=pois.length-1){
          this.Stop();
          return;
        }
      }
      let interpolatedPoi=this.LerpPoi(pois[this.currentIndex],pois[this.currentIndex+1],this.timeCurrentInterpolation/this.timeEachInterpolation);
      Scene.camera.UpdatePos(interpolatedPoi);
    },
    Stop: function(){
      this.currentIndex=0;
      this.timeCurrentInterpolation=0;
      this.playing=false;
    }
  },
}

//OBJECTE QUE GESTIONA LES LLUMS --------------------------------------------------------
var Lights={
  data : [
  ],
  amount: function(){
    let sum=0;
    for(let i=0;i<this.data.length;i++){
      if (this.data[i].ences) sum++;
    }
    return sum;
  }

}

//OBJECTE QUE GESTIONA L'ESCENA ----------------------------------------------------
var Scene={
  lights: Lights,
  camera: Camera,
  objects: [],
  drawingType: "solid",
  pOIS: [],
  lastTimestamp: 0,
  radius: 6,
  AddPoi: function(){
    let poi={
      eye: this.camera.eye,
      up: this.camera.up,
      tetha: this.camera.tetha,
      phi: this.camera.phi
    }
    this.pOIS.push(poi);
    return this.pOIS.length-1;
  },
  game: {
    started: false,
    finished: true,
    timeFinished: 0,
    time: 0,
    initialTimeBetweenWaves: 20,
    timeBetweenWaves: 20,
    waveTime: 0,
    zombiesPerWave: 10,
    initialZombiesPerWave: 10,
    zombies: [],
    startingPoi: {
      eye: [0, 0.4, 0.2],
      up: [0,1,0],
      tetha: -Math.PI/2,
      phi: Math.PI/2,
    },
    endingPoi: {
      eye: [0, 4, 3],
      up: [0,1,0],
      tetha: -Math.PI/2,
      phi: Math.PI/1.2,
    },
    Start: function(){
      Scene.camera.yLimitBot=0.4;
      Scene.camera.yLimitTop=0.4;
      this.timeBetweenWaves=this.initialTimeBetweenWaves;
      this.zombiesPerWave=this.initialZombiesPerWave;
      this.waveTime=0;
      this.time=0;
      Scene.camera.UpdatePos(this.startingPoi);
      this.started=true;
      this.finished=false;
      this.SummonWave(this.zombiesPerWave);
      Scene.camera.animation.Stop();
    },
    Stop: function(){
      Scene.camera.yLimitBot=Scene.camera.freeCamYlimitBot;
      Scene.camera.yLimitTop=Scene.camera.freeCamYlimitTop;
      this.started=false;
      this.zombies.splice(0,this.zombies.length);
      HTMLpunter.style.display="none";
      HTMLStartGameButton.innerText="Start zombie game";
      HTMLpoiSettings.style.display="block";
      HTMLinfoMessage.innerText="";
    },
    SummonWave: function(number){
      for(let i=0; i<number; i++){
        let x=getRandomNumber(-1,1);
        let z=getRandomNumber(-1,1);
        let dir=[x,0,z];
        let scale=getRandomNumber(10,16);
        let dirNorm=VectorHelper.normalize(dir);
        let pos=VectorHelper.scale(dirNorm,scale);
        let vel=getRandomNumber(0.2,0.7);
        let zombieScale=getRandomNumber(0.10,0.25);
        let zombie=new Zombie(pos,vel,zombieScale);
        initBuffers(zombie.model);
        this.zombies.push(zombie);
      }
    },
    Finish: function() {
      this.finished=true;
      Scene.camera.yLimitBot=Scene.camera.freeCamYlimitBot;
      Scene.camera.yLimitTop=Scene.camera.freeCamYlimitTop;
      this.timeFinished=0;
      Scene.camera.UpdatePos(this.endingPoi);
    },
    Update: function(delta){
      if(!this.finished){
        this.waveTime+=delta;
        this.time+=delta;
        while(this.waveTime>this.timeBetweenWaves){
          this.SummonWave(this.zombiesPerWave);
          this.zombiesPerWave+=4;
          this.waveTime-=this.timeBetweenWaves;
        }
        for(let i=0; i<this.zombies.length; i++){
          if(this.zombies[i].Move(delta)){
            this.Finish();
            HTMLinfoMessage.innerText="YOU LOST. Total time spent: " + Math.floor(this.time) + " seconds";
            break;
          }
        }
      }
      else{
        this.timeFinished+=delta;
        if(this.timeFinished>3) this.Stop();
      }
    },
    Shoot: function(){
      if(!this.finished){
        let i=0;
        while(i<this.zombies.length){
          if(this.zombies[i].Shoot(Scene.camera.eye,Scene.camera.Front())){
            this.zombies.splice(i,1);
          }
          else{
            i++;
          }
        }
      }
    }
  }
}




//Pintat de l'escena i logica ------------------------------------------------------------

function drawScene(timestamp) {
  let deltaTime=(timestamp-Scene.lastTimestamp)/1000;

  gl.clear(gl.COLOR_BUFFER_BIT);

  if(Scene.camera.animation.playing && !Scene.game.started){
    Scene.camera.animation.Update(deltaTime,Scene.pOIS);
  }
  else if(Scene.game.started){
    Scene.game.Update(deltaTime);
    for (let i=0; i<Scene.game.zombies.length;i++){
      draw(Scene.game.zombies[i].model);
    }
  }
  setShaderLight();
  setProjection();

  for (let i=0; i<Scene.objects.length;i++){
    draw(Scene.objects[i]);
  }

  Scene.lastTimestamp=timestamp;
  requestAnimationFrame(drawScene);
}

// funcions d'ajuda ------------------------------------------------------------------------------

function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createHaloTrees(number, radius){
  for(let i=0; i<number; i++){
    let r=getRandomNumber(0.05,0.15);
    let g=getRandomNumber(0.15,0.25);
    let b=getRandomNumber(0.05,0.15);
    let tree=new SceneObject(White_plastic,primitivasJson.exampleTree,Textures.data.leaves.texture,0.02);
    let x=getRandomNumber(-1,1);
    let z=getRandomNumber(-1,1);
    let v=[x,0,z];
    let scale=getRandomNumber(radius,radius+6);
    let vNorm=VectorHelper.normalize(v);
    tree.translate(...VectorHelper.scale(vNorm,scale));
    let height=getRandomNumber(0.4,1.7);
    let width=getRandomNumber(0.8,1.8);
    tree.scale(width,height,width);
    Scene.objects.push(tree);
  }
}

function summonRocks(number,radius){
  rockPrimitives=[primitivasJson.exampleRockA,primitivasJson.exampleRockB,primitivasJson.exampleRockC];
  for(let i=0; i<number; i++){
    let colorLum=getRandomNumber(0.15,0.2);
    let rockIndex=getRandomInteger(0,rockPrimitives.length-1);
    let rock=new SceneObject(White_plastic,rockPrimitives[rockIndex],Textures.data.rock.texture,0.1);
    let x=getRandomNumber(-1,1);
    let z=getRandomNumber(-1,1);
    let v=[x,0,z];
    let scale=getRandomNumber(radius-2,radius+6);
    let vNorm=VectorHelper.normalize(v);
    rock.translate(...VectorHelper.scale(vNorm,scale));
    let height=getRandomNumber(0.2,1);
    let width=getRandomNumber(0.4,1);
    rock.scale(width,height,width);
    Scene.objects.push(rock);
  }
}

function addLight(x,y,z){
  let streetLampInstance=new SceneObject(White_plastic,primitivasJson.exampleStreetLamp,Textures.data.metal.texture,1);
  streetLampInstance.translate(x,y,z);
  streetLampInstance.scale(0.12,0.12,0.12);
  let lightIndicator=new SceneObject(Yellow_plastic,exampleCube,Textures.data.white.texture,1);
  lightIndicator.translate(x+0.01,y+1.4,z+0.02);
  lightIndicator.scale(0.18,0.18,0.18);
  Scene.objects.push(lightIndicator);
  Scene.lights.data.push({
    Position: [x+0.01,y+1.4,z+0.02],
    La: [0.3, 0.3, 0.3],
    Ld: [0.3, 0.3, 0.3],
    Ls: [0.3, 0.3, 0.3],
    ences: true,
    indicator: lightIndicator,
  });
  Scene.objects.push(streetLampInstance);

}

//Creacio de l'escena -----------------------------------------------------------------------
function composeScene(){

  createHaloTrees(300,Scene.radius);
  summonRocks(40,Scene.radius);

  let surface=new SceneObject(White_plastic ,examplePlane, Textures.data.grass.texture,20);
  surface.scale(40,1,40);
  Scene.objects.push(surface);


  let sky=new SceneObject(White_plastic ,primitivasJson.exampleCupula, Textures.data.grass.texture,20,true);
  sky.rotate(Math.PI,0,1,0);
  sky.scale(1.3,1.3,1.3);
  Scene.objects.push(sky);

  let tentClosed1=new SceneObject(White_plastic,primitivasJson.exampleTentClosed,Textures.data.cloth3.texture,0.05);
  tentClosed1.translate(0.5,0,-0.7);
  tentClosed1.rotate(Math.PI/4,0,1,0);
  Scene.objects.push(tentClosed1);

  let tentClosed2=new SceneObject(White_plastic,primitivasJson.exampleTentClosed,Textures.data.cloth2.texture,0.05);
  tentClosed2.translate(-0.5,0,0.7);
  tentClosed2.rotate(-Math.PI/4,0,1,0);
  Scene.objects.push(tentClosed2);

  let tentClosed3=new SceneObject(White_plastic,primitivasJson.exampleTentClosed,Textures.data.cloth.texture,0.05);
  tentClosed3.translate(0.5,0,0.7);
  tentClosed3.rotate(-Math.PI/2,0,1,0);
  Scene.objects.push(tentClosed3);

  addLight(-3,0,0.7);
  addLight(2,0,-2);
  addLight(1,0,3);

  let campfire=new SceneObject(White_plastic,primitivasJson.exampleCampfire,Textures.data.logs.texture,0.05);
  Scene.objects.push(campfire);

}

function rgbToHex(r, g, b) {

  r = Math.round(r * 255);
  g = Math.round(g * 255);
  b = Math.round(b * 255);

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  const hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

  return `#${hex.toUpperCase()}`;
}

function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');

  const bigint = parseInt(hex, 16);
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;

  return [r,g,b];
}

//Handlers ------------------------------------------------------------------------------------------

function initHandlers() {

  //Moviment del ratolí
  document.addEventListener("mousemove", function(event){ // per a girar la camara
    var canvas = document.getElementById("myCanvas");

    // Verifica si el puntero està bloquejat
    if (document.pointerLockElement === canvas || document.mozPointerLockElement === canvas) {

      Scene.camera.TurnX(event.movementX);
      Scene.camera.TurnY(event.movementY);
    }
  });  

  document.addEventListener("click", function(event){ // per a disparar si s'està jugant
    var canvas = document.getElementById("myCanvas");

    // Verifica si el puntero està bloquejat
    if (document.pointerLockElement === canvas || document.mozPointerLockElement === canvas) {
      if(Scene.game.started){
        Scene.game.Shoot();
      }
    }
  });

  //Per el moviment de la camara en tecles
  document.onkeydown = handleKeyDown;
  

  HTMLvelocityRange.addEventListener("change", function() {
    Scene.camera.speed = HTMLvelocityRange.value;
  });




  //creo els controladors per cada llum
  for(let i=0; i<Scene.lights.data.length; i++){
    const lightElement = document.createElement("div");
    lightElement.className = "light";
    lightElement.textContent = "Llum nº " + (i) + "    ";

    const inputLa = document.createElement("input");
    inputLa.type = "color";
    inputLa.name = "La";
    inputLa.value = rgbToHex(...Scene.lights.data[i].La);
    inputLa.addEventListener("change", function (event) {
      const newValue = event.target.value;
      Scene.lights.data[i].La=hexToRgb(newValue);
      setShaderLight();
    });
    lightElement.appendChild(document.createTextNode("La: "));
    lightElement.appendChild(inputLa);
    
    const inputLd = document.createElement("input");
    inputLd.type = "color";
    inputLd.name = "Ld";
    inputLd.value = rgbToHex(...Scene.lights.data[i].Ld);
    inputLd.addEventListener("change", function (event) {
      const newValue = event.target.value;
      Scene.lights.data[i].Ld=hexToRgb(newValue);
      setShaderLight();
    });
    lightElement.appendChild(document.createTextNode("Ld: "));
    lightElement.appendChild(inputLd);

    const inputLs = document.createElement("input");
    inputLs.type = "color";
    inputLs.name = "Ls";
    inputLs.value = rgbToHex(...Scene.lights.data[i].Ls);
    inputLs.addEventListener("change", function (event) {
      const newValue = event.target.value;
      Scene.lights.data[i].Ls=hexToRgb(newValue);
      console.log(Scene.lights.data);
      setShaderLight();
    });
    lightElement.appendChild(document.createTextNode("Ls: "));
    lightElement.appendChild(inputLs);

    const inputEncendre = document.createElement("input");
    inputEncendre.type = "checkbox";
    inputEncendre.checked=Scene.lights.data[i].ences;
    inputEncendre.name = "encendre";
    inputEncendre.addEventListener("change", function (event) {
      if(event.target.checked==true){
        Scene.lights.data[i].ences=true;
        Scene.lights.data[i].indicator.material=Yellow_plastic;
      } 
      else{
        Scene.lights.data[i].ences=false;
        Scene.lights.data[i].indicator.material=Obsidian;
      } 
      setShaderLight();
    });
    lightElement.appendChild(document.createTextNode("Encès: "));
    lightElement.appendChild(inputEncendre);

    HTMLlights.appendChild(lightElement);
  }

  document.getElementsByClassName
}      


function handleKeyDown(event) {
  var canvas = document.getElementById("myCanvas");
  if (document.pointerLockElement === canvas || document.mozPointerLockElement === canvas){
    switch (event.keyCode) {
      //Left
      case 65: // 'a’ key
        Scene.camera.MoveLeft();
        break;
      // right
      case 68: // ’d’ key
        Scene.camera.MoveRight();
        break;
      // ahead
      case 87: // ’w’ key
        Scene.camera.MoveAhead();
        break;
      //back
      case 83: // ’s’ key
        Scene.camera.MoveBack();
        break;
      break;
    }
  }

}
		
function initLockPointer(){
  var canvas = document.getElementById("myCanvas");
  canvas.addEventListener("click", function (event) {
    canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
    canvas.requestPointerLock();
    HTMLinfoMessage.innerText="";
  });
}


//Relacionat amb els Poi ----------------------------------------------------
function addPoi(){
  let index=Scene.AddPoi();
  const option = document.createElement("option");

  let text=HTMLpoiText.value;
  if(HTMLpoiText.value=="") text="No named";
  HTMLpoiText.value="";
  option.value = index;
  option.text = text;

  HTMLpoiSelector.add(option);
}

function goToPoi(){
  Scene.camera.UpdatePos(Scene.pOIS[HTMLpoiSelector.value]);
}

function playAnimation(){
  Scene.camera.animation.Play(Scene.pOIS);
}

//Gestiona el començari parar partida ----------------------------------------------------------------------

function startGame(){
  if (!Scene.game.started){
    Scene.game.Start();
    HTMLStartGameButton.innerText="Stop Game";
    HTMLpoiSettings.style.display="none";

    HTMLpunter.style.display="block";
  }
  else {
    Scene.game.Stop();
  }

}

//iniciació del webgl -----------------------------------------------------------------------------------------


function initMain() {

  if (!gl) {
    alert("WebGL 2.0 no está disponible");
    return;
  }
  
  Textures.Loaded().then(() => {
    initShaders();

    composeScene();
    initPrimitives();
    initRendering();
    initLockPointer();
    initHandlers();
    
  
  
    addPoi(); // afegeixo la posicio inicial
    requestAnimationFrame(drawScene);
  });

  
}

initMain();

















/////////////////////////////////////////////////////////////////////////////////////////////////
        

/*
}*/
	
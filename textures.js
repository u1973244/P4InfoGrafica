
class Texture {
    constructor(src,gl){
      this.src= src;
      this.texture=gl.createTexture();
      this.texture.loaded=false;
      this.load(gl);
    }
    load(gl) {
        gl.activeTexture(gl.TEXTURE0);
        let textureImage = new Image();
        this.loadedPromise = new Promise((resolve) => {
            textureImage.onload = () => {
                gl.bindTexture(gl.TEXTURE_2D, this.texture);

                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

                gl.texImage2D (gl.TEXTURE_2D, 0, gl.RGB,  gl.RGB, gl.UNSIGNED_BYTE, textureImage);
                

                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    

                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
                    
                gl.generateMipmap(gl.TEXTURE_2D);
                
                this.texture.loaded=true;
                resolve();
            };
        });
        textureImage.crossOrigin = 'anonymous';
        console.log(textureImage);
        textureImage.src = this.src;
    }
}


//declaro i inicio aqui gl ja que el necessito a partir d'aqui
var gl;

function getWebGLContext() {

    var canvas = document.getElementById("myCanvas");
  
    try {
      return canvas.getContext("webgl2");
    }
    catch(e) {
    }
  
    return null;
  
}

function initWebGL(){
    gl = getWebGLContext();
    
  if (!gl) {
    alert("WebGL 2.0 no está disponible");
    return;
  }
}

initWebGL();





var Textures={
    data: {
        zombie: new Texture("Textures/ZombieA.png",gl),
        grass: new Texture("Textures/grass.jpg",gl),
        leaves: new Texture("Textures/leaves.jpg",gl),
        rock: new Texture("Textures/rock.jpg",gl),
        logs: new Texture("Textures/logs.jpg",gl),
        cloth: new Texture("Textures/cloth.jpg",gl),
        cloth2: new Texture("Textures/cloth2.jpg",gl),
        cloth3: new Texture("Textures/cloth3.jpg",gl),
        metal: new Texture("Textures/metal.jpg",gl),
        white: new Texture("Textures/white.jpg",gl),
    },
    Loaded: function(){
        return Promise.all(Object.values(this.data).map(texture => texture.loadedPromise)); //promesa que es resol quan tots estan carregats
    }
}
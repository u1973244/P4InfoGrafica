class SceneObject {
    constructor(material,primitive,texture,repetition,useProceduralTexture){
      this.normals=primitive.normals;
      this.texcoords=primitive.texcoords;
      this.vertices = primitive.vertices;
      this.indices = primitive.indices;
      this.modelMatrix = mat4.create();
      this.material=material;
      if(repetition) this.textureRepetition=repetition;
      else this.textureRepetition=1.0;
      this.texture=texture;
      this.useProceduralTexture=false;
      if(useProceduralTexture) this.useProceduralTexture=useProceduralTexture;
    }

  
    translate(x,y,z){
      let T1 = mat4.create();
      mat4.fromTranslation(T1,[x,y,z]);
      mat4.multiply(this.modelMatrix, this.modelMatrix, T1);
    }
  
    scale(x,y,z){
      let S=mat4.create();
      mat4.fromScaling(S,[x,y,z]);
      mat4.multiply(this.modelMatrix,this.modelMatrix,S);
    }
  
    rotate(rads,x,y,z){
      let R=mat4.create();
      mat4.fromRotation(R,rads,[x,y,z]);
      mat4.multiply(this.modelMatrix,this.modelMatrix,R);
    }
    changeMaterial(material){
      this.material=material;
    }
    getNormalMatrix(modelViewMatrix){
      return mat3.normalFromMat4(mat3.create(), modelViewMatrix);
    }
  }
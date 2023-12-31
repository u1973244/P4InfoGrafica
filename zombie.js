class Zombie{ //clase que gestiona els zombies del joc
    constructor(pos,vel,scale){
        this.baseHeadRadius=0.72;
        this.baseHeadY=3.35;
        this.model=new SceneObject(White_plastic,primitivasJson.exampleZombie,Textures.data.zombie.texture);
        let rotationToCenter=0;
        this.model.rotate(Math.PI*2,0,rotationToCenter,0);
        this.scale=scale;
        this.model.scale(scale,scale,scale);
        this.model.translate(pos[0]*1/scale,pos[1]*1/scale,pos[2]*1/scale);
        this.headRadius=this.baseHeadRadius*scale;
        this.headPos=[pos[0],pos[1]+this.baseHeadY*scale,pos[2]];
        this.pos=pos;
        this.vel=vel;
        this.health=3;
    }
    Move(delta){
        let dir=VectorHelper.difference([0,0,0],this.pos);
        let normDir=VectorHelper.normalize(dir);
        let movement=delta*this.vel;
        let displacement=VectorHelper.scale(normDir,movement);
        this.pos=VectorHelper.sum(this.pos,displacement);
        this.headPos=VectorHelper.sum(this.headPos,displacement);
        this.model.translate(displacement[0]*1/this.scale,displacement[1]*1/this.scale,displacement[2]*1/this.scale);
        let newDir=VectorHelper.difference([0,0,0],this.pos);
        if(VectorHelper.length(newDir)<0.3) return 1;
        else return 0;
    }
    inBounds(point){ 
        let vec=VectorHelper.difference(point,this.headPos);
        return VectorHelper.length(vec)<this.headRadius;
        
    }
    Shoot(pos,direction){ // nomes es pot disparar al cap
        let vecPlayerZombie=VectorHelper.difference(this.headPos,pos);
        let projection=(vecPlayerZombie[0]*direction[0]+vecPlayerZombie[1]*direction[1]+vecPlayerZombie[2]*direction[2]);
        let closestPoint=[pos[0] + projection * direction[0], pos[1] + projection * direction[1],pos[2] + projection * direction[2]];
        if(this.inBounds(closestPoint)){
            this.health--;
            if(this.health<=0) return true;
            else{
                switch(this.health){
                    case 2: this.model.material=White_rubber;
                        break;
                    case 1:this.model.material=Black_rubber;
                        break;
                }
                console.log(this.model.material);
            }
        }
        else return false;
    }
}
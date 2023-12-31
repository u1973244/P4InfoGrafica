
function Lerp(a,b,alpha ) {
  return a + alpha *(b-a);
}

class VectorHelper { // clase per facilitar operacions vectorials
    //pre: els vectors que es passen a les funcions seràn sempre de 3 valors
    static sum(v1,v2) {
        let res=[];
        for (let i=0; i<3; i++){
          res.push(v1[i]+v2[i]);
        }
        return res;
      }
    static difference(v1,v2) {
      let res=[];
      for (let i=0; i<3; i++){
        res.push(v1[i]-v2[i]);
      }
      return res;
    }
    static vectorialProduct(v1,v2){
        let res=[v1[1]*v2[2]-v1[2]*v2[1],v1[2]*v2[0]-v1[0]*v2[2],v1[0]*v2[1]-v1[1]*v2[0]];
        return res;
    }
    static scale(v,s){
        let res=[];
        for (let i=0; i<3; i++){
            res.push(v[i]*s);
        }
        return res;
    }
    static length(v){
        return Math.sqrt(Math.pow(v[0],2)+Math.pow(v[1],2)+Math.pow(v[2],2));
    }
    static normalize(v){
        let length=VectorHelper.length(v);
        return VectorHelper.scale(v,1/length);
    }
    static lerp(from,to,ratio){
      let res=[];
      res[0]=Lerp(from[0],to[0],ratio);
      res[1]=Lerp(from[1],to[1],ratio);
      res[2]=Lerp(from[2],to[2],ratio);
      return res;
    }
  }
export const format = (d:Date)=>{
    const newD = new Date(d);
    return newD.toISOString().replace(/T[0-9:.Z]*/g,"");
  
  }
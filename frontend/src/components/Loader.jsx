import React from 'react';

const css = `
@import url(https://fonts.googleapis.com/css?family=Open+Sans:300);
.lw{background:#f1c40f;position:fixed;inset:0;overflow:hidden;z-index:9999}
.lw h1{position:absolute;font-family:'Open Sans',sans-serif;font-weight:600;font-size:12px;text-transform:uppercase;left:50%;top:58%;transform:translateX(-50%)}
.sb{position:absolute;top:50%;left:50%;margin-left:-50px;animation:speeder .4s linear infinite}
.sb>span{height:5px;width:35px;background:#000;position:absolute;top:-19px;left:60px;border-radius:2px 10px 1px 0}
.bs span{position:absolute;width:0;height:0;border-top:6px solid transparent;border-right:100px solid #000;border-bottom:6px solid transparent}
.bs span:before{content:"";height:22px;width:22px;border-radius:50%;background:#000;position:absolute;right:-110px;top:-16px}
.bs span:after{content:"";position:absolute;width:0;height:0;border-top:0 solid transparent;border-right:55px solid #000;border-bottom:16px solid transparent;top:-16px;right:-98px}
.fc{position:absolute;height:12px;width:20px;background:#000;border-radius:20px 20px 0 0;transform:rotate(-40deg);right:-125px;top:-15px}
.fc:after{content:"";height:12px;width:12px;background:#000;right:4px;top:7px;position:absolute;transform:rotate(40deg);transform-origin:50% 50%;border-radius:0 0 0 2px}
.sb>span>span:nth-child(1),.sb>span>span:nth-child(2),.sb>span>span:nth-child(3),.sb>span>span:nth-child(4){width:30px;height:1px;background:#000;position:absolute;animation:fazer1 .2s linear infinite}
.sb>span>span:nth-child(2){top:3px;animation:fazer2 .4s linear infinite}
.sb>span>span:nth-child(3){top:1px;animation:fazer3 .4s linear infinite;animation-delay:-1s}
.sb>span>span:nth-child(4){top:4px;animation:fazer4 1s linear infinite;animation-delay:-1s}
@keyframes fazer1{0%{left:0}100%{left:-80px;opacity:0}}
@keyframes fazer2{0%{left:0}100%{left:-100px;opacity:0}}
@keyframes fazer3{0%{left:0}100%{left:-50px;opacity:0}}
@keyframes fazer4{0%{left:0}100%{left:-150px;opacity:0}}
@keyframes speeder{0%{transform:translate(2px,1px) rotate(0deg)}10%{transform:translate(-1px,-3px) rotate(-1deg)}20%{transform:translate(-2px,0px) rotate(1deg)}30%{transform:translate(1px,2px) rotate(0deg)}40%{transform:translate(1px,-1px) rotate(1deg)}50%{transform:translate(-1px,3px) rotate(-1deg)}60%{transform:translate(-1px,1px) rotate(0deg)}70%{transform:translate(3px,1px) rotate(-1deg)}80%{transform:translate(-2px,-1px) rotate(1deg)}90%{transform:translate(2px,1px) rotate(0deg)}100%{transform:translate(1px,-2px) rotate(-1deg)}}
.lf{position:absolute;width:100%;height:100%}
.lf span{position:absolute;height:2px;width:20%;background:#000}
.lf span:nth-child(1){top:20%;animation:lf .6s linear infinite;animation-delay:-5s}
.lf span:nth-child(2){top:40%;animation:lf2 .8s linear infinite;animation-delay:-1s}
.lf span:nth-child(3){top:60%;animation:lf3 .6s linear infinite}
.lf span:nth-child(4){top:80%;animation:lf4 .5s linear infinite;animation-delay:-3s}
@keyframes lf{0%{left:200%}100%{left:-200%;opacity:0}}
@keyframes lf2{0%{left:200%}100%{left:-200%;opacity:0}}
@keyframes lf3{0%{left:200%}100%{left:-100%;opacity:0}}
@keyframes lf4{0%{left:200%}100%{left:-100%;opacity:0}}
`;

const Loader = () => (
  <>
    <style>{css}</style>
    <div className="lw">
      <div className="sb">
        <span><span/><span/><span/><span/></span>
        <div className="bs"><span/><div className="fc"/></div>
      </div>
      <div className="lf"><span/><span/><span/><span/></div>
      <h1>Redirecting</h1>
    </div>
  </>
);

export default Loader;

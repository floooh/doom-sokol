var g;g||=typeof Module !== 'undefined' ? Module : {};var aa=Object.assign({},g),ba=[],ca="./this.program",h=(a,b)=>{throw b;},da="object"==typeof window,m="function"==typeof importScripts,ea="object"==typeof process&&"object"==typeof process.versions&&"string"==typeof process.versions.node,q="",fa,t,v;
if(ea){var fs=require("fs"),ha=require("path");q=m?ha.dirname(q)+"/":__dirname+"/";fa=(a,b)=>{a=w(a)?new URL(a):ha.normalize(a);return fs.readFileSync(a,b?void 0:"utf8")};v=a=>{a=fa(a,!0);a.buffer||(a=new Uint8Array(a));return a};t=(a,b,c,d=!0)=>{a=w(a)?new URL(a):ha.normalize(a);fs.readFile(a,d?void 0:"utf8",(e,k)=>{e?c(e):b(d?k.buffer:k)})};!g.thisProgram&&1<process.argv.length&&(ca=process.argv[1].replace(/\\/g,"/"));ba=process.argv.slice(2);"undefined"!=typeof module&&(module.exports=g);process.on("uncaughtException",
a=>{if(!("unwind"===a||a instanceof x||a.context instanceof x))throw a;});h=(a,b)=>{process.exitCode=a;throw b;}}else if(da||m)m?q=self.location.href:"undefined"!=typeof document&&document.currentScript&&(q=document.currentScript.src),q=q.startsWith("blob:")?"":q.substr(0,q.replace(/[?#].*/,"").lastIndexOf("/")+1),fa=a=>{var b=new XMLHttpRequest;b.open("GET",a,!1);b.send(null);return b.responseText},m&&(v=a=>{var b=new XMLHttpRequest;b.open("GET",a,!1);b.responseType="arraybuffer";b.send(null);return new Uint8Array(b.response)}),
t=(a,b,c)=>{var d=new XMLHttpRequest;d.open("GET",a,!0);d.responseType="arraybuffer";d.onload=()=>{200==d.status||0==d.status&&d.response?b(d.response):c()};d.onerror=c;d.send(null)};var ia=g.print||console.log.bind(console),y=g.printErr||console.error.bind(console);Object.assign(g,aa);aa=null;g.arguments&&(ba=g.arguments);g.thisProgram&&(ca=g.thisProgram);g.quit&&(h=g.quit);var z;g.wasmBinary&&(z=g.wasmBinary);"object"!=typeof WebAssembly&&ja("no native wasm support detected");
var ka,la=!1,ma,A,na,oa,B,C,pa,D;function qa(){var a=ka.buffer;g.HEAP8=ma=new Int8Array(a);g.HEAP16=na=new Int16Array(a);g.HEAPU8=A=new Uint8Array(a);g.HEAPU16=oa=new Uint16Array(a);g.HEAP32=B=new Int32Array(a);g.HEAPU32=C=new Uint32Array(a);g.HEAPF32=pa=new Float32Array(a);g.HEAPF64=D=new Float64Array(a)}var ra=[],sa=[],ta=[],ua=[];function va(){var a=g.preRun.shift();ra.unshift(a)}var E=0,wa=null,F=null;
function ja(a){g.onAbort?.(a);a="Aborted("+a+")";y(a);la=!0;throw new WebAssembly.RuntimeError(a+". Build with -sASSERTIONS for more info.");}var xa=a=>a.startsWith("data:application/octet-stream;base64,"),w=a=>a.startsWith("file://"),G;G="doom.wasm";if(!xa(G)){var ya=G;G=g.locateFile?g.locateFile(ya,q):q+ya}function za(a){if(a==G&&z)return new Uint8Array(z);if(v)return v(a);throw"both async and sync fetching of the wasm failed";}
function Aa(a){if(!z&&(da||m)){if("function"==typeof fetch&&!w(a))return fetch(a,{credentials:"same-origin"}).then(b=>{if(!b.ok)throw`failed to load wasm binary file at '${a}'`;return b.arrayBuffer()}).catch(()=>za(a));if(t)return new Promise((b,c)=>{t(a,d=>b(new Uint8Array(d)),c)})}return Promise.resolve().then(()=>za(a))}function Ba(a,b,c){return Aa(a).then(d=>WebAssembly.instantiate(d,b)).then(c,d=>{y(`failed to asynchronously prepare wasm: ${d}`);ja(d)})}
function Ca(a,b){var c=G;z||"function"!=typeof WebAssembly.instantiateStreaming||xa(c)||w(c)||ea||"function"!=typeof fetch?Ba(c,a,b):fetch(c,{credentials:"same-origin"}).then(d=>WebAssembly.instantiateStreaming(d,a).then(b,function(e){y(`wasm streaming compile failed: ${e}`);y("falling back to ArrayBuffer instantiation");return Ba(c,a,b)}))}function x(a){this.name="ExitStatus";this.message=`Program terminated with exit(${a})`;this.status=a}
var Da=a=>{for(;0<a.length;)a.shift()(g)},Ea=g.noExitRuntime||!0,Fa="undefined"!=typeof TextDecoder?new TextDecoder("utf8"):void 0,H=(a,b,c)=>{var d=b+c;for(c=b;a[c]&&!(c>=d);)++c;if(16<c-b&&a.buffer&&Fa)return Fa.decode(a.subarray(b,c));for(d="";b<c;){var e=a[b++];if(e&128){var k=a[b++]&63;if(192==(e&224))d+=String.fromCharCode((e&31)<<6|k);else{var f=a[b++]&63;e=224==(e&240)?(e&15)<<12|k<<6|f:(e&7)<<18|k<<12|f<<6|a[b++]&63;65536>e?d+=String.fromCharCode(e):(e-=65536,d+=String.fromCharCode(55296|
e>>10,56320|e&1023))}}else d+=String.fromCharCode(e)}return d},Ia=a=>{var b=Ga();a();Ha(b)},Ja=0,Ka=[];function La(){if(navigator.userActivation?navigator.userActivation.isActive:Ja&&Ma.nc)for(var a=0;a<Ka.length;++a){var b=Ka[a];Ka.splice(a,1);--a;b.Wc(...b.Lc)}}var I=[];function Na(a){var b=I[a];b.target.removeEventListener(b.$b,b.uc,b.ac);I.splice(a,1)}
function J(a){if(!a.target)return-4;if(a.bc)a.uc=function(c){++Ja;Ma=a;La();a.cc(c);La();--Ja},a.target.addEventListener(a.$b,a.uc,a.ac),I.push(a);else for(var b=0;b<I.length;++b)I[b].target==a.target&&I[b].$b==a.$b&&Na(b--);return 0}function Oa(a){return a?a==window?"#window":a==screen?"#screen":a?.nodeName||"":""}
var Ma,Pa,Qa,Ra,Sa,Ta,Ua,Va,Wa=[0,"undefined"!=typeof document?document:0,"undefined"!=typeof window?window:0],K=a=>{a=2<a?a?H(A,a):"":a;return Wa[a]||("undefined"!=typeof document?document.querySelector(a):void 0)},Xa=a=>0>Wa.indexOf(a)?a.getBoundingClientRect():{left:0,top:0},Ya=[],Za,L=a=>{var b=Ya[a];b||(a>=Ya.length&&(Ya.length=a+1),Ya[a]=b=Za.get(a));return b},M=(a,b,c)=>{var d=A;if(!(0<c))return 0;var e=b;c=b+c-1;for(var k=0;k<a.length;++k){var f=a.charCodeAt(k);if(55296<=f&&57343>=f){var l=
a.charCodeAt(++k);f=65536+((f&1023)<<10)|l&1023}if(127>=f){if(b>=c)break;d[b++]=f}else{if(2047>=f){if(b+1>=c)break;d[b++]=192|f>>6}else{if(65535>=f){if(b+2>=c)break;d[b++]=224|f>>12}else{if(b+3>=c)break;d[b++]=240|f>>18;d[b++]=128|f>>12&63}d[b++]=128|f>>6&63}d[b++]=128|f&63}}d[b]=0;return b-e},$a=(a,b,c,d,e,k)=>{Pa||=N(256);a={target:K(a),$b:k,bc:d,cc:(f=event)=>{var l=f.target.id?f.target.id:"",n=Pa;M(Oa(f.target),n+0,128);M(l,n+128,128);L(d)(e,n,b)&&f.preventDefault()},ac:c};return J(a)},ab=(a,
b,c,d,e,k)=>{Qa||=N(176);a={target:K(a),$b:k,bc:d,cc:f=>{var l=Qa;D[l>>3]=f.timeStamp;var n=l>>2;B[n+2]=f.location;B[n+3]=f.ctrlKey;B[n+4]=f.shiftKey;B[n+5]=f.altKey;B[n+6]=f.metaKey;B[n+7]=f.repeat;B[n+8]=f.charCode;B[n+9]=f.keyCode;B[n+10]=f.which;M(f.key||"",l+44,32);M(f.code||"",l+76,32);M(f.char||"",l+108,32);M(f.locale||"",l+140,32);L(d)(e,l,b)&&f.preventDefault()},ac:c};return J(a)},bb=(a,b,c)=>{D[a>>3]=b.timeStamp;a>>=2;B[a+2]=b.screenX;B[a+3]=b.screenY;B[a+4]=b.clientX;B[a+5]=b.clientY;B[a+
6]=b.ctrlKey;B[a+7]=b.shiftKey;B[a+8]=b.altKey;B[a+9]=b.metaKey;na[2*a+20]=b.button;na[2*a+21]=b.buttons;B[a+11]=b.movementX;B[a+12]=b.movementY;c=Xa(c);B[a+13]=b.clientX-c.left;B[a+14]=b.clientY-c.top},O=(a,b,c,d,e,k)=>{Ra||=N(72);a=K(a);return J({target:a,nc:"mousemove"!=k&&"mouseenter"!=k&&"mouseleave"!=k,$b:k,bc:d,cc:(f=event)=>{bb(Ra,f,a);L(d)(e,Ra,b)&&f.preventDefault()},ac:c})},cb=(a,b,c,d,e)=>{Sa||=N(260);return J({target:a,$b:e,bc:d,cc:(k=event)=>{var f=Sa,l=document.pointerLockElement||
document.fc||document.qc||document.pc;B[f>>2]=!!l;var n=l?.id||"";M(Oa(l),f+4,128);M(n,f+132,128);L(d)(20,f,b)&&k.preventDefault()},ac:c})},db=(a,b,c,d,e)=>J({target:a,$b:e,bc:d,cc:(k=event)=>{L(d)(38,0,b)&&k.preventDefault()},ac:c}),eb=(a,b,c,d)=>{Ta||=N(36);a=K(a);return J({target:a,$b:"resize",bc:d,cc:(e=event)=>{if(e.target==a){var k=document.body;if(k){var f=Ta;B[f>>2]=e.detail;B[f+4>>2]=k.clientWidth;B[f+8>>2]=k.clientHeight;B[f+12>>2]=innerWidth;B[f+16>>2]=innerHeight;B[f+20>>2]=outerWidth;
B[f+24>>2]=outerHeight;B[f+28>>2]=pageXOffset;B[f+32>>2]=pageYOffset;L(d)(10,f,b)&&e.preventDefault()}}},ac:c})},fb=(a,b,c,d,e,k)=>{Ua||=N(1696);a=K(a);return J({target:a,nc:"touchstart"==k||"touchend"==k,$b:k,bc:d,cc:f=>{for(var l,n={},p=f.touches,r=0;r<p.length;++r)l=p[r],l.vc=l.xc=0,n[l.identifier]=l;for(r=0;r<f.changedTouches.length;++r)l=f.changedTouches[r],l.vc=1,n[l.identifier]=l;for(r=0;r<f.targetTouches.length;++r)n[f.targetTouches[r].identifier].xc=1;p=Ua;D[p>>3]=f.timeStamp;var u=p>>2;
B[u+3]=f.ctrlKey;B[u+4]=f.shiftKey;B[u+5]=f.altKey;B[u+6]=f.metaKey;u+=7;var jb=Xa(a),kb=0;for(r in n)if(l=n[r],B[u]=l.identifier,B[u+1]=l.screenX,B[u+2]=l.screenY,B[u+3]=l.clientX,B[u+4]=l.clientY,B[u+5]=l.pageX,B[u+6]=l.pageY,B[u+7]=l.vc,B[u+8]=l.xc,B[u+9]=l.clientX-jb.left,B[u+10]=l.clientY-jb.top,u+=13,31<++kb)break;B[p+8>>2]=kb;L(d)(e,p,b)&&f.preventDefault()},ac:c})},gb=a=>{var b=a.getExtension("ANGLE_instanced_arrays");b&&(a.vertexAttribDivisor=(c,d)=>b.vertexAttribDivisorANGLE(c,d),a.drawArraysInstanced=
(c,d,e,k)=>b.drawArraysInstancedANGLE(c,d,e,k),a.drawElementsInstanced=(c,d,e,k,f)=>b.drawElementsInstancedANGLE(c,d,e,k,f))},hb=a=>{var b=a.getExtension("OES_vertex_array_object");b&&(a.createVertexArray=()=>b.createVertexArrayOES(),a.deleteVertexArray=c=>b.deleteVertexArrayOES(c),a.bindVertexArray=c=>b.bindVertexArrayOES(c),a.isVertexArray=c=>b.isVertexArrayOES(c))},ib=a=>{var b=a.getExtension("WEBGL_draw_buffers");b&&(a.drawBuffers=(c,d)=>b.drawBuffersWEBGL(c,d))},lb=a=>{a.Nc=a.getExtension("WEBGL_draw_instanced_base_vertex_base_instance")},
mb=a=>{a.Oc=a.getExtension("WEBGL_multi_draw_instanced_base_vertex_base_instance")},nb=a=>{var b="ANGLE_instanced_arrays EXT_blend_minmax EXT_disjoint_timer_query EXT_frag_depth EXT_shader_texture_lod EXT_sRGB OES_element_index_uint OES_fbo_render_mipmap OES_standard_derivatives OES_texture_float OES_texture_half_float OES_texture_half_float_linear OES_vertex_array_object WEBGL_color_buffer_float WEBGL_depth_texture WEBGL_draw_buffers EXT_color_buffer_float EXT_conservative_depth EXT_disjoint_timer_query_webgl2 EXT_texture_norm16 NV_shader_noperspective_interpolation WEBGL_clip_cull_distance EXT_color_buffer_half_float EXT_depth_clamp EXT_float_blend EXT_texture_compression_bptc EXT_texture_compression_rgtc EXT_texture_filter_anisotropic KHR_parallel_shader_compile OES_texture_float_linear WEBGL_blend_func_extended WEBGL_compressed_texture_astc WEBGL_compressed_texture_etc WEBGL_compressed_texture_etc1 WEBGL_compressed_texture_s3tc WEBGL_compressed_texture_s3tc_srgb WEBGL_debug_renderer_info WEBGL_debug_shaders WEBGL_lose_context WEBGL_multi_draw".split(" ");
return(a.getSupportedExtensions()||[]).filter(c=>b.includes(c))},ob=1,pb=[],P=[],qb=[],Q=[],R=[],S=[],rb=[],sb=[],T=[],tb={},ub=4,vb=a=>{for(var b=ob++,c=a.length;c<b;c++)a[c]=null;return b},W=(a,b,c,d)=>{for(var e=0;e<a;e++){var k=U[c](),f=k&&vb(d);k?(k.name=f,d[f]=k):V||=1282;B[b+4*e>>2]=f}},xb=(a,b)=>{a.fc||(a.fc=a.getContext,a.getContext=function(d,e){e=a.fc(d,e);return"webgl"==d==e instanceof WebGLRenderingContext?e:null});var c=1<b.wc?a.getContext("webgl2",b):a.getContext("webgl",b);return c?
wb(c,b):0},wb=(a,b)=>{var c=vb(sb),d={handle:c,attributes:b,version:b.wc,mc:a};a.canvas&&(a.canvas.Kc=d);sb[c]=d;("undefined"==typeof b.tc||b.tc)&&yb(d);return c},yb=a=>{a||=X;if(!a.Ic){a.Ic=!0;var b=a.mc;gb(b);hb(b);ib(b);lb(b);mb(b);2<=a.version&&(b.sc=b.getExtension("EXT_disjoint_timer_query_webgl2"));if(2>a.version||!b.sc)b.sc=b.getExtension("EXT_disjoint_timer_query");b.Jc=b.getExtension("WEBGL_multi_draw");nb(b).forEach(c=>{c.includes("lose_context")||c.includes("debug")||b.getExtension(c)})}},
V,X,zb=(a,b,c,d,e,k)=>{a={target:K(a),$b:k,bc:d,cc:(f=event)=>{L(d)(e,0,b)&&f.preventDefault()},ac:c};J(a)},Ab=(a,b,c,d)=>{Va||=N(104);return J({target:a,nc:!0,$b:"wheel",bc:d,cc:(e=event)=>{var k=Va;bb(k,e,a);D[k+72>>3]=e.deltaX;D[k+80>>3]=e.deltaY;D[k+88>>3]=e.deltaZ;B[k+96>>2]=e.deltaMode;L(d)(9,k,b)&&e.preventDefault()},ac:c})},Bb=["default","low-power","high-performance"],Cb=a=>{Ea||(g.onExit?.(a),la=!0);h(a,new x(a))},Db=[null,[],[]],Eb=[];
function Fb(){var a=nb(U);return a=a.concat(a.map(b=>"GL_"+b))}
for(var Gb=(a,b)=>{if(b){var c=void 0;switch(a){case 36346:c=1;break;case 36344:return;case 34814:case 36345:c=0;break;case 34466:var d=U.getParameter(34467);c=d?d.length:0;break;case 33309:if(2>X.version){V||=1282;return}c=Fb().length;break;case 33307:case 33308:if(2>X.version){V||=1280;return}c=33307==a?3:0}if(void 0===c)switch(d=U.getParameter(a),typeof d){case "number":c=d;break;case "boolean":c=d?1:0;break;case "string":V||=1280;return;case "object":if(null===d)switch(a){case 34964:case 35725:case 34965:case 36006:case 36007:case 32873:case 34229:case 36662:case 36663:case 35053:case 35055:case 36010:case 35097:case 35869:case 32874:case 36389:case 35983:case 35368:case 34068:c=
0;break;default:V||=1280;return}else{if(d instanceof Float32Array||d instanceof Uint32Array||d instanceof Int32Array||d instanceof Array){for(a=0;a<d.length;++a)B[b+4*a>>2]=d[a];return}try{c=d.name|0}catch(e){V||=1280;y(`GL_INVALID_ENUM in glGet${0}v: Unknown object returned from WebGL getParameter(${a})! (error: ${e})`);return}}break;default:V||=1280;y(`GL_INVALID_ENUM in glGet${0}v: Native code calling glGet${0}v(${a}) and it returns ${d} of type ${typeof d}!`);return}B[b>>2]=c}else V||=1281},Hb=
a=>{for(var b=0,c=0;c<a.length;++c){var d=a.charCodeAt(c);127>=d?b++:2047>=d?b+=2:55296<=d&&57343>=d?(b+=4,++c):b+=3}return b},Ib=a=>{var b=Hb(a)+1,c=N(b);c&&M(a,c,b);return c},Jb=a=>"]"==a.slice(-1)&&a.lastIndexOf("["),Y=a=>{a-=5120;return 0==a?ma:1==a?A:2==a?na:4==a?B:6==a?pa:5==a||28922==a||28520==a||30779==a||30782==a?C:oa},Kb=(a,b,c,d,e)=>{a=Y(a);var k=ub;b=d*(c*({5:3,6:4,8:2,29502:3,29504:4,26917:2,26918:2,29846:3,29847:4}[b-6402]||1)*a.BYTES_PER_ELEMENT+k-1&-k);return a.subarray(e>>>31-Math.clz32(a.BYTES_PER_ELEMENT),
e+b>>>31-Math.clz32(a.BYTES_PER_ELEMENT))},Mb=a=>{var b=Hb(a)+1,c=Lb(b);M(a,c,b);return c},U,Nb=0;32>Nb;++Nb)Eb.push(Array(Nb));
var Yb={eb:a=>{if(ea){if(!a)return 1;a=a?H(A,a):"";if(!a.length)return 0;a=require("child_process").Vc(a,[],{Sc:!0,stdio:"inherit"});var b=(c,d)=>c<<8|d;return null===a.status?b(0,(c=>{switch(c){case "SIGHUP":return 1;case "SIGQUIT":return 3;case "SIGFPE":return 8;case "SIGKILL":return 9;case "SIGALRM":return 14;case "SIGTERM":return 15}return 2})(a.signal)):a.status<<8|0}return a?-52:0},j:()=>{ja("")},ea:()=>"number"==typeof devicePixelRatio&&devicePixelRatio||1,ga:(a,b,c)=>{a=K(a);if(!a)return-4;
a=Xa(a);D[b>>3]=a.width;D[c>>3]=a.height;return 0},fb:(a,b,c)=>A.copyWithin(a,b,b+c),Za:(a,b)=>{function c(d){L(a)(d,b)&&requestAnimationFrame(c)}return requestAnimationFrame(c)},db:a=>{var b=A.length;a>>>=0;if(2147483648<a)return!1;for(var c=1;4>=c;c*=2){var d=b*(1+.2/c);d=Math.min(d,a+100663296);var e=Math;d=Math.max(a,d);a:{e=(e.min.call(e,2147483648,d+(65536-d%65536)%65536)-ka.buffer.byteLength+65535)/65536;try{ka.grow(e);qa();var k=1;break a}catch(f){}k=void 0}if(k)return!0}return!1},O:(a,b,
c,d)=>$a(a,b,c,d,12,"blur"),da:(a,b,c)=>{a=K(a);if(!a)return-4;a.width=b;a.height=c;return 0},P:(a,b,c,d)=>$a(a,b,c,d,13,"focus"),Y:(a,b,c,d)=>ab(a,b,c,d,2,"keydown"),W:(a,b,c,d)=>ab(a,b,c,d,1,"keypress"),X:(a,b,c,d)=>ab(a,b,c,d,3,"keyup"),ca:(a,b,c,d)=>O(a,b,c,d,5,"mousedown"),$:(a,b,c,d)=>O(a,b,c,d,33,"mouseenter"),_:(a,b,c,d)=>O(a,b,c,d,34,"mouseleave"),aa:(a,b,c,d)=>O(a,b,c,d,8,"mousemove"),ba:(a,b,c,d)=>O(a,b,c,d,6,"mouseup"),R:(a,b,c,d)=>{if(!document||!document.body||!(document.body.requestPointerLock||
document.body.fc||document.body.qc||document.body.pc))return-1;a=K(a);if(!a)return-4;cb(a,b,c,d,"mozpointerlockchange");cb(a,b,c,d,"webkitpointerlockchange");cb(a,b,c,d,"mspointerlockchange");return cb(a,b,c,d,"pointerlockchange")},Q:(a,b,c,d)=>{if(!document||!(document.body.requestPointerLock||document.body.fc||document.body.qc||document.body.pc))return-1;a=K(a);if(!a)return-4;db(a,b,c,d,"mozpointerlockerror");db(a,b,c,d,"webkitpointerlockerror");db(a,b,c,d,"mspointerlockerror");return db(a,b,c,
d,"pointerlockerror")},fa:(a,b,c,d)=>eb(a,b,c,d),S:(a,b,c,d)=>fb(a,b,c,d,25,"touchcancel"),T:(a,b,c,d)=>fb(a,b,c,d,23,"touchend"),U:(a,b,c,d)=>fb(a,b,c,d,24,"touchmove"),V:(a,b,c,d)=>fb(a,b,c,d,22,"touchstart"),N:(a,b,c,d)=>{zb(a,b,c,d,31,"webglcontextlost");return 0},M:(a,b,c,d)=>{zb(a,b,c,d,32,"webglcontextrestored");return 0},Z:(a,b,c,d)=>(a=K(a))?"undefined"!=typeof a.onwheel?Ab(a,b,c,d):-1:-4,Ya:(a,b)=>{b>>=2;b={alpha:!!B[b],depth:!!B[b+1],stencil:!!B[b+2],antialias:!!B[b+3],premultipliedAlpha:!!B[b+
4],preserveDrawingBuffer:!!B[b+5],powerPreference:Bb[B[b+6]],failIfMajorPerformanceCaveat:!!B[b+7],wc:B[b+8],Pc:B[b+9],tc:B[b+10],Hc:B[b+11],Qc:B[b+12],Rc:B[b+13]};a=K(a);return!a||b.Hc?0:xb(a,b)},Wa:(a,b)=>{a=sb[a];b=b?H(A,b):"";b.startsWith("GL_")&&(b=b.substr(3));"ANGLE_instanced_arrays"==b&&gb(U);"OES_vertex_array_object"==b&&hb(U);"WEBGL_draw_buffers"==b&&ib(U);"WEBGL_draw_instanced_base_vertex_base_instance"==b&&lb(U);"WEBGL_multi_draw_instanced_base_vertex_base_instance"==b&&mb(U);"WEBGL_multi_draw"==
b&&(U.Jc=U.getExtension("WEBGL_multi_draw"));return!!a.mc.getExtension(b)},Xa:a=>{X=sb[a];g.Mc=U=X?.mc;return!a||U?0:-5},Fb:Cb,gb:()=>52,cb:function(){return 70},hb:(a,b,c,d)=>{for(var e=0,k=0;k<c;k++){var f=C[b>>2],l=C[b+4>>2];b+=8;for(var n=0;n<l;n++){var p=A[f+n],r=Db[a];0===p||10===p?((1===a?ia:y)(H(r,0)),r.length=0):r.push(p)}e+=l}C[d>>2]=e;return 0},i:a=>U.activeTexture(a),z:(a,b)=>{U.attachShader(P[a],S[b])},a:(a,b)=>{35051==a?U.rc=b:35052==a&&(U.ec=b);U.bindBuffer(a,pb[b])},g:(a,b)=>{U.bindFramebuffer(a,
qb[b])},Ga:(a,b)=>{U.bindRenderbuffer(a,Q[b])},h:(a,b)=>{U.bindSampler(a,T[b])},c:(a,b)=>{U.bindTexture(a,R[b])},L:a=>{U.bindVertexArray(rb[a])},H:(a,b,c,d)=>U.blendColor(a,b,c,d),I:(a,b)=>U.blendEquationSeparate(a,b),J:(a,b,c,d)=>U.blendFuncSeparate(a,b,c,d),lb:(a,b,c,d,e,k,f,l,n,p)=>U.blitFramebuffer(a,b,c,d,e,k,f,l,n,p),Ia:(a,b,c,d)=>{2<=X.version?c&&b?U.bufferData(a,A,d,c,b):U.bufferData(a,b,d):U.bufferData(a,c?A.subarray(c,c+b):b,d)},o:(a,b,c,d)=>{2<=X.version?c&&U.bufferSubData(a,b,A,d,c):U.bufferSubData(a,
b,A.subarray(d,d+c))},pa:a=>U.checkFramebufferStatus(a),vb:(a,b,c,d)=>U.clearBufferfi(a,b,c,d),ma:(a,b,c)=>{U.clearBufferfv(a,b,pa,c>>2)},ub:(a,b,c)=>{U.clearBufferiv(a,b,B,c>>2)},n:(a,b,c,d)=>{U.colorMask(!!a,!!b,!!c,!!d)},Ab:a=>{U.compileShader(S[a])},Ca:(a,b,c,d,e,k,f,l)=>{2<=X.version?U.ec||!f?U.compressedTexImage2D(a,b,c,d,e,k,f,l):U.compressedTexImage2D(a,b,c,d,e,k,A,l,f):U.compressedTexImage2D(a,b,c,d,e,k,l?A.subarray(l,l+f):null)},Aa:(a,b,c,d,e,k,f,l,n)=>{U.ec?U.compressedTexImage3D(a,b,c,
d,e,k,f,l,n):U.compressedTexImage3D(a,b,c,d,e,k,f,A,n,l)},wa:()=>{var a=vb(P),b=U.createProgram();b.name=a;b.lc=b.jc=b.kc=0;b.oc=1;P[a]=b;return a},Cb:a=>{var b=vb(S);S[b]=U.createShader(a);return b},E:a=>U.cullFace(a),La:(a,b)=>{for(var c=0;c<a;c++){var d=B[b+4*c>>2],e=pb[d];e&&(U.deleteBuffer(e),e.name=0,pb[d]=null,d==U.rc&&(U.rc=0),d==U.ec&&(U.ec=0))}},l:(a,b)=>{for(var c=0;c<a;++c){var d=B[b+4*c>>2],e=qb[d];e&&(U.deleteFramebuffer(e),e.name=0,qb[d]=null)}},s:a=>{if(a){var b=P[a];b?(U.deleteProgram(b),
b.name=0,P[a]=null):V||=1281}},C:(a,b)=>{for(var c=0;c<a;c++){var d=B[b+4*c>>2],e=Q[d];e&&(U.deleteRenderbuffer(e),e.name=0,Q[d]=null)}},B:(a,b)=>{for(var c=0;c<a;c++){var d=B[b+4*c>>2],e=T[d];e&&(U.deleteSampler(e),e.name=0,T[d]=null)}},q:a=>{if(a){var b=S[a];b?(U.deleteShader(b),S[a]=null):V||=1281}},D:(a,b)=>{for(var c=0;c<a;c++){var d=B[b+4*c>>2],e=R[d];e&&(U.deleteTexture(e),e.name=0,R[d]=null)}},Ka:(a,b)=>{for(var c=0;c<a;c++){var d=B[b+4*c>>2];U.deleteVertexArray(rb[d]);rb[d]=null}},v:a=>U.depthFunc(a),
u:a=>{U.depthMask(!!a)},d:a=>U.disable(a),K:a=>{U.disableVertexAttribArray(a)},nb:(a,b,c)=>{U.drawArrays(a,b,c)},ob:(a,b,c,d)=>{U.drawArraysInstanced(a,b,c,d)},oa:(a,b)=>{for(var c=Eb[a],d=0;d<a;d++)c[d]=B[b+4*d>>2];U.drawBuffers(c)},pb:(a,b,c,d)=>{U.drawElements(a,b,c,d)},qb:(a,b,c,d,e)=>{U.drawElementsInstanced(a,b,c,d,e)},f:a=>U.enable(a),rb:a=>{U.enableVertexAttribArray(a)},qa:(a,b,c,d)=>{U.framebufferRenderbuffer(a,b,c,Q[d])},k:(a,b,c,d,e)=>{U.framebufferTexture2D(a,b,c,R[d],e)},x:(a,b,c,d,e)=>
{U.framebufferTextureLayer(a,b,R[c],d,e)},F:a=>U.frontFace(a),Ja:(a,b)=>{W(a,b,"createBuffer",pb)},ra:(a,b)=>{W(a,b,"createFramebuffer",qb)},Ha:(a,b)=>{W(a,b,"createRenderbuffer",Q)},xa:(a,b)=>{W(a,b,"createSampler",T)},Ea:(a,b)=>{W(a,b,"createTexture",R)},Ta:(a,b)=>{W(a,b,"createVertexArray",rb)},yb:(a,b)=>U.getAttribLocation(P[a],b?H(A,b):""),b:(a,b)=>Gb(a,b),ua:(a,b,c,d)=>{a=U.getProgramInfoLog(P[a]);null===a&&(a="(unknown error)");b=0<b&&d?M(a,d,b):0;c&&(B[c>>2]=b)},y:(a,b,c)=>{if(c)if(a>=ob)V||=
1281;else if(a=P[a],35716==b)a=U.getProgramInfoLog(a),null===a&&(a="(unknown error)"),B[c>>2]=a.length+1;else if(35719==b){if(!a.lc)for(b=0;b<U.getProgramParameter(a,35718);++b)a.lc=Math.max(a.lc,U.getActiveUniform(a,b).name.length+1);B[c>>2]=a.lc}else if(35722==b){if(!a.jc)for(b=0;b<U.getProgramParameter(a,35721);++b)a.jc=Math.max(a.jc,U.getActiveAttrib(a,b).name.length+1);B[c>>2]=a.jc}else if(35381==b){if(!a.kc)for(b=0;b<U.getProgramParameter(a,35382);++b)a.kc=Math.max(a.kc,U.getActiveUniformBlockName(a,
b).length+1);B[c>>2]=a.kc}else B[c>>2]=U.getProgramParameter(a,b);else V||=1281},zb:(a,b,c,d)=>{a=U.getShaderInfoLog(S[a]);null===a&&(a="(unknown error)");b=0<b&&d?M(a,d,b):0;c&&(B[c>>2]=b)},sa:(a,b,c)=>{c?35716==b?(a=U.getShaderInfoLog(S[a]),null===a&&(a="(unknown error)"),B[c>>2]=a?a.length+1:0):35720==b?(a=U.getShaderSource(S[a]),B[c>>2]=a?a.length+1:0):B[c>>2]=U.getShaderParameter(S[a],b):V||=1281},Qa:(a,b)=>{if(2>X.version)return V||=1282,0;var c=tb[a];if(c)return 0>b||b>=c.length?(V||=1281,
0):c[b];switch(a){case 7939:return c=Fb().map(Ib),c=tb[a]=c,0>b||b>=c.length?(V||=1281,0):c[b];default:return V||=1280,0}},p:(a,b)=>{b=b?H(A,b):"";if(a=P[a]){var c=a,d=c.ic,e=c.Fc,k;if(!d)for(c.ic=d={},c.Ec={},k=0;k<U.getProgramParameter(c,35718);++k){var f=U.getActiveUniform(c,k);var l=f.name;f=f.size;var n=Jb(l);n=0<n?l.slice(0,n):l;var p=c.oc;c.oc+=f;e[n]=[f,p];for(l=0;l<f;++l)d[p]=l,c.Ec[p++]=n}c=a.ic;d=0;e=b;k=Jb(b);0<k&&(d=parseInt(b.slice(k+1))>>>0,e=b.slice(0,k));if((e=a.Fc[e])&&d<e[0]&&(d+=
e[1],c[d]=c[d]||U.getUniformLocation(a,b)))return d}else V||=1281;return-1},kb:(a,b,c)=>{for(var d=Eb[b],e=0;e<b;e++)d[e]=B[c+4*e>>2];U.invalidateFramebuffer(a,d)},va:a=>{a=P[a];U.linkProgram(a);a.ic=0;a.Fc={}},Ra:(a,b)=>{3317==a&&(ub=b);U.pixelStorei(a,b)},G:(a,b)=>U.polygonOffset(a,b),mb:a=>U.readBuffer(a),Fa:(a,b,c,d,e)=>U.renderbufferStorageMultisample(a,b,c,d,e),A:(a,b,c)=>{U.samplerParameterf(T[a],b,c)},e:(a,b,c)=>{U.samplerParameteri(T[a],b,c)},wb:(a,b,c,d)=>U.scissor(a,b,c,d),Bb:(a,b,c,d)=>
{for(var e="",k=0;k<b;++k){var f=(f=C[c+4*k>>2])?H(A,f,d?C[d+4*k>>2]:void 0):"";e+=f}U.shaderSource(S[a],e)},Pa:(a,b,c)=>U.stencilFunc(a,b,c),ka:(a,b,c,d)=>U.stencilFuncSeparate(a,b,c,d),t:a=>U.stencilMask(a),Oa:(a,b,c)=>U.stencilOp(a,b,c),ja:(a,b,c,d)=>U.stencilOpSeparate(a,b,c,d),Ba:(a,b,c,d,e,k,f,l,n)=>{if(2<=X.version)if(U.ec)U.texImage2D(a,b,c,d,e,k,f,l,n);else if(n){var p=Y(l);U.texImage2D(a,b,c,d,e,k,f,l,p,n>>>31-Math.clz32(p.BYTES_PER_ELEMENT))}else U.texImage2D(a,b,c,d,e,k,f,l,null);else U.texImage2D(a,
b,c,d,e,k,f,l,n?Kb(l,f,d,e,n):null)},ya:(a,b,c,d,e,k,f,l,n,p)=>{if(U.ec)U.texImage3D(a,b,c,d,e,k,f,l,n,p);else if(p){var r=Y(n);U.texImage3D(a,b,c,d,e,k,f,l,n,r,p>>>31-Math.clz32(r.BYTES_PER_ELEMENT))}else U.texImage3D(a,b,c,d,e,k,f,l,n,null)},Da:(a,b,c)=>U.texParameteri(a,b,c),jb:(a,b,c,d,e,k,f,l,n)=>{if(2<=X.version)if(U.ec)U.texSubImage2D(a,b,c,d,e,k,f,l,n);else if(n){var p=Y(l);U.texSubImage2D(a,b,c,d,e,k,f,l,p,n>>>31-Math.clz32(p.BYTES_PER_ELEMENT))}else U.texSubImage2D(a,b,c,d,e,k,f,l,null);
else p=null,n&&(p=Kb(l,f,e,k,n)),U.texSubImage2D(a,b,c,d,e,k,f,l,p)},ib:(a,b,c,d,e,k,f,l,n,p,r)=>{if(U.ec)U.texSubImage3D(a,b,c,d,e,k,f,l,n,p,r);else if(r){var u=Y(p);U.texSubImage3D(a,b,c,d,e,k,f,l,n,p,u,r>>>31-Math.clz32(u.BYTES_PER_ELEMENT))}else U.texSubImage3D(a,b,c,d,e,k,f,l,n,p,null)},ta:(a,b)=>{var c=U,d=c.uniform1i;var e=U.Gc;if(e){var k=e.ic[a];"number"==typeof k&&(e.ic[a]=k=U.getUniformLocation(e,e.Ec[a]+(0<k?`[${k}]`:"")));a=k}else V||=1282,a=void 0;d.call(c,a,b)},m:a=>{a=P[a];U.useProgram(a);
U.Gc=a},sb:(a,b)=>{U.vertexAttribDivisor(a,b)},tb:(a,b,c,d,e,k)=>{U.vertexAttribPointer(a,b,c,!!d,e,k)},na:(a,b,c,d)=>U.viewport(a,b,c,d),Eb:function(){g.yc=a=>{0!=Ob()&&(a.preventDefault(),a.returnValue=" ")};window.addEventListener("beforeunload",g.yc)},Va:function(){g.Dc=a=>{const b=a.clipboardData.getData("text");Ia(()=>{const c=Mb(b);Pb(c)})};window.addEventListener("paste",g.Dc)},Sa:function(a){g.Tc=[];a=a?H(A,a):"";a=document.getElementById(a);g.zc=b=>{b.stopPropagation();b.preventDefault()};
g.Ac=b=>{b.stopPropagation();b.preventDefault()};g.Bc=b=>{b.stopPropagation();b.preventDefault()};g.Cc=b=>{b.stopPropagation();b.preventDefault();const c=b.dataTransfer.files;g.Uc=c;Qb(c.length);for(let e=0;e<c.length;e++)Ia(()=>{const k=Mb(c[e].name);Rb(e,k)});let d=0;b.shiftKey&&(d|=1);b.ctrlKey&&(d|=2);b.altKey&&(d|=4);b.metaKey&&(d|=8);Sb(b.clientX,b.clientY,d)};a.addEventListener("dragenter",g.zc,!1);a.addEventListener("dragleave",g.Ac,!1);a.addEventListener("dragover",g.Bc,!1);a.addEventListener("drop",
g.Cc,!1)},Db:function(){const a=document.getElementById("sokol-app-favicon");a&&document.head.removeChild(a)},za:function(){document.exitPointerLock&&document.exitPointerLock()},Ma:function(a){a=a?H(A,a):"";g.hc=document.getElementById(a);g.hc||console.log("sokol_app.h: invalid target:"+a);g.hc.requestPointerLock||console.log("sokol_app.h: target doesn't support requestPointerLock:"+a)},_a:function(){window.removeEventListener("beforeunload",g.yc)},Ua:function(){window.removeEventListener("paste",
g.Dc)},Na:function(a){a=a?H(A,a):"";a=document.getElementById(a);a.removeEventListener("dragenter",g.zc);a.removeEventListener("dragleave",g.Ac);a.removeEventListener("dragover",g.Bc);a.removeEventListener("drop",g.Cc)},r:function(){g.hc&&g.hc.requestPointerLock&&g.hc.requestPointerLock()},xb:function(a,b,c){const d=document.createElement("canvas");d.width=a;d.height=b;const e=d.getContext("2d"),k=e.createImageData(a,b);k.data.set(A.subarray(c,c+a*b*4));e.putImageData(k,0,0);a=document.createElement("link");
a.id="sokol-app-favicon";a.rel="shortcut icon";a.href=d.toDataURL();document.head.appendChild(a)},$a:function(){return g.dc?g.dc.bufferSize:0},bb:function(a,b,c){g.Zb=null;g.dc=null;"undefined"!==typeof AudioContext?g.Zb=new AudioContext({sampleRate:a,latencyHint:"interactive"}):(g.Zb=null,console.log("sokol_audio.h: no WebAudio support"));return g.Zb?(console.log("sokol_audio.h: sample rate ",g.Zb.sampleRate),g.dc=g.Zb.createScriptProcessor(c,0,b),g.dc.onaudioprocess=d=>{const e=d.outputBuffer.length,
k=Tb(e);if(k){const f=d.outputBuffer.numberOfChannels;for(let l=0;l<f;l++){const n=d.outputBuffer.getChannelData(l);for(let p=0;p<e;p++)n[p]=pa[(k>>2)+(f*p+l)]}}},g.dc.connect(g.Zb.destination),a=()=>{g.Zb&&"suspended"===g.Zb.state&&g.Zb.resume()},document.addEventListener("click",a,{once:!0}),document.addEventListener("touchend",a,{once:!0}),document.addEventListener("keydown",a,{once:!0}),1):0},ab:function(){return g.Zb?g.Zb.sampleRate:0},ia:function(){const a=g.Zb;null!==a&&(g.dc&&g.dc.disconnect(),
a.close(),g.Zb=null,g.dc=null)},w:function(a,b,c,d,e,k){b=b?H(A,b):"";const f=new XMLHttpRequest;f.open("GET",b);f.responseType="arraybuffer";const l=0<d;l&&f.setRequestHeader("Range","bytes="+c+"-"+(c+d-1));f.onreadystatechange=function(){if(f.readyState==XMLHttpRequest.DONE)if(206==f.status||200==f.status&&!l){const n=new Uint8Array(f.response),p=n.length;p<=k?(A.set(n,e),Ub(a,d,p)):Vb(a)}else Wb(a,f.status)};f.send()},la:function(a,b){b=b?H(A,b):"";const c=new XMLHttpRequest;c.open("HEAD",b);c.onreadystatechange=
function(){if(c.readyState==XMLHttpRequest.DONE)if(200==c.status){const d=c.getResponseHeader("Content-Length");Xb(a,d)}else Wb(a,c.status)};c.send()},ha:function(a,b){b=b?H(A,b):"";switch(a){case 0:console.error(b);break;case 1:console.error(b);break;case 2:console.warn(b);break;default:console.info(b)}}},Z=function(){function a(c){Z=c.exports;ka=Z.Gb;qa();Za=Z.Vb;sa.unshift(Z.Hb);E--;g.monitorRunDependencies?.(E);0==E&&(null!==wa&&(clearInterval(wa),wa=null),F&&(c=F,F=null,c()));return Z}var b=
{a:Yb};E++;g.monitorRunDependencies?.(E);if(g.instantiateWasm)try{return g.instantiateWasm(b,a)}catch(c){return y(`Module.instantiateWasm callback failed with error: ${c}`),!1}Ca(b,function(c){a(c.instance)});return{}}(),N=a=>(N=Z.Ib)(a),Pb=g.__sapp_emsc_onpaste=a=>(Pb=g.__sapp_emsc_onpaste=Z.Jb)(a),Ob=g.__sapp_html5_get_ask_leave_site=()=>(Ob=g.__sapp_html5_get_ask_leave_site=Z.Kb)(),Qb=g.__sapp_emsc_begin_drop=a=>(Qb=g.__sapp_emsc_begin_drop=Z.Lb)(a),Rb=g.__sapp_emsc_drop=(a,b)=>(Rb=g.__sapp_emsc_drop=
Z.Mb)(a,b),Sb=g.__sapp_emsc_end_drop=(a,b,c)=>(Sb=g.__sapp_emsc_end_drop=Z.Nb)(a,b,c);g.__sapp_emsc_invoke_fetch_cb=(a,b,c,d,e,k,f,l)=>(g.__sapp_emsc_invoke_fetch_cb=Z.Ob)(a,b,c,d,e,k,f,l);
var Zb=g._main=(a,b)=>(Zb=g._main=Z.Pb)(a,b),Xb=g.__sfetch_emsc_head_response=(a,b)=>(Xb=g.__sfetch_emsc_head_response=Z.Qb)(a,b),Ub=g.__sfetch_emsc_get_response=(a,b,c)=>(Ub=g.__sfetch_emsc_get_response=Z.Rb)(a,b,c),Wb=g.__sfetch_emsc_failed_http_status=(a,b)=>(Wb=g.__sfetch_emsc_failed_http_status=Z.Sb)(a,b),Vb=g.__sfetch_emsc_failed_buffer_too_small=a=>(Vb=g.__sfetch_emsc_failed_buffer_too_small=Z.Tb)(a),Tb=g.__saudio_emsc_pull=a=>(Tb=g.__saudio_emsc_pull=Z.Ub)(a),Ga=()=>(Ga=Z.Wb)(),Ha=a=>(Ha=
Z.Xb)(a),Lb=a=>(Lb=Z.Yb)(a);g.___start_em_js=179636;g.___stop_em_js=188857;var $b;F=function ac(){$b||bc();$b||(F=ac)};function cc(a=[]){var b=Zb;a.unshift(ca);var c=a.length,d=Lb(4*(c+1)),e=d;a.forEach(f=>{C[e>>2]=Mb(f);e+=4});C[e>>2]=0;try{var k=b(c,d);Cb(k,!0)}catch(f){f instanceof x||"unwind"==f||h(1,f)}}
function bc(){var a=ba;function b(){if(!$b&&($b=!0,g.calledRun=!0,!la)){Da(sa);Da(ta);if(g.onRuntimeInitialized)g.onRuntimeInitialized();dc&&cc(a);if(g.postRun)for("function"==typeof g.postRun&&(g.postRun=[g.postRun]);g.postRun.length;){var c=g.postRun.shift();ua.unshift(c)}Da(ua)}}if(!(0<E)){if(g.preRun)for("function"==typeof g.preRun&&(g.preRun=[g.preRun]);g.preRun.length;)va();Da(ra);0<E||(g.setStatus?(g.setStatus("Running..."),setTimeout(function(){setTimeout(function(){g.setStatus("")},1);b()},
1)):b())}}if(g.preInit)for("function"==typeof g.preInit&&(g.preInit=[g.preInit]);0<g.preInit.length;)g.preInit.pop()();var dc=!0;g.noInitialRun&&(dc=!1);bc();

var main=function(){"use strict";function t(){}function n(t){return t()}function e(){return Object.create(null)}function l(t){t.forEach(n)}function o(t){return"function"==typeof t}function r(t,n){return t!=t?n==n:t!==n||t&&"object"==typeof t||"function"==typeof t}function c(t,n){t.appendChild(n)}function a(t,n,e){t.insertBefore(n,e||null)}function i(t){t.parentNode.removeChild(t)}function u(t,n){for(let e=0;e<t.length;e+=1)t[e]&&t[e].d(n)}function s(t){return document.createElement(t)}function d(t){return document.createTextNode(t)}function f(){return d(" ")}function m(){return d("")}function h(t,n,e,l){return t.addEventListener(n,e,l),()=>t.removeEventListener(n,e,l)}function p(t,n,e){null==e?t.removeAttribute(n):t.getAttribute(n)!==e&&t.setAttribute(n,e)}function g(t,n){n=""+n,t.wholeText!==n&&(t.data=n)}function b(t,n){t.value=null==n?"":n}function k(t,n,e,l){t.style.setProperty(n,e,l?"important":"")}function v(t,n,e){t.classList[e?"add":"remove"](n)}let $;function x(t){$=t}function y(){if(!$)throw new Error("Function called outside component initialization");return $}const w=[],_=[],j=[],N=[],D=Promise.resolve();let C=!1;function M(t){j.push(t)}let T=!1;const L=new Set;function E(){if(!T){T=!0;do{for(let t=0;t<w.length;t+=1){const n=w[t];x(n),S(n.$$)}for(w.length=0;_.length;)_.pop()();for(let t=0;t<j.length;t+=1){const n=j[t];L.has(n)||(L.add(n),n())}j.length=0}while(w.length);for(;N.length;)N.pop()();C=!1,T=!1,L.clear()}}function S(t){if(null!==t.fragment){t.update(),l(t.before_update);const n=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,n),t.after_update.forEach(M)}}const O=new Set;let I;function A(){I={r:0,c:[],p:I}}function H(){I.r||l(I.c),I=I.p}function z(t,n){t&&t.i&&(O.delete(t),t.i(n))}function F(t,n,e,l){if(t&&t.o){if(O.has(t))return;O.add(t),I.c.push(()=>{O.delete(t),l&&(e&&t.d(1),l())}),t.o(n)}}function P(t,n){const e=n.token={};function l(t,l,o,r){if(n.token!==e)return;n.resolved=r;let c=n.ctx;void 0!==o&&(c=c.slice(),c[o]=r);const a=t&&(n.current=t)(c);let i=!1;n.block&&(n.blocks?n.blocks.forEach((t,e)=>{e!==l&&t&&(A(),F(t,1,1,()=>{n.blocks[e]=null}),H())}):n.block.d(1),a.c(),z(a,1),a.m(n.mount(),n.anchor),i=!0),n.block=a,n.blocks&&(n.blocks[l]=a),i&&E()}if((o=t)&&"object"==typeof o&&"function"==typeof o.then){const e=y();if(t.then(t=>{x(e),l(n.then,1,n.value,t),x(null)},t=>{x(e),l(n.catch,2,n.error,t),x(null)}),n.current!==n.pending)return l(n.pending,0),!0}else{if(n.current!==n.then)return l(n.then,1,n.value,t),!0;n.resolved=t}var o}function R(t){t&&t.c()}function B(t,e,r){const{fragment:c,on_mount:a,on_destroy:i,after_update:u}=t.$$;c&&c.m(e,r),M(()=>{const e=a.map(n).filter(o);i?i.push(...e):l(e),t.$$.on_mount=[]}),u.forEach(M)}function U(t,n){const e=t.$$;null!==e.fragment&&(l(e.on_destroy),e.fragment&&e.fragment.d(n),e.on_destroy=e.fragment=null,e.ctx=[])}function W(t,n){-1===t.$$.dirty[0]&&(w.push(t),C||(C=!0,D.then(E)),t.$$.dirty.fill(0)),t.$$.dirty[n/31|0]|=1<<n%31}function Z(n,o,r,c,a,u,s=[-1]){const d=$;x(n);const f=o.props||{},m=n.$$={fragment:null,ctx:null,props:u,update:t,not_equal:a,bound:e(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(d?d.$$.context:[]),callbacks:e(),dirty:s,skip_bound:!1};let h=!1;if(m.ctx=r?r(n,f,(t,e,...l)=>{const o=l.length?l[0]:e;return m.ctx&&a(m.ctx[t],m.ctx[t]=o)&&(!m.skip_bound&&m.bound[t]&&m.bound[t](o),h&&W(n,t)),e}):[],m.update(),h=!0,l(m.before_update),m.fragment=!!c&&c(m.ctx),o.target){if(o.hydrate){const t=function(t){return Array.from(t.childNodes)}(o.target);m.fragment&&m.fragment.l(t),t.forEach(i)}else m.fragment&&m.fragment.c();o.intro&&z(n.$$.fragment),B(n,o.target,o.anchor),E()}x(d)}class q{$destroy(){U(this,1),this.$destroy=t}$on(t,n){const e=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return e.push(n),()=>{const t=e.indexOf(n);-1!==t&&e.splice(t,1)}}$set(t){var n;this.$$set&&(n=t,0!==Object.keys(n).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}function G(n){let e,o,r,u,d,m;return{c(){e=s("form"),o=s("input"),r=f(),u=s("button"),u.textContent="OK",p(o,"class","form-control me-2"),p(o,"type","search"),p(o,"placeholder","Search"),p(o,"aria-label","Search"),p(o,"name","text"),p(u,"class","btn btn-outline-success"),p(u,"type","submit"),p(e,"class","d-flex")},m(t,l){var i;a(t,e,l),c(e,o),b(o,n[0]),c(e,r),c(e,u),d||(m=[h(o,"input",n[2]),h(e,"submit",(i=n[1],function(t){return t.preventDefault(),i.call(this,t)}))],d=!0)},p(t,[n]){1&n&&b(o,t[0])},i:t,o:t,d(t){t&&i(e),d=!1,l(m)}}}function K(t,n,e){let l="";return[l,function(){window.location.href="/search?text="+l},function(){l=this.value,e(0,l)}]}class J extends q{constructor(t){super(),Z(this,t,K,G,r,{})}}function Q(n){return{c:t,m:t,p:t,d:t}}function V(t){let n,e,o,r,u,d;return{c(){n=s("div"),e=s("input"),o=f(),r=s("label"),r.textContent="Dark",p(e,"class","form-check-input"),p(e,"type","checkbox"),p(e,"role","switch"),p(e,"id","flexSwitchCheckDefault"),p(r,"class","form-check-label darkmode-text"),p(r,"for","flexSwitchCheckDefault"),p(n,"class","form-check form-switch")},m(l,i){a(l,n,i),c(n,e),e.checked=t[0],c(n,o),c(n,r),u||(d=[h(e,"change",t[2]),h(e,"change",t[3])],u=!0)},p(t,n){1&n&&(e.checked=t[0])},d(t){t&&i(n),u=!1,l(d)}}}function X(n){return{c:t,m:t,p:t,d:t}}function Y(n){let e,l,o={ctx:n,current:null,token:null,pending:X,then:V,catch:Q,value:1};return P(l=n[1],o),{c(){e=m(),o.block.c()},m(t,n){a(t,e,n),o.block.m(t,o.anchor=n),o.mount=()=>e.parentNode,o.anchor=e},p(t,[e]){if(n=t,o.ctx=n,2&e&&l!==(l=n[1])&&P(l,o));else{const t=n.slice();t[1]=o.resolved,o.block.p(t,e)}},i:t,o:t,d(t){t&&i(e),o.block.d(t),o.token=null,o=null}}}function tt(t,n,e){const l=(t="rgb(24, 25, 26)")=>{let n,e,l,o=t.substring(4,t.length-1).split(", ").map(t=>parseInt(t)).map(t=>t/255),r=Math.max(o[0],o[1],o[2]),c=Math.min(o[0],o[1],o[2]),a=r-c;switch(!0){case 0==a:n=0;break;case r==o[0]:n=(o[1]-o[2])/a%6*60;break;case r==o[1]:n=60*((o[2]-o[0])/a+2);break;case r==o[2]:n=60*((o[0]-o[1])/a+4)}return l=(r+c)/2,e=0==a?0:a/(1-Math.abs(2*l-1)),{hue:Math.round(n),saturation:100*e.toFixed(2),light:100*l.toFixed(2)}},o=t=>{let{hue:n,saturation:e,light:l}=t;return`hsl(${n}, ${e}%, ${l}%)`},r=(t,n)=>{document.documentElement.style.setProperty(t,n)},c=t=>o((t=>{let{hue:n,saturation:e,light:l}=t;return{hue:n,saturation:Math.round(.92*e),light:Math.round(.85*l)}})(l(t))),a=t=>o((t=>{let{hue:n,saturation:e,light:l}=t;return{hue:n,saturation:Math.round(e+.15*(100-e)),light:Math.round(.78*l)}})(l(t))),i=t=>((t,n)=>{let{hue:e,saturation:l,light:o}=t;return`hsla(${e}, ${l}%, ${o}%, ${n})`})((t=>{let{hue:n,saturation:e,light:l}=t;return{hue:n,saturation:e,light:Math.round(l+.15*(100-l))}})(l(t)),.5),u=async()=>{let t=await fetch("/getDarkMode",{method:"POST"}),n=(await t.json()).darkMode;return e(0,d=n),(t=>{t?(r("--bg-color","var(--dark-bg-color)"),r("--card-color","var(--dark-card-color)"),r("--font-color","var(--dark-font-color)"),r("--icon-color","var(--dark-icon-color)"),r("--button-color","var(--dark-button-color)"),r("--button-color-dark","var(--dark-button-color-dark)"),r("--button-border-color-dark","var(--dark-button-border-color-dark)"),r("--button-shadow-color","var(--dark-button-shadow-color)")):(r("--bg-color",f.bg_color),r("--card-color",f.bg_color),r("--font-color",f.font_color),r("--icon-color",f.icon_color),r("--button-color",f.button_color),r("--button-color-dark",c(f.button_color)),r("--button-border-color-dark",a(f.button_color)),r("--button-shadow-color",i(f.button_color)))})(d),n};let s,d=!1,f={};return(async()=>{f=await(async()=>{let t=await fetch("/getTemplateColors");return await t.json()})(),e(1,s=await u()),(async()=>{let t=await fetch("/getTemplateFont"),n=await t.json();r("--font",n.font)})()})(),[d,s,()=>{fetch("/switchDarkMode",{method:"POST"}).then(()=>{u()})},function(){d=this.checked,e(0,d)}]}class nt extends q{constructor(t){super(),Z(this,t,tt,Y,r,{})}}function et(t,n,e){const l=t.slice();return l[4]=n[e],l}function lt(t,n,e){const l=t.slice();return l[4]=n[e],l}function ot(n){return{c:t,m:t,p:t,i:t,o:t,d:t}}function rt(t){let n,e,l,o,r;const c=[at,ct],u=[];function s(t,n){return t[0]?1:0}return n=s(t),e=u[n]=c[n](t),o=new nt({}),{c(){e.c(),l=f(),R(o.$$.fragment)},m(t,e){u[n].m(t,e),a(t,l,e),B(o,t,e),r=!0},p(t,o){let r=n;n=s(t),n===r?u[n].p(t,o):(A(),F(u[r],1,1,()=>{u[r]=null}),H(),e=u[n],e||(e=u[n]=c[n](t),e.c()),z(e,1),e.m(l.parentNode,l))},i(t){r||(z(e),z(o.$$.fragment,t),r=!0)},o(t){F(e),F(o.$$.fragment,t),r=!1},d(t){u[n].d(t),t&&i(l),U(o,t)}}}function ct(t){let n,e,l,o,r,d,m,h=t[2],g=[];for(let n=0;n<h.length;n+=1)g[n]=it(et(t,h,n));let b={ctx:t,current:null,token:null,pending:ht,then:st,catch:ut,value:1};return P(l=t[1],b),d=new J({}),{c(){n=s("ul");for(let t=0;t<g.length;t+=1)g[t].c();e=f(),b.block.c(),o=f(),r=s("li"),R(d.$$.fragment),p(r,"class","nav-item nav-link"),k(r,"width","250px"),p(n,"class","nav flex-column")},m(t,l){a(t,n,l);for(let t=0;t<g.length;t+=1)g[t].m(n,null);c(n,e),b.block.m(n,b.anchor=null),b.mount=()=>n,b.anchor=o,c(n,o),c(n,r),B(d,r,null),m=!0},p(o,r){if(t=o,4&r){let l;for(h=t[2],l=0;l<h.length;l+=1){const o=et(t,h,l);g[l]?g[l].p(o,r):(g[l]=it(o),g[l].c(),g[l].m(n,e))}for(;l<g.length;l+=1)g[l].d(1);g.length=h.length}if(b.ctx=t,2&r&&l!==(l=t[1])&&P(l,b));else{const n=t.slice();n[1]=b.resolved,b.block.p(n,r)}},i(t){m||(z(d.$$.fragment,t),m=!0)},o(t){F(d.$$.fragment,t),m=!1},d(t){t&&i(n),u(g,t),b.block.d(),b.token=null,b=null,U(d)}}}function at(t){let n,e,l,o,r,d,m,h,g,b,k,v=t[2],$=[];for(let n=0;n<v.length;n+=1)$[n]=pt(lt(t,v,n));let x={ctx:t,current:null,token:null,pending:xt,then:bt,catch:gt,value:1};return P(h=t[1],x),b=new J({}),{c(){n=s("nav"),e=s("div"),l=s("button"),l.innerHTML='<span class="navbar-toggler-icon"></span>',o=f(),r=s("div"),d=s("ul");for(let t=0;t<$.length;t+=1)$[t].c();m=f(),x.block.c(),g=f(),R(b.$$.fragment),p(l,"class","navbar-toggler"),p(l,"type","button"),p(l,"data-bs-toggle","collapse"),p(l,"data-bs-target","#navbarSupportedContent"),p(l,"aria-controls","navbarSupportedContent"),p(l,"aria-expanded","false"),p(l,"aria-label","Toggle navigation"),p(d,"class","navbar-nav me-auto mb-2 mb-lg-0"),p(r,"class","collapse navbar-collapse"),p(r,"id","navbarSupportedContent"),p(e,"class","container-fluid"),p(n,"class","navbar navbar-expand-lg")},m(t,i){a(t,n,i),c(n,e),c(e,l),c(e,o),c(e,r),c(r,d);for(let t=0;t<$.length;t+=1)$[t].m(d,null);c(d,m),x.block.m(d,x.anchor=null),x.mount=()=>d,x.anchor=null,c(e,g),B(b,e,null),k=!0},p(n,e){if(t=n,4&e){let n;for(v=t[2],n=0;n<v.length;n+=1){const l=lt(t,v,n);$[n]?$[n].p(l,e):($[n]=pt(l),$[n].c(),$[n].m(d,m))}for(;n<$.length;n+=1)$[n].d(1);$.length=v.length}if(x.ctx=t,2&e&&h!==(h=t[1])&&P(h,x));else{const n=t.slice();n[1]=x.resolved,x.block.p(n,e)}},i(t){k||(z(b.$$.fragment,t),k=!0)},o(t){F(b.$$.fragment,t),k=!1},d(t){t&&i(n),u($,t),x.block.d(),x.token=null,x=null,U(b)}}}function it(t){let n,e,l,o,r=t[4].text+"";return{c(){n=s("li"),e=s("a"),l=d(r),p(e,"class","nav-link"),p(e,"href",o=t[4].url),p(n,"class","nav-item")},m(t,o){a(t,n,o),c(n,e),c(e,l)},p(t,n){4&n&&r!==(r=t[4].text+"")&&g(l,r),4&n&&o!==(o=t[4].url)&&p(e,"href",o)},d(t){t&&i(n)}}}function ut(n){return{c:t,m:t,p:t,d:t}}function st(t){let n;function e(t,n){return t[1].error_message?ft:dt}let l=e(t),o=l(t);return{c(){o.c(),n=m()},m(t,e){o.m(t,e),a(t,n,e)},p(t,r){l===(l=e(t))&&o?o.p(t,r):(o.d(1),o=l(t),o&&(o.c(),o.m(n.parentNode,n)))},d(t){o.d(t),t&&i(n)}}}function dt(t){let n,e,l,o,r,u,m,h,b=t[1].userName+"",k="admin"==t[1].userRole&&mt();return{c(){k&&k.c(),n=f(),e=s("li"),l=s("a"),o=d("Zalogowany jako: "),r=s("strong"),u=d(b),m=f(),h=s("li"),h.innerHTML='<a href="/logoutUser" class="nav-link text-primary">Wyloguj</a>',p(l,"class","nav-link"),p(l,"href","/profile"),p(e,"class","nav-item"),p(h,"class","nav-item")},m(t,i){k&&k.m(t,i),a(t,n,i),a(t,e,i),c(e,l),c(l,o),c(l,r),c(r,u),a(t,m,i),a(t,h,i)},p(t,e){"admin"==t[1].userRole?k||(k=mt(),k.c(),k.m(n.parentNode,n)):k&&(k.d(1),k=null),2&e&&b!==(b=t[1].userName+"")&&g(u,b)},d(t){k&&k.d(t),t&&i(n),t&&i(e),t&&i(m),t&&i(h)}}}function ft(n){let e;return{c(){e=s("form"),e.innerHTML='<li class="nav-item nav-link"><a href="/register" class="btn btn-sm btn-outline-primary">Register</a></li> \n\t\t\t\t\t\t<li class="nav-item nav-link"><a href="/login" class="btn btn-sm btn-outline-success" id="login-btn">Login</a></li>'},m(t,n){a(t,e,n)},p:t,d(t){t&&i(e)}}}function mt(t){let n;return{c(){n=s("li"),n.innerHTML='<a class="nav-link" href="/admin">Admin</a>',p(n,"class","nav-item")},m(t,e){a(t,n,e)},d(t){t&&i(n)}}}function ht(n){let e;return{c(){e=s("h1"),e.textContent="Oczekiwanie na dane użytkownika"},m(t,n){a(t,e,n)},p:t,d(t){t&&i(e)}}}function pt(t){let n,e,l,o,r=t[4].text+"";return{c(){n=s("li"),e=s("a"),l=d(r),p(e,"class","nav-link mt-1"),p(e,"href",o=t[4].url),p(n,"class","nav-item")},m(t,o){a(t,n,o),c(n,e),c(e,l)},p(t,n){4&n&&r!==(r=t[4].text+"")&&g(l,r),4&n&&o!==(o=t[4].url)&&p(e,"href",o)},d(t){t&&i(n)}}}function gt(n){return{c:t,m:t,p:t,d:t}}function bt(t){let n;function e(t,n){return t[1].error_message?vt:kt}let l=e(t),o=l(t);return{c(){o.c(),n=m()},m(t,e){o.m(t,e),a(t,n,e)},p(t,r){l===(l=e(t))&&o?o.p(t,r):(o.d(1),o=l(t),o&&(o.c(),o.m(n.parentNode,n)))},d(t){o.d(t),t&&i(n)}}}function kt(t){let n,e,l,o,r,u,m,h,b=t[1].userName+"",k="admin"==t[1].userRole&&$t();return{c(){k&&k.c(),n=f(),e=s("li"),l=s("a"),o=d("Zalogowany jako: "),r=s("strong"),u=d(b),m=f(),h=s("li"),h.innerHTML='<a class="text-primary nav-link mt-1" href="/logoutUser">Wyloguj</a>',p(l,"class"," nav-link mt-1"),p(l,"href","/profile"),p(e,"class","nav-item"),p(h,"class","nav-item")},m(t,i){k&&k.m(t,i),a(t,n,i),a(t,e,i),c(e,l),c(l,o),c(l,r),c(r,u),a(t,m,i),a(t,h,i)},p(t,e){"admin"==t[1].userRole?k||(k=$t(),k.c(),k.m(n.parentNode,n)):k&&(k.d(1),k=null),2&e&&b!==(b=t[1].userName+"")&&g(u,b)},d(t){k&&k.d(t),t&&i(n),t&&i(e),t&&i(m),t&&i(h)}}}function vt(n){let e;return{c(){e=s("form"),e.innerHTML='<li class="nav-item nav-link"><a href="/register" class="btn btn-sm btn-outline-primary">Register</a></li> \n\t\t\t\t\t\t\t\t\t<li class="nav-item nav-link"><a href="/login" class="btn btn-sm btn-outline-success" id="login-btn">Login</a></li>',p(e,"class","d-flex")},m(t,n){a(t,e,n)},p:t,d(t){t&&i(e)}}}function $t(t){let n;return{c(){n=s("li"),n.innerHTML='<a class="nav-link mt-1" href="/admin">Admin</a>',p(n,"class","nav-item")},m(t,e){a(t,n,e)},d(t){t&&i(n)}}}function xt(n){let e;return{c(){e=s("h1"),e.textContent="Oczekiwanie na dane użytkownika"},m(t,n){a(t,e,n)},p:t,d(t){t&&i(e)}}}function yt(n){let e;return{c(){e=s("h1"),e.textContent="Oczekiwanie na dane nawigacji"},m(t,n){a(t,e,n)},p:t,i:t,o:t,d(t){t&&i(e)}}}function wt(t){let n,e,l,o={ctx:t,current:null,token:null,pending:yt,then:rt,catch:ot,value:2,blocks:[,,,]};return P(e=t[2],o),{c(){n=m(),o.block.c()},m(t,e){a(t,n,e),o.block.m(t,o.anchor=e),o.mount=()=>n.parentNode,o.anchor=n,l=!0},p(n,[l]){if(t=n,o.ctx=t,4&l&&e!==(e=t[2])&&P(e,o));else{const n=t.slice();n[2]=o.resolved,o.block.p(n,l)}},i(t){l||(z(o.block),l=!0)},o(t){for(let t=0;t<3;t+=1){F(o.blocks[t])}l=!1},d(t){t&&i(n),o.block.d(t),o.token=null,o=null}}}async function _t(){let t=await fetch("/getLinks?component=header",{method:"post"});return await t.json()}async function jt(){let t=await fetch("/getLoggedUserData",{method:"post"});return await t.json()}function Nt(t,n,e){let l,o=jt(),r=_t();return(async()=>{let t=await fetch("/getTemplateNavStyle",{method:"post"}),n=await t.json();e(0,l="alternative"==n.nav_style)})(),e(0,l=!0),e(2,r=_t()),e(1,o=jt()),[l,o,r]}class Dt extends q{constructor(t){super(),Z(this,t,Nt,wt,r,{})}}function Ct(t,n,e){const l=t.slice();return l[2]=n[e],l[4]=e,l}function Mt(t,n,e){const l=t.slice();return l[2]=n[e],l[4]=e,l}function Tt(n){return{c:t,m:t,p:t,d:t}}function Lt(t){let n,e,l,o,r,d,m,h,g,b,k,v,$,x,y,w,_,j,N=t[0].slides,D=[];for(let n=0;n<N.length;n+=1)D[n]=Ot(Mt(t,N,n));let C=t[0].slides,M=[];for(let n=0;n<C.length;n+=1)M[n]=Ht(Ct(t,C,n));return{c(){n=s("div"),e=s("div");for(let t=0;t<D.length;t+=1)D[t].c();l=f(),o=s("div");for(let t=0;t<M.length;t+=1)M[t].c();r=f(),d=s("button"),m=s("span"),h=f(),g=s("span"),g.textContent="Previous",k=f(),v=s("button"),$=s("span"),x=f(),y=s("span"),y.textContent="Next",p(e,"class","carousel-indicators"),p(o,"class","carousel-inner"),p(m,"class","carousel-control-prev-icon"),p(m,"aria-hidden","true"),p(g,"class","visually-hidden"),p(d,"class","carousel-control-prev"),p(d,"type","button"),p(d,"data-bs-target",b="#carouselExampleDark"+t[0].id),p(d,"data-bs-slide","prev"),p($,"class","carousel-control-next-icon"),p($,"aria-hidden","true"),p(y,"class","visually-hidden"),p(v,"class","carousel-control-next"),p(v,"type","button"),p(v,"data-bs-target",w="#carouselExampleDark"+t[0].id),p(v,"data-bs-slide","next"),p(n,"id",_="carouselExampleDark"+t[0].id),p(n,"class","carousel carousel-dark slide"),p(n,"data-bs-ride","carousel"),p(n,"data-bs-interval",j=t[0].interval)},m(t,i){a(t,n,i),c(n,e);for(let t=0;t<D.length;t+=1)D[t].m(e,null);c(n,l),c(n,o);for(let t=0;t<M.length;t+=1)M[t].m(o,null);c(n,r),c(n,d),c(d,m),c(d,h),c(d,g),c(n,k),c(n,v),c(v,$),c(v,x),c(v,y)},p(t,n){if(1&n){let l;for(N=t[0].slides,l=0;l<N.length;l+=1){const o=Mt(t,N,l);D[l]?D[l].p(o,n):(D[l]=Ot(o),D[l].c(),D[l].m(e,null))}for(;l<D.length;l+=1)D[l].d(1);D.length=N.length}if(1&n){let e;for(C=t[0].slides,e=0;e<C.length;e+=1){const l=Ct(t,C,e);M[e]?M[e].p(l,n):(M[e]=Ht(l),M[e].c(),M[e].m(o,null))}for(;e<M.length;e+=1)M[e].d(1);M.length=C.length}},d(t){t&&i(n),u(D,t),u(M,t)}}}function Et(n){let e,l,o,r;return{c(){e=s("button"),p(e,"type","button"),p(e,"data-bs-target",l="#carouselExampleDark"+n[0].id),p(e,"data-bs-slide-to",o=n[4]),p(e,"aria-label",r="Slide "+n[4])},m(t,n){a(t,e,n)},p:t,d(t){t&&i(e)}}}function St(n){let e,l,o,r;return{c(){e=s("button"),p(e,"type","button"),p(e,"data-bs-target",l="#carouselExampleDark"+n[0].id),p(e,"data-bs-slide-to",o=n[4]),p(e,"aria-label",r="Slide "+n[4]),p(e,"class","active"),p(e,"aria-current","true")},m(t,n){a(t,e,n)},p:t,d(t){t&&i(e)}}}function Ot(t){let n;let e=function(t,n){return 0==t[4]?St:Et}(t)(t);return{c(){e.c(),n=m()},m(t,l){e.m(t,l),a(t,n,l)},p(t,n){e.p(t,n)},d(t){e.d(t),t&&i(n)}}}function It(n){let e,l,o,r,u,m,h,g,b,k,v,$=n[2].title+"",x=n[2].subtitle+"";return{c(){e=s("div"),l=s("img"),r=f(),u=s("div"),m=s("h5"),h=d($),g=f(),b=s("p"),k=d(x),v=f(),l.src!==(o="/uploads/slider/"+n[2].img_url)&&p(l,"src",o),p(l,"class","d-block slider-picture"),p(l,"alt","..."),p(u,"class","carousel-caption d-none d-md-block"),p(e,"class","carousel-item")},m(t,n){a(t,e,n),c(e,l),c(e,r),c(e,u),c(u,m),c(m,h),c(u,g),c(u,b),c(b,k),c(e,v)},p:t,d(t){t&&i(e)}}}function At(n){let e,l,o,r,u,m,h,g,b,k,v,$=n[2].title+"",x=n[2].subtitle+"";return{c(){e=s("div"),l=s("img"),r=f(),u=s("div"),m=s("h5"),h=d($),g=f(),b=s("p"),k=d(x),v=f(),l.src!==(o="/uploads/slider/"+n[2].img_url)&&p(l,"src",o),p(l,"class","d-block slider-picture"),p(l,"alt","..."),p(u,"class","carousel-caption d-none d-md-block"),p(e,"class","carousel-item active")},m(t,n){a(t,e,n),c(e,l),c(e,r),c(e,u),c(u,m),c(m,h),c(u,g),c(u,b),c(b,k),c(e,v)},p:t,d(t){t&&i(e)}}}function Ht(t){let n;let e=function(t,n){return 0==t[4]?At:It}(t)(t);return{c(){e.c(),n=m()},m(t,l){e.m(t,l),a(t,n,l)},p(t,n){e.p(t,n)},d(t){e.d(t),t&&i(n)}}}function zt(n){let e;return{c(){e=s("h1"),e.textContent="Oczekiwanie na dane slidera"},m(t,n){a(t,e,n)},p:t,d(t){t&&i(e)}}}function Ft(n){let e,l,o={ctx:n,current:null,token:null,pending:zt,then:Lt,catch:Tt,value:0};return P(l=n[0],o),{c(){e=m(),o.block.c()},m(t,n){a(t,e,n),o.block.m(t,o.anchor=n),o.mount=()=>e.parentNode,o.anchor=e},p(t,[e]){{const l=(n=t).slice();l[0]=o.resolved,o.block.p(l,e)}},i:t,o:t,d(t){t&&i(e),o.block.d(t),o.token=null,o=null}}}function Pt(t,n,e){let{id:l}=n,o=async function(t){let n=await fetch("/getSliderData?id="+t,{method:"post"});return await n.json()}(l);return t.$$set=t=>{"id"in t&&e(1,l=t.id)},[o,l]}class Rt extends q{constructor(t){super(),Z(this,t,Pt,Ft,r,{id:1})}}function Bt(t,n,e){const l=t.slice();return l[3]=n[e],l}function Ut(n){return{c:t,m:t,p:t,d:t}}function Wt(t){let n,e,l,o,r,m,h,g,b=t[1],k=[];for(let n=0;n<b.length;n+=1)k[n]=Zt(Bt(t,b,n));let $={ctx:t,current:null,token:null,pending:Kt,then:Gt,catch:qt,value:2};return P(g=t[2],$),{c(){n=s("div"),e=s("div"),l=s("footer"),o=s("ul");for(let t=0;t<k.length;t+=1)k[t].c();r=f(),m=s("p"),h=d("© 2022 Company, Inc | "),$.block.c(),p(o,"class","nav justify-content-center border-bottom pb-2 mb-2"),p(m,"class","text-center text-muted"),p(l,"class","pt-3 mt-4"),p(e,"class","container"),v(e,"fixed-bottom",t[0]),p(n,"class","content")},m(t,i){a(t,n,i),c(n,e),c(e,l),c(l,o);for(let t=0;t<k.length;t+=1)k[t].m(o,null);c(l,r),c(l,m),c(m,h),$.block.m(m,$.anchor=null),$.mount=()=>m,$.anchor=null},p(n,l){if(t=n,2&l){let n;for(b=t[1],n=0;n<b.length;n+=1){const e=Bt(t,b,n);k[n]?k[n].p(e,l):(k[n]=Zt(e),k[n].c(),k[n].m(o,null))}for(;n<k.length;n+=1)k[n].d(1);k.length=b.length}if($.ctx=t,4&l&&g!==(g=t[2])&&P(g,$));else{const n=t.slice();n[2]=$.resolved,$.block.p(n,l)}1&l&&v(e,"fixed-bottom",t[0])},d(t){t&&i(n),u(k,t),$.block.d(),$.token=null,$=null}}}function Zt(t){let n,e,l,o,r,u=t[3].text+"";return{c(){n=s("li"),e=s("a"),l=d(u),r=f(),p(e,"href",o=t[3].url),p(e,"class","nav-link px-2 text-muted"),p(n,"class","nav-item")},m(t,o){a(t,n,o),c(n,e),c(e,l),c(n,r)},p(t,n){2&n&&u!==(u=t[3].text+"")&&g(l,u),2&n&&o!==(o=t[3].url)&&p(e,"href",o)},d(t){t&&i(n)}}}function qt(n){return{c:t,m:t,p:t,d:t}}function Gt(t){let n,e=t[2].footer_text+"";return{c(){n=d(e)},m(t,e){a(t,n,e)},p(t,l){4&l&&e!==(e=t[2].footer_text+"")&&g(n,e)},d(t){t&&i(n)}}}function Kt(n){return{c:t,m:t,p:t,d:t}}function Jt(n){let e;return{c(){e=s("h1"),e.textContent="Oczekiwanie na dane stopki"},m(t,n){a(t,e,n)},p:t,d(t){t&&i(e)}}}function Qt(n){let e,l,o={ctx:n,current:null,token:null,pending:Jt,then:Wt,catch:Ut,value:1};return P(l=n[1],o),{c(){e=m(),o.block.c()},m(t,n){a(t,e,n),o.block.m(t,o.anchor=n),o.mount=()=>e.parentNode,o.anchor=e},p(t,[e]){if(n=t,o.ctx=n,2&e&&l!==(l=n[1])&&P(l,o));else{const t=n.slice();t[1]=o.resolved,o.block.p(t,e)}},i:t,o:t,d(t){t&&i(e),o.block.d(t),o.token=null,o=null}}}function Vt(t,n,e){let l,o,{sticky:r=!1}=n;return t.$$set=t=>{"sticky"in t&&e(0,r=t.sticky)},e(1,l=async function(){let t=await fetch("/getLinks?component=footer",{method:"post"});return await t.json()}()),e(2,o=async function(){let t=await fetch("/getTemplateFooterText",{method:"post"});return await t.json()}()),[r,l,o]}class Xt extends q{constructor(t){super(),Z(this,t,Vt,Qt,r,{sticky:0})}}function Yt(n){return{c:t,m:t,p:t,d:t}}function tn(t){let n,e,l,o,r,u,m,h,b,v,$,x=t[1].title+"",y=t[1].subtitle+"";return{c(){n=s("div"),e=s("div"),l=s("h5"),o=d(x),r=f(),u=s("p"),m=d(y),h=f(),b=s("a"),v=d("Go to article"),p(l,"class","card-title"),p(u,"class","card-text"),p(b,"href",$="./article?id="+t[0]),p(b,"class","btn btn-secondary card-button"),p(e,"class","card-body"),p(n,"class","card"),k(n,"width","18rem")},m(t,i){a(t,n,i),c(n,e),c(e,l),c(l,o),c(e,r),c(e,u),c(u,m),c(e,h),c(e,b),c(b,v)},p(t,n){2&n&&x!==(x=t[1].title+"")&&g(o,x),2&n&&y!==(y=t[1].subtitle+"")&&g(m,y),1&n&&$!==($="./article?id="+t[0])&&p(b,"href",$)},d(t){t&&i(n)}}}function nn(n){let e;return{c(){e=s("h1"),e.textContent="Oczekiwanie na dane atykułu"},m(t,n){a(t,e,n)},p:t,d(t){t&&i(e)}}}function en(n){let e,l,o={ctx:n,current:null,token:null,pending:nn,then:tn,catch:Yt,value:1};return P(l=n[1],o),{c(){e=m(),o.block.c()},m(t,n){a(t,e,n),o.block.m(t,o.anchor=n),o.mount=()=>e.parentNode,o.anchor=e},p(t,[e]){if(n=t,o.ctx=n,2&e&&l!==(l=n[1])&&P(l,o));else{const t=n.slice();t[1]=o.resolved,o.block.p(t,e)}},i:t,o:t,d(t){t&&i(e),o.block.d(t),o.token=null,o=null}}}async function ln(t){let n=await fetch("/getArticleData?id="+t,{method:"post"});return await n.json()}function on(t,n,e){let{id:l}=n,o=ln(l);return t.$$set=t=>{"id"in t&&e(0,l=t.id)},t.$$.update=()=>{1&t.$$.dirty&&e(1,o=ln(l))},[l,o]}class rn extends q{constructor(t){super(),Z(this,t,on,en,r,{id:0})}}function cn(t,n,e){const l=t.slice();return l[1]=n[e],l}function an(n){return{c:t,m:t,p:t,i:t,o:t,d:t}}function un(t){let n,e,l=t[0].latestArticlesIDs,o=[];for(let n=0;n<l.length;n+=1)o[n]=sn(cn(t,l,n));const r=t=>F(o[t],1,1,()=>{o[t]=null});return{c(){for(let t=0;t<o.length;t+=1)o[t].c();n=m()},m(t,l){for(let n=0;n<o.length;n+=1)o[n].m(t,l);a(t,n,l),e=!0},p(t,e){if(1&e){let c;for(l=t[0].latestArticlesIDs,c=0;c<l.length;c+=1){const r=cn(t,l,c);o[c]?(o[c].p(r,e),z(o[c],1)):(o[c]=sn(r),o[c].c(),z(o[c],1),o[c].m(n.parentNode,n))}for(A(),c=l.length;c<o.length;c+=1)r(c);H()}},i(t){if(!e){for(let t=0;t<l.length;t+=1)z(o[t]);e=!0}},o(t){o=o.filter(Boolean);for(let t=0;t<o.length;t+=1)F(o[t]);e=!1},d(t){u(o,t),t&&i(n)}}}function sn(t){let n,e;return n=new rn({props:{id:t[1]}}),{c(){R(n.$$.fragment)},m(t,l){B(n,t,l),e=!0},p(t,e){const l={};1&e&&(l.id=t[1]),n.$set(l)},i(t){e||(z(n.$$.fragment,t),e=!0)},o(t){F(n.$$.fragment,t),e=!1},d(t){U(n,t)}}}function dn(n){return{c:t,m:t,p:t,i:t,o:t,d:t}}function fn(t){let n,e,l,o={ctx:t,current:null,token:null,pending:dn,then:un,catch:an,value:0,blocks:[,,,]};return P(e=t[0],o),{c(){n=s("div"),o.block.c(),p(n,"class","d-flex flex-row bd-highlight mb-3 news-div content")},m(t,e){a(t,n,e),o.block.m(n,o.anchor=null),o.mount=()=>n,o.anchor=null,l=!0},p(n,[l]){if(t=n,o.ctx=t,1&l&&e!==(e=t[0])&&P(e,o));else{const n=t.slice();n[0]=o.resolved,o.block.p(n,l)}},i(t){l||(z(o.block),l=!0)},o(t){for(let t=0;t<3;t+=1){F(o.blocks[t])}l=!1},d(t){t&&i(n),o.block.d(),o.token=null,o=null}}}async function mn(t){let n=await fetch("/getLatestArticlesIDs?count="+t,{method:"post"});return await n.json()}function hn(t,n,e){let l=mn(3);return e(0,l=mn(3)),[l]}class pn extends q{constructor(t){super(),Z(this,t,hn,fn,r,{})}}function gn(n){return{c:t,m:t,p:t,d:t}}function bn(n){let e,l,o,r,u,m,h,g,b,k,v,$,x,y,w,_,j,N,D=n[0].title+"",C=n[0].subtitle+"",M=n[0].content+"";return{c(){e=s("div"),l=s("hr"),o=f(),r=s("div"),u=s("div"),m=s("h2"),h=d(D),g=f(),b=s("span"),k=d(C),v=f(),$=s("p"),x=f(),y=s("div"),w=s("img"),j=f(),N=s("hr"),p(l,"class","featurette-divider"),p(b,"class","text-muted"),p(m,"class","featurette-heading"),p($,"class","lead"),p(u,"class","featurette-text col-12 col-lg-5 col-xl-6"),w.src!==(_="/uploads/featurettes/"+n[0].img_url)&&p(w,"src",_),p(w,"alt","Featurette Image"),p(y,"class","col-12 col-lg-7 col-xl-6 d-flex justify-center"),p(r,"class","featurette row"),p(N,"class","featurette-divider"),p(e,"class","content")},m(t,n){a(t,e,n),c(e,l),c(e,o),c(e,r),c(r,u),c(u,m),c(m,h),c(m,g),c(m,b),c(b,k),c(u,v),c(u,$),$.innerHTML=M,c(r,x),c(r,y),c(y,w),c(e,j),c(e,N)},p:t,d(t){t&&i(e)}}}function kn(n){return{c:t,m:t,p:t,d:t}}function vn(n){let e,l,o={ctx:n,current:null,token:null,pending:kn,then:bn,catch:gn,value:0};return P(l=n[0],o),{c(){e=m(),o.block.c()},m(t,n){a(t,e,n),o.block.m(t,o.anchor=n),o.mount=()=>e.parentNode,o.anchor=e},p(t,[e]){{const l=(n=t).slice();l[0]=o.resolved,o.block.p(l,e)}},i:t,o:t,d(t){t&&i(e),o.block.d(t),o.token=null,o=null}}}function $n(t,n,e){let{id:l}=n,o=async function(t){let n=await fetch("/getFeaturetteData?id="+t,{method:"post"});return await n.json()}(l);return t.$$set=t=>{"id"in t&&e(1,l=t.id)},[o,l]}class xn extends q{constructor(t){super(),Z(this,t,$n,vn,r,{id:1})}}function yn(t,n,e){const l=t.slice();return l[2]=n[e],l[4]=e,l}function wn(n){return{c:t,m:t,p:t,i:t,o:t,d:t}}function _n(t){let n,e,l=t[0],o=[];for(let n=0;n<l.length;n+=1)o[n]=Cn(yn(t,l,n));const r=t=>F(o[t],1,1,()=>{o[t]=null});return{c(){for(let t=0;t<o.length;t+=1)o[t].c();n=m()},m(t,l){for(let n=0;n<o.length;n+=1)o[n].m(t,l);a(t,n,l),e=!0},p(t,e){if(1&e){let c;for(l=t[0],c=0;c<l.length;c+=1){const r=yn(t,l,c);o[c]?(o[c].p(r,e),z(o[c],1)):(o[c]=Cn(r),o[c].c(),z(o[c],1),o[c].m(n.parentNode,n))}for(A(),c=l.length;c<o.length;c+=1)r(c);H()}},i(t){if(!e){for(let t=0;t<l.length;t+=1)z(o[t]);e=!0}},o(t){o=o.filter(Boolean);for(let t=0;t<o.length;t+=1)F(o[t]);e=!1},d(t){u(o,t),t&&i(n)}}}function jn(n){let e,l;return e=new pn({}),{c(){R(e.$$.fragment)},m(t,n){B(e,t,n),l=!0},p:t,i(t){l||(z(e.$$.fragment,t),l=!0)},o(t){F(e.$$.fragment,t),l=!1},d(t){U(e,t)}}}function Nn(t){let n,e;return n=new xn({props:{id:t[2].dbID}}),{c(){R(n.$$.fragment)},m(t,l){B(n,t,l),e=!0},p(t,e){const l={};1&e&&(l.id=t[2].dbID),n.$set(l)},i(t){e||(z(n.$$.fragment,t),e=!0)},o(t){F(n.$$.fragment,t),e=!1},d(t){U(n,t)}}}function Dn(t){let n,e;return n=new Rt({props:{id:t[2].dbID}}),{c(){R(n.$$.fragment)},m(t,l){B(n,t,l),e=!0},p(t,e){const l={};1&e&&(l.id=t[2].dbID),n.$set(l)},i(t){e||(z(n.$$.fragment,t),e=!0)},o(t){F(n.$$.fragment,t),e=!1},d(t){U(n,t)}}}function Cn(t){let n,e,l,o;const r=[Dn,Nn,jn],c=[];function u(t,n){return"slider"==t[2].type?0:"featurette"==t[2].type?1:"news"==t[2].type?2:-1}return~(n=u(t))&&(e=c[n]=r[n](t)),{c(){e&&e.c(),l=m()},m(t,e){~n&&c[n].m(t,e),a(t,l,e),o=!0},p(t,o){let a=n;n=u(t),n===a?~n&&c[n].p(t,o):(e&&(A(),F(c[a],1,1,()=>{c[a]=null}),H()),~n?(e=c[n],e||(e=c[n]=r[n](t),e.c()),z(e,1),e.m(l.parentNode,l)):e=null)},i(t){o||(z(e),o=!0)},o(t){F(e),o=!1},d(t){~n&&c[n].d(t),t&&i(l)}}}function Mn(n){return{c:t,m:t,p:t,i:t,o:t,d:t}}function Tn(t){let n,e,l,o,r,u,d;e=new Dt({});let m={ctx:t,current:null,token:null,pending:Mn,then:_n,catch:wn,value:0,blocks:[,,,]};return P(o=t[0],m),u=new Xt({}),{c(){n=s("main"),R(e.$$.fragment),l=f(),m.block.c(),r=f(),R(u.$$.fragment)},m(t,o){a(t,n,o),B(e,n,null),c(n,l),m.block.m(n,m.anchor=null),m.mount=()=>n,m.anchor=r,c(n,r),B(u,n,null),d=!0},p(n,[e]){if(t=n,m.ctx=t,1&e&&o!==(o=t[0])&&P(o,m));else{const n=t.slice();n[0]=m.resolved,m.block.p(n,e)}},i(t){d||(z(e.$$.fragment,t),z(m.block),z(u.$$.fragment,t),d=!0)},o(t){F(e.$$.fragment,t);for(let t=0;t<3;t+=1){F(m.blocks[t])}F(u.$$.fragment,t),d=!1},d(t){t&&i(n),U(e),m.block.d(),m.token=null,m=null,U(u)}}}function Ln(t,n,e){let l;return e(0,l=(async()=>{let t=await fetch("/getComponentsInCurrentTemplate");return await t.json()})()),[l]}return new class extends q{constructor(t){super(),Z(this,t,Ln,Tn,r,{})}}({target:document.body})}();
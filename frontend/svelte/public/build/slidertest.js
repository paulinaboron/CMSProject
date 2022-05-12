var slidertest=function(){"use strict";function t(){}function e(t){return t()}function n(){return Object.create(null)}function o(t){t.forEach(e)}function r(t){return"function"==typeof t}function l(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function c(t,e){t.appendChild(e)}function s(t,e,n){t.insertBefore(e,n||null)}function a(t){t.parentNode.removeChild(t)}function i(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function u(t){return document.createElement(t)}function d(t){return document.createTextNode(t)}function f(){return d(" ")}function p(){return d("")}function h(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}let m;function g(t){m=t}function b(){if(!m)throw new Error("Function called outside component initialization");return m}const $=[],k=[],v=[],y=[],x=Promise.resolve();let _=!1;function w(t){v.push(t)}let E=!1;const D=new Set;function S(){if(!E){E=!0;do{for(let t=0;t<$.length;t+=1){const e=$[t];g(e),j(e.$$)}for($.length=0;k.length;)k.pop()();for(let t=0;t<v.length;t+=1){const e=v[t];D.has(e)||(D.add(e),e())}v.length=0}while($.length);for(;y.length;)y.pop()();_=!1,E=!1,D.clear()}}function j(t){if(null!==t.fragment){t.update(),o(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(w)}}const N=new Set;let A;function O(t,e){t&&t.i&&(N.delete(t),t.i(e))}function C(t,e,n,o){if(t&&t.o){if(N.has(t))return;N.add(t),A.c.push(()=>{N.delete(t),o&&(n&&t.d(1),o())}),t.o(e)}}function M(t,e){const n=e.token={};function r(t,r,l,c){if(e.token!==n)return;e.resolved=c;let s=e.ctx;void 0!==l&&(s=s.slice(),s[l]=c);const a=t&&(e.current=t)(s);let i=!1;e.block&&(e.blocks?e.blocks.forEach((t,n)=>{n!==r&&t&&(A={r:0,c:[],p:A},C(t,1,1,()=>{e.blocks[n]=null}),A.r||o(A.c),A=A.p)}):e.block.d(1),a.c(),O(a,1),a.m(e.mount(),e.anchor),i=!0),e.block=a,e.blocks&&(e.blocks[r]=a),i&&S()}if((l=t)&&"object"==typeof l&&"function"==typeof l.then){const n=b();if(t.then(t=>{g(n),r(e.then,1,e.value,t),g(null)},t=>{g(n),r(e.catch,2,e.error,t),g(null)}),e.current!==e.pending)return r(e.pending,0),!0}else{if(e.current!==e.then)return r(e.then,1,e.value,t),!0;e.resolved=t}var l}function T(t,n,l){const{fragment:c,on_mount:s,on_destroy:a,after_update:i}=t.$$;c&&c.m(n,l),w(()=>{const n=s.map(e).filter(r);a?a.push(...n):o(n),t.$$.on_mount=[]}),i.forEach(w)}function z(t,e){const n=t.$$;null!==n.fragment&&(o(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function H(t,e){-1===t.$$.dirty[0]&&($.push(t),_||(_=!0,x.then(S)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function L(e,r,l,c,s,i,u=[-1]){const d=m;g(e);const f=r.props||{},p=e.$$={fragment:null,ctx:null,props:i,update:t,not_equal:s,bound:n(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(d?d.$$.context:[]),callbacks:n(),dirty:u,skip_bound:!1};let h=!1;if(p.ctx=l?l(e,f,(t,n,...o)=>{const r=o.length?o[0]:n;return p.ctx&&s(p.ctx[t],p.ctx[t]=r)&&(!p.skip_bound&&p.bound[t]&&p.bound[t](r),h&&H(e,t)),n}):[],p.update(),h=!0,o(p.before_update),p.fragment=!!c&&c(p.ctx),r.target){if(r.hydrate){const t=function(t){return Array.from(t.childNodes)}(r.target);p.fragment&&p.fragment.l(t),t.forEach(a)}else p.fragment&&p.fragment.c();r.intro&&O(e.$$.fragment),T(e,r.target,r.anchor),S()}g(d)}class P{$destroy(){z(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}function q(t,e,n){const o=t.slice();return o[2]=e[n],o[4]=n,o}function B(t,e,n){const o=t.slice();return o[2]=e[n],o[4]=n,o}function F(e){return{c:t,m:t,p:t,d:t}}function I(t){let e,n,o,r,l,d,p,m,g=t[0].slides,b=[];for(let e=0;e<g.length;e+=1)b[e]=K(B(t,g,e));let $=t[0].slides,k=[];for(let e=0;e<$.length;e+=1)k[e]=U(q(t,$,e));return{c(){e=u("div"),n=u("div");for(let t=0;t<b.length;t+=1)b[t].c();o=f(),r=u("div");for(let t=0;t<k.length;t+=1)k[t].c();l=f(),d=u("button"),d.innerHTML='<span class="carousel-control-prev-icon" aria-hidden="true"></span> \n        <span class="visually-hidden">Previous</span>',p=f(),m=u("button"),m.innerHTML='<span class="carousel-control-next-icon" aria-hidden="true"></span> \n        <span class="visually-hidden">Next</span>',h(n,"class","carousel-indicators"),h(r,"class","carousel-inner"),h(d,"class","carousel-control-prev"),h(d,"type","button"),h(d,"data-bs-target","#carouselExampleDark"),h(d,"data-bs-slide","prev"),h(m,"class","carousel-control-next"),h(m,"type","button"),h(m,"data-bs-target","#carouselExampleDark"),h(m,"data-bs-slide","next"),h(e,"id","carouselExampleDark"),h(e,"class","carousel carousel-dark slide"),h(e,"data-bs-ride","carousel")},m(t,a){s(t,e,a),c(e,n);for(let t=0;t<b.length;t+=1)b[t].m(n,null);c(e,o),c(e,r);for(let t=0;t<k.length;t+=1)k[t].m(r,null);c(e,l),c(e,d),c(e,p),c(e,m)},p(t,e){if(1&e){let o;for(g=t[0].slides,o=0;o<g.length;o+=1){const r=B(t,g,o);b[o]?b[o].p(r,e):(b[o]=K(r),b[o].c(),b[o].m(n,null))}for(;o<b.length;o+=1)b[o].d(1);b.length=g.length}if(1&e){let n;for($=t[0].slides,n=0;n<$.length;n+=1){const o=q(t,$,n);k[n]?k[n].p(o,e):(k[n]=U(o),k[n].c(),k[n].m(r,null))}for(;n<k.length;n+=1)k[n].d(1);k.length=$.length}},d(t){t&&a(e),i(b,t),i(k,t)}}}function J(t){let e,n,o;return{c(){e=u("button"),h(e,"type","button"),h(e,"data-bs-target","#carouselExampleDark"),h(e,"data-bs-slide-to",n=t[4]),h(e,"aria-label",o="Slide "+t[4])},m(t,n){s(t,e,n)},d(t){t&&a(e)}}}function G(t){let e,n,o;return{c(){e=u("button"),h(e,"type","button"),h(e,"data-bs-target","#carouselExampleDark"),h(e,"data-bs-slide-to",n=t[4]),h(e,"aria-label",o="Slide "+t[4]),h(e,"class","active"),h(e,"aria-current","true")},m(t,n){s(t,e,n)},d(t){t&&a(e)}}}function K(e){let n;let o=function(t,e){return 1==t[2].order?G:J}(e)(e);return{c(){o.c(),n=p()},m(t,e){o.m(t,e),s(t,n,e)},p:t,d(t){o.d(t),t&&a(n)}}}function Q(e){let n,o,r,l,i,p,m,g,b,$,k,v=e[2].title+"",y=e[2].subtitle+"";return{c(){n=u("div"),o=u("img"),l=f(),i=u("div"),p=u("h5"),m=d(v),g=f(),b=u("p"),$=d(y),k=f(),o.src!==(r="/uploads/slider/"+e[2].img_url)&&h(o,"src",r),h(o,"class","d-block w-100 slider-picture"),h(o,"alt","..."),h(i,"class","carousel-caption d-none d-md-block"),h(n,"class","carousel-item"),h(n,"data-bs-interval","9000")},m(t,e){s(t,n,e),c(n,o),c(n,l),c(n,i),c(i,p),c(p,m),c(i,g),c(i,b),c(b,$),c(n,k)},p:t,d(t){t&&a(n)}}}function R(e){let n,o,r,l,i,p,m,g,b,$,k,v=e[2].title+"",y=e[2].subtitle+"";return{c(){n=u("div"),o=u("img"),l=f(),i=u("div"),p=u("h5"),m=d(v),g=f(),b=u("p"),$=d(y),k=f(),o.src!==(r="/uploads/slider/"+e[2].img_url)&&h(o,"src",r),h(o,"class","d-block w-100 slider-picture"),h(o,"alt","..."),h(i,"class","carousel-caption d-none d-md-block"),h(n,"class","carousel-item active"),h(n,"data-bs-interval","9000")},m(t,e){s(t,n,e),c(n,o),c(n,l),c(n,i),c(i,p),c(p,m),c(i,g),c(i,b),c(b,$),c(n,k)},p:t,d(t){t&&a(n)}}}function U(t){let e;let n=function(t,e){return 1==t[2].order?R:Q}(t)(t);return{c(){n.c(),e=p()},m(t,o){n.m(t,o),s(t,e,o)},p(t,e){n.p(t,e)},d(t){n.d(t),t&&a(e)}}}function V(e){let n;return{c(){n=u("h1"),n.textContent="Oczekiwanie na dane slidera"},m(t,e){s(t,n,e)},p:t,d(t){t&&a(n)}}}function W(e){let n,o,r={ctx:e,current:null,token:null,pending:V,then:I,catch:F,value:0};return M(o=e[0],r),{c(){n=p(),r.block.c()},m(t,e){s(t,n,e),r.block.m(t,r.anchor=e),r.mount=()=>n.parentNode,r.anchor=n},p(t,[n]){{const o=(e=t).slice();o[0]=r.resolved,r.block.p(o,n)}},i:t,o:t,d(t){t&&a(n),r.block.d(t),r.token=null,r=null}}}function X(t,e,n){let{id:o}=e;console.log("ID Slidera: ",o);let r=async function(t){let e=await fetch("http://localhost:5000/getSliderData?id="+t,{method:"post"}),n=await e.json();return console.log("responseJson: ",n),n}(o);return console.log("SliderData: ",r),t.$$set=t=>{"id"in t&&n(1,o=t.id)},[r,o]}class Y extends P{constructor(t){super(),L(this,t,X,W,l,{id:1})}}function Z(e){let n,o;return n=new Y({props:{id:1}}),{c(){var t;(t=n.$$.fragment)&&t.c()},m(t,e){T(n,t,e),o=!0},p:t,i(t){o||(O(n.$$.fragment,t),o=!0)},o(t){C(n.$$.fragment,t),o=!1},d(t){z(n,t)}}}return new class extends P{constructor(t){super(),L(this,t,null,Z,l,{})}}({target:document.body})}();

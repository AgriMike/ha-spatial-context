/*! spatial-context-panel v0.15.0-beta.1 | MIT */
!function(){"use strict";function e(e,t,i,n){var o,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,n);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(r<3?o(s):r>3?o(t,i,s):o(t,i))||s);return r>3&&s&&Object.defineProperty(t,i,s),s}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,n=Symbol(),o=new WeakMap;let r=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=o.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&o.set(t,e))}return e}toString(){return this.cssText}};const s=e=>new r("string"==typeof e?e:e+"",void 0,n),a=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,n)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[n+1],e[0]);return new r(i,e,n)},l=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return s(t)})(e):e,{is:c,defineProperty:d,getOwnPropertyDescriptor:h,getOwnPropertyNames:u,getOwnPropertySymbols:g,getPrototypeOf:p}=Object,m=globalThis,f=m.trustedTypes,_=f?f.emptyScript:"",b=m.reactiveElementPolyfillSupport,v=(e,t)=>e,y={toAttribute(e,t){switch(t){case Boolean:e=e?_:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},k=(e,t)=>!c(e,t),w={attribute:!0,type:String,converter:y,reflect:!1,useDefault:!1,hasChanged:k};Symbol.metadata??=Symbol("metadata"),m.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=w){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),n=this.getPropertyDescriptor(e,i,t);void 0!==n&&d(this.prototype,e,n)}}static getPropertyDescriptor(e,t,i){const{get:n,set:o}=h(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:n,set(t){const r=n?.call(this);o?.call(this,t),this.requestUpdate(e,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??w}static _$Ei(){if(this.hasOwnProperty(v("elementProperties")))return;const e=p(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(v("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(v("properties"))){const e=this.properties,t=[...u(e),...g(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(l(e))}else void 0!==e&&t.push(l(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,n)=>{if(i)e.adoptedStyleSheets=n.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of n){const n=document.createElement("style"),o=t.litNonce;void 0!==o&&n.setAttribute("nonce",o),n.textContent=i.cssText,e.appendChild(n)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),n=this.constructor._$Eu(e,i);if(void 0!==n&&!0===i.reflect){const o=(void 0!==i.converter?.toAttribute?i.converter:y).toAttribute(t,i.type);this._$Em=e,null==o?this.removeAttribute(n):this.setAttribute(n,o),this._$Em=null}}_$AK(e,t){const i=this.constructor,n=i._$Eh.get(e);if(void 0!==n&&this._$Em!==n){const e=i.getPropertyOptions(n),o="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:y;this._$Em=n;const r=o.fromAttribute(t,e.type);this[n]=r??this._$Ej?.get(n)??r,this._$Em=null}}requestUpdate(e,t,i,n=!1,o){if(void 0!==e){const r=this.constructor;if(!1===n&&(o=this[e]),i??=r.getPropertyOptions(e),!((i.hasChanged??k)(o,t)||i.useDefault&&i.reflect&&o===this._$Ej?.get(e)&&!this.hasAttribute(r._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:n,wrapped:o},r){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,r??t??this[e]),!0!==o||void 0!==r)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===n&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,n=this[t];!0!==e||this._$AL.has(t)||void 0===n||this.C(t,void 0,i,n)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[v("elementProperties")]=new Map,x[v("finalized")]=new Map,b?.({ReactiveElement:x}),(m.reactiveElementVersions??=[]).push("2.1.2");const M=globalThis,$=e=>e,L=M.trustedTypes,S=L?L.createPolicy("lit-html",{createHTML:e=>e}):void 0,C="$lit$",P=`lit$${Math.random().toFixed(9).slice(2)}$`,I="?"+P,H=`<${I}>`,A=document,V=()=>A.createComment(""),F=e=>null===e||"object"!=typeof e&&"function"!=typeof e,T=Array.isArray,R="[ \t\n\f\r]",B=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,E=/-->/g,D=/>/g,z=RegExp(`>|${R}(?:([^\\s"'>=/]+)(${R}*=${R}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),O=/'/g,j=/"/g,U=/^(?:script|style|textarea|title)$/i,W=e=>(t,...i)=>({_$litType$:e,strings:t,values:i}),N=W(1),Z=W(2),G=Symbol.for("lit-noChange"),K=Symbol.for("lit-nothing"),q=new WeakMap,Y=A.createTreeWalker(A,129);function Q(e,t){if(!T(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(t):t}const X=(e,t)=>{const i=e.length-1,n=[];let o,r=2===t?"<svg>":3===t?"<math>":"",s=B;for(let t=0;t<i;t++){const i=e[t];let a,l,c=-1,d=0;for(;d<i.length&&(s.lastIndex=d,l=s.exec(i),null!==l);)d=s.lastIndex,s===B?"!--"===l[1]?s=E:void 0!==l[1]?s=D:void 0!==l[2]?(U.test(l[2])&&(o=RegExp("</"+l[2],"g")),s=z):void 0!==l[3]&&(s=z):s===z?">"===l[0]?(s=o??B,c=-1):void 0===l[1]?c=-2:(c=s.lastIndex-l[2].length,a=l[1],s=void 0===l[3]?z:'"'===l[3]?j:O):s===j||s===O?s=z:s===E||s===D?s=B:(s=z,o=void 0);const h=s===z&&e[t+1].startsWith("/>")?" ":"";r+=s===B?i+H:c>=0?(n.push(a),i.slice(0,c)+C+i.slice(c)+P+h):i+P+(-2===c?t:h)}return[Q(e,r+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),n]};class J{constructor({strings:e,_$litType$:t},i){let n;this.parts=[];let o=0,r=0;const s=e.length-1,a=this.parts,[l,c]=X(e,t);if(this.el=J.createElement(l,i),Y.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(n=Y.nextNode())&&a.length<s;){if(1===n.nodeType){if(n.hasAttributes())for(const e of n.getAttributeNames())if(e.endsWith(C)){const t=c[r++],i=n.getAttribute(e).split(P),s=/([.?@])?(.*)/.exec(t);a.push({type:1,index:o,name:s[2],strings:i,ctor:"."===s[1]?oe:"?"===s[1]?re:"@"===s[1]?se:ne}),n.removeAttribute(e)}else e.startsWith(P)&&(a.push({type:6,index:o}),n.removeAttribute(e));if(U.test(n.tagName)){const e=n.textContent.split(P),t=e.length-1;if(t>0){n.textContent=L?L.emptyScript:"";for(let i=0;i<t;i++)n.append(e[i],V()),Y.nextNode(),a.push({type:2,index:++o});n.append(e[t],V())}}}else if(8===n.nodeType)if(n.data===I)a.push({type:2,index:o});else{let e=-1;for(;-1!==(e=n.data.indexOf(P,e+1));)a.push({type:7,index:o}),e+=P.length-1}o++}}static createElement(e,t){const i=A.createElement("template");return i.innerHTML=e,i}}function ee(e,t,i=e,n){if(t===G)return t;let o=void 0!==n?i._$Co?.[n]:i._$Cl;const r=F(t)?void 0:t._$litDirective$;return o?.constructor!==r&&(o?._$AO?.(!1),void 0===r?o=void 0:(o=new r(e),o._$AT(e,i,n)),void 0!==n?(i._$Co??=[])[n]=o:i._$Cl=o),void 0!==o&&(t=ee(e,o._$AS(e,t.values),o,n)),t}class te{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,n=(e?.creationScope??A).importNode(t,!0);Y.currentNode=n;let o=Y.nextNode(),r=0,s=0,a=i[0];for(;void 0!==a;){if(r===a.index){let t;2===a.type?t=new ie(o,o.nextSibling,this,e):1===a.type?t=new a.ctor(o,a.name,a.strings,this,e):6===a.type&&(t=new ae(o,this,e)),this._$AV.push(t),a=i[++s]}r!==a?.index&&(o=Y.nextNode(),r++)}return Y.currentNode=A,n}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class ie{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,n){this.type=2,this._$AH=K,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=n,this._$Cv=n?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=ee(this,e,t),F(e)?e===K||null==e||""===e?(this._$AH!==K&&this._$AR(),this._$AH=K):e!==this._$AH&&e!==G&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>T(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==K&&F(this._$AH)?this._$AA.nextSibling.data=e:this.T(A.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,n="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=J.createElement(Q(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===n)this._$AH.p(t);else{const e=new te(n,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=q.get(e.strings);return void 0===t&&q.set(e.strings,t=new J(e)),t}k(e){T(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,n=0;for(const o of e)n===t.length?t.push(i=new ie(this.O(V()),this.O(V()),this,this.options)):i=t[n],i._$AI(o),n++;n<t.length&&(this._$AR(i&&i._$AB.nextSibling,n),t.length=n)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=$(e).nextSibling;$(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class ne{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,n,o){this.type=1,this._$AH=K,this._$AN=void 0,this.element=e,this.name=t,this._$AM=n,this.options=o,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=K}_$AI(e,t=this,i,n){const o=this.strings;let r=!1;if(void 0===o)e=ee(this,e,t,0),r=!F(e)||e!==this._$AH&&e!==G,r&&(this._$AH=e);else{const n=e;let s,a;for(e=o[0],s=0;s<o.length-1;s++)a=ee(this,n[i+s],t,s),a===G&&(a=this._$AH[s]),r||=!F(a)||a!==this._$AH[s],a===K?e=K:e!==K&&(e+=(a??"")+o[s+1]),this._$AH[s]=a}r&&!n&&this.j(e)}j(e){e===K?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class oe extends ne{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===K?void 0:e}}class re extends ne{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==K)}}class se extends ne{constructor(e,t,i,n,o){super(e,t,i,n,o),this.type=5}_$AI(e,t=this){if((e=ee(this,e,t,0)??K)===G)return;const i=this._$AH,n=e===K&&i!==K||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,o=e!==K&&(i===K||n);n&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class ae{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){ee(this,e)}}const le=M.litHtmlPolyfillSupport;le?.(J,ie),(M.litHtmlVersions??=[]).push("3.3.3");const ce=(e,t,i)=>{const n=i?.renderBefore??t;let o=n._$litPart$;if(void 0===o){const e=i?.renderBefore??null;n._$litPart$=o=new ie(t.insertBefore(V(),e),e,void 0,i??{})}return o._$AI(e),o},de=globalThis;let he=class extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=ce(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return G}};he._$litElement$=!0,he.finalized=!0,de.litElementHydrateSupport?.({LitElement:he});const ue=de.litElementPolyfillSupport;ue?.({LitElement:he}),(de.litElementVersions??=[]).push("4.2.2");const ge={attribute:!0,type:String,converter:y,reflect:!1,hasChanged:k},pe=(e=ge,t,i)=>{const{kind:n,metadata:o}=i;let r=globalThis.litPropertyMetadata.get(o);if(void 0===r&&globalThis.litPropertyMetadata.set(o,r=new Map),"setter"===n&&((e=Object.create(e)).wrapped=!0),r.set(i.name,e),"accessor"===n){const{name:n}=i;return{set(i){const o=t.get.call(this);t.set.call(this,i),this.requestUpdate(n,o,e,!0,i)},init(t){return void 0!==t&&this.C(n,void 0,e,t),t}}}if("setter"===n){const{name:n}=i;return function(i){const o=this[n];t.call(this,i),this.requestUpdate(n,o,e,!0,i)}}throw Error("Unsupported decorator location: "+n)};function me(e){return(t,i)=>"object"==typeof i?pe(e,t,i):((e,t,i)=>{const n=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),n?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}function fe(e){return me({...e,state:!0,attribute:!1})}function _e(e,t){return(t,i,n)=>((e,t,i)=>(i.configurable=!0,i.enumerable=!0,Reflect.decorate&&"object"!=typeof t&&Object.defineProperty(e,t,i),i))(t,i,{get(){return(t=>t.renderRoot?.querySelector(e)??null)(this)}})}const be=e=>(t,i)=>{const n=()=>{customElements.get(e)?console.info(`spatial-context: <${e}> already defined — reload the page to pick up the updated panel.`):customElements.define(e,t)};void 0!==i?i.addInitializer(n):n()},ve="__property__";function ye(e){switch(e){case"strong":return"#2e7d32";case"medium":return"#f9a825";case"weak":return"#c62828";default:return"#607d8b"}}function ke(e){return e>=-70?"strong":e>=-85?"medium":"weak"}const we=["light","switch","climate","media_player","lock","cover","fan","vacuum","alarm_control_panel","valve","humidifier","siren","water_heater","camera","assist_satellite","device_tracker","binary_sensor","sensor"];function xe(e,t){if(!e)return null;const i=[...t].filter(t=>t.device_id===e);if(0===i.length)return null;const n=e=>"config"===e.entity_category?2:e.entity_category?1:0,o=e=>{const t=we.indexOf(e.domain);return-1===t?we.length:t};return i.sort((e,t)=>n(e)-n(t)||o(e)-o(t)),i[0]}function Me(e,t){return xe(e,t)?.device_name??"Unknown device"}class $e{constructor(e=100,t=400){this._limit=e,this._coalesceMs=t,this._past=[],this._future=[],this._lastRecordAt=Number.NEGATIVE_INFINITY}get canUndo(){return this._past.length>0}get canRedo(){return this._future.length>0}record(e,t=Date.now()){t-this._lastRecordAt>this._coalesceMs&&(this._past.push(e),this._past.length>this._limit&&this._past.shift()),this._lastRecordAt=t,this._future=[]}undo(e){const t=this._past.pop();return void 0===t?null:(this._future.push(e),this._lastRecordAt=Number.NEGATIVE_INFINITY,t)}redo(e){const t=this._future.pop();return void 0===t?null:(this._past.push(e),this._lastRecordAt=Number.NEGATIVE_INFINITY,t)}discardIfLast(e){this._past[this._past.length-1]===e&&(this._past.pop(),this._lastRecordAt=Number.NEGATIVE_INFINITY)}clear(){this._past=[],this._future=[],this._lastRecordAt=Number.NEGATIVE_INFINITY}}const Le=new class{constructor(){this._client=null,this._enabled=!1,this._buffer=[],this._timer=null,this._errorHooked=!1}configure(e,t){this._client=e,this._enabled=t,t?this._hookErrors():this._buffer=[]}log(e,t={}){this._enabled&&(this._buffer.push({event:e,t:(new Date).toISOString(),...t}),this._buffer.length>200&&this._buffer.shift(),this._timer??(this._timer=window.setTimeout(()=>{this.flush()},2e3)))}async flush(){if(this._timer=null,!this._client||0===this._buffer.length)return;const e=this._buffer;this._buffer=[];try{await this._client.sendDebugLog(e)}catch{}}_hookErrors(){if(this._errorHooked)return;this._errorHooked=!0;const e=e=>!!e&&/spatial[-_]context/.test(e);window.addEventListener("error",t=>{const i=t.error?.stack;(e(i)||e(t.filename))&&this.log("js_error",{message:t.message,stack:i})}),window.addEventListener("unhandledrejection",t=>{const i=t.reason;e(i?.stack)&&this.log("js_rejection",{message:i?.message,stack:i?.stack})})}};function Se(e,t,i){const n=e.source_bounds;if(!n||n.max_x<=n.min_x||n.max_y<=n.min_y||e.width<=0||e.height<=0)return null;const o=e.rotation_deg*Math.PI/180,r=Math.cos(o),s=Math.sin(o),a=t-e.x,l=i-e.y,c=-s*a+r*l;return{x:((r*a+s*l)/e.width+.5)*(n.max_x-n.min_x)+n.min_x,y:(c/e.height+.5)*(n.max_y-n.min_y)+n.min_y}}const Ce={en:{floorTabs:{property:"Property"},appHeader:{saving:"Saving…",save:"Save",menu:"Menu"},canvas:{mode:{select:"Select",pan:"Pan",trace:"Trace Room",wall:"Trace Wall",door:"Add Door",window:"Add Window",scale:"Set Scale",place:"Place Device",align:"Align Floors",furniture:"Furniture & household items"},snap:{tooltip:"What new points snap onto (hold Shift to place one point freely)",all:"Snap: all",walls:"Snap: walls only",rooms:"Snap: rooms only",off:"Snap: off"},hint:{closeRoom:"Click near the start to close the room.",addPoints:"Click to add points.",addWallPoints:"Click to add points.",addWallPointsFinish:"Click to add points, then Finish.",scaleFirst:"Click the first point of a known distance.",scaleSecond:"Click the second point.",placeOpening:"Click on a wall to place a {type}.",alignAgainst:"Align against:",noBackground:"That floor has no background image to align against.",alignDrag:"Drag to move, use +/− to resize, then Apply.",placeFurniture:"Click to place · R rotates · Shift+click places another",freeform:"Click to add corners. Click the first corner to close the shape, or Finish (Enter) to leave it open.",drawShape:"Drag on the plan to draw the shape (Shift for a square or circle), or click to drop it at its default size."},openingType:{door:"door",window:"window",opening:"opening"},openingLabel:{door:"door",window:"window"},button:{cancel:"Cancel",finishWall:"Finish Wall",chooseAnother:"Choose another",apply:"Apply",close:"Close",done:"Done",finishShape:"Finish shape"},align:{choose:"— Choose a floor —",shrink:"Shrink overlay slightly",grow:"Grow overlay slightly"},room:{custom:"— Custom —",outdoor:"Outdoor / no floor",hide:"Hide room",show:"Show room",color:"Room color",fillOpacity:"Fill opacity ({pct}%)",borderOpacity:"Border opacity ({pct}%)",rename:"Rename",doneEditing:"Done editing",editVertices:"Edit vertices",resetLabel:"Reset label position",delete:"Delete room",outdoorHint:"A deck, patio or porch: daylight through a door or window onto it only falls indoors.",outdoorSpace:"Outdoor space",thisFloor:"This floor",unknownArea:"Unknown area ({id})",floorOffset:"Floor height in 3D ({unit})",floorOffsetHint:"How far this room's floor sits above (+) or below (−) the rest of the floor in the 3D view, e.g. a split level's garage or entry landing. Its walls and doors move with it."},pin:{setLabel:"Set label",setIcon:"Set icon",setHeight:"Set height",delete:"Delete pin",removeFromSpot:"Remove from this spot",stackTitle:"{count} devices at this spot",icon:"Icon",moreIcons:"More icons…",defaultIcon:"Back to the default icon"},wall:{material:"Wall material",thickness:"Wall thickness ({unit})",delete:"Delete wall"},opening:{width:"Width ({unit})",storedUnits:"stored units",calibrate:"Calibrate Scale for real units",delete:"Delete",cover:"Cover",noCover:"None",coverState:"Right now",coverOpen:"{pct}% open",coverUnavailable:"Unavailable",coverLeft:"Left cover",coverRight:"Right cover",twoCovers:"Two covers (left & right)",swapCovers:"Swap left and right",left:"Left",right:"Right",garage:"Garage door",garageHint:"Drawn as an overhead door that rolls up into the garage with its cover's position. Its sun patch is under Daylight.",windowStyle:"Window type",windowStyles:{standard:"Standard",transom:"Transom (high strip)",full:"Floor to ceiling"}},meshStub:{goToFloor:"Go to floor"},notCalibrated:"Not calibrated",card:{room:"Room",device:"Device",wall:"Wall",wallOpening:"In a wall",link:"Link",quality:"Signal",area:"Area",style:"Style",visible:"Visible",name:"Name",label:"Label",height:"Height ({unit})",colour:"Colour",colourDefault:"Default",colourCustom:"Custom",links:"{count} links",noLinks:"No links to other placed devices",hide:"Hide details",show:"Show details",furniture:"Furniture"},calibrateHint:"Click to set the scale",lights:{title:"Lights",count:"{on} of {total} lights on",none:"No lights in this room's area",on:"All on",off:"All off"},links:{add:"Add…",remove:"Remove",areas:"Also show areas",rooms:"Also show rooms",lights:"Also show lights",exclude:"Ignore lights"},daylight:{title:"Daylight",show:"Show daylight",strength:"Strength ({pct}%)",reach:"Reach ({pct}%)",head:"Window top height ({unit})",shade:"Outdoor shade ({pct}%)",reset:"Reset daylight to defaults"},areaDevices:{title:"Devices in {area}",none:"No devices in this area yet.",elsewhere:"Already placed: {where}",addAll:"Add all {count} to this room"},label:{title:"Name label",show:"Show name",size:"Size ({pct}%)",rotation:"Rotation (°)",colour:"Colour",dragHint:"Drag the name on the plan to move it."},search:{none:"No matches",more:"+{count} more — type to narrow"}},mapBackground:{noWebgl:"This browser can't draw the map (WebGL2 is needed).",failed:"Couldn't load the map: {error}",add:"Add map background",remove:"Remove map background",opacity:"Map opacity",adjust:"Move map (drag; Ctrl+scroll or pinch to zoom)",adjustHint:"Drag the map to line it up with your buildings.",zoomIn:"Zoom map in",zoomOut:"Zoom map out",rotation:"Rotation",resetRotation:"North up",done:"Done",style:"Map type",street:"Street map",aerial:"Aerial photo (Esri)",zoom:"Zoom",angle:"Angle"},settings:{title:"Settings",close:"Close",done:"Done",editing:"Editing",autoSave:"Auto-save changes",autoSaveHint:"Saves a few seconds after each change",units:"Units",metric:"Metric",imperial:"Imperial",floorOrder:"Floor tab order",topFirst:"Top first",groundFirst:"Ground first",zigbeeMesh:"Zigbee mesh",coordinator:"Coordinator",coordinatorAria:"Zigbee coordinator device",bridge:"Zigbee2MQTT Bridge",notPlaced:"(device not placed)",coordinatorHint:"The device placed for your radio, if it isn't the Bridge",scanTimeout:"Scan timeout",scanTimeoutAria:"Zigbee scan timeout in seconds",scanTimeoutHint:"Raise it if Load Mesh times out on a large mesh",troubleshooting:"Troubleshooting",debugLogging:"Debug logging",debugLoggingHint:"Writes spatial_context_debug.log in your config folder — ids and counts only",about:"About",version:"Version",github:"GitHub repository",daylight:"Daylight",weather:"Weather for cloud cover",weatherAuto:"Automatic",weatherNone:"Ignore the weather",weatherHint:"Clouds dim the sunlight through windows: no beam when it's overcast, just soft sky light.",plan:"Plan",lightCount:"Lights-on count",lightCountHint:'Show "2 of 3 lights on" under each room\'s name. Hovering a room shows it either way.',roomBorders:"Room borders",roomBordersHint:"The outline around every room. A selected room always shows one.",roomBorderColor:"Border colour",roomBorderColorRoom:"Room colour",roomBorderWidth:"Border thickness ({px})",roomBorderOpacity:"Border opacity ({pct}%)",labelSize:"Room name size ({size})",labelColor:"Room name colour",labelColorTheme:"Theme text colour",labelBold:"Bold room names",labelHalo:"Room name halo",labelHaloHint:"The outline behind each room name that keeps it readable over lines and colour.",labelHaloWidth:"Halo thickness ({px})",labelHaloColor:"Halo colour",labelHaloColorAuto:"Background colour",fillUnder:"Room colour under the background",fillUnderHint:"Draw room colours beneath the background image, so counters, appliances and other items already in the drawing stay on top.",scaleLine:"Scale reference line",scaleLineHint:"The dashed line from Set Scale and its length. It always shows while you set the scale, and never on dashboards."},picker:{search:"Search devices…",clearSearch:"Clear search",more:"More",allFloors:"All Floors",outdoor:"Outdoor / no floor",allAreas:"All Areas",clearAll:"Clear all placed devices",noMatches:"No matching devices.",alreadyPlaced:"Already placed on {floor} — remove it there first",placedOn:"Placed on {floor}",placed:"✓ placed",title:"Place device"},iconPicker:{title:"Choose an icon",search:"Search icons — e.g. lamp, motion, gate",loadError:"Couldn't load the icon list ({error}).",loading:"Loading icons…",noMatch:"No icons match.",typeToSearch:"Type to search all icons.",useDefault:"Use default icon",cancel:"Cancel"},legend:{weak:"Weak",strong:"Strong"},rowActions:{undo:"Undo (Ctrl/Cmd+Z)",redo:"Redo (Ctrl/Cmd+Shift+Z)"},panel:{loading:"Loading Spatial Context…",noFloors:"No floors found. Add floors under Settings → Areas → Floors, then reopen this panel.",dismiss:"Dismiss",versionRestart:"Spatial Context was updated — restart Home Assistant to finish. Until then, some changes may not save.",versionReload:"This page is running an older Spatial Context panel than the one installed. Reload the page (in Safari: Option+Cmd+R).",scaleDisagree:"Placed buildings give different scales. Check their sizes against the photo.",scaleFromBuilding:"Scale (from {building}): 1 {unit} ≈ {value} units"},menu:{background:"Background",connectivity:"Connectivity Map",settings:"Settings",more:"More options",uploadBackground:"Upload background",replaceBackground:"Replace background (keeps rooms)",removeBackground:"Remove background",opacity:"Opacity",exportJson:"Export JSON",debugReport:"Download debug report",debugReportHint:"Versions, settings, layout counts and the recent debug log — safe to attach to a GitHub issue",resetFloor:"Reset floor",resetProperty:"Reset property",importSvg:"Import rooms & walls from SVG"},network:{zigbee:"Zigbee Mesh",wifi:"Wi-Fi Network",matter:"Matter Network",bluetooth:"Bluetooth",zigbeeShort:"Zigbee mesh",wifiShort:"Wi-Fi",matterShort:"Matter",refresh:"Refresh Mesh",load:"Load Mesh",loadingZigbee:"Loading… {seconds}s (usually 1-2 min)",showAll:"Show all links",live:"● Live",loading:"Loading…",refreshedSeconds:"refreshed {n}s ago",refreshedMinutes:"refreshed {n}m ago"},errors:{restartHa:"Restart Home Assistant to finish updating Spatial Context.",needsAdmin:"This map needs a Home Assistant admin account.",bluetoothVersion:"The Bluetooth map needs Home Assistant 2025.2 or newer.",zigbeeFailed:"Zigbee mesh request failed",wifiFailed:"Wi-Fi mesh request failed",matterFailed:"Matter topology subscription failed",bluetoothFailed:"Bluetooth subscription failed",floorSave:"Couldn't save this floor — staying here so nothing is lost.",propertySave:"Couldn't save the property view — reopen the Property tab to try again.",bgType:"Background image must be a PNG, JPEG, GIF or SVG file.",bgUpload:"Background image upload failed: {error}",svgImport:"Couldn't use that SVG: {error}"},confirm:{discardFloor:"Discard unsaved changes to this floor?",discardProperty:"Discard unsaved changes to the property view?",removeOutdoorOne:"Remove all {count} outdoor device from the property?",removeOutdoorMany:"Remove all {count} outdoor devices from the property?",removeFloorOne:"Remove all {count} placed device from this floor?",removeFloorMany:"Remove all {count} placed devices from this floor?",deletePlacement:'Delete the "{label}" placement?',resetProperty:"Reset the property view? This clears every building placement, every outdoor device and the background photo. Nothing is permanent until you hit Save afterward.",resetFloor:'Reset "{floor}"? This clears every room, wall, opening, placed device, and the background image on this floor. Nothing is permanent until you hit Save afterward.',applyAlignment:"Apply this alignment to \"{floor}\"? This rewrites every room, wall, door/window, and placed device position on that floor — plus its background image's placement and, if this floor has one set, its scale calibration too — to match this floor's coordinate system. This saves immediately and cannot be undone.",deleteWall:"Delete this wall? Any doors/windows on it will be removed too.",deleteRoom:'Delete room "{name}"?',deletePin:"Delete pin for {name}?",deleteDoor:"Delete this door?",deleteWindow:"Delete this window?",removeFromSpot:"Remove {name} from this spot?"},prompt:{label:"Label (blank to clear override):",distance:"Real-world distance between these two points, in {unit}:"},units:{feet:"feet",metres:"metres"},floor:{thisFloor:"this floor",thatFloor:"that floor"},property:{rename:"Rename",setIcon:"Set icon",removeFromProperty:"Remove from the property",goToFloorOf:"Go to {name}'s floor",select:"Select",placeOutdoor:"Place an outdoor device",placeBuildingTip:"Place a building's footprint",placeBuilding:"Place building…",notCalibrated:"Not calibrated",goToFloor:"Go to floor",deletePlacement:"Delete placement",outdoorDevice:"Outdoor device",building:"Building",link:"Link",calibrateHint:"Set Scale on a floor, then place its building here"},canvasControls:{zoomIn:"Zoom in",zoomOut:"Zoom out",fit:"Fit to screen",furniture:"Show furniture",lights:"Show live lights",covers:"Show daylight & cover shading"},materials:{timber_frame:"Timber framed (drywall)",brick_veneer:"Brick veneer",concrete_block:"Concrete / block",aerated_concrete_block:"Aerated/foam concrete block (plastered)",ceramic_poroton_block:"Ceramic / Poroton block",glass:"Glass",steel_frame:"Steel frame",half_wall:"Half wall"},colors:{primary:"Primary",accent:"Accent",red:"Red",pink:"Pink",purple:"Purple",deep_purple:"Deep purple",indigo:"Indigo",blue:"Blue",light_blue:"Light blue",cyan:"Cyan",teal:"Teal",green:"Green",light_green:"Light green",lime:"Lime",yellow:"Yellow",amber:"Amber",orange:"Orange",deep_orange:"Deep orange",brown:"Brown",light_grey:"Light grey",grey:"Grey",dark_grey:"Dark grey",blue_grey:"Blue grey",black:"Black",white:"White"},svgImport:{confirm:"This SVG has {rooms} rooms, {walls} walls and {openings} doors/windows. Add them to this floor as well, so there's nothing to trace?",unitPrompt:"How long is one unit of the SVG's drawing, in {unit}? (1 if it was drawn in {unit}.) Leave blank to calibrate the floor yourself later.",skipped:"{count} doors/windows weren't along any wall in the SVG, so they were left out.",nothingFound:"No rooms, walls, doors or windows were found in that SVG. Name its groups rooms, walls, doors and windows (see the README).",alsoBackground:"Also replace this floor's background with the SVG? (Cancel keeps the current background and only adds the geometry.)"},furniture:{libraryTitle:"Furniture & items",close:"Close",search:"Search items",count:"{count} items",none:"No matching items",showLabel:"Show name",width:"Width ({unit})",depth:"Depth",calibrate:"Set this floor's scale (Set Scale) for true-to-life sizes.",rotation:"Rotation (°)",rotateLeft:"Rotate 90° left",rotateRight:"Rotate 90° right",lineThickness:"Line thickness ({px} px)",fill:"Fill",mirror:"Mirror",lock:"Lock in place",duplicate:"Duplicate (Ctrl+D)",toFront:"Bring to front",toBack:"Send to back",delete:"Delete item",category:{all:"All",living:"Living room",bedroom:"Bedroom",kitchen:"Kitchen",dining:"Dining",bathroom:"Bathroom",office:"Office",laundry:"Laundry & utility",electronics:"Electronics & smart home",lighting:"Lighting",kids:"Kids & nursery",entry:"Entry & storage",outdoor:"Outdoor & garden",garage:"Garage & workshop",fitness:"Fitness & hobbies",pets:"Pets",decor:"Decor & plants",icons:"Icons",custom:"My icons",shapes:"Shapes"},entityTitle:"Linked entity",entity:"Entity",noEntity:"None",toggle:"Toggle",opacity:"Opacity ({pct}%)",importSvg:"Import SVG icons",importHint:"Add your own drawings: pick one or more .svg files. They're saved with your settings and work on every floor and on dashboards.",importFailed:"Couldn't import {names}: not an SVG file, or larger than 300 KB.",deleteIcon:"Remove this icon from the library",deleteIconConfirm:"Remove “{name}” from the library? Items already placed show as an empty outline.",iconColors:"Use the file's own colours (otherwise drawn in the item's line colour)",noCustom:"No imported icons yet.",searchEntity:"Search entities…",solid:"Solid (hides what's beneath)",forward:"Bring forward",backward:"Send backward",corners:"Corners",allCorners:"All corners ({pct}%)",allCornersMixed:"All corners (mixed)",cornerN:"Corner {n} ({pct}%)",resetCorners:"Reset to soft corners",corner:{topLeft:"Top left ({pct}%)",topRight:"Top right ({pct}%)",bottomRight:"Bottom right ({pct}%)",bottomLeft:"Bottom left ({pct}%)"}},compass:{title:"North is {dir} of the plan's top",faces:"Top of plan faces",notSet:"Not set",degrees:"Degrees clockwise from north",noLocation:"Set your home location in Home Assistant (Settings → System → General) for daylight that follows the sun.",preview:"Daylight at {time}",now:"Now",sun:"Sun {deg}° up in the {dir}",night:"Sun down",weather:{sunny:"sunny","clear-night":"clear",partlycloudy:"partly cloudy",cloudy:"cloudy",fog:"fog",rainy:"rain",pouring:"heavy rain",snowy:"snow","snowy-rainy":"sleet",hail:"hail",lightning:"thunder","lightning-rainy":"storms",windy:"windy","windy-variant":"windy, cloudy",exceptional:"unusual weather"}},view3d:{open:"3D view",close:"Back to the 2D plan",loading:"Loading 3D view…",noWebgl:"This browser can't show 3D (WebGL is unavailable).",orbitView:"Three-quarter view",topView:"Top view",dollhouse:"Dollhouse",dollhouseHint:"Stack every floor of this building",roof:"Roof",roofHint:"Put a roof on the building (hidden while the floors are spread apart)",spread:"Spread the floors apart",sunTime:"Time of day for the sun",now:"Now",exportHint:"Download the scene as a glTF (.glb) file",exporting:"Exporting…",scans:"Room scans",scansHint:"Room scans and 3D settings",wallHeight:"Wall height",floorElevation:"Floor height",floorElevationAuto:"Auto",floorElevationHint:"Height of this floor above the building's ground level, for stacking split levels in Dollhouse. Leave empty to stack it a full storey above the floor below.",scansIntro:"Import a room scan exported from a phone scanning app as glTF (.glb or .gltf). It's stored with this integration and laid over the plan.",importScan:"Import scan…",uploading:"Uploading…",scanLoading:"Loading…",hide:"Hide",show:"Show",delete:"Delete",deleteConfirm:'Delete the scan "{name}"? This can\'t be undone.',alignHint:"Line the scan up with the plan: drag it on the floor, nudge and turn it, or let Auto-align square it to the walls.",drag:"Drag to move",autoAlign:"Auto-align",autoAlignHint:"Turn the scan to the plan's walls, snap its edges to the nearest wall faces and set its floor level",snap:"Snap to walls (hold Shift to place freely)",move:"Nudge",rotation:"Rotation",scale:"Scale",elevation:"Height offset",opacity:"Opacity",replaceWalls:"Replace the plan's walls",saveFailed:"Couldn't save: {error}",ground:"Ground",roofParts:"Roof parts",roofPartsHint:'Draw the roof from parts instead of working it out from the rooms, one per line: a rectangle of the plan (x0, y0, x1, y1 in plan units), its ridge along "x" or "y", eave height in metres (as Floor height, or [low side, high side]), pitch (rise per metre: 0.5 is 6/12) and ends (["gable" | "hip" | "open", the same]). Optional: overhang, base, gable "shake". Shared by every floor of the building.',roofAuto:"Automatic",roofAutoNow:"Automatic",roofApply:"Apply",roofRevert:"Revert",roofInvalid:"Those roof parts aren't valid: each needs x0, y0, x1, y1, ridge, eave and pitch.",groundHint:"For a house on a slope: the ground's height on its high side and its low side (the same scale as Floor height), and which way it falls. A walk-out basement sits below the high side. Shared by every floor of the building.",groundFlat:"Make flat",groundFlatNow:"Flat",groundUphill:"High side",groundDownhill:"Low side",groundToward:"Slopes down toward",scanMode:"Scan",scanModeHint:"Show the room scans' walls and objects in place of the plan's walls and furniture (the scans' stairs always show)"}},de:{floorTabs:{property:"Anwesen"},appHeader:{saving:"Speichert…",save:"Speichern",menu:"Menü"},canvas:{mode:{select:"Auswählen",pan:"Verschieben",trace:"Raum zeichnen",wall:"Wand zeichnen",door:"Tür hinzufügen",window:"Fenster hinzufügen",scale:"Maßstab festlegen",place:"Gerät platzieren",align:"Etagen ausrichten",furniture:"Möbel & Haushaltsgegenstände"},snap:{tooltip:"Woran neue Punkte einrasten (Umschalttaste halten, um einen Punkt frei zu setzen)",all:"Einrasten: alles",walls:"Einrasten: nur Wände",rooms:"Einrasten: nur Räume",off:"Einrasten: aus"},hint:{closeRoom:"Nahe dem Start klicken, um den Raum zu schließen.",addPoints:"Klicken, um Punkte hinzuzufügen.",addWallPoints:"Klicken, um Punkte hinzuzufügen.",addWallPointsFinish:"Klicken, um Punkte hinzuzufügen, dann „Fertig“.",scaleFirst:"Den ersten Punkt einer bekannten Strecke anklicken.",scaleSecond:"Den zweiten Punkt anklicken.",placeOpening:"Auf eine Wand klicken, um {type} zu platzieren.",alignAgainst:"Ausrichten an:",noBackground:"Diese Etage hat kein Hintergrundbild zum Ausrichten.",alignDrag:"Zum Verschieben ziehen, mit +/− die Größe ändern, dann „Anwenden“.",placeFurniture:"Klicken zum Platzieren · R dreht · Umschalt+Klick platziert noch eins",freeform:"Klicken, um Ecken hinzuzufügen. Die erste Ecke anklicken, um die Form zu schließen, oder „Fertig“ (Enter), um sie offen zu lassen.",drawShape:"Auf dem Plan ziehen, um die Form zu zeichnen (Umschalt für Quadrat oder Kreis), oder klicken, um sie in Standardgröße abzulegen."},openingType:{door:"eine Tür",window:"ein Fenster",opening:"eine Öffnung"},openingLabel:{door:"Tür",window:"Fenster"},button:{cancel:"Abbrechen",finishWall:"Wand fertigstellen",chooseAnother:"Andere wählen",apply:"Anwenden",close:"Schließen",done:"Fertig",finishShape:"Form fertigstellen"},align:{choose:"— Etage wählen —",shrink:"Überlagerung leicht verkleinern",grow:"Überlagerung leicht vergrößern"},room:{custom:"— Benutzerdefiniert —",outdoor:"Außenbereich / keine Etage",hide:"Raum ausblenden",show:"Raum einblenden",color:"Raumfarbe",fillOpacity:"Füllungsdeckkraft ({pct} %)",borderOpacity:"Randdeckkraft ({pct} %)",rename:"Umbenennen",doneEditing:"Bearbeitung beenden",editVertices:"Eckpunkte bearbeiten",resetLabel:"Beschriftungsposition zurücksetzen",delete:"Raum löschen",outdoorHint:"Terrasse, Veranda oder Balkon: Tageslicht durch eine Tür oder ein Fenster dorthin fällt nur nach innen.",outdoorSpace:"Außenbereich (Terrasse…)",thisFloor:"Diese Etage",unknownArea:"Unbekannter Bereich ({id})",floorOffset:"Bodenhöhe in 3D ({unit})",floorOffsetHint:"Wie weit der Boden dieses Raums in der 3D-Ansicht über (+) oder unter (−) dem Rest der Etage liegt, z. B. Garage oder Eingangspodest eines Split-Levels. Wände und Türen wandern mit."},pin:{setLabel:"Beschriftung festlegen",setIcon:"Symbol festlegen",setHeight:"Höhe festlegen",delete:"Pin löschen",removeFromSpot:"Von dieser Stelle entfernen",stackTitle:"{count} Geräte an dieser Stelle",icon:"Symbol",moreIcons:"Weitere Symbole…",defaultIcon:"Zurück zum Standardsymbol"},wall:{material:"Wandmaterial",thickness:"Wandstärke ({unit})",delete:"Wand löschen"},opening:{width:"Breite ({unit})",storedUnits:"gespeicherte Einheiten",calibrate:"Maßstab kalibrieren für reale Einheiten",delete:"Löschen",cover:"Beschattung",noCover:"Keine",coverState:"Gerade",coverOpen:"{pct}% offen",coverUnavailable:"Nicht verfügbar",coverLeft:"Linke Beschattung",coverRight:"Rechte Beschattung",twoCovers:"Zwei Beschattungen (links & rechts)",swapCovers:"Links und rechts tauschen",left:"Links",right:"Rechts",garage:"Garagentor",garageHint:"Als Sektionaltor gezeichnet, das mit der Position der Beschattung in die Garage hochfährt. Der Sonnenfleck steht unter Tageslicht.",windowStyle:"Fenstertyp",windowStyles:{standard:"Standard",transom:"Oberlicht (hoher Streifen)",full:"Bodentief"}},meshStub:{goToFloor:"Zur Etage"},notCalibrated:"Nicht kalibriert",card:{area:"Bereich",colour:"Farbe",colourCustom:"Benutzerdefiniert",colourDefault:"Standard",device:"Gerät",height:"Höhe ({unit})",label:"Bezeichnung",link:"Verbindung",links:"{count} Verbindungen",name:"Name",noLinks:"Keine Verbindungen zu anderen platzierten Geräten",quality:"Signal",room:"Raum",style:"Darstellung",visible:"Sichtbar",wall:"Wand",wallOpening:"In einer Wand",hide:"Details ausblenden",show:"Details anzeigen",furniture:"Möbel"},calibrateHint:"Klicken, um den Maßstab festzulegen",lights:{title:"Licht",count:"{on} von {total} Lichtern an",none:"Keine Lichter im Bereich dieses Raums",on:"Alle an",off:"Alle aus"},links:{add:"Hinzufügen…",remove:"Entfernen",areas:"Auch Bereiche zeigen",rooms:"Auch Räume zeigen",lights:"Auch Lichter zeigen",exclude:"Lichter ignorieren"},daylight:{title:"Tageslicht",show:"Tageslicht zeigen",strength:"Stärke ({pct} %)",reach:"Reichweite ({pct} %)",head:"Höhe Fensteroberkante ({unit})",shade:"Verschattung draußen ({pct} %)",reset:"Tageslicht zurücksetzen"},areaDevices:{title:"Geräte in {area}",none:"Noch keine Geräte in diesem Bereich.",elsewhere:"Bereits platziert: {where}",addAll:"Alle {count} in diesen Raum"},label:{title:"Namensbeschriftung",show:"Namen zeigen",size:"Größe ({pct} %)",rotation:"Drehung (°)",colour:"Farbe",dragHint:"Den Namen auf dem Plan ziehen, um ihn zu verschieben."},search:{none:"Keine Treffer",more:"+{count} weitere — tippen zum Eingrenzen"}},mapBackground:{noWebgl:"Dieser Browser kann die Karte nicht darstellen (WebGL2 erforderlich).",failed:"Karte konnte nicht geladen werden: {error}",add:"Kartenhintergrund hinzufügen",remove:"Kartenhintergrund entfernen",opacity:"Kartendeckkraft",adjust:"Karte verschieben (ziehen; Strg+Scrollen oder Pinch zum Zoomen)",adjustHint:"Karte ziehen, um sie an den Gebäuden auszurichten.",zoomIn:"Karte vergrößern",zoomOut:"Karte verkleinern",rotation:"Drehung",resetRotation:"Norden oben",done:"Fertig",style:"Kartentyp",street:"Straßenkarte",aerial:"Luftbild (Esri)",zoom:"Zoom",angle:"Winkel"},settings:{title:"Einstellungen",close:"Schließen",done:"Fertig",editing:"Bearbeiten",autoSave:"Änderungen automatisch speichern",autoSaveHint:"Speichert einige Sekunden nach jeder Änderung",units:"Einheiten",metric:"Metrisch",imperial:"Imperial",floorOrder:"Reihenfolge der Etagen-Tabs",topFirst:"Oberste zuerst",groundFirst:"Erdgeschoss zuerst",zigbeeMesh:"Zigbee-Mesh",coordinator:"Koordinator",coordinatorAria:"Zigbee-Koordinator-Gerät",bridge:"Zigbee2MQTT-Bridge",notPlaced:"(Gerät nicht platziert)",coordinatorHint:"Das für Ihren Funk-Stick platzierte Gerät, falls es nicht die Bridge ist",scanTimeout:"Zeitlimit für den Scan",scanTimeoutAria:"Zeitlimit für den Zigbee-Scan in Sekunden",scanTimeoutHint:"Erhöhen, wenn „Mesh laden“ bei einem großen Mesh abbricht",troubleshooting:"Fehlerbehebung",debugLogging:"Debug-Protokollierung",debugLoggingHint:"Schreibt spatial_context_debug.log in Ihren Konfigurationsordner – nur IDs und Anzahlen",about:"Info",version:"Version",github:"GitHub-Repository",daylight:"Tageslicht",weather:"Wetter für Bewölkung",weatherAuto:"Automatisch",weatherNone:"Wetter ignorieren",weatherHint:"Wolken dämpfen das Sonnenlicht durch die Fenster: bei bedecktem Himmel kein Strahl, nur weiches Himmelslicht.",plan:"Plan",lightCount:"Anzahl eingeschalteter Lichter",lightCountHint:"„2 von 3 Lichtern an“ unter jedem Raumnamen zeigen. Beim Überfahren eines Raums erscheint es immer.",roomBorders:"Raumränder",roomBordersHint:"Der Umriss jedes Raums. Ein ausgewählter Raum zeigt ihn immer.",roomBorderColor:"Randfarbe",roomBorderColorRoom:"Raumfarbe",roomBorderWidth:"Randstärke ({px})",roomBorderOpacity:"Rand-Deckkraft ({pct} %)",labelSize:"Größe der Raumnamen ({size})",labelColor:"Farbe der Raumnamen",labelColorTheme:"Textfarbe des Designs",labelBold:"Raumnamen fett",labelHalo:"Umrandung der Raumnamen",labelHaloHint:"Die Kontur hinter jedem Raumnamen, die ihn über Linien und Farbe lesbar hält.",labelHaloWidth:"Umrandungsstärke ({px})",labelHaloColor:"Umrandungsfarbe",labelHaloColorAuto:"Hintergrundfarbe",fillUnder:"Raumfarbe unter dem Hintergrund",fillUnderHint:"Raumfarben unter dem Hintergrundbild zeichnen, damit Arbeitsplatten, Geräte und andere Objekte der Zeichnung obenauf bleiben.",scaleLine:"Maßstabslinie",scaleLineHint:"Die gestrichelte Linie aus „Maßstab festlegen“ und ihre Länge. Sie erscheint immer beim Festlegen des Maßstabs und nie auf Dashboards."},picker:{search:"Geräte suchen…",clearSearch:"Suche löschen",more:"Mehr",allFloors:"Alle Etagen",outdoor:"Außen / keine Etage",allAreas:"Alle Bereiche",clearAll:"Alle platzierten Geräte entfernen",noMatches:"Keine passenden Geräte.",alreadyPlaced:"Bereits auf {floor} platziert – dort zuerst entfernen",placedOn:"Platziert auf {floor}",placed:"✓ platziert",title:"Gerät platzieren"},iconPicker:{title:"Symbol auswählen",search:"Symbole suchen – z. B. Lampe, Bewegung, Tor",loadError:"Die Symbolliste konnte nicht geladen werden ({error}).",loading:"Symbole werden geladen…",noMatch:"Keine passenden Symbole.",typeToSearch:"Tippen, um alle Symbole zu durchsuchen.",useDefault:"Standardsymbol verwenden",cancel:"Abbrechen"},legend:{weak:"Schwach",strong:"Stark"},rowActions:{undo:"Rückgängig (Strg/Cmd+Z)",redo:"Wiederholen (Strg/Cmd+Umschalt+Z)"},panel:{loading:"Spatial Context wird geladen…",noFloors:"Keine Etagen gefunden. Fügen Sie Etagen unter Einstellungen → Bereiche → Etagen hinzu und öffnen Sie dieses Panel erneut.",dismiss:"Schließen",versionRestart:"Spatial Context wurde aktualisiert – starten Sie Home Assistant neu, um den Vorgang abzuschließen. Bis dahin werden manche Änderungen möglicherweise nicht gespeichert.",versionReload:"Diese Seite verwendet ein älteres Spatial-Context-Panel als das installierte. Laden Sie die Seite neu (in Safari: Option+Cmd+R).",scaleDisagree:"Die platzierten Gebäude ergeben unterschiedliche Maßstäbe. Prüfen Sie ihre Größen anhand des Fotos.",scaleFromBuilding:"Maßstab (von {building}): 1 {unit} ≈ {value} Einheiten"},menu:{background:"Hintergrund",connectivity:"Verbindungskarte",settings:"Einstellungen",more:"Weitere Optionen",uploadBackground:"Hintergrund hochladen",replaceBackground:"Hintergrund ersetzen (Räume bleiben)",removeBackground:"Hintergrund entfernen",opacity:"Deckkraft",exportJson:"JSON exportieren",debugReport:"Debug-Bericht herunterladen",debugReportHint:"Versionen, Einstellungen, Layout-Anzahlen und das aktuelle Debug-Protokoll – sicher an ein GitHub-Issue anzuhängen",resetFloor:"Etage zurücksetzen",resetProperty:"Anwesen zurücksetzen",importSvg:"Räume & Wände aus SVG importieren"},network:{zigbee:"Zigbee-Mesh",wifi:"WLAN-Netzwerk",matter:"Matter-Netzwerk",bluetooth:"Bluetooth",zigbeeShort:"Zigbee-Mesh",wifiShort:"WLAN",matterShort:"Matter",refresh:"Mesh aktualisieren",load:"Mesh laden",loadingZigbee:"Wird geladen… {seconds} s (dauert meist 1–2 Min.)",showAll:"Alle Verbindungen anzeigen",live:"● Live",loading:"Wird geladen…",refreshedSeconds:"vor {n} s aktualisiert",refreshedMinutes:"vor {n} Min. aktualisiert"},errors:{restartHa:"Starten Sie Home Assistant neu, um die Aktualisierung von Spatial Context abzuschließen.",needsAdmin:"Diese Karte benötigt ein Home-Assistant-Administratorkonto.",bluetoothVersion:"Die Bluetooth-Karte benötigt Home Assistant 2025.2 oder neuer.",zigbeeFailed:"Zigbee-Mesh-Anfrage fehlgeschlagen",wifiFailed:"WLAN-Mesh-Anfrage fehlgeschlagen",matterFailed:"Matter-Topologie-Abonnement fehlgeschlagen",bluetoothFailed:"Bluetooth-Abonnement fehlgeschlagen",floorSave:"Diese Etage konnte nicht gespeichert werden – Sie bleiben hier, damit nichts verloren geht.",propertySave:"Die Anwesen-Ansicht konnte nicht gespeichert werden – öffnen Sie den Tab „Anwesen“ erneut.",bgType:"Das Hintergrundbild muss eine PNG-, JPEG-, GIF- oder SVG-Datei sein.",bgUpload:"Hochladen des Hintergrundbilds fehlgeschlagen: {error}",svgImport:"Diese SVG-Datei konnte nicht verwendet werden: {error}"},confirm:{discardFloor:"Nicht gespeicherte Änderungen an dieser Etage verwerfen?",discardProperty:"Nicht gespeicherte Änderungen an der Anwesen-Ansicht verwerfen?",removeOutdoorOne:"Das {count} Außengerät vom Anwesen entfernen?",removeOutdoorMany:"Alle {count} Außengeräte vom Anwesen entfernen?",removeFloorOne:"Das {count} platzierte Gerät von dieser Etage entfernen?",removeFloorMany:"Alle {count} platzierten Geräte von dieser Etage entfernen?",deletePlacement:"Die Platzierung „{label}“ löschen?",resetProperty:"Anwesen-Ansicht zurücksetzen? Dadurch werden alle Gebäudeplatzierungen, alle Außengeräte und das Hintergrundfoto entfernt. Nichts ist endgültig, bis Sie anschließend auf Speichern klicken.",resetFloor:"„{floor}“ zurücksetzen? Dadurch werden alle Räume, Wände, Öffnungen, platzierten Geräte und das Hintergrundbild dieser Etage entfernt. Nichts ist endgültig, bis Sie anschließend auf Speichern klicken.",applyAlignment:"Diese Ausrichtung auf „{floor}“ anwenden? Dadurch werden alle Räume, Wände, Türen/Fenster und Gerätepositionen dieser Etage – sowie die Platzierung ihres Hintergrundbilds und, falls gesetzt, ihre Maßstabskalibrierung – an das Koordinatensystem dieser Etage angepasst. Dies wird sofort gespeichert und kann nicht rückgängig gemacht werden.",deleteWall:"Diese Wand löschen? Türen/Fenster darin werden ebenfalls entfernt.",deleteRoom:"Raum „{name}“ löschen?",deletePin:"Markierung für {name} löschen?",deleteDoor:"Diese Tür löschen?",deleteWindow:"Dieses Fenster löschen?",removeFromSpot:"{name} von dieser Stelle entfernen?"},prompt:{label:"Bezeichnung (leer lassen, um zurückzusetzen):",distance:"Tatsächlicher Abstand zwischen diesen beiden Punkten in {unit}:"},units:{feet:"Fuß",metres:"Metern"},floor:{thisFloor:"diese Etage",thatFloor:"jene Etage"},property:{rename:"Umbenennen",setIcon:"Symbol festlegen",removeFromProperty:"Vom Anwesen entfernen",goToFloorOf:"Zur Etage von {name}",select:"Auswählen",placeOutdoor:"Außengerät platzieren",placeBuildingTip:"Grundriss eines Gebäudes platzieren",placeBuilding:"Gebäude platzieren…",notCalibrated:"Nicht kalibriert",goToFloor:"Zur Etage",deletePlacement:"Platzierung löschen",outdoorDevice:"Außengerät",building:"Gebäude",link:"Verbindung",calibrateHint:"Legen Sie auf einer Etage den Maßstab fest und platzieren Sie dann das Gebäude hier"},canvasControls:{zoomIn:"Vergrößern",zoomOut:"Verkleinern",fit:"An Bildschirm anpassen",furniture:"Möbel zeigen",lights:"Live-Licht zeigen",covers:"Tageslicht & Beschattung zeigen"},materials:{timber_frame:"Holzständerwand (Trockenbau)",brick_veneer:"Ziegelverblendung",concrete_block:"Beton / Stein",aerated_concrete_block:"Porenbeton / Schaumbeton (verputzt)",ceramic_poroton_block:"Keramik- / Poroton-Stein",glass:"Glas",steel_frame:"Stahlrahmen",half_wall:"Halbhohe Wand"},colors:{primary:"Primär",accent:"Akzent",red:"Rot",pink:"Pink",purple:"Lila",deep_purple:"Dunkellila",indigo:"Indigo",blue:"Blau",light_blue:"Hellblau",cyan:"Cyan",teal:"Petrol",green:"Grün",light_green:"Hellgrün",lime:"Limette",yellow:"Gelb",amber:"Bernstein",orange:"Orange",deep_orange:"Dunkelorange",brown:"Braun",light_grey:"Hellgrau",grey:"Grau",dark_grey:"Dunkelgrau",blue_grey:"Blaugrau",black:"Schwarz",white:"Weiß"},svgImport:{confirm:"Diese SVG-Datei enthält {rooms} Räume, {walls} Wände und {openings} Türen/Fenster. Auch diese zu diesem Stockwerk hinzufügen, damit nichts nachgezeichnet werden muss?",unitPrompt:"Wie lang ist eine Einheit der SVG-Zeichnung, in {unit}? (1, wenn sie in {unit} gezeichnet wurde.) Leer lassen, um das Stockwerk später selbst zu kalibrieren.",skipped:"{count} Türen/Fenster lagen in der SVG-Datei an keiner Wand und wurden ausgelassen.",nothingFound:"In dieser SVG-Datei wurden keine Räume, Wände, Türen oder Fenster gefunden. Benenne ihre Gruppen rooms, walls, doors und windows (siehe README).",alsoBackground:"Auch den Hintergrund dieses Stockwerks durch die SVG ersetzen? (Abbrechen behält den aktuellen Hintergrund und fügt nur die Geometrie hinzu.)"},furniture:{libraryTitle:"Möbel & Gegenstände",close:"Schließen",search:"Gegenstände suchen",count:"{count} Gegenstände",none:"Keine passenden Gegenstände",showLabel:"Namen zeigen",width:"Breite ({unit})",depth:"Tiefe",calibrate:"Maßstab dieses Stockwerks setzen (Maßstab festlegen) für echte Größen.",rotation:"Drehung (°)",rotateLeft:"90° nach links drehen",rotateRight:"90° nach rechts drehen",lineThickness:"Linienstärke ({px} px)",fill:"Füllung",mirror:"Spiegeln",lock:"Fixieren",duplicate:"Duplizieren (Strg+D)",toFront:"In den Vordergrund",toBack:"In den Hintergrund",delete:"Gegenstand löschen",category:{all:"Alle",living:"Wohnzimmer",bedroom:"Schlafzimmer",kitchen:"Küche",dining:"Essbereich",bathroom:"Bad",office:"Büro",laundry:"Wäsche & Technik",electronics:"Elektronik & Smart Home",lighting:"Beleuchtung",kids:"Kinder & Baby",entry:"Flur & Stauraum",outdoor:"Garten & draußen",garage:"Garage & Werkstatt",fitness:"Fitness & Hobby",pets:"Haustiere",decor:"Deko & Pflanzen",icons:"Symbole",custom:"Eigene Symbole",shapes:"Formen"},entityTitle:"Verknüpfte Entität",entity:"Entität",noEntity:"Keine",toggle:"Umschalten",opacity:"Deckkraft ({pct} %)",importSvg:"SVG-Symbole importieren",importHint:"Eigene Zeichnungen hinzufügen: eine oder mehrere .svg-Dateien wählen. Sie werden mit den Einstellungen gespeichert und gelten auf allen Etagen und Dashboards.",importFailed:"{names} konnte nicht importiert werden: keine SVG-Datei oder größer als 300 KB.",deleteIcon:"Dieses Symbol aus der Bibliothek entfernen",deleteIconConfirm:"„{name}“ aus der Bibliothek entfernen? Bereits platzierte Objekte erscheinen als leerer Umriss.",iconColors:"Eigene Farben der Datei verwenden (sonst in der Linienfarbe des Objekts)",noCustom:"Noch keine importierten Symbole.",searchEntity:"Entitäten suchen…",solid:"Deckend (verdeckt Darunterliegendes)",forward:"Eine Ebene nach vorne",backward:"Eine Ebene nach hinten",corners:"Ecken",allCorners:"Alle Ecken ({pct} %)",allCornersMixed:"Alle Ecken (gemischt)",cornerN:"Ecke {n} ({pct} %)",resetCorners:"Auf weiche Ecken zurücksetzen",corner:{topLeft:"Oben links ({pct} %)",topRight:"Oben rechts ({pct} %)",bottomRight:"Unten rechts ({pct} %)",bottomLeft:"Unten links ({pct} %)"}},compass:{title:"Norden relativ zur Oberkante des Plans: {dir}",faces:"Oberkante des Plans zeigt nach",notSet:"Nicht gesetzt",degrees:"Grad im Uhrzeigersinn von Norden",noLocation:"Lege deinen Standort in Home Assistant fest (Einstellungen → System → Allgemein), damit das Tageslicht der Sonne folgt.",preview:"Tageslicht um {time}",now:"Jetzt",sun:"Sonne {deg}° hoch im {dir}",night:"Sonne untergegangen",weather:{sunny:"sonnig","clear-night":"klar",partlycloudy:"teils bewölkt",cloudy:"bewölkt",fog:"Nebel",rainy:"Regen",pouring:"Starkregen",snowy:"Schnee","snowy-rainy":"Schneeregen",hail:"Hagel",lightning:"Gewitter","lightning-rainy":"Unwetter",windy:"windig","windy-variant":"windig, bewölkt",exceptional:"ungewöhnliches Wetter"}},view3d:{open:"3D-Ansicht",close:"Zurück zum 2D-Plan",loading:"3D-Ansicht wird geladen…",noWebgl:"Dieser Browser kann kein 3D anzeigen (WebGL nicht verfügbar).",orbitView:"Schrägansicht",topView:"Draufsicht",dollhouse:"Puppenhaus",dollhouseHint:"Alle Etagen dieses Gebäudes stapeln",roof:"Dach",roofHint:"Dach auf das Gebäude setzen (ausgeblendet, solange die Etagen auseinandergezogen sind)",spread:"Etagen auseinanderziehen",sunTime:"Tageszeit für die Sonne",now:"Jetzt",exportHint:"Szene als glTF-Datei (.glb) herunterladen",exporting:"Wird exportiert…",scans:"Raumscans",scansHint:"Raumscans und 3D-Einstellungen",wallHeight:"Wandhöhe",floorElevation:"Etagenhöhe",floorElevationAuto:"Auto",floorElevationHint:"Höhe dieser Etage über dem Bodenniveau des Gebäudes, um versetzte Geschosse im Puppenhaus richtig zu stapeln. Leer lassen, um sie ein volles Geschoss über die Etage darunter zu setzen.",scansIntro:"Importiere einen Raumscan aus einer Scan-App als glTF (.glb oder .gltf). Er wird von dieser Integration gespeichert und über den Plan gelegt.",importScan:"Scan importieren…",uploading:"Wird hochgeladen…",scanLoading:"Wird geladen…",hide:"Ausblenden",show:"Einblenden",delete:"Löschen",deleteConfirm:"Den Scan „{name}“ löschen? Das kann nicht rückgängig gemacht werden.",alignHint:"Richte den Scan am Plan aus: auf dem Boden ziehen, verschieben und drehen, oder mit „Automatisch ausrichten“ an den Wänden ausrichten.",drag:"Zum Verschieben ziehen",autoAlign:"Automatisch ausrichten",autoAlignHint:"Scan an den Wänden des Plans ausrichten, Kanten an die nächsten Wandflächen setzen und die Bodenhöhe anpassen",snap:"An Wänden einrasten (Umschalt halten zum freien Platzieren)",move:"Verschieben",rotation:"Drehung",scale:"Maßstab",elevation:"Höhenversatz",opacity:"Deckkraft",replaceWalls:"Wände des Plans ersetzen",saveFailed:"Speichern fehlgeschlagen: {error}",ground:"Gelände",roofParts:"Dachteile",roofPartsHint:'Das Dach aus Teilen zeichnen statt es aus den Räumen abzuleiten, eines pro Zeile: ein Rechteck im Plan (x0, y0, x1, y1 in Planeinheiten), der First entlang "x" oder "y", die Traufhöhe in Metern (wie die Etagenhöhe, oder [niedrige Seite, hohe Seite]), die Neigung (Anstieg pro Meter: 0,5 sind 26,6°) und die Enden (["gable" | "hip" | "open", ebenso]). Optional: overhang, base, gable "shake". Gilt für alle Etagen des Gebäudes.',roofAuto:"Automatisch",roofAutoNow:"Automatisch",roofApply:"Übernehmen",roofRevert:"Verwerfen",roofInvalid:"Diese Dachteile sind ungültig: Jedes braucht x0, y0, x1, y1, ridge, eave und pitch.",groundHint:"Für ein Haus am Hang: die Geländehöhe auf der hohen und der niedrigen Seite (im selben Maß wie die Etagenhöhe) und wohin es abfällt. Ein Souterrain liegt unter der hohen Seite. Gilt für alle Etagen des Gebäudes.",groundFlat:"Eben machen",groundFlatNow:"Eben",groundUphill:"Hohe Seite",groundDownhill:"Niedrige Seite",groundToward:"Fällt ab nach",scanMode:"Scan",scanModeHint:"Wände und Objekte der Raumscans statt der Wände und Möbel des Plans zeigen (Treppen der Scans sind immer zu sehen)"}}};let Pe="en";function Ie(e,t){let i=e;for(const e of t.split(".")){if("object"!=typeof i||null===i)return;i=i[e]}return"string"==typeof i?i:void 0}function He(e,t){let i=Ie(Ce[Pe],e)??Ie(Ce.en,e)??e;if(t)for(const[e,n]of Object.entries(t))i=i.split(`{${e}}`).join(String(n));return i}const Ae=[{id:"timber_frame",label:"Timber framed (drywall)",color:"#212121",attenuationDbPerCm:.3,defaultThicknessCm:10},{id:"brick_veneer",label:"Brick veneer",color:"#3e2723",attenuationDbPerCm:.55,defaultThicknessCm:11},{id:"concrete_block",label:"Concrete / block",color:"#000000",attenuationDbPerCm:.6,defaultThicknessCm:20},{id:"aerated_concrete_block",label:"Aerated/foam concrete block (plastered)",color:"#757575",attenuationDbPerCm:.37,defaultThicknessCm:13},{id:"ceramic_poroton_block",label:"Ceramic / Poroton block",color:"#8d6e63",attenuationDbPerCm:.42,defaultThicknessCm:25},{id:"glass",label:"Glass",color:"#37474f",attenuationDbPerCm:2,defaultThicknessCm:1},{id:"steel_frame",label:"Steel frame",color:"#263238",attenuationDbPerCm:1,defaultThicknessCm:10},{id:"half_wall",label:"Half wall",color:"#616161",attenuationDbPerCm:.15,defaultThicknessCm:10}];function Ve(e){const t=`materials.${e.id}`,i=He(t);return i===t?e.label:i}function Fe(e){return Ae.find(t=>t.id===e)??Ae[0]}function Te(e){return e.thickness_cm??Fe(e.material).defaultThicknessCm}class Re{constructor(e){this.hass=e}async listFloors(){return(await this.hass.connection.sendMessagePromise({type:"spatial_context/list_floors"})).floors}async getLayout(e){const t=await this.hass.connection.sendMessagePromise({type:"spatial_context/get_layout",floor_id:e});return{...t,furniture:t.furniture??[],north_deg:t.north_deg??null}}async saveLayout(e,t){return this.hass.connection.sendMessagePromise({type:"spatial_context/save_layout",floor_id:e,background_image_id:t.background_image_id,background_opacity:t.background_opacity,background_offset_x:t.background_offset_x,background_offset_y:t.background_offset_y,background_scale:t.background_scale,building_id:t.building_id,view_box:t.view_box,rooms:t.rooms,pins:t.pins,walls:t.walls,openings:t.openings,furniture:t.furniture,north_deg:t.north_deg,scale:t.scale})}async setBuildingId(e,t){return this.hass.connection.sendMessagePromise({type:"spatial_context/set_building_id",floor_id:e,building_id:t})}async getPropertyLayout(){return this.hass.connection.sendMessagePromise({type:"spatial_context/get_property_layout"})}async savePropertyLayout(e){return this.hass.connection.sendMessagePromise({type:"spatial_context/save_property_layout",background_image_id:e.background_image_id,background_opacity:e.background_opacity,background_offset_x:e.background_offset_x,background_offset_y:e.background_offset_y,background_scale:e.background_scale,view_box:e.view_box,placements:e.placements,pins:e.pins,...void 0!==e.map_background?{map_background:e.map_background}:{}})}async getSettings(){return this.hass.connection.sendMessagePromise({type:"spatial_context/get_settings"})}async saveSettings(e){const t={type:"spatial_context/save_settings"};for(const i of Object.keys({unit_system:"metric",zigbee_timeout_seconds:180,floor_order:"top_down",zigbee_coordinator_device_id:null,auto_save:!0,debug_logging:!1,weather_entity_id:null,show_light_count:!0,room_border_show:!0,room_border_color:null,room_border_width:2,room_border_opacity:1,room_label_size:16,room_label_color:null,room_label_bold:!1,room_label_halo:!0,room_label_halo_width:3,room_label_halo_color:null,room_fill_under_background:!1,custom_icons:[],show_scale_line:!0})){const n=e[i];void 0!==n&&(t[i]=n)}return this.hass.connection.sendMessagePromise(t)}async getVersionInfo(){return this.hass.connection.sendMessagePromise({type:"spatial_context/version"})}async sendDebugLog(e){await this.hass.connection.sendMessagePromise({type:"spatial_context/debug_log",entries:e})}async getDebugReport(){return this.hass.connection.sendMessagePromise({type:"spatial_context/debug_report"})}async listAreas(){return(await this.hass.connection.sendMessagePromise({type:"spatial_context/list_areas"})).areas}async listPlaceableEntities(){return(await this.hass.connection.sendMessagePromise({type:"spatial_context/list_placeable_entities"})).entities}async exportSnapshot(){return this.hass.connection.sendMessagePromise({type:"spatial_context/export_snapshot"})}async getZigbeeMesh(e=!1){return this.hass.connection.sendMessagePromise({type:"spatial_context/get_zigbee_mesh",force_refresh:e})}async getCachedZigbeeMesh(){return this.hass.connection.sendMessagePromise({type:"spatial_context/get_zigbee_mesh",cache_only:!0})}async getWifiMesh(){return this.hass.connection.sendMessagePromise({type:"spatial_context/get_wifi_mesh"})}async subscribeMatterTopology(e){return this.hass.connection.subscribeMessage(e,{type:"matter/subscribe_network_topology"})}async subscribeBluetoothAdvertisements(e){return this.hass.connection.subscribeMessage(e,{type:"bluetooth/subscribe_advertisements"})}async getBluetoothDevices(){return this.hass.connection.sendMessagePromise({type:"spatial_context/get_bluetooth_devices"})}async getView3d(e){return this.hass.connection.sendMessagePromise({type:"spatial_context/get_view3d",floor_id:e})}async saveView3d(e,t){return this.hass.connection.sendMessagePromise({type:"spatial_context/save_view3d",floor_id:e,wall_height_m:t.wall_height_m,floor_elevation_m:t.floor_elevation_m,scans:t.scans.map(e=>({id:e.id,name:e.name,x:e.x,y:e.y,elevation_m:e.elevation_m,rotation_deg:e.rotation_deg,scale:e.scale,visible:e.visible,opacity:e.opacity,hide_walls:e.hide_walls}))})}async saveGround(e,t){await this.hass.connection.sendMessagePromise({type:"spatial_context/save_ground",floor_ids:e,ground:t})}async saveRoof(e,t){await this.hass.connection.sendMessagePromise({type:"spatial_context/save_roof",floor_ids:e,roof:t})}async uploadScan(e,t){const i=new FormData;i.append("file",t);const n=await this.hass.fetchWithAuth(`/api/spatial_context/scan_upload/${encodeURIComponent(e)}`,{method:"POST",body:i});if(!n.ok){const e=await n.json().then(e=>e.message).catch(()=>null);throw new Error(e??`Upload failed: ${n.status} ${n.statusText}`)}return await n.json()}async deleteScan(e){await this.hass.connection.sendMessagePromise({type:"spatial_context/delete_scan",scan_id:e})}async uploadBackgroundImage(e){const t=new FormData;t.append("file",e);const i=await this.hass.fetchWithAuth("/api/image/upload",{method:"POST",body:t});if(!i.ok)throw new Error(`Image upload failed: ${i.status} ${i.statusText}`);return(await i.json()).id}}function Be(e){return e?`/api/image/serve/${e}/original`:null}function Ee(e){return`${e}-${function(){if("undefined"!=typeof crypto&&crypto.randomUUID)return crypto.randomUUID();if("undefined"!=typeof crypto&&crypto.getRandomValues){const e=crypto.getRandomValues(new Uint8Array(16));e[6]=15&e[6]|64,e[8]=63&e[8]|128;const t=Array.from(e,e=>e.toString(16).padStart(2,"0")).join("");return`${t.slice(0,8)}-${t.slice(8,12)}-${t.slice(12,16)}-${t.slice(16,20)}-${t.slice(20)}`}return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,e=>{const t=16*Math.random()|0;return("x"===e?t:3&t|8).toString(16)})}()}`}function De(e,t,i,n){return{id:Ee("pin"),device_id:e,x:t,y:i,room_id:n,icon_override:null,label_override:null,height_m:null}}function ze(e,t,i){return{id:Ee("room"),name:e,area_id:i,points:t}}function Oe(e,t="timber_frame"){return{id:Ee("wall"),material:t,thickness_cm:Fe(t).defaultThicknessCm,points:e}}function je(e,t,i,n,o){return{id:Ee("opening"),wallId:e,type:t,x:i,y:n,width:o}}const Ue=220;class We{constructor(e=[],t=(e,t)=>e<t?-1:e>t?1:0){if(this.data=e,this.length=this.data.length,this.compare=t,this.length>0)for(let e=(this.length>>1)-1;e>=0;e--)this._down(e)}push(e){this.data.push(e),this._up(this.length++)}pop(){if(0===this.length)return;const e=this.data[0],t=this.data.pop();return--this.length>0&&(this.data[0]=t,this._down(0)),e}peek(){return this.data[0]}_up(e){const{data:t,compare:i}=this,n=t[e];for(;e>0;){const o=e-1>>1,r=t[o];if(i(n,r)>=0)break;t[e]=r,e=o}t[e]=n}_down(e){const{data:t,compare:i}=this,n=this.length>>1,o=t[e];for(;e<n;){let n=1+(e<<1);const r=n+1;if(r<this.length&&i(t[r],t[n])<0&&(n=r),i(t[n],o)>=0)break;t[e]=t[n],e=n}t[e]=o}}function Ne(e,t=1,i=!1){let n=1/0,o=1/0,r=-1/0,s=-1/0;for(const[t,i]of e[0])t<n&&(n=t),i<o&&(o=i),t>r&&(r=t),i>s&&(s=i);const a=r-n,l=s-o,c=Math.max(t,Math.min(a,l));if(c===t){const e=[n,o];return e.distance=0,e}let d=0;for(const t of e)d+=t.length;const h=new Float64Array(2*d),u=[];let g=0;for(const t of e){for(let e=0;e<t.length;e++)h[g++]=t[e][0],h[g++]=t[e][1];u.push(g)}const p=function(e,t){const i=64;let n=0,o=0;for(let e=0;e<t.length;e++)n+=Math.ceil((t[e]-o)/i),o=t[e];const r=new Float64Array(4*n);let s=0;o=0;for(let n=0;n<t.length;n++){const a=t[n];for(let t=o;t<a;t+=i,s+=4){const n=t+i<a?t+i:a,l=t===o?a-2:t-2;let c=e[l],d=e[l+1],h=c,u=d;for(let i=t;i<n;i+=2){const t=e[i],n=e[i+1];t<c?c=t:t>h&&(h=t),n<d?d=n:n>u&&(u=n)}r[s]=c,r[s+1]=d,r[s+2]=h,r[s+3]=u}o=a}return r}(h,u),m=new We([],(e,t)=>t.max-e.max);let f=function(e,t,i){let n=0,o=0,r=0;const s=t[0];for(let t=0,i=s-2;t<s;i=t,t+=2){const s=e[t],a=e[t+1],l=e[i],c=e[i+1],d=s*c-l*a;o+=(s+l)*d,r+=(a+c)*d,n+=3*d}const a=new Ze(o/n,r/n,0,e,t,i,-1/0,null);return 0===n||a.d<0?new Ze(e[0],e[1],0,e,t,i,-1/0,null):a}(h,u,p);const _=new Ze(n+a/2,o+l/2,0,h,u,p,-1/0,null);_.d>f.d&&(f=_);let b=2;function v(e,n,o,r){const s=f.d-Math.max(0,o*Math.SQRT2-t),a=new Ze(e,n,o,h,u,p,s,r);b++,a.max>f.d+t&&m.push(a),a.d>f.d&&(f=a,i&&console.log(`found best ${Math.round(1e4*a.d)/1e4} after ${b} probes`))}let y=c/2;for(let e=n;e<r;e+=c)for(let t=o;t<s;t+=c)v(e+y,t+y,y,null);for(;m.length;){const e=m.pop();if(e.max-f.d<=t)break;y=e.h/2,v(e.x-y,e.y-y,y,e),v(e.x+y,e.y-y,y,e),v(e.x-y,e.y+y,y,e),v(e.x+y,e.y+y,y,e)}i&&console.log(`num probes: ${b}\nbest distance: ${f.d}`);const k=[f.x,f.y];return k.distance=f.d,k}function Ze(e,t,i,n,o,r,s,a){this.x=e,this.y=t,this.h=i,this.nsx1=0,this.nsy1=0,this.nsx2=0,this.nsy2=0,this.d=function(e,t,i,n,o,r){const s=e.x,a=e.y;let l=!1,c=1/0;const d=o>0?o*o:-1;if(null!==r&&(e.nsx1=r.nsx1,e.nsy1=r.nsy1,e.nsx2=r.nsx2,e.nsy2=r.nsy2,c=Ge(s,a,r.nsx1,r.nsy1,r.nsx2,r.nsy2),c<=d))return o;const h=64,u=i.length;let g=0,p=0;for(let r=0;r<u;r++){const u=i[r];let m=t[u-2],f=t[u-1];for(let i=p;i<u;i+=h,g+=4){let r=i+h;r>u&&(r=u);const p=n[g],_=n[g+1],b=n[g+2],v=n[g+3],y=s<p?p-s:s>b?s-b:0,k=a<_?_-a:a>v?a-v:0,w=y*y+k*k>=c,x=a<_||a>=v||s>b;if(w&&x)m=t[r-2],f=t[r-1];else for(let n=i;n<r;n+=2){const i=t[n],r=t[n+1];if(!x&&r>a!=f>a&&s<(m-i)*(a-r)/(f-r)+i&&(l=!l),!w){const t=Ge(s,a,i,r,m,f);if(t<c&&(c=t,e.nsx1=i,e.nsy1=r,e.nsx2=m,e.nsy2=f,c<=d))return o}m=i,f=r}}p=u}return 0===c?0:(l?1:-1)*Math.sqrt(c)}(this,n,o,r,s,a),this.max=this.d+i*Math.SQRT2}function Ge(e,t,i,n,o,r){let s=o-i,a=r-n;if(0!==s||0!==a){const l=((e-i)*s+(t-n)*a)/(s*s+a*a);l>1?(i=o,n=r):l>0&&(i+=s*l,n+=a*l)}return s=e-i,a=t-n,s*s+a*a}function Ke(e,t,i,n){return Math.hypot(i-e,n-t)}function qe(e,t,i){return Math.min(i,Math.max(t,e))}function Ye(e,t,i){let n=!1;for(let o=0,r=i.length-1;o<i.length;r=o++){const s=i[o],a=i[r],[l,c]=s,[d,h]=a;c>t!=h>t&&e<(d-l)*(t-c)/(h-c)+l&&(n=!n)}return n}function Qe(e,t,i){for(const n of i)if(n.points.length>=3&&Ye(e,t,n.points))return n.id;return null}function Xe(e,t){let i=!1;const n=t.map(t=>{const n=Qe(t.x,t.y,e);return n===t.room_id?t:(i=!0,{...t,room_id:n})});return i?n:t}const Je=new WeakMap;function et(e){const t=Je.get(e);if(t)return t;const i=e.length>=3?(()=>{const[t,i]=Ne([e],1);return[t,i]})():function(e){if(0===e.length)return[0,0];let t=0,i=0;for(const[n,o]of e)t+=n,i+=o;return[t/e.length,i/e.length]}(e);return Je.set(e,i),i}function tt(e,t,i,n,o,r){const s=o-i,a=r-n,l=s*s+a*a;if(0===l)return Ke(e,t,i,n);let c=((e-i)*s+(t-n)*a)/l;return c=qe(c,0,1),Ke(e,t,i+c*s,n+c*a)}function it(e,t,i){let n=1/0;for(let o=0;o<i.length-1;o++){const[r,s]=i[o],[a,l]=i[o+1];n=Math.min(n,tt(e,t,r,s,a,l))}return n}function nt(e){const t=[];for(let i=0;i<e.length;i++){const n=e[i],o=e[(i+1)%e.length];t.push([(n[0]+o[0])/2,(n[1]+o[1])/2])}return t}function ot(e){const t=[];for(let i=0;i<e.length-1;i++){const n=e[i],o=e[i+1];t.push([(n[0]+o[0])/2,(n[1]+o[1])/2])}return t}function rt(e,t,i){let n={point:e[0],segmentIndex:0,dist:1/0};for(let o=0;o<e.length-1;o++){const[r,s]=e[o],[a,l]=e[o+1],c=a-r,d=l-s,h=c*c+d*d;let u=0===h?0:((t-r)*c+(i-s)*d)/h;u=qe(u,0,1);const g=[r+u*c,s+u*d],p=Ke(t,i,g[0],g[1]);p<n.dist&&(n={point:g,segmentIndex:o,dist:p})}return{point:n.point,segmentIndex:n.segmentIndex}}function st(e,t,i){return 0===e.length?{point:[t,i],segmentIndex:0}:rt([...e,e[0]],t,i)}function at(e,t,i){const[n,o]=e,[r,s]=t,a=Math.abs(r-n),l=Math.abs(s-o);return a>i&&l>i?t:a<=l?[n,s]:[r,o]}function lt(e,t,i,n){if(n.length<2)return null;const{segmentIndex:o}=rt(n,e,t),[r,s]=function(e,t){const[i,n]=e[t],[o,r]=e[t+1]??e[t],s=Ke(i,n,o,r)||1;return[(o-i)/s,(r-n)/s]}(n,o),a=i/2;return[[e-r*a,t-s*a],[e+r*a,t+s*a]]}function ct(e){const t=e.getRootNode();let i=document.activeElement;for(;i?.shadowRoot?.activeElement;)i=i.shadowRoot.activeElement;if(!(i instanceof HTMLElement))return;let n=i.getRootNode();for(;n&&n!==t;)n=n instanceof ShadowRoot?n.host.getRootNode():null;n===t&&i.blur()}const dt=.3048;function ht(e){return Math.round(100*e)/100}function ut(e){return"imperial"===e?"ft":"m"}function gt(e,t){return String(ht("imperial"===t?e/dt:e))}function pt(e,t){const i=Number(e);return Number.isFinite(i)?"imperial"===t?i*dt:i:null}const mt={cm:1,m:100,in:2.54,ft:30.48};function ft(e){return"imperial"===e?"in":"cm"}function _t(e,t){return String(ht(e/mt[t]))}function bt(e,t){const i=Number(e);return Number.isFinite(i)?i*mt[t]:null}function vt(e,t,i){return _t(e/t*100,i)}const yt=a`
  :host {
    --sc-bg: var(--card-background-color, #fff);
    --sc-fg: var(--primary-text-color, #212121);
    --sc-fg-secondary: var(--secondary-text-color, #727272);
    --sc-accent: var(--primary-color, #03a9f4);
    --sc-divider: var(--divider-color, #e0e0e0);
    --sc-danger: var(--error-color, #db4437);
    --sc-panel-bg: var(--card-background-color, #fff);
    --sc-panel-radius: var(--ha-card-border-radius, 12px);
    --sc-panel-shadow: var(--ha-card-box-shadow, 0 2px 6px rgba(0, 0, 0, 0.3));
    --sc-header-bg: var(--app-header-background-color, var(--sc-bg));
    /* Type scale. */
    --sc-fs-caption: 0.75rem; /* section titles, map notes */
    --sc-fs-small: 0.8125rem; /* hints, secondary text, chips */
    --sc-fs-body: 0.875rem; /* buttons, fields, dropdowns */
    --sc-fs-row: 0.9375rem; /* list rows, menu items, dialog rows */
    --sc-fs-title: 1.125rem; /* card titles */
    --sc-fs-header: 1.25rem; /* app bar title */
    --sc-fs-dialog: 1.375rem; /* dialog titles */
    /* Shape: controls are 12px rounded rectangles, 40px tall (36px for
     * fields inside cards and dialogs). */
    --sc-r-control: 12px;
    /* Hover tint, laid over whatever fill the element already has. */
    --sc-hover: color-mix(in srgb, var(--sc-fg) 8%, transparent);
    --sc-h-control: 40px;
    --sc-h-field: 36px;
    box-sizing: border-box;
    color: var(--sc-fg);
    font-family: var(--paper-font-body1_-_font-family, Roboto, sans-serif);
  }
  :host *,
  :host *::before,
  :host *::after {
    box-sizing: inherit;
  }
  button {
    font-family: inherit;
    font-size: var(--sc-fs-body);
    cursor: pointer;
    border: none;
    border-radius: var(--sc-r-control);
    padding: 6px 12px;
    background: transparent;
    color: var(--sc-fg);
  }
  /* Hover adds a tint as a background *image*, so a button that already
   * has a fill (surface, tonal) keeps it instead of losing it. The extra
   * :not()s lift the specificity above components' own background rules. */
  button:hover:not(:disabled):not(.primary) {
    background-image: linear-gradient(var(--sc-hover), var(--sc-hover));
  }
  button:focus-visible {
    outline: 2px solid var(--sc-accent);
    outline-offset: 2px;
  }
  button.primary {
    background: var(--sc-accent);
    color: white;
  }
  button.primary:hover {
    filter: brightness(1.05);
  }
  button.danger {
    color: var(--sc-danger);
  }
  button:disabled {
    opacity: 0.4;
    cursor: default;
    background: transparent;
  }
  button.active {
    background: color-mix(in srgb, var(--sc-accent) 22%, transparent);
    color: var(--sc-accent);
  }
  input[type="text"],
  input[type="search"] {
    font-family: inherit;
    font-size: var(--sc-fs-body);
    height: var(--sc-h-field);
    padding: 0 12px;
    border: 1px solid var(--sc-divider);
    border-radius: var(--sc-r-control);
    color: var(--sc-fg);
    background: var(--sc-bg);
  }
  .floating-panel {
    background: var(--sc-panel-bg);
    border: 1px solid var(--sc-divider);
    border-radius: var(--sc-panel-radius);
    box-shadow: var(--sc-panel-shadow);
    padding: 6px;
  }
  /* HA's own overflow-menu row style (the ⋮ menu's Refresh/Download/Reset
   * list) — an icon + label per row, generous padding, no borders between
   * rows, disabled rows just dimmed. Shared by every icon-popover menu. */
  .menu-item {
    display: flex;
    align-items: center;
    gap: 20px;
    width: 100%;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: var(--sc-fs-row);
    text-align: left;
    justify-content: flex-start;
  }
  .menu-item ha-icon {
    --mdc-icon-size: 22px;
    color: var(--sc-fg-secondary);
    flex-shrink: 0;
  }
  /* Selected row: the primary colour at low strength (like HA's selected
   * list items) instead of a solid bar. */
  .menu-item.active {
    background: color-mix(in srgb, var(--sc-accent) 16%, transparent);
    color: var(--sc-accent);
  }
  .menu-item.active ha-icon {
    color: var(--sc-accent);
  }
  .menu-item.danger ha-icon {
    color: var(--sc-danger);
  }
`,kt=a`
  .controls {
    position: absolute;
    right: 12px;
    bottom: calc(12px + env(safe-area-inset-bottom, 0px));
    display: flex;
    flex-direction: column;
    background: var(--sc-panel-bg);
    border: 1px solid var(--sc-divider);
    box-shadow: var(--sc-panel-shadow);
    border-radius: var(--sc-r-control);
    overflow: hidden;
  }
  .controls button {
    display: grid;
    place-items: center;
    width: 40px;
    height: var(--sc-h-control);
    padding: 0;
    border-radius: 0;
    color: var(--sc-fg);
  }
  .controls button + button {
    border-top: 1px solid var(--sc-divider);
  }
  .controls button:hover {
    background: var(--sc-hover);
  }
  .controls ha-icon {
    --mdc-icon-size: 22px;
  }
  /* Touch screens: clear the browser's bottom bar / home indicator even
   * where the safe-area inset isn't reported. */
  @media (pointer: coarse) {
    .controls {
      bottom: calc(28px + env(safe-area-inset-bottom, 0px));
    }
  }
`,wt=a`
  .select-wrap {
    position: relative;
    display: inline-flex;
    min-width: 0;
  }
  .select-wrap select {
    appearance: none;
    -webkit-appearance: none;
    width: 100%;
    padding-right: 30px;
  }
  .select-wrap .chev {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    --mdc-icon-size: 20px;
    color: var(--sc-fg-secondary);
    pointer-events: none;
  }
`,xt=a`
  /* HA's (Material 3) switch: a 52x32 pill. Off is an outlined track with
   * a grey knob; on is a primary track with a large white knob. */
  .switch {
    appearance: none;
    -webkit-appearance: none;
    position: relative;
    box-sizing: border-box;
    width: 52px;
    height: 32px;
    margin: 0;
    border: 2px solid color-mix(in srgb, var(--sc-fg) 45%, transparent);
    border-radius: 16px;
    background: transparent;
    cursor: pointer;
    transition:
      background 0.15s,
      border-color 0.15s;
    flex: none;
  }
  .switch::before {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--sc-fg-secondary);
    transition:
      transform 0.15s,
      background 0.15s;
  }
  .switch:checked {
    border-color: var(--sc-accent);
    background: var(--sc-accent);
  }
  .switch:checked::before {
    background: white;
    transform: translateX(20px);
  }
  .switch:focus-visible {
    outline: 2px solid var(--sc-accent);
    outline-offset: 2px;
  }
`,Mt=a`
  .tool-row {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 56px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 12px;
    /* HA's second bar is a step darker than the app bar above it. */
    background: var(--primary-background-color, var(--sc-bg));
    border-bottom: 1px solid var(--sc-divider);
    pointer-events: auto;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .tool-row::-webkit-scrollbar {
    display: none;
  }
  .tool-row > * {
    flex: none;
  }
  /* HA's controls are rounded rectangles on a surface fill with a thin
   * border — not pills. The tool group is one such container. */
  .tool-row .mode-toolbar {
    position: static;
    display: flex;
    gap: 2px;
    align-items: center;
    padding: 3px;
    border: 1px solid var(--sc-divider);
    border-radius: 14px;
    background: var(--sc-panel-bg);
  }
  .tool-row .hint-bar {
    position: static;
    transform: none;
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    box-shadow: none;
    padding: 0;
    flex: 1 0 auto;
  }
  /* A third bar for mode-specific tools (e.g. lining up the map), laid
   * over the top of the canvas right under the controls row. */
  .tool-row.sub {
    top: 56px;
    z-index: 1;
  }
  .tool-row.sub .hint-bar button.primary {
    margin-left: auto;
  }
  .tool-row .hint-bar input[type="range"] {
    width: 130px;
  }
  .tool-row input[type="number"] {
    width: 76px;
    height: var(--sc-h-control);
    padding: 0 12px;
    border: 1px solid var(--sc-divider);
    border-radius: var(--sc-r-control);
    background: var(--sc-panel-bg);
    color: var(--sc-fg);
    font: inherit;
    font-size: var(--sc-fs-body);
    -moz-appearance: textfield;
  }
  .tool-row input[type="number"]::-webkit-inner-spin-button,
  .tool-row input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  /* Whatever the row's last items are (Background, undo/redo/save) sit at
   * the right. */
  .tool-row ::slotted([slot="row-end"]) {
    margin-left: auto;
  }
  /* Every field and button in the row is the same 40px:
   * rounded rectangle, surface fill, thin border, HA's dropdown chevron. */
  .tool-row select {
    appearance: none;
    -webkit-appearance: none;
    height: var(--sc-h-control);
    padding: 0 34px 0 14px;
    border: 1px solid var(--sc-divider);
    border-radius: var(--sc-r-control);
    background-color: var(--sc-panel-bg);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%239b9b9b' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    background-size: 20px;
    color: var(--sc-fg);
    font: inherit;
    font-size: var(--sc-fs-small);
  }
  .tool-row select:focus {
    outline: none;
    border-color: var(--sc-accent);
  }
  /* The select-wrap variant draws its own chevron icon. */
  .tool-row .select-wrap select {
    background-image: none;
  }
  .tool-row .mode-toolbar select {
    height: 32px;
    border-radius: 10px;
    background-color: transparent;
  }
  .tool-row .hint-bar button {
    height: var(--sc-h-control);
    padding: 0 16px;
    border: 1px solid var(--sc-divider);
    border-radius: var(--sc-r-control);
    background: var(--sc-panel-bg);
    font-size: var(--sc-fs-small);
  }
  .tool-row .hint-bar button.primary {
    border-color: transparent;
    background: color-mix(in srgb, var(--sc-accent) 22%, transparent);
    color: var(--sc-accent);
  }
`,$t=a`
  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    height: 4px;
    border-radius: 2px;
    background: linear-gradient(
      to right,
      var(--sc-accent) var(--pct, 50%),
      var(--sc-divider) var(--pct, 50%)
    );
    outline: none;
  }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--sc-accent);
    border: none;
    cursor: pointer;
  }
  input[type="range"]::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--sc-accent);
    border: none;
    cursor: pointer;
  }
`,Lt=a`
  .scale-corner {
    position: absolute;
    left: 12px;
    bottom: calc(12px + env(safe-area-inset-bottom, 0px));
    pointer-events: none;
  }
  @media (pointer: coarse) {
    .scale-corner {
      bottom: calc(28px + env(safe-area-inset-bottom, 0px));
    }
  }
  .scale-bar {
    display: inline-flex;
    flex-direction: column;
    gap: 2px;
    padding: 4px 10px 6px;
    border-radius: 8px;
    font-size: var(--sc-fs-caption);
    color: var(--sc-fg);
  }
  .scale-bar-line {
    height: 6px;
    border: 2px solid var(--sc-fg);
    border-top: none;
  }
  .scale-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 32px;
    max-width: min(320px, calc(100vw - 120px));
    padding: 6px 12px;
    border-radius: var(--sc-r-control);
    font-size: var(--sc-fs-small);
    color: var(--sc-fg-secondary);
    pointer-events: auto;
  }
  button.scale-chip {
    cursor: pointer;
  }
  .scale-chip ha-icon {
    --mdc-icon-size: 16px;
    flex: none;
  }
  .scale-chip .warn {
    color: var(--warning-color, #db8b00);
  }
`;function St(e,t,i,n){return e.map(e=>({pin:e,d:Ke(e.x,e.y,t,i)})).filter(({d:e})=>e<=n).sort((e,t)=>e.d-t.d).map(({pin:e})=>e)}function Ct(e,t,i,n){let o=null,r=n;return e.forEach(([e,n],s)=>{const a=Ke(e,n,t,i);a<=r&&(o=s,r=a)}),o}function Pt(e,t,i,n){let o=null,r=n;for(const n of e){const e=it(t,i,n.points);e<=r&&(o=n,r=e)}return o}function It(e,t,i,n){if(e.points.length>=3){const[o,r]=e.points[0];if(Ke(o,r,t,i)<=n)return{trace:e,closed:!0}}return{trace:{points:[...e.points,[t,i]]},closed:!1}}const Ht=new Map;function At(e){const t=e.trim();if(!t)return Promise.resolve(null);const i=t.includes(":")?t:`mdi:${t}`;let n=Ht.get(i);return n||(n=async function(e){if(!customElements.get("ha-icon"))return null;const t=document.createElement("div");t.style.cssText="position:fixed;left:-10000px;top:0;width:24px;height:24px;overflow:hidden;";const i=document.createElement("ha-icon");i.setAttribute("icon",e),t.appendChild(i),document.body.appendChild(t);try{const e=Date.now()+4e3;for(;Date.now()<e;){const e=i.shadowRoot?.querySelector("ha-svg-icon");if("string"==typeof e?.path&&e.path)return e.path;await new Promise(e=>setTimeout(e,50))}return null}finally{t.remove()}}(i),Ht.set(i,n)),n}const Vt=a`
  .pin-hit {
    fill: transparent;
    cursor: pointer;
  }
  .pin-dot {
    /* One uniform color for every device — a per-domain tint would
     * mean deriving something from an arbitrarily-chosen entity's
     * domain again, which this app deliberately never does anymore
     * (see canvas/device-display.ts). */
    fill: var(--sc-accent);
    stroke: white;
    stroke-width: 2;
    pointer-events: none;
  }
  .pin-dot.selected {
    fill: var(--sc-danger);
  }
  .pin-icon {
    pointer-events: none;
  }
  .pin-brand-icon {
    pointer-events: none;
  }
  .pin-icon path {
    fill: white;
  }
`;class Ft{constructor(e){this._host=e,this._resolvedOverrides=new Map,this._failedBrandIcons=new Set}_iconForOverride(e){return this._resolvedOverrides.has(e)?this._resolvedOverrides.get(e)??null:(this._resolvedOverrides.set(e,null),At(e).then(t=>{null!==t&&(this._resolvedOverrides.set(e,t),this._host.requestUpdate())}),null)}iconForPin(e,t){if(e.icon_override){const t=this._iconForOverride(e.icon_override);if(t)return{kind:"path",d:t}}const i=function(e,t){return xe(e,t)?.integration_domain??null}(e.device_id,t);return i&&!this._failedBrandIcons.has(i)?{kind:"image",href:`https://brands.home-assistant.io/_/${i}/icon.png`,integrationDomain:i}:{kind:"path",d:"M3 6H21V4H3C1.9 4 1 4.9 1 6V18C1 19.1 1.9 20 3 20H7V18H3V6M13 12H9V13.78C8.39 14.33 8 15.11 8 16C8 16.89 8.39 17.67 9 18.22V20H13V18.22C13.61 17.67 14 16.88 14 16S13.61 14.33 13 13.78V12M11 17.5C10.17 17.5 9.5 16.83 9.5 16S10.17 14.5 11 14.5 12.5 15.17 12.5 16 11.83 17.5 11 17.5M22 8H16C15.5 8 15 8.5 15 9V19C15 19.5 15.5 20 16 20H22C22.5 20 23 19.5 23 19V9C23 8.5 22.5 8 22 8M21 18H17V10H21V18Z"}}onBrandIconError(e){this._failedBrandIcons.has(e)||(this._failedBrandIcons.add(e),this._host.requestUpdate())}renderMarker(e,t,i,n,o,r,s){const a=1.1*i;return Z`
      <g>
        <title>${s}</title>
        <circle
          class="pin-dot ${r?"selected":""}"
          cx=${e}
          cy=${t}
          r=${i}
          style="fill:${r?"":o}"
        ></circle>
        ${"path"===n.kind?Z`
              <svg
                x=${e-a/2}
                y=${t-a/2}
                width=${a}
                height=${a}
                viewBox="0 0 24 24"
                class="pin-icon"
              >
                <path d=${n.d}></path>
              </svg>
            `:Z`
              <image
                x=${e-a/2}
                y=${t-a/2}
                width=${a}
                height=${a}
                href=${n.href}
                class="pin-brand-icon"
                @error=${()=>this.onBrandIconError(n.integrationDomain)}
              ></image>
            `}
        <circle class="pin-hit" cx=${e} cy=${t} r=${1.4*i}></circle>
      </g>
    `}}const Tt=2;class Rt{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}class Bt extends Rt{constructor(e){if(super(e),this.it=K,e.type!==Tt)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===K||null==e)return this._t=void 0,this.it=e;if(e===G)return e;if("string"!=typeof e)throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.it)return this._t;this.it=e;const t=[e];return t.raw=t,this._t={_$litType$:this.constructor.resultType,strings:t,values:[]}}}Bt.directiveName="unsafeHTML",Bt.resultType=1;class Et extends Bt{}Et.directiveName="unsafeSVG",Et.resultType=2;const Dt=(e=>(...t)=>({_$litDirective$:e,values:t}))(Et),zt={accessibility:{label:"Accessibility",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="4.5" r="1.5"/><path d="M4.5 8.25L12 9.75L19.5 8.25M12 9.75V14.25L8.25 21M12 14.25L15.75 21"/></g></g></g>'},activity:{label:"Activity",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M2.25 12H6.75L9.75 4.5L14.25 19.5L17.25 12H21.75"/></g></g></g>'},alarm:{label:"Alarm",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="13.5" r="7.5"/><path d="M4.5 3.75L2.25 6M19.5 3.75L21.75 6"/></g><g><path d="M12 9.75V13.5L14.25 15"/></g></g></g>'},alert:{label:"Alert",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 3.75L21 19.5H3Z"/><path d="M12 9.75V13.5"/><circle cx="12" cy="16.5" r="1" fill="currentColor" stroke="none"/></g></g></g>'},"align-center":{label:"Align Center",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 6H20.25M6.75 10H17.25M3.75 14H20.25M6.75 18H17.25"/></g></g></g>'},"align-left":{label:"Align Left",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 6H20.25M3.75 10H14.25M3.75 14H20.25M3.75 18H14.25"/></g></g></g>'},"align-right":{label:"Align Right",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 6H20.25M9.75 10H20.25M3.75 14H20.25M9.75 18H20.25"/></g></g></g>'},anchor:{label:"Anchor",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="5.25" r="2.25"/><path d="M12 7.5V21M7.5 11.25H16.5M3.75 12.75C3.75 17.5 7.5 21 12 21S20.25 17.5 20.25 12.75"/></g></g></g>'},apple:{label:"Apple",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 7.5C9.75 6 5.25 6 5.25 11.25C5.25 16.5 8.25 20.25 10.5 20.25C11.25 20.25 11.25 19.5 12 19.5S12.75 20.25 13.5 20.25C15.75 20.25 18.75 16.5 18.75 11.25C18.75 6 14.25 6 12 7.5ZM12 7.5C12 5.25 13.5 3.75 15 3"/></g></g></g>'},archive:{label:"Archive",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="3" y="4.5" width="18" height="4.5" rx="1"/><path d="M4.5 9V19.5H19.5V9M9.75 12.75H14.25"/></g></g></g>'},"area-chart":{label:"Area Chart",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 3.75V20.25H20.25"/></g><g><path d="M7.5 16.5V12L11.25 8.25L14.25 11.25L19.5 6V16.5Z"/></g></g></g>'},"arrow-down-left":{label:"Arrow Down Left",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M17.25 6.75L6.75 17.25M15.75 17.25H6.75V8.25"/></g></g></g>'},"arrow-down-right":{label:"Arrow Down Right",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M6.75 6.75L17.25 17.25M17.25 8.25V17.25H8.25"/></g></g></g>'},"arrow-down":{label:"Arrow Down",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 3.75V19.5M6 13.5L12 19.5L18 13.5"/></g></g></g>'},"arrow-left-circle":{label:"Arrow Left Circle",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="12" r="8.25"/></g><g><path d="M15.75 12H8.25M11.25 9L8.25 12L11.25 15"/></g></g></g>'},"arrow-left":{label:"Arrow Left",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M20.25 12H4.5M10.5 6L4.5 12L10.5 18"/></g></g></g>'},"arrow-right-circle":{label:"Arrow Right Circle",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="12" r="8.25"/></g><g><path d="M8.25 12H15.75M12.75 9L15.75 12L12.75 15"/></g></g></g>'},"arrow-right-question":{label:"Arrow Right Question",svg:'<g transform="translate(0 0) scale(2.666667)"><defs><mask id="ui-arrow-right-question-icon-arrow-right-question-k"><rect width="24" height="24" fill="#fff"/><circle cx="18" cy="18" r="6.5" fill="#000"/></mask></defs><g mask="url(#ui-arrow-right-question-icon-arrow-right-question-k)"><g transform="translate(1 1) scale(0.8)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 12H19.5M13.5 6L19.5 12L13.5 18"/></g></g></g></g><g fill="none" stroke-linejoin="round" stroke-linecap="round"><g><path d="M15.75 16.25A2.25 2.25 0 1 1 18.85 18.33C18.35 18.55 18 18.9 18 19.4V19.5"/><circle cx="18" cy="21.25" r="1" fill="currentColor" stroke="none"/></g></g></g>'},"arrow-right":{label:"Arrow Right",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 12H19.5M13.5 6L19.5 12L13.5 18"/></g></g></g>'},"arrow-up-left":{label:"Arrow Up Left",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M17.25 17.25L6.75 6.75M15.75 6.75H6.75V15.75"/></g></g></g>'},"arrow-up-right":{label:"Arrow Up Right",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M6.75 17.25L17.25 6.75M8.25 6.75H17.25V15.75"/></g></g></g>'},"arrow-up":{label:"Arrow Up",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 20.25V4.5M6 10.5L12 4.5L18 10.5"/></g></g></g>'},"at-sign":{label:"At Sign",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="12" r="3.75"/><path d="M15.75 8.25V13.5A2.25 2.25 0 0 0 20.25 13.5V12A8.25 8.25 0 1 0 16.5 18.9"/></g></g></g>'},atom:{label:"Atom",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><ellipse cx="12" cy="12" rx="9" ry="3.5"/><ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(-60 12 12)"/></g><g><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/></g></g></g>'},award:{label:"Award",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="9" r="6"/><path d="M8.25 13.75L6.75 21.75L12 18.75L17.25 21.75L15.75 13.75"/></g></g></g>'},bank:{label:"Bank",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3 9.75L12 3.75L21 9.75ZM6 9.75V17.25M10 9.75V17.25M14 9.75V17.25M18 9.75V17.25M4.5 17.25H19.5M3 20.25H21"/></g></g></g>'},banknote:{label:"Banknote",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="2.25" y="6" width="19.5" height="12" rx="1.5"/><circle cx="6" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1" fill="currentColor" stroke="none"/></g><g><circle cx="12" cy="12" r="2.5"/></g></g></g>'},"bar-chart":{label:"Bar Chart",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 20.25H20.25M6.75 16.5V12M17.25 16.5V9.75"/></g><g><path d="M12 16.5V6.75"/></g></g></g>'},barcode:{label:"Barcode",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 5.25V18.75M7.5 5.25V18.75M10.5 5.25V18.75M14.25 5.25V18.75M16.5 5.25V18.75M20.25 5.25V18.75"/></g></g></g>'},barn:{label:"Barn",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 20.25V9.75L12 3.75L20.25 9.75V20.25ZM9 20.25V13.5H15V20.25M9 13.5L15 20.25M15 13.5L9 20.25M10.5 9.75H13.5"/></g></g></g>'},barometer:{label:"Barometer",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="12" r="8.25"/><path d="M7.5 16.5H16.5"/></g><g><path d="M12 12L15.75 8.25"/><circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none"/></g></g></g>'},basket:{label:"Basket",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 10.5H20.25L18.75 19.5H5.25ZM7.5 10.5L10.5 4.5M16.5 10.5L13.5 4.5M9 13.5V16.5M12 13.5V16.5M15 13.5V16.5"/></g></g></g>'},"battery-charging":{label:"Battery Charging",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="2.25" y="7.5" width="17.25" height="9" rx="1.5"/><path d="M21.75 10.5V13.5"/></g><g><path d="M11.75 9L9 12H13L10.25 15"/></g></g></g>'},battery:{label:"Battery",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="2.25" y="7.5" width="17.25" height="9" rx="1.5"/><path d="M21.75 10.5V13.5"/></g><g><rect x="4.5" y="9.75" width="8.25" height="4.5" rx="0.5" fill="currentColor" stroke="none"/></g></g></g>'},beaker:{label:"Beaker",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M6 3.75H18M7.5 3.75V19.5A1.5 1.5 0 0 0 9 21H15A1.5 1.5 0 0 0 16.5 19.5V3.75"/></g><g><path d="M7.5 13.5H16.5"/></g></g></g>'},beehive:{label:"Beehive",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 3C7.5 3 4.5 7.5 4.5 12S6 20.25 7.5 20.25H16.5C18 20.25 19.5 16.5 19.5 12S16.5 3 12 3ZM5.25 8.25H18.75M4.5 12.75H19.5M5.25 16.5H18.75"/></g><g><path d="M10.5 20.25V18.75A1.5 1.5 0 0 1 13.5 18.75V20.25"/></g></g></g>'},"bell-off":{label:"Bell Off",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M6 16.5V10.5A6 6 0 0 1 18 10.5V16.5L19.5 18H4.5L6 16.5M10 20.75H14M3.75 3.75L20.25 20.25"/></g></g></g>'},"bell-ring":{label:"Bell Ring",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M6 16.5V10.5A6 6 0 0 1 18 10.5V16.5L19.5 18H4.5L6 16.5M10 20.75H14"/></g><g><path d="M2.25 9A8 8 0 0 1 4.5 4.5M21.75 9A8 8 0 0 0 19.5 4.5"/></g></g></g>'},bell:{label:"Bell",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M6 16.5V10.5A6 6 0 0 1 16.2 6.2M18 10.5V16.5L19.5 18H4.5L6 16.5M10 20.75H14"/></g><g><circle cx="18.25" cy="5.25" r="2.25" fill="currentColor" stroke="none"/></g></g></g>'},bluetooth:{label:"Bluetooth",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M7.5 7.5L16.5 16.5L12 21V3L16.5 7.5L7.5 16.5"/></g></g></g>'},bold:{label:"Bold",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M6.75 4.5H13.125A3.375 3.375 0 0 1 13.125 11.25H6.75ZM6.75 11.25H14.25A3.75 3.75 0 0 1 14.25 18.75H6.75Z"/></g></g></g>'},book:{label:"Book",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 6C10 4.5 7 3.75 3 3.75V18C7 18 10 18.75 12 20.25C14 18.75 17 18 21 18V3.75C17 3.75 14 4.5 12 6ZM12 6V20.25"/></g></g></g>'},book_copy:{label:"Book",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 6C10 4.5 7 3.75 3 3.75V18C7 18 10 18.75 12 20.25C14 18.75 17 18 21 18V3.75C17 3.75 14 4.5 12 6ZM12 6V20.25"/><g transform="translate(4.2323 3.2949) scale(0.9523)"><g transform="matrix(0.375 0 0 0.375 0 0)" fill="none" stroke="none" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1" fill-opacity="1" fill-rule="nonzero"><g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M15.75 4.5L19.5 8.25L8.25 19.5H4.5V15.75ZM13.5 6.75L17.25 10.5"/></g></g></g></g></g></g></g></g>'},"bookmark-check":{label:"Bookmark Check",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M6 3.75H18V20.25L12 15.75L6 20.25Z"/></g><g><path d="M9.25 10.5L11.25 12.5L14.75 8.75"/></g></g></g>'},"bookmark-plus":{label:"Bookmark Plus",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M6 3.75H18V20.25L12 15.75L6 20.25Z"/></g><g><path d="M12 7.5V12.75M9.375 10.125H14.625"/></g></g></g>'},bookmark:{label:"Bookmark",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M6 3.75H18V20.25L12 15.75L6 20.25Z"/></g></g></g>'},bot:{label:"Bot",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="4.5" y="8.25" width="15" height="11.25" rx="2"/><path d="M12 8.25V5.25M2.25 12.75V15M21.75 12.75V15"/><circle cx="12" cy="4.25" r="1.25" fill="currentColor" stroke="none"/></g><g><circle cx="9" cy="13.5" r="1.25" fill="currentColor" stroke="none"/><circle cx="15" cy="13.5" r="1.25" fill="currentColor" stroke="none"/></g></g></g>'},braces:{label:"Braces",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M8.25 3.75C6 3.75 6 6 6 8.25S6 12 3.75 12C6 12 6 13.5 6 15.75S6 20.25 8.25 20.25M15.75 3.75C18 3.75 18 6 18 8.25S18 12 20.25 12C18 12 18 13.5 18 15.75S18 20.25 15.75 20.25"/></g></g></g>'},brackets:{label:"Brackets",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M8.25 3.75H4.5V20.25H8.25M15.75 3.75H19.5V20.25H15.75"/></g></g></g>'},briefcase:{label:"Briefcase",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="2.25" y="6.75" width="19.5" height="13.5" rx="1.5"/><path d="M8.25 6.75V4.5A1.5 1.5 0 0 1 9.75 3H14.25A1.5 1.5 0 0 1 15.75 4.5V6.75M2.25 12.75H21.75"/></g></g></g>'},bug:{label:"Bug",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><ellipse cx="12" cy="14" rx="5" ry="6.25"/><path d="M12 9.5V20.25M9 7.75A3 3 0 0 1 15 7.75M7 11.5H3.75M7 15.5H3.75M17 11.5H20.25M17 15.5H20.25M7.75 18.75L5.25 21M16.25 18.75L18.75 21"/></g></g></g>'},building:{label:"Building",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M4.5 21V3.75H15V21M15 9H19.5V21M2.25 21H21.75M7.5 7.5H9M10.5 7.5H12M7.5 11.25H9M10.5 11.25H12M7.5 15H9M10.5 15H12M8.25 21V18H11.25V21"/></g></g></g>'},calculator:{label:"Calculator",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="4.5" y="2.25" width="15" height="19.5" rx="1.5"/><rect x="7.5" y="5.25" width="9" height="3.75"/><circle cx="8.25" cy="12.75" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12.75" r="1" fill="currentColor" stroke="none"/><circle cx="15.75" cy="12.75" r="1" fill="currentColor" stroke="none"/><circle cx="8.25" cy="16.5" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="16.5" r="1" fill="currentColor" stroke="none"/><circle cx="15.75" cy="16.5" r="1" fill="currentColor" stroke="none"/></g></g></g>'},"calendar-check":{label:"Calendar Check",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="3.75" y="5.25" width="16.5" height="15" rx="1.5"/><path d="M3.75 9.75H20.25M8.25 3V6.75M15.75 3V6.75"/></g><g><path d="M9 15L11 17L15 13"/></g></g></g>'},"calendar-days":{label:"Calendar Days",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="3.75" y="5.25" width="16.5" height="15" rx="1.5"/><path d="M3.75 9.75H20.25M8.25 3V6.75M15.75 3V6.75"/><circle cx="8.25" cy="13.5" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="13.5" r="1" fill="currentColor" stroke="none"/><circle cx="15.75" cy="13.5" r="1" fill="currentColor" stroke="none"/><circle cx="8.25" cy="17.25" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="17.25" r="1" fill="currentColor" stroke="none"/></g></g></g>'},"calendar-plus":{label:"Calendar Plus",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="3.75" y="5.25" width="16.5" height="15" rx="1.5"/><path d="M3.75 9.75H20.25M8.25 3V6.75M15.75 3V6.75"/></g><g><path d="M12 12.75V17.25M9.75 15H14.25"/></g></g></g>'},"calendar-x":{label:"Calendar X",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="3.75" y="5.25" width="16.5" height="15" rx="1.5"/><path d="M3.75 9.75H20.25M8.25 3V6.75M15.75 3V6.75"/><path d="M9.75 12.75L14.25 17.25M14.25 12.75L9.75 17.25"/></g></g></g>'},calendar:{label:"Calendar",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="3.75" y="5.25" width="16.5" height="15" rx="1.5"/><path d="M3.75 9.75H20.25M8.25 3V6.75M15.75 3V6.75"/></g><g><circle cx="15.75" cy="15" r="1.5" fill="currentColor" stroke="none"/></g></g></g>'},camera:{label:"Camera",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3 8.25A1.5 1.5 0 0 1 4.5 6.75H7.5L9 4.5H15L16.5 6.75H19.5A1.5 1.5 0 0 1 21 8.25V18A1.5 1.5 0 0 1 19.5 19.5H4.5A1.5 1.5 0 0 1 3 18Z"/></g><g><circle cx="12" cy="12.75" r="3.5"/></g></g></g>'},car:{label:"Car",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M5.25 17.25H3.75V12L6 6.75H18L20.25 12V17.25H18.75M9.75 17.25H14.25M3.75 12H20.25"/><circle cx="7.5" cy="17.25" r="2.25"/><circle cx="16.5" cy="17.25" r="2.25"/></g></g></g>'},carrot:{label:"Carrot",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M16.5 7.5C14.5 5.5 11.25 6.25 10.25 8.5L3.75 20.25L15.5 13.75C17.75 12.75 18.5 9.5 16.5 7.5Z"/></g><g><path d="M16.5 7.5L20.25 4.5M16.5 7.5L21 8.25M16.5 7.5V3"/></g></g></g>'},cart:{label:"Cart",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M2.25 3.75H5.25L7.5 15.75H18.75L21 7.5H6"/><circle cx="9" cy="19.5" r="1.25"/><circle cx="17.25" cy="19.5" r="1.25"/></g></g></g>'},"center-pivot":{label:"Center Pivot",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3 21V9.75H21M3 9.75L7.5 14.25L12 9.75L16.5 14.25L21 9.75M7.5 14.25V18M16.5 14.25V18"/><circle cx="7.5" cy="19.5" r="1.5"/><circle cx="16.5" cy="19.5" r="1.5"/></g><g><circle cx="5.25" cy="16.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="12" cy="13.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="10.5" cy="17.25" r="0.9" fill="currentColor" stroke="none"/><circle cx="13.5" cy="17.25" r="0.9" fill="currentColor" stroke="none"/><circle cx="18.75" cy="16.5" r="0.9" fill="currentColor" stroke="none"/></g></g></g>'},"check-circle":{label:"Check Circle",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="12" r="8.25"/></g><g><path d="M8.25 12.25L10.75 14.75L15.75 9.5"/></g></g></g>'},check:{label:"Check",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g/><g><path d="M4.5 12.75L9.5 17.5L19.5 6.5"/></g></g></g>'},checkbox:{label:"Checkbox",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="3.75" y="3.75" width="16.5" height="16.5" rx="2"/></g><g><path d="M8 12.25L10.75 15L16 9.25"/></g></g></g>'},cherry:{label:"Cherry",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="7.5" cy="17.25" r="3"/><circle cx="16.5" cy="16.5" r="3"/><path d="M7.5 14.25C8.25 9 11.25 5.25 15 3.75M16.5 13.5C15.75 9.75 15 6 15 3.75"/></g><g><path d="M15 3.75C17.25 3 19.5 3.75 20.25 5.25C18.75 6.75 16.5 6 15 3.75Z"/></g></g></g>'},"chevron-down":{label:"Chevron Down",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M5.25 9L12 15.75L18.75 9"/></g></g></g>'},"chevron-left":{label:"Chevron Left",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M15 5.25L8.25 12L15 18.75"/></g></g></g>'},"chevron-right":{label:"Chevron Right",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M9 5.25L15.75 12L9 18.75"/></g></g></g>'},"chevron-up":{label:"Chevron Up",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M5.25 15L12 8.25L18.75 15"/></g></g></g>'},"chevrons-down":{label:"Chevrons Down",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M6 5.25L12 11.25L18 5.25M6 12.75L12 18.75L18 12.75"/></g></g></g>'},"chevrons-left":{label:"Chevrons Left",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M18.75 6L12.75 12L18.75 18M11.25 6L5.25 12L11.25 18"/></g></g></g>'},"chevrons-right":{label:"Chevrons Right",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M5.25 6L11.25 12L5.25 18M12.75 6L18.75 12L12.75 18"/></g></g></g>'},"chevrons-up":{label:"Chevrons Up",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M6 18.75L12 12.75L18 18.75M6 11.25L12 5.25L18 11.25"/></g></g></g>'},chili:{label:"Chili",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M6 7.5C4.5 12 6 18 11.25 20.25C16.5 22.5 20.25 20.25 19.5 18.75C15 18 11.25 13.5 10.5 8.25C10 6.5 7 5.5 6 7.5Z"/></g><g><path d="M8.25 6.75C8.25 4.5 9.75 3 12 3"/></g></g></g>'},citrus:{label:"Citrus",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="12" r="8.25"/><path d="M12 12V5.25M12 12V18.75M12 12L6.15 8.6M12 12L17.85 15.4M12 12L6.15 15.4M12 12L17.85 8.6"/></g></g></g>'},"clipboard-check":{label:"Clipboard Check",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M15 4.5H18A1.5 1.5 0 0 1 19.5 6V19.5A1.5 1.5 0 0 1 18 21H6A1.5 1.5 0 0 1 4.5 19.5V6A1.5 1.5 0 0 1 6 4.5H9"/><rect x="9" y="3" width="6" height="3" rx="0.75"/></g><g><path d="M8.75 13.5L11 15.75L15.25 11.5"/></g></g></g>'},clipboard:{label:"Clipboard",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M15 4.5H18A1.5 1.5 0 0 1 19.5 6V19.5A1.5 1.5 0 0 1 18 21H6A1.5 1.5 0 0 1 4.5 19.5V6A1.5 1.5 0 0 1 6 4.5H9"/><rect x="9" y="3" width="6" height="3" rx="0.75"/></g></g></g>'},clock:{label:"Clock",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="12" r="8.25"/></g><g><path d="M12 7.5V12L15 14.25"/></g></g></g>'},close:{label:"Close",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M6 6L18 18M18 6L6 18"/></g></g></g>'},"cloud-check":{label:"Cloud Check",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M7.5 18A4.25 4.25 0 0 1 6.4 9.8A6 6 0 0 1 17.9 9.1A4.4 4.4 0 0 1 17 18"/></g><g><path d="M9 15L11.25 17.25L15.75 12.75"/></g></g></g>'},"cloud-download":{label:"Cloud Download",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M7.5 18A4.25 4.25 0 0 1 6.4 9.8A6 6 0 0 1 17.9 9.1A4.4 4.4 0 0 1 17 18"/></g><g><path d="M12 12V20.5M9 17.5L12 20.5L15 17.5"/></g></g></g>'},"cloud-lightning":{label:"Cloud Lightning",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M7.5 18A4.25 4.25 0 0 1 6.4 9.8A6 6 0 0 1 17.9 9.1A4.4 4.4 0 0 1 17 18"/></g><g><path d="M12.75 12L10.5 15.75H13.5L11.25 19.5"/></g></g></g>'},"cloud-moon":{label:"Cloud Moon",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M9 20.25A3.75 3.75 0 0 1 8.5 12.8A5.25 5.25 0 0 1 18.5 12.4A3.9 3.9 0 0 1 17.625 20.25Z"/></g><g><path d="M13.5 3.75A4.5 4.5 0 1 0 19.5 9.75A3.5 3.5 0 0 1 13.5 3.75Z"/></g></g></g>'},"cloud-off":{label:"Cloud Off",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M7 18.75A4.25 4.25 0 0 1 6.4 10.3A6 6 0 0 1 17.9 9.6A4.6 4.6 0 0 1 17.25 18.75ZM3.75 3.75L20.25 20.25"/></g></g></g>'},"cloud-rain":{label:"Cloud Rain",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M7 14.25A4 4 0 0 1 6.4 6.3A5.6 5.6 0 0 1 17.5 5.8A4.2 4.2 0 0 1 17.25 14.25Z"/></g><g><path d="M8.25 17.25L7.5 20.25M12.75 17.25L12 20.25M17.25 17.25L16.5 20.25"/></g></g></g>'},"cloud-snow":{label:"Cloud Snow",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M7 14.25A4 4 0 0 1 6.4 6.3A5.6 5.6 0 0 1 17.5 5.8A4.2 4.2 0 0 1 17.25 14.25Z"/></g><g><circle cx="8.25" cy="17.75" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="17.75" r="1" fill="currentColor" stroke="none"/><circle cx="15.75" cy="17.75" r="1" fill="currentColor" stroke="none"/><circle cx="10.125" cy="20.5" r="1" fill="currentColor" stroke="none"/><circle cx="13.875" cy="20.5" r="1" fill="currentColor" stroke="none"/></g></g></g>'},"cloud-sun":{label:"Cloud Sun",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M9 20.25A3.75 3.75 0 0 1 8.5 12.8A5.25 5.25 0 0 1 18.5 12.4A3.9 3.9 0 0 1 17.625 20.25Z"/></g><g><path d="M11.2 6.3A3 3 0 0 0 6 8.25A3 3 0 0 0 6.9 10.4M9 2.25V3M3 8.25H3.75M4.75 4L5.3 4.55M13.25 4L12.7 4.55"/></g></g></g>'},"cloud-upload":{label:"Cloud Upload",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M7.5 18A4.25 4.25 0 0 1 6.4 9.8A6 6 0 0 1 17.9 9.1A4.4 4.4 0 0 1 17 18"/></g><g><path d="M12 12.5V21M9 15.5L12 12.5L15 15.5"/></g></g></g>'},cloud:{label:"Cloud",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M7 18.75A4.25 4.25 0 0 1 6.4 10.3A6 6 0 0 1 17.9 9.6A4.6 4.6 0 0 1 17.25 18.75Z"/></g></g></g>'},cloudy:{label:"Cloudy",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M16.5 13.5A3.5 3.5 0 0 0 16.2 6.5A5 5 0 0 0 7 7.5M6.75 20.25A3.75 3.75 0 0 1 6.25 12.8A5.25 5.25 0 0 1 16.25 12.4A3.9 3.9 0 0 1 15.375 20.25Z"/></g></g></g>'},code:{label:"Code",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M8.25 7.5L3.75 12L8.25 16.5M15.75 7.5L20.25 12L15.75 16.5"/></g><g><path d="M13.5 4.5L10.5 19.5"/></g></g></g>'},"coffee-bean":{label:"Coffee Bean",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><g transform="rotate(30 12 12)"><ellipse cx="12" cy="12" rx="5.25" ry="8.25"/><path d="M12 3.75C9.75 8.25 14.25 15.75 12 20.25"/></g></g></g></g>'},coffee:{label:"Coffee",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 8.25H16.5V14.25A5.25 5.25 0 0 1 11.25 19.5H9A5.25 5.25 0 0 1 3.75 14.25ZM16.5 9.75H18A2.25 2.25 0 0 1 18 14.25H16.5M7.5 2.25V4.5M11.25 2.25V4.5M3 21.75H17.25"/></g></g></g>'},coins:{label:"Coins",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><ellipse cx="9" cy="6.75" rx="6" ry="2.25"/><path d="M3 6.75V10.5C3 11.75 5.7 12.75 9 12.75"/><ellipse cx="15" cy="13.5" rx="6" ry="2.25"/><path d="M9 13.5V17.25C9 18.5 11.7 19.5 15 19.5S21 18.5 21 17.25V13.5"/></g></g></g>'},columns:{label:"Columns",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="3" y="3.75" width="18" height="16.5" rx="1.5"/><path d="M12 3.75V20.25"/></g></g></g>'},command:{label:"Command",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M9 9V6.75A2.25 2.25 0 1 0 6.75 9H9ZM15 9H17.25A2.25 2.25 0 1 0 15 6.75V9ZM15 15V17.25A2.25 2.25 0 1 0 17.25 15H15ZM9 15H6.75A2.25 2.25 0 1 0 9 17.25V15ZM9 9H15V15H9Z"/></g></g></g>'},comment:{label:"Comment",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3 5.25A1.5 1.5 0 0 1 4.5 3.75H19.5A1.5 1.5 0 0 1 21 5.25V15.75A1.5 1.5 0 0 1 19.5 17.25H8.25L3 21ZM7.5 8.25H16.5M7.5 12H13.5"/></g></g></g>'},compass:{label:"Compass",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="12" r="8.25"/></g><g><path d="M15.75 8.25L13.5 13.5L8.25 15.75L10.5 10.5Z"/></g></g></g>'},copy:{label:"Copy",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="8.25" y="8.25" width="12" height="12" rx="1.5"/><path d="M15.75 8.25V5.25A1.5 1.5 0 0 0 14.25 3.75H5.25A1.5 1.5 0 0 0 3.75 5.25V14.25A1.5 1.5 0 0 0 5.25 15.75H8.25"/></g></g></g>'},corn:{label:"Corn",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 3C9.9 3 8.25 6.4 8.25 11.25C8.25 14.5 9.9 16.5 12 16.5S15.75 14.5 15.75 11.25C15.75 6.4 14.1 3 12 3ZM12 3V16.5M8.5 8.25H15.5M8.3 11.75H15.7"/></g><g><path d="M12 21C12 17.25 9.75 14.25 5.25 13.5C5.25 17.25 8.25 20.25 12 21ZM12 21C12 17.25 14.25 14.25 18.75 13.5C18.75 17.25 15.75 20.25 12 21Z"/></g></g></g>'},"corner-down-right":{label:"Corner Down Right",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M4.5 4.5V11.25A3 3 0 0 0 7.5 14.25H19.5"/></g><g><path d="M15 9.75L19.5 14.25L15 18.75"/></g></g></g>'},"corner-up-left":{label:"Corner Up Left",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M19.5 19.5V12.75A3 3 0 0 0 16.5 9.75H4.5"/></g><g><path d="M9 5.25L4.5 9.75L9 14.25"/></g></g></g>'},cotton:{label:"Cotton",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="8.75" cy="10.25" r="3.25"/><circle cx="15.25" cy="10.25" r="3.25"/><circle cx="12" cy="6.75" r="3.25"/><path d="M12 16.5V21.75"/></g><g><path d="M5.5 13.5C7 17.25 17 17.25 18.5 13.5"/></g></g></g>'},cpu:{label:"Cpu",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="6" y="6" width="12" height="12" rx="1.5"/><path d="M9.75 2.75V6M14.25 2.75V6M9.75 18V21.25M14.25 18V21.25M2.75 9.75H6M2.75 14.25H6M18 9.75H21.25M18 14.25H21.25"/></g><g><rect x="9.5" y="9.5" width="5" height="5" rx="0.5"/></g></g></g>'},"credit-card":{label:"Credit Card",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="2.25" y="5.25" width="19.5" height="13.5" rx="1.5"/><path d="M2.25 9.75H21.75M6 15H9.75"/></g></g></g>'},crop:{label:"Crop",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M6.75 2.25V17.25H21.75M2.25 6.75H17.25V21.75"/></g></g></g>'},crosshair:{label:"Crosshair",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="12" r="8.25"/><path d="M12 2.25V6.75M12 17.25V21.75M2.25 12H6.75M17.25 12H21.75"/></g></g></g>'},crown:{label:"Crown",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3 7.5L7.5 12L12 4.5L16.5 12L21 7.5L19.5 18H4.5ZM4.5 21H19.5"/></g></g></g>'},database:{label:"Database",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><ellipse cx="12" cy="6" rx="7.5" ry="2.75"/><path d="M4.5 6V18C4.5 19.5 7.9 20.75 12 20.75S19.5 19.5 19.5 18V6M4.5 12C4.5 13.5 7.9 14.75 12 14.75S19.5 13.5 19.5 12"/></g></g></g>'},dna:{label:"Dna",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M7.5 3V4.5C7.5 9 16.5 15 16.5 19.5V21M16.5 3V4.5C16.5 9 7.5 15 7.5 19.5V21"/></g><g><path d="M8.25 7.5H15.75M10 9.75H14M10 14.25H14M8.25 16.5H15.75"/></g></g></g>'},dollar:{label:"Dollar",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M16.5 7.5C16 6 14.25 5.25 12 5.25C9.5 5.25 7.5 6.5 7.5 8.25C7.5 12 16.5 10.5 16.5 15C16.5 17 14.5 18.75 12 18.75C9.75 18.75 8 18 7.5 16.5M12 2.25V21.75"/></g></g></g>'},"donut-chart":{label:"Donut Chart",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="12" r="8.25"/><circle cx="12" cy="12" r="4"/></g><g><path d="M12 3.75A8.25 8.25 0 0 1 20.25 12"/></g></g></g>'},download:{label:"Download",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 15.75V20.25H20.25V15.75"/></g><g><path d="M12 3.75V15M7.5 10.5L12 15L16.5 10.5"/></g></g></g>'},"drip-line":{label:"Drip Line",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M2.25 8.25H21.75M2.25 11.25H21.75M6 11.25V12.75M12 11.25V12.75M18 11.25V12.75"/></g><g><path d="M6 14.6C6 14.6 4.5 16.3 4.5 17.1A1.5 1.5 0 0 0 7.5 17.1C7.5 16.3 6 14.6 6 14.6Z"/><path d="M12 15.6C12 15.6 10.5 17.3 10.5 18.1A1.5 1.5 0 0 0 13.5 18.1C13.5 17.3 12 15.6 12 15.6Z"/><path d="M18 14.6C18 14.6 16.5 16.3 16.5 17.1A1.5 1.5 0 0 0 19.5 17.1C19.5 16.3 18 14.6 18 14.6Z"/></g></g></g>'},drizzle:{label:"Drizzle",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M7 14.25A4 4 0 0 1 6.4 6.3A5.6 5.6 0 0 1 17.5 5.8A4.2 4.2 0 0 1 17.25 14.25Z"/></g><g><path d="M8.25 17.25V18M8.25 20.25V21M12 18.75V19.5M15.75 17.25V18M15.75 20.25V21"/></g></g></g>'},drone:{label:"Drone",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="9.75" y="9.75" width="4.5" height="4.5" rx="1"/><path d="M9.75 9.75L7.5 7.5M14.25 9.75L16.5 7.5M9.75 14.25L7.5 16.5M14.25 14.25L16.5 16.5"/></g><g><circle cx="6" cy="6" r="2.25"/><circle cx="18" cy="6" r="2.25"/><circle cx="6" cy="18" r="2.25"/><circle cx="18" cy="18" r="2.25"/></g></g></g>'},droplet:{label:"Droplet",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 3C12 3 5.25 10.5 5.25 14.25A6.75 6.75 0 0 0 18.75 14.25C18.75 10.5 12 3 12 3Z"/></g></g></g>'},drought:{label:"Drought",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3 15.75H21M7.5 15.75L9 18L7.5 20.25M15 15.75L13.5 18.75L15.75 20.25"/></g><g><circle cx="12" cy="8.25" r="3"/><path d="M12 2.25V3M6 8.25H6.75M17.25 8.25H18"/></g></g></g>'},edit:{label:"Edit",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M15.75 4.5L19.5 8.25L8.25 19.5H4.5V15.75ZM13.5 6.75L17.25 10.5"/></g></g></g>'},edit_copy:{label:"Edit",svg:'<g transform="translate(29 12.25) scale(1.225) rotate(44)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M15.75 4.5L19.5 8.25L8.25 19.5H4.5V15.75ZM13.5 6.75L17.25 10.5" transform="translate(4.1257 -12.4153) scale(1.377)"/></g></g></g>'},egg:{label:"Egg",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 21C8.25 21 5.25 18 5.25 14.25C5.25 9 8.25 3 12 3S18.75 9 18.75 14.25C18.75 18 15.75 21 12 21Z"/></g></g></g>'},expand:{label:"Expand",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M14.25 3.75H20.25V9.75M9.75 20.25H3.75V14.25M20.25 3.75L13.5 10.5M3.75 20.25L10.5 13.5"/></g></g></g>'},"external-link":{label:"External Link",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M18.75 13.5V20.25H3.75V5.25H10.5"/></g><g><path d="M14.25 3.75H20.25V9.75M20.25 3.75L11.25 12.75"/></g></g></g>'},"eye-off":{label:"Eye Off",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M2.25 12C4.5 7.5 8 5.25 12 5.25S19.5 7.5 21.75 12C19.5 16.5 16 18.75 12 18.75S4.5 16.5 2.25 12Z"/><path d="M4.5 4.5L19.5 19.5"/></g></g></g>'},eye:{label:"Eye",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M2.25 12C4.5 7.5 8 5.25 12 5.25S19.5 7.5 21.75 12C19.5 16.5 16 18.75 12 18.75S4.5 16.5 2.25 12Z"/></g><g><circle cx="12" cy="12" r="3"/></g></g></g>'},factory:{label:"Factory",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M2.25 21V10.5L7.5 13.5V10.5L12.75 13.5V10.5L18 13.5V3.75H21.75V21Z"/></g><g><path d="M6 17.25H7.5M10.5 17.25H12M15 17.25H16.5"/></g></g></g>'},fence:{label:"Fence",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M6 20.25V6.75L7.5 4.5L9 6.75V20.25M15 20.25V6.75L16.5 4.5L18 6.75V20.25M3 10.5H6M9 10.5H15M18 10.5H21M3 15.75H6M9 15.75H15M18 15.75H21"/></g></g></g>'},fertilizer:{label:"Fertilizer",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M6 6.75L7.5 3.75H16.5L18 6.75V20.25H6ZM6 6.75H18"/></g><g><path d="M12 16.5V12.75M12 13.5C12 11.25 13.5 10.5 15 10.5C15 12.75 13.5 13.5 12 13.5Z"/></g></g></g>'},"field-location":{label:"Field Location",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M7.5 12.75L2.25 16.5L12 21.75L21.75 16.5L16.5 12.75"/><path d="M12 18C12 18 6.75 13.25 6.75 8.25A5.25 5.25 0 0 1 17.25 8.25C17.25 13.25 12 18 12 18Z"/></g><g><circle cx="12" cy="8.25" r="1.875"/></g></g></g>'},"field-sprout":{label:"Field Sprout",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M7.5 12.75L2.25 16.5L12 21.75L21.75 16.5L16.5 12.75"/><path d="M12 18.75V10.5"/></g><g><path d="M12 12C12 8.25 9.75 6 6 6C6 9.75 8.25 12 12 12ZM12 10.5C12 7 14 4.5 18 4.5C18 8.25 15.75 10.5 12 10.5Z"/></g></g></g>'},"field-water":{label:"Field Water",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M7.5 12.75L2.25 16.5L12 21.75L21.75 16.5L16.5 12.75"/></g><g><path d="M12 3C12 3 8.25 7.5 8.25 10.125A3.75 3.75 0 0 0 15.75 10.125C15.75 7.5 12 3 12 3Z"/></g></g></g>'},field:{label:"Field",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3 20.25H21M3 11.25H21M12 20.25V11.25M7.5 20.25L9.75 11.25M16.5 20.25L14.25 11.25M3 17.25L6 11.25M21 17.25L18 11.25"/></g><g><circle cx="17.25" cy="6" r="2.25"/></g></g></g>'},"file-chart":{label:"File Chart",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M5.25 3H14.25L18.75 7.5V21H5.25ZM14.25 3V7.5H18.75"/></g><g><path d="M8.25 18V15.75M12 18V12M15.75 18V14.25"/></g></g></g>'},"file-check":{label:"File Check",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M5.25 3H14.25L18.75 7.5V21H5.25ZM14.25 3V7.5H18.75"/></g><g><path d="M8.75 14.25L11 16.5L15.25 12"/></g></g></g>'},"file-code":{label:"File Code",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M5.25 3H14.25L18.75 7.5V21H5.25ZM14.25 3V7.5H18.75"/></g><g><path d="M10.5 11.25L8.25 14.25L10.5 17.25M13.5 11.25L15.75 14.25L13.5 17.25"/></g></g></g>'},"file-download":{label:"File Download",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M5.25 3H14.25L18.75 7.5V21H5.25ZM14.25 3V7.5H18.75"/></g><g><path d="M12 10.5V17.25M9 14.25L12 17.25L15 14.25"/></g></g></g>'},"file-plus":{label:"File Plus",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M5.25 3H14.25L18.75 7.5V21H5.25ZM14.25 3V7.5H18.75"/></g><g><path d="M12 11.25V17.25M9 14.25H15"/></g></g></g>'},"file-search":{label:"File Search",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M5.25 3H14.25L18.75 7.5V21H5.25ZM14.25 3V7.5H18.75"/></g><g><circle cx="11.25" cy="13.5" r="2.25"/><path d="M13 15.25L15 17.25"/></g></g></g>'},"file-text":{label:"File Text",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M5.25 3H14.25L18.75 7.5V21H5.25ZM14.25 3V7.5H18.75"/><path d="M8.25 12H15.75M8.25 15H15.75M8.25 18H12.75"/></g></g></g>'},"file-x":{label:"File X",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M5.25 3H14.25L18.75 7.5V21H5.25ZM14.25 3V7.5H18.75"/><path d="M9.75 12L14.25 16.5M14.25 12L9.75 16.5"/></g></g></g>'},file:{label:"File",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M5.25 3H14.25L18.75 7.5V21H5.25ZM14.25 3V7.5H18.75"/></g></g></g>'},film:{label:"Film",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="3" y="3" width="18" height="18" rx="1.5"/><path d="M7.5 3V21M16.5 3V21M3 7.5H7.5M3 12H21M3 16.5H7.5M16.5 7.5H21M16.5 16.5H21"/></g></g></g>'},filter:{label:"Filter",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 5.25H20.25L14.25 12.75V19.5L9.75 17.25V12.75Z"/></g></g></g>'},fish:{label:"Fish",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M2.25 12C5.25 7.5 9.75 6 14.25 7.5C16.5 8.25 18.75 10.5 18.75 12C18.75 13.5 16.5 15.75 14.25 16.5C9.75 18 5.25 16.5 2.25 12ZM18.75 12L21.75 8.25V15.75Z"/><circle cx="6.75" cy="11.25" r="1" fill="currentColor" stroke="none"/></g></g></g>'},flag:{label:"Flag",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M5.25 21V3.75"/></g><g><path d="M5.25 4.5H18L15.75 9L18 13.5H5.25"/></g></g></g>'},flame:{label:"Flame",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 21.75A6.75 6.75 0 0 1 5.25 15C5.25 10.5 9 8.25 9.75 3C13.5 5.25 18.75 9.75 18.75 15A6.75 6.75 0 0 1 12 21.75Z"/></g><g><path d="M12 21.75A3 3 0 0 1 9 18.75C9 16.5 12 14.25 12 14.25S15 16.5 15 18.75A3 3 0 0 1 12 21.75Z"/></g></g></g>'},flask:{label:"Flask",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M9.75 3.75H14.25M10.5 3.75V9.75L4.5 19.25A1 1 0 0 0 5.4 20.25H18.6A1 1 0 0 0 19.5 19.25L13.5 9.75V3.75"/></g><g><path d="M7.25 15.75H16.75"/></g></g></g>'},flood:{label:"Flood",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3 8.25L12 3L21 8.25M5.25 7V12H18.75V7"/></g><g><path d="M3 15.75C5.25 13.5 6.75 18 9 15.75S12.75 13.5 15 15.75S18.75 18 21 15.75M3 19.5C5.25 18 6.75 21 9 19.5S12.75 18 15 19.5S18.75 21 21 19.5"/></g></g></g>'},fog:{label:"Fog",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M7 14.25A4 4 0 0 1 6.4 6.3A5.6 5.6 0 0 1 17.5 5.8A4.2 4.2 0 0 1 17.25 14.25Z"/><path d="M4.5 17.25H19.5M7.5 20.25H16.5"/></g></g></g>'},"folder-check":{label:"Folder Check",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3 6A1.5 1.5 0 0 1 4.5 4.5H9.75L12 7.5H19.5A1.5 1.5 0 0 1 21 9V18A1.5 1.5 0 0 1 19.5 19.5H4.5A1.5 1.5 0 0 1 3 18Z"/></g><g><path d="M9 13.5L11.25 15.75L15 11.25"/></g></g></g>'},"folder-open":{label:"Folder Open",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3 18V6A1.5 1.5 0 0 1 4.5 4.5H9.75L12 7.5H18A1.5 1.5 0 0 1 19.5 9V10.5M3 18L5.75 10.5H21.75L18.75 19.5H4.5A1.5 1.5 0 0 1 3 18Z"/></g></g></g>'},"folder-plus":{label:"Folder Plus",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3 6A1.5 1.5 0 0 1 4.5 4.5H9.75L12 7.5H19.5A1.5 1.5 0 0 1 21 9V18A1.5 1.5 0 0 1 19.5 19.5H4.5A1.5 1.5 0 0 1 3 18Z"/></g><g><path d="M12 10.5V16.5M9 13.5H15"/></g></g></g>'},"folder-search":{label:"Folder Search",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3 6A1.5 1.5 0 0 1 4.5 4.5H9.75L12 7.5H19.5A1.5 1.5 0 0 1 21 9V18A1.5 1.5 0 0 1 19.5 19.5H4.5A1.5 1.5 0 0 1 3 18Z"/></g><g><circle cx="11.25" cy="12.75" r="2.25"/><path d="M13 14.5L15 16.5"/></g></g></g>'},folder:{label:"Folder",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3 6A1.5 1.5 0 0 1 4.5 4.5H9.75L12 7.5H19.5A1.5 1.5 0 0 1 21 9V18A1.5 1.5 0 0 1 19.5 19.5H4.5A1.5 1.5 0 0 1 3 18Z"/></g></g></g>'},forward:{label:"Forward",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M19.5 12H9.75A5.25 5.25 0 0 0 4.5 17.25V18.75"/></g><g><path d="M14.25 6.75L19.5 12L14.25 17.25"/></g></g></g>'},frown:{label:"Frown",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="12" r="8.25"/><path d="M8.25 16.5A4.5 4.5 0 0 1 15.75 16.5"/><circle cx="9" cy="9.75" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="9.75" r="1" fill="currentColor" stroke="none"/></g></g></g>'},fuel:{label:"Fuel",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M4.5 21V4.5A1.5 1.5 0 0 1 6 3H12A1.5 1.5 0 0 1 13.5 4.5V21M3 21H15M4.5 10.5H13.5M13.5 12H15.75A1.5 1.5 0 0 1 17.25 13.5V16.5A1.5 1.5 0 0 0 20.25 16.5V8.25L17.25 5.25"/></g></g></g>'},gantt:{label:"Gantt",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 3.75V20.25"/></g><g><path d="M6.75 6.75H13.5M9.75 12H18.75M12.75 17.25H20.25"/></g></g></g>'},gauge:{label:"Gauge",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 16.5A8.25 8.25 0 1 1 20.25 16.5"/></g><g><path d="M12 15L16 9.75"/><circle cx="12" cy="15" r="1.5" fill="currentColor" stroke="none"/></g></g></g>'},gift:{label:"Gift",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="3" y="8.25" width="18" height="4.5" rx="1"/><path d="M4.5 12.75V21H19.5V12.75M12 8.25V21M12 8.25C10.5 4.5 6.75 3.75 6.75 6.375C6.75 7.75 9 8.25 12 8.25C15 8.25 17.25 7.75 17.25 6.375C17.25 3.75 13.5 4.5 12 8.25"/></g></g></g>'},"git-branch":{label:"Git Branch",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="6.75" cy="5.25" r="2.25"/><circle cx="6.75" cy="18.75" r="2.25"/><circle cx="17.25" cy="6.75" r="2.25"/><path d="M6.75 7.5V16.5"/></g><g><path d="M17.25 9C17.25 13.5 6.75 12 6.75 16.5"/></g></g></g>'},"git-commit":{label:"Git Commit",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M2.25 12H8.25M15.75 12H21.75"/></g><g><circle cx="12" cy="12" r="3.75"/></g></g></g>'},"git-fork":{label:"Git Fork",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="6.75" cy="5.25" r="2.25"/><circle cx="17.25" cy="5.25" r="2.25"/><circle cx="12" cy="18.75" r="2.25"/></g><g><path d="M6.75 7.5V9A3 3 0 0 0 9.75 12H14.25A3 3 0 0 0 17.25 9V7.5M12 12V16.5"/></g></g></g>'},"git-merge":{label:"Git Merge",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="6.75" cy="5.25" r="2.25"/><circle cx="6.75" cy="18.75" r="2.25"/><circle cx="17.25" cy="12" r="2.25"/><path d="M6.75 7.5V16.5"/></g><g><path d="M6.75 7.5C6.75 10.5 10.5 12 15 12"/></g></g></g>'},"git-pull-request":{label:"Git Pull Request",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="6" cy="5.25" r="2.25"/><circle cx="6" cy="18.75" r="2.25"/><circle cx="18" cy="18.75" r="2.25"/><path d="M6 7.5V16.5"/></g><g><path d="M18 16.5V9A3 3 0 0 0 15 6H11.25M13.5 3.75L11.25 6L13.5 8.25"/></g></g></g>'},"glasses-edit":{label:"Glasses Edit",svg:'<g transform="translate(0 0) scale(2.666667)"><defs><mask id="ui-glasses-edit-icon-glasses-edit-k"><rect width="24" height="24" fill="#fff"/><circle cx="18" cy="18" r="6.5" fill="#000"/></mask></defs><g mask="url(#ui-glasses-edit-icon-glasses-edit-k)"><g transform="translate(1 1) scale(0.8)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="6.75" cy="15" r="3.75"/><circle cx="17.25" cy="15" r="3.75"/><path d="M10.5 15C11.25 14.25 12.75 14.25 13.5 15M3 15L4.5 7.5M21 15L19.5 7.5"/></g></g></g></g><g fill="none" stroke-linejoin="round" stroke-linecap="round"><g><path d="M19.5 14.25L21.75 16.5L16.5 21.75H14.25V19.5Z"/></g></g></g>'},glasses:{label:"Glasses",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="6.75" cy="15" r="3.75"/><circle cx="17.25" cy="15" r="3.75"/><path d="M10.5 15C11.25 14.25 12.75 14.25 13.5 15M3 15L4.5 7.5M21 15L19.5 7.5"/></g></g></g>'},globe:{label:"Globe",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="12" r="8.25"/><ellipse cx="12" cy="12" rx="3.75" ry="8.25"/><path d="M3.75 12H20.25"/></g></g></g>'},"graduation-cap":{label:"Graduation Cap",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 4.5L21.75 9.375L12 14.25L2.25 9.375ZM6 11.25V16.5C6 18 8.75 19.5 12 19.5S18 18 18 16.5V11.25"/></g><g><path d="M21.75 9.375V15"/></g></g></g>'},grapes:{label:"Grapes",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="9.75" cy="9.75" r="2.25"/><circle cx="14.25" cy="9.75" r="2.25"/><circle cx="7.5" cy="13.5" r="2.25"/><circle cx="12" cy="13.5" r="2.25"/><circle cx="16.5" cy="13.5" r="2.25"/><circle cx="9.75" cy="17.25" r="2.25"/><circle cx="14.25" cy="17.25" r="2.25"/><circle cx="12" cy="20.5" r="1.25"/></g><g><path d="M12 7.5V4.5M12 6.75C13.5 4.5 16.5 3.75 18.75 4.5C17.25 6.75 15 7.5 12 6.75Z"/></g></g></g>'},greenhouse:{label:"Greenhouse",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3 20.25V9.75L12 3.75L21 9.75V20.25ZM12 3.75V20.25M3 14.25H21"/></g></g></g>'},grid:{label:"Grid",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="3.75" y="3.75" width="6.75" height="6.75" rx="1"/><rect x="13.5" y="3.75" width="6.75" height="6.75" rx="1"/><rect x="3.75" y="13.5" width="6.75" height="6.75" rx="1"/><rect x="13.5" y="13.5" width="6.75" height="6.75" rx="1"/></g></g></g>'},hail:{label:"Hail",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M7 14.25A4 4 0 0 1 6.4 6.3A5.6 5.6 0 0 1 17.5 5.8A4.2 4.2 0 0 1 17.25 14.25Z"/></g><g><path d="M12 16.5L11.25 19.5"/><circle cx="8.25" cy="19.5" r="1"/><circle cx="15.75" cy="19.5" r="1"/></g></g></g>'},hammer:{label:"Hammer",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M13.5 7.5L4.5 16.5A1.6 1.6 0 0 0 6.75 18.75L15.75 9.75M11.25 5.25L14.25 2.25L21 9L18 12Z"/></g></g></g>'},"hard-drive":{label:"Hard Drive",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="2.25" y="12.75" width="19.5" height="7.5" rx="1.5"/><path d="M2.25 12.75L5.25 4.5H18.75L21.75 12.75"/></g><g><circle cx="17.25" cy="16.5" r="1" fill="currentColor" stroke="none"/></g></g></g>'},hash:{label:"Hash",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M9.75 3.75L8.25 20.25M15.75 3.75L14.25 20.25M4.5 9H20.25M3.75 15H19.5"/></g></g></g>'},headphones:{label:"Headphones",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 17.25V12A8.25 8.25 0 0 1 20.25 12V17.25M3.75 14.25H6.75V20.25H5.25A1.5 1.5 0 0 1 3.75 18.75ZM20.25 14.25H17.25V20.25H18.75A1.5 1.5 0 0 0 20.25 18.75Z"/></g></g></g>'},heart:{label:"Heart",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 20.25C12 20.25 3 14.75 3 8.75A4.5 4.5 0 0 1 12 6.75A4.5 4.5 0 0 1 21 8.75C21 14.75 12 20.25 12 20.25Z"/></g></g></g>'},heatwave:{label:"Heatwave",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3 8.25C5.25 6 6.75 10.5 9 8.25S12.75 6 15 8.25S18.75 10.5 21 8.25M3 13.5C5.25 11.25 6.75 15.75 9 13.5S12.75 11.25 15 13.5S18.75 15.75 21 13.5M3 18.75C5.25 16.5 6.75 21 9 18.75S12.75 16.5 15 18.75S18.75 21 21 18.75"/></g></g></g>'},help:{label:"Help",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="12" r="8.25"/><path d="M9.5 9.5A2.5 2.5 0 1 1 13 11.8C12.4 12.1 12 12.6 12 13.25V13.75"/><circle cx="12" cy="16.75" r="1" fill="currentColor" stroke="none"/></g></g></g>'},hexagon:{label:"Hexagon",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 2.25L20.5 7.125V16.875L12 21.75L3.5 16.875V7.125Z"/></g></g></g>'},history:{label:"History",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 12A8.25 8.25 0 1 0 6.17 6.17M12 7.5V12L15 13.5"/></g><g><path d="M6.17 1.67V6.17H10.67"/></g></g></g>'},home:{label:"Home",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 10.5L12 3.75L20.25 10.5V20.25H14.25V14.25H9.75V20.25H3.75Z"/></g></g></g>'},hourglass:{label:"Hourglass",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M6 2.25H18M6 21.75H18M7.5 2.25V6C7.5 8.5 12 10 12 12S7.5 15.5 7.5 18V21.75M16.5 2.25V6C16.5 8.5 12 10 12 12S16.5 15.5 16.5 18V21.75"/></g></g></g>'},humidity:{label:"Humidity",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 3C12 3 5.25 10.5 5.25 14.25A6.75 6.75 0 0 0 18.75 14.25C18.75 10.5 12 3 12 3Z"/></g><g><path d="M9.75 17.25L14.25 12"/><circle cx="10" cy="12.75" r="0.9" fill="currentColor" stroke="none"/><circle cx="14" cy="16.5" r="0.9" fill="currentColor" stroke="none"/></g></g></g>'},hurricane:{label:"Hurricane",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="12" r="2.25"/><path d="M14.25 4.5C10 3 5.25 6 5.25 12M9.75 19.5C14 21 18.75 18 18.75 12"/></g></g></g>'},"id-card":{label:"Id Card",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="2.25" y="4.5" width="19.5" height="15" rx="1.5"/><circle cx="8.25" cy="11.25" r="2.25"/><path d="M4.75 16.5C5.25 15 6.5 14.25 8.25 14.25S11.25 15 11.75 16.5M14.25 9.75H18.75M14.25 13.5H18.75"/></g></g></g>'},image:{label:"Image",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="3" y="4.5" width="18" height="15" rx="1.5"/><path d="M3 16.5L8.25 11.25L15 18M13.5 15L16.5 12L21 16.5"/></g><g><circle cx="15.75" cy="8.25" r="1.5"/></g></g></g>'},inbox:{label:"Inbox",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 13.5L6.25 5.25H17.75L20.25 13.5V19.5H3.75ZM3.75 13.5H8.25L9.75 15.75H14.25L15.75 13.5H20.25"/></g></g></g>'},indent:{label:"Indent",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 5.25H20.25M11.25 9.75H20.25M11.25 14.25H20.25M3.75 18.75H20.25"/></g><g><path d="M3.75 9L6.75 12L3.75 15"/></g></g></g>'},infinity:{label:"Infinity",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 12C9.75 9 8.25 8.25 6.375 8.25A3.75 3.75 0 0 0 6.375 15.75C8.25 15.75 9.75 15 12 12S15.75 8.25 17.625 8.25A3.75 3.75 0 0 1 17.625 15.75C15.75 15.75 14.25 15 12 12Z"/></g></g></g>'},info:{label:"Info",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="12" r="8.25"/><path d="M12 11.25V16.5"/><circle cx="12" cy="7.9" r="1" fill="currentColor" stroke="none"/></g></g></g>'},"irrigation-channel":{label:"Irrigation Channel",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M2.25 8.25H21.75M2.25 15.75H21.75"/></g><g><path d="M4.5 12C6 10.5 7.5 13.5 9 12S12 10.5 13.5 12S16.5 13.5 18 12S19.5 10.5 19.5 10.5"/></g></g></g>'},italic:{label:"Italic",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M10.5 4.5H18M6 19.5H13.5M14.25 4.5L9.75 19.5"/></g></g></g>'},kanban:{label:"Kanban",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="3.75" y="3.75" width="4.5" height="13.5" rx="1"/><rect x="9.75" y="3.75" width="4.5" height="9" rx="1"/><rect x="15.75" y="3.75" width="4.5" height="16.5" rx="1"/></g></g></g>'},key:{label:"Key",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="7.5" cy="12" r="3.75"/><path d="M11.25 12H20.25V15.75M16.5 12V15"/></g></g></g>'},keyboard:{label:"Keyboard",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="2.25" y="6" width="19.5" height="12" rx="1.5"/><path d="M8.25 14.5H15.75"/><circle cx="6" cy="9.75" r="0.9" fill="currentColor" stroke="none"/><circle cx="9" cy="9.75" r="0.9" fill="currentColor" stroke="none"/><circle cx="12" cy="9.75" r="0.9" fill="currentColor" stroke="none"/><circle cx="15" cy="9.75" r="0.9" fill="currentColor" stroke="none"/><circle cx="18" cy="9.75" r="0.9" fill="currentColor" stroke="none"/><circle cx="6" cy="14.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="18" cy="14.5" r="0.9" fill="currentColor" stroke="none"/></g></g></g>'},laptop:{label:"Laptop",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="4.5" y="4.5" width="15" height="10.5" rx="1"/><path d="M2.25 19.5H21.75L19.5 15H4.5Z"/></g></g></g>'},layers:{label:"Layers",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 3.75L21 8.25L12 12.75L3 8.25ZM3 12L12 16.5L21 12M3 15.75L12 20.25L21 15.75"/></g></g></g>'},layout:{label:"Layout",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="3" y="3.75" width="18" height="16.5" rx="1.5"/><path d="M3 9H21M9 9V20.25"/></g></g></g>'},lettuce:{label:"Lettuce",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="12" r="8.25"/><path d="M12 20.25C9 17.25 9 9 12 6C15 9 15 17.25 12 20.25ZM6 16.5C7.5 13.5 9 12.75 10.5 12.75M18 16.5C16.5 13.5 15 12.75 13.5 12.75"/></g></g></g>'},library:{label:"Library",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M4.5 3.75V20.25M9 3.75V20.25M13.5 4.5L18.75 19.5M3 20.25H21"/></g></g></g>'},lightbulb:{label:"Lightbulb",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M9 18V15.75C6.75 14.5 5.25 12.25 5.25 9.75A6.75 6.75 0 0 1 18.75 9.75C18.75 12.25 17.25 14.5 15 15.75V18ZM9.75 21H14.25"/></g><g><path d="M12 11.25V15.75"/></g></g></g>'},"line-chart":{label:"Line Chart",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 3.75V20.25H20.25"/></g><g><path d="M7.5 15L11.25 10.5L14.25 13.5L19.5 7.5"/></g></g></g>'},"link-alt":{label:"Link Alt",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M9 7.5H7.5A4.5 4.5 0 0 0 7.5 16.5H9M15 7.5H16.5A4.5 4.5 0 0 1 16.5 16.5H15M8.25 12H15.75"/></g></g></g>'},link:{label:"Link",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M10 14A4 4 0 0 0 15.66 14L18.83 10.83A4 4 0 0 0 13.17 5.17L11.75 6.6M14 10A4 4 0 0 0 8.34 10L5.17 13.17A4 4 0 0 0 10.83 18.83L12.25 17.4"/></g></g></g>'},"list-check":{label:"List Check",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M10.5 6.75H20.25M10.5 12H20.25M10.5 17.25H20.25"/></g><g><path d="M3.75 6.75L5.25 8.25L7.5 5.25M3.75 12L5.25 13.5L7.5 10.5M3.75 17.25L5.25 18.75L7.5 15.75"/></g></g></g>'},list:{label:"List",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M9 6.75H20.25M9 12H20.25M9 17.25H20.25"/><circle cx="4.9" cy="6.75" r="1" fill="currentColor" stroke="none"/><circle cx="4.9" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="4.9" cy="17.25" r="1" fill="currentColor" stroke="none"/></g></g></g>'},loader:{label:"Loader",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 17.25V21M3 12H6.75M17.25 12H21M5.6 5.6L8.3 8.3M15.7 15.7L18.4 18.4M5.6 18.4L8.3 15.7M15.7 8.3L18.4 5.6"/></g><g><path d="M12 3V6.75"/></g></g></g>'},lock:{label:"Lock",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="4.5" y="10.5" width="15" height="10.5" rx="1.5"/><path d="M7.5 10.5V7.5A4.5 4.5 0 0 1 16.5 7.5V10.5"/></g><g><path d="M12 14.25V17.25"/></g></g></g>'},login:{label:"Login",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M14.25 3.75H18.75A1.5 1.5 0 0 1 20.25 5.25V18.75A1.5 1.5 0 0 1 18.75 20.25H14.25"/></g><g><path d="M3.75 12H14.25M9.75 7.5L14.25 12L9.75 16.5"/></g></g></g>'},logout:{label:"Logout",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M9.75 20.25H5.25A1.5 1.5 0 0 1 3.75 18.75V5.25A1.5 1.5 0 0 1 5.25 3.75H9.75"/></g><g><path d="M9.75 12H20.25M15.75 7.5L20.25 12L15.75 16.5"/></g></g></g>'},magnet:{label:"Magnet",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M5.25 3.75V12A6.75 6.75 0 0 0 18.75 12V3.75H14.25V12A2.25 2.25 0 0 1 9.75 12V3.75Z"/></g><g><path d="M5.25 7.5H9.75M14.25 7.5H18.75"/></g></g></g>'},"mail-open":{label:"Mail Open",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3 9.75L12 3.75L21 9.75V19.5H3ZM3 9.75L12 15L21 9.75"/></g></g></g>'},mail:{label:"Mail",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="3" y="5.25" width="18" height="13.5" rx="1.5"/><path d="M3.75 6.75L12 13L20.25 6.75"/></g></g></g>'},"map-pin":{label:"Map Pin",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 21C12 21 5.25 14.75 5.25 9.75A6.75 6.75 0 0 1 18.75 9.75C18.75 14.75 12 21 12 21Z"/></g><g><circle cx="12" cy="9.75" r="2.25"/></g></g></g>'},map:{label:"Map",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M2.25 6L8.25 3.75L15.75 6.75L21.75 4.5V18L15.75 20.25L8.25 17.25L2.25 19.5ZM8.25 3.75V17.25M15.75 6.75V20.25"/></g></g></g>'},maximize:{label:"Maximize",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 9V3.75H9M15 3.75H20.25V9M20.25 15V20.25H15M9 20.25H3.75V15"/></g></g></g>'},medkit:{label:"Medkit",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="3" y="6.75" width="18" height="13.5" rx="1.5"/><path d="M8.25 6.75V4.5A.75.75 0 0 1 9 3.75H15A.75.75 0 0 1 15.75 4.5V6.75"/></g><g><path d="M12 10.5V16.5M9 13.5H15"/></g></g></g>'},megaphone:{label:"Megaphone",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 9.75H7.5L17.25 4.5V19.5L7.5 14.25H3.75ZM7.5 14.25L9 20.25H11.25L10.5 15.5"/></g><g><path d="M20.25 9.75V14.25"/></g></g></g>'},meh:{label:"Meh",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="12" r="8.25"/><path d="M8.25 15H15.75"/><circle cx="9" cy="9.75" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="9.75" r="1" fill="currentColor" stroke="none"/></g></g></g>'},memory:{label:"Memory",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="2.25" y="6.75" width="19.5" height="9.75" rx="1"/><path d="M6 16.5V19.5M10 16.5V19.5M14 16.5V19.5M18 16.5V19.5M6.75 9.75V13.5M11.25 9.75V13.5M15.75 9.75V13.5"/></g></g></g>'},menu:{label:"Menu",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 6.75H20.25M3.75 12H20.25M3.75 17.25H20.25"/></g></g></g>'},message:{label:"Message",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M4.5 4.5H19.5A1.5 1.5 0 0 1 21 6V15.75A1.5 1.5 0 0 1 19.5 17.25H9L4.5 20.25V17.25A1.5 1.5 0 0 1 3 15.75V6A1.5 1.5 0 0 1 4.5 4.5Z"/></g></g></g>'},messages:{label:"Messages",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M15.75 8.25H19.5A1.5 1.5 0 0 1 21 9.75V20.25L18 17.25H10.5A1.5 1.5 0 0 1 9 15.75V14.25M3 4.5A1.5 1.5 0 0 1 4.5 3H14.25A1.5 1.5 0 0 1 15.75 4.5V12.75A1.5 1.5 0 0 1 14.25 14.25H6L3 17.25Z"/></g></g></g>'},mic:{label:"Mic",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="9" y="2.25" width="6" height="11.25" rx="3"/><path d="M5.25 11.25A6.75 6.75 0 0 0 18.75 11.25M12 18V21.75M8.25 21.75H15.75"/></g></g></g>'},minimize:{label:"Minimize",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M9 3.75V9H3.75M15 3.75V9H20.25M20.25 15H15V20.25M3.75 15H9V20.25"/></g></g></g>'},"minus-circle":{label:"Minus Circle",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="12" r="8.25"/><path d="M8.25 12H15.75"/></g></g></g>'},"minus-square":{label:"Minus Square",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="3.75" y="3.75" width="16.5" height="16.5" rx="2"/><path d="M8.25 12H15.75"/></g></g></g>'},minus:{label:"Minus",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M4.5 12H19.5"/></g></g></g>'},monitor:{label:"Monitor",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="2.25" y="3.75" width="19.5" height="12.75" rx="1.5"/><path d="M8.25 20.25H15.75M12 16.5V20.25"/></g></g></g>'},moon:{label:"Moon",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M20 14.5A8.25 8.25 0 1 1 9.5 4A6.5 6.5 0 0 0 20 14.5Z"/></g></g></g>'},"more-vertical":{label:"More Vertical",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="5.25" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="18.75" r="1.5" fill="currentColor" stroke="none"/></g></g></g>'},more:{label:"More",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="5.25" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="18.75" cy="12" r="1.5" fill="currentColor" stroke="none"/></g></g></g>'},mountain:{label:"Mountain",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M2.25 19.5L9 7.5L13.5 15L16.5 10.5L21.75 19.5Z"/></g></g></g>'},mouse:{label:"Mouse",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="6.75" y="3" width="10.5" height="18" rx="5.25"/></g><g><path d="M12 6.75V9.75"/></g></g></g>'},"move-horizontal":{label:"Move Horizontal",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3 12H21"/></g><g><path d="M6.75 8.25L3 12L6.75 15.75M17.25 8.25L21 12L17.25 15.75"/></g></g></g>'},"move-vertical":{label:"Move Vertical",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 3V21"/></g><g><path d="M8.25 6.75L12 3L15.75 6.75M8.25 17.25L12 21L15.75 17.25"/></g></g></g>'},move:{label:"Move",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 3V21M3 12H21"/></g><g><path d="M9.75 5.25L12 3L14.25 5.25M9.75 18.75L12 21L14.25 18.75M5.25 9.75L3 12L5.25 14.25M18.75 9.75L21 12L18.75 14.25"/></g></g></g>'},music:{label:"Music",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M9 18V5.25L20.25 3V15.75"/><circle cx="6.75" cy="18" r="2.25"/><circle cx="18" cy="15.75" r="2.25"/></g></g></g>'},navigation:{label:"Navigation",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3 11.25L21 3L12.75 21L10.5 13.5Z"/></g></g></g>'},network:{label:"Network",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="5.25" r="2.25"/><circle cx="5.25" cy="18.75" r="2.25"/><circle cx="18.75" cy="18.75" r="2.25"/><path d="M12 7.5V12L6.9 17.1M12 12L17.1 17.1"/></g><g><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/></g></g></g>'},newspaper:{label:"Newspaper",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M4.5 20.25H18.75A2.25 2.25 0 0 0 21 18V3.75H6.75V18A2.25 2.25 0 0 1 4.5 20.25A2.25 2.25 0 0 1 2.25 18V8.25H6.75M10.5 7.5H17.25M10.5 11.25H17.25M10.5 15H14.25"/></g></g></g>'},night:{label:"Night",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M20 14.5A8.25 8.25 0 1 1 9.5 4A6.5 6.5 0 0 0 20 14.5Z"/></g><g><path d="M17.25 3V6.75M15.375 4.875H19.125"/></g></g></g>'},notebook:{label:"Notebook",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="5.25" y="2.25" width="14.25" height="19.5" rx="1.5"/><path d="M9 2.25V21.75M3 6.75H5.25M3 12H5.25M3 17.25H5.25"/></g></g></g>'},olive:{label:"Olive",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M4.5 19.5L19.5 4.5"/><ellipse cx="6.5" cy="13.5" rx="1.25" ry="3.25" transform="rotate(-45 6.5 13.5)"/><ellipse cx="17.5" cy="10.5" rx="1.25" ry="3.25" transform="rotate(-45 17.5 10.5)"/></g><g><ellipse cx="10.5" cy="9" rx="1.75" ry="2.25"/><ellipse cx="15" cy="15" rx="1.75" ry="2.25"/></g></g></g>'},onion:{label:"Onion",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 6C9 9 5.25 11.25 5.25 15A6.75 6.75 0 0 0 18.75 15C18.75 11.25 15 9 12 6ZM12 6C10.5 9 9.75 12 9.75 15.75S10.5 20.25 12 21.75"/></g><g><path d="M12 6V2.25"/></g></g></g>'},package:{label:"Package",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 2.75L20.25 7.25V16.75L12 21.25L3.75 16.75V7.25ZM3.75 7.25L12 11.75L20.25 7.25M12 11.75V21.25"/></g></g></g>'},palette:{label:"Palette",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 21A9 9 0 1 1 21 12C21 14.5 19 15.75 17 15.75H15A1.875 1.875 0 0 0 13.6 18.9C14 19.4 13.6 21 12 21Z"/><circle cx="7.5" cy="11.25" r="1.1" fill="currentColor" stroke="none"/><circle cx="9.75" cy="7.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="14.25" cy="7.5" r="1.1" fill="currentColor" stroke="none"/></g><g><circle cx="16.5" cy="11.25" r="1.1" fill="currentColor" stroke="none"/></g></g></g>'},"panel-bottom":{label:"Panel Bottom",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="3" y="3.75" width="18" height="16.5" rx="1.5"/><path d="M3 14.25H21"/></g></g></g>'},paperclip:{label:"Paperclip",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M19.5 11.25L12.1 18.65A4.5 4.5 0 0 1 5.73 12.28L13.13 4.88A3 3 0 0 1 17.37 9.12L10.2 16.3A1.5 1.5 0 0 1 8.07 14.18L14.7 7.55"/></g></g></g>'},pause:{label:"Pause",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M8.25 5.25V18.75M15.75 5.25V18.75"/></g></g></g>'},"pea-pod":{label:"Pea Pod",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 15C6.75 18.75 13.5 19.5 20.25 12C15 14.25 9 14.25 3.75 15ZM20.25 12L21.75 10.5"/></g><g><circle cx="8" cy="15.4" r="1.5"/><circle cx="11.75" cy="15.25" r="1.5"/><circle cx="15.5" cy="14.25" r="1.5"/></g></g></g>'},percent:{label:"Percent",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M18.75 5.25L5.25 18.75"/><circle cx="7" cy="7" r="2.25"/><circle cx="17" cy="17" r="2.25"/></g></g></g>'},"phone-call":{label:"Phone Call",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M6.75 3.75H9.75L11.25 7.5L9 9C10 11.25 12.75 14 15 15L16.5 12.75L20.25 14.25V17.25A3 3 0 0 1 17.25 20.25C9.75 20.25 3.75 14.25 3.75 6.75A3 3 0 0 1 6.75 3.75Z"/></g><g><path d="M14.25 3A6.75 6.75 0 0 1 21 9.75M14.25 6.375A3.375 3.375 0 0 1 17.625 9.75"/></g></g></g>'},phone:{label:"Phone",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M6.75 3.75H9.75L11.25 7.5L9 9C10 11.25 12.75 14 15 15L16.5 12.75L20.25 14.25V17.25A3 3 0 0 1 17.25 20.25C9.75 20.25 3.75 14.25 3.75 6.75A3 3 0 0 1 6.75 3.75Z"/></g></g></g>'},"pie-chart":{label:"Pie Chart",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M11.25 4.5A8.25 8.25 0 1 0 19.5 12.75H11.25Z"/></g><g><path d="M14.25 2.25V9.75H21.75A7.5 7.5 0 0 0 14.25 2.25Z"/></g></g></g>'},pill:{label:"Pill",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="3" y="8.25" width="18" height="7.5" rx="3.75" transform="rotate(-45 12 12)"/><path d="M9.35 9.35L14.65 14.65"/></g></g></g>'},plane:{label:"Plane",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M21 16.5V14.25L13.5 9.75V4.5A1.5 1.5 0 0 0 10.5 4.5V9.75L3 14.25V16.5L10.5 14.25V18.75L8.25 20.25V21.75L12 20.75L15.75 21.75V20.25L13.5 18.75V14.25Z"/></g></g></g>'},play:{label:"Play",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M7.5 4.5L19.5 12L7.5 19.5Z"/></g></g></g>'},plots:{label:"Plots",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M2.25 12L12 6.75L21.75 12L12 17.25ZM7.125 9.375L16.875 14.625M16.875 9.375L7.125 14.625"/></g></g></g>'},plug:{label:"Plug",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M9 2.25V6.75M15 2.25V6.75M6 6.75H18V10.5A6 6 0 0 1 6 10.5ZM12 16.5V21.75"/></g></g></g>'},"plus-circle":{label:"Plus Circle",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="12" r="8.25"/></g><g><path d="M12 8.25V15.75M8.25 12H15.75"/></g></g></g>'},"plus-square":{label:"Plus Square",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="3.75" y="3.75" width="16.5" height="16.5" rx="2"/></g><g><path d="M12 8.25V15.75M8.25 12H15.75"/></g></g></g>'},plus:{label:"Plus",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 4.5V19.5M4.5 12H19.5"/></g></g></g>'},pointer:{label:"Pointer",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M5.25 3.75L19.5 10.5L12.75 12.75L10.5 19.5Z"/></g><g><path d="M12.75 12.75L18.75 18.75"/></g></g></g>'},potato:{label:"Potato",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M6.75 6C9.5 3.75 15 3.75 18 6.75C21 9.75 20.25 15 17.25 18C14.25 21 8.25 20.25 5.25 17.25C3 15 3.75 8.25 6.75 6Z"/><circle cx="9" cy="9" r="0.9" fill="currentColor" stroke="none"/><circle cx="14.25" cy="8.25" r="0.9" fill="currentColor" stroke="none"/><circle cx="15" cy="14.25" r="0.9" fill="currentColor" stroke="none"/><circle cx="9.75" cy="15" r="0.9" fill="currentColor" stroke="none"/></g></g></g>'},"potted-plant":{label:"Potted Plant",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M6 13.5H18L16.5 21H7.5ZM12 13.5V8.25"/></g><g><path d="M12 10.5C12 7 9.75 4.5 6 4.5C6 8.25 8.25 10.5 12 10.5ZM12 8.25C12 5.5 13.75 3 17.25 3C17.25 6.25 15.5 8.25 12 8.25Z"/></g></g></g>'},power:{label:"Power",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M7.05 5.95A7.5 7.5 0 1 0 16.95 5.95"/></g><g><path d="M12 3V11.25"/></g></g></g>'},presentation:{label:"Presentation",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M2.25 3.75H21.75M3.75 3.75V15.75H20.25V3.75M12 15.75V18.75M8.25 21L12 18.75L15.75 21"/></g><g><path d="M7.5 12L10.5 9L12.75 11.25L16.5 7.5"/></g></g></g>'},printer:{label:"Printer",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M6.75 9V3.75H17.25V9M6.75 17.25H4.5A1.5 1.5 0 0 1 3 15.75V10.5A1.5 1.5 0 0 1 4.5 9H19.5A1.5 1.5 0 0 1 21 10.5V15.75A1.5 1.5 0 0 1 19.5 17.25H17.25"/><rect x="6.75" y="14.25" width="10.5" height="6"/></g></g></g>'},pumpkin:{label:"Pumpkin",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 7.5C6 7.5 3 10.5 3 14.25S6 21 12 21S21 18 21 14.25S18 7.5 12 7.5ZM12 7.5C9.75 9.75 9.75 18.75 12 21C14.25 18.75 14.25 9.75 12 7.5Z"/></g><g><path d="M12 7.5C12 5.25 12.75 3.75 14.25 3"/></g></g></g>'},pushpin:{label:"Pushpin",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M9 3.75H15M10.5 3.75V9L7.5 12.75H16.5L13.5 9V3.75M12 12.75V20.25"/></g></g></g>'},puzzle:{label:"Puzzle",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M4.5 7.5H9A2.25 2.25 0 1 1 13.5 7.5H18V12A2.25 2.25 0 1 1 18 16.5V20.25H4.5Z"/></g></g></g>'},"qr-code":{label:"Qr Code",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="3.75" y="3.75" width="6" height="6" rx="0.75"/><rect x="14.25" y="3.75" width="6" height="6" rx="0.75"/><rect x="3.75" y="14.25" width="6" height="6" rx="0.75"/><path d="M14.25 14.25V20.25M17.25 14.25H20.25M17.25 17.25V20.25H20.25"/></g></g></g>'},quote:{label:"Quote",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M4.5 11.25H9V17.25H4.5V11.25C4.5 8.25 5.75 6.75 8.25 6M15 11.25H19.5V17.25H15V11.25C15 8.25 16.25 6.75 18.75 6"/></g></g></g>'},radio:{label:"Radio",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="12" r="8.25"/></g><g><circle cx="12" cy="12" r="3.75" fill="currentColor" stroke="none"/></g></g></g>'},"rain-gauge":{label:"Rain Gauge",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M9 3.75V18.75A1.5 1.5 0 0 0 10.5 20.25H13.5A1.5 1.5 0 0 0 15 18.75V3.75M15 8.25H13.5M15 11.25H13.5M7.5 3.75H16.5"/></g><g><path d="M9 15H15"/></g></g></g>'},"rain-heavy":{label:"Rain Heavy",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M7 14.25A4 4 0 0 1 6.4 6.3A5.6 5.6 0 0 1 17.5 5.8A4.2 4.2 0 0 1 17.25 14.25Z"/></g><g><path d="M7.5 16.5L6.25 21M11.25 16.5L10 21M15 16.5L13.75 21M18.75 16.5L17.5 21"/></g></g></g>'},rainbow:{label:"Rainbow",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M2.25 18A9.75 9.75 0 0 1 21.75 18M5.25 18A6.75 6.75 0 0 1 18.75 18"/></g><g><path d="M8.25 18A3.75 3.75 0 0 1 15.75 18"/></g></g></g>'},"read-offcenter":{label:"Glasses",svg:'<g transform="translate(-0.25 0) scale(1.5)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><g transform="translate(16.9048 16.6916) scale(0.43)"><g fill="none"><g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><g><g transform="matrix(0.5814 0 0 0.5814 -14.5972 -14.5566)" fill="none" stroke="none" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1" fill-opacity="1" fill-rule="nonzero"><g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><g transform="translate(-1.1698 -3.5359) scale(0.9349)"><g transform="matrix(0.375 0 0 0.375 0 0)" fill="none" stroke="none" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1" fill-opacity="1" fill-rule="nonzero"><g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="6.75" cy="15" r="3.75"/><circle cx="17.25" cy="15" r="3.75"/><path d="M10.5 15C11.25 14.25 12.75 14.25 13.5 15M3 15L4.5 7.5M21 15L19.5 7.5"/></g></g></g></g></g></g></g></g></g></g></g></g></g></g></g></g></g></g>'},readwrite:{label:"Glasses",svg:'<g transform="translate(-0.25 0) scale(1.5)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><g transform="translate(16.9048 16.6916) scale(0.43)"><g fill="none"><g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><g><g transform="matrix(0.5814 0 0 0.5814 -14.5972 -14.5566)" fill="none" stroke="none" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1" fill-opacity="1" fill-rule="nonzero"><g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M15.75 4.5L19.5 8.25L8.25 19.5H4.5V15.75ZM13.5 6.75L17.25 10.5" transform="translate(6.6791 6.5853) scale(0.8496)"/><g transform="translate(-1.1698 -3.5359) scale(0.9349)"><g transform="matrix(0.375 0 0 0.375 0 0)" fill="none" stroke="none" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1" fill-opacity="1" fill-rule="nonzero"><g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="6.75" cy="15" r="3.75"/><circle cx="17.25" cy="15" r="3.75"/><path d="M10.5 15C11.25 14.25 12.75 14.25 13.5 15M3 15L4.5 7.5M21 15L19.5 7.5"/></g></g></g></g></g></g></g></g></g></g></g></g></g></g></g></g></g></g>'},readwrite_copy:{label:"Glasses",svg:'<g transform="translate(-0.25 0) scale(1.5)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><g transform="translate(16.9048 16.6916) scale(0.43)"><g fill="none"><g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><g><g transform="matrix(0.5814 0 0 0.5814 -14.5972 -14.5566)" fill="none" stroke="none" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1" fill-opacity="1" fill-rule="nonzero"><g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M15.75 4.5L19.5 8.25L8.25 19.5H4.5V15.75ZM13.5 6.75L17.25 10.5"/><g transform="translate(-1.1698 -3.5359) scale(0.9349)"><g transform="matrix(0.375 0 0 0.375 0 0)" fill="none" stroke="none" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" stroke-dasharray="none" stroke-opacity="1" fill-opacity="1" fill-rule="nonzero"><g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="6.75" cy="15" r="3.75"/><circle cx="17.25" cy="15" r="3.75"/><path d="M10.5 15C11.25 14.25 12.75 14.25 13.5 15M3 15L4.5 7.5M21 15L19.5 7.5"/></g></g></g></g></g></g></g></g></g></g></g></g></g></g></g></g></g></g>'},receipt:{label:"Receipt",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M5.25 3H18.75V21L16.5 19.5L14.25 21L12 19.5L9.75 21L7.5 19.5L5.25 21ZM8.25 7.5H15.75M8.25 11.25H15.75M8.25 15H12.75"/></g></g></g>'},redo:{label:"Redo",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M19.5 9.75H9.75A5.25 5.25 0 0 0 9.75 20.25H13.5"/></g><g><path d="M15 5.25L19.5 9.75L15 14.25"/></g></g></g>'},refresh:{label:"Refresh",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M19.5 12A7.5 7.5 0 1 1 17.3 6.7"/></g><g><path d="M17.3 2.2V6.7H12.8"/></g></g></g>'},repeat:{label:"Repeat",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 11.25V9.75A3 3 0 0 1 6.75 6.75H20.25M20.25 12.75V14.25A3 3 0 0 1 17.25 17.25H3.75"/></g><g><path d="M16.5 3L20.25 6.75L16.5 10.5M7.5 21L3.75 17.25L7.5 13.5"/></g></g></g>'},reply:{label:"Reply",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M4.5 12H14.25A5.25 5.25 0 0 1 19.5 17.25V18.75"/></g><g><path d="M9.75 6.75L4.5 12L9.75 17.25"/></g></g></g>'},rice:{label:"Rice",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M8.25 21.75C8.25 14.25 10.5 8.25 17.25 4.5"/><ellipse cx="12.75" cy="11.25" rx="1" ry="1.9" transform="rotate(30 12.75 11.25)"/><ellipse cx="15.25" cy="9" rx="1" ry="1.9" transform="rotate(30 15.25 9)"/><ellipse cx="18" cy="7.25" rx="1" ry="1.9" transform="rotate(40 18 7.25)"/><ellipse cx="10" cy="7.5" rx="1" ry="1.9" transform="rotate(-30 10 7.5)"/><ellipse cx="12.75" cy="5.25" rx="1" ry="1.9" transform="rotate(-20 12.75 5.25)"/></g></g></g>'},rocket:{label:"Rocket",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 2.25C15.75 4.5 17.25 8.25 17.25 12.75V17.25H6.75V12.75C6.75 8.25 8.25 4.5 12 2.25ZM6.75 12.75L3.75 15.75V19.5L6.75 17.25M17.25 12.75L20.25 15.75V19.5L17.25 17.25"/><circle cx="12" cy="9" r="1.75"/></g><g><path d="M10.5 20.25V21.75M13.5 20.25V21.75"/></g></g></g>'},roots:{label:"Roots",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3 9.75H21M12 9.75V20.25M12 12.75L8.25 16.5M12 14.25L15.75 18M8.25 16.5L6.75 19.5"/></g><g><path d="M12 9.75V6.75M12 6.75C12 4.75 13.5 3.5 16 3.5C16 5.5 14.5 6.75 12 6.75Z"/></g></g></g>'},route:{label:"Route",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="6" cy="18.75" r="2.25"/><circle cx="18" cy="5.25" r="2.25"/></g><g><path d="M8.25 18.75H15.75A3.375 3.375 0 0 0 15.75 12H8.25A3.375 3.375 0 0 1 8.25 5.25H15.75"/></g></g></g>'},router:{label:"Router",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="2.25" y="12.75" width="19.5" height="7.5" rx="1.5"/><path d="M12 12.75V9.75"/><circle cx="6" cy="16.5" r="1" fill="currentColor" stroke="none"/><circle cx="9" cy="16.5" r="1" fill="currentColor" stroke="none"/></g><g><path d="M9 8.25A4.24 4.24 0 0 1 15 8.25M6.75 5.25A7.4 7.4 0 0 1 17.25 5.25"/></g></g></g>'},rss:{label:"Rss",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M4.5 11.25A8.25 8.25 0 0 1 12.75 19.5M4.5 4.5A15 15 0 0 1 19.5 19.5"/></g><g><circle cx="5.25" cy="18.75" r="1.5" fill="currentColor" stroke="none"/></g></g></g>'},ruler:{label:"Ruler",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3 15.75L15.75 3L21 8.25L8.25 21ZM7.5 11.25L9.75 13.5M10.5 8.25L12.75 10.5M13.5 5.25L15.75 7.5"/></g></g></g>'},save:{label:"Save",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 3.75H16.5L20.25 7.5V20.25H3.75ZM7.5 3.75V8.25H15V3.75"/><rect x="7.5" y="13.5" width="9" height="6.75"/></g></g></g>'},scale:{label:"Scale",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 3.75V20.25M7.5 20.25H16.5M4.5 6.75H19.5M2.25 12.75L4.5 6.75L6.75 12.75A2.25 2.25 0 0 1 2.25 12.75ZM17.25 12.75L19.5 6.75L21.75 12.75A2.25 2.25 0 0 1 17.25 12.75Z"/></g></g></g>'},scan:{label:"Scan",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 8.25V3.75H8.25M15.75 3.75H20.25V8.25M20.25 15.75V20.25H15.75M8.25 20.25H3.75V15.75"/></g><g><path d="M3.75 12H20.25"/></g></g></g>'},"scatter-chart":{label:"Scatter Chart",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 3.75V20.25H20.25"/></g><g><circle cx="8.25" cy="15" r="1.25" fill="currentColor" stroke="none"/><circle cx="11.25" cy="10.5" r="1.25" fill="currentColor" stroke="none"/><circle cx="15" cy="13.5" r="1.25" fill="currentColor" stroke="none"/><circle cx="17.25" cy="7.5" r="1.25" fill="currentColor" stroke="none"/><circle cx="9" cy="6.75" r="1.25" fill="currentColor" stroke="none"/></g></g></g>'},scissors:{label:"Scissors",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="6.75" cy="6.75" r="2.75"/><circle cx="6.75" cy="17.25" r="2.75"/><path d="M9 8.5L20.25 18.75M9 15.5L20.25 5.25"/></g></g></g>'},"screen-share":{label:"Screen Share",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="2.25" y="3.75" width="19.5" height="12.75" rx="1.5"/><path d="M8.25 20.25H15.75M12 16.5V20.25"/></g><g><path d="M12 13.5V7.5M9.375 10.125L12 7.5L14.625 10.125"/></g></g></g>'},search:{label:"Search",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="10.5" cy="10.5" r="6.75"/><path d="M15.5 15.5L20.25 20.25"/></g></g></g>'},seed:{label:"Seed",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 20.25C7.5 20.25 5.25 16.5 5.25 12.75C5.25 8.25 8.25 4.5 12 3.75C15.75 4.5 18.75 8.25 18.75 12.75C18.75 16.5 16.5 20.25 12 20.25Z"/></g><g><path d="M12 16.5C12 12.75 13.5 10.5 15 9.5"/></g></g></g>'},send:{label:"Send",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M20.25 3.75L3.75 10.5L10.5 13.5L13.5 20.25ZM10.5 13.5L20.25 3.75"/></g></g></g>'},server:{label:"Server",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="3.75" y="3.75" width="16.5" height="7" rx="1.5"/><rect x="3.75" y="13.25" width="16.5" height="7" rx="1.5"/></g><g><circle cx="7.5" cy="7.25" r="1" fill="currentColor" stroke="none"/><circle cx="7.5" cy="16.75" r="1" fill="currentColor" stroke="none"/></g></g></g>'},settings:{label:"Settings",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M9.98 5.40L10.55 2.86L13.45 2.86L14.02 5.40L15.24 5.91L17.44 4.52L19.48 6.56L18.09 8.76L18.60 9.98L21.14 10.55L21.14 13.45L18.60 14.02L18.09 15.24L19.48 17.44L17.44 19.48L15.24 18.09L14.02 18.60L13.45 21.14L10.55 21.14L9.98 18.60L8.76 18.09L6.56 19.48L4.52 17.44L5.91 15.24L5.40 14.02L2.86 13.45L2.86 10.55L5.40 9.98L5.91 8.76L4.52 6.56L6.56 4.52L8.76 5.91Z"/><circle cx="12" cy="12" r="3"/></g></g></g>'},"share-up":{label:"Share Up",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M8.25 9H6A1.5 1.5 0 0 0 4.5 10.5V19.5A1.5 1.5 0 0 0 6 21H18A1.5 1.5 0 0 0 19.5 19.5V10.5A1.5 1.5 0 0 0 18 9H15.75"/></g><g><path d="M12 2.25V14.25M8.25 6L12 2.25L15.75 6"/></g></g></g>'},share:{label:"Share",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="18" cy="5.25" r="2.25"/><circle cx="6" cy="12" r="2.25"/><circle cx="18" cy="18.75" r="2.25"/><path d="M8 10.9L16 6.4M8 13.1L16 17.6"/></g></g></g>'},"shield-alert":{label:"Shield Alert",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 3L19.5 6V11.25C19.5 15.75 16.5 19.5 12 21C7.5 19.5 4.5 15.75 4.5 11.25V6Z"/></g><g><path d="M12 8.25V12.75"/><circle cx="12" cy="15.75" r="1" fill="currentColor" stroke="none"/></g></g></g>'},shield:{label:"Shield",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 3L19.5 6V11.25C19.5 15.75 16.5 19.5 12 21C7.5 19.5 4.5 15.75 4.5 11.25V6Z"/></g><g><path d="M9 12L11.25 14.25L15.25 10.25"/></g></g></g>'},shovel:{label:"Shovel",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 2.25V15M9.75 2.25H14.25M8.25 15H15.75V17.25A3.75 3.75 0 0 1 8.25 17.25Z"/></g></g></g>'},shrink:{label:"Shrink",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M13.5 4.5V10.5H19.5M10.5 19.5V13.5H4.5M13.5 10.5L20.25 3.75M10.5 13.5L3.75 20.25"/></g></g></g>'},shuffle:{label:"Shuffle",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3 6.75H6.75L17.25 17.25H21M3 17.25H6.75L9.75 14.25M14.25 9.75L17.25 6.75H21"/></g><g><path d="M18 3.75L21 6.75L18 9.75M18 14.25L21 17.25L18 20.25"/></g></g></g>'},sidebar:{label:"Sidebar",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="3" y="3.75" width="18" height="16.5" rx="1.5"/><path d="M9 3.75V20.25"/></g></g></g>'},sigma:{label:"Sigma",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M18 6.75V3.75H6L12.75 12L6 20.25H18V17.25"/></g></g></g>'},signal:{label:"Signal",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M5.25 19.5V16.5M9.75 19.5V12.75M14.25 19.5V9M18.75 19.5V4.5"/></g></g></g>'},signpost:{label:"Signpost",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 2.25V21.75M12 4.5H18.75L21 6.75L18.75 9H12M12 11.25H5.25L3 13.5L5.25 15.75H12M9 21.75H15"/></g></g></g>'},silo:{label:"Silo",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M6 21V7.5A4.5 4.5 0 0 1 15 7.5V21M15 12H19.5V21M3.75 21H21M6 11.25H15"/></g></g></g>'},"skip-back":{label:"Skip Back",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M18.75 5.25L9 12L18.75 18.75ZM5.25 5.25V18.75"/></g></g></g>'},"skip-forward":{label:"Skip Forward",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M5.25 5.25L15 12L5.25 18.75ZM18.75 5.25V18.75"/></g></g></g>'},sliders:{label:"Sliders",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 6.75H13.5M17.5 6.75H20.25M3.75 12H6.5M10.5 12H20.25M3.75 17.25H11.5M15.5 17.25H20.25"/></g><g><circle cx="15.5" cy="6.75" r="2"/><circle cx="8.5" cy="12" r="2"/><circle cx="13.5" cy="17.25" r="2"/></g></g></g>'},smartphone:{label:"Smartphone",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="6" y="2.25" width="12" height="19.5" rx="2"/><circle cx="12" cy="18" r="1" fill="currentColor" stroke="none"/></g></g></g>'},smile:{label:"Smile",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="12" r="8.25"/><path d="M8.25 14.25A4.5 4.5 0 0 0 15.75 14.25"/><circle cx="9" cy="9.75" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="9.75" r="1" fill="currentColor" stroke="none"/></g></g></g>'},snowflake:{label:"Snowflake",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 2.25V21.75M3.55 7.125L20.45 16.875M3.55 16.875L20.45 7.125M9.75 4.5L12 6.75L14.25 4.5M9.75 19.5L12 17.25L14.25 19.5"/></g></g></g>'},"soil-layers":{label:"Soil Layers",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3 6.75C6 5.25 9 8.25 12 6.75S18 5.25 21 6.75M3 11.25H21M3 15.75H21M3 20.25H21"/><circle cx="7.5" cy="13.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="15" cy="9" r="0.9" fill="currentColor" stroke="none"/><circle cx="10.5" cy="18" r="0.9" fill="currentColor" stroke="none"/><circle cx="17.25" cy="18" r="0.9" fill="currentColor" stroke="none"/></g></g></g>'},sort:{label:"Sort",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M7.5 4.5V19.5M3.75 8.25L7.5 4.5L11.25 8.25M16.5 19.5V4.5M12.75 15.75L16.5 19.5L20.25 15.75"/></g></g></g>'},soybean:{label:"Soybean",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M5.25 17.25C3.75 15.75 4.5 12.75 7.5 10.5L15 5.25C17.25 3.75 20.25 4.5 19.5 7.5C18.75 10.5 15 14.25 11.25 16.5C9 17.75 6.75 18.75 5.25 17.25ZM5.25 17.25L3 19.5"/></g><g><circle cx="8.5" cy="13.5" r="1.5"/><circle cx="12" cy="11" r="1.5"/><circle cx="15.5" cy="8.25" r="1.5"/></g></g></g>'},sparkles:{label:"Sparkles",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M11.25 3L12.75 9L18.75 10.5L12.75 12L11.25 18L9.75 12L3.75 10.5L9.75 9Z"/></g><g><path d="M18.75 15.75V20.25M16.5 18H21"/></g></g></g>'},split:{label:"Split",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 21V12L5.25 5.25M12 12L18.75 5.25"/></g><g><path d="M5.25 9.75V5.25H9.75M14.25 5.25H18.75V9.75"/></g></g></g>'},"sprinkler-impact":{label:"Sprinkler Impact",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 21V14.25M9 21H15"/><path d="M12 14.25V12L16.5 7.5"/></g><g><path d="M18 6L19.125 4.875M20.25 3.75L21 3"/><circle cx="18.75" cy="9" r="0.9" fill="currentColor" stroke="none"/><circle cx="20.25" cy="7.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="15.75" cy="5.25" r="0.9" fill="currentColor" stroke="none"/></g></g></g>'},"sprinkler-oscillating":{label:"Sprinkler Oscillating",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="4.5" y="18.75" width="15" height="2.25" rx="1"/><path d="M6.75 18.75V15.75A5.25 5.25 0 0 1 17.25 15.75V18.75"/></g><g><path d="M9 9L7.5 5.25M12 8.25V3.75M15 9L16.5 5.25"/></g></g></g>'},"sprinkler-popup":{label:"Sprinkler Popup",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3 18H21M12 18V21"/><rect x="10.5" y="12" width="3" height="6" rx="0.5"/></g><g><path d="M10.5 10.5L6.75 6.75M12 9.75V5.25M13.5 10.5L17.25 6.75"/><circle cx="5.25" cy="5.25" r="0.9" fill="currentColor" stroke="none"/><circle cx="12" cy="3.25" r="0.9" fill="currentColor" stroke="none"/><circle cx="18.75" cy="5.25" r="0.9" fill="currentColor" stroke="none"/></g></g></g>'},"sprinkler-rotor":{label:"Sprinkler Rotor",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 21V14.25M9 21H15"/><rect x="10.5" y="12" width="3" height="2.25" rx="0.5"/></g><g><circle cx="12.87" cy="7.83" r="0.9" fill="currentColor" stroke="none"/><circle cx="13.39" cy="4.87" r="0.9" fill="currentColor" stroke="none"/><circle cx="14.87" cy="8.65" r="0.9" fill="currentColor" stroke="none"/><circle cx="16.59" cy="6.2" r="0.9" fill="currentColor" stroke="none"/><circle cx="16.33" cy="10.25" r="0.9" fill="currentColor" stroke="none"/><circle cx="18.93" cy="8.75" r="0.9" fill="currentColor" stroke="none"/><circle cx="16.98" cy="12.31" r="0.9" fill="currentColor" stroke="none"/><circle cx="19.97" cy="12.05" r="0.9" fill="currentColor" stroke="none"/></g></g></g>'},"sprinkler-spray":{label:"Sprinkler Spray",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 21V14.25M9 21H15"/><circle cx="12" cy="12.75" r="1.5"/></g><g><path d="M8.5 12.75L5.5 12.75M9.53 10.28L7.4 8.15M12 9.25L12 6.25M14.47 10.28L16.6 8.15M15.5 12.75L18.5 12.75"/></g></g></g>'},sprinkler:{label:"Sprinkler",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 21V12M9 21H15"/></g><g><path d="M7.5 9A6.36 6.36 0 0 1 16.5 9M4.5 6A10.6 10.6 0 0 1 19.5 6"/></g></g></g>'},sprout:{label:"Sprout",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 21V11.25M6.75 21H17.25"/></g><g><path d="M12 13.5C12 9 9 6.75 4.5 6.75C4.5 11.25 7.5 13.5 12 13.5ZM12 11.25C12 7.5 14.5 4.5 19.5 4.5C19.5 9 16.5 11.25 12 11.25Z"/></g></g></g>'},star:{label:"Star",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12.00 3.75L14.35 9.51L20.56 9.97L15.80 13.99L17.29 20.03L12.00 16.75L6.71 20.03L8.20 13.99L3.44 9.97L9.65 9.51Z"/></g></g></g>'},"sticky-note":{label:"Sticky Note",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 3.75H20.25V14.25L14.25 20.25H3.75ZM14.25 20.25V14.25H20.25"/></g></g></g>'},stop:{label:"Stop",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="6" y="6" width="12" height="12" rx="1"/></g></g></g>'},store:{label:"Store",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 9.75V20.25H20.25V9.75M2.25 9.75L4.5 3.75H19.5L21.75 9.75ZM9.75 20.25V14.25H14.25V20.25"/></g></g></g>'},strawberry:{label:"Strawberry",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 21C7.5 18.75 4.5 14.25 4.5 10.5C4.5 8.25 6.75 7.5 12 7.5S19.5 8.25 19.5 10.5C19.5 14.25 16.5 18.75 12 21Z"/><circle cx="9" cy="11" r="0.75" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="0.75" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="0.75" fill="currentColor" stroke="none"/><circle cx="10.5" cy="15" r="0.75" fill="currentColor" stroke="none"/><circle cx="13.5" cy="15" r="0.75" fill="currentColor" stroke="none"/></g><g><path d="M12 7.5L9 4.5M12 7.5L15 4.5M12 7.5V3.75"/></g></g></g>'},sun:{label:"Sun",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="12" r="4"/><path d="M12 2.25V4.5M12 19.5V21.75M2.25 12H4.5M19.5 12H21.75M5.1 5.1L6.7 6.7M17.3 17.3L18.9 18.9M5.1 18.9L6.7 17.3M17.3 6.7L18.9 5.1"/></g></g></g>'},sunflower:{label:"Sunflower",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 2L13.72 4.09L16.42 3.83L16.16 6.53L18.25 8.25L16.16 9.97L16.42 12.67L13.72 12.41L12 14.5L10.28 12.41L7.58 12.67L7.84 9.97L5.75 8.25L7.84 6.53L7.58 3.83L10.28 4.09Z"/><path d="M12 14.5V21.75M12 18.75C13.5 16.5 16.5 15.75 18.75 16.5C17.25 18.75 14.25 19.5 12 18.75Z"/></g><g><circle cx="12" cy="8.25" r="2"/></g></g></g>'},sunrise:{label:"Sunrise",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M2.25 18H21.75M6.75 18A5.25 5.25 0 0 1 17.25 18M3.75 12L5.25 13.5M20.25 12L18.75 13.5M7.5 21H16.5"/></g><g><path d="M12 3V9M9 6L12 3L15 6"/></g></g></g>'},sunset:{label:"Sunset",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M2.25 18H21.75M6.75 18A5.25 5.25 0 0 1 17.25 18M3.75 12L5.25 13.5M20.25 12L18.75 13.5M7.5 21H16.5"/></g><g><path d="M12 9V3M9 6L12 9L15 6"/></g></g></g>'},table:{label:"Table",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="3.75" y="4.5" width="16.5" height="15" rx="1.5"/><path d="M3.75 9.5H20.25M3.75 14.5H20.25M9.75 4.5V19.5"/></g></g></g>'},tablet:{label:"Tablet",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="4.5" y="2.25" width="15" height="19.5" rx="2"/><circle cx="12" cy="18" r="1" fill="currentColor" stroke="none"/></g></g></g>'},tag:{label:"Tag",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 3.75H11.25L20.25 12.75L12.75 20.25L3.75 11.25Z"/></g><g><circle cx="8.25" cy="8.25" r="1.5" fill="currentColor" stroke="none"/></g></g></g>'},tap:{label:"Tap",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3 5.25V14.25M3 8.25H15A4.5 4.5 0 0 1 19.5 12.75V14.25H16.5V13.5A2.25 2.25 0 0 0 14.25 11.25H3M9 8.25V4.5M6 4.5H12"/></g><g><path d="M18 17.25C18 17.25 16.5 19 16.5 20.1A1.5 1.5 0 0 0 19.5 20.1C19.5 19 18 17.25 18 17.25Z"/></g></g></g>'},target:{label:"Target",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="12" r="8.25"/><circle cx="12" cy="12" r="4.5"/></g><g><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/></g></g></g>'},"temp-drop":{label:"Temp Drop",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M7.5 14.1V4.5A2.25 2.25 0 0 1 12 4.5V14.1A4 4 0 1 1 7.5 14.1Z"/></g><g><path d="M9.75 14.25V17.25M18 6V11.25M16.125 9.375L18 11.25L19.875 9.375"/><circle cx="9.75" cy="17.25" r="1.75" fill="currentColor" stroke="none"/></g></g></g>'},"temp-rise":{label:"Temp Rise",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M7.5 14.1V4.5A2.25 2.25 0 0 1 12 4.5V14.1A4 4 0 1 1 7.5 14.1Z"/></g><g><path d="M9.75 8.25V17.25M18 11.25V6M16.125 7.875L18 6L19.875 7.875"/><circle cx="9.75" cy="17.25" r="1.75" fill="currentColor" stroke="none"/></g></g></g>'},terminal:{label:"Terminal",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="3" y="4.5" width="18" height="15" rx="1.5"/><path d="M7 9.5L10 12L7 14.5"/></g><g><path d="M12.5 15H17"/></g></g></g>'},"test-tube":{label:"Test Tube",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M9 3H15M9.75 3V17.25A2.25 2.25 0 0 0 14.25 17.25V3"/></g><g><path d="M9.75 12H14.25"/></g></g></g>'},thermometer:{label:"Thermometer",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M9.75 14.1V4.5A2.25 2.25 0 0 1 14.25 4.5V14.1A4 4 0 1 1 9.75 14.1Z"/></g><g><path d="M12 8.25V17.25"/><circle cx="12" cy="17.25" r="1.75" fill="currentColor" stroke="none"/></g></g></g>'},"thumbs-down":{label:"Thumbs Down",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><g transform="matrix(1 0 0 -1 0 24)"><path d="M7.5 10.5V20.25H4.5A.75.75 0 0 1 3.75 19.5V11.25A.75.75 0 0 1 4.5 10.5ZM7.5 10.5L11.25 3.75A2.25 2.25 0 0 1 13.5 6V9H18.9A1.5 1.5 0 0 1 20.4 10.8L19 18.75A1.5 1.5 0 0 1 17.5 20.25H7.5"/></g></g></g></g>'},"thumbs-up":{label:"Thumbs Up",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M7.5 10.5V20.25H4.5A.75.75 0 0 1 3.75 19.5V11.25A.75.75 0 0 1 4.5 10.5ZM7.5 10.5L11.25 3.75A2.25 2.25 0 0 1 13.5 6V9H18.9A1.5 1.5 0 0 1 20.4 10.8L19 18.75A1.5 1.5 0 0 1 17.5 20.25H7.5"/></g></g></g>'},ticket:{label:"Ticket",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H19.5A1.5 1.5 0 0 1 21 7.5V9.75A2.25 2.25 0 0 0 21 14.25V16.5A1.5 1.5 0 0 1 19.5 18H4.5A1.5 1.5 0 0 1 3 16.5V14.25A2.25 2.25 0 0 0 3 9.75ZM14.25 6V8.25M14.25 11.25V12.75M14.25 15.75V18"/></g></g></g>'},timer:{label:"Timer",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="13.5" r="7.5"/><path d="M9.75 2.25H14.25M12 2.25V6"/></g><g><path d="M12 13.5V9.75"/></g></g></g>'},toggle:{label:"Toggle",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="2.25" y="6.75" width="19.5" height="10.5" rx="5.25"/></g><g><circle cx="16.5" cy="12" r="3" fill="currentColor" stroke="none"/></g></g></g>'},tomato:{label:"Tomato",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="13.5" r="7.5"/></g><g><path d="M12 6L10.5 3.75M12 6L8.75 7.5M12 6L15.25 7.5M12 6L13.5 3.75"/></g></g></g>'},toolbox:{label:"Toolbox",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="2.25" y="8.25" width="19.5" height="11.25" rx="1.5"/><path d="M8.25 8.25V5.25H15.75V8.25M2.25 13.5H21.75M10.5 12V15H13.5V12"/></g></g></g>'},tornado:{label:"Tornado",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3 4.5H21M5.25 8.25H18M7.5 12H15.75M9 15.75H14.25M11.25 19.5H13.5"/></g></g></g>'},tractor:{label:"Tractor",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="7.5" cy="16.5" r="3.75"/><circle cx="18" cy="18" r="2.25"/><path d="M4.5 13.5V4.5H10.5L12 12.75H19.5L21 14.25V16.5M11.25 16.5H15.75M17.25 12.75V9"/></g><g><circle cx="7.5" cy="16.5" r="1" fill="currentColor" stroke="none"/></g></g></g>'},trash:{label:"Trash",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 6.75H20.25M9 6.75V4.5H15V6.75M5.75 6.75L6.75 20.25H17.25L18.25 6.75M10 10.5V16.5M14 10.5V16.5"/></g></g></g>'},tree:{label:"Tree",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="9" r="6"/><path d="M12 15V21M8.25 21H15.75M12 17.25L9.75 15"/></g></g></g>'},"trending-down":{label:"Trending Down",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M2.25 6L9 12.75L12.75 9L21 17.25"/></g><g><path d="M15.75 17.25H21V12"/></g></g></g>'},"trending-up":{label:"Trending Up",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M2.25 18L9 11.25L12.75 15L21 6.75"/></g><g><path d="M15.75 6.75H21V12"/></g></g></g>'},triangle:{label:"Triangle",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 3.75L21 19.5H3Z"/></g></g></g>'},trophy:{label:"Trophy",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M7.5 3.75H16.5V9.75A4.5 4.5 0 0 1 7.5 9.75ZM7.5 5.25H4.5V6.75A3 3 0 0 0 7.5 9.75M16.5 5.25H19.5V6.75A3 3 0 0 1 16.5 9.75M12 14.25V18M8.25 20.25H15.75"/></g></g></g>'},truck:{label:"Truck",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M2.25 5.25H14.25V16.5H9M4.5 16.5H2.25V5.25M14.25 9H18.75L21.75 12.75V16.5H19.5M14.25 16.5H15"/><circle cx="6.75" cy="17.25" r="2.25"/><circle cx="17.25" cy="17.25" r="2.25"/></g></g></g>'},tv:{label:"Tv",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="2.25" y="6.75" width="19.5" height="13.5" rx="1.5"/><path d="M7.5 2.25L12 6.75L16.5 2.25"/></g></g></g>'},type:{label:"Type",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M4.5 6.75V4.5H19.5V6.75M12 4.5V19.5M9 19.5H15"/></g></g></g>'},umbrella:{label:"Umbrella",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M2.25 12A9.75 9.75 0 0 1 21.75 12ZM12 12V18.75A2.25 2.25 0 0 1 7.5 18.75"/></g></g></g>'},underline:{label:"Underline",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M6.75 3.75V10.5A5.25 5.25 0 0 0 17.25 10.5V3.75M4.5 20.25H19.5"/></g></g></g>'},undo:{label:"Undo",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M4.5 9.75H14.25A5.25 5.25 0 0 1 14.25 20.25H10.5"/></g><g><path d="M9 5.25L4.5 9.75L9 14.25"/></g></g></g>'},unlock:{label:"Unlock",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="4.5" y="10.5" width="15" height="10.5" rx="1.5"/><path d="M7.5 10.5V7.5A4.5 4.5 0 0 1 16.2 5.9"/></g><g><path d="M12 14.25V17.25"/></g></g></g>'},upload:{label:"Upload",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 15.75V20.25H20.25V15.75"/></g><g><path d="M12 15V3.75M7.5 8.25L12 3.75L16.5 8.25"/></g></g></g>'},"user-check":{label:"User Check",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="9.75" cy="8.25" r="3.75"/><path d="M2.25 20.25C2.25 16.5 5.65 14.25 9.75 14.25S17.25 16.5 17.25 20.25"/></g><g><path d="M16.5 10L18.25 11.75L21.5 8.5"/></g></g></g>'},"user-circle":{label:"User Circle",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="12" r="8.25"/><circle cx="12" cy="9.75" r="3"/><path d="M6.2 17.9C7.3 16 9.5 15 12 15S16.7 16 17.8 17.9"/></g></g></g>'},"user-minus":{label:"User Minus",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="9.75" cy="8.25" r="3.75"/><path d="M2.25 20.25C2.25 16.5 5.65 14.25 9.75 14.25S17.25 16.5 17.25 20.25"/></g><g><path d="M16.75 10H21.25"/></g></g></g>'},"user-plus":{label:"User Plus",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="9.75" cy="8.25" r="3.75"/><path d="M2.25 20.25C2.25 16.5 5.65 14.25 9.75 14.25S17.25 16.5 17.25 20.25"/></g><g><path d="M19 7.75V12.25M16.75 10H21.25"/></g></g></g>'},"user-x":{label:"User X",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="9.75" cy="8.25" r="3.75"/><path d="M2.25 20.25C2.25 16.5 5.65 14.25 9.75 14.25S17.25 16.5 17.25 20.25"/><path d="M17.25 8.25L21 12M21 8.25L17.25 12"/></g></g></g>'},user:{label:"User",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="8.25" r="3.75"/><path d="M4.5 20.25C4.5 16.5 7.9 14.25 12 14.25S19.5 16.5 19.5 20.25"/></g></g></g>'},users:{label:"Users",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="9" cy="8.25" r="3.25"/><path d="M2.75 19.5C2.75 16.25 5.5 14.25 9 14.25S15.25 16.25 15.25 19.5M15.5 5.25A3.25 3.25 0 0 1 15.5 11.25M17.5 14.5C19.75 15 21.25 16.75 21.25 19.5"/></g></g></g>'},valve:{label:"Valve",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M2.25 13.5H9M15 13.5H21.75M2.25 18.75H9M15 18.75H21.75"/><rect x="9" y="11.25" width="6" height="9.75" rx="1"/><path d="M12 11.25V6"/></g><g><path d="M8.25 6H15.75"/></g></g></g>'},verified:{label:"Verified",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 3L14.91 4.98L18.36 5.64L19.02 9.09L21 12L19.02 14.91L18.36 18.36L14.91 19.02L12 21L9.09 19.02L5.64 18.36L4.98 14.91L3 12L4.98 9.09L5.64 5.64L9.09 4.98Z"/></g><g><path d="M8.25 12.25L10.75 14.75L15.75 9.5"/></g></g></g>'},video:{label:"Video",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="2.25" y="6" width="13.5" height="12" rx="1.5"/></g><g><path d="M15.75 10.5L21.75 6.75V17.25L15.75 13.5Z"/></g></g></g>'},"volume-off":{label:"Volume Off",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 9H7.5L12 4.5V19.5L7.5 15H3.75Z"/><path d="M16 9.5L21 14.5M21 9.5L16 14.5"/></g></g></g>'},volume:{label:"Volume",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 9H7.5L12 4.5V19.5L7.5 15H3.75Z"/></g><g><path d="M15.5 8.5A5 5 0 0 1 15.5 15.5M18.25 5.75A9 9 0 0 1 18.25 18.25"/></g></g></g>'},wallet:{label:"Wallet",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3 6.75V18A1.5 1.5 0 0 0 4.5 19.5H21V8.25H4.5A1.5 1.5 0 0 1 3 6.75A1.5 1.5 0 0 1 4.5 5.25H18.75V8.25"/></g><g><circle cx="16.5" cy="13.875" r="1.25" fill="currentColor" stroke="none"/></g></g></g>'},wand:{label:"Wand",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3.75 20.25L16.5 7.5M13.5 7.5L16.5 10.5"/></g><g><path d="M17.25 2.25V5.25M15.75 3.75H18.75M20.25 9V12M18.75 10.5H21.75"/></g></g></g>'},warehouse:{label:"Warehouse",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M2.25 20.25V8.25L12 3.75L21.75 8.25V20.25M6 20.25V11.25H18V20.25M6 14.25H18M6 17.25H18"/></g></g></g>'},watch:{label:"Watch",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="6" y="6" width="12" height="12" rx="3"/><path d="M8.25 6L9 2.25H15L15.75 6M8.25 18L9 21.75H15L15.75 18"/></g><g><path d="M12 9.75V12L13.5 13.5"/></g></g></g>'},"water-tank":{label:"Water Tank",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M5.25 6.75L12 3L18.75 6.75ZM7.5 17.25L6 21.75M16.5 17.25L18 21.75M6.75 19.5H17.25"/><rect x="5.25" y="6.75" width="13.5" height="10.5"/></g><g><path d="M5.25 12H18.75"/></g></g></g>'},"watering-can":{label:"Watering Can",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M4.5 9.75H15V19.5H4.5ZM15 12.75L20.25 7.5M7.5 9.75V7.5A2.25 2.25 0 0 1 9.75 5.25H10.5A2.25 2.25 0 0 1 12.75 7.5V9.75"/></g><g><circle cx="21" cy="10.75" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12.25" r="1" fill="currentColor" stroke="none"/></g></g></g>'},weight:{label:"Weight",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M9 6.75A3 3 0 0 1 15 6.75M6.75 8.25H17.25L20.25 20.25H3.75Z"/></g></g></g>'},wheat:{label:"Wheat",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M12 21.25V6"/><path d="M12 6C10.75 4.75 10.75 3.25 12 2C13.25 3.25 13.25 4.75 12 6Z"/><path d="M12 11C9.5 11 8.25 9.25 8.25 7C10.5 7 12 8.75 12 11Z"/><path d="M12 11C14.5 11 15.75 9.25 15.75 7C13.5 7 12 8.75 12 11Z"/><path d="M12 14.5C9.5 14.5 8.25 12.75 8.25 10.5C10.5 10.5 12 12.25 12 14.5Z"/><path d="M12 14.5C14.5 14.5 15.75 12.75 15.75 10.5C13.5 10.5 12 12.25 12 14.5Z"/><path d="M12 18C9.5 18 8.25 16.25 8.25 14C10.5 14 12 15.75 12 18Z"/><path d="M12 18C14.5 18 15.75 16.25 15.75 14C13.5 14 12 15.75 12 18Z"/></g></g></g>'},"wifi-off":{label:"Wifi Off",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M2.25 8.75A14 14 0 0 1 21.75 8.75M5.25 12A9.5 9.5 0 0 1 18.75 12M8.25 15.25A5 5 0 0 1 15.75 15.25M3.75 3.75L20.25 20.25"/><circle cx="12" cy="18.75" r="1.25" fill="currentColor" stroke="none"/></g></g></g>'},wifi:{label:"Wifi",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M2.25 8.75A14 14 0 0 1 21.75 8.75M5.25 12A9.5 9.5 0 0 1 18.75 12M8.25 15.25A5 5 0 0 1 15.75 15.25"/></g><g><circle cx="12" cy="18.75" r="1.25" fill="currentColor" stroke="none"/></g></g></g>'},wind:{label:"Wind",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M3 8.25H13.5A2.625 2.625 0 1 0 10.875 5.625M3 15.75H16.5A2.625 2.625 0 1 1 13.875 18.375M3 12H18.75A2.25 2.25 0 1 0 16.5 9.75"/></g></g></g>'},windsock:{label:"Windsock",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M4.5 21.75V2.25M4.5 4.5L20.25 6.75V11.25L4.5 13.5"/></g><g><path d="M9.75 5.25V12.75M15 6V12"/></g></g></g>'},workflow:{label:"Workflow",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="3" y="3" width="6.75" height="6.75" rx="1"/><rect x="14.25" y="14.25" width="6.75" height="6.75" rx="1"/></g><g><path d="M6.375 9.75V14.25A3 3 0 0 0 9.375 17.25H14.25"/></g></g></g>'},"x-circle":{label:"X Circle",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="12" cy="12" r="8.25"/><path d="M9 9L15 15M15 9L9 15"/></g></g></g>'},"x-square":{label:"X Square",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><rect x="3.75" y="3.75" width="16.5" height="16.5" rx="2"/><path d="M9 9L15 15M15 9L9 15"/></g></g></g>'},zap:{label:"Zap",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M13.5 2.75L4.5 13.5H12L10.5 21.25L19.5 10.5H12Z"/></g></g></g>'},"zoom-in":{label:"Zoom In",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="10.5" cy="10.5" r="6.75"/><path d="M15.5 15.5L20.25 20.25"/></g><g><path d="M10.5 7.5V13.5M7.5 10.5H13.5"/></g></g></g>'},"zoom-out":{label:"Zoom Out",svg:'<g transform="translate(0 0) scale(2.666667)"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g><circle cx="10.5" cy="10.5" r="6.75"/><path d="M15.5 15.5L20.25 20.25"/></g><g><path d="M7.5 10.5H13.5"/></g></g></g>'}},Ot={monitor_curved_34:{w:84,h:20,svg:'<path d="M29,8.6 L29,5 Q29,2 32,2 L52,2 Q55,2 55,5 L55,8.6"/><rect x="38.5" y="0.8" width="7" height="3" rx="1.2"/><path d="M2,18.85 A100,100 0 0 1 82,18.85 L82,16.13 A102.5,102.5 0 0 0 2,16.13 Z"/><path d="M4,17.3 A100.6,100.6 0 0 1 80,17.3" class="thin"/>'},record_player:{w:45,h:36,svg:'<rect x="0.6" y="0.6" width="43.8" height="34.8" rx="2.5"/><circle cx="17" cy="18" r="14.5"/><circle cx="17" cy="18" r="12" class="thin"/><circle cx="17" cy="18" r="9" class="thin"/><circle cx="17" cy="18" r="4"/><circle cx="17" cy="18" r="0.7" class="dot"/><rect x="35" y="1.6" width="4" height="2.4" rx="0.8"/><circle cx="37" cy="7" r="2.6"/><circle cx="37" cy="7" r="0.9"/><path d="M37,9.6 L36.2,24 Q36,26.5 33.5,27.6 L30.6,28.9"/><rect x="27.6" y="28" width="3.4" height="2.2" rx="0.6" transform="rotate(-25 29.3 29.1)"/><circle cx="40.5" cy="22" r="0.9"/><circle cx="4.5" cy="31.5" r="1.6"/><rect x="7.6" y="30.6" width="3.4" height="1.8" rx="0.9"/>'},sonos_one:{w:12,h:12,svg:'<rect x="0.3" y="0.3" width="11.4" height="11.4" rx="3.6"/><circle cx="6" cy="6.6" r="1.3"/><path d="M2.6,6.6 H3.8 M8.2,6.6 H9.4 M8.8,6 V7.2"/><circle cx="6" cy="3.2" r="0.45" class="dot"/>'},sonos_era_100:{w:12,h:13,svg:'<rect x="0.3" y="0.3" width="11.4" height="12.4" rx="4"/><circle cx="6" cy="5.2" r="1.2"/><path d="M3.8,4.6 L3.2,5.2 L3.8,5.8 M8.2,4.6 L8.8,5.2 L8.2,5.8"/><rect x="3" y="8.1" width="6" height="1" rx="0.5" class="thin"/><circle cx="6" cy="2.4" r="0.35" class="dot"/>'},sonos_beam:{w:65.1,h:10,svg:'<rect x="0.35" y="0.35" width="64.4" height="9.3" rx="4.6"/><circle cx="32.55" cy="5" r="1.3"/><path d="M28.4,5 H29.8 M35.3,5 H36.7 M36,4.3 V5.7"/><circle cx="32.55" cy="2" r="0.35" class="dot"/><path d="M6,8 H59.1" class="thin dash"/>'},sonos_ray:{w:55.9,h:9.5,svg:'<rect x="0.35" y="0.35" width="55.2" height="8.8" rx="2"/><circle cx="27.95" cy="4.6" r="1.2"/><path d="M23.9,4.6 H25.3 M30.6,4.6 H32 M31.3,3.9 V5.3"/><circle cx="27.95" cy="1.9" r="0.35" class="dot"/><path d="M4,7.6 H51.9" class="thin dash"/>'},sonos_roam:{w:6.2,h:6,svg:'<path d="M2.4,1 Q3.1,-0.1 3.8,1 L5.6,4.6 Q6.1,5.6 5,5.6 L1.2,5.6 Q0.1,5.6 0.6,4.6 Z"/><circle cx="3.1" cy="3.7" r="0.6"/>'},tv_wall_43:{w:96.5,h:6,svg:'<rect x="28.95" y="0.4" width="38.60" height="2.2" rx="0.4" class="thin"/><rect x="0.4" y="2.6" width="95.70" height="3" rx="1"/><path d="M2.2,4.7 H94.30" class="thin"/>'},tv_wall_50:{w:112,h:6,svg:'<rect x="33.60" y="0.4" width="44.80" height="2.2" rx="0.4" class="thin"/><rect x="0.4" y="2.6" width="111.20" height="3" rx="1"/><path d="M2.2,4.7 H109.80" class="thin"/>'},tv_wall_55:{w:123,h:6,svg:'<rect x="36.90" y="0.4" width="49.20" height="2.2" rx="0.4" class="thin"/><rect x="0.4" y="2.6" width="122.20" height="3" rx="1"/><path d="M2.2,4.7 H120.80" class="thin"/>'},tv_wall_65:{w:145,h:6,svg:'<rect x="43.50" y="0.4" width="58.00" height="2.2" rx="0.4" class="thin"/><rect x="0.4" y="2.6" width="144.20" height="3" rx="1"/><path d="M2.2,4.7 H142.80" class="thin"/>'},tv_wall_75:{w:168,h:6,svg:'<rect x="54.00" y="0.4" width="60.00" height="2.2" rx="0.4" class="thin"/><rect x="0.4" y="2.6" width="167.20" height="3" rx="1"/><path d="M2.2,4.7 H165.80" class="thin"/>'},tv_wall_85:{w:190,h:6,svg:'<rect x="65.00" y="0.4" width="60.00" height="2.2" rx="0.4" class="thin"/><rect x="0.4" y="2.6" width="189.20" height="3" rx="1"/><path d="M2.2,4.7 H187.80" class="thin"/>'},snowblower_single:{w:56,h:132,svg:'<path d="M4,9 Q28,1 52,9 L54,30 Q54,38 46,38 L10,38 Q2,38 2,30 Z"/><path d="M7,12 Q28,5 49,12" class="thin"/><path d="M7,22 Q28,16 49,22" class="thin"/><circle cx="28" cy="30" r="4.5"/><path d="M25.3,26.5 L24.6,15 Q28,12.6 31.4,15 L30.7,26.5"/><path d="M24.6,15 Q28,11.4 31.4,15" class="thick"/><path d="M14,38 H42 Q46,38 46,44 V70 Q46,78 38,78 H18 Q10,78 10,70 V44 Q10,38 14,38 Z"/><circle cx="20" cy="50" r="2.6"/><path d="M16,66 H40 M16,70 H40" class="thin"/><rect x="3" y="54" width="7" height="20" rx="3"/><rect x="46" y="54" width="7" height="20" rx="3"/><path d="M15,77 V118 Q15,128 25,128 H31 Q41,128 41,118 V77"/><path d="M15,110 Q15,124 22,127 M41,110 Q41,124 34,127" class="thick"/><path d="M15,104 Q28,110 41,104" class="thin"/>'},snowblower_two:{w:70,h:150,svg:'<path d="M4,7 Q35,1 66,7 L68,30 Q68,36 62,36 H8 Q2,36 2,30 Z"/><path d="M7,10 Q35,4 63,10" class="thin"/><path d="M24,36 Q24,52 35,52 Q46,52 46,36"/><circle cx="35" cy="42" r="5.5"/><path d="M31.8,38 L30.8,18 Q35,15.2 39.2,18 L38.2,38"/><path d="M30.8,18 Q35,13.6 39.2,18" class="thick"/><rect x="17" y="50" width="36" height="42" rx="6"/><circle cx="26" cy="61" r="2.8"/><path d="M22,82 H48 M22,86 H48" class="thin"/><rect x="1" y="56" width="14" height="34" rx="5"/><rect x="55" y="56" width="14" height="34" rx="5"/><path d="M3,62 H13 M3,68 H13 M3,74 H13 M3,80 H13 M3,86 H13 M57,62 H67 M57,68 H67 M57,74 H67 M57,80 H67 M57,86 H67" class="thin"/><rect x="16" y="92" width="38" height="12" rx="3"/><circle cx="25" cy="98" r="1.6"/><circle cx="35" cy="98" r="1.6"/><circle cx="45" cy="98" r="1.6"/><path d="M19,104 V136 Q19,147 30,147 H40 Q51,147 51,136 V104"/><path d="M19,128 Q19,143 27,146 M51,128 Q51,143 43,146" class="thick"/><path d="M19,122 Q27,127 34,122 M36,122 Q43,127 51,122" class="thin"/>'},mower_push_30:{w:86,h:170,svg:'<path d="M10,4 Q43,-1 76,4 Q84,6 84,16 V72 Q84,84 72,86 H14 Q2,84 2,72 V16 Q2,6 10,4 Z"/><circle cx="43" cy="44" r="31" class="thin"/><rect x="0" y="7" width="6" height="20" rx="2.5"/><rect x="80" y="7" width="6" height="20" rx="2.5"/><rect x="0" y="57" width="7" height="26" rx="3"/><rect x="79" y="57" width="7" height="26" rx="3"/><rect x="27" y="26" width="32" height="34" rx="8"/><circle cx="43" cy="43" r="9"/><circle cx="43" cy="43" r="3"/><circle cx="55" cy="31" r="2.5"/><rect x="20" y="86" width="46" height="38" rx="8"/><path d="M26,94 H60 M26,102 H60 M26,110 H60 M26,118 H60" class="thin"/><path d="M15,82 V166 M71,82 V166 M15,166 H71"/><path d="M15,134 H71" class="thin"/><path d="M15,154 Q43,160 71,154" class="thin"/>'},lawn_tractor:{w:112,h:183,svg:'<rect x="2" y="62" width="108" height="60" rx="26" class="thin dash"/><rect x="16" y="14" width="12" height="26" rx="4"/><rect x="84" y="14" width="12" height="26" rx="4"/><rect x="6" y="116" width="20" height="46" rx="6"/><rect x="86" y="116" width="20" height="46" rx="6"/><rect x="30" y="4" width="52" height="62" rx="14"/><path d="M38,12 H74" class="thin"/><rect x="28" y="66" width="56" height="94" rx="8"/><circle cx="56" cy="80" r="9"/><circle cx="56" cy="80" r="1.5"/><rect x="36" y="108" width="40" height="34" rx="10"/><rect x="38" y="140" width="36" height="8" rx="4"/><rect x="34" y="160" width="44" height="20" rx="6"/>'},mini_skid_steer:{w:104,h:270,svg:'<path d="M3,3 H101 L102,32 Q102,35 99,35 H5 Q2,35 2,32 Z"/><path d="M4,3 H100" class="thick"/><path d="M6,26 H98" class="thin"/><path d="M3,5 L6,33 M101,5 L98,33" class="thin"/><rect x="20" y="35" width="64" height="8" rx="2"/><rect x="17" y="38" width="9" height="140" rx="3.5"/><rect x="78" y="38" width="9" height="140" rx="3.5"/><path d="M21.5,60 V150 M82.5,60 V150" class="thin"/><rect x="2" y="72" width="16" height="172" rx="8"/><rect x="86" y="72" width="16" height="172" rx="8"/><path d="M3,92 H17 M3,108 H17 M3,124 H17 M3,140 H17 M3,156 H17 M3,172 H17 M3,188 H17 M3,204 H17 M3,220 H17 M87,92 H101 M87,108 H101 M87,124 H101 M87,140 H101 M87,156 H101 M87,172 H101 M87,188 H101 M87,204 H101 M87,220 H101" class="thin"/><rect x="27" y="58" width="50" height="152" rx="8"/><path d="M35,82 H69 M35,90 H69 M35,98 H69 M35,106 H69" class="thin"/><circle cx="52" cy="132" r="4"/><rect x="31" y="190" width="42" height="22" rx="4"/><circle cx="41" cy="201" r="3"/><circle cx="63" cy="201" r="3"/><rect x="24" y="220" width="56" height="46" rx="4"/><path d="M30,228 H74 M30,236 H74 M30,244 H74 M30,252 H74 M30,260 H74" class="thin"/>'},car_land_rover_discovery:{w:222,h:497,svg:'<path d="M31,3 H191 Q209,3 210,22 L211,60 Q214,90 211,120 V350 Q214,382 211,414 L210,478 Q209,494 191,494 H31 Q13,494 12,478 L11,414 Q8,382 11,350 V120 Q8,90 11,60 L12,22 Q13,3 31,3 Z"/><path d="M36,148 L34,20 Q111,12 188,20 L186,148" class="thin"/><path d="M30,152 H192 L182,200 H40 Z"/><path d="M11,150 L3,156 Q0,166 4,170 H11 M211,150 L219,156 Q222,166 218,170 H211"/><path d="M40,200 H182 L184,430 H38 Z"/><path d="M38,300 H184" class="thin"/><path d="M46,208 V422 M176,208 V422" class="thick"/><rect x="62" y="214" width="98" height="72" rx="6" class="thin"/><rect x="62" y="314" width="98" height="96" rx="6" class="thin"/><path d="M38,430 H184 L190,458 H32 Z"/><path d="M28,474 H194" class="thin"/>'},car_mercedes_glc:{w:208,h:472,svg:'<path d="M40,4 Q104,-1 168,4 Q196,10 198,44 L199,70 Q202,100 199,128 L198,345 Q202,375 199,405 L197,436 Q194,466 164,469 H44 Q14,466 11,436 L9,405 Q6,375 10,345 L10,128 Q6,100 9,70 L10,44 Q12,10 40,4 Z"/><path d="M66,22 Q64,80 68,140 M142,22 Q144,80 140,140" class="thin"/><path d="M28,150 Q104,138 180,150 L166,208 Q104,200 42,208 Z"/><path d="M10,156 L2,162 Q0,172 4,176 H10 M198,156 L206,162 Q208,172 204,176 H198"/><path d="M42,208 Q104,200 166,208 L168,392 Q104,400 40,392 Z"/><rect x="58" y="222" width="92" height="150" rx="14" class="thin"/><path d="M40,392 Q104,400 168,392 L180,428 Q104,438 28,428 Z"/><path d="M30,446 Q104,456 178,446" class="thin"/>'}},jt=3e5;function Ut(e){if(e.length>jt)return null;const t=(new DOMParser).parseFromString(e,"image/svg+xml"),i=t.documentElement;if(!i||"svg"!==i.nodeName.toLowerCase()||t.getElementsByTagName("parsererror").length>0)return null;for(const e of["script","foreignObject","iframe","object","embed"])for(const i of Array.from(t.getElementsByTagName(e)))i.remove();for(const e of Array.from(t.getElementsByTagName("*")))for(const t of Array.from(e.attributes)){const i=t.name.toLowerCase(),n=t.value.trim().toLowerCase();i.startsWith("on")?e.removeAttribute(t.name):"href"!==i&&"xlink:href"!==i||n.startsWith("#")||n.startsWith("data:image/")||e.removeAttribute(t.name)}const n=(i.getAttribute("viewBox")??"").split(/[\s,]+/).map(Number).filter(e=>Number.isFinite(e));let o=4===n.length?n[2]??0:parseFloat(i.getAttribute("width")??""),r=4===n.length?n[3]??0:parseFloat(i.getAttribute("height")??"");return o>0&&r>0||(o=1,r=1),4!==n.length&&i.setAttribute("viewBox",`0 0 ${o} ${r}`),i.setAttribute("preserveAspectRatio","xMidYMid meet"),i.getAttribute("xmlns")||i.setAttribute("xmlns","http://www.w3.org/2000/svg"),{svg:(new XMLSerializer).serializeToString(i),aspect:o/r}}function Wt(e){return`data:image/svg+xml;charset=utf-8,${encodeURIComponent(e)}`}function Nt(){return Math.random().toString(36).slice(2,10)}const Zt=(e,t,i,n,o,r)=>({t:"rect",x:e,y:t,w:i,h:n,r:o,dash:r}),Gt=(e,t,i,n,o,r)=>({t:"ellipse",cx:e,cy:t,rx:i,ry:n,rot:o,dash:r}),Kt=(e,t,i,n)=>Gt(e,t,i,i,void 0,n),qt=(e,t,i,n,o)=>({t:"line",x1:e,y1:t,x2:i,y2:n,dash:o}),Yt=(e,t=!0,i)=>({t:"poly",points:e,closed:t,dash:i}),Qt=(e,t)=>({t:"path",d:e,dash:t}),Xt=(e,t,i)=>{const n=e[t];return"number"==typeof n?n:i},Jt=(e,t)=>!0===e[t],ei=Math.min,ti=Math.max;function ii(e,t,i){return Array.from({length:i},(n,o)=>e+(t-e)*(o+1)/(i+1))}function ni(e,t,i){return Array.from({length:i},(n,o)=>e+(t-e)*(o+.5)/i)}function oi(e,t,i,n=42){const o=Math.cos(i),r=Math.sin(i),s=n/2,a=180*i/Math.PI,[l,c]=[e+(d=-s-3.5)*o-(h=0)*r,t+d*r+h*o];var d,h;return[{t:"rect",x:e-s,y:t-s,w:n,h:n,r:.28*n,rot:a},{t:"rect",x:l-3,y:c-(s-3),w:6,h:n-6,r:3,rot:a}]}function ri(e,t,i,n){return[qt(e,t,e+i,t+n),qt(e+i,t,e,t+n)]}function si(e,t,i){return[Kt(e,t,i),Kt(e,t,.45*i)]}function ai(e,t,i,n,o,r,s){const a=i*Math.PI/180,l=Math.cos(a),c=Math.sin(a),d=(i,n)=>`${(e+i*l-n*c).toFixed(2)},${(t+i*c+n*l).toFixed(2)}`,h=n,u=n+o;switch(s){case"heart":return`M${d(h,0)} C${d(h+.02*o,1.25*-r)} ${d(h+.85*o,1.05*-r)} ${d(u,0)} C${d(h+.85*o,1.05*r)} ${d(h+.02*o,1.25*r)} ${d(h,0)} Z`;case"blade":return`M${d(h,.45*-r)} Q${d(h+.65*o,-r)} ${d(u,0)} Q${d(h+.65*o,r)} ${d(h,.45*r)} Z`;case"oval":return`M${d(h,0)} C${d(h+.1*o,1.1*-r)} ${d(h+.9*o,1.1*-r)} ${d(u,0)} C${d(h+.9*o,1.1*r)} ${d(h+.1*o,1.1*r)} ${d(h,0)} Z`;default:return`M${d(h,0)} Q${d(h+o/2,-r)} ${d(u,0)} Q${d(h+o/2,r)} ${d(h,0)} Z`}}function li(e,t,i,n,o){const r=i*Math.PI/180;return qt(e+Math.cos(r)*n,t+Math.sin(r)*n,e+Math.cos(r)*o,t+Math.sin(r)*o)}function ci(e,t=0,i=9){return Array.from({length:e},(n,o)=>t+360*o/e+(37*o%3-1)*i)}function di(e,t,i){return[Kt(e,t,i),Kt(e,t,.78*i,!0)]}function hi(e,t,i,n,o,r){const s=i*Math.PI/180,a=e+Math.cos(s)*n,l=t+Math.sin(s)*n,c=(e+a)/2-Math.sin(s)*n*r,d=(t+l)/2+Math.cos(s)*n*r,h=[Qt(`M${e},${t} Q${c},${d} ${a},${l}`)];for(let i=1;i<=4;i++){const n=i/4.4,r=(1-n)**2*e+2*(1-n)*n*c+n*n*a,s=(1-n)**2*t+2*(1-n)*n*d+n*n*l,u=2*(1-n)*(c-e)+2*n*(a-c),g=2*(1-n)*(d-t)+2*n*(l-d),p=180*Math.atan2(g,u)/Math.PI;h.push(Qt(ai(r,s,p+(i%2?55:-55),0,o,.42*o,"heart")))}return h}function ui(e,t,i,n){const o=Array.from({length:n},(o,r)=>{const s=r/n*Math.PI*2;return[e+i*Math.cos(s),t+i*Math.sin(s)]}),r=i*Math.sin(Math.PI/n)*1.15,s=o[0];let a=`M${s[0]},${s[1]}`;for(let e=1;e<=n;e++){const t=o[e%n];a+=` A${r},${r} 0 0 1 ${t[0]},${t[1]}`}return a+" Z"}const gi={box:(e,t,i)=>{const n=[Zt(0,0,e,t,Xt(i,"r",0),Jt(i,"dash"))];Jt(i,"x")&&n.push(...ri(0,0,e,t));const o=Xt(i,"inset",0);return o>0&&n.push(Zt(o,o,e-2*o,t-2*o)),n},rounded:(e,t,i)=>[Zt(0,0,e,t,ei(e,t)*Xt(i,"k",.2))],circle:(e,t,i)=>{const n=[Gt(e/2,t/2,e/2,t/2)],o=Xt(i,"inner",0);return o>0&&n.push(Gt(e/2,t/2,e/2*o,t/2*o)),Jt(i,"cross")&&n.push(qt(e/2,0,e/2,t),qt(0,t/2,e,t/2)),n},cabinet:(e,t,i)=>{const n=Xt(i,"doors",ti(1,Math.round(e/50))),o=[Zt(0,0,e,t,0,Jt(i,"dash")),qt(0,t-3,e,t-3)];for(const i of ii(0,e,n-1))o.push(qt(i,t-3,i,t));return Jt(i,"x")&&o.push(...ri(0,0,e,t-3)),o},drawers:(e,t,i)=>{const n=Xt(i,"cols",ti(1,Math.round(e/60))),o=[Zt(0,0,e,t),qt(0,t-3,e,t-3)];for(const i of ii(0,e,n-1))o.push(qt(i,t-3,i,t));for(const i of ni(0,e,n))o.push(qt(i-ei(8,e/n/4),t-6,i+ei(8,e/n/4),t-6));return o},wardrobe:(e,t)=>{const i=[Zt(0,0,e,t),qt(4,t/2,e-4,t/2,!0)];for(let n=10;n<e-6;n+=9)i.push(qt(n-3,t/2-.3*t,n+3,t/2+.3*t));for(const n of ii(0,e,ti(1,Math.round(e/50))-1))i.push(qt(n,t-3,n,t));return i.push(qt(0,t-3,e,t-3)),i},shelf:(e,t,i)=>{const n=Xt(i,"bay",80),o=[Zt(0,0,e,t)];for(const i of ii(0,e,ti(0,Math.round(e/n)-1)))o.push(qt(i,0,i,t));return o.push(qt(2,.5*t,e-2,.5*t,!0)),o},floatingShelf:(e,t)=>[Zt(0,0,e,t,1,!0),qt(0,.6,e,.6)],printer3d:(e,t,i)=>{const n=Math.min(.22*t,12),o=.9*n,r=t-o,s=[Zt(0,o,e,r,3)];Jt(i,"enclosed")&&s.push(Zt(2.5,o+2.5,e-5,r-5,2));const a=.16*Math.min(e,r),l=Math.min(e-2*a,r-2*a),c=(e-l)/2,d=o+(r-l)/2+.2*a;s.push(Zt(c,d,l,l,1,!0));const h=d+.42*l;return s.push(qt(.5*a,h,e-.5*a,h)),s.push(Zt(.55*e-3.5,h-3.5,7,7,1.5)),s.push(Kt(e/2,.55*o,.55*n),Kt(e/2,.55*o,.18*n)),s},hydroBed:(e,t,i)=>{const n=[Zt(0,0,e,t,3),Zt(2.5,2.5,e-5,t-5,2)],o=Xt(i,"pitch",15),r=Math.max(1,Math.round((e-5)/o)),s=Math.max(1,Math.round((t-5)/o)),a=.26*Math.min((e-5)/r,(t-5)/s);for(let i=0;i<r;i++)for(let o=0;o<s;o++){const l=2.5+(e-5)/r*(i+.5),c=2.5+(t-5)/s*(o+.5);n.push(Kt(l,c,a),Kt(l,c,.4*a))}return n},closetRod:(e,t)=>{const i=[Zt(0,0,e,t,0,!0),qt(0,.45*t,e,.45*t)];for(let n=6;n<e-4;n+=10)i.push(qt(n-2,.2*t,n+2,.7*t));return i},cubby:(e,t,i)=>{const n=Xt(i,"cols",ti(2,Math.round(e/35))),o=[Zt(0,0,e,t)];for(const i of ii(0,e,n-1))o.push(qt(i,0,i,t));return o},chest:(e,t)=>[Zt(0,0,e,t,3),qt(0,.25*t,e,.25*t),Zt(e/2-5,t-4,10,4)],bed:(e,t,i)=>{const n=Xt(i,"pillows",e>=120?2:1),o=ei(8,.05*t),r=[Zt(0,0,e,t,3),Zt(0,0,e,o)],s=(e-12-6*(n-1))/n;for(let e=0;e<n;e++)r.push(Zt(6+e*(s+6),o+5,s,ei(22,.14*t),5));const a=.33*t;return r.push(qt(0,a,e,a),qt(0,a+5,e,a+5)),r.push(qt(.62*e,a+5,e,a+.18*t)),Jt(i,"bunk")&&r.push(...ri(0,0,e,t).map(e=>({...e,dash:!0}))),Jt(i,"trundle")&&r.push(Zt(4,.15*t,e-8,.8*t,0,!0)),r},crib:(e,t)=>{const i=[Zt(0,0,e,t,2),Zt(4,4,e-8,t-8,2)];for(let n=8;n<e-4;n+=8)i.push(qt(n,0,n,4),qt(n,t-4,n,t));return i},bassinet:(e,t)=>[Gt(e/2,t/2,e/2,t/2),Gt(e/2,t/2,e/2-5,t/2-5),qt(.2*e,.2*t,.8*e,.2*t)],sofa:(e,t,i)=>{const n=Xt(i,"seats",3),o=ei(24,.26*t),r=Jt(i,"noArms")?0:ei(18,.14*e),s=[Zt(0,0,e,t,6),qt(r,o,e-r,o)];r>0&&s.push(qt(r,o,r,t),qt(e-r,o,e-r,t));for(const i of ii(r,e-r,n-1))s.push(qt(i,o,i,t-4));return Jt(i,"recliner")&&s.push(Zt(r+4,t,e-2*r-8,30,3,!0)),s},sectional:(e,t,i)=>{const n=Xt(i,"seatDepth",95),o=Xt(i,"chaise",95),r=22,s=[Yt([[0,0],[e,0],[e,n],[o,n],[o,t],[0,t]]),Yt([[e-18,r],[r,r],[r,t]],!1),qt(e-18,r,e-18,n)],a=Xt(i,"seats",3);for(const t of ii(o,e-18,a-1))s.push(qt(t,r,t,n-4));return s.push(qt(r,n,o,n)),s},uSectional:(e,t)=>{const i=95,n=22;return[Yt([[0,0],[e,0],[e,t],[e-i,t],[e-i,i],[i,i],[i,t],[0,t]]),Yt([[n,t],[n,n],[e-n,n],[e-n,t]],!1),qt(n,i,i,i),qt(e-i,i,e-n,i)]},chaise:(e,t)=>[Zt(0,0,e,t,8),Qt(`M${.22*e},2 Q${.1*e},${t/2} ${.22*e},${t-2}`),qt(.6*e,3,.6*e,t-3)],ottoman:(e,t,i)=>Jt(i,"round")?[Gt(e/2,t/2,e/2,t/2),Gt(e/2,t/2,e/2-6,t/2-6)]:[Zt(0,0,e,t,8),Zt(6,6,e-12,t-12,5)],pouf:(e,t)=>[Gt(e/2,t/2,e/2,t/2),...[0,1,2,3].map(i=>qt(e/2,t/2,e/2+e/2*Math.cos(i*Math.PI/2+.4),t/2+t/2*Math.sin(i*Math.PI/2+.4)))],beanbag:(e,t)=>[Qt(`M${.5*e},0 C${.95*e},0 ${e},${.35*t} ${e},${.6*t} C${e},${.95*t} ${.7*e},${t} ${.45*e},${t} C${.1*e},${t} 0,${.75*t} 0,${.5*t} C0,${.15*t} ${.2*e},0 ${.5*e},0 Z`),Gt(.52*e,.58*t,.28*e,.25*t)],chair:(e,t,i)=>{const n=ei(10,.2*t),o=[Zt(0,n,e,t-n,4),Zt(0,0,e,n,3)];return Jt(i,"arms")&&o.push(qt(5,n,5,t-4),qt(e-5,n,e-5,t-4)),Jt(i,"rocker")&&o.push(Qt(`M-2,${n} Q-6,${t/2} -2,${t+6}`),Qt(`M${e+2},${n} Q${e+6},${t/2} ${e+2},${t+6}`)),o},officeChair:(e,t)=>{const i=e/2,n=.55*t,o=.3*ei(e,t),r=[Kt(i,n,o),Qt(`M${i-o},${n-.6*o} Q${i},${n-1.6*o} ${i+o},${n-.6*o}`)];for(let o=0;o<5;o++){const s=-Math.PI/2+2*o*Math.PI/5+Math.PI/5,a=i+Math.cos(s)*ei(e,t)*.47,l=n+Math.sin(s)*ei(e,t)*.45;r.push(qt(i,n,a,l),Kt(a,l,2.5))}return r},stool:(e,t)=>[Gt(e/2,t/2,e/2,t/2),Gt(e/2,t/2,.3*e,.3*t)],bench:(e,t,i)=>{const n=[Zt(0,0,e,t,2)];for(const o of ii(0,t,Xt(i,"slats",3)))n.push(qt(2,o,e-2,o));return Jt(i,"back")&&n.push(Zt(0,0,e,6)),n},table:(e,t,i)=>{const n=Xt(i,"top",0),o=Xt(i,"bottom",0),r=Xt(i,"left",0),s=Xt(i,"right",0),a=r?45:0,l=n?45:0,c=e-a-(s?45:0),d=t-l-(o?45:0),h="oval"===i.shape,u=[h?Gt(a+c/2,l+d/2,c/2,d/2):Zt(a,l,c,d,Xt(i,"r",2))];Jt(i,"glass")&&u.push(Zt(a+4,l+4,c-8,d-8,1));const g=h?.18*c:0;for(const e of ni(a+g,a+c-g,n))u.push(...oi(e,l-10,Math.PI/2));for(const e of ni(a+g,a+c-g,o))u.push(...oi(e,l+d+10,-Math.PI/2));for(const e of ni(l,l+d,r))u.push(...oi(a-10,e,0));for(const e of ni(l,l+d,s))u.push(...oi(a+c+10,e,Math.PI));return u},roundTable:(e,t,i)=>{const n=Xt(i,"chairs",0),o=e/2,r=t/2,s=n>0?ei(e,t)/2-42:ei(e,t)/2,a=[Kt(o,r,s)];Jt(i,"pedestal")&&a.push(Kt(o,r,.3*s,!0));for(let e=0;e<n;e++){const t=e/n*Math.PI*2-Math.PI/2,i=s+12;a.push(...oi(o+Math.cos(t)*i,r+Math.sin(t)*i,t+Math.PI,40))}return a},desk:(e,t,i)=>{const n=Xt(i,"desk",t),o=[Zt(0,0,e,n,2)];return Jt(i,"monitor")&&o.push(Zt(e/2-28,6,56,3),qt(e/2,9,e/2,16)),Jt(i,"drawers")&&o.push(Zt(e-45,2,42,n-4),qt(e-45,.5*n,e-3,.5*n)),n<t&&o.push(...oi(e/2,n+(t-n)/2,-Math.PI/2,ei(48,t-n))),o},deskChair:(e,t)=>{const i=Math.max(4,Math.min(e,t-7));return oi(e/2,t-i/2,Math.PI/2,i)},lDesk:(e,t,i)=>{const n=Xt(i,"desk",60),o=[Yt([[0,0],[e,0],[e,n],[n,n],[n,t],[0,t]])];return Jt(i,"chair")&&o.push(...oi(n+30,n+32,.75*-Math.PI,46)),o},uDesk:(e,t)=>[Yt([[0,0],[e,0],[e,t],[e-60,t],[e-60,60],[60,60],[60,t],[0,t]])],pedestalTable:(e,t)=>[Kt(e/2,t/2,ei(e,t)/2),Kt(e/2,t/2,.12*ei(e,t),!0)],console:(e,t)=>[Zt(0,0,e,t,2),qt(4,t/2,e-4,t/2,!0)],tvStand:(e,t)=>{const i=[Zt(0,0,e,t,2),qt(0,t-3,e,t-3)];for(const n of ii(0,e,ti(1,Math.round(e/50))-1))i.push(qt(n,t-3,n,t));return i},island:(e,t,i)=>{const n=Xt(i,"seats",0),o=n>0?t-45:t,r=[Zt(0,0,e,o,2),qt(0,3,e,3)];if(n>0){r.push(qt(0,o-25,e,o-25,!0));for(const t of ni(0,e,n))r.push(Kt(t,o+20,17),Kt(t,o+20,9))}if(Jt(i,"sink")&&r.push(Zt(e/2-35,8,70,40,4)),Jt(i,"hob"))for(const[t,i]of[[.3*e,18],[.3*e,40],[.42*e,18],[.42*e,40]])r.push(Kt(t,i,7));return r},counter:(e,t,i)=>{const n=[Zt(0,0,e,t),qt(0,t-3,e,t-3)];return Jt(i,"x")&&n.push(...ri(0,0,e,t-3)),n},sink:(e,t,i)=>{const n=Xt(i,"basins",1),o=[Zt(0,0,e,t)],r=(e-16-6*(n-1))/n,s=Jt(i,"rearDrain");for(let e=0;e<n;e++){const i=8+e*(r+6);o.push(Zt(i,12,r,t-22,5),s?Kt(i+r-7,19,2.5):Kt(i+r/2,12+.6*(t-22),2.5))}return o.push(qt(e/2,3,e/2,10),Kt(e/2,4,2)),Jt(i,"apron")&&o.push(qt(0,t-4,e,t-4)),o},bezellessSink:(e,t,i)=>{const n=Math.min(10,.2*t),o=[Qt(fi([[.5,n],[e-.5,n],[e-.5,t-.5],[.5,t-.5]],!0,1.5))];o.push(Kt(e/2,.4*n,Math.min(2.4,.3*n)),qt(e/2,.4*n+Math.min(2.4,.3*n),e/2,n+3),Kt(e/2,n+4,1));const[r,s]=Jt(i,"centreDrain")?[e/2,n+.55*(t-n)]:[e-7,n+7];return o.push(Kt(r,s,2.4),Kt(r,s,.7)),o},range:(e,t,i)=>{const n=Xt(i,"burners",4),o=n>=6||5===n?3:2,r=Jt(i,"noBack")?4:12,s=[Zt(0,0,e,t)];Jt(i,"noBack")||s.push(qt(0,9,e,9));const a=ni(4,e-4,o),l=ni(r,t-6,2);let c=0;for(const i of l)for(const l of a){if(c++>=n)break;s.push(...si(l,i,.34*ei((e-8)/o,(t-r-6)/2)))}return Jt(i,"griddle")&&s.push(Zt(.38*e,r+4,.24*e,t-r-14,2)),s},fridge:(e,t,i)=>{const n=Xt(i,"doors",1),o=[Zt(0,0,e,t,1),qt(0,t-5,e,t-5)];return n>=2&&o.push(qt(e/2,t-5,e/2,t)),n>=2?o.push(qt(e/2-4,t-9,e/2-4,t-5),qt(e/2+4,t-9,e/2+4,t-5)):o.push(qt(e-6,t-9,e-6,t-5)),Jt(i,"x")&&o.push(...ri(0,0,e,t-5)),o},dishwasher:(e,t)=>[Zt(0,0,e,t),qt(0,t-3,e,t-3),...ri(0,0,e,t-3)],appliance:(e,t,i)=>{const n=[Zt(0,0,e,t,Xt(i,"r",2))];return Jt(i,"window")&&n.push(Zt(.08*e,.25*t,.6*e,.6*t,2),qt(.78*e,.3*t,.78*e,.8*t)),Jt(i,"slots")&&n.push(Zt(.2*e,.2*t,.25*e,.6*t,1),Zt(.55*e,.2*t,.25*e,.6*t,1)),Jt(i,"jug")&&n.push(Kt(.55*e,.55*t,.3*ei(e,t)),qt(.15*e,.55*t,.27*e,.55*t)),Jt(i,"bowl")&&n.push(Kt(.45*e,.6*t,.3*ei(e,t)),Zt(.7*e,0,.3*e,.9*t,3)),Jt(i,"dial")&&n.push(Kt(.5*e,.5*t,.25*ei(e,t))),n},hood:(e,t)=>[Zt(0,0,e,t,0,!0),Yt([[.35*e,0],[.65*e,0],[.8*e,t],[.2*e,t]],!0,!0)],trash:(e,t,i)=>Jt(i,"round")?[Gt(e/2,t/2,e/2,t/2),Gt(e/2,t/2,e/2-3,t/2-3),qt(.3*e,.2*t,.7*e,.2*t)]:[Zt(0,0,e,t,3),qt(0,.2*t,e,.2*t),qt(.35*e,.6*t,.65*e,.6*t)],cart:(e,t)=>[Zt(0,0,e,t,2),Zt(4,4,e-8,t-8,1),Kt(4,4,2.5),Kt(e-4,4,2.5),Kt(4,t-4,2.5),Kt(e-4,t-4,2.5)],toilet:(e,t,i)=>{const n=Jt(i,"wallHung")?.12*t:.3*t;return[Zt(.08*e,0,.84*e,n,3),Gt(e/2,n+(t-n)/2,.42*e,(t-n)/2),Gt(e/2,n+.52*(t-n),.28*e,.36*(t-n))]},bidet:(e,t)=>[Zt(.15*e,0,.7*e,.15*t,2),Gt(e/2,.15*t+.425*t,.45*e,.425*t),Gt(e/2,.55*t,.25*e,.25*t),Kt(e/2,.2*t,2)],urinal:(e,t)=>[Qt(`M0,0 L${e},0 L${e},${.3*t} Q${e},${t} ${e/2},${t} Q0,${t} 0,${.3*t} Z`),Gt(e/2,.45*t,.28*e,.3*t)],vanity:(e,t,i)=>{const n=Xt(i,"basins",1),o=[Zt(0,0,e,t),qt(0,t-3,e,t-3)];if(Jt(i,"trough")){const n=Math.max(1,Xt(i,"taps",2));o.push(Zt(10,.28*t,e-20,.5*t,4));for(const i of ni(10,e-10,n))o.push(Kt(i,.15*t,2),Kt(i,.6*t,2));return o}for(const r of ni(0,e,n))if(Jt(i,"rect")){const i=ei(46,e/n-14);o.push(Zt(r-i/2,.28*t,i,.5*t,4),Kt(r,.53*t,2),Kt(r,.15*t,2))}else o.push(Gt(r,.5*t,ei(22,e/n/2-5),.28*t),Kt(r,.18*t,2));return o},pedestalSink:(e,t)=>[Qt(`M0,0 L${e},0 L${e},${.3*t} Q${e},${t} ${e/2},${t} Q0,${t} 0,${.3*t} Z`),Gt(e/2,.45*t,.32*e,.28*t),Kt(e/2,.12*t,2)],bathtub:(e,t,i)=>{const n=[Zt(0,0,e,t,Jt(i,"free")?t/2:2)];if(n.push(Zt(8,8,e-16,t-16,ei(t/2-8,26))),n.push(Kt(Jt(i,"free")?e/2:20,t/2,3)),Jt(i,"claw"))for(const[i,o]of[[t/2,2],[e-t/2,2],[t/2,t-2],[e-t/2,t-2]])n.push(Kt(i,o,3));if(Jt(i,"jets"))for(const i of[.3*e,.5*e,.7*e])n.push(Kt(i,12,2),Kt(i,t-12,2));return n},cornerTub:(e,t)=>[Qt(`M0,0 L${e},0 L${e},${.35*t} A${.65*e},${.65*t} 0 0 1 ${.35*e},${t} L0,${t} Z`),Qt(`M8,8 L${e-8},8 L${e-8},${.35*t} A${.6*e},${.6*t} 0 0 1 ${.35*e},${t-8} L8,${t-8} Z`),Kt(.3*e,.3*t,3)],shower:(e,t,i)=>{const n=[Zt(0,0,e,t),...ri(0,0,e,t),Kt(e/2,t/2,3)];return Jt(i,"walkIn")&&n.push(qt(e,.4*t,e,t,!0)),n},neoAngleShower:(e,t)=>[Yt([[0,0],[e,0],[e,.6*t],[.6*e,t],[0,t]]),qt(0,0,.8*e,.8*t),Kt(.45*e,.45*t,3)],hotTub:(e,t)=>[Zt(0,0,e,t,20),Zt(14,14,e-28,t-28,14),...[0,1,2,3].map(i=>Kt(i%2?e-22:22,i<2?22:t-22,4))],towelRail:(e,t)=>[Zt(0,0,e,t,1),...ii(0,e,4).map(e=>qt(e,0,e,t))],washer:(e,t,i)=>{const n=[Zt(0,0,e,t,2),qt(0,10,e,10),Kt(e/2,(t+10)/2,.33*ei(e,t-10))];return Jt(i,"dryer")&&n.push(Kt(e/2,(t+10)/2,.22*ei(e,t-10),!0)),Jt(i,"stack")&&n.push(...ri(0,10,e,t-10).map(e=>({...e,dash:!0}))),Jt(i,"top")&&n.push(Zt(.15*e,14,.7*e,t-20,3)),n},waterHeater:(e,t,i)=>Jt(i,"tankless")?[Zt(0,0,e,t,2),Zt(.2*e,.25*t,.6*e,.5*t,2),qt(.3*e,t,.3*e,t+.01)]:[Kt(e/2,t/2,ei(e,t)/2),Kt(e/2,t/2,.35*ei(e,t)),Zt(.42*e,-2,.16*e,6),qt(e/2,t/2,.85*e,.15*t)],furnace:(e,t)=>[Zt(0,0,e,t),...ii(0,e,3).map(e=>qt(e,4,e,t-4)),qt(0,t-4,e,t-4)],condenser:(e,t)=>{const i=.4*ei(e,t),n=[Zt(0,0,e,t,2),Kt(e/2,t/2,i),Kt(e/2,t/2,.18*i)];for(let o=0;o<4;o++)n.push(Gt(e/2+Math.cos(o*Math.PI/2+.4)*i*.55,t/2+Math.sin(o*Math.PI/2+.4)*i*.55,.35*i,.15*i,90*o+23));return n},radiator:(e,t)=>{const i=[Zt(0,0,e,t,1)];for(let n=5;n<e-2;n+=5)i.push(qt(n,1,n,t-1));return i},fireplace:(e,t,i)=>{const n=Jt(i,"noHearth")?0:.3*t,o=t-n,r=[Zt(0,0,e,o),Yt([[.2*e,.25*o],[.8*e,.25*o],[.9*e,o],[.1*e,o]])];return n&&r.push(Zt(-.01,o,e,n,0,!0)),r},stove:(e,t)=>[Kt(e/2,t/2,ei(e,t)/2),Zt(.3*e,.55*t,.4*e,.3*t,2),Kt(e/2,.15*t,.08*ei(e,t))],electricalPanel:(e,t)=>{const i=[Zt(0,0,e,t),Zt(3,1,e-6,t-2)];for(const n of ii(3,e-3,ti(2,Math.round(e/6))))i.push(qt(n,1,n,t-1));return i},tank:(e,t,i)=>{const n=Xt(i,"tanks",1),o=[Zt(0,0,e,t,0,!0)];for(const i of ni(0,e,n))o.push(Kt(i,t/2,.45*ei(e/n,t)));return Jt(i,"brine")&&o.push(Zt(.55*e,.1*t,.4*e,.8*t,3)),o},ladder:(e,t)=>{const i=[qt(0,0,0,t),qt(e,0,e,t)];for(let n=25;n<t;n+=28)i.push(qt(0,n,e,n));return i.unshift(Zt(0,0,e,t,0,!0)),i},ironingBoard:(e,t)=>[Qt(`M0,${.1*t} L${.75*e},${.1*t} Q${e},${.5*t} ${.75*e},${.9*t} L0,${.9*t} Z`),qt(.1*e,t/2,.6*e,t/2,!0)],rack:(e,t,i)=>{const n=[Zt(0,0,e,t,1)];for(const o of ii(0,t,Xt(i,"rails",4)))n.push(qt(0,o,e,o));return n},tv:(e,t,i)=>{const n=ei(t,8),o=[Zt(0,0,e,n,1)];return Jt(i,"stand")?o.push(Zt(.35*e,n,.3*e,t-n,3)):o.push(qt(.05*e,n/2,.95*e,n/2,!0)),o},screen:(e,t)=>[Zt(0,0,e,t,1,!0),qt(0,t/2,e,t/2)],speaker:(e,t,i)=>{const n=[Zt(0,0,e,t,2),Kt(e/2,.55*t,.32*ei(e,t))];return Jt(i,"tweeter")&&n.push(Kt(e/2,.15*t,.08*ei(e,t))),n},soundbar:(e,t)=>[Zt(0,0,e,t,t/2),...ni(4,e-4,ti(3,Math.round(e/12))).map(e=>Kt(e,t/2,1))],device:(e,t,i)=>{const n=[Zt(0,0,e,t,Xt(i,"r",2))];for(const o of ni(0,e,Xt(i,"antennas",0)))n.push(qt(o,0,o,-ei(12,t)));const o=Xt(i,"leds",0);for(const i of ni(.2*e,.8*e,o))n.push(Kt(i,t-2.5,.8));if(Jt(i,"screen")&&n.push(Zt(.1*e,.15*t,.8*e,.6*t,1)),Jt(i,"lens")&&n.push(Kt(e/2,.7*t,.22*ei(e,t))),Jt(i,"button")&&n.push(Kt(e/2,.65*t,.25*ei(e,t))),Jt(i,"fan")&&n.push(Kt(e/2,t/2,.3*ei(e,t))),Jt(i,"rackUnits"))for(const i of ii(0,t,ti(2,Math.round(t/8))))n.push(qt(2,i,e-2,i));return Jt(i,"x")&&n.push(...ri(0,0,e,t)),n},puck:(e,t,i)=>{const n=[Gt(e/2,t/2,e/2,t/2),Gt(e/2,t/2,.3*e,.3*t)];return Jt(i,"dot")&&n.push(Kt(e/2,t/2,.06*ei(e,t))),Jt(i,"dash")&&(n[0]=Gt(e/2,t/2,e/2,t/2,void 0,!0)),n},laptop:(e,t)=>[Zt(0,.1*t,e,.9*t,2),Zt(0,0,e,.1*t,1),Zt(.1*e,.22*t,.8*e,.4*t,1),Zt(.35*e,.7*t,.3*e,.2*t,1)],monitor:(e,t)=>[Zt(0,0,e,ei(4,t),1),Zt(.38*e,ei(4,t),.24*e,t-ei(4,t),2),qt(e/2,ei(4,t),e/2,.5*t)],printer:(e,t)=>[Zt(0,.15*t,e,.85*t,3),Zt(.2*e,0,.6*e,.15*t,1),qt(.2*e,.8*t,.8*e,.8*t)],projector:(e,t)=>[Zt(0,0,e,t,3),Kt(.7*e,t-4,.15*ei(e,t)),qt(.15*e,.3*t,.45*e,.3*t)],ceilingFan:(e,t,i)=>{const n=Xt(i,"blades",4),o=ei(e,t)/2,r=[Kt(e/2,t/2,.14*o)];for(let i=0;i<n;i++){const s=i/n*360,a=s*Math.PI/180;r.push(Gt(e/2+Math.cos(a)*o*.57,t/2+Math.sin(a)*o*.57,.43*o,.11*o,s))}return r.push(Kt(e/2,t/2,o,!0)),r},floorFan:(e,t)=>[Kt(e/2,.45*t,.45*ei(e,t)),Kt(e/2,.45*t,.1*ei(e,t)),...[0,120,240].map(i=>Gt(e/2+Math.cos(i*Math.PI/180)*ei(e,t)*.24,.45*t+Math.sin(i*Math.PI/180)*ei(e,t)*.24,.18*ei(e,t),.08*ei(e,t),i)),Zt(.3*e,.85*t,.4*e,.15*t,2)],grille:(e,t,i)=>{const n=[Zt(0,0,e,t,Xt(i,"r",3))];for(const o of ii(0,t,Xt(i,"lines",4)))n.push(qt(.12*e,o,.88*e,o));return n},lamp:(e,t)=>[Kt(e/2,t/2,ei(e,t)/2),qt(e/2-.35*ei(e,t),t/2-.35*ei(e,t),e/2+.35*ei(e,t),t/2+.35*ei(e,t)),qt(e/2+.35*ei(e,t),t/2-.35*ei(e,t),e/2-.35*ei(e,t),t/2+.35*ei(e,t))],arcLamp:(e,t)=>[Kt(.15*e,.8*t,.15*ei(e,t)),Qt(`M${.15*e},${.8*t} Q${.2*e},0 ${.8*e},${.2*t}`),Kt(.8*e,.3*t,.18*ei(e,t))],ceilingLight:(e,t)=>{const i=ei(e,t)/2,n=[Kt(e/2,t/2,.55*i)];for(let o=0;o<8;o++){const r=o/8*Math.PI*2;n.push(qt(e/2+Math.cos(r)*i*.7,t/2+Math.sin(r)*i*.7,e/2+Math.cos(r)*i,t/2+Math.sin(r)*i))}return n},chandelier:(e,t,i)=>{const n=Xt(i,"arms",6),o=ei(e,t)/2,r=[Kt(e/2,t/2,.18*o)];for(let i=0;i<n;i++){const s=i/n*Math.PI*2,a=e/2+Math.cos(s)*o*.82,l=t/2+Math.sin(s)*o*.82;r.push(qt(e/2,t/2,a,l),Kt(a,l,.16*o))}return r},trackLight:(e,t)=>[Zt(0,t/2-1.5,e,3,1),...ni(0,e,ti(2,Math.round(e/30))).map(e=>Kt(e,t/2,ei(5,t/2)))],sconce:(e,t)=>[Zt(0,0,e,.3*t),Qt(`M0,${.3*t} Q${e/2},${1.4*t} ${e},${.3*t}`)],linearLight:(e,t,i)=>{const n=[Zt(0,0,e,t,Math.min(t/2,3))],o=Xt(i,"pitch",8);for(let i=o/2;i<e;i+=o)n.push(Kt(i,t/2,Math.max(.6,Math.min(.28*t,1.6))));return Jt(i,"cove")&&n.push(qt(0,-3,e,-3,!0)),n},panelLight:(e,t,i)=>{const n=[Zt(0,0,e,t,1),Zt(3,3,e-6,t-6)],o=Xt(i,"cols",2),r=Xt(i,"rows",Math.max(2,Math.round(t/(e/o))));for(const i of ii(3,e-3,o-1))n.push(qt(i,3,i,t-3,!0));for(const i of ii(3,t-3,r-1))n.push(qt(3,i,e-3,i,!0));return n},shopLight:(e,t)=>[Zt(0,0,e,t,2),qt(4,.33*t,e-4,.33*t),qt(4,.67*t,e-4,.67*t),Zt(-1,.2*t,3,.6*t),Zt(e-2,.2*t,3,.6*t)],gimbal:(e,t)=>[Kt(e/2,t/2,ei(e,t)/2),Kt(e/2,t/2,.36*ei(e,t)),Kt(.58*e,.44*t,.18*ei(e,t))],wafer:(e,t)=>[Kt(e/2,t/2,ei(e,t)/2),Kt(e/2,t/2,.43*ei(e,t),!0)],spotlight:(e,t)=>[Kt(e/2,e/2,e/2.2),Yt([[.3*e,.8*e],[.7*e,.8*e],[e,t],[0,t]],!0,!0)],flood:(e,t,i)=>{const n=Xt(i,"heads",1),o=[Zt(0,0,e,.45*t,2)];for(const i of ni(0,e,n))o.push(Zt(i-e/n/2+2,.45*t,e/n-4,.4*t,2)),o.push(qt(i,.85*t,i-e/n/2,t,!0),qt(i,.85*t,i+e/n/2,t,!0));return Jt(i,"sensor")&&o.push(Kt(e/2,.22*t,.12*Math.min(e,t))),o},pathLight:(e,t)=>{const i=ei(e,t)/2,n=[Kt(e/2,t/2,.4*i),Kt(e/2,t/2,.15*i)];for(let o=0;o<6;o++){const r=o/6*Math.PI*2;n.push(qt(e/2+Math.cos(r)*i*.55,t/2+Math.sin(r)*i*.55,e/2+Math.cos(r)*i,t/2+Math.sin(r)*i,!0))}return n},bollard:(e,t)=>[Kt(e/2,t/2,ei(e,t)/2),Kt(e/2,t/2,.3*ei(e,t)),qt(.15*e,t/2,.85*e,t/2),qt(e/2,.15*t,e/2,.85*t)],stepLight:(e,t)=>{const i=[Zt(0,0,e,t,1)];for(const n of ii(0,e,3))i.push(qt(n,.2*t,n,.8*t));return i},vanityBar:(e,t,i)=>{const n=Xt(i,"bulbs",3),o=[Zt(0,.3*t,e,.4*t,.2*t)];for(const i of ni(0,e,n))o.push(Kt(i,t/2,Math.min(t/2,e/n/3)));return o},pictureLight:(e,t)=>[Zt(0,0,e,.4*t,1),Qt(`M0,${.4*t} Q${e/2},${1.1*t} ${e},${.4*t}`,!0),qt(e/2,0,e/2,.4*-t)],lantern:(e,t)=>{const i=Array.from({length:8},(i,n)=>[e/2+Math.cos((n+.5)*Math.PI/4)*(e/2),t/2+Math.sin((n+.5)*Math.PI/4)*(t/2)]);return[Yt(i),Kt(e/2,t/2,.25*ei(e,t)),...i.filter((e,t)=>t%2==0).map(([i,n])=>qt(e/2,t/2,i,n,!0))]},drumShade:(e,t)=>[Gt(e/2,t/2,e/2,t/2),Gt(e/2,t/2,.42*e,.42*t,void 0,!0),Kt(e/2,t/2,.08*ei(e,t))],globeLight:(e,t)=>{const i=ei(e,t)/2;return[Gt(e/2,t/2,e/2,t/2),Qt(`M${e/2-.55*i},${t/2-.1*i} A${.6*i},${.6*i} 0 0 1 ${e/2-.1*i},${t/2-.55*i}`),Kt(e/2,t/2,.12*i)]},globeCluster:(e,t)=>{const i=ei(e,t)/2,n=[Kt(e/2,t/2,.14*i)],o=[[-.45,-.35,.3],[.45,-.3,.26],[.1,.5,.32],[-.5,.42,.2],[.55,.45,.18]];for(const[r,s,a]of o){const o=e/2+r*i*.95,l=t/2+s*i*.95;n.push(qt(e/2,t/2,o,l,!0),Kt(o,l,a*i))}return n},domePendant:(e,t)=>{const i=ei(e,t)/2,n=[Gt(e/2,t/2,e/2,t/2),Kt(e/2,t/2,.18*i)];for(let o=0;o<6;o++){const r=o/6*Math.PI*2;n.push(qt(e/2+Math.cos(r)*i*.18,t/2+Math.sin(r)*i*.18,e/2+Math.cos(r)*i*.85,t/2+Math.sin(r)*i*.85,!0))}return n},squareLight:(e,t)=>[Zt(0,0,e,t,.12*ei(e,t)),Zt(.2*e,.2*t,.6*e,.6*t,.08*ei(e,t))],ringLight:(e,t,i)=>{const n=Math.max(1,Xt(i,"rings",1)),o=[];for(let i=0;i<n;i++){const r=1-i*(.55/Math.max(1,n));o.push(Gt(e/2,t/2,e/2*r,t/2*r)),o.push(Gt(e/2,t/2,e/2*r-2.5,t/2*r-2.5,void 0,!0))}return o.push(Kt(e/2,t/2,.05*ei(e,t))),o},linearChandelier:(e,t)=>{const i=[Zt(0,.42*t,e,.16*t,.08*t)],n=Math.max(2,Math.round(e/25));for(const o of ii(0,e,n))i.push(qt(o,.42*t,o,.12*t),Kt(o,.1*t,.1*t)),i.push(qt(o,.58*t,o,.88*t),Kt(o,.9*t,.1*t));return i},spotBar:(e,t,i)=>{const n=Math.max(1,Xt(i,"spots",3)),o=[Zt(0,.35*t,e,.3*t,.15*t)],r=ei(.5*t,e/(2.4*n));for(let i=0;i<n;i++){const s=e/n*(i+.5);o.push(Kt(s,t/2,r),Kt(s,t/2,.45*r))}return o},swingArm:(e,t)=>[Zt(0,0,e,.12*t,1),qt(e/2,.12*t,e/2,.62*t),Kt(e/2,.62*t,.12*e),Gt(e/2,.82*t,e/2,.18*t)],wallLamp:(e,t,i)=>{const n=Math.max(1,Xt(i,"heads",1)),o=[Zt(0,0,e,.25*t,1)];for(let i=0;i<n;i++){const r=e/n*(i+.5),s=.42*ei(e/n,t);o.push(Qt(`M${r-s},${.25*t} Q${r},${.25*t+2.1*s} ${r+s},${.25*t}`))}return o},tripodLamp:(e,t)=>{const i=ei(e,t)/2,n=[Kt(e/2,t/2,.42*i)];for(let o=0;o<3;o++){const r=-Math.PI/2+o/3*Math.PI*2;n.push(qt(e/2+Math.cos(r)*i*.42,t/2+Math.sin(r)*i*.42,e/2+Math.cos(r)*i,t/2+Math.sin(r)*i),Kt(e/2+Math.cos(r)*i,t/2+Math.sin(r)*i,.05*i))}return n},cornerLamp:(e,t)=>[Yt([[0,0],[e,0],[0,t]]),Kt(.3*e,.3*t,.12*ei(e,t)),qt(.3*e,.3*t,.62*e,.62*t,!0)],saltLamp:(e,t)=>[Qt(`M${.2*e},${t} L${.05*e},${.55*t} L${.25*e},${.1*t} L${.6*e},0 L${.95*e},${.35*t} L${.85*e},${t} Z`),Qt(`M${.3*e},${.75*t} L${.45*e},${.35*t} L${.7*e},${.55*t}`,!0)],hexPanels:(e,t)=>{const i=ei(e/4.2,t/3.6),n=Math.sqrt(3)*i,o=(e,t)=>Yt(Array.from({length:6},(n,o)=>[e+Math.cos(Math.PI/3*o+Math.PI/6)*i,t+Math.sin(Math.PI/3*o+Math.PI/6)*i])),r=t/2,s=e/2-n;return[o(s,r-.75*i),o(s+n,r-.75*i),o(s+n/2,r+.75*i),o(s+1.5*n,r+.75*i),o(s+2*n,r-.75*i)].filter(t=>"poly"!==t.t||t.points.every(([t])=>t>=-.5&&t<=e+.5))},triPanels:(e,t)=>{const i=[],n=Math.max(2,Math.round(e/t*2)),o=e/((n+1)/2);for(let e=0;e<n;e++){const n=e*o/2;i.push(Yt(e%2==0?[[n,t],[n+o/2,0],[n+o,t]]:[[n,0],[n+o,0],[n+o/2,t]]))}return i},starProjector:(e,t)=>{const i=ei(e,t)/2,n=[Kt(e/2,t/2,.6*i),Kt(e/2,t/2,.25*i)];for(let o=0;o<6;o++){const r=o/6*Math.PI*2+.3;n.push(Kt(e/2+Math.cos(r)*i*.88,t/2+Math.sin(r)*i*.88,.05*i))}return n},barnLight:(e,t)=>[Zt(.35*e,0,.3*e,.08*t,1),Qt(`M${e/2},${.08*t} Q${e/2},${.35*t} ${e/2},${.45*t}`),Gt(e/2,.72*t,e/2,.28*t),Kt(e/2,.72*t,.08*ei(e,t))],cafeLights:(e,t)=>{const i=Math.max(1,Math.round(e/200)),n=e/i,o=[];let r="M0,"+.15*t;for(let e=0;e<i;e++){const i=e*n;r+=` Q${i+n/2},${1.1*t} ${i+n},${.15*t}`,o.push(Kt(i,.15*t,.12*t))}o.unshift(Qt(r)),o.push(Kt(e,.15*t,.12*t));const s=Math.max(4,Math.round(e/30));for(let i=1;i<s;i++){const r=i/s,a=r*e%n/n,l=.15*t+4*(.95*t-.15*t)*a*(1-a)*.5;o.push(Kt(r*e,l+.08*t,Math.min(2.2,.08*t)))}return o},postCap:(e,t)=>[Zt(0,0,e,t,1),Zt(.15*e,.15*t,.7*e,.7*t,1,!0),Kt(e/2,t/2,.2*ei(e,t))],wellLight:(e,t)=>{const i=ei(e,t)/2;return[Kt(e/2,t/2,i),Kt(e/2,t/2,.75*i),qt(e/2-.75*i,t/2,e/2+.75*i,t/2),qt(e/2,t/2-.75*i,e/2,t/2+.75*i)]},skylightPanel:(e,t)=>[Zt(0,0,e,t,2),Zt(4,4,e-8,t-8,1),qt(4,4,e-4,t-4,!0),qt(e-4,4,4,t-4,!0)],linearPendant:(e,t)=>[Zt(0,.25*t,e,.5*t,.25*t),qt(.4*t,t/2,e-.4*t,t/2,!0),Kt(.15*e,t/2,.12*t),Kt(.85*e,t/2,.12*t)],pendantRow:(e,t,i)=>{const n=Xt(i,"lights",3),o=[qt(0,t/2,e,t/2,!0)],r=Math.min(t/2,e/n/2.4);for(const i of ni(0,e,n))o.push(Kt(i,t/2,r),Kt(i,t/2,.4*r));return o.unshift(Zt(0,0,e,t,0,!0)),o},lightBar:(e,t)=>[Zt(0,0,e,t,t/3),Zt(2,.3*t,e-4,.4*t,.2*t),qt(-3,t/2,-1,t/2),qt(e+1,t/2,e+3,t/2)],neon:(e,t)=>{let i="M0,"+t/2;const n=Math.max(2,Math.round(e/15));for(let o=0;o<n;o++){i+=` Q${e*(o+.5)/n},${o%2?t:0} ${e*(o+1)/n},${t/2}`}return[Zt(0,0,e,t,1,!0),Qt(i)]},monorail:(e,t)=>{const i=[Qt(`M0,${t/2} C${.25*e},0 ${.5*e},${t} ${.75*e},${t/2} S${e},${.2*t} ${e},${.3*t}`)];for(const n of[.15,.4,.65,.9])i.push(Kt(e*n,t/2+Math.sin(n*Math.PI*2)*t*.25,Math.min(.2*t,4)));return i.unshift(Zt(0,0,e,t,0,!0)),i},uplight:(e,t)=>[Kt(e/2,t/2,ei(e,t)/2),Kt(e/2,t/2,.3*ei(e,t)),Kt(e/2,t/2,.42*ei(e,t),!0)],fanLight:(e,t)=>[Kt(e/2,t/2,.16*ei(e,t)),Kt(e/2,t/2,.08*ei(e,t)),...gi.ceilingFan(e,t,{blades:5}).slice(1)],exitSign:(e,t)=>[Zt(0,0,e,t,1),Zt(.15*e,.2*t,.7*e,.6*t,1),qt(.25*e,t/2,.75*e,t/2)],icon:(e,t,i)=>[{t:"icon",name:String(i.icon??""),w:e,d:t}],houseplant:(e,t,i)=>function(e,t,i){const n=e/2,o=t/2,r=Math.min(e,t)/2,s=[],a=(e,t,i,r,a,l=!0,c=0)=>{for(const d of ci(e,c))s.push(Qt(ai(n,o,d,i,r,a,t))),l&&s.push(li(n,o,d,i,i+.85*r))};switch(i){case"monstera":for(const e of ci(6,15,12)){const t=.72*r,i=.34*r,a=.24*r;s.push(Qt(ai(n,o,e,a,t,i,"heart"))),s.push(li(n,o,e,a,a+.9*t));const l=e*Math.PI/180;for(const e of[.3,.52,.72])for(const r of[-1,1]){const c=a+t*e,d=.95*i*Math.sin(Math.PI*Math.min(.95,e+.1)),h=n+Math.cos(l)*c-Math.sin(l)*r*d,u=o+Math.sin(l)*c+Math.cos(l)*r*d,g=n+Math.cos(l)*(c-.05*t)-Math.sin(l)*r*i*.3,p=o+Math.sin(l)*(c-.05*t)+Math.cos(l)*r*i*.3;s.push(qt(h,u,g,p))}s.push(li(n,o,e,.16*r,a))}s.push(...di(n,o,.26*r));break;case"bird":for(const e of ci(7,0,6))s.push(li(n,o,e,.14*r,.42*r)),s.push(Qt(ai(n,o,e,.42*r,.56*r,.13*r,"oval"))),s.push(li(n,o,e,.42*r,.94*r));s.push(...di(n,o,.2*r));break;case"snake":s.push(...di(n,o,.42*r));for(const e of ci(7,10,16)){const t=e*Math.PI/180,i=.1*r,a=r*(.68+7*e%3*.08);s.push(Qt(ai(n,o,e,i,a,.16*r,"blade")));for(const e of[.3,.5,.7]){const l=n+Math.cos(t)*(i+a*e),c=o+Math.sin(t)*(i+a*e),d=.16*r*.8*(1-.5*e);s.push(qt(l-Math.sin(t)*d,c+Math.cos(t)*d,l+Math.sin(t)*d*.4,c-Math.cos(t)*d*.4))}}break;case"pothos":case"pothosHanging":{const e="pothosHanging"===i,t=r*(e?.34:.4);s.push(...di(n,o,t)),a(5,"heart",.15*t,.75*t,.32*t,!1,20);for(const i of ci(e?6:4,40,15)){const e=i*Math.PI/180;s.push(...hi(n+Math.cos(e)*t,o+Math.sin(e)*t,i,r-t,.16*r,i%2?.25:-.25))}if(e)for(const e of[30,150,270])s.push(li(n,o,e,t,.5*r));break}case"fern":for(const e of ci(14,0,8)){s.push(li(n,o,e,.1*r,.96*r));const t=e*Math.PI/180;for(let e=.25;e<.95;e+=.12){const i=n+Math.cos(t)*r*e,a=o+Math.sin(t)*r*e,l=.1*r*(1-.6*e);s.push(qt(i,a,i+Math.cos(t+.9)*l,a+Math.sin(t+.9)*l)),s.push(qt(i,a,i+Math.cos(t-.9)*l,a+Math.sin(t-.9)*l))}}s.push(Kt(n,o,.12*r));break;case"peace":a(8,"lance",.15*r,.8*r,.2*r);for(const e of[60,200,320])s.push(Qt(ai(n,o,e,.25*r,.4*r,.13*r,"oval")));s.push(Kt(n,o,.15*r));break;case"zz":for(const e of ci(7,5,10)){s.push(li(n,o,e,.1*r,.95*r));const t=e*Math.PI/180;for(let i=.3;i<.95;i+=.16)for(const a of[-1,1]){const l=n+Math.cos(t)*r*i,c=o+Math.sin(t)*r*i;s.push(Qt(ai(l,c,e+50*a,0,.18*r,.07*r,"oval")))}}s.push(Kt(n,o,.12*r));break;case"rubber":a(7,"oval",.2*r,.75*r,.24*r),s.push(...di(n,o,.22*r));break;case"fiddle":a(9,"heart",.18*r,.72*r,.3*r,!0,12),s.push(Kt(n,o,.14*r));break;case"philodendron":a(7,"heart",.18*r,.7*r,.26*r,!0,25),s.push(...di(n,o,.22*r));break;case"spider":for(const e of ci(16,0,6)){const t=e*Math.PI/180,i=n+Math.cos(t)*r*.95,a=o+Math.sin(t)*r*.95,l=n+Math.cos(t+.35)*r*.6,c=o+Math.sin(t+.35)*r*.6;s.push(Qt(`M${n},${o} Q${l},${c} ${i},${a}`))}s.push(...di(n,o,.25*r));break;case"aloe":for(const e of ci(9,0,8))s.push(Qt(ai(n,o,e,.08*r,.88*r,.14*r,"blade")));s.push(Kt(n,o,.12*r));break;case"succulent":for(const[e,t,i]of[[10,.45,.95],[7,.25,.62],[5,.05,.32]])for(const a of ci(e,9*e,0))s.push(Qt(ai(n,o,a,r*t,r*(i-t),r*(i-t)*.45,"oval")));break;case"pilea":for(const e of ci(9,0,10)){const t=e*Math.PI/180,i=.62*r;s.push(li(n,o,e,.12*r,i-.22*r)),s.push(Kt(n+Math.cos(t)*i,o+Math.sin(t)*i,.22*r))}s.push(Kt(n,o,.12*r));break;case"calathea":for(const e of ci(8,0,10)){s.push(Qt(ai(n,o,e,.15*r,.8*r,.25*r,"oval"))),s.push(li(n,o,e,.15*r,.92*r));const t=e*Math.PI/180;for(const e of[.35,.55,.75]){const i=n+Math.cos(t)*r*e,a=o+Math.sin(t)*r*e;s.push(qt(i-Math.sin(t)*r*.12,a+Math.cos(t)*r*.12,i+Math.sin(t)*r*.12,a-Math.cos(t)*r*.12))}}break;case"palm":for(const e of ci(9,0,8)){s.push(li(n,o,e,.1*r,.97*r));const t=e*Math.PI/180;for(let e=.3;e<.95;e+=.1){const i=n+Math.cos(t)*r*e,a=o+Math.sin(t)*r*e,l=.2*r*Math.sin(Math.PI*e);s.push(qt(i,a,i+Math.cos(t+.6)*l,a+Math.sin(t+.6)*l)),s.push(qt(i,a,i+Math.cos(t-.6)*l,a+Math.sin(t-.6)*l))}}s.push(...di(n,o,.18*r));break;case"orchid":for(const e of[20,200,110])s.push(Qt(ai(n,o,e,.1*r,.72*r,.2*r,"oval")));s.push(Qt(`M${n},${o} Q${n+.2*r},${o-.6*r} ${n+.7*r},${o-.55*r}`));for(const e of[.45,.65,.85]){const t=n+.7*r*e,i=o-.62*r*Math.sin(Math.PI*e*.6)-.1*r;s.push(Kt(t,i,.12*r),Kt(t,i,.04*r))}s.push(...di(n,o,.28*r));break;case"dracaena":for(const e of ci(12,0,10))s.push(Qt(ai(n,o,e,.12*r,.85*r,.08*r,"lance")));s.push(Kt(n,o,.12*r));break;case"jade":for(const e of ci(6,0,15)){const t=e*Math.PI/180;s.push(li(n,o,e,.15*r,.7*r));for(const i of[.45,.75]){const a=n+Math.cos(t)*r*i,l=o+Math.sin(t)*r*i;s.push(Qt(ai(a,l,e+40,0,.26*r,.12*r,"oval"))),s.push(Qt(ai(a,l,e-40,0,.26*r,.12*r,"oval")))}}s.push(...di(n,o,.18*r));break;case"olive":s.push(Qt(ui(n,o,.92*r,11),!0));for(const e of ci(18,0,12)){const t=e*Math.PI/180,i=r*(.35+13*e%7*.07);s.push(Qt(ai(n+Math.cos(t)*i,o+Math.sin(t)*i,e+30,0,.22*r,.05*r,"lance")))}s.push(Kt(n,o,.08*r));break;case"herbs":{const i=3;for(let n=0;n<i;n++){const o=e*(n+.5)/i,r=.42*Math.min(e/i,t);s.push(Kt(o,t/2,r));for(const e of ci(6,20*n,10))s.push(Qt(ai(o,t/2,e,.1*r,.75*r,.22*r,"oval")))}break}default:s.push(...di(n,o,.4*r))}return s}(e,t,String(i.kind??"")),plant:(e,t,i)=>{const n=Xt(i,"leaves",7),o=ei(e,t)/2,r=[Kt(e/2,t/2,.3*o)];for(let i=0;i<n;i++){const s=i/n*360,a=s*Math.PI/180;r.push(Gt(e/2+Math.cos(a)*o*.62,t/2+Math.sin(a)*o*.62,.38*o,.16*o,s))}return r},tree:(e,t,i)=>[Qt(ui(e/2,t/2,ei(e,t)/2-2,Xt(i,"lobes",9))),Kt(e/2,t/2,.05*ei(e,t))],cactus:(e,t)=>[Kt(e/2,t/2,ei(e,t)/2),Kt(e/2,t/2,.25*ei(e,t)),...[0,1,2,3,4,5].map(i=>qt(e/2,t/2,e/2+Math.cos(i)*ei(e,t)*.45,t/2+Math.sin(i)*ei(e,t)*.45))],mirror:(e,t)=>{const i=[Zt(0,0,e,t,1)];for(let n=4;n<e;n+=8)i.push(qt(n,t,n+t,0));return i},divider:(e,t,i)=>{const n=Xt(i,"panels",3),o=[];for(let i=0;i<=n;i++)o.push([e*i/n,i%2?t:0]);return[Zt(0,0,e,t,0,!0),Yt(o,!1)]},clock:(e,t)=>[Zt(0,0,e,t,2),Kt(e/2,.55*t,.3*ei(e,t)),qt(e/2,.55*t,e/2,.35*t)],globe:(e,t)=>[Kt(e/2,t/2,ei(e,t)/2),Gt(e/2,t/2,.2*ei(e,t),ei(e,t)/2),qt(0,t/2,e,t/2)],stairs:(e,t)=>{const i=[Zt(0,0,e,t)],n=ti(2,Math.round(t/27));for(const o of ii(0,t,n-1))i.push(qt(0,o,e,o));return i},rug:(e,t,i)=>{if(Jt(i,"round"))return[Gt(e/2,t/2,e/2,t/2),Gt(e/2,t/2,e/2-8,t/2-8,void 0,!0)];const n=[Zt(0,0,e,t),Zt(8,8,e-16,t-16,0,!0)];for(let i=4;i<t;i+=6)n.push(qt(-4,i,0,i),qt(e,i,e+4,i));return n},grill:(e,t,i)=>{const n=Jt(i,"noShelves")?0:.22*e,o=[Zt(n,0,e-2*n,t,6)];for(const i of ii(n,e-n,5))o.push(qt(i,6,i,t-6));return n&&o.push(Zt(0,.1*t,n,.8*t,1),Zt(e-n,.1*t,n,.8*t,1)),o},kamado:(e,t)=>[Kt(e/2,t/2,ei(e,t)/2),Kt(e/2,t/2,.38*ei(e,t)),...ii(.15*e,.85*e,4).map(e=>qt(e,.2*t,e,.8*t))],firePit:(e,t,i)=>Jt(i,"square")?[Zt(0,0,e,t,3),Zt(.18*e,.18*t,.64*e,.64*t,2),Zt(.3*e,.3*t,.4*e,.4*t,1,!0)]:[Kt(e/2,t/2,ei(e,t)/2),Kt(e/2,t/2,.34*ei(e,t)),Kt(e/2,t/2,.2*ei(e,t),!0)],umbrella:(e,t)=>{const i=ei(e,t)/2,n=[Kt(e/2,t/2,i,!0),Kt(e/2,t/2,3)];for(let o=0;o<8;o++)n.push(qt(e/2,t/2,e/2+Math.cos(o*Math.PI/4)*i,t/2+Math.sin(o*Math.PI/4)*i));return n},cantileverUmbrella:(e,t)=>[Kt(.58*e,t/2,ei(.42*e,t/2),!0),Zt(0,t/2-15,30,30,2),qt(15,t/2,.58*e,t/2)],hammock:(e,t)=>[Gt(e/2,t/2,.35*e,.4*t),qt(0,t/2,.15*e,t/2),qt(.85*e,t/2,e,t/2),Zt(0,0,e,t,0,!0)],swingSet:(e,t,i)=>{const n=Xt(i,"seats",2),o=[Zt(0,0,e,t,0,!0),qt(0,t/2,e,t/2),qt(0,0,10,t/2),qt(0,t,10,t/2),qt(e,0,e-10,t/2),qt(e,t,e-10,t/2)];for(const i of ni(20,e-20,n))o.push(Zt(i-22,t/2-8,44,16,3));return o},trampoline:(e,t)=>[Kt(e/2,t/2,ei(e,t)/2),Kt(e/2,t/2,.42*ei(e,t)),Kt(e/2,t/2,ei(e,t)/2-2,!0)],pool:(e,t,i)=>{if(Jt(i,"round"))return[Kt(e/2,t/2,ei(e,t)/2),Kt(e/2,t/2,ei(e,t)/2-15)];const n=[Zt(0,0,e,t,20),Zt(15,15,e-30,t-30,12)];for(let e=1;e<=3;e++)n.push(qt(15+30*e,15,15+30*e,15+.3*t));return n},shed:(e,t)=>[Zt(0,0,e,t),qt(0,t/2,e,t/2),qt(.35*e,t,.65*e,t-.01),Zt(.35*e,t-4,.3*e,4)],greenhouse:(e,t)=>{const i=[Zt(0,0,e,t),qt(0,t/2,e,t/2)];for(const n of ii(0,e,ti(2,Math.round(e/60))))i.push(qt(n,0,n,t,!0));return i},raisedBed:(e,t)=>{const i=[Zt(0,0,e,t),Zt(6,6,e-12,t-12)];for(const n of ni(6,e-6,ti(2,Math.round(e/35))))for(const e of ni(6,t-6,ti(1,Math.round(t/35))))i.push(Kt(n,e,5));return i},planter:(e,t,i)=>[Jt(i,"round")?Gt(e/2,t/2,e/2,t/2):Zt(0,0,e,t,3),...gi.plant(.8*e,.8*t,{leaves:6}).map(i=>function(e,t,i){switch(e.t){case"rect":return{...e,x:e.x+t,y:e.y+i};case"ellipse":return{...e,cx:e.cx+t,cy:e.cy+i};case"line":return{...e,x1:e.x1+t,y1:e.y1+i,x2:e.x2+t,y2:e.y2+i};case"poly":return{...e,points:e.points.map(([e,n])=>[e+t,n+i])};case"path":case"icon":case"image":case"art":return e}}(i,.1*e,.1*t))],compost:(e,t)=>[Zt(0,0,e,t,2),...ii(0,e,3).map(e=>qt(e,0,e,t)),qt(0,.15*t,e,.15*t)],picnicTable:(e,t)=>[Zt(0,.28*t,e,.44*t,2),Zt(0,0,e,.2*t,1),Zt(0,.8*t,e,.2*t,1),qt(.15*e,.28*t,.15*e,.72*t,!0),qt(.85*e,.28*t,.85*e,.72*t,!0)],mower:(e,t,i)=>Jt(i,"riding")?[Zt(0,0,e,t,15),Zt(.3*e,.45*t,.4*e,.25*t,5),Kt(e/2,.25*t,.12*ei(e,t)),Zt(-6,.6*t,6,.3*t),Zt(e,.6*t,6,.3*t)]:[Zt(0,.35*t,e,.65*t,6),Kt(e/2,.67*t,.4*ei(e,.65*t)),qt(.2*e,.35*t,.3*e,0),qt(.8*e,.35*t,.7*e,0),qt(.3*e,0,.7*e,0)],wheelbarrow:(e,t)=>[Yt([[.1*e,.2*t],[.9*e,.2*t],[.75*e,.75*t],[.25*e,.75*t]]),Zt(.45*e,.78*t,.1*e,.22*t,2),qt(.2*e,.2*t,.15*e,0),qt(.8*e,.2*t,.85*e,0)],coop:(e,t)=>[Zt(0,0,.45*e,t),qt(0,t/2,.45*e,t/2),Zt(.45*e,0,.55*e,t,0,!0),...ii(.45*e,e,4).map(e=>qt(e,0,e,t,!0))],car:(e,t)=>[Zt(.06*e,0,.88*e,t,.22*ei(e,t)),Qt(`M${.12*e},${.3*t} Q${e/2},${.22*t} ${.88*e},${.3*t}`),Qt(`M${.14*e},${.82*t} Q${e/2},${.88*t} ${.86*e},${.82*t}`),qt(.12*e,.3*t,.14*e,.82*t),qt(.88*e,.3*t,.86*e,.82*t),Zt(0,.3*t,.06*e,.05*t,1),Zt(.94*e,.3*t,.06*e,.05*t,1)],motorcycle:(e,t)=>[Gt(e/2,t/2,.18*e,t/2),qt(0,.22*t,e,.22*t),Zt(.4*e,.45*t,.2*e,.22*t,3)],bicycle:(e,t)=>[Zt(.45*e,0,.1*e,.3*t,1),Zt(.45*e,.7*t,.1*e,.3*t,1),qt(e/2,.3*t,e/2,.7*t),qt(0,.12*t,e,.12*t),Zt(.42*e,.62*t,.16*e,.06*t,2)],scooter:(e,t)=>[Zt(.3*e,.1*t,.4*e,.8*t,3),qt(0,.05*t,e,.05*t)],boat:(e,t)=>[Qt(`M0,${t/2} Q${.25*e},0 ${e},${.35*t} L${e},${.65*t} Q${.25*e},${t} 0,${t/2} Z`),Gt(.5*e,t/2,.12*e,.2*t)],workbench:(e,t,i)=>{const n=[Zt(0,0,e,t),qt(0,t-4,e,t-4),Zt(e-22,t-10,18,14,1)];return Jt(i,"pegboard")&&n.push(qt(0,-6,e,-6,!0)),n},tableSaw:(e,t)=>[Zt(0,0,e,t,1),Zt(e/2-1,.3*t,2,.3*t),qt(.7*e,0,.7*e,t),Zt(.25*-e,0,.25*e,t,0,!0)],miterSaw:(e,t)=>[Zt(0,0,e,t,2),Kt(e/2,.45*t,.3*ei(e,t)),qt(0,.75*t,e,.75*t)],drillPress:(e,t)=>[Zt(0,0,e,t,2),Kt(e/2,.6*t,.25*ei(e,t)),Zt(.3*e,0,.4*e,.3*t,2)],compressor:(e,t)=>[Gt(e/2,.6*t,e/2,.4*t),Zt(.25*e,0,.5*e,.3*t,2),Kt(.2*e,.15*t,.1*ei(e,t))],generator:(e,t)=>[Zt(0,0,e,t,3),Zt(4,4,e-8,t-8,2),Kt(.3*e,t/2,.22*ei(e,t)),qt(.6*e,.3*t,.9*e,.3*t)],treadmill:(e,t)=>[Zt(0,0,e,t,4),Zt(.15*e,.18*t,.7*e,.78*t,2),Zt(0,0,e,.12*t,2)],elliptical:(e,t)=>[Zt(0,0,e,t,e/2),Gt(.3*e,.55*t,.12*e,.18*t),Gt(.7*e,.55*t,.12*e,.18*t),Zt(.2*e,0,.6*e,.12*t,2)],exerciseBike:(e,t)=>[Gt(e/2,t/2,.3*e,t/2),Zt(.35*e,.55*t,.3*e,.15*t,3),qt(0,.12*t,e,.12*t)],rower:(e,t)=>[Zt(.35*e,0,.3*e,t,3),Zt(.25*e,.55*t,.5*e,.12*t,3),Zt(0,0,e,.15*t,4),qt(.1*e,.2*t,.9*e,.2*t)],powerRack:(e,t)=>[Zt(0,0,e,t),...[[0,0],[e-8,0],[0,t-8],[e-8,t-8]].map(([e,t])=>Zt(e,t,8,8)),qt(-10,t/2,e+10,t/2),Zt(-14,t/2-12,4,24),Zt(e+10,t/2-12,4,24)],weightBench:(e,t)=>[Zt(.3*e,0,.4*e,t,4),qt(0,.18*t,e,.18*t),Zt(0,.18*t-10,5,20),Zt(e-5,.18*t-10,5,20)],dumbbellRack:(e,t)=>{const i=[Zt(0,0,e,t,2)];for(const n of ni(0,e,ti(3,Math.round(e/18))))i.push(Kt(n,.3*t,4),Kt(n,.7*t,4),qt(n,.3*t,n,.7*t));return i},poolTable:(e,t)=>[Zt(0,0,e,t,4),Zt(10,10,e-20,t-20),...[[10,10],[e/2,8],[e-10,10],[10,t-10],[e/2,t-8],[e-10,t-10]].map(([e,t])=>Kt(e,t,4))],pingPong:(e,t)=>[Zt(0,0,e,t),qt(e/2,-6,e/2,t+6),qt(0,t/2,e,t/2)],foosball:(e,t)=>{const i=[Zt(0,.15*t,e,.7*t,2)];for(const n of ii(0,e,8))i.push(qt(n,0,n,t),Zt(n-2,.45*t,4,.1*t));return i},airHockey:(e,t)=>[Zt(0,0,e,t,8),qt(e/2,0,e/2,t),Kt(e/2,t/2,.15*ei(e,t)),Zt(0,.35*t,3,.3*t),Zt(e-3,.35*t,3,.3*t)],arcade:(e,t)=>[Zt(0,0,e,t,2),Zt(.1*e,.1*t,.8*e,.45*t,2),qt(0,.7*t,e,.7*t),Kt(.3*e,.82*t,3),Kt(.6*e,.82*t,2),Kt(.72*e,.82*t,2)],piano:(e,t,i)=>{if(Jt(i,"grand"))return[Qt(`M0,0 L${.45*e},0 C${.75*e},0 ${.65*e},${.45*t} ${e},${.65*t} L${e},${t} L0,${t} Z`),Zt(0,.82*t,e,.18*t),...ii(0,e,Math.round(e/3.5)).map(e=>qt(e,.82*t,e,t))];const n=ei(16,.3*t),o=[Zt(0,0,e,t),Zt(.04*e,t-n,.92*e,n)];for(const i of ii(.04*e,.96*e,Math.round(e/3.5)))o.push(qt(i,t-n,i,t));return o},drumKit:(e,t)=>[Gt(e/2,.55*t,.18*e,.2*t),Kt(.33*e,.25*t,.1*ei(e,t)),Kt(.62*e,.22*t,.1*ei(e,t)),Kt(.78*e,.6*t,.14*ei(e,t)),Kt(.12*e,.3*t,.16*ei(e,t),!0),Kt(.88*e,.2*t,.16*ei(e,t),!0),Kt(.18*e,.68*t,.11*ei(e,t)),Kt(e/2,.92*t,.07*ei(e,t))],guitar:(e,t)=>[Kt(e/2,.78*t,.5*ei(e,.45*t)),Kt(e/2,.52*t,.38*ei(e,.35*t)),Zt(.45*e,0,.1*e,.45*t),Kt(e/2,.7*t,3)],easel:(e,t)=>[qt(.1*e,t,e/2,0),qt(.9*e,t,e/2,0),qt(e/2,0,e/2,.6*t),Zt(.15*e,.2*t,.7*e,3)],mat:(e,t)=>[Zt(0,0,e,t,3),Qt(`M${e-10},0 Q${e},${t/2} ${e-10},${t}`)],bag:(e,t)=>[Kt(e/2,t/2,ei(e,t)/2),Kt(e/2,t/2,.3*ei(e,t))],petBed:(e,t)=>[Gt(e/2,t/2,e/2,t/2),Gt(e/2,.55*t,.36*e,.33*t)],petCot:(e,t)=>{const i=ei(e,t),n=.07*i,o=.16*i,r=2.2*n;return[Zt(0,0,e,t,n),Zt(n,n,e-2*n,t-2*n,.4*n),Yt([[r+o,r],[e-r-o,r],[e-r,r+o],[e-r,t-r-o],[e-r-o,t-r],[r+o,t-r],[r,t-r-o],[r,r+o]],!0,!0),...[[.5*n,.5*n],[e-.5*n,.5*n],[e-.5*n,t-.5*n],[.5*n,t-.5*n]].map(([e,t])=>Kt(e??0,t??0,.75*n))]},petBolster:(e,t)=>{const i=.2*ei(e,t);return[Zt(0,0,e,t,.9*i),Zt(i,i,e-2*i,t-i-2,.5*i),qt(.4*i,t-1,i,t-1),qt(e-i,t-1,e-.4*i,t-1)]},petMattress:(e,t)=>{const i=.09*ei(e,t);return[Zt(0,0,e,t,i),Zt(i,i,e-2*i,t-2*i,.6*i,!0),...[.3,.7].flatMap(n=>[.25,.5,.75].map(o=>Kt(e*o,t*n,.3*i)))]},petDonut:(e,t)=>[Gt(e/2,t/2,e/2,t/2),Gt(e/2,t/2,.31*e,.31*t),Gt(e/2,t/2,.41*e,.41*t,void 0,!0)],petCave:(e,t)=>[Qt(`M${.12*e},${t} C${.04*-e},${.55*t} ${.15*e},0 ${e/2},0 C${.85*e},0 ${1.04*e},${.55*t} ${.88*e},${t} Z`),Qt(`M${.28*e},${t} Q${e/2},${.52*t} ${.72*e},${t}`),Qt(`M${.22*e},${.72*t} C${.18*e},${.3*t} ${.35*e},${.12*t} ${e/2},${.12*t} C${.65*e},${.12*t} ${.82*e},${.3*t} ${.78*e},${.72*t}`,!0)],shapeRect:(e,t,i)=>[i.corners?bi(e,t,ki("shapeRect",i),i):Zt(0,0,e,t)],shapeEllipse:(e,t)=>[Gt(e/2,t/2,e/2,t/2)],shapeTriangle:(e,t,i)=>[bi(e,t,ki("shapeTriangle",i),i)],shapeRightTriangle:(e,t,i)=>[bi(e,t,ki("shapeRightTriangle",i),i)],shapeDiamond:(e,t,i)=>[bi(e,t,ki("shapeDiamond",i),i)],shapePolygon:(e,t,i)=>[bi(e,t,ki("shapePolygon",i),i)],shapeStar:(e,t,i)=>[bi(e,t,ki("shapeStar",i),i)],shapeL:(e,t,i)=>[bi(e,t,ki("shapeL",i),i)],shapeU:(e,t,i)=>[bi(e,t,ki("shapeU",i),i)],shapePlus:(e,t,i)=>[bi(e,t,ki("shapePlus",i),i)],shapeArrow:(e,t,i)=>[bi(e,t,ki("shapeArrow",i),i)],shapeSemicircle:(e,t)=>[Qt(`M0,${t} A${e/2},${t} 0 0 1 ${e},${t} Z`)],shapeQuarter:(e,t)=>[Qt(`M0,0 A${e},${t} 0 0 1 ${e},${t} L0,${t} Z`)],shapeLine:(e,t)=>[qt(0,t/2,e,t/2)],shapeDashedLine:(e,t)=>[qt(0,t/2,e,t/2,!0)],shapeFreeform:(e,t,i)=>[bi(e,t,ki("shapeFreeform",i),i)],art:(e,t,i)=>[{t:"art",name:"string"==typeof i.art?i.art:"",w:e,d:t}],custom:(e,t,i)=>[{t:"image",id:"string"==typeof i.custom?i.custom:"",w:e,d:t}],catTree:(e,t)=>[Zt(0,0,e,t,2),Kt(.35*e,.35*t,.28*ei(e,t),!0),Kt(.68*e,.65*t,.25*ei(e,t),!0),Kt(.35*e,.35*t,4),Kt(.68*e,.65*t,4)],crate:(e,t)=>{const i=[Zt(0,0,e,t,2)];for(const n of ii(0,e,Math.round(e/8)))i.push(qt(n,0,n,t));return i.push(Zt(.3*e,t-3,.4*e,3)),i},bowls:(e,t)=>[Zt(0,0,e,t,t/2),Kt(.28*e,t/2,.35*t),Kt(.72*e,t/2,.35*t)],aquarium:(e,t)=>[Zt(0,0,e,t,1),Zt(3,3,e-6,t-6,0,!0),Qt(`M5,${t/2} Q${.25*e},${.3*t} ${e/2},${t/2} T${e-5},${t/2}`)],cage:(e,t,i)=>{if(Jt(i,"round"))return[Kt(e/2,t/2,ei(e,t)/2),...[0,1,2,3,4,5].map(i=>qt(e/2,t/2,e/2+Math.cos(i*Math.PI/3)*ei(e,t)/2,t/2+Math.sin(i*Math.PI/3)*ei(e,t)/2))];const n=[Zt(0,0,e,t,2)];for(const i of ii(0,e,Math.round(e/6)))n.push(qt(i,0,i,t));return n},playpen:(e,t)=>{const i=[Zt(0,0,e,t,3),Zt(5,5,e-10,t-10,2,!0)];for(let n=10;n<e-5;n+=10)i.push(qt(n,0,n,5),qt(n,t-5,n,t));return i},changingTable:(e,t)=>[Zt(0,0,e,t),Zt(.08*e,.12*t,.84*e,.76*t,8),qt(.3*e,.12*t,.3*e,.88*t)],highChair:(e,t)=>[Zt(.15*e,.25*t,.7*e,.6*t,4),Qt(`M${.1*e},${.25*t} Q${e/2},${.05*-t} ${.9*e},${.25*t}`),...[[0,t],[e,t],[0,0],[e,0]].map(([e,t])=>Kt(e,t,2))],teepee:(e,t)=>{const i=Array.from({length:6},(i,n)=>[e/2+Math.cos(n*Math.PI/3)*e/2,t/2+Math.sin(n*Math.PI/3)*t/2]);return[Yt(i),...i.map(([i,n])=>qt(e/2,t/2,i,n))]},ballPit:(e,t,i)=>{const n=[Jt(i,"round")?Gt(e/2,t/2,e/2,t/2):Zt(0,0,e,t,6)];for(const i of ni(.15*e,.85*e,5))for(const e of ni(.15*t,.85*t,4))n.push(Kt(i+7*e%5,e,3.5));return n},stroller:(e,t)=>[Zt(.1*e,.12*t,.8*e,.65*t,8),qt(0,.02*t,e,.02*t),...[[.05*e,.8*t],[.95*e,.8*t],[.05*e,.12*t],[.95*e,.12*t]].map(([e,t])=>Zt(e-2,t,4,12,1))],dollhouse:(e,t)=>[Zt(0,0,e,t),qt(0,.3*t,e,.3*t),qt(e/2,.3*t,e/2,t),qt(0,.65*t,e,.65*t)],playKitchen:(e,t)=>[Zt(0,0,e,t),Kt(.2*e,.45*t,6),Kt(.38*e,.45*t,6),Zt(.55*e,.2*t,.35*e,.55*t,4)],toyBox:(e,t)=>[Zt(0,0,e,t,3),qt(0,.2*t,e,.2*t),Kt(e/2,.6*t,.12*ei(e,t))]};function pi(e,t,i,n={}){return(gi[e]??gi.box)(t,i,e in gi?n:{x:!0})}function mi(e,t){return Math.min(.22*Math.min(e,t),6)}function fi(e,t,i){const n=e.length;if(n<2)return"";const o=e=>Math.round(100*e)/100,r=t=>{const o=e[t],r=e[(t-1+n)%n],s=e[(t+1)%n],a=Math.hypot(r[0]-o[0],r[1]-o[1])||1,l=Math.hypot(s[0]-o[0],s[1]-o[1])||1,c="number"==typeof i?i:i[t]??0,d=Math.max(0,Math.min(c,a/2,l/2));return{p:o,inn:[o[0]+(r[0]-o[0])/a*d,o[1]+(r[1]-o[1])/a*d],out:[o[0]+(s[0]-o[0])/l*d,o[1]+(s[1]-o[1])/l*d]}};if(!t){let t=`M${o(e[0][0])},${o(e[0][1])}`;for(let e=1;e<n-1;e++){const i=r(e);t+=` L${o(i.inn[0])},${o(i.inn[1])} Q${o(i.p[0])},${o(i.p[1])} ${o(i.out[0])},${o(i.out[1])}`}return t+=` L${o(e[n-1][0])},${o(e[n-1][1])}`,t}const s=r(0);let a=`M${o(s.out[0])},${o(s.out[1])}`;for(let e=1;e<=n;e++){const t=r(e%n);a+=` L${o(t.inn[0])},${o(t.inn[1])} Q${o(t.p[0])},${o(t.p[1])} ${o(t.out[0])},${o(t.out[1])}`}return`${a} Z`}function _i(e,t,i,n,o){const r=e.corners;if("string"!=typeof r||!r)return o;const s=r.split(",").map(Number),a=Math.min(t,i)/2;return Array.from({length:n},(e,t)=>{const i=s[t];return void 0!==i&&Number.isFinite(i)?Math.max(0,Math.min(100,i))/100*a:o})}const bi=(e,t,i,n={},o=!0)=>Qt(fi(i.map(([i,n])=>[i*e,n*t]),o,_i(n,e,t,i.length,mi(e,t))));const vi=(e,t=1,i=0)=>Array.from({length:e},(n,o)=>{const r=-Math.PI/2+i+o/e*Math.PI*2;return[.5+.5*Math.cos(r)*t,.5+.5*Math.sin(r)*t]}),yi={shapeRect:[[0,0],[1,0],[1,1],[0,1]],shapeTriangle:[[.5,0],[1,1],[0,1]],shapeRightTriangle:[[0,0],[1,1],[0,1]],shapeDiamond:[[.5,0],[1,.5],[.5,1],[0,.5]],shapeL:[[0,0],[.45,0],[.45,.55],[1,.55],[1,1],[0,1]],shapeU:[[0,0],[.3,0],[.3,.6],[.7,.6],[.7,0],[1,0],[1,1],[0,1]],shapePlus:[[.35,0],[.65,0],[.65,.35],[1,.35],[1,.65],[.65,.65],[.65,1],[.35,1],[.35,.65],[0,.65],[0,.35],[.35,.35]],shapeArrow:[[0,.32],[.68,.32],[.68,0],[1,.5],[.68,1],[.68,.68],[0,.68]],shapeFreeform:[[.1,.2],[.55,0],[1,.35],[.8,1],[.2,.85]]};function ki(e,t){if("shapePolygon"===e)return vi(Xt(t,"sides",6));if("shapeStar"===e){const e=Xt(t,"points",5),i=vi(e),n=vi(e,.45,Math.PI/e);return i.flatMap((e,t)=>[e,n[t]])}return yi[e]??[]}function wi(e,t,i,n,o){if(e.length<2)return[];const r=e.map(([e,n])=>[e*t,n*i]),s=_i(o?.length?{corners:o.join(",")}:{},t,i,r.length,6);return[Qt(fi(r,n,s))]}const xi=new Map;function Mi(e){return e.replace(/<svg(?=[\s>])[^>]*>/i,e=>e+"<style>rect,circle,ellipse,polygon,path{fill:#000 !important;fill-opacity:1 !important}</style>")}function $i(e,t,i=!1){const n=e.map((e,i)=>Si(e,`${e.dash?"fx dash":"fx"}${t&&0===i?" body":""}`)),o=e[0];return i&&o&&("image"===o.t?n.unshift(function(e){const t=ti(.01,e.w),i=ti(.01,e.d),n=xi.get(e.id);if(!n)return Z`<rect class="fx-solid" x="0" y="0" width=${t} height=${i} rx=${mi(t,i)}></rect>`;const o=`fx-solid-${e.id}-${Math.round(10*t)}x${Math.round(10*i)}`;return Z`<mask id=${o} style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width=${t} height=${i}>
      <image href=${n.solidHref} x="0" y="0" width=${t} height=${i} preserveAspectRatio="xMidYMid meet"></image>
    </mask>
    <rect class="fx-solid" x="0" y="0" width=${t} height=${i} mask="url(#${o})"></rect>`}(o)):"icon"===o.t?n.unshift(Z`<rect class="fx-solid" x="0" y="0" width=${ti(.01,o.w)} height=${ti(.01,o.d)} rx=${mi(o.w,o.d)}></rect>`):n.unshift(...e.filter(Li).map(e=>Si(e,"fx-solid")))),n}function Li(e){switch(e.t){case"rect":case"ellipse":case"art":return!0;case"poly":return e.closed;case"path":return/z/i.test(e.d);default:return!1}}function Si(e,t){switch(e.t){case"rect":{const i=ti(.01,e.w),n=ti(.01,e.h),o=ti(e.r??0,Math.min(.22*Math.min(i,n),6));return e.rot?Z`<rect class=${t} x=${e.x} y=${e.y} width=${i} height=${n} rx=${Math.min(o,Math.min(i,n)/2)} transform="rotate(${e.rot} ${e.x+i/2} ${e.y+n/2})"></rect>`:Z`<rect class=${t} x=${e.x} y=${e.y} width=${i} height=${n} rx=${Math.min(o,Math.min(i,n)/2)}></rect>`}case"art":{const i=Ot[e.name];return i?Z`<svg class=${t.includes("fx-solid")?"fx-art fx-art-solid":"fx-art"} x="0" y="0" width=${ti(.01,e.w)} height=${ti(.01,e.d)} viewBox="0 0 ${i.w} ${i.h}" preserveAspectRatio="none" overflow="visible">${Dt(i.svg)}</svg>`:Z``}case"icon":{const t=zt[e.name];if(!t)return Z``;const i=Math.min(e.w,e.d)/64;return Z`<g class="fx-icon" transform="translate(${(e.w-64*i)/2} ${(e.d-64*i)/2}) scale(${i})">${Dt(t.svg)}</g>`}case"image":{const t=xi.get(e.id),i=ti(.01,e.w),n=ti(.01,e.d);if(!t)return Z`<rect class="fx dash" x="0" y="0" width=${i} height=${n}></rect>`;if(t.colors)return Z`<image href=${t.href} x="0" y="0" width=${i} height=${n} preserveAspectRatio="xMidYMid meet"></image>`;const o=`fx-mask-${e.id}-${Math.round(10*i)}x${Math.round(10*n)}`;return Z`<mask id=${o} style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width=${i} height=${n}>
          <image href=${t.href} x="0" y="0" width=${i} height=${n} preserveAspectRatio="xMidYMid meet"></image>
        </mask>
        <rect class="fx-tint" x="0" y="0" width=${i} height=${n} mask="url(#${o})"></rect>`}case"ellipse":return e.rot?Z`<ellipse class=${t} cx=${e.cx} cy=${e.cy} rx=${ti(.01,e.rx)} ry=${ti(.01,e.ry)} transform="rotate(${e.rot} ${e.cx} ${e.cy})"></ellipse>`:Z`<ellipse class=${t} cx=${e.cx} cy=${e.cy} rx=${ti(.01,e.rx)} ry=${ti(.01,e.ry)}></ellipse>`;case"line":return Z`<line class=${t} x1=${e.x1} y1=${e.y1} x2=${e.x2} y2=${e.y2}></line>`;case"poly":{const i=e.points.map(([e,t])=>`${e},${t}`).join(" ");return e.closed?Z`<polygon class=${t} points=${i}></polygon>`:Z`<polyline class=${t} points=${i}></polyline>`}case"path":return Z`<path class=${t} d=${e.d}></path>`}}const Ci="\n  .fx {\n    fill: none;\n    stroke: var(--fx-color, currentColor);\n    stroke-width: var(--fx-stroke-width, 1.5px);\n    stroke-linecap: round;\n    stroke-linejoin: round;\n    vector-effect: non-scaling-stroke;\n  }\n  .fx.dash { stroke-dasharray: 4 3; }\n  .fx-icon {\n    fill: none;\n    color: var(--fx-color, currentColor);\n    stroke: var(--fx-color, currentColor);\n    stroke-width: var(--fx-stroke-width, 1.5px);\n    stroke-linecap: round;\n    stroke-linejoin: round;\n  }\n  .fx-icon * { vector-effect: non-scaling-stroke; }\n  .fx.body { fill: var(--fx-color, currentColor); fill-opacity: 0.16; }\n  .fx-tint { fill: var(--fx-color, currentColor); stroke: none; }\n  .fx-art * {\n    fill: none;\n    stroke: var(--fx-color, currentColor);\n    stroke-width: var(--fx-stroke-width, 1.5px);\n    stroke-linecap: round;\n    stroke-linejoin: round;\n    vector-effect: non-scaling-stroke;\n  }\n  .fx-art .thin { stroke-width: calc(var(--fx-stroke-width, 1.5px) * 0.55); }\n  .fx-art .thick { stroke-width: calc(var(--fx-stroke-width, 1.5px) * 1.7); }\n  .fx-art .dash { stroke-dasharray: 4 3; }\n  .fx-art .dot { fill: var(--fx-color, currentColor); }\n  .fx-art-solid * {\n    fill: color-mix(in srgb, var(--fx-color, currentColor) 10%, var(--sc-bg, #fff));\n    stroke: none;\n  }\n  .fx-solid {\n    fill: color-mix(in srgb, var(--fx-color, currentColor) 10%, var(--sc-bg, #fff));\n    stroke: none;\n  }\n",Pi=[{id:"living",icon:"mdi:sofa"},{id:"bedroom",icon:"mdi:bed"},{id:"kitchen",icon:"mdi:stove"},{id:"dining",icon:"mdi:table-chair"},{id:"bathroom",icon:"mdi:shower"},{id:"office",icon:"mdi:desk"},{id:"laundry",icon:"mdi:washing-machine"},{id:"electronics",icon:"mdi:television"},{id:"lighting",icon:"mdi:floor-lamp"},{id:"kids",icon:"mdi:baby-carriage"},{id:"entry",icon:"mdi:door-open"},{id:"outdoor",icon:"mdi:pine-tree"},{id:"garage",icon:"mdi:garage"},{id:"fitness",icon:"mdi:dumbbell"},{id:"pets",icon:"mdi:paw"},{id:"decor",icon:"mdi:flower"},{id:"icons",icon:"mdi:shape-outline"},{id:"shapes",icon:"mdi:shape-plus-outline"},{id:"custom",icon:"mdi:file-upload-outline"}],Ii=Object.entries(zt).map(([e,t])=>[`icon_${e}`,t.label,40,40,"icon",{icon:e}]),Hi="shape_freeform";function Ai(e){return!!e&&e.startsWith("shape_")}const Vi=[["living",[["sofa_2","Loveseat",150,90,"sofa",{seats:2}],["sofa_2_compact","Compact loveseat",130,82,"sofa",{seats:2}],["sofa_3","3-seat sofa",210,92,"sofa",{seats:3}],["sofa_3_large","Large 3-seat sofa",235,100,"sofa",{seats:3}],["sofa_4","4-seat sofa",270,100,"sofa",{seats:4}],["sofa_2_seat_armless","Armless sofa",160,88,"sofa",{seats:2,noArms:!0}],["sofa_sleeper","Sleeper sofa",200,95,"sofa",{seats:2}],["sofa_futon","Futon",190,85,"sofa",{seats:3,noArms:!0}],["sofa_reclining_2","Reclining loveseat",165,98,"sofa",{seats:2,recliner:!0}],["sofa_reclining_3","Reclining sofa",220,100,"sofa",{seats:3,recliner:!0}],["sectional_l_left","L-sectional (left chaise)",280,170,"sectional",{seats:3}],["sectional_l_right","L-sectional (right chaise)",280,170,"sectional",{seats:3},!0],["sectional_l_large_left","Large L-sectional (left)",320,230,"sectional",{seats:3,chaise:100}],["sectional_l_large_right","Large L-sectional (right)",320,230,"sectional",{seats:3,chaise:100},!0],["sectional_corner_left","Corner sectional (left)",260,260,"sectional",{seats:2}],["sectional_corner_right","Corner sectional (right)",260,260,"sectional",{seats:2},!0],["sectional_u","U-shaped sectional",340,220,"uSectional"],["chaise_lounge","Chaise lounge",165,70,"chaise"],["daybed_lounge","Lounge daybed",200,90,"chaise"],["armchair","Armchair",85,85,"sofa",{seats:1}],["armchair_club","Club chair",90,90,"sofa",{seats:1}],["armchair_wingback","Wingback chair",80,85,"sofa",{seats:1}],["armchair_accent","Accent chair",70,75,"chair",{arms:!0}],["armchair_slipper","Slipper chair",65,72,"chair"],["recliner","Recliner",90,95,"sofa",{seats:1,recliner:!0}],["recliner_lift","Lift recliner",85,95,"sofa",{seats:1,recliner:!0}],["glider","Glider",75,85,"chair",{arms:!0,rocker:!0}],["rocking_chair","Rocking chair",65,85,"chair",{arms:!0,rocker:!0}],["swivel_chair","Swivel chair",80,80,"stool"],["egg_chair","Egg chair",85,80,"circle",{inner:.65}],["papasan","Papasan chair",110,110,"circle",{inner:.7}],["ottoman_square","Ottoman",60,60,"ottoman"],["ottoman_rect","Rectangular ottoman",110,60,"ottoman"],["ottoman_round","Round ottoman",70,70,"ottoman",{round:!0}],["ottoman_cocktail","Cocktail ottoman",120,80,"ottoman"],["pouf","Pouf",50,50,"pouf"],["beanbag_small","Bean bag (small)",80,80,"beanbag"],["beanbag_large","Bean bag (large)",120,110,"beanbag"],["floor_cushion","Floor cushion",70,70,"ottoman"],["coffee_table","Coffee table",110,60,"table"],["coffee_table_large","Large coffee table",130,70,"table"],["coffee_table_round","Round coffee table",90,90,"roundTable"],["coffee_table_oval","Oval coffee table",120,65,"table",{shape:"oval"}],["coffee_table_square","Square coffee table",90,90,"table"],["coffee_table_glass","Glass coffee table",115,60,"table",{glass:!0}],["side_table","Side table",50,50,"table"],["side_table_round","Round side table",50,50,"roundTable"],["side_table_c","C-table",45,35,"table"],["nesting_tables","Nesting tables",60,45,"box",{inset:6}],["console_table","Console table",120,35,"console"],["sofa_table","Sofa table",150,35,"console"],["tv_stand_small","TV stand (small)",100,40,"tvStand"],["tv_stand","TV stand",150,45,"tvStand"],["tv_stand_large","TV stand (large)",200,45,"tvStand"],["media_console","Media console",180,45,"tvStand"],["entertainment_center","Entertainment center",250,55,"cabinet",{doors:5}],["bookcase_small","Bookcase (small)",80,30,"shelf"],["bookcase","Bookcase",90,35,"shelf"],["bookcase_wide","Wide bookcase",160,35,"shelf"],["bookcase_corner","Corner bookcase",60,60,"box",{x:!0}],["floating_shelf_60","Floating shelf 60 cm",60,20,"floatingShelf"],["floating_shelf_90","Floating shelf 90 cm",90,25,"floatingShelf"],["floating_shelf_120","Floating shelf 120 cm",120,25,"floatingShelf"],["floating_shelf_180","Floating shelf 180 cm",180,25,"floatingShelf"],["cube_shelf_2x2","Cube shelf 2×2",78,39,"cubby",{cols:2}],["cube_shelf_4x4","Cube shelf 4×4",147,39,"cubby",{cols:4}],["display_cabinet","Display cabinet",100,45,"cabinet",{doors:2}],["curio_cabinet","Curio cabinet",80,40,"cabinet",{doors:1}],["bar_cabinet","Bar cabinet",100,50,"cabinet",{doors:2}],["fireplace","Fireplace",150,70,"fireplace"],["fireplace_large","Large fireplace",200,80,"fireplace"],["fireplace_electric","Electric fireplace",120,35,"fireplace",{noHearth:!0}],["wood_stove","Wood stove",70,70,"stove"],["upright_piano","Upright piano",150,60,"piano"],["baby_grand_piano","Baby grand piano",150,160,"piano",{grand:!0}],["grand_piano","Grand piano",155,210,"piano",{grand:!0}],["piano_bench","Piano bench",75,38,"bench",{slats:1}],["magazine_rack","Magazine rack",40,30,"rack",{rails:3}],["blanket_ladder","Blanket ladder",50,10,"ladder"]]],["bedroom",[["bed_twin","Twin bed",99,190,"bed"],["bed_twin_xl","Twin XL bed",99,203,"bed"],["bed_full","Full / double bed",137,190,"bed"],["bed_queen","Queen bed",152,203,"bed"],["bed_king","King bed",193,203,"bed"],["bed_cal_king","California king bed",183,213,"bed"],["bed_single_eu","Single bed (EU)",90,200,"bed"],["bed_double_eu","Double bed (EU)",140,200,"bed"],["bed_king_eu","King bed (EU)",160,200,"bed"],["bed_super_king","Super king bed",180,200,"bed"],["bed_queen_frame","Queen bed with frame",165,220,"bed"],["bed_king_frame","King bed with frame",205,220,"bed"],["daybed","Daybed",100,200,"bed",{pillows:1}],["daybed_trundle","Daybed with trundle",100,200,"bed",{pillows:1,trundle:!0}],["bunk_bed","Bunk bed",105,200,"bed",{bunk:!0,pillows:1}],["bunk_bed_full","Twin-over-full bunk bed",145,200,"bed",{bunk:!0}],["loft_bed","Loft bed",105,200,"bed",{bunk:!0,pillows:1}],["murphy_bed","Murphy bed (folded)",160,45,"cabinet",{doors:2}],["futon_bed","Futon bed",140,190,"bed"],["mattress_floor","Floor mattress",140,200,"rounded",{k:.05}],["nightstand","Nightstand",50,40,"drawers",{cols:1}],["nightstand_small","Small nightstand",40,35,"drawers",{cols:1}],["nightstand_wide","Wide nightstand",65,42,"drawers",{cols:1}],["dresser_small","Dresser (small)",80,45,"drawers",{cols:1}],["dresser","Dresser",120,50,"drawers",{cols:2}],["dresser_wide","Wide dresser",160,50,"drawers",{cols:3}],["tall_chest","Tall chest of drawers",85,48,"drawers",{cols:1}],["lingerie_chest","Lingerie chest",55,40,"drawers",{cols:1}],["wardrobe_small","Wardrobe (single)",60,60,"wardrobe"],["wardrobe","Wardrobe",100,60,"wardrobe"],["wardrobe_large","Wardrobe (large)",150,60,"wardrobe"],["wardrobe_xl","Wardrobe (extra large)",200,60,"wardrobe"],["armoire","Armoire",110,60,"wardrobe"],["closet_rod_120","Closet rod & shelf 1.2 m",120,60,"closetRod"],["closet_rod_180","Closet rod & shelf 1.8 m",180,60,"closetRod"],["closet_rod_240","Closet rod & shelf 2.4 m",240,60,"closetRod"],["closet_island","Closet island",120,60,"drawers",{cols:2}],["vanity_table","Vanity table",100,45,"desk",{drawers:!0}],["vanity_stool","Vanity stool",45,35,"ottoman"],["bed_bench","End-of-bed bench",130,40,"bench",{slats:2}],["blanket_chest","Blanket chest",100,45,"chest"],["trunk","Trunk",90,50,"chest"],["hamper","Laundry hamper",45,35,"trash"],["shoe_rack","Shoe rack",80,30,"rack",{rails:2}],["valet_stand","Valet stand",45,35,"box",{x:!0}],["full_length_mirror","Full-length mirror",50,6,"mirror"],["jewelry_armoire","Jewelry armoire",45,35,"drawers",{cols:1}],["reading_chair","Reading chair",80,85,"sofa",{seats:1}],["bedroom_rug","Bedside rug",80,150,"rug"],["headboard","Headboard (wall)",165,8,"box",{}],["bed_canopy","Canopy bed",170,220,"bed"],["sleeping_bag","Air mattress",150,200,"rounded",{k:.08}],["fan_bedside","Bedside fan",30,30,"floorFan"],["humidifier_bedroom","Bedroom humidifier",30,25,"rounded",{k:.4}],["safe_closet","Closet safe",45,40,"box",{inset:4}]]],["kitchen",[["base_cabinet_30","Base cabinet 30 cm",30,60,"cabinet",{doors:1}],["base_cabinet_40","Base cabinet 40 cm",40,60,"cabinet",{doors:1}],["base_cabinet_45","Base cabinet 45 cm",45,60,"cabinet",{doors:1}],["base_cabinet_60","Base cabinet 60 cm",60,60,"cabinet",{doors:1}],["base_cabinet_80","Base cabinet 80 cm",80,60,"cabinet",{doors:2}],["base_cabinet_90","Base cabinet 90 cm",90,60,"cabinet",{doors:2}],["base_cabinet_120","Base cabinet 120 cm",120,60,"cabinet",{doors:2}],["drawer_base_60","Drawer base 60 cm",60,60,"drawers",{cols:1}],["drawer_base_90","Drawer base 90 cm",90,60,"drawers",{cols:2}],["corner_base_cabinet","Corner base cabinet",90,90,"cabinet",{doors:1,x:!0}],["lazy_susan","Lazy Susan corner",90,90,"circle",{inner:.5}],["wall_cabinet_30","Wall cabinet 30 cm",30,35,"cabinet",{doors:1,dash:!0}],["wall_cabinet_60","Wall cabinet 60 cm",60,35,"cabinet",{doors:1,dash:!0}],["wall_cabinet_80","Wall cabinet 80 cm",80,35,"cabinet",{doors:2,dash:!0}],["wall_cabinet_90","Wall cabinet 90 cm",90,35,"cabinet",{doors:2,dash:!0}],["wall_cabinet_120","Wall cabinet 120 cm",120,35,"cabinet",{doors:2,dash:!0}],["pantry_cabinet","Pantry cabinet",60,60,"cabinet",{doors:1,x:!0}],["pantry_cabinet_wide","Wide pantry cabinet",90,60,"cabinet",{doors:2,x:!0}],["tall_cabinet","Tall cabinet",45,60,"cabinet",{doors:1,x:!0}],["countertop_60","Countertop 60 cm",60,64,"counter"],["countertop_120","Countertop 120 cm",120,64,"counter"],["countertop_180","Countertop 180 cm",180,64,"counter"],["countertop_240","Countertop 240 cm",240,64,"counter"],["sink_single","Kitchen sink (single)",80,60,"sink",{basins:1}],["sink_double","Kitchen sink (double)",90,60,"sink",{basins:2}],["sink_single_rear_drain","Kitchen sink (rear right drain)",80,60,"sink",{basins:1,rearDrain:!0}],["sink_double_rear_drain","Double sink (rear right drains)",90,60,"sink",{basins:2,rearDrain:!0}],["sink_double_wide","Wide double sink",120,60,"sink",{basins:2}],["sink_farmhouse","Farmhouse sink",90,64,"sink",{basins:1,apron:!0}],["sink_bezelless_offset","Bezelless sink (offset drain)",76,56,"bezellessSink"],["sink_bezelless_square","Bezelless square sink (offset drain)",51,56,"bezellessSink"],["sink_bezelless_centre","Bezelless sink (centre drain)",76,56,"bezellessSink",{centreDrain:!0}],["sink_bar","Bar sink",45,50,"sink",{basins:1}],["sink_prep","Prep sink",50,50,"sink",{basins:1}],["range_50","Range 50 cm",50,60,"range",{burners:4}],["range_60","Range 60 cm",60,64,"range",{burners:4}],["range_76","Range 76 cm (30 in)",76,66,"range",{burners:4}],["range_90","Range 90 cm",90,66,"range",{burners:5}],["range_91_six","Range 91 cm, 6 burners",91,68,"range",{burners:6}],["range_122","Range 122 cm (48 in)",122,70,"range",{burners:6,griddle:!0}],["cooktop_60","Cooktop 60 cm",60,52,"range",{burners:4,noBack:!0}],["cooktop_76","Cooktop 76 cm",76,52,"range",{burners:5,noBack:!0}],["cooktop_91","Cooktop 91 cm",91,53,"range",{burners:5,noBack:!0}],["induction_hob","Induction hob",60,52,"range",{burners:4,noBack:!0}],["wall_oven","Wall oven",76,60,"appliance",{window:!0}],["double_wall_oven","Double wall oven",76,64,"appliance",{window:!0}],["range_hood","Range hood",76,50,"hood"],["range_hood_wide","Wide range hood",91,55,"hood"],["microwave_otr","Over-range microwave",76,40,"appliance",{window:!0,r:1}],["microwave","Countertop microwave",50,38,"appliance",{window:!0}],["fridge_top_freezer","Fridge (top freezer)",70,75,"fridge"],["fridge_bottom_freezer","Fridge (bottom freezer)",76,80,"fridge"],["fridge_french_door","French-door fridge",91,86,"fridge",{doors:2}],["fridge_side_by_side","Side-by-side fridge",91,84,"fridge",{doors:2}],["fridge_counter_depth","Counter-depth fridge",91,70,"fridge",{doors:2}],["fridge_eu","Fridge freezer (EU)",60,65,"fridge"],["fridge_mini","Mini fridge",48,50,"fridge"],["wine_fridge","Wine fridge",60,58,"fridge",{x:!0}],["beverage_center","Beverage center",60,60,"fridge"],["freezer_upright","Upright freezer",70,72,"fridge"],["freezer_chest","Chest freezer",110,70,"chest"],["dishwasher_45","Dishwasher 45 cm",45,60,"dishwasher"],["dishwasher_60","Dishwasher 60 cm",60,60,"dishwasher"],["trash_compactor","Trash compactor",38,60,"counter",{x:!0}],["island_small","Kitchen island (small)",120,70,"island"],["island","Kitchen island",180,90,"island"],["island_seating","Island with seating",200,140,"island",{seats:3}],["island_sink","Island with sink",220,110,"island",{sink:!0}],["island_cooktop","Island with cooktop",220,110,"island",{hob:!0}],["peninsula","Peninsula",180,100,"island",{seats:2}],["kitchen_cart","Kitchen cart",80,45,"cart"],["butcher_block","Butcher block",60,60,"box",{inset:5}],["bar_stool","Bar stool",40,40,"stool"],["counter_stool","Counter stool",42,42,"stool"],["toaster","Toaster",30,20,"appliance",{slots:!0}],["toaster_oven","Toaster oven",45,35,"appliance",{window:!0}],["coffee_maker","Coffee maker",25,25,"appliance",{jug:!0}],["espresso_machine","Espresso machine",35,40,"appliance",{dial:!0}],["stand_mixer","Stand mixer",35,25,"appliance",{bowl:!0}],["kettle","Kettle",22,18,"puck"],["blender","Blender",18,18,"puck"],["air_fryer","Air fryer",30,35,"appliance",{dial:!0,r:8}],["pressure_cooker","Pressure cooker",32,32,"puck"],["rice_cooker","Rice cooker",28,28,"puck"],["bread_maker","Bread maker",30,40,"appliance",{window:!0}],["food_processor","Food processor",25,25,"puck"],["water_dispenser","Water dispenser",32,32,"appliance",{dial:!0}],["kitchen_trash","Kitchen trash can",40,30,"trash"],["recycling_bin","Recycling bin",40,30,"trash"],["step_bin","Step bin",30,30,"trash",{round:!0}],["kitchen_scale","Kitchen scale",20,20,"device",{screen:!0}],["spice_rack","Spice rack",40,12,"rack",{rails:2}],["knife_block","Knife block",15,22,"rack",{rails:3}],["dish_rack","Dish rack",45,32,"rack",{rails:4}],["breakfast_bar","Breakfast bar",150,45,"console"]]],["dining",[["dining_table_2","Dining table for 2",75,165,"table",{top:1,bottom:1}],["dining_table_4","Dining table for 4",120,170,"table",{top:2,bottom:2}],["dining_table_4_square","Square table for 4",175,175,"table",{top:1,bottom:1,left:1,right:1}],["dining_table_6","Dining table for 6",180,180,"table",{top:3,bottom:3}],["dining_table_6_ends","Table for 6 (ends)",230,180,"table",{top:2,bottom:2,left:1,right:1}],["dining_table_8","Dining table for 8",290,180,"table",{top:3,bottom:3,left:1,right:1}],["dining_table_8_square","Square table for 8",240,240,"table",{top:2,bottom:2,left:2,right:2}],["dining_table_10","Dining table for 10",330,190,"table",{top:4,bottom:4,left:1,right:1}],["dining_table_12","Dining table for 12",400,190,"table",{top:5,bottom:5,left:1,right:1}],["dining_round_2","Round table for 2",160,160,"roundTable",{chairs:2}],["dining_round_4","Round table for 4",190,190,"roundTable",{chairs:4}],["dining_round_5","Round table for 5",210,210,"roundTable",{chairs:5}],["dining_round_6","Round table for 6",230,230,"roundTable",{chairs:6}],["dining_round_8","Round table for 8",270,270,"roundTable",{chairs:8,pedestal:!0}],["dining_oval_6","Oval table for 6",260,190,"table",{top:2,bottom:2,left:1,right:1,shape:"oval"}],["dining_oval_8","Oval table for 8",320,190,"table",{top:3,bottom:3,left:1,right:1,shape:"oval"}],["dining_table_only_4","Dining table (4-seat, no chairs)",120,80,"table"],["dining_table_only_6","Dining table (6-seat, no chairs)",180,90,"table"],["dining_table_only_8","Dining table (8-seat, no chairs)",240,100,"table"],["dining_round_only","Round dining table (no chairs)",110,110,"roundTable",{pedestal:!0}],["dining_chair","Dining chair",45,50,"chair"],["dining_armchair","Dining armchair",58,55,"chair",{arms:!0}],["dining_bench","Dining bench",140,38,"bench",{slats:2}],["dining_bench_back","Dining bench with back",140,50,"bench",{back:!0,slats:2}],["banquette","Banquette",180,60,"sofa",{seats:3,noArms:!0}],["banquette_corner","Corner banquette",180,180,"sectional",{seatDepth:60,chaise:60,seats:2}],["buffet","Buffet / sideboard",160,45,"cabinet",{doors:3}],["sideboard_small","Small sideboard",120,42,"cabinet",{doors:2}],["china_cabinet","China cabinet",120,45,"cabinet",{doors:2,x:!0}],["hutch","Hutch",140,50,"cabinet",{doors:3}],["bar_cart","Bar cart",75,42,"cart"],["home_bar","Home bar counter",180,60,"counter"],["high_top_table","High-top table",70,70,"roundTable",{pedestal:!0}],["pub_table_set","Pub table set",160,160,"roundTable",{chairs:4}],["wine_rack","Wine rack",60,30,"cubby",{cols:4}],["tea_trolley","Tea trolley",70,45,"cart"]]],["bathroom",[["toilet","Toilet",40,70,"toilet"],["toilet_elongated","Toilet (elongated)",40,75,"toilet"],["toilet_compact","Compact toilet",36,60,"toilet"],["toilet_wall_hung","Wall-hung toilet",36,54,"toilet",{wallHung:!0}],["bidet","Bidet",38,55,"bidet"],["urinal","Urinal",40,35,"urinal"],["vanity_60","Vanity 60 cm",60,48,"vanity"],["vanity_76","Vanity 76 cm",76,53,"vanity"],["vanity_91","Vanity 91 cm",91,55,"vanity"],["vanity_122","Vanity 122 cm",122,55,"vanity"],["vanity_double_152","Double vanity 152 cm",152,55,"vanity",{basins:2}],["vanity_double_183","Double vanity 183 cm",183,55,"vanity",{basins:2}],["vanity_60_rect","Vanity 60 cm (rectangular sink)",60,48,"vanity",{rect:!0}],["vanity_76_rect","Vanity 76 cm (rectangular sink)",76,53,"vanity",{rect:!0}],["vanity_91_rect","Vanity 91 cm (rectangular sink)",91,55,"vanity",{rect:!0}],["vanity_122_rect","Vanity 122 cm (rectangular sink)",122,55,"vanity",{rect:!0}],["vanity_double_152_rect","Double vanity 152 cm (rectangular sinks)",152,55,"vanity",{basins:2,rect:!0}],["vanity_double_183_rect","Double vanity 183 cm (rectangular sinks)",183,55,"vanity",{basins:2,rect:!0}],["vanity_trough_122","Trough vanity 122 cm (two taps)",122,55,"vanity",{trough:!0,taps:2}],["vanity_trough_152","Trough vanity 152 cm (two taps)",152,55,"vanity",{trough:!0,taps:2}],["pedestal_sink","Pedestal sink",55,45,"pedestalSink"],["wall_sink","Wall-mounted sink",50,38,"pedestalSink"],["corner_sink","Corner sink",45,45,"cornerTub"],["bathtub_152","Bathtub 152 cm",152,76,"bathtub"],["bathtub_167","Bathtub 167 cm",167,76,"bathtub"],["bathtub_183","Bathtub 183 cm",183,81,"bathtub"],["bathtub_eu","Bathtub (EU) 170 cm",170,75,"bathtub"],["bathtub_freestanding","Freestanding tub",170,80,"bathtub",{free:!0}],["bathtub_clawfoot","Clawfoot tub",167,76,"bathtub",{free:!0,claw:!0}],["bathtub_corner","Corner tub",150,150,"cornerTub"],["bathtub_whirlpool","Whirlpool tub",183,91,"bathtub",{jets:!0}],["shower_76","Shower 76×76",76,76,"shower"],["shower_91","Shower 91×91",91,91,"shower"],["shower_90_eu","Shower 90×90",90,90,"shower"],["shower_107","Shower 107×91",107,91,"shower"],["shower_122","Shower 122×91",122,91,"shower"],["shower_152","Shower 152×81",152,81,"shower"],["shower_neo_angle","Neo-angle shower",100,100,"neoAngleShower"],["shower_walk_in","Walk-in shower",150,100,"shower",{walkIn:!0}],["shower_tub_combo","Tub/shower combo",152,76,"bathtub"],["shower_bench","Shower bench",60,30,"bench",{slats:3}],["linen_cabinet","Linen cabinet",45,35,"cabinet",{doors:1}],["linen_tower","Linen tower",40,30,"cabinet",{doors:1,x:!0}],["over_toilet_storage","Over-toilet storage",60,25,"shelf",{bay:60}],["medicine_cabinet","Medicine cabinet",60,15,"cabinet",{doors:1,dash:!0}],["towel_rail_heated","Heated towel rail",60,10,"towelRail"],["towel_bar","Towel bar",60,8,"box",{r:3}],["bathroom_hamper","Bathroom hamper",40,30,"trash"],["bath_mat","Bath mat",80,50,"rug"],["bathroom_scale","Bathroom scale",30,30,"device",{screen:!0}],["bathroom_trash","Bathroom trash bin",25,25,"trash",{round:!0}],["bathroom_stool","Bathroom stool",35,35,"stool"],["makeup_vanity","Makeup vanity",100,45,"desk",{drawers:!0}],["sauna_2","Sauna (2-person)",120,105,"bench",{slats:4,back:!0}],["steam_shower","Steam shower",120,90,"shower"],["exhaust_fan","Bathroom exhaust fan",25,25,"grille",{lines:5}]]],["office",[["monitor_curved_34","Curved monitor 34″ (1000R)",84,20,"art",{art:"monitor_curved_34"}],["desk_small","Desk (small)",100,50,"desk"],["desk","Desk",140,70,"desk",{monitor:!0}],["desk_large","Desk (large)",180,80,"desk",{monitor:!0,drawers:!0}],["desk_with_chair","Desk with chair",140,130,"desk",{desk:70,monitor:!0}],["desk_writing","Writing desk",110,55,"desk"],["desk_executive","Executive desk",180,90,"desk",{drawers:!0}],["desk_standing","Standing desk",150,75,"desk",{monitor:!0}],["desk_corner","Corner desk",120,120,"lDesk",{desk:60}],["desk_l_left","L-desk (left return)",160,140,"lDesk",{desk:60,chair:!0}],["desk_l_right","L-desk (right return)",160,140,"lDesk",{desk:60,chair:!0},!0],["desk_u","U-shaped desk",200,180,"uDesk"],["desk_computer","Computer desk",120,60,"desk",{monitor:!0}],["desk_chair","Desk chair",48,55,"deskChair"],["printer_3d","3D printer",40,46,"printer3d"],["printer_3d_enclosed","3D printer (enclosed)",46,54,"printer3d",{enclosed:!0}],["office_chair","Office chair",65,65,"officeChair"],["executive_chair","Executive chair",72,72,"officeChair"],["gaming_chair","Gaming chair",70,70,"officeChair"],["drafting_stool","Drafting stool",55,55,"officeChair"],["guest_chair","Guest chair",58,58,"chair",{arms:!0}],["kneeling_chair","Kneeling chair",50,70,"bench",{slats:2}],["conference_table_6","Conference table for 6",270,180,"table",{top:2,bottom:2,left:1,right:1,r:20}],["conference_table_8","Conference table for 8",330,190,"table",{top:3,bottom:3,left:1,right:1,r:20}],["conference_table_10","Conference table for 10",400,200,"table",{top:4,bottom:4,left:1,right:1,r:25}],["conference_table_12","Conference table for 12",470,210,"table",{top:5,bottom:5,left:1,right:1,r:25}],["meeting_round_4","Round meeting table",200,200,"roundTable",{chairs:4}],["file_cabinet_2","Filing cabinet (2 drawer)",40,60,"drawers",{cols:1}],["file_cabinet_3","Filing cabinet (3 drawer)",40,65,"drawers",{cols:1}],["file_cabinet_4","Filing cabinet (4 drawer)",45,70,"drawers",{cols:1}],["file_cabinet_lateral","Lateral file cabinet",90,50,"drawers",{cols:1}],["mobile_pedestal","Mobile pedestal",40,55,"drawers",{cols:1}],["credenza","Credenza",180,50,"cabinet",{doors:4}],["office_bookcase","Office bookcase",90,38,"shelf"],["storage_cabinet","Storage cabinet",90,45,"cabinet",{doors:2}],["printer","Printer",45,40,"printer"],["printer_large","Office copier",60,65,"printer"],["shredder","Paper shredder",35,25,"trash"],["safe","Safe",50,50,"device",{button:!0}],["whiteboard","Whiteboard (wall)",180,6,"box",{r:1}],["corkboard","Corkboard (wall)",90,4,"box",{r:1}],["drafting_table","Drafting table",120,80,"desk"],["monitor_stand","Monitor arm/stand",70,25,"monitor"],["mail_sorter","Mail sorter",40,25,"cubby",{cols:3}],["office_plant","Office plant",45,45,"plant"],["office_couch","Office couch",180,85,"sofa",{seats:2}],["podium","Lectern",60,50,"box",{inset:6}]]],["laundry",[["washer_front","Washer (front-load)",68,75,"washer"],["washer_top","Washer (top-load)",68,70,"washer",{top:!0}],["washer_eu","Washing machine (EU)",60,60,"washer"],["dryer","Dryer",68,75,"washer",{dryer:!0}],["dryer_eu","Tumble dryer (EU)",60,60,"washer",{dryer:!0}],["washer_dryer_stack","Stacked washer/dryer",68,78,"washer",{stack:!0}],["washer_dryer_combo","Washer-dryer combo",60,60,"washer",{dryer:!0}],["laundry_sink","Laundry sink",60,55,"sink",{basins:1}],["utility_sink","Utility sink",60,60,"sink",{basins:1}],["laundry_pedestal","Laundry pedestal",68,70,"drawers",{cols:1}],["laundry_counter","Laundry folding counter",140,60,"counter"],["laundry_cabinet","Laundry cabinet",90,35,"cabinet",{doors:2,dash:!0}],["ironing_board","Ironing board",130,38,"ironingBoard"],["drying_rack","Drying rack",110,55,"rack",{rails:6}],["laundry_basket","Laundry basket",55,40,"trash"],["water_heater_40","Water heater (150 L)",50,50,"waterHeater"],["water_heater_50","Water heater (190 L)",56,56,"waterHeater"],["water_heater_80","Water heater (300 L)",66,66,"waterHeater"],["water_heater_tankless","Tankless water heater",45,25,"waterHeater",{tankless:!0}],["heat_pump_water_heater","Heat-pump water heater",62,62,"waterHeater"],["furnace","Furnace",55,75,"furnace"],["air_handler","Air handler",55,60,"furnace"],["boiler","Boiler",45,40,"device",{button:!0}],["water_softener","Water softener",70,40,"tank",{tanks:1,brine:!0}],["water_filter_system","Whole-house water filter",50,25,"tank",{tanks:2}],["pressure_tank","Well pressure tank",55,55,"tank",{tanks:1}],["sump_pump","Sump pit",50,50,"circle",{inner:.6}],["electrical_panel","Electrical panel",40,12,"electricalPanel"],["electrical_subpanel","Sub-panel",30,10,"electricalPanel"],["dehumidifier","Dehumidifier",38,28,"grille",{lines:4}],["humidifier","Humidifier",35,25,"grille",{lines:3,r:8}],["robot_vacuum_dock","Robot vacuum dock",35,40,"puck"],["stick_vacuum","Stick vacuum (stand)",25,25,"puck"],["mop_bucket","Mop bucket",40,30,"trash"],["utility_shelf","Utility shelving",90,45,"shelf",{bay:90}],["broom_cabinet","Broom cabinet",60,40,"cabinet",{doors:1}],["step_stool","Step stool",40,45,"bench",{slats:2}],["step_ladder","Step ladder",50,70,"ladder"],["recirculation_pump","Recirculation pump",20,15,"device",{fan:!0}]]],["electronics",[["record_player","Record player",45,36,"art",{art:"record_player"}],["sonos_one","Sonos One",12,12,"art",{art:"sonos_one"}],["sonos_era_100","Sonos Era 100",12,13,"art",{art:"sonos_era_100"}],["sonos_beam","Sonos Beam",65.1,10,"art",{art:"sonos_beam"}],["sonos_ray","Sonos Ray",55.9,9.5,"art",{art:"sonos_ray"}],["sonos_roam","Sonos Roam",6.2,6,"art",{art:"sonos_roam"}],["tv_wall_43","Wall-mounted TV 43″",96.5,6,"art",{art:"tv_wall_43"}],["tv_wall_50","Wall-mounted TV 50″",112,6,"art",{art:"tv_wall_50"}],["tv_wall_55","Wall-mounted TV 55″",123,6,"art",{art:"tv_wall_55"}],["tv_wall_65","Wall-mounted TV 65″",145,6,"art",{art:"tv_wall_65"}],["tv_wall_75","Wall-mounted TV 75″",168,6,"art",{art:"tv_wall_75"}],["tv_wall_85","Wall-mounted TV 85″",190,6,"art",{art:"tv_wall_85"}],["tv_32",'TV 32"',73,18,"tv",{stand:!0}],["tv_43",'TV 43"',97,22,"tv",{stand:!0}],["tv_50",'TV 50"',112,25,"tv",{stand:!0}],["tv_55",'TV 55"',123,26,"tv",{stand:!0}],["tv_65",'TV 65"',145,30,"tv",{stand:!0}],["tv_75",'TV 75"',168,35,"tv",{stand:!0}],["tv_85",'TV 85"',190,38,"tv",{stand:!0}],["projector","Projector",35,28,"projector"],["projection_screen","Projection screen",240,10,"screen"],["soundbar","Soundbar",90,10,"soundbar"],["soundbar_large","Soundbar (large)",120,14,"soundbar"],["av_receiver","AV receiver",44,38,"device",{leds:3,button:!0}],["subwoofer","Subwoofer",38,38,"speaker"],["speaker_bookshelf","Bookshelf speaker",18,25,"speaker",{tweeter:!0}],["speaker_floor","Floor-standing speaker",25,32,"speaker",{tweeter:!0}],["speaker_center","Center speaker",55,22,"speaker"],["turntable","Turntable",45,36,"appliance",{dial:!0}],["game_console","Game console",30,26,"device",{leds:1,r:4}],["desktop_pc","Desktop PC",22,45,"device",{fan:!0,leds:1}],["laptop","Laptop",34,24,"laptop"],["monitor_24",'Monitor 24"',54,20,"monitor"],["monitor_27",'Monitor 27"',61,22,"monitor"],["monitor_32",'Monitor 32"',72,24,"monitor"],["monitor_34_ultrawide",'Ultrawide monitor 34"',82,25,"monitor"],["router","Wi-Fi router",30,20,"device",{antennas:3,leds:4}],["mesh_node","Mesh Wi-Fi node",12,12,"puck",{dot:!0}],["access_point","Ceiling access point",20,20,"puck",{dot:!0}],["modem","Modem",20,15,"device",{leds:3}],["network_switch","Network switch",33,20,"device",{leds:8}],["patch_panel","Patch panel",48,10,"device",{leds:12}],["nas","NAS",22,25,"device",{rackUnits:!0}],["server_rack_small","Server rack (small)",60,60,"device",{rackUnits:!0}],["server_rack_full","Server rack (full)",60,100,"device",{rackUnits:!0}],["network_cabinet","Network cabinet",60,45,"device",{rackUnits:!0}],["ups","UPS",15,35,"device",{leds:2}],["smart_speaker","Smart speaker",12,12,"puck"],["smart_speaker_large","Smart speaker (large)",18,18,"puck"],["smart_display","Smart display",25,12,"device",{screen:!0}],["smart_hub","Smart home hub",12,12,"device",{leds:1,r:3}],["zigbee_coordinator","Zigbee coordinator",8,5,"device",{antennas:1,leds:1}],["home_assistant_server","Home Assistant server",15,15,"device",{leds:2,r:3}],["security_camera","Security camera",10,15,"device",{lens:!0,r:3}],["camera_dome","Dome camera",13,13,"puck",{dot:!0}],["video_doorbell","Video doorbell",6,13,"device",{lens:!0,button:!0,r:2}],["alarm_panel","Alarm keypad",15,4,"device",{screen:!0}],["thermostat","Thermostat",9,4,"puck"],["smoke_detector","Smoke detector",14,14,"puck",{dot:!0}],["co_detector","CO detector",12,12,"puck",{dot:!0}],["motion_sensor","Motion sensor",6,6,"puck",{dot:!0}],["presence_sensor","mmWave presence sensor",8,8,"device",{lens:!0}],["ceiling_fan_4","Ceiling fan (4 blades)",132,132,"ceilingFan",{blades:4}],["ceiling_fan_5","Ceiling fan (5 blades)",132,132,"ceilingFan",{blades:5}],["ceiling_fan_large","Ceiling fan (large)",152,152,"ceilingFan",{blades:3}],["floor_fan","Floor fan",45,40,"floorFan"],["tower_fan","Tower fan",30,30,"grille",{lines:5,r:10}],["space_heater","Space heater",40,22,"grille",{lines:4}],["oil_radiator","Oil-filled radiator",60,25,"radiator"],["radiator","Radiator",100,10,"radiator"],["baseboard_heater","Baseboard heater",120,8,"radiator"],["portable_ac","Portable air conditioner",45,38,"grille",{lines:4}],["window_ac","Window air conditioner",60,50,"grille",{lines:6}],["mini_split_head","Mini-split indoor unit",80,22,"grille",{lines:2,r:6}],["air_purifier","Air purifier",30,30,"puck"],["ev_charger","EV charger",25,12,"device",{button:!0}],["solar_inverter","Solar inverter",50,20,"grille",{lines:5}],["home_battery","Home battery",75,15,"device",{leds:3}],["sewing_machine","Sewing machine",40,20,"device",{button:!0}],["vr_play_area","VR play area",200,200,"box",{dash:!0,x:!0}],["charging_station","Charging station",30,20,"device",{leds:4}]]],["lighting",[["floor_lamp","Floor lamp",40,40,"lamp"],["floor_lamp_arc","Arc floor lamp",120,100,"arcLamp"],["torchiere","Torchiere lamp",35,35,"lamp"],["table_lamp","Table lamp",30,30,"lamp"],["desk_lamp","Desk lamp",20,20,"lamp"],["ceiling_light","Ceiling light",40,40,"ceilingLight"],["ceiling_light_small","Small ceiling light",25,25,"ceilingLight"],["flush_mount","Flush-mount light",35,35,"puck"],["recessed_light","Recessed light",15,15,"puck",{dot:!0}],["pendant_light","Pendant light",35,35,"puck"],["pendant_cluster","Pendant cluster",60,60,"chandelier",{arms:3}],["chandelier","Chandelier",70,70,"chandelier"],["chandelier_large","Large chandelier",100,100,"chandelier",{arms:8}],["track_light","Track lighting",120,12,"trackLight"],["wall_sconce","Wall sconce",20,15,"sconce"],["led_strip","LED strip",200,3,"box",{dash:!0}],["light_bar","Light bar",100,8,"trackLight"],["smart_bulb_lamp","Smart bulb lamp",25,25,"lamp"],["string_lights","String lights",300,4,"trackLight"],["night_light","Night light",8,8,"puck"],["baseboard_light","Baseboard lighting",300,4,"linearLight"],["cove_light","Cove lighting",300,8,"linearLight",{cove:!0}],["under_cabinet_light","Under-cabinet light bar",90,3,"linearLight"],["toe_kick_light","Toe-kick lighting",240,3,"linearLight"],["stair_led_strip","Stair step LED strip",100,3,"linearLight"],["handrail_light","Handrail lighting",300,5,"linearLight",{pitch:12}],["led_panel_60","LED panel 60×60",60,60,"panelLight",{cols:2,rows:2}],["led_troffer_60x120","LED troffer 60×120",60,120,"panelLight",{cols:2,rows:4}],["led_panel_30x120","LED panel 30×120",30,120,"panelLight",{cols:1,rows:4}],["shop_light","LED shop light",120,15,"shopLight"],["shop_light_long","LED shop light (2.4 m)",240,15,"shopLight"],["recessed_gimbal","Gimbal recessed light",12,12,"gimbal"],["wafer_light","Wafer (canless) light",15,15,"wafer"],["spotlight","Spotlight",15,45,"spotlight"],["flood_light","Flood light",30,20,"flood"],["flood_light_twin","Twin-head flood light",40,20,"flood",{heads:2}],["motion_flood","Motion flood light",35,22,"flood",{heads:2,sensor:!0}],["path_light","Path light",20,20,"pathLight"],["bollard_light","Bollard light",20,20,"bollard"],["step_light","Step light",12,6,"stepLight"],["vanity_light_3","Vanity light (3 bulbs)",60,12,"vanityBar",{bulbs:3}],["vanity_light_5","Vanity light (5 bulbs)",120,12,"vanityBar",{bulbs:5}],["picture_light","Picture light",50,10,"pictureLight"],["lantern_outdoor","Outdoor lantern",25,25,"lantern"],["linear_pendant","Linear pendant",120,20,"linearPendant"],["island_pendants_3","Island pendants (3)",180,40,"pendantRow",{lights:3}],["puck_lights_3","Puck lights (3)",60,8,"pendantRow",{lights:3}],["light_bar_play","Light bar (Play)",25,8,"lightBar"],["neon_sign","Neon sign",80,6,"neon"],["track_monorail","Monorail track lighting",200,20,"monorail"],["sputnik_chandelier","Sputnik chandelier",90,90,"chandelier",{arms:12}],["ceiling_fan_light","Ceiling fan with light",132,132,"fanLight"],["floor_uplight","Floor uplight",25,25,"uplight"],["exit_sign","Exit sign",30,6,"exitSign"],["drum_pendant","Drum pendant",50,50,"drumShade"],["drum_flush_mount","Drum flush-mount light",40,40,"drumShade"],["globe_pendant","Globe pendant",30,30,"globeLight"],["globe_cluster","Globe cluster pendant",70,70,"globeCluster"],["dome_pendant","Dome pendant",40,40,"domePendant"],["flush_mount_square","Square flush-mount light",35,35,"squareLight"],["ring_chandelier","Ring chandelier",80,80,"ringLight"],["ring_chandelier_3","Three-ring chandelier",100,100,"ringLight",{rings:3}],["linear_chandelier","Linear chandelier",120,30,"linearChandelier"],["spot_bar_3","Ceiling spot bar (3)",70,12,"spotBar",{spots:3}],["spot_bar_4","Ceiling spot bar (4)",90,12,"spotBar",{spots:4}],["swing_arm_lamp","Swing-arm wall lamp",15,50,"swingArm"],["wall_sconce_double","Double wall sconce",35,15,"wallLamp",{heads:2}],["wall_up_down","Up/down wall light",15,12,"wallLamp",{heads:1}],["reading_light_bed","Bedside reading light",12,25,"swingArm"],["tripod_floor_lamp","Tripod floor lamp",60,60,"tripodLamp"],["corner_floor_lamp","RGB corner floor lamp",25,25,"cornerLamp"],["mushroom_lamp","Mushroom table lamp",30,30,"globeLight"],["salt_lamp","Salt lamp",20,18,"saltLamp"],["lava_lamp","Lava lamp",15,15,"puck",{dot:!0}],["hex_light_panels","Hexagon light panels",90,60,"hexPanels"],["triangle_light_panels","Triangle light panels",90,50,"triPanels"],["tv_backlight","TV backlight strip",140,4,"linearLight",{pitch:6}],["wall_washer","Wall-washer light",120,8,"linearLight",{cove:!0}],["under_bed_light","Under-bed motion light",120,3,"linearLight"],["closet_puck","Closet puck light",10,10,"puck",{dot:!0}],["galaxy_projector","Star projector",18,18,"starProjector"],["barn_light","Barn / gooseneck light",35,40,"barnLight"],["cafe_lights","Café string lights",400,30,"cafeLights"],["post_cap_light","Post cap light",12,12,"postCap"],["well_light","In-ground well light",18,18,"wellLight"],["spike_spotlight","Garden spike spotlight",12,20,"spotlight"],["pool_light","Pool light",30,30,"uplight"],["skylight_light","Smart skylight panel",60,120,"skylightPanel"]]],["kids",[["crib","Crib",75,135,"crib"],["crib_mini","Mini crib",63,100,"crib"],["crib_convertible","Convertible crib",80,140,"crib"],["bassinet","Bassinet",50,85,"bassinet"],["toddler_bed","Toddler bed",75,140,"bed",{pillows:1}],["kids_bed_house","House bed",100,200,"bed",{pillows:1}],["changing_table","Changing table",90,50,"changingTable"],["changing_dresser","Changing dresser",110,52,"drawers",{cols:2}],["nursery_glider","Nursery glider",75,85,"chair",{arms:!0,rocker:!0}],["high_chair","High chair",60,75,"highChair"],["playpen","Playpen",100,100,"playpen"],["play_yard","Play yard",75,105,"playpen"],["play_mat","Play mat",150,150,"rug"],["play_mat_round","Round play mat",140,140,"rug",{round:!0}],["toy_box","Toy box",80,45,"toyBox"],["toy_storage","Toy storage bins",85,30,"cubby",{cols:3}],["kids_table_2","Kids table for 2",60,140,"table",{top:1,bottom:1}],["kids_table_4","Kids table for 4",80,160,"table",{top:2,bottom:2}],["kids_chair","Kids chair",32,32,"chair"],["kids_desk","Kids desk",90,50,"desk"],["play_kitchen","Play kitchen",90,35,"playKitchen"],["dollhouse","Dollhouse",80,35,"dollhouse"],["kids_easel","Kids easel",60,55,"easel"],["teepee","Play teepee",120,120,"teepee"],["ball_pit","Ball pit",120,120,"ballPit",{round:!0}],["kids_beanbag","Kids bean bag",60,60,"beanbag"],["kids_bookshelf","Kids bookshelf",80,30,"shelf"],["rocking_horse","Rocking horse",75,30,"chair",{rocker:!0}],["stroller","Stroller",60,90,"stroller"],["car_seat","Car seat",45,65,"rounded",{k:.3}],["baby_bath","Baby bath",80,50,"bathtub",{free:!0}],["baby_gate","Baby gate",90,5,"rack",{rails:1}],["diaper_pail","Diaper pail",30,30,"trash",{round:!0}],["train_table","Train table",130,85,"table",{glass:!0}]]],["entry",[["entry_bench","Entry bench",100,38,"bench",{slats:2}],["entry_bench_storage","Storage bench",110,40,"chest"],["shoe_cabinet","Shoe cabinet",80,30,"cabinet",{doors:2}],["shoe_bench","Shoe bench",90,35,"rack",{rails:2}],["coat_rack","Coat rack",45,45,"lamp"],["hall_tree","Hall tree",90,40,"bench",{back:!0,slats:1}],["umbrella_stand","Umbrella stand",25,25,"trash",{round:!0}],["entry_console","Entry console",100,30,"console"],["key_cabinet","Key cabinet (wall)",30,8,"cabinet",{doors:1,dash:!0}],["mudroom_locker","Mudroom locker",120,45,"cubby",{cols:3}],["entry_cubby","Cubby organizer",90,35,"cubby",{cols:3}],["wall_hooks","Wall hooks",60,6,"rack",{rails:1}],["doormat","Doormat",75,45,"rug"],["runner_rug","Runner rug",75,240,"rug"],["storage_shelf","Storage shelf",90,40,"shelf",{bay:90}],["storage_bins","Storage bins",60,40,"cubby",{cols:2}],["linen_closet_shelves","Linen closet shelves",90,40,"shelf",{bay:90}],["pantry_shelves","Pantry shelving",120,40,"shelf",{bay:60}],["coat_closet","Coat closet",120,60,"closetRod"],["mirror_entry","Entry mirror",80,5,"mirror"],["package_box","Parcel drop box",60,45,"chest"],["stairs_straight","Staircase (straight)",90,250,"stairs"]]],["outdoor",[["patio_table_4","Patio dining set (4)",180,180,"roundTable",{chairs:4}],["patio_table_6","Patio dining set (6)",180,240,"table",{left:1,right:1,top:2,bottom:2}],["patio_table_rect","Patio table",150,90,"table"],["patio_bistro_set","Bistro set",140,140,"roundTable",{chairs:2}],["patio_chair","Patio chair",60,65,"chair",{arms:!0}],["adirondack_chair","Adirondack chair",75,90,"chair",{arms:!0}],["chaise_lounger","Chaise lounger",70,195,"chaise"],["outdoor_sofa","Outdoor sofa",200,85,"sofa",{seats:3}],["outdoor_loveseat","Outdoor loveseat",140,80,"sofa",{seats:2}],["outdoor_sectional","Outdoor sectional",260,200,"sectional",{seats:3,seatDepth:85,chaise:85}],["outdoor_coffee_table","Outdoor coffee table",100,60,"table"],["porch_swing","Porch swing",150,65,"sofa",{seats:2,noArms:!0}],["glider_bench","Glider bench",130,70,"bench",{back:!0}],["garden_bench","Garden bench",150,60,"bench",{back:!0}],["picnic_table","Picnic table",180,150,"picnicTable"],["kids_picnic_table","Kids picnic table",90,90,"picnicTable"],["fire_pit_round","Fire pit (round)",90,90,"firePit"],["fire_pit_square","Fire pit (square)",90,90,"firePit",{square:!0}],["fire_table","Fire table",120,80,"firePit",{square:!0}],["patio_heater","Patio heater",80,80,"umbrella"],["grill_gas","Gas grill",150,60,"grill"],["grill_gas_large","Large gas grill",180,65,"grill"],["grill_charcoal","Charcoal kettle grill",60,60,"kamado"],["grill_kamado","Kamado grill",120,70,"grill"],["smoker","Smoker",120,70,"grill",{noShelves:!0}],["pellet_grill","Pellet grill",130,60,"grill"],["pizza_oven","Pizza oven",70,80,"stove"],["outdoor_kitchen","Outdoor kitchen",300,70,"counter"],["outdoor_fridge","Outdoor fridge",60,60,"fridge"],["umbrella_270","Patio umbrella 2.7 m",270,270,"umbrella"],["umbrella_300","Patio umbrella 3 m",300,300,"umbrella"],["umbrella_cantilever","Cantilever umbrella",350,300,"cantileverUmbrella"],["pergola","Pergola",360,360,"greenhouse"],["gazebo","Gazebo",300,300,"teepee"],["hammock","Hammock with stand",400,120,"hammock"],["swing_set","Swing set",400,200,"swingSet",{seats:2}],["swing_set_3","Swing set (3)",500,220,"swingSet",{seats:3}],["playhouse","Playhouse",150,150,"shed"],["sandbox","Sandbox",150,150,"raisedBed"],["trampoline_300","Trampoline 3 m",300,300,"trampoline"],["trampoline_430","Trampoline 4.3 m",430,430,"trampoline"],["pool_rect","Pool (rectangular)",800,400,"pool"],["pool_small","Plunge pool",450,250,"pool"],["pool_round","Above-ground pool",450,450,"pool",{round:!0}],["hot_tub_4","Hot tub (4 person)",200,200,"hotTub"],["hot_tub_6","Hot tub (6 person)",230,230,"hotTub"],["shed_small","Garden shed (small)",180,120,"shed"],["shed","Garden shed",300,240,"shed"],["shed_large","Garden shed (large)",360,300,"shed"],["greenhouse","Greenhouse",300,240,"greenhouse"],["raised_bed_small","Raised garden bed (small)",120,60,"raisedBed"],["raised_bed","Raised garden bed",240,120,"raisedBed"],["planter_small","Planter (small)",40,40,"planter",{round:!0}],["planter_large","Planter (large)",80,80,"planter",{round:!0}],["planter_box","Planter box",100,40,"planter"],["tree_small","Tree (small)",200,200,"tree"],["tree","Tree",400,400,"tree",{lobes:11}],["tree_large","Tree (large)",700,700,"tree",{lobes:13}],["shrub","Shrub",100,100,"tree",{lobes:7}],["hedge","Hedge",300,80,"rounded",{k:.45}],["compost_bin","Compost bin",100,100,"compost"],["rain_barrel","Rain barrel",60,60,"circle",{inner:.8}],["garbage_bin","Wheelie bin",60,75,"trash"],["recycling_wheelie_bin","Recycling wheelie bin",60,75,"trash"],["bike_rack","Bike rack",180,50,"rack",{rails:1}],["potting_bench","Potting bench",120,55,"workbench"],["firewood_rack","Firewood rack",120,40,"rack",{rails:4}],["dog_house","Dog house",90,110,"shed"],["chicken_coop","Chicken coop",240,120,"coop"],["ac_condenser","AC condenser",80,80,"condenser"],["heat_pump_outdoor","Heat pump (outdoor)",95,40,"condenser"],["generator_standby","Standby generator",120,70,"generator"],["pool_pump","Pool pump",60,30,"compressor"],["outdoor_shower","Outdoor shower",100,100,"shower"],["birdbath","Birdbath",60,60,"circle",{inner:.7}],["fountain","Fountain",120,120,"circle",{inner:.6}],["patio_storage_box","Deck storage box",130,60,"chest"],["satellite_dish","Satellite dish",70,70,"circle",{cross:!0}],["mailbox","Mailbox",25,50,"chest"]]],["garage",[["snowblower_single","Snowblower (single-stage)",56,132,"art",{art:"snowblower_single"}],["snowblower_two","Snowblower (two-stage)",70,150,"art",{art:"snowblower_two"}],["mower_push_30","Push mower 30″",86,170,"art",{art:"mower_push_30"}],["lawn_tractor","Lawn tractor",112,183,"art",{art:"lawn_tractor"}],["mini_skid_steer","Mini skid steer (tracks, bucket)",100,240,"art",{art:"mini_skid_steer"}],["car_land_rover_discovery","Land Rover Discovery",222,497,"art",{art:"car_land_rover_discovery"}],["car_mercedes_glc","Mercedes-Benz GLC",208,472,"art",{art:"car_mercedes_glc"}],["car_compact","Compact car",175,410,"car"],["car_sedan","Sedan",185,480,"car"],["car_suv","SUV",195,490,"car"],["car_suv_large","Large SUV",205,530,"car"],["car_minivan","Minivan",200,515,"car"],["car_pickup","Pickup truck",205,580,"car"],["car_ev","Electric car",190,470,"car"],["motorcycle","Motorcycle",80,215,"motorcycle"],["scooter_motor","Motor scooter",70,180,"motorcycle"],["bicycle","Bicycle",60,175,"bicycle"],["kids_bike","Kids bike",50,130,"bicycle"],["e_scooter","E-scooter",45,110,"scooter"],["kayak","Kayak",70,360,"boat"],["canoe","Canoe",90,480,"boat"],["workbench","Workbench",180,70,"workbench",{pegboard:!0}],["workbench_small","Workbench (small)",120,60,"workbench"],["tool_chest","Tool chest",70,45,"drawers",{cols:1}],["rolling_tool_cabinet","Rolling tool cabinet",110,50,"drawers",{cols:2}],["pegboard","Pegboard (wall)",120,4,"box",{dash:!0}],["garage_shelving_120","Garage shelving 1.2 m",120,45,"shelf",{bay:120}],["garage_shelving_180","Garage shelving 1.8 m",180,60,"shelf",{bay:90}],["garage_cabinet","Garage cabinet",90,45,"cabinet",{doors:2}],["overhead_storage","Overhead storage rack",240,120,"box",{dash:!0,x:!0}],["garage_fridge","Garage fridge",75,75,"fridge"],["garage_freezer","Garage chest freezer",130,70,"chest"],["table_saw","Table saw",80,70,"tableSaw"],["miter_saw_station","Miter saw station",240,60,"miterSaw"],["drill_press","Drill press",45,60,"drillPress"],["band_saw","Band saw",60,45,"drillPress"],["air_compressor","Air compressor",70,40,"compressor"],["shop_vac","Shop vac",45,45,"trash",{round:!0}],["portable_generator","Portable generator",70,55,"generator"],["extension_ladder","Extension ladder (stored)",50,400,"ladder"],["snowblower","Snowblower",70,140,"mower"],["lawn_mower","Lawn mower",55,140,"mower"],["riding_mower","Riding mower",110,180,"mower",{riding:!0}],["wheelbarrow","Wheelbarrow",70,150,"wheelbarrow"],["storage_totes","Storage totes",60,40,"cubby",{cols:2}],["gun_safe","Gun safe",75,60,"device",{button:!0}],["ski_rack","Ski rack",120,25,"rack",{rails:1}],["golf_bag","Golf bag",40,40,"circle",{inner:.6}],["ev_charger_garage","EV charger (garage)",30,15,"device",{button:!0}],["garage_door_opener","Garage door opener",40,300,"box",{dash:!0}],["car_lift","Car lift",350,520,"box",{dash:!0,inset:40}],["water_softener_garage","Water softener (garage)",70,40,"tank",{tanks:1,brine:!0}],["garage_trash","Garage trash can",60,60,"trash",{round:!0}]]],["fitness",[["treadmill","Treadmill",85,195,"treadmill"],["treadmill_compact","Compact treadmill",70,150,"treadmill"],["elliptical","Elliptical",70,190,"elliptical"],["exercise_bike","Exercise bike",60,130,"exerciseBike"],["spin_bike","Spin bike",55,120,"exerciseBike"],["rowing_machine","Rowing machine",60,240,"rower"],["stair_climber","Stair climber",80,120,"treadmill"],["weight_bench","Weight bench",120,140,"weightBench"],["adjustable_bench","Adjustable bench",60,130,"bench",{slats:2}],["power_rack","Power rack",140,140,"powerRack"],["squat_stand","Squat stand",120,100,"powerRack"],["smith_machine","Smith machine",210,120,"powerRack"],["cable_machine","Cable machine",200,100,"box",{x:!0,inset:8}],["home_gym","Home gym station",200,150,"box",{x:!0}],["dumbbell_rack","Dumbbell rack",130,50,"dumbbellRack"],["kettlebell_rack","Kettlebell rack",90,40,"dumbbellRack"],["plate_tree","Weight plate tree",60,60,"circle",{inner:.4,cross:!0}],["yoga_mat","Yoga mat",61,183,"mat"],["gym_mat","Gym floor mats",200,200,"rug"],["punching_bag","Punching bag",40,40,"bag"],["punching_bag_stand","Punching bag stand",120,120,"bag"],["pull_up_bar","Pull-up station",120,100,"powerRack"],["massage_table","Massage table",75,185,"rounded",{k:.15}],["pool_table_7","Pool table 7 ft",112,198,"poolTable"],["pool_table_8","Pool table 8 ft",127,234,"poolTable"],["pool_table_9","Pool table 9 ft",142,264,"poolTable"],["ping_pong_table","Ping-pong table",274,152,"pingPong"],["foosball_table","Foosball table",140,75,"foosball"],["air_hockey_table","Air hockey table",210,110,"airHockey"],["arcade_cabinet","Arcade cabinet",70,80,"arcade"],["pinball_machine","Pinball machine",75,140,"arcade"],["poker_table","Poker table",300,220,"table",{top:3,bottom:3,left:1,right:1,shape:"oval"}],["card_table","Card table",175,175,"table",{top:1,bottom:1,left:1,right:1}],["dartboard_cabinet","Dartboard (wall)",60,10,"cabinet",{doors:2}],["drum_kit","Drum kit",180,150,"drumKit"],["digital_piano","Digital piano",135,35,"piano"],["keyboard_stand","Keyboard on stand",130,40,"piano"],["guitar_stand","Guitar on stand",40,100,"guitar"],["amp","Guitar amp",55,28,"speaker"],["art_easel","Art easel",75,70,"easel"],["craft_table","Craft table",150,75,"desk",{drawers:!0}],["sewing_table","Sewing table",120,60,"desk"],["record_cabinet","Record cabinet",120,40,"cubby",{cols:4}],["telescope","Telescope",80,80,"easel"],["sauna_barrel","Barrel sauna",200,220,"bench",{slats:4,back:!0}]]],["pets",[["dog_bed_small","Dog bed (small)",55,45,"petBed"],["dog_bed_medium","Dog bed (medium)",75,60,"petBed"],["dog_bed_large","Dog bed (large)",105,80,"petBed"],["dog_cot_small","Elevated dog cot (small)",76,53,"petCot"],["dog_cot_medium","Elevated dog cot (medium)",91,66,"petCot"],["dog_cot_large","Elevated dog cot (large)",109,76,"petCot"],["dog_cot_xl","Elevated dog cot (XL)",130,81,"petCot"],["dog_bed_bolster","Bolster dog bed",90,70,"petBolster"],["dog_bed_bolster_large","Bolster dog bed (large)",110,85,"petBolster"],["dog_bed_mattress","Orthopedic dog mattress",100,75,"petMattress"],["dog_bed_mattress_large","Orthopedic dog mattress (large)",120,90,"petMattress"],["dog_bed_donut","Donut dog bed",70,70,"petDonut"],["dog_bed_donut_large","Donut dog bed (large)",90,90,"petDonut"],["pet_cave_bed","Covered pet bed",55,50,"petCave"],["cat_bed","Cat bed",45,45,"petBed"],["cat_tree_small","Cat tree (small)",50,50,"catTree"],["cat_tree_large","Cat tree (large)",80,60,"catTree"],["litter_box","Litter box",55,40,"box",{r:6,inset:5}],["litter_robot","Self-cleaning litter box",60,70,"circle",{inner:.6}],["dog_crate_small","Dog crate (small)",60,45,"crate"],["dog_crate_medium","Dog crate (medium)",76,53,"crate"],["dog_crate_large","Dog crate (large)",91,61,"crate"],["dog_crate_xl","Dog crate (XL)",107,71,"crate"],["pet_bowls","Pet bowls",50,25,"bowls"],["pet_feeder","Automatic feeder",25,25,"device",{button:!0,r:6}],["pet_fountain","Pet water fountain",25,25,"puck"],["aquarium_20","Aquarium (75 L)",61,30,"aquarium"],["aquarium_55","Aquarium (200 L)",122,33,"aquarium"],["aquarium_75","Aquarium (280 L)",122,46,"aquarium"],["terrarium","Terrarium",90,45,"aquarium"],["bird_cage","Bird cage",60,45,"cage"],["bird_cage_round","Round bird cage",50,50,"cage",{round:!0}],["rabbit_hutch","Rabbit hutch",150,60,"coop"],["small_pet_cage","Small pet cage",80,50,"cage"],["pet_gate","Pet gate",90,5,"rack",{rails:1}],["dog_door","Dog door",35,8,"box",{}],["scratching_post","Scratching post",40,40,"circle",{inner:.4}]]],["decor",[["hydroponic_square","Hydroponic garden (square)",60,60,"hydroBed"],["hydroponic_rect","Hydroponic garden (rectangle)",120,60,"hydroBed"],["hydroponic_countertop","Countertop hydroponic garden",40,20,"hydroBed",{pitch:10}],["plant_small","Plant (small)",35,35,"plant",{leaves:6}],["plant_medium","Plant (medium)",55,55,"plant"],["plant_large","Plant (large)",80,80,"plant",{leaves:9}],["fiddle_leaf_fig","Fiddle-leaf fig",70,70,"houseplant",{kind:"fiddle"}],["palm","Palm",100,100,"houseplant",{kind:"palm"}],["monstera","Monstera",100,100,"houseplant",{kind:"monstera"}],["snake_plant","Snake plant",40,40,"houseplant",{kind:"snake"}],["plant_bird_of_paradise","Bird of paradise",120,120,"houseplant",{kind:"bird"}],["plant_pothos","Pothos",70,70,"houseplant",{kind:"pothos"}],["plant_pothos_hanging","Hanging pothos",60,60,"houseplant",{kind:"pothosHanging"}],["plant_boston_fern","Boston fern",70,70,"houseplant",{kind:"fern"}],["plant_peace_lily","Peace lily",55,55,"houseplant",{kind:"peace"}],["plant_zz","ZZ plant",55,55,"houseplant",{kind:"zz"}],["plant_rubber","Rubber plant",70,70,"houseplant",{kind:"rubber"}],["plant_philodendron","Philodendron",60,60,"houseplant",{kind:"philodendron"}],["plant_spider","Spider plant",50,50,"houseplant",{kind:"spider"}],["plant_aloe","Aloe vera",35,35,"houseplant",{kind:"aloe"}],["plant_succulent","Succulent",20,20,"houseplant",{kind:"succulent"}],["plant_pilea","Pilea (pancake plant)",30,30,"houseplant",{kind:"pilea"}],["plant_calathea","Calathea",55,55,"houseplant",{kind:"calathea"}],["plant_parlor_palm","Parlor palm",65,65,"houseplant",{kind:"palm"}],["plant_orchid","Orchid",35,35,"houseplant",{kind:"orchid"}],["plant_dracaena","Dracaena",55,55,"houseplant",{kind:"dracaena"}],["plant_jade","Jade plant",35,35,"houseplant",{kind:"jade"}],["plant_olive_tree","Olive tree (indoor)",90,90,"houseplant",{kind:"olive"}],["plant_herb_pots","Herb pots",60,20,"houseplant",{kind:"herbs"}],["cactus","Cactus",30,30,"cactus"],["bonsai","Bonsai",30,25,"tree",{lobes:6}],["hanging_plant","Hanging plant",35,35,"plant",{leaves:6}],["floor_vase","Floor vase",35,35,"circle",{inner:.6}],["sculpture_pedestal","Sculpture pedestal",40,40,"box",{inset:6}],["room_divider_3","Folding screen (3 panels)",150,20,"divider",{panels:3}],["room_divider_4","Folding screen (4 panels)",200,20,"divider",{panels:4}],["room_divider_shelf","Shelving room divider",150,40,"cubby",{cols:4}],["floor_mirror","Floor mirror",70,8,"mirror"],["wall_mirror","Wall mirror",90,4,"mirror"],["grandfather_clock","Grandfather clock",55,30,"clock"],["globe","Floor globe",50,50,"globe"],["area_rug_5x8","Area rug 5×8 ft",152,244,"rug"],["area_rug_6x9","Area rug 6×9 ft",183,274,"rug"],["area_rug_8x10","Area rug 8×10 ft",244,305,"rug"],["area_rug_9x12","Area rug 9×12 ft",274,366,"rug"],["area_rug_160x230","Area rug 160×230",160,230,"rug"],["area_rug_200x300","Area rug 200×300",200,300,"rug"],["rug_round_150","Round rug 1.5 m",150,150,"rug",{round:!0}],["rug_round_200","Round rug 2 m",200,200,"rug",{round:!0}],["rug_round_240","Round rug 2.4 m",240,240,"rug",{round:!0}],["hallway_runner","Hallway runner",75,300,"rug"],["decorative_ladder","Decorative ladder",45,10,"ladder"],["wall_art","Wall art",90,4,"box",{r:1}],["tapestry","Tapestry",150,3,"box",{}],["aquarium_stand","Aquarium stand",125,45,"cabinet",{doors:2}],["candle_stand","Candle stand",25,25,"circle",{inner:.4}],["vase_table","Vase on table",40,40,"pedestalTable"],["coat_stand","Coat stand",50,50,"lamp"],["magazine_basket","Basket",40,30,"trash"],["storage_ottoman","Storage ottoman",80,45,"chest"],["piano_lamp","Piano lamp",30,20,"sconce"],["wall_clock","Wall clock",35,4,"box",{r:2}],["photo_wall","Photo wall",120,3,"box",{dash:!0}],["plant_stand","Plant stand",45,45,"planter",{round:!0}],["window_seat","Window seat",150,50,"bench",{slats:2}],["bean_chair_cluster","Lounge cushions",150,100,"beanbag"],["umbrella_indoor","Indoor tree",120,120,"tree",{lobes:9}],["incense_table","Altar table",100,40,"console"],["meditation_cushion","Meditation cushion",45,45,"ottoman",{round:!0}],["trash_can_small","Waste basket",25,25,"trash",{round:!0}],["trash_can_large","Trash can (large)",45,45,"trash",{round:!0}],["recycle_station","Recycling station",90,35,"cubby",{cols:3}]]],["icons",Ii],["shapes",[[Hi,"Free-form shape",100,80,"shapeFreeform"],["shape_rect","Rectangle",100,60,"shapeRect"],["shape_square","Square",60,60,"shapeRect"],["shape_circle","Circle",60,60,"shapeEllipse"],["shape_ellipse","Ellipse",100,60,"shapeEllipse"],["shape_triangle","Triangle",70,60,"shapeTriangle"],["shape_right_triangle","Right triangle",70,60,"shapeRightTriangle"],["shape_diamond","Diamond",60,60,"shapeDiamond"],["shape_pentagon","Pentagon",60,60,"shapePolygon",{sides:5}],["shape_hexagon","Hexagon",60,60,"shapePolygon",{sides:6}],["shape_octagon","Octagon",60,60,"shapePolygon",{sides:8}],["shape_star","Star",60,60,"shapeStar"],["shape_l","L-shape",100,100,"shapeL"],["shape_u","U-shape",100,80,"shapeU"],["shape_plus","Plus",60,60,"shapePlus"],["shape_arrow","Arrow",100,50,"shapeArrow"],["shape_semicircle","Semicircle",100,50,"shapeSemicircle"],["shape_quarter","Quarter circle",60,60,"shapeQuarter"],["shape_line","Line",100,4,"shapeLine"],["shape_dashed_line","Dashed line",100,4,"shapeDashedLine"]]]].flatMap(([e,t])=>t.map(([t,i,n,o,r,s,a])=>({id:t,name:i,category:e,w:n,d:o,draw:r,opts:s??{},flip:a??!1}))),Fi=new Map(Vi.map(e=>[e.id,e]));let Ti=[],Ri=new Map,Bi=null;function Ei(e){e!==Bi&&(Bi=e,function(e){xi.clear();for(const t of e)xi.set(t.id,{href:Wt(t.svg),colors:!0===t.colors,solidHref:Wt(Mi(t.svg))})}(e),Ti=e.map(e=>({id:`custom_${e.id}`,name:e.name,category:"custom",w:e.w,d:e.d,draw:"custom",opts:{custom:e.id},flip:!1})),Ri=new Map(Ti.map(e=>[e.id,e])))}function Di(e){return Fi.get(e)??Ri.get(e)}const zi="rect,circle,ellipse,polygon,path";const Oi=Math.PI/180;function ji(e,t,i){const n=e.getTime()/864e5-10957.5,o=(357.529+.98560028*n)*Oi,r=(280.459+.98564736*n+1.915*Math.sin(o)+.02*Math.sin(2*o))*Oi,s=(23.439-36e-8*n)*Oi,a=Math.atan2(Math.cos(s)*Math.sin(r),Math.cos(r)),l=Math.asin(Math.sin(s)*Math.sin(r)),c=(15*(((18.697374558+24.06570982441908*n)%24+24)%24)+i)*Oi-a,d=t*Oi,h=Math.asin(Math.sin(d)*Math.sin(l)+Math.cos(d)*Math.cos(l)*Math.cos(c));return{azimuth:(Math.atan2(-Math.sin(c),Math.tan(l)*Math.cos(d)-Math.sin(d)*Math.cos(c))/Oi+360)%360,elevation:h/Oi}}function Ui(e,t,i){const n=[1,3,5].map(t=>parseInt(e.slice(t,t+2),16)),o=[1,3,5].map(e=>parseInt(t.slice(e,e+2),16));return`#${n.map((e,t)=>Math.round(e+(o[t]-e)*Math.max(0,Math.min(1,i))).toString(16).padStart(2,"0")).join("")}`}function Wi(e){return Math.max(0,Math.min(1,(e+4)/14))}const Ni=["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"],Zi=Ni.map((e,t)=>({name:e,deg:22.5*t}));function Gi(e){const t=Math.round((e%360+360)%360/22.5)%16;return Ni[t]}function Ki(e,t,i){return((Math.atan2(e,-t)/Oi+i)%360+360)%360}function qi(e,t){const i=(e-t)*Oi;return[Math.sin(i),-Math.cos(i)]}const Yi={sunny:0,"clear-night":0,windy:.2,partlycloudy:.5,"windy-variant":.6,exceptional:.5,cloudy:.9,rainy:.9,snowy:.9,lightning:.9,fog:.95,hail:.95,"snowy-rainy":.95,"lightning-rainy":.95,pouring:1},Qi=new Set(["rainy","pouring","snowy","snowy-rainy","hail","fog","lightning-rainy"]);function Xi(e){return Ui("#fff3c4","#90a4ae",e)}function Ji(e,t){return Ui(function(e){return e<4?Ui("#ff7043","#ff9e40",e/4):e<12?Ui("#ff9e40","#ffd180",(e-4)/8):e<30?Ui("#ffd180","#fff3c4",(e-12)/18):Ui("#fff3c4","#fffbec",(e-30)/30)}(e),"#eef1f3",.7*t)}const en=[255,196,107];function tn(e){if(!0===e.is_hue_group)return!0;const t=e.hue_type;if("room"===t||"zone"===t)return!0;const i=e.entity_id;return Array.isArray(i)&&i.length>0}function nn(e,t,i){const n=new Set,o=e=>{for(const t of[e.area_id,...e.linked_area_ids??[]])if(t)for(const e of i.get(t)??[])n.add(e);for(const t of e.light_entity_ids??[])n.add(t)};o(e);for(const i of e.linked_room_ids??[]){const n=t.find(e=>e.id===i);n&&n.id!==e.id&&o(n)}for(const t of e.excluded_light_ids??[])n.delete(t);return[...n]}function on([e,t,i]){const n=e=>Math.round(Math.max(0,Math.min(255,e))).toString(16).padStart(2,"0");return`#${n(e)}${n(t)}${n(i)}`}const rn=[[2e3,"#FFA24A"],[2700,"#FFC46B"],[3500,"#FFD38F"],[4200,"#FFE2B3"],[5e3,"#EBEFF6"],[5700,"#E2E9F4"],[6500,"#D6E0F1"]];function sn(e){return[1,3,5].map(t=>parseInt(e.slice(t,t+2),16))}function an(e){const t=rn[0];if(e<=t[0])return sn(t[1]);for(let t=1;t<rn.length;t++){const[i,n]=rn[t-1],[o,r]=rn[t];if(e<=o){const t=sn(n),s=sn(r),a=(e-i)/(o-i);return[0,1,2].map(e=>t[e]+(s[e]-t[e])*a)}}return sn(rn[rn.length-1][1])}function ln(e){const t="number"==typeof e.color_temp_kelvin?e.color_temp_kelvin:"number"==typeof e.color_temp?1e6/e.color_temp:null;if("color_temp"===e.color_mode&&t)return an(t);const i=e.rgb_color;if(Array.isArray(i)&&3===i.length&&i.every(e=>"number"==typeof e)){const[e,t,n]=i;return[.7*e+76.5,.7*t+76.5,.7*n+76.5]}return t?an(t):en}function cn(e,t){const i=new Map;if(!t)return i;const n=function(e){const t=new Map;for(const i of Object.keys(e.states)){if(!i.startsWith("light."))continue;if(tn(e.states[i]?.attributes??{}))continue;const n=e.entities?.[i],o=n?.area_id??(n?.device_id?e.devices?.[n.device_id]?.area_id:null)??null;if(!o)continue;const r=t.get(o);r?r.push(i):t.set(o,[i])}return t}(t);for(const o of e){const r=nn(o,e,n);if(0===r.length)continue;let s=0,a=0,l=0;const c=[0,0,0];for(const e of r){const i=t.states[e];if(!i||"unavailable"===i.state||"unknown"===i.state){a++;continue}if("on"!==i.state)continue;s++;const n=i.attributes.brightness;l+="number"==typeof n?n/255:1;const o=ln(i.attributes);c[0]+=o[0],c[1]+=o[1],c[2]+=o[2]}i.set(o.id,{entityIds:r,on:s,unavailable:a,level:r.length?l/r.length:0,color:on(s?[c[0]/s,c[1]/s,c[2]/s]:en)})}return i}function dn(e,t){const i=new Map;if(!t)return i;for(const n of e){const e=n.cover_entity_id;e&&i.set(n.id,hn(t,e));const o=n.cover_right_entity_id;o&&i.set(`${n.id}:right`,hn(t,o))}return i}function hn(e,t){const i=e.states[t];if(!i||"unavailable"===i.state||"unknown"===i.state)return null;const n=i.attributes.current_position;if("number"==typeof n)return Math.max(0,Math.min(1,n/100));const o=i.attributes.current_tilt_position;return"number"==typeof o?Math.max(0,Math.min(1,o/100)):"open"===i.state||"opening"===i.state?1:0}const un=["light","switch","fan","cover","lock","media_player","climate","binary_sensor","vacuum"];function gn(e){return un.map(t=>e.find(e=>e.startsWith(`${t}.`))).find(Boolean)}function pn(e,t,i){if("unavailable"===t)return"#9e9e9e";switch(e){case"light":return"on"===t?on(ln(i)):null;case"switch":case"fan":return"on"===t?"#ffb300":null;case"cover":return"open"===t||"opening"===t?"#42a5f5":null;case"lock":return"unlocked"===t||"open"===t?"#ef5350":null;case"media_player":return"playing"===t?"#ab47bc":null;case"climate":return"off"!==t?"#ff7043":null;case"binary_sensor":return"on"===t?"#ef5350":null;case"vacuum":return"cleaning"===t?"#26a69a":null;default:return null}}const mn={switch:.45,fan:.35,input_boolean:.35,media_player:.4,climate:.4};function fn(e,t){const i=e.states[t],n=t.split(".")[0]??"";if(!i||"unavailable"===i.state||"unknown"===i.state)return{color:null,glow:0,active:!1,unavailable:!0,text:i?.state??"unavailable"};const o=i.state??"",r=i.attributes;let s=o,a="input_boolean"===n?"on"===o?"#ffb300":null:pn(n,o,r),l=a?mn[n]??0:0;if("light"===n&&"on"===o){const e=r.brightness,t="number"==typeof e?e/255:1;l=Math.max(.25,t),s=`on · ${Math.round(100*t)}%`}else if("cover"===n){const i=hn(e,t);null!==i&&"number"==typeof r.current_position&&(s=`${o} · ${Math.round(100*i)}%`)}else if("sensor"===n){const e=r.unit_of_measurement;s="string"==typeof e?`${o} ${e}`:o,a=null}return{color:a,glow:l,active:null!==a,unavailable:!1,text:s}}function _n(e,t){const i=new Map;if(!t)return i;for(const n of e)n.entity_id&&i.set(n.id,fn(t,n.entity_id));return i}function bn(e,t,i,n=new Map){const o=[];for(const[e,t]of n)o.push(`${e}:${t.color}:${t.glow.toFixed(2)}:${t.text}`);for(const[t,i]of e)o.push(`${t}:${i.on}:${i.level.toFixed(2)}:${i.color}:${i.unavailable}:${i.entityIds.length}`);for(const[e,i]of t)o.push(`${e}:${null===i?"x":i.toFixed(2)}`);for(const[e,t]of i)o.push(`${e}:${t}`);return o.join("|")}function vn(e,t,i){const n=e=>{const t=/^#?([0-9a-f]{6})$/i.exec(e.trim()),i=t?parseInt(t[1]??"0",16):0;return[i>>16&255,i>>8&255,255&i]},o=n(e),r=n(t);return`#${o.map((e,t)=>Math.round(e+((r[t]??0)-e)*i).toString(16).padStart(2,"0")).join("")}`}function yn(e,t,i,n){if(i&&i.on>0){const n=Math.min(1,i.level);return{color:vn(e,i.color,.3),opacity:Math.min(.85,t*(1+.6*n))}}return i&&i.unavailable<i.entityIds.length?{color:vn(e,n?"#000000":"#263238",.55),opacity:Math.max(t,n?.45:.3)}:{color:e,opacity:t}}const kn=1e3,wn=750,xn=14,Mn="#03a9f4",$n=.18,Ln={n:[0,-1],s:[0,1],e:[1,0],w:[-1,0],ne:[1,-1],nw:[-1,-1],se:[1,1],sw:[-1,1]},Sn=Object.keys(Ln);function Cn(e,t){const[i,n]=Ln[e],o=180*Math.atan2(n,i)/Math.PI+t,r=(45*Math.round(o/45)%180+180)%180;return 0===r?"edge-ew":45===r?"corner":90===r?"edge-ns":"corner-nesw"}let Pn=class extends he{constructor(){super(...arguments),this.dark=!1,this.rooms=[],this.pins=[],this.walls=[],this.openings=[],this.scale=null,this.unitSystem="metric",this.meshLinks=[],this.meshStubs=[],this.entityLookup=new Map,this.backgroundImageUrl=null,this.backgroundOpacity=.5,this.backgroundOffsetX=0,this.backgroundOffsetY=0,this.backgroundScale=1,this.alignOverlay=null,this.initialViewBox=null,this.sameBuildingAsPrevious=!1,this.mode="select",this.snapMode="all",this.armedEntityId=null,this.armedOpeningType=null,this.selectedRoomId=null,this.editingRoomId=null,this.editingWallId=null,this.selectedPinId=null,this.selectedWallId=null,this.selectedOpeningId=null,this.furniture=[],this.selectedFurnitureId=null,this.armedFurnitureKind=null,this.armedFurnitureRotation=0,this.roomLights=new Map,this.coverOpenness=new Map,this.pinColors=new Map,this.itemStates=new Map,this.showFurniture=!0,this.showLights=!0,this.showCovers=!0,this.showLightCount=!0,this.roomBorder={show:!0,color:null,width:2,opacity:1},this.roomLabelStyle={size:16,color:null,bold:!1},this.roomFillUnder=!1,this.customIcons=[],this.autoFit=!1,this.showScaleLine=!0,this.northDeg=null,this.location=null,this.sky=null,this.sunTime=null,this.overlayButtons=!0,this.readOnly=!1,this.selectedMeshLinkKey=null,this.selectedMeshStubKey=null,this._viewBox={x:0,y:0,w:kn,h:wn},this._naturalHeight=wn,this._alignNaturalHeight=wn,this._pendingTrace=null,this._hoverSnap=null,this._pendingScalePoints=[],this._liveEditPoints=null,this._liveRoomMove=null,this._roomMoveGuides={x:null,y:null},this._gestureCancelled=!1,this._vertexDragStartPoints=null,this._liveDragPin=null,this._liveOpeningEdit=null,this._selectedVertexIndex=null,this._liveFurniture=null,this._furnitureGuides={x:null,y:null},this.lastPointer=null,this._now=Date.now(),this._clock=null,this._hoverImage=null,this._knockout=null,this._drawBox=null,this._pointers=new Map,this._downHit=null,this._downClient=null,this._lastImage=null,this._lastClient=null,this._gesture=null,this._moved=!1,this._hasFittedOnce=!1,this._onPointerDown=e=>{if("mouse"===e.pointerType&&0!==e.button)return;if(ct(this),this._svg.setPointerCapture(e.pointerId),this._pointers.set(e.pointerId,{x:e.clientX,y:e.clientY}),2===this._pointers.size){const e=[...this._pointers.values()],[t,i]=e,n={x:(t.x+i.x)/2,y:(t.y+i.y)/2};return void(this._gesture={kind:"pinch",startDistance:Ke(t.x,t.y,i.x,i.y),startViewBox:{...this._viewBox},midImage:this._clientToImage(n.x,n.y)})}if(this._pointers.size>2)return;const t=this._clientToImage(e.clientX,e.clientY);this._downClient={x:e.clientX,y:e.clientY},this._lastImage=t,this._lastClient={x:e.clientX,y:e.clientY},this._moved=!1,this._gesture=null,this._downHit="select"===this.mode?this._hitTest(e.clientX,e.clientY,t):{type:"empty"}},this._onPointerMove=e=>{if(this.lastPointer=this._clientToImage(e.clientX,e.clientY),!this._pointers.has(e.pointerId)){if(this._drawingFreeform){const t=this._clientToImage(e.clientX,e.clientY);this._hoverSnap=this._freeformPoint(this._pendingTrace?.points??[],t.x,t.y,e.shiftKey)}else if("wall"===this.mode||"trace"===this.mode){const t=this._clientToImage(e.clientX,e.clientY);this._hoverSnap=this._snappedGeometryPoint(this._pendingTrace?.points??[],t.x,t.y,e.shiftKey)}else this._hoverSnap&&(this._hoverSnap=null);return void("furniture"===this.mode?this._hoverImage=this._clientToImage(e.clientX,e.clientY):this._hoverImage&&(this._hoverImage=null))}if(this._pointers.set(e.pointerId,{x:e.clientX,y:e.clientY}),"pinch"===this._gesture?.kind&&2===this._pointers.size){const e=[...this._pointers.values()],[t,i]=e,n=Ke(t.x,t.y,i.x,i.y)||1,o=this._gesture.startDistance/n,r=this._gesture.startViewBox,s=qe(r.w*o,250,4e3),a=s/r.w,l=r.h*a,{x:c,y:d}=this._gesture.midImage;return void(this._viewBox={x:c-(c-r.x)*a,y:d-(d-r.y)*a,w:s,h:l})}if(1!==this._pointers.size||!this._downClient||!this._lastImage)return;if(this._gestureCancelled)return;if(!this._moved){if(Ke(this._downClient.x,this._downClient.y,e.clientX,e.clientY)<5)return;this._moved=!0,this._gesture=this._lockGesture(),"pan"!==this._gesture?.kind&&"alignDrag"!==this._gesture?.kind||(this._svg.style.cursor="grabbing")}const t=this._clientToImage(e.clientX,e.clientY);if("pan"===this._gesture?.kind){const t=this._svgTransform().scale||1,i=this._lastClient??{x:e.clientX,y:e.clientY};this._viewBox={...this._viewBox,x:this._viewBox.x-(e.clientX-i.x)/t,y:this._viewBox.y-(e.clientY-i.y)/t}}else if("furnitureDraw"===this._gesture?.kind){const{startX:i,startY:n}=this._gesture;let o=t.x-i,r=t.y-n;if(e.shiftKey){const e=Math.max(Math.abs(o),Math.abs(r));o=Math.sign(o||1)*e,r=Math.sign(r||1)*e}this._drawBox={x0:i,y0:n,x1:i+o,y1:n+r}}else if("alignDrag"===this._gesture?.kind){const t=this._svgTransform().scale||1,i=this._lastClient??{x:e.clientX,y:e.clientY};this.dispatchEvent(new CustomEvent("align-drag",{detail:{dx:(e.clientX-i.x)/t,dy:(e.clientY-i.y)/t}}))}else if("vertex"===this._gesture?.kind&&this._liveEditPoints){const i="room"===this._editingTarget?.kind,[n,o]=this._snappedVertexPoint(this._liveEditPoints,this._gesture.index,t.x,t.y,i,e.shiftKey),r=[...this._liveEditPoints];r[this._gesture.index]=[n,o],this._liveEditPoints=r}else if("pin"===this._gesture?.kind)this._liveDragPin={id:this._gesture.pinId,x:t.x,y:t.y};else if("furnitureMove"===this._gesture?.kind){const i=this._gesture,n=this.furniture.find(e=>e.id===i.id);if(n){let o=n.x+t.x-i.startX,r=n.y+t.y-i.startY,s={x:null,y:null};e.shiftKey||({x:o,y:r,guides:s}=this._snapFurnitureMove(n,o,r)),this._furnitureGuides=s,this._liveFurniture={id:n.id,x:o,y:r,rotation_deg:n.rotation_deg,width_cm:n.width_cm,depth_cm:n.depth_cm}}}else if("furnitureHandle"===this._gesture?.kind){const i=this._gesture,n=this.furniture.find(e=>e.id===i.id);n&&(this._liveFurniture=this._furnitureHandleEdit(i.start,i.handle,i.startLocal,t,e.shiftKey))}else if("roomMove"===this._gesture?.kind){let i=t.x-this._gesture.startX,n=t.y-this._gesture.startY;const o=this._pxToUnits(10);let r={x:null,y:null};if(Math.hypot(i,n)<=o)i=0,n=0;else if(!e.shiftKey){const e=this._snapRoomMove(this._gesture.roomId,i,n,o);i=e.dx,n=e.dy,r=e.guides}this._liveRoomMove={id:this._gesture.roomId,dx:i,dy:n},this._roomMoveGuides=r}else if("roomLabel"===this._gesture?.kind)this._liveRoomLabel={id:this._gesture.roomId,x:t.x,y:t.y};else if("openingMove"===this._gesture?.kind){const e=this._gesture,i=this.openings.find(t=>t.id===e.openingId),n=i&&this.walls.find(e=>e.id===i.wallId);if(i&&n){const e=this._effectivePoints("wall",n.id,n.points),{point:o}=rt(e,t.x,t.y);this._liveOpeningEdit={id:i.id,x:o[0],y:o[1],width:i.width}}}else if("openingHandle"===this._gesture?.kind){const e=this._gesture,i=this.openings.find(t=>t.id===e.openingId),n=i&&this.walls.find(e=>e.id===i.wallId),o=i&&this._openingEndpoints(i);if(i&&n&&o){const r=this._effectivePoints("wall",n.id,n.points),{point:s}=rt(r,t.x,t.y),a=o[0===e.whichEnd?1:0],l=[(a[0]+s[0])/2,(a[1]+s[1])/2],c=Ke(a[0],a[1],s[0],s[1]);this._liveOpeningEdit={id:i.id,x:l[0],y:l[1],width:c}}}this._lastImage=this._clientToImage(e.clientX,e.clientY),this._lastClient={x:e.clientX,y:e.clientY}},this._onPointerLeave=()=>{this.lastPointer=null,this._hoverSnap=null,this._hoverImage=null},this._onPointerUp=e=>{this._pointers.delete(e.pointerId),this._svg.style.cursor="";try{this._svg.releasePointerCapture(e.pointerId)}catch{}this._pointers.size>=1?this._gesture=null:(this._gestureCancelled||(this._moved?this._commitGesture():this._downClient&&this._handleClick(this._downClient.x,this._downClient.y,e.shiftKey)),this._gesture=null,this._downHit=null,this._downClient=null,this._moved=!1,this._gestureCancelled=!1,this._vertexDragStartPoints=null)},this._onWheel=e=>{if(e.preventDefault(),e.ctrlKey){const t=e.deltaY<0?.9:1.1;return void this._zoomBy(t,this._clientToImage(e.clientX,e.clientY))}const t=this._viewBox.w/this.getBoundingClientRect().width;this._viewBox={...this._viewBox,x:this._viewBox.x+e.deltaX*t,y:this._viewBox.y+e.deltaY*t}},this._liveRoomLabel=null,this._pinIcons=new Ft(this)}get _editingTarget(){return this.editingRoomId?{kind:"room",id:this.editingRoomId}:this.editingWallId?{kind:"wall",id:this.editingWallId}:null}_rawPointsFor(e){return"room"===e.kind?this.rooms.find(t=>t.id===e.id)?.points??null:this.walls.find(t=>t.id===e.id)?.points??null}willUpdate(e){if(e.has("customIcons")&&Ei(this.customIcons),e.has("armedFurnitureKind")&&(this._pendingTrace=null,this._drawBox=null,this._furnitureGuides={x:null,y:null}),this.autoFit&&(e.has("rooms")||e.has("walls")||e.has("pins")||e.has("autoFit"))&&this.fitToScreen(),e.has("editingRoomId")||e.has("editingWallId")){const e=this._editingTarget,t=e?this._rawPointsFor(e):null;this._liveEditPoints=t?[...t]:null,this._selectedVertexIndex=null}e.has("mode")&&(this._pendingTrace=null,this._pendingScalePoints=[])}firstUpdated(){this.fitToScreen(),this._hasFittedOnce=null!==this._contentBounds()||!this.backgroundImageUrl,this._resizeObserver=new ResizeObserver(()=>{this.autoFit&&this.fitToScreen(),this.requestUpdate()}),this._resizeObserver.observe(this)}connectedCallback(){super.connectedCallback(),this._clock=setInterval(()=>{null!==this.northDeg&&this.location&&(this._now=Date.now())},6e4)}disconnectedCallback(){super.disconnectedCallback(),this._clock&&clearInterval(this._clock),this._clock=null,this._resizeObserver?.disconnect()}updated(e){if((e.has("backgroundImageUrl")||e.has("roomFillUnder"))&&this._prepareKnockout(),e.has("backgroundImageUrl")&&this.backgroundImageUrl){const e=new Image;e.onload=()=>{this._naturalHeight=e.naturalHeight/e.naturalWidth*kn||wn,this._hasFittedOnce||(this.fitToScreen(),this._hasFittedOnce=!0)},e.src=this.backgroundImageUrl}if(e.has("initialViewBox")){const e=this.initialViewBox,t=this._viewBox;e&&e.x===t.x&&e.y===t.y&&e.w===t.w&&e.h===t.h?this._hasFittedOnce=!0:e&&!this.autoFit?(this._viewBox={...e},this._hasFittedOnce=!0):this.sameBuildingAsPrevious||(this.fitToScreen(),this._hasFittedOnce=null!==this._contentBounds()||!this.backgroundImageUrl)}if(e.has("alignOverlay")){const t=e.get("alignOverlay");if(this.alignOverlay&&this.alignOverlay.imageUrl!==t?.imageUrl){const e=new Image;e.onload=()=>{this._alignNaturalHeight=e.naturalHeight/e.naturalWidth*kn||wn},e.src=this.alignOverlay.imageUrl}}if(e.has("_pendingTrace")||e.has("_pendingScalePoints")){const e="scale"===this.mode?this._pendingScalePoints.length:this._pendingTrace?.points.length??0;this.dispatchEvent(new CustomEvent("pending-changed",{detail:{count:e}}))}}async _prepareKnockout(){const e=this.roomFillUnder?this.backgroundImageUrl:null;if(this._knockout?.for===e)return;if(this._knockout?.url&&URL.revokeObjectURL(this._knockout.url),this._knockout=null,!e)return;const t=await async function(e){const t=await fetch(e);if(!t.ok)return null;const i=await t.text();if(!(t.headers.get("content-type")??"").includes("svg")&&!/^\s*(<\?xml|<svg|<!--)/i.test(i))return null;const n=(new DOMParser).parseFromString(i,"image/svg+xml"),o=n.documentElement;if(!o||"svg"!==o.nodeName.toLowerCase()||n.getElementsByTagName("parsererror").length>0)return null;const r=document.createElement("div");r.style.cssText="position:fixed;left:-20000px;top:0;width:1000px;height:1000px;opacity:0;pointer-events:none;";const s=r.attachShadow({mode:"open"}),a=document.importNode(o,!0);a.setAttribute("width","1000"),a.setAttribute("height","1000"),s.appendChild(a),document.body.appendChild(r);try{const e=a.getBoundingClientRect(),t=e.width*e.height;if(!(t>0))return null;const i=Array.from(o.querySelectorAll(zi));Array.from(a.querySelectorAll(zi)).forEach((e,n)=>{const o=i[n];if(!o)return;const r=getComputedStyle(e);if("none"!==r.fill||"none"===r.display)return;if("none"===r.stroke)return;if("path"===e.tagName.toLowerCase()&&!/z/i.test(e.getAttribute("d")??""))return;const s=e.getBoundingClientRect(),a=s.width*s.height;if(!(a>0)||a/t>.04)return;const l=o.getAttribute("style");o.setAttribute("style",(l?`${l.replace(/;?\s*$/,"")};`:"")+"fill:#ffffff")})}finally{r.remove()}const l=(new XMLSerializer).serializeToString(o);return URL.createObjectURL(new Blob([l],{type:"image/svg+xml"}))}(e).catch(()=>null);e===(this.roomFillUnder?this.backgroundImageUrl:null)?this._knockout={for:e,url:t}:t&&URL.revokeObjectURL(t)}_contentBounds(){const e=[];for(const t of this.rooms)e.push(...t.points);for(const t of this.walls)e.push(...t.points);for(const t of this.pins)e.push([t.x,t.y]);if(0===e.length)return null;const t=e.map(([e])=>e),i=e.map(([,e])=>e),n=Math.min(...t),o=Math.max(...t),r=Math.min(...i),s=Math.max(...i),a=.08*Math.max(o-n,s-r)||40;return{x:n-a,y:r-a,w:o-n+2*a,h:s-r+2*a}}fitToScreen(){this._viewBox=this._contentBounds()??{x:0,y:0,w:kn,h:this._naturalHeight}}getViewBox(){return{...this._viewBox}}_svgTransform(){const e=this._svg?.getBoundingClientRect(),t=e?.width||this._viewBox.w,i=e?.height||this._viewBox.h,n=Math.min(t/this._viewBox.w,i/this._viewBox.h)||1;return{scale:n,offsetX:(t-this._viewBox.w*n)/2,offsetY:(i-this._viewBox.h*n)/2}}_pxToUnits(e){return e/this._svgTransform().scale}_clientToImage(e,t){const i=this._svg,n=i.createSVGPoint();n.x=e,n.y=t;const o=i.getScreenCTM();if(!o)return{x:0,y:0};const r=n.matrixTransform(o.inverse());return{x:r.x,y:r.y}}_effectivePoints(e,t,i){const n=this._editingTarget;if(n&&n.kind===e&&n.id===t&&this._liveEditPoints)return this._liveEditPoints;const o=this._liveRoomMove;return"room"===e&&o?.id===t?i.map(([e,t])=>[e+o.dx,t+o.dy]):i}get _displayPins(){const e=this._liveRoomMove;return e?this.pins.map(t=>t.room_id===e.id?{...t,x:t.x+e.dx,y:t.y+e.dy}:t):this.pins}_snappedTracePoint(e,t,i,n){if(n||0===e.length)return{point:[t,i],lockedX:!1,lockedY:!1};const o=this._pxToUnits(10),r=e[e.length-1],s=e[0],a=e.length>=3&&(s[0]!==r[0]||s[1]!==r[1])?[r,s]:[r];let l=null,c=1/0,d=null,h=1/0;for(const[e,n]of a){const r=Math.abs(t-e),s=Math.abs(i-n);r>o&&s>o||(r<=s?r<c&&(l=e,c=r):s<h&&(d=n,h=s))}return{point:[l??t,d??i],lockedX:null!==l,lockedY:null!==d}}_snappedVertexPoint(e,t,i,n,o,r){if(r||"off"===this.snapMode)return[i,n];const s=this._pxToUnits(10),a=t>0?t-1:o?e.length-1:-1;if(a>=0&&a!==t)return at(e[a],[i,n],s);const l=t<e.length-1?t+1:o?0:-1;return l>=0&&l!==t?at(e[l],[i,n],s):[i,n]}_effectiveOpening(e){return this._liveOpeningEdit?.id===e.id?{...e,x:this._liveOpeningEdit.x,y:this._liveOpeningEdit.y,width:this._liveOpeningEdit.width}:e}get unitsPerCm(){if(this.scale&&this.scale.meters>0){const[[e,t],[i,n]]=this.scale.points,o=Ke(e,t,i,n);if(o>0)return o/this.scale.meters/100}return.5}_effectiveFurniture(e){const t=this._liveFurniture;return t?.id===e.id?{...e,...t}:e}_furnitureToImage(e,t,i){const n=this.unitsPerCm,o=e.rotation_deg*Math.PI/180,r=Math.cos(o),s=Math.sin(o);return[e.x+(t*r-i*s)*n,e.y+(t*s+i*r)*n]}_imageToFurniture(e,t,i){const n=this.unitsPerCm,o=e.rotation_deg*Math.PI/180,r=Math.cos(o),s=Math.sin(o),a=(t-e.x)/n,l=(i-e.y)/n;return[a*r+l*s,-a*s+l*r]}_furnitureAt(e,t,i=!1){const n=this._pxToUnits(3)/this.unitsPerCm,o=this._pxToUnits(12)/this.unitsPerCm;let r=null;for(const s of this.furniture){if(i&&!s.entity_id)continue;const a=this._effectiveFurniture(s),[l,c]=this._imageToFurniture(a,e,t);Math.abs(l)<=Math.max(a.width_cm/2,o)+n&&Math.abs(c)<=Math.max(a.depth_cm/2,o)+n&&(!r||a.width_cm*a.depth_cm<r.width_cm*r.depth_cm)&&(r=s)}return r}_furnitureFrame(e){const t=this.unitsPerCm,i=this._pxToUnits(48)/t;return{w:Math.max(e.width_cm,i)/2,d:Math.max(e.depth_cm,i)/2,small:Math.min(e.width_cm,e.depth_cm)<i}}_furnitureHandles(e){const t=this._effectiveFurniture(e),{w:i,d:n,small:o}=this._furnitureFrame(t),r=this._pxToUnits(26)/this.unitsPerCm,s={rotate:this._furnitureToImage(t,0,-n-r),...o?{move:this._furnitureToImage(t,0,n+r)}:{}};for(const e of Sn){const[o,r]=Ln[e];s[e]=this._furnitureToImage(t,o*i,r*n)}return s}_furnitureBox(e){const t=this.unitsPerCm,i=e.rotation_deg*Math.PI/180,n=Math.abs(Math.cos(i)),o=Math.abs(Math.sin(i)),r=(e.width_cm*n+e.depth_cm*o)/2*t,s=(e.width_cm*o+e.depth_cm*n)/2*t;return{x1:e.x-r,y1:e.y-s,x2:e.x+r,y2:e.y+s}}_snapFurnitureMove(e,t,i){const n=this._pxToUnits(8),o=this._furnitureBox({...e,x:t,y:i}),r=[],s=[];for(const t of this.furniture){if(t.id===e.id)continue;const i=this._furnitureBox(t);[i.x1,(i.x1+i.x2)/2,i.x2].forEach((e,t)=>r.push({v:e,a:i.y1,b:i.y2,k:t})),[i.y1,(i.y1+i.y2)/2,i.y2].forEach((e,t)=>s.push({v:e,a:i.x1,b:i.x2,k:t}))}for(const e of this.walls){const t=Te(e)/2*this.unitsPerCm;for(const[i,n]of e.points){for(const e of[i-t,i+t])r.push({v:e,a:n,b:n,k:-1});for(const e of[n-t,n+t])s.push({v:e,a:i,b:i,k:-1})}}const a=(e,t)=>{let i=null,o=1/0;return e.forEach((e,r)=>{for(const s of t){const t=s.v-e;if(Math.abs(t)>n)continue;const a=Math.abs(t)+(-1===s.k||s.k===r?0:.6*n);a<o&&(o=a,i={shift:t,v:s.v,a:s.a,b:s.b})}}),i},l=a([o.x1,(o.x1+o.x2)/2,o.x2],r),c=a([o.y1,(o.y1+o.y2)/2,o.y2],s),d=t+(l?.shift??0),h=i+(c?.shift??0),u=this._furnitureBox({...e,x:d,y:h});return{x:d,y:h,guides:{x:l?{pos:l.v,a:Math.min(l.a,u.y1),b:Math.max(l.b,u.y2)}:null,y:c?{pos:c.v,a:Math.min(c.a,u.x1),b:Math.max(c.b,u.x2)}:null}}}_furnitureHandleEdit(e,t,i,n,o){const r={id:e.id,x:e.x,y:e.y,rotation_deg:e.rotation_deg,width_cm:e.width_cm,depth_cm:e.depth_cm};if("rotate"===t){let t=180*Math.atan2(n.y-e.y,n.x-e.x)/Math.PI+90;return o||(t=15*Math.round(t/15)),{...r,rotation_deg:(t%360+360)%360}}const[s,a]=this._imageToFurniture(e,n.x,n.y),l=e=>Math.max(5,o?e:Math.round(e));if("move"===t)return r;const[c,d]=Ln[t],h=0===c?e.width_cm:l(e.width_cm+c*(s-i[0])),u=0===d?e.depth_cm:l(e.depth_cm+d*(a-i[1])),[g,p]=this._furnitureToImage(e,c*(h-e.width_cm)/2,d*(u-e.depth_cm)/2);return{...r,x:g,y:p,width_cm:h,depth_cm:u}}_openingEndpoints(e){const t=this.walls.find(t=>t.id===e.wallId);if(!t)return null;const i=this._effectivePoints("wall",t.id,t.points),n=this._effectiveOpening(e);return lt(n.x,n.y,n.width,i)}_snappedGeometryPoint(e,t,i,n){const o=n||"off"===this.snapMode;if(!o){const e=this._pxToUnits(xn),n="all"===this.snapMode||"wall"===this.mode,o="all"===this.snapMode||"trace"===this.mode;let r=null;for(const o of n?this.walls:[]){const n=parseFloat(this._wallStrokeWidth(o,Fe(o.material)))/2,s=Math.max(e,n);if(it(t,i,o.points)>s)continue;const a=rt(o.points,t,i).point,l=Ke(t,i,a[0],a[1]);(!r||l<r.dist)&&(r={point:a,dist:l})}const s=o?function(e,t,i,n){let o=null,r=n;for(const n of e){if(n.points.length<2)continue;const{point:e}=st(n.points,t,i),s=Ke(t,i,e[0],e[1]);s<=r&&(o=n,r=s)}return o}(this.rooms,t,i,e):null;if(s){const e=st(s.points,t,i).point,n=Ke(t,i,e[0],e[1]);(!r||n<r.dist)&&(r={point:e,dist:n})}if(r)return{point:r.point,kind:"geometry",lockedX:!1,lockedY:!1}}const{point:r,lockedX:s,lockedY:a}=this._snappedTracePoint(e,t,i,o);return{point:r,kind:s||a?"axis":"none",lockedX:s,lockedY:a}}_hitTest(e,t,i){const n=this._pxToUnits(xn);if("select"!==this.mode)return{type:"empty"};const o=this._editingTarget;if(o&&this._liveEditPoints){const e=this._liveEditPoints,t=Ct(e,i.x,i.y,n);if(null!==t)return{type:"vertex",index:t};const r=Ct("room"===o.kind?nt(e):ot(e),i.x,i.y,n);if(null!==r)return{type:"edgeMidpoint",index:r};const s="room"===o.kind?this.rooms.find(e=>e.id===o.id):void 0;return s&&this._roomLabelHit(s,i,n)?{type:"roomLabel",room:s}:{type:"empty"}}const r=this.rooms.find(e=>e.id===this.selectedRoomId);if(r&&this._roomLabelHit(r,i,n))return{type:"roomLabel",room:r};const s=St(this.pins,i.x,i.y,n);if(s.length>1)return{type:"pinStack",pins:s};if(1===s.length)return{type:"pin",pin:s[0]};const a=function(e,t,i,n){let o=null,r=n;for(const n of e){const e=it(t,i,[[n.fromPin.x,n.fromPin.y],[n.toPin.x,n.toPin.y]]);e<=r&&(o=n,r=e)}return o}(this.meshLinks,i.x,i.y,n);if(a)return{type:"meshLink",link:a};const l=function(e,t,i,n){let o=null,r=n;for(const n of e){const e=Math.min(Ke(n.x,n.y,t,i),it(t,i,[[n.fromPin.x,n.fromPin.y],[n.x,n.y]]));e<=r&&(o=n,r=e)}return o}(this.meshStubs,i.x,i.y,n);if(l)return{type:"meshStub",stub:l};if(this.showFurniture&&this.readOnly){const e=this._furnitureAt(i.x,i.y,!0);if(e)return{type:"furniture",item:e}}if(this.showFurniture&&!this.readOnly){const e=this.furniture.find(e=>e.id===this.selectedFurnitureId);if(e&&!e.locked){const t=this._furnitureHandles(e);for(const o of["move","rotate","se","sw","ne","nw","e","w","s","n"]){const r=t[o];if(!r)continue;const[s,a]=r;if(Ke(s,a,i.x,i.y)<=n)return{type:"furnitureHandle",item:e,handle:o}}}const t=this._furnitureAt(i.x,i.y);if(t)return{type:"furniture",item:t}}if(this.selectedOpeningId){const e=this.openings.find(e=>e.id===this.selectedOpeningId),t=e?this._openingEndpoints(e):null;if(e&&t){const o=Ct(t,i.x,i.y,n);if(null!==o)return{type:"openingHandle",opening:e,whichEnd:o}}}const c=function(e,t,i,n,o){let r=null,s=o;for(const o of e){const e=t.find(e=>e.id===o.wallId);if(!e)continue;const a=lt(o.x,o.y,o.width,e.points);if(!a)continue;const l=it(i,n,a);l<=s&&(r=o,s=l)}return r}(this.openings,this.walls,i.x,i.y,n);if(c)return{type:"opening",opening:c};const d=Pt(this.walls,i.x,i.y,n);if(d)return{type:"wall",wall:d};const h=this.rooms.find(e=>this._roomLabelHit(e,i,0));if(h)return{type:"roomLabel",room:h};const u=this.rooms.find(e=>e.points.length>=3&&Ye(i.x,i.y,e.points));return u?{type:"room",room:u}:{type:"empty"}}_lockGesture(){if("align"===this.mode)return{kind:"alignDrag"};if(this.readOnly)return{kind:"pan"};if("furniture"===this.mode&&Ai(this.armedFurnitureKind)&&this.armedFurnitureKind!==Hi&&this._lastImage)return{kind:"furnitureDraw",startX:this._lastImage.x,startY:this._lastImage.y};if("furnitureHandle"===this._downHit?.type&&this._lastImage){const{item:e,handle:t}=this._downHit;return"move"===t?{kind:"furnitureMove",id:e.id,startX:this._lastImage.x,startY:this._lastImage.y}:{kind:"furnitureHandle",id:e.id,handle:t,start:e,startLocal:this._imageToFurniture(e,this._lastImage.x,this._lastImage.y)}}return"furniture"===this._downHit?.type&&!this._downHit.item.locked&&this._lastImage?{kind:"furnitureMove",id:this._downHit.item.id,startX:this._lastImage.x,startY:this._lastImage.y}:"vertex"===this._downHit?.type?(this._vertexDragStartPoints=this._liveEditPoints?[...this._liveEditPoints]:null,{kind:"vertex",index:this._downHit.index}):"pin"===this._downHit?.type?{kind:"pin",pinId:this._downHit.pin.id}:"roomLabel"===this._downHit?.type?{kind:"roomLabel",roomId:this._downHit.room.id}:"room"===this._downHit?.type&&this._downHit.room.id===this.selectedRoomId&&this._lastImage?{kind:"roomMove",roomId:this._downHit.room.id,startX:this._lastImage.x,startY:this._lastImage.y}:"openingHandle"===this._downHit?.type?{kind:"openingHandle",openingId:this._downHit.opening.id,whichEnd:this._downHit.whichEnd}:"opening"===this._downHit?.type?{kind:"openingMove",openingId:this._downHit.opening.id}:{kind:"pan"}}_dispatchVertexChanged(e){const t=this._editingTarget;if(!t)return;const i="room"===t.kind?"room-vertex-changed":"wall-vertex-changed",n="room"===t.kind?"roomId":"wallId";this.dispatchEvent(new CustomEvent(i,{detail:{[n]:t.id,points:e}}))}_commitGesture(){if("furnitureDraw"===this._gesture?.kind){const e=this._drawBox;if(this._drawBox=null,!e)return;const t=this.unitsPerCm,i=90===Math.abs(this.armedFurnitureRotation%180),n=Math.max(1,Math.abs(e.x1-e.x0)/t),o=Math.max(1,Math.abs(e.y1-e.y0)/t);return void this.dispatchEvent(new CustomEvent("furniture-place",{detail:{x:(e.x0+e.x1)/2,y:(e.y0+e.y1)/2,width_cm:Math.round(i?o:n),depth_cm:Math.round(i?n:o),keepArmed:!1}}))}if(("furnitureMove"===this._gesture?.kind||"furnitureHandle"===this._gesture?.kind)&&this._liveFurniture){const e=this._liveFurniture;this._liveFurniture=null,this._furnitureGuides={x:null,y:null};const t=this.furniture.find(t=>t.id===e.id);return void((!t||t.x!==e.x||t.y!==e.y||t.rotation_deg!==e.rotation_deg||t.width_cm!==e.width_cm||t.depth_cm!==e.depth_cm)&&this.dispatchEvent(new CustomEvent("furniture-update",{detail:e})))}if("vertex"===this._gesture?.kind&&this._editingTarget&&this._liveEditPoints)this._dispatchVertexChanged(this._liveEditPoints);else if("pin"===this._gesture?.kind&&this._liveDragPin)this.dispatchEvent(new CustomEvent("pin-move",{detail:{pinId:this._liveDragPin.id,x:this._liveDragPin.x,y:this._liveDragPin.y}})),this._liveDragPin=null;else if("roomMove"===this._gesture?.kind&&this._liveRoomMove){const{dx:e,dy:t}=this._liveRoomMove;if(this._roomMoveGuides={x:null,y:null},0===e&&0===t)return void(this._liveRoomMove=null);this.dispatchEvent(new CustomEvent("room-move",{detail:{roomId:this._liveRoomMove.id,dx:this._liveRoomMove.dx,dy:this._liveRoomMove.dy}})),this._liveRoomMove=null}else"roomLabel"===this._gesture?.kind&&this._liveRoomLabel?(this.dispatchEvent(new CustomEvent("room-label-moved",{detail:{roomId:this._liveRoomLabel.id,x:this._liveRoomLabel.x,y:this._liveRoomLabel.y}})),this._liveRoomLabel=null):"openingMove"!==this._gesture?.kind&&"openingHandle"!==this._gesture?.kind||!this._liveOpeningEdit||(this.dispatchEvent(new CustomEvent("opening-update",{detail:{openingId:this._liveOpeningEdit.id,x:this._liveOpeningEdit.x,y:this._liveOpeningEdit.y,width:this._liveOpeningEdit.width}})),this._liveOpeningEdit=null)}_handleClick(e,t,i=!1){const n=this._clientToImage(e,t);if("trace"===this.mode){const e=this._pxToUnits(xn),t=this._pendingTrace??{points:[]},{point:[o,r]}=this._snappedGeometryPoint(t.points,n.x,n.y,i),s=It(t,o,r,e);return void(s.closed?(this.dispatchEvent(new CustomEvent("room-trace-complete",{detail:{points:t.points}})),this._pendingTrace=null):this._pendingTrace=s.trace)}if("wall"===this.mode){const e=this._pxToUnits(xn),t=this._pendingTrace??{points:[]},{point:[o,r]}=this._snappedGeometryPoint(t.points,n.x,n.y,i),s=It(t,o,r,e);return void(s.closed?(this.dispatchEvent(new CustomEvent("wall-trace-complete",{detail:{points:[...t.points,t.points[0]]}})),this._pendingTrace=null):this._pendingTrace=s.trace)}if("opening"===this.mode){if(!this.armedOpeningType)return;const e=this._pxToUnits(xn),t=Pt(this.walls,n.x,n.y,e);if(!t)return;const{point:i}=rt(t.points,n.x,n.y);return void this.dispatchEvent(new CustomEvent("opening-place",{detail:{wallId:t.id,x:i[0],y:i[1]}}))}if("furniture"===this.mode&&this._drawingFreeform){const e=this._pxToUnits(xn),t=this._pendingTrace??{points:[]},{point:[o,r]}=this._freeformPoint(t.points,n.x,n.y,i),s=It(t,o,r,e);return void(s.closed?this._placeFreeform(t.points,!0):this._pendingTrace=s.trace)}if("furniture"===this.mode)return void(this.armedFurnitureKind&&this.dispatchEvent(new CustomEvent("furniture-place",{detail:{x:n.x,y:n.y,keepArmed:i}})));if("scale"===this.mode){const e=[...this._pendingScalePoints,[n.x,n.y]];return void(e.length>=2?(this.dispatchEvent(new CustomEvent("scale-line-complete",{detail:{points:e.slice(0,2)}})),this._pendingScalePoints=[]):this._pendingScalePoints=e)}if("place"===this.mode){if(this.armedEntityId){const e=this._pxToUnits(xn),t=St(this.pins,n.x,n.y,e)[0],i=t?.x??n.x,o=t?.y??n.y;this.dispatchEvent(new CustomEvent("pin-place",{detail:{x:i,y:o}}))}return}const o=this._downHit??{type:"empty"};if(this.readOnly){const e="furniture"===o.type?{kind:"furniture",id:o.item.id}:"pin"===o.type?{kind:"pin",id:o.pin.id}:"pinStack"===o.type?{kind:"pin",id:o.pins[0].id}:"opening"===o.type?{kind:"opening",id:o.opening.id}:"room"===o.type||"roomLabel"===o.type?{kind:"room",id:o.room.id}:null;return void(e&&this.dispatchEvent(new CustomEvent("plan-tap",{detail:e})))}if("furniture"!==o.type){if("furnitureHandle"!==o.type)if("vertex"===o.type)this._selectedVertexIndex=this._selectedVertexIndex===o.index?null:o.index;else if("edgeMidpoint"===o.type&&this._editingTarget&&this._liveEditPoints){const e=("room"===this._editingTarget.kind?nt(this._liveEditPoints):ot(this._liveEditPoints))[o.index],t=[...this._liveEditPoints];t.splice(o.index+1,0,e),this._liveEditPoints=t,this._dispatchVertexChanged(t)}else if("pin"===o.type)this.dispatchEvent(new CustomEvent("pin-select",{detail:{pinId:this.selectedPinId===o.pin.id?null:o.pin.id}}));else if("pinStack"===o.type)this.dispatchEvent(new CustomEvent("pin-stack-select",{detail:{pinIds:o.pins.map(e=>e.id)}}));else if("roomLabel"===o.type&&this._editingTarget);else if("room"===o.type||"roomLabel"===o.type)this.dispatchEvent(new CustomEvent("room-select",{detail:{roomId:this.selectedRoomId===o.room.id?null:o.room.id}}));else if("wall"===o.type)this.dispatchEvent(new CustomEvent("wall-select",{detail:{wallId:this.selectedWallId===o.wall.id?null:o.wall.id}}));else if("opening"===o.type)this.dispatchEvent(new CustomEvent("opening-select",{detail:{openingId:this.selectedOpeningId===o.opening.id?null:o.opening.id}}));else if("meshLink"===o.type){const e=`${o.link.fromPin.id}|${o.link.toPin.id}`;this.dispatchEvent(new CustomEvent("mesh-link-select",{detail:{link:this.selectedMeshLinkKey===e?null:o.link}}))}else if("meshStub"===o.type){const e=`${o.stub.fromPin.id}|${o.stub.targetDeviceId}`;this.dispatchEvent(new CustomEvent("mesh-stub-select",{detail:{stub:this.selectedMeshStubKey===e?null:o.stub}}))}else if(this._editingTarget&&null!==this._selectedVertexIndex&&this._liveEditPoints){const e="room"===this._editingTarget.kind,[t,o]=this._snappedVertexPoint(this._liveEditPoints,this._selectedVertexIndex,n.x,n.y,e,i),r=[...this._liveEditPoints];r[this._selectedVertexIndex]=[t,o],this._liveEditPoints=r,this._selectedVertexIndex=null,this._dispatchVertexChanged(r)}else this._selectedVertexIndex=null,this.dispatchEvent(new CustomEvent("room-select",{detail:{roomId:null}})),this.dispatchEvent(new CustomEvent("pin-select",{detail:{pinId:null}})),this.dispatchEvent(new CustomEvent("wall-select",{detail:{wallId:null}})),this.dispatchEvent(new CustomEvent("opening-select",{detail:{openingId:null}})),this.dispatchEvent(new CustomEvent("furniture-select",{detail:{furnitureId:null}})),this.dispatchEvent(new CustomEvent("mesh-link-select",{detail:{link:null}})),this.dispatchEvent(new CustomEvent("mesh-stub-select",{detail:{stub:null}}))}else this.dispatchEvent(new CustomEvent("furniture-select",{detail:{furnitureId:this.selectedFurnitureId===o.item.id?null:o.item.id}}))}get _drawingFreeform(){return"furniture"===this.mode&&this.armedFurnitureKind===Hi}_freeformPoint(e,t,i,n){const o=this._snappedGeometryPoint(e,t,i,n);if(n||"off"===this.snapMode||"geometry"===o.kind)return this._furnitureGuides={x:null,y:null},o;const r={id:"__freeform__",kind:Hi,x:t,y:i,rotation_deg:0,width_cm:0,depth_cm:0,stroke_width:1},s=this._snapFurnitureMove(r,t,i);return this._furnitureGuides=s.guides,s.guides.x||s.guides.y?{...o,point:[s.guides.x?s.x:o.point[0],s.guides.y?s.y:o.point[1]]}:o}_placeFreeform(e,t){if(this._pendingTrace=null,this._furnitureGuides={x:null,y:null},e.length<2)return;const i=e.map(([e])=>e),n=e.map(([,e])=>e),o=Math.min(...i),r=Math.min(...n),s=Math.max(...i)-o,a=Math.max(...n)-r,l=this.unitsPerCm;this.dispatchEvent(new CustomEvent("furniture-place",{detail:{x:o+s/2,y:r+a/2,width_cm:Math.max(1,Math.round(s/l*10)/10),depth_cm:Math.max(1,Math.round(a/l*10)/10),points:e.map(([e,t])=>[s>0?Math.round((e-o)/s*1e4)/1e4:.5,a>0?Math.round((t-r)/a*1e4)/1e4:.5]),closed:t,keepArmed:!1}}))}finishPendingShape(){const e=this._pendingTrace?.points;!this._drawingFreeform||!e||e.length<2||this._placeFreeform(e,!1)}finishPendingWall(){"wall"!==this.mode||!this._pendingTrace||this._pendingTrace.points.length<2||(this.dispatchEvent(new CustomEvent("wall-trace-complete",{detail:{points:this._pendingTrace.points}})),this._pendingTrace=null)}cancelGesture(){const e=this._gesture?.kind;return!(!this._moved||!e||"pan"===e||"pinch"===e||"alignDrag"===e)&&("vertex"===e&&this._vertexDragStartPoints&&(this._liveEditPoints=this._vertexDragStartPoints),this._liveRoomMove=null,this._roomMoveGuides={x:null,y:null},this._liveDragPin=null,this._liveRoomLabel=null,this._liveOpeningEdit=null,this._liveFurniture=null,this._furnitureGuides={x:null,y:null},this._gesture=null,this._gestureCancelled=!0,this._svg.style.cursor="",!0)}_snapRoomMove(e,t,i,n){const o=this.rooms.find(t=>t.id===e);if(!o)return{dx:t,dy:i,guides:{x:null,y:null}};const r=[...this.rooms.filter(t=>t.id!==e).flatMap(e=>e.points),...this.walls.flatMap(e=>e.points)];let s=null,a=null;for(const[e,l]of o.points){const o=e+t,c=l+i;for(const[e,t]of r){const i=e-o;Math.abs(i)<=n&&(!s||Math.abs(i)<Math.abs(s.delta))&&(s={delta:i,at:e});const r=t-c;Math.abs(r)<=n&&(!a||Math.abs(r)<Math.abs(a.delta))&&(a={delta:r,at:t})}}return{dx:t+(s?.delta??0),dy:i+(a?.delta??0),guides:{x:s?.at??null,y:a?.at??null}}}undoLastPoint(){if("scale"===this.mode&&this._pendingScalePoints.length>0)return this._pendingScalePoints=this._pendingScalePoints.slice(0,-1),!0;const e=this._pendingTrace?.points;return!(!e||0===e.length)&&(this._pendingTrace=e.length>1?{points:e.slice(0,-1)}:null,!0)}cancelPending(){this._pendingTrace=null,this._pendingScalePoints=[]}_deleteSelectedVertex(){const e=this._editingTarget;if(null===this._selectedVertexIndex||!e||!this._liveEditPoints)return;const t="room"===e.kind?3:2;if(this._liveEditPoints.length<=t)return;const i=this._liveEditPoints.filter((e,t)=>t!==this._selectedVertexIndex);this._liveEditPoints=i,this._selectedVertexIndex=null,this._dispatchVertexChanged(i)}_zoomBy(e,t){const i=qe(this._viewBox.w*e,250,4e3),n=i/this._viewBox.w,o=this._viewBox.h*n;this._viewBox={x:t.x-(t.x-this._viewBox.x)*n,y:t.y-(t.y-this._viewBox.y)*n,w:i,h:o}}_zoomButton(e){const t=this._viewBox;this._zoomBy(e,{x:t.x+t.w/2,y:t.y+t.h/2})}_pinLabel(e){return e.label_override?e.label_override:Me(e.device_id,this.entityLookup.values())}_roomLabelPosition(e,t){if(this._liveRoomLabel?.id===e.id)return[this._liveRoomLabel.x,this._liveRoomLabel.y];const i=this._liveRoomMove?.id===e.id?this._liveRoomMove:null,[n,o]=e.label_position??et(i?e.points:t);return i?[n+i.dx,o+i.dy]:[n,o]}_roomLabelHit(e,t,i){if(!1===e.visible)return!1;const n=this._effectivePoints("room",e.id,e.points);if(n.length<2)return!1;if(!1===e.show_label)return!1;const[o,r]=this._roomLabelPosition(e,n),s=this._roomLabelSize(e)/16,a=-(e.label_rotation??0)*Math.PI/180,l=t.x-o,c=t.y-r,d=l*Math.cos(a)-c*Math.sin(a),h=l*Math.sin(a)+c*Math.cos(a),u=9*e.name.length*s/2;return d>=-u-i&&d<=u+i&&h>=-13*s-i&&h<=4*s+i}_roomLabelSize(e){return this.roomLabelStyle.size*(e.label_size??1)}_roomFill(e){return yn(e.fill_color??Mn,e.fill_opacity??$n,this.showLights?this.roomLights.get(e.id):void 0,this.dark)}_isRoomSelected(e){return e.id===this.selectedRoomId||this.editingRoomId===e.id}_renderRoomFill(e){if(!1===e.visible)return K;const t=this._effectivePoints("room",e.id,e.points);if(t.length<3)return K;const{color:i,opacity:n}=this._roomFill(e);return Z`<polygon
      points=${t.map(([e,t])=>`${e},${t}`).join(" ")}
      fill=${i}
      fill-opacity=${this._isRoomSelected(e)?Math.min(1,n*(.32/.18)):n}
    ></polygon>`}_renderRoom(e){if(!1===e.visible)return K;const t=this._effectivePoints("room",e.id,e.points);if(t.length<2)return K;const i=t.map(([e,t])=>`${e},${t}`).join(" "),[n,o]=this._roomLabelPosition(e,t),r=this.editingRoomId===e.id,s=this._isRoomSelected(e),a=e.fill_color??Mn,{color:l,opacity:c}=this._roomFill(e),d=e.border_opacity??1,h=this.showLights?this.roomLights.get(e.id):void 0,u=this.roomFillUnder&&!!this.backgroundImageUrl,g=this.roomLabelStyle,p=h?He("canvas.lights.count",{on:h.on,total:h.entityIds.length}):"",m=this._liveRoomMove?.id===e.id?this._liveRoomMove:null,f=!m||0===m.dx&&0===m.dy?K:Z`<polygon
            class="room-ghost"
            points=${e.points.map(([e,t])=>`${e},${t}`).join(" ")}
          ></polygon>`;return Z`
      ${f}
      <polygon
        class="room-poly ${s?"selected":""}"
        points=${i}
        fill=${l}
        fill-opacity=${u?0:s?Math.min(1,c*(.32/.18)):c}
        stroke=${this.roomBorder.color??a}
        stroke-opacity=${this.roomBorder.show?d*this.roomBorder.opacity:s?1:0}
        stroke-width=${this.roomBorder.show?this.roomBorder.width+(s?1:0):s?2:0}
      >${p?Z`<title>${e.name}: ${p}</title>`:K}</polygon>
      <text
        class="room-label"
        x=${n}
        y=${o}
        style=${`font-size:${this._roomLabelSize(e)}px;${e.label_color||this.roomLabelStyle.color?`fill:${e.label_color||this.roomLabelStyle.color};`:""}${this.roomLabelStyle.bold?"font-weight:700;":""}${!1===g.halo?"stroke:none;":`stroke-width:${g.haloWidth??3}px;${g.haloColor?`stroke:${g.haloColor};`:""}`}${!1===e.show_label?"display:none;":""}`}
        transform=${e.label_rotation?`rotate(${e.label_rotation} ${n} ${o})`:""}
      >${e.name}${p&&this.showLightCount?Z`<tspan class="room-lights" x=${n} dy="1.2em">${p}</tspan>`:K}</text>
      ${r?this._renderVertexHandles(t,!0):K}
    `}_renderVertexHandles(e,t){const i=this._pxToUnits(6),n=this._pxToUnits(4),o=t?nt(e):ot(e);return Z`
      ${o.map(([e,t])=>Z`<circle class="midpoint-handle" cx=${e} cy=${t} r=${n}></circle>`)}
      ${e.map(([e,t],n)=>{const o=n===this._selectedVertexIndex;return Z`
          <circle
            class="vertex-handle ${o?"selected":""}"
            cx=${e}
            cy=${t}
            r=${i}
          ></circle>
          ${o?Z`
                <g
                  class="vertex-delete"
                  transform="translate(${e+2.2*i}, ${t-2.2*i})"
                  @pointerdown=${e=>{e.stopPropagation()}}
                  @click=${e=>{e.stopPropagation(),this._deleteSelectedVertex()}}
                >
                  <circle r=${i}></circle>
                  <line
                    class="vertex-delete-x"
                    x1=${.5*-i}
                    y1=${.5*-i}
                    x2=${.5*i}
                    y2=${.5*i}
                  ></line>
                  <line
                    class="vertex-delete-x"
                    x1=${.5*-i}
                    y1=${.5*i}
                    x2=${.5*i}
                    y2=${.5*-i}
                  ></line>
                </g>
              `:K}
        `})}
    `}_livePinPosition(e){if(this._liveDragPin?.id===e.id)return this._liveDragPin;const t=this._liveRoomMove;return t&&e.room_id===t.id?{x:e.x+t.dx,y:e.y+t.dy}:e}_renderMeshLink(e){const t=`${e.fromPin.id}|${e.toPin.id}`,i=this._livePinPosition(e.fromPin),n=this._livePinPosition(e.toPin);return Z`
      <line
        class="mesh-link ${t===this.selectedMeshLinkKey?"selected":this.selectedMeshLinkKey?"dim":""}"
        x1=${i.x}
        y1=${i.y}
        x2=${n.x}
        y2=${n.y}
        style="stroke:${ye(e.quality)}"
      >
        <title>${e.detail??e.quality}</title>
      </line>
    `}_renderRoomMoveGuides(){if(!this._liveRoomMove)return K;const{x:e,y:t}=this._roomMoveGuides,i=this._viewBox;return Z`
      ${null!==e?Z`<line class="axis-guide" x1=${e} y1=${i.y} x2=${e} y2=${i.y+i.h}></line>`:K}
      ${null!==t?Z`<line class="axis-guide" x1=${i.x} y1=${t} x2=${i.x+i.w} y2=${t}></line>`:K}
    `}_renderMeshStubLine(e){const t=`${e.fromPin.id}|${e.targetDeviceId}`,i=this._livePinPosition(e.fromPin);return Z`
      <line
        class="mesh-stub-line ${t===this.selectedMeshStubKey?"selected":""}"
        x1=${i.x}
        y1=${i.y}
        x2=${e.x}
        y2=${e.y}
        style="stroke:${ye(e.quality)}"
      >
        <title>${e.targetLabel} (${e.targetFloorName})</title>
      </line>
    `}_renderMeshStubMarkers(){const e=this._pxToUnits(10),t=this._pxToUnits(12),i=new Map;for(const e of this.meshStubs){const t=`${e.targetDeviceId}|${e.x},${e.y}`,n=`${e.fromPin.id}|${e.targetDeviceId}`===this.selectedMeshStubKey,o=i.get(t);o?n&&(o.selected=!0):i.set(t,{stub:e,selected:n})}const n=(e,t)=>e.minX<t.maxX&&t.minX<e.maxX&&e.minY<t.maxY&&t.minY<e.maxY,o=[];for(const e of this.rooms){if(!1===e.visible)continue;const t=this._effectivePoints("room",e.id,e.points);if(t.length<2)continue;const[i,n]=this._roomLabelPosition(e,t),r=9*e.name.length/2;o.push({minX:i-r,maxX:i+r,minY:n-13,maxY:n+4})}const r=this.pins.map(e=>({minX:e.x-t,maxX:e.x+t,minY:e.y-t,maxY:e.y+t}));return[...i.values()].map(({stub:t,selected:i})=>{const s=(t=>{const i=7*t.targetFloorName.length/2;return{minX:t.x-i,maxX:t.x+i,minY:t.y+e+3,maxY:t.y+e+17}})(t),a=!r.some(e=>n(s,e))&&!o.some(e=>n(s,e));return a&&o.push(s),Z`
        ${this._renderPinMarker(t.x,t.y,e,{kind:"path",d:"M10,5V10H9V5H5V13H9V12H10V17H9V14H5V19H12V17H13V19H19V17H21V21H3V3H21V15H19V10H13V15H12V9H19V5H10Z"},"var(--sc-fg-secondary)",i,`${t.targetLabel} (${t.targetFloorName})`)}
        ${a?Z`<text class="mesh-stub-label" x=${t.x} y=${t.y+e+14}
                >${t.targetFloorName}</text
              >`:K}
      `})}_iconForPin(e){return this._pinIcons.iconForPin(e,this.entityLookup.values())}_pinGroups(){const e=new Map;for(const t of this._displayPins){const i=`${t.x},${t.y}`;e.has(i)||e.set(i,[]),e.get(i).push(t)}return[...e.values()].map(e=>({x:e[0].x,y:e[0].y,pins:e}))}_renderPinGroup(e){const t=this._pxToUnits(12);if(1===e.pins.length){const i=e.pins[0],n=this._liveDragPin?.id===i.id?this._liveDragPin:null,o=n?.x??i.x,r=n?.y??i.y,s=i.id===this.selectedPinId;return this._renderPinMarker(o,r,t,this._iconForPin(i),this.pinColors.get(i.id)??"var(--sc-accent)",s,this._pinLabel(i))}const i=e.pins.some(e=>e.id===this.selectedPinId),n=`${e.pins.length} devices: ${e.pins.map(e=>this._pinLabel(e)).join(", ")}`;return this._renderPinMarker(e.x,e.y,t,{kind:"path",d:"M12 16C13.1 16 14 16.9 14 18S13.1 20 12 20 10 19.1 10 18 10.9 16 12 16M12 10C13.1 10 14 10.9 14 12S13.1 14 12 14 10 13.1 10 12 10.9 10 12 10M12 4C13.1 4 14 4.9 14 6S13.1 8 12 8 10 7.1 10 6 10.9 4 12 4M6 16C7.1 16 8 16.9 8 18S7.1 20 6 20 4 19.1 4 18 4.9 16 6 16M6 10C7.1 10 8 10.9 8 12S7.1 14 6 14 4 13.1 4 12 4.9 10 6 10M6 4C7.1 4 8 4.9 8 6S7.1 8 6 8 4 7.1 4 6 4.9 4 6 4M18 16C19.1 16 20 16.9 20 18S19.1 20 18 20 16 19.1 16 18 16.9 16 18 16M18 10C19.1 10 20 10.9 20 12S19.1 14 18 14 16 13.1 16 12 16.9 10 18 10M18 4C19.1 4 20 4.9 20 6S19.1 8 18 8 16 7.1 16 6 16.9 4 18 4Z"},e.pins.map(e=>this.pinColors.get(e.id)).find(Boolean)??"var(--sc-accent)",i,n)}_renderPinMarker(e,t,i,n,o,r,s){return this._pinIcons.renderMarker(e,t,i,n,o,r,s)}_renderPendingTrace(){const e=this._pendingTrace?.points??[];if(0===e.length&&!this._hoverSnap)return K;const t=e.map(([e,t])=>`${e},${t}`).join(" "),i=this._pxToUnits(6),n=e[e.length-1],o=e[0],r=!!this._hoverSnap&&!!o&&e.length>=3&&Ke(this._hoverSnap.point[0],this._hoverSnap.point[1],o[0],o[1])<=this._pxToUnits(xn);return Z`
      ${e.length>0?Z`<polyline class="pending-trace" points=${t}></polyline>`:K}
      ${e.map(([e,t],n)=>Z`
          <circle
            class="vertex-handle ${0===n&&r?"closing":""}"
            cx=${e}
            cy=${t}
            r=${0===n&&r?1.6*i:i}
          ></circle>
        `)}
      ${this._hoverSnap?this._renderHoverSnap(n,o,r,i):K}
    `}_renderHoverSnap(e,t,i,n){if(!this._hoverSnap)return K;const[o,r]=this._hoverSnap.point,s=this._viewBox,a=i&&t?t:[o,r];return Z`
      ${this._hoverSnap.lockedY?Z`<line
              class="axis-guide"
              x1=${s.x}
              y1=${r}
              x2=${s.x+s.w}
              y2=${r}
            ></line>`:K}
      ${this._hoverSnap.lockedX?Z`<line
              class="axis-guide"
              x1=${o}
              y1=${s.y}
              x2=${o}
              y2=${s.y+s.h}
            ></line>`:K}
      ${e?Z`<line
              class="hover-snap-line ${i?"closing":""}"
              x1=${e[0]}
              y1=${e[1]}
              x2=${a[0]}
              y2=${a[1]}
            ></line>`:K}
      ${i?K:Z`<circle
              class="hover-snap-marker ${"geometry"===this._hoverSnap.kind?"on-geometry":"axis"===this._hoverSnap.kind?"on-axis":""}"
              cx=${o}
              cy=${r}
              r=${n}
            ></circle>`}
    `}_wallStrokeWidth(e,t){if(this.scale){const[[t,i],[n,o]]=this.scale.points,r=(Ke(t,i,n,o)||1)/this.scale.meters;return`${qe(Te(e)/100*r,.5,40)}`}return`${qe(4+t.attenuationDbPerCm*Te(e)/3,4,8)}px`}_renderWall(e){const t=this._effectivePoints("wall",e.id,e.points),i=e.id===this.selectedWallId,n=this.editingWallId===e.id,o=Fe(e.material),r=this._wallStrokeWidth(e,o),s=t[0],a=t[t.length-1],l=t.length>2&&!!s&&!!a&&s[0]===a[0]&&s[1]===a[1],c=(l?t.slice(0,-1):t).map(([e,t])=>`${e},${t}`).join(" "),d="wall-line "+(i||n?"selected":""),h=`stroke:${this.dark?`color-mix(in srgb, ${o.color} 30%, #e0e0e0)`:o.color}; stroke-width:${r}`;return Z`
      ${l?Z`<polygon class=${d} points=${c} style=${h}><title>${Ve(o)}</title></polygon>`:Z`<polyline class=${d} points=${c} style=${h}><title>${Ve(o)}</title></polyline>`}
      ${n?this._renderVertexHandles(t,!1):K}
    `}_renderOpening(e){const t=this._openingEndpoints(e);if(!t)return K;const[[i,n],[o,r]]=t,s=e.id===this.selectedOpeningId,a=this._pxToUnits(6),l=this.walls.find(t=>t.id===e.wallId),c=l?this._wallStrokeWidth(l,Fe(l.material)):void 0,d=Ke(i,n,o,r)||1,h=parseFloat(c??"6")/2*1.5,u=-(r-n)/d*h,g=(o-i)/d*h;if("window"===e.type&&"transom"===e.window_style)return Z`
        <line
          class="opening-hit"
          x1=${i}
          y1=${n}
          x2=${o}
          y2=${r}
          style=${c?`stroke-width:${c}`:K}
        ><title>transom window</title></line>
        <line
          class="opening-transom ${s?"selected":""}"
          x1=${i}
          y1=${n}
          x2=${o}
          y2=${r}
        ></line>
        ${s?Z`
              <circle class="opening-handle" cx=${i} cy=${n} r=${a}></circle>
              <circle class="opening-handle" cx=${o} cy=${r} r=${a}></circle>
            `:K}
      `;const p=(e,t)=>Z`
      <line
        class="opening-jamb-case"
        x1=${e-u}
        y1=${t-g}
        x2=${e+u}
        y2=${t+g}
      ></line>
      <line
        class="opening-jamb"
        x1=${e-u}
        y1=${t-g}
        x2=${e+u}
        y2=${t+g}
      ></line>
    `;return Z`
      <line
        class="opening-line ${e.type} ${s?"selected":""}"
        x1=${i}
        y1=${n}
        x2=${o}
        y2=${r}
        style=${c?`stroke-width:${c}`:K}
      >
        <title>${e.type}</title>
      </line>
      ${p(i,n)}
      ${p(o,r)}
      ${s?Z`
            <circle class="opening-handle" cx=${i} cy=${n} r=${a}></circle>
            <circle class="opening-handle" cx=${o} cy=${r} r=${a}></circle>
          `:K}
    `}_renderFurniture(e,t=!1){const i=this._effectiveFurniture(e),n=Di(i.kind),o=this.unitsPerCm,r=!!i.mirrored!=!!n?.flip,s=i.points&&i.points.length>=2?wi(i.points,i.width_cm,i.depth_cm,!1!==i.closed,i.corners):pi(n?.draw??"box",i.width_cm,i.depth_cm,i.corners?.length?{...n?.opts,corners:i.corners.join(",")}:n?.opts??{}),a=!t&&i.id===this.selectedFurnitureId,l=`translate(${i.x} ${i.y}) rotate(${i.rotation_deg}) scale(${o} ${o})`,c=`translate(${-i.width_cm/2} ${-i.depth_cm/2})${r?` translate(${i.width_cm} 0) scale(-1 1)`:""}`,d=t?void 0:this.itemStates.get(i.id),h=d?.color??i.color,u=(i.opacity??1)*(d?.unavailable?.4:d&&!d.active?.7:1),g=`--fx-stroke-width:${i.stroke_width}px;${h?`--fx-color:${h};`:""}${u<1?`opacity:${u};`:""}`,p=i.label||n?.name||i.kind,m=d?`${p} · ${d.text}`:p,f=d?d.unavailable?"linked unavailable":d.active?"linked active":"linked idle":"",_=d&&d.glow>0&&this.showLights?Math.max(i.width_cm,i.depth_cm)/2*o*(1.5+d.glow):0,b=`item-glow-${i.id}`;return Z`
      ${_>0?Z`<defs><radialGradient id=${b}>
              <stop offset="0" stop-color=${d.color??"#ffd54f"} stop-opacity=${.25+.5*d.glow}></stop>
              <stop offset="0.45" stop-color=${d.color??"#ffd54f"} stop-opacity=${.12+.25*d.glow}></stop>
              <stop offset="1" stop-color=${d.color??"#ffd54f"} stop-opacity="0"></stop>
            </radialGradient></defs>
            <circle class="item-glow" cx=${i.x} cy=${i.y} r=${_} fill="url(#${b})"></circle>`:K}
      <g class="furniture ${t?"ghost":""} ${f}" style=${g} transform=${l}>
        <g transform=${c}>${$i(s,!!i.fill||!!d?.active,!!i.solid)}</g>
        ${a?(()=>{const e=this._furnitureFrame(i);return Z`<rect class="furniture-outline" x=${-e.w} y=${-e.d} width=${2*e.w} height=${2*e.d}></rect>`})():K}
        <title>${m}</title>
      </g>
      ${i.show_label&&!t?Z`<text class="furniture-label" x=${i.x} y=${i.y} style="font-size:${this._pxToUnits(11)}px">${m}</text>`:K}
    `}_renderFurnitureHandles(){if(this.readOnly||!this.showFurniture)return K;const e=this.furniture.find(e=>e.id===this.selectedFurnitureId);if(!e||e.locked)return K;const t=this._furnitureHandles(e),i=this._effectiveFurniture(e),n=this._furnitureFrame(i),o=this._furnitureToImage(i,0,-n.d),r=this._pxToUnits(6),s=(e,t,i="")=>e?Z`<rect class="furniture-handle ${i}" x=${e[0]-t} y=${e[1]-t} width=${2*t} height=${2*t}></rect>`:K,a=t.rotate,l=t.move,c=1.5*r,d=.62*c,h=l?Z`<g class="furniture-move" transform="translate(${l[0]} ${l[1]})">
          <circle class="furniture-handle move" r=${c}></circle>
          <path class="furniture-move-arrows" d="M0 ${-d} L${.35*d} ${.55*-d} M0 ${-d} L${.35*-d} ${.55*-d} M0 ${-d} V${d} M0 ${d} L${.35*d} ${.55*d} M0 ${d} L${.35*-d} ${.55*d} M${-d} 0 H${d} M${-d} 0 L${.55*-d} ${.35*d} M${-d} 0 L${.55*-d} ${.35*-d} M${d} 0 L${.55*d} ${.35*d} M${d} 0 L${.55*d} ${.35*-d}"></path>
        </g>`:K;return Z`
      <line class="furniture-outline" x1=${o[0]} y1=${o[1]} x2=${a[0]} y2=${a[1]}></line>
      <circle class="furniture-handle rotate" cx=${a[0]} cy=${a[1]} r=${r}></circle>
      ${["n","s","e","w"].map(e=>s(t[e],.8*r,Cn(e,i.rotation_deg)))}
      ${["ne","nw","se","sw"].map(e=>s(t[e],r,Cn(e,i.rotation_deg)))}
      ${h}
    `}_renderCornerBadges(){if(this.readOnly||!this.showFurniture)return K;const e=this.furniture.find(e=>e.id===this.selectedFurnitureId);if(!e||!Ai(e.kind))return K;const t=this._effectiveFurniture(e),i=Di(t.kind),n=t.points&&t.points.length>=2?t.points:i?ki(i.draw,i.opts):[];if(0===n.length||n.length>8)return K;const o=!!t.mirrored!=!!i?.flip,r=this.unitsPerCm,s=this._pxToUnits(15)/r,a=this._pxToUnits(8);return Z`${n.map(([e,i],n)=>{let r=e*t.width_cm-t.width_cm/2;const l=i*t.depth_cm-t.depth_cm/2;o&&(r=-r);const c=Math.hypot(r,l)||1,d=Math.min(s,.6*c),[h,u]=this._furnitureToImage(t,r-r/c*d,l-l/c*d);return Z`<g class="corner-badge" transform="translate(${h} ${u})">
        <circle r=${a}></circle>
        <text dy="0.35em" style="font-size:${this._pxToUnits(10)}px">${n+1}</text>
      </g>`})}`}_renderFurnitureGuides(){const{x:e,y:t}=this._furnitureGuides;if(!e&&!t)return K;const i=this._pxToUnits(12);return Z`
      ${e?Z`<line class="smart-guide" x1=${e.pos} y1=${e.a-i} x2=${e.pos} y2=${e.b+i}></line>`:K}
      ${t?Z`<line class="smart-guide" x1=${t.a-i} y1=${t.pos} x2=${t.b+i} y2=${t.pos}></line>`:K}
    `}_renderFurnitureGhost(){if(!this.armedFurnitureKind)return K;const e=Di(this.armedFurnitureKind);if(!e)return K;if(e.id===Hi)return K;const t=this._drawBox;if(t){const i=this.unitsPerCm,n=90===Math.abs(this.armedFurnitureRotation%180),o=Math.max(1,Math.abs(t.x1-t.x0)/i),r=Math.max(1,Math.abs(t.y1-t.y0)/i);return this._renderFurniture({id:"__ghost__",kind:e.id,x:(t.x0+t.x1)/2,y:(t.y0+t.y1)/2,rotation_deg:this.armedFurnitureRotation,width_cm:n?r:o,depth_cm:n?o:r,stroke_width:1.5},!0)}return this._hoverImage?this._renderFurniture({id:"__ghost__",kind:e.id,x:this._hoverImage.x,y:this._hoverImage.y,rotation_deg:this.armedFurnitureRotation,width_cm:e.w,depth_cm:e.d,stroke_width:1.5},!0):K}_sun(){return null!==this.northDeg&&this.location?ji(new Date(this.sunTime??this._now),this.location.latitude,this.location.longitude):null}_renderDaylight(){if(!this.showCovers)return K;const e=this._sun();if(!e&&0===this.coverOpenness.size)return K;const t=[],i=[],n=new Set,o=100*this.unitsPerCm;let r=0;const s=(e,n,o,s,a,l)=>{if(a<=.01)return;const c="daylight-"+r++;t.push(Z`
        <linearGradient id=${c} gradientUnits="userSpaceOnUse" x1=${n[0]} y1=${n[1]} x2=${o[0]} y2=${o[1]}>
          <stop offset="0" stop-color=${s} stop-opacity=${Math.min(.85,a)}></stop>
          <stop offset="0.55" stop-color=${s} stop-opacity=${.55*Math.min(.85,a)}></stop>
          <stop offset="1" stop-color=${s} stop-opacity="0"></stop>
        </linearGradient>`),i.push(Z`<polygon class="cover-patch" points=${e.map(([e,t])=>`${e},${t}`).join(" ")} fill="url(#${c})" clip-path="url(#${l})"></polygon>`)},a=this.rooms.filter(e=>!1!==e.visible&&!e.outdoor&&e.points.length>=3);for(const i of this.openings){const r=i.daylight??{};if(!1===r.enabled)continue;const l="window"===i.type?i.window_style:void 0,c="transom"===l?.35:"full"===l?1.5:1,d="transom"===l||"full"===l?2.4:2.1,h=(r.strength??1)*c,u=r.reach??1,g=this.coverOpenness.has(i.id);if(!(g||e&&"window"===i.type))continue;const p=!!i.cover_right_entity_id,m=this._openingEndpoints(i);if(!m)continue;const[[f,_],[b,v]]=m,y=Ke(f,_,b,v);if(y<=0)continue;const k=(b-f)/y,w=(v-_)/y,x=(f+b)/2,M=(_+v)/2,$=Math.max(this._pxToUnits(8),15*this.unitsPerCm),L=[1,-1].map(e=>{const t=-w*e,i=k*e,n=a.find(e=>Ye(x+t*$,M+i*$,e.points));return n?{nx:t,ny:i,room:n}:null}).filter(e=>null!==e);if(!e||1===L.length||g)for(const{nx:a,ny:l,room:c}of L){const m=`daylight-clip-${c.id}`;n.has(m)||(n.add(m),t.push(Z`<clipPath id=${m}><polygon points=${c.points.map(([e,t])=>`${e},${t}`).join(" ")}></polygon></clipPath>`));const $=(f-x)*-l+(_-M)*a>0,[S,C,P,I]=$?[f,_,b,v]:[b,v,f,_],H=p?[{a:[S,C],b:[x,M],openness:this.coverOpenness.get(i.id)??null,linked:this.coverOpenness.has(i.id)},{a:[x,M],b:[P,I],openness:this.coverOpenness.get(`${i.id}:right`)??null,linked:this.coverOpenness.has(`${i.id}:right`)}]:[{a:[f,_],b:[b,v],openness:g?this.coverOpenness.get(i.id)??null:1,linked:g}];for(const t of H){const[i,n]=t.a,[c,g]=t.b,p=Ke(i,n,c,g);if(p<=0)continue;const f=(i+c)/2,_=(n+g)/2,b=t.openness,v=t.linked,x=(e,t,o,r=!0)=>{const d=e*u,b=.25*p;s([[i,n],[c,g],[c+a*d+k*b,g+l*d+w*b],[i+a*d-k*b,n+l*d-w*b]],[f,_],[f+a*d,_+l*d],t,r?o*h:o,m)},M=Math.max(1.4*y,1.2*o);if(null===b||b<.05)continue;if(!e){x(Math.max(1.6*y,1.2*o),"#ffd54f",.2+.5*b);continue}const $=Wi(e.elevation);if($<1&&x(M,"#3949ab",.3*(1-$)*b),$<=0)continue;const S=this.sky?.clouds??0,C=Math.max(0,1-S/.85)**1.5,P=Ji(e.elevation,S),I=Ki(-a,-l,this.northDeg??0),H=Math.cos((e.azimuth-I)*Math.PI/180);x(Math.max(1.3*y,1*o),Xi(S),(.3+.15*S)*$*b*(.4+.6*Math.max(0,H)));const A=1-(r.shade??0);if(H>.04&&e.elevation>.5&&(1===L.length||v)&&C>.02&&A>.02){const[t,p]=qi(e.azimuth+180,this.northDeg??0),v=Math.min(7,Math.max(.6,(r.head_m??d)/Math.tan(e.elevation*(Math.PI/180))))*o*u;if(t*a+p*l>.05){const o=t*v,r=p*v,a=Math.min(1,Math.max(.35,1.8*Math.sin(e.elevation*(Math.PI/180))));s([[i,n],[c,g],[c+o,g+r],[i+o,n+r]],[f,_],[f+o,_+r],P,(.3+.45*a)*Math.min(1,1.6*H)*b*C*A*h,m)}}}}}return Z`<defs>${t}</defs>${i}`}_renderGarageDoors(){if(!this.showCovers)return K;const e=this.unitsPerCm,t=this.rooms.filter(e=>!1!==e.visible&&!e.outdoor&&e.points.length>=3);return this.openings.filter(e=>e.garage).map(i=>{const n=this._openingEndpoints(i);if(!n)return K;const[[o,r],[s,a]]=n,l=Ke(o,r,s,a);if(l<=0)return K;const c=(s-o)/l,d=(a-r)/l,h=(o+s)/2,u=(r+a)/2,g=Math.max(this._pxToUnits(8),15*e),p=[1,-1].find(e=>t.some(t=>Ye(h-d*e*g,u+c*e*g,t.points))),m=p??1,f=this.coverOpenness.has(i.id)?this.coverOpenness.get(i.id)??0:0,_=this.coverOpenness.has(i.id)&&null===this.coverOpenness.get(i.id),b=180*Math.atan2(d,c)/Math.PI,v=210*e,y=Math.max(8*e,this._pxToUnits(4)),k=Math.round(100*f),w=[h+d*m*this._pxToUnits(14),u-c*m*this._pxToUnits(14)];return Z`
          <g class="garage-door ${_?"unknown":""}" transform="translate(${o} ${r}) rotate(${b}) scale(1 ${m})">
            <rect class="garage-panel closed" x="0" y=${-y/2} width=${l} height=${y}
              style="opacity:${1-f}"></rect>
            <g class="garage-roll" style="transform: scaleY(${f})">
              <rect class="garage-panel open" x="0" y="0" width=${l} height=${v}></rect>
              ${Array.from({length:4},(e,t)=>{const i=(t+1)*v/5;return Z`<line class="garage-slat" x1="0" y1=${i} x2=${l} y2=${i}></line>`})}
            </g>
          </g>
          <text class="garage-label" x=${w[0]} y=${w[1]} style="font-size:${this._pxToUnits(10)}px">${_?"?":k>=98?"▲ open":k<=2?"▼ closed":`▲ ${k}%`}</text>
        `})}_renderCompass(){if(null===this.northDeg)return K;const e=this._sun();return N`<div
      class="compass"
      title=${He("compass.title",{dir:Gi(this.northDeg)})}
    >
      <svg
        viewBox="-20 -20 40 40"
        style="transform: rotate(${-this.northDeg}deg)"
      >
        <circle r="18" class="compass-ring"></circle>
        <polygon points="0,-15 5,2 0,-2 -5,2" class="compass-north"></polygon>
        <polygon points="0,15 5,2 0,-2 -5,2" class="compass-south"></polygon>
        <text
          y="-6"
          class="compass-n"
          transform="rotate(${this.northDeg} 0 -9)"
        >
          N
        </text>
      </svg>
      ${e?N`<span class="compass-sun"
              >${(e.elevation>0?He("compass.sun",{deg:Math.round(e.elevation),dir:Gi(e.azimuth)}):He("compass.night"))+(this.sky?` · ${He(`compass.weather.${this.sky.condition}`)}`:"")}</span
            >`:K}
    </div>`}_renderOverlayButtons(){if(!this.overlayButtons)return K;const e=(e,t,i)=>N`<button
        class=${t?"active":"off"}
        title=${He(`canvasControls.${e}`)}
        @click=${()=>this.dispatchEvent(new CustomEvent("overlay-toggle",{detail:{key:e}}))}
      >
        <ha-icon icon=${i}></ha-icon>
      </button>`;return N`
      ${e("furniture",this.showFurniture,"mdi:sofa-outline")}
      ${e("lights",this.showLights,"mdi:lightbulb-group-outline")}
      ${e("covers",this.showCovers,"mdi:blinds")}
    `}_renderScaleLine(){if(!this.scale)return K;if(!this.showScaleLine&&"scale"!==this.mode)return K;const[[e,t],[i,n]]=this.scale.points;return Z`
      <line class="scale-line" x1=${e} y1=${t} x2=${i} y2=${n}></line>
      <text class="scale-label" x=${(e+i)/2} y=${(t+n)/2-6}>
        ${gt(this.scale.meters,this.unitSystem)}
        ${ut(this.unitSystem)}
      </text>
    `}_renderPendingScale(){if(0===this._pendingScalePoints.length)return K;const e=this._pxToUnits(6),[t,i]=this._pendingScalePoints[0];return Z`<circle class="vertex-handle" cx=${t} cy=${i} r=${e}></circle>`}_renderBackgroundOverlay(){if(!this.backgroundImageUrl)return K;const{scale:e,offsetX:t,offsetY:i}=this._svgTransform(),n=t+e*(this.backgroundOffsetX-this._viewBox.x),o=i+e*(this.backgroundOffsetY-this._viewBox.y),r=e*this.backgroundScale,s=this.roomFillUnder&&this._knockout?.for===this.backgroundImageUrl?this._knockout.url:null,a=this.roomFillUnder?s?"knockout":"blend":"",l=s??this.backgroundImageUrl;return N`
      <div
        class="bg-overlay ${a}"
        style="transform: translate(${n}px, ${o}px) scale(${r});"
      >
        <img
          src=${l}
          style="width:${kn}px; height:${this._naturalHeight}px; opacity:${this.backgroundOpacity};"
        />
      </div>
    `}_renderAlignOverlay(){if(!this.alignOverlay)return K;const{scale:e,offsetX:t,offsetY:i}=this._svgTransform(),n=t+e*(this.alignOverlay.offsetX-this._viewBox.x),o=i+e*(this.alignOverlay.offsetY-this._viewBox.y),r=e*this.alignOverlay.scale;return N`
      <div
        class="bg-overlay"
        style="transform: translate(${n}px, ${o}px) scale(${r});"
      >
        <img
          src=${this.alignOverlay.imageUrl}
          style="width:${kn}px; height:${this._alignNaturalHeight}px; opacity:${this.alignOverlay.opacity};"
        />
      </div>
    `}_renderScaleBar(){if(!this.scale)return N`<div class="scale-corner">
        <button
          class="scale-chip floating-panel"
          title=${He("canvas.calibrateHint")}
          @click=${()=>this.dispatchEvent(new CustomEvent("calibrate-scale-click",{bubbles:!0,composed:!0}))}
        >
          <ha-icon icon="mdi:ruler"></ha-icon>
          ${He("canvas.notCalibrated")}
        </button>
      </div>`;const[[e,t],[i,n]]=this.scale.points,o=(Math.hypot(i-e,n-t)||1)/this.scale.meters,r="imperial"===this.unitSystem,s=this._svgTransform().scale*o*(r?.3048:1),a=r?[1,2,5,10,20,50,100,200,500]:[.1,.2,.5,1,2,5,10,20,50,100,200,500];let l=a[0];for(const e of a){if(!(e*s<=130))break;l=e}const c=Math.max(8,Math.round(l*s));return N`<div class="scale-corner">
      <div class="scale-bar floating-panel">
        <span>${l} ${ut(this.unitSystem)}</span>
        <span class="scale-bar-line" style="width:${c}px"></span>
      </div>
    </div>`}render(){const e=this._viewBox;return N`
      ${this.roomFillUnder&&this.backgroundImageUrl?Z`<svg class="fill-under" viewBox="${e.x} ${e.y} ${e.w} ${e.h}">
              ${this.rooms.map(e=>this._renderRoomFill(e))}
            </svg>`:K}
      ${this._renderBackgroundOverlay()} ${this._renderAlignOverlay()}
      ${Z`
        <svg
          viewBox="${e.x} ${e.y} ${e.w} ${e.h}"
          class="plan ${"pan"===this.mode||"align"===this.mode?"pan-mode":"select"!==this.mode?"draw-mode":""}"
          @wheel=${this._onWheel}
          @pointerdown=${this._onPointerDown}
          @pointermove=${this._onPointerMove}
          @pointerup=${this._onPointerUp}
          @pointercancel=${this._onPointerUp}
          @pointerleave=${this._onPointerLeave}
        >
          ${this.rooms.map(e=>this._renderRoom(e))}
          ${this._renderDaylight()}
          ${this.showFurniture?this.furniture.map(e=>this._renderFurniture(e)):K}
          ${this.walls.map(e=>this._renderWall(e))}
          ${this.openings.map(e=>this._renderOpening(e))}
          ${this._renderGarageDoors()}
          ${this._renderFurnitureGuides()} ${this._renderFurnitureHandles()}
          ${this._renderCornerBadges()}
          ${this.meshLinks.map(e=>this._renderMeshLink(e))}
          ${this.meshStubs.map(e=>this._renderMeshStubLine(e))}
          ${this._renderMeshStubMarkers()}
          ${this._renderRoomMoveGuides()}
          ${"trace"===this.mode||"wall"===this.mode||this._drawingFreeform?this._renderPendingTrace():K}
          ${this._renderScaleLine()}
          ${"scale"===this.mode?this._renderPendingScale():K}
          ${this._pinGroups().map(e=>this._renderPinGroup(e))}
          ${"furniture"===this.mode?this._renderFurnitureGhost():K}
        </svg>
      `}
      ${this._renderScaleBar()} ${this._renderCompass()}
      <div class="controls">
        ${this._renderOverlayButtons()}
        <button
          @click=${()=>this._zoomButton(.8)}
          title=${He("canvasControls.zoomIn")}
        >
          <ha-icon icon="mdi:plus"></ha-icon>
        </button>
        <button
          @click=${()=>this._zoomButton(1.25)}
          title=${He("canvasControls.zoomOut")}
        >
          <ha-icon icon="mdi:minus"></ha-icon>
        </button>
        <button
          @click=${()=>this.fitToScreen()}
          title=${He("canvasControls.fit")}
        >
          <ha-icon icon="mdi:fit-to-screen-outline"></ha-icon>
        </button>
      </div>
    `}};Pn.styles=[yt,Vt,a`
      :host {
        display: block;
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        /* A step off the cards' colour, so the floating panels stand out:
         * light grey by day (the plan image stays white, like paper on a
         * desk), a lighter grey than the cards by night (see [dark]). */
        background: color-mix(in srgb, var(--sc-bg) 94%, black);
        user-select: none;
        -webkit-user-select: none;
      }
      svg {
        position: relative;
        width: 100%;
        height: 100%;
        touch-action: none;
        display: block;
        cursor: grab;
      }
      /* Dedicated Pan tool (Innerspace-style, separate from Select) — every
       * drag pans unconditionally (see _hitTest's mode !== "select" early
       * return), so every element shows the pan cursor too, not its own
       * pointer/ew-resize/copy hint. */
      svg.pan-mode * {
        cursor: grab !important;
      }
      /* Every non-select, non-pan mode (trace room/wall, add door/window,
       * set scale, place device) is a pure "click here to do the thing"
       * mode — _hitTest's mode !== select early return means none of
       * these ever select/drag an existing element, so none of them should
       * show the select-mode pointer/hand either. Both the svg root itself
       * (blank canvas) and its children need the override — the base
       * svg cursor:grab rule above only applies to the root element, so a
       * bare descendant selector would miss it. */
      svg.draw-mode,
      svg.draw-mode * {
        cursor: crosshair !important;
      }
      .bg-overlay {
        position: absolute;
        top: 0;
        left: 0;
        transform-origin: 0 0;
        pointer-events: none;
      }
      .bg-overlay img {
        display: block;
        background: white;
      }
      /* Room fills under the background: an SVG layer beneath the image,
       * which multiplies over it so its white shows the colour and its
       * lines stay on top (screen in dark mode, where the image is
       * inverted). */
      .fill-under {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }
      .bg-overlay.blend {
        mix-blend-mode: multiply;
      }
      .bg-overlay.knockout img {
        background: transparent;
      }
      :host([dark]) .bg-overlay.blend {
        mix-blend-mode: screen;
      }
      /* Dark HA theme: the canvas takes the theme's own background and the
       * (usually white) plan image is inverted into light lines on dark —
       * hue-rotate(180deg) keeps any colour in the plan close to its
       * original hue. The Background menu's opacity still applies. */
      :host([dark]) {
        /* A step lighter than the cards, so the floating toolbar and panels
         * (card colour) stand out from the canvas. */
        background: color-mix(in srgb, var(--sc-bg) 88%, white);
      }
      :host([dark]) .bg-overlay img {
        filter: invert(1) hue-rotate(180deg);
      }
      /* Door/window jambs were drawn dark-on-white. */
      :host([dark]) .opening-jamb-case {
        stroke: color-mix(in srgb, var(--sc-bg) 88%, white);
      }
      :host([dark]) .opening-jamb {
        stroke: var(--sc-fg);
      }
      .mesh-link {
        stroke-width: 2;
        opacity: 0.85;
        cursor: pointer;
      }
      .mesh-link.selected {
        stroke-width: 4;
        opacity: 1;
      }
      /* With one link selected, the rest recede, like hovering a node in
       * HA's own network visualisation. */
      .mesh-link.dim {
        opacity: 0.2;
      }
      .mesh-stub-line {
        stroke-width: 2;
        stroke-dasharray: 6 4;
        opacity: 0.85;
        cursor: pointer;
      }
      .mesh-stub-line.selected {
        stroke-width: 4;
        opacity: 1;
      }
      .mesh-stub-label {
        fill: var(--sc-fg-secondary);
        font-size: 12px;
        text-anchor: middle;
        pointer-events: none;
        paint-order: stroke;
        stroke: var(--sc-bg);
        stroke-width: 3px;
      }
      .room-ghost {
        fill: none;
        stroke: var(--sc-fg-secondary);
        stroke-width: 2;
        stroke-dasharray: 6 4;
        opacity: 0.7;
        pointer-events: none;
      }
      /* A selected room can be dragged whole (see the "roomMove" gesture). */
      svg:not(.pan-mode):not(.draw-mode) .room-poly.selected {
        cursor: move;
      }
      .room-poly {
        /* fill/fill-opacity/stroke/stroke-opacity/stroke-width are set
         * inline per-render from the room's own style fields (see
         * _renderRoom), each falling back to DEFAULT_ROOM_* when unset —
         * not fixed here, since a plain class can't vary per room. */
        cursor: pointer;
      }
      .room-label {
        fill: var(--sc-fg);
        font-size: 16px;
        text-anchor: middle;
        pointer-events: none;
        paint-order: stroke;
        stroke: var(--sc-bg);
        stroke-width: 3px;
      }
      .pending-trace {
        fill: none;
        stroke: var(--sc-accent);
        stroke-width: 2;
        stroke-dasharray: 6 4;
      }
      .wall-line {
        fill: none;
        cursor: pointer;
      }
      .wall-line.selected {
        stroke: var(--sc-danger) !important;
      }
      .opening-line {
        /* Width is set inline per-opening from its own wall's real
         * thickness (see _renderOpening/_wallStrokeWidth) — matches the
         * wall it's drawn on instead of one fixed width for every door
         * and window regardless of what wall they're set into. */
        cursor: pointer;
      }
      .opening-line.door {
        stroke: #d7ccc8;
      }
      .opening-line.window {
        stroke: #81d4fa;
      }
      .opening-transom {
        stroke: #29b6f6;
        stroke-width: 2.5px;
        vector-effect: non-scaling-stroke;
        stroke-linecap: round;
        pointer-events: none;
      }
      .opening-transom.selected {
        stroke: var(--sc-danger);
      }
      .opening-hit {
        stroke: transparent;
        cursor: pointer;
      }
      .opening-line.selected {
        stroke: var(--sc-danger);
      }
      .opening-handle {
        fill: white;
        stroke: var(--sc-danger);
        stroke-width: 2;
        cursor: ew-resize;
      }
      .opening-jamb-case {
        stroke: #ffffff;
        stroke-width: 3.4;
        pointer-events: none;
      }
      .opening-jamb {
        stroke: #212121;
        stroke-width: 1.6;
        pointer-events: none;
      }
      .pending-scale,
      .scale-line {
        stroke: #43a047;
        stroke-width: 2;
        stroke-dasharray: 4 3;
      }
      .scale-label {
        fill: #43a047;
        font-size: 14px;
        text-anchor: middle;
        paint-order: stroke;
        stroke: var(--sc-bg);
        stroke-width: 3px;
      }
      .vertex-handle {
        fill: white;
        stroke: var(--sc-accent);
        stroke-width: 2;
        cursor: pointer;
      }
      .vertex-handle.selected {
        fill: var(--sc-danger);
      }
      .hover-snap-line {
        fill: none;
        stroke: var(--sc-accent);
        stroke-width: 2;
        stroke-dasharray: 6 4;
        opacity: 0.6;
        pointer-events: none;
      }
      .hover-snap-line.closing {
        stroke: #2e7d32;
        stroke-dasharray: none;
        opacity: 1;
      }
      .hover-snap-marker {
        fill: white;
        stroke: var(--sc-accent);
        stroke-width: 2;
        opacity: 0.6;
        pointer-events: none;
      }
      .hover-snap-marker.on-geometry {
        fill: var(--sc-accent);
        opacity: 1;
      }
      /* A distinct hue from the app's own accent blue — a dedicated
       * "alignment guide" color (the same convention design tools like
       * Figma use) so it never gets confused with a geometry snap. */
      .hover-snap-marker.on-axis {
        fill: #e91e63;
        stroke: #e91e63;
        opacity: 1;
      }
      .axis-guide {
        stroke: #e91e63;
        stroke-width: 1;
        opacity: 0.8;
        pointer-events: none;
      }
      .vertex-handle.closing {
        fill: #2e7d32;
        stroke: #2e7d32;
      }
      .vertex-delete {
        fill: var(--sc-danger);
        cursor: pointer;
      }
      .vertex-delete-x {
        stroke: white;
        stroke-width: 1.5;
        pointer-events: none;
      }
      .midpoint-handle {
        fill: var(--sc-accent);
        opacity: 0.5;
        cursor: copy;
      }
      ${kt}
      ${Lt}
      ${s(Ci)}
      .furniture {
        --fx-color: #2f343a;
        cursor: pointer;
      }
      :host([dark]) .furniture {
        --fx-color: #d5dae0;
      }
      .furniture.linked {
        cursor: pointer;
      }
      .item-glow {
        pointer-events: none;
      }
      .furniture.ghost {
        opacity: 0.55;
        pointer-events: none;
      }
      .furniture-outline {
        fill: none;
        stroke: var(--sc-accent);
        stroke-width: 1.5px;
        stroke-dasharray: 5 4;
        vector-effect: non-scaling-stroke;
        pointer-events: none;
      }
      .furniture-handle {
        fill: var(--sc-panel-bg, white);
        stroke: var(--sc-accent);
        stroke-width: 2px;
        vector-effect: non-scaling-stroke;
      }
      .furniture-handle.rotate {
        cursor: grab;
      }
      .furniture-handle.corner {
        cursor: nwse-resize;
      }
      .corner-badge {
        pointer-events: none;
      }
      .corner-badge circle {
        fill: var(--sc-accent);
        opacity: 0.9;
      }
      .corner-badge text {
        fill: white;
        font-weight: 700;
        text-anchor: middle;
      }
      .furniture-handle.corner-nesw {
        cursor: nesw-resize;
      }
      .furniture-handle.edge-ew {
        cursor: ew-resize;
      }
      .furniture-handle.edge-ns {
        cursor: ns-resize;
      }
      .furniture-handle.move {
        cursor: move;
      }
      .furniture-move-arrows {
        fill: none;
        stroke: var(--sc-accent);
        stroke-width: 1.5px;
        stroke-linecap: round;
        vector-effect: non-scaling-stroke;
        pointer-events: none;
      }
      .smart-guide {
        stroke: #ff4081;
        stroke-width: 1px;
        stroke-dasharray: 4 3;
        vector-effect: non-scaling-stroke;
        pointer-events: none;
      }
      .furniture-label {
        fill: var(--sc-fg);
        text-anchor: middle;
        dominant-baseline: central;
        pointer-events: none;
        paint-order: stroke;
        stroke: var(--sc-bg);
        stroke-width: 3px;
      }
      .room-lights {
        font-size: 0.75em;
        fill: var(--sc-fg-secondary);
      }
      .cover-patch {
        pointer-events: none;
      }
      .garage-door {
        pointer-events: none;
      }
      .garage-panel {
        fill: color-mix(in srgb, var(--sc-fg) 12%, transparent);
        stroke: var(--sc-fg);
        stroke-width: 1.5px;
        vector-effect: non-scaling-stroke;
        transition: opacity 1.2s ease;
      }
      .garage-panel.open {
        fill: color-mix(in srgb, var(--sc-fg) 6%, transparent);
        stroke-dasharray: 5 4;
      }
      .garage-roll {
        transform-origin: 0 0;
        transition: transform 1.2s ease;
      }
      .garage-slat {
        stroke: var(--sc-fg);
        stroke-width: 1px;
        stroke-dasharray: 3 3;
        vector-effect: non-scaling-stroke;
        opacity: 0.6;
      }
      .garage-door.unknown .garage-panel {
        stroke: var(--sc-fg-secondary);
      }
      .garage-label {
        fill: var(--sc-fg-secondary);
        text-anchor: middle;
        dominant-baseline: central;
        paint-order: stroke;
        stroke: var(--sc-bg);
        stroke-width: 3px;
        pointer-events: none;
      }
      .compass {
        position: absolute;
        left: 12px;
        bottom: calc(64px + env(safe-area-inset-bottom, 0px));
        display: flex;
        align-items: center;
        gap: 6px;
        pointer-events: auto;
      }
      .compass svg {
        width: 44px;
        height: 44px;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
      }
      .compass-ring {
        fill: var(--sc-panel-bg);
        stroke: var(--sc-divider);
      }
      .compass-north {
        fill: var(--sc-danger);
      }
      .compass-south {
        fill: var(--sc-fg-secondary);
      }
      .compass-n {
        font-size: 9px;
        font-weight: 600;
        text-anchor: middle;
        fill: var(--sc-fg);
      }
      .compass-sun {
        padding: 2px 8px;
        border-radius: 10px;
        background: var(--sc-panel-bg);
        color: var(--sc-fg-secondary);
        font-size: 11px;
        box-shadow: var(--sc-panel-shadow);
      }
      .controls button.active {
        color: var(--sc-accent);
      }
      .controls button.off {
        color: var(--sc-fg-secondary);
        opacity: 0.6;
      }
    `],e([me({type:Boolean,reflect:!0})],Pn.prototype,"dark",void 0),e([me({attribute:!1})],Pn.prototype,"rooms",void 0),e([me({attribute:!1})],Pn.prototype,"pins",void 0),e([me({attribute:!1})],Pn.prototype,"walls",void 0),e([me({attribute:!1})],Pn.prototype,"openings",void 0),e([me({attribute:!1})],Pn.prototype,"scale",void 0),e([me({attribute:!1})],Pn.prototype,"unitSystem",void 0),e([me({attribute:!1})],Pn.prototype,"meshLinks",void 0),e([me({attribute:!1})],Pn.prototype,"meshStubs",void 0),e([me({attribute:!1})],Pn.prototype,"entityLookup",void 0),e([me({attribute:!1})],Pn.prototype,"backgroundImageUrl",void 0),e([me({type:Number})],Pn.prototype,"backgroundOpacity",void 0),e([me({type:Number})],Pn.prototype,"backgroundOffsetX",void 0),e([me({type:Number})],Pn.prototype,"backgroundOffsetY",void 0),e([me({type:Number})],Pn.prototype,"backgroundScale",void 0),e([me({attribute:!1})],Pn.prototype,"alignOverlay",void 0),e([me({attribute:!1})],Pn.prototype,"initialViewBox",void 0),e([me({type:Boolean})],Pn.prototype,"sameBuildingAsPrevious",void 0),e([me({attribute:!1})],Pn.prototype,"mode",void 0),e([me({attribute:!1})],Pn.prototype,"snapMode",void 0),e([me({attribute:!1})],Pn.prototype,"armedEntityId",void 0),e([me({attribute:!1})],Pn.prototype,"armedOpeningType",void 0),e([me({attribute:!1})],Pn.prototype,"selectedRoomId",void 0),e([me({attribute:!1})],Pn.prototype,"editingRoomId",void 0),e([me({attribute:!1})],Pn.prototype,"editingWallId",void 0),e([me({attribute:!1})],Pn.prototype,"selectedPinId",void 0),e([me({attribute:!1})],Pn.prototype,"selectedWallId",void 0),e([me({attribute:!1})],Pn.prototype,"selectedOpeningId",void 0),e([me({attribute:!1})],Pn.prototype,"furniture",void 0),e([me({attribute:!1})],Pn.prototype,"selectedFurnitureId",void 0),e([me({attribute:!1})],Pn.prototype,"armedFurnitureKind",void 0),e([me({type:Number})],Pn.prototype,"armedFurnitureRotation",void 0),e([me({attribute:!1})],Pn.prototype,"roomLights",void 0),e([me({attribute:!1})],Pn.prototype,"coverOpenness",void 0),e([me({attribute:!1})],Pn.prototype,"pinColors",void 0),e([me({attribute:!1})],Pn.prototype,"itemStates",void 0),e([me({type:Boolean})],Pn.prototype,"showFurniture",void 0),e([me({type:Boolean})],Pn.prototype,"showLights",void 0),e([me({type:Boolean})],Pn.prototype,"showCovers",void 0),e([me({type:Boolean})],Pn.prototype,"showLightCount",void 0),e([me({attribute:!1})],Pn.prototype,"roomBorder",void 0),e([me({attribute:!1})],Pn.prototype,"roomLabelStyle",void 0),e([me({type:Boolean})],Pn.prototype,"roomFillUnder",void 0),e([me({attribute:!1})],Pn.prototype,"customIcons",void 0),e([me({type:Boolean})],Pn.prototype,"autoFit",void 0),e([me({type:Boolean})],Pn.prototype,"showScaleLine",void 0),e([me({attribute:!1})],Pn.prototype,"northDeg",void 0),e([me({attribute:!1})],Pn.prototype,"location",void 0),e([me({attribute:!1})],Pn.prototype,"sky",void 0),e([me({attribute:!1})],Pn.prototype,"sunTime",void 0),e([me({type:Boolean})],Pn.prototype,"overlayButtons",void 0),e([me({type:Boolean})],Pn.prototype,"readOnly",void 0),e([me({attribute:!1})],Pn.prototype,"selectedMeshLinkKey",void 0),e([me({attribute:!1})],Pn.prototype,"selectedMeshStubKey",void 0),e([fe()],Pn.prototype,"_viewBox",void 0),e([fe()],Pn.prototype,"_naturalHeight",void 0),e([fe()],Pn.prototype,"_alignNaturalHeight",void 0),e([fe()],Pn.prototype,"_pendingTrace",void 0),e([fe()],Pn.prototype,"_hoverSnap",void 0),e([fe()],Pn.prototype,"_pendingScalePoints",void 0),e([fe()],Pn.prototype,"_liveEditPoints",void 0),e([fe()],Pn.prototype,"_liveRoomMove",void 0),e([fe()],Pn.prototype,"_roomMoveGuides",void 0),e([fe()],Pn.prototype,"_liveDragPin",void 0),e([fe()],Pn.prototype,"_liveOpeningEdit",void 0),e([fe()],Pn.prototype,"_selectedVertexIndex",void 0),e([fe()],Pn.prototype,"_liveFurniture",void 0),e([fe()],Pn.prototype,"_furnitureGuides",void 0),e([fe()],Pn.prototype,"_now",void 0),e([fe()],Pn.prototype,"_hoverImage",void 0),e([fe()],Pn.prototype,"_knockout",void 0),e([fe()],Pn.prototype,"_drawBox",void 0),e([_e("svg.plan")],Pn.prototype,"_svg",void 0),e([fe()],Pn.prototype,"_liveRoomLabel",void 0),Pn=e([be("floorplan-canvas")],Pn);const In={room:"room",rooms:"room",space:"room",spaces:"room",wall:"wall",walls:"wall",ext:"wall",int:"wall",exterior:"wall",interior:"wall",door:"door",doors:"door",window:"window",windows:"window",win:"window",fixture:"ignore",fixtures:"ignore",fx:"ignore",furniture:"ignore",label:"ignore",labels:"ignore",dim:"ignore",dims:"ignore",dimension:"ignore",dimensions:"ignore",rail:"ignore",rails:"ignore",railing:"ignore",railings:"ignore",annotation:"ignore",annotations:"ignore"},Hn=new Set(["ext","exterior","outer","outside"]),An=new Set(["defs","metadata","title","desc","style","script","symbol","clipPath","mask","pattern","marker","linearGradient","radialGradient","filter","foreignObject"]),Vn=new Set(["g","svg","a","switch"]),Fn="http://www.inkscape.org/namespaces/inkscape";function Tn(e){const t=(new DOMParser).parseFromString(e,"image/svg+xml"),i=t.documentElement;if("svg"!==i.localName||t.getElementsByTagName("parsererror").length>0)throw new Error("Not a valid SVG file");const n=function(e){const t=e.getAttribute("viewBox");if(t){const[e,i,n,o]=t.trim().split(/[\s,]+/).map(Number);if([e,i,n,o].every(e=>void 0!==e&&Number.isFinite(e))&&n>0&&o>0)return{x:e,y:i,w:n,h:o}}const i=parseFloat(e.getAttribute("width")??""),n=parseFloat(e.getAttribute("height")??""),o=/%/.test(`${e.getAttribute("width")}${e.getAttribute("height")}`);if(!o&&i>0&&n>0)return{x:0,y:0,w:i,h:n};throw new Error("The SVG needs a viewBox (or a fixed width and height)")}(i);let o=i,r=null;"undefined"!=typeof document&&document.body&&(r=document.createElement("div"),r.style.cssText="position:fixed;left:-100000px;top:0;width:1px;height:1px;overflow:hidden;visibility:hidden;pointer-events:none",o=document.importNode(i,!0),r.appendChild(o),document.body.appendChild(r));const s={viewBox:n,drawingUnit:1,rooms:[],walls:[],openings:[]},a=[],l=[];try{!function e(t,i,n,o){for(const r of Array.from(t.children)){const t=r.localName;if(An.has(t)||En(r))continue;const d=qn(i,Xn(r.getAttribute("transform"))),h=Rn(r),u=Bn(h),g=u??n,p=o||h.some(e=>Hn.has(e));if("text"===t){const e=r.textContent?.replace(/\s+/g," ").trim();if(e){const t=parseFloat(jn(r.getAttribute("x"))),i=parseFloat(jn(r.getAttribute("y")));a.push({text:e,at:Yn(d,[t||0,i||0])})}continue}if(Vn.has(t)){if(!("door"!==u&&"window"!==u||h.some(e=>"doors"===e||"windows"===e)||Array.from(r.children).some(e=>{const t=Bn(Rn(e));return"door"===t||"window"===t}))){const e=c(r,d);e.length>=2&&s.openings.push({type:u,points:e});continue}e(r,d,g,p);continue}if(!g||"ignore"===g)continue;const m=Wn(r).map(e=>({closed:e.closed,points:e.points.map(e=>Yn(d,e))}));if(0===m.length)continue;const f=Qn(d);if("room"===g)for(const e of m)!e.closed||e.points.length<3||(s.rooms.push({name:On(r),id:r.getAttribute("id"),points:e.points}),l.push(f));else if("wall"===g){const e=Dn(r);for(const t of m){const i=t.closed?[...t.points,t.points[0]]:t.points;i.length<2||(s.walls.push({points:i,strokeWidth:null===e?null:e*f,exterior:p}),l.push(f))}}else{const e=m.flatMap(e=>e.points);e.length>=2&&s.openings.push({type:g,points:e})}}}(o,Kn,null,!1)}finally{r?.remove()}return s.rooms.forEach((e,t)=>{if(e.name)return;const i=a.find(t=>Ye(t.at[0],t.at[1],e.points));e.name=i?.text??`Room ${t+1}`}),l.length>0&&(l.sort((e,t)=>e-t),s.drawingUnit=l[Math.floor(l.length/2)]),s;function c(e,t){const i=[];for(const n of Array.from(e.children)){if(An.has(n.localName)||En(n))continue;const e=qn(t,Xn(n.getAttribute("transform")));if(Vn.has(n.localName))i.push(...c(n,e));else for(const t of Wn(n))i.push(...t.points.map(t=>Yn(e,t)))}return i}}function Rn(e){return[e.getAttribute("id"),e.getAttribute("class"),e.getAttributeNS(Fn,"label")??e.getAttribute("inkscape:label"),e.getAttribute("data-type")].flatMap(e=>(e??"").toLowerCase().split(/[^a-z0-9]+/)).filter(Boolean)}function Bn(e){for(const t of e){const e=In[t];if(e)return e}return null}function En(e){return"none"===e.getAttribute("display")||("hidden"===e.getAttribute("visibility")||(!!/display\s*:\s*none/i.test(e.getAttribute("style")??"")||!(!e.isConnected||"function"!=typeof getComputedStyle)&&"none"===getComputedStyle(e).display))}function Dn(e){if(e.isConnected&&"function"==typeof getComputedStyle){const t=parseFloat(getComputedStyle(e).strokeWidth);if(Number.isFinite(t)&&t>0)return t}const t=/stroke-width\s*:\s*([\d.eE+-]+)/.exec(e.getAttribute("style")??"")?.[1],i=parseFloat(t??e.getAttribute("stroke-width")??"");return Number.isFinite(i)&&i>0?i:null}const zn=/^(path|rect|polygon|polyline|line|g|layer|shape|svg)[-_]?\d+$/i;function On(e){const t=Array.from(e.children).find(e=>"title"===e.localName),i=t?.textContent?.trim();if(i)return i;const n=e.getAttributeNS(Fn,"label")??e.getAttribute("inkscape:label")??e.getAttribute("aria-label");if(n?.trim())return n.trim();const o=e.getAttribute("id");return o&&!zn.test(o)?function(e){return e.replace(/[_-]+/g," ").trim().replace(/\b\w/g,e=>e.toUpperCase())}(o):""}function jn(e){return(e??"").trim().split(/[\s,]+/)[0]??""}function Un(e,t){const i=parseFloat(e.getAttribute(t)??"");return Number.isFinite(i)?i:0}function Wn(e){switch(e.localName){case"rect":{const t=Un(e,"x"),i=Un(e,"y"),n=Un(e,"width"),o=Un(e,"height");if(n<=0||o<=0)return[];return[{points:[[t,i],[t+n,i],[t+n,i+o],[t,i+o]],closed:!0}]}case"line":return[{points:[[Un(e,"x1"),Un(e,"y1")],[Un(e,"x2"),Un(e,"y2")]],closed:!1}];case"polygon":case"polyline":{const t=Zn(function(e){const t=(e??"").trim().split(/[\s,]+/).filter(Boolean).map(Number),i=[];for(let e=0;e+1<t.length;e+=2)Number.isFinite(t[e])&&Number.isFinite(t[e+1])&&i.push([t[e],t[e+1]]);return i}(e.getAttribute("points")));return t.length<2?[]:[{...Gn(t),..."polygon"===e.localName?{closed:!0}:{}}]}case"path":return function(e){const t=[];let i=0,n="",o=[0,0],r=[0,0],s=null;const a=()=>{for(;i<e.length&&/[\s,]/.test(e[i]);)i++},l=()=>{a();const t=/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/.exec(e.slice(i));return t?(i+=t[0].length,Number(t[0])):NaN},c=()=>{a();const t=e[i];return"0"!==t&&"1"!==t?NaN:(i++,Number(t))},d=e=>{if(s&&s.length>1){const i=Zn(s);t.push(e?{points:i,closed:e}:Gn(i))}s=null},h=e=>{s||(s=[o]),s.push(e),o=e};for(;i<e.length&&(a(),!(i>=e.length));){if(/[a-zA-Z]/.test(e[i]))n=e[i++];else if(!n)break;const t=n===n.toLowerCase(),a=(e,i)=>t?[o[0]+e,o[1]+i]:[e,i],u=i;switch(n.toUpperCase()){case"M":{const e=l(),i=l();if(Number.isNaN(i))break;d(!1),o=r=a(e,i),s=[o],n=t?"l":"L";break}case"L":{const e=l(),t=l();Number.isNaN(t)||h(a(e,t));break}case"H":{const e=l();Number.isNaN(e)||h([t?o[0]+e:e,o[1]]);break}case"V":{const e=l();Number.isNaN(e)||h([o[0],t?o[1]+e:e]);break}case"C":case"S":case"Q":case"T":{const e={C:3,S:2,Q:2,T:1}[n.toUpperCase()];let t=NaN,i=NaN;for(let n=0;n<e;n++)t=l(),i=l();Number.isNaN(i)||h(a(t,i));break}case"A":{l(),l(),l(),c(),c();const e=l(),t=l();Number.isNaN(t)||h(a(e,t));break}case"Z":d(!0),o=r,n="";continue;default:i=e.length}if(i===u)break}return d(!1),t}(e.getAttribute("d")??"");default:return[]}}function Nn(e,t){return Math.abs(e[0]-t[0])<1e-9&&Math.abs(e[1]-t[1])<1e-9}function Zn(e){return e.filter((t,i)=>0===i||!Nn(t,e[i-1]))}function Gn(e){return e.length>2&&Nn(e[0],e[e.length-1])?{points:e.slice(0,-1),closed:!0}:{points:e,closed:!1}}const Kn=[1,0,0,1,0,0];function qn(e,t){return[e[0]*t[0]+e[2]*t[1],e[1]*t[0]+e[3]*t[1],e[0]*t[2]+e[2]*t[3],e[1]*t[2]+e[3]*t[3],e[0]*t[4]+e[2]*t[5]+e[4],e[1]*t[4]+e[3]*t[5]+e[5]]}function Yn(e,[t,i]){return[e[0]*t+e[2]*i+e[4],e[1]*t+e[3]*i+e[5]]}function Qn(e){return Math.sqrt(Math.abs(e[0]*e[3]-e[1]*e[2]))||1}function Xn(e){let t=Kn;const i=/(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)/g;for(const n of(e??"").matchAll(i)){const e=n[2].trim().split(/[\s,]+/).filter(Boolean).map(Number),[i=0,o,r]=e;let s=Kn;switch(n[1]){case"matrix":6===e.length&&(s=e);break;case"translate":s=[1,0,0,1,i,o??0];break;case"scale":s=[i,0,0,o??i,0,0];break;case"rotate":{const e=i*Math.PI/180,t=Math.cos(e),n=Math.sin(e),a=o??0,l=r??0;s=[t,n,-n,t,a-t*a+n*l,l-n*a-t*l];break}case"skewX":s=[1,0,Math.tan(i*Math.PI/180),1,0,0];break;case"skewY":s=[1,Math.tan(i*Math.PI/180),0,1,0,0]}t=qn(t,s)}return t}function Jn(e){return e.toLowerCase().replace(/[^a-z0-9]+/g," ").trim()}function eo(e,t,i){let n=null;const o=t.filter((e,i)=>t.findIndex(t=>Nn(e,t))===i);for(const t of e)if(!t.mergedInto)for(let e=0;e+1<t.points.length;e++){const r=t.points[e],s=t.points[e+1],a=Math.hypot(s[0]-r[0],s[1]-r[1]);if(a<i)continue;const l=[(s[0]-r[0])/a,(s[1]-r[1])/a],c=[];for(const e of o){const t=e[0]-r[0],n=e[1]-r[1];Math.abs(t*l[1]-n*l[0])<=i&&c.push(t*l[0]+n*l[1])}if(c.length<2)continue;const d=Math.min(...c),h=Math.max(...c);if(h-d<i)continue;const u=d>=-i&&h<=a+i;if(!u&&!(d<=a+i&&h>=-i))continue;(!n||u&&!n.contained||u===n.contained&&c.length>n.count)&&(n={wall:t,origin:r,dir:l,span:[d,h],contained:u,count:c.length})}return n}function to(e,t,i){const n=[...e.rooms.flatMap(e=>e.points),...e.walls.flatMap(e=>e.points)];if(n.length<2)return null;const o=n.map(e=>e[0]),r=n.map(e=>e[1]),s=Math.min(...o),a=Math.max(...o),l=Math.min(...r),c=Math.max(...r),d=a-s>=c-l,h=d?a-s:c-l;if(h<=0)return null;const u=d?[a,l]:[s,c];return{points:[t([s,l]),t(u)],meters:h/e.drawingUnit*i}}const io=85.0511287798;function no(e,t,i){const n=512*2**i,o=e/n*360-180,r=Math.PI-2*Math.PI*t/n;return{lat:180*Math.atan(Math.sinh(r))/Math.PI,lon:o}}function oo(e,t){const i=t*Math.PI/180,n=Math.cos(i),o=Math.sin(i);return{x:n*e.x-o*e.y,y:o*e.x+n*e.y}}function ro(e){const t=((e+180)%360+360)%360-180;return-180===t?180:t}const so=e=>e.rotation_deg??0;function ao(e){return function(e,t,i){const n=512*2**i,o=Math.max(-io,Math.min(io,e))*Math.PI/180;return{x:(t+180)/360*n,y:(.5-Math.log(Math.tan(Math.PI/4+o/2))/(2*Math.PI))*n}}(e.lat,e.lon,e.zoom)}function lo(e,t,i,n,o){const{lat:r,lon:s}=no(t,i,n);return{...e,lat:r,lon:s,zoom:n,rotation_deg:ro(o)}}function co(e,t,i){const n=ao(e),o=oo({x:t,y:i},so(e));return lo(e,n.x-o.x,n.y-o.y,e.zoom,so(e))}function ho(e,t,i){const n=Math.min(21,Math.max(3,e.zoom+Math.log2(t))),o=2**(n-e.zoom),r=so(e),s=ao(e),a=oo(i,r);return lo(e,o*(s.x+a.x)-a.x,o*(s.y+a.y)-a.y,n,r)}function uo(e,t,i){const n=ao(e),o=oo(i,so(e)),r=oo(i,t);return lo(e,n.x+o.x-r.x,n.y+o.y-r.y,e.zoom,t)}const go=[[-1,-1],[1,-1],[1,1],[-1,1]];let po=class extends he{constructor(){super(...arguments),this.placements=[],this.ghosts=new Map,this.floorNameById=new Map,this.floorIconById=new Map,this.backgroundImageUrl=null,this.backgroundOpacity=.85,this.backgroundOffsetX=0,this.backgroundOffsetY=0,this.backgroundScale=1,this.mode="select",this.selectedPlacementId=null,this.pins=[],this.selectedPinId=null,this.entityLookup=new Map,this.meshLinks=[],this.selectedMeshLinkKey=null,this.initialViewBox=null,this.mapBackground=null,this.dark=!1,this._mapError=null,this._mapStarting=!1,this._mapSize="",this._viewBox={x:0,y:0,w:kn,h:750},this._naturalHeight=750,this._pointers=new Map,this._downHit=null,this._downClient=null,this._lastClient=null,this._gesture=null,this._moved=!1,this._pinIcons=new Ft(this),this._gestureCancelled=!1,this._hasFittedOnce=!1,this._onPointerDown=e=>{if("mouse"!==e.pointerType||0===e.button){if(ct(this),this._svg.setPointerCapture(e.pointerId),this._pointers.set(e.pointerId,{x:e.clientX,y:e.clientY}),2===this._pointers.size){const e=[...this._pointers.values()],[t,i]=e,n={x:(t.x+i.x)/2,y:(t.y+i.y)/2};return"map"===this.mode&&this.mapBackground?void(this._gesture={kind:"mapPinch",lastDistance:Ke(t.x,t.y,i.x,i.y)||1,lastAngle:Math.atan2(i.y-t.y,i.x-t.x),lastMid:this._clientToImage(n.x,n.y)}):void(this._gesture={kind:"pinch",startDistance:Ke(t.x,t.y,i.x,i.y),startViewBox:{...this._viewBox},midImage:this._clientToImage(n.x,n.y)})}this._pointers.size>2||(this._downClient={x:e.clientX,y:e.clientY},this._lastClient={x:e.clientX,y:e.clientY},this._moved=!1,this._gesture=null,this._downHit="select"===this.mode?this._hitTest(e.clientX,e.clientY):{type:"empty"})}},this._onPointerMove=e=>{if(!this._pointers.has(e.pointerId))return;if(this._pointers.set(e.pointerId,{x:e.clientX,y:e.clientY}),"mapPinch"===this._gesture?.kind&&2===this._pointers.size){const[e,t]=[...this._pointers.values()],i=this._gesture,n=Ke(e.x,e.y,t.x,t.y)||1,o=Math.atan2(t.y-e.y,t.x-e.x),r=this._clientToImage((e.x+t.x)/2,(e.y+t.y)/2);return this._fire("map-adjust",{op:"pinch",dx:r.x-i.lastMid.x,dy:r.y-i.lastMid.y,factor:n/i.lastDistance,rotateDeg:180*(o-i.lastAngle)/Math.PI,at:r}),i.lastDistance=n,i.lastAngle=o,void(i.lastMid=r)}if("pinch"===this._gesture?.kind&&2===this._pointers.size){const e=[...this._pointers.values()],[t,i]=e,n=Ke(t.x,t.y,i.x,i.y)||1,o=this._gesture.startDistance/n,r=this._gesture.startViewBox,s=qe(r.w*o,this._minViewBoxWidth,4e3),a=s/r.w,l=r.h*a,{x:c,y:d}=this._gesture.midImage;return void(this._viewBox={x:c-(c-r.x)*a,y:d-(d-r.y)*a,w:s,h:l})}if(1!==this._pointers.size||!this._downClient)return;if(this._gestureCancelled)return;if(!this._moved){if(Ke(this._downClient.x,this._downClient.y,e.clientX,e.clientY)<5)return;this._moved=!0,this._gesture=this._lockGesture(),"pan"===this._gesture?.kind||"mapPan"===this._gesture?.kind?this._svg.style.cursor="grabbing":this._gesture&&this._fire("property-gesture-start")}const t=this._svgTransform().scale||1,i=this._lastClient??{x:e.clientX,y:e.clientY};if("mapPan"===this._gesture?.kind)this._fire("map-adjust",{op:"pan",dx:(e.clientX-i.x)/t,dy:(e.clientY-i.y)/t});else if("pan"===this._gesture?.kind)this._viewBox={...this._viewBox,x:this._viewBox.x-(e.clientX-i.x)/t,y:this._viewBox.y-(e.clientY-i.y)/t};else if("move"===this._gesture?.kind)this._fire("placement-move",{id:this._gesture.id,dx:(e.clientX-i.x)/t,dy:(e.clientY-i.y)/t});else if("pinMove"===this._gesture?.kind){const t=this._clientToImage(e.clientX,e.clientY);this._fire("outdoor-pin-move",{id:this._gesture.id,x:t.x,y:t.y})}else if("resize"===this._gesture?.kind){const t=this._gesture,i=this.placements.find(e=>e.id===t.id);if(i){const[n,o]=go[t.corner],r=-n,s=-o,a=this._clientToImage(e.clientX,e.clientY),l=i.rotation_deg*Math.PI/180,c=Math.cos(l),d=Math.sin(l),h=a.x-t.anchorWorld.x,u=a.y-t.anchorWorld.y,g=c*h+d*u,p=-d*h+c*u,m=Math.max(10,n*g),f=Math.max(10,o*p),_=i.aspect_ratio||m/f||1,b=Math.max(m,f*_),v=b/_,y=r*(b/2),k=s*(v/2);this._fire("placement-resize",{id:i.id,width:b,height:v,x:t.anchorWorld.x-(c*y-d*k),y:t.anchorWorld.y-(d*y+c*k)})}}else if("rotate"===this._gesture?.kind){const t=this._gesture.id,i=this.placements.find(e=>e.id===t);if(i){const t=this._clientToImage(e.clientX,e.clientY),n=((180*Math.atan2(t.y-i.y,t.x-i.x)/Math.PI+90)%360+360)%360;this._fire("placement-rotate",{id:i.id,rotationDeg:n})}}this._lastClient={x:e.clientX,y:e.clientY}},this._onPointerUp=e=>{this._pointers.delete(e.pointerId),this._svg.style.cursor="";try{this._svg.releasePointerCapture(e.pointerId)}catch{}this._pointers.size>=1?this._gesture=null:(this._moved||!this._downClient||this._gestureCancelled||this._handleClick(),this._gesture=null,this._downHit=null,this._downClient=null,this._moved=!1,this._gestureCancelled=!1)},this._onWheel=e=>{if(e.preventDefault(),"map"===this.mode&&this.mapBackground&&(e.ctrlKey||e.shiftKey)){const t=this._clientToImage(e.clientX,e.clientY);return void this._fire("map-adjust",e.ctrlKey?{op:"zoom",factor:e.deltaY<0?1.1:1/1.1,at:t}:{op:"rotate",deltaDeg:e.deltaY<0?2:-2,at:t})}if(e.ctrlKey){const t=e.deltaY<0?.9:1.1;return void this._zoomBy(t,this._clientToImage(e.clientX,e.clientY))}const t=this._viewBox.w/this.getBoundingClientRect().width;this._viewBox={...this._viewBox,x:this._viewBox.x+e.deltaX*t,y:this._viewBox.y+e.deltaY*t}}}firstUpdated(){this.initialViewBox?(this._viewBox={...this.initialViewBox},this._hasFittedOnce=!0):(this.fitToScreen(),this._hasFittedOnce=this.placements.length>0||!this.backgroundImageUrl),this._resizeObserver=new ResizeObserver(()=>this.requestUpdate()),this._resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this._resizeObserver?.disconnect(),this._destroyMap()}_destroyMap(){this._map?.destroy(),this._map=void 0,this._mapSize=""}_syncMap(){const e=this.mapBackground;if(!e)return this._destroyMap(),void(this._mapError=null);if(this._mapError)return;const t=this.renderRoot.querySelector(".map-layer");if(!t||!this._svg)return;const i=this._svg.getBoundingClientRect();if(0===i.width||0===i.height)return;const{scale:n,offsetX:o,offsetY:r}=this._svgTransform(),s=this._viewBox,a=function(e,t,i,n){const o=so(e),r=ao(e),s=oo({x:t,y:i},o),a=no(r.x+s.x,r.y+s.y,e.zoom);return{lat:a.lat,lon:a.lon,zoom:e.zoom+Math.log2(n),bearing:o}}(e,s.x+(i.width/2-o)/n,s.y+(i.height/2-r)/n,n),l=this.hass?.themes?.darkMode??!1;if(this._map){this._map.setDark(l),this._map.setStyleKind(e.style??"street"),this._map.setOpacity(e.opacity);const t=`${i.width}x${i.height}`;return t!==this._mapSize&&(this._mapSize=t,this._map.resize()),void this._map.setCamera(a)}const c=this.hass?.connection;if(this._mapStarting||!c)return;this._mapStarting=!0,this._mapError=null;const d="/spatial_context/map";(async()=>{try{const n=await(import(`${d}/spatial-context-map.mjs?v=0.15.0-beta.1+mve0sfhy`));if(!n.supportsVectorMaps())throw new Error(He("mapBackground.noWebgl"));const o=await n.createMapLayer({container:t,baseUrl:d,connection:c,dark:l,styleKind:e.style??"street",language:this.hass?.locale?.language??this.hass?.language??"en",opacity:e.opacity,camera:a});this.mapBackground&&this.isConnected?(this._map=o,this._mapSize=`${i.width}x${i.height}`):o.destroy()}catch(e){this._mapError=e?.message??String(e)}finally{this._mapStarting=!1,this.requestUpdate()}})()}updated(e){if(e.has("mapBackground")&&(this._mapError=null),this._syncMap(),e.has("backgroundImageUrl")&&this.backgroundImageUrl){const e=new Image;e.onload=()=>{this._naturalHeight=e.naturalHeight/e.naturalWidth*kn||750,this._hasFittedOnce||(this.fitToScreen(),this._hasFittedOnce=!0)},e.src=this.backgroundImageUrl}}_contentBounds(){if(0===this.placements.length&&0===this.pins.length)return null;const e=[...this.placements.flatMap(e=>[e.x-e.width,e.x+e.width]),...this.pins.map(e=>e.x)],t=[...this.placements.flatMap(e=>[e.y-e.height,e.y+e.height]),...this.pins.map(e=>e.y)],i=Math.min(...e),n=Math.max(...e),o=Math.min(...t),r=Math.max(...t),s=.15*Math.max(n-i,r-o)||60;return{x:i-s,y:o-s,w:n-i+2*s,h:r-o+2*s}}getViewCenter(){const e=this._svg?.getBoundingClientRect(),{scale:t,offsetX:i,offsetY:n}=this._svgTransform(),o=this._viewBox;return{x:o.x+((e?.width??0)/2-i)/t,y:o.y+((e?.height??0)/2-n)/t}}fitToScreen(){this._viewBox=this._contentBounds()??{x:0,y:0,w:kn,h:this._naturalHeight}}getViewBox(){return{...this._viewBox}}_svgTransform(){const e=this._svg?.getBoundingClientRect(),t=e?.width||this._viewBox.w,i=e?.height||this._viewBox.h,n=Math.min(t/this._viewBox.w,i/this._viewBox.h)||1;return{scale:n,offsetX:(t-this._viewBox.w*n)/2,offsetY:(i-this._viewBox.h*n)/2}}_pxToUnits(e){return e/this._svgTransform().scale}_clientToImage(e,t){const i=this._svg,n=i.createSVGPoint();n.x=e,n.y=t;const o=i.getScreenCTM();if(!o)return{x:0,y:0};const r=n.matrixTransform(o.inverse());return{x:r.x,y:r.y}}_toLocal(e,t,i){const n=e.rotation_deg*Math.PI/180,o=Math.cos(n),r=Math.sin(n),s=t-e.x,a=i-e.y;return{x:o*s+r*a,y:-r*s+o*a}}_localToWorld(e,t,i){const n=e.rotation_deg*Math.PI/180,o=Math.cos(n),r=Math.sin(n);return{x:e.x+o*t-r*i,y:e.y+r*t+o*i}}_hitTest(e,t){const i=this._clientToImage(e,t),n=this._pxToUnits(12*1.4);for(const e of[...this.pins].reverse())if(Ke(e.x,e.y,i.x,i.y)<=n)return{type:"pin",id:e.id};const o=this.placements.find(e=>e.id===this.selectedPlacementId);if(o){const i=this._pxToUnits(26),n=go.map(([e,t])=>[e*o.width/2,t*o.height/2]);for(let i=0;i<n.length;i++){const[r,s]=n[i],a=this._localToWorld(o,r,s),l=this._imageToClient(a.x,a.y);if(Ke(l.x,l.y,e,t)<=14)return{type:"resizeHandle",id:o.id,corner:i}}const r=this._localToWorld(o,0,-o.height/2-i),s=this._imageToClient(r.x,r.y);if(Ke(s.x,s.y,e,t)<=14)return{type:"rotateHandle",id:o.id}}let r=null,s=this._pxToUnits(8);for(const e of this.meshLinks){const t=tt(i.x,i.y,e.from.x,e.from.y,e.to.x,e.to.y);t<=s&&(r=e,s=t)}if(r)return{type:"meshLink",key:r.key};for(const e of[...this.placements].reverse()){const t=this._toLocal(e,i.x,i.y);if(Math.abs(t.x)<=e.width/2&&Math.abs(t.y)<=e.height/2)return{type:"body",id:e.id}}return{type:"empty"}}_imageToClient(e,t){const i=this._svg.getBoundingClientRect(),{scale:n,offsetX:o,offsetY:r}=this._svgTransform();return{x:i.left+o+(e-this._viewBox.x)*n,y:i.top+r+(t-this._viewBox.y)*n}}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}_lockGesture(){if("resizeHandle"===this._downHit?.type){const e=this._downHit,t=this.placements.find(t=>t.id===e.id);if(!t)return{kind:"pan"};const[i,n]=go[e.corner],o=this._localToWorld(t,-i*t.width/2,-n*t.height/2);return{kind:"resize",id:t.id,corner:e.corner,anchorWorld:o}}return"rotateHandle"===this._downHit?.type?{kind:"rotate",id:this._downHit.id}:"body"===this._downHit?.type?{kind:"move",id:this._downHit.id}:"pin"===this._downHit?.type?{kind:"pinMove",id:this._downHit.id}:"map"===this.mode&&this.mapBackground?{kind:"mapPan"}:{kind:"pan"}}cancelGesture(){const e=this._gesture?.kind;return!(!this._moved||!e||"pan"===e||"pinch"===e||"mapPan"===e||"mapPinch"===e)&&(this._gesture=null,this._gestureCancelled=!0,this._svg.style.cursor="",!0)}_handleClick(){if("place"===this.mode||"place-pin"===this.mode){if(!this._downClient)return;const e=this._clientToImage(this._downClient.x,this._downClient.y);return void this._fire("place"===this.mode?"placement-place":"outdoor-pin-place",{x:e.x,y:e.y})}const e=this._downHit;"pin"===e?.type?this._fire("outdoor-pin-select",{id:e.id}):"meshLink"===e?.type?this._fire("property-mesh-link-select",{key:e.key===this.selectedMeshLinkKey?null:e.key}):(this._fire("outdoor-pin-select",{id:null}),this._fire("property-mesh-link-select",{key:null}),this._fire("placement-select",{id:"body"===e?.type?e.id:null}))}get _minViewBoxWidth(){return this.mapBackground?15.625:250}_zoomBy(e,t){const i=qe(this._viewBox.w*e,this._minViewBoxWidth,4e3),n=i/this._viewBox.w,o=this._viewBox.h*n;this._viewBox={x:t.x-(t.x-this._viewBox.x)*n,y:t.y-(t.y-this._viewBox.y)*n,w:i,h:o}}_zoomButton(e){const t=this._viewBox;this._zoomBy(e,{x:t.x+t.w/2,y:t.y+t.h/2})}_renderBackgroundOverlay(){if(!this.backgroundImageUrl)return K;const{scale:e,offsetX:t,offsetY:i}=this._svgTransform(),n=t+e*(this.backgroundOffsetX-this._viewBox.x),o=i+e*(this.backgroundOffsetY-this._viewBox.y),r=e*this.backgroundScale;return N`
      <div
        class="bg-overlay"
        style="transform: translate(${n}px, ${o}px) scale(${r});"
      >
        <img
          src=${this.backgroundImageUrl}
          style="width:${kn}px; height:${this._naturalHeight}px; opacity:${this.backgroundOpacity};"
        />
      </div>
    `}_renderGhost(e){const t=this.ghosts.get(e.id),i=e.source_bounds;if(!t||!i||i.max_x<=i.min_x||i.max_y<=i.min_y)return K;const n=e.width/(i.max_x-i.min_x),o=e.height/(i.max_y-i.min_y),r=e=>e.map(([e,t])=>`${e},${t}`).join(" ");return Z`
      <g
        class="ghost"
        transform="translate(${-e.width/2} ${-e.height/2}) scale(${n} ${o}) translate(${-i.min_x} ${-i.min_y})"
      >
        ${t.rooms.map(e=>Z`<polygon class="ghost-room" points=${r(e)}></polygon>`)}
        ${t.walls.map(e=>Z`<polyline class="ghost-wall" points=${r(e)}></polyline>`)}
      </g>
    `}_renderPlacement(e){const t=e.id===this.selectedPlacementId,i=e.label_override||this.floorNameById.get(e.floor_id)||e.floor_id,n=this._pxToUnits(7),o=this._pxToUnits(26);return Z`
      <g transform="translate(${e.x} ${e.y}) rotate(${e.rotation_deg})">
        <rect
          class="placement-rect ${t?"selected":""}"
          x=${-e.width/2}
          y=${-e.height/2}
          width=${e.width}
          height=${e.height}
        ></rect>
        ${this._renderGhost(e)}
        <text class="placement-label" y=${-e.height/2-n}>${i}</text>
        ${t?Z`
              <line
                class="rotate-stick"
                x1="0" y1=${-e.height/2}
                x2="0" y2=${-e.height/2-o}
              ></line>
              <circle class="rotate-handle" cx="0" cy=${-e.height/2-o} r=${n}></circle>
              <circle class="resize-handle" cx=${-e.width/2} cy=${-e.height/2} r=${n}></circle>
              <circle class="resize-handle" cx=${e.width/2} cy=${-e.height/2} r=${n}></circle>
              <circle class="resize-handle" cx=${e.width/2} cy=${e.height/2} r=${n}></circle>
              <circle class="resize-handle" cx=${-e.width/2} cy=${e.height/2} r=${n}></circle>
            `:K}
      </g>
    `}_renderMeshLink(e){const t=null!==e.from.floorId||null!==e.to.floorId;return Z`
      <line
        class="mesh-link ${t?"indoor":""} ${e.key===this.selectedMeshLinkKey?"selected":this.selectedMeshLinkKey?"dim":""}"
        x1=${e.from.x}
        y1=${e.from.y}
        x2=${e.to.x}
        y2=${e.to.y}
        style="stroke:${ye(e.quality)}"
      >
        <title>${e.from.label} → ${e.to.label}: ${e.detail??e.quality}</title>
      </line>
    `}_renderIndoorEnds(){const e=this._pxToUnits(5),t=new Map;for(const e of this.meshLinks)for(const i of[e.from,e.to])null!==i.floorId&&t.set(i.deviceId,i);return[...t.values()].map(t=>Z`
        <circle class="indoor-end" cx=${t.x} cy=${t.y} r=${e}>
          <title>${t.label}</title>
        </circle>
      `)}_renderPin(e){return this._pinIcons.renderMarker(e.x,e.y,this._pxToUnits(12),this._pinIcons.iconForPin(e,this.entityLookup.values()),"var(--sc-accent)",e.id===this.selectedPinId,e.label_override??Me(e.device_id,this.entityLookup.values()))}render(){const e=this._viewBox;return N`
      ${this.mapBackground?N`<div class="map-layer"></div>
              ${this._mapError?N`<div class="map-error">
                      ${He("mapBackground.failed",{error:this._mapError})}
                    </div>`:K}`:K}
      ${this._renderBackgroundOverlay()}
      ${Z`
        <svg
          viewBox="${e.x} ${e.y} ${e.w} ${e.h}"
          class="${"place"===this.mode||"place-pin"===this.mode?"place-mode":""}"
          @wheel=${this._onWheel}
          @pointerdown=${this._onPointerDown}
          @pointermove=${this._onPointerMove}
          @pointerup=${this._onPointerUp}
          @pointercancel=${this._onPointerUp}
        >
          ${this.placements.map(e=>this._renderPlacement(e))}
          ${this.meshLinks.map(e=>this._renderMeshLink(e))}
          ${this._renderIndoorEnds()}
          ${this.pins.map(e=>this._renderPin(e))}
        </svg>
      `}
      ${this.mapBackground?N`<div class="map-attribution">
              ${"aerial"===this.mapBackground.style?"Imagery © Esri, Maxar, Earthstar Geographics, and the GIS User Community":N`©
                      <a
                        href="https://www.openstreetmap.org/copyright"
                        target="_blank"
                        rel="noopener noreferrer"
                        >OpenStreetMap</a
                      >
                      contributors`}
            </div>`:K}
      <div class="controls">
        <button
          @click=${()=>this._zoomButton(.87)}
          title=${He("canvasControls.zoomIn")}
        >
          <ha-icon icon="mdi:plus"></ha-icon>
        </button>
        <button
          @click=${()=>this._zoomButton(1.15)}
          title=${He("canvasControls.zoomOut")}
        >
          <ha-icon icon="mdi:minus"></ha-icon>
        </button>
        <button
          @click=${()=>this.fitToScreen()}
          title=${He("canvasControls.fit")}
        >
          <ha-icon icon="mdi:fit-to-screen-outline"></ha-icon>
        </button>
      </div>
    `}};po.styles=[yt,Vt,a`
      :host {
        display: block;
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        /* Same backdrop as the floors, for when there's no photo or map. */
        background: color-mix(in srgb, var(--sc-bg) 94%, black);
        user-select: none;
        -webkit-user-select: none;
      }
      :host([dark]) {
        background: color-mix(in srgb, var(--sc-bg) 88%, white);
      }
      svg {
        position: relative;
        width: 100%;
        height: 100%;
        touch-action: none;
        display: block;
        cursor: grab;
      }
      svg.place-mode,
      svg.place-mode * {
        cursor: crosshair !important;
      }
      .map-layer {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }
      .map-attribution {
        position: absolute;
        right: 12px;
        bottom: 60px;
        padding: 1px 6px;
        border-radius: 4px;
        font-size: var(--sc-fs-caption);
        color: #333;
        background: rgba(255, 255, 255, 0.8);
      }
      .map-attribution a {
        color: inherit;
      }
      .map-error {
        position: absolute;
        left: 12px;
        top: 64px;
        max-width: calc(100% - 16px);
        padding: 4px 8px;
        border-radius: 6px;
        font-size: var(--sc-fs-small);
        color: var(--sc-fg);
        background: var(--sc-bg);
        border: 1px solid var(--sc-divider);
        pointer-events: none;
      }
      .bg-overlay {
        position: absolute;
        top: 0;
        left: 0;
        transform-origin: 0 0;
        pointer-events: none;
      }
      .bg-overlay img {
        display: block;
        background: white;
      }
      .placement-rect {
        fill: var(--sc-accent);
        fill-opacity: 0.25;
        stroke: var(--sc-accent);
        stroke-width: 2;
        cursor: pointer;
      }
      .placement-rect.selected {
        stroke: var(--sc-danger);
        stroke-width: 3;
        fill-opacity: 0.35;
      }
      .ghost-room {
        fill: none;
        stroke: var(--sc-accent);
        stroke-opacity: 0.7;
        stroke-width: 1;
        vector-effect: non-scaling-stroke;
        pointer-events: none;
      }
      .ghost-wall {
        fill: none;
        stroke: var(--sc-fg);
        stroke-opacity: 0.8;
        stroke-width: 1.5;
        vector-effect: non-scaling-stroke;
        pointer-events: none;
      }
      .placement-label {
        fill: var(--sc-fg);
        font-size: 16px;
        text-anchor: middle;
        pointer-events: none;
        paint-order: stroke;
        stroke: var(--sc-bg);
        stroke-width: 3px;
      }
      .rotate-stick {
        stroke: var(--sc-danger);
        stroke-width: 1.5;
      }
      .rotate-handle {
        fill: white;
        stroke: var(--sc-danger);
        stroke-width: 2;
        cursor: alias;
      }
      .resize-handle {
        fill: white;
        stroke: var(--sc-accent);
        stroke-width: 2;
        cursor: nwse-resize;
      }
      .mesh-link {
        stroke-width: 2;
        opacity: 0.85;
        cursor: pointer;
      }
      .mesh-link.indoor {
        stroke-dasharray: 6 4;
      }
      .mesh-link.selected {
        stroke-width: 4;
        opacity: 1;
      }
      .mesh-link.dim {
        opacity: 0.2;
      }
      .indoor-end {
        fill: var(--sc-fg-secondary);
        stroke: white;
        stroke-width: 1.5;
        pointer-events: none;
      }
      ${kt}
    `],e([me({attribute:!1})],po.prototype,"placements",void 0),e([me({attribute:!1})],po.prototype,"ghosts",void 0),e([me({attribute:!1})],po.prototype,"floorNameById",void 0),e([me({attribute:!1})],po.prototype,"floorIconById",void 0),e([me({attribute:!1})],po.prototype,"backgroundImageUrl",void 0),e([me({type:Number})],po.prototype,"backgroundOpacity",void 0),e([me({type:Number})],po.prototype,"backgroundOffsetX",void 0),e([me({type:Number})],po.prototype,"backgroundOffsetY",void 0),e([me({type:Number})],po.prototype,"backgroundScale",void 0),e([me({attribute:!1})],po.prototype,"mode",void 0),e([me({attribute:!1})],po.prototype,"selectedPlacementId",void 0),e([me({attribute:!1})],po.prototype,"pins",void 0),e([me({attribute:!1})],po.prototype,"selectedPinId",void 0),e([me({attribute:!1})],po.prototype,"entityLookup",void 0),e([me({attribute:!1})],po.prototype,"meshLinks",void 0),e([me({attribute:!1})],po.prototype,"selectedMeshLinkKey",void 0),e([me({attribute:!1})],po.prototype,"initialViewBox",void 0),e([me({attribute:!1})],po.prototype,"mapBackground",void 0),e([me({type:Boolean,reflect:!0})],po.prototype,"dark",void 0),e([me({attribute:!1})],po.prototype,"hass",void 0),e([fe()],po.prototype,"_mapError",void 0),e([fe()],po.prototype,"_viewBox",void 0),e([fe()],po.prototype,"_naturalHeight",void 0),e([_e("svg")],po.prototype,"_svg",void 0),po=e([be("property-canvas")],po);let mo=class extends he{constructor(){super(...arguments),this.floors=[],this.selectedFloorId=null,this.propertySelected=!1}render(){return N`
      ${this.floors.map(e=>N`
          <button
            class=${this.propertySelected||e.floor_id!==this.selectedFloorId?"":"active"}
            @click=${()=>this.dispatchEvent(new CustomEvent("floor-selected",{detail:{floorId:e.floor_id},bubbles:!0,composed:!0}))}
          >
            <ha-icon icon=${function(e){if(e.icon)return e.icon;switch(e.level){case 0:return"mdi:home-floor-0";case 1:return"mdi:home-floor-1";case 2:return"mdi:home-floor-2";case 3:return"mdi:home-floor-3";case-1:return"mdi:home-floor-negative-1";default:return"mdi:home"}}(e)}></ha-icon>
            <span class=${e.has_layout?"":"unset"}>${e.name}</span>
          </button>
        `)}
      <span class="divider"></span>
      <button
        class=${this.propertySelected?"active":""}
        @click=${()=>this.dispatchEvent(new CustomEvent("property-selected",{bubbles:!0,composed:!0}))}
      >
        <ha-icon icon="mdi:map"></ha-icon>
        <span>${He("floorTabs.property")}</span>
      </button>
    `}};mo.styles=[yt,a`
      :host {
        display: flex;
        height: 100%;
      }
      button {
        height: 100%;
        border-radius: 0;
        padding: 0 24px;
        font-size: var(--sc-fs-body);
        font-weight: 400;
        letter-spacing: normal;
        text-transform: none;
        color: var(--sc-fg);
        border-bottom: 2px solid transparent;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      button ha-icon {
        --mdc-icon-size: 18px;
      }
      /* Centered between the app name and the header's action icons via
       * auto margins rather than justify-content: center — when the tabs
       * overflow (narrow screens) auto margins collapse to 0 and the row
       * scrolls from its start, where center would push the first tabs
       * off the left edge, out of scroll reach. */
      :host > :first-child {
        margin-left: auto;
      }
      :host > :last-child {
        margin-right: auto;
      }
      .divider {
        width: 1px;
        height: 24px;
        align-self: center;
        background: var(--sc-divider);
        margin: 0 4px;
      }
      button:hover {
        background: transparent;
        color: var(--sc-fg);
      }
      button.active {
        background: transparent;
        color: var(--sc-accent);
        border-bottom-color: var(--sc-accent);
      }
      button.active:hover {
        background: transparent;
        color: var(--sc-accent);
      }
      .unset {
        opacity: 0.6;
        font-style: italic;
      }
      /* Tabs get a row of their own on narrow screens (see app-header),
       * so names stay visible — an icon alone rarely tells floors apart. */
      @media (max-width: 600px) {
        button {
          padding: 0 12px;
          white-space: nowrap;
          flex: none;
        }
      }
    `],e([me({attribute:!1})],mo.prototype,"floors",void 0),e([me({attribute:!1})],mo.prototype,"selectedFloorId",void 0),e([me({type:Boolean})],mo.prototype,"propertySelected",void 0),mo=e([be("floor-tabs")],mo);let fo=class extends he{constructor(){super(...arguments),this.floors=[],this.selectedFloorId=null,this.propertySelected=!1}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}render(){return N`
      <div class="identity">
        <button
          class="icon-button menu-button"
          title=${He("appHeader.menu")}
          @click=${()=>this._fire("hass-toggle-menu")}
        >
          <ha-icon icon="mdi:menu"></ha-icon>
        </button>
        <h1>Spatial Context</h1>
      </div>
      <floor-tabs
        .floors=${this.floors}
        .selectedFloorId=${this.selectedFloorId}
        .propertySelected=${this.propertySelected}
      ></floor-tabs>
      <div class="actions">
        <slot></slot>
        <slot name="end"></slot>
      </div>
    `}};fo.styles=[yt,a`
      :host {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
        height: 56px;
        padding: 0 8px 0 4px;
        background: var(--sc-header-bg);
        border-bottom: 1px solid var(--sc-divider);
      }
      .identity {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
        overflow: hidden;
      }
      .identity .menu-button {
        flex: none;
        width: 40px;
        height: var(--sc-h-control);
        margin-right: -4px;
      }
      .identity h1 {
        margin: 0;
        font-size: var(--sc-fs-header);
        font-weight: 400;
        line-height: 1.2;
        white-space: nowrap;
      }
      floor-tabs {
        align-self: stretch;
        justify-self: stretch;
        min-width: 0;
        width: 100%;
        overflow-x: auto;
        scrollbar-width: none;
      }
      floor-tabs::-webkit-scrollbar {
        display: none;
      }
      /* Narrow screens (HA's own mobile breakpoint): the identity block
       * and seven action icons leave the middle column no width at all,
       * so the floor tabs drop to a second, full-width row that scrolls
       * sideways when there are more floors than fit (#21). */
      @media (max-width: 870px) {
        :host {
          grid-template-columns: minmax(0, 1fr) auto;
          grid-template-rows: 56px 48px;
          grid-template-areas:
            "identity actions"
            "tabs tabs";
          height: auto;
          padding: 0;
        }
        .identity {
          grid-area: identity;
          padding-left: 4px;
        }
        .actions {
          grid-area: actions;
          padding-right: 8px;
        }
        floor-tabs {
          grid-area: tabs;
          border-top: 1px solid var(--sc-divider);
        }
      }
      @media (max-width: 600px) {
        /* Seven header actions (incl. undo/redo) need to fit a phone. */
        .icon-button {
          width: 40px;
          height: var(--sc-h-control);
        }
      }
      @media (max-width: 480px) {
        .identity h1 {
          font-size: var(--sc-fs-title);
        }
      }
      .actions {
        display: flex;
        align-items: center;
        justify-self: end;
        gap: 2px;
        position: relative;
      }
      .icon-button {
        position: relative;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
      }
      .icon-button ha-icon {
        --mdc-icon-size: 20px;
      }
      .icon-button.active {
        background: rgba(0, 0, 0, 0.06);
      }
    `],e([me({attribute:!1})],fo.prototype,"floors",void 0),e([me({attribute:!1})],fo.prototype,"selectedFloorId",void 0),e([me({type:Boolean})],fo.prototype,"propertySelected",void 0),fo=e([be("app-header")],fo);let _o=class extends he{constructor(){super(...arguments),this.options=[],this.value=null,this.placeholder="",this.noneLabel=null,this.addMode=!1,this.emptyText="",this._open=!1,this._query="",this._active=0}get _matches(){const e=this._query.toLowerCase().split(/\s+/).filter(Boolean);return 0===e.length?this.options:this.options.filter(t=>{const i=`${t.label} ${t.value} ${t.group??""} ${t.secondary??""}`.toLowerCase();return e.every(e=>i.includes(e))})}get _display(){return this.addMode||!this.value?"":this.options.find(e=>e.value===this.value)?.label??this.value}_pick(e){this._open=!1,this._query="",this.renderRoot.querySelector("input")?.blur(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}_rows(){const e=this._matches.slice(0,80);return null===this.noneLabel||this._query||e.unshift(null),e}_onKey(e){const t=this._rows();if("ArrowDown"===e.key||"ArrowUp"===e.key){e.preventDefault(),this._open=!0;const i="ArrowDown"===e.key?1:-1;this._active=Math.max(0,Math.min(t.length-1,this._active+i)),this.updateComplete.then(()=>this.renderRoot.querySelector(".row.active")?.scrollIntoView({block:"nearest"}))}else if("Enter"===e.key){e.preventDefault();const i=t[this._active];void 0!==i&&this._pick(i?i.value:null)}else"Escape"===e.key&&(e.stopPropagation(),this._open=!1,this._query="",e.target.blur())}render(){const e=this._open?this._rows():[],t=this._open?this._matches.length:0;let i;return N`
      <input
        type="text"
        autocomplete="off"
        spellcheck="false"
        .value=${this._open?this._query:this._display}
        placeholder=${this._open?this._display||this.placeholder:this.placeholder||(this.noneLabel??"")}
        @focus=${()=>{this._open=!0,this._query="",this._active=0}}
        @blur=${()=>{this._open=!1,this._query=""}}
        @input=${e=>{this._query=e.target.value,this._active=0}}
        @keydown=${this._onKey}
      />
      <span class="chevron"></span>
      ${this._open?N`<div
              class="list"
              @mousedown=${e=>e.preventDefault()}
            >
              ${0===e.length?N`<div class="empty">
                      ${this.emptyText||He("canvas.search.none")}
                    </div>`:e.map((e,t)=>{const n=e&&e.group&&e.group!==i?N`<div class="group">${e.group}</div>`:K;return e&&(i=e.group),N`${n}<button
                          class="row ${t===this._active?"active":""} ${e&&e.value===this.value&&!this.addMode?"selected":""}"
                          @click=${()=>this._pick(e?e.value:null)}
                        >
                          ${e?e.label:this.noneLabel}
                          ${e?.secondary?N`<span class="secondary"
                                  >${e.secondary}</span
                                >`:K}
                        </button>`})}
              ${t>80?N`<div class="more">
                      ${He("canvas.search.more",{count:t-80})}
                    </div>`:K}
            </div>`:K}
    `}};_o.styles=a`
    :host {
      display: block;
      position: relative;
      min-width: 0;
    }
    input {
      box-sizing: border-box;
      width: 100%;
      height: var(--sc-h-control, 36px);
      padding: 0 30px 0 10px;
      border: 1px solid var(--sc-divider, #ccc);
      border-radius: var(--sc-r-control, 10px);
      background: var(--sc-bg, #fff);
      color: var(--sc-fg, inherit);
      font: inherit;
      font-size: 13px;
      outline: none;
      text-overflow: ellipsis;
    }
    input:focus {
      border-color: var(--sc-accent, #03a9f4);
    }
    input::placeholder {
      color: var(--sc-fg, inherit);
      opacity: 0.85;
    }
    .chevron {
      position: absolute;
      right: 10px;
      top: calc(var(--sc-h-control, 36px) / 2 - 3px);
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 6px solid var(--sc-fg-secondary, #666);
      pointer-events: none;
    }
    .list {
      margin-top: 4px;
      max-height: 240px;
      overflow-y: auto;
      border: 1px solid var(--sc-divider, #ccc);
      border-radius: var(--sc-r-control, 10px);
      background: var(--sc-bg, #fff);
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
    }
    .group {
      padding: 6px 10px 2px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--sc-fg-secondary, #666);
    }
    .row {
      display: block;
      width: 100%;
      padding: 6px 10px;
      border: none;
      background: none;
      text-align: left;
      font: inherit;
      font-size: 13px;
      color: var(--sc-fg, inherit);
      cursor: pointer;
    }
    .row.active,
    .row:hover {
      background: var(--sc-hover, rgba(0, 0, 0, 0.06));
    }
    .row.selected {
      color: var(--sc-accent, #03a9f4);
      font-weight: 600;
    }
    .secondary {
      display: block;
      font-size: 11px;
      font-weight: 400;
      color: var(--sc-fg-secondary, #666);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .empty,
    .more {
      padding: 8px 10px;
      font-size: 12px;
      color: var(--sc-fg-secondary, #666);
    }
  `,e([me({attribute:!1})],_o.prototype,"options",void 0),e([me({attribute:!1})],_o.prototype,"value",void 0),e([me()],_o.prototype,"placeholder",void 0),e([me({attribute:!1})],_o.prototype,"noneLabel",void 0),e([me({type:Boolean})],_o.prototype,"addMode",void 0),e([me()],_o.prototype,"emptyText",void 0),e([fe()],_o.prototype,"_open",void 0),e([fe()],_o.prototype,"_query",void 0),e([fe()],_o.prototype,"_active",void 0),_o=e([be("search-select")],_o);let bo=class extends he{constructor(){super(...arguments),this.dirty=!1,this.saving=!1,this.canUndo=!1,this.canRedo=!1}_fire(e){this.dispatchEvent(new CustomEvent(e,{bubbles:!0,composed:!0}))}render(){return N`
      <button
        title=${He("rowActions.undo")}
        ?disabled=${!this.canUndo}
        @click=${()=>this._fire("undo-click")}
      >
        <ha-icon icon="mdi:undo"></ha-icon>
      </button>
      <button
        title=${He("rowActions.redo")}
        ?disabled=${!this.canRedo}
        @click=${()=>this._fire("redo-click")}
      >
        <ha-icon icon="mdi:redo"></ha-icon>
      </button>
      <button
        title=${this.saving?He("appHeader.saving"):He("appHeader.save")}
        ?disabled=${this.saving}
        @click=${()=>this._fire("save-click")}
      >
        <ha-icon icon="mdi:content-save"></ha-icon>
        ${this.dirty?N`<span class="dirty-dot"></span>`:K}
      </button>
    `}};bo.styles=[yt,a`
      :host {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      button {
        position: relative;
        display: grid;
        place-items: center;
        width: 40px;
        height: var(--sc-h-control);
        padding: 0;
        border: 1px solid var(--sc-divider);
        border-radius: var(--sc-r-control);
        background: var(--sc-panel-bg);
      }
      button:disabled {
        background: var(--sc-panel-bg);
      }
      ha-icon {
        --mdc-icon-size: 20px;
      }
      .dirty-dot {
        position: absolute;
        top: 6px;
        right: 6px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--sc-danger);
      }
    `],e([me({type:Boolean})],bo.prototype,"dirty",void 0),e([me({type:Boolean})],bo.prototype,"saving",void 0),e([me({type:Boolean})],bo.prototype,"canUndo",void 0),e([me({type:Boolean})],bo.prototype,"canRedo",void 0),bo=e([be("row-actions")],bo);const vo=a`
  /* HA map-panel style info card. */
  .info-card {
    position: absolute;
    top: 68px;
    left: 12px;
    width: min(340px, calc(100% - 24px));
    max-height: calc(100% - 80px);
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px;
    border-radius: 28px;
    pointer-events: auto;
  }
  .info-head {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 4px 0;
  }
  .info-close {
    display: grid;
    place-items: center;
    flex: none;
    width: 40px;
    height: var(--sc-h-control);
    padding: 0;
    border-radius: 50%;
  }
  .info-titles {
    min-width: 0;
    flex: 1;
  }
  .info-toggle {
    display: grid;
    place-items: center;
    flex: none;
    width: 40px;
    height: 40px;
    padding: 0;
    border-radius: 50%;
  }
  /* Phones: the card spans the width under the controls row, and its
   * chevron folds it to just the header so the map stays workable with the
   * thing still selected. */
  @media (max-width: 700px) {
    .info-card {
      top: 56px;
      left: 0;
      right: 0;
      width: auto;
      max-height: 60%;
      border-radius: 0 0 28px 28px;
    }
  }
  .info-title {
    font-size: var(--sc-fs-title);
    line-height: 1.25;
    overflow-wrap: anywhere;
  }
  .info-sub {
    font-size: var(--sc-fs-small);
    color: var(--sc-fg-secondary);
  }
  .info-body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 0;
    overflow-y: auto;
  }
  .info-group {
    /* Don't shrink to fit the card: the body scrolls instead. */
    flex: none;
    padding: 4px 0;
    border-radius: 24px;
    overflow: hidden;
    background: var(--primary-background-color, var(--sc-bg));
  }
  .info-group-title {
    padding: 8px 16px 0;
    font-size: var(--sc-fs-caption);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--sc-fg-secondary);
  }
  .info-row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-height: 48px;
    padding: 6px 16px;
    font-size: var(--sc-fs-row);
    text-align: left;
  }
  .info-row.action {
    justify-content: flex-start;
    border-radius: 0;
  }
  .info-row.action:hover {
    background: var(--sc-hover);
  }
  /* A device row in the stack: the whole row is the hover target (the
   * name and the remove button sit inside it), not each button. */
  .info-row.stack-row:hover {
    background: var(--sc-hover);
  }
  .info-row.stack-row button:hover:not(:disabled):not(.primary) {
    background-image: none;
  }
  .info-row.stack-row .stack-remove:hover:not(:disabled):not(.primary) {
    background-image: linear-gradient(
      color-mix(in srgb, var(--sc-danger) 16%, transparent),
      color-mix(in srgb, var(--sc-danger) 16%, transparent)
    );
  }
  .info-row.action.active {
    color: var(--sc-accent);
  }
  .info-row ha-icon {
    --mdc-icon-size: 22px;
    color: var(--sc-fg-secondary);
  }
  .info-row.action.active ha-icon {
    color: var(--sc-accent);
  }
  .info-row .grow {
    flex: 1;
    min-width: 0;
  }
  .info-row select {
    max-width: 180px;
    border-radius: var(--sc-r-control);
  }
  .inline-pair {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  /* Two lines per link: "Device - Floor", then its signal detail. */
  .link-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }
  .link-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .link-detail {
    font-size: var(--sc-fs-small);
  }
  .quality-dot {
    flex: none;
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }
  .info-row.stack-row {
    padding: 0 4px 0 0;
  }
  .stack-choose {
    flex: 1;
    min-width: 0;
    padding: 12px 16px;
    border-radius: 0;
    text-align: left;
    justify-content: flex-start;
  }
  .stack-remove {
    display: grid;
    place-items: center;
    width: 36px;
    height: var(--sc-h-field);
    padding: 0;
    border-radius: 50%;
    color: var(--sc-danger);
  }
  .info-foot {
    display: flex;
    gap: 8px;
    padding: 0 4px 4px;
  }
  .info-foot button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 44px;
    padding: 10px 16px;
    border-radius: 22px;
    font-size: var(--sc-fs-row);
  }
  .info-foot button.danger {
    background: color-mix(in srgb, var(--sc-danger) 14%, transparent);
  }
  /* Controls inside the info card: HA-style rounded fields. */
  .info-row select,
  .info-row input[type="text"],
  .info-row input[type="number"] {
    height: var(--sc-h-field);
    padding: 0 12px;
    border: 1px solid var(--sc-divider);
    border-radius: var(--sc-r-control);
    background: var(--sc-panel-bg);
    color: var(--sc-fg);
    font: inherit;
    font-size: var(--sc-fs-body);
  }
  .info-row select:focus,
  .info-row input[type="text"]:focus,
  .info-row input[type="number"]:focus {
    outline: none;
    border-color: var(--sc-accent);
  }
  .info-row .select-wrap select {
    padding-right: 32px;
  }
  .wall-thickness {
    width: 72px;
  }
  .text-field {
    width: 170px;
    min-width: 0;
  }
  .text-field.short {
    width: 90px;
  }
`;function yo(e){return N`
    <div class="info-card floating-panel">
      <div class="info-head">
        <button
          class="info-close"
          title=${He("canvas.button.close")}
          @click=${e.onClose}
        >
          <ha-icon icon="mdi:close"></ha-icon>
        </button>
        <div class="info-titles">
          <div class="info-title">${e.title}</div>
          ${e.subtitle?N`<div class="info-sub">${e.subtitle}</div>`:K}
        </div>
        ${e.onToggle?N`<button
                class="info-toggle"
                title=${He(e.collapsed?"canvas.card.show":"canvas.card.hide")}
                aria-expanded=${e.collapsed?"false":"true"}
                @click=${e.onToggle}
              >
                <ha-icon
                  icon=${e.collapsed?"mdi:chevron-down":"mdi:chevron-up"}
                ></ha-icon>
              </button>`:K}
      </div>
      ${e.collapsed?K:N`<div class="info-body">${e.body}</div>
              ${e.footer?N`<div class="info-foot">${e.footer}</div>`:K}`}
    </div>
  `}function ko(e,t,i,n=!1){return N`<button
    class="info-row action ${n?"active":""}"
    @click=${i}
  >
    <ha-icon icon=${e}></ha-icon>
    <span class="grow">${t}</span>
  </button>`}function wo(e,t,i){return N`<div class="info-row">
    <ha-icon icon=${e}></ha-icon>
    <span class="grow">${t}</span>
    ${i}
  </div>`}function xo(e){return N`<span class="select-wrap"
    >${e}<ha-icon class="chev" icon="mdi:menu-down"></ha-icon
  ></span>`}function Mo(e,t){return N`<button class="danger" @click=${t}>
    <ha-icon icon="mdi:delete"></ha-icon> ${e}
  </button>`}function $o(e,t){const i={strong:0,medium:1,weak:2,unknown:3},n=[...t].sort((e,t)=>i[e.quality]-i[t.quality]);return N`<div class="info-group">
    <div class="info-group-title">
      ${e} ·
      ${He("canvas.card.links",{count:n.length})}
    </div>
    ${0===n.length?N`<div class="info-row">
            <span class="grow info-sub"
              >${He("canvas.card.noLinks")}</span
            >
          </div>`:n.map(e=>{const t=e.where?`${e.name} - ${e.where}`:e.name;return N`<div class="info-row link-row">
              <span
                class="quality-dot"
                style="background:${ye(e.quality)}"
              ></span>
              <span class="link-text">
                <span class="link-name" title=${t}>${t}</span>
                <span
                  class="link-detail"
                  style="color:${ye(e.quality)}"
                  >${e.detail}</span
                >
              </span>
            </div>`})}
  </div>`}const Lo=[{key:"primary",label:"Primary",cssVar:"--primary-color",fallback:"#03a9f4"},{key:"accent",label:"Accent",cssVar:"--accent-color",fallback:"#ff9800"},{key:"red",label:"Red",cssVar:"--red-color",fallback:"#f44336"},{key:"pink",label:"Pink",cssVar:"--pink-color",fallback:"#e91e63"},{key:"purple",label:"Purple",cssVar:"--purple-color",fallback:"#926bc7"},{key:"deep-purple",label:"Deep purple",cssVar:"--deep-purple-color",fallback:"#6e41ab"},{key:"indigo",label:"Indigo",cssVar:"--indigo-color",fallback:"#3f51b5"},{key:"blue",label:"Blue",cssVar:"--blue-color",fallback:"#2196f3"},{key:"light-blue",label:"Light blue",cssVar:"--light-blue-color",fallback:"#03a9f4"},{key:"cyan",label:"Cyan",cssVar:"--cyan-color",fallback:"#00bcd4"},{key:"teal",label:"Teal",cssVar:"--teal-color",fallback:"#009688"},{key:"green",label:"Green",cssVar:"--green-color",fallback:"#4caf50"},{key:"light-green",label:"Light green",cssVar:"--light-green-color",fallback:"#8bc34a"},{key:"lime",label:"Lime",cssVar:"--lime-color",fallback:"#cddc39"},{key:"yellow",label:"Yellow",cssVar:"--yellow-color",fallback:"#ffeb3b"},{key:"amber",label:"Amber",cssVar:"--amber-color",fallback:"#ffc107"},{key:"orange",label:"Orange",cssVar:"--orange-color",fallback:"#ff9800"},{key:"deep-orange",label:"Deep orange",cssVar:"--deep-orange-color",fallback:"#ff5722"},{key:"brown",label:"Brown",cssVar:"--brown-color",fallback:"#795548"},{key:"light-grey",label:"Light grey",cssVar:"--light-grey-color",fallback:"#bdbdbd"},{key:"grey",label:"Grey",cssVar:"--grey-color",fallback:"#9e9e9e"},{key:"dark-grey",label:"Dark grey",cssVar:"--dark-grey-color",fallback:"#616161"},{key:"blue-grey",label:"Blue grey",cssVar:"--blue-grey-color",fallback:"#607d8b"},{key:"black",label:"Black",cssVar:"--black-color",fallback:"#000000"},{key:"white",label:"White",cssVar:"--white-color",fallback:"#ffffff"}];let So;function Co(e,t){return function(e,t){if(void 0===So&&(So=document.createElement("canvas").getContext("2d")),!So)return t;So.fillStyle=t,So.fillStyle=e;const i=So.fillStyle;return"string"==typeof i&&i.startsWith("#")?i:t}(getComputedStyle(e).getPropertyValue(t.cssVar).trim()||t.fallback,t.fallback)}const Po=a`
  .mesh-legend {
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: var(--sc-fs-caption);
    color: var(--sc-fg-secondary);
    pointer-events: none;
    white-space: nowrap;
  }
  .mesh-legend .gradient {
    width: 96px;
    height: 6px;
    border-radius: 3px;
  }
`;function Io(){const e=`linear-gradient(to right, ${ye("weak")}, ${ye("medium")}, ${ye("strong")})`;return N`<div class="mesh-legend floating-panel">
    <span>${He("legend.weak")}</span>
    <span class="gradient" style="background:${e}"></span>
    <span>${He("legend.strong")}</span>
  </div>`}const Ho=["light","switch","fan","cover","media_player","climate","lock","vacuum","input_boolean","binary_sensor","sensor"];let Ao=class extends he{constructor(){super(...arguments),this.mode="select",this.armedOpeningType=null,this.hasPendingTrace=!1,this.hasPendingWall=!1,this.furnitureHint="place",this.freeformPoints=0,this.snapMode="all",this.pendingScaleCount=0,this.selectedRoom=null,this.editingRoom=!1,this.areas=[],this.selectedPin=null,this.selectedWall=null,this.editingWall=!1,this.unitSystem="metric",this.unitsPerMeter=null,this.pinStack=null,this.entityLookup=new Map,this.selectedOpening=null,this.selectedFurniture=null,this.furnitureLibraryOpen=!1,this.rooms=[],this.allAreas=[],this.lightEntities=[],this.coverEntities=[],this.selectedRoomLight=null,this.selectedCoverOpenness=null,this.selectedCoverOpennessRight=null,this.floorCalibrated=!1,this.linkableEntities=[],this.selectedItemState=null,this.areaDevices=[],this.pinIconChoices=[],this._colorOpen=!1,this.dirty=!1,this.saving=!1,this.canUndo=!1,this.canRedo=!1,this.meshLegend=!1,this.meshLinks=[],this.meshStubs=[],this.networkLabel=null,this.selectedMeshLink=null,this.selectedMeshStub=null,this.otherFloors=[],this.alignTargetFloorId=null,this.alignTargetHasBackground=!0,this._wallThicknessUnit=null,this._openingWidthUnit=null,this._furnitureSizeUnit=null,this._splitCoverFor=null,this._cardCollapsed=!1,this._card=e=>yo({...e,collapsed:this._cardCollapsed,onToggle:()=>this._cardCollapsed=!this._cardCollapsed}),this._actionRow=ko,this._fieldRow=wo,this._selectWrap=xo,this._clearSelection=()=>this._fire("selection-clear")}willUpdate(e){e.has("selectedRoom")&&e.get("selectedRoom")?.id!==this.selectedRoom?.id&&(this._colorOpen=!1),e.has("selectedWall")&&e.get("selectedWall")?.id!==this.selectedWall?.id&&(this._wallThicknessUnit=null),e.has("selectedOpening")&&e.get("selectedOpening")?.id!==this.selectedOpening?.id&&(this._openingWidthUnit=null),e.has("selectedFurniture")&&e.get("selectedFurniture")?.id!==this.selectedFurniture?.id&&(this._furnitureSizeUnit=null)}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}_unitSelect(e,t){return N`
      <select
        class="small-unit-select"
        @change=${e=>t(e.target.value)}
      >
        ${(i=this.unitSystem,"imperial"===i?["in","ft"]:["cm","m"]).map(t=>N`<option value=${t} ?selected=${t===e}>
              ${t}
            </option>`)}
      </select>
    `;var i}_thicknessInputAttrs(e){switch(e){case"cm":return{min:"1",max:"100",step:"0.5"};case"m":return{min:"0.01",max:"1",step:"0.01"};case"in":return{min:"0.5",max:"40",step:"0.1"};case"ft":return{min:"0.02",max:"1.5",step:"0.01"}}}_modeButton(e,t,i){return N`<button
      class=${this.mode===e?"active":""}
      title=${i}
      @click=${()=>this._fire("mode-change",{mode:e})}
    >
      <ha-icon icon=${t}></ha-icon>
    </button>`}_openingModeButton(e,t,i){const n="opening"===this.mode&&this.armedOpeningType===e;return N`<button
      class=${n?"active":""}
      title=${i}
      @click=${()=>this._fire("add-opening-click",{openingType:e})}
    >
      <ha-icon icon=${t}></ha-icon>
    </button>`}_renderModeToolbar(){return N`
      <div class="mode-toolbar">
        ${this._modeButton("select","mdi:cursor-default-click",He("canvas.mode.select"))}
        ${this._modeButton("pan","mdi:hand-back-right-outline",He("canvas.mode.pan"))}
        <span class="tool-divider"></span>
        ${this._modeButton("trace","mdi:vector-square",He("canvas.mode.trace"))}
        ${this._modeButton("wall","mdi:wall",He("canvas.mode.wall"))}
        ${this._openingModeButton("door","mdi:door",He("canvas.mode.door"))}
        ${this._openingModeButton("window","mdi:window-closed-variant",He("canvas.mode.window"))}
        ${this._modeButton("scale","mdi:ruler",He("canvas.mode.scale"))}
        <span class="tool-divider"></span>
        ${this._modeButton("place","mdi:map-marker-plus",He("canvas.mode.place"))}
        <button
          class=${this.furnitureLibraryOpen?"active":""}
          title=${He("canvas.mode.furniture")}
          @click=${()=>this._fire("furniture-library-click")}
        >
          <ha-icon icon="mdi:sofa-single-outline"></ha-icon>
        </button>
        ${this._modeButton("align","mdi:compare",He("canvas.mode.align"))}
      </div>
    `}_renderSnapSelect(){return N`<select
      class="snap-select"
      title=${He("canvas.snap.tooltip")}
      @change=${e=>this._fire("snap-mode-change",{snapMode:e.target.value})}
    >
      <option value="all" ?selected=${"all"===this.snapMode}>
        ${He("canvas.snap.all")}
      </option>
      <option value="same" ?selected=${"same"===this.snapMode}>
        ${"wall"===this.mode?He("canvas.snap.walls"):He("canvas.snap.rooms")}
      </option>
      <option value="off" ?selected=${"off"===this.snapMode}>
        ${He("canvas.snap.off")}
      </option>
    </select>`}_renderHintBar(){return"trace"===this.mode?N`<div class="hint-bar floating-panel">
        <span class="hint"
          >${this.hasPendingTrace?He("canvas.hint.closeRoom"):He("canvas.hint.addPoints")}</span
        >
        ${this._renderSnapSelect()}
        ${this.hasPendingTrace?N`<button @click=${()=>this._fire("cancel-pending-click")}>
                ${He("canvas.button.cancel")}
              </button>`:K}
      </div>`:"wall"===this.mode?N`<div class="hint-bar floating-panel">
        <span class="hint"
          >${this.hasPendingWall?He("canvas.hint.addWallPointsFinish"):He("canvas.hint.addWallPoints")}</span
        >
        ${this._renderSnapSelect()}
        ${this.hasPendingWall?N`<button
                class="primary"
                @click=${()=>this._fire("finish-wall-click")}
              >
                ${He("canvas.button.finishWall")}
              </button>`:K}
        ${this.hasPendingWall?N`<button @click=${()=>this._fire("cancel-pending-click")}>
                ${He("canvas.button.cancel")}
              </button>`:K}
      </div>`:"scale"===this.mode?N`<div class="hint-bar floating-panel">
        <span class="hint"
          >${0===this.pendingScaleCount?He("canvas.hint.scaleFirst"):He("canvas.hint.scaleSecond")}</span
        >
        ${this.pendingScaleCount>0?N`<button @click=${()=>this._fire("cancel-pending-click")}>
                ${He("canvas.button.cancel")}
              </button>`:K}
      </div>`:"opening"===this.mode?N`<div class="hint-bar floating-panel">
        <span class="hint"
          >${He("canvas.hint.placeOpening",{type:He(`canvas.openingType.${this.armedOpeningType??"opening"}`)})}</span
        >
      </div>`:"align"===this.mode?this._renderAlignBar():"furniture"===this.mode&&"freeform"===this.furnitureHint?N`<div class="hint-bar floating-panel">
        <span class="hint">${He("canvas.hint.freeform")}</span>
        ${this._renderSnapSelect()}
        ${this.freeformPoints>=2?N`<button
                class="primary"
                @click=${()=>this._fire("finish-shape-click")}
              >
                ${He("canvas.button.finishShape")}
              </button>`:K}
        ${this.freeformPoints>0?N`<button @click=${()=>this._fire("cancel-pending-click")}>
                ${He("canvas.button.cancel")}
              </button>`:K}
        <button @click=${()=>this._fire("furniture-done-click")}>
          ${He("canvas.button.done")}
        </button>
      </div>`:"furniture"===this.mode?N`<div class="hint-bar floating-panel">
        <span class="hint"
          >${He("shape"===this.furnitureHint?"canvas.hint.drawShape":"canvas.hint.placeFurniture")}</span
        >
        <button @click=${()=>this._fire("furniture-rotate-armed-click")}>
          <ha-icon icon="mdi:rotate-right-variant"></ha-icon>
        </button>
        <button @click=${()=>this._fire("furniture-done-click")}>
          ${He("canvas.button.done")}
        </button>
      </div>`:K}_coverStateText(e){const t=e=>null===e?He("canvas.opening.coverUnavailable"):He("canvas.opening.coverOpen",{pct:Math.round(100*e)});return e.cover_right_entity_id?`${He("canvas.opening.left")} ${t(this.selectedCoverOpenness)} · ${He("canvas.opening.right")} ${t(this.selectedCoverOpennessRight)}`:t(this.selectedCoverOpenness)}_renderCoverPickers(e){const t=void 0!==e.cover_right_entity_id&&null!==e.cover_right_entity_id||this._splitCoverFor===e.id,i=(e,t,i,n)=>this._fieldRow(e,t,this._selectWrap(N`<select
            @change=${e=>this._fire("opening-cover-change",{entityId:e.target.value||null,side:n})}
          >
            <option value="" ?selected=${!i}>
              ${He("canvas.opening.noCover")}
            </option>
            ${this.coverEntities.map(e=>N`<option
                  value=${e.entity_id}
                  ?selected=${e.entity_id===i}
                >
                  ${e.name}
                </option>`)}
          </select>`));return N`
      ${i("mdi:blinds",He(t?"canvas.opening.coverLeft":"canvas.opening.cover"),e.cover_entity_id,"left")}
      ${t?i("mdi:blinds",He("canvas.opening.coverRight"),e.cover_right_entity_id,"right"):K}
      ${this._fieldRow("mdi:garage",He("canvas.opening.garage"),N`<input
          type="checkbox"
          class="switch"
          role="switch"
          title=${He("canvas.opening.garageHint")}
          .checked=${!!e.garage}
          @change=${e=>this._fire("opening-garage-change",{garage:e.target.checked})}
        />`)}
      ${this._fieldRow("mdi:arrow-split-vertical",He("canvas.opening.twoCovers"),N`<input
          type="checkbox"
          class="switch"
          role="switch"
          .checked=${t}
          @change=${t=>{const i=t.target.checked;this._splitCoverFor=i?e.id:null,i||this._fire("opening-cover-change",{entityId:null,side:"right"}),this.requestUpdate()}}
        />`)}
      ${t&&(e.cover_entity_id||e.cover_right_entity_id)?this._actionRow("mdi:swap-horizontal",He("canvas.opening.swapCovers"),()=>this._fire("opening-cover-swap")):K}
    `}_renderOpeningDaylight(e){const t=e.daylight??{},i=e=>this._fire("opening-daylight-change",{patch:e}),n="imperial"===this.unitSystem,o=t.head_m??2.1,r=(e,t,i,n,o,r,s)=>this._fieldRow(e,t,N`<input
          type="range"
          class="stroke-range"
          min=${n}
          max=${o}
          step=${r}
          style="--pct:${(i-n)/(o-n)*100}%"
          .value=${String(i)}
          @input=${e=>s(Number(e.target.value))}
        />`),s=!1!==t.enabled;return N`
      <div class="info-group-title">${He("canvas.daylight.title")}</div>
      ${this._fieldRow("mdi:white-balance-sunny",He("canvas.daylight.show"),N`<input
          type="checkbox"
          class="switch"
          role="switch"
          .checked=${s}
          @change=${e=>i({enabled:e.target.checked})}
        />`)}
      ${s?N`
              ${r("mdi:brightness-6",He("canvas.daylight.strength",{pct:Math.round(100*(t.strength??1))}),t.strength??1,0,2,.05,e=>i({strength:e}))}
              ${r("mdi:arrow-expand-vertical",He("canvas.daylight.reach",{pct:Math.round(100*(t.reach??1))}),t.reach??1,.25,3,.05,e=>i({reach:e}))}
              ${this._fieldRow("mdi:window-maximize",He("canvas.daylight.head",{unit:n?"ft":"m"}),N`<input
                  type="number"
                  class="furniture-size"
                  min=${n?1:.3}
                  max=${n?30:10}
                  step=${n?.5:.1}
                  .value=${String(Math.round(10*(n?o/.3048:o))/10)}
                  @change=${e=>{const t=Number(e.target.value);!Number.isFinite(t)||t<=0||i({head_m:n?.3048*t:t})}}
                />`)}
              ${r("mdi:tree-outline",He("canvas.daylight.shade",{pct:Math.round(100*(t.shade??0))}),t.shade??0,0,1,.05,e=>i({shade:e}))}
              ${e.daylight?this._actionRow("mdi:restore",He("canvas.daylight.reset"),()=>this._fire("opening-daylight-change",{reset:!0})):K}
            `:K}
    `}_renderRoomLabel(e){const t=e=>this._fire("room-label-change",{patch:e}),i=!1!==e.show_label,n=e.label_size??1,o=e.label_rotation??0;return N`<div class="info-group">
      <div class="info-group-title">${He("canvas.label.title")}</div>
      ${this._fieldRow("mdi:format-text",He("canvas.label.show"),N`<input
          type="checkbox"
          class="switch"
          role="switch"
          .checked=${i}
          @change=${e=>t({show_label:e.target.checked})}
        />`)}
      ${i?N`
              ${this._fieldRow("mdi:format-size",He("canvas.label.size",{pct:Math.round(100*n)}),N`<input
                  type="range"
                  class="stroke-range"
                  min="0.4"
                  max="3"
                  step="0.05"
                  style="--pct:${(n-.4)/2.6*100}%"
                  .value=${String(n)}
                  @input=${e=>t({label_size:Number(e.target.value)})}
                />`)}
              ${this._fieldRow("mdi:format-rotate-90",He("canvas.label.rotation"),N`<span class="inline-pair">
                  <input
                    type="number"
                    class="furniture-size"
                    step="5"
                    .value=${String(o)}
                    @change=${e=>{const i=Number(e.target.value);Number.isFinite(i)&&t({label_rotation:(i+540)%360-180})}}
                  />
                  <span class="icon-buttons">
                    <button
                      title=${He("furniture.rotateLeft")}
                      @click=${()=>t({label_rotation:(o-90+540)%360-180})}
                    >
                      <ha-icon icon="mdi:rotate-left"></ha-icon>
                    </button>
                    <button
                      title=${He("furniture.rotateRight")}
                      @click=${()=>t({label_rotation:(o+90+540)%360-180})}
                    >
                      <ha-icon icon="mdi:rotate-right"></ha-icon>
                    </button>
                  </span>
                </span>`)}
              ${this._fieldRow("mdi:palette",He("canvas.label.colour"),N`<span class="inline-pair">
                  ${e.label_color?N`<button
                          class="color-reset"
                          @click=${()=>t({label_color:null})}
                        >
                          ${He("canvas.card.colourDefault")}
                        </button>`:K}
                  <input
                    type="color"
                    class="room-fill-color"
                    .value=${e.label_color??"#2f343a"}
                    @input=${e=>t({label_color:e.target.value})}
                  />
                </span>`)}
              <div class="info-row">
                <span class="grow info-sub"
                  >${He("canvas.label.dragHint")}</span
                >
              </div>
              ${e.label_position?this._actionRow("mdi:format-text-variant-outline",He("canvas.room.resetLabel"),()=>this._fire("room-label-reset-click")):K}
            `:K}
    </div>`}_renderAreaDevices(e){if(!e.area_id)return K;const t=this.areaDevices,i=this.allAreas.find(t=>t.area_id===e.area_id),n=t.filter(e=>"none"===e.placed).length;return N`<div class="info-group">
      <div class="info-group-title">
        ${He("canvas.areaDevices.title",{area:i?.name??e.area_id})}
      </div>
      ${0===t.length?N`<div class="info-row">
              <span class="grow info-sub"
                >${He("canvas.areaDevices.none")}</span
              >
            </div>`:t.map(e=>N`<label
                  class="info-row device-row ${"elsewhere"===e.placed?"disabled":""}"
                  title=${"elsewhere"===e.placed?He("canvas.areaDevices.elsewhere",{where:e.where??""}):e.name}
                >
                  <ha-icon icon=${e.icon}></ha-icon>
                  <span class="grow device-name"
                    >${e.name}${"elsewhere"===e.placed?N`<span class="info-sub"> · ${e.where}</span>`:K}</span
                  >
                  <input
                    type="checkbox"
                    .checked=${"here"===e.placed}
                    ?disabled=${"elsewhere"===e.placed}
                    @change=${t=>this._fire("room-device-toggle",{deviceId:e.deviceId,on:t.target.checked})}
                  />
                </label>`)}
      ${n>1?this._actionRow("mdi:checkbox-multiple-marked-outline",He("canvas.areaDevices.addAll",{count:n}),()=>this._fire("room-devices-add-all")):K}
    </div>`}_renderLinks(e,t,i,n,o){const r=i.map(e=>e.id),s=n.filter(e=>!r.includes(e.id)).map(e=>({value:e.id,label:e.label,...e.label!==e.id?{secondary:e.id}:{}}));return N`
      ${this._fieldRow(e,t,N`<search-select
          class="link-search"
          addMode
          placeholder=${He("canvas.links.add")}
          .options=${s}
          @value-changed=${e=>{e.detail.value&&o([...r,e.detail.value])}}
        ></search-select>`)}
      ${i.length?N`<div class="link-chips">
              ${i.map(e=>N`<span class="link-chip"
                    ><span>${e.label}</span
                    ><button
                      title=${He("canvas.links.remove")}
                      @click=${()=>o(r.filter(t=>t!==e.id))}
                    >
                      <ha-icon icon="mdi:close"></ha-icon></button
                  ></span>`)}
            </div>`:K}
    `}_renderRoomLights(e){const t=this.selectedRoomLight,i=e=>this.allAreas.find(t=>t.area_id===e)?.name??e,n=e=>this.lightEntities.find(t=>t.entity_id===e)?.name??e,o=e=>this.rooms.find(t=>t.id===e)?.name??e;return N`<div class="info-group">
      <div class="info-group-title">${He("canvas.lights.title")}</div>
      ${this._fieldRow(t&&t.on>0?"mdi:lightbulb-on":"mdi:lightbulb-outline",t?He("canvas.lights.count",{on:t.on,total:t.entityIds.length}):He("canvas.lights.none"),t?N`<span class="light-buttons">
              <button
                @click=${()=>this._fire("room-lights-command",{on:!0})}
              >
                ${He("canvas.lights.on")}
              </button>
              <button
                @click=${()=>this._fire("room-lights-command",{on:!1})}
              >
                ${He("canvas.lights.off")}
              </button>
            </span>`:K)}
      ${this._renderLinks("mdi:link-variant",He("canvas.links.areas"),(e.linked_area_ids??[]).map(e=>({id:e,label:i(e)})),this.allAreas.filter(t=>t.area_id!==e.area_id).map(e=>({id:e.area_id,label:e.name})),e=>this._fire("room-links-change",{linked_area_ids:e}))}
      ${this._renderLinks("mdi:vector-link",He("canvas.links.rooms"),(e.linked_room_ids??[]).map(e=>({id:e,label:o(e)})),this.rooms.filter(t=>t.id!==e.id).map(e=>({id:e.id,label:e.name})),e=>this._fire("room-links-change",{linked_room_ids:e}))}
      ${this._renderLinks("mdi:lightbulb-multiple-outline",He("canvas.links.lights"),(e.light_entity_ids??[]).map(e=>({id:e,label:n(e)})),this.lightEntities.map(e=>({id:e.entity_id,label:e.name})),e=>this._fire("room-links-change",{light_entity_ids:e}))}
      ${t||(e.excluded_light_ids??[]).length?this._renderLinks("mdi:lightbulb-off-outline",He("canvas.links.exclude"),(e.excluded_light_ids??[]).map(e=>({id:e,label:n(e)})),(t?.entityIds??[]).map(e=>({id:e,label:n(e)})),e=>this._fire("room-links-change",{excluded_light_ids:e})):K}
    </div>`}_renderItemEntity(e){const t=this.selectedItemState,i=Ho.map(e=>({domain:e,entities:this.linkableEntities.filter(t=>t.entity_id.startsWith(`${e}.`))})).filter(e=>e.entities.length>0);return N`<div class="info-group">
      <div class="info-group-title">${He("furniture.entityTitle")}</div>
      ${this._fieldRow("mdi:link-variant",He("furniture.entity"),N`<search-select
          class="link-search"
          .options=${i.flatMap(e=>e.entities.map(t=>({value:t.entity_id,label:t.name,group:e.domain,secondary:t.entity_id})))}
          .value=${e.entity_id??null}
          .noneLabel=${He("furniture.noEntity")}
          placeholder=${He("furniture.searchEntity")}
          @value-changed=${e=>this._fire("furniture-change",{patch:{entity_id:e.detail.value}})}
        ></search-select>`)}
      ${e.entity_id&&t?this._fieldRow(t.active?"mdi:lightbulb-on":"mdi:circle-outline",t.text,(n=e.entity_id,["light","switch","fan","input_boolean","cover","media_player"].includes(n.split(".")[0]??"")?N`<span class="light-buttons"
                    ><button
                      @click=${()=>this._fire("furniture-entity-toggle")}
                    >
                      ${He("furniture.toggle")}
                    </button></span
                  >`:K)):K}
    </div>`;var n}_renderCorners(e){const t=Di(e.kind);if(!t||!Ai(e.kind))return K;const i=(n=t.draw,o=t.opts,(r=e.points)&&r.length>=2?r.length:ki(n,o).length);var n,o,r;if(0===i)return K;const s=function(e,t){const i=Math.min(e,t)/2;return i>0?Math.round(mi(e,t)/i*100):0}(e.width_cm,e.depth_cm),a=Array.from({length:i},(t,i)=>e.corners?.[i]??s),l=a.every(e=>e===a[0])?a[0]:null,c=e=>this._fire("furniture-change",{patch:{corners:e}}),d="shapeRect"!==t.draw||e.points?null:["topLeft","topRight","bottomRight","bottomLeft"],h=(e,t)=>N`<input
        type="range"
        class="stroke-range"
        min="0"
        max="100"
        step="1"
        style="--pct:${e}%"
        .value=${String(e)}
        @input=${e=>t(Number(e.target.value))}
      />`;return N`<div class="info-group">
      <div class="info-group-title">${He("furniture.corners")}</div>
      ${this._fieldRow("mdi:rounded-corner",null===l?He("furniture.allCornersMixed"):He("furniture.allCorners",{pct:l}),h(l??s,e=>c(Array(i).fill(e))))}
      ${i<=8?a.map((e,t)=>this._fieldRow("mdi:vector-square",d?`${t+1} · ${He(`furniture.corner.${d[t]}`,{pct:e})}`:He("furniture.cornerN",{n:t+1,pct:e}),h(e,e=>c(a.map((i,n)=>n===t?e:i))))):K}
      ${e.corners?this._actionRow("mdi:restore",He("furniture.resetCorners"),()=>c(null)):K}
    </div>`}_renderFurnitureCard(e){const t=Di(e.kind),i=this._furnitureSizeUnit??ft(this.unitSystem),n=e=>this._fire("furniture-change",{patch:e}),o=t=>N`<input
        type="number"
        class="furniture-size"
        min="0"
        step=${"cm"===i||"in"===i?"1":"0.01"}
        .value=${_t(e[t],i)}
        @change=${e=>{const o=bt(e.target.value,i);null!==o&&Number.isFinite(o)&&o>=1&&n({[t]:Math.round(10*o)/10})}}
      />`,r=(t,i,o)=>this._fieldRow(t,i,N`<input
          type="checkbox"
          class="switch"
          role="switch"
          .checked=${!!e[o]}
          @change=${e=>n({[o]:e.target.checked})}
        />`);return this._card({title:e.label||t?.name||e.kind,subtitle:He(t?`furniture.category.${t.category}`:"canvas.card.furniture"),onClose:this._clearSelection,body:N`
        <div class="info-group">
          ${this._fieldRow("mdi:pencil",He("canvas.card.name"),N`<input
              type="text"
              class="text-field"
              placeholder=${t?.name??""}
              .value=${e.label??""}
              @change=${e=>n({label:e.target.value.trim()||null})}
            />`)}
          ${r("mdi:format-text",He("furniture.showLabel"),"show_label")}
          ${this._fieldRow("mdi:arrow-expand-horizontal",He("furniture.width",{unit:i}),N`<span class="inline-pair"
              >${o("width_cm")}${this._unitSelect(i,e=>this._furnitureSizeUnit=e)}</span
            >`)}
          ${this._fieldRow("mdi:arrow-expand-vertical",He("furniture.depth",{unit:i}),o("depth_cm"))}
          ${this.floorCalibrated?K:N`<div class="info-row">
                  <span class="grow info-sub"
                    >${He("furniture.calibrate")}</span
                  >
                </div>`}
          ${this._fieldRow("mdi:rotate-right",He("furniture.rotation"),N`<span class="inline-pair">
              <input
                type="number"
                class="furniture-size"
                step="1"
                .value=${String(Math.round(10*e.rotation_deg)/10)}
                @change=${e=>{const t=Number(e.target.value);Number.isFinite(t)&&n({rotation_deg:(t%360+360)%360})}}
              />
              <span class="icon-buttons">
                <button
                  title=${He("furniture.rotateLeft")}
                  @click=${()=>n({rotation_deg:(e.rotation_deg+270)%360})}
                >
                  <ha-icon icon="mdi:rotate-left"></ha-icon>
                </button>
                <button
                  title=${He("furniture.rotateRight")}
                  @click=${()=>n({rotation_deg:(e.rotation_deg+90)%360})}
                >
                  <ha-icon icon="mdi:rotate-right"></ha-icon>
                </button>
              </span>
            </span>`)}
        </div>
        <div class="info-group">
          <div class="info-group-title">${He("canvas.card.style")}</div>
          ${this._fieldRow("mdi:opacity",He("furniture.opacity",{pct:Math.round(100*(e.opacity??1))}),N`<input
              type="range"
              class="stroke-range"
              min="0.1"
              max="1"
              step="0.05"
              style="--pct:${((e.opacity??1)-.1)/.9*100}%"
              .value=${String(e.opacity??1)}
              @input=${e=>n({opacity:Number(e.target.value)})}
            />`)}
          ${this._fieldRow("mdi:format-line-weight",He("furniture.lineThickness",{px:e.stroke_width.toFixed(1)}),N`<input
              type="range"
              class="stroke-range"
              min="0.5"
              max="6"
              step="0.25"
              style="--pct:${(e.stroke_width-.5)/5.5*100}%"
              .value=${String(e.stroke_width)}
              @input=${e=>n({stroke_width:Number(e.target.value)})}
            />`)}
          ${this._fieldRow("mdi:palette",He("canvas.card.colour"),N`<span class="inline-pair">
              ${e.color?N`<button
                      class="color-reset"
                      @click=${()=>n({color:null})}
                    >
                      ${He("canvas.card.colourDefault")}
                    </button>`:K}
              <input
                type="color"
                class="room-fill-color"
                .value=${e.color??"#607d8b"}
                @input=${e=>n({color:e.target.value})}
              />
            </span>`)}
          ${r("mdi:format-color-fill",He("furniture.fill"),"fill")}
          ${r("mdi:layers-outline",He("furniture.solid"),"solid")}
          ${r("mdi:flip-horizontal",He("furniture.mirror"),"mirrored")}
          ${r("mdi:lock-outline",He("furniture.lock"),"locked")}
        </div>
        ${this._renderCorners(e)} ${this._renderItemEntity(e)}
        <div class="info-group">
          ${this._actionRow("mdi:content-copy",He("furniture.duplicate"),()=>this._fire("furniture-duplicate-click"))}
          ${this._actionRow("mdi:arrange-bring-to-front",He("furniture.toFront"),()=>this._fire("furniture-order-click",{front:!0}))}
          ${this._actionRow("mdi:arrange-bring-forward",He("furniture.forward"),()=>this._fire("furniture-order-click",{front:!0,step:!0}))}
          ${this._actionRow("mdi:arrange-send-backward",He("furniture.backward"),()=>this._fire("furniture-order-click",{front:!1,step:!0}))}
          ${this._actionRow("mdi:arrange-send-to-back",He("furniture.toBack"),()=>this._fire("furniture-order-click",{front:!1}))}
        </div>
      `,footer:this._deleteButton(He("furniture.delete"),"furniture-delete-click")})}_renderAlignBar(){return this.alignTargetFloorId?this.alignTargetHasBackground?N`<div class="hint-bar floating-panel">
      <span class="hint">${He("canvas.hint.alignDrag")}</span>
      <button
        title=${He("canvas.align.shrink")}
        @click=${()=>this._fire("align-scale-click",{factor:.995})}
      >
        −
      </button>
      <button
        title=${He("canvas.align.grow")}
        @click=${()=>this._fire("align-scale-click",{factor:1.0050251})}
      >
        +
      </button>
      <button class="primary" @click=${()=>this._fire("align-apply-click")}>
        ${He("canvas.button.apply")}
      </button>
      <button @click=${()=>this._fire("align-cancel-click")}>
        ${He("canvas.button.cancel")}
      </button>
    </div>`:N`<div class="hint-bar floating-panel">
        <span class="hint">${He("canvas.hint.noBackground")}</span>
        <button
          @click=${()=>this._fire("align-target-change",{floorId:null})}
        >
          ${He("canvas.button.chooseAnother")}
        </button>
        <button @click=${()=>this._fire("align-cancel-click")}>
          ${He("canvas.button.cancel")}
        </button>
      </div>`:N`<div class="hint-bar floating-panel">
        <span class="hint">${He("canvas.hint.alignAgainst")}</span>
        <select
          @change=${e=>this._fire("align-target-change",{floorId:e.target.value})}
        >
          <option value="" selected>${He("canvas.align.choose")}</option>
          ${this.otherFloors.map(e=>N`<option value=${e.floor_id}>${e.name}</option>`)}
        </select>
        <button @click=${()=>this._fire("align-cancel-click")}>
          ${He("canvas.button.cancel")}
        </button>
      </div>`}_renderAreaSelect(e){const t=this.areas.filter(e=>null!==e.floor_id),i=new Set(t.map(e=>e.area_id)),n=this.allAreas.filter(e=>null===e.floor_id),o=this.otherFloors.map(e=>({floor:e,areas:this.allAreas.filter(t=>t.floor_id===e.floor_id&&!i.has(t.area_id))})).filter(e=>e.areas.length>0),r=!e.area_id||this.allAreas.some(t=>t.area_id===e.area_id);return N`<select
      @change=${e=>this._fire("room-area-change",{areaId:e.target.value})}
    >
      <option value="" ?selected=${!e.area_id}>
        ${He("canvas.room.custom")}
      </option>
      ${r?K:N`<option value=${e.area_id} selected>
              ${He("canvas.room.unknownArea",{id:e.area_id??""})}
            </option>`}
      ${t.length?N`<optgroup label=${He("canvas.room.thisFloor")}>
              ${this._areaOptions(t,e.area_id)}
            </optgroup>`:K}
      ${o.map(t=>N`<optgroup label=${t.floor.name}>
            ${this._areaOptions(t.areas,e.area_id)}
          </optgroup>`)}
      ${n.length?N`<optgroup label=${He("canvas.room.outdoor")}>
              ${this._areaOptions(n,e.area_id)}
            </optgroup>`:K}
    </select>`}_areaOptions(e,t){return e.map(e=>N`<option
          value=${e.area_id}
          ?selected=${e.area_id===t}
        >
          ${e.name}
        </option>`)}_deleteButton(e,t){return Mo(e,()=>this._fire(t))}_renderColourPicker(e){const t=Lo.map(e=>({...e,label:He(`colors.${e.key.replace(/-/g,"_")}`),hex:Co(this,e)})),i=(e.fill_color??"").toLowerCase(),n=t.find(e=>e.hex.toLowerCase()===i),o=e.fill_color??Mn,r=e.fill_color?n?.label??He("canvas.card.colourCustom"):He("canvas.card.colourDefault"),s=e=>{this._colorOpen=!1,this._fire("room-fill-color-change",{color:e})};return N`
      <div class="info-row">
        <ha-icon icon="mdi:palette"></ha-icon>
        <span class="grow">${He("canvas.card.colour")}</span>
        <button
          class="color-field"
          aria-expanded=${this._colorOpen?"true":"false"}
          @click=${()=>this._colorOpen=!this._colorOpen}
        >
          <span class="swatch" style="background:${o}"></span>
          <span class="color-name">${r}</span>
          <ha-icon
            icon=${this._colorOpen?"mdi:menu-up":"mdi:menu-down"}
          ></ha-icon>
        </button>
      </div>
      ${this._colorOpen?N`<div class="color-list">
              ${t.map(e=>N`<button
                    class="color-item ${e.hex.toLowerCase()===i?"selected":""}"
                    @click=${()=>s(e.hex)}
                  >
                    <span class="swatch" style="background:${e.hex}"></span>
                    <span class="grow">${e.label}</span>
                    ${e.hex.toLowerCase()===i?N`<ha-icon icon="mdi:check"></ha-icon>`:K}
                  </button>`)}
              <label class="color-item custom">
                <span class="swatch custom-swatch"></span>
                <span class="grow"
                  >${He("canvas.card.colourCustom")}</span
                >
                <input
                  type="color"
                  class="room-fill-color"
                  .value=${o}
                  @input=${e=>this._fire("room-fill-color-change",{color:e.target.value})}
                />
              </label>
            </div>`:K}
    `}_renderDeviceNetwork(e){return this.networkLabel?$o(this.networkLabel,[...this.meshLinks.filter(t=>t.fromPin.id===e.id||t.toPin.id===e.id).map(t=>({name:this._pinLabel(t.fromPin.id===e.id?t.toPin:t.fromPin),where:"",quality:t.quality,detail:t.detail??t.quality})),...this.meshStubs.filter(t=>t.fromPin.id===e.id).map(e=>({name:e.targetLabel,where:e.targetFloorName,quality:e.quality,detail:e.detail??e.quality}))]):K}_renderSelectionPanel(){if(this.selectedRoom){const e=this.selectedRoom,t=!1!==e.visible,i=this.areas.find(t=>t.area_id===e.area_id);return this._card({title:e.name,subtitle:i?i.name:He("canvas.card.room"),onClose:this._clearSelection,body:N`
          <div class="info-group">
            ${this._fieldRow("mdi:floor-plan",He("canvas.card.area"),this._selectWrap(this._renderAreaSelect(e)))}
            ${this._fieldRow("mdi:pencil",He("canvas.card.name"),N`<input
                type="text"
                class="text-field"
                .value=${e.name}
                @change=${t=>{const i=t.target,n=i.value.trim();n?this._fire("room-name-change",{name:n}):i.value=e.name}}
              />`)}
            ${this._actionRow("mdi:vector-polygon",this.editingRoom?He("canvas.room.doneEditing"):He("canvas.room.editVertices"),()=>this._fire("room-edit-vertices-click"),this.editingRoom)}
            ${this._fieldRow("mdi:home-export-outline",He("canvas.room.outdoorSpace"),N`<input
                type="checkbox"
                class="switch"
                role="switch"
                title=${He("canvas.room.outdoorHint")}
                .checked=${!!e.outdoor}
                @change=${e=>this._fire("room-outdoor-change",{outdoor:e.target.checked})}
              />`)}
            ${(()=>{const t="imperial"===this.unitSystem,i=t?.3048:1,n=e.floor_offset_m??null;return this._fieldRow("mdi:stairs",He("canvas.room.floorOffset",{unit:t?"ft":"m"}),N`<input
                  type="number"
                  class="furniture-size"
                  title=${He("canvas.room.floorOffsetHint")}
                  step=${t?.25:.05}
                  placeholder="0"
                  .value=${null===n?"":String(Math.round(n/i*100)/100)}
                  @change=${e=>{const t=e.target.value.trim(),n=""===t?0:Number(t);Number.isFinite(n)&&this._fire("room-floor-offset-change",{offset:0===n?null:Math.round(n*i*1e3)/1e3})}}
                />`)})()}
            ${this._fieldRow("mdi:eye",He("canvas.card.visible"),N`<input
                type="checkbox"
                class="switch"
                role="switch"
                .checked=${t}
                @change=${()=>this._fire("room-visible-toggle")}
              />`)}
          </div>
          ${this._renderRoomLabel(e)} ${this._renderAreaDevices(e)}
          ${this._renderRoomLights(e)}
          <div class="info-group">
            <div class="info-group-title">${He("canvas.card.style")}</div>
            ${this._renderColourPicker(e)}
            ${this._fieldRow("mdi:opacity",He("canvas.room.fillOpacity",{pct:Math.round(100*(e.fill_opacity??$n))}),N`<input
                type="range"
                class="room-opacity"
                min="0"
                max="1"
                step="0.02"
                style="--pct:${100*(e.fill_opacity??$n)}%"
                .value=${String(e.fill_opacity??$n)}
                @input=${e=>this._fire("room-fill-opacity-change",{opacity:Number(e.target.value)})}
              />`)}
            ${this._fieldRow("mdi:square-outline",He("canvas.room.borderOpacity",{pct:Math.round(100*(e.border_opacity??1))}),N`<input
                type="range"
                class="room-opacity"
                min="0"
                max="1"
                step="0.02"
                style="--pct:${100*(e.border_opacity??1)}%"
                .value=${String(e.border_opacity??1)}
                @input=${e=>this._fire("room-border-opacity-change",{opacity:Number(e.target.value)})}
              />`)}
          </div>
        `,footer:this._deleteButton(He("canvas.room.delete"),"room-delete-click")})}if(this.selectedPin){const e=this.selectedPin;return this._card({title:this._pinLabel(e),subtitle:He("canvas.card.device"),onClose:this._clearSelection,body:N`<div class="info-group">
            ${this._fieldRow("mdi:tag-text",He("canvas.card.label"),N`<input
                type="text"
                class="text-field"
                placeholder=${Me(e.device_id,this.entityLookup.values())}
                .value=${e.label_override??""}
                @change=${e=>this._fire("pin-label-change",{label:e.target.value})}
              />`)}
            <div class="info-row">
              <ha-icon icon="mdi:shape"></ha-icon>
              <span class="grow">${He("canvas.pin.icon")}</span>
            </div>
            <div class="icon-choices">
              ${this.pinIconChoices.map(t=>N`<button
                    class="icon-choice ${e.icon_override===t?"active":""}"
                    title=${t.replace("mdi:","")}
                    @click=${()=>this._fire("pin-icon-quick",{icon:t})}
                  >
                    <ha-icon icon=${t}></ha-icon>
                  </button>`)}
              <button
                class="icon-choice more"
                title=${He("canvas.pin.moreIcons")}
                @click=${()=>this._fire("pin-set-icon-click")}
              >
                <ha-icon icon="mdi:dots-horizontal"></ha-icon>
              </button>
            </div>
            ${e.icon_override?this._actionRow("mdi:restore",He("canvas.pin.defaultIcon"),()=>this._fire("pin-icon-quick",{icon:null})):K}
            ${this._fieldRow("mdi:human-male-height",He("canvas.card.height",{unit:"imperial"===this.unitSystem?"ft":"m"}),N`<input
                type="text"
                inputmode="decimal"
                class="text-field short"
                placeholder=${"imperial"===this.unitSystem?"6":"1.8"}
                .value=${null===e.height_m?"":gt(e.height_m,this.unitSystem)}
                @change=${e=>this._fire("pin-height-change",{value:e.target.value})}
              />`)}
          </div>
          ${this._renderDeviceNetwork(e)}`,footer:this._deleteButton(He("canvas.pin.delete"),"pin-delete-click")})}if(this.selectedWall){const e=this.selectedWall,t=this._wallThicknessUnit??ft(this.unitSystem),i=this._thicknessInputAttrs(t);return this._card({title:He("canvas.card.wall"),subtitle:(()=>{const t=Ae.find(t=>t.id===e.material);return t?Ve(t):void 0})(),onClose:this._clearSelection,body:N`<div class="info-group">
          ${this._fieldRow("mdi:wall",He("canvas.wall.material"),this._selectWrap(N`<select
                @change=${e=>this._fire("wall-material-change",{material:e.target.value})}
              >
                ${Ae.map(t=>N`<option
                      value=${t.id}
                      ?selected=${t.id===e.material}
                    >
                      ${Ve(t)}
                    </option>`)}
              </select>`))}
          ${this._fieldRow("mdi:arrow-expand-horizontal",He("canvas.wall.thickness",{unit:t}),N`<span class="inline-pair"
              ><input
                type="number"
                class="wall-thickness"
                min=${i.min}
                max=${i.max}
                step=${i.step}
                .value=${_t(Te(e),t)}
                @change=${e=>{const i=bt(e.target.value,t);null===i||!Number.isFinite(i)||i<=0||this._fire("wall-thickness-change",{thicknessCm:i})}}
              />${this._unitSelect(t,e=>this._wallThicknessUnit=e)}</span
            >`)}
          ${this._actionRow("mdi:vector-polygon",this.editingWall?He("canvas.room.doneEditing"):He("canvas.room.editVertices"),()=>this._fire("wall-edit-vertices-click"),this.editingWall)}
        </div>`,footer:this._deleteButton(He("canvas.wall.delete"),"wall-delete-click")})}if(this.selectedOpening){const e=this.selectedOpening,t=this._openingWidthUnit??ft(this.unitSystem),i=this._thicknessInputAttrs(t),n=this.unitsPerMeter;return this._card({title:He(`canvas.openingLabel.${e.type}`),subtitle:He("canvas.card.wallOpening"),onClose:this._clearSelection,body:N`<div class="info-group">
          ${this._fieldRow("mdi:arrow-expand-horizontal",He("canvas.opening.width",{unit:null!==n?t:He("canvas.opening.storedUnits")}),N`<span class="inline-pair"
              ><input
                type="number"
                class="wall-thickness"
                min=${null!==n?i.min:"1"}
                step=${null!==n?i.step:"1"}
                .value=${null!==n?vt(e.width,n,t):String(e.width)}
                @change=${e=>{const i=e.target.value,o=null!==n?function(e,t,i){const n=bt(e,i);return null===n?null:n/100*t}(i,n,t):Number(i);null===o||!Number.isFinite(o)||o<=0||this._fire("opening-width-change",{width:o})}}
              />${null!==n?this._unitSelect(t,e=>this._openingWidthUnit=e):K}</span
            >`)}
          ${null===n?N`<div class="info-row">
                  <span class="grow info-sub"
                    >${He("canvas.opening.calibrate")}</span
                  >
                </div>`:K}
          ${"window"===e.type?this._fieldRow("mdi:window-closed-variant",He("canvas.opening.windowStyle"),this._selectWrap(N`<select
                      @change=${e=>this._fire("opening-style-change",{style:e.target.value})}
                    >
                      ${["standard","transom","full"].map(t=>N`<option
                            value=${t}
                            ?selected=${(e.window_style??"standard")===t}
                          >
                            ${He(`canvas.opening.windowStyles.${t}`)}
                          </option>`)}
                    </select>`)):K}
          ${this._renderCoverPickers(e)}
          ${this._renderOpeningDaylight(e)}
          ${e.cover_entity_id||e.cover_right_entity_id?this._fieldRow("mdi:weather-sunny",He("canvas.opening.coverState"),N`<span>${this._coverStateText(e)}</span>`):K}
        </div>`,footer:this._deleteButton(He("canvas.opening.delete"),"opening-delete-click")})}if(this.selectedFurniture)return this._renderFurnitureCard(this.selectedFurniture);if(this.selectedMeshLink){const e=this.selectedMeshLink;return this._card({title:`${this._pinLabel(e.fromPin)} → ${this._pinLabel(e.toPin)}`,subtitle:He("canvas.card.link"),onClose:this._clearSelection,body:N`<div class="info-group">
          ${this._fieldRow("mdi:signal",He("canvas.card.quality"),N`<span style="color:${ye(e.quality)}"
              >${e.detail??e.quality}</span
            >`)}
        </div>`})}if(this.selectedMeshStub){const e=this.selectedMeshStub;return this._card({title:`${this._pinLabel(e.fromPin)} → ${e.targetLabel}`,subtitle:e.targetFloorName,onClose:this._clearSelection,body:N`<div class="info-group">
          ${this._fieldRow("mdi:signal",He("canvas.card.quality"),N`<span style="color:${ye(e.quality)}"
              >${e.detail??e.quality}</span
            >`)}
          ${this._actionRow("mdi:arrow-right-circle",He("canvas.meshStub.goToFloor"),()=>this._fire("mesh-stub-goto-floor-click"))}
        </div>`})}return K}_pinLabel(e){return e.label_override?e.label_override:Me(e.device_id,this.entityLookup.values())}_renderPinStack(){if(!this.pinStack)return K;const e=this.pinStack;return this._card({title:He("canvas.pin.stackTitle",{count:e.length}),onClose:()=>this._fire("pin-stack-dismiss"),body:N`<div class="info-group">
        ${e.map(e=>N`
            <div class="info-row stack-row">
              <button
                class="stack-choose"
                @click=${()=>this._fire("pin-stack-choose",{pinId:e.id})}
              >
                ${this._pinLabel(e)}
              </button>
              <button
                class="stack-remove"
                title=${He("canvas.pin.removeFromSpot")}
                @click=${()=>this._fire("pin-stack-remove-click",{pinId:e.id})}
              >
                <ha-icon icon="mdi:delete"></ha-icon>
              </button>
            </div>
          `)}
      </div>`})}render(){return N`
      <div class="tool-row">
        ${this._renderModeToolbar()} ${this._renderHintBar()}
        <slot name="row-end"></slot>
        <row-actions
          .dirty=${this.dirty}
          .saving=${this.saving}
          .canUndo=${this.canUndo}
          .canRedo=${this.canRedo}
        ></row-actions>
      </div>
      ${this.meshLegend?Io():K}
      ${this.pinStack?this._renderPinStack():this._renderSelectionPanel()}
    `}};Ao.styles=[yt,wt,vo,$t,xt,Mt,Po,a`
      :host {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }
      .mode-toolbar {
        pointer-events: auto;
      }
      .mode-toolbar button {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 10px;
        border-radius: 10px;
      }
      /* A thin divider between tool groups: view, draw, place/align. */
      .tool-divider {
        align-self: stretch;
        width: 1px;
        margin: 6px 4px;
        background: var(--sc-divider);
      }
      .mode-toolbar ha-icon {
        --mdc-icon-size: 20px;
      }
      /* Tonal active state, like HA's selected chips and tabs: the primary
       * colour at low strength behind a primary icon. */
      .mode-toolbar button.active {
        background: color-mix(in srgb, var(--sc-accent) 22%, transparent);
        color: var(--sc-accent);
      }
      .mode-toolbar button.active ha-icon {
        color: var(--sc-accent);
      }
      .hint-bar {
        position: absolute;
        top: 12px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        gap: 8px;
        pointer-events: auto;
      }
      .snap-select {
        padding: 4px;
      }
      .hint {
        font-size: var(--sc-fs-small);
        color: var(--sc-fg-secondary);
      }
      .color-field {
        display: flex;
        align-items: center;
        gap: 8px;
        height: var(--sc-h-field);
        padding: 0 8px 0 10px;
        border: 1px solid var(--sc-divider);
        border-radius: var(--sc-r-control);
        background: var(--sc-panel-bg);
        font-size: var(--sc-fs-body);
      }
      .swatch {
        flex: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 1px solid color-mix(in srgb, var(--sc-fg) 25%, transparent);
      }
      .custom-swatch {
        background: conic-gradient(red, yellow, lime, aqua, blue, magenta, red);
      }
      .color-list {
        max-height: 260px;
        overflow-y: auto;
        margin: 0 8px 4px;
        border: 1px solid var(--sc-divider);
        border-radius: 16px;
        background: var(--sc-panel-bg);
      }
      .color-item {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        min-height: 44px;
        padding: 6px 14px;
        border-radius: 0;
        font-size: var(--sc-fs-row);
        text-align: left;
        justify-content: flex-start;
        cursor: pointer;
      }
      .color-item:hover {
        background: var(--sc-hover);
      }
      .color-item.selected {
        color: var(--sc-accent);
      }
      .color-item .grow {
        flex: 1;
        min-width: 0;
      }
      .color-item ha-icon {
        --mdc-icon-size: 20px;
        color: var(--sc-accent);
      }
      .color-item .room-fill-color {
        width: 36px;
        height: 24px;
      }
      .small-unit-select {
        width: auto;
      }
      .room-fill-color {
        -webkit-appearance: none;
        appearance: none;
        width: 44px;
        height: 32px;
        padding: 0;
        border: 1px solid var(--sc-divider);
        border-radius: 10px;
        background: none;
        cursor: pointer;
        overflow: hidden;
      }
      .room-fill-color::-webkit-color-swatch-wrapper {
        padding: 0;
      }
      .room-fill-color::-webkit-color-swatch {
        border: none;
      }
      .room-fill-color::-moz-color-swatch {
        border: none;
      }
      .room-opacity {
        width: 140px;
      }
      .device-row {
        cursor: pointer;
      }
      .device-row.disabled {
        opacity: 0.55;
        cursor: default;
      }
      .device-row .device-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .device-row input {
        width: 18px;
        height: 18px;
        accent-color: var(--sc-accent);
      }
      .icon-choices {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        padding: 0 12px 8px 44px;
      }
      .icon-choice {
        display: grid;
        place-items: center;
        width: 34px;
        height: 34px;
        padding: 0;
        border: 1px solid var(--sc-divider);
        border-radius: 10px;
        color: var(--sc-fg);
      }
      .icon-choice.active {
        border-color: var(--sc-accent);
        color: var(--sc-accent);
        background: color-mix(in srgb, var(--sc-accent) 10%, transparent);
      }
      .icon-choice ha-icon {
        --mdc-icon-size: 20px;
      }
      /* The same width as the row's other dropdowns, so the label keeps
       * its room. */
      search-select.link-search {
        flex: 0 1 180px;
        width: 180px;
        min-width: 120px;
      }
      .link-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        padding: 2px 12px 6px 44px;
      }
      .link-chip {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        max-width: 100%;
        height: 26px;
        padding: 0 4px 0 10px;
        border: 1px solid var(--sc-divider);
        border-radius: 13px;
        font-size: 12px;
      }
      .link-chip span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .link-chip button {
        display: grid;
        place-items: center;
        width: 20px;
        height: 20px;
        padding: 0;
        border-radius: 50%;
        color: var(--sc-fg-secondary);
      }
      .link-chip ha-icon {
        --mdc-icon-size: 14px;
      }
      .light-buttons {
        display: flex;
        gap: 6px;
      }
      .light-buttons button {
        height: 30px;
        padding: 0 10px;
        border: 1px solid var(--sc-divider);
        border-radius: var(--sc-r-control);
      }
      .furniture-size {
        width: 64px;
      }
      .stroke-range {
        width: 120px;
      }
      .icon-buttons {
        display: flex;
        gap: 2px;
      }
      .icon-buttons button {
        display: grid;
        place-items: center;
        width: 32px;
        height: 32px;
        padding: 0;
        border-radius: 50%;
      }
      .color-reset {
        height: 28px;
        padding: 0 8px;
        font-size: 12px;
        color: var(--sc-fg-secondary);
      }
    `],e([me({attribute:!1})],Ao.prototype,"mode",void 0),e([me({attribute:!1})],Ao.prototype,"armedOpeningType",void 0),e([me({type:Boolean})],Ao.prototype,"hasPendingTrace",void 0),e([me({type:Boolean})],Ao.prototype,"hasPendingWall",void 0),e([me({attribute:!1})],Ao.prototype,"furnitureHint",void 0),e([me({type:Number})],Ao.prototype,"freeformPoints",void 0),e([me({attribute:!1})],Ao.prototype,"snapMode",void 0),e([me({type:Number})],Ao.prototype,"pendingScaleCount",void 0),e([me({attribute:!1})],Ao.prototype,"selectedRoom",void 0),e([me({type:Boolean})],Ao.prototype,"editingRoom",void 0),e([me({attribute:!1})],Ao.prototype,"areas",void 0),e([me({attribute:!1})],Ao.prototype,"selectedPin",void 0),e([me({attribute:!1})],Ao.prototype,"selectedWall",void 0),e([me({type:Boolean})],Ao.prototype,"editingWall",void 0),e([me({attribute:!1})],Ao.prototype,"unitSystem",void 0),e([me({type:Number})],Ao.prototype,"unitsPerMeter",void 0),e([me({attribute:!1})],Ao.prototype,"pinStack",void 0),e([me({attribute:!1})],Ao.prototype,"entityLookup",void 0),e([me({attribute:!1})],Ao.prototype,"selectedOpening",void 0),e([me({attribute:!1})],Ao.prototype,"selectedFurniture",void 0),e([me({type:Boolean})],Ao.prototype,"furnitureLibraryOpen",void 0),e([me({attribute:!1})],Ao.prototype,"rooms",void 0),e([me({attribute:!1})],Ao.prototype,"allAreas",void 0),e([me({attribute:!1})],Ao.prototype,"lightEntities",void 0),e([me({attribute:!1})],Ao.prototype,"coverEntities",void 0),e([me({attribute:!1})],Ao.prototype,"selectedRoomLight",void 0),e([me({attribute:!1})],Ao.prototype,"selectedCoverOpenness",void 0),e([me({attribute:!1})],Ao.prototype,"selectedCoverOpennessRight",void 0),e([me({type:Boolean})],Ao.prototype,"floorCalibrated",void 0),e([me({attribute:!1})],Ao.prototype,"linkableEntities",void 0),e([me({attribute:!1})],Ao.prototype,"selectedItemState",void 0),e([me({attribute:!1})],Ao.prototype,"areaDevices",void 0),e([me({attribute:!1})],Ao.prototype,"pinIconChoices",void 0),e([fe()],Ao.prototype,"_colorOpen",void 0),e([me({type:Boolean})],Ao.prototype,"dirty",void 0),e([me({type:Boolean})],Ao.prototype,"saving",void 0),e([me({type:Boolean})],Ao.prototype,"canUndo",void 0),e([me({type:Boolean})],Ao.prototype,"canRedo",void 0),e([me({type:Boolean})],Ao.prototype,"meshLegend",void 0),e([me({attribute:!1})],Ao.prototype,"meshLinks",void 0),e([me({attribute:!1})],Ao.prototype,"meshStubs",void 0),e([me({attribute:!1})],Ao.prototype,"networkLabel",void 0),e([me({attribute:!1})],Ao.prototype,"selectedMeshLink",void 0),e([me({attribute:!1})],Ao.prototype,"selectedMeshStub",void 0),e([me({attribute:!1})],Ao.prototype,"otherFloors",void 0),e([me({attribute:!1})],Ao.prototype,"alignTargetFloorId",void 0),e([me({type:Boolean})],Ao.prototype,"alignTargetHasBackground",void 0),e([fe()],Ao.prototype,"_wallThicknessUnit",void 0),e([fe()],Ao.prototype,"_openingWidthUnit",void 0),e([fe()],Ao.prototype,"_furnitureSizeUnit",void 0),e([fe()],Ao.prototype,"_splitCoverFor",void 0),e([fe()],Ao.prototype,"_cardCollapsed",void 0),Ao=e([be("canvas-overlay")],Ao);let Vo=class extends he{constructor(){super(...arguments),this.icon="",this.label="",this.open=!1,this.dialog=!1,this.highlight=!1,this.compact=!1,this._top=0,this._right=0,this._onKeyDown=e=>{this.open&&this.dialog&&"Escape"===e.key&&(e.stopPropagation(),this.dispatchEvent(new CustomEvent("toggle",{bubbles:!0,composed:!0})))}}connectedCallback(){super.connectedCallback(),window.addEventListener("keydown",this._onKeyDown,!0)}disconnectedCallback(){window.removeEventListener("keydown",this._onKeyDown,!0),super.disconnectedCallback()}willUpdate(e){if(e.has("open")&&this.open){const e=this.renderRoot.querySelector(".icon-button");if(e){const t=e.getBoundingClientRect();this._top=t.bottom+8,this._right=Math.max(8,window.innerWidth-t.right)}}}render(){return N`
      <button
        class="icon-button ${this.open?"active":""} ${this.highlight?"highlight":""}"
        title=${this.label}
        @click=${()=>this.dispatchEvent(new CustomEvent("toggle",{bubbles:!0,composed:!0}))}
      >
        <ha-icon icon=${this.icon}></ha-icon>
      </button>
      ${this.open&&this.dialog?N`<div
                class="scrim"
                @click=${()=>this.dispatchEvent(new CustomEvent("toggle",{bubbles:!0,composed:!0}))}
              ></div>
              <div class="modal" role="dialog" aria-label=${this.label}>
                <slot></slot>
              </div>`:this.open?N`<div
                class="popover floating-panel"
                style="top:${this._top}px; right:${this._right}px"
              >
                <slot></slot>
              </div>`:K}
    `}};var Fo;Vo.styles=[yt,a`
      :host {
        position: relative;
        display: inline-flex;
      }
      .icon-button {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
      }
      .icon-button ha-icon {
        --mdc-icon-size: 20px;
      }
      .icon-button.active {
        background: rgba(0, 0, 0, 0.06);
      }
      /* The popover's feature is switched on (e.g. a network layer is
       * showing) even while the menu is closed. */
      .icon-button.highlight {
        color: var(--sc-accent);
      }
      /* Settings: a centred modal like HA's own dialogs — dimmed backdrop,
       * large radius; the content brings its own header, body and footer. */
      .scrim {
        position: fixed;
        inset: 0;
        z-index: 99;
        background: rgba(0, 0, 0, 0.32);
      }
      .modal {
        position: fixed;
        z-index: 100;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: min(560px, calc(100vw - 32px));
        max-height: calc(100vh - 32px);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border-radius: 28px;
        background: var(--sc-panel-bg);
        color: var(--sc-fg);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      }
      /* Compact: the row's own button style (40px rounded square). */
      :host([compact]) .icon-button {
        width: 40px;
        height: var(--sc-h-control);
        border: 1px solid var(--sc-divider);
        border-radius: var(--sc-r-control);
        background: var(--sc-panel-bg);
      }
      .modal ::slotted(*) {
        flex: 1 1 auto;
        min-height: 0;
      }
      .popover {
        /* Fixed, placed from the button's rect, so it isn't clipped by a
         * scrolling row it sits in. */
        position: fixed;
        z-index: 10;
        max-height: calc(100vh - 80px);
        overflow-y: auto;
        min-width: 240px;
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
    `],e([me()],Vo.prototype,"icon",void 0),e([me()],Vo.prototype,"label",void 0),e([me({type:Boolean})],Vo.prototype,"open",void 0),e([me({type:Boolean})],Vo.prototype,"dialog",void 0),e([me({type:Boolean})],Vo.prototype,"highlight",void 0),e([me({type:Boolean,reflect:!0})],Vo.prototype,"compact",void 0),e([fe()],Vo.prototype,"_top",void 0),e([fe()],Vo.prototype,"_right",void 0),Vo=e([be("icon-popover")],Vo);let To=Fo=class extends he{constructor(){super(...arguments),this._menuOpen=!1,this.entities=[],this.placedDeviceIds=new Set,this.armedEntityId=null,this.floors=[],this.areas=[],this.currentFloorId=null,this.linkedAreaIds=new Set,this._search="",this._floorFilter=null,this._areaFilter=null,this._onResizeHandlePointerDown=e=>{e.preventDefault();const t=e.clientX,i=this.getBoundingClientRect().width,n=e.currentTarget;n.setPointerCapture(e.pointerId);const o=e=>{const n=t-e.clientX,o=Math.min(Fo.MAX_WIDTH,Math.max(Fo.MIN_WIDTH,i+n));this.style.setProperty("--sc-picker-width",`${o}px`)},r=e=>{n.releasePointerCapture(e.pointerId),n.removeEventListener("pointermove",o),n.removeEventListener("pointerup",r),this._writeStoredWidth(Math.round(this.getBoundingClientRect().width))};n.addEventListener("pointermove",o),n.addEventListener("pointerup",r)},this._onFloorFilterChange=e=>{const t=e.target.value;this._floorFilter="all"===t?"all":t,this._areaFilter&&!this._areasForFilter.some(e=>e.area_id===this._areaFilter)&&(this._areaFilter=null)}}connectedCallback(){super.connectedCallback();const e=this._readStoredWidth();null!==e&&this.style.setProperty("--sc-picker-width",`${e}px`)}_readStoredWidth(){try{const e=localStorage.getItem(Fo.WIDTH_STORAGE_KEY);if(!e)return null;const t=Number(e);return Number.isFinite(t)?Math.min(Fo.MAX_WIDTH,Math.max(Fo.MIN_WIDTH,t)):null}catch{return null}}_writeStoredWidth(e){try{localStorage.setItem(Fo.WIDTH_STORAGE_KEY,String(e))}catch{}}get _effectiveFloorFilter(){return"all"===this._floorFilter?null:this._floorFilter??this.currentFloorId}get _areasForFilter(){const e=this._effectiveFloorFilter;return null===e?this.areas:this.areas.filter(t=>this._areaIsOnFloor(t,e))}_areaIsOnFloor(e,t){return t===ve?null===e.floor_id:e.floor_id===t||t===this.currentFloorId&&this.linkedAreaIds.has(e.area_id)}get _devices(){const e=new Map;for(const t of this.entities){const i=t.device_id??t.entity_id;e.has(i)||e.set(i,[]),e.get(i).push(t)}const t=[];for(const[i,n]of e){const e=xe(i,n)??n[0];t.push({deviceId:i,deviceName:e.device_name??e.name,areaId:e.area_id,areaName:e.area_name,integrationDomain:e.integration_domain,integrationName:e.integration_name,entities:n,primaryEntityId:e.entity_id})}return t.sort((e,t)=>e.deviceName.localeCompare(t.deviceName)),t}_blockedFloorName(e){const t=e.entities.find(t=>t.entity_id===e.primaryEntityId);return t?.placed_floor_id&&t.placed_floor_id!==this.currentFloorId?t.placed_floor_name??t.placed_floor_id:null}get _filtered(){const e=this._search.trim().toLowerCase(),t=this._effectiveFloorFilter,i=this._areaFilter;return this._devices.filter(n=>{if(i){if(n.areaId!==i)return!1}else if(t){const e=this.areas.find(e=>e.area_id===n.areaId);if(!e||!this._areaIsOnFloor(e,t))return!1}return!e||(n.deviceName.toLowerCase().includes(e)||(n.areaName??"").toLowerCase().includes(e)||n.entities.some(t=>t.entity_id.toLowerCase().includes(e)))})}render(){const e=this._filtered;return N`
      <div
        class="resize-handle"
        @pointerdown=${this._onResizeHandlePointerDown}
      ></div>
      <div class="picker-head">
        <span class="picker-title">${He("picker.title")}</span>
        <button
          class="picker-close"
          title=${He("canvas.button.close")}
          @click=${()=>this.dispatchEvent(new CustomEvent("picker-close",{bubbles:!0,composed:!0}))}
        >
          <ha-icon icon="mdi:close"></ha-icon>
        </button>
      </div>
      <div class="search">
        <div class="search-box">
          <ha-icon icon="mdi:magnify"></ha-icon>
          <input
            type="search"
            placeholder=${He("picker.search")}
            .value=${this._search}
            @input=${e=>this._search=e.target.value}
          />
          ${this._search?N`<button
                  class="clear"
                  title=${He("picker.clearSearch")}
                  @click=${()=>this._search=""}
                >
                  <ha-icon icon="mdi:close"></ha-icon>
                </button>`:K}
        </div>
        <div class="filters">
          <span class="select-wrap"
            ><select @change=${this._onFloorFilterChange}>
              <option value="all" ?selected=${"all"===this._floorFilter}>
                ${He("picker.allFloors")}
              </option>
              <option
                value=${ve}
                ?selected=${this._effectiveFloorFilter===ve}
              >
                ${He("picker.outdoor")}
              </option>
              ${this.floors.map(e=>N`<option
                    value=${e.floor_id}
                    ?selected=${this._effectiveFloorFilter===e.floor_id}
                  >
                    ${e.name}
                  </option>`)}</select
            ><ha-icon class="chev" icon="mdi:menu-down"></ha-icon
          ></span>
          <span class="select-wrap"
            ><select
              @change=${e=>this._areaFilter=e.target.value||null}
            >
              <option value="" ?selected=${!this._areaFilter}>
                ${He("picker.allAreas")}
              </option>
              ${this._areasForFilter.map(e=>N`<option
                    value=${e.area_id}
                    ?selected=${this._areaFilter===e.area_id}
                  >
                    ${e.name}
                  </option>`)}</select
            ><ha-icon class="chev" icon="mdi:menu-down"></ha-icon
          ></span>
          ${this.placedDeviceIds.size>0?N`<button
                  class="more-button"
                  title=${He("picker.more")}
                  @click=${()=>this._menuOpen=!this._menuOpen}
                >
                  <ha-icon icon="mdi:dots-vertical"></ha-icon>
                </button>`:K}
        </div>
        ${this._menuOpen&&this.placedDeviceIds.size>0?N`<div class="more-menu floating-panel">
                <button
                  class="menu-item danger"
                  @click=${()=>{this._menuOpen=!1,this.dispatchEvent(new CustomEvent("clear-all-pins",{bubbles:!0,composed:!0}))}}
                >
                  <ha-icon icon="mdi:playlist-remove"></ha-icon>
                  ${He("picker.clearAll")}
                </button>
              </div>`:K}
      </div>
      <div class="list">
        ${0===e.length?N`<div class="empty">${He("picker.noMatches")}</div>`:e.map(e=>{const t=this.placedDeviceIds.has(e.deviceId),i=this._blockedFloorName(e),n=this.armedEntityId===e.primaryEntityId,o=[e.areaName,e.integrationName].filter(e=>!!e).join(" - ");return N`
                  <div
                    class="item ${n?"armed":""} ${t?"placed":""} ${i?"blocked":""}"
                    title=${i?He("picker.alreadyPlaced",{floor:i}):[e.deviceName,o].filter(e=>!!e).join(" · ")}
                    @click=${()=>{i||this.dispatchEvent(new CustomEvent("entity-armed",{detail:{entityId:e.primaryEntityId},bubbles:!0,composed:!0}))}}
                  >
                    <span class="avatar">
                      ${e.integrationDomain?N`<img
                              src="https://brands.home-assistant.io/_/${e.integrationDomain}/icon.png"
                              alt=""
                              @error=${e=>{const t=e.target;t.style.display="none",t.nextElementSibling?.classList.remove("hidden")}}
                            />`:K}
                      <ha-icon
                        icon=${"mdi:devices"}
                        class=${e.integrationDomain?"hidden":""}
                      ></ha-icon>
                    </span>
                    <span class="text">
                      <span class="name">${e.deviceName}</span>
                      ${i?N`<span class="meta"
                              >${He("picker.placedOn",{floor:i})}</span
                            >`:o?N`<span class="meta">${o}</span>`:K}
                      ${t?N`<span class="meta">${He("picker.placed")}</span>`:K}
                    </span>
                  </div>
                `})}
      </div>
    `}};To.styles=[yt,wt,a`
      :host {
        display: flex;
        flex-direction: column;
        position: relative;
        width: var(--sc-picker-width, 300px);
        min-width: 240px;
        max-width: 600px;
        border-left: 1px solid var(--sc-divider);
        background: var(--sc-panel-bg);
        height: 100%;
        overflow: hidden;
      }
      .picker-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 8px 0 16px;
      }
      .picker-title {
        font-size: var(--sc-fs-title);
      }
      .picker-close {
        display: grid;
        place-items: center;
        width: 40px;
        height: 40px;
        padding: 0;
        border-radius: 50%;
      }
      /* Phones: a sheet under the canvas, not a column beside it. */
      @media (max-width: 700px) {
        :host {
          flex: 0 0 45%;
          width: 100%;
          min-width: 0;
          max-width: none;
          height: auto;
          border-left: none;
          border-top: 1px solid var(--sc-divider);
        }
        .resize-handle {
          display: none;
        }
      }
      .resize-handle {
        position: absolute;
        top: 0;
        left: 0;
        width: 6px;
        height: 100%;
        cursor: ew-resize;
        z-index: 1;
      }
      .search {
        padding: 12px;
      }
      .more-button {
        flex: none;
        display: grid;
        place-items: center;
        width: 36px;
        height: var(--sc-h-field);
        padding: 0;
        border: 1px solid var(--sc-divider);
        border-radius: var(--sc-r-control);
        color: var(--sc-fg-secondary);
      }
      .more-menu {
        position: absolute;
        right: 12px;
        z-index: 5;
        margin-top: 4px;
        min-width: 220px;
        padding: 6px;
      }
      .search-box {
        display: flex;
        align-items: center;
        gap: 8px;
        height: var(--sc-h-control);
        padding: 0 12px;
        border: 1px solid var(--sc-divider);
        border-radius: var(--sc-r-control);
        background: var(--sc-bg);
      }
      .search-box:focus-within {
        border-color: var(--sc-accent);
      }
      .search-box .clear {
        display: grid;
        place-items: center;
        width: 24px;
        height: 24px;
        padding: 0;
        border-radius: 50%;
        color: var(--sc-fg-secondary);
      }
      .search-box ha-icon {
        --mdc-icon-size: 18px;
        color: var(--sc-fg-secondary);
        flex-shrink: 0;
      }
      .search-box input {
        flex: 1;
        min-width: 0;
        border: none;
        outline: none;
        background: transparent;
        font-size: var(--sc-fs-body);
        color: var(--sc-fg);
      }
      .filters {
        display: flex;
        gap: 8px;
        margin-top: 8px;
      }
      .filters .select-wrap {
        flex: 1;
      }
      .filters select {
        flex: 1;
        min-width: 0;
        height: var(--sc-h-field);
        padding: 0 12px;
        border: 1px solid var(--sc-divider);
        border-radius: var(--sc-r-control);
        background: var(--sc-bg);
        color: var(--sc-fg);
        font-size: var(--sc-fs-small);
      }
      .list {
        overflow-y: auto;
        flex: 1;
        border-top: 1px solid var(--sc-divider);
      }
      .item {
        display: flex;
        align-items: center;
        gap: 12px;
        min-height: 60px;
        padding: 8px 12px;
        cursor: pointer;
        border-bottom: 1px solid var(--sc-divider);
      }
      .item:hover {
        background: var(--sc-hover);
      }
      .item.armed {
        background: color-mix(in srgb, var(--sc-accent) 18%, transparent);
        color: var(--sc-accent);
      }
      .item.armed .meta {
        color: var(--sc-fg-secondary);
      }
      .item.placed {
        opacity: 0.55;
      }
      .item.blocked {
        opacity: 0.4;
        cursor: not-allowed;
      }
      .item.blocked:hover {
        background: transparent;
      }
      .item .avatar {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: var(--sc-h-field);
        border-radius: 50%;
        background: rgba(127, 127, 127, 0.2);
        flex-shrink: 0;
      }
      .item .avatar ha-icon {
        --mdc-icon-size: 20px;
        color: var(--sc-fg-secondary);
      }
      .item .avatar img {
        width: 24px;
        height: 24px;
        object-fit: contain;
      }
      .item .avatar ha-icon.hidden {
        display: none;
      }
      .item .text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .item .name {
        font-size: var(--sc-fs-body);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .item .meta {
        font-size: var(--sc-fs-caption);
        color: var(--sc-fg-secondary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .empty {
        padding: 16px;
        color: var(--sc-fg-secondary);
        font-size: var(--sc-fs-body);
      }
    `],To.WIDTH_STORAGE_KEY="spatial-context.entityPickerSidebarWidth",To.MIN_WIDTH=240,To.MAX_WIDTH=600,e([fe()],To.prototype,"_menuOpen",void 0),e([me({attribute:!1})],To.prototype,"entities",void 0),e([me({attribute:!1})],To.prototype,"placedDeviceIds",void 0),e([me({attribute:!1})],To.prototype,"armedEntityId",void 0),e([me({attribute:!1})],To.prototype,"floors",void 0),e([me({attribute:!1})],To.prototype,"areas",void 0),e([me({attribute:!1})],To.prototype,"currentFloorId",void 0),e([me({attribute:!1})],To.prototype,"linkedAreaIds",void 0),e([fe()],To.prototype,"_search",void 0),e([fe()],To.prototype,"_floorFilter",void 0),e([fe()],To.prototype,"_areaFilter",void 0),To=Fo=e([be("entity-picker-sidebar")],To);let Ro=class extends he{constructor(){super(...arguments),this.armedKind=null,this.unitSystem="metric",this.customIcons=[],this._query="",this._importError=null,this._category=null}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}_size(e){if("imperial"===this.unitSystem){const t=e=>Math.round(e/2.54);return`${t(e.w)}″ × ${t(e.d)}″`}return`${e.w} × ${e.d} cm`}get _items(){const e=this._query.toLowerCase().split(/\s+/).filter(Boolean);return[...Ti,...Vi].filter(t=>{if(this._category&&t.category!==this._category)return!1;if(0===e.length)return!0;const i=`${t.name} ${He(`furniture.category.${t.category}`)} ${t.id}`.toLowerCase();return e.every(e=>i.includes(e))})}willUpdate(e){e.has("customIcons")&&Ei(this.customIcons)}_saveIcons(e){this._fire("settings-change",{custom_icons:e})}async _import(e){const t=Array.from(e.files??[]);if(e.value="",0===t.length)return;const i=[],n=[];for(const e of t){const t=e.size<=jt?await e.text():"",o=t?Ut(t):null;if(!o){n.push(e.name);continue}const r=o.aspect,s=60;i.push({id:Nt(),name:e.name.replace(/\.svg$/i,"")||"Icon",svg:o.svg,w:r>=1?s:Math.max(5,Math.round(s*r)),d:r>=1?Math.max(5,Math.round(s/r)):s})}this._importError=n.length?He("furniture.importFailed",{names:n.join(", ")}):null,i.length&&(this._saveIcons([...this.customIcons,...i].slice(0,200)),this._category="custom")}_iconOf(e){const t=e.opts.custom;return"custom"===e.category?this.customIcons.find(e=>e.id===t):void 0}_renderItem(e){const t=N`<button
      class="item ${this.armedKind===e.id?"armed":""}"
      title=${e.name}
      @click=${()=>this._fire("furniture-armed",{kind:this.armedKind===e.id?null:e.id})}
    >
      ${this._thumb(e)}
      <span class="name">${e.name}</span>
      <span class="size">${this._size(e)}</span>
    </button>`,i=this._iconOf(e);return i?N`<div class="item-wrap">
      ${t}
      <div class="item-tools">
        <button
          class=${i.colors?"on":""}
          title=${He("furniture.iconColors")}
          aria-pressed=${i.colors?"true":"false"}
          @click=${()=>this._saveIcons(this.customIcons.map(e=>e.id===i.id?{...e,colors:!e.colors}:e))}
        >
          <ha-icon icon="mdi:palette-outline"></ha-icon>
        </button>
        <button
          title=${He("furniture.deleteIcon")}
          @click=${()=>{window.confirm(He("furniture.deleteIconConfirm",{name:i.name}))&&(this.armedKind===e.id&&this._fire("furniture-armed",{kind:null}),this._saveIcons(this.customIcons.filter(e=>e.id!==i.id)))}}
        >
          <ha-icon icon="mdi:delete-outline"></ha-icon>
        </button>
      </div>
    </div>`:t}_thumb(e){const t=.1*Math.max(e.w,e.d);return Z`<svg viewBox="${-t} ${-t} ${e.w+2*t} ${e.d+2*t}" preserveAspectRatio="xMidYMid meet">
      <g transform=${e.flip?`translate(${e.w} 0) scale(-1 1)`:""}>
        ${$i(pi(e.draw,e.w,e.d,e.opts),!1)}
      </g>
    </svg>`}render(){const e=this._items;return N`
      <div class="head">
        <span class="title">${He("furniture.libraryTitle")}</span>
        <span class="head-actions">
          <button
            class="close"
            title=${He("furniture.importSvg")}
            @click=${()=>this.renderRoot.querySelector(".import-file")?.click()}
          >
            <ha-icon icon="mdi:file-upload-outline"></ha-icon>
          </button>
          <button
            class="close"
            title=${He("furniture.close")}
            @click=${()=>this._fire("library-close")}
          >
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </span>
        <input
          class="import-file"
          type="file"
          accept=".svg,image/svg+xml"
          multiple
          @change=${e=>{this._import(e.target)}}
        />
      </div>
      <div class="search">
        <label class="search-box">
          <ha-icon icon="mdi:magnify"></ha-icon>
          <input
            type="search"
            placeholder=${He("furniture.search")}
            .value=${this._query}
            @input=${e=>this._query=e.target.value}
          />
        </label>
      </div>
      <div class="chips">
        <button
          class="chip ${null===this._category?"active":""}"
          @click=${()=>this._category=null}
        >
          ${He("furniture.category.all")}
        </button>
        ${Pi.map(e=>N`<button
              class="chip ${this._category===e.id?"active":""}"
              @click=${()=>this._category=this._category===e.id?null:e.id}
            >
              <ha-icon icon=${e.icon}></ha-icon>
              ${He(`furniture.category.${e.id}`)}
            </button>`)}
      </div>
      ${"custom"===this._category?N`<button
                class="import-button"
                @click=${()=>this.renderRoot.querySelector(".import-file")?.click()}
              >
                <ha-icon icon="mdi:file-upload-outline"></ha-icon>
                ${He("furniture.importSvg")}
              </button>
              <div class="notice">${He("furniture.importHint")}</div>`:K}
      ${this._importError?N`<div class="notice error">${this._importError}</div>`:K}
      <div class="count">
        ${He("furniture.count",{count:e.length})}
      </div>
      <div class="grid">
        ${0===e.length?N`<div class="empty">
                ${He("custom"!==this._category||this._query?"furniture.none":"furniture.noCustom")}
              </div>`:e.map(e=>this._renderItem(e))}
      </div>
      ${K}
    `}};Ro.styles=[yt,a`
      :host {
        display: flex;
        flex-direction: column;
        width: var(--sc-picker-width, 300px);
        min-width: 240px;
        border-left: 1px solid var(--sc-divider);
        background: var(--sc-panel-bg);
        height: 100%;
        overflow: hidden;
      }
      @media (max-width: 700px) {
        :host {
          flex: 0 0 45%;
          width: 100%;
          min-width: 0;
          height: auto;
          border-left: none;
          border-top: 1px solid var(--sc-divider);
        }
      }
      .head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 8px 0 16px;
      }
      .title {
        font-size: var(--sc-fs-title);
      }
      .close {
        display: grid;
        place-items: center;
        width: 40px;
        height: 40px;
        padding: 0;
        border-radius: 50%;
      }
      .search {
        padding: 10px 12px 6px;
      }
      .search-box {
        display: flex;
        align-items: center;
        gap: 8px;
        height: var(--sc-h-control);
        padding: 0 12px;
        border: 1px solid var(--sc-divider);
        border-radius: var(--sc-r-control);
        background: var(--sc-bg);
      }
      .search-box:focus-within {
        border-color: var(--sc-accent);
      }
      .search-box ha-icon {
        --mdc-icon-size: 18px;
        color: var(--sc-fg-secondary);
      }
      .search-box input {
        flex: 1;
        min-width: 0;
        border: none;
        outline: none;
        background: transparent;
        color: var(--sc-fg);
        font: inherit;
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        padding: 0 12px 8px;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        height: 28px;
        padding: 0 10px;
        border: 1px solid var(--sc-divider);
        border-radius: 14px;
        font-size: var(--sc-fs-small, 12px);
        color: var(--sc-fg-secondary);
      }
      .chip ha-icon {
        --mdc-icon-size: 16px;
      }
      .chip.active {
        border-color: var(--sc-accent);
        color: var(--sc-accent);
        background: color-mix(in srgb, var(--sc-accent) 10%, transparent);
      }
      .head-actions {
        display: flex;
        align-items: center;
        gap: 2px;
      }
      .import-file {
        display: none;
      }
      .notice {
        margin: 0 12px 8px;
        font-size: 12px;
        color: var(--sc-fg-secondary);
      }
      .notice.error {
        color: var(--error-color, #db4437);
      }
      .import-button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin: 0 12px 8px;
        height: var(--sc-h-control);
        padding: 0 12px;
        border: 1px dashed var(--sc-divider);
        border-radius: var(--sc-r-control);
        color: var(--sc-fg);
        font: inherit;
        font-size: 13px;
      }
      .import-button:hover {
        border-color: var(--sc-accent);
        color: var(--sc-accent);
      }
      .item-wrap {
        position: relative;
        display: flex;
      }
      .item-wrap .item {
        flex: 1;
        min-width: 0;
      }
      .item-tools {
        position: absolute;
        top: 3px;
        right: 3px;
        display: flex;
        gap: 2px;
      }
      .item-tools button {
        width: 24px;
        height: 24px;
        padding: 0;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: color-mix(in srgb, var(--sc-bg) 85%, transparent);
        color: var(--sc-fg-secondary);
        --mdc-icon-size: 15px;
      }
      .item-tools button:hover {
        color: var(--sc-fg);
        background: var(--sc-hover);
      }
      .item-tools button.on {
        color: var(--sc-accent);
      }
      .grid {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
        gap: 6px;
        padding: 0 12px 12px;
        align-content: start;
      }
      .item {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 2px;
        padding: 6px;
        border: 1px solid var(--sc-divider);
        border-radius: var(--sc-r-control);
        text-align: left;
        color: var(--sc-fg);
      }
      .item:hover {
        background: var(--sc-hover);
      }
      .item.armed {
        border-color: var(--sc-accent);
        box-shadow: inset 0 0 0 1px var(--sc-accent);
      }
      .item svg {
        width: 100%;
        height: 64px;
        color: var(--sc-fg);
        --fx-stroke-width: 1px;
      }
      .name {
        font-size: 12px;
        line-height: 1.25;
      }
      .size {
        font-size: 11px;
        color: var(--sc-fg-secondary);
      }
      .count {
        padding: 0 12px 6px;
        font-size: 11px;
        color: var(--sc-fg-secondary);
      }
      .empty {
        grid-column: 1 / -1;
        padding: 24px 0;
        text-align: center;
        color: var(--sc-fg-secondary);
      }
      ${s(Ci)}
    `],e([me({attribute:!1})],Ro.prototype,"armedKind",void 0),e([me({attribute:!1})],Ro.prototype,"unitSystem",void 0),e([me({attribute:!1})],Ro.prototype,"customIcons",void 0),e([fe()],Ro.prototype,"_query",void 0),e([fe()],Ro.prototype,"_importError",void 0),e([fe()],Ro.prototype,"_category",void 0),Ro=e([be("furniture-library-sidebar")],Ro);const Bo={binary_sensor:{motion:"mdi:motion-sensor",occupancy:"mdi:motion-sensor",presence:"mdi:account-eye",door:"mdi:door",garage_door:"mdi:garage",window:"mdi:window-closed-variant",opening:"mdi:door-open",moisture:"mdi:water-alert",smoke:"mdi:smoke-detector",gas:"mdi:gas-cylinder",carbon_monoxide:"mdi:molecule-co",vibration:"mdi:vibrate",sound:"mdi:microphone",lock:"mdi:lock",plug:"mdi:power-plug",battery:"mdi:battery-alert"},sensor:{temperature:"mdi:thermometer",humidity:"mdi:water-percent",illuminance:"mdi:brightness-5",power:"mdi:flash",energy:"mdi:lightning-bolt",battery:"mdi:battery",carbon_dioxide:"mdi:molecule-co2",pm25:"mdi:air-filter",pressure:"mdi:gauge",moisture:"mdi:water",signal_strength:"mdi:wifi"},cover:{garage:"mdi:garage",gate:"mdi:gate",door:"mdi:door",window:"mdi:window-shutter",blind:"mdi:blinds",shade:"mdi:roller-shade",curtain:"mdi:curtains",shutter:"mdi:window-shutter",awning:"mdi:awning-outline"},media_player:{tv:"mdi:television",speaker:"mdi:speaker",receiver:"mdi:audio-video"},switch:{outlet:"mdi:power-socket-us"}},Eo={light:"mdi:lightbulb",switch:"mdi:toggle-switch-variant",climate:"mdi:thermostat",media_player:"mdi:speaker",lock:"mdi:lock",cover:"mdi:blinds",fan:"mdi:fan",vacuum:"mdi:robot-vacuum",alarm_control_panel:"mdi:shield-home",valve:"mdi:valve",humidifier:"mdi:air-humidifier",siren:"mdi:alarm-light",water_heater:"mdi:water-boiler",camera:"mdi:cctv",assist_satellite:"mdi:account-voice",device_tracker:"mdi:map-marker-radius",binary_sensor:"mdi:checkbox-marked-circle-outline",sensor:"mdi:gauge",button:"mdi:gesture-tap-button",update:"mdi:package-up"},Do={light:["mdi:lightbulb","mdi:ceiling-light","mdi:lamp","mdi:floor-lamp","mdi:wall-sconce","mdi:led-strip-variant","mdi:light-recessed","mdi:chandelier"],switch:["mdi:toggle-switch-variant","mdi:power-socket-us","mdi:light-switch","mdi:power-plug","mdi:fan","mdi:coffee-maker"],media_player:["mdi:speaker","mdi:television","mdi:cast","mdi:audio-video","mdi:soundbar","mdi:speaker-wireless"],cover:["mdi:blinds","mdi:roller-shade","mdi:curtains","mdi:window-shutter","mdi:garage","mdi:gate"],binary_sensor:["mdi:motion-sensor","mdi:door","mdi:window-closed-variant","mdi:water-alert","mdi:smoke-detector","mdi:vibrate"],sensor:["mdi:thermometer","mdi:water-percent","mdi:brightness-5","mdi:flash","mdi:gauge","mdi:air-filter"],climate:["mdi:thermostat","mdi:air-conditioner","mdi:radiator","mdi:heat-pump"],fan:["mdi:fan","mdi:ceiling-fan","mdi:air-purifier"]},zo=["mdi:devices","mdi:chip","mdi:router-wireless","mdi:access-point","mdi:zigbee","mdi:remote"];function Oo(e){if(!e)return"mdi:devices";return(e.device_class?Bo[e.domain]?.[e.device_class]:void 0)??Eo[e.domain]??"mdi:devices"}const jo=e=>e.map(([e,t])=>`${Math.round(e)},${Math.round(t)}`).join(" "),Uo=e=>{const t=jo(e.points),i=jo([...e.points].reverse());return t<i?t:i},Wo=e=>`${e.type}|${e.wallId}|${Math.round(e.x)}|${Math.round(e.y)}|${Math.round(e.width)}`,No=e=>(e.cover_entity_id?2:0)+(e.cover_right_entity_id?2:0)+(e.garage?1:0)+(e.daylight&&Object.keys(e.daylight).length>0?1:0);function Zo(e,t){const i=new Map;for(const t of e)i.set(Uo(t),t);const n=new Map;for(const t of e){const e=i.get(Uo(t));e.id!==t.id&&n.set(t.id,e.id)}const o=t.map(e=>{const t=n.get(e.wallId);return t?{...e,wallId:t}:e}),r=new Map;for(const e of o){const t=Wo(e),i=r.get(t);(!i||No(e)>=No(i))&&r.set(t,e)}const s=new Set([...r.values()].map(e=>e.id)),a=e.filter(e=>!n.has(e.id)),l=o.filter(e=>s.has(e.id));return a.length===e.length&&l.length===t.length?null:{walls:a,openings:l}}let Go=class extends he{constructor(){super(...arguments),this.mode="select",this.mapActive=!1,this.mapRotation=0,this.selectedPinLabel=null,this.selectedPinDefaultLabel=null,this.selectedPinOverride=null,this.selectedPinDeviceId=null,this.meshLinks=[],this.networkLabel=null,this.dirty=!1,this.saving=!1,this.canUndo=!1,this.canRedo=!1,this.meshLegend=!1,this.selectedMeshLink=null,this.buildings=[],this.scaleReadout=null,this.scaleWarning=null,this.armedBuildingKey=null,this.selectedPlacement=null,this.floorNameById=new Map,this._cardCollapsed=!1,this._card=e=>yo({...e,collapsed:this._cardCollapsed,onToggle:()=>this._cardCollapsed=!this._cardCollapsed})}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}_selectedLabel(){const e=this.selectedPlacement;return e?e.label_override||this.floorNameById.get(e.floor_id)||e.floor_id:""}_renderPinPanel(){return null===this.selectedPinLabel?K:this._card({title:this.selectedPinLabel,subtitle:He("property.outdoorDevice"),onClose:()=>this._fire("selection-clear"),body:N`<div class="info-group">
          ${wo("mdi:tag-text",He("canvas.card.label"),N`<input
              type="text"
              class="text-field"
              placeholder=${this.selectedPinDefaultLabel??""}
              .value=${this.selectedPinOverride??""}
              @change=${e=>this._fire("outdoor-pin-label-change",{label:e.target.value})}
            />`)}
          ${ko("mdi:shape",He("property.setIcon"),()=>this._fire("outdoor-pin-icon-click"))}
        </div>
        ${this._renderDeviceNetwork()}`,footer:Mo(He("property.removeFromProperty"),()=>this._fire("outdoor-pin-delete-click"))})}_renderDeviceNetwork(){const e=this.selectedPinDeviceId;if(!this.networkLabel||!e)return K;const t=this.meshLinks.filter(t=>t.from.deviceId===e||t.to.deviceId===e).map(t=>{const i=t.from.deviceId===e?t.to:t.from;return{name:i.label,where:i.floorId?this.floorNameById.get(i.floorId)??"":"",quality:t.quality,detail:t.detail??t.quality}});return $o(this.networkLabel,t)}_renderMapPanel(){if("map"!==this.mode)return K;const e=Math.round(10*this.mapRotation)/10,t=e=>this._fire("map-rotation-set",{deg:e});return N`
      <div class="tool-row sub">
        <div class="hint-bar">
          <span class="hint">${He("mapBackground.adjustHint")}</span>
          <button
            title=${He("mapBackground.zoomOut")}
            @click=${()=>this._fire("map-zoom-step",{factor:1/1.1})}
          >
            <ha-icon icon="mdi:magnify-minus-outline"></ha-icon>
          </button>
          <button
            title=${He("mapBackground.zoomIn")}
            @click=${()=>this._fire("map-zoom-step",{factor:1.1})}
          >
            <ha-icon icon="mdi:magnify-plus-outline"></ha-icon>
          </button>
          <span class="hint">${He("mapBackground.rotation")}</span>
          <input
            type="range"
            min="-180"
            max="180"
            step="0.5"
            style="--pct:${(e+180)/360*100}%"
            .value=${String(e)}
            @input=${e=>t(Number(e.target.value))}
          />
          <input
            type="number"
            min="-180"
            max="180"
            step="0.5"
            .value=${String(e)}
            @change=${e=>{const i=Number(e.target.value);Number.isFinite(i)&&t(i)}}
          />°
          <button
            title=${He("mapBackground.resetRotation")}
            @click=${()=>t(0)}
          >
            <ha-icon icon="mdi:compass-outline"></ha-icon>
          </button>
          <button
            class="primary"
            @click=${()=>this._fire("property-mode-change",{mode:"select"})}
          >
            ${He("mapBackground.done")}
          </button>
        </div>
      </div>
    `}_renderMeshLinkPanel(){const e=this.selectedMeshLink;if(!e)return K;const t=[e.from,e.to].find(e=>null!==e.floorId);return this._card({title:`${e.from.label} → ${e.to.label}`,subtitle:He("property.link"),onClose:()=>this._fire("selection-clear"),body:N`<div class="info-group">
        ${wo("mdi:signal",He("canvas.card.quality"),N`<span style="color:${ye(e.quality)}"
            >${e.detail??e.quality}</span
          >`)}
        ${t?ko("mdi:arrow-right-circle",He("property.goToFloorOf",{name:t.label}),()=>this._fire("property-mesh-goto-floor-click",{floorId:t.floorId})):K}
      </div>`})}_renderPlacementPanel(){return this.selectedPlacement?this._card({title:this._selectedLabel(),subtitle:He("property.building"),onClose:()=>this._fire("selection-clear"),body:N`<div class="info-group">
        ${wo("mdi:tag-text",He("canvas.card.name"),N`<input
            type="text"
            class="text-field"
            .value=${this._selectedLabel()}
            @change=${e=>this._fire("placement-label-change",{label:e.target.value})}
          />`)}
        ${ko("mdi:arrow-right-circle",He("property.goToFloor"),()=>this._fire("placement-goto-floor-click"))}
      </div>`,footer:Mo(He("property.deletePlacement"),()=>this._fire("placement-delete-click"))}):K}_renderScaleNotice(){const e=this.scaleWarning??(null===this.scaleReadout?He("property.notCalibrated"):null);return null===e?K:N`<div class="scale-corner">
      <div
        class="scale-chip floating-panel"
        title=${null===this.scaleReadout?He("property.calibrateHint"):e}
      >
        <ha-icon
          class=${this.scaleWarning?"warn":""}
          icon=${this.scaleWarning?"mdi:alert":"mdi:ruler"}
        ></ha-icon>
        ${e}
      </div>
    </div>`}render(){return N`
      <div class="tool-row">
        <div class="mode-toolbar">
          <button
            class=${"select"===this.mode?"active":""}
            title=${He("property.select")}
            @click=${()=>this._fire("property-mode-change",{mode:"select"})}
          >
            <ha-icon icon="mdi:cursor-default-click"></ha-icon>
          </button>
          <button
            class=${"place-pin"===this.mode?"active":""}
            title=${He("property.placeOutdoor")}
            @click=${()=>this._fire("property-mode-change",{mode:"place-pin"===this.mode?"select":"place-pin"})}
          >
            <ha-icon icon="mdi:map-marker-plus"></ha-icon>
          </button>
          ${this.mapActive?N`<button
                  class=${"map"===this.mode?"active":""}
                  title=${He("mapBackground.adjust")}
                  @click=${()=>this._fire("property-mode-change",{mode:"map"===this.mode?"select":"map"})}
                >
                  <ha-icon icon="mdi:map-search"></ha-icon>
                </button>`:K}
          <span class="tool-divider"></span>
          <span class="select-wrap"
            ><select
              class="place-picker"
              title=${He("property.placeBuildingTip")}
              .value=${this.armedBuildingKey??""}
              @change=${e=>{const t=e.target.value;t&&this._fire("placement-arm",{key:t})}}
            >
              <option value="">${He("property.placeBuilding")}</option>
              ${this.buildings.map(e=>N`<option value=${e.key}>${e.name}</option>`)}</select
            ><ha-icon class="chev" icon="mdi:menu-down"></ha-icon
          ></span>
        </div>

        <slot name="row-end"></slot>
        <row-actions
          .dirty=${this.dirty}
          .saving=${this.saving}
          .canUndo=${this.canUndo}
          .canRedo=${this.canRedo}
        ></row-actions>
      </div>

      ${this._renderMapPanel()} ${this._renderScaleNotice()}
      ${this.meshLegend&&"map"!==this.mode?Io():K}
      ${this._renderPinPanel()} ${this._renderMeshLinkPanel()}
      ${this._renderPlacementPanel()}
    `}};Go.styles=[yt,wt,Lt,$t,vo,Mt,Po,a`
      :host {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }
      .mode-toolbar {
        pointer-events: auto;
      }
      .mode-toolbar button {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 10px;
        border-radius: 10px;
      }
      .tool-divider {
        align-self: stretch;
        width: 1px;
        margin: 6px 4px;
        background: var(--sc-divider);
      }
      .mode-toolbar ha-icon,
      .selection-panel ha-icon {
        --mdc-icon-size: 20px;
      }
      .mode-toolbar button.active {
        background: color-mix(in srgb, var(--sc-accent) 22%, transparent);
        color: var(--sc-accent);
      }
      .mode-toolbar button.active ha-icon {
        color: var(--sc-accent);
      }
      .place-picker {
        border: 1px solid var(--sc-divider);
        border-radius: var(--sc-r-control);
        background: var(--sc-bg);
        color: var(--sc-fg);
        font-family: inherit;
        font-size: var(--sc-fs-body);
        padding: 6px 14px;
      }
      .hint {
        font-size: var(--sc-fs-small);
        color: var(--sc-fg-secondary);
      }
    `],e([me({attribute:!1})],Go.prototype,"mode",void 0),e([me({attribute:!1})],Go.prototype,"mapActive",void 0),e([me({attribute:!1})],Go.prototype,"mapRotation",void 0),e([me({attribute:!1})],Go.prototype,"selectedPinLabel",void 0),e([me({attribute:!1})],Go.prototype,"selectedPinDefaultLabel",void 0),e([me({attribute:!1})],Go.prototype,"selectedPinOverride",void 0),e([me({attribute:!1})],Go.prototype,"selectedPinDeviceId",void 0),e([me({attribute:!1})],Go.prototype,"meshLinks",void 0),e([me({attribute:!1})],Go.prototype,"networkLabel",void 0),e([me({type:Boolean})],Go.prototype,"dirty",void 0),e([me({type:Boolean})],Go.prototype,"saving",void 0),e([me({type:Boolean})],Go.prototype,"canUndo",void 0),e([me({type:Boolean})],Go.prototype,"canRedo",void 0),e([me({type:Boolean})],Go.prototype,"meshLegend",void 0),e([me({attribute:!1})],Go.prototype,"selectedMeshLink",void 0),e([me({attribute:!1})],Go.prototype,"buildings",void 0),e([me({attribute:!1})],Go.prototype,"scaleReadout",void 0),e([me({attribute:!1})],Go.prototype,"scaleWarning",void 0),e([me({attribute:!1})],Go.prototype,"armedBuildingKey",void 0),e([me({attribute:!1})],Go.prototype,"selectedPlacement",void 0),e([me({attribute:!1})],Go.prototype,"floorNameById",void 0),e([fe()],Go.prototype,"_cardCollapsed",void 0),Go=e([be("property-overlay")],Go);const Ko=new Set(["the","and","with","power","light","plug"]);let qo=null;function Yo(e,t,i){const n=t.toLowerCase().split(/[\s:]+/).filter(Boolean);if(0===n.length)return[];const o=n.join("-"),r=[];for(const[t,i]of e){const e=n.filter(e=>t.includes(e)).length,s=n.filter(e=>t.includes(e)||i.includes(e)).length;if(0===s)continue;const a=t===o?0:t.startsWith(n[0])?1:e===n.length?2:3-e/n.length;r.push([4*(n.length-s)+a,t])}return r.sort((e,t)=>e[0]-t[0]||e[1].length-t[1].length||e[1].localeCompare(t[1])),r.slice(0,i).map(([,e])=>e)}let Qo=class extends he{constructor(){super(...arguments),this.value=null,this.suggestFrom="",this._query="",this._index=null,this._error=null,this._onBackdropClick=()=>this._fire("icon-picker-cancel"),this._onKeyDown=e=>{if("Escape"===e.key)e.stopPropagation(),this._fire("icon-picker-cancel");else if("Enter"===e.key){const e=this._results[0];e&&this._fire("icon-picked",{icon:`mdi:${e}`})}}}connectedCallback(){super.connectedCallback(),this.addEventListener("click",this._onBackdropClick),(qo??(qo=fetch("/spatial_context/mdi-index.json?v=0.15.0-beta.1+mve0sfhy").then(e=>{if(!e.ok)throw new Error(`HTTP ${e.status}`);return e.json()}).catch(e=>{throw qo=null,e})),qo).then(e=>this._index=e,e=>this._error=e?.message??"couldn't load icons")}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("click",this._onBackdropClick)}firstUpdated(e){this._input?.focus()}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}get _results(){const e=this._index;if(!e)return[];if(this._query.trim())return Yo(e,this._query,160);const t=new Set;for(const i of this.suggestFrom.toLowerCase().split(/[^a-z0-9]+/))if(!(i.length<3||Ko.has(i))){for(const n of Yo(e,i,12))t.add(n);if(t.size>=60)break}return[...t]}render(){const e=this._results,t=this.value?.replace(/^mdi:/,"")??null;return N`
      <div
        class="dialog floating-panel"
        role="dialog"
        aria-label=${He("iconPicker.title")}
        @click=${e=>e.stopPropagation()}
        @keydown=${this._onKeyDown}
      >
        <div class="title">${He("iconPicker.title")}</div>
        <input
          type="search"
          placeholder=${He("iconPicker.search")}
          .value=${this._query}
          @input=${e=>this._query=e.target.value}
        />
        ${this._error?N`<span class="hint"
                >${He("iconPicker.loadError",{error:this._error})}</span
              >`:this._index?0===e.length?N`<span class="hint"
                    >${this._query.trim()?He("iconPicker.noMatch"):He("iconPicker.typeToSearch")}</span
                  >`:K:N`<span class="hint"
                  >${He("iconPicker.loading")}</span
                >`}
        <div class="grid">
          ${e.map(e=>N`<button
                class="icon-choice ${e===t?"current":""}"
                title=${`mdi:${e}`}
                @click=${()=>this._fire("icon-picked",{icon:`mdi:${e}`})}
              >
                <ha-icon icon=${`mdi:${e}`}></ha-icon>
                <span>${e}</span>
              </button>`)}
        </div>
        <div class="actions">
          <button
            ?disabled=${!this.value}
            @click=${()=>this._fire("icon-picked",{icon:null})}
          >
            ${He("iconPicker.useDefault")}
          </button>
          <button @click=${()=>this._fire("icon-picker-cancel")}>
            ${He("iconPicker.cancel")}
          </button>
        </div>
      </div>
    `}};Qo.styles=[yt,a`
      :host {
        position: fixed;
        inset: 0;
        z-index: 20;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.45);
      }
      .dialog {
        width: min(560px, calc(100vw - 32px));
        max-height: min(640px, calc(100vh - 32px));
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px;
      }
      .title {
        font-size: var(--sc-fs-title);
        font-weight: 500;
      }
      input[type="search"] {
        width: 100%;
        box-sizing: border-box;
        height: var(--sc-h-field);
        padding: 0 12px;
        font: inherit;
        font-size: var(--sc-fs-body);
        color: var(--sc-fg);
        background: var(--sc-bg);
        border: 1px solid var(--sc-divider);
        border-radius: var(--sc-r-control);
      }
      .grid {
        flex: 1;
        min-height: 160px;
        overflow-y: auto;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
        gap: 4px;
      }
      .icon-choice {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 8px 4px;
        border-radius: 8px;
        min-width: 0;
      }
      .icon-choice.current {
        outline: 2px solid var(--sc-accent);
      }
      .icon-choice ha-icon {
        --mdc-icon-size: 28px;
      }
      .icon-choice span {
        font-size: var(--sc-fs-caption);
        color: var(--sc-fg-secondary);
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .hint {
        font-size: var(--sc-fs-small);
        color: var(--sc-fg-secondary);
      }
      .actions {
        display: flex;
        justify-content: space-between;
        gap: 8px;
      }
    `],e([me({attribute:!1})],Qo.prototype,"value",void 0),e([me({attribute:!1})],Qo.prototype,"suggestFrom",void 0),e([fe()],Qo.prototype,"_query",void 0),e([fe()],Qo.prototype,"_index",void 0),e([fe()],Qo.prototype,"_error",void 0),e([_e("input[type=search]")],Qo.prototype,"_input",void 0),Qo=e([be("icon-picker-dialog")],Qo);let Xo=class extends he{constructor(){super(...arguments),this.weatherEntities=[],this.coordinatorChoices=[]}_change(e){this.dispatchEvent(new CustomEvent("settings-change",{detail:e,bubbles:!0,composed:!0}))}_switch(e,t,i){return N`<input
      type="checkbox"
      class="switch"
      role="switch"
      aria-label=${t}
      .checked=${e}
      @change=${e=>i(e.target.checked)}
    />`}_segmented(e,t,i){return N`<div class="segmented" role="radiogroup">
      ${t.map(([t,n])=>N`<button
            role="radio"
            aria-checked=${t===e?"true":"false"}
            class=${t===e?"active":""}
            @click=${()=>t!==e&&i(t)}
          >
            ${n}
          </button>`)}
    </div>`}_row(e,t,i){return N`<div class="row">
      <div>
        <div class="label">${e}</div>
        ${i?N`<div class="description">${i}</div>`:K}
      </div>
      ${t}
    </div>`}render(){const e=this.settings,t=e.zigbee_coordinator_device_id,i=this.coordinatorChoices.some(e=>e.deviceId===t);return N`
      <div class="header">
        <button
          title=${He("settings.close")}
          @click=${()=>this.dispatchEvent(new CustomEvent("settings-close",{bubbles:!0,composed:!0}))}
        >
          <ha-icon icon="mdi:close"></ha-icon>
        </button>
        <span>${He("settings.title")}</span>
      </div>
      <div class="body">
        <div class="section">
          <div class="section-title">${He("settings.editing")}</div>
          ${this._row(He("settings.autoSave"),this._switch(e.auto_save,He("settings.autoSave"),e=>this._change({auto_save:e})),He("settings.autoSaveHint"))}
          ${this._row(He("settings.units"),this._segmented(e.unit_system,[["metric",He("settings.metric")],["imperial",He("settings.imperial")]],e=>this._change({unit_system:e})))}
          ${this._row(He("settings.floorOrder"),this._segmented(e.floor_order,[["top_down",He("settings.topFirst")],["ground_up",He("settings.groundFirst")]],e=>this._change({floor_order:e})))}
        </div>

        <div class="section">
          <div class="section-title">${He("settings.zigbeeMesh")}</div>
          ${this._row(He("settings.coordinator"),N`<span class="select-wrap"
              ><select
                aria-label=${He("settings.coordinatorAria")}
                @change=${e=>this._change({zigbee_coordinator_device_id:e.target.value||null})}
              >
                <option value="" ?selected=${!t}>
                  ${He("settings.bridge")}
                </option>
                ${t&&!i?N`<option value=${t} selected>
                        ${He("settings.notPlaced")}
                      </option>`:K}
                ${this.coordinatorChoices.map(({deviceId:e,label:i})=>N`<option
                      value=${e}
                      ?selected=${e===t}
                    >
                      ${i}
                    </option>`)}</select
              ><ha-icon class="chev" icon="mdi:menu-down"></ha-icon
            ></span>`,He("settings.coordinatorHint"))}
          ${this._row(He("settings.scanTimeout"),N`<span class="number"
              ><input
                type="number"
                min="30"
                max="600"
                step="10"
                aria-label=${He("settings.scanTimeoutAria")}
                .value=${String(e.zigbee_timeout_seconds)}
                @change=${e=>{const t=Number(e.target.value);Number.isFinite(t)&&this._change({zigbee_timeout_seconds:Math.min(600,Math.max(30,Math.round(t)))})}}
              />s</span
            >`,He("settings.scanTimeoutHint"))}
        </div>

        <div class="section">
          <div class="section-title">${He("settings.plan")}</div>
          ${this._row(He("settings.lightCount"),this._switch(!1!==e.show_light_count,He("settings.lightCount"),e=>this._change({show_light_count:e})),He("settings.lightCountHint"))}
          ${this._row(He("settings.labelSize",{size:Math.round(e.room_label_size??16)}),N`<input
              type="range"
              min="6"
              max="48"
              step="1"
              .value=${String(e.room_label_size??16)}
              @input=${e=>this._change({room_label_size:Number(e.target.value)})}
            />`)}
          ${this._row(He("settings.labelColor"),N`<span class="border-color">
              ${e.room_label_color?N`<button
                      class="border-reset"
                      @click=${()=>this._change({room_label_color:null})}
                    >
                      ${He("settings.labelColorTheme")}
                    </button>`:N`<span class="description"
                      >${He("settings.labelColorTheme")}</span
                    >`}
              <input
                type="color"
                aria-label=${He("settings.labelColor")}
                .value=${e.room_label_color??"#2f343a"}
                @input=${e=>this._change({room_label_color:e.target.value})}
              />
            </span>`)}
          ${this._row(He("settings.labelBold"),this._switch(!0===e.room_label_bold,He("settings.labelBold"),e=>this._change({room_label_bold:e})))}
          ${this._row(He("settings.labelHalo"),this._switch(!1!==e.room_label_halo,He("settings.labelHalo"),e=>this._change({room_label_halo:e})),He("settings.labelHaloHint"))}
          ${!1!==e.room_label_halo?N`${this._row(He("settings.labelHaloWidth",{px:e.room_label_halo_width??3}),N`<input
                    type="range"
                    min="0.5"
                    max="12"
                    step="0.5"
                    .value=${String(e.room_label_halo_width??3)}
                    @input=${e=>this._change({room_label_halo_width:Number(e.target.value)})}
                  />`)}
                ${this._row(He("settings.labelHaloColor"),N`<span class="border-color">
                    ${e.room_label_halo_color?N`<button
                            class="border-reset"
                            @click=${()=>this._change({room_label_halo_color:null})}
                          >
                            ${He("settings.labelHaloColorAuto")}
                          </button>`:N`<span class="description"
                            >${He("settings.labelHaloColorAuto")}</span
                          >`}
                    <input
                      type="color"
                      aria-label=${He("settings.labelHaloColor")}
                      .value=${e.room_label_halo_color??"#ffffff"}
                      @input=${e=>this._change({room_label_halo_color:e.target.value})}
                    />
                  </span>`)}`:""}
          ${this._row(He("settings.scaleLine"),this._switch(!1!==e.show_scale_line,He("settings.scaleLine"),e=>this._change({show_scale_line:e})),He("settings.scaleLineHint"))}
          ${this._row(He("settings.fillUnder"),this._switch(!0===e.room_fill_under_background,He("settings.fillUnder"),e=>this._change({room_fill_under_background:e})),He("settings.fillUnderHint"))}
          ${this._row(He("settings.roomBorders"),this._switch(!1!==e.room_border_show,He("settings.roomBorders"),e=>this._change({room_border_show:e})),He("settings.roomBordersHint"))}
          ${!1!==e.room_border_show?N`
                  ${this._row(He("settings.roomBorderColor"),N`<span class="border-color">
                      ${e.room_border_color?N`<button
                              class="border-reset"
                              @click=${()=>this._change({room_border_color:null})}
                            >
                              ${He("settings.roomBorderColorRoom")}
                            </button>`:N`<span class="description"
                              >${He("settings.roomBorderColorRoom")}</span
                            >`}
                      <input
                        type="color"
                        aria-label=${He("settings.roomBorderColor")}
                        .value=${e.room_border_color??"#03a9f4"}
                        @input=${e=>this._change({room_border_color:e.target.value})}
                      />
                    </span>`)}
                  ${this._row(He("settings.roomBorderWidth",{px:(e.room_border_width??2).toFixed(1)}),N`<input
                      type="range"
                      min="0.25"
                      max="8"
                      step="0.25"
                      .value=${String(e.room_border_width??2)}
                      @input=${e=>this._change({room_border_width:Number(e.target.value)})}
                    />`)}
                  ${this._row(He("settings.roomBorderOpacity",{pct:Math.round(100*(e.room_border_opacity??1))}),N`<input
                      type="range"
                      min="0.05"
                      max="1"
                      step="0.05"
                      .value=${String(e.room_border_opacity??1)}
                      @input=${e=>this._change({room_border_opacity:Number(e.target.value)})}
                    />`)}
                `:K}
        </div>

        <div class="section">
          <div class="section-title">${He("settings.daylight")}</div>
          ${this._row(He("settings.weather"),N`<select
              aria-label=${He("settings.weather")}
              @change=${e=>this._change({weather_entity_id:e.target.value||null})}
            >
              <option value="" ?selected=${!e.weather_entity_id}>
                ${He("settings.weatherAuto")}
              </option>
              <option value="none" ?selected=${"none"===e.weather_entity_id}>
                ${He("settings.weatherNone")}
              </option>
              ${this.weatherEntities.map(t=>N`<option
                    value=${t.entity_id}
                    ?selected=${t.entity_id===e.weather_entity_id}
                  >
                    ${t.name}
                  </option>`)}
            </select>`,He("settings.weatherHint"))}
        </div>

        <div class="section">
          <div class="section-title">
            ${He("settings.troubleshooting")}
          </div>
          ${this._row(He("settings.debugLogging"),this._switch(e.debug_logging,He("settings.debugLogging"),e=>this._change({debug_logging:e})),He("settings.debugLoggingHint"))}
        </div>

        <div class="section">
          <div class="section-title">${He("settings.about")}</div>
          ${this._row(He("settings.version"),N`<span class="description">v${"0.15.0-beta.1"}</span>`)}
          ${this._row(He("settings.github"),N`<a
              class="link"
              href="https://github.com/Greminn/ha-spatial-context"
              target="_blank"
              rel="noopener noreferrer"
              >Greminn/ha-spatial-context
              <ha-icon icon="mdi:open-in-new"></ha-icon
            ></a>`)}
        </div>
      </div>
      <div class="footer">
        <button
          class="done"
          @click=${()=>this.dispatchEvent(new CustomEvent("settings-close",{bubbles:!0,composed:!0}))}
        >
          ${He("settings.done")}
        </button>
      </div>
    `}};Xo.styles=[yt,wt,xt,a`
      :host {
        display: flex;
        flex-direction: column;
        min-height: 0;
        max-height: calc(100vh - 32px);
        font-size: var(--sc-fs-row);
      }
      .header {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px 24px 8px 16px;
        font-size: var(--sc-fs-dialog);
        font-weight: 500;
      }
      .body {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding-bottom: 8px;
      }
      .footer {
        display: flex;
        justify-content: flex-end;
        padding: 12px 24px 20px;
      }
      a.link {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--sc-accent);
        text-decoration: none;
        font-size: var(--sc-fs-body);
      }
      a.link:hover {
        text-decoration: underline;
      }
      a.link ha-icon {
        --mdc-icon-size: 16px;
      }
      .done {
        height: 48px;
        padding: 0 28px;
        border-radius: 24px;
        background: var(--sc-accent);
        color: var(--text-primary-color, #fff);
        font-size: var(--sc-fs-row);
        font-weight: 500;
      }
      .header button {
        display: grid;
        place-items: center;
        width: 40px;
        height: var(--sc-h-control);
        padding: 0;
        border-radius: 50%;
      }
      .section {
        padding: 4px 0;
      }
      .section + .section {
        margin-top: 4px;
      }
      .section-title {
        padding: 16px 24px 4px;
        font-size: var(--sc-fs-caption);
        font-weight: 400;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--sc-fg-secondary);
      }
      .row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
        gap: 16px;
        padding: 8px 24px;
        min-height: 44px;
      }
      .label {
        color: var(--sc-fg);
        line-height: 1.3;
      }
      .description {
        margin-top: 2px;
        font-size: var(--sc-fs-caption);
        line-height: 1.3;
        color: var(--sc-fg-secondary);
      }

      /* Two-option segmented control. */
      .segmented {
        display: inline-flex;
        border: 1px solid var(--sc-divider);
        border-radius: var(--sc-r-control);
        overflow: hidden;
      }
      .segmented button {
        padding: 6px 14px;
        border-radius: 0;
        font-size: var(--sc-fs-small);
        font-weight: 400;
        text-transform: none;
        letter-spacing: normal;
        color: var(--sc-fg);
        background: transparent;
        white-space: nowrap;
      }
      .segmented button + button {
        border-left: 1px solid var(--sc-divider);
      }
      .segmented button.active {
        background: color-mix(in srgb, var(--sc-accent) 22%, transparent);
        color: var(--sc-accent);
      }

      select,
      input[type="number"] {
        font: inherit;
        font-size: var(--sc-fs-small);
        color: var(--sc-fg);
        background: var(--sc-bg);
        border: 1px solid var(--sc-divider);
        border-radius: var(--sc-r-control);
        padding: 6px 12px;
      }
      select {
        max-width: 170px;
        height: var(--sc-h-field);
      }
      input[type="number"] {
        height: var(--sc-h-field);
        -moz-appearance: textfield;
      }
      input[type="number"]::-webkit-inner-spin-button,
      input[type="number"]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      .number {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: var(--sc-fg-secondary);
        font-size: var(--sc-fs-small);
      }
      input[type="number"] {
        width: 64px;
        text-align: right;
      }
      .border-color {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .border-reset {
        height: 28px;
        padding: 0 8px;
        border: 1px solid var(--sc-divider);
        border-radius: var(--sc-r-control);
        font-size: 12px;
        color: var(--sc-fg-secondary);
      }
    `],e([me({attribute:!1})],Xo.prototype,"settings",void 0),e([me({attribute:!1})],Xo.prototype,"weatherEntities",void 0),e([me({attribute:!1})],Xo.prototype,"coordinatorChoices",void 0),Xo=e([be("settings-menu")],Xo);const Jo=.17,er=.15,tr=(e,t,i)=>e.ka*t+e.kc*i+e.k;function ir(e){const t=[{ka:0,kc:-e.pitch,k:e.eave1+er+e.pitch*e.c1}];e.shed||t.push({ka:0,kc:e.pitch,k:e.eave0+er-e.pitch*e.c0});const i=Math.min(e.eave0,e.eave1)+er;return"hip"===e.ends[0]&&t.push({ka:e.pitch,kc:0,k:i-e.pitch*e.a0}),"hip"===e.ends[1]&&t.push({ka:-e.pitch,kc:0,k:i+e.pitch*e.a1}),t}function nr(e,t,i){return Math.min(...e.map(e=>tr(e,t,i)))}function or(e,t,i){const n=t-e.origin[0],o=i-e.origin[1],r=n*e.along[0]+o*e.along[1],s=n*e.across[0]+o*e.across[1];return r<e.a0||r>e.a1||s<e.c0||s>e.c1?null:nr(ir(e),r,s)}function rr(e){const t=ir(e),i=e.overhang,n=e=>"open"===e?0:i,o=e.a0-n(e.ends[0]),r=e.a1+n(e.ends[1]),s=e.shed?e.c0:e.c0-i,a=e.c1+i,l=(t,i,n)=>[e.origin[0]+e.along[0]*t+e.across[0]*i,n,e.origin[1]+e.along[1]*t+e.across[1]*i],c=[],d=[[o,s],[r,s],[r,a],[o,a]],h=1e-6,u=(t,i)=>{const n=(e,n)=>Math.abs(t[e]-n)<h&&Math.abs(i[e]-n)<h,l=e=>"open"!==e;return n(1,s)?e.shed?null:{inward:[0,1],rake:!1}:n(1,a)?{inward:[0,-1],rake:!1}:n(0,o)&&l(e.ends[0])?{inward:[1,0],rake:"gable"===e.ends[0]}:n(0,r)&&l(e.ends[1])?{inward:[-1,0],rake:"gable"===e.ends[1]}:null};return t.forEach((e,n)=>{let o=d;if(t.forEach((t,i)=>{n===i||o.length<3||(o=function(e,t){const i=[];for(let n=0;n<e.length;n++){const o=e[n],r=e[(n+1)%e.length],s=t(o[0],o[1]),a=t(r[0],r[1]);if(s<=0&&i.push(o),s<0&&a>0||s>0&&a<0){const e=s/(s-a);i.push([o[0]+(r[0]-o[0])*e,o[1]+(r[1]-o[1])*e])}}return i}(o,(i,n)=>tr(e,i,n)-tr(t,i,n)-1e-9))}),!(o.length<3||function(e){let t=0;for(let i=0;i<e.length;i++){const n=e[i],o=e[(i+1)%e.length];t+=n[0]*o[1]-o[0]*n[1]}return Math.abs(t)/2}(o)<1e-4)){c.push({points:o.map(([t,i])=>l(t,i,tr(e,t,i))),kind:"shingle"});for(let t=0;t<o.length&&i>.01;t++){const n=o[t],r=o[(t+1)%o.length],s=u(n,r);if(!s)continue;const a=tr(e,n[0],n[1]),d=tr(e,r[0],r[1]);c.push({points:[l(n[0],n[1],a),l(r[0],r[1],d),l(r[0],r[1],d-Jo),l(n[0],n[1],a-Jo)],kind:"trim"});const[h,g]=s.inward,p=[n[0]+h*i,n[1]+g*i],m=[r[0]+h*i,r[1]+g*i];c.push({points:[l(n[0],n[1],a-Jo),l(r[0],r[1],d-Jo),l(m[0],m[1],d-Jo),l(p[0],p[1],a-Jo)],kind:"trim"})}}}),[0,1].forEach(i=>{if("gable"!==e.ends[i])return;const n=0===i?e.a0-.08:e.a1+.08,o=new Set([e.c0,e.c1]);for(let i=0;i<t.length;i++)for(let r=i+1;r<t.length;r++){const s=t[i].kc-t[r].kc;if(Math.abs(s)<1e-9)continue;const a=(tr(t[r],n,0)-tr(t[i],n,0))/s;a>e.c0&&a<e.c1&&o.add(a)}const r=[...o].sort((e,t)=>e-t).map(i=>l(n,i,Math.max(e.base,nr(t,n,i)))),s=r[0],a=r[r.length-1];c.push({points:[[s[0],e.base,s[2]],...r,[a[0],e.base,a[2]]],kind:e.gable})}),c}function sr(e,t){const i="x"===e.ridge,[n,o]=Array.isArray(e.eave)?e.eave:[e.eave,e.eave],r=Math.min(e.x0,e.x1)*t,s=Math.max(e.x0,e.x1)*t,a=Math.min(e.y0,e.y1)*t,l=Math.max(e.y0,e.y1)*t;return{origin:[0,0],along:i?[1,0]:[0,1],across:i?[0,1]:[1,0],a0:i?r:a,a1:i?s:l,c0:i?a:r,c1:i?l:s,eave0:n,eave1:o,pitch:e.pitch,ends:e.ends??["gable","gable"],overhang:e.overhang??.35,base:e.base??Math.min(n,o),gable:e.gable??"siding"}}function ar(e,t,i,n,o=[!1,!1]){const[r,s,,a]=e,l=Math.hypot(s[0]-r[0],s[1]-r[1]),c=Math.hypot(a[0]-r[0],a[1]-r[1]);return l<.1||c<.1?null:{origin:r,along:[(s[0]-r[0])/l,(s[1]-r[1])/l],across:[(a[0]-r[0])/c,(a[1]-r[1])/c],a0:o[0]?-1.5:0,a1:o[1]?l+1.5:l,c0:0,c1:c,eave0:t,eave1:t,pitch:i,ends:[o[0]?"open":"gable",o[1]?"open":"gable"],overhang:n,base:t,gable:"siding",shed:!0}}const lr="#9aa1a8",cr="#4d535a",dr="#433d38",hr="#1f1d1b",ur=.55,gr=.35,pr=.05,mr=1.4,fr=.45,_r=.2,br=.15,vr="#9a968f",yr=.14,kr=.95;function wr(e,t){return e===xr?"stairs":/stand|pedestal|basket/.test(e)?"block":/shower(?!_bench)/.test(e)?"shower":/tree|olive/.test(e)&&"outdoor"===t?.category?"tree":/plant|monstera|fiddle|palm|cactus|bonsai|fern|succulent|orchid|pothos|calathea|_zz|rubber|dracaena|jade|pilea|aloe|herb|shrub|hedge|houseplant|bird_of_paradise|philodendron|spider|tree|olive/.test(e)?"plant":/floor_lamp|torchiere|tripod_floor|corner_floor|piano_lamp|floor_uplight|table_lamp|desk_lamp|smart_bulb_lamp|mushroom_lamp|salt_lamp|lava_lamp/.test(e)?"lamp":"block"}const xr="stairs_straight",Mr=.09,$r=.025,Lr="#f1eee8";function Sr(e){return 1/(100*function(e){if(e&&e.meters>0){const[[t,i],[n,o]]=e.points,r=Ke(t,i,n,o);if(r>0)return r/e.meters/100}return.5}(e))}const Cr=[[/^shape_|^icon_/,.01],[/mattress_floor/,.2],[/sleeping_bag|floor_cushion|meditation_cushion/,.12],[/rug|_mat$|^mat_|doormat|runner|play_mat|vr_play_area|bath_mat/,.01],[/chandelier|pendant|globe_cluster/,.5,"ceiling"],[/ceiling_fan/,.35,"ceiling"],[/ceiling_light|flush_mount|recessed|wafer|led_panel|troffer|track_|spot_bar|shop_light|skylight_light|exhaust_fan|smoke_detector|co_detector|closet_puck|hex_light|triangle_light|^projector$|overhead_storage|garage_door_opener/,.08,"ceiling"],[/cove_light/,.05,{y0:-.12}],[/^wall_cabinet|over_toilet_storage|medicine_cabinet/,.7,{y0:1.45}],[/range_hood|microwave_otr/,.45,{y0:1.55}],[/tv_wall|wall_mirror|wall_art|tapestry|photo_wall|whiteboard|corkboard|wall_clock|pegboard|projection_screen|mirror_entry|tv_backlight/,.9,{y0:1}],[/sconce|wall_up_down|picture_light|vanity_light|wall_washer|reading_light_bed/,.25,{y0:1.7}],[/wall_hooks|towel_bar|towel_rail|key_cabinet|alarm_panel|thermostat|video_doorbell|electrical_|mini_split|security_camera|camera_dome|access_point|motion_sensor|presence_sensor|exit_sign/,.3,{y0:1.6}],[/window_ac/,.4,{y0:1}],[/under_cabinet_light/,.03,{y0:1.4}],[/string_lights|cafe_lights/,.03,{y0:2.2}],[/shower_bench/,.45],[/fridge(?!_mini)|freezer_upright|pantry|tall_cabinet|wardrobe|armoire|closet_rod|linen_tower|linen_cabinet|bookcase(?!_small)|grandfather_clock|shelving|garage_cabinet|broom_cabinet|server_rack_full|mudroom_locker|hall_tree|coat_closet|china_cabinet|hutch|display_cabinet|curio|wall_oven|entertainment_center|gun_safe|utility_shelf|storage_shelf|pantry_shelves|linen_closet|shower|steam_|sauna|jewelry_armoire|full_length_mirror|floor_mirror|room_divider|coat_rack|coat_stand|cat_tree_large|water_heater|furnace|boiler|air_handler|heat_pump_water|smith_machine|power_rack|squat_stand|cable_machine|home_gym|arcade_cabinet|refrigerator/,2],[/bunk_bed|loft_bed/,1.7],[/car_|motorcycle|scooter_motor|riding_mower/,1.4],[/shed|greenhouse|playhouse|gazebo|pergola/,2.4],[/umbrella_\d|umbrella_cantilever/,2.3],[/tree_large/,5],[/tree_small/,2.5],[/^tree$|olive_tree/,3.5],[/plant_large|fiddle|palm|monstera|bird_of_paradise|plant_rubber|dracaena|office_plant/,1.5],[/hedge/,1.4],[/shrub|bush/,1],[/floor_lamp|torchiere|tripod_floor|corner_floor|piano_lamp|floor_uplight/,1.6],[/table_lamp|desk_lamp|smart_bulb_lamp|salt_lamp|lava_lamp|mushroom_lamp|night_light/,.45,{y0:.55}],[/fridge_mini|wine_fridge|beverage_center|dishwasher|trash_compactor|base_cabinet|drawer_base|corner_base|lazy_susan|countertop|sink|range|cooktop|induction|island|peninsula|vanity(?!_table|_stool)|washer|dryer|laundry_|outdoor_kitchen|kitchen_cart|butcher_block|workbench|buffet|sideboard|credenza|bar_cabinet|home_bar|freezer_chest|breakfast_bar|potting_bench|tool_chest|rolling_tool|grill|smoker|pizza_oven/,.9],[/crib|bassinet|changing_/,.95],[/dog_bed|cat_bed|dog_cot|pet_cave|litter|pet_bowls|pet_feeder/,.25],[/bed|futon|daybed|murphy/,.55],[/sofa|sectional|loveseat|chaise|armchair|recliner|couch|glider|egg_chair|papasan|porch_swing|banquette/,.85],[/bar_stool|drafting_stool/,.75],[/counter_stool/,.65],[/ottoman|pouf|beanbag|piano_bench|bench|vanity_stool|step_stool|kids_chair/,.45],[/chair|stool/,.9],[/coffee_table|nesting/,.45],[/side_table|nightstand|end_table/,.55],[/high_top|pub_table/,1.05],[/kids_table|kids_desk|train_table/,.5],[/table|desk|conference|meeting|picnic|ping_pong|poker|craft|sewing|drafting|massage/,.75],[/tall_chest/,1.3],[/lingerie_chest/,1.2],[/dresser|chest|file_cabinet|drawers/,.85],[/toilet|bidet/,.75],[/urinal/,1.1],[/hot_tub/,.9],[/bathtub|tub_|_tub/,.55],[/^pool_(rect|small|round)/,.02],[/trampoline/,.9],[/tv_stand|media_console|soundbar|av_receiver/,.5],[/^tv_/,.7,{y0:.5}],[/^monitor_/,.4,{y0:.75}],[/laptop|printer(?!_large|_3d)|toaster|coffee_maker|espresso|stand_mixer|kettle|blender|air_fryer|pressure_cooker|rice_cooker|bread_maker|food_processor|^microwave$|smart_speaker|smart_display|smart_hub|router|modem|mesh_node|network_switch|nas|game_console|turntable|kitchen_scale|knife_block|spice_rack|dish_rack/,.3,{y0:.9}],[/upright_piano/,1.25],[/piano/,1],[/fireplace/,1.1],[/wood_stove/,.9],[/radiator/,.6],[/baseboard/,.2],[/treadmill|elliptical|stair_climber/,1.4],[/bicycle|bike/,1]],Pr={living:.75,bedroom:.8,kitchen:.9,dining:.75,bathroom:.85,office:.75,laundry:.9,electronics:.5,lighting:.4,kids:.6,entry:1,outdoor:.8,garage:1,fitness:1,pets:.4,decor:.6,icons:.01,shapes:.01,custom:.5};function Ir(e,t,i){for(const[t,n,o]of Cr)if(t.test(e))return"ceiling"===o?{y0:i-n,height:n}:o&&"object"==typeof o?{y0:o.y0<0?i+o.y0:Math.min(o.y0,i-n),height:n}:{y0:0,height:Math.min(n,i)};return{y0:0,height:Pr[t?.category??""]??.6}}function Hr(e,t){return e.points&&e.points.length>=2?wi(e.points,e.width_cm,e.depth_cm,!1!==e.closed,e.corners):pi(t?.draw??"box",e.width_cm,e.depth_cm,e.corners?.length?{...t?.opts,corners:e.corners.join(",")}:t?.opts??{})}function Ar(e,t,i,n){const o=e.width_cm/100,r=e.depth_cm/100,s=e=>e.map(([e,t])=>[(n?1-e:e)*o-o/2,t*r-r/2]);if(e.points&&e.points.length>=3&&!1!==e.closed)return s(e.points);if(t&&Ai(t.id)){const e=ki(t.draw,t.opts);if(e.length>=3)return s(e)}const a=i[0];return"ellipse"===a?.t&&Math.abs(2*a.rx-e.width_cm)<.1*e.width_cm&&Math.abs(2*a.ry-e.depth_cm)<.1*e.depth_cm?function(e,t,i=32){return Array.from({length:i},(n,o)=>{const r=o/i*Math.PI*2;return[Math.cos(r)*e,Math.sin(r)*t]})}(o/2,r/2):function(e,t,i){const n=e/2,o=t/2;if((i=Math.min(i,n,o))<=.001)return[[-n,-o],[n,-o],[n,o],[-n,o]];const r=[],s=[[n-i,-o+i,-Math.PI/2],[n-i,o-i,0],[-n+i,o-i,Math.PI/2],[-n+i,-o+i,Math.PI]];for(const[e,t,n]of s)for(let o=0;o<=4;o++){const s=n+o/4*(Math.PI/2);r.push([e+Math.cos(s)*i,t+Math.sin(s)*i])}return r}(o,r,mi(e.width_cm,e.depth_cm)/100)}const Vr=new Map;function Fr(e,t,i,n,o,r){const s=Math.max(1,e.width_cm),a=Math.max(1,e.depth_cm),l=JSON.stringify([e.kind,s,a,i,n,o,r,e.fill,e.points,e.corners]),c=Vr.get(l);if(c)return c;const d=Math.min(4,512/Math.max(s,a)),h=Math.max(8,Math.round(s*d)),u=Math.max(8,Math.round(a*d)),g=Math.max(2.5,Math.min(6,1.4*d)),p=document.createElementNS("http://www.w3.org/2000/svg","svg");ce(Z`<style>${Ci}</style>
      <rect x="0" y="0" width=${s} height=${a} fill=${o}></rect>
      <g transform=${i?`translate(${s} 0) scale(-1 1)`:""}>${$i(t,!!e.fill||r)}</g>`,p),p.setAttribute("xmlns","http://www.w3.org/2000/svg"),p.setAttribute("width",String(h)),p.setAttribute("height",String(u)),p.setAttribute("viewBox",`0 0 ${s} ${a}`),p.setAttribute("preserveAspectRatio","none"),p.setAttribute("style",`--fx-color:${n};--fx-stroke-width:${g}px;--sc-bg:${o};color:${n}`);const m=(new XMLSerializer).serializeToString(p),f=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(m)}`;return Vr.size>400&&Vr.clear(),Vr.set(l,f),f}function Tr(e){return null==e?0:1-e}function Rr(e,t,i,n,o,r,s,a){const{layout:l,wallHeight:c}=e,d=Sr(l.scale),h=dn(l.openings,t),u=[],g=[],p=[],m=[],f=l.rooms.filter(e=>0!==(e.floor_offset_m??0)&&e.points.length>=3),_=(e,t)=>{const i=a.roofOver(e,t);return null!==i&&i>c+.3&&a.lowerRoomNear(e,t,.01)},b=(e,t,i)=>{const{offsets:n,outside:o}=((e,t,i)=>{const n=Ke(e[0],e[1],t[0],t[1]),o=-(t[1]-e[1])/n,r=(t[0]-e[0])/n,s=(i/2+.2)/d,a=new Set,c={1:0,[-1]:0};for(const i of[.2,.5,.8])for(const n of[1,-1]){const h=e[0]+(t[0]-e[0])*i+o*s*n,u=e[1]+(t[1]-e[1])*i+r*s*n,g=l.rooms.find(e=>e.points.length>=3&&Ye(h,u,e.points));g&&a.add(g.floor_offset_m??0),(g&&!g.outdoor||!g&&_(h*d,u*d))&&c[n]++}const h=c[1]&&!c[-1]?-1:c[-1]&&!c[1]?1:void 0;return{offsets:[...a],outside:h}})(e,t,i),r=n.length?Math.min(...n):0;let s=(n.length?Math.max(...n):0)+c;const a=n.length?Math.max(...n):0,h=y(e,t);return null!==h&&h<=s+.8&&(s=h),{base:r,top:s,level:a,outside:o}},v=(e,t,i,n,o)=>{const s=Ke(e[0],e[1],t[0],t[1])*d,a=(t[0]-e[0])*d/s,l=(t[1]-e[1])*d/s,c=i/2+.2,h=Math.max(1,Math.round(s/.1)),u=[];for(let t=0;t<h;t++){const i=(t+.5)*s/h,g=e[0]*d+a*i,p=e[1]*d+l*i,m=[r(g-l*c,p+a*c),r(g+l*c,p-a*c)].filter(e=>null!==e);let f=o;if(m.length){const e=Math.min(...m);e<=o+.8&&(f=e)}f=Math.max(f,n+.3);const _=u[u.length-1];_&&Math.abs(_.top-f)<.005?_.s1=(t+1)*s/h:u.push({s0:t*s/h,s1:(t+1)*s/h,top:f})}return u[0].s0=-1/0,u[u.length-1].s1=1/0,u},y=(e,t)=>{const i=e[0]*d,n=e[1]*d,o=Ke(e[0],e[1],t[0],t[1])*d;if(o<.05)return null;const r=(t[0]*d-i)/o,a=(t[1]*d-n)/o;let l=null;for(const e of s){if(null!==l&&e.y>=l)continue;const t=Math.hypot(e.b[0]-e.a[0],e.b[1]-e.a[1]);if(t<.05)continue;const s=(e.b[0]-e.a[0])/t,c=(e.b[1]-e.a[1])/t;if(Math.abs(r*c-a*s)>.09)continue;const d=(e.a[0]+e.b[0])/2-i,h=(e.a[1]+e.b[1])/2-n;if(Math.abs(d*a-h*r)>.35)continue;const u=(e.a[0]-i)*r+(e.a[1]-n)*a,g=(e.b[0]-i)*r+(e.b[1]-n)*a;Math.min(o,Math.max(u,g))-Math.max(0,Math.min(u,g))>.9*o&&(l=e.y)}return l},k=(e,t)=>f.find(i=>Ye(e,t,i.points))?.floor_offset_m??0,w=l.furniture.filter(e=>e.kind===xr).map(e=>{const t=-e.rotation_deg*Math.PI/180,i=Math.cos(t),n=Math.sin(t),o=e.width_cm/100,s=e.depth_cm/100,a=(t,o)=>[e.x*d+t*i+o*n,e.y*d-t*n+o*i],c=([e,t])=>{const i=l.rooms.find(i=>!i.outdoor&&i.points.length>=3&&Ye(e/d,t/d,i.points));return i?i.floor_offset_m??0:r(e,t)??0},h=c(a(0,s/2+.3)),u=c(a(0,-s/2-.3));return{item:e,front:h,back:u,top:Math.max(h,u),sides:[[a(-o/2,-s/2),a(-o/2,s/2)],[a(o/2,-s/2),a(o/2,s/2)]]}}),x=([e,t],[i,n],o)=>{let r=0;for(let s=0;s<=4;s++){tt(e[0]+(t[0]-e[0])*s/4,e[1]+(t[1]-e[1])*s/4,i[0],i[1],n[0],n[1])<o&&r++}return r/5},M=l.walls.flatMap(e=>e.points.slice(1).map((t,i)=>{const n=e.points[i];return[[[n[0]*d,n[1]*d],[t[0]*d,t[1]*d]],Te(e)/100]})),$=(e,t)=>{const i=w[e],n=i.sides[t];return!M.some(([e,t])=>t>.06&&x(n,e,t/2+.12)>=.6)&&(!s.some(e=>e.y<=i.top+.3&&x(n,[e.a,e.b],.2)>=.6)&&!w.some((t,o)=>o!==e&&t.sides.some(e=>x(n,e,.15)>=.6)&&(t.top>i.top||t.top===i.top&&o<e)))},L=(e,t)=>w.some(i=>i.sides.some(i=>x([e,t],i,.2)>=.4));for(const e of l.walls){const t=e.points;if(t.length<2)continue;const n=Te(e)/100;let o=0;for(let e=0;e<t.length-1;e++)o+=Ke(t[e][0],t[e][1],t[e+1][0],t[e+1][1]);if(o*d<.3)continue;const r=n<=.06,s="half_wall"===e.material,f=t.length>2&&Ke(t[0][0],t[0][1],t[t.length-1][0],t[t.length-1][1])<1e-6,_=new Map;for(const i of l.openings){if(i.wallId!==e.id)continue;const{segmentIndex:n}=rt(t,i.x,i.y),o=t[n],r=t[n+1];if(!r)continue;const s=Ke(o[0],o[1],r[0],r[1]);if(s<=0)continue;const a=((i.x-o[0])*(r[0]-o[0])+(i.y-o[1])*(r[1]-o[1]))/s,l=_.get(n)??[];l.push({opening:i,s:a*d,half:i.width*d/2}),_.set(n,l)}const y=[],k=(e,t)=>y.some(([i,n,o,r])=>tt(e,t,i,n,o,r)*d<.02);for(let e=0;e<t.length-1;e++){const[o,w]=t[e],[x,M]=t[e+1],$=Ke(o,w,x,M)*d;if($<.005)continue;if(k(o,w)&&k(x,M)&&k((o+x)/2,(w+M)/2))continue;y.push([o,w,x,M]);const S=(x-o)*d/$,C=(M-w)*d/$,P=Math.atan2(-C,S),I=e=>[o*d+S*e,w*d+C*e],{base:H,top:A,level:V,outside:F}=b([o,w],[x,M],n),T=v([o,w],[x,M],n,H,A),R=(e,t)=>Math.min(...T.filter(i=>i.s1>e&&i.s0<t).map(e=>e.top)),B=e>0||f?n/2:0,E=e<t.length-2||f?n/2:0,D=(e,t,i,o,r=n)=>{const[s,a]=I((e+t)/2);return{x:s,z:a,y0:i,y1:o,length:t-e,depth:r,angle:P,...F&&r===n?{outside:F}:{}}},z=F?[-C*F,S*F]:null,O=!!z&&z[0]*a.front[0]+z[1]*a.front[1]>.7;let j=!1;const U=O?(_.get(e)??[]).find(e=>"door"===e.opening.type&&!e.opening.garage):void 0;if(U&&z&&!r){const e=(e,t)=>[e[0]+z[0]*t,e[1]+z[1]*t],t=e(I(U.s),n/2+.6),i=l.rooms.some(e=>e.outdoor&&e.points.length>=3&&Ye(t[0]/d,t[1]/d,e.points));if(!i){j=!0;const t=$<=3.5?0:Math.max(0,U.s-U.half-.9),i=$<=3.5?$:Math.min($,U.s+U.half+.9),o=e(I(t),n/2),r=e(I(i),n/2),s=e(r,mr),a=e(o,mr),c=([e,t])=>{const i=[(e[0]+t[0])/2,(e[1]+t[1])/2];return l.walls.some(e=>e.points.some((t,n)=>{const o=e.points[n+1];return!!o&&tt(i[0]/d,i[1]/d,t[0],t[1],o[0],o[1])*d<.25}))},h=[c([a,o]),c([s,r])];p.push({corners:[o,r,s,a],eave:V+2.45,abutted:h});const g=e(I((t+i)/2),n/2+.7);u.push({x:g[0],z:g[1],y0:V-.5,y1:V-.12,length:i-t,depth:mr,angle:P,color:"#cbc8c1"});for(const[e,t,i]of[[a,1,0],[s,-1,1]]){if(h[i])continue;const n=.125;u.push({x:e[0]+S*t*n-z[0]*n,z:e[1]+C*t*n-z[1]*n,y0:V-.12,y1:V+2.45,length:br,depth:br,angle:P,color:"#a8693a"})}}}const W=O&&!j?a.stoneTop:-1/0,N=(e,t,i,n)=>{for(const o of T){const r=Math.max(e,o.s0),s=Math.min(t,o.s1),a=Math.min(n??o.top,o.top);if(s-r<=.001||a-i<=.005)continue;const l=Math.max(i,Math.min(a,W));l-i>.005&&u.push({...D(r,s,i,l),stone:!0}),a-l>.005&&u.push(D(r,s,l,a))}},Z=n/2*-C,G=S*(n/2),K=I(-B),q=I($+E);if(m.push({a:[K[0]+Z,K[1]+G],b:[q[0]+Z,q[1]+G],normal:[-C,S]}),m.push({a:[K[0]-Z,K[1]-G],b:[q[0]-Z,q[1]-G],normal:[C,-S]}),s){const e=H+1;u.push(D(-B,$+E,H,e)),u.push({...D(-B,$+E,e,e+.04,n+.04),color:i?vr:Lr});continue}if(r){if(L(I(0),I($)))continue;const e=H+.95,t=i?vr:Lr;for(const i of[0,$])u.push({...D(i-.045,i+.045,H,e+.06,Mr),color:t});u.push({...D(0,$,e-.05,e,.07),color:"#8b5e3c"}),u.push({...D(0,$,H+.06,H+.1,.05),color:t});const n=Math.floor($/.11);for(let i=1;i<n;i++){const o=$*i/n;u.push({...D(o-.0125,o+.0125,H+.1,e-.05,$r),color:t})}continue}const[Y,Q]=I($/2);if(F&&a.groundAt&&!a.lowerRoomNear(Y,Q,n/2+.6)){const[e,t]=I(-B),[i,n]=I($+E),o=Math.min(a.groundAt(e,t),a.groundAt(i,n))-.1;H-o>.02&&u.push({...D(-B,$+E,o,H),...O?{stone:!0}:{color:"#a9a59d"}})}const X=(_.get(e)??[]).map(e=>({...e,s0:Math.max(0,e.s-e.half),s1:Math.min($,e.s+e.half)})).filter(e=>e.s1-e.s0>.01).sort((e,t)=>e.s0-t.s0);let J=-B;for(const e of X){const{opening:t}=e;e.s0>J&&N(J,e.s0,H);const o=R(e.s0,e.s1),r="door"===t.type,s=r?void 0:t.window_style,a="transom"===s?c-.15:"full"===s?c:2.1,l=Math.min(o-V,r?2.1:t.daylight?.head_m??a)+V,d=(r?0:"transom"===s?Math.max(0,l-V-.45):"full"===s?0:Math.min(.9,l-V-.1))+V;d>H&&N(e.s0,e.s1,H,d),l<o-.005&&u.push(D(e.s0,e.s1,l,o));const p=r&&!!F,m=p&&!t.garage&&e.s1-e.s0>1.2;if(!r||m?g.push({box:D(e.s0,e.s1,d,l,.02),kind:"glass",color:"#86a6bd",opacity:.38}):p&&!t.garage&&u.push({...D(e.s0,e.s1,d,l,.05),color:i?"#8f8b84":"#f6f4ef"}),F&&(!r||p)){const t=.08,o=n+.04,s=i?vr:"#f3f1ec",a=[[e.s0-t,e.s0,r?d:d-t,l+t],[e.s1,e.s1+t,r?d:d-t,l+t],[e.s0,e.s1,l,l+t]];if(r||a.push([e.s0,e.s1,d-t,d]),m){const i=(e.s0+e.s1)/2;a.push([i-t/2,i+t/2,d,l])}for(const[e,t,i,n]of a)u.push({...D(e,t,i,n,o),color:s})}const f=l-d,_=t.cover_right_entity_id?[[e.s0,(e.s0+e.s1)/2,t.cover_entity_id,t.id],[(e.s0+e.s1)/2,e.s1,t.cover_right_entity_id,`${t.id}:right`]]:[[e.s0,e.s1,t.cover_entity_id,t.id]];for(const[e,o,r,s]of _){const a=!!t.garage;if(!r&&!a)continue;const c=r?Tr(h.get(s)):1;c<=.01||g.push({box:D(e,o,l-c*f,l,a?Math.min(.06,n):.03),kind:a?"door":"cover",color:a?i?"#90a4ae":"#cfd8dc":i?"#8d8574":"#efe6d2",opacity:a?1:.92})}J=e.s1}$+E>J&&N(J,$+E,H)}}if(a.groundAt){const e=a.groundAt,t=(e,t,i,n,o)=>{const r=Math.hypot(t[0]-e[0],t[1]-e[1]);return{x:(e[0]+t[0])/2,z:(e[1]+t[1])/2,y0:i,y1:n,length:r,depth:o,angle:Math.atan2(-(t[1]-e[1]),t[0]-e[0])}},n=(e,t)=>l.walls.some(i=>i.points.some((n,o)=>{const r=i.points[o+1];return!!r&&tt(e,t,n[0],n[1],r[0],r[1])*d<Te(i)/200+.15}));for(const o of l.rooms){if(!o.outdoor||o.points.length<3)continue;const r=o.floor_offset_m??0,s=o.points.map(([e,t])=>[e*d,t*d]),a=Math.min(...s.map(([t,i])=>e(t,i)));if(r-a<.5)continue;const l=i?"#4f4033":"#8a6c52",c=i?hr:dr;let h=0;s.forEach(([e,t],i)=>{const[n,o]=s[(i+1)%s.length];h+=e*o-n*t});const g=h>0?1:-1,p=(t,i,n)=>u.push({x:t,z:i,y0:e(t,i)-.1,y1:n,length:yr,depth:yr,angle:0,color:l});s.forEach((e,i)=>{const o=s[(i+1)%s.length],a=Math.hypot(o[0]-e[0],o[1]-e[1]);if(a<.05)return;const h=(o[0]-e[0])/a,m=(o[1]-e[1])/a,f=-m*g,_=h*g,b=.07,v=[e[0]+f*b,e[1]+_*b],y=[o[0]+f*b,o[1]+_*b],k=[(e[0]+o[0])/2/d,(e[1]+o[1])/2/d],w=!n(k[0],k[1]);u.push({...t(e,o,r-.3,r-.02,.05),color:l});const x=Math.max(1,Math.ceil(a/2.2));for(let e=0;e<=x;e++){if(e===x&&x>0&&w)continue;!w&&e>0&&e<x||p(v[0]+e/x*(y[0]-v[0]),v[1]+e/x*(y[1]-v[1]),w?r+kr:r-.02)}if(!w)return;u.push({...t(v,y,r+kr-.06,r+kr,.09),color:l}),u.push({...t(v,y,r+.08,r+.12,.05),color:c});const M=Math.floor(a/.12);for(let e=1;e<M;e++){const t=e/M;u.push({x:v[0]+(y[0]-v[0])*t,z:v[1]+(y[1]-v[1])*t,y0:r+.12,y1:r+kr-.06,length:.025,depth:.025,angle:Math.atan2(-m,h),color:c})}})}}const S=cn(l.rooms,t),C=i?"#3b3936":"#ece7df",P=i?"#5d4a3a":"#b8916b",I=[];for(const e of l.rooms){if(!1===e.visible||e.points.length<3)continue;const t=n?S.get(e.id):void 0,r=yn(e.fill_color??Mn,e.fill_opacity??$n,t,i),s=!!t&&t.on>0;I.push({id:e.id,name:e.name,y:e.floor_offset_m??0,points:e.points.map(([e,t])=>[e*d,t*d]),color:vn(e.outdoor?P:C,r.color,Math.min(1,1.6*r.opacity)),finish:Br(e.name,!!e.outdoor),tinted:r.opacity>.05,emissive:s?t.color:null,emissiveIntensity:s?(.06+.18*Math.min(1,t.level))*o:0,outdoor:!!e.outdoor})}const H=_n(l.furniture,t),A=[];for(const e of l.furniture){const t=Di(e.kind),o=!!e.mirrored!=!!t?.flip,r=Hr(e,t),s=e.points&&e.points.length>=2&&!1===e.closed?{y0:0,height:.01}:Ir(e.kind,t,c),a=s.height,l=s.y0+k(e.x,e.y),h=H.get(e.id),u=e.color??null,g=h?.color??u??(i?"#e0e0e0":"#4a4a4a"),p=vn(i?"#4a4744":"#f6f3ee",u??g,u?.18:0),m=vn(i?"#5a5550":"#d9d2c6",u??g,u?.35:.08),f=!0===e.entity_id?.startsWith("light."),_=!!h&&h.active&&f&&n,b=wr(e.kind,t),v=w.findIndex(t=>t.item===e),y=v>=0?w[v]:null;A.push({id:e.id,name:e.label||t?.name||e.kind,footprint:Ar(e,t,r,o),width:e.width_cm/100,depth:e.depth_cm/100,x:e.x*d,z:e.y*d,angle:-e.rotation_deg*Math.PI/180,y0:y?Math.min(y.front,y.back):l,height:y?Math.abs(y.front-y.back):a,...y?{stairs:{front:y.front,back:y.back,rails:[$(v,0),$(v,1)]}}:{},color:m,topImage:Fr(e,r,o,g,p,!!h?.active),opacity:(e.opacity??1)*(h?.unavailable?.6:1),light:_?{color:h.color??"#ffd54f",level:Math.max(.15,h.glow),y:"lamp"===b?l+a-.15:l>.5*c?l-.05:l+a+.05}:null,shape:b})}return{floorId:e.floorId,name:e.name,baseY:e.baseY,wallHeight:c,walls:u,hasStairs:w.length>0,wallColor:i?"#8a8580":"#f4f1ec",sidingColor:i?cr:lr,stoneColor:i?"#5a5650":"#aaa49a",porches:p,panes:g,slabs:I,items:A,wallFaces:m,metersPerUnit:d}}function Br(e,t){if(t)return"deck";const i=e.toLowerCase();return/garage|crawl|mech|furnace|utility|storage|unfinished|gym/.test(i)?"concrete":/bath|laundry|entry|foyer|mud|powder|shower|toilet|dog|wc/.test(i)?"tile":/bed|guest|nursery|kid|room$/.test(i)?"carpet":"wood"}function Er(e){const{hass:t,dark:i}=e,n=e.floors.find(e=>null!=e.layout.north_deg)?.layout.north_deg??0,o=t?.config?.latitude,r=t?.config?.longitude,s="number"==typeof o&&"number"==typeof r?ji(e.date,o,r):{azimuth:200,elevation:40},a=e.sky?.clouds??0,l=Wi(s.elevation),c=e.ground?(()=>{const[t,i]=qi(e.ground.downhill_deg,n);return[-t,-i]})():[0,1],d=e.ground?.uphill_m??0,h=e.ground?function(e,t,i){const[n,o]=qi(t.downhill_deg,i),r=Math.max(t.uphill_m,t.downhill_m),s=e.floors.flatMap(e=>{const t=Sr(e.layout.scale);return e.layout.rooms.filter(t=>!t.outdoor&&t.points.length>=3&&e.baseY+(t.floor_offset_m??0)<r-.01).map(e=>e.points.map(([e,i])=>[e*t,i*t]))});let a=1/0,l=-1/0;for(const t of e.floors){const e=Sr(t.layout.scale);for(const i of t.layout.rooms)for(const[t,r]of i.points){const i=t*e*n+r*e*o;a=Math.min(a,i),l=Math.max(l,i)}}return{uphill:t.uphill_m,downhill:t.downhill_m,dir:[n,o],range:a<l?[a,l]:[0,0],holes:s}}(e,e.ground,n):null,u=Sr([...e.context??e.floors].sort((e,t)=>e.baseY-t.baseY)[0]?.layout.scale??null),g=(e.roofPlan?.parts??[]).map(e=>sr(e,u)),p=e.floors.map(n=>Rr(n,t,i,e.showLights,1-.75*l,function(e,t){const i=t.filter(t=>t.baseY>e.baseY+.5).flatMap(t=>{const i=Sr(t.layout.scale);return t.layout.rooms.filter(e=>!e.outdoor&&e.points.length>=3).map(n=>({y:t.baseY+(n.floor_offset_m??0)-e.baseY,points:n.points.map(([e,t])=>[e*i,t*i])}))});return(e,t)=>{let n=null;for(const o of i)(null===n||o.y<n)&&Ye(e,t,o.points)&&(n=o.y);return n}}(n,e.context??e.floors),function(e,t){return t.filter(t=>t.baseY>e.baseY+.5).flatMap(t=>{const i=Sr(t.layout.scale);return t.layout.walls.flatMap(n=>n.points.slice(1).map((o,r)=>({a:[n.points[r][0]*i,n.points[r][1]*i],b:[o[0]*i,o[1]*i],y:t.baseY-e.baseY})))})}(n,e.context??e.floors),{front:c,stoneTop:d+1.1-n.baseY,groundAt:h?(e,t)=>function(e,t,i){const[n,o]=e.range,r=t*e.dir[0]+i*e.dir[1],s=o>n?Math.min(1,Math.max(0,(r-n)/(o-n))):0;return e.uphill+(e.downhill-e.uphill)*s}(h,e,t)-n.baseY:null,roofOver:(e,t)=>{const i=((e,t)=>{let i=null;for(const n of g){const o=or(n,e,t);null!==o&&(null===i||o>i)&&(i=o)}return i})(e,t);return null===i?null:i-n.baseY},lowerRoomNear:(t,i,o)=>(e.context??e.floors).some(e=>{if(e.baseY>=n.baseY-.3)return!1;const r=Sr(e.layout.scale),s=t/r,a=i/r;return e.layout.rooms.some(e=>!e.outdoor&&e.points.length>=3&&(Ye(s,a,e.points)||e.points.some((t,i)=>{const n=e.points[(i+1)%e.points.length];return tt(s,a,t[0],t[1],n[0],n[1])*r<o})))})}));let m=null;if(s.elevation>0){const[e,t]=qi(s.azimuth,n),i=s.elevation*Math.PI/180;m={dir:[e*Math.cos(i),Math.sin(i),t*Math.cos(i)],color:Ji(s.elevation,a),intensity:2.6*l*(1-.65*a)}}return{floors:p,sun:m,ambient:{sky:l>0?a>.5?"#dde3e8":"#dcecff":"#8c9eff",ground:l>0?"#b9a88f":"#2a2a35",intensity:.55+.7*l},terrain:h,roof:e.roof?Wr(e,n,p):null,background:i?l>0?"#1f2a33":"#0e1118":l>0?"#e9f1f7":"#2b3140",dark:i}}function Dr(e,t,i,n){const o=new Uint8Array(e.length);for(let r=0;r<i;r++)for(let i=0;i<t;i++){let s=0;for(let o=-n;o<=n&&!s;o++){const n=i+o;n>=0&&n<t&&(s=e[r*t+n])}o[r*t+i]=s}const r=new Uint8Array(e.length);for(let e=0;e<i;e++)for(let s=0;s<t;s++){let a=0;for(let r=-n;r<=n&&!a;r++){const n=e+r;n>=0&&n<i&&(a=o[n*t+s])}r[e*t+s]=a}return r}function zr(e,t,i){const n=e.length,o=new Uint8Array(n);for(let t=0;t<n;t++)o[t]=e[t]>-1/0?1:0;const r=Math.max(1,Math.round(4)),s=Dr(o,t,i,r),a=new Uint8Array(n);for(let e=0;e<n;e++)a[e]=s[e]?0:1;const l=Dr(a,t,i,r),c=new Uint8Array(n),d=[],h=e=>{!c[e]&&l[e]&&(c[e]=1,d.push(e))};for(let e=0;e<t;e++)h(e),h((i-1)*t+e);for(let e=0;e<i;e++)h(e*t),h(e*t+t-1);for(;d.length;){const e=d.pop(),i=e%t;i>0&&h(e-1),i<t-1&&h(e+1),e>=t&&h(e-t),e<n-t&&h(e+t)}for(let i=0,o=!0;o&&i<400;i++){o=!1;for(let i=0;i<n;i++){if(c[i]||e[i]!==-1/0)continue;const r=i%t,s=Math.max(r>0?e[i-1]:-1/0,r<t-1?e[i+1]:-1/0,i>=t?e[i-t]:-1/0,i<n-t?e[i+t]:-1/0);s>-1/0&&(e[i]=s,o=!0)}}}function Or(e,t,i){const n=new Float32Array(e*t);for(let e=0;e<n.length;e++)n[e]=i(e)?1e9:0;for(let i=0;i<t;i++)for(let t=0;t<e;t++){const o=i*e+t;if(!n[o])continue;let r=n[o];t>0&&(r=Math.min(r,n[o-1]+1)),i>0&&(r=Math.min(r,n[o-e]+1),t>0&&(r=Math.min(r,n[o-e-1]+1)),t<e-1&&(r=Math.min(r,n[o-e+1]+1))),n[o]=r}for(let i=t-1;i>=0;i--)for(let o=e-1;o>=0;o--){const r=i*e+o;if(!n[r])continue;let s=n[r];o<e-1&&(s=Math.min(s,n[r+1]+1)),i<t-1&&(s=Math.min(s,n[r+e]+1),o<e-1&&(s=Math.min(s,n[r+e+1]+1)),o>0&&(s=Math.min(s,n[r+e-1]+1))),n[r]=s}return n}function jr(e,t,i,n){const o=new Uint8Array(t*i),r=[],s=new Int32Array(i+1),a=[];for(let l=0;l<200;l++){s.fill(0);let l={area:0,l0:0,l1:0,k0:0,k1:0};for(let n=0;n<t;n++){for(let t=0;t<i;t++)s[t]=e(n,t)&&!o[n*i+t]?s[t]+1:0;a.length=0;for(let e=0;e<=i;e++){for(;a.length&&s[a[a.length-1]]>=s[e];){const t=s[a.pop()],i=a.length?a[a.length-1]+1:0,o=t*(e-i);o>l.area&&(l={area:o,l0:n-t+1,l1:n,k0:i,k1:e-1})}a.push(e)}}if(l.area<n)break;const{k0:c,k1:d}=l;let{l0:h,l1:u}=l;const g=t=>{for(let i=c;i<=d;i++)if(!e(t,i))return!1;return!0};for(;h>0&&g(h-1);)h--;for(;u<t-1&&g(u+1);)u++;for(let e=h;e<=u;e++)for(let t=c;t<=d;t++)o[e*i+t]=1;r.push({l0:h,l1:u,k0:c,k1:d,s0:l.l0,s1:l.l1})}return r}let Ur=null;function Wr(e,t,i){const n=e.floors.map(e=>e.layout),o=JSON.stringify([e.floors.map(e=>[e.floorId,e.baseY,e.wallHeight]),e.ground,e.dark,t,i.map(e=>e.porches),e.roofPlan??null]);if(Ur&&Ur.key===o&&Ur.layouts.length===n.length&&Ur.layouts.every((e,t)=>e===n[t]))return Ur.roof;const r=e.roofPlan?.parts.length?function(e,t,i){const n=[...e.floors].sort((e,t)=>e.baseY-t.baseY)[0],o=Sr(n?.layout.scale??null),r=t.parts.flatMap(e=>rr(sr(e,o)));for(const e of i)for(const t of e.porches){const i=ar(t.corners,e.baseY+t.eave,fr,_r,t.abutted);i&&r.push(...rr(i))}return{...Nr(e.dark),grid:null,faces:r}}(e,e.roofPlan,i):function(e,t,i){const n=i.flatMap(e=>e.porches.map(t=>({corners:t.corners,eave:e.baseY+t.eave}))),o=e.floors.flatMap(e=>{const t=Sr(e.layout.scale);return e.layout.rooms.filter(e=>!e.outdoor&&e.points.length>=3).map(i=>{const n=i.points.map(([e,i])=>[e*t,i*t]),o=n.map(e=>e[0]),r=n.map(e=>e[1]);return{floorId:e.floorId,eave:e.baseY+(i.floor_offset_m??0)+e.wallHeight,points:n,box:[Math.min(...o),Math.min(...r),Math.max(...o),Math.max(...r)]}})});if(!o.length)return null;const r=pr,s=gr+2*r,a=n.flatMap(e=>e.corners.map(e=>e[0])),l=n.flatMap(e=>e.corners.map(e=>e[1])),c=Math.min(...o.map(e=>e.box[0]),...a)-s,d=Math.min(...o.map(e=>e.box[1]),...l)-s,h=Math.max(...o.map(e=>e.box[2]),...a)+s,u=Math.max(...o.map(e=>e.box[3]),...l)+s,g=Math.ceil((h-c)/r)+1,p=Math.ceil((u-d)/r)+1;if(g*p>6e5)return null;const m=g*p,f=new Float32Array(m).fill(-1/0),_=new Map;for(const t of e.floors){const e=new Float32Array(m).fill(-1/0);for(const i of o){if(i.floorId!==t.floorId)continue;const n=Math.max(0,Math.floor((i.box[0]-c)/r)),o=Math.min(g-1,Math.ceil((i.box[2]-c)/r)),s=Math.max(0,Math.floor((i.box[1]-d)/r)),a=Math.min(p-1,Math.ceil((i.box[3]-d)/r));for(let t=s;t<=a;t++)for(let s=n;s<=o;s++){const n=t*g+s;e[n]>=i.eave||Ye(c+s*r,d+t*r,i.points)&&(e[n]=i.eave)}}zr(e,g,p);for(let t=0;t<m;t++)if(e[t]>f[t]&&(f[t]=e[t]),e[t]>-1/0){const i=Math.round(100*e[t])/100;let n=_.get(i);n||_.set(i,n=new Uint8Array(m)),n[t]=1}}let b=!1,v=1;if(e.ground){const[i,n]=qi(e.ground.downhill_deg,t);b=Math.abs(i)>Math.abs(n),v=(b?i:n)>0?-1:1}const y=b?g:p,k=b?p:g,w=(e,t)=>b?t*g+e:e*g+t,x=new Float32Array(m).fill(NaN),M=new Float32Array(m).fill(NaN),$=(e,t,i)=>{x[e]>=t||(x[e]=t,M[e]=i)},L=new Set;for(const e of f)e>-1/0&&L.add(Math.round(100*e)/100);const S=Math.round(gr/r);for(const e of[...L].sort((e,t)=>e-t)){const t=new Uint8Array(m);for(let i=0;i<m;i++)t[i]=f[i]>=e-.005?1:0;const i=Math.max(1,Math.round(.2/r)),n=Dr(t,g,p,i);for(let e=0;e<m;e++)n[e]=n[e]?0:1;const o=Dr(n,g,p,i),s=i=>!!t[i]||!o[i]||x[i]>=e+.01,a=(e,t)=>s(w(e,t)),l=Or(g,p,s),c=Or(g,p,e=>!t[e]&&!!o[e]);for(let t=0;t<m;t++)l[t]>0?$(t,e+ur*(l[t]-.5)*r,e):c[t]<=S&&$(t,e-ur*(c[t]-.5)*r,e);const d=_.get(e),h=(e,t)=>!!d?.[w(e,t)],u=(e,t,i)=>e<0||e>=y||t<0||t>=k||!(i?h(e,t):a(e,t)),b=(e,t=!1)=>e.filter(([e,i])=>u(e,i,t)).length/Math.max(1,e.length),M=Math.round(1/r);for(const t of jr(h,y,k,Math.round((.4/r)**2))){const i=(t.k1-t.k0+1)*r;if(i>10)continue;const n=v>0?t.s1:t.s0,o=Array.from({length:t.k1-t.k0+1},(e,i)=>t.k0+i);if(b(o.map(e=>[n+v,e]))<.75)continue;const s=Array.from({length:Math.min(M,t.s1-t.s0+1)},(e,t)=>n-v*t);if(b(s.map(e=>[e,t.k0-1]),!0)<.75||b(s.map(e=>[e,t.k1+1]),!0)<.75)continue;const c=Math.min(.9,ur*Math.max(1,4/i)),d=e+c*i/2,h=Math.round((t.k0+t.k1)/2),u=v>0?t.l0:t.l1;for(let i=n;i!==u-v&&!(i!==n&&e+ur*(l[w(i,h)]-.5)*r>=d);i-=v)for(let n=Math.max(0,t.k0-S);n<=Math.min(k-1,t.k1+S);n++){if((n<t.k0||n>t.k1)&&a(i,n))continue;const o=Math.min(n-(t.k0-.5),t.k1+.5-n)*r;$(w(i,n),e+c*o,e)}}}for(const e of n){const[t,i,,n]=e.corners,o=Math.hypot(i[0]-t[0],i[1]-t[1]),s=Math.hypot(n[0]-t[0],n[1]-t[1]);if(o<.1||s<.1)continue;const a=(i[0]-t[0])/o,l=(i[1]-t[1])/o,h=(n[0]-t[0])/s,u=(n[1]-t[1])/s,m=e.corners.map(e=>e[0]),f=e.corners.map(e=>e[1]),_=_r+r,b=Math.max(0,Math.floor((Math.min(...m)-_-c)/r)),v=Math.min(g-1,Math.ceil((Math.max(...m)+_-c)/r)),y=Math.max(0,Math.floor((Math.min(...f)-_-d)/r)),k=Math.min(p-1,Math.ceil((Math.max(...f)+_-d)/r));for(let i=y;i<=k;i++)for(let n=b;n<=v;n++){const p=c+n*r-t[0],m=d+i*r-t[1],f=p*a+m*l,_=p*h+m*u;if(_<0)continue;const b=s-_;b<-_r||f<-_r||f>o+_r||$(i*g+n,e.eave+fr*b,e.eave)}}let C=x,P=M;for(let e=0;e<Math.round(.1/r);e++){const e=C.slice(),t=P.slice();for(let i=0;i<y;i++)for(let n=0;n<k;n++){const o=w(i,n);if(Number.isNaN(C[o]))for(const r of[i-1,i+1]){if(r<0||r>=y)continue;const i=w(r,n);Number.isNaN(C[i])||(e[o]>=C[i]||(e[o]=C[i],t[o]=P[i]))}}C=e,P=t}return{...Nr(e.dark),grid:{x0:c,z0:d,step:r,nx:g,nz:p,heights:C,eaves:P},faces:[]}}(e,t,i);return Ur={layouts:n,key:o,roof:r},r}function Nr(e){return{color:e?"#2d3036":"#565b63",sidingColor:e?cr:lr,trimColor:e?hr:dr,shakeColor:e?"#3c4046":"#6c7178"}}let Zr=null;const Gr="spatial-context-3d-scan-mode";const Kr="spatial-context-3d-roof";function qr(e,t){const i=t?.time_zone;if(i)try{const t=new Intl.DateTimeFormat("en-US",{timeZone:i,year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric",hourCycle:"h23"}).formatToParts(e),n=e=>Number(t.find(t=>t.type===e)?.value??0);return{y:n("year"),mo:n("month"),d:n("day"),h:n("hour"),mi:n("minute")}}catch{}const n=new Date(e.getTime()+(t?.longitude??0)/15*36e5);return{y:n.getUTCFullYear(),mo:n.getUTCMonth()+1,d:n.getUTCDate(),h:n.getUTCHours(),mi:n.getUTCMinutes()}}function Yr(e){const t=[...e.rooms.flatMap(e=>e.points),...e.walls.flatMap(e=>e.points)];if(!t.length)return[0,0];const i=t.map(e=>e[0]),n=t.map(e=>e[1]);return[(Math.min(...i)+Math.max(...i))/2,(Math.min(...n)+Math.max(...n))/2]}let Qr=class extends he{constructor(){super(...arguments),this.floorId=null,this.layout=null,this.floors=[],this.sky=null,this.dark=!1,this.editable=!1,this.closable=!1,this.dollhouse=!1,this.moduleUrl="/spatial_context/view3d/spatial-context-3d.mjs?v=0.15.0-beta.1+mve0sfhy",this._status="idle",this._error=null,this._roofDraft=null,this._view3d=new Map,this._otherLayouts=new Map,this._spread=0,this._hour=null,this._sheetOpen=!1,this._selectedScanId=null,this._moveMode=!1,this._snap=!0,this._scanMode=function(){try{return"scan"===localStorage.getItem(Gr)?"scan":"plan"}catch{return"plan"}}(),this._roof=function(){try{return"off"!==localStorage.getItem(Kr)}catch{return!0}}(),this._uploading=!1,this._scanStatus=new Map,this._exporting=!1,this._handle=null,this._sceneSig="",this._scanSig="",this._clock=null,this._saveTimers=new Map,this._loadingView3d=new Set,this._rebuild=()=>{const e=this._handle;if(!e)return;const t=[];for(const e of this._contextFloorIds){const i=this._layoutOf(e);if(!i)continue;const n=this.floors.find(t=>t.floor_id===e);t.push({floorId:e,name:n?.name??e,layout:i,wallHeight:this._wallHeight(e),baseY:0,level:n?.level??null,elevation:this._view3d.get(e)?.floor_elevation_m??null})}if(!t.length)return;const i=function(e){const t=[...e].sort((e,t)=>(e.level??0)-(t.level??0));let i=0;const n=t.map(e=>{const t={...e,baseY:i};return i+=e.wallHeight+.3,t}),o=n.filter(e=>null!=e.elevation),r=o[0];if(!r){const e=n.find(e=>(e.level??0)>=0)?.baseY??0;for(const t of n)t.baseY-=e;return n}const s=new Map;let a=r;for(const e of n)null!=e.elevation&&(a=e),s.set(e,(a.elevation??0)-a.baseY);for(const e of n)e.baseY+=s.get(e)??0;return n}(t),n=this._shownFloorIds,o=i.filter(e=>n.includes(e.floorId));if(!o.length)return;const r=this._ground,s=this._date,a=o.map(e=>bn(cn(e.layout.rooms,this.hass),dn(e.layout.openings,this.hass),new Map,_n(e.layout.furniture,this.hass))).join("#"),l=Math.floor(s.getTime()/6e4),c=[o.map(e=>`${e.floorId}:${e.wallHeight}:${e.baseY}`).join(","),i.map(e=>e.floorId).join(","),a,l,this.dark,this.sky?.clouds??"",JSON.stringify(r),this._roofShown,JSON.stringify(this._roofPlan)].join("|"),d=this._lastLayouts.length!==i.length||i.some((e,t)=>this._lastLayouts[t]!==e.layout);(c!==this._sceneSig||d)&&(this._sceneSig=c,this._lastLayouts=i.map(e=>e.layout),e.setScene(Er({floors:o,context:i,hass:this.hass,dark:this.dark,date:s,sky:this.sky,showLights:!0,ground:r,roof:this._roofShown,roofPlan:this._roofPlan})),this._scanSig="");const h=[];for(const e of o){const t=Sr(e.layout.scale),[i,n]=Yr(e.layout);for(const o of this._view3d.get(e.floorId)?.scans??[])h.push({id:o.id,floorId:e.floorId,x:(o.x??i)*t,z:(o.y??n)*t,elevation:o.elevation_m,rotationDeg:o.rotation_deg,scale:o.scale,visible:o.visible,opacity:o.opacity,hideWalls:o.hide_walls})}const u=JSON.stringify(h);u!==this._scanSig&&(this._scanSig=u,e.setScans(h));const g=o.length>1?this._spread:0;g!==this._spreadShown&&(this._spreadShown=g,e.setSpread(g)),e.setScanMode(this._scanMode),e.setEditScan(this.editable&&this._sheetOpen&&this._moveMode?this._selectedScanId:null,this._snap)},this._lastLayouts=[],this._spreadShown=-1,this._onScanMove=(e,t,i)=>{const n=this.layout;if(!n)return;const o=Sr(n.scale);this._patchScan(e,{x:t.x/o,y:t.z/o,rotation_deg:Math.round(100*t.rotationDeg)/100,...void 0!==t.elevation?{elevation_m:Math.round(1e3*t.elevation)/1e3}:{}},!!i&&"now")},this._onPickFile=async e=>{const t=e.target,i=t.files?.[0];t.value="";const n=this._client,o=this.floorId;if(i&&n&&o){this._uploading=!0,this._error=null;try{const e=await n.uploadScan(o,i);this._patchView3d(t=>({...t,scans:[...t.scans,e]}),!1),this._selectedScanId=e.id}catch(e){this._error=e?.message??String(e)}finally{this._uploading=!1}}}}get _client(){return this.hass?new Re(this.hass):null}connectedCallback(){super.connectedCallback(),this.requestUpdate(),this._clock=setInterval(()=>{null===this._hour&&this._rebuild()},6e4)}disconnectedCallback(){super.disconnectedCallback(),this._clock&&clearInterval(this._clock);for(const[e,t]of this._saveTimers)clearTimeout(t),this._saveNow(e);this._saveTimers.clear(),this._handle?.destroy(),this._handle=null,this._sceneSig="",this._scanSig="",this._status="idle"}willUpdate(e){(e.has("dollhouse")||e.has("floorId"))&&(this._otherLayouts=new Map),this._ensureData()}updated(){"idle"===this._status&&this._start(),this._rebuild()}async _start(){if(!this._handle&&this._stage){this._status="starting";try{const t=await(e=this.moduleUrl,Zr||(Zr=import(e).then(e=>e.default).catch(e=>{throw Zr=null,e})),Zr);if(!t.supportsWebgl())throw new Error(He("view3d.noWebgl"));if(!this.isConnected||this._handle)return;this._handle=t.createView3d({container:this._stage,fetchScan:e=>this.hass?async function(e,t){const i=await e.fetchWithAuth(`/api/spatial_context/scan/${encodeURIComponent(t)}`);if(!i.ok)throw new Error(`Couldn't load the scan (${i.status})`);return i.arrayBuffer()}(this.hass,e):Promise.reject(new Error("offline")),onScanMove:this._onScanMove,onScanStatus:(e,t,i)=>{const n=new Map(this._scanStatus);"ready"===t?n.delete(e):n.set(e,"loading"===t?He("view3d.scanLoading"):i??"error"),this._scanStatus=n}}),this._sceneSig="",this._scanSig="",this._spreadShown=-1,this._status="ready",this._rebuild()}catch(e){this._status="error",this._error=e?.message??String(e)}var e}}get _shownFloorIds(){if(!this.floorId)return[];if(!this.dollhouse)return[this.floorId];const e=this.floors.find(e=>e.floor_id===this.floorId),t=e?.building_id;return t?this.floors.filter(e=>e.floor_id===this.floorId||e.building_id===t&&e.has_layout).map(e=>e.floor_id):[this.floorId]}get _contextFloorIds(){const e=this._shownFloorIds,t=this.floors.find(e=>e.floor_id===this.floorId),i=t?.building_id;if(!i)return e;const n=this.floors.filter(t=>t.building_id===i&&t.has_layout&&!e.includes(t.floor_id)).map(e=>e.floor_id);return[...e,...n]}get _hasScans(){return this._shownFloorIds.some(e=>this._view3d.get(e)?.scans.some(e=>e.visible))}get _buildingFloorIds(){if(!this.floorId)return[];const e=this.floors.find(e=>e.floor_id===this.floorId);return e?.building_id?this.floors.filter(t=>t.building_id===e.building_id).map(e=>e.floor_id):[this.floorId]}get _ground(){const e=this.floorId?this._view3d.get(this.floorId)?.ground:null;if(e)return e;for(const e of this._shownFloorIds){const t=this._view3d.get(e)?.ground;if(t)return t}return null}_setGround(e){const t=this._ground??{uphill_m:0,downhill_m:0,downhill_deg:0},i=null===e?null:{...t,...e},n=this._buildingFloorIds,o=new Map(this._view3d);for(const e of n){const t=o.get(e);t&&o.set(e,{...t,ground:i})}this._view3d=o,this.editable&&this._client?.saveGround(n,i).catch(e=>{this._error=He("view3d.saveFailed",{error:e?.message??String(e)})})}get _roofPlan(){const e=this.floorId?this._view3d.get(this.floorId)?.roof:null;if(e)return e;for(const e of this._shownFloorIds){const t=this._view3d.get(e)?.roof;if(t)return t}return null}_setRoof(e){const t=this._buildingFloorIds,i=new Map(this._view3d);for(const n of t){const t=i.get(n);t&&i.set(n,{...t,roof:e})}this._view3d=i,this.editable&&this._client?.saveRoof(t,e).catch(e=>{this._error=He("view3d.saveFailed",{error:e?.message??String(e)})})}get _canDollhouse(){const e=this.floors.find(e=>e.floor_id===this.floorId);return!!e?.building_id&&this.floors.some(t=>t.floor_id!==this.floorId&&t.building_id===e.building_id)}_ensureData(){const e=this._client;if(e)for(const t of this._contextFloorIds)this._view3d.has(t)||this._loadingView3d.has(t)||(this._loadingView3d.add(t),e.getView3d(t).catch(()=>({wall_height_m:null,floor_elevation_m:null,scans:[]})).then(e=>{this._loadingView3d.delete(t),this._view3d=new Map(this._view3d).set(t,e)})),t===this.floorId||this._otherLayouts.has(t)||(this._otherLayouts=new Map(this._otherLayouts).set(t,null),e.getLayout(t).then(e=>{this._otherLayouts=new Map(this._otherLayouts).set(t,e)}).catch(()=>{}))}_layoutOf(e){return e===this.floorId?this.layout:this._otherLayouts.get(e)??null}_wallHeight(e){return this._view3d.get(e)?.wall_height_m??2.4}get _date(){return null===this._hour?new Date:function(e,t){const i=qr(new Date,t),n=Date.UTC(i.y,i.mo-1,i.d,Math.floor(e),Math.round(e%1*60)),o=qr(new Date(n),t),r=Date.UTC(o.y,o.mo-1,o.d,o.h,o.mi)-n;return new Date(n-r)}(this._hour,this.hass?.config)}get _roofShown(){return this.dollhouse&&this._roof&&this._shownFloorIds.length>1}get _scans(){return this.floorId&&this._view3d.get(this.floorId)?.scans||[]}get _selectedScan(){return this._scans.find(e=>e.id===this._selectedScanId)??null}_patchView3d(e,t="soon"){const i=this.floorId;if(!i)return;const n=e(this._view3d.get(i)??{wall_height_m:null,floor_elevation_m:null,scans:[]});this._view3d=new Map(this._view3d).set(i,n),t&&this.editable&&(clearTimeout(this._saveTimers.get(i)),this._saveTimers.set(i,setTimeout(()=>{this._saveTimers.delete(i),this._saveNow(i)},"now"===t?0:700)))}async _saveNow(e){const t=this._view3d.get(e),i=this._client;if(t&&i)try{await i.saveView3d(e,t)}catch(e){this._error=He("view3d.saveFailed",{error:e?.message??String(e)})}}_patchScan(e,t,i="soon"){this._patchView3d(i=>({...i,scans:i.scans.map(i=>i.id===e?{...i,...t}:i)}),i)}_scanXY(e){return null!==e.x&&null!==e.y?[e.x,e.y]:this.layout?Yr(this.layout):[0,0]}_nudge(e,t){const i=this._selectedScan;if(!i||!this.layout)return;const n=1/(100*Sr(this.layout.scale)),[o,r]=this._scanXY(i);this._patchScan(i.id,{x:o+e*n,y:r+t*n})}_rotate(e){const t=this._selectedScan;if(!t)return;let i=t.rotation_deg+e;i=((i+180)%360+360)%360-180;const[n,o]=this._scanXY(t);this._patchScan(t.id,{rotation_deg:i,x:n,y:o})}async _deleteScan(e){if(confirm(He("view3d.deleteConfirm",{name:e.name})))try{await(this._client?.deleteScan(e.id)),this._patchView3d(t=>({...t,scans:t.scans.filter(t=>t.id!==e.id)}),!1),this._selectedScanId===e.id&&(this._selectedScanId=null)}catch(e){this._error=e?.message??String(e)}}async _export(){if(this._handle){this._exporting=!0;try{const e=await this._handle.exportGlb(),t=this.floors.find(e=>e.floor_id===this.floorId)?.name??"floor-plan",i=document.createElement("a");i.href=URL.createObjectURL(e),i.download=`${t.replace(/[^\w-]+/g,"-").toLowerCase()}${this.dollhouse?"-building":""}.glb`,document.body.appendChild(i),i.click(),i.remove(),setTimeout(()=>URL.revokeObjectURL(i.href),1e4)}catch(e){this._error=e?.message??String(e)}finally{this._exporting=!1}}}_fire(e){this.dispatchEvent(new CustomEvent(e,{bubbles:!0,composed:!0}))}render(){const e=null===this._hour?He("view3d.now"):`${String(Math.floor(this._hour)).padStart(2,"0")}:${String(Math.round(this._hour%1*60)).padStart(2,"0")}`;return N`
      <div class="stage"></div>
      ${"error"===this._status?N`<div class="notice error">${this._error}</div>`:"ready"!==this._status?N`<div class="notice">${He("view3d.loading")}</div>`:K}
      <div class="toolbar">
        ${this.closable?N`<div class="group">
                <button
                  title=${He("view3d.close")}
                  @click=${()=>this._fire("close-3d")}
                >
                  <ha-icon icon="mdi:floor-plan"></ha-icon>
                  2D
                </button>
              </div>`:K}
        <div class="group">
          <button
            class="icon"
            title=${He("view3d.orbitView")}
            @click=${()=>this._handle?.view("orbit")}
          >
            <ha-icon icon="mdi:rotate-3d-variant"></ha-icon>
          </button>
          <button
            class="icon"
            title=${He("view3d.topView")}
            @click=${()=>this._handle?.view("top")}
          >
            <ha-icon icon="mdi:arrow-collapse-down"></ha-icon>
          </button>
          ${this._hasScans?N`<button
                  class=${"scan"===this._scanMode?"active":""}
                  title=${He("view3d.scanModeHint")}
                  @click=${()=>{this._scanMode="scan"===this._scanMode?"plan":"scan";try{localStorage.setItem(Gr,this._scanMode)}catch{}}}
                >
                  <ha-icon icon="mdi:cube-scan"></ha-icon>
                  ${He("view3d.scanMode")}
                </button>`:K}
          ${this._canDollhouse?N`<button
                  class=${this.dollhouse?"active":""}
                  title=${He("view3d.dollhouseHint")}
                  @click=${()=>{this.dollhouse=!this.dollhouse,this._sceneSig=""}}
                >
                  <ha-icon icon="mdi:home-floor-3"></ha-icon>
                  ${He("view3d.dollhouse")}
                </button>`:K}
          ${this.dollhouse&&this._shownFloorIds.length>1?N`<button
                  class=${this._roof?"active":""}
                  title=${He("view3d.roofHint")}
                  @click=${()=>{this._roof=!this._roof;try{localStorage.setItem(Kr,this._roof?"on":"off")}catch{}}}
                >
                  <ha-icon icon="mdi:home-roof"></ha-icon>
                  ${He("view3d.roof")}
                </button>`:K}
          ${this.dollhouse&&this._shownFloorIds.length>1?N`<label title=${He("view3d.spread")}>
                  <ha-icon icon="mdi:arrow-expand-vertical"></ha-icon>
                  <input
                    type="range"
                    min="0"
                    max="4"
                    step="0.1"
                    .value=${String(this._spread)}
                    @input=${e=>{this._spread=Number(e.target.value)}}
                  />
                </label>`:K}
        </div>
        <div class="group">
          <label class="time" title=${He("view3d.sunTime")}>
            <ha-icon icon="mdi:weather-sunny"></ha-icon>
            <input
              type="range"
              min="0"
              max="24"
              step="0.25"
              .value=${String(this._hour??function(e,t){const i=qr(e,t);return i.h+i.mi/60}(new Date,this.hass?.config))}
              @input=${e=>{this._hour=Number(e.target.value)}}
            />
            <span>${e}</span>
          </label>
          ${null!==this._hour?N`<button
                  class="icon"
                  title=${He("view3d.now")}
                  @click=${()=>this._hour=null}
                >
                  <ha-icon icon="mdi:clock-outline"></ha-icon>
                </button>`:K}
        </div>
        <span class="spacer"></span>
        <div class="group">
          <button
            title=${He("view3d.exportHint")}
            ?disabled=${!this._handle||this._exporting}
            @click=${()=>{this._export()}}
          >
            <ha-icon icon="mdi:download"></ha-icon>
            ${this._exporting?He("view3d.exporting"):"glTF"}
          </button>
          ${this.editable?N`<button
                  class=${this._sheetOpen?"active":""}
                  title=${He("view3d.scansHint")}
                  @click=${()=>this._sheetOpen=!this._sheetOpen}
                >
                  <ha-icon icon="mdi:cube-scan"></ha-icon>
                  ${He("view3d.scans")}
                </button>`:K}
        </div>
      </div>
      ${this.editable&&this._sheetOpen?this._renderSheet():K}
      <input
        type="file"
        accept=".glb,.gltf,model/gltf-binary,model/gltf+json"
        hidden
        @change=${this._onPickFile}
      />
    `}_renderSheet(){const e=this._scans,t=this._selectedScan,i=this.floorId?this._wallHeight(this.floorId):2.4,n=this.floorId?this._view3d.get(this.floorId)?.floor_elevation_m??null:null;return N`<div class="sheet floating-panel">
      <h3>${He("view3d.scans")}</h3>
      <div class="row">
        <span>${He("view3d.wallHeight")}</span>
        <input
          type="number"
          min="1.8"
          max="6"
          step="0.05"
          .value=${String(i)}
          @change=${e=>{const t=Number(e.target.value);t>=1&&t<=10&&this._patchView3d(e=>({...e,wall_height_m:t}),"now")}}
        />
        <span>m</span>
      </div>
      <div class="row" title=${He("view3d.floorElevationHint")}>
        <span>${He("view3d.floorElevation")}</span>
        <input
          type="number"
          min="-10"
          max="50"
          step="0.01"
          placeholder=${He("view3d.floorElevationAuto")}
          .value=${null===n?"":String(n)}
          @change=${e=>{const t=e.target,i=t.value.trim(),o=""===i?null:Number(i);null===o||Number.isFinite(o)&&o>=-50&&o<=100?this._patchView3d(e=>({...e,floor_elevation_m:o}),"now"):t.value=null===n?"":String(n)}}
        />
        <span>m</span>
      </div>
      ${this._renderGround()} ${this._renderRoof()}
      <div class="divider"></div>
      <span class="hint">${He("view3d.scansIntro")}</span>
      <div class="buttons">
        <button
          class="primary"
          ?disabled=${this._uploading}
          @click=${()=>this._fileInput.click()}
        >
          ${this._uploading?He("view3d.uploading"):He("view3d.importScan")}
        </button>
      </div>
      ${this._error?N`<span class="hint error">${this._error}</span>`:K}
      ${e.map(e=>{return N`<div
            class="scan ${e.id===this._selectedScanId?"selected":""}"
            @click=${()=>this._selectedScanId=e.id===this._selectedScanId?null:e.id}
          >
            <div class="name">
              ${e.name}
              <div class="meta">
                ${this._scanStatus.get(e.id)??(t=e.size_bytes,t<1048576?`${Math.max(1,Math.round(t/1024))} KB`:`${(t/1048576).toFixed(1)} MB`)}
              </div>
            </div>
            <button
              title=${e.visible?He("view3d.hide"):He("view3d.show")}
              @click=${t=>{t.stopPropagation(),this._patchScan(e.id,{visible:!e.visible},"now")}}
            >
              <ha-icon
                icon=${e.visible?"mdi:eye":"mdi:eye-off"}
              ></ha-icon>
            </button>
            <button
              class="danger"
              title=${He("view3d.delete")}
              @click=${t=>{t.stopPropagation(),this._deleteScan(e)}}
            >
              <ha-icon icon="mdi:delete"></ha-icon>
            </button>
          </div>`;var t})}
      ${t?this._renderScanControls(t):K}
    </div>`}_renderGround(){const e=this._ground,t=(t,i)=>N`<div class="row">
        <span>${i}</span>
        <input
          type="number"
          min="-50"
          max="100"
          step="0.01"
          placeholder="0"
          .value=${e?String(e[t]):""}
          @change=${i=>{const n=i.target,o=Number(n.value.trim()||"0");Number.isFinite(o)&&o>=-50&&o<=100?this._setGround({[t]:o}):n.value=e?String(e[t]):""}}
        />
        <span>m</span>
      </div>`;return N`
      <div class="divider"></div>
      <div class="row" title=${He("view3d.groundHint")}>
        <span>${He("view3d.ground")}</span>
        ${e?N`<button @click=${()=>this._setGround(null)}>
                ${He("view3d.groundFlat")}
              </button>`:N`<span class="hint"
                >${He("view3d.groundFlatNow")}</span
              >`}
      </div>
      ${t("uphill_m",He("view3d.groundUphill"))}
      ${t("downhill_m",He("view3d.groundDownhill"))}
      <div class="row">
        <span>${He("view3d.groundToward")}</span>
        <select
          @change=${e=>this._setGround({downhill_deg:Number(e.target.value)})}
        >
          ${Zi.filter((e,t)=>t%2==0).map(t=>N`<option
                value=${t.deg}
                ?selected=${(e?.downhill_deg??0)===t.deg}
              >
                ${t.name}
              </option>`)}
        </select>
      </div>
      <span class="hint">${He("view3d.groundHint")}</span>
    `}_renderRoof(){const e=this._roofPlan,t=this._roofDraft??(e?e.parts.map(e=>JSON.stringify(e)).join(",\n"):"");return N`
      <div class="divider"></div>
      <div class="row" title=${He("view3d.roofPartsHint")}>
        <span>${He("view3d.roofParts")}</span>
        ${e?N`<button
                ?disabled=${!this.editable}
                @click=${()=>{this._roofDraft=null,this._setRoof(null)}}
              >
                ${He("view3d.roofAuto")}
              </button>`:N`<span class="hint">${He("view3d.roofAutoNow")}</span>`}
      </div>
      <textarea
        class="roof-parts"
        rows="6"
        spellcheck="false"
        ?readonly=${!this.editable}
        .value=${t}
        @input=${e=>this._roofDraft=e.target.value}
      ></textarea>
      ${this.editable&&null!==this._roofDraft?N`<div class="buttons">
              <button class="primary" @click=${()=>{const e=t.trim();if(!e)return this._roofDraft=null,void this._setRoof(null);const i=function(e){let t;try{t=JSON.parse(e.startsWith("[")?e:`[${e}]`)}catch{return null}if(!Array.isArray(t))return null;const i=e=>"number"==typeof e&&Number.isFinite(e),n=e=>"gable"===e||"hip"===e||"open"===e,o=(e,t)=>Array.isArray(e)&&2===e.length&&e.every(t),r=t.every(e=>{if(!e||"object"!=typeof e)return!1;const t=e;return["x0","y0","x1","y1","pitch"].every(e=>i(t[e]))&&("x"===t.ridge||"y"===t.ridge)&&(i(t.eave)||o(t.eave,i))&&(void 0===t.ends||o(t.ends,n))&&(void 0===t.overhang||i(t.overhang))&&(void 0===t.base||i(t.base))&&(void 0===t.gable||"siding"===t.gable||"shake"===t.gable)});return r?t:null}(e);i?(this._roofDraft=null,this._setRoof({parts:i})):this._error=He("view3d.roofInvalid")}}>
                ${He("view3d.roofApply")}
              </button>
              <button @click=${()=>this._roofDraft=null}>
                ${He("view3d.roofRevert")}
              </button>
            </div>`:K}
      <span class="hint">${He("view3d.roofPartsHint")}</span>
    `}_renderScanControls(e){const t=e=>Number(e.target.value);return N`
      <div class="divider"></div>
      <span class="hint">${He("view3d.alignHint")}</span>
      <div class="buttons">
        <button
          class=${this._moveMode?"active":""}
          @click=${()=>this._moveMode=!this._moveMode}
        >
          ${He("view3d.drag")}
        </button>
        <button
          @click=${()=>this._handle?.autoAlignScan(e.id)}
          title=${He("view3d.autoAlignHint")}
        >
          ${He("view3d.autoAlign")}
        </button>
        <button @click=${()=>this._handle?.view("top")}>
          ${He("view3d.topView")}
        </button>
      </div>
      <label class="row">
        <span>${He("view3d.snap")}</span>
        <input
          type="checkbox"
          class="switch"
          role="switch"
          .checked=${this._snap}
          @change=${e=>this._snap=e.target.checked}
        />
      </label>
      <div class="row">
        <span>${He("view3d.move")}</span>
        <div class="nudge">
          <span></span>
          <button title="↑ 5 cm" @click=${()=>this._nudge(0,-5)}>
            <ha-icon icon="mdi:arrow-up"></ha-icon>
          </button>
          <span></span>
          <button title="← 5 cm" @click=${()=>this._nudge(-5,0)}>
            <ha-icon icon="mdi:arrow-left"></ha-icon>
          </button>
          <span></span>
          <button title="→ 5 cm" @click=${()=>this._nudge(5,0)}>
            <ha-icon icon="mdi:arrow-right"></ha-icon>
          </button>
          <span></span>
          <button title="↓ 5 cm" @click=${()=>this._nudge(0,5)}>
            <ha-icon icon="mdi:arrow-down"></ha-icon>
          </button>
          <span></span>
        </div>
      </div>
      <div class="row">
        <span>${He("view3d.rotation")}</span>
        <input
          type="number"
          step="0.5"
          .value=${String(Math.round(10*e.rotation_deg)/10)}
          @change=${i=>this._rotate(t(i)-e.rotation_deg)}
        />
        <span>°</span>
      </div>
      <div class="buttons">
        <button @click=${()=>this._rotate(-90)}>−90°</button>
        <button @click=${()=>this._rotate(-1)}>−1°</button>
        <button @click=${()=>this._rotate(1)}>+1°</button>
        <button @click=${()=>this._rotate(90)}>+90°</button>
      </div>
      <div class="row">
        <span>${He("view3d.scale")}</span>
        <input
          type="number"
          min="0.01"
          step="0.005"
          .value=${String(e.scale)}
          @change=${i=>{const n=t(i);n>0&&this._patchScan(e.id,{scale:n})}}
        />
      </div>
      <div class="row">
        <span>${He("view3d.elevation")}</span>
        <input
          type="number"
          step="1"
          .value=${String(Math.round(100*e.elevation_m))}
          @change=${i=>this._patchScan(e.id,{elevation_m:t(i)/100})}
        />
        <span>cm</span>
      </div>
      <div class="row">
        <span>${He("view3d.opacity")}</span>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          .value=${String(e.opacity)}
          @input=${i=>this._patchScan(e.id,{opacity:t(i)})}
        />
      </div>
      <label class="row">
        <span>${He("view3d.replaceWalls")}</span>
        <input
          type="checkbox"
          class="switch"
          role="switch"
          .checked=${e.hide_walls}
          @change=${t=>this._patchScan(e.id,{hide_walls:t.target.checked},"now")}
        />
      </label>
    `}};var Xr;Qr.styles=[yt,xt,a`
      :host {
        position: relative;
        display: block;
        overflow: hidden;
        background: var(--sc-bg);
      }
      .stage {
        position: absolute;
        inset: 0;
      }
      .toolbar {
        position: absolute;
        top: 8px;
        left: 8px;
        right: 8px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 4px;
        pointer-events: none;
      }
      .toolbar > * {
        pointer-events: auto;
      }
      .group {
        display: flex;
        align-items: center;
        gap: 2px;
        padding: 2px;
        background: color-mix(in srgb, var(--sc-panel-bg) 92%, transparent);
        border: 1px solid var(--sc-divider);
        border-radius: var(--sc-r-control);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
      }
      .group button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 36px;
        padding: 0 10px;
        white-space: nowrap;
      }
      .group button.icon {
        width: 36px;
        padding: 0;
        justify-content: center;
      }
      .group ha-icon {
        --mdc-icon-size: 20px;
      }
      .group label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 0 8px;
        font-size: var(--sc-fs-small);
        color: var(--sc-fg-secondary);
        white-space: nowrap;
      }
      input[type="range"] {
        width: 110px;
        accent-color: var(--sc-accent);
      }
      .spacer {
        flex: 1;
      }
      .sheet {
        position: absolute;
        top: 56px;
        right: 8px;
        bottom: 8px;
        width: min(340px, calc(100% - 16px));
        overflow-y: auto;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .sheet h3 {
        margin: 0;
        font-size: var(--sc-fs-title);
        font-weight: 500;
      }
      .sheet .hint {
        font-size: var(--sc-fs-small);
        color: var(--sc-fg-secondary);
        line-height: 1.4;
      }
      .sheet textarea.roof-parts {
        box-sizing: border-box;
        width: 100%;
        min-height: 120px;
        resize: vertical;
        font-family: var(--code-font-family, monospace);
        font-size: var(--sc-fs-small);
        white-space: pre;
      }
      .row {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: var(--sc-fs-body);
      }
      .row > span:first-child {
        flex: 1;
      }
      .row input[type="number"],
      .row select {
        width: 84px;
        height: var(--sc-h-field);
        padding: 0 8px;
        border: 1px solid var(--sc-divider);
        border-radius: var(--sc-r-control);
        background: var(--sc-bg);
        color: var(--sc-fg);
        font: inherit;
      }
      .row input[type="range"] {
        flex: 1;
        width: auto;
      }
      .scan {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 4px 4px 10px;
        border-radius: 8px;
        cursor: pointer;
      }
      .scan.selected {
        background: color-mix(in srgb, var(--sc-accent) 14%, transparent);
      }
      .scan .name {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .scan .meta {
        font-size: var(--sc-fs-caption);
        color: var(--sc-fg-secondary);
      }
      .scan button,
      .nudge button {
        padding: 6px;
        display: inline-flex;
      }
      .scan ha-icon,
      .nudge ha-icon {
        --mdc-icon-size: 20px;
      }
      .nudge {
        display: grid;
        grid-template-columns: repeat(3, 36px);
        gap: 2px;
        justify-content: center;
      }
      .buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .buttons button {
        border: 1px solid var(--sc-divider);
      }
      .divider {
        border-top: 1px solid var(--sc-divider);
      }
      .notice {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        max-width: 80%;
        text-align: center;
        color: var(--sc-fg-secondary);
      }
      .error {
        color: var(--sc-danger);
      }
      @media (max-width: 600px) {
        .group label.time {
          display: none;
        }
        .sheet {
          top: auto;
          height: 55%;
        }
      }
    `],e([me({attribute:!1})],Qr.prototype,"hass",void 0),e([me({attribute:!1})],Qr.prototype,"floorId",void 0),e([me({attribute:!1})],Qr.prototype,"layout",void 0),e([me({attribute:!1})],Qr.prototype,"floors",void 0),e([me({attribute:!1})],Qr.prototype,"sky",void 0),e([me({type:Boolean})],Qr.prototype,"dark",void 0),e([me({type:Boolean})],Qr.prototype,"editable",void 0),e([me({type:Boolean})],Qr.prototype,"closable",void 0),e([me({type:Boolean})],Qr.prototype,"dollhouse",void 0),e([me({attribute:!1})],Qr.prototype,"moduleUrl",void 0),e([fe()],Qr.prototype,"_status",void 0),e([fe()],Qr.prototype,"_error",void 0),e([fe()],Qr.prototype,"_roofDraft",void 0),e([fe()],Qr.prototype,"_view3d",void 0),e([fe()],Qr.prototype,"_otherLayouts",void 0),e([fe()],Qr.prototype,"_spread",void 0),e([fe()],Qr.prototype,"_hour",void 0),e([fe()],Qr.prototype,"_sheetOpen",void 0),e([fe()],Qr.prototype,"_selectedScanId",void 0),e([fe()],Qr.prototype,"_moveMode",void 0),e([fe()],Qr.prototype,"_snap",void 0),e([fe()],Qr.prototype,"_scanMode",void 0),e([fe()],Qr.prototype,"_roof",void 0),e([fe()],Qr.prototype,"_uploading",void 0),e([fe()],Qr.prototype,"_scanStatus",void 0),e([fe()],Qr.prototype,"_exporting",void 0),e([_e(".stage")],Qr.prototype,"_stage",void 0),e([_e("input[type=file]")],Qr.prototype,"_fileInput",void 0),Qr=e([be("floorplan-3d-view")],Qr);const Jr="spatial-context-snap-mode";const es="spatial_context_overlays";let ts=Xr=class extends he{constructor(){super(...arguments),this._floors=[],this._currentFloorId=null,this._layout={background_image_id:null,background_opacity:.5,background_offset_x:0,background_offset_y:0,background_scale:1,building_id:null,view_box:null,rooms:[],pins:[],walls:[],openings:[],furniture:[],scale:null,north_deg:null},this._selectedFurnitureId=null,this._armedFurnitureKind=null,this._armedFurnitureRotation=0,this._furnitureLibraryOpen=!1,this._furnitureClipboard=null,this._pasteCount=0,this._overlays=function(){const e={furniture:!0,lights:!0,covers:!0};try{const t=localStorage.getItem(es);return t?{...e,...JSON.parse(t)}:e}catch{return e}}(),this._roomLights=new Map,this._coverOpenness=new Map,this._pinColors=new Map,this._itemStates=new Map,this._sky=null,this._sunPreviewMinutes=null,this._liveSig="",this._entities=[],this._areas=[],this._mode="select",this._snapMode=function(){try{const e=localStorage.getItem(Jr);if("all"===e||"same"===e||"off"===e)return e}catch{}return"all"}(),this._dragOverCanvas=!1,this._armedEntityId=null,this._armedOpeningType=null,this._selectedRoomId=null,this._editingRoomId=null,this._selectedPinId=null,this._pinStackIds=null,this._selectedWallId=null,this._editingWallId=null,this._selectedOpeningId=null,this._selectedMeshLink=null,this._selectedMeshStub=null,this._otherFloorPinsByDeviceId=new Map,this._dirty=!1,this._saving=!1,this._loading=!0,this._pendingCount=0,this._networkType=null,this._zigbeeMesh=null,this._zigbeeMeshLoading=!1,this._zigbeeMeshError=null,this._zigbeeMeshFetchedAt=null,this._zigbeeMeshElapsedSeconds=0,this._zigbeeMeshTimer=null,this._zigbeeShowAllLinks=!1,this._wifiMesh=null,this._wifiMeshLoading=!1,this._wifiMeshError=null,this._matterTopology=null,this._matterError=null,this._matterUnsubscribe=null,this._bluetoothAdverts=new Map,this._bluetoothBuffer=new Map,this._bluetoothFlushTimer=null,this._bluetoothDevices={},this._bluetoothError=null,this._bluetoothUnsubscribe=null,this._backgroundPopoverOpen=!1,this._meshPopoverOpen=!1,this._settings={unit_system:"metric",zigbee_timeout_seconds:180,floor_order:"top_down",zigbee_coordinator_device_id:null,auto_save:!0,debug_logging:!1,weather_entity_id:null,show_light_count:!0,room_border_show:!0,room_border_color:null,room_border_width:2,room_border_opacity:1,room_label_size:16,room_label_color:null,room_label_bold:!1,room_label_halo:!0,room_label_halo_width:3,room_label_halo_color:null,room_fill_under_background:!1,custom_icons:[],show_scale_line:!0},this._settingsPopoverOpen=!1,this._moreOptionsPopoverOpen=!1,this._view3dOpen=!1,this._view="floor",this._placementGhosts=new Map,this._propertyLayout={background_image_id:null,background_opacity:.85,background_offset_x:0,background_offset_y:0,background_scale:1,view_box:null,placements:[],pins:[]},this._propertyDirty=!1,this._saveError=null,this._iconPickerFor=null,this._versionNotice=null,this._autoSaveTimer=null,this._autoSaveHeld=!1,this._floorHistory=new $e,this._propertyHistory=new $e,this._propertyDragStart=null,this._propertySaving=!1,this._selectedPlacementId=null,this._propertyMode="select",this._selectedOutdoorPinId=null,this._selectedPropertyMeshLinkKey=null,this._armedBuildingKey=null,this._sameBuildingAsPreviousFloor=!1,this._alignTargetFloorId=null,this._alignTargetLayout=null,this._alignOffsetX=0,this._alignOffsetY=0,this._alignScale=1,this._initialized=!1,this._onNorthChange=e=>{this._updateLayout({north_deg:null===e?null:(Math.round(e)%360+360)%360})},this._onRoomDeviceToggle=e=>{e.detail.on?this._placeDevicesInRoom([e.detail.deviceId]):this._updateLayout({pins:this._layout.pins.filter(t=>t.device_id!==e.detail.deviceId)})},this._onRoomDevicesAddAll=()=>{const e=this._areaDevices(this._selectedRoom).filter(e=>"none"===e.placed).map(e=>e.deviceId);this._placeDevicesInRoom(e)},this._onPinIconQuick=e=>{const t=this._selectedPin;t&&this._patchPin(t.id,{icon_override:e.detail.icon})},this._onFloorSelected=e=>{this._selectFloor(e.detail.floorId)},this._onPropertySelected=()=>{this._selectProperty()},this._onToggleMapBackground=()=>{const e=this._hass?.config;this._propertyLayout.map_background?("map"===this._propertyMode&&(this._propertyMode="select"),this._updatePropertyLayout({map_background:null})):void 0!==e?.latitude&&void 0!==e.longitude&&this._updatePropertyLayout({map_background:{lat:e.latitude,lon:e.longitude,zoom:18,opacity:1,style:"street"}})},this._onMapAdjust=e=>{const t=e.detail;this._adjustMap(e=>{switch(t.op){case"pan":return co(e,t.dx,t.dy);case"zoom":return ho(e,t.factor,t.at);case"rotate":return uo(e,(e.rotation_deg??0)+t.deltaDeg,t.at);case"pinch":{const i=ho(co(e,t.dx,t.dy),t.factor,t.at);return uo(i,(i.rotation_deg??0)+t.rotateDeg,t.at)}}})},this._onMapRotationSet=e=>{const t=this._propertyCanvas?.getViewCenter()??{x:0,y:0};this._adjustMap(i=>uo(i,e.detail.deg,t))},this._onMapZoomStep=e=>{const t=this._propertyCanvas?.getViewCenter()??{x:0,y:0};this._adjustMap(i=>ho(i,e.detail.factor,t))},this._onMapStyleChange=e=>{const t=this._propertyLayout.map_background;t&&this._updatePropertyLayout({map_background:{...t,style:e.target.value}})},this._onMapOpacityChange=e=>{const t=this._propertyLayout.map_background;t&&this._updatePropertyLayout({map_background:{...t,opacity:Number(e.target.value)}})},this._onUndo=()=>this._undoRedo("undo"),this._onRedo=()=>this._undoRedo("redo"),this._onPropertyModeChange=e=>{this._propertyMode=e.detail.mode,this._armedBuildingKey=null,this._armedEntityId=null,this._selectedPlacementId=null},this._onOutdoorPinPlace=e=>{if(!this._armedEntityId)return;const t=this._entityLookup.get(this._armedEntityId),i=De(t?.device_id??null,e.detail.x,e.detail.y,null);this._updatePropertyLayout({pins:[...this._propertyLayout.pins,i]}),this._armedEntityId=null,this._selectedOutdoorPinId=i.id,this._selectedPlacementId=null,this._selectedPropertyMeshLinkKey=null},this._onOutdoorPinMove=e=>{this._patchOutdoorPin(e.detail.id,{x:e.detail.x,y:e.detail.y})},this._onOutdoorPinSelect=e=>{this._selectedOutdoorPinId=e.detail.id,null!==e.detail.id&&(this._selectedPlacementId=null,this._selectedPropertyMeshLinkKey=null)},this._onOutdoorPinLabelChange=e=>{const t=this._selectedOutdoorPin;t&&this._patchOutdoorPin(t.id,{label_override:e.detail.label.trim()||null})},this._onPropertySelectionClear=()=>{this._selectedPlacementId=null,this._selectedOutdoorPinId=null,this._selectedPropertyMeshLinkKey=null},this._onOutdoorPinIcon=()=>{const e=this._selectedOutdoorPin;e&&(this._iconPickerFor={kind:"outdoor",pinId:e.id})},this._onOutdoorPinDelete=()=>{const e=this._selectedOutdoorPin;e&&window.confirm(`Remove "${this._pinLabel(e)}" from the property?`)&&(this._updatePropertyLayout({pins:this._propertyLayout.pins.filter(t=>t.id!==e.id)}),this._selectedOutdoorPinId=null)},this._onPropertyMeshLinkSelect=e=>{this._selectedPropertyMeshLinkKey=e.detail.key,null!==e.detail.key&&(this._selectedOutdoorPinId=null,this._selectedPlacementId=null)},this._onClearAllOutdoorPins=()=>{const e=this._propertyLayout.pins.length;0!==e&&window.confirm(He(1===e?"confirm.removeOutdoorOne":"confirm.removeOutdoorMany",{count:e}))&&(this._autoSaveHeld=!0,this._updatePropertyLayout({pins:[]}),this._selectedOutdoorPinId=null)},this._onPropertyMeshGotoFloor=e=>{this._selectFloor(e.detail.floorId)},this._onPlacementArm=e=>{this._armedBuildingKey=e.detail.key,this._propertyMode="place",this._selectedPlacementId=null},this._onPlacementPlace=e=>{if(!this._armedBuildingKey)return;const t=this._buildings.find(e=>e.key===this._armedBuildingKey);if(!t)return;const i=function(e,t,i,n,o,r){const s=o>=1?Ue:Ue*o,a=o>=1?Ue/o:Ue;return{id:Ee("placement"),building_id:t,floor_id:e,label_override:null,x:i,y:n,width:s,height:a,rotation_deg:0,aspect_ratio:o,source_bounds:r}}(t.floorId,t.buildingId,e.detail.x,e.detail.y,t.aspectRatio,this._buildingBounds(this._floors.filter(e=>(e.building_id??e.floor_id)===t.key)));this._updatePropertyLayout({placements:[...this._propertyLayout.placements,i]}),this._armedBuildingKey=null,this._propertyMode="select",this._selectedPlacementId=i.id},this._onPlacementMove=e=>{const t=this._propertyLayout.placements.find(t=>t.id===e.detail.id);t&&this._patchPlacement(e.detail.id,{x:t.x+e.detail.dx,y:t.y+e.detail.dy})},this._onPlacementResize=e=>{this._patchPlacement(e.detail.id,{width:e.detail.width,height:e.detail.height,x:e.detail.x,y:e.detail.y})},this._onPlacementRotate=e=>{this._patchPlacement(e.detail.id,{rotation_deg:e.detail.rotationDeg})},this._onPlacementSelect=e=>{this._selectedPlacementId=e.detail.id,null!==e.detail.id&&(this._selectedOutdoorPinId=null,this._selectedPropertyMeshLinkKey=null)},this._onPlacementLabelChange=e=>{const t=this._selectedPlacement;t&&this._patchPlacement(t.id,{label_override:e.detail.label.trim()||null})},this._onPlacementDeleteClick=()=>{const e=this._selectedPlacement;if(!e)return;const t=e.label_override??this._floorNameById.get(e.floor_id)??e.floor_id;window.confirm(He("confirm.deletePlacement",{label:t}))&&(this._updatePropertyLayout({placements:this._propertyLayout.placements.filter(t=>t.id!==e.id)}),this._selectedPlacementId=null)},this._onPlacementGotoFloorClick=()=>{const e=this._selectedPlacement;e&&this._selectFloor(e.floor_id)},this._onModeChange=e=>{this._mode=this._mode===e.detail.mode?"select":e.detail.mode,this._armedEntityId=null,this._armedOpeningType=null,this._armedFurnitureKind=null,"place"===this._mode&&(this._furnitureLibraryOpen=!1),"select"!==this._mode&&(this._editingRoomId=null,this._editingWallId=null),"align"!==this._mode&&this._resetAlignState()},this._onAddOpeningClick=e=>{this._mode="opening",this._armedOpeningType=e.detail.openingType,this._editingRoomId=null,this._editingWallId=null},this._settingsUnsaved=!1,this._onSaveClick=()=>{this._autoSaveHeld=!1,this._settingsUnsaved&&this._saveSettingsNow().catch(()=>{});("property"===this._view?this._saveProperty():this._save()).catch(()=>{})},this._placementKeyForEntities=null,this._onVisibilityChange=()=>{"visible"===document.visibilityState&&this._checkVersion()},this._onCalibrateScaleClick=()=>{"scale"!==this._mode&&this._onModeChange(new CustomEvent("mode-change",{detail:{mode:"scale"}}))},this._onPickerClose=()=>{this._mode="select",this._propertyMode="select",this._armedEntityId=null},this._onBeforeUnload=e=>{(this._dirty||this._propertyDirty)&&(this._flushAutoSave(),e.preventDefault(),e.returnValue="")},this._onExportClick=()=>{this._export()},this._onResetClick=()=>{if("property"===this._view){if(!window.confirm(He("confirm.resetProperty")))return;return this._autoSaveHeld=!0,this._propertyHistory.record(this._propertyLayout),this._propertyLayout={background_image_id:null,background_opacity:.85,background_offset_x:0,background_offset_y:0,background_scale:1,view_box:null,placements:[],pins:[]},this._propertyDirty=!0,this._selectedPlacementId=null,this._selectedOutdoorPinId=null,void(this._selectedPropertyMeshLinkKey=null)}const e=this._floors.find(e=>e.floor_id===this._currentFloorId)?.name??He("floor.thisFloor");window.confirm(He("confirm.resetFloor",{floor:e}))&&(this._autoSaveHeld=!0,this._floorHistory.record(this._layout),this._layout={background_image_id:null,background_opacity:.5,background_offset_x:0,background_offset_y:0,background_scale:1,building_id:null,view_box:null,rooms:[],pins:[],walls:[],openings:[],furniture:[],scale:null,north_deg:null},this._dirty=!0,this._resetSelection(),this._pinStackIds=null)},this._onToggleBackgroundPopover=()=>{this._backgroundPopoverOpen=!this._backgroundPopoverOpen,this._meshPopoverOpen=!1,this._settingsPopoverOpen=!1,this._moreOptionsPopoverOpen=!1},this._onToggleMeshPopover=()=>{this._meshPopoverOpen=!this._meshPopoverOpen,this._backgroundPopoverOpen=!1,this._settingsPopoverOpen=!1,this._moreOptionsPopoverOpen=!1},this._onToggleSettingsPopover=()=>{this._settingsPopoverOpen=!this._settingsPopoverOpen,this._backgroundPopoverOpen=!1,this._meshPopoverOpen=!1,this._moreOptionsPopoverOpen=!1},this._onToggleMoreOptionsPopover=()=>{this._moreOptionsPopoverOpen=!this._moreOptionsPopoverOpen,this._backgroundPopoverOpen=!1,this._meshPopoverOpen=!1,this._settingsPopoverOpen=!1},this._onSettingsChange=e=>{const t=e.detail;this._settings={...this._settings,...t};const i=this._saveSettingsNow();if("auto_save"in t&&this._scheduleAutoSave(),"zigbee_coordinator_device_id"in t&&(this._selectedMeshLink=null,this._selectedMeshStub=null),"debug_logging"in t){const e=!!t.debug_logging;i.then(()=>{Le.configure(this._client,e),Le.log("debug_logging_on",{panel_version:"0.15.0-beta.1",panel_build:"0.15.0-beta.1+mve0sfhy",user_agent:navigator.userAgent})})}},this._onNetworkTypeSelect=e=>{const t=this._networkType===e?null:e;"matter"===this._networkType&&"matter"!==t&&this._unsubscribeMatter(),"bluetooth"===this._networkType&&"bluetooth"!==t&&this._unsubscribeBluetooth(),this._networkType=t,this._selectedMeshLink=null,this._selectedMeshStub=null,"wifi"===t?this._refreshWifiMesh():"matter"===t?this._subscribeMatter():"bluetooth"===t?this._subscribeBluetooth():"zigbee"===t&&this._loadCachedZigbeeMesh()},this._onLoadMesh=()=>{this._refreshZigbeeMesh(null!==this._zigbeeMeshFetchedAt)},this._fitToViewport=()=>{const e=window.visualViewport?.height??window.innerHeight,t=Math.max(this.getBoundingClientRect().top,0);this.style.height=`${Math.max(240,Math.floor(e-t))}px`},this._onKeyDown=e=>{if(this._isTypingTarget())return;if(this._iconPickerFor)return;if("Escape"===e.key){if(e.preventDefault(),"floor"===this._view&&this._canvas?.cancelGesture())return;return"property"===this._view&&this._propertyCanvas?.cancelGesture()?void(this._propertyDragStart&&(this._propertyHistory.discardIfLast(this._propertyDragStart),this._propertyLayout=this._propertyDragStart,this._propertyDragStart=null)):(this._onCancelPending(),this._mode="select",this._armedEntityId=null,this._armedOpeningType=null,this._armedFurnitureKind=null,this._armedBuildingKey=null,void(this._propertyMode="select"))}const t=e.ctrlKey||e.metaKey,i=e.key.toLowerCase(),n=t&&!e.shiftKey&&"z"===i,o=t&&(e.shiftKey&&"z"===i||"y"===i);if((n||"Backspace"===e.key)&&this._canvas?.undoLastPoint())return void e.preventDefault();if(n||o)return e.preventDefault(),void this._undoRedo(n?"undo":"redo");if("Delete"===e.key||"Backspace"===e.key)return"property"===this._view?((this._selectedOutdoorPin||this._selectedPlacement)&&e.preventDefault(),void(this._selectedOutdoorPin?this._onOutdoorPinDelete():this._selectedPlacement&&this._onPlacementDeleteClick())):((this._selectedRoom||this._selectedPin||this._selectedWall||this._selectedOpening||this._selectedFurniture)&&e.preventDefault(),void(this._selectedFurniture?this._onFurnitureDelete():this._selectedRoom?this._onRoomDelete():this._selectedPin?this._onPinDelete():this._selectedWall?this._onWallDelete():this._selectedOpening&&this._onOpeningDelete()));if("Enter"===e.key&&"wall"===this._mode)return e.preventDefault(),void this._onFinishWall();if("Enter"===e.key&&"furniture"===this._mode&&this._armedFurnitureKind===Hi)return e.preventDefault(),void this._canvas?.finishPendingShape();if("floor"!==this._view)return;const r=this._selectedFurniture;if(!t&&"r"===i){const t=e.shiftKey?15:90;return void("furniture"===this._mode&&this._armedFurnitureKind?(e.preventDefault(),this._armedFurnitureRotation=(this._armedFurnitureRotation+t)%360):r&&!r.locked&&(e.preventDefault(),this._patchFurniture(r.id,{rotation_deg:(r.rotation_deg+t)%360})))}if(t&&"d"===i&&r)return e.preventDefault(),void this._onFurnitureDuplicate();if(t&&("c"===i||"x"===i)&&r)return e.preventDefault(),this._furnitureClipboard={...r},this._pasteCount=0,void("x"===i&&this._onFurnitureDelete());if(t&&"v"===i&&this._furnitureClipboard)return e.preventDefault(),void this._pasteFurniture();const s={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(s&&r&&!r.locked){e.preventDefault();const t=(e.shiftKey?10:1)*this._unitsPerCm;this._patchFurniture(r.id,{x:r.x+s[0]*t,y:r.y+s[1]*t})}},this._onFileInputChange=async e=>{const t=e.target,i=t.files?.[0];t.value="",i&&this._handleBackgroundFile(i)},this._onSvgImportInputChange=e=>{const t=e.target,i=t.files?.[0];t.value="",i&&this._handleSvgFile(i,"import")},this._onCanvasDragOver=e=>{e.dataTransfer?.types.includes("Files")&&(e.preventDefault(),this._dragOverCanvas=!0)},this._onCanvasDragLeave=()=>{this._dragOverCanvas=!1},this._onCanvasDrop=e=>{if(!e.dataTransfer?.types.includes("Files"))return;e.preventDefault(),this._dragOverCanvas=!1;const t=e.dataTransfer.files?.[0];t&&this._handleBackgroundFile(t)},this._onRemoveBackgroundClick=()=>{"property"===this._view?this._updatePropertyLayout({background_image_id:null}):this._updateLayout({background_image_id:null})},this._onOpacityChange=e=>{const t=Number(e.target.value);"property"===this._view?this._updatePropertyLayout({background_opacity:t}):this._updateLayout({background_opacity:t})},this._onCancelPending=()=>this._canvas?.cancelPending(),this._onFinishWall=()=>this._canvas?.finishPendingWall(),this._onAlignTargetChange=async e=>{const t=e.detail.floorId;t?(this._alignTargetFloorId=t,this._alignOffsetX=0,this._alignOffsetY=0,this._alignScale=1,this._alignTargetLayout=await this._client.getLayout(t)):this._resetAlignState()},this._onAlignDrag=e=>{this._alignOffsetX+=e.detail.dx,this._alignOffsetY+=e.detail.dy},this._onAlignScaleClick=e=>{const{factor:t}=e.detail,i=this._canvas?.getViewBox();if(i){const e=i.x+i.w/2,n=i.y+i.h/2;this._alignOffsetX=t*this._alignOffsetX+(1-t)*e,this._alignOffsetY=t*this._alignOffsetY+(1-t)*n}this._alignScale*=t},this._onAlignCancel=()=>{this._mode="select",this._resetAlignState()},this._onAlignApply=async()=>{if(!this._alignTargetFloorId||!this._alignTargetLayout)return;const e=this._alignTargetFloorId,t=this._floors.find(t=>t.floor_id===e)?.name??He("floor.thatFloor");if(!window.confirm(He("confirm.applyAlignment",{floor:t})))return;const i=this._alignScale,n=this._alignOffsetX,o=this._alignOffsetY,r=([e,t])=>[e*i+n,t*i+o],s=this._alignTargetLayout,a=this._layout.building_id??Ee("building"),l={background_image_id:s.background_image_id,background_opacity:s.background_opacity,background_offset_x:s.background_offset_x*i+n,background_offset_y:s.background_offset_y*i+o,background_scale:s.background_scale*i,building_id:a,view_box:s.view_box?(()=>{const[e,t]=r([s.view_box.x,s.view_box.y]);return{x:e,y:t,w:s.view_box.w*i,h:s.view_box.h*i}})():null,rooms:s.rooms.map(e=>({...e,points:e.points.map(r)})),walls:s.walls.map(e=>({...e,points:e.points.map(r)})),pins:s.pins.map(e=>{const[t,i]=r([e.x,e.y]);return{...e,x:t,y:i}}),openings:s.openings.map(e=>{const[t,n]=r([e.x,e.y]);return{...e,x:t,y:n,width:e.width*i}}),north_deg:s.north_deg,furniture:s.furniture.map(e=>{const[t,i]=r([e.x,e.y]);return{...e,x:t,y:i}}),scale:this._layout.scale??(s.scale?{points:[r(s.scale.points[0]),r(s.scale.points[1])],meters:s.scale.meters}:null)};await this._client.saveLayout(e,l),this._layout.building_id!==a&&(await this._client.setBuildingId(this._currentFloorId,a),this._layout={...this._layout,building_id:a}),this._floors=await this._client.listFloors(),this._mode="select",this._resetAlignState(),this._floorHistory.clear()},this._onFurnitureLibraryClick=()=>{this._furnitureLibraryOpen=!this._furnitureLibraryOpen,this._furnitureLibraryOpen?"place"===this._mode&&(this._mode="select",this._armedEntityId=null):this._disarmFurniture()},this._onLibraryClose=()=>{this._furnitureLibraryOpen=!1,this._disarmFurniture()},this._onFurnitureDone=()=>this._disarmFurniture(),this._onFurnitureArmed=e=>{this._armedFurnitureKind=e.detail.kind,this._armedFurnitureRotation=0,this._mode=e.detail.kind?"furniture":"select",this._editingRoomId=null,this._editingWallId=null},this._onFurnitureRotateArmed=()=>{this._armedFurnitureRotation=(this._armedFurnitureRotation+90)%360},this._onFurniturePlace=e=>{const t=this._armedFurnitureKind?Di(this._armedFurnitureKind):void 0;if(!t)return;const i={id:Ee("furniture"),kind:t.id,x:e.detail.x,y:e.detail.y,rotation_deg:e.detail.points?0:this._armedFurnitureRotation,width_cm:e.detail.width_cm??t.w,depth_cm:e.detail.depth_cm??t.d,stroke_width:1.5,...e.detail.points?{points:e.detail.points,closed:!1!==e.detail.closed}:{}};this._updateLayout({furniture:[...this._layout.furniture,i]}),e.detail.keepArmed||(this._disarmFurniture(),this._resetSelection(),this._selectedFurnitureId=i.id)},this._onFurnitureSelect=e=>{null!==e.detail.furnitureId?(this._resetSelection(),this._pinStackIds=null,this._selectedFurnitureId=e.detail.furnitureId):this._selectedFurnitureId=null},this._onFurnitureUpdate=e=>{const{id:t,...i}=e.detail;this._patchFurniture(t,i)},this._onFurnitureChange=e=>{this._selectedFurnitureId&&this._patchFurniture(this._selectedFurnitureId,e.detail.patch)},this._onFurnitureEntityToggle=()=>{const e=this._selectedFurniture?.entity_id;e&&this._hass?.callService&&this._hass.callService("homeassistant","toggle",{},{entity_id:e})},this._onFurnitureDelete=()=>{const e=this._selectedFurnitureId;e&&(this._updateLayout({furniture:this._layout.furniture.filter(t=>t.id!==e)}),this._selectedFurnitureId=null)},this._onFurnitureDuplicate=()=>{const e=this._selectedFurniture;if(!e)return;const t=30*this._unitsPerCm,i={...e,id:Ee("furniture"),x:e.x+t,y:e.y+t,locked:!1};this._updateLayout({furniture:[...this._layout.furniture,i]}),this._selectedFurnitureId=i.id},this._onFurnitureOrder=e=>{const t=this._selectedFurniture;if(!t)return;const i=this._layout.furniture,n=i.filter(e=>e.id!==t.id);if(!e.detail.step)return void this._updateLayout({furniture:e.detail.front?[...n,t]:[t,...n]});const o=this._unitsPerMeter(),r=o?o/100:.5,s=e=>Math.hypot(e.width_cm,e.depth_cm)/2*r,a=i.findIndex(e=>e.id===t.id),l=(e.detail.front?i.slice(a+1):i.slice(0,a).reverse()).find(e=>Math.hypot(e.x-t.x,e.y-t.y)<s(e)+s(t));if(!l)return;const c=n.findIndex(e=>e.id===l.id),d=[...n];d.splice(e.detail.front?c+1:c,0,t),this._updateLayout({furniture:d})},this._onOverlayToggle=e=>{this._overlays={...this._overlays,[e.detail.key]:!this._overlays[e.detail.key]};try{localStorage.setItem(es,JSON.stringify(this._overlays))}catch{}},this._onRoomLinksChange=e=>{const t=this._selectedRoom;t&&this._updateLayout({rooms:this._layout.rooms.map(i=>i.id===t.id?{...i,...e.detail}:i)})},this._onRoomLightsCommand=e=>{const t=this._selectedRoom,i=t?this._roomLights.get(t.id):void 0;i&&this._hass?.callService&&this._hass.callService("light",e.detail.on?"turn_on":"turn_off",{},{entity_id:i.entityIds})},this._onOpeningDaylightChange=e=>{const t=this._selectedOpening;t&&this._updateLayout({openings:this._layout.openings.map(i=>{if(i.id!==t.id)return i;if(e.detail.reset){const{daylight:e,...t}=i;return t}return{...i,daylight:{...i.daylight,...e.detail.patch}}})})},this._onOpeningCoverChange=e=>{const t=this._selectedOpening;if(!t)return;const i="right"===e.detail.side?"cover_right_entity_id":"cover_entity_id";this._updateLayout({openings:this._layout.openings.map(n=>n.id===t.id?{...n,[i]:e.detail.entityId}:n)})},this._onOpeningGarageChange=e=>{const t=this._selectedOpening;t&&this._updateLayout({openings:this._layout.openings.map(i=>i.id===t.id?{...i,garage:e.detail.garage}:i)})},this._onOpeningStyleChange=e=>{const t=this._selectedOpening;t&&this._updateLayout({openings:this._layout.openings.map(i=>{if(i.id!==t.id)return i;const{window_style:n,...o}=i;return"standard"===e.detail.style?o:{...o,window_style:e.detail.style}})})},this._onOpeningCoverSwap=()=>{const e=this._selectedOpening;e&&this._updateLayout({openings:this._layout.openings.map(t=>t.id===e.id?{...t,cover_entity_id:t.cover_right_entity_id??null,cover_right_entity_id:t.cover_entity_id??null}:t)})},this._onRoomLabelChange=e=>{const t=this._selectedRoom;t&&this._updateLayout({rooms:this._layout.rooms.map(i=>i.id===t.id?{...i,...e.detail.patch}:i)})},this._onRoomFloorOffsetChange=e=>{const t=this._selectedRoom;t&&this._updateLayout({rooms:this._layout.rooms.map(i=>i.id===t.id?{...i,floor_offset_m:e.detail.offset}:i)})},this._onRoomOutdoorChange=e=>{const t=this._selectedRoom;t&&this._updateLayout({rooms:this._layout.rooms.map(i=>i.id===t.id?{...i,outdoor:e.detail.outdoor}:i)})},this._onRoomNameChange=e=>{const t=this._selectedRoom;t&&this._updateLayout({rooms:this._layout.rooms.map(i=>i.id===t.id?{...i,name:e.detail.name}:i)})},this._onRoomAreaChange=e=>{const t=this._selectedRoom;if(!t)return;const i=e.detail.areaId||null,n=this._areas.find(e=>e.area_id===i);this._updateLayout({rooms:this._layout.rooms.map(e=>e.id===t.id?{...e,area_id:i,name:n?n.name:e.name}:e)})},this._onRoomMove=e=>{const{roomId:t,dx:i,dy:n}=e.detail;Le.log("room_move",{room_id:t,dx:Math.round(i),dy:Math.round(n)});const o=([e,t])=>[e+i,t+n],r=this._layout.rooms.map(e=>e.id===t?{...e,points:e.points.map(o),...e.label_position?{label_position:o(e.label_position)}:{}}:e),s=this._layout.pins.map(e=>e.room_id===t?{...e,x:e.x+i,y:e.y+n}:e);this._updateLayout({rooms:r,pins:Xe(r,s)})},this._onRoomLabelMoved=e=>{this._patchRoom(e.detail.roomId,{label_position:[e.detail.x,e.detail.y]})},this._onRoomLabelReset=()=>{const e=this._selectedRoom;e&&this._patchRoom(e.id,{label_position:null})},this._onRoomVisibleToggle=()=>{const e=this._selectedRoom;e&&this._patchRoom(e.id,{visible:!1===e.visible})},this._onRoomFillColorChange=e=>{const t=this._selectedRoom;t&&this._patchRoom(t.id,{fill_color:e.detail.color})},this._onRoomFillOpacityChange=e=>{const t=this._selectedRoom;t&&this._patchRoom(t.id,{fill_opacity:e.detail.opacity})},this._onRoomBorderOpacityChange=e=>{const t=this._selectedRoom;t&&this._patchRoom(t.id,{border_opacity:e.detail.opacity})},this._onRoomEditVertices=()=>{this._selectedRoomId&&(this._editingRoomId=this._editingRoomId===this._selectedRoomId?null:this._selectedRoomId)},this._onRoomDelete=()=>{const e=this._selectedRoom;if(!e||!window.confirm(He("confirm.deleteRoom",{name:e.name})))return;const t=this._layout.rooms.filter(t=>t.id!==e.id);this._updateLayout({rooms:t,pins:Xe(t,this._layout.pins)}),this._selectedRoomId=null,this._editingRoomId=null},this._onPinLabelChange=e=>{const t=this._selectedPin;t&&this._patchPin(t.id,{label_override:e.detail.label.trim()||null})},this._onPinSetIcon=()=>{const e=this._selectedPin;e&&(this._iconPickerFor={kind:"floor",pinId:e.id})},this._onIconPicked=e=>{const t=this._iconPickerFor;if(this._iconPickerFor=null,!t)return;const i={icon_override:e.detail.icon};"floor"===t.kind?this._patchPin(t.pinId,i):this._patchOutdoorPin(t.pinId,i)},this._onIconPickerCancel=()=>{this._iconPickerFor=null},this._onPinHeightChange=e=>{const t=this._selectedPin;if(!t)return;const i=e.detail.value.trim(),n=""===i?null:pt(i,this._settings.unit_system);this._patchPin(t.id,{height_m:null!==n&&Number.isFinite(n)?n:null})},this._onPinDelete=()=>{const e=this._selectedPin;e&&window.confirm(He("confirm.deletePin",{name:this._pinLabel(e)}))&&(this._updateLayout({pins:this._layout.pins.filter(t=>t.id!==e.id)}),this._selectedPinId=null)},this._onWallMaterialChange=e=>{const t=this._selectedWall;t&&this._updateLayout({walls:this._layout.walls.map(i=>i.id===t.id?{...i,material:e.detail.material}:i)})},this._onWallThicknessChange=e=>{const t=this._selectedWall;t&&(!Number.isFinite(e.detail.thicknessCm)||e.detail.thicknessCm<=0||this._updateLayout({walls:this._layout.walls.map(i=>i.id===t.id?{...i,thickness_cm:e.detail.thicknessCm}:i)}))},this._onWallEditVertices=()=>{this._selectedWallId&&(this._editingWallId=this._editingWallId===this._selectedWallId?null:this._selectedWallId)},this._onWallDelete=()=>{const e=this._selectedWall;e&&window.confirm(He("confirm.deleteWall"))&&(this._updateLayout({walls:this._layout.walls.filter(t=>t.id!==e.id),openings:this._layout.openings.filter(t=>t.wallId!==e.id)}),this._selectedWallId=null,this._editingWallId=null)},this._onOpeningWidthChange=e=>{const t=this._selectedOpening;if(!t)return;const i=e.detail.width;this._updateLayout({openings:this._layout.openings.map(e=>e.id===t.id?{...e,width:i}:e)})},this._onOpeningDelete=()=>{const e=this._selectedOpening;e&&window.confirm(He("door"===e.type?"confirm.deleteDoor":"confirm.deleteWindow"))&&(this._updateLayout({openings:this._layout.openings.filter(t=>t.id!==e.id)}),this._selectedOpeningId=null,this._selectedFurnitureId=null)},this._onEntityArmed=e=>{this._armedEntityId=this._armedEntityId===e.detail.entityId?null:e.detail.entityId},this._onClearAllPins=()=>{const e=this._layout.pins.length;0!==e&&window.confirm(He(1===e?"confirm.removeFloorOne":"confirm.removeFloorMany",{count:e}))&&(this._autoSaveHeld=!0,this._updateLayout({pins:[]}),this._selectedPinId=null,this._pinStackIds=null)},this._onRoomTraceComplete=e=>{const t=ze("New Room",e.detail.points,null),i=[...this._layout.rooms,t];this._updateLayout({rooms:i,pins:Xe(i,this._layout.pins)}),this._selectedRoomId=t.id},this._onRoomVertexChanged=e=>{const t=this._layout.rooms.map(t=>{if(t.id!==e.detail.roomId)return t;const i=t.label_position,n=!i||Ye(i[0],i[1],e.detail.points);return{...t,points:e.detail.points,...n?{}:{label_position:null}}});this._updateLayout({rooms:t,pins:Xe(t,this._layout.pins)})},this._onRoomSelect=e=>{this._selectedRoomId=e.detail.roomId,null===e.detail.roomId?this._editingRoomId=null:(this._selectedPinId=null,this._pinStackIds=null,this._selectedWallId=null,this._editingWallId=null,this._selectedOpeningId=null,this._selectedFurnitureId=null,this._selectedMeshLink=null,this._selectedMeshStub=null)},this._onWallTraceComplete=e=>{this._updateLayout({walls:[...this._layout.walls,Oe(e.detail.points)]})},this._onWallVertexChanged=e=>{this._updateLayout({walls:this._layout.walls.map(t=>t.id===e.detail.wallId?{...t,points:e.detail.points}:t)})},this._onWallSelect=e=>{this._selectedWallId=e.detail.wallId,null===e.detail.wallId?this._editingWallId=null:(this._selectedRoomId=null,this._editingRoomId=null,this._selectedPinId=null,this._pinStackIds=null,this._selectedOpeningId=null,this._selectedFurnitureId=null,this._selectedMeshLink=null,this._selectedMeshStub=null)},this._onOpeningPlace=e=>{if(!this._armedOpeningType)return;const t=je(e.detail.wallId,this._armedOpeningType,e.detail.x,e.detail.y,this._defaultOpeningWidth());this._updateLayout({openings:[...this._layout.openings,t]})},this._onOpeningSelect=e=>{this._selectedOpeningId=e.detail.openingId,null!==e.detail.openingId&&(this._selectedFurnitureId=null,this._selectedRoomId=null,this._editingRoomId=null,this._selectedPinId=null,this._pinStackIds=null,this._selectedWallId=null,this._editingWallId=null,this._selectedMeshLink=null,this._selectedMeshStub=null)},this._onOpeningUpdate=e=>{this._updateLayout({openings:this._layout.openings.map(t=>t.id===e.detail.openingId?{...t,x:e.detail.x,y:e.detail.y,width:e.detail.width}:t)})},this._onPinPlace=e=>{if(!this._armedEntityId)return;const t=Qe(e.detail.x,e.detail.y,this._layout.rooms),i=this._entityLookup.get(this._armedEntityId),n=De(i?.device_id??null,e.detail.x,e.detail.y,t),o=this._layout.pins.filter(t=>t.x===e.detail.x&&t.y===e.detail.y);this._updateLayout({pins:[...this._layout.pins,n]}),this._armedEntityId=null,o.length>0?(this._pinStackIds=[...o.map(e=>e.id),n.id],this._selectedPinId=null):(this._pinStackIds=null,this._selectedPinId=n.id,this._selectedRoomId=null,this._selectedWallId=null,this._editingWallId=null,this._selectedOpeningId=null,this._selectedFurnitureId=null,this._selectedMeshLink=null,this._selectedMeshStub=null)},this._onPinMove=e=>{const t=Qe(e.detail.x,e.detail.y,this._layout.rooms);this._patchPin(e.detail.pinId,{x:e.detail.x,y:e.detail.y,room_id:t})},this._onPinSelect=e=>{this._selectedPinId=e.detail.pinId,this._pinStackIds=null,null!==e.detail.pinId&&(this._selectedRoomId=null,this._selectedWallId=null,this._editingWallId=null,this._selectedOpeningId=null,this._selectedFurnitureId=null,this._selectedMeshLink=null,this._selectedMeshStub=null)},this._onPinStackSelect=e=>{this._pinStackIds=e.detail.pinIds,this._selectedRoomId=null,this._selectedWallId=null,this._editingWallId=null,this._selectedOpeningId=null,this._selectedFurnitureId=null,this._selectedPinId=null,this._selectedMeshLink=null,this._selectedMeshStub=null},this._onMeshLinkSelect=e=>{this._selectedMeshLink=e.detail.link,null!==e.detail.link&&(this._selectedRoomId=null,this._editingRoomId=null,this._selectedPinId=null,this._pinStackIds=null,this._selectedWallId=null,this._editingWallId=null,this._selectedOpeningId=null,this._selectedFurnitureId=null,this._selectedMeshStub=null)},this._onMeshStubSelect=e=>{this._selectedMeshStub=e.detail.stub,null!==e.detail.stub&&(this._selectedRoomId=null,this._editingRoomId=null,this._selectedPinId=null,this._pinStackIds=null,this._selectedWallId=null,this._editingWallId=null,this._selectedOpeningId=null,this._selectedFurnitureId=null,this._selectedMeshLink=null)},this._onMeshStubGotoFloorClick=()=>{const e=this._selectedMeshStub;e&&(e.targetFloorId===ve?this._selectProperty():this._selectFloor(e.targetFloorId))},this._onPinStackChoose=e=>{this._pinStackIds=null,this._selectedPinId=e.detail.pinId},this._onSelectionClear=()=>{this._resetSelection(),this._pinStackIds=null},this._onPinStackDismiss=()=>{this._pinStackIds=null},this._onPinStackRemove=e=>{const t=this._layout.pins.find(t=>t.id===e.detail.pinId);if(!t)return;if(!window.confirm(He("confirm.removeFromSpot",{name:this._pinLabel(t)})))return;this._updateLayout({pins:this._layout.pins.filter(t=>t.id!==e.detail.pinId)});const i=(this._pinStackIds??[]).filter(t=>t!==e.detail.pinId);this._pinStackIds=i.length>1?i:null,this._selectedPinId=1===i.length?i[0]:null},this._onScaleLineComplete=e=>{const t=this._settings.unit_system,i=He("imperial"===t?"units.feet":"units.metres"),n=window.prompt(He("prompt.distance",{unit:i})),o=n?pt(n,t):null;if(null===o||!Number.isFinite(o)||o<=0)return;const r=e.detail.points;this._updateLayout({scale:{points:r,meters:o}}),this._mode="select"},this._onPendingChanged=e=>{this._pendingCount=e.detail.count},this._onSnapModeChange=e=>{this._snapMode=e.detail.snapMode;try{localStorage.setItem(Jr,this._snapMode)}catch{}}}set hass(e){this._hass=e,this._refreshLive(),this._initialized||(this._initialized=!0,this._init())}get hass(){return this._hass}get _client(){return new Re(this._hass)}get _entityLookup(){return new Map(this._entities.map(e=>[e.entity_id,e]))}get _placedDeviceIds(){return new Set(("property"===this._view?this._propertyLayout.pins:this._layout.pins).map(e=>e.device_id).filter(e=>null!==e))}get _selectedRoom(){return this._layout.rooms.find(e=>e.id===this._selectedRoomId)??null}get _areasForCurrentFloor(){return this._areas.filter(e=>e.floor_id===this._currentFloorId||null===e.floor_id)}get _outdoorAreaIdsOnCurrentFloor(){const e=new Set(this._areas.filter(e=>null===e.floor_id).map(e=>e.area_id));return new Set(this._layout.rooms.map(e=>e.area_id).filter(t=>null!==t&&e.has(t)))}get _otherFloors(){return this._floors.filter(e=>e.floor_id!==this._currentFloorId)}get _buildings(){const e=new Map;for(const t of this._floors){const i=t.building_id??t.floor_id,n=e.get(i);n?n.push(t):e.set(i,[t])}return[...e.entries()].map(([e,t])=>{const i=t[0];return{key:e,name:t.length>1?t.map(e=>e.name).join(" + "):i.name,icon:i.icon||"mdi:home-city",floorId:i.floor_id,buildingId:i.building_id,aspectRatio:this._buildingAspectRatio(t)}})}_buildingAspectRatio(e){const t=this._buildingBounds(e),i=t?t.max_x-t.min_x:0,n=t?t.max_y-t.min_y:0;return i>0&&n>0?i/n:1.375}_buildingBounds(e){const t=e.map(e=>e.content_bounds).filter(e=>null!==e);return 0===t.length?null:{min_x:Math.min(...t.map(e=>e.min_x)),min_y:Math.min(...t.map(e=>e.min_y)),max_x:Math.max(...t.map(e=>e.max_x)),max_y:Math.max(...t.map(e=>e.max_y))}}get _floorNameById(){return new Map(this._floors.map(e=>[e.floor_id,e.name]))}get _floorIconById(){return new Map(this._floors.map(e=>[e.floor_id,e.icon||"mdi:floor-plan"]))}get _livePlacements(){const e=[];for(const t of this._propertyLayout.placements){if(this._floors.some(e=>e.floor_id===t.floor_id)){e.push(t);continue}const i=null!==t.building_id?this._floors.find(e=>e.building_id===t.building_id):void 0;i&&e.push({...t,floor_id:i.floor_id})}return e}get _selectedPlacement(){return this._livePlacements.find(e=>e.id===this._selectedPlacementId)??null}get _activeBackground(){return"property"===this._view?{imageId:this._propertyLayout.background_image_id,opacity:this._propertyLayout.background_opacity}:{imageId:this._layout.background_image_id,opacity:this._layout.background_opacity}}get _alignOverlay(){if("align"!==this._mode||!this._alignTargetLayout)return null;const e=Be(this._alignTargetLayout.background_image_id);if(!e)return null;const t=this._alignTargetLayout;return{imageUrl:e,offsetX:this._alignScale*t.background_offset_x+this._alignOffsetX,offsetY:this._alignScale*t.background_offset_y+this._alignOffsetY,scale:this._alignScale*t.background_scale,opacity:.55}}get _orderedFloors(){if("ground_up"!==this._settings.floor_order)return this._floors;const e=this._floors.filter(e=>null!==e.level),t=this._floors.filter(e=>null===e.level);return[...e.reverse(),...t]}get _placedDeviceChoices(){const e=e=>e.label_override??Me(e.device_id,this._entityLookup.values()),t=new Map;for(const i of this._layout.pins)i.device_id&&t.set(i.device_id,e(i));for(const[i,{pin:n}]of this._otherFloorPinsByDeviceId)t.has(i)||t.set(i,e(n));return[...t].map(([e,t])=>({deviceId:e,label:t})).sort((e,t)=>e.label.localeCompare(t.label))}get _pinByDeviceId(){const e=new Map;for(const t of this._layout.pins)t.device_id&&e.set(t.device_id,t);return e}get _normalizedMeshLinks(){if(null===this._networkType)return[];if("zigbee"===this._networkType&&this._zigbeeMesh){const e=this._pinByDeviceId,t=this._outdoorPinByDeviceId,i=i=>e.has(i)?this._currentFloorId??void 0:t.has(i)?ve:this._otherFloorPinsByDeviceId.get(i)?.floorId;return function(e,t,i){const n=e.links.filter(e=>e.source_device_id&&e.target_device_id&&void 0!==t(e.source_device_id)&&void 0!==t(e.target_device_id));if(i)return n;const o=e.nodes.find(e=>"Coordinator"===e.type)?.ieee,r=new Set,s=new Map,a=new Map;for(const e of n){e.parent_child&&r.add(e),(e.source_ieee===o||e.target_ieee===o)&&e.lqi>=50&&r.add(e);const i=t(e.source_device_id)!==t(e.target_device_id)?a:s;for(const t of[e.source_ieee,e.target_ieee]){const n=i.get(t);(!n||e.lqi>n.lqi)&&i.set(t,e)}}for(const e of s.values())r.add(e);for(const e of a.values())r.add(e);return[...r]}(function(e,t){const i=e.nodes.find(e=>"Coordinator"===e.type)?.ieee;return t&&i?{...e,nodes:e.nodes.map(e=>e.ieee===i?{...e,device_id:t}:e),links:e.links.map(e=>({...e,source_device_id:e.source_ieee===i?t:e.source_device_id,target_device_id:e.target_ieee===i?t:e.target_device_id}))}:e}(this._zigbeeMesh,this._settings.zigbee_coordinator_device_id),i,this._zigbeeShowAllLinks).map(e=>{return{sourceDeviceId:e.source_device_id,targetDeviceId:e.target_device_id,quality:(t=e.lqi,t>=150?"strong":t>=80?"medium":"weak"),detail:e.lqi_readings.every(t=>t===e.lqi)?`LQI ${e.lqi}`:`LQI ${e.lqi} (raw ${e.lqi_readings.join(" / ")})`};var t})}if("wifi"===this._networkType&&this._wifiMesh)return this._wifiMesh.links.map(e=>{return{sourceDeviceId:e.source_device_id,targetDeviceId:e.target_device_id,quality:null!=e.rssi_dbm?(t=e.rssi_dbm,t>=-50?"strong":t>=-70?"medium":"weak"):"unknown",...null!=e.rssi_dbm?{detail:`${e.rssi_dbm} dBm`}:{}};var t});if("bluetooth"===this._networkType){const e=[];for(const t of this._bluetoothAdverts.values()){const i=this._bluetoothDevices[t.address]??[],n=this._bluetoothDevices[t.source]??[];for(const o of i)for(const i of n)o!==i&&e.push({sourceDeviceId:o,targetDeviceId:i,quality:null!=t.rssi?ke(t.rssi):"unknown",...null!=t.rssi?{detail:`RSSI ${t.rssi} dBm`}:{}})}return e}if("matter"===this._networkType&&this._matterTopology){const e=new Map;for(const t of this._matterTopology.nodes)t.ha_device_id&&e.set(t.id,t.ha_device_id);const t=[];for(const i of this._matterTopology.connections){const n=e.get(i.source),o=e.get(i.target);n&&o&&t.push({sourceDeviceId:n,targetDeviceId:o,quality:i.strength,detail:i.strength})}return t}return[]}get _outdoorPinByDeviceId(){const e=new Map;for(const t of this._propertyLayout.pins)t.device_id&&e.set(t.device_id,t);return e}_propertyEnd(e){const t=this._outdoorPinByDeviceId.get(e);if(t)return{deviceId:e,x:t.x,y:t.y,label:this._pinLabel(t),floorId:null};const i=this._pinByDeviceId.get(e),n=i?{pin:i,floorId:this._currentFloorId}:this._otherFloorPinsByDeviceId.get(e);if(!n?.floorId)return null;const o=this._placementForFloor(n.floorId),r=o?function(e,t,i){const n=e.source_bounds;if(!n||n.max_x<=n.min_x||n.max_y<=n.min_y)return null;const o=((t-n.min_x)/(n.max_x-n.min_x)-.5)*e.width,r=((i-n.min_y)/(n.max_y-n.min_y)-.5)*e.height,s=e.rotation_deg*Math.PI/180,a=Math.cos(s),l=Math.sin(s);return{x:e.x+a*o-l*r,y:e.y+l*o+a*r}}(o,n.pin.x,n.pin.y):null;return r?{deviceId:e,...r,label:this._pinLabel(n.pin),floorId:n.floorId}:null}get _propertyMeshLinks(){const e=this._outdoorPinByDeviceId,t=[];for(const i of this._normalizedMeshLinks){if(!e.has(i.sourceDeviceId)&&!e.has(i.targetDeviceId))continue;const n=this._propertyEnd(i.sourceDeviceId),o=this._propertyEnd(i.targetDeviceId);n&&o&&t.push({key:`${i.sourceDeviceId}|${i.targetDeviceId}`,from:n,to:o,quality:i.quality,...i.detail?{detail:i.detail}:{}})}return t}get _selectedPropertyMeshLink(){return this._propertyMeshLinks.find(e=>e.key===this._selectedPropertyMeshLinkKey)??null}get _meshLinksForCurrentFloor(){const e=this._pinByDeviceId,t=[];for(const i of this._normalizedMeshLinks){const n=e.get(i.sourceDeviceId),o=e.get(i.targetDeviceId);n&&o&&t.push({fromPin:n,toPin:o,quality:i.quality,...i.detail?{detail:i.detail}:{}})}return t}_placementForFloor(e){const t=this._floors.find(t=>t.floor_id===e);return t?this._propertyLayout.placements.find(i=>null!==t.building_id?i.building_id===t.building_id:i.floor_id===e)??null:null}_currentFloorContentBounds(){const e=[];for(const t of this._layout.rooms)e.push(...t.points);for(const t of this._layout.walls)e.push(...t.points);if(0===e.length)return null;const t=e.map(([e])=>e),i=e.map(([,e])=>e),n=Math.min(...t),o=Math.max(...t),r=Math.min(...i),s=Math.max(...i),a=.05*Math.max(o-n,s-r)||20;return{minX:n-a,minY:r-a,maxX:o+a,maxY:s+a}}_projectStubTowardBuilding(e,t){if(!this._currentFloorId)return null;const i=this._placementForFloor(this._currentFloorId),n=this._placementForFloor(t);if(!i||!n)return null;const o=this._currentFloorContentBounds();if(!o)return null;const r=Math.atan2(n.y-i.y,n.x-i.x)-i.rotation_deg*Math.PI/180;return function(e,t,i,n,o){const r=i>0?(o.maxX-e)/i:i<0?(o.minX-e)/i:1/0,s=n>0?(o.maxY-t)/n:n<0?(o.minY-t)/n:1/0,a=Math.min(r,s);return!isFinite(a)||a<=0?null:{x:e+i*a,y:t+n*a}}(e.x,e.y,Math.cos(r),Math.sin(r),o)}get _meshStubsForCurrentFloor(){if(!this._currentFloorId)return[];const e=this._pinByDeviceId,t=this._otherFloorPinsByDeviceId,i=this._floors.find(e=>e.floor_id===this._currentFloorId),n=[];for(const o of this._normalizedMeshLinks){const r=e.has(o.sourceDeviceId);if(r===e.has(o.targetDeviceId))continue;const s=e.get(r?o.sourceDeviceId:o.targetDeviceId),a=r?o.targetDeviceId:o.sourceDeviceId,l=this._outdoorPinByDeviceId.get(a);if(l){const e=this._placementForFloor(this._currentFloorId),t=e?Se(e,l.x,l.y):null;if(!t)continue;n.push({fromPin:s,x:t.x,y:t.y,targetDeviceId:a,targetFloorId:ve,targetFloorName:"Outside",targetLabel:this._pinLabel(l),quality:o.quality,...o.detail?{detail:o.detail}:{}});continue}const c=t.get(a);if(!c||c.floorId===this._currentFloorId)continue;const d=this._floors.find(e=>e.floor_id===c.floorId),h=c.pin.label_override??Me(c.pin.device_id,this._entityLookup.values()),u=null!==i?.building_id&&i?.building_id===d?.building_id?{x:c.pin.x,y:c.pin.y}:this._projectStubTowardBuilding(s,c.floorId);u&&n.push({fromPin:s,x:u.x,y:u.y,targetDeviceId:a,targetFloorId:c.floorId,targetFloorName:d?.name??c.floorId,targetLabel:h,quality:o.quality,...o.detail?{detail:o.detail}:{}})}return n}get _selectedPin(){return this._layout.pins.find(e=>e.id===this._selectedPinId)??null}get _pinStack(){if(!this._pinStackIds)return null;const e=new Map(this._layout.pins.map(e=>[e.id,e])),t=this._pinStackIds.map(t=>e.get(t)).filter(e=>!!e);return t.length>1?t:null}get _selectedWall(){return this._layout.walls.find(e=>e.id===this._selectedWallId)??null}get _selectedFurniture(){return this._layout.furniture.find(e=>e.id===this._selectedFurnitureId)??null}_refreshLive(){const e=this._hass;if(!e)return;const t=cn(this._layout.rooms,e),i=dn(this._layout.openings,e),n=function(e,t){const i=new Map;if(!t?.entities)return i;const n=new Map;for(const[e,i]of Object.entries(t.entities)){const t=i?.device_id;if(!t)continue;const o=n.get(t);o?o.push(e):n.set(t,[e])}for(const o of e){if(!o.device_id)continue;const e=gn(n.get(o.device_id)??[]);if(!e)continue;const r=t.states[e];if(!r)continue;const s=pn(e.split(".")[0],r.state??"",r.attributes);s&&i.set(o.id,s)}return i}(this._layout.pins,e),o=_n(this._layout.furniture,e),r=function(e,t){if("none"===t)return null;let i=t??null;if(!i){const t=Object.keys(e).filter(e=>e.startsWith("weather.")).sort();i=t.find(e=>"weather.home"===e)??t.find(e=>"weather.forecast_home"===e)??t[0]??null}const n=i?e[i]:void 0;if(!n||!n.state||"unavailable"===n.state||"unknown"===n.state)return null;const o=n.state,r=n.attributes.cloud_coverage;let s="number"==typeof r?r/100:Yi[o]??0;return Qi.has(o)&&(s=Math.max(s,.9)),{clouds:Math.max(0,Math.min(1,s)),condition:o}}(e.states,this._settings.weather_entity_id);(r?.condition!==this._sky?.condition||Math.abs((r?.clouds??-1)-(this._sky?.clouds??-1))>.01)&&(this._sky=r);const s=bn(t,i,n,o);s!==this._liveSig&&(this._liveSig=s,this._itemStates=o,this._roomLights=t,this._coverOpenness=i,this._pinColors=n)}_entityOptions(e){const t=this._hass?.states??{};return Object.keys(t).filter(t=>t.startsWith(`${e}.`)).map(e=>({entity_id:e,name:String(t[e]?.attributes.friendly_name??e)})).sort((e,t)=>e.name.localeCompare(t.name))}_linkableEntities(){return["light","switch","fan","cover","media_player","climate","lock","vacuum","input_boolean","binary_sensor","sensor"].flatMap(e=>this._entityOptions(e))}get _location(){const e=this._hass?.config;return"number"==typeof e?.latitude&&"number"==typeof e.longitude?{latitude:e.latitude,longitude:e.longitude}:null}get _sunTime(){if(null===this._sunPreviewMinutes)return null;const e=new Date;return e.setHours(0,0,0,0),e.getTime()+6e4*this._sunPreviewMinutes}_renderCompassControls(){if("property"===this._view)return K;const e=this._layout.north_deg,t=this._sunPreviewMinutes??60*(new Date).getHours()+(new Date).getMinutes(),i=`${String(Math.floor(t/60)).padStart(2,"0")}:${String(t%60).padStart(2,"0")}`;return N`
      <label class="popover-row"
        >${He("compass.faces")}
        <select
          @change=${e=>{const t=e.target.value;this._onNorthChange(""===t?null:Number(t))}}
        >
          <option value="" ?selected=${null===e}>
            ${He("compass.notSet")}
          </option>
          ${Zi.map(t=>N`<option value=${t.deg} ?selected=${e===t.deg}>
                ${t.name}
              </option>`)}
          ${null===e||Zi.some(t=>t.deg===e)?K:N`<option value=${e} selected>${e}°</option>`}
        </select>
        <input
          type="number"
          min="0"
          max="359"
          step="1"
          style="width:64px"
          title=${He("compass.degrees")}
          .value=${null===e?"":String(e)}
          @change=${e=>{const t=e.target.value;this._onNorthChange(""===t?null:Number(t))}}
        />
      </label>
      ${null===e||this._location?K:N`<span class="hint" style="padding: 0 16px 8px"
              >${He("compass.noLocation")}</span
            >`}
      ${null!==e&&this._location?N`<label class="popover-row"
              >${He("compass.preview",{time:i})}
              <input
                type="range"
                min="0"
                max="1439"
                step="10"
                style="--pct:${t/1439*100}%"
                .value=${String(t)}
                @input=${e=>this._sunPreviewMinutes=Number(e.target.value)}
              />
              ${null!==this._sunPreviewMinutes?N`<button
                      class="menu-item"
                      style="width:auto"
                      @click=${()=>this._sunPreviewMinutes=null}
                    >
                      ${He("compass.now")}
                    </button>`:K}
            </label>`:K}
    `}_areaDevices(e){if(!e?.area_id)return[];const t=new Map;for(const i of this._entities){if(!i.device_id||i.area_id!==e.area_id)continue;const n=t.get(i.device_id);n?n.push(i):t.set(i.device_id,[i])}const i=new Set(this._layout.pins.map(e=>e.device_id).filter(Boolean));return[...t.entries()].map(([e,t])=>{const n=xe(e,t),o=t.find(e=>e.placed_floor_id)?.placed_floor_id,r=i.has(e)?"here":o&&o!==this._currentFloorId?"elsewhere":"none";return{deviceId:e,name:n?.device_name??n?.name??e,icon:Oo(n),placed:r,where:"elsewhere"===r?t.find(e=>e.placed_floor_name)?.placed_floor_name??null:null}}).sort((e,t)=>e.name.localeCompare(t.name))}_spotsInRoom(e,t){const i=e.points,n=i.map(e=>e[0]),o=i.map(e=>e[1]),r=Math.min(...n),s=Math.max(...n),a=Math.min(...o),l=Math.max(...o),[c,d]=et(i),h=this._layout.pins.map(e=>[e.x,e.y]);for(const e of[5,8,12,18]){const n=Math.min(s-r,l-a)/e;if(n<=0)break;const o=[];for(let e=r+n/2;e<s;e+=n)for(let t=a+n/2;t<l;t+=n)Ye(e,t,i)&&o.push([e,t]);const u=o.filter(([e,t])=>Math.hypot(e-c,t-d)>.7*n).sort((e,t)=>Math.hypot(e[0]-c,e[1]-d)-Math.hypot(t[0]-c,t[1]-d)),g=[];for(const e of u){if(g.length>=t)break;[...h,...g].every(([t,i])=>Math.hypot(t-e[0],i-e[1])>.6*n)&&g.push(e)}if(g.length>=t)return g}return Array.from({length:t},(e,t)=>[c+4*t,d+12])}_placeDevicesInRoom(e){const t=this._selectedRoom;if(!t||0===e.length)return;const i=this._spotsInRoom(t,e.length),n=e.map((e,n)=>{const[o,r]=i[n];return{...De(e,o,r,t.id),icon_override:Oo(xe(e,this._entities))}});this._updateLayout({pins:[...this._layout.pins,...n]})}get _unitsPerCm(){return this._canvas?.unitsPerCm??.5}get _selectedOpening(){return this._layout.openings.find(e=>e.id===this._selectedOpeningId)??null}get _selectedMeshLinkKey(){const e=this._selectedMeshLink;return e?`${e.fromPin.id}|${e.toPin.id}`:null}get _selectedMeshStubKey(){const e=this._selectedMeshStub;return e?`${e.fromPin.id}|${e.targetDeviceId}`:null}_unitsPerMeter(){const e=this._layout.scale;if(!e)return null;const[[t,i],[n,o]]=e.points;return(Math.hypot(n-t,o-i)||1)/e.meters}get _propertyScale(){const e=[];for(const t of this._livePlacements){const i=t.source_bounds;if(!i||t.width<=0)continue;const n=i.max_x-i.min_x;if(n<=0)continue;const o=this._buildingMetersPerUnit(t);null!==o&&e.push({area:t.width*t.height,mpu:o*n/t.width,name:t.label_override??this._floorNameById.get(t.floor_id)??"a building"})}if(0===e.length)return null;const t=e.reduce((e,t)=>t.area>e.area?t:e);return{metersPerUnit:t.mpu,buildingName:t.name,disagree:e.some(e=>Math.abs(e.mpu/t.mpu-1)>.1)}}_buildingMetersPerUnit(e){const t=this._floors.find(t=>t.floor_id===e.floor_id);if(t?.meters_per_unit)return t.meters_per_unit;if(null===e.building_id)return null;const i=this._floors.find(t=>t.building_id===e.building_id&&t.meters_per_unit);return i?.meters_per_unit??null}get _propertyScaleReadout(){const e=this._propertyScale;if(!e)return null;const t=this._settings.unit_system,i=function(e,t){return"imperial"===t?e*dt:e}(1/e.metersPerUnit,t);return He("panel.scaleFromBuilding",{building:e.buildingName,unit:ut(t),value:i.toFixed(1)})}_defaultOpeningWidth(){const e=this._unitsPerMeter();return null===e?30:.9*e}async _init(){const[e,t,i,n,o]=await Promise.all([this._client.listFloors(),this._client.listPlaceableEntities(),this._client.listAreas(),this._client.getPropertyLayout(),this._client.getSettings()]);this._floors=e,this._entities=t,this._areas=i,this._propertyLayout=n,this._settings=o,Le.configure(this._client,o.debug_logging),Le.log("panel_open",{panel_version:"0.15.0-beta.1",panel_build:"0.15.0-beta.1+mve0sfhy",user_agent:navigator.userAgent,viewport:`${window.innerWidth}x${window.innerHeight}`,floors:e.length}),this._checkVersion();const r=this._orderedFloors[0];r&&await this._selectFloor(r.floor_id,{skipDirtyCheck:!0}),this._loading=!1}async _selectFloor(e,t={}){if(!t.skipDirtyCheck&&this._dirty)if(this._autoSaveActive){if(!await this._flushAutoSave())return void window.alert(He("errors.floorSave"))}else if(!window.confirm(He("confirm.discardFloor")))return;this._autoSaveHeld=!1,this._view="floor";const i=this._layout.building_id;this._currentFloorId=e,this._layout=await this._client.getLayout(e),this._resetSelection(),this._resetAlignState(),this._floorHistory.clear();const n=Xe(this._layout.rooms,this._layout.pins),o=Zo(this._layout.walls,this._layout.openings);o&&(this._layout={...this._layout,...o}),n!==this._layout.pins?(this._layout={...this._layout,pins:n},this._dirty=!0):this._dirty=null!==o,this._loadOtherFloorPins(e),Le.log("floor_load",{floor_id:e,rooms:this._layout.rooms.length,walls:this._layout.walls.length,pins:this._layout.pins.length,healed:this._dirty}),this._sameBuildingAsPreviousFloor=null!==this._layout.building_id&&this._layout.building_id===i}async _loadOtherFloorPins(e){const t=this._floors.filter(t=>t.floor_id!==e),i=await Promise.all(t.map(e=>this._client.getLayout(e.floor_id)));if(this._currentFloorId!==e)return;const n=new Map;t.forEach((e,t)=>{for(const o of i[t].pins)o.device_id&&n.set(o.device_id,{pin:o,floorId:e.floor_id})}),this._otherFloorPinsByDeviceId=n}_resetAlignState(){this._alignTargetFloorId=null,this._alignTargetLayout=null,this._alignOffsetX=0,this._alignOffsetY=0,this._alignScale=1}_resetSelection(){this._selectedRoomId=null,this._editingRoomId=null,this._selectedPinId=null,this._selectedWallId=null,this._editingWallId=null,this._selectedOpeningId=null,this._selectedFurnitureId=null,this._selectedMeshLink=null,this._selectedMeshStub=null,this._armedEntityId=null,this._armedOpeningType=null}async _save(){if(this._currentFloorId){this._saving=!0;try{const e=this._canvas?.getViewBox()??this._layout.view_box;this._layout={...this._layout,view_box:e};const t=this._layout,i=performance.now();try{await this._client.saveLayout(this._currentFloorId,t)}catch(e){throw this._saveError=this._describeSaveError(e),Le.log("save_error",{target:this._currentFloorId,error:e?.message}),e}Le.log("save",{target:this._currentFloorId,ms:Math.round(performance.now()-i),rooms:t.rooms.length,pins:t.pins.length}),this._saveError=null,this._layout===t&&(this._dirty=!1),this._floors=this._floors.map(e=>e.floor_id===this._currentFloorId?{...e,has_layout:!0}:e),await this._refreshEntitiesIfPlacementChanged()}finally{this._saving=!1}}}async _export(){const e=await this._client.exportSnapshot(),t=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),i=URL.createObjectURL(t),n=document.createElement("a");n.href=i,n.download="layout.json",n.click(),URL.revokeObjectURL(i)}_updateLayout(e){this._floorHistory.record(this._layout),this._layout={...this._layout,...e},this._dirty=!0}async _selectProperty(){if(this._propertyDirty)if(this._autoSaveActive){if(!await this._flushAutoSave())return void window.alert(He("errors.propertySave"))}else if(!window.confirm(He("confirm.discardProperty")))return;this._autoSaveHeld=!1,[this._propertyLayout,this._floors]=await Promise.all([this._client.getPropertyLayout(),this._client.listFloors()]),this._propertyHistory.clear(),Le.log("property_load",{placements:this._propertyLayout.placements.length,outdoor_pins:this._propertyLayout.pins.length}),this._propertyDirty=!1,this._selectedPlacementId=null,this._selectedOutdoorPinId=null,this._selectedPropertyMeshLinkKey=null,this._propertyMode="select",this._armedBuildingKey=null,this._armedEntityId=null,this._view="property",this._loadPlacementGhosts()}async _loadPlacementGhosts(){const e=this._livePlacements,t=new Set,i=e=>this._floors.filter(t=>null!==e.building_id?t.building_id===e.building_id:t.floor_id===e.floor_id);for(const n of e)for(const e of i(n))t.add(e.floor_id);const n=new Map;await Promise.all([...t].map(async e=>{try{n.set(e,await this._client.getLayout(e))}catch{}}));const o=new Map;for(const t of e){const e=[],r=[];for(const o of i(t)){const t=n.get(o.floor_id);if(t){for(const i of t.rooms)!1!==i.visible&&e.push(i.points);for(const e of t.walls)r.push(e.points)}}o.set(t.id,{rooms:e,walls:r})}"property"===this._view&&(this._placementGhosts=o)}get _mapTilesAvailable(){const e=this._hass?.config;return!!e?.components?.includes("map_tiles")&&"number"==typeof e.latitude&&"number"==typeof e.longitude}_adjustMap(e){const t=this._propertyLayout.map_background;t&&this._updatePropertyLayout({map_background:e(t)})}_updatePropertyLayout(e){this._propertyHistory.record(this._propertyLayout),this._propertyLayout={...this._propertyLayout,...e},this._propertyDirty=!0}_undoRedo(e){if(Le.log(e,{view:this._view}),"property"===this._view){const t=this._propertyLayout,i="undo"===e?this._propertyHistory.undo(t):this._propertyHistory.redo(t);if(!i)return;return this._propertyLayout={...i,view_box:t.view_box},this._propertyDirty=!0,this._selectedPlacementId=null,this._selectedOutdoorPinId=null,void(this._selectedPropertyMeshLinkKey=null)}const t=this._layout,i="undo"===e?this._floorHistory.undo(t):this._floorHistory.redo(t);i&&(this._layout={...i,view_box:t.view_box,building_id:t.building_id},this._dirty=!0,this._resetSelection(),this._pinStackIds=null)}get _canUndo(){return"property"===this._view?this._propertyHistory.canUndo:this._floorHistory.canUndo}get _canRedo(){return"property"===this._view?this._propertyHistory.canRedo:this._floorHistory.canRedo}async _saveProperty(){this._propertySaving=!0;try{const e=this._propertyCanvas?.getViewBox()??this._propertyLayout.view_box;this._propertyLayout={...this._propertyLayout,view_box:e};const t=this._propertyLayout,i=performance.now();try{await this._client.savePropertyLayout(t)}catch(e){throw this._saveError=this._describeSaveError(e),Le.log("save_error",{target:"property",error:e?.message}),e}Le.log("save",{target:"property",ms:Math.round(performance.now()-i),placements:t.placements.length,pins:t.pins.length}),this._saveError=null,this._propertyLayout===t&&(this._propertyDirty=!1),await this._refreshEntitiesIfPlacementChanged()}finally{this._propertySaving=!1}}get _selectedOutdoorPin(){return this._propertyLayout.pins.find(e=>e.id===this._selectedOutdoorPinId)??null}_patchOutdoorPin(e,t){this._updatePropertyLayout({pins:this._propertyLayout.pins.map(i=>i.id===e?{...i,...t}:i)})}_patchPlacement(e,t){this._updatePropertyLayout({placements:this._propertyLayout.placements.map(i=>i.id===e?{...i,...t}:i)})}_saveSettingsNow(){const e=this._client.saveSettings(this._settings);return e.then(()=>{this._settingsUnsaved&&(this._settingsUnsaved=!1,this._saveError=null)},e=>{this._settingsUnsaved=!0,this._saveError=this._describeSaveError(e)}),e}_describeSaveError(e){const t=e?.message||"unknown error";return/not a valid option|extra keys not allowed|invalid_format/i.test(t)?`${t} — Home Assistant may need a restart to finish updating Spatial Context.`:t}_placementKey(){return[...this._layout.pins,...this._propertyLayout.pins].map(e=>e.device_id??"").sort().join(",")}async _refreshEntitiesIfPlacementChanged(){const e=this._placementKey();e!==this._placementKeyForEntities&&(this._entities=await this._client.listPlaceableEntities(),this._placementKeyForEntities=e)}async _checkVersion(){let e=null,t=null;try{t=await this._client.getVersionInfo()}catch{e="restart"}t&&(t.loaded_version&&t.installed_version&&t.loaded_version!==t.installed_version?e="restart":t.panel_build_id&&"0.15.0-beta.1+mve0sfhy"!==t.panel_build_id&&(e="reload")),e!==this._versionNotice&&Le.log("version_check",{notice:e,panel_build:"0.15.0-beta.1+mve0sfhy",...t??{}}),this._versionNotice=e}async _downloadDebugReport(){await Le.flush();const e=await this._client.getDebugReport(),t=new Blob([JSON.stringify({...e,browser:{panel_version:"0.15.0-beta.1",panel_build:"0.15.0-beta.1+mve0sfhy",user_agent:navigator.userAgent,viewport:`${window.innerWidth}x${window.innerHeight}`}},null,2)],{type:"application/json"}),i=URL.createObjectURL(t),n=document.createElement("a");n.href=i,n.download=`spatial-context-debug-${(new Date).toISOString().slice(0,10)}.json`,n.click(),URL.revokeObjectURL(i)}get _autoSaveActive(){return this._settings.auto_save&&!this._autoSaveHeld}willUpdate(e){Ei(this._settings.custom_icons??[]);["_selectedRoomId","_selectedPinId","_selectedWallId","_selectedOpeningId","_selectedMeshLink","_selectedMeshStub","_pinStackIds","_selectedPlacementId","_selectedOutdoorPinId","_selectedPropertyMeshLinkKey"].some(t=>e.has(t)&&null!=this[t])&&(this._meshPopoverOpen=!1,this._backgroundPopoverOpen=!1,this._moreOptionsPopoverOpen=!1)}updated(e){super.updated(e),e.has("_layout")&&this._refreshLive(),(e.has("_layout")||e.has("_propertyLayout")||e.has("_dirty")||e.has("_propertyDirty"))&&this._scheduleAutoSave()}_scheduleAutoSave(){null!==this._autoSaveTimer&&(window.clearTimeout(this._autoSaveTimer),this._autoSaveTimer=null),this._autoSaveActive&&(this._dirty||this._propertyDirty)&&(this._autoSaveTimer=window.setTimeout(()=>{this._runAutoSave()},Xr.AUTO_SAVE_DELAY_MS))}async _runAutoSave(){if(this._autoSaveTimer=null,this._autoSaveActive)if(this._saving||this._propertySaving)this._scheduleAutoSave();else try{this._dirty&&await this._save(),this._propertyDirty&&await this._saveProperty()}catch{}}async _flushAutoSave(){if(!this._autoSaveActive)return!this._dirty&&!this._propertyDirty;null!==this._autoSaveTimer&&(window.clearTimeout(this._autoSaveTimer),this._autoSaveTimer=null);try{this._dirty&&await this._save(),this._propertyDirty&&await this._saveProperty()}catch{return!1}return!this._dirty&&!this._propertyDirty}async _loadCachedZigbeeMesh(){try{const e=await this._client.getCachedZigbeeMesh();if(!e?.fetched_at||this._zigbeeMeshLoading)return;const t=1e3*e.fetched_at;if(this._zigbeeMeshFetchedAt&&t<=this._zigbeeMeshFetchedAt)return;this._zigbeeMesh=e,this._zigbeeMeshFetchedAt=t}catch{}}async _refreshZigbeeMesh(e=!1){this._zigbeeMeshLoading=!0,this._zigbeeMeshError=null;const t=Date.now();this._zigbeeMeshElapsedSeconds=0,this._zigbeeMeshTimer=window.setInterval(()=>{this._zigbeeMeshElapsedSeconds=Math.round((Date.now()-t)/1e3)},1e3);try{this._zigbeeMesh=await this._client.getZigbeeMesh(e),Le.log("mesh_load",{network:"zigbee",force_refresh:e,ms:Date.now()-t,links:this._zigbeeMesh.links.length,nodes:this._zigbeeMesh.nodes.length}),this._zigbeeMeshFetchedAt=this._zigbeeMesh.fetched_at?1e3*this._zigbeeMesh.fetched_at:Date.now()}catch(e){const t=this._meshErrorMessage(e,He("errors.zigbeeFailed"));this._zigbeeMeshError=t,Le.log("mesh_error",{network:"zigbee",error:t})}finally{this._zigbeeMeshLoading=!1,null!==this._zigbeeMeshTimer&&(window.clearInterval(this._zigbeeMeshTimer),this._zigbeeMeshTimer=null)}}async _refreshWifiMesh(){this._wifiMeshLoading=!0,this._wifiMeshError=null;try{this._wifiMesh=await this._client.getWifiMesh(),Le.log("mesh_load",{network:"wifi",links:this._wifiMesh.links.length})}catch(e){const t=this._meshErrorMessage(e,He("errors.wifiFailed"));this._wifiMeshError=t,Le.log("mesh_error",{network:"wifi",error:t})}finally{this._wifiMeshLoading=!1}}async _subscribeMatter(){this._unsubscribeMatter(),this._matterError=null;try{this._matterUnsubscribe=await this._client.subscribeMatterTopology(e=>{this._matterTopology=e})}catch(e){this._matterError=this._meshErrorMessage(e,He("errors.matterFailed"))}}_unsubscribeMatter(){this._matterUnsubscribe?.(),this._matterUnsubscribe=null}_meshErrorMessage(e,t){const{code:i,message:n}=e??{};return"unknown_command"===i?He("errors.restartHa"):"unauthorized"===i?He("errors.needsAdmin"):n||t}async _subscribeBluetooth(){this._unsubscribeBluetooth(),this._bluetoothError=null,this._bluetoothBuffer=new Map,this._bluetoothAdverts=new Map;let e=!1;try{this._bluetoothDevices=(await this._client.getBluetoothDevices()).devices,e=!0,this._bluetoothUnsubscribe=await this._client.subscribeBluetoothAdvertisements(e=>{for(const t of e.add??[])this._bluetoothBuffer.set(t.address,{address:t.address,source:t.source,rssi:t.rssi,name:t.name});for(const{address:t}of e.remove??[])this._bluetoothBuffer.delete(t);this._bluetoothFlushTimer??(this._bluetoothFlushTimer=window.setTimeout(()=>{this._bluetoothFlushTimer=null,this._bluetoothAdverts=new Map(this._bluetoothBuffer)},2e3))}),window.setTimeout(()=>{this._bluetoothAdverts=new Map(this._bluetoothBuffer),Le.log("mesh_load",{network:"bluetooth",adverts:this._bluetoothBuffer.size,known_addresses:Object.keys(this._bluetoothDevices).length})},300)}catch(t){this._bluetoothError=e&&"unknown_command"===t?.code?He("errors.bluetoothVersion"):this._meshErrorMessage(t,He("errors.bluetoothFailed")),Le.log("mesh_error",{network:"bluetooth",error:this._bluetoothError})}}_unsubscribeBluetooth(){this._bluetoothUnsubscribe?.(),this._bluetoothUnsubscribe=null,null!==this._bluetoothFlushTimer&&(window.clearTimeout(this._bluetoothFlushTimer),this._bluetoothFlushTimer=null)}connectedCallback(){super.connectedCallback(),this._fitToViewport(),window.visualViewport?.addEventListener("resize",this._fitToViewport),window.addEventListener("resize",this._fitToViewport),window.addEventListener("orientationchange",this._fitToViewport),window.addEventListener("keydown",this._onKeyDown),window.addEventListener("beforeunload",this._onBeforeUnload),document.addEventListener("visibilitychange",this._onVisibilityChange)}disconnectedCallback(){super.disconnectedCallback(),window.visualViewport?.removeEventListener("resize",this._fitToViewport),window.removeEventListener("resize",this._fitToViewport),window.removeEventListener("orientationchange",this._fitToViewport),window.removeEventListener("keydown",this._onKeyDown),window.removeEventListener("beforeunload",this._onBeforeUnload),document.removeEventListener("visibilitychange",this._onVisibilityChange),Le.flush(),this._flushAutoSave(),this._unsubscribeMatter(),this._unsubscribeBluetooth(),null!==this._zigbeeMeshTimer&&(window.clearInterval(this._zigbeeMeshTimer),this._zigbeeMeshTimer=null)}_deepActiveElement(){let e=document.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e}_isTypingTarget(){const e=this._deepActiveElement();return!!e&&(!!(e instanceof HTMLElement&&e.isContentEditable)||("TEXTAREA"===e.tagName||e instanceof HTMLInputElement&&["text","number","search","email","url","tel","password"].includes(e.type)))}async _handleBackgroundFile(e){if(function(e){return"image/svg+xml"===e.type||/\.svg$/i.test(e.name)}(e))await this._handleSvgFile(e,"background");else if(Xr._ACCEPTED_BACKGROUND_TYPES.has(e.type))try{const t=await this._client.uploadBackgroundImage(e);this._applyBackgroundImage(t)}catch(e){window.alert(He("errors.bgUpload",{error:e.message}))}else window.alert(He("errors.bgType"))}_applyBackgroundImage(e,t={}){const i={background_image_id:e,...!!this._activeBackground.imageId?{}:{background_opacity:.85}};"property"===this._view?this._updatePropertyLayout(i):this._updateLayout({...i,...t})}async _handleSvgFile(e,t){let i=null,n={},o=0;try{const r=await e.text(),s=Tn(r),a=this._layout,l="property"!==this._view,c=s.rooms.length+s.walls.length+s.openings.length>0,d=0===a.rooms.length&&0===a.walls.length,h=l&&c&&("import"===t||d);if("import"===t&&!c)return void window.alert(He("svgImport.nothingFound"));const u=h&&window.confirm(He("svgImport.confirm",{rooms:s.rooms.length,walls:s.walls.length,openings:s.openings.length}));if("import"===t&&!u)return;if("background"===t||!this._activeBackground.imageId||window.confirm(He("svgImport.alsoBackground"))){const t=await async function(e,t,i,n=4096){const o=(new DOMParser).parseFromString(e,"image/svg+xml"),r=o.documentElement,s=n/Math.max(t.w,t.h),a=Math.max(1,Math.round(t.w*s)),l=Math.max(1,Math.round(t.h*s));r.setAttribute("viewBox",`${t.x} ${t.y} ${t.w} ${t.h}`),r.setAttribute("width",String(a)),r.setAttribute("height",String(l)),r.setAttribute("preserveAspectRatio","none");const c=new Blob([(new XMLSerializer).serializeToString(o)],{type:"image/svg+xml"}),d=URL.createObjectURL(c);try{const e=new Image;e.src=d,await e.decode();const t=document.createElement("canvas");t.width=a,t.height=l;const n=t.getContext("2d");if(!n)throw new Error("Canvas not available");n.drawImage(e,0,0,a,l);const o=await new Promise(e=>t.toBlob(e,"image/png"));if(!o)throw new Error("Couldn't convert the SVG to an image");return new File([o],i.replace(/\.svg$/i,"")+".png",{type:"image/png"})}finally{URL.revokeObjectURL(d)}}(r,s.viewBox,e.name);i=await this._client.uploadBackgroundImage(t)}if(u){const e=this._settings.unit_system,t=He("imperial"===e?"units.feet":"units.metres"),i=window.prompt(He("svgImport.unitPrompt",{unit:t})),r=i?.trim()?pt(i.trim(),e):null,l=null!==r&&Number.isFinite(r)&&r>0?r:null,c=function(e,t,i,n){const o=e.viewBox,r=t.width/o.w,s=([e,i])=>[t.x+(e-o.x)*r,t.y+(i-o.y)*r],a=.003*Math.max(o.w,o.h),l=new Set(i),c=e.rooms.map(e=>{const t=[e.name,e.id??""].map(Jn).filter(Boolean),i=[...l].find(i=>t.includes(Jn(i.name))||null!==e.id&&i.area_id===e.id);return i&&l.delete(i),ze(e.name,e.points.map(s),i?.area_id??null)}),d=e.walls.map(e=>({points:e.points.map(e=>[e[0],e[1]]),strokeWidth:e.strokeWidth,mergedInto:null})),h=[];let u=0;for(const t of e.openings){const e=eo(d,t.points,a);if(!e){u++;continue}const{origin:i,dir:n,span:o}=e;let r=e.contained?e.wall:null;const[s,l]=o;if(!r){const e=e=>Math.abs((e[0]-i[0])*n[1]-(e[1]-i[1])*n[0]),t=e=>(e[0]-i[0])*n[0]+(e[1]-i[1])*n[1],c=d.filter(i=>{if(i.mergedInto||2!==i.points.length)return!1;if(!i.points.every(t=>e(t)<=a))return!1;const[n,r]=i.points.map(t).sort((e,t)=>e-t);return n<=o[1]+a&&r>=o[0]-a});if(0===c.length){u++;continue}let h=s,g=l;for(const e of c)for(const i of e.points)h=Math.min(h,t(i)),g=Math.max(g,t(i));r=c[0],r.points=[[i[0]+n[0]*h,i[1]+n[1]*h],[i[0]+n[0]*g,i[1]+n[1]*g]];for(const e of c.slice(1))e.mergedInto=r}const c=(s+l)/2;h.push({type:t.type,host:r,center:[i[0]+n[0]*c,i[1]+n[1]*c],width:l-s})}const g=new Map;for(const t of d){if(t.mergedInto)continue;const i=Oe(t.points.map(s));if(n&&t.strokeWidth){const o=t.strokeWidth/e.drawingUnit*n*100;i.thickness_cm=Math.max(1,Math.round(10*o)/10)}g.set(t,i)}const p=h.map(e=>{const[t,i]=s(e.center);return je(g.get(function(e){for(;e.mergedInto;)e=e.mergedInto;return e}(e.host)).id,e.type,t,i,e.width*r)});return{rooms:c,walls:[...g.values()],openings:p,scale:n?to(e,s,n):null,skippedOpenings:u}}(s,{x:a.background_offset_x,y:a.background_offset_y,width:kn*a.background_scale},this._areasForCurrentFloor,l),d=e=>e.points.map(([e,t])=>`${Math.round(e)},${Math.round(t)}`).join(" "),h=new Set(a.rooms.map(d)),u=[...a.rooms,...c.rooms.filter(e=>!h.has(d(e)))],g=[...a.walls,...c.walls],p=[...a.openings,...c.openings],m=Zo(g,p);n={rooms:u,pins:Xe(u,a.pins),walls:m?.walls??g,openings:m?.openings??p,...c.scale?{scale:c.scale}:{}},o=c.skippedOpenings}}catch(e){return void window.alert(He("errors.svgImport",{error:e.message}))}i?this._applyBackgroundImage(i,n):this._updateLayout(n),o>0&&window.alert(He("svgImport.skipped",{count:o}))}_disarmFurniture(){this._armedFurnitureKind=null,"furniture"===this._mode&&(this._mode="select")}_patchFurniture(e,t){this._updateLayout({furniture:this._layout.furniture.map(i=>i.id===e?{...i,...t}:i)})}_pasteFurniture(){const e=this._furnitureClipboard;if(!e)return;this._pasteCount+=1;const t=this._canvas?.lastPointer,i=30*this._unitsPerCm*this._pasteCount,n={...e,id:Ee("furniture"),x:t?t.x:e.x+i,y:t?t.y:e.y+i,locked:!1};this._updateLayout({furniture:[...this._layout.furniture,n]}),this._resetSelection(),this._selectedFurnitureId=n.id}_patchRoom(e,t){this._updateLayout({rooms:this._layout.rooms.map(i=>i.id===e?{...i,...t}:i)})}get _iconPickerPin(){const e=this._iconPickerFor;if(!e)return null;return("floor"===e.kind?this._layout.pins:this._propertyLayout.pins).find(t=>t.id===e.pinId)??null}_patchPin(e,t){this._updateLayout({pins:this._layout.pins.map(i=>i.id===e?{...i,...t}:i)})}_pinLabel(e){return e.label_override?e.label_override:Me(e.device_id,this._entityLookup.values())}_meshAgeLabel(e){const t=Math.round((Date.now()-e)/1e3);return t<60?He("network.refreshedSeconds",{n:t}):He("network.refreshedMinutes",{n:Math.round(t/60)})}_renderBackgroundPopover(){return N`
      <icon-popover
        slot="row-end"
        compact
        icon="mdi:image"
        label=${He("menu.background")}
        .open=${this._backgroundPopoverOpen}
        @toggle=${this._onToggleBackgroundPopover}
      >
        <input
          id="file-input"
          class="hidden-file-input"
          type="file"
          accept="image/png,image/jpeg,image/gif,image/svg+xml,.svg"
          @change=${this._onFileInputChange}
        />
        <input
          id="svg-import-input"
          class="hidden-file-input"
          type="file"
          accept="image/svg+xml,.svg"
          @change=${this._onSvgImportInputChange}
        />
        <button class="menu-item" @click=${()=>this._fileInput?.click()}>
          <ha-icon icon="mdi:image-plus"></ha-icon>
          ${this._activeBackground.imageId?He("menu.replaceBackground"):He("menu.uploadBackground")}
        </button>
        ${"property"===this._view?K:N`<button
                class="menu-item"
                @click=${()=>this.renderRoot.querySelector("#svg-import-input")?.click()}
              >
                <ha-icon icon="mdi:vector-square-plus"></ha-icon>
                ${He("menu.importSvg")}
              </button>`}
        ${"property"===this._view&&this._mapTilesAvailable&&void 0!==this._propertyLayout.map_background?N`<button
                  class="menu-item"
                  @click=${this._onToggleMapBackground}
                >
                  <ha-icon icon="mdi:map"></ha-icon>
                  ${this._propertyLayout.map_background?He("mapBackground.remove"):He("mapBackground.add")}
                </button>
                ${this._propertyLayout.map_background?N`<label class="popover-row"
                          >${He("mapBackground.style")}
                          <span class="select-wrap"
                            ><select @change=${this._onMapStyleChange}>
                              <option
                                value="street"
                                ?selected=${"aerial"!==this._propertyLayout.map_background.style}
                              >
                                ${He("mapBackground.street")}
                              </option>
                              <option
                                value="aerial"
                                ?selected=${"aerial"===this._propertyLayout.map_background.style}
                              >
                                ${He("mapBackground.aerial")}
                              </option></select
                            ><ha-icon
                              class="chev"
                              icon="mdi:menu-down"
                            ></ha-icon
                          ></span>
                        </label>
                        <label class="popover-row"
                          >${He("mapBackground.opacity")}
                          <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.05"
                            style="--pct:${(this._propertyLayout.map_background.opacity-.1)/.9*100}%"
                            .value=${String(this._propertyLayout.map_background.opacity)}
                            @input=${this._onMapOpacityChange}
                          />
                        </label>`:K}`:K}
        ${this._activeBackground.imageId?N`<button
                class="menu-item"
                @click=${this._onRemoveBackgroundClick}
              >
                <ha-icon icon="mdi:image-remove"></ha-icon>
                ${He("menu.removeBackground")}
              </button>`:K}
        ${this._activeBackground.imageId?N`<label class="popover-row"
                >${He("menu.opacity")}
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  style="--pct:${(this._activeBackground.opacity-.1)/.9*100}%"
                  .value=${String(this._activeBackground.opacity)}
                  @input=${this._onOpacityChange}
                />
              </label>`:K}
        ${this._renderCompassControls()}
      </icon-popover>
    `}get _networkLabel(){switch(this._networkType){case"zigbee":return He("network.zigbeeShort");case"wifi":return He("network.wifiShort");case"matter":return He("network.matterShort");case"bluetooth":return He("network.bluetooth");default:return null}}render(){if(this._loading)return N`<div class="loading">${He("panel.loading")}</div>`;if(0===this._floors.length)return N`<div class="no-floors">${He("panel.noFloors")}</div>`;const e="zigbee"===this._networkType?this._zigbeeMeshError:"wifi"===this._networkType?this._wifiMeshError:"bluetooth"===this._networkType?this._bluetoothError:this._matterError;return N`
      <app-header
        .floors=${this._orderedFloors}
        .selectedFloorId=${this._currentFloorId}
        .propertySelected=${"property"===this._view}
        @floor-selected=${this._onFloorSelected}
        @property-selected=${this._onPropertySelected}
      >
        ${"floor"===this._view||"property"===this._view?N`<icon-popover
                icon="mdi:lan"
                label=${He("menu.connectivity")}
                .open=${this._meshPopoverOpen}
                ?highlight=${null!==this._networkType}
                @toggle=${this._onToggleMeshPopover}
              >
                <div class="layer-list">
                  <button
                    class="menu-item ${"zigbee"===this._networkType?"active":""}"
                    @click=${()=>this._onNetworkTypeSelect("zigbee")}
                  >
                    <ha-icon icon="mdi:zigbee"></ha-icon>
                    ${He("network.zigbee")}
                    ${"zigbee"===this._networkType?N`<ha-icon class="trail" icon="mdi:check"></ha-icon>`:K}
                  </button>
                  <button
                    class="menu-item ${"wifi"===this._networkType?"active":""}"
                    @click=${()=>this._onNetworkTypeSelect("wifi")}
                  >
                    <ha-icon icon="mdi:wifi"></ha-icon>
                    ${He("network.wifi")}
                    ${"wifi"===this._networkType?N`<ha-icon class="trail" icon="mdi:check"></ha-icon>`:K}
                  </button>
                  <button
                    class="menu-item ${"matter"===this._networkType?"active":""}"
                    @click=${()=>this._onNetworkTypeSelect("matter")}
                  >
                    <ha-icon icon="mdi:router-wireless"></ha-icon>
                    ${He("network.matter")}
                    ${"matter"===this._networkType?N`<ha-icon class="trail" icon="mdi:check"></ha-icon>`:K}
                  </button>
                  <button
                    class="menu-item ${"bluetooth"===this._networkType?"active":""}"
                    @click=${()=>this._onNetworkTypeSelect("bluetooth")}
                  >
                    <ha-icon icon="mdi:bluetooth"></ha-icon>
                    ${He("network.bluetooth")}
                    ${"bluetooth"===this._networkType?N`<ha-icon class="trail" icon="mdi:check"></ha-icon>`:K}
                  </button>
                </div>
                ${null===this._networkType?K:N`
                        <div class="menu-divider"></div>
                        ${"zigbee"===this._networkType?N`<button
                                  class="menu-item"
                                  ?disabled=${this._zigbeeMeshLoading}
                                  @click=${this._onLoadMesh}
                                >
                                  <ha-icon icon="mdi:refresh"></ha-icon>
                                  ${this._zigbeeMeshLoading?He("network.loadingZigbee",{seconds:this._zigbeeMeshElapsedSeconds}):this._zigbeeMeshFetchedAt?He("network.refresh"):He("network.load")}
                                </button>
                                <label class="popover-row">
                                  ${He("network.showAll")}
                                  <input
                                    type="checkbox"
                                    class="switch"
                                    role="switch"
                                    .checked=${this._zigbeeShowAllLinks}
                                    @change=${e=>{this._zigbeeShowAllLinks=e.target.checked,this._selectedMeshLink=null,this._selectedMeshStub=null}}
                                  />
                                </label>`:"matter"===this._networkType&&this._matterUnsubscribe||"bluetooth"===this._networkType&&this._bluetoothUnsubscribe?N`<span
                                  class="hint"
                                  style="padding: 4px 16px 8px"
                                  >${He("network.live")}</span
                                >`:"wifi"===this._networkType&&this._wifiMeshLoading?N`<span
                                    class="hint"
                                    style="padding: 4px 16px 8px"
                                    >${He("network.loading")}</span
                                  >`:K}
                        ${e?N`<span
                                class="hint"
                                style="color: var(--sc-danger); padding: 0 16px 8px"
                                >${e}</span
                              >`:"zigbee"===this._networkType&&this._zigbeeMeshFetchedAt?N`<span
                                  class="hint"
                                  style="padding: 0 16px 8px"
                                  >${this._meshAgeLabel(this._zigbeeMeshFetchedAt)}</span
                                >`:K}
                      `}
              </icon-popover>`:K}
        ${"floor"===this._view?N`<button
                slot="end"
                class="header-icon-button ${this._view3dOpen?"active":""}"
                title=${He("view3d.open")}
                aria-pressed=${this._view3dOpen?"true":"false"}
                @click=${()=>this._view3dOpen=!this._view3dOpen}
              >
                3D
              </button>`:K}
        <icon-popover
          slot="end"
          icon="mdi:cog"
          label="Settings"
          dialog
          .open=${this._settingsPopoverOpen}
          @toggle=${this._onToggleSettingsPopover}
        >
          <settings-menu
            .settings=${this._settings}
            .coordinatorChoices=${this._placedDeviceChoices}
            .weatherEntities=${this._entityOptions("weather")}
            @settings-change=${this._onSettingsChange}
            @settings-close=${()=>this._settingsPopoverOpen=!1}
          ></settings-menu>
        </icon-popover>
        <icon-popover
          slot="end"
          icon="mdi:dots-vertical"
          label=${He("menu.more")}
          .open=${this._moreOptionsPopoverOpen}
          @toggle=${this._onToggleMoreOptionsPopover}
        >
          <button
            class="menu-item"
            @click=${()=>{this._moreOptionsPopoverOpen=!1,this._onExportClick()}}
          >
            <ha-icon icon="mdi:download"></ha-icon>
            ${He("menu.exportJson")}
          </button>
          <button
            class="menu-item"
            title=${He("menu.debugReportHint")}
            @click=${()=>{this._moreOptionsPopoverOpen=!1,this._downloadDebugReport()}}
          >
            <ha-icon icon="mdi:bug"></ha-icon> ${He("menu.debugReport")}
          </button>
          <button
            class="menu-item danger"
            @click=${()=>{this._moreOptionsPopoverOpen=!1,this._onResetClick()}}
          >
            <ha-icon icon="mdi:delete-sweep"></ha-icon>
            ${"property"===this._view?He("menu.resetProperty"):He("menu.resetFloor")}
          </button>
        </icon-popover>
      </app-header>

      <div class="main">
        ${this._versionNotice?N`<div class="save-error floating-panel" role="status">
                <ha-icon icon="mdi:update"></ha-icon>
                <span
                  >${"restart"===this._versionNotice?He("panel.versionRestart"):He("panel.versionReload")}</span
                >
                <button @click=${()=>this._versionNotice=null}>
                  ${He("panel.dismiss")}
                </button>
              </div>`:K}
        ${this._saveError?N`<div class="save-error floating-panel" role="alert">
                <ha-icon icon="mdi:alert"></ha-icon>
                <span
                  >Couldn't save: ${this._saveError} Your changes are still here
                  — keep this tab open.</span
                >
                <button @click=${this._onSaveClick}>Retry</button>
              </div>`:K}
        ${"property"===this._view?N`
                <div
                  class="canvas-area ${this._dragOverCanvas?"drag-over":""}"
                  @dragover=${this._onCanvasDragOver}
                  @dragleave=${this._onCanvasDragLeave}
                  @drop=${this._onCanvasDrop}
                >
                  <property-canvas
                    .dark=${this._hass?.themes?.darkMode??!1}
                    .placements=${this._livePlacements}
                    .ghosts=${this._placementGhosts}
                    .hass=${this._hass}
                    .mapBackground=${this._propertyLayout.map_background??null}
                    @map-adjust=${this._onMapAdjust}
                    .floorNameById=${this._floorNameById}
                    .floorIconById=${this._floorIconById}
                    .backgroundImageUrl=${Be(this._propertyLayout.background_image_id)}
                    .backgroundOpacity=${this._propertyLayout.background_opacity}
                    .backgroundOffsetX=${this._propertyLayout.background_offset_x}
                    .backgroundOffsetY=${this._propertyLayout.background_offset_y}
                    .backgroundScale=${this._propertyLayout.background_scale}
                    .initialViewBox=${this._propertyLayout.view_box}
                    .mode=${this._propertyMode}
                    .selectedPlacementId=${this._selectedPlacementId}
                    .pins=${this._propertyLayout.pins}
                    .selectedPinId=${this._selectedOutdoorPinId}
                    .entityLookup=${this._entityLookup}
                    .meshLinks=${this._propertyMeshLinks}
                    .selectedMeshLinkKey=${this._selectedPropertyMeshLinkKey}
                    @outdoor-pin-place=${this._onOutdoorPinPlace}
                    @property-gesture-start=${()=>this._propertyDragStart=this._propertyLayout}
                    @outdoor-pin-move=${this._onOutdoorPinMove}
                    @outdoor-pin-select=${this._onOutdoorPinSelect}
                    @property-mesh-link-select=${this._onPropertyMeshLinkSelect}
                    @placement-place=${this._onPlacementPlace}
                    @placement-move=${this._onPlacementMove}
                    @placement-resize=${this._onPlacementResize}
                    @placement-rotate=${this._onPlacementRotate}
                    @placement-select=${this._onPlacementSelect}
                  ></property-canvas>
                  <property-overlay
                    .dirty=${this._propertyDirty}
                    .saving=${this._propertySaving}
                    .canUndo=${this._canUndo}
                    .canRedo=${this._canRedo}
                    @undo-click=${this._onUndo}
                    @redo-click=${this._onRedo}
                    @save-click=${this._onSaveClick}
                    .meshLegend=${null!==this._networkType}
                    .mode=${this._propertyMode}
                    .buildings=${this._buildings}
                    .scaleReadout=${this._propertyScaleReadout}
                    .scaleWarning=${this._propertyScale?.disagree?He("panel.scaleDisagree"):null}
                    .armedBuildingKey=${this._armedBuildingKey}
                    .selectedPlacement=${this._selectedPlacement}
                    .selectedPinLabel=${this._selectedOutdoorPin?this._pinLabel(this._selectedOutdoorPin):null}
                    .selectedMeshLink=${this._selectedPropertyMeshLink}
                    .selectedPinDefaultLabel=${this._selectedOutdoorPin?Me(this._selectedOutdoorPin.device_id,this._entityLookup.values()):null}
                    .selectedPinOverride=${this._selectedOutdoorPin?.label_override??null}
                    .selectedPinDeviceId=${this._selectedOutdoorPin?.device_id??null}
                    .meshLinks=${this._propertyMeshLinks}
                    .networkLabel=${this._networkLabel}
                    .floorNameById=${this._floorNameById}
                    @outdoor-pin-label-change=${this._onOutdoorPinLabelChange}
                    @selection-clear=${this._onPropertySelectionClear}
                    @outdoor-pin-icon-click=${this._onOutdoorPinIcon}
                    @outdoor-pin-delete-click=${this._onOutdoorPinDelete}
                    @property-mesh-goto-floor-click=${this._onPropertyMeshGotoFloor}
                    @property-mode-change=${this._onPropertyModeChange}
                    @map-rotation-set=${this._onMapRotationSet}
                    @map-zoom-step=${this._onMapZoomStep}
                    .mapActive=${!!this._propertyLayout.map_background}
                    .mapRotation=${this._propertyLayout.map_background?.rotation_deg??0}
                    @placement-arm=${this._onPlacementArm}
                    @placement-label-change=${this._onPlacementLabelChange}
                    @placement-delete-click=${this._onPlacementDeleteClick}
                    @placement-goto-floor-click=${this._onPlacementGotoFloorClick}
                    >${this._renderBackgroundPopover()}</property-overlay
                  >
                </div>
                ${"place-pin"===this._propertyMode?N`<entity-picker-sidebar
                        @picker-close=${this._onPickerClose}
                        .entities=${this._entities}
                        .placedDeviceIds=${this._placedDeviceIds}
                        .armedEntityId=${this._armedEntityId}
                        .floors=${this._floors}
                        .areas=${this._areas}
                        .currentFloorId=${ve}
                        @entity-armed=${this._onEntityArmed}
                        @clear-all-pins=${this._onClearAllOutdoorPins}
                      ></entity-picker-sidebar>`:K}
              `:N`
                <div
                  class="canvas-area ${this._dragOverCanvas?"drag-over":""}"
                  @dragover=${this._onCanvasDragOver}
                  @dragleave=${this._onCanvasDragLeave}
                  @drop=${this._onCanvasDrop}
                >
                  <floorplan-canvas
                    @calibrate-scale-click=${this._onCalibrateScaleClick}
                    .dark=${this._hass?.themes?.darkMode??!1}
                    .rooms=${this._layout.rooms}
                    .pins=${this._layout.pins}
                    .walls=${this._layout.walls}
                    .openings=${this._layout.openings}
                    .scale=${this._layout.scale}
                    .unitSystem=${this._settings.unit_system}
                    .meshLinks=${this._meshLinksForCurrentFloor}
                    .meshStubs=${this._meshStubsForCurrentFloor}
                    .entityLookup=${this._entityLookup}
                    .backgroundImageUrl=${Be(this._layout.background_image_id)}
                    .backgroundOpacity=${this._layout.background_opacity}
                    .backgroundOffsetX=${this._layout.background_offset_x}
                    .backgroundOffsetY=${this._layout.background_offset_y}
                    .backgroundScale=${this._layout.background_scale}
                    .alignOverlay=${this._alignOverlay}
                    .initialViewBox=${this._layout.view_box}
                    .sameBuildingAsPrevious=${this._sameBuildingAsPreviousFloor}
                    .mode=${this._mode}
                    .snapMode=${this._snapMode}
                    .armedEntityId=${this._armedEntityId}
                    .armedOpeningType=${this._armedOpeningType}
                    .selectedRoomId=${this._selectedRoomId}
                    .editingRoomId=${this._editingRoomId}
                    .selectedPinId=${this._selectedPinId}
                    .selectedWallId=${this._selectedWallId}
                    .editingWallId=${this._editingWallId}
                    .selectedOpeningId=${this._selectedOpeningId}
                    .furniture=${this._layout.furniture}
                    .selectedFurnitureId=${this._selectedFurnitureId}
                    .armedFurnitureKind=${this._armedFurnitureKind}
                    .armedFurnitureRotation=${this._armedFurnitureRotation}
                    .roomLights=${this._roomLights}
                    .coverOpenness=${this._coverOpenness}
                    .pinColors=${this._pinColors}
                    .itemStates=${this._itemStates}
                    .showFurniture=${this._overlays.furniture}
                    .showLights=${this._overlays.lights}
                    .showCovers=${this._overlays.covers}
                    .showLightCount=${!1!==this._settings.show_light_count}
                    .roomBorder=${function(e){return{show:!1!==e.room_border_show,color:e.room_border_color??null,width:e.room_border_width??2,opacity:e.room_border_opacity??1}}(this._settings)}
                    .roomLabelStyle=${{size:this._settings.room_label_size??16,color:this._settings.room_label_color??null,bold:!0===this._settings.room_label_bold,halo:!1!==this._settings.room_label_halo,haloWidth:this._settings.room_label_halo_width??3,haloColor:this._settings.room_label_halo_color??null}}
                    .customIcons=${this._settings.custom_icons??[]}
                    .showScaleLine=${!1!==this._settings.show_scale_line}
                    .roomFillUnder=${!0===this._settings.room_fill_under_background}
                    .northDeg=${this._layout.north_deg}
                    .location=${this._location}
                    .sunTime=${this._sunTime}
                    .sky=${this._sky}
                    @overlay-toggle=${this._onOverlayToggle}
                    @furniture-place=${this._onFurniturePlace}
                    @furniture-select=${this._onFurnitureSelect}
                    @furniture-update=${this._onFurnitureUpdate}
                    .selectedMeshLinkKey=${this._selectedMeshLinkKey}
                    .selectedMeshStubKey=${this._selectedMeshStubKey}
                    @room-trace-complete=${this._onRoomTraceComplete}
                    @room-vertex-changed=${this._onRoomVertexChanged}
                    @room-label-moved=${this._onRoomLabelMoved}
                    @room-move=${this._onRoomMove}
                    @room-select=${this._onRoomSelect}
                    @wall-trace-complete=${this._onWallTraceComplete}
                    @wall-vertex-changed=${this._onWallVertexChanged}
                    @wall-select=${this._onWallSelect}
                    @opening-place=${this._onOpeningPlace}
                    @opening-select=${this._onOpeningSelect}
                    @opening-update=${this._onOpeningUpdate}
                    @pin-place=${this._onPinPlace}
                    @pin-move=${this._onPinMove}
                    @pin-select=${this._onPinSelect}
                    @pin-stack-select=${this._onPinStackSelect}
                    @mesh-link-select=${this._onMeshLinkSelect}
                    @mesh-stub-select=${this._onMeshStubSelect}
                    @scale-line-complete=${this._onScaleLineComplete}
                    @pending-changed=${this._onPendingChanged}
                    @align-drag=${this._onAlignDrag}
                  ></floorplan-canvas>

                  <canvas-overlay
                    .dirty=${this._dirty}
                    .saving=${this._saving}
                    .canUndo=${this._canUndo}
                    .canRedo=${this._canRedo}
                    @undo-click=${this._onUndo}
                    @redo-click=${this._onRedo}
                    @save-click=${this._onSaveClick}
                    .meshLegend=${null!==this._networkType}
                    .mode=${this._mode}
                    .armedOpeningType=${this._armedOpeningType}
                    .hasPendingTrace=${"trace"===this._mode&&this._pendingCount>0}
                    .hasPendingWall=${"wall"===this._mode&&this._pendingCount>=2}
                    .furnitureHint=${"furniture"!==this._mode?"place":this._armedFurnitureKind===Hi?"freeform":Ai(this._armedFurnitureKind)?"shape":"place"}
                    .freeformPoints=${this._armedFurnitureKind===Hi?this._pendingCount:0}
                    @finish-shape-click=${()=>this._canvas?.finishPendingShape()}
                    .snapMode=${this._snapMode}
                    .pendingScaleCount=${"scale"===this._mode?this._pendingCount:0}
                    .unitSystem=${this._settings.unit_system}
                    .unitsPerMeter=${this._unitsPerMeter()}
                    .selectedRoom=${this._selectedRoom}
                    .editingRoom=${!!this._editingRoomId}
                    .areas=${this._areasForCurrentFloor}
                    .selectedPin=${this._selectedPin}
                    .selectedWall=${this._selectedWall}
                    .editingWall=${!!this._editingWallId}
                    .selectedOpening=${this._selectedOpening}
                    .selectedFurniture=${this._selectedFurniture}
                    .furnitureLibraryOpen=${this._furnitureLibraryOpen}
                    .rooms=${this._layout.rooms}
                    .allAreas=${this._areas}
                    .lightEntities=${this._selectedRoom?this._entityOptions("light"):[]}
                    .coverEntities=${this._selectedOpening?this._entityOptions("cover"):[]}
                    .selectedRoomLight=${this._selectedRoom?this._roomLights.get(this._selectedRoom.id)??null:null}
                    .selectedCoverOpenness=${this._selectedOpening?this._coverOpenness.get(this._selectedOpening.id)??null:null}
                    .floorCalibrated=${null!==this._layout.scale}
                    .linkableEntities=${this._selectedFurniture?this._linkableEntities():[]}
                    .selectedItemState=${this._selectedFurniture?this._itemStates.get(this._selectedFurniture.id)??null:null}
                    @furniture-entity-toggle=${this._onFurnitureEntityToggle}
                    @furniture-library-click=${this._onFurnitureLibraryClick}
                    @furniture-done-click=${this._onFurnitureDone}
                    @furniture-rotate-armed-click=${this._onFurnitureRotateArmed}
                    @furniture-change=${this._onFurnitureChange}
                    @furniture-delete-click=${this._onFurnitureDelete}
                    @furniture-duplicate-click=${this._onFurnitureDuplicate}
                    @furniture-order-click=${this._onFurnitureOrder}
                    @room-links-change=${this._onRoomLinksChange}
                    @room-lights-command=${this._onRoomLightsCommand}
                    @opening-cover-change=${this._onOpeningCoverChange}
                    @opening-daylight-change=${this._onOpeningDaylightChange}
                    @opening-cover-swap=${this._onOpeningCoverSwap}
                    @opening-garage-change=${this._onOpeningGarageChange}
                    @opening-style-change=${this._onOpeningStyleChange}
                    @room-outdoor-change=${this._onRoomOutdoorChange}
                    @room-floor-offset-change=${this._onRoomFloorOffsetChange}
                    @room-label-change=${this._onRoomLabelChange}
                    .selectedCoverOpennessRight=${this._selectedOpening?this._coverOpenness.get(`${this._selectedOpening.id}:right`)??null:null}
                    .selectedMeshLink=${this._selectedMeshLink}
                    .meshLinks=${this._meshLinksForCurrentFloor}
                    .meshStubs=${this._meshStubsForCurrentFloor}
                    .networkLabel=${this._networkLabel}
                    .selectedMeshStub=${this._selectedMeshStub}
                    .pinStack=${this._pinStack}
                    .entityLookup=${this._entityLookup}
                    .otherFloors=${this._otherFloors}
                    .alignTargetFloorId=${this._alignTargetFloorId}
                    .alignTargetHasBackground=${!this._alignTargetLayout||!!this._alignTargetLayout.background_image_id}
                    @mode-change=${this._onModeChange}
                    @align-target-change=${this._onAlignTargetChange}
                    @align-scale-click=${this._onAlignScaleClick}
                    @align-apply-click=${this._onAlignApply}
                    @align-cancel-click=${this._onAlignCancel}
                    @add-opening-click=${this._onAddOpeningClick}
                    @cancel-pending-click=${this._onCancelPending}
                    @finish-wall-click=${this._onFinishWall}
                    @snap-mode-change=${this._onSnapModeChange}
                    @room-name-change=${this._onRoomNameChange}
                    @room-area-change=${this._onRoomAreaChange}
                    @room-visible-toggle=${this._onRoomVisibleToggle}
                    @room-fill-color-change=${this._onRoomFillColorChange}
                    @room-fill-opacity-change=${this._onRoomFillOpacityChange}
                    @room-border-opacity-change=${this._onRoomBorderOpacityChange}
                    @room-edit-vertices-click=${this._onRoomEditVertices}
                    @room-label-reset-click=${this._onRoomLabelReset}
                    @room-delete-click=${this._onRoomDelete}
                    @pin-label-change=${this._onPinLabelChange}
                    @pin-set-icon-click=${this._onPinSetIcon}
                    @pin-icon-quick=${this._onPinIconQuick}
                    @room-device-toggle=${this._onRoomDeviceToggle}
                    @room-devices-add-all=${this._onRoomDevicesAddAll}
                    .areaDevices=${this._areaDevices(this._selectedRoom)}
                    .pinIconChoices=${this._selectedPin?function(e){const t=[Oo(e),...e?Do[e.domain]??[]:[],...zo];return[...new Set(t)].slice(0,8)}(xe(this._selectedPin.device_id,this._entities)):[]}
                    @pin-height-change=${this._onPinHeightChange}
                    @pin-delete-click=${this._onPinDelete}
                    @wall-material-change=${this._onWallMaterialChange}
                    @wall-thickness-change=${this._onWallThicknessChange}
                    @wall-edit-vertices-click=${this._onWallEditVertices}
                    @wall-delete-click=${this._onWallDelete}
                    @opening-width-change=${this._onOpeningWidthChange}
                    @opening-delete-click=${this._onOpeningDelete}
                    @pin-stack-choose=${this._onPinStackChoose}
                    @pin-stack-dismiss=${this._onPinStackDismiss}
                    @selection-clear=${this._onSelectionClear}
                    @pin-stack-remove-click=${this._onPinStackRemove}
                    @mesh-stub-goto-floor-click=${this._onMeshStubGotoFloorClick}
                    >${this._renderBackgroundPopover()}</canvas-overlay
                  >
                  ${this._view3dOpen?N`<floorplan-3d-view
                          .hass=${this._hass}
                          .floorId=${this._currentFloorId}
                          .layout=${this._layout}
                          .floors=${this._floors}
                          .sky=${this._sky}
                          .dark=${this._hass?.themes?.darkMode??!1}
                          editable
                          closable
                          @close-3d=${()=>this._view3dOpen=!1}
                        ></floorplan-3d-view>`:K}
                </div>
                ${"place"===this._mode?N`<entity-picker-sidebar
                        @picker-close=${this._onPickerClose}
                        .entities=${this._entities}
                        .placedDeviceIds=${this._placedDeviceIds}
                        .armedEntityId=${this._armedEntityId}
                        .floors=${this._floors}
                        .areas=${this._areas}
                        .currentFloorId=${this._currentFloorId}
                        .linkedAreaIds=${this._outdoorAreaIdsOnCurrentFloor}
                        @entity-armed=${this._onEntityArmed}
                        @clear-all-pins=${this._onClearAllPins}
                      ></entity-picker-sidebar>`:this._furnitureLibraryOpen?N`<furniture-library-sidebar
                          .armedKind=${this._armedFurnitureKind}
                          .unitSystem=${this._settings.unit_system}
                          .customIcons=${this._settings.custom_icons??[]}
                          @settings-change=${this._onSettingsChange}
                          @furniture-armed=${this._onFurnitureArmed}
                          @library-close=${this._onLibraryClose}
                        ></furniture-library-sidebar>`:K}
              `}
      </div>
      ${this._iconPickerPin?N`<icon-picker-dialog
              .value=${this._iconPickerPin.icon_override??null}
              .suggestFrom=${this._pinLabel(this._iconPickerPin)}
              @icon-picked=${this._onIconPicked}
              @icon-picker-cancel=${this._onIconPickerCancel}
            ></icon-picker-dialog>`:K}
    `}};ts.styles=[yt,wt,$t,xt,a`
      :host {
        display: flex;
        flex-direction: column;
        height: 100vh;
        /* iOS Safari: 100vh is taller than the visible area. */
        height: 100dvh;
        background: var(--sc-bg);
      }
      .main {
        flex: 1;
        display: flex;
        min-height: 0;
        position: relative;
      }
      .save-error {
        position: absolute;
        top: 68px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 5;
        display: flex;
        align-items: center;
        gap: 8px;
        max-width: min(640px, calc(100% - 32px));
        padding: 8px 12px;
        border-left: 4px solid var(--sc-danger);
        font-size: var(--sc-fs-body);
      }
      .save-error ha-icon {
        color: var(--sc-danger);
        flex: none;
      }
      /* Phones: the device picker becomes a sheet under the canvas. */
      @media (max-width: 700px) {
        .main {
          flex-direction: column;
        }
        .canvas-area {
          min-height: 0;
        }
      }
      .canvas-area {
        flex: 1;
        min-width: 0;
        position: relative;
        /* Room for the controls row the overlay draws across the top. */
        padding-top: 56px;
      }
      /* The 3D view covers the plan and its controls row; the plan stays
       * mounted underneath, so going back keeps its pan/zoom. */
      floorplan-3d-view {
        position: absolute;
        inset: 0;
        z-index: 5;
      }
      .header-icon-button {
        width: 48px;
        height: 48px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        font-weight: 600;
        font-size: var(--sc-fs-small);
      }
      .header-icon-button.active {
        color: var(--sc-accent);
        background: color-mix(in srgb, var(--sc-accent) 14%, transparent);
      }
      @media (max-width: 600px) {
        .header-icon-button {
          width: 40px;
          height: var(--sc-h-control);
        }
      }
      .canvas-area.drag-over {
        outline: 2px dashed var(--sc-accent);
        outline-offset: -2px;
      }
      .loading,
      .no-floors {
        padding: 32px;
        color: var(--sc-fg-secondary);
      }
      .popover-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        min-height: 44px;
        padding: 6px 16px;
        font-size: var(--sc-fs-row);
      }
      .menu-divider {
        height: 1px;
        margin: 6px 0;
        background: var(--sc-divider);
      }
      .menu-item .trail {
        margin-left: auto;
        color: var(--sc-accent);
      }
      /* Innerspace-style layer menu: "Connectivity Map" opens a list of
       * mutually-exclusive layers (only one network is ever drawn at once)
       * instead of a plain <select>, plus a quality legend echoing the
       * same weak/medium/strong colors the mesh lines themselves use. */
      .layer-list {
        display: flex;
        flex-direction: column;
        min-width: 220px;
      }
      .hidden-file-input {
        display: none;
      }
      input[type="range"] {
        width: 130px;
      }
      .popover-row select {
        height: var(--sc-h-field);
        padding: 0 12px;
        border: 1px solid var(--sc-divider);
        border-radius: var(--sc-r-control);
        background: var(--sc-panel-bg);
        color: var(--sc-fg);
        font: inherit;
        font-size: var(--sc-fs-body);
      }
      .popover-row select:focus {
        outline: none;
        border-color: var(--sc-accent);
      }
      .hint {
        font-size: var(--sc-fs-small);
        color: var(--sc-fg-secondary);
      }
    `],ts.AUTO_SAVE_DELAY_MS=3e3,ts._ACCEPTED_BACKGROUND_TYPES=new Set(["image/png","image/jpeg","image/gif"]),e([fe()],ts.prototype,"_floors",void 0),e([fe()],ts.prototype,"_currentFloorId",void 0),e([fe()],ts.prototype,"_layout",void 0),e([fe()],ts.prototype,"_selectedFurnitureId",void 0),e([fe()],ts.prototype,"_armedFurnitureKind",void 0),e([fe()],ts.prototype,"_armedFurnitureRotation",void 0),e([fe()],ts.prototype,"_furnitureLibraryOpen",void 0),e([fe()],ts.prototype,"_overlays",void 0),e([fe()],ts.prototype,"_roomLights",void 0),e([fe()],ts.prototype,"_coverOpenness",void 0),e([fe()],ts.prototype,"_pinColors",void 0),e([fe()],ts.prototype,"_itemStates",void 0),e([fe()],ts.prototype,"_sky",void 0),e([fe()],ts.prototype,"_sunPreviewMinutes",void 0),e([fe()],ts.prototype,"_entities",void 0),e([fe()],ts.prototype,"_areas",void 0),e([fe()],ts.prototype,"_mode",void 0),e([fe()],ts.prototype,"_snapMode",void 0),e([fe()],ts.prototype,"_dragOverCanvas",void 0),e([fe()],ts.prototype,"_armedEntityId",void 0),e([fe()],ts.prototype,"_armedOpeningType",void 0),e([fe()],ts.prototype,"_selectedRoomId",void 0),e([fe()],ts.prototype,"_editingRoomId",void 0),e([fe()],ts.prototype,"_selectedPinId",void 0),e([fe()],ts.prototype,"_pinStackIds",void 0),e([fe()],ts.prototype,"_selectedWallId",void 0),e([fe()],ts.prototype,"_editingWallId",void 0),e([fe()],ts.prototype,"_selectedOpeningId",void 0),e([fe()],ts.prototype,"_selectedMeshLink",void 0),e([fe()],ts.prototype,"_selectedMeshStub",void 0),e([fe()],ts.prototype,"_otherFloorPinsByDeviceId",void 0),e([fe()],ts.prototype,"_dirty",void 0),e([fe()],ts.prototype,"_saving",void 0),e([fe()],ts.prototype,"_loading",void 0),e([fe()],ts.prototype,"_pendingCount",void 0),e([fe()],ts.prototype,"_networkType",void 0),e([fe()],ts.prototype,"_zigbeeMesh",void 0),e([fe()],ts.prototype,"_zigbeeMeshLoading",void 0),e([fe()],ts.prototype,"_zigbeeMeshError",void 0),e([fe()],ts.prototype,"_zigbeeMeshFetchedAt",void 0),e([fe()],ts.prototype,"_zigbeeMeshElapsedSeconds",void 0),e([fe()],ts.prototype,"_zigbeeShowAllLinks",void 0),e([fe()],ts.prototype,"_wifiMesh",void 0),e([fe()],ts.prototype,"_wifiMeshLoading",void 0),e([fe()],ts.prototype,"_wifiMeshError",void 0),e([fe()],ts.prototype,"_matterTopology",void 0),e([fe()],ts.prototype,"_matterError",void 0),e([fe()],ts.prototype,"_bluetoothAdverts",void 0),e([fe()],ts.prototype,"_bluetoothDevices",void 0),e([fe()],ts.prototype,"_bluetoothError",void 0),e([fe()],ts.prototype,"_backgroundPopoverOpen",void 0),e([fe()],ts.prototype,"_meshPopoverOpen",void 0),e([fe()],ts.prototype,"_settings",void 0),e([fe()],ts.prototype,"_settingsPopoverOpen",void 0),e([fe()],ts.prototype,"_moreOptionsPopoverOpen",void 0),e([fe()],ts.prototype,"_view3dOpen",void 0),e([fe()],ts.prototype,"_view",void 0),e([fe()],ts.prototype,"_placementGhosts",void 0),e([fe()],ts.prototype,"_propertyLayout",void 0),e([fe()],ts.prototype,"_propertyDirty",void 0),e([fe()],ts.prototype,"_saveError",void 0),e([fe()],ts.prototype,"_iconPickerFor",void 0),e([fe()],ts.prototype,"_versionNotice",void 0),e([fe()],ts.prototype,"_propertySaving",void 0),e([fe()],ts.prototype,"_selectedPlacementId",void 0),e([fe()],ts.prototype,"_propertyMode",void 0),e([fe()],ts.prototype,"_selectedOutdoorPinId",void 0),e([fe()],ts.prototype,"_selectedPropertyMeshLinkKey",void 0),e([fe()],ts.prototype,"_armedBuildingKey",void 0),e([fe()],ts.prototype,"_sameBuildingAsPreviousFloor",void 0),e([fe()],ts.prototype,"_alignTargetFloorId",void 0),e([fe()],ts.prototype,"_alignTargetLayout",void 0),e([fe()],ts.prototype,"_alignOffsetX",void 0),e([fe()],ts.prototype,"_alignOffsetY",void 0),e([fe()],ts.prototype,"_alignScale",void 0),e([_e("floorplan-canvas")],ts.prototype,"_canvas",void 0),e([_e("property-canvas")],ts.prototype,"_propertyCanvas",void 0),e([_e("#file-input")],ts.prototype,"_fileInput",void 0),ts=Xr=e([be("spatial-context-panel")],ts),window.__spatialContextSetLanguage=function(e){const t=e.locale?.language??e.language??"en";Pe=Ce[t]?t:"en"}}();

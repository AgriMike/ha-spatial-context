/*! spatial-context-panel v0.15.0-beta.1 | MIT */
!function(){"use strict";function e(e,t,i,o){var n,s=arguments.length,r=s<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(e,t,i,o);else for(var a=e.length-1;a>=0;a--)(n=e[a])&&(r=(s<3?n(r):s>3?n(t,i,r):n(t,i))||r);return s>3&&r&&Object.defineProperty(t,i,r),r}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,o=Symbol(),n=new WeakMap;let s=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==o)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=n.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&n.set(t,e))}return e}toString(){return this.cssText}};const r=e=>new s("string"==typeof e?e:e+"",void 0,o),a=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,o)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[o+1],e[0]);return new s(i,e,o)},l=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return r(t)})(e):e,{is:c,defineProperty:d,getOwnPropertyDescriptor:h,getOwnPropertyNames:u,getOwnPropertySymbols:p,getPrototypeOf:g}=Object,_=globalThis,m=_.trustedTypes,f=m?m.emptyScript:"",b=_.reactiveElementPolyfillSupport,v=(e,t)=>e,y={toAttribute(e,t){switch(t){case Boolean:e=e?f:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},w=(e,t)=>!c(e,t),k={attribute:!0,type:String,converter:y,reflect:!1,useDefault:!1,hasChanged:w};Symbol.metadata??=Symbol("metadata"),_.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=k){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),o=this.getPropertyDescriptor(e,i,t);void 0!==o&&d(this.prototype,e,o)}}static getPropertyDescriptor(e,t,i){const{get:o,set:n}=h(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:o,set(t){const s=o?.call(this);n?.call(this,t),this.requestUpdate(e,s,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??k}static _$Ei(){if(this.hasOwnProperty(v("elementProperties")))return;const e=g(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(v("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(v("properties"))){const e=this.properties,t=[...u(e),...p(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(l(e))}else void 0!==e&&t.push(l(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,o)=>{if(i)e.adoptedStyleSheets=o.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of o){const o=document.createElement("style"),n=t.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=i.cssText,e.appendChild(o)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),o=this.constructor._$Eu(e,i);if(void 0!==o&&!0===i.reflect){const n=(void 0!==i.converter?.toAttribute?i.converter:y).toAttribute(t,i.type);this._$Em=e,null==n?this.removeAttribute(o):this.setAttribute(o,n),this._$Em=null}}_$AK(e,t){const i=this.constructor,o=i._$Eh.get(e);if(void 0!==o&&this._$Em!==o){const e=i.getPropertyOptions(o),n="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:y;this._$Em=o;const s=n.fromAttribute(t,e.type);this[o]=s??this._$Ej?.get(o)??s,this._$Em=null}}requestUpdate(e,t,i,o=!1,n){if(void 0!==e){const s=this.constructor;if(!1===o&&(n=this[e]),i??=s.getPropertyOptions(e),!((i.hasChanged??w)(n,t)||i.useDefault&&i.reflect&&n===this._$Ej?.get(e)&&!this.hasAttribute(s._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:o,wrapped:n},s){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,s??t??this[e]),!0!==n||void 0!==s)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===o&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,o=this[t];!0!==e||this._$AL.has(t)||void 0===o||this.C(t,void 0,i,o)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[v("elementProperties")]=new Map,x[v("finalized")]=new Map,b?.({ReactiveElement:x}),(_.reactiveElementVersions??=[]).push("2.1.2");const $=globalThis,M=e=>e,P=$.trustedTypes,S=P?P.createPolicy("lit-html",{createHTML:e=>e}):void 0,I="$lit$",C=`lit$${Math.random().toFixed(9).slice(2)}$`,L="?"+C,T=`<${L}>`,F=document,E=()=>F.createComment(""),B=e=>null===e||"object"!=typeof e&&"function"!=typeof e,A=Array.isArray,O="[ \t\n\f\r]",R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,z=/-->/g,D=/>/g,H=RegExp(`>|${O}(?:([^\\s"'>=/]+)(${O}*=${O}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),W=/'/g,N=/"/g,U=/^(?:script|style|textarea|title)$/i,V=e=>(t,...i)=>({_$litType$:e,strings:t,values:i}),G=V(1),K=V(2),j=Symbol.for("lit-noChange"),q=Symbol.for("lit-nothing"),Y=new WeakMap,X=F.createTreeWalker(F,129);function Z(e,t){if(!A(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(t):t}const Q=(e,t)=>{const i=e.length-1,o=[];let n,s=2===t?"<svg>":3===t?"<math>":"",r=R;for(let t=0;t<i;t++){const i=e[t];let a,l,c=-1,d=0;for(;d<i.length&&(r.lastIndex=d,l=r.exec(i),null!==l);)d=r.lastIndex,r===R?"!--"===l[1]?r=z:void 0!==l[1]?r=D:void 0!==l[2]?(U.test(l[2])&&(n=RegExp("</"+l[2],"g")),r=H):void 0!==l[3]&&(r=H):r===H?">"===l[0]?(r=n??R,c=-1):void 0===l[1]?c=-2:(c=r.lastIndex-l[2].length,a=l[1],r=void 0===l[3]?H:'"'===l[3]?N:W):r===N||r===W?r=H:r===z||r===D?r=R:(r=H,n=void 0);const h=r===H&&e[t+1].startsWith("/>")?" ":"";s+=r===R?i+T:c>=0?(o.push(a),i.slice(0,c)+I+i.slice(c)+C+h):i+C+(-2===c?t:h)}return[Z(e,s+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),o]};class J{constructor({strings:e,_$litType$:t},i){let o;this.parts=[];let n=0,s=0;const r=e.length-1,a=this.parts,[l,c]=Q(e,t);if(this.el=J.createElement(l,i),X.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(o=X.nextNode())&&a.length<r;){if(1===o.nodeType){if(o.hasAttributes())for(const e of o.getAttributeNames())if(e.endsWith(I)){const t=c[s++],i=o.getAttribute(e).split(C),r=/([.?@])?(.*)/.exec(t);a.push({type:1,index:n,name:r[2],strings:i,ctor:"."===r[1]?ne:"?"===r[1]?se:"@"===r[1]?re:oe}),o.removeAttribute(e)}else e.startsWith(C)&&(a.push({type:6,index:n}),o.removeAttribute(e));if(U.test(o.tagName)){const e=o.textContent.split(C),t=e.length-1;if(t>0){o.textContent=P?P.emptyScript:"";for(let i=0;i<t;i++)o.append(e[i],E()),X.nextNode(),a.push({type:2,index:++n});o.append(e[t],E())}}}else if(8===o.nodeType)if(o.data===L)a.push({type:2,index:n});else{let e=-1;for(;-1!==(e=o.data.indexOf(C,e+1));)a.push({type:7,index:n}),e+=C.length-1}n++}}static createElement(e,t){const i=F.createElement("template");return i.innerHTML=e,i}}function ee(e,t,i=e,o){if(t===j)return t;let n=void 0!==o?i._$Co?.[o]:i._$Cl;const s=B(t)?void 0:t._$litDirective$;return n?.constructor!==s&&(n?._$AO?.(!1),void 0===s?n=void 0:(n=new s(e),n._$AT(e,i,o)),void 0!==o?(i._$Co??=[])[o]=n:i._$Cl=n),void 0!==n&&(t=ee(e,n._$AS(e,t.values),n,o)),t}class te{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,o=(e?.creationScope??F).importNode(t,!0);X.currentNode=o;let n=X.nextNode(),s=0,r=0,a=i[0];for(;void 0!==a;){if(s===a.index){let t;2===a.type?t=new ie(n,n.nextSibling,this,e):1===a.type?t=new a.ctor(n,a.name,a.strings,this,e):6===a.type&&(t=new ae(n,this,e)),this._$AV.push(t),a=i[++r]}s!==a?.index&&(n=X.nextNode(),s++)}return X.currentNode=F,o}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class ie{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,o){this.type=2,this._$AH=q,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=ee(this,e,t),B(e)?e===q||null==e||""===e?(this._$AH!==q&&this._$AR(),this._$AH=q):e!==this._$AH&&e!==j&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>A(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==q&&B(this._$AH)?this._$AA.nextSibling.data=e:this.T(F.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,o="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=J.createElement(Z(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===o)this._$AH.p(t);else{const e=new te(o,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=Y.get(e.strings);return void 0===t&&Y.set(e.strings,t=new J(e)),t}k(e){A(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,o=0;for(const n of e)o===t.length?t.push(i=new ie(this.O(E()),this.O(E()),this,this.options)):i=t[o],i._$AI(n),o++;o<t.length&&(this._$AR(i&&i._$AB.nextSibling,o),t.length=o)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=M(e).nextSibling;M(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class oe{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,o,n){this.type=1,this._$AH=q,this._$AN=void 0,this.element=e,this.name=t,this._$AM=o,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=q}_$AI(e,t=this,i,o){const n=this.strings;let s=!1;if(void 0===n)e=ee(this,e,t,0),s=!B(e)||e!==this._$AH&&e!==j,s&&(this._$AH=e);else{const o=e;let r,a;for(e=n[0],r=0;r<n.length-1;r++)a=ee(this,o[i+r],t,r),a===j&&(a=this._$AH[r]),s||=!B(a)||a!==this._$AH[r],a===q?e=q:e!==q&&(e+=(a??"")+n[r+1]),this._$AH[r]=a}s&&!o&&this.j(e)}j(e){e===q?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class ne extends oe{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===q?void 0:e}}class se extends oe{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==q)}}class re extends oe{constructor(e,t,i,o,n){super(e,t,i,o,n),this.type=5}_$AI(e,t=this){if((e=ee(this,e,t,0)??q)===j)return;const i=this._$AH,o=e===q&&i!==q||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,n=e!==q&&(i===q||o);o&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class ae{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){ee(this,e)}}const le=$.litHtmlPolyfillSupport;le?.(J,ie),($.litHtmlVersions??=[]).push("3.3.3");const ce=globalThis;class de extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const o=i?.renderBefore??t;let n=o._$litPart$;if(void 0===n){const e=i?.renderBefore??null;o._$litPart$=n=new ie(t.insertBefore(E(),e),e,void 0,i??{})}return n._$AI(e),n})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return j}}de._$litElement$=!0,de.finalized=!0,ce.litElementHydrateSupport?.({LitElement:de});const he=ce.litElementPolyfillSupport;he?.({LitElement:de}),(ce.litElementVersions??=[]).push("4.2.2");const ue={attribute:!0,type:String,converter:y,reflect:!1,hasChanged:w},pe=(e=ue,t,i)=>{const{kind:o,metadata:n}=i;let s=globalThis.litPropertyMetadata.get(n);if(void 0===s&&globalThis.litPropertyMetadata.set(n,s=new Map),"setter"===o&&((e=Object.create(e)).wrapped=!0),s.set(i.name,e),"accessor"===o){const{name:o}=i;return{set(i){const n=t.get.call(this);t.set.call(this,i),this.requestUpdate(o,n,e,!0,i)},init(t){return void 0!==t&&this.C(o,void 0,e,t),t}}}if("setter"===o){const{name:o}=i;return function(i){const n=this[o];t.call(this,i),this.requestUpdate(o,n,e,!0,i)}}throw Error("Unsupported decorator location: "+o)};function ge(e){return(t,i)=>"object"==typeof i?pe(e,t,i):((e,t,i)=>{const o=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),o?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}function _e(e){return ge({...e,state:!0,attribute:!1})}function me(e,t){return(t,i,o)=>((e,t,i)=>(i.configurable=!0,i.enumerable=!0,Reflect.decorate&&"object"!=typeof t&&Object.defineProperty(e,t,i),i))(t,i,{get(){return(t=>t.renderRoot?.querySelector(e)??null)(this)}})}const fe=e=>(t,i)=>{const o=()=>{customElements.get(e)?console.info(`spatial-context: <${e}> already defined — reload the page to pick up the updated panel.`):customElements.define(e,t)};void 0!==i?i.addInitializer(o):o()},be="__property__";function ve(e){switch(e){case"strong":return"#2e7d32";case"medium":return"#f9a825";case"weak":return"#c62828";default:return"#607d8b"}}function ye(e){return e>=-70?"strong":e>=-85?"medium":"weak"}const we=["light","switch","climate","media_player","lock","cover","fan","vacuum","alarm_control_panel","valve","humidifier","siren","water_heater","camera","assist_satellite","device_tracker","binary_sensor","sensor"];function ke(e,t){if(!e)return null;const i=[...t].filter(t=>t.device_id===e);if(0===i.length)return null;const o=e=>"config"===e.entity_category?2:e.entity_category?1:0,n=e=>{const t=we.indexOf(e.domain);return-1===t?we.length:t};return i.sort((e,t)=>o(e)-o(t)||n(e)-n(t)),i[0]}function xe(e,t){return ke(e,t)?.device_name??"Unknown device"}class $e{constructor(e=100,t=400){this._limit=e,this._coalesceMs=t,this._past=[],this._future=[],this._lastRecordAt=Number.NEGATIVE_INFINITY}get canUndo(){return this._past.length>0}get canRedo(){return this._future.length>0}record(e,t=Date.now()){t-this._lastRecordAt>this._coalesceMs&&(this._past.push(e),this._past.length>this._limit&&this._past.shift()),this._lastRecordAt=t,this._future=[]}undo(e){const t=this._past.pop();return void 0===t?null:(this._future.push(e),this._lastRecordAt=Number.NEGATIVE_INFINITY,t)}redo(e){const t=this._future.pop();return void 0===t?null:(this._past.push(e),this._lastRecordAt=Number.NEGATIVE_INFINITY,t)}discardIfLast(e){this._past[this._past.length-1]===e&&(this._past.pop(),this._lastRecordAt=Number.NEGATIVE_INFINITY)}clear(){this._past=[],this._future=[],this._lastRecordAt=Number.NEGATIVE_INFINITY}}const Me=new class{constructor(){this._client=null,this._enabled=!1,this._buffer=[],this._timer=null,this._errorHooked=!1}configure(e,t){this._client=e,this._enabled=t,t?this._hookErrors():this._buffer=[]}log(e,t={}){this._enabled&&(this._buffer.push({event:e,t:(new Date).toISOString(),...t}),this._buffer.length>200&&this._buffer.shift(),this._timer??(this._timer=window.setTimeout(()=>{this.flush()},2e3)))}async flush(){if(this._timer=null,!this._client||0===this._buffer.length)return;const e=this._buffer;this._buffer=[];try{await this._client.sendDebugLog(e)}catch{}}_hookErrors(){if(this._errorHooked)return;this._errorHooked=!0;const e=e=>!!e&&/spatial[-_]context/.test(e);window.addEventListener("error",t=>{const i=t.error?.stack;(e(i)||e(t.filename))&&this.log("js_error",{message:t.message,stack:i})}),window.addEventListener("unhandledrejection",t=>{const i=t.reason;e(i?.stack)&&this.log("js_rejection",{message:i?.message,stack:i?.stack})})}};function Pe(e,t,i){const o=e.source_bounds;if(!o||o.max_x<=o.min_x||o.max_y<=o.min_y||e.width<=0||e.height<=0)return null;const n=e.rotation_deg*Math.PI/180,s=Math.cos(n),r=Math.sin(n),a=t-e.x,l=i-e.y,c=-r*a+s*l;return{x:((s*a+r*l)/e.width+.5)*(o.max_x-o.min_x)+o.min_x,y:(c/e.height+.5)*(o.max_y-o.min_y)+o.min_y}}const Se={en:{floorTabs:{property:"Property"},appHeader:{saving:"Saving…",save:"Save",menu:"Menu"},canvas:{mode:{select:"Select",pan:"Pan",trace:"Trace Room",wall:"Trace Wall",door:"Add Door",window:"Add Window",scale:"Set Scale",place:"Place Device",align:"Align Floors",furniture:"Furniture & household items"},snap:{tooltip:"What new points snap onto (hold Shift to place one point freely)",all:"Snap: all",walls:"Snap: walls only",rooms:"Snap: rooms only",off:"Snap: off"},hint:{closeRoom:"Click near the start to close the room.",addPoints:"Click to add points.",addWallPoints:"Click to add points.",addWallPointsFinish:"Click to add points, then Finish.",scaleFirst:"Click the first point of a known distance.",scaleSecond:"Click the second point.",placeOpening:"Click on a wall to place a {type}.",alignAgainst:"Align against:",noBackground:"That floor has no background image to align against.",alignDrag:"Drag to move, use +/− to resize, then Apply.",placeFurniture:"Click to place · R rotates · Shift+click places another"},openingType:{door:"door",window:"window",opening:"opening"},openingLabel:{door:"door",window:"window"},button:{cancel:"Cancel",finishWall:"Finish Wall",chooseAnother:"Choose another",apply:"Apply",close:"Close",done:"Done"},align:{choose:"— Choose a floor —",shrink:"Shrink overlay slightly",grow:"Grow overlay slightly"},room:{custom:"— Custom —",outdoor:"Outdoor / no floor",hide:"Hide room",show:"Show room",color:"Room color",fillOpacity:"Fill opacity",borderOpacity:"Border opacity",rename:"Rename",doneEditing:"Done editing",editVertices:"Edit vertices",resetLabel:"Reset label position",delete:"Delete room"},pin:{setLabel:"Set label",setIcon:"Set icon",setHeight:"Set height",delete:"Delete pin",removeFromSpot:"Remove from this spot",stackTitle:"{count} devices at this spot"},wall:{material:"Wall material",thickness:"Wall thickness ({unit})",delete:"Delete wall"},opening:{width:"Width ({unit})",storedUnits:"stored units",calibrate:"Calibrate Scale for real units",delete:"Delete",cover:"Cover",noCover:"None",coverState:"Right now",coverOpen:"{pct}% open",coverUnavailable:"Unavailable"},meshStub:{goToFloor:"Go to floor"},notCalibrated:"Not calibrated",card:{room:"Room",device:"Device",wall:"Wall",wallOpening:"In a wall",link:"Link",quality:"Signal",area:"Area",style:"Style",visible:"Visible",name:"Name",label:"Label",height:"Height ({unit})",colour:"Colour",colourDefault:"Default",colourCustom:"Custom",links:"{count} links",noLinks:"No links to other placed devices",hide:"Hide details",show:"Show details",furniture:"Furniture"},calibrateHint:"Click to set the scale",lights:{title:"Lights",count:"{on} of {total} lights on",none:"No lights in this room's area",on:"All on",off:"All off"},links:{add:"Add…",remove:"Remove",areas:"Also show areas",rooms:"Also show rooms",lights:"Also show lights"}},mapBackground:{noWebgl:"This browser can't draw the map (WebGL2 is needed).",failed:"Couldn't load the map: {error}",add:"Add map background",remove:"Remove map background",opacity:"Map opacity",adjust:"Move map (drag; Ctrl+scroll or pinch to zoom)",adjustHint:"Drag the map to line it up with your buildings.",zoomIn:"Zoom map in",zoomOut:"Zoom map out",rotation:"Rotation",resetRotation:"North up",done:"Done",style:"Map type",street:"Street map",aerial:"Aerial photo (Esri)",zoom:"Zoom",angle:"Angle"},settings:{title:"Settings",close:"Close",done:"Done",editing:"Editing",autoSave:"Auto-save changes",autoSaveHint:"Saves a few seconds after each change",units:"Units",metric:"Metric",imperial:"Imperial",floorOrder:"Floor tab order",topFirst:"Top first",groundFirst:"Ground first",zigbeeMesh:"Zigbee mesh",coordinator:"Coordinator",coordinatorAria:"Zigbee coordinator device",bridge:"Zigbee2MQTT Bridge",notPlaced:"(device not placed)",coordinatorHint:"The device placed for your radio, if it isn't the Bridge",scanTimeout:"Scan timeout",scanTimeoutAria:"Zigbee scan timeout in seconds",scanTimeoutHint:"Raise it if Load Mesh times out on a large mesh",troubleshooting:"Troubleshooting",debugLogging:"Debug logging",debugLoggingHint:"Writes spatial_context_debug.log in your config folder — ids and counts only",about:"About",version:"Version",github:"GitHub repository"},picker:{search:"Search devices…",clearSearch:"Clear search",more:"More",allFloors:"All Floors",outdoor:"Outdoor / no floor",allAreas:"All Areas",clearAll:"Clear all placed devices",noMatches:"No matching devices.",alreadyPlaced:"Already placed on {floor} — remove it there first",placedOn:"Placed on {floor}",placed:"✓ placed",title:"Place device"},iconPicker:{title:"Choose an icon",search:"Search icons — e.g. lamp, motion, gate",loadError:"Couldn't load the icon list ({error}).",loading:"Loading icons…",noMatch:"No icons match.",typeToSearch:"Type to search all icons.",useDefault:"Use default icon",cancel:"Cancel"},legend:{weak:"Weak",strong:"Strong"},rowActions:{undo:"Undo (Ctrl/Cmd+Z)",redo:"Redo (Ctrl/Cmd+Shift+Z)"},panel:{loading:"Loading Spatial Context…",noFloors:"No floors found. Add floors under Settings → Areas → Floors, then reopen this panel.",dismiss:"Dismiss",versionRestart:"Spatial Context was updated — restart Home Assistant to finish. Until then, some changes may not save.",versionReload:"This page is running an older Spatial Context panel than the one installed. Reload the page (in Safari: Option+Cmd+R).",scaleDisagree:"Placed buildings give different scales. Check their sizes against the photo.",scaleFromBuilding:"Scale (from {building}): 1 {unit} ≈ {value} units"},menu:{background:"Background",connectivity:"Connectivity Map",settings:"Settings",more:"More options",uploadBackground:"Upload background",replaceBackground:"Replace background (keeps rooms)",removeBackground:"Remove background",opacity:"Opacity",exportJson:"Export JSON",debugReport:"Download debug report",debugReportHint:"Versions, settings, layout counts and the recent debug log — safe to attach to a GitHub issue",resetFloor:"Reset floor",resetProperty:"Reset property",importSvg:"Import rooms & walls from SVG"},network:{zigbee:"Zigbee Mesh",wifi:"Wi-Fi Network",matter:"Matter Network",bluetooth:"Bluetooth",zigbeeShort:"Zigbee mesh",wifiShort:"Wi-Fi",matterShort:"Matter",refresh:"Refresh Mesh",load:"Load Mesh",loadingZigbee:"Loading… {seconds}s (usually 1-2 min)",showAll:"Show all links",live:"● Live",loading:"Loading…",refreshedSeconds:"refreshed {n}s ago",refreshedMinutes:"refreshed {n}m ago"},errors:{restartHa:"Restart Home Assistant to finish updating Spatial Context.",needsAdmin:"This map needs a Home Assistant admin account.",bluetoothVersion:"The Bluetooth map needs Home Assistant 2025.2 or newer.",zigbeeFailed:"Zigbee mesh request failed",wifiFailed:"Wi-Fi mesh request failed",matterFailed:"Matter topology subscription failed",bluetoothFailed:"Bluetooth subscription failed",floorSave:"Couldn't save this floor — staying here so nothing is lost.",propertySave:"Couldn't save the property view — reopen the Property tab to try again.",bgType:"Background image must be a PNG, JPEG, GIF or SVG file.",bgUpload:"Background image upload failed: {error}",svgImport:"Couldn't use that SVG: {error}"},confirm:{discardFloor:"Discard unsaved changes to this floor?",discardProperty:"Discard unsaved changes to the property view?",removeOutdoorOne:"Remove all {count} outdoor device from the property?",removeOutdoorMany:"Remove all {count} outdoor devices from the property?",removeFloorOne:"Remove all {count} placed device from this floor?",removeFloorMany:"Remove all {count} placed devices from this floor?",deletePlacement:'Delete the "{label}" placement?',resetProperty:"Reset the property view? This clears every building placement, every outdoor device and the background photo. Nothing is permanent until you hit Save afterward.",resetFloor:'Reset "{floor}"? This clears every room, wall, opening, placed device, and the background image on this floor. Nothing is permanent until you hit Save afterward.',applyAlignment:"Apply this alignment to \"{floor}\"? This rewrites every room, wall, door/window, and placed device position on that floor — plus its background image's placement and, if this floor has one set, its scale calibration too — to match this floor's coordinate system. This saves immediately and cannot be undone.",deleteWall:"Delete this wall? Any doors/windows on it will be removed too.",deleteRoom:'Delete room "{name}"?',deletePin:"Delete pin for {name}?",deleteDoor:"Delete this door?",deleteWindow:"Delete this window?",removeFromSpot:"Remove {name} from this spot?"},prompt:{label:"Label (blank to clear override):",distance:"Real-world distance between these two points, in {unit}:"},units:{feet:"feet",metres:"metres"},floor:{thisFloor:"this floor",thatFloor:"that floor"},property:{rename:"Rename",setIcon:"Set icon",removeFromProperty:"Remove from the property",goToFloorOf:"Go to {name}'s floor",select:"Select",placeOutdoor:"Place an outdoor device",placeBuildingTip:"Place a building's footprint",placeBuilding:"Place building…",notCalibrated:"Not calibrated",goToFloor:"Go to floor",deletePlacement:"Delete placement",outdoorDevice:"Outdoor device",building:"Building",link:"Link",calibrateHint:"Set Scale on a floor, then place its building here"},canvasControls:{zoomIn:"Zoom in",zoomOut:"Zoom out",fit:"Fit to screen",furniture:"Show furniture",lights:"Show live lights",covers:"Show daylight & cover shading"},materials:{timber_frame:"Timber framed (drywall)",brick_veneer:"Brick veneer",concrete_block:"Concrete / block",aerated_concrete_block:"Aerated/foam concrete block (plastered)",ceramic_poroton_block:"Ceramic / Poroton block",glass:"Glass",steel_frame:"Steel frame"},colors:{primary:"Primary",accent:"Accent",red:"Red",pink:"Pink",purple:"Purple",deep_purple:"Deep purple",indigo:"Indigo",blue:"Blue",light_blue:"Light blue",cyan:"Cyan",teal:"Teal",green:"Green",light_green:"Light green",lime:"Lime",yellow:"Yellow",amber:"Amber",orange:"Orange",deep_orange:"Deep orange",brown:"Brown",light_grey:"Light grey",grey:"Grey",dark_grey:"Dark grey",blue_grey:"Blue grey",black:"Black",white:"White"},svgImport:{confirm:"This SVG has {rooms} rooms, {walls} walls and {openings} doors/windows. Add them to this floor as well, so there's nothing to trace?",unitPrompt:"How long is one unit of the SVG's drawing, in {unit}? (1 if it was drawn in {unit}.) Leave blank to calibrate the floor yourself later.",skipped:"{count} doors/windows weren't along any wall in the SVG, so they were left out.",nothingFound:"No rooms, walls, doors or windows were found in that SVG. Name its groups rooms, walls, doors and windows (see the README).",alsoBackground:"Also replace this floor's background with the SVG? (Cancel keeps the current background and only adds the geometry.)"},furniture:{libraryTitle:"Furniture & items",close:"Close",search:"Search items",count:"{count} items",none:"No matching items",showLabel:"Show name",width:"Width ({unit})",depth:"Depth",calibrate:"Set this floor's scale (Set Scale) for true-to-life sizes.",rotation:"Rotation (°)",rotateLeft:"Rotate 90° left",rotateRight:"Rotate 90° right",lineThickness:"Line thickness ({px} px)",fill:"Fill",mirror:"Mirror",lock:"Lock in place",duplicate:"Duplicate (Ctrl+D)",toFront:"Bring to front",toBack:"Send to back",delete:"Delete item",category:{all:"All",living:"Living room",bedroom:"Bedroom",kitchen:"Kitchen",dining:"Dining",bathroom:"Bathroom",office:"Office",laundry:"Laundry & utility",electronics:"Electronics & smart home",lighting:"Lighting",kids:"Kids & nursery",entry:"Entry & storage",outdoor:"Outdoor & garden",garage:"Garage & workshop",fitness:"Fitness & hobbies",pets:"Pets",decor:"Decor & plants"},entityTitle:"Linked entity",entity:"Entity",noEntity:"None",toggle:"Toggle"},compass:{title:"North is {dir} of the plan's top",faces:"Top of plan faces",notSet:"Not set",degrees:"Degrees clockwise from north",noLocation:"Set your home location in Home Assistant (Settings → System → General) for daylight that follows the sun.",preview:"Daylight at {time}",now:"Now",sun:"Sun {deg}° up in the {dir}",night:"Sun down"}},de:{floorTabs:{property:"Anwesen"},appHeader:{saving:"Speichert…",save:"Speichern",menu:"Menü"},canvas:{mode:{select:"Auswählen",pan:"Verschieben",trace:"Raum zeichnen",wall:"Wand zeichnen",door:"Tür hinzufügen",window:"Fenster hinzufügen",scale:"Maßstab festlegen",place:"Gerät platzieren",align:"Etagen ausrichten",furniture:"Möbel & Haushaltsgegenstände"},snap:{tooltip:"Woran neue Punkte einrasten (Umschalttaste halten, um einen Punkt frei zu setzen)",all:"Einrasten: alles",walls:"Einrasten: nur Wände",rooms:"Einrasten: nur Räume",off:"Einrasten: aus"},hint:{closeRoom:"Nahe dem Start klicken, um den Raum zu schließen.",addPoints:"Klicken, um Punkte hinzuzufügen.",addWallPoints:"Klicken, um Punkte hinzuzufügen.",addWallPointsFinish:"Klicken, um Punkte hinzuzufügen, dann „Fertig“.",scaleFirst:"Den ersten Punkt einer bekannten Strecke anklicken.",scaleSecond:"Den zweiten Punkt anklicken.",placeOpening:"Auf eine Wand klicken, um {type} zu platzieren.",alignAgainst:"Ausrichten an:",noBackground:"Diese Etage hat kein Hintergrundbild zum Ausrichten.",alignDrag:"Zum Verschieben ziehen, mit +/− die Größe ändern, dann „Anwenden“.",placeFurniture:"Klicken zum Platzieren · R dreht · Umschalt+Klick platziert noch eins"},openingType:{door:"eine Tür",window:"ein Fenster",opening:"eine Öffnung"},openingLabel:{door:"Tür",window:"Fenster"},button:{cancel:"Abbrechen",finishWall:"Wand fertigstellen",chooseAnother:"Andere wählen",apply:"Anwenden",close:"Schließen",done:"Fertig"},align:{choose:"— Etage wählen —",shrink:"Überlagerung leicht verkleinern",grow:"Überlagerung leicht vergrößern"},room:{custom:"— Benutzerdefiniert —",outdoor:"Außenbereich / keine Etage",hide:"Raum ausblenden",show:"Raum einblenden",color:"Raumfarbe",fillOpacity:"Füllungsdeckkraft",borderOpacity:"Randdeckkraft",rename:"Umbenennen",doneEditing:"Bearbeitung beenden",editVertices:"Eckpunkte bearbeiten",resetLabel:"Beschriftungsposition zurücksetzen",delete:"Raum löschen"},pin:{setLabel:"Beschriftung festlegen",setIcon:"Symbol festlegen",setHeight:"Höhe festlegen",delete:"Pin löschen",removeFromSpot:"Von dieser Stelle entfernen",stackTitle:"{count} Geräte an dieser Stelle"},wall:{material:"Wandmaterial",thickness:"Wandstärke ({unit})",delete:"Wand löschen"},opening:{width:"Breite ({unit})",storedUnits:"gespeicherte Einheiten",calibrate:"Maßstab kalibrieren für reale Einheiten",delete:"Löschen",cover:"Beschattung",noCover:"Keine",coverState:"Gerade",coverOpen:"{pct}% offen",coverUnavailable:"Nicht verfügbar"},meshStub:{goToFloor:"Zur Etage"},notCalibrated:"Nicht kalibriert",card:{area:"Bereich",colour:"Farbe",colourCustom:"Benutzerdefiniert",colourDefault:"Standard",device:"Gerät",height:"Höhe ({unit})",label:"Bezeichnung",link:"Verbindung",links:"{count} Verbindungen",name:"Name",noLinks:"Keine Verbindungen zu anderen platzierten Geräten",quality:"Signal",room:"Raum",style:"Darstellung",visible:"Sichtbar",wall:"Wand",wallOpening:"In einer Wand",hide:"Details ausblenden",show:"Details anzeigen",furniture:"Möbel"},calibrateHint:"Klicken, um den Maßstab festzulegen",lights:{title:"Licht",count:"{on} von {total} Lichtern an",none:"Keine Lichter im Bereich dieses Raums",on:"Alle an",off:"Alle aus"},links:{add:"Hinzufügen…",remove:"Entfernen",areas:"Auch Bereiche zeigen",rooms:"Auch Räume zeigen",lights:"Auch Lichter zeigen"}},mapBackground:{noWebgl:"Dieser Browser kann die Karte nicht darstellen (WebGL2 erforderlich).",failed:"Karte konnte nicht geladen werden: {error}",add:"Kartenhintergrund hinzufügen",remove:"Kartenhintergrund entfernen",opacity:"Kartendeckkraft",adjust:"Karte verschieben (ziehen; Strg+Scrollen oder Pinch zum Zoomen)",adjustHint:"Karte ziehen, um sie an den Gebäuden auszurichten.",zoomIn:"Karte vergrößern",zoomOut:"Karte verkleinern",rotation:"Drehung",resetRotation:"Norden oben",done:"Fertig",style:"Kartentyp",street:"Straßenkarte",aerial:"Luftbild (Esri)",zoom:"Zoom",angle:"Winkel"},settings:{title:"Einstellungen",close:"Schließen",done:"Fertig",editing:"Bearbeiten",autoSave:"Änderungen automatisch speichern",autoSaveHint:"Speichert einige Sekunden nach jeder Änderung",units:"Einheiten",metric:"Metrisch",imperial:"Imperial",floorOrder:"Reihenfolge der Etagen-Tabs",topFirst:"Oberste zuerst",groundFirst:"Erdgeschoss zuerst",zigbeeMesh:"Zigbee-Mesh",coordinator:"Koordinator",coordinatorAria:"Zigbee-Koordinator-Gerät",bridge:"Zigbee2MQTT-Bridge",notPlaced:"(Gerät nicht platziert)",coordinatorHint:"Das für Ihren Funk-Stick platzierte Gerät, falls es nicht die Bridge ist",scanTimeout:"Zeitlimit für den Scan",scanTimeoutAria:"Zeitlimit für den Zigbee-Scan in Sekunden",scanTimeoutHint:"Erhöhen, wenn „Mesh laden“ bei einem großen Mesh abbricht",troubleshooting:"Fehlerbehebung",debugLogging:"Debug-Protokollierung",debugLoggingHint:"Schreibt spatial_context_debug.log in Ihren Konfigurationsordner – nur IDs und Anzahlen",about:"Info",version:"Version",github:"GitHub-Repository"},picker:{search:"Geräte suchen…",clearSearch:"Suche löschen",more:"Mehr",allFloors:"Alle Etagen",outdoor:"Außen / keine Etage",allAreas:"Alle Bereiche",clearAll:"Alle platzierten Geräte entfernen",noMatches:"Keine passenden Geräte.",alreadyPlaced:"Bereits auf {floor} platziert – dort zuerst entfernen",placedOn:"Platziert auf {floor}",placed:"✓ platziert",title:"Gerät platzieren"},iconPicker:{title:"Symbol auswählen",search:"Symbole suchen – z. B. Lampe, Bewegung, Tor",loadError:"Die Symbolliste konnte nicht geladen werden ({error}).",loading:"Symbole werden geladen…",noMatch:"Keine passenden Symbole.",typeToSearch:"Tippen, um alle Symbole zu durchsuchen.",useDefault:"Standardsymbol verwenden",cancel:"Abbrechen"},legend:{weak:"Schwach",strong:"Stark"},rowActions:{undo:"Rückgängig (Strg/Cmd+Z)",redo:"Wiederholen (Strg/Cmd+Umschalt+Z)"},panel:{loading:"Spatial Context wird geladen…",noFloors:"Keine Etagen gefunden. Fügen Sie Etagen unter Einstellungen → Bereiche → Etagen hinzu und öffnen Sie dieses Panel erneut.",dismiss:"Schließen",versionRestart:"Spatial Context wurde aktualisiert – starten Sie Home Assistant neu, um den Vorgang abzuschließen. Bis dahin werden manche Änderungen möglicherweise nicht gespeichert.",versionReload:"Diese Seite verwendet ein älteres Spatial-Context-Panel als das installierte. Laden Sie die Seite neu (in Safari: Option+Cmd+R).",scaleDisagree:"Die platzierten Gebäude ergeben unterschiedliche Maßstäbe. Prüfen Sie ihre Größen anhand des Fotos.",scaleFromBuilding:"Maßstab (von {building}): 1 {unit} ≈ {value} Einheiten"},menu:{background:"Hintergrund",connectivity:"Verbindungskarte",settings:"Einstellungen",more:"Weitere Optionen",uploadBackground:"Hintergrund hochladen",replaceBackground:"Hintergrund ersetzen (Räume bleiben)",removeBackground:"Hintergrund entfernen",opacity:"Deckkraft",exportJson:"JSON exportieren",debugReport:"Debug-Bericht herunterladen",debugReportHint:"Versionen, Einstellungen, Layout-Anzahlen und das aktuelle Debug-Protokoll – sicher an ein GitHub-Issue anzuhängen",resetFloor:"Etage zurücksetzen",resetProperty:"Anwesen zurücksetzen",importSvg:"Räume & Wände aus SVG importieren"},network:{zigbee:"Zigbee-Mesh",wifi:"WLAN-Netzwerk",matter:"Matter-Netzwerk",bluetooth:"Bluetooth",zigbeeShort:"Zigbee-Mesh",wifiShort:"WLAN",matterShort:"Matter",refresh:"Mesh aktualisieren",load:"Mesh laden",loadingZigbee:"Wird geladen… {seconds} s (dauert meist 1–2 Min.)",showAll:"Alle Verbindungen anzeigen",live:"● Live",loading:"Wird geladen…",refreshedSeconds:"vor {n} s aktualisiert",refreshedMinutes:"vor {n} Min. aktualisiert"},errors:{restartHa:"Starten Sie Home Assistant neu, um die Aktualisierung von Spatial Context abzuschließen.",needsAdmin:"Diese Karte benötigt ein Home-Assistant-Administratorkonto.",bluetoothVersion:"Die Bluetooth-Karte benötigt Home Assistant 2025.2 oder neuer.",zigbeeFailed:"Zigbee-Mesh-Anfrage fehlgeschlagen",wifiFailed:"WLAN-Mesh-Anfrage fehlgeschlagen",matterFailed:"Matter-Topologie-Abonnement fehlgeschlagen",bluetoothFailed:"Bluetooth-Abonnement fehlgeschlagen",floorSave:"Diese Etage konnte nicht gespeichert werden – Sie bleiben hier, damit nichts verloren geht.",propertySave:"Die Anwesen-Ansicht konnte nicht gespeichert werden – öffnen Sie den Tab „Anwesen“ erneut.",bgType:"Das Hintergrundbild muss eine PNG-, JPEG-, GIF- oder SVG-Datei sein.",bgUpload:"Hochladen des Hintergrundbilds fehlgeschlagen: {error}",svgImport:"Diese SVG-Datei konnte nicht verwendet werden: {error}"},confirm:{discardFloor:"Nicht gespeicherte Änderungen an dieser Etage verwerfen?",discardProperty:"Nicht gespeicherte Änderungen an der Anwesen-Ansicht verwerfen?",removeOutdoorOne:"Das {count} Außengerät vom Anwesen entfernen?",removeOutdoorMany:"Alle {count} Außengeräte vom Anwesen entfernen?",removeFloorOne:"Das {count} platzierte Gerät von dieser Etage entfernen?",removeFloorMany:"Alle {count} platzierten Geräte von dieser Etage entfernen?",deletePlacement:"Die Platzierung „{label}“ löschen?",resetProperty:"Anwesen-Ansicht zurücksetzen? Dadurch werden alle Gebäudeplatzierungen, alle Außengeräte und das Hintergrundfoto entfernt. Nichts ist endgültig, bis Sie anschließend auf Speichern klicken.",resetFloor:"„{floor}“ zurücksetzen? Dadurch werden alle Räume, Wände, Öffnungen, platzierten Geräte und das Hintergrundbild dieser Etage entfernt. Nichts ist endgültig, bis Sie anschließend auf Speichern klicken.",applyAlignment:"Diese Ausrichtung auf „{floor}“ anwenden? Dadurch werden alle Räume, Wände, Türen/Fenster und Gerätepositionen dieser Etage – sowie die Platzierung ihres Hintergrundbilds und, falls gesetzt, ihre Maßstabskalibrierung – an das Koordinatensystem dieser Etage angepasst. Dies wird sofort gespeichert und kann nicht rückgängig gemacht werden.",deleteWall:"Diese Wand löschen? Türen/Fenster darin werden ebenfalls entfernt.",deleteRoom:"Raum „{name}“ löschen?",deletePin:"Markierung für {name} löschen?",deleteDoor:"Diese Tür löschen?",deleteWindow:"Dieses Fenster löschen?",removeFromSpot:"{name} von dieser Stelle entfernen?"},prompt:{label:"Bezeichnung (leer lassen, um zurückzusetzen):",distance:"Tatsächlicher Abstand zwischen diesen beiden Punkten in {unit}:"},units:{feet:"Fuß",metres:"Metern"},floor:{thisFloor:"diese Etage",thatFloor:"jene Etage"},property:{rename:"Umbenennen",setIcon:"Symbol festlegen",removeFromProperty:"Vom Anwesen entfernen",goToFloorOf:"Zur Etage von {name}",select:"Auswählen",placeOutdoor:"Außengerät platzieren",placeBuildingTip:"Grundriss eines Gebäudes platzieren",placeBuilding:"Gebäude platzieren…",notCalibrated:"Nicht kalibriert",goToFloor:"Zur Etage",deletePlacement:"Platzierung löschen",outdoorDevice:"Außengerät",building:"Gebäude",link:"Verbindung",calibrateHint:"Legen Sie auf einer Etage den Maßstab fest und platzieren Sie dann das Gebäude hier"},canvasControls:{zoomIn:"Vergrößern",zoomOut:"Verkleinern",fit:"An Bildschirm anpassen",furniture:"Möbel zeigen",lights:"Live-Licht zeigen",covers:"Tageslicht & Beschattung zeigen"},materials:{timber_frame:"Holzständerwand (Trockenbau)",brick_veneer:"Ziegelverblendung",concrete_block:"Beton / Stein",aerated_concrete_block:"Porenbeton / Schaumbeton (verputzt)",ceramic_poroton_block:"Keramik- / Poroton-Stein",glass:"Glas",steel_frame:"Stahlrahmen"},colors:{primary:"Primär",accent:"Akzent",red:"Rot",pink:"Pink",purple:"Lila",deep_purple:"Dunkellila",indigo:"Indigo",blue:"Blau",light_blue:"Hellblau",cyan:"Cyan",teal:"Petrol",green:"Grün",light_green:"Hellgrün",lime:"Limette",yellow:"Gelb",amber:"Bernstein",orange:"Orange",deep_orange:"Dunkelorange",brown:"Braun",light_grey:"Hellgrau",grey:"Grau",dark_grey:"Dunkelgrau",blue_grey:"Blaugrau",black:"Schwarz",white:"Weiß"},svgImport:{confirm:"Diese SVG-Datei enthält {rooms} Räume, {walls} Wände und {openings} Türen/Fenster. Auch diese zu diesem Stockwerk hinzufügen, damit nichts nachgezeichnet werden muss?",unitPrompt:"Wie lang ist eine Einheit der SVG-Zeichnung, in {unit}? (1, wenn sie in {unit} gezeichnet wurde.) Leer lassen, um das Stockwerk später selbst zu kalibrieren.",skipped:"{count} Türen/Fenster lagen in der SVG-Datei an keiner Wand und wurden ausgelassen.",nothingFound:"In dieser SVG-Datei wurden keine Räume, Wände, Türen oder Fenster gefunden. Benenne ihre Gruppen rooms, walls, doors und windows (siehe README).",alsoBackground:"Auch den Hintergrund dieses Stockwerks durch die SVG ersetzen? (Abbrechen behält den aktuellen Hintergrund und fügt nur die Geometrie hinzu.)"},furniture:{libraryTitle:"Möbel & Gegenstände",close:"Schließen",search:"Gegenstände suchen",count:"{count} Gegenstände",none:"Keine passenden Gegenstände",showLabel:"Namen zeigen",width:"Breite ({unit})",depth:"Tiefe",calibrate:"Maßstab dieses Stockwerks setzen (Maßstab festlegen) für echte Größen.",rotation:"Drehung (°)",rotateLeft:"90° nach links drehen",rotateRight:"90° nach rechts drehen",lineThickness:"Linienstärke ({px} px)",fill:"Füllung",mirror:"Spiegeln",lock:"Fixieren",duplicate:"Duplizieren (Strg+D)",toFront:"In den Vordergrund",toBack:"In den Hintergrund",delete:"Gegenstand löschen",category:{all:"Alle",living:"Wohnzimmer",bedroom:"Schlafzimmer",kitchen:"Küche",dining:"Essbereich",bathroom:"Bad",office:"Büro",laundry:"Wäsche & Technik",electronics:"Elektronik & Smart Home",lighting:"Beleuchtung",kids:"Kinder & Baby",entry:"Flur & Stauraum",outdoor:"Garten & draußen",garage:"Garage & Werkstatt",fitness:"Fitness & Hobby",pets:"Haustiere",decor:"Deko & Pflanzen"},entityTitle:"Verknüpfte Entität",entity:"Entität",noEntity:"Keine",toggle:"Umschalten"},compass:{title:"Norden relativ zur Oberkante des Plans: {dir}",faces:"Oberkante des Plans zeigt nach",notSet:"Nicht gesetzt",degrees:"Grad im Uhrzeigersinn von Norden",noLocation:"Lege deinen Standort in Home Assistant fest (Einstellungen → System → Allgemein), damit das Tageslicht der Sonne folgt.",preview:"Tageslicht um {time}",now:"Jetzt",sun:"Sonne {deg}° hoch im {dir}",night:"Sonne untergegangen"}}};let Ie="en";function Ce(e,t){let i=e;for(const e of t.split(".")){if("object"!=typeof i||null===i)return;i=i[e]}return"string"==typeof i?i:void 0}function Le(e,t){let i=Ce(Se[Ie],e)??Ce(Se.en,e)??e;if(t)for(const[e,o]of Object.entries(t))i=i.split(`{${e}}`).join(String(o));return i}const Te=[{id:"timber_frame",label:"Timber framed (drywall)",color:"#212121",attenuationDbPerCm:.3,defaultThicknessCm:10},{id:"brick_veneer",label:"Brick veneer",color:"#3e2723",attenuationDbPerCm:.55,defaultThicknessCm:11},{id:"concrete_block",label:"Concrete / block",color:"#000000",attenuationDbPerCm:.6,defaultThicknessCm:20},{id:"aerated_concrete_block",label:"Aerated/foam concrete block (plastered)",color:"#757575",attenuationDbPerCm:.37,defaultThicknessCm:13},{id:"ceramic_poroton_block",label:"Ceramic / Poroton block",color:"#8d6e63",attenuationDbPerCm:.42,defaultThicknessCm:25},{id:"glass",label:"Glass",color:"#37474f",attenuationDbPerCm:2,defaultThicknessCm:1},{id:"steel_frame",label:"Steel frame",color:"#263238",attenuationDbPerCm:1,defaultThicknessCm:10}];function Fe(e){const t=`materials.${e.id}`,i=Le(t);return i===t?e.label:i}function Ee(e){return Te.find(t=>t.id===e)??Te[0]}function Be(e){return e.thickness_cm??Ee(e.material).defaultThicknessCm}class Ae{constructor(e){this.hass=e}async listFloors(){return(await this.hass.connection.sendMessagePromise({type:"spatial_context/list_floors"})).floors}async getLayout(e){const t=await this.hass.connection.sendMessagePromise({type:"spatial_context/get_layout",floor_id:e});return{...t,furniture:t.furniture??[],north_deg:t.north_deg??null}}async saveLayout(e,t){return this.hass.connection.sendMessagePromise({type:"spatial_context/save_layout",floor_id:e,background_image_id:t.background_image_id,background_opacity:t.background_opacity,background_offset_x:t.background_offset_x,background_offset_y:t.background_offset_y,background_scale:t.background_scale,building_id:t.building_id,view_box:t.view_box,rooms:t.rooms,pins:t.pins,walls:t.walls,openings:t.openings,furniture:t.furniture,north_deg:t.north_deg,scale:t.scale})}async setBuildingId(e,t){return this.hass.connection.sendMessagePromise({type:"spatial_context/set_building_id",floor_id:e,building_id:t})}async getPropertyLayout(){return this.hass.connection.sendMessagePromise({type:"spatial_context/get_property_layout"})}async savePropertyLayout(e){return this.hass.connection.sendMessagePromise({type:"spatial_context/save_property_layout",background_image_id:e.background_image_id,background_opacity:e.background_opacity,background_offset_x:e.background_offset_x,background_offset_y:e.background_offset_y,background_scale:e.background_scale,view_box:e.view_box,placements:e.placements,pins:e.pins,...void 0!==e.map_background?{map_background:e.map_background}:{}})}async getSettings(){return this.hass.connection.sendMessagePromise({type:"spatial_context/get_settings"})}async saveSettings(e){return this.hass.connection.sendMessagePromise({type:"spatial_context/save_settings",unit_system:e.unit_system,zigbee_timeout_seconds:e.zigbee_timeout_seconds,floor_order:e.floor_order,zigbee_coordinator_device_id:e.zigbee_coordinator_device_id,auto_save:e.auto_save,debug_logging:e.debug_logging})}async getVersionInfo(){return this.hass.connection.sendMessagePromise({type:"spatial_context/version"})}async sendDebugLog(e){await this.hass.connection.sendMessagePromise({type:"spatial_context/debug_log",entries:e})}async getDebugReport(){return this.hass.connection.sendMessagePromise({type:"spatial_context/debug_report"})}async listAreas(){return(await this.hass.connection.sendMessagePromise({type:"spatial_context/list_areas"})).areas}async listPlaceableEntities(){return(await this.hass.connection.sendMessagePromise({type:"spatial_context/list_placeable_entities"})).entities}async exportSnapshot(){return this.hass.connection.sendMessagePromise({type:"spatial_context/export_snapshot"})}async getZigbeeMesh(e=!1){return this.hass.connection.sendMessagePromise({type:"spatial_context/get_zigbee_mesh",force_refresh:e})}async getCachedZigbeeMesh(){return this.hass.connection.sendMessagePromise({type:"spatial_context/get_zigbee_mesh",cache_only:!0})}async getWifiMesh(){return this.hass.connection.sendMessagePromise({type:"spatial_context/get_wifi_mesh"})}async subscribeMatterTopology(e){return this.hass.connection.subscribeMessage(e,{type:"matter/subscribe_network_topology"})}async subscribeBluetoothAdvertisements(e){return this.hass.connection.subscribeMessage(e,{type:"bluetooth/subscribe_advertisements"})}async getBluetoothDevices(){return this.hass.connection.sendMessagePromise({type:"spatial_context/get_bluetooth_devices"})}async uploadBackgroundImage(e){const t=new FormData;t.append("file",e);const i=await this.hass.fetchWithAuth("/api/image/upload",{method:"POST",body:t});if(!i.ok)throw new Error(`Image upload failed: ${i.status} ${i.statusText}`);return(await i.json()).id}}function Oe(e){return e?`/api/image/serve/${e}/original`:null}function Re(e){return`${e}-${function(){if("undefined"!=typeof crypto&&crypto.randomUUID)return crypto.randomUUID();if("undefined"!=typeof crypto&&crypto.getRandomValues){const e=crypto.getRandomValues(new Uint8Array(16));e[6]=15&e[6]|64,e[8]=63&e[8]|128;const t=Array.from(e,e=>e.toString(16).padStart(2,"0")).join("");return`${t.slice(0,8)}-${t.slice(8,12)}-${t.slice(12,16)}-${t.slice(16,20)}-${t.slice(20)}`}return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,e=>{const t=16*Math.random()|0;return("x"===e?t:3&t|8).toString(16)})}()}`}function ze(e,t,i,o){return{id:Re("pin"),device_id:e,x:t,y:i,room_id:o,icon_override:null,label_override:null,height_m:null}}function De(e,t,i){return{id:Re("room"),name:e,area_id:i,points:t}}function He(e,t="timber_frame"){return{id:Re("wall"),material:t,thickness_cm:Ee(t).defaultThicknessCm,points:e}}function We(e,t,i,o,n){return{id:Re("opening"),wallId:e,type:t,x:i,y:o,width:n}}const Ne=220;class Ue{constructor(e=[],t=(e,t)=>e<t?-1:e>t?1:0){if(this.data=e,this.length=this.data.length,this.compare=t,this.length>0)for(let e=(this.length>>1)-1;e>=0;e--)this._down(e)}push(e){this.data.push(e),this._up(this.length++)}pop(){if(0===this.length)return;const e=this.data[0],t=this.data.pop();return--this.length>0&&(this.data[0]=t,this._down(0)),e}peek(){return this.data[0]}_up(e){const{data:t,compare:i}=this,o=t[e];for(;e>0;){const n=e-1>>1,s=t[n];if(i(o,s)>=0)break;t[e]=s,e=n}t[e]=o}_down(e){const{data:t,compare:i}=this,o=this.length>>1,n=t[e];for(;e<o;){let o=1+(e<<1);const s=o+1;if(s<this.length&&i(t[s],t[o])<0&&(o=s),i(t[o],n)>=0)break;t[e]=t[o],e=o}t[e]=n}}function Ve(e,t=1,i=!1){let o=1/0,n=1/0,s=-1/0,r=-1/0;for(const[t,i]of e[0])t<o&&(o=t),i<n&&(n=i),t>s&&(s=t),i>r&&(r=i);const a=s-o,l=r-n,c=Math.max(t,Math.min(a,l));if(c===t){const e=[o,n];return e.distance=0,e}let d=0;for(const t of e)d+=t.length;const h=new Float64Array(2*d),u=[];let p=0;for(const t of e){for(let e=0;e<t.length;e++)h[p++]=t[e][0],h[p++]=t[e][1];u.push(p)}const g=function(e,t){const i=64;let o=0,n=0;for(let e=0;e<t.length;e++)o+=Math.ceil((t[e]-n)/i),n=t[e];const s=new Float64Array(4*o);let r=0;n=0;for(let o=0;o<t.length;o++){const a=t[o];for(let t=n;t<a;t+=i,r+=4){const o=t+i<a?t+i:a,l=t===n?a-2:t-2;let c=e[l],d=e[l+1],h=c,u=d;for(let i=t;i<o;i+=2){const t=e[i],o=e[i+1];t<c?c=t:t>h&&(h=t),o<d?d=o:o>u&&(u=o)}s[r]=c,s[r+1]=d,s[r+2]=h,s[r+3]=u}n=a}return s}(h,u),_=new Ue([],(e,t)=>t.max-e.max);let m=function(e,t,i){let o=0,n=0,s=0;const r=t[0];for(let t=0,i=r-2;t<r;i=t,t+=2){const r=e[t],a=e[t+1],l=e[i],c=e[i+1],d=r*c-l*a;n+=(r+l)*d,s+=(a+c)*d,o+=3*d}const a=new Ge(n/o,s/o,0,e,t,i,-1/0,null);return 0===o||a.d<0?new Ge(e[0],e[1],0,e,t,i,-1/0,null):a}(h,u,g);const f=new Ge(o+a/2,n+l/2,0,h,u,g,-1/0,null);f.d>m.d&&(m=f);let b=2;function v(e,o,n,s){const r=m.d-Math.max(0,n*Math.SQRT2-t),a=new Ge(e,o,n,h,u,g,r,s);b++,a.max>m.d+t&&_.push(a),a.d>m.d&&(m=a,i&&console.log(`found best ${Math.round(1e4*a.d)/1e4} after ${b} probes`))}let y=c/2;for(let e=o;e<s;e+=c)for(let t=n;t<r;t+=c)v(e+y,t+y,y,null);for(;_.length;){const e=_.pop();if(e.max-m.d<=t)break;y=e.h/2,v(e.x-y,e.y-y,y,e),v(e.x+y,e.y-y,y,e),v(e.x-y,e.y+y,y,e),v(e.x+y,e.y+y,y,e)}i&&console.log(`num probes: ${b}\nbest distance: ${m.d}`);const w=[m.x,m.y];return w.distance=m.d,w}function Ge(e,t,i,o,n,s,r,a){this.x=e,this.y=t,this.h=i,this.nsx1=0,this.nsy1=0,this.nsx2=0,this.nsy2=0,this.d=function(e,t,i,o,n,s){const r=e.x,a=e.y;let l=!1,c=1/0;const d=n>0?n*n:-1;if(null!==s&&(e.nsx1=s.nsx1,e.nsy1=s.nsy1,e.nsx2=s.nsx2,e.nsy2=s.nsy2,c=Ke(r,a,s.nsx1,s.nsy1,s.nsx2,s.nsy2),c<=d))return n;const h=64,u=i.length;let p=0,g=0;for(let s=0;s<u;s++){const u=i[s];let _=t[u-2],m=t[u-1];for(let i=g;i<u;i+=h,p+=4){let s=i+h;s>u&&(s=u);const g=o[p],f=o[p+1],b=o[p+2],v=o[p+3],y=r<g?g-r:r>b?r-b:0,w=a<f?f-a:a>v?a-v:0,k=y*y+w*w>=c,x=a<f||a>=v||r>b;if(k&&x)_=t[s-2],m=t[s-1];else for(let o=i;o<s;o+=2){const i=t[o],s=t[o+1];if(!x&&s>a!=m>a&&r<(_-i)*(a-s)/(m-s)+i&&(l=!l),!k){const t=Ke(r,a,i,s,_,m);if(t<c&&(c=t,e.nsx1=i,e.nsy1=s,e.nsx2=_,e.nsy2=m,c<=d))return n}_=i,m=s}}g=u}return 0===c?0:(l?1:-1)*Math.sqrt(c)}(this,o,n,s,r,a),this.max=this.d+i*Math.SQRT2}function Ke(e,t,i,o,n,s){let r=n-i,a=s-o;if(0!==r||0!==a){const l=((e-i)*r+(t-o)*a)/(r*r+a*a);l>1?(i=n,o=s):l>0&&(i+=r*l,o+=a*l)}return r=e-i,a=t-o,r*r+a*a}function je(e,t,i,o){return Math.hypot(i-e,o-t)}function qe(e,t,i){return Math.min(i,Math.max(t,e))}function Ye(e,t,i){let o=!1;for(let n=0,s=i.length-1;n<i.length;s=n++){const r=i[n],a=i[s],[l,c]=r,[d,h]=a;c>t!=h>t&&e<(d-l)*(t-c)/(h-c)+l&&(o=!o)}return o}function Xe(e,t,i){for(const o of i)if(o.points.length>=3&&Ye(e,t,o.points))return o.id;return null}function Ze(e,t){let i=!1;const o=t.map(t=>{const o=Xe(t.x,t.y,e);return o===t.room_id?t:(i=!0,{...t,room_id:o})});return i?o:t}const Qe=new WeakMap;function Je(e,t,i,o,n,s){const r=n-i,a=s-o,l=r*r+a*a;if(0===l)return je(e,t,i,o);let c=((e-i)*r+(t-o)*a)/l;return c=qe(c,0,1),je(e,t,i+c*r,o+c*a)}function et(e,t,i){let o=1/0;for(let n=0;n<i.length-1;n++){const[s,r]=i[n],[a,l]=i[n+1];o=Math.min(o,Je(e,t,s,r,a,l))}return o}function tt(e){const t=[];for(let i=0;i<e.length;i++){const o=e[i],n=e[(i+1)%e.length];t.push([(o[0]+n[0])/2,(o[1]+n[1])/2])}return t}function it(e){const t=[];for(let i=0;i<e.length-1;i++){const o=e[i],n=e[i+1];t.push([(o[0]+n[0])/2,(o[1]+n[1])/2])}return t}function ot(e,t,i){let o={point:e[0],segmentIndex:0,dist:1/0};for(let n=0;n<e.length-1;n++){const[s,r]=e[n],[a,l]=e[n+1],c=a-s,d=l-r,h=c*c+d*d;let u=0===h?0:((t-s)*c+(i-r)*d)/h;u=qe(u,0,1);const p=[s+u*c,r+u*d],g=je(t,i,p[0],p[1]);g<o.dist&&(o={point:p,segmentIndex:n,dist:g})}return{point:o.point,segmentIndex:o.segmentIndex}}function nt(e,t,i){return 0===e.length?{point:[t,i],segmentIndex:0}:ot([...e,e[0]],t,i)}function st(e,t,i){const[o,n]=e,[s,r]=t,a=Math.abs(s-o),l=Math.abs(r-n);return a>i&&l>i?t:a<=l?[o,r]:[s,n]}function rt(e,t,i,o){if(o.length<2)return null;const{segmentIndex:n}=ot(o,e,t),[s,r]=function(e,t){const[i,o]=e[t],[n,s]=e[t+1]??e[t],r=je(i,o,n,s)||1;return[(n-i)/r,(s-o)/r]}(o,n),a=i/2;return[[e-s*a,t-r*a],[e+s*a,t+r*a]]}function at(e){const t=e.getRootNode();let i=document.activeElement;for(;i?.shadowRoot?.activeElement;)i=i.shadowRoot.activeElement;if(!(i instanceof HTMLElement))return;let o=i.getRootNode();for(;o&&o!==t;)o=o instanceof ShadowRoot?o.host.getRootNode():null;o===t&&i.blur()}const lt=.3048;function ct(e){return Math.round(100*e)/100}function dt(e){return"imperial"===e?"ft":"m"}function ht(e,t){return String(ct("imperial"===t?e/lt:e))}function ut(e,t){const i=Number(e);return Number.isFinite(i)?"imperial"===t?i*lt:i:null}const pt={cm:1,m:100,in:2.54,ft:30.48};function gt(e){return"imperial"===e?"in":"cm"}function _t(e,t){return String(ct(e/pt[t]))}function mt(e,t){const i=Number(e);return Number.isFinite(i)?i*pt[t]:null}function ft(e,t,i){return _t(e/t*100,i)}const bt=a`
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
`,vt=a`
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
`,yt=a`
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
`,wt=a`
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
`,kt=a`
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
`,xt=a`
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
`,$t=a`
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
`;function Mt(e,t,i,o){return e.map(e=>({pin:e,d:je(e.x,e.y,t,i)})).filter(({d:e})=>e<=o).sort((e,t)=>e.d-t.d).map(({pin:e})=>e)}function Pt(e,t,i,o){let n=null,s=o;return e.forEach(([e,o],r)=>{const a=je(e,o,t,i);a<=s&&(n=r,s=a)}),n}function St(e,t,i,o){let n=null,s=o;for(const o of e){const e=et(t,i,o.points);e<=s&&(n=o,s=e)}return n}function It(e,t,i,o){if(e.points.length>=3){const[n,s]=e.points[0];if(je(n,s,t,i)<=o)return{trace:e,closed:!0}}return{trace:{points:[...e.points,[t,i]]},closed:!1}}const Ct=new Map;function Lt(e){const t=e.trim();if(!t)return Promise.resolve(null);const i=t.includes(":")?t:`mdi:${t}`;let o=Ct.get(i);return o||(o=async function(e){if(!customElements.get("ha-icon"))return null;const t=document.createElement("div");t.style.cssText="position:fixed;left:-10000px;top:0;width:24px;height:24px;overflow:hidden;";const i=document.createElement("ha-icon");i.setAttribute("icon",e),t.appendChild(i),document.body.appendChild(t);try{const e=Date.now()+4e3;for(;Date.now()<e;){const e=i.shadowRoot?.querySelector("ha-svg-icon");if("string"==typeof e?.path&&e.path)return e.path;await new Promise(e=>setTimeout(e,50))}return null}finally{t.remove()}}(i),Ct.set(i,o)),o}const Tt=a`
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
`;class Ft{constructor(e){this._host=e,this._resolvedOverrides=new Map,this._failedBrandIcons=new Set}_iconForOverride(e){return this._resolvedOverrides.has(e)?this._resolvedOverrides.get(e)??null:(this._resolvedOverrides.set(e,null),Lt(e).then(t=>{null!==t&&(this._resolvedOverrides.set(e,t),this._host.requestUpdate())}),null)}iconForPin(e,t){if(e.icon_override){const t=this._iconForOverride(e.icon_override);if(t)return{kind:"path",d:t}}const i=function(e,t){return ke(e,t)?.integration_domain??null}(e.device_id,t);return i&&!this._failedBrandIcons.has(i)?{kind:"image",href:`https://brands.home-assistant.io/_/${i}/icon.png`,integrationDomain:i}:{kind:"path",d:"M3 6H21V4H3C1.9 4 1 4.9 1 6V18C1 19.1 1.9 20 3 20H7V18H3V6M13 12H9V13.78C8.39 14.33 8 15.11 8 16C8 16.89 8.39 17.67 9 18.22V20H13V18.22C13.61 17.67 14 16.88 14 16S13.61 14.33 13 13.78V12M11 17.5C10.17 17.5 9.5 16.83 9.5 16S10.17 14.5 11 14.5 12.5 15.17 12.5 16 11.83 17.5 11 17.5M22 8H16C15.5 8 15 8.5 15 9V19C15 19.5 15.5 20 16 20H22C22.5 20 23 19.5 23 19V9C23 8.5 22.5 8 22 8M21 18H17V10H21V18Z"}}onBrandIconError(e){this._failedBrandIcons.has(e)||(this._failedBrandIcons.add(e),this._host.requestUpdate())}renderMarker(e,t,i,o,n,s,r){const a=1.1*i;return K`
      <g>
        <title>${r}</title>
        <circle
          class="pin-dot ${s?"selected":""}"
          cx=${e}
          cy=${t}
          r=${i}
          style="fill:${s?"":n}"
        ></circle>
        ${"path"===o.kind?K`
              <svg
                x=${e-a/2}
                y=${t-a/2}
                width=${a}
                height=${a}
                viewBox="0 0 24 24"
                class="pin-icon"
              >
                <path d=${o.d}></path>
              </svg>
            `:K`
              <image
                x=${e-a/2}
                y=${t-a/2}
                width=${a}
                height=${a}
                href=${o.href}
                class="pin-brand-icon"
                @error=${()=>this.onBrandIconError(o.integrationDomain)}
              ></image>
            `}
        <circle class="pin-hit" cx=${e} cy=${t} r=${1.4*i}></circle>
      </g>
    `}}const Et=[{id:"living",icon:"mdi:sofa"},{id:"bedroom",icon:"mdi:bed"},{id:"kitchen",icon:"mdi:stove"},{id:"dining",icon:"mdi:table-chair"},{id:"bathroom",icon:"mdi:shower"},{id:"office",icon:"mdi:desk"},{id:"laundry",icon:"mdi:washing-machine"},{id:"electronics",icon:"mdi:television"},{id:"lighting",icon:"mdi:floor-lamp"},{id:"kids",icon:"mdi:baby-carriage"},{id:"entry",icon:"mdi:door-open"},{id:"outdoor",icon:"mdi:pine-tree"},{id:"garage",icon:"mdi:garage"},{id:"fitness",icon:"mdi:dumbbell"},{id:"pets",icon:"mdi:paw"},{id:"decor",icon:"mdi:flower"}],Bt=[["living",[["sofa_2","Loveseat",150,90,"sofa",{seats:2}],["sofa_2_compact","Compact loveseat",130,82,"sofa",{seats:2}],["sofa_3","3-seat sofa",210,92,"sofa",{seats:3}],["sofa_3_large","Large 3-seat sofa",235,100,"sofa",{seats:3}],["sofa_4","4-seat sofa",270,100,"sofa",{seats:4}],["sofa_2_seat_armless","Armless sofa",160,88,"sofa",{seats:2,noArms:!0}],["sofa_sleeper","Sleeper sofa",200,95,"sofa",{seats:2}],["sofa_futon","Futon",190,85,"sofa",{seats:3,noArms:!0}],["sofa_reclining_2","Reclining loveseat",165,98,"sofa",{seats:2,recliner:!0}],["sofa_reclining_3","Reclining sofa",220,100,"sofa",{seats:3,recliner:!0}],["sectional_l_left","L-sectional (left chaise)",280,170,"sectional",{seats:3}],["sectional_l_right","L-sectional (right chaise)",280,170,"sectional",{seats:3},!0],["sectional_l_large_left","Large L-sectional (left)",320,230,"sectional",{seats:3,chaise:100}],["sectional_l_large_right","Large L-sectional (right)",320,230,"sectional",{seats:3,chaise:100},!0],["sectional_corner_left","Corner sectional (left)",260,260,"sectional",{seats:2}],["sectional_corner_right","Corner sectional (right)",260,260,"sectional",{seats:2},!0],["sectional_u","U-shaped sectional",340,220,"uSectional"],["chaise_lounge","Chaise lounge",165,70,"chaise"],["daybed_lounge","Lounge daybed",200,90,"chaise"],["armchair","Armchair",85,85,"sofa",{seats:1}],["armchair_club","Club chair",90,90,"sofa",{seats:1}],["armchair_wingback","Wingback chair",80,85,"sofa",{seats:1}],["armchair_accent","Accent chair",70,75,"chair",{arms:!0}],["armchair_slipper","Slipper chair",65,72,"chair"],["recliner","Recliner",90,95,"sofa",{seats:1,recliner:!0}],["recliner_lift","Lift recliner",85,95,"sofa",{seats:1,recliner:!0}],["glider","Glider",75,85,"chair",{arms:!0,rocker:!0}],["rocking_chair","Rocking chair",65,85,"chair",{arms:!0,rocker:!0}],["swivel_chair","Swivel chair",80,80,"stool"],["egg_chair","Egg chair",85,80,"circle",{inner:.65}],["papasan","Papasan chair",110,110,"circle",{inner:.7}],["ottoman_square","Ottoman",60,60,"ottoman"],["ottoman_rect","Rectangular ottoman",110,60,"ottoman"],["ottoman_round","Round ottoman",70,70,"ottoman",{round:!0}],["ottoman_cocktail","Cocktail ottoman",120,80,"ottoman"],["pouf","Pouf",50,50,"pouf"],["beanbag_small","Bean bag (small)",80,80,"beanbag"],["beanbag_large","Bean bag (large)",120,110,"beanbag"],["floor_cushion","Floor cushion",70,70,"ottoman"],["coffee_table","Coffee table",110,60,"table"],["coffee_table_large","Large coffee table",130,70,"table"],["coffee_table_round","Round coffee table",90,90,"roundTable"],["coffee_table_oval","Oval coffee table",120,65,"table",{shape:"oval"}],["coffee_table_square","Square coffee table",90,90,"table"],["coffee_table_glass","Glass coffee table",115,60,"table",{glass:!0}],["side_table","Side table",50,50,"table"],["side_table_round","Round side table",50,50,"roundTable"],["side_table_c","C-table",45,35,"table"],["nesting_tables","Nesting tables",60,45,"box",{inset:6}],["console_table","Console table",120,35,"console"],["sofa_table","Sofa table",150,35,"console"],["tv_stand_small","TV stand (small)",100,40,"tvStand"],["tv_stand","TV stand",150,45,"tvStand"],["tv_stand_large","TV stand (large)",200,45,"tvStand"],["media_console","Media console",180,45,"tvStand"],["entertainment_center","Entertainment center",250,55,"cabinet",{doors:5}],["bookcase_small","Bookcase (small)",80,30,"shelf"],["bookcase","Bookcase",90,35,"shelf"],["bookcase_wide","Wide bookcase",160,35,"shelf"],["bookcase_corner","Corner bookcase",60,60,"box",{x:!0}],["cube_shelf_2x2","Cube shelf 2×2",78,39,"cubby",{cols:2}],["cube_shelf_4x4","Cube shelf 4×4",147,39,"cubby",{cols:4}],["display_cabinet","Display cabinet",100,45,"cabinet",{doors:2}],["curio_cabinet","Curio cabinet",80,40,"cabinet",{doors:1}],["bar_cabinet","Bar cabinet",100,50,"cabinet",{doors:2}],["fireplace","Fireplace",150,70,"fireplace"],["fireplace_large","Large fireplace",200,80,"fireplace"],["fireplace_electric","Electric fireplace",120,35,"fireplace",{noHearth:!0}],["wood_stove","Wood stove",70,70,"stove"],["upright_piano","Upright piano",150,60,"piano"],["baby_grand_piano","Baby grand piano",150,160,"piano",{grand:!0}],["grand_piano","Grand piano",155,210,"piano",{grand:!0}],["piano_bench","Piano bench",75,38,"bench",{slats:1}],["magazine_rack","Magazine rack",40,30,"rack",{rails:3}],["blanket_ladder","Blanket ladder",50,10,"ladder"]]],["bedroom",[["bed_twin","Twin bed",99,190,"bed"],["bed_twin_xl","Twin XL bed",99,203,"bed"],["bed_full","Full / double bed",137,190,"bed"],["bed_queen","Queen bed",152,203,"bed"],["bed_king","King bed",193,203,"bed"],["bed_cal_king","California king bed",183,213,"bed"],["bed_single_eu","Single bed (EU)",90,200,"bed"],["bed_double_eu","Double bed (EU)",140,200,"bed"],["bed_king_eu","King bed (EU)",160,200,"bed"],["bed_super_king","Super king bed",180,200,"bed"],["bed_queen_frame","Queen bed with frame",165,220,"bed"],["bed_king_frame","King bed with frame",205,220,"bed"],["daybed","Daybed",100,200,"bed",{pillows:1}],["daybed_trundle","Daybed with trundle",100,200,"bed",{pillows:1,trundle:!0}],["bunk_bed","Bunk bed",105,200,"bed",{bunk:!0,pillows:1}],["bunk_bed_full","Twin-over-full bunk bed",145,200,"bed",{bunk:!0}],["loft_bed","Loft bed",105,200,"bed",{bunk:!0,pillows:1}],["murphy_bed","Murphy bed (folded)",160,45,"cabinet",{doors:2}],["futon_bed","Futon bed",140,190,"bed"],["mattress_floor","Floor mattress",140,200,"rounded",{k:.05}],["nightstand","Nightstand",50,40,"drawers",{cols:1}],["nightstand_small","Small nightstand",40,35,"drawers",{cols:1}],["nightstand_wide","Wide nightstand",65,42,"drawers",{cols:1}],["dresser_small","Dresser (small)",80,45,"drawers",{cols:1}],["dresser","Dresser",120,50,"drawers",{cols:2}],["dresser_wide","Wide dresser",160,50,"drawers",{cols:3}],["tall_chest","Tall chest of drawers",85,48,"drawers",{cols:1}],["lingerie_chest","Lingerie chest",55,40,"drawers",{cols:1}],["wardrobe_small","Wardrobe (single)",60,60,"wardrobe"],["wardrobe","Wardrobe",100,60,"wardrobe"],["wardrobe_large","Wardrobe (large)",150,60,"wardrobe"],["wardrobe_xl","Wardrobe (extra large)",200,60,"wardrobe"],["armoire","Armoire",110,60,"wardrobe"],["closet_rod_120","Closet rod & shelf 1.2 m",120,60,"closetRod"],["closet_rod_180","Closet rod & shelf 1.8 m",180,60,"closetRod"],["closet_rod_240","Closet rod & shelf 2.4 m",240,60,"closetRod"],["closet_island","Closet island",120,60,"drawers",{cols:2}],["vanity_table","Vanity table",100,45,"desk",{drawers:!0}],["vanity_stool","Vanity stool",45,35,"ottoman"],["bed_bench","End-of-bed bench",130,40,"bench",{slats:2}],["blanket_chest","Blanket chest",100,45,"chest"],["trunk","Trunk",90,50,"chest"],["hamper","Laundry hamper",45,35,"trash"],["shoe_rack","Shoe rack",80,30,"rack",{rails:2}],["valet_stand","Valet stand",45,35,"box",{x:!0}],["full_length_mirror","Full-length mirror",50,6,"mirror"],["jewelry_armoire","Jewelry armoire",45,35,"drawers",{cols:1}],["reading_chair","Reading chair",80,85,"sofa",{seats:1}],["bedroom_rug","Bedside rug",80,150,"rug"],["headboard","Headboard (wall)",165,8,"box",{}],["bed_canopy","Canopy bed",170,220,"bed"],["sleeping_bag","Air mattress",150,200,"rounded",{k:.08}],["fan_bedside","Bedside fan",30,30,"floorFan"],["humidifier_bedroom","Bedroom humidifier",30,25,"rounded",{k:.4}],["safe_closet","Closet safe",45,40,"box",{inset:4}]]],["kitchen",[["base_cabinet_30","Base cabinet 30 cm",30,60,"cabinet",{doors:1}],["base_cabinet_40","Base cabinet 40 cm",40,60,"cabinet",{doors:1}],["base_cabinet_45","Base cabinet 45 cm",45,60,"cabinet",{doors:1}],["base_cabinet_60","Base cabinet 60 cm",60,60,"cabinet",{doors:1}],["base_cabinet_80","Base cabinet 80 cm",80,60,"cabinet",{doors:2}],["base_cabinet_90","Base cabinet 90 cm",90,60,"cabinet",{doors:2}],["base_cabinet_120","Base cabinet 120 cm",120,60,"cabinet",{doors:2}],["drawer_base_60","Drawer base 60 cm",60,60,"drawers",{cols:1}],["drawer_base_90","Drawer base 90 cm",90,60,"drawers",{cols:2}],["corner_base_cabinet","Corner base cabinet",90,90,"cabinet",{doors:1,x:!0}],["lazy_susan","Lazy Susan corner",90,90,"circle",{inner:.5}],["wall_cabinet_30","Wall cabinet 30 cm",30,35,"cabinet",{doors:1,dash:!0}],["wall_cabinet_60","Wall cabinet 60 cm",60,35,"cabinet",{doors:1,dash:!0}],["wall_cabinet_80","Wall cabinet 80 cm",80,35,"cabinet",{doors:2,dash:!0}],["wall_cabinet_90","Wall cabinet 90 cm",90,35,"cabinet",{doors:2,dash:!0}],["wall_cabinet_120","Wall cabinet 120 cm",120,35,"cabinet",{doors:2,dash:!0}],["pantry_cabinet","Pantry cabinet",60,60,"cabinet",{doors:1,x:!0}],["pantry_cabinet_wide","Wide pantry cabinet",90,60,"cabinet",{doors:2,x:!0}],["tall_cabinet","Tall cabinet",45,60,"cabinet",{doors:1,x:!0}],["countertop_60","Countertop 60 cm",60,64,"counter"],["countertop_120","Countertop 120 cm",120,64,"counter"],["countertop_180","Countertop 180 cm",180,64,"counter"],["countertop_240","Countertop 240 cm",240,64,"counter"],["sink_single","Kitchen sink (single)",80,60,"sink",{basins:1}],["sink_double","Kitchen sink (double)",90,60,"sink",{basins:2}],["sink_double_wide","Wide double sink",120,60,"sink",{basins:2}],["sink_farmhouse","Farmhouse sink",90,64,"sink",{basins:1,apron:!0}],["sink_bar","Bar sink",45,50,"sink",{basins:1}],["sink_prep","Prep sink",50,50,"sink",{basins:1}],["range_50","Range 50 cm",50,60,"range",{burners:4}],["range_60","Range 60 cm",60,64,"range",{burners:4}],["range_76","Range 76 cm (30 in)",76,66,"range",{burners:4}],["range_90","Range 90 cm",90,66,"range",{burners:5}],["range_91_six","Range 91 cm, 6 burners",91,68,"range",{burners:6}],["range_122","Range 122 cm (48 in)",122,70,"range",{burners:6,griddle:!0}],["cooktop_60","Cooktop 60 cm",60,52,"range",{burners:4,noBack:!0}],["cooktop_76","Cooktop 76 cm",76,52,"range",{burners:5,noBack:!0}],["cooktop_91","Cooktop 91 cm",91,53,"range",{burners:5,noBack:!0}],["induction_hob","Induction hob",60,52,"range",{burners:4,noBack:!0}],["wall_oven","Wall oven",76,60,"appliance",{window:!0}],["double_wall_oven","Double wall oven",76,64,"appliance",{window:!0}],["range_hood","Range hood",76,50,"hood"],["range_hood_wide","Wide range hood",91,55,"hood"],["microwave_otr","Over-range microwave",76,40,"appliance",{window:!0,r:1}],["microwave","Countertop microwave",50,38,"appliance",{window:!0}],["fridge_top_freezer","Fridge (top freezer)",70,75,"fridge"],["fridge_bottom_freezer","Fridge (bottom freezer)",76,80,"fridge"],["fridge_french_door","French-door fridge",91,86,"fridge",{doors:2}],["fridge_side_by_side","Side-by-side fridge",91,84,"fridge",{doors:2}],["fridge_counter_depth","Counter-depth fridge",91,70,"fridge",{doors:2}],["fridge_eu","Fridge freezer (EU)",60,65,"fridge"],["fridge_mini","Mini fridge",48,50,"fridge"],["wine_fridge","Wine fridge",60,58,"fridge",{x:!0}],["beverage_center","Beverage center",60,60,"fridge"],["freezer_upright","Upright freezer",70,72,"fridge"],["freezer_chest","Chest freezer",110,70,"chest"],["dishwasher_45","Dishwasher 45 cm",45,60,"dishwasher"],["dishwasher_60","Dishwasher 60 cm",60,60,"dishwasher"],["trash_compactor","Trash compactor",38,60,"counter",{x:!0}],["island_small","Kitchen island (small)",120,70,"island"],["island","Kitchen island",180,90,"island"],["island_seating","Island with seating",200,140,"island",{seats:3}],["island_sink","Island with sink",220,110,"island",{sink:!0}],["island_cooktop","Island with cooktop",220,110,"island",{hob:!0}],["peninsula","Peninsula",180,100,"island",{seats:2}],["kitchen_cart","Kitchen cart",80,45,"cart"],["butcher_block","Butcher block",60,60,"box",{inset:5}],["bar_stool","Bar stool",40,40,"stool"],["counter_stool","Counter stool",42,42,"stool"],["toaster","Toaster",30,20,"appliance",{slots:!0}],["toaster_oven","Toaster oven",45,35,"appliance",{window:!0}],["coffee_maker","Coffee maker",25,25,"appliance",{jug:!0}],["espresso_machine","Espresso machine",35,40,"appliance",{dial:!0}],["stand_mixer","Stand mixer",35,25,"appliance",{bowl:!0}],["kettle","Kettle",22,18,"puck"],["blender","Blender",18,18,"puck"],["air_fryer","Air fryer",30,35,"appliance",{dial:!0,r:8}],["pressure_cooker","Pressure cooker",32,32,"puck"],["rice_cooker","Rice cooker",28,28,"puck"],["bread_maker","Bread maker",30,40,"appliance",{window:!0}],["food_processor","Food processor",25,25,"puck"],["water_dispenser","Water dispenser",32,32,"appliance",{dial:!0}],["kitchen_trash","Kitchen trash can",40,30,"trash"],["recycling_bin","Recycling bin",40,30,"trash"],["step_bin","Step bin",30,30,"trash",{round:!0}],["kitchen_scale","Kitchen scale",20,20,"device",{screen:!0}],["spice_rack","Spice rack",40,12,"rack",{rails:2}],["knife_block","Knife block",15,22,"rack",{rails:3}],["dish_rack","Dish rack",45,32,"rack",{rails:4}],["breakfast_bar","Breakfast bar",150,45,"console"]]],["dining",[["dining_table_2","Dining table for 2",75,165,"table",{top:1,bottom:1}],["dining_table_4","Dining table for 4",120,170,"table",{top:2,bottom:2}],["dining_table_4_square","Square table for 4",175,175,"table",{top:1,bottom:1,left:1,right:1}],["dining_table_6","Dining table for 6",180,180,"table",{top:3,bottom:3}],["dining_table_6_ends","Table for 6 (ends)",230,180,"table",{top:2,bottom:2,left:1,right:1}],["dining_table_8","Dining table for 8",290,180,"table",{top:3,bottom:3,left:1,right:1}],["dining_table_8_square","Square table for 8",240,240,"table",{top:2,bottom:2,left:2,right:2}],["dining_table_10","Dining table for 10",330,190,"table",{top:4,bottom:4,left:1,right:1}],["dining_table_12","Dining table for 12",400,190,"table",{top:5,bottom:5,left:1,right:1}],["dining_round_2","Round table for 2",160,160,"roundTable",{chairs:2}],["dining_round_4","Round table for 4",190,190,"roundTable",{chairs:4}],["dining_round_5","Round table for 5",210,210,"roundTable",{chairs:5}],["dining_round_6","Round table for 6",230,230,"roundTable",{chairs:6}],["dining_round_8","Round table for 8",270,270,"roundTable",{chairs:8,pedestal:!0}],["dining_oval_6","Oval table for 6",260,190,"table",{top:2,bottom:2,left:1,right:1,shape:"oval"}],["dining_oval_8","Oval table for 8",320,190,"table",{top:3,bottom:3,left:1,right:1,shape:"oval"}],["dining_table_only_4","Dining table (4-seat, no chairs)",120,80,"table"],["dining_table_only_6","Dining table (6-seat, no chairs)",180,90,"table"],["dining_table_only_8","Dining table (8-seat, no chairs)",240,100,"table"],["dining_round_only","Round dining table (no chairs)",110,110,"roundTable",{pedestal:!0}],["dining_chair","Dining chair",45,50,"chair"],["dining_armchair","Dining armchair",58,55,"chair",{arms:!0}],["dining_bench","Dining bench",140,38,"bench",{slats:2}],["dining_bench_back","Dining bench with back",140,50,"bench",{back:!0,slats:2}],["banquette","Banquette",180,60,"sofa",{seats:3,noArms:!0}],["banquette_corner","Corner banquette",180,180,"sectional",{seatDepth:60,chaise:60,seats:2}],["buffet","Buffet / sideboard",160,45,"cabinet",{doors:3}],["sideboard_small","Small sideboard",120,42,"cabinet",{doors:2}],["china_cabinet","China cabinet",120,45,"cabinet",{doors:2,x:!0}],["hutch","Hutch",140,50,"cabinet",{doors:3}],["bar_cart","Bar cart",75,42,"cart"],["home_bar","Home bar counter",180,60,"counter"],["high_top_table","High-top table",70,70,"roundTable",{pedestal:!0}],["pub_table_set","Pub table set",160,160,"roundTable",{chairs:4}],["wine_rack","Wine rack",60,30,"cubby",{cols:4}],["tea_trolley","Tea trolley",70,45,"cart"]]],["bathroom",[["toilet","Toilet",40,70,"toilet"],["toilet_elongated","Toilet (elongated)",40,75,"toilet"],["toilet_compact","Compact toilet",36,60,"toilet"],["toilet_wall_hung","Wall-hung toilet",36,54,"toilet",{wallHung:!0}],["bidet","Bidet",38,55,"bidet"],["urinal","Urinal",40,35,"urinal"],["vanity_60","Vanity 60 cm",60,48,"vanity"],["vanity_76","Vanity 76 cm",76,53,"vanity"],["vanity_91","Vanity 91 cm",91,55,"vanity"],["vanity_122","Vanity 122 cm",122,55,"vanity"],["vanity_double_152","Double vanity 152 cm",152,55,"vanity",{basins:2}],["vanity_double_183","Double vanity 183 cm",183,55,"vanity",{basins:2}],["pedestal_sink","Pedestal sink",55,45,"pedestalSink"],["wall_sink","Wall-mounted sink",50,38,"pedestalSink"],["corner_sink","Corner sink",45,45,"cornerTub"],["bathtub_152","Bathtub 152 cm",152,76,"bathtub"],["bathtub_167","Bathtub 167 cm",167,76,"bathtub"],["bathtub_183","Bathtub 183 cm",183,81,"bathtub"],["bathtub_eu","Bathtub (EU) 170 cm",170,75,"bathtub"],["bathtub_freestanding","Freestanding tub",170,80,"bathtub",{free:!0}],["bathtub_clawfoot","Clawfoot tub",167,76,"bathtub",{free:!0,claw:!0}],["bathtub_corner","Corner tub",150,150,"cornerTub"],["bathtub_whirlpool","Whirlpool tub",183,91,"bathtub",{jets:!0}],["shower_76","Shower 76×76",76,76,"shower"],["shower_91","Shower 91×91",91,91,"shower"],["shower_90_eu","Shower 90×90",90,90,"shower"],["shower_107","Shower 107×91",107,91,"shower"],["shower_122","Shower 122×91",122,91,"shower"],["shower_152","Shower 152×81",152,81,"shower"],["shower_neo_angle","Neo-angle shower",100,100,"neoAngleShower"],["shower_walk_in","Walk-in shower",150,100,"shower",{walkIn:!0}],["shower_tub_combo","Tub/shower combo",152,76,"bathtub"],["shower_bench","Shower bench",60,30,"bench",{slats:3}],["linen_cabinet","Linen cabinet",45,35,"cabinet",{doors:1}],["linen_tower","Linen tower",40,30,"cabinet",{doors:1,x:!0}],["over_toilet_storage","Over-toilet storage",60,25,"shelf",{bay:60}],["medicine_cabinet","Medicine cabinet",60,15,"cabinet",{doors:1,dash:!0}],["towel_rail_heated","Heated towel rail",60,10,"towelRail"],["towel_bar","Towel bar",60,8,"box",{r:3}],["bathroom_hamper","Bathroom hamper",40,30,"trash"],["bath_mat","Bath mat",80,50,"rug"],["bathroom_scale","Bathroom scale",30,30,"device",{screen:!0}],["bathroom_trash","Bathroom trash bin",25,25,"trash",{round:!0}],["bathroom_stool","Bathroom stool",35,35,"stool"],["makeup_vanity","Makeup vanity",100,45,"desk",{drawers:!0}],["sauna_2","Sauna (2-person)",120,105,"bench",{slats:4,back:!0}],["steam_shower","Steam shower",120,90,"shower"],["exhaust_fan","Bathroom exhaust fan",25,25,"grille",{lines:5}]]],["office",[["desk_small","Desk (small)",100,50,"desk"],["desk","Desk",140,70,"desk",{monitor:!0}],["desk_large","Desk (large)",180,80,"desk",{monitor:!0,drawers:!0}],["desk_with_chair","Desk with chair",140,130,"desk",{desk:70,monitor:!0}],["desk_writing","Writing desk",110,55,"desk"],["desk_executive","Executive desk",180,90,"desk",{drawers:!0}],["desk_standing","Standing desk",150,75,"desk",{monitor:!0}],["desk_corner","Corner desk",120,120,"lDesk",{desk:60}],["desk_l_left","L-desk (left return)",160,140,"lDesk",{desk:60,chair:!0}],["desk_l_right","L-desk (right return)",160,140,"lDesk",{desk:60,chair:!0},!0],["desk_u","U-shaped desk",200,180,"uDesk"],["desk_computer","Computer desk",120,60,"desk",{monitor:!0}],["office_chair","Office chair",65,65,"officeChair"],["executive_chair","Executive chair",72,72,"officeChair"],["gaming_chair","Gaming chair",70,70,"officeChair"],["drafting_stool","Drafting stool",55,55,"officeChair"],["guest_chair","Guest chair",58,58,"chair",{arms:!0}],["kneeling_chair","Kneeling chair",50,70,"bench",{slats:2}],["conference_table_6","Conference table for 6",270,180,"table",{top:2,bottom:2,left:1,right:1,r:20}],["conference_table_8","Conference table for 8",330,190,"table",{top:3,bottom:3,left:1,right:1,r:20}],["conference_table_10","Conference table for 10",400,200,"table",{top:4,bottom:4,left:1,right:1,r:25}],["conference_table_12","Conference table for 12",470,210,"table",{top:5,bottom:5,left:1,right:1,r:25}],["meeting_round_4","Round meeting table",200,200,"roundTable",{chairs:4}],["file_cabinet_2","Filing cabinet (2 drawer)",40,60,"drawers",{cols:1}],["file_cabinet_3","Filing cabinet (3 drawer)",40,65,"drawers",{cols:1}],["file_cabinet_4","Filing cabinet (4 drawer)",45,70,"drawers",{cols:1}],["file_cabinet_lateral","Lateral file cabinet",90,50,"drawers",{cols:1}],["mobile_pedestal","Mobile pedestal",40,55,"drawers",{cols:1}],["credenza","Credenza",180,50,"cabinet",{doors:4}],["office_bookcase","Office bookcase",90,38,"shelf"],["storage_cabinet","Storage cabinet",90,45,"cabinet",{doors:2}],["printer","Printer",45,40,"printer"],["printer_large","Office copier",60,65,"printer"],["printer_3d","3D printer",50,50,"box",{inset:6,x:!0}],["shredder","Paper shredder",35,25,"trash"],["safe","Safe",50,50,"device",{button:!0}],["whiteboard","Whiteboard (wall)",180,6,"box",{r:1}],["corkboard","Corkboard (wall)",90,4,"box",{r:1}],["drafting_table","Drafting table",120,80,"desk"],["monitor_stand","Monitor arm/stand",70,25,"monitor"],["mail_sorter","Mail sorter",40,25,"cubby",{cols:3}],["office_plant","Office plant",45,45,"plant"],["office_couch","Office couch",180,85,"sofa",{seats:2}],["podium","Lectern",60,50,"box",{inset:6}]]],["laundry",[["washer_front","Washer (front-load)",68,75,"washer"],["washer_top","Washer (top-load)",68,70,"washer",{top:!0}],["washer_eu","Washing machine (EU)",60,60,"washer"],["dryer","Dryer",68,75,"washer",{dryer:!0}],["dryer_eu","Tumble dryer (EU)",60,60,"washer",{dryer:!0}],["washer_dryer_stack","Stacked washer/dryer",68,78,"washer",{stack:!0}],["washer_dryer_combo","Washer-dryer combo",60,60,"washer",{dryer:!0}],["laundry_sink","Laundry sink",60,55,"sink",{basins:1}],["utility_sink","Utility sink",60,60,"sink",{basins:1}],["laundry_pedestal","Laundry pedestal",68,70,"drawers",{cols:1}],["laundry_counter","Laundry folding counter",140,60,"counter"],["laundry_cabinet","Laundry cabinet",90,35,"cabinet",{doors:2,dash:!0}],["ironing_board","Ironing board",130,38,"ironingBoard"],["drying_rack","Drying rack",110,55,"rack",{rails:6}],["laundry_basket","Laundry basket",55,40,"trash"],["water_heater_40","Water heater (150 L)",50,50,"waterHeater"],["water_heater_50","Water heater (190 L)",56,56,"waterHeater"],["water_heater_80","Water heater (300 L)",66,66,"waterHeater"],["water_heater_tankless","Tankless water heater",45,25,"waterHeater",{tankless:!0}],["heat_pump_water_heater","Heat-pump water heater",62,62,"waterHeater"],["furnace","Furnace",55,75,"furnace"],["air_handler","Air handler",55,60,"furnace"],["boiler","Boiler",45,40,"device",{button:!0}],["water_softener","Water softener",70,40,"tank",{tanks:1,brine:!0}],["water_filter_system","Whole-house water filter",50,25,"tank",{tanks:2}],["pressure_tank","Well pressure tank",55,55,"tank",{tanks:1}],["sump_pump","Sump pit",50,50,"circle",{inner:.6}],["electrical_panel","Electrical panel",40,12,"electricalPanel"],["electrical_subpanel","Sub-panel",30,10,"electricalPanel"],["dehumidifier","Dehumidifier",38,28,"grille",{lines:4}],["humidifier","Humidifier",35,25,"grille",{lines:3,r:8}],["robot_vacuum_dock","Robot vacuum dock",35,40,"puck"],["stick_vacuum","Stick vacuum (stand)",25,25,"puck"],["mop_bucket","Mop bucket",40,30,"trash"],["utility_shelf","Utility shelving",90,45,"shelf",{bay:90}],["broom_cabinet","Broom cabinet",60,40,"cabinet",{doors:1}],["step_stool","Step stool",40,45,"bench",{slats:2}],["step_ladder","Step ladder",50,70,"ladder"],["recirculation_pump","Recirculation pump",20,15,"device",{fan:!0}]]],["electronics",[["tv_32",'TV 32"',73,18,"tv",{stand:!0}],["tv_43",'TV 43"',97,22,"tv",{stand:!0}],["tv_50",'TV 50"',112,25,"tv",{stand:!0}],["tv_55",'TV 55"',123,26,"tv",{stand:!0}],["tv_65",'TV 65"',145,30,"tv",{stand:!0}],["tv_75",'TV 75"',168,35,"tv",{stand:!0}],["tv_85",'TV 85"',190,38,"tv",{stand:!0}],["tv_wall_55",'Wall TV 55"',123,6,"tv"],["tv_wall_65",'Wall TV 65"',145,6,"tv"],["tv_wall_75",'Wall TV 75"',168,6,"tv"],["projector","Projector",35,28,"projector"],["projection_screen","Projection screen",240,10,"screen"],["soundbar","Soundbar",90,10,"soundbar"],["soundbar_large","Soundbar (large)",120,14,"soundbar"],["av_receiver","AV receiver",44,38,"device",{leds:3,button:!0}],["subwoofer","Subwoofer",38,38,"speaker"],["speaker_bookshelf","Bookshelf speaker",18,25,"speaker",{tweeter:!0}],["speaker_floor","Floor-standing speaker",25,32,"speaker",{tweeter:!0}],["speaker_center","Center speaker",55,22,"speaker"],["turntable","Turntable",45,36,"appliance",{dial:!0}],["game_console","Game console",30,26,"device",{leds:1,r:4}],["desktop_pc","Desktop PC",22,45,"device",{fan:!0,leds:1}],["laptop","Laptop",34,24,"laptop"],["monitor_24",'Monitor 24"',54,20,"monitor"],["monitor_27",'Monitor 27"',61,22,"monitor"],["monitor_32",'Monitor 32"',72,24,"monitor"],["monitor_34_ultrawide",'Ultrawide monitor 34"',82,25,"monitor"],["router","Wi-Fi router",30,20,"device",{antennas:3,leds:4}],["mesh_node","Mesh Wi-Fi node",12,12,"puck",{dot:!0}],["access_point","Ceiling access point",20,20,"puck",{dot:!0}],["modem","Modem",20,15,"device",{leds:3}],["network_switch","Network switch",33,20,"device",{leds:8}],["patch_panel","Patch panel",48,10,"device",{leds:12}],["nas","NAS",22,25,"device",{rackUnits:!0}],["server_rack_small","Server rack (small)",60,60,"device",{rackUnits:!0}],["server_rack_full","Server rack (full)",60,100,"device",{rackUnits:!0}],["network_cabinet","Network cabinet",60,45,"device",{rackUnits:!0}],["ups","UPS",15,35,"device",{leds:2}],["smart_speaker","Smart speaker",12,12,"puck"],["smart_speaker_large","Smart speaker (large)",18,18,"puck"],["smart_display","Smart display",25,12,"device",{screen:!0}],["smart_hub","Smart home hub",12,12,"device",{leds:1,r:3}],["zigbee_coordinator","Zigbee coordinator",8,5,"device",{antennas:1,leds:1}],["home_assistant_server","Home Assistant server",15,15,"device",{leds:2,r:3}],["security_camera","Security camera",10,15,"device",{lens:!0,r:3}],["camera_dome","Dome camera",13,13,"puck",{dot:!0}],["video_doorbell","Video doorbell",6,13,"device",{lens:!0,button:!0,r:2}],["alarm_panel","Alarm keypad",15,4,"device",{screen:!0}],["thermostat","Thermostat",9,4,"puck"],["smoke_detector","Smoke detector",14,14,"puck",{dot:!0}],["co_detector","CO detector",12,12,"puck",{dot:!0}],["motion_sensor","Motion sensor",6,6,"puck",{dot:!0}],["presence_sensor","mmWave presence sensor",8,8,"device",{lens:!0}],["ceiling_fan_4","Ceiling fan (4 blades)",132,132,"ceilingFan",{blades:4}],["ceiling_fan_5","Ceiling fan (5 blades)",132,132,"ceilingFan",{blades:5}],["ceiling_fan_large","Ceiling fan (large)",152,152,"ceilingFan",{blades:3}],["floor_fan","Floor fan",45,40,"floorFan"],["tower_fan","Tower fan",30,30,"grille",{lines:5,r:10}],["space_heater","Space heater",40,22,"grille",{lines:4}],["oil_radiator","Oil-filled radiator",60,25,"radiator"],["radiator","Radiator",100,10,"radiator"],["baseboard_heater","Baseboard heater",120,8,"radiator"],["portable_ac","Portable air conditioner",45,38,"grille",{lines:4}],["window_ac","Window air conditioner",60,50,"grille",{lines:6}],["mini_split_head","Mini-split indoor unit",80,22,"grille",{lines:2,r:6}],["air_purifier","Air purifier",30,30,"puck"],["ev_charger","EV charger",25,12,"device",{button:!0}],["solar_inverter","Solar inverter",50,20,"grille",{lines:5}],["home_battery","Home battery",75,15,"device",{leds:3}],["sewing_machine","Sewing machine",40,20,"device",{button:!0}],["vr_play_area","VR play area",200,200,"box",{dash:!0,x:!0}],["charging_station","Charging station",30,20,"device",{leds:4}]]],["lighting",[["floor_lamp","Floor lamp",40,40,"lamp"],["floor_lamp_arc","Arc floor lamp",120,100,"arcLamp"],["torchiere","Torchiere lamp",35,35,"lamp"],["table_lamp","Table lamp",30,30,"lamp"],["desk_lamp","Desk lamp",20,20,"lamp"],["ceiling_light","Ceiling light",40,40,"ceilingLight"],["ceiling_light_small","Small ceiling light",25,25,"ceilingLight"],["flush_mount","Flush-mount light",35,35,"puck"],["recessed_light","Recessed light",15,15,"puck",{dot:!0}],["pendant_light","Pendant light",35,35,"puck"],["pendant_cluster","Pendant cluster",60,60,"chandelier",{arms:3}],["chandelier","Chandelier",70,70,"chandelier"],["chandelier_large","Large chandelier",100,100,"chandelier",{arms:8}],["track_light","Track lighting",120,12,"trackLight"],["wall_sconce","Wall sconce",20,15,"sconce"],["led_strip","LED strip",200,3,"box",{dash:!0}],["light_bar","Light bar",100,8,"trackLight"],["smart_bulb_lamp","Smart bulb lamp",25,25,"lamp"],["string_lights","String lights",300,4,"trackLight"],["night_light","Night light",8,8,"puck"]]],["kids",[["crib","Crib",75,135,"crib"],["crib_mini","Mini crib",63,100,"crib"],["crib_convertible","Convertible crib",80,140,"crib"],["bassinet","Bassinet",50,85,"bassinet"],["toddler_bed","Toddler bed",75,140,"bed",{pillows:1}],["kids_bed_house","House bed",100,200,"bed",{pillows:1}],["changing_table","Changing table",90,50,"changingTable"],["changing_dresser","Changing dresser",110,52,"drawers",{cols:2}],["nursery_glider","Nursery glider",75,85,"chair",{arms:!0,rocker:!0}],["high_chair","High chair",60,75,"highChair"],["playpen","Playpen",100,100,"playpen"],["play_yard","Play yard",75,105,"playpen"],["play_mat","Play mat",150,150,"rug"],["play_mat_round","Round play mat",140,140,"rug",{round:!0}],["toy_box","Toy box",80,45,"toyBox"],["toy_storage","Toy storage bins",85,30,"cubby",{cols:3}],["kids_table_2","Kids table for 2",60,140,"table",{top:1,bottom:1}],["kids_table_4","Kids table for 4",80,160,"table",{top:2,bottom:2}],["kids_chair","Kids chair",32,32,"chair"],["kids_desk","Kids desk",90,50,"desk"],["play_kitchen","Play kitchen",90,35,"playKitchen"],["dollhouse","Dollhouse",80,35,"dollhouse"],["kids_easel","Kids easel",60,55,"easel"],["teepee","Play teepee",120,120,"teepee"],["ball_pit","Ball pit",120,120,"ballPit",{round:!0}],["kids_beanbag","Kids bean bag",60,60,"beanbag"],["kids_bookshelf","Kids bookshelf",80,30,"shelf"],["rocking_horse","Rocking horse",75,30,"chair",{rocker:!0}],["stroller","Stroller",60,90,"stroller"],["car_seat","Car seat",45,65,"rounded",{k:.3}],["baby_bath","Baby bath",80,50,"bathtub",{free:!0}],["baby_gate","Baby gate",90,5,"rack",{rails:1}],["diaper_pail","Diaper pail",30,30,"trash",{round:!0}],["train_table","Train table",130,85,"table",{glass:!0}]]],["entry",[["entry_bench","Entry bench",100,38,"bench",{slats:2}],["entry_bench_storage","Storage bench",110,40,"chest"],["shoe_cabinet","Shoe cabinet",80,30,"cabinet",{doors:2}],["shoe_bench","Shoe bench",90,35,"rack",{rails:2}],["coat_rack","Coat rack",45,45,"lamp"],["hall_tree","Hall tree",90,40,"bench",{back:!0,slats:1}],["umbrella_stand","Umbrella stand",25,25,"trash",{round:!0}],["entry_console","Entry console",100,30,"console"],["key_cabinet","Key cabinet (wall)",30,8,"cabinet",{doors:1,dash:!0}],["mudroom_locker","Mudroom locker",120,45,"cubby",{cols:3}],["entry_cubby","Cubby organizer",90,35,"cubby",{cols:3}],["wall_hooks","Wall hooks",60,6,"rack",{rails:1}],["doormat","Doormat",75,45,"rug"],["runner_rug","Runner rug",75,240,"rug"],["storage_shelf","Storage shelf",90,40,"shelf",{bay:90}],["storage_bins","Storage bins",60,40,"cubby",{cols:2}],["linen_closet_shelves","Linen closet shelves",90,40,"shelf",{bay:90}],["pantry_shelves","Pantry shelving",120,40,"shelf",{bay:60}],["coat_closet","Coat closet",120,60,"closetRod"],["mirror_entry","Entry mirror",80,5,"mirror"],["package_box","Parcel drop box",60,45,"chest"]]],["outdoor",[["patio_table_4","Patio dining set (4)",180,180,"roundTable",{chairs:4}],["patio_table_6","Patio dining set (6)",180,240,"table",{left:1,right:1,top:2,bottom:2}],["patio_table_rect","Patio table",150,90,"table"],["patio_bistro_set","Bistro set",140,140,"roundTable",{chairs:2}],["patio_chair","Patio chair",60,65,"chair",{arms:!0}],["adirondack_chair","Adirondack chair",75,90,"chair",{arms:!0}],["chaise_lounger","Chaise lounger",70,195,"chaise"],["outdoor_sofa","Outdoor sofa",200,85,"sofa",{seats:3}],["outdoor_loveseat","Outdoor loveseat",140,80,"sofa",{seats:2}],["outdoor_sectional","Outdoor sectional",260,200,"sectional",{seats:3,seatDepth:85,chaise:85}],["outdoor_coffee_table","Outdoor coffee table",100,60,"table"],["porch_swing","Porch swing",150,65,"sofa",{seats:2,noArms:!0}],["glider_bench","Glider bench",130,70,"bench",{back:!0}],["garden_bench","Garden bench",150,60,"bench",{back:!0}],["picnic_table","Picnic table",180,150,"picnicTable"],["kids_picnic_table","Kids picnic table",90,90,"picnicTable"],["fire_pit_round","Fire pit (round)",90,90,"firePit"],["fire_pit_square","Fire pit (square)",90,90,"firePit",{square:!0}],["fire_table","Fire table",120,80,"firePit",{square:!0}],["patio_heater","Patio heater",80,80,"umbrella"],["grill_gas","Gas grill",150,60,"grill"],["grill_gas_large","Large gas grill",180,65,"grill"],["grill_charcoal","Charcoal kettle grill",60,60,"kamado"],["grill_kamado","Kamado grill",120,70,"grill"],["smoker","Smoker",120,70,"grill",{noShelves:!0}],["pellet_grill","Pellet grill",130,60,"grill"],["pizza_oven","Pizza oven",70,80,"stove"],["outdoor_kitchen","Outdoor kitchen",300,70,"counter"],["outdoor_fridge","Outdoor fridge",60,60,"fridge"],["umbrella_270","Patio umbrella 2.7 m",270,270,"umbrella"],["umbrella_300","Patio umbrella 3 m",300,300,"umbrella"],["umbrella_cantilever","Cantilever umbrella",350,300,"cantileverUmbrella"],["pergola","Pergola",360,360,"greenhouse"],["gazebo","Gazebo",300,300,"teepee"],["hammock","Hammock with stand",400,120,"hammock"],["swing_set","Swing set",400,200,"swingSet",{seats:2}],["swing_set_3","Swing set (3)",500,220,"swingSet",{seats:3}],["playhouse","Playhouse",150,150,"shed"],["sandbox","Sandbox",150,150,"raisedBed"],["trampoline_300","Trampoline 3 m",300,300,"trampoline"],["trampoline_430","Trampoline 4.3 m",430,430,"trampoline"],["pool_rect","Pool (rectangular)",800,400,"pool"],["pool_small","Plunge pool",450,250,"pool"],["pool_round","Above-ground pool",450,450,"pool",{round:!0}],["hot_tub_4","Hot tub (4 person)",200,200,"hotTub"],["hot_tub_6","Hot tub (6 person)",230,230,"hotTub"],["shed_small","Garden shed (small)",180,120,"shed"],["shed","Garden shed",300,240,"shed"],["shed_large","Garden shed (large)",360,300,"shed"],["greenhouse","Greenhouse",300,240,"greenhouse"],["raised_bed_small","Raised garden bed (small)",120,60,"raisedBed"],["raised_bed","Raised garden bed",240,120,"raisedBed"],["planter_small","Planter (small)",40,40,"planter",{round:!0}],["planter_large","Planter (large)",80,80,"planter",{round:!0}],["planter_box","Planter box",100,40,"planter"],["tree_small","Tree (small)",200,200,"tree"],["tree","Tree",400,400,"tree",{lobes:11}],["tree_large","Tree (large)",700,700,"tree",{lobes:13}],["shrub","Shrub",100,100,"tree",{lobes:7}],["hedge","Hedge",300,80,"rounded",{k:.45}],["compost_bin","Compost bin",100,100,"compost"],["rain_barrel","Rain barrel",60,60,"circle",{inner:.8}],["garbage_bin","Wheelie bin",60,75,"trash"],["recycling_wheelie_bin","Recycling wheelie bin",60,75,"trash"],["bike_rack","Bike rack",180,50,"rack",{rails:1}],["potting_bench","Potting bench",120,55,"workbench"],["firewood_rack","Firewood rack",120,40,"rack",{rails:4}],["dog_house","Dog house",90,110,"shed"],["chicken_coop","Chicken coop",240,120,"coop"],["ac_condenser","AC condenser",80,80,"condenser"],["heat_pump_outdoor","Heat pump (outdoor)",95,40,"condenser"],["generator_standby","Standby generator",120,70,"generator"],["pool_pump","Pool pump",60,30,"compressor"],["outdoor_shower","Outdoor shower",100,100,"shower"],["birdbath","Birdbath",60,60,"circle",{inner:.7}],["fountain","Fountain",120,120,"circle",{inner:.6}],["patio_storage_box","Deck storage box",130,60,"chest"],["satellite_dish","Satellite dish",70,70,"circle",{cross:!0}],["mailbox","Mailbox",25,50,"chest"]]],["garage",[["car_compact","Compact car",175,410,"car"],["car_sedan","Sedan",185,480,"car"],["car_suv","SUV",195,490,"car"],["car_suv_large","Large SUV",205,530,"car"],["car_minivan","Minivan",200,515,"car"],["car_pickup","Pickup truck",205,580,"car"],["car_ev","Electric car",190,470,"car"],["motorcycle","Motorcycle",80,215,"motorcycle"],["scooter_motor","Motor scooter",70,180,"motorcycle"],["bicycle","Bicycle",60,175,"bicycle"],["kids_bike","Kids bike",50,130,"bicycle"],["e_scooter","E-scooter",45,110,"scooter"],["kayak","Kayak",70,360,"boat"],["canoe","Canoe",90,480,"boat"],["workbench","Workbench",180,70,"workbench",{pegboard:!0}],["workbench_small","Workbench (small)",120,60,"workbench"],["tool_chest","Tool chest",70,45,"drawers",{cols:1}],["rolling_tool_cabinet","Rolling tool cabinet",110,50,"drawers",{cols:2}],["pegboard","Pegboard (wall)",120,4,"box",{dash:!0}],["garage_shelving_120","Garage shelving 1.2 m",120,45,"shelf",{bay:120}],["garage_shelving_180","Garage shelving 1.8 m",180,60,"shelf",{bay:90}],["garage_cabinet","Garage cabinet",90,45,"cabinet",{doors:2}],["overhead_storage","Overhead storage rack",240,120,"box",{dash:!0,x:!0}],["garage_fridge","Garage fridge",75,75,"fridge"],["garage_freezer","Garage chest freezer",130,70,"chest"],["table_saw","Table saw",80,70,"tableSaw"],["miter_saw_station","Miter saw station",240,60,"miterSaw"],["drill_press","Drill press",45,60,"drillPress"],["band_saw","Band saw",60,45,"drillPress"],["air_compressor","Air compressor",70,40,"compressor"],["shop_vac","Shop vac",45,45,"trash",{round:!0}],["portable_generator","Portable generator",70,55,"generator"],["extension_ladder","Extension ladder (stored)",50,400,"ladder"],["snowblower","Snowblower",70,140,"mower"],["lawn_mower","Lawn mower",55,140,"mower"],["riding_mower","Riding mower",110,180,"mower",{riding:!0}],["wheelbarrow","Wheelbarrow",70,150,"wheelbarrow"],["storage_totes","Storage totes",60,40,"cubby",{cols:2}],["gun_safe","Gun safe",75,60,"device",{button:!0}],["ski_rack","Ski rack",120,25,"rack",{rails:1}],["golf_bag","Golf bag",40,40,"circle",{inner:.6}],["ev_charger_garage","EV charger (garage)",30,15,"device",{button:!0}],["garage_door_opener","Garage door opener",40,300,"box",{dash:!0}],["car_lift","Car lift",350,520,"box",{dash:!0,inset:40}],["water_softener_garage","Water softener (garage)",70,40,"tank",{tanks:1,brine:!0}],["garage_trash","Garage trash can",60,60,"trash",{round:!0}]]],["fitness",[["treadmill","Treadmill",85,195,"treadmill"],["treadmill_compact","Compact treadmill",70,150,"treadmill"],["elliptical","Elliptical",70,190,"elliptical"],["exercise_bike","Exercise bike",60,130,"exerciseBike"],["spin_bike","Spin bike",55,120,"exerciseBike"],["rowing_machine","Rowing machine",60,240,"rower"],["stair_climber","Stair climber",80,120,"treadmill"],["weight_bench","Weight bench",120,140,"weightBench"],["adjustable_bench","Adjustable bench",60,130,"bench",{slats:2}],["power_rack","Power rack",140,140,"powerRack"],["squat_stand","Squat stand",120,100,"powerRack"],["smith_machine","Smith machine",210,120,"powerRack"],["cable_machine","Cable machine",200,100,"box",{x:!0,inset:8}],["home_gym","Home gym station",200,150,"box",{x:!0}],["dumbbell_rack","Dumbbell rack",130,50,"dumbbellRack"],["kettlebell_rack","Kettlebell rack",90,40,"dumbbellRack"],["plate_tree","Weight plate tree",60,60,"circle",{inner:.4,cross:!0}],["yoga_mat","Yoga mat",61,183,"mat"],["gym_mat","Gym floor mats",200,200,"rug"],["punching_bag","Punching bag",40,40,"bag"],["punching_bag_stand","Punching bag stand",120,120,"bag"],["pull_up_bar","Pull-up station",120,100,"powerRack"],["massage_table","Massage table",75,185,"rounded",{k:.15}],["pool_table_7","Pool table 7 ft",112,198,"poolTable"],["pool_table_8","Pool table 8 ft",127,234,"poolTable"],["pool_table_9","Pool table 9 ft",142,264,"poolTable"],["ping_pong_table","Ping-pong table",274,152,"pingPong"],["foosball_table","Foosball table",140,75,"foosball"],["air_hockey_table","Air hockey table",210,110,"airHockey"],["arcade_cabinet","Arcade cabinet",70,80,"arcade"],["pinball_machine","Pinball machine",75,140,"arcade"],["poker_table","Poker table",300,220,"table",{top:3,bottom:3,left:1,right:1,shape:"oval"}],["card_table","Card table",175,175,"table",{top:1,bottom:1,left:1,right:1}],["dartboard_cabinet","Dartboard (wall)",60,10,"cabinet",{doors:2}],["drum_kit","Drum kit",180,150,"drumKit"],["digital_piano","Digital piano",135,35,"piano"],["keyboard_stand","Keyboard on stand",130,40,"piano"],["guitar_stand","Guitar on stand",40,100,"guitar"],["amp","Guitar amp",55,28,"speaker"],["art_easel","Art easel",75,70,"easel"],["craft_table","Craft table",150,75,"desk",{drawers:!0}],["sewing_table","Sewing table",120,60,"desk"],["record_cabinet","Record cabinet",120,40,"cubby",{cols:4}],["telescope","Telescope",80,80,"easel"],["sauna_barrel","Barrel sauna",200,220,"bench",{slats:4,back:!0}]]],["pets",[["dog_bed_small","Dog bed (small)",55,45,"petBed"],["dog_bed_medium","Dog bed (medium)",75,60,"petBed"],["dog_bed_large","Dog bed (large)",105,80,"petBed"],["cat_bed","Cat bed",45,45,"petBed"],["cat_tree_small","Cat tree (small)",50,50,"catTree"],["cat_tree_large","Cat tree (large)",80,60,"catTree"],["litter_box","Litter box",55,40,"box",{r:6,inset:5}],["litter_robot","Self-cleaning litter box",60,70,"circle",{inner:.6}],["dog_crate_small","Dog crate (small)",60,45,"crate"],["dog_crate_medium","Dog crate (medium)",76,53,"crate"],["dog_crate_large","Dog crate (large)",91,61,"crate"],["dog_crate_xl","Dog crate (XL)",107,71,"crate"],["pet_bowls","Pet bowls",50,25,"bowls"],["pet_feeder","Automatic feeder",25,25,"device",{button:!0,r:6}],["pet_fountain","Pet water fountain",25,25,"puck"],["aquarium_20","Aquarium (75 L)",61,30,"aquarium"],["aquarium_55","Aquarium (200 L)",122,33,"aquarium"],["aquarium_75","Aquarium (280 L)",122,46,"aquarium"],["terrarium","Terrarium",90,45,"aquarium"],["bird_cage","Bird cage",60,45,"cage"],["bird_cage_round","Round bird cage",50,50,"cage",{round:!0}],["rabbit_hutch","Rabbit hutch",150,60,"coop"],["small_pet_cage","Small pet cage",80,50,"cage"],["pet_gate","Pet gate",90,5,"rack",{rails:1}],["dog_door","Dog door",35,8,"box",{}],["scratching_post","Scratching post",40,40,"circle",{inner:.4}]]],["decor",[["plant_small","Plant (small)",35,35,"plant",{leaves:6}],["plant_medium","Plant (medium)",55,55,"plant"],["plant_large","Plant (large)",80,80,"plant",{leaves:9}],["fiddle_leaf_fig","Fiddle-leaf fig",70,70,"plant",{leaves:8}],["palm","Palm",100,100,"plant",{leaves:10}],["monstera","Monstera",90,90,"plant",{leaves:7}],["snake_plant","Snake plant",35,35,"cactus"],["cactus","Cactus",30,30,"cactus"],["bonsai","Bonsai",30,25,"tree",{lobes:6}],["hanging_plant","Hanging plant",35,35,"plant",{leaves:6}],["floor_vase","Floor vase",35,35,"circle",{inner:.6}],["sculpture_pedestal","Sculpture pedestal",40,40,"box",{inset:6}],["room_divider_3","Folding screen (3 panels)",150,20,"divider",{panels:3}],["room_divider_4","Folding screen (4 panels)",200,20,"divider",{panels:4}],["room_divider_shelf","Shelving room divider",150,40,"cubby",{cols:4}],["floor_mirror","Floor mirror",70,8,"mirror"],["wall_mirror","Wall mirror",90,4,"mirror"],["grandfather_clock","Grandfather clock",55,30,"clock"],["globe","Floor globe",50,50,"globe"],["area_rug_5x8","Area rug 5×8 ft",152,244,"rug"],["area_rug_6x9","Area rug 6×9 ft",183,274,"rug"],["area_rug_8x10","Area rug 8×10 ft",244,305,"rug"],["area_rug_9x12","Area rug 9×12 ft",274,366,"rug"],["area_rug_160x230","Area rug 160×230",160,230,"rug"],["area_rug_200x300","Area rug 200×300",200,300,"rug"],["rug_round_150","Round rug 1.5 m",150,150,"rug",{round:!0}],["rug_round_200","Round rug 2 m",200,200,"rug",{round:!0}],["rug_round_240","Round rug 2.4 m",240,240,"rug",{round:!0}],["hallway_runner","Hallway runner",75,300,"rug"],["decorative_ladder","Decorative ladder",45,10,"ladder"],["wall_art","Wall art",90,4,"box",{r:1}],["tapestry","Tapestry",150,3,"box",{}],["aquarium_stand","Aquarium stand",125,45,"cabinet",{doors:2}],["candle_stand","Candle stand",25,25,"circle",{inner:.4}],["vase_table","Vase on table",40,40,"pedestalTable"],["coat_stand","Coat stand",50,50,"lamp"],["magazine_basket","Basket",40,30,"trash"],["storage_ottoman","Storage ottoman",80,45,"chest"],["piano_lamp","Piano lamp",30,20,"sconce"],["wall_clock","Wall clock",35,4,"box",{r:2}],["photo_wall","Photo wall",120,3,"box",{dash:!0}],["plant_stand","Plant stand",45,45,"planter",{round:!0}],["window_seat","Window seat",150,50,"bench",{slats:2}],["bean_chair_cluster","Lounge cushions",150,100,"beanbag"],["umbrella_indoor","Indoor tree",120,120,"tree",{lobes:9}],["incense_table","Altar table",100,40,"console"],["meditation_cushion","Meditation cushion",45,45,"ottoman",{round:!0}],["trash_can_small","Waste basket",25,25,"trash",{round:!0}],["trash_can_large","Trash can (large)",45,45,"trash",{round:!0}],["recycle_station","Recycling station",90,35,"cubby",{cols:3}]]]].flatMap(([e,t])=>t.map(([t,i,o,n,s,r,a])=>({id:t,name:i,category:e,w:o,d:n,draw:s,opts:r??{},flip:a??!1}))),At=new Map(Bt.map(e=>[e.id,e]));function Ot(e){return At.get(e)}const Rt=(e,t,i,o,n,s)=>({t:"rect",x:e,y:t,w:i,h:o,r:n,dash:s}),zt=(e,t,i,o,n,s)=>({t:"ellipse",cx:e,cy:t,rx:i,ry:o,rot:n,dash:s}),Dt=(e,t,i,o)=>zt(e,t,i,i,void 0,o),Ht=(e,t,i,o,n)=>({t:"line",x1:e,y1:t,x2:i,y2:o,dash:n}),Wt=(e,t=!0,i)=>({t:"poly",points:e,closed:t,dash:i}),Nt=(e,t)=>({t:"path",d:e,dash:t}),Ut=(e,t,i)=>{const o=e[t];return"number"==typeof o?o:i},Vt=(e,t)=>!0===e[t],Gt=Math.min,Kt=Math.max;function jt(e,t,i){return Array.from({length:i},(o,n)=>e+(t-e)*(n+1)/(i+1))}function qt(e,t,i){return Array.from({length:i},(o,n)=>e+(t-e)*(n+.5)/i)}function Yt(e,t,i,o=42){const n=Math.cos(i),s=Math.sin(i),r=o/2,a=(i,o)=>[e+i*n-o*s,t+i*s+o*n];return[Wt([a(-r,-r),a(r,-r),a(r,r),a(-r,r)]),Wt([a(-r,1-r),a(-r,r-1),a(-r-6,r-3),a(-r-6,3-r)])]}function Xt(e,t,i,o){return[Ht(e,t,e+i,t+o),Ht(e+i,t,e,t+o)]}function Zt(e,t,i){return[Dt(e,t,i),Dt(e,t,.45*i)]}function Qt(e,t,i,o){const n=Array.from({length:o},(n,s)=>{const r=s/o*Math.PI*2;return[e+i*Math.cos(r),t+i*Math.sin(r)]}),s=i*Math.sin(Math.PI/o)*1.15,r=n[0];let a=`M${r[0]},${r[1]}`;for(let e=1;e<=o;e++){const t=n[e%o];a+=` A${s},${s} 0 0 1 ${t[0]},${t[1]}`}return a+" Z"}const Jt={box:(e,t,i)=>{const o=[Rt(0,0,e,t,Ut(i,"r",0),Vt(i,"dash"))];Vt(i,"x")&&o.push(...Xt(0,0,e,t));const n=Ut(i,"inset",0);return n>0&&o.push(Rt(n,n,e-2*n,t-2*n)),o},rounded:(e,t,i)=>[Rt(0,0,e,t,Gt(e,t)*Ut(i,"k",.2))],circle:(e,t,i)=>{const o=[zt(e/2,t/2,e/2,t/2)],n=Ut(i,"inner",0);return n>0&&o.push(zt(e/2,t/2,e/2*n,t/2*n)),Vt(i,"cross")&&o.push(Ht(e/2,0,e/2,t),Ht(0,t/2,e,t/2)),o},cabinet:(e,t,i)=>{const o=Ut(i,"doors",Kt(1,Math.round(e/50))),n=[Rt(0,0,e,t,0,Vt(i,"dash")),Ht(0,t-3,e,t-3)];for(const i of jt(0,e,o-1))n.push(Ht(i,t-3,i,t));return Vt(i,"x")&&n.push(...Xt(0,0,e,t-3)),n},drawers:(e,t,i)=>{const o=Ut(i,"cols",Kt(1,Math.round(e/60))),n=[Rt(0,0,e,t),Ht(0,t-3,e,t-3)];for(const i of jt(0,e,o-1))n.push(Ht(i,t-3,i,t));for(const i of qt(0,e,o))n.push(Ht(i-Gt(8,e/o/4),t-6,i+Gt(8,e/o/4),t-6));return n},wardrobe:(e,t)=>{const i=[Rt(0,0,e,t),Ht(4,t/2,e-4,t/2,!0)];for(let o=10;o<e-6;o+=9)i.push(Ht(o-3,t/2-.3*t,o+3,t/2+.3*t));for(const o of jt(0,e,Kt(1,Math.round(e/50))-1))i.push(Ht(o,t-3,o,t));return i.push(Ht(0,t-3,e,t-3)),i},shelf:(e,t,i)=>{const o=Ut(i,"bay",80),n=[Rt(0,0,e,t)];for(const i of jt(0,e,Kt(0,Math.round(e/o)-1)))n.push(Ht(i,0,i,t));return n.push(Ht(2,.5*t,e-2,.5*t,!0)),n},closetRod:(e,t)=>{const i=[Rt(0,0,e,t,0,!0),Ht(0,.45*t,e,.45*t)];for(let o=6;o<e-4;o+=10)i.push(Ht(o-2,.2*t,o+2,.7*t));return i},cubby:(e,t,i)=>{const o=Ut(i,"cols",Kt(2,Math.round(e/35))),n=[Rt(0,0,e,t)];for(const i of jt(0,e,o-1))n.push(Ht(i,0,i,t));return n},chest:(e,t)=>[Rt(0,0,e,t,3),Ht(0,.25*t,e,.25*t),Rt(e/2-5,t-4,10,4)],bed:(e,t,i)=>{const o=Ut(i,"pillows",e>=120?2:1),n=Gt(8,.05*t),s=[Rt(0,0,e,t,3),Rt(0,0,e,n)],r=(e-12-6*(o-1))/o;for(let e=0;e<o;e++)s.push(Rt(6+e*(r+6),n+5,r,Gt(22,.14*t),5));const a=.33*t;return s.push(Ht(0,a,e,a),Ht(0,a+5,e,a+5)),s.push(Ht(.62*e,a+5,e,a+.18*t)),Vt(i,"bunk")&&s.push(...Xt(0,0,e,t).map(e=>({...e,dash:!0}))),Vt(i,"trundle")&&s.push(Rt(4,.15*t,e-8,.8*t,0,!0)),s},crib:(e,t)=>{const i=[Rt(0,0,e,t,2),Rt(4,4,e-8,t-8,2)];for(let o=8;o<e-4;o+=8)i.push(Ht(o,0,o,4),Ht(o,t-4,o,t));return i},bassinet:(e,t)=>[zt(e/2,t/2,e/2,t/2),zt(e/2,t/2,e/2-5,t/2-5),Ht(.2*e,.2*t,.8*e,.2*t)],sofa:(e,t,i)=>{const o=Ut(i,"seats",3),n=Gt(24,.26*t),s=Vt(i,"noArms")?0:Gt(18,.14*e),r=[Rt(0,0,e,t,6),Ht(s,n,e-s,n)];s>0&&r.push(Ht(s,n,s,t),Ht(e-s,n,e-s,t));for(const i of jt(s,e-s,o-1))r.push(Ht(i,n,i,t-4));return Vt(i,"recliner")&&r.push(Rt(s+4,t,e-2*s-8,30,3,!0)),r},sectional:(e,t,i)=>{const o=Ut(i,"seatDepth",95),n=Ut(i,"chaise",95),s=22,r=[Wt([[0,0],[e,0],[e,o],[n,o],[n,t],[0,t]]),Wt([[e-18,s],[s,s],[s,t]],!1),Ht(e-18,s,e-18,o)],a=Ut(i,"seats",3);for(const t of jt(n,e-18,a-1))r.push(Ht(t,s,t,o-4));return r.push(Ht(s,o,n,o)),r},uSectional:(e,t)=>{const i=95,o=22;return[Wt([[0,0],[e,0],[e,t],[e-i,t],[e-i,i],[i,i],[i,t],[0,t]]),Wt([[o,t],[o,o],[e-o,o],[e-o,t]],!1),Ht(o,i,i,i),Ht(e-i,i,e-o,i)]},chaise:(e,t)=>[Rt(0,0,e,t,8),Nt(`M${.22*e},2 Q${.1*e},${t/2} ${.22*e},${t-2}`),Ht(.6*e,3,.6*e,t-3)],ottoman:(e,t,i)=>Vt(i,"round")?[zt(e/2,t/2,e/2,t/2),zt(e/2,t/2,e/2-6,t/2-6)]:[Rt(0,0,e,t,8),Rt(6,6,e-12,t-12,5)],pouf:(e,t)=>[zt(e/2,t/2,e/2,t/2),...[0,1,2,3].map(i=>Ht(e/2,t/2,e/2+e/2*Math.cos(i*Math.PI/2+.4),t/2+t/2*Math.sin(i*Math.PI/2+.4)))],beanbag:(e,t)=>[Nt(`M${.5*e},0 C${.95*e},0 ${e},${.35*t} ${e},${.6*t} C${e},${.95*t} ${.7*e},${t} ${.45*e},${t} C${.1*e},${t} 0,${.75*t} 0,${.5*t} C0,${.15*t} ${.2*e},0 ${.5*e},0 Z`),zt(.52*e,.58*t,.28*e,.25*t)],chair:(e,t,i)=>{const o=Gt(10,.2*t),n=[Rt(0,o,e,t-o,4),Rt(0,0,e,o,3)];return Vt(i,"arms")&&n.push(Ht(5,o,5,t-4),Ht(e-5,o,e-5,t-4)),Vt(i,"rocker")&&n.push(Nt(`M-2,${o} Q-6,${t/2} -2,${t+6}`),Nt(`M${e+2},${o} Q${e+6},${t/2} ${e+2},${t+6}`)),n},officeChair:(e,t)=>{const i=e/2,o=.55*t,n=.3*Gt(e,t),s=[Dt(i,o,n),Nt(`M${i-n},${o-.6*n} Q${i},${o-1.6*n} ${i+n},${o-.6*n}`)];for(let n=0;n<5;n++){const r=-Math.PI/2+2*n*Math.PI/5+Math.PI/5,a=i+Math.cos(r)*Gt(e,t)*.47,l=o+Math.sin(r)*Gt(e,t)*.45;s.push(Ht(i,o,a,l),Dt(a,l,2.5))}return s},stool:(e,t)=>[zt(e/2,t/2,e/2,t/2),zt(e/2,t/2,.3*e,.3*t)],bench:(e,t,i)=>{const o=[Rt(0,0,e,t,2)];for(const n of jt(0,t,Ut(i,"slats",3)))o.push(Ht(2,n,e-2,n));return Vt(i,"back")&&o.push(Rt(0,0,e,6)),o},table:(e,t,i)=>{const o=Ut(i,"top",0),n=Ut(i,"bottom",0),s=Ut(i,"left",0),r=Ut(i,"right",0),a=s?45:0,l=o?45:0,c=e-a-(r?45:0),d=t-l-(n?45:0),h="oval"===i.shape,u=[h?zt(a+c/2,l+d/2,c/2,d/2):Rt(a,l,c,d,Ut(i,"r",2))];Vt(i,"glass")&&u.push(Rt(a+4,l+4,c-8,d-8,1));const p=h?.18*c:0;for(const e of qt(a+p,a+c-p,o))u.push(...Yt(e,l-10,Math.PI/2));for(const e of qt(a+p,a+c-p,n))u.push(...Yt(e,l+d+10,-Math.PI/2));for(const e of qt(l,l+d,s))u.push(...Yt(a-10,e,0));for(const e of qt(l,l+d,r))u.push(...Yt(a+c+10,e,Math.PI));return u},roundTable:(e,t,i)=>{const o=Ut(i,"chairs",0),n=e/2,s=t/2,r=o>0?Gt(e,t)/2-42:Gt(e,t)/2,a=[Dt(n,s,r)];Vt(i,"pedestal")&&a.push(Dt(n,s,.3*r,!0));for(let e=0;e<o;e++){const t=e/o*Math.PI*2-Math.PI/2,i=r+12;a.push(...Yt(n+Math.cos(t)*i,s+Math.sin(t)*i,t+Math.PI,40))}return a},desk:(e,t,i)=>{const o=Ut(i,"desk",t),n=[Rt(0,0,e,o,2)];return Vt(i,"monitor")&&n.push(Rt(e/2-28,6,56,3),Ht(e/2,9,e/2,16)),Vt(i,"drawers")&&n.push(Rt(e-45,2,42,o-4),Ht(e-45,.5*o,e-3,.5*o)),o<t&&n.push(...Yt(e/2,o+(t-o)/2,-Math.PI/2,Gt(48,t-o))),n},lDesk:(e,t,i)=>{const o=Ut(i,"desk",60),n=[Wt([[0,0],[e,0],[e,o],[o,o],[o,t],[0,t]])];return Vt(i,"chair")&&n.push(...Yt(o+30,o+32,.75*-Math.PI,46)),n},uDesk:(e,t)=>[Wt([[0,0],[e,0],[e,t],[e-60,t],[e-60,60],[60,60],[60,t],[0,t]])],pedestalTable:(e,t)=>[Dt(e/2,t/2,Gt(e,t)/2),Dt(e/2,t/2,.12*Gt(e,t),!0)],console:(e,t)=>[Rt(0,0,e,t,2),Ht(4,t/2,e-4,t/2,!0)],tvStand:(e,t)=>{const i=[Rt(0,0,e,t,2),Ht(0,t-3,e,t-3)];for(const o of jt(0,e,Kt(1,Math.round(e/50))-1))i.push(Ht(o,t-3,o,t));return i},island:(e,t,i)=>{const o=Ut(i,"seats",0),n=o>0?t-45:t,s=[Rt(0,0,e,n,2),Ht(0,3,e,3)];if(o>0){s.push(Ht(0,n-25,e,n-25,!0));for(const t of qt(0,e,o))s.push(Dt(t,n+20,17),Dt(t,n+20,9))}if(Vt(i,"sink")&&s.push(Rt(e/2-35,8,70,40,4)),Vt(i,"hob"))for(const[t,i]of[[.3*e,18],[.3*e,40],[.42*e,18],[.42*e,40]])s.push(Dt(t,i,7));return s},counter:(e,t,i)=>{const o=[Rt(0,0,e,t),Ht(0,t-3,e,t-3)];return Vt(i,"x")&&o.push(...Xt(0,0,e,t-3)),o},sink:(e,t,i)=>{const o=Ut(i,"basins",1),n=[Rt(0,0,e,t)],s=(e-16-6*(o-1))/o;for(let e=0;e<o;e++){const i=8+e*(s+6);n.push(Rt(i,12,s,t-22,5),Dt(i+s/2,12+.6*(t-22),2.5))}return n.push(Ht(e/2,3,e/2,10),Dt(e/2,4,2)),Vt(i,"apron")&&n.push(Ht(0,t-4,e,t-4)),n},range:(e,t,i)=>{const o=Ut(i,"burners",4),n=o>=6||5===o?3:2,s=Vt(i,"noBack")?4:12,r=[Rt(0,0,e,t)];Vt(i,"noBack")||r.push(Ht(0,9,e,9));const a=qt(4,e-4,n),l=qt(s,t-6,2);let c=0;for(const i of l)for(const l of a){if(c++>=o)break;r.push(...Zt(l,i,.34*Gt((e-8)/n,(t-s-6)/2)))}return Vt(i,"griddle")&&r.push(Rt(.38*e,s+4,.24*e,t-s-14,2)),r},fridge:(e,t,i)=>{const o=Ut(i,"doors",1),n=[Rt(0,0,e,t,1),Ht(0,t-5,e,t-5)];return o>=2&&n.push(Ht(e/2,t-5,e/2,t)),o>=2?n.push(Ht(e/2-4,t-9,e/2-4,t-5),Ht(e/2+4,t-9,e/2+4,t-5)):n.push(Ht(e-6,t-9,e-6,t-5)),Vt(i,"x")&&n.push(...Xt(0,0,e,t-5)),n},dishwasher:(e,t)=>[Rt(0,0,e,t),Ht(0,t-3,e,t-3),...Xt(0,0,e,t-3)],appliance:(e,t,i)=>{const o=[Rt(0,0,e,t,Ut(i,"r",2))];return Vt(i,"window")&&o.push(Rt(.08*e,.25*t,.6*e,.6*t,2),Ht(.78*e,.3*t,.78*e,.8*t)),Vt(i,"slots")&&o.push(Rt(.2*e,.2*t,.25*e,.6*t,1),Rt(.55*e,.2*t,.25*e,.6*t,1)),Vt(i,"jug")&&o.push(Dt(.55*e,.55*t,.3*Gt(e,t)),Ht(.15*e,.55*t,.27*e,.55*t)),Vt(i,"bowl")&&o.push(Dt(.45*e,.6*t,.3*Gt(e,t)),Rt(.7*e,0,.3*e,.9*t,3)),Vt(i,"dial")&&o.push(Dt(.5*e,.5*t,.25*Gt(e,t))),o},hood:(e,t)=>[Rt(0,0,e,t,0,!0),Wt([[.35*e,0],[.65*e,0],[.8*e,t],[.2*e,t]],!0,!0)],trash:(e,t,i)=>Vt(i,"round")?[zt(e/2,t/2,e/2,t/2),zt(e/2,t/2,e/2-3,t/2-3),Ht(.3*e,.2*t,.7*e,.2*t)]:[Rt(0,0,e,t,3),Ht(0,.2*t,e,.2*t),Ht(.35*e,.6*t,.65*e,.6*t)],cart:(e,t)=>[Rt(0,0,e,t,2),Rt(4,4,e-8,t-8,1),Dt(4,4,2.5),Dt(e-4,4,2.5),Dt(4,t-4,2.5),Dt(e-4,t-4,2.5)],toilet:(e,t,i)=>{const o=Vt(i,"wallHung")?.12*t:.3*t;return[Rt(.08*e,0,.84*e,o,3),zt(e/2,o+(t-o)/2,.42*e,(t-o)/2),zt(e/2,o+.52*(t-o),.28*e,.36*(t-o))]},bidet:(e,t)=>[Rt(.15*e,0,.7*e,.15*t,2),zt(e/2,.15*t+.425*t,.45*e,.425*t),zt(e/2,.55*t,.25*e,.25*t),Dt(e/2,.2*t,2)],urinal:(e,t)=>[Nt(`M0,0 L${e},0 L${e},${.3*t} Q${e},${t} ${e/2},${t} Q0,${t} 0,${.3*t} Z`),zt(e/2,.45*t,.28*e,.3*t)],vanity:(e,t,i)=>{const o=Ut(i,"basins",1),n=[Rt(0,0,e,t),Ht(0,t-3,e,t-3)];for(const i of qt(0,e,o))n.push(zt(i,.5*t,Gt(22,e/o/2-5),.28*t),Dt(i,.18*t,2));return n},pedestalSink:(e,t)=>[Nt(`M0,0 L${e},0 L${e},${.3*t} Q${e},${t} ${e/2},${t} Q0,${t} 0,${.3*t} Z`),zt(e/2,.45*t,.32*e,.28*t),Dt(e/2,.12*t,2)],bathtub:(e,t,i)=>{const o=[Rt(0,0,e,t,Vt(i,"free")?t/2:2)];if(o.push(Rt(8,8,e-16,t-16,Gt(t/2-8,26))),o.push(Dt(Vt(i,"free")?e/2:20,t/2,3)),Vt(i,"claw"))for(const[i,n]of[[t/2,2],[e-t/2,2],[t/2,t-2],[e-t/2,t-2]])o.push(Dt(i,n,3));if(Vt(i,"jets"))for(const i of[.3*e,.5*e,.7*e])o.push(Dt(i,12,2),Dt(i,t-12,2));return o},cornerTub:(e,t)=>[Nt(`M0,0 L${e},0 L${e},${.35*t} A${.65*e},${.65*t} 0 0 1 ${.35*e},${t} L0,${t} Z`),Nt(`M8,8 L${e-8},8 L${e-8},${.35*t} A${.6*e},${.6*t} 0 0 1 ${.35*e},${t-8} L8,${t-8} Z`),Dt(.3*e,.3*t,3)],shower:(e,t,i)=>{const o=[Rt(0,0,e,t),...Xt(0,0,e,t),Dt(e/2,t/2,3)];return Vt(i,"walkIn")&&o.push(Ht(e,.4*t,e,t,!0)),o},neoAngleShower:(e,t)=>[Wt([[0,0],[e,0],[e,.6*t],[.6*e,t],[0,t]]),Ht(0,0,.8*e,.8*t),Dt(.45*e,.45*t,3)],hotTub:(e,t)=>[Rt(0,0,e,t,20),Rt(14,14,e-28,t-28,14),...[0,1,2,3].map(i=>Dt(i%2?e-22:22,i<2?22:t-22,4))],towelRail:(e,t)=>[Rt(0,0,e,t,1),...jt(0,e,4).map(e=>Ht(e,0,e,t))],washer:(e,t,i)=>{const o=[Rt(0,0,e,t,2),Ht(0,10,e,10),Dt(e/2,(t+10)/2,.33*Gt(e,t-10))];return Vt(i,"dryer")&&o.push(Dt(e/2,(t+10)/2,.22*Gt(e,t-10),!0)),Vt(i,"stack")&&o.push(...Xt(0,10,e,t-10).map(e=>({...e,dash:!0}))),Vt(i,"top")&&o.push(Rt(.15*e,14,.7*e,t-20,3)),o},waterHeater:(e,t,i)=>Vt(i,"tankless")?[Rt(0,0,e,t,2),Rt(.2*e,.25*t,.6*e,.5*t,2),Ht(.3*e,t,.3*e,t+.01)]:[Dt(e/2,t/2,Gt(e,t)/2),Dt(e/2,t/2,.35*Gt(e,t)),Rt(.42*e,-2,.16*e,6),Ht(e/2,t/2,.85*e,.15*t)],furnace:(e,t)=>[Rt(0,0,e,t),...jt(0,e,3).map(e=>Ht(e,4,e,t-4)),Ht(0,t-4,e,t-4)],condenser:(e,t)=>{const i=.4*Gt(e,t),o=[Rt(0,0,e,t,2),Dt(e/2,t/2,i),Dt(e/2,t/2,.18*i)];for(let n=0;n<4;n++)o.push(zt(e/2+Math.cos(n*Math.PI/2+.4)*i*.55,t/2+Math.sin(n*Math.PI/2+.4)*i*.55,.35*i,.15*i,90*n+23));return o},radiator:(e,t)=>{const i=[Rt(0,0,e,t,1)];for(let o=5;o<e-2;o+=5)i.push(Ht(o,1,o,t-1));return i},fireplace:(e,t,i)=>{const o=Vt(i,"noHearth")?0:.3*t,n=t-o,s=[Rt(0,0,e,n),Wt([[.2*e,.25*n],[.8*e,.25*n],[.9*e,n],[.1*e,n]])];return o&&s.push(Rt(-.01,n,e,o,0,!0)),s},stove:(e,t)=>[Dt(e/2,t/2,Gt(e,t)/2),Rt(.3*e,.55*t,.4*e,.3*t,2),Dt(e/2,.15*t,.08*Gt(e,t))],electricalPanel:(e,t)=>{const i=[Rt(0,0,e,t),Rt(3,1,e-6,t-2)];for(const o of jt(3,e-3,Kt(2,Math.round(e/6))))i.push(Ht(o,1,o,t-1));return i},tank:(e,t,i)=>{const o=Ut(i,"tanks",1),n=[Rt(0,0,e,t,0,!0)];for(const i of qt(0,e,o))n.push(Dt(i,t/2,.45*Gt(e/o,t)));return Vt(i,"brine")&&n.push(Rt(.55*e,.1*t,.4*e,.8*t,3)),n},ladder:(e,t)=>{const i=[Ht(0,0,0,t),Ht(e,0,e,t)];for(let o=25;o<t;o+=28)i.push(Ht(0,o,e,o));return i.unshift(Rt(0,0,e,t,0,!0)),i},ironingBoard:(e,t)=>[Nt(`M0,${.1*t} L${.75*e},${.1*t} Q${e},${.5*t} ${.75*e},${.9*t} L0,${.9*t} Z`),Ht(.1*e,t/2,.6*e,t/2,!0)],rack:(e,t,i)=>{const o=[Rt(0,0,e,t,1)];for(const n of jt(0,t,Ut(i,"rails",4)))o.push(Ht(0,n,e,n));return o},tv:(e,t,i)=>{const o=Gt(t,8),n=[Rt(0,0,e,o,1)];return Vt(i,"stand")?n.push(Rt(.35*e,o,.3*e,t-o,3)):n.push(Ht(.05*e,o/2,.95*e,o/2,!0)),n},screen:(e,t)=>[Rt(0,0,e,t,1,!0),Ht(0,t/2,e,t/2)],speaker:(e,t,i)=>{const o=[Rt(0,0,e,t,2),Dt(e/2,.55*t,.32*Gt(e,t))];return Vt(i,"tweeter")&&o.push(Dt(e/2,.15*t,.08*Gt(e,t))),o},soundbar:(e,t)=>[Rt(0,0,e,t,t/2),...qt(4,e-4,Kt(3,Math.round(e/12))).map(e=>Dt(e,t/2,1))],device:(e,t,i)=>{const o=[Rt(0,0,e,t,Ut(i,"r",2))];for(const n of qt(0,e,Ut(i,"antennas",0)))o.push(Ht(n,0,n,-Gt(12,t)));const n=Ut(i,"leds",0);for(const i of qt(.2*e,.8*e,n))o.push(Dt(i,t-2.5,.8));if(Vt(i,"screen")&&o.push(Rt(.1*e,.15*t,.8*e,.6*t,1)),Vt(i,"lens")&&o.push(Dt(e/2,.7*t,.22*Gt(e,t))),Vt(i,"button")&&o.push(Dt(e/2,.65*t,.25*Gt(e,t))),Vt(i,"fan")&&o.push(Dt(e/2,t/2,.3*Gt(e,t))),Vt(i,"rackUnits"))for(const i of jt(0,t,Kt(2,Math.round(t/8))))o.push(Ht(2,i,e-2,i));return Vt(i,"x")&&o.push(...Xt(0,0,e,t)),o},puck:(e,t,i)=>{const o=[zt(e/2,t/2,e/2,t/2),zt(e/2,t/2,.3*e,.3*t)];return Vt(i,"dot")&&o.push(Dt(e/2,t/2,.06*Gt(e,t))),Vt(i,"dash")&&(o[0]=zt(e/2,t/2,e/2,t/2,void 0,!0)),o},laptop:(e,t)=>[Rt(0,.1*t,e,.9*t,2),Rt(0,0,e,.1*t,1),Rt(.1*e,.22*t,.8*e,.4*t,1),Rt(.35*e,.7*t,.3*e,.2*t,1)],monitor:(e,t)=>[Rt(0,0,e,Gt(4,t),1),Rt(.38*e,Gt(4,t),.24*e,t-Gt(4,t),2),Ht(e/2,Gt(4,t),e/2,.5*t)],printer:(e,t)=>[Rt(0,.15*t,e,.85*t,3),Rt(.2*e,0,.6*e,.15*t,1),Ht(.2*e,.8*t,.8*e,.8*t)],projector:(e,t)=>[Rt(0,0,e,t,3),Dt(.7*e,t-4,.15*Gt(e,t)),Ht(.15*e,.3*t,.45*e,.3*t)],ceilingFan:(e,t,i)=>{const o=Ut(i,"blades",4),n=Gt(e,t)/2,s=[Dt(e/2,t/2,.14*n)];for(let i=0;i<o;i++){const r=i/o*360,a=r*Math.PI/180;s.push(zt(e/2+Math.cos(a)*n*.57,t/2+Math.sin(a)*n*.57,.43*n,.11*n,r))}return s.push(Dt(e/2,t/2,n,!0)),s},floorFan:(e,t)=>[Dt(e/2,.45*t,.45*Gt(e,t)),Dt(e/2,.45*t,.1*Gt(e,t)),...[0,120,240].map(i=>zt(e/2+Math.cos(i*Math.PI/180)*Gt(e,t)*.24,.45*t+Math.sin(i*Math.PI/180)*Gt(e,t)*.24,.18*Gt(e,t),.08*Gt(e,t),i)),Rt(.3*e,.85*t,.4*e,.15*t,2)],grille:(e,t,i)=>{const o=[Rt(0,0,e,t,Ut(i,"r",3))];for(const n of jt(0,t,Ut(i,"lines",4)))o.push(Ht(.12*e,n,.88*e,n));return o},lamp:(e,t)=>[Dt(e/2,t/2,Gt(e,t)/2),Ht(e/2-.35*Gt(e,t),t/2-.35*Gt(e,t),e/2+.35*Gt(e,t),t/2+.35*Gt(e,t)),Ht(e/2+.35*Gt(e,t),t/2-.35*Gt(e,t),e/2-.35*Gt(e,t),t/2+.35*Gt(e,t))],arcLamp:(e,t)=>[Dt(.15*e,.8*t,.15*Gt(e,t)),Nt(`M${.15*e},${.8*t} Q${.2*e},0 ${.8*e},${.2*t}`),Dt(.8*e,.3*t,.18*Gt(e,t))],ceilingLight:(e,t)=>{const i=Gt(e,t)/2,o=[Dt(e/2,t/2,.55*i)];for(let n=0;n<8;n++){const s=n/8*Math.PI*2;o.push(Ht(e/2+Math.cos(s)*i*.7,t/2+Math.sin(s)*i*.7,e/2+Math.cos(s)*i,t/2+Math.sin(s)*i))}return o},chandelier:(e,t,i)=>{const o=Ut(i,"arms",6),n=Gt(e,t)/2,s=[Dt(e/2,t/2,.18*n)];for(let i=0;i<o;i++){const r=i/o*Math.PI*2,a=e/2+Math.cos(r)*n*.82,l=t/2+Math.sin(r)*n*.82;s.push(Ht(e/2,t/2,a,l),Dt(a,l,.16*n))}return s},trackLight:(e,t)=>[Rt(0,t/2-1.5,e,3,1),...qt(0,e,Kt(2,Math.round(e/30))).map(e=>Dt(e,t/2,Gt(5,t/2)))],sconce:(e,t)=>[Rt(0,0,e,.3*t),Nt(`M0,${.3*t} Q${e/2},${1.4*t} ${e},${.3*t}`)],plant:(e,t,i)=>{const o=Ut(i,"leaves",7),n=Gt(e,t)/2,s=[Dt(e/2,t/2,.3*n)];for(let i=0;i<o;i++){const r=i/o*360,a=r*Math.PI/180;s.push(zt(e/2+Math.cos(a)*n*.62,t/2+Math.sin(a)*n*.62,.38*n,.16*n,r))}return s},tree:(e,t,i)=>[Nt(Qt(e/2,t/2,Gt(e,t)/2-2,Ut(i,"lobes",9))),Dt(e/2,t/2,.05*Gt(e,t))],cactus:(e,t)=>[Dt(e/2,t/2,Gt(e,t)/2),Dt(e/2,t/2,.25*Gt(e,t)),...[0,1,2,3,4,5].map(i=>Ht(e/2,t/2,e/2+Math.cos(i)*Gt(e,t)*.45,t/2+Math.sin(i)*Gt(e,t)*.45))],mirror:(e,t)=>{const i=[Rt(0,0,e,t,1)];for(let o=4;o<e;o+=8)i.push(Ht(o,t,o+t,0));return i},divider:(e,t,i)=>{const o=Ut(i,"panels",3),n=[];for(let i=0;i<=o;i++)n.push([e*i/o,i%2?t:0]);return[Rt(0,0,e,t,0,!0),Wt(n,!1)]},clock:(e,t)=>[Rt(0,0,e,t,2),Dt(e/2,.55*t,.3*Gt(e,t)),Ht(e/2,.55*t,e/2,.35*t)],globe:(e,t)=>[Dt(e/2,t/2,Gt(e,t)/2),zt(e/2,t/2,.2*Gt(e,t),Gt(e,t)/2),Ht(0,t/2,e,t/2)],rug:(e,t,i)=>{if(Vt(i,"round"))return[zt(e/2,t/2,e/2,t/2),zt(e/2,t/2,e/2-8,t/2-8,void 0,!0)];const o=[Rt(0,0,e,t),Rt(8,8,e-16,t-16,0,!0)];for(let i=4;i<t;i+=6)o.push(Ht(-4,i,0,i),Ht(e,i,e+4,i));return o},grill:(e,t,i)=>{const o=Vt(i,"noShelves")?0:.22*e,n=[Rt(o,0,e-2*o,t,6)];for(const i of jt(o,e-o,5))n.push(Ht(i,6,i,t-6));return o&&n.push(Rt(0,.1*t,o,.8*t,1),Rt(e-o,.1*t,o,.8*t,1)),n},kamado:(e,t)=>[Dt(e/2,t/2,Gt(e,t)/2),Dt(e/2,t/2,.38*Gt(e,t)),...jt(.15*e,.85*e,4).map(e=>Ht(e,.2*t,e,.8*t))],firePit:(e,t,i)=>Vt(i,"square")?[Rt(0,0,e,t,3),Rt(.18*e,.18*t,.64*e,.64*t,2),Rt(.3*e,.3*t,.4*e,.4*t,1,!0)]:[Dt(e/2,t/2,Gt(e,t)/2),Dt(e/2,t/2,.34*Gt(e,t)),Dt(e/2,t/2,.2*Gt(e,t),!0)],umbrella:(e,t)=>{const i=Gt(e,t)/2,o=[Dt(e/2,t/2,i,!0),Dt(e/2,t/2,3)];for(let n=0;n<8;n++)o.push(Ht(e/2,t/2,e/2+Math.cos(n*Math.PI/4)*i,t/2+Math.sin(n*Math.PI/4)*i));return o},cantileverUmbrella:(e,t)=>[Dt(.58*e,t/2,Gt(.42*e,t/2),!0),Rt(0,t/2-15,30,30,2),Ht(15,t/2,.58*e,t/2)],hammock:(e,t)=>[zt(e/2,t/2,.35*e,.4*t),Ht(0,t/2,.15*e,t/2),Ht(.85*e,t/2,e,t/2),Rt(0,0,e,t,0,!0)],swingSet:(e,t,i)=>{const o=Ut(i,"seats",2),n=[Rt(0,0,e,t,0,!0),Ht(0,t/2,e,t/2),Ht(0,0,10,t/2),Ht(0,t,10,t/2),Ht(e,0,e-10,t/2),Ht(e,t,e-10,t/2)];for(const i of qt(20,e-20,o))n.push(Rt(i-22,t/2-8,44,16,3));return n},trampoline:(e,t)=>[Dt(e/2,t/2,Gt(e,t)/2),Dt(e/2,t/2,.42*Gt(e,t)),Dt(e/2,t/2,Gt(e,t)/2-2,!0)],pool:(e,t,i)=>{if(Vt(i,"round"))return[Dt(e/2,t/2,Gt(e,t)/2),Dt(e/2,t/2,Gt(e,t)/2-15)];const o=[Rt(0,0,e,t,20),Rt(15,15,e-30,t-30,12)];for(let e=1;e<=3;e++)o.push(Ht(15+30*e,15,15+30*e,15+.3*t));return o},shed:(e,t)=>[Rt(0,0,e,t),Ht(0,t/2,e,t/2),Ht(.35*e,t,.65*e,t-.01),Rt(.35*e,t-4,.3*e,4)],greenhouse:(e,t)=>{const i=[Rt(0,0,e,t),Ht(0,t/2,e,t/2)];for(const o of jt(0,e,Kt(2,Math.round(e/60))))i.push(Ht(o,0,o,t,!0));return i},raisedBed:(e,t)=>{const i=[Rt(0,0,e,t),Rt(6,6,e-12,t-12)];for(const o of qt(6,e-6,Kt(2,Math.round(e/35))))for(const e of qt(6,t-6,Kt(1,Math.round(t/35))))i.push(Dt(o,e,5));return i},planter:(e,t,i)=>[Vt(i,"round")?zt(e/2,t/2,e/2,t/2):Rt(0,0,e,t,3),...Jt.plant(.8*e,.8*t,{leaves:6}).map(i=>function(e,t,i){switch(e.t){case"rect":return{...e,x:e.x+t,y:e.y+i};case"ellipse":return{...e,cx:e.cx+t,cy:e.cy+i};case"line":return{...e,x1:e.x1+t,y1:e.y1+i,x2:e.x2+t,y2:e.y2+i};case"poly":return{...e,points:e.points.map(([e,o])=>[e+t,o+i])};case"path":return e}}(i,.1*e,.1*t))],compost:(e,t)=>[Rt(0,0,e,t,2),...jt(0,e,3).map(e=>Ht(e,0,e,t)),Ht(0,.15*t,e,.15*t)],picnicTable:(e,t)=>[Rt(0,.28*t,e,.44*t,2),Rt(0,0,e,.2*t,1),Rt(0,.8*t,e,.2*t,1),Ht(.15*e,.28*t,.15*e,.72*t,!0),Ht(.85*e,.28*t,.85*e,.72*t,!0)],mower:(e,t,i)=>Vt(i,"riding")?[Rt(0,0,e,t,15),Rt(.3*e,.45*t,.4*e,.25*t,5),Dt(e/2,.25*t,.12*Gt(e,t)),Rt(-6,.6*t,6,.3*t),Rt(e,.6*t,6,.3*t)]:[Rt(0,.35*t,e,.65*t,6),Dt(e/2,.67*t,.4*Gt(e,.65*t)),Ht(.2*e,.35*t,.3*e,0),Ht(.8*e,.35*t,.7*e,0),Ht(.3*e,0,.7*e,0)],wheelbarrow:(e,t)=>[Wt([[.1*e,.2*t],[.9*e,.2*t],[.75*e,.75*t],[.25*e,.75*t]]),Rt(.45*e,.78*t,.1*e,.22*t,2),Ht(.2*e,.2*t,.15*e,0),Ht(.8*e,.2*t,.85*e,0)],coop:(e,t)=>[Rt(0,0,.45*e,t),Ht(0,t/2,.45*e,t/2),Rt(.45*e,0,.55*e,t,0,!0),...jt(.45*e,e,4).map(e=>Ht(e,0,e,t,!0))],car:(e,t)=>[Rt(.06*e,0,.88*e,t,.22*Gt(e,t)),Nt(`M${.12*e},${.3*t} Q${e/2},${.22*t} ${.88*e},${.3*t}`),Nt(`M${.14*e},${.82*t} Q${e/2},${.88*t} ${.86*e},${.82*t}`),Ht(.12*e,.3*t,.14*e,.82*t),Ht(.88*e,.3*t,.86*e,.82*t),Rt(0,.3*t,.06*e,.05*t,1),Rt(.94*e,.3*t,.06*e,.05*t,1)],motorcycle:(e,t)=>[zt(e/2,t/2,.18*e,t/2),Ht(0,.22*t,e,.22*t),Rt(.4*e,.45*t,.2*e,.22*t,3)],bicycle:(e,t)=>[Rt(.45*e,0,.1*e,.3*t,1),Rt(.45*e,.7*t,.1*e,.3*t,1),Ht(e/2,.3*t,e/2,.7*t),Ht(0,.12*t,e,.12*t),Rt(.42*e,.62*t,.16*e,.06*t,2)],scooter:(e,t)=>[Rt(.3*e,.1*t,.4*e,.8*t,3),Ht(0,.05*t,e,.05*t)],boat:(e,t)=>[Nt(`M0,${t/2} Q${.25*e},0 ${e},${.35*t} L${e},${.65*t} Q${.25*e},${t} 0,${t/2} Z`),zt(.5*e,t/2,.12*e,.2*t)],workbench:(e,t,i)=>{const o=[Rt(0,0,e,t),Ht(0,t-4,e,t-4),Rt(e-22,t-10,18,14,1)];return Vt(i,"pegboard")&&o.push(Ht(0,-6,e,-6,!0)),o},tableSaw:(e,t)=>[Rt(0,0,e,t,1),Rt(e/2-1,.3*t,2,.3*t),Ht(.7*e,0,.7*e,t),Rt(.25*-e,0,.25*e,t,0,!0)],miterSaw:(e,t)=>[Rt(0,0,e,t,2),Dt(e/2,.45*t,.3*Gt(e,t)),Ht(0,.75*t,e,.75*t)],drillPress:(e,t)=>[Rt(0,0,e,t,2),Dt(e/2,.6*t,.25*Gt(e,t)),Rt(.3*e,0,.4*e,.3*t,2)],compressor:(e,t)=>[zt(e/2,.6*t,e/2,.4*t),Rt(.25*e,0,.5*e,.3*t,2),Dt(.2*e,.15*t,.1*Gt(e,t))],generator:(e,t)=>[Rt(0,0,e,t,3),Rt(4,4,e-8,t-8,2),Dt(.3*e,t/2,.22*Gt(e,t)),Ht(.6*e,.3*t,.9*e,.3*t)],treadmill:(e,t)=>[Rt(0,0,e,t,4),Rt(.15*e,.18*t,.7*e,.78*t,2),Rt(0,0,e,.12*t,2)],elliptical:(e,t)=>[Rt(0,0,e,t,e/2),zt(.3*e,.55*t,.12*e,.18*t),zt(.7*e,.55*t,.12*e,.18*t),Rt(.2*e,0,.6*e,.12*t,2)],exerciseBike:(e,t)=>[zt(e/2,t/2,.3*e,t/2),Rt(.35*e,.55*t,.3*e,.15*t,3),Ht(0,.12*t,e,.12*t)],rower:(e,t)=>[Rt(.35*e,0,.3*e,t,3),Rt(.25*e,.55*t,.5*e,.12*t,3),Rt(0,0,e,.15*t,4),Ht(.1*e,.2*t,.9*e,.2*t)],powerRack:(e,t)=>[Rt(0,0,e,t),...[[0,0],[e-8,0],[0,t-8],[e-8,t-8]].map(([e,t])=>Rt(e,t,8,8)),Ht(-10,t/2,e+10,t/2),Rt(-14,t/2-12,4,24),Rt(e+10,t/2-12,4,24)],weightBench:(e,t)=>[Rt(.3*e,0,.4*e,t,4),Ht(0,.18*t,e,.18*t),Rt(0,.18*t-10,5,20),Rt(e-5,.18*t-10,5,20)],dumbbellRack:(e,t)=>{const i=[Rt(0,0,e,t,2)];for(const o of qt(0,e,Kt(3,Math.round(e/18))))i.push(Dt(o,.3*t,4),Dt(o,.7*t,4),Ht(o,.3*t,o,.7*t));return i},poolTable:(e,t)=>[Rt(0,0,e,t,4),Rt(10,10,e-20,t-20),...[[10,10],[e/2,8],[e-10,10],[10,t-10],[e/2,t-8],[e-10,t-10]].map(([e,t])=>Dt(e,t,4))],pingPong:(e,t)=>[Rt(0,0,e,t),Ht(e/2,-6,e/2,t+6),Ht(0,t/2,e,t/2)],foosball:(e,t)=>{const i=[Rt(0,.15*t,e,.7*t,2)];for(const o of jt(0,e,8))i.push(Ht(o,0,o,t),Rt(o-2,.45*t,4,.1*t));return i},airHockey:(e,t)=>[Rt(0,0,e,t,8),Ht(e/2,0,e/2,t),Dt(e/2,t/2,.15*Gt(e,t)),Rt(0,.35*t,3,.3*t),Rt(e-3,.35*t,3,.3*t)],arcade:(e,t)=>[Rt(0,0,e,t,2),Rt(.1*e,.1*t,.8*e,.45*t,2),Ht(0,.7*t,e,.7*t),Dt(.3*e,.82*t,3),Dt(.6*e,.82*t,2),Dt(.72*e,.82*t,2)],piano:(e,t,i)=>{if(Vt(i,"grand"))return[Nt(`M0,0 L${.45*e},0 C${.75*e},0 ${.65*e},${.45*t} ${e},${.65*t} L${e},${t} L0,${t} Z`),Rt(0,.82*t,e,.18*t),...jt(0,e,Math.round(e/3.5)).map(e=>Ht(e,.82*t,e,t))];const o=Gt(16,.3*t),n=[Rt(0,0,e,t),Rt(.04*e,t-o,.92*e,o)];for(const i of jt(.04*e,.96*e,Math.round(e/3.5)))n.push(Ht(i,t-o,i,t));return n},drumKit:(e,t)=>[zt(e/2,.55*t,.18*e,.2*t),Dt(.33*e,.25*t,.1*Gt(e,t)),Dt(.62*e,.22*t,.1*Gt(e,t)),Dt(.78*e,.6*t,.14*Gt(e,t)),Dt(.12*e,.3*t,.16*Gt(e,t),!0),Dt(.88*e,.2*t,.16*Gt(e,t),!0),Dt(.18*e,.68*t,.11*Gt(e,t)),Dt(e/2,.92*t,.07*Gt(e,t))],guitar:(e,t)=>[Dt(e/2,.78*t,.5*Gt(e,.45*t)),Dt(e/2,.52*t,.38*Gt(e,.35*t)),Rt(.45*e,0,.1*e,.45*t),Dt(e/2,.7*t,3)],easel:(e,t)=>[Ht(.1*e,t,e/2,0),Ht(.9*e,t,e/2,0),Ht(e/2,0,e/2,.6*t),Rt(.15*e,.2*t,.7*e,3)],mat:(e,t)=>[Rt(0,0,e,t,3),Nt(`M${e-10},0 Q${e},${t/2} ${e-10},${t}`)],bag:(e,t)=>[Dt(e/2,t/2,Gt(e,t)/2),Dt(e/2,t/2,.3*Gt(e,t))],petBed:(e,t)=>[zt(e/2,t/2,e/2,t/2),zt(e/2,.55*t,.36*e,.33*t)],catTree:(e,t)=>[Rt(0,0,e,t,2),Dt(.35*e,.35*t,.28*Gt(e,t),!0),Dt(.68*e,.65*t,.25*Gt(e,t),!0),Dt(.35*e,.35*t,4),Dt(.68*e,.65*t,4)],crate:(e,t)=>{const i=[Rt(0,0,e,t,2)];for(const o of jt(0,e,Math.round(e/8)))i.push(Ht(o,0,o,t));return i.push(Rt(.3*e,t-3,.4*e,3)),i},bowls:(e,t)=>[Rt(0,0,e,t,t/2),Dt(.28*e,t/2,.35*t),Dt(.72*e,t/2,.35*t)],aquarium:(e,t)=>[Rt(0,0,e,t,1),Rt(3,3,e-6,t-6,0,!0),Nt(`M5,${t/2} Q${.25*e},${.3*t} ${e/2},${t/2} T${e-5},${t/2}`)],cage:(e,t,i)=>{if(Vt(i,"round"))return[Dt(e/2,t/2,Gt(e,t)/2),...[0,1,2,3,4,5].map(i=>Ht(e/2,t/2,e/2+Math.cos(i*Math.PI/3)*Gt(e,t)/2,t/2+Math.sin(i*Math.PI/3)*Gt(e,t)/2))];const o=[Rt(0,0,e,t,2)];for(const i of jt(0,e,Math.round(e/6)))o.push(Ht(i,0,i,t));return o},playpen:(e,t)=>{const i=[Rt(0,0,e,t,3),Rt(5,5,e-10,t-10,2,!0)];for(let o=10;o<e-5;o+=10)i.push(Ht(o,0,o,5),Ht(o,t-5,o,t));return i},changingTable:(e,t)=>[Rt(0,0,e,t),Rt(.08*e,.12*t,.84*e,.76*t,8),Ht(.3*e,.12*t,.3*e,.88*t)],highChair:(e,t)=>[Rt(.15*e,.25*t,.7*e,.6*t,4),Nt(`M${.1*e},${.25*t} Q${e/2},${.05*-t} ${.9*e},${.25*t}`),...[[0,t],[e,t],[0,0],[e,0]].map(([e,t])=>Dt(e,t,2))],teepee:(e,t)=>{const i=Array.from({length:6},(i,o)=>[e/2+Math.cos(o*Math.PI/3)*e/2,t/2+Math.sin(o*Math.PI/3)*t/2]);return[Wt(i),...i.map(([i,o])=>Ht(e/2,t/2,i,o))]},ballPit:(e,t,i)=>{const o=[Vt(i,"round")?zt(e/2,t/2,e/2,t/2):Rt(0,0,e,t,6)];for(const i of qt(.15*e,.85*e,5))for(const e of qt(.15*t,.85*t,4))o.push(Dt(i+7*e%5,e,3.5));return o},stroller:(e,t)=>[Rt(.1*e,.12*t,.8*e,.65*t,8),Ht(0,.02*t,e,.02*t),...[[.05*e,.8*t],[.95*e,.8*t],[.05*e,.12*t],[.95*e,.12*t]].map(([e,t])=>Rt(e-2,t,4,12,1))],dollhouse:(e,t)=>[Rt(0,0,e,t),Ht(0,.3*t,e,.3*t),Ht(e/2,.3*t,e/2,t),Ht(0,.65*t,e,.65*t)],playKitchen:(e,t)=>[Rt(0,0,e,t),Dt(.2*e,.45*t,6),Dt(.38*e,.45*t,6),Rt(.55*e,.2*t,.35*e,.55*t,4)],toyBox:(e,t)=>[Rt(0,0,e,t,3),Ht(0,.2*t,e,.2*t),Dt(e/2,.6*t,.12*Gt(e,t))]};function ei(e,t,i,o={}){return(Jt[e]??Jt.box)(t,i,e in Jt?o:{x:!0})}function ti(e,t){return e.map((e,i)=>{const o=`${e.dash?"fx dash":"fx"}${t&&0===i?" body":""}`;switch(e.t){case"rect":return K`<rect class=${o} x=${e.x} y=${e.y} width=${Kt(.01,e.w)} height=${Kt(.01,e.h)} rx=${e.r??0}></rect>`;case"ellipse":return e.rot?K`<ellipse class=${o} cx=${e.cx} cy=${e.cy} rx=${Kt(.01,e.rx)} ry=${Kt(.01,e.ry)} transform="rotate(${e.rot} ${e.cx} ${e.cy})"></ellipse>`:K`<ellipse class=${o} cx=${e.cx} cy=${e.cy} rx=${Kt(.01,e.rx)} ry=${Kt(.01,e.ry)}></ellipse>`;case"line":return K`<line class=${o} x1=${e.x1} y1=${e.y1} x2=${e.x2} y2=${e.y2}></line>`;case"poly":{const t=e.points.map(([e,t])=>`${e},${t}`).join(" ");return e.closed?K`<polygon class=${o} points=${t}></polygon>`:K`<polyline class=${o} points=${t}></polyline>`}case"path":return K`<path class=${o} d=${e.d}></path>`}})}const ii="\n  .fx {\n    fill: none;\n    stroke: var(--fx-color, currentColor);\n    stroke-width: var(--fx-stroke-width, 1.5px);\n    stroke-linecap: round;\n    stroke-linejoin: round;\n    vector-effect: non-scaling-stroke;\n  }\n  .fx.dash { stroke-dasharray: 4 3; }\n  .fx.body { fill: var(--fx-color, currentColor); fill-opacity: 0.16; }\n",oi=Math.PI/180;function ni(e,t,i){const o=[1,3,5].map(t=>parseInt(e.slice(t,t+2),16)),n=[1,3,5].map(e=>parseInt(t.slice(e,e+2),16));return`#${o.map((e,t)=>Math.round(e+(n[t]-e)*Math.max(0,Math.min(1,i))).toString(16).padStart(2,"0")).join("")}`}function si(e){return e<4?ni("#ff7043","#ff9e40",e/4):e<12?ni("#ff9e40","#ffd180",(e-4)/8):e<30?ni("#ffd180","#fff3c4",(e-12)/18):ni("#fff3c4","#fffbec",(e-30)/30)}function ri(e){return Math.max(0,Math.min(1,(e+4)/14))}const ai=["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"],li=ai.map((e,t)=>({name:e,deg:22.5*t}));function ci(e){const t=Math.round((e%360+360)%360/22.5)%16;return ai[t]}function di(e,t,i){return((Math.atan2(e,-t)/oi+i)%360+360)%360}function hi(e,t){const i=(e-t)*oi;return[Math.sin(i),-Math.cos(i)]}const ui=1e3,pi=750,gi=14,_i="#03a9f4",mi=.18;let fi=class extends de{constructor(){super(...arguments),this.dark=!1,this.rooms=[],this.pins=[],this.walls=[],this.openings=[],this.scale=null,this.unitSystem="metric",this.meshLinks=[],this.meshStubs=[],this.entityLookup=new Map,this.backgroundImageUrl=null,this.backgroundOpacity=.5,this.backgroundOffsetX=0,this.backgroundOffsetY=0,this.backgroundScale=1,this.alignOverlay=null,this.initialViewBox=null,this.sameBuildingAsPrevious=!1,this.mode="select",this.snapMode="all",this.armedEntityId=null,this.armedOpeningType=null,this.selectedRoomId=null,this.editingRoomId=null,this.editingWallId=null,this.selectedPinId=null,this.selectedWallId=null,this.selectedOpeningId=null,this.furniture=[],this.selectedFurnitureId=null,this.armedFurnitureKind=null,this.armedFurnitureRotation=0,this.roomLights=new Map,this.coverOpenness=new Map,this.pinColors=new Map,this.itemStates=new Map,this.showFurniture=!0,this.showLights=!0,this.showCovers=!0,this.northDeg=null,this.location=null,this.sunTime=null,this.overlayButtons=!0,this.readOnly=!1,this.selectedMeshLinkKey=null,this.selectedMeshStubKey=null,this._viewBox={x:0,y:0,w:ui,h:pi},this._naturalHeight=pi,this._alignNaturalHeight=pi,this._pendingTrace=null,this._hoverSnap=null,this._pendingScalePoints=[],this._liveEditPoints=null,this._liveRoomMove=null,this._roomMoveGuides={x:null,y:null},this._gestureCancelled=!1,this._vertexDragStartPoints=null,this._liveDragPin=null,this._liveOpeningEdit=null,this._selectedVertexIndex=null,this._liveFurniture=null,this._now=Date.now(),this._clock=null,this._hoverImage=null,this._pointers=new Map,this._downHit=null,this._downClient=null,this._lastImage=null,this._lastClient=null,this._gesture=null,this._moved=!1,this._hasFittedOnce=!1,this._onPointerDown=e=>{if("mouse"===e.pointerType&&0!==e.button)return;if(at(this),this._svg.setPointerCapture(e.pointerId),this._pointers.set(e.pointerId,{x:e.clientX,y:e.clientY}),2===this._pointers.size){const e=[...this._pointers.values()],[t,i]=e,o={x:(t.x+i.x)/2,y:(t.y+i.y)/2};return void(this._gesture={kind:"pinch",startDistance:je(t.x,t.y,i.x,i.y),startViewBox:{...this._viewBox},midImage:this._clientToImage(o.x,o.y)})}if(this._pointers.size>2)return;const t=this._clientToImage(e.clientX,e.clientY);this._downClient={x:e.clientX,y:e.clientY},this._lastImage=t,this._lastClient={x:e.clientX,y:e.clientY},this._moved=!1,this._gesture=null,this._downHit="select"===this.mode?this._hitTest(e.clientX,e.clientY,t):{type:"empty"}},this._onPointerMove=e=>{if(!this._pointers.has(e.pointerId)){if("wall"===this.mode||"trace"===this.mode){const t=this._clientToImage(e.clientX,e.clientY);this._hoverSnap=this._snappedGeometryPoint(this._pendingTrace?.points??[],t.x,t.y,e.shiftKey)}else this._hoverSnap&&(this._hoverSnap=null);return void("furniture"===this.mode?this._hoverImage=this._clientToImage(e.clientX,e.clientY):this._hoverImage&&(this._hoverImage=null))}if(this._pointers.set(e.pointerId,{x:e.clientX,y:e.clientY}),"pinch"===this._gesture?.kind&&2===this._pointers.size){const e=[...this._pointers.values()],[t,i]=e,o=je(t.x,t.y,i.x,i.y)||1,n=this._gesture.startDistance/o,s=this._gesture.startViewBox,r=qe(s.w*n,250,4e3),a=r/s.w,l=s.h*a,{x:c,y:d}=this._gesture.midImage;return void(this._viewBox={x:c-(c-s.x)*a,y:d-(d-s.y)*a,w:r,h:l})}if(1!==this._pointers.size||!this._downClient||!this._lastImage)return;if(this._gestureCancelled)return;if(!this._moved){if(je(this._downClient.x,this._downClient.y,e.clientX,e.clientY)<5)return;this._moved=!0,this._gesture=this._lockGesture(),"pan"!==this._gesture?.kind&&"alignDrag"!==this._gesture?.kind||(this._svg.style.cursor="grabbing")}const t=this._clientToImage(e.clientX,e.clientY);if("pan"===this._gesture?.kind){const t=this._svgTransform().scale||1,i=this._lastClient??{x:e.clientX,y:e.clientY};this._viewBox={...this._viewBox,x:this._viewBox.x-(e.clientX-i.x)/t,y:this._viewBox.y-(e.clientY-i.y)/t}}else if("alignDrag"===this._gesture?.kind){const t=this._svgTransform().scale||1,i=this._lastClient??{x:e.clientX,y:e.clientY};this.dispatchEvent(new CustomEvent("align-drag",{detail:{dx:(e.clientX-i.x)/t,dy:(e.clientY-i.y)/t}}))}else if("vertex"===this._gesture?.kind&&this._liveEditPoints){const i="room"===this._editingTarget?.kind,[o,n]=this._snappedVertexPoint(this._liveEditPoints,this._gesture.index,t.x,t.y,i,e.shiftKey),s=[...this._liveEditPoints];s[this._gesture.index]=[o,n],this._liveEditPoints=s}else if("pin"===this._gesture?.kind)this._liveDragPin={id:this._gesture.pinId,x:t.x,y:t.y};else if("furnitureMove"===this._gesture?.kind){const e=this._gesture,i=this.furniture.find(t=>t.id===e.id);i&&(this._liveFurniture={id:i.id,x:i.x+t.x-e.startX,y:i.y+t.y-e.startY,rotation_deg:i.rotation_deg,width_cm:i.width_cm,depth_cm:i.depth_cm})}else if("furnitureHandle"===this._gesture?.kind){const i=this._gesture,o=this.furniture.find(e=>e.id===i.id);o&&(this._liveFurniture=this._furnitureHandleEdit(o,i.handle,t,e.shiftKey))}else if("roomMove"===this._gesture?.kind){let i=t.x-this._gesture.startX,o=t.y-this._gesture.startY;const n=this._pxToUnits(10);let s={x:null,y:null};if(Math.hypot(i,o)<=n)i=0,o=0;else if(!e.shiftKey){const e=this._snapRoomMove(this._gesture.roomId,i,o,n);i=e.dx,o=e.dy,s=e.guides}this._liveRoomMove={id:this._gesture.roomId,dx:i,dy:o},this._roomMoveGuides=s}else if("roomLabel"===this._gesture?.kind)this._liveRoomLabel={id:this._gesture.roomId,x:t.x,y:t.y};else if("openingMove"===this._gesture?.kind){const e=this._gesture,i=this.openings.find(t=>t.id===e.openingId),o=i&&this.walls.find(e=>e.id===i.wallId);if(i&&o){const e=this._effectivePoints("wall",o.id,o.points),{point:n}=ot(e,t.x,t.y);this._liveOpeningEdit={id:i.id,x:n[0],y:n[1],width:i.width}}}else if("openingHandle"===this._gesture?.kind){const e=this._gesture,i=this.openings.find(t=>t.id===e.openingId),o=i&&this.walls.find(e=>e.id===i.wallId),n=i&&this._openingEndpoints(i);if(i&&o&&n){const s=this._effectivePoints("wall",o.id,o.points),{point:r}=ot(s,t.x,t.y),a=n[0===e.whichEnd?1:0],l=[(a[0]+r[0])/2,(a[1]+r[1])/2],c=je(a[0],a[1],r[0],r[1]);this._liveOpeningEdit={id:i.id,x:l[0],y:l[1],width:c}}}this._lastImage=this._clientToImage(e.clientX,e.clientY),this._lastClient={x:e.clientX,y:e.clientY}},this._onPointerLeave=()=>{this._hoverSnap=null,this._hoverImage=null},this._onPointerUp=e=>{this._pointers.delete(e.pointerId),this._svg.style.cursor="";try{this._svg.releasePointerCapture(e.pointerId)}catch{}this._pointers.size>=1?this._gesture=null:(this._gestureCancelled||(this._moved?this._commitGesture():this._downClient&&this._handleClick(this._downClient.x,this._downClient.y,e.shiftKey)),this._gesture=null,this._downHit=null,this._downClient=null,this._moved=!1,this._gestureCancelled=!1,this._vertexDragStartPoints=null)},this._onWheel=e=>{if(e.preventDefault(),e.ctrlKey){const t=e.deltaY<0?.9:1.1;return void this._zoomBy(t,this._clientToImage(e.clientX,e.clientY))}const t=this._viewBox.w/this.getBoundingClientRect().width;this._viewBox={...this._viewBox,x:this._viewBox.x+e.deltaX*t,y:this._viewBox.y+e.deltaY*t}},this._liveRoomLabel=null,this._pinIcons=new Ft(this)}get _editingTarget(){return this.editingRoomId?{kind:"room",id:this.editingRoomId}:this.editingWallId?{kind:"wall",id:this.editingWallId}:null}_rawPointsFor(e){return"room"===e.kind?this.rooms.find(t=>t.id===e.id)?.points??null:this.walls.find(t=>t.id===e.id)?.points??null}willUpdate(e){if(e.has("editingRoomId")||e.has("editingWallId")){const e=this._editingTarget,t=e?this._rawPointsFor(e):null;this._liveEditPoints=t?[...t]:null,this._selectedVertexIndex=null}e.has("mode")&&(this._pendingTrace=null,this._pendingScalePoints=[])}firstUpdated(){this.fitToScreen(),this._hasFittedOnce=null!==this._contentBounds()||!this.backgroundImageUrl,this._resizeObserver=new ResizeObserver(()=>this.requestUpdate()),this._resizeObserver.observe(this)}connectedCallback(){super.connectedCallback(),this._clock=setInterval(()=>{null!==this.northDeg&&this.location&&(this._now=Date.now())},6e4)}disconnectedCallback(){super.disconnectedCallback(),this._clock&&clearInterval(this._clock),this._clock=null,this._resizeObserver?.disconnect()}updated(e){if(e.has("backgroundImageUrl")&&this.backgroundImageUrl){const e=new Image;e.onload=()=>{this._naturalHeight=e.naturalHeight/e.naturalWidth*ui||pi,this._hasFittedOnce||(this.fitToScreen(),this._hasFittedOnce=!0)},e.src=this.backgroundImageUrl}if(e.has("initialViewBox")){const e=this.initialViewBox,t=this._viewBox;e&&e.x===t.x&&e.y===t.y&&e.w===t.w&&e.h===t.h?this._hasFittedOnce=!0:e?(this._viewBox={...e},this._hasFittedOnce=!0):this.sameBuildingAsPrevious||(this.fitToScreen(),this._hasFittedOnce=null!==this._contentBounds()||!this.backgroundImageUrl)}if(e.has("alignOverlay")){const t=e.get("alignOverlay");if(this.alignOverlay&&this.alignOverlay.imageUrl!==t?.imageUrl){const e=new Image;e.onload=()=>{this._alignNaturalHeight=e.naturalHeight/e.naturalWidth*ui||pi},e.src=this.alignOverlay.imageUrl}}if(e.has("_pendingTrace")||e.has("_pendingScalePoints")){const e="scale"===this.mode?this._pendingScalePoints.length:this._pendingTrace?.points.length??0;this.dispatchEvent(new CustomEvent("pending-changed",{detail:{count:e}}))}}_contentBounds(){const e=[];for(const t of this.rooms)e.push(...t.points);for(const t of this.walls)e.push(...t.points);for(const t of this.pins)e.push([t.x,t.y]);if(0===e.length)return null;const t=e.map(([e])=>e),i=e.map(([,e])=>e),o=Math.min(...t),n=Math.max(...t),s=Math.min(...i),r=Math.max(...i),a=.08*Math.max(n-o,r-s)||40;return{x:o-a,y:s-a,w:n-o+2*a,h:r-s+2*a}}fitToScreen(){this._viewBox=this._contentBounds()??{x:0,y:0,w:ui,h:this._naturalHeight}}getViewBox(){return{...this._viewBox}}_svgTransform(){const e=this._svg?.getBoundingClientRect(),t=e?.width||this._viewBox.w,i=e?.height||this._viewBox.h,o=Math.min(t/this._viewBox.w,i/this._viewBox.h)||1;return{scale:o,offsetX:(t-this._viewBox.w*o)/2,offsetY:(i-this._viewBox.h*o)/2}}_pxToUnits(e){return e/this._svgTransform().scale}_clientToImage(e,t){const i=this._svg,o=i.createSVGPoint();o.x=e,o.y=t;const n=i.getScreenCTM();if(!n)return{x:0,y:0};const s=o.matrixTransform(n.inverse());return{x:s.x,y:s.y}}_effectivePoints(e,t,i){const o=this._editingTarget;if(o&&o.kind===e&&o.id===t&&this._liveEditPoints)return this._liveEditPoints;const n=this._liveRoomMove;return"room"===e&&n?.id===t?i.map(([e,t])=>[e+n.dx,t+n.dy]):i}get _displayPins(){const e=this._liveRoomMove;return e?this.pins.map(t=>t.room_id===e.id?{...t,x:t.x+e.dx,y:t.y+e.dy}:t):this.pins}_snappedTracePoint(e,t,i,o){if(o||0===e.length)return{point:[t,i],lockedX:!1,lockedY:!1};const n=this._pxToUnits(10),s=e[e.length-1],r=e[0],a=e.length>=3&&(r[0]!==s[0]||r[1]!==s[1])?[s,r]:[s];let l=null,c=1/0,d=null,h=1/0;for(const[e,o]of a){const s=Math.abs(t-e),r=Math.abs(i-o);s>n&&r>n||(s<=r?s<c&&(l=e,c=s):r<h&&(d=o,h=r))}return{point:[l??t,d??i],lockedX:null!==l,lockedY:null!==d}}_snappedVertexPoint(e,t,i,o,n,s){if(s||"off"===this.snapMode)return[i,o];const r=this._pxToUnits(10),a=t>0?t-1:n?e.length-1:-1;if(a>=0&&a!==t)return st(e[a],[i,o],r);const l=t<e.length-1?t+1:n?0:-1;return l>=0&&l!==t?st(e[l],[i,o],r):[i,o]}_effectiveOpening(e){return this._liveOpeningEdit?.id===e.id?{...e,x:this._liveOpeningEdit.x,y:this._liveOpeningEdit.y,width:this._liveOpeningEdit.width}:e}get unitsPerCm(){if(this.scale&&this.scale.meters>0){const[[e,t],[i,o]]=this.scale.points,n=je(e,t,i,o);if(n>0)return n/this.scale.meters/100}return.5}_effectiveFurniture(e){const t=this._liveFurniture;return t?.id===e.id?{...e,...t}:e}_furnitureToImage(e,t,i){const o=this.unitsPerCm,n=e.rotation_deg*Math.PI/180,s=Math.cos(n),r=Math.sin(n);return[e.x+(t*s-i*r)*o,e.y+(t*r+i*s)*o]}_imageToFurniture(e,t,i){const o=this.unitsPerCm,n=e.rotation_deg*Math.PI/180,s=Math.cos(n),r=Math.sin(n),a=(t-e.x)/o,l=(i-e.y)/o;return[a*s+l*r,-a*r+l*s]}_furnitureAt(e,t,i=!1){const o=this._pxToUnits(3)/this.unitsPerCm;let n=null;for(const s of this.furniture){if(i&&!s.entity_id)continue;const r=this._effectiveFurniture(s),[a,l]=this._imageToFurniture(r,e,t);Math.abs(a)<=r.width_cm/2+o&&Math.abs(l)<=r.depth_cm/2+o&&(!n||r.width_cm*r.depth_cm<n.width_cm*n.depth_cm)&&(n=s)}return n}_furnitureHandles(e){const t=this._effectiveFurniture(e),i=t.width_cm/2,o=t.depth_cm/2,n=this._pxToUnits(26)/this.unitsPerCm;return{rotate:this._furnitureToImage(t,0,-o-n),corner:this._furnitureToImage(t,i,o),right:this._furnitureToImage(t,i,0),bottom:this._furnitureToImage(t,0,o)}}_furnitureHandleEdit(e,t,i,o){const n={id:e.id,x:e.x,y:e.y,rotation_deg:e.rotation_deg,width_cm:e.width_cm,depth_cm:e.depth_cm};if("rotate"===t){let t=180*Math.atan2(i.y-e.y,i.x-e.x)/Math.PI+90;return o||(t=15*Math.round(t/15)),{...n,rotation_deg:(t%360+360)%360}}const[s,r]=this._imageToFurniture(e,i.x,i.y),a=e=>Math.max(5,o?e:Math.round(e)),l="bottom"===t?e.width_cm:a(s+e.width_cm/2),c="right"===t?e.depth_cm:a(r+e.depth_cm/2),[d,h]=this._furnitureToImage(e,(l-e.width_cm)/2,(c-e.depth_cm)/2);return{...n,x:d,y:h,width_cm:l,depth_cm:c}}_openingEndpoints(e){const t=this.walls.find(t=>t.id===e.wallId);if(!t)return null;const i=this._effectivePoints("wall",t.id,t.points),o=this._effectiveOpening(e);return rt(o.x,o.y,o.width,i)}_snappedGeometryPoint(e,t,i,o){const n=o||"off"===this.snapMode;if(!n){const e=this._pxToUnits(gi),o="all"===this.snapMode||"wall"===this.mode,n="all"===this.snapMode||"trace"===this.mode;let s=null;for(const n of o?this.walls:[]){const o=parseFloat(this._wallStrokeWidth(n,Ee(n.material)))/2,r=Math.max(e,o);if(et(t,i,n.points)>r)continue;const a=ot(n.points,t,i).point,l=je(t,i,a[0],a[1]);(!s||l<s.dist)&&(s={point:a,dist:l})}const r=n?function(e,t,i,o){let n=null,s=o;for(const o of e){if(o.points.length<2)continue;const{point:e}=nt(o.points,t,i),r=je(t,i,e[0],e[1]);r<=s&&(n=o,s=r)}return n}(this.rooms,t,i,e):null;if(r){const e=nt(r.points,t,i).point,o=je(t,i,e[0],e[1]);(!s||o<s.dist)&&(s={point:e,dist:o})}if(s)return{point:s.point,kind:"geometry",lockedX:!1,lockedY:!1}}const{point:s,lockedX:r,lockedY:a}=this._snappedTracePoint(e,t,i,n);return{point:s,kind:r||a?"axis":"none",lockedX:r,lockedY:a}}_hitTest(e,t,i){const o=this._pxToUnits(gi);if("select"!==this.mode)return{type:"empty"};const n=this._editingTarget;if(n&&this._liveEditPoints){const e=this._liveEditPoints,t=Pt(e,i.x,i.y,o);if(null!==t)return{type:"vertex",index:t};const s=Pt("room"===n.kind?tt(e):it(e),i.x,i.y,o);if(null!==s)return{type:"edgeMidpoint",index:s};const r="room"===n.kind?this.rooms.find(e=>e.id===n.id):void 0;return r&&this._roomLabelHit(r,i,o)?{type:"roomLabel",room:r}:{type:"empty"}}const s=this.rooms.find(e=>e.id===this.selectedRoomId);if(s&&this._roomLabelHit(s,i,o))return{type:"roomLabel",room:s};const r=Mt(this.pins,i.x,i.y,o);if(r.length>1)return{type:"pinStack",pins:r};if(1===r.length)return{type:"pin",pin:r[0]};const a=function(e,t,i,o){let n=null,s=o;for(const o of e){const e=et(t,i,[[o.fromPin.x,o.fromPin.y],[o.toPin.x,o.toPin.y]]);e<=s&&(n=o,s=e)}return n}(this.meshLinks,i.x,i.y,o);if(a)return{type:"meshLink",link:a};const l=function(e,t,i,o){let n=null,s=o;for(const o of e){const e=Math.min(je(o.x,o.y,t,i),et(t,i,[[o.fromPin.x,o.fromPin.y],[o.x,o.y]]));e<=s&&(n=o,s=e)}return n}(this.meshStubs,i.x,i.y,o);if(l)return{type:"meshStub",stub:l};if(this.showFurniture&&this.readOnly){const e=this._furnitureAt(i.x,i.y,!0);if(e)return{type:"furniture",item:e}}if(this.showFurniture&&!this.readOnly){const e=this.furniture.find(e=>e.id===this.selectedFurnitureId);if(e&&!e.locked){const t=this._furnitureHandles(e);for(const n of["rotate","corner","right","bottom"]){const[s,r]=t[n];if(je(s,r,i.x,i.y)<=o)return{type:"furnitureHandle",item:e,handle:n}}}const t=this._furnitureAt(i.x,i.y);if(t)return{type:"furniture",item:t}}if(this.selectedOpeningId){const e=this.openings.find(e=>e.id===this.selectedOpeningId),t=e?this._openingEndpoints(e):null;if(e&&t){const n=Pt(t,i.x,i.y,o);if(null!==n)return{type:"openingHandle",opening:e,whichEnd:n}}}const c=function(e,t,i,o,n){let s=null,r=n;for(const n of e){const e=t.find(e=>e.id===n.wallId);if(!e)continue;const a=rt(n.x,n.y,n.width,e.points);if(!a)continue;const l=et(i,o,a);l<=r&&(s=n,r=l)}return s}(this.openings,this.walls,i.x,i.y,o);if(c)return{type:"opening",opening:c};const d=St(this.walls,i.x,i.y,o);if(d)return{type:"wall",wall:d};const h=this.rooms.find(e=>e.points.length>=3&&Ye(i.x,i.y,e.points));return h?{type:"room",room:h}:{type:"empty"}}_lockGesture(){return"align"===this.mode?{kind:"alignDrag"}:this.readOnly?{kind:"pan"}:"furnitureHandle"===this._downHit?.type?{kind:"furnitureHandle",id:this._downHit.item.id,handle:this._downHit.handle}:"furniture"===this._downHit?.type&&!this._downHit.item.locked&&this._lastImage?{kind:"furnitureMove",id:this._downHit.item.id,startX:this._lastImage.x,startY:this._lastImage.y}:"vertex"===this._downHit?.type?(this._vertexDragStartPoints=this._liveEditPoints?[...this._liveEditPoints]:null,{kind:"vertex",index:this._downHit.index}):"pin"===this._downHit?.type?{kind:"pin",pinId:this._downHit.pin.id}:"roomLabel"===this._downHit?.type?{kind:"roomLabel",roomId:this._downHit.room.id}:"room"===this._downHit?.type&&this._downHit.room.id===this.selectedRoomId&&this._lastImage?{kind:"roomMove",roomId:this._downHit.room.id,startX:this._lastImage.x,startY:this._lastImage.y}:"openingHandle"===this._downHit?.type?{kind:"openingHandle",openingId:this._downHit.opening.id,whichEnd:this._downHit.whichEnd}:"opening"===this._downHit?.type?{kind:"openingMove",openingId:this._downHit.opening.id}:{kind:"pan"}}_dispatchVertexChanged(e){const t=this._editingTarget;if(!t)return;const i="room"===t.kind?"room-vertex-changed":"wall-vertex-changed",o="room"===t.kind?"roomId":"wallId";this.dispatchEvent(new CustomEvent(i,{detail:{[o]:t.id,points:e}}))}_commitGesture(){if(("furnitureMove"===this._gesture?.kind||"furnitureHandle"===this._gesture?.kind)&&this._liveFurniture){const e=this._liveFurniture;this._liveFurniture=null;const t=this.furniture.find(t=>t.id===e.id);return void((!t||t.x!==e.x||t.y!==e.y||t.rotation_deg!==e.rotation_deg||t.width_cm!==e.width_cm||t.depth_cm!==e.depth_cm)&&this.dispatchEvent(new CustomEvent("furniture-update",{detail:e})))}if("vertex"===this._gesture?.kind&&this._editingTarget&&this._liveEditPoints)this._dispatchVertexChanged(this._liveEditPoints);else if("pin"===this._gesture?.kind&&this._liveDragPin)this.dispatchEvent(new CustomEvent("pin-move",{detail:{pinId:this._liveDragPin.id,x:this._liveDragPin.x,y:this._liveDragPin.y}})),this._liveDragPin=null;else if("roomMove"===this._gesture?.kind&&this._liveRoomMove){const{dx:e,dy:t}=this._liveRoomMove;if(this._roomMoveGuides={x:null,y:null},0===e&&0===t)return void(this._liveRoomMove=null);this.dispatchEvent(new CustomEvent("room-move",{detail:{roomId:this._liveRoomMove.id,dx:this._liveRoomMove.dx,dy:this._liveRoomMove.dy}})),this._liveRoomMove=null}else"roomLabel"===this._gesture?.kind&&this._liveRoomLabel?(this.dispatchEvent(new CustomEvent("room-label-moved",{detail:{roomId:this._liveRoomLabel.id,x:this._liveRoomLabel.x,y:this._liveRoomLabel.y}})),this._liveRoomLabel=null):"openingMove"!==this._gesture?.kind&&"openingHandle"!==this._gesture?.kind||!this._liveOpeningEdit||(this.dispatchEvent(new CustomEvent("opening-update",{detail:{openingId:this._liveOpeningEdit.id,x:this._liveOpeningEdit.x,y:this._liveOpeningEdit.y,width:this._liveOpeningEdit.width}})),this._liveOpeningEdit=null)}_handleClick(e,t,i=!1){const o=this._clientToImage(e,t);if("trace"===this.mode){const e=this._pxToUnits(gi),t=this._pendingTrace??{points:[]},{point:[n,s]}=this._snappedGeometryPoint(t.points,o.x,o.y,i),r=It(t,n,s,e);return void(r.closed?(this.dispatchEvent(new CustomEvent("room-trace-complete",{detail:{points:t.points}})),this._pendingTrace=null):this._pendingTrace=r.trace)}if("wall"===this.mode){const e=this._pxToUnits(gi),t=this._pendingTrace??{points:[]},{point:[n,s]}=this._snappedGeometryPoint(t.points,o.x,o.y,i),r=It(t,n,s,e);return void(r.closed?(this.dispatchEvent(new CustomEvent("wall-trace-complete",{detail:{points:[...t.points,t.points[0]]}})),this._pendingTrace=null):this._pendingTrace=r.trace)}if("opening"===this.mode){if(!this.armedOpeningType)return;const e=this._pxToUnits(gi),t=St(this.walls,o.x,o.y,e);if(!t)return;const{point:i}=ot(t.points,o.x,o.y);return void this.dispatchEvent(new CustomEvent("opening-place",{detail:{wallId:t.id,x:i[0],y:i[1]}}))}if("furniture"===this.mode)return void(this.armedFurnitureKind&&this.dispatchEvent(new CustomEvent("furniture-place",{detail:{x:o.x,y:o.y,keepArmed:i}})));if("scale"===this.mode){const e=[...this._pendingScalePoints,[o.x,o.y]];return void(e.length>=2?(this.dispatchEvent(new CustomEvent("scale-line-complete",{detail:{points:e.slice(0,2)}})),this._pendingScalePoints=[]):this._pendingScalePoints=e)}if("place"===this.mode){if(this.armedEntityId){const e=this._pxToUnits(gi),t=Mt(this.pins,o.x,o.y,e)[0],i=t?.x??o.x,n=t?.y??o.y;this.dispatchEvent(new CustomEvent("pin-place",{detail:{x:i,y:n}}))}return}const n=this._downHit??{type:"empty"};if(this.readOnly){const e="furniture"===n.type?{kind:"furniture",id:n.item.id}:"pin"===n.type?{kind:"pin",id:n.pin.id}:"pinStack"===n.type?{kind:"pin",id:n.pins[0].id}:"opening"===n.type?{kind:"opening",id:n.opening.id}:"room"===n.type||"roomLabel"===n.type?{kind:"room",id:n.room.id}:null;return void(e&&this.dispatchEvent(new CustomEvent("plan-tap",{detail:e})))}if("furniture"!==n.type){if("furnitureHandle"!==n.type)if("vertex"===n.type)this._selectedVertexIndex=this._selectedVertexIndex===n.index?null:n.index;else if("edgeMidpoint"===n.type&&this._editingTarget&&this._liveEditPoints){const e=("room"===this._editingTarget.kind?tt(this._liveEditPoints):it(this._liveEditPoints))[n.index],t=[...this._liveEditPoints];t.splice(n.index+1,0,e),this._liveEditPoints=t,this._dispatchVertexChanged(t)}else if("pin"===n.type)this.dispatchEvent(new CustomEvent("pin-select",{detail:{pinId:this.selectedPinId===n.pin.id?null:n.pin.id}}));else if("pinStack"===n.type)this.dispatchEvent(new CustomEvent("pin-stack-select",{detail:{pinIds:n.pins.map(e=>e.id)}}));else if("roomLabel"===n.type&&this._editingTarget);else if("room"===n.type||"roomLabel"===n.type)this.dispatchEvent(new CustomEvent("room-select",{detail:{roomId:this.selectedRoomId===n.room.id?null:n.room.id}}));else if("wall"===n.type)this.dispatchEvent(new CustomEvent("wall-select",{detail:{wallId:this.selectedWallId===n.wall.id?null:n.wall.id}}));else if("opening"===n.type)this.dispatchEvent(new CustomEvent("opening-select",{detail:{openingId:this.selectedOpeningId===n.opening.id?null:n.opening.id}}));else if("meshLink"===n.type){const e=`${n.link.fromPin.id}|${n.link.toPin.id}`;this.dispatchEvent(new CustomEvent("mesh-link-select",{detail:{link:this.selectedMeshLinkKey===e?null:n.link}}))}else if("meshStub"===n.type){const e=`${n.stub.fromPin.id}|${n.stub.targetDeviceId}`;this.dispatchEvent(new CustomEvent("mesh-stub-select",{detail:{stub:this.selectedMeshStubKey===e?null:n.stub}}))}else if(this._editingTarget&&null!==this._selectedVertexIndex&&this._liveEditPoints){const e="room"===this._editingTarget.kind,[t,n]=this._snappedVertexPoint(this._liveEditPoints,this._selectedVertexIndex,o.x,o.y,e,i),s=[...this._liveEditPoints];s[this._selectedVertexIndex]=[t,n],this._liveEditPoints=s,this._selectedVertexIndex=null,this._dispatchVertexChanged(s)}else this._selectedVertexIndex=null,this.dispatchEvent(new CustomEvent("room-select",{detail:{roomId:null}})),this.dispatchEvent(new CustomEvent("pin-select",{detail:{pinId:null}})),this.dispatchEvent(new CustomEvent("wall-select",{detail:{wallId:null}})),this.dispatchEvent(new CustomEvent("opening-select",{detail:{openingId:null}})),this.dispatchEvent(new CustomEvent("furniture-select",{detail:{furnitureId:null}})),this.dispatchEvent(new CustomEvent("mesh-link-select",{detail:{link:null}})),this.dispatchEvent(new CustomEvent("mesh-stub-select",{detail:{stub:null}}))}else this.dispatchEvent(new CustomEvent("furniture-select",{detail:{furnitureId:this.selectedFurnitureId===n.item.id?null:n.item.id}}))}finishPendingWall(){"wall"!==this.mode||!this._pendingTrace||this._pendingTrace.points.length<2||(this.dispatchEvent(new CustomEvent("wall-trace-complete",{detail:{points:this._pendingTrace.points}})),this._pendingTrace=null)}cancelGesture(){const e=this._gesture?.kind;return!(!this._moved||!e||"pan"===e||"pinch"===e||"alignDrag"===e)&&("vertex"===e&&this._vertexDragStartPoints&&(this._liveEditPoints=this._vertexDragStartPoints),this._liveRoomMove=null,this._roomMoveGuides={x:null,y:null},this._liveDragPin=null,this._liveRoomLabel=null,this._liveOpeningEdit=null,this._liveFurniture=null,this._gesture=null,this._gestureCancelled=!0,this._svg.style.cursor="",!0)}_snapRoomMove(e,t,i,o){const n=this.rooms.find(t=>t.id===e);if(!n)return{dx:t,dy:i,guides:{x:null,y:null}};const s=[...this.rooms.filter(t=>t.id!==e).flatMap(e=>e.points),...this.walls.flatMap(e=>e.points)];let r=null,a=null;for(const[e,l]of n.points){const n=e+t,c=l+i;for(const[e,t]of s){const i=e-n;Math.abs(i)<=o&&(!r||Math.abs(i)<Math.abs(r.delta))&&(r={delta:i,at:e});const s=t-c;Math.abs(s)<=o&&(!a||Math.abs(s)<Math.abs(a.delta))&&(a={delta:s,at:t})}}return{dx:t+(r?.delta??0),dy:i+(a?.delta??0),guides:{x:r?.at??null,y:a?.at??null}}}undoLastPoint(){if("scale"===this.mode&&this._pendingScalePoints.length>0)return this._pendingScalePoints=this._pendingScalePoints.slice(0,-1),!0;const e=this._pendingTrace?.points;return!(!e||0===e.length)&&(this._pendingTrace=e.length>1?{points:e.slice(0,-1)}:null,!0)}cancelPending(){this._pendingTrace=null,this._pendingScalePoints=[]}_deleteSelectedVertex(){const e=this._editingTarget;if(null===this._selectedVertexIndex||!e||!this._liveEditPoints)return;const t="room"===e.kind?3:2;if(this._liveEditPoints.length<=t)return;const i=this._liveEditPoints.filter((e,t)=>t!==this._selectedVertexIndex);this._liveEditPoints=i,this._selectedVertexIndex=null,this._dispatchVertexChanged(i)}_zoomBy(e,t){const i=qe(this._viewBox.w*e,250,4e3),o=i/this._viewBox.w,n=this._viewBox.h*o;this._viewBox={x:t.x-(t.x-this._viewBox.x)*o,y:t.y-(t.y-this._viewBox.y)*o,w:i,h:n}}_zoomButton(e){const t=this._viewBox;this._zoomBy(e,{x:t.x+t.w/2,y:t.y+t.h/2})}_pinLabel(e){return e.label_override?e.label_override:xe(e.device_id,this.entityLookup.values())}_roomLabelPosition(e,t){if(this._liveRoomLabel?.id===e.id)return[this._liveRoomLabel.x,this._liveRoomLabel.y];const i=this._liveRoomMove?.id===e.id?this._liveRoomMove:null,[o,n]=e.label_position??function(e){const t=Qe.get(e);if(t)return t;const i=e.length>=3?(()=>{const[t,i]=Ve([e],1);return[t,i]})():function(e){if(0===e.length)return[0,0];let t=0,i=0;for(const[o,n]of e)t+=o,i+=n;return[t/e.length,i/e.length]}(e);return Qe.set(e,i),i}(i?e.points:t);return i?[o+i.dx,n+i.dy]:[o,n]}_roomLabelHit(e,t,i){if(!1===e.visible)return!1;const o=this._effectivePoints("room",e.id,e.points);if(o.length<2)return!1;const[n,s]=this._roomLabelPosition(e,o),r=9*e.name.length/2;return t.x>=n-r-i&&t.x<=n+r+i&&t.y>=s-13-i&&t.y<=s+4+i}_renderRoom(e){if(!1===e.visible)return q;const t=this._effectivePoints("room",e.id,e.points);if(t.length<2)return q;const i=t.map(([e,t])=>`${e},${t}`).join(" "),[o,n]=this._roomLabelPosition(e,t),s=this.editingRoomId===e.id,r=e.id===this.selectedRoomId||s,a=e.fill_color??_i;let l=a,c=e.fill_opacity??mi;const d=e.border_opacity??1,h=this.showLights?this.roomLights.get(e.id):void 0;h&&h.on>0?(l=h.color,c=.15+.55*Math.min(1,h.level)):h&&h.unavailable<h.entityIds.length&&(l=this.dark?"#000000":"#263238",c=this.dark?.45:.3);const u=h?Le("canvas.lights.count",{on:h.on,total:h.entityIds.length}):"",p=this._liveRoomMove?.id===e.id?this._liveRoomMove:null,g=!p||0===p.dx&&0===p.dy?q:K`<polygon
            class="room-ghost"
            points=${e.points.map(([e,t])=>`${e},${t}`).join(" ")}
          ></polygon>`;return K`
      ${g}
      <polygon
        class="room-poly ${r?"selected":""}"
        points=${i}
        fill=${l}
        fill-opacity=${r?Math.min(1,c*(.32/.18)):c}
        stroke=${a}
        stroke-opacity=${d}
        stroke-width=${r?3:2}
      >${u?K`<title>${e.name}: ${u}</title>`:q}</polygon>
      <text class="room-label" x=${o} y=${n}>${e.name}${u?K`<tspan class="room-lights" x=${o} dy="1.2em">${u}</tspan>`:q}</text>
      ${s?this._renderVertexHandles(t,!0):q}
    `}_renderVertexHandles(e,t){const i=this._pxToUnits(6),o=this._pxToUnits(4),n=t?tt(e):it(e);return K`
      ${n.map(([e,t])=>K`<circle class="midpoint-handle" cx=${e} cy=${t} r=${o}></circle>`)}
      ${e.map(([e,t],o)=>{const n=o===this._selectedVertexIndex;return K`
          <circle
            class="vertex-handle ${n?"selected":""}"
            cx=${e}
            cy=${t}
            r=${i}
          ></circle>
          ${n?K`
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
              `:q}
        `})}
    `}_livePinPosition(e){if(this._liveDragPin?.id===e.id)return this._liveDragPin;const t=this._liveRoomMove;return t&&e.room_id===t.id?{x:e.x+t.dx,y:e.y+t.dy}:e}_renderMeshLink(e){const t=`${e.fromPin.id}|${e.toPin.id}`,i=this._livePinPosition(e.fromPin),o=this._livePinPosition(e.toPin);return K`
      <line
        class="mesh-link ${t===this.selectedMeshLinkKey?"selected":this.selectedMeshLinkKey?"dim":""}"
        x1=${i.x}
        y1=${i.y}
        x2=${o.x}
        y2=${o.y}
        style="stroke:${ve(e.quality)}"
      >
        <title>${e.detail??e.quality}</title>
      </line>
    `}_renderRoomMoveGuides(){if(!this._liveRoomMove)return q;const{x:e,y:t}=this._roomMoveGuides,i=this._viewBox;return K`
      ${null!==e?K`<line class="axis-guide" x1=${e} y1=${i.y} x2=${e} y2=${i.y+i.h}></line>`:q}
      ${null!==t?K`<line class="axis-guide" x1=${i.x} y1=${t} x2=${i.x+i.w} y2=${t}></line>`:q}
    `}_renderMeshStubLine(e){const t=`${e.fromPin.id}|${e.targetDeviceId}`,i=this._livePinPosition(e.fromPin);return K`
      <line
        class="mesh-stub-line ${t===this.selectedMeshStubKey?"selected":""}"
        x1=${i.x}
        y1=${i.y}
        x2=${e.x}
        y2=${e.y}
        style="stroke:${ve(e.quality)}"
      >
        <title>${e.targetLabel} (${e.targetFloorName})</title>
      </line>
    `}_renderMeshStubMarkers(){const e=this._pxToUnits(10),t=this._pxToUnits(12),i=new Map;for(const e of this.meshStubs){const t=`${e.targetDeviceId}|${e.x},${e.y}`,o=`${e.fromPin.id}|${e.targetDeviceId}`===this.selectedMeshStubKey,n=i.get(t);n?o&&(n.selected=!0):i.set(t,{stub:e,selected:o})}const o=(e,t)=>e.minX<t.maxX&&t.minX<e.maxX&&e.minY<t.maxY&&t.minY<e.maxY,n=[];for(const e of this.rooms){if(!1===e.visible)continue;const t=this._effectivePoints("room",e.id,e.points);if(t.length<2)continue;const[i,o]=this._roomLabelPosition(e,t),s=9*e.name.length/2;n.push({minX:i-s,maxX:i+s,minY:o-13,maxY:o+4})}const s=this.pins.map(e=>({minX:e.x-t,maxX:e.x+t,minY:e.y-t,maxY:e.y+t}));return[...i.values()].map(({stub:t,selected:i})=>{const r=(t=>{const i=7*t.targetFloorName.length/2;return{minX:t.x-i,maxX:t.x+i,minY:t.y+e+3,maxY:t.y+e+17}})(t),a=!s.some(e=>o(r,e))&&!n.some(e=>o(r,e));return a&&n.push(r),K`
        ${this._renderPinMarker(t.x,t.y,e,{kind:"path",d:"M10,5V10H9V5H5V13H9V12H10V17H9V14H5V19H12V17H13V19H19V17H21V21H3V3H21V15H19V10H13V15H12V9H19V5H10Z"},"var(--sc-fg-secondary)",i,`${t.targetLabel} (${t.targetFloorName})`)}
        ${a?K`<text class="mesh-stub-label" x=${t.x} y=${t.y+e+14}
                >${t.targetFloorName}</text
              >`:q}
      `})}_iconForPin(e){return this._pinIcons.iconForPin(e,this.entityLookup.values())}_pinGroups(){const e=new Map;for(const t of this._displayPins){const i=`${t.x},${t.y}`;e.has(i)||e.set(i,[]),e.get(i).push(t)}return[...e.values()].map(e=>({x:e[0].x,y:e[0].y,pins:e}))}_renderPinGroup(e){const t=this._pxToUnits(12);if(1===e.pins.length){const i=e.pins[0],o=this._liveDragPin?.id===i.id?this._liveDragPin:null,n=o?.x??i.x,s=o?.y??i.y,r=i.id===this.selectedPinId;return this._renderPinMarker(n,s,t,this._iconForPin(i),this.pinColors.get(i.id)??"var(--sc-accent)",r,this._pinLabel(i))}const i=e.pins.some(e=>e.id===this.selectedPinId),o=`${e.pins.length} devices: ${e.pins.map(e=>this._pinLabel(e)).join(", ")}`;return this._renderPinMarker(e.x,e.y,t,{kind:"path",d:"M12 16C13.1 16 14 16.9 14 18S13.1 20 12 20 10 19.1 10 18 10.9 16 12 16M12 10C13.1 10 14 10.9 14 12S13.1 14 12 14 10 13.1 10 12 10.9 10 12 10M12 4C13.1 4 14 4.9 14 6S13.1 8 12 8 10 7.1 10 6 10.9 4 12 4M6 16C7.1 16 8 16.9 8 18S7.1 20 6 20 4 19.1 4 18 4.9 16 6 16M6 10C7.1 10 8 10.9 8 12S7.1 14 6 14 4 13.1 4 12 4.9 10 6 10M6 4C7.1 4 8 4.9 8 6S7.1 8 6 8 4 7.1 4 6 4.9 4 6 4M18 16C19.1 16 20 16.9 20 18S19.1 20 18 20 16 19.1 16 18 16.9 16 18 16M18 10C19.1 10 20 10.9 20 12S19.1 14 18 14 16 13.1 16 12 16.9 10 18 10M18 4C19.1 4 20 4.9 20 6S19.1 8 18 8 16 7.1 16 6 16.9 4 18 4Z"},e.pins.map(e=>this.pinColors.get(e.id)).find(Boolean)??"var(--sc-accent)",i,o)}_renderPinMarker(e,t,i,o,n,s,r){return this._pinIcons.renderMarker(e,t,i,o,n,s,r)}_renderPendingTrace(){const e=this._pendingTrace?.points??[];if(0===e.length&&!this._hoverSnap)return q;const t=e.map(([e,t])=>`${e},${t}`).join(" "),i=this._pxToUnits(6),o=e[e.length-1],n=e[0],s=!!this._hoverSnap&&!!n&&e.length>=3&&je(this._hoverSnap.point[0],this._hoverSnap.point[1],n[0],n[1])<=this._pxToUnits(gi);return K`
      ${e.length>0?K`<polyline class="pending-trace" points=${t}></polyline>`:q}
      ${e.map(([e,t],o)=>K`
          <circle
            class="vertex-handle ${0===o&&s?"closing":""}"
            cx=${e}
            cy=${t}
            r=${0===o&&s?1.6*i:i}
          ></circle>
        `)}
      ${this._hoverSnap?this._renderHoverSnap(o,n,s,i):q}
    `}_renderHoverSnap(e,t,i,o){if(!this._hoverSnap)return q;const[n,s]=this._hoverSnap.point,r=this._viewBox,a=i&&t?t:[n,s];return K`
      ${this._hoverSnap.lockedY?K`<line
              class="axis-guide"
              x1=${r.x}
              y1=${s}
              x2=${r.x+r.w}
              y2=${s}
            ></line>`:q}
      ${this._hoverSnap.lockedX?K`<line
              class="axis-guide"
              x1=${n}
              y1=${r.y}
              x2=${n}
              y2=${r.y+r.h}
            ></line>`:q}
      ${e?K`<line
              class="hover-snap-line ${i?"closing":""}"
              x1=${e[0]}
              y1=${e[1]}
              x2=${a[0]}
              y2=${a[1]}
            ></line>`:q}
      ${i?q:K`<circle
              class="hover-snap-marker ${"geometry"===this._hoverSnap.kind?"on-geometry":"axis"===this._hoverSnap.kind?"on-axis":""}"
              cx=${n}
              cy=${s}
              r=${o}
            ></circle>`}
    `}_wallStrokeWidth(e,t){if(this.scale){const[[t,i],[o,n]]=this.scale.points,s=(je(t,i,o,n)||1)/this.scale.meters;return`${qe(Be(e)/100*s,.5,40)}`}return`${qe(4+t.attenuationDbPerCm*Be(e)/3,4,8)}px`}_renderWall(e){const t=this._effectivePoints("wall",e.id,e.points),i=e.id===this.selectedWallId,o=this.editingWallId===e.id,n=Ee(e.material),s=this._wallStrokeWidth(e,n),r=t[0],a=t[t.length-1],l=t.length>2&&!!r&&!!a&&r[0]===a[0]&&r[1]===a[1],c=(l?t.slice(0,-1):t).map(([e,t])=>`${e},${t}`).join(" "),d="wall-line "+(i||o?"selected":""),h=`stroke:${this.dark?`color-mix(in srgb, ${n.color} 30%, #e0e0e0)`:n.color}; stroke-width:${s}`;return K`
      ${l?K`<polygon class=${d} points=${c} style=${h}><title>${Fe(n)}</title></polygon>`:K`<polyline class=${d} points=${c} style=${h}><title>${Fe(n)}</title></polyline>`}
      ${o?this._renderVertexHandles(t,!1):q}
    `}_renderOpening(e){const t=this._openingEndpoints(e);if(!t)return q;const[[i,o],[n,s]]=t,r=e.id===this.selectedOpeningId,a=this._pxToUnits(6),l=this.walls.find(t=>t.id===e.wallId),c=l?this._wallStrokeWidth(l,Ee(l.material)):void 0,d=je(i,o,n,s)||1,h=parseFloat(c??"6")/2*1.5,u=-(s-o)/d*h,p=(n-i)/d*h,g=(e,t)=>K`
      <line
        class="opening-jamb-case"
        x1=${e-u}
        y1=${t-p}
        x2=${e+u}
        y2=${t+p}
      ></line>
      <line
        class="opening-jamb"
        x1=${e-u}
        y1=${t-p}
        x2=${e+u}
        y2=${t+p}
      ></line>
    `;return K`
      <line
        class="opening-line ${e.type} ${r?"selected":""}"
        x1=${i}
        y1=${o}
        x2=${n}
        y2=${s}
        style=${c?`stroke-width:${c}`:q}
      >
        <title>${e.type}</title>
      </line>
      ${g(i,o)}
      ${g(n,s)}
      ${r?K`
            <circle class="opening-handle" cx=${i} cy=${o} r=${a}></circle>
            <circle class="opening-handle" cx=${n} cy=${s} r=${a}></circle>
          `:q}
    `}_renderFurniture(e,t=!1){const i=this._effectiveFurniture(e),o=Ot(i.kind),n=this.unitsPerCm,s=!!i.mirrored!=!!o?.flip,r=ei(o?.draw??"box",i.width_cm,i.depth_cm,o?.opts??{}),a=!t&&i.id===this.selectedFurnitureId,l=`translate(${i.x} ${i.y}) rotate(${i.rotation_deg}) scale(${n} ${n})`,c=`translate(${-i.width_cm/2} ${-i.depth_cm/2})${s?` translate(${i.width_cm} 0) scale(-1 1)`:""}`,d=t?void 0:this.itemStates.get(i.id),h=d?.color??i.color,u=`--fx-stroke-width:${i.stroke_width}px;${h?`--fx-color:${h};`:""}`,p=i.label||o?.name||i.kind,g=d?`${p} · ${d.text}`:p,_=d?d.unavailable?"linked unavailable":d.active?"linked active":"linked idle":"",m=d&&d.glow>0&&this.showLights?Math.max(i.width_cm,i.depth_cm)/2*n*(1.5+d.glow):0,f=`item-glow-${i.id}`;return K`
      ${m>0?K`<defs><radialGradient id=${f}>
              <stop offset="0" stop-color=${d.color??"#ffd54f"} stop-opacity=${.25+.5*d.glow}></stop>
              <stop offset="0.45" stop-color=${d.color??"#ffd54f"} stop-opacity=${.12+.25*d.glow}></stop>
              <stop offset="1" stop-color=${d.color??"#ffd54f"} stop-opacity="0"></stop>
            </radialGradient></defs>
            <circle class="item-glow" cx=${i.x} cy=${i.y} r=${m} fill="url(#${f})"></circle>`:q}
      <g class="furniture ${t?"ghost":""} ${_}" style=${u} transform=${l}>
        <g transform=${c}>${ti(r,!!i.fill||!!d?.active)}</g>
        ${a?K`<rect class="furniture-outline" x=${-i.width_cm/2} y=${-i.depth_cm/2} width=${i.width_cm} height=${i.depth_cm}></rect>`:q}
        <title>${g}</title>
      </g>
      ${i.show_label&&!t?K`<text class="furniture-label" x=${i.x} y=${i.y} style="font-size:${this._pxToUnits(11)}px">${g}</text>`:q}
    `}_renderFurnitureHandles(){if(this.readOnly||!this.showFurniture)return q;const e=this.furniture.find(e=>e.id===this.selectedFurnitureId);if(!e||e.locked)return q;const t=this._furnitureHandles(e),i=this._effectiveFurniture(e),o=this._furnitureToImage(i,0,-i.depth_cm/2),n=this._pxToUnits(6);return K`
      <line class="furniture-outline" x1=${o[0]} y1=${o[1]} x2=${t.rotate[0]} y2=${t.rotate[1]}></line>
      <circle class="furniture-handle rotate" cx=${t.rotate[0]} cy=${t.rotate[1]} r=${n}></circle>
      <rect class="furniture-handle" x=${t.right[0]-.8*n} y=${t.right[1]-.8*n} width=${1.6*n} height=${1.6*n}></rect>
      <rect class="furniture-handle" x=${t.bottom[0]-.8*n} y=${t.bottom[1]-.8*n} width=${1.6*n} height=${1.6*n}></rect>
      <rect class="furniture-handle corner" x=${t.corner[0]-n} y=${t.corner[1]-n} width=${2*n} height=${2*n}></rect>
    `}_renderFurnitureGhost(){if(!this.armedFurnitureKind||!this._hoverImage)return q;const e=Ot(this.armedFurnitureKind);return e?this._renderFurniture({id:"__ghost__",kind:e.id,x:this._hoverImage.x,y:this._hoverImage.y,rotation_deg:this.armedFurnitureRotation,width_cm:e.w,depth_cm:e.d,stroke_width:1.5},!0):q}_sun(){return null!==this.northDeg&&this.location?function(e,t,i){const o=e.getTime()/864e5-10957.5,n=(357.529+.98560028*o)*oi,s=(280.459+.98564736*o+1.915*Math.sin(n)+.02*Math.sin(2*n))*oi,r=(23.439-36e-8*o)*oi,a=Math.atan2(Math.cos(r)*Math.sin(s),Math.cos(s)),l=Math.asin(Math.sin(r)*Math.sin(s)),c=(((18.697374558+24.06570982441908*o)%24+24)%24*15+i)*oi-a,d=t*oi,h=Math.asin(Math.sin(d)*Math.sin(l)+Math.cos(d)*Math.cos(l)*Math.cos(c));return{azimuth:(Math.atan2(-Math.sin(c),Math.tan(l)*Math.cos(d)-Math.sin(d)*Math.cos(c))/oi+360)%360,elevation:h/oi}}(new Date(this.sunTime??this._now),this.location.latitude,this.location.longitude):null}_renderDaylight(){if(!this.showCovers)return q;const e=this._sun();if(!e&&0===this.coverOpenness.size)return q;const t=[],i=[],o=new Set,n=100*this.unitsPerCm;let s=0;const r=(e,o,n,r,a,l)=>{if(a<=.01)return;const c="daylight-"+s++;t.push(K`
        <linearGradient id=${c} gradientUnits="userSpaceOnUse" x1=${o[0]} y1=${o[1]} x2=${n[0]} y2=${n[1]}>
          <stop offset="0" stop-color=${r} stop-opacity=${Math.min(.85,a)}></stop>
          <stop offset="1" stop-color=${r} stop-opacity="0"></stop>
        </linearGradient>`),i.push(K`<polygon class="cover-patch" points=${e.map(([e,t])=>`${e},${t}`).join(" ")} fill="url(#${c})" clip-path="url(#${l})"></polygon>`)};for(const i of this.openings){const s=this.coverOpenness.has(i.id);if(!(s||e&&"window"===i.type))continue;const a=s?this.coverOpenness.get(i.id)??null:1,l=this._openingEndpoints(i);if(!l)continue;const[[c,d],[h,u]]=l,p=je(c,d,h,u);if(p<=0)continue;const g=(h-c)/p,_=(u-d)/p,m=(c+h)/2,f=(d+u)/2,b=Math.max(this._pxToUnits(8),15*this.unitsPerCm),v=[1,-1].map(e=>{const t=-_*e,i=g*e,o=this.rooms.find(e=>!1!==e.visible&&e.points.length>=3&&Ye(m+t*b,f+i*b,e.points));return o?{nx:t,ny:i,room:o}:null}).filter(e=>null!==e);if(!e||1===v.length||s)for(const{nx:i,ny:l,room:b}of v){const y=`daylight-clip-${b.id}`;o.has(y)||(o.add(y),t.push(K`<clipPath id=${y}><polygon points=${b.points.map(([e,t])=>`${e},${t}`).join(" ")}></polygon></clipPath>`));const w=(e,t)=>[[c,d],[h,u],[h+i*e+g*t,u+l*e+_*t],[c+i*e-g*t,d+l*e-_*t]],k=(e,t,o)=>r(w(e,.25*p),[m,f],[m+i*e,f+l*e],t,o,y);if(null===a){k(1.2*p,"#9e9e9e",.25);continue}if(!e){const e=Math.max(1.6*p,1.2*n);a>=.05?k(e,"#ffd54f",.2+.5*a):k(e,"#263238",.45);continue}const x=ri(e.elevation),$=1===v.length||s;if(x<=0){s&&a>=.05?k(1.2*p,"#90caf9",.14*a):s&&k(1.4*p,"#263238",.35);continue}const M=si(e.elevation);k(Math.max(1.3*p,1*n),"#fffbe6",.18*x*a);const P=di(-i,-l,this.northDeg??0),S=Math.cos((e.azimuth-P)*Math.PI/180);if(S>.04&&e.elevation>.5&&$){const[t,o]=hi(e.azimuth+180,this.northDeg??0),s=Math.min(7,Math.max(.6,2.1/Math.tan(e.elevation*(Math.PI/180))))*n;if(t*i+o*l>.05){const i=t*s,n=o*s,l=Math.min(1,Math.max(.35,1.8*Math.sin(e.elevation*(Math.PI/180))));r([[c,d],[h,u],[h+i,u+n],[c+i,d+n]],[m,f],[m+i,f+n],M,(.3+.45*l)*Math.min(1,1.6*S)*a,y)}}s&&a<.95&&k(Math.max(1.4*p,1.2*n),"#263238",.4*(1-a)*x)}}return K`<defs>${t}</defs>${i}`}_renderCompass(){if(null===this.northDeg)return q;const e=this._sun();return G`<div
      class="compass"
      title=${Le("compass.title",{dir:ci(this.northDeg)})}
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
      ${e?G`<span class="compass-sun"
              >${e.elevation>0?Le("compass.sun",{deg:Math.round(e.elevation),dir:ci(e.azimuth)}):Le("compass.night")}</span
            >`:q}
    </div>`}_renderOverlayButtons(){if(!this.overlayButtons)return q;const e=(e,t,i)=>G`<button
        class=${t?"active":"off"}
        title=${Le(`canvasControls.${e}`)}
        @click=${()=>this.dispatchEvent(new CustomEvent("overlay-toggle",{detail:{key:e}}))}
      >
        <ha-icon icon=${i}></ha-icon>
      </button>`;return G`
      ${e("furniture",this.showFurniture,"mdi:sofa-outline")}
      ${e("lights",this.showLights,"mdi:lightbulb-group-outline")}
      ${e("covers",this.showCovers,"mdi:blinds")}
    `}_renderScaleLine(){if(!this.scale)return q;const[[e,t],[i,o]]=this.scale.points;return K`
      <line class="scale-line" x1=${e} y1=${t} x2=${i} y2=${o}></line>
      <text class="scale-label" x=${(e+i)/2} y=${(t+o)/2-6}>
        ${ht(this.scale.meters,this.unitSystem)}
        ${dt(this.unitSystem)}
      </text>
    `}_renderPendingScale(){if(0===this._pendingScalePoints.length)return q;const e=this._pxToUnits(6),[t,i]=this._pendingScalePoints[0];return K`<circle class="vertex-handle" cx=${t} cy=${i} r=${e}></circle>`}_renderBackgroundOverlay(){if(!this.backgroundImageUrl)return q;const{scale:e,offsetX:t,offsetY:i}=this._svgTransform(),o=t+e*(this.backgroundOffsetX-this._viewBox.x),n=i+e*(this.backgroundOffsetY-this._viewBox.y),s=e*this.backgroundScale;return G`
      <div
        class="bg-overlay"
        style="transform: translate(${o}px, ${n}px) scale(${s});"
      >
        <img
          src=${this.backgroundImageUrl}
          style="width:${ui}px; height:${this._naturalHeight}px; opacity:${this.backgroundOpacity};"
        />
      </div>
    `}_renderAlignOverlay(){if(!this.alignOverlay)return q;const{scale:e,offsetX:t,offsetY:i}=this._svgTransform(),o=t+e*(this.alignOverlay.offsetX-this._viewBox.x),n=i+e*(this.alignOverlay.offsetY-this._viewBox.y),s=e*this.alignOverlay.scale;return G`
      <div
        class="bg-overlay"
        style="transform: translate(${o}px, ${n}px) scale(${s});"
      >
        <img
          src=${this.alignOverlay.imageUrl}
          style="width:${ui}px; height:${this._alignNaturalHeight}px; opacity:${this.alignOverlay.opacity};"
        />
      </div>
    `}_renderScaleBar(){if(!this.scale)return G`<div class="scale-corner">
        <button
          class="scale-chip floating-panel"
          title=${Le("canvas.calibrateHint")}
          @click=${()=>this.dispatchEvent(new CustomEvent("calibrate-scale-click",{bubbles:!0,composed:!0}))}
        >
          <ha-icon icon="mdi:ruler"></ha-icon>
          ${Le("canvas.notCalibrated")}
        </button>
      </div>`;const[[e,t],[i,o]]=this.scale.points,n=(Math.hypot(i-e,o-t)||1)/this.scale.meters,s="imperial"===this.unitSystem,r=this._svgTransform().scale*n*(s?.3048:1),a=s?[1,2,5,10,20,50,100,200,500]:[.1,.2,.5,1,2,5,10,20,50,100,200,500];let l=a[0];for(const e of a){if(!(e*r<=130))break;l=e}const c=Math.max(8,Math.round(l*r));return G`<div class="scale-corner">
      <div class="scale-bar floating-panel">
        <span>${l} ${dt(this.unitSystem)}</span>
        <span class="scale-bar-line" style="width:${c}px"></span>
      </div>
    </div>`}render(){const e=this._viewBox;return G`
      ${this._renderBackgroundOverlay()} ${this._renderAlignOverlay()}
      ${K`
        <svg
          viewBox="${e.x} ${e.y} ${e.w} ${e.h}"
          class="${"pan"===this.mode||"align"===this.mode?"pan-mode":"select"!==this.mode?"draw-mode":""}"
          @wheel=${this._onWheel}
          @pointerdown=${this._onPointerDown}
          @pointermove=${this._onPointerMove}
          @pointerup=${this._onPointerUp}
          @pointercancel=${this._onPointerUp}
          @pointerleave=${this._onPointerLeave}
        >
          ${this.rooms.map(e=>this._renderRoom(e))}
          ${this._renderDaylight()}
          ${this.showFurniture?this.furniture.map(e=>this._renderFurniture(e)):q}
          ${this.walls.map(e=>this._renderWall(e))}
          ${this.openings.map(e=>this._renderOpening(e))}
          ${this._renderFurnitureHandles()}
          ${this.meshLinks.map(e=>this._renderMeshLink(e))}
          ${this.meshStubs.map(e=>this._renderMeshStubLine(e))}
          ${this._renderMeshStubMarkers()}
          ${this._renderRoomMoveGuides()}
          ${"trace"===this.mode||"wall"===this.mode?this._renderPendingTrace():q}
          ${this._renderScaleLine()}
          ${"scale"===this.mode?this._renderPendingScale():q}
          ${this._pinGroups().map(e=>this._renderPinGroup(e))}
          ${"furniture"===this.mode?this._renderFurnitureGhost():q}
        </svg>
      `}
      ${this._renderScaleBar()} ${this._renderCompass()}
      <div class="controls">
        ${this._renderOverlayButtons()}
        <button
          @click=${()=>this._zoomButton(.8)}
          title=${Le("canvasControls.zoomIn")}
        >
          <ha-icon icon="mdi:plus"></ha-icon>
        </button>
        <button
          @click=${()=>this._zoomButton(1.25)}
          title=${Le("canvasControls.zoomOut")}
        >
          <ha-icon icon="mdi:minus"></ha-icon>
        </button>
        <button
          @click=${()=>this.fitToScreen()}
          title=${Le("canvasControls.fit")}
        >
          <ha-icon icon="mdi:fit-to-screen-outline"></ha-icon>
        </button>
      </div>
    `}};fi.styles=[bt,Tt,a`
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
      ${vt}
      ${$t}
      ${r(ii)}
      .furniture {
        --fx-color: #546e7a;
        cursor: pointer;
      }
      :host([dark]) .furniture {
        --fx-color: #b0bec5;
      }
      .furniture.unavailable {
        opacity: 0.4;
      }
      .furniture.idle {
        opacity: 0.7;
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
    `],e([ge({type:Boolean,reflect:!0})],fi.prototype,"dark",void 0),e([ge({attribute:!1})],fi.prototype,"rooms",void 0),e([ge({attribute:!1})],fi.prototype,"pins",void 0),e([ge({attribute:!1})],fi.prototype,"walls",void 0),e([ge({attribute:!1})],fi.prototype,"openings",void 0),e([ge({attribute:!1})],fi.prototype,"scale",void 0),e([ge({attribute:!1})],fi.prototype,"unitSystem",void 0),e([ge({attribute:!1})],fi.prototype,"meshLinks",void 0),e([ge({attribute:!1})],fi.prototype,"meshStubs",void 0),e([ge({attribute:!1})],fi.prototype,"entityLookup",void 0),e([ge({attribute:!1})],fi.prototype,"backgroundImageUrl",void 0),e([ge({type:Number})],fi.prototype,"backgroundOpacity",void 0),e([ge({type:Number})],fi.prototype,"backgroundOffsetX",void 0),e([ge({type:Number})],fi.prototype,"backgroundOffsetY",void 0),e([ge({type:Number})],fi.prototype,"backgroundScale",void 0),e([ge({attribute:!1})],fi.prototype,"alignOverlay",void 0),e([ge({attribute:!1})],fi.prototype,"initialViewBox",void 0),e([ge({type:Boolean})],fi.prototype,"sameBuildingAsPrevious",void 0),e([ge({attribute:!1})],fi.prototype,"mode",void 0),e([ge({attribute:!1})],fi.prototype,"snapMode",void 0),e([ge({attribute:!1})],fi.prototype,"armedEntityId",void 0),e([ge({attribute:!1})],fi.prototype,"armedOpeningType",void 0),e([ge({attribute:!1})],fi.prototype,"selectedRoomId",void 0),e([ge({attribute:!1})],fi.prototype,"editingRoomId",void 0),e([ge({attribute:!1})],fi.prototype,"editingWallId",void 0),e([ge({attribute:!1})],fi.prototype,"selectedPinId",void 0),e([ge({attribute:!1})],fi.prototype,"selectedWallId",void 0),e([ge({attribute:!1})],fi.prototype,"selectedOpeningId",void 0),e([ge({attribute:!1})],fi.prototype,"furniture",void 0),e([ge({attribute:!1})],fi.prototype,"selectedFurnitureId",void 0),e([ge({attribute:!1})],fi.prototype,"armedFurnitureKind",void 0),e([ge({type:Number})],fi.prototype,"armedFurnitureRotation",void 0),e([ge({attribute:!1})],fi.prototype,"roomLights",void 0),e([ge({attribute:!1})],fi.prototype,"coverOpenness",void 0),e([ge({attribute:!1})],fi.prototype,"pinColors",void 0),e([ge({attribute:!1})],fi.prototype,"itemStates",void 0),e([ge({type:Boolean})],fi.prototype,"showFurniture",void 0),e([ge({type:Boolean})],fi.prototype,"showLights",void 0),e([ge({type:Boolean})],fi.prototype,"showCovers",void 0),e([ge({attribute:!1})],fi.prototype,"northDeg",void 0),e([ge({attribute:!1})],fi.prototype,"location",void 0),e([ge({attribute:!1})],fi.prototype,"sunTime",void 0),e([ge({type:Boolean})],fi.prototype,"overlayButtons",void 0),e([ge({type:Boolean})],fi.prototype,"readOnly",void 0),e([ge({attribute:!1})],fi.prototype,"selectedMeshLinkKey",void 0),e([ge({attribute:!1})],fi.prototype,"selectedMeshStubKey",void 0),e([_e()],fi.prototype,"_viewBox",void 0),e([_e()],fi.prototype,"_naturalHeight",void 0),e([_e()],fi.prototype,"_alignNaturalHeight",void 0),e([_e()],fi.prototype,"_pendingTrace",void 0),e([_e()],fi.prototype,"_hoverSnap",void 0),e([_e()],fi.prototype,"_pendingScalePoints",void 0),e([_e()],fi.prototype,"_liveEditPoints",void 0),e([_e()],fi.prototype,"_liveRoomMove",void 0),e([_e()],fi.prototype,"_roomMoveGuides",void 0),e([_e()],fi.prototype,"_liveDragPin",void 0),e([_e()],fi.prototype,"_liveOpeningEdit",void 0),e([_e()],fi.prototype,"_selectedVertexIndex",void 0),e([_e()],fi.prototype,"_liveFurniture",void 0),e([_e()],fi.prototype,"_now",void 0),e([_e()],fi.prototype,"_hoverImage",void 0),e([me("svg")],fi.prototype,"_svg",void 0),e([_e()],fi.prototype,"_liveRoomLabel",void 0),fi=e([fe("floorplan-canvas")],fi);const bi={room:"room",rooms:"room",space:"room",spaces:"room",wall:"wall",walls:"wall",ext:"wall",int:"wall",exterior:"wall",interior:"wall",door:"door",doors:"door",window:"window",windows:"window",win:"window",fixture:"ignore",fixtures:"ignore",fx:"ignore",furniture:"ignore",label:"ignore",labels:"ignore",dim:"ignore",dims:"ignore",dimension:"ignore",dimensions:"ignore",rail:"ignore",rails:"ignore",railing:"ignore",railings:"ignore",annotation:"ignore",annotations:"ignore"},vi=new Set(["ext","exterior","outer","outside"]),yi=new Set(["defs","metadata","title","desc","style","script","symbol","clipPath","mask","pattern","marker","linearGradient","radialGradient","filter","foreignObject"]),wi=new Set(["g","svg","a","switch"]),ki="http://www.inkscape.org/namespaces/inkscape";function xi(e){const t=(new DOMParser).parseFromString(e,"image/svg+xml"),i=t.documentElement;if("svg"!==i.localName||t.getElementsByTagName("parsererror").length>0)throw new Error("Not a valid SVG file");const o=function(e){const t=e.getAttribute("viewBox");if(t){const[e,i,o,n]=t.trim().split(/[\s,]+/).map(Number);if([e,i,o,n].every(e=>void 0!==e&&Number.isFinite(e))&&o>0&&n>0)return{x:e,y:i,w:o,h:n}}const i=parseFloat(e.getAttribute("width")??""),o=parseFloat(e.getAttribute("height")??""),n=/%/.test(`${e.getAttribute("width")}${e.getAttribute("height")}`);if(!n&&i>0&&o>0)return{x:0,y:0,w:i,h:o};throw new Error("The SVG needs a viewBox (or a fixed width and height)")}(i);let n=i,s=null;"undefined"!=typeof document&&document.body&&(s=document.createElement("div"),s.style.cssText="position:fixed;left:-100000px;top:0;width:1px;height:1px;overflow:hidden;visibility:hidden;pointer-events:none",n=document.importNode(i,!0),s.appendChild(n),document.body.appendChild(s));const r={viewBox:o,drawingUnit:1,rooms:[],walls:[],openings:[]},a=[],l=[];try{!function e(t,i,o,n){for(const s of Array.from(t.children)){const t=s.localName;if(yi.has(t)||Pi(s))continue;const d=Ri(i,Hi(s.getAttribute("transform"))),h=$i(s),u=Mi(h),p=u??o,g=n||h.some(e=>vi.has(e));if("text"===t){const e=s.textContent?.replace(/\s+/g," ").trim();if(e){const t=parseFloat(Li(s.getAttribute("x"))),i=parseFloat(Li(s.getAttribute("y")));a.push({text:e,at:zi(d,[t||0,i||0])})}continue}if(wi.has(t)){if(!("door"!==u&&"window"!==u||h.some(e=>"doors"===e||"windows"===e)||Array.from(s.children).some(e=>{const t=Mi($i(e));return"door"===t||"window"===t}))){const e=c(s,d);e.length>=2&&r.openings.push({type:u,points:e});continue}e(s,d,p,g);continue}if(!p||"ignore"===p)continue;const _=Fi(s).map(e=>({closed:e.closed,points:e.points.map(e=>zi(d,e))}));if(0===_.length)continue;const m=Di(d);if("room"===p)for(const e of _)!e.closed||e.points.length<3||(r.rooms.push({name:Ci(s),id:s.getAttribute("id"),points:e.points}),l.push(m));else if("wall"===p){const e=Si(s);for(const t of _){const i=t.closed?[...t.points,t.points[0]]:t.points;i.length<2||(r.walls.push({points:i,strokeWidth:null===e?null:e*m,exterior:g}),l.push(m))}}else{const e=_.flatMap(e=>e.points);e.length>=2&&r.openings.push({type:p,points:e})}}}(n,Oi,null,!1)}finally{s?.remove()}return r.rooms.forEach((e,t)=>{if(e.name)return;const i=a.find(t=>Ye(t.at[0],t.at[1],e.points));e.name=i?.text??`Room ${t+1}`}),l.length>0&&(l.sort((e,t)=>e-t),r.drawingUnit=l[Math.floor(l.length/2)]),r;function c(e,t){const i=[];for(const o of Array.from(e.children)){if(yi.has(o.localName)||Pi(o))continue;const e=Ri(t,Hi(o.getAttribute("transform")));if(wi.has(o.localName))i.push(...c(o,e));else for(const t of Fi(o))i.push(...t.points.map(t=>zi(e,t)))}return i}}function $i(e){return[e.getAttribute("id"),e.getAttribute("class"),e.getAttributeNS(ki,"label")??e.getAttribute("inkscape:label"),e.getAttribute("data-type")].flatMap(e=>(e??"").toLowerCase().split(/[^a-z0-9]+/)).filter(Boolean)}function Mi(e){for(const t of e){const e=bi[t];if(e)return e}return null}function Pi(e){return"none"===e.getAttribute("display")||("hidden"===e.getAttribute("visibility")||(!!/display\s*:\s*none/i.test(e.getAttribute("style")??"")||!(!e.isConnected||"function"!=typeof getComputedStyle)&&"none"===getComputedStyle(e).display))}function Si(e){if(e.isConnected&&"function"==typeof getComputedStyle){const t=parseFloat(getComputedStyle(e).strokeWidth);if(Number.isFinite(t)&&t>0)return t}const t=/stroke-width\s*:\s*([\d.eE+-]+)/.exec(e.getAttribute("style")??"")?.[1],i=parseFloat(t??e.getAttribute("stroke-width")??"");return Number.isFinite(i)&&i>0?i:null}const Ii=/^(path|rect|polygon|polyline|line|g|layer|shape|svg)[-_]?\d+$/i;function Ci(e){const t=Array.from(e.children).find(e=>"title"===e.localName),i=t?.textContent?.trim();if(i)return i;const o=e.getAttributeNS(ki,"label")??e.getAttribute("inkscape:label")??e.getAttribute("aria-label");if(o?.trim())return o.trim();const n=e.getAttribute("id");return n&&!Ii.test(n)?function(e){return e.replace(/[_-]+/g," ").trim().replace(/\b\w/g,e=>e.toUpperCase())}(n):""}function Li(e){return(e??"").trim().split(/[\s,]+/)[0]??""}function Ti(e,t){const i=parseFloat(e.getAttribute(t)??"");return Number.isFinite(i)?i:0}function Fi(e){switch(e.localName){case"rect":{const t=Ti(e,"x"),i=Ti(e,"y"),o=Ti(e,"width"),n=Ti(e,"height");if(o<=0||n<=0)return[];return[{points:[[t,i],[t+o,i],[t+o,i+n],[t,i+n]],closed:!0}]}case"line":return[{points:[[Ti(e,"x1"),Ti(e,"y1")],[Ti(e,"x2"),Ti(e,"y2")]],closed:!1}];case"polygon":case"polyline":{const t=Bi(function(e){const t=(e??"").trim().split(/[\s,]+/).filter(Boolean).map(Number),i=[];for(let e=0;e+1<t.length;e+=2)Number.isFinite(t[e])&&Number.isFinite(t[e+1])&&i.push([t[e],t[e+1]]);return i}(e.getAttribute("points")));return t.length<2?[]:[{...Ai(t),..."polygon"===e.localName?{closed:!0}:{}}]}case"path":return function(e){const t=[];let i=0,o="",n=[0,0],s=[0,0],r=null;const a=()=>{for(;i<e.length&&/[\s,]/.test(e[i]);)i++},l=()=>{a();const t=/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/.exec(e.slice(i));return t?(i+=t[0].length,Number(t[0])):NaN},c=()=>{a();const t=e[i];return"0"!==t&&"1"!==t?NaN:(i++,Number(t))},d=e=>{if(r&&r.length>1){const i=Bi(r);t.push(e?{points:i,closed:e}:Ai(i))}r=null},h=e=>{r||(r=[n]),r.push(e),n=e};for(;i<e.length&&(a(),!(i>=e.length));){if(/[a-zA-Z]/.test(e[i]))o=e[i++];else if(!o)break;const t=o===o.toLowerCase(),a=(e,i)=>t?[n[0]+e,n[1]+i]:[e,i],u=i;switch(o.toUpperCase()){case"M":{const e=l(),i=l();if(Number.isNaN(i))break;d(!1),n=s=a(e,i),r=[n],o=t?"l":"L";break}case"L":{const e=l(),t=l();Number.isNaN(t)||h(a(e,t));break}case"H":{const e=l();Number.isNaN(e)||h([t?n[0]+e:e,n[1]]);break}case"V":{const e=l();Number.isNaN(e)||h([n[0],t?n[1]+e:e]);break}case"C":case"S":case"Q":case"T":{const e={C:3,S:2,Q:2,T:1}[o.toUpperCase()];let t=NaN,i=NaN;for(let o=0;o<e;o++)t=l(),i=l();Number.isNaN(i)||h(a(t,i));break}case"A":{l(),l(),l(),c(),c();const e=l(),t=l();Number.isNaN(t)||h(a(e,t));break}case"Z":d(!0),n=s,o="";continue;default:i=e.length}if(i===u)break}return d(!1),t}(e.getAttribute("d")??"");default:return[]}}function Ei(e,t){return Math.abs(e[0]-t[0])<1e-9&&Math.abs(e[1]-t[1])<1e-9}function Bi(e){return e.filter((t,i)=>0===i||!Ei(t,e[i-1]))}function Ai(e){return e.length>2&&Ei(e[0],e[e.length-1])?{points:e.slice(0,-1),closed:!0}:{points:e,closed:!1}}const Oi=[1,0,0,1,0,0];function Ri(e,t){return[e[0]*t[0]+e[2]*t[1],e[1]*t[0]+e[3]*t[1],e[0]*t[2]+e[2]*t[3],e[1]*t[2]+e[3]*t[3],e[0]*t[4]+e[2]*t[5]+e[4],e[1]*t[4]+e[3]*t[5]+e[5]]}function zi(e,[t,i]){return[e[0]*t+e[2]*i+e[4],e[1]*t+e[3]*i+e[5]]}function Di(e){return Math.sqrt(Math.abs(e[0]*e[3]-e[1]*e[2]))||1}function Hi(e){let t=Oi;const i=/(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)/g;for(const o of(e??"").matchAll(i)){const e=o[2].trim().split(/[\s,]+/).filter(Boolean).map(Number),[i=0,n,s]=e;let r=Oi;switch(o[1]){case"matrix":6===e.length&&(r=e);break;case"translate":r=[1,0,0,1,i,n??0];break;case"scale":r=[i,0,0,n??i,0,0];break;case"rotate":{const e=i*Math.PI/180,t=Math.cos(e),o=Math.sin(e),a=n??0,l=s??0;r=[t,o,-o,t,a-t*a+o*l,l-o*a-t*l];break}case"skewX":r=[1,0,Math.tan(i*Math.PI/180),1,0,0];break;case"skewY":r=[1,Math.tan(i*Math.PI/180),0,1,0,0]}t=Ri(t,r)}return t}function Wi(e){return e.toLowerCase().replace(/[^a-z0-9]+/g," ").trim()}function Ni(e,t,i){let o=null;const n=t.filter((e,i)=>t.findIndex(t=>Ei(e,t))===i);for(const t of e)if(!t.mergedInto)for(let e=0;e+1<t.points.length;e++){const s=t.points[e],r=t.points[e+1],a=Math.hypot(r[0]-s[0],r[1]-s[1]);if(a<i)continue;const l=[(r[0]-s[0])/a,(r[1]-s[1])/a],c=[];for(const e of n){const t=e[0]-s[0],o=e[1]-s[1];Math.abs(t*l[1]-o*l[0])<=i&&c.push(t*l[0]+o*l[1])}if(c.length<2)continue;const d=Math.min(...c),h=Math.max(...c);if(h-d<i)continue;const u=d>=-i&&h<=a+i;if(!u&&!(d<=a+i&&h>=-i))continue;(!o||u&&!o.contained||u===o.contained&&c.length>o.count)&&(o={wall:t,origin:s,dir:l,span:[d,h],contained:u,count:c.length})}return o}function Ui(e,t,i){const o=[...e.rooms.flatMap(e=>e.points),...e.walls.flatMap(e=>e.points)];if(o.length<2)return null;const n=o.map(e=>e[0]),s=o.map(e=>e[1]),r=Math.min(...n),a=Math.max(...n),l=Math.min(...s),c=Math.max(...s),d=a-r>=c-l,h=d?a-r:c-l;if(h<=0)return null;const u=d?[a,l]:[r,c];return{points:[t([r,l]),t(u)],meters:h/e.drawingUnit*i}}const Vi=85.0511287798;function Gi(e,t,i){const o=512*2**i,n=e/o*360-180,s=Math.PI-2*Math.PI*t/o;return{lat:180*Math.atan(Math.sinh(s))/Math.PI,lon:n}}function Ki(e,t){const i=t*Math.PI/180,o=Math.cos(i),n=Math.sin(i);return{x:o*e.x-n*e.y,y:n*e.x+o*e.y}}function ji(e){const t=((e+180)%360+360)%360-180;return-180===t?180:t}const qi=e=>e.rotation_deg??0;function Yi(e){return function(e,t,i){const o=512*2**i,n=Math.max(-Vi,Math.min(Vi,e))*Math.PI/180;return{x:(t+180)/360*o,y:(.5-Math.log(Math.tan(Math.PI/4+n/2))/(2*Math.PI))*o}}(e.lat,e.lon,e.zoom)}function Xi(e,t,i,o,n){const{lat:s,lon:r}=Gi(t,i,o);return{...e,lat:s,lon:r,zoom:o,rotation_deg:ji(n)}}function Zi(e,t,i){const o=Yi(e),n=Ki({x:t,y:i},qi(e));return Xi(e,o.x-n.x,o.y-n.y,e.zoom,qi(e))}function Qi(e,t,i){const o=Math.min(21,Math.max(3,e.zoom+Math.log2(t))),n=2**(o-e.zoom),s=qi(e),r=Yi(e),a=Ki(i,s);return Xi(e,n*(r.x+a.x)-a.x,n*(r.y+a.y)-a.y,o,s)}function Ji(e,t,i){const o=Yi(e),n=Ki(i,qi(e)),s=Ki(i,t);return Xi(e,o.x+n.x-s.x,o.y+n.y-s.y,e.zoom,t)}const eo=[[-1,-1],[1,-1],[1,1],[-1,1]];let to=class extends de{constructor(){super(...arguments),this.placements=[],this.ghosts=new Map,this.floorNameById=new Map,this.floorIconById=new Map,this.backgroundImageUrl=null,this.backgroundOpacity=.85,this.backgroundOffsetX=0,this.backgroundOffsetY=0,this.backgroundScale=1,this.mode="select",this.selectedPlacementId=null,this.pins=[],this.selectedPinId=null,this.entityLookup=new Map,this.meshLinks=[],this.selectedMeshLinkKey=null,this.initialViewBox=null,this.mapBackground=null,this.dark=!1,this._mapError=null,this._mapStarting=!1,this._mapSize="",this._viewBox={x:0,y:0,w:ui,h:750},this._naturalHeight=750,this._pointers=new Map,this._downHit=null,this._downClient=null,this._lastClient=null,this._gesture=null,this._moved=!1,this._pinIcons=new Ft(this),this._gestureCancelled=!1,this._hasFittedOnce=!1,this._onPointerDown=e=>{if("mouse"!==e.pointerType||0===e.button){if(at(this),this._svg.setPointerCapture(e.pointerId),this._pointers.set(e.pointerId,{x:e.clientX,y:e.clientY}),2===this._pointers.size){const e=[...this._pointers.values()],[t,i]=e,o={x:(t.x+i.x)/2,y:(t.y+i.y)/2};return"map"===this.mode&&this.mapBackground?void(this._gesture={kind:"mapPinch",lastDistance:je(t.x,t.y,i.x,i.y)||1,lastAngle:Math.atan2(i.y-t.y,i.x-t.x),lastMid:this._clientToImage(o.x,o.y)}):void(this._gesture={kind:"pinch",startDistance:je(t.x,t.y,i.x,i.y),startViewBox:{...this._viewBox},midImage:this._clientToImage(o.x,o.y)})}this._pointers.size>2||(this._downClient={x:e.clientX,y:e.clientY},this._lastClient={x:e.clientX,y:e.clientY},this._moved=!1,this._gesture=null,this._downHit="select"===this.mode?this._hitTest(e.clientX,e.clientY):{type:"empty"})}},this._onPointerMove=e=>{if(!this._pointers.has(e.pointerId))return;if(this._pointers.set(e.pointerId,{x:e.clientX,y:e.clientY}),"mapPinch"===this._gesture?.kind&&2===this._pointers.size){const[e,t]=[...this._pointers.values()],i=this._gesture,o=je(e.x,e.y,t.x,t.y)||1,n=Math.atan2(t.y-e.y,t.x-e.x),s=this._clientToImage((e.x+t.x)/2,(e.y+t.y)/2);return this._fire("map-adjust",{op:"pinch",dx:s.x-i.lastMid.x,dy:s.y-i.lastMid.y,factor:o/i.lastDistance,rotateDeg:180*(n-i.lastAngle)/Math.PI,at:s}),i.lastDistance=o,i.lastAngle=n,void(i.lastMid=s)}if("pinch"===this._gesture?.kind&&2===this._pointers.size){const e=[...this._pointers.values()],[t,i]=e,o=je(t.x,t.y,i.x,i.y)||1,n=this._gesture.startDistance/o,s=this._gesture.startViewBox,r=qe(s.w*n,this._minViewBoxWidth,4e3),a=r/s.w,l=s.h*a,{x:c,y:d}=this._gesture.midImage;return void(this._viewBox={x:c-(c-s.x)*a,y:d-(d-s.y)*a,w:r,h:l})}if(1!==this._pointers.size||!this._downClient)return;if(this._gestureCancelled)return;if(!this._moved){if(je(this._downClient.x,this._downClient.y,e.clientX,e.clientY)<5)return;this._moved=!0,this._gesture=this._lockGesture(),"pan"===this._gesture?.kind||"mapPan"===this._gesture?.kind?this._svg.style.cursor="grabbing":this._gesture&&this._fire("property-gesture-start")}const t=this._svgTransform().scale||1,i=this._lastClient??{x:e.clientX,y:e.clientY};if("mapPan"===this._gesture?.kind)this._fire("map-adjust",{op:"pan",dx:(e.clientX-i.x)/t,dy:(e.clientY-i.y)/t});else if("pan"===this._gesture?.kind)this._viewBox={...this._viewBox,x:this._viewBox.x-(e.clientX-i.x)/t,y:this._viewBox.y-(e.clientY-i.y)/t};else if("move"===this._gesture?.kind)this._fire("placement-move",{id:this._gesture.id,dx:(e.clientX-i.x)/t,dy:(e.clientY-i.y)/t});else if("pinMove"===this._gesture?.kind){const t=this._clientToImage(e.clientX,e.clientY);this._fire("outdoor-pin-move",{id:this._gesture.id,x:t.x,y:t.y})}else if("resize"===this._gesture?.kind){const t=this._gesture,i=this.placements.find(e=>e.id===t.id);if(i){const[o,n]=eo[t.corner],s=-o,r=-n,a=this._clientToImage(e.clientX,e.clientY),l=i.rotation_deg*Math.PI/180,c=Math.cos(l),d=Math.sin(l),h=a.x-t.anchorWorld.x,u=a.y-t.anchorWorld.y,p=c*h+d*u,g=-d*h+c*u,_=Math.max(10,o*p),m=Math.max(10,n*g),f=i.aspect_ratio||_/m||1,b=Math.max(_,m*f),v=b/f,y=s*(b/2),w=r*(v/2);this._fire("placement-resize",{id:i.id,width:b,height:v,x:t.anchorWorld.x-(c*y-d*w),y:t.anchorWorld.y-(d*y+c*w)})}}else if("rotate"===this._gesture?.kind){const t=this._gesture.id,i=this.placements.find(e=>e.id===t);if(i){const t=this._clientToImage(e.clientX,e.clientY),o=((180*Math.atan2(t.y-i.y,t.x-i.x)/Math.PI+90)%360+360)%360;this._fire("placement-rotate",{id:i.id,rotationDeg:o})}}this._lastClient={x:e.clientX,y:e.clientY}},this._onPointerUp=e=>{this._pointers.delete(e.pointerId),this._svg.style.cursor="";try{this._svg.releasePointerCapture(e.pointerId)}catch{}this._pointers.size>=1?this._gesture=null:(this._moved||!this._downClient||this._gestureCancelled||this._handleClick(),this._gesture=null,this._downHit=null,this._downClient=null,this._moved=!1,this._gestureCancelled=!1)},this._onWheel=e=>{if(e.preventDefault(),"map"===this.mode&&this.mapBackground&&(e.ctrlKey||e.shiftKey)){const t=this._clientToImage(e.clientX,e.clientY);return void this._fire("map-adjust",e.ctrlKey?{op:"zoom",factor:e.deltaY<0?1.1:1/1.1,at:t}:{op:"rotate",deltaDeg:e.deltaY<0?2:-2,at:t})}if(e.ctrlKey){const t=e.deltaY<0?.9:1.1;return void this._zoomBy(t,this._clientToImage(e.clientX,e.clientY))}const t=this._viewBox.w/this.getBoundingClientRect().width;this._viewBox={...this._viewBox,x:this._viewBox.x+e.deltaX*t,y:this._viewBox.y+e.deltaY*t}}}firstUpdated(){this.initialViewBox?(this._viewBox={...this.initialViewBox},this._hasFittedOnce=!0):(this.fitToScreen(),this._hasFittedOnce=this.placements.length>0||!this.backgroundImageUrl),this._resizeObserver=new ResizeObserver(()=>this.requestUpdate()),this._resizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this._resizeObserver?.disconnect(),this._destroyMap()}_destroyMap(){this._map?.destroy(),this._map=void 0,this._mapSize=""}_syncMap(){const e=this.mapBackground;if(!e)return this._destroyMap(),void(this._mapError=null);if(this._mapError)return;const t=this.renderRoot.querySelector(".map-layer");if(!t||!this._svg)return;const i=this._svg.getBoundingClientRect();if(0===i.width||0===i.height)return;const{scale:o,offsetX:n,offsetY:s}=this._svgTransform(),r=this._viewBox,a=function(e,t,i,o){const n=qi(e),s=Yi(e),r=Ki({x:t,y:i},n),a=Gi(s.x+r.x,s.y+r.y,e.zoom);return{lat:a.lat,lon:a.lon,zoom:e.zoom+Math.log2(o),bearing:n}}(e,r.x+(i.width/2-n)/o,r.y+(i.height/2-s)/o,o),l=this.hass?.themes?.darkMode??!1;if(this._map){this._map.setDark(l),this._map.setStyleKind(e.style??"street"),this._map.setOpacity(e.opacity);const t=`${i.width}x${i.height}`;return t!==this._mapSize&&(this._mapSize=t,this._map.resize()),void this._map.setCamera(a)}const c=this.hass?.connection;if(this._mapStarting||!c)return;this._mapStarting=!0,this._mapError=null;const d="/spatial_context/map";(async()=>{try{const o=await(import(`${d}/spatial-context-map.mjs?v=0.15.0-beta.1+mv9xupxn`));if(!o.supportsVectorMaps())throw new Error(Le("mapBackground.noWebgl"));const n=await o.createMapLayer({container:t,baseUrl:d,connection:c,dark:l,styleKind:e.style??"street",language:this.hass?.locale?.language??this.hass?.language??"en",opacity:e.opacity,camera:a});this.mapBackground&&this.isConnected?(this._map=n,this._mapSize=`${i.width}x${i.height}`):n.destroy()}catch(e){this._mapError=e?.message??String(e)}finally{this._mapStarting=!1,this.requestUpdate()}})()}updated(e){if(e.has("mapBackground")&&(this._mapError=null),this._syncMap(),e.has("backgroundImageUrl")&&this.backgroundImageUrl){const e=new Image;e.onload=()=>{this._naturalHeight=e.naturalHeight/e.naturalWidth*ui||750,this._hasFittedOnce||(this.fitToScreen(),this._hasFittedOnce=!0)},e.src=this.backgroundImageUrl}}_contentBounds(){if(0===this.placements.length&&0===this.pins.length)return null;const e=[...this.placements.flatMap(e=>[e.x-e.width,e.x+e.width]),...this.pins.map(e=>e.x)],t=[...this.placements.flatMap(e=>[e.y-e.height,e.y+e.height]),...this.pins.map(e=>e.y)],i=Math.min(...e),o=Math.max(...e),n=Math.min(...t),s=Math.max(...t),r=.15*Math.max(o-i,s-n)||60;return{x:i-r,y:n-r,w:o-i+2*r,h:s-n+2*r}}getViewCenter(){const e=this._svg?.getBoundingClientRect(),{scale:t,offsetX:i,offsetY:o}=this._svgTransform(),n=this._viewBox;return{x:n.x+((e?.width??0)/2-i)/t,y:n.y+((e?.height??0)/2-o)/t}}fitToScreen(){this._viewBox=this._contentBounds()??{x:0,y:0,w:ui,h:this._naturalHeight}}getViewBox(){return{...this._viewBox}}_svgTransform(){const e=this._svg?.getBoundingClientRect(),t=e?.width||this._viewBox.w,i=e?.height||this._viewBox.h,o=Math.min(t/this._viewBox.w,i/this._viewBox.h)||1;return{scale:o,offsetX:(t-this._viewBox.w*o)/2,offsetY:(i-this._viewBox.h*o)/2}}_pxToUnits(e){return e/this._svgTransform().scale}_clientToImage(e,t){const i=this._svg,o=i.createSVGPoint();o.x=e,o.y=t;const n=i.getScreenCTM();if(!n)return{x:0,y:0};const s=o.matrixTransform(n.inverse());return{x:s.x,y:s.y}}_toLocal(e,t,i){const o=e.rotation_deg*Math.PI/180,n=Math.cos(o),s=Math.sin(o),r=t-e.x,a=i-e.y;return{x:n*r+s*a,y:-s*r+n*a}}_localToWorld(e,t,i){const o=e.rotation_deg*Math.PI/180,n=Math.cos(o),s=Math.sin(o);return{x:e.x+n*t-s*i,y:e.y+s*t+n*i}}_hitTest(e,t){const i=this._clientToImage(e,t),o=this._pxToUnits(12*1.4);for(const e of[...this.pins].reverse())if(je(e.x,e.y,i.x,i.y)<=o)return{type:"pin",id:e.id};const n=this.placements.find(e=>e.id===this.selectedPlacementId);if(n){const i=this._pxToUnits(26),o=eo.map(([e,t])=>[e*n.width/2,t*n.height/2]);for(let i=0;i<o.length;i++){const[s,r]=o[i],a=this._localToWorld(n,s,r),l=this._imageToClient(a.x,a.y);if(je(l.x,l.y,e,t)<=14)return{type:"resizeHandle",id:n.id,corner:i}}const s=this._localToWorld(n,0,-n.height/2-i),r=this._imageToClient(s.x,s.y);if(je(r.x,r.y,e,t)<=14)return{type:"rotateHandle",id:n.id}}let s=null,r=this._pxToUnits(8);for(const e of this.meshLinks){const t=Je(i.x,i.y,e.from.x,e.from.y,e.to.x,e.to.y);t<=r&&(s=e,r=t)}if(s)return{type:"meshLink",key:s.key};for(const e of[...this.placements].reverse()){const t=this._toLocal(e,i.x,i.y);if(Math.abs(t.x)<=e.width/2&&Math.abs(t.y)<=e.height/2)return{type:"body",id:e.id}}return{type:"empty"}}_imageToClient(e,t){const i=this._svg.getBoundingClientRect(),{scale:o,offsetX:n,offsetY:s}=this._svgTransform();return{x:i.left+n+(e-this._viewBox.x)*o,y:i.top+s+(t-this._viewBox.y)*o}}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}_lockGesture(){if("resizeHandle"===this._downHit?.type){const e=this._downHit,t=this.placements.find(t=>t.id===e.id);if(!t)return{kind:"pan"};const[i,o]=eo[e.corner],n=this._localToWorld(t,-i*t.width/2,-o*t.height/2);return{kind:"resize",id:t.id,corner:e.corner,anchorWorld:n}}return"rotateHandle"===this._downHit?.type?{kind:"rotate",id:this._downHit.id}:"body"===this._downHit?.type?{kind:"move",id:this._downHit.id}:"pin"===this._downHit?.type?{kind:"pinMove",id:this._downHit.id}:"map"===this.mode&&this.mapBackground?{kind:"mapPan"}:{kind:"pan"}}cancelGesture(){const e=this._gesture?.kind;return!(!this._moved||!e||"pan"===e||"pinch"===e||"mapPan"===e||"mapPinch"===e)&&(this._gesture=null,this._gestureCancelled=!0,this._svg.style.cursor="",!0)}_handleClick(){if("place"===this.mode||"place-pin"===this.mode){if(!this._downClient)return;const e=this._clientToImage(this._downClient.x,this._downClient.y);return void this._fire("place"===this.mode?"placement-place":"outdoor-pin-place",{x:e.x,y:e.y})}const e=this._downHit;"pin"===e?.type?this._fire("outdoor-pin-select",{id:e.id}):"meshLink"===e?.type?this._fire("property-mesh-link-select",{key:e.key===this.selectedMeshLinkKey?null:e.key}):(this._fire("outdoor-pin-select",{id:null}),this._fire("property-mesh-link-select",{key:null}),this._fire("placement-select",{id:"body"===e?.type?e.id:null}))}get _minViewBoxWidth(){return this.mapBackground?15.625:250}_zoomBy(e,t){const i=qe(this._viewBox.w*e,this._minViewBoxWidth,4e3),o=i/this._viewBox.w,n=this._viewBox.h*o;this._viewBox={x:t.x-(t.x-this._viewBox.x)*o,y:t.y-(t.y-this._viewBox.y)*o,w:i,h:n}}_zoomButton(e){const t=this._viewBox;this._zoomBy(e,{x:t.x+t.w/2,y:t.y+t.h/2})}_renderBackgroundOverlay(){if(!this.backgroundImageUrl)return q;const{scale:e,offsetX:t,offsetY:i}=this._svgTransform(),o=t+e*(this.backgroundOffsetX-this._viewBox.x),n=i+e*(this.backgroundOffsetY-this._viewBox.y),s=e*this.backgroundScale;return G`
      <div
        class="bg-overlay"
        style="transform: translate(${o}px, ${n}px) scale(${s});"
      >
        <img
          src=${this.backgroundImageUrl}
          style="width:${ui}px; height:${this._naturalHeight}px; opacity:${this.backgroundOpacity};"
        />
      </div>
    `}_renderGhost(e){const t=this.ghosts.get(e.id),i=e.source_bounds;if(!t||!i||i.max_x<=i.min_x||i.max_y<=i.min_y)return q;const o=e.width/(i.max_x-i.min_x),n=e.height/(i.max_y-i.min_y),s=e=>e.map(([e,t])=>`${e},${t}`).join(" ");return K`
      <g
        class="ghost"
        transform="translate(${-e.width/2} ${-e.height/2}) scale(${o} ${n}) translate(${-i.min_x} ${-i.min_y})"
      >
        ${t.rooms.map(e=>K`<polygon class="ghost-room" points=${s(e)}></polygon>`)}
        ${t.walls.map(e=>K`<polyline class="ghost-wall" points=${s(e)}></polyline>`)}
      </g>
    `}_renderPlacement(e){const t=e.id===this.selectedPlacementId,i=e.label_override||this.floorNameById.get(e.floor_id)||e.floor_id,o=this._pxToUnits(7),n=this._pxToUnits(26);return K`
      <g transform="translate(${e.x} ${e.y}) rotate(${e.rotation_deg})">
        <rect
          class="placement-rect ${t?"selected":""}"
          x=${-e.width/2}
          y=${-e.height/2}
          width=${e.width}
          height=${e.height}
        ></rect>
        ${this._renderGhost(e)}
        <text class="placement-label" y=${-e.height/2-o}>${i}</text>
        ${t?K`
              <line
                class="rotate-stick"
                x1="0" y1=${-e.height/2}
                x2="0" y2=${-e.height/2-n}
              ></line>
              <circle class="rotate-handle" cx="0" cy=${-e.height/2-n} r=${o}></circle>
              <circle class="resize-handle" cx=${-e.width/2} cy=${-e.height/2} r=${o}></circle>
              <circle class="resize-handle" cx=${e.width/2} cy=${-e.height/2} r=${o}></circle>
              <circle class="resize-handle" cx=${e.width/2} cy=${e.height/2} r=${o}></circle>
              <circle class="resize-handle" cx=${-e.width/2} cy=${e.height/2} r=${o}></circle>
            `:q}
      </g>
    `}_renderMeshLink(e){const t=null!==e.from.floorId||null!==e.to.floorId;return K`
      <line
        class="mesh-link ${t?"indoor":""} ${e.key===this.selectedMeshLinkKey?"selected":this.selectedMeshLinkKey?"dim":""}"
        x1=${e.from.x}
        y1=${e.from.y}
        x2=${e.to.x}
        y2=${e.to.y}
        style="stroke:${ve(e.quality)}"
      >
        <title>${e.from.label} → ${e.to.label}: ${e.detail??e.quality}</title>
      </line>
    `}_renderIndoorEnds(){const e=this._pxToUnits(5),t=new Map;for(const e of this.meshLinks)for(const i of[e.from,e.to])null!==i.floorId&&t.set(i.deviceId,i);return[...t.values()].map(t=>K`
        <circle class="indoor-end" cx=${t.x} cy=${t.y} r=${e}>
          <title>${t.label}</title>
        </circle>
      `)}_renderPin(e){return this._pinIcons.renderMarker(e.x,e.y,this._pxToUnits(12),this._pinIcons.iconForPin(e,this.entityLookup.values()),"var(--sc-accent)",e.id===this.selectedPinId,e.label_override??xe(e.device_id,this.entityLookup.values()))}render(){const e=this._viewBox;return G`
      ${this.mapBackground?G`<div class="map-layer"></div>
              ${this._mapError?G`<div class="map-error">
                      ${Le("mapBackground.failed",{error:this._mapError})}
                    </div>`:q}`:q}
      ${this._renderBackgroundOverlay()}
      ${K`
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
      ${this.mapBackground?G`<div class="map-attribution">
              ${"aerial"===this.mapBackground.style?"Imagery © Esri, Maxar, Earthstar Geographics, and the GIS User Community":G`©
                      <a
                        href="https://www.openstreetmap.org/copyright"
                        target="_blank"
                        rel="noopener noreferrer"
                        >OpenStreetMap</a
                      >
                      contributors`}
            </div>`:q}
      <div class="controls">
        <button
          @click=${()=>this._zoomButton(.87)}
          title=${Le("canvasControls.zoomIn")}
        >
          <ha-icon icon="mdi:plus"></ha-icon>
        </button>
        <button
          @click=${()=>this._zoomButton(1.15)}
          title=${Le("canvasControls.zoomOut")}
        >
          <ha-icon icon="mdi:minus"></ha-icon>
        </button>
        <button
          @click=${()=>this.fitToScreen()}
          title=${Le("canvasControls.fit")}
        >
          <ha-icon icon="mdi:fit-to-screen-outline"></ha-icon>
        </button>
      </div>
    `}};to.styles=[bt,Tt,a`
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
      ${vt}
    `],e([ge({attribute:!1})],to.prototype,"placements",void 0),e([ge({attribute:!1})],to.prototype,"ghosts",void 0),e([ge({attribute:!1})],to.prototype,"floorNameById",void 0),e([ge({attribute:!1})],to.prototype,"floorIconById",void 0),e([ge({attribute:!1})],to.prototype,"backgroundImageUrl",void 0),e([ge({type:Number})],to.prototype,"backgroundOpacity",void 0),e([ge({type:Number})],to.prototype,"backgroundOffsetX",void 0),e([ge({type:Number})],to.prototype,"backgroundOffsetY",void 0),e([ge({type:Number})],to.prototype,"backgroundScale",void 0),e([ge({attribute:!1})],to.prototype,"mode",void 0),e([ge({attribute:!1})],to.prototype,"selectedPlacementId",void 0),e([ge({attribute:!1})],to.prototype,"pins",void 0),e([ge({attribute:!1})],to.prototype,"selectedPinId",void 0),e([ge({attribute:!1})],to.prototype,"entityLookup",void 0),e([ge({attribute:!1})],to.prototype,"meshLinks",void 0),e([ge({attribute:!1})],to.prototype,"selectedMeshLinkKey",void 0),e([ge({attribute:!1})],to.prototype,"initialViewBox",void 0),e([ge({attribute:!1})],to.prototype,"mapBackground",void 0),e([ge({type:Boolean,reflect:!0})],to.prototype,"dark",void 0),e([ge({attribute:!1})],to.prototype,"hass",void 0),e([_e()],to.prototype,"_mapError",void 0),e([_e()],to.prototype,"_viewBox",void 0),e([_e()],to.prototype,"_naturalHeight",void 0),e([me("svg")],to.prototype,"_svg",void 0),to=e([fe("property-canvas")],to);let io=class extends de{constructor(){super(...arguments),this.floors=[],this.selectedFloorId=null,this.propertySelected=!1}render(){return G`
      ${this.floors.map(e=>G`
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
        <span>${Le("floorTabs.property")}</span>
      </button>
    `}};io.styles=[bt,a`
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
    `],e([ge({attribute:!1})],io.prototype,"floors",void 0),e([ge({attribute:!1})],io.prototype,"selectedFloorId",void 0),e([ge({type:Boolean})],io.prototype,"propertySelected",void 0),io=e([fe("floor-tabs")],io);let oo=class extends de{constructor(){super(...arguments),this.floors=[],this.selectedFloorId=null,this.propertySelected=!1}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}render(){return G`
      <div class="identity">
        <button
          class="icon-button menu-button"
          title=${Le("appHeader.menu")}
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
    `}};oo.styles=[bt,a`
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
    `],e([ge({attribute:!1})],oo.prototype,"floors",void 0),e([ge({attribute:!1})],oo.prototype,"selectedFloorId",void 0),e([ge({type:Boolean})],oo.prototype,"propertySelected",void 0),oo=e([fe("app-header")],oo);let no=class extends de{constructor(){super(...arguments),this.dirty=!1,this.saving=!1,this.canUndo=!1,this.canRedo=!1}_fire(e){this.dispatchEvent(new CustomEvent(e,{bubbles:!0,composed:!0}))}render(){return G`
      <button
        title=${Le("rowActions.undo")}
        ?disabled=${!this.canUndo}
        @click=${()=>this._fire("undo-click")}
      >
        <ha-icon icon="mdi:undo"></ha-icon>
      </button>
      <button
        title=${Le("rowActions.redo")}
        ?disabled=${!this.canRedo}
        @click=${()=>this._fire("redo-click")}
      >
        <ha-icon icon="mdi:redo"></ha-icon>
      </button>
      <button
        title=${this.saving?Le("appHeader.saving"):Le("appHeader.save")}
        ?disabled=${this.saving}
        @click=${()=>this._fire("save-click")}
      >
        <ha-icon icon="mdi:content-save"></ha-icon>
        ${this.dirty?G`<span class="dirty-dot"></span>`:q}
      </button>
    `}};no.styles=[bt,a`
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
    `],e([ge({type:Boolean})],no.prototype,"dirty",void 0),e([ge({type:Boolean})],no.prototype,"saving",void 0),e([ge({type:Boolean})],no.prototype,"canUndo",void 0),e([ge({type:Boolean})],no.prototype,"canRedo",void 0),no=e([fe("row-actions")],no);const so=a`
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
`;function ro(e){return G`
    <div class="info-card floating-panel">
      <div class="info-head">
        <button
          class="info-close"
          title=${Le("canvas.button.close")}
          @click=${e.onClose}
        >
          <ha-icon icon="mdi:close"></ha-icon>
        </button>
        <div class="info-titles">
          <div class="info-title">${e.title}</div>
          ${e.subtitle?G`<div class="info-sub">${e.subtitle}</div>`:q}
        </div>
        ${e.onToggle?G`<button
                class="info-toggle"
                title=${Le(e.collapsed?"canvas.card.show":"canvas.card.hide")}
                aria-expanded=${e.collapsed?"false":"true"}
                @click=${e.onToggle}
              >
                <ha-icon
                  icon=${e.collapsed?"mdi:chevron-down":"mdi:chevron-up"}
                ></ha-icon>
              </button>`:q}
      </div>
      ${e.collapsed?q:G`<div class="info-body">${e.body}</div>
              ${e.footer?G`<div class="info-foot">${e.footer}</div>`:q}`}
    </div>
  `}function ao(e,t,i,o=!1){return G`<button
    class="info-row action ${o?"active":""}"
    @click=${i}
  >
    <ha-icon icon=${e}></ha-icon>
    <span class="grow">${t}</span>
  </button>`}function lo(e,t,i){return G`<div class="info-row">
    <ha-icon icon=${e}></ha-icon>
    <span class="grow">${t}</span>
    ${i}
  </div>`}function co(e){return G`<span class="select-wrap"
    >${e}<ha-icon class="chev" icon="mdi:menu-down"></ha-icon
  ></span>`}function ho(e,t){return G`<button class="danger" @click=${t}>
    <ha-icon icon="mdi:delete"></ha-icon> ${e}
  </button>`}function uo(e,t){const i={strong:0,medium:1,weak:2,unknown:3},o=[...t].sort((e,t)=>i[e.quality]-i[t.quality]);return G`<div class="info-group">
    <div class="info-group-title">
      ${e} ·
      ${Le("canvas.card.links",{count:o.length})}
    </div>
    ${0===o.length?G`<div class="info-row">
            <span class="grow info-sub"
              >${Le("canvas.card.noLinks")}</span
            >
          </div>`:o.map(e=>{const t=e.where?`${e.name} - ${e.where}`:e.name;return G`<div class="info-row link-row">
              <span
                class="quality-dot"
                style="background:${ve(e.quality)}"
              ></span>
              <span class="link-text">
                <span class="link-name" title=${t}>${t}</span>
                <span
                  class="link-detail"
                  style="color:${ve(e.quality)}"
                  >${e.detail}</span
                >
              </span>
            </div>`})}
  </div>`}const po=[{key:"primary",label:"Primary",cssVar:"--primary-color",fallback:"#03a9f4"},{key:"accent",label:"Accent",cssVar:"--accent-color",fallback:"#ff9800"},{key:"red",label:"Red",cssVar:"--red-color",fallback:"#f44336"},{key:"pink",label:"Pink",cssVar:"--pink-color",fallback:"#e91e63"},{key:"purple",label:"Purple",cssVar:"--purple-color",fallback:"#926bc7"},{key:"deep-purple",label:"Deep purple",cssVar:"--deep-purple-color",fallback:"#6e41ab"},{key:"indigo",label:"Indigo",cssVar:"--indigo-color",fallback:"#3f51b5"},{key:"blue",label:"Blue",cssVar:"--blue-color",fallback:"#2196f3"},{key:"light-blue",label:"Light blue",cssVar:"--light-blue-color",fallback:"#03a9f4"},{key:"cyan",label:"Cyan",cssVar:"--cyan-color",fallback:"#00bcd4"},{key:"teal",label:"Teal",cssVar:"--teal-color",fallback:"#009688"},{key:"green",label:"Green",cssVar:"--green-color",fallback:"#4caf50"},{key:"light-green",label:"Light green",cssVar:"--light-green-color",fallback:"#8bc34a"},{key:"lime",label:"Lime",cssVar:"--lime-color",fallback:"#cddc39"},{key:"yellow",label:"Yellow",cssVar:"--yellow-color",fallback:"#ffeb3b"},{key:"amber",label:"Amber",cssVar:"--amber-color",fallback:"#ffc107"},{key:"orange",label:"Orange",cssVar:"--orange-color",fallback:"#ff9800"},{key:"deep-orange",label:"Deep orange",cssVar:"--deep-orange-color",fallback:"#ff5722"},{key:"brown",label:"Brown",cssVar:"--brown-color",fallback:"#795548"},{key:"light-grey",label:"Light grey",cssVar:"--light-grey-color",fallback:"#bdbdbd"},{key:"grey",label:"Grey",cssVar:"--grey-color",fallback:"#9e9e9e"},{key:"dark-grey",label:"Dark grey",cssVar:"--dark-grey-color",fallback:"#616161"},{key:"blue-grey",label:"Blue grey",cssVar:"--blue-grey-color",fallback:"#607d8b"},{key:"black",label:"Black",cssVar:"--black-color",fallback:"#000000"},{key:"white",label:"White",cssVar:"--white-color",fallback:"#ffffff"}];let go;function _o(e,t){return function(e,t){if(void 0===go&&(go=document.createElement("canvas").getContext("2d")),!go)return t;go.fillStyle=t,go.fillStyle=e;const i=go.fillStyle;return"string"==typeof i&&i.startsWith("#")?i:t}(getComputedStyle(e).getPropertyValue(t.cssVar).trim()||t.fallback,t.fallback)}const mo=a`
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
`;function fo(){const e=`linear-gradient(to right, ${ve("weak")}, ${ve("medium")}, ${ve("strong")})`;return G`<div class="mesh-legend floating-panel">
    <span>${Le("legend.weak")}</span>
    <span class="gradient" style="background:${e}"></span>
    <span>${Le("legend.strong")}</span>
  </div>`}const bo=[255,205,120];function vo(e,t,i){const o=new Set,n=e=>{for(const t of[e.area_id,...e.linked_area_ids??[]])if(t)for(const e of i.get(t)??[])o.add(e);for(const t of e.light_entity_ids??[])o.add(t)};n(e);for(const i of e.linked_room_ids??[]){const o=t.find(e=>e.id===i);o&&o.id!==e.id&&n(o)}return[...o]}function yo([e,t,i]){const o=e=>Math.round(Math.max(0,Math.min(255,e))).toString(16).padStart(2,"0");return`#${o(e)}${o(t)}${o(i)}`}function wo(e){const t=e.rgb_color;return Array.isArray(t)&&3===t.length&&t.every(e=>"number"==typeof e)?t:bo}function ko(e,t){const i=new Map;if(!t)return i;const o=function(e){const t=new Map;for(const i of Object.keys(e.states)){if(!i.startsWith("light."))continue;const o=e.entities?.[i],n=o?.area_id??(o?.device_id?e.devices?.[o.device_id]?.area_id:null)??null;if(!n)continue;const s=t.get(n);s?s.push(i):t.set(n,[i])}return t}(t);for(const n of e){const s=vo(n,e,o);if(0===s.length)continue;let r=0,a=0,l=0;const c=[0,0,0];for(const e of s){const i=t.states[e];if(!i||"unavailable"===i.state||"unknown"===i.state){a++;continue}if("on"!==i.state)continue;r++;const o=i.attributes.brightness;l+="number"==typeof o?o/255:1;const n=wo(i.attributes);c[0]+=n[0],c[1]+=n[1],c[2]+=n[2]}i.set(n.id,{entityIds:s,on:r,unavailable:a,level:s.length?l/s.length:0,color:yo(r?[c[0]/r,c[1]/r,c[2]/r]:bo)})}return i}function xo(e,t){const i=e.states[t];if(!i||"unavailable"===i.state||"unknown"===i.state)return null;const o=i.attributes.current_position;if("number"==typeof o)return Math.max(0,Math.min(1,o/100));const n=i.attributes.current_tilt_position;return"number"==typeof n?Math.max(0,Math.min(1,n/100)):"open"===i.state||"opening"===i.state?1:0}const $o=["light","switch","fan","cover","lock","media_player","climate","binary_sensor","vacuum"];function Mo(e){return $o.map(t=>e.find(e=>e.startsWith(`${t}.`))).find(Boolean)}function Po(e,t,i){if("unavailable"===t)return"#9e9e9e";switch(e){case"light":return"on"===t?yo(wo(i)):null;case"switch":case"fan":return"on"===t?"#ffb300":null;case"cover":return"open"===t||"opening"===t?"#42a5f5":null;case"lock":return"unlocked"===t||"open"===t?"#ef5350":null;case"media_player":return"playing"===t?"#ab47bc":null;case"climate":return"off"!==t?"#ff7043":null;case"binary_sensor":return"on"===t?"#ef5350":null;case"vacuum":return"cleaning"===t?"#26a69a":null;default:return null}}const So={switch:.45,fan:.35,input_boolean:.35,media_player:.4,climate:.4};function Io(e,t){const i=e.states[t],o=t.split(".")[0]??"";if(!i||"unavailable"===i.state||"unknown"===i.state)return{color:null,glow:0,active:!1,unavailable:!0,text:i?.state??"unavailable"};const n=i.state??"",s=i.attributes;let r=n,a="input_boolean"===o?"on"===n?"#ffb300":null:Po(o,n,s),l=a?So[o]??0:0;if("light"===o&&"on"===n){const e=s.brightness,t="number"==typeof e?e/255:1;l=Math.max(.25,t),r=`on · ${Math.round(100*t)}%`}else if("cover"===o){const i=xo(e,t);null!==i&&"number"==typeof s.current_position&&(r=`${n} · ${Math.round(100*i)}%`)}else if("sensor"===o){const e=s.unit_of_measurement;r="string"==typeof e?`${n} ${e}`:n,a=null}return{color:a,glow:l,active:null!==a,unavailable:!1,text:r}}const Co=["light","switch","fan","cover","media_player","climate","lock","vacuum","input_boolean","binary_sensor","sensor"];let Lo=class extends de{constructor(){super(...arguments),this.mode="select",this.armedOpeningType=null,this.hasPendingTrace=!1,this.hasPendingWall=!1,this.snapMode="all",this.pendingScaleCount=0,this.selectedRoom=null,this.editingRoom=!1,this.areas=[],this.selectedPin=null,this.selectedWall=null,this.editingWall=!1,this.unitSystem="metric",this.unitsPerMeter=null,this.pinStack=null,this.entityLookup=new Map,this.selectedOpening=null,this.selectedFurniture=null,this.furnitureLibraryOpen=!1,this.rooms=[],this.allAreas=[],this.lightEntities=[],this.coverEntities=[],this.selectedRoomLight=null,this.selectedCoverOpenness=null,this.floorCalibrated=!1,this.linkableEntities=[],this.selectedItemState=null,this._colorOpen=!1,this.dirty=!1,this.saving=!1,this.canUndo=!1,this.canRedo=!1,this.meshLegend=!1,this.meshLinks=[],this.meshStubs=[],this.networkLabel=null,this.selectedMeshLink=null,this.selectedMeshStub=null,this.otherFloors=[],this.alignTargetFloorId=null,this.alignTargetHasBackground=!0,this._wallThicknessUnit=null,this._openingWidthUnit=null,this._furnitureSizeUnit=null,this._cardCollapsed=!1,this._card=e=>ro({...e,collapsed:this._cardCollapsed,onToggle:()=>this._cardCollapsed=!this._cardCollapsed}),this._actionRow=ao,this._fieldRow=lo,this._selectWrap=co,this._clearSelection=()=>this._fire("selection-clear")}willUpdate(e){e.has("selectedRoom")&&e.get("selectedRoom")?.id!==this.selectedRoom?.id&&(this._colorOpen=!1),e.has("selectedWall")&&e.get("selectedWall")?.id!==this.selectedWall?.id&&(this._wallThicknessUnit=null),e.has("selectedOpening")&&e.get("selectedOpening")?.id!==this.selectedOpening?.id&&(this._openingWidthUnit=null),e.has("selectedFurniture")&&e.get("selectedFurniture")?.id!==this.selectedFurniture?.id&&(this._furnitureSizeUnit=null)}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}_unitSelect(e,t){return G`
      <select
        class="small-unit-select"
        @change=${e=>t(e.target.value)}
      >
        ${(i=this.unitSystem,"imperial"===i?["in","ft"]:["cm","m"]).map(t=>G`<option value=${t} ?selected=${t===e}>
              ${t}
            </option>`)}
      </select>
    `;var i}_thicknessInputAttrs(e){switch(e){case"cm":return{min:"1",max:"100",step:"0.5"};case"m":return{min:"0.01",max:"1",step:"0.01"};case"in":return{min:"0.5",max:"40",step:"0.1"};case"ft":return{min:"0.02",max:"1.5",step:"0.01"}}}_modeButton(e,t,i){return G`<button
      class=${this.mode===e?"active":""}
      title=${i}
      @click=${()=>this._fire("mode-change",{mode:e})}
    >
      <ha-icon icon=${t}></ha-icon>
    </button>`}_openingModeButton(e,t,i){const o="opening"===this.mode&&this.armedOpeningType===e;return G`<button
      class=${o?"active":""}
      title=${i}
      @click=${()=>this._fire("add-opening-click",{openingType:e})}
    >
      <ha-icon icon=${t}></ha-icon>
    </button>`}_renderModeToolbar(){return G`
      <div class="mode-toolbar">
        ${this._modeButton("select","mdi:cursor-default-click",Le("canvas.mode.select"))}
        ${this._modeButton("pan","mdi:hand-back-right-outline",Le("canvas.mode.pan"))}
        <span class="tool-divider"></span>
        ${this._modeButton("trace","mdi:vector-square",Le("canvas.mode.trace"))}
        ${this._modeButton("wall","mdi:wall",Le("canvas.mode.wall"))}
        ${this._openingModeButton("door","mdi:door",Le("canvas.mode.door"))}
        ${this._openingModeButton("window","mdi:window-closed-variant",Le("canvas.mode.window"))}
        ${this._modeButton("scale","mdi:ruler",Le("canvas.mode.scale"))}
        <span class="tool-divider"></span>
        ${this._modeButton("place","mdi:map-marker-plus",Le("canvas.mode.place"))}
        <button
          class=${this.furnitureLibraryOpen?"active":""}
          title=${Le("canvas.mode.furniture")}
          @click=${()=>this._fire("furniture-library-click")}
        >
          <ha-icon icon="mdi:sofa-single-outline"></ha-icon>
        </button>
        ${this._modeButton("align","mdi:compare",Le("canvas.mode.align"))}
      </div>
    `}_renderSnapSelect(){return G`<select
      class="snap-select"
      title=${Le("canvas.snap.tooltip")}
      @change=${e=>this._fire("snap-mode-change",{snapMode:e.target.value})}
    >
      <option value="all" ?selected=${"all"===this.snapMode}>
        ${Le("canvas.snap.all")}
      </option>
      <option value="same" ?selected=${"same"===this.snapMode}>
        ${"wall"===this.mode?Le("canvas.snap.walls"):Le("canvas.snap.rooms")}
      </option>
      <option value="off" ?selected=${"off"===this.snapMode}>
        ${Le("canvas.snap.off")}
      </option>
    </select>`}_renderHintBar(){return"trace"===this.mode?G`<div class="hint-bar floating-panel">
        <span class="hint"
          >${this.hasPendingTrace?Le("canvas.hint.closeRoom"):Le("canvas.hint.addPoints")}</span
        >
        ${this._renderSnapSelect()}
        ${this.hasPendingTrace?G`<button @click=${()=>this._fire("cancel-pending-click")}>
                ${Le("canvas.button.cancel")}
              </button>`:q}
      </div>`:"wall"===this.mode?G`<div class="hint-bar floating-panel">
        <span class="hint"
          >${this.hasPendingWall?Le("canvas.hint.addWallPointsFinish"):Le("canvas.hint.addWallPoints")}</span
        >
        ${this._renderSnapSelect()}
        ${this.hasPendingWall?G`<button
                class="primary"
                @click=${()=>this._fire("finish-wall-click")}
              >
                ${Le("canvas.button.finishWall")}
              </button>`:q}
        ${this.hasPendingWall?G`<button @click=${()=>this._fire("cancel-pending-click")}>
                ${Le("canvas.button.cancel")}
              </button>`:q}
      </div>`:"scale"===this.mode?G`<div class="hint-bar floating-panel">
        <span class="hint"
          >${0===this.pendingScaleCount?Le("canvas.hint.scaleFirst"):Le("canvas.hint.scaleSecond")}</span
        >
        ${this.pendingScaleCount>0?G`<button @click=${()=>this._fire("cancel-pending-click")}>
                ${Le("canvas.button.cancel")}
              </button>`:q}
      </div>`:"opening"===this.mode?G`<div class="hint-bar floating-panel">
        <span class="hint"
          >${Le("canvas.hint.placeOpening",{type:Le(`canvas.openingType.${this.armedOpeningType??"opening"}`)})}</span
        >
      </div>`:"align"===this.mode?this._renderAlignBar():"furniture"===this.mode?G`<div class="hint-bar floating-panel">
        <span class="hint">${Le("canvas.hint.placeFurniture")}</span>
        <button @click=${()=>this._fire("furniture-rotate-armed-click")}>
          <ha-icon icon="mdi:rotate-right-variant"></ha-icon>
        </button>
        <button @click=${()=>this._fire("furniture-done-click")}>
          ${Le("canvas.button.done")}
        </button>
      </div>`:q}_renderLinks(e,t,i,o,n){const s=i.map(e=>e.id),r=o.filter(e=>!s.includes(e.id));return G`
      ${this._fieldRow(e,t,this._selectWrap(G`<select
            @change=${e=>{const t=e.target;t.value&&n([...s,t.value]),t.value=""}}
          >
            <option value="" selected>${Le("canvas.links.add")}</option>
            ${r.map(e=>G`<option value=${e.id}>${e.label}</option>`)}
          </select>`))}
      ${i.length?G`<div class="link-chips">
              ${i.map(e=>G`<span class="link-chip"
                    ><span>${e.label}</span
                    ><button
                      title=${Le("canvas.links.remove")}
                      @click=${()=>n(s.filter(t=>t!==e.id))}
                    >
                      <ha-icon icon="mdi:close"></ha-icon></button
                  ></span>`)}
            </div>`:q}
    `}_renderRoomLights(e){const t=this.selectedRoomLight,i=e=>this.allAreas.find(t=>t.area_id===e)?.name??e,o=e=>this.lightEntities.find(t=>t.entity_id===e)?.name??e,n=e=>this.rooms.find(t=>t.id===e)?.name??e;return G`<div class="info-group">
      <div class="info-group-title">${Le("canvas.lights.title")}</div>
      ${this._fieldRow(t&&t.on>0?"mdi:lightbulb-on":"mdi:lightbulb-outline",t?Le("canvas.lights.count",{on:t.on,total:t.entityIds.length}):Le("canvas.lights.none"),t?G`<span class="light-buttons">
              <button
                @click=${()=>this._fire("room-lights-command",{on:!0})}
              >
                ${Le("canvas.lights.on")}
              </button>
              <button
                @click=${()=>this._fire("room-lights-command",{on:!1})}
              >
                ${Le("canvas.lights.off")}
              </button>
            </span>`:q)}
      ${this._renderLinks("mdi:link-variant",Le("canvas.links.areas"),(e.linked_area_ids??[]).map(e=>({id:e,label:i(e)})),this.allAreas.filter(t=>t.area_id!==e.area_id).map(e=>({id:e.area_id,label:e.name})),e=>this._fire("room-links-change",{linked_area_ids:e}))}
      ${this._renderLinks("mdi:vector-link",Le("canvas.links.rooms"),(e.linked_room_ids??[]).map(e=>({id:e,label:n(e)})),this.rooms.filter(t=>t.id!==e.id).map(e=>({id:e.id,label:e.name})),e=>this._fire("room-links-change",{linked_room_ids:e}))}
      ${this._renderLinks("mdi:lightbulb-multiple-outline",Le("canvas.links.lights"),(e.light_entity_ids??[]).map(e=>({id:e,label:o(e)})),this.lightEntities.map(e=>({id:e.entity_id,label:e.name})),e=>this._fire("room-links-change",{light_entity_ids:e}))}
    </div>`}_renderItemEntity(e){const t=this.selectedItemState,i=Co.map(e=>({domain:e,entities:this.linkableEntities.filter(t=>t.entity_id.startsWith(`${e}.`))})).filter(e=>e.entities.length>0);return G`<div class="info-group">
      <div class="info-group-title">${Le("furniture.entityTitle")}</div>
      ${this._fieldRow("mdi:link-variant",Le("furniture.entity"),this._selectWrap(G`<select
            @change=${e=>this._fire("furniture-change",{patch:{entity_id:e.target.value||null}})}
          >
            <option value="" ?selected=${!e.entity_id}>
              ${Le("furniture.noEntity")}
            </option>
            ${i.map(t=>G`<optgroup label=${t.domain}>
                  ${t.entities.map(t=>G`<option
                        value=${t.entity_id}
                        ?selected=${t.entity_id===e.entity_id}
                      >
                        ${t.name}
                      </option>`)}
                </optgroup>`)}
          </select>`))}
      ${e.entity_id&&t?this._fieldRow(t.active?"mdi:lightbulb-on":"mdi:circle-outline",t.text,(o=e.entity_id,["light","switch","fan","input_boolean","cover","media_player"].includes(o.split(".")[0]??"")?G`<span class="light-buttons"
                    ><button
                      @click=${()=>this._fire("furniture-entity-toggle")}
                    >
                      ${Le("furniture.toggle")}
                    </button></span
                  >`:q)):q}
    </div>`;var o}_renderFurnitureCard(e){const t=Ot(e.kind),i=this._furnitureSizeUnit??gt(this.unitSystem),o=e=>this._fire("furniture-change",{patch:e}),n=t=>G`<input
        type="number"
        class="furniture-size"
        min="0"
        step=${"cm"===i||"in"===i?"1":"0.01"}
        .value=${_t(e[t],i)}
        @change=${e=>{const n=mt(e.target.value,i);null!==n&&Number.isFinite(n)&&n>=1&&o({[t]:Math.round(10*n)/10})}}
      />`,s=(t,i,n)=>this._fieldRow(t,i,G`<input
          type="checkbox"
          class="switch"
          role="switch"
          .checked=${!!e[n]}
          @change=${e=>o({[n]:e.target.checked})}
        />`);return this._card({title:e.label||t?.name||e.kind,subtitle:Le(t?`furniture.category.${t.category}`:"canvas.card.furniture"),onClose:this._clearSelection,body:G`
        <div class="info-group">
          ${this._fieldRow("mdi:pencil",Le("canvas.card.name"),G`<input
              type="text"
              class="text-field"
              placeholder=${t?.name??""}
              .value=${e.label??""}
              @change=${e=>o({label:e.target.value.trim()||null})}
            />`)}
          ${s("mdi:format-text",Le("furniture.showLabel"),"show_label")}
          ${this._fieldRow("mdi:arrow-expand-horizontal",Le("furniture.width",{unit:i}),G`<span class="inline-pair"
              >${n("width_cm")}${this._unitSelect(i,e=>this._furnitureSizeUnit=e)}</span
            >`)}
          ${this._fieldRow("mdi:arrow-expand-vertical",Le("furniture.depth",{unit:i}),n("depth_cm"))}
          ${this.floorCalibrated?q:G`<div class="info-row">
                  <span class="grow info-sub"
                    >${Le("furniture.calibrate")}</span
                  >
                </div>`}
          ${this._fieldRow("mdi:rotate-right",Le("furniture.rotation"),G`<span class="inline-pair">
              <input
                type="number"
                class="furniture-size"
                step="1"
                .value=${String(Math.round(10*e.rotation_deg)/10)}
                @change=${e=>{const t=Number(e.target.value);Number.isFinite(t)&&o({rotation_deg:(t%360+360)%360})}}
              />
              <span class="icon-buttons">
                <button
                  title=${Le("furniture.rotateLeft")}
                  @click=${()=>o({rotation_deg:(e.rotation_deg+270)%360})}
                >
                  <ha-icon icon="mdi:rotate-left"></ha-icon>
                </button>
                <button
                  title=${Le("furniture.rotateRight")}
                  @click=${()=>o({rotation_deg:(e.rotation_deg+90)%360})}
                >
                  <ha-icon icon="mdi:rotate-right"></ha-icon>
                </button>
              </span>
            </span>`)}
        </div>
        <div class="info-group">
          <div class="info-group-title">${Le("canvas.card.style")}</div>
          ${this._fieldRow("mdi:format-line-weight",Le("furniture.lineThickness",{px:e.stroke_width.toFixed(1)}),G`<input
              type="range"
              class="stroke-range"
              min="0.5"
              max="6"
              step="0.25"
              style="--pct:${(e.stroke_width-.5)/5.5*100}%"
              .value=${String(e.stroke_width)}
              @input=${e=>o({stroke_width:Number(e.target.value)})}
            />`)}
          ${this._fieldRow("mdi:palette",Le("canvas.card.colour"),G`<span class="inline-pair">
              ${e.color?G`<button
                      class="color-reset"
                      @click=${()=>o({color:null})}
                    >
                      ${Le("canvas.card.colourDefault")}
                    </button>`:q}
              <input
                type="color"
                class="room-fill-color"
                .value=${e.color??"#607d8b"}
                @input=${e=>o({color:e.target.value})}
              />
            </span>`)}
          ${s("mdi:format-color-fill",Le("furniture.fill"),"fill")}
          ${s("mdi:flip-horizontal",Le("furniture.mirror"),"mirrored")}
          ${s("mdi:lock-outline",Le("furniture.lock"),"locked")}
        </div>
        ${this._renderItemEntity(e)}
        <div class="info-group">
          ${this._actionRow("mdi:content-copy",Le("furniture.duplicate"),()=>this._fire("furniture-duplicate-click"))}
          ${this._actionRow("mdi:arrange-bring-to-front",Le("furniture.toFront"),()=>this._fire("furniture-order-click",{front:!0}))}
          ${this._actionRow("mdi:arrange-send-to-back",Le("furniture.toBack"),()=>this._fire("furniture-order-click",{front:!1}))}
        </div>
      `,footer:this._deleteButton(Le("furniture.delete"),"furniture-delete-click")})}_renderAlignBar(){return this.alignTargetFloorId?this.alignTargetHasBackground?G`<div class="hint-bar floating-panel">
      <span class="hint">${Le("canvas.hint.alignDrag")}</span>
      <button
        title=${Le("canvas.align.shrink")}
        @click=${()=>this._fire("align-scale-click",{factor:.995})}
      >
        −
      </button>
      <button
        title=${Le("canvas.align.grow")}
        @click=${()=>this._fire("align-scale-click",{factor:1.0050251})}
      >
        +
      </button>
      <button class="primary" @click=${()=>this._fire("align-apply-click")}>
        ${Le("canvas.button.apply")}
      </button>
      <button @click=${()=>this._fire("align-cancel-click")}>
        ${Le("canvas.button.cancel")}
      </button>
    </div>`:G`<div class="hint-bar floating-panel">
        <span class="hint">${Le("canvas.hint.noBackground")}</span>
        <button
          @click=${()=>this._fire("align-target-change",{floorId:null})}
        >
          ${Le("canvas.button.chooseAnother")}
        </button>
        <button @click=${()=>this._fire("align-cancel-click")}>
          ${Le("canvas.button.cancel")}
        </button>
      </div>`:G`<div class="hint-bar floating-panel">
        <span class="hint">${Le("canvas.hint.alignAgainst")}</span>
        <select
          @change=${e=>this._fire("align-target-change",{floorId:e.target.value})}
        >
          <option value="" selected>${Le("canvas.align.choose")}</option>
          ${this.otherFloors.map(e=>G`<option value=${e.floor_id}>${e.name}</option>`)}
        </select>
        <button @click=${()=>this._fire("align-cancel-click")}>
          ${Le("canvas.button.cancel")}
        </button>
      </div>`}_areaOptions(e,t){return e.map(e=>G`<option
          value=${e.area_id}
          ?selected=${e.area_id===t}
        >
          ${e.name}
        </option>`)}_deleteButton(e,t){return ho(e,()=>this._fire(t))}_renderColourPicker(e){const t=po.map(e=>({...e,label:Le(`colors.${e.key.replace(/-/g,"_")}`),hex:_o(this,e)})),i=(e.fill_color??"").toLowerCase(),o=t.find(e=>e.hex.toLowerCase()===i),n=e.fill_color??_i,s=e.fill_color?o?.label??Le("canvas.card.colourCustom"):Le("canvas.card.colourDefault"),r=e=>{this._colorOpen=!1,this._fire("room-fill-color-change",{color:e})};return G`
      <div class="info-row">
        <ha-icon icon="mdi:palette"></ha-icon>
        <span class="grow">${Le("canvas.card.colour")}</span>
        <button
          class="color-field"
          aria-expanded=${this._colorOpen?"true":"false"}
          @click=${()=>this._colorOpen=!this._colorOpen}
        >
          <span class="swatch" style="background:${n}"></span>
          <span class="color-name">${s}</span>
          <ha-icon
            icon=${this._colorOpen?"mdi:menu-up":"mdi:menu-down"}
          ></ha-icon>
        </button>
      </div>
      ${this._colorOpen?G`<div class="color-list">
              ${t.map(e=>G`<button
                    class="color-item ${e.hex.toLowerCase()===i?"selected":""}"
                    @click=${()=>r(e.hex)}
                  >
                    <span class="swatch" style="background:${e.hex}"></span>
                    <span class="grow">${e.label}</span>
                    ${e.hex.toLowerCase()===i?G`<ha-icon icon="mdi:check"></ha-icon>`:q}
                  </button>`)}
              <label class="color-item custom">
                <span class="swatch custom-swatch"></span>
                <span class="grow"
                  >${Le("canvas.card.colourCustom")}</span
                >
                <input
                  type="color"
                  class="room-fill-color"
                  .value=${n}
                  @input=${e=>this._fire("room-fill-color-change",{color:e.target.value})}
                />
              </label>
            </div>`:q}
    `}_renderDeviceNetwork(e){return this.networkLabel?uo(this.networkLabel,[...this.meshLinks.filter(t=>t.fromPin.id===e.id||t.toPin.id===e.id).map(t=>({name:this._pinLabel(t.fromPin.id===e.id?t.toPin:t.fromPin),where:"",quality:t.quality,detail:t.detail??t.quality})),...this.meshStubs.filter(t=>t.fromPin.id===e.id).map(e=>({name:e.targetLabel,where:e.targetFloorName,quality:e.quality,detail:e.detail??e.quality}))]):q}_renderSelectionPanel(){if(this.selectedRoom){const e=this.selectedRoom,t=!1!==e.visible,i=this.areas.find(t=>t.area_id===e.area_id);return this._card({title:e.name,subtitle:i?i.name:Le("canvas.card.room"),onClose:this._clearSelection,body:G`
          <div class="info-group">
            ${this._fieldRow("mdi:floor-plan",Le("canvas.card.area"),this._selectWrap(G`<select
                  @change=${e=>this._fire("room-area-change",{areaId:e.target.value})}
                >
                  <option value="" ?selected=${!e.area_id}>
                    ${Le("canvas.room.custom")}
                  </option>
                  ${this._areaOptions(this.areas.filter(e=>null!==e.floor_id),e.area_id)}
                  ${this.areas.some(e=>null===e.floor_id)?G`<optgroup label=${Le("canvas.room.outdoor")}>
                          ${this._areaOptions(this.areas.filter(e=>null===e.floor_id),e.area_id)}
                        </optgroup>`:q}
                </select>`))}
            ${this._fieldRow("mdi:pencil",Le("canvas.card.name"),G`<input
                type="text"
                class="text-field"
                .value=${e.name}
                @change=${t=>{const i=t.target,o=i.value.trim();o?this._fire("room-name-change",{name:o}):i.value=e.name}}
              />`)}
            ${this._actionRow("mdi:vector-polygon",this.editingRoom?Le("canvas.room.doneEditing"):Le("canvas.room.editVertices"),()=>this._fire("room-edit-vertices-click"),this.editingRoom)}
            ${e.label_position?this._actionRow("mdi:format-text-variant-outline",Le("canvas.room.resetLabel"),()=>this._fire("room-label-reset-click")):q}
            ${this._fieldRow("mdi:eye",Le("canvas.card.visible"),G`<input
                type="checkbox"
                class="switch"
                role="switch"
                .checked=${t}
                @change=${()=>this._fire("room-visible-toggle")}
              />`)}
          </div>
          ${this._renderRoomLights(e)}
          <div class="info-group">
            <div class="info-group-title">${Le("canvas.card.style")}</div>
            ${this._renderColourPicker(e)}
            ${this._fieldRow("mdi:opacity",Le("canvas.room.fillOpacity"),G`<input
                type="range"
                class="room-opacity"
                min="0"
                max="1"
                step="0.02"
                style="--pct:${100*(e.fill_opacity??mi)}%"
                .value=${String(e.fill_opacity??mi)}
                @input=${e=>this._fire("room-fill-opacity-change",{opacity:Number(e.target.value)})}
              />`)}
            ${this._fieldRow("mdi:square-outline",Le("canvas.room.borderOpacity"),G`<input
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
        `,footer:this._deleteButton(Le("canvas.room.delete"),"room-delete-click")})}if(this.selectedPin){const e=this.selectedPin;return this._card({title:this._pinLabel(e),subtitle:Le("canvas.card.device"),onClose:this._clearSelection,body:G`<div class="info-group">
            ${this._fieldRow("mdi:tag-text",Le("canvas.card.label"),G`<input
                type="text"
                class="text-field"
                placeholder=${xe(e.device_id,this.entityLookup.values())}
                .value=${e.label_override??""}
                @change=${e=>this._fire("pin-label-change",{label:e.target.value})}
              />`)}
            ${this._actionRow("mdi:shape",Le("canvas.pin.setIcon"),()=>this._fire("pin-set-icon-click"))}
            ${this._fieldRow("mdi:human-male-height",Le("canvas.card.height",{unit:"imperial"===this.unitSystem?"ft":"m"}),G`<input
                type="text"
                inputmode="decimal"
                class="text-field short"
                placeholder=${"imperial"===this.unitSystem?"6":"1.8"}
                .value=${null===e.height_m?"":ht(e.height_m,this.unitSystem)}
                @change=${e=>this._fire("pin-height-change",{value:e.target.value})}
              />`)}
          </div>
          ${this._renderDeviceNetwork(e)}`,footer:this._deleteButton(Le("canvas.pin.delete"),"pin-delete-click")})}if(this.selectedWall){const e=this.selectedWall,t=this._wallThicknessUnit??gt(this.unitSystem),i=this._thicknessInputAttrs(t);return this._card({title:Le("canvas.card.wall"),subtitle:(()=>{const t=Te.find(t=>t.id===e.material);return t?Fe(t):void 0})(),onClose:this._clearSelection,body:G`<div class="info-group">
          ${this._fieldRow("mdi:wall",Le("canvas.wall.material"),this._selectWrap(G`<select
                @change=${e=>this._fire("wall-material-change",{material:e.target.value})}
              >
                ${Te.map(t=>G`<option
                      value=${t.id}
                      ?selected=${t.id===e.material}
                    >
                      ${Fe(t)}
                    </option>`)}
              </select>`))}
          ${this._fieldRow("mdi:arrow-expand-horizontal",Le("canvas.wall.thickness",{unit:t}),G`<span class="inline-pair"
              ><input
                type="number"
                class="wall-thickness"
                min=${i.min}
                max=${i.max}
                step=${i.step}
                .value=${_t(Be(e),t)}
                @change=${e=>{const i=mt(e.target.value,t);null===i||!Number.isFinite(i)||i<=0||this._fire("wall-thickness-change",{thicknessCm:i})}}
              />${this._unitSelect(t,e=>this._wallThicknessUnit=e)}</span
            >`)}
          ${this._actionRow("mdi:vector-polygon",this.editingWall?Le("canvas.room.doneEditing"):Le("canvas.room.editVertices"),()=>this._fire("wall-edit-vertices-click"),this.editingWall)}
        </div>`,footer:this._deleteButton(Le("canvas.wall.delete"),"wall-delete-click")})}if(this.selectedOpening){const e=this.selectedOpening,t=this._openingWidthUnit??gt(this.unitSystem),i=this._thicknessInputAttrs(t),o=this.unitsPerMeter;return this._card({title:Le(`canvas.openingLabel.${e.type}`),subtitle:Le("canvas.card.wallOpening"),onClose:this._clearSelection,body:G`<div class="info-group">
          ${this._fieldRow("mdi:arrow-expand-horizontal",Le("canvas.opening.width",{unit:null!==o?t:Le("canvas.opening.storedUnits")}),G`<span class="inline-pair"
              ><input
                type="number"
                class="wall-thickness"
                min=${null!==o?i.min:"1"}
                step=${null!==o?i.step:"1"}
                .value=${null!==o?ft(e.width,o,t):String(e.width)}
                @change=${e=>{const i=e.target.value,n=null!==o?function(e,t,i){const o=mt(e,i);return null===o?null:o/100*t}(i,o,t):Number(i);null===n||!Number.isFinite(n)||n<=0||this._fire("opening-width-change",{width:n})}}
              />${null!==o?this._unitSelect(t,e=>this._openingWidthUnit=e):q}</span
            >`)}
          ${null===o?G`<div class="info-row">
                  <span class="grow info-sub"
                    >${Le("canvas.opening.calibrate")}</span
                  >
                </div>`:q}
          ${this._fieldRow("mdi:blinds",Le("canvas.opening.cover"),this._selectWrap(G`<select
                @change=${e=>this._fire("opening-cover-change",{entityId:e.target.value||null})}
              >
                <option value="" ?selected=${!e.cover_entity_id}>
                  ${Le("canvas.opening.noCover")}
                </option>
                ${this.coverEntities.map(t=>G`<option
                      value=${t.entity_id}
                      ?selected=${t.entity_id===e.cover_entity_id}
                    >
                      ${t.name}
                    </option>`)}
              </select>`))}
          ${e.cover_entity_id?this._fieldRow("mdi:weather-sunny",Le("canvas.opening.coverState"),G`<span
                    >${null===this.selectedCoverOpenness?Le("canvas.opening.coverUnavailable"):Le("canvas.opening.coverOpen",{pct:Math.round(100*this.selectedCoverOpenness)})}</span
                  >`):q}
        </div>`,footer:this._deleteButton(Le("canvas.opening.delete"),"opening-delete-click")})}if(this.selectedFurniture)return this._renderFurnitureCard(this.selectedFurniture);if(this.selectedMeshLink){const e=this.selectedMeshLink;return this._card({title:`${this._pinLabel(e.fromPin)} → ${this._pinLabel(e.toPin)}`,subtitle:Le("canvas.card.link"),onClose:this._clearSelection,body:G`<div class="info-group">
          ${this._fieldRow("mdi:signal",Le("canvas.card.quality"),G`<span style="color:${ve(e.quality)}"
              >${e.detail??e.quality}</span
            >`)}
        </div>`})}if(this.selectedMeshStub){const e=this.selectedMeshStub;return this._card({title:`${this._pinLabel(e.fromPin)} → ${e.targetLabel}`,subtitle:e.targetFloorName,onClose:this._clearSelection,body:G`<div class="info-group">
          ${this._fieldRow("mdi:signal",Le("canvas.card.quality"),G`<span style="color:${ve(e.quality)}"
              >${e.detail??e.quality}</span
            >`)}
          ${this._actionRow("mdi:arrow-right-circle",Le("canvas.meshStub.goToFloor"),()=>this._fire("mesh-stub-goto-floor-click"))}
        </div>`})}return q}_pinLabel(e){return e.label_override?e.label_override:xe(e.device_id,this.entityLookup.values())}_renderPinStack(){if(!this.pinStack)return q;const e=this.pinStack;return this._card({title:Le("canvas.pin.stackTitle",{count:e.length}),onClose:()=>this._fire("pin-stack-dismiss"),body:G`<div class="info-group">
        ${e.map(e=>G`
            <div class="info-row stack-row">
              <button
                class="stack-choose"
                @click=${()=>this._fire("pin-stack-choose",{pinId:e.id})}
              >
                ${this._pinLabel(e)}
              </button>
              <button
                class="stack-remove"
                title=${Le("canvas.pin.removeFromSpot")}
                @click=${()=>this._fire("pin-stack-remove-click",{pinId:e.id})}
              >
                <ha-icon icon="mdi:delete"></ha-icon>
              </button>
            </div>
          `)}
      </div>`})}render(){return G`
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
      ${this.meshLegend?fo():q}
      ${this.pinStack?this._renderPinStack():this._renderSelectionPanel()}
    `}};Lo.styles=[bt,yt,so,xt,wt,kt,mo,a`
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
    `],e([ge({attribute:!1})],Lo.prototype,"mode",void 0),e([ge({attribute:!1})],Lo.prototype,"armedOpeningType",void 0),e([ge({type:Boolean})],Lo.prototype,"hasPendingTrace",void 0),e([ge({type:Boolean})],Lo.prototype,"hasPendingWall",void 0),e([ge({attribute:!1})],Lo.prototype,"snapMode",void 0),e([ge({type:Number})],Lo.prototype,"pendingScaleCount",void 0),e([ge({attribute:!1})],Lo.prototype,"selectedRoom",void 0),e([ge({type:Boolean})],Lo.prototype,"editingRoom",void 0),e([ge({attribute:!1})],Lo.prototype,"areas",void 0),e([ge({attribute:!1})],Lo.prototype,"selectedPin",void 0),e([ge({attribute:!1})],Lo.prototype,"selectedWall",void 0),e([ge({type:Boolean})],Lo.prototype,"editingWall",void 0),e([ge({attribute:!1})],Lo.prototype,"unitSystem",void 0),e([ge({type:Number})],Lo.prototype,"unitsPerMeter",void 0),e([ge({attribute:!1})],Lo.prototype,"pinStack",void 0),e([ge({attribute:!1})],Lo.prototype,"entityLookup",void 0),e([ge({attribute:!1})],Lo.prototype,"selectedOpening",void 0),e([ge({attribute:!1})],Lo.prototype,"selectedFurniture",void 0),e([ge({type:Boolean})],Lo.prototype,"furnitureLibraryOpen",void 0),e([ge({attribute:!1})],Lo.prototype,"rooms",void 0),e([ge({attribute:!1})],Lo.prototype,"allAreas",void 0),e([ge({attribute:!1})],Lo.prototype,"lightEntities",void 0),e([ge({attribute:!1})],Lo.prototype,"coverEntities",void 0),e([ge({attribute:!1})],Lo.prototype,"selectedRoomLight",void 0),e([ge({attribute:!1})],Lo.prototype,"selectedCoverOpenness",void 0),e([ge({type:Boolean})],Lo.prototype,"floorCalibrated",void 0),e([ge({attribute:!1})],Lo.prototype,"linkableEntities",void 0),e([ge({attribute:!1})],Lo.prototype,"selectedItemState",void 0),e([_e()],Lo.prototype,"_colorOpen",void 0),e([ge({type:Boolean})],Lo.prototype,"dirty",void 0),e([ge({type:Boolean})],Lo.prototype,"saving",void 0),e([ge({type:Boolean})],Lo.prototype,"canUndo",void 0),e([ge({type:Boolean})],Lo.prototype,"canRedo",void 0),e([ge({type:Boolean})],Lo.prototype,"meshLegend",void 0),e([ge({attribute:!1})],Lo.prototype,"meshLinks",void 0),e([ge({attribute:!1})],Lo.prototype,"meshStubs",void 0),e([ge({attribute:!1})],Lo.prototype,"networkLabel",void 0),e([ge({attribute:!1})],Lo.prototype,"selectedMeshLink",void 0),e([ge({attribute:!1})],Lo.prototype,"selectedMeshStub",void 0),e([ge({attribute:!1})],Lo.prototype,"otherFloors",void 0),e([ge({attribute:!1})],Lo.prototype,"alignTargetFloorId",void 0),e([ge({type:Boolean})],Lo.prototype,"alignTargetHasBackground",void 0),e([_e()],Lo.prototype,"_wallThicknessUnit",void 0),e([_e()],Lo.prototype,"_openingWidthUnit",void 0),e([_e()],Lo.prototype,"_furnitureSizeUnit",void 0),e([_e()],Lo.prototype,"_cardCollapsed",void 0),Lo=e([fe("canvas-overlay")],Lo);let To=class extends de{constructor(){super(...arguments),this.icon="",this.label="",this.open=!1,this.dialog=!1,this.highlight=!1,this.compact=!1,this._top=0,this._right=0,this._onKeyDown=e=>{this.open&&this.dialog&&"Escape"===e.key&&(e.stopPropagation(),this.dispatchEvent(new CustomEvent("toggle",{bubbles:!0,composed:!0})))}}connectedCallback(){super.connectedCallback(),window.addEventListener("keydown",this._onKeyDown,!0)}disconnectedCallback(){window.removeEventListener("keydown",this._onKeyDown,!0),super.disconnectedCallback()}willUpdate(e){if(e.has("open")&&this.open){const e=this.renderRoot.querySelector(".icon-button");if(e){const t=e.getBoundingClientRect();this._top=t.bottom+8,this._right=Math.max(8,window.innerWidth-t.right)}}}render(){return G`
      <button
        class="icon-button ${this.open?"active":""} ${this.highlight?"highlight":""}"
        title=${this.label}
        @click=${()=>this.dispatchEvent(new CustomEvent("toggle",{bubbles:!0,composed:!0}))}
      >
        <ha-icon icon=${this.icon}></ha-icon>
      </button>
      ${this.open&&this.dialog?G`<div
                class="scrim"
                @click=${()=>this.dispatchEvent(new CustomEvent("toggle",{bubbles:!0,composed:!0}))}
              ></div>
              <div class="modal" role="dialog" aria-label=${this.label}>
                <slot></slot>
              </div>`:this.open?G`<div
                class="popover floating-panel"
                style="top:${this._top}px; right:${this._right}px"
              >
                <slot></slot>
              </div>`:q}
    `}};var Fo;To.styles=[bt,a`
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
    `],e([ge()],To.prototype,"icon",void 0),e([ge()],To.prototype,"label",void 0),e([ge({type:Boolean})],To.prototype,"open",void 0),e([ge({type:Boolean})],To.prototype,"dialog",void 0),e([ge({type:Boolean})],To.prototype,"highlight",void 0),e([ge({type:Boolean,reflect:!0})],To.prototype,"compact",void 0),e([_e()],To.prototype,"_top",void 0),e([_e()],To.prototype,"_right",void 0),To=e([fe("icon-popover")],To);let Eo=Fo=class extends de{constructor(){super(...arguments),this._menuOpen=!1,this.entities=[],this.placedDeviceIds=new Set,this.armedEntityId=null,this.floors=[],this.areas=[],this.currentFloorId=null,this.linkedAreaIds=new Set,this._search="",this._floorFilter=null,this._areaFilter=null,this._onResizeHandlePointerDown=e=>{e.preventDefault();const t=e.clientX,i=this.getBoundingClientRect().width,o=e.currentTarget;o.setPointerCapture(e.pointerId);const n=e=>{const o=t-e.clientX,n=Math.min(Fo.MAX_WIDTH,Math.max(Fo.MIN_WIDTH,i+o));this.style.setProperty("--sc-picker-width",`${n}px`)},s=e=>{o.releasePointerCapture(e.pointerId),o.removeEventListener("pointermove",n),o.removeEventListener("pointerup",s),this._writeStoredWidth(Math.round(this.getBoundingClientRect().width))};o.addEventListener("pointermove",n),o.addEventListener("pointerup",s)},this._onFloorFilterChange=e=>{const t=e.target.value;this._floorFilter="all"===t?"all":t,this._areaFilter&&!this._areasForFilter.some(e=>e.area_id===this._areaFilter)&&(this._areaFilter=null)}}connectedCallback(){super.connectedCallback();const e=this._readStoredWidth();null!==e&&this.style.setProperty("--sc-picker-width",`${e}px`)}_readStoredWidth(){try{const e=localStorage.getItem(Fo.WIDTH_STORAGE_KEY);if(!e)return null;const t=Number(e);return Number.isFinite(t)?Math.min(Fo.MAX_WIDTH,Math.max(Fo.MIN_WIDTH,t)):null}catch{return null}}_writeStoredWidth(e){try{localStorage.setItem(Fo.WIDTH_STORAGE_KEY,String(e))}catch{}}get _effectiveFloorFilter(){return"all"===this._floorFilter?null:this._floorFilter??this.currentFloorId}get _areasForFilter(){const e=this._effectiveFloorFilter;return null===e?this.areas:this.areas.filter(t=>this._areaIsOnFloor(t,e))}_areaIsOnFloor(e,t){return t===be?null===e.floor_id:e.floor_id===t||t===this.currentFloorId&&this.linkedAreaIds.has(e.area_id)}get _devices(){const e=new Map;for(const t of this.entities){const i=t.device_id??t.entity_id;e.has(i)||e.set(i,[]),e.get(i).push(t)}const t=[];for(const[i,o]of e){const e=ke(i,o)??o[0];t.push({deviceId:i,deviceName:e.device_name??e.name,areaId:e.area_id,areaName:e.area_name,integrationDomain:e.integration_domain,integrationName:e.integration_name,entities:o,primaryEntityId:e.entity_id})}return t.sort((e,t)=>e.deviceName.localeCompare(t.deviceName)),t}_blockedFloorName(e){const t=e.entities.find(t=>t.entity_id===e.primaryEntityId);return t?.placed_floor_id&&t.placed_floor_id!==this.currentFloorId?t.placed_floor_name??t.placed_floor_id:null}get _filtered(){const e=this._search.trim().toLowerCase(),t=this._effectiveFloorFilter,i=this._areaFilter;return this._devices.filter(o=>{if(i){if(o.areaId!==i)return!1}else if(t){const e=this.areas.find(e=>e.area_id===o.areaId);if(!e||!this._areaIsOnFloor(e,t))return!1}return!e||(o.deviceName.toLowerCase().includes(e)||(o.areaName??"").toLowerCase().includes(e)||o.entities.some(t=>t.entity_id.toLowerCase().includes(e)))})}render(){const e=this._filtered;return G`
      <div
        class="resize-handle"
        @pointerdown=${this._onResizeHandlePointerDown}
      ></div>
      <div class="picker-head">
        <span class="picker-title">${Le("picker.title")}</span>
        <button
          class="picker-close"
          title=${Le("canvas.button.close")}
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
            placeholder=${Le("picker.search")}
            .value=${this._search}
            @input=${e=>this._search=e.target.value}
          />
          ${this._search?G`<button
                  class="clear"
                  title=${Le("picker.clearSearch")}
                  @click=${()=>this._search=""}
                >
                  <ha-icon icon="mdi:close"></ha-icon>
                </button>`:q}
        </div>
        <div class="filters">
          <span class="select-wrap"
            ><select @change=${this._onFloorFilterChange}>
              <option value="all" ?selected=${"all"===this._floorFilter}>
                ${Le("picker.allFloors")}
              </option>
              <option
                value=${be}
                ?selected=${this._effectiveFloorFilter===be}
              >
                ${Le("picker.outdoor")}
              </option>
              ${this.floors.map(e=>G`<option
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
                ${Le("picker.allAreas")}
              </option>
              ${this._areasForFilter.map(e=>G`<option
                    value=${e.area_id}
                    ?selected=${this._areaFilter===e.area_id}
                  >
                    ${e.name}
                  </option>`)}</select
            ><ha-icon class="chev" icon="mdi:menu-down"></ha-icon
          ></span>
          ${this.placedDeviceIds.size>0?G`<button
                  class="more-button"
                  title=${Le("picker.more")}
                  @click=${()=>this._menuOpen=!this._menuOpen}
                >
                  <ha-icon icon="mdi:dots-vertical"></ha-icon>
                </button>`:q}
        </div>
        ${this._menuOpen&&this.placedDeviceIds.size>0?G`<div class="more-menu floating-panel">
                <button
                  class="menu-item danger"
                  @click=${()=>{this._menuOpen=!1,this.dispatchEvent(new CustomEvent("clear-all-pins",{bubbles:!0,composed:!0}))}}
                >
                  <ha-icon icon="mdi:playlist-remove"></ha-icon>
                  ${Le("picker.clearAll")}
                </button>
              </div>`:q}
      </div>
      <div class="list">
        ${0===e.length?G`<div class="empty">${Le("picker.noMatches")}</div>`:e.map(e=>{const t=this.placedDeviceIds.has(e.deviceId),i=this._blockedFloorName(e),o=this.armedEntityId===e.primaryEntityId,n=[e.areaName,e.integrationName].filter(e=>!!e).join(" - ");return G`
                  <div
                    class="item ${o?"armed":""} ${t?"placed":""} ${i?"blocked":""}"
                    title=${i?Le("picker.alreadyPlaced",{floor:i}):[e.deviceName,n].filter(e=>!!e).join(" · ")}
                    @click=${()=>{i||this.dispatchEvent(new CustomEvent("entity-armed",{detail:{entityId:e.primaryEntityId},bubbles:!0,composed:!0}))}}
                  >
                    <span class="avatar">
                      ${e.integrationDomain?G`<img
                              src="https://brands.home-assistant.io/_/${e.integrationDomain}/icon.png"
                              alt=""
                              @error=${e=>{const t=e.target;t.style.display="none",t.nextElementSibling?.classList.remove("hidden")}}
                            />`:q}
                      <ha-icon
                        icon=${"mdi:devices"}
                        class=${e.integrationDomain?"hidden":""}
                      ></ha-icon>
                    </span>
                    <span class="text">
                      <span class="name">${e.deviceName}</span>
                      ${i?G`<span class="meta"
                              >${Le("picker.placedOn",{floor:i})}</span
                            >`:n?G`<span class="meta">${n}</span>`:q}
                      ${t?G`<span class="meta">${Le("picker.placed")}</span>`:q}
                    </span>
                  </div>
                `})}
      </div>
    `}};Eo.styles=[bt,yt,a`
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
    `],Eo.WIDTH_STORAGE_KEY="spatial-context.entityPickerSidebarWidth",Eo.MIN_WIDTH=240,Eo.MAX_WIDTH=600,e([_e()],Eo.prototype,"_menuOpen",void 0),e([ge({attribute:!1})],Eo.prototype,"entities",void 0),e([ge({attribute:!1})],Eo.prototype,"placedDeviceIds",void 0),e([ge({attribute:!1})],Eo.prototype,"armedEntityId",void 0),e([ge({attribute:!1})],Eo.prototype,"floors",void 0),e([ge({attribute:!1})],Eo.prototype,"areas",void 0),e([ge({attribute:!1})],Eo.prototype,"currentFloorId",void 0),e([ge({attribute:!1})],Eo.prototype,"linkedAreaIds",void 0),e([_e()],Eo.prototype,"_search",void 0),e([_e()],Eo.prototype,"_floorFilter",void 0),e([_e()],Eo.prototype,"_areaFilter",void 0),Eo=Fo=e([fe("entity-picker-sidebar")],Eo);let Bo=class extends de{constructor(){super(...arguments),this.armedKind=null,this.unitSystem="metric",this._query="",this._category=null}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}_size(e){if("imperial"===this.unitSystem){const t=e=>Math.round(e/2.54);return`${t(e.w)}″ × ${t(e.d)}″`}return`${e.w} × ${e.d} cm`}get _items(){const e=this._query.toLowerCase().split(/\s+/).filter(Boolean);return Bt.filter(t=>{if(this._category&&t.category!==this._category)return!1;if(0===e.length)return!0;const i=`${t.name} ${Le(`furniture.category.${t.category}`)} ${t.id}`.toLowerCase();return e.every(e=>i.includes(e))})}_thumb(e){const t=.1*Math.max(e.w,e.d);return K`<svg viewBox="${-t} ${-t} ${e.w+2*t} ${e.d+2*t}" preserveAspectRatio="xMidYMid meet">
      <g transform=${e.flip?`translate(${e.w} 0) scale(-1 1)`:""}>
        ${ti(ei(e.draw,e.w,e.d,e.opts),!1)}
      </g>
    </svg>`}render(){const e=this._items;return G`
      <div class="head">
        <span class="title">${Le("furniture.libraryTitle")}</span>
        <button
          class="close"
          title=${Le("furniture.close")}
          @click=${()=>this._fire("library-close")}
        >
          <ha-icon icon="mdi:close"></ha-icon>
        </button>
      </div>
      <div class="search">
        <label class="search-box">
          <ha-icon icon="mdi:magnify"></ha-icon>
          <input
            type="search"
            placeholder=${Le("furniture.search")}
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
          ${Le("furniture.category.all")}
        </button>
        ${Et.map(e=>G`<button
              class="chip ${this._category===e.id?"active":""}"
              @click=${()=>this._category=this._category===e.id?null:e.id}
            >
              <ha-icon icon=${e.icon}></ha-icon>
              ${Le(`furniture.category.${e.id}`)}
            </button>`)}
      </div>
      <div class="count">
        ${Le("furniture.count",{count:e.length})}
      </div>
      <div class="grid">
        ${0===e.length?G`<div class="empty">${Le("furniture.none")}</div>`:e.map(e=>G`<button
                    class="item ${this.armedKind===e.id?"armed":""}"
                    title=${e.name}
                    @click=${()=>this._fire("furniture-armed",{kind:this.armedKind===e.id?null:e.id})}
                  >
                    ${this._thumb(e)}
                    <span class="name">${e.name}</span>
                    <span class="size">${this._size(e)}</span>
                  </button>`)}
      </div>
      ${q}
    `}};Bo.styles=[bt,a`
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
        color: var(--sc-fg-secondary);
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
      ${r(ii)}
    `],e([ge({attribute:!1})],Bo.prototype,"armedKind",void 0),e([ge({attribute:!1})],Bo.prototype,"unitSystem",void 0),e([_e()],Bo.prototype,"_query",void 0),e([_e()],Bo.prototype,"_category",void 0),Bo=e([fe("furniture-library-sidebar")],Bo);let Ao=class extends de{constructor(){super(...arguments),this.mode="select",this.mapActive=!1,this.mapRotation=0,this.selectedPinLabel=null,this.selectedPinDefaultLabel=null,this.selectedPinOverride=null,this.selectedPinDeviceId=null,this.meshLinks=[],this.networkLabel=null,this.dirty=!1,this.saving=!1,this.canUndo=!1,this.canRedo=!1,this.meshLegend=!1,this.selectedMeshLink=null,this.buildings=[],this.scaleReadout=null,this.scaleWarning=null,this.armedBuildingKey=null,this.selectedPlacement=null,this.floorNameById=new Map,this._cardCollapsed=!1,this._card=e=>ro({...e,collapsed:this._cardCollapsed,onToggle:()=>this._cardCollapsed=!this._cardCollapsed})}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}_selectedLabel(){const e=this.selectedPlacement;return e?e.label_override||this.floorNameById.get(e.floor_id)||e.floor_id:""}_renderPinPanel(){return null===this.selectedPinLabel?q:this._card({title:this.selectedPinLabel,subtitle:Le("property.outdoorDevice"),onClose:()=>this._fire("selection-clear"),body:G`<div class="info-group">
          ${lo("mdi:tag-text",Le("canvas.card.label"),G`<input
              type="text"
              class="text-field"
              placeholder=${this.selectedPinDefaultLabel??""}
              .value=${this.selectedPinOverride??""}
              @change=${e=>this._fire("outdoor-pin-label-change",{label:e.target.value})}
            />`)}
          ${ao("mdi:shape",Le("property.setIcon"),()=>this._fire("outdoor-pin-icon-click"))}
        </div>
        ${this._renderDeviceNetwork()}`,footer:ho(Le("property.removeFromProperty"),()=>this._fire("outdoor-pin-delete-click"))})}_renderDeviceNetwork(){const e=this.selectedPinDeviceId;if(!this.networkLabel||!e)return q;const t=this.meshLinks.filter(t=>t.from.deviceId===e||t.to.deviceId===e).map(t=>{const i=t.from.deviceId===e?t.to:t.from;return{name:i.label,where:i.floorId?this.floorNameById.get(i.floorId)??"":"",quality:t.quality,detail:t.detail??t.quality}});return uo(this.networkLabel,t)}_renderMapPanel(){if("map"!==this.mode)return q;const e=Math.round(10*this.mapRotation)/10,t=e=>this._fire("map-rotation-set",{deg:e});return G`
      <div class="tool-row sub">
        <div class="hint-bar">
          <span class="hint">${Le("mapBackground.adjustHint")}</span>
          <button
            title=${Le("mapBackground.zoomOut")}
            @click=${()=>this._fire("map-zoom-step",{factor:1/1.1})}
          >
            <ha-icon icon="mdi:magnify-minus-outline"></ha-icon>
          </button>
          <button
            title=${Le("mapBackground.zoomIn")}
            @click=${()=>this._fire("map-zoom-step",{factor:1.1})}
          >
            <ha-icon icon="mdi:magnify-plus-outline"></ha-icon>
          </button>
          <span class="hint">${Le("mapBackground.rotation")}</span>
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
            title=${Le("mapBackground.resetRotation")}
            @click=${()=>t(0)}
          >
            <ha-icon icon="mdi:compass-outline"></ha-icon>
          </button>
          <button
            class="primary"
            @click=${()=>this._fire("property-mode-change",{mode:"select"})}
          >
            ${Le("mapBackground.done")}
          </button>
        </div>
      </div>
    `}_renderMeshLinkPanel(){const e=this.selectedMeshLink;if(!e)return q;const t=[e.from,e.to].find(e=>null!==e.floorId);return this._card({title:`${e.from.label} → ${e.to.label}`,subtitle:Le("property.link"),onClose:()=>this._fire("selection-clear"),body:G`<div class="info-group">
        ${lo("mdi:signal",Le("canvas.card.quality"),G`<span style="color:${ve(e.quality)}"
            >${e.detail??e.quality}</span
          >`)}
        ${t?ao("mdi:arrow-right-circle",Le("property.goToFloorOf",{name:t.label}),()=>this._fire("property-mesh-goto-floor-click",{floorId:t.floorId})):q}
      </div>`})}_renderPlacementPanel(){return this.selectedPlacement?this._card({title:this._selectedLabel(),subtitle:Le("property.building"),onClose:()=>this._fire("selection-clear"),body:G`<div class="info-group">
        ${lo("mdi:tag-text",Le("canvas.card.name"),G`<input
            type="text"
            class="text-field"
            .value=${this._selectedLabel()}
            @change=${e=>this._fire("placement-label-change",{label:e.target.value})}
          />`)}
        ${ao("mdi:arrow-right-circle",Le("property.goToFloor"),()=>this._fire("placement-goto-floor-click"))}
      </div>`,footer:ho(Le("property.deletePlacement"),()=>this._fire("placement-delete-click"))}):q}_renderScaleNotice(){const e=this.scaleWarning??(null===this.scaleReadout?Le("property.notCalibrated"):null);return null===e?q:G`<div class="scale-corner">
      <div
        class="scale-chip floating-panel"
        title=${null===this.scaleReadout?Le("property.calibrateHint"):e}
      >
        <ha-icon
          class=${this.scaleWarning?"warn":""}
          icon=${this.scaleWarning?"mdi:alert":"mdi:ruler"}
        ></ha-icon>
        ${e}
      </div>
    </div>`}render(){return G`
      <div class="tool-row">
        <div class="mode-toolbar">
          <button
            class=${"select"===this.mode?"active":""}
            title=${Le("property.select")}
            @click=${()=>this._fire("property-mode-change",{mode:"select"})}
          >
            <ha-icon icon="mdi:cursor-default-click"></ha-icon>
          </button>
          <button
            class=${"place-pin"===this.mode?"active":""}
            title=${Le("property.placeOutdoor")}
            @click=${()=>this._fire("property-mode-change",{mode:"place-pin"===this.mode?"select":"place-pin"})}
          >
            <ha-icon icon="mdi:map-marker-plus"></ha-icon>
          </button>
          ${this.mapActive?G`<button
                  class=${"map"===this.mode?"active":""}
                  title=${Le("mapBackground.adjust")}
                  @click=${()=>this._fire("property-mode-change",{mode:"map"===this.mode?"select":"map"})}
                >
                  <ha-icon icon="mdi:map-search"></ha-icon>
                </button>`:q}
          <span class="tool-divider"></span>
          <span class="select-wrap"
            ><select
              class="place-picker"
              title=${Le("property.placeBuildingTip")}
              .value=${this.armedBuildingKey??""}
              @change=${e=>{const t=e.target.value;t&&this._fire("placement-arm",{key:t})}}
            >
              <option value="">${Le("property.placeBuilding")}</option>
              ${this.buildings.map(e=>G`<option value=${e.key}>${e.name}</option>`)}</select
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
      ${this.meshLegend&&"map"!==this.mode?fo():q}
      ${this._renderPinPanel()} ${this._renderMeshLinkPanel()}
      ${this._renderPlacementPanel()}
    `}};Ao.styles=[bt,yt,$t,xt,so,kt,mo,a`
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
    `],e([ge({attribute:!1})],Ao.prototype,"mode",void 0),e([ge({attribute:!1})],Ao.prototype,"mapActive",void 0),e([ge({attribute:!1})],Ao.prototype,"mapRotation",void 0),e([ge({attribute:!1})],Ao.prototype,"selectedPinLabel",void 0),e([ge({attribute:!1})],Ao.prototype,"selectedPinDefaultLabel",void 0),e([ge({attribute:!1})],Ao.prototype,"selectedPinOverride",void 0),e([ge({attribute:!1})],Ao.prototype,"selectedPinDeviceId",void 0),e([ge({attribute:!1})],Ao.prototype,"meshLinks",void 0),e([ge({attribute:!1})],Ao.prototype,"networkLabel",void 0),e([ge({type:Boolean})],Ao.prototype,"dirty",void 0),e([ge({type:Boolean})],Ao.prototype,"saving",void 0),e([ge({type:Boolean})],Ao.prototype,"canUndo",void 0),e([ge({type:Boolean})],Ao.prototype,"canRedo",void 0),e([ge({type:Boolean})],Ao.prototype,"meshLegend",void 0),e([ge({attribute:!1})],Ao.prototype,"selectedMeshLink",void 0),e([ge({attribute:!1})],Ao.prototype,"buildings",void 0),e([ge({attribute:!1})],Ao.prototype,"scaleReadout",void 0),e([ge({attribute:!1})],Ao.prototype,"scaleWarning",void 0),e([ge({attribute:!1})],Ao.prototype,"armedBuildingKey",void 0),e([ge({attribute:!1})],Ao.prototype,"selectedPlacement",void 0),e([ge({attribute:!1})],Ao.prototype,"floorNameById",void 0),e([_e()],Ao.prototype,"_cardCollapsed",void 0),Ao=e([fe("property-overlay")],Ao);const Oo=new Set(["the","and","with","power","light","plug"]);let Ro=null;function zo(e,t,i){const o=t.toLowerCase().split(/[\s:]+/).filter(Boolean);if(0===o.length)return[];const n=o.join("-"),s=[];for(const[t,i]of e){const e=o.filter(e=>t.includes(e)).length,r=o.filter(e=>t.includes(e)||i.includes(e)).length;if(0===r)continue;const a=t===n?0:t.startsWith(o[0])?1:e===o.length?2:3-e/o.length;s.push([4*(o.length-r)+a,t])}return s.sort((e,t)=>e[0]-t[0]||e[1].length-t[1].length||e[1].localeCompare(t[1])),s.slice(0,i).map(([,e])=>e)}let Do=class extends de{constructor(){super(...arguments),this.value=null,this.suggestFrom="",this._query="",this._index=null,this._error=null,this._onBackdropClick=()=>this._fire("icon-picker-cancel"),this._onKeyDown=e=>{if("Escape"===e.key)e.stopPropagation(),this._fire("icon-picker-cancel");else if("Enter"===e.key){const e=this._results[0];e&&this._fire("icon-picked",{icon:`mdi:${e}`})}}}connectedCallback(){super.connectedCallback(),this.addEventListener("click",this._onBackdropClick),(Ro??(Ro=fetch("/spatial_context/mdi-index.json?v=0.15.0-beta.1+mv9xupxn").then(e=>{if(!e.ok)throw new Error(`HTTP ${e.status}`);return e.json()}).catch(e=>{throw Ro=null,e})),Ro).then(e=>this._index=e,e=>this._error=e?.message??"couldn't load icons")}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("click",this._onBackdropClick)}firstUpdated(e){this._input?.focus()}_fire(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}get _results(){const e=this._index;if(!e)return[];if(this._query.trim())return zo(e,this._query,160);const t=new Set;for(const i of this.suggestFrom.toLowerCase().split(/[^a-z0-9]+/))if(!(i.length<3||Oo.has(i))){for(const o of zo(e,i,12))t.add(o);if(t.size>=60)break}return[...t]}render(){const e=this._results,t=this.value?.replace(/^mdi:/,"")??null;return G`
      <div
        class="dialog floating-panel"
        role="dialog"
        aria-label=${Le("iconPicker.title")}
        @click=${e=>e.stopPropagation()}
        @keydown=${this._onKeyDown}
      >
        <div class="title">${Le("iconPicker.title")}</div>
        <input
          type="search"
          placeholder=${Le("iconPicker.search")}
          .value=${this._query}
          @input=${e=>this._query=e.target.value}
        />
        ${this._error?G`<span class="hint"
                >${Le("iconPicker.loadError",{error:this._error})}</span
              >`:this._index?0===e.length?G`<span class="hint"
                    >${this._query.trim()?Le("iconPicker.noMatch"):Le("iconPicker.typeToSearch")}</span
                  >`:q:G`<span class="hint"
                  >${Le("iconPicker.loading")}</span
                >`}
        <div class="grid">
          ${e.map(e=>G`<button
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
            ${Le("iconPicker.useDefault")}
          </button>
          <button @click=${()=>this._fire("icon-picker-cancel")}>
            ${Le("iconPicker.cancel")}
          </button>
        </div>
      </div>
    `}};Do.styles=[bt,a`
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
    `],e([ge({attribute:!1})],Do.prototype,"value",void 0),e([ge({attribute:!1})],Do.prototype,"suggestFrom",void 0),e([_e()],Do.prototype,"_query",void 0),e([_e()],Do.prototype,"_index",void 0),e([_e()],Do.prototype,"_error",void 0),e([me("input[type=search]")],Do.prototype,"_input",void 0),Do=e([fe("icon-picker-dialog")],Do);let Ho=class extends de{constructor(){super(...arguments),this.coordinatorChoices=[]}_change(e){this.dispatchEvent(new CustomEvent("settings-change",{detail:e,bubbles:!0,composed:!0}))}_switch(e,t,i){return G`<input
      type="checkbox"
      class="switch"
      role="switch"
      aria-label=${t}
      .checked=${e}
      @change=${e=>i(e.target.checked)}
    />`}_segmented(e,t,i){return G`<div class="segmented" role="radiogroup">
      ${t.map(([t,o])=>G`<button
            role="radio"
            aria-checked=${t===e?"true":"false"}
            class=${t===e?"active":""}
            @click=${()=>t!==e&&i(t)}
          >
            ${o}
          </button>`)}
    </div>`}_row(e,t,i){return G`<div class="row">
      <div>
        <div class="label">${e}</div>
        ${i?G`<div class="description">${i}</div>`:q}
      </div>
      ${t}
    </div>`}render(){const e=this.settings,t=e.zigbee_coordinator_device_id,i=this.coordinatorChoices.some(e=>e.deviceId===t);return G`
      <div class="header">
        <button
          title=${Le("settings.close")}
          @click=${()=>this.dispatchEvent(new CustomEvent("settings-close",{bubbles:!0,composed:!0}))}
        >
          <ha-icon icon="mdi:close"></ha-icon>
        </button>
        <span>${Le("settings.title")}</span>
      </div>
      <div class="body">
        <div class="section">
          <div class="section-title">${Le("settings.editing")}</div>
          ${this._row(Le("settings.autoSave"),this._switch(e.auto_save,Le("settings.autoSave"),e=>this._change({auto_save:e})),Le("settings.autoSaveHint"))}
          ${this._row(Le("settings.units"),this._segmented(e.unit_system,[["metric",Le("settings.metric")],["imperial",Le("settings.imperial")]],e=>this._change({unit_system:e})))}
          ${this._row(Le("settings.floorOrder"),this._segmented(e.floor_order,[["top_down",Le("settings.topFirst")],["ground_up",Le("settings.groundFirst")]],e=>this._change({floor_order:e})))}
        </div>

        <div class="section">
          <div class="section-title">${Le("settings.zigbeeMesh")}</div>
          ${this._row(Le("settings.coordinator"),G`<span class="select-wrap"
              ><select
                aria-label=${Le("settings.coordinatorAria")}
                @change=${e=>this._change({zigbee_coordinator_device_id:e.target.value||null})}
              >
                <option value="" ?selected=${!t}>
                  ${Le("settings.bridge")}
                </option>
                ${t&&!i?G`<option value=${t} selected>
                        ${Le("settings.notPlaced")}
                      </option>`:q}
                ${this.coordinatorChoices.map(({deviceId:e,label:i})=>G`<option
                      value=${e}
                      ?selected=${e===t}
                    >
                      ${i}
                    </option>`)}</select
              ><ha-icon class="chev" icon="mdi:menu-down"></ha-icon
            ></span>`,Le("settings.coordinatorHint"))}
          ${this._row(Le("settings.scanTimeout"),G`<span class="number"
              ><input
                type="number"
                min="30"
                max="600"
                step="10"
                aria-label=${Le("settings.scanTimeoutAria")}
                .value=${String(e.zigbee_timeout_seconds)}
                @change=${e=>{const t=Number(e.target.value);Number.isFinite(t)&&this._change({zigbee_timeout_seconds:Math.min(600,Math.max(30,Math.round(t)))})}}
              />s</span
            >`,Le("settings.scanTimeoutHint"))}
        </div>

        <div class="section">
          <div class="section-title">
            ${Le("settings.troubleshooting")}
          </div>
          ${this._row(Le("settings.debugLogging"),this._switch(e.debug_logging,Le("settings.debugLogging"),e=>this._change({debug_logging:e})),Le("settings.debugLoggingHint"))}
        </div>

        <div class="section">
          <div class="section-title">${Le("settings.about")}</div>
          ${this._row(Le("settings.version"),G`<span class="description">v${"0.15.0-beta.1"}</span>`)}
          ${this._row(Le("settings.github"),G`<a
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
          ${Le("settings.done")}
        </button>
      </div>
    `}};var Wo;Ho.styles=[bt,yt,wt,a`
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
    `],e([ge({attribute:!1})],Ho.prototype,"settings",void 0),e([ge({attribute:!1})],Ho.prototype,"coordinatorChoices",void 0),Ho=e([fe("settings-menu")],Ho);const No="spatial-context-snap-mode",Uo="spatial_context_overlays";let Vo=Wo=class extends de{constructor(){super(...arguments),this._floors=[],this._currentFloorId=null,this._layout={background_image_id:null,background_opacity:.5,background_offset_x:0,background_offset_y:0,background_scale:1,building_id:null,view_box:null,rooms:[],pins:[],walls:[],openings:[],furniture:[],scale:null,north_deg:null},this._selectedFurnitureId=null,this._armedFurnitureKind=null,this._armedFurnitureRotation=0,this._furnitureLibraryOpen=!1,this._overlays=function(){const e={furniture:!0,lights:!0,covers:!0};try{const t=localStorage.getItem(Uo);return t?{...e,...JSON.parse(t)}:e}catch{return e}}(),this._roomLights=new Map,this._coverOpenness=new Map,this._pinColors=new Map,this._itemStates=new Map,this._sunPreviewMinutes=null,this._liveSig="",this._entities=[],this._areas=[],this._mode="select",this._snapMode=function(){try{const e=localStorage.getItem(No);if("all"===e||"same"===e||"off"===e)return e}catch{}return"all"}(),this._dragOverCanvas=!1,this._armedEntityId=null,this._armedOpeningType=null,this._selectedRoomId=null,this._editingRoomId=null,this._selectedPinId=null,this._pinStackIds=null,this._selectedWallId=null,this._editingWallId=null,this._selectedOpeningId=null,this._selectedMeshLink=null,this._selectedMeshStub=null,this._otherFloorPinsByDeviceId=new Map,this._dirty=!1,this._saving=!1,this._loading=!0,this._pendingCount=0,this._networkType=null,this._zigbeeMesh=null,this._zigbeeMeshLoading=!1,this._zigbeeMeshError=null,this._zigbeeMeshFetchedAt=null,this._zigbeeMeshElapsedSeconds=0,this._zigbeeMeshTimer=null,this._zigbeeShowAllLinks=!1,this._wifiMesh=null,this._wifiMeshLoading=!1,this._wifiMeshError=null,this._matterTopology=null,this._matterError=null,this._matterUnsubscribe=null,this._bluetoothAdverts=new Map,this._bluetoothBuffer=new Map,this._bluetoothFlushTimer=null,this._bluetoothDevices={},this._bluetoothError=null,this._bluetoothUnsubscribe=null,this._backgroundPopoverOpen=!1,this._meshPopoverOpen=!1,this._settings={unit_system:"metric",zigbee_timeout_seconds:180,floor_order:"top_down",zigbee_coordinator_device_id:null,auto_save:!0,debug_logging:!1},this._settingsPopoverOpen=!1,this._moreOptionsPopoverOpen=!1,this._view="floor",this._placementGhosts=new Map,this._propertyLayout={background_image_id:null,background_opacity:.85,background_offset_x:0,background_offset_y:0,background_scale:1,view_box:null,placements:[],pins:[]},this._propertyDirty=!1,this._saveError=null,this._iconPickerFor=null,this._versionNotice=null,this._autoSaveTimer=null,this._autoSaveHeld=!1,this._floorHistory=new $e,this._propertyHistory=new $e,this._propertyDragStart=null,this._propertySaving=!1,this._selectedPlacementId=null,this._propertyMode="select",this._selectedOutdoorPinId=null,this._selectedPropertyMeshLinkKey=null,this._armedBuildingKey=null,this._sameBuildingAsPreviousFloor=!1,this._alignTargetFloorId=null,this._alignTargetLayout=null,this._alignOffsetX=0,this._alignOffsetY=0,this._alignScale=1,this._initialized=!1,this._onNorthChange=e=>{this._updateLayout({north_deg:null===e?null:(Math.round(e)%360+360)%360})},this._onFloorSelected=e=>{this._selectFloor(e.detail.floorId)},this._onPropertySelected=()=>{this._selectProperty()},this._onToggleMapBackground=()=>{const e=this._hass?.config;this._propertyLayout.map_background?("map"===this._propertyMode&&(this._propertyMode="select"),this._updatePropertyLayout({map_background:null})):void 0!==e?.latitude&&void 0!==e.longitude&&this._updatePropertyLayout({map_background:{lat:e.latitude,lon:e.longitude,zoom:18,opacity:1,style:"street"}})},this._onMapAdjust=e=>{const t=e.detail;this._adjustMap(e=>{switch(t.op){case"pan":return Zi(e,t.dx,t.dy);case"zoom":return Qi(e,t.factor,t.at);case"rotate":return Ji(e,(e.rotation_deg??0)+t.deltaDeg,t.at);case"pinch":{const i=Qi(Zi(e,t.dx,t.dy),t.factor,t.at);return Ji(i,(i.rotation_deg??0)+t.rotateDeg,t.at)}}})},this._onMapRotationSet=e=>{const t=this._propertyCanvas?.getViewCenter()??{x:0,y:0};this._adjustMap(i=>Ji(i,e.detail.deg,t))},this._onMapZoomStep=e=>{const t=this._propertyCanvas?.getViewCenter()??{x:0,y:0};this._adjustMap(i=>Qi(i,e.detail.factor,t))},this._onMapStyleChange=e=>{const t=this._propertyLayout.map_background;t&&this._updatePropertyLayout({map_background:{...t,style:e.target.value}})},this._onMapOpacityChange=e=>{const t=this._propertyLayout.map_background;t&&this._updatePropertyLayout({map_background:{...t,opacity:Number(e.target.value)}})},this._onUndo=()=>this._undoRedo("undo"),this._onRedo=()=>this._undoRedo("redo"),this._onPropertyModeChange=e=>{this._propertyMode=e.detail.mode,this._armedBuildingKey=null,this._armedEntityId=null,this._selectedPlacementId=null},this._onOutdoorPinPlace=e=>{if(!this._armedEntityId)return;const t=this._entityLookup.get(this._armedEntityId),i=ze(t?.device_id??null,e.detail.x,e.detail.y,null);this._updatePropertyLayout({pins:[...this._propertyLayout.pins,i]}),this._armedEntityId=null,this._selectedOutdoorPinId=i.id,this._selectedPlacementId=null,this._selectedPropertyMeshLinkKey=null},this._onOutdoorPinMove=e=>{this._patchOutdoorPin(e.detail.id,{x:e.detail.x,y:e.detail.y})},this._onOutdoorPinSelect=e=>{this._selectedOutdoorPinId=e.detail.id,null!==e.detail.id&&(this._selectedPlacementId=null,this._selectedPropertyMeshLinkKey=null)},this._onOutdoorPinLabelChange=e=>{const t=this._selectedOutdoorPin;t&&this._patchOutdoorPin(t.id,{label_override:e.detail.label.trim()||null})},this._onPropertySelectionClear=()=>{this._selectedPlacementId=null,this._selectedOutdoorPinId=null,this._selectedPropertyMeshLinkKey=null},this._onOutdoorPinIcon=()=>{const e=this._selectedOutdoorPin;e&&(this._iconPickerFor={kind:"outdoor",pinId:e.id})},this._onOutdoorPinDelete=()=>{const e=this._selectedOutdoorPin;e&&window.confirm(`Remove "${this._pinLabel(e)}" from the property?`)&&(this._updatePropertyLayout({pins:this._propertyLayout.pins.filter(t=>t.id!==e.id)}),this._selectedOutdoorPinId=null)},this._onPropertyMeshLinkSelect=e=>{this._selectedPropertyMeshLinkKey=e.detail.key,null!==e.detail.key&&(this._selectedOutdoorPinId=null,this._selectedPlacementId=null)},this._onClearAllOutdoorPins=()=>{const e=this._propertyLayout.pins.length;0!==e&&window.confirm(Le(1===e?"confirm.removeOutdoorOne":"confirm.removeOutdoorMany",{count:e}))&&(this._autoSaveHeld=!0,this._updatePropertyLayout({pins:[]}),this._selectedOutdoorPinId=null)},this._onPropertyMeshGotoFloor=e=>{this._selectFloor(e.detail.floorId)},this._onPlacementArm=e=>{this._armedBuildingKey=e.detail.key,this._propertyMode="place",this._selectedPlacementId=null},this._onPlacementPlace=e=>{if(!this._armedBuildingKey)return;const t=this._buildings.find(e=>e.key===this._armedBuildingKey);if(!t)return;const i=function(e,t,i,o,n,s){const r=n>=1?Ne:Ne*n,a=n>=1?Ne/n:Ne;return{id:Re("placement"),building_id:t,floor_id:e,label_override:null,x:i,y:o,width:r,height:a,rotation_deg:0,aspect_ratio:n,source_bounds:s}}(t.floorId,t.buildingId,e.detail.x,e.detail.y,t.aspectRatio,this._buildingBounds(this._floors.filter(e=>(e.building_id??e.floor_id)===t.key)));this._updatePropertyLayout({placements:[...this._propertyLayout.placements,i]}),this._armedBuildingKey=null,this._propertyMode="select",this._selectedPlacementId=i.id},this._onPlacementMove=e=>{const t=this._propertyLayout.placements.find(t=>t.id===e.detail.id);t&&this._patchPlacement(e.detail.id,{x:t.x+e.detail.dx,y:t.y+e.detail.dy})},this._onPlacementResize=e=>{this._patchPlacement(e.detail.id,{width:e.detail.width,height:e.detail.height,x:e.detail.x,y:e.detail.y})},this._onPlacementRotate=e=>{this._patchPlacement(e.detail.id,{rotation_deg:e.detail.rotationDeg})},this._onPlacementSelect=e=>{this._selectedPlacementId=e.detail.id,null!==e.detail.id&&(this._selectedOutdoorPinId=null,this._selectedPropertyMeshLinkKey=null)},this._onPlacementLabelChange=e=>{const t=this._selectedPlacement;t&&this._patchPlacement(t.id,{label_override:e.detail.label.trim()||null})},this._onPlacementDeleteClick=()=>{const e=this._selectedPlacement;if(!e)return;const t=e.label_override??this._floorNameById.get(e.floor_id)??e.floor_id;window.confirm(Le("confirm.deletePlacement",{label:t}))&&(this._updatePropertyLayout({placements:this._propertyLayout.placements.filter(t=>t.id!==e.id)}),this._selectedPlacementId=null)},this._onPlacementGotoFloorClick=()=>{const e=this._selectedPlacement;e&&this._selectFloor(e.floor_id)},this._onModeChange=e=>{this._mode=this._mode===e.detail.mode?"select":e.detail.mode,this._armedEntityId=null,this._armedOpeningType=null,this._armedFurnitureKind=null,"place"===this._mode&&(this._furnitureLibraryOpen=!1),"select"!==this._mode&&(this._editingRoomId=null,this._editingWallId=null),"align"!==this._mode&&this._resetAlignState()},this._onAddOpeningClick=e=>{this._mode="opening",this._armedOpeningType=e.detail.openingType,this._editingRoomId=null,this._editingWallId=null},this._onSaveClick=()=>{this._autoSaveHeld=!1;("property"===this._view?this._saveProperty():this._save()).catch(()=>{})},this._placementKeyForEntities=null,this._onVisibilityChange=()=>{"visible"===document.visibilityState&&this._checkVersion()},this._onCalibrateScaleClick=()=>{"scale"!==this._mode&&this._onModeChange(new CustomEvent("mode-change",{detail:{mode:"scale"}}))},this._onPickerClose=()=>{this._mode="select",this._propertyMode="select",this._armedEntityId=null},this._onBeforeUnload=e=>{(this._dirty||this._propertyDirty)&&(this._flushAutoSave(),e.preventDefault(),e.returnValue="")},this._onExportClick=()=>{this._export()},this._onResetClick=()=>{if("property"===this._view){if(!window.confirm(Le("confirm.resetProperty")))return;return this._autoSaveHeld=!0,this._propertyHistory.record(this._propertyLayout),this._propertyLayout={background_image_id:null,background_opacity:.85,background_offset_x:0,background_offset_y:0,background_scale:1,view_box:null,placements:[],pins:[]},this._propertyDirty=!0,this._selectedPlacementId=null,this._selectedOutdoorPinId=null,void(this._selectedPropertyMeshLinkKey=null)}const e=this._floors.find(e=>e.floor_id===this._currentFloorId)?.name??Le("floor.thisFloor");window.confirm(Le("confirm.resetFloor",{floor:e}))&&(this._autoSaveHeld=!0,this._floorHistory.record(this._layout),this._layout={background_image_id:null,background_opacity:.5,background_offset_x:0,background_offset_y:0,background_scale:1,building_id:null,view_box:null,rooms:[],pins:[],walls:[],openings:[],furniture:[],scale:null,north_deg:null},this._dirty=!0,this._resetSelection(),this._pinStackIds=null)},this._onToggleBackgroundPopover=()=>{this._backgroundPopoverOpen=!this._backgroundPopoverOpen,this._meshPopoverOpen=!1,this._settingsPopoverOpen=!1,this._moreOptionsPopoverOpen=!1},this._onToggleMeshPopover=()=>{this._meshPopoverOpen=!this._meshPopoverOpen,this._backgroundPopoverOpen=!1,this._settingsPopoverOpen=!1,this._moreOptionsPopoverOpen=!1},this._onToggleSettingsPopover=()=>{this._settingsPopoverOpen=!this._settingsPopoverOpen,this._backgroundPopoverOpen=!1,this._meshPopoverOpen=!1,this._moreOptionsPopoverOpen=!1},this._onToggleMoreOptionsPopover=()=>{this._moreOptionsPopoverOpen=!this._moreOptionsPopoverOpen,this._backgroundPopoverOpen=!1,this._meshPopoverOpen=!1,this._settingsPopoverOpen=!1},this._onSettingsChange=e=>{const t=e.detail;this._settings={...this._settings,...t};const i=this._client.saveSettings(this._settings);if("auto_save"in t&&this._scheduleAutoSave(),"zigbee_coordinator_device_id"in t&&(this._selectedMeshLink=null,this._selectedMeshStub=null),"debug_logging"in t){const e=!!t.debug_logging;i.then(()=>{Me.configure(this._client,e),Me.log("debug_logging_on",{panel_version:"0.15.0-beta.1",panel_build:"0.15.0-beta.1+mv9xupxn",user_agent:navigator.userAgent})})}},this._onNetworkTypeSelect=e=>{const t=this._networkType===e?null:e;"matter"===this._networkType&&"matter"!==t&&this._unsubscribeMatter(),"bluetooth"===this._networkType&&"bluetooth"!==t&&this._unsubscribeBluetooth(),this._networkType=t,this._selectedMeshLink=null,this._selectedMeshStub=null,"wifi"===t?this._refreshWifiMesh():"matter"===t?this._subscribeMatter():"bluetooth"===t?this._subscribeBluetooth():"zigbee"===t&&this._loadCachedZigbeeMesh()},this._onLoadMesh=()=>{this._refreshZigbeeMesh(null!==this._zigbeeMeshFetchedAt)},this._fitToViewport=()=>{const e=window.visualViewport?.height??window.innerHeight,t=Math.max(this.getBoundingClientRect().top,0);this.style.height=`${Math.max(240,Math.floor(e-t))}px`},this._onKeyDown=e=>{if(this._isTypingTarget())return;if(this._iconPickerFor)return;if("Escape"===e.key){if(e.preventDefault(),"floor"===this._view&&this._canvas?.cancelGesture())return;return"property"===this._view&&this._propertyCanvas?.cancelGesture()?void(this._propertyDragStart&&(this._propertyHistory.discardIfLast(this._propertyDragStart),this._propertyLayout=this._propertyDragStart,this._propertyDragStart=null)):(this._onCancelPending(),this._mode="select",this._armedEntityId=null,this._armedOpeningType=null,this._armedFurnitureKind=null,this._armedBuildingKey=null,void(this._propertyMode="select"))}const t=e.ctrlKey||e.metaKey,i=e.key.toLowerCase(),o=t&&!e.shiftKey&&"z"===i,n=t&&(e.shiftKey&&"z"===i||"y"===i);if((o||"Backspace"===e.key)&&this._canvas?.undoLastPoint())return void e.preventDefault();if(o||n)return e.preventDefault(),void this._undoRedo(o?"undo":"redo");if("Delete"===e.key||"Backspace"===e.key)return"property"===this._view?((this._selectedOutdoorPin||this._selectedPlacement)&&e.preventDefault(),void(this._selectedOutdoorPin?this._onOutdoorPinDelete():this._selectedPlacement&&this._onPlacementDeleteClick())):((this._selectedRoom||this._selectedPin||this._selectedWall||this._selectedOpening||this._selectedFurniture)&&e.preventDefault(),void(this._selectedFurniture?this._onFurnitureDelete():this._selectedRoom?this._onRoomDelete():this._selectedPin?this._onPinDelete():this._selectedWall?this._onWallDelete():this._selectedOpening&&this._onOpeningDelete()));if("Enter"===e.key&&"wall"===this._mode)return e.preventDefault(),void this._onFinishWall();if("floor"!==this._view)return;const s=this._selectedFurniture;if(!t&&"r"===i){const t=e.shiftKey?15:90;return void("furniture"===this._mode&&this._armedFurnitureKind?(e.preventDefault(),this._armedFurnitureRotation=(this._armedFurnitureRotation+t)%360):s&&!s.locked&&(e.preventDefault(),this._patchFurniture(s.id,{rotation_deg:(s.rotation_deg+t)%360})))}if(t&&"d"===i&&s)return e.preventDefault(),void this._onFurnitureDuplicate();const r={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(r&&s&&!s.locked){e.preventDefault();const t=(e.shiftKey?10:1)*this._unitsPerCm;this._patchFurniture(s.id,{x:s.x+r[0]*t,y:s.y+r[1]*t})}},this._onFileInputChange=async e=>{const t=e.target,i=t.files?.[0];t.value="",i&&this._handleBackgroundFile(i)},this._onSvgImportInputChange=e=>{const t=e.target,i=t.files?.[0];t.value="",i&&this._handleSvgFile(i,"import")},this._onCanvasDragOver=e=>{e.dataTransfer?.types.includes("Files")&&(e.preventDefault(),this._dragOverCanvas=!0)},this._onCanvasDragLeave=()=>{this._dragOverCanvas=!1},this._onCanvasDrop=e=>{if(!e.dataTransfer?.types.includes("Files"))return;e.preventDefault(),this._dragOverCanvas=!1;const t=e.dataTransfer.files?.[0];t&&this._handleBackgroundFile(t)},this._onRemoveBackgroundClick=()=>{"property"===this._view?this._updatePropertyLayout({background_image_id:null}):this._updateLayout({background_image_id:null})},this._onOpacityChange=e=>{const t=Number(e.target.value);"property"===this._view?this._updatePropertyLayout({background_opacity:t}):this._updateLayout({background_opacity:t})},this._onCancelPending=()=>this._canvas?.cancelPending(),this._onFinishWall=()=>this._canvas?.finishPendingWall(),this._onAlignTargetChange=async e=>{const t=e.detail.floorId;t?(this._alignTargetFloorId=t,this._alignOffsetX=0,this._alignOffsetY=0,this._alignScale=1,this._alignTargetLayout=await this._client.getLayout(t)):this._resetAlignState()},this._onAlignDrag=e=>{this._alignOffsetX+=e.detail.dx,this._alignOffsetY+=e.detail.dy},this._onAlignScaleClick=e=>{const{factor:t}=e.detail,i=this._canvas?.getViewBox();if(i){const e=i.x+i.w/2,o=i.y+i.h/2;this._alignOffsetX=t*this._alignOffsetX+(1-t)*e,this._alignOffsetY=t*this._alignOffsetY+(1-t)*o}this._alignScale*=t},this._onAlignCancel=()=>{this._mode="select",this._resetAlignState()},this._onAlignApply=async()=>{if(!this._alignTargetFloorId||!this._alignTargetLayout)return;const e=this._alignTargetFloorId,t=this._floors.find(t=>t.floor_id===e)?.name??Le("floor.thatFloor");if(!window.confirm(Le("confirm.applyAlignment",{floor:t})))return;const i=this._alignScale,o=this._alignOffsetX,n=this._alignOffsetY,s=([e,t])=>[e*i+o,t*i+n],r=this._alignTargetLayout,a=this._layout.building_id??Re("building"),l={background_image_id:r.background_image_id,background_opacity:r.background_opacity,background_offset_x:r.background_offset_x*i+o,background_offset_y:r.background_offset_y*i+n,background_scale:r.background_scale*i,building_id:a,view_box:r.view_box?(()=>{const[e,t]=s([r.view_box.x,r.view_box.y]);return{x:e,y:t,w:r.view_box.w*i,h:r.view_box.h*i}})():null,rooms:r.rooms.map(e=>({...e,points:e.points.map(s)})),walls:r.walls.map(e=>({...e,points:e.points.map(s)})),pins:r.pins.map(e=>{const[t,i]=s([e.x,e.y]);return{...e,x:t,y:i}}),openings:r.openings.map(e=>{const[t,o]=s([e.x,e.y]);return{...e,x:t,y:o,width:e.width*i}}),north_deg:r.north_deg,furniture:r.furniture.map(e=>{const[t,i]=s([e.x,e.y]);return{...e,x:t,y:i}}),scale:this._layout.scale??(r.scale?{points:[s(r.scale.points[0]),s(r.scale.points[1])],meters:r.scale.meters}:null)};await this._client.saveLayout(e,l),this._layout.building_id!==a&&(await this._client.setBuildingId(this._currentFloorId,a),this._layout={...this._layout,building_id:a}),this._floors=await this._client.listFloors(),this._mode="select",this._resetAlignState(),this._floorHistory.clear()},this._onFurnitureLibraryClick=()=>{this._furnitureLibraryOpen=!this._furnitureLibraryOpen,this._furnitureLibraryOpen?"place"===this._mode&&(this._mode="select",this._armedEntityId=null):this._disarmFurniture()},this._onLibraryClose=()=>{this._furnitureLibraryOpen=!1,this._disarmFurniture()},this._onFurnitureDone=()=>this._disarmFurniture(),this._onFurnitureArmed=e=>{this._armedFurnitureKind=e.detail.kind,this._armedFurnitureRotation=0,this._mode=e.detail.kind?"furniture":"select",this._editingRoomId=null,this._editingWallId=null},this._onFurnitureRotateArmed=()=>{this._armedFurnitureRotation=(this._armedFurnitureRotation+90)%360},this._onFurniturePlace=e=>{const t=this._armedFurnitureKind?Ot(this._armedFurnitureKind):void 0;if(!t)return;const i={id:Re("furniture"),kind:t.id,x:e.detail.x,y:e.detail.y,rotation_deg:this._armedFurnitureRotation,width_cm:t.w,depth_cm:t.d,stroke_width:1.5};this._updateLayout({furniture:[...this._layout.furniture,i]}),e.detail.keepArmed||(this._disarmFurniture(),this._resetSelection(),this._selectedFurnitureId=i.id)},this._onFurnitureSelect=e=>{null!==e.detail.furnitureId?(this._resetSelection(),this._pinStackIds=null,this._selectedFurnitureId=e.detail.furnitureId):this._selectedFurnitureId=null},this._onFurnitureUpdate=e=>{const{id:t,...i}=e.detail;this._patchFurniture(t,i)},this._onFurnitureChange=e=>{this._selectedFurnitureId&&this._patchFurniture(this._selectedFurnitureId,e.detail.patch)},this._onFurnitureEntityToggle=()=>{const e=this._selectedFurniture?.entity_id;e&&this._hass?.callService&&this._hass.callService("homeassistant","toggle",{},{entity_id:e})},this._onFurnitureDelete=()=>{const e=this._selectedFurnitureId;e&&(this._updateLayout({furniture:this._layout.furniture.filter(t=>t.id!==e)}),this._selectedFurnitureId=null)},this._onFurnitureDuplicate=()=>{const e=this._selectedFurniture;if(!e)return;const t=30*this._unitsPerCm,i={...e,id:Re("furniture"),x:e.x+t,y:e.y+t,locked:!1};this._updateLayout({furniture:[...this._layout.furniture,i]}),this._selectedFurnitureId=i.id},this._onFurnitureOrder=e=>{const t=this._selectedFurniture;if(!t)return;const i=this._layout.furniture.filter(e=>e.id!==t.id);this._updateLayout({furniture:e.detail.front?[...i,t]:[t,...i]})},this._onOverlayToggle=e=>{this._overlays={...this._overlays,[e.detail.key]:!this._overlays[e.detail.key]};try{localStorage.setItem(Uo,JSON.stringify(this._overlays))}catch{}},this._onRoomLinksChange=e=>{const t=this._selectedRoom;t&&this._updateLayout({rooms:this._layout.rooms.map(i=>i.id===t.id?{...i,...e.detail}:i)})},this._onRoomLightsCommand=e=>{const t=this._selectedRoom,i=t?this._roomLights.get(t.id):void 0;i&&this._hass?.callService&&this._hass.callService("light",e.detail.on?"turn_on":"turn_off",{},{entity_id:i.entityIds})},this._onOpeningCoverChange=e=>{const t=this._selectedOpening;t&&this._updateLayout({openings:this._layout.openings.map(i=>i.id===t.id?{...i,cover_entity_id:e.detail.entityId}:i)})},this._onRoomNameChange=e=>{const t=this._selectedRoom;t&&this._updateLayout({rooms:this._layout.rooms.map(i=>i.id===t.id?{...i,name:e.detail.name}:i)})},this._onRoomAreaChange=e=>{const t=this._selectedRoom;if(!t)return;const i=e.detail.areaId||null,o=this._areas.find(e=>e.area_id===i);this._updateLayout({rooms:this._layout.rooms.map(e=>e.id===t.id?{...e,area_id:i,name:o?o.name:e.name}:e)})},this._onRoomMove=e=>{const{roomId:t,dx:i,dy:o}=e.detail;Me.log("room_move",{room_id:t,dx:Math.round(i),dy:Math.round(o)});const n=([e,t])=>[e+i,t+o],s=this._layout.rooms.map(e=>e.id===t?{...e,points:e.points.map(n),...e.label_position?{label_position:n(e.label_position)}:{}}:e),r=this._layout.pins.map(e=>e.room_id===t?{...e,x:e.x+i,y:e.y+o}:e);this._updateLayout({rooms:s,pins:Ze(s,r)})},this._onRoomLabelMoved=e=>{this._patchRoom(e.detail.roomId,{label_position:[e.detail.x,e.detail.y]})},this._onRoomLabelReset=()=>{const e=this._selectedRoom;e&&this._patchRoom(e.id,{label_position:null})},this._onRoomVisibleToggle=()=>{const e=this._selectedRoom;e&&this._patchRoom(e.id,{visible:!1===e.visible})},this._onRoomFillColorChange=e=>{const t=this._selectedRoom;t&&this._patchRoom(t.id,{fill_color:e.detail.color})},this._onRoomFillOpacityChange=e=>{const t=this._selectedRoom;t&&this._patchRoom(t.id,{fill_opacity:e.detail.opacity})},this._onRoomBorderOpacityChange=e=>{const t=this._selectedRoom;t&&this._patchRoom(t.id,{border_opacity:e.detail.opacity})},this._onRoomEditVertices=()=>{this._selectedRoomId&&(this._editingRoomId=this._editingRoomId===this._selectedRoomId?null:this._selectedRoomId)},this._onRoomDelete=()=>{const e=this._selectedRoom;if(!e||!window.confirm(Le("confirm.deleteRoom",{name:e.name})))return;const t=this._layout.rooms.filter(t=>t.id!==e.id);this._updateLayout({rooms:t,pins:Ze(t,this._layout.pins)}),this._selectedRoomId=null,this._editingRoomId=null},this._onPinLabelChange=e=>{const t=this._selectedPin;t&&this._patchPin(t.id,{label_override:e.detail.label.trim()||null})},this._onPinSetIcon=()=>{const e=this._selectedPin;e&&(this._iconPickerFor={kind:"floor",pinId:e.id})},this._onIconPicked=e=>{const t=this._iconPickerFor;if(this._iconPickerFor=null,!t)return;const i={icon_override:e.detail.icon};"floor"===t.kind?this._patchPin(t.pinId,i):this._patchOutdoorPin(t.pinId,i)},this._onIconPickerCancel=()=>{this._iconPickerFor=null},this._onPinHeightChange=e=>{const t=this._selectedPin;if(!t)return;const i=e.detail.value.trim(),o=""===i?null:ut(i,this._settings.unit_system);this._patchPin(t.id,{height_m:null!==o&&Number.isFinite(o)?o:null})},this._onPinDelete=()=>{const e=this._selectedPin;e&&window.confirm(Le("confirm.deletePin",{name:this._pinLabel(e)}))&&(this._updateLayout({pins:this._layout.pins.filter(t=>t.id!==e.id)}),this._selectedPinId=null)},this._onWallMaterialChange=e=>{const t=this._selectedWall;t&&this._updateLayout({walls:this._layout.walls.map(i=>i.id===t.id?{...i,material:e.detail.material}:i)})},this._onWallThicknessChange=e=>{const t=this._selectedWall;t&&(!Number.isFinite(e.detail.thicknessCm)||e.detail.thicknessCm<=0||this._updateLayout({walls:this._layout.walls.map(i=>i.id===t.id?{...i,thickness_cm:e.detail.thicknessCm}:i)}))},this._onWallEditVertices=()=>{this._selectedWallId&&(this._editingWallId=this._editingWallId===this._selectedWallId?null:this._selectedWallId)},this._onWallDelete=()=>{const e=this._selectedWall;e&&window.confirm(Le("confirm.deleteWall"))&&(this._updateLayout({walls:this._layout.walls.filter(t=>t.id!==e.id),openings:this._layout.openings.filter(t=>t.wallId!==e.id)}),this._selectedWallId=null,this._editingWallId=null)},this._onOpeningWidthChange=e=>{const t=this._selectedOpening;if(!t)return;const i=e.detail.width;this._updateLayout({openings:this._layout.openings.map(e=>e.id===t.id?{...e,width:i}:e)})},this._onOpeningDelete=()=>{const e=this._selectedOpening;e&&window.confirm(Le("door"===e.type?"confirm.deleteDoor":"confirm.deleteWindow"))&&(this._updateLayout({openings:this._layout.openings.filter(t=>t.id!==e.id)}),this._selectedOpeningId=null,this._selectedFurnitureId=null)},this._onEntityArmed=e=>{this._armedEntityId=this._armedEntityId===e.detail.entityId?null:e.detail.entityId},this._onClearAllPins=()=>{const e=this._layout.pins.length;0!==e&&window.confirm(Le(1===e?"confirm.removeFloorOne":"confirm.removeFloorMany",{count:e}))&&(this._autoSaveHeld=!0,this._updateLayout({pins:[]}),this._selectedPinId=null,this._pinStackIds=null)},this._onRoomTraceComplete=e=>{const t=De("New Room",e.detail.points,null),i=[...this._layout.rooms,t];this._updateLayout({rooms:i,pins:Ze(i,this._layout.pins)}),this._selectedRoomId=t.id},this._onRoomVertexChanged=e=>{const t=this._layout.rooms.map(t=>{if(t.id!==e.detail.roomId)return t;const i=t.label_position,o=!i||Ye(i[0],i[1],e.detail.points);return{...t,points:e.detail.points,...o?{}:{label_position:null}}});this._updateLayout({rooms:t,pins:Ze(t,this._layout.pins)})},this._onRoomSelect=e=>{this._selectedRoomId=e.detail.roomId,null===e.detail.roomId?this._editingRoomId=null:(this._selectedPinId=null,this._pinStackIds=null,this._selectedWallId=null,this._editingWallId=null,this._selectedOpeningId=null,this._selectedFurnitureId=null,this._selectedMeshLink=null,this._selectedMeshStub=null)},this._onWallTraceComplete=e=>{this._updateLayout({walls:[...this._layout.walls,He(e.detail.points)]})},this._onWallVertexChanged=e=>{this._updateLayout({walls:this._layout.walls.map(t=>t.id===e.detail.wallId?{...t,points:e.detail.points}:t)})},this._onWallSelect=e=>{this._selectedWallId=e.detail.wallId,null===e.detail.wallId?this._editingWallId=null:(this._selectedRoomId=null,this._editingRoomId=null,this._selectedPinId=null,this._pinStackIds=null,this._selectedOpeningId=null,this._selectedFurnitureId=null,this._selectedMeshLink=null,this._selectedMeshStub=null)},this._onOpeningPlace=e=>{if(!this._armedOpeningType)return;const t=We(e.detail.wallId,this._armedOpeningType,e.detail.x,e.detail.y,this._defaultOpeningWidth());this._updateLayout({openings:[...this._layout.openings,t]})},this._onOpeningSelect=e=>{this._selectedOpeningId=e.detail.openingId,null!==e.detail.openingId&&(this._selectedFurnitureId=null,this._selectedRoomId=null,this._editingRoomId=null,this._selectedPinId=null,this._pinStackIds=null,this._selectedWallId=null,this._editingWallId=null,this._selectedMeshLink=null,this._selectedMeshStub=null)},this._onOpeningUpdate=e=>{this._updateLayout({openings:this._layout.openings.map(t=>t.id===e.detail.openingId?{...t,x:e.detail.x,y:e.detail.y,width:e.detail.width}:t)})},this._onPinPlace=e=>{if(!this._armedEntityId)return;const t=Xe(e.detail.x,e.detail.y,this._layout.rooms),i=this._entityLookup.get(this._armedEntityId),o=ze(i?.device_id??null,e.detail.x,e.detail.y,t),n=this._layout.pins.filter(t=>t.x===e.detail.x&&t.y===e.detail.y);this._updateLayout({pins:[...this._layout.pins,o]}),this._armedEntityId=null,n.length>0?(this._pinStackIds=[...n.map(e=>e.id),o.id],this._selectedPinId=null):(this._pinStackIds=null,this._selectedPinId=o.id,this._selectedRoomId=null,this._selectedWallId=null,this._editingWallId=null,this._selectedOpeningId=null,this._selectedFurnitureId=null,this._selectedMeshLink=null,this._selectedMeshStub=null)},this._onPinMove=e=>{const t=Xe(e.detail.x,e.detail.y,this._layout.rooms);this._patchPin(e.detail.pinId,{x:e.detail.x,y:e.detail.y,room_id:t})},this._onPinSelect=e=>{this._selectedPinId=e.detail.pinId,this._pinStackIds=null,null!==e.detail.pinId&&(this._selectedRoomId=null,this._selectedWallId=null,this._editingWallId=null,this._selectedOpeningId=null,this._selectedFurnitureId=null,this._selectedMeshLink=null,this._selectedMeshStub=null)},this._onPinStackSelect=e=>{this._pinStackIds=e.detail.pinIds,this._selectedRoomId=null,this._selectedWallId=null,this._editingWallId=null,this._selectedOpeningId=null,this._selectedFurnitureId=null,this._selectedPinId=null,this._selectedMeshLink=null,this._selectedMeshStub=null},this._onMeshLinkSelect=e=>{this._selectedMeshLink=e.detail.link,null!==e.detail.link&&(this._selectedRoomId=null,this._editingRoomId=null,this._selectedPinId=null,this._pinStackIds=null,this._selectedWallId=null,this._editingWallId=null,this._selectedOpeningId=null,this._selectedFurnitureId=null,this._selectedMeshStub=null)},this._onMeshStubSelect=e=>{this._selectedMeshStub=e.detail.stub,null!==e.detail.stub&&(this._selectedRoomId=null,this._editingRoomId=null,this._selectedPinId=null,this._pinStackIds=null,this._selectedWallId=null,this._editingWallId=null,this._selectedOpeningId=null,this._selectedFurnitureId=null,this._selectedMeshLink=null)},this._onMeshStubGotoFloorClick=()=>{const e=this._selectedMeshStub;e&&(e.targetFloorId===be?this._selectProperty():this._selectFloor(e.targetFloorId))},this._onPinStackChoose=e=>{this._pinStackIds=null,this._selectedPinId=e.detail.pinId},this._onSelectionClear=()=>{this._resetSelection(),this._pinStackIds=null},this._onPinStackDismiss=()=>{this._pinStackIds=null},this._onPinStackRemove=e=>{const t=this._layout.pins.find(t=>t.id===e.detail.pinId);if(!t)return;if(!window.confirm(Le("confirm.removeFromSpot",{name:this._pinLabel(t)})))return;this._updateLayout({pins:this._layout.pins.filter(t=>t.id!==e.detail.pinId)});const i=(this._pinStackIds??[]).filter(t=>t!==e.detail.pinId);this._pinStackIds=i.length>1?i:null,this._selectedPinId=1===i.length?i[0]:null},this._onScaleLineComplete=e=>{const t=this._settings.unit_system,i=Le("imperial"===t?"units.feet":"units.metres"),o=window.prompt(Le("prompt.distance",{unit:i})),n=o?ut(o,t):null;if(null===n||!Number.isFinite(n)||n<=0)return;const s=e.detail.points;this._updateLayout({scale:{points:s,meters:n}}),this._mode="select"},this._onPendingChanged=e=>{this._pendingCount=e.detail.count},this._onSnapModeChange=e=>{this._snapMode=e.detail.snapMode;try{localStorage.setItem(No,this._snapMode)}catch{}}}set hass(e){this._hass=e,this._refreshLive(),this._initialized||(this._initialized=!0,this._init())}get hass(){return this._hass}get _client(){return new Ae(this._hass)}get _entityLookup(){return new Map(this._entities.map(e=>[e.entity_id,e]))}get _placedDeviceIds(){return new Set(("property"===this._view?this._propertyLayout.pins:this._layout.pins).map(e=>e.device_id).filter(e=>null!==e))}get _selectedRoom(){return this._layout.rooms.find(e=>e.id===this._selectedRoomId)??null}get _areasForCurrentFloor(){return this._areas.filter(e=>e.floor_id===this._currentFloorId||null===e.floor_id)}get _outdoorAreaIdsOnCurrentFloor(){const e=new Set(this._areas.filter(e=>null===e.floor_id).map(e=>e.area_id));return new Set(this._layout.rooms.map(e=>e.area_id).filter(t=>null!==t&&e.has(t)))}get _otherFloors(){return this._floors.filter(e=>e.floor_id!==this._currentFloorId)}get _buildings(){const e=new Map;for(const t of this._floors){const i=t.building_id??t.floor_id,o=e.get(i);o?o.push(t):e.set(i,[t])}return[...e.entries()].map(([e,t])=>{const i=t[0];return{key:e,name:t.length>1?t.map(e=>e.name).join(" + "):i.name,icon:i.icon||"mdi:home-city",floorId:i.floor_id,buildingId:i.building_id,aspectRatio:this._buildingAspectRatio(t)}})}_buildingAspectRatio(e){const t=this._buildingBounds(e),i=t?t.max_x-t.min_x:0,o=t?t.max_y-t.min_y:0;return i>0&&o>0?i/o:1.375}_buildingBounds(e){const t=e.map(e=>e.content_bounds).filter(e=>null!==e);return 0===t.length?null:{min_x:Math.min(...t.map(e=>e.min_x)),min_y:Math.min(...t.map(e=>e.min_y)),max_x:Math.max(...t.map(e=>e.max_x)),max_y:Math.max(...t.map(e=>e.max_y))}}get _floorNameById(){return new Map(this._floors.map(e=>[e.floor_id,e.name]))}get _floorIconById(){return new Map(this._floors.map(e=>[e.floor_id,e.icon||"mdi:floor-plan"]))}get _livePlacements(){const e=[];for(const t of this._propertyLayout.placements){if(this._floors.some(e=>e.floor_id===t.floor_id)){e.push(t);continue}const i=null!==t.building_id?this._floors.find(e=>e.building_id===t.building_id):void 0;i&&e.push({...t,floor_id:i.floor_id})}return e}get _selectedPlacement(){return this._livePlacements.find(e=>e.id===this._selectedPlacementId)??null}get _activeBackground(){return"property"===this._view?{imageId:this._propertyLayout.background_image_id,opacity:this._propertyLayout.background_opacity}:{imageId:this._layout.background_image_id,opacity:this._layout.background_opacity}}get _alignOverlay(){if("align"!==this._mode||!this._alignTargetLayout)return null;const e=Oe(this._alignTargetLayout.background_image_id);if(!e)return null;const t=this._alignTargetLayout;return{imageUrl:e,offsetX:this._alignScale*t.background_offset_x+this._alignOffsetX,offsetY:this._alignScale*t.background_offset_y+this._alignOffsetY,scale:this._alignScale*t.background_scale,opacity:.55}}get _orderedFloors(){if("ground_up"!==this._settings.floor_order)return this._floors;const e=this._floors.filter(e=>null!==e.level),t=this._floors.filter(e=>null===e.level);return[...e.reverse(),...t]}get _placedDeviceChoices(){const e=e=>e.label_override??xe(e.device_id,this._entityLookup.values()),t=new Map;for(const i of this._layout.pins)i.device_id&&t.set(i.device_id,e(i));for(const[i,{pin:o}]of this._otherFloorPinsByDeviceId)t.has(i)||t.set(i,e(o));return[...t].map(([e,t])=>({deviceId:e,label:t})).sort((e,t)=>e.label.localeCompare(t.label))}get _pinByDeviceId(){const e=new Map;for(const t of this._layout.pins)t.device_id&&e.set(t.device_id,t);return e}get _normalizedMeshLinks(){if(null===this._networkType)return[];if("zigbee"===this._networkType&&this._zigbeeMesh){const e=this._pinByDeviceId,t=this._outdoorPinByDeviceId,i=i=>e.has(i)?this._currentFloorId??void 0:t.has(i)?be:this._otherFloorPinsByDeviceId.get(i)?.floorId;return function(e,t,i){const o=e.links.filter(e=>e.source_device_id&&e.target_device_id&&void 0!==t(e.source_device_id)&&void 0!==t(e.target_device_id));if(i)return o;const n=e.nodes.find(e=>"Coordinator"===e.type)?.ieee,s=new Set,r=new Map,a=new Map;for(const e of o){e.parent_child&&s.add(e),(e.source_ieee===n||e.target_ieee===n)&&e.lqi>=50&&s.add(e);const i=t(e.source_device_id)!==t(e.target_device_id)?a:r;for(const t of[e.source_ieee,e.target_ieee]){const o=i.get(t);(!o||e.lqi>o.lqi)&&i.set(t,e)}}for(const e of r.values())s.add(e);for(const e of a.values())s.add(e);return[...s]}(function(e,t){const i=e.nodes.find(e=>"Coordinator"===e.type)?.ieee;return t&&i?{...e,nodes:e.nodes.map(e=>e.ieee===i?{...e,device_id:t}:e),links:e.links.map(e=>({...e,source_device_id:e.source_ieee===i?t:e.source_device_id,target_device_id:e.target_ieee===i?t:e.target_device_id}))}:e}(this._zigbeeMesh,this._settings.zigbee_coordinator_device_id),i,this._zigbeeShowAllLinks).map(e=>{return{sourceDeviceId:e.source_device_id,targetDeviceId:e.target_device_id,quality:(t=e.lqi,t>=150?"strong":t>=80?"medium":"weak"),detail:e.lqi_readings.every(t=>t===e.lqi)?`LQI ${e.lqi}`:`LQI ${e.lqi} (raw ${e.lqi_readings.join(" / ")})`};var t})}if("wifi"===this._networkType&&this._wifiMesh)return this._wifiMesh.links.map(e=>{return{sourceDeviceId:e.source_device_id,targetDeviceId:e.target_device_id,quality:null!=e.rssi_dbm?(t=e.rssi_dbm,t>=-50?"strong":t>=-70?"medium":"weak"):"unknown",...null!=e.rssi_dbm?{detail:`${e.rssi_dbm} dBm`}:{}};var t});if("bluetooth"===this._networkType){const e=[];for(const t of this._bluetoothAdverts.values()){const i=this._bluetoothDevices[t.address]??[],o=this._bluetoothDevices[t.source]??[];for(const n of i)for(const i of o)n!==i&&e.push({sourceDeviceId:n,targetDeviceId:i,quality:null!=t.rssi?ye(t.rssi):"unknown",...null!=t.rssi?{detail:`RSSI ${t.rssi} dBm`}:{}})}return e}if("matter"===this._networkType&&this._matterTopology){const e=new Map;for(const t of this._matterTopology.nodes)t.ha_device_id&&e.set(t.id,t.ha_device_id);const t=[];for(const i of this._matterTopology.connections){const o=e.get(i.source),n=e.get(i.target);o&&n&&t.push({sourceDeviceId:o,targetDeviceId:n,quality:i.strength,detail:i.strength})}return t}return[]}get _outdoorPinByDeviceId(){const e=new Map;for(const t of this._propertyLayout.pins)t.device_id&&e.set(t.device_id,t);return e}_propertyEnd(e){const t=this._outdoorPinByDeviceId.get(e);if(t)return{deviceId:e,x:t.x,y:t.y,label:this._pinLabel(t),floorId:null};const i=this._pinByDeviceId.get(e),o=i?{pin:i,floorId:this._currentFloorId}:this._otherFloorPinsByDeviceId.get(e);if(!o?.floorId)return null;const n=this._placementForFloor(o.floorId),s=n?function(e,t,i){const o=e.source_bounds;if(!o||o.max_x<=o.min_x||o.max_y<=o.min_y)return null;const n=((t-o.min_x)/(o.max_x-o.min_x)-.5)*e.width,s=((i-o.min_y)/(o.max_y-o.min_y)-.5)*e.height,r=e.rotation_deg*Math.PI/180,a=Math.cos(r),l=Math.sin(r);return{x:e.x+a*n-l*s,y:e.y+l*n+a*s}}(n,o.pin.x,o.pin.y):null;return s?{deviceId:e,...s,label:this._pinLabel(o.pin),floorId:o.floorId}:null}get _propertyMeshLinks(){const e=this._outdoorPinByDeviceId,t=[];for(const i of this._normalizedMeshLinks){if(!e.has(i.sourceDeviceId)&&!e.has(i.targetDeviceId))continue;const o=this._propertyEnd(i.sourceDeviceId),n=this._propertyEnd(i.targetDeviceId);o&&n&&t.push({key:`${i.sourceDeviceId}|${i.targetDeviceId}`,from:o,to:n,quality:i.quality,...i.detail?{detail:i.detail}:{}})}return t}get _selectedPropertyMeshLink(){return this._propertyMeshLinks.find(e=>e.key===this._selectedPropertyMeshLinkKey)??null}get _meshLinksForCurrentFloor(){const e=this._pinByDeviceId,t=[];for(const i of this._normalizedMeshLinks){const o=e.get(i.sourceDeviceId),n=e.get(i.targetDeviceId);o&&n&&t.push({fromPin:o,toPin:n,quality:i.quality,...i.detail?{detail:i.detail}:{}})}return t}_placementForFloor(e){const t=this._floors.find(t=>t.floor_id===e);return t?this._propertyLayout.placements.find(i=>null!==t.building_id?i.building_id===t.building_id:i.floor_id===e)??null:null}_currentFloorContentBounds(){const e=[];for(const t of this._layout.rooms)e.push(...t.points);for(const t of this._layout.walls)e.push(...t.points);if(0===e.length)return null;const t=e.map(([e])=>e),i=e.map(([,e])=>e),o=Math.min(...t),n=Math.max(...t),s=Math.min(...i),r=Math.max(...i),a=.05*Math.max(n-o,r-s)||20;return{minX:o-a,minY:s-a,maxX:n+a,maxY:r+a}}_projectStubTowardBuilding(e,t){if(!this._currentFloorId)return null;const i=this._placementForFloor(this._currentFloorId),o=this._placementForFloor(t);if(!i||!o)return null;const n=this._currentFloorContentBounds();if(!n)return null;const s=Math.atan2(o.y-i.y,o.x-i.x)-i.rotation_deg*Math.PI/180;return function(e,t,i,o,n){const s=i>0?(n.maxX-e)/i:i<0?(n.minX-e)/i:1/0,r=o>0?(n.maxY-t)/o:o<0?(n.minY-t)/o:1/0,a=Math.min(s,r);return!isFinite(a)||a<=0?null:{x:e+i*a,y:t+o*a}}(e.x,e.y,Math.cos(s),Math.sin(s),n)}get _meshStubsForCurrentFloor(){if(!this._currentFloorId)return[];const e=this._pinByDeviceId,t=this._otherFloorPinsByDeviceId,i=this._floors.find(e=>e.floor_id===this._currentFloorId),o=[];for(const n of this._normalizedMeshLinks){const s=e.has(n.sourceDeviceId);if(s===e.has(n.targetDeviceId))continue;const r=e.get(s?n.sourceDeviceId:n.targetDeviceId),a=s?n.targetDeviceId:n.sourceDeviceId,l=this._outdoorPinByDeviceId.get(a);if(l){const e=this._placementForFloor(this._currentFloorId),t=e?Pe(e,l.x,l.y):null;if(!t)continue;o.push({fromPin:r,x:t.x,y:t.y,targetDeviceId:a,targetFloorId:be,targetFloorName:"Outside",targetLabel:this._pinLabel(l),quality:n.quality,...n.detail?{detail:n.detail}:{}});continue}const c=t.get(a);if(!c||c.floorId===this._currentFloorId)continue;const d=this._floors.find(e=>e.floor_id===c.floorId),h=c.pin.label_override??xe(c.pin.device_id,this._entityLookup.values()),u=null!==i?.building_id&&i?.building_id===d?.building_id?{x:c.pin.x,y:c.pin.y}:this._projectStubTowardBuilding(r,c.floorId);u&&o.push({fromPin:r,x:u.x,y:u.y,targetDeviceId:a,targetFloorId:c.floorId,targetFloorName:d?.name??c.floorId,targetLabel:h,quality:n.quality,...n.detail?{detail:n.detail}:{}})}return o}get _selectedPin(){return this._layout.pins.find(e=>e.id===this._selectedPinId)??null}get _pinStack(){if(!this._pinStackIds)return null;const e=new Map(this._layout.pins.map(e=>[e.id,e])),t=this._pinStackIds.map(t=>e.get(t)).filter(e=>!!e);return t.length>1?t:null}get _selectedWall(){return this._layout.walls.find(e=>e.id===this._selectedWallId)??null}get _selectedFurniture(){return this._layout.furniture.find(e=>e.id===this._selectedFurnitureId)??null}_refreshLive(){const e=this._hass;if(!e)return;const t=ko(this._layout.rooms,e),i=function(e,t){const i=new Map;if(!t)return i;for(const o of e){const e=o.cover_entity_id;e&&i.set(o.id,xo(t,e))}return i}(this._layout.openings,e),o=function(e,t){const i=new Map;if(!t?.entities)return i;const o=new Map;for(const[e,i]of Object.entries(t.entities)){const t=i?.device_id;if(!t)continue;const n=o.get(t);n?n.push(e):o.set(t,[e])}for(const n of e){if(!n.device_id)continue;const e=Mo(o.get(n.device_id)??[]);if(!e)continue;const s=t.states[e];if(!s)continue;const r=Po(e.split(".")[0],s.state??"",s.attributes);r&&i.set(n.id,r)}return i}(this._layout.pins,e),n=function(e,t){const i=new Map;if(!t)return i;for(const o of e)o.entity_id&&i.set(o.id,Io(t,o.entity_id));return i}(this._layout.furniture,e),s=function(e,t,i,o=new Map){const n=[];for(const[e,t]of o)n.push(`${e}:${t.color}:${t.glow.toFixed(2)}:${t.text}`);for(const[t,i]of e)n.push(`${t}:${i.on}:${i.level.toFixed(2)}:${i.color}:${i.unavailable}:${i.entityIds.length}`);for(const[e,i]of t)n.push(`${e}:${null===i?"x":i.toFixed(2)}`);for(const[e,t]of i)n.push(`${e}:${t}`);return n.join("|")}(t,i,o,n);s!==this._liveSig&&(this._liveSig=s,this._itemStates=n,this._roomLights=t,this._coverOpenness=i,this._pinColors=o)}_entityOptions(e){const t=this._hass?.states??{};return Object.keys(t).filter(t=>t.startsWith(`${e}.`)).map(e=>({entity_id:e,name:String(t[e]?.attributes.friendly_name??e)})).sort((e,t)=>e.name.localeCompare(t.name))}_linkableEntities(){return["light","switch","fan","cover","media_player","climate","lock","vacuum","input_boolean","binary_sensor","sensor"].flatMap(e=>this._entityOptions(e))}get _location(){const e=this._hass?.config;return"number"==typeof e?.latitude&&"number"==typeof e.longitude?{latitude:e.latitude,longitude:e.longitude}:null}get _sunTime(){if(null===this._sunPreviewMinutes)return null;const e=new Date;return e.setHours(0,0,0,0),e.getTime()+6e4*this._sunPreviewMinutes}_renderCompassControls(){if("property"===this._view)return q;const e=this._layout.north_deg,t=this._sunPreviewMinutes??60*(new Date).getHours()+(new Date).getMinutes(),i=`${String(Math.floor(t/60)).padStart(2,"0")}:${String(t%60).padStart(2,"0")}`;return G`
      <label class="popover-row"
        >${Le("compass.faces")}
        <select
          @change=${e=>{const t=e.target.value;this._onNorthChange(""===t?null:Number(t))}}
        >
          <option value="" ?selected=${null===e}>
            ${Le("compass.notSet")}
          </option>
          ${li.map(t=>G`<option value=${t.deg} ?selected=${e===t.deg}>
                ${t.name}
              </option>`)}
          ${null===e||li.some(t=>t.deg===e)?q:G`<option value=${e} selected>${e}°</option>`}
        </select>
        <input
          type="number"
          min="0"
          max="359"
          step="1"
          style="width:64px"
          title=${Le("compass.degrees")}
          .value=${null===e?"":String(e)}
          @change=${e=>{const t=e.target.value;this._onNorthChange(""===t?null:Number(t))}}
        />
      </label>
      ${null===e||this._location?q:G`<span class="hint" style="padding: 0 16px 8px"
              >${Le("compass.noLocation")}</span
            >`}
      ${null!==e&&this._location?G`<label class="popover-row"
              >${Le("compass.preview",{time:i})}
              <input
                type="range"
                min="0"
                max="1439"
                step="10"
                style="--pct:${t/1439*100}%"
                .value=${String(t)}
                @input=${e=>this._sunPreviewMinutes=Number(e.target.value)}
              />
              ${null!==this._sunPreviewMinutes?G`<button
                      class="menu-item"
                      style="width:auto"
                      @click=${()=>this._sunPreviewMinutes=null}
                    >
                      ${Le("compass.now")}
                    </button>`:q}
            </label>`:q}
    `}get _unitsPerCm(){return this._canvas?.unitsPerCm??.5}get _selectedOpening(){return this._layout.openings.find(e=>e.id===this._selectedOpeningId)??null}get _selectedMeshLinkKey(){const e=this._selectedMeshLink;return e?`${e.fromPin.id}|${e.toPin.id}`:null}get _selectedMeshStubKey(){const e=this._selectedMeshStub;return e?`${e.fromPin.id}|${e.targetDeviceId}`:null}_unitsPerMeter(){const e=this._layout.scale;if(!e)return null;const[[t,i],[o,n]]=e.points;return(Math.hypot(o-t,n-i)||1)/e.meters}get _propertyScale(){const e=[];for(const t of this._livePlacements){const i=t.source_bounds;if(!i||t.width<=0)continue;const o=i.max_x-i.min_x;if(o<=0)continue;const n=this._buildingMetersPerUnit(t);null!==n&&e.push({area:t.width*t.height,mpu:n*o/t.width,name:t.label_override??this._floorNameById.get(t.floor_id)??"a building"})}if(0===e.length)return null;const t=e.reduce((e,t)=>t.area>e.area?t:e);return{metersPerUnit:t.mpu,buildingName:t.name,disagree:e.some(e=>Math.abs(e.mpu/t.mpu-1)>.1)}}_buildingMetersPerUnit(e){const t=this._floors.find(t=>t.floor_id===e.floor_id);if(t?.meters_per_unit)return t.meters_per_unit;if(null===e.building_id)return null;const i=this._floors.find(t=>t.building_id===e.building_id&&t.meters_per_unit);return i?.meters_per_unit??null}get _propertyScaleReadout(){const e=this._propertyScale;if(!e)return null;const t=this._settings.unit_system,i=function(e,t){return"imperial"===t?e*lt:e}(1/e.metersPerUnit,t);return Le("panel.scaleFromBuilding",{building:e.buildingName,unit:dt(t),value:i.toFixed(1)})}_defaultOpeningWidth(){const e=this._unitsPerMeter();return null===e?30:.9*e}async _init(){const[e,t,i,o,n]=await Promise.all([this._client.listFloors(),this._client.listPlaceableEntities(),this._client.listAreas(),this._client.getPropertyLayout(),this._client.getSettings()]);this._floors=e,this._entities=t,this._areas=i,this._propertyLayout=o,this._settings=n,Me.configure(this._client,n.debug_logging),Me.log("panel_open",{panel_version:"0.15.0-beta.1",panel_build:"0.15.0-beta.1+mv9xupxn",user_agent:navigator.userAgent,viewport:`${window.innerWidth}x${window.innerHeight}`,floors:e.length}),this._checkVersion();const s=this._orderedFloors[0];s&&await this._selectFloor(s.floor_id,{skipDirtyCheck:!0}),this._loading=!1}async _selectFloor(e,t={}){if(!t.skipDirtyCheck&&this._dirty)if(this._autoSaveActive){if(!await this._flushAutoSave())return void window.alert(Le("errors.floorSave"))}else if(!window.confirm(Le("confirm.discardFloor")))return;this._autoSaveHeld=!1,this._view="floor";const i=this._layout.building_id;this._currentFloorId=e,this._layout=await this._client.getLayout(e),this._resetSelection(),this._resetAlignState(),this._floorHistory.clear();const o=Ze(this._layout.rooms,this._layout.pins);o!==this._layout.pins?(this._layout={...this._layout,pins:o},this._dirty=!0):this._dirty=!1,this._loadOtherFloorPins(e),Me.log("floor_load",{floor_id:e,rooms:this._layout.rooms.length,walls:this._layout.walls.length,pins:this._layout.pins.length,healed:this._dirty}),this._sameBuildingAsPreviousFloor=null!==this._layout.building_id&&this._layout.building_id===i}async _loadOtherFloorPins(e){const t=this._floors.filter(t=>t.floor_id!==e),i=await Promise.all(t.map(e=>this._client.getLayout(e.floor_id)));if(this._currentFloorId!==e)return;const o=new Map;t.forEach((e,t)=>{for(const n of i[t].pins)n.device_id&&o.set(n.device_id,{pin:n,floorId:e.floor_id})}),this._otherFloorPinsByDeviceId=o}_resetAlignState(){this._alignTargetFloorId=null,this._alignTargetLayout=null,this._alignOffsetX=0,this._alignOffsetY=0,this._alignScale=1}_resetSelection(){this._selectedRoomId=null,this._editingRoomId=null,this._selectedPinId=null,this._selectedWallId=null,this._editingWallId=null,this._selectedOpeningId=null,this._selectedFurnitureId=null,this._selectedMeshLink=null,this._selectedMeshStub=null,this._armedEntityId=null,this._armedOpeningType=null}async _save(){if(this._currentFloorId){this._saving=!0;try{const e=this._canvas?.getViewBox()??this._layout.view_box;this._layout={...this._layout,view_box:e};const t=this._layout,i=performance.now();try{await this._client.saveLayout(this._currentFloorId,t)}catch(e){throw this._saveError=this._describeSaveError(e),Me.log("save_error",{target:this._currentFloorId,error:e?.message}),e}Me.log("save",{target:this._currentFloorId,ms:Math.round(performance.now()-i),rooms:t.rooms.length,pins:t.pins.length}),this._saveError=null,this._layout===t&&(this._dirty=!1),this._floors=this._floors.map(e=>e.floor_id===this._currentFloorId?{...e,has_layout:!0}:e),await this._refreshEntitiesIfPlacementChanged()}finally{this._saving=!1}}}async _export(){const e=await this._client.exportSnapshot(),t=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),i=URL.createObjectURL(t),o=document.createElement("a");o.href=i,o.download="layout.json",o.click(),URL.revokeObjectURL(i)}_updateLayout(e){this._floorHistory.record(this._layout),this._layout={...this._layout,...e},this._dirty=!0}async _selectProperty(){if(this._propertyDirty)if(this._autoSaveActive){if(!await this._flushAutoSave())return void window.alert(Le("errors.propertySave"))}else if(!window.confirm(Le("confirm.discardProperty")))return;this._autoSaveHeld=!1,[this._propertyLayout,this._floors]=await Promise.all([this._client.getPropertyLayout(),this._client.listFloors()]),this._propertyHistory.clear(),Me.log("property_load",{placements:this._propertyLayout.placements.length,outdoor_pins:this._propertyLayout.pins.length}),this._propertyDirty=!1,this._selectedPlacementId=null,this._selectedOutdoorPinId=null,this._selectedPropertyMeshLinkKey=null,this._propertyMode="select",this._armedBuildingKey=null,this._armedEntityId=null,this._view="property",this._loadPlacementGhosts()}async _loadPlacementGhosts(){const e=this._livePlacements,t=new Set,i=e=>this._floors.filter(t=>null!==e.building_id?t.building_id===e.building_id:t.floor_id===e.floor_id);for(const o of e)for(const e of i(o))t.add(e.floor_id);const o=new Map;await Promise.all([...t].map(async e=>{try{o.set(e,await this._client.getLayout(e))}catch{}}));const n=new Map;for(const t of e){const e=[],s=[];for(const n of i(t)){const t=o.get(n.floor_id);if(t){for(const i of t.rooms)!1!==i.visible&&e.push(i.points);for(const e of t.walls)s.push(e.points)}}n.set(t.id,{rooms:e,walls:s})}"property"===this._view&&(this._placementGhosts=n)}get _mapTilesAvailable(){const e=this._hass?.config;return!!e?.components?.includes("map_tiles")&&"number"==typeof e.latitude&&"number"==typeof e.longitude}_adjustMap(e){const t=this._propertyLayout.map_background;t&&this._updatePropertyLayout({map_background:e(t)})}_updatePropertyLayout(e){this._propertyHistory.record(this._propertyLayout),this._propertyLayout={...this._propertyLayout,...e},this._propertyDirty=!0}_undoRedo(e){if(Me.log(e,{view:this._view}),"property"===this._view){const t=this._propertyLayout,i="undo"===e?this._propertyHistory.undo(t):this._propertyHistory.redo(t);if(!i)return;return this._propertyLayout={...i,view_box:t.view_box},this._propertyDirty=!0,this._selectedPlacementId=null,this._selectedOutdoorPinId=null,void(this._selectedPropertyMeshLinkKey=null)}const t=this._layout,i="undo"===e?this._floorHistory.undo(t):this._floorHistory.redo(t);i&&(this._layout={...i,view_box:t.view_box,building_id:t.building_id},this._dirty=!0,this._resetSelection(),this._pinStackIds=null)}get _canUndo(){return"property"===this._view?this._propertyHistory.canUndo:this._floorHistory.canUndo}get _canRedo(){return"property"===this._view?this._propertyHistory.canRedo:this._floorHistory.canRedo}async _saveProperty(){this._propertySaving=!0;try{const e=this._propertyCanvas?.getViewBox()??this._propertyLayout.view_box;this._propertyLayout={...this._propertyLayout,view_box:e};const t=this._propertyLayout,i=performance.now();try{await this._client.savePropertyLayout(t)}catch(e){throw this._saveError=this._describeSaveError(e),Me.log("save_error",{target:"property",error:e?.message}),e}Me.log("save",{target:"property",ms:Math.round(performance.now()-i),placements:t.placements.length,pins:t.pins.length}),this._saveError=null,this._propertyLayout===t&&(this._propertyDirty=!1),await this._refreshEntitiesIfPlacementChanged()}finally{this._propertySaving=!1}}get _selectedOutdoorPin(){return this._propertyLayout.pins.find(e=>e.id===this._selectedOutdoorPinId)??null}_patchOutdoorPin(e,t){this._updatePropertyLayout({pins:this._propertyLayout.pins.map(i=>i.id===e?{...i,...t}:i)})}_patchPlacement(e,t){this._updatePropertyLayout({placements:this._propertyLayout.placements.map(i=>i.id===e?{...i,...t}:i)})}_describeSaveError(e){const t=e?.message||"unknown error";return/not a valid option|extra keys not allowed|invalid_format/i.test(t)?`${t} — Home Assistant may need a restart to finish updating Spatial Context.`:t}_placementKey(){return[...this._layout.pins,...this._propertyLayout.pins].map(e=>e.device_id??"").sort().join(",")}async _refreshEntitiesIfPlacementChanged(){const e=this._placementKey();e!==this._placementKeyForEntities&&(this._entities=await this._client.listPlaceableEntities(),this._placementKeyForEntities=e)}async _checkVersion(){let e=null,t=null;try{t=await this._client.getVersionInfo()}catch{e="restart"}t&&(t.loaded_version&&t.installed_version&&t.loaded_version!==t.installed_version?e="restart":t.panel_build_id&&"0.15.0-beta.1+mv9xupxn"!==t.panel_build_id&&(e="reload")),e!==this._versionNotice&&Me.log("version_check",{notice:e,panel_build:"0.15.0-beta.1+mv9xupxn",...t??{}}),this._versionNotice=e}async _downloadDebugReport(){await Me.flush();const e=await this._client.getDebugReport(),t=new Blob([JSON.stringify({...e,browser:{panel_version:"0.15.0-beta.1",panel_build:"0.15.0-beta.1+mv9xupxn",user_agent:navigator.userAgent,viewport:`${window.innerWidth}x${window.innerHeight}`}},null,2)],{type:"application/json"}),i=URL.createObjectURL(t),o=document.createElement("a");o.href=i,o.download=`spatial-context-debug-${(new Date).toISOString().slice(0,10)}.json`,o.click(),URL.revokeObjectURL(i)}get _autoSaveActive(){return this._settings.auto_save&&!this._autoSaveHeld}willUpdate(e){["_selectedRoomId","_selectedPinId","_selectedWallId","_selectedOpeningId","_selectedMeshLink","_selectedMeshStub","_pinStackIds","_selectedPlacementId","_selectedOutdoorPinId","_selectedPropertyMeshLinkKey"].some(t=>e.has(t)&&null!=this[t])&&(this._meshPopoverOpen=!1,this._backgroundPopoverOpen=!1,this._moreOptionsPopoverOpen=!1)}updated(e){super.updated(e),e.has("_layout")&&this._refreshLive(),(e.has("_layout")||e.has("_propertyLayout")||e.has("_dirty")||e.has("_propertyDirty"))&&this._scheduleAutoSave()}_scheduleAutoSave(){null!==this._autoSaveTimer&&(window.clearTimeout(this._autoSaveTimer),this._autoSaveTimer=null),this._autoSaveActive&&(this._dirty||this._propertyDirty)&&(this._autoSaveTimer=window.setTimeout(()=>{this._runAutoSave()},Wo.AUTO_SAVE_DELAY_MS))}async _runAutoSave(){if(this._autoSaveTimer=null,this._autoSaveActive)if(this._saving||this._propertySaving)this._scheduleAutoSave();else try{this._dirty&&await this._save(),this._propertyDirty&&await this._saveProperty()}catch{}}async _flushAutoSave(){if(!this._autoSaveActive)return!this._dirty&&!this._propertyDirty;null!==this._autoSaveTimer&&(window.clearTimeout(this._autoSaveTimer),this._autoSaveTimer=null);try{this._dirty&&await this._save(),this._propertyDirty&&await this._saveProperty()}catch{return!1}return!this._dirty&&!this._propertyDirty}async _loadCachedZigbeeMesh(){try{const e=await this._client.getCachedZigbeeMesh();if(!e?.fetched_at||this._zigbeeMeshLoading)return;const t=1e3*e.fetched_at;if(this._zigbeeMeshFetchedAt&&t<=this._zigbeeMeshFetchedAt)return;this._zigbeeMesh=e,this._zigbeeMeshFetchedAt=t}catch{}}async _refreshZigbeeMesh(e=!1){this._zigbeeMeshLoading=!0,this._zigbeeMeshError=null;const t=Date.now();this._zigbeeMeshElapsedSeconds=0,this._zigbeeMeshTimer=window.setInterval(()=>{this._zigbeeMeshElapsedSeconds=Math.round((Date.now()-t)/1e3)},1e3);try{this._zigbeeMesh=await this._client.getZigbeeMesh(e),Me.log("mesh_load",{network:"zigbee",force_refresh:e,ms:Date.now()-t,links:this._zigbeeMesh.links.length,nodes:this._zigbeeMesh.nodes.length}),this._zigbeeMeshFetchedAt=this._zigbeeMesh.fetched_at?1e3*this._zigbeeMesh.fetched_at:Date.now()}catch(e){const t=this._meshErrorMessage(e,Le("errors.zigbeeFailed"));this._zigbeeMeshError=t,Me.log("mesh_error",{network:"zigbee",error:t})}finally{this._zigbeeMeshLoading=!1,null!==this._zigbeeMeshTimer&&(window.clearInterval(this._zigbeeMeshTimer),this._zigbeeMeshTimer=null)}}async _refreshWifiMesh(){this._wifiMeshLoading=!0,this._wifiMeshError=null;try{this._wifiMesh=await this._client.getWifiMesh(),Me.log("mesh_load",{network:"wifi",links:this._wifiMesh.links.length})}catch(e){const t=this._meshErrorMessage(e,Le("errors.wifiFailed"));this._wifiMeshError=t,Me.log("mesh_error",{network:"wifi",error:t})}finally{this._wifiMeshLoading=!1}}async _subscribeMatter(){this._unsubscribeMatter(),this._matterError=null;try{this._matterUnsubscribe=await this._client.subscribeMatterTopology(e=>{this._matterTopology=e})}catch(e){this._matterError=this._meshErrorMessage(e,Le("errors.matterFailed"))}}_unsubscribeMatter(){this._matterUnsubscribe?.(),this._matterUnsubscribe=null}_meshErrorMessage(e,t){const{code:i,message:o}=e??{};return"unknown_command"===i?Le("errors.restartHa"):"unauthorized"===i?Le("errors.needsAdmin"):o||t}async _subscribeBluetooth(){this._unsubscribeBluetooth(),this._bluetoothError=null,this._bluetoothBuffer=new Map,this._bluetoothAdverts=new Map;let e=!1;try{this._bluetoothDevices=(await this._client.getBluetoothDevices()).devices,e=!0,this._bluetoothUnsubscribe=await this._client.subscribeBluetoothAdvertisements(e=>{for(const t of e.add??[])this._bluetoothBuffer.set(t.address,{address:t.address,source:t.source,rssi:t.rssi,name:t.name});for(const{address:t}of e.remove??[])this._bluetoothBuffer.delete(t);this._bluetoothFlushTimer??(this._bluetoothFlushTimer=window.setTimeout(()=>{this._bluetoothFlushTimer=null,this._bluetoothAdverts=new Map(this._bluetoothBuffer)},2e3))}),window.setTimeout(()=>{this._bluetoothAdverts=new Map(this._bluetoothBuffer),Me.log("mesh_load",{network:"bluetooth",adverts:this._bluetoothBuffer.size,known_addresses:Object.keys(this._bluetoothDevices).length})},300)}catch(t){this._bluetoothError=e&&"unknown_command"===t?.code?Le("errors.bluetoothVersion"):this._meshErrorMessage(t,Le("errors.bluetoothFailed")),Me.log("mesh_error",{network:"bluetooth",error:this._bluetoothError})}}_unsubscribeBluetooth(){this._bluetoothUnsubscribe?.(),this._bluetoothUnsubscribe=null,null!==this._bluetoothFlushTimer&&(window.clearTimeout(this._bluetoothFlushTimer),this._bluetoothFlushTimer=null)}connectedCallback(){super.connectedCallback(),this._fitToViewport(),window.visualViewport?.addEventListener("resize",this._fitToViewport),window.addEventListener("resize",this._fitToViewport),window.addEventListener("orientationchange",this._fitToViewport),window.addEventListener("keydown",this._onKeyDown),window.addEventListener("beforeunload",this._onBeforeUnload),document.addEventListener("visibilitychange",this._onVisibilityChange)}disconnectedCallback(){super.disconnectedCallback(),window.visualViewport?.removeEventListener("resize",this._fitToViewport),window.removeEventListener("resize",this._fitToViewport),window.removeEventListener("orientationchange",this._fitToViewport),window.removeEventListener("keydown",this._onKeyDown),window.removeEventListener("beforeunload",this._onBeforeUnload),document.removeEventListener("visibilitychange",this._onVisibilityChange),Me.flush(),this._flushAutoSave(),this._unsubscribeMatter(),this._unsubscribeBluetooth(),null!==this._zigbeeMeshTimer&&(window.clearInterval(this._zigbeeMeshTimer),this._zigbeeMeshTimer=null)}_deepActiveElement(){let e=document.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e}_isTypingTarget(){const e=this._deepActiveElement();return!!e&&(!!(e instanceof HTMLElement&&e.isContentEditable)||("TEXTAREA"===e.tagName||e instanceof HTMLInputElement&&["text","number","search","email","url","tel","password"].includes(e.type)))}async _handleBackgroundFile(e){if(function(e){return"image/svg+xml"===e.type||/\.svg$/i.test(e.name)}(e))await this._handleSvgFile(e,"background");else if(Wo._ACCEPTED_BACKGROUND_TYPES.has(e.type))try{const t=await this._client.uploadBackgroundImage(e);this._applyBackgroundImage(t)}catch(e){window.alert(Le("errors.bgUpload",{error:e.message}))}else window.alert(Le("errors.bgType"))}_applyBackgroundImage(e,t={}){const i={background_image_id:e,...!!this._activeBackground.imageId?{}:{background_opacity:.85}};"property"===this._view?this._updatePropertyLayout(i):this._updateLayout({...i,...t})}async _handleSvgFile(e,t){let i=null,o={},n=0;try{const s=await e.text(),r=xi(s),a=this._layout,l="property"!==this._view,c=r.rooms.length+r.walls.length+r.openings.length>0,d=0===a.rooms.length&&0===a.walls.length,h=l&&c&&("import"===t||d);if("import"===t&&!c)return void window.alert(Le("svgImport.nothingFound"));const u=h&&window.confirm(Le("svgImport.confirm",{rooms:r.rooms.length,walls:r.walls.length,openings:r.openings.length}));if("import"===t&&!u)return;if("background"===t||!this._activeBackground.imageId||window.confirm(Le("svgImport.alsoBackground"))){const t=await async function(e,t,i,o=4096){const n=(new DOMParser).parseFromString(e,"image/svg+xml"),s=n.documentElement,r=o/Math.max(t.w,t.h),a=Math.max(1,Math.round(t.w*r)),l=Math.max(1,Math.round(t.h*r));s.setAttribute("viewBox",`${t.x} ${t.y} ${t.w} ${t.h}`),s.setAttribute("width",String(a)),s.setAttribute("height",String(l)),s.setAttribute("preserveAspectRatio","none");const c=new Blob([(new XMLSerializer).serializeToString(n)],{type:"image/svg+xml"}),d=URL.createObjectURL(c);try{const e=new Image;e.src=d,await e.decode();const t=document.createElement("canvas");t.width=a,t.height=l;const o=t.getContext("2d");if(!o)throw new Error("Canvas not available");o.drawImage(e,0,0,a,l);const n=await new Promise(e=>t.toBlob(e,"image/png"));if(!n)throw new Error("Couldn't convert the SVG to an image");return new File([n],i.replace(/\.svg$/i,"")+".png",{type:"image/png"})}finally{URL.revokeObjectURL(d)}}(s,r.viewBox,e.name);i=await this._client.uploadBackgroundImage(t)}if(u){const e=this._settings.unit_system,t=Le("imperial"===e?"units.feet":"units.metres"),i=window.prompt(Le("svgImport.unitPrompt",{unit:t})),s=i?.trim()?ut(i.trim(),e):null,l=null!==s&&Number.isFinite(s)&&s>0?s:null,c=function(e,t,i,o){const n=e.viewBox,s=t.width/n.w,r=([e,i])=>[t.x+(e-n.x)*s,t.y+(i-n.y)*s],a=.003*Math.max(n.w,n.h),l=new Set(i),c=e.rooms.map(e=>{const t=[e.name,e.id??""].map(Wi).filter(Boolean),i=[...l].find(i=>t.includes(Wi(i.name))||null!==e.id&&i.area_id===e.id);return i&&l.delete(i),De(e.name,e.points.map(r),i?.area_id??null)}),d=e.walls.map(e=>({points:e.points.map(e=>[e[0],e[1]]),strokeWidth:e.strokeWidth,mergedInto:null})),h=[];let u=0;for(const t of e.openings){const e=Ni(d,t.points,a);if(!e){u++;continue}const{origin:i,dir:o,span:n}=e;let s=e.contained?e.wall:null;const[r,l]=n;if(!s){const e=e=>Math.abs((e[0]-i[0])*o[1]-(e[1]-i[1])*o[0]),t=e=>(e[0]-i[0])*o[0]+(e[1]-i[1])*o[1],c=d.filter(i=>{if(i.mergedInto||2!==i.points.length)return!1;if(!i.points.every(t=>e(t)<=a))return!1;const[o,s]=i.points.map(t).sort((e,t)=>e-t);return o<=n[1]+a&&s>=n[0]-a});if(0===c.length){u++;continue}let h=r,p=l;for(const e of c)for(const i of e.points)h=Math.min(h,t(i)),p=Math.max(p,t(i));s=c[0],s.points=[[i[0]+o[0]*h,i[1]+o[1]*h],[i[0]+o[0]*p,i[1]+o[1]*p]];for(const e of c.slice(1))e.mergedInto=s}const c=(r+l)/2;h.push({type:t.type,host:s,center:[i[0]+o[0]*c,i[1]+o[1]*c],width:l-r})}const p=new Map;for(const t of d){if(t.mergedInto)continue;const i=He(t.points.map(r));if(o&&t.strokeWidth){const n=t.strokeWidth/e.drawingUnit*o*100;i.thickness_cm=Math.max(1,Math.round(10*n)/10)}p.set(t,i)}const g=h.map(e=>{const[t,i]=r(e.center);return We(p.get(function(e){for(;e.mergedInto;)e=e.mergedInto;return e}(e.host)).id,e.type,t,i,e.width*s)});return{rooms:c,walls:[...p.values()],openings:g,scale:o?Ui(e,r,o):null,skippedOpenings:u}}(r,{x:a.background_offset_x,y:a.background_offset_y,width:ui*a.background_scale},this._areasForCurrentFloor,l),d=[...a.rooms,...c.rooms];o={rooms:d,pins:Ze(d,a.pins),walls:[...a.walls,...c.walls],openings:[...a.openings,...c.openings],...c.scale?{scale:c.scale}:{}},n=c.skippedOpenings}}catch(e){return void window.alert(Le("errors.svgImport",{error:e.message}))}i?this._applyBackgroundImage(i,o):this._updateLayout(o),n>0&&window.alert(Le("svgImport.skipped",{count:n}))}_disarmFurniture(){this._armedFurnitureKind=null,"furniture"===this._mode&&(this._mode="select")}_patchFurniture(e,t){this._updateLayout({furniture:this._layout.furniture.map(i=>i.id===e?{...i,...t}:i)})}_patchRoom(e,t){this._updateLayout({rooms:this._layout.rooms.map(i=>i.id===e?{...i,...t}:i)})}get _iconPickerPin(){const e=this._iconPickerFor;if(!e)return null;return("floor"===e.kind?this._layout.pins:this._propertyLayout.pins).find(t=>t.id===e.pinId)??null}_patchPin(e,t){this._updateLayout({pins:this._layout.pins.map(i=>i.id===e?{...i,...t}:i)})}_pinLabel(e){return e.label_override?e.label_override:xe(e.device_id,this._entityLookup.values())}_meshAgeLabel(e){const t=Math.round((Date.now()-e)/1e3);return t<60?Le("network.refreshedSeconds",{n:t}):Le("network.refreshedMinutes",{n:Math.round(t/60)})}_renderBackgroundPopover(){return G`
      <icon-popover
        slot="row-end"
        compact
        icon="mdi:image"
        label=${Le("menu.background")}
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
          ${this._activeBackground.imageId?Le("menu.replaceBackground"):Le("menu.uploadBackground")}
        </button>
        ${"property"===this._view?q:G`<button
                class="menu-item"
                @click=${()=>this.renderRoot.querySelector("#svg-import-input")?.click()}
              >
                <ha-icon icon="mdi:vector-square-plus"></ha-icon>
                ${Le("menu.importSvg")}
              </button>`}
        ${"property"===this._view&&this._mapTilesAvailable&&void 0!==this._propertyLayout.map_background?G`<button
                  class="menu-item"
                  @click=${this._onToggleMapBackground}
                >
                  <ha-icon icon="mdi:map"></ha-icon>
                  ${this._propertyLayout.map_background?Le("mapBackground.remove"):Le("mapBackground.add")}
                </button>
                ${this._propertyLayout.map_background?G`<label class="popover-row"
                          >${Le("mapBackground.style")}
                          <span class="select-wrap"
                            ><select @change=${this._onMapStyleChange}>
                              <option
                                value="street"
                                ?selected=${"aerial"!==this._propertyLayout.map_background.style}
                              >
                                ${Le("mapBackground.street")}
                              </option>
                              <option
                                value="aerial"
                                ?selected=${"aerial"===this._propertyLayout.map_background.style}
                              >
                                ${Le("mapBackground.aerial")}
                              </option></select
                            ><ha-icon
                              class="chev"
                              icon="mdi:menu-down"
                            ></ha-icon
                          ></span>
                        </label>
                        <label class="popover-row"
                          >${Le("mapBackground.opacity")}
                          <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.05"
                            style="--pct:${(this._propertyLayout.map_background.opacity-.1)/.9*100}%"
                            .value=${String(this._propertyLayout.map_background.opacity)}
                            @input=${this._onMapOpacityChange}
                          />
                        </label>`:q}`:q}
        ${this._activeBackground.imageId?G`<button
                class="menu-item"
                @click=${this._onRemoveBackgroundClick}
              >
                <ha-icon icon="mdi:image-remove"></ha-icon>
                ${Le("menu.removeBackground")}
              </button>`:q}
        ${this._activeBackground.imageId?G`<label class="popover-row"
                >${Le("menu.opacity")}
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  style="--pct:${(this._activeBackground.opacity-.1)/.9*100}%"
                  .value=${String(this._activeBackground.opacity)}
                  @input=${this._onOpacityChange}
                />
              </label>`:q}
        ${this._renderCompassControls()}
      </icon-popover>
    `}get _networkLabel(){switch(this._networkType){case"zigbee":return Le("network.zigbeeShort");case"wifi":return Le("network.wifiShort");case"matter":return Le("network.matterShort");case"bluetooth":return Le("network.bluetooth");default:return null}}render(){if(this._loading)return G`<div class="loading">${Le("panel.loading")}</div>`;if(0===this._floors.length)return G`<div class="no-floors">${Le("panel.noFloors")}</div>`;const e="zigbee"===this._networkType?this._zigbeeMeshError:"wifi"===this._networkType?this._wifiMeshError:"bluetooth"===this._networkType?this._bluetoothError:this._matterError;return G`
      <app-header
        .floors=${this._orderedFloors}
        .selectedFloorId=${this._currentFloorId}
        .propertySelected=${"property"===this._view}
        @floor-selected=${this._onFloorSelected}
        @property-selected=${this._onPropertySelected}
      >
        ${"floor"===this._view||"property"===this._view?G`<icon-popover
                icon="mdi:lan"
                label=${Le("menu.connectivity")}
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
                    ${Le("network.zigbee")}
                    ${"zigbee"===this._networkType?G`<ha-icon class="trail" icon="mdi:check"></ha-icon>`:q}
                  </button>
                  <button
                    class="menu-item ${"wifi"===this._networkType?"active":""}"
                    @click=${()=>this._onNetworkTypeSelect("wifi")}
                  >
                    <ha-icon icon="mdi:wifi"></ha-icon>
                    ${Le("network.wifi")}
                    ${"wifi"===this._networkType?G`<ha-icon class="trail" icon="mdi:check"></ha-icon>`:q}
                  </button>
                  <button
                    class="menu-item ${"matter"===this._networkType?"active":""}"
                    @click=${()=>this._onNetworkTypeSelect("matter")}
                  >
                    <ha-icon icon="mdi:router-wireless"></ha-icon>
                    ${Le("network.matter")}
                    ${"matter"===this._networkType?G`<ha-icon class="trail" icon="mdi:check"></ha-icon>`:q}
                  </button>
                  <button
                    class="menu-item ${"bluetooth"===this._networkType?"active":""}"
                    @click=${()=>this._onNetworkTypeSelect("bluetooth")}
                  >
                    <ha-icon icon="mdi:bluetooth"></ha-icon>
                    ${Le("network.bluetooth")}
                    ${"bluetooth"===this._networkType?G`<ha-icon class="trail" icon="mdi:check"></ha-icon>`:q}
                  </button>
                </div>
                ${null===this._networkType?q:G`
                        <div class="menu-divider"></div>
                        ${"zigbee"===this._networkType?G`<button
                                  class="menu-item"
                                  ?disabled=${this._zigbeeMeshLoading}
                                  @click=${this._onLoadMesh}
                                >
                                  <ha-icon icon="mdi:refresh"></ha-icon>
                                  ${this._zigbeeMeshLoading?Le("network.loadingZigbee",{seconds:this._zigbeeMeshElapsedSeconds}):this._zigbeeMeshFetchedAt?Le("network.refresh"):Le("network.load")}
                                </button>
                                <label class="popover-row">
                                  ${Le("network.showAll")}
                                  <input
                                    type="checkbox"
                                    class="switch"
                                    role="switch"
                                    .checked=${this._zigbeeShowAllLinks}
                                    @change=${e=>{this._zigbeeShowAllLinks=e.target.checked,this._selectedMeshLink=null,this._selectedMeshStub=null}}
                                  />
                                </label>`:"matter"===this._networkType&&this._matterUnsubscribe||"bluetooth"===this._networkType&&this._bluetoothUnsubscribe?G`<span
                                  class="hint"
                                  style="padding: 4px 16px 8px"
                                  >${Le("network.live")}</span
                                >`:"wifi"===this._networkType&&this._wifiMeshLoading?G`<span
                                    class="hint"
                                    style="padding: 4px 16px 8px"
                                    >${Le("network.loading")}</span
                                  >`:q}
                        ${e?G`<span
                                class="hint"
                                style="color: var(--sc-danger); padding: 0 16px 8px"
                                >${e}</span
                              >`:"zigbee"===this._networkType&&this._zigbeeMeshFetchedAt?G`<span
                                  class="hint"
                                  style="padding: 0 16px 8px"
                                  >${this._meshAgeLabel(this._zigbeeMeshFetchedAt)}</span
                                >`:q}
                      `}
              </icon-popover>`:q}
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
            @settings-change=${this._onSettingsChange}
            @settings-close=${()=>this._settingsPopoverOpen=!1}
          ></settings-menu>
        </icon-popover>
        <icon-popover
          slot="end"
          icon="mdi:dots-vertical"
          label=${Le("menu.more")}
          .open=${this._moreOptionsPopoverOpen}
          @toggle=${this._onToggleMoreOptionsPopover}
        >
          <button
            class="menu-item"
            @click=${()=>{this._moreOptionsPopoverOpen=!1,this._onExportClick()}}
          >
            <ha-icon icon="mdi:download"></ha-icon>
            ${Le("menu.exportJson")}
          </button>
          <button
            class="menu-item"
            title=${Le("menu.debugReportHint")}
            @click=${()=>{this._moreOptionsPopoverOpen=!1,this._downloadDebugReport()}}
          >
            <ha-icon icon="mdi:bug"></ha-icon> ${Le("menu.debugReport")}
          </button>
          <button
            class="menu-item danger"
            @click=${()=>{this._moreOptionsPopoverOpen=!1,this._onResetClick()}}
          >
            <ha-icon icon="mdi:delete-sweep"></ha-icon>
            ${"property"===this._view?Le("menu.resetProperty"):Le("menu.resetFloor")}
          </button>
        </icon-popover>
      </app-header>

      <div class="main">
        ${this._versionNotice?G`<div class="save-error floating-panel" role="status">
                <ha-icon icon="mdi:update"></ha-icon>
                <span
                  >${"restart"===this._versionNotice?Le("panel.versionRestart"):Le("panel.versionReload")}</span
                >
                <button @click=${()=>this._versionNotice=null}>
                  ${Le("panel.dismiss")}
                </button>
              </div>`:q}
        ${this._saveError?G`<div class="save-error floating-panel" role="alert">
                <ha-icon icon="mdi:alert"></ha-icon>
                <span
                  >Couldn't save: ${this._saveError} Your changes are still here
                  — keep this tab open.</span
                >
                <button @click=${this._onSaveClick}>Retry</button>
              </div>`:q}
        ${"property"===this._view?G`
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
                    .backgroundImageUrl=${Oe(this._propertyLayout.background_image_id)}
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
                    .scaleWarning=${this._propertyScale?.disagree?Le("panel.scaleDisagree"):null}
                    .armedBuildingKey=${this._armedBuildingKey}
                    .selectedPlacement=${this._selectedPlacement}
                    .selectedPinLabel=${this._selectedOutdoorPin?this._pinLabel(this._selectedOutdoorPin):null}
                    .selectedMeshLink=${this._selectedPropertyMeshLink}
                    .selectedPinDefaultLabel=${this._selectedOutdoorPin?xe(this._selectedOutdoorPin.device_id,this._entityLookup.values()):null}
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
                ${"place-pin"===this._propertyMode?G`<entity-picker-sidebar
                        @picker-close=${this._onPickerClose}
                        .entities=${this._entities}
                        .placedDeviceIds=${this._placedDeviceIds}
                        .armedEntityId=${this._armedEntityId}
                        .floors=${this._floors}
                        .areas=${this._areas}
                        .currentFloorId=${be}
                        @entity-armed=${this._onEntityArmed}
                        @clear-all-pins=${this._onClearAllOutdoorPins}
                      ></entity-picker-sidebar>`:q}
              `:G`
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
                    .backgroundImageUrl=${Oe(this._layout.background_image_id)}
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
                    .northDeg=${this._layout.north_deg}
                    .location=${this._location}
                    .sunTime=${this._sunTime}
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
                </div>
                ${"place"===this._mode?G`<entity-picker-sidebar
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
                      ></entity-picker-sidebar>`:this._furnitureLibraryOpen?G`<furniture-library-sidebar
                          .armedKind=${this._armedFurnitureKind}
                          .unitSystem=${this._settings.unit_system}
                          @furniture-armed=${this._onFurnitureArmed}
                          @library-close=${this._onLibraryClose}
                        ></furniture-library-sidebar>`:q}
              `}
      </div>
      ${this._iconPickerPin?G`<icon-picker-dialog
              .value=${this._iconPickerPin.icon_override??null}
              .suggestFrom=${this._pinLabel(this._iconPickerPin)}
              @icon-picked=${this._onIconPicked}
              @icon-picker-cancel=${this._onIconPickerCancel}
            ></icon-picker-dialog>`:q}
    `}};Vo.styles=[bt,yt,xt,wt,a`
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
    `],Vo.AUTO_SAVE_DELAY_MS=3e3,Vo._ACCEPTED_BACKGROUND_TYPES=new Set(["image/png","image/jpeg","image/gif"]),e([_e()],Vo.prototype,"_floors",void 0),e([_e()],Vo.prototype,"_currentFloorId",void 0),e([_e()],Vo.prototype,"_layout",void 0),e([_e()],Vo.prototype,"_selectedFurnitureId",void 0),e([_e()],Vo.prototype,"_armedFurnitureKind",void 0),e([_e()],Vo.prototype,"_armedFurnitureRotation",void 0),e([_e()],Vo.prototype,"_furnitureLibraryOpen",void 0),e([_e()],Vo.prototype,"_overlays",void 0),e([_e()],Vo.prototype,"_roomLights",void 0),e([_e()],Vo.prototype,"_coverOpenness",void 0),e([_e()],Vo.prototype,"_pinColors",void 0),e([_e()],Vo.prototype,"_itemStates",void 0),e([_e()],Vo.prototype,"_sunPreviewMinutes",void 0),e([_e()],Vo.prototype,"_entities",void 0),e([_e()],Vo.prototype,"_areas",void 0),e([_e()],Vo.prototype,"_mode",void 0),e([_e()],Vo.prototype,"_snapMode",void 0),e([_e()],Vo.prototype,"_dragOverCanvas",void 0),e([_e()],Vo.prototype,"_armedEntityId",void 0),e([_e()],Vo.prototype,"_armedOpeningType",void 0),e([_e()],Vo.prototype,"_selectedRoomId",void 0),e([_e()],Vo.prototype,"_editingRoomId",void 0),e([_e()],Vo.prototype,"_selectedPinId",void 0),e([_e()],Vo.prototype,"_pinStackIds",void 0),e([_e()],Vo.prototype,"_selectedWallId",void 0),e([_e()],Vo.prototype,"_editingWallId",void 0),e([_e()],Vo.prototype,"_selectedOpeningId",void 0),e([_e()],Vo.prototype,"_selectedMeshLink",void 0),e([_e()],Vo.prototype,"_selectedMeshStub",void 0),e([_e()],Vo.prototype,"_otherFloorPinsByDeviceId",void 0),e([_e()],Vo.prototype,"_dirty",void 0),e([_e()],Vo.prototype,"_saving",void 0),e([_e()],Vo.prototype,"_loading",void 0),e([_e()],Vo.prototype,"_pendingCount",void 0),e([_e()],Vo.prototype,"_networkType",void 0),e([_e()],Vo.prototype,"_zigbeeMesh",void 0),e([_e()],Vo.prototype,"_zigbeeMeshLoading",void 0),e([_e()],Vo.prototype,"_zigbeeMeshError",void 0),e([_e()],Vo.prototype,"_zigbeeMeshFetchedAt",void 0),e([_e()],Vo.prototype,"_zigbeeMeshElapsedSeconds",void 0),e([_e()],Vo.prototype,"_zigbeeShowAllLinks",void 0),e([_e()],Vo.prototype,"_wifiMesh",void 0),e([_e()],Vo.prototype,"_wifiMeshLoading",void 0),e([_e()],Vo.prototype,"_wifiMeshError",void 0),e([_e()],Vo.prototype,"_matterTopology",void 0),e([_e()],Vo.prototype,"_matterError",void 0),e([_e()],Vo.prototype,"_bluetoothAdverts",void 0),e([_e()],Vo.prototype,"_bluetoothDevices",void 0),e([_e()],Vo.prototype,"_bluetoothError",void 0),e([_e()],Vo.prototype,"_backgroundPopoverOpen",void 0),e([_e()],Vo.prototype,"_meshPopoverOpen",void 0),e([_e()],Vo.prototype,"_settings",void 0),e([_e()],Vo.prototype,"_settingsPopoverOpen",void 0),e([_e()],Vo.prototype,"_moreOptionsPopoverOpen",void 0),e([_e()],Vo.prototype,"_view",void 0),e([_e()],Vo.prototype,"_placementGhosts",void 0),e([_e()],Vo.prototype,"_propertyLayout",void 0),e([_e()],Vo.prototype,"_propertyDirty",void 0),e([_e()],Vo.prototype,"_saveError",void 0),e([_e()],Vo.prototype,"_iconPickerFor",void 0),e([_e()],Vo.prototype,"_versionNotice",void 0),e([_e()],Vo.prototype,"_propertySaving",void 0),e([_e()],Vo.prototype,"_selectedPlacementId",void 0),e([_e()],Vo.prototype,"_propertyMode",void 0),e([_e()],Vo.prototype,"_selectedOutdoorPinId",void 0),e([_e()],Vo.prototype,"_selectedPropertyMeshLinkKey",void 0),e([_e()],Vo.prototype,"_armedBuildingKey",void 0),e([_e()],Vo.prototype,"_sameBuildingAsPreviousFloor",void 0),e([_e()],Vo.prototype,"_alignTargetFloorId",void 0),e([_e()],Vo.prototype,"_alignTargetLayout",void 0),e([_e()],Vo.prototype,"_alignOffsetX",void 0),e([_e()],Vo.prototype,"_alignOffsetY",void 0),e([_e()],Vo.prototype,"_alignScale",void 0),e([me("floorplan-canvas")],Vo.prototype,"_canvas",void 0),e([me("property-canvas")],Vo.prototype,"_propertyCanvas",void 0),e([me("#file-input")],Vo.prototype,"_fileInput",void 0),Vo=Wo=e([fe("spatial-context-panel")],Vo),window.__spatialContextSetLanguage=function(e){const t=e.locale?.language??e.language??"en";Ie=Se[t]?t:"en"}}();

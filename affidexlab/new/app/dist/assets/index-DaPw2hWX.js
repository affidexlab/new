const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/add-Hdw2z8_U.js","assets/solana-wallet-yjeCsG4k.js","assets/all-wallets-D3Wr2l0q.js","assets/arrow-bottom-circle-CT9E7WMg.js","assets/app-store-CKpmw-k_.js","assets/apple-C09-NSit.js","assets/arrow-bottom-BzXKULQf.js","assets/arrow-left-Bd6gbM-1.js","assets/arrow-right-D9ezJh4H.js","assets/arrow-top-xDr37djS.js","assets/bank-DdsnWCtn.js","assets/browser-DbqMrytD.js","assets/card-CIUHk1lW.js","assets/checkmark-Z7c6kOqS.js","assets/checkmark-bold-bplOEKkw.js","assets/chevron-bottom-BHKwYOrp.js","assets/chevron-left-Bvs-NjSl.js","assets/chevron-right-CsenDEnK.js","assets/chevron-top-CaJFsi4s.js","assets/chrome-store-CAl5U77V.js","assets/clock-CyqMBRLZ.js","assets/close-BPEdhhwe.js","assets/compass-DwtFK77U.js","assets/coinPlaceholder-BDZuSf8v.js","assets/copy-G3orx6zU.js","assets/cursor-DSHTFyOY.js","assets/cursor-transparent-YcaX0C8n.js","assets/desktop-eCZzccH2.js","assets/disconnect-Q7xfDeFt.js","assets/discord-B-7sgnLv.js","assets/etherscan-Dkv2TfA9.js","assets/extension-B3BpTyTu.js","assets/external-link-DC4M5Di-.js","assets/facebook-Bs-YWcYD.js","assets/farcaster-CHhgVizr.js","assets/filters-BBhfeKwN.js","assets/github-9BG155_k.js","assets/google-Cx5iBauX.js","assets/help-circle-CF_lqSeI.js","assets/image-B81_zvs8.js","assets/id-BsqOiEWG.js","assets/info-circle-fL3Oz0bg.js","assets/lightbulb-BRRTqlYp.js","assets/mail-BSGL0GV8.js","assets/mobile-B6S7v3_W.js","assets/more-BA-vbw1c.js","assets/network-placeholder-C-Mr_xqB.js","assets/nftPlaceholder-Dn4CTyhz.js","assets/off-801rGEDP.js","assets/play-store-hw_OKIYl.js","assets/plus-BbSAngb3.js","assets/qr-code-B5M3asEQ.js","assets/recycle-horizontal-piy_iuv_.js","assets/refresh-Dw9OnAkT.js","assets/search-CnPLTxEm.js","assets/send-B21aVPL5.js","assets/swapHorizontal-BM-T50i4.js","assets/swapHorizontalMedium-BEgHifLN.js","assets/swapHorizontalBold-DABF0bOM.js","assets/swapHorizontalRoundedBold-HlsSQEA0.js","assets/swapVertical-Bpn-6wvh.js","assets/telegram-B1m9xJCi.js","assets/three-dots-rtsRe3ML.js","assets/twitch-B3VHs-Lf.js","assets/x-DtuGJ6nQ.js","assets/twitterIcon-D8SpeRQH.js","assets/verify-BDDPX8Ut.js","assets/verify-filled-CupqANt3.js","assets/wallet-geXl8zAA.js","assets/walletconnect-CiVMhwbT.js","assets/wallet-placeholder-DMH0fJAi.js","assets/warning-circle-c6XoWpAw.js","assets/info-e7rerry5.js","assets/exclamation-triangle-Be20DUYp.js","assets/reown-logo-CyGgDbCm.js"])))=>i.map(i=>d[i]);
import{f as N,u as q,E as Y,h as V,i as S,e as b,x as f,_ as a}from"./solana-wallet-yjeCsG4k.js";import{i as E,k as H,j as X}from"./core-fPxrP3ZZ.js";/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const K={attribute:!0,type:String,converter:q,reflect:!1,hasChanged:N},Z=(t=K,e,i)=>{const{kind:o,metadata:n}=i;let r=globalThis.litPropertyMetadata.get(n);if(r===void 0&&globalThis.litPropertyMetadata.set(n,r=new Map),o==="setter"&&((t=Object.create(t)).wrapped=!0),r.set(i.name,t),o==="accessor"){const{name:s}=i;return{set(c){const u=e.get.call(this);e.set.call(this,c),this.requestUpdate(s,u,t)},init(c){return c!==void 0&&this.C(s,void 0,t,c),c}}}if(o==="setter"){const{name:s}=i;return function(c){const u=this[s];e.call(this,c),this.requestUpdate(s,u,t)}}throw Error("Unsupported decorator location: "+o)};function l(t){return(e,i)=>typeof i=="object"?Z(t,e,i):((o,n,r)=>{const s=n.hasOwnProperty(r);return n.constructor.createProperty(r,o),s?Object.getOwnPropertyDescriptor(n,r):void 0})(t,e,i)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function bt(t){return l({...t,state:!0,attribute:!1})}/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Et=t=>t??Y;/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Q=t=>t===null||typeof t!="object"&&typeof t!="function",J=t=>t.strings===void 0;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const W={ATTRIBUTE:1,CHILD:2},U=t=>(...e)=>({_$litDirective$:t,values:e});let F=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,i,o){this._$Ct=e,this._$AM=i,this._$Ci=o}_$AS(e,i){return this.update(e,i)}update(e,i){return this.render(...i)}};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const T=(t,e)=>{var o;const i=t._$AN;if(i===void 0)return!1;for(const n of i)(o=n._$AO)==null||o.call(n,e,!1),T(n,e);return!0},I=t=>{let e,i;do{if((e=t._$AM)===void 0)break;i=e._$AN,i.delete(t),t=e}while((i==null?void 0:i.size)===0)},G=t=>{for(let e;e=t._$AM;t=e){let i=e._$AN;if(i===void 0)e._$AN=i=new Set;else if(i.has(t))break;i.add(t),it(e)}};function tt(t){this._$AN!==void 0?(I(this),this._$AM=t,G(this)):this._$AM=t}function et(t,e=!1,i=0){const o=this._$AH,n=this._$AN;if(n!==void 0&&n.size!==0)if(e)if(Array.isArray(o))for(let r=i;r<o.length;r++)T(o[r],!1),I(o[r]);else o!=null&&(T(o,!1),I(o));else T(this,t)}const it=t=>{t.type==W.CHILD&&(t._$AP??(t._$AP=et),t._$AQ??(t._$AQ=tt))};class rt extends F{constructor(){super(...arguments),this._$AN=void 0}_$AT(e,i,o){super._$AT(e,i,o),G(this),this.isConnected=e._$AU}_$AO(e,i=!0){var o,n;e!==this.isConnected&&(this.isConnected=e,e?(o=this.reconnected)==null||o.call(this):(n=this.disconnected)==null||n.call(this)),i&&(T(this,e),I(this))}setValue(e){if(J(this._$Ct))this._$Ct._$AI(e,this);else{const i=[...this._$Ct._$AH];i[this._$Ci]=e,this._$Ct._$AI(i,this,0)}}disconnected(){}reconnected(){}}/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class ot{constructor(e){this.G=e}disconnect(){this.G=void 0}reconnect(e){this.G=e}deref(){return this.G}}class at{constructor(){this.Y=void 0,this.Z=void 0}get(){return this.Y}pause(){this.Y??(this.Y=new Promise(e=>this.Z=e))}resume(){var e;(e=this.Z)==null||e.call(this),this.Y=this.Z=void 0}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const j=t=>!Q(t)&&typeof t.then=="function",B=1073741823;class nt extends rt{constructor(){super(...arguments),this._$Cwt=B,this._$Cbt=[],this._$CK=new ot(this),this._$CX=new at}render(...e){return e.find(i=>!j(i))??V}update(e,i){const o=this._$Cbt;let n=o.length;this._$Cbt=i;const r=this._$CK,s=this._$CX;this.isConnected||this.disconnected();for(let c=0;c<i.length&&!(c>this._$Cwt);c++){const u=i[c];if(!j(u))return this._$Cwt=c,u;c<n&&u===o[c]||(this._$Cwt=B,n=0,Promise.resolve(u).then(async h=>{for(;s.get();)await s.get();const p=r.deref();if(p!==void 0){const C=p._$Cbt.indexOf(u);C>-1&&C<p._$Cwt&&(p._$Cwt=C,p.setValue(h))}}))}return V}disconnected(){this._$CK.disconnect(),this._$CX.pause()}reconnected(){this._$CK.reconnect(this),this._$CX.resume()}}const st=U(nt);/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ct=U(class extends F{constructor(t){var e;if(super(t),t.type!==W.ATTRIBUTE||t.name!=="class"||((e=t.strings)==null?void 0:e.length)>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return" "+Object.keys(t).filter(e=>t[e]).join(" ")+" "}update(t,[e]){var o,n;if(this.st===void 0){this.st=new Set,t.strings!==void 0&&(this.nt=new Set(t.strings.join(" ").split(/\s/).filter(r=>r!=="")));for(const r in e)e[r]&&!((o=this.nt)!=null&&o.has(r))&&this.st.add(r);return this.render(e)}const i=t.element.classList;for(const r of this.st)r in e||(i.remove(r),this.st.delete(r));for(const r in e){const s=!!e[r];s===this.st.has(r)||(n=this.nt)!=null&&n.has(r)||(s?(i.add(r),this.st.add(r)):(i.remove(r),this.st.delete(r)))}return V}}),w={getSpacingStyles(t,e){if(Array.isArray(t))return t[e]?`var(--wui-spacing-${t[e]})`:void 0;if(typeof t=="string")return`var(--wui-spacing-${t})`},getFormattedDate(t){return new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric"}).format(t)},getHostName(t){try{return new URL(t).hostname}catch{return""}},getTruncateString({string:t,charsStart:e,charsEnd:i,truncate:o}){return t.length<=e+i?t:o==="end"?`${t.substring(0,e)}...`:o==="start"?`...${t.substring(t.length-i)}`:`${t.substring(0,Math.floor(e))}...${t.substring(t.length-Math.floor(i))}`},generateAvatarColors(t){const i=t.toLowerCase().replace(/^0x/iu,"").replace(/[^a-f0-9]/gu,"").substring(0,6).padEnd(6,"0"),o=this.hexToRgb(i),n=getComputedStyle(document.documentElement).getPropertyValue("--w3m-border-radius-master"),s=100-3*Number(n==null?void 0:n.replace("px","")),c=`${s}% ${s}% at 65% 40%`,u=[];for(let h=0;h<5;h+=1){const p=this.tintColor(o,.15*h);u.push(`rgb(${p[0]}, ${p[1]}, ${p[2]})`)}return`
    --local-color-1: ${u[0]};
    --local-color-2: ${u[1]};
    --local-color-3: ${u[2]};
    --local-color-4: ${u[3]};
    --local-color-5: ${u[4]};
    --local-radial-circle: ${c}
   `},hexToRgb(t){const e=parseInt(t,16),i=e>>16&255,o=e>>8&255,n=e&255;return[i,o,n]},tintColor(t,e){const[i,o,n]=t,r=Math.round(i+(255-i)*e),s=Math.round(o+(255-o)*e),c=Math.round(n+(255-n)*e);return[r,s,c]},isNumber(t){return{number:/^[0-9]+$/u}.number.test(t)},getColorTheme(t){var e;return t||(typeof window<"u"&&window.matchMedia?(e=window.matchMedia("(prefers-color-scheme: dark)"))!=null&&e.matches?"dark":"light":"dark")},splitBalance(t){const e=t.split(".");return e.length===2?[e[0],e[1]]:["0","00"]},roundNumber(t,e,i){return t.toString().length>=e?Number(t).toFixed(i):t},formatNumberToLocalString(t,e=2){return t===void 0?"0.00":typeof t=="number"?t.toLocaleString("en-US",{maximumFractionDigits:e,minimumFractionDigits:e}):parseFloat(t).toLocaleString("en-US",{maximumFractionDigits:e,minimumFractionDigits:e})}};function lt(t,e){const{kind:i,elements:o}=e;return{kind:i,elements:o,finisher(n){customElements.get(t)||customElements.define(t,n)}}}function ut(t,e){return customElements.get(t)||customElements.define(t,e),e}function $(t){return function(i){return typeof i=="function"?ut(t,i):lt(t,i)}}const dt=S`
  :host {
    display: flex;
    width: inherit;
    height: inherit;
  }
`;var g=function(t,e,i,o){var n=arguments.length,r=n<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(t,e,i,o);else for(var c=t.length-1;c>=0;c--)(s=t[c])&&(r=(n<3?s(r):n>3?s(e,i,r):s(e,i))||r);return n>3&&r&&Object.defineProperty(e,i,r),r};let d=class extends b{render(){return this.style.cssText=`
      flex-direction: ${this.flexDirection};
      flex-wrap: ${this.flexWrap};
      flex-basis: ${this.flexBasis};
      flex-grow: ${this.flexGrow};
      flex-shrink: ${this.flexShrink};
      align-items: ${this.alignItems};
      justify-content: ${this.justifyContent};
      column-gap: ${this.columnGap&&`var(--wui-spacing-${this.columnGap})`};
      row-gap: ${this.rowGap&&`var(--wui-spacing-${this.rowGap})`};
      gap: ${this.gap&&`var(--wui-spacing-${this.gap})`};
      padding-top: ${this.padding&&w.getSpacingStyles(this.padding,0)};
      padding-right: ${this.padding&&w.getSpacingStyles(this.padding,1)};
      padding-bottom: ${this.padding&&w.getSpacingStyles(this.padding,2)};
      padding-left: ${this.padding&&w.getSpacingStyles(this.padding,3)};
      margin-top: ${this.margin&&w.getSpacingStyles(this.margin,0)};
      margin-right: ${this.margin&&w.getSpacingStyles(this.margin,1)};
      margin-bottom: ${this.margin&&w.getSpacingStyles(this.margin,2)};
      margin-left: ${this.margin&&w.getSpacingStyles(this.margin,3)};
    `,f`<slot></slot>`}};d.styles=[E,dt];g([l()],d.prototype,"flexDirection",void 0);g([l()],d.prototype,"flexWrap",void 0);g([l()],d.prototype,"flexBasis",void 0);g([l()],d.prototype,"flexGrow",void 0);g([l()],d.prototype,"flexShrink",void 0);g([l()],d.prototype,"alignItems",void 0);g([l()],d.prototype,"justifyContent",void 0);g([l()],d.prototype,"columnGap",void 0);g([l()],d.prototype,"rowGap",void 0);g([l()],d.prototype,"gap",void 0);g([l()],d.prototype,"padding",void 0);g([l()],d.prototype,"margin",void 0);d=g([$("wui-flex")],d);class gt{constructor(){this.cache=new Map}set(e,i){this.cache.set(e,i)}get(e){return this.cache.get(e)}has(e){return this.cache.has(e)}delete(e){this.cache.delete(e)}clear(){this.cache.clear()}}const D=new gt,_t=S`
  :host {
    display: flex;
    aspect-ratio: var(--local-aspect-ratio);
    color: var(--local-color);
    width: var(--local-width);
  }

  svg {
    width: inherit;
    height: inherit;
    object-fit: contain;
    object-position: center;
  }

  .fallback {
    width: var(--local-width);
    height: var(--local-height);
  }
`;var A=function(t,e,i,o){var n=arguments.length,r=n<3?e:o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(t,e,i,o);else for(var c=t.length-1;c>=0;c--)(s=t[c])&&(r=(n<3?s(r):n>3?s(e,i,r):s(e,i))||r);return n>3&&r&&Object.defineProperty(e,i,r),r};const M={add:async()=>(await a(async()=>{const{addSvg:t}=await import("./add-Hdw2z8_U.js");return{addSvg:t}},__vite__mapDeps([0,1]))).addSvg,allWallets:async()=>(await a(async()=>{const{allWalletsSvg:t}=await import("./all-wallets-D3Wr2l0q.js");return{allWalletsSvg:t}},__vite__mapDeps([2,1]))).allWalletsSvg,arrowBottomCircle:async()=>(await a(async()=>{const{arrowBottomCircleSvg:t}=await import("./arrow-bottom-circle-CT9E7WMg.js");return{arrowBottomCircleSvg:t}},__vite__mapDeps([3,1]))).arrowBottomCircleSvg,appStore:async()=>(await a(async()=>{const{appStoreSvg:t}=await import("./app-store-CKpmw-k_.js");return{appStoreSvg:t}},__vite__mapDeps([4,1]))).appStoreSvg,apple:async()=>(await a(async()=>{const{appleSvg:t}=await import("./apple-C09-NSit.js");return{appleSvg:t}},__vite__mapDeps([5,1]))).appleSvg,arrowBottom:async()=>(await a(async()=>{const{arrowBottomSvg:t}=await import("./arrow-bottom-BzXKULQf.js");return{arrowBottomSvg:t}},__vite__mapDeps([6,1]))).arrowBottomSvg,arrowLeft:async()=>(await a(async()=>{const{arrowLeftSvg:t}=await import("./arrow-left-Bd6gbM-1.js");return{arrowLeftSvg:t}},__vite__mapDeps([7,1]))).arrowLeftSvg,arrowRight:async()=>(await a(async()=>{const{arrowRightSvg:t}=await import("./arrow-right-D9ezJh4H.js");return{arrowRightSvg:t}},__vite__mapDeps([8,1]))).arrowRightSvg,arrowTop:async()=>(await a(async()=>{const{arrowTopSvg:t}=await import("./arrow-top-xDr37djS.js");return{arrowTopSvg:t}},__vite__mapDeps([9,1]))).arrowTopSvg,bank:async()=>(await a(async()=>{const{bankSvg:t}=await import("./bank-DdsnWCtn.js");return{bankSvg:t}},__vite__mapDeps([10,1]))).bankSvg,browser:async()=>(await a(async()=>{const{browserSvg:t}=await import("./browser-DbqMrytD.js");return{browserSvg:t}},__vite__mapDeps([11,1]))).browserSvg,card:async()=>(await a(async()=>{const{cardSvg:t}=await import("./card-CIUHk1lW.js");return{cardSvg:t}},__vite__mapDeps([12,1]))).cardSvg,checkmark:async()=>(await a(async()=>{const{checkmarkSvg:t}=await import("./checkmark-Z7c6kOqS.js");return{checkmarkSvg:t}},__vite__mapDeps([13,1]))).checkmarkSvg,checkmarkBold:async()=>(await a(async()=>{const{checkmarkBoldSvg:t}=await import("./checkmark-bold-bplOEKkw.js");return{checkmarkBoldSvg:t}},__vite__mapDeps([14,1]))).checkmarkBoldSvg,chevronBottom:async()=>(await a(async()=>{const{chevronBottomSvg:t}=await import("./chevron-bottom-BHKwYOrp.js");return{chevronBottomSvg:t}},__vite__mapDeps([15,1]))).chevronBottomSvg,chevronLeft:async()=>(await a(async()=>{const{chevronLeftSvg:t}=await import("./chevron-left-Bvs-NjSl.js");return{chevronLeftSvg:t}},__vite__mapDeps([16,1]))).chevronLeftSvg,chevronRight:async()=>(await a(async()=>{const{chevronRightSvg:t}=await import("./chevron-right-CsenDEnK.js");return{chevronRightSvg:t}},__vite__mapDeps([17,1]))).chevronRightSvg,chevronTop:async()=>(await a(async()=>{const{chevronTopSvg:t}=await import("./chevron-top-CaJFsi4s.js");return{chevronTopSvg:t}},__vite__mapDeps([18,1]))).chevronTopSvg,chromeStore:async()=>(await a(async()=>{const{chromeStoreSvg:t}=await import("./chrome-store-CAl5U77V.js");return{chromeStoreSvg:t}},__vite__mapDeps([19,1]))).chromeStoreSvg,clock:async()=>(await a(async()=>{const{clockSvg:t}=await import("./clock-CyqMBRLZ.js");return{clockSvg:t}},__vite__mapDeps([20,1]))).clockSvg,close:async()=>(await a(async()=>{const{closeSvg:t}=await import("./close-BPEdhhwe.js");return{closeSvg:t}},__vite__mapDeps([21,1]))).closeSvg,compass:async()=>(await a(async()=>{const{compassSvg:t}=await import("./compass-DwtFK77U.js");return{compassSvg:t}},__vite__mapDeps([22,1]))).compassSvg,coinPlaceholder:async()=>(await a(async()=>{const{coinPlaceholderSvg:t}=await import("./coinPlaceholder-BDZuSf8v.js");return{coinPlaceholderSvg:t}},__vite__mapDeps([23,1]))).coinPlaceholderSvg,copy:async()=>(await a(async()=>{const{copySvg:t}=await import("./copy-G3orx6zU.js");return{copySvg:t}},__vite__mapDeps([24,1]))).copySvg,cursor:async()=>(await a(async()=>{const{cursorSvg:t}=await import("./cursor-DSHTFyOY.js");return{cursorSvg:t}},__vite__mapDeps([25,1]))).cursorSvg,cursorTransparent:async()=>(await a(async()=>{const{cursorTransparentSvg:t}=await import("./cursor-transparent-YcaX0C8n.js");return{cursorTransparentSvg:t}},__vite__mapDeps([26,1]))).cursorTransparentSvg,desktop:async()=>(await a(async()=>{const{desktopSvg:t}=await import("./desktop-eCZzccH2.js");return{desktopSvg:t}},__vite__mapDeps([27,1]))).desktopSvg,disconnect:async()=>(await a(async()=>{const{disconnectSvg:t}=await import("./disconnect-Q7xfDeFt.js");return{disconnectSvg:t}},__vite__mapDeps([28,1]))).disconnectSvg,discord:async()=>(await a(async()=>{const{discordSvg:t}=await import("./discord-B-7sgnLv.js");return{discordSvg:t}},__vite__mapDeps([29,1]))).discordSvg,etherscan:async()=>(await a(async()=>{const{etherscanSvg:t}=await import("./etherscan-Dkv2TfA9.js");return{etherscanSvg:t}},__vite__mapDeps([30,1]))).etherscanSvg,extension:async()=>(await a(async()=>{const{extensionSvg:t}=await import("./extension-B3BpTyTu.js");return{extensionSvg:t}},__vite__mapDeps([31,1]))).extensionSvg,externalLink:async()=>(await a(async()=>{const{externalLinkSvg:t}=await import("./external-link-DC4M5Di-.js");return{externalLinkSvg:t}},__vite__mapDeps([32,1]))).externalLinkSvg,facebook:async()=>(await a(async()=>{const{facebookSvg:t}=await import("./facebook-Bs-YWcYD.js");return{facebookSvg:t}},__vite__mapDeps([33,1]))).facebookSvg,farcaster:async()=>(await a(async()=>{const{farcasterSvg:t}=await import("./farcaster-CHhgVizr.js");return{farcasterSvg:t}},__vite__mapDeps([34,1]))).farcasterSvg,filters:async()=>(await a(async()=>{const{filtersSvg:t}=await import("./filters-BBhfeKwN.js");return{filtersSvg:t}},__vite__mapDeps([35,1]))).filtersSvg,github:async()=>(await a(async()=>{const{githubSvg:t}=await import("./github-9BG155_k.js");return{githubSvg:t}},__vite__mapDeps([36,1]))).githubSvg,google:async()=>(await a(async()=>{const{googleSvg:t}=await import("./google-Cx5iBauX.js");return{googleSvg:t}},__vite__mapDeps([37,1]))).googleSvg,helpCircle:async()=>(await a(async()=>{const{helpCircleSvg:t}=await import("./help-circle-CF_lqSeI.js");return{helpCircleSvg:t}},__vite__mapDeps([38,1]))).helpCircleSvg,image:async()=>(await a(async()=>{const{imageSvg:t}=await import("./image-B81_zvs8.js");return{imageSvg:t}},__vite__mapDeps([39,1]))).imageSvg,id:async()=>(await a(async()=>{const{idSvg:t}=await import("./id-BsqOiEWG.js");return{idSvg:t}},__vite__mapDeps([40,1]))).idSvg,infoCircle:async()=>(await a(async()=>{const{infoCircleSvg:t}=await import("./info-circle-fL3Oz0bg.js");return{infoCircleSvg:t}},__vite__mapDeps([41,1]))).infoCircleSvg,lightbulb:async()=>(await a(async()=>{const{lightbulbSvg:t}=await import("./lightbulb-BRRTqlYp.js");return{lightbulbSvg:t}},__vite__mapDeps([42,1]))).lightbulbSvg,mail:async()=>(await a(async()=>{const{mailSvg:t}=await import("./mail-BSGL0GV8.js");return{mailSvg:t}},__vite__mapDeps([43,1]))).mailSvg,mobile:async()=>(await a(async()=>{const{mobileSvg:t}=await import("./mobile-B6S7v3_W.js");return{mobileSvg:t}},__vite__mapDeps([44,1]))).mobileSvg,more:async()=>(await a(async()=>{const{moreSvg:t}=await import("./more-BA-vbw1c.js");return{moreSvg:t}},__vite__mapDeps([45,1]))).moreSvg,networkPlaceholder:async()=>(await a(async()=>{const{networkPlaceholderSvg:t}=await import("./network-placeholder-C-Mr_xqB.js");return{networkPlaceholderSvg:t}},__vite__mapDeps([46,1]))).networkPlaceholderSvg,nftPlaceholder:async()=>(await a(async()=>{const{nftPlaceholderSvg:t}=await import("./nftPlaceholder-Dn4CTyhz.js");return{nftPlaceholderSvg:t}},__vite__mapDeps([47,1]))).nftPlaceholderSvg,off:async()=>(await a(async()=>{const{offSvg:t}=await import("./off-801rGEDP.js");return{offSvg:t}},__vite__mapDeps([48,1]))).offSvg,playStore:async()=>(await a(async()=>{const{playStoreSvg:t}=await import("./play-store-hw_OKIYl.js");return{playStoreSvg:t}},__vite__mapDeps([49,1]))).playStoreSvg,plus:async()=>(await a(async()=>{const{plusSvg:t}=await import("./plus-BbSAngb3.js");return{plusSvg:t}},__vite__mapDeps([50,1]))).plusSvg,qrCode:async()=>(await a(async()=>{const{qrCodeIcon:t}=await import("./qr-code-B5M3asEQ.js");return{qrCodeIcon:t}},__vite__mapDeps([51,1]))).qrCodeIcon,recycleHorizontal:async()=>(await a(async()=>{const{recycleHorizontalSvg:t}=await import("./recycle-horizontal-piy_iuv_.js");return{recycleHorizontalSvg:t}},__vite__mapDeps([52,1]))).recycleHorizontalSvg,refresh:async()=>(await a(async()=>{const{refreshSvg:t}=await import("./refresh-Dw9OnAkT.js");return{refreshSvg:t}},__vite__mapDeps([53,1]))).refreshSvg,search:async()=>(await a(async()=>{const{searchSvg:t}=await import("./search-CnPLTxEm.js");return{searchSvg:t}},__vite__mapDeps([54,1]))).searchSvg,send:async()=>(await a(async()=>{const{sendSvg:t}=await import("./send-B21aVPL5.js");return{sendSvg:t}},__vite__mapDeps([55,1]))).sendSvg,swapHorizontal:async()=>(await a(async()=>{const{swapHorizontalSvg:t}=await import("./swapHorizontal-BM-T50i4.js");return{swapHorizontalSvg:t}},__vite__mapDeps([56,1]))).swapHorizontalSvg,swapHorizontalMedium:async()=>(await a(async()=>{const{swapHorizontalMediumSvg:t}=await import("./swapHorizontalMedium-BEgHifLN.js");return{swapHorizontalMediumSvg:t}},__vite__mapDeps([57,1]))).swapHorizontalMediumSvg,swapHorizontalBold:async()=>(await a(async()=>{const{swapHorizontalBoldSvg:t}=await import("./swapHorizontalBold-DABF0bOM.js");return{swapHorizontalBoldSvg:t}},__vite__mapDeps([58,1]))).swapHorizontalBoldSvg,swapHorizontalRoundedBold:async()=>(await a(async()=>{const{swapHorizontalRoundedBoldSvg:t}=await import("./swapHorizontalRoundedBold-HlsSQEA0.js");return{swapHorizontalRoundedBoldSvg:t}},__vite__mapDeps([59,1]))).swapHorizontalRoundedBoldSvg,swapVertical:async()=>(await a(async()=>{const{swapVerticalSvg:t}=await import("./swapVertical-Bpn-6wvh.js");return{swapVerticalSvg:t}},__vite__mapDeps([60,1]))).swapVerticalSvg,telegram:async()=>(await a(async()=>{const{telegramSvg:t}=await import("./telegram-B1m9xJCi.js");return{telegramSvg:t}},__vite__mapDeps([61,1]))).telegramSvg,threeDots:async()=>(await a(async()=>{const{threeDotsSvg:t}=await import("./three-dots-rtsRe3ML.js");return{threeDotsSvg:t}},__vite__mapDeps([62,1]))).threeDotsSvg,twitch:async()=>(await a(async()=>{const{twitchSvg:t}=await import("./twitch-B3VHs-Lf.js");return{twitchSvg:t}},__vite__mapDeps([63,1]))).twitchSvg,twitter:async()=>(await a(async()=>{const{xSvg:t}=await import("./x-DtuGJ6nQ.js");return{xSvg:t}},__vite__mapDeps([64,1]))).xSvg,twitterIcon:async()=>(await a(async()=>{const{twitterIconSvg:t}=await import("./twitterIcon-D8SpeRQH.js");return{twitterIconSvg:t}},__vite__mapDeps([65,1]))).twitterIconSvg,verify:async()=>(await a(async()=>{const{verifySvg:t}=await import("./verify-BDDPX8Ut.js");return{verifySvg:t}},__vite__mapDeps([66,1]))).verifySvg,verifyFilled:async()=>(await a(async()=>{const{verifyFilledSvg:t}=await import("./verify-filled-CupqANt3.js");return{verifyFilledSvg:t}},__vite__mapDeps([67,1]))).verifyFilledSvg,wallet:async()=>(await a(async()=>{const{walletSvg:t}=await import("./wallet-geXl8zAA.js");return{walletSvg:t}},__vite__mapDeps([68,1]))).walletSvg,walletConnect:async()=>(await a(async()=>{const{walletConnectSvg:t}=await import("./walletconnect-CiVMhwbT.js");return{walletConnectSvg:t}},__vite__mapDeps([69,1]))).walletConnectSvg,walletConnectLightBrown:async()=>(await a(async()=>{const{walletConnectLightBrownSvg:t}=await import("./walletconnect-CiVMhwbT.js");return{walletConnectLightBrownSvg:t}},__vite__mapDeps([69,1]))).walletConnectLightBrownSvg,walletConnectBrown:async()=>(await a(async()=>{const{walletConnectBrownSvg:t}=await import("./walletconnect-CiVMhwbT.js");return{walletConnectBrownSvg:t}},__vite__mapDeps([69,1]))).walletConnectBrownSvg,walletPlaceholder:async()=>(await a(async()=>{const{walletPlaceholderSvg:t}=await import("./wallet-placeholder-DMH0fJAi.js");return{walletPlaceholderSvg:t}},__vite__mapDeps([70,1]))).walletPlaceholderSvg,warningCircle:async()=>(await a(async()=>{const{warningCircleSvg:t}=await import("./warning-circle-c6XoWpAw.js");return{warningCircleSvg:t}},__vite__mapDeps([71,1]))).warningCircleSvg,x:async()=>(await a(async()=>{const{xSvg:t}=await import("./x-DtuGJ6nQ.js");return{xSvg:t}},__vite__mapDeps([64,1]))).xSvg,info:async()=>(await a(async()=>{const{infoSvg:t}=await import("./info-e7rerry5.js");return{infoSvg:t}},__vite__mapDeps([72,1]))).infoSvg,exclamationTriangle:async()=>(await a(async()=>{const{exclamationTriangleSvg:t}=await import("./exclamation-triangle-Be20DUYp.js");return{exclamationTriangleSvg:t}},__vite__mapDeps([73,1]))).exclamationTriangleSvg,reown:async()=>(await a(async()=>{const{reownSvg:t}=await import("./reown-logo-CyGgDbCm.js");return{reownSvg:t}},__vite__mapDeps([74,1]))).reownSvg};async function ht(t){if(D.has(t))return D.get(t);const i=(M[t]??M.copy)();return D.set(t,i),i}let m=class extends b{constructor(){super(...arguments),this.size="md",this.name="copy",this.color="fg-300",this.aspectRatio="1 / 1"}render(){return this.style.cssText=`
      --local-color: ${`var(--wui-color-${this.color});`}
      --local-width: ${`var(--wui-icon-size-${this.size});`}
      --local-aspect-ratio: ${this.aspectRatio}
    `,f`${st(ht(this.name),f`<div class="fallback"></div>`)}`}};m.styles=[E,H,_t];A([l()],m.prototype,"size",void 0);A([l()],m.prototype,"name",void 0);A([l()],m.prototype,"color",void 0);A([l()],m.prototype,"aspectRatio",void 0);m=A([$("wui-icon")],m);const pt=S`
  :host {
    display: inline-flex !important;
  }

  slot {
    width: 100%;
    display: inline-block;
    font-style: normal;
    font-family: var(--wui-font-family);
    font-feature-settings:
      'tnum' on,
      'lnum' on,
      'case' on;
    line-height: 130%;
    font-weight: var(--wui-font-weight-regular);
    overflow: inherit;
    text-overflow: inherit;
    text-align: var(--local-align);
    color: var(--local-color);
  }

  .wui-line-clamp-1 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }

  .wui-line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .wui-font-medium-400 {
    font-size: var(--wui-font-size-medium);
    font-weight: var(--wui-font-weight-light);
    letter-spacing: var(--wui-letter-spacing-medium);
  }

  .wui-font-medium-600 {
    font-size: var(--wui-font-size-medium);
    letter-spacing: var(--wui-letter-spacing-medium);
  }

  .wui-font-title-600 {
    font-size: var(--wui-font-size-title);
    letter-spacing: var(--wui-letter-spacing-title);
  }

  .wui-font-title-6-600 {
    font-size: var(--wui-font-size-title-6);
    letter-spacing: var(--wui-letter-spacing-title-6);
  }

  .wui-font-mini-700 {
    font-size: var(--wui-font-size-mini);
    letter-spacing: var(--wui-letter-spacing-mini);
    text-transform: uppercase;
  }

  .wui-font-large-500,
  .wui-font-large-600,
  .wui-font-large-700 {
    font-size: var(--wui-font-size-large);
    letter-spacing: var(--wui-letter-spacing-large);
  }

  .wui-font-2xl-500,
  .wui-font-2xl-600,
  .wui-font-2xl-700 {
    font-size: var(--wui-font-size-2xl);
    letter-spacing: var(--wui-letter-spacing-2xl);
  }

  .wui-font-paragraph-400,
  .wui-font-paragraph-500,
  .wui-font-paragraph-600,
  .wui-font-paragraph-700 {
    font-size: var(--wui-font-size-paragraph);
    letter-spacing: var(--wui-letter-spacing-paragraph);
  }

  .wui-font-small-400,
  .wui-font-small-500,
  .wui-font-small-600 {
    font-size: var(--wui-font-size-small);
    letter-spacing: var(--wui-letter-spacing-small);
  }

  .wui-font-tiny-400,
  .wui-font-tiny-500,
  .wui-font-tiny-600 {
    font-size: var(--wui-font-size-tiny);
    letter-spacing: var(--wui-letter-spacing-tiny);
  }

  .wui-font-micro-700,
  .wui-font-micro-600 {
    font-size: var(--wui-font-size-micro);
    letter-spacing: var(--wui-letter-spacing-micro);
    text-transform: uppercase;
  }

  .wui-font-tiny-400,
  .wui-font-small-400,
  .wui-font-medium-400,
  .wui-font-paragraph-400 {
    font-weight: var(--wui-font-weight-light);
  }

  .wui-font-large-700,
  .wui-font-paragraph-700,
  .wui-font-micro-700,
  .wui-font-mini-700 {
    font-weight: var(--wui-font-weight-bold);
  }

  .wui-font-medium-600,
  .wui-font-medium-title-600,
  .wui-font-title-6-600,
  .wui-font-large-600,
  .wui-font-paragraph-600,
  .wui-font-small-600,
  .wui-font-tiny-600,
  .wui-font-micro-600 {
    font-weight: var(--wui-font-weight-medium);
  }

  :host([disabled]) {
    opacity: 0.4;
  }
`;var O=function(t,e,i,o){var n=arguments.length,r=n<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(t,e,i,o);else for(var c=t.length-1;c>=0;c--)(s=t[c])&&(r=(n<3?s(r):n>3?s(e,i,r):s(e,i))||r);return n>3&&r&&Object.defineProperty(e,i,r),r};let y=class extends b{constructor(){super(...arguments),this.variant="paragraph-500",this.color="fg-300",this.align="left",this.lineClamp=void 0}render(){const e={[`wui-font-${this.variant}`]:!0,[`wui-color-${this.color}`]:!0,[`wui-line-clamp-${this.lineClamp}`]:!!this.lineClamp};return this.style.cssText=`
      --local-align: ${this.align};
      --local-color: var(--wui-color-${this.color});
    `,f`<slot class=${ct(e)}></slot>`}};y.styles=[E,pt];O([l()],y.prototype,"variant",void 0);O([l()],y.prototype,"color",void 0);O([l()],y.prototype,"align",void 0);O([l()],y.prototype,"lineClamp",void 0);y=O([$("wui-text")],y);const vt=S`
  :host {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
    background-color: var(--wui-color-gray-glass-020);
    border-radius: var(--local-border-radius);
    border: var(--local-border);
    box-sizing: content-box;
    width: var(--local-size);
    height: var(--local-size);
    min-height: var(--local-size);
    min-width: var(--local-size);
  }

  @supports (background: color-mix(in srgb, white 50%, black)) {
    :host {
      background-color: color-mix(in srgb, var(--local-bg-value) var(--local-bg-mix), transparent);
    }
  }
`;var v=function(t,e,i,o){var n=arguments.length,r=n<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(t,e,i,o);else for(var c=t.length-1;c>=0;c--)(s=t[c])&&(r=(n<3?s(r):n>3?s(e,i,r):s(e,i))||r);return n>3&&r&&Object.defineProperty(e,i,r),r};let _=class extends b{constructor(){super(...arguments),this.size="md",this.backgroundColor="accent-100",this.iconColor="accent-100",this.background="transparent",this.border=!1,this.borderColor="wui-color-bg-125",this.icon="copy"}render(){const e=this.iconSize||this.size,i=this.size==="lg",o=this.size==="xl",n=i?"12%":"16%",r=i?"xxs":o?"s":"3xl",s=this.background==="gray",c=this.background==="opaque",u=this.backgroundColor==="accent-100"&&c||this.backgroundColor==="success-100"&&c||this.backgroundColor==="error-100"&&c||this.backgroundColor==="inverse-100"&&c;let h=`var(--wui-color-${this.backgroundColor})`;return u?h=`var(--wui-icon-box-bg-${this.backgroundColor})`:s&&(h=`var(--wui-color-gray-${this.backgroundColor})`),this.style.cssText=`
       --local-bg-value: ${h};
       --local-bg-mix: ${u||s?"100%":n};
       --local-border-radius: var(--wui-border-radius-${r});
       --local-size: var(--wui-icon-box-size-${this.size});
       --local-border: ${this.borderColor==="wui-color-bg-125"?"2px":"1px"} solid ${this.border?`var(--${this.borderColor})`:"transparent"}
   `,f` <wui-icon color=${this.iconColor} size=${e} name=${this.icon}></wui-icon> `}};_.styles=[E,X,vt];v([l()],_.prototype,"size",void 0);v([l()],_.prototype,"backgroundColor",void 0);v([l()],_.prototype,"iconColor",void 0);v([l()],_.prototype,"iconSize",void 0);v([l()],_.prototype,"background",void 0);v([l({type:Boolean})],_.prototype,"border",void 0);v([l()],_.prototype,"borderColor",void 0);v([l()],_.prototype,"icon",void 0);_=v([$("wui-icon-box")],_);const wt=S`
  :host {
    display: block;
    width: var(--local-width);
    height: var(--local-height);
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
    border-radius: inherit;
  }
`;var L=function(t,e,i,o){var n=arguments.length,r=n<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(t,e,i,o);else for(var c=t.length-1;c>=0;c--)(s=t[c])&&(r=(n<3?s(r):n>3?s(e,i,r):s(e,i))||r);return n>3&&r&&Object.defineProperty(e,i,r),r};let x=class extends b{constructor(){super(...arguments),this.src="./path/to/image.jpg",this.alt="Image",this.size=void 0}render(){return this.style.cssText=`
      --local-width: ${this.size?`var(--wui-icon-size-${this.size});`:"100%"};
      --local-height: ${this.size?`var(--wui-icon-size-${this.size});`:"100%"};
      `,f`<img src=${this.src} alt=${this.alt} @error=${this.handleImageError} />`}handleImageError(){this.dispatchEvent(new CustomEvent("onLoadError",{bubbles:!0,composed:!0}))}};x.styles=[E,H,wt];L([l()],x.prototype,"src",void 0);L([l()],x.prototype,"alt",void 0);L([l()],x.prototype,"size",void 0);x=L([$("wui-image")],x);const ft=S`
  :host {
    display: flex;
    justify-content: center;
    align-items: center;
    height: var(--wui-spacing-m);
    padding: 0 var(--wui-spacing-3xs) !important;
    border-radius: var(--wui-border-radius-5xs);
    transition:
      border-radius var(--wui-duration-lg) var(--wui-ease-out-power-1),
      background-color var(--wui-duration-lg) var(--wui-ease-out-power-1);
    will-change: border-radius, background-color;
  }

  :host > wui-text {
    transform: translateY(5%);
  }

  :host([data-variant='main']) {
    background-color: var(--wui-color-accent-glass-015);
    color: var(--wui-color-accent-100);
  }

  :host([data-variant='shade']) {
    background-color: var(--wui-color-gray-glass-010);
    color: var(--wui-color-fg-200);
  }

  :host([data-variant='success']) {
    background-color: var(--wui-icon-box-bg-success-100);
    color: var(--wui-color-success-100);
  }

  :host([data-variant='error']) {
    background-color: var(--wui-icon-box-bg-error-100);
    color: var(--wui-color-error-100);
  }

  :host([data-size='lg']) {
    padding: 11px 5px !important;
  }

  :host([data-size='lg']) > wui-text {
    transform: translateY(2%);
  }
`;var z=function(t,e,i,o){var n=arguments.length,r=n<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(t,e,i,o);else for(var c=t.length-1;c>=0;c--)(s=t[c])&&(r=(n<3?s(r):n>3?s(e,i,r):s(e,i))||r);return n>3&&r&&Object.defineProperty(e,i,r),r};let R=class extends b{constructor(){super(...arguments),this.variant="main",this.size="lg"}render(){this.dataset.variant=this.variant,this.dataset.size=this.size;const e=this.size==="md"?"mini-700":"micro-700";return f`
      <wui-text data-variant=${this.variant} variant=${e} color="inherit">
        <slot></slot>
      </wui-text>
    `}};R.styles=[E,ft];z([l()],R.prototype,"variant",void 0);z([l()],R.prototype,"size",void 0);R=z([$("wui-tag")],R);const mt=S`
  :host {
    display: flex;
  }

  :host([data-size='sm']) > svg {
    width: 12px;
    height: 12px;
  }

  :host([data-size='md']) > svg {
    width: 16px;
    height: 16px;
  }

  :host([data-size='lg']) > svg {
    width: 24px;
    height: 24px;
  }

  :host([data-size='xl']) > svg {
    width: 32px;
    height: 32px;
  }

  svg {
    animation: rotate 2s linear infinite;
  }

  circle {
    fill: none;
    stroke: var(--local-color);
    stroke-width: 4px;
    stroke-dasharray: 1, 124;
    stroke-dashoffset: 0;
    stroke-linecap: round;
    animation: dash 1.5s ease-in-out infinite;
  }

  :host([data-size='md']) > svg > circle {
    stroke-width: 6px;
  }

  :host([data-size='sm']) > svg > circle {
    stroke-width: 8px;
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes dash {
    0% {
      stroke-dasharray: 1, 124;
      stroke-dashoffset: 0;
    }

    50% {
      stroke-dasharray: 90, 124;
      stroke-dashoffset: -35;
    }

    100% {
      stroke-dashoffset: -125;
    }
  }
`;var k=function(t,e,i,o){var n=arguments.length,r=n<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(t,e,i,o);else for(var c=t.length-1;c>=0;c--)(s=t[c])&&(r=(n<3?s(r):n>3?s(e,i,r):s(e,i))||r);return n>3&&r&&Object.defineProperty(e,i,r),r};let P=class extends b{constructor(){super(...arguments),this.color="accent-100",this.size="lg"}render(){return this.style.cssText=`--local-color: ${this.color==="inherit"?"inherit":`var(--wui-color-${this.color})`}`,this.dataset.size=this.size,f`<svg viewBox="25 25 50 50">
      <circle r="20" cy="50" cx="50"></circle>
    </svg>`}};P.styles=[E,mt];k([l()],P.prototype,"color",void 0);k([l()],P.prototype,"size",void 0);P=k([$("wui-loading-spinner")],P);export{w as U,ct as a,$ as c,U as e,rt as f,l as n,Et as o,bt as r};

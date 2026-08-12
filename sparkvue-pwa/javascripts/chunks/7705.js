"use strict";(self.webpackChunksparkvue=self.webpackChunksparkvue||[]).push([[7705],{45584:(e,t,i)=>{i.d(t,{D:()=>H,b:()=>I});var r=i(95650),o=i(57218),a=i(5885),n=i(4731),s=i(99163),l=i(90511),c=i(91636),d=i(40433),u=i(82082),h=i(6502),p=i(11478),m=i(5664),f=i(97675),v=i(6665),g=i(3417),x=i(30786),b=i(54207),_=i(73393),T=i(2833),y=i(89585),w=i(3864),S=i(20105),M=i(12664),C=i(41272),A=i(78115),P=i(10938),O=i(23410),F=i(3961);function I(e){const t=new F.kG,i=t.vertex.code,I=t.fragment.code;return t.include(A.a,{name:"Default Material Shader",output:e.output}),t.vertex.uniforms.add("proj","mat4").add("view","mat4").add("camPos","vec3").add("localOrigin","vec3"),t.include(c.f),t.varyings.add("vpos","vec3"),t.include(M.kl,e),t.include(s.f,e),t.include(m.LC,e),0!==e.output&&7!==e.output||(t.include(l.O,e),t.include(n.w,{linearDepth:!1}),0===e.normalType&&e.offsetBackfaces&&t.include(o.w),t.include(g.Q,e),t.include(p.B,e),e.instancedColor&&t.attributes.add("instanceColor","vec4"),t.varyings.add("localvpos","vec3"),t.include(u.D,e),t.include(r.q,e),t.include(d.R,e),t.include(h.c,e),t.vertex.uniforms.add("externalColor","vec4"),t.varyings.add("vcolorExt","vec4"),e.multipassTerrainEnabled&&t.varyings.add("depth","float"),i.add(O.H`
      void main(void) {
        forwardNormalizedVertexColor();
        vcolorExt = externalColor;
        ${e.instancedColor?"vcolorExt *= instanceColor;":""}
        vcolorExt *= vvColor();
        vcolorExt *= getSymbolColor();
        forwardColorMixMode();

        if (vcolorExt.a < ${O.H.float(C.bf)}) {
          gl_Position = vec4(1e38, 1e38, 1e38, 1.0);
        }
        else {
          vpos = calculateVPos();
          localvpos = vpos - view[3].xyz;
          vpos = subtractOrigin(vpos);
          ${0===e.normalType?O.H`
          vNormalWorld = dpNormal(vvLocalNormal(normalModel()));`:""}
          vpos = addVerticalOffset(vpos, localOrigin);
          ${e.vertexTangents?"vTangent = dpTransformVertexTangent(tangent);":""}
          gl_Position = transformPosition(proj, view, vpos);
          ${0===e.normalType&&e.offsetBackfaces?"gl_Position = offsetBackfacingClipPosition(gl_Position, vpos, vNormalWorld, camPos);":""}
        }

        ${e.multipassTerrainEnabled?"depth = (view * vec4(vpos, 1.0)).z;":""}
        forwardLinearDepth();
        forwardTextureCoordinates();
      }
    `)),7===e.output&&(t.include(a.p2,e),t.include(C.sj,e),e.multipassTerrainEnabled&&(t.fragment.include(v.S),t.include(_.l,e)),t.fragment.uniforms.add("camPos","vec3").add("localOrigin","vec3").add("opacity","float").add("layerOpacity","float"),e.hasColorTexture&&t.fragment.uniforms.add("tex","sampler2D"),t.fragment.include(P.y),I.add(O.H`
      void main() {
        discardBySlice(vpos);
        ${e.multipassTerrainEnabled?"terrainDepthTest(gl_FragCoord, depth);":""}
        ${e.hasColorTexture?O.H`
        vec4 texColor = texture2D(tex, vuv0);
        ${e.textureAlphaPremultiplied?"texColor.rgb /= texColor.a;":""}
        discardOrAdjustAlpha(texColor);`:O.H`vec4 texColor = vec4(1.0);`}
        ${e.attributeColor?O.H`
        float opacity_ = layerOpacity * mixExternalOpacity(vColor.a * opacity, texColor.a, vcolorExt.a, int(colorMixMode));`:O.H`
        float opacity_ = layerOpacity * mixExternalOpacity(opacity, texColor.a, vcolorExt.a, int(colorMixMode));
        `}
        gl_FragColor = vec4(opacity_);
      }
    `)),0===e.output&&(t.include(a.p2,e),t.include(b.X,e),t.include(x.K,e),t.include(C.sj,e),e.receiveShadows&&t.include(S.hX,e),e.multipassTerrainEnabled&&(t.fragment.include(v.S),t.include(_.l,e)),t.fragment.uniforms.add("camPos","vec3").add("localOrigin","vec3").add("ambient","vec3").add("diffuse","vec3").add("opacity","float").add("layerOpacity","float"),e.hasColorTexture&&t.fragment.uniforms.add("tex","sampler2D"),t.include(w.jV,e),t.include(y.T,e),t.fragment.include(P.y),t.include(T.k,e),I.add(O.H`
      void main() {
        discardBySlice(vpos);
        ${e.multipassTerrainEnabled?"terrainDepthTest(gl_FragCoord, depth);":""}
        ${e.hasColorTexture?O.H`
        vec4 texColor = texture2D(tex, vuv0);
        ${e.textureAlphaPremultiplied?"texColor.rgb /= texColor.a;":""}
        discardOrAdjustAlpha(texColor);`:O.H`vec4 texColor = vec4(1.0);`}
        shadingParams.viewDirection = normalize(vpos - camPos);
        ${3===e.normalType?O.H`
        vec3 normal = screenDerivativeNormal(localvpos);`:O.H`
        shadingParams.normalView = vNormalWorld;
        vec3 normal = shadingNormal(shadingParams);`}
        ${1===e.pbrMode?"applyPBRFactors();":""}
        float ssao = evaluateAmbientOcclusionInverse();
        ssao *= getBakedOcclusion();

        float additionalAmbientScale = additionalDirectedAmbientLight(vpos + localOrigin);
        vec3 additionalLight = ssao * lightingMainIntensity * additionalAmbientScale * ambientBoostFactor * lightingGlobalFactor;
        ${e.receiveShadows?"float shadow = readShadowMap(vpos, linearDepth);":1===e.viewingMode?"float shadow = lightingGlobalFactor * (1.0 - additionalAmbientScale);":"float shadow = 0.0;"}
        vec3 matColor = max(ambient, diffuse);
        ${e.attributeColor?O.H`
        vec3 albedo_ = mixExternalColor(vColor.rgb * matColor, texColor.rgb, vcolorExt.rgb, int(colorMixMode));
        float opacity_ = layerOpacity * mixExternalOpacity(vColor.a * opacity, texColor.a, vcolorExt.a, int(colorMixMode));`:O.H`
        vec3 albedo_ = mixExternalColor(matColor, texColor.rgb, vcolorExt.rgb, int(colorMixMode));
        float opacity_ = layerOpacity * mixExternalOpacity(opacity, texColor.a, vcolorExt.a, int(colorMixMode));
        `}
        ${e.hasNormalTexture?O.H`
              mat3 tangentSpace = ${e.vertexTangents?"computeTangentSpace(normal);":"computeTangentSpace(normal, vpos, vuv0);"}
              vec3 shadedNormal = computeTextureNormal(tangentSpace, vuv0);`:"vec3 shadedNormal = normal;"}
        ${1===e.pbrMode||2===e.pbrMode?1===e.viewingMode?O.H`vec3 normalGround = normalize(vpos + localOrigin);`:O.H`vec3 normalGround = vec3(0.0, 0.0, 1.0);`:O.H``}
        ${1===e.pbrMode||2===e.pbrMode?O.H`
            float additionalAmbientIrradiance = additionalAmbientIrradianceFactor * lightingMainIntensity[2];
            vec3 shadedColor = evaluateSceneLightingPBR(shadedNormal, albedo_, shadow, 1.0 - ssao, additionalLight, shadingParams.viewDirection, normalGround, mrr, emission, additionalAmbientIrradiance);`:"vec3 shadedColor = evaluateSceneLighting(shadedNormal, albedo_, shadow, 1.0 - ssao, additionalLight);"}
        gl_FragColor = highlightSlice(vec4(shadedColor, opacity_), vpos);
        ${e.OITEnabled?"gl_FragColor = premultiplyAlpha(gl_FragColor);":""}
      }
    `)),t.include(f.s,e),t}const H=Object.freeze({__proto__:null,build:I})},60926:(e,t,i)=>{i.d(t,{R:()=>P,b:()=>A});var r=i(95650),o=i(57218),a=i(5885),n=i(4731),s=i(99163),l=i(90511),c=i(91636),d=i(40433),u=i(82082),h=i(6502),p=i(5664),m=i(97675),f=i(6665),v=i(30786),g=i(54207),x=i(73393),b=i(89585),_=i(3864),T=i(20105),y=i(12664),w=i(41272),S=i(10938),M=i(23410),C=i(3961);function A(e){const t=new C.kG,i=t.vertex.code,A=t.fragment.code;return t.vertex.uniforms.add("proj","mat4").add("view","mat4").add("camPos","vec3").add("localOrigin","vec3"),t.include(c.f),t.varyings.add("vpos","vec3"),t.include(y.kl,e),t.include(s.f,e),t.include(p.LC,e),0!==e.output&&7!==e.output||(t.include(l.O,e),t.include(n.w,{linearDepth:!1}),e.offsetBackfaces&&t.include(o.w),e.instancedColor&&t.attributes.add("instanceColor","vec4"),t.varyings.add("vNormalWorld","vec3"),t.varyings.add("localvpos","vec3"),e.multipassTerrainEnabled&&t.varyings.add("depth","float"),t.include(u.D,e),t.include(r.q,e),t.include(d.R,e),t.include(h.c,e),t.vertex.uniforms.add("externalColor","vec4"),t.varyings.add("vcolorExt","vec4"),i.add(M.H`
        void main(void) {
          forwardNormalizedVertexColor();
          vcolorExt = externalColor;
          ${e.instancedColor?"vcolorExt *= instanceColor;":""}
          vcolorExt *= vvColor();
          vcolorExt *= getSymbolColor();
          forwardColorMixMode();

          if (vcolorExt.a < ${M.H.float(w.bf)}) {
            gl_Position = vec4(1e38, 1e38, 1e38, 1.0);
          }
          else {
            vpos = calculateVPos();
            localvpos = vpos - view[3].xyz;
            vpos = subtractOrigin(vpos);
            vNormalWorld = dpNormal(vvLocalNormal(normalModel()));
            vpos = addVerticalOffset(vpos, localOrigin);
            gl_Position = transformPosition(proj, view, vpos);
            ${e.offsetBackfaces?"gl_Position = offsetBackfacingClipPosition(gl_Position, vpos, vNormalWorld, camPos);":""}
          }
          ${e.multipassTerrainEnabled?M.H`depth = (view * vec4(vpos, 1.0)).z;`:""}
          forwardLinearDepth();
          forwardTextureCoordinates();
        }
      `)),7===e.output&&(t.include(a.p2,e),t.include(w.sj,e),e.multipassTerrainEnabled&&(t.fragment.include(f.S),t.include(x.l,e)),t.fragment.uniforms.add("camPos","vec3").add("localOrigin","vec3").add("opacity","float").add("layerOpacity","float"),t.fragment.uniforms.add("view","mat4"),e.hasColorTexture&&t.fragment.uniforms.add("tex","sampler2D"),t.fragment.include(S.y),A.add(M.H`
      void main() {
        discardBySlice(vpos);
        ${e.multipassTerrainEnabled?M.H`terrainDepthTest(gl_FragCoord, depth);`:""}
        ${e.hasColorTexture?M.H`
        vec4 texColor = texture2D(tex, vuv0);
        ${e.textureAlphaPremultiplied?"texColor.rgb /= texColor.a;":""}
        discardOrAdjustAlpha(texColor);`:M.H`vec4 texColor = vec4(1.0);`}
        ${e.attributeColor?M.H`
        float opacity_ = layerOpacity * mixExternalOpacity(vColor.a * opacity, texColor.a, vcolorExt.a, int(colorMixMode));`:M.H`
        float opacity_ = layerOpacity * mixExternalOpacity(opacity, texColor.a, vcolorExt.a, int(colorMixMode));
        `}

        gl_FragColor = vec4(opacity_);
      }
    `)),0===e.output&&(t.include(a.p2,e),t.include(g.X,e),t.include(v.K,e),t.include(w.sj,e),e.receiveShadows&&t.include(T.hX,e),e.multipassTerrainEnabled&&(t.fragment.include(f.S),t.include(x.l,e)),t.fragment.uniforms.add("camPos","vec3").add("localOrigin","vec3").add("ambient","vec3").add("diffuse","vec3").add("opacity","float").add("layerOpacity","float"),t.fragment.uniforms.add("view","mat4"),e.hasColorTexture&&t.fragment.uniforms.add("tex","sampler2D"),t.include(_.jV,e),t.include(b.T,e),t.fragment.include(S.y),A.add(M.H`
      void main() {
        discardBySlice(vpos);
        ${e.multipassTerrainEnabled?M.H`terrainDepthTest(gl_FragCoord, depth);`:""}
        ${e.hasColorTexture?M.H`
        vec4 texColor = texture2D(tex, vuv0);
        ${e.textureAlphaPremultiplied?"texColor.rgb /= texColor.a;":""}
        discardOrAdjustAlpha(texColor);`:M.H`vec4 texColor = vec4(1.0);`}
        vec3 viewDirection = normalize(vpos - camPos);
        ${1===e.pbrMode?"applyPBRFactors();":""}
        float ssao = evaluateAmbientOcclusionInverse();
        ssao *= getBakedOcclusion();

        float additionalAmbientScale = additionalDirectedAmbientLight(vpos + localOrigin);
        vec3 additionalLight = ssao * lightingMainIntensity * additionalAmbientScale * ambientBoostFactor * lightingGlobalFactor;
        ${e.receiveShadows?"float shadow = readShadowMap(vpos, linearDepth);":1===e.viewingMode?"float shadow = lightingGlobalFactor * (1.0 - additionalAmbientScale);":"float shadow = 0.0;"}
        vec3 matColor = max(ambient, diffuse);
        ${e.attributeColor?M.H`
        vec3 albedo_ = mixExternalColor(vColor.rgb * matColor, texColor.rgb, vcolorExt.rgb, int(colorMixMode));
        float opacity_ = layerOpacity * mixExternalOpacity(vColor.a * opacity, texColor.a, vcolorExt.a, int(colorMixMode));`:M.H`
        vec3 albedo_ = mixExternalColor(matColor, texColor.rgb, vcolorExt.rgb, int(colorMixMode));
        float opacity_ = layerOpacity * mixExternalOpacity(opacity, texColor.a, vcolorExt.a, int(colorMixMode));
        `}
        ${M.H`
        vec3 shadedNormal = normalize(vNormalWorld);
        albedo_ *= 1.2;
        vec3 viewForward = vec3(view[0][2], view[1][2], view[2][2]);
        float alignmentLightView = clamp(dot(viewForward, -lightingMainDirection), 0.0, 1.0);
        float transmittance = 1.0 - clamp(dot(viewForward, shadedNormal), 0.0, 1.0);
        float treeRadialFalloff = vColor.r;
        float backLightFactor = 0.5 * treeRadialFalloff * alignmentLightView * transmittance * (1.0 - shadow);
        additionalLight += backLightFactor * lightingMainIntensity;`}
        ${1===e.pbrMode||2===e.pbrMode?1===e.viewingMode?M.H`vec3 normalGround = normalize(vpos + localOrigin);`:M.H`vec3 normalGround = vec3(0.0, 0.0, 1.0);`:M.H``}
        ${1===e.pbrMode||2===e.pbrMode?M.H`
            float additionalAmbientIrradiance = additionalAmbientIrradianceFactor * lightingMainIntensity[2];
            vec3 shadedColor = evaluateSceneLightingPBR(shadedNormal, albedo_, shadow, 1.0 - ssao, additionalLight, viewDirection, normalGround, mrr, emission, additionalAmbientIrradiance);`:"vec3 shadedColor = evaluateSceneLighting(shadedNormal, albedo_, shadow, 1.0 - ssao, additionalLight);"}
        gl_FragColor = highlightSlice(vec4(shadedColor, opacity_), vpos);
        ${e.OITEnabled?"gl_FragColor = premultiplyAlpha(gl_FragColor);":""}
      }
    `)),t.include(m.s,e),t}const P=Object.freeze({__proto__:null,build:A})},79912:(e,t,i)=>{function r(){return new Float32Array(3)}function o(e,t,i){const r=new Float32Array(3);return r[0]=e,r[1]=t,r[2]=i,r}function a(){return r()}function n(){return o(1,1,1)}function s(){return o(1,0,0)}function l(){return o(0,1,0)}function c(){return o(0,0,1)}i.d(t,{c:()=>r,f:()=>o});const d=a(),u=n(),h=s(),p=l(),m=c();Object.freeze({__proto__:null,create:r,clone:function(e){const t=new Float32Array(3);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t},fromValues:o,createView:function(e,t){return new Float32Array(e,t,3)},zeros:a,ones:n,unitX:s,unitY:l,unitZ:c,ZEROS:d,ONES:u,UNIT_X:h,UNIT_Y:p,UNIT_Z:m})},44883:(e,t,i)=>{i.d(t,{t:()=>o});var r=i(66341);async function o(e,t){const{data:i}=await(0,r.default)(e,{responseType:"image",...t});return i}},47705:(e,t,i)=>{i.r(t),i.d(t,{fetch:()=>Wt,gltfToEngineResources:()=>Gt,parseUrl:()=>Ut});var r=i(57989),o=i(61681),a=i(1662),n=i(34344),s=i(24455),l=i(39100),c=i(6766),d=i(8909),u=i(37116),h=i(81936),p=i(86717),m=i(56999),f=i(79),v=i(91420),g=i(20016),x=i(1731),b=i(66341),_=i(67979),T=i(70375),y=i(13802),w=i(78668),S=i(26139),M=i(44883),C=i(17135),A=i(15095);class P{constructor(e,t,i,r){this.primitiveIndices=e,this._numIndexPerPrimitive=t,this.indices=i,this.position=r,this.center=(0,d.c)(),(0,A.hu)(e.length>=1),(0,A.hu)(i.length%this._numIndexPerPrimitive==0),(0,A.hu)(i.length>=e.length*this._numIndexPerPrimitive),(0,A.hu)(3===r.size||4===r.size);const{data:o,size:a}=r,n=e.length;let s=a*i[this._numIndexPerPrimitive*e[0]];O.clear(),O.push(s),this.bbMin=(0,d.f)(o[s],o[s+1],o[s+2]),this.bbMax=(0,d.a)(this.bbMin);for(let t=0;t<n;++t){const r=this._numIndexPerPrimitive*e[t];for(let e=0;e<this._numIndexPerPrimitive;++e){s=a*i[r+e],O.push(s);let t=o[s];this.bbMin[0]=Math.min(t,this.bbMin[0]),this.bbMax[0]=Math.max(t,this.bbMax[0]),t=o[s+1],this.bbMin[1]=Math.min(t,this.bbMin[1]),this.bbMax[1]=Math.max(t,this.bbMax[1]),t=o[s+2],this.bbMin[2]=Math.min(t,this.bbMin[2]),this.bbMax[2]=Math.max(t,this.bbMax[2])}}(0,c.e)(this.center,this.bbMin,this.bbMax,.5),this.radius=.5*Math.max(Math.max(this.bbMax[0]-this.bbMin[0],this.bbMax[1]-this.bbMin[1]),this.bbMax[2]-this.bbMin[2]);let l=this.radius*this.radius;for(let e=0;e<O.length;++e){s=O.getItemAt(e);const t=o[s]-this.center[0],i=o[s+1]-this.center[1],r=o[s+2]-this.center[2],a=t*t+i*i+r*r;if(a<=l)continue;const n=Math.sqrt(a),c=.5*(n-this.radius);this.radius=this.radius+c,l=this.radius*this.radius;const d=c/n;this.center[0]+=t*d,this.center[1]+=i*d,this.center[2]+=r*d}O.clear()}getCenter(){return this.center}getBSRadius(){return this.radius}getBBMin(){return this.bbMin}getBBMax(){return this.bbMax}getChildren(){if(this._children)return this._children;if((0,c.h)(this.bbMin,this.bbMax)>1){const e=(0,c.e)((0,d.c)(),this.bbMin,this.bbMax,.5),t=this.primitiveIndices.length,i=new Uint8Array(t),r=new Array(8);for(let e=0;e<8;++e)r[e]=0;const{data:o,size:a}=this.position;for(let n=0;n<t;++n){let t=0;const s=this._numIndexPerPrimitive*this.primitiveIndices[n];let l=a*this.indices[s],c=o[l],d=o[l+1],u=o[l+2];for(let e=1;e<this._numIndexPerPrimitive;++e){l=a*this.indices[s+e];const t=o[l],i=o[l+1],r=o[l+2];t<c&&(c=t),i<d&&(d=i),r<u&&(u=r)}c<e[0]&&(t|=1),d<e[1]&&(t|=2),u<e[2]&&(t|=4),i[n]=t,++r[t]}let n=0;for(let e=0;e<8;++e)r[e]>0&&++n;if(n<2)return;const s=new Array(8);for(let e=0;e<8;++e)s[e]=r[e]>0?new Uint32Array(r[e]):void 0;for(let e=0;e<8;++e)r[e]=0;for(let e=0;e<t;++e){const t=i[e];s[t][r[t]++]=this.primitiveIndices[e]}this._children=new Array(8);for(let e=0;e<8;++e)void 0!==s[e]&&(this._children[e]=new P(s[e],this._numIndexPerPrimitive,this.indices,this.position))}return this._children}static prune(){O.prune()}}const O=new C.Z({deallocator:null});var F=i(7958);class I{constructor(){this.id=(0,F.D)()}unload(){}}var H=i(58196);class D extends I{constructor(e,t=[],i=0,r=-1){super(),this._primitiveType=i,this.edgeIndicesLength=r,this.type=2,this._vertexAttributes=new Map,this._indices=new Map,this._boundingInfo=null;for(const[t,i]of e)i&&this._vertexAttributes.set(t,{...i});if(null==t||0===t.length){const e=function(e){const t=e.values().next().value;return null==t?0:t.data.length/t.size}(this._vertexAttributes),t=(0,H.p)(e);this.edgeIndicesLength=this.edgeIndicesLength<0?e:this.edgeIndicesLength;for(const e of this._vertexAttributes.keys())this._indices.set(e,t)}else for(const[e,i]of t)i&&(this._indices.set(e,z(i)),"position"===e&&(this.edgeIndicesLength=this.edgeIndicesLength<0?this._indices.get(e).length:this.edgeIndicesLength))}get vertexAttributes(){return this._vertexAttributes}getMutableAttribute(e){const t=this._vertexAttributes.get(e);return t&&!t.exclusive&&(t.data=Array.from(t.data),t.exclusive=!0),t}get indices(){return this._indices}get indexCount(){const e=this._indices.values().next().value;return e?e.length:0}get primitiveType(){return this._primitiveType}get faceCount(){return this.indexCount/3}get boundingInfo(){return(0,o.Wi)(this._boundingInfo)&&(this._boundingInfo=this._calculateBoundingInfo()),this._boundingInfo}computeAttachmentOrigin(e){return 0===this.primitiveType?this.computeAttachmentOriginTriangles(e):this.computeAttachmentOriginPoints(e)}computeAttachmentOriginTriangles(e){const t=this.indices.get("position"),i=this.vertexAttributes.get("position");return(0,H.cM)(i,t,e)}computeAttachmentOriginPoints(e){const t=this.indices.get("position"),i=this.vertexAttributes.get("position");return(0,H.NO)(i,t,e)}invalidateBoundingInfo(){this._boundingInfo=null}_calculateBoundingInfo(){const e=this.indices.get("position");if(0===e.length)return null;const t=0===this.primitiveType?3:1;(0,A.hu)(e.length%t==0,"Indexing error: "+e.length+" not divisible by "+t);const i=(0,H.p)(e.length/t),r=this.vertexAttributes.get("position");return new P(i,t,e,r)}}function z(e){if(e.BYTES_PER_ELEMENT===Uint16Array.BYTES_PER_ELEMENT)return e;for(const t of e)if(t>=65536)return e;return new Uint16Array(e)}var E=i(27755),L=i(31355),R=i(19431),N=i(86098),B=i(3466),V=i(73401),W=i(36567);let U;var G=i(43487),k=i(62486);let $=null,q=null;async function j(){return(0,o.Wi)(q)&&(q=function(){if((0,o.Wi)(U)){const e=e=>(0,W.V)(`esri/libs/basisu/${e}`);U=i.e(1681).then(i.bind(i,21681)).then((e=>e.b)).then((({default:t})=>t({locateFile:e}).then((e=>(e.initializeBasis(),delete e.then,e)))))}return U}(),$=await q),q}function X(e,t,i,r,o){const a=(0,k.RG)(t?37496:37492),n=o&&e>1?(4**e-1)/(3*4**(e-1)):1;return Math.ceil(i*r*a*n)}function Z(e){return e.getNumImages()>=1&&!e.isUASTC()}function K(e){return e.getFaces()>=1&&e.isETC1S()}function Y(e,t,i,r,o,a,n,s){const{compressedTextureETC:l,compressedTextureS3TC:c}=e.capabilities,[d,u]=l?r?[1,37496]:[0,37492]:c?r?[3,33779]:[2,33776]:[13,6408],h=t.hasMipmap?i:Math.min(1,i),p=[];for(let e=0;e<h;e++)p.push(new Uint8Array(n(e,d))),s(e,d,p[e]);const m=p.length>1,f=m?9987:9729,v={...t,samplingMode:f,hasMipmap:m,internalFormat:u,width:o,height:a};return new G.Z(e,v,{type:"compressed",levels:p})}const Q=y.Z.getLogger("esri.views.3d.webgl-engine.lib.DDSUtil");function J(e){return e.charCodeAt(0)+(e.charCodeAt(1)<<8)+(e.charCodeAt(2)<<16)+(e.charCodeAt(3)<<24)}const ee=J("DXT1"),te=J("DXT3"),ie=J("DXT5");const re=new Map([["position",0],["normal",1],["uv0",2],["color",3],["size",4],["tangent",4],["auxpos1",5],["symbolColor",5],["auxpos2",6],["featureAttribute",6],["instanceFeatureAttribute",6],["instanceColor",7],["model",8],["modelNormal",12],["modelOriginHi",11],["modelOriginLo",15]]),oe=[{name:"position",count:2,type:5126,offset:0,stride:8,normalized:!1}],ae=[{name:"position",count:2,type:5126,offset:0,stride:16,normalized:!1},{name:"uv0",count:2,type:5126,offset:8,stride:16,normalized:!1}];var ne=i(78951),se=i(29620),le=i(18567),ce=i(79193);class de extends I{constructor(e,t){super(),this.data=e,this.type=4,this._glTexture=null,this._powerOfTwoStretchInfo=null,this._loadingPromise=null,this._loadingController=null,this.events=new L.Z,this.params=t||{},this.params.mipmap=!1!==this.params.mipmap,this.params.noUnpackFlip=this.params.noUnpackFlip||!1,this.params.preMultiplyAlpha=this.params.preMultiplyAlpha||!1,this.params.wrap=this.params.wrap||{s:10497,t:10497},this.params.powerOfTwoResizeMode=this.params.powerOfTwoResizeMode||1,this.estimatedTexMemRequired=de.estimateTexMemRequired(this.data,this.params),this.startPreload()}startPreload(){const e=this.data;(0,o.Wi)(e)||(e instanceof HTMLVideoElement?this.startPreloadVideoElement(e):e instanceof HTMLImageElement&&this.startPreloadImageElement(e))}startPreloadVideoElement(e){(0,B.jc)(e.src)||"auto"===e.preload&&e.crossOrigin||(e.preload="auto",e.crossOrigin="anonymous",e.src=e.src)}startPreloadImageElement(e){(0,B.HK)(e.src)||(0,B.jc)(e.src)||e.crossOrigin||(e.crossOrigin="anonymous",e.src=e.src)}static getDataDimensions(e){return e instanceof HTMLVideoElement?{width:e.videoWidth,height:e.videoHeight}:e}static estimateTexMemRequired(e,t){if((0,o.Wi)(e))return 0;if((0,N.eP)(e)||(0,N.lq)(e))return t.encoding===de.KTX2_ENCODING?function(e,t){if((0,o.Wi)($))return e.byteLength;const i=new $.KTX2File(new Uint8Array(e)),r=K(i)?X(i.getLevels(),i.getHasAlpha(),i.getWidth(),i.getHeight(),t):0;return i.close(),i.delete(),r}(e,t.mipmap):t.encoding===de.BASIS_ENCODING?function(e,t){if((0,o.Wi)($))return e.byteLength;const i=new $.BasisFile(new Uint8Array(e)),r=Z(i)?X(i.getNumLevels(0),i.getHasAlpha(),i.getImageWidth(0,0),i.getImageHeight(0,0),t):0;return i.close(),i.delete(),r}(e,t.mipmap):e.byteLength;const{width:i,height:r}=e instanceof Image||e instanceof ImageData||e instanceof HTMLCanvasElement||e instanceof HTMLVideoElement?de.getDataDimensions(e):t;return(t.mipmap?4/3:1)*i*r*(t.components||4)||0}dispose(){this.data=void 0}get width(){return this.params.width}get height(){return this.params.height}createDescriptor(e){var t;return{target:3553,pixelFormat:6408,dataType:5121,wrapMode:this.params.wrap,flipped:!this.params.noUnpackFlip,samplingMode:this.params.mipmap?9987:9729,hasMipmap:this.params.mipmap,preMultiplyAlpha:this.params.preMultiplyAlpha,maxAnisotropy:null!=(t=this.params.maxAnisotropy)?t:this.params.mipmap?e.parameters.maxMaxAnisotropy:1}}get glTexture(){return this._glTexture}load(e,t){if((0,o.pC)(this._glTexture))return this._glTexture;if((0,o.pC)(this._loadingPromise))return this._loadingPromise;const i=this.data;return(0,o.Wi)(i)?(this._glTexture=new G.Z(e,this.createDescriptor(e),null),this._glTexture):"string"==typeof i?this.loadFromURL(e,t,i):i instanceof Image?this.loadFromImageElement(e,t,i):i instanceof HTMLVideoElement?this.loadFromVideoElement(e,t,i):i instanceof ImageData||i instanceof HTMLCanvasElement?this.loadFromImage(e,i,t):((0,N.eP)(i)||(0,N.lq)(i))&&this.params.encoding===de.DDS_ENCODING?this.loadFromDDSData(e,i):((0,N.eP)(i)||(0,N.lq)(i))&&this.params.encoding===de.KTX2_ENCODING?this.loadFromKTX2(e,i):((0,N.eP)(i)||(0,N.lq)(i))&&this.params.encoding===de.BASIS_ENCODING?this.loadFromBasis(e,i):(0,N.lq)(i)?this.loadFromPixelData(e,i):(0,N.eP)(i)?this.loadFromPixelData(e,new Uint8Array(i)):null}get requiresFrameUpdates(){return this.data instanceof HTMLVideoElement}frameUpdate(e,t,i){if(!(this.data instanceof HTMLVideoElement)||(0,o.Wi)(this._glTexture))return i;if(this.data.readyState<2||i===this.data.currentTime)return i;if((0,o.pC)(this._powerOfTwoStretchInfo)){const{framebuffer:i,vao:r,sourceTexture:o}=this._powerOfTwoStretchInfo;o.setData(this.data),this.drawStretchedTexture(e,t,i,r,o,this._glTexture)}else{const{width:e,height:t}=this.data,{width:i,height:r}=this._glTexture.descriptor;e!==i||t!==r?this._glTexture.updateData(0,0,0,Math.min(e,i),Math.min(t,r),this.data):this._glTexture.setData(this.data)}return this._glTexture.descriptor.hasMipmap&&this._glTexture.generateMipmap(),this.data.currentTime}loadFromDDSData(e,t){return this._glTexture=function(e,t,i){const{textureData:r,internalFormat:o,width:a,height:n}=function(e,t){const i=new Int32Array(e,0,31);if(542327876!==i[0])return Q.error("Invalid magic number in DDS header"),null;if(!(4&i[20]))return Q.error("Unsupported format, must contain a FourCC code"),null;const r=i[21];let o,a;switch(r){case ee:o=8,a=33776;break;case te:o=16,a=33778;break;case ie:o=16,a=33779;break;default:return Q.error("Unsupported FourCC code:",function(e){return String.fromCharCode(255&e,e>>8&255,e>>16&255,e>>24&255)}(r)),null}let n=1,s=i[4],l=i[3];0==(3&s)&&0==(3&l)||(Q.warn("Rounding up compressed texture size to nearest multiple of 4."),s=s+3&-4,l=l+3&-4);const c=s,d=l;let u,h;131072&i[2]&&!1!==t&&(n=Math.max(1,i[7])),1===n||(0,R.wt)(s)&&(0,R.wt)(l)||(Q.warn("Ignoring mipmaps of non power of two sized compressed texture."),n=1);let p=i[1]+4;const m=[];for(let t=0;t<n;++t)h=(s+3>>2)*(l+3>>2)*o,u=new Uint8Array(e,p,h),m.push(u),p+=h,s=Math.max(1,s>>1),l=Math.max(1,l>>1);return{textureData:{type:"compressed",levels:m},internalFormat:a,width:c,height:d}}(i,t.hasMipmap);return t.samplingMode=r.levels.length>1?9987:9729,t.hasMipmap=r.levels.length>1,t.internalFormat=o,t.width=a,t.height=n,new G.Z(e,t,r)}(e,this.createDescriptor(e),t),this._glTexture}loadFromKTX2(e,t){return this.loadAsync((()=>async function(e,t,i){(0,o.Wi)($)&&($=await j());const r=new $.KTX2File(new Uint8Array(i));if(!K(r))return null;r.startTranscoding();const a=Y(e,t,r.getLevels(),r.getHasAlpha(),r.getWidth(),r.getHeight(),((e,t)=>r.getImageTranscodedSizeInBytes(e,0,0,t)),((e,t,i)=>r.transcodeImage(i,e,0,0,t,0,-1,-1)));return r.close(),r.delete(),a}(e,this.createDescriptor(e),t).then((e=>(this._glTexture=e,e)))))}loadFromBasis(e,t){return this.loadAsync((()=>async function(e,t,i){(0,o.Wi)($)&&($=await j());const r=new $.BasisFile(new Uint8Array(i));if(!Z(r))return null;r.startTranscoding();const a=Y(e,t,r.getNumLevels(0),r.getHasAlpha(),r.getImageWidth(0,0),r.getImageHeight(0,0),((e,t)=>r.getImageTranscodedSizeInBytes(0,e,t)),((e,t,i)=>r.transcodeImage(i,0,e,t,0,0)));return r.close(),r.delete(),a}(e,this.createDescriptor(e),t).then((e=>(this._glTexture=e,e)))))}loadFromPixelData(e,t){(0,A.hu)(this.params.width>0&&this.params.height>0);const i=this.createDescriptor(e);return i.pixelFormat=1===this.params.components?6409:3===this.params.components?6407:6408,i.width=this.params.width,i.height=this.params.height,this._glTexture=new G.Z(e,i,t),this._glTexture}loadFromURL(e,t,i){return this.loadAsync((async r=>{const o=await(0,M.t)(i,{signal:r});return this.loadFromImage(e,o,t)}))}loadFromImageElement(e,t,i){return i.complete?this.loadFromImage(e,i,t):this.loadAsync((async r=>{const o=await(0,V.f)(i,i.src,!1,r);return this.loadFromImage(e,o,t)}))}loadFromVideoElement(e,t,i){return i.readyState>=2?this.loadFromImage(e,i,t):this.loadFromVideoElementAsync(e,t,i)}loadFromVideoElementAsync(e,t,i){return this.loadAsync((r=>new Promise(((a,n)=>{const s=()=>{i.removeEventListener("loadeddata",l),i.removeEventListener("error",c),(0,o.hw)(d)},l=()=>{i.readyState>=2&&(s(),a(this.loadFromImage(e,i,t)))},c=e=>{s(),n(e||new T.Z("Failed to load video"))};i.addEventListener("loadeddata",l),i.addEventListener("error",c);const d=(0,w.fu)(r,(()=>c((0,w.zE)())))}))))}loadFromImage(e,t,i){const r=de.getDataDimensions(t);this.params.width=r.width,this.params.height=r.height;const o=this.createDescriptor(e);return o.pixelFormat=3===this.params.components?6407:6408,!this.requiresPowerOfTwo(e,o)||(0,R.wt)(r.width)&&(0,R.wt)(r.height)?(o.width=r.width,o.height=r.height,this._glTexture=new G.Z(e,o,t),this._glTexture):(this._glTexture=this.makePowerOfTwoTexture(e,t,r,o,i),this._glTexture)}loadAsync(e){const t=new AbortController;this._loadingController=t;const i=e(t.signal);this._loadingPromise=i;const r=()=>{this._loadingController===t&&(this._loadingController=null),this._loadingPromise===i&&(this._loadingPromise=null)};return i.then(r,r),i}requiresPowerOfTwo(e,t){const i=33071,r="number"==typeof t.wrapMode?t.wrapMode===i:t.wrapMode.s===i&&t.wrapMode.t===i;return!(0,ce.Z)(e.gl)&&(t.hasMipmap||!r)}makePowerOfTwoTexture(e,t,i,r,o){const{width:a,height:n}=i,s=(0,R.Sf)(a),l=(0,R.Sf)(n);let c;switch(r.width=s,r.height=l,this.params.powerOfTwoResizeMode){case 2:r.textureCoordinateScaleFactor=[a/s,n/l],c=new G.Z(e,r),c.updateData(0,0,0,a,n,t);break;case 1:case null:case void 0:c=this.stretchToPowerOfTwo(e,t,r,o());break;default:(0,E.Bg)(this.params.powerOfTwoResizeMode)}return r.hasMipmap&&c.generateMipmap(),c}stretchToPowerOfTwo(e,t,i,r){const o=new G.Z(e,i),a=new le.Z(e,{colorTarget:0,depthStencilTarget:0},o),n=new G.Z(e,{target:3553,pixelFormat:i.pixelFormat,dataType:5121,wrapMode:33071,samplingMode:9729,flipped:!!i.flipped,maxAnisotropy:8,preMultiplyAlpha:i.preMultiplyAlpha},t),s=function(e,t=oe,i=re,r=-1,o=1){let a=null;return a=t===ae?new Float32Array([r,r,0,0,o,r,1,0,r,o,0,1,o,o,1,1]):new Float32Array([r,r,o,r,r,o,o,o]),new se.Z(e,i,{geometry:t},{geometry:ne.Z.createVertex(e,35044,a)})}(e),l=e.getBoundFramebufferObject();return this.drawStretchedTexture(e,r,a,s,n,o),this.requiresFrameUpdates?this._powerOfTwoStretchInfo={vao:s,sourceTexture:n,framebuffer:a}:(s.dispose(!0),n.dispose(),a.detachColorTexture(),a.dispose()),e.bindFramebuffer(l),o}drawStretchedTexture(e,t,i,r,o,a){e.bindFramebuffer(i);const n=e.getViewport();e.setViewport(0,0,a.descriptor.width,a.descriptor.height);const s=t.program;e.useProgram(s),s.setUniform4f("color",1,1,1,1),s.bindTexture(o,"tex"),e.bindVAO(r),t.bindPipelineState(e),e.drawArrays(5,0,(0,k._V)(r,"geometry")),e.bindFramebuffer(null),e.setViewport(n.x,n.y,n.width,n.height)}unload(){if((0,o.pC)(this._powerOfTwoStretchInfo)){const{framebuffer:e,vao:t,sourceTexture:i}=this._powerOfTwoStretchInfo;t.dispose(!0),i.dispose(),e.dispose(),this._glTexture=null,this._powerOfTwoStretchInfo=null}if((0,o.pC)(this._glTexture)&&(this._glTexture.dispose(),this._glTexture=null),(0,o.pC)(this._loadingController)){const e=this._loadingController;this._loadingController=null,this._loadingPromise=null,e.abort()}this.events.emit("unloaded")}}de.DDS_ENCODING="image/vnd-ms.dds",de.KTX2_ENCODING="image/ktx2",de.BASIS_ENCODING="image/x.basis";var ue=i(44685),he=i(41272),pe=i(54443);class me extends I{constructor(e,t){super(),this.type=3,this.supportsEdges=!1,this._visible=!0,this._renderPriority=0,this._insertOrder=0,this._vertexAttributeLocations=re,this._parameters=(0,pe.Uf)(e,t),this.validateParameters(this._parameters)}dispose(){}get parameters(){return this._parameters}update(e){return!1}setParameters(e){(0,pe.LO)(this._parameters,e)&&(this.validateParameters(this._parameters),this.parametersChanged())}validateParameters(e){}get visible(){return this._visible}set visible(e){e!==this._visible&&(this._visible=e,this.parametersChanged())}shouldRender(e){return this.isVisible()&&this.isVisibleInPass(e.pass)&&0!=(this.renderOccluded&e.renderOccludedMask)}isVisibleInPass(e){return!0}get renderOccluded(){return this.parameters.renderOccluded}get renderPriority(){return this._renderPriority}set renderPriority(e){e!==this._renderPriority&&(this._renderPriority=e,this.parametersChanged())}get insertOrder(){return this._insertOrder}set insertOrder(e){e!==this._insertOrder&&(this._insertOrder=e,this.parametersChanged())}get vertexAttributeLocations(){return this._vertexAttributeLocations}isVisible(){return this._visible}parametersChanged(){(0,o.pC)(this.repository)&&this.repository.materialChanged(this)}}var fe=i(12045),ve=i(10663),ge=i(61044),xe=i(79912),be=i(1983),_e=(i(39994),i(88589)),Te=(i(7753),i(19480)),ye=i(68817);new Te.x((function(){return{origin:null,direction:null}})),(0,d.c)(),(0,d.c)();const we=y.Z.getLogger("esri.geometry.support.sphere");function Se(){return(0,be.c)()}function Me(e,t=Se()){return(0,_e.c)(t,e)}function Ce(e){return Array.isArray(e)?e[3]:e}function Ae(e){return Array.isArray(e)?e:Le}function Pe(e,t,i){if((0,o.Wi)(t))return!1;const{origin:r,direction:a}=t,n=Oe;n[0]=r[0]-e[0],n[1]=r[1]-e[1],n[2]=r[2]-e[2];const s=a[0]*a[0]+a[1]*a[1]+a[2]*a[2],l=2*(a[0]*n[0]+a[1]*n[1]+a[2]*n[2]),c=l*l-4*s*(n[0]*n[0]+n[1]*n[1]+n[2]*n[2]-e[3]*e[3]);if(c<0)return!1;const d=Math.sqrt(c);let u=(-l-d)/(2*s);const h=(-l+d)/(2*s);return(u<0||h<u&&h>0)&&(u=h),!(u<0||(i&&(i[0]=r[0]+a[0]*u,i[1]=r[1]+a[1]*u,i[2]=r[2]+a[2]*u),0))}const Oe=(0,d.c)();function Fe(e,t,i){const r=ye.WM.get(),o=ye.MP.get();(0,c.c)(r,t.origin,t.direction);const a=Ce(e);(0,c.c)(i,r,t.origin),(0,c.a)(i,i,1/(0,c.l)(i)*a);const n=He(e,t.origin),l=function(e,t){const i=(0,c.d)(e,t)/((0,c.l)(e)*(0,c.l)(t));return-(0,R.ZF)(i)}(t.origin,i);return(0,s.i)(o),(0,s.e)(o,o,l+n,r),(0,c.m)(i,i,o),i}function Ie(e,t,i){const r=(0,c.f)(ye.WM.get(),t,Ae(e)),o=(0,c.a)(ye.WM.get(),r,e[3]/(0,c.l)(r));return(0,c.b)(i,o,Ae(e))}function He(e,t){const i=(0,c.f)(ye.WM.get(),t,Ae(e)),r=(0,c.l)(i),o=Ce(e),a=o+Math.abs(o-r);return(0,R.ZF)(o/a)}const De=(0,d.c)();function ze(e,t,i,r){const o=(0,c.f)(De,t,Ae(e));switch(i){case 0:{const e=(0,R.jE)(o,De)[2];return(0,c.s)(r,-Math.sin(e),Math.cos(e),0)}case 1:{const e=(0,R.jE)(o,De),t=e[1],i=e[2],a=Math.sin(t);return(0,c.s)(r,-a*Math.cos(i),-a*Math.sin(i),Math.cos(t))}case 2:return(0,c.n)(r,o);default:return}}function Ee(e,t){const i=(0,c.f)(Re,t,Ae(e));return(0,c.l)(i)-e[3]}const Le=(0,d.c)(),Re=(0,d.c)();Object.freeze({__proto__:null,create:Se,copy:Me,fromCenterAndRadius:function(e,t){return(0,be.f)(e[0],e[1],e[2],t)},wrap:function(e){return e},clear:function(e){e[0]=e[1]=e[2]=e[3]=0},fromRadius:function(e){return e},getRadius:Ce,getCenter:Ae,fromValues:function(e,t,i,r){return(0,be.f)(e,t,i,r)},elevate:function(e,t,i){return e!==i&&(0,c.g)(i,e),i[3]=e[3]+t,i},setExtent:function(e,t,i){return we.error("sphere.setExtent is not yet supported"),e===i?i:Me(e,i)},intersectRay:Pe,intersectsRay:function(e,t){return Pe(e,t,null)},intersectRayClosestSilhouette:function(e,t,i){if(Pe(e,t,i))return i;const r=Fe(e,t,ye.WM.get());return(0,c.b)(i,t.origin,(0,c.a)(ye.WM.get(),t.direction,(0,c.i)(t.origin,r)/(0,c.l)(t.direction))),i},closestPointOnSilhouette:Fe,closestPoint:function(e,t,i){return Pe(e,t,i)?i:(function(e,t,i){const r=(0,c.d)(e.direction,(0,c.f)(i,t,e.origin));(0,c.b)(i,e.origin,(0,c.a)(i,e.direction,r))}(t,Ae(e),i),Ie(e,i,i))},projectPoint:Ie,distanceToSilhouette:function(e,t){const i=(0,c.f)(ye.WM.get(),t,Ae(e)),r=(0,c.p)(i),o=e[3]*e[3];return Math.sqrt(Math.abs(r-o))},angleToSilhouette:He,axisAt:ze,altitudeAt:Ee,setAltitudeAt:function(e,t,i,r){const o=Ee(e,t),a=ze(e,t,2,Re),n=(0,c.a)(Re,a,i-o);return(0,c.b)(r,t,n)}});const Ne=new class{constructor(e=0){this.offset=e,this.sphere=Se(),this.tmpVertex=(0,d.c)()}applyToVertex(e,t,i){const r=this.objectTransform.transform;let o=r[0]*e+r[4]*t+r[8]*i+r[12],a=r[1]*e+r[5]*t+r[9]*i+r[13],n=r[2]*e+r[6]*t+r[10]*i+r[14];const s=this.offset/Math.sqrt(o*o+a*a+n*n);o+=o*s,a+=a*s,n+=n*s;const l=this.objectTransform.inverse;return this.tmpVertex[0]=l[0]*o+l[4]*a+l[8]*n+l[12],this.tmpVertex[1]=l[1]*o+l[5]*a+l[9]*n+l[13],this.tmpVertex[2]=l[2]*o+l[6]*a+l[10]*n+l[14],this.tmpVertex}applyToMinMax(e,t){const i=this.offset/Math.sqrt(e[0]*e[0]+e[1]*e[1]+e[2]*e[2]);e[0]+=e[0]*i,e[1]+=e[1]*i,e[2]+=e[2]*i;const r=this.offset/Math.sqrt(t[0]*t[0]+t[1]*t[1]+t[2]*t[2]);t[0]+=t[0]*r,t[1]+=t[1]*r,t[2]+=t[2]*r}applyToAabb(e){const t=this.offset/Math.sqrt(e[0]*e[0]+e[1]*e[1]+e[2]*e[2]);e[0]+=e[0]*t,e[1]+=e[1]*t,e[2]+=e[2]*t;const i=this.offset/Math.sqrt(e[3]*e[3]+e[4]*e[4]+e[5]*e[5]);return e[3]+=e[3]*i,e[4]+=e[4]*i,e[5]+=e[5]*i,e}applyToBoundingSphere(e){const t=Math.sqrt(e[0]*e[0]+e[1]*e[1]+e[2]*e[2]),i=this.offset/t;return this.sphere[0]=e[0]+e[0]*i,this.sphere[1]=e[1]+e[1]*i,this.sphere[2]=e[2]+e[2]*i,this.sphere[3]=e[3]+e[3]*this.offset/t,this.sphere}};new class{constructor(e=0){this.offset=e,this.componentLocalOriginLength=0,this.tmpVertex=(0,d.c)(),this.mbs=(0,be.c)(),this.obb={center:(0,d.c)(),halfSize:(0,xe.c)(),quaternion:null}}set localOrigin(e){this.componentLocalOriginLength=Math.sqrt(e[0]*e[0]+e[1]*e[1]+e[2]*e[2])}applyToVertex(e,t,i){const r=e,o=t,a=i+this.componentLocalOriginLength,n=this.offset/Math.sqrt(r*r+o*o+a*a);return this.tmpVertex[0]=e+r*n,this.tmpVertex[1]=t+o*n,this.tmpVertex[2]=i+a*n,this.tmpVertex}applyToAabb(e){const t=e[0],i=e[1],r=e[2]+this.componentLocalOriginLength,o=e[3],a=e[4],n=e[5]+this.componentLocalOriginLength,s=this.offset/Math.sqrt(t*t+i*i+r*r);e[0]+=t*s,e[1]+=i*s,e[2]+=r*s;const l=this.offset/Math.sqrt(o*o+a*a+n*n);return e[3]+=o*l,e[4]+=a*l,e[5]+=n*l,e}applyToMbs(e){const t=Math.sqrt(e[0]*e[0]+e[1]*e[1]+e[2]*e[2]),i=this.offset/t;return this.mbs[0]=e[0]+e[0]*i,this.mbs[1]=e[1]+e[1]*i,this.mbs[2]=e[2]+e[2]*i,this.mbs[3]=e[3]+e[3]*this.offset/t,this.mbs}applyToObb(e){const t=e.center,i=this.offset/Math.sqrt(t[0]*t[0]+t[1]*t[1]+t[2]*t[2]);this.obb.center[0]=t[0]+t[0]*i,this.obb.center[1]=t[1]+t[1]*i,this.obb.center[2]=t[2]+t[2]*i,(0,c.q)(this.obb.halfSize,e.halfSize,e.quaternion),(0,c.b)(this.obb.halfSize,this.obb.halfSize,e.center);const r=this.offset/Math.sqrt(this.obb.halfSize[0]*this.obb.halfSize[0]+this.obb.halfSize[1]*this.obb.halfSize[1]+this.obb.halfSize[2]*this.obb.halfSize[2]);return this.obb.halfSize[0]+=this.obb.halfSize[0]*r,this.obb.halfSize[1]+=this.obb.halfSize[1]*r,this.obb.halfSize[2]+=this.obb.halfSize[2]*r,(0,c.f)(this.obb.halfSize,this.obb.halfSize,e.center),(0,ve.c)(Be,e.quaternion),(0,c.q)(this.obb.halfSize,this.obb.halfSize,Be),this.obb.halfSize[0]*=this.obb.halfSize[0]<0?-1:1,this.obb.halfSize[1]*=this.obb.halfSize[1]<0?-1:1,this.obb.halfSize[2]*=this.obb.halfSize[2]<0?-1:1,this.obb.quaternion=e.quaternion,this.obb}},new class{constructor(e=0){this.offset=e,this.tmpVertex=(0,d.c)()}applyToVertex(e,t,i){const r=e+this.localOrigin[0],o=t+this.localOrigin[1],a=i+this.localOrigin[2],n=this.offset/Math.sqrt(r*r+o*o+a*a);return this.tmpVertex[0]=e+r*n,this.tmpVertex[1]=t+o*n,this.tmpVertex[2]=i+a*n,this.tmpVertex}applyToAabb(e){const t=e[0]+this.localOrigin[0],i=e[1]+this.localOrigin[1],r=e[2]+this.localOrigin[2],o=e[3]+this.localOrigin[0],a=e[4]+this.localOrigin[1],n=e[5]+this.localOrigin[2],s=this.offset/Math.sqrt(t*t+i*i+r*r);e[0]+=t*s,e[1]+=i*s,e[2]+=r*s;const l=this.offset/Math.sqrt(o*o+a*a+n*n);return e[3]+=o*l,e[4]+=a*l,e[5]+=n*l,e}};const Be=(0,ge.a)();function Ve(e,t,i,r){const o=i.typedBuffer,a=i.typedBufferStride,n=e.length;r*=a;for(let i=0;i<n;++i){const n=2*e[i];o[r]=t[n],o[r+1]=t[n+1],r+=a}}function We(e,t,i,r,o){const a=i.typedBuffer,n=i.typedBufferStride,s=e.length;if(r*=n,null==o||1===o)for(let i=0;i<s;++i){const o=3*e[i];a[r]=t[o],a[r+1]=t[o+1],a[r+2]=t[o+2],r+=n}else for(let i=0;i<s;++i){const s=3*e[i];for(let e=0;e<o;++e)a[r]=t[s],a[r+1]=t[s+1],a[r+2]=t[s+2],r+=n}}function Ue(e,t,i,r,o,a=1){if(!i)return void We(e,t,r,o,a);const n=r.typedBuffer,s=r.typedBufferStride,l=e.length,c=i[0],d=i[1],u=i[2],h=i[4],p=i[5],m=i[6],f=i[8],v=i[9],g=i[10],x=i[12],b=i[13],_=i[14];if(o*=s,1===a)for(let i=0;i<l;++i){const r=3*e[i],a=t[r],l=t[r+1],T=t[r+2];n[o]=c*a+h*l+f*T+x,n[o+1]=d*a+p*l+v*T+b,n[o+2]=u*a+m*l+g*T+_,o+=s}else for(let i=0;i<l;++i){const r=3*e[i],l=t[r],T=t[r+1],y=t[r+2],w=c*l+h*T+f*y+x,S=d*l+p*T+v*y+b,M=u*l+m*T+g*y+_;for(let e=0;e<a;++e)n[o]=w,n[o+1]=S,n[o+2]=M,o+=s}}function Ge(e,t,i,r,o,a=1){if(!i)return void We(e,t,r,o,a);const n=i,l=r.typedBuffer,c=r.typedBufferStride,d=e.length,u=n[0],h=n[1],p=n[2],m=n[4],f=n[5],v=n[6],g=n[8],x=n[9],b=n[10],_=!(0,s.k)(n),T=1e-6,y=1-T;if(o*=c,1===a)for(let i=0;i<d;++i){const r=3*e[i],a=t[r],n=t[r+1],s=t[r+2];let d=u*a+m*n+g*s,w=h*a+f*n+x*s,S=p*a+v*n+b*s;if(_){const e=d*d+w*w+S*S;if(e<y&&e>T){const t=1/Math.sqrt(e);d*=t,w*=t,S*=t}}l[o+0]=d,l[o+1]=w,l[o+2]=S,o+=c}else for(let i=0;i<d;++i){const r=3*e[i],n=t[r],s=t[r+1],d=t[r+2];let w=u*n+m*s+g*d,S=h*n+f*s+x*d,M=p*n+v*s+b*d;if(_){const e=w*w+S*S+M*M;if(e<y&&e>T){const t=1/Math.sqrt(e);w*=t,S*=t,M*=t}}for(let e=0;e<a;++e)l[o+0]=w,l[o+1]=S,l[o+2]=M,o+=c}}function ke(e,t,i,r,o,a=1){if(!i)return void function(e,t,i,r,o=1){const a=i.typedBuffer,n=i.typedBufferStride,s=e.length;if(r*=n,1===o)for(let i=0;i<s;++i){const o=4*e[i];a[r]=t[o],a[r+1]=t[o+1],a[r+2]=t[o+2],a[r+3]=t[o+3],r+=n}else for(let i=0;i<s;++i){const s=4*e[i];for(let e=0;e<o;++e)a[r]=t[s],a[r+1]=t[s+1],a[r+2]=t[s+2],a[r+3]=t[s+3],r+=n}}(e,t,r,o,a);const n=i,l=r.typedBuffer,c=r.typedBufferStride,d=e.length,u=n[0],h=n[1],p=n[2],m=n[4],f=n[5],v=n[6],g=n[8],x=n[9],b=n[10],_=!(0,s.k)(n),T=1e-6,y=1-T;if(o*=c,1===a)for(let i=0;i<d;++i){const r=4*e[i],a=t[r],n=t[r+1],s=t[r+2],d=t[r+3];let w=u*a+m*n+g*s,S=h*a+f*n+x*s,M=p*a+v*n+b*s;if(_){const e=w*w+S*S+M*M;if(e<y&&e>T){const t=1/Math.sqrt(e);w*=t,S*=t,M*=t}}l[o+0]=w,l[o+1]=S,l[o+2]=M,l[o+3]=d,o+=c}else for(let i=0;i<d;++i){const r=4*e[i],n=t[r],s=t[r+1],d=t[r+2],w=t[r+3];let S=u*n+m*s+g*d,M=h*n+f*s+x*d,C=p*n+v*s+b*d;if(_){const e=S*S+M*M+C*C;if(e<y&&e>T){const t=1/Math.sqrt(e);S*=t,M*=t,C*=t}}for(let e=0;e<a;++e)l[o+0]=S,l[o+1]=M,l[o+2]=C,l[o+3]=w,o+=c}}function $e(e,t,i,r,o,a=1){const n=r.typedBuffer,s=r.typedBufferStride,l=e.length;if(o*=s,1===a){if(4===i)for(let i=0;i<l;++i){const r=4*e[i];n[o]=t[r],n[o+1]=t[r+1],n[o+2]=t[r+2],n[o+3]=t[r+3],o+=s}else if(3===i)for(let i=0;i<l;++i){const r=3*e[i];n[o]=t[r],n[o+1]=t[r+1],n[o+2]=t[r+2],n[o+3]=255,o+=s}}else if(4===i)for(let i=0;i<l;++i){const r=4*e[i];for(let e=0;e<a;++e)n[o]=t[r],n[o+1]=t[r+1],n[o+2]=t[r+2],n[o+3]=t[r+3],o+=s}else if(3===i)for(let i=0;i<l;++i){const r=3*e[i];for(let e=0;e<a;++e)n[o]=t[r],n[o+1]=t[r+1],n[o+2]=t[r+2],n[o+3]=255,o+=s}}var qe=i(36663),je=i(5885),Xe=i(99163),Ze=i(5664),Ke=i(55994),Ye=i(73393),Qe=i(3864),Je=i(20105),et=i(12664),tt=i(5331);const it=(0,i(64790).c)();class rt{constructor(e,t){this._module=e,this._loadModule=t}get(){return this._module}async reload(){return this._module=await this._loadModule(),this._module}}function ot(e={}){return(t,i)=>{var r,o;t._parameterNames=null!=(r=t._parameterNames)?r:[],t._parameterNames.push(i);const a=t._parameterNames.length-1,n=e.count||2,s=Math.ceil(Math.log2(n)),l=null!=(o=t._parameterBits)?o:[0];let c=0;for(;l[c]+s>16;)c++,c>=l.length&&l.push(0);t._parameterBits=l;const d=l[c],u=(1<<s)-1<<d;l[c]+=s,Object.defineProperty(t,i,{get(){return this[a]},set(e){if(this[a]!==e&&(this[a]=e,this._keyDirty=!0,this._parameterBits[c]=this._parameterBits[c]&~u|+e<<d&u,"number"!=typeof e&&"boolean"!=typeof e))throw"Configuration value for "+i+" must be boolean or number, got "+typeof e}})}}var at=i(6174),nt=i(69002);class st extends nt.${constructor(e,t,i){super(e,t.generateSource("vertex"),t.generateSource("fragment"),i),this._textures=new Map,this._freeTextureUnits=new C.Z({deallocator:null}),this._fragmentUniforms=(0,at.hZ)()?t.fragmentUniforms.entries:null}stop(){this._textures.clear(),this._freeTextureUnits.clear()}bindTexture(e,t){if((0,o.Wi)(e)||null==e.glName){const e=this._textures.get(t);return e&&(this._context.bindTexture(null,e.unit),this._freeTextureUnit(e),this._textures.delete(t)),null}let i=this._textures.get(t);return null==i?(i=this._allocTextureUnit(e),this._textures.set(t,i)):i.texture=e,this._context.useProgram(this),this.setUniform1i(t,i.unit),this._context.bindTexture(e,i.unit),i.unit}rebindTextures(){this._context.useProgram(this),this._textures.forEach(((e,t)=>{this._context.bindTexture(e.texture,e.unit),this.setUniform1i(t,e.unit)})),(0,o.pC)(this._fragmentUniforms)&&this._fragmentUniforms.forEach((e=>{if(("sampler2D"===e.type||"samplerCube"===e.type)&&!this._textures.has(e.name))throw new Error(`Texture sampler ${e.name} has no bound texture`)}))}_allocTextureUnit(e){return{texture:e,unit:0===this._freeTextureUnits.length?this._textures.size:this._freeTextureUnits.pop()}}_freeTextureUnit(e){this._freeTextureUnits.push(e.unit)}}const lt={mask:255},ct={function:{func:519,ref:2,mask:2},operation:{fail:7680,zFail:7680,zPass:0}},dt={function:{func:519,ref:2,mask:2},operation:{fail:7680,zFail:7680,zPass:7681}};var ut=i(45584),ht=i(17346);class pt extends class{constructor(e,t,i=(()=>this.dispose())){this.release=i,t&&(this._config=t.snapshot()),this._program=this.initializeProgram(e),this._pipeline=this.initializePipeline(e)}dispose(){this._program=(0,o.O3)(this._program),this._pipeline=this._config=null}reload(e){(0,o.O3)(this._program),this._program=this.initializeProgram(e)}get program(){return this._program}get key(){return this._config.key}get configuration(){return this._config}bindPass(e,t){}bindMaterial(e,t){}bindDraw(e){}bindPipelineState(e,t=null,i){e.setPipelineState(this.getPipelineState(t,i))}ensureAttributeLocations(e){this.program.assertCompatibleVertexAttributeLocations(e)}get primitiveType(){return 4}getPipelineState(e,t){return this._pipeline}}{initializeProgram(e){const t=pt.shader.get(),i=this.configuration,r=t.build({OITEnabled:0===i.transparencyPassType,output:i.output,viewingMode:e.viewingMode,receiveShadows:i.receiveShadows,slicePlaneEnabled:i.slicePlaneEnabled,sliceHighlightDisabled:i.sliceHighlightDisabled,sliceEnabledForVertexPrograms:!1,symbolColor:i.symbolColors,vvSize:i.vvSize,vvColor:i.vvColor,vvInstancingEnabled:!0,instanced:i.instanced,instancedColor:i.instancedColor,instancedDoublePrecision:i.instancedDoublePrecision,pbrMode:i.usePBR?i.isSchematic?2:1:0,hasMetalnessAndRoughnessTexture:i.hasMetalnessAndRoughnessTexture,hasEmissionTexture:i.hasEmissionTexture,hasOcclusionTexture:i.hasOcclusionTexture,hasNormalTexture:i.hasNormalTexture,hasColorTexture:i.hasColorTexture,receiveAmbientOcclusion:i.receiveAmbientOcclusion,useCustomDTRExponentForWater:!1,normalType:i.normalsTypeDerivate?3:0,doubleSidedMode:i.doubleSidedMode,vertexTangents:i.vertexTangents,attributeTextureCoordinates:i.hasMetalnessAndRoughnessTexture||i.hasEmissionTexture||i.hasOcclusionTexture||i.hasNormalTexture||i.hasColorTexture?1:0,textureAlphaPremultiplied:i.textureAlphaPremultiplied,attributeColor:i.vertexColors,screenSizePerspectiveEnabled:i.screenSizePerspective,verticalOffsetEnabled:i.verticalOffset,offsetBackfaces:i.offsetBackfaces,doublePrecisionRequiresObfuscation:(0,tt.I)(e.rctx),alphaDiscardMode:i.alphaDiscardMode,supportsTextureAtlas:!1,multipassTerrainEnabled:i.multipassTerrainEnabled,cullAboveGround:i.cullAboveGround});return new st(e.rctx,r,re)}bindPass(e,t){var i,r;!function(e,t){e.setUniformMatrix4fv("proj",t)}(this.program,t.camera.projectionMatrix);const o=this.configuration.output;(1===this.configuration.output||t.multipassTerrainEnabled||3===o)&&this.program.setUniform2fv("cameraNearFar",t.camera.nearFar),t.multipassTerrainEnabled&&(this.program.setUniform2fv("inverseViewport",t.inverseViewport),(0,Ye.p)(this.program,t)),7===o&&(this.program.setUniform1f("opacity",e.opacity),this.program.setUniform1f("layerOpacity",e.layerOpacity),this.program.setUniform4fv("externalColor",e.externalColor),this.program.setUniform1i("colorMixMode",pe.FZ[e.colorMixMode])),0===o?(t.lighting.setUniforms(this.program,!1),this.program.setUniform3fv("ambient",e.ambient),this.program.setUniform3fv("diffuse",e.diffuse),this.program.setUniform4fv("externalColor",e.externalColor),this.program.setUniform1i("colorMixMode",pe.FZ[e.colorMixMode]),this.program.setUniform1f("opacity",e.opacity),this.program.setUniform1f("layerOpacity",e.layerOpacity),this.configuration.usePBR&&(0,Qe.nW)(this.program,e,this.configuration.isSchematic)):4===o&&(0,Ke.wW)(this.program,t),(0,et.uj)(this.program,e),(0,Ze.Mo)(this.program,e,t),(0,pe.bj)(e.screenSizePerspective,this.program,"screenSizePerspectiveAlignment"),2!==e.textureAlphaMode&&3!==e.textureAlphaMode||this.program.setUniform1f("textureAlphaCutoff",e.textureAlphaCutoff),null==(i=t.shadowMap)||i.bind(this.program),null==(r=t.ssaoHelper)||r.bind(this.program,t.camera)}bindDraw(e){const t=this.configuration.instancedDoublePrecision?(0,d.f)(e.camera.viewInverseTransposeMatrix[3],e.camera.viewInverseTransposeMatrix[7],e.camera.viewInverseTransposeMatrix[11]):e.origin;(function(e,t,i){(0,s.a)(it,i,t),e.setUniform3fv("localOrigin",t),e.setUniformMatrix4fv("view",it)})(this.program,t,e.camera.viewMatrix),this.program.rebindTextures(),(0===this.configuration.output||7===this.configuration.output||1===this.configuration.output&&this.configuration.screenSizePerspective||2===this.configuration.output&&this.configuration.screenSizePerspective||4===this.configuration.output&&this.configuration.screenSizePerspective)&&function(e,t,i){e.setUniform3f("camPos",i[3]-t[0],i[7]-t[1],i[11]-t[2])}(this.program,t,e.camera.viewInverseTransposeMatrix),2===this.configuration.output&&this.program.setUniformMatrix4fv("viewNormal",e.camera.viewInverseTransposeMatrix),this.configuration.instancedDoublePrecision&&Xe.f.bindCustomOrigin(this.program,t),(0,je.Vv)(this.program,this.configuration,e.slicePlane,t),0===this.configuration.output&&(0,Je.vL)(this.program,e,t)}setPipeline(e,t){const i=this.configuration,r=3===e,o=2===e;return(0,ht.sm)({blending:0!==i.output&&7!==i.output||!i.transparent?null:r?fe.wu:(0,fe.$L)(e),culling:mt(i)&&(0,ht.zp)(i.cullFace),depthTest:{func:(0,fe.$x)(e)},depthWrite:r||o?i.writeDepth&&ht.LZ:null,colorWrite:ht.BK,stencilWrite:i.sceneHasOcludees?lt:null,stencilTest:i.sceneHasOcludees?t?dt:ct:null,polygonOffset:r||o?null:(0,fe.je)(i.enableOffset)})}initializePipeline(){return this._occludeePipelineState=this.setPipeline(this.configuration.transparencyPassType,!0),this.setPipeline(this.configuration.transparencyPassType,!1)}getPipelineState(e,t){return t?this._occludeePipelineState:super.getPipelineState(e,t)}}function mt(e){return e.cullFace?0!==e.cullFace:!e.slicePlaneEnabled&&!e.transparent&&!e.doubleSidedMode}pt.shader=new rt(ut.D,(()=>i.e(3197).then(i.bind(i,13197))));class ft extends class{constructor(){this._key="",this._keyDirty=!1,this._parameterBits=this._parameterBits?this._parameterBits.map((()=>0)):[],this._parameterNames||(this._parameterNames=[])}get key(){return this._keyDirty&&(this._keyDirty=!1,this._key=String.fromCharCode.apply(String,this._parameterBits)),this._key}snapshot(){const e=this._parameterNames,t={key:this.key};for(const i of e)t[i]=this[i];return t}}{constructor(){super(...arguments),this.output=0,this.alphaDiscardMode=1,this.doubleSidedMode=0,this.isSchematic=!1,this.vertexColors=!1,this.offsetBackfaces=!1,this.symbolColors=!1,this.vvSize=!1,this.vvColor=!1,this.verticalOffset=!1,this.receiveShadows=!1,this.slicePlaneEnabled=!1,this.sliceHighlightDisabled=!1,this.receiveAmbientOcclusion=!1,this.screenSizePerspective=!1,this.textureAlphaPremultiplied=!1,this.hasColorTexture=!1,this.usePBR=!1,this.hasMetalnessAndRoughnessTexture=!1,this.hasEmissionTexture=!1,this.hasOcclusionTexture=!1,this.hasNormalTexture=!1,this.instanced=!1,this.instancedColor=!1,this.instancedDoublePrecision=!1,this.vertexTangents=!1,this.normalsTypeDerivate=!1,this.writeDepth=!0,this.sceneHasOcludees=!1,this.transparent=!1,this.enableOffset=!0,this.cullFace=0,this.transparencyPassType=3,this.multipassTerrainEnabled=!1,this.cullAboveGround=!1}}(0,qe._)([ot({count:8})],ft.prototype,"output",void 0),(0,qe._)([ot({count:4})],ft.prototype,"alphaDiscardMode",void 0),(0,qe._)([ot({count:3})],ft.prototype,"doubleSidedMode",void 0),(0,qe._)([ot()],ft.prototype,"isSchematic",void 0),(0,qe._)([ot()],ft.prototype,"vertexColors",void 0),(0,qe._)([ot()],ft.prototype,"offsetBackfaces",void 0),(0,qe._)([ot()],ft.prototype,"symbolColors",void 0),(0,qe._)([ot()],ft.prototype,"vvSize",void 0),(0,qe._)([ot()],ft.prototype,"vvColor",void 0),(0,qe._)([ot()],ft.prototype,"verticalOffset",void 0),(0,qe._)([ot()],ft.prototype,"receiveShadows",void 0),(0,qe._)([ot()],ft.prototype,"slicePlaneEnabled",void 0),(0,qe._)([ot()],ft.prototype,"sliceHighlightDisabled",void 0),(0,qe._)([ot()],ft.prototype,"receiveAmbientOcclusion",void 0),(0,qe._)([ot()],ft.prototype,"screenSizePerspective",void 0),(0,qe._)([ot()],ft.prototype,"textureAlphaPremultiplied",void 0),(0,qe._)([ot()],ft.prototype,"hasColorTexture",void 0),(0,qe._)([ot()],ft.prototype,"usePBR",void 0),(0,qe._)([ot()],ft.prototype,"hasMetalnessAndRoughnessTexture",void 0),(0,qe._)([ot()],ft.prototype,"hasEmissionTexture",void 0),(0,qe._)([ot()],ft.prototype,"hasOcclusionTexture",void 0),(0,qe._)([ot()],ft.prototype,"hasNormalTexture",void 0),(0,qe._)([ot()],ft.prototype,"instanced",void 0),(0,qe._)([ot()],ft.prototype,"instancedColor",void 0),(0,qe._)([ot()],ft.prototype,"instancedDoublePrecision",void 0),(0,qe._)([ot()],ft.prototype,"vertexTangents",void 0),(0,qe._)([ot()],ft.prototype,"normalsTypeDerivate",void 0),(0,qe._)([ot()],ft.prototype,"writeDepth",void 0),(0,qe._)([ot()],ft.prototype,"sceneHasOcludees",void 0),(0,qe._)([ot()],ft.prototype,"transparent",void 0),(0,qe._)([ot()],ft.prototype,"enableOffset",void 0),(0,qe._)([ot({count:3})],ft.prototype,"cullFace",void 0),(0,qe._)([ot({count:4})],ft.prototype,"transparencyPassType",void 0),(0,qe._)([ot()],ft.prototype,"multipassTerrainEnabled",void 0),(0,qe._)([ot()],ft.prototype,"cullAboveGround",void 0);var vt=i(60926);class gt extends pt{initializeProgram(e){const t=gt.shader.get(),i=this.configuration,r=t.build({OITEnabled:0===i.transparencyPassType,output:i.output,viewingMode:e.viewingMode,receiveShadows:i.receiveShadows,slicePlaneEnabled:i.slicePlaneEnabled,sliceHighlightDisabled:i.sliceHighlightDisabled,sliceEnabledForVertexPrograms:!1,symbolColor:i.symbolColors,vvSize:i.vvSize,vvColor:i.vvColor,vvInstancingEnabled:!0,instanced:i.instanced,instancedColor:i.instancedColor,instancedDoublePrecision:i.instancedDoublePrecision,pbrMode:i.usePBR?1:0,hasMetalnessAndRoughnessTexture:!1,hasEmissionTexture:!1,hasOcclusionTexture:!1,hasNormalTexture:!1,hasColorTexture:i.hasColorTexture,receiveAmbientOcclusion:i.receiveAmbientOcclusion,useCustomDTRExponentForWater:!1,normalType:0,doubleSidedMode:2,vertexTangents:!1,attributeTextureCoordinates:i.hasColorTexture?1:0,textureAlphaPremultiplied:i.textureAlphaPremultiplied,attributeColor:i.vertexColors,screenSizePerspectiveEnabled:i.screenSizePerspective,verticalOffsetEnabled:i.verticalOffset,offsetBackfaces:i.offsetBackfaces,doublePrecisionRequiresObfuscation:(0,tt.I)(e.rctx),alphaDiscardMode:i.alphaDiscardMode,supportsTextureAtlas:!1,multipassTerrainEnabled:i.multipassTerrainEnabled,cullAboveGround:i.cullAboveGround});return new st(e.rctx,r,re)}}gt.shader=new rt(vt.R,(()=>i.e(7578).then(i.bind(i,67578))));class xt extends me{constructor(e){super(e,_t),this.supportsEdges=!0,this.techniqueConfig=new ft,this.vertexBufferLayout=function(e){const t=e.textureId||e.normalTextureId||e.metallicRoughnessTextureId||e.emissiveTextureId||e.occlusionTextureId,i=(0,ue.U$)().vec3f("position").vec3f("normal");return e.vertexTangents&&i.vec4f("tangent"),t&&i.vec2f("uv0"),e.vertexColors&&i.vec4u8("color"),e.symbolColors&&i.vec4u8("symbolColor"),i}(this.parameters),this.instanceBufferLayout=e.instanced?function(e){let t=(0,ue.U$)();return t=e.instancedDoublePrecision?t.vec3f("modelOriginHi").vec3f("modelOriginLo").mat3f("model").mat3f("modelNormal"):t.mat4f("model").mat4f("modelNormal"),e.instanced&&e.instanced.indexOf("color")>-1&&(t=t.vec4f("instanceColor")),e.instanced&&e.instanced.indexOf("featureAttribute")>-1&&(t=t.vec4f("instanceFeatureAttribute")),t}(this.parameters):null}isVisibleInPass(e){return 4!==e&&6!==e&&7!==e||this.parameters.castShadows}isVisible(){const e=this.parameters;if(!super.isVisible()||0===e.layerOpacity)return!1;const t=e.instanced,i=e.vertexColors,r=e.symbolColors,o=!!t&&t.indexOf("color")>-1,a=e.vvColorEnabled,n="replace"===e.colorMixMode,s=e.opacity>0,l=e.externalColor&&e.externalColor[3]>0;return i&&(o||a||r)?!!n||s:i?n?l:s:o||a||r?!!n||s:n?l:s}getTechniqueConfig(e,t){return this.techniqueConfig.output=e,this.techniqueConfig.hasNormalTexture=!!this.parameters.normalTextureId,this.techniqueConfig.hasColorTexture=!!this.parameters.textureId,this.techniqueConfig.vertexTangents=this.parameters.vertexTangents,this.techniqueConfig.instanced=!!this.parameters.instanced,this.techniqueConfig.instancedDoublePrecision=this.parameters.instancedDoublePrecision,this.techniqueConfig.vvSize=this.parameters.vvSizeEnabled,this.techniqueConfig.verticalOffset=null!==this.parameters.verticalOffset,this.techniqueConfig.screenSizePerspective=null!==this.parameters.screenSizePerspective,this.techniqueConfig.slicePlaneEnabled=this.parameters.slicePlaneEnabled,this.techniqueConfig.sliceHighlightDisabled=this.parameters.sliceHighlightDisabled,this.techniqueConfig.alphaDiscardMode=this.parameters.textureAlphaMode,this.techniqueConfig.normalsTypeDerivate="screenDerivative"===this.parameters.normals,this.techniqueConfig.transparent=this.parameters.transparent,this.techniqueConfig.writeDepth=this.parameters.writeDepth,this.techniqueConfig.sceneHasOcludees=this.parameters.sceneHasOcludees,this.techniqueConfig.cullFace=this.parameters.slicePlaneEnabled?0:this.parameters.cullFace,this.techniqueConfig.multipassTerrainEnabled=t.multipassTerrainEnabled,this.techniqueConfig.cullAboveGround=t.cullAboveGround,0!==e&&7!==e||(this.techniqueConfig.vertexColors=this.parameters.vertexColors,this.techniqueConfig.symbolColors=this.parameters.symbolColors,this.parameters.treeRendering?this.techniqueConfig.doubleSidedMode=2:this.techniqueConfig.doubleSidedMode=this.parameters.doubleSided&&"normal"===this.parameters.doubleSidedType?1:this.parameters.doubleSided&&"winding-order"===this.parameters.doubleSidedType?2:0,this.techniqueConfig.instancedColor=!!this.parameters.instanced&&this.parameters.instanced.indexOf("color")>-1,this.techniqueConfig.receiveShadows=this.parameters.receiveShadows&&this.parameters.shadowMappingEnabled,this.techniqueConfig.receiveAmbientOcclusion=!!t.ssaoEnabled&&this.parameters.receiveSSAO,this.techniqueConfig.vvColor=this.parameters.vvColorEnabled,this.techniqueConfig.textureAlphaPremultiplied=!!this.parameters.textureAlphaPremultiplied,this.techniqueConfig.usePBR=this.parameters.usePBR,this.techniqueConfig.hasMetalnessAndRoughnessTexture=!!this.parameters.metallicRoughnessTextureId,this.techniqueConfig.hasEmissionTexture=!!this.parameters.emissiveTextureId,this.techniqueConfig.hasOcclusionTexture=!!this.parameters.occlusionTextureId,this.techniqueConfig.offsetBackfaces=!(!this.parameters.transparent||!this.parameters.offsetTransparentBackfaces),this.techniqueConfig.isSchematic=this.parameters.usePBR&&this.parameters.isSchematic,this.techniqueConfig.transparencyPassType=t.transparencyPassType,this.techniqueConfig.enableOffset=t.camera.relativeElevation<fe.ve),this.techniqueConfig}intersect(e,t,i,r,a,n,s){if(null!==this.parameters.verticalOffset){const e=r.camera;(0,c.s)(At,i[12],i[13],i[14]);let t=null;switch(r.viewingMode){case 1:t=(0,c.n)(Mt,At);break;case 2:t=(0,c.g)(Mt,St)}let o=0;if(null!==this.parameters.verticalOffset){const i=(0,c.f)(Pt,At,e.eye),r=(0,c.l)(i),a=(0,c.a)(i,i,1/r);let n=null;this.parameters.screenSizePerspective&&(n=(0,c.d)(t,a)),o+=(0,pe.Hx)(e,r,this.parameters.verticalOffset,n,this.parameters.screenSizePerspective)}(0,c.a)(t,t,o),(0,c.t)(Ct,t,r.transform.inverseRotation),a=(0,c.f)(yt,a,Ct),n=(0,c.f)(wt,n,Ct)}var l;(0,pe.Bw)(e,t,r,a,n,(l=r.verticalOffset,(0,o.pC)(l)?(Ne.offset=l,Ne):null),s)}requiresSlot(e){return e===(this.parameters.transparent?this.parameters.writeDepth?4:7:2)||20===e}createGLMaterial(e){return 0===e.output||7===e.output||1===e.output||2===e.output||3===e.output||4===e.output?new bt(e):null}createBufferWriter(){return new Tt(this.vertexBufferLayout,this.instanceBufferLayout)}}class bt extends class extends class{constructor(e){this._material=e.material,this._techniqueRep=e.techniqueRep,this._output=e.output}dispose(){this._techniqueRep.release(this._technique)}get technique(){return this._technique}ensureTechnique(e,t,i=this._output){return this._technique=this._techniqueRep.releaseAndAcquire(e,this._material.getTechniqueConfig(i,t),this._technique),this._technique}ensureResources(e){return 2}}{constructor(e){super(e),this._numLoading=0,this._disposed=!1,this._textureRepository=e.textureRep,this._textureId=e.textureId,this._acquire(e.textureId).then((e=>this._texture=e)),this._acquire(e.normalTextureId).then((e=>this._textureNormal=e)),this._acquire(e.emissiveTextureId).then((e=>this._textureEmissive=e)),this._acquire(e.occlusionTextureId).then((e=>this._textureOcclusion=e)),this._acquire(e.metallicRoughnessTextureId).then((e=>this._textureMetallicRoughness=e))}dispose(){this._texture=(0,o.RY)(this._texture),this._textureNormal=(0,o.RY)(this._textureNormal),this._textureEmissive=(0,o.RY)(this._textureEmissive),this._textureOcclusion=(0,o.RY)(this._textureOcclusion),this._textureMetallicRoughness=(0,o.RY)(this._textureMetallicRoughness),this._disposed=!0}ensureResources(e){return 0===this._numLoading?2:1}updateTexture(e){((0,o.Wi)(this._texture)||e!==this._texture.id)&&(this._texture=(0,o.RY)(this._texture),this._textureId=e,this._acquire(this._textureId).then((e=>this._texture=e)))}bindTextures(e){(0,o.pC)(this._texture)&&e.bindTexture(this._texture.glTexture,"tex"),(0,o.pC)(this._textureNormal)&&e.bindTexture(this._textureNormal.glTexture,"normalTexture"),(0,o.pC)(this._textureEmissive)&&e.bindTexture(this._textureEmissive.glTexture,"texEmission"),(0,o.pC)(this._textureOcclusion)&&e.bindTexture(this._textureOcclusion.glTexture,"texOcclusion"),(0,o.pC)(this._textureMetallicRoughness)&&e.bindTexture(this._textureMetallicRoughness.glTexture,"texMetallicRoughness")}bindTextureScale(e){const t=(0,o.pC)(this._texture)?this._texture.glTexture:null;(0,o.pC)(t)&&t.descriptor.textureCoordinateScaleFactor?e.setUniform2fv("textureCoordinateScaleFactor",t.descriptor.textureCoordinateScaleFactor):e.setUniform2f("textureCoordinateScaleFactor",1,1)}_acquire(e){return(0,o.Wi)(e)?Promise.resolve(null):(++this._numLoading,this._textureRepository.acquire(e).then((e=>this._disposed?((0,o.RY)(e),null):e)).finally((()=>--this._numLoading)))}}{constructor(e){super({...e,...e.material.parameters})}updateParameters(e){const t=this._material.parameters;return this.updateTexture(t.textureId),this.ensureTechnique(t.treeRendering?gt:pt,e)}_updateShadowState(e){e.shadowMappingEnabled!==this._material.parameters.shadowMappingEnabled&&this._material.setParameters({shadowMappingEnabled:e.shadowMappingEnabled})}_updateOccludeeState(e){e.hasOccludees!==this._material.parameters.sceneHasOcludees&&this._material.setParameters({sceneHasOcludees:e.hasOccludees})}beginSlot(e){return 0!==this._output&&7!==this._output||(this._updateShadowState(e),this._updateOccludeeState(e)),this.updateParameters(e)}bind(e,t){t.bindPass(this._material.parameters,e),this.bindTextures(t.program)}}const _t={textureId:void 0,initTextureTransparent:!1,isSchematic:!1,usePBR:!1,normalTextureId:void 0,vertexTangents:!1,occlusionTextureId:void 0,emissiveTextureId:void 0,metallicRoughnessTextureId:void 0,emissiveFactor:[0,0,0],mrrFactors:[0,1,.5],ambient:[.2,.2,.2],diffuse:[.8,.8,.8],externalColor:[1,1,1,1],colorMixMode:"multiply",opacity:1,layerOpacity:1,vertexColors:!1,symbolColors:!1,doubleSided:!1,doubleSidedType:"normal",cullFace:2,instanced:void 0,instancedDoublePrecision:!1,normals:"default",receiveSSAO:!0,receiveShadows:!0,castShadows:!0,shadowMappingEnabled:!1,verticalOffset:null,screenSizePerspective:null,slicePlaneEnabled:!1,sliceHighlightDisabled:!1,offsetTransparentBackfaces:!1,vvSizeEnabled:!1,vvSizeMinSize:[1,1,1],vvSizeMaxSize:[100,100,100],vvSizeOffset:[0,0,0],vvSizeFactor:[1,1,1],vvSizeValue:[1,1,1],vvColorEnabled:!1,vvColorValues:[0,0,0,0,0,0,0,0],vvColorColors:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],vvSymbolAnchor:[0,0,0],vvSymbolRotationMatrix:(0,n.c)(),transparent:!1,writeDepth:!0,textureAlphaMode:0,textureAlphaCutoff:he.F,textureAlphaPremultiplied:!1,sceneHasOcludees:!1,renderOccluded:1};class Tt{constructor(e,t){this.vertexBufferLayout=e,this.instanceBufferLayout=t}allocate(e){return this.vertexBufferLayout.createBuffer(e)}elementCount(e){return e.indices.get("position").length}write(e,t,i,r){!function(e,t,i,r,o,a){for(const n of t.fieldNames){const t=e.vertexAttributes.get(n),s=e.indices.get(n);if(t&&s)switch(n){case"position":{(0,A.hu)(3===t.size);const e=o.getField(n,h.ct);e&&Ue(s,t.data,i,e,a);break}case"normal":{(0,A.hu)(3===t.size);const e=o.getField(n,h.ct);e&&Ge(s,t.data,r,e,a);break}case"uv0":{(0,A.hu)(2===t.size);const e=o.getField(n,h.Eu);e&&Ve(s,t.data,e,a);break}case"color":{(0,A.hu)(3===t.size||4===t.size);const e=o.getField(n,h.mc);e&&$e(s,t.data,t.size,e,a);break}case"symbolColor":{(0,A.hu)(3===t.size||4===t.size);const e=o.getField(n,h.mc);e&&$e(s,t.data,t.size,e,a);break}case"tangent":{(0,A.hu)(4===t.size);const e=o.getField(n,h.ek);e&&ke(s,t.data,r,e,a);break}}}}(t,this.vertexBufferLayout,e.transformation,e.invTranspTransformation,i,r)}}const yt=(0,d.c)(),wt=(0,d.c)(),St=(0,d.f)(0,0,1),Mt=(0,d.c)(),Ct=(0,d.c)(),At=(0,d.c)(),Pt=(0,d.c)(),Ot=y.Z.getLogger("esri.views.3d.layers.graphics.objectResourceUtils");function Ft(e){throw new T.Z("",`Request for object resource failed: ${e}`)}function It(e){const t=e.params,i=t.topology;let r=!0;switch(t.vertexAttributes||(Ot.warn("Geometry must specify vertex attributes"),r=!1),t.topology){case"PerAttributeArray":break;case"Indexed":case null:case void 0:{const e=t.faces;if(e){if(t.vertexAttributes)for(const i in t.vertexAttributes){const t=e[i];t&&t.values?(null!=t.valueType&&"UInt32"!==t.valueType&&(Ot.warn(`Unsupported indexed geometry indices type '${t.valueType}', only UInt32 is currently supported`),r=!1),null!=t.valuesPerElement&&1!==t.valuesPerElement&&(Ot.warn(`Unsupported indexed geometry values per element '${t.valuesPerElement}', only 1 is currently supported`),r=!1)):(Ot.warn(`Indexed geometry does not specify face indices for '${i}' attribute`),r=!1)}}else Ot.warn("Indexed geometries must specify faces"),r=!1;break}default:Ot.warn(`Unsupported topology '${i}'`),r=!1}e.params.material||(Ot.warn("Geometry requires material"),r=!1);const o=e.params.vertexAttributes;for(const e in o)o[e].values||(Ot.warn("Geometries with externally defined attributes are not yet supported"),r=!1);return r}function Ht(e){const t=(0,u.cS)();return e.forEach((e=>{const i=e.boundingInfo;(0,o.pC)(i)&&((0,u.pp)(t,i.getBBMin()),(0,u.pp)(t,i.getBBMax()))})),t}async function Dt(e,t){const i=[];for(const r in e){const a=e[r],n=a.images[0].data;if(!n){Ot.warn("Externally referenced texture data is not yet supported");continue}const s=a.encoding+";base64,"+n,l="/textureDefinitions/"+r,c="rgba"===a.channels?a.alphaChannelUsage||"transparency":"none",d={noUnpackFlip:!0,wrap:{s:10497,t:10497},preMultiplyAlpha:1!==zt(c)},u=(0,o.pC)(t)&&t.disableTextures?Promise.resolve(null):(0,M.t)(s,t);i.push(u.then((e=>({refId:l,image:e,params:d,alphaChannelUsage:c}))))}const r=await Promise.all(i),a={};for(const e of r)a[e.refId]=e;return a}function zt(e){switch(e){case"mask":return 2;case"maskAndTransparency":return 3;case"none":return 1;default:return 0}}function Et(e){const t=e.params;return{id:1,material:t.material,texture:t.texture,region:t.texture}}const Lt=new S.G(1,2,"wosr");var Rt=i(14634),Nt=i(385),Bt=i(32101),Vt=i(14789);async function Wt(e,t){const i=Ut((0,r.pJ)(e));if("wosr"===i.fileType){const e=await(t.cache?t.cache.loadWOSR(i.url,t):async function(e,t){const i=await async function(e,t){const i=(0,o.pC)(t)&&t.streamDataRequester;if(i)return async function(e,t,i){const r=await(0,_.q6)(t.request(e,"json",i));if(!0===r.ok)return r.value;(0,w.r9)(r.error),Ft(r.error.details.url)}(e,i,t);const r=await(0,_.q6)((0,b.default)(e,(0,o.Wg)(t)));if(!0===r.ok)return r.value.data;(0,w.r9)(r.error),Ft(r.error)}(e,t);return{resource:i,textures:await Dt(i.textureDefinitions,t)}}(i.url,t)),r=function(e,t){const i=[],r=[],a=[],n=[],s=e.resource,l=S.G.parse(s.version||"1.0","wosr");Lt.validate(l);const c=s.model.name,u=s.model.geometries,h=s.materialDefinitions,p=e.textures;let m=0;const f=new Map;for(let e=0;e<u.length;e++){const s=u[e];if(!It(s))continue;const l=Et(s),c=s.params.vertexAttributes,v=[];for(const e in c){const t=c[e],i=t.values;v.push([e,{data:i,size:t.valuesPerElement,exclusive:!0}])}const g=[];if("PerAttributeArray"!==s.params.topology){const e=s.params.faces;for(const t in e)g.push([t,new Uint32Array(e[t].values)])}const x=p&&p[l.texture];if(x&&!f.has(l.texture)){const{image:e,params:t}=x,i=new de(e,t);n.push(i),f.set(l.texture,i)}const b=f.get(l.texture),_=b?b.id:void 0;let T=a[l.material]?a[l.material][l.texture]:null;if(!T){const e=h[l.material.substring(l.material.lastIndexOf("/")+1)].params;1===e.transparency&&(e.transparency=0);const i=x&&x.alphaChannelUsage,r=e.transparency>0||"transparency"===i||"maskAndTransparency"===i,n=x?zt(x.alphaChannelUsage):void 0,s={ambient:(0,d.d)(e.diffuse),diffuse:(0,d.d)(e.diffuse),opacity:1-(e.transparency||0),transparent:r,textureAlphaMode:n,textureAlphaCutoff:.33,textureId:_,initTextureTransparent:!0,doubleSided:!0,cullFace:0,colorMixMode:e.externalColorMixMode||"tint",textureAlphaPremultiplied:!!x&&!!x.params.preMultiplyAlpha};(0,o.pC)(t)&&t.materialParamsMixin&&Object.assign(s,t.materialParamsMixin),T=new xt(s),a[l.material]||(a[l.material]={}),a[l.material][l.texture]=T}r.push(T);const y=new D(v,g);m+=g.position?g.position.length:0,i.push(y)}return{name:c,stageResources:{textures:n,materials:r,geometries:i},pivotOffset:s.model.pivotOffset,boundingBox:Ht(i),numberOfVertices:m,lodThreshold:null}}(e,t);return{lods:[r],referenceBoundingBox:r.boundingBox,isEsriSymbolResource:!1,isWosr:!0,remove:e.remove}}const a=await(t.cache?t.cache.loadGLTF(i.url,t,t.usePBR):(0,g.z)(new v.C(t.streamDataRequester),i.url,t,t.usePBR)),n=(0,o.U2)(a.model.meta,"ESRI_proxyEllipsoid");a.meta.isEsriSymbolResource&&(0,o.pC)(n)&&-1!==a.meta.uri.indexOf("/RealisticTrees/")&&function(e,t){for(let i=0;i<e.model.lods.length;++i){const r=e.model.lods[i];e.customMeta.esriTreeRendering=!0;for(const a of r.parts){const r=a.attributes.normal;if((0,o.Wi)(r))return;const n=a.attributes.position,u=n.count,p=(0,d.c)(),m=(0,d.c)(),v=(0,d.c)(),g=(0,f.gS)(h.mc,u),x=(0,f.gS)(h.ct,u),b=(0,s.b)((0,l.c)(),a.transform);for(let o=0;o<u;o++){n.getVec(o,m),r.getVec(o,p),(0,c.m)(m,m,a.transform),(0,c.f)(v,m,t.center),(0,c.E)(v,v,t.radius);const s=v[2],l=(0,c.l)(v),d=Math.min(.45+.55*l*l,1);(0,c.E)(v,v,t.radius),(0,c.m)(v,v,b),(0,c.n)(v,v),i+1!==e.model.lods.length&&e.model.lods.length>1&&(0,c.e)(v,v,p,s>-1?.2:Math.min(-4*s-3.8,1)),x.setVec(o,v),g.set(o,0,255*d),g.set(o,1,255*d),g.set(o,2,255*d),g.set(o,3,255)}a.attributes.normal=x,a.attributes.color=g}}}(a,n);const u=a.meta.isEsriSymbolResource?{usePBR:t.usePBR,isSchematic:!1,treeRendering:a.customMeta.esriTreeRendering,mrrFactors:[0,1,.2]}:{usePBR:t.usePBR,isSchematic:!1,mrrFactors:[0,1,.5]},p={...t.materialParamsMixin,treeRendering:a.customMeta.esriTreeRendering};if(null!=i.specifiedLodIndex){const e=Gt(a,u,p,i.specifiedLodIndex);let t=e[0].boundingBox;return 0!==i.specifiedLodIndex&&(t=Gt(a,u,p,0)[0].boundingBox),{lods:e,referenceBoundingBox:t,isEsriSymbolResource:a.meta.isEsriSymbolResource,isWosr:!1,remove:a.remove}}const m=Gt(a,u,p);return{lods:m,referenceBoundingBox:m[0].boundingBox,isEsriSymbolResource:a.meta.isEsriSymbolResource,isWosr:!1,remove:a.remove}}function Ut(e){const t=e.match(/(.*\.(gltf|glb))(\?lod=([0-9]+))?$/);return t?{fileType:"gltf",url:t[1],specifiedLodIndex:null!=t[4]?Number(t[4]):null}:e.match(/(.*\.(json|json\.gz))$/)?{fileType:"wosr",url:e,specifiedLodIndex:null}:{fileType:"unknown",url:e,specifiedLodIndex:null}}function Gt(e,t,i,r){const s=e.model,l=(0,n.c)(),c=new Array,d=new Map,v=new Map;return s.lods.forEach(((e,n)=>{if(void 0!==r&&n!==r)return;const g={name:e.name,stageResources:{textures:new Array,materials:new Array,geometries:new Array},lodThreshold:(0,o.pC)(e.lodThreshold)?e.lodThreshold:null,pivotOffset:[0,0,0],numberOfVertices:0,boundingBox:(0,u.cS)()};c.push(g),e.parts.forEach((e=>{const r=e.material+(e.attributes.normal?"_normal":"")+(e.attributes.color?"_color":"")+(e.attributes.texCoord0?"_texCoord0":"")+(e.attributes.tangent?"_tangent":""),n=s.materials.get(e.material),c=(0,o.pC)(e.attributes.texCoord0),b=(0,o.pC)(e.attributes.normal),_=function(e){switch(e){case"BLEND":return 0;case"MASK":return 2;case"OPAQUE":case null:case void 0:return 1}}(n.alphaMode);if(!d.has(r)){if(c){if((0,o.pC)(n.textureColor)&&!v.has(n.textureColor)){const e=s.textures.get(n.textureColor),t={...e.parameters,preMultiplyAlpha:1!==_};v.set(n.textureColor,new de(e.data,t))}if((0,o.pC)(n.textureNormal)&&!v.has(n.textureNormal)){const e=s.textures.get(n.textureNormal);v.set(n.textureNormal,new de(e.data,e.parameters))}if((0,o.pC)(n.textureOcclusion)&&!v.has(n.textureOcclusion)){const e=s.textures.get(n.textureOcclusion);v.set(n.textureOcclusion,new de(e.data,e.parameters))}if((0,o.pC)(n.textureEmissive)&&!v.has(n.textureEmissive)){const e=s.textures.get(n.textureEmissive);v.set(n.textureEmissive,new de(e.data,e.parameters))}if((0,o.pC)(n.textureMetallicRoughness)&&!v.has(n.textureMetallicRoughness)){const e=s.textures.get(n.textureMetallicRoughness);v.set(n.textureMetallicRoughness,new de(e.data,e.parameters))}}const a=n.color[0]**(1/Rt.K),l=n.color[1]**(1/Rt.K),u=n.color[2]**(1/Rt.K),h=n.emissiveFactor[0]**(1/Rt.K),p=n.emissiveFactor[1]**(1/Rt.K),m=n.emissiveFactor[2]**(1/Rt.K),f=(0,o.pC)(n.textureColor)&&c?v.get(n.textureColor):null;d.set(r,new xt({...t,transparent:0===_,textureAlphaMode:_,textureAlphaCutoff:n.alphaCutoff,diffuse:[a,l,u],ambient:[a,l,u],opacity:n.opacity,doubleSided:n.doubleSided,doubleSidedType:"winding-order",cullFace:n.doubleSided?0:2,vertexColors:!!e.attributes.color,vertexTangents:!!e.attributes.tangent,normals:b?"default":"screenDerivative",castShadows:!0,receiveSSAO:!0,textureId:(0,o.pC)(f)?f.id:void 0,colorMixMode:n.colorMixMode,normalTextureId:(0,o.pC)(n.textureNormal)&&c?v.get(n.textureNormal).id:void 0,textureAlphaPremultiplied:(0,o.pC)(f)&&!!f.params.preMultiplyAlpha,occlusionTextureId:(0,o.pC)(n.textureOcclusion)&&c?v.get(n.textureOcclusion).id:void 0,emissiveTextureId:(0,o.pC)(n.textureEmissive)&&c?v.get(n.textureEmissive).id:void 0,metallicRoughnessTextureId:(0,o.pC)(n.textureMetallicRoughness)&&c?v.get(n.textureMetallicRoughness).id:void 0,emissiveFactor:[h,p,m],mrrFactors:[n.metallicFactor,n.roughnessFactor,t.mrrFactors[2]],isSchematic:!1,...i}))}const T=function(e,t){switch(t){case 4:return(0,x.nh)(e);case 5:return(0,x.DA)(e);case 6:return(0,x.jX)(e)}}(e.indices||e.attributes.position.count,e.primitiveType),y=e.attributes.position.count,w=(0,f.gS)(h.ct,y);(0,p.t)(w,e.attributes.position,e.transform);const S=[["position",{data:w.typedBuffer,size:w.elementCount,exclusive:!0}]],M=[["position",T]];if((0,o.pC)(e.attributes.normal)){const t=(0,f.gS)(h.ct,y);(0,a.a)(l,e.transform),(0,p.a)(t,e.attributes.normal,l),S.push(["normal",{data:t.typedBuffer,size:t.elementCount,exclusive:!0}]),M.push(["normal",T])}if((0,o.pC)(e.attributes.tangent)){const t=(0,f.gS)(h.ek,y);(0,a.a)(l,e.transform),(0,m.t)(t,e.attributes.tangent,l),S.push(["tangent",{data:t.typedBuffer,size:t.elementCount,exclusive:!0}]),M.push(["tangent",T])}if((0,o.pC)(e.attributes.texCoord0)){const t=(0,f.gS)(h.Eu,y);(0,Nt.n)(t,e.attributes.texCoord0),S.push(["uv0",{data:t.typedBuffer,size:t.elementCount,exclusive:!0}]),M.push(["uv0",T])}if((0,o.pC)(e.attributes.color)){const t=(0,f.gS)(h.mc,y);if(4===e.attributes.color.elementCount)e.attributes.color instanceof h.ek?(0,m.s)(t,e.attributes.color,255):e.attributes.color instanceof h.mc?(0,Bt.c)(t,e.attributes.color):e.attributes.color instanceof h.v6&&(0,m.s)(t,e.attributes.color,1/256);else{(0,Bt.f)(t,255,255,255,255);const i=new h.ne(t.buffer,0,4);e.attributes.color instanceof h.ct?(0,p.s)(i,e.attributes.color,255):e.attributes.color instanceof h.ne?(0,Vt.c)(i,e.attributes.color):e.attributes.color instanceof h.mw&&(0,p.s)(i,e.attributes.color,1/256)}S.push(["color",{data:t.typedBuffer,size:t.elementCount,exclusive:!0}]),M.push(["color",T])}const C=new D(S,M);g.stageResources.geometries.push(C),g.stageResources.materials.push(d.get(r)),c&&((0,o.pC)(n.textureColor)&&g.stageResources.textures.push(v.get(n.textureColor)),(0,o.pC)(n.textureNormal)&&g.stageResources.textures.push(v.get(n.textureNormal)),(0,o.pC)(n.textureOcclusion)&&g.stageResources.textures.push(v.get(n.textureOcclusion)),(0,o.pC)(n.textureEmissive)&&g.stageResources.textures.push(v.get(n.textureEmissive)),(0,o.pC)(n.textureMetallicRoughness)&&g.stageResources.textures.push(v.get(n.textureMetallicRoughness))),g.numberOfVertices+=y;const A=C.boundingInfo;(0,o.pC)(A)&&((0,u.pp)(g.boundingBox,A.getBBMin()),(0,u.pp)(g.boundingBox,A.getBBMax()))}))})),c}},44685:(e,t,i)=>{i.d(t,{U$:()=>s});var r=i(81936),o=i(90331);class a{constructor(e,t){this.layout=e,this.buffer="number"==typeof t?new ArrayBuffer(t*e.stride):t;for(const t of e.fieldNames){const i=e.fields.get(t);this[t]=new i.constructor(this.buffer,i.offset,this.stride)}}get stride(){return this.layout.stride}get count(){return this.buffer.byteLength/this.stride}get byteLength(){return this.buffer.byteLength}getField(e,t){const i=this[e];return i&&i.elementCount===t.ElementCount&&i.elementType===t.ElementType?i:null}slice(e,t){return new a(this.layout,this.buffer.slice(e*this.stride,t*this.stride))}copyFrom(e,t,i,r){const o=this.stride;if(o%4==0){const a=new Uint32Array(e.buffer,t*o,r*o/4);new Uint32Array(this.buffer,i*o,r*o/4).set(a)}else{const a=new Uint8Array(e.buffer,t*o,r*o);new Uint8Array(this.buffer,i*o,r*o).set(a)}}}class n{constructor(){this.stride=0,this.fields=new Map,this.fieldNames=[]}vec2f(e,t){return this.appendField(e,r.Eu,t),this}vec2f64(e,t){return this.appendField(e,r.q6,t),this}vec3f(e,t){return this.appendField(e,r.ct,t),this}vec3f64(e,t){return this.appendField(e,r.fP,t),this}vec4f(e,t){return this.appendField(e,r.ek,t),this}vec4f64(e,t){return this.appendField(e,r.Cd,t),this}mat3f(e,t){return this.appendField(e,r.gK,t),this}mat3f64(e,t){return this.appendField(e,r.ey,t),this}mat4f(e,t){return this.appendField(e,r.bj,t),this}mat4f64(e,t){return this.appendField(e,r.O1,t),this}vec4u8(e,t){return this.appendField(e,r.mc,t),this}f32(e,t){return this.appendField(e,r.ly,t),this}f64(e,t){return this.appendField(e,r.oS,t),this}u8(e,t){return this.appendField(e,r.D_,t),this}u16(e,t){return this.appendField(e,r.av,t),this}i8(e,t){return this.appendField(e,r.Hz,t),this}vec2i8(e,t){return this.appendField(e,r.Vs,t),this}vec2i16(e,t){return this.appendField(e,r.or,t),this}vec2u8(e,t){return this.appendField(e,r.xA,t),this}vec4u16(e,t){return this.appendField(e,r.v6,t),this}u32(e,t){return this.appendField(e,r.Nu,t),this}appendField(e,t,i){const r=t.ElementCount*(0,o.n1)(t.ElementType),a=this.stride;this.fields.set(e,{size:r,constructor:t,offset:a,optional:i}),this.stride+=r,this.fieldNames.push(e)}alignTo(e){return this.stride=Math.floor((this.stride+e-1)/e)*e,this}hasField(e){return this.fieldNames.indexOf(e)>=0}createBuffer(e){return new a(this,e)}createView(e){return new a(this,e)}clone(){const e=new n;return e.stride=this.stride,e.fields=new Map,this.fields.forEach(((t,i)=>e.fields.set(i,t))),e.fieldNames=this.fieldNames.slice(),e.BufferType=this.BufferType,e}}function s(){return new n}},95650:(e,t,i)=>{i.d(t,{q:()=>o});var r=i(23410);function o(e,t){0===t.output&&t.receiveShadows?(e.varyings.add("linearDepth","float"),e.vertex.code.add(r.H`void forwardLinearDepth() { linearDepth = gl_Position.w; }`)):1===t.output||3===t.output?(e.varyings.add("linearDepth","float"),e.vertex.uniforms.add("cameraNearFar","vec2"),e.vertex.code.add(r.H`void forwardLinearDepth() {
linearDepth = (-position_view().z - cameraNearFar[0]) / (cameraNearFar[1] - cameraNearFar[0]);
}`)):e.vertex.code.add(r.H`void forwardLinearDepth() {}`)}},57218:(e,t,i)=>{i.d(t,{w:()=>o});var r=i(23410);function o(e){e.vertex.code.add(r.H`vec4 offsetBackfacingClipPosition(vec4 posClip, vec3 posWorld, vec3 normalWorld, vec3 camPosWorld) {
vec3 camToVert = posWorld - camPosWorld;
bool isBackface = dot(camToVert, normalWorld) > 0.0;
if (isBackface) {
posClip.z += 0.0000003 * posClip.w;
}
return posClip;
}`)}},5885:(e,t,i)=>{i.d(t,{p2:()=>s,Vv:()=>l});var r=i(61681),o=i(6766),a=i(8909),n=i(23410);function s(e,t){if(t.slicePlaneEnabled){e.extensions.add("GL_OES_standard_derivatives"),t.sliceEnabledForVertexPrograms&&(e.vertex.uniforms.add("slicePlaneOrigin","vec3"),e.vertex.uniforms.add("slicePlaneBasis1","vec3"),e.vertex.uniforms.add("slicePlaneBasis2","vec3")),e.fragment.uniforms.add("slicePlaneOrigin","vec3"),e.fragment.uniforms.add("slicePlaneBasis1","vec3"),e.fragment.uniforms.add("slicePlaneBasis2","vec3");const i=n.H`struct SliceFactors {
float front;
float side0;
float side1;
float side2;
float side3;
};
SliceFactors calculateSliceFactors(vec3 pos) {
vec3 rel = pos - slicePlaneOrigin;
vec3 slicePlaneNormal = -cross(slicePlaneBasis1, slicePlaneBasis2);
float slicePlaneW = -dot(slicePlaneNormal, slicePlaneOrigin);
float basis1Len2 = dot(slicePlaneBasis1, slicePlaneBasis1);
float basis2Len2 = dot(slicePlaneBasis2, slicePlaneBasis2);
float basis1Dot = dot(slicePlaneBasis1, rel);
float basis2Dot = dot(slicePlaneBasis2, rel);
return SliceFactors(
dot(slicePlaneNormal, pos) + slicePlaneW,
-basis1Dot - basis1Len2,
basis1Dot - basis1Len2,
-basis2Dot - basis2Len2,
basis2Dot - basis2Len2
);
}
bool sliceByFactors(SliceFactors factors) {
return factors.front < 0.0
&& factors.side0 < 0.0
&& factors.side1 < 0.0
&& factors.side2 < 0.0
&& factors.side3 < 0.0;
}
bool sliceEnabled() {
return dot(slicePlaneBasis1, slicePlaneBasis1) != 0.0;
}
bool sliceByPlane(vec3 pos) {
return sliceEnabled() && sliceByFactors(calculateSliceFactors(pos));
}
#define rejectBySlice(_pos_) sliceByPlane(_pos_)
#define discardBySlice(_pos_) { if (sliceByPlane(_pos_)) discard; }`,r=n.H`vec4 applySliceHighlight(vec4 color, vec3 pos) {
SliceFactors factors = calculateSliceFactors(pos);
if (sliceByFactors(factors)) {
return color;
}
const float HIGHLIGHT_WIDTH = 1.0;
const vec4 HIGHLIGHT_COLOR = vec4(0.0, 0.0, 0.0, 0.3);
factors.front /= (2.0 * HIGHLIGHT_WIDTH) * fwidth(factors.front);
factors.side0 /= (2.0 * HIGHLIGHT_WIDTH) * fwidth(factors.side0);
factors.side1 /= (2.0 * HIGHLIGHT_WIDTH) * fwidth(factors.side1);
factors.side2 /= (2.0 * HIGHLIGHT_WIDTH) * fwidth(factors.side2);
factors.side3 /= (2.0 * HIGHLIGHT_WIDTH) * fwidth(factors.side3);
float highlightFactor = (1.0 - step(0.5, factors.front))
* (1.0 - step(0.5, factors.side0))
* (1.0 - step(0.5, factors.side1))
* (1.0 - step(0.5, factors.side2))
* (1.0 - step(0.5, factors.side3));
return mix(color, vec4(HIGHLIGHT_COLOR.rgb, color.a), highlightFactor * HIGHLIGHT_COLOR.a);
}`,o=t.sliceHighlightDisabled?n.H`#define highlightSlice(_color_, _pos_) (_color_)`:n.H`
        ${r}
        #define highlightSlice(_color_, _pos_) (sliceEnabled() ? applySliceHighlight(_color_, _pos_) : (_color_))
      `;t.sliceEnabledForVertexPrograms&&e.vertex.code.add(i),e.fragment.code.add(i),e.fragment.code.add(o)}else{const i=n.H`#define rejectBySlice(_pos_) false
#define discardBySlice(_pos_) {}
#define highlightSlice(_color_, _pos_) (_color_)`;t.sliceEnabledForVertexPrograms&&e.vertex.code.add(i),e.fragment.code.add(i)}}function l(e,t,i,n){t.slicePlaneEnabled&&((0,r.pC)(i)?(n?((0,o.f)(c,i.origin,n),e.setUniform3fv("slicePlaneOrigin",c)):e.setUniform3fv("slicePlaneOrigin",i.origin),e.setUniform3fv("slicePlaneBasis1",i.basis1),e.setUniform3fv("slicePlaneBasis2",i.basis2)):(e.setUniform3fv("slicePlaneBasis1",a.Z),e.setUniform3fv("slicePlaneBasis2",a.Z),e.setUniform3fv("slicePlaneOrigin",a.Z)))}const c=(0,a.c)()},4731:(e,t,i)=>{i.d(t,{w:()=>o});var r=i(23410);function o(e,t){t.linearDepth?e.vertex.code.add(r.H`vec4 transformPositionWithDepth(mat4 proj, mat4 view, vec3 pos, vec2 nearFar, out float depth) {
vec4 eye = view * vec4(pos, 1.0);
depth = (-eye.z - nearFar[0]) / (nearFar[1] - nearFar[0]) ;
return proj * eye;
}`):e.vertex.code.add(r.H`vec4 transformPosition(mat4 proj, mat4 view, vec3 pos) {
return proj * (view * vec4(pos, 1.0));
}`)}},99163:(e,t,i)=>{i.d(t,{f:()=>l});var r,o=i(8909),a=i(5331),n=i(23410),s=i(30560);function l(e,t){t.instanced&&t.instancedDoublePrecision&&(e.attributes.add("modelOriginHi","vec3"),e.attributes.add("modelOriginLo","vec3"),e.attributes.add("model","mat3"),e.attributes.add("modelNormal","mat3")),t.instancedDoublePrecision&&(e.vertex.include(a.$,t),e.vertex.uniforms.add("viewOriginHi","vec3"),e.vertex.uniforms.add("viewOriginLo","vec3"));const i=[n.H`
    vec3 calculateVPos() {
      ${t.instancedDoublePrecision?"return model * localPosition().xyz;":"return localPosition().xyz;"}
    }
    `,n.H`
    vec3 subtractOrigin(vec3 _pos) {
      ${t.instancedDoublePrecision?n.H`
          vec3 originDelta = dpAdd(viewOriginHi, viewOriginLo, -modelOriginHi, -modelOriginLo);
          return _pos - originDelta;`:"return vpos;"}
    }
    `,n.H`
    vec3 dpNormal(vec4 _normal) {
      ${t.instancedDoublePrecision?"return normalize(modelNormal * _normal.xyz);":"return normalize(_normal.xyz);"}
    }
    `,n.H`
    vec3 dpNormalView(vec4 _normal) {
      ${t.instancedDoublePrecision?"return normalize((viewNormal * vec4(modelNormal * _normal.xyz, 1.0)).xyz);":"return normalize((viewNormal * _normal).xyz);"}
    }
    `,t.vertexTangents?n.H`
    vec4 dpTransformVertexTangent(vec4 _tangent) {
      ${t.instancedDoublePrecision?"return vec4(modelNormal * _tangent.xyz, _tangent.w);":"return _tangent;"}

    }
    `:n.H``];e.vertex.code.add(i[0]),e.vertex.code.add(i[1]),e.vertex.code.add(i[2]),2===t.output&&e.vertex.code.add(i[3]),e.vertex.code.add(i[4])}(r=l||(l={})).Uniforms=class{},r.bindCustomOrigin=function(e,t){(0,s.po)(t,c,d,3),e.setUniform3fv("viewOriginHi",c),e.setUniform3fv("viewOriginLo",d)};const c=(0,o.c)(),d=(0,o.c)()},90511:(e,t,i)=>{i.d(t,{O:()=>a});var r=i(23410);function o(e){const t=r.H`vec3 decodeNormal(vec2 f) {
float z = 1.0 - abs(f.x) - abs(f.y);
return vec3(f + sign(f) * min(z, 0.0), z);
}`;e.fragment.code.add(t),e.vertex.code.add(t)}function a(e,t){0===t.normalType&&(e.attributes.add("normal","vec3"),e.vertex.code.add(r.H`vec3 normalModel() {
return normal;
}`)),1===t.normalType&&(e.include(o),e.attributes.add("normalCompressed","vec2"),e.vertex.code.add(r.H`vec3 normalModel() {
return decodeNormal(normalCompressed);
}`)),3===t.normalType&&(e.extensions.add("GL_OES_standard_derivatives"),e.fragment.code.add(r.H`vec3 screenDerivativeNormal(vec3 positionView) {
return normalize(cross(dFdx(positionView), dFdy(positionView)));
}`))}},91636:(e,t,i)=>{i.d(t,{f:()=>o});var r=i(23410);function o(e){e.attributes.add("position","vec3"),e.vertex.code.add(r.H`vec3 positionModel() { return position; }`)}},40433:(e,t,i)=>{i.d(t,{R:()=>a});var r=i(23410);function o(e){e.vertex.code.add(r.H`
    vec4 decodeSymbolColor(vec4 symbolColor, out int colorMixMode) {
      float symbolAlpha = 0.0;

      const float maxTint = 85.0;
      const float maxReplace = 170.0;
      const float scaleAlpha = 3.0;

      if (symbolColor.a > maxReplace) {
        colorMixMode = ${r.H.int(1)};
        symbolAlpha = scaleAlpha * (symbolColor.a - maxReplace);
      } else if (symbolColor.a > maxTint) {
        colorMixMode = ${r.H.int(3)};
        symbolAlpha = scaleAlpha * (symbolColor.a - maxTint);
      } else if (symbolColor.a > 0.0) {
        colorMixMode = ${r.H.int(4)};
        symbolAlpha = scaleAlpha * symbolColor.a;
      } else {
        colorMixMode = ${r.H.int(1)};
        symbolAlpha = 0.0;
      }

      return vec4(symbolColor.r, symbolColor.g, symbolColor.b, symbolAlpha);
    }
  `)}function a(e,t){t.symbolColor?(e.include(o),e.attributes.add("symbolColor","vec4"),e.varyings.add("colorMixMode","mediump float")):e.fragment.uniforms.add("colorMixMode","int"),t.symbolColor?e.vertex.code.add(r.H`int symbolColorMixMode;
vec4 getSymbolColor() {
return decodeSymbolColor(symbolColor, symbolColorMixMode) * 0.003921568627451;
}
void forwardColorMixMode() {
colorMixMode = float(symbolColorMixMode) + 0.5;
}`):e.vertex.code.add(r.H`vec4 getSymbolColor() { return vec4(1.0); }
void forwardColorMixMode() {}`)}},82082:(e,t,i)=>{i.d(t,{D:()=>o});var r=i(23410);function o(e,t){1===t.attributeTextureCoordinates&&(e.attributes.add("uv0","vec2"),e.varyings.add("vuv0","vec2"),e.vertex.code.add(r.H`void forwardTextureCoordinates() {
vuv0 = uv0;
}`)),2===t.attributeTextureCoordinates&&(e.attributes.add("uv0","vec2"),e.varyings.add("vuv0","vec2"),e.attributes.add("uvRegion","vec4"),e.varyings.add("vuvRegion","vec4"),e.vertex.code.add(r.H`void forwardTextureCoordinates() {
vuv0 = uv0;
vuvRegion = uvRegion;
}`)),0===t.attributeTextureCoordinates&&e.vertex.code.add(r.H`void forwardTextureCoordinates() {}`)}},6502:(e,t,i)=>{i.d(t,{c:()=>o});var r=i(23410);function o(e,t){t.attributeColor?(e.attributes.add("color","vec4"),e.varyings.add("vColor","vec4"),e.vertex.code.add(r.H`void forwardVertexColor() { vColor = color; }`),e.vertex.code.add(r.H`void forwardNormalizedVertexColor() { vColor = color * 0.003921568627451; }`)):e.vertex.code.add(r.H`void forwardVertexColor() {}
void forwardNormalizedVertexColor() {}`)}},11478:(e,t,i)=>{i.d(t,{B:()=>h});var r,o=i(90511),a=i(34344),n=i(39100),s=i(8909),l=i(91636),c=i(5331),d=i(23410);function u(e,t){e.include(l.f),e.vertex.include(c.$,t),e.varyings.add("vPositionWorldCameraRelative","vec3"),e.varyings.add("vPosition_view","vec3"),e.vertex.uniforms.add("uTransform_WorldFromModel_RS","mat3"),e.vertex.uniforms.add("uTransform_WorldFromModel_TH","vec3"),e.vertex.uniforms.add("uTransform_WorldFromModel_TL","vec3"),e.vertex.uniforms.add("uTransform_WorldFromView_TH","vec3"),e.vertex.uniforms.add("uTransform_WorldFromView_TL","vec3"),e.vertex.uniforms.add("uTransform_ViewFromCameraRelative_RS","mat3"),e.vertex.uniforms.add("uTransform_ProjFromView","mat4"),e.vertex.code.add(d.H`vec3 positionWorldCameraRelative() {
vec3 rotatedModelPosition = uTransform_WorldFromModel_RS * positionModel();
vec3 transform_CameraRelativeFromModel = dpAdd(
uTransform_WorldFromModel_TL,
uTransform_WorldFromModel_TH,
-uTransform_WorldFromView_TL,
-uTransform_WorldFromView_TH
);
return transform_CameraRelativeFromModel + rotatedModelPosition;
}
vec3 position_view() {
return uTransform_ViewFromCameraRelative_RS * positionWorldCameraRelative();
}
void forwardPosition() {
vPositionWorldCameraRelative = positionWorldCameraRelative();
vPosition_view = position_view();
gl_Position = uTransform_ProjFromView * vec4(vPosition_view, 1.0);
}
vec3 positionWorld() {
return uTransform_WorldFromView_TL + vPositionWorldCameraRelative;
}`),e.fragment.uniforms.add("uTransform_WorldFromView_TL","vec3"),e.fragment.code.add(d.H`vec3 positionWorld() {
return uTransform_WorldFromView_TL + vPositionWorldCameraRelative;
}`)}function h(e,t){0===t.normalType||1===t.normalType?(e.include(o.O,t),e.varyings.add("vNormalWorld","vec3"),e.varyings.add("vNormalView","vec3"),e.vertex.uniforms.add("uTransformNormal_GlobalFromModel","mat3"),e.vertex.uniforms.add("uTransformNormal_ViewFromGlobal","mat3"),e.vertex.code.add(d.H`void forwardNormal() {
vNormalWorld = uTransformNormal_GlobalFromModel * normalModel();
vNormalView = uTransformNormal_ViewFromGlobal * vNormalWorld;
}`)):2===t.normalType?(e.include(u,t),e.varyings.add("vNormalWorld","vec3"),e.vertex.code.add(d.H`
    void forwardNormal() {
      vNormalWorld = ${1===t.viewingMode?d.H`normalize(vPositionWorldCameraRelative);`:d.H`vec3(0.0, 0.0, 1.0);`}
    }
    `)):e.vertex.code.add(d.H`void forwardNormal() {}`)}(r=u||(u={})).ModelTransform=class{constructor(){this.worldFromModel_RS=(0,a.c)(),this.worldFromModel_TH=(0,s.c)(),this.worldFromModel_TL=(0,s.c)()}},r.ViewProjectionTransform=class{constructor(){this.worldFromView_TH=(0,s.c)(),this.worldFromView_TL=(0,s.c)(),this.viewFromCameraRelative_RS=(0,a.c)(),this.projFromView=(0,n.c)()}},r.bindModelTransform=function(e,t){e.setUniformMatrix3fv("uTransform_WorldFromModel_RS",t.worldFromModel_RS),e.setUniform3fv("uTransform_WorldFromModel_TH",t.worldFromModel_TH),e.setUniform3fv("uTransform_WorldFromModel_TL",t.worldFromModel_TL)},r.bindViewProjTransform=function(e,t){e.setUniform3fv("uTransform_WorldFromView_TH",t.worldFromView_TH),e.setUniform3fv("uTransform_WorldFromView_TL",t.worldFromView_TL),e.setUniformMatrix4fv("uTransform_ProjFromView",t.projFromView),e.setUniformMatrix3fv("uTransform_ViewFromCameraRelative_RS",t.viewFromCameraRelative_RS)},(h||(h={})).bindUniforms=function(e,t){e.setUniformMatrix4fv("viewNormal",t)}},72129:(e,t,i)=>{i.d(t,{i:()=>n});var r=i(82082),o=i(23410);function a(e){e.extensions.add("GL_EXT_shader_texture_lod"),e.extensions.add("GL_OES_standard_derivatives"),e.fragment.code.add(o.H`#ifndef GL_EXT_shader_texture_lod
float calcMipMapLevel(const vec2 ddx, const vec2 ddy) {
float deltaMaxSqr = max(dot(ddx, ddx), dot(ddy, ddy));
return max(0.0, 0.5 * log2(deltaMaxSqr));
}
#endif
vec4 textureAtlasLookup(sampler2D texture, vec2 textureSize, vec2 textureCoordinates, vec4 atlasRegion) {
vec2 atlasScale = atlasRegion.zw - atlasRegion.xy;
vec2 uvAtlas = fract(textureCoordinates) * atlasScale + atlasRegion.xy;
float maxdUV = 0.125;
vec2 dUVdx = clamp(dFdx(textureCoordinates), -maxdUV, maxdUV) * atlasScale;
vec2 dUVdy = clamp(dFdy(textureCoordinates), -maxdUV, maxdUV) * atlasScale;
#ifdef GL_EXT_shader_texture_lod
return texture2DGradEXT(texture, uvAtlas, dUVdx, dUVdy);
#else
vec2 dUVdxAuto = dFdx(uvAtlas);
vec2 dUVdyAuto = dFdy(uvAtlas);
float mipMapLevel = calcMipMapLevel(dUVdx * textureSize, dUVdy * textureSize);
float autoMipMapLevel = calcMipMapLevel(dUVdxAuto * textureSize, dUVdyAuto * textureSize);
return texture2D(texture, uvAtlas, mipMapLevel - autoMipMapLevel);
#endif
}`)}function n(e,t){e.include(r.D,t),e.fragment.code.add(o.H`
  struct TextureLookupParameter {
    vec2 uv;
    ${t.supportsTextureAtlas?"vec2 size;":""}
  } vtc;
  `),1===t.attributeTextureCoordinates&&e.fragment.code.add(o.H`vec4 textureLookup(sampler2D tex, TextureLookupParameter params) {
return texture2D(tex, params.uv);
}`),2===t.attributeTextureCoordinates&&(e.include(a),e.fragment.code.add(o.H`vec4 textureLookup(sampler2D tex, TextureLookupParameter params) {
return textureAtlasLookup(tex, params.size, params.uv, vuvRegion);
}`))}},5664:(e,t,i)=>{i.d(t,{LC:()=>a,Mo:()=>n});var r=i(23410);function o(e){e.vertex.code.add(r.H`float screenSizePerspectiveMinSize(float size, vec4 factor) {
float nonZeroSize = 1.0 - step(size, 0.0);
return (
factor.z * (
1.0 +
nonZeroSize *
2.0 * factor.w / (
size + (1.0 - nonZeroSize)
)
)
);
}`),e.vertex.code.add(r.H`float screenSizePerspectiveViewAngleDependentFactor(float absCosAngle) {
return absCosAngle * absCosAngle * absCosAngle;
}`),e.vertex.code.add(r.H`vec4 screenSizePerspectiveScaleFactor(float absCosAngle, float distanceToCamera, vec4 params) {
return vec4(
min(params.x / (distanceToCamera - params.y), 1.0),
screenSizePerspectiveViewAngleDependentFactor(absCosAngle),
params.z,
params.w
);
}`),e.vertex.code.add(r.H`float applyScreenSizePerspectiveScaleFactorFloat(float size, vec4 factor) {
return max(mix(size * factor.x, size, factor.y), screenSizePerspectiveMinSize(size, factor));
}`),e.vertex.code.add(r.H`float screenSizePerspectiveScaleFloat(float size, float absCosAngle, float distanceToCamera, vec4 params) {
return applyScreenSizePerspectiveScaleFactorFloat(
size,
screenSizePerspectiveScaleFactor(absCosAngle, distanceToCamera, params)
);
}`),e.vertex.code.add(r.H`vec2 applyScreenSizePerspectiveScaleFactorVec2(vec2 size, vec4 factor) {
return mix(size * clamp(factor.x, screenSizePerspectiveMinSize(size.y, factor) / size.y, 1.0), size, factor.y);
}`),e.vertex.code.add(r.H`vec2 screenSizePerspectiveScaleVec2(vec2 size, float absCosAngle, float distanceToCamera, vec4 params) {
return applyScreenSizePerspectiveScaleFactorVec2(size, screenSizePerspectiveScaleFactor(absCosAngle, distanceToCamera, params));
}`)}function a(e,t){const i=e.vertex.code;t.verticalOffsetEnabled?(e.vertex.uniforms.add("verticalOffset","vec4"),t.screenSizePerspectiveEnabled&&(e.include(o),e.vertex.uniforms.add("screenSizePerspectiveAlignment","vec4")),i.add(r.H`
    vec3 calculateVerticalOffset(vec3 worldPos, vec3 localOrigin) {
      float viewDistance = length((view * vec4(worldPos, 1.0)).xyz);
      ${1===t.viewingMode?r.H`vec3 worldNormal = normalize(worldPos + localOrigin);`:r.H`vec3 worldNormal = vec3(0.0, 0.0, 1.0);`}
      ${t.screenSizePerspectiveEnabled?r.H`
          float cosAngle = dot(worldNormal, normalize(worldPos - camPos));
          float verticalOffsetScreenHeight = screenSizePerspectiveScaleFloat(verticalOffset.x, abs(cosAngle), viewDistance, screenSizePerspectiveAlignment);`:r.H`
          float verticalOffsetScreenHeight = verticalOffset.x;`}
      // Screen sized offset in world space, used for example for line callouts
      float worldOffset = clamp(verticalOffsetScreenHeight * verticalOffset.y * viewDistance, verticalOffset.z, verticalOffset.w);
      return worldNormal * worldOffset;
    }

    vec3 addVerticalOffset(vec3 worldPos, vec3 localOrigin) {
      return worldPos + calculateVerticalOffset(worldPos, localOrigin);
    }
    `)):i.add(r.H`vec3 addVerticalOffset(vec3 worldPos, vec3 localOrigin) { return worldPos; }`)}function n(e,t,i){if(!t.verticalOffset)return;const r=s(t.verticalOffset,i.camera.fovY,i.camera.fullViewport[3]),o=i.camera.pixelRatio||1;e.setUniform4f("verticalOffset",r.screenLength*o,r.perDistance,r.minWorldLength,r.maxWorldLength)}function s(e,t,i,r=l){return r.screenLength=e.screenLength,r.perDistance=Math.tan(.5*t)/(.5*i),r.minWorldLength=e.minWorldLength,r.maxWorldLength=e.maxWorldLength,r}i(54443);const l={screenLength:0,perDistance:0,minWorldLength:0,maxWorldLength:0}},97675:(e,t,i)=>{i.d(t,{s:()=>m});var r=i(5885),o=i(4731),a=i(90511),n=i(82082),s=i(11478),l=i(9794),c=i(23410);function d(e,t){e.fragment.include(l.n),3===t.output?(e.extensions.add("GL_OES_standard_derivatives"),e.fragment.code.add(c.H`float _calculateFragDepth(const in float depth) {
const float SLOPE_SCALE = 2.0;
const float BIAS = 2.0 * .000015259;
float m = max(abs(dFdx(depth)), abs(dFdy(depth)));
float result = depth + SLOPE_SCALE * m + BIAS;
return clamp(result, .0, .999999);
}
void outputDepth(float _linearDepth) {
gl_FragColor = float2rgba(_calculateFragDepth(_linearDepth));
}`)):1===t.output&&e.fragment.code.add(c.H`void outputDepth(float _linearDepth) {
gl_FragColor = float2rgba(_linearDepth);
}`)}var u=i(55994),h=i(12664),p=i(41272);function m(e,t){const i=e.vertex.code,l=e.fragment.code;1!==t.output&&3!==t.output||(e.include(o.w,{linearDepth:!0}),e.include(n.D,t),e.include(h.kl,t),e.include(d,t),e.include(r.p2,t),e.vertex.uniforms.add("cameraNearFar","vec2"),e.varyings.add("depth","float"),t.hasColorTexture&&e.fragment.uniforms.add("tex","sampler2D"),i.add(c.H`void main(void) {
vpos = calculateVPos();
vpos = subtractOrigin(vpos);
vpos = addVerticalOffset(vpos, localOrigin);
gl_Position = transformPositionWithDepth(proj, view, vpos, cameraNearFar, depth);
forwardTextureCoordinates();
}`),e.include(p.sj,t),l.add(c.H`
      void main(void) {
        discardBySlice(vpos);
        ${t.hasColorTexture?c.H`
        vec4 texColor = texture2D(tex, vuv0);
        discardOrAdjustAlpha(texColor);`:""}
        outputDepth(depth);
      }
    `)),2===t.output&&(e.include(o.w,{linearDepth:!1}),e.include(a.O,t),e.include(s.B,t),e.include(n.D,t),e.include(h.kl,t),t.hasColorTexture&&e.fragment.uniforms.add("tex","sampler2D"),e.vertex.uniforms.add("viewNormal","mat4"),e.varyings.add("vPositionView","vec3"),i.add(c.H`
      void main(void) {
        vpos = calculateVPos();
        vpos = subtractOrigin(vpos);
        ${0===t.normalType?c.H`
        vNormalWorld = dpNormalView(vvLocalNormal(normalModel()));`:""}
        vpos = addVerticalOffset(vpos, localOrigin);
        gl_Position = transformPosition(proj, view, vpos);
        forwardTextureCoordinates();
      }
    `),e.include(r.p2,t),e.include(p.sj,t),l.add(c.H`
      void main() {
        discardBySlice(vpos);
        ${t.hasColorTexture?c.H`
        vec4 texColor = texture2D(tex, vuv0);
        discardOrAdjustAlpha(texColor);`:""}

        ${3===t.normalType?c.H`
            vec3 normal = screenDerivativeNormal(vPositionView);`:c.H`
            vec3 normal = normalize(vNormalWorld);
            if (gl_FrontFacing == false) normal = -normal;`}
        gl_FragColor = vec4(vec3(0.5) + 0.5 * normal, 1.0);
      }
    `)),4===t.output&&(e.include(o.w,{linearDepth:!1}),e.include(n.D,t),e.include(h.kl,t),t.hasColorTexture&&e.fragment.uniforms.add("tex","sampler2D"),i.add(c.H`void main(void) {
vpos = calculateVPos();
vpos = subtractOrigin(vpos);
vpos = addVerticalOffset(vpos, localOrigin);
gl_Position = transformPosition(proj, view, vpos);
forwardTextureCoordinates();
}`),e.include(r.p2,t),e.include(p.sj,t),e.include(u.bA),l.add(c.H`
      void main() {
        discardBySlice(vpos);
        ${t.hasColorTexture?c.H`
        vec4 texColor = texture2D(tex, vuv0);
        discardOrAdjustAlpha(texColor);`:""}
        outputHighlight();
      }
    `))}},55994:(e,t,i)=>{i.d(t,{bA:()=>s,wW:()=>l});var r=i(1983),o=i(23410);const a=(0,r.f)(1,1,0,1),n=(0,r.f)(1,0,1,1);function s(e){e.fragment.uniforms.add("depthTex","sampler2D"),e.fragment.uniforms.add("highlightViewportPixelSz","vec4"),e.fragment.constants.add("occludedHighlightFlag","vec4",a).add("unoccludedHighlightFlag","vec4",n),e.fragment.code.add(o.H`void outputHighlight() {
vec4 fragCoord = gl_FragCoord;
float sceneDepth = texture2D(depthTex, (fragCoord.xy - highlightViewportPixelSz.xy) * highlightViewportPixelSz.zw).r;
if (fragCoord.z > sceneDepth + 5e-7) {
gl_FragColor = occludedHighlightFlag;
}
else {
gl_FragColor = unoccludedHighlightFlag;
}
}`)}function l(e,t){e.bindTexture(t.highlightDepthTexture,"depthTex"),e.setUniform4f("highlightViewportPixelSz",0,0,t.inverseViewport[0],t.inverseViewport[1])}},6665:(e,t,i)=>{i.d(t,{S:()=>a});var r=i(9794),o=i(23410);function a(e){e.include(r.n),e.code.add(o.H`float linearDepthFromFloat(float depth, vec2 nearFar) {
return -(depth * (nearFar[1] - nearFar[0]) + nearFar[0]);
}
float linearDepthFromTexture(sampler2D depthTex, vec2 uv, vec2 nearFar) {
return linearDepthFromFloat(rgba2float(texture2D(depthTex, uv)), nearFar);
}`)}},3417:(e,t,i)=>{i.d(t,{Q:()=>a});var r=i(72129),o=i(23410);function a(e,t){const i=e.fragment;t.vertexTangents?(e.attributes.add("tangent","vec4"),e.varyings.add("vTangent","vec4"),2===t.doubleSidedMode?i.code.add(o.H`mat3 computeTangentSpace(vec3 normal) {
float tangentHeadedness = gl_FrontFacing ? vTangent.w : -vTangent.w;
vec3 tangent = normalize(gl_FrontFacing ? vTangent.xyz : -vTangent.xyz);
vec3 bitangent = cross(normal, tangent) * tangentHeadedness;
return mat3(tangent, bitangent, normal);
}`):i.code.add(o.H`mat3 computeTangentSpace(vec3 normal) {
float tangentHeadedness = vTangent.w;
vec3 tangent = normalize(vTangent.xyz);
vec3 bitangent = cross(normal, tangent) * tangentHeadedness;
return mat3(tangent, bitangent, normal);
}`)):(e.extensions.add("GL_OES_standard_derivatives"),i.code.add(o.H`mat3 computeTangentSpace(vec3 normal, vec3 pos, vec2 st) {
vec3 Q1 = dFdx(pos);
vec3 Q2 = dFdy(pos);
vec2 stx = dFdx(st);
vec2 sty = dFdy(st);
float det = stx.t * sty.s - sty.t * stx.s;
vec3 T = stx.t * Q2 - sty.t * Q1;
T = T - normal * dot(normal, T);
T *= inversesqrt(max(dot(T,T), 1.e-10));
vec3 B = sign(det) * cross(normal, T);
return mat3(T, B, normal);
}`)),0!==t.attributeTextureCoordinates&&(e.include(r.i,t),i.uniforms.add("normalTexture","sampler2D"),i.uniforms.add("normalTextureSize","vec2"),i.code.add(o.H`
    vec3 computeTextureNormal(mat3 tangentSpace, vec2 uv) {
      vtc.uv = uv;
      ${t.supportsTextureAtlas?"vtc.size = normalTextureSize;":""}
      vec3 rawNormal = textureLookup(normalTexture, vtc).rgb * 2.0 - 1.0;
      return tangentSpace * rawNormal;
    }
  `))}},30786:(e,t,i)=>{i.d(t,{K:()=>o});var r=i(23410);function o(e,t){const i=e.fragment;t.receiveAmbientOcclusion?(i.uniforms.add("ssaoTex","sampler2D"),i.uniforms.add("viewportPixelSz","vec4"),i.code.add(r.H`float evaluateAmbientOcclusion() {
return 1.0 - texture2D(ssaoTex, (gl_FragCoord.xy - viewportPixelSz.xy) * viewportPixelSz.zw).a;
}
float evaluateAmbientOcclusionInverse() {
float ssao = texture2D(ssaoTex, (gl_FragCoord.xy - viewportPixelSz.xy) * viewportPixelSz.zw).a;
return viewportPixelSz.z < 0.0 ? 1.0 : ssao;
}`)):i.code.add(r.H`float evaluateAmbientOcclusion() { return 0.0; }
float evaluateAmbientOcclusionInverse() { return 1.0; }`)}},54207:(e,t,i)=>{i.d(t,{X:()=>d});var r=i(23410);function o(e,t){const i=e.fragment,o=void 0!==t.lightingSphericalHarmonicsOrder?t.lightingSphericalHarmonicsOrder:2;0===o?(i.uniforms.add("lightingAmbientSH0","vec3"),i.code.add(r.H`vec3 calculateAmbientIrradiance(vec3 normal, float ambientOcclusion) {
vec3 ambientLight = 0.282095 * lightingAmbientSH0;
return ambientLight * (1.0 - ambientOcclusion);
}`)):1===o?(i.uniforms.add("lightingAmbientSH_R","vec4"),i.uniforms.add("lightingAmbientSH_G","vec4"),i.uniforms.add("lightingAmbientSH_B","vec4"),i.code.add(r.H`vec3 calculateAmbientIrradiance(vec3 normal, float ambientOcclusion) {
vec4 sh0 = vec4(
0.282095,
0.488603 * normal.x,
0.488603 * normal.z,
0.488603 * normal.y
);
vec3 ambientLight = vec3(
dot(lightingAmbientSH_R, sh0),
dot(lightingAmbientSH_G, sh0),
dot(lightingAmbientSH_B, sh0)
);
return ambientLight * (1.0 - ambientOcclusion);
}`)):2===o&&(i.uniforms.add("lightingAmbientSH0","vec3"),i.uniforms.add("lightingAmbientSH_R1","vec4"),i.uniforms.add("lightingAmbientSH_G1","vec4"),i.uniforms.add("lightingAmbientSH_B1","vec4"),i.uniforms.add("lightingAmbientSH_R2","vec4"),i.uniforms.add("lightingAmbientSH_G2","vec4"),i.uniforms.add("lightingAmbientSH_B2","vec4"),i.code.add(r.H`vec3 calculateAmbientIrradiance(vec3 normal, float ambientOcclusion) {
vec3 ambientLight = 0.282095 * lightingAmbientSH0;
vec4 sh1 = vec4(
0.488603 * normal.x,
0.488603 * normal.z,
0.488603 * normal.y,
1.092548 * normal.x * normal.y
);
vec4 sh2 = vec4(
1.092548 * normal.y * normal.z,
0.315392 * (3.0 * normal.z * normal.z - 1.0),
1.092548 * normal.x * normal.z,
0.546274 * (normal.x * normal.x - normal.y * normal.y)
);
ambientLight += vec3(
dot(lightingAmbientSH_R1, sh1),
dot(lightingAmbientSH_G1, sh1),
dot(lightingAmbientSH_B1, sh1)
);
ambientLight += vec3(
dot(lightingAmbientSH_R2, sh2),
dot(lightingAmbientSH_G2, sh2),
dot(lightingAmbientSH_B2, sh2)
);
return ambientLight * (1.0 - ambientOcclusion);
}`),1!==t.pbrMode&&2!==t.pbrMode||i.code.add(r.H`const vec3 skyTransmittance = vec3(0.9, 0.9, 1.0);
vec3 calculateAmbientRadiance(float ambientOcclusion)
{
vec3 ambientLight = 1.2 * (0.282095 * lightingAmbientSH0) - 0.2;
return ambientLight *= (1.0 - ambientOcclusion) * skyTransmittance;
}`))}var a=i(30786);function n(e){const t=e.fragment;t.uniforms.add("lightingMainDirection","vec3"),t.uniforms.add("lightingMainIntensity","vec3"),t.uniforms.add("lightingFixedFactor","float"),t.code.add(r.H`vec3 evaluateMainLighting(vec3 normal_global, float shadowing) {
float dotVal = clamp(dot(normal_global, lightingMainDirection), 0.0, 1.0);
dotVal = mix(dotVal, 1.0, lightingFixedFactor);
return lightingMainIntensity * ((1.0 - shadowing) * dotVal);
}`)}var s=i(89585),l=i(95509),c=i(20105);function d(e,t){const i=e.fragment;e.include(n),e.include(a.K,t),0!==t.pbrMode&&e.include(s.T,t),e.include(o,t),t.receiveShadows&&e.include(c.hX,t),i.uniforms.add("lightingGlobalFactor","float"),i.uniforms.add("ambientBoostFactor","float"),e.include(l.e),i.code.add(r.H`
    const float GAMMA_SRGB = 2.1;
    const float INV_GAMMA_SRGB = 0.4761904;
    ${0===t.pbrMode?"":"const vec3 GROUND_REFLECTANCE = vec3(0.2);"}
  `),i.code.add(r.H`
    float additionalDirectedAmbientLight(vec3 vPosWorld) {
      float vndl = dot(${1===t.viewingMode?r.H`normalize(vPosWorld)`:r.H`vec3(0.0, 0.0, 1.0)`}, lightingMainDirection);
      return smoothstep(0.0, 1.0, clamp(vndl * 2.5, 0.0, 1.0));
    }
  `),i.code.add(r.H`vec3 evaluateAdditionalLighting(float ambientOcclusion, vec3 vPosWorld) {
float additionalAmbientScale = additionalDirectedAmbientLight(vPosWorld);
return (1.0 - ambientOcclusion) * additionalAmbientScale * ambientBoostFactor * lightingGlobalFactor * lightingMainIntensity;
}`),0===t.pbrMode||4===t.pbrMode?i.code.add(r.H`vec3 evaluateSceneLighting(vec3 normalWorld, vec3 albedo, float shadow, float ssao, vec3 additionalLight)
{
vec3 mainLighting = evaluateMainLighting(normalWorld, shadow);
vec3 ambientLighting = calculateAmbientIrradiance(normalWorld, ssao);
vec3 albedoLinear = pow(albedo, vec3(GAMMA_SRGB));
vec3 totalLight = mainLighting + ambientLighting + additionalLight;
totalLight = min(totalLight, vec3(PI));
vec3 outColor = vec3((albedoLinear / PI) * totalLight);
return pow(outColor, vec3(INV_GAMMA_SRGB));
}`):1!==t.pbrMode&&2!==t.pbrMode||(i.code.add(r.H`const float fillLightIntensity = 0.25;
const float horizonLightDiffusion = 0.4;
const float additionalAmbientIrradianceFactor = 0.02;
vec3 evaluateSceneLightingPBR(vec3 normal, vec3 albedo, float shadow, float ssao, vec3 additionalLight, vec3 viewDir, vec3 normalGround, vec3 mrr, vec3 _emission, float additionalAmbientIrradiance)
{
vec3 viewDirection = -viewDir;
vec3 mainLightDirection = lightingMainDirection;
vec3 h = normalize(viewDirection + mainLightDirection);
PBRShadingInfo inputs;
inputs.NdotL = clamp(dot(normal, mainLightDirection), 0.001, 1.0);
inputs.NdotV = clamp(abs(dot(normal, viewDirection)), 0.001, 1.0);
inputs.NdotH = clamp(dot(normal, h), 0.0, 1.0);
inputs.VdotH = clamp(dot(viewDirection, h), 0.0, 1.0);
inputs.NdotNG = clamp(dot(normal, normalGround), -1.0, 1.0);
vec3 reflectedView = normalize(reflect(viewDirection, normal));
inputs.RdotNG = clamp(dot(reflectedView, normalGround), -1.0, 1.0);
inputs.albedoLinear = pow(albedo, vec3(GAMMA_SRGB));
inputs.ssao = ssao;
inputs.metalness = mrr[0];
inputs.roughness = clamp(mrr[1] * mrr[1], 0.001, 0.99);`),i.code.add(r.H`inputs.f0 = (0.16 * mrr[2] * mrr[2]) * (1.0 - inputs.metalness) + inputs.albedoLinear * inputs.metalness;
inputs.f90 = vec3(clamp(dot(inputs.f0, vec3(50.0 * 0.33)), 0.0, 1.0));
inputs.diffuseColor = inputs.albedoLinear * (vec3(1.0) - inputs.f0) * (1.0 - inputs.metalness);`),i.code.add(r.H`vec3 ambientDir = vec3(5.0 * normalGround[1] - normalGround[0] * normalGround[2], - 5.0 * normalGround[0] - normalGround[2] * normalGround[1], normalGround[1] * normalGround[1] + normalGround[0] * normalGround[0]);
ambientDir = ambientDir != vec3(0.0)? normalize(ambientDir) : normalize(vec3(5.0, -1.0, 0.0));
inputs.NdotAmbDir = abs(dot(normal, ambientDir));
vec3 mainLightIrradianceComponent = inputs.NdotL * (1.0 - shadow) * lightingMainIntensity;
vec3 fillLightsIrradianceComponent = inputs.NdotAmbDir * lightingMainIntensity * fillLightIntensity;
vec3 ambientLightIrradianceComponent = calculateAmbientIrradiance(normal, ssao) + additionalLight;
inputs.skyIrradianceToSurface = ambientLightIrradianceComponent + mainLightIrradianceComponent + fillLightsIrradianceComponent ;
inputs.groundIrradianceToSurface = GROUND_REFLECTANCE * ambientLightIrradianceComponent + mainLightIrradianceComponent + fillLightsIrradianceComponent ;`),i.code.add(r.H`vec3 horizonRingDir = inputs.RdotNG * normalGround - reflectedView;
vec3 horizonRingH = normalize(viewDirection + horizonRingDir);
inputs.NdotH_Horizon = dot(normal, horizonRingH);
vec3 mainLightRadianceComponent = normalDistribution(inputs.NdotH, inputs.roughness) * lightingMainIntensity * (1.0 - shadow);
vec3 horizonLightRadianceComponent = normalDistribution(inputs.NdotH_Horizon, min(inputs.roughness + horizonLightDiffusion, 1.0)) * lightingMainIntensity * fillLightIntensity;
vec3 ambientLightRadianceComponent = calculateAmbientRadiance(ssao) + additionalLight;
inputs.skyRadianceToSurface = ambientLightRadianceComponent + mainLightRadianceComponent + horizonLightRadianceComponent;
inputs.groundRadianceToSurface = GROUND_REFLECTANCE * (ambientLightRadianceComponent + horizonLightRadianceComponent) + mainLightRadianceComponent;
inputs.averageAmbientRadiance = ambientLightIrradianceComponent[1] * (1.0 + GROUND_REFLECTANCE[1]);`),i.code.add(r.H`
        vec3 reflectedColorComponent = evaluateEnvironmentIllumination(inputs);
        vec3 additionalMaterialReflectanceComponent = inputs.albedoLinear * additionalAmbientIrradiance;
        vec3 emissionComponent = pow(_emission, vec3(GAMMA_SRGB));
        vec3 outColorLinear = reflectedColorComponent + additionalMaterialReflectanceComponent + emissionComponent;
        ${2===t.pbrMode?r.H`vec3 outColor = pow(max(vec3(0.0), outColorLinear - 0.005 * inputs.averageAmbientRadiance), vec3(INV_GAMMA_SRGB));`:r.H`vec3 outColor = pow(blackLevelSoftCompression(outColorLinear, inputs), vec3(INV_GAMMA_SRGB));`}
        return outColor;
      }
    `))}},73393:(e,t,i)=>{i.d(t,{p:()=>a,l:()=>o});var r=i(23410);function o(e,t){e.fragment.uniforms.add("terrainDepthTexture","sampler2D"),e.fragment.uniforms.add("cameraNearFar","vec2"),e.fragment.uniforms.add("inverseViewport","vec2"),e.fragment.code.add(r.H`
    // Compare the linearized depths of fragment and terrain. Discard fragments on the wrong side of the terrain.
    void terrainDepthTest(vec4 fragCoord, float fragmentDepth){

      float terrainDepth = linearDepthFromTexture(terrainDepthTexture, fragCoord.xy * inverseViewport, cameraNearFar);
      if(fragmentDepth ${t.cullAboveGround?">":"<="} terrainDepth){
        discard;
      }
    }
  `)}function a(e,t){t.multipassTerrainEnabled&&t.terrainLinearDepthTexture&&e.bindTexture(t.terrainLinearDepthTexture,"terrainDepthTexture")}},2833:(e,t,i)=>{i.d(t,{k:()=>o});var r=i(23410);function o(e,t){const i=e.fragment;i.code.add(r.H`struct ShadingNormalParameters {
vec3 normalView;
vec3 viewDirection;
} shadingParams;`),1===t.doubleSidedMode?i.code.add(r.H`vec3 shadingNormal(ShadingNormalParameters params) {
return dot(params.normalView, params.viewDirection) > 0.0 ? normalize(-params.normalView) : normalize(params.normalView);
}`):2===t.doubleSidedMode?i.code.add(r.H`vec3 shadingNormal(ShadingNormalParameters params) {
return gl_FrontFacing ? normalize(params.normalView) : normalize(-params.normalView);
}`):i.code.add(r.H`vec3 shadingNormal(ShadingNormalParameters params) {
return normalize(params.normalView);
}`)}},89585:(e,t,i)=>{i.d(t,{T:()=>n});var r=i(23410);function o(e){const t=e.fragment.code;t.add(r.H`vec3 evaluateDiffuseIlluminationHemisphere(vec3 ambientGround, vec3 ambientSky, float NdotNG)
{
return ((1.0 - NdotNG) * ambientGround + (1.0 + NdotNG) * ambientSky) * 0.5;
}`),t.add(r.H`float integratedRadiance(float cosTheta2, float roughness)
{
return (cosTheta2 - 1.0) / (cosTheta2 * (1.0 - roughness * roughness) - 1.0);
}`),t.add(r.H`vec3 evaluateSpecularIlluminationHemisphere(vec3 ambientGround, vec3 ambientSky, float RdotNG, float roughness)
{
float cosTheta2 = 1.0 - RdotNG * RdotNG;
float intRadTheta = integratedRadiance(cosTheta2, roughness);
float ground = RdotNG < 0.0 ? 1.0 - intRadTheta : 1.0 + intRadTheta;
float sky = 2.0 - ground;
return (ground * ambientGround + sky * ambientSky) * 0.5;
}`)}var a=i(95509);function n(e,t){const i=e.fragment.code;e.include(a.e),3===t.pbrMode||4===t.pbrMode?(i.add(r.H`
    struct PBRShadingWater
    {
        float NdotL;   // cos angle between normal and light direction
        float NdotV;   // cos angle between normal and view direction
        float NdotH;   // cos angle between normal and half vector
        float VdotH;   // cos angle between view direction and half vector
        float LdotH;   // cos angle between light direction and half vector
        float VdotN;   // cos angle between view direction and normal vector
    };

    float dtrExponent = ${t.useCustomDTRExponentForWater?"2.2":"2.0"};
    `),i.add(r.H`vec3 fresnelReflection(float angle, vec3 f0, float f90) {
return f0 + (f90 - f0) * pow(1.0 - angle, 5.0);
}`),i.add(r.H`float normalDistributionWater(float NdotH, float roughness)
{
float r2 = roughness * roughness;
float NdotH2 = NdotH * NdotH;
float denom = pow((NdotH2 * (r2 - 1.0) + 1.0), dtrExponent) * PI;
return r2 / denom;
}`),i.add(r.H`float geometricOcclusionKelemen(float LoH)
{
return 0.25 / (LoH * LoH);
}`),i.add(r.H`vec3 brdfSpecularWater(in PBRShadingWater props, float roughness, vec3 F0, float F0Max)
{
vec3  F = fresnelReflection(props.VdotH, F0, F0Max);
float dSun = normalDistributionWater(props.NdotH, roughness);
float V = geometricOcclusionKelemen(props.LdotH);
float diffusionSunHaze = mix(roughness + 0.045, roughness + 0.385, 1.0 - props.VdotH);
float strengthSunHaze  = 1.2;
float dSunHaze = normalDistributionWater(props.NdotH, diffusionSunHaze)*strengthSunHaze;
return ((dSun + dSunHaze) * V) * F;
}
vec3 tonemapACES(const vec3 x) {
return (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14);
}`)):1!==t.pbrMode&&2!==t.pbrMode||(e.include(o),i.add(r.H`struct PBRShadingInfo
{
float NdotL;
float NdotV;
float NdotH;
float VdotH;
float LdotH;
float NdotNG;
float RdotNG;
float NdotAmbDir;
float NdotH_Horizon;
vec3 skyRadianceToSurface;
vec3 groundRadianceToSurface;
vec3 skyIrradianceToSurface;
vec3 groundIrradianceToSurface;
float averageAmbientRadiance;
float ssao;
vec3 albedoLinear;
vec3 f0;
vec3 f90;
vec3 diffuseColor;
float metalness;
float roughness;
};`),i.add(r.H`float normalDistribution(float NdotH, float roughness)
{
float a = NdotH * roughness;
float b = roughness / (1.0 - NdotH * NdotH + a * a);
return b * b * INV_PI;
}`),i.add(r.H`const vec4 c0 = vec4(-1.0, -0.0275, -0.572,  0.022);
const vec4 c1 = vec4( 1.0,  0.0425,  1.040, -0.040);
const vec2 c2 = vec2(-1.04, 1.04);
vec2 prefilteredDFGAnalytical(float roughness, float NdotV) {
vec4 r = roughness * c0 + c1;
float a004 = min(r.x * r.x, exp2(-9.28 * NdotV)) * r.x + r.y;
return c2 * a004 + r.zw;
}`),i.add(r.H`vec3 evaluateEnvironmentIllumination(PBRShadingInfo inputs) {
vec3 indirectDiffuse = evaluateDiffuseIlluminationHemisphere(inputs.groundIrradianceToSurface, inputs.skyIrradianceToSurface, inputs.NdotNG);
vec3 indirectSpecular = evaluateSpecularIlluminationHemisphere(inputs.groundRadianceToSurface, inputs.skyRadianceToSurface, inputs.RdotNG, inputs.roughness);
vec3 diffuseComponent = inputs.diffuseColor * indirectDiffuse * INV_PI;
vec2 dfg = prefilteredDFGAnalytical(inputs.roughness, inputs.NdotV);
vec3 specularColor = inputs.f0 * dfg.x + inputs.f90 * dfg.y;
vec3 specularComponent = specularColor * indirectSpecular;
return (diffuseComponent + specularComponent);
}`),i.add(r.H`float gamutMapChanel(float x, vec2 p){
return (x < p.x) ? mix(0.0, p.y, x/p.x) : mix(p.y, 1.0, (x - p.x) / (1.0 - p.x) );
}`),i.add(r.H`vec3 blackLevelSoftCompression(vec3 inColor, PBRShadingInfo inputs){
vec3 outColor;
vec2 p = vec2(0.02 * (inputs.averageAmbientRadiance), 0.0075 * (inputs.averageAmbientRadiance));
outColor.x = gamutMapChanel(inColor.x, p) ;
outColor.y = gamutMapChanel(inColor.y, p) ;
outColor.z = gamutMapChanel(inColor.z, p) ;
return outColor;
}`))}},3864:(e,t,i)=>{i.d(t,{jV:()=>n,nW:()=>s});var r=i(79912),o=i(72129),a=i(23410);function n(e,t){const i=e.fragment,r=t.hasMetalnessAndRoughnessTexture||t.hasEmissionTexture||t.hasOcclusionTexture;1===t.pbrMode&&r&&e.include(o.i,t),2!==t.pbrMode?(0===t.pbrMode&&i.code.add(a.H`float getBakedOcclusion() { return 1.0; }`),1===t.pbrMode&&(i.uniforms.add("emissionFactor","vec3"),i.uniforms.add("mrrFactors","vec3"),i.code.add(a.H`vec3 mrr;
vec3 emission;
float occlusion;`),t.hasMetalnessAndRoughnessTexture&&(i.uniforms.add("texMetallicRoughness","sampler2D"),t.supportsTextureAtlas&&i.uniforms.add("texMetallicRoughnessSize","vec2"),i.code.add(a.H`void applyMetallnessAndRoughness(TextureLookupParameter params) {
vec3 metallicRoughness = textureLookup(texMetallicRoughness, params).rgb;
mrr[0] *= metallicRoughness.b;
mrr[1] *= metallicRoughness.g;
}`)),t.hasEmissionTexture&&(i.uniforms.add("texEmission","sampler2D"),t.supportsTextureAtlas&&i.uniforms.add("texEmissionSize","vec2"),i.code.add(a.H`void applyEmission(TextureLookupParameter params) {
emission *= textureLookup(texEmission, params).rgb;
}`)),t.hasOcclusionTexture?(i.uniforms.add("texOcclusion","sampler2D"),t.supportsTextureAtlas&&i.uniforms.add("texOcclusionSize","vec2"),i.code.add(a.H`void applyOcclusion(TextureLookupParameter params) {
occlusion *= textureLookup(texOcclusion, params).r;
}
float getBakedOcclusion() {
return occlusion;
}`)):i.code.add(a.H`float getBakedOcclusion() { return 1.0; }`),i.code.add(a.H`
    void applyPBRFactors() {
      mrr = mrrFactors;
      emission = emissionFactor;
      occlusion = 1.0;
      ${r?"vtc.uv = vuv0;":""}
      ${t.hasMetalnessAndRoughnessTexture?t.supportsTextureAtlas?"vtc.size = texMetallicRoughnessSize; applyMetallnessAndRoughness(vtc);":"applyMetallnessAndRoughness(vtc);":""}
      ${t.hasEmissionTexture?t.supportsTextureAtlas?"vtc.size = texEmissionSize; applyEmission(vtc);":"applyEmission(vtc);":""}
      ${t.hasOcclusionTexture?t.supportsTextureAtlas?"vtc.size = texOcclusionSize; applyOcclusion(vtc);":"applyOcclusion(vtc);":""}
    }
  `))):i.code.add(a.H`const vec3 mrr = vec3(0.0, 0.6, 0.2);
const vec3 emission = vec3(0.0);
float occlusion = 1.0;
void applyPBRFactors() {}
float getBakedOcclusion() { return 1.0; }`)}function s(e,t,i=!1){i||(e.setUniform3fv("mrrFactors",t.mrrFactors),e.setUniform3fv("emissionFactor",t.emissiveFactor))}(0,r.f)(0,.6,.2)},95509:(e,t,i)=>{i.d(t,{e:()=>o});var r=i(23410);function o(e){e.vertex.code.add(r.H`const float PI = 3.141592653589793;`),e.fragment.code.add(r.H`const float PI = 3.141592653589793;
const float LIGHT_NORMALIZATION = 1.0 / PI;
const float INV_PI = 0.3183098861837907;
const float HALF_PI = 1.570796326794897;`)}},20105:(e,t,i)=>{i.d(t,{hX:()=>a,vL:()=>n});var r=i(9794),o=i(23410);function a(e){e.fragment.include(r.n),e.fragment.uniforms.add("uShadowMapTex","sampler2D"),e.fragment.uniforms.add("uShadowMapNum","int"),e.fragment.uniforms.add("uShadowMapDistance","vec4"),e.fragment.uniforms.add("uShadowMapMatrix","mat4",4),e.fragment.uniforms.add("uDepthHalfPixelSz","float"),e.fragment.code.add(o.H`int chooseCascade(float _linearDepth, out mat4 mat) {
vec4 distance = uShadowMapDistance;
float depth = _linearDepth;
int i = depth < distance[1] ? 0 : depth < distance[2] ? 1 : depth < distance[3] ? 2 : 3;
mat = i == 0 ? uShadowMapMatrix[0] : i == 1 ? uShadowMapMatrix[1] : i == 2 ? uShadowMapMatrix[2] : uShadowMapMatrix[3];
return i;
}
vec3 lightSpacePosition(vec3 _vpos, mat4 mat) {
vec4 lv = mat * vec4(_vpos, 1.0);
lv.xy /= lv.w;
return 0.5 * lv.xyz + vec3(0.5);
}
vec2 cascadeCoordinates(int i, vec3 lvpos) {
return vec2(float(i - 2 * (i / 2)) * 0.5, float(i / 2) * 0.5) + 0.5 * lvpos.xy;
}
float readShadowMapDepth(vec2 uv, sampler2D _depthTex) {
return rgba2float(texture2D(_depthTex, uv));
}
float posIsInShadow(vec2 uv, vec3 lvpos, sampler2D _depthTex) {
return readShadowMapDepth(uv, _depthTex) < lvpos.z ? 1.0 : 0.0;
}
float filterShadow(vec2 uv, vec3 lvpos, float halfPixelSize, sampler2D _depthTex) {
float texSize = 0.5 / halfPixelSize;
vec2 st = fract((vec2(halfPixelSize) + uv) * texSize);
float s00 = posIsInShadow(uv + vec2(-halfPixelSize, -halfPixelSize), lvpos, _depthTex);
float s10 = posIsInShadow(uv + vec2(halfPixelSize, -halfPixelSize), lvpos, _depthTex);
float s11 = posIsInShadow(uv + vec2(halfPixelSize, halfPixelSize), lvpos, _depthTex);
float s01 = posIsInShadow(uv + vec2(-halfPixelSize, halfPixelSize), lvpos, _depthTex);
return mix(mix(s00, s10, st.x), mix(s01, s11, st.x), st.y);
}
float readShadowMap(const in vec3 _vpos, float _linearDepth) {
mat4 mat;
int i = chooseCascade(_linearDepth, mat);
if (i >= uShadowMapNum) { return 0.0; }
vec3 lvpos = lightSpacePosition(_vpos, mat);
if (lvpos.z >= 1.0) { return 0.0; }
if (lvpos.x < 0.0 || lvpos.x > 1.0 || lvpos.y < 0.0 || lvpos.y > 1.0) { return 0.0; }
vec2 uv = cascadeCoordinates(i, lvpos);
return filterShadow(uv, lvpos, uDepthHalfPixelSz, uShadowMapTex);
}`)}function n(e,t,i){t.shadowMappingEnabled&&t.shadowMap.bindView(e,i)}},12664:(e,t,i)=>{i.d(t,{kl:()=>o,uj:()=>a});var r=i(23410);function o(e,t){t.vvInstancingEnabled&&(t.vvSize||t.vvColor)&&e.attributes.add("instanceFeatureAttribute","vec4"),t.vvSize?(e.vertex.uniforms.add("vvSizeMinSize","vec3"),e.vertex.uniforms.add("vvSizeMaxSize","vec3"),e.vertex.uniforms.add("vvSizeOffset","vec3"),e.vertex.uniforms.add("vvSizeFactor","vec3"),e.vertex.uniforms.add("vvSymbolRotationMatrix","mat3"),e.vertex.uniforms.add("vvSymbolAnchor","vec3"),e.vertex.code.add(r.H`vec3 vvScale(vec4 _featureAttribute) {
return clamp(vvSizeOffset + _featureAttribute.x * vvSizeFactor, vvSizeMinSize, vvSizeMaxSize);
}
vec4 vvTransformPosition(vec3 position, vec4 _featureAttribute) {
return vec4(vvSymbolRotationMatrix * ( vvScale(_featureAttribute) * (position + vvSymbolAnchor)), 1.0);
}`),e.vertex.code.add(r.H`
      const float eps = 1.192092896e-07;
      vec4 vvTransformNormal(vec3 _normal, vec4 _featureAttribute) {
        vec3 vvScale = clamp(vvSizeOffset + _featureAttribute.x * vvSizeFactor, vvSizeMinSize + eps, vvSizeMaxSize);
        return vec4(vvSymbolRotationMatrix * _normal / vvScale, 1.0);
      }

      ${t.vvInstancingEnabled?r.H`
      vec4 vvLocalNormal(vec3 _normal) {
        return vvTransformNormal(_normal, instanceFeatureAttribute);
      }

      vec4 localPosition() {
        return vvTransformPosition(position, instanceFeatureAttribute);
      }`:""}
    `)):e.vertex.code.add(r.H`vec4 localPosition() { return vec4(position, 1.0); }
vec4 vvLocalNormal(vec3 _normal) { return vec4(_normal, 1.0); }`),t.vvColor?(e.vertex.constants.add("vvColorNumber","int",8),e.vertex.code.add(r.H`
      uniform float vvColorValues[vvColorNumber];
      uniform vec4 vvColorColors[vvColorNumber];

      vec4 vvGetColor(vec4 featureAttribute, float values[vvColorNumber], vec4 colors[vvColorNumber]) {
        float value = featureAttribute.y;
        if (value <= values[0]) {
          return colors[0];
        }

        for (int i = 1; i < vvColorNumber; ++i) {
          if (values[i] >= value) {
            float f = (value - values[i-1]) / (values[i] - values[i-1]);
            return mix(colors[i-1], colors[i], f);
          }
        }
        return colors[vvColorNumber - 1];
      }

      ${t.vvInstancingEnabled?r.H`
      vec4 vvColor() {
        return vvGetColor(instanceFeatureAttribute, vvColorValues, vvColorColors);
      }`:""}
    `)):e.vertex.code.add(r.H`vec4 vvColor() { return vec4(1.0); }`)}function a(e,t){(function(e,t){t.vvSizeEnabled&&(e.setUniform3fv("vvSizeMinSize",t.vvSizeMinSize),e.setUniform3fv("vvSizeMaxSize",t.vvSizeMaxSize),e.setUniform3fv("vvSizeOffset",t.vvSizeOffset),e.setUniform3fv("vvSizeFactor",t.vvSizeFactor)),t.vvColorEnabled&&(e.setUniform1fv("vvColorValues",t.vvColorValues),e.setUniform4fv("vvColorColors",t.vvColorColors))})(e,t),t.vvSizeEnabled&&(e.setUniform3fv("vvSymbolAnchor",t.vvSymbolAnchor),e.setUniformMatrix3fv("vvSymbolRotationMatrix",t.vvSymbolRotationMatrix))}},41272:(e,t,i)=>{i.d(t,{sj:()=>n,F:()=>o,bf:()=>a});var r=i(23410);const o=.1,a=.001;function n(e,t){const i=e.fragment;switch(t.alphaDiscardMode){case 0:i.code.add(r.H`
        #define discardOrAdjustAlpha(color) { if (color.a < ${r.H.float(a)}) { discard; } }
      `);break;case 1:i.code.add(r.H`void discardOrAdjustAlpha(inout vec4 color) {
color.a = 1.0;
}`);break;case 2:i.uniforms.add("textureAlphaCutoff","float"),i.code.add(r.H`#define discardOrAdjustAlpha(color) { if (color.a < textureAlphaCutoff) { discard; } else { color.a = 1.0; } }`);break;case 3:e.fragment.uniforms.add("textureAlphaCutoff","float"),e.fragment.code.add(r.H`#define discardOrAdjustAlpha(color) { if (color.a < textureAlphaCutoff) { discard; } }`)}}},5331:(e,t,i)=>{i.d(t,{$:()=>a,I:()=>n});var r=i(39994),o=i(23410);function a({code:e},t){t.doublePrecisionRequiresObfuscation?e.add(o.H`vec3 dpPlusFrc(vec3 a, vec3 b) {
return mix(a, a + b, vec3(notEqual(b, vec3(0))));
}
vec3 dpMinusFrc(vec3 a, vec3 b) {
return mix(vec3(0), a - b, vec3(notEqual(a, b)));
}
vec3 dpAdd(vec3 hiA, vec3 loA, vec3 hiB, vec3 loB) {
vec3 t1 = dpPlusFrc(hiA, hiB);
vec3 e = dpMinusFrc(t1, hiA);
vec3 t2 = dpMinusFrc(hiB, e) + dpMinusFrc(hiA, dpMinusFrc(t1, e)) + loA + loB;
return t1 + t2;
}`):e.add(o.H`vec3 dpAdd(vec3 hiA, vec3 loA, vec3 hiB, vec3 loB) {
vec3 t1 = hiA + hiB;
vec3 e = t1 - hiA;
vec3 t2 = ((hiB - e) + (hiA - (t1 - e))) + loA + loB;
return t1 + t2;
}`)}function n(e){return!!(0,r.Z)("force-double-precision-obfuscation")||e.driverTest.doublePrecisionRequiresObfuscation}},78115:(e,t,i)=>{i.d(t,{a:()=>a});var r=i(23410),o=i(6174);function a(e,t){const i=r.H`
  /*
  *  ${t.name}
  *  ${0===t.output?"RenderOutput: Color":1===t.output?"RenderOutput: Depth":3===t.output?"RenderOutput: Shadow":2===t.output?"RenderOutput: Normal":4===t.output?"RenderOutput: Highlight":""}
  */
  `;(0,o.CG)()&&(e.fragment.code.add(i),e.vertex.code.add(i))}},10938:(e,t,i)=>{i.d(t,{y:()=>a});var r=i(23410);function o(e){e.code.add(r.H`vec4 premultiplyAlpha(vec4 v) {
return vec4(v.rgb * v.a, v.a);
}
vec3 rgb2hsv(vec3 c) {
vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
vec4 p = c.g < c.b ? vec4(c.bg, K.wz) : vec4(c.gb, K.xy);
vec4 q = c.r < p.x ? vec4(p.xyw, c.r) : vec4(c.r, p.yzx);
float d = q.x - min(q.w, q.y);
float e = 1.0e-10;
return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), min(d / (q.x + e), 1.0), q.x);
}
vec3 hsv2rgb(vec3 c) {
vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
float rgb2v(vec3 c) {
return max(c.x, max(c.y, c.z));
}`)}function a(e){e.include(o),e.code.add(r.H`
    vec3 mixExternalColor(vec3 internalColor, vec3 textureColor, vec3 externalColor, int mode) {
      // workaround for artifacts in OSX using Intel Iris Pro
      // see: 
      vec3 internalMixed = internalColor * textureColor;
      vec3 allMixed = internalMixed * externalColor;

      if (mode == ${r.H.int(1)}) {
        return allMixed;
      }
      else if (mode == ${r.H.int(2)}) {
        return internalMixed;
      }
      else if (mode == ${r.H.int(3)}) {
        return externalColor;
      }
      else {
        // tint (or something invalid)
        float vIn = rgb2v(internalMixed);
        vec3 hsvTint = rgb2hsv(externalColor);
        vec3 hsvOut = vec3(hsvTint.x, hsvTint.y, vIn * hsvTint.z);
        return hsv2rgb(hsvOut);
      }
    }

    float mixExternalOpacity(float internalOpacity, float textureOpacity, float externalOpacity, int mode) {
      // workaround for artifacts in OSX using Intel Iris Pro
      // see: 
      float internalMixed = internalOpacity * textureOpacity;
      float allMixed = internalMixed * externalOpacity;

      if (mode == ${r.H.int(2)}) {
        return internalMixed;
      }
      else if (mode == ${r.H.int(3)}) {
        return externalOpacity;
      }
      else {
        // multiply or tint (or something invalid)
        return allMixed;
      }
    }
  `)}},9794:(e,t,i)=>{i.d(t,{n:()=>o});var r=i(23410);function o(e){e.code.add(r.H`const float MAX_RGBA_FLOAT =
255.0 / 256.0 +
255.0 / 256.0 / 256.0 +
255.0 / 256.0 / 256.0 / 256.0 +
255.0 / 256.0 / 256.0 / 256.0 / 256.0;
const vec4 FIXED_POINT_FACTORS = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);
vec4 float2rgba(const float value) {
float valueInValidDomain = clamp(value, 0.0, MAX_RGBA_FLOAT);
vec4 fixedPointU8 = floor(fract(valueInValidDomain * FIXED_POINT_FACTORS) * 256.0);
const float toU8AsFloat = 1.0 / 255.0;
return fixedPointU8 * toU8AsFloat;
}
const vec4 RGBA_2_FLOAT_FACTORS = vec4(
255.0 / (256.0),
255.0 / (256.0 * 256.0),
255.0 / (256.0 * 256.0 * 256.0),
255.0 / (256.0 * 256.0 * 256.0 * 256.0)
);
float rgba2float(vec4 rgba) {
return dot(rgba, RGBA_2_FLOAT_FACTORS);
}`)}},3961:(e,t,i)=>{i.d(t,{kG:()=>a});const r=i(13802).Z.getLogger("esri.views.3d.webgl-engine.core.shaderModules.shaderBuilder");class o{constructor(){this.includedModules=new Map}include(e,t){this.includedModules.has(e)?this.includedModules.get(e)!==t&&r.error("Trying to include shader module multiple times with different sets of options."):(this.includedModules.set(e,t),e(this.builder,t))}}class a extends o{constructor(){super(...arguments),this.vertex=new l,this.fragment=new l,this.attributes=new c,this.varyings=new d,this.extensions=new u,this.constants=new h}get fragmentUniforms(){return this.fragment.uniforms}get builder(){return this}generateSource(e){const t=this.extensions.generateSource(e),i=this.attributes.generateSource(e),r=this.varyings.generateSource(),o="vertex"===e?this.vertex:this.fragment,a=o.uniforms.generateSource(),n=o.code.generateSource(),s="vertex"===e?m:p,l=this.constants.generateSource().concat(o.constants.generateSource());return`\n${t.join("\n")}\n\n${s}\n\n${l.join("\n")}\n\n${a.join("\n")}\n\n${i.join("\n")}\n\n${r.join("\n")}\n\n${n.join("\n")}`}}class n{constructor(){this._entries=new Map}add(e,t,i){const r=`${e}_${t}_${i}`;return this._entries.set(r,{name:e,type:t,arraySize:i}),this}generateSource(){return Array.from(this._entries.values()).map((e=>{return`uniform ${e.type} ${e.name}${t=e.arraySize,t?`[${t}]`:""};`;var t}))}get entries(){return Array.from(this._entries.values())}}class s{constructor(){this._entries=new Array}add(e){this._entries.push(e)}generateSource(){return this._entries}}class l extends o{constructor(){super(...arguments),this.uniforms=new n,this.code=new s,this.constants=new h}get builder(){return this}}class c{constructor(){this._entries=new Array}add(e,t){this._entries.push([e,t])}generateSource(e){return"fragment"===e?[]:this._entries.map((e=>`attribute ${e[1]} ${e[0]};`))}}class d{constructor(){this._entries=new Array}add(e,t){this._entries.push([e,t])}generateSource(){return this._entries.map((e=>`varying ${e[1]} ${e[0]};`))}}class u{constructor(){this._entries=new Set}add(e){this._entries.add(e)}generateSource(e){const t="vertex"===e?u.ALLOWLIST_VERTEX:u.ALLOWLIST_FRAGMENT;return Array.from(this._entries).filter((e=>t.includes(e))).map((e=>`#extension ${e} : enable`))}}u.ALLOWLIST_FRAGMENT=["GL_EXT_shader_texture_lod","GL_OES_standard_derivatives"],u.ALLOWLIST_VERTEX=[];class h{constructor(){this._entries=[]}add(e,t,i){let r="ERROR_CONSTRUCTOR_STRING";switch(t){case"float":r=h.numberToFloatStr(i);break;case"int":r=h.numberToIntStr(i);break;case"bool":r=i.toString();break;case"vec2":r=`vec2(${h.numberToFloatStr(i[0])},                            ${h.numberToFloatStr(i[1])})`;break;case"vec3":r=`vec3(${h.numberToFloatStr(i[0])},                            ${h.numberToFloatStr(i[1])},                            ${h.numberToFloatStr(i[2])})`;break;case"vec4":r=`vec4(${h.numberToFloatStr(i[0])},                            ${h.numberToFloatStr(i[1])},                            ${h.numberToFloatStr(i[2])},                            ${h.numberToFloatStr(i[3])})`;break;case"ivec2":r=`ivec2(${h.numberToIntStr(i[0])},                             ${h.numberToIntStr(i[1])})`;break;case"ivec3":r=`ivec3(${h.numberToIntStr(i[0])},                             ${h.numberToIntStr(i[1])},                             ${h.numberToIntStr(i[2])})`;break;case"ivec4":r=`ivec4(${h.numberToIntStr(i[0])},                             ${h.numberToIntStr(i[1])},                             ${h.numberToIntStr(i[2])},                             ${h.numberToIntStr(i[3])})`;break;case"mat2":case"mat3":case"mat4":r=`${t}(${Array.prototype.map.call(i,(e=>h.numberToFloatStr(e))).join(", ")})`}return this._entries.push(`const ${t} ${e} = ${r};`),this}static numberToIntStr(e){return e.toFixed(0)}static numberToFloatStr(e){return Number.isInteger(e)?e.toFixed(1):e.toString()}generateSource(){return Array.from(this._entries)}}const p="#ifdef GL_FRAGMENT_PRECISION_HIGH\n  precision highp float;\n  precision highp sampler2D;\n#else\n  precision mediump float;\n  precision mediump sampler2D;\n#endif",m="precision highp float;\nprecision highp sampler2D;"},23410:(e,t,i)=>{function r(e,...t){let i="";for(let r=0;r<t.length;r++)i+=e[r]+t[r];return i+=e[e.length-1],i}i.d(t,{H:()=>r}),function(e){e.int=function(e){return Math.round(e).toString()},e.float=function(e){return e.toPrecision(8)}}(r||(r={}))},12045:(e,t,i)=>{i.d(t,{$L:()=>s,$x:()=>u,ve:()=>l,IB:()=>n,wu:()=>o,je:()=>d});var r=i(17346);const o=(0,r.wK)(770,1,771,771),a=(0,r.if)(1,1),n=(0,r.if)(0,771);function s(e){return 2===e?null:1===e?n:a}const l=5e5,c={factor:-1,units:-2};function d(e){return e?c:null}function u(e){return 3===e||2===e?513:515}},54443:(e,t,i)=>{i.d(t,{bj:()=>y,FZ:()=>C,Uf:()=>w,Bw:()=>p,LO:()=>S,Hx:()=>T});var r=i(19431),o=i(61681),a=i(6766),n=i(8909),s=i(37116);function l(e,t,i,o){return function(e,t){return Math.max((0,r.t7)(e*t.scale,e,t.factor),function(e,t){return 0===e?t.minPixelSize:t.minPixelSize*(1+2*t.paddingPixels/e)}(e,t))}(e,function(e,t,i){const r=i.parameters,o=i.paddingPixelsOverride;return c.scale=Math.min(r.divisor/(t-r.offset),1),c.factor=function(e){return Math.abs(e*e*e)}(e),c.minPixelSize=r.minPixelSize,c.paddingPixels=o,c}(t,i,o))}(0,r.Vl)(10),(0,r.Vl)(12),(0,r.Vl)(70),(0,r.Vl)(40);const c={scale:0,factor:0,minPixelSize:0,paddingPixels:0};var d=i(15095),u=(i(24455),i(39100));i(30560),new Float64Array(3),new Float32Array(6),(0,u.c)();const h=(0,s.Ue)();function p(e,t,i,r,a,n,s){if(!function(e){return!!(0,o.pC)(e)&&!e.visible}(t))if(e.boundingInfo){(0,d.hu)(0===e.primitiveType);const t=i.tolerance;f(e.boundingInfo,r,a,t,n,s)}else{const t=e.indices.get("position"),i=e.vertexAttributes.get("position");g(r,a,0,t.length/3,t,i,void 0,n,s)}}const m=(0,n.c)();function f(e,t,i,r,n,l){if((0,o.Wi)(e))return;const c=function(e,t,i){return(0,a.s)(i,1/(t[0]-e[0]),1/(t[1]-e[1]),1/(t[2]-e[2]))}(t,i,m);if((0,s.op)(h,e.getBBMin()),(0,s.Tn)(h,e.getBBMax()),(0,o.pC)(n)&&n.applyToAabb(h),function(e,t,i,r){return function(e,t,i,r,o){const a=(e[0]-r-t[0])*i[0],n=(e[3]+r-t[0])*i[0];let s=Math.min(a,n),l=Math.max(a,n);const c=(e[1]-r-t[1])*i[1],d=(e[4]+r-t[1])*i[1];if(l=Math.min(l,Math.max(c,d)),l<0)return!1;if(s=Math.max(s,Math.min(c,d)),s>l)return!1;const u=(e[2]-r-t[2])*i[2],h=(e[5]+r-t[2])*i[2];return l=Math.min(l,Math.max(u,h)),!(l<0)&&(s=Math.max(s,Math.min(u,h)),!(s>l)&&s<1/0)}(e,t,i,r)}(h,t,c,r)){const{primitiveIndices:o,indices:a,position:s}=e,c=o?o.length:a.length/3;if(c>A){const o=e.getChildren();if(void 0!==o){for(let e=0;e<8;++e)void 0!==o[e]&&f(o[e],t,i,r,n,l);return}}g(t,i,0,c,a,s,o,n,l)}}const v=(0,n.c)();function g(e,t,i,r,a,n,s,l,c){if(s)return function(e,t,i,r,a,n,s,l,c){const d=n.data,u=n.stride||n.size,h=e[0],p=e[1],m=e[2],f=t[0]-h,g=t[1]-p,x=t[2]-m;for(let e=i;e<r;++e){const t=s[e];let i=3*t,r=u*a[i++],n=d[r++],b=d[r++],T=d[r];r=u*a[i++];let y=d[r++],w=d[r++],S=d[r];r=u*a[i];let M=d[r++],C=d[r++],A=d[r];(0,o.pC)(l)&&([n,b,T]=l.applyToVertex(n,b,T,e),[y,w,S]=l.applyToVertex(y,w,S,e),[M,C,A]=l.applyToVertex(M,C,A,e));const P=y-n,O=w-b,F=S-T,I=M-n,H=C-b,D=A-T,z=g*D-H*x,E=x*I-D*f,L=f*H-I*g,R=P*z+O*E+F*L;if(Math.abs(R)<=Number.EPSILON)continue;const N=h-n,B=p-b,V=m-T,W=N*z+B*E+V*L;if(R>0){if(W<0||W>R)continue}else if(W>0||W<R)continue;const U=B*F-O*V,G=V*P-F*N,k=N*O-P*B,$=f*U+g*G+x*k;if(R>0){if($<0||W+$>R)continue}else if($>0||W+$<R)continue;const q=(I*U+H*G+D*k)/R;q>=0&&c(q,_(P,O,F,I,H,D,v),t,!1)}}(e,t,i,r,a,n,s,l,c);const d=n.data,u=n.stride||n.size,h=e[0],p=e[1],m=e[2],f=t[0]-h,g=t[1]-p,x=t[2]-m;for(let e=i,t=3*i;e<r;++e){let i=u*a[t++],r=d[i++],n=d[i++],s=d[i];i=u*a[t++];let b=d[i++],T=d[i++],y=d[i];i=u*a[t++];let w=d[i++],S=d[i++],M=d[i];(0,o.pC)(l)&&([r,n,s]=l.applyToVertex(r,n,s,e),[b,T,y]=l.applyToVertex(b,T,y,e),[w,S,M]=l.applyToVertex(w,S,M,e));const C=b-r,A=T-n,P=y-s,O=w-r,F=S-n,I=M-s,H=g*I-F*x,D=x*O-I*f,z=f*F-O*g,E=C*H+A*D+P*z;if(Math.abs(E)<=Number.EPSILON)continue;const L=h-r,R=p-n,N=m-s,B=L*H+R*D+N*z;if(E>0){if(B<0||B>E)continue}else if(B>0||B<E)continue;const V=R*P-A*N,W=N*C-P*L,U=L*A-C*R,G=f*V+g*W+x*U;if(E>0){if(G<0||B+G>E)continue}else if(G>0||B+G<E)continue;const k=(O*V+F*W+I*U)/E;k>=0&&c(k,_(C,A,P,O,F,I,v),e,!1)}}const x=(0,n.c)(),b=(0,n.c)();function _(e,t,i,r,o,n,s){return(0,a.s)(x,e,t,i),(0,a.s)(b,r,o,n),(0,a.c)(s,x,b),(0,a.n)(s,s),s}function T(e,t,i,o,a){let n=(i.screenLength||0)*e.pixelRatio;a&&(n=l(n,o,t,a));const s=n*Math.tan(.5*e.fovY)/(.5*e.fullHeight);return(0,r.uZ)(s*t,i.minWorldLength||0,null!=i.maxWorldLength?i.maxWorldLength:1/0)}function y(e,t,i){if(!e)return;const r=e.parameters,o=e.paddingPixelsOverride;t.setUniform4f(i,r.divisor,r.offset,r.minPixelSize,o)}function w(e,t){const i=t?w(t):{};for(const t in e){let r=e[t];r&&r.forEach&&(r=M(r)),null==r&&t in i||(i[t]=r)}return i}function S(e,t){let i=!1;for(const r in t){const o=t[r];void 0!==o&&(i=!0,Array.isArray(o)?e[r]=o.slice():e[r]=o)}return i}function M(e){const t=[];return e.forEach((e=>t.push(e))),t}const C={multiply:1,ignore:2,replace:3,tint:4},A=1e3},43487:(e,t,i)=>{i.d(t,{Z:()=>l});var r=i(19431),o=i(61681),a=i(6174),n=i(91907),s=i(79193);class l{constructor(e,t,i=null){this._context=e,this.type="texture",this._glName=null,this._descriptor=void 0,this._samplingModeDirty=!1,this._wrapModeDirty=!1,e.instanceCounter.increment(n._g.Texture,this),this._descriptor={target:3553,samplingMode:9729,wrapMode:10497,flipped:!1,hasMipmap:!1,isOpaque:!1,unpackAlignment:4,preMultiplyAlpha:!1,...t},34067===this._descriptor.target?this.setDataCubeMap(i):this.setData(i)}get glName(){return this._glName}get descriptor(){return this._descriptor}get isDirty(){return this._samplingModeDirty||this._wrapModeDirty}dispose(){this._context.gl&&this._glName&&(this._context.unbindTextureAllUnits(this),this._context.gl.deleteTexture(this._glName),this._glName=null,this._context.instanceCounter.decrement(n._g.Texture,this))}release(){this.dispose()}resize(e,t){const i=this._descriptor;i.width===e&&i.height===t||(i.width=e,i.height=t,34067===this._descriptor.target?this.setDataCubeMap(null):this.setData(null))}setDataCubeMap(e=null){for(let t=34069;t<=34074;t++)this.setData(e,t)}setData(e,t=3553){if(!this._context||!this._context.gl)return;const i=this._context.gl;this._glName||(this._glName=i.createTexture()),void 0===e&&(e=null),null===e&&(this._descriptor.width=this._descriptor.width||4,this._descriptor.height=this._descriptor.height||4);const r=this._context.bindTexture(this,l.TEXTURE_UNIT_FOR_UPDATES),n=this._descriptor;l._validateTexture(this._context,n),i.pixelStorei(i.UNPACK_ALIGNMENT,n.unpackAlignment),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,n.flipped?1:0),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,n.preMultiplyAlpha?1:0);const s=n.pixelFormat;let c=n.internalFormat?n.internalFormat:this._deriveInternalFormat(s,n.dataType);if(e instanceof ImageData||e instanceof HTMLImageElement||e instanceof HTMLCanvasElement||e instanceof HTMLVideoElement){let r=e.width,o=e.height;e instanceof HTMLVideoElement&&(r=e.videoWidth,o=e.videoHeight),n.width&&n.height,i.texImage2D(t,0,c,s,n.dataType,e),(0,a.zu)(i),n.hasMipmap&&this.generateMipmap(),void 0===n.width&&(n.width=r),void 0===n.height&&(n.height=o)}else{null!=n.width&&null!=n.height||console.error("Width and height must be specified!"),i.DEPTH24_STENCIL8&&c===i.DEPTH_STENCIL&&(c=i.DEPTH24_STENCIL8);let r=n.width,l=n.height;if(function(e){return(0,o.pC)(e)&&"type"in e&&"compressed"===e.type}(e)){const o=Math.round(Math.log(Math.max(r,l))/Math.LN2)+1;n.hasMipmap=n.hasMipmap&&o===e.levels.length;for(let o=0;;++o){const a=e.levels[Math.min(o,e.levels.length-1)];if(i.compressedTexImage2D(t,o,c,r,l,0,a),1===r&&1===l||!n.hasMipmap)break;r=Math.max(1,r>>1),l=Math.max(1,l>>1)}}else if((0,o.pC)(e))i.texImage2D(t,0,c,r,l,0,s,n.dataType,e),(0,a.zu)(i),n.hasMipmap&&this.generateMipmap();else for(let e=0;i.texImage2D(t,e,c,r,l,0,s,n.dataType,null),(0,a.zu)(i),(1!==r||1!==l)&&n.hasMipmap;++e)r=Math.max(1,r>>1),l=Math.max(1,l>>1)}l._applySamplingMode(i,this._descriptor),l._applyWrapMode(i,this._descriptor),l._applyAnisotropicFilteringParameters(this._context,this._descriptor),(0,a.zu)(i),this._context.bindTexture(r,l.TEXTURE_UNIT_FOR_UPDATES)}updateData(e,t,i,r,o,a,n=3553){a||console.error("An attempt to use uninitialized data!"),this._glName||console.error("An attempt to update uninitialized texture!");const s=this._context.gl,c=this._descriptor,d=this._context.bindTexture(this,l.TEXTURE_UNIT_FOR_UPDATES);(t<0||i<0||r>c.width||o>c.height||t+r>c.width||i+o>c.height)&&console.error("An attempt to update out of bounds of the texture!"),s.pixelStorei(s.UNPACK_ALIGNMENT,c.unpackAlignment),s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,c.flipped?1:0),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,c.preMultiplyAlpha?1:0),a instanceof ImageData||a instanceof HTMLImageElement||a instanceof HTMLCanvasElement||a instanceof HTMLVideoElement?s.texSubImage2D(n,e,t,i,c.pixelFormat,c.dataType,a):s.texSubImage2D(n,e,t,i,r,o,c.pixelFormat,c.dataType,a),this._context.bindTexture(d,l.TEXTURE_UNIT_FOR_UPDATES)}generateMipmap(){const e=this._descriptor;e.hasMipmap||(e.hasMipmap=!0,this._samplingModeDirty=!0,l._validateTexture(this._context,e)),9729===e.samplingMode?(this._samplingModeDirty=!0,e.samplingMode=9985):9728===e.samplingMode&&(this._samplingModeDirty=!0,e.samplingMode=9984);const t=this._context.bindTexture(this,l.TEXTURE_UNIT_FOR_UPDATES);this._context.gl.generateMipmap(e.target),this._context.bindTexture(t,l.TEXTURE_UNIT_FOR_UPDATES)}setSamplingMode(e){e!==this._descriptor.samplingMode&&(this._descriptor.samplingMode=e,this._samplingModeDirty=!0)}setWrapMode(e){e!==this._descriptor.wrapMode&&(this._descriptor.wrapMode=e,l._validateTexture(this._context,this._descriptor),this._wrapModeDirty=!0)}applyChanges(){const e=this._context.gl,t=this._descriptor;this._samplingModeDirty&&(l._applySamplingMode(e,t),this._samplingModeDirty=!1),this._wrapModeDirty&&(l._applyWrapMode(e,t),this._wrapModeDirty=!1)}_deriveInternalFormat(e,t){if("webgl"===this._context.webglVersion)return e;if(5126===t)switch(e){case 6408:return 34836;case 6407:return 34837;default:throw new Error("Unable to derive format")}return e}static _validateTexture(e,t){(t.width<0||t.height<0)&&console.error("Negative dimension parameters are not allowed!");const i=(0,r.wt)(t.width)&&(0,r.wt)(t.height);(0,s.Z)(e.gl)||i||("number"==typeof t.wrapMode?33071!==t.wrapMode&&console.error("Non-power-of-two textures must have a wrap mode of CLAMP_TO_EDGE!"):33071===t.wrapMode.s&&33071===t.wrapMode.t||console.error("Non-power-of-two textures must have a wrap mode of CLAMP_TO_EDGE!"),t.hasMipmap&&console.error("Mipmapping requires power-of-two textures!"))}static _applySamplingMode(e,t){let i=t.samplingMode,r=t.samplingMode;9985===i||9987===i?(i=9729,t.hasMipmap||(r=9729)):9984!==i&&9986!==i||(i=9728,t.hasMipmap||(r=9728)),e.texParameteri(t.target,e.TEXTURE_MAG_FILTER,i),e.texParameteri(t.target,e.TEXTURE_MIN_FILTER,r)}static _applyWrapMode(e,t){"number"==typeof t.wrapMode?(e.texParameteri(t.target,e.TEXTURE_WRAP_S,t.wrapMode),e.texParameteri(t.target,e.TEXTURE_WRAP_T,t.wrapMode)):(e.texParameteri(t.target,e.TEXTURE_WRAP_S,t.wrapMode.s),e.texParameteri(t.target,e.TEXTURE_WRAP_T,t.wrapMode.t))}static _applyAnisotropicFilteringParameters(e,t){var i;const r=e.capabilities.textureFilterAnisotropic;r&&e.gl.texParameterf(t.target,r.TEXTURE_MAX_ANISOTROPY,null!=(i=t.maxAnisotropy)?i:1)}}l.TEXTURE_UNIT_FOR_UPDATES=0},79193:(e,t,i)=>{function r(e){return window.WebGL2RenderingContext&&e instanceof window.WebGL2RenderingContext}i.d(t,{Z:()=>r})},6174:(e,t,i)=>{i.d(t,{zu:()=>c,hZ:()=>s,CG:()=>l});var r=i(70375),o=i(39994);const a=i(13802).Z.getLogger("esri/views/webgl"),n=!!(0,o.Z)("enable-feature:webgl-debug");function s(){return n}function l(){return n}function c(e){if(s()){const t=e.getError();if(t){const i=function(e,t){switch(t){case e.INVALID_ENUM:return"Invalid Enum. An unacceptable value has been specified for an enumerated argument.";case e.INVALID_VALUE:return"Invalid Value. A numeric argument is out of range.";case e.INVALID_OPERATION:return"Invalid Operation. The specified command is not allowed for the current state.";case e.INVALID_FRAMEBUFFER_OPERATION:return"Invalid Framebuffer operation. The currently bound framebuffer is not framebuffer complete when trying to render to or to read from it.";case e.OUT_OF_MEMORY:return"Out of memory. Not enough memory is left to execute the command.";case e.CONTEXT_LOST_WEBGL:return"WebGL context has been lost";default:return"Unknown error"}}(e,t),o=(new Error).stack;a.error(new r.Z("webgl-error","WebGL error occured",{message:i,stack:o}))}}}},30560:(e,t,i)=>{function r(e,t,i){for(let r=0;r<i;++r)t[2*r]=e[r],t[2*r+1]=e[r]-t[2*r]}function o(e,t,i,o){for(let s=0;s<o;++s)a[0]=e[s],r(a,n,1),t[s]=n[0],i[s]=n[1]}i.d(t,{LF:()=>r,po:()=>o});const a=new Float64Array(1),n=new Float32Array(2)},91907:(e,t,i)=>{i.d(t,{Ld:()=>r,Lu:()=>a,_g:()=>o});const r=33984;var o;!function(e){e[e.Texture=0]="Texture",e[e.Buffer=1]="Buffer",e[e.VAO=2]="VAO",e[e.VertexShader=3]="VertexShader",e[e.FragmentShader=4]="FragmentShader",e[e.Program=5]="Program",e[e.Framebuffer=6]="Framebuffer",e[e.Renderbuffer=7]="Renderbuffer",e[e.COUNT=8]="COUNT"}(o||(o={}));const a=33306},17346:(e,t,i)=>{function r(e,t,i=32774,r=[0,0,0,0]){return{srcRgb:e,srcAlpha:e,dstRgb:t,dstAlpha:t,opRgb:i,opAlpha:i,color:{r:r[0],g:r[1],b:r[2],a:r[3]}}}function o(e,t,i,r,o=32774,a=32774,n=[0,0,0,0]){return{srcRgb:e,srcAlpha:t,dstRgb:i,dstAlpha:r,opRgb:o,opAlpha:a,color:{r:n[0],g:n[1],b:n[2],a:n[3]}}}i.d(t,{jp:()=>N,zp:()=>s,BK:()=>c,LZ:()=>l,sm:()=>x,wK:()=>o,if:()=>r});const a={face:1029,mode:2305},n={face:1028,mode:2305},s=e=>2===e?a:1===e?n:null,l={zNear:0,zFar:1},c={r:!0,g:!0,b:!0,a:!0};function d(e){return T.intern(e)}function u(e){return w.intern(e)}function h(e){return M.intern(e)}function p(e){return A.intern(e)}function m(e){return O.intern(e)}function f(e){return I.intern(e)}function v(e){return D.intern(e)}function g(e){return E.intern(e)}function x(e){return R.intern(e)}class b{constructor(e,t){this.makeKey=e,this.makeRef=t,this.interns=new Map}intern(e){if(!e)return null;const t=this.makeKey(e),i=this.interns;return i.has(t)||i.set(t,this.makeRef(e)),i.get(t)}}function _(e){return"["+e.join(",")+"]"}const T=new b(y,(e=>({__tag:"Blending",...e})));function y(e){return e?_([e.srcRgb,e.srcAlpha,e.dstRgb,e.dstAlpha,e.opRgb,e.opAlpha,e.color.r,e.color.g,e.color.b,e.color.a]):null}const w=new b(S,(e=>({__tag:"Culling",...e})));function S(e){return e?_([e.face,e.mode]):null}const M=new b(C,(e=>({__tag:"PolygonOffset",...e})));function C(e){return e?_([e.factor,e.units]):null}const A=new b(P,(e=>({__tag:"DepthTest",...e})));function P(e){return e?_([e.func]):null}const O=new b(F,(e=>({__tag:"StencilTest",...e})));function F(e){return e?_([e.function.func,e.function.ref,e.function.mask,e.operation.fail,e.operation.zFail,e.operation.zPass]):null}const I=new b(H,(e=>({__tag:"DepthWrite",...e})));function H(e){return e?_([e.zNear,e.zFar]):null}const D=new b(z,(e=>({__tag:"ColorWrite",...e})));function z(e){return e?_([e.r,e.g,e.b,e.a]):null}const E=new b(L,(e=>({__tag:"StencilWrite",...e})));function L(e){return e?_([e.mask]):null}const R=new b((function(e){return e?_([y(e.blending),S(e.culling),C(e.polygonOffset),P(e.depthTest),F(e.stencilTest),H(e.depthWrite),z(e.colorWrite),L(e.stencilWrite)]):null}),(e=>({blending:d(e.blending),culling:u(e.culling),polygonOffset:h(e.polygonOffset),depthTest:p(e.depthTest),stencilTest:m(e.stencilTest),depthWrite:f(e.depthWrite),colorWrite:v(e.colorWrite),stencilWrite:g(e.stencilWrite)})));class N{constructor(e){this._pipelineInvalid=!0,this._blendingInvalid=!0,this._cullingInvalid=!0,this._polygonOffsetInvalid=!0,this._depthTestInvalid=!0,this._stencilTestInvalid=!0,this._depthWriteInvalid=!0,this._colorWriteInvalid=!0,this._stencilWriteInvalid=!0,this._stateSetters=e}setPipeline(e){(this._pipelineInvalid||e!==this._pipeline)&&(this.setBlending(e.blending),this.setCulling(e.culling),this.setPolygonOffset(e.polygonOffset),this.setDepthTest(e.depthTest),this.setStencilTest(e.stencilTest),this.setDepthWrite(e.depthWrite),this.setColorWrite(e.colorWrite),this.setStencilWrite(e.stencilWrite),this._pipeline=e),this._pipelineInvalid=!1}invalidateBlending(){this._blendingInvalid=!0,this._pipelineInvalid=!0}invalidateCulling(){this._cullingInvalid=!0,this._pipelineInvalid=!0}invalidatePolygonOffset(){this._polygonOffsetInvalid=!0,this._pipelineInvalid=!0}invalidateDepthTest(){this._depthTestInvalid=!0,this._pipelineInvalid=!0}invalidateStencilTest(){this._stencilTestInvalid=!0,this._pipelineInvalid=!0}invalidateDepthWrite(){this._depthWriteInvalid=!0,this._pipelineInvalid=!0}invalidateColorWrite(){this._colorWriteInvalid=!0,this._pipelineInvalid=!0}invalidateStencilWrite(){this._stencilTestInvalid=!0,this._pipelineInvalid=!0}setBlending(e){this._blending=this.setSubState(e,this._blending,this._blendingInvalid,this._stateSetters.setBlending),this._blendingInvalid=!1}setCulling(e){this._culling=this.setSubState(e,this._culling,this._cullingInvalid,this._stateSetters.setCulling),this._cullingInvalid=!1}setPolygonOffset(e){this._polygonOffset=this.setSubState(e,this._polygonOffset,this._polygonOffsetInvalid,this._stateSetters.setPolygonOffset),this._polygonOffsetInvalid=!1}setDepthTest(e){this._depthTest=this.setSubState(e,this._depthTest,this._depthTestInvalid,this._stateSetters.setDepthTest),this._depthTestInvalid=!1}setStencilTest(e){this._stencilTest=this.setSubState(e,this._stencilTest,this._stencilTestInvalid,this._stateSetters.setStencilTest),this._stencilTestInvalid=!1}setDepthWrite(e){this._depthWrite=this.setSubState(e,this._depthWrite,this._depthWriteInvalid,this._stateSetters.setDepthWrite),this._depthWriteInvalid=!1}setColorWrite(e){this._colorWrite=this.setSubState(e,this._colorWrite,this._colorWriteInvalid,this._stateSetters.setColorWrite),this._colorWriteInvalid=!1}setStencilWrite(e){this._stencilWrite=this.setSubState(e,this._stencilWrite,this._stencilWriteInvalid,this._stateSetters.setStencilWrite),this._stencilTestInvalid=!1}setSubState(e,t,i,r){return(i||e!==t)&&(r(e),this._pipelineInvalid=!0),e}}}}]);
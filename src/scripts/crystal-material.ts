/** Convex-facet ray tracing: refraction, three internal bounces and spectral exits. */
export function createCrystalMaterial(THREE:any,geometry:any){
  const positions=geometry.attributes.position, normals=geometry.attributes.normal;
  const planes:any[]=[];const keys=new Set<string>();
  for(let i=0;i<positions.count;i+=3){
    const n=new THREE.Vector3().fromBufferAttribute(normals,i).normalize();
    const d=n.dot(new THREE.Vector3().fromBufferAttribute(positions,i));
    const key=[n.x,n.y,n.z,d].map(v=>v.toFixed(4)).join(',');
    if(!keys.has(key)){keys.add(key);planes.push(new THREE.Vector4(n.x,n.y,n.z,d));}
  }
  return new THREE.ShaderMaterial({
    uniforms:{uPlanes:{value:planes},uCameraLocal:{value:new THREE.Vector3()},uWorldRotation:{value:new THREE.Matrix3()},uTintA:{value:new THREE.Color('#87cee8')},uTintB:{value:new THREE.Color('#ceb4ed')},uFlash:{value:0}},
    vertexShader:`varying vec3 vPoint; varying vec3 vNormal; void main(){vPoint=position;vNormal=normal;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`
      precision highp float;
      uniform vec4 uPlanes[${planes.length}];
      uniform vec3 uCameraLocal;uniform mat3 uWorldRotation;
      uniform vec3 uTintA;uniform vec3 uTintB;uniform float uFlash;
      varying vec3 vPoint;varying vec3 vNormal;
      vec3 studio(vec3 localDirection){
        vec3 d=normalize(uWorldRotation*localDirection);
        vec3 c=mix(vec3(.055,.10,.19),vec3(.94,.97,1.),smoothstep(-.66,.42,d.y));
        float strip=smoothstep(.045,.11,abs(d.x+.23))*(1.-smoothstep(.20,.31,abs(d.x+.23)));
        float lilac=pow(max(0.,dot(d,normalize(vec3(-.85,.13,-.6)))),2.5);
        float mint=pow(max(0.,dot(d,normalize(vec3(.85,.3,.35)))),2.5);
        c=mix(c,mix(uTintA,uTintB,sin(d.x*4.+d.z*3.)*.5+.5)*1.75,.17);
        c=mix(c,uTintA*1.8,mint*.92);c=mix(c,uTintB*1.9,lilac*.94);c*=1.-strip*.94;
        float window=pow(max(0.,dot(d,normalize(vec3(-.3,.8,1.)))),35.);
        float edge=pow(max(0.,dot(d,normalize(vec3(1.,.25,-.2)))),75.);
        float rim=pow(max(0.,dot(d,normalize(vec3(-1.,.2,.1)))),110.);
        return c+vec3(3.8)*window+vec3(3.)*edge+vec3(4.+uFlash*3.)*rim;
      }
      float fresnel(float cosine){return .166+(.834)*pow(1.-clamp(cosine,0.,1.),5.);}
      vec3 spectrum(vec3 ray,vec3 inwardNormal){
        vec3 r=refract(ray,inwardNormal,2.35),g=refract(ray,inwardNormal,2.40),b=refract(ray,inwardNormal,2.46);
        if(length(r)<.1)r=reflect(ray,inwardNormal);if(length(g)<.1)g=reflect(ray,inwardNormal);if(length(b)<.1)b=reflect(ray,inwardNormal);
        return vec3(studio(r).r,studio(g).g,studio(b).b);
      }
      void main(){
        vec3 normal=normalize(vNormal),incident=normalize(vPoint-uCameraLocal);
        float front=fresnel(dot(-incident,normal));
        vec3 color=studio(reflect(incident,normal))*front;
        vec3 ray=refract(incident,normal,1./2.4),origin=vPoint+ray*.001;
        float energy=1.-front;
        for(int bounce=0;bounce<3;bounce++){
          float nearest=100.;vec3 exitNormal=vec3(0.,1.,0.);
          for(int face=0;face<${planes.length};face++){
            vec3 n=uPlanes[face].xyz;float denom=dot(n,ray);
            if(denom>.0001){float distance=(uPlanes[face].w-dot(n,origin))/denom;if(distance>.00001&&distance<nearest){nearest=distance;exitNormal=n;}}
          }
          if(nearest>90.){color+=studio(ray)*energy;energy=0.;break;}
          origin+=ray*nearest;
          vec3 exitRay=refract(ray,-exitNormal,2.4);
          if(dot(exitRay,exitRay)>.001){float f=fresnel(abs(dot(ray,exitNormal)));color+=spectrum(ray,-exitNormal)*energy*(1.-f);energy*=f;}
          ray=reflect(ray,exitNormal);origin+=ray*.001;energy*=.96;
        }
        color+=studio(ray)*energy*.75;
        gl_FragColor=vec4(color,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
}

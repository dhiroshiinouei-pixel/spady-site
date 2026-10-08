import {createBrilliantGeometry} from './crystal-geometry';
import {createCrystalMaterial} from './crystal-material';

const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const scenes=Array.from(document.querySelectorAll<HTMLElement>('[data-crystal]'));
const palettes=[['#87cee8','#ceb4ed'],['#efc889','#e998b8'],['#8ce2c6','#a1c4f5']];
let library:Promise<any>|undefined;
const stopped=()=>reduced.matches||document.documentElement.dataset.motion==='paused';
const loadLibrary=()=>library??=import('../vendor/three/three.module.min.js');

async function mount(element:HTMLElement){
  if(element.dataset.initialized)return;element.dataset.initialized='loading';
  const canvas=element.querySelector<HTMLCanvasElement>('canvas')!;
  let renderer:any;
  try{
    // Paint the small poster before loading and compiling the 3D renderer.
    if(element.dataset.crystal==='hero'){
      await element.querySelector<HTMLImageElement>('.crystal-poster')?.decode().catch(()=>{});
      await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));
    }
    const THREE=await loadLibrary();
    renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1:1.25));
    renderer.setClearColor(0x000000,0);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
    const scene=new THREE.Scene();
    const hero=element.dataset.crystal==='hero';
    const camera=new THREE.PerspectiveCamera(34,1,.1,30);camera.position.set(0,.55,6.0);camera.lookAt(0,0,0);
    const group=new THREE.Group();scene.add(group);
    const variant=element.dataset.crystal;
    const geometry=createBrilliantGeometry(THREE);geometry.translate(0,.265,0);
    if(variant==='line')geometry.scale(.88,1.12,.88);
    const material=createCrystalMaterial(THREE,geometry);
    const gem=new THREE.Mesh(geometry,material);group.add(gem);
    gem.scale.setScalar(hero?1.5:1.45);gem.rotation.set(.20,.3,-.30);
    if(variant==='line'){material.uniforms.uTintA.value.set('#edb0d4');material.uniforms.uTintB.value.set('#d8b6f6');}
    if(variant==='map'){material.uniforms.uTintA.value.set('#8ce2c6');material.uniforms.uTintB.value.set('#a1c4f5');}
    // Tiny translucent companion stones make the hero feel like a small world.
    const companions:any[]=[];
    if(hero){
      for(let i=0;i<2;i++){
        const miniMat=createCrystalMaterial(THREE,geometry);miniMat.uniforms.uTintA.value.set(i===0?'#eeb7d9':'#a5e7ce');miniMat.uniforms.uTintB.value.set(i===0?'#f2d4a5':'#b9b0ed');
        const mini=new THREE.Mesh(geometry,miniMat);mini.scale.setScalar(i===0?.30:.21);mini.position.set(i===0?-1.4:1.45,i===0?.95:-.96,i===0?-.3:.15);mini.rotation.set(.3,i*1.2,.3);scene.add(mini);companions.push(mini);
      }
    }
    const gems=[gem,...companions];
    const viewport=element.querySelector<HTMLElement>('.crystal-viewport')!;
    let prepared=false,visible=true,dead=false,frame=0,time=0,last=0,angle=0,extra=0,targetExtra=0,dragging=false,dragStart=0,dragAngle=0,flash=0;
    const inverse=new THREE.Matrix4();
    const render=()=>{
      if(dead||!prepared)return;
      scene.updateMatrixWorld(true);
      for(const object of gems){inverse.copy(object.matrixWorld).invert();object.material.uniforms.uCameraLocal.value.copy(camera.position).applyMatrix4(inverse);object.material.uniforms.uWorldRotation.value.setFromMatrix4(object.matrixWorld);object.material.uniforms.uFlash.value=flash;}
      renderer.render(scene,camera);
      element.dataset.rotation=angle.toFixed(3);
    };
    // Allows same-document preview tooling to save the actual rendered model.
    canvas.addEventListener('spady:crystal-capture',render);
    const size=()=>{const box=viewport.getBoundingClientRect();if(!box.width||!box.height)return;renderer.setSize(box.width,box.height,false);camera.aspect=box.width/box.height;camera.updateProjectionMatrix();render();};
    const tick=(now:number)=>{
      frame=0;if(dead||!visible||document.hidden||stopped())return;
      if(now-last<32){frame=requestAnimationFrame(tick);return;}
      const dt=Math.min((now-(last||now))/1000,.05);last=now;time+=dt;
      if(!dragging)angle+=dt*.15;
      extra+=(targetExtra-extra)*Math.min(1,dt*3.8);flash=Math.max(0,flash-dt*.65);
      gem.rotation.y=.3+angle+extra;gem.rotation.x=.22+Math.sin(time*.22)*.13;gem.rotation.z=-.30+Math.sin(time*.18)*.055;
      companions.forEach((object,i)=>{object.rotation.y+=dt*(i===0?.22:-.19);object.rotation.z+=dt*.025;});
      render();frame=requestAnimationFrame(tick);
    };
    const sync=()=>{cancelAnimationFrame(frame);frame=0;last=0;if(prepared&&!dead&&visible&&!document.hidden&&!stopped())frame=requestAnimationFrame(tick);element.dataset.moving=String(prepared&&!dead&&visible&&!document.hidden&&!stopped());};
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:.01});observer.observe(element);
    const resize=new ResizeObserver(size);resize.observe(viewport);
    canvas.addEventListener('pointerdown',event=>{if(!hero||stopped())return;dragging=true;dragStart=event.clientX;dragAngle=angle;canvas.setPointerCapture(event.pointerId);});
    canvas.addEventListener('pointermove',event=>{if(!dragging||stopped())return;angle=dragAngle+(event.clientX-dragStart)*.009;});
    const release=()=>{dragging=false;};canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
    element.querySelectorAll<HTMLButtonElement>('[data-crystal-palette]').forEach(button=>button.addEventListener('click',()=>{
      const choice=Number(button.dataset.crystalPalette),palette=palettes[choice];if(!palette)return;
      material.uniforms.uTintA.value.set(palette[0]);material.uniforms.uTintB.value.set(palette[1]);
      element.querySelectorAll('[data-crystal-palette]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
      const label=element.querySelector('.crystal-light-name');if(label)label.textContent=button.getAttribute('aria-label');
      element.dataset.palette=String(choice);flash=stopped()?0:1;render();
    }));
    element.querySelector('[data-crystal-turn]')?.addEventListener('click',()=>{if(stopped()){angle+=Math.PI/4;gem.rotation.y=.3+angle+extra;render();}else{targetExtra+=Math.PI*2;flash=1;sync();}});
    addEventListener('spady:motionchange',sync);reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();dead=true;cancelAnimationFrame(frame);element.dataset.initialized='fallback';element.dataset.moving='false';});
    const cleanup=()=>{dead=true;cancelAnimationFrame(frame);observer.disconnect();resize.disconnect();renderer.dispose();geometry.dispose();gems.forEach(object=>object.material.dispose());};
    addEventListener('pagehide',event=>{cancelAnimationFrame(frame);frame=0;if(!event.persisted)cleanup();});
    addEventListener('pageshow',event=>{if(event.persisted&&!dead){size();sync();}});
    size();
    // Use parallel shader preparation when the GPU supports it. The poster,
    // navigation and reading remain available while the material is prepared.
    await renderer.compileAsync(scene,camera);
    if(dead)return;
    prepared=true;size();element.dataset.initialized='ready';sync();
  }catch(error){renderer?.dispose();element.dataset.initialized='fallback';element.dataset.moving='false';console.warn('Crystal: static artwork retained.',error instanceof Error?error.message:'WebGL unavailable');}
}
// Only the hero starts immediately; lower scenes are created near the viewport.
const loader=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){loader.unobserve(entry.target);void mount(entry.target as HTMLElement);}},{rootMargin:'160px'});
scenes.forEach(element=>{if(element.dataset.crystal==='hero')void mount(element);else loader.observe(element);});

const $=id=>document.getElementById(id);
let stream=null,track=null,facing='environment',caps={},gridOn=false,torchOn=false,burst=false,mirror=false,lastUrl=null,shots=[],activeMode='photo',histOn=false;
const video=$('video');
function toast(s){const e=$('toast');e.textContent=s;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2100)}
function drawGrid(){const c=$('grid'),r=c.getBoundingClientRect(),d=window.devicePixelRatio||1,ctx=c.getContext('2d');c.width=r.width*d;c.height=r.height*d;ctx.scale(d,d);ctx.clearRect(0,0,r.width,r.height);if(!gridOn)return;ctx.strokeStyle='rgba(255,255,255,.45)';ctx.lineWidth=1;for(let i=1;i<3;i++){ctx.beginPath();ctx.moveTo(r.width*i/3,0);ctx.lineTo(r.width*i/3,r.height);ctx.stroke();ctx.beginPath();ctx.moveTo(0,r.height*i/3);ctx.lineTo(r.width,r.height*i/3);ctx.stroke()}}
function setStatus(s){$('cameraStatus').textContent=s}
async function start(){
 if(!navigator.mediaDevices?.getUserMedia){toast('Open this site over HTTPS');return}
 try{
  if(stream)stream.getTracks().forEach(t=>t.stop());
  stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:facing},width:{ideal:4096},height:{ideal:2160},frameRate:{ideal:30,max:60}}});
  video.srcObject=stream;await video.play();video.classList.add('on');$('welcome').style.display='none';track=stream.getVideoTracks()[0];caps=track.getCapabilities?.()||{};
  const s=track.getSettings();$('resolution').textContent=`${s.width||'?'}×${s.height||'?'}`;setStatus('● SENSOR ACTIVE');configure();drawGrid();
 }catch(e){toast(e.name==='NotAllowedError'?'Camera permission denied':'Camera could not start');setStatus('CAMERA ERROR')}
}
function has(k){return Object.prototype.hasOwnProperty.call(caps,k)}
function configure(){
 const z=caps.zoom;if(z){$('zoom').min=z.min;$('zoom').max=z.max;$('zoom').step=z.step||.1;$('zoom').value=track.getSettings().zoom||z.min;$('zoom').disabled=false}else{$('zoom').disabled=true}
 const ex=caps.exposureCompensation;if(ex){$('exposure').min=ex.min;$('exposure').max=ex.max;$('exposure').step=ex.step||.1;$('exposure').disabled=false}else $('exposure').disabled=true;
 const fd=caps.focusDistance;if(fd){$('focus').min=fd.min;$('focus').max=fd.max;$('focus').step=fd.step||.01;$('focus').disabled=false}else $('focus').disabled=true;
 ['whiteBalanceMode','focusMode','exposureMode'].forEach((k,i)=>{const id=['whiteBalance','focusMode','exposureMode'][i];$(id).disabled=!has(k)});
 $('torchBtn').disabled=!has('torch');$('supportState').textContent='DEVICE CAPABILITIES LOADED';
 const labels=[['Zoom',has('zoom')],['Exposure compensation',has('exposureCompensation')],['Manual focus distance',has('focusDistance')],['White balance modes',has('whiteBalanceMode')],['Focus modes',has('focusMode')],['Exposure modes',has('exposureMode')],['Torch control',has('torch')],['Tap-to-focus regions',has('pointsOfInterest')],['ImageCapture API',!!window.ImageCapture]];
 $('capabilityList').innerHTML=labels.map(([n,v])=>`<div class="cap-row"><span>${n}</span><span>${v?'SUPPORTED':'NOT EXPOSED'}</span></div>`).join('');
 updateLabels();
}
async function apply(key,value){if(!track)return;try{await track.applyConstraints({advanced:[{[key]:value}]})}catch(e){toast(`${key} not supported by this camera`)}}
function updateLabels(){
 $('zoomVal').textContent=Number($('zoom').value).toFixed(1)+'×';$('zoomReadout').textContent=$('zoomVal').textContent;
 $('evVal').textContent=Number($('exposure').value).toFixed(1)+' EV';$('evReadout').textContent='EV '+Number($('exposure').value).toFixed(1);
 $('focusVal').textContent=$('focus').disabled?'AUTO':Number($('focus').value).toFixed(2);
}
$('startBtn').onclick=start;
$('flipBtn').onclick=()=>{facing=facing==='environment'?'user':'environment';start()};
$('gridBtn').onclick=()=>{gridOn=!gridOn;$('gridBtn').classList.toggle('active',gridOn);drawGrid()};
$('zoom').oninput=e=>{updateLabels();apply('zoom',Number(e.target.value))};
$('exposure').oninput=e=>{updateLabels();apply('exposureCompensation',Number(e.target.value))};
$('focus').oninput=e=>{updateLabels();apply('focusDistance',Number(e.target.value))};
$('whiteBalance').onchange=e=>{ $('wbVal').textContent=e.target.selectedOptions[0].text;apply('whiteBalanceMode',e.target.value)};
$('focusMode').onchange=e=>{$('focusModeVal').textContent=e.target.value.toUpperCase();apply('focusMode',e.target.value)};
$('exposureMode').onchange=e=>{$('exposureModeVal').textContent=e.target.value.toUpperCase();apply('exposureMode',e.target.value)};
$('torchBtn').onclick=async()=>{if(!track)return;torchOn=!torchOn;try{await track.applyConstraints({advanced:[{torch:torchOn}]});$('torchBtn').classList.toggle('active',torchOn)}catch(e){torchOn=false;toast('Flashlight control unavailable')}};
$('finder').addEventListener('click',async e=>{
 if(!track||e.target.closest('button'))return;
 const r=$('finder').getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
 const b=$('focusBox');b.style.left=(x*100)+'%';b.style.top=(y*100)+'%';b.style.display='block';setTimeout(()=>b.style.display='none',900);
 if(has('pointsOfInterest')){try{await track.applyConstraints({advanced:[{pointsOfInterest:[{x,y}],focusMode:'single-shot'}]})}catch(err){}}
});
document.querySelectorAll('.mode').forEach(b=>b.onclick=()=>{if(b.disabled)return;activeMode=b.dataset.mode;document.querySelectorAll('.mode').forEach(x=>x.classList.toggle('active',x===b));$('modeReadout').textContent=activeMode.toUpperCase();if(activeMode==='night'){$('exposure').value=Math.min(Number($('exposure').max),1);updateLabels();apply('exposureCompensation',Number($('exposure').value))}else if(activeMode==='photo'){$('exposure').value=0;updateLabels();apply('exposureCompensation',0)}toast(`${activeMode.toUpperCase()} look selected`)});
$('burstBtn').onclick=()=>{burst=!burst;$('burstBtn').querySelector('small').textContent='BURST: '+(burst?'ON':'OFF');$('burstBtn').classList.toggle('active',burst)};
$('histogramBtn').onclick=()=>{histOn=!histOn;$('histogramBtn').innerHTML=`HISTOGRAM <b>${histOn?'ON':'OFF'}</b>`;toast('Histogram overlay is a preview feature planned for a future build')};
$('mirrorBtn').onclick=()=>{mirror=!mirror;video.style.transform=mirror?'scaleX(-1)':'';$('mirrorBtn').innerHTML=`SELFIE MIRROR <b>${mirror?'ON':'OFF'}</b>`};
$('shutter').onclick=async()=>{if(!track){toast('Start the camera first');return}const sec=Number($('timer').value);if(sec){$('captureLabel').textContent=`WAIT ${sec} SEC`;await new Promise(r=>setTimeout(r,sec*1000))}const count=burst?5:1;for(let i=0;i<count;i++){await capture();if(i<count-1)await new Promise(r=>setTimeout(r,220))}$('captureLabel').textContent='TAP TO CAPTURE'};
async function capture(){
 try{
  let blob=null;
  if('ImageCapture'in window){try{const ic=new ImageCapture(track);blob=await ic.takePhoto()}catch(e){}}
  if(!blob){const c=document.createElement('canvas');let w=video.videoWidth,h=video.videoHeight,ratio=$('ratio').value;if(ratio!=='full'){const a=ratio==='1:1'?1:ratio==='16:9'?16/9:4/3;if(w/h>a)w=h*a;else h=w/a}c.width=Math.round(w);c.height=Math.round(h);const ctx=c.getContext('2d');let filter='none';if(activeMode==='portrait')filter='contrast(1.06) saturate(1.08)';if(activeMode==='landscape')filter='contrast(1.04) saturate(1.12)';if(activeMode==='night')filter='brightness(1.08) contrast(1.04)';ctx.filter=filter;ctx.drawImage(video,(video.videoWidth-w)/2,(video.videoHeight-h)/2,w,h,0,0,c.width,c.height);blob=await new Promise(res=>c.toBlob(res,$('fileType').value==='webp'?'image/webp':'image/jpeg',Number($('quality').value)))}
  if(!blob)throw Error('No image data');const url=URL.createObjectURL(blob),ext=blob.type.includes('webp')?'webp':'jpg',name=`PROSHOT_${new Date().toISOString().replace(/[:.]/g,'-')}.${ext}`;shots.unshift({url,name});lastUrl=url;$('downloadLast').disabled=false;renderGallery();const a=document.createElement('a');a.href=url;a.download=name;a.click();toast('Photo captured • '+Math.round(blob.size/1024)+' KB');
 }catch(e){toast('Capture failed on this device')}
}
function renderGallery(){$('gallery').innerHTML='';$('emptyGallery').style.display=shots.length?'none':'block';shots.forEach(s=>{const d=document.createElement('div');d.className='gallery-item';d.innerHTML=`<img src="${s.url}" alt="Captured photo"><a download="${s.name}" href="${s.url}">DOWNLOAD</a>`;$('gallery').append(d)})}
$('downloadLast').onclick=()=>{if(lastUrl){const a=document.createElement('a');a.href=lastUrl;a.download='PROSHOT_LAST.jpg';a.click()}};
$('galleryBtn').onclick=()=>$('galleryDialog').showModal();$('closeGallery').onclick=()=>$('galleryDialog').close();
$('settingsBtn').onclick=()=>$('settingsDialog').showModal();$('closeSettings').onclick=()=>$('settingsDialog').close();
window.addEventListener('resize',drawGrid);

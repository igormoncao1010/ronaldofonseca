const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#menu');

toggle?.addEventListener('click', () => {
  const open = document.body.classList.toggle('menu-open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
});

menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  document.body.classList.remove('menu-open');
  toggle?.setAttribute('aria-expanded', 'false');
  toggle?.setAttribute('aria-label', 'Abrir menu');
}));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((section) => observer.observe(section));

const scrollGroups = [
  '.resume-band article',
  '.timeline article',
  '.proposal-grid article',
  '.people-card',
  '.gallery-item',
  '.news-card',
  '.fnb-logo',
  '.join > div'
];

const scrollItems = document.querySelectorAll(scrollGroups.join(','));
const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      scrollObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14, rootMargin: '0px 0px -5% 0px' });

scrollItems.forEach((item, index) => {
  item.classList.add('scroll-item');
  item.style.setProperty('--scroll-delay', `${(index % 4) * 85}ms`);
  scrollObserver.observe(item);
});

const hero = document.querySelector('.hero');
const topbar = document.querySelector('.topbar');
let scrollFrame;

const updateScrollEffects = () => {
  const scrollY = Math.max(0, window.scrollY);
  const heroProgress = hero ? Math.min(scrollY / hero.offsetHeight, 1) : 0;

  hero?.style.setProperty('--hero-parallax', `${heroProgress * 54}px`);
  hero?.querySelector('.candidate-stage')?.style.setProperty('--people-parallax', `${heroProgress * 24}px`);
  topbar?.classList.toggle('is-scrolled', scrollY > 24);
  scrollFrame = undefined;
};

window.addEventListener('scroll', () => {
  if (!scrollFrame && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    scrollFrame = requestAnimationFrame(updateScrollEffects);
  }
}, { passive: true });

updateScrollEffects();

requestAnimationFrame(() => {
  requestAnimationFrame(() => document.body.classList.add('hero-candidates-ready'));
});

const supportModal = document.querySelector('#support-modal');
const openSupportButton = document.querySelector('[data-open-support]');
const closeSupportButtons = document.querySelectorAll('[data-close-support]');
const copyPixButton = document.querySelector('#copy-pix');
const pixCard = document.querySelector('.pix-card');
const pixKeyText = document.querySelector('#pix-key');
const pixQr = document.querySelector('#pix-qr');
const supportThanks = document.querySelector('#support-thanks');
const pixKey = pixCard?.dataset.pixKey?.trim() || '';
let thanksTimer;

if (pixKey && pixKeyText && copyPixButton) {
  pixKeyText.textContent = pixKey;
  copyPixButton.disabled = false;
}

const dfPopulations = [["Água Quente",11306],["Arapoanga",49067],["Arniqueira",44774],["Brazlândia",41859],["Candangolândia",14540],["Ceilândia",287113],["Cruzeiro",26435],["Fercal",9141],["Gama",133948],["Guará",127952],["Itapoã",67021],["Jardim Botânico",75133],["Lago Norte",43817],["Lago Sul",27213],["Núcleo Bandeirante",22566],["Paranoá",55551],["Park Way",22667],["Planaltina",121856],["Plano Piloto",207996],["Recanto das Emas",105862],["Riacho Fundo",41040],["Riacho Fundo II",70180],["Samambaia",227118],["Santa Maria",121635],["SCIA",38047],["SIA",5630],["Sobradinho",70608],["Sobradinho II",79932],["Sol Nascente e Pôr do Sol",108713],["Sudoeste/Octogonal",46004],["São Sebastião",99050],["Taguatinga",201332],["Varjão",9017],["Vicente Pires",105062],["Águas Claras",141872]];
const normalizeRa=name=>name.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^A-Z0-9]/gi,"").toUpperCase();
const populationMap=new Map(dfPopulations.map(([name,population])=>[normalizeRa(name),population]));
const displayMap=new Map(dfPopulations.map(([name])=>[normalizeRa(name),name]));
const mapCanvas=document.querySelector(".df-map-canvas"),raList=document.querySelector(".df-ra-list"),raSearch=document.querySelector("#ra-search");
let selectedRa="Ceilândia",raPaths=[];
const populationFor=name=>name.toUpperCase().includes("SOL NASCENTE")?108713:populationMap.get(normalizeRa(name))||0;
const displayFor=name=>name.toUpperCase().includes("SOL NASCENTE")?"Sol Nascente e Pôr do Sol":displayMap.get(normalizeRa(name))||name;
function selectRa(name){selectedRa=name;const population=populationMap.get(normalizeRa(name))||0;mapCanvas?.querySelector(".df-map-selection strong")?.replaceChildren(name);mapCanvas?.querySelector(".df-map-selection b")?.replaceChildren(population.toLocaleString("pt-BR"));raPaths.forEach(path=>path.classList.toggle("active",normalizeRa(path.dataset.name)===normalizeRa(name)));raList?.querySelectorAll("button").forEach(button=>button.classList.toggle("active",button.dataset.name===name));}
function renderRaList(filter=""){if(!raList)return;raList.replaceChildren();dfPopulations.filter(([name])=>normalizeRa(name).includes(normalizeRa(filter))).forEach(([name,population])=>{const button=document.createElement("button");button.type="button";button.dataset.name=name;button.innerHTML=`<span>${name}</span><b>${population.toLocaleString("pt-BR")}</b>`;button.addEventListener("click",()=>selectRa(name));button.classList.toggle("active",name===selectedRa);raList.appendChild(button);});}
renderRaList();raSearch?.addEventListener("input",event=>renderRaList(event.target.value));
Promise.resolve(window.DF_REGIOES).then(data=>{if(!data)throw new Error("Dados geográficos não disponíveis");if(!mapCanvas)return;const features=data.features||[];const points=features.flatMap(feature=>{const polygons=feature.geometry.type==="MultiPolygon"?feature.geometry.coordinates:[feature.geometry.coordinates];return polygons.flat(2);});const bounds=points.reduce((box,[x,y])=>({minX:Math.min(box.minX,x),maxX:Math.max(box.maxX,x),minY:Math.min(box.minY,y),maxY:Math.max(box.maxY,y)}),{minX:Infinity,maxX:-Infinity,minY:Infinity,maxY:-Infinity});const width=860,height=600,pad=18,scale=Math.min((width-pad*2)/(bounds.maxX-bounds.minX),(height-pad*2)/(bounds.maxY-bounds.minY)),offsetX=(width-(bounds.maxX-bounds.minX)*scale)/2,offsetY=(height-(bounds.maxY-bounds.minY)*scale)/2;const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");svg.setAttribute("viewBox","0 0 860 600");svg.setAttribute("role","img");svg.setAttribute("aria-labelledby","df-map-title");features.forEach(feature=>{const rawName=feature.properties.ra_nome,name=displayFor(rawName),polygons=feature.geometry.type==="MultiPolygon"?feature.geometry.coordinates:[feature.geometry.coordinates],d=polygons.map(polygon=>polygon.map(ring=>ring.map(([x,y],index)=>`${index?"L":"M"}${(offsetX+(x-bounds.minX)*scale).toFixed(1)},${(offsetY+(bounds.maxY-y)*scale).toFixed(1)}`).join(" ")+" Z").join(" ")).join(" ");const path=document.createElementNS("http://www.w3.org/2000/svg","path");path.setAttribute("d",d);path.setAttribute("tabindex","0");path.setAttribute("role","button");path.setAttribute("class","ra-shape");path.dataset.name=name;path.setAttribute("aria-label",`${name}: ${populationFor(rawName).toLocaleString("pt-BR")} habitantes`);const title=document.createElementNS("http://www.w3.org/2000/svg","title");title.textContent=`${name} — ${populationFor(rawName).toLocaleString("pt-BR")} habitantes`;path.appendChild(title);path.addEventListener("click",()=>selectRa(name));path.addEventListener("focus",()=>selectRa(name));svg.appendChild(path);});mapCanvas.querySelector(".map-loading")?.remove();mapCanvas.prepend(svg);raPaths=Array.from(svg.querySelectorAll("path"));selectRa(selectedRa);}).catch(()=>{const loading=mapCanvas?.querySelector(".map-loading");if(loading)loading.textContent="Não foi possível carregar o mapa.";});

const openSupportModal = () => {
  if (!supportModal) return;
  supportModal.classList.add('is-open');
  supportModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  supportModal.querySelector('.support-close')?.focus();
};

const closeSupportModal = () => {
  if (!supportModal) return;
  supportModal.classList.remove('is-open');
  supportModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  openSupportButton?.focus();
  supportThanks?.classList.add('is-visible');
  clearTimeout(thanksTimer);
  thanksTimer = setTimeout(() => supportThanks?.classList.remove('is-visible'), 3200);
};

openSupportButton?.addEventListener('click', openSupportModal);
closeSupportButtons.forEach((button) => button.addEventListener('click', closeSupportModal));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && supportModal?.classList.contains('is-open')) closeSupportModal();
});

copyPixButton?.addEventListener('click', async () => {
  if (!pixKey) return;
  await navigator.clipboard.writeText(pixKey);
  copyPixButton.textContent = 'Chave copiada!';
  setTimeout(() => { copyPixButton.textContent = 'Copiar chave Pix'; }, 1800);
});

const supportPhotoInput = document.querySelector('#support-photo');
const supportCanvas = document.querySelector('#support-canvas');
const supportContext = supportCanvas?.getContext('2d');
const canvasEmpty = document.querySelector('#canvas-empty');
const templateInputs = document.querySelectorAll('input[name="support-template"]');
const zoomInput = document.querySelector('#photo-zoom');
const downloadSupportButton = document.querySelector('#download-support-image');
const changeSupportPhotoButton = document.querySelector('#change-support-photo');
let supporterPhoto;
let activeTemplate = '1';

const assetImage = (source) => new Promise((resolve) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => resolve(null);
  image.src = source;
});

const psdLogoPromise = assetImage('assets/psd-logo-texto-branco.png');
const fnbLogoPromise = assetImage('assets/fnb-logo.webp');

const drawCoverPhoto = (context, image, centerX, centerY, radius, zoom = 1) => {
  const diameter = radius * 2;
  const scale = Math.max(diameter / image.width, diameter / image.height) * zoom;
  const width = image.width * scale;
  const height = image.height * scale;
  context.save();
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, Math.PI * 2);
  context.clip();
  context.drawImage(image, centerX - width / 2, centerY - height / 2, width, height);
  context.restore();
};

const drawArcText = (context, text, centerX, centerY, radius, startAngle, endAngle, font, color) => {
  const letters = [...text];
  context.save();
  context.font = font;
  context.fillStyle = color;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  letters.forEach((letter, index) => {
    const ratio = letters.length === 1 ? .5 : index / (letters.length - 1);
    const angle = startAngle + (endAngle - startAngle) * ratio;
    context.save();
    context.translate(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
    context.rotate(angle + Math.PI / 2);
    context.fillText(letter, 0, 0);
    context.restore();
  });
  context.restore();
};

const drawLogoContained = (context, image, x, y, maxWidth, maxHeight) => {
  if (!image) return;
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  context.drawImage(image, x + (maxWidth - width) / 2, y + (maxHeight - height) / 2, width, height);
};

const drawTemplateOne = (context, photo, psdLogo, fnbLogo, zoom) => {
  const gradient = context.createLinearGradient(0, 0, 1080, 1080);
  gradient.addColorStop(0, '#061a32');
  gradient.addColorStop(.55, '#0a355d');
  gradient.addColorStop(1, '#0d7548');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1080, 1080);
  context.fillStyle = 'rgba(247,185,24,.08)';
  for (let i = 0; i < 12; i += 1) {
    context.beginPath();
    context.arc(90 + i * 105, 100 + (i % 3) * 350, 70 + (i % 4) * 20, 0, Math.PI * 2);
    context.fill();
  }
  drawArcText(context, 'EU APOIO RONALDO FONSECA', 540, 510, 452, Math.PI * 1.12, Math.PI * 1.88, '700 42px Arial', '#ffffff');
  context.beginPath();
  context.arc(540, 515, 342, 0, Math.PI * 2);
  context.fillStyle = '#f7b918';
  context.fill();
  drawCoverPhoto(context, photo, 540, 515, 323, zoom);
  context.fillStyle = '#ffffff';
  context.textAlign = 'center';
  context.font = '900 76px Arial';
  context.fillText('RONALDO FONSECA', 540, 930);
  context.fillStyle = '#f7b918';
  context.font = 'italic 700 54px Georgia';
  context.fillText('SENADOR • DISTRITO FEDERAL', 540, 995);
  drawLogoContained(context, psdLogo, 55, 705, 150, 82);
  drawLogoContained(context, fnbLogo, 860, 710, 165, 76);
};

const drawTemplateTwo = (context, photo, psdLogo, fnbLogo, zoom) => {
  context.fillStyle = '#f7b918';
  context.fillRect(0, 0, 1080, 1080);
  const gradient = context.createRadialGradient(540, 460, 120, 540, 520, 760);
  gradient.addColorStop(0, '#168456');
  gradient.addColorStop(1, '#063d2a');
  context.fillStyle = gradient;
  context.beginPath();
  context.arc(540, 500, 510, 0, Math.PI * 2);
  context.fill();
  drawArcText(context, 'COM RONALDO PARA O DF AVANÇAR', 540, 500, 447, Math.PI * 1.1, Math.PI * 1.9, '900 39px Arial', '#ffffff');
  context.beginPath();
  context.arc(540, 500, 310, 0, Math.PI * 2);
  context.fillStyle = '#ffffff';
  context.fill();
  drawCoverPhoto(context, photo, 540, 500, 291, zoom);
  context.fillStyle = '#061a32';
  context.fillRect(90, 845, 900, 145);
  context.fillStyle = '#ffffff';
  context.textAlign = 'center';
  context.font = '900 44px Arial';
  context.fillText('EU APOIO', 540, 895);
  context.fillStyle = '#f7b918';
  context.font = '900 66px Arial';
  context.fillText('RONALDO SENADOR', 540, 963);
  drawLogoContained(context, psdLogo, 135, 685, 150, 78);
  drawLogoContained(context, fnbLogo, 795, 691, 150, 70);
};

const renderSupportImage = async () => {
  if (!supportContext || !supporterPhoto) return;
  const [psdLogo, fnbLogo] = await Promise.all([psdLogoPromise, fnbLogoPromise]);
  supportContext.clearRect(0, 0, 1080, 1080);
  const zoom = Number(zoomInput?.value || 1);
  if (activeTemplate === '1') drawTemplateOne(supportContext, supporterPhoto, psdLogo, fnbLogo, zoom);
  else drawTemplateTwo(supportContext, supporterPhoto, psdLogo, fnbLogo, zoom);
};

supportPhotoInput?.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      supporterPhoto = image;
      canvasEmpty?.classList.add('hidden');
      if (downloadSupportButton) downloadSupportButton.disabled = false;
      if (changeSupportPhotoButton) changeSupportPhotoButton.disabled = false;
      renderSupportImage();
    };
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
});

templateInputs.forEach((input) => input.addEventListener('change', () => {
  activeTemplate = input.value;
  document.querySelectorAll('.template-option').forEach((option) => option.classList.toggle('selected', option.contains(input)));
  renderSupportImage();
}));

zoomInput?.addEventListener('input', renderSupportImage);
changeSupportPhotoButton?.addEventListener('click', () => supportPhotoInput?.click());
downloadSupportButton?.addEventListener('click', () => {
  if (!supportCanvas || !supporterPhoto) return;
  const link = document.createElement('a');
  link.download = `eu-apoio-ronaldo-fonseca-modelo-${activeTemplate}.png`;
  link.href = supportCanvas.toDataURL('image/png', 1);
  link.click();
});

const galleryLightbox = document.querySelector('#gallery-lightbox');
const galleryLightboxImage = document.querySelector('#gallery-lightbox-image');
const galleryLightboxCaption = document.querySelector('#gallery-lightbox-caption');
const galleryItems = document.querySelectorAll('[data-gallery-image]');

const closeGallery = () => {
  galleryLightbox?.classList.remove('is-open');
  galleryLightbox?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
};

galleryItems.forEach((item) => item.addEventListener('click', () => {
  if (galleryLightboxImage) {
    galleryLightboxImage.src = item.dataset.galleryImage;
    galleryLightboxImage.alt = item.dataset.galleryCaption;
  }
  if (galleryLightboxCaption) galleryLightboxCaption.textContent = item.dataset.galleryCaption;
  galleryLightbox?.classList.add('is-open');
  galleryLightbox?.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  galleryLightbox?.querySelector('.gallery-lightbox-close')?.focus();
}));

document.querySelectorAll('[data-close-gallery]').forEach((button) => button.addEventListener('click', closeGallery));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && galleryLightbox?.classList.contains('is-open')) closeGallery();
});

const supporterForm = document.querySelector('#supporter-form');
const supporterWhatsapp = document.querySelector('#supporter-whatsapp');
const supporterFormStatus = document.querySelector('#supporter-form-status');

supporterWhatsapp?.addEventListener('input', () => {
  const digits = supporterWhatsapp.value.replace(/\D/g, '').slice(0, 11);
  supporterWhatsapp.value = digits
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
});

supporterForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const supporterName = document.querySelector('#supporter-name')?.value.trim().split(' ')[0] || '';
  supporterForm.classList.add('is-sent');
  if (supporterFormStatus) supporterFormStatus.textContent = `Obrigado, ${supporterName}! Seu interesse foi registrado neste dispositivo.`;
});

const typingText = document.querySelector('#typing-text');
const typingPhrases = [
  'Coragem para transformar.',
  'Fé para unir o Distrito Federal.',
  'Trabalho que transforma.'
];

if (typingText && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let phraseIndex = 0;
  let characterIndex = typingPhrases[0].length;
  let deleting = true;

  const typeNextCharacter = () => {
    const phrase = typingPhrases[phraseIndex];
    characterIndex += deleting ? -1 : 1;
    typingText.textContent = phrase.slice(0, characterIndex);

    if (deleting && characterIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % typingPhrases.length;
      setTimeout(typeNextCharacter, 350);
      return;
    }

    if (!deleting && characterIndex === typingPhrases[phraseIndex].length) {
      deleting = true;
      setTimeout(typeNextCharacter, 2300);
      return;
    }

    setTimeout(typeNextCharacter, deleting ? 38 : 72);
  };

  setTimeout(typeNextCharacter, 2300);
}

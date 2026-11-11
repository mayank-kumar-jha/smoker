/* One destination for the workshop, delivery, stockists and direct enquiries. */
window.SMOKERS_HUB_COPY={
  "en": {
    "label": "Meet Smokers",
    "eyebrow": "THE WORKSHOP · THE FOOD · THE PEOPLE",
    "title": "A LITTLE SMOKE.<br><em>A LOT OF SOUL.</em>",
    "intro": "Made slowly in Badalona. Enjoyed wherever you are. Meet our workshop, find your next meal and talk directly to the people who make it.",
    "chapters": [
      "Our craft",
      "Find your Smokers",
      "Let’s talk"
    ],
    "note": "GOOD THINGS<br>TAKE THEIR TIME.",
    "findTitle": "YOUR NEXT<br><em>GOOD MEAL.</em>",
    "findIntro": "At your door or from a local shop. Choose how you want Smokers to reach your table.",
    "delivery": "Bring it home",
    "shop": "Find a local shop",
    "shopBody": "Tell us your town or postcode. Our team will help you find a current stockist and check what’s available.",
    "shopCta": "Ask for a stockist",
    "talkTitle": "PULL UP<br><em>A CHAIR.</em>",
    "talkIntro": "A question, a kitchen to feed, or an idea to share. There’s a real person at the other end.",
    "address": "COME SAY HELLO",
    "meta": {
      "title": "Meet Smokers — workshop, delivery and contact in Badalona",
      "description": "Discover the Smokers workshop, find smoked dishes for delivery or a local stockist, and speak to our Badalona team. Our craft, your table, one place."
    }
  },
  "es": {
    "label": "Conoce Smokers",
    "eyebrow": "EL OBRADOR · LA COMIDA · LAS PERSONAS",
    "title": "UN POCO DE HUMO.<br><em>MUCHA ALMA.</em>",
    "intro": "Hecho despacio en Badalona. Para disfrutar donde estés. Conoce nuestro obrador, encuentra tu próxima comida y habla con quienes la preparan.",
    "chapters": [
      "Nuestro oficio",
      "Encuentra Smokers",
      "Hablemos"
    ],
    "note": "LO BUENO<br>NECESITA TIEMPO.",
    "findTitle": "TU PRÓXIMA<br><em>BUENA COMIDA.</em>",
    "findIntro": "A tu puerta o en una tienda cercana. Elige cómo quieres que Smokers llegue a tu mesa.",
    "delivery": "A tu casa",
    "shop": "Encuentra una tienda",
    "shopBody": "Dinos tu población o código postal. Te ayudamos a encontrar un punto de venta actualizado y consultar su disponibilidad.",
    "shopCta": "Consultar una tienda",
    "talkTitle": "SIÉNTATE.<br><em>HABLEMOS.</em>",
    "talkIntro": "Una pregunta, una cocina que alimentar o una idea que compartir. Al otro lado hay una persona de verdad.",
    "address": "VEN A CONOCERNOS",
    "meta": {
      "title": "Conoce Smokers — obrador, reparto y contacto en Badalona",
      "description": "Descubre el obrador de Smokers, encuentra platos ahumados a domicilio o en una tienda y habla con nuestro equipo de Badalona. Todo en un mismo lugar."
    }
  },
  "ca": {
    "label": "Coneix Smokers",
    "eyebrow": "L’OBRADOR · EL MENJAR · LES PERSONES",
    "title": "UNA MICA DE FUM.<br><em>MOLTA ÀNIMA.</em>",
    "intro": "Fet a poc a poc a Badalona. Per gaudir-ne on siguis. Coneix l’obrador, troba el teu pròxim àpat i parla amb qui el prepara.",
    "chapters": [
      "El nostre ofici",
      "Troba Smokers",
      "Parlem"
    ],
    "note": "LES COSES BONES<br>NECESSITEN TEMPS.",
    "findTitle": "EL TEU PRÒXIM<br><em>BON ÀPAT.</em>",
    "findIntro": "A la porta de casa o en una botiga propera. Tria com vols que Smokers arribi a la teva taula.",
    "delivery": "A casa teva",
    "shop": "Troba una botiga",
    "shopBody": "Digues-nos la població o el codi postal. T’ajudem a trobar un punt de venda actualitzat i consultar-ne la disponibilitat.",
    "shopCta": "Consultar una botiga",
    "talkTitle": "SEU.<br><em>PARLEM.</em>",
    "talkIntro": "Una pregunta, una cuina per alimentar o una idea per compartir. A l’altra banda hi ha una persona de veritat.",
    "address": "VINE A CONÈIXER-NOS",
    "meta": {
      "title": "Coneix Smokers — obrador, repartiment i contacte a Badalona",
      "description": "Descobreix l’obrador de Smokers, troba plats fumats a domicili o en una botiga i parla amb el nostre equip de Badalona. Tot en un mateix lloc."
    }
  }
};
window.SMOKERS_RENDER_HUB=({state,c,asset,url,button,panelIcon,config,image,sectionLink,form,contacts,copy})=>{
 const t=window.SMOKERS_HUB_COPY[state.lang],a=copy.about,s=copy.stockists,l=copy.labels;
 const sections=['workshop','find','enquiry'];
 const chapter=(i)=>`<span class="ss-chapter-number">0${i+1}</span><span>${t.chapters[i]}</span>`;
 return `<section class="ss-hub-hero">
  <img class="ss-hub-wallpaper" src="${asset('reference-pro.webp')}" alt="" width="1909" height="820" fetchpriority="high">
  <div class="ss-hub-hero-copy"><p class="ss-eyebrow">${t.eyebrow}</p><h1>${t.title}</h1><p class="ss-lead">${t.intro}</p><div class="ss-actions">${button(t.chapters[1],sectionLink('contact','find'),'ss-primary',true)}${button(t.chapters[2],sectionLink('contact','enquiry'),'ss-outline')}</div></div>
  <div class="ss-hub-hero-note">${panelIcon('smoke')}<strong>${t.note}</strong><span>BADALONA · EST. 2025</span></div>
  <nav class="ss-hub-chapters" aria-label="${l.contents}">${sections.map((id,i)=>`<a href="${sectionLink('contact',id)}">${chapter(i)}<b aria-hidden="true">↘</b></a>`).join('')}</nav>
 </section>
 <section class="ss-hub-workshop" id="ss-workshop">
  <div class="ss-hub-mosaic"><figure>${image(0)}<figcaption>${a.caption}</figcaption></figure><figure>${image(6)}</figure><div class="ss-hub-time"><strong>12 H</strong><span>${c().marinade}</span>${panelIcon('smoke')}</div></div>
  <div class="ss-hub-story"><p class="ss-eyebrow">01 / ${t.chapters[0]}</p><h2>${a.section}</h2><p class="ss-lead">${a.body}</p><p class="ss-hub-signature">${c().tagline}<span>SMOKERS · BADALONA</span></p></div>
  <div class="ss-hub-process">${a.steps.map(([number,title,body],i)=>`<article>${panelIcon(['leaf','smoke','thermo','fork'][i])}<span class="ss-hub-process-number">${number}</span><h3>${title}</h3><p>${body}</p></article>`).join('')}</div>
 </section>
 <section class="ss-hub-find" id="ss-find"><div class="ss-hub-section-heading"><div><p class="ss-eyebrow">02 / ${t.chapters[1]}</p><h2>${t.findTitle}</h2></div><p class="ss-lead">${t.findIntro}</p></div>
  <div class="ss-hub-find-options"><article class="ss-hub-delivery"><span class="ss-hub-option-icon">${panelIcon('bag')}</span><h3>${t.delivery}</h3><p>${s.deliveryBody}</p><div class="ss-hub-providers">${config.delivery.filter(app=>app.name!=='Just Eat').map(app=>`<a href="${app.url}" target="_blank" rel="noopener" data-delivery="${app.name}" aria-label="${c().orderOn} ${app.name}"><img src="${asset(app.image)}" width="130" height="60" alt="${app.name}" loading="lazy"><span aria-hidden="true">↗</span></a>`).join('')}</div><p class="ss-hub-availability">${panelIcon('pin')}${c().availability}</p></article>
  <article class="ss-hub-stockist"><div class="ss-hub-stockist-copy"><span class="ss-hub-option-icon">${panelIcon('shop')}</span><h3>${t.shop}</h3><p>${t.shopBody}</p><a class="ss-button ss-dark-button" href="${sectionLink('contact','enquiry')}" data-enquiry-topic="2">${t.shopCta}<span aria-hidden="true">↗</span></a></div><div class="ss-hub-stockist-photo">${image(8)}</div></article></div>
 </section>
 <section class="ss-hub-contact ss-enquiry-section" id="ss-enquiry"><div class="ss-hub-contact-copy"><p class="ss-eyebrow">03 / ${t.chapters[2]}</p><h2>${t.talkTitle}</h2><p class="ss-lead">${t.talkIntro}</p>${contacts()}<div class="ss-hub-address"><p class="ss-eyebrow">${t.address}</p><address>Selva 5, local A<br>08917 Badalona</address><p>${l.hours}<br>${l.visit}</p><a href="https://www.google.com/maps/search/?api=1&query=Selva+5+08917+Badalona" target="_blank" rel="noopener">${l.directions} ↗</a></div></div>${form('contact')}</section>`;
};

document.addEventListener("DOMContentLoaded", () => {

  const API_KEY = 'f76e24137c6b207998e708de432c66ad';

  async function getCurrentTemp(lat, lon, countryName) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();
      return data.main.temp;
    } catch (error) {
      console.error(`Failed to fetch weather for ${countryName}:`, error);
      return null;
    }
  }

  // Constants
  const ME_CODES = ["AE", "BH", "CY", "EG", "IR", "IQ", "JO", "KW", "LB", "OM", "PS", "QA", "SA", "SY", "TR", "YE"];
  const ME_FILL = 0x0AAA40;
  const HIGHLIGHT = 0xFF0000;

  // User location
  let userLat = null, userLon = null;
  let selectedPolygon = null;

  // Haversine formula to calculate distance (in km) between two lat/lon points
  function haversine(lat1, lon1, lat2, lon2) {
    const toR = x => x * Math.PI / 180;
    const R = 6371; // Earth radius in km
    const dLat = toR(lat2 - lat1);
    const dLon = toR(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(toR(lat1)) * Math.cos(toR(lat2)) *
      Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  // DRY utility to reset polygon selection
  function resetPolygonSelection() {
    if (!selectedPolygon) return;
    selectedPolygon.set("hoverable", true);
    selectedPolygon.dataItem.dataContext.fill = ME_FILL;
    selectedPolygon.set("fill", am5.color(ME_FILL));
    selectedPolygon = null;
  }

  // globe setup
  const root = am5.Root.new("chartdiv");
  root.setThemes([am5themes_Animated.new(root)]);
  const chart = root.container.children.push(am5map.MapChart.new(root, {
    panX: "rotateX",
    panY: "rotateY",
    projection: am5map.geoOrthographic()
  }));
  chart.seriesContainer.setAll({
    scale: 0.8,
    y: am5.percent(10),
    x: am5.percent(10),
    centerX: am5.percent(50),
    centerY: am5.percent(50)
  });

  // ocean background
  const bg = am5map.MapPolygonSeries.new(root, {});
  bg.mapPolygons.template.setAll({ fill: am5.color(0x000080), strokeOpacity: 0 });
  bg.data.push({ geometry: am5map.getGeoRectangle(90, 180, -90, -180) });
  chart.series.push(bg);

  // graticule lines
  const grat = am5map.GraticuleSeries.new(root, {});
  grat.mapLines.template.setAll({ stroke: am5.color(0xffffff), strokeOpacity: 0.1 });
  chart.series.push(grat);

  // country polygons
  const polygonSeries = am5map.MapPolygonSeries.new(root, { geoJSON: am5geodata_worldLow });
  polygonSeries.mapPolygons.template.setAll({
    tooltipText: "{name}",
    interactive: true,
    fill: am5.color(0x68dc76),
    stroke: am5.color(0xffffff),
    strokeWidth: 0.8
  });
  polygonSeries.mapPolygons.template.states.create("hover", { fill: am5.color(0x006400) });
  polygonSeries.mapPolygons.template.adapters.add("fill", (orig, target) => { // add adapter to override "fill" color of each country
    const stored = target.dataItem?.dataContext?.fill; // check if a custom fill color was stored in the polygon's dataContext 
    return (typeof stored === "number")  // if custom color exists use it, otherwise use the original default color
    ? am5.color(stored) // use the stored color (red)
    : orig; // use the original default color (green)
  });

  chart.series.push(polygonSeries);

  polygonSeries.events.on("datavalidated", () => {
    polygonSeries.mapPolygons.each(p => {
      const id = p.dataItem.get("id");
      if (ME_CODES.includes(id)) {
        p.dataItem.dataContext.fill = ME_FILL;
        p.set("fill", am5.color(ME_FILL));
      }
    });
  });

  chart.appear(1000, 100);
  window.polygonSeries = polygonSeries;

  // Country data
  const countryInfo = {
    "AE": {
      name: "United Arab Emirates",
      text: "a country on the Arabian Peninsula known for its futuristic skyline, desert oases, and man‑made islands.",
      image: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Flag_of_the_United_Arab_Emirates.svg",
      capital: "Abu Dhabi",
      landmark: "Burj Khalifa",
      images: [
        "https://ralphdeal.s3.amazonaws.com/wp-content/uploads/2024/04/UAE_Blog-203.jpg",
        "https://admin.expatica.com/ae/wp-content/uploads/sites/15/2019/11/united-arab-emirates-1536x1024.jpg",
        "https://www.mediaoffice.abudhabi/assets/resized/sm/upload/qx/7q/em/iv/20231122_SZGM_Spaces-of-Light--06-0-690-0-0.jpg?k=2590dbe4b7"
      ],
      languages: ["Arabic"]
    },
    "BH": {
      name: "Bahrain",
      text: "an island nation in the Persian Gulf known for its pearl‑diving history, coral reefs, and traditional wooden dhows.",
      image: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Flag_of_Bahrain.svg",
      capital: "Manama",
      landmark: "Bahrain World Trade Center",
      images: [
        "https://a.travel-assets.com/findyours-php/viewfinder/images/res70/522000/522853-bahrain-world-trade-center.jpg",
        "https://www.frankudo.com/img-get2/I00002clHK_nSUbE/fit=1000x750/bahrain-manama-pearl-monument.jpg",
        "https://us.123rf.com/450wm/philipus/philipus1603/philipus160300002/53142089-skyline-of-manama-city-illuminated-at-night-kingdom-of-bahrain-middle-east.jpg?ver=6"
      ],
      languages: ["Arabic"]
    },
    "CY": {
      name: "Cyprus",
      text: "a Mediterranean island blending Greek and Turkish heritage, with sandy beaches, vineyards, and ancient ruins.",
      image: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Flag_of_Cyprus.svg",
      capital: "Nicosia",
      landmark: "Tombs of the Kings",
      images: [
        "https://static.wixstatic.com/media/0e290f_ee14620792a94013a70a70a6f6cb67a5~mv2.jpg/v1/fill/w_568,h_370,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/0e290f_ee14620792a94013a70a70a6f6cb67a5~mv2.jpg",
        "https://www.shutterstock.com/image-photo/landmarks-cyprus-island-antique-kourion-600nw-1678136626.jpg",
        "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/d0/4a/98/caption.jpg?w=500&h=500&s=1"
      ],
      languages: ["Greek", "Turkish"]
    },
    "EG": {
      name: "Egypt",
      text: "a transcontinental country centered on the Nile valley, celebrated for its iconic pyramids, river communities, and desert landscapes.",
      image: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Flag_of_Egypt.svg",
      capital: "Cairo",
      landmark: "Great Pyramid of Giza",
      images: [
        "https://www.onthegotours.com/repository/Sphinx-at-the-Pyramids-Egypt-Tours--On-The-Go-Tours-558401520421424.jpg",
        "https://airlinesofficedesk.com/wp-content/uploads/2024/03/Alexandria-Egypt.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/All_Gizah_Pyramids.jpg/1200px-All_Gizah_Pyramids.jpg"
      ],
      languages: ["Arabic"]
    },
    "IR": {
      name: "Iran",
      text: "a country of rugged mountain ranges, vast deserts, lush forests, and a long tradition of carpet weaving and ceramics.",
      image: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Flag_of_Iran.svg",
      capital: "Tehran",
      landmark: "Persepolis",
      images: [
        "https://upload.wikimedia.org/wikipedia/commons/2/23/Azadi_Tower_%2829358497718%29.jpg",
        "https://images.travelandleisureasia.com/wp-content/uploads/sites/6/2024/02/21152503/tehran.jpeg",
        "https://media.istockphoto.com/id/1321471040/photo/badab-e-surt-spring-is-a-natural-site-in-mazandaran-province-95-km-south-of-sari-in-iran.jpg?s=612x612&w=0&k=20&c=nHQOxgCKaWCEUaoyTNfwYv4wYjyYpCSCgoIkdLdj2IA="
      ],
      languages: ["Persian"]
    },
    "IQ": {
      name: "Iraq",
      text: "a land between the Tigris and Euphrates rivers, featuring fertile plains, marshlands, and some of the world’s oldest archaeological sites.",
      image: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Flag_of_Iraq.svg",
      capital: "Baghdad",
      landmark: "Ziggurat of Ur",
      images: [
        "https://idsb.tmgrup.com.tr/ly/uploads/images/2021/08/17/136874.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/صوره_في_اجواء_مطريه_للمأذنه_الملويه_في_سامراء_العراق.jpg/1200px-صوره_في_اجواء_مطريه_للمأذنه_الملويه_في_سامراء_العراق.jpg",
        "https://www.theglobetrottingdetective.com/wp-content/uploads/2020/12/Jalil-Khayat-Mosque-Erbil-Irak.jpg"
      ],
      languages: ["Arabic", "Kurdish"]
    },
    "JO": {
      name: "Jordan",
      text: "a desert country famous for its rose‑red canyons, rock‑cut architecture, and a mineral‑rich salty lake.",
      image: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Flag_of_Jordan.svg",
      capital: "Amman",
      landmark: "Petra",
      images: [
        "https://dynamic-media.tacdn.com/media/photo-o/2e/fd/96/9c/caption.jpg?w=1000&h=800&s=1",
        "https://media.istockphoto.com/id/845702822/photo/top-view-of-the-new-downtown-of-amman.jpg?s=612x612&w=0&k=20&c=Bm7uu-rw2jq-zl2zyNvMSy4ZyyZCQthJpec1x0brSUk=",
        "https://thumbs.dreamstime.com/b/amman-city-capital-jordan-146739796.jpg"
      ],
      languages: ["Arabic"]
    },
    "KW": {
      name: "Kuwait",
      text: "a small country along the northern Persian Gulf, characterized by sandy shores, inland dunes, and traditional boatbuilding.",
      image: "https://upload.wikimedia.org/wikipedia/commons/a/aa/Flag_of_Kuwait.svg",
      capital: "Kuwait City",
      landmark: "Kuwait Towers",
      images: [
        "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/10/3d/ef/fc.jpg",
        "https://www.datocms-assets.com/61479/1708340364-urban-high-rise-daytime.jpg?w=3840&q=70&auto=compress,enhance,format",
        "https://www.newhilite.com/images/kuwaittower.jpg"
      ],
      languages: ["Arabic"]
    },
    "LB": {
      name: "Lebanon",
      text: "a coastal country of cedar‑covered hills, terraced mountains, and well‑preserved Roman and Phoenician remains.",
      image: "https://upload.wikimedia.org/wikipedia/commons/5/59/Flag_of_Lebanon.svg",
      capital: "Beirut",
      landmark: "Baalbek Ruins",
      images: [
        "https://www.historyhit.com/app/uploads/2021/05/Baalbek.jpg",
        "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/14/10/2d/fa/beirut.jpg?w=1400&h=1400&s=1",
        "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/12/97/7e/fc/corniche.jpg?w=1200&h=-1&s=1"
      ],
      languages: ["Arabic", "French"]
    },
    "OM": {
      name: "Oman",
      text: "a country of dramatic mountain wadis, rolling sand dunes, and a lengthy coastline on the Arabian Sea.",
      image: "https://upload.wikimedia.org/wikipedia/commons/d/dd/Flag_of_Oman.svg",
      capital: "Muscat",
      landmark: "Sultan Qaboos Grand Mosque",
      images: [
        "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0c/3d/58/aa/photo-provided-by-the.jpg?w=1200&h=-1&s=1",
        "https://cdn.divessi.com/cached/Oman_iStock-Baiju-Jose.jpg/1200.jpg",
        "https://imageio.forbes.com/specials-images/imageserve/5f58b4273481d1e7b0617a7f/Local-Landmarks/960x0.jpg?height=474&width=711&fit=bounds"
      ],
      languages: ["Arabic"]
    },
    "PS": {
      name: "Palestine",
      text: "a region on the eastern Mediterranean with olive groves, ancient stone villages, and a coastal plain.",
      image: "https://upload.wikimedia.org/wikipedia/commons/0/00/Flag_of_Palestine.svg",
      capital: "Jerusalem",
      landmark: "Dome of the Rock",
      images: [
        "https://zamzam.com/blog/wp-content/uploads/2021/08/shutterstock_1745937893.jpg",
        "https://www.aljazeera.com/wp-content/uploads/2025/02/image-1738850613.jpg?resize=1800%2C1080&quality=80",
        "https://www.palestinenature.org/DSCF0821-3-compressor.jpg"
      ],
      languages: ["Arabic"]
    },
    "QA": {
      name: "Qatar",
      text: "a peninsular country in the Persian Gulf noted for its modern skyline, cultural museums, and sweeping desert dunes.",
      image: "https://upload.wikimedia.org/wikipedia/commons/6/65/Flag_of_Qatar.svg",
      capital: "Doha",
      landmark: "Museum of Islamic Art",
      images: [
        "https://www.swissinfo.ch/content/wp-content/uploads/sites/13/2022/10/40dd4d2cf2eb9c14cb34c6c29ce51714-familie-and-skyline-data.jpg",
        "https://stories.forbestravelguide.com/wp-content/uploads/2024/02/HeroBestDohaHotels-RafflesDoha-ExteriorDay-CreditRafflesDoha.jpg",
        "https://luggageandlipstick.com/wp-content/uploads/2020/01/0-doha_patti-morrow_luggageandlipstick.com_3850732.jpg"
      ],
      languages: ["Arabic"]
    },
    "SA": {
      name: "Saudi Arabia",
      text: "a vast country on the Arabian Peninsula with sweeping desert expanses, western mountain ranges, and Red Sea beaches.",
      image: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Flag_of_Saudi_Arabia.svg",
      capital: "Riyadh",
      landmark: "Masjid al-Haram",
      images: [
        "https://www.arabianbusiness.com/wp-content/uploads/sites/3/cloud/2021/09/14/tUX1PMg0-saudi-arabia-3.jpg",
        "https://img.etimg.com/thumb/width-1200,height-900,imgsize-2715903,resizemode-75,msid-120620157/nri/visit/saudi-arabia-bans-stay-for-non-hajj-visas-holding-tourists-in-makkah.jpg",
        "https://content.r9cdn.net/rimg/dimg/60/83/227458b2-city-17976-16500d9edcd.jpg?width=1366&height=768&xhint=1175&yhint=1399&crop=true"
      ],
      languages: ["Arabic"]
    },
    "SY": {
      name: "Syria",
      text: "a Levantine country with a short Mediterranean coastline, fertile river valleys, and multi‑layered ancient ruins.",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Flag_of_Syria_%282025-%29.svg/1200px-Flag_of_Syria_%282025-%29.svg.png",
      capital: "Damascus",
      landmark: "Ancient City of Palmyra",
      images: [
        "https://www.historyhit.com/app/uploads/bis-images/5163461/shutterstock_Palmyra-788x537.jpg?x91233",
        "https://live.staticflickr.com/1759/28643611828_4773cac73b_h.jpg",
        "https://www.aljazeera.net/wp-content/uploads/2023/01/shutterstock_709817014.jpg?w=770&resize=770%2C513"
      ],
      languages: ["Arabic"]
    },
    "TR": {
      name: "Türkiye",
      text: "a transcontinental country spanning Europe and Asia, with Aegean and Mediterranean shores, high plateaus, and historic landmarks.",
      image: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Flag_of_Turkey.svg",
      capital: "Ankara",
      landmark: "Hagia Sophia",
      images: [
        "https://media.istockphoto.com/id/475460738/photo/blue-mosque-and-hagia-sophia.jpg?s=612x612&w=0&k=20&c=nE7r3yry9zcZ7cYWWHhEj_jtPQklWHUQx-12-mQJU_4=",
        "https://cdn.britannica.com/50/198450-050-3554B2AF/Ankara-Turkey.jpg",
        "https://d32ex7notsszg6.cloudfront.net/img/content/37415_Antalya%20in%20Turkey.jpg"
      ],
      languages: ["Turkish"]
    },
    "YE": {
      name: "Yemen",
      text: "a country at the southern tip of the Arabian Peninsula, featuring terraced highlands, volcanic islands, and desert plains.",
      image: "https://upload.wikimedia.org/wikipedia/commons/8/89/Flag_of_Yemen.svg",
      capital: "Sana'a",
      landmark: "Old City of Sana'a",
      images: [
        "https://holmakhdar.org/wp-content/uploads/2021/03/باب-اليمن-مدخل-مدينة-صنعاء-القديمة-الصورة-او-تي-دي.jpg",
        "https://img.atlasobscura.com/HWQTlSFUIBfYZK3CoDcKnCo6ASaIUInR26nktIXPuzk/rt:fit/w:600/q:81/sm:1/scp:1/ar:1/aHR0cHM6Ly9hdGxh/cy1kZXYuczMuYW1h/em9uYXdzLmNvbS91/cGxvYWRzL3BsYWNl/X2ltYWdlcy8wMmI2/ZmE4OS1hOGMxLTRh/Y2MtYTk1OC1mOGY1/OGJhZmE1MWVjY2Nj/ZjYxOTYwNTZkOGU1/ZjBfU3VsdGFuX0Fs/X0thdGhpcmlfUGFs/YWNlLF9TZWl5dW5f/KDIyODU4OTQ5MDMp/LmpwZw.jpg",
        "https://cultureroadtravel.com/wp-content/uploads/2024/12/Socotra_beautiful_beach_bottle_trees.jpg"
      ],
      languages: ["Arabic"]
    }
  };

  // Show info card
  function showNotecard(id) {
    const info = countryInfo[id];
    if (!info) return;

    document.getElementById("notecard-title").textContent = info.name;
    document.getElementById("notecard-text").textContent = info.text;
    document.getElementById("notecard-image").src = info.image;
    document.getElementById("notecard-capital").textContent = info.capital || "—";
    document.getElementById("notecard-landmark").textContent = info.landmark || "—";

    const galleryImgs = document.querySelectorAll("#notecard-gallery .notecard-pics");
    if (info.images && info.images.length >= 3) {
      galleryImgs.forEach((img, i) => img.src = info.images[i]);
    }

    document.getElementById("notecard-extra").classList.add("hidden");
    document.getElementById("showMoreBtn").textContent = "Show more…";
    document.getElementById("notecard").classList.remove("hidden");
  }

  function hideNotecard() {
    document.getElementById("notecard").classList.add("hidden");
  }

  // Handle clicks
  polygonSeries.mapPolygons.template.events.on("click", ev => {
    if (ev.originalEvent?.stopPropagation) ev.originalEvent.stopPropagation();
    const id = ev.target.dataItem.get("id");
    if (ME_CODES.includes(id)) {
      zoomToCountry(id);
      showNotecard(id);
    }
  });

  bg.mapPolygons.template.events.on("click", () => {
    resetPolygonSelection();
    hideNotecard();
  });

  document.querySelector(".notecard-close").addEventListener("click", () => {
    resetPolygonSelection();
    hideNotecard();
  });

  document.getElementById("showMoreBtn").addEventListener("click", () => {
    const extra = document.getElementById("notecard-extra");
    const btn = document.getElementById("showMoreBtn");
    const isHidden = extra.classList.contains("hidden");
    extra.classList.toggle("hidden", !isHidden);
    btn.textContent = isHidden ? "Show less…" : "Show more…";
  });

  // zoom to a selected country and highlight it
  function zoomToCountry(id) {
    if (selectedPolygon) {
      resetPolygonSelection();
    }
    const di = polygonSeries.getDataItemById(id);
    const poly = di?.get("mapPolygon");
    const geo = poly?.geoCentroid();
    if (!poly || !geo) return;

    di.dataContext.fill = HIGHLIGHT;
    poly.set("fill", am5.color(HIGHLIGHT));
    poly.set("hoverable", false);
    selectedPolygon = poly;

    chart.animate({ key: "rotationX", to: -geo.longitude, duration: 1000, easing: am5.ease.out(am5.ease.cubic) });
    chart.animate({ key: "rotationY", to: -geo.latitude, duration: 1000, easing: am5.ease.out(am5.ease.cubic) });
    setTimeout(() => {
      chart.zoomToGeoPoint({ longitude: geo.longitude, latitude: geo.latitude }, 4, true);
    }, 1100);
  }

  // where to / my trips
  const tabs = document.querySelectorAll(".sidebar-tab");
  const where = document.getElementById("whereToSection");
  const trips = document.getElementById("myTripsSection");
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => {
      tabs.forEach(x => x.classList.remove("active"));
      t.classList.add("active");
      where.classList.toggle("hidden", i !== 0);
      trips.classList.toggle("hidden", i === 0);
    });
  });

  // toggle dropdowns
  document.querySelectorAll(".dropdown-header").forEach(h => {
    h.addEventListener("click", () => {
      document.querySelectorAll(".dropdown").forEach(d => {
        if (d.querySelector(".dropdown-header") !== h) d.classList.remove("open");
      });
      h.parentElement.classList.toggle("open");
    });
  });

  document.getElementById("randomDestinationBtn").addEventListener("click", () => {
    const randomId = ME_CODES[Math.floor(Math.random() * ME_CODES.length)];
    zoomToCountry(randomId);
    showNotecard(randomId);
  });

  // sidebar country click
  document.querySelectorAll('.dropdown-item[data-country]').forEach(el => {
    el.addEventListener("click", () => {
      const id = el.getAttribute("data-country");
      zoomToCountry(id);
      showNotecard(id);
    });
  });

  // filter tabs
  document.querySelectorAll('.dropdown-item[data-filter]').forEach(el => {
    el.addEventListener("click", () => {
      document.querySelectorAll('.dropdown-item[data-filter]').forEach(x => x.classList.remove("active"));
      el.classList.add("active");
      document.getElementById("weather-controls").classList.add("hidden");
      document.getElementById("languages-controls").classList.add("hidden");
      document.getElementById("distance-controls").classList.add("hidden");

      const f = el.getAttribute("data-filter");
      if (f === "weather") document.getElementById("weather-controls").classList.remove("hidden");
      if (f === "languages") document.getElementById("languages-controls").classList.remove("hidden");
      if (f === "distance") document.getElementById("distance-controls").classList.remove("hidden");
    });
  });

  // use my location button
  document.getElementById("use-my-location").addEventListener("click", () => {
    const st = document.getElementById("location-status");

    if (!navigator.geolocation) {
      st.textContent = "Geolocation not supported";
      return;
    }

    st.textContent = "Requesting location…";

    navigator.geolocation.getCurrentPosition(
      position => {
        userLat = position.coords.latitude;
        userLon = position.coords.longitude;
        st.textContent = "Location acquired";
      },
      err => {
        console.error("Geolocation error:", err);
        st.textContent = "Permission denied or unavailable";
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });

  // distance filter
  document.getElementById("apply-distance-filter").addEventListener("click", () => {
    let lat, lon;
    const ref = document.getElementById("distance-ref").value;

    if (!ref) {
      alert("Please select a reference location.");
      return;
    }

    if (ref === "current") {
      if (userLat == null) return alert("Please enable location first.");
      lat = userLat; lon = userLon;
    } else {
      const geo = polygonSeries.getDataItemById(ref)?.get("mapPolygon")?.geoCentroid();
      lat = geo.latitude; lon = geo.longitude;
    }

    const maxKm = +document.getElementById("distance-max").value;
    const results = [];
    for (const id of ME_CODES) {
      const geo = polygonSeries.getDataItemById(id)?.get("mapPolygon")?.geoCentroid();
      const d = haversine(lat, lon, geo.latitude, geo.longitude);
      if (d <= maxKm) results.push({ id, name: countryInfo[id].name, d: Math.round(d) });
    }

    const box = document.getElementById("distance-results");
    box.innerHTML = results.length
      ? results.map(r => `<div class="dropdown-item" data-country="${r.id}">${r.name}: ${r.d} km</div>`).join("")
      : `<div class="dropdown-item">No results</div>`;

    box.querySelectorAll('[data-country]').forEach(el => {
      el.addEventListener("click", () => {
        const c = el.getAttribute("data-country");
        zoomToCountry(c);
        showNotecard(c);
      });
    });
  });

  // weather filter
  document.getElementById("apply-weather-filter").addEventListener("click", async () => {
    const min = +document.getElementById("weather-min").value;
    const max = +document.getElementById("weather-max").value;
    const results = [];

    for (const id of ME_CODES) {
      const geo = polygonSeries.getDataItemById(id)?.get("mapPolygon")?.geoCentroid();
      const temp = await getCurrentTemp(geo.latitude, geo.longitude, countryInfo[id].name);
      if (temp !== null && temp >= min && temp <= max) {
        results.push({ id, name: countryInfo[id].name, temp: Math.round(temp) });
      }
    }

    const box = document.getElementById("weather-results");
    box.innerHTML = results.length
      ? results.map(r => `<div class="dropdown-item" data-country="${r.id}">${r.name}: ${r.temp}°C</div>`).join("")
      : `<div class="dropdown-item">No results</div>`;

    box.querySelectorAll('[data-country]').forEach(el => {
      el.addEventListener("click", () => {
        const c = el.getAttribute("data-country");
        zoomToCountry(c);
        showNotecard(c);
      });
    });
  });

  // language filter
  const languageSelect = document.getElementById("language-select");
  const applyLanguageFilterBtn = document.getElementById("apply-language-filter");
  const languageResultsDiv = document.getElementById("language-results");

  // populate language list
  const langs = new Set();
  for (const c in countryInfo) {
    countryInfo[c].languages.forEach(l => langs.add(l));
  }
  langs.forEach(l => {
    const opt = document.createElement("option");
    opt.value = l;
    opt.textContent = l;
    languageSelect.appendChild(opt);
  });

  // apply language filter
  applyLanguageFilterBtn.addEventListener("click", () => {
    const sel = languageSelect.value;
    const matches = [];

    if (!sel) {
      alert("Please select a language.");
      return;
    }
    for (const c in countryInfo) {
      if (countryInfo[c].languages.includes(sel)) {
        matches.push({ id: c, name: countryInfo[c].name });
      }
    }

    languageResultsDiv.innerHTML = matches.length
      ? matches.map(m => `<div class="dropdown-item" data-country="${m.id}">${m.name}</div>`).join("")
      : `<div class="dropdown-item">No results for “${sel}”</div>`;

    languageResultsDiv.querySelectorAll('[data-country]').forEach(el => {
      el.addEventListener("click", () => {
        const c = el.getAttribute("data-country");
        zoomToCountry(c);
        showNotecard(c);
      });
    });
  });

  // trip save / load
  async function loadTrips() {
    const res = await fetch('/api/trips');
    const { trips } = await res.json();
    document.querySelectorAll('#tripChecklist input').forEach(cb => {
      cb.checked = trips.includes(cb.value);
    });
  }

  async function saveTrips() {
    const trips = [...document.querySelectorAll('#tripChecklist input:checked')].map(cb => cb.value);
    await fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trips })
    });
  }

  window.addEventListener('load', loadTrips);
  document.getElementById('tripChecklist').addEventListener('change', saveTrips);
});


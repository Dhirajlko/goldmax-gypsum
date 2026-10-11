/**
 * GOLDMAX GYPSUM PLASTER - INTERACTIVE CLIENT LOGIC
 * Gypsum Calculator, Packaging Variant Switcher, WhatsApp Integrations, Lightbox
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initColorVariantSwitcher();
  initGypsumCalculator();
  initInquiryForm();
  initBackToTop();
  initScrollSpy();
});

/* ==========================================================================
   1. MOBILE MENU TOGGLE
   ========================================================================== */
function initMobileMenu() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      hamburgerBtn.classList.toggle('active');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        hamburgerBtn.classList.remove('active');
      });
    });
  }
}

/* ==========================================================================
   2. PACKAGING VARIANT COLOR SWITCHER
   ========================================================================== */
function initColorVariantSwitcher() {
  const currentBagImg = document.getElementById('currentBagImg');
  const selectedVariantName = document.getElementById('selectedVariantName');
  const colorBtns = document.querySelectorAll('.color-btn');

  colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      colorBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const newImg = btn.getAttribute('data-img');
      const newName = btn.getAttribute('data-name');

      if (currentBagImg) {
        currentBagImg.style.opacity = '0';
        currentBagImg.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
          currentBagImg.src = newImg;
          currentBagImg.style.opacity = '1';
          currentBagImg.style.transform = 'scale(1)';
        }, 200);
      }

      if (selectedVariantName) {
        selectedVariantName.textContent = `${newName} (Type-A 25KG)`;
      }
    });
  });
}

/* ==========================================================================
   3. GYPSUM PLASTER CALCULATOR
   ========================================================================== */
function initGypsumCalculator() {
  let isSqFt = true;
  const unitSqFtBtn = document.getElementById('unitSqFt');
  const unitSqMtBtn = document.getElementById('unitSqMt');
  const areaInput = document.getElementById('areaInput');
  const thicknessSelect = document.getElementById('thicknessSelect');
  const surfaceTypeSelect = document.getElementById('surfaceTypeSelect');
  const calcBtn = document.getElementById('calcBtn');
  
  const bagsResult = document.getElementById('bagsResult');
  const bagsWeightSub = document.getElementById('bagsWeightSub');
  const waterResult = document.getElementById('waterResult');
  const waterSavedResult = document.getElementById('waterSavedResult');
  const timeSavedResult = document.getElementById('timeSavedResult');
  const sendEstimateBtn = document.getElementById('sendEstimateBtn');

  // Toggle Units
  if (unitSqFtBtn && unitSqMtBtn) {
    unitSqFtBtn.addEventListener('click', () => {
      if (!isSqFt) {
        isSqFt = true;
        unitSqFtBtn.classList.add('active');
        unitSqMtBtn.classList.remove('active');
        // Convert existing value from sq mt to sq ft
        const currentVal = parseFloat(areaInput.value) || 0;
        areaInput.value = Math.round(currentVal * 10.764);
        calculatePlaster();
      }
    });

    unitSqMtBtn.addEventListener('click', () => {
      if (isSqFt) {
        isSqFt = false;
        unitSqMtBtn.classList.add('active');
        unitSqFtBtn.classList.remove('active');
        // Convert existing value from sq ft to sq mt
        const currentVal = parseFloat(areaInput.value) || 0;
        areaInput.value = Math.round(currentVal / 10.764);
        calculatePlaster();
      }
    });
  }

  function calculatePlaster() {
    const rawArea = parseFloat(areaInput.value) || 0;
    if (rawArea <= 0) return;

    // Convert area to sq meters for calculation
    const areaInSqMt = isSqFt ? (rawArea / 10.7639) : rawArea;
    const areaInSqFt = isSqFt ? rawArea : Math.round(rawArea * 10.7639);

    const thicknessMm = parseFloat(thicknessSelect.value) || 10;
    const surface = surfaceTypeSelect.value;

    // Wastage factor based on surface
    let wastage = 1.05; // 5% default for AAC
    if (surface === 'rcc') wastage = 1.04;
    if (surface === 'brick') wastage = 1.08;

    // 1 bag of 25kg covers approx 11 sq.m at 10mm thickness
    // Yield formula: bags = (areaInSqMt * (thicknessMm / 10) / 11) * wastage
    const baseCoveragePerBagAt10mm = 11.0; // sq meters
    const bagYieldAtThickness = baseCoveragePerBagAt10mm * (10 / thicknessMm);
    const totalBagsNeeded = Math.ceil((areaInSqMt / bagYieldAtThickness) * wastage);
    
    // Weight
    const totalWeightKg = totalBagsNeeded * 25;
    
    // Water demand for mixing: ~17.5 Litres per 25kg bag
    const waterDemandLiters = Math.round(totalBagsNeeded * 17.5);

    // Water saved vs sand-cement curing (approx 15 litres per sq ft over 10-14 days)
    const waterSavedLiters = Math.round(areaInSqFt * 14.5);

    // Time saved estimate (days)
    let timeDaysSaved = "10 - 15 Days";
    if (areaInSqFt > 5000) timeDaysSaved = "20 - 30 Days";
    if (areaInSqFt > 15000) timeDaysSaved = "45 - 60 Days";

    // Update UI
    if (bagsResult) bagsResult.textContent = `${totalBagsNeeded} Bags`;
    if (bagsWeightSub) bagsWeightSub.textContent = `Approx ${totalWeightKg.toLocaleString()} Kg (${(totalWeightKg/1000).toFixed(1)} MT)`;
    if (waterResult) waterResult.textContent = `~${waterDemandLiters.toLocaleString()} L`;
    if (waterSavedResult) waterSavedResult.textContent = `~${waterSavedLiters.toLocaleString()} Litres`;
    if (timeSavedResult) timeSavedResult.textContent = timeDaysSaved;

    return {
      area: `${rawArea} ${isSqFt ? 'Sq.Ft' : 'Sq.Mtr'}`,
      thickness: `${thicknessMm} mm`,
      surface: surface.toUpperCase(),
      bags: totalBagsNeeded,
      weight: `${(totalWeightKg/1000).toFixed(2)} MT`,
      waterNeeded: `${waterDemandLiters} L`,
      waterSaved: `${waterSavedLiters} L`
    };
  }

  if (calcBtn) {
    calcBtn.addEventListener('click', calculatePlaster);
  }

  if (areaInput) {
    areaInput.addEventListener('input', calculatePlaster);
  }

  if (thicknessSelect) {
    thicknessSelect.addEventListener('change', calculatePlaster);
  }

  if (surfaceTypeSelect) {
    surfaceTypeSelect.addEventListener('change', calculatePlaster);
  }

  // Initial calculation
  calculatePlaster();

  // Send Estimate to WhatsApp
  if (sendEstimateBtn) {
    sendEstimateBtn.addEventListener('click', () => {
      const data = calculatePlaster();
      const text = `*GOLDMAX GYPSUM PLASTER ESTIMATE INQUIRY*%0A%0A` +
        `• *Plaster Area:* ${data.area}%0A` +
        `• *Thickness:* ${data.thickness}%0A` +
        `• *Surface Substrate:* ${data.surface}%0A` +
        `• *Calculated Bags (25Kg):* ${data.bags} Bags (${data.weight})%0A` +
        `• *Estimated Mixing Water:* ${data.waterNeeded}%0A` +
        `• *Water Curing Saved:* ${data.waterSaved}%0A%0A` +
        `Please send me your best direct dispatch quotation and delivery timeline.`;
      
      const waUrl = `https://wa.me/918079601014?text=${text}`;
      window.open(waUrl, '_blank');
    });
  }
}

/* ==========================================================================
   4. INQUIRY FORM DISPATCH (DIRECT & WHATSAPP)
   ========================================================================== */
function initInquiryForm() {
  const form = document.getElementById('inquiryForm');
  const whatsappSubmitBtn = document.getElementById('whatsappSubmitBtn');
  const formSuccessAlert = document.getElementById('formSuccessAlert');

  function getFormData() {
    return {
      name: document.getElementById('formName').value.trim(),
      phone: document.getElementById('formPhone').value.trim(),
      city: document.getElementById('formCity').value.trim(),
      userType: document.getElementById('formUserType').value,
      quantity: document.getElementById('formQuantity').value,
      product: document.getElementById('formProduct').value,
      message: document.getElementById('formMessage').value.trim()
    };
  }

  function validate(data) {
    if (!data.name || !data.phone || !data.city || !data.userType) {
      alert('Please fill in Name, Phone, City, and Category.');
      return false;
    }
    return true;
  }

  if (whatsappSubmitBtn) {
    whatsappSubmitBtn.addEventListener('click', () => {
      const data = getFormData();
      if (!validate(data)) return;

      const text = `*NEW INQUIRY - GOLDMAX GYPSUM PLASTER*%0A%0A` +
        `• *Name:* ${encodeURIComponent(data.name)}%0A` +
        `• *Phone:* ${encodeURIComponent(data.phone)}%0A` +
        `• *City/Location:* ${encodeURIComponent(data.city)}%0A` +
        `• *Customer Type:* ${encodeURIComponent(data.userType)}%0A` +
        `• *Product Needed:* ${encodeURIComponent(data.product)}%0A` +
        `• *Estimated Requirement:* ${encodeURIComponent(data.quantity)}%0A` +
        (data.message ? `• *Message:* ${encodeURIComponent(data.message)}%0A%0A` : '%0A') +
        `Kindly provide bulk pricing and dispatch details.`;

      const waUrl = `https://wa.me/918079601014?text=${text}`;
      window.open(waUrl, '_blank');

      if (formSuccessAlert) {
        formSuccessAlert.style.display = 'flex';
      }
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = getFormData();
      if (!validate(data)) return;

      if (formSuccessAlert) {
        formSuccessAlert.style.display = 'flex';
        form.reset();
        formSuccessAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }
}

/* ==========================================================================
   5. BACK TO TOP BUTTON
   ========================================================================== */
function initBackToTop() {
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

/* ==========================================================================
   6. SCROLL SPY FOR NAVIGATION
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   7. LIGHTBOX MODAL HANDLERS
   ========================================================================== */
function openLightbox(imgSrc, captionText) {
  const modal = document.getElementById('lightboxModal');
  const modalImg = document.getElementById('lightboxImg');
  const modalCaption = document.getElementById('lightboxCaption');

  if (modal && modalImg && modalCaption) {
    modalImg.src = imgSrc;
    modalCaption.textContent = captionText || '';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeLightbox(event) {
  const modal = document.getElementById('lightboxModal');
  const modalBox = document.querySelector('.lightbox-box');

  if (event && event.target === modalBox) {
    return;
  }

  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

// Close lightbox on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeLightbox();
  }
});

// Expose globally for HTML onclick handlers
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;

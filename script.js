document.addEventListener('DOMContentLoaded', () => {
  // --- Configuration ---
  const WHATSAPP_NUMBER = '91704261340'; // Pre-filled destination phone number

  // --- DOM Elements ---
  const canvas = document.getElementById('particle-canvas');
  const cardContainer = document.getElementById('card-container');
  const progressBar = document.getElementById('progress-bar');
  const btnStart = document.getElementById('btn-start');
  const envelopeBtn = document.getElementById('envelope-btn');
  const toast = document.getElementById('toast');
  
  const steps = [
    document.getElementById('step-1'),
    document.getElementById('step-2'),
    document.getElementById('step-3'),
    document.getElementById('step-4'),
    document.getElementById('step-5')
  ];

  const optionsStep2 = document.querySelectorAll('#step-2 .btn-outline');
  const optionsStep3 = document.querySelectorAll('#step-3 .btn-outline');
  const btnVibeYes = document.getElementById('btn-vibe-yes');
  const btnVibeNo = document.getElementById('btn-vibe-no');
  const vibeOptionsContainer = document.getElementById('vibe-options-container');
  
  const btnLockIn = document.getElementById('btn-lock-in');
  const customNote = document.getElementById('custom-note');

  // --- State Variables ---
  let currentStep = 0;
  const userChoices = {
    step2: '',
    step3: '',
    step4: 'Yes, I like your vibe', // Default since No runs away!
    dateType: '',
    note: ''
  };
  let noButtonTeleports = 0;
  const maxNoTeleports = 5;

  // --- Background Particle System ---
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor() {
      this.reset();
      this.y = Math.random() * canvas.height; // Spread initially
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + Math.random() * 100;
      this.size = Math.random() * 15 + 5;
      this.speed = Math.random() * 0.5 + 0.2;
      this.opacity = Math.random() * 0.2 + 0.05;
      this.color = Math.random() > 0.5 ? '255, 51, 119' : '140, 51, 255'; // Pink or Violet
      this.shape = Math.random() > 0.85 ? 'heart' : 'circle';
      this.wiggle = Math.random() * 2 * Math.PI;
      this.wiggleSpeed = Math.random() * 0.02;
    }

    update() {
      this.y -= this.speed;
      this.wiggle += this.wiggleSpeed;
      this.x += Math.sin(this.wiggle) * 0.3;

      if (this.y < -this.size || this.x < -this.size || this.x > canvas.width + this.size) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = `rgb(${this.color})`;

      if (this.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Draw small heart
        ctx.beginPath();
        const topCurveHeight = this.size * 0.3;
        ctx.moveTo(this.x, this.y + topCurveHeight);
        // Left side
        ctx.bezierCurveTo(
          this.x - this.size / 2, this.y - this.size / 2,
          this.x - this.size, this.y + this.size / 3,
          this.x, this.y + this.size
        );
        // Right side
        ctx.bezierCurveTo(
          this.x + this.size, this.y + this.size / 3,
          this.x + this.size / 2, this.y - this.size / 2,
          this.x, this.y + topCurveHeight
        );
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // Initialize Particles
  for (let i = 0; i < 40; i++) {
    particles.push(new Particle());
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // --- Navigation & Progress Functions ---
  function updateProgress() {
    const percent = (currentStep / (steps.length - 1)) * 100;
    progressBar.style.width = `${percent}%`;
  }

  function navigateToStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= steps.length) return;

    const currentActive = steps[currentStep];
    const nextActive = steps[stepIndex];

    currentActive.classList.add('exit');
    
    setTimeout(() => {
      currentActive.classList.remove('active', 'exit');
      nextActive.classList.add('active');
      currentStep = stepIndex;
      updateProgress();

      // Trigger Confetti on Step 5
      if (stepIndex === 4) {
        startConfetti();
      }
    }, 450); // Matches CSS transitions
  }

  // --- Step 1 Events (Envelope Click or Button Click) ---
  function openEnvelopeAndStart() {
    if (currentStep !== 0) return;
    envelopeBtn.classList.add('open');
    setTimeout(() => {
      navigateToStep(1);
    }, 900);
  }

  envelopeBtn.addEventListener('click', openEnvelopeAndStart);
  btnStart.addEventListener('click', openEnvelopeAndStart);

  // --- Step 2 Events ---
  optionsStep2.forEach(btn => {
    btn.addEventListener('click', (e) => {
      userChoices.step2 = e.target.getAttribute('data-choice');
      navigateToStep(2);
    });
  });

  // --- Step 3 Events ---
  optionsStep3.forEach(btn => {
    btn.addEventListener('click', (e) => {
      userChoices.step3 = e.target.getAttribute('data-choice');
      navigateToStep(3);
    });
  });

  // --- Step 4 Events & Runaway Button Logic ---

  btnVibeYes.addEventListener('click', () => {
    userChoices.step4 = 'Yes, I like your vibe';
    navigateToStep(4);
  });

  // Runaway mathematical logic
  function positionNoButtonRandomly() {
    const cardRect = cardContainer.getBoundingClientRect();
    const btnRect = btnVibeNo.getBoundingClientRect();

    // Set position absolute relative to the card container
    btnVibeNo.style.position = 'absolute';
    
    // Bounds for positioning inside card container
    const padding = 24;
    const minX = padding;
    const maxX = cardRect.width - btnRect.width - padding;
    const minY = 120; // Keep away from the title area
    const maxY = cardRect.height - btnRect.height - padding;

    // Pick a random spot
    let newX = minX + Math.random() * (maxX - minX);
    let newY = minY + Math.random() * (maxY - minY);

    // Make sure it doesn't immediately spawn right under the cursor
    // (We get cursor relative positions inside the event, so we'll adjust if needed)
    btnVibeNo.style.left = `${newX}px`;
    btnVibeNo.style.top = `${newY}px`;
    
    noButtonTeleports++;

    // Teasing progression as the button keeps running away
    if (noButtonTeleports === 1) {
      btnVibeNo.innerText = "Wait, no?";
    } else if (noButtonTeleports === 2) {
      btnVibeNo.innerText = "Are you sure? 😜";
    } else if (noButtonTeleports === 3) {
      btnVibeNo.innerText = "Try harder!";
    } else if (noButtonTeleports === 4) {
      btnVibeNo.innerText = "Fine, click this!";
    } else if (noButtonTeleports >= maxNoTeleports) {
      // Reached limit, transform the button into Yes
      transformNoButtonToYes();
    }
  }

  function transformNoButtonToYes() {
    btnVibeNo.style.position = 'relative';
    btnVibeNo.style.left = '0';
    btnVibeNo.style.top = '0';
    btnVibeNo.className = 'btn btn-primary font-inter';
    btnVibeNo.style.background = 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)';
    btnVibeNo.style.color = '#fff';
    btnVibeNo.style.borderColor = 'transparent';
    btnVibeNo.innerText = "Actually, yes! ❤️";
    
    // Clicking this now acts as clicking Yes
    btnVibeNo.onclick = () => {
      userChoices.step4 = 'Yes, after a playful escape';
      navigateToStep(4);
    };
  }

  // Cursor proximity handler for Desktop
  document.addEventListener('mousemove', (e) => {
    if (currentStep !== 3 || noButtonTeleports >= maxNoTeleports) return;

    const btnRect = btnVibeNo.getBoundingClientRect();
    const btnCenter = {
      x: btnRect.left + btnRect.width / 2,
      y: btnRect.top + btnRect.height / 2
    };

    // Calculate distance
    const dx = e.clientX - btnCenter.x;
    const dy = e.clientY - btnCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Trigger threshold (75px)
    if (distance < 75) {
      positionNoButtonRandomly();
    }
  });

  // Mobile Touch / Tap behavior for No button
  btnVibeNo.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevents click handler
    if (noButtonTeleports < maxNoTeleports) {
      positionNoButtonRandomly();
    }
  });

  btnVibeNo.addEventListener('click', (e) => {
    if (noButtonTeleports < maxNoTeleports) {
      e.preventDefault();
      positionNoButtonRandomly();
    }
  });


  // --- Step 5 Events (Date Selection & Form Submission) ---
  btnLockIn.addEventListener('click', () => {
    const selectedRadio = document.querySelector('input[name="date-choice"]:checked');
    userChoices.dateType = selectedRadio ? selectedRadio.value : 'Coffee date';
    userChoices.note = customNote.value.trim();

    // Construct the teaser template message
    let finalMessage = `Hey! Minnone here. I did your vibe check. Here are my answers:\n\n`;
    finalMessage += `1. Ease: "${userChoices.step2}"\n`;
    finalMessage += `2. Tension: "${userChoices.step3}"\n`;
    finalMessage += `3. Vibe: "Yes, I like your vibe too! ✨"\n\n`;
    finalMessage += `Let's hang out for a *${userChoices.dateType}*!`;
    
    if (userChoices.note) {
      finalMessage += `\nNote: "${userChoices.note}"`;
    }

    // Copy to clipboard
    navigator.clipboard.writeText(finalMessage).then(() => {
      showToast();
      
      // Delay before redirecting to share on WhatsApp
      setTimeout(() => {
        const encodedText = encodeURIComponent(finalMessage);
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`, '_blank');
      }, 1000);
    }).catch(err => {
      // Fallback if clipboard API fails
      const encodedText = encodeURIComponent(finalMessage);
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`, '_blank');
    });
  });

  function showToast() {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }


  // --- Dynamic Confetti Engine ---
  const confettiCanvas = document.getElementById('confetti-canvas');
  const confCtx = confettiCanvas.getContext('2d');
  let confettiParticles = [];
  let confettiActive = false;

  function resizeConfettiCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeConfettiCanvas);
  resizeConfettiCanvas();

  class ConfettiParticle {
    constructor() {
      this.x = Math.random() * confettiCanvas.width;
      this.y = -10 - Math.random() * 100;
      this.size = Math.random() * 8 + 4;
      this.color = `hsl(${Math.random() * 360}, 90%, 65%)`;
      this.speedY = Math.random() * 4 + 3;
      this.speedX = Math.random() * 2 - 1;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 4 - 2;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.rotation += this.rotationSpeed;

      // Wrap-around horizontal
      if (this.x < -10) this.x = confettiCanvas.width + 10;
      if (this.x > confettiCanvas.width + 10) this.x = -10;
    }

    draw() {
      confCtx.save();
      confCtx.translate(this.x, this.y);
      confCtx.rotate(this.rotation * Math.PI / 180);
      confCtx.fillStyle = this.color;
      confCtx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      confCtx.restore();
    }
  }

  function startConfetti() {
    confettiActive = true;
    confettiParticles = [];
    for (let i = 0; i < 150; i++) {
      confettiParticles.push(new ConfettiParticle());
    }
    animateConfetti();
  }

  function animateConfetti() {
    if (!confettiActive) return;
    confCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    
    let activeParticlesCount = 0;
    confettiParticles.forEach(p => {
      p.update();
      p.draw();
      if (p.y < confettiCanvas.height + 20) {
        activeParticlesCount++;
      }
    });

    if (activeParticlesCount > 0) {
      requestAnimationFrame(animateConfetti);
    } else {
      confettiActive = false;
    }
  }
});

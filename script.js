const states = { START: 0, SECOND_TEXT: 1, CARDS: 2, PARTICLES: 3, END: 4, FINAL_CONFESSION: 5 };
let currentState = states.START;
let typingFinished = false;

const messages = [
    "Привет. Это сайт, потому что обычная валентинка — слишком слабо лоооооол",
    "Я ничего не жду, да и не прошу.\nПросто хочу уже сказать хоть часть того, что думаю >_<\nДа и, бе-бе-бу-бу, подарить тебе валентинку."
];

function typeText(elementId, text, speed = 40, callback) {
    let i = 0; const el = document.getElementById(elementId);
    el.innerHTML = ""; typingFinished = false;

    function step() {
        if (i < text.length) {
            let char = text.charAt(i);

            // Atomic HTML block handling
            // If we see an opening <span, we print the whole <span>...</span> block at once
            // to prevent the browser from auto-closing the tag prematurely.
            if (text.substr(i, 5) === '<span') {
                const closing = text.indexOf('</span>', i);
                if (closing !== -1) {
                    const fullSpan = text.substring(i, closing + 7);
                    el.innerHTML += fullSpan;
                    i = closing + 7;
                    setTimeout(step, speed);
                    return;
                }
            }

            // Standard tag handling (for <br>, etc.)
            if (char === '<') {
                const endTag = text.indexOf('>', i);
                if (endTag !== -1) {
                    char = text.substring(i, endTag + 1);
                    i = endTag + 1;
                } else {
                    i++;
                }
            } else {
                i++;
            }

            el.innerHTML += char;
            setTimeout(step, speed);
        } else {
            typingFinished = true;
            if (callback) callback();
        }
    }
    step();
}

function triggerFinalSequences() {
    const screen = document.getElementById('final-message-screen');
    screen.classList.remove('hidden'); screen.style.color = '#0071e3';

    typeText('last-words', "Ладно хватит балбесить", 60, () => {
        setTimeout(() => {
            document.body.classList.add('dark-mode');
            screen.style.color = '#fff';
            // Removed extra \n to make text wider, kept only paragraphs
            typeText('last-words', "Так что пора уже раздать басса!!\n\n<span class='pastel-accent'>Варь</span>, ты мне очень нрав. Не хочу заваливать тебя какими-то громкими словами. Просто знай, что ты — именно тот человек, с которым мне хочется делиться всем на свете. Я просто очень рад, что ты есть в моей жизни", 55, () => {
                currentState = states.FINAL_CONFESSION;
                document.getElementById('confession-hint').classList.add('visible');
            });
        }, 1500);
    });
}

function popCard() {
    const stack = document.getElementById('cards-stack');
    const cards = stack.querySelectorAll('.card');
    if (cards.length === 0) return;
    const topCard = cards[0];
    topCard.style.transform = `translateX(${cards.length % 2 === 0 ? 150 : -150}%) rotate(25deg)`;
    topCard.style.opacity = '0';
    setTimeout(() => {
        topCard.remove();
        if (stack.querySelectorAll('.card').length === 0) {
            // Text is already visible behind cards
            setTimeout(startParticleFinal, 1500); // Wait a bit before particles
        }
    }, 500);
}

let canvas, ctx, particles = [], isAssembled = false, animationId;

function startParticleFinal() {
    currentState = states.PARTICLES;
    document.getElementById('main-container').style.display = 'none';
    canvas = document.getElementById('particle-canvas');
    ctx = canvas.getContext('2d');
    canvas.style.display = 'block';

    // Show particle hint
    document.getElementById('particle-hint').classList.add('visible');

    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    for (let i = 0; i < 120; i++) particles.push(new Particle());
    animate();
}

class Particle {
    constructor() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.vx = (Math.random() - 0.5) * 2; this.vy = (Math.random() - 0.5) * 2;
        this.radius = 1.5;
    }
    update() {
        if (isAssembled) {
            this.x += (window.innerWidth / 2 - this.x) * 0.12;
            this.y += (window.innerHeight / 2 - this.y) * 0.12;
            this.radius *= 0.92;
        } else {
            this.x += this.vx; this.y += this.vy;
            if (this.x < 0 || this.x > window.innerWidth) this.vx *= -1;
            if (this.y < 0 || this.y > window.innerHeight) this.vy *= -1;
        }
    }
    draw() {
        ctx.fillStyle = '#0071e3'; ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill();
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    if (isAssembled && particles[0].radius < 0.1) {
        cancelAnimationFrame(animationId);
        canvas.remove(); return;
    }
    animationId = requestAnimationFrame(animate);
}

function triggerFinalSequences() {
    const screen = document.getElementById('final-message-screen');
    screen.classList.remove('hidden'); screen.style.color = '#0071e3';

    typeText('last-words', "Ладно хватит балбесить", 60, () => {
        setTimeout(() => {
            document.body.classList.add('dark-mode');
            screen.style.color = '#fff';
            typeText('last-words', "Так что пора уже раздать басса!!\n\n<span class='pastel-accent'>Варь</span>, ты мне очень нрав.\n\nНе хочу заваливать тебя\nкакими-то громкими словами.\n\nПросто знай, что ты —\nименно тот человек,\nс которым мне хочется\nделиться всем на свете.\n\nЯ просто очень рад,\nчто ты есть в моей жизни", 55, () => {
                currentState = states.FINAL_CONFESSION;
                document.getElementById('confession-hint').classList.add('visible');
            });
        }, 1500);
    });
}

document.body.addEventListener('click', () => {
    if (currentState === states.PARTICLES && !isAssembled) {
        document.getElementById('particle-hint').classList.remove('visible'); // Hide hint
        isAssembled = true; triggerFinalSequences(); return;
    }

    if (currentState === states.START && typingFinished) {
        document.getElementById('first-text-section').classList.add('hidden');
        const next = document.getElementById('second-text-section');
        next.classList.remove('hidden');
        // Force display flex via inline style just in case of conflicts (optional but safer)
        next.style.display = 'flex';

        currentState = states.SECOND_TEXT;
        typeText('text-2', messages[1], 40, () => document.getElementById('hint-2').classList.add('visible'));
    }
    else if (currentState === states.SECOND_TEXT && typingFinished) {
        document.getElementById('second-text-section').classList.add('hidden');
        const next = document.getElementById('cards-section');
        next.classList.remove('hidden');
        // Force display flex via inline style
        next.style.display = 'flex';

        currentState = states.CARDS;

        // Trigger spin animation manually to ensure it runs on appearance
        const glowText = document.querySelector('.glow-text');
        if (glowText) {
            glowText.classList.remove('glow-text'); // Remove to restart or just add wrapper
            void glowText.offsetWidth; // Trigger reflow
            glowText.classList.add('glow-text');
            glowText.classList.add('do-spin');
        }

        document.querySelectorAll('.card').forEach((c, i, a) => {
            c.style.zIndex = a.length - i;
            c.style.transform = `translateY(${i * -8}px) scale(${1 - i * 0.04})`;
        });
    }
    else if (currentState === states.CARDS) popCard();
    else if (currentState === states.FINAL_CONFESSION && typingFinished) {
        document.getElementById('confession-hint').classList.remove('visible'); // Hide hint immediately
        currentState = states.END;
        document.body.classList.add('valentine-mode');

        // Clear previous elements without destroying ticket-area
        document.getElementById('last-words').style.display = 'none';

        const screen = document.getElementById('final-message-screen');

        // Create and prepend Valentine Container
        const valContainer = document.createElement('div');
        valContainer.className = 'valentine-container';
        valContainer.innerHTML = '<div class="valentine-title">Be my Valentine?</div>';

        // Insert before the ticket area or at the beginning
        screen.insertBefore(valContainer, screen.firstChild);

        // Add minimal floating hearts background
        createFloatingHearts();

        // Show Decision Area
        setTimeout(() => {
            const ticketArea = document.getElementById('ticket-area');
            ticketArea.classList.remove('hidden');
            ticketArea.style.opacity = '0';
            ticketArea.style.animation = 'fadeIn 1s forwards';

            const buttonsWrapper = ticketArea.querySelector('.buttons-wrapper');

            // ACCEPT
            document.getElementById('accept-btn').addEventListener('click', function () {
                buttonsWrapper.style.transition = 'opacity 0.5s';
                buttonsWrapper.style.opacity = '0';

                setTimeout(() => {
                    buttonsWrapper.style.display = 'none';
                    document.getElementById('date-ticket').classList.remove('hidden');

                    // Show screenshot hint with animation
                    const hint = document.getElementById('screenshot-hint');
                    hint.classList.remove('hidden');
                    // Force reflow
                    void hint.offsetWidth;
                    hint.style.animation = 'fadeInUp 1s forwards 0.5s';

                }, 500);
            });

            // DECLINE
            document.getElementById('decline-btn').addEventListener('click', function () {
                buttonsWrapper.style.transition = 'opacity 0.5s';
                buttonsWrapper.style.opacity = '0';

                setTimeout(() => {
                    buttonsWrapper.style.display = 'none';
                    document.getElementById('unluck-message').classList.remove('hidden');
                }, 500);
            });

        }, 2000);
    }
});

function createFloatingHearts() {
    const container = document.createElement('div');
    container.className = 'floating-hearts-bg';
    document.body.appendChild(container);

    for (let i = 0; i < 15; i++) {
        const heart = document.createElement('div');
        heart.className = 'bg-heart';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.animationDuration = (Math.random() * 10 + 10) + 's';
        heart.style.animationDelay = (Math.random() * 5) + 's';
        container.appendChild(heart);
    }
}

window.onload = () => {
    const splashScreen = document.getElementById('splash-screen');
    const loadingBar = document.querySelector('.loading-bar');
    const videos = document.querySelectorAll('video');
    let loadedCount = 0;
    const totalVideos = videos.length;

    // Minimum time to show splash (so it doesn't flash too fast)
    const minSplashTime = 1500;
    const startTime = Date.now();

    function updateProgress() {
        loadedCount++;
        const percent = Math.round((loadedCount / totalVideos) * 100);
        if (loadingBar) loadingBar.style.width = `${percent}%`;

        if (loadedCount >= totalVideos) {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minSplashTime - elapsedTime);

            setTimeout(() => {
                splashScreen.classList.add('hidden');
                // Start original flow after splash is gone
                setTimeout(() => {
                    typeText('text-1', messages[0], 40, () => document.getElementById('hint-1').classList.add('visible'));
                }, 800);
            }, remainingTime);
        }
    }

    if (totalVideos === 0) {
        updateProgress(); // No videos, just finish
    } else {
        videos.forEach(video => {
            // Force preload
            video.preload = "auto";

            if (video.readyState >= 4) { // HAVE_ENOUGH_DATA
                updateProgress();
            } else {
                video.addEventListener('canplaythrough', updateProgress, { once: true });
                video.addEventListener('error', updateProgress, { once: true }); // Count errors as loaded to avoid hang
                video.load(); // Trigger loading
            }
        });
    }

    // Safety fallback: force verify after 7 seconds in case of stuck events
    setTimeout(() => {
        if (loadedCount < totalVideos) {
            console.warn("Loading timeout - forcing start");
            splashScreen.classList.add('hidden');
            setTimeout(() => {
                typeText('text-1', messages[0], 40, () => document.getElementById('hint-1').classList.add('visible'));
            }, 800);
        }
    }, 7000);
};
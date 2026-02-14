const states = { START: 0, SECOND_TEXT: 1, CARDS: 2, PARTICLES: 3, END: 4, FINAL_CONFESSION: 5 };
let currentState = states.START;
let typingFinished = false;

const messages = [
    "Привет. Это сайт, потому что обычная валентинка — слишком слабо лоооооол🤙",
    "Я ничего не жду, да и не прошу.\nПросто хочу уже сказать хоть часть того, что думаю >_<\nДа и, бе-бе-бу-бу, подарить тебе валентинку."
];

function typeText(elementId, text, speed = 40, callback, append = false) {
    let i = 0; const el = document.getElementById(elementId);
    if (!append) el.innerHTML = "";
    typingFinished = false;

    function step() {
        if (i < text.length) {
            let char = text.charAt(i);

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

function deleteLastChars(elementId, count, speed = 50, callback) {
    const el = document.getElementById(elementId);
    let current = 0;
    function step() {
        if (current < count) {
            let fullText = el.innerHTML;
            el.innerHTML = fullText.slice(0, -1);
            current++;
            setTimeout(step, speed);
        } else {
            if (callback) callback();
        }
    }
    step();
}

function triggerFinalSequences() {
    const screen = document.getElementById('final-message-screen');
    screen.classList.remove('hidden');
    screen.style.color = '#0071e3';

    // Initial cheeky message
    typeText('last-words', "Ладно хватит балбесить!!!", 60, () => {
        setTimeout(() => {
            document.body.classList.add('dark-mode');
            screen.style.color = '#fff';

            // Part 1: Initial text up to the "mistake"
            const part1 = "Так что пора уже раздать басса!!\n\n<span class='pastel-accent'>Варь</span>, ты мне всё так же нрав";

            // Part 2: The correction
            const partCorrection = "ооооочень нрав";

            // Part 3: The rest of the message
            const part3 = " и тд 👉👈\n\nНе хочу заваливать тебя какими-то громкими словами. Просто знай, что ты — именно тот человек, с которым мне хочется делиться всем на свете.\n\nЯ просто очень рад, что ты есть в моей жизни";

            typeText('last-words', part1, 55, () => {
                setTimeout(() => {
                    // Delete "нрав" (4 chars) to simulate correction
                    // Speed is slightly reduced for dramatic effect
                    deleteLastChars('last-words', 4, 100, () => {
                        // Type the corrected emphasized phrase
                        typeText('last-words', partCorrection, 55, () => {
                            // Type the rest
                            typeText('last-words', part3, 55, () => {
                                currentState = states.FINAL_CONFESSION;
                                document.getElementById('confession-hint').classList.add('visible');
                            }, true); // append=true
                        }, true); // append=true
                    });
                }, 600); // Small pause before correction
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
            setTimeout(startParticleFinal, 1500);
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

document.body.addEventListener('click', () => {
    if (currentState === states.PARTICLES && !isAssembled) {
        document.getElementById('particle-hint').classList.remove('visible');
        isAssembled = true;
        triggerFinalSequences();
        return;
    }

    if (currentState === states.START && typingFinished) {
        document.getElementById('first-text-section').classList.add('hidden');
        const next = document.getElementById('second-text-section');
        next.classList.remove('hidden');
        next.style.display = 'flex';
        currentState = states.SECOND_TEXT;
        typeText('text-2', messages[1], 40, () => document.getElementById('hint-2').classList.add('visible'));
    }
    else if (currentState === states.SECOND_TEXT && typingFinished) {
        document.getElementById('second-text-section').classList.add('hidden');
        const next = document.getElementById('cards-section');
        next.classList.remove('hidden');
        next.style.display = 'flex';
        currentState = states.CARDS;

        const glowText = document.querySelector('.glow-text');
        if (glowText) {
            glowText.classList.remove('glow-text');
            void glowText.offsetWidth;
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
        document.getElementById('confession-hint').classList.remove('visible');
        currentState = states.END;
        document.body.classList.add('valentine-mode');
        document.getElementById('last-words').style.display = 'none';

        const screen = document.getElementById('final-message-screen');
        const valContainer = document.createElement('div');
        valContainer.className = 'valentine-container';
        valContainer.innerHTML = '<div class="valentine-title">Be my Valentine?</div>';
        screen.insertBefore(valContainer, screen.firstChild);

        createFloatingHearts();

        setTimeout(() => {
            const ticketArea = document.getElementById('ticket-area');
            ticketArea.classList.remove('hidden');
            ticketArea.style.opacity = '0';
            ticketArea.style.animation = 'fadeIn 1s forwards';

            const buttonsWrapper = ticketArea.querySelector('.buttons-wrapper');

            document.getElementById('accept-btn').addEventListener('click', function () {
                buttonsWrapper.style.transition = 'opacity 0.5s';
                buttonsWrapper.style.opacity = '0';
                setTimeout(() => {
                    buttonsWrapper.style.display = 'none';
                    document.getElementById('date-ticket').classList.remove('hidden');
                    const hint = document.getElementById('screenshot-hint');
                    hint.classList.remove('hidden');
                    void hint.offsetWidth;
                    hint.style.animation = 'fadeInUp 1s forwards 0.5s';
                }, 500);
            });

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
                setTimeout(() => {
                    typeText('text-1', messages[0], 40, () => document.getElementById('hint-1').classList.add('visible'));
                }, 800);
            }, remainingTime);
        }
    }

    if (totalVideos === 0) {
        updateProgress();
    } else {
        videos.forEach(video => {
            video.preload = "auto";
            if (video.readyState >= 4) {
                updateProgress();
            } else {
                video.addEventListener('canplaythrough', updateProgress, { once: true });
                video.addEventListener('error', updateProgress, { once: true });
                video.load();
            }
        });
    }

    setTimeout(() => {
        if (loadedCount < totalVideos) {
            splashScreen.classList.add('hidden');
            setTimeout(() => {
                typeText('text-1', messages[0], 40, () => document.getElementById('hint-1').classList.add('visible'));
            }, 800);
        }
    }, 7000);
};



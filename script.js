// script.js

console.log("Skrip permainan dimuatkan!");

// --- Pemboleh Ubah Global ---
let currentScore = 0;
let timeLeft = 0;
let redErrors = 0;
let maxErrors = 7; // Lalai untuk Asas, akan diset oleh startTimer
let gameTimer;
let playerName = '';

let isPaused = false;
let pausedTimeLeft = 0;

const meaningPenalty = 10;

let kamusLengkap = [];
let shuffledKamus = [];
let currentWordObject = null;
let wordIndex = 0; // Untuk menjejaki perkataan semasa dalam sesi

// Pemboleh ubah ini dikekalkan untuk keserasian, nilainya akan diambil dari currentWordObject
let currentWord = '';
let missingSyllable = '';
let currentInput = '';

// --- Elemen UI (Dapatkan dari HTML) ---
const landingPage = document.getElementById('landing-page');
const registrationPage = document.getElementById('registration-page');
const levelSelectionPage = document.getElementById('level-selection-page');
const gamePlayPage = document.getElementById('game-play-page');
const gameOverPage = document.getElementById('game-over-page');
const leaderboardPage = document.getElementById('leaderboard-page');

const startGameBtn = document.getElementById('start-game-btn');
const registerPlayerBtn = document.getElementById('register-player-btn');
const startLevelBtn = document.getElementById('start-level-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const viewLeaderboardBtn = document.getElementById('view-leaderboard-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');

const playerNameInput = document.getElementById('playerName');
const playerEmailInput = document.getElementById('playerEmail');

const difficultySlider = document.getElementById('difficulty');
const difficultyLevelName = document.getElementById('difficulty-level-name');

const scoreDisplay = document.getElementById('current-score');
const timerDisplay = document.getElementById('time-left');
const errorsDisplay = document.getElementById('red-errors');
const maxErrorsDisplay = document.getElementById('max-errors');
const wordPartFixed = document.getElementById('word-part-fixed');
const missingSyllableInputSpan = document.getElementById('missing-syllable-input');
const letterInput = document.getElementById('letter-input');
const feedbackDisplay = document.getElementById('feedback-display');
const gameMessageDisplay = document.getElementById('game-message');
const skirtVisual = document.getElementById('skirt-visual');

const pauseGameBtn = document.getElementById('pause-game-btn');
const continueGameBtn = document.getElementById('continue-game-btn');
const showMeaningBtn = document.getElementById('show-meaning-btn');
const meaningDisplay = document.getElementById('meaning-display');
const wordMeaningText = document.getElementById('word-meaning-text');

const finalScoreDisplay = document.getElementById('final-score');
const leaderboardList = document.getElementById('leaderboard-list');


// --- Fungsi Navigasi Antara Halaman ---
function showPage(pageToShow) {
    // Sembunyikan semua halaman
    const pages = [landingPage, registrationPage, levelSelectionPage, gamePlayPage, gameOverPage, leaderboardPage];
    pages.forEach(page => {
        if (page) page.style.display = 'none';
    });

    // Tunjukkan halaman yang diminta
    if (pageToShow) {
        pageToShow.style.display = 'block';

        // Fokuskan input yang sesuai
        if (pageToShow === registrationPage && playerNameInput) {
            setTimeout(() => playerNameInput.focus(), 50);
        } else if (pageToShow === gamePlayPage && letterInput) {
            // Fokus untuk letterInput kini diuruskan dalam startNewWord()
            // dan continueGame() untuk memastikan ia berlaku pada masa yang tepat.
            // Baris di bawah ini boleh dibuang jika fokus sentiasa diuruskan di sana.
            // setTimeout(() => letterInput.focus(), 100); 
            isPaused = false; // Pastikan status tidak dijeda semasa halaman game play aktif
            if(pauseGameBtn) pauseGameBtn.style.display = 'inline-block';
            if(continueGameBtn) continueGameBtn.style.display = 'none';
        } else if (pageToShow === gameOverPage && playAgainBtn) {
            setTimeout(() => playAgainBtn.focus(), 50);
        } else if (pageToShow === leaderboardPage && backToMenuBtn) {
             setTimeout(() => backToMenuBtn.focus(), 50);
        }
    } else {
        console.error("showPage dipanggil dengan pageToShow yang tidak sah atau null.");
    }

    // Hentikan pemasa jika keluar dari halaman permainan
    if (gameTimer && pageToShow !== gamePlayPage) {
        stopTimer();
    }
}

// --- Logik Permainan ---

async function muatKamusData() {
    try {
        const response = await fetch('kamusData.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        kamusLengkap = await response.json();
        if (!Array.isArray(kamusLengkap) || kamusLengkap.length === 0) {
            console.error("Fail kamusData.json kosong, bukan array, atau format tidak betul.");
            if(gameMessageDisplay) {
                gameMessageDisplay.textContent = "Ralat Kritikal: Data perkataan tidak dapat diproses!";
                gameMessageDisplay.style.display = 'block';
                gameMessageDisplay.style.color = 'red';
            }
            return false;
        }
        console.log(`${kamusLengkap.length} perkataan berjaya dimuatkan dari kamusData.json`);
        return true;
    } catch (error) {
        console.error("Gagal memuatkan kamusData.json:", error);
        if(gameMessageDisplay) {
            gameMessageDisplay.textContent = "Ralat: Gagal memuatkan data perkataan! Sila pastikan fail kamusData.json wujud dan formatnya betul.";
            gameMessageDisplay.style.display = 'block';
            gameMessageDisplay.style.color = 'red';
        }
        return false;
    }
}

function loadAndShuffleWordList() {
    if (kamusLengkap.length === 0) {
        console.error("Senarai perkataan (kamusLengkap) kosong! Tidak dapat memulakan permainan.");
        if(gameMessageDisplay && gameMessageDisplay.style.display === 'none') {
             gameMessageDisplay.textContent = "Ralat: Senarai perkataan tidak tersedia.";
             gameMessageDisplay.style.display = 'block';
             gameMessageDisplay.style.color = 'red';
        }
        return false;
    }
    shuffledKamus = [...kamusLengkap];
    shuffleArray(shuffledKamus);
    console.log(`Berjaya menggaul ${shuffledKamus.length} perkataan dari kamus.`);
    // wordIndex direset dalam startLevelBtn
    return true;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startNewWord() {
    // Hentikan jika sudah 20 perkataan atau senarai habis
    if (wordIndex >= 20 || wordIndex >= shuffledKamus.length) {
        console.log(`Permainan tamat. Perkataan telah dimainkan/dimulakan: ${wordIndex}`);
        endGame();
        return;
    }

    // Reset UI untuk perkataan baru
    if(gameMessageDisplay) gameMessageDisplay.style.display = 'none';
    if(skirtVisual) skirtVisual.style.display = 'none';
    if(feedbackDisplay) {
        feedbackDisplay.textContent = '';
        feedbackDisplay.className = '';
    }
    if (meaningDisplay) meaningDisplay.style.display = 'none';
    if (missingSyllableInputSpan) {
        missingSyllableInputSpan.textContent = '';
        missingSyllableInputSpan.classList.remove('lost-word-answer');
    }

    currentWordObject = shuffledKamus[wordIndex];

    if (!currentWordObject || !currentWordObject.perkataan || typeof currentWordObject.sukuKataAkhir === 'undefined') {
        console.error("Data perkataan tidak lengkap dari JSON:", currentWordObject, "untuk indeks:", wordIndex);
        wordIndex++; // Langkau perkataan yang bermasalah
        startNewWord(); // Cuba perkataan seterusnya
        return;
    }

    currentWord = currentWordObject.perkataan.toUpperCase();
    missingSyllable = currentWordObject.sukuKataAkhir.toUpperCase();

    if (missingSyllable.length === 0 || missingSyllable.length >= currentWord.length) {
        console.warn(`[StartNewWord] Data sukuKataAkhir tidak sah untuk perkataan: "${currentWord}" dari JSON. Suku kata: "${missingSyllable}". Melangkau.`);
        wordIndex++; // Langkau
        startNewWord();
        return;
    }

    const fixedPart = currentWord.substring(0, currentWord.length - missingSyllable.length);

    if(wordPartFixed) wordPartFixed.textContent = fixedPart;
    if(missingSyllableInputSpan) {
        let displayMissing = '_'.repeat(missingSyllable.length);
        missingSyllableInputSpan.textContent = displayMissing;
    }
    
    currentInput = '';
    redErrors = 0; // Reset kesalahan untuk perkataan baru
    if(errorsDisplay) errorsDisplay.textContent = redErrors;

    if(letterInput) {
        letterInput.value = '';
        letterInput.disabled = false;
        // --- PEMBETULAN FOKUS KURSOR ---
        setTimeout(() => {
            if (letterInput && typeof letterInput.focus === 'function') {
                letterInput.focus();
            }
        }, 50); // Jeda kecil untuk pastikan elemen sedia
        // --- AKHIR PEMBETULAN FOKUS ---
    }

    isPaused = false;
    if(pauseGameBtn) pauseGameBtn.style.display = 'inline-block';
    if(continueGameBtn) continueGameBtn.style.display = 'none';
    if(showMeaningBtn) showMeaningBtn.disabled = false;

    startTimer(); // Mulakan pemasa (juga set timeLeft dan maxErrors)

    console.log(`--- Perkataan Baru Dimulakan (${wordIndex + 1}/20) ---`);
    console.log(`Objek Perkataan:`, currentWordObject);

    wordIndex++; // Sedia untuk perkataan seterusnya
}

function startTimer() {
    if (gameTimer) {
        clearInterval(gameTimer);
    }

    if (!isPaused) {
        const selectedDifficulty = difficultySlider ? parseInt(difficultySlider.value) : 1;
        let timeLimitDefault = 30;
        let errorLimitDefault = 7;

        switch (selectedDifficulty) {
            case 1: timeLimitDefault = 30; errorLimitDefault = 7; break;
            case 2: timeLimitDefault = 20; errorLimitDefault = 5; break;
            case 3: timeLimitDefault = 15; errorLimitDefault = 3; break;
        }
        timeLeft = timeLimitDefault;
        maxErrors = errorLimitDefault;
    } else {
        timeLeft = pausedTimeLeft;
    }

    if(timerDisplay) timerDisplay.textContent = timeLeft;
    if(maxErrorsDisplay) maxErrorsDisplay.textContent = maxErrors;
    if(timerDisplay) timerDisplay.classList.remove('warning');


    gameTimer = setInterval(() => {
        timeLeft--;
        if(timerDisplay) timerDisplay.textContent = timeLeft;
        
        if (timeLeft <= 5 && timeLeft > 0) {
            if(timerDisplay) timerDisplay.classList.add('warning');
            // playSound('timer_tick_warning'); 
        } else {
            if(timerDisplay) timerDisplay.classList.remove('warning');
        }

        if (timeLeft <= 0) {
            clearInterval(gameTimer);
            handleWordLoss("Masa tamat!");
            // playSound('timeup');
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(gameTimer);
    if(timerDisplay) timerDisplay.classList.remove('warning');
}

function pauseGame() {
    if (!isPaused && gamePlayPage.style.display === 'block') { // Hanya jeda jika dalam mod permainan
        isPaused = true;
        pausedTimeLeft = timeLeft;
        stopTimer();
        if(pauseGameBtn) pauseGameBtn.style.display = 'none';
        if(continueGameBtn) continueGameBtn.style.display = 'inline-block';
        if(letterInput) letterInput.disabled = true;
        if(showMeaningBtn) showMeaningBtn.disabled = true;

        if(gameMessageDisplay) {
            gameMessageDisplay.textContent = "Permainan Dijeda";
            gameMessageDisplay.style.display = 'block';
            gameMessageDisplay.style.color = 'blue';
        }
        // playSound('pause');
    }
}

function continueGame() {
    if (isPaused) {
        isPaused = false;
        startTimer(); // Akan guna pausedTimeLeft
        if(pauseGameBtn) pauseGameBtn.style.display = 'inline-block';
        if(continueGameBtn) continueGameBtn.style.display = 'none';
        if(letterInput) {
            letterInput.disabled = false;
            setTimeout(() => letterInput.focus(), 50); // Fokus semula selepas jeda
        }
        if(showMeaningBtn) showMeaningBtn.disabled = false;

        if(gameMessageDisplay) gameMessageDisplay.style.display = 'none';
        // playSound('continue');
    }
}

function handleLetterInput(event) {
    if (isPaused || !letterInput || letterInput.disabled) {
        if (event && event.target) event.target.value = '';
        return;
    }

    const inputLetter = (event.target.value || '').toUpperCase();
    if (event && event.target) event.target.value = '';

    if (inputLetter.length === 0 || !missingSyllable) return;

    const letter = inputLetter[0];
    const nextPos = currentInput.length;

    if (nextPos < missingSyllable.length) {
        const correctLetterAtIndex = missingSyllable[nextPos];

        if (letter === correctLetterAtIndex) {
            currentInput += letter;
            if (missingSyllableInputSpan) {
                let displayArray = missingSyllableInputSpan.textContent.split('');
                if (displayArray.length > nextPos) displayArray[nextPos] = letter;
                else if (displayArray.length === nextPos) displayArray.push(letter); // Jika _ _ _ lebih pendek
                missingSyllableInputSpan.textContent = displayArray.join('');
            }
            if(feedbackDisplay) {
                feedbackDisplay.textContent = '✅ Betul Huruf!';
                feedbackDisplay.className = 'feedback-green';
            }
            // playSound('correct_letter');

            if (currentInput.length === missingSyllable.length) {
                letterInput.disabled = true;
                stopTimer();
                setTimeout(handleWordSuccess, 500);
            }
        } else if (missingSyllable.includes(letter)) {
            if(feedbackDisplay) {
                feedbackDisplay.textContent = '🔶 Huruf Ada, Kedudukan Salah!';
                feedbackDisplay.className = 'feedback-yellow';
            }
            // playSound('wrong_position_letter');
        } else {
            redErrors++;
            if(errorsDisplay) errorsDisplay.textContent = redErrors;
            if(feedbackDisplay) {
                feedbackDisplay.textContent = '❌ Salah Huruf!';
                feedbackDisplay.className = 'feedback-red';
            }
            // playSound('wrong_letter');

            if (redErrors >= maxErrors) {
                letterInput.disabled = true;
                stopTimer();
                setTimeout(() => handleWordLoss("Had kesalahan Merah dicapai!"), 500);
            }
        }
    } else {
        if(letterInput) letterInput.disabled = true; // Sudah lengkap
    }
}

function handleWordSuccess() {
    stopTimer();
    if(letterInput) letterInput.disabled = true;

    const selectedDifficulty = difficultySlider ? parseInt(difficultySlider.value) : 1;
    let baseScore = (selectedDifficulty === 1) ? 100 : (selectedDifficulty === 2) ? 200 : 300;
    const timeBonus = Math.max(0, timeLeft);
    const wordScore = baseScore + timeBonus;

    currentScore += wordScore;
    if(scoreDisplay) scoreDisplay.textContent = currentScore;

    if(gameMessageDisplay) {
        gameMessageDisplay.textContent = `✅ Betul! +${wordScore} mata!`;
        gameMessageDisplay.style.display = 'block';
        gameMessageDisplay.style.color = 'green';
    }
    if(feedbackDisplay) {
        feedbackDisplay.textContent = '';
        feedbackDisplay.className = '';
    }
    playSound('triangle'); // atau 'wordSuccess'

    setTimeout(() => {
        startNewWord();
    }, 1500);
}

function handleWordLoss(reason) {
    stopTimer();
    if(letterInput) letterInput.disabled = true;
    if(showMeaningBtn) showMeaningBtn.disabled = true;

    if(gameMessageDisplay) {
        gameMessageDisplay.textContent = `❌ Anda kalah! (${reason})`;
        gameMessageDisplay.style.display = 'block';
        gameMessageDisplay.style.color = 'red';
    }
    if(feedbackDisplay) {
        feedbackDisplay.textContent = '';
        feedbackDisplay.className = '';
    }

    if (missingSyllableInputSpan && missingSyllable) {
        missingSyllableInputSpan.textContent = missingSyllable.toUpperCase();
        missingSyllableInputSpan.classList.add('lost-word-answer');
    } else {
        console.error("missingSyllableInputSpan atau missingSyllable tidak tersedia untuk paparan jawapan kalah.");
    }

    if(skirtVisual) skirtVisual.style.display = 'block';
    // playSound('gameFail');

    setTimeout(() => {
        if(skirtVisual) skirtVisual.style.display = 'none';
        startNewWord(); // Teruskan ke perkataan seterusnya atau tamat jika sudah 20
    }, 2500);
}

function endGame() {
    stopTimer();
    if(letterInput) letterInput.disabled = true;
    if(showMeaningBtn) showMeaningBtn.disabled = true;
    if(pauseGameBtn) pauseGameBtn.style.display = 'none';
    if(continueGameBtn) continueGameBtn.style.display = 'none';

    if(gameMessageDisplay) gameMessageDisplay.style.display = 'none';
    if(feedbackDisplay) {
        feedbackDisplay.textContent = '';
        feedbackDisplay.className = '';
    }
    if(skirtVisual) skirtVisual.style.display = 'none';

    console.log("Sesi permainan tamat. Markah Akhir:", currentScore);
    if(finalScoreDisplay) finalScoreDisplay.textContent = currentScore;

    const currentPlayerNameToSave = localStorage.getItem('currentPlayerName') || playerName || 'Pemain Tidak Dikenali';
    saveScoreToLeaderboard(currentPlayerNameToSave, currentScore);
    loadLeaderboard(); // Kemaskini papan markah sebelum mungkin dipaparkan

    showPage(gameOverPage);

    // Reset pemboleh ubah utama untuk sesi baru yang mungkin
    // wordIndex dan lain-lain akan direset apabila 'Mula Permainan' ditekan semula
}

function loadLeaderboard() {
    let leaderboard = JSON.parse(localStorage.getItem('gameLeaderboard')) || [];
    leaderboard.sort((a, b) => b.score - a.score);
    
    if(leaderboardList) {
        leaderboardList.innerHTML = '';
        const top10 = leaderboard.slice(0, 10);

        if (top10.length === 0) {
            leaderboardList.innerHTML = '<li>Tiada markah yang dicatatkan lagi.</li>';
        } else {
            top10.forEach((entry, index) => {
                const listItem = document.createElement('li');
                listItem.textContent = `${index + 1}. ${entry.name} - ${entry.score} mata`;
                leaderboardList.appendChild(listItem);
            });
        }
    }
    console.log("Papan Markah dimuatkan. Keseluruhan:", leaderboard);
}

function saveScoreToLeaderboard(name, score) {
    // Pertimbangkan untuk tidak simpan jika nama 'Pemain Tidak Dikenali' dan markah 0
    if (name === 'Pemain Tidak Dikenali' && score === 0) {
        console.log("Markah 0 untuk Pemain Tidak Dikenali, tidak disimpan.");
        return;
    }
    // Atau jika hanya mahu simpan markah positif
    // if (score <= 0) {
    //     console.log("Markah 0 atau kurang, tidak disimpan.");
    //     return;
    // }
    let leaderboard = JSON.parse(localStorage.getItem('gameLeaderboard')) || [];
    leaderboard.push({ name: name, score: score });
    localStorage.setItem('gameLeaderboard', JSON.stringify(leaderboard));
    console.log(`Markah ${score} untuk ${name} disimpan.`);
}

function playSound(soundName) {
    console.log(`Cuba mainkan bunyi: ${soundName}`);
    try {
        // Pastikan path ke folder 'sounds' betul dan fail wujud
        const audio = new Audio('sounds/' + soundName + '.mp3'); // atau .wav, .ogg
        audio.play()
            .catch(e => console.error(`Gagal mainkan bunyi: ${soundName}`, e));
    } catch (e) {
        console.error(`Ralat semasa mencipta objek Audio untuk ${soundName}:`, e);
    }
}

function handleShowMeaning() {
    if (meaningDisplay && meaningDisplay.style.display === 'block') {
        console.log("Makna sudah dipaparkan.");
        return;
    }

    if (!currentWordObject || !currentWordObject.perkataan) {
        console.warn("Tiada perkataan semasa untuk dipaparkan maknanya.");
        if(wordMeaningText) wordMeaningText.textContent = "Tiada perkataan aktif.";
        if(meaningDisplay) meaningDisplay.style.display = 'block';
        return;
    }

    const meaning = currentWordObject.makna;

    if (meaning) {
        if(wordMeaningText) wordMeaningText.textContent = meaning;
        if(meaningDisplay) meaningDisplay.style.display = 'block';
        currentScore = Math.max(0, currentScore - meaningPenalty);
        if(scoreDisplay) scoreDisplay.textContent = currentScore;
        console.log(`Markah ditolak ${meaningPenalty}. Markah semasa: ${currentScore}`);
        if(showMeaningBtn) showMeaningBtn.disabled = true;
        // playSound('showMeaningUsed');
    } else {
        if(wordMeaningText) wordMeaningText.textContent = "Makna tidak tersedia untuk perkataan ini.";
        if(meaningDisplay) meaningDisplay.style.display = 'block';
        console.warn(`Makna tidak ditemui untuk: ${currentWordObject.perkataan}`);
    }
}

// --- Permulaan Aplikasi & Pengendali Acara ---
window.addEventListener('load', () => {
    const storedPlayerName = localStorage.getItem('currentPlayerName');
    if (storedPlayerName) {
        playerName = storedPlayerName;
        if (playerNameInput) playerNameInput.value = storedPlayerName;
    }

    // Kemas kini nama tahap kesukaran pada mulanya
    if(difficultySlider && difficultyLevelName) {
        const initialDifficulty = parseInt(difficultySlider.value);
        let levelName = 'Asas', timeLimit = 30, errorLimit = 7;
        if (initialDifficulty === 2) { levelName = 'Sederhana'; timeLimit = 20; errorLimit = 5; }
        else if (initialDifficulty === 3) { levelName = 'Maju'; timeLimit = 15; errorLimit = 3; }
        difficultyLevelName.textContent = `${levelName} (${timeLimit}s, ${errorLimit} Merah)`;
    } else {
        console.warn("Elemen difficultySlider atau difficultyLevelName tidak ditemui.");
    }

    showPage(landingPage);
    loadLeaderboard(); // Muatkan papan markah semasa aplikasi mula
});

if(startGameBtn) {
    startGameBtn.addEventListener('click', () => {
        showPage(registrationPage);
    });
}

if(registerPlayerBtn) {
    registerPlayerBtn.addEventListener('click', () => {
        if(playerNameInput) {
            playerName = playerNameInput.value.trim();
            if (playerName === '') {
                alert("Sila masukkan nama anda!");
                playerNameInput.focus();
                return;
            }
            localStorage.setItem('currentPlayerName', playerName);
        } else {
            // Jika tiada input nama, guna nama lalai atau skip pendaftaran
            playerName = "Pemain"; 
            localStorage.setItem('currentPlayerName', playerName);
        }
        showPage(levelSelectionPage);
    });
}

if(difficultySlider) {
    difficultySlider.addEventListener('input', (event) => {
        const value = parseInt(event.target.value);
        let levelName = '', timeLimit = 0, errorLimit = 0;
        switch(value) {
            case 1: levelName = 'Asas'; timeLimit = 30; errorLimit = 7; break;
            case 2: levelName = 'Sederhana'; timeLimit = 20; errorLimit = 5; break;
            case 3: levelName = 'Maju'; timeLimit = 15; errorLimit = 3; break;
            default: levelName = 'Asas'; timeLimit = 30; errorLimit = 7;
        }
        if(difficultyLevelName) difficultyLevelName.textContent = `${levelName} (${timeLimit}s, ${errorLimit} Merah)`;
    });
}

if(startLevelBtn) {
    startLevelBtn.addEventListener('click', async () => {
        currentScore = 0;
        if(scoreDisplay) scoreDisplay.textContent = currentScore;
        redErrors = 0;
        if(errorsDisplay) errorsDisplay.textContent = redErrors;
        wordIndex = 0; // Reset wordIndex untuk setiap sesi baru

        const dataBerjayaDimuat = await muatKamusData();
        if (!dataBerjayaDimuat) {
            showPage(landingPage);
            alert("Gagal memuatkan data permainan. Sila semak konsol atau hubungi pentadbir.");
            return;
        }

        const senaraiBerjayaDigaul = loadAndShuffleWordList();
        if (!senaraiBerjayaDigaul) {
            return;
        }

        showPage(gamePlayPage);
        // Panggil startNewWord selepas halaman gamePlayPage dipaparkan sepenuhnya
        // Fokus akan diuruskan dalam startNewWord sekarang.
        setTimeout(() => {
             startNewWord();
        }, 100); // Jeda kecil mungkin membantu UI render sebelum logik perkataan pertama
    });
}

if(letterInput) {
    letterInput.addEventListener('input', handleLetterInput);
}

if (pauseGameBtn && continueGameBtn) {
    pauseGameBtn.addEventListener('click', pauseGame);
    continueGameBtn.addEventListener('click', continueGame);
} else {
    console.warn("Butang Jeda atau Teruskan tidak ditemui atau tidak dilampirkan.");
}

if (showMeaningBtn && meaningDisplay && wordMeaningText) {
    showMeaningBtn.addEventListener('click', handleShowMeaning);
} else {
    console.warn("Elemen untuk 'Paparkan Makna' tidak ditemui. Ciri tidak aktif.");
}

if(playAgainBtn) {
    playAgainBtn.addEventListener('click', () => {
        showPage(levelSelectionPage); // Kembali ke pemilihan tahap
    });
}

if(viewLeaderboardBtn) {
    viewLeaderboardBtn.addEventListener('click', () => {
        loadLeaderboard();
        showPage(leaderboardPage);
    });
}

if(backToMenuBtn) {
    backToMenuBtn.addEventListener('click', () => {
        showPage(landingPage);
    });
}

console.log("Semua pengendali acara utama telah cuba dilampirkan.");
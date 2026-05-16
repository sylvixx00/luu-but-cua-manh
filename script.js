document.addEventListener('DOMContentLoaded', () => {
    
    // --- CÁC BIẾN GIAO DIỆN ---
    const avatarModal = document.getElementById('avatar-modal');
    const openAvatarBtn = document.getElementById('open-avatar-btn');
    const closeAvatarBtn = document.getElementById('close-avatar-btn');
    const saveAvatarBtn = document.getElementById('save-avatar-btn');
    
    const currentAvatar = document.getElementById('current-avatar');
    const mainStickerLayer = document.getElementById('main-sticker-layer');
    
    const modalAvatarPreview = document.getElementById('modal-avatar-preview');
    const modalStickerLayer = document.getElementById('modal-sticker-layer');
    const clearStickersBtn = document.getElementById('clear-stickers-btn');
    
    const presetItems = document.querySelectorAll('.preset-item');
    const avatarUpload = document.getElementById('avatar-upload');
    const stickerItems = document.querySelectorAll('.sticker-item');

    // --- TỰ ĐỘNG TÍNH COUNTDOWN THPTQG 2026 ---
    function updateCountdown() {
        const daysNumEl = document.querySelector('.days-num');
        if (!daysNumEl) return;
        
        const examDate = new Date('2026-06-11T00:00:00');
        const now = new Date();
        const diffTime = examDate - now;
        
        if (diffTime > 0) {
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            daysNumEl.innerText = diffDays < 10 ? '0' + diffDays : diffDays;
        } else {
            daysNumEl.innerText = '00';
        }
    }
    updateCountdown();

    // --- ĐÓNG / MỞ POPUP ---
    if (openAvatarBtn && avatarModal) {
        openAvatarBtn.addEventListener('click', () => {
            modalAvatarPreview.src = currentAvatar.src;
            modalStickerLayer.innerHTML = mainStickerLayer.innerHTML;
            
            makeStickersDraggable();
            avatarModal.classList.add('active');
        });
    }

    if (closeAvatarBtn && avatarModal) {
        closeAvatarBtn.addEventListener('click', () => {
            avatarModal.classList.remove('active');
        });
    }

    // --- CHỌN ẢNH CÓ SẴN ---
    presetItems.forEach(item => {
        item.addEventListener('click', () => {
            presetItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            modalAvatarPreview.src = item.src;
        });
    });

    // --- TẢI ẢNH TỪ THIẾT BỊ ---
    if (avatarUpload) {
        avatarUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    modalAvatarPreview.src = event.target.result;
                    presetItems.forEach(i => i.classList.remove('active')); 
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // --- THÊM STICKER VÀO KHUNG CHỈNH SỬA ---
    stickerItems.forEach(item => {
        item.addEventListener('click', () => {
            const stickerContent = item.getAttribute('data-sticker');
            
            const newSticker = document.createElement('span');
            newSticker.className = 'placed-sticker';
            newSticker.innerText = stickerContent;
            
            newSticker.style.top = '50%';
            newSticker.style.left = '50%';
            
            modalStickerLayer.appendChild(newSticker);
            addDragEvents(newSticker);
        });
    });

    // --- HÀM KÍCH HOẠT KÉO THẢ CHO TẤT CẢ STICKER ĐANG CÓ ---
    function makeStickersDraggable() {
        const stickers = modalStickerLayer.querySelectorAll('.placed-sticker');
        wrapperStickers(stickers);
    }

    function wrapperStickers(stickers) {
        stickers.forEach(sticker => {
            addDragEvents(sticker);
        });
    }

    // --- LOGIC KÉO THẢ CHUỘT + TOUCH ---
    function addDragEvents(el) {
        let isDragging = false;
        let startX, startY;
        let startLeft, startTop;

        el.addEventListener('mousedown', dragStart);
        el.addEventListener('touchstart', dragStart, { passive: false });

        function dragStart(e) {
            isDragging = true;
            
            let clientX, clientY;
            if (e.type === 'touchstart') {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                e.preventDefault();
                clientX = e.clientX;
                clientY = e.clientY;
            }
            
            startX = clientX;
            startY = clientY;

            startLeft = parseFloat(el.style.left) || 50;
            startTop = parseFloat(el.style.top) || 50;

            document.addEventListener('mousemove', dragMove);
            document.addEventListener('touchmove', dragMove, { passive: false });
            document.addEventListener('mouseup', dragEnd);
            document.addEventListener('touchend', dragEnd);
        }

        function dragMove(e) {
            if (!isDragging) return;

            let clientX, clientY;
            if (e.type === 'touchmove') {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            const deltaX = clientX - startX;
            const deltaY = clientY - startY;

            const parent = el.parentElement;
            if (!parent) return;
            const rect = parent.getBoundingClientRect();

            let newLeft = startLeft + (deltaX / rect.width) * 100;
            let newTop = startTop + (deltaY / rect.height) * 100;

            if (newLeft < 0) newLeft = 0;
            if (newLeft > 100) newLeft = 100;
            if (newTop < 0) newTop = 0;
            if (newTop > 100) newTop = 100;

            el.style.left = `${newLeft}%`;
            el.style.top = `${newTop}%`;
        }

        function dragEnd() {
            isDragging = false;
            document.removeEventListener('mousemove', dragMove);
            document.removeEventListener('touchmove', dragMove);
            document.removeEventListener('mouseup', dragEnd);
            document.removeEventListener('touchend', dragEnd);
        }
    }

    // --- NÚT XÓA HẾT STICKER ---
    if (clearStickersBtn) {
        clearStickersBtn.addEventListener('click', () => {
            modalStickerLayer.innerHTML = '';
        });
    }

    // --- NÚT APPLY CHANGES (LƯU RA NGOÀI MÀN HÌNH CHÍNH) ---
    if (saveAvatarBtn) {
        saveAvatarBtn.addEventListener('click', () => {
            currentAvatar.src = modalAvatarPreview.src;
            mainStickerLayer.innerHTML = modalStickerLayer.innerHTML;
            avatarModal.classList.remove('active');
        });
    }

    // ========================================================
    // --- HỆ THỐNG MUSIC PLAYER THỰC TẾ (AUDIO REAL) ---
    // ========================================================
    const playlist = [
        {
            title: "Angel Falling",
            artist: "Needy Girl Overdose",
            src: "https://lambda.vgmtreasurechest.com/soundtracks/needy-girl-overdose-original-soundtrack-2022/odbxkesb/04.%20Angel%20Falling.mp3" 
        },
        {
            title: "Color Your Night",
            artist: "Persona 3 Reload",
            src: "https://dn721600.ca.archive.org/0/items/persona-3-reload-digital-original-sound-track/16%20Color%20Your%20Night.mp3"
        },
        {
            title: "Tập Đi",
            artist: "Truant Fu",
            src: "tap di.mp3"
        },
        {
            title: "No Surprises",
            artist: "Radiohead",
            src: "https://dn720605.ca.archive.org/0/items/02-paranoid-android_202512/10%20No%20Surprises.mp3"
        },
        {
            title: "I Don't Love You",
            artist: "My Chemical Romance",
            src: "https://dn720809.ca.archive.org/0/items/05-welcome-to-the-black-parade_20260306/06%20-%20I%20Don%27t%20Love%20You.mp3"
        },
        {
            title: "Buổi Hẹn Cuối Cùng",
            artist: "Nam Thế Giới",
            src: "buoihencuoicung.mp3"
        }
    ];

    let currentSongIndex = 0;
    const audio = document.getElementById('main-audio');
    const playBtn = document.getElementById('song-play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const songTitle = document.getElementById('song-title');
    const artistName = document.getElementById('artist-name');
    const albumCover = document.getElementById('album-cover');
    const progressFill = document.getElementById('progress-fill');
    const progressContainer = document.getElementById('progress-container');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');

    function setSong(index) {
        currentSongIndex = index;
        const song = playlist[currentSongIndex];
        if (audio && song) {
            audio.src = song.src;
            if (songTitle) songTitle.innerText = song.title;
            if (artistName) artistName.innerText = song.artist;
            if (progressFill) progressFill.style.width = '0%';
            if (currentTimeEl) currentTimeEl.innerText = "0:00";
        }
    }

    if (audio) {
        const randomStartIndex = Math.floor(Math.random() * playlist.length);
        setSong(randomStartIndex);
    }

    function togglePlay() {
        if (!audio || !playBtn || !albumCover) return;
        if (audio.paused) {
            audio.play();
            playBtn.innerText = "❚❚";
            albumCover.classList.add('spinning');
        } else {
            audio.pause();
            playBtn.innerText = "▶";
            albumCover.classList.remove('spinning');
        }
    }

    if (playBtn) playBtn.addEventListener('click', togglePlay);

    if (audio) {
        audio.addEventListener('timeupdate', () => {
            const { duration, currentTime } = audio;
            if (!duration) return;

            const progressPercent = (currentTime / duration) * 100;
            if (progressFill) progressFill.style.width = `${progressPercent}%`;

            let currentMin = Math.floor(currentTime / 60);
            let currentSec = Math.floor(currentTime % 60);
            if (currentSec < 10) currentSec = `0${currentSec}`;
            if (currentTimeEl) currentTimeEl.innerText = `${currentMin}:${currentSec}`;
        });

        audio.addEventListener('loadeddata', () => {
            let totalMin = Math.floor(audio.duration / 60);
            let totalSec = Math.floor(audio.duration % 60);
            if (totalSec < 10) totalSec = `0${totalSec}`;
            if (totalTimeEl) totalTimeEl.innerText = `${totalMin}:${totalSec}`;
        });

        audio.addEventListener('ended', () => {
            let nextIndex = Math.floor(Math.random() * playlist.length);
            while (nextIndex === currentSongIndex && playlist.length > 1) {
                nextIndex = Math.floor(Math.random() * playlist.length);
            }
            setSong(nextIndex);
            audio.play();
        });
    }

    if (progressContainer && audio) {
        progressContainer.addEventListener('click', (e) => {
            const width = progressContainer.clientWidth;
            const clickX = e.offsetX;
            const duration = audio.duration;
            if (duration) {
                audio.currentTime = (clickX / width) * duration;
            }
        });
    }

    if (nextBtn && audio) {
        nextBtn.addEventListener('click', () => {
            let nextIndex = (currentSongIndex + 1) % playlist.length;
            setSong(nextIndex);
            if (playBtn) playBtn.innerText = "❚❚";
            if (albumCover) albumCover.classList.add('spinning');
            audio.play();
        });
    }

    if (prevBtn && audio) {
        prevBtn.addEventListener('click', () => {
            let prevIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
            setSong(prevIndex);
            if (playBtn) playBtn.innerText = "❚❚";
            if (albumCover) albumCover.classList.add('spinning');
            audio.play();
        });
    }

    // ========================================================
    // --- HỆ THỐNG XỬ LÝ LƯU BÚT CẬP NHẬT GỬI AVATAR ---
    // ========================================================
    const scriptURL = 'https://script.google.com/macros/s/AKfycbw6CPhBA05UcVZtlVVSOJPMMlwXO4aS4qdQEnog4GmoykY5v3lanjr9GwoQ_WMfz4AY/exec'; 
    const submitBtn = document.getElementById('submit-msg-btn');
    const guestNameInput = document.getElementById('guest-name');
    const guestMessageInput = document.getElementById('guest-message');

    if (submitBtn) {
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const name = guestNameInput.value.trim();
            const message = guestMessageInput.value.trim();
            
            // LẤY LINK ẢNH AVATAR HIỆN TẠI (Dạng base64 hoặc URL mẫu có sẵn)
            const avatarUrl = currentAvatar ? currentAvatar.src : '';

            if (!name || !message) {
                alert("Thiếu tên sao tui biết là ai?!??!!");
                return;
            }

            submitBtn.innerText = "sending... ✉️";
            submitBtn.disabled = true;

            // Gói dữ liệu mới đồng bộ với sheet: timestamp, name, message, avatar
            const dataToSend = {
                name: name,
                message: message,
                avatar: avatarUrl
            };

            fetch(scriptURL, {
                method: 'POST',
                mode: 'no-cors', 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSend)
            })
            .then(() => {
                alert("Gửi thành công tới tui rùi nha!! Xin cảm ơn nhiềuuu");
                
                guestNameInput.value = '';
                guestMessageInput.value = '';
                
                submitBtn.innerText = "send message";
                submitBtn.disabled = false;
            })
            .catch(error => {
                console.error('Lỗi kết nối dữ liệu:', error);
                alert("Voãi mạng có vấn đề à...check lại xem sao");
                submitBtn.innerText = "send message";
                submitBtn.disabled = false;
            });
        });
    }
});
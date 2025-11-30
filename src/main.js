// 配置常數
const CONFIG = {
    // 密碼的 SHA-256 雜湊值"
    // 實際使用時請替換為您的密碼雜湊值
    PASS_HASH: '3e3005eedd3d8de3b361077971d9ae6f8c00e8aa220297ef3294723e76185def', // "2026521" 的雜湊值
    ENABLE_CONFETTI: true,
    REVEAL_IMAGE_URL: 'public/images/ultrasound.jpg'
};

// SHA-256 雜湊函式
async function sha256Hex(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 顯示錯誤訊息
function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        errorElement.classList.add('shake');
        
        // 移除動畫類別
        setTimeout(() => {
            errorElement.classList.remove('shake');
        }, 600);
    }
}

// 隱藏錯誤訊息
function hideError() {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

// 設定載入狀態
function setLoading(isLoading) {
    const submitBtn = document.querySelector('.submit-btn');
    const btnText = document.querySelector('.btn-text');
    const btnLoader = document.querySelector('.btn-loader');
    const passwordInput = document.getElementById('passwordInput');
    
    if (submitBtn && btnText && btnLoader && passwordInput) {
        if (isLoading) {
            submitBtn.disabled = true;
            passwordInput.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline';
        } else {
            submitBtn.disabled = false;
            passwordInput.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    }
}

// 密碼驗證與解鎖
async function verifyPassword(password) {
    try {
        setLoading(true);
        hideError();
        
        // 計算輸入密碼的雜湊值
        const inputHash = await sha256Hex(password);
        
        // 比對雜湊值
        if (inputHash === CONFIG.PASS_HASH) {
            // 密碼正確，設定解鎖狀態
            sessionStorage.setItem('unlocked', '1');
            sessionStorage.setItem('unlockTime', Date.now().toString());
            
            // 延遲一下讓使用者看到成功狀態
            setTimeout(() => {
                // 使用相對路徑，避免在 GitHub Pages repository 子路徑下導向到站點根目錄
                window.location.href = './reveal.html';
            }, 300);
            
            return true;
        } else {
            // 密碼錯誤
            showError('密碼錯誤，請再試一次。');
            return false;
        }
    } catch (error) {
        console.error('密碼驗證時發生錯誤：', error);
        showError('驗證時發生錯誤，請重試。');
        return false;
    } finally {
        setLoading(false);
    }
}

// 檢查解鎖狀態
function checkUnlockStatus() {
    const isUnlocked = sessionStorage.getItem('unlocked');
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('reveal.html') || currentPage.endsWith('/reveal')) {
        // 在揭曉頁面，檢查是否已解鎖
        if (!isUnlocked) {
            // 未解鎖，導向首頁
            window.location.href = './index.html';
            return false;
        }
    }
    
    return Boolean(isUnlocked);
}

// 表單提交處理
function handleFormSubmit(event) {
    event.preventDefault();
    
    const passwordInput = document.getElementById('passwordInput');
    const password = passwordInput.value.trim();
    
    if (!password) {
        showError('請輸入密碼。');
        passwordInput.focus();
        return;
    }
    
    verifyPassword(password);
}

// 圖片放大功能
function toggleImageZoom() {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const ultrasoundImage = document.getElementById('ultrasoundImage');
    
    if (modal && modalImage && ultrasoundImage) {
        modalImage.src = ultrasoundImage.src;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// 圖片錯誤處理
function handleImageError(img) {
    img.style.display = 'none';
    const container = img.parentElement;
    if (container) {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'image-error';
        errorMsg.innerHTML = '📷 圖片載入中...<br><small>請稍候或重新整理頁面</small>';
        container.appendChild(errorMsg);
    }
}

// 返回首頁
function goBack() {
    // 清除解鎖狀態（可選）
    // sessionStorage.removeItem('unlocked');
    window.location.href = './index.html';
}

// 彩帶動畫控制
function toggleConfetti() {
    if (typeof startConfetti === 'function') {
        startConfetti();
    }
}

// 圖片燈箱功能
function openLightbox(imageSrc, imageAlt) {
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxCaption = document.getElementById('lightboxCaption');
    
    if (lightbox && lightboxImage) {
        lightboxImage.src = imageSrc;
        lightboxImage.alt = imageAlt;
        if (lightboxCaption) {
            lightboxCaption.textContent = imageAlt;
        }
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('imageLightbox');
    if (lightbox) {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// 頁面初始化
document.addEventListener('DOMContentLoaded', function() {
    // 檢查解鎖狀態
    checkUnlockStatus();
    
    // 綁定表單提交事件
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handleFormSubmit);
    }
    
    // 綁定輸入框事件
    const passwordInput = document.getElementById('passwordInput');
    if (passwordInput) {
        // 輸入時隱藏錯誤訊息
        passwordInput.addEventListener('input', hideError);
        
        // 自動聚焦
        passwordInput.focus();
        
        // Enter 鍵提交
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleFormSubmit(e);
            }
        });
    }
    
    // 綁定提示圖片點擊事件
    const hintImageContainers = document.querySelectorAll('.image-container-hint');
    hintImageContainers.forEach(function(container) {
        container.addEventListener('click', function() {
            const img = this.querySelector('.hint-image');
            if (img) {
                openLightbox(img.src, img.alt);
            }
        });
    });
    
    // 綁定燈箱關閉事件
    const lightbox = document.getElementById('imageLightbox');
    const lightboxClose = document.querySelector('.lightbox-close');
    
    if (lightbox) {
        // 點擊背景關閉
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }
    
    if (lightboxClose) {
        // 點擊關閉按鈕
        lightboxClose.addEventListener('click', closeLightbox);
    }
    
    // 綁定 ESC 鍵關閉模態框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeImageModal();
            closeLightbox();
        }
    });
});

// 生成密碼雜湊的工具函式（開發時使用）
async function generatePasswordHash(password) {
    const hash = await sha256Hex(password);
    console.log(`密碼 "${password}" 的 SHA-256 雜湊值：`, hash);
    return hash;
}

// 開發用：在控制台中可以使用此函式生成密碼雜湊
// 例如：generatePasswordHash('yourpassword')
window.generatePasswordHash = generatePasswordHash;
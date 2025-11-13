// 刮刮樂功能
class ScratchCard {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.scratchedPixels = 0;
        this.totalPixels = 0;
        this.scratchRadius = 30;
        this.isRevealed = false;
        
        this.init();
        this.bindEvents();
        this.createImageGrid();
    }
    
    init() {
        // 設定 canvas 尺寸
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // 繪製銀色刮刮樂表面
        this.drawScratchSurface();
        
        // 設定合成模式為擦除
        this.ctx.globalCompositeOperation = 'destination-out';
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // 設定 canvas 尺寸
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        // 重新繪製表面
        this.drawScratchSurface();
        
        // 計算總像素數
        this.totalPixels = this.canvas.width * this.canvas.height;
    }
    
    drawScratchSurface() {
        // 重設合成模式
        this.ctx.globalCompositeOperation = 'source-over';
        
        // 建立漸層背景
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#e6e6e6');
        gradient.addColorStop(0.3, '#cccccc');
        gradient.addColorStop(0.7, '#b3b3b3');
        gradient.addColorStop(1, '#999999');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 添加紋理效果
        this.addTexture();
        
        // 添加文字提示
        this.addScratchText();
        
        // 重設為擦除模式
        this.ctx.globalCompositeOperation = 'destination-out';
    }
    
    addTexture() {
        // 添加細微的噪點紋理
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = Math.random() * 30 - 15;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));     // R
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // G
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // B
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    addScratchText() {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.ctx.fillText('刮一刮', centerX, centerY - 20);
        this.ctx.font = '16px Arial';
        this.ctx.fillText('🎁 驚喜等著你', centerX, centerY + 20);
        this.ctx.restore();
    }
    
    bindEvents() {
        // 滑鼠事件
        this.canvas.addEventListener('mousedown', (e) => this.startScratch(e));
        this.canvas.addEventListener('mousemove', (e) => this.scratch(e));
        this.canvas.addEventListener('mouseup', () => this.stopScratch());
        this.canvas.addEventListener('mouseleave', () => this.stopScratch());
        
        // 觸控事件
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startScratch(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.scratch(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopScratch();
        });
    }
    
    startScratch(e) {
        this.isDrawing = true;
        this.scratch(e);
    }
    
    scratch(e) {
        if (!this.isDrawing) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 繪製擦除區域
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.scratchRadius, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // 更新進度
        this.updateProgress();
    }
    
    stopScratch() {
        this.isDrawing = false;
    }
    
    createImageGrid() {
        const imageGrid = document.getElementById('imageGrid');
        if (!imageGrid) return;
        
        // 清空現有內容
        imageGrid.innerHTML = '';
        
        // 建立1024張小圖片 (32x32網格)
        for (let i = 0; i < 1024; i++) {
            const img = document.createElement('img');
            img.src = 'public/images/ultrasound2.jpg';
            img.alt = '小圖片';
            img.className = 'grid-image';
            img.onerror = () => {
                img.style.display = 'none';
            };
            imageGrid.appendChild(img);
        }
    }

    updateProgress() {
        // 計算透明像素數量
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        let transparentPixels = 0;
        
        for (let i = 3; i < data.length; i += 4) {
            if (data[i] === 0) {
                transparentPixels++;
            }
        }
        
        const percentage = Math.round((transparentPixels / this.totalPixels) * 100);
        this.updateProgressDisplay(percentage);
        
        // 如果刮除超過 70%，完全顯示
        if (percentage > 70) {
            setTimeout(() => this.revealAll(), 500);
        }
    }

    startImageTransition() {
        this.isRevealed = true;
        const imageGrid = document.getElementById('imageGrid');
        const finalImage = document.getElementById('finalImage');
        
        if (imageGrid && finalImage) {
            // 淡出網格圖片
            imageGrid.style.transition = 'opacity 1s ease-out';
            imageGrid.style.opacity = '0';
            
            // 延遲後顯示最終圖片
            setTimeout(() => {
                imageGrid.style.display = 'none';
                finalImage.style.display = 'block';
                finalImage.style.opacity = '0';
                finalImage.style.transition = 'opacity 1s ease-in';
                
                // 觸發淡入效果
                setTimeout(() => {
                    finalImage.style.opacity = '1';
                }, 50);
            }, 1000);
        }
    }
    
    updateProgressDisplay(percentage) {
        const progressFill = document.getElementById('progressFill');
        const progressPercent = document.getElementById('progressPercent');
        
        if (progressFill && progressPercent) {
            progressFill.style.width = percentage + '%';
            progressPercent.textContent = percentage;
        }
    }
    
    revealAll() {
        // 清除整個 canvas
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.updateProgressDisplay(100);
        
        // 切換到最終圖片
        if (!this.isRevealed) {
            this.startImageTransition();
        }
        
        // 添加完成動畫
        this.canvas.style.opacity = '0';
        setTimeout(() => {
            this.canvas.style.display = 'none';
            this.showCompletionMessage();
        }, 300);
    }
    
    reset() {
        this.ctx.globalCompositeOperation = 'source-over';
        this.canvas.style.display = 'block';
        this.canvas.style.opacity = '1';
        this.drawScratchSurface();
        this.updateProgressDisplay(0);
        this.hideCompletionMessage();
        
        // 重置圖片狀態
        this.isRevealed = false;
        const imageGrid = document.getElementById('imageGrid');
        const finalImage = document.getElementById('finalImage');
        
        if (imageGrid && finalImage) {
            imageGrid.style.display = 'grid';
            imageGrid.style.opacity = '1';
            imageGrid.style.transition = 'none';
            
            finalImage.style.display = 'none';
            finalImage.style.opacity = '0';
            finalImage.style.transition = 'none';
        }
        
        // 重新建立圖片網格
        this.createImageGrid();
    }
    
    showCompletionMessage() {
        const existingMessage = document.querySelector('.completion-message');
        if (existingMessage) return;
        
        const message = document.createElement('div');
        message.className = 'completion-message';
        message.innerHTML = `
            <div class="completion-content">
                <h2>🎉 恭喜發現驚喜！</h2>
                <p>希望這個特別的時刻能帶給你滿滿的喜悅</p>
            </div>
        `;
        
        // 將訊息插入到刮刮卡容器的下方
        const scratchContainer = document.querySelector('.scratch-container');
        if (scratchContainer && scratchContainer.parentNode) {
            scratchContainer.parentNode.insertBefore(message, scratchContainer.nextSibling);
        }
        
        // 觸發彩帶動畫（如果有的話）
        if (typeof startConfetti === 'function') {
            startConfetti();
        }
    }
    
    hideCompletionMessage() {
        const message = document.querySelector('.completion-message');
        if (message) {
            message.remove();
        }
    }
}

// 全域函式
let scratchCard;

function initScratchCard() {
    scratchCard = new ScratchCard('scratchCanvas');
}

function resetScratch() {
    if (scratchCard) {
        scratchCard.reset();
    }
}

function revealAll() {
    if (scratchCard) {
        scratchCard.revealAll();
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

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    // 等待圖片載入完成再初始化刮刮樂
    const img = document.querySelector('.scratch-image');
    if (img.complete) {
        initScratchCard();
    } else {
        img.addEventListener('load', initScratchCard);
    }
    
    // 載入彩帶動畫（如果存在）
    const confettiScript = document.createElement('script');
    confettiScript.src = 'src/confetti.js';
    confettiScript.onerror = () => {
        console.log('彩帶動畫檔案不存在，跳過載入');
    };
    document.head.appendChild(confettiScript);
});
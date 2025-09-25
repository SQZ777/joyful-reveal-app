// 彩帶動畫實作
class ConfettiAnimation {
    constructor() {
        this.canvas = document.getElementById('confetti-canvas');
        this.ctx = null;
        this.confettiPieces = [];
        this.isAnimating = false;
        this.animationId = null;
        
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.resizeCanvas();
            this.bindEvents();
        }
    }
    
    bindEvents() {
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    }
    
    createConfettiPiece() {
        const colors = ['#ff6b9d', '#ffc93c', '#06ffa5', '#3b82f6', '#8b5cf6', '#ef4444', '#f97316'];
        const shapes = ['square', 'circle', 'triangle'];
        
        return {
            x: Math.random() * this.canvas.width,
            y: -10,
            vx: (Math.random() - 0.5) * 4,
            vy: Math.random() * 3 + 2,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            shape: shapes[Math.floor(Math.random() * shapes.length)],
            opacity: 1,
            gravity: 0.1,
            life: 0
        };
    }
    
    drawConfettiPiece(piece) {
        if (!this.ctx) return;
        
        this.ctx.save();
        this.ctx.globalAlpha = piece.opacity;
        this.ctx.translate(piece.x, piece.y);
        this.ctx.rotate((piece.rotation * Math.PI) / 180);
        this.ctx.fillStyle = piece.color;
        
        switch (piece.shape) {
            case 'square':
                this.ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
                break;
            case 'circle':
                this.ctx.beginPath();
                this.ctx.arc(0, 0, piece.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
                break;
            case 'triangle':
                this.ctx.beginPath();
                this.ctx.moveTo(0, -piece.size / 2);
                this.ctx.lineTo(-piece.size / 2, piece.size / 2);
                this.ctx.lineTo(piece.size / 2, piece.size / 2);
                this.ctx.closePath();
                this.ctx.fill();
                break;
        }
        
        this.ctx.restore();
    }
    
    updateConfettiPiece(piece) {
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.vy += piece.gravity;
        piece.rotation += piece.rotationSpeed;
        piece.life++;
        
        // 淡出效果
        if (piece.life > 180) {
            piece.opacity = Math.max(0, piece.opacity - 0.02);
        }
        
        // 移除超出畫面或完全透明的彩帶
        return piece.y < this.canvas.height + 50 && piece.opacity > 0;
    }
    
    animate() {
        if (!this.ctx || !this.canvas) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 更新和繪製彩帶
        this.confettiPieces = this.confettiPieces.filter(piece => {
            const isAlive = this.updateConfettiPiece(piece);
            if (isAlive) {
                this.drawConfettiPiece(piece);
            }
            return isAlive;
        });
        
        // 如果還有彩帶在動畫中，繼續動畫
        if (this.confettiPieces.length > 0) {
            this.animationId = requestAnimationFrame(() => this.animate());
        } else {
            this.isAnimating = false;
            this.animationId = null;
        }
    }
    
    start(duration = 3000, intensity = 3) {
        if (!this.canvas || !this.ctx) return;
        
        this.isAnimating = true;
        
        // 建立彩帶片段的間隔
        const createInterval = setInterval(() => {
            for (let i = 0; i < intensity; i++) {
                this.confettiPieces.push(this.createConfettiPiece());
            }
        }, 50);
        
        // 停止建立新的彩帶片段
        setTimeout(() => {
            clearInterval(createInterval);
        }, duration);
        
        // 開始動畫
        if (!this.animationId) {
            this.animate();
        }
    }
    
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.confettiPieces = [];
        this.isAnimating = false;
        
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
}

// 全域彩帶動畫實例
let confettiAnimation = null;

// 初始化彩帶動畫
function initConfetti() {
    if (!confettiAnimation) {
        confettiAnimation = new ConfettiAnimation();
    }
}

// 開始彩帶動畫
function startConfetti(duration = 3000, intensity = 3) {
    initConfetti();
    if (confettiAnimation) {
        confettiAnimation.start(duration, intensity);
    }
}

// 停止彩帶動畫
function stopConfetti() {
    if (confettiAnimation) {
        confettiAnimation.stop();
    }
}

// 頁面載入時初始化
document.addEventListener('DOMContentLoaded', function() {
    // 如果在揭曉頁面，初始化彩帶動畫
    if (document.body.classList.contains('reveal-page')) {
        initConfetti();
    }
});

// 匯出函式供其他腳本使用
window.startConfetti = startConfetti;
window.stopConfetti = stopConfetti;
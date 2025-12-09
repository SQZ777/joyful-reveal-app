// 夾娃娃機遊戲邏輯
class ClawMachineGame {
    constructor() {
        // DOM 元素
        this.claw = document.getElementById('claw');
        this.clawRail = document.getElementById('clawRail');
        this.clawCable = document.getElementById('clawCable');
        this.resultOverlay = document.getElementById('resultOverlay');
        this.resultIcon = document.getElementById('resultIcon');
        this.resultTitle = document.getElementById('resultTitle');
        this.resultMessage = document.getElementById('resultMessage');
        
        // 控制按鈕
        this.leftBtn = document.getElementById('leftBtn');
        this.rightBtn = document.getElementById('rightBtn');
        this.grabBtn = document.getElementById('grabBtn');
        this.replayBtn = document.getElementById('replayBtn');
        
        // 遊戲狀態
        this.clawPosition = { x: 50, y: 0 }; // 百分比
        this.isGrabbing = false;
        this.gameOver = false;
        this.moveStep = 5; // 每次移動的百分比
        
        // 娃娃位置 (百分比) - 類型在抓取時隨機決定
        // 創建密集的娃娃排列，包含三排
        this.prizes = [
            // 第一排（前排）
            { x: 10, y: 75, type: 'unknown', element: null },
            { x: 23, y: 75, type: 'unknown', element: null },
            { x: 36, y: 75, type: 'unknown', element: null },
            { x: 50, y: 75, type: 'unknown', element: null },
            { x: 64, y: 75, type: 'unknown', element: null },
            { x: 77, y: 75, type: 'unknown', element: null },
            { x: 90, y: 75, type: 'unknown', element: null },
            // 第二排（中排，稍微後面一點）
            { x: 16, y: 70, type: 'unknown', element: null },
            { x: 30, y: 70, type: 'unknown', element: null },
            { x: 43, y: 70, type: 'unknown', element: null },
            { x: 57, y: 70, type: 'unknown', element: null },
            { x: 70, y: 70, type: 'unknown', element: null },
            { x: 84, y: 70, type: 'unknown', element: null },
            // 第三排（後排）
            { x: 25, y: 65, type: 'unknown', element: null },
            { x: 75, y: 65, type: 'unknown', element: null }
        ];
        
        this.init();
    }
    
    init() {
        // 初始化娃娃元素
        const prizeElements = document.querySelectorAll('.prize');
        prizeElements.forEach((element, index) => {
            if (this.prizes[index]) {
                this.prizes[index].element = element;
                element.style.left = this.prizes[index].x + '%';
                element.style.bottom = '10px';
            }
        });
        
        // 設置初始爪子位置
        this.updateClawPosition();
        
        // 綁定事件
        this.leftBtn.addEventListener('click', () => this.moveClaw('left'));
        this.rightBtn.addEventListener('click', () => this.moveClaw('right'));
        this.grabBtn.addEventListener('click', () => this.grab());
        this.replayBtn.addEventListener('click', () => this.reset());
    }
    
    updateClawPosition() {
        this.clawRail.style.left = this.clawPosition.x + '%';
        this.clawCable.style.height = this.clawPosition.y + '%';
        // 讓爪子頭部跟著纜線移動 - 遊戲區域高度是 380px
        const clawHead = this.claw.querySelector('.claw-head');
        const cableLength = (this.clawPosition.y / 100) * 380; // 將百分比轉換為實際像素
        clawHead.style.setProperty('--cable-length', cableLength + 'px');
    }
    
    moveClaw(direction) {
        if (this.isGrabbing || this.gameOver) return;
        
        const btn = {
            'left': this.leftBtn,
            'right': this.rightBtn
        }[direction];
        
        // 添加按鈕動畫
        btn.classList.add('active');
        setTimeout(() => btn.classList.remove('active'), 200);
        
        switch(direction) {
            case 'left':
                this.clawPosition.x = Math.max(10, this.clawPosition.x - this.moveStep);
                break;
            case 'right':
                this.clawPosition.x = Math.min(90, this.clawPosition.x + this.moveStep);
                break;
        }
        
        this.updateClawPosition();
    }
    
    async grab() {
        if (this.isGrabbing || this.gameOver) return;
        
        this.isGrabbing = true;
        this.disableControls();
        this.grabBtn.classList.add('active');
        
        // 爪子下降
        await this.animateClawDown();
        
        // 檢查是否抓到娃娃
        const caughtPrize = this.checkPrizeCollision();
        
        if (caughtPrize) {
            // 抓到了！
            await this.animateGrab(caughtPrize);
            await this.animateClawUp(caughtPrize);
            await this.showResult(caughtPrize);
        } else {
            // 沒抓到
            await this.animateClawUp(null);
            this.isGrabbing = false;
            this.enableControls();
            this.grabBtn.classList.remove('active');
        }
    }
    
    checkPrizeCollision() {
        const clawX = this.clawPosition.x;
        const clawY = this.clawPosition.y;
        
        for (let prize of this.prizes) {
            const dx = Math.abs(clawX - prize.x);
            const dy = Math.abs(clawY - prize.y);
            
            // 如果爪子在娃娃附近（容錯範圍 8%）
            if (dx < 8 && dy < 8) {
                return prize;
            }
        }
        
        return null;
    }
    
    animateClawDown() {
        return new Promise(resolve => {
            const targetY = 70;
            const duration = 1500;
            const startY = this.clawPosition.y;
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                this.clawPosition.y = startY + (targetY - startY) * progress;
                this.updateClawPosition();
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            animate();
        });
    }
    
    animateGrab(prize) {
        return new Promise(resolve => {
            // 爪子閉合動畫
            this.claw.classList.add('grabbing');
            
            // 娃娃被抓起，先顯示為問號，結果稍後在 showResult 才決定
            if (prize && prize.element) {
                prize.element.classList.add('caught');
                prize.element.classList.add('mystery-prize');
                prize.element.querySelector('.prize-icon').textContent = '❓';
            }
            
            setTimeout(resolve, 800);
        });
    }
    
    animateClawUp(prize) {
        return new Promise(resolve => {
            const targetY = 0;
            const duration = 1500;
            const startY = this.clawPosition.y;
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                this.clawPosition.y = startY + (targetY - startY) * progress;
                this.updateClawPosition();
                
                // 如果有娃娃，讓它跟著爪子移動 - 使用與爪子相同的像素計算
                if (prize && prize.element) {
                    // 遊戲區域高度 380px，娃娃區域底部約 120px，娃娃初始 bottom 10px
                    const clawPixelY = (this.clawPosition.y / 100) * 380;
                    const prizeBottom = 10 + (380 - 120) - clawPixelY;
                    prize.element.style.bottom = Math.max(10, prizeBottom) + 'px';
                }
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            animate();
        });
    }
    
    async showResult(prize) {
        this.gameOver = true;
        
        // 等待一下再顯示結果
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 在這裡才隨機決定結果（70% 男生，30% 再試一次）
        const type = Math.random() < 0.7 ? 'boy' : 'mystery';
        prize.type = type;
        
        // 更新被夾起的娃娃外觀
        if (prize && prize.element) {
            if (type === 'boy') {
                prize.element.classList.remove('mystery-prize');
                prize.element.classList.add('boy-prize');
                prize.element.querySelector('.prize-icon').textContent = '👶';
            }
        }
        
        if (type === 'boy') {
            this.resultIcon.innerHTML = '<div class="celebration-emoji">👶💙</div>';
            this.resultIcon.style.backgroundColor = '#4A90E2';
            this.resultTitle.textContent = '恭喜！是個男孩！';
            this.resultMessage.textContent = '🎉 歡迎小王子的到來！🎉';
        } else {
            this.resultIcon.innerHTML = '<div class="celebration-emoji">❓</div>';
            this.resultIcon.style.backgroundColor = '#999';
            this.resultTitle.textContent = '再試一次吧！';
            this.resultMessage.textContent = '差一點點就成功了，繼續加油！';
        }
        
        // 顯示結果覆蓋層
        this.resultOverlay.classList.add('show');
        
        // 觸發煙火效果
        if (type === 'boy') {
            this.launchConfetti();
        }
    }
    
    launchConfetti() {
        // 創建彩帶效果
        const colors = ['#4A90E2', '#5DADE2', '#85C1E9', '#AED6F1', '#D6EAF8'];
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = Math.random() * 0.5 + 's';
                confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
                document.body.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 4000);
            }, i * 30);
        }
    }
    
    disableControls() {
        this.leftBtn.disabled = true;
        this.rightBtn.disabled = true;
        this.grabBtn.disabled = true;
    }
    
    enableControls() {
        this.leftBtn.disabled = false;
        this.rightBtn.disabled = false;
        this.grabBtn.disabled = false;
    }
    
    reset() {
        // 重置遊戲狀態
        this.clawPosition = { x: 50, y: 0 };
        this.isGrabbing = false;
        this.gameOver = false;
        
        // 重置爪子
        this.claw.classList.remove('grabbing');
        this.updateClawPosition();
        
        // 重置娃娃
        document.querySelectorAll('.prize').forEach((prize, index) => {
            prize.classList.remove('caught', 'boy-prize', 'mystery-prize');
            prize.style.bottom = '10px';
            prize.querySelector('.prize-icon').textContent = '🧸';
            if (this.prizes[index]) {
                prize.style.left = this.prizes[index].x + '%';
                this.prizes[index].type = 'unknown';
            }
        });
        
        // 隱藏結果覆蓋層
        this.resultOverlay.classList.remove('show');
        
        // 啟用控制
        this.enableControls();
        this.grabBtn.classList.remove('active');
    }
}

// 初始化遊戲
document.addEventListener('DOMContentLoaded', () => {
    new ClawMachineGame();
});

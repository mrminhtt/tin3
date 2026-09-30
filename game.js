/**
 * ============================================================================
 * CỜ CA-RÔ PRO - CORE ENGINE & GAME CONTROLLER
 * ============================================================================
 */

(function () {
  'use strict';

  // --- AUDIO SYNTHESIZER (Web Audio API) ---
  class SoundController {
    constructor() {
      this.ctx = null;
      this.enabled = localStorage.getItem('caro_sound_enabled') !== 'false';
    }

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem('caro_sound_enabled', this.enabled);
      return this.enabled;
    }

    playPieceSound(player) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      if (player === 'X') {
        // Crisp, high-tech click tone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } else {
        // Smooth, resonant water-drop tone
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now); // A4
        osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.1); // E4
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.14);
      }
    }

    playWinSound() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;

      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const time = now + i * 0.11;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.45);
      });
    }

    playDrawSound() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(392.00, now);
      osc.frequency.exponentialRampToValueAtTime(261.63, now + 0.28);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    }

    playUndoSound() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(330, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.1);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    }
  }

  // --- CONFETTI CELEBRATION ENGINE ---
  class ConfettiEngine {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.particles = [];
      this.animationId = null;
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    fire(durationMs = 3500) {
      this.particles = [];
      const colors = ['#ff3366', '#00f2fe', '#ffbe0b', '#10b981', '#a855f7', '#ffffff'];
      const count = Math.min(180, Math.floor(window.innerWidth / 8));

      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: window.innerWidth * (0.2 + Math.random() * 0.6),
          y: window.innerHeight * 0.45 + (Math.random() * 50 - 25),
          vx: (Math.random() - 0.5) * 16,
          vy: (Math.random() - 1.2) * 16,
          size: Math.random() * 9 + 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 12,
          gravity: 0.35 + Math.random() * 0.2,
          opacity: 1,
          decay: 0.008 + Math.random() * 0.008
        });
      }

      if (this.animationId) cancelAnimationFrame(this.animationId);
      this.render();

      setTimeout(() => {
        this.stop();
      }, durationMs);
    }

    render() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98;
        p.rotation += p.rotationSpeed;
        p.opacity -= p.decay;

        if (p.opacity <= 0 || p.y > this.canvas.height + 50) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.globalAlpha = Math.max(0, p.opacity);
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        this.ctx.restore();
      }

      if (this.particles.length > 0) {
        this.animationId = requestAnimationFrame(() => this.render());
      } else {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }

    stop() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      this.particles = [];
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  // --- CARO GAME ENGINE ---
  class CaroGame {
    constructor() {
      // Configuration
      this.size = 15;
      this.winCount = 5;
      this.mode = 'pvp'; // 'pvp' or 'ai'
      this.aiDifficulty = 'medium'; // 'easy', 'medium', 'hard'
      this.blockTwoEnds = true; // Vietnamese Caro Rule
      this.currentTurn = 'X';
      this.isGameOver = false;
      this.aiThinking = false;
      this.zoomLevel = 1.0;

      // Board representation: board[row][col] -> null | 'X' | 'O'
      this.board = [];
      this.moveHistory = [];
      this.winningLine = null;

      // Timer & Stats
      this.timerSeconds = 0;
      this.timerInterval = null;
      this.scores = this.loadScores();

      // Audio & Confetti
      this.sound = new SoundController();
      this.confetti = new ConfettiEngine(document.getElementById('confetti-canvas'));

      // DOM Elements
      this.dom = {
        board: document.getElementById('caro-board'),
        boardCenterer: document.querySelector('.board-centerer'),
        turnCard: document.getElementById('turn-card'),
        turnPiecePreview: document.getElementById('turn-piece-preview'),
        currentPlayerName: document.getElementById('current-player-name'),
        currentTurnStatus: document.getElementById('current-turn-status'),
        statusPulse: document.getElementById('status-pulse'),
        matchTimer: document.getElementById('match-timer'),
        moveCounter: document.getElementById('move-counter'),
        scoreXVal: document.getElementById('score-x-val'),
        scoreOVal: document.getElementById('score-o-val'),
        scoreDrawVal: document.getElementById('score-draw-val'),
        scoreLabelX: document.getElementById('score-label-x'),
        scoreLabelO: document.getElementById('score-label-o'),
        btnNewGame: document.getElementById('btn-new-game'),
        btnUndo: document.getElementById('btn-undo-move'),
        btnResetScore: document.getElementById('btn-reset-score'),
        btnSoundToggle: document.getElementById('btn-sound-toggle'),
        soundIcon: document.getElementById('sound-icon'),
        btnThemeToggle: document.getElementById('btn-theme-toggle'),
        themeIcon: document.getElementById('theme-icon'),
        btnRulesModal: document.getElementById('btn-rules-modal'),
        rulesModal: document.getElementById('rules-modal'),
        btnCloseRules: document.getElementById('btn-close-rules'),
        btnUnderstandRules: document.getElementById('btn-understand-rules'),
        gameOverModal: document.getElementById('game-over-modal'),
        modalTitle: document.getElementById('modal-title'),
        modalSubtitle: document.getElementById('modal-subtitle'),
        modalAvatar: document.getElementById('modal-avatar'),
        modalTimeVal: document.getElementById('modal-time-val'),
        modalMovesVal: document.getElementById('modal-moves-val'),
        btnModalRematch: document.getElementById('btn-modal-rematch'),
        btnModalClose: document.getElementById('btn-modal-close'),
        blockTwoEndsToggle: document.getElementById('block-two-ends-toggle'),
        aiDifficultyGroup: document.getElementById('ai-difficulty-group'),
        ruleGroup: document.getElementById('rule-group'),
        modeButtons: document.querySelectorAll('#mode-control .segment-btn'),
        diffButtons: document.querySelectorAll('#diff-control .segment-btn'),
        sizeButtons: document.querySelectorAll('#size-control .segment-btn'),
        btnZoomIn: document.getElementById('btn-zoom-in'),
        btnZoomOut: document.getElementById('btn-zoom-out'),
        btnZoomReset: document.getElementById('btn-zoom-reset')
      };

      this.initTheme();
      this.initEvents();
      this.updateScoreboardDisplay();
      this.resetGame();
    }

    loadScores() {
      try {
        const saved = localStorage.getItem('caro_scores');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading scores', e);
      }
      return { x: 0, o: 0, draw: 0 };
    }

    saveScores() {
      try {
        localStorage.setItem('caro_scores', JSON.stringify(this.scores));
      } catch (e) {
        console.error('Error saving scores', e);
      }
    }

    initTheme() {
      const savedTheme = localStorage.getItem('caro_theme') || 'dark';
      document.documentElement.setAttribute('data-theme', savedTheme);
      this.dom.themeIcon.textContent = savedTheme === 'dark' ? '🌙' : '☀️';
      this.dom.soundIcon.textContent = this.sound.enabled ? '🔊' : '🔇';
    }

    toggleTheme() {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('caro_theme', next);
      this.dom.themeIcon.textContent = next === 'dark' ? '🌙' : '☀️';
    }

    initEvents() {
      // Game action buttons
      this.dom.btnNewGame.addEventListener('click', () => this.resetGame());
      this.dom.btnUndo.addEventListener('click', () => this.undoMove());
      this.dom.btnResetScore.addEventListener('click', () => this.resetScores());

      // Sound & Theme toggles
      this.dom.btnSoundToggle.addEventListener('click', () => {
        const enabled = this.sound.toggle();
        this.dom.soundIcon.textContent = enabled ? '🔊' : '🔇';
      });
      this.dom.btnThemeToggle.addEventListener('click', () => this.toggleTheme());

      // Rules modal
      this.dom.btnRulesModal.addEventListener('click', () => this.openRulesModal());
      this.dom.btnCloseRules.addEventListener('click', () => this.closeRulesModal());
      this.dom.btnUnderstandRules.addEventListener('click', () => this.closeRulesModal());

      // Game over modal
      this.dom.btnModalRematch.addEventListener('click', () => {
        this.closeGameOverModal();
        this.resetGame();
      });
      this.dom.btnModalClose.addEventListener('click', () => this.closeGameOverModal());

      // Modals outside click
      [this.dom.rulesModal, this.dom.gameOverModal].forEach((modal) => {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) modal.classList.remove('active');
        });
      });

      // Mode Switcher (2 Players / vs AI)
      this.dom.modeButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const mode = btn.dataset.mode;
          if (this.mode === mode) return;
          this.dom.modeButtons.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.setMode(mode);
        });
      });

      // AI Difficulty Switcher
      this.dom.diffButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          this.dom.diffButtons.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.aiDifficulty = btn.dataset.diff;
          this.updateTurnDisplay();
        });
      });

      // Board Size Switcher
      this.dom.sizeButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const newSize = parseInt(btn.dataset.size, 10);
          if (this.size === newSize) return;
          this.dom.sizeButtons.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.setSize(newSize);
        });
      });

      // Vietnamese blocked rule toggle
      this.dom.blockTwoEndsToggle.addEventListener('change', (e) => {
        this.blockTwoEnds = e.target.checked;
      });

      // Zoom Controls
      this.dom.btnZoomIn.addEventListener('click', () => this.changeZoom(0.15));
      this.dom.btnZoomOut.addEventListener('click', () => this.changeZoom(-0.15));
      this.dom.btnZoomReset.addEventListener('click', () => this.resetZoom());

      // Keyboard Shortcuts
      window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.key === 'r' || e.key === 'R') {
          this.resetGame();
        } else if ((e.key === 'z' || e.key === 'Z') && !e.ctrlKey && !e.metaKey) {
          this.undoMove();
        } else if (e.key === 'm' || e.key === 'M') {
          const enabled = this.sound.toggle();
          this.dom.soundIcon.textContent = enabled ? '🔊' : '🔇';
        } else if (e.key === 'Escape') {
          this.dom.rulesModal.classList.remove('active');
          this.dom.gameOverModal.classList.remove('active');
        }
      });
    }

    setMode(mode) {
      this.mode = mode;
      if (mode === 'ai') {
        this.dom.aiDifficultyGroup.style.display = 'flex';
        this.dom.scoreLabelO.textContent = 'Máy AI';
      } else {
        this.dom.aiDifficultyGroup.style.display = 'none';
        this.dom.scoreLabelO.textContent = 'Người chơi O';
      }
      this.resetGame();
    }

    setSize(newSize) {
      this.size = newSize;
      this.winCount = newSize === 3 ? 3 : 5;

      // Hide or show the block two ends toggle (for 3x3 tic tac toe, blocking 2 ends rule doesn't apply)
      if (this.size === 3) {
        this.dom.ruleGroup.style.display = 'none';
      } else {
        this.dom.ruleGroup.style.display = 'flex';
      }

      this.resetZoom();
      this.resetGame();
    }

    changeZoom(delta) {
      this.zoomLevel = Math.max(0.6, Math.min(1.6, this.zoomLevel + delta));
      this.dom.boardCenterer.style.transform = `scale(${this.zoomLevel})`;
    }

    resetZoom() {
      this.zoomLevel = 1.0;
      this.dom.boardCenterer.style.transform = 'scale(1)';
    }

    resetScores() {
      if (confirm('Bạn có chắc chắn muốn đặt lại bảng tỉ số về 0?')) {
        this.scores = { x: 0, o: 0, draw: 0 };
        this.saveScores();
        this.updateScoreboardDisplay();
      }
    }

    updateScoreboardDisplay() {
      this.dom.scoreXVal.textContent = this.scores.x;
      this.dom.scoreOVal.textContent = this.scores.o;
      this.dom.scoreDrawVal.textContent = this.scores.draw;
    }

    // --- GAME LIFECYCLE ---
    resetGame() {
      this.stopTimer();
      this.timerSeconds = 0;
      this.dom.matchTimer.textContent = '00:00';
      this.moveHistory = [];
      this.isGameOver = false;
      this.aiThinking = false;
      this.winningLine = null;
      this.currentTurn = 'X';

      // Initialize empty matrix
      this.board = Array.from({ length: this.size }, () => Array(this.size).fill(null));

      this.dom.moveCounter.textContent = '0';
      this.dom.btnUndo.disabled = true;

      this.renderBoard();
      this.updateTurnDisplay();
      this.startTimer();
    }

    startTimer() {
      this.stopTimer();
      this.timerInterval = setInterval(() => {
        this.timerSeconds++;
        const mins = Math.floor(this.timerSeconds / 60)
          .toString()
          .padStart(2, '0');
        const secs = (this.timerSeconds % 60).toString().padStart(2, '0');
        this.dom.matchTimer.textContent = `${mins}:${secs}`;
      }, 1000);
    }

    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    }

    renderBoard() {
      const boardEl = this.dom.board;
      boardEl.innerHTML = '';
      boardEl.className = `caro-board size-${this.size} preview-${this.currentTurn.toLowerCase()}`;
      boardEl.style.gridTemplateColumns = `repeat(${this.size}, var(--cell-size))`;

      const fragment = document.createDocumentFragment();

      for (let r = 0; r < this.size; r++) {
        for (let c = 0; c < this.size; c++) {
          const cell = document.createElement('div');
          cell.className = 'caro-cell';
          cell.dataset.row = r;
          cell.dataset.col = c;
          cell.setAttribute('role', 'button');
          cell.setAttribute('aria-label', `Ô hàng ${r + 1}, cột ${c + 1}`);

          cell.addEventListener('click', () => this.handleCellClick(r, c));
          fragment.appendChild(cell);
        }
      }

      boardEl.appendChild(fragment);
    }

    updateTurnDisplay() {
      const isX = this.currentTurn === 'X';
      const isAiTurn = this.mode === 'ai' && !isX;

      this.dom.turnCard.classList.toggle('x-turn', isX);
      this.dom.turnCard.classList.toggle('o-turn', !isX);

      // Symbol
      this.dom.turnPiecePreview.innerHTML = isX
        ? '<span class="piece-symbol x-symbol">✕</span>'
        : '<span class="piece-symbol o-symbol">◯</span>';

      // Status pulse color
      this.dom.statusPulse.style.background = isX ? 'var(--color-x)' : 'var(--color-o)';
      this.dom.statusPulse.style.boxShadow = `0 0 10px ${isX ? 'var(--color-x)' : 'var(--color-o)'}`;

      // Name & Status
      if (isAiTurn) {
        this.dom.currentPlayerName.textContent = 'Máy AI (O)';
        this.dom.currentTurnStatus.textContent = this.aiThinking
          ? 'Đang tính toán nước đi hiểm hóc...'
          : 'Đến lượt máy đi...';
      } else {
        this.dom.currentPlayerName.textContent = isX ? 'Người chơi X' : 'Người chơi O';
        this.dom.currentTurnStatus.textContent = 'Sẵn sàng đặt quân...';
      }

      // Board hover class
      this.dom.board.classList.remove('preview-x', 'preview-o');
      if (!this.isGameOver && !this.aiThinking) {
        this.dom.board.classList.add(`preview-${this.currentTurn.toLowerCase()}`);
      }
    }

    getCellElement(row, col) {
      return this.dom.board.querySelector(`.caro-cell[data-row="${row}"][data-col="${col}"]`);
    }

    handleCellClick(row, col) {
      if (this.isGameOver || this.aiThinking) return;
      if (this.board[row][col] !== null) return;
      if (this.mode === 'ai' && this.currentTurn === 'O') return;

      this.placeMove(row, col, this.currentTurn);
    }

    placeMove(row, col, player) {
      // Record move
      this.board[row][col] = player;
      this.moveHistory.push({ row, col, player });

      // Play Sound
      this.sound.playPieceSound(player);

      // Update DOM cell
      const cellEl = this.getCellElement(row, col);
      if (cellEl) {
        cellEl.classList.add('occupied');
        const piece = document.createElement('span');
        piece.className = `cell-piece piece-${player.toLowerCase()}`;
        piece.textContent = player === 'X' ? '✕' : '◯';
        cellEl.appendChild(piece);

        // Highlight last move
        this.dom.board.querySelectorAll('.caro-cell.last-move').forEach((el) => {
          el.classList.remove('last-move', 'last-move-x', 'last-move-o');
        });
        cellEl.classList.add('last-move', `last-move-${player.toLowerCase()}`);
      }

      this.dom.moveCounter.textContent = this.moveHistory.length;
      this.dom.btnUndo.disabled = false;

      // Check win condition
      const winResult = this.checkWin(row, col, player);
      if (winResult) {
        this.handleGameWin(player, winResult);
        return;
      }

      // Check draw condition
      if (this.checkDraw()) {
        this.handleGameDraw();
        return;
      }

      // Switch turn
      this.currentTurn = this.currentTurn === 'X' ? 'O' : 'X';
      this.updateTurnDisplay();

      // Trigger AI if applicable
      if (this.mode === 'ai' && this.currentTurn === 'O' && !this.isGameOver) {
        this.triggerAiMove();
      }
    }

    undoMove() {
      if (this.moveHistory.length === 0 || this.isGameOver || this.aiThinking) return;

      this.sound.playUndoSound();

      // In AI mode, undo both AI and player moves to get back to player's turn
      const stepsToUndo = this.mode === 'ai' && this.moveHistory.length >= 2 ? 2 : 1;

      for (let i = 0; i < stepsToUndo; i++) {
        const last = this.moveHistory.pop();
        if (!last) break;
        this.board[last.row][last.col] = null;
        const cell = this.getCellElement(last.row, last.col);
        if (cell) {
          cell.innerHTML = '';
          cell.classList.remove('occupied', 'last-move', 'last-move-x', 'last-move-o', 'winning-cell');
        }
      }

      // Restore last move indicator to previous move
      if (this.moveHistory.length > 0) {
        const prev = this.moveHistory[this.moveHistory.length - 1];
        const prevCell = this.getCellElement(prev.row, prev.col);
        if (prevCell) {
          prevCell.classList.add('last-move', `last-move-${prev.player.toLowerCase()}`);
        }
        this.currentTurn = prev.player === 'X' ? 'O' : 'X';
      } else {
        this.currentTurn = 'X';
        this.dom.btnUndo.disabled = true;
      }

      this.dom.moveCounter.textContent = this.moveHistory.length;
      this.updateTurnDisplay();
    }

    // --- WIN & DRAW DETECTION ---
    checkWin(row, col, player, boardState = this.board, boardSize = this.size) {
      const directions = [
        [0, 1], // Horizontal
        [1, 0], // Vertical
        [1, 1], // Diagonal \
        [1, -1] // Anti-diagonal /
      ];

      for (const [dr, dc] of directions) {
        const line = [{ row, col }];

        // Check positive direction
        let r = row + dr;
        let c = col + dc;
        let countPos = 0;
        while (r >= 0 && r < boardSize && c >= 0 && c < boardSize && boardState[r][c] === player) {
          line.push({ row: r, col: c });
          countPos++;
          r += dr;
          c += dc;
        }
        const endPosR = r;
        const endPosC = c;

        // Check negative direction
        r = row - dr;
        c = col - dc;
        let countNeg = 0;
        while (r >= 0 && r < boardSize && c >= 0 && c < boardSize && boardState[r][c] === player) {
          line.unshift({ row: r, col: c });
          countNeg++;
          r -= dr;
          c -= dc;
        }
        const endNegR = r;
        const endNegC = c;

        const totalConsecutive = 1 + countPos + countNeg;

        // Condition for 3x3 Tic Tac Toe
        if (this.winCount === 3) {
          if (totalConsecutive >= 3) return line;
          continue;
        }

        // Condition for Caro (5 in a row)
        if (totalConsecutive >= 5) {
          // If Vietnamese Caro rule (Chặn 2 đầu không tính thắng) is enabled:
          if (this.blockTwoEnds && totalConsecutive === 5) {
            const opponent = player === 'X' ? 'O' : 'X';

            const isEndPosBlocked =
              endPosR >= 0 &&
              endPosR < boardSize &&
              endPosC >= 0 &&
              endPosC < boardSize &&
              boardState[endPosR][endPosC] === opponent;

            const isEndNegBlocked =
              endNegR >= 0 &&
              endNegR < boardSize &&
              endNegC >= 0 &&
              endNegC < boardSize &&
              boardState[endNegR][endNegC] === opponent;

            // Blocked at both ends by opponent
            if (isEndPosBlocked && isEndNegBlocked) {
              continue; // Not a win yet
            }
          }
          return line;
        }
      }

      return null;
    }

    checkDraw() {
      for (let r = 0; r < this.size; r++) {
        for (let c = 0; c < this.size; c++) {
          if (this.board[r][c] === null) return false;
        }
      }
      return true;
    }

    handleGameWin(winner, winningCells) {
      this.isGameOver = true;
      this.stopTimer();
      this.winningLine = winningCells;

      // Highlight winning pieces
      winningCells.forEach(({ row, col }) => {
        const cell = this.getCellElement(row, col);
        if (cell) cell.classList.add('winning-cell');
      });

      // Update Scores
      if (winner === 'X') {
        this.scores.x++;
      } else {
        this.scores.o++;
      }
      this.saveScores();
      this.updateScoreboardDisplay();

      // Audio & Confetti
      this.sound.playWinSound();
      this.confetti.fire(4000);

      // Show Winner Modal
      const isPlayerAi = this.mode === 'ai' && winner === 'O';
      const winnerName = isPlayerAi
        ? 'Máy AI'
        : winner === 'X'
        ? 'Người chơi X'
        : 'Người chơi O';

      this.dom.modalTitle.textContent = isPlayerAi ? 'Máy AI Đã Thắng!' : `${winnerName} Chiến Thắng!`;
      this.dom.modalSubtitle.textContent = isPlayerAi
        ? 'Máy AI đã tính toán ra nước cờ quyết định và hạ gục đối thủ!'
        : `Tuyệt vời! ${winnerName} đã tạo chuỗi ${this.winCount} quân liên tiếp xuất sắc!`;
      this.dom.modalAvatar.textContent = isPlayerAi ? '🤖' : '👑';
      this.dom.modalTimeVal.textContent = this.dom.matchTimer.textContent;
      this.dom.modalMovesVal.textContent = this.moveHistory.length;

      setTimeout(() => {
        this.dom.gameOverModal.classList.add('active');
      }, 700);
    }

    handleGameDraw() {
      this.isGameOver = true;
      this.stopTimer();

      this.scores.draw++;
      this.saveScores();
      this.updateScoreboardDisplay();

      this.sound.playDrawSound();

      this.dom.modalTitle.textContent = 'Trận Đấu Hoà!';
      this.dom.modalSubtitle.textContent = 'Cả hai bên đều phòng thủ kiên cường, bất phân thắng bại!';
      this.dom.modalAvatar.textContent = '🤝';
      this.dom.modalTimeVal.textContent = this.dom.matchTimer.textContent;
      this.dom.modalMovesVal.textContent = this.moveHistory.length;

      setTimeout(() => {
        this.dom.gameOverModal.classList.add('active');
      }, 500);
    }

    closeGameOverModal() {
      this.dom.gameOverModal.classList.remove('active');
    }

    openRulesModal() {
      this.dom.rulesModal.classList.add('active');
    }

    closeRulesModal() {
      this.dom.rulesModal.classList.remove('active');
    }

    // --- AI LOGIC (Easy, Medium, Master) ---
    triggerAiMove() {
      this.aiThinking = true;
      this.updateTurnDisplay();

      // Artificial human-like thinking delay
      const thinkTime = this.size === 3 ? 300 : 380 + Math.random() * 200;

      setTimeout(() => {
        if (this.isGameOver) {
          this.aiThinking = false;
          return;
        }

        let bestMove = null;

        if (this.size === 3) {
          bestMove = this.getBestMoveTicTacToe();
        } else {
          switch (this.aiDifficulty) {
            case 'easy':
              bestMove = this.getAiMoveEasy();
              break;
            case 'hard':
              bestMove = this.getAiMoveHard();
              break;
            case 'medium':
            default:
              bestMove = this.getAiMoveMedium();
              break;
          }
        }

        this.aiThinking = false;

        if (bestMove) {
          this.placeMove(bestMove.row, bestMove.col, 'O');
        }
      }, thinkTime);
    }

    // 3x3 Tic Tac Toe Minimax
    getBestMoveTicTacToe() {
      // Find empty cells
      const emptyCells = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          if (this.board[r][c] === null) emptyCells.push({ r, c });
        }
      }

      if (emptyCells.length === 0) return null;

      // 1. Can AI win immediately?
      for (const { r, c } of emptyCells) {
        this.board[r][c] = 'O';
        if (this.checkWin(r, c, 'O', this.board, 3)) {
          this.board[r][c] = null;
          return { row: r, col: c };
        }
        this.board[r][c] = null;
      }

      // 2. Can Player X win next? Block immediately!
      for (const { r, c } of emptyCells) {
        this.board[r][c] = 'X';
        if (this.checkWin(r, c, 'X', this.board, 3)) {
          this.board[r][c] = null;
          return { row: r, col: c };
        }
        this.board[r][c] = null;
      }

      // 3. Take center if available
      if (this.board[1][1] === null) {
        return { row: 1, col: 1 };
      }

      // 4. Take random corner/empty
      return { row: emptyCells[0].r, col: emptyCells[0].c };
    }

    // AI Easy: 80% random near moves, 20% block simple wins
    getAiMoveEasy() {
      const candidates = this.getCandidateCells(2);
      if (candidates.length === 0) {
        const mid = Math.floor(this.size / 2);
        return { row: mid, col: mid };
      }

      // Quick block check
      for (const { r, c } of candidates) {
        this.board[r][c] = 'X';
        if (this.checkWin(r, c, 'X')) {
          this.board[r][c] = null;
          return { row: r, col: c };
        }
        this.board[r][c] = null;
      }

      const randomIdx = Math.floor(Math.random() * candidates.length);
      return { row: candidates[randomIdx].r, col: candidates[randomIdx].c };
    }

    // AI Medium: Tactical evaluator (Blocks threats of 3 & 4, builds own lines)
    getAiMoveMedium() {
      return this.evaluateCaroHeuristic(false);
    }

    // AI Hard: Advanced pattern evaluator with depth consideration
    getAiMoveHard() {
      return this.evaluateCaroHeuristic(true);
    }

    // Get candidate moves: only empty cells within radius of existing stones
    getCandidateCells(radius = 2) {
      if (this.moveHistory.length === 0) {
        const center = Math.floor(this.size / 2);
        return [{ r: center, c: center }];
      }

      const candidates = new Set();

      for (let r = 0; r < this.size; r++) {
        for (let c = 0; c < this.size; c++) {
          if (this.board[r][c] !== null) {
            for (let dr = -radius; dr <= radius; dr++) {
              for (let dc = -radius; dc <= radius; dc++) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size) {
                  if (this.board[nr][nc] === null) {
                    candidates.add(`${nr},${nc}`);
                  }
                }
              }
            }
          }
        }
      }

      return Array.from(candidates).map((str) => {
        const [r, c] = str.split(',').map(Number);
        return { r, c };
      });
    }

    // Gomoku / Caro Pattern Evaluation Engine
    evaluateCaroHeuristic(isHard = true) {
      const candidates = this.getCandidateCells(isHard ? 2 : 1);
      if (candidates.length === 0) {
        const mid = Math.floor(this.size / 2);
        return { row: mid, col: mid };
      }

      let bestScore = -Infinity;
      let bestMove = candidates[0];
      const center = (this.size - 1) / 2;

      for (const { r, c } of candidates) {
        // 1. If AI wins immediately, return this move without hesitation
        this.board[r][c] = 'O';
        if (this.checkWin(r, c, 'O')) {
          this.board[r][c] = null;
          return { row: r, col: c };
        }
        this.board[r][c] = null;

        // 2. If Opponent would win immediately, block this cell with highest priority!
        this.board[r][c] = 'X';
        if (this.checkWin(r, c, 'X')) {
          this.board[r][c] = null;
          return { row: r, col: c };
        }
        this.board[r][c] = null;

        // 3. Evaluate heuristic score for this cell
        const attackScore = this.evaluateCellPattern(r, c, 'O');
        const defenseScore = this.evaluateCellPattern(r, c, 'X');

        // Defense is crucial in Caro: weight opponent's threats heavily
        const weightAttack = 1.05;
        const weightDefense = isHard ? 1.0 : 0.85;

        // Proximity to center bonus (slight preference to control the middle)
        const distFromCenter = Math.hypot(r - center, c - center);
        const centerBonus = (this.size - distFromCenter) * 0.5;

        const totalScore = attackScore * weightAttack + defenseScore * weightDefense + centerBonus;

        if (totalScore > bestScore) {
          bestScore = totalScore;
          bestMove = { row: r, col: c };
        }
      }

      return bestMove;
    }

    // Pattern score for placing `player` at (row, col)
    evaluateCellPattern(row, col, player) {
      const directions = [
        [0, 1], // Horizontal
        [1, 0], // Vertical
        [1, 1], // Diagonal
        [1, -1] // Anti-diagonal
      ];

      const opponent = player === 'X' ? 'O' : 'X';
      let totalValue = 0;

      for (const [dr, dc] of directions) {
        let count = 1;
        let openEnds = 0;

        // Positive ray
        let r = row + dr;
        let c = col + dc;
        while (r >= 0 && r < this.size && c >= 0 && c < this.size && this.board[r][c] === player) {
          count++;
          r += dr;
          c += dc;
        }
        if (r >= 0 && r < this.size && c >= 0 && c < this.size && this.board[r][c] === null) {
          openEnds++;
        }

        // Negative ray
        r = row - dr;
        c = col - dc;
        while (r >= 0 && r < this.size && c >= 0 && c < this.size && this.board[r][c] === player) {
          count++;
          r -= dr;
          c -= dc;
        }
        if (r >= 0 && r < this.size && c >= 0 && c < this.size && this.board[r][c] === null) {
          openEnds++;
        }

        // Score based on count and open ends
        if (count >= 5) {
          totalValue += 100000; // Winning condition
        } else if (count === 4) {
          if (openEnds === 2) {
            totalValue += 15000; // Open 4: Unstoppable win next turn
          } else if (openEnds === 1) {
            totalValue += 3000; // Blocked 4: Strong threat
          }
        } else if (count === 3) {
          if (openEnds === 2) {
            totalValue += 2000; // Open 3: Very dangerous
          } else if (openEnds === 1) {
            totalValue += 350; // Blocked 3
          }
        } else if (count === 2) {
          if (openEnds === 2) {
            totalValue += 120; // Open 2
          } else if (openEnds === 1) {
            totalValue += 20;
          }
        } else if (count === 1 && openEnds === 2) {
          totalValue += 5;
        }
      }

      return totalValue;
    }
  }

  // --- INITIALIZE APPLICATION ON DOM READY ---
  document.addEventListener('DOMContentLoaded', () => {
    window.caroApp = new CaroGame();
  });
})();

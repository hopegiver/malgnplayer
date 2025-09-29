import { createElement, addClass, removeClass } from '../utils/dom.js';

export class PlaylistPanel {
    constructor(player) {
        this.player = player;
        this.container = player.container;
        this.isVisible = false;
        this.panel = null;
        this.toggleButton = null;
        this.playlistItems = [];

        this.init();
    }

    init() {
        this.createPanel();
        this.bindEvents();
        this.applyStyles();
    }

    createPanel() {
        this.panel = createElement('div', { className: 'malgnplayer-playlist-panel' });

        const header = createElement('div', { className: 'malgnplayer-playlist-header' });
        header.innerHTML = `
            <h3>플레이리스트</h3>
            <button class="malgnplayer-playlist-close" aria-label="닫기">×</button>
        `;

        const list = createElement('div', { className: 'malgnplayer-playlist-list' });

        this.panel.appendChild(header);
        this.panel.appendChild(list);
        this.container.appendChild(this.panel);

        // 닫기 버튼 이벤트
        header.querySelector('.malgnplayer-playlist-close').addEventListener('click', () => {
            this.hide();
        });
    }


    updatePlaylist(playlist) {
        this.playlistItems = playlist || [];
        this.renderPlaylist();
        this.updateVisibility();
    }

    renderPlaylist() {
        const listContainer = this.panel.querySelector('.malgnplayer-playlist-list');
        listContainer.innerHTML = '';

        if (this.playlistItems.length === 0) {
            listContainer.innerHTML = '<div class="malgnplayer-playlist-empty">플레이리스트가 비어있습니다</div>';
            return;
        }

        this.playlistItems.forEach((item, index) => {
            const itemElement = createElement('div', { className: 'malgnplayer-playlist-item' });

            // 현재 재생 중인 아이템 표시
            const currentIndex = this.player.getPlaylistIndex();
            if (index === currentIndex) {
                addClass(itemElement, 'active');
            }

            const thumbnail = item.poster || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjkwIiB2aWV3Qm94PSIwIDAgMTYwIDkwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTYwIiBoZWlnaHQ9IjkwIiBmaWxsPSIjNDQ0Ii8+CjxwYXRoIGQ9Ik02MCA0MEw5MCA1N1Y0M0w2MCA0MFoiIGZpbGw9IiM4ODgiLz4KPC9zdmc+';

            itemElement.innerHTML = `
                <div class="malgnplayer-playlist-thumbnail">
                    <img src="${thumbnail}" alt="${item.title || '제목 없음'}" />
                    <div class="malgnplayer-playlist-play-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                </div>
                <div class="malgnplayer-playlist-info">
                    <div class="malgnplayer-playlist-title">${item.title || '제목 없음'}</div>
                    <div class="malgnplayer-playlist-index">${index + 1}/${this.playlistItems.length}</div>
                </div>
            `;

            itemElement.addEventListener('click', async () => {
                // 플레이리스트 아이템 선택
                await this.player.playlistItem(index);
                this.updateActiveItem(index);

                // 자동 재생
                try {
                    await this.player.play();
                } catch (error) {
                    // 브라우저 정책에 의해 자동 재생이 차단될 수 있음
                    console.log('Auto-play blocked by browser policy');
                }

                // 플레이리스트 패널 닫기
                this.hide();
            });

            listContainer.appendChild(itemElement);
        });
    }

    updateActiveItem(index) {
        const items = this.panel.querySelectorAll('.malgnplayer-playlist-item');
        items.forEach((item, i) => {
            if (i === index) {
                addClass(item, 'active');
            } else {
                removeClass(item, 'active');
            }
        });
    }

    updateVisibility() {
        // 플레이리스트가 1개 이하일 때는 패널 숨김
        if (this.playlistItems.length <= 1) {
            this.hide();
        }
    }

    show() {
        this.isVisible = true;
        addClass(this.panel, 'visible');
    }

    hide() {
        this.isVisible = false;
        removeClass(this.panel, 'visible');
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    bindEvents() {
        // 플레이어 이벤트 리스너
        this.player.on('playlistItem', (data) => {
            this.updateActiveItem(data.index);
        });

        // 패널 외부 클릭 시 닫기 (컨트롤 버튼은 제외)
        document.addEventListener('click', (e) => {
            if (this.isVisible &&
                !this.panel.contains(e.target) &&
                !e.target.closest('.malgnplayer-playlist-btn')) {
                this.hide();
            }
        });

        // ESC 키로 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }

    applyStyles() {
        const style = document.createElement('style');
        style.textContent = `

            .malgnplayer-playlist-panel {
                position: absolute;
                top: 0;
                right: 0;
                width: 300px;
                height: 100%;
                background: rgba(20, 20, 20, 0.95);
                color: white;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                z-index: 1500;
                backdrop-filter: blur(20px);
                border-left: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                flex-direction: column;
            }

            .malgnplayer-playlist-panel.visible {
                transform: translateX(0);
            }

            .malgnplayer-playlist-header {
                padding: 8px 16px 6px 16px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-shrink: 0;
                min-height: 36px;
            }

            .malgnplayer-playlist-header h3 {
                margin: 0;
                font-size: 14px;
                font-weight: 600;
                color: rgba(255, 255, 255, 0.95);
                letter-spacing: 0.3px;
            }

            .malgnplayer-playlist-close {
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.7);
                font-size: 18px;
                cursor: pointer;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }

            .malgnplayer-playlist-close:hover {
                background: rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 1);
                transform: scale(1.1);
            }

            .malgnplayer-playlist-list {
                flex: 1;
                overflow-y: auto;
                padding: 8px 15px 15px 15px;
                scroll-behavior: smooth;
            }

            /* 커스텀 스크롤바 스타일 */
            .malgnplayer-playlist-list::-webkit-scrollbar {
                width: 6px;
            }

            .malgnplayer-playlist-list::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 3px;
            }

            .malgnplayer-playlist-list::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 3px;
                transition: background 0.2s ease;
            }

            .malgnplayer-playlist-list::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.4);
            }

            .malgnplayer-playlist-list::-webkit-scrollbar-thumb:active {
                background: rgba(255, 255, 255, 0.6);
            }

            /* Firefox 스크롤바 스타일 */
            .malgnplayer-playlist-list {
                scrollbar-width: thin;
                scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
            }

            .malgnplayer-playlist-empty {
                text-align: center;
                color: rgba(255, 255, 255, 0.6);
                padding: 40px 20px;
                font-size: 14px;
            }

            .malgnplayer-playlist-item {
                display: flex;
                padding: 10px;
                margin-bottom: 6px;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                border: 2px solid transparent;
                position: relative;
                overflow: hidden;
            }

            .malgnplayer-playlist-item:hover {
                background: rgba(255, 255, 255, 0.1);
                transform: translateX(2px);
            }

            .malgnplayer-playlist-item.active {
                background: rgba(255, 107, 107, 0.2);
                border-color: #ff6b6b;
            }

            .malgnplayer-playlist-thumbnail {
                position: relative;
                width: 80px;
                height: 45px;
                border-radius: 6px;
                overflow: hidden;
                flex-shrink: 0;
                margin-right: 12px;
            }

            .malgnplayer-playlist-thumbnail img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.2s ease;
            }

            .malgnplayer-playlist-item:hover .malgnplayer-playlist-thumbnail img {
                transform: scale(1.05);
            }

            .malgnplayer-playlist-play-icon {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 24px;
                height: 24px;
                background: rgba(0, 0, 0, 0.7);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.2s ease;
                backdrop-filter: blur(5px);
            }

            .malgnplayer-playlist-item:hover .malgnplayer-playlist-play-icon,
            .malgnplayer-playlist-item.active .malgnplayer-playlist-play-icon {
                opacity: 1;
            }

            .malgnplayer-playlist-play-icon svg {
                width: 12px;
                height: 12px;
                color: white;
                margin-left: 1px; /* 재생 아이콘 중앙 정렬 */
            }

            .malgnplayer-playlist-info {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                min-width: 0;
            }

            .malgnplayer-playlist-title {
                font-size: 14px;
                font-weight: 500;
                color: white;
                margin-bottom: 4px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .malgnplayer-playlist-index {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.6);
            }

            .malgnplayer-playlist-item.active .malgnplayer-playlist-title {
                color: #ff6b6b;
            }

            .malgnplayer-playlist-item.active .malgnplayer-playlist-index {
                color: rgba(255, 107, 107, 0.8);
            }

            /* 모바일 대응 */
            @media (max-width: 768px) {
                .malgnplayer-playlist-panel {
                    width: 280px;
                }

                .malgnplayer-playlist-toggle {
                    bottom: 15px;
                    right: 15px;
                    width: 40px;
                    height: 40px;
                }

                .malgnplayer-playlist-toggle svg {
                    width: 18px;
                    height: 18px;
                }
            }

            @media (max-width: 480px) {
                .malgnplayer-playlist-panel {
                    width: 100%;
                    max-width: 320px;
                }

                .malgnplayer-playlist-header {
                    padding: 8px 15px 6px 15px;
                    min-height: 32px;
                }

                .malgnplayer-playlist-header h3 {
                    font-size: 13px;
                }

                .malgnplayer-playlist-thumbnail {
                    width: 60px;
                    height: 34px;
                }

                .malgnplayer-playlist-title {
                    font-size: 13px;
                }

                .malgnplayer-playlist-index {
                    font-size: 11px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    destroy() {
        if (this.panel) {
            this.panel.remove();
        }
    }
}
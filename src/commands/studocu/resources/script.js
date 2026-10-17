(function downloadStudocuFree() {
  'use strict';
  const STATE_KEY = '__downloadStudocuFree';
  const STYLE_ID = 'download-studocu-free-style';
  const PANEL_ID = 'download-studocu-free-panel';
  const PRINT_ID = 'download-studocu-free-print';
  const LOG_PREFIX = 'Download Studocu Free';
  const A4_WIDTH_PX = 793.7;
  const A4_HEIGHT_PX = 1122.5;
  const DEFAULT_PAGE_WIDTH_PX = 595.3;
  const DEFAULT_PAGE_HEIGHT_PX = 841.9;
  const PRINT_DELAY_MS = 300;
  const COPIED_STYLE_PROPERTIES = [
    'position',
    'left',
    'top',
    'right',
    'bottom',
    'width',
    'height',
    'font-family',
    'font-size',
    'font-weight',
    'font-style',
    'line-height',
    'letter-spacing',
    'word-spacing',
    'color',
    'background-color',
    'text-align',
    'text-align-last',
    'white-space',
    'display',
    'visibility',
    'opacity',
    'z-index',
    'transform',
    'transform-origin',
    'padding',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'margin',
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
    'border',
    'border-radius',
    'text-shadow',
    'unicode-bidi',
    'font-feature-settings',
  ];
  if (window[STATE_KEY] && window[STATE_KEY].destroy) {
    window[STATE_KEY].destroy();
  }
  const state = {
    pages: new Map(),
    expectedPages: 0,
    observer: null,
    scanTimer: null,
    lastStatus: null,
  };
  window[STATE_KEY] = state;
  function injectStyles() {
    document.getElementById(STYLE_ID)?.remove();
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
            #${PANEL_ID} {
                --selection-blue: #2453ff;
                position: fixed;
                right: 20px;
                bottom: 20px;
                z-index: 2147483647;
                width: 350px;
                max-width: calc(100vw - 40px);
                max-height: calc(100dvh - 40px);
                overflow-y: auto;
                padding: 26px 24px 20px;
                border: 1px solid #e5e7eb;
                border-radius: 4px;
                box-shadow: 6px 6px 0 rgba(36, 83, 255, .08), 0 12px 32px rgba(0, 0, 0, .1);
                background: #fff;
                color: #242424;
                text-align: left;
                font: 13px/1.65 "Avenir Next", "Trebuchet MS", Arial, sans-serif;
                color-scheme: light;
            }
            #${PANEL_ID},
            #${PANEL_ID} * {
                box-sizing: border-box;
            }
            #${PANEL_ID} .panel-header {
                margin-bottom: 24px;
            }
            #${PANEL_ID} .eyebrow {
                display: inline-block;
                margin-bottom: 14px;
                padding: 0 5px;
                background: linear-gradient(transparent 30%, #fff0a6 30%, #fff0a6 88%, transparent 88%);
                color: #168bc9;
                font: 12px/1.6 ui-monospace, SFMono-Regular, Consolas, monospace;
                letter-spacing: .5px;
            }
            #${PANEL_ID} .selection-frame {
                position: relative;
                border: 2px solid var(--selection-blue);
                border-radius: 0;
            }
            #${PANEL_ID} .selection-handle {
                position: absolute;
                width: 8px;
                height: 8px;
                border: 2px solid var(--selection-blue);
                background: #fff;
                pointer-events: none;
            }
            #${PANEL_ID} .selection-handle.top-left { top: -5px; left: -5px; }
            #${PANEL_ID} .selection-handle.top-right { top: -5px; right: -5px; }
            #${PANEL_ID} .selection-handle.bottom-left { bottom: -5px; left: -5px; }
            #${PANEL_ID} .selection-handle.bottom-right { bottom: -5px; right: -5px; }
            #${PANEL_ID} .title {
                margin: 0;
                padding: 9px 10px;
                background: #eef2ff;
                color: var(--selection-blue);
                font-size: 21px;
                font-weight: 500;
                line-height: 1.3;
                letter-spacing: -.8px;
                transform: rotate(-1deg);
            }
            #${PANEL_ID} .subtitle {
                margin-top: 13px;
                color: #737373;
                font-size: 12px;
            }
            #${PANEL_ID} .status-card {
                margin-bottom: 24px;
            }
            #${PANEL_ID} .status-heading {
                display: inline-block;
                margin-bottom: 8px;
                padding: 0 4px;
                background: #baf3dc;
                color: #25453c;
                font-size: 12px;
                font-weight: 600;
            }
            #${PANEL_ID} .hint {
                color: #595959;
                font-size: 13px;
                line-height: 1.75;
                overflow-wrap: anywhere;
            }
            #${PANEL_ID} svg {
                display: block;
                width: 19px;
                height: 19px;
                flex-shrink: 0;
            }
            #${PANEL_ID} button.primary {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                width: 100%;
                min-height: 46px;
                margin: 0;
                padding: 11px 8px;
                background: #eef2ff;
                color: var(--selection-blue);
                cursor: pointer;
                font: inherit;
                font-weight: 600;
                transition: background .15s ease, color .15s ease;
            }
            #${PANEL_ID} button.primary:hover:not(:disabled) {
                background: var(--selection-blue);
                color: #fff;
            }
            #${PANEL_ID} button.primary:active:not(:disabled) {
                background: #173cd3;
            }
            #${PANEL_ID} button.primary:focus-visible {
                outline: 2px dashed var(--selection-blue);
                outline-offset: 6px;
            }
            #${PANEL_ID} button.primary:disabled {
                --selection-blue: #a3b2df;
                background: #f7f8fc;
                color: #7885a7;
                cursor: not-allowed;
            }
            #${PANEL_ID} .footer-note {
                margin-top: 17px;
                color: #737373;
                text-align: center;
                font-size: 11px;
            }
            #${PANEL_ID} .footer-note span {
                color: #168bc9;
                font-style: italic;
                text-decoration: underline;
                text-decoration-color: #ffac66;
                text-decoration-thickness: 2px;
                text-underline-offset: 4px;
            }
            @media (prefers-reduced-motion: reduce) {
                #${PANEL_ID} button.primary {
                    transition: none;
                }
            }
            #${PRINT_ID} {
                display: none;
            }
            #${PRINT_ID} .std-page {
                position: relative;
                overflow: hidden;
                margin: 0 auto 12px auto;
                width: ${A4_WIDTH_PX}px;
                height: ${A4_HEIGHT_PX}px;
                background: #fff;
                box-shadow: 0 0 0 1px rgba(0,0,0,.08);
                page-break-after: always;
                break-after: page;
            }
            #${PRINT_ID} .page-content {
                position: absolute;
                left: 0;
                top: 0;
                transform-origin: top left;
                background: #fff;
                border: 0 !important;
                outline: 0 !important;
                box-shadow: none !important;
            }
            #${PRINT_ID} .page-content::after {
                content: "";
                position: absolute;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 2147483646;
                height: 2px;
                background: #fff;
                pointer-events: none;
            }
            #${PRINT_ID} .layer-bg,
            #${PRINT_ID} .layer-text {
                position: absolute;
                inset: 0;
                overflow: hidden;
                border: 0 !important;
                outline: 0 !important;
                box-shadow: none !important;
            }
            #${PRINT_ID} .layer-bg img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                object-position: top center;
                display: block;
            }
            #${PRINT_ID} .layer-text {
                z-index: 2;
            }
            @media print {
                @page {
                    size: A4 portrait;
                    margin: 0;
                }
                body > *:not(#${PRINT_ID}) {
                    display: none !important;
                }
                html,
                body,
                #${PRINT_ID} {
                    display: block !important;
                    width: 100% !important;
                    height: auto !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    background: #fff !important;
                }
                #${PRINT_ID} .std-page {
                    width: 210mm !important;
                    height: 297mm !important;
                    margin: 0 auto !important;
                    box-shadow: none !important;
                }
            }
        `;
    document.head.appendChild(style);
  }
  function createPanel() {
    document.getElementById(PANEL_ID)?.remove();
    const panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', 'Download Studocu Free');
    // Các ô vuông là trang trí mô phỏng khung chọn, không phải tay nắm kéo thả.
    const selectionHandles = ['top-left', 'top-right', 'bottom-left', 'bottom-right']
      .map((corner) => `<span class="selection-handle ${corner}" aria-hidden="true"></span>`)
      .join('');
    panel.innerHTML = `
            <div class="panel-header">
                <div class="eyebrow">&gt; save your reading.</div>
                <div class="title selection-frame">Download Studocu Free${selectionHandles}</div>
                <div class="subtitle">Lưu tài liệu để đọc mọi lúc.</div>
            </div>
            <div class="status-card">
                <div class="status-heading">Trạng thái tài liệu</div>
                <div class="hint" data-role="status" role="status" aria-live="polite" aria-atomic="true">
                Đang quét tài liệu. Vui lòng kéo xuống cuối trang Studocu và kiểm tra đã quét đủ số trang rồi hãy ấn Download Studocu Free nhé.
                </div>
            </div>
            <div class="actions">
                <button type="button" class="primary selection-frame" data-action="print" disabled>
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 3v12m-4-4 4 4 4-4M5 16v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3"/>
                    </svg>
                    <span>Download Studocu Free</span>
                    ${selectionHandles}
                </button>
            </div>
            <div class="footer-note">Chọn <span>Save to PDF</span> trong hộp thoại in để lưu.</div>
        `;
    panel.querySelector('[data-action="print"]').addEventListener('click', printCollectedPages);
    document.body.appendChild(panel);
    return panel;
  }
  function updateStatus(message) {
    if (state.lastStatus === message) return;
    state.lastStatus = message;
    const status = document.querySelector(`#${PANEL_ID} [data-role="status"]`);
    if (status) status.textContent = message;
  }
  function logError(message, error) {
    console.error(`[${LOG_PREFIX}] [ERROR] ${message}`, ...(error === undefined ? [] : [error]));
  }
  function getPageNumber(page, fallbackIndex) {
    const raw =
      page.getAttribute('data-page-index') ||
      page.getAttribute('data-page-number') ||
      page
        .querySelector('[data-page-index], [data-page-number]')
        ?.getAttribute('data-page-index') ||
      page.querySelector('[data-page-index], [data-page-number]')?.getAttribute('data-page-number');
    const value = Number.parseInt(raw, 10);
    if (!Number.isFinite(value)) return fallbackIndex + 1;
    return page.hasAttribute('data-page-index') ? value + 1 : value;
  }
  function getPageSize(page) {
    const pageContent = page.querySelector('.pc');
    const target = pageContent || page;
    const style = window.getComputedStyle(target);
    const rect = target.getBoundingClientRect();
    const width = Number.parseFloat(style.width) || rect.width || DEFAULT_PAGE_WIDTH_PX;
    const height = Number.parseFloat(style.height) || rect.height || DEFAULT_PAGE_HEIGHT_PX;
    return { width, height };
  }
  function copyComputedStyle(source, target) {
    const computed = window.getComputedStyle(source);
    for (const property of COPIED_STYLE_PROPERTIES) {
      const value = computed.getPropertyValue(property);
      if (value && value !== 'auto' && value !== 'normal' && value !== 'none') {
        target.style.setProperty(property, value, 'important');
      }
    }
    target.style.setProperty('max-width', 'none', 'important');
    target.style.setProperty('max-height', 'none', 'important');
    target.style.setProperty('clip', 'auto', 'important');
    target.style.setProperty('clip-path', 'none', 'important');
  }
  function deepCloneWithStyles(element) {
    const clone = element.cloneNode(false);
    copyComputedStyle(element, clone);
    if (element.classList && element.classList.contains('pc')) {
      clone.style.setProperty('overflow', 'visible', 'important');
      clone.style.setProperty('border', 'none', 'important');
      clone.style.setProperty('outline', 'none', 'important');
      clone.style.setProperty('box-shadow', 'none', 'important');
    }
    for (const child of element.childNodes) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        clone.appendChild(deepCloneWithStyles(child));
      } else if (child.nodeType === Node.TEXT_NODE) {
        clone.appendChild(child.cloneNode(true));
      }
    }
    return clone;
  }
  // Giữ khoảng cách giữa các từ, chỉ nối các chữ bị chèn khoảng trắng đơn.
  function normalizeCharacterSpacing(text) {
    const trimmed = text.trim();
    const tokens = trimmed ? trimmed.split(/\s+/u) : [];
    const singleLetterCount = tokens.filter((token) => /^\p{L}$/u.test(token)).length;
    const looksCharacterSpaced = tokens.length >= 6 && singleLetterCount / tokens.length >= 0.65;
    if (!looksCharacterSpaced) return text;
    const wordSpaceMarker = '\uE000';
    return text
      .replace(/[ \t]{2,}/g, wordSpaceMarker)
      .replace(/(\p{L})[ \t](?=\p{L})/gu, '$1')
      .replaceAll(wordSpaceMarker, ' ');
  }
  function fixArtificialCharacterSpacing(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const elementsToNormalize = new Set();
    let textNode = walker.nextNode();
    while (textNode) {
      const raw = textNode.nodeValue || '';
      const normalized = normalizeCharacterSpacing(raw);
      if (normalized !== raw) {
        textNode.nodeValue = normalized;
        if (textNode.parentElement) elementsToNormalize.add(textNode.parentElement);
      }
      textNode = walker.nextNode();
    }
    root.querySelectorAll('.t, span').forEach((element) => {
      const text = (element.textContent || '').trim();
      const letterCount = (text.match(/\p{L}/gu) || []).length;
      if (letterCount < 8) return;
      const fontSize = Number.parseFloat(element.style.fontSize) || 16;
      const letterSpacing = Number.parseFloat(element.style.letterSpacing);
      const wordSpacing = Number.parseFloat(element.style.wordSpacing);
      const hasExcessiveLetterSpacing =
        Number.isFinite(letterSpacing) && letterSpacing > Math.max(1.5, fontSize * 0.18);
      const hasExcessiveWordSpacing =
        Number.isFinite(wordSpacing) && wordSpacing > Math.max(3, fontSize * 0.5);
      if (hasExcessiveLetterSpacing || hasExcessiveWordSpacing) {
        elementsToNormalize.add(element);
      }
    });
    elementsToNormalize.forEach((element) => {
      element.style.setProperty('letter-spacing', 'normal', 'important');
      element.style.setProperty('word-spacing', 'normal', 'important');
      element.style.setProperty('text-align-last', 'auto', 'important');
    });
    return elementsToNormalize.size;
  }
  function createBackgroundLayer(image) {
    const layer = document.createElement('div');
    layer.className = 'layer-bg';
    const imageClone = image.cloneNode(true);
    imageClone.removeAttribute('loading');
    imageClone.style.cssText =
      'width:100%;height:100%;object-fit:cover;object-position:top center;display:block;';
    layer.appendChild(imageClone);
    return layer;
  }
  function createTextLayer(pageContent) {
    const layer = document.createElement('div');
    layer.className = 'layer-text';
    const contentClone = deepCloneWithStyles(pageContent);
    fixArtificialCharacterSpacing(contentClone);
    contentClone.querySelectorAll('img').forEach((image) => {
      image.style.setProperty('display', 'none', 'important');
    });
    layer.appendChild(contentClone);
    return layer;
  }
  function appendPageLayers(page, content) {
    const backgroundImage = page.querySelector('img.bi') || page.querySelector('img[src]');
    if (backgroundImage) {
      content.appendChild(createBackgroundLayer(backgroundImage));
    }
    const pageContent = page.querySelector('.pc');
    if (pageContent) {
      content.appendChild(createTextLayer(pageContent));
    } else if (!backgroundImage) {
      const pageClone = deepCloneWithStyles(page);
      pageClone.style.setProperty('position', 'absolute', 'important');
      pageClone.style.setProperty('inset', '0', 'important');
      content.appendChild(pageClone);
    }
  }
  function clonePage(page, pageNumber) {
    const { width, height } = getPageSize(page);
    const scale = Math.min(A4_WIDTH_PX / width, A4_HEIGHT_PX / height);
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;
    const offsetX = (A4_WIDTH_PX - scaledWidth) / 2;
    const offsetY = (A4_HEIGHT_PX - scaledHeight) / 2;
    const newPage = document.createElement('div');
    newPage.className = 'std-page';
    newPage.dataset.pageNumber = String(pageNumber);
    newPage.style.width = `${A4_WIDTH_PX}px`;
    newPage.style.height = `${A4_HEIGHT_PX}px`;
    const content = document.createElement('div');
    content.className = 'page-content';
    content.style.width = `${width}px`;
    content.style.height = `${height}px`;
    content.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    newPage.appendChild(content);
    appendPageLayers(page, content);
    return newPage;
  }
  function findVisibleStudocuPages() {
    const pages = Array.from(document.querySelectorAll('div[data-page-index]'));
    if (pages.length) return pages;
    return Array.from(document.querySelectorAll('[data-page-number], [id*="page" i]')).filter(
      (page) => page.querySelector('.pc, img.bi, img[src], canvas'),
    );
  }
  function hasAllExpectedPages() {
    if (state.expectedPages < 1 || state.pages.size !== state.expectedPages) return false;
    for (let pageNumber = 1; pageNumber <= state.expectedPages; pageNumber++) {
      if (!state.pages.has(pageNumber)) return false;
    }
    return true;
  }
  function updateDownloadButton() {
    const button = document.querySelector(`#${PANEL_ID} [data-action="print"]`);
    if (button) button.disabled = !hasAllExpectedPages();
  }
  function scanVisiblePages() {
    const visiblePages = findVisibleStudocuPages();
    let added = 0;
    // Xác định số trang trước khi lưu các trang đã tải vào bộ nhớ.
    visiblePages.forEach((page, fallbackIndex) => {
      state.expectedPages = Math.max(state.expectedPages, getPageNumber(page, fallbackIndex));
    });
    visiblePages.forEach((page, fallbackIndex) => {
      const pageNumber = getPageNumber(page, fallbackIndex);
      const bounds = page.getBoundingClientRect();
      if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;
      const pageContent = page.querySelector('.pc');
      if (pageContent && pageContent.getBoundingClientRect().width === 0) return;
      if (state.pages.has(pageNumber)) return;
      const clone = clonePage(page, pageNumber);
      if (!clone.querySelector('.layer-bg, .layer-text, img, canvas, .pc')) return;
      state.pages.set(pageNumber, clone);
      added++;
    });
    const collected = state.pages.size;
    const complete = hasAllExpectedPages();
    updateDownloadButton();
    updateStatus(
      complete
        ? `Đã quét đủ ${collected}/${state.expectedPages} trang. Bạn có thể tải tài liệu.`
        : `Đã quét ${collected}/${state.expectedPages || '?'} trang. Nút tải sẽ được bật khi quét đủ; nếu còn thiếu, hãy lướt lại từ đầu xuống cuối file.`,
    );
    return added;
  }
  function scheduleScan() {
    if (state.scanTimer !== null) return;
    state.scanTimer = window.requestAnimationFrame(() => {
      state.scanTimer = null;
      scanVisiblePages();
    });
  }
  function buildPrintContainer() {
    document.getElementById(PRINT_ID)?.remove();
    const printContainer = document.createElement('div');
    printContainer.id = PRINT_ID;
    const sortedPages = Array.from(state.pages.entries())
      .sort(([firstPageNumber], [secondPageNumber]) => firstPageNumber - secondPageNumber)
      .map(([, page]) => page.cloneNode(true));
    for (const page of sortedPages) {
      printContainer.appendChild(page);
    }
    document.body.appendChild(printContainer);
    return sortedPages.length;
  }
  function stopTool({ removeOutput = false, removeStyles = false, clearState = false } = {}) {
    state.observer?.disconnect();
    state.observer = null;
    if (state.scanTimer !== null) {
      window.cancelAnimationFrame(state.scanTimer);
      state.scanTimer = null;
    }
    window.removeEventListener('scroll', scheduleScan);
    window.removeEventListener('resize', scheduleScan);
    document.getElementById(PANEL_ID)?.remove();
    if (removeOutput) document.getElementById(PRINT_ID)?.remove();
    if (removeStyles) document.getElementById(STYLE_ID)?.remove();
    if (clearState && window[STATE_KEY] === state) delete window[STATE_KEY];
  }
  function cleanupAfterPrint() {
    document.getElementById(PRINT_ID)?.remove();
    document.getElementById(STYLE_ID)?.remove();
    if (window[STATE_KEY] === state) delete window[STATE_KEY];
  }
  function printCollectedPages() {
    scanVisiblePages();
    if (!hasAllExpectedPages()) {
      const message = `Tài liệu chưa được quét đủ trang (${state.pages.size}/${state.expectedPages || '?'}). Hãy lướt lại từ đầu xuống cuối file.`;
      logError(message);
      window.alert(message);
      return;
    }
    const count = buildPrintContainer();
    if (!count) {
      const message =
        'Chưa quét được trang nào. Vui lòng kéo xuống cuối trang Studocu và kiểm tra đã quét đủ số trang rồi hãy ấn Download Studocu Free nhé.';
      logError(message);
      window.alert(message);
      return;
    }
    updateStatus(`Đang mở hộp thoại in với ${count} trang. Hãy chọn Save to PDF để lưu tài liệu.`);
    stopTool();
    window.addEventListener('afterprint', cleanupAfterPrint, { once: true });
    window.setTimeout(() => window.print(), PRINT_DELAY_MS);
  }
  function start() {
    injectStyles();
    createPanel();
    scanVisiblePages();
    state.observer = new MutationObserver(scheduleScan);
    state.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    window.addEventListener('scroll', scheduleScan, { passive: true });
    window.addEventListener('resize', scheduleScan, { passive: true });
    state.destroy = function destroy() {
      stopTool({ removeOutput: true, removeStyles: true, clearState: true });
    };
    updateStatus(
      'Công cụ đã sẵn sàng. Vui lòng kéo xuống cuối trang Studocu và kiểm tra đã quét đủ số trang rồi hãy ấn Download Studocu Free nhé.',
    );
  }
  start();
})();

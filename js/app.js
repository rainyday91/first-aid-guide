// js/app.js
import { KITS_DATA } from './data.js';

const STORAGE_KEY = 'first_aid_checked_items_v1';

// Загружаем сохранённые отметки из localStorage
let checkedItems = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
let activeKitId = 'home';

const tabsContainer = document.getElementById('kit-tabs');
const contentContainer = document.getElementById('kit-content');

// 1. Инициализация приложения
function init() {
  renderTabs();
  renderKit(activeKitId);
  setupQuickJumpLinks();
}

// 2. Отрисовка кнопок-вкладок
function renderTabs() {
  tabsContainer.innerHTML = '';

  Object.values(KITS_DATA).forEach((kit) => {
    const button = document.createElement('button');
    button.className = `tab-btn ${kit.id === activeKitId ? 'active' : ''}`;
    button.textContent = kit.tabTitle;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', kit.id === activeKitId);

    button.addEventListener('click', () => {
      activeKitId = kit.id;
      renderTabs();
      renderKit(activeKitId);
    });

    tabsContainer.appendChild(button);
  });
}

// 3. Отрисовка выбранной аптечки и чеклиста
function renderKit(kitId) {
  const kit = KITS_DATA[kitId];
  const totalCount = kit.items.length;
  const doneCount = kit.items.filter((item) => checkedItems[item.id]).length;
  const percent = Math.round((doneCount / totalCount) * 100);

  const medsBadge = kit.hasMeds
    ? '<span class="badge badge-meds">Содержит лекарства (МНН)</span>'
    : '<span class="badge badge-nomeds">Без лекарств (по стандарту)</span>';

  contentContainer.innerHTML = `
    <div class="kit-header">
      <div>
        <h3>${kit.title}</h3>
        <p class="kit-standard"><strong>Основа:</strong> ${kit.standard}</p>
        ${medsBadge}
      </div>
      <div class="kit-actions no-print">
        <button id="print-btn" class="btn-secondary">Распечатать</button>
        <button id="reset-btn" class="btn-secondary">Сбросить отметки</button>
      </div>
    </div>

    <p class="storage-alert"><strong>Хранение:</strong> ${kit.storageNote}</p>

    <div class="progress-wrap no-print">
      <div class="progress-text">Собрано: <strong>${doneCount} из ${totalCount}</strong> (${percent}%)</div>
      <div class="progress-bar"><div class="progress-fill" style="width: ${percent}%"></div></div>
    </div>

    <ul class="checklist">
      ${kit.items.map((item) => `
        <li class="checklist-item ${checkedItems[item.id] ? 'is-done' : ''}">
          <label class="checklist-label">
            <input type="checkbox" data-item-id="${item.id}" ${checkedItems[item.id] ? 'checked' : ''}>
            <div class="item-info">
              <span class="item-name">${item.name} — <strong>${item.qty}</strong></span>
              <span class="item-purpose">${item.purpose}</span>
            </div>
          </label>
        </li>
      `).join('')}
    </ul>
  `;

  // Вешаем обработчики на чекбоксы
  contentContainer.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener('change', (e) => {
      const id = e.target.dataset.itemId;
      if (e.target.checked) {
        checkedItems[id] = true;
      } else {
        delete checkedItems[id];
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedItems));
      renderKit(activeKitId); // Перерисовываем счётчик прогресса
    });
  });

  // Кнопка печати
  document.getElementById('print-btn').addEventListener('click', () => {
    window.print();
  });

  // Кнопка сброса только текущей аптечки
  document.getElementById('reset-btn').addEventListener('click', () => {
    kit.items.forEach((item) => delete checkedItems[item.id]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedItems));
    renderKit(activeKitId);
  });
}

// 4. Переключение вкладки при клике по кнопкам на первом экране
function setupQuickJumpLinks() {
  document.querySelectorAll('[data-jump]').forEach((link) => {
    link.addEventListener('click', () => {
      activeKitId = link.dataset.jump;
      renderTabs();
      renderKit(activeKitId);
    });
  });
}

init();
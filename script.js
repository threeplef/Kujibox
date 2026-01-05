/***********************
 * CONFIG (원하는 대로 수정)
 ***********************/
const DEFAULT_TOTAL = 200;

// "번호"에 대응되는 상품 목록(예시). 필요하면 마음대로 수정하세요.
// - key: 번호(문자열/숫자)
// - value: { name: 상품명, remaining: 표시에 쓸 수량(옵션) }

// localStorage keys
const LS_KEY_PRIZES = "kuji_prizes";
// const LS_KEY_NUMBERS = "kuji_numbers";

// 기본 상품 목록(기존 PRIZES 내용을 그대로 여기로 옮기세요)
const DEFAULT_PRIZES = {
  11: { name: "상품1", remaining: 1 },
  22: { name: "상품2", remaining: 1 },
  33: { name: "상품3", remaining: 1 },
  44: { name: "상품4", remaining: 1 },
  55: { name: "상품5", remaining: 1 },
  66: { name: "상품6", remaining: 1 },
  77: { name: "상품7", remaining: 1 },
  88: { name: "상품8", remaining: 1 },
};

let PRIZES = DEFAULT_PRIZES; // 런타임에 설정값으로 덮어씀

/***********************
 * STATE (localStorage 저장)
 ***********************/
const LS_KEY = "kuji_app_state_v1";

/**
 * state = {
 *   total: number,
 *   assignments: number[],   // index -> revealed number
 *   opened: boolean[],       // index -> opened?
 *   history: {name, number, kujiIndex, tsISO}[],
 *   sessionName: string|null // 현재 기록중인 이름(Enter/시작으로 설정)
 * }
 */
let state = loadState();

/***********************
 * DOM
 ***********************/
const gridEl = document.getElementById("grid");
const historyBodyEl = document.getElementById("historyBody");
const histCountEl = document.getElementById("histCount");
const remainingCountEl = document.getElementById("remainingCount");
const prizeListEl = document.getElementById("prizeList");

const btnOpenSettingsEl = document.getElementById("btnOpenSettings");
const settingsModalEl = document.getElementById("settingsModal");
const btnCloseSettingsEl = document.getElementById("btnCloseSettings");
const btnSaveSettingsEl = document.getElementById("btnSaveSettings");
// const settingsNumbersEl = document.getElementById("settingsNumbers");
const settingsPrizesEl = document.getElementById("settingsPrizes");

const nameInputEl = document.getElementById("nameInput");
const btnStartEl = document.getElementById("btnStart");
const btnResetSessionEl = document.getElementById("btnResetSession");
const btnDownloadEl = document.getElementById("btnDownload");

const statusTextEl = document.getElementById("statusText");
const currentNameBadgeEl = document.getElementById("currentNameBadge");

const totalInputEl = document.getElementById("totalInput");
const btnRebuildEl = document.getElementById("btnRebuild");

// Kuji open modal
const kujiOpenModalEl = document.getElementById("kujiOpenModal");
const btnCloseKujiOpenEl = document.getElementById("btnCloseKujiOpen");
const kujiOpenSheetEl = document.getElementById("kujiOpenSheet");
const kujiOpenHintEl = document.getElementById("kujiOpenHint");

// Settings UI (intuitive)
// const poolSingleEl = document.getElementById("poolSingle");
// const poolFromEl = document.getElementById("poolFrom");
// const poolToEl = document.getElementById("poolTo");
// const btnPoolAddSingleEl = document.getElementById("btnPoolAddSingle");
// const btnPoolAddRangeEl = document.getElementById("btnPoolAddRange");
// const btnPoolClearEl = document.getElementById("btnPoolClear");
// const poolChipsEl = document.getElementById("poolChips");

const btnPrizeAddRowEl = document.getElementById("btnPrizeAddRow");
const prizeRowsEl = document.getElementById("prizeRows");

const kujiUnderNumberEl = document.getElementById("kujiUnderNumber");
const kujiOpenStageEl = document.getElementById("kujiOpenStage");

// Custom alert modal
const alertModalEl = document.getElementById("alertModal");
const alertMessageEl = document.getElementById("alertMessage");
const btnCloseAlertEl = document.getElementById("btnCloseAlert");
// const btnOkAlertEl = document.getElementById("btnOkAlert");

// Custom confirm modal
const confirmModalEl = document.getElementById("confirmModal");
const confirmMessageEl = document.getElementById("confirmMessage");
const btnCancelConfirmEl = document.getElementById("btnCancelConfirm");
const btnOkConfirmEl = document.getElementById("btnOkConfirm");

/***********************
 * INIT
 ***********************/
loadConfigFromStorage();
totalInputEl.value = String(state.total ?? DEFAULT_TOTAL);
renderAll();

/***********************
 * EVENTS
 ***********************/
// Enter로 시작
nameInputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    startSessionFromInput();
  }
});

btnStartEl.addEventListener("click", () => startSessionFromInput());
btnOpenSettingsEl.addEventListener("click", openSettings);
btnCloseSettingsEl.addEventListener("click", closeSettings);
btnSaveSettingsEl.addEventListener("click", saveSettingsAndApply);

// 바깥 클릭 시 닫기(원하면 제거 가능)
settingsModalEl.addEventListener("click", (e) => {
  if (e.target === settingsModalEl) closeSettings();
});

// 초기화: "이미 깐 쿠지 유지", "기록(세션) 멈춤", "이름만 지움"
btnResetSessionEl.addEventListener("click", () => {
  state.sessionName = null;
  nameInputEl.value = "";
  saveState();
  renderStatus();
});

btnCloseAlertEl.addEventListener("click", closeAlert);
// btnOkAlertEl.addEventListener("click", closeAlert);

// Confirm modal events
btnCancelConfirmEl.addEventListener("click", () => resolveConfirm(false));
btnOkConfirmEl.addEventListener("click", () => resolveConfirm(true));

// 바깥 클릭으로 닫히지 않게(원하면 e.target === alertModalEl 일 때 닫기로 바꿔도 됨)
alertModalEl.addEventListener("click", (e) => {
  e.stopPropagation();
});

// 바깥 클릭으로 닫히지 않게(배경 조작 차단만)
confirmModalEl.addEventListener("click", (e) => {
  e.stopPropagation();
});

// btnPoolAddSingleEl.addEventListener("click", () => {
//   const n = Number(poolSingleEl.value);
//   if (!Number.isFinite(n)) return;
//   addToPool([n]);
//   poolSingleEl.value = "";
// });

// btnPoolAddRangeEl.addEventListener("click", () => {
//   const a = Number(poolFromEl.value);
//   const b = Number(poolToEl.value);
//   if (!Number.isFinite(a) || !Number.isFinite(b)) return;

//   const start = Math.min(a, b);
//   const end = Math.max(a, b);
//   const arr = [];
//   for (let i = start; i <= end; i++) arr.push(i);
//   addToPool(arr);

//   poolFromEl.value = "";
//   poolToEl.value = "";
// });

// btnPoolClearEl.addEventListener("click", () => {
//   setPool([]);
// });

btnPrizeAddRowEl.addEventListener("click", () => {
  appendPrizeRow({ num: "", name: "", remaining: 1 });
});

// 엑셀 다운로드
btnDownloadEl.addEventListener("click", () => downloadExcel());

// 재생성: total/assignment/opened를 다시 만들고, 기록은 유지할지 선택 여지 있음
// 여기서는 안전하게: "전체 쿠지 재생성"은 상태를 새로 만들고 기록도 같이 초기화하도록 구현(실수 방지 위해 confirm)
btnRebuildEl.addEventListener("click", async () => {
  const nextTotal = parseInt(totalInputEl.value, 10);
  if (!Number.isFinite(nextTotal) || nextTotal <= 0) {
    showAlert("총 쿠지 수를 올바르게 입력해 주세요.");
    return;
  }

  const ok = await showConfirm(
    "쿠지를 재생성하면 오픈 현황 및 기록이 모두 초기화됩니다.\n진행할까요?"
  );
  if (!ok) return;

  state = makeFreshState(nextTotal);
  saveState();
  renderAll();
});

btnCloseKujiOpenEl.addEventListener("click", closeKujiOpenModal);

// 바깥 클릭으로 닫히지 않게(배경 조작 차단만 유지)
kujiOpenModalEl.addEventListener("click", (e) => {
  // 오버레이 클릭해도 닫지 않음
  e.stopPropagation();
});

/***********************
 * FUNCTIONS
 ***********************/
function startSessionFromInput() {
  const name = (nameInputEl.value || "").trim();
  if (!name) {
    showAlert("이름을 입력해 주세요.");
    nameInputEl.focus();
    return;
  }
  state.sessionName = name;
  saveState();
  renderStatus();
}

// function onClickKuji(index, el) {
//   if (state.opened[index]) return;

//   // 이름(세션)이 없으면 기록 시작 전이므로 까기 금지 (기존 로직 유지)
//   if (!state.sessionName) {
//     alert("이름 입력 후 Enter(또는 시작)를 눌러 기록을 시작해 주세요.");
//     nameInputEl.focus();
//     return;
//   }

//   openKujiOpenModal(index, el);

//   state.opened[index] = true;

//   const revealedNumber = state.assignments[index];
//   state.history.unshift({
//     name: state.sessionName,
//     number: revealedNumber,
//     kujiIndex: index + 1,
//     tsISO: new Date().toISOString(),
//   });

//   saveState();
//   renderAll();
// }

function onClickKuji(index, el) {
  if (state.opened[index]) return;

  if (!state.sessionName) {
    showAlert("이름 입력 후 Enter(또는 시작)를 눌러 기록을 시작해 주세요.");
    nameInputEl.focus();
    return;
  }

  openKujiOpenModal(index); // ✅ 모달만 열기(여기서 절대 opened 처리 금지)
}

function commitOpenKuji(index) {
  if (state.opened[index]) return;

  state.opened[index] = true;

  const revealedNumber = state.assignments[index];
  state.history.unshift({
    name: state.sessionName,
    number: revealedNumber,
    kujiIndex: index + 1,
    tsISO: new Date().toISOString(),
  });

  saveState();
  renderAll();
}

function openKujiOpenModal(index) {
  activeKujiIndex = index;
  pendingOpen = false;

  // ✅ 모달 아래에 "해당 쿠지 숫자"를 미리 깔아둠
  kujiUnderNumberEl.textContent = String(state.assignments[index]);

  // ✅ 진행률 p 초기화 (0: 아직 안 깜)
  kujiOpenStageEl.style.setProperty("--p", "0");

  // 모달 열기
  kujiOpenModalEl.classList.remove("hidden");
  kujiOpenModalEl.setAttribute("aria-hidden", "false");

  // 드래그 시작 상태 리셋
  // kujiOpenSheetEl.style.transform = "translateX(0px)";
  kujiOpenSheetEl.classList.remove("dragging");
  kujiOpenHintEl.classList.remove("done");
  kujiOpenHintEl.textContent = "왼쪽 → 오른쪽으로 드래그해서 까세요";

  // 드래그 이벤트 1회 세팅
  if (!dragArmed) setupKujiSwipeOpen();
}

function closeKujiOpenModal() {
  if (pendingOpen && activeKujiIndex !== null) {
    commitOpenKuji(activeKujiIndex); // ✅ 여기서만 바닥 오픈 반영
  }

  activeKujiIndex = null;
  pendingOpen = false;

  kujiOpenModalEl.classList.add("hidden");
  kujiOpenModalEl.setAttribute("aria-hidden", "true");
}

function setupKujiSwipeOpen() {
  dragArmed = true;

  let dragging = false;
  let startX = 0;
  let curX = 0;

  // 얼마나 드래그하면 "깐 것"으로 볼지(비율)
  const THRESHOLD_RATIO = 0.55;

  kujiOpenSheetEl.addEventListener("pointerdown", (e) => {
    if (activeKujiIndex === null) return;
    if (pendingOpen) return; // 이미 깠으면 더 드래그 불필요

    dragging = true;
    startX = e.clientX;
    curX = 0;

    kujiOpenSheetEl.classList.add("dragging");
    kujiOpenSheetEl.setPointerCapture(e.pointerId);
  });

  const clamp01 = (v) => Math.max(0, Math.min(1, v));

  window.addEventListener("pointermove", (e) => {
    if (!dragging) return;

    const dx = Math.max(0, e.clientX - startX);

    const sheetRect = kujiOpenSheetEl.getBoundingClientRect();
    const p = clamp01(dx / sheetRect.width);

    // ✅ 종이 사라짐 + 숫자 공개가 동시에 진행
    kujiOpenStageEl.style.setProperty("--p", String(p));
  });

  window.addEventListener("pointerup", () => {
    if (!dragging) return;
    dragging = false;
    kujiOpenSheetEl.classList.remove("dragging");

    const sheetRect = kujiOpenSheetEl.getBoundingClientRect();
    const pNow =
      parseFloat(getComputedStyle(kujiOpenStageEl).getPropertyValue("--p")) ||
      0;

    const THRESHOLD = 0.55;

    if (pNow >= THRESHOLD) {
      pendingOpen = true;

      // ✅ 완전히 깐 상태로 스냅
      kujiOpenStageEl.style.setProperty("--p", "1");

      kujiOpenHintEl.classList.add("done");
      kujiOpenHintEl.textContent =
        "오픈 완료! 닫기를 누르면 바닥에서 숫자가 공개돼요.";
    } else {
      pendingOpen = false;

      // ✅ 다시 덮기
      kujiOpenStageEl.style.setProperty("--p", "0");
    }
  });
}

function showAlert(message) {
  alertMessageEl.textContent = String(message ?? "");
  alertModalEl.classList.remove("hidden");
  alertModalEl.setAttribute("aria-hidden", "false");
}

function closeAlert() {
  alertModalEl.classList.add("hidden");
  alertModalEl.setAttribute("aria-hidden", "true");
}

let _confirmResolver = null;

function showConfirm(message) {
  confirmMessageEl.textContent = String(message ?? "");
  confirmModalEl.classList.remove("hidden");
  confirmModalEl.setAttribute("aria-hidden", "false");

  return new Promise((resolve) => {
    _confirmResolver = resolve;
  });
}

function resolveConfirm(ok) {
  if (typeof _confirmResolver === "function") {
    _confirmResolver(Boolean(ok));
    _confirmResolver = null;
  }
  confirmModalEl.classList.add("hidden");
  confirmModalEl.setAttribute("aria-hidden", "true");
}

function renderAll() {
  renderStatus();
  renderGrid();
  renderHistory();
  renderPrizeList();
  renderCounters();
}

function renderStatus() {
  if (state.sessionName) {
    statusTextEl.textContent = "기록 중";
    currentNameBadgeEl.textContent = state.sessionName;
  } else {
    statusTextEl.textContent = "대기";
    currentNameBadgeEl.textContent = "이름 없음";
  }
}

function renderCounters() {
  histCountEl.textContent = String(state.history.length);
  const remaining = state.opened.filter((v) => !v).length;
  remainingCountEl.textContent = String(remaining);
}

let activeKujiIndex = null; // 지금 팝업으로 띄운 쿠지 index
let pendingOpen = false; // 드래그로 "오픈 완료"했는지
let dragArmed = false; // 드래그 이벤트 중복 등록 방지

function renderGrid() {
  gridEl.innerHTML = "";
  const total = state.total;

  for (let i = 0; i < total; i++) {
    const btn = document.createElement("div");
    const row = Math.floor(i / 10) + 1;
    const col = (i % 10) + 1;

    const pos = document.createElement("div");
    pos.className = "kuji-pos";
    pos.textContent = `${row}-${col}`;
    btn.appendChild(pos);

    btn.className = "kuji" + (state.opened[i] ? " opened" : "");
    if (state.opened[i]) {
      btn.setAttribute("data-reveal", String(state.assignments[i]));
      const sub = document.createElement("div");
      // sub.className = "sub";
      // sub.textContent = `#${i + 1}`;
      // btn.appendChild(sub);
    } else {
      btn.title = `쿠지 #${i + 1}`;
    }

    btn.addEventListener("click", (e) => onClickKuji(i, e.currentTarget));
    gridEl.appendChild(btn);
  }
}

// function renderHistory() {
//   historyBodyEl.innerHTML = "";

//   // state.history는 최신이 앞(unshift)이므로, 표시할 때는 오래된→최신 순으로 누적해야 자연스러움
//   const rowsOldToNew = [...state.history].reverse();

//   // name -> { nums: number[] }
//   const byName = new Map();
//   const order = []; // 처음 등장한 순서 유지

//   for (const r of rowsOldToNew) {
//     const name = String(r.name ?? "").trim() || "이름없음";
//     if (!byName.has(name)) {
//       byName.set(name, { nums: [] });
//       order.push(name);
//     }
//     byName.get(name).nums.push(r.number);
//   }

//   // 화면에는 "최근에 누적이 갱신된 사람"이 아래로 쌓이는 게 보기 좋으면 reverse(order)로 바꿔도 됨
//   for (const name of order) {
//     const tr = document.createElement("tr");

//     const tdName = document.createElement("td");
//     tdName.textContent = name;

//     const tdNum = document.createElement("td");
//     tdNum.textContent = byName.get(name).nums.join(",");

//     tr.appendChild(tdName);
//     tr.appendChild(tdNum);

//     historyBodyEl.appendChild(tr);
//   }
// }

function renderHistory() {
  historyBodyEl.innerHTML = "";

  // 오래된→최신 순으로 누적해야 "17,24,35" 순서가 자연스러움
  const rowsOldToNew = [...state.history].reverse();

  // name -> number[]
  const byName = new Map();
  const order = [];

  for (const r of rowsOldToNew) {
    const name = String(r.name ?? "").trim() || "이름없음";
    if (!byName.has(name)) {
      byName.set(name, []);
      order.push(name);
    }
    byName.get(name).push(r.number);
  }

  for (const name of order) {
    const nums = byName.get(name);

    const tr = document.createElement("tr");

    const tdName = document.createElement("td");
    tdName.textContent = name;

    const tdNum = document.createElement("td");
    tdNum.innerHTML = ""; // span으로 넣을 거라 비움

    nums.forEach((n, idx) => {
      if (idx > 0) tdNum.appendChild(document.createTextNode(","));

      const span = document.createElement("span");
      span.textContent = String(n);

      // ✅ 당첨 번호(PRIZES에 있는 번호)면 빨간/굵게
      if (PRIZES && Object.prototype.hasOwnProperty.call(PRIZES, n)) {
        span.className = "num-win";
      }

      tdNum.appendChild(span);
    });

    tr.appendChild(tdName);
    tr.appendChild(tdNum);
    historyBodyEl.appendChild(tr);
  }
}

function renderPrizeList() {
  prizeListEl.innerHTML = "";

  // PRIZES 기준으로 표시 + 실제 당첨(오픈)된 횟수 집계
  const hitCount = {};
  for (const h of state.history) {
    hitCount[h.number] = (hitCount[h.number] || 0) + 1;
  }

  const keys = Object.keys(PRIZES)
    .map((k) => Number(k))
    .sort((a, b) => a - b);

  for (const num of keys) {
    const item = PRIZES[num];
    const hits = hitCount[num] || 0;

    const limit = Number.isFinite(item.remaining) ? Number(item.remaining) : 1;
    const soldOut = hits >= Math.max(1, limit);

    const box = document.createElement("div");
    box.className = "prize-item";

    if (soldOut) {
      box.classList.add("soldout");

      const badge = document.createElement("div");
      badge.className = "soldout-badge";
      badge.textContent = "SOLD OUT";
      box.appendChild(badge);
    }

    const left = document.createElement("div");
    const nm = document.createElement("div");
    nm.className = "name";
    nm.textContent = item.name;

    const mini = document.createElement("div");
    mini.className = "mini";
    // mini.textContent =
    //   `번호: ${num} · 나온 횟수: ${hits}` +
    //   (Number.isFinite(item.remaining)
    //     ? ` · 수량(표시): ${item.remaining}`
    //     : "");

    left.appendChild(nm);
    left.appendChild(mini);

    const right = document.createElement("div");
    right.className = "count";
    right.textContent = `#${num}`;

    box.appendChild(left);
    box.appendChild(right);
    prizeListEl.appendChild(box);
  }
}

// function parseNumberList(text) {
//   if (!text) return [];
//   return text
//     .split(/[\s,]+/g)
//     .map((s) => s.trim())
//     .filter(Boolean)
//     .map((s) => Number(s))
//     .filter((n) => Number.isFinite(n));
// }

function loadConfigFromStorage() {
  // PRIZES
  const rawPrizes = localStorage.getItem(LS_KEY_PRIZES);
  if (rawPrizes) {
    try {
      const obj = JSON.parse(rawPrizes);
      if (obj && typeof obj === "object") PRIZES = obj;
    } catch {
      // 무시(형식 오류)
    }
  } else {
    PRIZES = DEFAULT_PRIZES;
  }

  // modal 채우기
  settingsPrizesEl.value = JSON.stringify(PRIZES, null, 2);
  // settingsNumbersEl.value = localStorage.getItem(LS_KEY_NUMBERS) || "";
  // 직관 UI 채우기
  renderPrizeEditorFromPrizes();
  // renderPoolChips();
}

function openSettings() {
  loadConfigFromStorage();
  settingsModalEl.classList.remove("hidden");
  settingsModalEl.setAttribute("aria-hidden", "false");
}

function closeSettings() {
  settingsModalEl.classList.add("hidden");
  settingsModalEl.setAttribute("aria-hidden", "true");
}

function saveSettingsAndApply() {
  // prizes: 에디터에서 읽기
  const nextPrizes = normalizePrizesObject(readPrizesFromEditor());
  if (Object.keys(nextPrizes).length === 0) {
    showAlert("상품 목록을 1개 이상 입력해 주세요. (번호와 상품명은 필수)");
    return;
  }

  // 숨김 textarea에도 동기화(호환/디버깅용)
  settingsPrizesEl.value = JSON.stringify(nextPrizes, null, 2);

  localStorage.setItem(LS_KEY_PRIZES, JSON.stringify(nextPrizes));
  // localStorage.setItem(LS_KEY_NUMBERS, settingsNumbersEl.value || "");

  PRIZES = nextPrizes;

  renderAll();
  closeSettings();
}
function normalizePrizesObject(obj) {
  // {번호: {name, remaining}} 형태만 통과
  const out = {};
  if (!obj || typeof obj !== "object") return out;

  for (const k of Object.keys(obj)) {
    const num = Number(k);
    const v = obj[k];
    if (!Number.isFinite(num)) continue;
    if (!v || typeof v !== "object") continue;
    const name = String(v.name ?? "").trim();
    if (!name) continue;
    const remaining =
      v.remaining === undefined || v.remaining === null || v.remaining === ""
        ? 1
        : Number(v.remaining);
    out[num] = { name, remaining: Number.isFinite(remaining) ? remaining : 1 };
  }
  return out;
}

// ===== Pool UI =====
// function getPool() {
//   return parseNumberList(settingsNumbersEl.value || "");
// }

// function setPool(arr) {
//   const uniq = Array.from(
//     new Set(arr.map((x) => Number(x)).filter(Number.isFinite))
//   );
//   settingsNumbersEl.value = uniq.join(", ");
//   renderPoolChips();
// }

// function addToPool(arr) {
//   const cur = getPool();
//   setPool(cur.concat(arr));
// }

// function renderPoolChips() {
//   const nums = getPool()
//     .slice()
//     .sort((a, b) => a - b);
//   poolChipsEl.innerHTML = "";
//   for (const n of nums) {
//     const chip = document.createElement("div");
//     chip.className = "pool-chip";
//     chip.textContent = String(n);

//     const del = document.createElement("button");
//     del.className = "ghost";
//     del.textContent = "x";
//     del.addEventListener("click", () => {
//       const next = getPool().filter((v) => v !== n);
//       setPool(next);
//     });

//     chip.appendChild(del);
//     poolChipsEl.appendChild(chip);
//   }
// }

// ===== Prize editor UI =====
function clearPrizeRows() {
  prizeRowsEl.innerHTML = "";
}

function appendPrizeRow({ num, name, remaining }) {
  const row = document.createElement("div");
  row.className = "prize-row";

  const inNum = document.createElement("input");
  inNum.type = "number";
  inNum.placeholder = "번호";
  inNum.value = num;

  const inName = document.createElement("input");
  inName.type = "text";
  inName.placeholder = "상품명";
  inName.value = name;

  const inRemain = document.createElement("input");
  inRemain.type = "number";
  inRemain.placeholder = "수량";
  inRemain.min = "1";
  inRemain.step = "1";
  inRemain.value = remaining ?? 1;

  const btnDel = document.createElement("button");
  btnDel.className = "ghost btn-del";
  btnDel.textContent = "삭제";
  btnDel.addEventListener("click", () => row.remove());

  row.appendChild(inNum);
  row.appendChild(inName);
  row.appendChild(inRemain);
  row.appendChild(btnDel);

  prizeRowsEl.appendChild(row);
}

function renderPrizeEditorFromPrizes() {
  clearPrizeRows();
  const keys = Object.keys(PRIZES)
    .map(Number)
    .sort((a, b) => a - b);
  for (const num of keys) {
    const it = PRIZES[num];
    appendPrizeRow({ num, name: it.name, remaining: it.remaining ?? 1 });
  }
  if (keys.length === 0) appendPrizeRow({ num: "", name: "", remaining: 1 });
}

function readPrizesFromEditor() {
  const rows = prizeRowsEl.querySelectorAll(".prize-row");
  const out = {};
  for (const row of rows) {
    const inputs = row.querySelectorAll("input");
    const num = Number(inputs[0].value);
    const name = String(inputs[1].value || "").trim();
    const remaining = Number(inputs[2].value);

    if (!Number.isFinite(num) || !name) continue;
    out[num] = { name, remaining: Number.isFinite(remaining) ? remaining : 1 };
  }
  return out;
}

function downloadExcel() {
  if (typeof XLSX === "undefined") {
    showAlert(
      "엑셀 다운로드 라이브러리(XLSX)를 불러오지 못했습니다. 인터넷 연결 또는 CDN 차단 여부를 확인해 주세요."
    );
    return;
  }

  // 오래된→최신 순으로 누적
  const rowsOldToNew = [...state.history].reverse();

  // name -> numbers[]
  const byName = new Map();
  const order = [];
  for (const r of rowsOldToNew) {
    const name = String(r.name ?? "").trim() || "이름없음";
    if (!byName.has(name)) {
      byName.set(name, []);
      order.push(name);
    }
    byName.get(name).push(r.number);
  }

  // =========================
  // Sheet 1: UI처럼 (이름/번호)
  // + 상단에 쿠지판 생성일
  // =========================
  const created = state.createdAtISO
    ? formatKoreanTime(state.createdAtISO)
    : "";

  const sheet1 = [
    ["쿠지판 생성일", created],
    [],
    ["이름", "번호"],
    ...order.map((name) => [name, byName.get(name).join(",")]),
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(sheet1);
  ws1["!cols"] = [{ wch: 18 }, { wch: 60 }];

  // =========================
  // Sheet 2: 정산용
  // 당첨 번호는 "번호(상품명)"로
  // 나머지는 "랜덤굿즈*n"으로 합산
  // =========================
  const sheet2Rows = [["이름", "정산"]];

  for (const name of order) {
    const nums = byName.get(name);

    const prizeParts = [];
    let randomCount = 0;

    for (const n of nums) {
      if (PRIZES && Object.prototype.hasOwnProperty.call(PRIZES, n)) {
        const prizeName = String(PRIZES[n]?.name ?? "").trim() || "상품";
        prizeParts.push(`${n}(${prizeName})`);
      } else {
        randomCount += 1;
      }
    }

    const parts = [];
    if (prizeParts.length > 0) parts.push(prizeParts.join(", "));
    if (randomCount > 0) parts.push(`랜덤굿즈*${randomCount}`);

    sheet2Rows.push([name, parts.join(", ")]);
  }

  const ws2 = XLSX.utils.aoa_to_sheet(sheet2Rows);
  ws2["!cols"] = [{ wch: 18 }, { wch: 70 }];

  // Workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws1, "HISTORY");
  XLSX.utils.book_append_sheet(wb, ws2, "정산");

  const fileName = `kuji_history_${yyyymmdd(new Date())}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

function yyyymmdd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

function formatKoreanTime(iso) {
  try {
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  } catch {
    return iso;
  }
}

function makeFreshState(total) {
  const arr = Array.from({ length: total }, (_, i) => i + 1);
  shuffle(arr);

  return {
    createdAtISO: new Date().toISOString(), // ✅ 쿠지판 생성일
    total,
    assignments: arr,
    opened: Array.from({ length: total }, () => false),
    history: [],
    sessionName: null,
  };
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
}

function loadState() {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return makeFreshState(DEFAULT_TOTAL);

  try {
    const parsed = JSON.parse(raw);
    const createdAtISO =
      typeof parsed.createdAtISO === "string"
        ? parsed.createdAtISO
        : new Date().toISOString();

    // 최소 검증 + 누락 필드 보정
    const total = Number(parsed.total) || DEFAULT_TOTAL;
    let assignments = Array.isArray(parsed.assignments)
      ? parsed.assignments
      : null;
    let opened = Array.isArray(parsed.opened) ? parsed.opened : null;
    const history = Array.isArray(parsed.history) ? parsed.history : [];
    const sessionName =
      typeof parsed.sessionName === "string" ? parsed.sessionName : null;

    if (!assignments || assignments.length !== total) {
      assignments = Array.from({ length: total }, (_, i) => i + 1);
      shuffle(assignments);
    }
    if (!opened || opened.length !== total) {
      opened = Array.from({ length: total }, () => false);
    }

    return { createdAtISO, total, assignments, opened, history, sessionName };
  } catch {
    return makeFreshState(DEFAULT_TOTAL);
  }
}

function saveState() {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

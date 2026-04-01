/***********************
 * CONFIG (원하는 대로 수정)
 ***********************/
const DEFAULT_TOTAL = 300;
const SLOT_TARGET_ONE_PER = 16; // 슬롯픽 당첨 목표: 17장당 1번

// "번호"에 대응되는 상품 목록(예시). 필요하면 마음대로 수정하세요.
// - key: 번호(문자열/숫자)
// - value: { name: 상품명, remaining: 표시에 쓸 수량(옵션) }

// localStorage keys
const LS_KEY_PRIZES = "kuji_prizes";
const LS_KEY_HERO = "kuji_hero";
const LS_KEY_LOGO = "kuji_logo";
const DEFAULT_LOGO = "./images/logo2.png";

// 기본 상품 목록(기존 PRIZES 내용을 그대로 여기로 옮기세요)
const DEFAULT_PRIZES = {
  7: { name: "황금티켓", remaining: 1 },
  15: { name: "상품1", remaining: 1 },
  30: { name: "상품2", remaining: 1 },
  45: { name: "상품3", remaining: 1 },
  60: { name: "상품4", remaining: 1 },
  75: { name: "상품5", remaining: 1 },
  90: { name: "상품6", remaining: 1 },
  105: { name: "상품7", remaining: 1 },
  120: { name: "상품8", remaining: 1 },
  135: { name: "상품9", remaining: 1 },
  150: { name: "상품10", remaining: 1 },
  165: { name: "상품11", remaining: 1 },
  180: { name: "상품12", remaining: 1 },
  195: { name: "상품13", remaining: 1 },
  205: { name: "상품14", remaining: 1 },
  220: { name: "상품15", remaining: 1 },
  235: { name: "상품16", remaining: 1 },
  250: { name: "상품17", remaining: 1 },
  265: { name: "상품18", remaining: 1 },
  280: { name: "상품19", remaining: 1 },
  295: { name: "상품20", remaining: 1 },
  300: { name: "상품21", remaining: 1 },
};

const DEFAULT_HERO = {
  code: "L.O",
  name: "라스트원",
  img: "",
};

let PRIZES = DEFAULT_PRIZES;
let HERO = DEFAULT_HERO;
let LOGO = DEFAULT_LOGO;

let currentPickCandidates = [];
let openedPickCandidates = new Set();
let isFromPickMode = false;
let currentOpeningIndex = null;
let isShuffleRunning = false;
let shuffledDeckIndexes = [];
let isSlotMachineRunning = false;

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
const historyBodyEl =
  document.getElementById("historyBody") ||
  document.getElementById("historyBodyModal");
const histCountEl =
  document.getElementById("histCount") ||
  document.getElementById("histCountModal");
const remainingCountEl =
  document.getElementById("remainingCount") ||
  document.getElementById("remainingCountModal");

const btnFinishTurnEl = document.getElementById("btnFinishTurn");
const btnMoveToBackEl = document.getElementById("btnMoveToBack");
const queueListEl = document.getElementById("queueList");

const btnRandomPickEl = document.getElementById("btnRandomPick");
const btnCloseRandomPickEl = document.getElementById("btnCloseRandomPick");
const btnStartShuffleEl = document.getElementById("btnStartShuffle");
const shuffleCountInputEl = document.getElementById("shuffleCountInput");
const pickCardsEl = document.getElementById("pickCards");
const deckStackEl = document.getElementById("deckStack");

const btnSlotRandomPickEl = document.getElementById("btnSlotRandomPick");
const slotRandomPickModalEl = document.getElementById("slotRandomPickModal");
const btnCloseSlotRandomPickEl = document.getElementById(
  "btnCloseSlotRandomPick",
);
const btnStartSlotMachineEl = document.getElementById("btnStartSlotMachine");
const slotReelAEl = document.getElementById("slotReelA");
const slotReelBEl = document.getElementById("slotReelB");
const slotRandomPickSubEl = document.getElementById("slotRandomPickSub");

const logoImgEl = document.getElementById("logoImg");
const logoImgInputEl = document.getElementById("logoImgInput");
const btnLogoPickFileEl = document.getElementById("btnLogoPickFile");
const logoFileInputEl = document.getElementById("logoFileInput");

const prizeListEl = document.getElementById("prizeListMain"); // 바깥 목록
const prizeListModalGridEl = document.getElementById("prizeListModalGrid"); // 모달 목록
const prizeSummaryTextEl = document.getElementById("prizeSummaryText");
const prizeSummaryPreviewEl = document.getElementById("prizeSummaryPreview");
const btnOpenPrizeListModalEl = document.getElementById(
  "btnOpenPrizeListModal",
);
const prizeListModalEl = document.getElementById("prizeListModal");
const btnClosePrizeListModalEl = document.getElementById(
  "btnClosePrizeListModal",
);
const prizeModalSummaryTextEl = document.getElementById(
  "prizeModalSummaryText",
);
const prizeModalRemainCountEl = document.getElementById(
  "prizeModalRemainCount",
);

const heroImgEl = document.getElementById("heroImg");
const heroCodeEl = document.getElementById("heroCode");
const heroNameEl = document.getElementById("heroName");

const heroCodeInputEl = document.getElementById("heroCodeInput");
const heroNameInputEl = document.getElementById("heroNameInput");
const heroImgInputEl = document.getElementById("heroImgInput");
const btnHeroPickFileEl = document.getElementById("btnHeroPickFile");
const heroFileInputEl = document.getElementById("heroFileInput");

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

const btnToggleHistoryEl = document.getElementById("btnToggleHistory");
// const historyPanelEl = document.querySelector(".history-panel");

// History modal
const historyModalEl = document.getElementById("historyModal");
const btnCloseHistoryModalEl = document.getElementById("btnCloseHistoryModal");
const historyBodyModalEl = document.getElementById("historyBodyModal");
const historySummaryModalEl = document.getElementById("historySummaryModal");
const histCountModalEl = document.getElementById("histCountModal");
const remainingCountModalEl = document.getElementById("remainingCountModal");
const btnDownloadModalEl = document.getElementById("btnDownloadModal");

// Kuji open modal
const kujiOpenModalEl = document.getElementById("kujiOpenModal");
const btnCloseKujiOpenEl = document.getElementById("btnCloseKujiOpen");
const kujiOpenSheetEl = document.getElementById("kujiOpenSheet");
const kujiOpenHintEl = document.getElementById("kujiOpenHint");

// Access gate modal
const accessModalEl = document.getElementById("accessModal");
const accessInputEl = document.getElementById("accessInput");
const btnAccessEnterEl = document.getElementById("btnAccessEnter");

// Toast
const toastEl = document.getElementById("toast");

// Settings UI (intuitive)
const btnPrizeAddRowEl = document.getElementById("btnPrizeAddRow");
const prizeRowsEl = document.getElementById("prizeRows");

const kujiUnderNumberEl = document.getElementById("kujiUnderNumber");
const kujiOpenStageEl = document.getElementById("kujiOpenStage");

// ✅ Win UI (inside kuji open modal)
const winResultEl = document.getElementById("winResult");
const winPrizeImgEl = document.getElementById("winPrizeImg");
const winPrizeNumEl = document.getElementById("winPrizeNum");
const winPrizeNameEl = document.getElementById("winPrizeName");
const winPrizeNoteEl = document.getElementById("winPrizeNote");
const confettiCanvasEl = document.getElementById("confettiCanvas");
const winOverlayBackdropEl = document.getElementById("winOverlayBackdrop");
const btnCloseWinOverlayEl = document.getElementById("btnCloseWinOverlay");

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

const remainingPrizeNumbersEl = document.getElementById(
  "remainingPrizeNumbers",
);

const randomPickModalEl = document.getElementById("randomPickModal");
const randomPickSlotEl = document.getElementById("randomPickSlot");
const randomPickSubEl = document.getElementById("randomPickSub");

const RANDOM_PICK_MESSAGES = [
  "🎰 행운을 굴리는 중...",
  "🔥 숨 참고 결과 확인...",
  "🎯 결과는 이미 정해져 있다...",
  "🎰 당첨의 신이 선택 중입니다...",
  "🔥 제발 좋은 거 나와라...",
  "🎉 당첨 기운 상승 중!",
  "😂 꽝만 아니면 된다...",
  "🎯 운명의 쿠지를 선택합니다...",
  "😂 기도 타임 🙏",
  "🔥 이번엔 진짜다...",
  "🎉 이번엔 무조건 당첨!",
];

const RANDOM_PICK_END_MESSAGES = [
  "🎉 선택 완료!",
  "🔥 결과 공개!",
  "🎯 운명 확정!",
  "🎰 멈췄다!",
  "👀 결과는 바로 이것!",
];

// ✅ 입장 코드(원하는 값으로 바꿔도 됨)
const ACCESS_CODE = "1101";

// ✅ 성공 상태 저장 키(브라우저 새로고침해도 유지하려면 localStorage)
const ACCESS_OK_KEY = "kujibox_access_ok";

/***********************
 * IMAGE HELPERS (DataURL 용량 줄이기)
 * localStorage는 보통 5MB 내외라, 이미지(DataURL)를 많이 저장하면
 * QUOTA_EXCEEDED_ERR로 저장이 실패할 수 있습니다.
 ***********************/
async function fileToCompressedDataURL(file, opts = {}) {
  const {
    maxSide = 512, // 한 변 최대 길이
    quality = 0.82, // jpeg 품질
    mimeType = "image/png", // 용량 절감을 위해 기본 jpeg
  } = opts;

  // createImageBitmap 우선(빠름). 미지원이면 Image로 fallback.
  const bitmap = await (async () => {
    if ("createImageBitmap" in window) {
      try {
        return await createImageBitmap(file);
      } catch {
        // fallback
      }
    }

    return await new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };
      img.src = url;
    });
  })();

  const w0 = bitmap.width;
  const h0 = bitmap.height;
  const scale = Math.min(1, maxSide / Math.max(w0, h0));
  const w = Math.max(1, Math.round(w0 * scale));
  const h = Math.max(1, Math.round(h0 * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, w, h);

  // createImageBitmap로 만든 경우 메모리 해제
  if (bitmap && typeof bitmap.close === "function") {
    try {
      bitmap.close();
    } catch {}
  }

  return canvas.toDataURL(mimeType, quality);
}

async function saveImageFileAndMakeRef(file, opts = {}) {
  const dataUrl = await fileToCompressedDataURL(file, {
    maxSide: 768,
    mimeType: "image/png",
    quality: 0.92,
    ...opts,
  });

  const blob = await (await fetch(dataUrl)).blob();
  const key = await idbPutImageBlob(blob);
  return makeIdbRef(key, file.name);
}

function bindImagePicker({
  textInput,
  fileInput,
  pickButton,
  onImageChange,
  successMessage = "이미지 업로드 완료!",
  failureMessage = "이미지 업로드에 실패했어요.",
}) {
  if (pickButton && fileInput) {
    pickButton.addEventListener("click", () => fileInput.click());
  }

  if (textInput) {
    textInput.addEventListener("input", () => {
      delete textInput.dataset.imgRef;
      onImageChange?.(normalizeImageRef(textInput.value));
    });
  }

  if (fileInput) {
    fileInput.addEventListener("change", async () => {
      const f = fileInput.files?.[0];
      if (!f) return;

      try {
        const ref = await saveImageFileAndMakeRef(f);
        if (textInput) {
          textInput.dataset.imgRef = ref;
          textInput.value = f.name;
        }
        onImageChange?.(ref);
        showToast(successMessage);
      } catch (e) {
        console.error(e);
        showAlert(failureMessage);
      } finally {
        fileInput.value = "";
      }
    });
  }
}

/***********************
 * INIT
 ***********************/
initApp();

async function initApp() {
  loadConfigFromStorage();

  // ✅ 저장된 이미지(idb://...)를 먼저 미리 읽어 캐시에 올림
  await preloadStoredImages();

  applyLogoToUI();
  // ✅ preload 끝난 뒤 히어로 이미지 반영
  applyHeroToUI();

  totalInputEl.value = String(state.total ?? DEFAULT_TOTAL);
  renderAll();

  // ✅ 앱 시작 시 입장 코드 체크
  if (!isAccessGranted()) {
    openAccessModal();
  }

  setupWinOverlayClose();
}

/***********************
 * EVENTS
 ***********************/

btnAccessEnterEl.addEventListener("click", tryEnterWithCode);
btnFinishTurnEl?.addEventListener("click", finishCurrentTurn);
btnMoveToBackEl?.addEventListener("click", moveCurrentToBack);

btnRandomPickEl.addEventListener("click", pickRandomKuji);
btnCloseRandomPickEl?.addEventListener("click", closeRandomPickModal);
btnStartShuffleEl?.addEventListener("click", startShuffleAndShowCards);

btnSlotRandomPickEl?.addEventListener("click", openSlotRandomPickModal);
btnCloseSlotRandomPickEl?.addEventListener("click", closeSlotRandomPickModal);
btnStartSlotMachineEl?.addEventListener("click", startSlotMachinePick);

btnOpenPrizeListModalEl?.addEventListener("click", openPrizeListModal);
btnClosePrizeListModalEl?.addEventListener("click", closePrizeListModal);

slotRandomPickModalEl?.addEventListener("click", (e) => {
  e.stopPropagation();
});

accessInputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") tryEnterWithCode();
});

// 모달 밖 클릭/배경 조작 막기 (모달 자체가 덮지만, 이벤트도 안전하게)
accessModalEl.addEventListener("click", (e) => e.stopPropagation());

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
// settingsModalEl.addEventListener("click", (e) => {
//   if (e.target === settingsModalEl) closeSettings();
// });

// 초기화: "이미 깐 쿠지 유지", "기록(세션) 멈춤", "이름만 지움"
btnResetSessionEl.addEventListener("click", async () => {
  const ok = await showConfirm(
    "현재 진행 중인 사람과 대기줄을 모두 초기화할까요?\n(쿠지 기록은 유지됩니다.)",
  );
  if (!ok) return;

  state.sessionName = null;
  state.queue = [];
  nameInputEl.value = "";
  saveState();
  renderAll();
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

bindImagePicker({
  textInput: heroImgInputEl,
  fileInput: heroFileInputEl,
  pickButton: btnHeroPickFileEl,
  onImageChange: (img) => {
    HERO = { ...(HERO || {}), img };
    applyHeroToUI();
  },
  successMessage: "라스트원 이미지 업로드 완료!",
  failureMessage: "라스트원 이미지 업로드에 실패했어요.",
});

bindImagePicker({
  textInput: logoImgInputEl,
  fileInput: logoFileInputEl,
  pickButton: btnLogoPickFileEl,
  onImageChange: null, // 저장 버튼 눌러야 반영
  successMessage: "로고 이미지 업로드 완료!",
  failureMessage: "로고 이미지 업로드에 실패했어요.",
});

// 엑셀 다운로드
btnDownloadEl?.addEventListener("click", downloadExcel);

// 재생성: total/assignment/opened를 다시 만들고, 기록은 유지할지 선택 여지 있음
// 여기서는 안전하게: "전체 쿠지 재생성"은 상태를 새로 만들고 기록도 같이 초기화하도록 구현(실수 방지 위해 confirm)
btnRebuildEl.addEventListener("click", async () => {
  const nextTotal = parseInt(totalInputEl.value, 10);
  if (!Number.isFinite(nextTotal) || nextTotal <= 0) {
    showAlert("총 쿠지 수를 올바르게 입력해 주세요.");
    return;
  }

  const ok = await showConfirm(
    "쿠지를 재생성하면 오픈 현황 및 기록이 모두 초기화됩니다.\n진행할까요?",
  );
  if (!ok) return;

  state = makeFreshState(nextTotal);
  saveState();
  renderAll();
});

btnToggleHistoryEl.addEventListener("click", () => {
  openHistoryModal();
});

btnCloseHistoryModalEl.addEventListener("click", closeHistoryModal);

// 다운로드도 모달 버튼에서 가능하게
btnDownloadModalEl.addEventListener("click", () => downloadExcel());

// 바깥 클릭으로 닫히지 않게(원하면 overlay 클릭 닫기로 바꿀 수 있음)
historyModalEl.addEventListener("click", (e) => e.stopPropagation());

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

  // 현재 사람 없으면 바로 시작
  if (!state.sessionName) {
    state.sessionName = name;
    nameInputEl.value = "";
    saveState();
    renderAll();
    showToast(`${name}님 시작!`);
    return;
  }

  // 현재 사람과 같으면 중복 방지
  if (state.sessionName === name) {
    showAlert("이미 현재 진행 중인 닉네임입니다.");
    return;
  }

  // 대기열 중복 방지
  if (state.queue.includes(name)) {
    showAlert("이미 대기줄에 있는 닉네임입니다.");
    return;
  }

  // 현재 사람이 있으면 대기열에 추가
  state.queue.push(name);
  nameInputEl.value = "";
  saveState();
  renderAll();
  showToast(`${name}님이 대기줄에 등록됐어요.`);
}

function advanceToNextSession() {
  if (state.queue.length > 0) {
    state.sessionName = state.queue.shift();
  } else {
    state.sessionName = null;
  }

  saveState();
  renderAll();
}

function finishCurrentTurn() {
  if (!state.sessionName) {
    showAlert("현재 진행 중인 사람이 없습니다.");
    return;
  }

  const finishedName = state.sessionName;
  advanceToNextSession();

  if (state.sessionName) {
    showToast(`${finishedName}님 종료 → ${state.sessionName}님 차례입니다.`);
  } else {
    showToast(`${finishedName}님 종료. 현재 대기줄이 비어 있어요.`);
  }
}

function moveCurrentToBack() {
  if (!state.sessionName) {
    showAlert("현재 진행 중인 사람이 없습니다.");
    return;
  }

  if (state.queue.length === 0) {
    showAlert("뒤로 설 대기줄이 아직 없습니다.");
    return;
  }

  const current = state.sessionName;

  // 현재 사람을 맨 뒤로
  state.queue.push(current);

  // 맨 앞 대기자를 현재 사람으로
  state.sessionName = state.queue.shift();

  saveState();
  renderAll();

  showToast(`${current}님이 뒷줄로 이동했어요.`);
}

function renderQueue() {
  if (!queueListEl) return;

  queueListEl.innerHTML = "";

  if (!Array.isArray(state.queue) || state.queue.length === 0) {
    const empty = document.createElement("span");
    empty.className = "queue-empty";
    empty.textContent = "대기 중인 사람이 없어요.";
    queueListEl.appendChild(empty);
    return;
  }

  state.queue.forEach((name, idx) => {
    const chip = document.createElement("div");
    chip.className = "queue-chip";

    const text = document.createElement("span");
    text.className = "queue-chip-text";
    text.textContent = `${idx + 1}.${name}`;

    const removeBtn = document.createElement("button");
    removeBtn.className = "queue-remove-btn";
    removeBtn.type = "button";
    removeBtn.textContent = "✕";
    removeBtn.setAttribute("aria-label", `${name} 대기줄 삭제`);

    removeBtn.addEventListener("click", async (e) => {
      e.stopPropagation();

      const ok = await showConfirm(`${name}님을 대기줄에서 삭제할까요?`);
      if (!ok) return;

      removeFromQueue(idx);
    });

    chip.appendChild(text);
    chip.appendChild(removeBtn);
    queueListEl.appendChild(chip);
  });
}

function removeFromQueue(index) {
  if (!Array.isArray(state.queue)) return;
  if (index < 0 || index >= state.queue.length) return;

  const removedName = state.queue[index];
  state.queue.splice(index, 1);

  saveState();
  renderAll();
  showToast(`${removedName}님이 대기줄에서 빠졌어요.`);
}

function getPrizeEntries() {
  const hitCount = {};
  for (const h of state.history) {
    const n = h.number;
    hitCount[n] = (hitCount[n] || 0) + 1;
  }

  return Object.keys(PRIZES)
    .map(Number)
    .map((num) => {
      const item = PRIZES[num];
      const hits = hitCount[num] || 0;
      const limit = Number.isFinite(item.remaining)
        ? Number(item.remaining)
        : 1;
      const soldOut = hits >= Math.max(1, limit);

      return {
        num,
        item,
        hits,
        limit,
        soldOut,
        remainingCount: Math.max(0, Math.max(1, limit) - hits),
      };
    })
    .sort((a, b) => {
      if (a.soldOut !== b.soldOut) {
        return a.soldOut ? 1 : -1;
      }
      return a.num - b.num;
    });
}

function renderPrizeSummary() {
  const prizeEntries = getPrizeEntries();

  // 남아 있는 "상품 종류 수"
  const remainCount = prizeEntries.filter((entry) => !entry.soldOut).length;

  // 품절된 "상품 종류 수"
  const soldOutCount = prizeEntries.length - remainCount;

  // 실제 남아 있는 "총 수량"
  const remainTotalCount = prizeEntries.reduce(
    (sum, entry) => sum + Math.max(0, entry.remainingCount || 0),
    0,
  );

  // 바깥 요약 텍스트가 있을 때만 갱신
  if (prizeSummaryTextEl) {
    prizeSummaryTextEl.textContent = `남은 상품 ${remainCount - 1}개 · 품절 ${soldOutCount}개`;
  }

  // 모달 요약 텍스트 갱신
  if (prizeModalSummaryTextEl) {
    prizeModalSummaryTextEl.textContent = `남은 상품 ${remainTotalCount - 1}개`;
  }

  // 모달 안 별도 숫자 영역이 있으면 갱신
  if (prizeModalRemainCountEl) {
    prizeModalRemainCountEl.textContent = String(remainTotalCount - 1);
  }

  // 바깥 preview 영역이 있을 때만 렌더
  if (prizeSummaryPreviewEl) {
    prizeSummaryPreviewEl.innerHTML = "";

    const previewEntries = prizeEntries.slice(0, 5);

    previewEntries.forEach(({ num, item, soldOut, remainingCount }) => {
      const chip = document.createElement("div");
      chip.className = `prize-summary-chip${soldOut ? " soldout" : ""}`;

      const numEl = document.createElement("span");
      numEl.className = "prize-summary-chip-num";
      numEl.textContent = `${num}번`;

      const nameEl = document.createElement("span");
      nameEl.className = "prize-summary-chip-name";
      nameEl.textContent = item.name;

      const stateEl = document.createElement("span");
      stateEl.className = "prize-summary-chip-state";
      stateEl.textContent = soldOut ? "품절" : `잔여 ${remainingCount}`;

      chip.appendChild(numEl);
      chip.appendChild(nameEl);
      chip.appendChild(stateEl);

      prizeSummaryPreviewEl.appendChild(chip);
    });
  }
}

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

  // ✅ 선택한 쿠지의 위치번호(row-col) 표시
  const row = Math.floor(index / 10) + 1;
  const col = (index % 10) + 1;
  kujiOpenStageEl.setAttribute("data-pos", `${row}-${col}`);

  // ✅ 진행률 p 초기화 (0: 아직 안 깜)
  kujiOpenStageEl.style.setProperty("--p", "0");

  // ✅ 당첨 UI/컨페티 초기화
  hideWinResult();
  stopConfetti();

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
  let justOpenedIndex = null;

  if (pendingOpen && activeKujiIndex !== null) {
    justOpenedIndex = activeKujiIndex;
    commitOpenKuji(activeKujiIndex);
  }

  stopConfetti();
  hideWinResult();

  activeKujiIndex = null;
  pendingOpen = false;
  kujiOpenStageEl.removeAttribute("data-pos");

  kujiOpenModalEl.classList.add("hidden");
  kujiOpenModalEl.setAttribute("aria-hidden", "true");

  if (
    isFromPickMode &&
    justOpenedIndex !== null &&
    currentPickCandidates.includes(justOpenedIndex)
  ) {
    afterOpenFromPick(justOpenedIndex);
  }
}

function afterOpenFromPick(kujiIndex) {
  openedPickCandidates.add(kujiIndex);

  renderPickCards(currentPickCandidates);

  const remainCount = currentPickCandidates.length - openedPickCandidates.size;

  if (openedPickCandidates.size === currentPickCandidates.length) {
    randomPickSubEl.textContent = "세 장을 모두 확인했습니다!";

    setTimeout(() => {
      closeRandomPickModal();
      currentPickCandidates = [];
      openedPickCandidates = new Set();
      isFromPickMode = false;
      currentOpeningIndex = null;
    }, 800);
  } else {
    randomPickSubEl.textContent = `남은 카드 ${remainCount}장`;
    openRandomPickModal();
  }
}

function hideKujiOpenModalOnly() {
  kujiOpenModalEl.classList.add("hidden");
  kujiOpenModalEl.setAttribute("aria-hidden", "true");
}

async function pickRandomKuji() {
  if (!state.sessionName) {
    showAlert("이름 입력 후 Enter(또는 시작)를 눌러 주세요.");
    nameInputEl.focus();
    return;
  }

  const availableIndexes = getAvailableKujiIndexes();
  if (availableIndexes.length === 0) {
    showAlert("남은 쿠지가 없습니다!");
    return;
  }

  shuffledDeckIndexes = [...availableIndexes];
  currentPickCandidates = [];
  renderDeckStack(shuffledDeckIndexes.length);
  renderPickCards([]);
  randomPickSubEl.textContent = "섞을 횟수를 입력하고 시작하세요.";

  openRandomPickModal();
}

function getAvailableKujiIndexes() {
  const available = [];
  for (let i = 0; i < state.opened.length; i++) {
    if (!state.opened[i]) available.push(i);
  }
  return available;
}

function isPrizeNumber(num) {
  return !!(PRIZES && Object.prototype.hasOwnProperty.call(PRIZES, num));
}

function getCurrentPrizeHitCount() {
  return state.history.reduce((count, h) => {
    return count + (isPrizeNumber(h.number) ? 1 : 0);
  }, 0);
}

function getTotalPrizeCountOnBoard() {
  return state.assignments.reduce((count, num) => {
    return count + (isPrizeNumber(num) ? 1 : 0);
  }, 0);
}

function getPrizeWeightByNumber(num) {
  return 1;
}

function pickWeightedPrizeIndex(prizeIndexes) {
  if (!prizeIndexes || prizeIndexes.length === 0) return null;
  return prizeIndexes[Math.floor(Math.random() * prizeIndexes.length)];
}

function chooseWeightedSlotPickIndex(availableIndexes) {
  if (!availableIndexes || availableIndexes.length === 0) return null;

  const prizeIndexes = [];
  const nonPrizeIndexes = [];

  for (const idx of availableIndexes) {
    const num = state.assignments[idx];
    if (isPrizeNumber(num)) {
      prizeIndexes.push(idx);
    } else {
      nonPrizeIndexes.push(idx);
    }
  }

  // 보드 전체 기준 목표 당첨 수
  const totalPrizeCountOnBoard = getTotalPrizeCountOnBoard();
  const targetTotalWins = Math.min(
    Math.floor(state.total / SLOT_TARGET_ONE_PER),
    totalPrizeCountOnBoard,
  );

  const currentWins = getCurrentPrizeHitCount();
  const remainingDraws = availableIndexes.length;
  const remainingNeededWins = Math.max(0, targetTotalWins - currentWins);

  // 예: 남은 60장 중 앞으로 2번은 당첨이 나와야 하면 이번 당첨 확률 = 2/60
  const winChanceNow =
    remainingDraws > 0 ? remainingNeededWins / remainingDraws : 0;

  // 당첨 후보가 아예 없으면 무조건 꽝
  if (prizeIndexes.length === 0) {
    return nonPrizeIndexes[Math.floor(Math.random() * nonPrizeIndexes.length)];
  }

  // 꽝 후보가 아예 없으면 무조건 당첨
  if (nonPrizeIndexes.length === 0) {
    return prizeIndexes[Math.floor(Math.random() * prizeIndexes.length)];
  }

  const shouldPickPrize = Math.random() < winChanceNow;

  if (shouldPickPrize) {
    return pickWeightedPrizeIndex(prizeIndexes);
  }

  return nonPrizeIndexes[Math.floor(Math.random() * nonPrizeIndexes.length)];
}

function chooseCardPickCandidatesWithQuota(availableIndexes, pickCount = 3) {
  if (!availableIndexes || availableIndexes.length === 0) return [];

  const actualPickCount = Math.min(pickCount, availableIndexes.length);

  const prizeIndexes = [];
  const nonPrizeIndexes = [];

  for (const idx of availableIndexes) {
    const num = state.assignments[idx];
    if (isPrizeNumber(num)) {
      prizeIndexes.push(idx);
    } else {
      nonPrizeIndexes.push(idx);
    }
  }

  const totalPrizeCountOnBoard = getTotalPrizeCountOnBoard();
  const targetTotalWins = Math.min(
    Math.floor(state.total / SLOT_TARGET_ONE_PER),
    totalPrizeCountOnBoard,
  );

  const currentWins = getCurrentPrizeHitCount();
  const remainingNeededWins = Math.max(0, targetTotalWins - currentWins);
  const remainingDraws = availableIndexes.length;

  const winChancePerCard =
    remainingDraws > 0 ? remainingNeededWins / remainingDraws : 0;

  let winCountThisPick = 0;
  for (let i = 0; i < actualPickCount; i++) {
    if (Math.random() < winChancePerCard) {
      winCountThisPick++;
    }
  }

  winCountThisPick = Math.min(
    winCountThisPick,
    remainingNeededWins,
    prizeIndexes.length,
  );

  const result = [];

  const tempPrizeIndexes = [...prizeIndexes];
  for (let i = 0; i < winCountThisPick; i++) {
    const picked = pickWeightedPrizeIndex(tempPrizeIndexes);
    if (picked == null) break;

    result.push(picked);

    const removeAt = tempPrizeIndexes.indexOf(picked);
    if (removeAt >= 0) tempPrizeIndexes.splice(removeAt, 1);
  }

  const tempNonPrizeIndexes = [...nonPrizeIndexes];
  shuffle(tempNonPrizeIndexes);

  const needMore = actualPickCount - result.length;
  result.push(...tempNonPrizeIndexes.slice(0, needMore));

  if (result.length < actualPickCount) {
    const leftovers = availableIndexes.filter((idx) => !result.includes(idx));
    shuffle(leftovers);
    result.push(...leftovers.slice(0, actualPickCount - result.length));
  }

  shuffle(result);
  return result;
}

function buildCardRandomPickCandidates(availableIndexes, pickCount = 3) {
  if (!availableIndexes || availableIndexes.length === 0) return [];

  const finalIndex = chooseWeightedSlotPickIndex(availableIndexes);
  if (finalIndex === null) return [];

  const rest = availableIndexes.filter((idx) => idx !== finalIndex);
  shuffle(rest);

  const result = [finalIndex, ...rest.slice(0, Math.max(0, pickCount - 1))];
  shuffle(result); // 사용자가 어느 카드가 정답인지 모르게 한 번 더 섞기

  return result;
}

async function startShuffleAndShowCards() {
  if (isShuffleRunning) return;

  const availableIndexes = getAvailableKujiIndexes();
  if (availableIndexes.length === 0) {
    showAlert("남은 쿠지가 없습니다!");
    return;
  }

  let shuffleCount = parseInt(shuffleCountInputEl.value, 10);
  if (!Number.isFinite(shuffleCount) || shuffleCount <= 0) {
    showAlert("섞을 횟수를 1 이상으로 입력해 주세요.");
    shuffleCountInputEl.focus();
    return;
  }

  isShuffleRunning = true;
  pickCardsEl.innerHTML = "";
  randomPickSubEl.textContent = "카드를 섞는 중...";

  shuffledDeckIndexes = [...availableIndexes];

  for (let i = 0; i < shuffleCount; i++) {
    shuffle(shuffledDeckIndexes);
    renderDeckStack(shuffledDeckIndexes.length, true);
    randomPickSubEl.textContent = `${i + 1} / ${shuffleCount}번 섞는 중...`;
    await wait(350);
  }

  openedPickCandidates = new Set();
  isFromPickMode = false;
  currentOpeningIndex = null;

  currentPickCandidates = chooseCardPickCandidatesWithQuota(
    availableIndexes,
    3,
  );

  renderPickCards(currentPickCandidates);

  if (currentPickCandidates.length > 0) {
    randomPickSubEl.textContent = "3장 중 1장을 선택하세요.";
  } else {
    randomPickSubEl.textContent = "선택 가능한 카드가 없습니다.";
  }

  isShuffleRunning = false;
}

function renderDeckStack(count, shaking = false) {
  if (!deckStackEl) return;

  deckStackEl.innerHTML = "";

  const layerCount = Math.min(6, Math.max(1, count));
  for (let i = 0; i < layerCount; i++) {
    const card = document.createElement("div");
    card.className = "deck-back-card" + (shaking ? " shaking" : "");
    card.style.transform = `translate(${i * 3}px, ${i * 3}px) rotate(${(i - 2) * 2}deg)`;
    deckStackEl.appendChild(card);
  }
}

function renderPickCards(candidates) {
  if (!pickCardsEl) return;
  pickCardsEl.innerHTML = "";

  candidates.forEach((kujiIndex, visualIdx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pick-card";

    const front = document.createElement("div");
    front.className = "pick-card-front";
    front.textContent = `CARD ${visualIdx + 1}`;

    const back = document.createElement("div");
    back.className = "pick-card-back";
    back.textContent = indexToKujiPos(kujiIndex);

    btn.appendChild(front);
    btn.appendChild(back);

    const isOpened = openedPickCandidates.has(kujiIndex);

    // 이미 깐 카드는 뒤집힌 상태 유지
    if (isOpened) {
      btn.classList.add("selected", "opened");
      btn.disabled = true;
    }

    btn.addEventListener("click", () => {
      if (isShuffleRunning) return;
      if (openedPickCandidates.has(kujiIndex)) return;

      btn.classList.add("selected");

      isFromPickMode = true;
      currentOpeningIndex = kujiIndex;

      setTimeout(() => {
        openKujiOpenModal(kujiIndex);
      }, 1200);
    });

    pickCardsEl.appendChild(btn);
  });
}

function openSlotRandomPickModal() {
  if (!state.sessionName) {
    showAlert("이름 입력 후 Enter(또는 시작)를 눌러 주세요.");
    nameInputEl.focus();
    return;
  }

  const availableIndexes = getAvailableKujiIndexes();
  if (availableIndexes.length === 0) {
    showAlert("남은 쿠지가 없습니다!");
    return;
  }

  if (slotReelAEl) slotReelAEl.textContent = "?";
  if (slotReelBEl) slotReelBEl.textContent = "?";
  if (slotRandomPickSubEl) {
    slotRandomPickSubEl.textContent = "START를 누르면 번호가 돌아갑니다.";
  }

  slotRandomPickModalEl.classList.remove("hidden");
  slotRandomPickModalEl.setAttribute("aria-hidden", "false");
}

function closeSlotRandomPickModal() {
  if (isSlotMachineRunning) return;

  slotRandomPickModalEl.classList.add("hidden");
  slotRandomPickModalEl.setAttribute("aria-hidden", "true");

  slotReelAEl?.classList.remove("spinning");
  slotReelBEl?.classList.remove("spinning");
}

async function startSlotMachinePick() {
  if (isSlotMachineRunning) return;

  const availableIndexes = getAvailableKujiIndexes();
  if (availableIndexes.length === 0) {
    showAlert("남은 쿠지가 없습니다!");
    return;
  }

  isSlotMachineRunning = true;

  const finalIndex = chooseWeightedSlotPickIndex(availableIndexes);
  if (finalIndex === null) {
    isSlotMachineRunning = false;
    showAlert("남은 쿠지가 없습니다!");
    return;
  }
  const finalPos = indexToKujiPos(finalIndex);
  const [finalRow, finalCol] = finalPos.split("-");

  slotReelAEl?.classList.add("spinning");
  slotReelBEl?.classList.add("spinning");

  if (slotRandomPickSubEl) {
    slotRandomPickSubEl.textContent = getRandomPickMessage();
  }

  // 두 자리 동시에 회전
  const totalDuration = 1800;
  const start = performance.now();

  while (performance.now() - start < totalDuration) {
    const idx =
      availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
    const [row, col] = indexToKujiPos(idx).split("-");

    if (slotReelAEl) slotReelAEl.textContent = row;
    if (slotReelBEl) slotReelBEl.textContent = col;

    await wait(70);
  }

  // 최종 번호 고정
  if (slotReelAEl) slotReelAEl.textContent = finalRow;
  if (slotReelBEl) slotReelBEl.textContent = finalCol;

  slotReelAEl?.classList.remove("spinning");
  slotReelBEl?.classList.remove("spinning");

  if (slotRandomPickSubEl) {
    slotRandomPickSubEl.textContent =
      RANDOM_PICK_END_MESSAGES[
        Math.floor(Math.random() * RANDOM_PICK_END_MESSAGES.length)
      ];
  }

  await wait(1000);

  isSlotMachineRunning = false;
  closeSlotRandomPickModal();
  openKujiOpenModal(finalIndex);
}

function getRandomPickMessage() {
  return RANDOM_PICK_MESSAGES[
    Math.floor(Math.random() * RANDOM_PICK_MESSAGES.length)
  ];
}

function indexToKujiPos(index) {
  const row = Math.floor(index / 10) + 1;
  const col = (index % 10) + 1;
  return `${row}-${col}`;
}

function openRandomPickModal() {
  randomPickModalEl.classList.remove("hidden");
  randomPickModalEl.setAttribute("aria-hidden", "false");
}

function closeRandomPickModal() {
  randomPickModalEl.classList.add("hidden");
  randomPickModalEl.setAttribute("aria-hidden", "true");

  currentPickCandidates = [];
  openedPickCandidates = new Set();
  isFromPickMode = false;
  currentOpeningIndex = null;

  if (pickCardsEl) pickCardsEl.innerHTML = "";
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function playRandomPickMachine(availableIndexes, finalIndex) {
  openRandomPickModal();

  if (randomPickSubEl) {
    randomPickSubEl.textContent = getRandomPickMessage();
  }

  // 빠르게 돌아가는 느낌
  const fastDuration = 900;
  const slowDuration = 700;
  const start = performance.now();

  while (performance.now() - start < fastDuration) {
    const idx =
      availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
    if (randomPickSlotEl) {
      randomPickSlotEl.textContent = indexToKujiPos(idx);
    }
    await wait(55);
  }

  // 점점 느려지는 느낌
  const slowSteps = [90, 120, 150, 190, 240, 300];
  for (const delay of slowSteps) {
    const idx =
      availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
    if (randomPickSlotEl) {
      randomPickSlotEl.textContent = indexToKujiPos(idx);
    }
    await wait(delay);
  }

  // 최종 당첨 위치 고정
  if (randomPickSlotEl) {
    randomPickSlotEl.textContent = indexToKujiPos(finalIndex);
  }

  if (randomPickSubEl) {
    randomPickSubEl.textContent =
      RANDOM_PICK_END_MESSAGES[
        Math.floor(Math.random() * RANDOM_PICK_END_MESSAGES.length)
      ];
  }

  await wait(700);
  closeRandomPickModal();
}

function setupKujiSwipeOpen() {
  dragArmed = true;

  let dragging = false;
  let startX = 0;
  let curX = 0;

  // 얼마나 드래그하면 "깐 것"으로 볼지(비율)
  const THRESHOLD_RATIO = 0.5;

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

      // ✅ 당첨이면: 상품 이미지/이름 + 폭죽 효과
      if (activeKujiIndex !== null) {
        const n = state.assignments[activeKujiIndex];
        showWinIfPrizeNumber(n);
      }
    } else {
      pendingOpen = false;

      // ✅ 다시 덮기
      kujiOpenStageEl.style.setProperty("--p", "0");

      // ✅ 다시 덮으면 당첨 UI/폭죽도 숨김
      hideWinResult();
      stopConfetti();
    }
  });
}

// =========================
// ✅ WIN RESULT + CONFETTI
// =========================
function showWinIfPrizeNumber(n) {
  // PRIZES에 있는 번호면 "당첨"으로 처리
  if (!PRIZES || !Object.prototype.hasOwnProperty.call(PRIZES, n)) {
    hideWinResult();
    stopConfetti();
    return;
  }

  const prize = PRIZES[n];
  const name = String(prize?.name ?? "").trim() || "상품";

  // 이미지: 기존 helper로 idb:// / 경로 / 파일명 모두 지원
  if (winPrizeImgEl) {
    // fallback은 번호 기본 이미지
    setImgSrcAsync(winPrizeImgEl, prize?.img, `./images/${n}.png`);
    winPrizeImgEl.onerror = () => {
      winPrizeImgEl.onerror = null;
      winPrizeImgEl.src = "./images/placeholder.png";
    };
  }

  if (winPrizeNumEl) winPrizeNumEl.textContent = String(n);
  if (winPrizeNameEl) winPrizeNameEl.textContent = name;

  // (선택) 품절/잔여 안내: 현재 history 기준 + 이번 1회 반영해서 계산
  const alreadyHits = state.history.reduce(
    (acc, h) => (h.number === n ? acc + 1 : acc),
    0,
  );
  const limit = Number.isFinite(prize?.remaining) ? Number(prize.remaining) : 1;
  const afterHits = alreadyHits + 1;
  const soldOutAfterThis = afterHits >= Math.max(1, limit);
  if (winPrizeNoteEl) {
    winPrizeNoteEl.textContent = soldOutAfterThis ? "당첨을 축하합니다!" : "";
  }

  showWinResult();
  startConfetti();

  pendingWinCommitIndex = activeKujiIndex;
  hideKujiOpenModalOnly();
}

// ✅ 당첨 오버레이 닫기(백드롭 클릭/버튼)
function setupWinOverlayClose() {
  const close = () => {
    hideWinResult();
    stopConfetti();

    if (pendingWinCommitIndex !== null) {
      const justOpenedIndex = pendingWinCommitIndex;

      commitOpenKuji(justOpenedIndex);
      pendingWinCommitIndex = null;

      activeKujiIndex = null;
      pendingOpen = false;

      if (isFromPickMode) {
        afterOpenFromPick(justOpenedIndex);
      }
    }
  };

  if (btnCloseWinOverlayEl) {
    btnCloseWinOverlayEl.addEventListener("click", close);
  }
  if (winOverlayBackdropEl) {
    winOverlayBackdropEl.addEventListener("click", close);
  }
}

function showWinResult() {
  if (!winResultEl) return;
  winResultEl.classList.remove("hidden");
}

function hideWinResult() {
  if (!winResultEl) return;
  winResultEl.classList.add("hidden");
  if (winPrizeNoteEl) winPrizeNoteEl.textContent = "";
}

let __confettiRAF = null;
let __confettiStopTimer = null;
let __confettiParticles = [];
let __confettiLastTs = 0;
let __confettiW = 0;
let __confettiH = 0;
let __confettiSpawn = null; // {cx, top, spreadX, spreadY}

function startConfetti(durationMs = 1200) {
  if (!confettiCanvasEl) return;
  stopConfetti();

  const ctx = confettiCanvasEl.getContext("2d");
  if (!ctx) return;

  const overlayEl = winResultEl; // win-overlay
  const cardEl = overlayEl ? overlayEl.querySelector(".win-card") : null;

  const resize = () => {
    // CSS 크기 -> 실제 픽셀 크기 맞춤
    const rect = confettiCanvasEl.getBoundingClientRect();
    const dpr = Math.min(1.25, window.devicePixelRatio || 1);
    confettiCanvasEl.width = Math.max(1, Math.floor(rect.width * dpr));
    confettiCanvasEl.height = Math.max(1, Math.floor(rect.height * dpr));
    // draw는 CSS 픽셀 좌표로(내부 픽셀은 dpr 반영)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    __confettiW = rect.width;
    __confettiH = rect.height;

    // ✅ 카드 기준 스폰 좌표도 여기서만 계산(매 프레임 측정 금지)
    let cx = __confettiW * 0.5;
    let top = __confettiH * 0.35;
    let spreadX = __confettiW * 0.16;
    let spreadY = __confettiH * 0.05;
    if (cardEl) {
      const canvasRect = rect; // getBoundingClientRect 결과 재사용
      const r = cardEl.getBoundingClientRect();
      // 캔버스 기준 좌표로 변환
      cx = r.left - canvasRect.left + r.width / 2;
      top = r.top - canvasRect.top + Math.min(34, r.height * 0.18);
      spreadX = Math.max(80, r.width * 0.3);
      spreadY = Math.max(10, r.height * 0.06);
    }
    __confettiSpawn = { cx, top, spreadX, spreadY };
  };

  resize();
  window.addEventListener("resize", resize, { passive: true });

  const colors = [
    "#ff4f8f",
    "#ffd54f",
    "#7cf0ff",
    "#b6ff6a",
    "#b48cff",
    "#ffffff",
  ];

  const rand = (a, b) => a + Math.random() * (b - a);

  // ✅ “짧은 버스트”로만: 재스폰/무한루프 금지
  const COUNT = 38; // 더 줄임(렉 줄이기)
  const s = __confettiSpawn || {
    cx: __confettiW * 0.5,
    top: __confettiH * 0.35,
    spreadX: 120,
    spreadY: 16,
  };
  __confettiParticles = Array.from({ length: COUNT }, () => ({
    x: rand(s.cx - s.spreadX, s.cx + s.spreadX),
    y: rand(s.top - s.spreadY, s.top + s.spreadY),
    vx: rand(-120, 120), // px/s
    vy: rand(-520, -320), // px/s
    g: rand(820, 1080), // px/s^2
    size: rand(3, 6),
    c: colors[(Math.random() * colors.length) | 0],
    life: rand(0.9, 1.0),
  }));

  const tick = (ts) => {
    if (!__confettiLastTs) __confettiLastTs = ts;
    // dt: 초 단위(너무 큰 dt는 클램프)
    const dt = Math.min(0.033, (ts - __confettiLastTs) / 1000);
    __confettiLastTs = ts;

    const w = __confettiW;
    const h = __confettiH;
    ctx.clearRect(0, 0, w, h);

    let alive = 0;
    for (let i = 0; i < __confettiParticles.length; i++) {
      const p = __confettiParticles[i];
      if (p.life <= 0) continue;
      p.vy += p.g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= 1.25 * dt;

      // draw (가벼운 사각 confetti)
      if (p.life > 0) {
        alive++;
        const a = Math.max(0, Math.min(1, p.life));
        ctx.globalAlpha = a;
        ctx.fillStyle = p.c;
        ctx.fillRect(
          p.x - p.size,
          p.y - p.size * 0.7,
          p.size * 2,
          p.size * 1.4,
        );
      }
    }
    ctx.globalAlpha = 1;

    // ✅ 살아있는 파티클 없으면 즉시 종료(불필요한 프레임 제거)
    if (alive <= 0) {
      stopConfetti();
      return;
    }
    __confettiRAF = requestAnimationFrame(tick);
  };

  __confettiLastTs = 0;
  __confettiRAF = requestAnimationFrame(tick);
  __confettiStopTimer = setTimeout(() => stopConfetti(), durationMs);

  // stopConfetti에서 removeEventListener를 해야 해서 핸들러를 캔버스에 붙여둠
  confettiCanvasEl.__kujiResizeHandler = resize;
}

function stopConfetti() {
  if (__confettiStopTimer) {
    clearTimeout(__confettiStopTimer);
    __confettiStopTimer = null;
  }

  if (__confettiRAF) {
    cancelAnimationFrame(__confettiRAF);
    __confettiRAF = null;
  }

  __confettiLastTs = 0;
  if (confettiCanvasEl) {
    const ctx = confettiCanvasEl.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, __confettiW || 9999, __confettiH || 9999);
    }
    const h = confettiCanvasEl.__kujiResizeHandler;
    if (typeof h === "function") {
      window.removeEventListener("resize", h);
    }
    delete confettiCanvasEl.__kujiResizeHandler;
  }
  __confettiParticles = [];
  __confettiW = 0;
  __confettiH = 0;
  __confettiSpawn = null;
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

function isAccessGranted() {
  return sessionStorage.getItem(ACCESS_OK_KEY) === "1";
}

function openAccessModal() {
  accessModalEl.classList.remove("hidden");
  accessModalEl.setAttribute("aria-hidden", "false");

  // 입력 포커스
  setTimeout(() => {
    accessInputEl.value = "";
    accessInputEl.focus();
  }, 0);
}

function closeAccessModal() {
  accessModalEl.classList.add("hidden");
  accessModalEl.setAttribute("aria-hidden", "true");
}

function tryEnterWithCode() {
  const code = String(accessInputEl.value ?? "").trim();
  if (!code) {
    showAlert("입장 코드를 입력해 주세요.");
    accessInputEl.focus();
    return;
  }

  if (code !== ACCESS_CODE) {
    showAlert("입장 코드가 올바르지 않아요.");
    accessInputEl.value = "";
    accessInputEl.focus();
    return;
  }

  sessionStorage.setItem(ACCESS_OK_KEY, "1");
  closeAccessModal();
  showToast("환영합니다! 🎉");
}

let toastTimer = null;

function showToast(message, duration = 1800) {
  if (!toastEl) return;

  toastEl.textContent = String(message ?? "");
  toastEl.classList.remove("hidden");

  // reflow to apply transition
  void toastEl.offsetWidth;

  toastEl.classList.add("show");

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove("show");
    setTimeout(() => {
      toastEl.classList.add("hidden");
    }, 250);
  }, duration);
}

function renderAll() {
  renderStatus();
  renderQueue();
  renderGrid();
  renderHistory();
  renderPrizeSummary();
  renderPrizeList();
  renderCounters();
}

function renderStatus() {
  if (state.sessionName) {
    statusTextEl.textContent = "진행 중";
    currentNameBadgeEl.textContent = state.sessionName;
  } else {
    statusTextEl.textContent = "대기";
    currentNameBadgeEl.textContent = "이름 없음";
  }
}

function getRemainingPrizeNumbers() {
  const hitCount = {};

  for (const h of state.history) {
    const n = h.number;
    hitCount[n] = (hitCount[n] || 0) + 1;
  }

  const remainingPrizeNums = [];

  const keys = Object.keys(PRIZES)
    .map(Number)
    .sort((a, b) => a - b);

  for (const num of keys) {
    const item = PRIZES[num];
    const hits = hitCount[num] || 0;
    const limit = Number.isFinite(item?.remaining) ? Number(item.remaining) : 1;

    if (hits < Math.max(1, limit)) {
      remainingPrizeNums.push(num);
    }
  }

  return remainingPrizeNums;
}

function renderCounters() {
  histCountEl.textContent = String(state.history.length);

  const remaining = state.opened.filter((v) => !v).length;
  remainingCountEl.textContent = String(remaining);

  if (remainingPrizeNumbersEl) {
    const nums = getRemainingPrizeNumbers();
    remainingPrizeNumbersEl.textContent =
      nums.length > 0 ? nums.join(", ") : "없음";
  }
}

let activeKujiIndex = null; // 지금 팝업으로 띄운 쿠지 index
let pendingWinCommitIndex = null; // ✅ 당첨 오버레이 닫힐 때 오픈 확정할 쿠지 index
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
      const revealedNumber = state.assignments[i];
      btn.setAttribute("data-reveal", String(revealedNumber));

      // ✅ 당첨 번호면만 색상 클래스 추가
      if (
        PRIZES &&
        Object.prototype.hasOwnProperty.call(PRIZES, revealedNumber)
      ) {
        btn.classList.add("win");
      }
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

function buildHistoryGroupsByName() {
  const rowsOldToNew = [...state.history].reverse();
  const grouped = new Map();
  const order = [];

  for (const r of rowsOldToNew) {
    const name = String(r.name ?? "").trim() || "이름없음";
    const number = r.number;

    if (!grouped.has(name)) {
      grouped.set(name, { totalCount: 0, segments: [] });
      order.push(name);
    }

    const entry = grouped.get(name);
    const lastSegment = entry.segments[entry.segments.length - 1];

    if (!lastSegment || lastSegment.closed) {
      entry.segments.push({ numbers: [number], closed: false });
    } else {
      lastSegment.numbers.push(number);
    }

    entry.totalCount += 1;

    for (const [otherName, otherEntry] of grouped.entries()) {
      if (otherName === name) continue;
      const otherLast = otherEntry.segments[otherEntry.segments.length - 1];
      if (otherLast) otherLast.closed = true;
    }
  }

  return { grouped, order };
}

function formatHistoryName(name, totalCount) {
  const count = Number(totalCount) || 0;
  return `${name} (${count})`;
}

function buildHistorySummaryText(grouped, order) {
  return order
    .map((name) => {
      const entry = grouped.get(name);
      const count = Number(entry?.totalCount) || 0;
      return `${name}*${count}`;
    })
    .join(", ");
}

function appendHistoryNumbers(tdNum, segments) {
  tdNum.innerHTML = "";

  segments.forEach((segment, segmentIdx) => {
    if (segmentIdx > 0) {
      tdNum.appendChild(document.createTextNode(" / "));
    }

    segment.numbers.forEach((n, idx) => {
      if (idx > 0) tdNum.appendChild(document.createTextNode(", "));

      const span = document.createElement("span");
      span.textContent = String(n);

      if (PRIZES && Object.prototype.hasOwnProperty.call(PRIZES, n)) {
        span.className = "num-win";
      }

      tdNum.appendChild(span);
    });
  });
}

function renderHistory() {
  if (!historyBodyEl) return;
  historyBodyEl.innerHTML = "";

  const { grouped, order } = buildHistoryGroupsByName();

  // ✅ 맨 위 요약 행 추가
  if (order.length > 0) {
    const summaryTr = document.createElement("tr");

    const summaryTd = document.createElement("td");
    summaryTd.colSpan = 2;
    summaryTd.className = "history-summary-cell";
    summaryTd.textContent = buildHistorySummaryText(grouped, order);

    summaryTr.appendChild(summaryTd);
    historyBodyEl.appendChild(summaryTr);
  }

  for (const name of order) {
    const entry = grouped.get(name);
    if (!entry) continue;

    const tr = document.createElement("tr");

    const tdName = document.createElement("td");
    tdName.textContent = formatHistoryName(name, entry.totalCount);

    const tdNum = document.createElement("td");
    appendHistoryNumbers(tdNum, entry.segments);

    tr.appendChild(tdName);
    tr.appendChild(tdNum);
    historyBodyEl.appendChild(tr);
  }
}

function openHistoryModal() {
  renderHistoryModal();
  historyModalEl.classList.remove("hidden");
  historyModalEl.setAttribute("aria-hidden", "false");
}

function closeHistoryModal() {
  historyModalEl.classList.add("hidden");
  historyModalEl.setAttribute("aria-hidden", "true");
}

function renderHistoryModal() {
  // 카운터
  histCountModalEl.textContent = String(state.history.length);
  const remaining = state.opened.filter((v) => !v).length;
  remainingCountModalEl.textContent = String(remaining);

  // 테이블
  historyBodyModalEl.innerHTML = "";

  const { grouped, order } = buildHistoryGroupsByName();

  // ✅ 요약 문구
  if (historySummaryModalEl) {
    const summaryText = buildHistorySummaryText(grouped, order);

    if (summaryText) {
      historySummaryModalEl.textContent = summaryText;
      historySummaryModalEl.classList.remove("hidden");
    } else {
      historySummaryModalEl.textContent = "";
      historySummaryModalEl.classList.add("hidden");
    }
  }

  for (const name of order) {
    const entry = grouped.get(name);
    if (!entry) continue;

    const tr = document.createElement("tr");

    const tdName = document.createElement("td");
    tdName.textContent = formatHistoryName(name, entry.totalCount);

    const tdNum = document.createElement("td");
    appendHistoryNumbers(tdNum, entry.segments);

    tr.appendChild(tdName);
    tr.appendChild(tdNum);
    historyBodyModalEl.appendChild(tr);
  }
}

function createPrizeCard(
  { num, item, hits, soldOut, remainingCount },
  options = {},
) {
  const { isModal = false } = options;

  const card = document.createElement("div");
  card.className = "prize-card";

  if (soldOut) card.classList.add("soldout");
  if (isModal) card.classList.add("is-modal-card");

  const thumb = document.createElement("div");
  thumb.className = "prize-thumb";

  const img = document.createElement("img");
  setImgSrcAsync(img, item.img, `./images/${num}.png`);
  img.alt = item.name;

  img.onerror = () => {
    img.onerror = null;
    img.src = "./images/placeholder.png";
  };

  thumb.appendChild(img);

  const meta = document.createElement("div");
  meta.className = "prize-meta";

  const nm = document.createElement("div");
  nm.className = "prize-name";
  nm.textContent = `${item.name}`;

  meta.appendChild(nm);

  // 바깥 목록은 기존처럼 티켓 배지 유지
  if (!isModal) {
    const numBadge = document.createElement("div");
    numBadge.className = "prize-num-badge";

    const bg = document.createElement("img");
    bg.className = "prize-num-bg";
    bg.src = hits > 0 ? "./images/winning.png" : "./images/prize.png";
    bg.alt = hits > 0 ? "winning" : "prize";

    const txt = document.createElement("div");
    txt.className = "prize-num-text";
    txt.textContent = String(num);

    if (hits > 0) txt.classList.add("is-winning-text");

    numBadge.appendChild(bg);
    numBadge.appendChild(txt);
    meta.appendChild(numBadge);
  }

  // 모달은 남은 수량 표시
  // if (isModal) {
  //   const remainText = document.createElement("div");
  //   remainText.className = "prize-remain-text";
  //   remainText.textContent = soldOut ? "SOLD OUT" : `수량 ${remainingCount}`;

  //   meta.appendChild(remainText);
  // }

  if (hits > 0 && !isModal) {
    card.classList.add("is-winning");
  }

  card.appendChild(thumb);
  card.appendChild(meta);

  return card;
}

function renderPrizeList() {
  if (prizeListEl) prizeListEl.innerHTML = "";
  if (prizeListModalGridEl) prizeListModalGridEl.innerHTML = "";

  const prizeEntries = getPrizeEntries();

  for (const entry of prizeEntries) {
    // 바깥 목록
    if (prizeListEl) {
      prizeListEl.appendChild(createPrizeCard(entry, { isModal: false }));
    }

    // 모달 목록
    if (prizeListModalGridEl) {
      prizeListModalGridEl.appendChild(
        createPrizeCard(entry, { isModal: true }),
      );
    }
  }
}

function openPrizeListModal() {
  renderPrizeList();
  prizeListModalEl?.classList.remove("hidden");
  prizeListModalEl?.setAttribute("aria-hidden", "false");
}

function closePrizeListModal() {
  prizeListModalEl?.classList.add("hidden");
  prizeListModalEl?.setAttribute("aria-hidden", "true");
}

function applyHeroToUI() {
  const heroImg = document.querySelector("#heroImg");
  const heroCode = document.querySelector("#heroCode");
  const heroName = document.querySelector("#heroName");

  if (heroCode) {
    heroCode.textContent =
      String(HERO?.code ?? DEFAULT_HERO.code).trim() || DEFAULT_HERO.code;
  }

  if (heroName) {
    heroName.textContent =
      String(HERO?.name ?? DEFAULT_HERO.name).trim() || DEFAULT_HERO.name;
  }

  if (!heroImg) return;

  // ✅ HERO도 IndexedDB(idb://...) 지원
  setImgSrcAsync(heroImg, HERO?.img, "./images/lo.png");
}

function applyLogoToUI() {
  if (!logoImgEl) return;
  setImgSrcAsync(logoImgEl, LOGO, DEFAULT_LOGO);
}

function loadConfigFromStorage() {
  const savedLogo = localStorage.getItem(LS_KEY_LOGO);
  LOGO = savedLogo || DEFAULT_LOGO;

  if (logoImgInputEl) {
    const raw = String(LOGO ?? "");
    const p = parseIdbRef(raw);

    if (p?.key) {
      logoImgInputEl.dataset.imgRef = raw;
      logoImgInputEl.value = p.name || "(업로드됨)";
    } else {
      delete logoImgInputEl.dataset.imgRef;
      logoImgInputEl.value = raw;
    }
  }

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

  // HERO
  const rawHero = localStorage.getItem(LS_KEY_HERO);
  if (rawHero) {
    try {
      const obj = JSON.parse(rawHero);
      if (obj && typeof obj === "object") HERO = obj;
    } catch {}
  } else {
    HERO = DEFAULT_HERO;
  }

  // modal 채우기
  settingsPrizesEl.value = JSON.stringify(PRIZES, null, 2);
  // settingsNumbersEl.value = localStorage.getItem(LS_KEY_NUMBERS) || "";

  // 설정 UI 채우기
  if (heroCodeInputEl) heroCodeInputEl.value = String(HERO.code ?? "");
  if (heroNameInputEl) heroNameInputEl.value = String(HERO.name ?? "");
  // ✅ HERO.img가 idb://...면 input엔 파일명만 보여주고, 실제 참조는 dataset에 보관
  if (heroImgInputEl) {
    const raw = String(HERO.img ?? "");
    const p = parseIdbRef(raw);
    if (p?.key) {
      heroImgInputEl.dataset.imgRef = raw;
      heroImgInputEl.value = p.name || "(업로드됨)";
    } else {
      delete heroImgInputEl.dataset.imgRef;
      heroImgInputEl.value = raw;
    }
  }

  // 직관 UI 채우기
  renderPrizeEditorFromPrizes();
  applyLogoToUI();
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
  const nextLogo = normalizeImageRef(
    String(logoImgInputEl?.dataset?.imgRef ?? logoImgInputEl?.value ?? ""),
  );

  try {
    localStorage.setItem(LS_KEY_LOGO, nextLogo || DEFAULT_LOGO);
  } catch {
    showAlert(
      "로고 저장이 실패했어요. 이미지 용량이 너무 크거나 브라우저 저장공간이 부족할 수 있어요.",
    );
    return;
  }

  // prizes: 에디터에서 읽기
  const nextPrizes = normalizePrizesObject(readPrizesFromEditor());
  if (Object.keys(nextPrizes).length === 0) {
    showAlert("상품 목록을 1개 이상 입력해 주세요. (번호와 상품명은 필수)");
    return;
  }

  // 숨김 textarea에도 동기화(호환/디버깅용)
  settingsPrizesEl.value = JSON.stringify(nextPrizes, null, 2);

  try {
    localStorage.setItem(LS_KEY_PRIZES, JSON.stringify(nextPrizes));
  } catch (e) {
    // ✅ 이미지(DataURL) 누적 등으로 localStorage 용량을 넘기면 여기로 옴
    showAlert(
      "저장이 실패했어요(브라우저 저장공간이 가득 찼을 가능성이 커요).\n\n해결 방법:\n1) 상품 이미지들은 파일로 '업로드(파일 선택)' 대신 ./images/폴더 경로로 넣기\n2) 또는 이미지 용량을 더 줄여서 다시 선택하기(현재는 자동 압축을 적용했지만, 아주 큰 이미지가 많으면 한계가 있어요).",
    );
    return;
  }
  // localStorage.setItem(LS_KEY_NUMBERS, settingsNumbersEl.value || "");

  const nextHero = {
    code: String(heroCodeInputEl?.value ?? "").trim(),
    name: String(heroNameInputEl?.value ?? "").trim(),
    img: normalizeImageRef(
      String(heroImgInputEl?.dataset?.imgRef ?? heroImgInputEl?.value ?? ""),
    ),
  };
  try {
    localStorage.setItem(LS_KEY_HERO, JSON.stringify(nextHero));
  } catch {
    showAlert(
      "저장이 실패했어요(브라우저 저장공간이 가득 찼을 가능성이 커요).\n\n최상단 피규어 이미지도 파일 업로드 대신 ./images/ 경로를 사용하거나, 더 작은 이미지로 다시 선택해 주세요.",
    );
    return;
  }

  PRIZES = nextPrizes;
  HERO = nextHero;
  LOGO = nextLogo || DEFAULT_LOGO;

  applyLogoToUI();
  applyHeroToUI();
  renderAll();
  closeSettings();
}

function normalizeImageRef(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  if (raw.startsWith("idb://") || raw.startsWith("data:")) {
    return raw;
  }

  let cleaned = raw.replace(/^(["'])(.*)\1$/, "$2").trim();
  cleaned = cleaned.replace(/\\/g, "/");

  // input[type=file]에서 흔한 가짜 경로 제거
  if (/^[a-zA-Z]:\/fakepath\//.test(cleaned)) {
    cleaned = cleaned.split("/").pop() || "";
  }

  // 이미 ./images/ 또는 images/를 여러 번 붙인 경우 정리
  cleaned = cleaned.replace(/^(\.\/)?images\/(?:images\/)+/i, "images/");

  return cleaned;
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
    const img = normalizeImageRef(String(v.img ?? ""));
    out[num] = {
      name,
      img,
      remaining: Number.isFinite(remaining) ? remaining : 1,
    };
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

function appendPrizeRow({ num = "", name = "", img = "", remaining = 1 }) {
  const row = document.createElement("div");
  row.className = "prize-row";

  const inNum = document.createElement("input");
  inNum.type = "number";
  inNum.placeholder = "번호";
  inNum.value = num;
  inNum.className = "in-num";

  const inName = document.createElement("input");
  inName.type = "text";
  inName.placeholder = "상품명";
  inName.value = name;
  inName.className = "in-name";

  // 이미지 입력 (경로)
  const imgWrap = document.createElement("div");
  imgWrap.style.display = "flex";
  imgWrap.style.gap = "6px";
  imgWrap.style.alignItems = "center";

  const inImg = document.createElement("input");
  inImg.type = "text";
  inImg.placeholder = "예) ./images/prize_01.png 또는 prize_01.png";
  // ✅ 저장값(img)이 idb://...면: input엔 파일명만, 실제 참조는 dataset에
  if (typeof img === "string" && img.startsWith("idb://")) {
    const p = parseIdbRef(img);
    inImg.dataset.imgRef = img;
    inImg.value = p?.name || "(업로드됨)";
  } else {
    delete inImg.dataset.imgRef;
    inImg.value = img;
  }
  inImg.className = "in-img";
  // ✅ 라스트원과 같은 방식으로 업로드/경로입력 둘 다 지원
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.style.display = "none";

  const btnPick = document.createElement("button");
  btnPick.type = "button";
  btnPick.className = "ghost";
  btnPick.textContent = "파일";
  btnPick.style.width = "55px";
  btnPick.style.flexShrink = "0";

  bindImagePicker({
    textInput: inImg,
    fileInput,
    pickButton: btnPick,
    successMessage: "상품 이미지 업로드 완료!",
    failureMessage:
      "상품 이미지 업로드에 실패했어요. 다른 파일로 다시 시도해 주세요.",
  });

  imgWrap.appendChild(inImg);
  imgWrap.appendChild(btnPick);
  imgWrap.appendChild(fileInput);

  const inRemain = document.createElement("input");
  inRemain.type = "number";
  inRemain.placeholder = "수량";
  inRemain.min = "1";
  inRemain.step = "1";
  inRemain.value = remaining ?? 1;
  inRemain.className = "in-remain";

  const btnDel = document.createElement("button");
  btnDel.type = "button";
  btnDel.className = "ghost btn-del";
  btnDel.textContent = "삭제";
  btnDel.addEventListener("click", () => row.remove());

  row.appendChild(inNum);
  row.appendChild(inName);
  row.appendChild(imgWrap);
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
    appendPrizeRow({
      num,
      name: it.name,
      img: it.img ?? "",
      remaining: it.remaining ?? 1,
    });
  }

  if (keys.length === 0)
    appendPrizeRow({ num: "", name: "", img: "", remaining: 1 });
}

function readPrizesFromEditor() {
  const rows = prizeRowsEl.querySelectorAll(".prize-row");
  const out = {};

  for (const row of rows) {
    const numEl = row.querySelector(".in-num");
    const nameEl = row.querySelector(".in-name");
    const imgEl = row.querySelector(".in-img");
    const remainEl = row.querySelector(".in-remain");

    const num = Number(numEl?.value);
    const name = String(nameEl?.value || "").trim();
    const img = normalizeImageRef(
      String(imgEl?.dataset?.imgRef ?? imgEl?.value ?? ""),
    );
    const remaining = Number(remainEl?.value);

    if (!Number.isFinite(num) || !name) continue;

    out[num] = {
      name,
      img,
      remaining: Number.isFinite(remaining) ? remaining : 1,
    };
  }

  return out;
}

function downloadExcel() {
  if (typeof XLSX === "undefined") {
    showAlert(
      "엑셀 다운로드 라이브러리(XLSX)를 불러오지 못했습니다. 인터넷 연결 또는 CDN 차단 여부를 확인해 주세요.",
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
    createdAtISO: new Date().toISOString(),
    total,
    assignments: arr,
    opened: Array.from({ length: total }, () => false),
    history: [],
    sessionName: null,
    queue: [],
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
    const queue = Array.isArray(parsed.queue)
      ? parsed.queue.filter((v) => typeof v === "string" && v.trim())
      : [];

    if (!assignments || assignments.length !== total) {
      assignments = Array.from({ length: total }, (_, i) => i + 1);
      shuffle(assignments);
    }
    if (!opened || opened.length !== total) {
      opened = Array.from({ length: total }, () => false);
    }

    return {
      createdAtISO,
      total,
      assignments,
      opened,
      history,
      sessionName,
      queue,
    };
  } catch {
    return makeFreshState(DEFAULT_TOTAL);
  }
}

function saveState() {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

/***********************
 * INDEXEDDB (이미지 저장)
 ***********************/
const IDB_NAME = "kuji_db";
const IDB_VERSION = 1;
const IDB_STORE_IMAGES = "images";

let __idbPromise = null;
function openKujiDB() {
  if (__idbPromise) return __idbPromise;
  __idbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE_IMAGES)) {
        db.createObjectStore(IDB_STORE_IMAGES);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return __idbPromise;
}

async function idbPutImageBlob(blob) {
  const db = await openKujiDB();
  const key =
    crypto?.randomUUID?.() ??
    `${Date.now()}_${Math.random().toString(16).slice(2)}`;

  await new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE_IMAGES, "readwrite");
    tx.objectStore(IDB_STORE_IMAGES).put(blob, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  return key;
}

async function idbGetImageBlob(key) {
  const db = await openKujiDB();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE_IMAGES, "readonly");
    const req = tx.objectStore(IDB_STORE_IMAGES).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function idbDeleteImageBlob(key) {
  const db = await openKujiDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE_IMAGES, "readwrite");
    tx.objectStore(IDB_STORE_IMAGES).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function makeIdbRef(key, fileName) {
  const name = encodeURIComponent(fileName || "");
  return `idb://${key}?name=${name}`;
}

function parseIdbRef(ref) {
  if (!ref || typeof ref !== "string") return null;
  if (!ref.startsWith("idb://")) return null;
  // idb://<key>?name=...
  const without = ref.slice("idb://".length);
  const [keyPart, query = ""] = without.split("?");
  const params = new URLSearchParams(query);
  const name = params.get("name") ? decodeURIComponent(params.get("name")) : "";
  return { key: keyPart, name };
}

// blob->objectURL 캐시 (렌더링 성능/중복 호출 방지)
const __imgUrlCache = new Map(); // key -> objectURL
async function resolveImgSrc(imgRef, fallback) {
  const raw = normalizeImageRef(imgRef);
  if (!raw) return fallback;

  // IndexedDB 참조
  const parsed = parseIdbRef(raw);
  if (parsed?.key) {
    if (__imgUrlCache.has(parsed.key)) return __imgUrlCache.get(parsed.key);

    const blob = await idbGetImageBlob(parsed.key);
    if (!blob) return fallback;

    const url = URL.createObjectURL(blob);
    __imgUrlCache.set(parsed.key, url);
    return url;
  }

  // 기존 로직 (url/data/path/파일명)
  if (raw.startsWith("data:") || /^[a-z]+:\/\//i.test(raw)) return raw;

  if (raw.startsWith("./") || raw.startsWith("../") || raw.startsWith("/")) {
    return raw;
  }

  if (/^(images|assets)\//i.test(raw)) {
    return `./${raw.replace(/^\.\//, "")}`;
  }

  if (raw.includes("/")) {
    return raw;
  }

  return `./images/${raw}`;
}

function setImgSrcAsync(imgEl, imgRef, fallback) {
  if (!imgEl) return;

  const safeFallback =
    normalizeImageRef(fallback) || "./images/placeholder.png";

  resolveImgSrc(imgRef, safeFallback)
    .then((src) => {
      imgEl.src = src || safeFallback;
    })
    .catch(() => {
      imgEl.src = safeFallback;
    });
}

async function preloadStoredImages() {
  const refs = [];

  // HERO 이미지
  if (HERO?.img) {
    refs.push(HERO.img);
  }

  // 상품 이미지들
  if (PRIZES && typeof PRIZES === "object") {
    for (const key of Object.keys(PRIZES)) {
      const img = PRIZES[key]?.img;
      if (img) refs.push(img);
    }
  }

  // idb:// 로 저장된 이미지만 미리 resolve
  const jobs = refs
    .map((ref) => normalizeImageRef(ref))
    .filter((ref) => typeof ref === "string" && ref.startsWith("idb://"))
    .map((ref) =>
      resolveImgSrc(ref, "./images/placeholder.png").catch(() => null),
    );

  await Promise.all(jobs);
}

// (선택) 페이지 떠날 때 objectURL 정리
window.addEventListener("beforeunload", () => {
  for (const url of __imgUrlCache.values()) URL.revokeObjectURL(url);
  __imgUrlCache.clear();
});

import type { ChecklistStatus } from '../data/akindo/checklist';

const STORAGE_KEY = 'akindo_kaigyo_progress_v1';
const allowedStatuses: ChecklistStatus[] = ['not_started', 'in_progress', 'completed'];
const labels: Record<ChecklistStatus, string> = { not_started: '未着手', in_progress: '進行中', completed: '完了' };

function setupChecklist(root: HTMLElement) {
  if (root.dataset.initialized) return;
  root.dataset.initialized = 'true';
  const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-item-id]'));
  const groups = Array.from(root.querySelectorAll<HTMLElement>('[data-phase]'));
  const phaseButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-phase-filter]'));
  const incomplete = root.querySelector<HTMLInputElement>('[data-incomplete-filter]')!;
  const progress = root.querySelector<HTMLProgressElement>('progress')!;
  const count = root.querySelector<HTMLElement>('[data-completed-count]')!;
  const percent = root.querySelector<HTMLElement>('[data-progress-percent]')!;
  const nextTitle = root.querySelector<HTMLElement>('[data-next-title]')!;
  const nextLabel = root.querySelector<HTMLElement>('[data-next-label]')!;
  const resume = root.querySelector<HTMLAnchorElement>('[data-resume]')!;
  const storageMessage = root.querySelector<HTMLElement>('[data-storage-message]')!;
  const storageDetails = root.querySelector<HTMLDetailsElement>('.checklist-storage-details')!;
  const storageSummary = root.querySelector<HTMLElement>('[data-storage-summary]')!;
  const phasePicker = root.querySelector<HTMLDetailsElement>('.checklist-phase-picker')!;
  const selectedPhaseLabel = root.querySelector<HTMLElement>('[data-selected-phase]')!;
  const announcement = root.querySelector<HTMLElement>('[data-checklist-announcement]')!;
  const visibleCount = root.querySelector<HTMLElement>('[data-visible-count]')!;
  const empty = root.querySelector<HTMLElement>('[data-empty]')!;
  const resetOpen = root.querySelector<HTMLButtonElement>('[data-reset-open]')!;
  const resetDialog = root.querySelector<HTMLDialogElement>('[data-reset-dialog]')!;
  const resetCancel = root.querySelector<HTMLButtonElement>('[data-reset-cancel]')!;
  const resetConfirm = root.querySelector<HTMLButtonElement>('[data-reset-confirm]')!;
  const states: Record<string, ChecklistStatus> = Object.fromEntries(cards.map(card => [card.dataset.itemId!, 'not_started']));
  let selectedPhase = 'all';
  let savedBefore = false;
  let canPersist = true;

  function unavailableStorage() {
    canPersist = false;
    storageDetails.open = true;
    storageSummary.textContent = '保存できない環境です';
    storageMessage.textContent = 'この環境では進捗を保存できません。このページを開いている間は使えますが、再読み込みすると失われます。';
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const stored: unknown = JSON.parse(raw);
        if (!stored || typeof stored !== 'object' || Array.isArray(stored)) throw new Error('Invalid progress');
        let invalid = false;
        for (const id of Object.keys(states)) {
          const value = (stored as Record<string, unknown>)[id];
          if (value === undefined) continue;
          if (typeof value === 'string' && allowedStatuses.includes(value as ChecklistStatus)) states[id] = value as ChecklistStatus;
          else invalid = true;
        }
        savedBefore = Object.values(states).some(status => status !== 'not_started');
        if (invalid) storageDetails.open = true;
        storageMessage.textContent = invalid ? '読み込めなかった項目は「未着手」に戻しました。確認できた進捗は復元しています。' : savedBefore ? 'この端末に保存した進捗を読み込みました。' : '進捗はこの端末のブラウザーに保存します。';
      } catch {
        storageDetails.open = true;
        storageMessage.textContent = '保存データを読み込めなかったため、未着手から表示しています。次の操作から新しく保存します。';
      }
    }
  } catch {
    unavailableStorage();
  }

  function persist() {
    if (!canPersist) return;
    try {
      // Store only task IDs and progress states. No answers, personal data, or timestamps.
      localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
      storageMessage.textContent = 'この端末に進捗を保存しました。';
    } catch {
      unavailableStorage();
    }
  }

  function render() {
    const completed = Object.values(states).filter(status => status === 'completed').length;
    count.textContent = String(completed);
    percent.textContent = `${Math.round(completed / cards.length * 100)}%`;
    progress.value = completed;
    progress.setAttribute('aria-valuetext', `${cards.length}項目中${completed}項目が完了`);
    for (const card of cards) {
      const state = states[card.dataset.itemId!];
      card.dataset.state = state;
      card.querySelector<HTMLElement>('[data-current-status]')!.textContent = labels[state];
      card.querySelectorAll<HTMLButtonElement>('[data-status]').forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.status === state));
        if (button.dataset.status === 'completed') {
          button.querySelector<HTMLElement>('[data-status-label]')!.textContent = state === 'completed' ? '完了' : '完了にする';
        }
      });
      const group = card.closest<HTMLElement>('[data-phase]');
      card.hidden = (selectedPhase !== 'all' && group?.dataset.phase !== selectedPhase) || (incomplete.checked && state === 'completed');
    }
    for (const group of groups) {
      const visible = Array.from(group.querySelectorAll<HTMLElement>('[data-item-id]')).filter(card => !card.hidden).length;
      group.hidden = visible === 0;
      group.querySelector<HTMLElement>('[data-phase-count]')!.textContent = `${visible}項目`;
    }
    const visible = cards.filter(card => !card.hidden).length;
    visibleCount.textContent = `${visible}項目を表示`;
    empty.hidden = visible > 0;
    phaseButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.phaseFilter === selectedPhase)));
    const activePhaseButton = phaseButtons.find(button => button.dataset.phaseFilter === selectedPhase);
    selectedPhaseLabel.textContent = activePhaseButton?.textContent?.trim().replace(/^\d+\s*/, '').replace(/^\+\s*/, '') ?? 'すべて';
    const next = cards.find(card => states[card.dataset.itemId!] === 'in_progress') || cards.find(card => states[card.dataset.itemId!] !== 'completed');
    if (next) {
      nextLabel.textContent = '次に進めること';
      nextTitle.textContent = next.dataset.title!;
      resume.href = `#${next.id}`;
      resume.textContent = savedBefore ? '続きから進める ↓' : 'ここから始める ↓';
      resume.hidden = false;
    } else {
      nextLabel.textContent = 'すべて確認できました';
      nextTitle.textContent = `${cards.length}項目の準備、おつかれさまでした。開業後も、状況が変わったら見直しましょう。`;
      resume.hidden = true;
    }
    resetOpen.disabled = !Object.values(states).some(status => status !== 'not_started');
  }

  function goToCard(card: HTMLElement) {
    selectedPhase = 'all';
    if (states[card.dataset.itemId!] === 'completed') incomplete.checked = false;
    render();
    const taskDetails = card.querySelector<HTMLDetailsElement>('.checklist-details');
    if (taskDetails) taskDetails.open = true;
    card.scrollIntoView({ behavior: 'auto', block: 'start' });
    card.focus({ preventScroll: true });
  }

  function handleHash(shouldScroll: boolean) {
    let id: string;
    try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
    const group = groups.find(candidate => candidate.id === id);
    if (group) {
      selectedPhase = group.dataset.phase!;
      incomplete.checked = false;
      render();
      if (shouldScroll) group.scrollIntoView({ behavior: 'auto', block: 'start' });
    } else {
      const card = cards.find(candidate => candidate.id === id);
      if (card) goToCard(card);
    }
  }

  root.querySelectorAll<HTMLButtonElement | HTMLInputElement>('[data-status], [data-phase-filter], [data-incomplete-filter]').forEach(control => { control.disabled = false; });
  root.addEventListener('click', event => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const statusButton = target.closest<HTMLButtonElement>('[data-status]');
    if (statusButton) {
      const card = statusButton.closest<HTMLElement>('[data-item-id]')!;
      const status = statusButton.dataset.status as ChecklistStatus;
      if (!allowedStatuses.includes(status) || states[card.dataset.itemId!] === status) return;
      states[card.dataset.itemId!] = status;
      savedBefore = true;
      persist();
      render();
      announcement.textContent = `${card.dataset.title}を「${labels[status]}」に変更しました。${cards.length}項目中${progress.value}項目が完了。${!canPersist ? 'この環境では保存できません。' : ''}`;
      // Keep keyboard focus in a visible control when the incomplete filter removes a completed card.
      if (card.hidden) {
        const currentIndex = cards.indexOf(card);
        const nextVisible = cards.slice(currentIndex + 1).find(candidate => !candidate.hidden)
          ?? cards.slice(0, currentIndex).reverse().find(candidate => !candidate.hidden);
        if (nextVisible) {
          nextVisible.scrollIntoView({ behavior: 'auto', block: 'start' });
          nextVisible.querySelector<HTMLButtonElement>('[data-status]')?.focus({ preventScroll: true });
        } else {
          incomplete.scrollIntoView({ behavior: 'auto', block: 'center' });
          incomplete.focus({ preventScroll: true });
        }
      }
    }
    const phaseButton = target.closest<HTMLButtonElement>('[data-phase-filter]');
    if (phaseButton) {
      selectedPhase = phaseButton.dataset.phaseFilter!;
      render();
      announcement.textContent = `${phaseButton.textContent?.trim()}：${visibleCount.textContent}`;
      phasePicker.open = false;
      phasePicker.querySelector<HTMLElement>('summary')?.focus({ preventScroll: true });
    }
  });

  incomplete.addEventListener('change', () => { render(); announcement.textContent = visibleCount.textContent; });
  resume.addEventListener('click', event => {
    const card = cards.find(candidate => `#${candidate.id}` === resume.hash);
    if (card) { event.preventDefault(); goToCard(card); }
  });
  root.querySelector<HTMLButtonElement>('[data-show-all]')!.addEventListener('click', () => {
    selectedPhase = 'all';
    incomplete.checked = false;
    render();
    phasePicker.querySelector<HTMLElement>('summary')?.focus();
    announcement.textContent = visibleCount.textContent;
  });

  function resetProgress() {
    for (const id of Object.keys(states)) states[id] = 'not_started';
    savedBefore = false;
    persist();
    render();
    announcement.textContent = '進捗をリセットしました。すべて未着手です。';
    if (resetDialog.open) resetDialog.close();
    resume.focus({ preventScroll: true });
  }
  resetOpen.addEventListener('click', () => {
    if (typeof resetDialog.showModal === 'function') resetDialog.showModal();
    else if (window.confirm('保存した進捗をすべて「未着手」に戻します。この操作は元に戻せません。リセットしますか？')) resetProgress();
  });
  resetCancel.addEventListener('click', () => resetDialog.close());
  resetConfirm.addEventListener('click', resetProgress);
  window.addEventListener('hashchange', () => handleHash(true));
  render();
  handleHash(true);
}

document.querySelectorAll<HTMLElement>('[data-checklist-app]').forEach(setupChecklist);

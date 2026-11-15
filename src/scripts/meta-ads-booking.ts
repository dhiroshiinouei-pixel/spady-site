import { metaAdsSetup as service } from '../data/meta-ads-setup';

type Track = (event: string, detail?: Record<string, string>) => void;
type BookingDay = { date: string; slots: string[] };
const jpDate = (date: string) => new Intl.DateTimeFormat('ja-JP', { month: 'long', day: 'numeric', weekday: 'short', timeZone: 'Asia/Tokyo' }).format(new Date(date));
const jpTime = (date: string) => new Intl.DateTimeFormat('ja-JP', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' }).format(new Date(date));
const dateKey = (date: Date) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(date);
const durationMinutes = 30;
const endOf = (start: string) => new Date(Date.parse(start) + durationMinutes * 60000).toISOString();
const timeRange = (start: string, end = endOf(start)) => `${jpDate(start)} ${jpTime(start)}〜${jpTime(end)}\n30分・日本時間`;
const larkUrl = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password && !url.port && /(^|\.)(larksuite\.com|feishu\.cn)$/.test(url.hostname) && /meeting|vc|video|\/j\//i.test(url.pathname) ? url.href : null; } catch { return null; }
};
const validSlot = (start: unknown, day: string): start is string => {
  if (typeof start !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(start)) return false;
  const date = new Date(start);
  if (!Number.isFinite(+date) || date.toISOString() !== start || dateKey(date) !== day || +date <= Date.now()) return false;
  const local = new Date(+date + 9 * 3600000), minutes = local.getUTCHours() * 60 + local.getUTCMinutes();
  return local.getUTCDay() >= 1 && local.getUTCDay() <= 5 && minutes >= 600 && minutes + durationMinutes <= 1020;
};

export function initSetupBooking(track: Track) {
  const panel = document.querySelector<HTMLElement>('#setupReservation');
  const availabilityStatus = document.querySelector<HTMLElement>('#setupAvailabilityStatus');
  const choices = document.querySelector<HTMLElement>('#setupCalendarChoices');
  const calendar = document.querySelector<HTMLElement>('#setupCalendarDays');
  const month = document.querySelector<HTMLElement>('#setupCalendarMonth');
  const slots = document.querySelector<HTMLElement>('#setupTimeSlots');
  const timesHeading = document.querySelector<HTMLElement>('#setupTimesHeading');
  const reload = document.querySelector<HTMLButtonElement>('#setupAvailabilityReload');
  const form = document.querySelector<HTMLFormElement>('#setupBookingForm');
  const personal = document.querySelector<HTMLFieldSetElement>('#setupPersonalFields');
  const selection = document.querySelector<HTMLElement>('#setupSelectedTime');
  const submit = document.querySelector<HTMLButtonElement>('#setupBookingSubmit');
  const status = document.querySelector<HTMLElement>('#setupBookingStatus');
  const completePanel = document.querySelector<HTMLElement>('#setupBookingComplete');
  const confirmedTime = document.querySelector<HTMLElement>('#setupConfirmedTime');
  const meetingLink = document.querySelector<HTMLAnchorElement>('#setupLarkMeeting');
  if (!panel || !availabilityStatus || !choices || !calendar || !month || !slots || !timesHeading || !reload || !form || !personal || !selection || !submit || !status || !completePanel || !confirmedTime || !meetingLink) return;

  let days: BookingDay[] = [], selected = '', selectedDay = '', attempted = '', busy = false, complete = false, manualReview = false, started = false, accepted = false;
  let receiptId = crypto.randomUUID().replaceAll('-', '');
  let submittedFields: FormData | null = null;
  const idField = form.querySelector<HTMLInputElement>('[name="id"]');
  const startedAt = form.querySelector<HTMLInputElement>('[name="form_started_at"]');
  if (idField) idField.value = receiptId;
  if (startedAt) startedAt.value = String(Date.now());
  const begin = () => { if (!started) { started = true; track(service.tracking.events.start); } };
  const syncControls = () => {
    calendar.querySelectorAll<HTMLButtonElement>('button[data-date]').forEach(button => { button.disabled = busy || complete || manualReview || !!attempted; });
    slots.querySelectorAll<HTMLButtonElement>('button').forEach(button => { button.disabled = busy || complete || manualReview || !!attempted; });
    personal.disabled = busy || complete || manualReview || !!submittedFields;
    submit.disabled = busy || complete || manualReview || !selected;
    reload.disabled = busy || complete || manualReview || !!attempted;
  };
  const showStatus = (state: string, message: string) => {
    status.dataset.state = state; status.textContent = message; status.hidden = false;
    status.focus({ preventScroll: true }); status.scrollIntoView({ behavior: 'auto', block: 'center' });
  };
  const renderTimes = (day: BookingDay) => {
    selectedDay = day.date; selected = ''; slots.replaceChildren(); submit.disabled = true;
    timesHeading.textContent = `${jpDate(day.date + 'T00:00:00+09:00')}の空き時間`;
    for (const start of day.slots) {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = jpTime(start);
      button.setAttribute('aria-label', `${jpDate(start)} ${jpTime(start)}から30分`); button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => {
        if (busy || complete || manualReview || attempted) return;
        begin(); selected = start;
        slots.querySelectorAll('button').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
        selection.textContent = `ご希望の相談日時\n${timeRange(start)}`; form.hidden = false; submit.disabled = false;
      });
      slots.append(button);
    }
    calendar.querySelectorAll<HTMLButtonElement>('button[data-date]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.date === selectedDay)));
    if (!submittedFields) form.hidden = true;
  };
  const renderCalendar = () => {
    calendar.replaceChildren(); slots.replaceChildren(); selected = ''; selectedDay = ''; form.hidden = true;
    const dated = days.filter(day => /^\d{4}-\d{2}-\d{2}$/.test(day.date)).sort((a, b) => a.date.localeCompare(b.date));
    if (!dated.length) return;
    const first = new Date(dated[0].date + 'T00:00:00Z');
    const last = new Date(dated[dated.length - 1].date + 'T00:00:00Z');
    const monthLabel = (date: Date) => `${date.getUTCFullYear()}年${date.getUTCMonth() + 1}月`;
    month.textContent = monthLabel(first) === monthLabel(last) ? monthLabel(first) : `${monthLabel(first)}〜${last.getUTCMonth() + 1}月`;
    for (let i = 0; i < first.getUTCDay(); i++) calendar.append(document.createElement('span'));
    for (let offset = 0; offset <= 31; offset++) {
      const current = new Date(+first + offset * 86400000); if (+current > +last) break;
      const key = current.toISOString().slice(0, 10), day = dated.find(item => item.date === key);
      const button = document.createElement('button'); button.type = 'button'; button.textContent = String(current.getUTCDate());
      button.setAttribute('aria-label', jpDate(key + 'T00:00:00+09:00') + (day?.slots.length ? ' 空きあり' : ' 予約枠なし'));
      if (day?.slots.length) {
        button.dataset.date = key; button.setAttribute('aria-pressed', 'false');
        button.addEventListener('click', () => { if (!busy && !complete && !manualReview && !attempted) { begin(); renderTimes(day); } });
      } else button.disabled = true;
      calendar.append(button);
    }
    timesHeading.textContent = '日付を選択してください';
  };
  const load = async () => {
    if (busy || complete || manualReview || attempted) return;
    busy = true; choices.hidden = true; reload.hidden = true; availabilityStatus.textContent = 'Googleカレンダーの空き状況を確認しています…'; panel.setAttribute('aria-busy', 'true'); syncControls();
    try {
      const responses = await Promise.all([
        fetch(service.booking.infoEndpoint, { cache: 'no-store', signal: AbortSignal.timeout(18000) }),
        fetch(service.booking.availabilityEndpoint, { cache: 'no-store', signal: AbortSignal.timeout(18000) }),
      ]);
      const [info, availability] = await Promise.all(responses.map(response => response.json()));
      if (!responses.every(response => response.ok) || info.calendar !== true || info.meetingProvider !== 'lark' || info.meetingReady !== true || info.duration !== durationMinutes || info.timezone !== 'Asia/Tokyo' || !Array.isArray(availability.days)) throw new Error('unavailable');
      days = availability.days.filter((day: BookingDay) => day && typeof day.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day.date) && Array.isArray(day.slots)).slice(0, 31).map((day: BookingDay) => ({ date: day.date, slots: [...new Set(day.slots.filter(value => validSlot(value, day.date)))].sort() }));
      if (days.some(day => day.slots.length)) {
        choices.hidden = false; availabilityStatus.textContent = 'ご希望の日付と時間をお選びください。予約確定時にも空き状況を確認します。'; renderCalendar();
      } else {
        availabilityStatus.textContent = '現在、予約できる空き枠がありません。時間をおいて、空き状況をご確認ください。予約はまだ完了していません。';
      }
    } catch {
      availabilityStatus.textContent = `現在、カレンダー予約の接続を確認できません。予約はまだ完了していません。再確認しても表示されない場合は ${service.contactEmail} へお問い合わせください。`;
    } finally { busy = false; panel.removeAttribute('aria-busy'); reload.hidden = false; syncControls(); }
  };
  reload.addEventListener('click', () => void load());
  form.addEventListener('input', begin);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || complete || manualReview || !selected || (!submittedFields && !form.reportValidity())) return;
    if (panel.dataset.accepting !== 'true') { showStatus('error', '開発プレビューのため、予約は作成されていません。'); return; }
    begin(); busy = true; form.setAttribute('aria-busy', 'true'); submit.textContent = '予約を確定しています…';
    submittedFields ||= new FormData(form); syncControls();
    status.hidden = false; status.dataset.state = 'sending'; status.textContent = '空き状況を再確認し、カレンダーとLarkミーティングを作成しています。画面を閉じずにお待ちください。';
    try {
      if (!accepted) {
        const response = await fetch(service.booking.intakeEndpoint, { method: 'POST', body: submittedFields, headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(20000) });
        const data = await response.json();
        if (response.status !== 200 || data.ok !== true || data.request_id !== receiptId) {
          if (response.status === 400) {
            submittedFields = null; receiptId = crypto.randomUUID().replaceAll('-', ''); if (idField) idField.value = receiptId;
            throw new Error('validation');
          }
          throw new Error('intake_unconfirmed');
        }
        accepted = true;
      }
      attempted ||= selected; syncControls();
      const response = await fetch(service.booking.reservationEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ receipt_id: receiptId, start: attempted }), signal: AbortSignal.timeout(55000) });
      const data = await response.json();
      if (response.status === 503 && data.code === 'manual_review_required') {
        manualReview = true;
        showStatus('error', `Larkミーティングの作成結果を自動確認できません。重複を防ぐため、新たに予約せず ${service.contactEmail} へ以下の受付IDをお知らせください。\n受付ID：${receiptId}\nこの画面を残したまま、ご案内をお待ちください。予約はまだ確定していません。`);
        track(service.tracking.events.failure, { outcome: 'manual_review_required' });
        return;
      }
      if (response.status === 409 && data.code === 'slot_unavailable') {
        attempted = ''; selected = ''; busy = false;
        showStatus('error', '選択した日時は予約できなくなりました。ご相談内容は受付済みです。別の日時を選び、予約を確定してください。');
        await load(); return;
      }
      const meeting = larkUrl(data.meeting_url);
      if (response.status !== 200 || data.ok !== true || data.request_id !== receiptId || data.start !== attempted || data.end !== endOf(attempted) || !meeting) throw new Error('booking_unconfirmed');
      complete = true; choices.hidden = true; reload.hidden = true; form.hidden = true; status.hidden = true;
      availabilityStatus.textContent = 'カレンダーへの登録とLarkミーティングの作成が完了しました。';
      confirmedTime.textContent = timeRange(data.start, data.end); meetingLink.href = meeting; completePanel.hidden = false;
      completePanel.focus({ preventScroll: true }); completePanel.scrollIntoView({ behavior: 'auto', block: 'center' });
      track(service.tracking.events.success);
    } catch (error) {
      const reason = error instanceof Error ? error.message : '';
      const message = reason === 'validation' ? '予約は完了していません。入力内容と確認事項を見直して、もう一度お試しください。' : attempted ? '予約の確定を確認できませんでした。重複予約を防ぐため、この日時のまま「予約状況を再確認する」を押してください。確認が取れるまで、この画面を残してください。' : 'ご相談内容の受付を確認できませんでした。入力内容はこの画面に残っています。「予約状況を再確認する」から、同じ内容で再確認してください。';
      showStatus('error', message); track(service.tracking.events.failure, { outcome: reason === 'validation' ? 'validation' : 'unconfirmed' });
    } finally {
      busy = false; form.removeAttribute('aria-busy'); submit.textContent = complete ? '予約が確定しました' : manualReview ? '連絡による確認が必要です' : submittedFields && selected ? '予約状況を再確認する' : 'この日時で相談を予約する'; syncControls();
    }
  });
  // Availability is read only when the visitor reaches the booking panel; no PII is stored locally.
  const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); void load(); } }, { rootMargin: '300px' });
  observer.observe(panel);
}

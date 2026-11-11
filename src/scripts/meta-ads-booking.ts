type BookingDay = { date: string; slots: string[] };
const dayLabel = (date: string) => new Intl.DateTimeFormat('ja-JP', { month: 'long', day: 'numeric', weekday: 'short', timeZone: 'Asia/Tokyo' }).format(new Date(date + 'T00:00:00+09:00'));
const timeLabel = (date: string) => new Intl.DateTimeFormat('ja-JP', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' }).format(new Date(date));
const fullLabel = (date: string) => new Intl.DateTimeFormat('ja-JP', { month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' }).format(new Date(date));

// The opaque receipt stays only in this page's memory. No names or emails are resent.
export async function startSetupBooking(receipt: string) {
  const panel = document.querySelector<HTMLElement>('#setupBooking');
  const status = document.querySelector<HTMLElement>('#setupBookingStatus');
  const choices = document.querySelector<HTMLElement>('#setupBookingChoices');
  const dateSelect = document.querySelector<HTMLSelectElement>('#setupBookingDate');
  const slots = document.querySelector<HTMLElement>('#setupBookingSlots');
  const selectedText = document.querySelector<HTMLElement>('#setupBookingSelected');
  const confirm = document.querySelector<HTMLButtonElement>('#setupBookingConfirm');
  const reload = document.querySelector<HTMLButtonElement>('#setupBookingReload');
  const result = document.querySelector<HTMLElement>('#setupBookingResult');
  const meetingLink = document.querySelector<HTMLAnchorElement>('#setupMeetingLink');
  if (!panel || !status || !choices || !dateSelect || !slots || !selectedText || !confirm || !reload || !result || !meetingLink) return;
  panel.hidden = false;
  let days: BookingDay[] = [], selected = '', attempted = '', busy = false, complete = false;
  const setControls = (locked: boolean) => {
    dateSelect.disabled = locked;
    slots.querySelectorAll<HTMLButtonElement>('button').forEach(button => button.disabled = locked);
    confirm.disabled = busy || complete || !selected;
    reload.disabled = busy || complete || !!attempted;
  };
  const showResult = (state: string, text: string) => {
    result.dataset.state = state; result.textContent = text; result.hidden = false;
    result.focus({ preventScroll: true });
    result.scrollIntoView({ behavior: 'auto', block: 'center' });
  };
  const renderSlots = () => {
    selected = ''; confirm.disabled = true; selectedText.textContent = '時間を選択してください。'; slots.replaceChildren();
    for (const start of days.find(day => day.date === dateSelect.value)?.slots || []) {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = timeLabel(start); button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => {
        if (busy || attempted || complete) return;
        selected = start;
        slots.querySelectorAll('button').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
        selectedText.textContent = fullLabel(start) + '〜（30分・日本時間）'; confirm.disabled = false;
      });
      slots.append(button);
    }
  };
  const load = async () => {
    if (busy || attempted || complete) return;
    busy = true; choices.hidden = true; reload.hidden = true; status.textContent = 'Googleカレンダーの空き状況を確認しています…'; panel.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch('/api/booking/availability', { signal: AbortSignal.timeout(15000), cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.days)) throw new Error('unavailable');
      days = data.days.filter((day: BookingDay) => typeof day.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day.date) && Array.isArray(day.slots)).map((day: BookingDay) => ({ date: day.date, slots: day.slots.filter(value => typeof value === 'string' && Number.isFinite(Date.parse(value))) })).filter((day: BookingDay) => day.slots.length);
      dateSelect.replaceChildren();
      for (const day of days) { const option = document.createElement('option'); option.value = day.date; option.textContent = dayLabel(day.date); dateSelect.append(option); }
      if (days.length) {
        choices.hidden = false; status.textContent = '空いている日時からお選びください。予約確定時に、もう一度空き状況を確認します。'; renderSlots();
      } else status.textContent = '現在、予約できる空き枠がありません。相談内容は受け付けていますので、日程はメールで調整します。';
    } catch { status.textContent = '現在、Googleカレンダーの空き状況を取得できません。ご相談の受付は完了しています。再確認するか、メールでの日程調整をお待ちください。'; }
    finally { busy = false; reload.hidden = false; panel.removeAttribute('aria-busy'); setControls(false); }
  };
  dateSelect.addEventListener('change', renderSlots);
  reload.addEventListener('click', () => void load());
  confirm.addEventListener('click', async () => {
    if (busy || complete || !selected) return;
    busy = true; attempted ||= selected; setControls(true); confirm.textContent = '予約を確認しています…';
    try {
      const response = await fetch('/api/meta-ads-booking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ receipt_id: receipt, start: attempted }), signal: AbortSignal.timeout(50000) });
      const data = await response.json();
      if (response.status !== 200 || data.ok !== true || data.request_id !== receipt || data.start !== attempted) {
        if (response.status === 409 && data.code === 'slot_unavailable') {
          attempted = ''; selected = ''; busy = false;
          showResult('error', '選択した時間は予約できなくなりました。相談内容は受付済みです。別の日時をお選びください。');
          await load(); return;
        }
        throw new Error('unconfirmed');
      }
      complete = true; choices.hidden = true; reload.hidden = true;
      status.textContent = 'Googleカレンダーへの登録が完了しました。';
      showResult('success', `相談の予約が確定しました。\n${fullLabel(attempted)}〜（30分・日本時間）\nご入力のメールアドレスへカレンダーからの案内が届きます。`);
      if (typeof data.meeting_url === 'string') {
        try { const url = new URL(data.meeting_url); if (url.protocol === 'https:' && !url.username && !url.password && (url.hostname === 'meet.google.com' || /(^|\.)larksuite\.com$/.test(url.hostname))) { meetingLink.href = url.href; meetingLink.hidden = false; } } catch { /* Never render an invalid meeting URL. */ }
      }
    } catch {
      showResult('error', '相談内容は受付済みですが、予約の確定を確認できませんでした。この日時のまま再確認してください。確認が取れるまで、日時を変更せず、この画面を残してください。');
    } finally {
      busy = false; confirm.textContent = complete ? '予約が確定しました' : attempted ? 'この日時の予約を再確認する' : 'この日時で相談を予約する'; setControls(complete || !!attempted);
    }
  });
  await load();
}

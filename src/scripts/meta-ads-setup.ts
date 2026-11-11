import { startSetupBooking } from './meta-ads-booking';
import { metaAdsSetup as service } from '../data/meta-ads-setup';

type SetupWindow = Window & {dataLayer?: Record<string,unknown>[]; __spadyGtmLoaded?: boolean};
const analyticsWindow = window as SetupWindow;
// Only fixed allowlisted properties; never send field values, URL parameters or request IDs.
function track(event: string, detail: Record<string,string> = {}) {
  if (!service.tracking.enabled || !analyticsWindow.__spadyGtmLoaded) return;
  try { if (localStorage.getItem('spady_cookie_consent') !== 'granted') return; } catch { return; }
  analyticsWindow.dataLayer ||= [];
  analyticsWindow.dataLayer.push({event,service:'meta_ads_setup',...detail});
}
const form = document.querySelector<HTMLFormElement>('#setupForm');
const status = document.querySelector<HTMLElement>('#setupStatus');
const submit = form?.querySelector<HTMLButtonElement>('[type="submit"]');
const fields = document.querySelector<HTMLFieldSetElement>('#setupFields');
const startedAt = form?.querySelector<HTMLInputElement>('[name="form_started_at"]');
// Stable within this page only: retries resolve the same persisted receipt, without storing PII.
const receiptId = crypto.randomUUID().replaceAll('-', '');
const idField = form?.querySelector<HTMLInputElement>('[name="id"]');
if (idField) idField.value = receiptId;
let pending = false;
let accepted = false;
let started = false;
if (startedAt) startedAt.value = String(Date.now());
// The preview button exercises validation but never sends while acceptingInquiries is false.
if (submit) submit.disabled = false;
form?.addEventListener('input', () => {
  if (started) return;
  started = true;
  track(service.tracking.events.start);
});
document.querySelectorAll<HTMLAnchorElement>('[data-setup-cta]').forEach(link => {
  link.addEventListener('click', () => {
    const placement=link.dataset.setupCta;
    if (placement && ['header','hero','pricing','sticky'].includes(placement)) track(service.tracking.events.cta,{placement});
  });
});
const showStatus = (state:string, message:string) => {
  if (!status) return;
  status.dataset.state = state;
  status.textContent = message;
  status.hidden = false;
  status.focus({preventScroll:true});
  status.scrollIntoView({behavior:'auto',block:'center'});
};
form?.addEventListener('submit', async event => {
  event.preventDefault();
  if (pending || accepted || !submit || !fields || !status || !form.reportValidity()) return;
  if (form.dataset.accepting !== 'true') {
    showStatus('preview','この開発プレビューでは受付は接続されていません。入力内容は送信されていません。公開前に送信先との接続確認を行います。');
    return;
  }
  pending = true;
  submit.disabled = true;
  form.setAttribute('aria-busy','true');
  const buttonLabel = submit.querySelector('span');
  if (buttonLabel) buttonLabel.textContent = '送信中です…';
  status.hidden = false;
  status.dataset.state = 'sending';
  status.textContent = '送信しています。画面を閉じずにお待ちください。';
  const body = new FormData(form);
  fields.disabled = true;
  const controller = new AbortController();
  const timeout = setTimeout(()=>controller.abort(),20000);
  let validationMessage = '';
  try {
    const response = await fetch(form.action,{method:'POST',body,headers:{Accept:'application/json'},signal:controller.signal});
    const result: {ok?: boolean; request_id?: string; message?: string} = await response.json().catch(()=>({}));
    // Success requires durable acceptance; notification jobs may still be processing.
    if (response.status !== 200 || result.ok !== true || result.request_id !== receiptId) {
      if (response.status === 400 && typeof result.message === 'string') validationMessage = result.message.slice(0, 300);
      throw new Error(response.status === 503 ? 'unavailable' : 'unconfirmed');
    }
    accepted = true;
    form.reset();
    fields.hidden = true;
    form.querySelector<HTMLElement>('.form-required-note')?.setAttribute('hidden', '');
    if (buttonLabel) buttonLabel.textContent = '受付が完了しました';
    showStatus('success','ご相談を受け付けました。\nアカウントの状況と対応範囲を確認し、ご入力のメールアドレスへご連絡します。送信時点で、ご契約・お支払いは発生していません。');
    track(service.tracking.events.success);
    void startSetupBooking(receiptId);
  } catch (error) {
    const unavailable = error instanceof Error && error.message === 'unavailable';
    const outcome = unavailable ? 'unavailable' : 'unconfirmed';
    showStatus('error',validationMessage ? `受付は完了していません。${validationMessage}` : unavailable ? '受付の完了を確認できませんでした。入力内容はこの画面に残っています。時間をおいて、この画面からもう一度お試しください。' : `受付の完了を確認できませんでした。入力内容はこの画面に残っています。時間をおいて、この画面からもう一度お試しください。ご不明な場合は ${service.contactEmail} へお問い合わせください。`);
    track(service.tracking.events.failure,{outcome});
    fields.disabled = false;
    submit.disabled = false;
    if (buttonLabel) buttonLabel.textContent = '相談内容を送信する';
  } finally {
    clearTimeout(timeout);
    pending = false;
    form.removeAttribute('aria-busy');
  }
});

// Hide the mobile bar while consent or the consultation section is visible, or any field is focused.
const sticky = document.querySelector<HTMLElement>('#setupSticky');
const consent = document.querySelector<HTMLElement>('#siteConsent');
const hero = document.querySelector<HTMLElement>('.hero');
const consultation = document.querySelector<HTMLElement>('#consultation');
let heroVisible = true;
let formVisible = false;
const updateSticky = () => {
  if (!sticky) return;
  const focused = document.activeElement instanceof Element && !!document.activeElement.closest('input,textarea,select');
  sticky.hidden = heroVisible || formVisible || focused || (!!consent && !consent.hidden);
};
const observer = new IntersectionObserver(entries=>{
  for (const entry of entries) {
    if (entry.target === hero) heroVisible = entry.isIntersecting;
    if (entry.target === consultation) formVisible = entry.isIntersecting;
  }
  updateSticky();
});
if (hero) observer.observe(hero);
if (consultation) observer.observe(consultation);
if (consent) new MutationObserver(updateSticky).observe(consent,{attributes:true,attributeFilter:['hidden']});
document.addEventListener('focusin',updateSticky);
document.addEventListener('focusout',()=>requestAnimationFrame(updateSticky));
updateSticky();

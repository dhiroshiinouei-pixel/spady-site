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
document.querySelectorAll<HTMLAnchorElement>('[data-setup-cta]').forEach(link => {
  link.addEventListener('click', () => {
    const placement=link.dataset.setupCta;
    if (placement && ['header','hero','pricing','final','sticky'].includes(placement)) track(service.tracking.events.cta,{placement,destination:'line'});
  });
});
// A LINE link click is an outbound click, never a confirmed inquiry or booking.
// Hide the mobile bar while consent or the final reservation section is visible.
const sticky = document.querySelector<HTMLElement>('#setupSticky');
const consent = document.querySelector<HTMLElement>('#siteConsent');
const hero = document.querySelector<HTMLElement>('.hero');
const consultation = document.querySelector<HTMLElement>('#consultation');
let heroVisible = true;
let reservationVisible = false;
const updateSticky = () => {
  if (!sticky) return;
  sticky.hidden = heroVisible || reservationVisible || (!!consent && !consent.hidden);
};
const observer = new IntersectionObserver(entries=>{
  for (const entry of entries) {
    if (entry.target === hero) heroVisible = entry.isIntersecting;
    if (entry.target === consultation) reservationVisible = entry.isIntersecting;
  }
  updateSticky();
});
if (hero) observer.observe(hero);
if (consultation) observer.observe(consultation);
if (consent) new MutationObserver(updateSticky).observe(consent,{attributes:true,attributeFilter:['hidden']});
updateSticky();

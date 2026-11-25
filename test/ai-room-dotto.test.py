from pathlib import Path
import re

dist = Path("dist")
room = sorted((dist / "ai").rglob("index.html"))
assert len(room) >= 6
room.append(dist / "ai-guides/first-workflow/index.html")
for page in room:
    text = page.read_text()
    assert len(re.findall(r'<div[^>]*data-ai-room-dotto(?:[ >])', text)) == 1, f"{page} should have one Dotto"
    assert re.search(r'<button(?=[^>]*popovertarget="ai-room-quick-guide")(?=[^>]*aria-label="AI部屋のガイドを開く")[^>]*>', text), page
    assert re.search(r'<section(?=[^>]*id="ai-room-quick-guide")(?=[^>]*popover="auto")[^>]*>', text), page
    assert 'popovertargetaction="hide"' in text, page
    assert "body.ai-room-with-dotto:has(#siteConsent:not([hidden]))" in text, page
    assert 'id="siteConsent"' in text, page
    assert "data-dotto-cloud-crown" in text and "room-dotto-orbit" not in text, page
    assert not re.search(r'<span[^>]*room-dotto__name', text), f"{page} should not show a name label"
    for motion in ("dotto-drift", "dotto-breathe", "dotto-blink", "dotto-crown", "dotto-shadow"):
        assert motion in text, (page, motion)
for name in ["index.html", "services/ai-training/index.html", "services/ai-implementation/index.html"]:
    assert "data-ai-room-dotto" not in (dist / name).read_text(), name
print(f"Verified Dotto on {len(room)} AI Room pages and absent from 3 unrelated pages.")

home = (dist / "index.html").read_text()
assert 'data-name="どっと"' in home and "felt-dotto" in home
for pid in ["ai-training", "ai-implementation", "web-design"]:
    page = (dist / "services" / pid / "index.html").read_text()
    assert '/home/crew-dots/dotto.svg' in page and "ラヴ" not in page, pid
for pid, member in [("digital-marketing","ado"), ("meta-ads","meme"), ("line-official-account","lala")]:
    assert f'/home/crew-dots/{member}.webp' in (dist / "services" / pid / "index.html").read_text(), pid
assert (dist / "home/crew-dots/dotto.svg").is_file()
print("Verified the homepage crew and all six service pages.")

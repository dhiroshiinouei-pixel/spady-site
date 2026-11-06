import { diagnosisQuestions, diagnosisSteps, getDiagnosisResult, isCompleteDiagnosis, type DiagnosisAnswers } from '../data/akindo/diagnosis';

const root = document.querySelector<HTMLElement>('[data-diagnosis]');

if (root) {
  const form = root.querySelector<HTMLFormElement>('[data-diagnosis-form]')!;
  const questionsView = root.querySelector<HTMLElement>('[data-diagnosis-questions]')!;
  const resultsView = root.querySelector<HTMLElement>('[data-diagnosis-results]')!;
  const steps = Array.from(root.querySelectorAll<HTMLElement>('[data-diagnosis-step]'));
  const back = root.querySelector<HTMLButtonElement>('[data-diagnosis-back]')!;
  const next = root.querySelector<HTMLButtonElement>('[data-diagnosis-next]')!;
  const error = root.querySelector<HTMLElement>('[data-diagnosis-error]')!;
  const meter = root.querySelector<HTMLProgressElement>('[data-diagnosis-meter]')!;
  let currentStep = 0;

  const readAnswers = (): Partial<DiagnosisAnswers> => {
    const data = new FormData(form);
    return Object.fromEntries(diagnosisQuestions.map(({ id }) => [id, data.get(id)]).filter(([, value]) => typeof value === 'string'));
  };

  function updateProgress() {
    const answered = Object.keys(readAnswers()).length;
    meter.value = answered;
    root!.querySelector('[data-diagnosis-answered]')!.textContent = `${answered} / ${diagnosisQuestions.length} 回答済み`;
  }

  function showStep(index: number, focus = true) {
    currentStep = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((step, stepIndex) => { step.hidden = stepIndex !== currentStep; });
    root!.querySelectorAll<HTMLElement>('[data-step-marker]').forEach((marker, markerIndex) => {
      if (markerIndex === currentStep) marker.setAttribute('aria-current', 'step');
      else marker.removeAttribute('aria-current');
      marker.classList.toggle('is-finished', markerIndex < currentStep);
    });
    back.hidden = currentStep === 0;
    next.textContent = currentStep === steps.length - 1 ? '診断結果を見る →' : '次の質問へ →';
    root!.querySelector('[data-diagnosis-stage]')!.textContent = `STEP ${currentStep + 1} / ${steps.length}`;
    error.hidden = true;
    form.querySelectorAll('[aria-invalid]').forEach((input) => input.removeAttribute('aria-invalid'));
    if (focus) steps[currentStep].querySelector<HTMLElement>('h2')?.focus();
    updateProgress();
  }

  function showResults(answers: DiagnosisAnswers) {
    const result = getDiagnosisResult(answers);
    root!.querySelector('[data-diagnosis-next-title]')!.textContent = result.nextAction.title;
    root!.querySelector('[data-diagnosis-next-description]')!.textContent = result.nextAction.description;
    root!.querySelectorAll<HTMLUListElement>('[data-diagnosis-tier]').forEach((list) => {
      list.replaceChildren();
      const count = root!.querySelector(`[data-diagnosis-count="${list.dataset.diagnosisTier}"]`);
      if (count) count.textContent = `${result.recommendations.filter((item) => item.priority === list.dataset.diagnosisTier).length}項目`;
      result.recommendations.filter((item) => item.priority === list.dataset.diagnosisTier).forEach((item) => {
        const row = document.createElement('li');
        const title = document.createElement('h4');
        const description = document.createElement('p');
        const titleText = document.createElement('span');
        titleText.textContent = item.title;
        const icon = root!.querySelector<HTMLTemplateElement>(`template[data-diagnosis-icon="${item.id}"]`);
        if (icon) title.append(icon.content.cloneNode(true));
        title.append(titleText);
        description.textContent = item.reason;
        row.append(title, description);
        list.append(row);
      });
    });
    const guidance = root!.querySelector('[data-diagnosis-guidance]')!;
    guidance.replaceChildren();
    result.guidance.forEach((item) => {
      const card = document.createElement('article');
      const title = document.createElement('h3');
      const description = document.createElement('p');
      title.textContent = item.title;
      description.textContent = item.description;
      card.append(title, description);
      guidance.append(card);
    });
    questionsView.hidden = true;
    resultsView.hidden = false;
    resultsView.querySelector<HTMLElement>('h2')!.focus();
  }

  function advance() {
    const answers = readAnswers();
    const missing = diagnosisSteps[currentStep].questionIds.filter((id) => !answers[id]);
    if (missing.length > 0) {
      error.textContent = 'このページの質問に回答してから、次へ進んでください。';
      error.hidden = false;
      missing.forEach((id) => form.querySelectorAll<HTMLInputElement>(`input[name="${id}"]`).forEach((input) => input.setAttribute('aria-invalid', 'true')));
      form.querySelector<HTMLInputElement>(`input[name="${missing[0]}"]`)?.focus();
      return;
    }
    if (currentStep < steps.length - 1) {
      showStep(currentStep + 1);
      return;
    }
    if (isCompleteDiagnosis(answers)) showResults(answers);
    else {
      const unansweredStep = diagnosisSteps.findIndex((step) => step.questionIds.some((id) => !answers[id]));
      showStep(Math.max(unansweredStep, 0));
    }
  }

  next.addEventListener('click', advance);
  back.addEventListener('click', () => showStep(currentStep - 1));
  form.addEventListener('submit', (event) => { event.preventDefault(); advance(); });
  form.addEventListener('change', (event) => {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      form.querySelectorAll(`input[name="${target.name}"]`).forEach((input) => input.removeAttribute('aria-invalid'));
      if (!steps[currentStep].querySelector('[aria-invalid]')) error.hidden = true;
    }
    updateProgress();
  });
  root.querySelector('[data-diagnosis-edit]')!.addEventListener('click', () => {
    resultsView.hidden = true;
    questionsView.hidden = false;
    showStep(0);
  });
  root.querySelector('[data-diagnosis-reset]')!.addEventListener('click', () => {
    form.reset();
    resultsView.hidden = true;
    questionsView.hidden = false;
    showStep(0);
  });
  root.querySelector<HTMLElement>('[data-diagnosis-progress]')!.hidden = false;
  root.querySelector<HTMLElement>('[data-diagnosis-navigation]')!.hidden = false;
  showStep(0, false);
}

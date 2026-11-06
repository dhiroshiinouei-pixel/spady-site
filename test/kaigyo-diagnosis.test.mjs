import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';

const source = readFileSync(new URL('../src/data/akindo/diagnosis.ts', import.meta.url), 'utf8');
const { diagnosisQuestions, isCompleteDiagnosis, getDiagnosisResult } = await import(
  `data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(source)).toString('base64')}`
);

const base = {
  business: 'salon', reservation: 'yes', payment: 'yes', online: 'no',
  staff: 'solo', line: 'yes', skill: 'guide', budget: 'small',
};
const recommendation = (result, id) => result.recommendations.find(item => item.id === id);

test('diagnosis rejects incomplete or unknown answers', () => {
  assert.equal(isCompleteDiagnosis(base), true);
  assert.equal(isCompleteDiagnosis({}), false);
  assert.equal(isCompleteDiagnosis({ ...base, budget: 'unknown' }), false);
  const incomplete = { ...base };
  delete incomplete.reservation;
  assert.equal(isCompleteDiagnosis(incomplete), false);
});

test('salon with appointments prioritises booking, in-person payments and local discovery', () => {
  const result = getDiagnosisResult(base);
  for (const id of ['accounting', 'booking', 'payment', 'google', 'line']) {
    assert.equal(recommendation(result, id)?.priority, 'first', id);
  }
  assert.equal(recommendation(result, 'shop'), undefined);
  assert.equal(recommendation(result, 'customer')?.priority, 'useful');
  assert.equal(recommendation(result, 'crm')?.priority, 'later');
});

test('online retailer is not sent to buy appointment or point-of-sale tools', () => {
  const result = getDiagnosisResult({
    ...base, business: 'online', reservation: 'no', payment: 'no',
    online: 'yes', line: 'no', staff: 'team',
  });
  assert.equal(recommendation(result, 'shop')?.priority, 'first');
  assert.equal(recommendation(result, 'website')?.priority, 'first');
  assert.equal(recommendation(result, 'customer')?.priority, 'first');
  assert.equal(recommendation(result, 'booking'), undefined);
  assert.match(recommendation(result, 'payment')?.title, /オンライン決済・請求/);
  assert.equal(recommendation(result, 'google')?.priority, 'useful');
  assert.match(recommendation(result, 'google')?.reason, /掲載対象外/);
  assert.equal(recommendation(result, 'line')?.priority, 'later');
});

test('uncertain plans prompt decisions before adopting tools', () => {
  const result = getDiagnosisResult({
    ...base, business: 'other', reservation: 'unsure', payment: 'unsure',
    online: 'later', line: 'unsure', staff: 'later', budget: 'undecided', skill: 'support',
  });
  assert.match(result.nextAction.title, /誰に、何を/);
  assert.equal(recommendation(result, 'booking')?.priority, 'useful');
  assert.equal(recommendation(result, 'shop')?.priority, 'later');
  assert.equal(recommendation(result, 'line')?.priority, 'useful');
  assert.match(recommendation(result, 'customer')?.reason, /スタッフを迎える前/);
  assert.match(result.guidance[0].description, /上限を決め/);
  assert.match(result.guidance[1].description, /必要な部分だけ相談/);
});

test('all eight answers influence recommendations or practical guidance', () => {
  const original = JSON.stringify(getDiagnosisResult(base));
  for (const question of diagnosisQuestions) {
    assert.ok(question.options.some(option =>
      JSON.stringify(getDiagnosisResult({ ...base, [question.id]: option.value })) !== original
    ), `${question.id} should influence the result`);
  }
});

test('all valid answer combinations produce complete, non-duplicated priority groups', () => {
  let checked = 0;
  function visit(index, answers) {
    if (index < diagnosisQuestions.length) {
      const question = diagnosisQuestions[index];
      for (const option of question.options) visit(index + 1, { ...answers, [question.id]: option.value });
      return;
    }
    assert.equal(isCompleteDiagnosis(answers), true);
    const result = getDiagnosisResult(answers);
    assert.equal(new Set(result.recommendations.map(item => item.id)).size, result.recommendations.length);
    for (const priority of ['first', 'useful', 'later']) {
      assert.ok(result.recommendations.some(item => item.priority === priority));
    }
    assert.ok(result.nextAction.title && result.nextAction.description);
    for (const item of result.recommendations) assert.ok(item.title && item.reason);
    for (const item of result.guidance) assert.ok(item.title && item.description);
    checked++;
  }
  visit(0, {});
  assert.equal(checked, 17496);
});

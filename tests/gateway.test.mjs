import test from 'node:test';
import assert from 'node:assert/strict';
import { handleRequest, category, routeModel, analyseCampaignCsv, PROVIDERS } from '../worker/gateway.mjs';

const assets = { html: '<h1>Workspace</h1>', css: 'body{}', js: 'console.log(1)' };
const base = 'https://example.chatgpt.site';
function request(path, { method = 'GET', body, headers = {} } = {}) {
  return new Request(base + path, { method, headers, ...(body ? { body: JSON.stringify(body) } : {}) });
}
function liveRequest(prompt, goal='balanced', headers={}) {
  return request('/api/run', { method:'POST', body:{ prompt, goal }, headers:{ 'content-type':'application/json', 'oai-authenticated-user-id':'test-user', origin:base, ...headers } });
}
const prompt = 'Please write a short launch announcement for our new B2B analytics service.';

test('serves embedded UI assets and returns 404 for unknown routes', async () => {
  assert.match(await (await handleRequest(request('/'), {}, assets)).text(), /Workspace/);
  assert.equal((await handleRequest(request('/styles.css'), {}, assets)).headers.get('content-type'), 'text/css; charset=utf-8');
  assert.equal((await handleRequest(request('/missing'), {}, assets)).status, 404);
});

test('demo-only status when the owner has not explicitly enabled API calls', async () => {
  const response = await handleRequest(request('/api/status'), { OPENAI_API_KEY: 'fake' }, assets);
  assert.deepEqual((await response.json()).providers, []);
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('status reveals only configured provider metadata, never secrets', async () => {
  const response = await handleRequest(request('/api/status'), { API_ENABLED:'true', OPENAI_API_KEY:'very-secret', GEMINI_API_KEY:'secret-two' }, assets);
  const text = await response.text();
  assert.doesNotMatch(text, /very-secret|secret-two/);
  assert.deepEqual(JSON.parse(text).providers.map(p=>p.id), ['gpt','gemini']);
});

test('rejects unauthenticated and cross-origin API calls', async () => {
  const env={ API_ENABLED:'true', OPENAI_API_KEY:'fake' };
  const anon=request('/api/run',{method:'POST',body:{prompt},headers:{'content-type':'application/json'}});
  assert.equal((await handleRequest(anon,env,assets)).status,401);
  assert.equal((await handleRequest(liveRequest(prompt,'balanced',{origin:'https://evil.invalid'}),env,assets)).status,403);
  assert.equal((await handleRequest(liveRequest(prompt,'balanced',{'content-type':'text/plain'}),env,assets)).status,415);
});

test('rejects short/oversized input and unavailable API', async () => {
  assert.equal((await handleRequest(liveRequest('too short'),{API_ENABLED:'true',OPENAI_API_KEY:'fake'},assets)).status,400);
  assert.equal((await handleRequest(liveRequest('x'.repeat(3001)),{API_ENABLED:'true',OPENAI_API_KEY:'fake'},assets)).status,400);
  assert.equal((await handleRequest(liveRequest(prompt),{},assets)).status,503);
});

test('routing is deterministic and goal-dependent', () => {
  assert.equal(category(prompt),'writing');
  assert.equal(category('Analyse the lead conversion metrics from last week.'),'analysis');
  assert.equal(routeModel(prompt,'balanced',PROVIDERS).best.provider.id,'claude');
  assert.equal(routeModel(prompt,'cost',PROVIDERS).best.provider.id,'deepseek');
});

test('OpenAI adapter sends a bounded chat request and records actual usage', async () => {
  let called=false;
  const fakeFetch=async (url, options)=>{
    called=true;assert.equal(url,'https://api.openai.com/v1/chat/completions');
    assert.equal(options.headers.authorization,'Bearer test-secret');
    const body=JSON.parse(options.body);
    assert.equal(body.max_completion_tokens,128);
    assert.equal(body.model,'gpt-4.1-mini');
    return new Response(JSON.stringify({choices:[{message:{content:'A real response from a mocked provider.'}}],usage:{prompt_tokens:124,completion_tokens:40}}),{status:200});
  };
  const env={API_ENABLED:'true',OPENAI_API_KEY:'test-secret',MAX_OUTPUT_TOKENS:'128',OPENAI_INPUT_USD_PER_M:'1',OPENAI_OUTPUT_USD_PER_M:'4'};
  const response=await handleRequest(liveRequest(prompt),env,assets,fakeFetch);
  assert.equal(response.status,200);assert.equal(called,true);
  const data=await response.json();
  assert.equal(data.providerId,'gpt');assert.equal(data.usage.inputTokens,124);assert.equal(data.usage.outputTokens,40);
  assert.equal(data.estimatedCostUsd,(124+40*4)/1_000_000);
  assert.doesNotMatch(JSON.stringify(data),/test-secret/);
});

test('Anthropic adapter normalises Messages text blocks and token counts', async () => {
  const fakeFetch=async (url,options)=>{
    assert.equal(url,'https://api.anthropic.com/v1/messages');
    assert.equal(options.headers['x-api-key'],'anthropic-test');
    const body=JSON.parse(options.body);assert.equal(body.max_tokens,512);
    return new Response(JSON.stringify({content:[{type:'text',text:'First'},{type:'text',text:'Second'}],usage:{input_tokens:88,output_tokens:20}}),{status:200});
  };
  const env={API_ENABLED:'true',ANTHROPIC_API_KEY:'anthropic-test'};
  const data=await (await handleRequest(liveRequest(prompt),env,assets,fakeFetch)).json();
  assert.equal(data.output,'First\nSecond');assert.deepEqual(data.usage,{inputTokens:88,outputTokens:20});
  assert.equal(data.estimatedCostUsd,null);
});

test('Gemini adapter handles generateContent usage metadata', async () => {
  const fakeFetch=async (url,options)=>{
    assert.match(url,/generativelanguage\.googleapis\.com\/v1beta\/models\/gemini-2\.5-flash:generateContent/);
    assert.equal(options.headers['x-goog-api-key'],'gemini-test');
    return new Response(JSON.stringify({candidates:[{content:{parts:[{text:'Gemini answer'}]}}],usageMetadata:{promptTokenCount:53,candidatesTokenCount:26}}),{status:200});
  };
  const data=await (await handleRequest(liveRequest(prompt),{API_ENABLED:'true',GEMINI_API_KEY:'gemini-test'},assets,fakeFetch)).json();
  assert.equal(data.providerId,'gemini');assert.equal(data.output,'Gemini answer');assert.equal(data.usage.outputTokens,26);
});

test('DeepSeek adapter uses Chat Completions with cost-first routing', async () => {
  const fakeFetch=async (url,options)=>{
    assert.equal(url,'https://api.deepseek.com/chat/completions');
    assert.equal(JSON.parse(options.body).max_tokens,512);
    return new Response(JSON.stringify({choices:[{message:{content:'Budget-friendly answer'}}],usage:{prompt_tokens:45,completion_tokens:35}}),{status:200});
  };
  const data=await (await handleRequest(liveRequest(prompt,'cost'),{API_ENABLED:'true',DEEPSEEK_API_KEY:'deepseek-test'},assets,fakeFetch)).json();
  assert.equal(data.providerId,'deepseek');assert.equal(data.usage.inputTokens,45);
});

test('pre-call cost guard blocks a request above the owner ceiling', async () => {
  let invoked=false;
  const env={API_ENABLED:'true',OPENAI_API_KEY:'x',OPENAI_INPUT_USD_PER_M:'900',OPENAI_OUTPUT_USD_PER_M:'900',MAX_REQUEST_ESTIMATED_USD:'0.01'};
  const response=await handleRequest(liveRequest(prompt),env,assets,async()=>{invoked=true;throw Error('must not run');});
  assert.equal(response.status,422);assert.equal(invoked,false);
});

test('upstream failure is reported without exposing credentials', async () => {
  const response=await handleRequest(liveRequest(prompt),{API_ENABLED:'true',OPENAI_API_KEY:'private-secret'},assets,async()=>new Response('Unauthorized',{status:401}));
  assert.equal(response.status,502);assert.doesNotMatch(await response.text(),/private-secret|Unauthorized/);
});

const campaignCsv='Channel,Spend,Clicks,Leads,Revenue\nSearch,1200,800,40,4500\nSocial,900,1200,18,1900\nEmail,200,400,32,2800\nReferrals,100,180,24,3600\n';
function postNew(path, payload, headers = {}) {
  return request(path, { method: 'POST', body: payload, headers: { 'content-type': 'application/json', 'oai-authenticated-user-id': 'test-user', origin: base, ...headers } });
}

test('campaign calculator uses exact numeric source rows, including quoted data', () => {
  const result = analyseCampaignCsv(campaignCsv);
  assert.equal(result.rowsRead, 4);
  assert.equal(result.total.spend, 2400);
  assert.equal(result.total.leads, 114);
  assert.equal(result.total.cpl, 21.05);
  assert.equal(result.channels.find(c => c.channel === 'Social').cpl, 50);
  const quoted = analyseCampaignCsv('Channel,Spend,Leads\n"Search, Brand",100,1\n');
  assert.equal(quoted.channels[0].channel, 'Search, Brand');
  assert.equal(quoted.total.leads, 1);
});

test('Agent demo parses a CSV and exports a structured plan without billing', async () => {
  const response = await handleRequest(postNew('/api/agent', { mode: 'demo', prompt: 'Analyse this campaign and make a weekly plan.', filename: 'campaign.csv', fileText: campaignCsv }), {}, assets);
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.mode, 'demo');
  assert.equal(data.report.analysis.total.leads, 114);
  assert.equal(data.steps[0].tool, 'read_file');
  assert.equal(data.steps[1].tool, 'calculate_metrics');
  assert.equal(data.steps.at(-1).tool, 'export_report');
  assert.equal(data.usage, null);
  assert.equal(data.estimatedCostUsd, null);
});

test('AI Audit demo returns recommendations, lessons and ROI checkpoints without billing', async () => {
  const response = await handleRequest(postNew('/api/agent', { mode: 'demo', prompt: 'Run an AI Audit for our SME.' }), {}, assets);
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.report.title, 'AI Audit & Optimisation Brief');
  assert.equal(data.report.audit.potentialMonthlySaving, '£145');
  assert.equal(data.report.audit.lessons.length, 3);
  assert.equal(data.report.audit.checkpoints.length, 2);
  assert.equal(data.report.audit.scorecard.length, 4);
  assert.equal(data.report.audit.risks.length, 4);
  assert.equal(data.steps[0].tool, 'audit_inventory');
  assert.equal(data.steps[3].tool, 'track_controls');
  assert.equal(data.usage, null);
});

test('Ask demo accepts multi-turn messages and clearly labels fixed output', async () => {
  const response = await handleRequest(postNew('/api/chat', { mode: 'demo', messages: [{role:'user',content:'Suggest a marketing plan.'},{role:'assistant',content:'Example response'},{role:'user',content:'Can you simplify that?'}] }), {}, assets);
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.match(data.output, /fixed generic example/);
  assert.match(data.output, /No provider was called/);
  assert.equal(data.usage, null);
});

test('local Demo requests work without hosted sign-in', async () => {
  const response = await handleRequest(new Request('http://127.0.0.1:8787/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mode: 'demo', messages: [{ role: 'user', content: 'Hello locally' }] })
  }), {}, assets);
  assert.equal(response.status, 200);
  assert.match((await response.json()).output, /No provider was called/);
});

test('new endpoints reject missing identity, invalid origins and unsupported files', async () => {
  const unauth = request('/api/chat', {method:'POST',body:{mode:'demo',messages:[{role:'user',content:'Hello'}]},headers:{'content-type':'application/json'}});
  assert.equal((await handleRequest(unauth,{},assets)).status,401);
  assert.equal((await handleRequest(postNew('/api/chat',{mode:'demo',messages:[{role:'user',content:'Hello'}]},{origin:'https://other.invalid'}),{},assets)).status,403);
  assert.equal((await handleRequest(postNew('/api/agent',{mode:'demo',prompt:'Analyse',filename:'unsafe.exe',fileText:'hello'}),{},assets)).status,415);
  assert.equal((await handleRequest(postNew('/api/agent',{mode:'demo',prompt:'Analyse',filename:'large.csv',fileText:'x'.repeat(80001)}),{},assets)).status,413);
});

test('Live Agent calls a configured provider and preserves true token usage', async () => {
  const env={API_ENABLED:'true',OPENAI_API_KEY:'private',OPENAI_INPUT_USD_PER_M:'1',OPENAI_OUTPUT_USD_PER_M:'2'};
  const fakeFetch=async(url,options)=>{
    assert.match(url,/api\.openai\.com/);
    const parsed=JSON.parse(options.body);
    assert.match(parsed.messages.at(-1).content,/"leads":114/);
    return new Response(JSON.stringify({choices:[{message:{content:'Review channel quality before shifting budget.'}}],usage:{prompt_tokens:120,completion_tokens:35}}),{status:200});
  };
  const response=await handleRequest(postNew('/api/agent',{mode:'live',prompt:'Review these marketing campaign numbers.',filename:'campaign.csv',fileText:campaignCsv,providerId:'gpt'}),env,assets,fakeFetch);
  assert.equal(response.status,200);
  const data=await response.json();
  assert.equal(data.usage.inputTokens,120);
  assert.equal(data.report.analysis.total.spend,2400);
  assert.match(data.report.aiAdvice,/Review channel quality/);
  assert.equal(data.estimatedCostUsd,(120+2*35)/1_000_000);
  assert.doesNotMatch(JSON.stringify(data),/private/);
});

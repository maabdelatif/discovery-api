const fs = require('fs');
const { Agent, fetch } = require('undici');

// mutual TLS for the Solr connection
const dispatcher = new Agent({
  connect: {
    key: fs.readFileSync('/etc/pki/tls/private/client.key'),
    cert: fs.readFileSync('/etc/pki/tls/certs/client.crt'),
    ca: fs.readFileSync('/etc/pki/cosmos/current/client.crt'),
  }
});

const host = process.env.SOLR_HOST || '127.0.0.1';
const port = process.env.SOLR_PORT || '8983';
const path = process.env.SOLR_PATH || '/solr';
const core = process.env.SOLR_CORE || '';
const selectUrl = `https://${host}:${port}${path}/${core}/select`;

// escape Lucene query syntax so user input is matched literally
function escapeSolr(value) {
  return String(value).replace(/[+\-!(){}[\]^"~*?:\\/&|\s]/g, '\\$&');
}

async function search({ q, fq }) {
  const params = new URLSearchParams({ q, start: 0, rows: 10, wt: 'json' });
  if (fq) {
    params.append('fq', fq);
  }
  const response = await fetch(`${selectUrl}?${params}`, { dispatcher });
  if (!response.ok) {
    throw new Error(`Solr request failed: ${response.status} ${await response.text()}`);
  }
  const result = await response.json();
  return result.response.docs;
}

function toArticle({ uri, title, synopsis, contributors }) {
  return { uri, title, synopsis, contributors };
}

async function getArticles(searchString) {
  const documents = await search({ q: searchString });
  return documents.map(toArticle);
}

async function getContributors(uri) {
  const documents = await search({ q: uri });
  return documents.map(({ contributors }) => ({ contributors }));
}

async function getArticlesByContributors(names) {
  const documents = await search({ q: '*:*', fq: `contributors:${escapeSolr(names)}` });
  return documents.map(toArticle);
}

async function getArticlesByUri(uri) {
  const documents = await search({ q: '*:*', fq: `uri:${escapeSolr(uri)}` });
  return documents.map(toArticle);
}

module.exports = {
  getArticles,
  getContributors,
  getArticlesByUri,
  getArticlesByContributors
};

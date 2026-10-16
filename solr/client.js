const solr = require('solr-client');
const fs = require('fs');

const tlsOptions = {
  key: fs.readFileSync('/etc/pki/tls/private/client.key'),
  cert: fs.readFileSync('/etc/pki/tls/certs/client.crt'),
  ca: fs.readFileSync('/etc/pki/cosmos/current/client.crt'),
};

const solrOptions = {
  host: process.env.SOLR_HOST,
  port: process.env.SOLR_PORT,
  core: process.env.SOLR_CORE,
  path: process.env.SOLR_PATH,
  secure: true,
  tls: tlsOptions
};

const client = solr.createClient(solrOptions);

async function getArticles(searchString) {
  var query = client.query()
    .q(searchString)
    .start(0)
    .rows(10);
  const result = await client.search(query);
  const documents = result.response.docs;
  const results = documents.map(({ uri, title, synopsis, contributors }) => ({ uri, title, synopsis, contributors }));
  console.log(results);
  return results;
}

async function getContributors(uri) {
  var query = client.query()
    .q(uri)
    .start(0)
    .rows(10);
  const result = await client.search(query);
  const documents = result.response.docs;
  const results = documents.map(({ contributors }) => ({ contributors }));

  console.log(results);
  return results;
}

async function getArticlesByContributors(names) {
  var query = client.query()
    .q("*:*")
    .set(`fq=contributors:${names}`)
    .start(0)
    .rows(10);
  console.log(query);
  const result = await client.search(query);
  const documents = result.response.docs;
  const results = documents.map(({ uri, title, synopsis, contributors }) => ({ uri, title, synopsis, contributors }));
  console.log(results);
  return results;
}

async function getArticlesByUri(uri) {
  var query = client.query()
    .q("*:*")
    .set(`fq=uri:${uri}`)
    .start(0)
    .rows(10);
  console.log(query);
  const result = await client.search(query);
  const documents = result.response.docs;
  const results = documents.map(({ uri, title, synopsis, contributors }) => ({ uri, title, synopsis, contributors }));
  console.log(results);
  return results;
}

module.exports = {
  getArticles,
  getContributors,
  getArticlesByUri,
  getArticlesByContributors
};



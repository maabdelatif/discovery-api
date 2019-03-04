const solr = require('solr-client');
const fs = require('fs');
const https = require('https');
const { promisify } = require('util');

const agentOptions = {
  key: fs.readFileSync('/etc/pki/tls/private/client.key'),
  cert: fs.readFileSync('/etc/pki/tls/certs/client.crt'),
  ca: fs.readFileSync('/etc/pki/cosmos/current/client.crt'),
};

const agent = new https.Agent(agentOptions);

const solrOptions = {
  host: 'search-solr-cluster.search-bastion.int.tools.bbc.co.uk',
  port: 443,
  core: 'bbc_en0',
  path: '/solr',
  secure: true,
  agent: agent
};

const client = solr.createClient(solrOptions);

async function getArticles(searchString) {
  var query = client.createQuery()
    .q(searchString)
    .start(0)
    .rows(10);
  const searchAsync = promisify(client.search.bind(client));
  const result = await searchAsync(query);
  const documents = result.response.docs;
  const results = documents.map(({ uri, title, synopsis, contributors }) => ({ uri, title, synopsis, contributors }));
  console.log(results);
  return results;
}

async function getContributors(uri) {
  var query = client.createQuery()
    .q(uri)
    .start(0)
    .rows(10);
  const searchAsync = promisify(client.search.bind(client));
  const result = await searchAsync(query);
  const documents = result.response.docs;
  const results = documents.map(({ contributors }) => ({ contributors }));

  console.log(results);
  return results;
}

async function getArticlesByContributors(names) {
  var query = client.createQuery()
    .q("*:*")
    .set(`fq=contributors:${names}`)
    .start(0)
    .rows(10);
  console.log(query);
  const searchAsync = promisify(client.search.bind(client));
  const result = await searchAsync(query);
  const documents = result.response.docs;
  const results = documents.map(({ uri, title, synopsis, contributors }) => ({ uri, title, synopsis, contributors }));
  console.log(results);
  return results;
}

async function getArticlesByUri(uri) {
  var query = client.createQuery()
    .q("*:*")
    .set(`fq=uri:${uri}`)
    .start(0)
    .rows(10);
  console.log(query);
  const searchAsync = promisify(client.search.bind(client));
  const result = await searchAsync(query);
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



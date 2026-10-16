const express = require('express');
const { createHandler } = require('graphql-http/lib/use/express');
const schema = require('./schema/schema');

const app = express();

// GraphiQL IDE (replaces express-graphql's `graphiql: true`)
const graphiqlHTML = `<!doctype html>
<html>
  <head>
    <title>GraphiQL</title>
    <style>body { margin: 0; height: 100vh; } #graphiql { height: 100vh; }</style>
    <link rel="stylesheet" href="https://unpkg.com/graphiql@3.8.3/graphiql.min.css" />
  </head>
  <body>
    <div id="graphiql"></div>
    <script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/graphiql@3.8.3/graphiql.min.js"></script>
    <script>
      const fetcher = GraphiQL.createFetcher({ url: '/graphql' });
      ReactDOM.createRoot(document.getElementById('graphiql'))
        .render(React.createElement(GraphiQL, { fetcher }));
    </script>
  </body>
</html>`;

app.get('/graphql', (req, res, next) => {
  if (req.accepts(['application/graphql-response+json', 'application/json', 'html']) === 'html') {
    return res.type('html').send(graphiqlHTML);
  }
  next();
});

// bind express with graphql
app.all('/graphql', createHandler({ schema }));

app.listen(4000, () => {
  console.log('now listening for requests on port 4000');
});

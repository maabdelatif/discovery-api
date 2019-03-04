const graphql = require('graphql');
const resolver = require('./../solr/client');

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
} = graphql;

const ArticleType = new GraphQLObjectType({
  name: 'Article',
  fields: () => ({
    uri: { type: GraphQLID },
    title: { type: GraphQLString },
    synopsis: { type: GraphQLString },
    contributors: { type: GraphQLList(GraphQLString) }
  })
});

const ContributorType = new GraphQLObjectType({
  name: 'Contributor',
  fields: () => ({
    name: { type: GraphQLString }/*,
    args: {
      uri: { type: GraphQLID },
      name: { type: GraphQLString }
    },
    async resolve(parent, args) {
      const response = await resolver.getContributors(parent.uri);
      return response;
    }*/
  })
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    articles: {
      type: GraphQLList(ArticleType),
      args: {
        uri: { type: GraphQLID },
        title: { type: GraphQLString },
        contributors: { type: GraphQLString }
      },
      async resolve(parent, args) {
        if (args.title) {
          return await resolver.getArticles(args.title);
        }
        if (args.uri) {
          return await resolver.getArticlesByUri(args.uri);
        }
        if (args.contributors) {
          return await resolver.getArticlesByContributors(args.contributors);
        }
      }
    },
    contributors: {
      type: GraphQLList(ContributorType),
      args: {
        uri: { type: GraphQLID },
      },
      async resolve(parent, args) {
        const response = await resolver.getContributors(args.uri);
        return response;
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery
});
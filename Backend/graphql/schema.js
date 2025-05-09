const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInputObjectType,
  } = require('graphql');
   
  // User Output Type
  const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
      id: { type: GraphQLString },
      First_Name: { type: GraphQLString },
      Last_Name: { type: GraphQLString },
      Email: { type: GraphQLString },
      user_image: { type: GraphQLString },
      Facebook: { type: GraphQLString },
      Twitter: { type: GraphQLString },
      Website: { type: GraphQLString },
      Public_email: { type: GraphQLString },
      Phone: { type: GraphQLString },
      FAX: { type: GraphQLString },
    }),
  });
   
  // User Input Type
  const UserProfileInputType = new GraphQLInputObjectType({
    name: 'UserProfileInput',
    fields: {
      First_Name: { type: GraphQLString },
      Last_Name: { type: GraphQLString },
      Email: { type: GraphQLString },
      user_image: { type: GraphQLString },
      Facebook: { type: GraphQLString },
      Twitter: { type: GraphQLString },
      Website: { type: GraphQLString },
      Public_email: { type: GraphQLString },
      Phone: { type: GraphQLString },
      FAX: { type: GraphQLString },
    },
  });
   
  module.exports = { UserType, UserProfileInputType };
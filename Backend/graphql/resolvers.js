const {
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLSchema,
  } = require('graphql');
  const mongoose = require('mongoose');
   
  const { UserType, UserProfileInputType } = require('../graphql/schema');
  const User = require('../models/user');
   
  // Query
  const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      getUserProfile: {
        type: UserType,
        resolve: async (_, __, { req }) => {
          if (!req.session?.userId) throw new Error('Not authenticated');
          const user = await User.findById(req.session.userId);
          return user;
        },
      },
    },
  });
   
  // Mutation
  const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      updateUserProfile: {
        type: UserType,
        args: {
          data: { type: new GraphQLNonNull(UserProfileInputType) },
        },
        resolve: async (_, { data }, { req }) => {
          try {
            if (!req.session?.userId) {
              throw new Error('Not authenticated');
            }
        
            console.log('Session User ID:', req.session.userId);
            console.log('Update data received:', data);
        
            const updatedUser = await User.findByIdAndUpdate(
              req.session.userId,
              data,
              { new: true, runValidators: true }  // Ensure validators are run
            );
        
            if (!updatedUser) {
              throw new Error('User not found');
            }
        
            console.log('Updated user:', updatedUser);
            return updatedUser;
          } catch (error) {
            console.error('Update error:', error);  // Detailed error logging
            throw new Error(error.message);  // Propagate original error message
          }
        },
        
      },
    },
  });
   
  module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation,
  });
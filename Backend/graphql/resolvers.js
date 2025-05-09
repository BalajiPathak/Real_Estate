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
              if (!req.session?.userId) throw new Error('Not authenticated');
           
              const updatedUser = await User.findByIdAndUpdate(
                req.session.userId,
                data,
                { new: true }
              );
           
              if (!updatedUser) throw new Error('User not found');
           
              return updatedUser;
            } catch (error) {
              console.error('Update error:', error);
              throw new Error('Failed to update profile');
            }
          },
      },
    },
  });
   
  module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation,
  });
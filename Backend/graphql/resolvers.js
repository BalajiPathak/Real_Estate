const {
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLSchema,
    GraphQLList,
  } = require('graphql');
  const mongoose = require('mongoose');
   
  const { UserType, UserProfileInputType, PropertyType } = require('./schema');
  const User = require('../models/user');
  const Property = require('../models/propertyData');

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
      getUserProperties: {
        type: new GraphQLList(PropertyType),
        resolve: async (_, __, { req }) => {
          if (!req.session?.userId) throw new Error('Not authenticated');
          const properties = await Property.find({ userId: req.session.userId });
          return properties;
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
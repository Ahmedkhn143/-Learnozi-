const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');

const dbStore = {
  User: [
    {
      _id: new mongoose.Types.ObjectId(),
      name: 'Test User',
      email: 'test@learnozi.com',
      password: bcrypt.hashSync('password123', 12),
      isVerified: true,
      isOnboarded: true,
      academicProfile: {
        educationLevel: 'University',
        fieldOfStudy: 'Computer Science',
        currentYear: 'Semester 3',
        institution: 'Test University'
      },
      preferences: {
        studyHoursPerDay: 4,
        subjects: ['Computer Science', 'Programming']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
};

function getCollection(modelName) {
  if (!dbStore[modelName]) dbStore[modelName] = [];
  return dbStore[modelName];
}

function matchQuery(item, query) {
  if (!query) return true;
  for (let key in query) {
    let queryVal = query[key];
    let itemVal = item[key];
    
    if (queryVal && queryVal.constructor && queryVal.constructor.name === 'ObjectId') {
      queryVal = String(queryVal);
    }
    if (itemVal && itemVal.constructor && itemVal.constructor.name === 'ObjectId') {
      itemVal = String(itemVal);
    }

    if (queryVal && typeof queryVal === 'object' && !(queryVal instanceof Date)) {
      if (queryVal.$gt !== undefined) {
        if (!(itemVal > queryVal.$gt)) return false;
      } else if (queryVal.$lt !== undefined) {
        if (!(itemVal < queryVal.$lt)) return false;
      } else if (queryVal.$gte !== undefined) {
        if (!(itemVal >= queryVal.$gte)) return false;
      } else if (queryVal.$lte !== undefined) {
        if (!(itemVal <= queryVal.$lte)) return false;
      } else if (queryVal.$in !== undefined) {
        const inVals = queryVal.$in.map(v => (v && v.constructor && v.constructor.name === 'ObjectId') ? String(v) : v);
        if (!inVals.includes(itemVal)) return false;
      } else {
        if (JSON.stringify(itemVal) !== JSON.stringify(queryVal)) return false;
      }
    } else {
      if (itemVal !== queryVal) return false;
    }
  }
  return true;
}

class MockQuery {
  constructor(data, promise) {
    this.data = data;
    this.promise = promise || Promise.resolve(data);
  }
  select() { return this; }
  populate() { return this; }
  sort() { return this; }
  limit() { return this; }
  skip() { return this; }
  lean() { return this; }
  exec() { return this.promise; }
  then(onFulfilled, onRejected) {
    return this.promise.then(onFulfilled, onRejected);
  }
  catch(onRejected) {
    return this.promise.catch(onRejected);
  }
}

// Enable Mock Database
if (process.env.MOCK_DB === 'true') {
  console.log("\n⚡ Database Mocking (In-Memory) is ENABLED!");
  
  // Set connection readyState to 1 (connected) so mongoose doesn't buffer
  mongoose.connection.readyState = 1;
  const mockCollection = {
    createIndex: async () => {},
    createIndexes: async () => {},
    indexInformation: async () => ({}),
    find: () => ({ toArray: async () => [] }),
    findOne: async () => null,
    insertOne: async () => ({ insertedId: 'mock' }),
    insertMany: async () => ({ insertedIds: {} }),
    updateOne: async () => ({}),
    updateMany: async () => ({}),
    deleteOne: async () => ({}),
    deleteMany: async () => ({}),
    countDocuments: async () => 0,
    aggregate: () => ({ toArray: async () => [] }),
  };
  mongoose.connection.db = {
    admin: () => ({ ping: async () => true }),
    collection: () => mockCollection
  };
  
  mongoose.connection.host = 'in-memory-mock-db';
  
  // Override mongoose.connect
  mongoose.connect = async () => {
    console.log("✨ MOCK DB: Bypassed database connection successfully.");
    return mongoose;
  };

  const originalModel = mongoose.model;
  mongoose.model = function(name, schema) {
    const Model = originalModel.apply(this, arguments);
    const collectionName = name;
    
    // Override static methods
    Model.find = function(query) {
      const data = getCollection(collectionName).filter(item => matchQuery(item, query));
      return new MockQuery(data.map(d => new Model(d)));
    };
    
    Model.findOne = function(query) {
      const data = getCollection(collectionName).find(item => matchQuery(item, query));
      return new MockQuery(data ? new Model(data) : null);
    };
    
    Model.findById = function(id) {
      const data = getCollection(collectionName).find(item => String(item._id) === String(id));
      return new MockQuery(data ? new Model(data) : null);
    };
    
    Model.create = async function(doc) {
      const docs = Array.isArray(doc) ? doc : [doc];
      const created = [];
      for (const d of docs) {
        const item = { ...d };
        if (!item._id) {
          item._id = new mongoose.Types.ObjectId();
        }
        const modelInstance = new Model(item);
        await modelInstance.save({ mock: true });
        created.push(modelInstance);
      }
      return Array.isArray(doc) ? created : created[0];
    };
    
    Model.findByIdAndUpdate = function(id, update, options) {
      const collection = getCollection(collectionName);
      const index = collection.findIndex(item => String(item._id) === String(id));
      if (index === -1) return new MockQuery(null);
      
      const current = collection[index];
      const updated = { ...current, ...update };
      collection[index] = updated;
      return new MockQuery(new Model(updated));
    };

    Model.findOneAndUpdate = function(query, update, options) {
      const collection = getCollection(collectionName);
      const index = collection.findIndex(item => matchQuery(item, query));
      if (index === -1) return new MockQuery(null);
      
      const current = collection[index];
      const updated = { ...current, ...update };
      collection[index] = updated;
      return new MockQuery(new Model(updated));
    };
    
    Model.findByIdAndDelete = function(id) {
      const collection = getCollection(collectionName);
      const index = collection.findIndex(item => String(item._id) === String(id));
      if (index === -1) return new MockQuery(null);
      const deleted = collection.splice(index, 1)[0];
      return new MockQuery(new Model(deleted));
    };

    Model.findOneAndDelete = function(query) {
      const collection = getCollection(collectionName);
      const index = collection.findIndex(item => matchQuery(item, query));
      if (index === -1) return new MockQuery(null);
      const deleted = collection.splice(index, 1)[0];
      return new MockQuery(new Model(deleted));
    };
    
    Model.countDocuments = function(query) {
      const count = getCollection(collectionName).filter(item => matchQuery(item, query)).length;
      return new MockQuery(count);
    };

    // Override instance save method
    Model.prototype.save = async function(options) {
      const collection = getCollection(collectionName);
      
      if (collectionName === 'User') {
        this.isVerified = true;
      }

      if (!options || !options.mock) {
        if (collectionName === 'User' && this.isModified && this.isModified('password')) {
          const bcrypt = require('bcryptjs');
          this.password = await bcrypt.hash(this.password, 12);
        }
      }
      
      const obj = this.toObject ? this.toObject() : this;
      if (!obj._id) {
        obj._id = new mongoose.Types.ObjectId();
        this._id = obj._id;
      }
      
      const index = collection.findIndex(item => String(item._id) === String(obj._id));
      if (index !== -1) {
        collection[index] = obj;
      } else {
        collection.push(obj);
      }
      return this;
    };
    
    return Model;
  };
}

#!/usr/bin/env node

const { MongoClient } = require("mongodb");

class Database {
  static client = null;
  static db;
  constructor() {
    if (!Database.instance) {
      const connectionString = "mongodb://127.0.0.1:27017/events";

      this.client = new MongoClient(connectionString);
      Database.client = this;
    }

    return Database;
  }

  async connect() {
    if (!this.client) {
      throw Error("Attempt to connect without a client");
    } else {
      await this.client.connect();
      this.db = this.client.db("events");
    }
  }

  getCollection(collectionName, options) {
    if (!this.db) {
      throw Error("Attempt to get collection without db");
    } else {
      return this.db.collection(collectionName, options);
    }
  }
}

const dbInstance = new Database();
Object.freeze(dbInstance);

module.exports = dbInstance;

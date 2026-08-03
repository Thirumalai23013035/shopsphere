require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const localUri = 'mongodb://127.0.0.1:27017/expressDB';
const atlasUri = `mongodb://thirulord25_db_user:3sPLSNrJKs7faMeA@ac-l9dvjw8-shard-00-00.yjxzgpn.mongodb.net:27017,ac-l9dvjw8-shard-00-01.yjxzgpn.mongodb.net:27017,ac-l9dvjw8-shard-00-02.yjxzgpn.mongodb.net:27017/?ssl=true&replicaSet=atlas-dd1e7r-shard-0&authSource=admin&appName=Cluster00
`;

const modelFiles = [
  { file: 'Product', collection: 'products' },
  { file: 'User', collection: 'users' },
  { file: 'Order', collection: 'orders' },
  { file: 'Cart', collection: 'carts' },
  { file: 'Review', collection: 'reviews' },
  { file: 'Wishlist', collection: 'wishlists' }
];

async function connect(uri, name) {
  const conn = await mongoose.createConnection(uri, {
    serverSelectionTimeoutMS: 20000,
    retryWrites: true,
    w: 'majority'
  });
  console.log(`${name} connected`);
  return conn;
}

async function main() {
  if (!atlasUri) {
    throw new Error('MONGODB_URI is not set');
  }

  const localConn = await connect(localUri, 'Local');
  const atlasConn = await connect(atlasUri, 'Atlas');

  try {
    for (const { file, collection } of modelFiles) {
      const Model = require(path.join(__dirname, '..', 'models', `${file}.js`));
      const localModel = localConn.model(collection, Model.schema, collection);
      const atlasModel = atlasConn.model(collection, Model.schema, collection);
      const docs = await localModel.find({}).lean();
      if (docs.length) {
        await atlasModel.deleteMany({});
        await atlasModel.insertMany(docs);
        console.log(`Migrated ${docs.length} documents for ${collection}`);
      } else {
        console.log(`No documents found for ${collection}`);
      }
    }
  } finally {
    await localConn.close();
    await atlasConn.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
